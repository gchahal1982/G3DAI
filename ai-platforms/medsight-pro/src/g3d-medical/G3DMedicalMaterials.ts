/**
 * G3D MedSight Pro - Medical Materials System
 * Medical-specific materials and shaders for clinical visualization
 * 
 * Features:
 * - Tissue-specific rendering properties
 * - Medical contrast enhancement materials
 * - Anatomical structure materials
 * - Pathology visualization materials
 * - Clinical diagnostic optimizations
 * - Real-time material switching
 */

import { vec3, vec4 } from 'gl-matrix';

// Medical Material Types
export interface MedicalMaterialConfig {
    name: string;
    type: 'tissue' | 'bone' | 'vessel' | 'organ' | 'pathology' | 'contrast' | 'implant';
    medicalProperties: MedicalProperties;
    renderingProperties: RenderingProperties;
    clinicalSettings: ClinicalSettings;
    shaderVariant: string;
}

export interface MedicalProperties {
    hounsfield: { min: number; max: number };
    density: number;
    attenuation: number;
    scattering: number;
    absorption: number;
    anisotropy: number;
    perfusion?: number;
    elasticity?: number;
    conductivity?: number;
}

export interface RenderingProperties {
    albedo: vec3;
    metallic: number;
    roughness: number;
    specular: number;
    emission: vec3;
    transparency: number;
    refraction: number;
    subsurface: number;
    translucency: number;
}

export interface ClinicalSettings {
    diagnosticRelevance: 'critical' | 'important' | 'moderate' | 'low';
    contrastEnhancement: number;
    edgeEnhancement: number;
    noiseReduction: number;
    artifactSuppression: number;
    measurementAccuracy: number;
    visualizationPriority: number;
}

export interface MaterialPreset {
    id: string;
    name: string;
    category: 'anatomy' | 'pathology' | 'contrast' | 'surgical' | 'diagnostic';
    materials: MedicalMaterialConfig[];
    transferFunction: TransferFunctionData;
    renderingMode: 'volume' | 'surface' | 'hybrid';
    clinicalUseCase: string;
}

export interface TransferFunctionData {
    colorPoints: Array<{ value: number; color: vec4 }>;
    opacityPoints: Array<{ value: number; opacity: number }>;
    gradientPoints: Array<{ value: number; gradient: number }>;
}

// Advanced Medical Shader Templates
export class MedicalShaderTemplates {
    static readonly TISSUE_VERTEX_SHADER = `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec3 a_normal;
    layout(location = 2) in vec2 a_texCoord;
    layout(location = 3) in vec3 a_medicalData; // HU, density, perfusion
    
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_projectionMatrix;
    uniform mat4 u_normalMatrix;
    uniform vec3 u_lightPosition;
    uniform vec3 u_cameraPosition;
    
    out vec3 v_position;
    out vec3 v_normal;
    out vec2 v_texCoord;
    out vec3 v_medicalData;
    out vec3 v_lightDir;
    out vec3 v_viewDir;
    out float v_depth;
    
    void main() {
      vec4 worldPosition = u_modelViewMatrix * vec4(a_position, 1.0);
      gl_Position = u_projectionMatrix * worldPosition;
      
      v_position = worldPosition.xyz;
      v_normal = normalize((u_normalMatrix * vec4(a_normal, 0.0)).xyz);
      v_texCoord = a_texCoord;
      v_medicalData = a_medicalData;
      v_lightDir = normalize(u_lightPosition - worldPosition.xyz);
      v_viewDir = normalize(u_cameraPosition - worldPosition.xyz);
      v_depth = gl_Position.z / gl_Position.w;
    }
  `;

