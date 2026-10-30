# Build a Local iPhone Media Converter Web App

Build a lightweight, polished, locally-running web application for converting iPhone images and videos into highly compatible Android-friendly formats.

The application must run entirely on the user's local computer.

## 1. Core Goal

The application is intended for a simple personal workflow:

* iPhone photos may arrive in HEIC/HEIF format.
* iPhone videos may arrive as MOV files, often using HEVC/H.265.
* These files may have compatibility problems on Android devices or Android's built-in video player.
* The application should properly decode and re-encode the media instead of simply changing file extensions.

The main goal is:

### Images

Convert iPhone HEIC/HEIF images into high-quality JPEG images while preserving:

* resolution
* pixel dimensions
* colors
* sharpness
* EXIF orientation where practical
* overall visual quality

### Videos

Convert iPhone MOV/HEVC videos into MP4 using a highly compatible encoding configuration intended to play on:

* Android internal/default video players
* common Android media players
* Windows media players

The output should prioritize compatibility while keeping visual quality high.

---

# 2. IMPORTANT: Local Processing Only

This application must NOT upload user media to any external service.

Everything must happen locally:

Browser UI
→ local Node.js server
→ local FFmpeg / Sharp processing
→ local output folder

No:

* cloud storage
* external media APIs
* database
* authentication
* third-party upload service
* analytics
* CDN
* remote processing

The application should work without an internet connection after dependencies are installed.

---

# 3. Technology Stack

Use a simple lightweight stack:

### Frontend

* React
* Vite
* JavaScript
* Normal CSS

### Backend

* Node.js
* Express

### Media Processing

* FFmpeg for video conversion/transcoding
* Sharp for image processing if appropriate
* Use a reliable HEIC/HEIF decoding approach supported by the local environment.

Do NOT use Next.js.

Do NOT introduce unnecessary frameworks.

Do NOT use Tailwind unless there is a strong technical reason.

Do NOT add a database.

Do NOT use TypeScript unless necessary.

Keep the project beginner-friendly and easy to maintain.

---

# 4. Project Architecture

Use a clean structure similar to:

project-root/
client/
src/
components/
pages/
utils/
App.jsx
main.jsx
styles.css

server/
routes/
services/
utils/
index.js

input/
output/
package.json
README.md

Do not hard-code absolute Windows paths.

The application should allow the user to select input and output folders through the UI.

---

# 5. Main UI

Create a modern, clean, professional interface.

The application should feel like a small desktop utility rather than a generic website.

Homepage should have two large conversion cards:

## Card 1 — iPhone Images → JPG

Icon/illustration:

Image / Photo

Title:

"Convert iPhone Photos"

Description:

"Convert HEIC/HEIF photos to high-quality JPG."

Button:

"Select Image Folder"

## Card 2 — iPhone Videos → MP4

Icon/illustration:

Video / Play

Title:

"Convert iPhone Videos"

Description:

"Convert iPhone MOV/HEVC videos into Android-compatible MP4."

Button:

"Select Video Folder"

---

# 6. Folder-Based Workflow

The preferred workflow is folder-based because it keeps the implementation simple and predictable.

The user should be able to create/select:

### Image input folder

Containing only iPhone images.

### Video input folder

Containing only iPhone videos.

However, the application should STILL inspect file extensions and identify media types.

---

# 7. Image Conversion Workflow

When the user chooses:

"Convert iPhone Photos"

Allow them to select an input folder.

The backend should scan the folder.

Only process supported iPhone image formats, primarily:

* .heic
* .heif

Ignore:

* .jpg
* .jpeg
* .png
* .webp
* videos
* unsupported files
* subdirectories unless explicitly supported

Do NOT convert already-compatible images.

Show the user something like:

"12 iPhone photos found"

Then allow them to select an output folder.

---

# 8. Image Output

Convert each HEIC/HEIF image to:

JPEG

Preserve the original:

