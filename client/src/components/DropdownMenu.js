// client/src/components/DropdownMenu.js
import React from 'react';
import './DropdownMenu.css';
import { getMenuData } from '../data/menudata';

const DropdownMenu = ({ section, position, onMenuAction, autoSave }) => {
  const items = getMenuData(autoSave)[section];

  if (!items) return null;

  const style = {
    position: 'fixed',
    left: position && position.left ? position.left : 0,
    top: position && position.top ? position.top : '100%',
    zIndex: 100000,
    isolation: 'isolate',
  };

  const handleItemClick = (item) => {
    if (typeof item === 'object' && item.label && onMenuAction) {
      onMenuAction(section, item);
    }
  };

  return (
    <div className="dropdown-menu" style={style}>
      {items.map((item, index) => {
        if (typeof item === 'string' && item === 'divider') {
          return <div key={index} className="dropdown-divider" />;
        }
        if (typeof item === 'object' && item !== null) {
          return (
            <div className="dropdown-item" key={index} onClick={() => handleItemClick(item)} style={{cursor:'pointer'}}>
              {item.label && item.label.includes('✔') && <span className="checkmark">✔</span>}
              <span>{item.label}</span>
              <span className="right-section">
                {item.label && item.label.includes('▶') && <span className="submenu-arrow">▶</span>}
                {item.shortcut && (
                  <span className="shortcut">{item.shortcut}</span>
                )}
              </span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default DropdownMenu;
