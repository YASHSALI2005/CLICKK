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
    key: 'ai',
    title: 'AI Assistant',
    svg: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h6"/></svg>
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
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09c0 .66.38 1.26 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.36.36.57.86.6 1.39V9a2 2 0 1 1 0 4h-.09c-.03.53-.24 1.03-.6 1.39z"/></svg>
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
  if (filename.endsWith('.jsx')) return 'React';
  if (filename.endsWith('.ts')) return 'typescript';
  if (filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.html')) return 'html';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.java')) return 'java';
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
  if (ext === 'jsx') return '/icons/file_type_reactjs.svg';
  if (ext === 'json') return '/icons/file_type_json.svg';
  if (ext === 'md') return '/icons/file_type_markdown.svg';
  if (ext === 'java') return '/icons/file_type_java.svg';
  if (ext === 'ts' || ext === 'tsx') return '/icons/file_type_tsconfig.svg';
  // fallback generic file icon
  return '/icons/folder_type_template.svg';
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
  const [showTerminal, setShowTerminal] = useState(true);
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
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [showTasksPanel, setShowTasksPanel] = useState(false);
  const [tasksSearch, setTasksSearch] = useState('');
  const [tasksIndex, setTasksIndex] = useState(0);
  const [shortcutsSearch, setShortcutsSearch] = useState('');
  const taskTemplates = [
    { id:'msbuild', title:'MSBuild', desc:'Executes the build target', cmd:'echo msbuild (placeholder)' },
    { id:'maven', title:'maven', desc:'Executes common maven commands', cmd:'mvn -v' },
    { id:'dotnet', title:'.NET Core', desc:'Executes .NET Core build command', cmd:'dotnet --info' },
    { id:'others', title:'Others', desc:'Example to run an arbitrary external command', cmd:'echo Hello from task' }
  ];
  const themes = [
    { id: 'dark', name: 'Dark+ (default dark)', description: 'Default Dark Visual Studio Code theme' },
    { id: 'light', name: 'Light+ (default light)', description: 'Default Light Visual Studio Code theme' }
  ];
  const [openFolders, setOpenFolders] = useState({});
  const [folderMenu, setFolderMenu] = useState({ path: null, anchor: null });
  const [fileMenu, setFileMenu] = useState({ path: null, anchor: null });
  const [recentFiles, setRecentFiles] = useState([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [profiles, setProfiles] = useState([
    { id: 'default', name: 'Default', isActive: true, isDefault: false }
  ]);
  const [activeProfile, setActiveProfile] = useState('default');
  const [profileContents, setProfileContents] = useState('contents');
  const [profileFolders, setProfileFolders] = useState([
    { host: 'Local', path: 'C:\\' },
    { host: 'Local', path: 'C:\\Users\\Tejas' },
    { host: 'Local', path: 'C:\\Users\\Tejas\\.spyder-py3\\speech_recognition\\Visaul_studio' },
    { host: 'Local', path: 'C:\\Users\\Tejas\\.vscode\\extensions\\ms-python.debugpy-2024.4.0-win32-x64\\bundled\\libs\\debugpy\\l...' },
    { host: 'Local', path: 'C:\\users\\tejas\\appdata\\roaming\\python\\python312\\site-packages' },
    { host: 'Local', path: 'C:\\Users\\Tejas\\AppData\\Roaming\\Python\\Python312\\site-packages\\virtual-Mouse' },
    { host: 'Local', path: 'C:\\Users\\Tejas\\Desktop\\CSS' },
    { host: 'Local', path: 'C:\\Users\\Tejas\\Desktop\\New folder' },
    { host: 'Local', path: 'C:\\Users\\Tejas\\Desktop\\React-folder' },
    { host: 'Local', path: 'C:\\Users\\Tejas\\Desktop\\React-folder\\Flutter' }
  ]);
  const [notification, setNotification] = useState('');
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [activeBottomTab, setActiveBottomTab] = useState('terminal');
  const terminalContainerRef = useRef(null);
  const isResizingRef = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [terminals, setTerminals] = useState([]);
  const [activeTerminal, setActiveTerminal] = useState(null);
  const [isSplitView, setIsSplitView] = useState(false); // New state for split view
  const [autoSave, setAutoSave] = useState(true);
  const [isAIAssistantVisible, setIsAIAssistantVisible] = useState(true);
  const [wordWrapEnabled, setWordWrapEnabled] = useState(true);
  const [editorInstance, setEditorInstance] = useState(null);
  const [recentlyUsedCommands, setRecentlyUsedCommands] = useState([]);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const terminalRefs = useRef(new Map());
  const [profileContextMenu, setProfileContextMenu] = useState({ show: false, profileId: null, x: 0, y: 0 });
  
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2000);
  };

  const isView = (name) => typeof name === 'string' && name.startsWith('@view:');
  const getViewLabel = (name) => {
    const map = {
      '@view:settings': 'Settings',
      '@view:shortcuts': 'Keyboard Shortcuts',
      '@view:extensions': 'Extensions',
      '@view:snippets': 'User Snippets',
      '@view:tasks': 'Tasks',
      '@view:preferences': 'Preferences'
    };
    return map[name] || name;
  };
  const applyTheme = (themeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('vscode-theme', themeId);
  };
  const openView = (key) => {
    if (key === 'themes') {
      setShowThemesPanel(true);
      return;
    }
    if (key === 'preferences') {
      setShowPreferences(true);
      return;
    }
    const viewName = key.startsWith('@view:') ? key : `@view:${key}`;
    setCurrentFile(viewName);
    setRunOutput('');
    setOpenTabs((prev) => (prev.includes(viewName) ? prev : [...prev, viewName]));
  };

  const createNewProfile = () => {
    const name = prompt('Enter profile name:');
    if (!name) return;
    const newProfile = {
      id: `profile_${Date.now()}`,
      name: name,
      isActive: false,
      isDefault: false
    };
    setProfiles(prev => [...prev, newProfile]);
  };

  const setProfileAsDefault = (profileId) => {
    setProfiles(prev => prev.map(p => ({
      ...p,
      isDefault: p.id === profileId
    })));
  };

  const activateProfile = (profileId) => {
    setActiveProfile(profileId);
    setProfiles(prev => prev.map(p => ({
      ...p,
      isActive: p.id === profileId
    })));
  };

  const deleteProfile = (profileId) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) return;
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    if (activeProfile === profileId) {
      const remainingProfiles = profiles.filter(p => p.id !== profileId);
      if (remainingProfiles.length > 0) {
        activateProfile(remainingProfiles[0].id);
      }
    }
  };

  const addFolderToProfile = () => {
    const path = prompt('Enter folder path:');
    if (!path) return;
    const newFolder = { host: 'Local', path: path };
    setProfileFolders(prev => [...prev, newFolder]);
  };

  const removeFolderFromProfile = (index) => {
    if (!window.confirm('Are you sure you want to remove this folder?')) return;
    setProfileFolders(prev => prev.filter((_, i) => i !== index));
  };

  const showProfileContextMenu = (e, profileId) => {
    e.preventDefault();
    setProfileContextMenu({
      show: true,
      profileId,
      x: e.clientX,
      y: e.clientY
    });
  };

  const hideProfileContextMenu = () => {
    setProfileContextMenu({ show: false, profileId: null, x: 0, y: 0 });
  };

  const duplicateProfile = (profileId) => {
    const originalProfile = profiles.find(p => p.id === profileId);
    if (!originalProfile) return;
    
    const newProfile = {
      id: `profile_${Date.now()}`,
      name: `${originalProfile.name} (Copy)`,
      isActive: false,
      isDefault: false
    };
    setProfiles(prev => [...prev, newProfile]);
    hideProfileContextMenu();
  };

  useEffect(() => {
    // Fetch files initially
    fetchFiles();
    
    // Set up WebSocket connection for file explorer updates
    const wsUrl = `ws://localhost:8081?workspace=${encodeURIComponent(workspace)}&type=explorer`;
    const socket = new window.WebSocket(wsUrl);
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'fileChange') {
          console.log('File change detected, refreshing file list');
          fetchFiles();
        }
      } catch (e) {
        // Ignore non-JSON messages (terminal output)
      }
    };
    
    return () => {
      socket.close();
    };
  }, [workspace]);
  
  // Function to fetch files
  const fetchFiles = () => {
    axios.get(`/api/files?workspace=${workspace}`).then(fileRes => {
      setFiles(fileRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')));
    });
  };
  
  // Add document click handler to close context menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside of context menus
      const isContextMenuClick = event.target.closest('[data-context-menu="true"]');
      if (!isContextMenuClick) {
        setFolderMenu({ path: null, anchor: null });
        setFileMenu({ path: null, anchor: null });
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load saved theme on app start
  useEffect(() => {
    const savedTheme = localStorage.getItem('vscode-theme') || 'dark';
    applyTheme(savedTheme);
  }, []);

  // Close profile context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (profileContextMenu.show) {
        hideProfileContextMenu();
      }
    };
    
    if (profileContextMenu.show) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [profileContextMenu.show]);

  useEffect(() => {
    if (files.length > 0 && !currentFile) {
      const firstRealFile = files.find(f => typeof f === 'string' && !f.endsWith('/'));
      if (firstRealFile) {
        openFile(firstRealFile);
      }
    }
  }, [files]);

  const saveFile = () => {
    if (!currentFile) return;
    if (isView(currentFile)) return;
    axios.post(`/api/file?workspace=${workspace}`, { name: currentFile, content: code });
  };

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
    // If a folder or a special view is selected, do not fetch from server
    if (typeof name === 'string' && (name.endsWith('/') || isView(name))) {
    setCurrentFile(name);
      setRunOutput('');
    if (!openTabs.includes(name)) setOpenTabs([...openTabs, name]);
      return;
    }
    setCurrentFile(name);
    if (!openTabs.includes(name)) setOpenTabs([...openTabs, name]);
    if (!isView(name)) {
    axios.get(`/api/file?workspace=${workspace}&name=${encodeURIComponent(name)}`)
      .then(fileRes => setCode(fileRes.data.content));
    setRecentFiles(prev => [name, ...prev.filter(f => f !== name)].slice(0, 10));
    }
    setRunOutput('');
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
  };

  const handleAddFile = async (parentPath = '') => {
    if (typeof parentPath !== 'string') parentPath = '';
    let name = prompt('Enter new file name (e.g. myfile.js):');
    if (!name) return;
    name = String(name).replace(/\\/g, '/').replace(/\/+$/, '').replace(/\//g, '').trim();
    if (!name) return;
    const fullPath = parentPath ? String(parentPath) + name : name;
    if (fullPath.startsWith('[object Object]')) {
      alert('Invalid file name.');
      return;
    }
    await axios.post(`/api/file?workspace=${workspace}`, { name: fullPath, content: '' });
    axios.get(`/api/files?workspace=${workspace}`).then(fileRes => {
      const filtered = fileRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]'));
      setFiles(filtered);
      setCurrentFile(fullPath);
      setOpenTabs(tabs => tabs.includes(fullPath) ? tabs : [...tabs, fullPath]);
      setCode('');
      setRunOutput('');
    });
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
    if (!parentPath && files.includes(name)) {
      alert('A file with this name already exists at the root. Please choose a different folder name.');
      return;
    }
    try {
      await axios.post(`/api/file?workspace=${workspace}`, { name: folderPath, content: '' });
      const folderRes = await axios.get(`/api/files?workspace=${workspace}`);
      setFiles(folderRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')));
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder');
    }
  };

  const handleDeleteFolder = async (name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete folder '${name}' and all its contents?`)) return;
    await axios.delete(`/api/file?workspace=${workspace}&name=${encodeURIComponent(name)}`);
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
    const folderNames = new Set(
      files.filter(f => typeof f === 'string' && f.endsWith('/')).map(f => f.slice(0, -1))
    );
    const filteredFiles = files.filter(f => {
      if (typeof f !== 'string') return false;
      if (!f.endsWith('/') && folderNames.has(f)) return false; 
      return true;
    });
    const tree = {};
    filteredFiles.forEach(f => {
      if (typeof f !== 'string') return;
      const parts = f.split('/').filter(Boolean);
      let node = tree;
      parts.forEach((part, i) => {
        if (typeof part !== 'string') return;
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
      let entries = Object.entries(node);
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
                      setFileMenu({ path: null, anchor: null });
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
                  {folderMenu.path === fullPath && folderMenu.anchor && (
                    <div 
                      data-context-menu="true"
                      style={{
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
                         style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '1rem', borderBottom: '1px solid #333' }}
                         onClick={() => {
                           setShowTerminal(true);
                           // If there are no terminals, create one
                           if (terminals.length === 0) {
                             const newId = 1;
                             setTerminals([{ id: newId, title: 'powershell' }]);
                             setActiveTerminal(newId);
                             // Need to wait for terminal to initialize before sending command
                             setTimeout(() => {
                               const term = terminalRefs.current.get(newId);
                               if (term) term.writeToTerminal(`cd "${fullPath}"
`);
                             }, 500);
                           } else {
                             // Use existing terminal
                             const term = terminalRefs.current.get(activeTerminal);
                             if (term) term.writeToTerminal(`cd "${fullPath}"
`);
                           }
                           setFolderMenu({ path: null, anchor: null });
                         }}
                       >Open in Integrated Terminal</div>
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
                    setFolderMenu({ path: null, anchor: null });
                  }}
                  style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                >
                  <span style={{ marginRight: 4, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={getFileIcon(name)} alt={getFileExtension(name) + ' file'} style={{ width: 16, height: 16 }} />
                  </span>
                  {name}
                  {fileMenu.path === fullPath && fileMenu.anchor && (
                    <div 
                      data-context-menu="true"
                      style={{
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
    if (!explorerOpen) return null;

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
          <div className="explorer-title">Source Control</div>
          <div style={{padding:'12px'}}>
            <div style={{marginBottom:'12px',color:'#bdbdbd'}}>Git Commands</div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              <button 
                onClick={() => {
                  const term = terminalRefs.current.get(activeTerminal);
                  if (showTerminal && term) {
                    term.writeToTerminal('git status\r\n');
                  } else {
                    setShowTerminal(true);
                  }
                }}
                style={{
                  background: '#4fc3f7',
                  color: '#181a1b',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                Git Status
              </button>
            </div>
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

  const renderSettingsMenu = () => (
    <div className="settings-menu">
      <div className="menu-item" onClick={() => { setShowSettings(false); setShowCommandPalette(true); }}>Command Palette... <span style={{color:'#bdbdbd'}}>Ctrl+Shift+P</span></div>
      <div className="menu-item" onClick={() => { setShowSettings(false); openView('preferences'); }}>Profiles</div>
      <div className="menu-item" onClick={() => { setShowSettings(false); openView('settings'); }}>Settings <span style={{color:'#bdbdbd'}}>Ctrl+,</span></div>
      <div className="menu-item" onClick={() => { setShowSettings(false); openView('extensions'); }}>Extensions <span style={{color:'#bdbdbd'}}>Ctrl+Shift+X</span></div>
      <div className="menu-item" onClick={() => { setShowSettings(false); openView('shortcuts'); }}>Keyboard Shortcuts <span style={{color:'#bdbdbd'}}>Ctrl+K Ctrl+S</span></div>
      <div className="menu-item" onClick={() => { setShowSettings(false); openView('snippets'); }}>Snippets</div>
      <div className="menu-item" onClick={() => { setShowSettings(false); openView('tasks'); }}>Tasks</div>
      <div className="menu-item" onClick={() => { setShowSettings(false); openView('themes'); }}>Themes <span style={{color:'#bdbdbd'}}>▶</span></div>
      <div className="menu-separator"></div>
      <div className="menu-item" onClick={() => { setShowSettings(false); openView('preferences'); }}>Backup and Sync Settings...</div>
      <div className="menu-separator"></div>
      <div className="menu-item" onClick={() => { setShowSettings(false); alert('You are up to date.'); }}>Check for Updates...</div>
    </div>
  );

  const handleGoLive = async () => {
    await saveFile();
    const goLiveRes = await axios.post(`/api/go-live?workspace=${workspace}`);
    setLiveStatus(goLiveRes.data);
    if (currentFile && currentFile.endsWith('.html')) {
      window.open(`http://localhost:5500/${currentFile}`, '_blank');
    } else {
      window.open('http://localhost:5500/', '_blank');
    }
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

  const runTaskCommand = (command) => {
    setShowTerminal(true);
    const term = terminalRefs.current.get(activeTerminal);
    if (term) {
      term.writeToTerminal(command + "\r\n");
    } else {
      // If terminal is not yet attached, create one and retry shortly
      handleAddNewTerminal();
      setTimeout(() => {
        const t = terminalRefs.current.get(activeTerminal);
        if (t) t.writeToTerminal(command + "\r\n");
      }, 250);
    }
  };

  const commands = [
    { id: 'open-settings', label: 'Open Settings', shortcut: 'Ctrl+,', action: () => openView('settings') },
    { id: 'view-toggle-word-wrap', label: 'View: Toggle Word Wrap', shortcut: 'Alt+Z', action: () => setWordWrapEnabled(v => !v) },
    { id: 'editor-add-cursor-above', label: 'Add Cursor Above', shortcut: 'Ctrl+Alt+UpArrow', action: () => editorInstance && editorInstance.trigger('keyboard', 'editor.action.insertCursorAbove', null) },
    { id: 'editor-add-cursor-below', label: 'Add Cursor Below', shortcut: 'Ctrl+Alt+DownArrow', action: () => editorInstance && editorInstance.trigger('keyboard', 'editor.action.insertCursorBelow', null) },
    { id: 'editor-add-cursors-line-ends', label: 'Add Cursors to Line Ends', shortcut: 'Shift+Alt+I', action: () => editorInstance && editorInstance.trigger('keyboard', 'editor.action.insertCursorAtEndOfEachLineSelected', null) },
    { id: 'editor-toggle-line-comment', label: 'Add Line Comment', shortcut: 'Ctrl+/', action: () => editorInstance && editorInstance.trigger('keyboard', 'editor.action.commentLine', null) },
    { id: 'go-live', label: 'Go Live', action: handleGoLive },
    { id: 'stop-live', label: 'Stop Live', action: handleStopLive },
    { id: 'run-file', label: 'Run Current File', action: runFileInTerminal },
    { id: 'open-terminal', label: 'Open Terminal', action: () => setShowTerminal(true) },
    { id: 'open-extensions', label: 'Open Extensions', shortcut: 'Ctrl+Shift+X', action: () => openView('extensions') },
    { id: 'open-keyboard-shortcuts', label: 'Open Keyboard Shortcuts', shortcut: 'Ctrl+K Ctrl+S', action: () => openView('shortcuts') },
    { id: 'open-snippets', label: 'Open User Snippets', action: () => openView('snippets') },
    { id: 'open-themes', label: 'Open Themes', action: () => openView('themes') },
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
          const cmd = filteredCommands[commandIndex];
          cmd.action();
          setRecentlyUsedCommands(prev => [cmd.id, ...prev.filter(id => id !== cmd.id)].slice(0, 10));
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

  // Keyboard navigation for Tasks quick pick
  useEffect(() => {
    if (!showTasksPanel) return;
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        setTasksIndex(i => Math.min(i + 1, filteredTasks.length - 1));
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setTasksIndex(i => Math.max(i - 1, 0));
        e.preventDefault();
      } else if (e.key === 'Enter') {
        const t = filteredTasks[tasksIndex];
        if (t) {
          runTaskCommand(t.cmd);
          setShowTasksPanel(false);
        }
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setShowTasksPanel(false);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showTasksPanel, tasksIndex]);

  useEffect(() => {
    if (showCommandPalette && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [showCommandPalette]);

  useEffect(() => {
    const globalPaletteHandler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        setShowCommandPalette(true);
        setCommandSearch('');
        setCommandIndex(0);
        e.preventDefault();
        return;
      }
      // Alt+Z toggles word wrap globally
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'z') {
        setWordWrapEnabled(v => !v);
        e.preventDefault();
        return;
      }
      // Ctrl+/ toggles line comment
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        if (editorInstance) {
          editorInstance.trigger('keyboard', 'editor.action.commentLine', null);
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', globalPaletteHandler);
    return () => window.removeEventListener('keydown', globalPaletteHandler);
  }, []);

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
        // ... (file actions)
        return;
  
      case 'Edit':
        // ... (edit actions)
        return;
  
      case 'Terminal':
        switch (label) {
          case 'New Terminal':
            handleAddNewTerminal();
            break;
          case 'Run Task...':
            setShowTasksPanel(true);
            break;
          case 'Run Build Task...':
            runTaskCommand('npm run build');
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

  const handleAddNewTerminal = () => {
    setIsSplitView(false); // Always add a new terminal in single view
    setShowTerminal(true);
    setTerminals(prev => {
        // If there are no terminals, create one, otherwise use the existing one
        if (prev.length === 0) {
            const newId = 1;
            setActiveTerminal(newId);
            return [{ id: newId, title: `terminal` }];
        }
        return prev;
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
    if (terminals.length < 2) {
        // If there's only one terminal, add another one before splitting
        const newId = terminals.length > 0 ? Math.max(...terminals.map(t => t.id)) + 1 : 1;
        setTerminals(prev => [...prev, { id: newId, title: 'powershell' }]);
    }
    setIsSplitView(true);
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
  const filteredTasks = taskTemplates.filter(t => (t.title + ' ' + t.desc).toLowerCase().includes(tasksSearch.toLowerCase()));

  return (
    <div className="app-root" style={{background:'#181a1b', color:'#fff', minHeight:'100vh'}}>
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
          {showSettings && renderSettingsMenu()}
        </div>
        
        {renderSidebarPanel()}

        <div className="editor-preview-container" style={{flex:1, display:'flex', flexDirection:'column', background:'#23272e', minWidth: 0}}>
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
                    {isView(f) ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M7 7h10M7 11h7"/></svg>
                    ) : (
                    <img src={getFileIcon(f)} alt={getFileExtension(f) + ' file'} style={{ width: 16, height: 16 }} />
                    )}
                  </span>
                  {isView(f) ? getViewLabel(f) : f}
                  <span className="close" onClick={e => closeTab(f, e)}>×</span>
                </div>
              ))}
            </div>
            <div style={{flex:1, display:'flex', flexDirection:'column', background:'#23272e'}}>
             {isView(currentFile) ? (
                <div style={{ flex: 1, overflow:'auto' }}>
                  {currentFile === '@view:shortcuts' && (
                    <div style={{ padding: 12 }}>
                      <input
                        type="text"
                        value={shortcutsSearch}
                        onChange={e => setShortcutsSearch(e.target.value)}
                        placeholder="Type to search in keybindings"
                        style={{ width:'100%', padding:'8px 10px', borderRadius:6, border:'1px solid #333', background:'#181a1b', color:'#fff', marginBottom:12 }}
                      />
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.95rem' }}>
                        <thead>
                          <tr style={{ color:'#bdbdbd', textAlign:'left' }}>
                            <th style={{ padding:'6px 8px', borderBottom:'1px solid #333' }}>Command</th>
                            <th style={{ padding:'6px 8px', borderBottom:'1px solid #333' }}>Keybinding</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { cmd:'View: Toggle Word Wrap', keys:'Alt+Z' },
                            { cmd:'Add Cursor Above', keys:'Ctrl+Alt+UpArrow' },
                            { cmd:'Add Cursor Below', keys:'Ctrl+Alt+DownArrow' },
                            { cmd:'Add Cursors to Line Ends', keys:'Shift+Alt+I' },
                            { cmd:'Add Line Comment', keys:'Ctrl+/' },
                            { cmd:'Open Settings', keys:'Ctrl+,' },
                            { cmd:'Open Extensions', keys:'Ctrl+Shift+X' },
                            { cmd:'Open Keyboard Shortcuts', keys:'Ctrl+K Ctrl+S' },
                            { cmd:'Command Palette', keys:'Ctrl+Shift+P' },
                            { cmd:'Open Terminal', keys:'-' }
                          ].filter(r => (r.cmd + ' ' + r.keys).toLowerCase().includes(shortcutsSearch.toLowerCase()))
                           .map((r, i) => (
                            <tr key={i}>
                              <td style={{ padding:'6px 8px', borderBottom:'1px solid #333' }}>{r.cmd}</td>
                              <td style={{ padding:'6px 8px', borderBottom:'1px solid #333', color:'#bdbdbd' }}>{r.keys}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {currentFile === '@view:settings' && (
                    <div style={{ padding: 12, color:'#bdbdbd' }}>Settings coming soon.</div>
                  )}
                  {currentFile === '@view:extensions' && (
                    <div style={{ padding: 12, color:'#bdbdbd' }}>Extensions UI coming soon.</div>
                  )}
                  {currentFile === '@view:snippets' && (
                    <div style={{ padding: 12 }}>
                      <div style={{ marginBottom: 8, color:'#bdbdbd' }}>Select Snippets File or Create Snippets</div>
                      <input
                        type="text"
                        placeholder="Search snippets"
                        style={{ width:'100%', padding:'8px 10px', borderRadius:6, border:'1px solid #333', background:'#181a1b', color:'#fff', marginBottom:8 }}
                        onChange={() => {}}
                      />
                      <div style={{maxHeight: 360, overflowY:'auto'}}>
                        {[
                          { id:'global', title:'New Global Snippets file...', right:'New Snippets', action: () => alert('Global snippets coming soon') },
                          { id:'workspace', title:`New Snippets file for '${workspace}'...`, action: () => alert('Workspace snippets coming soon') },
                          { id:'bat', title:'bat', subtitle:'Batch' },
                          { id:'bibtex', title:'bibtex', subtitle:'(BibTeX)' },
                          { id:'c', title:'c', subtitle:'(C)' },
                          { id:'clojure', title:'clojure', subtitle:'(Clojure)' },
                          { id:'cmake', title:'cmake', subtitle:'(CMake)' }
                        ].map((s, i) => (
                          <div key={s.id}
                               className="command-item"
                               onClick={() => s.action && s.action()}
                               style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <span>
                              <span style={{ fontWeight:600 }}>{s.title}</span>
                              {s.subtitle && <span style={{ color:'#bdbdbd' }}> {s.subtitle}</span>}
                            </span>
                            {s.right && <span style={{ color:'#bdbdbd' }}>{s.right}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {currentFile === '@view:tasks' && (
                    <div style={{ padding: 12, color:'#bdbdbd' }}>Open Terminal → Run Task… from menu to pick a template.</div>
                  )}
                  {currentFile === '@view:preferences' && (
                    <div style={{ padding: 12, color:'#bdbdbd' }}>Preferences coming soon.</div>
                  )}
                </div>
              ) : (
                <MonacoEditor
                  height="100%"
                  language={getLanguage(currentFile)}
                  defaultLanguage={getLanguage(currentFile)}
                  value={code || ''}
                  onChange={(value) => setCode(value || '')}
                  onMount={(editor) => setEditorInstance(editor)}
                  theme={currentTheme === 'light' ? 'vs' : 'vs-dark'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineHeight: 20,
                    wordWrap: wordWrapEnabled ? 'on' : 'off',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    background: currentTheme === 'light' ? '#fafbfc' : '#23272e',
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
                background: 'var(--bg-dark)',
                borderTop: '1px solid var(--border)',
                color: 'var(--text-light)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  height: 6,
                  cursor: 'ns-resize',
                  background: isResizingRef.current ? 'var(--accent)' : 'var(--bg-sidebar)',
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
                background: 'var(--bg-sidebar)',
                borderBottom: '1px solid var(--border)',
                height: 36,
                zIndex: 3,
                position: 'relative',
                marginTop: 6,
                padding: '0 8px'
              }}>
                <button
                  onClick={() => setActiveBottomTab('terminal')}
                  className={`terminal-tab ${activeBottomTab === 'terminal' ? 'active' : ''}`}
                >Terminal</button>
                <button
                  onClick={() => setActiveBottomTab('output')}
                  className={`terminal-tab ${activeBottomTab === 'output' ? 'active' : ''}`}
                >Output</button>
                <div style={{flex: 1}} />
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <button onClick={handleAddNewTerminal} className="terminal-action-btn" title="New Terminal">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </button>
                    <button onClick={handleSplitTerminal} className="terminal-action-btn" title="Split Terminal">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3V3zm8 2v14h8V5h-8z"/></svg>
                    </button>
                    <button onClick={() => handleDeleteTerminal(activeTerminal)} className="terminal-action-btn" title="Delete Terminal">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {activeBottomTab === 'terminal' ? (
                  <>
                    <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
                        {isSplitView ? (
                            splitTerminals.map(term => (
                                <div key={term.id} style={{width: '50%', height: '100%', borderRight: '1px solid var(--border)'}}>
                                    <TerminalPanel 
                                        ref={el => terminalRefs.current.set(term.id, el)}
                                        workspace={workspace}
                                        onProjectCreated={() => {
                                            axios.get(`/api/files?workspace=${workspace}`).then(fileRes => {
                                            setFiles(fileRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')));
                                            });
                                        }} 
                                    />
                                </div>
                            ))
                        ) : (
                            terminals.map(term => (
                                <div key={term.id} style={{width: '100%', height: '100%', display: term.id === activeTerminal ? 'block' : 'none'}}>
                                    <TerminalPanel 
                                        ref={el => terminalRefs.current.set(term.id, el)}
                                        workspace={workspace}
                                        onProjectCreated={() => {
                                            axios.get(`/api/files?workspace=${workspace}`).then(fileRes => {
                                            setFiles(fileRes.data.filter(f => typeof f === 'string' && !f.startsWith('[object Object]')));
                                            });
                                        }} 
                                    />
                                </div>
                            ))
                        )}
                    </div>
                    <div className="terminal-sidebar">
                        {terminals.map((term, index) => (
                            <div 
                                key={term.id} 
                                className={`terminal-list-item ${term.id === activeTerminal ? 'active' : ''}`}
                                onClick={() => handleSetActiveTerminal(term.id)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" style={{marginRight: '8px'}}>
                                    <path d="M20,19V7H4V19H20M20,3A2,2 0 0,1 22,5V19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19V5C2,3.89 2.9,3 4,3H20M13,17V15H18V17H13M9.58,13L5.57,9H8.4L11.7,12.3C12.09,12.69 12.09,13.33 11.7,13.72L8.42,17H5.59L9.58,13Z" fill="#75beff"/>
                                </svg>
                                {`${index + 1}`}
                            </div>
                        ))}
                    </div>
                  </>
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
            />
          </div>
        )}
      </div>
      <div style={{
        position: 'fixed',
        left: 0,
        right: isAIAssistantVisible ? '400px' : 0,
        bottom: 0,
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
       <div className="go-live-toolbar">
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

      </div>
      {showSettingsPanel && (
        <div className="modal-overlay" onClick={() => setShowSettingsPanel(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop:0, marginBottom:16}}>Settings</h2>
            <div style={{marginBottom:16}}>
              <label style={{fontWeight:600}}>Theme:</label>
              <select style={{marginLeft:12, padding:4, borderRadius:4, background:'#181a1b', color:'#fff', border:'1px solid #333'}} disabled>
                <option>Dark (default)</option>
              </select>
              <span style={{marginLeft:8, color:'#888', fontSize:'0.95em'}}>(coming soon)</span>
            </div>
            <button onClick={() => setShowSettingsPanel(false)} className="modal-close-btn">×</button>
          </div>
        </div>
      )}
      {showExtensionsPanel && (
        <div className="modal-overlay" onClick={() => setShowExtensionsPanel(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop:0, marginBottom:16}}>Extensions</h2>
            <div style={{color:'#bdbdbd'}}>Extensions UI coming soon.</div>
            <button onClick={() => setShowExtensionsPanel(false)} className="modal-close-btn">×</button>
          </div>
        </div>
      )}
      {showShortcutsPanel && (
        <div className="modal-overlay" onClick={() => setShowShortcutsPanel(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop:0, marginBottom:16}}>Keyboard Shortcuts</h2>
            <div style={{color:'#bdbdbd'}}>Shortcut customization coming soon.</div>
            <button onClick={() => setShowShortcutsPanel(false)} className="modal-close-btn">×</button>
          </div>
        </div>
      )}
      {showSnippetsPanel && (
        <div className="modal-overlay" onClick={() => setShowSnippetsPanel(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop:0, marginBottom:16}}>User Snippets</h2>
            <div style={{color:'#bdbdbd'}}>Snippets management coming soon.</div>
            <button onClick={() => setShowSnippetsPanel(false)} className="modal-close-btn">×</button>
          </div>
        </div>
      )}
      {showThemesPanel && (
        <div className="modal-overlay" onClick={() => setShowThemesPanel(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop:0, marginBottom:16}}>Themes</h2>
            <div style={{maxHeight: 320, overflowY: 'auto'}}>
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`command-item ${currentTheme === theme.id ? 'selected' : ''}`}
                  onClick={() => { applyTheme(theme.id); setShowThemesPanel(false); }}
                  style={{ display:'flex', flexDirection:'column', cursor:'pointer' }}
                >
                  <span style={{ fontWeight:600 }}>{theme.name}</span>
                  <span style={{ color:'#bdbdbd', fontSize:'0.95em' }}>{theme.description}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowThemesPanel(false)} className="modal-close-btn">×</button>
          </div>
        </div>
      )}
             {showPreferences && (
         <div className="modal-overlay" onClick={() => setShowPreferences(false)}>
           <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '80vw', maxWidth: '1200px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
             <div style={{ display: 'flex', height: '100%' }}>
               {/* Left Sidebar */}
               <div style={{ width: '300px', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                 {/* New Profile Button */}
                 <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                   <button 
                     onClick={createNewProfile}
                     style={{
                       background: 'var(--accent)',
                       color: 'white',
                       border: 'none',
                       borderRadius: '4px',
                       padding: '8px 12px',
                       cursor: 'pointer',
                       fontSize: '14px',
                       fontWeight: '500',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '8px'
                     }}
                   >
                     New Profile
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <polyline points="6,9 12,15 18,9"></polyline>
                     </svg>
                   </button>
                 </div>
                 
                 {/* Profile List */}
                 <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                   {profiles.map(profile => (
                     <div 
                       key={profile.id}
                       style={{
                         padding: '12px 16px',
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'space-between',
                         background: profile.isActive ? 'var(--accent)' : 'transparent',
                         color: profile.isActive ? 'white' : 'var(--text-light)',
                         borderBottom: '1px solid var(--border)'
                       }}
                       onClick={() => activateProfile(profile.id)}
                     >
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                           <circle cx="12" cy="12" r="3"/>
                           <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09c0 .66.38 1.26 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06A1.65 1.65 0 0 0 19.4 8c.36.36.57.86.6 1.39V9a2 2 0 1 1 0 4h-.09c-.03.53-.24 1.03-.6 1.39z"/>
                         </svg>
                         <span style={{ fontWeight: '500' }}>{profile.name}</span>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                         {profile.isActive && (
                           <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
                             Active
                           </span>
                         )}
                         <button
                           onClick={(e) => showProfileContextMenu(e, profile.id)}
                           style={{
                             background: 'transparent',
                             border: 'none',
                             color: 'inherit',
                             cursor: 'pointer',
                             padding: '4px',
                             borderRadius: '3px',
                             display: 'flex',
                             alignItems: 'center'
                           }}
                         >
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                             <circle cx="12" cy="12" r="1"/>
                             <circle cx="19" cy="12" r="1"/>
                             <circle cx="5" cy="12" r="1"/>
                           </svg>
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
               
               {/* Main Content */}
               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-editor)' }}>
                 {/* Profile Header */}
                 <div style={{ padding: '24px 32px 16px 32px', borderBottom: '1px solid var(--border)' }}>
                   <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: 'var(--text-light)' }}>
                     {profiles.find(p => p.id === activeProfile)?.name || 'Default'}
                   </h1>
                 </div>
                 
                 {/* Use for New Windows Checkbox */}
                 <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-light)' }}>
                     <input 
                       type="checkbox" 
                       checked={profiles.find(p => p.id === activeProfile)?.isDefault || false}
                       onChange={() => setProfileAsDefault(activeProfile)}
                       style={{ width: '16px', height: '16px' }}
                     />
                     <span>Use this profile as the default for new windows</span>
                   </label>
                 </div>
                 
                 {/* Contents Section */}
                 <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)' }}>
                   <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-light)' }}>
                     Contents
                   </h3>
                   <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                     Browse contents of this profile
                   </p>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                     {[
                       { id: 'contents', label: 'Contents', icon: '📁' },
                       { id: 'settings', label: 'Settings', icon: '⚙️' },
                       { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: '⌨️' },
                       { id: 'tasks', label: 'Tasks', icon: '📋' },
                       { id: 'mcp', label: 'MCP Servers', icon: '🔌' },
                       { id: 'snippets', label: 'Snippets', icon: '📝', collapsible: true },
                       { id: 'extensions', label: 'Extensions', icon: '🧩', collapsible: true }
                     ].map(item => (
                       <div 
                         key={item.id}
                         style={{
                           padding: '8px 12px',
                           cursor: 'pointer',
                           borderRadius: '4px',
                           background: profileContents === item.id ? 'var(--accent)' : 'transparent',
                           color: profileContents === item.id ? 'white' : 'var(--text-light)',
                           display: 'flex',
                           alignItems: 'center',
                           gap: '8px'
                         }}
                         onClick={() => setProfileContents(item.id)}
                       >
                         {item.collapsible && (
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                             <polyline points="9,18 15,12 9,6"></polyline>
                           </svg>
                         )}
                         <span>{item.icon}</span>
                         <span>{item.label}</span>
                       </div>
                     ))}
                   </div>
                 </div>
                 
                 {/* Folders & Workspaces Section */}
                 <div style={{ flex: 1, padding: '16px 32px', overflowY: 'auto' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                     <div>
                       <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-light)' }}>
                         Folders & Workspaces
                       </h3>
                       <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
                         Following folders and workspaces are using this profile
                       </p>
                     </div>
                     <button 
                       onClick={addFolderToProfile}
                       style={{
                         background: 'var(--accent)',
                         color: 'white',
                         border: 'none',
                         borderRadius: '4px',
                         padding: '6px 12px',
                         cursor: 'pointer',
                         fontSize: '12px',
                         fontWeight: '500'
                       }}
                     >
                       Add Folder
                     </button>
                   </div>
                   <div style={{ background: 'var(--bg-sidebar)', borderRadius: '6px', overflow: 'hidden' }}>
                     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                       <thead>
                         <tr style={{ background: 'var(--bg-topbar)', borderBottom: '1px solid var(--border)' }}>
                           <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Host</th>
                           <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Path</th>
                           <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', width: '60px' }}>Actions</th>
                         </tr>
                       </thead>
                       <tbody>
                         {profileFolders.map((folder, index) => (
                           <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                             <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-light)' }}>{folder.host}</td>
                             <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-light)', fontFamily: 'monospace' }}>{folder.path}</td>
                             <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                               <button
                                 onClick={() => removeFolderFromProfile(index)}
                                 style={{
                                   background: 'transparent',
                                   border: 'none',
                                   color: '#e57373',
                                   cursor: 'pointer',
                                   padding: '4px',
                                   borderRadius: '3px'
                                 }}
                                 title="Remove folder"
                               >
                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                   <polyline points="3,6 5,6 21,6"></polyline>
                                   <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                                 </svg>
                               </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </div>
               </div>
             </div>
             <button onClick={() => setShowPreferences(false)} className="modal-close-btn">×</button>
             
             {/* Profile Context Menu */}
             {profileContextMenu.show && (
               <div 
                 style={{
                   position: 'fixed',
                   left: profileContextMenu.x,
                   top: profileContextMenu.y,
                   background: 'var(--bg-sidebar)',
                   border: '1px solid var(--border)',
                   borderRadius: '6px',
                   boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                   zIndex: 5000,
                   minWidth: '160px',
                   padding: '4px 0'
                 }}
                 onClick={e => e.stopPropagation()}
               >
                 <div 
                   style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-light)' }}
                   onClick={() => { setProfileAsDefault(profileContextMenu.profileId); hideProfileContextMenu(); }}
                 >
                   Set as Default
                 </div>
                 <div 
                   style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-light)' }}
                   onClick={() => duplicateProfile(profileContextMenu.profileId)}
                 >
                   Duplicate
                 </div>
                 <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>
                 <div 
                   style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px', color: '#e57373' }}
                   onClick={() => { deleteProfile(profileContextMenu.profileId); hideProfileContextMenu(); }}
                 >
                   Delete
                 </div>
               </div>
             )}
           </div>
         </div>
       )}
      {showTasksPanel && (
        <div className="modal-overlay" onClick={() => setShowTasksPanel(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{margin:'0 0 8px 0', color:'#bdbdbd'}}>Select a Task Template</h3>
            <input
              ref={tasksInputRef => {
                if (tasksInputRef && showTasksPanel) {
                  tasksInputRef.focus();
                }
              }}
              type="text"
              value={tasksSearch}
              onChange={e => { setTasksSearch(e.target.value); setTasksIndex(0); }}
              placeholder="Search tasks..."
              style={{ width:'100%', padding:'8px 10px', borderRadius:6, border:'1px solid #333', background:'#181a1b', color:'#fff', marginBottom:8 }}
            />
            <div style={{maxHeight: 320, overflowY: 'auto'}}>
              {filteredTasks.map((t, i) => (
                <div
                  key={t.id}
                  className={`command-item ${i === tasksIndex ? 'selected' : ''}`}
                  onMouseEnter={() => setTasksIndex(i)}
                  onClick={() => { runTaskCommand(t.cmd); setShowTasksPanel(false); }}
                  style={{ display:'flex', flexDirection:'column' }}
                >
                  <span style={{ fontWeight:600 }}>{t.title}</span>
                  <span style={{ color:'#bdbdbd', fontSize:'0.95em' }}>{t.desc}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowTasksPanel(false)} className="modal-close-btn">×</button>
          </div>
        </div>
      )}
      {showCommandPalette && (
        <div className="modal-overlay" onClick={() => setShowCommandPalette(false)}>
          <div className="command-palette" onClick={e => e.stopPropagation()}>
            <div style={{ position:'relative', marginBottom: 8 }}>
              <span style={{ position:'absolute', top: 9, left: 10, color:'#9aa0a6' }}>&gt;</span>
            <input
              ref={commandInputRef}
              type="text"
              placeholder="Type a command..."
              value={commandSearch}
              onChange={e => { setCommandSearch(e.target.value); setCommandIndex(0); }}
                style={{ paddingLeft: 24 }}
              />
            </div>
            <div style={{maxHeight: 360, overflowY: 'auto'}}>
              {filteredCommands.map((cmd, i) => {
                const isSelected = i === commandIndex;
                const recentlyUsed = recentlyUsedCommands.length > 0 && recentlyUsedCommands[0] === cmd.id;
                return (
                <div
                  key={cmd.id}
                    className={`command-item ${isSelected ? 'selected' : ''}`}
                  onMouseEnter={() => setCommandIndex(i)}
                  onClick={() => {
                    cmd.action();
                      setRecentlyUsedCommands(prev => [cmd.id, ...prev.filter(id => id !== cmd.id)].slice(0, 10));
                    setShowCommandPalette(false);
                    setCommandSearch('');
                    setCommandIndex(0);
                  }}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}
                  >
                    <span>{cmd.label}</span>
                    <span style={{ display:'flex', alignItems:'center', gap: 12 }}>
                      {recentlyUsed && <span style={{ color:'#9aa0a6', fontSize:'0.85em' }}>recently used</span>}
                      {cmd.shortcut && <span style={{ color:'#bdbdbd', fontSize:'0.95em' }}>{cmd.shortcut}</span>}
                    </span>
                </div>
                );
              })}
            </div>
            <button onClick={() => setShowCommandPalette(false)} className="modal-close-btn">×</button>
          </div>
        </div>
      )}
    </div>
  );
}
