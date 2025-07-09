/**
 * G3D3DRenderer.ts
 * 
 * Advanced 3D rendering and visualization engine for G3D AnnotateAI.
 * Provides GPU-accelerated rendering pipelines, real-time 3D visualization,
 * and high-performance rendering for complex 3D annotation workflows.
 */

import { G3DComputeShaders } from '../g3d-ai/G3DComputeShaders';

// Core interfaces for 3D rendering
export interface RenderConfig {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    renderer: RendererType;
    quality: RenderQuality;
    features: RenderFeature[];
    performance: PerformanceConfig;
    lighting: LightingConfig;
    materials: MaterialConfig;
    postProcessing: PostProcessingConfig;
}

export type RendererType = 'webgpu' | 'webgl2' | 'webgl' | 'software';
export type RenderQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface RenderFeature {
    name: string;
    enabled: boolean;
    config: Record<string, any>;
}

export interface PerformanceConfig {
    targetFPS: number;
    adaptiveQuality: boolean;
    frustumCulling: boolean;
    occlusionCulling: boolean;
    levelOfDetail: boolean;
    instancing: boolean;
    batching: boolean;
}

export interface LightingConfig {
    ambientLight: AmbientLight;
    directionalLights: DirectionalLight[];
    pointLights: PointLight[];
    spotLights: SpotLight[];
    shadows: ShadowConfig;
    globalIllumination: GIConfig;
}

export interface AmbientLight {
    color: [number, number, number];
    intensity: number;
}

export interface DirectionalLight {
    direction: [number, number, number];
    color: [number, number, number];
    intensity: number;
    castShadows: boolean;
}

export interface PointLight {
    position: [number, number, number];
    color: [number, number, number];
    intensity: number;
    range: number;
    castShadows: boolean;
}

export interface SpotLight {
    position: [number, number, number];
    direction: [number, number, number];
    color: [number, number, number];
    intensity: number;
    range: number;
    angle: number;
    penumbra: number;
    castShadows: boolean;
}

export interface ShadowConfig {
    enabled: boolean;
    type: 'hard' | 'soft' | 'pcf' | 'pcss';
    resolution: number;
    bias: number;
    normalBias: number;
    cascades: number;
}

export interface GIConfig {
    enabled: boolean;
    technique: 'ssao' | 'ssgi' | 'vxgi' | 'rtgi';
    samples: number;
    intensity: number;
    radius: number;
}

export interface MaterialConfig {
    defaultMaterial: Material;
    shaderCache: boolean;
    materialBatching: boolean;
    textureStreaming: boolean;
}

export interface Material {
    name: string;
    type: MaterialType;
    properties: MaterialProperties;
    textures: TextureMap;
    shader: ShaderConfig;
}

export type MaterialType = 'standard' | 'unlit' | 'pbr' | 'custom';

export interface MaterialProperties {
    albedo: [number, number, number, number];
    metallic: number;
    roughness: number;
    normal: number;
    emission: [number, number, number];
    transparency: number;
    ior: number;
}

export interface TextureMap {
    diffuse?: Texture;
    normal?: Texture;
    metallic?: Texture;
    roughness?: Texture;
    emission?: Texture;
    occlusion?: Texture;
    height?: Texture;
}

export interface Texture {
    id: string;
    url: string;
    format: TextureFormat;
    filtering: TextureFiltering;
    wrapping: TextureWrapping;
    mipmaps: boolean;
}

export type TextureFormat = 'rgba8' | 'rgb8' | 'rg8' | 'r8' | 'rgba16f' | 'rgb16f';
export type TextureFiltering = 'nearest' | 'linear' | 'anisotropic';
export type TextureWrapping = 'repeat' | 'clamp' | 'mirror';

export interface ShaderConfig {
    vertex: string;
    fragment: string;
    compute?: string;
    defines: Record<string, any>;
    uniforms: Record<string, any>;
}

export interface PostProcessingConfig {
    enabled: boolean;
    effects: PostProcessingEffect[];
    antiAliasing: AAConfig;
    toneMapping: ToneMappingConfig;
    colorGrading: ColorGradingConfig;
}

export interface PostProcessingEffect {
    name: string;
    enabled: boolean;
    order: number;
    parameters: Record<string, any>;
}

export interface AAConfig {
    type: 'none' | 'fxaa' | 'smaa' | 'taa' | 'msaa';
    samples: number;
    quality: number;
}

