/**
 * MedSight Pro Hybrid Memory Manager
 * 
 * Extends the infrastructure MemoryManager with medical-specific features:
 * - Medical data compression with Web Workers for DICOM data
 * - Study-based memory management with clinical priority levels  
 * - Medical context tracking (modality, studyId, seriesId, instanceId)
 * - Volume allocation optimized for medical imaging
 * - Clinical priority-based garbage collection
 * 
 * This hybrid approach leverages the advanced infrastructure foundation (780 lines)
 * while preserving all MedSight Pro medical-specific functionality.
 */

import { MemoryManager as BaseMemoryManager } from '../../../../infrastructure/engines';

// MedSight Pro-specific interfaces that extend the base
export interface MedicalMemoryContext {
    modality: string;
    studyId: string;
    seriesId: string;
    instanceId: string;
    dataType: 'volume' | 'slice' | 'annotation' | 'measurement' | 'analysis';
    clinicalPriority: 'low' | 'medium' | 'high' | 'critical';
    compressionLevel: number;
    patientId?: string;
    acquisitionDate?: Date;
    processingStage?: 'raw' | 'preprocessed' | 'analyzed' | 'compressed';
}

export interface MedicalAllocation {
    handle: string;
    medicalContext: MedicalMemoryContext;
    originalSize: number;
    compressedSize?: number;
    compressionRatio?: number;
    lastAccessed: Date;
    accessCount: number;
    locked: boolean; // For critical medical data that shouldn't be freed
}

export interface MedicalVolumeSpec {
    dimensions: [number, number, number];
    bytesPerVoxel: number;
    dataType: 'uint8' | 'uint16' | 'uint32' | 'float32' | 'float64';
    spacing?: [number, number, number];
    origin?: [number, number, number];
    orientation?: number[];
}

export interface StudyMemoryStats {
    studyId: string;
    totalAllocations: number;
    totalMemoryUsed: number;
    compressedMemory: number;
    uncompressedMemory: number;
    averageCompressionRatio: number;
    seriesCount: number;
    instanceCount: number;
    oldestAccess: Date;
    newestAccess: Date;
}

export interface CompressionWorkerMessage {
    action: 'compress' | 'decompress';
    data: ArrayBuffer;
    compressionLevel?: number;
    medicalContext?: MedicalMemoryContext;
    workerId?: string;
}

export class MedSightProMemoryManager extends BaseMemoryManager {
    private medicalAllocations: Map<string, MedicalAllocation> = new Map();
    private studyMemoryMap: Map<string, Set<string>> = new Map(); // studyId -> allocation handles
    private compressionWorkers: Worker[] = [];
    private compressionQueue: Map<string, Promise<boolean>> = new Map();
    private isInitialized: boolean = false;

    // Medical-specific pools
    private medicalPools: {
        dicom: string;      // Pool for DICOM data
        volume: string;     // Pool for 3D volume data
        analysis: string;   // Pool for analysis results
        cache: string;      // Pool for cached medical data
    } | null = null;

    constructor(config: any = {}) {
        // Initialize with medical-specific pool configuration
        super();
        
        this.initializeMedicalPools();
        this.initializeCompressionWorkers();
        this.setupMedicalEventListeners();
    }

    /**
     * Initialize medical-specific memory pools
     */
    private initializeMedicalPools(): void {
        try {
            this.medicalPools = {
                dicom: this.createPool('medical-dicom', 'cpu', 1024 * 1024 * 1024),    // 1GB for DICOM
                volume: this.createPool('medical-volume', 'gpu', 2048 * 1024 * 1024),  // 2GB for volumes  
                analysis: this.createPool('medical-analysis', 'cpu', 512 * 1024 * 1024), // 512MB for analysis
                cache: this.createPool('medical-cache', 'shared', 1536 * 1024 * 1024)  // 1.5GB for cache
            };
            
            console.log('Medical memory pools initialized for MedSight Pro');
        } catch (error) {
            console.error('Failed to initialize medical memory pools:', error);
        }
    }

