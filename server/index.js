process.on('uncaughtException', function (err) {
  if (err.code === 'EPIPE') {
    console.warn('Suppressed EPIPE error:', err.message);
  } else {
    console.error('Uncaught Exception:', err);
  }
});

process.on('unhandledRejection', function (reason, promise) {
  console.error('Unhandled Rejection:', reason);
});

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const WebSocket = require('ws');
const pty = require('node-pty');
const find = require('find-process');
require('dotenv').config();

// Import AI service
const aiService = require('./ai-service');

// Set your project root (where files are stored)
const PROJECT_ROOT = path.join(__dirname, 'projects', 'demo');

const app = express();
app.use(cors());
// Increase request body limits to avoid PayloadTooLargeError when sending large JSON payloads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// Serve static files from the React public directory (fallback)
app.use(express.static(path.join(__dirname, '../client/public')));

// Helper: Recursively list all files and folders in a directory
function listFilesRecursive(dir, prefix = '') {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    const relPath = prefix + entry.name + (entry.isDirectory() ? '/' : '');
    results.push(relPath);
    if (entry.isDirectory()) {
      results = results.concat(listFilesRecursive(fullPath, relPath));
    }
  }
  return results;
}

// Helper to get project root based on workspace param
function getProjectRoot(req) {
  const ws = req.query.workspace || req.body?.workspace;
  const projectsDir = path.join(__dirname, 'projects');
  return path.join(projectsDir, ws || 'demo');
}

// List files
app.get('/api/files', (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    if (!fs.existsSync(projectRoot)) {
      fs.mkdirSync(projectRoot, { recursive: true });
    }
    const files = listFilesRecursive(projectRoot);
    res.json(files);
  } catch (err) {
    console.error('Error listing files:', err);
    res.status(500).send('Error listing files');
  }
});

// Read file
app.get('/api/file', (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const filePath = path.join(projectRoot, req.query.name);
    if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) {
      return res.status(404).send('File not found');
    }
    const content = fs.readFileSync(filePath, 'utf8');
    res.json({ content });
  } catch (err) {
    console.error(`Error getting file ${req.query.name}:`, err);
    res.status(500).send('Error getting file');
  }
});

// Save file or create folder
app.post('/api/file', (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const filePath = path.join(projectRoot, req.body.name);
    if (req.body.name.endsWith('/')) {
      // Create folder
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }
      return res.sendStatus(200);
    }
    // Create or update file
    fs.writeFileSync(filePath, req.body.content || '');
    res.sendStatus(200);
  } catch (err) {
    console.error(`Error saving file/folder ${req.body.name}:`, err);
    res.status(500).send('Error saving file/folder');
  }
});

// Delete file or folder
app.delete('/api/file', (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const rawName = typeof req.query.name === 'string' ? req.query.name : '';
    const safeName = decodeURIComponent(rawName);
    const filePath = path.join(projectRoot, safeName);
    if (!fs.existsSync(filePath)) return res.sendStatus(200);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      try {
        fs.rmSync(filePath, { recursive: true, force: true });
      } catch (e) {
        // Fallback: handle Windows EPERM/EBUSY locks (e.g., node_modules) or deep trees
        try {
          if (process.platform === 'win32') {
            execSync(`cmd /c rmdir /s /q "${filePath}"`, { stdio: 'ignore' });
          } else {
            execSync(`rm -rf "${filePath}"`, { stdio: 'ignore' });
          }
        } catch (fallbackErr) {
          console.error('Fallback delete failed:', fallbackErr);
          throw fallbackErr;
        }
      }
    } else {
      fs.unlinkSync(filePath);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(`Error deleting file/folder ${req.query.name}:`, err);
    res.status(500).send('Error deleting file/folder');
  }
});

// Run file endpoint
app.post('/api/run', (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const { name } = req.body;
    const filePath = path.join(projectRoot, name);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }
    const content = fs.readFileSync(filePath, 'utf8');
    // Create a temporary file to execute
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const tempFilePath = path.join(tempDir, name);
    // Ensure the directory for the temp file exists
    const tempFileDir = path.dirname(tempFilePath);
    if (!fs.existsSync(tempFileDir)) {
      fs.mkdirSync(tempFileDir, { recursive: true });
    }
    fs.writeFileSync(tempFilePath, content);
    let output = '';
    if (name.endsWith('.js')) {
      exec(`node "${tempFilePath}"`, (err, stdout, stderr) => {
        if (err) output = stderr;
        else output = stdout;
        fs.unlinkSync(tempFilePath); // Clean up temp file
        res.json({ output });
      });
    } else if (name.endsWith('.py')) {
      exec(`python "${tempFilePath}"`, (err, stdout, stderr) => {
        if (err) output = stderr;
        else output = stdout;
        fs.unlinkSync(tempFilePath); // Clean up temp file
        res.json({ output });
      });
    } else {
      fs.unlinkSync(tempFilePath); // Clean up temp file
      res.json({ output: 'Unsupported file type for execution.' });
    }
  } catch (err) {
    console.error(`Error running file ${req.body.name}:`, err);
    res.status(500).send('Error running file');
  }
});

