import React from 'react';
import './ContentPages.css';

export default function ComparisonView({ onStartConverting }) {
  const rows = [
    {
      feature: 'Privacy & Security',
      iconvert: '100% Local (Never leaves your PC)',
      cloud: 'Uploaded to 3rd party remote servers',
      windows: 'Local, but missing Apple codecs'
    },
    {
      feature: 'File Size Limits',
      iconvert: 'Unlimited (Multi-GB 4K videos OK)',
      cloud: 'Capped at 25MB - 100MB without paid tier',
      windows: 'Fails or lags on large HEVC files'
    },
    {
      feature: 'Internet Bandwidth Needed',
      iconvert: '0 MB (Works completely offline)',
      cloud: 'Gigabytes of upload & download data',
      windows: '0 MB'
    },
    {
      feature: 'Display P3 Color Gamut',
      iconvert: 'Calibrated tone mapping (No washed out look)',
      cloud: 'Often ignored (Colors look pale on Windows)',
      windows: 'Requires paid HEIF extensions'
    },
    {
      feature: 'Dolby Vision & 10-Bit HDR',
      iconvert: 'Auto-detected & tone mapped to clean SDR',
      cloud: 'Frequently blows out highlights',
      windows: 'Black screen or audio-only playback'
    },
    {
      feature: 'Batch Processing & Folders',
      iconvert: 'Drop entire folders + 1-click ZIP download',
      cloud: 'Strict daily quota limits (5 - 10 conversions)',
      windows: 'Manual one-by-one conversion only'
    },
    {
      feature: 'Pricing & Watermarks',
      iconvert: 'Free & Open Source forever (No watermarks)',
      cloud: 'Monthly subscriptions ($9 - $25/mo)',
      windows: '$0.99 codec purchase in Microsoft Store'
    }
  ];

  return (
    <div className="content-view-container">
      <div className="view-hero-header">
        <span className="view-tag">Side-by-Side Breakdown</span>
        <h1 className="view-heading">iConvert vs Cloud & Standard Converters</h1>
        <p className="view-description">
          See why tech-savvy iPhone users switch from clunky browser upload sites to iConvert's lightning-fast local converter.
        </p>
        <button className="view-cta-btn" onClick={onStartConverting}>
          ⚡ Convert Without Limits
        </button>
      </div>

      <div className="comparison-table-wrapper">
        <table className="comparison-matrix-table">
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Feature</th>
              <th className="highlight-col" style={{ width: '30%' }}>
                <span className="col-header-badge">★ Recommended</span>
                iConvert
              </th>
              <th style={{ width: '21%' }}>CloudConvert / Online</th>
              <th style={{ width: '21%' }}>Windows Photos / Store</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="feature-cell">
                  <strong>{row.feature}</strong>
                </td>
                <td className="highlight-col val-iconvert">
                  <span className="cell-check-icon">✓</span>
                  <span>{row.iconvert}</span>
                </td>
                <td className="val-cloud">
                  <span className="cell-cross-icon">✕</span>
                  <span>{row.cloud}</span>
                </td>
                <td className="val-windows">
                  <span className="cell-warn-icon">⚠️</span>
                  <span>{row.windows}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Coffee Callout */}
      <div className="content-coffee-banner">
        <div className="coffee-banner-content">
          <span className="coffee-banner-emoji">☕</span>
          <div>
            <h4>Support Independent Development</h4>
            <p>iConvert saves you hundreds of dollars in cloud converter subscriptions. Show some love on Buy Me a Coffee!</p>
          </div>
        </div>
        <a href="https://buymeacoffee.com/arvr" target="_blank" rel="noreferrer" className="btn-coffee-banner">
          Buy Me a Coffee
        </a>
      </div>
    </div>
  );
}

