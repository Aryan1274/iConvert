import { execFileSync } from 'child_process';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolves the ffmpeg binary path.
 *
 * Priority order:
 *   1. System ffmpeg (already in PATH) — fastest, respects user's install
 *   2. Electron packaged binary (resources/ffmpeg/ffmpeg.exe) — inside .exe
 *   3. Bundled ffmpeg-static (dev mode) — self-contained npm fallback
 *
 * @returns {string} Absolute path to ffmpeg binary (or 'ffmpeg' if on PATH)
 */
export function getFfmpegPath() {
  // 1. Check if ffmpeg is available on the system PATH
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore', timeout: 3000 });
    console.log('✅ [ffmpeg] Using system-installed ffmpeg from PATH');
    return 'ffmpeg';
  } catch {
    // Not in PATH — fall through
  }

  // 2. Check for the binary bundled inside the Electron .exe (resources/ffmpeg/)
  const resPath = process.env.RESOURCES_PATH || process.resourcesPath;
  if (resPath) {
    const electronBundled = path.join(resPath, 'ffmpeg', 'ffmpeg.exe');
    try {
      execFileSync(electronBundled, ['-version'], { stdio: 'ignore', timeout: 3000 });
      console.log(`✅ [ffmpeg] Using Electron-bundled ffmpeg: ${electronBundled}`);
      return electronBundled;
    } catch {
      // Not found at that path
    }
  }

  // 3. Try ffmpeg-static (development / npm install)
  try {
    const ffmpegStatic = require('ffmpeg-static');
    if (ffmpegStatic) {
      console.log(`✅ [ffmpeg] Using bundled ffmpeg-static: ${ffmpegStatic}`);
      return ffmpegStatic;
    }
  } catch {
    // ffmpeg-static not installed
  }

  // 4. Last resort — let it fail naturally with a clear error message
  console.warn('⚠️  [ffmpeg] No ffmpeg found. Please install ffmpeg or reinstall iConvert.');
  return 'ffmpeg';
}

/**
 * Resolves the ffprobe binary path.
 * ffprobe always ships alongside ffmpeg.
 *
 * @returns {string} Absolute path to ffprobe binary (or 'ffprobe' if on PATH)
 */
export function getFfprobePath() {
  // 1. Check system PATH
  try {
    execFileSync('ffprobe', ['-version'], { stdio: 'ignore', timeout: 3000 });
    return 'ffprobe';
  } catch {
    // Not in PATH
  }

  // 2. Electron packaged binary
  if (process.resourcesPath) {
    const electronBundled = path.join(process.resourcesPath, 'ffmpeg', 'ffprobe.exe');
    try {
      execFileSync(electronBundled, ['-version'], { stdio: 'ignore', timeout: 3000 });
      console.log(`✅ [ffprobe] Using Electron-bundled ffprobe: ${electronBundled}`);
      return electronBundled;
    } catch {
      // Not found
    }
  }

  // 3. Derive ffprobe from ffmpeg-static location
  try {
    const ffmpegStatic = require('ffmpeg-static');
    if (ffmpegStatic) {
      const ffprobePath = ffmpegStatic
        .replace('ffmpeg.exe', 'ffprobe.exe')  // Windows
        .replace(/\/ffmpeg$/, '/ffprobe');      // macOS/Linux
      console.log(`✅ [ffprobe] Using bundled ffprobe: ${ffprobePath}`);
      return ffprobePath;
    }
  } catch {
    // ffmpeg-static not installed
  }

  console.warn('⚠️  [ffprobe] No ffprobe found. Media detection will be limited.');
  return 'ffprobe';
}