    static readonly TISSUE_FRAGMENT_SHADER = `#version 300 es
    precision highp float;
    
    in vec3 v_position;
    in vec3 v_normal;
    in vec2 v_texCoord;
    in vec3 v_medicalData;
    in vec3 v_lightDir;
    in vec3 v_viewDir;
    in float v_depth;
    
    uniform sampler2D u_diffuseTexture;
    uniform sampler2D u_normalTexture;
    uniform sampler2D u_medicalLUT;
    
    // Medical material properties
    uniform float u_hounsfieldMin;
    uniform float u_hounsfieldMax;
    uniform float u_density;
    uniform float u_attenuation;
    uniform float u_scattering;
    uniform float u_absorption;
    uniform float u_perfusion;
    
    // Rendering properties
    uniform vec3 u_albedo;
    uniform float u_metallic;
    uniform float u_roughness;
    uniform float u_specular;
    uniform vec3 u_emission;
    uniform float u_transparency;
    uniform float u_subsurface;
    
    // Clinical settings
    uniform float u_contrastEnhancement;
    uniform float u_edgeEnhancement;
    uniform float u_noiseReduction;
    uniform bool u_diagnosticMode;
    
    out vec4 fragColor;
    
    // Medical windowing for tissue visualization
    float applyMedicalWindowing(float hounsfield) {
      float normalized = (hounsfield - u_hounsfieldMin) / (u_hounsfieldMax - u_hounsfieldMin);
      return clamp(normalized, 0.0, 1.0);
    }
    
    // Subsurface scattering approximation for soft tissue
    vec3 calculateSubsurfaceScattering(vec3 normal, vec3 lightDir, vec3 viewDir) {
      float thickness = u_density * 0.1; // Approximate thickness
      float scatterAmount = u_scattering * thickness;
      
      // Simple subsurface approximation
      float backlight = max(0.0, dot(-lightDir, normal));
      float subsurfaceContrib = pow(backlight, 1.0 + scatterAmount) * u_subsurface;
      
      return u_albedo * subsurfaceContrib;
    }
    
    // Medical edge enhancement for diagnostic clarity
    float calculateEdgeEnhancement(vec2 texCoord) {
      if (u_edgeEnhancement <= 0.0) return 1.0;
      
      vec2 texelSize = vec2(1.0) / textureSize(u_diffuseTexture, 0);
      
      // Sobel edge detection
      float tl = texture(u_diffuseTexture, texCoord + vec2(-texelSize.x, -texelSize.y)).r;
      float tm = texture(u_diffuseTexture, texCoord + vec2(0.0, -texelSize.y)).r;
      float tr = texture(u_diffuseTexture, texCoord + vec2(texelSize.x, -texelSize.y)).r;
      float ml = texture(u_diffuseTexture, texCoord + vec2(-texelSize.x, 0.0)).r;
      float mr = texture(u_diffuseTexture, texCoord + vec2(texelSize.x, 0.0)).r;
      float bl = texture(u_diffuseTexture, texCoord + vec2(-texelSize.x, texelSize.y)).r;
      float bm = texture(u_diffuseTexture, texCoord + vec2(0.0, texelSize.y)).r;
      float br = texture(u_diffuseTexture, texCoord + vec2(texelSize.x, texelSize.y)).r;
      
      float sobelX = (tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl);
      float sobelY = (bl + 2.0 * bm + br) - (tl + 2.0 * tm + tr);
      float edgeMagnitude = sqrt(sobelX * sobelX + sobelY * sobelY);
      
      return 1.0 + edgeMagnitude * u_edgeEnhancement;
    }
    
    // Noise reduction filter for medical images
    vec3 applyNoiseReduction(vec2 texCoord, vec3 color) {
      if (u_noiseReduction <= 0.0) return color;
      
      vec2 texelSize = vec2(1.0) / textureSize(u_diffuseTexture, 0);
      vec3 sum = vec3(0.0);
      float weights = 0.0;
      
      // Gaussian blur for noise reduction
      for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
          vec2 offset = vec2(float(x), float(y)) * texelSize * u_noiseReduction;
          vec3 sample = texture(u_diffuseTexture, texCoord + offset).rgb;
          float weight = exp(-float(x*x + y*y) / 2.0);
          sum += sample * weight;
          weights += weight;
        }
      }
      
      return mix(color, sum / weights, u_noiseReduction);
    }
    
    void main() {
      // Sample textures
      vec4 diffuse = texture(u_diffuseTexture, v_texCoord);
      vec3 normal = normalize(v_normal);
      
      // Extract medical data
      float hounsfield = v_medicalData.x;
      float localDensity = v_medicalData.y;
      float perfusionValue = v_medicalData.z;
      
      // Apply medical windowing
      float windowedIntensity = applyMedicalWindowing(hounsfield);
      
      // Base material color
      vec3 baseColor = u_albedo * diffuse.rgb;
      
      // Apply medical enhancements
      float edgeEnhancement = calculateEdgeEnhancement(v_texCoord);
      baseColor *= edgeEnhancement;
      
      // Lighting calculations
      float NdotL = max(dot(normal, v_lightDir), 0.0);
      float NdotV = max(dot(normal, v_viewDir), 0.0);
      vec3 halfVector = normalize(v_lightDir + v_viewDir);
      float NdotH = max(dot(normal, halfVector), 0.0);
      
      // Diffuse component with medical properties
      vec3 diffuseContrib = baseColor * NdotL * (1.0 - u_absorption);
      
      // Specular component
      float specularPower = mix(32.0, 256.0, 1.0 - u_roughness);
      vec3 specularContrib = vec3(u_specular) * pow(NdotH, specularPower) * (1.0 - u_metallic);
      
      // Subsurface scattering for soft tissues
      vec3 subsurfaceContrib = calculateSubsurfaceScattering(normal, v_lightDir, v_viewDir);
      
      // Combine lighting components
      vec3 finalColor = diffuseContrib + specularContrib + subsurfaceContrib + u_emission;
      
      // Apply contrast enhancement
      finalColor = mix(finalColor, finalColor * u_contrastEnhancement, u_contrastEnhancement - 1.0);
      
      // Apply noise reduction
      finalColor = applyNoiseReduction(v_texCoord, finalColor);
      
      // Medical diagnostic adjustments
      if (u_diagnosticMode) {
        // Enhance contrast for diagnostic viewing
        finalColor = pow(finalColor, vec3(0.8));
        
        // Highlight perfusion if available
        if (perfusionValue > 0.1) {
          finalColor.r += perfusionValue * 0.3;
        }
      }
      
      // Apply transparency
      float alpha = mix(1.0, diffuse.a, u_transparency);
      
      fragColor = vec4(finalColor, alpha);
    }
  `;