// Create demo project folder and file if not exist
if (!fs.existsSync(PROJECT_ROOT)) {
  fs.mkdirSync(PROJECT_ROOT, { recursive: true });
  fs.writeFileSync(path.join(PROJECT_ROOT, 'hello.js'), "console.log('Hello, world!');");
}

let liveServerProcess = null;

// Start Go Live server
app.post('/api/go-live', async (req, res) => {
  if (liveServerProcess) {
    return res.status(200).json({ running: true, message: 'Live server already running.' });
  }
  // Kill any process using port 5500
  try {
    const list = await find('port', 5500);
    for (const proc of list) {
      try {
        process.kill(proc.pid);
      } catch (e) {
        console.warn('Could not kill process on port 5500:', e);
      }
    }
  } catch (e) {
    console.warn('Error finding/killing process on port 5500:', e);
  }
  const httpServerPath = require.resolve('http-server/bin/http-server');
  liveServerProcess = exec(
    `node "${httpServerPath}" . -p 5500`,
    { cwd: PROJECT_ROOT },
    (err, stdout, stderr) => {
      if (err) {
        console.error('http-server error:', err);
      }
      liveServerProcess = null;
    }
  );
  return res.status(200).json({ running: true, message: 'HTTP server started.' });
});

// Stop Go Live server
app.post('/api/stop-live', (req, res) => {
  if (liveServerProcess) {
    liveServerProcess.kill();
    liveServerProcess = null;
    return res.status(200).json({ running: false, message: 'Live server stopped.' });
  }
  return res.status(200).json({ running: false, message: 'Live server was not running.' });
});

// Create a new workspace by copying the demo folder
app.post('/api/new-workspace', (req, res) => {
  try {
    const projectsDir = path.join(__dirname, 'projects');
    const baseName = 'demo';
    let n = 2;
    let newFolder = path.join(projectsDir, baseName + n);
    while (fs.existsSync(newFolder)) {
      n++;
      newFolder = path.join(projectsDir, baseName + n);
    }
    // Only create the new folder, do not copy contents
    fs.mkdirSync(newFolder, { recursive: true });
    // Add a default hello.js file
    fs.writeFileSync(path.join(newFolder, 'hello.js'), "console.log('Welcome to your new workspace!');");
    res.json({ folder: baseName + n });
  } catch (err) {
    console.error('Error creating new workspace:', err);
    res.status(500).json({ error: 'Failed to create new workspace.' });
  }
});

// -----------------------------
// Git integration endpoints
// -----------------------------

function runGitCommand(cwd, command) {
  return new Promise((resolve) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

app.get('/api/git/status', async (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const gitDir = path.join(projectRoot, '.git');
    const result = { initialized: false, branch: null, status: { staged: [], modified: [], untracked: [] } };
    if (!fs.existsSync(projectRoot)) fs.mkdirSync(projectRoot, { recursive: true });
    if (!fs.existsSync(gitDir)) {
      return res.json(result);
    }
    result.initialized = true;
    // Branch name
    const branchOut = await runGitCommand(projectRoot, 'git rev-parse --abbrev-ref HEAD');
    result.branch = (branchOut.stdout || '').trim() || null;
    const { stdout } = await runGitCommand(projectRoot, 'git status --porcelain');
    const lines = (stdout || '').split('\n').map(l => l.trim()).filter(Boolean);
    const staged = [];
    const modified = [];
    const untracked = [];
    for (const line of lines) {
      if (line.startsWith('?? ')) {
        untracked.push(line.slice(3));
        continue;
      }
      const indexStatus = line[0];
      const workTreeStatus = line[1];
      let filePath = line.slice(3);
      // Handle rename lines: R  old -> new
      if (filePath.includes(' -> ')) {
        filePath = filePath.split(' -> ').pop();
      }
      if (indexStatus && indexStatus !== ' ') {
        staged.push(filePath);
      } else if (workTreeStatus && workTreeStatus !== ' ') {
        modified.push(filePath);
      }
    }
    result.status = { staged, modified, untracked };
    res.json(result);
  } catch (err) {
    console.error('git status error:', err);
    res.status(500).json({ error: 'git status failed' });
  }
});

app.post('/api/git/init', async (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    if (!fs.existsSync(projectRoot)) fs.mkdirSync(projectRoot, { recursive: true });
    const { stdout, stderr, error } = await runGitCommand(projectRoot, 'git init');
    if (error) return res.status(500).json({ error: stderr || 'git init failed' });
    res.json({ success: true, output: stdout });
  } catch (err) {
    console.error('git init error:', err);
    res.status(500).json({ error: 'git init failed' });
  }
});

