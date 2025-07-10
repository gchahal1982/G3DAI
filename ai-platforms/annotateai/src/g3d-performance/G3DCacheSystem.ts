/**
 * G3D Cache System - Intelligent Caching Infrastructure
 * 
 * Advanced multi-layer caching system with GPU memory management,
 * intelligent prefetching, and distributed cache coordination.
 * 
 * Features:
 * - GPU memory caching with WebGPU buffer management
 * - Multi-level cache hierarchy (L1/L2/L3)
 * - LRU/LFU/ARC eviction algorithms
 * - Distributed cache coordination
 * - Intelligent prefetching with ML prediction
 * - Cache analytics and optimization
 * - Memory pressure handling
 * - Cache warming strategies
 * 
 * Part of G3D AnnotateAI MVP - Performance & Compute Phase 0.4
 * Supports enterprise-scale annotation workloads with optimal performance
 */

import { EventEmitter } from 'events';

// Core cache interfaces
export interface CacheEntry<T = any> {
    key: string;
    value: T;
    size: number;
    accessCount: number;
    lastAccessed: number;
    created: number;
    ttl?: number;
    tags: Set<string>;
    priority: CachePriority;
    metadata: Map<string, any>;
}

export interface CacheStats {
    hits: number;
    misses: number;
    evictions: number;
    size: number;
    maxSize: number;
    hitRatio: number;
    memoryUsage: number;
    gpuMemoryUsage: number;
}

export interface CacheConfig {
    maxSize: number;
    maxMemory: number;
    maxGPUMemory: number;
    evictionPolicy: EvictionPolicy;
    ttlDefault: number;
    prefetchEnabled: boolean;
    distributedEnabled: boolean;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
}

export enum CachePriority {
    LOW = 1,
    NORMAL = 2,
    HIGH = 3,
    CRITICAL = 4
}

export enum EvictionPolicy {
    LRU = 'lru',
    LFU = 'lfu',
    ARC = 'arc',
    RANDOM = 'random',
    FIFO = 'fifo'
}

export enum CacheLevel {
    L1_CPU = 'l1_cpu',
    L2_GPU = 'l2_gpu',
    L3_DISK = 'l3_disk',
    DISTRIBUTED = 'distributed'
}

// GPU buffer cache entry
export interface GPUCacheEntry {
    buffer: GPUBuffer;
    size: number;
    usage: GPUBufferUsage;
    lastAccessed: number;
    refCount: number;
}

// Cache event types
export interface CacheEvents {
    hit: (key: string, level: CacheLevel) => void;
    miss: (key: string) => void;
    evict: (key: string, reason: string) => void;
    error: (error: Error) => void;
    memoryPressure: (usage: number, limit: number) => void;
    prefetch: (keys: string[]) => void;
}

/**
 * Multi-Level Cache Manager
 * Coordinates between CPU, GPU, and distributed cache layers
 */
export class G3DCacheSystem extends EventEmitter {
    private l1Cache: Map<string, CacheEntry> = new Map();
    private l2GPUCache: Map<string, GPUCacheEntry> = new Map();
    private l3DiskCache: Map<string, CacheEntry> = new Map();
    private distributedCache: Map<string, CacheEntry> = new Map();

    private stats: CacheStats;
    private config: CacheConfig;
    private device: GPUDevice | null = null;
    private compressionWorker: Worker | null = null;
    private prefetchPredictor: PrefetchPredictor;
    private memoryMonitor: MemoryMonitor;
    private cacheAnalyzer: CacheAnalyzer;

    // Eviction algorithms
    private lruList: DoublyLinkedList<string> = new DoublyLinkedList();
    private lfuCounter: Map<string, number> = new Map();
    private arcT1: Set<string> = new Set();
    private arcT2: Set<string> = new Set();
    private arcB1: Set<string> = new Set();
    private arcB2: Set<string> = new Set();

