/**
 * G3D Performance Optimizer - Hardware acceleration and optimization
 * Provides GPU memory management, instancing, and performance monitoring
 */

import { mat4 } from 'gl-matrix';

// Performance metrics
export interface G3DPerformanceMetrics {
    fps: number;
    frameTime: number;
    cpuTime: number;
    gpuTime: number;
    drawCalls: number;
    triangles: number;
    vertices: number;
    textureMemory: number;
    bufferMemory: number;
    shaderSwitches: number;
    stateChanges: number;
}

// Optimization settings
export interface G3DOptimizationSettings {
    enableInstancing: boolean;
    enableBatching: boolean;
    enableLOD: boolean;
    enableFrustumCulling: boolean;
    enableOcclusionCulling: boolean;
    maxDrawCalls: number;
    maxTriangles: number;
    targetFPS: number;
    adaptiveQuality: boolean;
}

// Instance data
export interface G3DInstanceData {
    transforms: Float32Array;
    colors?: Float32Array;
    custom?: Map<string, Float32Array>;
    count: number;
    capacity: number;
    needsUpdate: boolean;
}

// Draw batch
export interface G3DDrawBatch {
    geometryId: string;
    materialId: string;
    instances: G3DInstanceData;
    priority: number;
}

// GPU memory allocation
export interface G3DMemoryAllocation {
    id: string;
    type: 'buffer' | 'texture' | 'shader';
    size: number;
    usage: GPUBufferUsage | GPUTextureUsage | number;
    lastUsed: number;
    persistent: boolean;
}

// Main G3D Performance Optimizer Class
export class G3DPerformanceOptimizer {
    private metrics: G3DPerformanceMetrics = {
        fps: 0,
        frameTime: 0,
        cpuTime: 0,
        gpuTime: 0,
        drawCalls: 0,
        triangles: 0,
        vertices: 0,
        textureMemory: 0,
        bufferMemory: 0,
        shaderSwitches: 0,
        stateChanges: 0
    };

    private settings: G3DOptimizationSettings = {
        enableInstancing: true,
        enableBatching: true,
        enableLOD: true,
        enableFrustumCulling: true,
        enableOcclusionCulling: false,
        maxDrawCalls: 1000,
        maxTriangles: 10000000,
        targetFPS: 60,
        adaptiveQuality: true
    };

    private memoryAllocations: Map<string, G3DMemoryAllocation> = new Map();
    private drawBatches: Map<string, G3DDrawBatch> = new Map();
    private instanceBuffers: Map<string, GPUBuffer | WebGLBuffer> = new Map();

    // Performance tracking
    private frameCount: number = 0;
    private lastFrameTime: number = 0;
    private frameTimeHistory: number[] = [];
    private maxHistorySize: number = 60;

    // Quality levels
    private qualityLevel: number = 1.0;  // 0.0 to 1.0
    private qualityPresets = {
        ultra: { lodBias: 0, shadowQuality: 1.0, textureQuality: 1.0, effectQuality: 1.0 },
        high: { lodBias: 0.5, shadowQuality: 0.75, textureQuality: 0.9, effectQuality: 0.8 },
        medium: { lodBias: 1.0, shadowQuality: 0.5, textureQuality: 0.7, effectQuality: 0.6 },
        low: { lodBias: 2.0, shadowQuality: 0.25, textureQuality: 0.5, effectQuality: 0.3 },
        minimum: { lodBias: 3.0, shadowQuality: 0, textureQuality: 0.25, effectQuality: 0 }
    };

    constructor() {
        this.startPerformanceMonitoring();
    }

    // Performance monitoring

    private startPerformanceMonitoring(): void {
        if (typeof performance !== 'undefined' && performance.now) {
            this.lastFrameTime = performance.now();
        }
    }

    beginFrame(): void {
        const now = performance.now();
        const frameTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        // Update frame time history
        this.frameTimeHistory.push(frameTime);
        if (this.frameTimeHistory.length > this.maxHistorySize) {
            this.frameTimeHistory.shift();
        }

        // Calculate average frame time
        const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
        this.metrics.frameTime = avgFrameTime;
        this.metrics.fps = 1000 / avgFrameTime;

        // Reset per-frame counters
        this.metrics.drawCalls = 0;
        this.metrics.triangles = 0;
        this.metrics.vertices = 0;
        this.metrics.shaderSwitches = 0;
        this.metrics.stateChanges = 0;

        // Adaptive quality adjustment
        if (this.settings.adaptiveQuality) {
            this.adjustQualityLevel();
        }

        this.frameCount++;
    }

