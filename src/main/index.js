'use strict'

import { app, BrowserWindow } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`;

// Creates a new Electron window
function createWindow() {
  mainWindow = new BrowserWindow({ height: 800, width: 1500 });
  mainWindow.loadURL(winURL);
  mainWindow.on('closed', () => { mainWindow = null });
}

// Creates the main window when ready
app.on('ready', createWindow);

// MacOS behavior
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// MacOS behavior
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
