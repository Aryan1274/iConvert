# iConvert — Development Phases

> **Rule: Build in phases. Test after each phase. Never implement everything at once.**
> After each phase, the application must still run correctly.

---

## Phase 1 — Foundation & Scaffolding

**Goal**: Get a working React + Express app running locally with basic structure.

### Deliverables
- [ ] Initialize project structure (`client/`, `server/`, root `package.json`)
- [ ] Set up React + Vite frontend (JavaScript, normal CSS)
- [ ] Set up Node.js + Express backend
- [ ] `/api/health` endpoint — returns server status + FFmpeg availability
- [ ] Basic homepage UI with two conversion cards (Image / Video)
- [ ] Folder selection mechanism (File System Access API or fallback)
- [ ] `npm run dev` starts both frontend and backend concurrently
- [ ] Verify the app runs locally in the browser

### Acceptance Criteria
- `npm run dev` starts both servers without errors
- Homepage renders with two conversion cards
- Health endpoint responds with FFmpeg status
- Folder selection dialog works (or shows fallback)

---

## Phase 2 — Image Conversion (HEIC/HEIF → JPEG)

**Goal**: Convert iPhone HEIC/HEIF images to high-quality JPEG.

### Deliverables
- [ ] `/api/images/scan` — scan selected folder, return HEIC/HEIF files with metadata (filename, format, dimensions, size)
- [ ] `/api/images/convert` — batch convert HEIC/HEIF → JPEG
- [ ] Sharp integration (or FFmpeg fallback) for HEIC decoding on Windows
- [ ] JPEG output at configurable quality (default 95)
- [ ] Preserve: dimensions, orientation, aspect ratio, colors
- [ ] EXIF orientation correction
- [ ] Safe file naming with collision handling (`_1`, `_2` suffix)
- [ ] Output folder selection
- [ ] UI: show scan results ("12 iPhone photos found"), trigger conversion
- [ ] Never overwrite originals

### Acceptance Criteria
- Converts real HEIC files to JPEG
- Output dimensions match original
- Orientation is correct (no sideways images)
- Quality is visually high
- File naming collisions handled correctly
- Already-compatible files (JPG, PNG) are skipped

### Test Cases
- HEIC portrait image
- HEIC landscape image
- High-resolution HEIC
- HEIF format image
- Image with EXIF orientation metadata
- Folder containing mixed files (JPG, PNG, HEIC, videos) — only HEIC processed

---

## Phase 3 — Video Conversion (MOV/HEVC → H.264 MP4)

**Goal**: Convert iPhone MOV/HEVC videos to Android-compatible H.264/AAC MP4 using FFmpeg.

### Deliverables
- [ ] FFmpeg detection at startup (show friendly message if missing)
- [ ] `/api/videos/scan` — scan folder, return video files with metadata (filename, format, resolution, duration, codec, size)
- [ ] `/api/videos/convert` — batch convert MOV → MP4
- [ ] FFmpeg command: `libx264`, CRF-based, `yuv420p`, AAC audio
- [ ] Quality presets: High (CRF 18), Balanced (CRF 20), Smaller (CRF 23)
- [ ] Preserve: resolution (including 4K), aspect ratio, frame rate
- [ ] Handle rotation metadata — no sideways videos
- [ ] Sequential processing (not concurrent heavy encodes)
- [ ] Streaming/file-based processing (not loading entire video into RAM)
- [ ] Safe file naming with collision handling
- [ ] Output folder selection
- [ ] UI: show scan results ("8 videos found"), trigger conversion

### Acceptance Criteria
- Converts real iPhone MOV files to playable MP4
- Output is H.264 video + AAC audio in MP4 container
- Plays on Android's default video player
- Plays on Windows media player
- Orientation is correct
- Resolution matches original
- Audio is preserved and clear

### Test Cases
- iPhone MOV file (HEVC/H.265)
- Video with audio
- Video without audio (if available)
- Portrait video
- Landscape video
- 1080p video
- 4K video (if hardware permits)
- Folder with mixed files — only videos processed

---

## Phase 4 — Batch Progress & Real-Time Feedback

**Goal**: Show live progress during batch conversion.

### Deliverables
- [ ] Real-time progress updates during conversion (polling, SSE, or WebSocket — simplest approach)
- [ ] Progress UI: total files, completed, current file, percentage
- [ ] Success count / failed count (live updating)
- [ ] Completion summary screen
- [ ] Error summary — list of failed files with reason

### Acceptance Criteria
- User sees live progress while batch is processing
- Percentage updates smoothly
- On completion: clear summary with success/failure counts
- Failed files listed with human-readable reasons

---

## Phase 5 — Verification & Error Handling

**Goal**: Verify conversion outputs and handle errors gracefully.

### Deliverables
- [ ] Image verification: output exists, readable, dimensions valid
- [ ] Video verification via FFprobe: MP4 container, H.264, AAC, valid duration, expected resolution
- [ ] Mark failed verifications as failed conversions
- [ ] **Batch never stops on single failure** — continue remaining files
- [ ] Error details behind a "Details" toggle (no raw FFmpeg logs in main UI)
- [ ] Clean temporary processing files after conversion
- [ ] Path traversal prevention & filename validation

### Acceptance Criteria
- Corrupted/unreadable input file → marked as failed, batch continues
- Verification failure → marked as failed (not reported as success)
- No temp files left after conversion completes
- Error details accessible but not overwhelming

---

## Phase 6 — UI Polish & Settings

**Goal**: Make the UI premium, polished, and production-ready.

### Deliverables
- [ ] Dark / light theme support
- [ ] Settings panel:
  - Image quality selector (90 / 92 / 95 / 98)
  - Video quality preset (High Quality / Balanced / Smaller File)
  - "Preserve Original Resolution" toggle (default: on)
- [ ] Drag-and-drop support for individual files
- [ ] File info display (pre-conversion metadata)
- [ ] Subtle animations & hover effects
- [ ] Status badges & success/failure states
- [ ] Responsive layout
- [ ] Clean icons/illustrations on conversion cards
- [ ] FFmpeg missing: friendly setup message in UI
- [ ] README.md with complete documentation

### Acceptance Criteria
- App feels like a polished desktop utility
- Theme switching works
- Settings affect conversion behavior
- Drag-and-drop works for individual files
- Responsive on different window sizes
- README covers: what it does, requirements, installation, FFmpeg setup, usage, troubleshooting
