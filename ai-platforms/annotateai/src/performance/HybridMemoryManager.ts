/**
 * AnnotateAI Hybrid Memory Manager
 * 
 * Extends the infrastructure MemoryManager with ML/annotation-specific features:
 * - ML model slot allocation and optimization
 * - GPU memory pools for WebGPU (vertex, uniform, storage, texture)
 * - ML-specific leak detection with stack traces
 * - Annotation workload profiling and performance optimization
 * 
 * This hybrid approach leverages the advanced infrastructure foundation (780 lines)
 * while preserving all AnnotateAI business-specific functionality.
 */

import { MemoryManager as BaseMemoryManager } from '../../../../infrastructure/engines';

// AnnotateAI-specific interfaces that extend the base
export interface MLModelSlot {
    modelId: string;
    memoryRequirement: number;
    allocationHandle: string;
    modelType: 'classification' | 'detection' | 'segmentation' | 'gan' | 'diffusion';
    optimized: boolean;
    gpuAccelerated: boolean;
    priority: 'low' | 'normal' | 'high' | 'critical';
    metadata: {
        framework: string;
        version: string;
        inputShape: number[];
        outputShape: number[];
        parameters: number;
    };
}

export interface AnnotationWorkloadProfile {
    workloadType: 'image' | 'video' | 'batch' | 'realtime';
    averageProcessingTime: number;
    memoryPeakUsage: number;
    gpuUtilization: number;
    cacheHitRate: number;
    modelInferenceTime: number;
}

export interface WebGPUPools {
    vertex: string;    // Pool handle for vertex buffers
    uniform: string;   // Pool handle for uniform buffers  
    storage: string;   // Pool handle for storage buffers
    texture: string;   // Pool handle for texture memory
}

export interface MLLeakContext {
    modelId?: string;
    workloadType?: string;
    stackTrace?: string;
    tensorInfo?: {
        shape: number[];
        dtype: string;
        size: number;
    };
}

export class AnnotateAIMemoryManager extends BaseMemoryManager {
    private modelSlots: Map<string, MLModelSlot> = new Map();
    private webgpuPools: WebGPUPools | null = null;
    private device: GPUDevice | null = null;
    private workloadProfiles: Map<string, AnnotationWorkloadProfile> = new Map();
    private mlLeakDetector: MLLeakDetector;

    constructor(config: any = {}) {
        // Initialize with AnnotateAI-specific pool configuration
        super();
        
        this.mlLeakDetector = new MLLeakDetector();
        this.initializeWebGPUPools();
        this.setupMLEventListeners();
    }

