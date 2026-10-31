import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import multer from 'multer';
import { broadcastProgress } from '../utils/sse.js';
import { probeImage } from '../utils/mediaProbe.js';
import { getFfmpegPath } from '../utils/ffmpegPath.js';

const execFileAsync = promisify(execFile);

// Resolve ffmpeg binary (system PATH or bundled ffmpeg-static)
const FFMPEG = getFfmpegPath();
const router = Router();

import os from 'os';

// Temp upload dir — files land here, get converted, then served from cache
const CACHE_DIR  = process.env.ICONVERT_CACHE_DIR || path.join(os.tmpdir(), 'iconvert-cache');
const UPLOAD_DIR = path.join(CACHE_DIR, 'uploads');
await fs.mkdir(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

// Ensure output directory exists, or append _1, _2
async function getUniqueOutputPath(outputDir, filename) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  
  let outPath = path.join(outputDir, `${base}.jpg`);
  let counter = 1;
  
  while (true) {
    try {
      await fs.access(outPath);
      outPath = path.join(outputDir, `${base}_${counter}.jpg`);
      counter++;
    } catch {
      return outPath;
    }
  }
}

/**
 * POST /api/images/scan
 */
router.post('/scan', async (req, res) => {
  try {
    const { inputFolder } = req.body;
    if (!inputFolder) return res.status(400).json({ error: 'inputFolder is required' });

    const dirents = await fs.readdir(inputFolder, { withFileTypes: true });
    const images = [];

    for (const dirent of dirents) {
      if (dirent.isFile()) {
        const ext = path.extname(dirent.name).toLowerCase();
        if (ext === '.heic' || ext === '.heif') {
          const filePath = path.join(inputFolder, dirent.name);
          const stat = await fs.stat(filePath);
          
          images.push({
            filename: dirent.name,
            path: filePath,
            format: ext.replace('.', '').toUpperCase(),
            size: stat.size,
          });
        }
      }
    }

    res.json({ count: images.length, files: images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/images/convert
 */
router.post('/convert', async (req, res) => {
  try {
    const { inputFolder, outputFolder, files, quality = 95 } = req.body;
    if (!inputFolder || !outputFolder || !files) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    await fs.mkdir(outputFolder, { recursive: true });
    const jobId = Date.now().toString();
    res.json({ message: 'Conversion started', jobId, total: files.length });

    // Process asynchronously so we don't block the HTTP response
    (async () => {
      let completed = 0;
      let success = 0;
      let failed = 0;
      const failedFiles = [];
      const total = files.length;

      broadcastProgress(jobId, { status: 'starting', total, completed: 0 });

      for (const file of files) {
        broadcastProgress(jobId, { status: 'processing', currentFile: file, total, completed, success, failed });
        
        const inputPath = path.join(inputFolder, file);
        const outputPath = await getUniqueOutputPath(outputFolder, file);
        
        try {
          // Use qscale 1 (highest quality) for default 95+ to eliminate blur
          let qscale = 1;
          if (quality < 90) qscale = 3;
          else if (quality < 95) qscale = 2;

          await execFileAsync(FFMPEG, [
            '-i', inputPath,
            '-map_metadata', '0', // Preserve EXIF, orientation, and color profiles
            '-qscale:v', String(qscale),
            '-y',
            outputPath
          ]);
          success++;
        } catch (err) {
          console.error(`Failed to convert ${file}:`, err.message);
          failed++;
          failedFiles.push({ file, reason: 'FFmpeg conversion failed' });
        }
        completed++;
      }

      broadcastProgress(jobId, { status: 'complete', total, completed, success, failed, failedFiles });
    })();

  } catch (error) {
    console.error('Image convert error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/images/convert-upload
 * Accepts: multipart/form-data with field "files"
 * Converts one file at a time, logs progress to server console.
 */
router.post('/convert-upload', upload.array('files', 200), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const total = req.files.length;
  console.log(`\n📥 [Images] Upload received — ${total} file(s) to convert`);

  const results = [];
  const errors  = [];

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    const num  = `[${i + 1}/${total}]`;
    const outName = path.basename(file.originalname, path.extname(file.originalname)) + '.jpg';
    let outPath = path.join(CACHE_DIR, outName);

    // Deduplicate
    let counter = 1;
    while (true) {
      try { await fs.access(outPath); outPath = path.join(CACHE_DIR, `${path.basename(outName, '.jpg')}_${counter}.jpg`); counter++; }
      catch { break; }
    }

    console.log(`  ⚙️  ${num} Converting: ${file.originalname}`);
    const startMs = Date.now();

    try {
      const info = await probeImage(file.path);
      console.log(`      🔍 Detected: ${info.description}`);

      // Build ffmpeg args — do NOT use -map 0:v:0 for HEIC/HEIF.
      // iPhone HEIC files contain multiple streams (depth maps, HDR gain maps,
      // thumbnails). Forcing stream 0 often selects a tiny thumbnail or depth
      // map instead of the actual photo, producing a blank or corrupted image.
      // Let ffmpeg auto-select the best stream unless it's a standard JPEG/PNG.
      const isHEIC = /\.(heic|heif)$/i.test(file.originalname);
      const ffmpegArgs = [
        '-i', file.path,
        ...(isHEIC ? [] : ['-map', '0:v:0']), // Auto-select for HEIC, explicit for others
        '-map_metadata', '0',
        '-qscale:v', '1',
        '-y', outPath
      ];

      await execFileAsync(FFMPEG, ffmpegArgs);
      const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
      console.log(`  ✅ ${num} Done in ${elapsed}s → ${path.basename(outPath)}`);
      results.push({ 
        originalName: file.originalname, 
        name: path.basename(outPath), 
        url: `/api/cache/${path.basename(outPath)}`,
        detected: info.description
      });
    } catch (err) {
      console.error(`  ❌ ${num} FAILED: ${file.originalname} — ${err.message}`);
      errors.push({ name: file.originalname, error: err.message });
    } finally {
      await fs.unlink(file.path).catch(() => {});
    }
  }

  console.log(`\n✨ [Images] Complete — ${results.length} succeeded, ${errors.length} failed\n`);
  res.json({ results, errors, total, success: results.length, failed: errors.length });
});

export default router;