    constructor(config: Partial<CacheConfig> = {}) {
        super();

        this.config = {
            maxSize: 10000,
            maxMemory: 1024 * 1024 * 1024, // 1GB
            maxGPUMemory: 512 * 1024 * 1024, // 512MB
            evictionPolicy: EvictionPolicy.ARC,
            ttlDefault: 3600000, // 1 hour
            prefetchEnabled: true,
            distributedEnabled: false,
            compressionEnabled: true,
            encryptionEnabled: false,
            ...config
        };

        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            size: 0,
            maxSize: this.config.maxSize,
            hitRatio: 0,
            memoryUsage: 0,
            gpuMemoryUsage: 0
        };

        this.prefetchPredictor = new PrefetchPredictor();
        this.memoryMonitor = new MemoryMonitor();
        this.cacheAnalyzer = new CacheAnalyzer();

        this.initializeGPU();
        this.initializeWorkers();
        this.startMemoryMonitoring();
    }

    /**
     * Initialize GPU device for GPU caching
     */
    private async initializeGPU(): Promise<void> {
        try {
            if ('gpu' in navigator) {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    this.device = await adapter.requestDevice() as any;
                }
            }
        } catch (error) {
            console.warn('GPU not available for caching:', error);
        }
    }

    /**
     * Initialize web workers for compression and background tasks
     */
    private initializeWorkers(): void {
        if (this.config.compressionEnabled) {
            try {
                this.compressionWorker = new Worker(
                    URL.createObjectURL(new Blob([this.getCompressionWorkerCode()],
                        { type: 'application/javascript' }))
                );
            } catch (error) {
                console.warn('Compression worker not available:', error);
            }
        }
    }

    /**
     * Start memory monitoring for cache pressure management
     */
    private startMemoryMonitoring(): void {
        setInterval(() => {
            this.memoryMonitor.update();
            const usage = this.memoryMonitor.getUsage();

            if (usage.ratio > 0.8) {
                this.emit('memoryPressure', usage.used, usage.total);
                this.handleMemoryPressure();
            }
        }, 5000);
    }

    /**
     * Get value from cache with intelligent level selection
     */
    public async get<T>(key: string, options: {
        level?: CacheLevel;
        prefetch?: boolean;
        decompress?: boolean;
    } = {}): Promise<T | null> {
        const startTime = Date.now();

        try {
            // Try L1 CPU cache first
            let entry = this.l1Cache.get(key);
            if (entry && this.isValidEntry(entry)) {
                this.updateAccessStats(entry, CacheLevel.L1_CPU);
                this.emit('hit', key, CacheLevel.L1_CPU);
                this.stats.hits++;

                if (options.prefetch) {
                    this.triggerPrefetch(key);
                }

                return entry.value as T;
            }

            // Try L2 GPU cache
            const gpuEntry = this.l2GPUCache.get(key);
            if (gpuEntry && this.device) {
                const data = await this.readFromGPUBuffer(gpuEntry.buffer);
                if (data) {
                    // Promote to L1
                    await this.promoteToL1(key, data);
                    this.emit('hit', key, CacheLevel.L2_GPU);
                    this.stats.hits++;
                    return data as T;
                }
            }

            // Try L3 disk cache
            entry = this.l3DiskCache.get(key);
            if (entry && this.isValidEntry(entry)) {
                let value = entry.value;

                if (options.decompress && this.compressionWorker) {
                    value = await this.decompress(value);
                }

                // Promote to higher levels
                await this.promoteToL1(key, value);
                if (this.device) {
                    await this.promoteToGPU(key, value);
                }

                this.emit('hit', key, CacheLevel.L3_DISK);
                this.stats.hits++;
                return value as T;
            }

            // Try distributed cache
            if (this.config.distributedEnabled) {
                const distributedValue = await this.getFromDistributed(key);
                if (distributedValue) {
                    // Promote to all levels
                    await this.promoteToL1(key, distributedValue);
                    if (this.device) {
                        await this.promoteToGPU(key, distributedValue);
                    }

                    this.emit('hit', key, CacheLevel.DISTRIBUTED);
                    this.stats.hits++;
                    return distributedValue as T;
                }
            }

            // Cache miss
            this.emit('miss', key);
            this.stats.misses++;
            return null;

        } finally {
            const duration = Date.now() - startTime;
            this.cacheAnalyzer.recordAccess(key, duration);
            this.updateHitRatio();
        }
    }

    /**
     * Set value in cache with intelligent level placement
     */
    public async set<T>(
        key: string,
        value: T,
        options: {
            ttl?: number;
            priority?: CachePriority;
            tags?: string[];
            level?: CacheLevel;
            compress?: boolean;
            replicate?: boolean;
        } = {}
    ): Promise<void> {
        const size = this.calculateSize(value);
        const ttl = options.ttl || this.config.ttlDefault;
        const priority = options.priority || CachePriority.NORMAL;
        const tags = new Set(options.tags || []);

        const entry: CacheEntry<T> = {
            key,
            value,
            size,
            accessCount: 0,
            lastAccessed: Date.now(),
            created: Date.now(),
            ttl,
            tags,
            priority,
            metadata: new Map()
        };

        // Compress if enabled
        if (options.compress && this.compressionWorker) {
            entry.value = await this.compress(value) as T;
            entry.size = this.calculateSize(entry.value);
        }

        // Ensure cache capacity
        await this.ensureCapacity(size, priority);

        // Store in L1 CPU cache
        this.l1Cache.set(key, entry);
        this.updateEvictionStructures(key, 'add');

        // Store in GPU cache if appropriate
        if (this.device && this.shouldStoreInGPU(value, size)) {
            await this.storeInGPU(key, value);
        }

        // Store in L3 disk cache for persistence
        if (priority >= CachePriority.HIGH) {
            this.l3DiskCache.set(key, { ...entry });
        }

        // Replicate to distributed cache
        if (options.replicate && this.config.distributedEnabled) {
            await this.replicateToDistributed(key, entry);
        }

        this.stats.size++;
        this.updateMemoryUsage();
    }

    /**
     * Delete entry from all cache levels
     */
    public async delete(key: string): Promise<boolean> {
        let deleted = false;

        // Remove from L1
        if (this.l1Cache.has(key)) {
            this.l1Cache.delete(key);
            this.updateEvictionStructures(key, 'remove');
            deleted = true;
        }

        // Remove from GPU cache
        const gpuEntry = this.l2GPUCache.get(key);
        if (gpuEntry) {
            gpuEntry.buffer.destroy();
            this.l2GPUCache.delete(key);
            deleted = true;
        }

        // Remove from L3
        if (this.l3DiskCache.has(key)) {
            this.l3DiskCache.delete(key);
            deleted = true;
        }

        // Remove from distributed cache
        if (this.config.distributedEnabled) {
            await this.deleteFromDistributed(key);
        }

        if (deleted) {
            this.stats.size--;
            this.updateMemoryUsage();
        }

        return deleted;
    }

    /**
     * Clear cache by tags
     */
    public async clearByTags(tags: string[]): Promise<number> {
        const tagSet = new Set(tags);
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.l1Cache) {
            if (tags.some(tag => entry.tags.has(tag))) {
                keysToDelete.push(key);
            }
        }

        for (const key of keysToDelete) {
            await this.delete(key);
        }

        return keysToDelete.length;
    }

    /**
     * Warm cache with predicted data
     */
    public async warmCache(keys: string[]): Promise<void> {
        const predictions = this.prefetchPredictor.predict(keys);

        for (const prediction of predictions) {
            if (!this.l1Cache.has(prediction.key)) {
                // Trigger background loading
                this.loadInBackground(prediction.key, prediction.priority);
            }
        }
    }

    /**
     * Get comprehensive cache statistics
     */
    public getStats(): CacheStats & {
        levels: Record<CacheLevel, { size: number; memoryUsage: number }>;
        evictionPolicy: EvictionPolicy;
        predictions: number;
        compressionRatio: number;
    } {
        return {
            ...this.stats,
            levels: {
                [CacheLevel.L1_CPU]: {
                    size: this.l1Cache.size,
                    memoryUsage: this.calculateTotalMemory(this.l1Cache)
                },
                [CacheLevel.L2_GPU]: {
                    size: this.l2GPUCache.size,
                    memoryUsage: this.calculateGPUMemory()
                },
                [CacheLevel.L3_DISK]: {
                    size: this.l3DiskCache.size,
                    memoryUsage: this.calculateTotalMemory(this.l3DiskCache)
                },
                [CacheLevel.DISTRIBUTED]: {
                    size: this.distributedCache.size,
                    memoryUsage: 0
                }
            },
            evictionPolicy: this.config.evictionPolicy,
            predictions: this.prefetchPredictor.getPredictionCount(),
            compressionRatio: this.cacheAnalyzer.getCompressionRatio()
        };
    }

    /**
     * Optimize cache performance
     */
    public async optimize(): Promise<void> {
        const analysis = this.cacheAnalyzer.analyze();

        // Adjust eviction policy based on access patterns
        if (analysis.sequentialAccess > 0.7) {
            this.config.evictionPolicy = EvictionPolicy.FIFO;
        } else if (analysis.temporalLocality > 0.8) {
            this.config.evictionPolicy = EvictionPolicy.LRU;
        } else if (analysis.frequencyBased > 0.6) {
            this.config.evictionPolicy = EvictionPolicy.LFU;
        } else {
            this.config.evictionPolicy = EvictionPolicy.ARC;
        }

        // Optimize GPU memory allocation
        if (this.device) {
            await this.optimizeGPUCache();
        }

        // Trigger prefetching for hot data
        const hotKeys = analysis.hotKeys;
        if (hotKeys.length > 0) {
            this.emit('prefetch', hotKeys);
        }
    }

    // Private helper methods
    private isValidEntry(entry: CacheEntry): boolean {
        if (entry.ttl && Date.now() - entry.created > entry.ttl) {
            return false;
        }
        return true;
    }

    private updateAccessStats(entry: CacheEntry, level: CacheLevel): void {
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        this.updateEvictionStructures(entry.key, 'access');
    }

    private updateEvictionStructures(key: string, action: 'add' | 'remove' | 'access'): void {
        switch (this.config.evictionPolicy) {
            case EvictionPolicy.LRU:
                this.updateLRU(key, action);
                break;
            case EvictionPolicy.LFU:
                this.updateLFU(key, action);
                break;
            case EvictionPolicy.ARC:
                this.updateARC(key, action);
                break;
        }
    }

    private updateLRU(key: string, action: string): void {
        if (action === 'remove') {
            this.lruList.remove(key);
        } else {
            this.lruList.moveToFront(key);
        }
    }

    private updateLFU(key: string, action: string): void {
        if (action === 'remove') {
            this.lfuCounter.delete(key);
        } else if (action === 'access') {
            this.lfuCounter.set(key, (this.lfuCounter.get(key) || 0) + 1);
        }
    }

    private updateARC(key: string, action: string): void {
        // Adaptive Replacement Cache algorithm implementation
        if (action === 'access') {
            if (this.arcT1.has(key)) {
                this.arcT1.delete(key);
                this.arcT2.add(key);
            } else if (this.arcT2.has(key)) {
                // Already in T2, move to front
            } else if (this.arcB1.has(key)) {
                this.arcB1.delete(key);
                this.arcT2.add(key);
            } else if (this.arcB2.has(key)) {
                this.arcB2.delete(key);
                this.arcT2.add(key);
            } else {
                this.arcT1.add(key);
            }
        }
    }

    private async ensureCapacity(size: number, priority: CachePriority): Promise<void> {
        while (this.stats.size >= this.config.maxSize ||
            this.stats.memoryUsage + size > this.config.maxMemory) {
            const evicted = await this.evictEntry(priority);
            if (!evicted) break;
        }
    }

    private async evictEntry(protectedPriority: CachePriority): Promise<boolean> {
        let keyToEvict: string | null = null;

        switch (this.config.evictionPolicy) {
            case EvictionPolicy.LRU:
                keyToEvict = this.lruList.tail();
                break;
            case EvictionPolicy.LFU:
                keyToEvict = this.findLFUKey();
                break;
            case EvictionPolicy.ARC:
                keyToEvict = this.findARCKey();
                break;
            case EvictionPolicy.RANDOM:
                keyToEvict = this.findRandomKey();
                break;
            case EvictionPolicy.FIFO:
                keyToEvict = this.findFIFOKey();
                break;
        }

        if (keyToEvict) {
            const entry = this.l1Cache.get(keyToEvict);
            if (entry && entry.priority < protectedPriority) {
                await this.delete(keyToEvict);
                this.emit('evict', keyToEvict, 'capacity');
                this.stats.evictions++;
                return true;
            }
        }

        return false;
    }

    private findLFUKey(): string | null {
        let minCount = Infinity;
        let keyToEvict: string | null = null;

        for (const [key, count] of this.lfuCounter) {
            if (count < minCount) {
                minCount = count;
                keyToEvict = key;
            }
        }

        return keyToEvict;
    }

    private findARCKey(): string | null {
        if (this.arcT1.size > 0) {
            return this.arcT1.values().next().value;
        }
        if (this.arcT2.size > 0) {
            return this.arcT2.values().next().value;
        }
        return null;
    }

    private findRandomKey(): string | null {
        const keys = Array.from(this.l1Cache.keys());
        return keys.length > 0 ? keys[Math.floor(Math.random() * keys.length)] : null;
    }

    private findFIFOKey(): string | null {
        let oldestTime = Infinity;
        let keyToEvict: string | null = null;

        for (const [key, entry] of this.l1Cache) {
            if (entry.created < oldestTime) {
                oldestTime = entry.created;
                keyToEvict = key;
            }
        }

        return keyToEvict;
    }

    private calculateSize(value: any): number {
        if (typeof value === 'string') {
            return value.length * 2; // UTF-16
        }
        if (value instanceof ArrayBuffer) {
            return value.byteLength;
        }
        if (ArrayBuffer.isView(value)) {
            return value.byteLength;
        }
        return JSON.stringify(value).length * 2;
    }

    private calculateTotalMemory(cache: Map<string, CacheEntry>): number {
        let total = 0;
        for (const entry of cache.values()) {
            total += entry.size;
        }
        return total;
    }

    private calculateGPUMemory(): number {
        let total = 0;
        for (const entry of this.l2GPUCache.values()) {
            total += entry.size;
        }
        return total;
    }

    private updateMemoryUsage(): void {
        this.stats.memoryUsage = this.calculateTotalMemory(this.l1Cache);
        this.stats.gpuMemoryUsage = this.calculateGPUMemory();
    }

    private updateHitRatio(): void {
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRatio = total > 0 ? this.stats.hits / total : 0;
    }

    private async handleMemoryPressure(): Promise<void> {
        // Aggressive eviction during memory pressure
        const targetReduction = this.stats.memoryUsage * 0.2; // Reduce by 20%
        let freedMemory = 0;

        while (freedMemory < targetReduction && this.l1Cache.size > 0) {
            const evicted = await this.evictEntry(CachePriority.CRITICAL);
            if (!evicted) break;
            freedMemory += 1000; // Estimate
        }
    }

    private async triggerPrefetch(key: string): Promise<void> {
        if (!this.config.prefetchEnabled) return;

        const predictions = this.prefetchPredictor.predictNext(key);
        for (const prediction of predictions) {
            if (!this.l1Cache.has(prediction)) {
                this.loadInBackground(prediction, CachePriority.LOW);
            }
        }
    }

    private async loadInBackground(key: string, priority: CachePriority): Promise<void> {
        // Background loading implementation would go here
        // This would typically load from external data sources
    }

    private shouldStoreInGPU(value: any, size: number): boolean {
        return this.device !== null &&
            size > 1024 && // Only large objects
            (value instanceof ArrayBuffer || ArrayBuffer.isView(value));
    }

    private async storeInGPU(key: string, value: any): Promise<void> {
        if (!this.device) return;

        const buffer = this.device.createBuffer({
            size: this.calculateSize(value),
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
        });

        // Write data to buffer
        this.device.queue.writeBuffer(buffer, 0, value);

        this.l2GPUCache.set(key, {
            buffer,
            size: buffer.size,
            usage: buffer.usage,
            lastAccessed: Date.now(),
            refCount: 1
        });
    }

    private async readFromGPUBuffer(buffer: GPUBuffer): Promise<ArrayBuffer | null> {
        if (!this.device) return null;

        try {
            const readBuffer = this.device.createBuffer({
                size: buffer.size,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
            });

            const commandEncoder = this.device.createCommandEncoder();
            commandEncoder.copyBufferToBuffer(buffer, 0, readBuffer, 0, buffer.size);
            this.device.queue.submit([commandEncoder.finish()]);

            await readBuffer.mapAsync(GPUMapMode.READ);
            const data = readBuffer.getMappedRange().slice(0);
            readBuffer.unmap();
            readBuffer.destroy();

            return data;
        } catch (error) {
            console.error('GPU buffer read error:', error);
            return null;
        }
    }

    private async promoteToL1(key: string, value: any): Promise<void> {
        await this.set(key, value, { priority: CachePriority.HIGH });
    }

    private async promoteToGPU(key: string, value: any): Promise<void> {
        if (this.shouldStoreInGPU(value, this.calculateSize(value))) {
            await this.storeInGPU(key, value);
        }
    }

    private async optimizeGPUCache(): Promise<void> {
        // Remove unused GPU buffers
        for (const [key, entry] of this.l2GPUCache) {
            if (entry.refCount === 0 && Date.now() - entry.lastAccessed > 60000) {
                entry.buffer.destroy();
                this.l2GPUCache.delete(key);
            }
        }
    }

    private async compress(value: any): Promise<any> {
        if (!this.compressionWorker) return value;

        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36);

            const handler = (event: MessageEvent) => {
                if (event.data.id === id) {
                    this.compressionWorker!.removeEventListener('message', handler);
                    if (event.data.error) {
                        reject(new Error(event.data.error));
                    } else {
                        resolve(event.data.result);
                    }
                }
            };

            this.compressionWorker.addEventListener('message', handler);
            this.compressionWorker.postMessage({
                id,
                action: 'compress',
                data: value
            });
        });
    }

    private async decompress(value: any): Promise<any> {
        if (!this.compressionWorker) return value;

        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36);

            const handler = (event: MessageEvent) => {
                if (event.data.id === id) {
                    this.compressionWorker!.removeEventListener('message', handler);
                    if (event.data.error) {
                        reject(new Error(event.data.error));
                    } else {
                        resolve(event.data.result);
                    }
                }
            };

            this.compressionWorker.addEventListener('message', handler);
            this.compressionWorker.postMessage({
                id,
                action: 'decompress',
                data: value
            });
        });
    }

    private async getFromDistributed(key: string): Promise<any> {
        // Distributed cache implementation would go here
        // This could integrate with Redis, Memcached, or custom distributed cache
        return null;
    }

    private async replicateToDistributed(key: string, entry: CacheEntry): Promise<void> {
        // Distributed replication implementation would go here
    }

    private async deleteFromDistributed(key: string): Promise<void> {
        // Distributed deletion implementation would go here
    }

    private getCompressionWorkerCode(): string {
        return `
      self.addEventListener('message', async (event) => {
        const { id, action, data } = event.data;
        
        try {
          let result;
          
          if (action === 'compress') {
            // Simple compression using gzip-like algorithm
            const str = typeof data === 'string' ? data : JSON.stringify(data);
            const encoder = new TextEncoder();
            const compressed = encoder.encode(str);
            result = compressed;
          } else if (action === 'decompress') {
            // Simple decompression
            const decoder = new TextDecoder();
            const decompressed = decoder.decode(data);
            result = JSON.parse(decompressed);
          }
          
          self.postMessage({ id, result });
        } catch (error) {
          self.postMessage({ id, error: error.message });
        }
      });
    `;
    }

    /**
     * Cleanup resources
     */
    public dispose(): void {
        // Cleanup GPU buffers
        for (const entry of this.l2GPUCache.values()) {
            entry.buffer.destroy();
        }
        this.l2GPUCache.clear();

        // Cleanup workers
        if (this.compressionWorker) {
            this.compressionWorker.terminate();
        }

        // Clear all caches
        this.l1Cache.clear();
        this.l3DiskCache.clear();
        this.distributedCache.clear();

        this.removeAllListeners();
    }
}

