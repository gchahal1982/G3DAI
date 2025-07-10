/**
 * G3D MedSight Pro - Memory Management System
 * Advanced memory management and optimization for medical 3D applications
 */

export interface MemoryConfig {
    maxTotalMemory: number;
    maxTextureMemory: number;
    maxBufferMemory: number;
    maxMedicalDataMemory: number;
    enableGarbageCollection: boolean;
    gcThreshold: number;
    enableMemoryProfiling: boolean;
    enableMemoryPooling: boolean;
    poolSizes: number[];
}

export interface MemoryBlock {
    id: string;
    type: 'texture' | 'buffer' | 'medical' | 'geometry' | 'shader' | 'other';
    size: number;
    data: ArrayBuffer | null;
    refCount: number;
    lastAccessed: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    medicalContext?: MedicalMemoryContext;
    pooled: boolean;
    allocated: boolean;
}

export interface MedicalMemoryContext {
    modality: string;
    studyId: string;
    seriesId: string;
    instanceId: string;
    dataType: 'volume' | 'slice' | 'annotation' | 'measurement' | 'analysis';
    clinicalPriority: 'low' | 'medium' | 'high' | 'critical';
    compressionLevel: number;
}

export interface MemoryPool {
    blockSize: number;
    maxBlocks: number;
    freeBlocks: MemoryBlock[];
    usedBlocks: MemoryBlock[];
    totalAllocated: number;
}

export interface MemoryStats {
    totalAllocated: number;
    totalUsed: number;
    totalFree: number;
    textureMemory: number;
    bufferMemory: number;
    medicalDataMemory: number;
    fragmentationRatio: number;
    gcCount: number;
    poolHitRatio: number;
}

export class MemoryManager {
    private config: MemoryConfig;
    private memoryBlocks: Map<string, MemoryBlock> = new Map();
    private memoryPools: Map<number, MemoryPool> = new Map();
    private totalAllocated: number = 0;
    private gcCount: number = 0;
    private accessCounter: number = 0;

    private compressionWorker: Worker | null = null;
    private isInitialized: boolean = false;

    constructor(config: Partial<MemoryConfig> = {}) {
        this.config = {
            maxTotalMemory: 2 * 1024 * 1024 * 1024, // 2GB
            maxTextureMemory: 1024 * 1024 * 1024, // 1GB
            maxBufferMemory: 512 * 1024 * 1024, // 512MB
            maxMedicalDataMemory: 1536 * 1024 * 1024, // 1.5GB
            enableGarbageCollection: true,
            gcThreshold: 0.8, // 80% of max memory
            enableMemoryProfiling: true,
            enableMemoryPooling: true,
            poolSizes: [
                1024,      // 1KB
                4096,      // 4KB
                16384,     // 16KB
                65536,     // 64KB
                262144,    // 256KB
                1048576,   // 1MB
                4194304,   // 4MB
                16777216,  // 16MB
                67108864   // 64MB
            ],
            ...config
        };
    }

    async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Memory Manager...');

            // Initialize memory pools
            if (this.config.enableMemoryPooling) {
                this.initializeMemoryPools();
            }

            // Initialize compression worker
            await this.initializeCompressionWorker();