app.post('/api/git/add', async (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const { all, paths } = req.body || {};
    let cmd = 'git add ';
    if (all || !paths || paths.length === 0) {
      cmd += '-A';
    } else {
      const quoted = paths.map(p => `"${p}"`).join(' ');
      cmd += quoted;
    }
    const { stdout, stderr, error } = await runGitCommand(projectRoot, cmd);
    if (error) {
      const errText = String(stderr || '').toLowerCase();
      if (errText.includes('did not match any files')) {
        return res.json({ success: true, output: 'Nothing to add' });
      }
      return res.status(500).json({ error: stderr || 'git add failed' });
    }
    res.json({ success: true, output: stdout });
  } catch (err) {
    console.error('git add error:', err);
    res.status(500).json({ error: 'git add failed' });
  }
});

app.post('/api/git/reset', async (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const { all, paths } = req.body || {};
    let cmd = 'git reset ';
    if (all || !paths || paths.length === 0) {
      // Unstage all changes
      cmd += 'HEAD --';
    } else {
      const quoted = paths.map(p => `-- "${p}"`).join(' ');
      cmd += `HEAD ${quoted}`;
    }
    const { stdout, stderr, error } = await runGitCommand(projectRoot, cmd);
    if (error) return res.status(500).json({ error: stderr || 'git reset failed' });
    res.json({ success: true, output: stdout });
  } catch (err) {
    console.error('git reset error:', err);
    res.status(500).json({ error: 'git reset failed' });
  }
});

app.post('/api/git/commit', async (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const { message, authorName, authorEmail } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Commit message is required' });
    }
    // Set local user if provided, otherwise ensure some identity to prevent failure
    if (authorName && authorEmail) {
      await runGitCommand(projectRoot, `git config user.name "${authorName}"`);
      await runGitCommand(projectRoot, `git config user.email "${authorEmail}"`);
    }
    // Commit (avoid gpg interference)
    const { stdout, stderr, error } = await runGitCommand(projectRoot, `git commit -m "${message.replace(/"/g, '\\"')}" --no-gpg-sign`);
    if (error) return res.status(500).json({ error: stderr || 'git commit failed' });
    res.json({ success: true, output: stdout });
  } catch (err) {
    console.error('git commit error:', err);
    res.status(500).json({ error: 'git commit failed' });
  }
});

app.get('/api/git/log', async (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const { stdout, stderr, error } = await runGitCommand(projectRoot, `git log -n ${limit} --pretty=format:%H%x09%an%x09%ae%x09%ad%x09%s`);
    if (error) return res.status(500).json({ error: stderr || 'git log failed' });
    const commits = (stdout || '').split('\n').filter(Boolean).map(line => {
      const [hash, author, email, date, ...rest] = line.split('\t');
      return { hash, author, email, date, message: rest.join('\t') };
    });
    res.json({ commits });
  } catch (err) {
    console.error('git log error:', err);
    res.status(500).json({ error: 'git log failed' });
  }
});

// Branch helpers
app.get('/api/git/branch', async (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const { stdout, stderr, error } = await runGitCommand(projectRoot, 'git rev-parse --abbrev-ref HEAD');
    if (error) return res.status(500).json({ error: stderr || 'git branch failed' });
    res.json({ branch: (stdout || '').trim() });
  } catch (err) {
    console.error('git branch error:', err);
    res.status(500).json({ error: 'git branch failed' });
  }
});

// Remote helpers
app.get('/api/git/remote', async (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const { stdout } = await runGitCommand(projectRoot, 'git remote -v');
    res.json({ remotes: (stdout || '').split('\n').filter(Boolean) });
  } catch (err) {
    console.error('git remote get error:', err);
    res.status(500).json({ error: 'git remote failed' });
  }
});

