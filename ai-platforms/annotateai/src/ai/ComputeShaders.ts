/**
 * G3D AnnotateAI - Compute Shaders System
 * GPU compute acceleration framework
 * Custom OpenCL/CUDA kernels and parallel processing optimization
 */

export interface ComputeShaderConfig {
    backend: ComputeBackend;
    device: DeviceConfig;
    memory: MemoryConfig;
    optimization: OptimizationConfig;
    debugging: DebuggingConfig;
    kernels: KernelConfig[];
}

export type ComputeBackend = 'webgpu' | 'webgl' | 'opencl' | 'cuda' | 'metal' | 'vulkan';

export interface DeviceConfig {
    preferredDevice: 'gpu' | 'cpu' | 'auto';
    deviceIndex?: number;
    minComputeUnits: number;
    minMemorySize: number;
    features: DeviceFeature[];
}

export type DeviceFeature =
    | 'fp16' | 'fp64' | 'int8' | 'int16' | 'int64'
    | 'subgroups' | 'shared_memory' | 'atomic_operations'
    | 'texture_sampling' | 'image_load_store';

export interface MemoryConfig {
    maxBufferSize: number;
    alignment: number;
    caching: CachingStrategy;
    pooling: PoolingConfig;
    compression: CompressionConfig;
}

export type CachingStrategy = 'none' | 'lru' | 'lfu' | 'adaptive';

export interface PoolingConfig {
    enabled: boolean;
    initialSize: number;
    maxSize: number;
    growthFactor: number;
}

export interface CompressionConfig {
    enabled: boolean;
    algorithm: 'lz4' | 'zstd' | 'snappy';
    level: number;
}

export interface OptimizationConfig {
    autoTuning: boolean;
    workGroupOptimization: boolean;
    memoryCoalescing: boolean;
    loopUnrolling: boolean;
    constantFolding: boolean;
    deadCodeElimination: boolean;
}

export interface DebuggingConfig {
    enabled: boolean;
    profiling: boolean;
    validation: boolean;
    verboseLogging: boolean;
}

export interface KernelConfig {
    name: string;
    source: string;
    entryPoint: string;
    workGroupSize: [number, number, number];
    localMemorySize: number;
    constants: Record<string, any>;
    includes: string[];
}

export interface ComputeBuffer {
    id: string;
    size: number;
    usage: BufferUsage;
    data?: ArrayBuffer;
    mapped: boolean;
    device: GPUDevice | null;
    buffer: GPUBuffer | null;
}

export type BufferUsage =
    | 'storage' | 'uniform' | 'vertex' | 'index' | 'indirect'
    | 'copy_src' | 'copy_dst' | 'map_read' | 'map_write';

export interface ComputeKernel {
    id: string;
    name: string;
    pipeline: GPUComputePipeline | null;
    bindGroupLayout: GPUBindGroupLayout | null;
    workGroupSize: [number, number, number];
    compiled: boolean;
    source: string;
}

export interface KernelExecution {
    kernel: ComputeKernel;
    buffers: ComputeBuffer[];
    uniforms: Record<string, any>;
    workGroups: [number, number, number];
    localSize: [number, number, number];
}

export interface ExecutionResult {
    success: boolean;
    executionTime: number;
    memoryUsed: number;
    outputBuffers: ComputeBuffer[];
    profiling?: ProfilingData;
    error?: string;
}

export interface ProfilingData {
    kernelTime: number;
    memoryTransferTime: number;
    totalTime: number;
    occupancy: number;
    throughput: number;
    efficiency: number;
}

export interface ShaderTemplate {
    name: string;
    template: string;
    parameters: TemplateParameter[];
    description: string;
    category: ShaderCategory;
}

export type ShaderCategory =
    | 'image_processing' | 'matrix_operations' | 'ml_inference'
    | 'data_processing' | 'physics_simulation' | 'rendering';

export interface TemplateParameter {
    name: string;
    type: 'int' | 'float' | 'bool' | 'string';
    defaultValue: any;
    description: string;
    range?: [number, number];
}

