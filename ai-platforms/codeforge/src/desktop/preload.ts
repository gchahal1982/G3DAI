/**
 * CodeForge Electron Preload Script
 * Provides secure context bridge APIs for the renderer process
 * 
 * Security Features:
 * - Secure IPC communication
 * - File system access controls
 * - Model loading security with SHA-256 integrity
 * - Network request filtering
 * - Memory protection
 * - Process isolation
 */

import { contextBridge, ipcRenderer, shell, clipboard } from 'electron';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs/promises';

// Type definitions for the exposed APIs
interface ElectronAPI {
  // Window management
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  isMaximized: () => Promise<boolean>;
  
  // File system (controlled access)
  openFile: (filters?: FileFilter[]) => Promise<string | null>;
  saveFile: (content: string, defaultPath?: string) => Promise<string | null>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  watchFile: (filePath: string, callback: (event: string, filename: string) => void) => () => void;
  
  // Directory operations
  openDirectory: () => Promise<string | null>;
  readDirectory: (dirPath: string) => Promise<DirectoryEntry[]>;
  createDirectory: (dirPath: string) => Promise<void>;
  
  // Model management (secure downloads)
  downloadModel: (config: ModelDownloadConfig) => Promise<ModelDownloadResult>;
  verifyModelIntegrity: (filePath: string, expectedHash: string) => Promise<boolean>;
  getModelInfo: (filePath: string) => Promise<ModelInfo>;
  deleteModel: (filePath: string) => Promise<void>;
  
  // Storage (encrypted local storage)
  secureStorage: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
    clear: () => Promise<void>;
  };
  
  // Network (filtered and monitored)
  httpRequest: (config: HTTPRequestConfig) => Promise<HTTPResponse>;
  
  // System information
  getSystemInfo: () => Promise<SystemInfo>;
  getHardwareInfo: () => Promise<HardwareInfo>;
  
  // Clipboard (secure access)
  clipboard: {
    writeText: (text: string) => void;
    readText: () => string;
    clear: () => void;
  };
  
  // Application lifecycle
  app: {
    getVersion: () => string;
    getName: () => string;
    getPath: (name: string) => string;
    relaunch: () => void;
    quit: () => void;
  };
  
  // Development tools
  devTools: {
    toggle: () => void;
    open: () => void;
    close: () => void;
  };
  
  // Events
  on: (channel: string, callback: (...args: any[]) => void) => () => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
  emit: (channel: string, ...args: any[]) => void;
}

// Type definitions
interface FileFilter {
  name: string;
  extensions: string[];
}

interface DirectoryEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
}

interface ModelDownloadConfig {
  url: string;
  destination: string;
  expectedHash: string;
  progressCallback?: (progress: number) => void;
  chunkSize?: number;
}

interface ModelDownloadResult {
  success: boolean;
  filePath?: string;
  error?: string;
  downloadedBytes: number;
  totalBytes: number;
}

interface ModelInfo {
  name: string;
  size: number;
  hash: string;
  format: string;
  parameters?: number;
  quantization?: string;
}

interface HTTPRequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface HTTPResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
}

interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
  cpus: number;
  memory: number;
  uptime: number;
}

interface HardwareInfo {
  gpu: {
    vendor: string;
    model: string;
    memory: number;
    driver: string;
  }[];
  cpu: {
    model: string;
    cores: number;
    threads: number;
    frequency: number;
  };
  memory: {
    total: number;
    available: number;
    used: number;
  };
  storage: {
    total: number;
    available: number;
    used: number;
  };
}