export interface ToneMappingConfig {
    type: 'linear' | 'reinhard' | 'aces' | 'filmic';
    exposure: number;
    whitePoint: number;
}

export interface ColorGradingConfig {
    enabled: boolean;
    contrast: number;
    brightness: number;
    saturation: number;
    gamma: number;
    lut?: Texture;
}

// Scene and object interfaces
export interface Scene {
    id: string;
    name: string;
    objects: SceneObject[];
    camera: Camera;
    environment: Environment;
    fog: FogConfig;
    physics: PhysicsConfig;
}

export interface SceneObject {
    id: string;
    name: string;
    type: ObjectType;
    transform: Transform;
    geometry: Geometry;
    material: Material;
    visible: boolean;
    castShadows: boolean;
    receiveShadows: boolean;
    lod: LODConfig;
    animation: AnimationConfig;
}

export type ObjectType = 'mesh' | 'light' | 'camera' | 'helper' | 'annotation';

export interface Transform {
    position: [number, number, number];
    rotation: [number, number, number, number]; // quaternion
    scale: [number, number, number];
    matrix: Float32Array; // 4x4 matrix
}

export interface Geometry {
    id: string;
    type: GeometryType;
    vertices: Float32Array;
    indices: Uint32Array;
    normals: Float32Array;
    uvs: Float32Array;
    tangents: Float32Array;
    colors?: Float32Array;
    boundingBox: BoundingBox;
    boundingSphere: BoundingSphere;
}

export type GeometryType = 'triangles' | 'lines' | 'points' | 'quads';

export interface BoundingBox {
    min: [number, number, number];
    max: [number, number, number];
}

export interface BoundingSphere {
    center: [number, number, number];
    radius: number;
}

export interface LODConfig {
    enabled: boolean;
    levels: LODLevel[];
    bias: number;
    hysteresis: number;
}

export interface LODLevel {
    distance: number;
    geometry: Geometry;
    material: Material;
}

export interface AnimationConfig {
    enabled: boolean;
    clips: AnimationClip[];
    mixer: AnimationMixer;
}

export interface AnimationClip {
    name: string;
    duration: number;
    tracks: AnimationTrack[];
    loop: boolean;
}

export interface AnimationTrack {
    property: string;
    keyframes: Keyframe[];
    interpolation: 'linear' | 'step' | 'cubic';
}

export interface Keyframe {
    time: number;
    value: number | number[];
}

export interface AnimationMixer {
    time: number;
    speed: number;
    actions: AnimationAction[];
}

export interface AnimationAction {
    clip: string;
    weight: number;
    enabled: boolean;
    loop: boolean;
}

export interface Camera {
    type: CameraType;
    position: [number, number, number];
    target: [number, number, number];
    up: [number, number, number];
    fov: number;
    aspect: number;
    near: number;
    far: number;
    projection: Float32Array; // 4x4 matrix
    view: Float32Array; // 4x4 matrix
}

export type CameraType = 'perspective' | 'orthographic';

export interface Environment {
    skybox: Skybox;
    fog: FogConfig;
    wind: WindConfig;
    weather: WeatherConfig;
}

export interface Skybox {
    type: 'color' | 'gradient' | 'cubemap' | 'hdri';
    data: any;
}

export interface FogConfig {
    enabled: boolean;
    type: 'linear' | 'exponential' | 'exponential2';
    color: [number, number, number];
    density: number;
    near: number;
    far: number;
}

export interface WindConfig {
    enabled: boolean;
    direction: [number, number, number];
    strength: number;
    turbulence: number;
}

export interface WeatherConfig {
    type: 'clear' | 'cloudy' | 'rainy' | 'snowy';
    intensity: number;
    particles: ParticleConfig;
}

export interface ParticleConfig {
    enabled: boolean;
    count: number;
    size: number;
    velocity: [number, number, number];
    acceleration: [number, number, number];
    life: number;
}

export interface PhysicsConfig {
    enabled: boolean;
    gravity: [number, number, number];
    timestep: number;
    iterations: number;
}

// Rendering pipeline interfaces
export interface RenderPipeline {
    name: string;
    passes: RenderPass[];
    resources: RenderResource[];
    dependencies: string[];
}

export interface RenderPass {
    name: string;
    type: PassType;
    inputs: RenderTarget[];
    outputs: RenderTarget[];
    shader: ShaderProgram;
    state: RenderState;
    enabled: boolean;
}

