import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * Check if FFmpeg is available on the system.
 * Returns version info if found, null if not.
 */
export async function checkFFmpeg() {
  try {
    const { stdout } = await execFileAsync('ffmpeg', ['-version']);
    const versionLine = stdout.split('\n')[0] || '';
    const match = versionLine.match(/ffmpeg version (\S+)/);
    return {
      available: true,
      version: match ? match[1] : 'unknown',
      path: 'system PATH'
    };
  } catch {
    return { available: false, version: null, path: null };
  }
}

/**
 * Check if FFprobe is available on the system.
 * Returns version info if found, null if not.
 */
export async function checkFFprobe() {
  try {
    const { stdout } = await execFileAsync('ffprobe', ['-version']);
    const versionLine = stdout.split('\n')[0] || '';
    const match = versionLine.match(/ffprobe version (\S+)/);
    return {
      available: true,
      version: match ? match[1] : 'unknown',
      path: 'system PATH'
    };
  } catch {
    return { available: false, version: null, path: null };
  }
}