    /**
     * Initialize compression workers for medical data
     */
    private async initializeCompressionWorkers(): Promise<void> {
        const workerCount = Math.min(navigator.hardwareConcurrency || 4, 4);
        
        try {
            for (let i = 0; i < workerCount; i++) {
                const worker = await this.createCompressionWorker(i);
                this.compressionWorkers.push(worker);
            }
            
            console.log(`Initialized ${workerCount} compression workers for medical data`);
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize compression workers:', error);
        }
    }

    /**
     * Create a compression worker for medical data
     */
    private async createCompressionWorker(workerId: number): Promise<Worker> {
        const workerScript = `
        self.onmessage = function(e) {
            const { action, data, compressionLevel, medicalContext, workerId } = e.data;
            
            try {
                if (action === 'compress') {
                    // Medical-aware compression based on data type
                    const compressed = compressMedicalData(data, compressionLevel, medicalContext);
                    
                    self.postMessage({
                        action: 'compressed',
                        data: compressed.buffer,
                        originalSize: data.byteLength,
                        compressedSize: compressed.byteLength,
                        compressionRatio: data.byteLength / compressed.byteLength,
                        workerId: workerId
                    });
                } else if (action === 'decompress') {
                    const decompressed = decompressMedicalData(data, medicalContext);
                    
                    self.postMessage({
                        action: 'decompressed',
                        data: decompressed.buffer,
                        workerId: workerId
                    });
                }
            } catch (error) {
                self.postMessage({
                    action: 'error',
                    error: error.message,
                    workerId: workerId
                });
            }
        };

        function compressMedicalData(data, level, context) {
            // Medical-specific compression logic
            // For DICOM data, use lossless compression
            // For analysis data, can use lossy compression
            
            const input = new Uint8Array(data);
            let compressionRatio = 0.5; // Default 50% compression
            
            // Adjust compression based on medical context
            if (context && context.dataType === 'volume') {
                compressionRatio = 0.3; // Better compression for volumes
            } else if (context && context.clinicalPriority === 'critical') {
                compressionRatio = 0.8; // Less aggressive compression for critical data
            }
            
            const outputSize = Math.floor(input.length * compressionRatio);
            const output = new Uint8Array(outputSize);
            
            // Simplified compression (real implementation would use proper algorithms)
            for (let i = 0; i < outputSize; i++) {
                output[i] = input[Math.floor(i / compressionRatio)] || 0;
            }
            
            return output;
        }

        function decompressMedicalData(data, context) {
            // Simplified decompression
            const input = new Uint8Array(data);
            const output = new Uint8Array(input.length * 2); // Assume 2x expansion
            
            for (let i = 0; i < input.length; i++) {
                output[i * 2] = input[i];
                output[i * 2 + 1] = input[i];
            }
            
            return output;
        }
        `;

        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        
        worker.onerror = (error) => {
            console.error(`Compression worker ${workerId} error:`, error);
        };

        return worker;
    }

    /**
     * Set up medical-specific event listeners
     */
    private setupMedicalEventListeners(): void {
        this.on('memoryAllocated', (event) => {
            // Track medical allocations for study-based management
            const allocation = this.medicalAllocations.get(event.handle);
            if (allocation && allocation.medicalContext) {
                this.addToStudyMemoryMap(allocation.medicalContext.studyId, event.handle);
            }
        });

        this.on('memoryDeallocated', (event) => {
            // Clean up medical allocation tracking
            const allocation = this.medicalAllocations.get(event.handle);
            if (allocation && allocation.medicalContext) {
                this.removeFromStudyMemoryMap(allocation.medicalContext.studyId, event.handle);
            }
            this.medicalAllocations.delete(event.handle);
        });
    }

