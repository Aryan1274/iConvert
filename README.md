# iConvert — iPhone Media Converter

> **The most common problem when sharing media from iPhone to Android is quality loss. iConvert fixes that.**

iConvert is a local web application that runs entirely on your own computer. It converts iPhone's special media formats (HEIC photos and MOV videos) into Android-compatible formats (JPG and MP4) — without any quality loss, and without an internet connection.

---

## 🤔 The Problem

When you share a photo or video from an iPhone to an Android device, two things go wrong:

- **Photos:** iPhones save photos in `.HEIC` format. Android doesn't fully support this format, so photos either don't open or lose quality when shared.
- **Videos:** iPhones record video in `.MOV` format using **10-bit HDR color** (BT.2020 color space). When played on Android, the colors look faded and washed-out because Android expects standard 8-bit SDR (BT.709) video.

---

## ✅ What iConvert Does

| Feature | Details |
|---|---|
| 📷 Photo Conversion | HEIC/HEIF → High Quality JPG |
| 🎬 Video Conversion | MOV/HEVC → H.264 MP4 (Android compatible) |
| 🎨 HDR Color Fix | iPhone's 10-bit HLG HDR → SDR tonemapping (colors stay natural) |
| 📁 Folder Browser | Browse your local drives to select input and output folders |
| 📊 Live Progress | Real-time progress bar — see exactly which file is converting |
| 🔒 100% Private | No files are ever uploaded anywhere — everything runs on your PC |

---

## 🛠️ Technologies Used

### Frontend (What you see in the browser)

| Technology | Purpose |
|---|---|
| **React** | Building the UI — buttons, cards, progress bars |
| **Vite** | Fast development server and build tool for React |
| **Vanilla CSS** | Dark theme, glassmorphism design, animations |
| **EventSource (SSE)** | Receiving real-time progress updates from the server |

### Backend (What runs in the background)

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime — powers the local server |
| **Express.js** | Web server framework — handles all API endpoints |
| **FFmpeg** | The actual conversion engine — converts photos and videos |
| **FFprobe** | Detects video color space (HDR or SDR) before conversion |
| **SSE (Server-Sent Events)** | Sends live progress updates from server to browser |

### Other Libraries

| Library | Purpose |
|---|---|
| **sharp** | Installed for HEIC image support (backup decoder) |
| **concurrently** | Lets one `npm run dev` command start both frontend and backend |

---

## 🏗️ Project Structure

```
iConvert/
│
├── client/                        # React Frontend
│   ├── src/
│   │   ├── App.jsx                # Main app — core logic lives here
│   │   ├── styles.css             # Design tokens, dark theme, animations
│   │   └── components/
│   │       ├── ConversionCard.jsx # The photo/video conversion card
│   │       ├── FolderPicker.jsx   # Modal for browsing local folders
│   │       └── ErrorBoundary.jsx  # Catches and handles UI crashes gracefully
│   └── vite.config.js             # Vite config + proxy (port 5173 → 3001)
│
├── server/                        # Node.js Backend
│   ├── index.js                   # Express server entry point
│   ├── routes/
│   │   ├── health.js              # GET /api/health — server + FFmpeg status
│   │   ├── fs.js                  # GET /api/fs/list — folder browser API
│   │   ├── images.js              # POST /api/images/scan + /convert
│   │   └── videos.js              # POST /api/videos/scan + /convert
│   └── utils/
│       ├── ffmpeg.js              # FFmpeg/FFprobe version check utilities
│       └── sse.js                 # Server-Sent Events broadcast manager
│
├── README.md                      # This file
├── package.json                   # Root — "npm run dev" starts from here
└── tasks.md                       # Project progress tracker
```

---

## ⚙️ Running iConvert

### Mode 1 — Web Application (Browser)

```bash
npm run dev
```

Starts both the **Vite React UI** (`http://localhost:5173`) and the **Express backend** (`http://localhost:3001`). You can use iConvert directly in any browser.

---

### Mode 2 — Desktop Application (Electron)

To launch iConvert as a native Windows desktop window in development:
```bash
npm run electron:dev
```

To build a standalone Windows executable (`.exe` installer and portable `.exe`):
```bash
npm run electron:build
```
The compiled setup and standalone executables will be output to the `release/` directory.

---

---

### Step 2 — Selecting a Folder

You click "Select Image Folder" or "Select Video Folder". A modal (popup) appears that lets you browse your computer's file system. Since a browser cannot directly access local files for security reasons, it talks to the Express backend, which reads the filesystem and sends back a list of folders.

---

### Step 3 — Scanning

Once a folder is selected, the React app sends a request to the backend:

```
POST /api/images/scan  →  { inputFolder: "D:\photos" }
POST /api/videos/scan  →  { inputFolder: "D:\videos" }
```

The backend scans that folder and returns only the relevant files (`.heic`/`.heif` for images, `.mov` for videos) along with their metadata.

