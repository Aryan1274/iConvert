import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import multer from 'multer';
import { broadcastProgress } from '../utils/sse.js';
import { probeVideo } from '../utils/mediaProbe.js';
import { getFfmpegPath } from '../utils/ffmpegPath.js';

const execFileAsync = promisify(execFile);
const router = Router();

// Resolve ffmpeg binary (system PATH or bundled ffmpeg-static)
const FFMPEG = getFfmpegPath();

import os from 'os';

// Temp upload dir
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
const upload = multer({ storage, limits: { fileSize: 2000 * 1024 * 1024 } });

// Ensure output directory exists, or append _1, _2
async function getUniqueOutputPath(outputDir, filename) {
  const base = path.basename(filename, path.extname(filename));
  let outPath = path.join(outputDir, `${base}.mp4`);
  let counter = 1;
  
  while (true) {
    try {
      await fs.access(outPath);
      outPath = path.join(outputDir, `${base}_${counter}.mp4`);
      counter++;
    } catch {
      return outPath;
    }
  }
}

/**
 * Delegate to probeVideo for rich auto-detection
 */
async function getVideoMetadata(filePath) {
  return await probeVideo(filePath);
}

let cachedHwEncoder = null;
async function getBestH264Encoder() {
  if (cachedHwEncoder !== null) return cachedHwEncoder;
  try {
    await execFileAsync(FFMPEG, [
      '-f', 'lavfi', '-i', 'testsrc=duration=0.1:size=64x64:rate=1',
      '-c:v', 'h264_mf', '-f', 'null', '-'
    ]);
    cachedHwEncoder = 'h264_mf';
    console.log('  ⚡ GPU Hardware Acceleration active: Windows Media Foundation (h264_mf)');
    return 'h264_mf';
  } catch {
    cachedHwEncoder = 'libx264';
    return 'libx264';
  }
}

/**
 * POST /api/videos/scan
 */
