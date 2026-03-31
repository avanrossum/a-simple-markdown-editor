const { globalShortcut, BrowserWindow } = require('electron');

// ── Global Shortcuts Manager ──
// Registers system-wide hotkeys that work even when the app is not focused.
// Shortcuts are registered/unregistered based on user settings.

class GlobalShortcuts {
  constructor({ store, getFocusedWindow, createWindowIfNeeded }) {
    this.store = store;
    this.getFocusedWindow = getFocusedWindow;
    this.createWindowIfNeeded = createWindowIfNeeded;
    this.registered = new Map(); // accelerator → action name
  }

  // ── Public API ──

  /** (Re)register all shortcuts based on current settings */
  refresh() {
    this.unregisterAll();

    const enabled = this.store.getSetting('globalHotkeysEnabled');
    if (!enabled) return;

    const openPathAccelerator = this.store.getSetting('globalHotkeyOpenPath');
    if (openPathAccelerator) {
      this._register(openPathAccelerator, 'openPath', () => {
        this._bringToFrontAndSend('open-from-path');
      });
    }
  }

  /** Unregister all shortcuts (call on quit) */
  unregisterAll() {
    for (const accelerator of this.registered.keys()) {
      try {
        globalShortcut.unregister(accelerator);
      } catch {
        // Already unregistered
      }
    }
    this.registered.clear();
  }

  /** Check if an accelerator string is valid and available */
  isAcceleratorAvailable(accelerator) {
    if (!accelerator) return false;
    try {
      // Try registering and immediately unregistering
      const success = globalShortcut.register(accelerator, () => {});
      if (success) globalShortcut.unregister(accelerator);
      return success;
    } catch {
      return false;
    }
  }

  // ── Private ──

  _register(accelerator, name, callback) {
    try {
      const success = globalShortcut.register(accelerator, callback);
      if (success) {
        this.registered.set(accelerator, name);
      } else {
        console.warn(`[global-shortcuts] Failed to register ${accelerator} — may be in use by another app`);
      }
    } catch (err) {
      console.warn(`[global-shortcuts] Error registering ${accelerator}:`, err.message);
    }
  }

  _bringToFrontAndSend(channel) {
    let win = this.getFocusedWindow();

    if (!win || win.isDestroyed()) {
      // No window — create one
      win = this.createWindowIfNeeded();
      if (!win) return;
      win.webContents.once('did-finish-load', () => {
        win.webContents.send(channel);
      });
    } else {
      // Bring existing window to front
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
      win.webContents.send(channel);
    }
  }
}

module.exports = GlobalShortcuts;