---

### Step 4 — Choosing an Output Folder

The scan result is shown (e.g., "5 photos found"). You then select an output folder where the converted files will be saved.

---

### Step 5 — Conversion Starts

The React app sends the conversion request:

```
POST /api/images/convert  →  { inputFolder, outputFolder, files[], quality }
POST /api/videos/convert  →  { inputFolder, outputFolder, files[], quality }
```

The server immediately responds with a `jobId` and starts the conversion **in the background** — so the browser doesn't freeze waiting for it.

---

### Step 6 — Live Progress Updates (The Magic ✨)

The browser opens a persistent **Server-Sent Events (SSE)** connection:

```
GET /api/progress   ← stays open permanently
```

After each file is converted, the server pushes a message through this connection:

```json
{
  "jobId": "...",
  "status": "processing",
  "currentFile": "IMG_001.HEIC",
  "completed": 3,
  "total": 10,
  "success": 3,
  "failed": 0
}
```

React receives this in real time and updates the progress bar — **no page refresh needed**.

---

### Step 7 — FFmpeg Does the Work

**For Photos:**
```bash
ffmpeg -i input.heic -map_metadata 0 -qscale:v 1 -y output.jpg
```
- `-qscale:v 1` → Maximum JPEG quality (virtually lossless)
- `-map_metadata 0` → Preserves EXIF data (colors, GPS, orientation)

**For Standard SDR Videos:**
```bash
ffmpeg -i input.mov -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k output.mp4
```

**For HDR Videos (iPhone's default recording format):**
```bash
ffmpeg -i input.mov \
  -vf "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p" \
  -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac output.mp4
```

This filter chain mathematically converts iPhone's 10-bit HLG HDR color range down to standard 8-bit SDR without washing out the colors.

---

## 🎨 The HDR Color Problem — Explained

This was the most complex problem solved in this project.

### How iPhone Records Video
- iPhone 12 and later records video in **10-bit HDR** by default
- Color space: **BT.2020** (extremely wide range of colors)
- Transfer function: **HLG (arib-std-b67)** — a broadcast HDR standard
- Pixel format: **yuv420p10le** (10-bit per channel)

### What Android/Standard MP4 Expects

## Features

- **HEIC/HEIF to JPG**: Converts Apple's high-efficiency image format to standard JPGs while retaining maximum quality, EXIF metadata, and rotation.
- **MOV/HEVC to MP4**: Transcodes iPhone video into widely supported Android/Windows formats (H.264/AAC).
- **HDR to SDR Tonemapping**: Solves the "washed-out colors" issue when sending HDR (HLG/Dolby Vision) videos by correctly applying BT.2020 to BT.709 color space conversions.
- **Image Background Removal (AI)**: Completely offline image background removal utilizing the RMBG-1.4 model. Outputs transparent PNGs.
- **Video Background Removal (AI)**: Completely offline video background removal utilizing Robust Video Matting (RVM). Outputs transparent WebM files.
- **Offline & Private**: All image processing, transcoding, and AI inference happens completely locally on your machine.

---

## Technical Details

### AI Background Removal Engine

To keep everything private and local, iConvert ships with a highly optimized ONNX runtime (via `@xenova/transformers` and `onnxruntime-node`). 
The AI models are stored entirely within the `models/` directory:

- **Image Matting**: `RMBG-1.4` (~176 MB)
- **Video Matting**: `Robust Video Matting - MobileNetV3` (~15 MB)

No cloud APIs are used, and no internet connection is required after the initial setup.

### Video Conversion & Tonemapping

iConvert relies on FFmpeg under the hood. For HDR video, it detects the `arib-std-b67` (HLG) transfer characteristics and injects a custom `zscale` tonemapping filter chain to guarantee accurate colors on non-Apple devices. Video backgrounds are removed using a recurrent neural network state piped directly from/to FFmpeg via raw streams...

If `color_transfer = arib-std-b67` (HLG) is detected, the **Hable tonemapping** algorithm is applied. This algorithm mathematically maps the HDR brightness range into the SDR range while preserving natural skin tones and color accuracy.

For standard SDR videos, no filter is applied — colors pass through untouched.

---

## 🚀 How to Run

### Requirements
- Node.js v18 or higher
- FFmpeg installed on your system and available in PATH

### Steps

```bash
# Navigate to the project folder
cd D:\projects\my-projects\iConvert

# Start the app
npm run dev

# Open in browser
# http://localhost:5173
```

---

## 🔮 Potential Future Features

- **Electron App** — Package as a Windows `.exe` installer so no terminal is needed
- **Drag & Drop** — Drop individual files directly onto the conversion cards
- **Quality Settings** — Image quality slider and video bitrate presets
- **Conversion History** — Log of all previous conversions
- **macOS Support** — Cross-platform builds

---

*iConvert — Everything runs on your computer. No cloud. No uploads. 100% private.*