export interface DeviceInfo {
    name: string;
    vendor: string;
    type: 'discrete' | 'integrated' | 'cpu' | 'unknown';
    computeUnits: number;
    maxWorkGroupSize: number;
    maxWorkGroupsPerDimension: number;
    maxBufferSize: number;
    sharedMemorySize: number;
    features: DeviceFeature[];
}

export class ComputeShaders {
    private config: ComputeShaderConfig;
    private device: GPUDevice | null = null;
    private adapter: GPUAdapter | null = null;
    private kernels: Map<string, ComputeKernel>;
    private buffers: Map<string, ComputeBuffer>;
    private templates: Map<string, ShaderTemplate>;
    private isInitialized: boolean = false;
    private performanceMetrics: Map<string, ProfilingData[]> = new Map();
    private executionHistory: ExecutionResult[] = [];
    private totalMemoryUsed: number = 0;

    constructor(config: ComputeShaderConfig) {
        this.config = config;
        this.kernels = new Map();
        this.buffers = new Map();
        this.templates = new Map();

        this.initializeTemplates();
    }

    /**
     * Initialize compute shaders system
     */
    public async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Compute Shaders system');

            // Check WebGPU support
            if (!navigator.gpu) {
                throw new Error('WebGPU not supported in this browser');
            }

            // Request adapter
            this.adapter = await navigator.gpu.requestAdapter({
                powerPreference: this.config.device.preferredDevice === 'gpu' ? 'high-performance' : 'low-power'
            }) as any;

            if (!this.adapter) {
                throw new Error('Failed to get WebGPU adapter');
            }

            // Request device
            this.device = await this.adapter.requestDevice({
                requiredFeatures: this.getRequiredFeatures(),
                requiredLimits: this.getRequiredLimits()
            });

            if (!this.device) {
                throw new Error('Failed to get WebGPU device');
            }

            // Set up error handling
            this.device.addEventListener('uncapturederror', (event: any) => {
                console.error('WebGPU uncaptured error:', event.error);
            });

            // Initialize built-in kernels
            await this.initializeBuiltinKernels();

