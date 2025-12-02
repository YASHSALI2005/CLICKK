import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';
import { Sandpack } from "@codesandbox/sandpack-react";
import './layout.css';
import TerminalPanel from './TerminalPanel';
import LandingPage from './LandingPage';
import { FileIcon, defaultStyles } from 'react-file-icon';
import Topbar from './components/Topbar';
import AIAssistant from './components/AIAssistant';
import { VscChevronRight, VscChevronDown, VscFolder, VscFolderOpened, VscFile, VscFileCode, VscFileMedia, VscFileSubmodule, VscFilePdf, VscFileZip } from 'react-icons/vsc';

// Configure Axios base URL so the client can talk to a separately hosted API (e.g. Render Web Service)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
if (API_BASE_URL) {
  axios.defaults.baseURL = API_BASE_URL;
}

  const SIDEBAR_ICONS = [
  {
    key: 'explorer',
    title: 'Explorer',
    svg: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="7" width="16" height="12" rx="2"/><path d="M4 7V5a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v2"/></svg>
    )
  },
  {
    key: 'search',
    title: 'Search',
    svg: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><line x1="17" y1="17" x2="22" y2="22"/></svg>
    )
  },
  {
    key: 'source',
    title: 'Source Control',
    svg: (
      <img src="/git.png  "alt="Settings" width="24" height="24" style={{ filter: 'invert(1)' }} />
    )
  },
  {
    key: 'terminal',
    title: 'Terminal',
    svg: (
      <img src="/terminal.png  "alt="Settings" width="24" height="24" style={{ filter: 'invert(1)' }} />
    )
  },
  {
    key: 'ai',
    title: 'AI Assistant',
    svg: (
      <img src="/ai.png  "alt="Settings" width="24" height="24" style={{ filter: 'invert(1)' }} />
    )
  },
  {
    key: 'extensions',
    title: 'Extensions',
    svg: (
      <img src="/extension.png  "alt="Settings" width="24" height="24" style={{ filter: 'invert(1)' }} />
    )
  },
     {
     key: 'settings',
     title: 'Settings',
     svg: (
       <img src="/gear.png  "alt="Settings" width="24" height="24" style={{ filter: 'invert(1)' }} />
     )
   }
];

const SETTINGS_MENU = [
  { label: 'Command Palette...', shortcut: 'Ctrl+Shift+P' },
  { type: 'separator' },
  { label: 'Settings', shortcut: 'Ctrl+,' },
  { label: 'Extensions', shortcut: 'Ctrl+Shift+X' },
  { label: 'Keyboard Shortcuts', shortcut: 'Ctrl+K Ctrl+S' },
  { label: 'User Snippets' },
  { label: 'Themes', submenu: true },
];

const getLanguage = (filename) => {
  if (!filename) return 'plaintext';
  const lower = String(filename).toLowerCase().trim();
  if (lower.endsWith('.js')) return 'javascript';
  if (lower.endsWith('.php')) return 'php';
  if (lower.endsWith('.jsx')) return 'React';
  if (lower.endsWith('.ts')) return 'typescript';
  if (lower.endsWith('.tsx')) return 'typescript';
  if (lower.endsWith('.html')) return 'html';
  if (lower.endsWith('.css')) return 'css';
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.java')) return 'java';
  return 'plaintext';
};

const getFileExtension = (filename) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

const getFileIcon = (filename) => {
  const ext = getFileExtension(filename);
  if (ext === 'js') return '/icons/file_type_js_official.svg';
  if (ext === 'py') return '/icons/file_type_python.svg';
  if (ext === 'html') return '/icons/file_type_html.svg';
  if (ext === 'css') return '/icons/file_type_css.svg';
  if (ext === 'php') return '/icons/file_type_php.svg';
  if (ext === 'jsx') return '/icons/file_type_reactjs.svg';
  if (ext === 'json') return '/icons/file_type_json.svg';
  if (ext === 'md') return '/icons/file_type_markdown.svg';
  if (ext === 'java') return '/icons/file_type_java.svg';
  if (ext === 'ts' || ext === 'tsx') return '/icons/file_type_tsconfig.svg';
  // fallback generic file icon
  return '/icons/folder_type_template.svg';
};

const getVscodeFileIcon = (filename) => {
  if (filename.toLowerCase() === '.gitignore') return <VscFile color="#d0021b" title=".gitignore file" />;
  const ext = filename.split('.').pop().toLowerCase().trim();
  // Language specific
  if (["py"].includes(ext)) return <VscFileCode color="#3572A5" title="Python file" />;
  if (["php"].includes(ext)) return <VscFileCode color="#777BB4" title="PHP file" />;   
  if (["java"].includes(ext)) return <VscFileCode color="#b07219" title="Java file" />;
  if (["dart"].includes(ext)) return <VscFileCode color="#0175C2" title="Dart file" />;
  if (["c"].includes(ext)) return <VscFileCode color="#00599C" title="C file" />;
  if (["cpp", "cc", "cxx", "hpp", "hh", "hxx"].includes(ext)) return <VscFileCode color="#00599C" title="C++ file" />;
  if (["h"].includes(ext)) return <VscFileCode color="#6e6e6e" title="C header file" />;
  // Web & scripts
  if (["js", "jsx", "ts", "tsx"].includes(ext)) return <VscFileCode color="#ffd700" title="JavaScript/TypeScript file" />;
  if (["html", "htm"].includes(ext)) return <VscFileCode color="#e34c26" title="HTML file" />;
  if (["css", "scss", "less"].includes(ext)) return <VscFileCode color="#563d7c" title="CSS/Style file" />;
  // Data and docs
  if (["json", "lock"].includes(ext)) return <VscFileSubmodule color="#7ee787" title="JSON/Data file" />;
  if (["md", "pdf"].includes(ext)) return <VscFilePdf color="#c678dd" title="Document file" />;
  // Media/archives
  if (["png", "jpg", "jpeg", "gif", "svg", "bmp", "webp"].includes(ext)) return <VscFileMedia color="#d38cff" title="Image file" />;
  if (["zip", "rar", "tar", "gz", "7z"].includes(ext)) return <VscFileZip color="#e57373" title="Archive file" />;
  return <VscFile title="File" />;
};

