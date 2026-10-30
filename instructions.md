# iConvert — Master Instructions

> **Local iPhone Media Converter Web App**
> Convert HEIC/HEIF images → high-quality JPEG and MOV/HEVC videos → Android-compatible H.264 MP4.
> Everything runs locally — zero cloud, zero uploads, zero external APIs.

---

## 1. Project Overview

iConvert is a lightweight, polished, locally-running web application for converting iPhone photos and videos into formats that play reliably on Android devices, Android's built-in video player, and Windows media players.

### Why it exists

| Problem | Solution |
|---|---|
| iPhone photos arrive as HEIC/HEIF — Android can't always open them | Convert to high-quality JPEG |
| iPhone videos are MOV with HEVC/H.265 — Android's default player chokes | Re-encode to H.264/AAC MP4 (not a simple rename) |

### Core Priorities (in order)

1. Correct conversion (actual decode → re-encode)
2. Android compatibility
3. High visual quality
4. Correct orientation
5. Batch processing
6. Local privacy
7. Simple, polished UI
8. Lightweight architecture
9. Easy maintenance
10. No unnecessary dependencies

---

## 2. Technology Stack

### Frontend
- **React** (with Vite) — JavaScript, NOT TypeScript
- **Normal CSS** — no Tailwind unless a strong technical reason exists
- Vite dev server

### Backend
- **Node.js** + **Express**
- Simple REST API

### Media Processing
- **FFmpeg** — video transcoding (MOV → MP4 H.264/AAC)
- **FFprobe** — video metadata & verification
- **Sharp** — image processing (HEIC → JPEG) — or FFmpeg fallback if Sharp can't decode HEIC on Windows
- A reliable HEIC/HEIF decoding approach for the local Windows environment

### Explicitly NOT Using
- Next.js, TypeScript, Tailwind, databases, Docker, Redis, Kubernetes
- Cloud services, external APIs, authentication, analytics, CDN
- Unnecessary state-management libraries or UI frameworks

---

## 3. Project Architecture

```
iConvert/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page-level components
│   │   ├── utils/             # Frontend utilities
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Node.js + Express backend
│   ├── routes/                # API route handlers
│   ├── services/              # Conversion logic (image, video)
│   ├── utils/                 # Helpers (file naming, validation, ffmpeg)
│   ├── index.js               # Express entry point
│   └── package.json
│
├── input/                     # Default input folder (user can change)
├── output/                    # Default output folder (user can change)
├── package.json               # Root — npm run dev starts both
├── README.md
├── instructions.md            # This file
├── phases.md                  # Phase breakdown
├── tasks.md                   # Task tracking
└── prompt.md                  # Original detailed specification
```

### Key Architecture Rules
- No hard-coded absolute Windows paths
- User selects input/output folders through the UI
- Prefer File System Access API for folder selection; provide fallback
- Only allow backend to process files explicitly selected by the user

---

## 4. Backend API

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Health check, FFmpeg detection status |
| `/api/images/scan` | POST | Scan folder, return list of HEIC/HEIF files with metadata |
| `/api/images/convert` | POST | Convert HEIC/HEIF → JPEG |
| `/api/videos/scan` | POST | Scan folder, return list of MOV/video files with metadata |
| `/api/videos/convert` | POST | Convert MOV/HEVC → H.264 MP4 |

- Clean JSON responses
- WebSocket/SSE only if necessary for real-time progress
- Prefer simplest reliable implementation

---

## 5. Image Conversion Rules

### Input
- Process only: `.heic`, `.heif`
- Ignore: `.jpg`, `.jpeg`, `.png`, `.webp`, videos, unsupported files, subdirectories

### Output
- Format: **JPEG**
- Quality: configurable, default **95**
- **Preserve**: width, height, aspect ratio, orientation, colors
- **Do NOT**: resize, reduce pixels, sharpen, add filters, modify visually
- Correct EXIF orientation before output so JPEG displays correctly everywhere
- Preserve useful EXIF metadata where safe

### File Naming
- `IMG_1234.HEIC` → `IMG_1234.jpg`
- Never overwrite originals or existing outputs
- Collision: `IMG_1234.jpg` exists → `IMG_1234_1.jpg` → `IMG_1234_2.jpg` …

---

## 6. Video Conversion Rules

### Input
- Process: `.mov`, `.mp4` (prioritize MOV/HEVC)
- Ignore: images, HEIC, JPG, PNG, unrelated files

