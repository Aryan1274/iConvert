import { useState, useEffect, useRef } from 'react'
import ConversionCard from './components/ConversionCard'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import FeaturesView from './components/FeaturesView'
import HowItWorksView from './components/HowItWorksView'
import ComparisonView from './components/ComparisonView'
import AboutView from './components/AboutView'

function App() {
  const [theme, setTheme] = useState('dark')
  const [activeTab, setActiveTab] = useState('converter')
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch health status on mount
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => { setHealth(data); setLoading(false) })
      .catch(() => { setHealth(null); setLoading(false) })
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const serverOnline = health?.status === 'ok'
  const ffmpegAvailable = health?.dependencies?.ffmpeg?.available

  // ── Converter state ──────────────────────────────────────────
  // type: 'image' | 'video'
  // phase: 'idle' | 'selected' | 'converting' | 'done'
  const [converterState, setConverterState] = useState({
    type: null,
    phase: 'idle',
    selectedFiles: [],   // File objects from native picker
    results: [],         // [{ originalName, name, url }]
    errors: [],
    progress: null,      // { done, total } during conversion
  })

  const imageFileInput = useRef(null)
  const imageFolderInput = useRef(null)
  const videoFileInput = useRef(null)
  const videoFolderInput = useRef(null)

  // ── Drag and Drop state ──────────────────────────────────────
  const [dragTarget, setDragTarget] = useState(null) // 'image' | 'video' | null
  const [panelDrag, setPanelDrag] = useState(false)

  // Prevent default browser file drop behavior across entire window
  useEffect(() => {
    const prevent = e => e.preventDefault()
    window.addEventListener('dragover', prevent)
    window.addEventListener('drop', prevent)
    return () => {
      window.removeEventListener('dragover', prevent)
      window.removeEventListener('drop', prevent)
    }
  }, [])

  // ── Recursively extract files from dropped files or folders ─────
  const extractFilesFromDataTransfer = async dataTransfer => {
    const files = []
    const items = dataTransfer.items

    if (items && items.length > 0 && items[0].webkitGetAsEntry) {
      const queue = []
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.()
        if (entry) queue.push(entry)
      }

      const readEntry = async entry => {
        if (entry.isFile) {
          return new Promise(resolve => {
            entry.file(f => resolve([f]), () => resolve([]))
          })
        } else if (entry.isDirectory) {
          return new Promise(resolve => {
            const dirReader = entry.createReader()
            const dirFiles = []
            const readBatch = () => {
              dirReader.readEntries(async entries => {
                if (entries.length === 0) {
                  resolve(dirFiles)
                } else {
                  for (const sub of entries) {
                    const subFiles = await readEntry(sub)
                    dirFiles.push(...subFiles)
                  }
                  readBatch()
                }
              }, () => resolve(dirFiles))
            }
            readBatch()
          })
        }
        return []
      }

      for (const entry of queue) {
        const extracted = await readEntry(entry)
        files.push(...extracted)
      }
    } else if (dataTransfer.files) {
      files.push(...Array.from(dataTransfer.files))
    }

    return files
  }

  // ── Drag event handlers ───────────────────────────────────────
  const handleDragOver = (e, target) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragTarget !== target) setDragTarget(target)
  }

  const handleDragLeave = (e, target) => {
    e.preventDefault()
    e.stopPropagation()
    // Only reset if leaving the card container itself
    if (e.currentTarget.contains(e.relatedTarget)) return
    setDragTarget(null)
  }

  const handleDrop = async (e, target) => {
    e.preventDefault()
    e.stopPropagation()
    setDragTarget(null)
    const files = await extractFilesFromDataTransfer(e.dataTransfer)
    handleFilesSelected(target, files)
  }

  // ── Open native OS file picker ────────────────────────────────
  const openFilePicker = (type, mode) => {
    // mode: 'files' | 'folder'
    if (type === 'image') {
      mode === 'folder' ? imageFolderInput.current.click() : imageFileInput.current.click()
    } else {
      mode === 'folder' ? videoFolderInput.current.click() : videoFileInput.current.click()
    }
  }

  // ── Handle file/folder selection ──────────────────────────────
  const handleFilesSelected = (type, fileList) => {
    const exts = type === 'image'
      ? ['.heic', '.heif', '.jpg', '.jpeg', '.png']
      : ['.mov', '.mp4']

    const files = Array.from(fileList).filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase()
      return exts.includes(ext)
    })

    if (files.length === 0) {
      alert(`No compatible ${type} files found. Supported: ${exts.join(', ').toUpperCase()}`)
      return
    }

    setConverterState({
      type,
      phase: 'selected',
      selectedFiles: files,
      results: [],
      errors: [],
      progress: null,
    })
  }

  // ── Append more files via drag-and-drop onto the review panel ──
  const appendFilesSelected = (type, fileList) => {
    const exts = type === 'image'
      ? ['.heic', '.heif', '.jpg', '.jpeg', '.png']
      : ['.mov', '.mp4']

    const newFiles = Array.from(fileList).filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase()
      return exts.includes(ext)
    })

    if (newFiles.length === 0) return

    setConverterState(s => {
      const existingNames = new Set(s.selectedFiles.map(f => f.name))
      const deduplicated = newFiles.filter(f => !existingNames.has(f.name))
      return {
        ...s,
        selectedFiles: [...s.selectedFiles, ...deduplicated]
      }
    })
  }

  // ── Start conversion — one file at a time for real-time progress ──────────
  const startConversion = async () => {
    const { type, selectedFiles } = converterState
    if (!selectedFiles.length) return

    const total = selectedFiles.length
    setConverterState(s => ({
      ...s,
      phase: 'converting',
      results: [],
      errors: [],
      progress: { done: 0, total, currentFile: selectedFiles[0]?.name },
    }))

    const allResults = []
    const allErrors  = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]

      // Update UI to show which file is being processed now
      setConverterState(s => ({
        ...s,
        progress: { done: i, total, currentFile: file.name },
      }))

      const formData = new FormData()
      formData.append('files', file)

      try {
        const res = await fetch(`/api/${type}s/convert-upload`, {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }))
          allErrors.push({ name: file.name, error: err.error || 'Server error' })
        } else {
          const data = await res.json()
          allResults.push(...(data.results || []))
          allErrors.push(...(data.errors || []))
        }
      } catch (err) {
        allErrors.push({ name: file.name, error: err.message })
      }

      // Update progress after this file finishes
      setConverterState(s => ({
        ...s,
        progress: { done: i + 1, total, currentFile: selectedFiles[i + 1]?.name || null },
      }))
    }

    setConverterState(s => ({
      ...s,
      phase: 'done',
      results: allResults,
      errors: allErrors,
      progress: { done: total, total },
    }))
  }


  // ── Download a single file ────────────────────────────────────
  const downloadFile = (url, name) => {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // ── Download all converted files ──────────────────────────────
  const downloadAll = () => {
    converterState.results.forEach((r, i) => {
      // stagger downloads slightly so browser doesn't block them
      setTimeout(() => downloadFile(r.url, r.name), i * 300)
    })
  }

  // ── Reset back to idle ────────────────────────────────────────
  const reset = () => {
    setConverterState({ type: null, phase: 'idle', selectedFiles: [], results: [], errors: [], progress: null })
    // Clear input values so same file can be re-selected
    ;[imageFileInput, imageFolderInput, videoFileInput, videoFolderInput].forEach(ref => {
      if (ref.current) ref.current.value = ''
    })
  }

  const { phase, type, selectedFiles, results, errors, progress } = converterState
  const accentVar = type === 'video' ? 'var(--accent-video)' : 'var(--accent-image)'
  const accentGrad = type === 'video' ? 'var(--accent-video-gradient)' : 'var(--accent-image-gradient)'

  return (
    <div className="app">
      {/* ── Hidden native file inputs ── */}
      <input ref={imageFileInput} type="file" multiple accept=".heic,.heif,.jpg,.jpeg,.png,image/heic,image/heif,image/jpeg,image/png" style={{ display: 'none' }}
        onChange={e => handleFilesSelected('image', e.target.files)} />
      <input ref={imageFolderInput} type="file" webkitdirectory="" mozdirectory="" directory="" accept=".heic,.heif,.jpg,.jpeg,.png" style={{ display: 'none' }}
        onChange={e => handleFilesSelected('image', e.target.files)} />
      <input ref={videoFileInput} type="file" multiple accept=".mov,.mp4,video/quicktime,video/mp4" style={{ display: 'none' }}
        onChange={e => handleFilesSelected('video', e.target.files)} />
      <input ref={videoFolderInput} type="file" webkitdirectory="" mozdirectory="" directory="" accept=".mov,.mp4" style={{ display: 'none' }}
        onChange={e => handleFilesSelected('video', e.target.files)} />

      {/* ── Navigation Bar ── */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        serverOnline={serverOnline}
        loading={loading}
      />

      {/* ── Main Content Views ── */}
      <main className="main">
        {/* Converter View */}
        {activeTab === 'converter' && (
          <>
            <section className="hero">
              <h1 className="hero-title">Convert iPhone Media</h1>
              <p className="hero-description">
                Transform your iPhone photos and videos into universal JPEG and MP4 formats.
                Fast, private, and completely local on your machine.
              </p>
            </section>

            {/* ── Converter Cards (idle or while another type is active) ── */}
            {phase === 'idle' && (
              <div className="cards-grid">
            <div
              className={`conversion-card image-card ${dragTarget === 'image' ? 'conversion-card--dragging' : ''}`}
              onDragOver={e => handleDragOver(e, 'image')}
              onDragEnter={e => handleDragEnter(e, 'image')}
              onDragLeave={e => handleDragLeave(e, 'image')}
              onDrop={e => handleDrop(e, 'image')}
            >
              {dragTarget === 'image' && (
                <div className="card-drop-overlay">
                  <div className="card-drop-icon">📥</div>
                  <div className="card-drop-text">Drop iPhone Photos Here</div>
                  <div className="card-drop-sub">HEIC, HEIF, JPG, PNG</div>
                </div>
              )}
              <div className="card-icon">🖼️</div>
              <h2 className="card-title">Convert iPhone Photos</h2>
              <p className="card-description">Convert HEIC/HEIF photos to high-quality JPG — preserving resolution, colors, and orientation.</p>
              <div className="card-format-badge">
                <span className="format-tag">HEIC</span>
                <span style={{ margin: '0 4px' }}>/</span>
                <span className="format-tag">HEIF</span>
                <span className="format-arrow"> → </span>
                <span className="format-tag">JPG</span>
              </div>
              <div className="picker-buttons">
                <button className="card-button" disabled={!serverOnline} onClick={e => { e.stopPropagation(); openFilePicker('image', 'files') }}>
                  <span className="button-icon">🖼️</span> Select Files
                </button>
                <button className="card-button-secondary" disabled={!serverOnline} onClick={e => { e.stopPropagation(); openFilePicker('image', 'folder') }}>
                  <span className="button-icon">📂</span> Import Folder
                </button>
              </div>
              <div className="dropzone-hint">
                <span className="dropzone-hint-icon">📂</span>
                <span>or drag &amp; drop files / folders here</span>
              </div>
            </div>

            <div
              className={`conversion-card video-card ${dragTarget === 'video' ? 'conversion-card--dragging' : ''}`}
              onDragOver={e => handleDragOver(e, 'video')}
              onDragEnter={e => handleDragEnter(e, 'video')}
              onDragLeave={e => handleDragLeave(e, 'video')}
              onDrop={e => handleDrop(e, 'video')}
            >
              {dragTarget === 'video' && (
                <div className="card-drop-overlay">
                  <div className="card-drop-icon">📥</div>
                  <div className="card-drop-text">Drop iPhone Videos Here</div>
                  <div className="card-drop-sub">MOV, MP4, HEVC, Dolby Vision</div>
                </div>
              )}
              <div className="card-icon">🎬</div>
              <h2 className="card-title">Convert iPhone Videos</h2>
              <p className="card-description">Convert iPhone MOV/HEVC videos into Android-compatible MP4 with H.264 encoding.</p>
              <div className="card-format-badge">
                <span className="format-tag">MOV</span>
                <span style={{ margin: '0 4px' }}>/</span>
                <span className="format-tag">HEVC</span>
                <span className="format-arrow"> → </span>
                <span className="format-tag">MP4</span>
              </div>
              <div className="picker-buttons">
                <button className="card-button" disabled={!serverOnline} onClick={e => { e.stopPropagation(); openFilePicker('video', 'files') }}>
                  <span className="button-icon">🎬</span> Select Files
                </button>
                <button className="card-button-secondary" disabled={!serverOnline} onClick={e => { e.stopPropagation(); openFilePicker('video', 'folder') }}>
                  <span className="button-icon">📂</span> Import Folder
                </button>
              </div>
              <div className="dropzone-hint">
                <span className="dropzone-hint-icon">📂</span>
                <span>or drag &amp; drop files / folders here</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Files Selected — review & convert ── */}
        {phase === 'selected' && (
          <div
            className={`converter-panel ${panelDrag ? 'converter-panel--dragging' : ''}`}
            style={{ '--accent': accentVar, '--accent-grad': accentGrad }}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); setPanelDrag(true); }}
            onDragEnter={e => { e.preventDefault(); e.stopPropagation(); setPanelDrag(true); }}
            onDragLeave={e => { e.preventDefault(); e.stopPropagation(); if (!e.currentTarget.contains(e.relatedTarget)) setPanelDrag(false); }}
            onDrop={async e => {
              e.preventDefault();
              e.stopPropagation();
              setPanelDrag(false);
              const droppedFiles = await extractFilesFromDataTransfer(e.dataTransfer);
              appendFilesSelected(type, droppedFiles);
            }}
          >
            <div className="converter-panel-header">
              <div>
                <h2>{type === 'image' ? '🖼️ Photos Ready' : '🎬 Videos Ready'}</h2>
                <p className="converter-panel-sub">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected · Drag more files or folders here to add
                </p>
              </div>
              <button className="close-btn" onClick={reset}>✕</button>
            </div>

            <div className="file-list">
              {selectedFiles.map((f, i) => (
                <div key={i} className="file-list-item">
                  <span className="file-list-icon">{type === 'image' ? '🖼️' : '🎬'}</span>
                  <div className="file-list-info">
                    <span className="file-list-name">{f.name}</span>
                    <span className="file-list-size">{(f.size / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="converter-panel-actions">
              <button className="btn-secondary" onClick={reset}>Cancel</button>
              <button className="btn-primary-accent" style={{ background: accentGrad }} onClick={startConversion}>
                ⚡ Convert {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        {/* ── Converting ── */}
        {phase === 'converting' && (
          <div className="converter-panel" style={{ '--accent': accentVar, '--accent-grad': accentGrad }}>
            <div className="converter-panel-header">
              <div>
                <h2>⚙️ Converting{type === 'image' ? ' Photos' : ' Videos'}…</h2>
                <p className="converter-panel-sub">
                  {progress ? `Processing file ${Math.min(progress.done + 1, progress.total)} of ${progress.total}` : 'Please wait…'}
                </p>
              </div>
              {progress && (
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: accentVar,
                  background: 'var(--surface-overlay)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {Math.round((progress.done / progress.total) * 100)}%
                </div>
              )}
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  background: accentGrad,
                  width: `${Math.max(6, Math.round(((progress?.done || 0) / (progress?.total || 1)) * 100))}%`,
                  transition: 'width 0.4s ease'
                }}
              ></div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                {progress?.currentFile ? `⚙️ Converting: ${progress.currentFile}` : 'Finishing…'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                {progress ? `${progress.done} of ${progress.total} completed` : ''}
              </span>
            </div>
          </div>
        )}

        {/* ── Done — download results ── */}
        {phase === 'done' && (
          <div className="converter-panel" style={{ '--accent': accentVar, '--accent-grad': accentGrad }}>
            <div className="converter-panel-header">
              <div>
                <h2>✅ Conversion Complete</h2>
                <p className="converter-panel-sub">
                  {results.length} succeeded{errors.length > 0 ? `, ${errors.length} failed` : ''}
                </p>
              </div>
              <button className="close-btn" onClick={reset}>✕</button>
            </div>

            {results.length > 0 && (
              <div className="file-list">
                {results.map((r, i) => (
                  <div key={i} className="file-list-item file-list-item--done">
                    <span className="file-list-icon">✅</span>
                    <div className="file-list-info">
                      <span className="file-list-name">{r.originalName} → {r.name}</span>
                      {r.detected && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
                          🔍 {r.detected}
                        </span>
                      )}
                    </div>
                    <button className="download-btn" onClick={() => downloadFile(r.url, r.name)}>
                      ⬇ Download
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.length > 0 && (
              <div className="error-list">
                {errors.map((e, i) => (
                  <div key={i} className="error-item">
                    <span>❌ {e.name} — {e.error}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="converter-panel-actions">
              <button className="btn-secondary" onClick={reset}>Convert More</button>
              {results.length > 1 && (
                <button className="btn-primary-accent" style={{ background: accentGrad }} onClick={downloadAll}>
                  ⬇ Download All ({results.length})
                </button>
              )}
              {results.length === 1 && (
                <button className="btn-primary-accent" style={{ background: accentGrad }} onClick={() => downloadFile(results[0].url, results[0].name)}>
                  ⬇ Download
                </button>
              )}
            </div>

            {/* Coffee Support Callout on Conversion Done */}
            <div className="content-coffee-banner" style={{ marginTop: '1.75rem' }}>
              <div className="coffee-banner-content">
                <span className="coffee-banner-emoji">☕</span>
                <div>
                  <h4>Saved time with iConvert?</h4>
                  <p>100% private, free, and offline. If iConvert helped you today, consider buying a coffee!</p>
                </div>
              </div>
              <a
                href="https://buymeacoffee.com/arvr"
                target="_blank"
                rel="noreferrer"
                className="btn-coffee-banner"
              >
                Buy Me a Coffee
              </a>
            </div>
          </div>
        )}

        {/* FFmpeg Warning */}
        {health && !ffmpegAvailable && (
          <div className="ffmpeg-warning">
            <span className="ffmpeg-warning-icon">⚠️</span>
            <span>
              <strong>FFmpeg not detected.</strong> Conversion requires FFmpeg installed on your system.
              Check the README for installation instructions.
            </span>
          </div>
        )}
      </>
    )}

    {/* Features View */}
    {activeTab === 'features' && (
      <FeaturesView onStartConverting={() => setActiveTab('converter')} />
    )}

    {/* How It Works View */}
    {activeTab === 'howItWorks' && (
      <HowItWorksView onStartConverting={() => setActiveTab('converter')} />
    )}

    {/* Comparison View */}
    {activeTab === 'comparison' && (
      <ComparisonView onStartConverting={() => setActiveTab('converter')} />
    )}

    {/* About View */}
    {activeTab === 'about' && (
      <AboutView onStartConverting={() => setActiveTab('converter')} />
    )}
  </main>

  <Footer setActiveTab={setActiveTab} />
</div>
)
}

export default App
