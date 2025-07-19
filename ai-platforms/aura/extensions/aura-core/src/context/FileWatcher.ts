/**
 * FileWatcher.ts - Cross-platform file system watcher for Aura
 * 
 * Implements real-time file change detection for dynamic context persistence:
 * - Cross-platform FS watchers with native `chokidar` + FSEvents fallback
 * - Debounced events (< 10ms processing target)
 * - Intelligent filtering for code files vs noise
 * - Batch processing for high-frequency changes
 * - Memory-efficient event queuing
 */

import { EventEmitter } from 'events';
import { watch, FSWatcher } from 'chokidar';
import path from 'path';
import { promises as fs } from 'fs';
import type { Stats } from 'fs';

export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
  stats?: Stats;
  timestamp: number;
  size?: number;
  isDirectory: boolean;
}

export interface WatcherConfig {
  debounceMs: number;
  batchSize: number;
  maxQueueSize: number;
  ignored: (string | RegExp)[];
  followSymlinks: boolean;
  ignoreInitial: boolean;
  usePolling: boolean;
  pollInterval: number;
  enableBinaryDetection: boolean;
  maxFileSize: number; // bytes
}

export interface WatcherStats {
  eventsProcessed: number;
  eventsQueued: number;
  averageProcessingTime: number;
  lastEventTime: number;
  watchedPaths: number;
  filteredEvents: number;
}

export class FileWatcher extends EventEmitter {
  private watchers: Map<string, FSWatcher> = new Map();
  private eventQueue: FileChangeEvent[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private config: WatcherConfig;
  private stats: WatcherStats;
  private processingTimes: number[] = [];

  constructor(config: Partial<WatcherConfig> = {}) {
    super();
    
    this.config = {
      debounceMs: 50, // 50ms debounce for batching
      batchSize: 100,
      maxQueueSize: 1000,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
        '**/.nyc_output/**',
        '**/tmp/**',
        '**/temp/**',
        '**/*.log',
        '**/*.tmp',
        '**/*.temp',
        '**/models/**', // Ignore model files
        '**/.DS_Store',
        '**/Thumbs.db'
      ],
      followSymlinks: false,
      ignoreInitial: true,
      usePolling: false,
      pollInterval: 1000,
      enableBinaryDetection: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB max file size
      ...config
    };

    this.stats = {
      eventsProcessed: 0,
      eventsQueued: 0,
      averageProcessingTime: 0,
      lastEventTime: 0,
      watchedPaths: 0,
      filteredEvents: 0
    };

    this.setupProcessingLoop();
  }