    endFrame(): void {
        // GPU timing would be done here with timestamp queries
        this.metrics.cpuTime = performance.now() - this.lastFrameTime;
    }

    // Adaptive quality

    private adjustQualityLevel(): void {
        const targetFrameTime = 1000 / this.settings.targetFPS;
        const currentFrameTime = this.metrics.frameTime;

        if (currentFrameTime > targetFrameTime * 1.2) {
            // Performance is too low, decrease quality
            this.qualityLevel = Math.max(0, this.qualityLevel - 0.02);
        } else if (currentFrameTime < targetFrameTime * 0.8) {
            // Performance is good, increase quality
            this.qualityLevel = Math.min(1, this.qualityLevel + 0.01);
        }
    }

    getQualitySettings(): any {
        if (this.qualityLevel >= 0.9) return this.qualityPresets.ultra;
        if (this.qualityLevel >= 0.7) return this.qualityPresets.high;
        if (this.qualityLevel >= 0.5) return this.qualityPresets.medium;
        if (this.qualityLevel >= 0.3) return this.qualityPresets.low;
        return this.qualityPresets.minimum;
    }

    // Instancing optimization

    createInstanceBatch(geometryId: string, materialId: string, capacity: number): G3DDrawBatch {
        const batchId = `${geometryId}_${materialId}`;

        const instances: G3DInstanceData = {
            transforms: new Float32Array(capacity * 16),  // 4x4 matrices
            count: 0,
            capacity,
            needsUpdate: true
        };

        const batch: G3DDrawBatch = {
            geometryId,
            materialId,
            instances,
            priority: 0
        };

        this.drawBatches.set(batchId, batch);
        return batch;
    }

    addInstance(batch: G3DDrawBatch, transform: mat4, color?: Float32Array): boolean {
        if (batch.instances.count >= batch.instances.capacity) {
            return false;  // Batch is full
        }

        const offset = batch.instances.count * 16;
        batch.instances.transforms.set(transform, offset);

        if (color && batch.instances.colors) {
            const colorOffset = batch.instances.count * 4;
            batch.instances.colors.set(color, colorOffset);
        }

        batch.instances.count++;
        batch.instances.needsUpdate = true;

        return true;
    }

    updateInstanceBuffer(batch: G3DDrawBatch, device: GPUDevice | WebGL2RenderingContext): void {
        if (!batch.instances.needsUpdate) return;

        const batchId = `${batch.geometryId}_${batch.materialId}`;
        let buffer = this.instanceBuffers.get(batchId);

        if ('createBuffer' in device) {
            // WebGPU
            if (!buffer) {
                buffer = device.createBuffer({
                    size: batch.instances.capacity * 16 * 4,  // 16 floats per matrix
                    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
                });
                this.instanceBuffers.set(batchId, buffer);
            }

            device.queue.writeBuffer(
                buffer as GPUBuffer,
                0,
                batch.instances.transforms.buffer,
                0,
                batch.instances.count * 16 * 4
            );
        } else {
            // WebGL2
            const gl = device as WebGL2RenderingContext;
            if (!buffer) {
                buffer = gl.createBuffer()!;
                this.instanceBuffers.set(batchId, buffer);
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer as WebGLBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                batch.instances.transforms.subarray(0, batch.instances.count * 16),
                gl.DYNAMIC_DRAW
            );
        }

        batch.instances.needsUpdate = false;
    }

    // Draw call batching

    sortBatches(): G3DDrawBatch[] {
        const batches = Array.from(this.drawBatches.values());

        // Sort by material to minimize state changes
        batches.sort((a, b) => {
            if (a.materialId !== b.materialId) {
                return a.materialId.localeCompare(b.materialId);
            }
            return a.priority - b.priority;
        });

        return batches;
    }

    // Memory management

