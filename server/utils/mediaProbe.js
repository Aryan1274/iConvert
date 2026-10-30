import { execFile } from 'child_process';
import { promisify } from 'util';
import { getFfprobePath } from './ffmpegPath.js';

const execFileAsync = promisify(execFile);
const FFPROBE = getFfprobePath();

/**
 * Unified Auto-Detection for iPhone Videos (iPhone 12, 13, 14, 15, 16 + Pro models)
 * Probes streams, codec, bit depth, color transfer, primaries, and Dolby Vision metadata.
 */
export async function probeVideo(filePath) {
  try {
    const { stdout } = await execFileAsync(FFPROBE, [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_streams',
      '-show_format',
      '-of', 'json',
      filePath
    ]);

    const data = JSON.parse(stdout);
    const stream = data.streams && data.streams[0] ? data.streams[0] : {};
    const format = data.format || {};
    const tags = stream.tags || {};
    const formatTags = format.tags || {};

    const width = stream.width || 1920;
    const height = stream.height || 1080;
    const codec = (stream.codec_name || 'unknown').toLowerCase();
    const profile = stream.profile || '';
    const pixFmt = stream.pix_fmt || 'yuv420p';
    const colorSpace = stream.color_space || 'unknown';
    const colorTransfer = stream.color_transfer || 'unknown';
    const colorPrimaries = stream.color_primaries || 'unknown';

    // Side data check (Dolby Vision, Ambient viewing)
    const sideData = stream.side_data_list || [];
    const isDolbyVision = sideData.some(s => 
      s.side_data_type && s.side_data_type.toLowerCase().includes('dovi')
    );

    // Camera Model (e.g., "Apple iPhone 14 Pro")
    const make = formatTags.make || formatTags['com.apple.quicktime.make'] || '';
    const model = formatTags.model || formatTags['com.apple.quicktime.model'] || '';
    const device = [make, model].filter(Boolean).join(' ') || 'iPhone / QuickTime';

    // Color Classifications
    const isHLG = colorTransfer === 'arib-std-b67';
    const isPQ  = colorTransfer === 'smpte2084';
    const isLog = colorTransfer.toLowerCase().includes('log') || 
                  (tags.encoder && tags.encoder.toLowerCase().includes('log'));
    const isHDR = isHLG || isPQ || isDolbyVision || colorSpace === 'bt2020nc';
    const isP3  = colorPrimaries === 'smpte432' || colorPrimaries === 'display-p3';
    const isProRes = codec === 'prores';
    const is10Bit = pixFmt.includes('10') || profile.toLowerCase().includes('main 10');
    const is4K = width > 1920 || height > 1080;

    // Determine Processing Strategy
    let strategy = 'SDR_GPU_TRANSCODE';
    let description = '';

    if (isLog) {
      strategy = 'APPLE_LOG';
      description = `${device} Apple Log (${is10Bit ? '10-bit' : '8-bit'}, BT.2020)`;
    } else if (isHLG || (isHDR && !isPQ)) {
      strategy = 'HDR_TONEMAP_HLG';
      description = `${device} HDR (${isDolbyVision ? 'Dolby Vision / ' : ''}HLG 10-bit, BT.2020)`;
    } else if (isPQ) {
      strategy = 'HDR_TONEMAP_PQ';
      description = `${device} HDR10 (${isDolbyVision ? 'Dolby Vision / ' : ''}PQ 10-bit, BT.2020)`;
    } else if (isProRes) {
      strategy = 'PRORES_TRANSCODE';
      description = `${device} Apple ProRes (${pixFmt})`;
    } else if (!isHDR && codec === 'h264') {
      strategy = 'STREAM_COPY';
      description = `${device} Standard H.264 SDR (Rec.709)`;
    } else if (isP3) {
      strategy = 'P3_TO_BT709';
      description = `${device} SDR (Display P3 Wide Color, ${is10Bit ? '10-bit' : '8-bit'})`;
    } else {
      strategy = 'SDR_GPU_TRANSCODE';
      description = `${device} HEVC SDR (${is10Bit ? '10-bit' : '8-bit'}, Rec.709)`;
    }

    return {
      width,
      height,
      resolution: `${width}x${height}`,
      is4K,
      codec,
      profile,
      pixFmt,
      duration: format.duration ? parseFloat(format.duration).toFixed(1) + 's' : 'Unknown',
      bitRate: format.bit_rate ? Math.round(parseInt(format.bit_rate, 10) / 1000) + ' kbps' : 'Unknown',
      fps: stream.r_frame_rate || '30/1',
      colorSpace,
      colorTransfer,
      colorPrimaries,
      isHDR,
      isHLG,
      isPQ,
      isLog,
      isP3,
      isDolbyVision,
      isProRes,
      is10Bit,
      device,
      description,
      strategy
    };
  } catch (err) {
    console.error(`[mediaProbe] Video probe error for ${filePath}:`, err.message);
    return {
      width: 1920,
      height: 1080,
      resolution: '1920x1080',
      is4K: false,
      codec: 'unknown',
      pixFmt: 'yuv420p',
      isHDR: false,
      isHLG: false,
      isPQ: false,
      isLog: false,
      isP3: false,
      isDolbyVision: false,
      isProRes: false,
      is10Bit: false,
      device: 'iPhone Media',
      description: 'Standard Video (Auto-Fallback)',
      strategy: 'SDR_GPU_TRANSCODE'
    };
  }
}

/**
 * Unified Auto-Detection for iPhone Photos (HEIC, HEIF, JPG)
 * Detects color space (Display P3 vs sRGB), bit depth, and orientation.
 */
export async function probeImage(filePath) {
  try {
    const { stdout } = await execFileAsync(FFPROBE, [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_streams',
      '-show_format',
      '-of', 'json',
      filePath
    ]);

    const data = JSON.parse(stdout);
    const stream = data.streams && data.streams[0] ? data.streams[0] : {};
    const format = data.format || {};
    const formatName = (format.format_name || '').toLowerCase();
    const codec = (stream.codec_name || '').toLowerCase();

    const width = stream.width || 0;
    const height = stream.height || 0;
    const pixFmt = stream.pix_fmt || '';
    const colorPrimaries = stream.color_primaries || '';
    const isP3 = colorPrimaries === 'smpte432' || colorPrimaries === 'display-p3';
    const is10Bit = pixFmt.includes('10') || pixFmt.includes('12');

    let description = 'Standard Photo (sRGB)';
    if (codec === 'hevc' || formatName.includes('heic') || formatName.includes('heif')) {
      description = isP3 
        ? `iPhone HEIC (Display P3 Wide Color${is10Bit ? ', 10-bit' : ''})` 
        : `iPhone HEIC (sRGB Standard)`;
    } else if (isP3) {
      description = `Photo with Display P3 Wide Color`;
    }

    return {
      width,
      height,
      resolution: width && height ? `${width}x${height}` : 'Unknown',
      codec,
      format: formatName,
      pixFmt,
      colorPrimaries,
      isP3,
      is10Bit,
      description
    };
  } catch (err) {
    console.error(`[mediaProbe] Image probe error for ${filePath}:`, err.message);
    return {
      width: 0,
      height: 0,
      resolution: 'Unknown',
      codec: 'unknown',
      format: 'unknown',
      pixFmt: 'unknown',
      colorPrimaries: 'unknown',
      isP3: false,
      is10Bit: false,
      description: 'Standard Image'
    };
  }
}
