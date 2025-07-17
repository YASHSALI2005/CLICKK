// client/src/data/menudata.js

export const menudata = {
    File: [
      { label: 'New File', shortcut: 'Ctrl+N' },
      { label: 'New Window', shortcut: 'Ctrl+Shift+N' },
      { label: 'New Window with Profile ▶' },
      'divider',
      { label: 'Open File...', shortcut: 'Ctrl+O' },
      { label: 'Open Folder...', shortcut: 'Ctrl+M Ctrl+O' },
      { label: 'Open Workspace from File...' },
      { label: 'Open Recent ▶' },
      'divider',
      { label: 'Add Folder to Workspace...' },
      { label: 'Save Workspace As...' },
      { label: 'Duplicate Workspace' },
      'divider',
      { label: 'Save', shortcut: 'Ctrl+S' },
      { label: 'Save As...', shortcut: 'Ctrl+Shift+S' },
      { label: 'Save All', shortcut: 'Ctrl+M S' },
      'divider',
      { label: 'Share ▶' },
      { label: 'Auto Save ✔' },
      { label: 'Preferences ▶' },
      'divider',
      { label: 'Revert File' },
      { label: 'Close Editor', shortcut: 'Ctrl+F4' },
      { label: 'Close Folder', shortcut: 'Ctrl+M F' },
      { label: 'Close Window', shortcut: 'Alt+F4' },
      'divider',
      { label: 'Exit' }
    ],
  
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z' },
      { label: 'Redo', shortcut: 'Ctrl+Y' },
      'divider',
      { label: 'Cut', shortcut: 'Ctrl+X' },
      { label: 'Copy', shortcut: 'Ctrl+C' },
      { label: 'Paste', shortcut: 'Ctrl+V' },
      'divider',
      { label: 'Find', shortcut: 'Ctrl+F' },
      { label: 'Replace', shortcut: 'Ctrl+H' },
      'divider',
      { label: 'Find in Files', shortcut: 'Ctrl+Shift+F' },
      { label: 'Replace in Files', shortcut: 'Ctrl+Shift+H' },
      'divider',
      { label: 'Toggle Line Comment', shortcut: 'Ctrl+/' },
      { label: 'Toggle Block Comment', shortcut: 'Shift+Alt+A' },
      { label: 'Emmet: Expand Abbreviation', shortcut: 'Tab' }
    ],
  
    Selection: [
      { label: 'Select All', shortcut: 'Ctrl+A' },
      { label: 'Expand Selection' },
      { label: 'Shrink Selection' },
      'divider',
      { label: 'Copy Line Up', shortcut: 'Shift+Alt+Up' },
      { label: 'Copy Line Down', shortcut: 'Shift+Alt+Down' },
      { label: 'Move Line Up', shortcut: 'Alt+Up' },
      { label: 'Move Line Down', shortcut: 'Alt+Down' },
      'divider',
      { label: 'Add Cursor Above', shortcut: 'Ctrl+Alt+Up' },
      { label: 'Add Cursor Below', shortcut: 'Ctrl+Alt+Down' },
      { label: 'Add Cursors to Line Ends', shortcut: 'Shift+Alt+I' },
      { label: 'Select All Occurrences', shortcut: 'Ctrl+Shift+L' }
    ],
  
    View: [
      { label: 'Command Palette...', shortcut: 'Ctrl+Shift+P' },
      { label: 'Open View...' },
      'divider',
      { label: 'Explorer', shortcut: 'Ctrl+Shift+E' },
      { label: 'Search', shortcut: 'Ctrl+Shift+F' },
      { label: 'Source Control', shortcut: 'Ctrl+Shift+G' },
      { label: 'Run and Debug', shortcut: 'Ctrl+Shift+D' },
      { label: 'Extensions', shortcut: 'Ctrl+Shift+X' },
      'divider',
      { label: 'Problems', shortcut: 'Ctrl+Shift+M' },
      { label: 'Output' },
      { label: 'Terminal', shortcut: 'Ctrl+`' },
      { label: 'Debug Console' },
      'divider',
      { label: 'Appearance ▶' },
      { label: 'Editor Layout ▶' },
      { label: 'Zoom In', shortcut: 'Ctrl+=' },
      { label: 'Zoom Out', shortcut: 'Ctrl+-' },
      { label: 'Reset Zoom', shortcut: 'Ctrl+NumPad0' }
    ],
  
    Go: [
      { label: 'Back', shortcut: 'Alt+←' },
      { label: 'Forward', shortcut: 'Alt+→' },
      { label: 'Last Edit Location', shortcut: 'Ctrl+K Ctrl+Q' },
      'divider',
      { label: 'Go to File...', shortcut: 'Ctrl+P' },
      { label: 'Go to Symbol in Workspace...', shortcut: 'Ctrl+T' },
      { label: 'Go to Symbol in Editor...', shortcut: 'Ctrl+Shift+O' },
      { label: 'Go to Definition', shortcut: 'F12' },
      { label: 'Go to Declaration' },
      { label: 'Go to Type Definition' },
      { label: 'Go to References', shortcut: 'Shift+F12' },
      'divider',
      { label: 'Next Problem', shortcut: 'F8' },
      { label: 'Previous Problem', shortcut: 'Shift+F8' }
    ],
  
    Run: [
      { label: 'Start Debugging', shortcut: 'F5' },
      { label: 'Run Without Debugging', shortcut: 'Ctrl+F5' },
      { label: 'Stop Debugging', shortcut: 'Shift+F5' },
      { label: 'Restart Debugging', shortcut: 'Ctrl+Shift+F5' },
      'divider',
      { label: 'Open Configurations' },
      { label: 'Add Configuration...' }
    ],
  
    Terminal: [
      { label: 'New Terminal', shortcut: 'Ctrl+`' },
      { label: 'Split Terminal', shortcut: 'Ctrl+\\' },
      'divider',
      { label: 'Run Task...' },
      { label: 'Run Build Task...', shortcut: 'Ctrl+Shift+B' },
      { label: 'Run Active File' },
      { label: 'Restart Task...' },
      { label: 'Terminate Task...' },
      'divider',
      { label: 'Configure Tasks...' },
      { label: 'Configure Default Build Task...' },
      'divider',
      { label: 'Show Running Tasks...' },
      { label: 'Toggle Output' },
      { label: 'Toggle Terminal', shortcut: 'Ctrl+`' }
    ],
  
    Help: [
      { label: 'Welcome' },
      { label: 'Show All Commands', shortcut: 'Ctrl+Shift+P' },
      { label: 'About' }
    ],
  
    Components: [
      { label: 'Add Component', shortcut: 'Ctrl+Alt+C' },
      { label: 'Remove Component' },
      { label: 'Rename Component' },
      'divider',
      { label: 'Component Settings' },
      { label: 'Show Component Tree' },
      { label: 'Export Component' }
    ]
  };
  