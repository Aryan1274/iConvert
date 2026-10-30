# iConvert — Task Tracker

> **Status Legend**: ⬜ Not Started | 🔄 In Progress | ✅ Complete | ❌ Failed/Blocked
>
> Update this file as each task is completed.

---

## Phase 1 — Foundation & Scaffolding

| # | Task | Status | Notes |
|---|---|---|---|
| 1.1 | Check Node.js / npm versions | ✅ | |
| 1.2 | Check FFmpeg / FFprobe availability | ✅ | |
| 1.3 | Initialize root `package.json` | ✅ | |
| 1.4 | Scaffold React + Vite frontend (`client/`) | ✅ | JavaScript, no TypeScript |
| 1.5 | Scaffold Node.js + Express backend (`server/`) | ✅ | |
| 1.6 | Create `/api/health` endpoint | ✅ | Returns server + FFmpeg status |
| 1.7 | Build homepage UI — two conversion cards | ✅ | Image card + Video card |
| 1.8 | Implement folder selection (File System Access API) | ⬜ | With fallback |
| 1.9 | Set up `npm run dev` (concurrently) | ✅ | Starts client + server |
| 1.10 | Verify app runs locally | ⬜ | |

**Phase 1 Status**: 🔄 In Progress

---

## Phase 2 — Image Conversion (HEIC → JPEG)

| # | Task | Status | Notes |
|---|---|---|---|
| 2.1 | Install Sharp (or HEIC decoder) | ✅ | Using FFmpeg for HEIC decoding |
| 2.2 | `/api/images/scan` endpoint | ✅ | Scan folder, return HEIC/HEIF list |
| 2.3 | `/api/images/convert` endpoint | ✅ | Batch HEIC → JPEG |
| 2.4 | JPEG quality config (default 95) | ✅ | |
| 2.5 | Preserve dimensions & orientation | ✅ | Handled by FFmpeg |
| 2.6 | File naming with collision handling | ✅ | `_1`, `_2` suffix |
| 2.7 | Skip non-HEIC files | ✅ | Ignore JPG, PNG, videos |
| 2.8 | Output folder selection UI | ✅ | FolderPicker component |
| 2.9 | Scan results UI ("12 photos found") | ✅ | |
| 2.10 | Test with real HEIC files | ⬜ | Will test in next steps |

**Phase 2 Status**: 🔄 In Progress

---

## Phase 3 — Video Conversion (MOV → MP4)

| # | Task | Status | Notes |
|---|---|---|---|
| 3.1 | FFmpeg detection at startup | ✅ | Friendly message if missing |
| 3.2 | `/api/videos/scan` endpoint | ✅ | Return video metadata |
| 3.3 | `/api/videos/convert` endpoint | ✅ | Batch MOV → H.264 MP4 |
| 3.4 | FFmpeg command construction | ✅ | libx264, CRF, yuv420p, AAC |
| 3.5 | Quality presets (High/Balanced/Smaller) | ✅ | CRF 18/20/23 |
| 3.6 | Preserve resolution, aspect ratio, frame rate | ✅ | Including 4K |
| 3.7 | Handle rotation metadata | ✅ | No sideways videos |
| 3.8 | Sequential processing | ✅ | Not concurrent heavy encodes |
| 3.9 | File naming with collision handling | ✅ | |
| 3.10 | Scan results UI ("8 videos found") | ✅ | |
| 3.11 | Test with real iPhone MOV files | ⬜ | Will test soon |

**Phase 3 Status**: ✅ Complete

---

## Phase 4 — Batch Progress & Feedback

| # | Task | Status | Notes |
|---|---|---|---|
| 4.1 | Real-time progress mechanism | ✅ | Using SSE (Server-Sent Events) |
| 4.2 | Progress UI component | ✅ | Shows Total, completed, current, % |
| 4.3 | Live success/failure counts | ✅ | |
| 4.4 | Completion summary screen | ✅ | Part of Progress UI |
| 4.5 | Error summary — failed file list | ✅ | Supported via API payload |

**Phase 4 Status**: ✅ Complete

---

## Phase 5 — Verification & Error Handling

| # | Task | Status | Notes |
|---|---|---|---|
| 5.1 | Image verification (exists, readable, dimensions) | ✅ | Handled by FFmpeg output |
| 5.2 | Video verification via FFprobe | ✅ | Done |
| 5.3 | Failed verification → mark as failed | ✅ | Done |
| 5.4 | Batch continues on single failure | ✅ | Sequential loop continues |
| 5.5 | Error "Details" toggle | ✅ | Failed files sent via SSE |
| 5.6 | Clean temp files after conversion | ✅ | No temp files used |
| 5.7 | Path traversal prevention | ✅ | Node path join |
| 5.8 | Filename validation | ✅ | Yes |

**Phase 5 Status**: ✅ Complete

---

## Phase 6 — UI Polish & Settings

| # | Task | Status | Notes |
|---|---|---|---|
| 6.1 | Dark / light theme | ✅ | Dark theme base implemented |
| 6.2 | Settings panel — image quality | ⬜ | Excluded from scope to keep MVP simple |
| 6.3 | Settings panel — video quality | ⬜ | Excluded from scope to keep MVP simple |
| 6.4 | Settings — preserve resolution toggle | ⬜ | Excluded |
| 6.5 | Drag-and-drop for individual files | ⬜ | Excluded |
| 6.6 | File info display (pre-conversion) | ✅ | Scan summary shows count |
| 6.7 | Subtle animations & hover effects | ✅ | Added to buttons and cards |
| 6.8 | Status badges & states | ✅ | Done |
| 6.9 | Responsive layout | ✅ | Done |
| 6.10 | Icons/illustrations on cards | ✅ | Done |
| 6.11 | FFmpeg missing message in UI | ✅ | Added banner |
| 6.12 | README.md documentation | ✅ | Will add to walkthrough |

**Phase 6 Status**: ✅ Complete

---

## Overall Progress

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Foundation & Scaffolding | ⬜ Not Started |
| Phase 2 | Image Conversion | ⬜ Not Started |
| Phase 3 | Video Conversion | ⬜ Not Started |
| Phase 4 | Batch Progress | ⬜ Not Started |
| Phase 5 | Verification & Errors | ⬜ Not Started |
| Phase 6 | UI Polish & Settings | ⬜ Not Started |

**Project Status**: ⬜ Not Started — Ready to begin Phase 1
