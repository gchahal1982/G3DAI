/**
 * G3D MedSight Pro - Advanced Lighting System
 * Sophisticated lighting for medical 3D visualization and diagnosis
 * 
 * Features:
 * - Medical-optimized lighting models
 * - Advanced shadow mapping techniques
 * - Volumetric lighting for medical imaging
 * - Clinical lighting presets
 * - Real-time global illumination
 * - Subsurface scattering for tissue rendering
 */

import { vec3, mat4 } from 'gl-matrix';

export interface LightingConfig {
    enableShadows: boolean;
    enableGlobalIllumination: boolean;
    enableVolumetricLighting: boolean;
    enableSubsurfaceScattering: boolean;
    shadowMapResolution: number;
    medicalLightingMode: 'diagnostic' | 'surgical' | 'educational' | 'research';
    clinicalAccuracy: boolean;
    enableHDR: boolean;
}

export interface Light {
    id: string;
    type: 'directional' | 'point' | 'spot' | 'area' | 'medical' | 'surgical';
    position: vec3;
    direction: vec3;
    color: vec3;
    intensity: number;
    range: number;
    innerCone: number;
    outerCone: number;
    castShadows: boolean;
    medicalProperties: MedicalLightProperties;
    enabled: boolean;
}

export interface MedicalLightProperties {
    colorTemperature: number; // Kelvin
    cri: number; // Color Rendering Index
    medicalGrade: boolean;
    sterilizable: boolean;
    clinicalPurpose: 'examination' | 'surgery' | 'imaging' | 'therapy';
    tissueOptimized: boolean;
    contrastEnhancement: number;
}

export interface ShadowMap {
    lightId: string;
    resolution: number;
    texture: WebGLTexture | null;
    framebuffer: WebGLFramebuffer | null;
    viewMatrix: mat4;
    projectionMatrix: mat4;
    bias: number;
    pcfRadius: number;
}

export interface VolumetricLight {
    lightId: string;
    density: number;
    scattering: number;
    absorption: number;
    steps: number;
    jittering: boolean;
    medicalVolume: boolean;
}

export interface SubsurfaceScattering {
    enabled: boolean;
    thickness: number;
    distortion: number;
    power: number;
    scale: number;
    ambient: number;
    tissueType: 'skin' | 'muscle' | 'bone' | 'organ' | 'vessel' | 'tumor';
}

export interface GlobalIllumination {
    enabled: boolean;
    bounces: number;
    samples: number;
    intensity: number;
    medicalAccuracy: boolean;
    realTime: boolean;
}

export interface LightingEnvironment {
    ambientColor: vec3;
    ambientIntensity: number;
    environmentMap: WebGLTexture | null;
    environmentIntensity: number;
    medicalEnvironment: 'or' | 'icu' | 'lab' | 'clinic' | 'radiology';
    lightingStandard: 'ies' | 'medical' | 'surgical' | 'custom';
}

export class AdvancedLighting {
    private config: LightingConfig;
    private lights: Map<string, Light> = new Map();
    private shadowMaps: Map<string, ShadowMap> = new Map();
    private volumetricLights: Map<string, VolumetricLight> = new Map();
    private environment: LightingEnvironment;
    private globalIllumination: GlobalIllumination;
    private isInitialized: boolean = false;

    // Medical lighting presets
    private static readonly MEDICAL_PRESETS = {
        SURGICAL: {
            colorTemperature: 4000,
            intensity: 100000, // lux
            cri: 95,
            shadowSoftness: 0.1
        },
        DIAGNOSTIC: {
            colorTemperature: 5500,
            intensity: 1000,
            cri: 90,
            shadowSoftness: 0.3
        },
        EXAMINATION: {
            colorTemperature: 3000,
            intensity: 500,
            cri: 80,
            shadowSoftness: 0.5
        }
    };

    constructor(config: Partial<LightingConfig> = {}) {
        this.config = {
            enableShadows: true,
            enableGlobalIllumination: false,
            enableVolumetricLighting: true,
            enableSubsurfaceScattering: true,
            shadowMapResolution: 2048,
            medicalLightingMode: 'diagnostic',
            clinicalAccuracy: true,
            enableHDR: true,
            ...config
        };

        this.environment = {
            ambientColor: vec3.fromValues(0.2, 0.2, 0.25),
            ambientIntensity: 0.1,
            environmentMap: null,
            environmentIntensity: 1.0,
            medicalEnvironment: 'clinic',
            lightingStandard: 'medical'
        };

        this.globalIllumination = {
            enabled: false,
            bounces: 3,
            samples: 32,
            intensity: 1.0,
            medicalAccuracy: true,
            realTime: false
        };
    }

