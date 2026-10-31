import React from 'react';
import './Navbar.css';

export default function Navbar({ activeTab, setActiveTab, theme, setTheme, serverOnline, loading }) {
  return (
    <header className="app-navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand" onClick={() => setActiveTab('converter')}>
          <div className="brand-logo-icon">iC</div>
          <div className="brand-titles">
            <span className="brand-name">iConvert</span>
            <span className="brand-badge">PRO · OFFLINE</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="navbar-nav">
          <button
            className={`nav-tab-btn ${activeTab === 'converter' ? 'active' : ''}`}
            onClick={() => setActiveTab('converter')}
          >
            <span className="nav-tab-icon">⚡</span>
            <span>Converter</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            <span className="nav-tab-icon">✨</span>
            <span>Features</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'howItWorks' ? 'active' : ''}`}
            onClick={() => setActiveTab('howItWorks')}
          >
            <span className="nav-tab-icon">🛠️</span>
            <span>How It Works</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            <span className="nav-tab-icon">⚖️</span>
            <span>Comparison</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <span className="nav-tab-icon">ℹ️</span>
            <span>About</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="navbar-actions">
          {/* Buy Me a Coffee Toggle/Button */}
          <a
            href="https://buymeacoffee.com/arvr"
            target="_blank"
            rel="noreferrer"
            className="navbar-btn-coffee"
            title="Support the developer on Buy Me a Coffee"
          >
            <span className="coffee-cup-icon">☕</span>
            <span className="coffee-text">Buy Coffee</span>
          </a>

          {/* GitHub Link */}
          <a
            href="https://github.com/Aryan1274/iConvert"
            target="_blank"
            rel="noreferrer"
            className="navbar-btn-secondary"
            title="View Source on GitHub"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span className="gh-text">GitHub</span>
          </a>

          {/* Server Status Indicator */}
          <div className="navbar-status-pill" title={serverOnline ? "Local FFmpeg backend active" : "Waiting for backend"}>
            <span className={`status-dot ${loading ? '' : serverOnline ? 'online' : 'offline'}`}></span>
            <span className="status-label">{loading ? 'Starting…' : serverOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Theme Toggle */}
          <button
            className="navbar-theme-btn"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}

