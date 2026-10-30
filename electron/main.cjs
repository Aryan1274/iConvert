const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const http = require('http');

let mainWindow = null;
let serverProcess = null;
const SERVER_PORT = 3001;

function waitForServer(callback, maxRetries = 40) {
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
      setTimeout(check, 250);
    } else {
      console.warn('Server readiness timed out, loading interface anyway...');
      callback();
    }
  };

  check();
}

function startServer() {
  const isDev = !app.isPackaged;
  const serverPath = isDev
    ? path.join(__dirname, '../server/index.js')
    : path.join(process.resourcesPath, 'server/index.js');

  serverProcess = fork(serverPath, [], {
    env: {
      ...process.env,
      PORT: SERVER_PORT.toString(),
      NODE_ENV: isDev ? 'development' : 'production'
    },
    stdio: 'inherit'
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start internal server process:', err);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 940,
    minHeight: 660,
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

  // Open external links in user's default browser
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