    static readonly BONE_FRAGMENT_SHADER = `#version 300 es
    precision highp float;
    
    in vec3 v_position;
    in vec3 v_normal;
    in vec2 v_texCoord;
    in vec3 v_medicalData;
    in vec3 v_lightDir;
    in vec3 v_viewDir;
    
    uniform float u_boneThreshold;
    uniform float u_corticalDensity;
    uniform float u_trabecularDensity;
    uniform vec3 u_corticalColor;
    uniform vec3 u_trabecularColor;
    
    out vec4 fragColor;
    
    void main() {
      float hounsfield = v_medicalData.x;
      float density = v_medicalData.y;
      
      // Bone classification based on HU values
      float corticalWeight = smoothstep(300.0, 1000.0, hounsfield);
      float trabecularWeight = smoothstep(150.0, 300.0, hounsfield);
      
      vec3 boneColor = mix(
        u_trabecularColor * trabecularWeight,
        u_corticalColor * corticalWeight,
        corticalWeight
      );
      
      // Enhanced lighting for bone visualization
      vec3 normal = normalize(v_normal);
      float NdotL = max(dot(normal, v_lightDir), 0.0);
      vec3 halfVector = normalize(v_lightDir + v_viewDir);
      float NdotH = max(dot(normal, halfVector), 0.0);
      
      vec3 diffuse = boneColor * NdotL;
      vec3 specular = vec3(0.8) * pow(NdotH, 64.0);
      
      vec3 finalColor = diffuse + specular;
      float alpha = step(u_boneThreshold, hounsfield);
      
      fragColor = vec4(finalColor, alpha);
    }
  `;

