import React from 'react';
import './ContentPages.css';

export default function FeaturesView({ onStartConverting }) {
  const features = [
    {
      icon: '🔒',
      title: '100% Local & Private Processing',
      subtitle: 'Zero Cloud Uploads · Total Privacy',
      desc: 'Your photos and 4K videos never leave your PC. Conversions execute entirely offline using a sandboxed local FFmpeg engine, safeguarding personal moments, family memories, and confidential media from third-party cloud servers.'
    },
    {
      icon: '🚀',
      title: 'Lossless & Hardware-Accelerated',
      subtitle: 'NVIDIA NVENC · Intel QSV · AMD AMF',
      desc: 'Whenever possible, iConvert performs direct container stream copying (zero re-compression) or taps into your GPU hardware acceleration to convert massive HEVC video files in seconds rather than minutes.'
    },
    {
      icon: '🎨',
      title: 'Apple Display P3 Gamut Calibration',
      subtitle: 'No Washed-Out Colors on Windows',
      desc: 'iPhones capture photos using Apple’s wide Display P3 color gamut. Basic converters strip these color profile tags, causing pale skin tones and blown-out whites. iConvert applies high-fidelity color profile tone mapping to preserve rich contrast.'
    },
    {
      icon: '☀️',
      title: 'Dolby Vision & HDR Tone Mapping',
      subtitle: 'BT.2020 · 10-Bit HDR to Clean SDR',
      desc: 'Converts 10-bit HDR, HLG, and Dolby Vision footage into crisp, universally playable Rec.709 8-bit SDR MP4s. No blown-out highlights or grey haze on Windows media players or Android TVs.'
    },
    {
      icon: '📦',
      title: 'Batch Folder Drag-and-Drop',
      subtitle: 'Unlimited Batch Sizes · 1-Click ZIP',
      desc: 'Drag entire folders with hundreds of iPhone vacation photos and gigabytes of 4K clips. iConvert recursively filters valid formats, runs smooth queue processing, and lets you download everything in a structured ZIP archive.'
    },
    {
      icon: '📸',
      title: 'Full EXIF Metadata Preservation',
      subtitle: 'Dates · GPS Coordinates · Camera Specs',
      desc: 'Retains every detail embedded by iOS: date taken, GPS latitude/longitude, lens focal length, aperture, and camera model. Your converted JPEGs seamlessly organize into Google Photos, Apple Photos, and Lightroom catalogs.'
    }
  ];

  return (
    <div className="content-view-container">
      <div className="view-hero-header">
        <span className="view-tag">Engineered For Apple Media</span>
        <h1 className="view-heading">Why iConvert Outperforms Cloud & Generic Converters</h1>
        <p className="view-description">
          Unlike generic online converters that compress your files on remote servers, iConvert runs locally on your hardware with custom media pipelines built specifically for iPhone 12 through iPhone 16 Pro.
        </p>
        <button className="view-cta-btn" onClick={onStartConverting}>
          ⚡ Start Converting Files Now
        </button>
      </div>

      <div className="features-showcase-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-card-modern">
            <div className="feature-icon-bubble">{f.icon}</div>
            <div className="feature-card-meta">
              <h3>{f.title}</h3>
              <span className="feature-subtitle">{f.subtitle}</span>
              <p>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Support Callout */}
      <div className="content-coffee-banner">
        <div className="coffee-banner-content">
          <span className="coffee-banner-emoji">☕</span>
          <div>
            <h4>Enjoying iConvert?</h4>
            <p>iConvert is 100% free with no watermarks and no limits. Help keep it maintained by buying a coffee!</p>
          </div>
        </div>
        <a href="https://buymeacoffee.com/arvr" target="_blank" rel="noreferrer" className="btn-coffee-banner">
          Support on Buy Me a Coffee
        </a>
      </div>
    </div>
  );
}

