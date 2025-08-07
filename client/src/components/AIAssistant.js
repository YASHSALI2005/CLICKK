import React, { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';

// A dedicated component for rendering code blocks with syntax highlighting and a copy button.
const CodeBlock = ({ language, code }) => {
    const codeRef = useRef(null);
    const [copied, setCopied] = useState(false);

    // Effect to apply syntax highlighting when the component mounts or the code changes.
    useEffect(() => {
        if (codeRef.current && window.hljs) {
            window.hljs.highlightElement(codeRef.current);
        }
    }, [code]);

    // Handles copying the code to the clipboard.
    const handleCopy = () => {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed'; // Avoid scrolling to bottom
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset button state after 2 seconds
        } catch (err) {
            console.error('Failed to copy code: ', err);
        }
        document.body.removeChild(textArea);
    };

    return (
        <div className="code-block" style={{ position: 'relative', background: '#1e1e1e', border: '1px solid #3e3e3e', borderRadius: 8, margin: '12px 0', fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace', fontSize: 13, lineHeight: 1.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: '#2d2d30', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                <span style={{ color: '#888', fontSize: 12, textTransform: 'lowercase' }}>{language}</span>
                <button 
                    onClick={handleCopy}
                    style={{ background: 'transparent', color: copied ? '#4CAF50' : '#ccc', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '4px 8px' }}
                >
                    {copied ? (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>
                            Copy code
                        </>
                    )}
                </button>
            </div>
            <pre style={{ margin: 0, padding: '12px', background: 'transparent', overflowX: 'auto' }}><code ref={codeRef} className={`language-${language}`}>{code}</code></pre>
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
          const savedMessages = sessionStorage.getItem('ai-chat-messages');
          return savedMessages ? JSON.parse(savedMessages) : [];
      } catch (error) {
          console.error("Could not parse messages from sessionStorage", error);
          return [];
      }
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('auto');
  const [pastChats, setPastChats] = useState([]);
  const [showPastChats, setShowPastChats] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const agents = [
    { id: 'auto', name: 'Auto', description: 'Automatically choose the best agent' },
    { id: 'perplexity', name: 'Perplexity', description: 'Fast and accurate responses' },
    { id: 'gemini', name: 'Gemini Pro', description: 'Google\'s advanced AI model' },
    { id: 'claude', name: 'Claude', description: 'Anthropic\'s helpful assistant' },
    { id: 'gpt4', name: 'GPT-4', description: 'OpenAI\'s most capable model' }
  ];
  
  useEffect(() => {
    if (document.querySelector('script[src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"]')) {
        return;
    }

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
  }, []);

  useEffect(() => {
      try {
        sessionStorage.setItem('ai-chat-messages', JSON.stringify(messages));
      } catch (error) {
          console.error("Could not save messages to sessionStorage", error);
      }
  }, [messages]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // --- REAL API CALL ---
    // This now calls your backend which will return the structured response.
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          agent: selectedAgent,
          context: {
            currentFile,
            currentCode,
            workspace
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.response,
          // The backend provides this array based on its extraction logic
          codeChanges: data.codeChanges || [], 
          suggestions: data.suggestions,
          timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'error',
          content: data.error || 'Failed to get response from AI',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Network error. Please check your connection.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // This function handles applying the code changes to the editor
  const handleApplyChanges = (messageId, changes) => {
    changes.forEach(change => {
        if (change.type === 'modify' && change.file === currentFile) {
            onCodeChange(change.newContent); // This updates the code in the editor
        } else if (change.type === 'create') {
            onFileCreate(change.file, change.newContent);
        }
    });

    // Update the message to remove the action buttons after applying.
    setMessages(prevMessages => prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, changesApplied: true } : msg
    ));
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAgentChange = (agentId) => {
    setSelectedAgent(agentId);
  };
  
  const renderContent = (content) => {
    if (!content) return null;
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', value: content.substring(lastIndex, match.index) });
        }
        parts.push({ type: 'code', language: match[1] || 'plaintext', value: match[2].trim() });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        parts.push({ type: 'text', value: content.substring(lastIndex) });
    }

    return parts.map((part, index) => {
        if (part.type === 'code') {
            return <CodeBlock key={index} language={part.language} code={part.value} />;
        }
        return <div key={index} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{part.value}</div>;
    });
  };


  const renderMessage = (message) => {
    return (
      <div key={message.id} className={`message ${message.type}`}>
        <div className="message-header">
          <span className="message-author">
            {message.type === 'user' ? 'You' : 'AI Assistant'}
          </span>
          <span className="message-time">{message.timestamp}</span>
        </div>
        <div className="message-content">
          <div className="message-text">
            {message.type === 'ai' ? renderContent(message.content) : message.content}
          </div>

          {/* This UI will now be populated by the live API response */}
          {message.type === 'ai' && message.codeChanges && message.codeChanges.length > 0 && (
            <div className="code-changes-container" style={{ border: '1px solid #444', borderRadius: 8, marginTop: 16 }}>
                <div style={{padding: '8px 12px', background: '#2d2d30', borderBottom: '1px solid #444'}}>
                    <h4 style={{margin: 0, fontSize: 13, color: '#00aeff'}}>AI Code Changes</h4>
                </div>
                <div style={{padding: '12px'}}>
                    {message.codeChanges.map((change, index) => (
                        <div key={index} className="code-change-item" style={{fontSize: 13, marginBottom: 4}}>
                            <span style={{
                                background: change.type === 'modify' ? '#3a3d99' : '#2d7a4b', 
                                padding: '2px 6px', 
                                borderRadius: 4, 
                                marginRight: 8,
                                fontSize: 12
                            }}>{change.type.toUpperCase()}</span>
                            <span>{change.file}</span>
                        </div>
                    ))}
                </div>
                {!message.changesApplied && (
                    <div className="code-changes-actions" style={{padding: '8px 12px', borderTop: '1px solid #444', display: 'flex', gap: 12}}>
                        <button 
                            onClick={() => handleApplyChanges(message.id, message.codeChanges)}
                            style={{background: '#2d7a4b', color: 'white', border: 'none', borderRadius: 5, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 'bold'}}
                        >
                            Accept
                        </button>
                        <button 
                            onClick={() => setMessages(prev => prev.map(msg => msg.id === message.id ? {...msg, changesApplied: true} : msg))}
                            style={{background: '#666', color: 'white', border: 'none', borderRadius: 5, padding: '6px 12px', cursor: 'pointer', fontSize: 13}}
                        >
                            Reject
                        </button>
                    </div>
                )}
            </div>
          )}
          
          {message.type === 'ai' && message.suggestions && (
            <div className="suggestions">
              <h4>Suggestions:</h4>
              <ul>
                {message.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ai-assistant-panel" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#252526',
      color: '#cccccc'
    }}>
      {/* AI Assistant Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #3e3e3e',
        background: '#2d2d30',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span style={{ fontWeight: 600, fontSize: 14 }}>AI Assistant</span>
        </div>
        <div className="agent-selector">
          <select 
            value={selectedAgent} 
            onChange={(e) => handleAgentChange(e.target.value)}
            className="agent-select"
            style={{
              background: '#3c3c3c',
              border: '1px solid #464647',
              color: '#cccccc',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 12
            }}
          >
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Area */}
      <div className="ai-messages" style={{ 
        flex: 1, 
        overflow: 'auto', 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.length === 0 ? (
          <div className="empty-state" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            textAlign: 'center',
            color: '#888'
          }}>
            <div className="empty-icon" style={{ marginBottom: 16 }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#ddd' }}>Start a conversation</h3>
            <p style={{ margin: 0, fontSize: 14 }}>Ask me to help with your code, explain concepts, or suggest improvements.</p>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="message ai loading" style={{
                marginBottom: 16,
                padding: 12,
                background: '#2d2d30',
                borderRadius: 8
              }}>
                <div className="message-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  fontSize: 12,
                  color: '#888'
                }}>
                  <span className="message-author">AI Assistant</span>
                  <span className="message-time">Thinking...</span>
                </div>
                <div className="message-content">
                  <div className="loading-dots" style={{ display: 'flex', gap: 4 }}>
                    <span style={{ 
                      width: 6, 
                      height: 6, 
                      background: '#888', 
                      borderRadius: '50%',
                      animation: 'pulse 1.5s infinite'
                    }}></span>
                    <span style={{ 
                      width: 6, 
                      height: 6, 
                      background: '#888', 
                      borderRadius: '50%',
                      animation: 'pulse 1.5s infinite 0.5s'
                    }}></span>
                    <span style={{ 
                      width: 6, 
                      height: 6, 
                      background: '#888', 
                      borderRadius: '50%',
                      animation: 'pulse 1.5s infinite 1s'
                    }}></span>
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
        padding: '16px',
        borderTop: '1px solid #3e3e3e',
        background: '#2d2d30'
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your code..."
            style={{
              flex: 1,
              background: '#3c3c3c',
              border: '1px solid #464647',
              color: '#cccccc',
              padding: '8px 12px',
              borderRadius: 6,
              resize: 'none',
              fontSize: 14,
              minHeight: 36,
              maxHeight: 120,
              outline: 'none'
            }}
            rows="1"
          />
          <button 
            className="send-btn"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            style={{
              background: !inputValue.trim() || isLoading ? '#464647' : '#0078d4',
              border: 'none',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 6,
              cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 36,
              height: 36
            }}
            title="Send (Enter)"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H.5a.5.5 0 0 0 0 1h13.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
