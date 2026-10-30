import { Router } from 'express';
import { checkFFmpeg, checkFFprobe } from '../utils/ffmpeg.js';

const router = Router();

/**
 * GET /api/health
 * Returns server status and FFmpeg/FFprobe availability.
 */
router.get('/health', async (req, res) => {
  const ffmpeg = await checkFFmpeg();
  const ffprobe = await checkFFprobe();

  res.json({
    status: 'ok',
    server: 'iConvert',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    dependencies: {
      ffmpeg,
      ffprobe
    }
  });
});

export default router;