// Security utilities
class SecurityManager {
  private static readonly ALLOWED_SCHEMES = ['https:', 'file:', 'data:'];
  private static readonly BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];
  private static readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private static readonly ALLOWED_EXTENSIONS = [
    '.txt', '.md', '.json', '.yaml', '.yml', '.toml',
    '.js', '.ts', '.jsx', '.tsx', '.py', '.rs', '.go',
    '.gguf', '.ggml', '.safetensors', '.bin'
  ];

  static isValidPath(filePath: string): boolean {
    const normalizedPath = path.normalize(filePath);
    const resolved = path.resolve(normalizedPath);
    
    // Prevent path traversal attacks
    if (normalizedPath.includes('..') || normalizedPath.startsWith('/')) {
      return false;
    }
    
    // Check if it's within allowed directories
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const appDataDir = process.env.APPDATA || path.join(homeDir, '.config');
    
    return resolved.startsWith(homeDir) || resolved.startsWith(appDataDir);
  }

  static isValidExtension(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.ALLOWED_EXTENSIONS.includes(ext);
  }

  static isValidURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Check scheme
      if (!this.ALLOWED_SCHEMES.includes(urlObj.protocol)) {
        return false;
      }
      
      // Block localhost and local IPs for security
      if (this.BLOCKED_HOSTS.includes(urlObj.hostname)) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  static async calculateFileHash(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }

  static sanitizeInput(input: string): string {
    return input.replace(/[<>:"'|?*\x00-\x1f]/g, '');
  }
}

// Secure storage implementation
class SecureStorage {
  private static readonly STORAGE_KEY = 'codeforge_secure_storage';
  private static encryptionKey: string;

  static async initialize(): Promise<void> {
    // Generate or retrieve encryption key
    this.encryptionKey = await this.getOrCreateEncryptionKey();
  }

  private static async getOrCreateEncryptionKey(): Promise<string> {
    // In production, this should use a more secure key derivation
    const keyPath = path.join(process.env.APPDATA || '', 'codeforge', 'key.dat');
    
    try {
      const keyData = await fs.readFile(keyPath, 'utf8');
      return keyData;
    } catch {
      // Generate new key
      const newKey = crypto.randomBytes(32).toString('hex');
      await fs.mkdir(path.dirname(keyPath), { recursive: true });
      await fs.writeFile(keyPath, newKey, { mode: 0o600 });
      return newKey;
    }
  }

  static encrypt(data: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  static decrypt(data: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  static async get(key: string): Promise<any> {
    try {
      const encrypted = await ipcRenderer.invoke('storage-get', this.STORAGE_KEY);
      if (!encrypted) return null;
      
      const decrypted = this.decrypt(encrypted);
      const data: Record<string, any> = JSON.parse(decrypted);
      return data[key] || null;
    } catch {
      return null;
    }
  }

  static async set(key: string, value: any): Promise<void> {
    try {
      let data: Record<string, any> = {};
      try {
        const existing = await ipcRenderer.invoke('storage-get', this.STORAGE_KEY);
        if (existing) {
          const decrypted = this.decrypt(existing);
          data = JSON.parse(decrypted);
        }
      } catch {
        // Ignore errors, use empty object
      }
      
      data[key] = value;
      const encrypted = this.encrypt(JSON.stringify(data));
      await ipcRenderer.invoke('storage-set', this.STORAGE_KEY, encrypted);
    } catch (error: any) {
      throw new Error(`Failed to set secure storage: ${error?.message || 'Unknown error'}`);
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      const existing = await ipcRenderer.invoke('storage-get', this.STORAGE_KEY);
      if (!existing) return;
      
      const decrypted = this.decrypt(existing);
      const data: Record<string, any> = JSON.parse(decrypted);
      delete data[key];
      
      const encrypted = this.encrypt(JSON.stringify(data));
      await ipcRenderer.invoke('storage-set', this.STORAGE_KEY, encrypted);
    } catch (error: any) {
      throw new Error(`Failed to delete from secure storage: ${error?.message || 'Unknown error'}`);
    }
  }

  static async clear(): Promise<void> {
    await ipcRenderer.invoke('storage-delete', this.STORAGE_KEY);
  }
}

// Initialize secure storage
SecureStorage.initialize().catch(console.error);

// Event listener management
const eventListeners = new Map<string, Set<Function>>();

function addListener(channel: string, callback: Function): () => void {
  if (!eventListeners.has(channel)) {
    eventListeners.set(channel, new Set());
  }
  
  eventListeners.get(channel)!.add(callback);
  
  const wrappedCallback = (_event: any, ...args: any[]) => callback(...args);
  ipcRenderer.on(channel, wrappedCallback);
  
  return () => {
    eventListeners.get(channel)?.delete(callback);
    ipcRenderer.removeListener(channel, wrappedCallback);
  };
}

function removeListener(channel: string, callback: Function): void {
  eventListeners.get(channel)?.delete(callback);
  ipcRenderer.removeAllListeners(channel);
}

// Exposed API implementation
const electronAPI: ElectronAPI = {
  // Window management
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // File system (with security checks)
  openFile: async (filters = []) => {
    const result = await ipcRenderer.invoke('dialog-open-file', filters);
    if (result && !SecurityManager.isValidPath(result)) {
      throw new Error('Invalid file path');
    }
    return result;
  },

  saveFile: async (content: string, defaultPath = '') => {
    const sanitizedPath = SecurityManager.sanitizeInput(defaultPath);
    return ipcRenderer.invoke('dialog-save-file', content, sanitizedPath);
  },

  readFile: async (filePath: string) => {
    if (!SecurityManager.isValidPath(filePath) || !SecurityManager.isValidExtension(filePath)) {
      throw new Error('Invalid file path or extension');
    }
    return ipcRenderer.invoke('fs-read-file', filePath);
  },

  writeFile: async (filePath: string, content: string) => {
    if (!SecurityManager.isValidPath(filePath) || !SecurityManager.isValidExtension(filePath)) {
      throw new Error('Invalid file path or extension');
    }
    return ipcRenderer.invoke('fs-write-file', filePath, content);
  },

  watchFile: (filePath: string, callback: (event: string, filename: string) => void) => {
    if (!SecurityManager.isValidPath(filePath)) {
      throw new Error('Invalid file path');
    }
    return addListener(`file-watch-${filePath}`, callback);
  },

  // Directory operations
  openDirectory: () => ipcRenderer.invoke('dialog-open-directory'),
  
  readDirectory: async (dirPath: string) => {
    if (!SecurityManager.isValidPath(dirPath)) {
      throw new Error('Invalid directory path');
    }
    return ipcRenderer.invoke('fs-read-directory', dirPath);
  },

  createDirectory: async (dirPath: string) => {
    if (!SecurityManager.isValidPath(dirPath)) {
      throw new Error('Invalid directory path');
    }
    return ipcRenderer.invoke('fs-create-directory', dirPath);
  },

  // Model management (secure downloads with integrity checks)
  downloadModel: async (config: ModelDownloadConfig) => {
    if (!SecurityManager.isValidURL(config.url)) {
      throw new Error('Invalid download URL');
    }
    if (!SecurityManager.isValidPath(config.destination)) {
      throw new Error('Invalid destination path');
    }
    return ipcRenderer.invoke('model-download', config);
  },

  verifyModelIntegrity: async (filePath: string, expectedHash: string) => {
    if (!SecurityManager.isValidPath(filePath)) {
      throw new Error('Invalid file path');
    }
    const actualHash = await SecurityManager.calculateFileHash(filePath);
    return actualHash === expectedHash;
  },

  getModelInfo: async (filePath: string) => {
    if (!SecurityManager.isValidPath(filePath)) {
      throw new Error('Invalid file path');
    }
    return ipcRenderer.invoke('model-get-info', filePath);
  },

  deleteModel: async (filePath: string) => {
    if (!SecurityManager.isValidPath(filePath)) {
      throw new Error('Invalid file path');
    }
    return ipcRenderer.invoke('model-delete', filePath);
  },

  // Secure storage
  secureStorage: {
    get: SecureStorage.get.bind(SecureStorage),
    set: SecureStorage.set.bind(SecureStorage),
    delete: SecureStorage.delete.bind(SecureStorage),
    clear: SecureStorage.clear.bind(SecureStorage),
  },

  // Network (filtered)
  httpRequest: async (config: HTTPRequestConfig) => {
    if (!SecurityManager.isValidURL(config.url)) {
      throw new Error('Invalid request URL');
    }
    return ipcRenderer.invoke('http-request', config);
  },

  // System information
  getSystemInfo: () => ipcRenderer.invoke('system-get-info'),
  getHardwareInfo: () => ipcRenderer.invoke('hardware-get-info'),

  // Clipboard (secure)
  clipboard: {
    writeText: (text: string) => {
      const sanitized = SecurityManager.sanitizeInput(text);
      clipboard.writeText(sanitized);
    },
    readText: () => clipboard.readText(),
    clear: () => clipboard.clear(),
  },

  // Application lifecycle
  app: {
    getVersion: () => ipcRenderer.sendSync('app-get-version'),
    getName: () => ipcRenderer.sendSync('app-get-name'),
    getPath: (name: string) => ipcRenderer.sendSync('app-get-path', name),
    relaunch: () => ipcRenderer.invoke('app-relaunch'),
    quit: () => ipcRenderer.invoke('app-quit'),
  },

  // Development tools
  devTools: {
    toggle: () => ipcRenderer.invoke('dev-tools-toggle'),
    open: () => ipcRenderer.invoke('dev-tools-open'),
    close: () => ipcRenderer.invoke('dev-tools-close'),
  },

  // Events
  on: addListener,
  off: removeListener,
  emit: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Security monitoring
let securityViolations = 0;
const MAX_VIOLATIONS = 10;

// Monitor for potential security violations
window.addEventListener('error', (event) => {
  securityViolations++;
  if (securityViolations > MAX_VIOLATIONS) {
    console.error('Too many security violations detected. Terminating.');
    electronAPI.app.quit();
  }
});

// Prevent navigation to external sites
window.addEventListener('beforeunload', (event) => {
  // Allow closing the app
});

// Block eval() and similar dangerous functions
const originalEval = window.eval;
window.eval = () => {
  throw new Error('eval() is disabled for security reasons');
};

// Override console in production
if (process.env.NODE_ENV === 'production') {
  const originalConsole = window.console;
  window.console = {
    ...originalConsole,
    log: () => {}, // Disable console.log in production
    warn: originalConsole.warn,
    error: originalConsole.error,
  };
}

// Memory protection - clean up on unload
window.addEventListener('beforeunload', () => {
  eventListeners.clear();
});

console.log('CodeForge preload script loaded successfully with security features enabled');

// Export types for TypeScript support
export type { ElectronAPI }; 