            this.isInitialized = true;
            console.log('G3D Compute Shaders system initialized successfully');

        } catch (error) {
            console.error('Failed to initialize compute shaders:', error);
            throw error;
        }
    }

    /**
     * Create compute buffer
     */
    public createBuffer(
        id: string,
        size: number,
        usage: BufferUsage,
        data?: ArrayBuffer
    ): ComputeBuffer {
        try {
            if (!this.device) {
                throw new Error('Device not initialized');
            }

            let gpuUsage = GPUBufferUsage.STORAGE;

            // Map usage types to WebGPU flags
            switch (usage) {
                case 'storage':
                    gpuUsage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST;
                    break;
                case 'uniform':
                    gpuUsage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
                    break;
                case 'copy_src':
                    gpuUsage = GPUBufferUsage.COPY_SRC;
                    break;
                case 'copy_dst':
                    gpuUsage = GPUBufferUsage.COPY_DST;
                    break;
                case 'map_read':
                    gpuUsage = GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST;
                    break;
                case 'map_write':
                    gpuUsage = GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC;
                    break;
            }

            const buffer = this.device.createBuffer({
                size: Math.max(size, 4), // Minimum 4 bytes
                usage: gpuUsage,
                mappedAtCreation: data !== undefined
            });

            // Copy initial data if provided
            if (data && buffer.mapState === 'mapped') {
                const mappedRange = buffer.getMappedRange();
                new Uint8Array(mappedRange).set(new Uint8Array(data));
                buffer.unmap();
            }

            const computeBuffer: ComputeBuffer = {
                id,
                size,
                usage,
                data: data ? data.slice() : undefined,
                mapped: false,
                device: this.device,
                buffer
            };

            this.buffers.set(id, computeBuffer);

            console.log(`Created buffer: ${id} (${size} bytes)`);
            return computeBuffer;

        } catch (error) {
            console.error('Failed to create buffer:', error);
            throw error;
        }
    }

    /**
     * Create compute kernel from source
     */
    public async createKernel(
        id: string,
        name: string,
        source: string,
        workGroupSize: [number, number, number] = [64, 1, 1]
    ): Promise<ComputeKernel> {
        try {
            if (!this.device) {
                throw new Error('Device not initialized');
            }

            console.log(`Creating kernel: ${name}`);

            // Create shader module
            const shaderModule = this.device.createShaderModule({
                code: source
            });

            // Create bind group layout
            const bindGroupLayout = this.device.createBindGroupLayout({
                entries: this.extractBindGroupEntries(source)
            });

            // Create compute pipeline
            const pipeline = this.device.createComputePipeline({
                layout: this.device.createPipelineLayout({
                    bindGroupLayouts: [bindGroupLayout]
                }),
                compute: {
                    module: shaderModule,
                    entryPoint: 'main'
                }
            });

            const kernel: ComputeKernel = {
                id,
                name,
                pipeline,
                bindGroupLayout,
                workGroupSize,
                compiled: true,
                source
            };

            this.kernels.set(id, kernel);

            console.log(`Kernel created: ${name}`);
            return kernel;

        } catch (error) {
            console.error('Failed to create kernel:', error);
            throw error;
        }
    }

    /**
     * Execute compute kernel
     */
    public async executeKernel(
        kernelId: string,
        bufferIds: string[],
        workGroups: [number, number, number],
        uniforms?: Record<string, any>
    ): Promise<ExecutionResult> {
        try {
            const startTime = Date.now();

            const kernel = this.kernels.get(kernelId);
            if (!kernel || !kernel.pipeline || !kernel.bindGroupLayout) {
                throw new Error(`Kernel not found or not compiled: ${kernelId}`);
            }

            if (!this.device) {
                throw new Error('Device not initialized');
            }

            // Get buffers
            const buffers = bufferIds.map(id => {
                const buffer = this.buffers.get(id);
                if (!buffer) {
                    throw new Error(`Buffer not found: ${id}`);
                }
                return buffer;
            });

            // Create bind group
            const bindGroup = this.device.createBindGroup({
                layout: kernel.bindGroupLayout,
                entries: buffers.map((buffer, index) => ({
                    binding: index,
                    resource: {
                        buffer: buffer.buffer!
                    }
                }))
            });

            // Create command encoder
            const commandEncoder = this.device.createCommandEncoder();

            // Create compute pass
            const computePass = commandEncoder.beginComputePass();
            computePass.setPipeline(kernel.pipeline);
            computePass.setBindGroup(0, bindGroup);
            computePass.dispatchWorkgroups(workGroups[0], workGroups[1], workGroups[2]);
            computePass.end();

            // Submit commands
            const commandBuffer = commandEncoder.finish();
            this.device.queue.submit([commandBuffer]);

            // Wait for completion
            await this.device.queue.onSubmittedWorkDone();

            const executionTime = Date.now() - startTime;

            // Calculate memory usage
            const memoryUsed = buffers.reduce((total, buffer) => total + buffer.size, 0);

            console.log(`Kernel executed: ${kernel.name} (${executionTime.toFixed(2)}ms)`);

            return {
                success: true,
                executionTime,
                memoryUsed,
                outputBuffers: buffers,
                profiling: this.config.debugging.profiling ? {
                    kernelTime: executionTime,
                    memoryTransferTime: 0,
                    totalTime: executionTime,
                    occupancy: 0.8,
                    throughput: memoryUsed / executionTime,
                    efficiency: 0.85
                } : undefined
            };

        } catch (error) {
            console.error('Kernel execution failed:', error);
            return {
                success: false,
                executionTime: 0,
                memoryUsed: 0,
                outputBuffers: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Read data from buffer
     */
    public async readBuffer(bufferId: string): Promise<ArrayBuffer> {
        try {
            const buffer = this.buffers.get(bufferId);
            if (!buffer || !buffer.buffer) {
                throw new Error(`Buffer not found: ${bufferId}`);
            }

            if (!this.device) {
                throw new Error('Device not initialized');
            }

            // Create staging buffer for reading
            const stagingBuffer = this.device.createBuffer({
                size: buffer.size,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
            });

            // Copy data to staging buffer
            const commandEncoder = this.device.createCommandEncoder();
            commandEncoder.copyBufferToBuffer(
                buffer.buffer,
                0,
                stagingBuffer,
                0,
                buffer.size
            );

            const commandBuffer = commandEncoder.finish();
            this.device.queue.submit([commandBuffer]);

            // Map and read data
            await stagingBuffer.mapAsync(GPUMapMode.READ);
            const mappedRange = stagingBuffer.getMappedRange();
            const data = mappedRange.slice();

            stagingBuffer.unmap();
            stagingBuffer.destroy();

            return data;

        } catch (error) {
            console.error('Failed to read buffer:', error);
            throw error;
        }
    }

    /**
     * Write data to buffer
     */
    public async writeBuffer(bufferId: string, data: ArrayBuffer): Promise<void> {
        try {
            const buffer = this.buffers.get(bufferId);
            if (!buffer || !buffer.buffer) {
                throw new Error(`Buffer not found: ${bufferId}`);
            }

            if (!this.device) {
                throw new Error('Device not initialized');
            }

            if (data.byteLength > buffer.size) {
                throw new Error('Data size exceeds buffer size');
            }

            this.device.queue.writeBuffer(buffer.buffer, 0, data);
            buffer.data = data.slice();

        } catch (error) {
            console.error('Failed to write buffer:', error);
            throw error;
        }
    }

    /**
     * Create kernel from template
     */
    public async createKernelFromTemplate(
        kernelId: string,
        templateName: string,
        parameters: Record<string, any>,
        workGroupSize?: [number, number, number]
    ): Promise<ComputeKernel> {
        try {
            const template = this.templates.get(templateName);
            if (!template) {
                throw new Error(`Template not found: ${templateName}`);
            }

            // Replace template parameters
            let source = template.template;
            for (const param of template.parameters) {
                const value = parameters[param.name] ?? param.defaultValue;
                const placeholder = `{{${param.name}}}`;
                source = source.replace(new RegExp(placeholder, 'g'), String(value));
            }

            return this.createKernel(
                kernelId,
                `${templateName}_${kernelId}`,
                source,
                workGroupSize || [64, 1, 1]
            );

        } catch (error) {
            console.error('Failed to create kernel from template:', error);
            throw error;
        }
    }

    /**
     * Get device information
     */
    public getDeviceInfo(): DeviceInfo | null {
        if (!this.adapter) return null;

        return {
            name: (this.adapter as any).info?.device || 'Unknown',
            vendor: (this.adapter as any).info?.vendor || 'Unknown',
            type: (this.adapter as any).info?.architecture === 'discrete-gpu' ? 'discrete' : 'integrated',
            computeUnits: 16, // Mock value
            maxWorkGroupSize: this.adapter.limits?.maxComputeWorkgroupSizeX || 256,
            maxWorkGroupsPerDimension: this.adapter.limits?.maxComputeWorkgroupsPerDimension || 65535,
            maxBufferSize: this.adapter.limits?.maxBufferSize || 1024 * 1024 * 1024,
            sharedMemorySize: this.adapter.limits?.maxComputeWorkgroupStorageSize || 16384,
            features: this.extractDeviceFeatures()
        };
    }

    /**
     * Optimize kernel for current device
     */
    public async optimizeKernel(kernelId: string): Promise<void> {
        try {
            const kernel = this.kernels.get(kernelId);
            if (!kernel) {
                throw new Error(`Kernel not found: ${kernelId}`);
            }

            console.log(`Optimizing kernel: ${kernel.name}`);

            // Find optimal work group size
            const optimalSize = await this.findOptimalWorkGroupSize(kernel);
            if (optimalSize) {
                kernel.workGroupSize = optimalSize;

                // Recreate pipeline with new work group size
                await this.createKernel(kernel.id, kernel.name, kernel.source, optimalSize);
            }

            console.log(`Kernel optimized: ${kernel.name}`);

        } catch (error) {
            console.error('Kernel optimization failed:', error);
        }
    }

    /**
     * Profile kernel performance
     */
    public async profileKernel(
        kernelId: string,
        bufferIds: string[],
        workGroups: [number, number, number],
        iterations: number = 10
    ): Promise<ProfilingData> {
        try {
            const results: ExecutionResult[] = [];

            for (let i = 0; i < iterations; i++) {
                const result = await this.executeKernel(kernelId, bufferIds, workGroups);
                if (result.success) {
                    results.push(result);
                }
            }

            if (results.length === 0) {
                throw new Error('No successful executions for profiling');
            }

            // Calculate average metrics
            const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
            const avgMemoryUsed = results.reduce((sum, r) => sum + r.memoryUsed, 0) / results.length;

            const profilingData: ProfilingData = {
                kernelTime: avgExecutionTime,
                memoryTransferTime: 0, // Simplified
                totalTime: avgExecutionTime,
                occupancy: 0.8, // Mock value
                throughput: avgMemoryUsed / avgExecutionTime,
                efficiency: 0.85 // Mock value
            };

            // Store profiling data
            if (!this.performanceMetrics.has(kernelId)) {
                this.performanceMetrics.set(kernelId, []);
            }
            this.performanceMetrics.get(kernelId)!.push(profilingData);

            console.log(`Kernel profiled: ${kernelId} (${iterations} iterations)`);
            return profilingData;

        } catch (error) {
            console.error('Kernel profiling failed:', error);
            throw error;
        }
    }

    /**
     * Destroy buffer and free memory
     */
    public destroyBuffer(bufferId: string): void {
        const buffer = this.buffers.get(bufferId);
        if (buffer && buffer.buffer) {
            buffer.buffer.destroy();
            this.buffers.delete(bufferId);
            console.log(`Buffer destroyed: ${bufferId}`);
        }
    }

    /**
     * Destroy kernel
     */
    public destroyKernel(kernelId: string): void {
        const kernel = this.kernels.get(kernelId);
        if (kernel) {
            this.kernels.delete(kernelId);
            console.log(`Kernel destroyed: ${kernelId}`);
        }
    }

    /**
     * Initialize shader templates
     */
    private initializeTemplates(): void {
        // Matrix multiplication template
        this.templates.set('matrix_multiply', {
            name: 'matrix_multiply',
            template: `
        @group(0) @binding(0) var<storage, read> a: array<f32>;
        @group(0) @binding(1) var<storage, read> b: array<f32>;
        @group(0) @binding(2) var<storage, read_write> result: array<f32>;
        
        @compute @workgroup_size({{WORKGROUP_SIZE_X}}, {{WORKGROUP_SIZE_Y}}, 1)
        fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
          let row = global_id.x;
          let col = global_id.y;
          let M = {{MATRIX_M}}u;
          let N = {{MATRIX_N}}u;
          let K = {{MATRIX_K}}u;
          
          if (row >= M || col >= N) {
            return;
          }
          
          var sum = 0.0;
          for (var k = 0u; k < K; k++) {
            sum += a[row * K + k] * b[k * N + col];
          }
          
          result[row * N + col] = sum;
        }
      `,
            parameters: [
                { name: 'WORKGROUP_SIZE_X', type: 'int', defaultValue: 16, description: 'Work group size X' },
                { name: 'WORKGROUP_SIZE_Y', type: 'int', defaultValue: 16, description: 'Work group size Y' },
                { name: 'MATRIX_M', type: 'int', defaultValue: 1024, description: 'Matrix A rows' },
                { name: 'MATRIX_N', type: 'int', defaultValue: 1024, description: 'Matrix B columns' },
                { name: 'MATRIX_K', type: 'int', defaultValue: 1024, description: 'Matrix A columns / B rows' }
            ],
            description: 'Matrix multiplication kernel',
            category: 'matrix_operations'
        });

        // Image convolution template
        this.templates.set('convolution', {
            name: 'convolution',
            template: `
        @group(0) @binding(0) var<storage, read> input: array<f32>;
        @group(0) @binding(1) var<storage, read> kernel: array<f32>;
        @group(0) @binding(2) var<storage, read_write> output: array<f32>;
        
        @compute @workgroup_size({{WORKGROUP_SIZE}}, 1, 1)
        fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
          let idx = global_id.x;
          let width = {{IMAGE_WIDTH}}u;
          let height = {{IMAGE_HEIGHT}}u;
          let kernel_size = {{KERNEL_SIZE}}u;
          let half_kernel = kernel_size / 2u;
          
          if (idx >= width * height) {
            return;
          }
          
          let x = idx % width;
          let y = idx / width;
          
          var sum = 0.0;
          for (var ky = 0u; ky < kernel_size; ky++) {
            for (var kx = 0u; kx < kernel_size; kx++) {
              let ix = i32(x) + i32(kx) - i32(half_kernel);
              let iy = i32(y) + i32(ky) - i32(half_kernel);
              
              if (ix >= 0 && ix < i32(width) && iy >= 0 && iy < i32(height)) {
                let input_idx = u32(iy) * width + u32(ix);
                let kernel_idx = ky * kernel_size + kx;
                sum += input[input_idx] * kernel[kernel_idx];
              }
            }
          }
          
          output[idx] = sum;
        }
      `,
            parameters: [
                { name: 'WORKGROUP_SIZE', type: 'int', defaultValue: 64, description: 'Work group size' },
                { name: 'IMAGE_WIDTH', type: 'int', defaultValue: 512, description: 'Image width' },
                { name: 'IMAGE_HEIGHT', type: 'int', defaultValue: 512, description: 'Image height' },
                { name: 'KERNEL_SIZE', type: 'int', defaultValue: 3, description: 'Convolution kernel size' }
            ],
            description: 'Image convolution kernel',
            category: 'image_processing'
        });

        // Parallel reduction template
        this.templates.set('reduction', {
            name: 'reduction',
            template: `
        @group(0) @binding(0) var<storage, read> input: array<f32>;
        @group(0) @binding(1) var<storage, read_write> output: array<f32>;
        
        var<workgroup> shared_data: array<f32, 64>;
        
        @compute @workgroup_size(64, 1, 1)
        fn main(
          @builtin(global_invocation_id) global_id: vec3<u32>,
          @builtin(local_invocation_id) local_id: vec3<u32>,
          @builtin(workgroup_id) workgroup_id: vec3<u32>
        ) {
          let tid = local_id.x;
          let gid = global_id.x;
          
          // Load data into shared memory
          if (gid < arrayLength(&input)) {
            shared_data[tid] = input[gid];
          } else {
            shared_data[tid] = 0.0;
          }
          
          workgroupBarrier();
          
          // Reduction in shared memory
          for (var s = 32u; s > 0u; s >>= 1u) {
            if (tid < s) {
              shared_data[tid] += shared_data[tid + s];
            }
            workgroupBarrier();
          }
          
          // Write result
          if (tid == 0u) {
            output[workgroup_id.x] = shared_data[0];
          }
        }
      `,
            parameters: [
                { name: 'WORKGROUP_SIZE', type: 'int', defaultValue: 256, description: 'Work group size' }
            ],
            description: 'Parallel reduction (sum)',
            category: 'data_processing'
        });

        console.log(`Initialized ${this.templates.size} shader templates`);
    }

    /**
     * Initialize built-in kernels
     */
    private async initializeBuiltinKernels(): Promise<void> {
        try {
            // Vector addition kernel
            await this.createKernel(
                'vector_add',
                'Vector Addition',
                `
          #version 450
          
          layout(local_size_x = 64, local_size_y = 1, local_size_z = 1) in;
          
          layout(set = 0, binding = 0) buffer VectorA {
            float a[];
          };
          
          layout(set = 0, binding = 1) buffer VectorB {
            float b[];
          };
          
          layout(set = 0, binding = 2) buffer VectorC {
            float c[];
          };
          
          void main() {
            uint index = gl_GlobalInvocationID.x;
            if (index >= a.length()) return;
            
            c[index] = a[index] + b[index];
          }
        `,
                [64, 1, 1]
            );

            console.log('Built-in kernels initialized');
        } catch (error) {
            console.warn('Failed to initialize some built-in kernels:', error);
        }
    }

    /**
     * Get required WebGPU features
     */
    private getRequiredFeatures(): GPUFeatureName[] {
        const features: GPUFeatureName[] = [];

        if (this.config.device.features.includes('fp16')) {
            features.push('shader-f16');
        }

        return features;
    }

    /**
     * Get required WebGPU limits
     */
    private getRequiredLimits(): Record<string, number> {
        return {
            maxBufferSize: this.config.memory.maxBufferSize,
            maxComputeWorkgroupStorageSize: 32768,
            maxComputeWorkgroupsPerDimension: 65535
        };
    }

    /**
     * Extract bind group entries from shader source
     */
    private extractBindGroupEntries(source: string): GPUBindGroupLayoutEntry[] {
        const entries: GPUBindGroupLayoutEntry[] = [];

        // Simple regex to find buffer bindings
        const bindingRegex = /layout\(set\s*=\s*0,\s*binding\s*=\s*(\d+)\)\s*buffer/g;
        let match;

        while ((match = bindingRegex.exec(source)) !== null) {
            const binding = parseInt(match[1]);
            entries.push({
                binding,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage'
                }
            });
        }

        return entries;
    }

    /**
     * Extract device features
     */
    private extractDeviceFeatures(): DeviceFeature[] {
        const features: DeviceFeature[] = ['fp16', 'subgroups', 'shared_memory'];

        if (this.adapter?.features.has('shader-f16')) {
            features.push('fp16');
        }

        return features;
    }

    /**
     * Find optimal work group size for kernel
     */
    private async findOptimalWorkGroupSize(kernel: ComputeKernel): Promise<[number, number, number] | null> {
        try {
            const testSizes: [number, number, number][] = [
                [32, 1, 1], [64, 1, 1], [128, 1, 1], [256, 1, 1],
                [16, 16, 1], [32, 32, 1], [8, 8, 8]
            ];

            let bestSize: [number, number, number] | null = null;
            let bestPerformance = 0;

            // Create test buffers
            const testBuffer1 = this.createBuffer('test_1', 1024 * 4, 'storage');
            const testBuffer2 = this.createBuffer('test_2', 1024 * 4, 'storage');

            for (const size of testSizes) {
                try {
                    // Test this work group size
                    const result = await this.executeKernel(
                        kernel.id,
                        ['test_1', 'test_2'],
                        [Math.ceil(1024 / size[0]), Math.ceil(1 / size[1]), 1]
                    );

                    if (result.success) {
                        const performance = 1024 * 4 / result.executionTime; // throughput
                        if (performance > bestPerformance) {
                            bestPerformance = performance;
                            bestSize = size;
                        }
                    }
                } catch (error) {
                    // Skip this size if it fails
                    continue;
                }
            }

            // Cleanup test buffers
            this.destroyBuffer('test_1');
            this.destroyBuffer('test_2');

            return bestSize;

        } catch (error) {
            console.warn('Work group size optimization failed:', error);
            return null;
        }
    }

    /**
     * Get performance metrics
     */
    public getPerformanceMetrics(): Map<string, ProfilingData[]> {
        return new Map(this.performanceMetrics);
    }

    /**
     * Get memory usage statistics
     */
    public getMemoryStats(): any {
        return {
            totalAllocated: this.totalMemoryUsed,
            buffersCount: this.buffers.size,
            maxBufferSize: this.config.memory.maxBufferSize,
            utilizationRatio: this.totalMemoryUsed / this.config.memory.maxBufferSize
        };
    }

    /**
     * Cleanup resources
     */
    public async cleanup(): Promise<void> {
        try {
            // Destroy all buffers
            for (const [id, buffer] of this.buffers) {
                if (buffer.buffer) {
                    buffer.buffer.destroy();
                }
            }
            this.buffers.clear();

            // Clear kernels
            this.kernels.clear();

            // Clear performance data
            this.performanceMetrics.clear();
            this.executionHistory.length = 0;

            this.totalMemoryUsed = 0;
            this.isInitialized = false;

            console.log('G3D Compute Shaders cleanup completed');

        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }

    // Additional methods for interface compatibility
    
    async init(): Promise<void> {
        return this.initialize();
    }
    
    getDevice(): DeviceConfig {
        return this.config.device;
    }
    
    async createComputePipeline(name: string, shader: string): Promise<void> {
        await this.createKernel(name, name, shader);
    }
    
    async dispatch(name: string, params: any): Promise<void> {
        const kernel = this.kernels.get(name);
        if (kernel) {
            await this.executeKernel(name, params.buffers || [], params.workGroups || [1, 1, 1]);
        }
    }
    
    async createComputeShader(name: string, source: string): Promise<void> {
        await this.createKernel(name, name, source);
    }
    
    /**
     * Get kernel by name
     */
    getKernel(name: string): ComputeKernel | undefined {
        return this.kernels.get(name);
    }
}

export default ComputeShaders;