    static readonly VESSEL_FRAGMENT_SHADER = `#version 300 es
    precision highp float;
    
    in vec3 v_position;
    in vec3 v_normal;
    in vec2 v_texCoord;
    in vec3 v_medicalData;
    in vec3 v_lightDir;
    in vec3 v_viewDir;
    
    uniform float u_contrastThreshold;
    uniform vec3 u_vesselColor;
    uniform float u_flowVisualization;
    uniform float u_time;
    
    out vec4 fragColor;
    
    void main() {
      float hounsfield = v_medicalData.x;
      float perfusion = v_medicalData.z;
      
      // Contrast-enhanced vessel detection
      float vesselIntensity = smoothstep(u_contrastThreshold - 50.0, u_contrastThreshold + 50.0, hounsfield);
      
      vec3 baseColor = u_vesselColor * vesselIntensity;
      
      // Flow visualization
      if (u_flowVisualization > 0.0 && perfusion > 0.1) {
        float flowPattern = sin(v_position.z * 10.0 + u_time * 2.0) * 0.5 + 0.5;
        baseColor = mix(baseColor, baseColor * 1.5, flowPattern * u_flowVisualization);
      }
      
      vec3 normal = normalize(v_normal);
      float NdotL = max(dot(normal, v_lightDir), 0.0);
      
      vec3 finalColor = baseColor * (0.3 + 0.7 * NdotL);
      float alpha = vesselIntensity;
      
      fragColor = vec4(finalColor, alpha);
    }
  `;
}

