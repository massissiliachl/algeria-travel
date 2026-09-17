const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function loadConfig() {
  const candidates = app.isPackaged
    ? [
        path.join(path.dirname(process.execPath), 'config.json'),
        path.join(process.resourcesPath, 'config.json'),
      ]
    : [path.join(__dirname, 'config.json')];

  for (const configPath of candidates) {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  }

  throw new Error('config.json introuvable');
}

const config = loadConfig();
const ADMIN_URL = (process.env.ADMIN_URL || config.adminUrl || '').trim();
const APP_NAME = (process.env.APP_NAME || config.appName || 'Algeria Travel Admin').trim();
const IS_LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(ADMIN_URL);

if (!ADMIN_URL) {
  console.error('adminUrl manquant — configurez admin-desktop/config.json');
  app.quit();
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

let mainWindow;

function isExternalUrl(url) {
  try {
    const target = new URL(url);
    const adminOrigin = new URL(ADMIN_URL).origin;
    return target.origin !== adminOrigin;
  } catch {
    return true;
  }
}

function localHelpText() {
  return 'Lancez d’abord en local :\n\n  npm run dev:local\n\n(Backend :5000 + Admin :5173)';
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    title: APP_NAME,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalUrl(url)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (isExternalUrl(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.webContents.on('did-fail-load', (_event, code, description, url) => {
    if (url === ADMIN_URL || url.startsWith(ADMIN_URL)) {
      dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: APP_NAME,
        message: IS_LOCAL ? 'Admin locale inaccessible.' : 'Impossible de charger l’admin.',
        detail: IS_LOCAL
          ? `${description} (${code})\n\nURL : ${ADMIN_URL}\n\n${localHelpText()}`
          : `${description} (${code})\n\nURL : ${ADMIN_URL}\n\nVérifiez internet et le déploiement de l’admin.`,
      });
    }
  });

  mainWindow.webContents.on('did-finish-load', async () => {
    try {
      const bodyText = await mainWindow.webContents.executeJavaScript(
        'document.body ? document.body.innerText.trim() : ""'
      );
      if (bodyText === 'Not Found') {
        await dialog.showMessageBox(mainWindow, {
          type: 'warning',
          title: APP_NAME,
          message: 'Page admin introuvable (404).',
          detail: IS_LOCAL
            ? `URL : ${ADMIN_URL}\n\n${localHelpText()}`
            : `URL : ${ADMIN_URL}\n\nL’admin n’est pas déployée sur ce serveur.`,
        });
      }
    } catch {
      /* ignore */
    }
  });

  mainWindow.loadURL(ADMIN_URL).catch(async (err) => {
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: APP_NAME,
      message: IS_LOCAL ? 'Admin locale inaccessible.' : 'Impossible de charger l’admin.',
      detail: IS_LOCAL
        ? `${err.message}\n\nURL : ${ADMIN_URL}\n\n${localHelpText()}`
        : `${err.message}\n\nURL : ${ADMIN_URL}`,
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.setName(APP_NAME);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
