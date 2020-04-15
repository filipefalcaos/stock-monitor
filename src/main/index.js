'use strict'

import { app, BrowserWindow, Menu } from 'electron'

let mainWindow;
const isMac = process.platform === 'darwin';
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`;

const createMenu = (window) => {
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'Arquivo',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit', label: 'Sair' }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectAll', label: 'Selecionar Tudo' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// Creates a new Electron window
const createWindow = () => {
  mainWindow = new BrowserWindow({ height: 1000, width: 2000 });
  mainWindow.title = "stock-monitor";
  mainWindow.loadURL(winURL);
  createMenu(mainWindow);
  mainWindow.maximize();
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