export type PassType = 'geometry' | 'lighting' | 'shadow' | 'postprocess' | 'compute';

export interface RenderTarget {
    name: string;
    format: TextureFormat;
    width: number;
    height: number;
    samples: number;
    mipLevels: number;
}

export interface RenderResource {
    name: string;
    type: 'buffer' | 'texture' | 'sampler';
    data: any;
}

export interface ShaderProgram {
    id: string;
    vertex: string;
    fragment: string;
    compute?: string;
    uniforms: UniformBuffer[];
    textures: TextureBinding[];
}

export interface UniformBuffer {
    name: string;
    binding: number;
    data: Float32Array | Uint32Array;
}

export interface TextureBinding {
    name: string;
    binding: number;
    texture: Texture;
    sampler: Sampler;
}

export interface Sampler {
    magFilter: 'nearest' | 'linear';
    minFilter: 'nearest' | 'linear' | 'nearest-mipmap-nearest' | 'linear-mipmap-nearest' | 'nearest-mipmap-linear' | 'linear-mipmap-linear';
    wrapS: 'repeat' | 'clamp-to-edge' | 'mirrored-repeat';
    wrapT: 'repeat' | 'clamp-to-edge' | 'mirrored-repeat';
    anisotropy: number;
}

export interface RenderState {
    culling: CullingState;
    depth: DepthState;
    blend: BlendState;
    stencil: StencilState;
    viewport: ViewportState;
}

export interface CullingState {
    enabled: boolean;
    face: 'front' | 'back' | 'front-and-back';
    winding: 'cw' | 'ccw';
}

export interface DepthState {
    test: boolean;
    write: boolean;
    func: 'never' | 'less' | 'equal' | 'lequal' | 'greater' | 'notequal' | 'gequal' | 'always';
}

export interface BlendState {
    enabled: boolean;
    srcFactor: BlendFactor;
    dstFactor: BlendFactor;
    equation: BlendEquation;
}

export type BlendFactor = 'zero' | 'one' | 'src-color' | 'one-minus-src-color' | 'dst-color' | 'one-minus-dst-color' | 'src-alpha' | 'one-minus-src-alpha' | 'dst-alpha' | 'one-minus-dst-alpha';
export type BlendEquation = 'add' | 'subtract' | 'reverse-subtract' | 'min' | 'max';

export interface StencilState {
    enabled: boolean;
    func: 'never' | 'less' | 'equal' | 'lequal' | 'greater' | 'notequal' | 'gequal' | 'always';
    ref: number;
    mask: number;
    fail: StencilOp;
    zfail: StencilOp;
    zpass: StencilOp;
}

export type StencilOp = 'keep' | 'zero' | 'replace' | 'incr' | 'incr-wrap' | 'decr' | 'decr-wrap' | 'invert';

export interface ViewportState {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Performance and statistics interfaces
export interface RenderStats {
    frameTime: number;
    fps: number;
    drawCalls: number;
    triangles: number;
    vertices: number;
    textureMemory: number;
    bufferMemory: number;
    shaderSwitches: number;
    renderTargetSwitches: number;
}

export interface PerformanceProfiler {
    enabled: boolean;
    samples: number;
    history: PerformanceFrame[];
    averages: PerformanceAverages;
}

export interface PerformanceFrame {
    timestamp: number;
    frameTime: number;
    cpuTime: number;
    gpuTime: number;
    passes: PassTiming[];
}

export interface PassTiming {
    name: string;
    cpuTime: number;
    gpuTime: number;
    drawCalls: number;
}

export interface PerformanceAverages {
    frameTime: number;
    cpuTime: number;
    gpuTime: number;
    fps: number;
}

/**
 * G3D-powered 3D rendering engine
 */
export class G3D3DRenderer {
    private config: RenderConfig;
    private computeShaders: G3DComputeShaders;

    // Rendering context
    private device: GPUDevice | null = null;
    private context: GPUCanvasContext | null = null;
    private format: GPUTextureFormat = 'bgra8unorm';

    // Scene management
    private scenes: Map<string, Scene> = new Map();
    private activeScene: Scene | null = null;

    // Rendering pipeline
    private pipelines: Map<string, RenderPipeline> = new Map();
    private activePipeline: RenderPipeline | null = null;

