import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';
import { Sandpack } from "@codesandbox/sandpack-react";
import './layout.css';
import TerminalPanel from './TerminalPanel';
import LandingPage from './LandingPage';
import { FileIcon, defaultStyles } from 'react-file-icon';

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
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="3"/><circle cx="17" cy="17" r="3"/><path d="M7 10v4a4 4 0 0 0 4 4h3"/></svg>
    )
  },
  {
    key: 'terminal',
    title: 'Terminal',
    svg: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17h16M8 9l3 3-3 3"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg>
    )
  },
  {
    key: 'extensions',
    title: 'Extensions',
    svg: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><path d="M7 7l10 10"/></svg>
    )
  },
  {
    key: 'settings',
    title: 'Settings',
    svg: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09c0 .66.38 1.26 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.36.36.57.86.6 1.39V9a2 2 0 1 1 0 4h-.09c-.03.53-.24 1.03-.6 1.39z"/></svg>
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
  if (filename.endsWith('.js')) return 'javascript';
  if (filename.endsWith('.jsx')) return 'javascript';
  if (filename.endsWith('.ts')) return 'typescript';
  if (filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.html')) return 'html';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.py')) return 'python';
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
  if (ext === 'ts' || ext === 'tsx') return '/icons/file_type_tsconfig.svg';
  // fallback generic file icon
  return '/icons/folder_type_template.svg';
};

