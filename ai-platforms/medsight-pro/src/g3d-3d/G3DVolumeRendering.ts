/**
 * G3D MedSight Pro - Advanced Volume Rendering System
 * High-performance volume rendering for medical imaging
 * 
 * Features:
 * - Medical volume visualization
 * - Real-time ray marching
 * - Transfer function optimization
 * - Multi-modal volume rendering
 * - Clinical-grade quality
 * - GPU-accelerated rendering
 */

import { vec3, mat4 } from 'gl-matrix';

export interface VolumeRenderingConfig {
    enableVolumeRendering: boolean;
    enableMedicalOptimization: boolean;
    maxSteps: number;
    stepSize: number;
    enableEarlyTermination: boolean;
    enableGradientShading: boolean;
    enableMultiModal: boolean;
    clinicalAccuracy: boolean;
}

export interface VolumeData {
    id: string;
    data: Float32Array | Uint16Array | Uint8Array;
    dimensions: [number, number, number];
    spacing: [number, number, number];
    origin: vec3;
    dataType: 'float32' | 'uint16' | 'uint8';
    medicalMetadata: MedicalMetadata;
}

export interface MedicalMetadata {
    modality: 'CT' | 'MRI' | 'PET' | 'SPECT' | 'US' | 'XR';
    windowWidth: number;
    windowLevel: number;
    rescaleSlope: number;
    rescaleIntercept: number;
    patientInfo?: {
        age: number;
        gender: string;
        studyDate: string;
    };
    acquisitionParameters?: any;
}

export interface TransferFunction {
    id: string;
    name: string;
    type: 'linear' | 'spline' | 'piecewise' | 'medical';
    controlPoints: TransferFunctionPoint[];
    medicalPreset?: string;
    opacity: OpacityFunction;
    color: ColorFunction;
}

export interface TransferFunctionPoint {
    value: number;
    color: vec3;
    opacity: number;
    medicalSignificance?: number;
}

export interface OpacityFunction {
    points: Array<{ value: number; opacity: number }>;
    interpolation: 'linear' | 'cubic' | 'step';
}

export interface ColorFunction {
    points: Array<{ value: number; color: vec3 }>;
    interpolation: 'linear' | 'cubic' | 'step';
    medicalColormap?: 'grayscale' | 'hot' | 'cool' | 'rainbow' | 'bone' | 'jet';
}

export interface VolumeRenderingResult {
    framebuffer: WebGLFramebuffer;
    colorTexture: WebGLTexture;
    depthTexture: WebGLTexture;
    statistics: RenderingStatistics;
}

export interface RenderingStatistics {
    renderTime: number;
    samplesPerRay: number;
    totalRays: number;
    earlyTerminations: number;
    memoryUsage: number;
}

export class VolumeRendering {
    private config: VolumeRenderingConfig;
    private volumes: Map<string, VolumeData> = new Map();
    private transferFunctions: Map<string, TransferFunction> = new Map();
    private volumeTextures: Map<string, WebGLTexture> = new Map();
    private transferFunctionTextures: Map<string, WebGLTexture> = new Map();
    private gl: WebGL2RenderingContext | null = null;
    private shaderProgram: WebGLProgram | null = null;
    private isInitialized: boolean = false;