    // Resources
    private geometries: Map<string, Geometry> = new Map();
    private materials: Map<string, Material> = new Map();
    private textures: Map<string, Texture> = new Map();
    private shaders: Map<string, ShaderProgram> = new Map();

    // GPU resources
    private buffers: Map<string, GPUBuffer> = new Map();
    private renderTargets: Map<string, GPUTexture> = new Map();
    private bindGroups: Map<string, GPUBindGroup> = new Map();

    // Performance tracking
    private stats: RenderStats = {
        frameTime: 0,
        fps: 0,
        drawCalls: 0,
        triangles: 0,
        vertices: 0,
        textureMemory: 0,
        bufferMemory: 0,
        shaderSwitches: 0,
        renderTargetSwitches: 0
    };

    private profiler: PerformanceProfiler = {
        enabled: false,
        samples: 60,
        history: [],
        averages: {
            frameTime: 0,
            cpuTime: 0,
            gpuTime: 0,
            fps: 0
        }
    };

    // Animation system
    private animationTime: number = 0;
    private animationSpeed: number = 1.0;
    private isAnimating: boolean = false;

    constructor(config: RenderConfig) {
        this.config = config;
        this.initializeComputeShaders();
    }

    /**
     * Initialize compute shaders for GPU acceleration
     */
    private initializeComputeShaders(): void {
        this.computeShaders = new G3DComputeShaders({
            backend: 'webgpu',
            device: {
                preferredDevice: 'gpu',
                minComputeUnits: 8,
                minMemorySize: 512 * 1024 * 1024,
                features: ['fp16', 'subgroups', 'shared_memory']
            },
            memory: {
                maxBufferSize: 2 * 1024 * 1024 * 1024,
                alignment: 256,
                caching: 'adaptive',
                pooling: { enabled: true, initialSize: 128, maxSize: 1024, growthFactor: 2 },
                compression: { enabled: false, algorithm: 'lz4', level: 1 }
            },
            optimization: {
                autoTuning: true,
                workGroupOptimization: true,
                memoryCoalescing: true,
                loopUnrolling: true,
                constantFolding: true,
                deadCodeElimination: true
            },
            debugging: {
                enabled: false,
                profiling: true,
                validation: false,
                verboseLogging: false
            },
            kernels: []
        });
    }

    /**
     * Initialize the 3D renderer
     */
    public async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D 3D Renderer...');

            // Initialize compute shaders
            await this.computeShaders.initialize();

            // Initialize WebGPU
            await this.initializeWebGPU();

            // Create default resources
            await this.createDefaultResources();

            // Initialize default pipeline
            await this.createDefaultPipeline();

