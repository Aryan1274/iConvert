const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const http = require('http');
const fs = require('fs');

let mainWindow = null;
let serverProcess = null;
const SERVER_PORT = 3001;

function waitForServer(callback, maxRetries = 50) {
  let retries = 0;
  const check = () => {
    http.get(`http://localhost:${SERVER_PORT}/api/health`, (res) => {
      if (res.statusCode === 200) {
        callback();
      } else {
        retry();
      }
    }).on('error', retry);
  };

  const retry = () => {
    retries++;
    if (retries < maxRetries) {
      setTimeout(check, 200);
    } else {
      console.warn('Server readiness timed out, loading interface anyway...');
      callback();
    }
  };

  check();
}

function startServer() {
  const isDev = !app.isPackaged;
  
  // Potential server paths in dev or packaged app
  const candidatePaths = isDev
    ? [path.join(__dirname, '../server/index.js')]
    : [
        path.join(process.resourcesPath, 'server/index.js'),
        path.join(app.getAppPath(), 'server/index.js')
      ];

  let serverPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[0];

  const nodeModulesPaths = [
    path.join(process.resourcesPath, 'server/node_modules'),
    path.join(process.resourcesPath, 'app.asar/node_modules'),
    path.join(__dirname, '../server/node_modules'),
    path.join(__dirname, '../node_modules')
  ].filter(p => fs.existsSync(p));

  const env = {
    ...process.env,
    PORT: SERVER_PORT.toString(),
    NODE_ENV: isDev ? 'development' : 'production',
    NODE_PATH: nodeModulesPaths.join(path.delimiter),
    RESOURCES_PATH: process.resourcesPath || ''
  };

  serverProcess = fork(serverPath, [], {
    env,
    stdio: 'inherit'
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start internal server process:', err);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1260,
    height: 860,
    minWidth: 960,
    minHeight: 680,
    title: 'iConvert — iPhone Media Converter',
    icon: path.join(__dirname, '../build/icon.png'),
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    autoHideMenuBar: true,
    show: false
  });

  const isDev = !app.isPackaged && process.env.ELECTRON_DEV === '1';

  waitForServer(() => {
    if (isDev) {
      mainWindow.loadURL('http://localhost:5173');
    } else {
      mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);
    }

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch {}
  }
});