app.post('/api/git/remote', async (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const { name = 'origin', url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'remote url required' });
    // Try set-url, if fails add
    let r = await runGitCommand(projectRoot, `git remote set-url ${name} "${url}"`);
    if (r.error) {
      r = await runGitCommand(projectRoot, `git remote add ${name} "${url}"`);
      if (r.error) return res.status(500).json({ error: r.stderr || 'git remote add failed' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('git remote set error:', err);
    res.status(500).json({ error: 'git remote set failed' });
  }
});

// Push
app.post('/api/git/push', async (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const { remote = 'origin', branch } = req.body || {};
    const currentBranch = branch || (await runGitCommand(projectRoot, 'git rev-parse --abbrev-ref HEAD')).stdout.trim();
    const { stdout, stderr, error } = await runGitCommand(projectRoot, `git push ${remote} ${currentBranch}`);
    if (error) return res.status(500).json({ error: stderr || 'git push failed' });
    res.json({ success: true, output: stdout });
  } catch (err) {
    console.error('git push error:', err);
    res.status(500).json({ error: 'git push failed' });
  }
});

// Discard changes to file
app.post('/api/git/discard', async (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const { path: filePath } = req.body || {};
    if (!filePath) return res.status(400).json({ error: 'path required' });
    const { stdout, stderr, error } = await runGitCommand(projectRoot, `git checkout -- "${filePath}"`);
    if (error) return res.status(500).json({ error: stderr || 'git discard failed' });
    res.json({ success: true, output: stdout });
  } catch (err) {
    console.error('git discard error:', err);
    res.status(500).json({ error: 'git discard failed' });
  }
});

// Clean untracked (careful!)
app.post('/api/git/clean', async (req, res) => {
  try {
    const projectRoot = getProjectRoot(req);
    const { path: targetPath } = req.body || {};
    const cmd = targetPath ? `git clean -fd -- "${targetPath}"` : 'git clean -fd';
    const { stdout, stderr, error } = await runGitCommand(projectRoot, cmd);
    if (error) return res.status(500).json({ error: stderr || 'git clean failed' });
    res.json({ success: true, output: stdout });
  } catch (err) {
    console.error('git clean error:', err);
    res.status(500).json({ error: 'git clean failed' });
  }
});

// const wss = new WebSocket.Server({ port: 8081 });

// wss.on('connection', function connection(ws) {
//   // Use cmd.exe on Windows, bash otherwise
//   const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';
//   const ptyProcess = pty.spawn(shell, [], {
//     name: 'xterm-color',
//     cols: 80,
//     rows: 30,
//     cwd: PROJECT_ROOT, // Start terminal in the project root
//     env: process.env,
//   });

//   // Send shell output to client
//   ptyProcess.on('data', function(data) {
//     ws.send(data);
//   });

//   // Error handler to prevent crash on EPIPE
//   ptyProcess.on('error', (err) => {
//     console.error('PTY error:', err);
//   });

//   // Receive input from client
//   ws.on('message', function incoming(message) {
//     ptyProcess.write(message);
//   });

//   ws.on('close', () => {
//     ptyProcess.kill();
//     // No tempDir to clean up
//   });
// });
// server.js
const { spawn } = require('child_process');