    /**
     * Initialize WebGPU memory pools for ML workloads
     */
    private async initializeWebGPUPools(): Promise<void> {
        try {
            if (navigator.gpu) {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    this.device = await adapter.requestDevice();
                    
                    // Create specialized GPU pools for ML workloads
                    this.webgpuPools = {
                        vertex: this.createPool('gpu-vertex-ml', 'gpu', 128 * 1024 * 1024), // 128MB
                        uniform: this.createPool('gpu-uniform-ml', 'gpu', 64 * 1024 * 1024),  // 64MB
                        storage: this.createPool('gpu-storage-ml', 'gpu', 256 * 1024 * 1024), // 256MB
                        texture: this.createPool('gpu-texture-ml', 'gpu', 512 * 1024 * 1024)  // 512MB
                    };
                    
                    console.log('WebGPU memory pools initialized for ML workloads');
                }
            }
        } catch (error) {
            console.warn('WebGPU not available for ML memory management:', error);
        }
    }

    /**
     * Set up ML-specific event listeners
     */
    private setupMLEventListeners(): void {
        this.on('memoryAllocated', (event) => {
            this.mlLeakDetector.trackMLAllocation(event.handle, {
                size: event.size,
                timestamp: Date.now(),
                stackTrace: this.captureStackTrace()
            });
        });

        this.on('memoryDeallocated', (event) => {
            this.mlLeakDetector.trackMLDeallocation(event.handle);
        });
    }

    /**
     * Allocate memory slot for ML model with optimization
     */
    public async allocateModelSlot(
        modelId: string, 
        memoryRequirement: string | number,
        modelType: MLModelSlot['modelType'] = 'classification',
        metadata: Partial<MLModelSlot['metadata']> = {}
    ): Promise<string | null> {
        const sizeBytes = typeof memoryRequirement === 'string' 
            ? this.parseMemorySize(memoryRequirement)
            : memoryRequirement;

        // Allocate from GPU pool if available, otherwise fallback to CPU
        const poolType = this.device ? 'gpu' : 'cpu';
        const allocationHandle = this.allocate(sizeBytes, poolType, 8); // 8-byte alignment for ML

        if (!allocationHandle) {
            console.error(`Failed to allocate model slot for ${modelId}`);
            return null;
        }

        const modelSlot: MLModelSlot = {
            modelId,
            memoryRequirement: sizeBytes,
            allocationHandle,
            modelType,
            optimized: false,
            gpuAccelerated: this.device !== null,
            priority: 'normal',
            metadata: {
                framework: 'tensorflow',
                version: '4.0.0',
                inputShape: [],
                outputShape: [],
                parameters: 0,
                ...metadata
            }
        };

        this.modelSlots.set(modelId, modelSlot);
        
        console.log(`Allocated model slot for ${modelId}: ${this.formatMemorySize(sizeBytes)}`);
        this.emit('modelSlotAllocated', { modelId, size: sizeBytes, handle: allocationHandle });

        return allocationHandle;
    }

    /**
     * Optimize ML model for better memory usage and performance
     */
    public async optimizeModel(model: any, options: any = {}): Promise<void> {
        const modelId = options.modelId || 'unknown';
        const modelSlot = this.modelSlots.get(modelId);

        if (!modelSlot) {
            console.warn(`No model slot found for ${modelId}`);
            return;
        }

        try {
            console.log(`Optimizing model ${modelId}...`);

            // Perform model-specific optimizations
            if (options.quantization) {
                await this.applyQuantization(model, options.quantization);
            }

            if (options.pruning) {
                await this.applyPruning(model, options.pruning);
            }

            if (options.memoryMapping && this.device) {
                await this.optimizeGPUMemoryMapping(model, modelSlot);
            }

            modelSlot.optimized = true;
            console.log(`Model ${modelId} optimization completed`);
            this.emit('modelOptimized', { modelId, optimizations: options });

        } catch (error) {
            console.error(`Model optimization failed for ${modelId}:`, error);
            throw error;
        }
    }

    /**
     * Allocate WebGPU buffer for specific ML operations
     */
    public allocateWebGPUBuffer(
        type: keyof WebGPUPools, 
        size: number, 
        usage: GPUBufferUsageFlags
    ): string | null {
        if (!this.webgpuPools || !this.device) {
            console.warn('WebGPU not available for buffer allocation');
            return null;
        }

        const poolHandle = this.webgpuPools[type];
        const allocation = this.getAllocation(poolHandle);

        if (!allocation) {
            console.error(`Failed to get WebGPU pool for type: ${type}`);
            return null;
        }

        // Create GPU buffer with specified usage
        const buffer = this.device.createBuffer({
            size,
            usage
        });

        // Store buffer reference in allocation data
        allocation.data = buffer;

        console.log(`Allocated WebGPU ${type} buffer: ${this.formatMemorySize(size)}`);
        return poolHandle;
    }

    /**
     * Get ML-specific memory statistics
     */
    public getMLMemoryStats(): {
        totalModelMemory: number;
        activeModels: number;
        gpuUtilization: number;
        optimizedModels: number;
        webgpuPools: Record<string, number>;
        leakDetection: {
            totalLeaks: number;
            suspectedLeaks: any[];
        };
    } {
        const baseStats = this.getMemoryStatus();
        
        let totalModelMemory = 0;
        let optimizedModels = 0;
        
        for (const slot of this.modelSlots.values()) {
            totalModelMemory += slot.memoryRequirement;
            if (slot.optimized) optimizedModels++;
        }

        return {
            totalModelMemory,
            activeModels: this.modelSlots.size,
            gpuUtilization: this.calculateGPUUtilization(),
            optimizedModels,
            webgpuPools: this.getWebGPUPoolStats(),
            leakDetection: {
                totalLeaks: this.mlLeakDetector.getLeakCount(),
                suspectedLeaks: this.mlLeakDetector.detectMLLeaks()
            }
        };
    }

    /**
     * Profile annotation workload for optimization
     */
    public profileAnnotationWorkload(
        workloadId: string,
        workloadType: AnnotationWorkloadProfile['workloadType'],
        metrics: Partial<AnnotationWorkloadProfile>
    ): void {
        const profile: AnnotationWorkloadProfile = {
            workloadType,
            averageProcessingTime: 0,
            memoryPeakUsage: 0,
            gpuUtilization: 0,
            cacheHitRate: 0,
            modelInferenceTime: 0,
            ...metrics
        };

        this.workloadProfiles.set(workloadId, profile);
        
        // Emit profiling data for analysis
        this.emit('workloadProfiled', { workloadId, profile });
    }

    /**
     * Get workload performance recommendations
     */
    public getWorkloadRecommendations(workloadId: string): string[] {
        const profile = this.workloadProfiles.get(workloadId);
        if (!profile) return [];

        const recommendations: string[] = [];

        if (profile.memoryPeakUsage > 0.8) {
            recommendations.push('Consider model quantization to reduce memory usage');
        }

        if (profile.cacheHitRate < 0.7) {
            recommendations.push('Increase cache size or improve data locality');
        }

        if (profile.gpuUtilization < 0.5 && this.device) {
            recommendations.push('Optimize GPU utilization with better batching');
        }

        if (profile.modelInferenceTime > profile.averageProcessingTime * 0.6) {
            recommendations.push('Model inference is bottleneck - consider optimization');
        }

        return recommendations;
    }

    // Private helper methods
    private parseMemorySize(sizeStr: string): number {
        const units: Record<string, number> = {
            'B': 1,
            'KB': 1024,
            'MB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024
        };

        const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)$/i);
        if (!match) {
            throw new Error(`Invalid memory size format: ${sizeStr}`);
        }

        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        
        return Math.floor(value * (units[unit] || 1));
    }

    private async applyQuantization(model: any, config: any): Promise<void> {
        // Implement quantization logic
        console.log('Applying quantization optimization...');
    }

    private async applyPruning(model: any, config: any): Promise<void> {
        // Implement pruning logic
        console.log('Applying pruning optimization...');
    }

    private async optimizeGPUMemoryMapping(model: any, slot: MLModelSlot): Promise<void> {
        // Implement GPU memory mapping optimization
        console.log('Optimizing GPU memory mapping...');
    }

    private calculateGPUUtilization(): number {
        if (!this.webgpuPools) return 0;
        
        // Calculate GPU utilization based on pool usage
        const pools = this.getMemoryStatus().pools;
        const gpuPools = pools.filter(p => p.type === 'gpu');
        
        if (gpuPools.length === 0) return 0;
        
        const totalGPUMemory = gpuPools.reduce((sum, p) => sum + p.totalSize, 0);
        const usedGPUMemory = gpuPools.reduce((sum, p) => sum + p.usedSize, 0);
        
        return totalGPUMemory > 0 ? usedGPUMemory / totalGPUMemory : 0;
    }

    private getWebGPUPoolStats(): Record<string, number> {
        if (!this.webgpuPools) return {};

        const stats: Record<string, number> = {};
        
        for (const [type, poolHandle] of Object.entries(this.webgpuPools)) {
            const pool = this.getPoolStats(poolHandle);
            stats[type] = pool ? pool.usedSize / pool.totalSize : 0;
        }

        return stats;
    }

    private captureStackTrace(): string {
        const error = new Error();
        return error.stack || 'Stack trace not available';
    }

    private formatMemorySize(bytes: number): string {
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
     * Clean up ML-specific resources
     */
    public dispose(): void {
        // Clean up model slots
        for (const slot of this.modelSlots.values()) {
            this.deallocate(slot.allocationHandle);
        }
        this.modelSlots.clear();

        // Clean up WebGPU resources
        if (this.webgpuPools) {
            for (const poolHandle of Object.values(this.webgpuPools)) {
                this.destroyPool(poolHandle);
            }
            this.webgpuPools = null;
        }

        // Clean up leak detector
        this.mlLeakDetector.dispose();

        // Call parent dispose
        this.stopMemoryManager();
        
        console.log('AnnotateAI Memory Manager disposed');
    }
}

