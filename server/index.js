import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import healthRouter from './routes/health.js';
import fsRouter from './routes/fs.js';
import imagesRouter from './routes/images.js';
import videosRouter from './routes/videos.js';
import { addClient } from './utils/sse.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure cache directory exists
const CACHE_DIR = path.resolve('.iconvert-cache');
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

// Serve built frontend in production if available
const CLIENT_DIST = path.resolve('../client/dist');
const CLIENT_DIST_ALT = path.resolve('client/dist');
const clientDistPath = fs.existsSync(CLIENT_DIST) ? CLIENT_DIST : (fs.existsSync(CLIENT_DIST_ALT) ? CLIENT_DIST_ALT : null);

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`\n  🚀 iConvert server running at http://localhost:${PORT}`);
  console.log(`  📡 Health check: http://localhost:${PORT}/api/health\n`);
});
