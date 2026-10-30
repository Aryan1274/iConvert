import { useState } from 'react'
import './Footer.css'

// ── Modal Pages ────────────────────────────────────────────────────────────
const PAGES = {
  privacy: {
    title: 'Your Privacy — 100% Guaranteed',
    content: (
      <>
        <p>iConvert is built on one simple rule: <strong>your files never leave your computer.</strong></p>
        <h3>What happens when you convert a file?</h3>
        <p>When you drop a photo or video into iConvert, the conversion happens entirely on your own machine using a local program called <strong>FFmpeg</strong>. Your media files are read from your hard drive, converted, and saved back to your hard drive — all without any internet connection or server communication.</p>
        <h3>Do you collect any data?</h3>
        <p>No. iConvert does not collect, store, transmit, or sell any data whatsoever. There are no analytics, no crash reports, no telemetry, and no user accounts. Nothing leaves your machine.</p>
        <h3>Is it safe to convert sensitive photos or videos?</h3>
        <p>Yes. Because everything stays on your device, iConvert is completely safe for sensitive, personal, or professional media. Your wedding photos, private videos, or work files are never at risk.</p>
        <h3>Cloud converter vs. iConvert</h3>
        <ul>
          <li>❌ Cloud converters upload your files to someone else's server</li>
          <li>❌ You have no control over how long they keep your files</li>
          <li>✅ iConvert: your files stay on your computer, always</li>
        </ul>
      </>
    )
  },
  quality: {
    title: 'Near-Zero Quality Loss — How It Works',
    content: (
      <>
        <p>iConvert is designed to produce conversions that look <strong>virtually identical</strong> to the original — especially for iPhone media.</p>
        <h3>iPhone Video (MOV → MP4)</h3>
        <p>iPhone records video in the <strong>HEVC (H.265)</strong> codec inside a <code>.mov</code> container. iConvert converts it to <strong>H.264 MP4</strong> — the most compatible video format on earth — using high-quality settings that preserve as much detail as possible.</p>
        <p>For standard footage, iConvert uses <strong>stream copy</strong> mode — meaning the video data is transferred without re-encoding, giving you <strong>exactly zero quality loss</strong>.</p>
        <h3>HDR Video (HLG, Dolby Vision, PQ)</h3>
        <p>iPhones 12 and newer record HDR video using formats like <strong>HLG</strong>, <strong>PQ</strong>, and <strong>Dolby Vision</strong>. iConvert automatically detects these and applies industry-standard <strong>tone mapping</strong> algorithms to convert HDR to SDR without the washed-out or blown-out colors you'd get from a naive conversion.</p>
        <h3>iPhone Photos (HEIC → JPG)</h3>
        <p>iConvert converts HEIC photos to JPEG using <strong>quality setting 1</strong> (the highest possible in FFmpeg), preserving all EXIF metadata including date, location, and camera settings.</p>
        <h3>Color Accuracy</h3>
        <p>iConvert automatically detects the color profile of your media — including Display P3 wide-gamut and Apple Log — and calibrates the conversion accordingly. Most converters ignore this completely, causing colors to look washed out or over-saturated.</p>
      </>
    )
  },
  about: {
    title: 'About iConvert',
    content: (
      <>
        <p>iConvert is a <strong>free, open-source, offline media converter</strong> built specifically for iPhone users who want to convert their photos and videos without compromising on quality or privacy.</p>
        <h3>Why was iConvert made?</h3>
        <p>iPhone records photos and videos in Apple's own formats — <strong>HEIC</strong> for photos and <strong>HEVC MOV</strong> for videos. While these are excellent formats, they're not compatible with most apps, websites, and devices that expect standard <strong>JPEG</strong> and <strong>MP4</strong> files.</p>
        <p>Most online converters solve this by uploading your files to their servers — but that means your private photos and videos are sent to a company you don't know, stored on their computers, and potentially used in ways you can't control.</p>
        <p>iConvert solves this differently: <strong>everything runs on your own computer</strong>, with no uploads, no accounts, and no subscriptions.</p>
        <h3>What devices are supported?</h3>
        <p>iConvert is optimized for iPhone 12 through iPhone 16 Pro, covering all major formats these devices produce:</p>
        <ul>
          <li>Standard HEVC video (all models)</li>
          <li>HDR video: HLG, PQ, Dolby Vision (iPhone 12+)</li>
          <li>Apple ProRes video (iPhone 13 Pro+)</li>
          <li>Apple Log video (iPhone 15 Pro+)</li>
          <li>HEIC / HEIF photos (all models)</li>
          <li>Display P3 wide-gamut photos and videos</li>
        </ul>
        <h3>Technology</h3>
        <p>iConvert is powered by <strong>FFmpeg</strong> — the world's most trusted open-source media processing engine used by YouTube, Netflix, and thousands of other services.</p>
      </>
    )
  },
  howItWorks: {
    title: 'How iConvert Works',
    content: (
      <>
        <p>iConvert is a local web application that runs entirely on your own computer. Here's exactly what happens step by step:</p>
        <h3>Step 1 — You open iConvert</h3>
        <p>iConvert runs a small local server on your computer (on port 3001). Your browser connects to <code>localhost:3001</code> — not the internet. The desktop app wraps this in a native window so it looks and feels like a normal application.</p>
        <h3>Step 2 — You select your files</h3>
        <p>You can click to browse for files, or simply <strong>drag and drop</strong> photos and videos — including entire folders. iConvert accepts batches of any size.</p>
        <h3>Step 3 — Auto-detection runs</h3>
        <p>Before converting, iConvert <strong>automatically inspects</strong> every file to detect its exact format, codec, color profile, HDR type, bit depth, and resolution. This happens instantly and locally using FFprobe.</p>
        <h3>Step 4 — Smart conversion</h3>
        <p>Based on what was detected, iConvert picks the best conversion strategy for each file:</p>
        <ul>
          <li><strong>Standard H.264 MOV</strong> → instant lossless stream copy</li>
          <li><strong>HEVC video</strong> → hardware-accelerated H.264 encoding</li>
          <li><strong>HDR video</strong> → tone-mapped SDR H.264 with color accuracy</li>
          <li><strong>HEIC photos</strong> → high-quality JPEG with full EXIF data</li>
        </ul>
        <h3>Step 5 — Download your files</h3>
        <p>Converted files are temporarily saved in a local cache folder. You can download them one by one or all at once as a ZIP, then save them anywhere on your computer.</p>
      </>
    )
  },
  batchDownload: {
    title: 'Batch Conversion & Download',
    content: (
      <>
        <p>iConvert is built for <strong>bulk workflows</strong>. You don't have to convert files one at a time.</p>
        <h3>Batch Upload</h3>
        <p>You can select multiple files at once using the file picker, or drop an entire folder directly onto the converter card. iConvert will automatically scan the folder and find all compatible files (HEIC, MOV, MP4, HEIF).</p>
        <h3>Batch Conversion</h3>
        <p>All selected files are converted one after another automatically. A live progress bar shows you which file is being processed and how many are remaining. You don't need to click anything between files.</p>
        <h3>Batch Download</h3>
        <p>Once all conversions are complete, you can download all the converted files as a single <strong>ZIP archive</strong> with one click — no need to download them individually.</p>
        <h3>How large a batch can I convert?</h3>
        <p>There's no strict limit enforced by iConvert. The practical limit is your computer's storage and memory. For very large batches (100+ files or 4K videos), it simply takes longer — but iConvert will process everything automatically without you needing to monitor it.</p>
      </>
    )
  },
  download: {
    title: 'Download iConvert for Windows',
    content: (
      <>
        <p>iConvert is available as a <strong>free standalone Windows application</strong> that requires no installation of technical tools — everything is included.</p>
        <h3>What's included</h3>
        <ul>
          <li>✅ Full iConvert application</li>
          <li>✅ FFmpeg media engine (bundled — no separate install needed)</li>
          <li>✅ No internet connection required after download</li>
          <li>✅ No subscription, no account, no cost</li>
        </ul>
        <h3>System Requirements</h3>
        <ul>
          <li>Windows 10 or newer (64-bit)</li>
          <li>At least 2 GB of free disk space</li>
          <li>4 GB RAM minimum (8 GB recommended for 4K video)</li>
        </ul>
        <h3>Two versions available</h3>
        <p><strong>Installer version</strong> — installs iConvert to your system with a Start Menu shortcut and desktop icon, just like any normal Windows application.</p>
        <p><strong>Portable version</strong> — a single <code>.exe</code> file you can run directly from anywhere, including a USB drive, without installing anything.</p>
        <h3>Is it safe?</h3>
        <p>Yes. iConvert is built from open-source components (Electron + FFmpeg + Node.js). Windows may show a SmartScreen warning the first time you run it because the application is not code-signed. This is normal for open-source tools. Click "More info" → "Run anyway" to proceed.</p>
      </>
    )
  }
}