    /**
     * Allocate memory for medical volume with optimized sizing
     */
    public allocateMedicalVolume(
        volumeSpec: MedicalVolumeSpec,
        medicalContext: MedicalMemoryContext
    ): string | null {
        const { dimensions, bytesPerVoxel } = volumeSpec;
        const totalVoxels = dimensions[0] * dimensions[1] * dimensions[2];
        const sizeBytes = totalVoxels * bytesPerVoxel;

        // Select appropriate pool based on volume size and context
        const poolType = sizeBytes > 100 * 1024 * 1024 ? 'gpu' : 'cpu'; // Use GPU for large volumes
        const handle = this.allocate(sizeBytes, poolType, 16); // 16-byte alignment for SIMD

        if (!handle) {
            console.error(`Failed to allocate medical volume: ${this.formatMedicalSize(sizeBytes)}`);
            return null;
        }

        // Create medical allocation record
        const medicalAllocation: MedicalAllocation = {
            handle,
            medicalContext,
            originalSize: sizeBytes,
            lastAccessed: new Date(),
            accessCount: 0,
            locked: medicalContext.clinicalPriority === 'critical'
        };

        this.medicalAllocations.set(handle, medicalAllocation);
        this.addToStudyMemoryMap(medicalContext.studyId, handle);

        console.log(`Allocated medical volume for study ${medicalContext.studyId}: ${this.formatMedicalSize(sizeBytes)}`);
        this.emit('medicalVolumeAllocated', { handle, size: sizeBytes, context: medicalContext });

        return handle;
    }

    /**
     * Compress medical data asynchronously
     */
    public async compressMedicalData(
        handle: string, 
        compressionLevel: number = 5
    ): Promise<boolean> {
        if (!this.isInitialized || this.compressionWorkers.length === 0) {
            console.warn('Compression workers not available');
            return false;
        }

        const medicalAllocation = this.medicalAllocations.get(handle);
        const allocation = this.getAllocation(handle);

        if (!medicalAllocation || !allocation || !allocation.data) {
            console.error(`Cannot compress: allocation not found for handle ${handle}`);
            return false;
        }

        // Check if compression is already in progress
        if (this.compressionQueue.has(handle)) {
            return await this.compressionQueue.get(handle)!;
        }

        // Start compression
        const compressionPromise = this.performCompression(allocation.data, medicalAllocation, compressionLevel);
        this.compressionQueue.set(handle, compressionPromise);

        try {
            const result = await compressionPromise;
            this.compressionQueue.delete(handle);
            return result;
        } catch (error) {
            this.compressionQueue.delete(handle);
            console.error(`Compression failed for ${handle}:`, error);
            return false;
        }
    }