    allocateMemory(id: string, type: 'buffer' | 'texture' | 'shader', size: number, usage: number, persistent: boolean = false): void {
        const allocation: G3DMemoryAllocation = {
            id,
            type,
            size,
            usage,
            lastUsed: Date.now(),
            persistent
        };

        this.memoryAllocations.set(id, allocation);

        if (type === 'buffer') {
            this.metrics.bufferMemory += size;
        } else if (type === 'texture') {
            this.metrics.textureMemory += size;
        }
    }

    deallocateMemory(id: string): void {
        const allocation = this.memoryAllocations.get(id);
        if (!allocation) return;

        if (allocation.type === 'buffer') {
            this.metrics.bufferMemory -= allocation.size;
        } else if (allocation.type === 'texture') {
            this.metrics.textureMemory -= allocation.size;
        }

        this.memoryAllocations.delete(id);
    }

    garbageCollect(maxAge: number = 60000): string[] {
        const now = Date.now();
        const toDelete: string[] = [];

        for (const [id, allocation] of this.memoryAllocations) {
            if (!allocation.persistent && now - allocation.lastUsed > maxAge) {
                toDelete.push(id);
            }
        }

        for (const id of toDelete) {
            this.deallocateMemory(id);
        }

        return toDelete;
    }

    // GPU compute optimization

    createComputePipeline(shader: string, workgroupSize: [number, number, number] = [64, 1, 1]): any {
        // This would create a compute pipeline for GPU acceleration
        // Implementation depends on WebGPU availability
        return {
            shader,
            workgroupSize,
            dispatch: (x: number, y: number, z: number) => {
                // Dispatch compute work
            }
        };
    }

    // Statistics and monitoring

    recordDrawCall(triangles: number, vertices: number): void {
        this.metrics.drawCalls++;
        this.metrics.triangles += triangles;
        this.metrics.vertices += vertices;
    }

    recordShaderSwitch(): void {
        this.metrics.shaderSwitches++;
    }

    recordStateChange(): void {
        this.metrics.stateChanges++;
    }

    getMetrics(): G3DPerformanceMetrics {
        return { ...this.metrics };
    }

    getSettings(): G3DOptimizationSettings {
        return { ...this.settings };
    }

    updateSettings(settings: Partial<G3DOptimizationSettings>): void {
        Object.assign(this.settings, settings);
    }

    // Performance hints

    getOptimizationHints(): string[] {
        const hints: string[] = [];

        if (this.metrics.drawCalls > this.settings.maxDrawCalls) {
            hints.push(`High draw call count (${this.metrics.drawCalls}). Consider batching or instancing.`);
        }

        if (this.metrics.shaderSwitches > 50) {
            hints.push(`High shader switches (${this.metrics.shaderSwitches}). Sort objects by material.`);
        }

        if (this.metrics.fps < this.settings.targetFPS * 0.9) {
            hints.push(`FPS below target (${this.metrics.fps.toFixed(1)}/${this.settings.targetFPS}). Consider reducing quality.`);
        }

        if (this.metrics.textureMemory > 1024 * 1024 * 1024) {  // 1GB
            hints.push(`High texture memory usage (${(this.metrics.textureMemory / 1024 / 1024).toFixed(1)}MB). Consider texture compression.`);
        }

        return hints;
    }

    // Profiling utilities

    startProfile(name: string): () => void {
        const startTime = performance.now();
        return () => {
            const duration = performance.now() - startTime;
            console.log(`[G3D Profile] ${name}: ${duration.toFixed(2)}ms`);
        };
    }

    // Memory profiling

    getMemoryProfile(): any {
        const profile = {
            totalAllocated: this.metrics.bufferMemory + this.metrics.textureMemory,
            buffers: this.metrics.bufferMemory,
            textures: this.metrics.textureMemory,
            allocations: this.memoryAllocations.size,
            breakdown: {
                persistent: 0,
                temporary: 0
            }
        };

        for (const allocation of this.memoryAllocations.values()) {
            if (allocation.persistent) {
                profile.breakdown.persistent += allocation.size;
            } else {
                profile.breakdown.temporary += allocation.size;
            }
        }

        return profile;
    }
}

// Export factory function
export function createG3DPerformanceOptimizer(): G3DPerformanceOptimizer {
    return new G3DPerformanceOptimizer();
}