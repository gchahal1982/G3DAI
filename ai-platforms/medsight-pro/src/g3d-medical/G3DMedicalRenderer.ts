/**
 * G3D MedSight Pro - Advanced Medical Rendering Engine
 * Core G3D-powered medical visualization system
 * 
 * Features:
 * - Advanced medical rendering with G3D optimization
 * - WebGL/WebGPU dual-mode support
 * - Medical-specific visualization techniques
 * - Real-time performance optimization
 * - Multi-modal medical imaging support
 * - Clinical workflow integration
 */

/// <reference path="../../webgpu.d.ts" />

import { vec3, mat4, quat } from 'gl-matrix';

// Core G3D Medical Rendering Types
export interface G3DMedicalRenderingConfig {
    renderMode: 'webgl' | 'webgpu' | 'hybrid';
    medicalVisualizationMode: 'diagnostic' | 'surgical' | 'educational' | 'research';
    qualityLevel: 'draft' | 'standard' | 'high' | 'ultra';
    performanceTarget: 'realtime' | 'interactive' | 'quality';
    medicalStandards: {
        dicomCompliance: boolean;
        clinicalAccuracy: boolean;
        measurementPrecision: number;
        colorAccuracy: boolean;
    };
}

export interface G3DMedicalViewport {
    id: string;
    type: 'axial' | 'sagittal' | 'coronal' | '3d' | 'mpr' | 'oblique';
    dimensions: { width: number; height: number };
    medicalParameters: {
        windowLevel: number;
        windowWidth: number;
        zoom: number;
        pan: vec3;
        rotation: quat;
        thickness: number;
        spacing: vec3;
    };
    annotations: G3DMedicalAnnotation[];
    measurements: G3DMedicalMeasurement[];
}

export interface G3DMedicalAnnotation {
    id: string;
    type: 'arrow' | 'circle' | 'rectangle' | 'freehand' | 'text' | 'ruler' | 'angle';
    position: vec3;
    data: any;
    metadata: {
        creator: string;
        timestamp: Date;
        confidence: number;
        clinicalRelevance: 'high' | 'medium' | 'low';
    };
}

export interface G3DMedicalMeasurement {
    id: string;
    type: 'distance' | 'area' | 'volume' | 'angle' | 'density' | 'flow';
    points: vec3[];
    value: number;
    unit: string;
    accuracy: number;
    calibration: G3DMedicalCalibration;
}

export interface G3DMedicalCalibration {
    pixelSpacing: vec3;
    sliceThickness: number;
    rescaleSlope: number;
    rescaleIntercept: number;
    units: string;
}

export interface G3DMedicalRenderingContext {
    canvas: HTMLCanvasElement;
    gl?: WebGL2RenderingContext;
    gpu?: GPUDevice;
    adapter?: GPUAdapter;
    renderPipeline?: GPURenderPipeline;
    computePipeline?: GPUComputePipeline;
}

// Advanced Medical Rendering Shaders
export class G3DMedicalShaderManager {
    private shaders: Map<string, WebGLShader | GPUShaderModule> = new Map();
    private programs: Map<string, WebGLProgram | GPURenderPipeline> = new Map();

    // Medical-specific vertex shader for DICOM data
    private static readonly MEDICAL_VERTEX_SHADER = `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec3 a_normal;
    layout(location = 2) in vec2 a_texCoord;
    layout(location = 3) in vec3 a_medicalCoord;
    
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_projectionMatrix;
    uniform mat4 u_normalMatrix;
    uniform vec3 u_medicalSpacing;
    uniform vec3 u_medicalOffset;
    
    out vec3 v_position;
    out vec3 v_normal;
    out vec2 v_texCoord;
    out vec3 v_medicalCoord;
    out vec3 v_worldPosition;
    
    void main() {
      // Transform medical coordinates to world space
      vec3 medicalPosition = a_position * u_medicalSpacing + u_medicalOffset;
      vec4 worldPosition = u_modelViewMatrix * vec4(medicalPosition, 1.0);
      
      v_position = worldPosition.xyz;
      v_normal = normalize((u_normalMatrix * vec4(a_normal, 0.0)).xyz);
      v_texCoord = a_texCoord;
      v_medicalCoord = a_medicalCoord;
      v_worldPosition = medicalPosition;
      
      gl_Position = u_projectionMatrix * worldPosition;
    }
  `;

