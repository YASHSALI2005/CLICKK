import React, { useState, useEffect } from 'react';
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

  // Load file list
  useEffect(() => {
    axios.get('http://localhost:5000/api/files').then(res => {
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
    axios.post('http://localhost:5000/api/file', { name: currentFile, content: code });
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
    axios.get('http://localhost:5000/api/file', { params: { name } })
      .then(res => setCode(res.data.content));
    setRunOutput('');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const results = [];
    for (const file of files) {
      const res = await axios.get('http://localhost:5000/api/file', { params: { name: file } });
      const content = res.data.content;
      if (content && content.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({ file, snippet: content.substr(content.toLowerCase().indexOf(searchQuery.toLowerCase()), 60) });
      }
    }
    setSearchResults(results);
  };

  const handleRun = async () => {
    if (!currentFile.endsWith('.js') && !currentFile.endsWith('.jsx') && !currentFile.endsWith('.py') && !currentFile.endsWith('.html')) {
      setRunOutput('Only .js, .jsx, .py, or .html files can be run.');
      return;
    }
    await saveFile();
    setLastRunCode(code);
    setLastRunFile(currentFile);
    if (currentFile.endsWith('.js') || currentFile.endsWith('.jsx') || currentFile.endsWith('.py')) {
      const res = await axios.post('http://localhost:5000/api/run', { name: currentFile });
      console.log('Run output:', res.data.output); // Debug log
      setRunOutput(res.data.output);
    } else {
      setRunOutput('');
    }
  };

  const handleDeleteFile = async (name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete file '${name}'?`)) return;
    await axios.delete(`http://localhost:5000/api/file?name=${encodeURIComponent(name)}`);
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
    await axios.post('http://localhost:5000/api/file', { name: fullPath, content: '' });
    axios.get('http://localhost:5000/api/files').then(res => {
      const filtered = res.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]'));
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
      await axios.post('http://localhost:5000/api/file', { name: folderPath, content: '' });
      const res = await axios.get('http://localhost:5000/api/files');
      setFiles(res.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')));
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder');
    }
  };

  const handleDeleteFolder = async (name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete folder '${name}' and all its contents?`)) return;
    await axios.delete(`http://localhost:5000/api/file?name=${encodeURIComponent(name)}`);
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
    const renderNode = (node, path = '') => (
      <ul className="file-list" style={{ marginLeft: path ? 16 : 0 }}>
        {Object.entries(node).map(([name, child]) => {
          if (typeof name !== 'string') return null;
          const fullPath = path + name;
          const isFolder = child && typeof child === 'object' && child !== null && !Array.isArray(child);
          return isFolder ? (
            <li key={fullPath} style={{ fontWeight: 600, color: '#4fc3f7', marginBottom: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={'/folder2.png'} alt="Folder" style={{ width: 16, height: 16, marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} />
                {name}
                <button
                  className="add-btn"
                  title="Add File"
                  style={{marginLeft: 6, fontSize: '1em', padding: '0 6px', height: 22, width: 22}}
                  onClick={e => { e.stopPropagation(); handleAddFile(fullPath + '/'); }}
                >
                  +
                </button>
                <button
                  className="add-btn"
                  title="Add Folder"
                  style={{marginLeft: 2, fontSize: '1em', padding: '0 6px', height: 22, width: 22}}
                  onClick={e => { e.stopPropagation(); handleAddFolder(String(fullPath) + '/'); }}
                >
                <img src={'/folder2.png'} alt="Folder" style={{ width: 16, height: 16, marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} />
                </button>
                <span
                  title="Delete folder"
                  style={{marginLeft:8, color:'#e57373', cursor:'pointer', fontSize:'1.1em'}} 
                  onClick={e => handleDeleteFolder(fullPath + '/', e)}
                >
                  <img src={'/delete.png'} alt="Delete Folder" style={{ width: 16, height: 16, marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} />
                </span>
              </div>
              <div style={{ marginLeft: 16 }}>
                {renderNode(child, fullPath + '/')}
              </div>
            </li>
          ) : (
            <li
              key={fullPath}
              className={`file-item${fullPath === currentFile ? ' active' : ''}`}
              onClick={() => openFile(fullPath)}
            >
              <span style={{marginRight: 4, width: 16, height: 16, display: 'inline-block'}}>
                <img src={getFileIcon(name)} alt={getFileExtension(name) + ' file'} style={{ width: 16, height: 16, verticalAlign: 'middle' }} />
              </span>
              {name}
              <span
                title="Delete file"
                style={{marginLeft:8, color:'#e57373', cursor:'pointer', fontSize:'1.1em'}} 
                onClick={e => handleDeleteFile(fullPath, e)}
              >
              <img src={'/delete.png'} alt="Folder" style={{ width: 16, height: 16, marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} />
              </span>
            </li>
          );
        })}
      </ul>
    );
    return renderNode(tree);
  };

  const renderSidebarPanel = () => {
    if (activeSidebar === 'explorer') {
      return (
        <div className="explorer">
          <div className="explorer-header">
            <span className="explorer-title">Files</span>
            <button className="add-btn" title="New File or Folder" onClick={handleAddFile}>+</button>
            <button className="add-btn" title="New Folder" onClick={handleAddFolder} style={{marginLeft:4}}><img src={'/folder2.png'} alt="Folder" style={{ width: 16, height: 16, marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} /></button>
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
      <div className="menu-item">Command Palette... <span style={{color:'#bdbdbd'}}>Ctrl+Shift+P</span></div>
      <div className="menu-separator"></div>
      <div className="menu-item">Settings <span style={{color:'#bdbdbd'}}>Ctrl+,</span></div>
      <div className="menu-item">Extensions <span style={{color:'#bdbdbd'}}>Ctrl+Shift+X</span></div>
      <div className="menu-item">Keyboard Shortcuts <span style={{color:'#bdbdbd'}}>Ctrl+K Ctrl+S</span></div>
      <div className="menu-item">User Snippets</div>
      <div className="menu-item">Themes &gt;</div>
    </div>
  );

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
                setActiveSidebar(icon.key);
                setShowSettings(false);
                // If the user clicks a terminal icon, show the terminal
                if (icon.key === 'terminal') setShowTerminal(true);
              }}
            >
              {icon.svg}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12 }}>
            <img src="/icon.png" alt="User" style={{ width: 32, height: 32, borderRadius: 8, marginBottom: 8, border: '1.5px solid #333', background: '#23272e' }} />
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
          </div>
          {showSettings && renderSettingsMenu()}
        </div>
        {renderSidebarPanel()}
        <div className="editor-preview-container" style={{flex:1, display:'flex', flexDirection:'column', background:'#23272e'}}>
          <div className="editor-area" style={{flex:1, background:'#23272e', display:'flex', flexDirection:'column'}}>
            <div className="tabbar">
              {openTabs.map(f => (
                <div
                  key={f}
                  className={`tab${f === currentFile ? ' active' : ''}`}
                  onClick={() => openFile(f)}
                >
                 <span style={{marginRight: 4, width: 14, height: 14, display: 'inline-block'}}>
  <FileIcon extension={getFileExtension(f)} {...(defaultStyles[getFileExtension(f)] || {})} />
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
                  <div style={{ flex: 1, minWidth: 0, minHeight: 0, borderLeft: '2px solid #222', background: '#fff' }}>
                    <iframe
                      title="HTML Preview"
                      srcDoc={code}
                      style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                    />
                  </div>
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
              <TerminalPanel output={runOutput} onRun={handleRun} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}