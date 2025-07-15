import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function TerminalPanel() {
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

    const socket = new window.WebSocket('ws://localhost:8081');

    socket.onmessage = (event) => {
      term.write(event.data);
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

  // Ensure fitAddon.fit() is called after mount and on resize
  useEffect(() => {
    setTimeout(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    }, 100); // Increased delay to 100ms
  }, []);

  return <div ref={xtermRef} style={{ width: '100%', height: 300, background: '#181a1b' }} />;
}   