            this.isInitialized = true;
            console.log('G3D Memory Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Memory Manager:', error);
            throw error;
        }
    }

    private initializeMemoryPools(): void {
        for (const size of this.config.poolSizes) {
            const pool: MemoryPool = {
                blockSize: size,
                maxBlocks: Math.floor(this.config.maxTotalMemory / (size * 10)), // 10% of max memory per pool
                freeBlocks: [],
                usedBlocks: [],
                totalAllocated: 0
            };

            this.memoryPools.set(size, pool);
        }

        console.log(`Initialized ${this.config.poolSizes.length} memory pools`);
    }

    private async initializeCompressionWorker(): Promise<void> {
        try {
            const workerScript = `
        self.onmessage = function(e) {
          const { action, data, compressionLevel } = e.data;
          
          if (action === 'compress') {
            // Simplified compression (in real implementation, use proper compression)
            const compressed = new Uint8Array(data.length / 2);
            for (let i = 0; i < compressed.length; i++) {
              compressed[i] = data[i * 2];
            }
            
            self.postMessage({
              action: 'compressed',
              data: compressed.buffer,
              originalSize: data.length,
              compressedSize: compressed.length
            });
          } else if (action === 'decompress') {
            // Simplified decompression
            const decompressed = new Uint8Array(data.length * 2);
            for (let i = 0; i < data.length; i++) {
              decompressed[i * 2] = data[i];
              decompressed[i * 2 + 1] = data[i];
            }
            
            self.postMessage({
              action: 'decompressed',
              data: decompressed.buffer
            });
          }
        };
      `;

            const blob = new Blob([workerScript], { type: 'application/javascript' });
            this.compressionWorker = new Worker(URL.createObjectURL(blob));

            console.log('Compression worker initialized');
        } catch (error) {
            console.warn('Failed to initialize compression worker:', error);
        }
    }

    // Memory Allocation
    public allocate(
        size: number,
        type: MemoryBlock['type'],
        priority: MemoryBlock['priority'] = 'medium',
        medicalContext?: MedicalMemoryContext
    ): string | null {
        if (!this.isInitialized) {
            throw new Error('Memory manager not initialized');
        }

        // Check if allocation would exceed limits
        if (this.totalAllocated + size > this.config.maxTotalMemory) {
            if (this.config.enableGarbageCollection) {
                this.runGarbageCollection();

                // Check again after GC
                if (this.totalAllocated + size > this.config.maxTotalMemory) {
                    console.warn('Memory allocation failed: insufficient memory after GC');
                    return null;
                }
            } else {
                console.warn('Memory allocation failed: insufficient memory');
                return null;
            }
        }

        // Check type-specific limits
        if (!this.checkTypeSpecificLimits(size, type)) {
            console.warn(`Memory allocation failed: ${type} memory limit exceeded`);
            return null;
        }

        // Try to allocate from pool first
        if (this.config.enableMemoryPooling) {
            const pooledBlockId = this.allocateFromPool(size, type, priority, medicalContext);
            if (pooledBlockId) {
                return pooledBlockId;
            }
        }

        // Allocate new block
        const blockId = this.generateBlockId();
        const block: MemoryBlock = {
            id: blockId,
            type,
            size,
            data: new ArrayBuffer(size),
            refCount: 1,
            lastAccessed: this.accessCounter++,
            priority,
            medicalContext,
            pooled: false,
            allocated: true
        };

        this.memoryBlocks.set(blockId, block);
        this.totalAllocated += size;

        if (this.config.enableMemoryProfiling) {
            console.log(`Allocated ${size} bytes for ${type} (ID: ${blockId})`);
        }

        return blockId;
    }

    private allocateFromPool(
        size: number,
        type: MemoryBlock['type'],
        priority: MemoryBlock['priority'],
        medicalContext?: MedicalMemoryContext
    ): string | null {
        // Find the smallest pool that can accommodate the size
        const suitablePoolSize = this.config.poolSizes.find(poolSize => poolSize >= size);
        if (!suitablePoolSize) {
            return null;
        }

        const pool = this.memoryPools.get(suitablePoolSize);
        if (!pool || pool.freeBlocks.length === 0) {
            // Try to create new block in pool
            if (pool && pool.totalAllocated + suitablePoolSize <= pool.maxBlocks * suitablePoolSize) {
                const blockId = this.generateBlockId();
                const block: MemoryBlock = {
                    id: blockId,
                    type,
                    size: suitablePoolSize,
                    data: new ArrayBuffer(suitablePoolSize),
                    refCount: 1,
                    lastAccessed: this.accessCounter++,
                    priority,
                    medicalContext,
                    pooled: true,
                    allocated: true
                };

                pool.usedBlocks.push(block);
                pool.totalAllocated += suitablePoolSize;
                this.memoryBlocks.set(blockId, block);
                this.totalAllocated += suitablePoolSize;

                return blockId;
            }
            return null;
        }

        // Reuse existing block from pool
        const block = pool.freeBlocks.pop()!;
        block.type = type;
        block.priority = priority;
        block.medicalContext = medicalContext;
        block.refCount = 1;
        block.lastAccessed = this.accessCounter++;
        block.allocated = true;

        pool.usedBlocks.push(block);
        this.memoryBlocks.set(block.id, block);

        return block.id;
    }

    private checkTypeSpecificLimits(size: number, type: MemoryBlock['type']): boolean {
        const currentTypeMemory = this.getMemoryUsageByType(type);

        switch (type) {
            case 'texture':
                return currentTypeMemory + size <= this.config.maxTextureMemory;
            case 'buffer':
                return currentTypeMemory + size <= this.config.maxBufferMemory;
            case 'medical':
                return currentTypeMemory + size <= this.config.maxMedicalDataMemory;
            default:
                return true;
        }
    }

    private getMemoryUsageByType(type: MemoryBlock['type']): number {
        let usage = 0;
        for (const block of this.memoryBlocks.values()) {
            if (block.type === type && block.allocated) {
                usage += block.size;
            }
        }
        return usage;
    }

    // Memory Deallocation
    public deallocate(blockId: string): boolean {
        const block = this.memoryBlocks.get(blockId);
        if (!block || !block.allocated) {
            return false;
        }

        block.refCount--;

        if (block.refCount <= 0) {
            if (block.pooled) {
                this.returnToPool(block);
            } else {
                this.memoryBlocks.delete(blockId);
                this.totalAllocated -= block.size;
            }

            if (this.config.enableMemoryProfiling) {
                console.log(`Deallocated ${block.size} bytes for ${block.type} (ID: ${blockId})`);
            }
        }

        return true;
    }

    private returnToPool(block: MemoryBlock): void {
        const pool = this.memoryPools.get(block.size);
        if (!pool) return;

        // Remove from used blocks
        const usedIndex = pool.usedBlocks.indexOf(block);
        if (usedIndex !== -1) {
            pool.usedBlocks.splice(usedIndex, 1);
        }

        // Reset block state
        block.refCount = 0;
        block.allocated = false;
        block.medicalContext = undefined;

        // Add to free blocks
        pool.freeBlocks.push(block);
    }

    // Memory Access
    public getBlock(blockId: string): MemoryBlock | null {
        const block = this.memoryBlocks.get(blockId);
        if (block && block.allocated) {
            block.lastAccessed = this.accessCounter++;
            return block;
        }
        return null;
    }

    public incrementRef(blockId: string): boolean {
        const block = this.memoryBlocks.get(blockId);
        if (block && block.allocated) {
            block.refCount++;
            block.lastAccessed = this.accessCounter++;
            return true;
        }
        return false;
    }

    // Medical Data Compression
    public async compressMedicalData(
        blockId: string,
        compressionLevel: number = 5
    ): Promise<boolean> {
        if (!this.compressionWorker) {
            console.warn('Compression worker not available');
            return false;
        }

        const block = this.memoryBlocks.get(blockId);
        if (!block || !block.data || block.type !== 'medical') {
            return false;
        }

        return new Promise((resolve) => {
            const handleMessage = (e: MessageEvent) => {
                if (e.data.action === 'compressed') {
                    const originalSize = block.size;
                    block.data = e.data.data;
                    block.size = e.data.compressedSize;

                    this.totalAllocated -= (originalSize - block.size);

                    console.log(`Compressed medical data: ${originalSize} -> ${block.size} bytes`);
                    this.compressionWorker!.removeEventListener('message', handleMessage);
                    resolve(true);
                }
            };

            this.compressionWorker!.addEventListener('message', handleMessage);
            this.compressionWorker!.postMessage({
                action: 'compress',
                data: new Uint8Array(block.data!),
                compressionLevel
            });
        });
    }

    public async decompressMedicalData(blockId: string): Promise<boolean> {
        if (!this.compressionWorker) {
            console.warn('Compression worker not available');
            return false;
        }

        const block = this.memoryBlocks.get(blockId);
        if (!block || !block.data || block.type !== 'medical') {
            return false;
        }

        return new Promise((resolve) => {
            const handleMessage = (e: MessageEvent) => {
                if (e.data.action === 'decompressed') {
                    const originalSize = block.size;
                    block.data = e.data.data;
                    block.size = e.data.data.byteLength;

                    this.totalAllocated += (block.size - originalSize);

                    console.log(`Decompressed medical data: ${originalSize} -> ${block.size} bytes`);
                    this.compressionWorker!.removeEventListener('message', handleMessage);
                    resolve(true);
                }
            };

            this.compressionWorker!.addEventListener('message', handleMessage);
            this.compressionWorker!.postMessage({
                action: 'decompress',
                data: new Uint8Array(block.data!)
            });
        });
    }

    // Garbage Collection
    public runGarbageCollection(): void {
        console.log('Running garbage collection...');

        const blocksToRemove: string[] = [];
        const currentTime = this.accessCounter;

        // Sort blocks by priority and last access time
        const sortedBlocks = Array.from(this.memoryBlocks.entries())
            .filter(([_, block]) => block.allocated && block.refCount === 0)
            .sort(([_, a], [__, b]) => {
                // Priority: critical > high > medium > low
                const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                const aPriority = priorityOrder[a.priority];
                const bPriority = priorityOrder[b.priority];

                if (aPriority !== bPriority) {
                    return aPriority - bPriority; // Lower priority first
                }

                // Older access time first
                return a.lastAccessed - b.lastAccessed;
            });

        let freedMemory = 0;
        const targetMemory = this.config.maxTotalMemory * this.config.gcThreshold;

        for (const [blockId, block] of sortedBlocks) {
            if (this.totalAllocated - freedMemory <= targetMemory) {
                break;
            }

            blocksToRemove.push(blockId);
            freedMemory += block.size;
        }

        // Remove selected blocks
        for (const blockId of blocksToRemove) {
            this.deallocate(blockId);
        }

        this.gcCount++;
        console.log(`GC completed: freed ${freedMemory} bytes, removed ${blocksToRemove.length} blocks`);
    }

    // Memory Statistics
    public getMemoryStats(): MemoryStats {
        const stats: MemoryStats = {
            totalAllocated: this.totalAllocated,
            totalUsed: 0,
            totalFree: this.config.maxTotalMemory - this.totalAllocated,
            textureMemory: this.getMemoryUsageByType('texture'),
            bufferMemory: this.getMemoryUsageByType('buffer'),
            medicalDataMemory: this.getMemoryUsageByType('medical'),
            fragmentationRatio: this.calculateFragmentationRatio(),
            gcCount: this.gcCount,
            poolHitRatio: this.calculatePoolHitRatio()
        };

        // Calculate used memory (blocks with refCount > 0)
        for (const block of this.memoryBlocks.values()) {
            if (block.allocated && block.refCount > 0) {
                stats.totalUsed += block.size;
            }
        }

        return stats;
    }

    private calculateFragmentationRatio(): number {
        if (!this.config.enableMemoryPooling) return 0;

        let totalFragmentation = 0;
        let totalPoolMemory = 0;

        for (const pool of this.memoryPools.values()) {
            const wastedSpace = pool.freeBlocks.length * pool.blockSize;
            totalFragmentation += wastedSpace;
            totalPoolMemory += pool.totalAllocated;
        }

        return totalPoolMemory > 0 ? totalFragmentation / totalPoolMemory : 0;
    }

    private calculatePoolHitRatio(): number {
        if (!this.config.enableMemoryPooling) return 0;

        let pooledBlocks = 0;
        let totalBlocks = 0;

        for (const block of this.memoryBlocks.values()) {
            if (block.allocated) {
                totalBlocks++;
                if (block.pooled) {
                    pooledBlocks++;
                }
            }
        }

        return totalBlocks > 0 ? pooledBlocks / totalBlocks : 0;
    }

    // Medical-specific Memory Management
    public allocateMedicalVolume(
        dimensions: [number, number, number],
        bytesPerVoxel: number,
        medicalContext: MedicalMemoryContext
    ): string | null {
        const size = dimensions[0] * dimensions[1] * dimensions[2] * bytesPerVoxel;

        return this.allocate(size, 'medical', 'high', medicalContext);
    }

    public getMedicalDataByStudy(studyId: string): MemoryBlock[] {
        const blocks: MemoryBlock[] = [];

        for (const block of this.memoryBlocks.values()) {
            if (block.allocated &&
                block.type === 'medical' &&
                block.medicalContext?.studyId === studyId) {
                blocks.push(block);
            }
        }

        return blocks;
    }

    public freeMedicalDataByStudy(studyId: string): number {
        let freedMemory = 0;
        const blocksToFree: string[] = [];

        for (const [blockId, block] of this.memoryBlocks.entries()) {
            if (block.allocated &&
                block.type === 'medical' &&
                block.medicalContext?.studyId === studyId) {
                blocksToFree.push(blockId);
                freedMemory += block.size;
            }
        }

        for (const blockId of blocksToFree) {
            this.deallocate(blockId);
        }

        console.log(`Freed ${freedMemory} bytes of medical data for study ${studyId}`);
        return freedMemory;
    }

    // Utility Methods
    private generateBlockId(): string {
        return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    public defragment(): void {
        console.log('Starting memory defragmentation...');

        // For pooled memory, reorganize free blocks
        for (const pool of this.memoryPools.values()) {
            // Sort free blocks by ID for better locality
            pool.freeBlocks.sort((a, b) => a.id.localeCompare(b.id));
        }

        console.log('Memory defragmentation completed');
    }

    public getMemoryReport(): string {
        const stats = this.getMemoryStats();
        const report = [
            '=== G3D Memory Manager Report ===',
            `Total Allocated: ${(stats.totalAllocated / 1024 / 1024).toFixed(2)} MB`,
            `Total Used: ${(stats.totalUsed / 1024 / 1024).toFixed(2)} MB`,
            `Total Free: ${(stats.totalFree / 1024 / 1024).toFixed(2)} MB`,
            `Texture Memory: ${(stats.textureMemory / 1024 / 1024).toFixed(2)} MB`,
            `Buffer Memory: ${(stats.bufferMemory / 1024 / 1024).toFixed(2)} MB`,
            `Medical Data Memory: ${(stats.medicalDataMemory / 1024 / 1024).toFixed(2)} MB`,
            `Fragmentation Ratio: ${(stats.fragmentationRatio * 100).toFixed(2)}%`,
            `Pool Hit Ratio: ${(stats.poolHitRatio * 100).toFixed(2)}%`,
            `GC Count: ${stats.gcCount}`,
            `Active Blocks: ${this.memoryBlocks.size}`,
            '================================'
        ];

        return report.join('\n');
    }

    public dispose(): void {
        console.log('Disposing G3D Memory Manager...');

        // Clear all memory blocks
        this.memoryBlocks.clear();

        // Clear memory pools
        this.memoryPools.clear();

        // Terminate compression worker
        if (this.compressionWorker) {
            this.compressionWorker.terminate();
            this.compressionWorker = null;
        }

        this.totalAllocated = 0;
        this.gcCount = 0;
        this.accessCounter = 0;
        this.isInitialized = false;

        console.log('G3D Memory Manager disposed');
    }
}

export default MemoryManager;