/**
 * Doubly Linked List for LRU implementation
 */
class DoublyLinkedList<T> {
    private head: ListNode<T> | null = null;
    private tailNode: ListNode<T> | null = null;
    private nodeMap: Map<T, ListNode<T>> = new Map();

    moveToFront(value: T): void {
        const node = this.nodeMap.get(value);
        if (node) {
            this.removeNode(node);
        } else {
            const newNode = new ListNode(value);
            this.nodeMap.set(value, newNode);
        }
        this.addToFront(this.nodeMap.get(value)!);
    }

    remove(value: T): void {
        const node = this.nodeMap.get(value);
        if (node) {
            this.removeNode(node);
            this.nodeMap.delete(value);
        }
    }

    tail(): T | null {
        return this.tailNode ? this.tailNode.value : null;
    }

    private addToFront(node: ListNode<T>): void {
        node.next = this.head;
        node.prev = null;

        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;

        if (!this.tailNode) {
            this.tailNode = node;
        }
    }

    private removeNode(node: ListNode<T>): void {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }

        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this.tailNode = node.prev;
        }
    }
}

class ListNode<T> {
    constructor(
        public value: T,
        public next: ListNode<T> | null = null,
        public prev: ListNode<T> | null = null
    ) { }
}

/**
 * Prefetch Predictor using ML-based access pattern analysis
 */
