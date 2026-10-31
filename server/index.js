import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import healthRouter from './routes/health.js';
import fsRouter from './routes/fs.js';
import imagesRouter from './routes/images.js';
import videosRouter from './routes/videos.js';
import { addClient } from './utils/sse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Cache directory in user's temp or appdata so write permissions always succeed
const CACHE_DIR = process.env.ICONVERT_CACHE_DIR || path.join(os.tmpdir(), 'iconvert-cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static cache files for UI preview
app.use('/api/cache', express.static(CACHE_DIR));

// SSE Progress Stream
app.get('/api/progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  addClient(res);
});

// Routes
app.use('/api', healthRouter);
app.use('/api/fs', fsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/videos', videosRouter);

// Serve built frontend in production
const clientCandidates = [
  path.join(__dirname, '../client/dist'),
  path.join(__dirname, '../../client/dist'),
  process.env.RESOURCES_PATH ? path.join(process.env.RESOURCES_PATH, 'client/dist') : null,
  process.resourcesPath ? path.join(process.resourcesPath, 'client/dist') : null,
  process.resourcesPath ? path.join(process.resourcesPath, 'app.asar/client/dist') : null,
  path.resolve('client/dist'),
  path.resolve('../client/dist')
];

let clientDistPath = null;
for (const cand of clientCandidates) {
  if (cand && fs.existsSync(cand) && fs.existsSync(path.join(cand, 'index.html'))) {
    clientDistPath = cand;
    console.log(`✅ [frontend] Serving static UI from: ${clientDistPath}`);
    break;
  }
}

if (clientDistPath) {
  app.use(express.static(clientDistPath));
}

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (clientDistPath) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  res.status(200).send('<!doctype html><html><body style="background:#0a0a0f;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;"><h2>Starting iConvert UI...</h2></body></html>');
});

// Start server
app.listen(PORT, () => {
  console.log(`\n  🚀 iConvert server running at http://localhost:${PORT}`);
  console.log(`  📡 Health check: http://localhost:${PORT}/api/health\n`);
});