router.post('/scan', async (req, res) => {
  try {
    const { inputFolder } = req.body;
    if (!inputFolder) return res.status(400).json({ error: 'inputFolder is required' });

    const dirents = await fs.readdir(inputFolder, { withFileTypes: true });
    const videos = [];
    const supportedExts = ['.mov', '.mp4'];

    for (const dirent of dirents) {
      if (dirent.isFile()) {
        const ext = path.extname(dirent.name).toLowerCase();
        if (supportedExts.includes(ext)) {
          const filePath = path.join(inputFolder, dirent.name);
          const stat = await fs.stat(filePath);
          const meta = await getVideoMetadata(filePath);
          
          videos.push({
            filename: dirent.name,
            path: filePath,
            format: ext.replace('.', '').toUpperCase(),
            size: stat.size,
            ...meta
          });
        }
      }
    }

    res.json({ count: videos.length, files: videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/videos/convert
 */
router.post('/convert', async (req, res) => {
  try {
    const { inputFolder, outputFolder, files, quality = 'balanced' } = req.body;
    if (!inputFolder || !outputFolder || !files) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    await fs.mkdir(outputFolder, { recursive: true });
    const jobId = Date.now().toString();
    res.json({ message: 'Video conversion started', jobId, total: files.length });

    // Process asynchronously
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
          let crf = '20'; // Balanced
          if (quality === 'high') crf = '18';
          if (quality === 'small') crf = '23';

          const meta = await getVideoMetadata(inputPath);

          // Detect HDR: iPhone records 10-bit HLG (arib-std-b67) in BT.2020
          const isHLG = meta.color_transfer === 'arib-std-b67';
          const isPQ  = meta.color_transfer === 'smpte2084';
          const isHDR = isHLG || isPQ || meta.color_space === 'bt2020nc';

          const encoder = await getBestH264Encoder();
          const is4K = (meta.width && meta.width > 1920) || (meta.height && meta.height > 1080);
          let bitrate = is4K ? '35M' : '16M';
          if (quality === 'high') bitrate = is4K ? '45M' : '22M';
          if (quality === 'small') bitrate = is4K ? '20M' : '10M';

          if (!isHDR && meta.codec === 'h264') {
            await execFileAsync(FFMPEG, ['-i', inputPath, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-y', outputPath]);
          } else {
            const runConversion = async (enc) => {
              const args = ['-i', inputPath];
              if (isHDR) {
                const tonemapAlgo = isPQ ? 'mobius' : 'hable';
                const pixFmtOut = enc === 'h264_mf' ? 'nv12' : 'yuv420p';
                args.push('-vf', [
                  'zscale=t=linear:npl=100', 'format=gbrpf32le', 'zscale=p=bt709',
                  `tonemap=tonemap=${tonemapAlgo}:desat=0`, 'zscale=t=bt709:m=bt709:r=tv', `format=${pixFmtOut}`
                ].join(','));
              }

              if (enc === 'h264_mf') {
                args.push('-c:v', 'h264_mf', '-b:v', bitrate, '-pix_fmt', 'nv12');
              } else {
                args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', crf, '-threads', '0', '-pix_fmt', 'yuv420p');
              }

              args.push('-c:a', 'aac', '-b:a', '192k', '-y', outputPath);
              await execFileAsync(FFMPEG, args);
            };

            try {
              await runConversion(encoder);
            } catch (encErr) {
              if (encoder !== 'libx264') {
                await runConversion('libx264');
              } else {
                throw encErr;
              }
            }
          }
          success++;
        } catch (err) {
          console.error(`Failed to convert ${file}:`, err.message);
          failed++;
          failedFiles.push({ file, reason: 'FFmpeg video conversion failed' });
        }
        completed++;
      }

      broadcastProgress(jobId, { status: 'complete', total, completed, success, failed, failedFiles });
    })();

  } catch (error) {
    console.error('Video convert error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/videos/convert-upload
 * Accepts: multipart/form-data with field "files" (MOV/MP4)
 * Converts one file at a time, logs progress to server console.
 */
router.post('/convert-upload', upload.array('files', 50), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const total = req.files.length;
  console.log(`\n📥 [Videos] Upload received — ${total} file(s) to convert`);

  const results = [];
  const errors  = [];

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    const num  = `[${i + 1}/${total}]`;
    const outName = path.basename(file.originalname, path.extname(file.originalname)) + '.mp4';
    let outPath = path.join(CACHE_DIR, outName);

    let counter = 1;
    while (true) {
      try { await fs.access(outPath); outPath = path.join(CACHE_DIR, `${path.basename(outName, '.mp4')}_${counter}.mp4`); counter++; }
      catch { break; }
    }

    console.log(`  ⚙️  ${num} Converting: ${file.originalname}`);
    const startMs = Date.now();

    try {
      const info = await probeVideo(file.path);
      console.log(`      🔍 Detected: ${info.description}`);

      const encoder = await getBestH264Encoder();
      const bitrate = info.is4K ? '35M' : '16M';

      if (info.strategy === 'STREAM_COPY') {
        console.log(`      ⚡ Fast lossless copy (Standard H.264 SDR)`);
        await execFileAsync(FFMPEG, ['-i', file.path, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-y', outPath]);
      } else {
        const runConversion = async (enc) => {
          const args = ['-i', file.path];
          const pixFmtOut = enc === 'h264_mf' ? 'nv12' : 'yuv420p';

          if (info.strategy === 'HDR_TONEMAP_HLG') {
            console.log(`      📺 Applying HLG HDR Tonemap (Hable) + ${enc}`);
            args.push('-vf', [
              'zscale=t=linear:npl=100', 'format=gbrpf32le', 'zscale=p=bt709',
              'tonemap=tonemap=hable:desat=0', 'zscale=t=bt709:m=bt709:r=tv', `format=${pixFmtOut}`
            ].join(','));
          } else if (info.strategy === 'HDR_TONEMAP_PQ') {
            console.log(`      📺 Applying PQ HDR Tonemap (Mobius) + ${enc}`);
            args.push('-vf', [
              'zscale=t=linear:npl=100', 'format=gbrpf32le', 'zscale=p=bt709',
              'tonemap=tonemap=mobius:desat=0', 'zscale=t=bt709:m=bt709:r=tv', `format=${pixFmtOut}`
            ].join(','));
          } else if (info.strategy === 'APPLE_LOG') {
            console.log(`      🎨 Applying Apple Log Tonemap + ${enc}`);
            args.push('-vf', [
              'zscale=t=linear:npl=100', 'format=gbrpf32le', 'zscale=p=bt709',
              'tonemap=tonemap=hable:desat=0', 'zscale=t=bt709:m=bt709:r=tv', `format=${pixFmtOut}`
            ].join(','));
          } else if (info.strategy === 'P3_TO_BT709') {
            console.log(`      🌈 Applying Display P3 to BT.709 Gamut Calibration + ${enc}`);
            args.push('-vf', [
              'zscale=p=bt709:m=bt709:r=tv', `format=${pixFmtOut}`
            ].join(','));
          } else {
            console.log(`      ⚡ Standard Transcode to H.264 + ${enc}`);
          }

          if (enc === 'h264_mf') {
            args.push('-c:v', 'h264_mf', '-b:v', bitrate, '-pix_fmt', 'nv12');
          } else {
            args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-threads', '0', '-pix_fmt', 'yuv420p');
          }

          args.push('-c:a', 'aac', '-b:a', '192k', '-y', outPath);
          await execFileAsync(FFMPEG, args);
        };

        try {
          await runConversion(encoder);
        } catch (encErr) {
          if (encoder !== 'libx264') {
            console.log(`      ⚠️ Hardware encoder fallback to libx264: ${encErr.message}`);
            await runConversion('libx264');
          } else {
            throw encErr;
          }
        }
      }

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

  console.log(`\n✨ [Videos] Complete — ${results.length} succeeded, ${errors.length} failed\n`);
  res.json({ results, errors, total, success: results.length, failed: errors.length });
});

export default router;

