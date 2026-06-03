/**
 * MediCore ERP – Electron Main Process
 * Handles window creation and all IPC channels exposed via preload.ts
 */
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import started from 'electron-squirrel-startup';

// ─── Squirrel startup guard (Windows installer) ──────────────────────────────
if (started) {
  app.quit();
}

// ─── Config persistence (simple JSON file) ───────────────────────────────────
const CONFIG_PATH = path.join(app.getPath('userData'), 'medicore-config.json');

function readConfig(): Record<string, string> {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch { /* ignore parse errors */ }
  return {};
}

function writeConfig(data: Record<string, string>) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function getConfigValue(key: string): string | null {
  return readConfig()[key] ?? null;
}

function setConfigValue(key: string, value: string) {
  const cfg = readConfig();
  cfg[key] = value;
  writeConfig(cfg);
}

// ─── Backend API base URL ─────────────────────────────────────────────────────
const API_BASE = 'http://localhost:3001/api';

async function apiPost(endpoint: string, body: object, token?: string) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

async function apiGet(endpoint: string, token?: string) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

// License check with 7-day offline grace period
ipcMain.handle('license:check', async (_event, storeId: string) => {
  const token = getConfigValue('access_token');
  const GRACE_KEY = `grace_${storeId}`;
  const GRACE_DAYS = 7;

  try {
    // Try to reach backend
    const data = await apiGet(`/license/${storeId}`, token ?? undefined);

    // On success, reset grace period counter
    setConfigValue(GRACE_KEY, String(GRACE_DAYS));
    setConfigValue('last_license_check', new Date().toISOString());

    const expiry = new Date(data.expiryDate);
    const now = new Date();
    const msLeft = expiry.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));

    return {
      isValid: data.isValid,
      daysRemaining,
      gracePeriodActive: false,
      plan: data.plan,
      expiryDate: data.expiryDate,
      status: data.status,
    };
  } catch {
    // Backend unreachable – apply grace period
    const storedGrace = getConfigValue(GRACE_KEY);
    let graceDaysLeft = storedGrace !== null ? parseInt(storedGrace, 10) : GRACE_DAYS;

    // Decrement by 1 per day using last check timestamp
    const lastCheck = getConfigValue('last_license_check');
    if (lastCheck) {
      const daysSinceCheck = Math.floor(
        (Date.now() - new Date(lastCheck).getTime()) / (1000 * 60 * 60 * 24),
      );
      graceDaysLeft = Math.max(0, graceDaysLeft - daysSinceCheck);
    }

    setConfigValue(GRACE_KEY, String(graceDaysLeft));

    return {
      isValid: graceDaysLeft > 0,
      daysRemaining: graceDaysLeft,
      gracePeriodActive: true,
      plan: getConfigValue('license_plan') ?? 'Basic',
      expiryDate: getConfigValue('license_expiry') ?? '',
      status: graceDaysLeft > 0 ? 'GracePeriod' : 'Expired',
    };
  }
});

// Auth login
ipcMain.handle('auth:login', async (_event, { username, password }: { username: string; password: string }) => {
  const result = await apiPost('/auth/login', { username, password });
  // Persist token for future IPC calls
  if (result.access_token) {
    setConfigValue('access_token', result.access_token);
  }
  return result;
});

// Change password (first login mandatory)
ipcMain.handle('auth:changePassword', async (_event, { newPassword, tempToken }: { newPassword: string; tempToken: string }) => {
  const result = await apiPost('/auth/change-password', { newPassword, tempToken });
  if (result.access_token) {
    setConfigValue('access_token', result.access_token);
  }
  return result;
});

// Config get/set
ipcMain.handle('config:get', (_event, key: string) => getConfigValue(key));
ipcMain.handle('config:set', (_event, { key, value }: { key: string; value: string }) => {
  setConfigValue(key, value);
  return true;
});

// Open DevTools
ipcMain.on('dev:openDevTools', (_event) => {
  BrowserWindow.getFocusedWindow()?.webContents.openDevTools();
});

// ─── Window creation ──────────────────────────────────────────────────────────
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'MediCore ERP',
    backgroundColor: '#090b11',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // Required for contextBridge
      nodeIntegration: false,   // Security: renderer has no Node.js access
      sandbox: false,           // Needed for preload to use Node APIs
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open DevTools only in development
  if (process.env.NODE_ENV === 'development' || MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Open external links in system browser (not Electron)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
};

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