const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', function connection(ws, req) {
  const url = require('url');
  const query = url.parse(req.url, true).query;
  const workspace = query.workspace || 'demo';
  const cwd = path.join(__dirname, 'projects', workspace);

  // Ensure workspace directory exists
  if (!fs.existsSync(cwd)) fs.mkdirSync(cwd, { recursive: true });

  // Use cmd.exe on Windows, bash otherwise
  const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd,
    env: process.env,
  });

  // Send shell output to client
  ptyProcess.on('data', function(data) {
    ws.send(data);
  });

  // Error handler to prevent crash on EPIPE
  ptyProcess.on('error', (err) => {
    console.error('PTY error:', err);
  });

  // Receive input from client
  ws.on('message', function incoming(message) {
    ptyProcess.write(message);
  });

  ws.on('close', () => {
    ptyProcess.kill();
  });
});

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    let { message, agent, context } = req.body;
    context = context || {};

    // Enhancement: Detect if editing CSS file, add HTML as context
    const cssTarget = context.currentFile && context.currentFile.endsWith('.css');
    if (cssTarget) {
      const cssPath = context.currentFile;
      // Look for index.html in the same directory
      const projectRoot = getProjectRoot(req);
      const htmlPath = path.join(path.dirname(path.join(projectRoot, cssPath)), 'index.html');
      if (fs.existsSync(htmlPath)) {
        try {
          context.htmlCode = fs.readFileSync(htmlPath, 'utf8');
        } catch (e) {
          // ignore if unreadable
        }
      }
    }
    
    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    const result = await aiService.processMessage(message, agent || 'auto', context);
    
    // Automatically apply code changes if present
    if (result.success && result.codeChanges && result.codeChanges.length > 0) {
      const projectRoot = getProjectRoot(req);
      
      // Process each code change, supporting nested changes embedded as JSON strings
      let appliedAny = false;
      const queue = Array.isArray(result.codeChanges) ? [...result.codeChanges] : [];
      while (queue.length) {
        const change = queue.shift();
        if (change.type === 'modify' || change.type === 'create') {
          if (!change.file) {
            console.warn('Skipping change without file path:', change);
            continue;
          }
          // Resolve target path relative to current file when only a basename is provided
          const ctx = context || {};
          const contextFile = typeof ctx.currentFile === 'string' && ctx.currentFile.trim() ? ctx.currentFile.trim() : (typeof ctx.currentPath === 'string' ? ctx.currentPath.trim() : '');
          let unsafePath = change.file;
          if (!/[\\/]/.test(unsafePath) && contextFile) {
            const baseDir = path.dirname(contextFile);
            unsafePath = path.join(baseDir, unsafePath);
          }
          // Normalize and sandbox path inside projectRoot
          const normalizedRel = path.normalize(unsafePath).replace(/^([A-Za-z]:\\|\\|\/)+/, '');
          const filePath = path.resolve(projectRoot, normalizedRel);
          if (!filePath.startsWith(path.resolve(projectRoot))) {
            console.warn('Skipping change outside project root:', change.file);
            continue;
          }
          // If newContent looks like a JSON array of code changes, parse and enqueue instead of writing wrapper file
          const content = typeof change.newContent === 'string' ? change.newContent.trim() : '';
          if (content.startsWith('[') && content.endsWith(']')) {
            try {
              const parsed = JSON.parse(content);
              const looksLikeChanges = Array.isArray(parsed) && parsed.every(it => it && typeof it === 'object' && typeof it.type === 'string' && typeof it.file === 'string');
              if (looksLikeChanges) {
                queue.push(...parsed);
                continue;
              }
            } catch (_) {
              // fall through and write as-is
            }
          }
          // Ensure directory exists for the file
          const fileDir = path.dirname(filePath);
          if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
          }
          // Clean up wrapper fences/backticks if present
          let toWrite = typeof change.newContent === 'string' ? change.newContent : '';
          if (toWrite.startsWith('```') && toWrite.trim().endsWith('```')) {
            const m = toWrite.match(/^```[a-zA-Z0-9_-]*\s*\n([\s\S]*?)\n```\s*$/);
            if (m) toWrite = m[1];
          }
          if (toWrite.startsWith('`') && toWrite.endsWith('`')) {
            toWrite = toWrite.slice(1, -1);
          }
          if (change.type === 'modify') {
            // Write the modified content to the file
            fs.writeFileSync(filePath, toWrite || '');
            console.log(`Modified file: ${change.file}`);
            appliedAny = true;
          } else {
            // Create the new file with the provided content
            fs.writeFileSync(filePath, toWrite || '');
            console.log(`Created file: ${change.file}`);
            appliedAny = true;
          }
        } else if (change.type === 'project_creation') {
          // Handled on client via execute-command; no file I/O here
          continue;
        }
      }
      
      // Add a flag only if we actually wrote files
      if (appliedAny) {
        result.changesApplied = true;
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Execute project creation command
app.post('/api/execute-command', (req, res) => {
  try {
    const { command, workspace } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    const projectRoot = workspace ? path.join(__dirname, 'projects', workspace) : PROJECT_ROOT;
    
    // Ensure the directory exists
    if (!fs.existsSync(projectRoot)) {
      fs.mkdirSync(projectRoot, { recursive: true });
    }
    
    console.log(`Executing command: ${command} in ${projectRoot}`);
    
    // Execute the command in the project directory
    const childProcess = exec(command, { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command execution error: ${error.message}`);
        return res.status(500).json({ 
          success: false, 
          error: error.message,
          stdout,
          stderr
        });
      }
      
      console.log(`Command executed successfully: ${stdout}`);
      res.json({ 
        success: true, 
        output: stdout,
        error: stderr
      });
    });
  } catch (error) {
    console.error('Command execution error:', error);
    res.status(500).json({ success: false, error: 'Command execution failed' });
  }
});

// AI Providers endpoint
app.get('/api/ai/providers', (req, res) => {
  try {
    const providers = aiService.getAvailableProviders();
    res.json({ providers });
  } catch (error) {
    console.error('AI providers error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(5001, () => console.log('Server running on http://localhost:5001'));
