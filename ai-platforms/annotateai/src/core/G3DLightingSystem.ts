/**
 * G3DLightingSystem.ts
 * Advanced lighting and shadow system for G3D AnnotateAI
 */

import { ComputeShaders } from '../ai/G3DComputeShaders';

export interface LightingConfig {
    globalIllumination: GIConfig;
    shadows: ShadowConfig;
    postProcessing: PostProcessConfig;
    performance: LightingPerformanceConfig;
}

export interface GIConfig {
    enabled: boolean;
    technique: GITechnique;
    bounces: number;
    samples: number;
    intensity: number;
    bias: number;
}

export type GITechnique = 'ssao' | 'ssgi' | 'vxgi' | 'rtgi' | 'lightmap';

export interface ShadowConfig {
    enabled: boolean;
    type: ShadowType;
    resolution: number;
    cascades: number;
    bias: number;
    normalBias: number;
    softness: number;
}

export type ShadowType = 'hard' | 'pcf' | 'pcss' | 'vsm' | 'esm';

export interface PostProcessConfig {
    bloom: BloomConfig;
    toneMapping: ToneMappingConfig;
    colorGrading: ColorGradingConfig;
    exposure: ExposureConfig;
}

export interface BloomConfig {
    enabled: boolean;
    threshold: number;
    intensity: number;
    radius: number;
    passes: number;
}

export interface ToneMappingConfig {
    enabled: boolean;
    operator: ToneMappingOperator;
    exposure: number;
    whitePoint: number;
}

export type ToneMappingOperator = 'linear' | 'reinhard' | 'aces' | 'filmic' | 'uncharted2';

export interface ColorGradingConfig {
    enabled: boolean;
    contrast: number;
    brightness: number;
    saturation: number;
    gamma: number;
    temperature: number;
    tint: number;
}

export interface ExposureConfig {
    auto: boolean;
    value: number;
    min: number;
    max: number;
    adaptationSpeed: number;
}

export interface LightingPerformanceConfig {
    maxLights: number;
    cullingDistance: number;
    shadowDistance: number;
    lodBias: number;
    enableClustering: boolean;
}

export interface Light {
    id: string;
    type: LightType;
    position: [number, number, number];
    direction: [number, number, number];
    color: [number, number, number];
    intensity: number;
    range: number;
    spotAngle: number;
    shadows: boolean;
    enabled: boolean;
}

export type LightType = 'directional' | 'point' | 'spot' | 'area' | 'environment';

export interface ShadowMap {
    id: string;
    lightId: string;
    resolution: number;
    texture: any; // GPU texture
    viewMatrix: Float32Array;
    projectionMatrix: Float32Array;
    bias: number;
}

export interface LightCluster {
    bounds: BoundingBox;
    lights: string[];
    lightCount: number;
}

export interface BoundingBox {
    min: [number, number, number];
    max: [number, number, number];
}

export interface LightingPass {
    name: string;
    type: PassType;
    inputs: string[];
    outputs: string[];
    shader: string;
    enabled: boolean;
}

export type PassType = 'geometry' | 'lighting' | 'shadow' | 'postprocess' | 'composite';

export class LightingSystem {
    private computeShaders: ComputeShaders;
    private config: LightingConfig;
    private lights: Map<string, Light> = new Map();
    private shadowMaps: Map<string, ShadowMap> = new Map();
    private clusters: LightCluster[] = [];
    private passes: LightingPass[] = [];

    // Performance tracking
    private stats = {
        activeLights: 0,
        shadowMaps: 0,
        lightClusters: 0,
        renderTime: 0
    };

    constructor(config?: Partial<LightingConfig>) {
        this.config = this.createDefaultConfig(config);
        this.initializeComputeShaders();
    }

