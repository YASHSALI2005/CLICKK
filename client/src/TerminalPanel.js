import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './styles/TerminalPanel.css';

const TerminalPanel = forwardRef((props, ref) => {
  const xtermRef = useRef();
  const termRef = useRef();
  const fitAddonRef = useRef();

  useEffect(() => {
    const term = new Terminal({ 
      fontSize: 14, 
      theme: { 
        background: '#1e1e1e',
        foreground: '#f0f0f0',
        cursor: '#ffffff',
        selectionBackground: 'rgba(77, 151, 255, 0.3)',
        black: '#000000',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#f8f8f2'
      },
      cursorBlink: true,
      fontFamily: 'Consolas, "Courier New", monospace',
      lineHeight: 1.2
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(xtermRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    const wsUrl = props.workspace ? `ws://localhost:8081?workspace=${encodeURIComponent(props.workspace)}` : 'ws://localhost:8081';
    const socket = new window.WebSocket(wsUrl);

    socket.onmessage = (event) => {
      term.write(event.data);
      // Project creation detection for multiple frameworks
      if (props.onProjectCreated) {
        const data = event.data.toLowerCase();
        
        // React detection
        if (data.includes('happy hacking!') || data.includes('npm start')) {
          props.onProjectCreated();
        }
        // Next.js detection
        else if (data.includes('npm run dev') || data.includes('ready - started server')) {
          props.onProjectCreated();
        }
        // Angular detection
        else if (data.includes('ng serve') || data.includes('angular cli') || data.includes('project created successfully')) {
          props.onProjectCreated();
        }
        // Express.js detection
        else if (data.includes('express-generator') || data.includes('express app created') || data.includes('npm start')) {
          props.onProjectCreated();
        }
        // NestJS detection
        else if (data.includes('nest new') || data.includes('nestjs') || data.includes('npm run start:dev')) {
          props.onProjectCreated();
        }
        // Vite detection
        else if (data.includes('vite') || data.includes('npm run dev') || data.includes('local:')) {
          props.onProjectCreated();
        }
        // Prisma detection
        else if (data.includes('prisma init') || data.includes('database url') || data.includes('prisma schema')) {
          props.onProjectCreated();
        }
        // Supabase detection
        else if (data.includes('supabase') || data.includes('supabase init') || data.includes('project initialized')) {
          props.onProjectCreated();
        }
        // Firebase detection
        else if (data.includes('firebase init') || data.includes('firebase project') || data.includes('firebase.json')) {
          props.onProjectCreated();
        }
        // Git operations detection
        else if (data.includes('git add') || data.includes('git commit') || data.includes('git push') || data.includes('git pull') || data.includes('git checkout')) {
          // Refresh file explorer after Git operations
          setTimeout(() => {
            props.onProjectCreated();
          }, 1000);
        }
      }
    };

    term.onData(data => {
      socket.send(data);
    });

    // Handle resizing
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      socket.close();
      term.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Expose writeToTerminal to parent
  useImperativeHandle(ref, () => ({
    writeToTerminal: (text) => {
      if (termRef.current) {
        termRef.current.write(text);
      }
    }
  }));

  // Ensure fitAddon.fit() is called after mount and on resize
  useEffect(() => {
    setTimeout(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    }, 100); // Increased delay to 100ms
  }, []);

  return (
    <div className="terminal-container">
      <div className="terminal-tabs">
        <div className="terminal-tab active">
          <div className="terminal-tab-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path d="M20,19V7H4V19H20M20,3A2,2 0 0,1 22,5V19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19V5C2,3.89 2.9,3 4,3H20M13,17V15H18V17H13M9.58,13L5.57,9H8.4L11.7,12.3C12.09,12.69 12.09,13.33 11.7,13.72L8.42,17H5.59L9.58,13Z" />
            </svg>
          </div>
          <div className="terminal-tab-title">Terminal</div>
        </div>
        <div className="terminal-tab-actions">
          <div className="terminal-tab-action">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <div className="terminal-tab-action">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <div className="terminal-tab-action">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </div>
      </div>
      <div className="terminal-content" ref={xtermRef}></div>
    </div>
  );
});

export default TerminalPanel;