export default function App() {
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
  const [showMainApp, setShowMainApp] = useState(false);
  // Add a state to control terminal visibility
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
  // Poll live server status (optional, for robustness)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     axios.get('http://localhost:5000/api/live-status').then(res => setLiveStatus(res.data));
  //   }, 2000);
  //   return () => clearInterval(interval);
  // }, []);

  // Load file list
  useEffect(() => {
    axios.get('/api/files').then(res => {
      console.log('Loaded files:', res.data);
      setFiles(res.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')));
    });
  }, []);

  // Auto-open first file
  useEffect(() => {
    if (files.length > 0 && !currentFile) {
      openFile(files[0]);
    }
  }, [files]);

  const saveFile = () => {
    if (!currentFile) return;
    axios.post('/api/file', { name: currentFile, content: code });
  };

  // Debounced auto-save
  useEffect(() => {
    if (!currentFile) return;
    const timeout = setTimeout(() => {
      saveFile();
    }, 800);
    return () => clearTimeout(timeout);
  }, [code, currentFile]);

  const openFile = name => {
    if (currentFile && code !== undefined && currentFile !== name) {
      saveFile();
    }
    setCurrentFile(name);
    if (!openTabs.includes(name)) setOpenTabs([...openTabs, name]);
    axios.get('/api/file', { params: { name } })
      .then(res => setCode(res.data.content));
    setRunOutput('');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const results = [];
    for (const file of files) {
      const res = await axios.get('/api/file', { params: { name: file } });
      const content = res.data.content;
      if (content && content.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({ file, snippet: content.substr(content.toLowerCase().indexOf(searchQuery.toLowerCase()), 60) });
      }
    }
    setSearchResults(results);
  };

  const handleDeleteFile = async (name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete file '${name}'?`)) return;
    await axios.delete(`/api/file?name=${encodeURIComponent(name)}`);
    setFiles(files.filter(f => f !== name));
    setOpenTabs(openTabs.filter(f => f !== name));
    if (currentFile === name) {
      setCurrentFile('');
      setCode('');
      setRunOutput('');
    }
  };

  const handleAddFile = async (parentPath = '') => {
    // Defensive: always ensure parentPath is a string
    if (typeof parentPath !== 'string') parentPath = '';
    let name = prompt('Enter new file name (e.g. myfile.js):');
    if (!name) return;
    // Clean up and sanitize file name
    name = String(name).replace(/\\/g, '/').replace(/\/+$/, '').replace(/\//g, '').trim();
    if (!name) return;
    const fullPath = parentPath ? String(parentPath) + name : name;
    // Prevent accidental [object Object] file creation
    if (fullPath.startsWith('[object Object]')) {
      alert('Invalid file name.');
      return;
    }
    await axios.post('/api/file', { name: fullPath, content: '' });
    axios.get('/api/files').then(response => {
      const filtered = response.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]'));
      setFiles(filtered);
      setCurrentFile(fullPath);
      setOpenTabs(tabs => tabs.includes(fullPath) ? tabs : [...tabs, fullPath]);
      setCode('');
      setRunOutput('');
    });
  };

  const handleAddFolder = async (parentPath = '') => {
    if (typeof parentPath !== 'string') parentPath = '';
    let name = prompt('Enter new folder name:');
    if (!name) return;
    name = String(name).replace(/\\/g, '/').replace(/\/+$/, '').replace(/\//g, '').trim();
    if (!name) return;
    const folderPath = parentPath ? String(parentPath) + name + '/' : name + '/';
    if (folderPath.startsWith('[object Object]')) {
      alert('Invalid folder name.');
      return;
    }
    // Prevent duplicate file at root with same name
    if (!parentPath && files.includes(name)) {
      alert('A file with this name already exists at the root. Please choose a different folder name.');
      return;
    }
    try {
      await axios.post('/api/file', { name: folderPath, content: '' });
      const folderRes = await axios.get('/api/files');
      setFiles(folderRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')));
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder');
    }
  };

  const handleDeleteFolder = async (name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete folder '${name}' and all its contents?`)) return;
    await axios.delete(`/api/file?name=${encodeURIComponent(name)}`);
    setFiles(files.filter(f => !f.startsWith(name)));
    setOpenTabs(openTabs.filter(f => !f.startsWith(name)));
    if (currentFile && currentFile.startsWith(name)) {
      setCurrentFile('');
      setCode('');
      setRunOutput('');
    }
  };

  const closeTab = (name, e) => {
    e.stopPropagation();
    if (currentFile === name && code !== undefined) {
      saveFile();
    }
    const idx = openTabs.indexOf(name);
    const newTabs = openTabs.filter(f => f !== name);
    setOpenTabs(newTabs);
    if (currentFile === name) {
      if (newTabs.length > 0) {
        openFile(newTabs[Math.max(0, idx - 1)]);
      } else {
        setCurrentFile('');
        setCode('');
        setRunOutput('');
      }
    }
  };

  const renderFileTree = (files) => {
    // Filter out files that have the same name as a folder (e.g., 'mko' if 'mko/' exists)
    const folderNames = new Set(
      files.filter(f => typeof f === 'string' && f.endsWith('/')).map(f => f.slice(0, -1))
    );
    const filteredFiles = files.filter(f => {
      if (typeof f !== 'string') return false;
      if (!f.endsWith('/') && folderNames.has(f)) return false; // Remove file if folder exists
      return true;
    });
    const tree = {};
    // First build the tree structure
    filteredFiles.forEach(f => {
      if (typeof f !== 'string') return; // Defensive: skip non-string parts
      const parts = f.split('/').filter(Boolean);
      let node = tree;
      parts.forEach((part, i) => {
        if (typeof part !== 'string') return; // Defensive: skip non-string parts
        const isLast = i === parts.length - 1;
        const isFolder = f.endsWith('/') && isLast;
        // If node[part] is a file but we need a folder, overwrite it
        if (!Object.prototype.hasOwnProperty.call(node, part) || (isFolder && node[part] === null)) {
          node[part] = isFolder ? {} : null;
        }
        // Always ensure node[part] is an object before traversing
        if (!isLast) {
          if (node[part] === null) node[part] = {};
          node = node[part];
        }
      });
    });
    // Then render the tree
    const renderNode = (node, path = '', isRoot = false) => {
      let entries = Object.entries(node);
      // No sorting, preserve original order
      return (
        <ul className="file-list" style={{ marginLeft: path ? 16 : 0 }}>
          {entries.map(([name, child]) => {
            if (typeof name !== 'string') return null;
            const fullPath = path + name;
            const isFolder = child && typeof child === 'object' && child !== null && !Array.isArray(child);
            if (isFolder) {
              const isOpen = !!openFolders[fullPath];
              return (
                <li key={fullPath} style={{ fontWeight: 600, color: '#4fc3f7', marginBottom: 2, position: 'relative' }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => setOpenFolders(f => ({ ...f, [fullPath]: !f[fullPath] }))}
                    onContextMenu={e => {
                      e.preventDefault();
                      setFolderMenu({ path: fullPath, anchor: { x: e.clientX, y: e.clientY } });
                    }}
                  >
                    <img
                      src={isOpen ? '/dowwnarrow.png' : '/righttarrow.png'}
                      alt={isOpen ? 'Down Arrow' : 'Right Arrow'}
                      style={{ width: 16, height: 16, marginRight: 4, userSelect: 'none', display: 'inline-block', verticalAlign: 'middle' }}
                    />
                    <img src={'/folder2.png'} alt="Folder" style={{ width: 16, height: 16, marginRight: 4, display: 'inline-block' }} />
                    {name}
                  </div>
                  {/* Dropdown menu for right-click */}
                  {folderMenu.path === fullPath && folderMenu.anchor && (
                    <div style={{
                      position: 'fixed',
                      left: folderMenu.anchor.x,
                      top: folderMenu.anchor.y,
                      background: '#23272e',
                      color: '#fff',
                      borderRadius: 6,
                      boxShadow: '0 2px 12px #0008',
                      minWidth: 120,
                      zIndex: 1000,
                      border: '1px solid #222',
                      padding: '4px 0',
                    }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div
                        style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem', borderBottom: '1px solid #333' }}
                        onClick={() => {
                          handleAddFile(fullPath + '/');
                          setFolderMenu({ path: null, anchor: null });
                        }}
                      >New File</div>
                      <div
                        style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem', borderBottom: '1px solid #333' }}
                        onClick={() => {
                          handleAddFolder(fullPath + '/');
                          setFolderMenu({ path: null, anchor: null });
                        }}
                      >New Folder</div>
                      <div
                        style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem', color: '#e57373' }}
                        onClick={() => {
                          handleDeleteFolder(fullPath + '/', { stopPropagation: () => {} });
                          setFolderMenu({ path: null, anchor: null });
                        }}
                      >Delete</div>
                    </div>
                  )}
                  {isOpen && (
                    <div style={{ marginLeft: 16 }}>
                      {renderNode(child, fullPath + '/')}
                    </div>
                  )}
                </li>
              );
            } else {
              return (
                <li
                  key={fullPath}
                  className={`file-item${fullPath === currentFile ? ' active' : ''}`}
                  onClick={() => openFile(fullPath)}
                  onContextMenu={e => {
                    e.preventDefault();
                    setFileMenu({ path: fullPath, anchor: { x: e.clientX, y: e.clientY } });
                  }}
                  style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                >
                  <span style={{ marginRight: 4, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={getFileIcon(name)} alt={getFileExtension(name) + ' file'} style={{ width: 16, height: 16 }} />
                  </span>
                  {name}
                  {/* Dropdown menu for right-click on file */}
                  {fileMenu.path === fullPath && fileMenu.anchor && (
                    <div style={{
                      position: 'fixed',
                      left: fileMenu.anchor.x,
                      top: fileMenu.anchor.y,
                      background: '#23272e',
                      color: '#fff',
                      borderRadius: 6,
                      boxShadow: '0 2px 12px #0008',
                      minWidth: 120,
                      zIndex: 1000,
                      border: '1px solid #222',
                      padding: '4px 0',
                    }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div
                        style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem', color: '#e57373' }}
                        onClick={e => {
                          handleDeleteFile(fullPath, e);
                          setFileMenu({ path: null, anchor: null });
                        }}
                      >Delete</div>
                    </div>
                  )}
                </li>
              );
            }
          })}
        </ul>
      );
    };
    return renderNode(tree, '', true);
  };

  const renderSidebarPanel = () => {
    if (activeSidebar === 'explorer') {
      return (
        <div className="explorer">
          <div className="explorer-header">
            <span className="explorer-title">Files</span>
            <button className="add-btn" title="New File or Folder" onClick={handleAddFile}>+</button>
            <button className="add-btn" title="New Folder" onClick={handleAddFolder} style={{marginLeft:4}}><img src={'/folder2.png'} alt="Folder" style={{ width: 16, height: 16, marginRight: 4, display: 'inline-block', verticalAlign: 'middle', marginBottom: '-2px' }} /></button>
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
    <span style={{fontWeight:600}}>{String(r.file)}</span> {/* Ensure file name is string */}
    <span style={{color:'#bdbdbd',fontSize:'0.9em',marginLeft:4}}>
      {String(r.snippet || '')}... {/* Ensure snippet is string */}
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
          <div className="explorer-title">Source Control</div>
          <div style={{padding:'12px',color:'#bdbdbd'}}>Git integration coming soon!</div>
        </div>
      );
    }
    return null;
  };

  const isVisualPreview = (file, code) => {
    if (!file) return false;
    if (file.endsWith('.html')) return true;
    if (file.endsWith('.jsx')) return true;
    if (file.endsWith('.js') && /export\s+default\s+function|class|const|let|var/.test(code) && /return\s*\(.*<.*>/.test(code)) return true;
    return false;
  };

  const renderSettingsMenu = () => (
    <div className="settings-menu">
      <div className="menu-item" onClick={() => { setShowCommandPalette(true); setShowSettingsPanel(false); setShowExtensionsPanel(false); setShowShortcutsPanel(false); setShowSnippetsPanel(false); setShowThemesPanel(false); }}>Command Palette... <span style={{color:'#bdbdbd'}}>Ctrl+Shift+P</span></div>
      <div className="menu-separator"></div>
      <div className="menu-item" onClick={() => { setShowSettingsPanel(true); setShowCommandPalette(false); setShowExtensionsPanel(false); setShowShortcutsPanel(false); setShowSnippetsPanel(false); setShowThemesPanel(false); }}>Settings <span style={{color:'#bdbdbd'}}>Ctrl+,</span></div>
      <div className="menu-item" onClick={() => { setShowExtensionsPanel(true); setShowSettingsPanel(false); setShowCommandPalette(false); setShowShortcutsPanel(false); setShowSnippetsPanel(false); setShowThemesPanel(false); }}>Extensions <span style={{color:'#bdbdbd'}}>Ctrl+Shift+X</span></div>
      <div className="menu-item" onClick={() => { setShowShortcutsPanel(true); setShowSettingsPanel(false); setShowCommandPalette(false); setShowExtensionsPanel(false); setShowSnippetsPanel(false); setShowThemesPanel(false); }}>Keyboard Shortcuts <span style={{color:'#bdbdbd'}}>Ctrl+K Ctrl+S</span></div>
      <div className="menu-item" onClick={() => { setShowSnippetsPanel(true); setShowSettingsPanel(false); setShowCommandPalette(false); setShowExtensionsPanel(false); setShowShortcutsPanel(false); setShowThemesPanel(false); }}>User Snippets</div>
      <div className="menu-item" onClick={() => { setShowThemesPanel(true); setShowSettingsPanel(false); setShowCommandPalette(false); setShowExtensionsPanel(false); setShowShortcutsPanel(false); setShowSnippetsPanel(false); }}>Themes &gt;</div>
    </div>
  );

  // Handler functions must be defined before commands array
  const handleGoLive = async () => {
    await saveFile();
    const res = await axios.post('/api/go-live');
    setLiveStatus(res.data);
    if (currentFile && currentFile.endsWith('.html')) {
      window.open(`http://localhost:5500/${currentFile}`, '_blank');
    } else {
      window.open('http://localhost:5500/', '_blank');
    }
  };

  const handleStopLive = async () => {
    const res = await axios.post('/api/stop-live');
    setLiveStatus(res.data);
  };

  const terminalRef = useRef(null);

  // Restore original Run button logic
  const handleRun = async () => {
    if (!currentFile.endsWith('.js') && !currentFile.endsWith('.jsx') && !currentFile.endsWith('.py') && !currentFile.endsWith('.html')) {
      setRunOutput('Only .js, .jsx, .py, or .html files can be run.');
      return;
    }
    await saveFile();
    setLastRunCode(code);
    setLastRunFile(currentFile);
    if (currentFile.endsWith('.js') || currentFile.endsWith('.jsx') || currentFile.endsWith('.py')) {
      const res = await axios.post('/api/run', { name: currentFile });
      setRunOutput(res.data.output);
    } else {
      setRunOutput('');
    }
  };

  // Command palette: run file in terminal for .js only
  const runFileInTerminal = async () => {
    if (!currentFile.endsWith('.js')) {
      if (!showTerminal) setShowTerminal(true);
      setTimeout(() => {
        if (terminalRef.current) terminalRef.current.writeToTerminal('Only .js files can be run in terminal via command palette.\r\n');
      }, 200);
      return;
    }
    await saveFile();
    if (!showTerminal) setShowTerminal(true);
    const res = await axios.post('/api/run', { name: currentFile });
    // Wait a bit to ensure terminal is mounted
    setTimeout(() => {
      if (terminalRef.current) terminalRef.current.writeToTerminal((res.data.output || '') + '\r\n');
    }, 200);
  };

  // List of available commands (now after handlers)
  const commands = [
    { id: 'open-settings', label: 'Open Settings', action: () => setShowSettingsPanel(true) },
    { id: 'go-live', label: 'Go Live', action: handleGoLive },
    { id: 'stop-live', label: 'Stop Live', action: handleStopLive },
    { id: 'run-file', label: 'Run Current File', action: runFileInTerminal },
    { id: 'open-terminal', label: 'Open Terminal', action: () => setShowTerminal(true) },
    { id: 'close-terminal', label: 'Close Terminal', action: () => setShowTerminal(false) },
    { id: 'open-extensions', label: 'Open Extensions', action: () => setShowExtensionsPanel(true) },
    { id: 'open-keyboard-shortcuts', label: 'Open Keyboard Shortcuts', action: () => setShowShortcutsPanel(true) },
    { id: 'open-snippets', label: 'Open User Snippets', action: () => setShowSnippetsPanel(true) },
    { id: 'open-themes', label: 'Open Themes', action: () => setShowThemesPanel(true) },
    { id: 'focus-explorer', label: 'Focus File Explorer', action: () => setActiveSidebar('explorer') },
    { id: 'focus-search', label: 'Focus Search', action: () => setActiveSidebar('search') },
    { id: 'focus-source', label: 'Focus Source Control', action: () => setActiveSidebar('source') },
    // Add more commands as needed
  ];

  // Fuzzy filter commands
  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(commandSearch.toLowerCase())
  );

  // Keyboard navigation for command palette
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

  // Focus input when palette opens
  useEffect(() => {
    if (showCommandPalette && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [showCommandPalette]);

  // Open palette with Ctrl+Shift+P
  useEffect(() => {
    const globalPaletteHandler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        setShowCommandPalette(true);
        setCommandSearch('');
        setCommandIndex(0);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', globalPaletteHandler);
    return () => window.removeEventListener('keydown', globalPaletteHandler);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setShowMainApp(true);
      console.log('Running in standalone mode');
    }
    // Check for manifest
    const manifestEl = document.querySelector('link[rel="manifest"]');
    if (manifestEl) {
      console.log('Manifest found:', manifestEl.href);
    } else {
      console.warn('Manifest NOT found in index.html!');
    }
    // Listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
      console.log('beforeinstallprompt event fired');
    };
    window.addEventListener('beforeinstallprompt', handler);
    // Listen for appinstalled
    window.addEventListener('appinstalled', () => {
      console.log('App was installed');
      setShowInstallButton(false);
    });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      console.log('Prompting PWA install');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('User choice:', outcome);
      if (outcome === 'accepted') {
        setShowInstallButton(false);
        setShowMainApp(true);
      }
      setDeferredPrompt(null);
    } else {
      console.log('No deferredPrompt available');
    }
  };

  // Close folder menu on click outside
  useEffect(() => {
    const closeMenu = () => setFolderMenu({ path: null, anchor: null });
    if (folderMenu.path) {
      window.addEventListener('click', closeMenu);
      return () => window.removeEventListener('click', closeMenu);
    }
  }, [folderMenu]);

  // Close file menu on click outside
  useEffect(() => {
    const closeMenu = () => setFileMenu({ path: null, anchor: null });
    if (fileMenu.path) {
      window.addEventListener('click', closeMenu);
      return () => window.removeEventListener('click', closeMenu);
    }
  }, [fileMenu]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [explorerOpen, setExplorerOpen] = useState(true);

  if (!showMainApp) {
    return <LandingPage onInstall={handleInstallClick} showInstallButton={showInstallButton} />;
  }

  return (
    <div className="app-root" style={{background:'#181a1b', color:'#fff', minHeight:'100vh'}}>
      {/* Show Download button only if install is available */}
      {showInstallButton && deferredPrompt && (
        <button onClick={handleInstallClick} style={{position: 'fixed', top: 16, right: 16, zIndex: 1000, padding: '10px 20px', background: '#181a1b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'}}>Download App</button>
      )}
      {/* Fallback message if install is not available and not running as PWA */}
      {!showInstallButton && !window.matchMedia('(display-mode: standalone)').matches && (
        <div style={{position: 'fixed', top: 16, right: 16, zIndex: 1000, color: '#fff', background: '#333', padding: 10, borderRadius: 6}}>
          To install, use your browser's install or Add to Home Screen option.
        </div>
      )}
      <div className="topbar">
        <span style={{fontWeight:600, fontSize:'1.15rem'}}>CLIKK</span>
        <span style={{color:'#4fc3f7', fontWeight:400, fontSize:'1rem', marginLeft:12}}>&bull; Demo Project</span>
      </div>
      <div className="main-content" style={{display:'flex', height:'calc(100vh - 48px)'}}>
        <div className="sidebar">
          {SIDEBAR_ICONS.filter(icon => icon.key !== 'settings').map(icon => (
            <div
              key={icon.key}
              className={`sidebar-icon${activeSidebar === icon.key ? ' active' : ''}`}
              title={icon.title}
              onClick={() => {
                if (icon.key === 'explorer') {
                  if (activeSidebar === 'explorer' && explorerOpen) {
                    setExplorerOpen(false);
                    return;
                  } else {
                    setExplorerOpen(true);
                  }
                } else {
                  setExplorerOpen(true);
                }
                setActiveSidebar(icon.key);
                setShowSettings(false);
                if (icon.key === 'terminal') setShowTerminal(true);
              }}
            >
              {icon.svg}
            </div>
          ))}
            {/* Move settings icon up for visibility */}
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
            {showSettings && renderSettingsMenu()}
          </div>
        {/* Only show explorer panel if explorerOpen and activeSidebar is explorer */}
        {activeSidebar === 'explorer' && explorerOpen && renderSidebarPanel()}
        {activeSidebar !== 'explorer' && renderSidebarPanel()}
        <div className="editor-preview-container" style={{flex:1, display:'flex', flexDirection:'column', background:'#23272e'}}>
          <div className="editor-area" style={{flex:1, background:'#23272e', display:'flex', flexDirection:'column'}}>
            <div className="tabbar">
              {openTabs.map(f => (
                <div
                  key={f}
                  className={`tab${f === currentFile ? ' active' : ''}`}
                  onClick={() => openFile(f)}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                 <span style={{ marginRight: 4, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   {f.endsWith('/') ? (
                     <img src="/folder2.png" alt="Folder" style={{ width: 16, height: 16 }} />
                   ) : (
                     <img src={getFileIcon(f)} alt={getFileExtension(f) + ' file'} style={{ width: 16, height: 16 }} />
                   )}
                 </span>
                  {f}
                  <span
                    className="close"
                    onClick={e => closeTab(f, e)}
                  >×</span>
                </div>
              ))}
            </div>
            {/* Run button added here */}
            <button
              onClick={handleRun}
              disabled={!(currentFile && (currentFile.endsWith('.js') || currentFile.endsWith('.jsx') || currentFile.endsWith('.py') || currentFile.endsWith('.html')))}
              style={{
                margin: '8px 0 0 12px',
                alignSelf: 'flex-start',
                padding: '6px 18px',
                background: '#4fc3f7',
                color: '#181a1b',
                border: 'none',
                borderRadius: 4,
                fontWeight: 600,
                fontSize: '1rem',
                cursor: (currentFile && (currentFile.endsWith('.js') || currentFile.endsWith('.jsx') || currentFile.endsWith('.py') || currentFile.endsWith('.html'))) ? 'pointer' : 'not-allowed',
                opacity: (currentFile && (currentFile.endsWith('.js') || currentFile.endsWith('.jsx') || currentFile.endsWith('.py') || currentFile.endsWith('.html'))) ? 1 : 0.5
              }}
            >
              ▶ Run
            </button>
            <div style={{flex:1, display:'flex', flexDirection:'column', background:'#23272e'}}>
              {currentFile && currentFile.endsWith('.html') ? (
                <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                  <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                    <MonacoEditor
                      height="100%"
                      language="html"
                      value={code || ''}
                      onChange={(value) => setCode(value || '')}
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
                        formatOnType: true,
                        formatOnSave: true,
                        autoClosingBrackets: 'always',
                        autoClosingQuotes: 'always',
                        autoClosingDoubleQuotes: 'always',
                        autoClosingTripleQuotes: 'always',
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        background: '#23272e',
                      }}
                    />
                  </div>
                  {/* Removed Sandpack and iframe preview for HTML files */}
                </div>
              ) : isVisualPreview(currentFile, code) ? (
                <Sandpack
                  template="react"
                  theme="dark"
                  files={{
                    '/App.js': {
                      code: code
                    }
                  }}
                  options={{
                    visibleFiles: ['/App.js'],
                    activeFile: '/App.js'
                  }}
                />
              ) : (
                <MonacoEditor
                  height="100%"
                  language={getLanguage(currentFile)}
                  defaultLanguage={getLanguage(currentFile)}
                  value={code || ''}
                  onChange={(value) => setCode(value || '')}
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
                    formatOnType: true,
                    formatOnSave: true,
                    autoClosingBrackets: 'always',
                    autoClosingQuotes: 'always',
                    autoClosingDoubleQuotes: 'always',
                    autoClosingTripleQuotes: 'always',
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    background: '#23272e',
                  }}
                />
              )}
            </div>
            {/* Output panel for Run button */}
            <div style={{
              background: '#111',
              color: '#fff',
              fontFamily: 'Fira Mono, monospace',
              fontSize: '1rem',
              padding: '10px 16px',
              minHeight: '60px',
              maxHeight: '180px',
              overflow: 'auto',
              borderRadius: '4px',
              margin: '12px'
            }}>
              <strong>Output:</strong>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{runOutput ? runOutput : 'No output yet. Click ▶ Run to see results here.'}</pre>
            </div>
          </div>
          {/* Terminal always at the bottom */}
          {showTerminal && (
            <div style={{height:'200px', background:'#181a1b', borderTop:'1px solid #333', color:'#fff'}}>
              <TerminalPanel ref={terminalRef} />
            </div>
          )}
        </div>
      </div>
      {/* Bottom status bar with Go Live/Stop Live */}
      <div style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: 36,
        background: '#23272e',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px',
        borderTop: '1px solid #333',
        zIndex: 1001
      }}>
        <span style={{marginRight: 16, color: liveStatus.running ? '#4fc3f7' : '#aaa'}}>
          {liveStatus.running ? 'Port : 5500 (Live)' : 'Go Live stopped'}
        </span>
        <button
          onClick={handleGoLive}
          disabled={liveStatus.running}
          style={{
            marginRight: 8,
            background: liveStatus.running ? '#444' : '#4fc3f7',
            color: '#181a1b',
            border: 'none',
            borderRadius: 4,
            padding: '6px 18px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: liveStatus.running ? 'not-allowed' : 'pointer',
            opacity: liveStatus.running ? 0.6 : 1
          }}
        >
          Go Live
        </button>
        <button
          onClick={handleStopLive}
          disabled={!liveStatus.running}
          style={{
            background: !liveStatus.running ? '#444' : '#e57373',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '6px 18px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: !liveStatus.running ? 'not-allowed' : 'pointer',
            opacity: !liveStatus.running ? 0.6 : 1
          }}
        >
          Stop Live
        </button>
      </div>
      {/* Settings Panel Modal */}
      {showSettingsPanel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.45)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setShowSettingsPanel(false)}
        >
          <div style={{
            background: '#23272e',
            color: '#fff',
            borderRadius: 10,
            minWidth: 340,
            minHeight: 220,
            padding: 32,
            boxShadow: '0 4px 32px #0008',
            position: 'relative',
          }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{marginTop:0, marginBottom:16}}>Settings</h2>
            <div style={{marginBottom:16}}>
              <label style={{fontWeight:600}}>Theme:</label>
              <select style={{marginLeft:12, padding:4, borderRadius:4, background:'#181a1b', color:'#fff', border:'1px solid #333'}} disabled>
                <option>Dark (default)</option>
                <option>Light</option>
              </select>
              <span style={{marginLeft:8, color:'#888', fontSize:'0.95em'}}>(coming soon)</span>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontWeight:600}}>Font Size:</label>
              <input type="number" min="10" max="32" value={14} style={{marginLeft:12, width:48, padding:4, borderRadius:4, background:'#181a1b', color:'#fff', border:'1px solid #333'}} disabled />
              <span style={{marginLeft:8, color:'#888', fontSize:'0.95em'}}>(coming soon)</span>
            </div>
            <button onClick={() => setShowSettingsPanel(false)} style={{position:'absolute', top:12, right:16, background:'none', color:'#fff', border:'none', fontSize:22, cursor:'pointer'}}>×</button>
          </div>
        </div>
      )}
      {/* Command Palette Modal (fully functional) */}
      {showCommandPalette && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        }} onClick={() => setShowCommandPalette(false)}>
          <div style={{ background: '#23272e', color: '#fff', borderRadius: 10, minWidth: 440, minHeight: 60, marginTop: 80, padding: 0, boxShadow: '0 4px 32px #0008', position: 'relative', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <input
              ref={commandInputRef}
              type="text"
              placeholder="Type a command..."
              value={commandSearch}
              onChange={e => { setCommandSearch(e.target.value); setCommandIndex(0); }}
              style={{width:'100%',padding:16,border:'none',outline:'none',background:'#181a1b',color:'#fff',fontSize:'1.15rem',boxSizing:'border-box'}}
            />
            <div style={{maxHeight: 320, overflowY: 'auto'}}>
              {filteredCommands.length === 0 && (
                <div style={{padding: '18px 24px', color:'#888'}}>No matching commands</div>
              )}
              {filteredCommands.map((cmd, i) => (
                <div
                  key={cmd.id}
                  style={{
                    padding: '14px 24px',
                    background: i === commandIndex ? '#333' : 'none',
                    color: i === commandIndex ? '#4fc3f7' : '#fff',
                    fontWeight: i === commandIndex ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: '1.08rem',
                    borderBottom: '1px solid #222',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={() => setCommandIndex(i)}
                  onClick={() => {
                    cmd.action();
                    setShowCommandPalette(false);
                    setCommandSearch('');
                    setCommandIndex(0);
                  }}
                >
                  {cmd.label}
                </div>
              ))}
            </div>
            <button onClick={() => setShowCommandPalette(false)} style={{position:'absolute', top:10, right:16, background:'none', color:'#fff', border:'none', fontSize:22, cursor:'pointer'}}>×</button>
          </div>
        </div>
      )}
      {/* Extensions Modal */}
      {showExtensionsPanel && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', }} onClick={() => setShowExtensionsPanel(false)}>
          <div style={{ background: '#23272e', color: '#fff', borderRadius: 10, minWidth: 400, minHeight: 120, padding: 32, boxShadow: '0 4px 32px #0008', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop:0, marginBottom:16}}>Extensions</h2>
            <div style={{color:'#888'}}>Extensions management coming soon!</div>
            <button onClick={() => setShowExtensionsPanel(false)} style={{position:'absolute', top:12, right:16, background:'none', color:'#fff', border:'none', fontSize:22, cursor:'pointer'}}>×</button>
          </div>
        </div>
      )}
      {/* Keyboard Shortcuts Modal */}
      {showShortcutsPanel && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', }} onClick={() => setShowShortcutsPanel(false)}>
          <div style={{ background: '#23272e', color: '#fff', borderRadius: 10, minWidth: 400, minHeight: 120, padding: 32, boxShadow: '0 4px 32px #0008', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop:0, marginBottom:16}}>Keyboard Shortcuts</h2>
            <div style={{color:'#888'}}>Shortcuts list coming soon!</div>
            <button onClick={() => setShowShortcutsPanel(false)} style={{position:'absolute', top:12, right:16, background:'none', color:'#fff', border:'none', fontSize:22, cursor:'pointer'}}>×</button>
          </div>
        </div>
      )}
      {/* User Snippets Modal */}
      {showSnippetsPanel && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', }} onClick={() => setShowSnippetsPanel(false)}>
          <div style={{ background: '#23272e', color: '#fff', borderRadius: 10, minWidth: 400, minHeight: 120, padding: 32, boxShadow: '0 4px 32px #0008', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop:0, marginBottom:16}}>User Snippets</h2>
            <div style={{color:'#888'}}>Snippets management coming soon!</div>
            <button onClick={() => setShowSnippetsPanel(false)} style={{position:'absolute', top:12, right:16, background:'none', color:'#fff', border:'none', fontSize:22, cursor:'pointer'}}>×</button>
          </div>
        </div>
      )}
      {/* Themes Modal */}
      {showThemesPanel && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', }} onClick={() => setShowThemesPanel(false)}>
          <div style={{ background: '#23272e', color: '#fff', borderRadius: 10, minWidth: 400, minHeight: 120, padding: 32, boxShadow: '0 4px 32px #0008', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop:0, marginBottom:16}}>Themes</h2>
            <div style={{color:'#888'}}>Theme selection coming soon!</div>
            <button onClick={() => setShowThemesPanel(false)} style={{position:'absolute', top:12, right:16, background:'none', color:'#fff', border:'none', fontSize:22, cursor:'pointer'}}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}