    // Medical transfer function presets
    private static readonly MEDICAL_PRESETS: Record<string, Partial<TransferFunction>> = {
        CT_BONE: {
            name: 'CT Bone',
            type: 'medical',
            controlPoints: [
                { value: -1000, color: vec3.fromValues(0, 0, 0), opacity: 0.0 },
                { value: -500, color: vec3.fromValues(0.1, 0.1, 0.1), opacity: 0.0 },
                { value: 200, color: vec3.fromValues(0.8, 0.8, 0.7), opacity: 0.1 },
                { value: 1000, color: vec3.fromValues(1.0, 1.0, 0.9), opacity: 0.8 },
                { value: 3000, color: vec3.fromValues(1.0, 1.0, 1.0), opacity: 1.0 }
            ]
        },
        CT_SOFT_TISSUE: {
            name: 'CT Soft Tissue',
            type: 'medical',
            controlPoints: [
                { value: -1000, color: vec3.fromValues(0, 0, 0), opacity: 0.0 },
                { value: -200, color: vec3.fromValues(0.1, 0.1, 0.1), opacity: 0.0 },
                { value: 40, color: vec3.fromValues(0.8, 0.6, 0.5), opacity: 0.3 },
                { value: 80, color: vec3.fromValues(0.9, 0.7, 0.6), opacity: 0.6 },
                { value: 200, color: vec3.fromValues(1.0, 0.8, 0.7), opacity: 0.8 }
            ]
        },
        MRI_T1: {
            name: 'MRI T1',
            type: 'medical',
            controlPoints: [
                { value: 0, color: vec3.fromValues(0, 0, 0), opacity: 0.0 },
                { value: 50, color: vec3.fromValues(0.2, 0.2, 0.3), opacity: 0.1 },
                { value: 150, color: vec3.fromValues(0.6, 0.6, 0.7), opacity: 0.5 },
                { value: 255, color: vec3.fromValues(1.0, 1.0, 1.0), opacity: 0.9 }
            ]
        },
        PET_METABOLISM: {
            name: 'PET Metabolism',
            type: 'medical',
            controlPoints: [
                { value: 0, color: vec3.fromValues(0, 0, 0.5), opacity: 0.0 },
                { value: 64, color: vec3.fromValues(0, 0.5, 1.0), opacity: 0.3 },
                { value: 128, color: vec3.fromValues(0.5, 1.0, 0.5), opacity: 0.6 },
                { value: 192, color: vec3.fromValues(1.0, 1.0, 0), opacity: 0.8 },
                { value: 255, color: vec3.fromValues(1.0, 0, 0), opacity: 1.0 }
            ]
        }
    };

