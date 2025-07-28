import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const TerminalPanel = forwardRef((props, ref) => {
  const xtermRef = useRef();
  const termRef = useRef();
  const fitAddonRef = useRef();

  useEffect(() => {
    const term = new Terminal({ fontSize: 14, theme: { background: '#181a1b' } });
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

  return <div ref={xtermRef} style={{ width: '100%', height: 300, background: '#181a1b' }} />;
});

export default TerminalPanel;   