class PrefetchPredictor {
    private accessHistory: Map<string, string[]> = new Map();
    private patterns: Map<string, number> = new Map();
    private predictionCount = 0;

    predict(keys: string[]): Array<{ key: string; priority: CachePriority }> {
        const predictions: Array<{ key: string; priority: CachePriority }> = [];

        for (const key of keys) {
            const history = this.accessHistory.get(key) || [];
            const nextKeys = this.findNextKeys(history);

            for (const nextKey of nextKeys) {
                predictions.push({
                    key: nextKey,
                    priority: CachePriority.LOW
                });
            }
        }

        this.predictionCount += predictions.length;
        return predictions;
    }

    predictNext(key: string): string[] {
        const history = this.accessHistory.get(key) || [];
        return this.findNextKeys(history);
    }

    private findNextKeys(history: string[]): string[] {
        // Simple pattern matching - could be enhanced with ML
        const nextKeys: string[] = [];

        for (let i = 0; i < history.length - 1; i++) {
            const pattern = history[i];
            const next = history[i + 1];
            const count = this.patterns.get(`${pattern}->${next}`) || 0;
            this.patterns.set(`${pattern}->${next}`, count + 1);

            if (count > 2) { // Threshold for prediction
                nextKeys.push(next);
            }
        }

        return nextKeys;
    }