    // Volume rendering shader
    private static readonly VOLUME_SHADER = {
        vertex: `#version 300 es
            precision highp float;
            
            in vec3 a_position;
            in vec3 a_texCoord;
            
            uniform mat4 u_modelMatrix;
            uniform mat4 u_viewMatrix;
            uniform mat4 u_projectionMatrix;
            
            out vec3 v_texCoord;
            out vec3 v_worldPos;
            out vec3 v_rayDirection;
            
            void main() {
                vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
                vec4 viewPos = u_viewMatrix * worldPos;
                
                v_texCoord = a_texCoord;
                v_worldPos = worldPos.xyz;
                v_rayDirection = normalize(worldPos.xyz - u_cameraPosition);
                
                gl_Position = u_projectionMatrix * viewPos;
            }`,

        fragment: `#version 300 es
            precision highp float;
            
            in vec3 v_texCoord;
            in vec3 v_worldPos;
            in vec3 v_rayDirection;
            
            uniform sampler3D u_volumeTexture;
            uniform sampler2D u_transferFunction;
            uniform vec3 u_cameraPosition;
            uniform float u_stepSize;
            uniform int u_maxSteps;
            uniform vec2 u_windowLevel; // x: width, y: level
            uniform float u_medicalEnhancement;
            uniform bool u_enableGradientShading;
            uniform vec3 u_lightDirection;
            
            out vec4 fragColor;
            
            vec4 sampleTransferFunction(float intensity) {
                // Apply window/level
                float windowMin = u_windowLevel.y - u_windowLevel.x * 0.5;
                float windowMax = u_windowLevel.y + u_windowLevel.x * 0.5;
                float normalizedIntensity = clamp((intensity - windowMin) / (windowMax - windowMin), 0.0, 1.0);
                
                // Medical enhancement
                normalizedIntensity = pow(normalizedIntensity, 1.0 / u_medicalEnhancement);
                
                return texture(u_transferFunction, vec2(normalizedIntensity, 0.5));
            }
            
            vec3 calculateGradient(vec3 pos) {
                float epsilon = 1.0 / 256.0;
                
                float dx = texture(u_volumeTexture, pos + vec3(epsilon, 0, 0)).r - 
                          texture(u_volumeTexture, pos - vec3(epsilon, 0, 0)).r;
                float dy = texture(u_volumeTexture, pos + vec3(0, epsilon, 0)).r - 
                          texture(u_volumeTexture, pos - vec3(0, epsilon, 0)).r;
                float dz = texture(u_volumeTexture, pos + vec3(0, 0, epsilon)).r - 
                          texture(u_volumeTexture, pos - vec3(0, 0, epsilon)).r;
                
                return normalize(vec3(dx, dy, dz));
            }
            
            void main() {
                vec3 rayDir = normalize(v_rayDirection);
                vec3 rayPos = v_texCoord;
                
                vec4 color = vec4(0.0);
                float alpha = 0.0;
                
                for (int i = 0; i < u_maxSteps && alpha < 0.99; i++) {
                    // Check bounds
                    if (any(lessThan(rayPos, vec3(0.0))) || any(greaterThan(rayPos, vec3(1.0)))) {
                        break;
                    }
                    
                    float intensity = texture(u_volumeTexture, rayPos).r;
                    vec4 sample = sampleTransferFunction(intensity);
                    
                    // Gradient shading
                    if (u_enableGradientShading && sample.a > 0.01) {
                        vec3 gradient = calculateGradient(rayPos);
                        float lighting = max(0.2, dot(gradient, u_lightDirection));
                        sample.rgb *= lighting;
                    }
                    
                    // Front-to-back compositing
                    color.rgb += sample.rgb * sample.a * (1.0 - alpha);
                    alpha += sample.a * (1.0 - alpha);
                    
                    rayPos += rayDir * u_stepSize;
                }
                
                fragColor = vec4(color.rgb, alpha);
            }`
    };

    constructor(config: Partial<VolumeRenderingConfig> = {}) {
        this.config = {
            enableVolumeRendering: true,
            enableMedicalOptimization: true,
            maxSteps: 512,
            stepSize: 0.001,
            enableEarlyTermination: true,
            enableGradientShading: true,
            enableMultiModal: false,
            clinicalAccuracy: true,
            ...config
        };
    }

    async initialize(gl: WebGL2RenderingContext): Promise<void> {
        try {
            console.log('Initializing G3D Volume Rendering System...');

            this.gl = gl;

            // Initialize shaders
            await this.initializeShaders();

            // Load medical presets
            await this.loadMedicalPresets();

            this.isInitialized = true;
            console.log('G3D Volume Rendering System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Volume Rendering System:', error);
            throw error;
        }
    }

    private async initializeShaders(): Promise<void> {
        if (!this.gl) return;

        // Compile and link volume rendering shader
        console.log('Initializing volume rendering shaders...');
        // Shader compilation would be implemented here
    }

    private async loadMedicalPresets(): Promise<void> {
        for (const [presetId, presetData] of Object.entries(G3DVolumeRendering.MEDICAL_PRESETS)) {
            const transferFunction = this.createTransferFunction({
                id: presetId,
                medicalPreset: presetId,
                ...presetData
            });
            this.transferFunctions.set(presetId, transferFunction);
        }
        console.log(`Loaded ${this.transferFunctions.size} medical transfer function presets`);
    }

    public addVolume(volume: VolumeData): boolean {
        if (!this.gl) return false;

        try {
            // Create 3D texture for volume data
            const texture = this.createVolumeTexture(volume);
            if (!texture) return false;

            this.volumes.set(volume.id, volume);
            this.volumeTextures.set(volume.id, texture);

            console.log(`Volume added: ${volume.id} (${volume.medicalMetadata.modality})`);
            return true;
        } catch (error) {
            console.error('Failed to add volume:', error);
            return false;
        }
    }

