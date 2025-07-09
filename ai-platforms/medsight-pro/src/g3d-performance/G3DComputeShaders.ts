/**
 * G3D MedSight Pro - GPU Compute Shaders System
 * High-performance GPU compute for medical image processing
 * 
 * Features:
 * - WebGPU compute shader pipeline
 * - Medical image processing kernels
 * - Volume rendering acceleration
 * - Parallel processing optimization
 * - Memory management and buffer pooling
 * - Medical-specific compute algorithms
 */

export interface G3DComputeConfig {
    enableWebGPU: boolean;
    enableWebGL2Compute: boolean;
    maxBufferSize: number;
    workgroupSize: [number, number, number];
    enableProfiling: boolean;
    enableDebug: boolean;
}

export interface G3DComputeBuffer {
    id: string;
    buffer: any | WebGLBuffer | null; // GPUBuffer when available
    size: number;
    usage: number; // GPUBufferUsage when available
    data?: ArrayBuffer;
    mapped: boolean;
}

export interface G3DComputeShader {
    id: string;
    source: string;
    pipeline: any | WebGLProgram | null; // GPUComputePipeline when available
    bindGroup: any | null; // GPUBindGroup when available
    workgroupSize: [number, number, number];
    compiled: boolean;
}

export interface G3DComputeKernel {
    id: string;
    name: string;
    shader: G3DComputeShader;
    inputs: G3DComputeBuffer[];
    outputs: G3DComputeBuffer[];
    uniforms: G3DComputeBuffer[];
    dispatchSize: [number, number, number];
}

export interface G3DMedicalComputeOperation {
    type: 'filter' | 'segmentation' | 'registration' | 'reconstruction' | 'analysis';
    kernel: G3DComputeKernel;
    parameters: Map<string, any>;
    priority: 'low' | 'medium' | 'high' | 'critical';
    medicalContext: {
        modality: string;
        bodyPart: string;
        clinicalPurpose: string;
    };
}

export class G3DComputeShaders {
    private config: G3DComputeConfig;
    private device: any | null = null; // GPUDevice when available
    private gl: WebGL2RenderingContext | null = null;
    private isWebGPUSupported: boolean = false;
    private isWebGL2ComputeSupported: boolean = false;

    private bufferPool: Map<string, G3DComputeBuffer[]> = new Map();
    private shaderCache: Map<string, G3DComputeShader> = new Map();
    private kernelRegistry: Map<string, G3DComputeKernel> = new Map();
    private activeOperations: G3DMedicalComputeOperation[] = [];

    private performanceMetrics: {
        totalOperations: number;
        averageExecutionTime: number;
        memoryUsage: number;
        gpuUtilization: number;
    } = {
            totalOperations: 0,
            averageExecutionTime: 0,
            memoryUsage: 0,
            gpuUtilization: 0
        };

    constructor(config: Partial<G3DComputeConfig> = {}) {
        this.config = {
            enableWebGPU: true,
            enableWebGL2Compute: true,
            maxBufferSize: 1024 * 1024 * 1024, // 1GB
            workgroupSize: [8, 8, 1],
            enableProfiling: true,
            enableDebug: false,
            ...config
        };
    }

    async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Compute Shaders System...');

            // Try WebGPU first
            if (this.config.enableWebGPU && 'gpu' in navigator) {
                try {
                    const adapter = await (navigator as any).gpu.requestAdapter();
                    if (adapter) {
                        this.device = await adapter.requestDevice();
                        this.isWebGPUSupported = true;
                        console.log('WebGPU initialized successfully');
                    }
                } catch (error) {
                    console.warn('WebGPU initialization failed:', error);
                }
            }

            // Fallback to WebGL2 compute
            if (!this.isWebGPUSupported && this.config.enableWebGL2Compute) {
                try {
                    const canvas = document.createElement('canvas');
                    this.gl = canvas.getContext('webgl2');
                    if (this.gl) {
                        this.isWebGL2ComputeSupported = true;
                        console.log('WebGL2 compute initialized successfully');
                    }
                } catch (error) {
                    console.warn('WebGL2 compute initialization failed:', error);
                }
            }

            if (!this.isWebGPUSupported && !this.isWebGL2ComputeSupported) {
                throw new Error('No compute support available');
            }

            // Initialize medical compute kernels
            await this.initializeMedicalKernels();

