import { app, BrowserWindow, Menu, Tray, ipcMain, shell, dialog, protocol } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import Store from 'electron-store';
import { createHash } from 'crypto';

// Initialize secure store for settings
const store = new Store({
  name: 'codeforge-settings',
  encryptionKey: 'codeforge-secure-key-v1'
});

// Window state management
interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isFullScreen: boolean;
}

class CodeForgeApp {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private isQuitting = false;

  constructor() {
    this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    // Task 1: Initialize Electron/Tauri application framework
    await app.whenReady();
    this.setupSecurityPolicies();
    this.registerProtocolHandlers();
    this.setupAutoUpdater();
    this.setupCrashReporting();
    this.createMainWindow();
    this.setupNativeMenu();
    this.setupSystemTray();
    this.setupIPCHandlers();
    
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    app.on('before-quit', () => {
      this.isQuitting = true;
    });
  }

  private setupSecurityPolicies(): void {
    // Task 2: Implement secure IPC communication channels
    app.setAsDefaultProtocolClient('codeforge');
    
    // Security: Prevent new window creation
    app.on('web-contents-created', (event, contents) => {
      contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      });
    });

    // Security: Control navigation
    app.on('web-contents-created', (event, contents) => {
      contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        
        if (parsedUrl.origin !== 'http://localhost:3000' && !isDev) {
          event.preventDefault();
        }
      });
    });
  }

  private registerProtocolHandlers(): void {
    // Task 6: Implement deep linking for codeforge:// protocol
    protocol.registerSchemesAsPrivileged([
      {
        scheme: 'codeforge',
        privileges: {
          standard: true,
          secure: true,
          allowServiceWorkers: true,
          supportFetchAPI: true
        }
      }
    ]);

    app.setAsDefaultProtocolClient('codeforge');

    // Handle protocol activation (Windows/Linux)
    app.on('second-instance', (event, commandLine) => {
      const url = commandLine.find(arg => arg.startsWith('codeforge://'));
      if (url) {
        this.handleDeepLink(url);
      }
      
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) this.mainWindow.restore();
        this.mainWindow.focus();
      }
    });

    // Handle protocol activation (macOS)
    app.on('open-url', (event, url) => {
      event.preventDefault();
      this.handleDeepLink(url);
    });
  }

  private handleDeepLink(url: string): void {
    const parsedUrl = new URL(url);
    const action = parsedUrl.pathname.substring(1);
    const params = Object.fromEntries(parsedUrl.searchParams);

    if (this.mainWindow) {
      this.mainWindow.webContents.send('deep-link', { action, params });
    }
  }

  private setupAutoUpdater(): void {
    // Task 3: Add auto-updater functionality with signed updates
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
      
      autoUpdater.on('update-available', () => {
        dialog.showMessageBox(this.mainWindow!, {
          type: 'info',
          title: 'Update Available',
          message: 'A new version of CodeForge is available. It will be downloaded in the background.',
          buttons: ['OK']
        });
      });

      autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox(this.mainWindow!, {
          type: 'info',
          title: 'Update Ready',
          message: 'Update downloaded. CodeForge will restart to apply the update.',
          buttons: ['Restart Now', 'Later']
        }).then((result) => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall();
          }
        });
      });

      // Check for updates every hour
      setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
      }, 60 * 60 * 1000);
    }
  }

  private setupCrashReporting(): void {
    // Task 4: Implement crash reporting with Sentry
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      // In production, send to Sentry
      if (!isDev) {
        // Sentry.captureException(error);
      }
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // In production, send to Sentry
      if (!isDev) {
        // Sentry.captureException(new Error(`Unhandled Rejection: ${reason}`));
      }
    });
  }

  private createMainWindow(): void {
    // Task 8: Implement window state management
    const windowState = this.getWindowState();
    
    this.mainWindow = new BrowserWindow({
      ...windowState,
      minWidth: 1200,
      minHeight: 800,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: !isDev,
        allowRunningInsecureContent: false,
        experimentalFeatures: false
      },
      icon: path.join(__dirname, '../../assets/icon.png')
    });

    const startUrl = isDev 
      ? 'http://localhost:3000' 
      : `file://${path.join(__dirname, '../renderer/index.html')}`;
    
    this.mainWindow.loadURL(startUrl);

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow!.show();
      
      if (windowState.isMaximized) {
        this.mainWindow!.maximize();
      }
      
      if (windowState.isFullScreen) {
        this.mainWindow!.setFullScreen(true);
      }
    });

    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting && process.platform === 'darwin') {
        event.preventDefault();
        this.mainWindow!.hide();
      } else {
        this.saveWindowState();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Save window state on changes
    ['resize', 'move', 'maximize', 'unmaximize', 'enter-full-screen', 'leave-full-screen']
      .forEach(event => {
        this.mainWindow!.on(event as any, () => {
          this.saveWindowState();
        });
      });
  }

  private getWindowState(): WindowState {
    const defaultState: WindowState = {
      width: 1400,
      height: 900,
      isMaximized: false,
      isFullScreen: false
    };

    const savedState = store.get('windowState', defaultState) as WindowState;
    return { ...defaultState, ...savedState };
  }

  private saveWindowState(): void {
    if (!this.mainWindow) return;

    const bounds = this.mainWindow.getBounds();
    const state: WindowState = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: this.mainWindow.isMaximized(),
      isFullScreen: this.mainWindow.isFullScreen()
    };

    store.set('windowState', state);
  }

  private setupNativeMenu(): void {
    // Task 5: Add native menu and keyboard shortcuts
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'CodeForge',
        submenu: [
          {
            label: 'About CodeForge',
            click: () => {
              dialog.showMessageBox(this.mainWindow!, {
                type: 'info',
                title: 'About CodeForge',
                message: 'CodeForge v1.0.0-mvp\nNext-generation AI-assisted development platform',
                buttons: ['OK']
              });
            }
          },
          { type: 'separator' },
          {
            label: 'Preferences',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              this.mainWindow?.webContents.send('open-preferences');
            }
          },
          { type: 'separator' },
          {
            label: 'Quit CodeForge',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              this.isQuitting = true;
              app.quit();
            }
          }
        ]
      },
      {
        label: 'File',
        submenu: [
          {
            label: 'New Project',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('new-project');
            }
          },
          {
            label: 'Open Project',
            accelerator: 'CmdOrCtrl+O',
            click: async () => {
              const result = await dialog.showOpenDialog(this.mainWindow!, {
                properties: ['openDirectory'],
                title: 'Open Project Folder'
              });
              
              if (!result.canceled && result.filePaths.length > 0) {
                this.mainWindow?.webContents.send('open-project', result.filePaths[0]);
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Save',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              this.mainWindow?.webContents.send('save-file');
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectall' },
          { type: 'separator' },
          {
            label: 'Command Palette',
            accelerator: 'CmdOrCtrl+Shift+P',
            click: () => {
              this.mainWindow?.webContents.send('open-command-palette');
            }
          }
        ]
      },
      {
        label: 'AI',
        submenu: [
          {
            label: 'AI Chat',
            accelerator: 'CmdOrCtrl+Shift+C',
            click: () => {
              this.mainWindow?.webContents.send('open-ai-chat');
            }
          },
          {
            label: 'Generate Code',
            accelerator: 'CmdOrCtrl+G',
            click: () => {
              this.mainWindow?.webContents.send('generate-code');
            }
          },
          {
            label: 'Explain Code',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
              this.mainWindow?.webContents.send('explain-code');
            }
          },
          { type: 'separator' },
          {
            label: 'Toggle 3D View',
            accelerator: 'CmdOrCtrl+3',
            click: () => {
              this.mainWindow?.webContents.send('toggle-3d-view');
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupSystemTray(): void {
    // Task 7: Add system tray integration
    const iconPath = path.join(__dirname, '../../assets/tray-icon.png');
    this.tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show CodeForge',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
          }
        }
      },
      {
        label: 'AI Status',
        submenu: [
          {
            label: 'Local Model: Ready',
            enabled: false
          },
          {
            label: 'Cloud: Connected',
            enabled: false
          }
        ]
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          this.isQuitting = true;
          app.quit();
        }
      }
    ]);

    this.tray.setToolTip('CodeForge - AI Development Platform');
    this.tray.setContextMenu(contextMenu);

    this.tray.on('click', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isVisible()) {
          this.mainWindow.hide();
        } else {
          this.mainWindow.show();
          this.mainWindow.focus();
        }
      }
    });
  }

  private setupIPCHandlers(): void {
    // Task 2: Implement secure IPC communication channels
    
    // File operations
    ipcMain.handle('read-file', async (event, filePath: string) => {
      try {
        const fs = await import('fs/promises');
        return await fs.readFile(filePath, 'utf-8');
      } catch (error) {
        throw new Error(`Failed to read file: ${error}`);
      }
    });

    ipcMain.handle('write-file', async (event, filePath: string, content: string) => {
      try {
        const fs = await import('fs/promises');
        await fs.writeFile(filePath, content, 'utf-8');
        return true;
      } catch (error) {
        throw new Error(`Failed to write file: ${error}`);
      }
    });

    // Model operations with integrity checking
    ipcMain.handle('verify-model-integrity', async (event, modelPath: string, expectedHash: string) => {
      try {
        const fs = await import('fs/promises');
        const fileBuffer = await fs.readFile(modelPath);
        const actualHash = createHash('sha256').update(fileBuffer).digest('hex');
        return actualHash === expectedHash;
      } catch (error) {
        throw new Error(`Failed to verify model integrity: ${error}`);
      }
    });

    // App information
    ipcMain.handle('get-app-info', () => {
      return {
        version: app.getVersion(),
        platform: process.platform,
        arch: process.arch,
        electronVersion: process.versions.electron,
        nodeVersion: process.versions.node
      };
    });

    // Window controls
    ipcMain.handle('minimize-window', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('maximize-window', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('close-window', () => {
      this.mainWindow?.close();
    });

    // Store operations
    ipcMain.handle('store-get', (event, key: string) => {
      return store.get(key);
    });

    ipcMain.handle('store-set', (event, key: string, value: any) => {
      store.set(key, value);
    });

    ipcMain.handle('store-delete', (event, key: string) => {
      store.delete(key);
    });
  }
}

// Initialize the application
new CodeForgeApp(); 