* width
* height
* aspect ratio
* orientation
* colors

Do NOT resize the image.

Do NOT reduce its pixel dimensions.

Do NOT unnecessarily sharpen.

Do NOT add filters.

Do NOT modify the image visually.

Use a high-quality JPEG encoding configuration.

Use a configurable quality value internally, with a sensible high-quality default such as 95 or an appropriate equivalent after testing.

If metadata can be preserved safely, preserve useful EXIF metadata and orientation.

Correct orientation before output if necessary so that the resulting JPEG displays correctly across devices.

---

# 9. Image File Naming

If the original file is:

IMG_1234.HEIC

Output:

IMG_1234.jpg

Do not overwrite the original.

If a file with the same output name already exists:

IMG_1234.jpg

create:

IMG_1234_1.jpg

then:

IMG_1234_2.jpg

etc.

Never silently overwrite existing files.

---

# 10. Video Conversion Workflow

When the user chooses:

"Convert iPhone Videos"

Allow folder selection.

Scan the folder.

Identify common iPhone video files such as:

* .mov
* .mp4

But prioritize MOV/HEVC files as the main conversion target.

Ignore:

* images
* HEIC
* JPG
* PNG
* unrelated files

The UI should report:

"8 videos found"

---

# 11. Video Compatibility

This is extremely important.

Do NOT simply rename:

video.mov

to:

video.mp4

Actually decode and re-encode the video.

Use FFmpeg.

Target a highly compatible MP4 configuration intended for Android's default/internal player.

Preferred baseline:

Container:
MP4

Video codec:
H.264 / AVC

Audio codec:
AAC

Pixel format:
yuv420p

Use a widely compatible H.264 profile/level.

Avoid unusual codecs or settings that may cause playback problems.

The objective is compatibility with normal Android hardware/software decoders.

---

# 12. Video Quality

The output must remain high quality.

Do not blindly use an extremely low bitrate.

Prefer quality-based H.264 encoding such as CRF rather than a tiny fixed bitrate where appropriate.

Use a sensible high-quality CRF preset.

Example starting point:

libx264
-preset medium
-crf 18-20
-pix_fmt yuv420p

Audio:

AAC
reasonable high-quality bitrate such as 160k or 192k

The exact settings can be adjusted after testing.

Do NOT unnecessarily resize 4K videos.

Preserve the original resolution whenever possible.

Preserve aspect ratio.

Preserve frame rate whenever practical.

Avoid unnecessary frame interpolation.

---

# 13. Video Orientation

iPhone videos can contain rotation/orientation metadata.

The converted MP4 must display in the correct orientation.

Do not produce sideways or incorrectly rotated videos.

Handle rotation metadata correctly during FFmpeg processing.

---

# 14. Video File Naming

Example:

IMG_1234.MOV

becomes:

IMG_1234.mp4

Do not overwrite existing output files.

If the output exists:

IMG_1234.mp4

then create:

IMG_1234_1.mp4

etc.

---

# 15. Batch Processing

Batch processing is required.

The user should be able to process an entire folder.

Example:

Input:

photos/
IMG_0001.HEIC
IMG_0002.HEIC
IMG_0003.HEIC
random.jpg
video.MOV

Image conversion should process only:

IMG_0001.HEIC
IMG_0002.HEIC
IMG_0003.HEIC

and ignore everything else.

Similarly, video conversion should only process supported video files.

---

# 16. Progress UI

During processing, show:

* total files
* completed files
* current file
* progress percentage
* success count
* failed count

Example:

Converting...

3 / 12

IMG_0034.HEIC

Progress:
25%

After completion:

"Conversion Complete"

12 files processed
11 successful
1 failed

---

# 17. Error Handling

If one file fails:

DO NOT stop the entire batch.

Continue processing the remaining files.

Display failed files separately.

Example:

Failed:

IMG_0098.HEIC

Reason:

Unable to decode HEIC image.

Allow the user to see an error summary after processing.