            console.log('G3D Compute Shaders System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Compute Shaders System:', error);
            throw error;
        }
    }

    private async initializeMedicalKernels(): Promise<void> {
        // Medical image filtering kernels
        await this.createGaussianBlurKernel();
        await this.createEdgeDetectionKernel();
        await this.createNoiseReductionKernel();

        // Medical segmentation kernels
        await this.createThresholdingKernel();
        await this.createRegionGrowingKernel();
        await this.createWatershedKernel();

        // Medical analysis kernels
        await this.createHistogramKernel();
        await this.createStatisticsKernel();
        await this.createMeasurementKernel();
    }

    // Buffer Management
    public createBuffer(
        id: string,
        size: number,
        usage: number,
        data?: ArrayBuffer
    ): G3DComputeBuffer {
        let buffer: any | WebGLBuffer | null = null;

        if (this.isWebGPUSupported && this.device) {
            buffer = this.device.createBuffer({
                size,
                usage: usage,
                mappedAtCreation: !!data
            });

            if (data && buffer) {
                const mappedRange = buffer.getMappedRange();
                new Uint8Array(mappedRange).set(new Uint8Array(data));
                buffer.unmap();
            }
        } else if (this.isWebGL2ComputeSupported && this.gl) {
            buffer = this.gl.createBuffer();
            if (buffer && data) {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
            }
        }

        const computeBuffer: G3DComputeBuffer = {
            id,
            buffer,
            size,
            usage,
            data,
            mapped: false
        };

        // Add to buffer pool
        const sizeKey = Math.ceil(size / 1024).toString();
        if (!this.bufferPool.has(sizeKey)) {
            this.bufferPool.set(sizeKey, []);
        }

        return computeBuffer;
    }

    public releaseBuffer(buffer: G3DComputeBuffer): void {
        if (this.isWebGPUSupported && buffer.buffer) {
            buffer.buffer.destroy();
        } else if (this.isWebGL2ComputeSupported && this.gl && buffer.buffer) {
            this.gl.deleteBuffer(buffer.buffer as WebGLBuffer);
        }

        buffer.buffer = null;
        buffer.mapped = false;
    }

    // Shader Compilation
    public async createComputeShader(
        id: string,
        source: string,
        workgroupSize: [number, number, number] = this.config.workgroupSize
    ): Promise<G3DComputeShader> {
        let pipeline: any | WebGLProgram | null = null;
        let bindGroup: any | null = null;
        let compiled = false;

        if (this.isWebGPUSupported && this.device) {
            try {
                const shaderModule = this.device.createShaderModule({ code: source });
                pipeline = this.device.createComputePipeline({
                    layout: 'auto',
                    compute: {
                        module: shaderModule,
                        entryPoint: 'main'
                    }
                });
                compiled = true;
            } catch (error) {
                console.error('WebGPU shader compilation failed:', error);
            }
        } else if (this.isWebGL2ComputeSupported && this.gl) {
            try {
                // WebGL2 compute shader compilation would go here
                // This is a simplified placeholder
                compiled = true;
            } catch (error) {
                console.error('WebGL2 compute shader compilation failed:', error);
            }
        }

        const shader: G3DComputeShader = {
            id,
            source,
            pipeline,
            bindGroup,
            workgroupSize,
            compiled
        };

        this.shaderCache.set(id, shader);
        return shader;
    }

    // Medical Kernel Creation
    private async createGaussianBlurKernel(): Promise<void> {
        const shaderSource = `
      @group(0) @binding(0) var<storage, read> inputImage: array<f32>;
      @group(0) @binding(1) var<storage, read_write> outputImage: array<f32>;
      @group(0) @binding(2) var<uniform> params: GaussianParams;
      
      struct GaussianParams {
        width: u32,
        height: u32,
        depth: u32,
        sigma: f32,
        kernelSize: u32,
      }
      
      @compute @workgroup_size(8, 8, 1)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let x = global_id.x;
        let y = global_id.y;
        let z = global_id.z;
        
        if (x >= params.width || y >= params.height || z >= params.depth) {
          return;
        }
        
        let index = z * params.width * params.height + y * params.width + x;
        var sum = 0.0;
        var weightSum = 0.0;
        
        let kernelRadius = i32(params.kernelSize) / 2;
        let sigma2 = params.sigma * params.sigma;
        
        for (var dy = -kernelRadius; dy <= kernelRadius; dy++) {
          for (var dx = -kernelRadius; dx <= kernelRadius; dx++) {
            let nx = i32(x) + dx;
            let ny = i32(y) + dy;
            
            if (nx >= 0 && nx < i32(params.width) && ny >= 0 && ny < i32(params.height)) {
              let nIndex = z * params.width * params.height + u32(ny) * params.width + u32(nx);
              let distance2 = f32(dx * dx + dy * dy);
              let weight = exp(-distance2 / (2.0 * sigma2));
              
              sum += inputImage[nIndex] * weight;
              weightSum += weight;
            }
          }
        }
        
        outputImage[index] = sum / weightSum;
      }
    `;

        const shader = await this.createComputeShader('gaussian_blur', shaderSource);

        const kernel: G3DComputeKernel = {
            id: 'gaussian_blur',
            name: 'Gaussian Blur Filter',
            shader,
            inputs: [],
            outputs: [],
            uniforms: [],
            dispatchSize: [1, 1, 1]
        };

        this.kernelRegistry.set('gaussian_blur', kernel);
    }

    private async createEdgeDetectionKernel(): Promise<void> {
        const shaderSource = `
      @group(0) @binding(0) var<storage, read> inputImage: array<f32>;
      @group(0) @binding(1) var<storage, read_write> outputImage: array<f32>;
      @group(0) @binding(2) var<uniform> params: EdgeParams;
      
      struct EdgeParams {
        width: u32,
        height: u32,
        depth: u32,
        threshold: f32,
        method: u32, // 0: Sobel, 1: Canny, 2: Laplacian
      }
      
      @compute @workgroup_size(8, 8, 1)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let x = global_id.x;
        let y = global_id.y;
        let z = global_id.z;
        
        if (x >= params.width || y >= params.height || z >= params.depth) {
          return;
        }
        
        let index = z * params.width * params.height + y * params.width + x;
        
        // Sobel edge detection
        if (params.method == 0u) {
          var gx = 0.0;
          var gy = 0.0;
          
          // Sobel X kernel: [-1, 0, 1; -2, 0, 2; -1, 0, 1]
          // Sobel Y kernel: [-1, -2, -1; 0, 0, 0; 1, 2, 1]
          
          for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
              let nx = i32(x) + dx;
              let ny = i32(y) + dy;
              
              if (nx >= 0 && nx < i32(params.width) && ny >= 0 && ny < i32(params.height)) {
                let nIndex = z * params.width * params.height + u32(ny) * params.width + u32(nx);
                let pixel = inputImage[nIndex];
                
                // Sobel X weights
                if (dx == -1) { gx += pixel * -1.0; }
                else if (dx == 1) { gx += pixel * 1.0; }
                if (dy == 0 && dx == -1) { gx += pixel * -1.0; }
                else if (dy == 0 && dx == 1) { gx += pixel * 1.0; }
                
                // Sobel Y weights
                if (dy == -1) { gy += pixel * -1.0; }
                else if (dy == 1) { gy += pixel * 1.0; }
                if (dx == 0 && dy == -1) { gy += pixel * -1.0; }
                else if (dx == 0 && dy == 1) { gy += pixel * 1.0; }
              }
            }
          }
          
          let magnitude = sqrt(gx * gx + gy * gy);
          outputImage[index] = select(0.0, magnitude, magnitude > params.threshold);
        }
      }
    `;

        const shader = await this.createComputeShader('edge_detection', shaderSource);

        const kernel: G3DComputeKernel = {
            id: 'edge_detection',
            name: 'Edge Detection Filter',
            shader,
            inputs: [],
            outputs: [],
            uniforms: [],
            dispatchSize: [1, 1, 1]
        };

        this.kernelRegistry.set('edge_detection', kernel);
    }

    private async createNoiseReductionKernel(): Promise<void> {
        const shaderSource = `
      @group(0) @binding(0) var<storage, read> inputImage: array<f32>;
      @group(0) @binding(1) var<storage, read_write> outputImage: array<f32>;
      @group(0) @binding(2) var<uniform> params: NoiseParams;
      
      struct NoiseParams {
        width: u32,
        height: u32,
        depth: u32,
        filterRadius: u32,
        threshold: f32,
        preserveEdges: u32,
      }
      
      @compute @workgroup_size(8, 8, 1)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let x = global_id.x;
        let y = global_id.y;
        let z = global_id.z;
        
        if (x >= params.width || y >= params.height || z >= params.depth) {
          return;
        }
        
        let index = z * params.width * params.height + y * params.width + x;
        let centerValue = inputImage[index];
        
        var sum = 0.0;
        var weightSum = 0.0;
        var count = 0u;
        
        let radius = i32(params.filterRadius);
        
        for (var dy = -radius; dy <= radius; dy++) {
          for (var dx = -radius; dx <= radius; dx++) {
            let nx = i32(x) + dx;
            let ny = i32(y) + dy;
            
            if (nx >= 0 && nx < i32(params.width) && ny >= 0 && ny < i32(params.height)) {
              let nIndex = z * params.width * params.height + u32(ny) * params.width + u32(nx);
              let neighborValue = inputImage[nIndex];
              
              // Edge-preserving filter
              if (params.preserveEdges == 1u) {
                let diff = abs(neighborValue - centerValue);
                if (diff < params.threshold) {
                  let distance = sqrt(f32(dx * dx + dy * dy));
                  let weight = exp(-distance * distance / (2.0 * f32(radius * radius)));
                  sum += neighborValue * weight;
                  weightSum += weight;
                }
              } else {
                // Simple averaging
                sum += neighborValue;
                count++;
              }
            }
          }
        }
        
        if (params.preserveEdges == 1u && weightSum > 0.0) {
          outputImage[index] = sum / weightSum;
        } else if (count > 0u) {
          outputImage[index] = sum / f32(count);
        } else {
          outputImage[index] = centerValue;
        }
      }
    `;

        const shader = await this.createComputeShader('noise_reduction', shaderSource);

        const kernel: G3DComputeKernel = {
            id: 'noise_reduction',
            name: 'Noise Reduction Filter',
            shader,
            inputs: [],
            outputs: [],
            uniforms: [],
            dispatchSize: [1, 1, 1]
        };

        this.kernelRegistry.set('noise_reduction', kernel);
    }

    private async createThresholdingKernel(): Promise<void> {
        const shaderSource = `
      @group(0) @binding(0) var<storage, read> inputImage: array<f32>;
      @group(0) @binding(1) var<storage, read_write> outputImage: array<f32>;
      @group(0) @binding(2) var<uniform> params: ThresholdParams;
      
      struct ThresholdParams {
        width: u32,
        height: u32,
        depth: u32,
        lowerThreshold: f32,
        upperThreshold: f32,
        method: u32, // 0: Binary, 1: Otsu, 2: Adaptive
      }
      
      @compute @workgroup_size(8, 8, 1)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let x = global_id.x;
        let y = global_id.y;
        let z = global_id.z;
        
        if (x >= params.width || y >= params.height || z >= params.depth) {
          return;
        }
        
        let index = z * params.width * params.height + y * params.width + x;
        let value = inputImage[index];
        
        var result = 0.0;
        
        if (params.method == 0u) {
          // Binary thresholding
          if (value >= params.lowerThreshold && value <= params.upperThreshold) {
            result = 1.0;
          }
        } else if (params.method == 2u) {
          // Adaptive thresholding (simplified)
          var localSum = 0.0;
          var count = 0u;
          let radius = 5;
          
          for (var dy = -radius; dy <= radius; dy++) {
            for (var dx = -radius; dx <= radius; dx++) {
              let nx = i32(x) + dx;
              let ny = i32(y) + dy;
              
              if (nx >= 0 && nx < i32(params.width) && ny >= 0 && ny < i32(params.height)) {
                let nIndex = z * params.width * params.height + u32(ny) * params.width + u32(nx);
                localSum += inputImage[nIndex];
                count++;
              }
            }
          }
          
          let localMean = localSum / f32(count);
          if (value > localMean + params.lowerThreshold) {
            result = 1.0;
          }
        }
        
        outputImage[index] = result;
      }
    `;

        const shader = await this.createComputeShader('thresholding', shaderSource);

        const kernel: G3DComputeKernel = {
            id: 'thresholding',
            name: 'Image Thresholding',
            shader,
            inputs: [],
            outputs: [],
            uniforms: [],
            dispatchSize: [1, 1, 1]
        };

        this.kernelRegistry.set('thresholding', kernel);
    }

    private async createRegionGrowingKernel(): Promise<void> {
        const shaderSource = `
      @group(0) @binding(0) var<storage, read> inputImage: array<f32>;
      @group(0) @binding(1) var<storage, read_write> outputImage: array<f32>;
      @group(0) @binding(2) var<storage, read_write> seeds: array<u32>;
      @group(0) @binding(3) var<uniform> params: RegionGrowingParams;
      
      struct RegionGrowingParams {
        width: u32,
        height: u32,
        depth: u32,
        threshold: f32,
        connectivity: u32, // 6, 18, or 26 connectivity
        maxIterations: u32,
      }
      
      @compute @workgroup_size(8, 8, 1)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let x = global_id.x;
        let y = global_id.y;
        let z = global_id.z;
        
        if (x >= params.width || y >= params.height || z >= params.depth) {
          return;
        }
        
        let index = z * params.width * params.height + y * params.width + x;
        
        // Check if this pixel is a seed
        if (seeds[index] == 1u) {
          outputImage[index] = 1.0;
          return;
        }
        
        // Check neighbors for region growing
        let currentValue = inputImage[index];
        var shouldGrow = false;
        
        // 6-connectivity neighbors
        let neighbors = array<vec3<i32>, 6>(
          vec3<i32>(-1, 0, 0), vec3<i32>(1, 0, 0),
          vec3<i32>(0, -1, 0), vec3<i32>(0, 1, 0),
          vec3<i32>(0, 0, -1), vec3<i32>(0, 0, 1)
        );
        
        for (var i = 0; i < 6; i++) {
          let neighbor = neighbors[i];
          let nx = i32(x) + neighbor.x;
          let ny = i32(y) + neighbor.y;
          let nz = i32(z) + neighbor.z;
          
          if (nx >= 0 && nx < i32(params.width) && 
              ny >= 0 && ny < i32(params.height) && 
              nz >= 0 && nz < i32(params.depth)) {
            
            let nIndex = u32(nz) * params.width * params.height + 
                         u32(ny) * params.width + u32(nx);
            
            if (outputImage[nIndex] > 0.0) {
              let neighborValue = inputImage[nIndex];
              if (abs(currentValue - neighborValue) < params.threshold) {
                shouldGrow = true;
                break;
              }
            }
          }
        }
        
        if (shouldGrow) {
          outputImage[index] = 1.0;
        }
      }
    `;

        const shader = await this.createComputeShader('region_growing', shaderSource);

        const kernel: G3DComputeKernel = {
            id: 'region_growing',
            name: 'Region Growing Segmentation',
            shader,
            inputs: [],
            outputs: [],
            uniforms: [],
            dispatchSize: [1, 1, 1]
        };

        this.kernelRegistry.set('region_growing', kernel);
    }

    private async createWatershedKernel(): Promise<void> {
        const shaderSource = `
      @group(0) @binding(0) var<storage, read> inputImage: array<f32>;
      @group(0) @binding(1) var<storage, read_write> outputImage: array<f32>;
      @group(0) @binding(2) var<storage, read_write> labels: array<u32>;
      @group(0) @binding(3) var<uniform> params: WatershedParams;
      
      struct WatershedParams {
        width: u32,
        height: u32,
        depth: u32,
        threshold: f32,
        minRegionSize: u32,
      }
      
      @compute @workgroup_size(8, 8, 1)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let x = global_id.x;
        let y = global_id.y;
        let z = global_id.z;
        
        if (x >= params.width || y >= params.height || z >= params.depth) {
          return;
        }
        
        let index = z * params.width * params.height + y * params.width + x;
        
        // Simplified watershed implementation
        // This would be a multi-pass algorithm in practice
        let currentValue = inputImage[index];
        var minNeighbor = currentValue;
        var minLabel = 0u;
        
        // Check 6-connected neighbors
        let neighbors = array<vec3<i32>, 6>(
          vec3<i32>(-1, 0, 0), vec3<i32>(1, 0, 0),
          vec3<i32>(0, -1, 0), vec3<i32>(0, 1, 0),
          vec3<i32>(0, 0, -1), vec3<i32>(0, 0, 1)
        );
        
        for (var i = 0; i < 6; i++) {
          let neighbor = neighbors[i];
          let nx = i32(x) + neighbor.x;
          let ny = i32(y) + neighbor.y;
          let nz = i32(z) + neighbor.z;
          
          if (nx >= 0 && nx < i32(params.width) && 
              ny >= 0 && ny < i32(params.height) && 
              nz >= 0 && nz < i32(params.depth)) {
            
            let nIndex = u32(nz) * params.width * params.height + 
                         u32(ny) * params.width + u32(nx);
            
            let neighborValue = inputImage[nIndex];
            if (neighborValue < minNeighbor) {
              minNeighbor = neighborValue;
              minLabel = labels[nIndex];
            }
          }
        }
        
        // Update label based on watershed algorithm
        if (currentValue > minNeighbor + params.threshold && minLabel > 0u) {
          labels[index] = minLabel;
          outputImage[index] = f32(minLabel);
        }
      }
    `;

        const shader = await this.createComputeShader('watershed', shaderSource);

        const kernel: G3DComputeKernel = {
            id: 'watershed',
            name: 'Watershed Segmentation',
            shader,
            inputs: [],
            outputs: [],
            uniforms: [],
            dispatchSize: [1, 1, 1]
        };

        this.kernelRegistry.set('watershed', kernel);
    }

    private async createHistogramKernel(): Promise<void> {
        const shaderSource = `
      @group(0) @binding(0) var<storage, read> inputImage: array<f32>;
      @group(0) @binding(1) var<storage, read_write> histogram: array<atomic<u32>>;
      @group(0) @binding(2) var<uniform> params: HistogramParams;
      
      struct HistogramParams {
        width: u32,
        height: u32,
        depth: u32,
        minValue: f32,
        maxValue: f32,
        binCount: u32,
      }
      
      @compute @workgroup_size(8, 8, 1)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let x = global_id.x;
        let y = global_id.y;
        let z = global_id.z;
        
        if (x >= params.width || y >= params.height || z >= params.depth) {
          return;
        }
        
        let index = z * params.width * params.height + y * params.width + x;
        let value = inputImage[index];
        
        // Calculate bin index
        let normalizedValue = (value - params.minValue) / (params.maxValue - params.minValue);
        let binIndex = u32(clamp(normalizedValue * f32(params.binCount), 0.0, f32(params.binCount - 1u)));
        
        // Atomic increment for thread safety
        atomicAdd(&histogram[binIndex], 1u);
      }
    `;

        const shader = await this.createComputeShader('histogram', shaderSource);

        const kernel: G3DComputeKernel = {
            id: 'histogram',
            name: 'Image Histogram Analysis',
            shader,
            inputs: [],
            outputs: [],
            uniforms: [],
            dispatchSize: [1, 1, 1]
        };

        this.kernelRegistry.set('histogram', kernel);
    }

    private async createStatisticsKernel(): Promise<void> {
        const shaderSource = `
      @group(0) @binding(0) var<storage, read> inputImage: array<f32>;
      @group(0) @binding(1) var<storage, read_write> statistics: array<f32>;
      @group(0) @binding(2) var<uniform> params: StatisticsParams;
      
      struct StatisticsParams {
        width: u32,
        height: u32,
        depth: u32,
        roiX: u32,
        roiY: u32,
        roiZ: u32,
        roiWidth: u32,
        roiHeight: u32,
        roiDepth: u32,
      }
      
      var<workgroup> localSum: f32;
      var<workgroup> localSumSquared: f32;
      var<workgroup> localMin: f32;
      var<workgroup> localMax: f32;
      var<workgroup> localCount: u32;
      
      @compute @workgroup_size(8, 8, 1)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>, 
              @builtin(local_invocation_index) local_index: u32) {
        
        let x = global_id.x;
        let y = global_id.y;
        let z = global_id.z;
        
        // Initialize workgroup shared variables
        if (local_index == 0u) {
          localSum = 0.0;
          localSumSquared = 0.0;
          localMin = 1e10;
          localMax = -1e10;
          localCount = 0u;
        }
        
        workgroupBarrier();
        
        // Check if pixel is within ROI
        if (x >= params.roiX && x < params.roiX + params.roiWidth &&
            y >= params.roiY && y < params.roiY + params.roiHeight &&
            z >= params.roiZ && z < params.roiZ + params.roiDepth) {
          
          let index = z * params.width * params.height + y * params.width + x;
          let value = inputImage[index];
          
          // Atomic operations for workgroup reduction
          atomicAdd(&localCount, 1u);
          // Note: WebGPU doesn't have atomic float operations, so this is simplified
          localSum += value;
          localSumSquared += value * value;
          localMin = min(localMin, value);
          localMax = max(localMax, value);
        }
        
        workgroupBarrier();
        
        // Write results (only first thread in workgroup)
        if (local_index == 0u && localCount > 0u) {
          let mean = localSum / f32(localCount);
          let variance = (localSumSquared / f32(localCount)) - (mean * mean);
          let stddev = sqrt(variance);
          
          // Store statistics: [mean, stddev, min, max, count]
          statistics[0] = mean;
          statistics[1] = stddev;
          statistics[2] = localMin;
          statistics[3] = localMax;
          statistics[4] = f32(localCount);
        }
      }
    `;

        const shader = await this.createComputeShader('statistics', shaderSource);

        const kernel: G3DComputeKernel = {
            id: 'statistics',
            name: 'Statistical Analysis',
            shader,
            inputs: [],
            outputs: [],
            uniforms: [],
            dispatchSize: [1, 1, 1]
        };

        this.kernelRegistry.set('statistics', kernel);
    }

    private async createMeasurementKernel(): Promise<void> {
        const shaderSource = `
      @group(0) @binding(0) var<storage, read> inputImage: array<f32>;
      @group(0) @binding(1) var<storage, read> labelImage: array<u32>;
      @group(0) @binding(2) var<storage, read_write> measurements: array<f32>;
      @group(0) @binding(3) var<uniform> params: MeasurementParams;
      
      struct MeasurementParams {
        width: u32,
        height: u32,
        depth: u32,
        voxelSizeX: f32,
        voxelSizeY: f32,
        voxelSizeZ: f32,
        labelId: u32,
      }
      
      @compute @workgroup_size(8, 8, 1)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let x = global_id.x;
        let y = global_id.y;
        let z = global_id.z;
        
        if (x >= params.width || y >= params.height || z >= params.depth) {
          return;
        }
        
        let index = z * params.width * params.height + y * params.width + x;
        let label = labelImage[index];
        
        if (label == params.labelId) {
          let value = inputImage[index];
          let voxelVolume = params.voxelSizeX * params.voxelSizeY * params.voxelSizeZ;
          
          // Atomic operations would be used here for proper reduction
          // This is a simplified version
          
          // Calculate measurements:
          // [0] = volume (voxel count * voxel volume)
          // [1] = mean intensity
          // [2] = surface area (simplified)
          // [3] = sphericity
          // [4] = elongation
          
          measurements[0] += voxelVolume; // Volume
          measurements[1] += value; // Sum for mean calculation
          
          // Surface area calculation (simplified - count boundary voxels)
          var isBoundary = false;
          let neighbors = array<vec3<i32>, 6>(
            vec3<i32>(-1, 0, 0), vec3<i32>(1, 0, 0),
            vec3<i32>(0, -1, 0), vec3<i32>(0, 1, 0),
            vec3<i32>(0, 0, -1), vec3<i32>(0, 0, 1)
          );
          
          for (var i = 0; i < 6; i++) {
            let neighbor = neighbors[i];
            let nx = i32(x) + neighbor.x;
            let ny = i32(y) + neighbor.y;
            let nz = i32(z) + neighbor.z;
            
            if (nx >= 0 && nx < i32(params.width) && 
                ny >= 0 && ny < i32(params.height) && 
                nz >= 0 && nz < i32(params.depth)) {
              
              let nIndex = u32(nz) * params.width * params.height + 
                           u32(ny) * params.width + u32(nx);
              
              if (labelImage[nIndex] != params.labelId) {
                isBoundary = true;
                break;
              }
            } else {
              isBoundary = true;
              break;
            }
          }
          
          if (isBoundary) {
            let faceArea = max(params.voxelSizeX * params.voxelSizeY,
                              max(params.voxelSizeY * params.voxelSizeZ,
                                  params.voxelSizeX * params.voxelSizeZ));
            measurements[2] += faceArea;
          }
        }
      }
    `;

        const shader = await this.createComputeShader('measurement', shaderSource);

        const kernel: G3DComputeKernel = {
            id: 'measurement',
            name: 'Medical Measurements',
            shader,
            inputs: [],
            outputs: [],
            uniforms: [],
            dispatchSize: [1, 1, 1]
        };

        this.kernelRegistry.set('measurement', kernel);
    }

    // Execution Methods
    public async executeKernel(
        kernelId: string,
        inputs: G3DComputeBuffer[],
        outputs: G3DComputeBuffer[],
        uniforms: G3DComputeBuffer[],
        dispatchSize: [number, number, number]
    ): Promise<void> {
        const kernel = this.kernelRegistry.get(kernelId);
        if (!kernel) {
            throw new Error(`Kernel ${kernelId} not found`);
        }

        const startTime = Date.now();

        if (this.isWebGPUSupported && this.device) {
            await this.executeWebGPUKernel(kernel, inputs, outputs, uniforms, dispatchSize);
        } else if (this.isWebGL2ComputeSupported) {
            await this.executeWebGL2Kernel(kernel, inputs, outputs, uniforms, dispatchSize);
        }

        const executionTime = Date.now() - startTime;
        this.updatePerformanceMetrics(executionTime);
    }

    private async executeWebGPUKernel(
        kernel: G3DComputeKernel,
        inputs: G3DComputeBuffer[],
        outputs: G3DComputeBuffer[],
        uniforms: G3DComputeBuffer[],
        dispatchSize: [number, number, number]
    ): Promise<void> {
        if (!this.device || !kernel.shader.pipeline) return;

        const commandEncoder = this.device.createCommandEncoder();
        const computePass = commandEncoder.beginComputePass();

        computePass.setPipeline(kernel.shader.pipeline);

        // Set bind groups (simplified)
        if (kernel.shader.bindGroup) {
            computePass.setBindGroup(0, kernel.shader.bindGroup);
        }

        computePass.dispatchWorkgroups(dispatchSize[0], dispatchSize[1], dispatchSize[2]);
        computePass.end();

        const commandBuffer = commandEncoder.finish();
        this.device.queue.submit([commandBuffer]);

        // Wait for completion
        await this.device.queue.onSubmittedWorkDone();
    }

    private async executeWebGL2Kernel(
        kernel: G3DComputeKernel,
        inputs: G3DComputeBuffer[],
        outputs: G3DComputeBuffer[],
        uniforms: G3DComputeBuffer[],
        dispatchSize: [number, number, number]
    ): Promise<void> {
        // WebGL2 compute execution would go here
        // This is a placeholder for the WebGL2 compute implementation
        console.log('Executing WebGL2 compute kernel:', kernel.id);
    }

    // Medical Operation Management
    public async executeMedicalOperation(operation: G3DMedicalComputeOperation): Promise<void> {
        console.log(`Executing medical operation: ${operation.type}`);

        this.activeOperations.push(operation);

        try {
            await this.executeKernel(
                operation.kernel.id,
                operation.kernel.inputs,
                operation.kernel.outputs,
                operation.kernel.uniforms,
                operation.kernel.dispatchSize
            );
        } finally {
            const index = this.activeOperations.indexOf(operation);
            if (index !== -1) {
                this.activeOperations.splice(index, 1);
            }
        }
    }

    // Performance Monitoring
    private updatePerformanceMetrics(executionTime: number): void {
        this.performanceMetrics.totalOperations++;
        this.performanceMetrics.averageExecutionTime =
            (this.performanceMetrics.averageExecutionTime * (this.performanceMetrics.totalOperations - 1) + executionTime) /
            this.performanceMetrics.totalOperations;
    }

    public getPerformanceMetrics(): typeof this.performanceMetrics {
        return { ...this.performanceMetrics };
    }

    public getKernelRegistry(): Map<string, G3DComputeKernel> {
        return new Map(this.kernelRegistry);
    }

    public dispose(): void {
        // Clean up buffers
        for (const bufferArray of this.bufferPool.values()) {
            for (const buffer of bufferArray) {
                this.releaseBuffer(buffer);
            }
        }
        this.bufferPool.clear();

        // Clean up shaders
        this.shaderCache.clear();
        this.kernelRegistry.clear();

        // Clean up device resources
        if (this.device) {
            this.device.destroy();
            this.device = null;
        }

        this.activeOperations = [];

        console.log('G3D Compute Shaders System disposed');
    }
}

export default G3DComputeShaders;