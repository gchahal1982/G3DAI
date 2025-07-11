import { EventEmitter } from 'events';
interface MemoryPool {
    id: string;
    name: string;
    type: 'cpu' | 'gpu' | 'shared';
    totalSize: number;
    usedSize: number;
    availableSize: number;
    allocatedBlocks: Map<string, MemoryBlock>;
    freeBlocks: MemoryBlock[];
    fragmentation: number;
    lastGC: Date;
    metadata: Record<string, any>;
}
interface MemoryBlock {
    id: string;
    poolId: string;
    offset: number;
    size: number;
    status: 'allocated' | 'free' | 'reserved';
    owner?: string;
    createdAt: Date;
    lastAccessed: Date;
    accessCount: number;
    priority: number;
    data?: ArrayBuffer | WebGLTexture | any;
    metadata: Record<string, any>;
}
interface MemoryAllocation {
    blockId: string;
    poolId: string;
    size: number;
    offset: number;
    data: any;
    handle: string;
}
interface MemoryMetrics {
    totalMemory: number;
    usedMemory: number;
    availableMemory: number;
    fragmentation: number;
    cacheHitRate: number;
    allocationRate: number;
    deallocationRate: number;
    gcFrequency: number;
    poolUtilization: Record<string, number>;
}
export declare class MemoryManager extends EventEmitter {
    private pools;
    private cache;
    private allocations;
    private metrics;
    private allocationStrategy;
    private gcStrategy;
    private cacheEvictionPolicy;
    private gcInterval;
    private metricsInterval;
    private isRunning;
    private maxCacheSize;
    private gcThreshold;
    private defaultTTL;
    constructor();
    private initializeMemoryManager;
    private setupEventHandlers;
    private setupAllocationStrategy;
    private setupGCStrategy;
    private setupCacheEvictionPolicy;
    private initializeMetrics;
    createPool(name: string, type: 'cpu' | 'gpu' | 'shared', size: number): string;
    destroyPool(poolId: string): void;
    allocate(size: number, poolType?: 'cpu' | 'gpu' | 'shared', alignment?: number): string | null;
    private completeAllocation;
    deallocate(handle: string): void;
    private deallocateBlock;
    cacheSet(key: string, data: any, priority?: number, ttl?: number): void;
    cacheGet(key: string): any;
    cacheDelete(key: string): void;
    private evictCache;
    startMemoryManager(): void;
    stopMemoryManager(): void;
    private performGarbageCollection;
    private cleanExpiredCache;
    private selectPool;
    private calculateFragmentation;
    private coalesceBlocks;
    private createDataBuffer;
    private estimateDataSize;
    private getCurrentCacheSize;
    private updateMetrics;
    private handleMemoryLow;
    private handleFragmentationHigh;
    private handleCacheEviction;
    private handleAllocationFailed;
    private calculateCacheHitRate;
    private calculateAllocationRate;
    private calculateDeallocationRate;
    private calculateGCFrequency;
    private calculatePoolUtilization;
    private generatePoolId;
    private generateBlockId;
    private generateAllocationHandle;
    private formatBytes;
    getMemoryStatus(): {
        pools: MemoryPool[];
        metrics: MemoryMetrics;
        allocations: number;
        cacheSize: number;
    };
    getAllocation(handle: string): MemoryAllocation | null;
    defragment(poolId?: string): void;
    setMaxCacheSize(size: number): void;
    getPoolStats(poolId: string): MemoryPool | null;
}
export {};
//# sourceMappingURL=MemoryManager.d.ts.map