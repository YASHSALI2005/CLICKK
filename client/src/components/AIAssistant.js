import React, { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';

// Pretty code block with language label and copy button.
const CodeBlock = ({ language, code }) => {
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (codeRef.current && window.hljs) {
      window.hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(err => {
      console.error('Failed to copy code: ', err);
      // Fallback to older method if clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        console.error('Fallback copy failed: ', err);
      }
      document.body.removeChild(textArea);
    });
  };

  return (
    <div
      className="code-block"
      style={{
        position: 'relative',
        background: 'linear-gradient(145deg, #181a23 0%, #262f3c 90%)',
        border: '1px solid rgba(81, 162, 233, 0.24)',
        borderRadius: 12,
        margin: '20px 0 24px',
        fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
        fontSize: 13,
        lineHeight: 1.65,
        boxShadow: hovered ? '0 8px 15px rgba(21, 81, 233, 0.10)' : '0 4px 14px rgba(0,0,0,0.10)',
        transition: 'all 0.35s cubic-bezier(.22,1,.36,1)',
        transform: hovered ? 'translateY(-2px) scale(1.015)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        background: 'linear-gradient(90deg, #283548 0%, #252528 100%)',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottom: '1px solid rgba(81, 162, 233, 0.12)'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 9}}>
          <span style={{width: 10, height: 10, borderRadius: '50%', background: '#ff5f56', boxShadow: '0 0 4px #ff5f5685'}}></span>
          <span style={{width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e', boxShadow: '0 0 4px #ffbd2e85'}}></span>
          <span style={{width: 10, height: 10, borderRadius: '50%', background: '#27c93f', boxShadow: '0 0 4px #27c93f85'}}></span>
          <span style={{color: 'rgba(255,255,255,0.68)', fontSize: 12, marginLeft: 8}}>
            {language}
          </span>
        </div>
        <button onClick={handleCopy}
            style={{
              background: copied ? 'rgba(76, 175, 80, 0.3)' : 'rgba(81, 162, 233, 0.2)',
              color: copied ? '#4caf50' : '#51a2e9',
              border: copied ? '1px solid rgba(76, 175, 80, 0.5)' : '1px solid rgba(81, 162, 233, 0.3)',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              padding: '6px 12px',
              fontWeight: 600,
              transition: 'all 0.18s',
              boxShadow: hovered ? '0 2px 5px rgba(81, 162, 233, 0.2)' : 'none',
              transform: copied ? 'scale(1.05)' : 'none'
            }}>
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
              <span style={{ fontWeight: 600 }}>Copied!</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>
              <span style={{ fontWeight: 600 }}>Copy code</span>
            </>
          )}
        </button>
      </div>
      <div style={{
        position: 'relative',
        background: 'rgba(32,34,44,0.65)',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        overflow: 'hidden',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)'
      }}>
        <pre style={{
          margin: 0,
          padding: '16px',
          background: 'transparent',
          overflowX: 'auto',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <code ref={codeRef} className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const AIAssistant = ({
  currentFile,
  currentCode,
  workspace,
  onCodeChange,
  onFileCreate,
  onFileOpen
}) => {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ai-chat-messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('auto');
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('ai-chat-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const agents = [
    { id: 'auto', name: 'Auto', description: 'Automatically choose the best agent' },
    { id: 'perplexity', name: 'Perplexity', description: 'Fast and accurate responses' },
    { id: 'gemini', name: 'Gemini Pro', description: "Google's advanced AI model" },
    { id: 'cohere', name: 'Cohere', description: "Cohere's command model" },
    { id: 'groq', name: 'Groq', description: "Fast inference with Llama 3" },
    { id: 'claude', name: 'Claude', description: "Anthropic's helpful assistant" },
    { id: 'gpt4', name: 'GPT-4', description: "OpenAI's most capable model" }
  ];

  useEffect(() => {
    if (!document.querySelector('script[src*="highlight.min.js"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        if (document.head.contains(link)) document.head.removeChild(link);
        if (document.body.contains(script)) document.body.removeChild(script);
      };
    }
  }, []);

 useEffect(() => {
    sessionStorage.setItem('ai-chat-messages', JSON.stringify(messages));
    scrollToBottom();
    
    // Save chat to history when a new conversation starts or ends
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'ai') {
        const chatTitle = messages[0]?.content?.substring(0, 30) + '...' || 'Chat';
        const newChat = {
          id: Date.now().toString(),
          title: chatTitle,
          timestamp: new Date().toLocaleString(),
          messages: [...messages]
        };
        
        setChatHistory(prev => {
          const updated = [newChat, ...prev.filter(chat => chat.id !== newChat.id)].slice(0, 10);
          localStorage.setItem('ai-chat-history', JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [messages]);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({behavior:'smooth', block: 'end'}), 80);
  }, [messages, isLoading]);

  useEffect(() => { inputRef.current?.focus(); }, []);
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          agent: selectedAgent,
          context: { currentFile, currentCode, workspace }
        })
      });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'ai',
            content: data.response,
            codeChanges: data.codeChanges || [],
            suggestions: data.suggestions,
            changesApplied: data.changesApplied || false,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 2,
            type: 'error',
            content: data.error || 'Failed to get response from AI.',
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 3,
          type: 'error',
          content: 'Network error. Please check your connection.',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Applying code changes:
  const handleApplyChanges = (messageId, changes) => {
    // Skip if changes were already applied automatically
    const message = messages.find(msg => msg.id === messageId);
    if (message && message.changesApplied) {
      return;
    }
    
    changes.forEach(change => {
      if (change.type === 'modify' && change.file === currentFile) {
        onCodeChange(change.newContent);
      } else if (change.type === 'create') {
        onFileCreate(change.file, change.newContent);
      }
    });
    setMessages(prev =>
      prev.map(msg => (msg.id === messageId ? { ...msg, changesApplied: true } : msg))
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderContent = (content) => {
    if (!content) return null;
    // Enhanced regex to handle code blocks with or without language specification
    // and with different line break styles
    const codeBlockRegex = /```([\w-]*)?\s*\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0, match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: content.substring(lastIndex, match.index) });
      }
      
      // Extract language and code content
      const language = match[1] ? match[1].trim() : 'plaintext';
      const codeContent = match[2].trim();
      
      parts.push({ type: 'code', language, value: codeContent });
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < content.length) {
      parts.push({ type: 'text', value: content.substring(lastIndex) });
    }
    
    return parts.map((part, idx) =>
      part.type === 'code'
        ? <CodeBlock key={idx} language={part.language} code={part.value} />
        : <div key={idx} style={{whiteSpace: 'pre-wrap', lineHeight: 1.7}}>{part.value}</div>
    );
  };

  const renderMessage = (message) => (
    <div key={message.id} className={`message ${message.type}`}>
      <div className="message-header">
        <span className="message-author">{message.type === 'user' ? 'You' : 'AI Assistant'}</span>
        <span className="message-time">{message.timestamp}</span>
      </div>
      <div className="message-content">
        <div className="message-text">
          {message.type === 'ai' ? renderContent(message.content) : message.content}
        </div>
        {!!(message.type === 'ai' && message.codeChanges?.length) && (
          <div className="code-changes-container" style={{
            border: '1px solid #2e6296', borderRadius: 8, marginTop: 18, marginBottom: 10, background: '#1b2230'
          }}>
            <div style={{padding: '8px 12px', background: '#224365', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h4 style={{margin: 0, fontSize: 13, color: '#00aeff'}}>AI Code Changes</h4>
              {message.changesApplied && (
                <span style={{fontSize: 12, color: '#4ade80', fontWeight: 600, background: 'rgba(74, 222, 128, 0.15)', padding: '2px 8px', borderRadius: 4}}>
                  ✓ Changes Applied
                </span>
              )}
            </div>
            <div style={{padding: '12px'}}>
              {message.codeChanges.map((change, index) => (
                <div key={index} style={{
                  fontSize: 13, marginBottom: 4, display: 'flex', gap: 10, alignItems: 'center'
                }}>
                  <span style={{
                    background: change.type === 'modify' ? '#5865f2' : '#3abb7f',
                    padding: '2px 8px', borderRadius: 6, color: '#edf', fontSize: 12, minWidth: 48, textAlign: 'center'
                  }}>{change.type.toUpperCase()}</span>
                  <span style={{color:'#a1eaff'}}>{change.file}</span>
                </div>
              ))}
            </div>
            {!message.changesApplied && (
              <div style={{padding: '8px 12px', borderTop: '1px solid #224365', display:'flex', gap:12, background:'#243c52', borderBottomLeftRadius:8, borderBottomRightRadius:8}}>
                <button
                  onClick={() => handleApplyChanges(message.id, message.codeChanges)}
                  disabled={message.changesApplied}
                  style={{
                    background: message.changesApplied ? '#5a6172' : '#22b77f', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: 5,
                    padding: '7px 16px', 
                    cursor: message.changesApplied ? 'default' : 'pointer', 
                    fontSize: 13, 
                    fontWeight: 'bold',
                    opacity: message.changesApplied ? 0.6 : 1
                  }}
                >Accept</button>
                <button
                  onClick={() => setMessages(prev => prev.map(msg => msg.id === message.id ? {...msg, changesApplied: true} : msg))}
                  disabled={message.changesApplied}
                  style={{
                    background: message.changesApplied ? '#5a6172' : '#aaa', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: 5,
                    padding: '7px 16px', 
                    cursor: message.changesApplied ? 'default' : 'pointer', 
                    fontSize: 13,
                    opacity: message.changesApplied ? 0.6 : 1
                  }}
                >Reject</button>
              </div>
            )}
          </div>
        )}
        {message.type === 'ai' && message.suggestions && (
          <div className="suggestions" style={{
            background:'#1b2230', borderLeft:'3px solid #22b77f', borderRadius:8, margin:'10px 0 0 0', padding:'8px 12px'
          }}>
            <h4 style={{margin:0, color:'#22b77f', fontSize:13}}>Suggestions:</h4>
            <ul style={{margin:0, paddingLeft:16, fontSize:13, color:'#aad'}}>
              {message.suggestions.map((suggestion, i) => <li key={i}>{suggestion}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="ai-assistant-panel" style={{
      height:'100%', display:'flex', flexDirection:'column', background:'#222932', color:'#dde4ed'
    }}>
      {/* AI Assistant Header */}
      <div style={{
        padding: '12px 16px 12px',
        borderBottom: '1px solid #3977d8',
        background: 'linear-gradient(90deg, #1e2a3a 20%, #222932 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="26" height="26" fill="none" stroke="#6ce0f0" strokeWidth="2.2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3.5" style={{fill:'#22b77f'}} />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '.03em' }}>AI Assistant</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button 
            onClick={() => setMessages([])} 
            title="New Chat"
            style={{
              background: 'linear-gradient(135deg, #51a2e9 0%, #17eaaa 95%)',
              border: 'none',
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(81, 162, 233, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
              <path d="M12 4v16m-8-8h16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </button>
          <button 
            className="history-button"
            onClick={() => setShowHistory(!showHistory)} 
            title="Chat History"
          >
            <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2" />
              <polyline points="12 6 12 12 16 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="agent-selector">
            <select
              value={selectedAgent}
              onChange={e => setSelectedAgent(e.target.value)}
              className="agent-select"
              style={{
                background: 'linear-gradient(135deg, #2a3143 0%, #1e2a3a 100%)', 
                border: '1px solid #245282', 
                color: '#aad', 
                padding: '5px 10px',
                borderRadius: 5, 
                fontSize: 12, 
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer'
              }}
            >
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {showHistory && (
        <div className="chat-history-panel">
          <div className="chat-history-header">
            <h3>Chat History</h3>
            <button onClick={() => setShowHistory(false)}>×</button>
          </div>
          <div className="chat-history-list">
            {chatHistory.length === 0 ? (
              <div className="no-history">No chat history found</div>
            ) : (
              chatHistory.map(chat => (
                <div 
                  key={chat.id} 
                  className="chat-history-item"
                  onClick={() => {
                    setMessages(chat.messages);
                    setShowHistory(false);
                  }}
                >
                  <div className="chat-history-title">{chat.title}</div>
                  <div className="chat-history-timestamp">{chat.timestamp}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* Messages Area */}
      <div className="ai-messages" style={{
        flex: 1,
        overflow: 'auto',
        padding: '18px 16px 12px',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #21263a 0%, #181e28 100%)'
      }}>
        {messages.length === 0 ? (
          <div className="empty-state" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            minHeight:300,
            textAlign: 'center',
            color: '#9ad3f4'
          }}>
            <div className="empty-icon" style={{ marginBottom: 18 }}>
              <svg width="54" height="54" fill="none" stroke="#51a2e9" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="3" />
                <circle cx="8" cy="10" r="1.1" />
                <circle cx="16" cy="10" r="1.1" />
                <path d="M8 15c.95.66 2.18 1 3.5 1s2.55-.34 3.5-1" />
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 17, color: '#ffe' }}>Start a conversation</h3>
            <p style={{ margin:0, fontSize:14, color:'#aad' }}>Ask me for code help, explanations, or suggestions.</p>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="message ai loading" style={{
                margin: '12px 0 12px 0',
                padding: 18,
                background: 'rgba(30,48,82,0.22)',
                borderRadius: 10,
                border: '1px solid #233a56',
                boxShadow: '0 4px 10px #1742af12'
              }}>
                <div className="message-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  fontSize: 12,
                  color: '#66c'
                }}>
                  <span className="message-author">AI Assistant</span>
                  <span className="message-time">Thinking...</span>
                </div>
                <div className="message-content">
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center', height: 18 }}>
                    <span style={{
                      width: 8, height: 8, background: '#3dc8e8',
                      borderRadius: '50%', animation: 'opacityPulse 1.5s infinite alternate', display: 'inline-block'
                    }}></span>
                    <span style={{
                      width: 8, height: 8, background: '#70efac',
                      borderRadius: '50%', animation: 'opacityPulse 1.5s infinite .2s alternate', display: 'inline-block'
                    }}></span>
                    <span style={{
                      width: 8, height: 8, background: '#51a2e9',
                      borderRadius: '50%', animation: 'opacityPulse 1.5s infinite .4s alternate', display: 'inline-block'
                    }}></span>
                    <span style={{marginLeft: 10, color:'#67d', fontSize:14, letterSpacing:1}}>Composing…</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Area */}
      <div style={{
        padding: '18px 16px 16px',
        borderTop: '1px solid #171d2c',
        background: 'linear-gradient(90deg, #222932 70%, #25334b 100%)'
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your code…"
            style={{
              flex: 1,
              background: '#232e3b',
              border: '1.3px solid #2463aa',
              color: '#dde4ed',
              borderRadius: 7,
              minHeight: 38,
              maxHeight: 109,
              fontSize: 15,
              padding: '9px 13px',
              boxShadow: '0 1px 6px #2463aa30',
              resize: 'none',
              outline: 'none'
            }}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="send-btn"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            style={{
              background: !inputValue.trim() || isLoading ? '#464647' : 'linear-gradient(132deg,#51a2e9 0%, #17eaaa 95%)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              padding: '9px 18px',
              borderRadius: 6,
              cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: 17,
              boxShadow: !inputValue.trim() || isLoading ? 'none' : '0 2px 8px #51a2e94a'
            }}
            title="Send (Enter)"
          >▶</button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

// Add this CSS globally for the loading dots animation:
/*
@keyframes opacityPulse {
  0% {opacity: .7;}
  80% {opacity: 1;}
  100% {opacity: .6;}
}
*/