    // Medical-specific fragment shader with advanced visualization
    private static readonly MEDICAL_FRAGMENT_SHADER = `#version 300 es
    precision highp float;
    
    in vec3 v_position;
    in vec3 v_normal;
    in vec2 v_texCoord;
    in vec3 v_medicalCoord;
    in vec3 v_worldPosition;
    
    uniform sampler3D u_volumeTexture;
    uniform sampler2D u_transferFunction;
    uniform sampler2D u_medicalLUT;
    
    uniform float u_windowLevel;
    uniform float u_windowWidth;
    uniform float u_opacity;
    uniform vec3 u_lightDirection;
    uniform vec3 u_lightColor;
    uniform float u_ambientStrength;
    uniform float u_specularStrength;
    uniform float u_shininess;
    
    uniform int u_renderingMode; // 0: MIP, 1: Volume, 2: Isosurface, 3: MPR
    uniform float u_isoValue;
    uniform vec3 u_gradientDelta;
    
    out vec4 fragColor;
    
    // Medical windowing function
    float applyWindowing(float value) {
      float center = u_windowLevel;
      float width = u_windowWidth;
      float lower = center - width * 0.5;
      float upper = center + width * 0.5;
      return clamp((value - lower) / width, 0.0, 1.0);
    }
    
    // Gradient calculation for lighting
    vec3 calculateGradient(vec3 coord) {
      vec3 gradient;
      gradient.x = texture(u_volumeTexture, coord + vec3(u_gradientDelta.x, 0.0, 0.0)).r
                 - texture(u_volumeTexture, coord - vec3(u_gradientDelta.x, 0.0, 0.0)).r;
      gradient.y = texture(u_volumeTexture, coord + vec3(0.0, u_gradientDelta.y, 0.0)).r
                 - texture(u_volumeTexture, coord - vec3(0.0, u_gradientDelta.y, 0.0)).r;
      gradient.z = texture(u_volumeTexture, coord + vec3(0.0, 0.0, u_gradientDelta.z)).r
                 - texture(u_volumeTexture, coord - vec3(0.0, 0.0, u_gradientDelta.z)).r;
      return normalize(gradient);
    }
    
    // Advanced medical lighting model
    vec3 calculateMedicalLighting(vec3 normal, vec3 viewDir) {
      vec3 lightDir = normalize(u_lightDirection);
      
      // Ambient component
      vec3 ambient = u_ambientStrength * u_lightColor;
      
      // Diffuse component with medical enhancement
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = diff * u_lightColor;
      
      // Specular component for tissue highlighting
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_shininess);
      vec3 specular = u_specularStrength * spec * u_lightColor;
      
      return ambient + diffuse + specular;
    }
    
    void main() {
      vec3 coord = v_medicalCoord;
      
      if (coord.x < 0.0 || coord.x > 1.0 || 
          coord.y < 0.0 || coord.y > 1.0 || 
          coord.z < 0.0 || coord.z > 1.0) {
        discard;
      }
      
      float intensity = texture(u_volumeTexture, coord).r;
      float windowedIntensity = applyWindowing(intensity);
      
      vec4 color;
      
      if (u_renderingMode == 0) {
        // Maximum Intensity Projection (MIP)
        color = vec4(windowedIntensity, windowedIntensity, windowedIntensity, 1.0);
      } else if (u_renderingMode == 1) {
        // Volume Rendering
        vec4 transferValue = texture(u_transferFunction, vec2(windowedIntensity, 0.5));
        vec3 gradient = calculateGradient(coord);
        vec3 viewDir = normalize(-v_position);
        vec3 lighting = calculateMedicalLighting(gradient, viewDir);
        color = vec4(transferValue.rgb * lighting, transferValue.a * u_opacity);
      } else if (u_renderingMode == 2) {
        // Isosurface Rendering
        if (abs(intensity - u_isoValue) > 0.01) {
          discard;
        }
        vec3 gradient = calculateGradient(coord);
        vec3 viewDir = normalize(-v_position);
        vec3 lighting = calculateMedicalLighting(gradient, viewDir);
        color = vec4(lighting, 1.0);
      } else {
        // Multi-Planar Reconstruction (MPR)
        vec4 medicalColor = texture(u_medicalLUT, vec2(windowedIntensity, 0.5));
        color = vec4(medicalColor.rgb, medicalColor.a * u_opacity);
      }
      
      fragColor = color;
    }
  `;

