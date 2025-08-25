import React from 'react';
import './LandingPage.css'; // Assuming you have a CSS file for styling
export default function LandingPage({ onInstall, showInstallButton }) {
  // Handler to redirect to main app
  const handleLogoClick = (e) => {
    e.preventDefault();
    window.location.href = '/';
  };

  return (
    <div className="landing-container">
      <header className="navbar">
        <div className="logo">
          <img src="/icon.png" alt="Click Logo" className="logo-img" />
          <span>Clickk</span>
        </div>

        <div className="right-nav">
          <ul className="nav-links">
            <li><a href="#about">About Us</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
{showInstallButton && (
          <button
            onClick={onInstall}
            style={{
              background: '#03abf4',
              color: '#fff',
              border: 'none',
              padding: '10px 28px',
              borderRadius: 6,
              fontWeight: '500',
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0005',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              height: '44px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Download 
            </span>
          </button>
        )}
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>The Open Source</h1>
            <p>AI Code Editor</p>

            <div className="hero-buttons">
           {showInstallButton && (
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <button
      onClick={onInstall}
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        border: 'none',
        fontSize: '1.2rem',
        padding: '16px 36px',
        borderRadius: '8px',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px #0005',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <img src="/windows.png" alt="Windows" style={{ width: 20, height: 20 }} />
      <span>Download for Windows</span>
    </button>
  </div>
)}


            </div>

            <div className="video-preview">
              <video src="/your-video.mp4" controls className="feature-video" />
            </div>

            <div className="info-blocks">
              <div className="info-box">
                <h3>Any model for any team</h3>
                <p>Use AI models like Claude 3.5 Sonnet via OpenRouter out of the box, or bring your own key to access models from Azure, Anthropic, Google, Ollama, OpenAI, and OpenRouter.</p>
              </div>
              <div className="info-box">
                <h3>An expert on your codebase</h3>
                <p>Your codebase is indexed locally and remotely (on GitHub) to understand what's relevant, enabling fast, context-aware interactions.</p>
              </div>
              <div className="info-box">
                <h3>AI that works the way your team does</h3>
                <p>Personalize interactions using custom instructions and reusable prompt files tailored to your workflows, tools, and projects.</p>
              </div>
            </div>
          
          {/* Agent Mode Section */}
          <section className="agent-section">
            <div className="agent-left">
              <h2>Agent mode</h2>
              <p>
                Tackle complex, multi-step tasks. Agent mode reads your codebase, suggests edits across files, runs terminal commands, and responds to compile or test failures — all in a loop until the job is done. Refine agent mode with VS Code extensions and Model Context Protocol (MCP) servers.
              </p>
              <a href="#" className="agent-link">Build with agent mode</a>
            </div>
            <div className="agent-right">
              <div className="code-editor">
                <div className="editor-tab">
                  <span>projects.tsx</span>
                </div>
                <div className="code-content">
                  <div className="code-line"><span className="line-number">1</span><span className="code-text">import React from &apos;react&apos;;</span></div>
                  <div className="code-line"><span className="line-number">2</span><span className="code-text">import &#123; useState &#125; from &apos;react&apos;;</span></div>
                  <div className="code-line"><span className="line-number">3</span><span className="code-text"></span></div>
                  <div className="code-line"><span className="line-number">4</span><span className="code-text">interface Project &#123;</span></div>
                  <div className="code-line"><span className="line-number">5</span><span className="code-text">  title: string;</span></div>
                  <div className="code-line"><span className="line-number">6</span><span className="code-text">  description: string;</span></div>
                  <div className="code-line"><span className="line-number">7</span><span className="code-text">  images: string[];</span></div>
                  <div className="code-line"><span className="line-number">8</span><span className="code-text">  link: string;</span></div>
                  <div className="code-line"><span className="line-number">9</span><span className="code-text">&#125;</span></div>
                  <div className="code-line"><span className="line-number">10</span><span className="code-text"></span></div>
                  <div className="code-line"><span className="line-number">11</span><span className="code-text">const Project: React.FC&lt;Project&gt; = (&#123;</span></div>
                  <div className="code-line"><span className="line-number">12</span><span className="code-text">  title,</span></div>
                  <div className="code-line"><span className="line-number">13</span><span className="code-text">  description,</span></div>
                  <div className="code-line"><span className="line-number">14</span><span className="code-text">  images,</span></div>
                  <div className="code-line"><span className="line-number">15</span><span className="code-text">  link</span></div>
                  <div className="code-line"><span className="line-number">16</span><span className="code-text">&#125;) =&gt; &#123;</span></div>
                  <div className="code-line"><span className="line-number">17</span><span className="code-text">  return (</span></div>
                  <div className="code-line"><span className="line-number">18</span><span className="code-text">    &lt;div className=&quot;project-card&quot;&gt;</span></div>
                  <div className="code-line"><span className="line-number">19</span><span className="code-text">      &lt;h3&gt;&#123;title&#125;&lt;/h3&gt;</span></div>
                  <div className="code-line"><span className="line-number">20</span><span className="code-text">      &lt;p&gt;&#123;description&#125;&lt;/p&gt;</span></div>
                  <div className="code-line"><span className="line-number">21</span><span className="code-text">    &lt;/div&gt;</span></div>
                </div>
                <div className="chat-overlay">
                  <div className="chat-header">
                    <span>CHAT</span>
                  </div>
                  <div className="chat-messages">
                    <div className="message user-message">
                      <span className="user-name">Kenzi.lawson</span>
                      <span className="message-text">What are my open issues?</span>
                    </div>
                    <div className="message bot-message">
                      <span className="bot-name">GitHub Copilot</span>
                      <span className="message-text">Let me check for any open issues in your repository.</span>
                    </div>
                    <div className="action-box">
                      <span>&gt; Ran list_issues</span>
                    </div>
                    <div className="message bot-message">
                      <span className="message-text">1. Issue #4: &quot;Create detailed flow for adding new journal entries to the app&quot;</span>
                    </div>
                    <div className="message bot-message">
                      <span className="message-text">Created on March 21, 2025</span>
                    </div>
                    <div className="message bot-message">
                      <span className="message-text">Assigned to you</span>
                    </div>
                    <div className="message bot-message">
                      <span className="message-text">Description: Create a detailed user flow exploring all the options for adding a new journal entry.</span>
                    </div>
                  </div>
                  <div className="chat-input">
                    <div className="input-icons">
                      <span className="mic-icon">🎤</span>
                      <span className="magic-icon">✨</span>
                      <span className="clip-icon">📎</span>
                    </div>
                    <input type="text" placeholder="Ask Copilot or type / for commands" />
                    <div className="input-controls">
                      <select className="agent-select">
                        <option>Agent</option>
                      </select>
                      <select className="model-select">
                        <option>Claude 3.5 Sonnet (via OpenRouter)</option>
                      </select>
                      <button className="play-button">▶</button>
                      <select className="more-select">
                        <option>⋯</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Code in Any Language Section */}
          <section className="code-section">
            <div className="code-left">
              <h2>Code in Any Language</h2>
              <p>
                Instantly generate, view, and copy code snippets in your favorite programming languages. Perfect for learning, sharing, and building faster!
              </p>
            </div>
            <div className="code-grid">
              <div className="code-card">
                <div className="code-icon-container">
                  <img src="/icons/file_type_python.svg" alt="Python" />
                </div>
                <h3>Python</h3>
              </div>
              <div className="code-card">
                <div className="code-icon-container">
                  <img src="/icons/file_type_java.svg" alt="Java" />
                </div>
                <h3>Java</h3>
              </div>
              <div className="code-card">
                <div className="code-icon-container">
                <img src="/icons/javascript.png" alt="JavaScript" />
                </div>
                <h3>JavaScript</h3>
              </div>
              <div className="code-card">
                <div className="code-icon-container">
                  <img src="/icons/images.png" alt="React" />
                </div>
                <h3>React</h3>
              </div>
              <div className="code-card">
                <div className="code-icon-container">
                  <img src="/icons/file_type_c.svg" alt="C" />
                </div>
                <h3>C</h3>
              </div>
              <div className="code-card">
                <div className="code-icon-container">
                  <img src="/icons/file_type_html.svg" alt="HTML" />
                </div>
                <h3>HTML</h3>
              </div>
              <div className="code-card">
                <div className="code-icon-container">
                  <img src="/icons/file_type_css.svg" alt="CSS" />
                </div>
                <h3>CSS</h3>
              </div>
              <div className="code-card">
                <div className="code-icon-container">
                  <img src="/icons/folder_type_next.svg" alt="Nextjs" />
                </div>
                <h3>Nextjs</h3>
              </div>
              <div className="code-card">
                <div className="code-icon-container">
                  <img src="/icons/folder_type_node.svg" alt="Node" />
                </div>
                <h3>Node</h3>
              </div>
            </div>
          </section>
          
          {/* Rich Features Section */}
          <section className="features-section">
            <div className="features-left">
              <h2>Code with rich features</h2>
              <p>
                There's a lot more to an editor. Whether it's using built-in features or rich extensions, there's something for everyone.
              </p>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 7L12 14L19 7" stroke="#0078d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#0078d4" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3>Integrated terminal</h3>
                  <p>Use your favorite shell whether it's zsh, pwsh, or git bash, all inside the editor.</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5L19 12L8 19V5Z" stroke="#0078d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 5L16 12L5 19V5Z" stroke="#0078d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3>Run code</h3>
                  <p>Run and debug your code without leaving your editor.</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke="#0078d4" strokeWidth="2"/>
                    <path d="M12 1V4" stroke="#0078d4" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 20V23" stroke="#0078d4" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M4.22 4.22L6.34 6.34" stroke="#0078d4" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M17.66 17.66L19.78 19.78" stroke="#0078d4" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M1 12H4" stroke="#0078d4" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M20 12H23" stroke="#0078d4" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6.34 17.66L4.22 19.78" stroke="#0078d4" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M19.78 4.22L17.66 6.34" stroke="#0078d4" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h3>Version control</h3>
                  <p>Built-in support for git and many other source control providers.</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.7 6.3L9 12L14.7 17.7" stroke="#0078d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12H21" stroke="#0078d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 12H9" stroke="#0078d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3>Build tasks</h3>
                  <p>Run tools and analyze their results from within VS Code.</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#0078d4" strokeWidth="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="#0078d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3>Local history</h3>
                  <p>Never lose your changes with automatically tracked local history.</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="13.5" cy="6.5" r="1.5" stroke="#0078d4" strokeWidth="2"/>
                    <circle cx="17.5" cy="10.5" r="1.5" stroke="#0078d4" strokeWidth="2"/>
                    <circle cx="8.5" cy="7.5" r="1.5" stroke="#0078d4" strokeWidth="2"/>
                    <circle cx="6.5" cy="12.5" r="1.5" stroke="#0078d4" strokeWidth="2"/>
                    <circle cx="10.5" cy="16.5" r="1.5" stroke="#0078d4" strokeWidth="2"/>
                    <circle cx="15.5" cy="15.5" r="1.5" stroke="#0078d4" strokeWidth="2"/>
                    <circle cx="19.5" cy="11.5" r="1.5" stroke="#0078d4" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3>Themes</h3>
                  <p>Your theme is an extension of your personality. Add some flair to your editor and add your touch.</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="#0078d4" strokeWidth="2"/>
                    <path d="M6 8H18" stroke="#0078d4" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6 12H18" stroke="#0078d4" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6 16H14" stroke="#0078d4" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h3>Accessibility</h3>
                  <p>Optimized experience for screen readers, high contrast themes, and keyboard-only navigation.</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#0078d4" strokeWidth="2"/>
                    <path d="M2 12H22" stroke="#0078d4" strokeWidth="2"/>
                    <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22" stroke="#0078d4" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 2C9.49872 4.73835 8.07725 8.29203 8 12C8.07725 15.708 9.49872 19.2616 12 22" stroke="#0078d4" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h3>Web support</h3>
                  <p>Whether you are on your phone, tablet, or desktop, you can access your code from anywhere.</p>
                </div>
              </div>
            </div>
          </section>
        </div> {/* end hero-content */}
      </div> {/* end hero-overlay */}
    </section> {/* end hero-section */}
    
    {/* Footer */}
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-social">
          <a href="#" className="social-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="#" className="social-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href="#" className="social-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link">Support</a>
          <a href="#" className="footer-link">Privacy</a>
          <a href="#" className="footer-link">Terms of Use</a>
          <a href="#" className="footer-link">License</a>
        </div>
        <div className="footer-windows">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 3.545L10.91 2.182V12H0V3.545zM0 13.636L10.91 12.273V22.091H0V13.636zM12.727 2.182L24 0.909V12H12.727V2.182zM12.727 13.636L24 12.364V24H12.727V13.636z"/>
          </svg>
        </div>
      </div>
    </footer>
    </div>
  );
};

