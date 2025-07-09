/**
 * G3D MedSight Pro - Advanced Materials System
 * Sophisticated material rendering for medical visualization
 * 
 * Features:
 * - Medical tissue material models
 * - Physically-based rendering (PBR)
 * - Advanced shader material system
 * - Medical imaging material presets
 * - Dynamic material properties
 * - Subsurface scattering for tissues
 */

import { vec3, vec4 } from 'gl-matrix';

export interface G3DMaterialConfig {
    enablePBR: boolean;
    enableSubsurfaceScattering: boolean;
    enableTransparency: boolean;
    enableMedicalPresets: boolean;
    maxMaterials: number;
    textureResolution: number;
    enableDynamicProperties: boolean;
}

export interface G3DMaterial {
    id: string;
    name: string;
    type: 'pbr' | 'medical' | 'tissue' | 'bone' | 'fluid' | 'metal' | 'glass' | 'custom';

    // PBR Properties
    albedo: vec3;
    metallic: number;
    roughness: number;
    ao: number; // Ambient occlusion
    normal: vec3;
    emission: vec3;

    // Medical Properties
    medicalType: 'soft_tissue' | 'hard_tissue' | 'fluid' | 'pathology' | 'implant' | 'contrast';
    opacity: number;
    refractiveIndex: number;
    absorption: vec3;
    scattering: vec3;

    // Subsurface Scattering
    subsurface: G3DSubsurfaceMaterial;

    // Textures
    textures: G3DMaterialTextures;

    // Dynamic Properties
    animated: boolean;
    timeDependent: boolean;
    medicalContext: G3DMedicalContext;

    // Rendering Properties
    doubleSided: boolean;
    transparent: boolean;
    alphaTest: number;
    blendMode: 'normal' | 'additive' | 'multiply' | 'screen';

    // Medical Visualization
    medicalVisualization: G3DMedicalVisualization;

    // User data for additional properties
    userData?: Map<string, any>;
}

export interface G3DSubsurfaceMaterial {
    enabled: boolean;
    color: vec3;
    radius: vec3; // RGB channels for different wavelengths
    falloff: number;
    thickness: number;
    distortion: number;
    power: number;
    scale: number;
}

export interface G3DMaterialTextures {
    albedoMap?: WebGLTexture;
    normalMap?: WebGLTexture;
    metallicMap?: WebGLTexture;
    roughnessMap?: WebGLTexture;
    aoMap?: WebGLTexture;
    emissionMap?: WebGLTexture;
    heightMap?: WebGLTexture;
    subsurfaceMap?: WebGLTexture;
    medicalDataMap?: WebGLTexture;
}

export interface G3DMedicalContext {
    patientAge: number;
    gender: 'male' | 'female' | 'other';
    pathologyPresent: boolean;
    contrastAgent: boolean;
    imagingModality: 'CT' | 'MRI' | 'PET' | 'SPECT' | 'US' | 'XR';
    tissueState: 'healthy' | 'diseased' | 'healing' | 'necrotic';
}

export interface G3DMedicalVisualization {
    enhanceContrast: boolean;
    highlightPathology: boolean;
    showBloodFlow: boolean;
    showMetabolism: boolean;
    colorCoding: 'anatomical' | 'functional' | 'pathological' | 'custom';
    intensityMapping: G3DIntensityMapping;
}

export interface G3DIntensityMapping {
    windowWidth: number;
    windowLevel: number;
    lutType: 'grayscale' | 'hot' | 'cool' | 'rainbow' | 'medical' | 'custom';
    invertLut: boolean;
    gammaCorrection: number;
}

export interface G3DMaterialPreset {
    id: string;
    name: string;
    category: 'tissue' | 'bone' | 'fluid' | 'pathology' | 'implant';
    material: Partial<G3DMaterial>;
    medicalAccuracy: number;
    clinicalUse: string[];
}