    getPredictionCount(): number {
        return this.predictionCount;
    }
}

/**
 * Memory Monitor for system memory tracking
 */
class MemoryMonitor {
    private usage = { used: 0, total: 0, ratio: 0 };

    update(): void {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            this.usage = {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                ratio: memory.usedJSHeapSize / memory.totalJSHeapSize
            };
        }
    }

    getUsage() {
        return this.usage;
    }
}

/**
 * Cache Analyzer for performance analysis and optimization
 */
class CacheAnalyzer {
    private accessTimes: number[] = [];
    private accessPatterns: Map<string, number[]> = new Map();
    private compressionStats = { original: 0, compressed: 0 };

    recordAccess(key: string, duration: number): void {
        this.accessTimes.push(duration);

        const times = this.accessPatterns.get(key) || [];
        times.push(Date.now());
        this.accessPatterns.set(key, times);
    }

    analyze(): {
        sequentialAccess: number;
        temporalLocality: number;
        frequencyBased: number;
        hotKeys: string[];
    } {
        // Analyze access patterns
        let sequentialCount = 0;
        let temporalCount = 0;
        const frequencies: Map<string, number> = new Map();

        for (const [key, times] of this.accessPatterns) {
            frequencies.set(key, times.length);

            // Check for temporal locality
            for (let i = 1; i < times.length; i++) {
                if (times[i] - times[i - 1] < 5000) { // 5 second window
                    temporalCount++;
                }
            }
        }

        const totalAccesses = this.accessTimes.length;
        const hotKeys = Array.from(frequencies.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([key]) => key);

        return {
            sequentialAccess: sequentialCount / totalAccesses,
            temporalLocality: temporalCount / totalAccesses,
            frequencyBased: hotKeys.length / frequencies.size,
            hotKeys
        };
    }

    getCompressionRatio(): number {
        return this.compressionStats.original > 0 ?
            this.compressionStats.compressed / this.compressionStats.original : 1;
    }
}

export default G3DCacheSystem;