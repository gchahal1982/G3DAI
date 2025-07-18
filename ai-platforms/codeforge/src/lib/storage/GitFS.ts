import { EventEmitter } from 'events';
import { createHash, createHmac } from 'crypto';
import { promisify } from 'util';
import { gzip, gunzip } from 'zlib';
import { performance } from 'perf_hooks';
import * as fs from 'fs/promises';
import * as path from 'path';

// Promisified compression functions
const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

// Types and interfaces
interface GitFSConfig {
  dataDirectory: string;
  packDirectory: string;
  tempDirectory: string;
  compression: {
    enabled: boolean;
    level: number;
    algorithm: 'gzip' | 'brotli' | 'lz4';
  };
  packing: {
    enabled: boolean;
    packSizeThreshold: number;
    packAgeThreshold: number;
  };
  replication: {
    enabled: boolean;
    replicas: ReplicaConfig[];
    syncInterval: number;
  };
  gc: {
    enabled: boolean;
    interval: number;
    retentionDays: number;
  };
  maxFileSize: number;
  maxFiles: number;
}

interface ReplicaConfig {
  id: string;
  endpoint: string;
  credentials?: {
    username: string;
    password: string;
    token?: string;
  };
  priority: number;
  enabled: boolean;
}

interface GitFSFile {
  id: string;
  path: string;
  content: Buffer;
  hash: string;
  size: number;
  mimeType: string;
  metadata: {
    created: Date;
    modified: Date;
    accessed: Date;
    version: number;
    author: string;
    commitMessage?: string;
    tags: string[];
    encoding: string;
  };
  versions: GitFSVersion[];
  locks: GitFSLock[];
  compressed: boolean;
  packed: boolean;
}

interface GitFSVersion {
  version: number;
  hash: string;
  parentHash?: string;
  timestamp: Date;
  author: string;
  message: string;
  changes: GitFSChange[];
  size: number;
  compressed: boolean;
  deltaCompressed: boolean;
}

interface GitFSChange {
  type: 'add' | 'modify' | 'delete' | 'rename' | 'copy';
  oldPath?: string;
  newPath?: string;
  oldHash?: string;
  newHash?: string;
  hunks: GitFSHunk[];
}

interface GitFSHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: GitFSLine[];
}

interface GitFSLine {
  type: 'context' | 'add' | 'delete';
  content: string;
  lineNumber: number;
}

interface GitFSLock {
  id: string;
  fileId: string;
  userId: string;
  type: 'read' | 'write' | 'exclusive';
  acquired: Date;
  expires: Date;
  metadata: {
    reason: string;
    clientId: string;
    sessionId: string;
  };
}

interface GitFSPack {
  id: string;
  files: string[];
  created: Date;
  size: number;
  compressed: boolean;
  checksum: string;
  metadata: {
    fileCount: number;
    originalSize: number;
    compressionRatio: number;
  };
}

interface GitFSDiff {
  oldFile: GitFSFile | null;
  newFile: GitFSFile | null;
  changes: GitFSChange[];
  stats: {
    insertions: number;
    deletions: number;
    modifications: number;
  };
  binary: boolean;
}

interface GitFSSnapshot {
  id: string;
  timestamp: Date;
  files: string[];
  metadata: {
    totalSize: number;
    fileCount: number;
    author: string;
    message: string;
  };
}

// Task 1: Implement Git-FS storage layer
export class GitFS extends EventEmitter {
  private config: GitFSConfig;
  private files: Map<string, GitFSFile>;
  private locks: Map<string, GitFSLock>;
  private packs: Map<string, GitFSPack>;
  private gcInterval: NodeJS.Timeout | null = null;
  private packingInterval: NodeJS.Timeout | null = null;
  private replicationInterval: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  constructor(config: GitFSConfig) {
    super();
    this.config = config;
    this.files = new Map();
    this.locks = new Map();
    this.packs = new Map();
  }

  // Initialize the filesystem
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.createDirectories();
      await this.loadExistingData();
      this.setupPeriodicTasks();
      