export default function App() {
  const [workspace, setWorkspace] = useState('demo');
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState('');
  const [code, setCode] = useState('');
  const [openTabs, setOpenTabs] = useState([]);
  const [activeSidebar, setActiveSidebar] = useState('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [runOutput, setRunOutput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [lastRunCode, setLastRunCode] = useState('');
  const [lastRunFile, setLastRunFile] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showMainApp, setShowMainApp] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !!params.get('workspace');
  });
  const [showTerminal, setShowTerminal] = useState(false);
  const [liveStatus, setLiveStatus] = useState({ running: false, message: '' });
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [commandIndex, setCommandIndex] = useState(0);
  const commandInputRef = useRef(null);
  const [showExtensionsPanel, setShowExtensionsPanel] = useState(false);
  const [showShortcutsPanel, setShowShortcutsPanel] = useState(false);
  const [showSnippetsPanel, setShowSnippetsPanel] = useState(false);
  const [showThemesPanel, setShowThemesPanel] = useState(false);
  const [openFolders, setOpenFolders] = useState({});
  const [folderMenu, setFolderMenu] = useState({ path: null, anchor: null });
  const [fileMenu, setFileMenu] = useState({ path: null, anchor: null });
  const [tabMenu, setTabMenu] = useState({ path: null, anchor: null });
  
  const [recentFiles, setRecentFiles] = useState([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [notification, setNotification] = useState('');
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [activeBottomTab, setActiveBottomTab] = useState('terminal');
  const terminalContainerRef = useRef(null);
  const isResizingRef = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [explorerWidth, setExplorerWidth] = useState(280);
  const explorerRef = useRef(null);
  const tabsContainerRef = useRef(null);
  const [terminals, setTerminals] = useState([]);
  const [activeTerminal, setActiveTerminal] = useState(null);
  const [isSplitView, setIsSplitView] = useState(false); // New state for split view
  const [autoSave, setAutoSave] = useState(true);
  const [isAIAssistantVisible, setIsAIAssistantVisible] = useState(true);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const terminalRefs = useRef(new Map());
  const editorRef = useRef(null);
  const [gitInitialized, setGitInitialized] = useState(false);
  const [gitStatus, setGitStatus] = useState({ staged: [], modified: [], untracked: [] });
  const [commitMessage, setCommitMessage] = useState('');
  const [gitBranch, setGitBranch] = useState(null);
  const [gitRemotes, setGitRemotes] = useState([]);
  const [showStagedSection, setShowStagedSection] = useState(true);
  const [showChangesSection, setShowChangesSection] = useState(true);
  
  const showNotification = (msg) => {
    try {
      setNotification(msg);
      setTimeout(() => setNotification(''), 2000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  const refreshFiles = async () => {
    try {
      const fileRes = await axios.get(`/api/files?workspace=${workspace}`);
      if (fileRes.data && Array.isArray(fileRes.data)) {
        setFiles(fileRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')));
      }
    } catch (e) {
      console.warn('Refresh files failed:', e);
    }
  };

  const handleRenameFile = async (fullPath, e) => {
    try {
      e.stopPropagation();
      if (!fullPath || typeof fullPath !== 'string' || fullPath.endsWith('/')) return;
      // Derive parent path and basename
      const lastSlash = fullPath.lastIndexOf('/');
      const parent = lastSlash >= 0 ? fullPath.slice(0, lastSlash + 1) : '';
      const base = lastSlash >= 0 ? fullPath.slice(lastSlash + 1) : fullPath;
      let newBase = prompt('Enter new file name:', base);
      if (!newBase) return;
      newBase = String(newBase).replace(/\\/g, '/').replace(/\//g, '').trim();
      if (!newBase) return;
      const newFullPath = parent + newBase;

      if (newFullPath === fullPath) { setFileMenu({ path: null, anchor: null }); return; }
      // Prevent overwriting existing file
      if (files.includes(newFullPath)) {
        alert('A file with this name already exists.');
        return;
      }

      // Read old content
      const fileRes = await axios.get(`/api/file?workspace=${workspace}&name=${encodeURIComponent(fullPath)}`);
      const content = (fileRes.data && typeof fileRes.data.content === 'string') ? fileRes.data.content : '';

      // Create new file with same content
      await axios.post(`/api/file?workspace=${workspace}`, { name: newFullPath, content });
      // Delete old file
      await axios.delete(`/api/file?workspace=${workspace}&name=${encodeURIComponent(fullPath)}`);

      // Refresh file list
      const listRes = await axios.get(`/api/files?workspace=${workspace}`);
      const filtered = Array.isArray(listRes.data) ? listRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')) : [];
      setFiles(filtered);

      // Update open tabs
      setOpenTabs(tabs => tabs.map(t => t === fullPath ? newFullPath : t));
      // Update current file if needed
      if (currentFile === fullPath) {
        setCurrentFile(newFullPath);
        // keep current editor code as-is
      }
      setFileMenu({ path: null, anchor: null });
      showNotification('File renamed');
    } catch (error) {
      console.error('Error renaming file:', error);
      showNotification('Failed to rename file');
    }
  };

  useEffect(() => {
    try {
      axios.get(`/api/files?workspace=${workspace}`)
        .then(fileRes => {
          if (fileRes.data && Array.isArray(fileRes.data)) {
            setFiles(fileRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')));
          } else {
            console.warn('Invalid files response:', fileRes.data);
            setFiles([]);
          }
        })
        .catch(error => {
          console.error('Failed to fetch files:', error);
          setFiles([]);
          showNotification('Failed to load files');
        });
    } catch (error) {
      console.error('Error in files effect:', error);
      setFiles([]);
    }
  }, [workspace]);

  const fetchGitStatus = async () => {
    try {
      const res = await axios.get(`/api/git/status?workspace=${workspace}`);
      setGitInitialized(!!res.data.initialized);
      if (res.data.status) setGitStatus(res.data.status);
      if (res.data.branch) setGitBranch(res.data.branch);
      try {
        const r = await axios.get(`/api/git/remote?workspace=${workspace}`);
        setGitRemotes(Array.isArray(r.data.remotes) ? r.data.remotes : []);
      } catch {}
    } catch (e) {
      console.error('git status failed', e);
    }
  };

  useEffect(() => {
    if (activeSidebar === 'source') {
      fetchGitStatus();
    }
  }, [activeSidebar, workspace]);

  const gitInit = async () => {
    try {
      await axios.post('/api/git/init', { workspace });
      showNotification('Initialized empty Git repository');
      fetchGitStatus();
    } catch (e) {
      showNotification('Git init failed');
    }
  };

  const gitAddPaths = async (paths) => {
    try {
      await axios.post('/api/git/add', { workspace, paths });
      fetchGitStatus();
    } catch (e) {
      showNotification('git add failed');
    }
  };

  const gitResetPaths = async (paths) => {
    try {
      await axios.post('/api/git/reset', { workspace, paths });
      fetchGitStatus();
    } catch (e) {
      showNotification('git reset failed');
    }
  };

  const gitAddAll = async () => { await gitAddPaths([]); };
  const gitResetAll = async () => { await gitResetPaths([]); };

  const gitCommit = async () => {
    if (!commitMessage.trim()) { showNotification('Enter a commit message'); return; }
    try {
      await axios.post('/api/git/commit', { workspace, message: commitMessage, authorName: 'Clickk', authorEmail: 'clickk@example.com' });
      setCommitMessage('');
      showNotification('Committed changes');
      fetchGitStatus();
    } catch (e) {
      showNotification('git commit failed');
    }
  };

  const gitPublish = async () => {
    try {
      const url = prompt('Enter remote URL to publish (e.g. https://github.com/user/repo.git):');
      if (!url) return;
      await axios.post('/api/git/remote', { workspace, url });
      await axios.post('/api/git/push', { workspace });
      showNotification('Published branch');
      fetchGitStatus();
    } catch (e) {
      showNotification('Publish failed');
    }
  };

  const gitPush = async () => {
    try {
      await axios.post('/api/git/push', { workspace });
      showNotification('Pushed successfully');
    } catch (e) {
      showNotification('Push failed');
    }
  };

  // Removed auto-opening of first file - user must manually open files

  const saveFile = () => {
    if (!currentFile || code === undefined) return;
    try {
      axios.post(`/api/file?workspace=${workspace}`, { name: currentFile, content: code || '' })
        .then(() => {
          showNotification('File saved');
        })
        .catch(error => {
          console.error('Save failed:', error);
          showNotification('Failed to save file');
        });
    } catch (error) {
      console.error('Save error:', error);
      showNotification('Failed to save file');
    }
  };

  useEffect(() => {
    if (!currentFile || !autoSave) return;
    const timeout = setTimeout(() => {
      try {
        saveFile();
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Don't crash the app, just log the error
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [code, currentFile, autoSave]);

  const openFile = name => {
    if (!name || typeof name !== 'string') {
      console.error('Invalid file name:', name);
      return;
    }
    
    try {
      // Save current file if it's different and has changes
      if (currentFile && code !== undefined && currentFile !== name) {
        saveFile();
      }
      
      // Set current file
      setCurrentFile(name);
      
      // Add to open tabs if not already there
      if (!openTabs.includes(name)) {
        setOpenTabs(prev => [...prev, name]);
      }
      
      // Load file content
      axios.get(`/api/file?workspace=${workspace}&name=${encodeURIComponent(name)}`)
        .then(fileRes => {
          if (fileRes.data && fileRes.data.content !== undefined) {
            setCode(fileRes.data.content);
          } else {
            setCode('');
            console.warn('File content is undefined:', fileRes.data);
          }
        })
        .catch(error => {
          console.error('Failed to open file:', error);
          setCode('');
          showNotification('Failed to open file');
        });
      
      setRunOutput('');
      setRecentFiles(prev => [name, ...prev.filter(f => f !== name)].slice(0, 10));
    } catch (error) {
      console.error('Error opening file:', error);
      showNotification('Error opening file');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const results = [];
    for (const file of files) {
      const fileRes = await axios.get(`/api/file?workspace=${workspace}&name=${encodeURIComponent(file)}`);
      const content = fileRes.data.content;
      if (content && content.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({ file, snippet: content.substr(content.toLowerCase().indexOf(searchQuery.toLowerCase()), 60) });
      }
    }
    setSearchResults(results);
  };

  const handleDeleteFile = async (name, e) => {
    try {
      e.stopPropagation();
      if (!window.confirm(`Delete file '${name}'?`)) return;
      
      await axios.delete(`/api/file?workspace=${workspace}&name=${encodeURIComponent(name)}`);
      setFiles(files.filter(f => f !== name));
      setOpenTabs(openTabs.filter(f => f !== name));
      
      if (currentFile === name) {
        setCurrentFile('');
        setCode('');
        setRunOutput('');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      showNotification('Failed to delete file');
    }
  };

  const handleAddFile = async (parentPath = '') => {
    try {
      if (typeof parentPath !== 'string') parentPath = '';
      let name = prompt('Enter new file name (e.g. myfile.js):');
      if (!name) return;
      
      name = String(name).replace(/\\/g, '/').replace(/\/+$/, '').replace(/\//g, '').trim();
      if (!name) return;
      
      const fullPath = parentPath ? String(parentPath) + name : name;
      if (fullPath.startsWith('[object Object]') || !fullPath) {
        alert('Invalid file name.');
        return;
      }
      
      await axios.post(`/api/file?workspace=${workspace}`, { name: fullPath, content: '' });
      
      const fileRes = await axios.get(`/api/files?workspace=${workspace}`);
      const filtered = fileRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]'));
      setFiles(filtered);
      setCurrentFile(fullPath);
      setOpenTabs(tabs => tabs.includes(fullPath) ? tabs : [...tabs, fullPath]);
      setCode('');
      setRunOutput('');
    } catch (error) {
      console.error('Error creating file:', error);
      showNotification('Failed to create file');
    }
  };

  const handleFileCreate = async (fileName, content) => {
    await axios.post(`/api/file?workspace=${workspace}`, { name: fileName, content });
    axios.get(`/api/files?workspace=${workspace}`).then(fileRes => {
      const filtered = fileRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]'));
      setFiles(filtered);
      setCurrentFile(fileName);
      setOpenTabs(tabs => tabs.includes(fileName) ? tabs : [...tabs, fileName]);
      setCode(content);
      setRunOutput('');
    });
  };

  const handleAddFolder = async (parentPath = '') => {
    try {
      if (typeof parentPath !== 'string') parentPath = '';
      let name = prompt('Enter new folder name:');
      if (!name) return;
      
      name = String(name).replace(/\\/g, '/').replace(/\/+$/, '').replace(/\//g, '').trim();
      if (!name) return;
      
      const folderPath = parentPath ? String(parentPath) + name + '/' : name + '/';
      if (folderPath.startsWith('[object Object]') || !folderPath) {
        alert('Invalid folder name.');
        return;
      }
      
      if (!parentPath && files.includes(name)) {
        alert('A file with this name already exists at the root. Please choose a different folder name.');
        return;
      }
      
      await axios.post(`/api/file?workspace=${workspace}`, { name: folderPath, content: '' });
      const folderRes = await axios.get(`/api/files?workspace=${workspace}`);
      setFiles(folderRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')));
    } catch (error) {
      console.error('Error creating folder:', error);
      showNotification('Failed to create folder');
    }
  };

  const handleDeleteFolder = async (name, e) => {
    try {
      e.stopPropagation();
      // Normalize to ensure trailing slash for folder semantics
      const folderWithSlash = name.endsWith('/') ? name : name + '/';
      if (!window.confirm(`Delete folder '${folderWithSlash.replace(/\/$/, '')}' and all its contents?`)) return;

      await axios.delete(`/api/file?workspace=${workspace}&name=${encodeURIComponent(folderWithSlash)}`);
      setFiles(files.filter(f => !f.startsWith(folderWithSlash)));
      setOpenTabs(openTabs.filter(f => !f.startsWith(folderWithSlash)));

      if (currentFile && currentFile.startsWith(folderWithSlash)) {
        setCurrentFile('');
        setCode('');
        setRunOutput('');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      showNotification('Failed to delete folder');
    }
  };

  const handleRenameFolder = async (fullPath, e) => {
    try {
      e.stopPropagation();
      if (!fullPath || typeof fullPath !== 'string') return;
      const normalized = fullPath.endsWith('/') ? fullPath.slice(0, -1) : fullPath;
      const lastSlash = normalized.lastIndexOf('/');
      const parent = lastSlash >= 0 ? normalized.slice(0, lastSlash + 1) : '';
      const base = lastSlash >= 0 ? normalized.slice(lastSlash + 1) : normalized;
      let newBase = prompt('Enter new folder name:', base);
      if (!newBase) return;
      newBase = String(newBase).replace(/\\/g, '/').replace(/\//g, '').trim();
      if (!newBase) return;
      const newFolderNoSlash = parent + newBase;
      const oldFolderWithSlash = normalized + '/';
      const newFolderWithSlash = newFolderNoSlash + '/';

      if (newFolderWithSlash === oldFolderWithSlash) { setFolderMenu({ path: null, anchor: null }); return; }
      // Prevent conflict with existing exact folder path
      if (files.some(f => f === newFolderWithSlash || f.startsWith(newFolderWithSlash))) {
        alert('A folder with this name already exists.');
        return;
      }

      // Build list of affected entries (folders and files under the old folder)
      const affected = files.filter(f => f.startsWith(oldFolderWithSlash));

      // Ensure new root folder exists first
      await axios.post(`/api/file?workspace=${workspace}`, { name: newFolderWithSlash });

      // Recreate tree under new folder
      for (const entry of affected) {
        const relative = entry.slice(oldFolderWithSlash.length);
        const target = newFolderWithSlash + relative;
        if (entry.endsWith('/')) {
          await axios.post(`/api/file?workspace=${workspace}`, { name: target });
        } else {
          try {
            const fileRes = await axios.get(`/api/file?workspace=${workspace}&name=${encodeURIComponent(entry)}`);
            const content = (fileRes.data && typeof fileRes.data.content === 'string') ? fileRes.data.content : '';
            await axios.post(`/api/file?workspace=${workspace}`, { name: target, content });
          } catch (readErr) {
            console.warn('Skipping unreadable file during folder rename:', entry, readErr);
          }
        }
      }

      // Delete old folder tree
      await axios.delete(`/api/file?workspace=${workspace}&name=${encodeURIComponent(oldFolderWithSlash)}`);

      // Refresh file list
      const listRes = await axios.get(`/api/files?workspace=${workspace}`);
      const filtered = Array.isArray(listRes.data) ? listRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')) : [];
      setFiles(filtered);

      // Update open tabs and current file
      setOpenTabs(tabs => tabs.map(t => t.startsWith(oldFolderWithSlash) ? (newFolderWithSlash + t.slice(oldFolderWithSlash.length)) : t));
      if (currentFile && currentFile.startsWith(oldFolderWithSlash)) {
        setCurrentFile(newFolderWithSlash + currentFile.slice(oldFolderWithSlash.length));
      }

      setFolderMenu({ path: null, anchor: null });
      showNotification('Folder renamed');
    } catch (error) {
      console.error('Error renaming folder:', error);
      showNotification('Failed to rename folder');
    }
  };

  const handleOpenFolderInTerminal = (folderPath) => {
    console.log('Opening folder in terminal:', folderPath);
    
    // Open terminal if not already open
    if (!showTerminal) {
      setShowTerminal(true);
    }
    
    // Close the context menu immediately
    setFolderMenu({ path: null, anchor: null });
    
    // Function to execute command once terminal is ready
    const executeCommand = () => {
      // Ensure we have terminals
      setTerminals(currentTerminals => {
        console.log('Current terminals:', currentTerminals);
        
        let targetTerminalId;
        
        // If no terminals exist, create one
        if (currentTerminals.length === 0) {
          const newId = 1;
          targetTerminalId = newId;
          setActiveTerminal(newId);
          console.log('Creating new terminal with ID:', newId);
          
          // Wait for terminal to be ready then send command
          setTimeout(() => {
            const term = terminalRefs.current.get(newId);
            console.log('New terminal reference found:', !!term);
            if (term && term.writeToTerminal) {
              const cleanPath = folderPath.replace(/\/$/, '');
              const command = `cd "${cleanPath}"`;
              console.log('Executing command:', command);
              term.writeToTerminal(command + '\r\n');
            }
          }, 1500);
          
          return [{ id: newId, title: 'powershell' }];
        } else {
          // Use existing terminal
          targetTerminalId = activeTerminal || currentTerminals[0].id;
          console.log('Using existing terminal ID:', targetTerminalId);
          
          setTimeout(() => {
            const term = terminalRefs.current.get(targetTerminalId);
            console.log('Existing terminal reference found:', !!term);
            if (term && term.writeToTerminal) {
              const cleanPath = folderPath.replace(/\/$/, '');
              const command = `cd "${cleanPath}"`;
              console.log('Executing command:', command);
              term.writeToTerminal(command + '\r\n');
            }
          }, 500);
          
          return currentTerminals;
        }
      });
    };
    
    // Execute the command after a brief delay
    setTimeout(executeCommand, 100);
  };

  const closeTab = (name, e) => {
    e.stopPropagation();
    
    // Save current file if it's the one being closed
    if (currentFile === name && code !== undefined) {
      saveFile();
    }
    
    const currentIndex = openTabs.indexOf(name);
    const newTabs = openTabs.filter(f => f !== name);
    setOpenTabs(newTabs);
    
    // If we're closing the currently active tab, switch to another tab
    if (currentFile === name) {
      if (newTabs.length > 0) {
        // Try to open the tab to the left, or the first tab if we're at the beginning
        const targetIndex = Math.max(0, currentIndex - 1);
        const targetTab = newTabs[targetIndex];
        if (targetTab) {
          openFile(targetTab);
        }
      } else {
        // No tabs left, clear the editor
        setCurrentFile('');
        setCode('');
        setRunOutput('');
      }
    }
  };

  const renderFileTree = (files) => {
    if (!files || !Array.isArray(files)) {
      return (
        <div className="explorer-empty">No files available</div>
      );
    }

    try {
      // Filter out invalid files and create folder set
      const validFiles = files.filter(f => typeof f === 'string' && f && !f.startsWith('[object Object]'));
      const folderNames = new Set(
        validFiles.filter(f => f.endsWith('/')).map(f => f.slice(0, -1))
      );
      
      // Filter files to avoid duplicates
      const filteredFiles = validFiles.filter(f => {
        if (!f.endsWith('/') && folderNames.has(f)) return false; 
        return true;
      });
      
      // Build tree structure
      const tree = {};
      filteredFiles.forEach(f => {
        if (!f || typeof f !== 'string') return;
        
        const parts = f.split('/').filter(Boolean);
        let node = tree;
        
        parts.forEach((part, i) => {
          if (!part || typeof part !== 'string') return;
          
          const isLast = i === parts.length - 1;
          const isFolder = f.endsWith('/') && isLast;
          
          if (!Object.prototype.hasOwnProperty.call(node, part) || (isFolder && node[part] === null)) {
            node[part] = isFolder ? {} : null;
          }
          
          if (!isLast) {
            if (node[part] === null) node[part] = {};
            node = node[part];
          }
        });
      });
      
      const renderNode = (node, path = '', isRoot = false) => {
        if (!node || typeof node !== 'object') return null;
        let entries = Object.entries(node);
        if (entries.length === 0) {
          return <div className="explorer-folder-empty">Empty folder</div>;
        }
        // Sort folders first (A-Z), then files (A-Z)
        entries.sort(([a, aChild], [b, bChild]) => {
          const aIsFolder = aChild && typeof aChild === 'object' && aChild !== null && !Array.isArray(aChild);
          const bIsFolder = bChild && typeof bChild === 'object' && bChild !== null && !Array.isArray(bChild);
          if (aIsFolder && !bIsFolder) return -1;
          if (!aIsFolder && bIsFolder) return 1;
          return a.localeCompare(b);
        });
        return (
          <ul className={`file-list${isRoot ? ' root' : ''}` }>
            {entries.map(([name, child]) => {
              const fullPath = path + name;
              const isFolder = child && typeof child === 'object' && child !== null && !Array.isArray(child);
              if (isFolder) {
                const isOpen = !!openFolders[fullPath];
                return (
                  <li key={fullPath} className="file-folder">
                    <div
                      className={`explorer-folder-row${isOpen ? ' open' : ''}`}
                      tabIndex={0}
                      onClick={() => setOpenFolders(f => ({ ...f, [fullPath]: !f[fullPath] }))}
                      onContextMenu={e => {
                        e.preventDefault();
                        setFolderMenu({ path: fullPath, anchor: { x: e.clientX, y: e.clientY } });
                        setFileMenu({ path: null, anchor: null });
                      }}
                    >
                      <span className="chevron-icon">{isOpen ? <VscChevronDown /> : <VscChevronRight />}</span>
                      <span className="folder-icon">{isOpen ? <VscFolderOpened color="#4fc3f7" /> : <VscFolder color="#4fc3f7" />}</span>
                      <span className="folder-name">{name}</span>
                    </div>
                    {isOpen && <div className="explorer-folder-children">{renderNode(child, fullPath + '/', false)}</div>}
                  </li>
                );
              } else {
                return (
                  <li
                    key={fullPath}
                    className={`file-item${fullPath === currentFile ? ' active' : ''}`}
                    tabIndex={0}
                    onClick={() => openFile(fullPath)}
                    onContextMenu={e => {
                      e.preventDefault();
                      setFileMenu({ path: fullPath, anchor: { x: e.clientX, y: e.clientY } });
                      setFolderMenu({ path: null, anchor: null });
                    }}
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.setData('text/plain', fullPath);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                  >
                    <span className="filetype-icon">{getVscodeFileIcon(name)}</span>
                    <span className="file-name">{name}</span>
                  </li>
                );
              }
            })}
          </ul>
        );
      };
      return renderNode(tree, '', true);
    } catch {
      return <div className="explorer-error">Error rendering file tree</div>;
    }
  };

  const renderSidebarPanel = () => {
    if (!explorerOpen) return null;

    if (activeSidebar === 'explorer') {
      return (
        <div className="explorer" style={{ width: explorerWidth }}>
          <div 
            className="explorer-resize-handle"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startWidth = explorerWidth;
              
              const handleMouseMove = (moveEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const newWidth = Math.max(200, Math.min(400, startWidth + deltaX));
                setExplorerWidth(newWidth);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          ></div>
          <div className="explorer-header">
            <span className="explorer-title">Files</span>
            <button className="add-btn" title="New File or Folder" onClick={handleAddFile}>+</button>
            <button className="add-btn" title="New Folder" onClick={handleAddFolder} style={{marginLeft:4}}><img src={'/folder2.png'} alt="Folder" style={{ width: 14, height: 14, display: 'inline-block', verticalAlign: 'middle' }} /></button>
          </div>
          {renderFileTree(files)}
        </div>
      );
    }
    if (activeSidebar === 'search') {
      return (
        <div className="explorer">
          <div className="explorer-title">Search</div>
          <form onSubmit={handleSearch} style={{padding:'0 12px 8px 12px'}}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              style={{width:'100%',padding:'6px',borderRadius:4,border:'1px solid #333',background:'#23272e',color:'#fff'}}
            />
          </form>
          <ul className="file-list">
            {searchResults.map(r => (
              <li key={r.file} className="file-item" onClick={() => openFile(r.file)}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:4}}><rect x="3" y="3" width="10" height="10" rx="2"/></svg>
                <span style={{fontWeight:600}}>{String(r.file)}</span>
                <span style={{color:'#bdbdbd',fontSize:'0.9em',marginLeft:4}}>
                  {String(r.snippet || '')}...
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    if (activeSidebar === 'source') {
      return (
        <div className="explorer">
          <div className="explorer-title" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <span>Source Control{gitBranch ? ` — ${gitBranch}` : ''}</span>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <button onClick={fetchGitStatus} title="Refresh" style={{ background:'transparent', color:'#bdbdbd', border:'1px solid #3e3e42', borderRadius:4, padding:'4px 8px', cursor:'pointer' }}>↻</button>
              {gitRemotes && gitRemotes.length > 0 ? (
                <button onClick={gitPush} title="Push" style={{ background:'transparent', color:'#4fc3f7', border:'1px solid #4fc3f7', borderRadius:4, padding:'4px 8px', cursor:'pointer' }}>⬆ Push</button>
              ) : null}
            </div>
          </div>
          <div style={{padding:'12px', display:'flex', flexDirection:'column', gap:'12px'}}>
            {!gitInitialized ? (
              <button
                onClick={gitInit}
                style={{ background:'#4fc3f7', color:'#181a1b', border:'none', borderRadius:4, padding:'8px 12px', cursor:'pointer', fontWeight:600 }}
              >Initialize Repository</button>
            ) : (
              <>
                {(!gitRemotes || gitRemotes.length === 0) && (
                  <button onClick={gitPublish} style={{ background:'#2d7cf0', color:'#fff', border:'none', borderRadius:6, padding:'10px 12px', cursor:'pointer', fontWeight:600 }}>Publish Branch</button>
                )}
                <div>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <button onClick={() => setShowStagedSection(v=>!v)} style={{ background:'transparent', color:'#bdbdbd', border:'none', cursor:'pointer', fontWeight:600 }}>
                      {showStagedSection ? '▾' : '▸'} Staged ({gitStatus.staged.length})
                    </button>
                    <div style={{display:'flex', gap:6}}>
                      <button onClick={gitResetAll} style={{ background:'transparent', color:'#e57373', border:'1px solid #e57373', borderRadius:4, padding:'2px 8px', cursor:'pointer' }}>Unstage All</button>
                    </div>
                  </div>
                  {showStagedSection && (
                    gitStatus.staged.length === 0 ? <div style={{color:'#777', fontSize:12}}>No staged files</div> : (
                      <ul className="file-list">
                        {gitStatus.staged.map(f => (
                          <li key={`s-${f}`} className="file-item" style={{display:'flex', gap:8, alignItems:'center', justifyContent:'space-between'}}>
                            <span onClick={() => openFile(f)} style={{overflow:'hidden', textOverflow:'ellipsis', cursor:'pointer'}} title={f}>{f}</span>
                            <div style={{display:'flex', gap:6}}>
                              <button onClick={() => gitResetPaths([f])} style={{ background:'transparent', color:'#e57373', border:'1px solid #e57373', borderRadius:4, padding:'2px 8px', cursor:'pointer' }}>Unstage</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
                <div>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8}}>
                    <button onClick={() => setShowChangesSection(v=>!v)} style={{ background:'transparent', color:'#bdbdbd', border:'none', cursor:'pointer', fontWeight:600 }}>
                      {showChangesSection ? '▾' : '▸'} Changes ({gitStatus.modified.length + gitStatus.untracked.length})
                    </button>
                    <div style={{display:'flex', gap:6}}>
                      <button onClick={gitAddAll} style={{ background:'transparent', color:'#4fc3f7', border:'1px solid #4fc3f7', borderRadius:4, padding:'2px 8px', cursor:'pointer' }}>Stage All</button>
                    </div>
                  </div>
                  {showChangesSection && (
                    (gitStatus.modified.length === 0 && gitStatus.untracked.length === 0) ? <div style={{color:'#777', fontSize:12}}>No changes</div> : (
                      <ul className="file-list">
                        {[...gitStatus.modified.map(f => ({ f, t: 'M' })), ...gitStatus.untracked.map(f => ({ f, t: 'U' }))].map(({ f, t }) => (
                          <li key={`c-${t}-${f}`} className="file-item" style={{display:'flex', gap:8, alignItems:'center', justifyContent:'space-between'}}>
                            <span onClick={() => openFile(f)} style={{overflow:'hidden', textOverflow:'ellipsis', cursor:'pointer'}} title={f}>
                              <span style={{color: t==='M' ? '#e0b060' : '#4fc3f7', marginRight:6}}>{t}</span>
                              {f}
                            </span>
                            <div style={{display:'flex', gap:6}}>
                              <button onClick={() => gitAddPaths([f])} style={{ background:'transparent', color:'#4fc3f7', border:'1px solid #4fc3f7', borderRadius:4, padding:'2px 8px', cursor:'pointer' }}>Stage</button>
                              <button onClick={async () => { if(t==='M'){ await axios.post('/api/git/discard', { workspace, path: f }); } else { await axios.post('/api/git/clean', { workspace, path: f }); } fetchGitStatus(); }} style={{ background:'transparent', color:'#e57373', border:'1px solid #e57373', borderRadius:4, padding:'2px 8px', cursor:'pointer' }}>Discard</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:8 }}>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={e => setCommitMessage(e.target.value)}
                    placeholder="Commit message"
                    style={{ flex:1, padding:'8px 10px', borderRadius:4, border:'1px solid #333', background:'#181a1b', color:'#fff' }}
                  />
                  <button onClick={gitCommit} style={{ background:'#4fc3f7', color:'#181a1b', border:'none', borderRadius:4, padding:'8px 12px', cursor:'pointer', fontWeight:600 }}>Commit</button>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const isVisualPreview = (file, code) => {
    if (!file) return false;
    if (file.endsWith('.jsx')) return true;
    if (file.endsWith('.js') && /export\s+default\s+function|class|const|let|var/.test(code) && /return\s*\(.*<.*>/.test(code)) return true;
    return false;
  };

  const renderSettingsMenu = () => {
    if (!showSettings) return null;
    
    return (
      <div className="settings-menu" style={{
        position: 'absolute',
        bottom: '80px',
        right: '0',
        background: '#23272e',
        border: '1px solid #333',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        minWidth: '200px',
        zIndex: 1000,
        overflow: 'hidden'
      }}>
        <div 
          className="menu-item" 
          onClick={() => { 
            setShowCommandPalette(true); 
            setShowSettings(false); 
          }}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            color: '#fff',
            borderBottom: '1px solid #333',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => e.target.style.background = '#3e3e42'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          Command Palette... 
          <span style={{color:'#bdbdbd', fontSize: '11px'}}>Ctrl+Shift+P</span>
        </div>
        <div 
          className="menu-separator" 
          style={{
            height: '1px',
            background: '#333',
            margin: '0'
          }}
        ></div>
        <div 
          className="menu-item" 
          onClick={() => { 
            setShowSettingsPanel(true); 
            setShowSettings(false); 
          }}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            color: '#fff',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => e.target.style.background = '#3e3e42'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          Settings 
          <span style={{color:'#bdbdbd', fontSize: '11px'}}>Ctrl+,</span>
        </div>
      </div>
    );
  };

  const handleGoLive = async () => {
    await saveFile();
    try {
      const goLiveRes = await axios.post(`/api/go-live?workspace=${workspace}`);
      setLiveStatus(goLiveRes.data);
    } catch (e) {
      // Non-fatal for preview
    }

    // Determine preview base URL
    const apiBase = process.env.REACT_APP_API_BASE_URL || '';
    let previewBase;
    if (apiBase) {
      previewBase = apiBase;
    } else if (window.location.hostname === 'localhost') {
      // Local dev: backend runs on 5001
      previewBase = 'http://localhost:5001';
    } else {
      // Same-origin deployment
      previewBase = `${window.location.protocol}//${window.location.host}`;
    }

    const fileParam = currentFile && currentFile.endsWith('.html')
      ? `&file=${encodeURIComponent(currentFile)}`
      : '';

    const url = `${previewBase}/preview?workspace=${encodeURIComponent(workspace || 'demo')}${fileParam}`;
    window.open(url, '_blank');
  };

  const handleStopLive = async () => {
    const stopLiveRes = await axios.post(`/api/stop-live?workspace=${workspace}`);
    setLiveStatus(stopLiveRes.data);
  };

  const handleRun = async () => {
    if (!currentFile.endsWith('.js') && !currentFile.endsWith('.jsx') && !currentFile.endsWith('.py') && !currentFile.endsWith('.html') && !currentFile.endsWith('.ts') && !currentFile.endsWith('.tsx') && !currentFile.endsWith('.java') && !currentFile.endsWith('.json')) {
      setRunOutput('Only .js, .jsx, .py, or .html files can be run.');
      return;
    }
    await saveFile();
    setLastRunCode(code);
    setLastRunFile(currentFile);
    if (currentFile.endsWith('.js') || currentFile.endsWith('.jsx') || currentFile.endsWith('.py')) {
      const runRes = await axios.post(`/api/run?workspace=${workspace}`, { name: currentFile });
      setRunOutput(runRes.data.output);
    } else {
      setRunOutput('');
    }
  };

  const runFileInTerminal = async () => {
    if (!currentFile.endsWith('.js')) {
      if (!showTerminal) setShowTerminal(true);
      const term = terminalRefs.current.get(activeTerminal);
      if(term) term.writeToTerminal('Only .js files can be run in terminal via command palette.\r\n');
      return;
    }
    await saveFile();
    if (!showTerminal) setShowTerminal(true);
    const runRes = await axios.post(`/api/run?workspace=${workspace}`, { name: currentFile });
    const term = terminalRefs.current.get(activeTerminal);
    if(term) term.writeToTerminal((runRes.data.output || '') + '\r\n');
  };

  const commands = [
    { id: 'open-settings', label: 'Open Settings', action: () => setShowSettingsPanel(true) },
    { id: 'go-live', label: 'Go Live', action: handleGoLive },
    { id: 'stop-live', label: 'Stop Live', action: handleStopLive },
    { id: 'run-file', label: 'Run Current File', action: runFileInTerminal },
    { id: 'open-terminal', label: 'Open Terminal', action: () => setShowTerminal(true) },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(commandSearch.toLowerCase())
  );

  useEffect(() => {
    if (!showCommandPalette) return;
    const paletteHandler = (e) => {
      if (e.key === 'ArrowDown') {
        setCommandIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setCommandIndex(i => Math.max(i - 1, 0));
        e.preventDefault();
      } else if (e.key === 'Enter') {
        if (filteredCommands[commandIndex]) {
          filteredCommands[commandIndex].action();
          setShowCommandPalette(false);
          setCommandSearch('');
          setCommandIndex(0);
        }
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setCommandSearch('');
        setCommandIndex(0);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', paletteHandler);
    return () => window.removeEventListener('keydown', paletteHandler);
  }, [showCommandPalette, filteredCommands, commandIndex]);

  // Commit with Ctrl+Enter when in Source Control
  useEffect(() => {
    const commitHandler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && activeSidebar === 'source') {
        e.preventDefault();
        gitCommit();
      }
    };
    window.addEventListener('keydown', commitHandler);
    return () => window.removeEventListener('keydown', commitHandler);
  }, [activeSidebar, commitMessage, gitStatus]);

  useEffect(() => {
    if (showCommandPalette && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [showCommandPalette]);

  useEffect(() => {
    const globalPaletteHandler = (e) => {
      // Command palette (Ctrl+Shift+P)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        setShowCommandPalette(true);
        setCommandSearch('');
        setCommandIndex(0);
        e.preventDefault();
      }
      // Settings shortcut (Ctrl+,)
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        setShowSettingsPanel(true);
        e.preventDefault();
      }
      // Save file (Ctrl+S)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveFile();
        showNotification('Saved');
      }
      // New file (Ctrl+N)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleAddFile();
      }
      // Close tab (Ctrl+W)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (currentFile) {
          closeTab(currentFile, { stopPropagation: () => {} });
        }
      }
      // Switch tabs (Ctrl+Tab)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        if (openTabs.length > 1) {
          const currentIndex = openTabs.indexOf(currentFile);
          const nextIndex = (currentIndex + 1) % openTabs.length;
          openFile(openTabs[nextIndex]);
        }
      }
    };
    window.addEventListener('keydown', globalPaletteHandler);
    return () => window.removeEventListener('keydown', globalPaletteHandler);
  }, [currentFile, openTabs]);

  // Enhanced scrolling for tab bar
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    let rafId = 0;
    let targetScrollLeft = container.scrollLeft;

    const smoothScroll = () => {
      const current = container.scrollLeft;
      const distance = targetScrollLeft - current;
      if (Math.abs(distance) < 0.5) {
        container.scrollLeft = targetScrollLeft;
        rafId = 0;
        return;
      }
      container.scrollLeft = current + distance * 0.18; // easing
      rafId = requestAnimationFrame(smoothScroll);
    };

    const scheduleScrollTo = (next) => {
      const max = container.scrollWidth - container.clientWidth;
      targetScrollLeft = Math.max(0, Math.min(max, next));
      if (!rafId) rafId = requestAnimationFrame(smoothScroll);
    };

    const onWheel = (e) => {
      // Always translate predominant wheel delta into horizontal scroll with easing
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (absX < 0.5 && absY < 0.5) return; // tiny noise
      e.preventDefault();
      const delta = absX > absY ? e.deltaX : e.deltaY; // pick dominant axis
      // Increase scroll speed by multiplying delta
      scheduleScrollTo(container.scrollLeft + (delta * 100));
    };

    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', onWheel);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [openTabs]);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setShowMainApp(true);
    }
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setShowInstallButton(false);
    });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallButton(false);
        setShowMainApp(true);
      }
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ws = params.get('workspace');
    if (ws) {
      setWorkspace(ws);
      setShowMainApp(true);
    }
  }, []);

  const handleMenuAction = (section, item) => {
    const label = item.label;
  
    switch (section) {
      case 'File':
        switch (true) {
          case label === 'New File':
          case label === 'New Text File':
            handleAddFile('');
            break;
          case label === 'New Window': {
            axios.post('/api/new-workspace', { workspace }).then((res) => {
              const folder = res.data?.folder;
              if (folder) {
                window.open(`${window.location.origin}?workspace=${folder}`, '_blank');
              }
            }).catch(() => showNotification('Failed to create new window'));
            break;
          }
          case label && label.startsWith('Open File'):
            if (fileInputRef.current) fileInputRef.current.click();
            break;
          case label && label.startsWith('Open Folder'):
            if (folderInputRef.current) folderInputRef.current.click();
            break;
          case label === 'Add Folder to Workspace...':
            handleAddFolder('');
            break;
          case label === 'Save':
            saveFile();
            showNotification('Saved');
            break;
          case label && label.startsWith('Save As'):
            if (!currentFile) { showNotification('No file open'); break; }
            (async () => {
              const newName = prompt('Save As: Enter new filename', currentFile) || '';
              if (!newName.trim()) return;
              try {
                await axios.post(`/api/file?workspace=${workspace}` , { name: newName.trim(), content: code || '' });
                setFiles((prev) => prev.includes(newName) ? prev : [...prev, newName]);
                setOpenTabs((prev) => prev.includes(newName) ? prev : [...prev, newName]);
                setCurrentFile(newName);
                showNotification('Saved As');
              } catch {
                showNotification('Save As failed');
              }
            })();
            break;
          case label === 'Save All':
            saveFile();
            break;
          case label && label.startsWith('Auto Save'):
            setAutoSave(v => !v);
            break;
          case label === 'Revert File':
            if (currentFile) openFile(currentFile);
            break;
          case label === 'Close Editor':
            if (currentFile) closeTab(currentFile, { stopPropagation: () => {} });
            break;
          case label === 'Close Folder':
            setFiles([]);
            setOpenTabs([]);
            setCurrentFile('');
            setCode('');
            setRunOutput('');
            break;
          case label === 'Close Window':
          case label === 'Exit':
            try { window.close(); } catch {}
            break;
          default:
            break;
        }
        return;
  
      case 'Edit':
        if (!editorRef.current) { showNotification('Editor not ready'); return; }
        switch (label) {
          case 'Undo':
            editorRef.current.trigger('keyboard', 'undo', null);
            break;
          case 'Redo':
            editorRef.current.trigger('keyboard', 'redo', null);
            break;
          case 'Cut':
            editorRef.current.getAction && editorRef.current.getAction('editor.action.clipboardCutAction')?.run();
            break;
          case 'Copy':
            editorRef.current.getAction && editorRef.current.getAction('editor.action.clipboardCopyAction')?.run();
            break;
          case 'Paste':
            editorRef.current.getAction && editorRef.current.getAction('editor.action.clipboardPasteAction')?.run();
            break;
          case 'Find':
            editorRef.current.getAction && editorRef.current.getAction('actions.find')?.run();
            break;
          case 'Replace':
            editorRef.current.getAction && editorRef.current.getAction('editor.action.startFindReplaceAction')?.run();
            break;
          case 'Find in Files':
            setActiveSidebar('search');
            break;
          case 'Replace in Files':
            setActiveSidebar('search');
            break;
          case 'Toggle Line Comment':
            editorRef.current.getAction && editorRef.current.getAction('editor.action.commentLine')?.run();
            break;
          case 'Toggle Block Comment':
            editorRef.current.getAction && editorRef.current.getAction('editor.action.blockComment')?.run();
            break;
          case 'Emmet: Expand Abbreviation':
            (editorRef.current.getAction && editorRef.current.getAction('editor.emmet.action.expandAbbreviation')?.run());
            break;
          default:
            break;
        }
        return;
  
      case 'Terminal':
        switch (label) {
          case 'New Terminal':
            handleAddNewTerminal();
            break;
          case 'Run Active File': handleRun(); break;
          case 'Toggle Terminal': setShowTerminal(s => !s); break;
        }
        return;
    }
  };
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingRef.current || !terminalContainerRef.current) return;
      const newHeight = Math.max(100, window.innerHeight - e.clientY - 36);
      setTerminalHeight(newHeight);
    };
    const handleMouseUp = () => {
      isResizingRef.current = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (showTerminal && terminals.length === 0) {
        handleAddNewTerminal();
    }
  }, [showTerminal]);

  // Click-away functionality for context menus and settings
  useEffect(() => {
    const handleClickAway = (e) => {
      // Don't handle contextmenu events that are setting up new menus
      if (e.type === 'contextmenu') {
        return;
      }
      
      // Check if click is outside of any context menu
      const contextMenus = document.querySelectorAll('[data-context-menu]');
      let isClickingOnContextMenu = false;
      
      contextMenus.forEach(menu => {
        if (menu.contains(e.target)) {
          isClickingOnContextMenu = true;
        }
      });
      
      // Check if click is outside settings menu
      const settingsMenu = document.querySelector('.settings-menu');
      const isClickingOnSettings = settingsMenu && settingsMenu.contains(e.target);
      
      // Check if click is on settings icon
      const settingsIcon = e.target.closest('.sidebar-icon');
      const isClickingOnSettingsIcon = settingsIcon && settingsIcon.title === 'Settings';
      
      if (!isClickingOnContextMenu) {
        setFolderMenu({ path: null, anchor: null });
        setFileMenu({ path: null, anchor: null });
        setTabMenu({ path: null, anchor: null });
      }
      
      // Close settings menu if clicking outside (but not on the icon)
      if (showSettings && !isClickingOnSettings && !isClickingOnSettingsIcon) {
        setShowSettings(false);
      }
    };

    document.addEventListener('click', handleClickAway);
    
    return () => {
      document.removeEventListener('click', handleClickAway);
    };
  }, [showSettings]);

  const handleAddNewTerminal = () => {
    setIsSplitView(false); // Always add a new terminal in single view
    setShowTerminal(true);
    setTerminals(prev => {
        const newId = prev.length > 0 ? Math.max(...prev.map(t => t.id)) + 1 : 1;
        setActiveTerminal(newId);
        return [...prev, { id: newId, title: `powershell` }];
    });
  };

  const handleSetActiveTerminal = (id) => {
    setActiveTerminal(id);
    setIsSplitView(false); // Clicking a terminal in the list exits split view
  };

  const handleDeleteTerminal = (idToDelete) => {
      setTerminals(prev => {
          const newTerminals = prev.filter(t => t.id !== idToDelete);
          if (activeTerminal === idToDelete) {
              if (newTerminals.length > 0) {
                  setActiveTerminal(newTerminals[0].id);
              } else {
                  setActiveTerminal(null);
                  setShowTerminal(false);
              }
          }
          if (newTerminals.length < 2) {
              setIsSplitView(false);
          }
          return newTerminals;
      });
      terminalRefs.current.delete(idToDelete);
  };

  const handleSplitTerminal = () => {
    if (isSplitView) {
        // If already split, unsplit
        setIsSplitView(false);
    } else {
        // If not split, enable split view
        if (terminals.length < 2) {
            // If there's only one terminal, add another one before splitting
            const newId = terminals.length > 0 ? Math.max(...terminals.map(t => t.id)) + 1 : 1;
            setTerminals(prev => [...prev, { id: newId, title: 'powershell' }]);
        }
        setIsSplitView(true);
    }
  };

  // Run an array of shell commands sequentially in the integrated terminal
  const runCommandsInTerminal = (commands) => {
    try {
      if (!Array.isArray(commands) || commands.length === 0) return;
      // Ensure terminal is visible and at least one terminal exists
      setShowTerminal(true);
      setTerminals(current => {
        if (current.length === 0) {
          const newId = 1;
          setActiveTerminal(newId);
          return [{ id: newId, title: 'powershell' }];
        }
        return current;
      });

      // Give time for terminal to mount and refs to populate
      setTimeout(() => {
        let targetId = activeTerminal;
        // Fallback to first available terminal id
        if (!targetId && terminals.length > 0) {
          targetId = terminals[0].id;
        }
        // As an ultimate fallback, try to get any ref from the map
        let term = (targetId && terminalRefs.current.get(targetId)) || null;
        if (!term) {
          const first = Array.from(terminalRefs.current.values())[0];
          term = first || null;
        }
        if (term && term.writeToTerminal) {
          // De-duplicate accidental key repeats like 'nnppmm' and normalize whitespace
          const normalize = (line) => line
            .replace(/n{2,}p{2,}m{2,}/gi, 'npm')
            .replace(/\s+/g, ' ')
            .trim();

          let delay = 0;
          const stepMs = 900;
          commands.forEach((cmd) => {
            const clean = normalize(String(cmd || ''));
            if (!clean) return;
            setTimeout(() => {
              term.writeToTerminal(clean + '\r\n');
            }, delay);
            delay += stepMs;
          });
        }
      }, 900);
    } catch (e) {
      console.error('Failed to run commands in terminal', e);
    }
  };

  if (!showMainApp) {
    return <LandingPage onInstall={handleInstallClick} showInstallButton={showInstallButton} />;
  }

  const getSplitTerminals = () => {
      if (!isSplitView) return [];
      const activeIndex = terminals.findIndex(t => t.id === activeTerminal);
      if (activeIndex === -1) return [];
      
      const secondTerminalIndex = activeIndex + 1 < terminals.length ? activeIndex + 1 : activeIndex - 1;
      if (secondTerminalIndex < 0) return [terminals[activeIndex]];

      return [terminals[activeIndex], terminals[secondTerminalIndex]];
  };

  const splitTerminals = getSplitTerminals();

  return (
    <div className="app-root" style={{background:'#181a1b', color:'#fff', minHeight:'100vh'}}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={async (e) => {
          const filesArr = Array.from(e.target.files || []);
          if (filesArr.length > 0) {
            for (const file of filesArr) {
              try {
                const text = await file.text();
                const name = file.name;
                setFiles((prev) => prev.includes(name) ? prev : [...prev, name]);
                setOpenTabs((prev) => prev.includes(name) ? prev : [...prev, name]);
                setCode(text);
                setCurrentFile(name);
                setRunOutput('');
              } catch (err) {
                console.error('Failed opening file:', err);
                showNotification('Failed to open file');
              }
            }
          }
          e.target.value = '';
        }}
        multiple
      />
      <input
        type="file"
        ref={folderInputRef}
        style={{ display: 'none' }}
        webkitdirectory="true"
        onChange={async (e) => {
          const filesArr = Array.from(e.target.files);
          if (filesArr.length > 0) {
            for (const file of filesArr) {
              const text = await file.text();
              setFiles((prev) => prev.includes(file.webkitRelativePath || file.name) ? prev : [...prev, file.webkitRelativePath || file.name]);
              setOpenTabs((prev) => prev.includes(file.webkitRelativePath || file.name) ? prev : [...prev, file.webkitRelativePath || file.name]);
              setCode(text);
              setCurrentFile(file.webkitRelativePath || file.name);
              setRunOutput('');
            }
          }
          e.target.value = '';
        }}
        multiple
      />
      {showInstallButton && deferredPrompt && (
        <button onClick={handleInstallClick} style={{position: 'fixed', top: 16, right: 16, zIndex: 1000, padding: '10px 20px', background: '#181a1b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'}}>Download App</button>
      )}
      
      {/* Notification System */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: '20px',
          background: '#4fc3f7',
          color: '#181a1b',
          padding: '12px 20px',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 2000,
          fontSize: '14px',
          fontWeight: '500',
          animation: 'slideIn 0.3s ease'
        }}>
          {notification}
        </div>
      )}
      <div className="topbar">
        <Topbar onMenuAction={handleMenuAction} autoSave={autoSave} />
      </div>
      <div className="main-content" style={{display:'flex', height:'calc(100vh - 48px)'}}>
        <div className="sidebar">
          {SIDEBAR_ICONS.filter(icon => icon.key !== 'settings').map(icon => (
            <div
              key={icon.key}
              className={`sidebar-icon${(activeSidebar === icon.key && icon.key !== 'ai') || (icon.key === 'ai' && isAIAssistantVisible) ? ' active' : ''}`}
              title={icon.title}
              onClick={() => {
                if (icon.key === 'ai') {
                  setIsAIAssistantVisible(v => !v);
                } else {
                  if (icon.key === 'explorer') {
                    setExplorerOpen(v => !v);
                  } else {
                    setExplorerOpen(true);
                  }
                  setActiveSidebar(icon.key);
                  setShowSettings(false);
                  if (icon.key === 'terminal') setShowTerminal(true);
                }
              }}
            >
              {icon.svg}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
            <div
              className={`sidebar-icon${activeSidebar === 'settings' ? ' active' : ''}`}
              title="Settings"
              onClick={() => {
                setActiveSidebar('settings');
                setShowSettings(s => !s);
              }}
            >
              {SIDEBAR_ICONS.find(icon => icon.key === 'settings').svg}
            </div>
            <img src="/icon.png" alt="User" style={{ width: 32, height: 32, borderRadius: 8, marginTop: 16, border: '1.5px solid #333', background: '#23272e' }} />
          </div>
          {showSettings && (
            <div style={{ position: 'relative' }}>
              {renderSettingsMenu()}
            </div>
          )}
        </div>
        
        {renderSidebarPanel()}

        <div className="editor-preview-container" style={{flex:1, display:'flex', flexDirection:'column', background:'#23272e', minWidth: 0}}>
          <div className="editor-area" style={{flex:1, background:'#23272e', display:'flex', flexDirection:'column'}}>
            <div className="tabbar">
              <div className="tabs-container" ref={tabsContainerRef} style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', overflowY: 'hidden', flex: 1 }}>
                {openTabs.map(f => (
                  <div
                    key={f}
                    className={`tab${f === currentFile ? ' active' : ''}`}
                    onClick={() => openFile(f)}
                    onContextMenu={e => {
                      e.preventDefault();
                      setTabMenu({ path: f, anchor: { x: e.clientX, y: e.clientY } });
                      setFileMenu({ path: null, anchor: null });
                      setFolderMenu({ path: null, anchor: null });
                    }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      minWidth: '120px',
                      maxWidth: '200px',
                      position: 'relative'
                    }}
                    title={f}
                  >
                    <span style={{ marginRight: 4, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img 
                        src={getFileIcon(f)} 
                        alt={getFileExtension(f) + ' file'} 
                        style={{ width: 16, height: 16 }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </span>
                    <span style={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {f}
                    </span>
                    <span 
                      className="close" 
                      onClick={e => closeTab(f, e)}
                      style={{
                        marginLeft: 8,
                        color: '#888',
                        fontSize: '1.1em',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#3e3e42';
                        e.target.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#888';
                      }}
                    >
                      ×
                    </span>
                  </div>
                ))}
                
                {/* Tab Context Menu */}
                {tabMenu.path && tabMenu.anchor && (
                  <div style={{
                    position: 'fixed',
                    left: tabMenu.anchor.x,
                    top: tabMenu.anchor.y,
                    background: '#23272e',
                    color: '#fff',
                    borderRadius: 6,
                    boxShadow: '0 2px 12px #0008',
                    minWidth: 150,
                    zIndex: 1000,
                    border: '1px solid #222',
                    padding: '4px 0',
                  }}
                    onClick={e => e.stopPropagation()}
                    data-context-menu="true"
                  >
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem', borderBottom: '1px solid #333' }}
                      onClick={e => {
                        try {
                          closeTab(tabMenu.path, { stopPropagation: () => {} });
                          setTabMenu({ path: null, anchor: null });
                        } catch (error) {
                          console.error('Error closing tab:', error);
                          showNotification('Failed to close tab');
                        }
                      }}
                    >Close</div>
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem', color: '#e57373' }}
                      onClick={e => {
                        try {
                          setOpenTabs([]);
                          setCurrentFile('');
                          setCode('');
                          setRunOutput('');
                          setTabMenu({ path: null, anchor: null });
                          showNotification('All tabs closed');
                        } catch (error) {
                          console.error('Error closing all tabs:', error);
                          showNotification('Failed to close all tabs');
                        }
                      }}
                    >Close All</div>
                  </div>
                )}
                {/* File Context Menu */}
                {fileMenu.path && fileMenu.anchor && (
                  <div style={{
                    position: 'fixed',
                    left: fileMenu.anchor.x,
                    top: fileMenu.anchor.y,
                    background: '#23272e',
                    color: '#fff',
                    borderRadius: 6,
                    boxShadow: '0 2px 12px #0008',
                    minWidth: 180,
                    zIndex: 1000,
                    border: '1px solid #222',
                    padding: '4px 0',
                  }}
                    onClick={e => e.stopPropagation()}
                    data-context-menu="true"
                  >
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem' }}
                      onClick={() => { try { openFile(fileMenu.path); } finally { setFileMenu({ path: null, anchor: null }); } }}
                    >Open</div>
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem' }}
                      onClick={(e) => { try { handleRenameFile(fileMenu.path, e); } finally { /* handler closes menu */ } }}
                    >Rename</div>
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem', color: '#e57373' }}
                      onClick={(e) => { try { handleDeleteFile(fileMenu.path, e); } finally { setFileMenu({ path: null, anchor: null }); } }}
                    >Delete</div>
                  </div>
                )}

                {/* Folder Context Menu */}
                {folderMenu.path && folderMenu.anchor && (
                  <div style={{
                    position: 'fixed',
                    left: folderMenu.anchor.x,
                    top: folderMenu.anchor.y,
                    background: '#23272e',
                    color: '#fff',
                    borderRadius: 6,
                    boxShadow: '0 2px 12px #0008',
                    minWidth: 200,
                    zIndex: 1000,
                    border: '1px solid #222',
                    padding: '4px 0',
                  }}
                    onClick={e => e.stopPropagation()}
                    data-context-menu="true"
                  >
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem' }}
                      onClick={() => { try { handleAddFile(folderMenu.path + '/'); } finally { setFolderMenu({ path: null, anchor: null }); } }}
                    >New File</div>
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem' }}
                      onClick={() => { try { handleAddFolder(folderMenu.path + '/'); } finally { setFolderMenu({ path: null, anchor: null }); } }}
                    >New Folder</div>
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem' }}
                      onClick={(e) => { try { handleRenameFolder(folderMenu.path, e); } finally { /* handler closes menu */ } }}
                    >Rename</div>
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem' }}
                      onClick={() => { try { handleOpenFolderInTerminal(folderMenu.path); } finally { setFolderMenu({ path: null, anchor: null }); } }}
                    >Open in Terminal</div>
                    <div
                      style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem', color: '#e57373' }}
                      onClick={(e) => { try { handleDeleteFolder(folderMenu.path, e); } finally { setFolderMenu({ path: null, anchor: null }); } }}
                    >Delete</div>
                  </div>
                )}
              </div>
            </div>
            <div style={{flex:1, display:'flex', flexDirection:'column', background:'#23272e'}}>
              {openTabs.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#4fc3f7',
                  textAlign: 'center',
                  padding: '40px'
                }}>
                  <h1 style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    margin: '0 0 20px 0',
                    color: '#4fc3f7'
                  }}>
                    WELCOME TO CLICKK
                  </h1>
                  <p style={{
                    fontSize: '18px',
                    color: '#888',
                    fontStyle: 'italic',
                    margin: '0 0 10px 0'
                  }}>
                    "The best way to predict the future is to invent it." - Alan Kay
                  </p>
                  <p style={{
                    fontSize: '16px',
                    color: '#aaa',
                    fontStyle: 'italic',
                    margin: '0 0 30px 0'
                  }}>
                    Your AI-powered coding companion
                  </p>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '15px',
                      flexWrap: 'wrap',
                      justifyContent: 'center'
                    }}>
                      {/* <button
                        onClick={handleAddFile}
                        style={{
                          background: '#4fc3f7',
                          color: '#181a1b',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          minWidth: '160px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#29b6f6'}
                        onMouseLeave={(e) => e.target.style.background = '#4fc3f7'}
                      >
                        Create New File
                      </button>
                      <button
                        onClick={handleAddFolder}
                        style={{
                          background: 'transparent',
                          color: '#4fc3f7',
                          border: '2px solid #4fc3f7',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          minWidth: '160px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#4fc3f7';
                          e.target.style.color = '#181a1b';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#4fc3f7';
                        }}
                      >
                        Create New Folder
                      </button> */}
                    </div>
                    <div style={{
                      marginTop: '20px',
                      padding: '20px',
                      background: 'rgba(79, 195, 247, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(79, 195, 247, 0.2)',
                      maxWidth: '500px'
                    }}>
                      <h3 style={{ margin: '0 0 15px 0', color: '#4fc3f7' }}>Quick Start</h3>
                      <ul style={{ 
                        textAlign: 'left', 
                        margin: 0, 
                        paddingLeft: '20px',
                        color: '#ccc'
                      }}>
                        <li>Use <kbd style={{ background: '#333', padding: '2px 6px', borderRadius: '3px' }}>Ctrl+N</kbd> to create a new file</li>
                        <li>Use <kbd style={{ background: '#333', padding: '2px 6px', borderRadius: '3px' }}>Ctrl+S</kbd> to save files</li>
                        <li>Use <kbd style={{ background: '#333', padding: '2px 6px', borderRadius: '3px' }}>Ctrl+Shift+P</kbd> to open command palette</li>
                        <li>Use <kbd style={{ background: '#333', padding: '2px 6px', borderRadius: '3px' }}>Ctrl+W</kbd> to close tabs</li>
                        <li>Use <kbd style={{ background: '#333', padding: '2px 6px', borderRadius: '3px' }}>Ctrl+Tab</kbd> to switch between tabs</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <MonacoEditor
                  height="100%"
                  language={getLanguage(currentFile)}
                  defaultLanguage={getLanguage(currentFile)}
                  value={code || ''}
                  onChange={(value) => setCode(value || '')}
                  onMount={(editor) => { 
                    try {
                      editorRef.current = editor;
                    } catch (error) {
                      console.error('Error mounting editor:', error);
                    }
                  }}
                  onError={(error) => {
                    console.error('Monaco Editor error:', error);
                  }}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineHeight: 20,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    background: '#23272e',
                    renderWhitespace: 'none',
                    folding: true,
                    lineNumbers: 'on',
                    glyphMargin: true,
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    automaticLayout: true,
                    contextmenu: true,
                    mouseWheelZoom: false,
                    quickSuggestions: true,
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: 'on',
                    tabCompletion: 'on',
                    wordBasedSuggestions: true,
                    parameterHints: {
                      enabled: true
                    },
                    autoIndent: 'full',
                    formatOnPaste: true,
                    formatOnType: true,
                    dragAndDrop: true,
                    links: true,
                    colorDecorators: true,
                    lightbulb: {
                      enabled: true
                    }
                  }}
                />
              )}
            </div>
          </div>
          {showTerminal && (
            <div 
              ref={terminalContainerRef}
              style={{ 
                height: terminalHeight, 
                background: '#181a1b',
                borderTop: '1px solid #333',
                color: '#fff',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                isolation: 'isolate',
                contain: 'layout style paint',
              }}
            >
              <div
                style={{
                  height: 6,
                  cursor: 'ns-resize',
                  background: isResizingRef.current ? '#4fc3f7' : '#23272e',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 10,
                }}
                onMouseDown={() => { isResizingRef.current = true; }}
              />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#2d2d30',
                borderBottom: '1px solid #3e3e42',
                height: 35,
                zIndex: 3,
                position: 'relative',
                marginTop: 6,
                padding: '0 12px',
                fontSize: '13px'
              }}>
                {/* Terminal Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }}>
                  {terminals.map((term, index) => (
                    <div
                      key={term.id}
                      onClick={() => {
                        handleSetActiveTerminal(term.id);
                        setActiveBottomTab('terminal');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px 4px 8px',
                        background: (term.id === activeTerminal && activeBottomTab === 'terminal') ? '#1e1e1e' : 'transparent',
                        border: (term.id === activeTerminal && activeBottomTab === 'terminal') ? '1px solid #3e3e42' : '1px solid transparent',
                        borderBottom: 'none',
                        borderRadius: '4px 4px 0 0',
                        cursor: 'pointer',
                        color: (term.id === activeTerminal && activeBottomTab === 'terminal') ? '#cccccc' : '#969696',
                        fontSize: '13px',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        minWidth: '120px',
                        maxWidth: '200px'
                      }}
                    >
                      {/* PowerShell Icon */}
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ color: '#0078d4', flexShrink: 0 }}>
                        <path d="M2 3h12v10H2V3zm1 1v8h10V4H3zm1 1h1v1H4V5zm2 0h1v1H6V5zm2 0h1v1H8V5zm-4 2h6v1H4V7zm0 2h4v1H4V9z"/>
                      </svg>
                      
                      {/* Terminal Label */}
                      <span style={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        flex: 1
                      }}>
                        {index + 1}: powershell
                      </span>
                      
                      {/* Close button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTerminal(term.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#969696',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '3px',
                          width: '16px',
                          height: '16px',
                          fontSize: '12px',
                          opacity: 0.6
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#3e3e42';
                          e.target.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'none';
                          e.target.style.opacity = '0.6';
                        }}
                        title={`Close Terminal ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {/* Other tab buttons */}
                  <button
                    onClick={() => setActiveBottomTab('output')}
                    style={{
                      background: activeBottomTab === 'output' ? '#1e1e1e' : 'transparent',
                      border: activeBottomTab === 'output' ? '1px solid #3e3e42' : '1px solid transparent',
                      borderBottom: 'none',
                      borderRadius: '4px 4px 0 0',
                      color: activeBottomTab === 'output' ? '#cccccc' : '#969696',
                      padding: '4px 12px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      marginLeft: '4px'
                    }}
                  >
                    Output
                  </button>
                </div>
                
                {/* Terminal Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                  <button
                    onClick={handleAddNewTerminal}
                    title="New Terminal"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#cccccc',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '16px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#3e3e42'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleSplitTerminal}
                    title={isSplitView ? "Unsplit Terminal" : "Split Terminal"}
                    style={{
                      background: isSplitView ? '#3e3e42' : 'none',
                      border: 'none',
                      color: '#cccccc',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '16px'
                    }}
                    onMouseEnter={(e) => !isSplitView && (e.target.style.background = '#3e3e42')}
                    onMouseLeave={(e) => !isSplitView && (e.target.style.background = 'none')}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => setShowTerminal(false)}
                    title="Hide Terminal"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#cccccc',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '16px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#3e3e42'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
              </div>
              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {activeBottomTab === 'terminal' ? (
                  <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
                    {isSplitView && splitTerminals.length >= 2 ? (
                      // Split view with two terminals side by side
                      <>
                        <div style={{ 
                          flex: '1 1 50%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          minWidth: '200px',
                          background: '#181a1b'
                        }}>
                          <TerminalPanel 
                            ref={el => terminalRefs.current.set(splitTerminals[0].id, el)}
                            workspace={workspace}
                            onProjectCreated={() => {
                              axios.get(`/api/files?workspace=${workspace}`).then(fileRes => {
                                setFiles(fileRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')));
                              });
                            }}
                            onAddNewTerminal={handleAddNewTerminal}
                            onDeleteTerminal={() => handleDeleteTerminal(splitTerminals[0].id)}
                          />
                        </div>
                        
                        {/* Vertical resize handle for split terminals */}
                        <div 
                          style={{
                            width: 4,
                            cursor: 'ew-resize',
                            background: '#3e3e42',
                            borderLeft: '1px solid #555',
                            borderRight: '1px solid #555',
                            userSelect: 'none',
                            flexShrink: 0
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            const startX = e.clientX;
                            const splitContainer = e.target.parentElement;
                            const leftPanel = splitContainer.children[0];
                            const rightPanel = splitContainer.children[2];
                            
                            // Get initial dimensions
                            const containerRect = splitContainer.getBoundingClientRect();
                            const leftRect = leftPanel.getBoundingClientRect();
                            const rightRect = rightPanel.getBoundingClientRect();
                            
                            const totalWidth = containerRect.width - 4; // Account for splitter width
                            const initialLeftWidth = leftRect.width;
                            const initialRightWidth = rightRect.width;
                            
                            // Add visual feedback
                            e.target.style.background = '#4fc3f7';
                            document.body.style.cursor = 'ew-resize';
                            
                            const handleMouseMove = (moveEvent) => {
                              const deltaX = moveEvent.clientX - startX;
                              
                              // Calculate new widths
                              let newLeftWidth = initialLeftWidth + deltaX;
                              let newRightWidth = initialRightWidth - deltaX;
                              
                              // Enforce minimum widths (200px each)
                              const minWidth = 200;
                              if (newLeftWidth < minWidth) {
                                newLeftWidth = minWidth;
                                newRightWidth = totalWidth - newLeftWidth;
                              } else if (newRightWidth < minWidth) {
                                newRightWidth = minWidth;
                                newLeftWidth = totalWidth - newRightWidth;
                              }
                              
                              // Apply styles using flex-basis for VS Code-like behavior
                              leftPanel.style.flexBasis = `${newLeftWidth}px`;
                              leftPanel.style.flexGrow = '0';
                              leftPanel.style.flexShrink = '0';
                              leftPanel.style.minWidth = `${minWidth}px`;
                              leftPanel.style.maxWidth = 'none';
                              leftPanel.style.width = 'auto';
                              
                              rightPanel.style.flexBasis = `${newRightWidth}px`;
                              rightPanel.style.flexGrow = '0';
                              rightPanel.style.flexShrink = '0';
                              rightPanel.style.minWidth = `${minWidth}px`;
                              rightPanel.style.maxWidth = 'none';
                              rightPanel.style.width = 'auto';
                              
                              // Throttled terminal resize
                              clearTimeout(window.resizeTimeout);
                              window.resizeTimeout = setTimeout(() => {
                                if (splitTerminals[0] && terminalRefs.current.get(splitTerminals[0].id)) {
                                  const leftTerm = terminalRefs.current.get(splitTerminals[0].id);
                                  if (leftTerm && leftTerm.fit) {
                                    leftTerm.fit();
                                  }
                                }
                                if (splitTerminals[1] && terminalRefs.current.get(splitTerminals[1].id)) {
                                  const rightTerm = terminalRefs.current.get(splitTerminals[1].id);
                                  if (rightTerm && rightTerm.fit) {
                                    rightTerm.fit();
                                  }
                                }
                              }, 16);
                            };
                            
                            const handleMouseUp = () => {
                              // Reset visual feedback
                              e.target.style.background = '#3e3e42';
                              document.body.style.cursor = 'default';
                              
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                              
                              // Final terminal resize
                              setTimeout(() => {
                                if (splitTerminals[0] && terminalRefs.current.get(splitTerminals[0].id)) {
                                  const leftTerm = terminalRefs.current.get(splitTerminals[0].id);
                                  if (leftTerm && leftTerm.fit) {
                                    leftTerm.fit();
                                  }
                                }
                                if (splitTerminals[1] && terminalRefs.current.get(splitTerminals[1].id)) {
                                  const rightTerm = terminalRefs.current.get(splitTerminals[1].id);
                                  if (rightTerm && rightTerm.fit) {
                                    rightTerm.fit();
                                  }
                                }
                              }, 100);
                            };
                            
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                          }}
                        />
                        
                        <div style={{ 
                          flex: '1 1 50%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          minWidth: '200px',
                          background: '#181a1b'
                        }}>
                          <TerminalPanel 
                            ref={el => terminalRefs.current.set(splitTerminals[1].id, el)}
                            workspace={workspace}
                            onProjectCreated={() => {
                              axios.get(`/api/files?workspace=${workspace}`).then(fileRes => {
                                setFiles(fileRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')));
                              });
                            }}
                            onAddNewTerminal={handleAddNewTerminal}
                            onDeleteTerminal={() => handleDeleteTerminal(splitTerminals[1].id)}
                          />
                        </div>
                      </>
                    ) : (
                      // Single terminal view
                      terminals.map(term =>
                        <div key={term.id} style={{width: '100%', height: '100%', display: term.id === activeTerminal ? 'block' : 'none'}}>
                          <TerminalPanel 
                            ref={el => terminalRefs.current.set(term.id, el)}
                            workspace={workspace}
                            onProjectCreated={() => {
                              axios.get(`/api/files?workspace=${workspace}`).then(fileRes => {
                                setFiles(fileRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')));
                              });
                            }}
                            onAddNewTerminal={handleAddNewTerminal}
                            onDeleteTerminal={() => handleDeleteTerminal(term.id)}
                          />
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="output-panel">
                    <strong>Output:</strong>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{runOutput ? runOutput : 'No output yet. Click ▶ Run to see results here.'}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {isAIAssistantVisible && (
          <div style={{ width: '400px', flexShrink: 0, borderLeft: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
            <AIAssistant
              currentFile={currentFile}
              currentCode={code}
              workspace={workspace}
              onCodeChange={setCode}
              onFileCreate={handleFileCreate}
              onFileOpen={openFile}
              onClose={() => setIsAIAssistantVisible(false)}
              onRunCommands={(cmds) => runCommandsInTerminal(cmds)}
              onFilesRefresh={refreshFiles}
            />
          </div>
        )}
      </div>
             <div style={{
         position: 'fixed',
         left: 0,
         right: isAIAssistantVisible ? '400px' : 0,
         bottom: 3,
         height: 36,
         background: '#23272e',
         color: '#fff',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'flex-end',
         padding: '0 24px',
         borderTop: '1px solid #333',
         zIndex: 1001,
         transition: 'right 0.3s ease'
       }}>
         <span style={{marginRight: 16, color: liveStatus.running ? '#4fc3f7' : '#aaa'}}>
           {liveStatus.running ? `Port : 5500 (Live)` : 'Go Live stopped'}
         </span>
         <button
           onClick={handleGoLive}
           disabled={liveStatus.running}
           className="status-bar-btn go-live"
         >
           Go Live
         </button>
         <button
           onClick={handleStopLive}
           disabled={!liveStatus.running}
           className="status-bar-btn stop-live"
         >
           Stop Live
         </button>
       </div>
      {showSettingsPanel && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowSettingsPanel(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            style={{
              background: '#23272e',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '24px',
              minWidth: '400px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          >
            <h2 style={{
              marginTop: 0, 
              marginBottom: 24,
              color: '#fff',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              Settings
            </h2>
            
            <div style={{marginBottom: 20}}>
              <label style={{
                fontWeight: 600,
                color: '#fff',
                display: 'block',
                marginBottom: 8,
                fontSize: '14px'
              }}>
                Theme:
              </label>
              <select 
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: '#181a1b',
                  color: '#fff',
                  border: '1px solid #333',
                  fontSize: '14px',
                  minWidth: '200px'
                }} 
                disabled
              >
                <option>Dark (default)</option>
              </select>
              <span style={{
                marginLeft: 12, 
                color: '#888', 
                fontSize: '13px',
                fontStyle: 'italic'
              }}>
                (coming soon)
              </span>
            </div>
            
            <div style={{marginBottom: 20}}>
              <label style={{
                fontWeight: 600,
                color: '#fff',
                display: 'block',
                marginBottom: 8,
                fontSize: '14px'
              }}>
                Auto Save:
              </label>
              <input 
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                style={{
                  marginLeft: 8,
                  transform: 'scale(1.2)'
                }}
              />
              <span style={{
                marginLeft: 8, 
                color: '#ccc', 
                fontSize: '13px'
              }}>
                Automatically save files when typing
              </span>
            </div>
            
            <div style={{marginBottom: 20}}>
              <label style={{
                fontWeight: 600,
                color: '#fff',
                display: 'block',
                marginBottom: 8,
                fontSize: '14px'
              }}>
                AI Assistant:
              </label>
              <input 
                type="checkbox"
                checked={isAIAssistantVisible}
                onChange={(e) => setIsAIAssistantVisible(e.target.checked)}
                style={{
                  marginLeft: 8,
                  transform: 'scale(1.2)'
                }}
              />
              <span style={{
                marginLeft: 8, 
                color: '#ccc', 
                fontSize: '13px'
              }}>
                Show AI Assistant panel
              </span>
            </div>
            
            <button 
              onClick={() => setShowSettingsPanel(false)} 
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#888',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => e.target.style.background = '#3e3e42'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              ×
            </button>
          </div>
        </div>
      )}
      {showCommandPalette && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowCommandPalette(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <div 
            className="command-palette" 
            onClick={e => e.stopPropagation()}
            style={{
              background: '#23272e',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '0',
              minWidth: '500px',
              maxWidth: '600px',
              maxHeight: '70vh',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <input
              ref={commandInputRef}
              type="text"
              placeholder="Type a command..."
              value={commandSearch}
              onChange={e => { setCommandSearch(e.target.value); setCommandIndex(0); }}
              style={{
                padding: '16px 20px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
                borderBottom: '1px solid #333'
              }}
            />
            <div style={{
              maxHeight: 320, 
              overflowY: 'auto',
              padding: '8px 0'
            }}>
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd, i) => (
                  <div
                    key={cmd.id}
                    className={`command-item ${i === commandIndex ? 'selected' : ''}`}
                    onMouseEnter={() => setCommandIndex(i)}
                    onClick={() => {
                      cmd.action();
                      setShowCommandPalette(false);
                      setCommandSearch('');
                      setCommandIndex(0);
                    }}
                    style={{
                      padding: '12px 20px',
                      cursor: 'pointer',
                      color: '#fff',
                      fontSize: '14px',
                      background: i === commandIndex ? '#3e3e42' : 'transparent',
                      borderLeft: i === commandIndex ? '3px solid #4fc3f7' : '3px solid transparent'
                    }}
                  >
                    {cmd.label}
                  </div>
                ))
              ) : (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#888',
                  fontSize: '14px'
                }}>
                  No commands found
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowCommandPalette(false)} 
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#888',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => e.target.style.background = '#3e3e42'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
