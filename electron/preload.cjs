const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('iConvertDesktop', {
  isDesktop: true,
  platform: process.platform
});
