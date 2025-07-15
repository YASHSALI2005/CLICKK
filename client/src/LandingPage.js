import React from 'react';

export default function LandingPage({ onInstall, showInstallButton }) {
  // Handler to redirect to main app
  const handleLogoClick = (e) => {
    e.preventDefault();
    window.location.href = '/';
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#1e1e1e', color: '#ffffff', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Animated Dots Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 30%, #23272e 0%, #181a1b 100%)',
        opacity: 0.95,
      }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          {Array.from({ length: 120 }).map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * window.innerWidth}
              cy={Math.random() * window.innerHeight}
              r={Math.random() * 1.2 + 0.3}
              fill="#222"
              opacity={Math.random() * 0.5 + 0.2}
            />
          ))}
        </svg>
      </div>

      {/* Navbar */}
      <nav
        style={{
          backgroundColor: '#0d1117',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 40px',
          height: '64px',
          borderBottom: '1px solid #222',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            height: '100%',
            padding: 0,
          }}
          onClick={handleLogoClick}
          title="Go to main page"
        >
          <img
            src="/icon.png"
            alt="Logo"
            style={{
              height: '40px',
              width: '40px',
              objectFit: 'contain',
              display: 'block',
              margin: 0,
              padding: 0,
            }}
          />
          <span
            style={{
              fontSize: '1.6rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              height: '40px',
              lineHeight: '40px',
              margin: 0,
              padding: 0,
            }}
          >
            CLICKK
          </span>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '0.95rem', color: '#bbb', alignItems: 'center', height: '100%' }}>
          <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Docs</a>
          <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Updates</a>
          <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Blog</a>
          <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>API</a>
          <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Extensions</a>
          <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>GitHub</a>
        </div>
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
      </nav>

      {/* Hero Section */}
      <section style={{
        background: 'transparent',
        padding: '100px 40px 80px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          marginBottom: '24px',
          textShadow: '0 2px 12px #0008',
        }}>
          The open source <br /> <span style={{ color: '#4fc3f7' }}>AI code editor</span>
        </h1>

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


        <div style={{ color: '#aaa', marginTop: '8px' }}>
          Web, Insiders edition, or other platforms
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 40px', backgroundColor: 'transparent', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '40px' }}>
          Code with rich features
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {[
            ['Integrated terminal', 'Use your favorite shell inside the editor.'],
            ['Run code', 'Run and debug code without leaving the editor.'],
            ['Version control', 'Built-in support for git and others.'],
            ['Build tasks', 'Analyze tool output inside VS Code.'],
            ['Local history', 'Track changes without external tools.'],
            ['Themes', 'Customize the editor to match your vibe.'],
            ['Accessibility', 'Optimized for keyboard and screen reader users.'],
            ['Web support', 'Access your code anywhere from any device.']
          ].map(([title, desc]) => (
            <div key={title} style={{
              backgroundColor: '#252526',
              borderRadius: '8px',
              padding: '20px',
              color: '#ddd',
              border: '1px solid #333',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#4fc3f7' }}>{title}</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