Do not expose huge FFmpeg logs in the main UI.

Provide a "Details" option for technical errors if practical.

---

# 18. Output Location

The user should select an output folder.

Create separate output folders if useful:

Selected Folder/
Converted Images/
Converted Videos/

However, keep the workflow simple.

The application must never save output to an unknown hard-coded location.

---

# 19. Folder Selection

Because this is a local web application, investigate the most reliable browser-supported way to select directories.

Prefer the File System Access API where supported.

If directory access is not available in a browser, provide a clear fallback.

Do NOT require the user to manually type complicated paths.

The goal is:

Select Folder
→ Scan
→ Convert
→ Save

---

# 20. Drag and Drop

Also support drag-and-drop for individual files if practical.

However, folder conversion is the primary workflow.

Do not overcomplicate the application just to support every possible input method.

---

# 21. UI/UX

Make the UI visually polished.

Use:

* clean dark/light interface
* large conversion cards
* subtle animations
* clear icons
* drag/drop area
* progress indicators
* status badges
* success/failure states
* responsive layout

Avoid excessive animations.

The application must remain lightweight.

Do not create a dashboard with unnecessary menus.

The main screen should immediately communicate:

"Convert iPhone media for better compatibility."

---

# 22. Settings

Include a small Settings section.

### Image Quality

Default:

95

Allow:

90
92
95
98

Do not expose confusing professional image-processing settings.

### Video Quality

Provide simple options:

High Quality
Balanced
Smaller File

Internally map these to sensible FFmpeg CRF values.

Example:

High Quality → CRF 18
Balanced → CRF 20
Smaller File → CRF 23

These are starting points and should be tested.

Also provide:

"Preserve Original Resolution"

enabled by default.

---

# 23. File Information

Before conversion, display useful information:

For images:

* filename
* format
* dimensions
* file size

For videos:

* filename
* format
* resolution
* duration
* codec if detectable
* file size

Do not make the interface overly technical.

---

# 24. Conversion Verification

After creating an output file, perform basic verification.

For images:

* confirm output exists
* confirm it can be opened/read
* confirm dimensions are valid

For videos:

* confirm output exists
* use FFprobe/FFmpeg to verify:

  * MP4 container
  * H.264 video
  * AAC audio where audio exists
  * valid duration
  * expected resolution

If verification fails, mark that conversion as failed rather than reporting success.

---

# 25. Important Quality Principle

Never claim:

"100% identical quality"

because JPEG and H.264 are lossy formats.

Instead, optimize for:

"Visually high-quality output with minimal unnecessary quality loss."

For images, preserve pixel dimensions and use high-quality JPEG encoding.

For videos, use quality-based H.264 encoding rather than aggressive compression.

---

# 26. Security / Local Privacy

Because this is a local utility:

* never upload files
* never send media to third-party APIs
* never log complete file contents
* do not store user media permanently in the server
* clean temporary processing files after conversion
* prevent arbitrary path traversal
* validate filenames and paths

Only allow the backend to process files explicitly selected by the user.

---

# 27. Performance

Keep resource usage reasonable.

Batch processing should not attempt to load every large video completely into RAM.

Use streaming/file-based FFmpeg processing.

Process files sequentially by default.

Do not run 10 large video encodes simultaneously.

Images can be processed efficiently but should also avoid unnecessary memory duplication.

---

# 28. Backend API

Keep the API simple.

Possible endpoints:

POST /api/images/scan
POST /api/images/convert

POST /api/videos/scan
POST /api/videos/convert

GET /api/health

Use clean JSON responses.

If real-time progress requires WebSocket/SSE, only introduce it if necessary.

Prefer the simplest reliable implementation.

---

# 29. Development Scripts

Root package.json should provide:

npm run dev

which starts both:

React/Vite frontend
Node/Express backend

Also provide:

npm run client
npm run server

if useful.

---

# 30. README

Create a clear README.md explaining:

