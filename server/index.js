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
const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});
const S3_BUCKET = process.env.AWS_S3_BUCKET;

// S3 upload helper
async function uploadFileToS3(key, content) {
  return s3.upload({
    Bucket: S3_BUCKET,
    Key: key,
    Body: content
  }).promise();
}

// S3 download helper
async function downloadFileFromS3(key) {
  const data = await s3.getObject({ Bucket: S3_BUCKET, Key: key }).promise();
  return data.Body.toString();
}

// S3 delete helper
async function deleteFileFromS3(key) {
  return s3.deleteObject({ Bucket: S3_BUCKET, Key: key }).promise();
}

async function listFilesFromS3() {
  try {
    const data = await s3.listObjectsV2({ Bucket: S3_BUCKET }).promise();
    return data.Contents.map(item => item.Key);
  } catch (err) {
    console.error('Error listing files from S3:', err);
    return [];
  }
}

// Helper: Recursively download all S3 files to a local directory, preserving folder structure
async function mirrorS3ToLocal(localDir) {
  const data = await s3.listObjectsV2({ Bucket: S3_BUCKET }).promise();
  for (const item of data.Contents) {
    const key = item.Key;
    // Skip 'folders' (S3 has zero-byte objects for folders sometimes)
    if (key.endsWith('/')) continue;
    const filePath = path.join(localDir, key);
    const fileDir = path.dirname(filePath);
    if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
    const fileData = await s3.getObject({ Bucket: S3_BUCKET, Key: key }).promise();
    const body = fileData.Body;
    console.log(`Writing S3 object ${key} (${body.length} bytes) to ${filePath}`);
    fs.writeFileSync(filePath, Buffer.isBuffer(body) ? body : Buffer.from(body));
  }
}

// Helper: Recursively upload all files in a local directory to S3, preserving folder structure
async function syncLocalToS3(localDir, prefix = '') {
  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(localDir, entry.name);
    const s3Key = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isDirectory()) {
      await syncLocalToS3(fullPath, s3Key);
    } else if (entry.isFile()) {
      const fileContent = fs.readFileSync(fullPath);
      await s3.upload({ Bucket: S3_BUCKET, Key: s3Key, Body: fileContent }).promise();
    }
  }
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Set your project root (where files are stored)
const PROJECT_ROOT = path.join(__dirname, 'projects', 'demo');

// List files
app.get('/api/files', async (req, res) => {
  const files = await listFilesFromS3();
  res.json(files);
});

// Read file
app.get('/api/file', async (req, res) => {
  try {
    const content = await downloadFileFromS3(req.query.name);
    res.json({ content });
  } catch (err) {
    console.error(`Error getting file ${req.query.name} from S3:`, err);
    res.status(500).send('Error getting file from S3');
  }
});

// Save file
app.post('/api/file', async (req, res) => {
  try {
    console.log('Received file save request:', req.body);
    if (typeof req.body.content === 'string') {
      console.log('Content length:', req.body.content.length);
    } else {
      console.log('Content is not a string:', typeof req.body.content);
    }
    await uploadFileToS3(req.body.name, req.body.content);
    res.sendStatus(200);
  } catch (err) {
    console.error(`Error saving file ${req.body.name} to S3:`, err);
    res.status(500).send('Error saving file to S3');
  }
});

// Delete file endpoint
app.delete('/api/file', async (req, res) => {
  try {
    await deleteFileFromS3(req.query.name);
    res.sendStatus(200);
  } catch (err) {
    console.error(`Error deleting file ${req.query.name} from S3:`, err);
    res.status(500).send('Error deleting file from S3');
  }
});

// Run file endpoint
app.post('/api/run', async (req, res) => {
  try {
    const { name } = req.body;
    const content = await downloadFileFromS3(name);
    
    // Create a temporary file to execute
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const tempFilePath = path.join(tempDir, name);
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

wss.on('connection', async function connection(ws) {
  // Create a unique temp dir for this session
  const sessionId = Date.now() + '-' + Math.random().toString(36).slice(2);
  const tempDir = path.join(__dirname, 'temp', 'terminal-' + sessionId);
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  // Mirror S3 to local temp dir
  try {
    await mirrorS3ToLocal(tempDir);
  } catch (err) {
    console.error('Error mirroring S3 to local temp dir:', err);
    ws.send('\r\nError syncing files from S3. Terminal may not work as expected.\r\n');
  }
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

  ws.on('close', async () => {
    ptyProcess.kill();
    // Sync tempDir back to S3
    try {
      await syncLocalToS3(tempDir);
    } catch (err) {
      console.error('Error syncing local temp dir to S3:', err);
    }
    // Clean up tempDir
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.error('Error cleaning up tempDir:', err);
    }
  });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000')); 