/**
 * MediCore ERP - Electron Preload Script
 * Exposes a secure IPC bridge (window.electron) to the React renderer.
 * The renderer CANNOT access Node.js APIs directly – all backend calls
 * go through this bridge → IPC → main process → HTTP request.
 */
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  /**
   * Check license validity for a given storeId.
   * Returns { isValid, daysRemaining, gracePeriodActive, plan, expiryDate, status }
   */
  checkLicense: (storeId: string) =>
    ipcRenderer.invoke('license:check', storeId),

  /**
   * Authenticate a user (username + password) against the backend.
   * Returns { access_token, user } or throws on failure.
   */
  login: (username: string, password: string) =>
    ipcRenderer.invoke('auth:login', { username, password }),

  /**
   * Change the user's password (mandatory on first login).
   */
  changePassword: (newPassword: string, tempToken: string) =>
    ipcRenderer.invoke('auth:changePassword', { newPassword, tempToken }),

  /**
   * Save a key-value pair in electron-store (persistent local config).
   */
  setConfig: (key: string, value: string) =>
    ipcRenderer.invoke('config:set', { key, value }),

  /**
   * Get a persisted config value.
   */
  getConfig: (key: string) =>
    ipcRenderer.invoke('config:get', key),

  /**
   * Open DevTools (dev mode only)
   */
  openDevTools: () => ipcRenderer.send('dev:openDevTools'),
});