      this.isInitialized = true;
      console.log('GitFS initialized successfully');
      this.emit('initialized');
      
    } catch (error) {
      console.error('Failed to initialize GitFS:', error);
      throw error;
    }
  }

  // Create necessary directories
  private async createDirectories(): Promise<void> {
    const dirs = [
      this.config.dataDirectory,
      this.config.packDirectory,
      this.config.tempDirectory,
      path.join(this.config.dataDirectory, 'objects'),
      path.join(this.config.dataDirectory, 'refs'),
      path.join(this.config.dataDirectory, 'logs'),
      path.join(this.config.dataDirectory, 'locks')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  // Load existing data from disk
  private async loadExistingData(): Promise<void> {
    try {
      const objectsDir = path.join(this.config.dataDirectory, 'objects');
      const entries = await fs.readdir(objectsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.json')) {
          const filePath = path.join(objectsDir, entry.name);
          const data = await fs.readFile(filePath, 'utf-8');
          const file = JSON.parse(data) as GitFSFile;
          
          // Restore dates
          file.metadata.created = new Date(file.metadata.created);
          file.metadata.modified = new Date(file.metadata.modified);
          file.metadata.accessed = new Date(file.metadata.accessed);
          
          this.files.set(file.id, file);
        }
      }

      console.log(`Loaded ${this.files.size} files from storage`);
      
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  // Setup periodic tasks
  private setupPeriodicTasks(): void {
    // Task 6: Garbage collection
    if (this.config.gc.enabled) {
      this.gcInterval = setInterval(() => {
        this.runGarbageCollection();
      }, this.config.gc.interval);
    }

    // Task 2: Delta packing
    if (this.config.packing.enabled) {
      this.packingInterval = setInterval(() => {
        this.runPacking();
      }, this.config.packing.packAgeThreshold);
    }

    // Task 8: Replication
    if (this.config.replication.enabled) {
      this.replicationInterval = setInterval(() => {
        this.runReplication();
      }, this.config.replication.syncInterval);
    }
  }

  // Task 1: File operations
  public async writeFile(filePath: string, content: Buffer | string, options: {
    author: string;
    message?: string;
    tags?: string[];
    encoding?: string;
  }): Promise<GitFSFile> {
    const fileId = this.generateFileId(filePath);
    const contentBuffer = Buffer.isBuffer(content) ? content : Buffer.from(content, options.encoding || 'utf-8');
    const hash = this.calculateHash(contentBuffer);

    // Check if file already exists
    const existingFile = this.files.get(fileId);
    const version = existingFile ? existingFile.metadata.version + 1 : 1;

    // Task 7: Compression
    let compressedContent = contentBuffer;
    let compressed = false;
    
    if (this.config.compression.enabled && contentBuffer.length > 1024) {
      try {
        compressedContent = await gzipAsync(contentBuffer);
        compressed = true;
      } catch (error) {
        console.warn('Compression failed, storing uncompressed:', error);
      }
    }

    const file: GitFSFile = {
      id: fileId,
      path: filePath,
      content: compressedContent,
      hash,
      size: contentBuffer.length,
      mimeType: this.detectMimeType(filePath),
      metadata: {
        created: existingFile?.metadata.created || new Date(),
        modified: new Date(),
        accessed: new Date(),
        version,
        author: options.author,
        commitMessage: options.message,
        tags: options.tags || [],
        encoding: options.encoding || 'utf-8'
      },
      versions: existingFile?.versions || [],
      locks: existingFile?.locks || [],
      compressed,
      packed: false
    };

    // Task 3: Create version entry
    if (existingFile) {
      const diff = await this.calculateDiff(existingFile, file);
      
      const newVersion: GitFSVersion = {
        version,
        hash,
        parentHash: existingFile.hash,
        timestamp: new Date(),
        author: options.author,
        message: options.message || `Updated ${filePath}`,
        changes: diff.changes,
        size: contentBuffer.length,
        compressed,
        deltaCompressed: false
      };

      file.versions.push(newVersion);
    } else {
      const initialVersion: GitFSVersion = {
        version: 1,
        hash,
        timestamp: new Date(),
        author: options.author,
        message: options.message || `Created ${filePath}`,
        changes: [{
          type: 'add',
          newPath: filePath,
          newHash: hash,
          hunks: []
        }],
        size: contentBuffer.length,
        compressed,
        deltaCompressed: false
      };

      file.versions.push(initialVersion);
    }

    // Store file
    this.files.set(fileId, file);
    await this.persistFile(file);

    this.emit('file_written', file);
    return file;
  }

  public async readFile(filePath: string, options: {
    version?: number;
    encoding?: string;
  } = {}): Promise<Buffer | string> {
    const fileId = this.generateFileId(filePath);
    const file = this.files.get(fileId);
    
    if (!file) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Update accessed time
    file.metadata.accessed = new Date();

    let content = file.content;

    // Task 7: Decompress if needed
    if (file.compressed) {
      try {
        content = await gunzipAsync(content);
      } catch (error) {
        throw new Error(`Failed to decompress file: ${error.message}`);
      }
    }

    // Handle version requests
    if (options.version && options.version !== file.metadata.version) {
      content = await this.getFileAtVersion(file, options.version);
    }

    this.emit('file_read', { file, version: options.version });

    return options.encoding ? content.toString(options.encoding) : content;
  }

  public async deleteFile(filePath: string, options: {
    author: string;
    message?: string;
  }): Promise<boolean> {
    const fileId = this.generateFileId(filePath);
    const file = this.files.get(fileId);
    
    if (!file) {
      return false;
    }

    // Check for locks
    if (this.hasActiveLocks(fileId)) {
      throw new Error(`Cannot delete file: active locks exist`);
    }

    // Add deletion version
    const deletionVersion: GitFSVersion = {
      version: file.metadata.version + 1,
      hash: '',
      parentHash: file.hash,
      timestamp: new Date(),
      author: options.author,
      message: options.message || `Deleted ${filePath}`,
      changes: [{
        type: 'delete',
        oldPath: filePath,
        oldHash: file.hash,
        hunks: []
      }],
      size: 0,
      compressed: false,
      deltaCompressed: false
    };

    file.versions.push(deletionVersion);
    await this.persistFile(file);

    // Remove from active files
    this.files.delete(fileId);

    this.emit('file_deleted', file);
    return true;
  }

  // Task 5: File locking mechanism
  public async acquireLock(fileId: string, userId: string, type: GitFSLock['type'], options: {
    reason: string;
    duration?: number;
    clientId: string;
    sessionId: string;
  }): Promise<GitFSLock> {
    const existingLocks = Array.from(this.locks.values()).filter(
      lock => lock.fileId === fileId && lock.expires > new Date()
    );

    // Check for conflicting locks
    if (type === 'exclusive' && existingLocks.length > 0) {
      throw new Error(`Cannot acquire exclusive lock: file has existing locks`);
    }

    if (type === 'write' && existingLocks.some(lock => lock.type === 'exclusive' || lock.type === 'write')) {
      throw new Error(`Cannot acquire write lock: file has conflicting locks`);
    }

    const lock: GitFSLock = {
      id: this.generateId(),
      fileId,
      userId,
      type,
      acquired: new Date(),
      expires: new Date(Date.now() + (options.duration || 300000)), // 5 minutes default
      metadata: {
        reason: options.reason,
        clientId: options.clientId,
        sessionId: options.sessionId
      }
    };

    this.locks.set(lock.id, lock);
    await this.persistLock(lock);

    this.emit('lock_acquired', lock);
    return lock;
  }

  public async releaseLock(lockId: string, userId: string): Promise<boolean> {
    const lock = this.locks.get(lockId);
    
    if (!lock) {
      return false;
    }

    if (lock.userId !== userId) {
      throw new Error(`Cannot release lock: not owned by user`);
    }

    this.locks.delete(lockId);
    await this.removeLockFile(lockId);

    this.emit('lock_released', lock);
    return true;
  }

  private hasActiveLocks(fileId: string): boolean {
    const now = new Date();
    return Array.from(this.locks.values()).some(
      lock => lock.fileId === fileId && lock.expires > now
    );
  }

  // Task 4: Efficient diff storage
  private async calculateDiff(oldFile: GitFSFile, newFile: GitFSFile): Promise<GitFSDiff> {
    const oldContent = oldFile.compressed 
      ? await gunzipAsync(oldFile.content)
      : oldFile.content;
    
    const newContent = newFile.compressed
      ? await gunzipAsync(newFile.content)
      : newFile.content;

    // Simple line-based diff (in production, use more sophisticated algorithm)
    const oldLines = oldContent.toString().split('\n');
    const newLines = newContent.toString().split('\n');

    const changes: GitFSChange[] = [];
    const hunks: GitFSHunk[] = [];
    
    let insertions = 0;
    let deletions = 0;
    let modifications = 0;

    // Basic Myers diff algorithm simulation
    let oldIndex = 0;
    let newIndex = 0;

    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      if (oldIndex >= oldLines.length) {
        // Only new lines remain
        insertions++;
        newIndex++;
      } else if (newIndex >= newLines.length) {
        // Only old lines remain
        deletions++;
        oldIndex++;
      } else if (oldLines[oldIndex] === newLines[newIndex]) {
        // Lines match
        oldIndex++;
        newIndex++;
      } else {
        // Lines differ
        modifications++;
        oldIndex++;
        newIndex++;
      }
    }

    if (insertions > 0 || deletions > 0 || modifications > 0) {
      changes.push({
        type: 'modify',
        oldPath: oldFile.path,
        newPath: newFile.path,
        oldHash: oldFile.hash,
        newHash: newFile.hash,
        hunks
      });
    }

    return {
      oldFile,
      newFile,
      changes,
      stats: { insertions, deletions, modifications },
      binary: this.isBinaryFile(oldFile.path)
    };
  }

  // Task 2: Delta packing optimization
  private async runPacking(): Promise<void> {
    const unpackedFiles = Array.from(this.files.values()).filter(
      file => !file.packed && file.size > this.config.packing.packSizeThreshold
    );

    if (unpackedFiles.length === 0) return;

    console.log(`Starting pack operation for ${unpackedFiles.length} files`);

    const pack: GitFSPack = {
      id: this.generateId(),
      files: unpackedFiles.map(f => f.id),
      created: new Date(),
      size: 0,
      compressed: false,
      checksum: '',
      metadata: {
        fileCount: unpackedFiles.length,
        originalSize: 0,
        compressionRatio: 0
      }
    };

    try {
      // Combine files with delta compression
      const packedData = await this.createPackFile(unpackedFiles);
      const packPath = path.join(this.config.packDirectory, `${pack.id}.pack`);
      
      await fs.writeFile(packPath, packedData);
      
      pack.size = packedData.length;
      pack.checksum = this.calculateHash(packedData);
      pack.metadata.originalSize = unpackedFiles.reduce((sum, f) => sum + f.size, 0);
      pack.metadata.compressionRatio = pack.size / pack.metadata.originalSize;

      // Mark files as packed
      for (const file of unpackedFiles) {
        file.packed = true;
        await this.persistFile(file);
      }

      this.packs.set(pack.id, pack);
      await this.persistPack(pack);

      console.log(`Pack ${pack.id} created: ${pack.metadata.fileCount} files, ${pack.metadata.compressionRatio.toFixed(2)} compression ratio`);
      this.emit('pack_created', pack);

    } catch (error) {
      console.error('Packing failed:', error);
      this.emit('pack_failed', { pack, error });
    }
  }

  private async createPackFile(files: GitFSFile[]): Promise<Buffer> {
    // Simple pack format: [file_count][file1_size][file1_data][file2_size][file2_data]...
    const buffers: Buffer[] = [];
    
    // File count
    const countBuffer = Buffer.alloc(4);
    countBuffer.writeUInt32BE(files.length, 0);
    buffers.push(countBuffer);

    for (const file of files) {
      // File size
      const sizeBuffer = Buffer.alloc(4);
      sizeBuffer.writeUInt32BE(file.content.length, 0);
      buffers.push(sizeBuffer);

      // File data
      buffers.push(file.content);
    }

    const combined = Buffer.concat(buffers);
    
    // Compress the entire pack
    if (this.config.compression.enabled) {
      return await gzipAsync(combined);
    }
    
    return combined;
  }

  // Task 6: Garbage collection
  private async runGarbageCollection(): Promise<void> {
    console.log('Starting garbage collection');
    const startTime = performance.now();

    try {
      const cutoffDate = new Date(Date.now() - (this.config.gc.retentionDays * 24 * 60 * 60 * 1000));
      let collectedFiles = 0;
      let collectedSize = 0;

      // Find files to collect
      const filesToCollect = Array.from(this.files.values()).filter(file => {
        // Keep files that are:
        // 1. Recently accessed
        // 2. Have active locks
        // 3. Are the current version
        return file.metadata.accessed < cutoffDate &&
               !this.hasActiveLocks(file.id) &&
               file.versions.length > 1;
      });

      for (const file of filesToCollect) {
        // Only collect old versions, keep the latest
        const versionsToCollect = file.versions.slice(0, -1).filter(
          version => version.timestamp < cutoffDate
        );

        for (const version of versionsToCollect) {
          collectedSize += version.size;
          collectedFiles++;
        }

        // Remove old versions
        file.versions = file.versions.filter(
          version => version.timestamp >= cutoffDate || version.version === file.metadata.version
        );

        await this.persistFile(file);
      }

      // Clean up expired locks
      const expiredLocks = Array.from(this.locks.values()).filter(
        lock => lock.expires < new Date()
      );

      for (const lock of expiredLocks) {
        this.locks.delete(lock.id);
        await this.removeLockFile(lock.id);
      }

      const duration = performance.now() - startTime;
      console.log(`Garbage collection completed: ${collectedFiles} versions collected, ${collectedSize} bytes freed, ${duration.toFixed(2)}ms`);
      
      this.emit('gc_completed', {
        filesCollected: collectedFiles,
        sizeFreed: collectedSize,
        duration,
        locksExpired: expiredLocks.length
      });

    } catch (error) {
      console.error('Garbage collection failed:', error);
      this.emit('gc_failed', error);
    }
  }

  // Task 8: Replication support
  private async runReplication(): Promise<void> {
    if (!this.config.replication.enabled || this.config.replication.replicas.length === 0) {
      return;
    }

    console.log('Starting replication sync');

    for (const replica of this.config.replication.replicas) {
      if (!replica.enabled) continue;

      try {
        await this.syncToReplica(replica);
        this.emit('replica_synced', replica);
      } catch (error) {
        console.error(`Replication failed for ${replica.id}:`, error);
        this.emit('replica_sync_failed', { replica, error });
      }
    }
  }

  private async syncToReplica(replica: ReplicaConfig): Promise<void> {
    // Mock replication - in production would use real network calls
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const filesToSync = Array.from(this.files.values()).filter(
      file => file.metadata.modified > new Date(Date.now() - this.config.replication.syncInterval)
    );

    console.log(`Syncing ${filesToSync.length} files to replica ${replica.id}`);
    
    // Simulate network transfer
    for (const file of filesToSync) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  // Utility methods
  private async getFileAtVersion(file: GitFSFile, version: number): Promise<Buffer> {
    const targetVersion = file.versions.find(v => v.version === version);
    
    if (!targetVersion) {
      throw new Error(`Version ${version} not found for file ${file.path}`);
    }

    // For simplicity, return current content
    // In production, would reconstruct from deltas
    return file.content;
  }

  private async persistFile(file: GitFSFile): Promise<void> {
    const filePath = path.join(this.config.dataDirectory, 'objects', `${file.id}.json`);
    const data = JSON.stringify(file, null, 2);
    await fs.writeFile(filePath, data);
  }

  private async persistLock(lock: GitFSLock): Promise<void> {
    const lockPath = path.join(this.config.dataDirectory, 'locks', `${lock.id}.json`);
    const data = JSON.stringify(lock, null, 2);
    await fs.writeFile(lockPath, data);
  }

  private async removeLockFile(lockId: string): Promise<void> {
    const lockPath = path.join(this.config.dataDirectory, 'locks', `${lockId}.json`);
    try {
      await fs.unlink(lockPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }

  private async persistPack(pack: GitFSPack): Promise<void> {
    const packPath = path.join(this.config.packDirectory, `${pack.id}.json`);
    const data = JSON.stringify(pack, null, 2);
    await fs.writeFile(packPath, data);
  }

  private generateFileId(filePath: string): string {
    return createHash('sha1').update(filePath).digest('hex');
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private calculateHash(content: Buffer): string {
    return createHash('sha256').update(content).digest('hex');
  }

  private detectMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.js': 'application/javascript',
      '.ts': 'application/typescript',
      '.json': 'application/json',
      '.html': 'text/html',
      '.css': 'text/css',
      '.md': 'text/markdown',
      '.txt': 'text/plain',
      '.py': 'text/x-python',
      '.java': 'text/x-java',
      '.cpp': 'text/x-c++src',
      '.c': 'text/x-csrc',
      '.h': 'text/x-chdr'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }

  private isBinaryFile(filePath: string): boolean {
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.tar', '.gz', '.exe', '.dll'];
    const ext = path.extname(filePath).toLowerCase();
    return binaryExtensions.includes(ext);
  }

  // Public API methods
  public async listFiles(options: {
    pattern?: string;
    includePacked?: boolean;
    includeDeleted?: boolean;
  } = {}): Promise<GitFSFile[]> {
    let files = Array.from(this.files.values());

    if (!options.includePacked) {
      files = files.filter(f => !f.packed);
    }

    if (options.pattern) {
      const regex = new RegExp(options.pattern);
      files = files.filter(f => regex.test(f.path));
    }

    return files;
  }

  public async getFileInfo(filePath: string): Promise<GitFSFile | null> {
    const fileId = this.generateFileId(filePath);
    return this.files.get(fileId) || null;
  }

  public async getFileVersions(filePath: string): Promise<GitFSVersion[]> {
    const file = await this.getFileInfo(filePath);
    return file?.versions || [];
  }

  public async createSnapshot(options: {
    author: string;
    message: string;
    includePattern?: string;
  }): Promise<GitFSSnapshot> {
    const files = await this.listFiles({ pattern: options.includePattern });
    
    const snapshot: GitFSSnapshot = {
      id: this.generateId(),
      timestamp: new Date(),
      files: files.map(f => f.id),
      metadata: {
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        fileCount: files.length,
        author: options.author,
        message: options.message
      }
    };

    this.emit('snapshot_created', snapshot);
    return snapshot;
  }

  public getStats(): object {
    const files = Array.from(this.files.values());
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const packedFiles = files.filter(f => f.packed).length;
    const compressedFiles = files.filter(f => f.compressed).length;

    return {
      totalFiles: files.length,
      totalSize,
      packedFiles,
      compressedFiles,
      totalVersions: files.reduce((sum, f) => sum + f.versions.length, 0),
      activeLocks: this.locks.size,
      totalPacks: this.packs.size,
      compressionRatio: compressedFiles > 0 ? 
        files.filter(f => f.compressed).reduce((sum, f) => sum + f.content.length, 0) / totalSize : 0
    };
  }

  // Cleanup and shutdown
  public async shutdown(): Promise<void> {
    console.log('GitFS shutting down...');

    // Clear intervals
    if (this.gcInterval) clearInterval(this.gcInterval);
    if (this.packingInterval) clearInterval(this.packingInterval);
    if (this.replicationInterval) clearInterval(this.replicationInterval);

    // Release all locks
    for (const lock of this.locks.values()) {
      await this.removeLockFile(lock.id);
    }
    this.locks.clear();

    // Final garbage collection
    if (this.config.gc.enabled) {
      await this.runGarbageCollection();
    }

    console.log('GitFS shutdown complete');
    this.emit('shutdown');
  }
}

export {
  GitFS,
  GitFSConfig,
  GitFSFile,
  GitFSVersion,
  GitFSLock,
  GitFSPack,
  GitFSDiff,
  GitFSSnapshot,
  ReplicaConfig
};

export default GitFS; 