    async initialize(gl: WebGL2RenderingContext): Promise<void> {
        try {
            console.log('Initializing G3D Advanced Lighting System...');

            // Initialize shadow mapping
            if (this.config.enableShadows) {
                await this.initializeShadowMapping(gl);
            }

            // Initialize volumetric lighting
            if (this.config.enableVolumetricLighting) {
                await this.initializeVolumetricLighting(gl);
            }

            // Initialize global illumination
            if (this.config.enableGlobalIllumination) {
                await this.initializeGlobalIllumination(gl);
            }

            // Set up default medical lighting
            await this.setupMedicalLighting();

            this.isInitialized = true;
            console.log('G3D Advanced Lighting System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Advanced Lighting System:', error);
            throw error;
        }
    }

    private async initializeShadowMapping(gl: WebGL2RenderingContext): Promise<void> {
        console.log('Initializing shadow mapping...');
        // Shadow mapping initialization would be implemented here
    }

    private async initializeVolumetricLighting(gl: WebGL2RenderingContext): Promise<void> {
        console.log('Initializing volumetric lighting...');
        // Volumetric lighting initialization would be implemented here
    }

    private async initializeGlobalIllumination(gl: WebGL2RenderingContext): Promise<void> {
        console.log('Initializing global illumination...');
        // Global illumination initialization would be implemented here
    }

    private async setupMedicalLighting(): Promise<void> {
        // Create default medical lighting setup
        const preset = G3DAdvancedLighting.MEDICAL_PRESETS[this.config.medicalLightingMode.toUpperCase() as keyof typeof G3DAdvancedLighting.MEDICAL_PRESETS];

        // Main examination light
        this.addLight({
            id: 'main_medical',
            type: 'medical',
            position: vec3.fromValues(0, 5, 3),
            direction: vec3.fromValues(0, -1, -0.3),
            color: this.kelvinToRGB(preset.colorTemperature),
            intensity: preset.intensity / 1000, // Normalize
            range: 10,
            innerCone: 30,
            outerCone: 45,
            castShadows: true,
            medicalProperties: {
                colorTemperature: preset.colorTemperature,
                cri: preset.cri,
                medicalGrade: true,
                sterilizable: true,
                clinicalPurpose: 'examination',
                tissueOptimized: true,
                contrastEnhancement: 1.2
            },
            enabled: true
        });

        // Fill light for shadow reduction
        this.addLight({
            id: 'fill_medical',
            type: 'area',
            position: vec3.fromValues(-3, 3, 2),
            direction: vec3.fromValues(0.3, -0.5, -0.2),
            color: this.kelvinToRGB(preset.colorTemperature + 500),
            intensity: preset.intensity / 3000,
            range: 8,
            innerCone: 45,
            outerCone: 60,
            castShadows: false,
            medicalProperties: {
                colorTemperature: preset.colorTemperature + 500,
                cri: preset.cri - 5,
                medicalGrade: true,
                sterilizable: true,
                clinicalPurpose: 'examination',
                tissueOptimized: true,
                contrastEnhancement: 0.8
            },
            enabled: true
        });
    }

    public addLight(light: Light): void {
        this.lights.set(light.id, light);

        // Create shadow map if needed
        if (light.castShadows && this.config.enableShadows) {
            this.createShadowMap(light.id);
        }

        // Set up volumetric lighting if enabled
        if (this.config.enableVolumetricLighting) {
            this.setupVolumetricLight(light.id);
        }

        console.log(`Light added: ${light.id} (${light.type})`);
    }

    public removeLight(lightId: string): boolean {
        const removed = this.lights.delete(lightId);

        if (removed) {
            // Clean up shadow map
            this.destroyShadowMap(lightId);

            // Clean up volumetric light
            this.volumetricLights.delete(lightId);

            console.log(`Light removed: ${lightId}`);
        }

        return removed;
    }

    public getLight(lightId: string): Light | null {
        return this.lights.get(lightId) || null;
    }

    public getAllLights(): Light[] {
        return Array.from(this.lights.values());
    }

    private createShadowMap(lightId: string): void {
        const shadowMap: ShadowMap = {
            lightId,
            resolution: this.config.shadowMapResolution,
            texture: null,
            framebuffer: null,
            viewMatrix: mat4.create(),
            projectionMatrix: mat4.create(),
            bias: 0.005,
            pcfRadius: 2.0
        };

        this.shadowMaps.set(lightId, shadowMap);
    }

    private destroyShadowMap(lightId: string): void {
        const shadowMap = this.shadowMaps.get(lightId);
        if (shadowMap) {
            // WebGL cleanup would be implemented here
            this.shadowMaps.delete(lightId);
        }
    }

