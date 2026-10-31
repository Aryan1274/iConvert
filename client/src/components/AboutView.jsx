import React from 'react';
import './ContentPages.css';

export default function AboutView({ onStartConverting }) {
  const devices = [
    { model: 'iPhone 16 / 16 Pro', formats: '4K120fps Dolby Vision, ProRAW, Apple Log, HEIC' },
    { model: 'iPhone 15 / 15 Pro', formats: 'ProRes 4K, Log, 24MP/48MP HEIF, Display P3' },
    { model: 'iPhone 14 / 14 Pro', formats: 'Cinematic Mode MOV, Action Mode, HEIC, ProRAW' },
    { model: 'iPhone 13 / 13 Pro', formats: 'ProRes, HDR Dolby Vision, 4K60 MOV, HEIC' },
    { model: 'iPhone 12 / 12 Pro', formats: '10-Bit Dolby Vision HDR, HEVC MOV, HEIC' },
    { model: 'Legacy iPhones (7 to 11)', formats: 'Standard HEIC photos, HEVC 4K MOV, 1080p' }
  ];

  return (
    <div className="content-view-container">
      <div className="view-hero-header">
        <span className="view-tag">Privacy-First Engineering</span>
        <h1 className="view-heading">About iConvert</h1>
        <p className="view-description">
          Built to solve the frustrating incompatibility between Apple's modern media formats and Windows/Android ecosystems — without sacrificing user privacy.
        </p>
      </div>

      <div className="about-grid-sections">
        {/* Story Card */}
        <div className="about-card-narrative">
          <h2>The Problem iConvert Solves</h2>
          <p>
            Apple devices shoot some of the highest quality photos and videos on the planet. But by default, iOS stores media in modern high-efficiency formats: <strong>HEIC</strong> for photos and <strong>HEVC MOV</strong> for videos.
          </p>
          <p>
            When users transfer these files to Windows, they frequently encounter blank screens, missing thumbnail previews, or washed-out colors. Online converters promise a quick fix, but uploading sensitive personal videos and private photos to unknown remote servers poses serious privacy risks.
          </p>
          <p>
            <strong>iConvert was created as an uncompromising solution:</strong> an offline, high-speed conversion suite that runs 100% on your local hardware using the world's most trusted media engine: <strong>FFmpeg</strong>.
          </p>
        </div>

        {/* Tech Stack Card */}
        <div className="about-card-specs">
          <h2>Technical Architecture</h2>
          <div className="tech-badge-list">
            <div className="tech-badge-item">
              <span className="tech-badge-name">FFmpeg 7.x & FFprobe</span>
              <span className="tech-badge-desc">Industry-standard core media encoding pipeline</span>
            </div>
            <div className="tech-badge-item">
              <span className="tech-badge-name">Electron & React 19</span>
              <span className="tech-badge-desc">Fast, responsive desktop interface with dark UI</span>
            </div>
            <div className="tech-badge-item">
              <span className="tech-badge-name">Sharp Image Engine</span>
              <span className="tech-badge-desc">High-speed libvips color space calibration</span>
            </div>
            <div className="tech-badge-item">
              <span className="tech-badge-name">Zero Telemetry</span>
              <span className="tech-badge-desc">No trackers, no cookies, no cloud analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Device Support List */}
      <div className="about-devices-section">
        <h2>Supported Apple Devices & Formats</h2>
        <div className="device-specs-grid">
          {devices.map((d, i) => (
            <div key={i} className="device-spec-card">
              <div className="device-model-name">📱 {d.model}</div>
              <div className="device-formats-desc">{d.formats}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Developer Coffee Card */}
      <div className="developer-support-box">
        <div className="dev-avatar-box">☕</div>
        <div className="dev-support-info">
          <h3>Support Open Source Development</h3>
          <p>
            iConvert is independently developed by Aryan. If this app saves you time, space, and protects your privacy, consider buying a coffee!
          </p>
          <div className="dev-support-actions">
            <a href="https://buymeacoffee.com/arvr" target="_blank" rel="noreferrer" className="btn-buy-coffee-lg">
              ☕ Buy Me a Coffee on buymeacoffee.com/arvr
            </a>
            <a href="https://github.com/Aryan1274/iConvert" target="_blank" rel="noreferrer" className="btn-dev-gh">
              Star on GitHub ★
            </a>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button className="view-cta-btn" onClick={onStartConverting}>
          ⚡ Ready to Convert? Go to Converter
        </button>
      </div>
    </div>
  );
}

