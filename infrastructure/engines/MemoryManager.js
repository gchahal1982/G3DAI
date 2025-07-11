import { EventEmitter } from 'events';
export class MemoryManager extends EventEmitter {
    constructor() {
        super();
        this.pools = new Map();
        this.cache = new Map();
        this.allocations = new Map();
        this.gcInterval = null;
        this.metricsInterval = null;
        this.isRunning = false;
        this.maxCacheSize = 1024 * 1024 * 1024; // 1GB
        this.gcThreshold = 0.8; // 80% memory usage
        this.defaultTTL = 3600000; // 1 hour
        this.initializeMemoryManager();
        this.setupAllocationStrategy();
        this.setupGCStrategy();
        this.setupCacheEvictionPolicy();
        this.initializeMetrics();
    }
    initializeMemoryManager() {
        console.log('Initializing G3D Memory Manager');
        // Create default memory pools
        this.createPool('cpu-main', 'cpu', 8 * 1024 * 1024 * 1024); // 8GB CPU
        this.createPool('gpu-main', 'gpu', 16 * 1024 * 1024 * 1024); // 16GB GPU
        this.createPool('shared-buffer', 'shared', 2 * 1024 * 1024 * 1024); // 2GB Shared
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.on('memoryLow', this.handleMemoryLow.bind(this));
        this.on('fragmentationHigh', this.handleFragmentationHigh.bind(this));
        this.on('cacheEviction', this.handleCacheEviction.bind(this));
        this.on('allocationFailed', this.handleAllocationFailed.bind(this));
    }
    setupAllocationStrategy() {
        this.allocationStrategy = {
            name: 'best-fit',
            allocate: (pool, size, alignment = 1) => {
                // Align size
                const alignedSize = Math.ceil(size / alignment) * alignment;
                // Find best fitting free block
                const suitableBlocks = pool.freeBlocks
                    .filter(block => block.size >= alignedSize)
                    .sort((a, b) => a.size - b.size);
                if (suitableBlocks.length === 0)
                    return null;
                const selectedBlock = suitableBlocks[0];
                // Split block if necessary
                if (selectedBlock.size > alignedSize + 64) { // Minimum fragment size
                    const newBlock = {
                        id: this.generateBlockId(),
                        poolId: pool.id,
                        offset: selectedBlock.offset + alignedSize,
                        size: selectedBlock.size - alignedSize,
                        status: 'free',
                        createdAt: new Date(),
                        lastAccessed: new Date(),
                        accessCount: 0,
                        priority: 0,
                        metadata: {}
                    };
                    pool.freeBlocks.push(newBlock);
                }
                // Update selected block
                selectedBlock.size = alignedSize;
                selectedBlock.status = 'allocated';
                selectedBlock.lastAccessed = new Date();
                selectedBlock.accessCount++;
                // Remove from free blocks
                pool.freeBlocks = pool.freeBlocks.filter(b => b.id !== selectedBlock.id);
                return selectedBlock;
            }
        };
    }
    setupGCStrategy() {
        this.gcStrategy = {
            name: 'mark-and-sweep',
            shouldCollect: (pool) => {
                const utilization = pool.usedSize / pool.totalSize;
                const fragmentation = this.calculateFragmentation(pool);
                return utilization > this.gcThreshold ||
                    fragmentation > 0.3 ||
                    (Date.now() - pool.lastGC.getTime()) > 300000; // 5 minutes
            },
            collect: (pool) => {
                const initialFree = pool.availableSize;
                // Mark phase - identify unreferenced blocks
                const referencedBlocks = new Set();
                for (const allocation of this.allocations.values()) {
                    if (allocation.poolId === pool.id) {
                        referencedBlocks.add(allocation.blockId);
                    }
                }
                // Sweep phase - deallocate unreferenced blocks
                let freedMemory = 0;
                for (const [blockId, block] of pool.allocatedBlocks) {
                    if (!referencedBlocks.has(blockId)) {
                        freedMemory += block.size;
                        this.deallocateBlock(pool, block);
                    }
                }
                // Coalesce free blocks
                this.coalesceBlocks(pool);
                pool.lastGC = new Date();
                return freedMemory;
            }
        };
    }
    setupCacheEvictionPolicy() {
        this.cacheEvictionPolicy = {
            name: 'lru-priority',
            selectForEviction: (cache, targetSize) => {
                const entries = Array.from(cache.values());
                // Sort by priority (ascending) then by last accessed (ascending)
                entries.sort((a, b) => {
                    if (a.priority !== b.priority) {
                        return a.priority - b.priority;
                    }
                    return a.lastAccessed.getTime() - b.lastAccessed.getTime();
                });
                const toEvict = [];
                let freedSize = 0;
                for (const entry of entries) {
                    if (freedSize >= targetSize)
                        break;
                    toEvict.push(entry.key);
                    freedSize += entry.size;
                }
                return toEvict;
            }
        };
    }
    initializeMetrics() {
        this.metrics = {
            totalMemory: 0,
            usedMemory: 0,
            availableMemory: 0,
            fragmentation: 0,
            cacheHitRate: 0,
            allocationRate: 0,
            deallocationRate: 0,
            gcFrequency: 0,
            poolUtilization: {}
        };
    }
    // Pool Management
    createPool(name, type, size) {
        const poolId = this.generatePoolId();
        const pool = {
            id: poolId,
            name,
            type,
            totalSize: size,
            usedSize: 0,
            availableSize: size,
            allocatedBlocks: new Map(),
            freeBlocks: [{
                    id: this.generateBlockId(),
                    poolId,
                    offset: 0,
                    size,
                    status: 'free',
                    createdAt: new Date(),
                    lastAccessed: new Date(),
                    accessCount: 0,
                    priority: 0,
                    metadata: {}
                }],
            fragmentation: 0,
            lastGC: new Date(),
            metadata: {}
        };
        this.pools.set(poolId, pool);
        this.updateMetrics();
        console.log(`Memory pool created: ${name} (${this.formatBytes(size)})`);
        this.emit('poolCreated', pool);
        return poolId;
    }
    destroyPool(poolId) {
        const pool = this.pools.get(poolId);
        if (!pool)
            return;
        // Deallocate all blocks
        for (const block of pool.allocatedBlocks.values()) {
            this.deallocateBlock(pool, block);
        }
        this.pools.delete(poolId);
        this.updateMetrics();
        console.log(`Memory pool destroyed: ${pool.name}`);
        this.emit('poolDestroyed', pool);
    }
    // Memory Allocation
    allocate(size, poolType, alignment = 1) {
        // Select appropriate pool
        const pool = this.selectPool(size, poolType);
        if (!pool) {
            this.emit('allocationFailed', { size, poolType, reason: 'No suitable pool' });
            return null;
        }
        // Attempt allocation
        const block = this.allocationStrategy.allocate(pool, size, alignment);
        if (!block) {
            // Try garbage collection
            if (this.gcStrategy.shouldCollect(pool)) {
                const freed = this.gcStrategy.collect(pool);
                console.log(`GC freed ${this.formatBytes(freed)} in pool ${pool.name}`);
                // Retry allocation
                const retryBlock = this.allocationStrategy.allocate(pool, size, alignment);
                if (retryBlock) {
                    return this.completeAllocation(pool, retryBlock, size);
                }
            }
            this.emit('allocationFailed', { size, poolType, reason: 'Insufficient memory' });
            return null;
        }
        return this.completeAllocation(pool, block, size);
    }
    completeAllocation(pool, block, requestedSize) {
        const handle = this.generateAllocationHandle();
        // Create allocation record
        const allocation = {
            blockId: block.id,
            poolId: pool.id,
            size: requestedSize,
            offset: block.offset,
            data: this.createDataBuffer(pool.type, block.size),
            handle
        };
        // Update pool state
        pool.allocatedBlocks.set(block.id, block);
        pool.usedSize += block.size;
        pool.availableSize -= block.size;
        pool.fragmentation = this.calculateFragmentation(pool);
        // Store allocation
        this.allocations.set(handle, allocation);
        this.updateMetrics();
        console.log(`Allocated ${this.formatBytes(requestedSize)} in ${pool.name}`);
        this.emit('memoryAllocated', { handle, size: requestedSize, pool: pool.name });
        return handle;
    }
    deallocate(handle) {
        const allocation = this.allocations.get(handle);
        if (!allocation)
            return;
        const pool = this.pools.get(allocation.poolId);
        if (!pool)
            return;
        const block = pool.allocatedBlocks.get(allocation.blockId);
        if (!block)
            return;
        this.deallocateBlock(pool, block);
        this.allocations.delete(handle);
        console.log(`Deallocated ${this.formatBytes(allocation.size)} from ${pool.name}`);
        this.emit('memoryDeallocated', { handle, size: allocation.size, pool: pool.name });
    }
    deallocateBlock(pool, block) {
        // Update block status
        block.status = 'free';
        block.owner = undefined;
        block.data = undefined;
        // Move to free blocks
        pool.allocatedBlocks.delete(block.id);
        pool.freeBlocks.push(block);
        // Update pool metrics
        pool.usedSize -= block.size;
        pool.availableSize += block.size;
        pool.fragmentation = this.calculateFragmentation(pool);
        this.updateMetrics();
    }
    // Cache Management
    cacheSet(key, data, priority = 0, ttl) {
        const size = this.estimateDataSize(data);
        // Check cache size limits
        if (this.getCurrentCacheSize() + size > this.maxCacheSize) {
            this.evictCache(size);
        }
        const entry = {
            key,
            data,
            size,
            createdAt: new Date(),
            lastAccessed: new Date(),
            accessCount: 1,
            priority,
            ttl: ttl || this.defaultTTL,
            metadata: {}
        };
        this.cache.set(key, entry);
        console.log(`Cached data: ${key} (${this.formatBytes(size)})`);
        this.emit('cacheSet', { key, size });
    }
    cacheGet(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.emit('cacheMiss', { key });
            return null;
        }
        // Check TTL
        if (entry.ttl && Date.now() - entry.createdAt.getTime() > entry.ttl) {
            this.cache.delete(key);
            this.emit('cacheExpired', { key });
            return null;
        }
        // Update access info
        entry.lastAccessed = new Date();
        entry.accessCount++;
        this.emit('cacheHit', { key });
        return entry.data;
    }
    cacheDelete(key) {
        const entry = this.cache.get(key);
        if (entry) {
            this.cache.delete(key);
            this.emit('cacheDelete', { key, size: entry.size });
        }
    }
    evictCache(targetSize) {
        const keysToEvict = this.cacheEvictionPolicy.selectForEviction(this.cache, targetSize);
        for (const key of keysToEvict) {
            const entry = this.cache.get(key);
            if (entry) {
                this.cache.delete(key);
                this.emit('cacheEviction', { key, size: entry.size, reason: 'size_limit' });
            }
        }
    }
    // Memory Operations
    startMemoryManager() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        // Start garbage collection
        this.gcInterval = setInterval(() => {
            this.performGarbageCollection();
        }, 60000); // Every minute
        // Start metrics collection
        this.metricsInterval = setInterval(() => {
            this.updateMetrics();
            this.cleanExpiredCache();
        }, 30000); // Every 30 seconds
        console.log('G3D Memory Manager started');
        this.emit('managerStarted');
    }
    stopMemoryManager() {
        if (!this.isRunning)
            return;
        this.isRunning = false;
        if (this.gcInterval) {
            clearInterval(this.gcInterval);
            this.gcInterval = null;
        }
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }
        console.log('G3D Memory Manager stopped');
        this.emit('managerStopped');
    }
    performGarbageCollection() {
        let totalFreed = 0;
        for (const pool of this.pools.values()) {
            if (this.gcStrategy.shouldCollect(pool)) {
                const freed = this.gcStrategy.collect(pool);
                totalFreed += freed;
                if (freed > 0) {
                    console.log(`GC: Freed ${this.formatBytes(freed)} in ${pool.name}`);
                    this.emit('garbageCollected', { poolId: pool.id, freed });
                }
            }
        }
        if (totalFreed > 0) {
            this.updateMetrics();
        }
    }
    cleanExpiredCache() {
        const now = Date.now();
        const expiredKeys = [];
        for (const [key, entry] of this.cache) {
            if (entry.ttl && now - entry.createdAt.getTime() > entry.ttl) {
                expiredKeys.push(key);
            }
        }
        for (const key of expiredKeys) {
            this.cacheDelete(key);
        }
    }
    // Utility Methods
    selectPool(size, preferredType) {
        const pools = Array.from(this.pools.values());
        // Filter by type if specified
        const candidatePools = preferredType
            ? pools.filter(p => p.type === preferredType)
            : pools;
        // Filter by available space
        const suitablePools = candidatePools.filter(p => p.availableSize >= size);
        if (suitablePools.length === 0)
            return null;
        // Select pool with best fit (least fragmentation, most available space)
        return suitablePools.reduce((best, current) => {
            const bestScore = (1 - best.fragmentation) * best.availableSize;
            const currentScore = (1 - current.fragmentation) * current.availableSize;
            return currentScore > bestScore ? current : best;
        });
    }
    calculateFragmentation(pool) {
        if (pool.freeBlocks.length <= 1)
            return 0;
        const totalFreeSize = pool.freeBlocks.reduce((sum, block) => sum + block.size, 0);
        const largestFreeBlock = Math.max(...pool.freeBlocks.map(block => block.size));
        if (totalFreeSize === 0)
            return 0;
        return 1 - (largestFreeBlock / totalFreeSize);
    }
    coalesceBlocks(pool) {
        // Sort free blocks by offset
        pool.freeBlocks.sort((a, b) => a.offset - b.offset);
        const coalesced = [];
        let current = pool.freeBlocks[0];
        for (let i = 1; i < pool.freeBlocks.length; i++) {
            const next = pool.freeBlocks[i];
            // Check if blocks are adjacent
            if (current.offset + current.size === next.offset) {
                // Merge blocks
                current.size += next.size;
            }
            else {
                coalesced.push(current);
                current = next;
            }
        }
        if (current) {
            coalesced.push(current);
        }
        pool.freeBlocks = coalesced;
    }
    createDataBuffer(poolType, size) {
        switch (poolType) {
            case 'gpu':
                // In real implementation, this would create WebGL buffers/textures
                return new ArrayBuffer(size);
            case 'cpu':
                return new ArrayBuffer(size);
            case 'shared':
                // In real implementation, this would use SharedArrayBuffer
                return new ArrayBuffer(size);
            default:
                return new ArrayBuffer(size);
        }
    }
    estimateDataSize(data) {
        if (data instanceof ArrayBuffer)
            return data.byteLength;
        if (data instanceof Float32Array)
            return data.byteLength;
        if (data instanceof Uint8Array)
            return data.byteLength;
        if (typeof data === 'string')
            return data.length * 2; // UTF-16
        if (typeof data === 'object')
            return JSON.stringify(data).length * 2;
        return 64; // Default estimate
    }
    getCurrentCacheSize() {
        return Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
    }
    updateMetrics() {
        const totalMemory = Array.from(this.pools.values()).reduce((sum, pool) => sum + pool.totalSize, 0);
        const usedMemory = Array.from(this.pools.values()).reduce((sum, pool) => sum + pool.usedSize, 0);
        const availableMemory = totalMemory - usedMemory;
        const totalFragmentation = Array.from(this.pools.values())
            .reduce((sum, pool, _, pools) => sum + pool.fragmentation / pools.length, 0);
        this.metrics = {
            totalMemory,
            usedMemory,
            availableMemory,
            fragmentation: totalFragmentation,
            cacheHitRate: this.calculateCacheHitRate(),
            allocationRate: this.calculateAllocationRate(),
            deallocationRate: this.calculateDeallocationRate(),
            gcFrequency: this.calculateGCFrequency(),
            poolUtilization: this.calculatePoolUtilization()
        };
        this.emit('metricsUpdated', this.metrics);
    }
    // Event Handlers
    handleMemoryLow(event) {
        console.warn('Memory low warning:', event);
        this.performGarbageCollection();
    }
    handleFragmentationHigh(event) {
        console.warn('High fragmentation detected:', event);
        // Force garbage collection on affected pool
        const pool = this.pools.get(event.poolId);
        if (pool) {
            this.gcStrategy.collect(pool);
        }
    }
    handleCacheEviction(event) {
        console.log('Cache eviction:', event);
    }
    handleAllocationFailed(event) {
        console.error('Allocation failed:', event);
        this.performGarbageCollection();
    }
    // Metrics Calculation
    calculateCacheHitRate() {
        // Implementation would track hit/miss ratios
        return 0.85; // Placeholder
    }
    calculateAllocationRate() {
        // Implementation would track allocations per second
        return 100; // Placeholder
    }
    calculateDeallocationRate() {
        // Implementation would track deallocations per second
        return 95; // Placeholder
    }
    calculateGCFrequency() {
        // Implementation would track GC runs per minute
        return 2; // Placeholder
    }
    calculatePoolUtilization() {
        const utilization = {};
        for (const [poolId, pool] of this.pools) {
            utilization[poolId] = pool.usedSize / pool.totalSize;
        }
        return utilization;
    }
    // Utility Functions
    generatePoolId() {
        return `pool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateBlockId() {
        return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateAllocationHandle() {
        return `alloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
    // Public API
    getMemoryStatus() {
        return {
            pools: Array.from(this.pools.values()),
            metrics: this.metrics,
            allocations: this.allocations.size,
            cacheSize: this.getCurrentCacheSize()
        };
    }
    getAllocation(handle) {
        return this.allocations.get(handle) || null;
    }
    defragment(poolId) {
        const pools = poolId ? [this.pools.get(poolId)].filter(Boolean) : Array.from(this.pools.values());
        for (const pool of pools) {
            this.coalesceBlocks(pool);
            console.log(`Defragmented pool: ${pool.name}`);
            this.emit('poolDefragmented', { poolId: pool.id });
        }
    }
    setMaxCacheSize(size) {
        this.maxCacheSize = size;
        // Evict if current cache exceeds new limit
        if (this.getCurrentCacheSize() > size) {
            this.evictCache(this.getCurrentCacheSize() - size);
        }
    }
    getPoolStats(poolId) {
        return this.pools.get(poolId) || null;
    }
}