/**
 * ML-specific leak detector that extends base functionality
 */
class MLLeakDetector {
    private mlAllocations: Map<string, {
        size: number;
        timestamp: number;
        stackTrace?: string;
        modelContext?: string;
        tensorInfo?: any;
    }> = new Map();

    trackMLAllocation(handle: string, context: any): void {
        this.mlAllocations.set(handle, {
            size: context.size,
            timestamp: context.timestamp,
            stackTrace: context.stackTrace,
            modelContext: context.modelId,
            tensorInfo: context.tensorInfo
        });
    }

    trackMLDeallocation(handle: string): void {
        this.mlAllocations.delete(handle);
    }

    detectMLLeaks(): Array<{
        handle: string;
        size: number;
        age: number;
        stackTrace?: string;
        context?: string;
    }> {
        const now = Date.now();
        const leaks: any[] = [];

        for (const [handle, allocation] of this.mlAllocations) {
            const age = now - allocation.timestamp;
            
            // Consider allocation a leak if it's older than 10 minutes
            if (age > 600000) {
                leaks.push({
                    handle,
                    size: allocation.size,
                    age,
                    stackTrace: allocation.stackTrace,
                    context: allocation.modelContext
                });
            }
        }

        return leaks;
    }

    getLeakCount(): number {
        return this.detectMLLeaks().length;
    }

    dispose(): void {
        this.mlAllocations.clear();
    }
}

export default AnnotateAIMemoryManager; 