            console.log('G3D 3D Renderer initialized successfully');

        } catch (error) {
            console.error('Failed to initialize 3D renderer:', error);
            throw error;
        }
    }

    /**
     * Initialize WebGPU context
     */
    private async initializeWebGPU(): Promise<void> {
        if (!navigator.gpu) {
            throw new Error('WebGPU not supported');
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error('Failed to get WebGPU adapter');
        }

        this.device = await adapter.requestDevice();
        if (!this.device) {
            throw new Error('Failed to get WebGPU device');
        }

        // Get canvas context
        if (this.config.canvas instanceof HTMLCanvasElement) {
            this.context = this.config.canvas.getContext('webgpu');
            if (!this.context) {
                throw new Error('Failed to get WebGPU context');
            }

            this.context.configure({
                device: this.device,
                format: this.format,
                alphaMode: 'premultiplied'
            });
        }
    }

    /**
     * Create default rendering resources
     */
    private async createDefaultResources(): Promise<void> {
        // Create default geometry (cube)
        const cubeGeometry = this.createCubeGeometry();
        this.geometries.set('cube', cubeGeometry);

        // Create default material
        const defaultMaterial = this.createDefaultMaterial();
        this.materials.set('default', defaultMaterial);

        // Create default shader
        const defaultShader = await this.createDefaultShader();
        this.shaders.set('default', defaultShader);
    }

    /**
     * Create default rendering pipeline
     */
    private async createDefaultPipeline(): Promise<void> {
        const pipeline: RenderPipeline = {
            name: 'default',
            passes: [
                {
                    name: 'geometry',
                    type: 'geometry',
                    inputs: [],
                    outputs: [
                        {
                            name: 'color',
                            format: 'rgba8',
                            width: this.config.canvas.width,
                            height: this.config.canvas.height,
                            samples: 1,
                            mipLevels: 1
                        }
                    ],
                    shader: this.shaders.get('default')!,
                    state: this.createDefaultRenderState(),
                    enabled: true
                }
            ],
            resources: [],
            dependencies: []
        };

        this.pipelines.set('default', pipeline);
        this.activePipeline = pipeline;
    }

    /**
     * Create a new scene
     */
    public createScene(id: string, name: string): Scene {
        const scene: Scene = {
            id,
            name,
            objects: [],
            camera: this.createDefaultCamera(),
            environment: this.createDefaultEnvironment(),
            fog: { enabled: false, type: 'linear', color: [0.5, 0.5, 0.5], density: 0.01, near: 1, far: 1000 },
            physics: { enabled: false, gravity: [0, -9.81, 0], timestep: 1 / 60, iterations: 10 }
        };

        this.scenes.set(id, scene);

        if (!this.activeScene) {
            this.activeScene = scene;
        }

        return scene;
    }

    /**
     * Add object to scene
     */
    public addObject(sceneId: string, object: SceneObject): void {
        const scene = this.scenes.get(sceneId);
        if (scene) {
            scene.objects.push(object);
        }
    }

    /**
     * Render the active scene
     */
    public async render(): Promise<void> {
        if (!this.activeScene || !this.activePipeline || !this.device || !this.context) {
            return;
        }

        const startTime = performance.now();

        try {
            // Reset stats
            this.resetFrameStats();

            // Update animations
            this.updateAnimations();

            // Update camera matrices
            this.updateCamera(this.activeScene.camera);

            // Frustum culling
            const visibleObjects = this.performFrustumCulling(this.activeScene);

            // Render pipeline
            await this.executePipeline(this.activePipeline, visibleObjects);

            // Update performance stats
            const frameTime = performance.now() - startTime;
            this.updatePerformanceStats(frameTime);

        } catch (error) {
            console.error('Render failed:', error);
        }
    }

    /**
     * Execute rendering pipeline
     */
    private async executePipeline(pipeline: RenderPipeline, objects: SceneObject[]): Promise<void> {
        const commandEncoder = this.device!.createCommandEncoder();

        for (const pass of pipeline.passes) {
            if (!pass.enabled) continue;

            switch (pass.type) {
                case 'geometry':
                    await this.executeGeometryPass(commandEncoder, pass, objects);
                    break;
                case 'lighting':
                    await this.executeLightingPass(commandEncoder, pass);
                    break;
                case 'shadow':
                    await this.executeShadowPass(commandEncoder, pass, objects);
                    break;
                case 'postprocess':
                    await this.executePostProcessPass(commandEncoder, pass);
                    break;
            }
        }

        const commandBuffer = commandEncoder.finish();
        this.device!.queue.submit([commandBuffer]);
    }

    /**
     * Execute geometry pass
     */
    private async executeGeometryPass(
        encoder: GPUCommandEncoder,
        pass: RenderPass,
        objects: SceneObject[]
    ): Promise<void> {
        const renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context!.getCurrentTexture().createView(),
                clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store'
            }]
        });

        // Render each object
        for (const object of objects) {
            if (!object.visible) continue;

            await this.renderObject(renderPass, object);
            this.stats.drawCalls++;
        }

        renderPass.end();
    }

    /**
     * Render individual object
     */
    private async renderObject(renderPass: GPURenderPassEncoder, object: SceneObject): Promise<void> {
        const geometry = object.geometry;
        const material = object.material;

        // Create vertex buffer if needed
        const vertexBufferId = `vertices_${geometry.id}`;
        if (!this.buffers.has(vertexBufferId)) {
            const vertexBuffer = this.device!.createBuffer({
                size: geometry.vertices.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true
            });

            new Float32Array(vertexBuffer.getMappedRange()).set(geometry.vertices);
            vertexBuffer.unmap();

            this.buffers.set(vertexBufferId, vertexBuffer);
        }

        // Create index buffer if needed
        const indexBufferId = `indices_${geometry.id}`;
        if (!this.buffers.has(indexBufferId)) {
            const indexBuffer = this.device!.createBuffer({
                size: geometry.indices.byteLength,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true
            });

            new Uint32Array(indexBuffer.getMappedRange()).set(geometry.indices);
            indexBuffer.unmap();

            this.buffers.set(indexBufferId, indexBuffer);
        }

        // Set buffers and draw
        const vertexBuffer = this.buffers.get(vertexBufferId)!;
        const indexBuffer = this.buffers.get(indexBufferId)!;

        renderPass.setVertexBuffer(0, vertexBuffer);
        renderPass.setIndexBuffer(indexBuffer, 'uint32');
        renderPass.drawIndexed(geometry.indices.length);

        // Update stats
        this.stats.triangles += geometry.indices.length / 3;
        this.stats.vertices += geometry.vertices.length / 3;
    }

    /**
     * Execute lighting pass
     */
    private async executeLightingPass(encoder: GPUCommandEncoder, pass: RenderPass): Promise<void> {
        // Implement deferred lighting
        console.log('Executing lighting pass');
    }

    /**
     * Execute shadow pass
     */
    private async executeShadowPass(
        encoder: GPUCommandEncoder,
        pass: RenderPass,
        objects: SceneObject[]
    ): Promise<void> {
        // Implement shadow mapping
        console.log('Executing shadow pass');
    }

    /**
     * Execute post-processing pass
     */
    private async executePostProcessPass(encoder: GPUCommandEncoder, pass: RenderPass): Promise<void> {
        // Implement post-processing effects
        console.log('Executing post-process pass');
    }

    /**
     * Perform frustum culling
     */
    private performFrustumCulling(scene: Scene): SceneObject[] {
        if (!this.config.performance.frustumCulling) {
            return scene.objects;
        }

        // Simplified frustum culling - in real implementation, use proper frustum planes
        return scene.objects.filter(object => {
            const distance = this.calculateDistance(object.transform.position, scene.camera.position);
            return distance < scene.camera.far;
        });
    }

    /**
     * Update camera matrices
     */
    private updateCamera(camera: Camera): void {
        // Update view matrix
        camera.view = this.createViewMatrix(camera.position, camera.target, camera.up);

        // Update projection matrix
        if (camera.type === 'perspective') {
            camera.projection = this.createPerspectiveMatrix(camera.fov, camera.aspect, camera.near, camera.far);
        } else {
            camera.projection = this.createOrthographicMatrix(-1, 1, -1, 1, camera.near, camera.far);
        }
    }

    /**
     * Update animations
     */
    private updateAnimations(): void {
        if (!this.isAnimating) return;

        const deltaTime = 1 / 60; // Assume 60 FPS
        this.animationTime += deltaTime * this.animationSpeed;

        for (const scene of this.scenes.values()) {
            for (const object of scene.objects) {
                if (object.animation.enabled) {
                    this.updateObjectAnimation(object, this.animationTime);
                }
            }
        }
    }

    /**
     * Update object animation
     */
    private updateObjectAnimation(object: SceneObject, time: number): void {
        const mixer = object.animation.mixer;

        for (const action of mixer.actions) {
            if (!action.enabled) continue;

            const clip = object.animation.clips.find(c => c.name === action.clip);
            if (!clip) continue;

            const animTime = action.loop ? time % clip.duration : Math.min(time, clip.duration);

            for (const track of clip.tracks) {
                const value = this.interpolateKeyframes(track.keyframes, animTime, track.interpolation);
                this.applyAnimationValue(object, track.property, value);
            }
        }
    }

    /**
     * Interpolate keyframe values
     */
    private interpolateKeyframes(keyframes: Keyframe[], time: number, interpolation: string): any {
        if (keyframes.length === 0) return null;
        if (keyframes.length === 1) return keyframes[0].value;

        // Find surrounding keyframes
        let k1 = keyframes[0];
        let k2 = keyframes[keyframes.length - 1];

        for (let i = 0; i < keyframes.length - 1; i++) {
            if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
                k1 = keyframes[i];
                k2 = keyframes[i + 1];
                break;
            }
        }

        if (k1 === k2) return k1.value;

        // Interpolate
        const t = (time - k1.time) / (k2.time - k1.time);

        switch (interpolation) {
            case 'step':
                return k1.value;
            case 'linear':
                return this.lerp(k1.value, k2.value, t);
            case 'cubic':
                return this.cubicInterpolate(k1.value, k2.value, t);
            default:
                return this.lerp(k1.value, k2.value, t);
        }
    }

    /**
     * Apply animation value to object
     */
    private applyAnimationValue(object: SceneObject, property: string, value: any): void {
        const parts = property.split('.');

        if (parts[0] === 'transform') {
            switch (parts[1]) {
                case 'position':
                    object.transform.position = value;
                    break;
                case 'rotation':
                    object.transform.rotation = value;
                    break;
                case 'scale':
                    object.transform.scale = value;
                    break;
            }

            // Update transform matrix
            this.updateTransformMatrix(object.transform);
        }
    }

    /**
     * Helper methods for geometry and materials
     */
    private createCubeGeometry(): Geometry {
        const vertices = new Float32Array([
            // Front face
            -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
            // Back face
            -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1,
            // Top face
            -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
            // Bottom face
            -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,
            // Right face
            1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,
            // Left face
            -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1
        ]);

        const indices = new Uint32Array([
            0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // back
            8, 9, 10, 8, 10, 11,   // top
            12, 13, 14, 12, 14, 15,   // bottom
            16, 17, 18, 16, 18, 19,   // right
            20, 21, 22, 20, 22, 23    // left
        ]);

        return {
            id: 'cube',
            type: 'triangles',
            vertices,
            indices,
            normals: new Float32Array(vertices.length),
            uvs: new Float32Array(vertices.length * 2 / 3),
            tangents: new Float32Array(vertices.length),
            boundingBox: { min: [-1, -1, -1], max: [1, 1, 1] },
            boundingSphere: { center: [0, 0, 0], radius: Math.sqrt(3) }
        };
    }

    private createDefaultMaterial(): Material {
        return {
            name: 'default',
            type: 'standard',
            properties: {
                albedo: [0.8, 0.8, 0.8, 1.0],
                metallic: 0.0,
                roughness: 0.5,
                normal: 1.0,
                emission: [0, 0, 0],
                transparency: 0.0,
                ior: 1.5
            },
            textures: {},
            shader: {
                vertex: '',
                fragment: '',
                defines: {},
                uniforms: {}
            }
        };
    }

    private async createDefaultShader(): Promise<ShaderProgram> {
        return {
            id: 'default',
            vertex: `
        struct VertexInput {
          @location(0) position: vec3<f32>,
          @location(1) normal: vec3<f32>,
          @location(2) uv: vec2<f32>,
        }
        
        struct VertexOutput {
          @builtin(position) position: vec4<f32>,
          @location(0) normal: vec3<f32>,
          @location(1) uv: vec2<f32>,
        }
        
        @vertex
        fn main(input: VertexInput) -> VertexOutput {
          var output: VertexOutput;
          output.position = vec4<f32>(input.position, 1.0);
          output.normal = input.normal;
          output.uv = input.uv;
          return output;
        }
      `,
            fragment: `
        @fragment
        fn main(@location(0) normal: vec3<f32>, @location(1) uv: vec2<f32>) -> @location(0) vec4<f32> {
          return vec4<f32>(0.8, 0.8, 0.8, 1.0);
        }
      `,
            uniforms: [],
            textures: []
        };
    }

    private createDefaultCamera(): Camera {
        return {
            type: 'perspective',
            position: [0, 0, 5],
            target: [0, 0, 0],
            up: [0, 1, 0],
            fov: 75,
            aspect: this.config.canvas.width / this.config.canvas.height,
            near: 0.1,
            far: 1000,
            projection: new Float32Array(16),
            view: new Float32Array(16)
        };
    }

    private createDefaultEnvironment(): Environment {
        return {
            skybox: { type: 'color', data: [0.5, 0.7, 1.0] },
            fog: { enabled: false, type: 'linear', color: [0.5, 0.5, 0.5], density: 0.01, near: 1, far: 1000 },
            wind: { enabled: false, direction: [1, 0, 0], strength: 1.0, turbulence: 0.1 },
            weather: { type: 'clear', intensity: 0, particles: { enabled: false, count: 0, size: 1, velocity: [0, 0, 0], acceleration: [0, 0, 0], life: 1 } }
        };
    }

    private createDefaultRenderState(): RenderState {
        return {
            culling: { enabled: true, face: 'back', winding: 'ccw' },
            depth: { test: true, write: true, func: 'less' },
            blend: { enabled: false, srcFactor: 'one', dstFactor: 'zero', equation: 'add' },
            stencil: { enabled: false, func: 'always', ref: 0, mask: 0xFF, fail: 'keep', zfail: 'keep', zpass: 'keep' },
            viewport: { x: 0, y: 0, width: this.config.canvas.width, height: this.config.canvas.height }
        };
    }

    /**
     * Matrix math utilities
     */
    private createViewMatrix(eye: [number, number, number], target: [number, number, number], up: [number, number, number]): Float32Array {
        // Simplified view matrix calculation
        const matrix = new Float32Array(16);
        // Implementation would go here
        return matrix;
    }

    private createPerspectiveMatrix(fov: number, aspect: number, near: number, far: number): Float32Array {
        // Simplified perspective matrix calculation
        const matrix = new Float32Array(16);
        // Implementation would go here
        return matrix;
    }

    private createOrthographicMatrix(left: number, right: number, bottom: number, top: number, near: number, far: number): Float32Array {
        // Simplified orthographic matrix calculation
        const matrix = new Float32Array(16);
        // Implementation would go here
        return matrix;
    }

    private updateTransformMatrix(transform: Transform): void {
        // Update the 4x4 transformation matrix from position, rotation, scale
        // Implementation would go here
    }

    /**
     * Utility methods
     */
    private calculateDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
        const dx = pos1[0] - pos2[0];
        const dy = pos1[1] - pos2[1];
        const dz = pos1[2] - pos2[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    private lerp(a: any, b: any, t: number): any {
        if (typeof a === 'number' && typeof b === 'number') {
            return a + (b - a) * t;
        }
        if (Array.isArray(a) && Array.isArray(b)) {
            return a.map((val, i) => val + (b[i] - val) * t);
        }
        return a;
    }

    private cubicInterpolate(a: any, b: any, t: number): any {
        const t2 = t * t;
        const t3 = t2 * t;
        return this.lerp(a, b, 3 * t2 - 2 * t3);
    }

    /**
     * Performance tracking
     */
    private resetFrameStats(): void {
        this.stats.drawCalls = 0;
        this.stats.triangles = 0;
        this.stats.vertices = 0;
        this.stats.shaderSwitches = 0;
        this.stats.renderTargetSwitches = 0;
    }

    private updatePerformanceStats(frameTime: number): void {
        this.stats.frameTime = frameTime;
        this.stats.fps = 1000 / frameTime;

        if (this.profiler.enabled) {
            const frame: PerformanceFrame = {
                timestamp: performance.now(),
                frameTime,
                cpuTime: frameTime, // Simplified
                gpuTime: 0, // Not available in WebGPU yet
                passes: []
            };

            this.profiler.history.push(frame);
            if (this.profiler.history.length > this.profiler.samples) {
                this.profiler.history.shift();
            }

            this.updateAverages();
        }
    }

    private updateAverages(): void {
        const history = this.profiler.history;
        if (history.length === 0) return;

        this.profiler.averages.frameTime = history.reduce((sum, frame) => sum + frame.frameTime, 0) / history.length;
        this.profiler.averages.cpuTime = history.reduce((sum, frame) => sum + frame.cpuTime, 0) / history.length;
        this.profiler.averages.gpuTime = history.reduce((sum, frame) => sum + frame.gpuTime, 0) / history.length;
        this.profiler.averages.fps = 1000 / this.profiler.averages.frameTime;
    }

    /**
     * Public API methods
     */
    public setActiveScene(sceneId: string): void {
        const scene = this.scenes.get(sceneId);
        if (scene) {
            this.activeScene = scene;
        }
    }

    public getStats(): RenderStats {
        return { ...this.stats };
    }

    public getProfiler(): PerformanceProfiler {
        return { ...this.profiler };
    }

    public startAnimation(): void {
        this.isAnimating = true;
    }

    public stopAnimation(): void {
        this.isAnimating = false;
    }

    public setAnimationSpeed(speed: number): void {
        this.animationSpeed = speed;
    }

    /**
     * Cleanup resources
     */
    public dispose(): void {
        // Dispose GPU resources
        for (const buffer of this.buffers.values()) {
            buffer.destroy();
        }
        this.buffers.clear();

        for (const texture of this.renderTargets.values()) {
            texture.destroy();
        }
        this.renderTargets.clear();

        // Dispose compute shaders
        this.computeShaders.cleanup();

        // Clear data structures
        this.scenes.clear();
        this.geometries.clear();
        this.materials.clear();
        this.textures.clear();
        this.shaders.clear();
        this.pipelines.clear();

        console.log('G3D 3D Renderer disposed');
    }
}