    private initializeComputeShaders(): void {
        this.computeShaders = new ComputeShaders({
            backend: 'webgpu',
            device: {
                preferredDevice: 'gpu',
                minComputeUnits: 8,
                minMemorySize: 1024 * 1024 * 1024,
                features: ['fp16']
            },
            memory: {
                maxBufferSize: 4 * 1024 * 1024 * 1024,
                alignment: 256,
                caching: 'adaptive',
                pooling: { enabled: true, initialSize: 256, maxSize: 2048, growthFactor: 2 },
                compression: { enabled: true, algorithm: 'zstd', level: 3 }
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

    public async initialize(): Promise<void> {
        console.log('Initializing G3D Lighting System...');
        await this.computeShaders.init();
        await this.createLightingKernels();
        await this.setupRenderPasses();
        console.log('G3D Lighting System initialized successfully');
    }

    public addLight(light: Light): void {
        this.lights.set(light.id, light);

        if (light.shadows) {
            this.createShadowMap(light);
        }

        this.updateClusters();
        this.updateStats();
        console.log(`Added light: ${light.id} (${light.type})`);
    }

    public removeLight(id: string): void {
        const light = this.lights.get(id);
        if (light) {
            this.lights.delete(id);

            if (light.shadows) {
                this.removeShadowMap(id);
            }

            this.updateClusters();
            this.updateStats();
            console.log(`Removed light: ${id}`);
        }
    }

    public updateLight(id: string, updates: Partial<Light>): void {
        const light = this.lights.get(id);
        if (light) {
            Object.assign(light, updates);

            if (light.shadows && !this.shadowMaps.has(id)) {
                this.createShadowMap(light);
            } else if (!light.shadows && this.shadowMaps.has(id)) {
                this.removeShadowMap(id);
            }

            this.updateClusters();
            console.log(`Updated light: ${id}`);
        }
    }

    public async render(camera: any, scene: any): Promise<void> {
        const startTime = Date.now();

        try {
            // Update light clusters
            this.updateClusters();

            // Render shadow maps
            await this.renderShadowMaps(scene);

            // Execute lighting passes
            await this.executeLightingPasses(camera, scene);

            // Apply post-processing
            await this.applyPostProcessing();

            this.stats.renderTime = Date.now() - startTime;

        } catch (error) {
            console.error('Lighting render failed:', error);
        }
    }

    private createShadowMap(light: Light): void {
        const shadowMap: ShadowMap = {
            id: `shadow_${light.id}`,
            lightId: light.id,
            resolution: this.config.shadows.resolution,
            texture: null, // Would create actual GPU texture
            viewMatrix: new Float32Array(16),
            projectionMatrix: new Float32Array(16),
            bias: this.config.shadows.bias
        };

        this.shadowMaps.set(light.id, shadowMap);
        this.updateShadowMatrices(light, shadowMap);
        console.log(`Created shadow map for light: ${light.id}`);
    }

    private removeShadowMap(lightId: string): void {
        const shadowMap = this.shadowMaps.get(lightId);
        if (shadowMap) {
            // Dispose GPU texture
            this.shadowMaps.delete(lightId);
            console.log(`Removed shadow map for light: ${lightId}`);
        }
    }

    private updateShadowMatrices(light: Light, shadowMap: ShadowMap): void {
        // Calculate view matrix from light position/direction
        this.calculateLightViewMatrix(light, shadowMap.viewMatrix);

        // Calculate projection matrix based on light type
        this.calculateLightProjectionMatrix(light, shadowMap.projectionMatrix);
    }

    private calculateLightViewMatrix(light: Light, viewMatrix: Float32Array): void {
        // Simplified view matrix calculation
        // Real implementation would use proper matrix math
        viewMatrix.fill(0);
        viewMatrix[0] = viewMatrix[5] = viewMatrix[10] = viewMatrix[15] = 1;
    }

    private calculateLightProjectionMatrix(light: Light, projMatrix: Float32Array): void {
        // Simplified projection matrix calculation
        // Real implementation would calculate based on light type and parameters
        projMatrix.fill(0);
        projMatrix[0] = projMatrix[5] = projMatrix[10] = projMatrix[15] = 1;
    }

    private updateClusters(): void {
        if (!this.config.performance.enableClustering) return;

        this.clusters = [];

        // Simplified clustering - would implement proper 3D clustering
        const clusterSize = 32;
        const activeLights = Array.from(this.lights.values()).filter(l => l.enabled);

        for (let i = 0; i < activeLights.length; i += clusterSize) {
            const clusterLights = activeLights.slice(i, i + clusterSize);

            const cluster: LightCluster = {
                bounds: this.calculateClusterBounds(clusterLights),
                lights: clusterLights.map(l => l.id),
                lightCount: clusterLights.length
            };

            this.clusters.push(cluster);
        }

        console.log(`Updated light clusters: ${this.clusters.length} clusters`);
    }

    private calculateClusterBounds(lights: Light[]): BoundingBox {
        if (lights.length === 0) {
            return {
                min: [0, 0, 0],
                max: [0, 0, 0]
            };
        }

        let minX = lights[0].position[0], maxX = lights[0].position[0];
        let minY = lights[0].position[1], maxY = lights[0].position[1];
        let minZ = lights[0].position[2], maxZ = lights[0].position[2];

        for (const light of lights) {
            minX = Math.min(minX, light.position[0] - light.range);
            maxX = Math.max(maxX, light.position[0] + light.range);
            minY = Math.min(minY, light.position[1] - light.range);
            maxY = Math.max(maxY, light.position[1] + light.range);
            minZ = Math.min(minZ, light.position[2] - light.range);
            maxZ = Math.max(maxZ, light.position[2] + light.range);
        }

        return {
            min: [minX, minY, minZ],
            max: [maxX, maxY, maxZ]
        };
    }

    private async renderShadowMaps(scene: any): Promise<void> {
        if (!this.config.shadows.enabled) return;

        for (const shadowMap of this.shadowMaps.values()) {
            const light = this.lights.get(shadowMap.lightId);
            if (!light || !light.enabled || !light.shadows) continue;

            await this.renderShadowMap(shadowMap, light, scene);
        }
    }

    private async renderShadowMap(shadowMap: ShadowMap, light: Light, scene: any): Promise<void> {
        console.log(`Rendering shadow map for light: ${light.id}`);

        // Use compute shader for shadow map generation
        await this.computeShaders.executeKernel(
            'shadow_map_generation',
            ['shadow_data', 'scene_data'],
            [
                Math.ceil(shadowMap.resolution / 16),
                Math.ceil(shadowMap.resolution / 16),
                1
            ]
        );
    }

    private async executeLightingPasses(camera: any, scene: any): Promise<void> {
        for (const pass of this.passes) {
            if (!pass.enabled) continue;

            await this.executePass(pass, camera, scene);
        }
    }

    private async executePass(pass: LightingPass, camera: any, scene: any): Promise<void> {
        console.log(`Executing lighting pass: ${pass.name}`);

        switch (pass.type) {
            case 'lighting':
                await this.executeLightingPass(pass, camera, scene);
                break;
            case 'shadow':
                await this.executeShadowPass(pass, camera, scene);
                break;
            case 'postprocess':
                await this.executePostProcessPass(pass);
                break;
        }
    }

    private async executeLightingPass(pass: LightingPass, camera: any, scene: any): Promise<void> {
        // Execute main lighting calculations
        await this.computeShaders.executeKernel(
            'deferred_lighting',
            ['light_data', 'geometry_data', 'output_data'],
            [64, 64, 1]
        );
    }

    private async executeShadowPass(pass: LightingPass, camera: any, scene: any): Promise<void> {
        // Execute shadow calculations
        await this.computeShaders.executeKernel(
            'shadow_calculation',
            ['shadow_maps', 'geometry_data', 'shadow_output'],
            [32, 32, 1]
        );
    }

    private async executePostProcessPass(pass: LightingPass): Promise<void> {
        // Execute post-processing effects
        await this.computeShaders.executeKernel(
            'post_processing',
            ['input_data', 'output_data'],
            [64, 64, 1]
        );
    }

    private async applyPostProcessing(): Promise<void> {
        if (this.config.postProcessing.bloom.enabled) {
            await this.applyBloom();
        }

        if (this.config.postProcessing.toneMapping.enabled) {
            await this.applyToneMapping();
        }

        if (this.config.postProcessing.colorGrading.enabled) {
            await this.applyColorGrading();
        }
    }

    private async applyBloom(): Promise<void> {
        console.log('Applying bloom effect...');

        await this.computeShaders.executeKernel(
            'bloom_effect',
            ['hdr_input', 'bloom_output'],
            [64, 64, 1]
        );
    }

    private async applyToneMapping(): Promise<void> {
        console.log(`Applying ${this.config.postProcessing.toneMapping.operator} tone mapping...`);

        await this.computeShaders.executeKernel(
            'tone_mapping',
            ['hdr_input', 'ldr_output'],
            [64, 64, 1]
        );
    }

    private async applyColorGrading(): Promise<void> {
        console.log('Applying color grading...');

        await this.computeShaders.executeKernel(
            'color_grading',
            ['input_data', 'graded_output'],
            [64, 64, 1]
        );
    }

    private async setupRenderPasses(): Promise<void> {
        this.passes = [
            {
                name: 'shadow_pass',
                type: 'shadow',
                inputs: ['geometry'],
                outputs: ['shadow_maps'],
                shader: 'shadow_map',
                enabled: this.config.shadows.enabled
            },
            {
                name: 'lighting_pass',
                type: 'lighting',
                inputs: ['geometry', 'shadow_maps'],
                outputs: ['lit_scene'],
                shader: 'deferred_lighting',
                enabled: true
            },
            {
                name: 'post_process',
                type: 'postprocess',
                inputs: ['lit_scene'],
                outputs: ['final_image'],
                shader: 'post_processing',
                enabled: true
            }
        ];

        console.log(`Setup ${this.passes.length} lighting passes`);
    }

    private updateStats(): void {
        this.stats.activeLights = Array.from(this.lights.values()).filter(l => l.enabled).length;
        this.stats.shadowMaps = this.shadowMaps.size;
        this.stats.lightClusters = this.clusters.length;
    }

    private async createLightingKernels(): Promise<void> {
        try {
            // Deferred lighting kernel
            await this.computeShaders.createKernel(
                'deferred_lighting',
                'Deferred Lighting',
                this.getDeferredLightingShader(),
                [16, 16, 1]
            );

            // Shadow map generation kernel
            await this.computeShaders.createKernel(
                'shadow_map_generation',
                'Shadow Map Generation',
                this.getShadowMapShader(),
                [16, 16, 1]
            );

            // Post-processing kernels
            await this.computeShaders.createKernel(
                'bloom_effect',
                'Bloom Effect',
                this.getBloomShader(),
                [16, 16, 1]
            );

            await this.computeShaders.createKernel(
                'tone_mapping',
                'Tone Mapping',
                this.getToneMappingShader(),
                [16, 16, 1]
            );

            console.log('Lighting system kernels created');
        } catch (error) {
            console.warn('Failed to create some lighting kernels:', error);
        }
    }

    private getDeferredLightingShader(): string {
        return `
      #version 450
      layout(local_size_x = 16, local_size_y = 16, local_size_z = 1) in;
      
      layout(set = 0, binding = 0) buffer LightData {
        float light_data[];
      };
      
      layout(set = 0, binding = 1) buffer GeometryData {
        float geometry_data[];
      };
      
      layout(set = 0, binding = 2) buffer OutputData {
        float output_data[];
      };
      
      void main() {
        ivec2 coord = ivec2(gl_GlobalInvocationID.xy);
        
        // Sample G-buffer data
        vec3 position = vec3(0.0); // Sample from position buffer
        vec3 normal = vec3(0.0, 1.0, 0.0); // Sample from normal buffer
        vec3 albedo = vec3(0.8); // Sample from albedo buffer
        
        vec3 finalColor = vec3(0.0);
        
        // Accumulate lighting from all lights
        for (int i = 0; i < 32; i++) { // Max lights
          // Sample light data
          vec3 lightPos = vec3(light_data[i * 8], light_data[i * 8 + 1], light_data[i * 8 + 2]);
          vec3 lightColor = vec3(light_data[i * 8 + 3], light_data[i * 8 + 4], light_data[i * 8 + 5]);
          float lightIntensity = light_data[i * 8 + 6];
          
          // Calculate lighting
          vec3 lightDir = normalize(lightPos - position);
          float NdotL = max(dot(normal, lightDir), 0.0);
          
          finalColor += albedo * lightColor * lightIntensity * NdotL;
        }
        
        // Write output
        int index = coord.y * 1024 + coord.x; // Assuming 1024 width
        output_data[index * 3] = finalColor.r;
        output_data[index * 3 + 1] = finalColor.g;
        output_data[index * 3 + 2] = finalColor.b;
      }
    `;
    }

    private getShadowMapShader(): string {
        return `
      #version 450
      layout(local_size_x = 16, local_size_y = 16, local_size_z = 1) in;
      
      layout(set = 0, binding = 0) buffer ShadowData {
        float shadow_data[];
      };
      
      layout(set = 0, binding = 1) buffer SceneData {
        float scene_data[];
      };
      
      void main() {
        ivec2 coord = ivec2(gl_GlobalInvocationID.xy);
        
        // Generate shadow map depth values
        float depth = 1.0; // Calculate actual depth from light perspective
        
        int index = coord.y * 1024 + coord.x;
        shadow_data[index] = depth;
      }
    `;
    }

    private getBloomShader(): string {
        return `
      #version 450
      layout(local_size_x = 16, local_size_y = 16, local_size_z = 1) in;
      
      layout(set = 0, binding = 0) buffer HDRInput {
        float hdr_input[];
      };
      
      layout(set = 0, binding = 1) buffer BloomOutput {
        float bloom_output[];
      };
      
      void main() {
        ivec2 coord = ivec2(gl_GlobalInvocationID.xy);
        
        // Sample HDR color
        int index = coord.y * 1024 + coord.x;
        vec3 color = vec3(hdr_input[index * 3], hdr_input[index * 3 + 1], hdr_input[index * 3 + 2]);
        
        // Extract bright areas
        float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
        vec3 bloom = brightness > 1.0 ? color : vec3(0.0);
        
        // Apply blur (simplified)
        bloom_output[index * 3] = bloom.r;
        bloom_output[index * 3 + 1] = bloom.g;
        bloom_output[index * 3 + 2] = bloom.b;
      }
    `;
    }

    private getToneMappingShader(): string {
        return `
      #version 450
      layout(local_size_x = 16, local_size_y = 16, local_size_z = 1) in;
      
      layout(set = 0, binding = 0) buffer HDRInput {
        float hdr_input[];
      };
      
      layout(set = 0, binding = 1) buffer LDROutput {
        float ldr_output[];
      };
      
      void main() {
        ivec2 coord = ivec2(gl_GlobalInvocationID.xy);
        
        int index = coord.y * 1024 + coord.x;
        vec3 hdrColor = vec3(hdr_input[index * 3], hdr_input[index * 3 + 1], hdr_input[index * 3 + 2]);
        
        // Apply Reinhard tone mapping
        vec3 ldrColor = hdrColor / (hdrColor + vec3(1.0));
        
        ldr_output[index * 3] = ldrColor.r;
        ldr_output[index * 3 + 1] = ldrColor.g;
        ldr_output[index * 3 + 2] = ldrColor.b;
      }
    `;
    }

    private createDefaultConfig(config?: Partial<LightingConfig>): LightingConfig {
        return {
            globalIllumination: {
                enabled: true,
                technique: 'ssao',
                bounces: 2,
                samples: 16,
                intensity: 1.0,
                bias: 0.025
            },
            shadows: {
                enabled: true,
                type: 'pcf',
                resolution: 2048,
                cascades: 4,
                bias: 0.005,
                normalBias: 0.02,
                softness: 1.0
            },
            postProcessing: {
                bloom: {
                    enabled: true,
                    threshold: 1.0,
                    intensity: 0.5,
                    radius: 1.0,
                    passes: 5
                },
                toneMapping: {
                    enabled: true,
                    operator: 'aces',
                    exposure: 1.0,
                    whitePoint: 11.2
                },
                colorGrading: {
                    enabled: true,
                    contrast: 1.0,
                    brightness: 0.0,
                    saturation: 1.0,
                    gamma: 2.2,
                    temperature: 0.0,
                    tint: 0.0
                },
                exposure: {
                    auto: true,
                    value: 1.0,
                    min: 0.1,
                    max: 10.0,
                    adaptationSpeed: 1.0
                }
            },
            performance: {
                maxLights: 256,
                cullingDistance: 100.0,
                shadowDistance: 50.0,
                lodBias: 1.0,
                enableClustering: true
            },
            ...config
        };
    }

    // Public API methods
    public getLight(id: string): Light | undefined {
        return this.lights.get(id);
    }

    public getShadowMap(lightId: string): ShadowMap | undefined {
        return this.shadowMaps.get(lightId);
    }

    public listLights(): string[] {
        return Array.from(this.lights.keys());
    }

    public updateConfig(config: Partial<LightingConfig>): void {
        this.config = { ...this.config, ...config };
    }

    public getStats(): any {
        return { ...this.stats };
    }

    public dispose(): void {
        this.computeShaders.cleanup();
        this.lights.clear();
        this.shadowMaps.clear();
        this.clusters.length = 0;
        this.passes.length = 0;
        console.log('G3D Lighting System disposed');
    }
}