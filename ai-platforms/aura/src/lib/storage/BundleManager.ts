/**
 * BundleManager - Intelligent Storage Management System
 * 
 * Comprehensive storage management for Aura model bundles:
 * - Efficient storage allocation with space optimization
 * - Model deduplication across bundles to save disk space
 * - Advanced compression optimization for large models
 * - Intelligent cleanup and garbage collection
 * - Real-time storage usage monitoring and alerts
 * - Backup and restore functionality for model collections
 * - Cross-device sync for user preferences and configurations
 * - Automatic cleanup of unused models based on usage patterns
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import * as path from 'path';
import { promises as fs } from 'fs';

export interface StorageInfo {
  total: number;
  used: number;
  available: number;
  percentage: number;
}

export interface ModelBundle {
  id: string;
  name: string;
  description: string;
  sizeGB: number;
  models: string[];
  installDate: number;
  lastUsed: number;
  usage: {
    totalSessions: number;
    totalTokens: number;
    averageLatency: number;
  };
  preferences: {
    autoUpdate: boolean;
    priority: number;
    retention: 'permanent' | 'temporary' | 'auto';
  };
  metadata: {
    version: string;
    checksum: string;
    dependencies: string[];
    tags: string[];
  };
}

export interface StorageConfig {
  basePath: string;
  maxSizeGB: number;
  compressionLevel: number;
  deduplicationEnabled: boolean;
  garbageCollectionInterval: number;
  backupEnabled: boolean;
  backupRetention: number;
  syncEnabled: boolean;
  alertThresholds: {
    warning: number;   // percentage
    critical: number;  // percentage
  };
}

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  ratio: number;
  algorithm: string;
  time: number;
}

export interface DeduplicationResult {
  duplicatesFound: number;
  spaceReclaimed: number;
  filesProcessed: number;
  time: number;
}

export interface CleanupResult {
  filesRemoved: number;
  spaceReclaimed: number;
  bundlesAffected: number;
  time: number;
}

export interface BackupInfo {
  id: string;
  timestamp: number;
  size: number;
  bundleIds: string[];
  checksum: string;
  encrypted: boolean;
}

export interface SyncConfig {
  deviceId: string;
  cloudProvider: 's3' | 'gcs' | 'azure' | 'custom';
  endpoint: string;
  credentials: {
    accessKey: string;
    secretKey: string;
    region?: string;
  };
  preferences: {
    autoSync: boolean;
    syncInterval: number;
    conflictResolution: 'local' | 'remote' | 'manual';
  };
}

export interface UsagePattern {
  modelId: string;
  frequency: number;
  lastAccess: number;
  averageSessionLength: number;
  performanceScore: number;
  userRating: number;
}

class BundleManager extends EventEmitter {
  private config: StorageConfig;
  private bundles: Map<string, ModelBundle> = new Map();
  private storageCache: Map<string, any> = new Map();
  private compressionEnabled: boolean = true;
  private deduplicationCache: Map<string, string> = new Map();
  private cleanupTimer?: NodeJS.Timeout;
  private monitoringTimer?: NodeJS.Timeout;
  private usagePatterns: Map<string, UsagePattern> = new Map();
  private backups: Map<string, BackupInfo> = new Map();
  private syncConfig?: SyncConfig;

  constructor(config: StorageConfig) {
    super();
    this.config = config;
    this.startMonitoring();
    this.startGarbageCollection();
  }

  /**
   * Initialize the bundle manager and load existing bundles
   */
  async initialize(): Promise<void> {
    try {
      await this.ensureDirectories();
      await this.loadBundles();
      await this.loadUsagePatterns();
      await this.loadBackupInfo();
      await this.validateStorage();
      
      this.emit('initialized', {
        bundleCount: this.bundles.size,
        storageUsed: await this.getStorageUsage(),
        config: this.config
      });
    } catch (error) {
      this.emit('error', {
        type: 'initialization_failed',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Allocate storage space efficiently for a new bundle
   */
  async allocateStorage(bundleId: string, sizeGB: number, priority: number = 5): Promise<boolean> {
    try {
      const availableSpace = await this.getAvailableSpace();
      const requiredBytes = sizeGB * 1024 * 1024 * 1024;

      if (availableSpace < requiredBytes) {
        // Try to free up space through cleanup
        const cleanupResult = await this.performCleanup(requiredBytes);
        if (cleanupResult.spaceReclaimed < requiredBytes) {
          this.emit('storage_full', {
            required: requiredBytes,
            available: availableSpace,
            spaceReclaimed: cleanupResult.spaceReclaimed
          });
          return false;
        }
      }

      // Create bundle directory
      const bundlePath = this.getBundlePath(bundleId);
      await fs.mkdir(bundlePath, { recursive: true });

      // Reserve space metadata
      await this.reserveSpace(bundleId, sizeGB, priority);

      this.emit('storage_allocated', {
        bundleId,
        sizeGB,
        path: bundlePath
      });

      return true;
    } catch (error) {
      this.emit('error', {
        type: 'storage_allocation_failed',
        bundleId,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Perform model deduplication across bundles
   */
  async deduplicateModels(): Promise<DeduplicationResult> {
    const startTime = Date.now();
    let duplicatesFound = 0;
    let spaceReclaimed = 0;
    let filesProcessed = 0;

    try {
      const fileHashes = new Map<string, string[]>();

      // Build hash map of all model files
      for (const [bundleId, bundle] of this.bundles) {
        const bundlePath = this.getBundlePath(bundleId);
        const files = await this.getAllFiles(bundlePath);

        for (const file of files) {
          const hash = await this.calculateFileHash(file);
          if (!fileHashes.has(hash)) {
            fileHashes.set(hash, []);
          }
          fileHashes.get(hash)!.push(file);
          filesProcessed++;
        }
      }

      // Find and deduplicate
      for (const [hash, files] of fileHashes) {
        if (files.length > 1) {
          // Keep the first file, create hard links for others
          const originalFile = files[0];
          const fileStats = await fs.stat(originalFile);

          for (let i = 1; i < files.length; i++) {
            const duplicateFile = files[i];
            const tempFile = `${duplicateFile}.tmp`;

            await fs.unlink(duplicateFile);
            await fs.link(originalFile, duplicateFile);

            duplicatesFound++;
            spaceReclaimed += fileStats.size;
          }
        }
      }

      const result: DeduplicationResult = {
        duplicatesFound,
        spaceReclaimed,
        filesProcessed,
        time: Date.now() - startTime
      };

      this.emit('deduplication_complete', result);
      return result;

    } catch (error) {
      this.emit('error', {
        type: 'deduplication_failed',
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        duplicatesFound: 0,
        spaceReclaimed: 0,
        filesProcessed: 0,
        time: Date.now() - startTime
      };
    }
  }

  /**
   * Optimize storage with compression
   */
  async optimizeCompression(bundleId?: string): Promise<CompressionStats> {
    const startTime = Date.now();
    let originalSize = 0;
    let compressedSize = 0;

    try {
      const bundlesToCompress = bundleId ? [bundleId] : Array.from(this.bundles.keys());

      for (const id of bundlesToCompress) {
        const bundlePath = this.getBundlePath(id);
        const files = await this.getAllFiles(bundlePath);

        for (const file of files) {
          if (!file.endsWith('.gz') && !file.endsWith('.br')) {
            const stats = await fs.stat(file);
            originalSize += stats.size;

            const compressed = await this.compressFile(file);
            compressedSize += compressed.size;
          }
        }
      }

      const result: CompressionStats = {
        originalSize,
        compressedSize,
        ratio: originalSize > 0 ? compressedSize / originalSize : 1,
        algorithm: 'brotli',
        time: Date.now() - startTime
      };

      this.emit('compression_complete', result);
      return result;

    } catch (error) {
      this.emit('error', {
        type: 'compression_failed',
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        originalSize: 0,
        compressedSize: 0,
        ratio: 1,
        algorithm: 'none',
        time: Date.now() - startTime
      };
    }
  }

  /**
   * Perform intelligent cleanup and garbage collection
   */
  async performCleanup(targetBytes?: number): Promise<CleanupResult> {
    const startTime = Date.now();
    let filesRemoved = 0;
    let spaceReclaimed = 0;
    let bundlesAffected = 0;

    try {
      // Get bundles sorted by cleanup priority (least used first)
      const bundlesPriority = this.getBundleCleanupPriority();

      for (const bundleId of bundlesPriority) {
        if (targetBytes && spaceReclaimed >= targetBytes) break;

        const bundle = this.bundles.get(bundleId);
        if (!bundle || bundle.preferences.retention === 'permanent') continue;

        const usage = this.usagePatterns.get(bundleId);
        const shouldCleanup = this.shouldCleanupBundle(bundle, usage);

        if (shouldCleanup) {
          const bundleSize = await this.getBundleSize(bundleId);
          await this.removeBundle(bundleId);
          
          filesRemoved += bundle.models.length;
          spaceReclaimed += bundleSize;
          bundlesAffected++;

          this.emit('bundle_cleaned', {
            bundleId,
            size: bundleSize,
            reason: this.getCleanupReason(bundle, usage)
          });
        }
      }

      // Clean temporary files
      await this.cleanTemporaryFiles();

      const result: CleanupResult = {
        filesRemoved,
        spaceReclaimed,
        bundlesAffected,
        time: Date.now() - startTime
      };

      this.emit('cleanup_complete', result);
      return result;

    } catch (error) {
      this.emit('error', {
        type: 'cleanup_failed',
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        filesRemoved: 0,
        spaceReclaimed: 0,
        bundlesAffected: 0,
        time: Date.now() - startTime
      };
    }
  }

  /**
   * Get current storage usage information
   */
  async getStorageUsage(): Promise<StorageInfo> {
    try {
      const stats = await fs.stat(this.config.basePath);
      const totalBytes = await this.getTotalAllocatedSpace();
      const usedBytes = await this.getUsedSpace();
      
      return {
        total: totalBytes,
        used: usedBytes,
        available: totalBytes - usedBytes,
        percentage: totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0
      };
    } catch (error) {
      this.emit('error', {
        type: 'storage_usage_failed',
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        total: 0,
        used: 0,
        available: 0,
        percentage: 0
      };
    }
  }

  /**
   * Create backup of specified bundles
   */
  async createBackup(bundleIds: string[], encrypted: boolean = true): Promise<string> {
    const backupId = crypto.randomUUID();
    const timestamp = Date.now();
    
    try {
      const backupPath = path.join(this.config.basePath, 'backups', `${backupId}.backup`);
      await fs.mkdir(path.dirname(backupPath), { recursive: true });

      let totalSize = 0;
      const bundleData: any = {};

      // Collect bundle data
      for (const bundleId of bundleIds) {
        const bundle = this.bundles.get(bundleId);
        if (bundle) {
          bundleData[bundleId] = bundle;
          totalSize += await this.getBundleSize(bundleId);
        }
      }

      // Create backup archive
      const backupData = {
        metadata: {
          id: backupId,
          timestamp,
          version: '1.0.0',
          encrypted
        },
        bundles: bundleData
      };

      let backupContent = JSON.stringify(backupData, null, 2);
      
      if (encrypted) {
        backupContent = await this.encryptData(backupContent);
      }

      await fs.writeFile(backupPath, backupContent);

      const backupInfo: BackupInfo = {
        id: backupId,
        timestamp,
        size: totalSize,
        bundleIds,
        checksum: await this.calculateStringHash(backupContent),
        encrypted
      };

      this.backups.set(backupId, backupInfo);
      await this.saveBackupInfo();

      this.emit('backup_created', backupInfo);
      return backupId;

    } catch (error) {
      this.emit('error', {
        type: 'backup_failed',
        backupId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Restore bundles from backup
   */
  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      const backupInfo = this.backups.get(backupId);
      if (!backupInfo) {
        throw new Error(`Backup ${backupId} not found`);
      }

      const backupPath = path.join(this.config.basePath, 'backups', `${backupId}.backup`);
      let backupContent = await fs.readFile(backupPath, 'utf-8');

      if (backupInfo.encrypted) {
        backupContent = await this.decryptData(backupContent);
      }

      const backupData = JSON.parse(backupContent);

      // Restore bundles
      for (const [bundleId, bundleData] of Object.entries(backupData.bundles)) {
        this.bundles.set(bundleId, bundleData as ModelBundle);
      }

      await this.saveBundles();

      this.emit('backup_restored', {
        backupId,
        bundleIds: Object.keys(backupData.bundles)
      });

      return true;

    } catch (error) {
      this.emit('error', {
        type: 'restore_failed',
        backupId,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Configure cross-device synchronization
   */
  async configureSyncSettings(config: SyncConfig): Promise<boolean> {
    try {
      this.syncConfig = config;
      await this.saveSyncConfig();

      if (config.preferences.autoSync) {
        await this.syncToCloud();
      }

      this.emit('sync_configured', config);
      return true;

    } catch (error) {
      this.emit('error', {
        type: 'sync_config_failed',
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Sync preferences and metadata to cloud
   */
  async syncToCloud(): Promise<boolean> {
    if (!this.syncConfig) return false;

    try {
      const syncData = {
        bundles: Array.from(this.bundles.values()).map(bundle => ({
          id: bundle.id,
          preferences: bundle.preferences,
          usage: bundle.usage,
          metadata: bundle.metadata
        })),
        usagePatterns: Array.from(this.usagePatterns.entries()),
        timestamp: Date.now()
      };

      // Upload to cloud provider (implementation depends on provider)
      await this.uploadToCloud(syncData);

      this.emit('sync_complete', {
        bundleCount: this.bundles.size,
        timestamp: Date.now()
      });

      return true;

    } catch (error) {
      this.emit('error', {
        type: 'sync_failed',
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  // Private helper methods

  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.config.basePath, { recursive: true });
    await fs.mkdir(path.join(this.config.basePath, 'bundles'), { recursive: true });
    await fs.mkdir(path.join(this.config.basePath, 'backups'), { recursive: true });
    await fs.mkdir(path.join(this.config.basePath, 'temp'), { recursive: true });
  }

  private getBundlePath(bundleId: string): string {
    return path.join(this.config.basePath, 'bundles', bundleId);
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  private async calculateStringHash(content: string): Promise<string> {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private getBundleCleanupPriority(): string[] {
    return Array.from(this.bundles.keys()).sort((a, b) => {
      const usageA = this.usagePatterns.get(a);
      const usageB = this.usagePatterns.get(b);
      const bundleA = this.bundles.get(a)!;
      const bundleB = this.bundles.get(b)!;

      // Calculate cleanup score (lower = cleanup first)
      const scoreA = this.calculateCleanupScore(bundleA, usageA);
      const scoreB = this.calculateCleanupScore(bundleB, usageB);

      return scoreA - scoreB;
    });
  }

  private calculateCleanupScore(bundle: ModelBundle, usage?: UsagePattern): number {
    let score = 100;

    // Reduce score based on usage
    if (usage) {
      score -= usage.frequency * 10;
      score -= usage.performanceScore;
      score -= usage.userRating * 5;
      
      const daysSinceLastAccess = (Date.now() - usage.lastAccess) / (24 * 60 * 60 * 1000);
      score += daysSinceLastAccess;
    }

    // Bundle preferences
    if (bundle.preferences.retention === 'permanent') score = 999;
    if (bundle.preferences.retention === 'temporary') score -= 50;
    score -= bundle.preferences.priority * 5;

    return Math.max(0, score);
  }

  private shouldCleanupBundle(bundle: ModelBundle, usage?: UsagePattern): boolean {
    if (bundle.preferences.retention === 'permanent') return false;
    if (bundle.preferences.retention === 'temporary') return true;

    // Auto retention logic
    if (!usage) return true;

    const daysSinceLastUse = (Date.now() - usage.lastAccess) / (24 * 60 * 60 * 1000);
    const isLowUsage = usage.frequency < 0.1 && usage.performanceScore < 50;
    const isOld = daysSinceLastUse > 30;

    return isLowUsage || isOld;
  }

  private getCleanupReason(bundle: ModelBundle, usage?: UsagePattern): string {
    if (bundle.preferences.retention === 'temporary') return 'temporary_retention';
    if (!usage) return 'no_usage_data';

    const daysSinceLastUse = (Date.now() - usage.lastAccess) / (24 * 60 * 60 * 1000);
    if (daysSinceLastUse > 30) return 'unused_over_30_days';
    if (usage.frequency < 0.1) return 'low_usage_frequency';
    if (usage.performanceScore < 50) return 'poor_performance';

    return 'automatic_cleanup';
  }

  private startMonitoring(): void {
    this.monitoringTimer = setInterval(async () => {
      const usage = await this.getStorageUsage();
      
      if (usage.percentage >= this.config.alertThresholds.critical) {
        this.emit('storage_critical', usage);
      } else if (usage.percentage >= this.config.alertThresholds.warning) {
        this.emit('storage_warning', usage);
      }

      this.emit('storage_monitored', usage);
    }, 60000); // Check every minute
  }

  private startGarbageCollection(): void {
    this.cleanupTimer = setInterval(async () => {
      await this.performCleanup();
    }, this.config.garbageCollectionInterval);
  }

  private async loadBundles(): Promise<void> {
    // Implementation would load bundle metadata from storage
  }

  private async saveBundles(): Promise<void> {
    // Implementation would save bundle metadata to storage
  }

  private async loadUsagePatterns(): Promise<void> {
    // Implementation would load usage patterns from storage
  }

  private async loadBackupInfo(): Promise<void> {
    // Implementation would load backup information from storage
  }

  private async saveBackupInfo(): Promise<void> {
    // Implementation would save backup information to storage
  }

  private async saveSyncConfig(): Promise<void> {
    // Implementation would save sync configuration
  }

  private async validateStorage(): Promise<void> {
    // Implementation would validate storage integrity
  }

  private async getAvailableSpace(): Promise<number> {
    // Implementation would calculate available space
    return this.config.maxSizeGB * 1024 * 1024 * 1024;
  }

  private async reserveSpace(bundleId: string, sizeGB: number, priority: number): Promise<void> {
    // Implementation would reserve space for bundle
  }

  private async getAllFiles(dirPath: string): Promise<string[]> {
    // Implementation would recursively get all files in directory
    return [];
  }

  private async compressFile(filePath: string): Promise<{ size: number }> {
    // Implementation would compress file using brotli
    return { size: 0 };
  }

  private async getBundleSize(bundleId: string): Promise<number> {
    // Implementation would calculate bundle size
    return 0;
  }

  private async removeBundle(bundleId: string): Promise<void> {
    // Implementation would remove bundle from storage
    this.bundles.delete(bundleId);
  }

  private async cleanTemporaryFiles(): Promise<void> {
    // Implementation would clean temporary files
  }

  private async getTotalAllocatedSpace(): Promise<number> {
    // Implementation would calculate total allocated space
    return 0;
  }

  private async getUsedSpace(): Promise<number> {
    // Implementation would calculate used space
    return 0;
  }

  private async encryptData(data: string): Promise<string> {
    // Implementation would encrypt data
    return data;
  }

  private async decryptData(data: string): Promise<string> {
    // Implementation would decrypt data
    return data;
  }

  private async uploadToCloud(data: any): Promise<void> {
    // Implementation would upload to configured cloud provider
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }
    this.removeAllListeners();
  }
}

export default BundleManager; 