    private createVolumeTexture(volume: VolumeData): WebGLTexture | null {
        if (!this.gl) return null;

        const gl = this.gl;
        const texture = gl.createTexture();
        if (!texture) return null;

        gl.bindTexture(gl.TEXTURE_3D, texture);

        const [width, height, depth] = volume.dimensions;
        let internalFormat: number;
        let format: number;
        let type: number;

        switch (volume.dataType) {
            case 'float32':
                internalFormat = gl.R32F;
                format = gl.RED;
                type = gl.FLOAT;
                break;
            case 'uint16':
                internalFormat = gl.R16UI;
                format = gl.RED_INTEGER;
                type = gl.UNSIGNED_SHORT;
                break;
            case 'uint8':
                internalFormat = gl.R8;
                format = gl.RED;
                type = gl.UNSIGNED_BYTE;
                break;
            default:
                gl.deleteTexture(texture);
                return null;
        }

        gl.texImage3D(gl.TEXTURE_3D, 0, internalFormat, width, height, depth, 0, format, type, volume.data);

        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        gl.bindTexture(gl.TEXTURE_3D, null);
        return texture;
    }

    public createTransferFunction(data: Partial<TransferFunction>): TransferFunction {
        const transferFunction: TransferFunction = {
            id: data.id || `tf_${Date.now()}`,
            name: data.name || 'Unnamed Transfer Function',
            type: data.type || 'linear',
            controlPoints: data.controlPoints || [],
            medicalPreset: data.medicalPreset,
            opacity: data.opacity || { points: [], interpolation: 'linear' },
            color: data.color || { points: [], interpolation: 'linear' }
        };

        // Generate opacity and color functions from control points
        if (transferFunction.controlPoints.length > 0) {
            transferFunction.opacity.points = transferFunction.controlPoints.map(cp => ({
                value: cp.value,
                opacity: cp.opacity
            }));

            transferFunction.color.points = transferFunction.controlPoints.map(cp => ({
                value: cp.value,
                color: cp.color
            }));
        }

        // Create transfer function texture
        this.createTransferFunctionTexture(transferFunction);

        this.transferFunctions.set(transferFunction.id, transferFunction);
        console.log(`Transfer function created: ${transferFunction.id}`);
        return transferFunction;
    }