export class G3DAdvancedMaterials {
    private config: G3DMaterialConfig;
    private materials: Map<string, G3DMaterial> = new Map();
    private presets: Map<string, G3DMaterialPreset> = new Map();
    private shaderCache: Map<string, WebGLProgram> = new Map();
    private isInitialized: boolean = false;

    // Medical material presets
    private static readonly MEDICAL_PRESETS: G3DMaterialPreset[] = [
        {
            id: 'skin',
            name: 'Human Skin',
            category: 'tissue',
            material: {
                type: 'tissue',
                medicalType: 'soft_tissue',
                albedo: vec3.fromValues(0.85, 0.7, 0.6),
                roughness: 0.7,
                metallic: 0.0,
                subsurface: {
                    enabled: true,
                    color: vec3.fromValues(0.9, 0.6, 0.5),
                    radius: vec3.fromValues(1.2, 0.8, 0.6),
                    falloff: 2.0,
                    thickness: 0.8,
                    distortion: 0.3,
                    power: 2.0,
                    scale: 1.0
                }
            },
            medicalAccuracy: 0.95,
            clinicalUse: ['dermatology', 'plastic_surgery', 'general_examination']
        },
        {
            id: 'bone',
            name: 'Cortical Bone',
            category: 'bone',
            material: {
                type: 'bone',
                medicalType: 'hard_tissue',
                albedo: vec3.fromValues(0.95, 0.92, 0.88),
                roughness: 0.3,
                metallic: 0.0,
                subsurface: {
                    enabled: false,
                    color: vec3.fromValues(1, 1, 1),
                    radius: vec3.fromValues(0.1, 0.1, 0.1),
                    falloff: 1.0,
                    thickness: 0.1,
                    distortion: 0.1,
                    power: 0.5,
                    scale: 0.3
                }
            },
            medicalAccuracy: 0.98,
            clinicalUse: ['orthopedics', 'radiology', 'surgery']
        },
        {
            id: 'blood',
            name: 'Blood',
            category: 'fluid',
            material: {
                type: 'fluid',
                medicalType: 'fluid',
                albedo: vec3.fromValues(0.6, 0.1, 0.1),
                roughness: 0.1,
                metallic: 0.0,
                opacity: 0.8,
                refractiveIndex: 1.35,
                subsurface: {
                    enabled: true,
                    color: vec3.fromValues(0.8, 0.2, 0.1),
                    radius: vec3.fromValues(0.8, 0.4, 0.2),
                    falloff: 1.5,
                    thickness: 0.9,
                    distortion: 0.5,
                    power: 2.2,
                    scale: 1.1
                }
            },
            medicalAccuracy: 0.92,
            clinicalUse: ['vascular_imaging', 'hematology', 'surgery']
        },
        {
            id: 'tumor',
            name: 'Tumor Tissue',
            category: 'pathology',
            material: {
                type: 'tissue',
                medicalType: 'pathology',
                albedo: vec3.fromValues(0.7, 0.4, 0.3),
                roughness: 0.8,
                metallic: 0.0,
                subsurface: {
                    enabled: true,
                    color: vec3.fromValues(0.6, 0.3, 0.2),
                    radius: vec3.fromValues(0.5, 0.3, 0.2),
                    falloff: 1.3,
                    thickness: 0.5,
                    distortion: 0.3,
                    power: 1.3,
                    scale: 0.7
                }
            },
            medicalAccuracy: 0.88,
            clinicalUse: ['oncology', 'pathology', 'surgical_planning']
        }
    ];

    constructor(config: Partial<G3DMaterialConfig> = {}) {
        this.config = {
            enablePBR: true,
            enableSubsurfaceScattering: true,
            enableTransparency: true,
            enableMedicalPresets: true,
            maxMaterials: 1000,
            textureResolution: 1024,
            enableDynamicProperties: true,
            ...config
        };
    }

    async initialize(gl: WebGL2RenderingContext): Promise<void> {
        try {
            console.log('Initializing G3D Advanced Materials System...');

            // Load medical presets
            if (this.config.enableMedicalPresets) {
                await this.loadMedicalPresets();
            }

            // Initialize shader programs
            await this.initializeShaders(gl);

            // Set up default materials
            await this.createDefaultMaterials();

            this.isInitialized = true;
            console.log('G3D Advanced Materials System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Advanced Materials System:', error);
            throw error;
        }
    }

