/**
 * CodeForge Context Cache System
 * Implements intelligent context caching with semantic similarity,
 * compression, and performance optimization
 * 
 * Features:
 * - Intelligent context pre-loading
 * - Semantic similarity caching
 * - Context compression algorithms
 * - LRU eviction policies
 * - Context hit rate monitoring
 * - Background context warming
 * - Context deduplication
 * - Memory usage optimization
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import * as crypto from 'crypto';

// Interfaces and types
interface ContextCacheEntry {
  id: string;
  key: string;
  content: string;
  compressed: boolean;
  compressedContent?: Buffer | undefined;
  metadata: ContextMetadata;
  embeddings?: number[] | undefined;
  similarityThreshold: number;
  accessCount: number;
  lastAccessed: number;
  lastModified: number;
  size: number;
  tags: string[];
}

interface ContextMetadata {
  filePath: string;
  language: string;
  contentType: 'function' | 'class' | 'interface' | 'variable' | 'import' | 'comment' | 'full_file';
  lineRange: { start: number; end: number };
  dependencies: string[];
  semanticSignature: string;
  complexity: number;
  relevanceScore: number;
  lastModifiedTime: number;
}

interface CacheStatistics {
  totalEntries: number;
  memoryUsage: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  compressionRatio: number;
  averageRetrievalTime: number;
  preloadHitRate: number;
}

interface SimilarityResult {
  entry: ContextCacheEntry;
  similarity: number;
  matchType: 'exact' | 'semantic' | 'fuzzy';
}

interface PreloadStrategy {
  enabled: boolean;
  maxPreloadEntries: number;
  preloadThreshold: number;
  semanticPreload: boolean;
  dependencyPreload: boolean;
}

interface CompressionConfig {
  enabled: boolean;
  threshold: number; // bytes
  algorithm: 'gzip' | 'brotli' | 'lz4';
  level: number;
}

// Configuration constants
const CACHE_CONFIG = {
  // Cache size limits
  MAX_ENTRIES: 10000,
  MAX_MEMORY_MB: 512,
  ENTRY_SIZE_THRESHOLD: 1024, // bytes
  
  // LRU eviction
  EVICTION_BATCH_SIZE: 100,
  EVICTION_THRESHOLD: 0.9, // 90% full triggers eviction
  MIN_ACCESS_COUNT_FOR_RETENTION: 2,
  
  // Similarity matching
  SEMANTIC_SIMILARITY_THRESHOLD: 0.85,
  FUZZY_SIMILARITY_THRESHOLD: 0.7,
  EMBEDDING_DIMENSIONS: 768,
  
  // Compression settings
  COMPRESSION_THRESHOLD: 2048, // compress entries > 2KB
  COMPRESSION_LEVEL: 6,
  
  // Preloading
  PRELOAD_WINDOW_SIZE: 50, // context entries to consider
  PRELOAD_SIMILARITY_THRESHOLD: 0.8,
  BACKGROUND_PRELOAD_INTERVAL: 5000, // 5 seconds
  
  // Performance
  MAX_RETRIEVAL_TIME_MS: 10,
  SIMILARITY_SEARCH_LIMIT: 100,
  WARMING_BATCH_SIZE: 10
};

export class ContextCache extends EventEmitter {
  private cache: Map<string, ContextCacheEntry> = new Map();
  private accessOrder: string[] = []; // LRU tracking
  private memoryUsage: number = 0;
  private statistics: CacheStatistics;
  private preloadStrategy: PreloadStrategy;
  private compressionConfig: CompressionConfig;
  private preloadTimer: NodeJS.Timeout | null = null;
  private pendingWarmups: Set<string> = new Set();

  constructor() {
    super();
    
    this.statistics = {
      totalEntries: 0,
      memoryUsage: 0,
      hitRate: 0,
      missRate: 0,
      evictionCount: 0,
      compressionRatio: 0,
      averageRetrievalTime: 0,
      preloadHitRate: 0
    };

    this.preloadStrategy = {
      enabled: true,
      maxPreloadEntries: 100,
      preloadThreshold: 0.8,
      semanticPreload: true,
      dependencyPreload: true
    };

    this.compressionConfig = {
      enabled: true,
      threshold: CACHE_CONFIG.COMPRESSION_THRESHOLD,
      algorithm: 'gzip',
      level: CACHE_CONFIG.COMPRESSION_LEVEL
    };

    this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    // Start background preloading
    if (this.preloadStrategy.enabled) {
      this.startBackgroundPreloading();
    }

    // Setup periodic maintenance
    this.startMaintenanceTasks();
    
    this.emit('cache_initialized', {
      maxEntries: CACHE_CONFIG.MAX_ENTRIES,
      maxMemory: CACHE_CONFIG.MAX_MEMORY_MB,
      preloadEnabled: this.preloadStrategy.enabled
    });
  }

  // Main cache operations
  async get(key: string): Promise<ContextCacheEntry | null> {
    const startTime = performance.now();
    
    try {
      // Try exact match first
      let entry = this.cache.get(key);
      let matchType: 'exact' | 'semantic' | 'fuzzy' = 'exact';

      if (!entry) {
        // Try semantic similarity match
        const similarEntries = await this.findSimilarEntries(key, 1);
        if (similarEntries.length > 0) {
          entry = similarEntries[0].entry;
          matchType = similarEntries[0].matchType;
        }
      }

      if (entry) {
        // Update access tracking
        this.updateAccess(entry);
        
        // Decompress if needed
        const content = await this.getDecompressedContent(entry);
        
        // Update statistics
        this.statistics.hitRate = (this.statistics.hitRate * 0.95) + (1 * 0.05);
        
        // Trigger preloading of related content
        if (this.preloadStrategy.enabled) {
          this.triggerRelatedPreload(entry);
        }

        this.emit('cache_hit', {
          key,
          matchType,
          retrievalTime: performance.now() - startTime,
          compressed: entry.compressed
        });

        return {
          ...entry,
          content
        };
      } else {
        // Cache miss
        this.statistics.missRate = (this.statistics.missRate * 0.95) + (1 * 0.05);
        
        this.emit('cache_miss', {
          key,
          retrievalTime: performance.now() - startTime
        });

        return null;
      }
    } finally {
      // Update average retrieval time
      const retrievalTime = performance.now() - startTime;
      this.statistics.averageRetrievalTime = 
        (this.statistics.averageRetrievalTime * 0.95) + (retrievalTime * 0.05);
    }
  }

  async set(key: string, content: string, metadata: ContextMetadata): Promise<void> {
    // Check if we need to evict entries first
    await this.ensureCapacity();

    // Generate entry
    const entry = await this.createCacheEntry(key, content, metadata);
    
    // Store in cache
    this.cache.set(key, entry);
    this.accessOrder.push(key);
    this.memoryUsage += entry.size;
    this.statistics.totalEntries = this.cache.size;
    this.statistics.memoryUsage = this.memoryUsage;

    this.emit('cache_set', {
      key,
      size: entry.size,
      compressed: entry.compressed,
      totalEntries: this.statistics.totalEntries
    });
  }

  async delete(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.memoryUsage -= entry.size;
    
    // Remove from access order
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }

    this.statistics.totalEntries = this.cache.size;
    this.statistics.memoryUsage = this.memoryUsage;

    this.emit('cache_delete', { key, sizeFreed: entry.size });
    return true;
  }

  async clear(): Promise<void> {
    const entriesCleared = this.cache.size;
    const memoryFreed = this.memoryUsage;

    this.cache.clear();
    this.accessOrder.length = 0;
    this.memoryUsage = 0;
    this.statistics.totalEntries = 0;
    this.statistics.memoryUsage = 0;

    this.emit('cache_cleared', { entriesCleared, memoryFreed });
  }

  // Semantic similarity search
  async findSimilarEntries(query: string, limit: number = 10): Promise<SimilarityResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    const results: SimilarityResult[] = [];

    // Search through cached entries
    for (const entry of this.cache.values()) {
      if (!entry.embeddings) continue;

      const similarity = this.cosineSimilarity(queryEmbedding, entry.embeddings);
      
      let matchType: 'exact' | 'semantic' | 'fuzzy' = 'fuzzy';
      if (similarity >= CACHE_CONFIG.SEMANTIC_SIMILARITY_THRESHOLD) {
        matchType = 'semantic';
      }

      if (similarity >= CACHE_CONFIG.FUZZY_SIMILARITY_THRESHOLD) {
        results.push({ entry, similarity, matchType });
      }
    }

    // Sort by similarity and limit results
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, Math.min(limit, CACHE_CONFIG.SIMILARITY_SEARCH_LIMIT));
  }

  // Context preloading system
  async preloadContext(filePath: string, context: string[]): Promise<void> {
    if (!this.preloadStrategy.enabled) return;

    const preloadPromises = context
      .slice(0, this.preloadStrategy.maxPreloadEntries)
      .map(contextKey => this.warmupEntry(contextKey));

    await Promise.allSettled(preloadPromises);

    this.emit('context_preloaded', {
      filePath,
      entriesAttempted: context.length,
      entriesWarmedUp: context.length
    });
  }

  private async warmupEntry(key: string): Promise<void> {
    if (this.cache.has(key) || this.pendingWarmups.has(key)) return;

    this.pendingWarmups.add(key);

    try {
      // This would integrate with the actual context retrieval system
      // For now, we'll simulate warming up related entries
      const similarEntries = await this.findSimilarEntries(key, 5);
      
      // Pre-decompress similar entries
      for (const { entry } of similarEntries) {
        if (entry.compressed) {
          await this.getDecompressedContent(entry);
        }
      }
      
      this.emit('entry_warmed_up', { key, similarEntriesFound: similarEntries.length });
    } catch (error) {
      console.error(`Failed to warm up entry ${key}:`, error);
    } finally {
      this.pendingWarmups.delete(key);
    }
  }

  // Compression and decompression
  private async compressContent(content: string): Promise<Buffer> {
    // Placeholder implementation - would use actual compression library
    const buffer = Buffer.from(content, 'utf8');
    
    switch (this.compressionConfig.algorithm) {
      case 'gzip':
        // Would use zlib.gzip
        return buffer; // Placeholder
      case 'brotli':
        // Would use zlib.brotliCompress
        return buffer; // Placeholder
      case 'lz4':
        // Would use lz4 library
        return buffer; // Placeholder
      default:
        return buffer;
    }
  }

  private async decompressContent(compressed: Buffer): Promise<string> {
    // Placeholder implementation - would use actual decompression
    return compressed.toString('utf8');
  }

  private async getDecompressedContent(entry: ContextCacheEntry): Promise<string> {
    if (!entry.compressed || !entry.compressedContent) {
      return entry.content;
    }

    // Check if we have uncompressed content cached
    if (entry.content) {
      return entry.content;
    }

    // Decompress and cache the result
    const decompressed = await this.decompressContent(entry.compressedContent);
    entry.content = decompressed;
    
    return decompressed;
  }

  // Cache entry creation and management
  private async createCacheEntry(key: string, content: string, metadata: ContextMetadata): Promise<ContextCacheEntry> {
    const embeddings = await this.generateEmbedding(content);
    const contentSize = Buffer.byteLength(content, 'utf8');
    
    let compressed = false;
    let compressedContent: Buffer | undefined;
    let actualSize = contentSize;

    // Compress if content is large enough
    if (this.compressionConfig.enabled && contentSize > this.compressionConfig.threshold) {
      compressedContent = await this.compressContent(content);
      actualSize = compressedContent.length;
      compressed = true;
      
      // Update compression ratio
      const ratio = actualSize / contentSize;
      this.statistics.compressionRatio = 
        (this.statistics.compressionRatio * 0.95) + (ratio * 0.05);
    }

    return {
      id: crypto.randomUUID(),
      key,
      content: compressed ? '' : content, // Don't keep uncompressed content if compressed
      compressed,
      compressedContent,
      metadata,
      embeddings,
      similarityThreshold: CACHE_CONFIG.SEMANTIC_SIMILARITY_THRESHOLD,
      accessCount: 1,
      lastAccessed: performance.now(),
      lastModified: Date.now(),
      size: actualSize,
      tags: this.generateTags(metadata)
    };
  }

  private generateTags(metadata: ContextMetadata): string[] {
    const tags = [
      metadata.language,
      metadata.contentType,
      `complexity_${Math.floor(metadata.complexity / 10) * 10}` // Group by complexity levels
    ];

    // Add dependency tags
    metadata.dependencies.forEach(dep => {
      tags.push(`dep_${dep}`);
    });

    return tags;
  }

  // Embedding generation (placeholder)
  private async generateEmbedding(text: string): Promise<number[]> {
    // Placeholder implementation - would use actual embedding model
    // For now, generate a simple hash-based embedding
    const hash = crypto.createHash('sha256').update(text).digest();
    const embedding = new Array(CACHE_CONFIG.EMBEDDING_DIMENSIONS);
    
    for (let i = 0; i < CACHE_CONFIG.EMBEDDING_DIMENSIONS; i++) {
      embedding[i] = (hash[i % hash.length] / 255) * 2 - 1; // Normalize to [-1, 1]
    }
    
    return embedding;
  }

  // Similarity calculation
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // LRU eviction and capacity management
  private async ensureCapacity(): Promise<void> {
    const memoryThreshold = CACHE_CONFIG.MAX_MEMORY_MB * 1024 * 1024 * CACHE_CONFIG.EVICTION_THRESHOLD;
    const entryThreshold = CACHE_CONFIG.MAX_ENTRIES * CACHE_CONFIG.EVICTION_THRESHOLD;

    if (this.memoryUsage > memoryThreshold || this.cache.size > entryThreshold) {
      await this.evictLeastRecentlyUsed();
    }
  }

  private async evictLeastRecentlyUsed(): Promise<void> {
    const entriesToEvict = Math.min(
      CACHE_CONFIG.EVICTION_BATCH_SIZE,
      Math.floor(this.cache.size * 0.1) // Evict 10% of entries
    );

    // Sort by last accessed time and access count
    const entriesForEviction = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => {
        // Prioritize entries with low access count and old access time
        const scoreA = a.entry.lastAccessed / 1000 + a.entry.accessCount * 10000;
        const scoreB = b.entry.lastAccessed / 1000 + b.entry.accessCount * 10000;
        return scoreA - scoreB;
      })
      .slice(0, entriesToEvict);

    let evictedCount = 0;
    let memoryFreed = 0;

    for (const { key, entry } of entriesForEviction) {
      // Don't evict frequently accessed entries
      if (entry.accessCount >= CACHE_CONFIG.MIN_ACCESS_COUNT_FOR_RETENTION) {
        continue;
      }

      memoryFreed += entry.size;
      await this.delete(key);
      evictedCount++;
    }

    this.statistics.evictionCount += evictedCount;

    this.emit('entries_evicted', {
      count: evictedCount,
      memoryFreed,
      totalEntries: this.cache.size
    });
  }

  private updateAccess(entry: ContextCacheEntry): void {
    entry.accessCount++;
    entry.lastAccessed = performance.now();

    // Move to end of access order (most recent)
    const index = this.accessOrder.indexOf(entry.key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(entry.key);
  }

  // Background preloading
  private startBackgroundPreloading(): void {
    this.preloadTimer = setInterval(() => {
      this.performBackgroundPreloading();
    }, CACHE_CONFIG.BACKGROUND_PRELOAD_INTERVAL);
  }

  private async performBackgroundPreloading(): Promise<void> {
    if (this.pendingWarmups.size >= CACHE_CONFIG.WARMING_BATCH_SIZE) return;

    // Find recently accessed entries to preload related content
    const recentEntries = this.accessOrder
      .slice(-CACHE_CONFIG.PRELOAD_WINDOW_SIZE)
      .map(key => this.cache.get(key))
      .filter(Boolean) as ContextCacheEntry[];

    const preloadPromises = recentEntries
      .slice(0, CACHE_CONFIG.WARMING_BATCH_SIZE - this.pendingWarmups.size)
      .map(entry => this.preloadRelatedContent(entry));

    await Promise.allSettled(preloadPromises);
  }

  private async preloadRelatedContent(entry: ContextCacheEntry): Promise<void> {
    // Preload dependencies
    if (this.preloadStrategy.dependencyPreload) {
      for (const dep of entry.metadata.dependencies) {
        if (!this.cache.has(dep)) {
          this.warmupEntry(dep);
        }
      }
    }

    // Preload semantically similar content
    if (this.preloadStrategy.semanticPreload) {
      const similarEntries = await this.findSimilarEntries(
        entry.content, 
        3 // Limit to 3 similar entries
      );

      for (const { entry: similarEntry } of similarEntries) {
        if (similarEntry.compressed && !similarEntry.content) {
          // Pre-decompress similar entries
          await this.getDecompressedContent(similarEntry);
        }
      }
    }
  }

  private async triggerRelatedPreload(entry: ContextCacheEntry): Promise<void> {
    // Non-blocking preload trigger
    setImmediate(() => {
      this.preloadRelatedContent(entry);
    });
  }

  // Maintenance tasks
  private startMaintenanceTasks(): void {
    // Periodic cache cleanup every 5 minutes
    setInterval(() => {
      this.performMaintenance();
    }, 5 * 60 * 1000);

    // Statistics update every minute
    setInterval(() => {
      this.updateStatistics();
    }, 60 * 1000);
  }

  private async performMaintenance(): Promise<void> {
    // Remove expired entries
    const now = Date.now();
    const expiredEntries: string[] = [];

    for (const [key, entry] of this.cache) {
      // Consider entries older than 1 hour as potentially expired
      if (now - entry.lastModified > 3600000 && entry.accessCount < 2) {
        expiredEntries.push(key);
      }
    }

    for (const key of expiredEntries) {
      await this.delete(key);
    }

    // Defragment access order array
    this.accessOrder = this.accessOrder.filter(key => this.cache.has(key));

    this.emit('maintenance_completed', {
      expiredEntriesRemoved: expiredEntries.length,
      totalEntries: this.cache.size
    });
  }

  private updateStatistics(): void {
    this.statistics.totalEntries = this.cache.size;
    this.statistics.memoryUsage = this.memoryUsage;
    
    this.emit('statistics_updated', this.statistics);
  }

  // Public API methods
  getStatistics(): CacheStatistics {
    return { ...this.statistics };
  }

  getConfiguration(): {
    preloadStrategy: PreloadStrategy;
    compressionConfig: CompressionConfig;
    maxEntries: number;
    maxMemoryMB: number;
  } {
    return {
      preloadStrategy: { ...this.preloadStrategy },
      compressionConfig: { ...this.compressionConfig },
      maxEntries: CACHE_CONFIG.MAX_ENTRIES,
      maxMemoryMB: CACHE_CONFIG.MAX_MEMORY_MB
    };
  }

  updateConfiguration(config: Partial<{
    preloadStrategy: Partial<PreloadStrategy>;
    compressionConfig: Partial<CompressionConfig>;
  }>): void {
    if (config.preloadStrategy) {
      this.preloadStrategy = { ...this.preloadStrategy, ...config.preloadStrategy };
    }
    
    if (config.compressionConfig) {
      this.compressionConfig = { ...this.compressionConfig, ...config.compressionConfig };
    }

    this.emit('configuration_updated', this.getConfiguration());
  }

  // Cache warming for specific contexts
  async warmCache(contexts: Array<{ key: string; content: string; metadata: ContextMetadata }>): Promise<void> {
    const warmupPromises = contexts.map(async ({ key, content, metadata }) => {
      if (!this.cache.has(key)) {
        await this.set(key, content, metadata);
      }
    });

    await Promise.all(warmupPromises);

    this.emit('cache_warmed', {
      entriesWarmed: contexts.length,
      totalEntries: this.cache.size
    });
  }

  // Memory optimization
  async optimizeMemory(): Promise<void> {
    let optimizedCount = 0;
    let memoryFreed = 0;

    // Compress uncompressed large entries
    for (const entry of this.cache.values()) {
      if (!entry.compressed && 
          Buffer.byteLength(entry.content, 'utf8') > this.compressionConfig.threshold) {
        
        const originalSize = entry.size;
        const compressedContent = await this.compressContent(entry.content);
        
        entry.compressedContent = compressedContent;
        entry.compressed = true;
        entry.content = ''; // Clear uncompressed content
        entry.size = compressedContent.length;
        
        const savedMemory = originalSize - entry.size;
        memoryFreed += savedMemory;
        this.memoryUsage -= savedMemory;
        optimizedCount++;
      }
    }

    this.statistics.memoryUsage = this.memoryUsage;

    this.emit('memory_optimized', {
      entriesOptimized: optimizedCount,
      memoryFreed,
      totalMemoryUsage: this.memoryUsage
    });
  }

  async shutdown(): Promise<void> {
    // Clear all timers
    if (this.preloadTimer) {
      clearInterval(this.preloadTimer);
      this.preloadTimer = null;
    }

    // Clear cache
    await this.clear();

    this.emit('cache_shutdown');
  }
}

// Singleton instance for global usage
export const contextCache = new ContextCache();

// Export types and main class
export type { ContextCacheEntry, ContextMetadata, CacheStatistics, SimilarityResult, PreloadStrategy, CompressionConfig };
export default ContextCache; 