1. What the application does
2. Required software
3. Installation
4. FFmpeg installation
5. How to configure FFmpeg path if necessary
6. How to start the app
7. How to convert images
8. How to convert videos
9. Where output files are saved
10. Troubleshooting
11. Limitations

Include Windows instructions because the primary development environment is Windows.

---

# 31. FFmpeg Setup

Do not assume FFmpeg is globally installed without checking.

At startup, detect whether FFmpeg and FFprobe are available.

If not available:

Show a friendly setup message:

"FFmpeg is required for video conversion."

Provide instructions in README rather than attempting an automatic internet download.

If practical, allow configuration of the FFmpeg executable path.

Do not download large binaries automatically.

---

# 32. Image Decoder Setup

HEIC/HEIF support is required.

Investigate the simplest reliable Node.js-compatible approach.

Do not introduce a huge unnecessary image-processing stack.

If Sharp alone does not reliably support the required HEIC decoding on the target Windows environment, choose a practical local decoder/conversion dependency or use an FFmpeg-based image conversion fallback.

The final implementation must actually be tested with real HEIC files.

---

# 33. Testing

Before considering the project complete, test with:

### Images

* HEIC portrait
* HEIC landscape
* high-resolution HEIC
* HEIF
* image with EXIF orientation
* existing JPG in the same folder
* unrelated file

### Videos

* iPhone MOV
* HEVC/H.265 MOV
* video with audio
* video without audio if possible
* portrait video
* landscape video
* 1080p
* 4K if hardware permits
* existing MP4
* unrelated files

Verify:

* output opens
* image dimensions are preserved
* orientation is correct
* video is H.264
* video container is MP4
* audio is AAC where applicable
* Android default player compatibility is the primary target
* no sideways videos
* no unnecessary resolution reduction

---

# 34. Do Not Overbuild

This is a personal local utility, not a SaaS product.

DO NOT add:

* user accounts
* database
* payments
* cloud upload
* admin panel
* authentication
* Redis
* Docker
* microservices
* Kubernetes
* unnecessary state-management libraries
* unnecessary UI frameworks
* cloud transcoding
* external APIs

Keep the code understandable for a beginner/intermediate developer.

---

# 35. Development Strategy

Build in phases.

## Phase 1

Create:

* React/Vite UI
* Node/Express backend
* health check
* basic folder/file selection
* project structure

Run the application locally.

## Phase 2

Implement HEIC/HEIF → JPEG.

Test real images.

Verify:

* dimensions
* orientation
* quality
* filenames
* batch conversion

## Phase 3

Implement MOV/HEVC → H.264/AAC MP4 using FFmpeg.

Test real iPhone videos.

## Phase 4

Add batch progress.

## Phase 5

Add verification.

## Phase 6

Polish UI.

Do NOT implement everything at once.

After each phase, make sure the application still runs.

---

# 36. Important Instruction for the Coding Agent

Before installing dependencies:

1. Inspect the existing environment.
2. Check Node.js/npm versions.
3. Check whether FFmpeg/FFprobe already exists.
4. Only install packages that are actually required.
5. Avoid duplicate libraries.
6. Do not install huge frameworks unnecessarily.

Before writing large amounts of code:

* create the architecture
* explain the implementation plan briefly
* then implement Phase 1
* run/test it
* fix errors
* proceed to the next phase

Do not generate a huge project blindly in one step.

---

# 37. Final Product Goal

The finished application should feel like:

"Drop/select my iPhone media → choose conversion → select output folder → convert → get Android-compatible high-quality files."

The most important priorities are:

1. Correct conversion
2. Android compatibility
3. High visual quality
4. Correct orientation
5. Batch processing
6. Local privacy
7. Simple UI
8. Lightweight architecture
9. Easy maintenance
10. No unnecessary dependencies

Do not sacrifice media correctness just to make the code shorter.

Do not sacrifice simplicity by introducing unnecessary enterprise architecture.