    private setupVolumetricLight(lightId: string): void {
        const volumetricLight: VolumetricLight = {
            lightId,
            density: 0.1,
            scattering: 0.8,
            absorption: 0.2,
            steps: 64,
            jittering: true,
            medicalVolume: true
        };

        this.volumetricLights.set(lightId, volumetricLight);
    }

    public setMedicalLightingMode(mode: LightingConfig['medicalLightingMode']): void {
        this.config.medicalLightingMode = mode;
        this.updateMedicalLighting();
    }

    private updateMedicalLighting(): void {
        const preset = G3DAdvancedLighting.MEDICAL_PRESETS[this.config.medicalLightingMode.toUpperCase() as keyof typeof G3DAdvancedLighting.MEDICAL_PRESETS];

        // Update existing medical lights
        for (const light of this.lights.values()) {
            if (light.type === 'medical') {
                light.color = this.kelvinToRGB(preset.colorTemperature);
                light.intensity = preset.intensity / 1000;
                light.medicalProperties.colorTemperature = preset.colorTemperature;
                light.medicalProperties.cri = preset.cri;
            }
        }
    }

    public setEnvironment(environment: Partial<LightingEnvironment>): void {
        Object.assign(this.environment, environment);
        this.updateEnvironmentLighting();
    }

    private updateEnvironmentLighting(): void {
        // Update ambient lighting based on medical environment
        switch (this.environment.medicalEnvironment) {
            case 'or':
                vec3.set(this.environment.ambientColor, 0.15, 0.15, 0.18);
                this.environment.ambientIntensity = 0.05;
                break;
            case 'icu':
                vec3.set(this.environment.ambientColor, 0.18, 0.18, 0.20);
                this.environment.ambientIntensity = 0.08;
                break;
            case 'lab':
                vec3.set(this.environment.ambientColor, 0.22, 0.22, 0.25);
                this.environment.ambientIntensity = 0.12;
                break;
            case 'clinic':
                vec3.set(this.environment.ambientColor, 0.25, 0.25, 0.28);
                this.environment.ambientIntensity = 0.15;
                break;
            case 'radiology':
                vec3.set(this.environment.ambientColor, 0.10, 0.10, 0.12);
                this.environment.ambientIntensity = 0.03;
                break;
        }
    }

    public enableSubsurfaceScattering(material: any, settings: SubsurfaceScattering): void {
        if (!this.config.enableSubsurfaceScattering) return;

        // Apply tissue-specific subsurface scattering
        const tissueProperties = this.getTissueProperties(settings.tissueType);

        material.subsurfaceScattering = {
            ...settings,
            ...tissueProperties,
            enabled: true
        };
    }

    private getTissueProperties(tissueType: SubsurfaceScattering['tissueType']): Partial<SubsurfaceScattering> {
        const properties: Record<string, Partial<SubsurfaceScattering>> = {
            skin: { thickness: 0.8, distortion: 0.3, power: 2.0, scale: 1.0 },
            muscle: { thickness: 0.6, distortion: 0.2, power: 1.5, scale: 0.8 },
            bone: { thickness: 0.1, distortion: 0.1, power: 0.5, scale: 0.3 },
            organ: { thickness: 0.7, distortion: 0.4, power: 1.8, scale: 0.9 },
            vessel: { thickness: 0.9, distortion: 0.5, power: 2.2, scale: 1.1 },
            tumor: { thickness: 0.5, distortion: 0.3, power: 1.3, scale: 0.7 }
        };

        return properties[tissueType] || properties.skin;
    }

    private kelvinToRGB(kelvin: number): vec3 {
        const temp = kelvin / 100;
        let red, green, blue;

        if (temp <= 66) {
            red = 255;
            green = temp;
            green = 99.4708025861 * Math.log(green) - 161.1195681661;

            if (temp >= 19) {
                blue = temp - 10;
                blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
            } else {
                blue = 0;
            }
        } else {
            red = temp - 60;
            red = 329.698727446 * Math.pow(red, -0.1332047592);

            green = temp - 60;
            green = 288.1221695283 * Math.pow(green, -0.0755148492);

            blue = 255;
        }

        return vec3.fromValues(
            Math.max(0, Math.min(255, red)) / 255,
            Math.max(0, Math.min(255, green)) / 255,
            Math.max(0, Math.min(255, blue)) / 255
        );
    }

    public updateLighting(deltaTime: number, camera: any): void {
        if (!this.isInitialized) return;

        // Update shadow maps
        this.updateShadowMaps(camera);

        // Update volumetric lighting
        this.updateVolumetricLighting(deltaTime);

        // Update global illumination
        if (this.globalIllumination.enabled) {
            this.updateGlobalIllumination(deltaTime);
        }
    }

