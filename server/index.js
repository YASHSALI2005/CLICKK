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

// List files
app.get('/api/files', (req, res) => {
  try {
    if (!fs.existsSync(PROJECT_ROOT)) {
      fs.mkdirSync(PROJECT_ROOT, { recursive: true });
    }
    const files = listFilesRecursive(PROJECT_ROOT);
    res.json(files);
  } catch (err) {
    console.error('Error listing files:', err);
    res.status(500).send('Error listing files');
  }
});

// Read file
app.get('/api/file', (req, res) => {
  try {
    const filePath = path.join(PROJECT_ROOT, req.query.name);
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
    const filePath = path.join(PROJECT_ROOT, req.body.name);
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
    const filePath = path.join(PROJECT_ROOT, req.query.name);
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
    const { name } = req.body;
    const filePath = path.join(PROJECT_ROOT, name);
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

const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', function connection(ws) {
  // Create a unique temp dir for this session
  const sessionId = Date.now() + '-' + Math.random().toString(36).slice(2);
  const tempDir = path.join(__dirname, 'temp', 'terminal-' + sessionId);
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  // Use cmd.exe on Windows, bash otherwise
  const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: tempDir,
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
    // Clean up tempDir
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.error('Error cleaning up tempDir:', err);
    }
  });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000')); 