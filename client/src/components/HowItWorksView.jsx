import React from 'react';
import './ContentPages.css';

export default function HowItWorksView({ onStartConverting }) {
  const steps = [
    {
      num: '01',
      title: 'Import Files or Folders',
      desc: 'Drag & drop HEIC, HEIF, MOV, or MP4 files directly into iConvert. You can even drag entire subfolders — our background scanner automatically identifies and queues all compatible iPhone files.',
      details: ['Drag-and-drop native support', 'Folder recursive scanning', 'No file size restrictions']
    },
    {
      num: '02',
      title: 'Auto-Inspection & Probing',
      desc: 'Before touching a single pixel, iConvert probes the container format, color gamut (Display P3 vs sRGB), HDR transfer characteristics (HLG/PQ/Dolby Vision), and bit depth (8-bit vs 10-bit).',
      details: ['FFprobe metadata inspection', 'Dynamic tone map calculation', 'Zero guess work']
    },
    {
      num: '03',
      title: 'Local Sandboxed Conversion',
      desc: 'Your CPU and GPU process the files locally on your computer. If the stream codec is already supported, iConvert performs an instant zero-loss stream copy. If re-encoding is necessary, it uses highest quality CRF settings.',
      details: ['Hardware accelerated encoding', 'Zero internet bandwidth used', 'CRF quality calibration']
    },
    {
      num: '04',
      title: 'Instant Download & Batch ZIP',
      desc: 'Download your converted JPEG photos or MP4 videos individually, or bundle everything into a clean ZIP archive with a single click. Converted files save directly to your Downloads folder.',
      details: ['Individual download preview', '1-Click ZIP bundle', 'Zero cloud retention']
    }
  ];

  return (
    <div className="content-view-container">
      <div className="view-hero-header">
        <span className="view-tag">Transparent Architecture</span>
        <h1 className="view-heading">How iConvert Converts Without Quality Loss</h1>
        <p className="view-description">
          A step-by-step breakdown of how iConvert transforms stubborn iPhone HEIC photos and MOV videos into universal JPEG and MP4 formats right on your device.
        </p>
        <button className="view-cta-btn" onClick={onStartConverting}>
          ⚡ Try It Now
        </button>
      </div>

      <div className="how-steps-timeline">
        {steps.map((s, i) => (
          <div key={i} className="how-step-card">
            <div className="how-step-badge">{s.num}</div>
            <div className="how-step-content">
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <ul className="how-step-checklist">
                {s.details.map((d, di) => (
                  <li key={di}>
                    <span className="check-bullet">✓</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Coffee Callout */}
      <div className="content-coffee-banner">
        <div className="coffee-banner-content">
          <span className="coffee-banner-emoji">☕</span>
          <div>
            <h4>Love Offline Privacy?</h4>
            <p>Every donation on Buy Me a Coffee directly supports ongoing optimization for new iPhone releases.</p>
          </div>
        </div>
        <a href="https://buymeacoffee.com/arvr" target="_blank" rel="noreferrer" className="btn-coffee-banner">
          Buy Me a Coffee
        </a>
      </div>
    </div>
  );
}