// Medical Material Manager
export class MedicalMaterialManager {
    private materials: Map<string, MedicalMaterialConfig> = new Map();
    private presets: Map<string, MaterialPreset> = new Map();
    private shaderPrograms: Map<string, WebGLProgram> = new Map();
    private currentPreset: string | null = null;
    private gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.initializeDefaultMaterials();
        this.initializePresets();
        this.compileShaders();
    }

    private initializeDefaultMaterials(): void {
        // Soft tissue materials
        this.materials.set('soft_tissue', {
            name: 'Soft Tissue',
            type: 'tissue',
            medicalProperties: {
                hounsfield: { min: -100, max: 100 },
                density: 1.0,
                attenuation: 0.2,
                scattering: 0.8,
                absorption: 0.1,
                anisotropy: 0.9,
                perfusion: 0.3
            },
            renderingProperties: {
                albedo: vec3.fromValues(0.8, 0.6, 0.5),
                metallic: 0.0,
                roughness: 0.8,
                specular: 0.1,
                emission: vec3.fromValues(0.0, 0.0, 0.0),
                transparency: 0.2,
                refraction: 1.33,
                subsurface: 0.5,
                translucency: 0.3
            },
            clinicalSettings: {
                diagnosticRelevance: 'important',
                contrastEnhancement: 1.2,
                edgeEnhancement: 0.3,
                noiseReduction: 0.2,
                artifactSuppression: 0.5,
                measurementAccuracy: 0.9,
                visualizationPriority: 0.7
            },
            shaderVariant: 'tissue'
        });

        // Bone material
        this.materials.set('bone', {
            name: 'Bone',
            type: 'bone',
            medicalProperties: {
                hounsfield: { min: 200, max: 3000 },
                density: 1.8,
                attenuation: 0.8,
                scattering: 0.2,
                absorption: 0.6,
                anisotropy: 0.3
            },
            renderingProperties: {
                albedo: vec3.fromValues(0.9, 0.9, 0.8),
                metallic: 0.0,
                roughness: 0.6,
                specular: 0.3,
                emission: vec3.fromValues(0.0, 0.0, 0.0),
                transparency: 0.0,
                refraction: 1.0,
                subsurface: 0.0,
                translucency: 0.0
            },
            clinicalSettings: {
                diagnosticRelevance: 'critical',
                contrastEnhancement: 1.5,
                edgeEnhancement: 0.8,
                noiseReduction: 0.1,
                artifactSuppression: 0.3,
                measurementAccuracy: 0.95,
                visualizationPriority: 0.9
            },
            shaderVariant: 'bone'
        });

        // Blood vessel material
        this.materials.set('vessel', {
            name: 'Blood Vessel',
            type: 'vessel',
            medicalProperties: {
                hounsfield: { min: 100, max: 500 },
                density: 1.05,
                attenuation: 0.3,
                scattering: 0.6,
                absorption: 0.2,
                anisotropy: 0.8,
                perfusion: 1.0
            },
            renderingProperties: {
                albedo: vec3.fromValues(0.8, 0.2, 0.2),
                metallic: 0.0,
                roughness: 0.4,
                specular: 0.4,
                emission: vec3.fromValues(0.1, 0.0, 0.0),
                transparency: 0.1,
                refraction: 1.35,
                subsurface: 0.7,
                translucency: 0.4
            },
            clinicalSettings: {
                diagnosticRelevance: 'critical',
                contrastEnhancement: 2.0,
                edgeEnhancement: 0.6,
                noiseReduction: 0.3,
                artifactSuppression: 0.4,
                measurementAccuracy: 0.85,
                visualizationPriority: 0.95
            },
            shaderVariant: 'vessel'
        });

        // Lung tissue material
        this.materials.set('lung', {
            name: 'Lung Tissue',
            type: 'organ',
            medicalProperties: {
                hounsfield: { min: -1000, max: -200 },
                density: 0.3,
                attenuation: 0.1,
                scattering: 0.9,
                absorption: 0.05,
                anisotropy: 0.95
            },
            renderingProperties: {
                albedo: vec3.fromValues(0.7, 0.7, 0.8),
                metallic: 0.0,
                roughness: 0.9,
                specular: 0.05,
                emission: vec3.fromValues(0.0, 0.0, 0.0),
                transparency: 0.8,
                refraction: 1.0,
                subsurface: 0.9,
                translucency: 0.8
            },
            clinicalSettings: {
                diagnosticRelevance: 'critical',
                contrastEnhancement: 1.8,
                edgeEnhancement: 0.5,
                noiseReduction: 0.4,
                artifactSuppression: 0.6,
                measurementAccuracy: 0.8,
                visualizationPriority: 0.85
            },
            shaderVariant: 'tissue'
        });

        // Contrast agent material
        this.materials.set('contrast', {
            name: 'Contrast Agent',
            type: 'contrast',
            medicalProperties: {
                hounsfield: { min: 300, max: 1000 },
                density: 1.5,
                attenuation: 0.9,
                scattering: 0.1,
                absorption: 0.8,
                anisotropy: 0.1
            },
            renderingProperties: {
                albedo: vec3.fromValues(1.0, 1.0, 0.8),
                metallic: 0.0,
                roughness: 0.2,
                specular: 0.8,
                emission: vec3.fromValues(0.2, 0.2, 0.1),
                transparency: 0.0,
                refraction: 1.4,
                subsurface: 0.1,
                translucency: 0.0
            },
            clinicalSettings: {
                diagnosticRelevance: 'critical',
                contrastEnhancement: 3.0,
                edgeEnhancement: 1.0,
                noiseReduction: 0.1,
                artifactSuppression: 0.2,
                measurementAccuracy: 0.98,
                visualizationPriority: 1.0
            },
            shaderVariant: 'contrast'
        });
    }

    private initializePresets(): void {
        // Chest CT preset
        this.presets.set('chest_ct', {
            id: 'chest_ct',
            name: 'Chest CT',
            category: 'anatomy',
            materials: [
                this.materials.get('lung')!,
                this.materials.get('soft_tissue')!,
                this.materials.get('bone')!
            ],
            transferFunction: {
                colorPoints: [
                    { value: 0.0, color: vec4.fromValues(0.0, 0.0, 0.0, 0.0) },
                    { value: 0.3, color: vec4.fromValues(0.7, 0.7, 0.8, 0.3) },
                    { value: 0.6, color: vec4.fromValues(0.8, 0.6, 0.5, 0.6) },
                    { value: 1.0, color: vec4.fromValues(0.9, 0.9, 0.8, 1.0) }
                ],
                opacityPoints: [
                    { value: 0.0, opacity: 0.0 },
                    { value: 0.2, opacity: 0.1 },
                    { value: 0.5, opacity: 0.5 },
                    { value: 1.0, opacity: 1.0 }
                ],
                gradientPoints: [
                    { value: 0.0, gradient: 0.0 },
                    { value: 0.5, gradient: 1.0 },
                    { value: 1.0, gradient: 0.5 }
                ]
            },
            renderingMode: 'volume',
            clinicalUseCase: 'Chest CT examination for lung, heart, and mediastinal evaluation'
        });

        // Angiography preset
        this.presets.set('angiography', {
            id: 'angiography',
            name: 'Angiography',
            category: 'contrast',
            materials: [
                this.materials.get('vessel')!,
                this.materials.get('contrast')!,
                this.materials.get('soft_tissue')!
            ],
            transferFunction: {
                colorPoints: [
                    { value: 0.0, color: vec4.fromValues(0.0, 0.0, 0.0, 0.0) },
                    { value: 0.4, color: vec4.fromValues(0.2, 0.2, 0.2, 0.1) },
                    { value: 0.7, color: vec4.fromValues(0.8, 0.2, 0.2, 0.8) },
                    { value: 1.0, color: vec4.fromValues(1.0, 1.0, 0.8, 1.0) }
                ],
                opacityPoints: [
                    { value: 0.0, opacity: 0.0 },
                    { value: 0.3, opacity: 0.0 },
                    { value: 0.6, opacity: 0.8 },
                    { value: 1.0, opacity: 1.0 }
                ],
                gradientPoints: [
                    { value: 0.0, gradient: 0.0 },
                    { value: 0.7, gradient: 1.0 },
                    { value: 1.0, gradient: 0.8 }
                ]
            },
            renderingMode: 'volume',
            clinicalUseCase: 'Vascular imaging with contrast enhancement'
        });

        // Bone visualization preset
        this.presets.set('bone_3d', {
            id: 'bone_3d',
            name: 'Bone 3D',
            category: 'anatomy',
            materials: [
                this.materials.get('bone')!
            ],
            transferFunction: {
                colorPoints: [
                    { value: 0.0, color: vec4.fromValues(0.0, 0.0, 0.0, 0.0) },
                    { value: 0.3, color: vec4.fromValues(0.4, 0.2, 0.1, 0.0) },
                    { value: 0.7, color: vec4.fromValues(1.0, 0.9, 0.7, 0.8) },
                    { value: 1.0, color: vec4.fromValues(1.0, 1.0, 1.0, 1.0) }
                ],
                opacityPoints: [
                    { value: 0.0, opacity: 0.0 },
                    { value: 0.2, opacity: 0.0 },
                    { value: 0.3, opacity: 0.1 },
                    { value: 1.0, opacity: 1.0 }
                ],
                gradientPoints: [
                    { value: 0.0, gradient: 0.0 },
                    { value: 0.5, gradient: 1.0 },
                    { value: 1.0, gradient: 0.7 }
                ]
            },
            renderingMode: 'surface',
            clinicalUseCase: 'Orthopedic and skeletal visualization'
        });
    }

    private compileShaders(): void {
        try {
            // Compile tissue shader
            const tissueProgram = this.createShaderProgram(
                MedicalShaderTemplates.TISSUE_VERTEX_SHADER,
                MedicalShaderTemplates.TISSUE_FRAGMENT_SHADER
            );
            this.shaderPrograms.set('tissue', tissueProgram);

            // Compile bone shader
            const boneProgram = this.createShaderProgram(
                MedicalShaderTemplates.TISSUE_VERTEX_SHADER,
                MedicalShaderTemplates.BONE_FRAGMENT_SHADER
            );
            this.shaderPrograms.set('bone', boneProgram);

            // Compile vessel shader
            const vesselProgram = this.createShaderProgram(
                MedicalShaderTemplates.TISSUE_VERTEX_SHADER,
                MedicalShaderTemplates.VESSEL_FRAGMENT_SHADER
            );
            this.shaderPrograms.set('vessel', vesselProgram);

            console.log('Medical shaders compiled successfully');
        } catch (error) {
            console.error('Failed to compile medical shaders:', error);
        }
    }

    private createShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
        const vertexShader = this.compileShader(vertexSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(fragmentSource, this.gl.FRAGMENT_SHADER);

        const program = this.gl.createProgram()!;
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            throw new Error('Shader program linking failed: ' + this.gl.getProgramInfoLog(program));
        }

        return program;
    }

    private compileShader(source: string, type: number): WebGLShader {
        const shader = this.gl.createShader(type)!;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error('Shader compilation failed: ' + this.gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    applyMaterialPreset(presetId: string): boolean {
        const preset = this.presets.get(presetId);
        if (!preset) {
            console.warn(`Material preset ${presetId} not found`);
            return false;
        }

        this.currentPreset = presetId;
        console.log(`Applied material preset: ${preset.name}`);
        return true;
    }

    getMaterial(materialId: string): MedicalMaterialConfig | undefined {
        return this.materials.get(materialId);
    }

    getPreset(presetId: string): MaterialPreset | undefined {
        return this.presets.get(presetId);
    }

    getCurrentPreset(): MaterialPreset | null {
        return this.currentPreset ? this.presets.get(this.currentPreset) || null : null;
    }

    getShaderProgram(shaderVariant: string): WebGLProgram | undefined {
        return this.shaderPrograms.get(shaderVariant);
    }

    createCustomMaterial(config: MedicalMaterialConfig): string {
        const materialId = `custom_${Date.now()}_${Math.random()}`;
        this.materials.set(materialId, config);
        return materialId;
    }

    updateMaterial(materialId: string, updates: Partial<MedicalMaterialConfig>): boolean {
        const material = this.materials.get(materialId);
        if (!material) {
            return false;
        }

        Object.assign(material, updates);
        return true;
    }

    optimizeForModality(modality: 'CT' | 'MRI' | 'PET' | 'US' | 'XR'): void {
        // Optimize materials based on imaging modality
        switch (modality) {
            case 'CT':
                // Optimize for Hounsfield units and bone/soft tissue contrast
                this.materials.forEach(material => {
                    if (material.type === 'bone') {
                        material.clinicalSettings.contrastEnhancement = 1.8;
                        material.clinicalSettings.edgeEnhancement = 0.9;
                    }
                });
                break;

            case 'MRI':
                // Optimize for T1/T2 contrast and soft tissue differentiation
                this.materials.forEach(material => {
                    if (material.type === 'tissue') {
                        material.renderingProperties.subsurface = 0.8;
                        material.clinicalSettings.contrastEnhancement = 1.5;
                    }
                });
                break;

            case 'PET':
                // Optimize for metabolic activity visualization
                this.materials.forEach(material => {
                    material.renderingProperties.emission = vec3.scale(
                        vec3.create(),
                        material.renderingProperties.emission,
                        2.0
                    );
                });
                break;
        }
    }

    getMaterialMetrics(): object {
        return {
            materialCount: this.materials.size,
            presetCount: this.presets.size,
            shaderCount: this.shaderPrograms.size,
            currentPreset: this.currentPreset,
            availableMaterials: Array.from(this.materials.keys()),
            availablePresets: Array.from(this.presets.keys())
        };
    }

    dispose(): void {
        // Clean up shader programs
        this.shaderPrograms.forEach(program => {
            this.gl.deleteProgram(program);
        });

        this.materials.clear();
        this.presets.clear();
        this.shaderPrograms.clear();
        this.currentPreset = null;

        console.log('G3D Medical Materials disposed');
    }
}

export default MedicalMaterialManager;