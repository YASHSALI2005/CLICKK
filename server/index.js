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
const { exec } = require('child_process');
const WebSocket = require('ws');
const pty = require('node-pty');
const find = require('find-process');
require('dotenv').config();

// Set your project root (where files are stored)
const PROJECT_ROOT = path.join(__dirname, 'projects', 'demo');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
    const filePath = path.join(projectRoot, req.query.name);
    if (!fs.existsSync(filePath)) return res.sendStatus(200);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
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

wss.on('connection', function connection(ws) {
  // Use cmd.exe on Windows, bash otherwise
  const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: PROJECT_ROOT, // Start terminal in the project root
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

app.listen(5000, () => console.log('Server running on http://localhost:5000')); 