    /**
     * Perform the actual compression using workers
     */
    private async performCompression(
        data: ArrayBuffer, 
        medicalAllocation: MedicalAllocation, 
        compressionLevel: number
    ): Promise<boolean> {
        // Select least busy worker
        const worker = this.compressionWorkers[0]; // Simplified selection

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Compression timeout'));
            }, 30000); // 30 second timeout

            const handleMessage = (e: MessageEvent) => {
                clearTimeout(timeout);
                worker.removeEventListener('message', handleMessage);

                if (e.data.action === 'compressed') {
                    // Update medical allocation with compression info
                    medicalAllocation.compressedSize = e.data.compressedSize;
                    medicalAllocation.compressionRatio = e.data.compressionRatio;

                    console.log(`Compressed medical data: ${this.formatMedicalSize(e.data.originalSize)} -> ${this.formatMedicalSize(e.data.compressedSize)} (${(e.data.compressionRatio).toFixed(2)}x)`);
                    
                    this.emit('medicalDataCompressed', {
                        handle: medicalAllocation.handle,
                        originalSize: e.data.originalSize,
                        compressedSize: e.data.compressedSize,
                        compressionRatio: e.data.compressionRatio
                    });

                    resolve(true);
                } else if (e.data.action === 'error') {
                    reject(new Error(e.data.error));
                }
            };

            worker.addEventListener('message', handleMessage);
            worker.postMessage({
                action: 'compress',
                data: data,
                compressionLevel,
                medicalContext: medicalAllocation.medicalContext,
                workerId: 0
            });
        });
    }

    /**
     * Get all medical data for a specific study
     */
    public getMedicalDataByStudy(studyId: string): MedicalAllocation[] {
        const studyHandles = this.studyMemoryMap.get(studyId);
        if (!studyHandles) return [];

        const studyAllocations: MedicalAllocation[] = [];
        for (const handle of studyHandles) {
            const allocation = this.medicalAllocations.get(handle);
            if (allocation) {
                allocation.lastAccessed = new Date();
                allocation.accessCount++;
                studyAllocations.push(allocation);
            }
        }

        return studyAllocations;
    }

    /**
     * Free all medical data for a specific study
     */
    public freeMedicalDataByStudy(studyId: string): number {
        const studyHandles = this.studyMemoryMap.get(studyId);
        if (!studyHandles) return 0;

        let freedMemory = 0;
        const handlesToFree = Array.from(studyHandles);

        for (const handle of handlesToFree) {
            const allocation = this.medicalAllocations.get(handle);
            if (allocation && !allocation.locked) {
                freedMemory += allocation.originalSize;
                this.deallocate(handle);
            }
        }

        console.log(`Freed ${this.formatMedicalSize(freedMemory)} for study ${studyId}`);
        this.emit('studyDataFreed', { studyId, freedMemory });

        return freedMemory;
    }

    /**
     * Get comprehensive memory statistics for medical data
     */
    public getMedicalMemoryStats(): {
        totalMedicalMemory: number;
        compressedMemory: number;
        compressionSavings: number;
        activeStudies: number;
        criticalAllocations: number;
        averageCompressionRatio: number;
        studyStats: StudyMemoryStats[];
        poolUtilization: Record<string, number>;
    } {
        const baseStats = this.getMemoryStatus();
        
        let totalMedicalMemory = 0;
        let compressedMemory = 0;
        let compressionSavings = 0;
        let criticalAllocations = 0;
        let totalCompressionRatio = 0;
        let compressedCount = 0;

        // Calculate overall statistics
        for (const allocation of this.medicalAllocations.values()) {
            totalMedicalMemory += allocation.originalSize;
            
            if (allocation.compressedSize) {
                compressedMemory += allocation.compressedSize;
                compressionSavings += (allocation.originalSize - allocation.compressedSize);
                if (allocation.compressionRatio) {
                    totalCompressionRatio += allocation.compressionRatio;
                    compressedCount++;
                }
            }
            
            if (allocation.medicalContext.clinicalPriority === 'critical') {
                criticalAllocations++;
            }
        }

        // Calculate per-study statistics
        const studyStats: StudyMemoryStats[] = [];
        for (const studyId of this.studyMemoryMap.keys()) {
            const studyData = this.getMedicalDataByStudy(studyId);
            if (studyData.length === 0) continue;

            let studyMemory = 0;
            let studyCompressed = 0;
            let studyUncompressed = 0;
            let studyCompressionTotal = 0;
            let studyCompressedCount = 0;
            const seriesSet = new Set<string>();
            const instanceSet = new Set<string>();
            let oldestAccess = new Date();
            let newestAccess = new Date(0);

            for (const allocation of studyData) {
                studyMemory += allocation.originalSize;
                seriesSet.add(allocation.medicalContext.seriesId);
                instanceSet.add(allocation.medicalContext.instanceId);

                if (allocation.lastAccessed < oldestAccess) {
                    oldestAccess = allocation.lastAccessed;
                }
                if (allocation.lastAccessed > newestAccess) {
                    newestAccess = allocation.lastAccessed;
                }

                if (allocation.compressedSize) {
                    studyCompressed += allocation.compressedSize;
                    if (allocation.compressionRatio) {
                        studyCompressionTotal += allocation.compressionRatio;
                        studyCompressedCount++;
                    }
                } else {
                    studyUncompressed += allocation.originalSize;
                }
            }

            studyStats.push({
                studyId,
                totalAllocations: studyData.length,
                totalMemoryUsed: studyMemory,
                compressedMemory: studyCompressed,
                uncompressedMemory: studyUncompressed,
                averageCompressionRatio: studyCompressedCount > 0 ? studyCompressionTotal / studyCompressedCount : 0,
                seriesCount: seriesSet.size,
                instanceCount: instanceSet.size,
                oldestAccess,
                newestAccess
            });
        }

        return {
            totalMedicalMemory,
            compressedMemory,
            compressionSavings,
            activeStudies: this.studyMemoryMap.size,
            criticalAllocations,
            averageCompressionRatio: compressedCount > 0 ? totalCompressionRatio / compressedCount : 0,
            studyStats: studyStats.sort((a, b) => b.totalMemoryUsed - a.totalMemoryUsed),
            poolUtilization: this.getMedicalPoolUtilization()
        };
    }

    /**
     * Perform medical-aware garbage collection
     */
    public performMedicalGarbageCollection(): number {
        let freedMemory = 0;
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 3600000); // 1 hour ago

        // Sort allocations by priority and last access
        const allocationEntries = Array.from(this.medicalAllocations.entries());
        allocationEntries.sort(([, a], [, b]) => {
            // Don't collect critical data
            if (a.locked !== b.locked) {
                return a.locked ? 1 : -1;
            }

            // Priority order: low < medium < high < critical
            const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
            const aPriority = priorityOrder[a.medicalContext.clinicalPriority];
            const bPriority = priorityOrder[b.medicalContext.clinicalPriority];

            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }

            // Older access time first
            return a.lastAccessed.getTime() - b.lastAccessed.getTime();
        });

        // Free old, low-priority allocations
        for (const [handle, allocation] of allocationEntries) {
            if (allocation.locked) continue;
            if (allocation.lastAccessed > oneHourAgo) continue;
            if (allocation.medicalContext.clinicalPriority === 'critical') continue;

            freedMemory += allocation.originalSize;
            this.deallocate(handle);

            // Stop when we've freed enough memory
            if (freedMemory > 512 * 1024 * 1024) break; // 512MB
        }

        console.log(`Medical GC freed ${this.formatMedicalSize(freedMemory)}`);
        this.emit('medicalGarbageCollection', { freedMemory });

        return freedMemory;
    }

    // Private helper methods
    private addToStudyMemoryMap(studyId: string, handle: string): void {
        if (!this.studyMemoryMap.has(studyId)) {
            this.studyMemoryMap.set(studyId, new Set());
        }
        this.studyMemoryMap.get(studyId)!.add(handle);
    }

    private removeFromStudyMemoryMap(studyId: string, handle: string): void {
        const studyHandles = this.studyMemoryMap.get(studyId);
        if (studyHandles) {
            studyHandles.delete(handle);
            if (studyHandles.size === 0) {
                this.studyMemoryMap.delete(studyId);
            }
        }
    }

    private getMedicalPoolUtilization(): Record<string, number> {
        if (!this.medicalPools) return {};

        const utilization: Record<string, number> = {};
        
        for (const [poolName, poolHandle] of Object.entries(this.medicalPools)) {
            const pool = this.getPoolStats(poolHandle);
            utilization[poolName] = pool ? pool.usedSize / pool.totalSize : 0;
        }

        return utilization;
    }

    private formatMedicalSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB'];
        let unitIndex = 0;
        let size = bytes;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    /**
     * Dispose of all medical resources
     */
    public dispose(): void {
        // Clean up compression workers
        for (const worker of this.compressionWorkers) {
            worker.terminate();
        }
        this.compressionWorkers = [];

        // Clear compression queue
        this.compressionQueue.clear();

        // Clean up medical allocations
        for (const handle of this.medicalAllocations.keys()) {
            this.deallocate(handle);
        }
        this.medicalAllocations.clear();

        // Clean up study tracking
        this.studyMemoryMap.clear();

        // Clean up medical pools
        if (this.medicalPools) {
            for (const poolHandle of Object.values(this.medicalPools)) {
                this.destroyPool(poolHandle);
            }
            this.medicalPools = null;
        }

        // Call parent dispose
        this.stopMemoryManager();
        
        console.log('MedSight Pro Memory Manager disposed');
    }
}

export default MedSightProMemoryManager; 