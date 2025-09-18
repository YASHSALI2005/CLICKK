// client/src/components/Topbar.js
import React, { useState, useRef, useEffect } from 'react';
import './Topbar.css';
import icon from '../assets/icon.png';
import DropdownMenu from './DropdownMenu';

const menuItems = ['File', 'Edit', 'Selection', 'Components', 'View', 'Go', 'Run', 'Terminal', 'Help'];

const Topbar = ({ onMenuAction, autoSave }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0 });
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenu]);

  const handleMouseEnter = (item, e) => {
    const rect = e.target.getBoundingClientRect();
    setDropdownPosition({ left: rect.left, top: rect.bottom });
    setActiveMenu(item);
  };

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  return (
    <div className="topbar" ref={menuRef} onMouseLeave={handleMouseLeave}>
      <div className="topbar-left">
        <img src={icon} alt="Clickk Logo" className="topbar-logo" />
      </div>
      <div className="topbar-menu">
        {menuItems.map(item => (
          <span
            className="topbar-item"
            key={item}
            onMouseEnter={e => handleMouseEnter(item, e)}
            tabIndex="-1"
            onMouseDown={e => e.preventDefault()}
            style={{ userSelect: 'none' }}
          >
            {item}
          </span>
        ))}
      </div>
      {activeMenu && <DropdownMenu section={activeMenu} position={dropdownPosition} onMenuAction={onMenuAction} autoSave={autoSave} />}
    </div>
  );
};
















const fileMenuItems = [
  { name: 'New Text File', shortcut: 'Ctrl+N' },
  { name: 'New Window', shortcut: 'Ctrl+Shift+N' },
  { name: 'New Window with Profile', hasSubmenu: true },
  'divider',
  { name: 'Open File...', shortcut: 'Ctrl+O' },
  { name: 'Open Folder...', shortcut: 'Ctrl+M Ctrl+O' },
  { name: 'Open Workspace from File...' },
  { name: 'Open Recent', hasSubmenu: true },
  'divider',
  { name: 'Add Folder to Workspace...' },
  { name: 'Save Workspace As...' },
  { name: 'Duplicate Workspace' },
  'divider',
  { name: 'Save', shortcut: 'Ctrl+S' },
  { name: 'Save As...', shortcut: 'Ctrl+Shift+S' },
  { name: 'Save All', shortcut: 'Ctrl+M S' },
  'divider',
  { name: 'Share', hasSubmenu: true },
  { name: 'Auto Save', check: true },
  { name: 'Preferences', hasSubmenu: true },
  'divider',
  { name: 'Revert File' },
  { name: 'Close Editor', shortcut: 'Ctrl+F4' },
  { name: 'Close Folder', shortcut: 'Ctrl+M F' },
  { name: 'Close Window', shortcut: 'Alt+F4' },
  'divider',
  { name: 'Exit' }
];

const editMenuItems = [
    { name: 'Undo', shortcut: 'Ctrl+Z' },
    { name: 'Redo', shortcut: 'Ctrl+Y' },
    'divider',
    { name: 'Cut', shortcut: 'Ctrl+X' },
    { name: 'Copy', shortcut: 'Ctrl+C' },
    { name: 'Paste', shortcut: 'Ctrl+V' },
    'divider',
    { name: 'Find', shortcut: 'Ctrl+F' },
    { name: 'Replace', shortcut: 'Ctrl+H' },
    'divider',
    { name: 'Find in Files', shortcut: 'Ctrl+Shift+F' },
    { name: 'Replace in Files', shortcut: 'Ctrl+Shift+H' },
    'divider',
    { name: 'Toggle Line Comment', shortcut: 'Ctrl+/' },
    { name: 'Toggle Block Comment', shortcut: 'Shift+Alt+A' },
    { name: 'Emmet: Expand Abbreviation', shortcut: 'Tab' }
  ];
  

//   const Topbar = () => {
//     const [activeMenu, setActiveMenu] = useState(null);
  
//     const handleMouseEnter = (item) => {
//       setActiveMenu(item);
//     };
  
//     const handleMouseLeave = () => {
//       setActiveMenu(null);
//     };
  
//     const renderDropdown = (menuType) => {
//       const items = menuType === 'File' ? fileMenuItems : menuType === 'Edit' ? editMenuItems : [];
//       return (
//         <div className="dropdown-menu">
//           {items.map((menuItem, index) => {
//             if (menuItem === 'divider') {
//               return <div key={index} className="dropdown-divider" />;
//             }
//             return (
//               <div className="dropdown-item" key={menuItem.name}>
//                 {menuItem.check && <span className="checkmark">✔</span>}
//                 <span>{menuItem.name}</span>
//                 <span className="right-section">
//                   {menuItem.hasSubmenu && <span className="submenu-arrow">▶</span>}
//                   {menuItem.shortcut && (
//                     <span className="shortcut">{menuItem.shortcut}</span>
//                   )}
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       );
//     };
  
//     return (
//       <div className="topbar">
//         <div className="topbar-left">
//           <img src={icon} alt="CLIKK Logo" className="topbar-logo" />
//         </div>
  
//         <div className="topbar-menu">
//           {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map(item => (
//             <div
//               className="topbar-item-wrapper"
//               key={item}
//               onMouseEnter={() => handleMouseEnter(item)}
//               onMouseLeave={handleMouseLeave}
//             >
//               <span className="topbar-item">{item}</span>
//               {activeMenu === item && renderDropdown(item)}
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };
  

export default Topbar;