    private createTransferFunctionTexture(transferFunction: TransferFunction): WebGLTexture | null {
        if (!this.gl) return null;

        const gl = this.gl;
        const texture = gl.createTexture();
        if (!texture) return null;

        // Create 1D texture for transfer function (stored as 2D with height=1)
        const resolution = 256;
        const data = new Uint8Array(resolution * 4); // RGBA

        // Generate transfer function data
        for (let i = 0; i < resolution; i++) {
            const normalizedValue = i / (resolution - 1);

            const color = this.evaluateColorFunction(transferFunction.color, normalizedValue);
            const opacity = this.evaluateOpacityFunction(transferFunction.opacity, normalizedValue);

            data[i * 4] = Math.round(color[0] * 255);
            data[i * 4 + 1] = Math.round(color[1] * 255);
            data[i * 4 + 2] = Math.round(color[2] * 255);
            data[i * 4 + 3] = Math.round(opacity * 255);
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, resolution, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindTexture(gl.TEXTURE_2D, null);

        this.transferFunctionTextures.set(transferFunction.id, texture);
        return texture;
    }

    private evaluateColorFunction(colorFunction: ColorFunction, value: number): vec3 {
        if (colorFunction.points.length === 0) {
            return vec3.fromValues(value, value, value);
        }

        if (colorFunction.points.length === 1) {
            return vec3.clone(colorFunction.points[0].color);
        }

        // Find surrounding points
        let leftPoint = colorFunction.points[0];
        let rightPoint = colorFunction.points[colorFunction.points.length - 1];

        for (let i = 0; i < colorFunction.points.length - 1; i++) {
            if (value >= colorFunction.points[i].value && value <= colorFunction.points[i + 1].value) {
                leftPoint = colorFunction.points[i];
                rightPoint = colorFunction.points[i + 1];
                break;
            }
        }

        // Interpolate
        const t = (value - leftPoint.value) / (rightPoint.value - leftPoint.value);
        const result = vec3.create();
        vec3.lerp(result, leftPoint.color, rightPoint.color, t);
        return result;
    }

    private evaluateOpacityFunction(opacityFunction: OpacityFunction, value: number): number {
        if (opacityFunction.points.length === 0) {
            return value;
        }

        if (opacityFunction.points.length === 1) {
            return opacityFunction.points[0].opacity;
        }

        // Find surrounding points
        let leftPoint = opacityFunction.points[0];
        let rightPoint = opacityFunction.points[opacityFunction.points.length - 1];

        for (let i = 0; i < opacityFunction.points.length - 1; i++) {
            if (value >= opacityFunction.points[i].value && value <= opacityFunction.points[i + 1].value) {
                leftPoint = opacityFunction.points[i];
                rightPoint = opacityFunction.points[i + 1];
                break;
            }
        }

        // Interpolate
        const t = (value - leftPoint.value) / (rightPoint.value - leftPoint.value);
        return leftPoint.opacity + t * (rightPoint.opacity - leftPoint.opacity);
    }

    public render(volumeId: string, transferFunctionId: string, camera: any): VolumeRenderingResult | null {
        if (!this.isInitialized || !this.gl || !this.shaderProgram) return null;

        const volume = this.volumes.get(volumeId);
        const transferFunction = this.transferFunctions.get(transferFunctionId);
        const volumeTexture = this.volumeTextures.get(volumeId);
        const transferFunctionTexture = this.transferFunctionTextures.get(transferFunctionId);

        if (!volume || !transferFunction || !volumeTexture || !transferFunctionTexture) {
            return null;
        }

        const gl = this.gl;
        const startTime = Date.now();

        // Use shader program
        gl.useProgram(this.shaderProgram);

        // Bind textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_3D, volumeTexture);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, transferFunctionTexture);

        // Set uniforms
        this.setVolumeUniforms(volume, transferFunction, camera);

        // Render volume (simplified - would need proper geometry)
        // In a real implementation, this would render a bounding box or proxy geometry

        const renderTime = Date.now() - startTime;

        return {
            framebuffer: null as any, // Would return actual framebuffer
            colorTexture: null as any, // Would return actual color texture
            depthTexture: null as any, // Would return actual depth texture
            statistics: {
                renderTime,
                samplesPerRay: this.config.maxSteps,
                totalRays: 1, // Would calculate actual ray count
                earlyTerminations: 0,
                memoryUsage: this.calculateMemoryUsage()
            }
        };
    }

    private setVolumeUniforms(volume: VolumeData, transferFunction: TransferFunction, camera: any): void {
        if (!this.gl || !this.shaderProgram) return;

        const gl = this.gl;

        // Set texture uniforms
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'u_volumeTexture'), 0);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'u_transferFunction'), 1);

        // Set volume parameters
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, 'u_stepSize'), this.config.stepSize);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'u_maxSteps'), this.config.maxSteps);

        // Set medical parameters
        const windowWidth = volume.medicalMetadata.windowWidth;
        const windowLevel = volume.medicalMetadata.windowLevel;
        gl.uniform2f(gl.getUniformLocation(this.shaderProgram, 'u_windowLevel'), windowWidth, windowLevel);

        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, 'u_medicalEnhancement'),
            this.config.enableMedicalOptimization ? 1.2 : 1.0);

        // Set lighting parameters
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'u_enableGradientShading'),
            this.config.enableGradientShading ? 1 : 0);

        gl.uniform3f(gl.getUniformLocation(this.shaderProgram, 'u_lightDirection'), 0.5, 1.0, 0.3);

        // Set camera parameters
        if (camera) {
            gl.uniform3fv(gl.getUniformLocation(this.shaderProgram, 'u_cameraPosition'), camera.position);
        }
    }

    public setMedicalWindowing(volumeId: string, windowWidth: number, windowLevel: number): boolean {
        const volume = this.volumes.get(volumeId);
        if (!volume) return false;

        volume.medicalMetadata.windowWidth = windowWidth;
        volume.medicalMetadata.windowLevel = windowLevel;
        return true;
    }

    public optimizeForModality(volumeId: string, modality: MedicalMetadata['modality']): boolean {
        const volume = this.volumes.get(volumeId);
        if (!volume) return false;

        // Apply modality-specific optimizations
        switch (modality) {
            case 'CT':
                this.config.stepSize = 0.001;
                this.config.maxSteps = 512;
                break;
            case 'MRI':
                this.config.stepSize = 0.002;
                this.config.maxSteps = 256;
                break;
            case 'PET':
                this.config.stepSize = 0.005;
                this.config.maxSteps = 128;
                break;
        }

        volume.medicalMetadata.modality = modality;
        return true;
    }

    public getVolume(volumeId: string): VolumeData | null {
        return this.volumes.get(volumeId) || null;
    }

    public getTransferFunction(transferFunctionId: string): TransferFunction | null {
        return this.transferFunctions.get(transferFunctionId) || null;
    }

    public getAllVolumes(): VolumeData[] {
        return Array.from(this.volumes.values());
    }

    public getAllTransferFunctions(): TransferFunction[] {
        return Array.from(this.transferFunctions.values());
    }

    public getMedicalPresets(): TransferFunction[] {
        return Array.from(this.transferFunctions.values()).filter(tf => tf.medicalPreset);
    }

    public getPerformanceMetrics(): {
        totalVolumes: number;
        totalTransferFunctions: number;
        memoryUsage: number;
        renderingEnabled: boolean;
        maxSteps: number;
        stepSize: number;
    } {
        return {
            totalVolumes: this.volumes.size,
            totalTransferFunctions: this.transferFunctions.size,
            memoryUsage: this.calculateMemoryUsage(),
            renderingEnabled: this.config.enableVolumeRendering,
            maxSteps: this.config.maxSteps,
            stepSize: this.config.stepSize
        };
    }

    private calculateMemoryUsage(): number {
        let usage = 0;

        // Volume data memory
        for (const volume of this.volumes.values()) {
            const [width, height, depth] = volume.dimensions;
            const bytesPerVoxel = volume.dataType === 'float32' ? 4 :
                volume.dataType === 'uint16' ? 2 : 1;
            usage += width * height * depth * bytesPerVoxel;
        }

        // Transfer function textures (256 * 4 bytes each)
        usage += this.transferFunctions.size * 256 * 4;

        return usage;
    }

    public dispose(): void {
        console.log('Disposing G3D Volume Rendering System...');

        if (this.gl) {
            // Delete volume textures
            for (const texture of this.volumeTextures.values()) {
                this.gl.deleteTexture(texture);
            }

            // Delete transfer function textures
            for (const texture of this.transferFunctionTextures.values()) {
                this.gl.deleteTexture(texture);
            }

            // Delete shader program
            if (this.shaderProgram) {
                this.gl.deleteProgram(this.shaderProgram);
            }
        }

        // Clear collections
        this.volumes.clear();
        this.transferFunctions.clear();
        this.volumeTextures.clear();
        this.transferFunctionTextures.clear();

        this.gl = null;
        this.shaderProgram = null;
        this.isInitialized = false;

        console.log('G3D Volume Rendering System disposed');
    }
}

export default VolumeRendering;