    constructor(private context: G3DMedicalRenderingContext) { }

    async initializeMedicalShaders(): Promise<void> {
        if (this.context.gl) {
            await this.initializeWebGLShaders();
        }
        if (this.context.gpu) {
            await this.initializeWebGPUShaders();
        }
    }

    private async initializeWebGLShaders(): Promise<void> {
        const gl = this.context.gl!;

        // Compile vertex shader
        const vertexShader = this.compileShader(gl, G3DMedicalShaderManager.MEDICAL_VERTEX_SHADER, gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(gl, G3DMedicalShaderManager.MEDICAL_FRAGMENT_SHADER, gl.FRAGMENT_SHADER);

        // Create and link program
        const program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Medical shader program linking failed: ' + gl.getProgramInfoLog(program));
        }

        this.programs.set('medical', program);
    }

    private compileShader(gl: WebGL2RenderingContext, source: string, type: number): WebGLShader {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error('Shader compilation failed: ' + gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    private async initializeWebGPUShaders(): Promise<void> {
        const device = this.context.gpu!;

        const shaderModule = device.createShaderModule({
            code: `
        struct VertexInput {
          @location(0) position: vec3<f32>,
          @location(1) normal: vec3<f32>,
          @location(2) texCoord: vec2<f32>,
          @location(3) medicalCoord: vec3<f32>,
        }
        
        struct VertexOutput {
          @builtin(position) position: vec4<f32>,
          @location(0) worldPos: vec3<f32>,
          @location(1) normal: vec3<f32>,
          @location(2) texCoord: vec2<f32>,
          @location(3) medicalCoord: vec3<f32>,
        }
        
        struct Uniforms {
          modelViewMatrix: mat4x4<f32>,
          projectionMatrix: mat4x4<f32>,
          normalMatrix: mat4x4<f32>,
          medicalSpacing: vec3<f32>,
          medicalOffset: vec3<f32>,
          windowLevel: f32,
          windowWidth: f32,
          opacity: f32,
        }
        
        @group(0) @binding(0) var<uniform> uniforms: Uniforms;
        @group(0) @binding(1) var volumeTexture: texture_3d<f32>;
        @group(0) @binding(2) var volumeSampler: sampler;
        
        @vertex
        fn vs_main(input: VertexInput) -> VertexOutput {
          var output: VertexOutput;
          
          let medicalPosition = input.position * uniforms.medicalSpacing + uniforms.medicalOffset;
          let worldPosition = uniforms.modelViewMatrix * vec4<f32>(medicalPosition, 1.0);
          
          output.position = uniforms.projectionMatrix * worldPosition;
          output.worldPos = worldPosition.xyz;
          output.normal = normalize((uniforms.normalMatrix * vec4<f32>(input.normal, 0.0)).xyz);
          output.texCoord = input.texCoord;
          output.medicalCoord = input.medicalCoord;
          
          return output;
        }
        
        @fragment
        fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
          let coord = input.medicalCoord;
          
          if (coord.x < 0.0 || coord.x > 1.0 || 
              coord.y < 0.0 || coord.y > 1.0 || 
              coord.z < 0.0 || coord.z > 1.0) {
            discard;
          }
          
          let intensity = textureSample(volumeTexture, volumeSampler, coord).r;
          
          // Apply medical windowing
          let center = uniforms.windowLevel;
          let width = uniforms.windowWidth;
          let lower = center - width * 0.5;
          let upper = center + width * 0.5;
          let windowedIntensity = clamp((intensity - lower) / width, 0.0, 1.0);
          
          return vec4<f32>(windowedIntensity, windowedIntensity, windowedIntensity, uniforms.opacity);
        }
      `
        });

        this.shaders.set('medical-webgpu', shaderModule);
    }

    getProgram(name: string): WebGLProgram | GPURenderPipeline | undefined {
        return this.programs.get(name);
    }
}

// Advanced Medical Texture Manager
export class G3DMedicalTextureManager {
    private textures: Map<string, WebGLTexture | GPUTexture> = new Map();
    private transferFunctions: Map<string, WebGLTexture | GPUTexture> = new Map();
    private medicalLUTs: Map<string, WebGLTexture | GPUTexture> = new Map();

    constructor(private context: G3DMedicalRenderingContext) { }

    async createVolumeTexture(
        data: ArrayBuffer,
        dimensions: vec3,
        format: 'uint8' | 'uint16' | 'float32' = 'uint16'
    ): Promise<string> {
        const textureId = `volume_${Date.now()}_${Math.random()}`;

        if (this.context.gl) {
            const texture = this.createWebGLVolumeTexture(data, dimensions, format);
            this.textures.set(textureId, texture);
        }

        if (this.context.gpu) {
            const texture = await this.createWebGPUVolumeTexture(data, dimensions, format);
            this.textures.set(textureId + '_webgpu', texture);
        }

        return textureId;
    }

    private createWebGLVolumeTexture(
        data: ArrayBuffer,
        dimensions: vec3,
        format: 'uint8' | 'uint16' | 'float32'
    ): WebGLTexture {
        const gl = this.context.gl!;
        const texture = gl.createTexture()!;

        gl.bindTexture(gl.TEXTURE_3D, texture);

        let internalFormat: number;
        let dataFormat: number;
        let dataType: number;
        let typedData: ArrayBufferView;

        switch (format) {
            case 'uint8':
                internalFormat = gl.R8;
                dataFormat = gl.RED;
                dataType = gl.UNSIGNED_BYTE;
                typedData = new Uint8Array(data);
                break;
            case 'uint16':
                internalFormat = gl.R16UI;
                dataFormat = gl.RED_INTEGER;
                dataType = gl.UNSIGNED_SHORT;
                typedData = new Uint16Array(data);
                break;
            case 'float32':
                internalFormat = gl.R32F;
                dataFormat = gl.RED;
                dataType = gl.FLOAT;
                typedData = new Float32Array(data);
                break;
        }

        gl.texImage3D(
            gl.TEXTURE_3D,
            0,
            internalFormat,
            dimensions[0],
            dimensions[1],
            dimensions[2],
            0,
            dataFormat,
            dataType,
            typedData
        );

        // Set medical-appropriate filtering
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        return texture;
    }

    private async createWebGPUVolumeTexture(
        data: ArrayBuffer,
        dimensions: vec3,
        format: 'uint8' | 'uint16' | 'float32'
    ): Promise<GPUTexture> {
        const device = this.context.gpu!;

        let gpuFormat: GPUTextureFormat;
        let bytesPerPixel: number;

        switch (format) {
            case 'uint8':
                gpuFormat = 'r8unorm';
                bytesPerPixel = 1;
                break;
            case 'uint16':
                gpuFormat = 'r16uint';
                bytesPerPixel = 2;
                break;
            case 'float32':
                gpuFormat = 'r32float';
                bytesPerPixel = 4;
                break;
        }

        const texture = device.createTexture({
            size: {
                width: dimensions[0],
                height: dimensions[1],
                depthOrArrayLayers: dimensions[2]
            },
            format: gpuFormat,
            dimension: '3d',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        });

        // Upload data to GPU
        const bytesPerRow = dimensions[0] * bytesPerPixel;
        const rowsPerImage = dimensions[1];

        device.queue.writeTexture(
            { texture },
            data,
            {
                bytesPerRow,
                rowsPerImage
            },
            {
                width: dimensions[0],
                height: dimensions[1],
                depthOrArrayLayers: dimensions[2]
            }
        );

        return texture;
    }

    createMedicalTransferFunction(
        windowLevel: number,
        windowWidth: number,
        colorMap: 'grayscale' | 'hot' | 'cool' | 'bone' | 'custom' = 'grayscale',
        customColors?: Float32Array
    ): string {
        const tfId = `tf_${Date.now()}_${Math.random()}`;
        const resolution = 256;

        let colors: Float32Array;

        if (colorMap === 'custom' && customColors) {
            colors = customColors;
        } else {
            colors = this.generateMedicalColorMap(colorMap, resolution, windowLevel, windowWidth);
        }

        if (this.context.gl) {
            const texture = this.createWebGLTransferFunction(colors, resolution);
            this.transferFunctions.set(tfId, texture);
        }

        if (this.context.gpu) {
            const texture = this.createWebGPUTransferFunction(colors, resolution);
            this.transferFunctions.set(tfId + '_webgpu', texture);
        }

        return tfId;
    }

    private generateMedicalColorMap(
        type: 'grayscale' | 'hot' | 'cool' | 'bone' | 'custom',
        resolution: number,
        windowLevel: number,
        windowWidth: number
    ): Float32Array {
        const colors = new Float32Array(resolution * 4); // RGBA

        for (let i = 0; i < resolution; i++) {
            const t = i / (resolution - 1);
            let r: number, g: number, b: number, a: number;

            switch (type) {
                case 'grayscale':
                    r = g = b = t;
                    a = t > 0 ? 1.0 : 0.0;
                    break;
                case 'hot':
                    r = Math.min(1.0, t * 3);
                    g = Math.min(1.0, Math.max(0, t * 3 - 1));
                    b = Math.min(1.0, Math.max(0, t * 3 - 2));
                    a = t;
                    break;
                case 'cool':
                    r = t;
                    g = 1.0 - t;
                    b = 1.0;
                    a = t;
                    break;
                case 'bone':
                    r = Math.min(1.0, t * 7 / 8);
                    g = Math.min(1.0, t);
                    b = Math.min(1.0, t * 9 / 8);
                    a = t;
                    break;
                case 'custom':
                    // Custom color map handling - fallback to grayscale
                    r = g = b = t;
                    a = t > 0 ? 1.0 : 0.0;
                    break;
                default:
                    r = g = b = a = t;
            }

            colors[i * 4] = r;
            colors[i * 4 + 1] = g;
            colors[i * 4 + 2] = b;
            colors[i * 4 + 3] = a;
        }

        return colors;
    }

    private createWebGLTransferFunction(colors: Float32Array, resolution: number): WebGLTexture {
        const gl = this.context.gl!;
        const texture = gl.createTexture()!;

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA32F,
            resolution,
            1,
            0,
            gl.RGBA,
            gl.FLOAT,
            colors
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        return texture;
    }

    private createWebGPUTransferFunction(colors: Float32Array, resolution: number): GPUTexture {
        const device = this.context.gpu!;

        const texture = device.createTexture({
            size: { width: resolution, height: 1 },
            format: 'rgba32float',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        });

        device.queue.writeTexture(
            { texture },
            colors.buffer,
            { bytesPerRow: resolution * 16 }, // 4 floats * 4 bytes
            { width: resolution, height: 1 }
        );

        return texture;
    }

    getTexture(id: string, preferWebGPU: boolean = false): WebGLTexture | GPUTexture | undefined {
        if (preferWebGPU && this.textures.has(id + '_webgpu')) {
            return this.textures.get(id + '_webgpu');
        }
        return this.textures.get(id);
    }

    getTransferFunction(id: string, preferWebGPU: boolean = false): WebGLTexture | GPUTexture | undefined {
        if (preferWebGPU && this.transferFunctions.has(id + '_webgpu')) {
            return this.transferFunctions.get(id + '_webgpu');
        }
        return this.transferFunctions.get(id);
    }
}

// Main G3D Medical Renderer Class
export class G3DMedicalRenderer {
    private config: G3DMedicalRenderingConfig;
    private context: G3DMedicalRenderingContext;
    private shaderManager: G3DMedicalShaderManager;
    private textureManager: G3DMedicalTextureManager;
    private viewports: Map<string, G3DMedicalViewport> = new Map();
    private renderTargets: Map<string, WebGLFramebuffer | GPUTexture> = new Map();
    private isInitialized: boolean = false;

    constructor(canvas: HTMLCanvasElement, config: Partial<G3DMedicalRenderingConfig> = {}) {
        this.config = {
            renderMode: 'hybrid',
            medicalVisualizationMode: 'diagnostic',
            qualityLevel: 'high',
            performanceTarget: 'interactive',
            medicalStandards: {
                dicomCompliance: true,
                clinicalAccuracy: true,
                measurementPrecision: 0.1,
                colorAccuracy: true
            },
            ...config
        };

        this.context = { canvas };
        this.shaderManager = new G3DMedicalShaderManager(this.context);
        this.textureManager = new G3DMedicalTextureManager(this.context);
    }

    async initialize(): Promise<void> {
        try {
            await this.initializeRenderingContext();
            await this.shaderManager.initializeMedicalShaders();
            this.setupDefaultViewports();
            this.isInitialized = true;
            console.log('G3D Medical Renderer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Medical Renderer:', error);
            throw error;
        }
    }

    private async initializeRenderingContext(): Promise<void> {
        // Initialize WebGL2 context
        if (this.config.renderMode === 'webgl' || this.config.renderMode === 'hybrid') {
            const gl = this.context.canvas.getContext('webgl2', {
                alpha: false,
                depth: true,
                stencil: true,
                antialias: true,
                preserveDrawingBuffer: false,
                powerPreference: 'high-performance'
            });

            if (!gl) {
                throw new Error('WebGL2 not supported');
            }

            this.context.gl = gl;

            // Enable necessary WebGL extensions for medical imaging
            const extensions = [
                'EXT_color_buffer_float',
                'OES_texture_float_linear',
                'WEBGL_depth_texture',
                'EXT_texture_filter_anisotropic'
            ];

            extensions.forEach(ext => {
                const extension = gl.getExtension(ext);
                if (!extension) {
                    console.warn(`WebGL extension ${ext} not available`);
                }
            });
        }

        // Initialize WebGPU context
        if (this.config.renderMode === 'webgpu' || this.config.renderMode === 'hybrid') {
            if ('gpu' in navigator) {
                try {
                    const adapter = await (navigator as any).gpu.requestAdapter({
                        powerPreference: 'high-performance'
                    });

                    if (!adapter) {
                        throw new Error('WebGPU adapter not available');
                    }

                    const device = await adapter.requestDevice({
                        requiredFeatures: ['texture-compression-bc']
                    });

                    this.context.adapter = adapter;
                    this.context.gpu = device;

                    console.log('WebGPU initialized for medical rendering');
                } catch (error) {
                    console.warn('WebGPU initialization failed:', error);
                    if (this.config.renderMode === 'webgpu') {
                        throw error;
                    }
                }
            }
        }
    }

    private setupDefaultViewports(): void {
        // Create standard medical viewports
        const viewportConfigs = [
            { id: 'axial', type: 'axial' as const },
            { id: 'sagittal', type: 'sagittal' as const },
            { id: 'coronal', type: 'coronal' as const },
            { id: '3d', type: '3d' as const }
        ];

        viewportConfigs.forEach(config => {
            const viewport: G3DMedicalViewport = {
                id: config.id,
                type: config.type,
                dimensions: { width: 512, height: 512 },
                medicalParameters: {
                    windowLevel: 40,
                    windowWidth: 400,
                    zoom: 1.0,
                    pan: vec3.create(),
                    rotation: quat.create(),
                    thickness: 1.0,
                    spacing: vec3.fromValues(1, 1, 1)
                },
                annotations: [],
                measurements: []
            };

            this.viewports.set(config.id, viewport);
        });
    }

    async loadMedicalVolume(
        data: ArrayBuffer,
        dimensions: vec3,
        spacing: vec3,
        calibration: G3DMedicalCalibration,
        format: 'uint8' | 'uint16' | 'float32' = 'uint16'
    ): Promise<string> {
        if (!this.isInitialized) {
            throw new Error('Renderer not initialized');
        }

        const volumeId = await this.textureManager.createVolumeTexture(data, dimensions, format);

        // Update viewport parameters based on medical data
        this.viewports.forEach(viewport => {
            viewport.medicalParameters.spacing = vec3.clone(spacing);
        });

        console.log(`Medical volume loaded: ${dimensions[0]}x${dimensions[1]}x${dimensions[2]}`);
        return volumeId;
    }

    setMedicalWindowing(viewportId: string, windowLevel: number, windowWidth: number): void {
        const viewport = this.viewports.get(viewportId);
        if (viewport) {
            viewport.medicalParameters.windowLevel = windowLevel;
            viewport.medicalParameters.windowWidth = windowWidth;
        }
    }

    addMedicalAnnotation(viewportId: string, annotation: Omit<G3DMedicalAnnotation, 'id'>): string {
        const viewport = this.viewports.get(viewportId);
        if (!viewport) {
            throw new Error(`Viewport ${viewportId} not found`);
        }

        const annotationId = `annotation_${Date.now()}_${Math.random()}`;
        const fullAnnotation: G3DMedicalAnnotation = {
            id: annotationId,
            ...annotation
        };

        viewport.annotations.push(fullAnnotation);
        return annotationId;
    }

    addMedicalMeasurement(viewportId: string, measurement: Omit<G3DMedicalMeasurement, 'id'>): string {
        const viewport = this.viewports.get(viewportId);
        if (!viewport) {
            throw new Error(`Viewport ${viewportId} not found`);
        }

        const measurementId = `measurement_${Date.now()}_${Math.random()}`;
        const fullMeasurement: G3DMedicalMeasurement = {
            id: measurementId,
            ...measurement
        };

        viewport.measurements.push(fullMeasurement);
        return measurementId;
    }

    render(viewportId?: string): void {
        if (!this.isInitialized) {
            console.warn('Cannot render: renderer not initialized');
            return;
        }

        if (viewportId) {
            this.renderViewport(viewportId);
        } else {
            // Render all viewports
            this.viewports.forEach((_, id) => this.renderViewport(id));
        }
    }

    private renderViewport(viewportId: string): void {
        const viewport = this.viewports.get(viewportId);
        if (!viewport) {
            console.warn(`Viewport ${viewportId} not found`);
            return;
        }

        if (this.context.gl) {
            this.renderWebGL(viewport);
        }

        if (this.context.gpu) {
            this.renderWebGPU(viewport);
        }
    }

    private renderWebGL(viewport: G3DMedicalViewport): void {
        const gl = this.context.gl!;
        const program = this.shaderManager.getProgram('medical') as WebGLProgram;

        if (!program) {
            console.warn('Medical shader program not available');
            return;
        }

        gl.useProgram(program);

        // Set viewport
        gl.viewport(0, 0, viewport.dimensions.width, viewport.dimensions.height);

        // Clear with medical-appropriate background
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set medical-specific uniforms
        const windowLevelLoc = gl.getUniformLocation(program, 'u_windowLevel');
        const windowWidthLoc = gl.getUniformLocation(program, 'u_windowWidth');

        if (windowLevelLoc) {
            gl.uniform1f(windowLevelLoc, viewport.medicalParameters.windowLevel);
        }
        if (windowWidthLoc) {
            gl.uniform1f(windowWidthLoc, viewport.medicalParameters.windowWidth);
        }

        // Render medical volume based on viewport type
        switch (viewport.type) {
            case 'axial':
            case 'sagittal':
            case 'coronal':
                this.renderMPRSlice(gl, program, viewport);
                break;
            case '3d':
                this.renderVolumeRendering(gl, program, viewport);
                break;
            case 'mpr':
                this.renderMultiPlanarReconstruction(gl, program, viewport);
                break;
        }

        // Render annotations and measurements
        this.renderAnnotations(gl, viewport);
        this.renderMeasurements(gl, viewport);
    }

    private renderWebGPU(viewport: G3DMedicalViewport): void {
        // WebGPU rendering implementation
        const device = this.context.gpu!;

        // Implementation would go here for WebGPU medical rendering
        console.log(`WebGPU rendering for viewport ${viewport.id} not yet implemented`);
    }

    private renderMPRSlice(gl: WebGL2RenderingContext, program: WebGLProgram, viewport: G3DMedicalViewport): void {
        // Multi-planar reconstruction slice rendering
        const renderModeLoc = gl.getUniformLocation(program, 'u_renderingMode');
        if (renderModeLoc) {
            gl.uniform1i(renderModeLoc, 3); // MPR mode
        }

        // Render slice based on viewport orientation
        // Implementation details would depend on the specific medical data structure
    }

    private renderVolumeRendering(gl: WebGL2RenderingContext, program: WebGLProgram, viewport: G3DMedicalViewport): void {
        // Volume rendering implementation
        const renderModeLoc = gl.getUniformLocation(program, 'u_renderingMode');
        if (renderModeLoc) {
            gl.uniform1i(renderModeLoc, 1); // Volume mode
        }

        // Set up volume rendering parameters
        // Implementation would include ray casting or texture slicing
    }

    private renderMultiPlanarReconstruction(gl: WebGL2RenderingContext, program: WebGLProgram, viewport: G3DMedicalViewport): void {
        // Advanced MPR rendering with arbitrary plane orientations
        // Implementation for oblique slices and curved reformations
    }

    private renderAnnotations(gl: WebGL2RenderingContext, viewport: G3DMedicalViewport): void {
        // Render medical annotations (arrows, circles, text, etc.)
        viewport.annotations.forEach(annotation => {
            // Render each annotation type
        });
    }

    private renderMeasurements(gl: WebGL2RenderingContext, viewport: G3DMedicalViewport): void {
        // Render medical measurements (distances, areas, volumes, etc.)
        viewport.measurements.forEach(measurement => {
            // Render each measurement type
        });
    }

    getMedicalMetrics(): object {
        return {
            renderMode: this.config.renderMode,
            viewportCount: this.viewports.size,
            isInitialized: this.isInitialized,
            webglSupported: !!this.context.gl,
            webgpuSupported: !!this.context.gpu,
            medicalStandards: this.config.medicalStandards
        };
    }

    dispose(): void {
        // Clean up resources
        if (this.context.gl) {
            // Clean up WebGL resources
        }

        if (this.context.gpu) {
            // Clean up WebGPU resources
        }

        this.viewports.clear();
        this.renderTargets.clear();
        this.isInitialized = false;

        console.log('G3D Medical Renderer disposed');
    }
}

export default G3DMedicalRenderer;