    private async loadMedicalPresets(): Promise<void> {
        for (const preset of G3DAdvancedMaterials.MEDICAL_PRESETS) {
            this.presets.set(preset.id, preset);
        }
        console.log(`Loaded ${this.presets.size} medical material presets`);
    }

    private async initializeShaders(gl: WebGL2RenderingContext): Promise<void> {
        console.log('Initializing material shaders...');
        // Shader initialization would be implemented here
    }

    private async createDefaultMaterials(): Promise<void> {
        // Create materials from presets
        for (const preset of this.presets.values()) {
            const material = this.createMaterialFromPreset(preset);
            this.materials.set(material.id, material);
        }
    }

    public createMaterial(materialData: Partial<G3DMaterial>): G3DMaterial {
        const material: G3DMaterial = {
            id: materialData.id || `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: materialData.name || 'Unnamed Material',
            type: materialData.type || 'pbr',

            // PBR defaults
            albedo: materialData.albedo || vec3.fromValues(0.8, 0.8, 0.8),
            metallic: materialData.metallic || 0.0,
            roughness: materialData.roughness || 0.5,
            ao: materialData.ao || 1.0,
            normal: materialData.normal || vec3.fromValues(0, 0, 1),
            emission: materialData.emission || vec3.fromValues(0, 0, 0),

            // Medical defaults
            medicalType: materialData.medicalType || 'soft_tissue',
            opacity: materialData.opacity || 1.0,
            refractiveIndex: materialData.refractiveIndex || 1.4,
            absorption: materialData.absorption || vec3.fromValues(0.1, 0.1, 0.1),
            scattering: materialData.scattering || vec3.fromValues(0.8, 0.8, 0.8),

            // Subsurface defaults
            subsurface: materialData.subsurface || {
                enabled: false,
                color: vec3.fromValues(1, 1, 1),
                radius: vec3.fromValues(1, 1, 1),
                falloff: 1.0,
                thickness: 1.0,
                distortion: 0.0,
                power: 1.0,
                scale: 1.0
            },

            // Textures
            textures: materialData.textures || {},

            // Dynamic properties
            animated: materialData.animated || false,
            timeDependent: materialData.timeDependent || false,
            medicalContext: materialData.medicalContext || {
                patientAge: 30,
                gender: 'other',
                pathologyPresent: false,
                contrastAgent: false,
                imagingModality: 'CT',
                tissueState: 'healthy'
            },

            // Rendering properties
            doubleSided: materialData.doubleSided || false,
            transparent: materialData.transparent || false,
            alphaTest: materialData.alphaTest || 0.0,
            blendMode: materialData.blendMode || 'normal',

            // Medical visualization
            medicalVisualization: materialData.medicalVisualization || {
                enhanceContrast: false,
                highlightPathology: false,
                showBloodFlow: false,
                showMetabolism: false,
                colorCoding: 'anatomical',
                intensityMapping: {
                    windowWidth: 400,
                    windowLevel: 40,
                    lutType: 'grayscale',
                    invertLut: false,
                    gammaCorrection: 1.0
                }
            }
        };

        this.materials.set(material.id, material);
        console.log(`Material created: ${material.id} (${material.type})`);
        return material;
    }

    public createMaterialFromPreset(preset: G3DMaterialPreset): G3DMaterial {
        const baseData = {
            id: `${preset.id}_${Date.now()}`,
            name: preset.name,
            ...preset.material
        };

        return this.createMaterial(baseData);
    }

    public getMaterial(materialId: string): G3DMaterial | null {
        return this.materials.get(materialId) || null;
    }

    public getAllMaterials(): G3DMaterial[] {
        return Array.from(this.materials.values());
    }

    public getMaterialsByType(type: G3DMaterial['type']): G3DMaterial[] {
        return Array.from(this.materials.values()).filter(m => m.type === type);
    }

    public getMaterialsByMedicalType(medicalType: G3DMaterial['medicalType']): G3DMaterial[] {
        return Array.from(this.materials.values()).filter(m => m.medicalType === medicalType);
    }

    public updateMaterial(materialId: string, updates: Partial<G3DMaterial>): boolean {
        const material = this.materials.get(materialId);
        if (!material) return false;

        Object.assign(material, updates);
        console.log(`Material updated: ${materialId}`);
        return true;
    }

    public deleteMaterial(materialId: string): boolean {
        const deleted = this.materials.delete(materialId);
        if (deleted) {
            console.log(`Material deleted: ${materialId}`);
        }
        return deleted;
    }

    public setMedicalContext(materialId: string, context: Partial<G3DMedicalContext>): boolean {
        const material = this.materials.get(materialId);
        if (!material) return false;

        Object.assign(material.medicalContext, context);
        this.updateMaterialForContext(material);
        return true;
    }

    private updateMaterialForContext(material: G3DMaterial): void {
        const context = material.medicalContext;

        // Adjust material properties based on medical context
        if (context.pathologyPresent && material.medicalType === 'soft_tissue') {
            // Enhance pathology visibility
            material.medicalVisualization.highlightPathology = true;
            material.medicalVisualization.enhanceContrast = true;
        }

        if (context.contrastAgent) {
            // Adjust for contrast agent presence
            material.medicalVisualization.enhanceContrast = true;
            vec3.scale(material.emission, material.emission, 1.2);
        }

        // Age-related tissue changes
        if (context.patientAge > 65) {
            material.roughness = Math.min(1.0, material.roughness * 1.1);
            if (material.subsurface.enabled) {
                material.subsurface.thickness *= 0.9;
            }
        }
    }

    public applyIntensityMapping(materialId: string, mapping: G3DIntensityMapping): boolean {
        const material = this.materials.get(materialId);
        if (!material) return false;

        material.medicalVisualization.intensityMapping = mapping;
        this.updateMaterialIntensity(material);
        return true;
    }

    private updateMaterialIntensity(material: G3DMaterial): void {
        const mapping = material.medicalVisualization.intensityMapping;

        // Apply window/level adjustments
        const windowMin = mapping.windowLevel - mapping.windowWidth / 2;
        const windowMax = mapping.windowLevel + mapping.windowWidth / 2;

        // Normalize intensity based on window settings
        // This would typically be done in the shader
        material.userData = material.userData || new Map();
        material.userData.set('windowMin', windowMin);
        material.userData.set('windowMax', windowMax);
        material.userData.set('gammaCorrection', mapping.gammaCorrection);
    }

    public enableSubsurfaceScattering(materialId: string, settings: Partial<G3DSubsurfaceMaterial>): boolean {
        const material = this.materials.get(materialId);
        if (!material || !this.config.enableSubsurfaceScattering) return false;

        material.subsurface = {
            ...material.subsurface,
            ...settings,
            enabled: true
        };

        console.log(`Subsurface scattering enabled for material: ${materialId}`);
        return true;
    }

    public createTissueMaterial(tissueType: string, properties: Partial<G3DMaterial> = {}): G3DMaterial {
        const tissuePresets: Record<string, Partial<G3DMaterial>> = {
            muscle: {
                albedo: vec3.fromValues(0.7, 0.3, 0.3),
                roughness: 0.6,
                subsurface: {
                    enabled: true,
                    color: vec3.fromValues(0.8, 0.4, 0.3),
                    radius: vec3.fromValues(0.6, 0.3, 0.2),
                    falloff: 1.5,
                    thickness: 0.6,
                    distortion: 0.2,
                    power: 1.5,
                    scale: 0.8
                }
            },
            fat: {
                albedo: vec3.fromValues(0.9, 0.85, 0.7),
                roughness: 0.8,
                subsurface: {
                    enabled: true,
                    color: vec3.fromValues(0.95, 0.9, 0.8),
                    radius: vec3.fromValues(1.5, 1.2, 1.0),
                    falloff: 2.5,
                    thickness: 1.2,
                    distortion: 0.4,
                    power: 2.5,
                    scale: 1.2
                }
            },
            liver: {
                albedo: vec3.fromValues(0.5, 0.2, 0.15),
                roughness: 0.7,
                subsurface: {
                    enabled: true,
                    color: vec3.fromValues(0.6, 0.3, 0.2),
                    radius: vec3.fromValues(0.8, 0.4, 0.3),
                    falloff: 1.8,
                    thickness: 0.7,
                    distortion: 0.4,
                    power: 1.8,
                    scale: 0.9
                }
            }
        };

        const preset = tissuePresets[tissueType.toLowerCase()] || tissuePresets.muscle;

        return this.createMaterial({
            name: `${tissueType} Tissue`,
            type: 'tissue',
            medicalType: 'soft_tissue',
            ...preset,
            ...properties
        });
    }

    public getMaterialUniforms(materialId: string): Record<string, any> {
        const material = this.materials.get(materialId);
        if (!material) return {};

        return {
            // PBR uniforms
            u_albedo: material.albedo,
            u_metallic: material.metallic,
            u_roughness: material.roughness,
            u_ao: material.ao,
            u_emission: material.emission,

            // Medical uniforms
            u_opacity: material.opacity,
            u_refractiveIndex: material.refractiveIndex,
            u_absorption: material.absorption,
            u_scattering: material.scattering,

            // Subsurface uniforms
            u_subsurfaceEnabled: material.subsurface.enabled ? 1 : 0,
            u_subsurfaceColor: material.subsurface.color,
            u_subsurfaceRadius: material.subsurface.radius,
            u_subsurfaceFalloff: material.subsurface.falloff,
            u_subsurfaceThickness: material.subsurface.thickness,

            // Medical visualization uniforms
            u_windowWidth: material.medicalVisualization.intensityMapping.windowWidth,
            u_windowLevel: material.medicalVisualization.intensityMapping.windowLevel,
            u_gammaCorrection: material.medicalVisualization.intensityMapping.gammaCorrection,
            u_enhanceContrast: material.medicalVisualization.enhanceContrast ? 1 : 0,
            u_highlightPathology: material.medicalVisualization.highlightPathology ? 1 : 0
        };
    }

    public getPresets(): G3DMaterialPreset[] {
        return Array.from(this.presets.values());
    }

    public getPresetsByCategory(category: G3DMaterialPreset['category']): G3DMaterialPreset[] {
        return Array.from(this.presets.values()).filter(p => p.category === category);
    }

    public getPerformanceMetrics(): {
        totalMaterials: number;
        pbrMaterials: number;
        subsurfaceMaterials: number;
        transparentMaterials: number;
        memoryUsage: number;
    } {
        const materials = Array.from(this.materials.values());

        return {
            totalMaterials: materials.length,
            pbrMaterials: materials.filter(m => m.type === 'pbr').length,
            subsurfaceMaterials: materials.filter(m => m.subsurface.enabled).length,
            transparentMaterials: materials.filter(m => m.transparent).length,
            memoryUsage: this.calculateMemoryUsage()
        };
    }

    private calculateMemoryUsage(): number {
        let usage = 0;

        // Estimate material data size
        usage += this.materials.size * 1024; // ~1KB per material

        // Estimate texture memory usage
        for (const material of this.materials.values()) {
            const textureCount = Object.keys(material.textures).length;
            usage += textureCount * this.config.textureResolution * this.config.textureResolution * 4;
        }

        return usage;
    }

    public dispose(): void {
        console.log('Disposing G3D Advanced Materials System...');

        // Dispose textures
        for (const material of this.materials.values()) {
            // WebGL texture cleanup would be implemented here
        }

        // Clear collections
        this.materials.clear();
        this.presets.clear();
        this.shaderCache.clear();

        this.isInitialized = false;
        console.log('G3D Advanced Materials System disposed');
    }
}

export default G3DAdvancedMaterials;