// ── Info Modal ─────────────────────────────────────────────────────────────
function InfoModal({ pageKey, onClose }) {
  const page = PAGES[pageKey]
  if (!page) return null

  return (
    <div className="footer-modal-overlay" onClick={onClose}>
      <div className="footer-modal" onClick={e => e.stopPropagation()}>
        <div className="footer-modal-header">
          <h2>{page.title}</h2>
          <button className="footer-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="footer-modal-body">
          {page.content}
        </div>
      </div>
    </div>
  )
}

// ── Footer Component ───────────────────────────────────────────────────────
export default function Footer() {
  const [modalPage, setModalPage] = useState(null)

  const open = (key) => setModalPage(key)
  const close = () => setModalPage(null)

  const features = [
    {
      icon: '🔒',
      title: 'Your Files Never Leave Your Computer',
      desc: 'No uploads, no cloud, no servers. iConvert runs entirely offline on your own machine.',
      link: 'privacy'
    },
    {
      icon: '🎨',
      title: 'Near-Zero Quality Loss',
      desc: 'Smart color detection and tone mapping means your converted files look almost identical to the originals.',
      link: 'quality'
    },
    {
      icon: '⚡',
      title: 'Fast & Hardware Accelerated',
      desc: 'iConvert uses your GPU (when available) to speed up video conversion significantly.',
      link: 'howItWorks'
    },
    {
      icon: '📦',
      title: 'Batch Convert & Download',
      desc: 'Drop an entire folder. Convert hundreds of files at once. Download everything as a single ZIP.',
      link: 'batchDownload'
    },
    {
      icon: '📴',
      title: 'No Internet Required',
      desc: 'Works completely offline after installation. No network connection needed for conversion.',
      link: 'howItWorks'
    },
    {
      icon: '💸',
      title: 'Completely Free',
      desc: 'No subscription, no account, no watermarks, no file size limits. Free forever.',
      link: 'about'
    }
  ]

  return (
    <>
      {modalPage && <InfoModal pageKey={modalPage} onClose={close} />}

      <footer className="site-footer">
        {/* Features Grid */}
        <div className="footer-features">
          <div className="footer-features-inner">
            <p className="footer-section-label">Why iConvert?</p>
            <div className="footer-features-grid">
              {features.map((f) => (
                <button
                  key={f.link + f.title}
                  className="footer-feature-card"
                  onClick={() => open(f.link)}
                >
                  <span className="footer-feature-icon">{f.icon}</span>
                  <div>
                    <strong>{f.title}</strong>
                    <p>{f.desc}</p>
                  </div>
                  <span className="footer-feature-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <div className="footer-brand">
              <span className="footer-logo">⟳</span>
              <span className="footer-brand-name">iConvert</span>
              <span className="footer-tagline">iPhone Media Converter</span>
            </div>

            <nav className="footer-nav" aria-label="Footer navigation">
              <button className="footer-nav-link" onClick={() => open('about')}>About</button>
              <button className="footer-nav-link" onClick={() => open('howItWorks')}>How It Works</button>
              <button className="footer-nav-link" onClick={() => open('quality')}>Quality</button>
              <button className="footer-nav-link" onClick={() => open('privacy')}>Privacy</button>
              <button className="footer-nav-link" onClick={() => open('batchDownload')}>Batch Convert</button>
              <button className="footer-nav-link" onClick={() => open('download')}>Download .exe</button>
            </nav>

            <p className="footer-copy">
              © {new Date().getFullYear()} iConvert · All processing happens on your computer · No data is ever uploaded
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
