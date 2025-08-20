import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './styles/TerminalPanel.css';

const TerminalPanel = forwardRef((props, ref) => {
  const xtermRef = useRef();
  const termRef = useRef();
  const fitAddonRef = useRef();
  const socketRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    const term = new Terminal({ 
      fontSize: 13, 
      theme: { 
        background: '#0c0c0c',
        foreground: '#cccccc',
        cursor: '#ffffff',
        cursorAccent: '#000000',
        selectionBackground: 'rgba(255, 255, 255, 0.3)',
        black: '#0c0c0c',
        red: '#c50f1f',
        green: '#13a10e',
        yellow: '#c19c00',
        blue: '#0037da',
        magenta: '#881798',
        cyan: '#3a96dd',
        white: '#cccccc',
        brightBlack: '#767676',
        brightRed: '#e74856',
        brightGreen: '#16c60c',
        brightYellow: '#f9f1a5',
        brightBlue: '#3b78ff',
        brightMagenta: '#b4009e',
        brightCyan: '#61d6d6',
        brightWhite: '#f2f2f2'
      },
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: 'Cascadia Code, Consolas, "Courier New", monospace',
      fontWeight: 'normal',
      fontWeightBold: 'bold',
      lineHeight: 1.0,
      letterSpacing: 0,
      allowTransparency: true,
      scrollback: 1000,
      tabStopWidth: 4,
      convertEol: true
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(xtermRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    const connect = () => {
      const host = window.location.hostname || 'localhost';
      const wsUrl = props.workspace
        ? `ws://${host}:8081?workspace=${encodeURIComponent(props.workspace)}`
        : `ws://${host}:8081`;
      const socket = new window.WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttemptsRef.current = 0;
      };

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

      socket.onerror = () => {
        // Let onclose handle retries
      };

      socket.onclose = () => {
        const attempt = Math.min(reconnectAttemptsRef.current + 1, 6);
        reconnectAttemptsRef.current = attempt;
        const delayMs = Math.pow(2, attempt) * 250;
        setTimeout(() => {
          if (termRef.current) {
            connect();
          }
        }, delayMs);
      };

      term.onData(data => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(data);
        }
      });
    };

    connect();

    // Handle resizing
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (socketRef.current) {
        try { socketRef.current.close(); } catch {}
      }
      term.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Expose writeToTerminal to parent
  useImperativeHandle(ref, () => ({
    writeToTerminal: (text) => {
      // Send the command through WebSocket to actually execute it
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(text);
      }
      // Also write to terminal display for immediate feedback
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
      <div className="terminal-content" ref={xtermRef}></div>
    </div>
  );
});

export default TerminalPanel;