  /**
   * Start watching a directory or file
   */
  async watchPath(watchPath: string, recursive = true): Promise<void> {
    if (this.watchers.has(watchPath)) {
      throw new Error(`Path ${watchPath} is already being watched`);
    }

    try {
      // Verify path exists
      await fs.access(watchPath);
      
      const watchOptions: any = {
        ignored: this.config.ignored,
        persistent: true,
        ignoreInitial: this.config.ignoreInitial,
        followSymlinks: this.config.followSymlinks,
        usePolling: this.config.usePolling,
        interval: this.config.pollInterval,
        binaryInterval: this.config.pollInterval * 2,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 50
        }
      };

      if (!recursive) {
        watchOptions.depth = 0;
      }

      const watcher = watch(watchPath, watchOptions);

      // Set up event handlers
      this.setupWatcherEvents(watcher, watchPath);
      
      this.watchers.set(watchPath, watcher);
      this.stats.watchedPaths++;

      await new Promise((resolve, reject) => {
        watcher.on('ready', resolve);
        watcher.on('error', reject);
      });

      this.emit('watcher:started', watchPath);
      
    } catch (error) {
      throw new Error(`Failed to watch path ${watchPath}: ${error}`);
    }
  }

  /**
   * Stop watching a specific path
   */
  async unwatchPath(watchPath: string): Promise<void> {
    const watcher = this.watchers.get(watchPath);
    if (!watcher) {
      throw new Error(`Path ${watchPath} is not being watched`);
    }

    await watcher.close();
    this.watchers.delete(watchPath);
    this.stats.watchedPaths--;

    this.emit('watcher:stopped', watchPath);
  }

  /**
   * Stop all watchers
   */
  async stopAll(): Promise<void> {
    const promises = Array.from(this.watchers.keys()).map(path => this.unwatchPath(path));
    await Promise.all(promises);
  }

  /**
   * Setup event handlers for a watcher
   */
  private setupWatcherEvents(watcher: FSWatcher, watchPath: string): void {
    watcher.on('add', (filePath, stats) => {
      const event: FileChangeEvent = {
        type: 'add',
        path: filePath,
        timestamp: Date.now(),
        isDirectory: false
      };
      if (stats) {
        event.stats = stats;
        event.size = stats.size;
      }
      this.queueEvent(event);
    });

    watcher.on('change', (filePath, stats) => {
      const event: FileChangeEvent = {
        type: 'change',
        path: filePath,
        timestamp: Date.now(),
        isDirectory: false
      };
      if (stats) {
        event.stats = stats;
        event.size = stats.size;
      }
      this.queueEvent(event);
    });

    watcher.on('unlink', (filePath) => {
      this.queueEvent({
        type: 'unlink',
        path: filePath,
        timestamp: Date.now(),
        isDirectory: false
      });
    });

    watcher.on('addDir', (dirPath, stats) => {
      const event: FileChangeEvent = {
        type: 'addDir',
        path: dirPath,
        timestamp: Date.now(),
        isDirectory: true
      };
      if (stats) {
        event.stats = stats;
      }
      this.queueEvent(event);
    });

    watcher.on('unlinkDir', (dirPath) => {
      this.queueEvent({
        type: 'unlinkDir',
        path: dirPath,
        timestamp: Date.now(),
        isDirectory: true
      });
    });

    watcher.on('error', (error) => {
      this.emit('watcher:error', watchPath, error);
    });
  }

  /**
   * Queue file change event for processing
   */
  private queueEvent(event: FileChangeEvent): void {
    // Filter out events we don't care about
    if (!this.shouldProcessEvent(event)) {
      this.stats.filteredEvents++;
      return;
    }

    // Prevent queue overflow
    if (this.eventQueue.length >= this.config.maxQueueSize) {
      // Remove oldest events to make room
      this.eventQueue.splice(0, this.config.batchSize);
      this.emit('queue:overflow', this.eventQueue.length);
    }

    this.eventQueue.push(event);
    this.stats.eventsQueued++;
    this.stats.lastEventTime = event.timestamp;

    // Trigger debounced processing
    this.scheduleProcessing();
  }

  /**
   * Determine if event should be processed
   */
  private shouldProcessEvent(event: FileChangeEvent): boolean {
    const filePath = event.path;
    
    // Skip directories for most events
    if (event.isDirectory && event.type !== 'addDir' && event.type !== 'unlinkDir') {
      return false;
    }

    // Check file size limit
    if (event.size && event.size > this.config.maxFileSize) {
      return false;
    }

    // Only process code and config files
    if (!event.isDirectory && !this.isCodeFile(filePath)) {
      return false;
    }

    // Check for binary files if detection is enabled
    if (this.config.enableBinaryDetection && !event.isDirectory) {
      if (this.isBinaryFile(filePath)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if file is a code file we care about
   */
  private isCodeFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    
    const codeExtensions = new Set([
      // Programming languages
      '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
      '.py', '.pyx', '.pyi', '.ipynb',
      '.java', '.kt', '.scala', '.groovy',
      '.cs', '.fs', '.vb',
      '.cpp', '.cc', '.cxx', '.c', '.h', '.hpp', '.hxx',
      '.rs', '.go', '.zig', '.nim', '.cr',
      '.rb', '.php', '.swift', '.m', '.mm',
      '.dart', '.elm', '.clj', '.cljs', '.cljc',
      '.hs', '.lhs', '.purs', '.ml', '.mli',
      '.lua', '.pl', '.pm', '.r', '.R', '.jl',
      '.sh', '.bash', '.zsh', '.fish', '.ps1',
      
      // Web technologies
      '.html', '.htm', '.xml', '.svg',
      '.css', '.scss', '.sass', '.less', '.styl',
      '.json', '.jsonc', '.json5', '.yaml', '.yml', '.toml',
      
      // Config and documentation
      '.md', '.mdx', '.rst', '.txt', '.adoc',
      '.dockerfile', '.dockerignore',
      '.gitignore', '.gitattributes',
      '.editorconfig', '.prettierrc', '.eslintrc',
      '.tsconfig', '.jsconfig', '.babelrc',
      '.package', '.lock', '.gradle', '.pom',
      '.cargo', '.mix', '.gemfile', '.podfile',
      
      // Database and data
      '.sql', '.prisma', '.gql', '.graphql',
      '.proto', '.avsc', '.thrift'
    ]);

    return codeExtensions.has(ext) || this.isConfigFile(filePath);
  }

  /**
   * Check if file is a configuration file
   */
  private isConfigFile(filePath: string): boolean {
    const basename = path.basename(filePath).toLowerCase();
    
    const configFiles = new Set([
      'makefile', 'dockerfile', 'vagrantfile', 'rakefile',
      'package.json', 'composer.json', 'cargo.toml', 'mix.exs',
      'requirements.txt', 'setup.py', 'pyproject.toml',
      'pom.xml', 'build.gradle', 'build.sbt',
      '.env', '.env.local', '.env.development', '.env.production',
      'config.js', 'config.ts', 'webpack.config.js', 'vite.config.js'
    ]);

    return configFiles.has(basename);
  }

  /**
   * Simple binary file detection
   */
  private isBinaryFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    
    const binaryExtensions = new Set([
      '.exe', '.dll', '.so', '.dylib', '.a', '.lib',
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.ico',
      '.mp3', '.mp4', '.wav', '.flac', '.ogg', '.webm', '.avi',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.zip', '.tar', '.gz', '.bz2', '.xz', '.rar', '.7z',
      '.ttf', '.otf', '.woff', '.woff2', '.eot',
      '.bin', '.dat', '.db', '.sqlite', '.sqlite3'
    ]);

    return binaryExtensions.has(ext);
  }

  /**
   * Schedule debounced processing
   */
  private scheduleProcessing(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processEventQueue();
    }, this.config.debounceMs);
  }

  /**
   * Setup the main processing loop
   */
  private setupProcessingLoop(): void {
    // Process events every 100ms regardless of debouncing
    // This ensures we don't get too far behind during high-frequency changes
    setInterval(() => {
      if (this.eventQueue.length > 0 && !this.isProcessing) {
        this.processEventQueue();
      }
    }, 100);
  }

  /**
   * Process queued events in batches
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const startTime = performance.now();

    try {
      // Process events in batches
      while (this.eventQueue.length > 0) {
        const batch = this.eventQueue.splice(0, this.config.batchSize);
        
        // Group events by type for efficient processing
        const groupedEvents = this.groupEventsByType(batch);
        
        // Emit grouped events
        for (const [eventType, events] of groupedEvents) {
          if (events.length > 0) {
            this.emit(`files:${eventType}`, events);
            this.stats.eventsProcessed += events.length;
          }
        }

        // Emit all events for general listeners
        this.emit('files:batch', batch);

        // Small delay to prevent blocking the event loop
        if (this.eventQueue.length > 0) {
          await new Promise(resolve => setImmediate(resolve));
        }
      }

      const processingTime = performance.now() - startTime;
      this.updateProcessingStats(processingTime);

      this.emit('processing:completed', {
        processingTime,
        eventsProcessed: this.stats.eventsProcessed
      });

    } catch (error) {
      this.emit('processing:error', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Group events by type for efficient processing
   */
  private groupEventsByType(events: FileChangeEvent[]): Map<string, FileChangeEvent[]> {
    const grouped = new Map<string, FileChangeEvent[]>();

    for (const event of events) {
      if (!grouped.has(event.type)) {
        grouped.set(event.type, []);
      }
      grouped.get(event.type)!.push(event);
    }

    return grouped;
  }

  /**
   * Update processing time statistics
   */
  private updateProcessingStats(processingTime: number): void {
    this.processingTimes.push(processingTime);
    
    // Keep only last 100 measurements
    if (this.processingTimes.length > 100) {
      this.processingTimes.shift();
    }

    this.stats.averageProcessingTime = 
      this.processingTimes.reduce((sum, time) => sum + time, 0) / this.processingTimes.length;
  }

  /**
   * Get current watcher statistics
   */
  getStats(): WatcherStats {
    return { ...this.stats };
  }

  /**
   * Get watched paths
   */
  getWatchedPaths(): string[] {
    return Array.from(this.watchers.keys());
  }

  /**
   * Check if path is being watched
   */
  isWatching(watchPath: string): boolean {
    return this.watchers.has(watchPath);
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Flush queue immediately
   */
  async flush(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    await this.processEventQueue();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<WatcherConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config:updated', this.config);
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    await this.stopAll();
    this.eventQueue.length = 0;
    this.removeAllListeners();
  }
}

// Default instance
export const fileWatcher = new FileWatcher({
  debounceMs: 50,
  batchSize: 50,
  maxQueueSize: 500,
  ignoreInitial: true,
  usePolling: false
});

export default FileWatcher; 