### Output — Target Configuration
| Setting | Value |
|---|---|
| Container | MP4 |
| Video codec | H.264 / AVC (libx264) |
| Audio codec | AAC |
| Pixel format | yuv420p |
| Profile/Level | Widely compatible H.264 profile |
| Encoding | CRF-based (quality), NOT tiny fixed bitrate |
| CRF default | 18–20 (configurable via quality presets) |
| Audio bitrate | 160k–192k |
| Resolution | Preserve original (including 4K) |
| Aspect ratio | Preserve |
| Frame rate | Preserve, no interpolation |
| Orientation | Handle rotation metadata correctly — no sideways videos |

### Quality Presets
| Preset | CRF | Description |
|---|---|---|
| High Quality | 18 | Best visual quality, larger files |
| Balanced | 20 | Good quality, reasonable size |
| Smaller File | 23 | Acceptable quality, smaller files |

### File Naming
- Same rules as images: `IMG_1234.MOV` → `IMG_1234.mp4`
- Never overwrite; use `_1`, `_2` suffix on collision

---

## 7. UI Requirements

### Homepage
- Two large conversion cards:
  - **Card 1**: "Convert iPhone Photos" — HEIC/HEIF → JPG
  - **Card 2**: "Convert iPhone Videos" — MOV/HEVC → MP4
- Feels like a desktop utility, not a generic website
- Dark/light theme, clean, professional

### Workflow UI
1. Select folder → scan → show count ("12 iPhone photos found")
2. Select output folder
3. Convert with progress display
4. Show completion summary

### Progress Display
- Total files / completed / current file name
- Progress percentage
- Success count / failed count
- After completion: summary with error details

### File Info (pre-conversion)
- **Images**: filename, format, dimensions, file size
- **Videos**: filename, format, resolution, duration, codec, file size

### Settings Panel
- Image quality: 90 / 92 / 95 / 98 (default 95)
- Video quality: High Quality / Balanced / Smaller File
- Preserve Original Resolution: on by default
- No confusing professional settings

### General UI Rules
- Subtle animations, not excessive
- Drag-and-drop for individual files (secondary to folder workflow)
- Responsive layout
- Status badges, success/failure states
- Don't expose raw FFmpeg logs — offer "Details" option

---

## 8. Error Handling

- **Never stop batch on single failure** — continue processing remaining files
- Display failed files separately with reason
- Allow user to view error summary
- Technical details behind a "Details" toggle
- No huge FFmpeg logs in main UI

---

## 9. Verification

### After Image Conversion
- Confirm output file exists
- Confirm it can be read/opened
- Confirm dimensions are valid (match original)

### After Video Conversion (via FFprobe)
- Confirm output exists
- Verify: MP4 container, H.264 video, AAC audio (where audio exists)
- Valid duration, expected resolution
- If verification fails → mark as failed

---

## 10. Security & Privacy

- Never upload files anywhere
- Never send media to third-party APIs
- Never log file contents
- Don't store user media permanently on server
- Clean temp files after conversion
- Prevent path traversal
- Validate all filenames and paths
- Only process user-selected files

---

## 11. Performance

- Sequential processing by default (not 10 concurrent video encodes)
- Streaming/file-based FFmpeg processing (don't load entire videos into RAM)
- Images can be parallel but avoid memory duplication
- Keep resource usage reasonable

---

## 12. FFmpeg Setup

- At startup: detect FFmpeg and FFprobe availability
- If missing: show friendly message, point to README for install instructions
- Allow configurable FFmpeg path
- Do NOT auto-download large binaries

---

## 13. Development Scripts

```json
{
  "scripts": {
    "dev": "starts both frontend + backend concurrently",
    "client": "starts React/Vite frontend only",
    "server": "starts Node/Express backend only"
  }
}
```

---

## 14. Development Strategy

> **Build in phases. Test after each phase. Do NOT implement everything at once.**

See `phases.md` for detailed phase breakdown.
See `tasks.md` for live task tracking.

### Pre-Implementation Checklist
1. Inspect existing environment
2. Check Node.js/npm versions
3. Check FFmpeg/FFprobe availability
4. Only install actually required packages
5. Create architecture first, explain plan, then implement Phase 1

---

## 15. Quality Principles

- Never claim "100% identical quality" — JPEG and H.264 are lossy
- Goal: "Visually high-quality output with minimal unnecessary quality loss"
- Don't sacrifice media correctness for shorter code
- Don't sacrifice simplicity for enterprise architecture
- Keep code understandable for beginner/intermediate developers
