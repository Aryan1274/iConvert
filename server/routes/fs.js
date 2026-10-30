import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const router = Router();

// Helper to get available drives on Windows (fallback for simple listing)
async function getDrives() {
  return new Promise((resolve) => {
    import('child_process').then(({ exec }) => {
      exec('wmic logicaldisk get caption', (err, stdout) => {
        if (err) {
          return resolve(['C:\\', 'D:\\']);
        }
        const drives = stdout.split('\n')
          .filter(line => /[A-Z]:/.test(line))
          .map(line => line.trim() + '\\');
        resolve(drives);
      });
    });
  });
}

/**
 * GET /api/fs/list
 * List directories in a given path.
 */
router.get('/list', async (req, res) => {
  try {
    let dirPath = req.query.path;

    if (!dirPath || dirPath === 'root') {
      // Return drives if Windows
      if (os.platform() === 'win32') {
        const drives = await getDrives();
        return res.json({
          current: 'root',
          parent: null,
          items: drives.map(d => ({ name: d, path: d, isDir: true }))
        });
      } else {
        dirPath = os.homedir();
      }
    }

    dirPath = path.resolve(dirPath);
    
    // Check if dir exists
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: 'Not a directory' });
    }

    const dirents = await fs.readdir(dirPath, { withFileTypes: true });
    
    // Only return directories
    const items = dirents
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        name: dirent.name,
        path: path.join(dirPath, dirent.name),
        isDir: true
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const parent = path.dirname(dirPath);
    
    res.json({
      current: dirPath,
      parent: parent === dirPath ? 'root' : parent,
      items
    });
  } catch (error) {
    console.error('FS list error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/fs/copy
 * Copy a file from source to destination.
 */
router.post('/copy', async (req, res) => {
  try {
    const { source, destinationFolder, filename } = req.body;
    if (!source || !destinationFolder || !filename) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    // Resolve source (if it's a URL path, map it to the actual file)
    let sourcePath = source;
    if (source.startsWith('/api/cache/')) {
      const cacheFilename = source.replace('/api/cache/', '');
      sourcePath = path.resolve('.iconvert-cache', cacheFilename);
    }

    await fs.mkdir(destinationFolder, { recursive: true });
    
    // Check if output file already exists to avoid overwrite
    let outPath = path.join(destinationFolder, filename);
    let counter = 1;
    const base = path.basename(filename, path.extname(filename));
    const ext = path.extname(filename);
    
    while (true) {
      try {
        await fs.access(outPath);
        outPath = path.join(destinationFolder, `${base}_${counter}${ext}`);
        counter++;
      } catch {
        break;
      }
    }

    await fs.copyFile(sourcePath, outPath);
    res.json({ success: true, savedPath: outPath });
  } catch (error) {
    console.error('FS copy error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/fs/file
 * Serve a local file by absolute path for previewing.
 */
router.get('/file', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    const resolvedPath = path.resolve(filePath);
    const stat = await fs.stat(resolvedPath);
    if (!stat.isFile()) {
      return res.status(400).json({ error: 'Not a file' });
    }

    res.sendFile(resolvedPath);
  } catch (error) {
    console.error('FS file error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