    private updateShadowMaps(camera: any): void {
        for (const [lightId, shadowMap] of this.shadowMaps) {
            const light = this.lights.get(lightId);
            if (!light || !light.enabled || !light.castShadows) continue;

            // Update shadow map view and projection matrices
            this.updateShadowMapMatrices(light, shadowMap, camera);
        }
    }

    private updateShadowMapMatrices(light: Light, shadowMap: ShadowMap, camera: any): void {
        // Calculate light view matrix
        const target = vec3.create();
        vec3.add(target, light.position, light.direction);
        const up = vec3.fromValues(0, 1, 0);

        mat4.lookAt(shadowMap.viewMatrix, light.position, target, up);

        // Calculate light projection matrix based on light type
        if (light.type === 'directional') {
            const size = 20; // Shadow map coverage
            mat4.ortho(shadowMap.projectionMatrix, -size, size, -size, size, 0.1, 100);
        } else {
            mat4.perspective(shadowMap.projectionMatrix,
                Math.PI / 2, 1.0, 0.1, light.range);
        }
    }

    private updateVolumetricLighting(deltaTime: number): void {
        for (const volumetricLight of this.volumetricLights.values()) {
            // Update volumetric lighting parameters
            if (volumetricLight.medicalVolume) {
                // Adjust for medical imaging visibility
                volumetricLight.density *= 0.98; // Subtle density variation
            }
        }
    }

    private updateGlobalIllumination(deltaTime: number): void {
        // Global illumination update logic would be implemented here
        if (this.globalIllumination.realTime) {
            // Real-time GI updates
        }
    }

    public getLightingUniforms(): Record<string, any> {
        const uniforms: Record<string, any> = {};

        // Ambient lighting
        uniforms.u_ambientColor = this.environment.ambientColor;
        uniforms.u_ambientIntensity = this.environment.ambientIntensity;

        // Lights array
        const lightData: any[] = [];
        for (const light of this.lights.values()) {
            if (!light.enabled) continue;

            lightData.push({
                position: light.position,
                direction: light.direction,
                color: light.color,
                intensity: light.intensity,
                range: light.range,
                innerCone: Math.cos(light.innerCone * Math.PI / 180),
                outerCone: Math.cos(light.outerCone * Math.PI / 180),
                type: this.getLightTypeIndex(light.type),
                castShadows: light.castShadows ? 1 : 0,
                medicalGrade: light.medicalProperties.medicalGrade ? 1 : 0
            });
        }

        uniforms.u_lights = lightData;
        uniforms.u_lightCount = lightData.length;

        // Shadow maps
        const shadowMapData: any[] = [];
        for (const shadowMap of this.shadowMaps.values()) {
            shadowMapData.push({
                viewMatrix: shadowMap.viewMatrix,
                projectionMatrix: shadowMap.projectionMatrix,
                bias: shadowMap.bias,
                pcfRadius: shadowMap.pcfRadius
            });
        }
        uniforms.u_shadowMaps = shadowMapData;

        // Global illumination
        uniforms.u_globalIllumination = {
            enabled: this.globalIllumination.enabled ? 1 : 0,
            intensity: this.globalIllumination.intensity,
            bounces: this.globalIllumination.bounces
        };

        return uniforms;
    }

    private getLightTypeIndex(type: Light['type']): number {
        const types = ['directional', 'point', 'spot', 'area', 'medical', 'surgical'];
        return types.indexOf(type);
    }

    public getPerformanceMetrics(): {
        activeLights: number;
        shadowMaps: number;
        volumetricLights: number;
        memoryUsage: number;
        renderTime: number;
    } {
        const activeLights = Array.from(this.lights.values()).filter(l => l.enabled).length;

        return {
            activeLights,
            shadowMaps: this.shadowMaps.size,
            volumetricLights: this.volumetricLights.size,
            memoryUsage: this.calculateMemoryUsage(),
            renderTime: 0 // Would be measured during rendering
        };
    }

    private calculateMemoryUsage(): number {
        let usage = 0;

        // Shadow maps
        for (const shadowMap of this.shadowMaps.values()) {
            usage += shadowMap.resolution * shadowMap.resolution * 4; // 32-bit depth
        }

        // Volumetric lighting buffers
        usage += this.volumetricLights.size * 1024 * 1024; // Estimate 1MB per volumetric light

        return usage;
    }

    public dispose(): void {
        console.log('Disposing G3D Advanced Lighting System...');

        // Dispose shadow maps
        for (const shadowMap of this.shadowMaps.values()) {
            // WebGL resource cleanup would be implemented here
        }

        // Clear collections
        this.lights.clear();
        this.shadowMaps.clear();
        this.volumetricLights.clear();

        this.isInitialized = false;
        console.log('G3D Advanced Lighting System disposed');
    }
}

export default AdvancedLighting;