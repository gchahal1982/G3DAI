/**
 * G3D Material System - Advanced PBR materials and shader management
 * Provides physically-based rendering materials with custom shader support
 */

import { vec3, vec4, mat4 } from 'gl-matrix';

// Material types
export enum MaterialType {
    BASIC = 'basic',
    STANDARD = 'standard',
    PBR = 'pbr',
    UNLIT = 'unlit',
    TOON = 'toon',
    MATCAP = 'matcap',
    CUSTOM = 'custom'
}

// Blend modes
export enum BlendMode {
    OPAQUE = 'opaque',
    TRANSPARENT = 'transparent',
    ADDITIVE = 'additive',
    MULTIPLY = 'multiply',
    SCREEN = 'screen'
}

// Texture types
export enum TextureType {
    DIFFUSE = 'diffuse',
    NORMAL = 'normal',
    ROUGHNESS = 'roughness',
    METALNESS = 'metalness',
    AO = 'ao',
    EMISSIVE = 'emissive',
    DISPLACEMENT = 'displacement',
    ENVIRONMENT = 'environment'
}

// Base material interface
export interface Material {
    id: string;
    name: string;
    type: MaterialType;
    shader?: Shader;
    uniforms: Map<string, Uniform>;
    textures: Map<TextureType, Texture>;
    blendMode: BlendMode;
    doubleSided: boolean;
    depthWrite: boolean;
    depthTest: boolean;
    wireframe: boolean;
    visible: boolean;
}

// PBR material properties
export interface PBRMaterial extends Material {
    type: MaterialType.PBR;
    baseColor: vec4;
    metalness: number;
    roughness: number;
    ao: number;
    emissive: vec3;
    emissiveIntensity: number;
    normalScale: number;
    clearcoat: number;
    clearcoatRoughness: number;
    sheen: number;
    sheenColor: vec3;
    transmission: number;
    ior: number;
    thickness: number;
}

// Shader interface
export interface Shader {
    id: string;
    vertexSource: string;
    fragmentSource: string;
    computeSource?: string;
    defines: Map<string, string>;
    includes: string[];
    compiled: boolean;
    program?: GPURenderPipeline | WebGLProgram;
}

// Uniform types
export type UniformValue = number | vec3 | vec4 | mat4 | Texture;

export interface Uniform {
    name: string;
    type: string;
    value: UniformValue;
    needsUpdate: boolean;
}

// Texture interface
export interface Texture {
    id: string;
    source: ImageBitmap | HTMLImageElement | HTMLCanvasElement;
    width: number;
    height: number;
    format: GPUTextureFormat | number;
    wrapS: GPUAddressMode | number;
    wrapT: GPUAddressMode | number;
    minFilter: GPUFilterMode | number;
    magFilter: GPUFilterMode | number;
    anisotropy: number;
    generateMipmaps: boolean;
    texture?: GPUTexture | WebGLTexture;
    needsUpdate: boolean;
}

// Shader library
export class ShaderLibrary {
    private shaders: Map<string, Shader> = new Map();
    private includes: Map<string, string> = new Map();

    constructor() {
        this.initializeBuiltinShaders();
        this.initializeIncludes();
    }

    private initializeBuiltinShaders(): void {
        // Basic shader
        this.addShader('basic', {
            id: 'basic',
            vertexSource: `
        #version 300 es
        precision highp float;
        
        in vec3 aPosition;
        in vec3 aNormal;
        in vec2 aUV;
        
        uniform mat4 uModelMatrix;
        uniform mat4 uViewProjectionMatrix;
        uniform mat4 uNormalMatrix;
        
        out vec3 vNormal;
        out vec2 vUV;
        out vec3 vWorldPos;
        
        void main() {
          vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
          vWorldPos = worldPos.xyz;
          vNormal = normalize((uNormalMatrix * vec4(aNormal, 0.0)).xyz);
          vUV = aUV;
          gl_Position = uViewProjectionMatrix * worldPos;
        }
      `,
            fragmentSource: `
        #version 300 es
        precision highp float;
        
        in vec3 vNormal;
        in vec2 vUV;
        in vec3 vWorldPos;
        
        uniform vec4 uBaseColor;
        uniform sampler2D uDiffuseMap;
        uniform bool uUseDiffuseMap;
        
        out vec4 fragColor;
        
        void main() {
          vec4 color = uBaseColor;
          if (uUseDiffuseMap) {
            color *= texture(uDiffuseMap, vUV);
          }
          
          // Simple lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float NdotL = max(dot(vNormal, lightDir), 0.0);
          vec3 diffuse = color.rgb * (NdotL * 0.8 + 0.2);
          
          fragColor = vec4(diffuse, color.a);
        }
      `,
            defines: new Map(),
            includes: [],
            compiled: false
        });

        // PBR shader
        this.addShader('pbr', {
            id: 'pbr',
            vertexSource: `
        #version 300 es
        precision highp float;
        
        in vec3 aPosition;
        in vec3 aNormal;
        in vec2 aUV;
        in vec4 aTangent;
        
        uniform mat4 uModelMatrix;
        uniform mat4 uViewProjectionMatrix;
        uniform mat4 uNormalMatrix;
        
        out vec3 vNormal;
        out vec2 vUV;
        out vec3 vWorldPos;
        out vec3 vTangent;
        out vec3 vBitangent;
        
        void main() {
          vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
          vWorldPos = worldPos.xyz;
          vNormal = normalize((uNormalMatrix * vec4(aNormal, 0.0)).xyz);
          vTangent = normalize((uModelMatrix * vec4(aTangent.xyz, 0.0)).xyz);
          vBitangent = cross(vNormal, vTangent) * aTangent.w;
          vUV = aUV;
          gl_Position = uViewProjectionMatrix * worldPos;
        }
      `,
            fragmentSource: `
        #version 300 es
        precision highp float;
        
        #include <common>
        #include <lights>
        #include <pbr>
        
        in vec3 vNormal;
        in vec2 vUV;
        in vec3 vWorldPos;
        in vec3 vTangent;
        in vec3 vBitangent;
        
        uniform vec4 uBaseColor;
        uniform float uMetalness;
        uniform float uRoughness;
        uniform float uAO;
        uniform vec3 uEmissive;
        uniform float uEmissiveIntensity;
        uniform float uNormalScale;
        
        uniform sampler2D uDiffuseMap;
        uniform sampler2D uNormalMap;
        uniform sampler2D uRoughnessMap;
        uniform sampler2D uMetalnessMap;
        uniform sampler2D uAOMap;
        uniform sampler2D uEmissiveMap;
        
        uniform bool uUseDiffuseMap;
        uniform bool uUseNormalMap;
        uniform bool uUseRoughnessMap;
        uniform bool uUseMetalnessMap;
        uniform bool uUseAOMap;
        uniform bool uUseEmissiveMap;
        
        uniform vec3 uCameraPosition;
        
        out vec4 fragColor;
        
        void main() {
          // Base color
          vec4 baseColor = uBaseColor;
          if (uUseDiffuseMap) {
            baseColor *= texture(uDiffuseMap, vUV);
          }
          
          // Normal mapping
          vec3 normal = vNormal;
          if (uUseNormalMap) {
            vec3 normalTex = texture(uNormalMap, vUV).xyz * 2.0 - 1.0;
            normalTex.xy *= uNormalScale;
            mat3 TBN = mat3(vTangent, vBitangent, vNormal);
            normal = normalize(TBN * normalTex);
          }
          
          // Material properties
          float metalness = uMetalness;
          if (uUseMetalnessMap) {
            metalness *= texture(uMetalnessMap, vUV).r;
          }
          
          float roughness = uRoughness;
          if (uUseRoughnessMap) {
            roughness *= texture(uRoughnessMap, vUV).r;
          }
          
          float ao = uAO;
          if (uUseAOMap) {
            ao *= texture(uAOMap, vUV).r;
          }
          
          vec3 emissive = uEmissive * uEmissiveIntensity;
          if (uUseEmissiveMap) {
            emissive *= texture(uEmissiveMap, vUV).rgb;
          }
          
          // View direction
          vec3 viewDir = normalize(uCameraPosition - vWorldPos);
          
          // PBR lighting calculation
          vec3 color = calculatePBR(
            baseColor.rgb,
            normal,
            viewDir,
            metalness,
            roughness,
            ao,
            vWorldPos
          );
          
          // Add emissive
          color += emissive;
          
          fragColor = vec4(color, baseColor.a);
        }
      `,
            defines: new Map(),
            includes: ['common', 'lights', 'pbr'],
            compiled: false
        });
    }

    private initializeIncludes(): void {
        // Common utilities
        this.addInclude('common', `
      const float PI = 3.14159265359;
      const float EPSILON = 0.0001;
      
      float saturate(float x) {
        return clamp(x, 0.0, 1.0);
      }
      
      vec3 saturate(vec3 x) {
        return clamp(x, vec3(0.0), vec3(1.0));
      }
    `);

        // Lighting structures
        this.addInclude('lights', `
      struct DirectionalLight {
        vec3 direction;
        vec3 color;
        float intensity;
      };
      
      struct PointLight {
        vec3 position;
        vec3 color;
        float intensity;
        float range;
      };
      
      struct SpotLight {
        vec3 position;
        vec3 direction;
        vec3 color;
        float intensity;
        float range;
        float angle;
        float penumbra;
      };
      
      uniform DirectionalLight uDirectionalLights[4];
      uniform PointLight uPointLights[16];
      uniform SpotLight uSpotLights[8];
      uniform vec3 uAmbientLight;
    `);

        // PBR functions
        this.addInclude('pbr', `
      vec3 fresnelSchlick(float cosTheta, vec3 F0) {
        return F0 + (1.0 - F0) * pow(saturate(1.0 - cosTheta), 5.0);
      }
      
      float distributionGGX(vec3 N, vec3 H, float roughness) {
        float a = roughness * roughness;
        float a2 = a * a;
        float NdotH = max(dot(N, H), 0.0);
        float NdotH2 = NdotH * NdotH;
        
        float num = a2;
        float denom = (NdotH2 * (a2 - 1.0) + 1.0);
        denom = PI * denom * denom;
        
        return num / denom;
      }
      
      float geometrySchlickGGX(float NdotV, float roughness) {
        float r = (roughness + 1.0);
        float k = (r * r) / 8.0;
        
        float num = NdotV;
        float denom = NdotV * (1.0 - k) + k;
        
        return num / denom;
      }
      
      float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
        float NdotV = max(dot(N, V), 0.0);
        float NdotL = max(dot(N, L), 0.0);
        float ggx2 = geometrySchlickGGX(NdotV, roughness);
        float ggx1 = geometrySchlickGGX(NdotL, roughness);
        
        return ggx1 * ggx2;
      }
      
      vec3 calculatePBR(
        vec3 albedo,
        vec3 normal,
        vec3 viewDir,
        float metalness,
        float roughness,
        float ao,
        vec3 worldPos
      ) {
        vec3 F0 = vec3(0.04);
        F0 = mix(F0, albedo, metalness);
        
        vec3 Lo = vec3(0.0);
        
        // Directional lights
        for (int i = 0; i < 4; i++) {
          if (uDirectionalLights[i].intensity > 0.0) {
            vec3 L = normalize(-uDirectionalLights[i].direction);
            vec3 H = normalize(viewDir + L);
            vec3 radiance = uDirectionalLights[i].color * uDirectionalLights[i].intensity;
            
            float NDF = distributionGGX(normal, H, roughness);
            float G = geometrySmith(normal, viewDir, L, roughness);
            vec3 F = fresnelSchlick(max(dot(H, viewDir), 0.0), F0);
            
            vec3 kS = F;
            vec3 kD = vec3(1.0) - kS;
            kD *= 1.0 - metalness;
            
            vec3 numerator = NDF * G * F;
            float denominator = 4.0 * max(dot(normal, viewDir), 0.0) * max(dot(normal, L), 0.0) + EPSILON;
            vec3 specular = numerator / denominator;
            
            float NdotL = max(dot(normal, L), 0.0);
            Lo += (kD * albedo / PI + specular) * radiance * NdotL;
          }
        }
        
        // Ambient lighting
        vec3 ambient = uAmbientLight * albedo * ao;
        vec3 color = ambient + Lo;
        
        // Tone mapping and gamma correction
        color = color / (color + vec3(1.0));
        color = pow(color, vec3(1.0 / 2.2));
        
        return color;
      }
    `);
    }

    addShader(name: string, shader: Shader): void {
        this.shaders.set(name, shader);
    }

    getShader(name: string): Shader | undefined {
        return this.shaders.get(name);
    }

    addInclude(name: string, source: string): void {
        this.includes.set(name, source);
    }

    processIncludes(source: string): string {
        return source.replace(/#include\s+<(\w+)>/g, (match, includeName) => {
            const include = this.includes.get(includeName);
            if (!include) {
                console.warn(`Shader include '${includeName}' not found`);
                return '';
            }
            return include;
        });
    }
}

// Main G3D Material System Class
export class MaterialSystem {
    private materials: Map<string, Material> = new Map();
    private textures: Map<string, Texture> = new Map();
    private shaderLibrary: ShaderLibrary;
    private defaultMaterial: Material;

    constructor() {
        this.shaderLibrary = new ShaderLibrary();
        this.defaultMaterial = this.createBasicMaterial('default', vec4.fromValues(0.8, 0.8, 0.8, 1.0));
    }

    // Material creation

    createBasicMaterial(name: string, color: vec4): Material {
        const material: Material = {
            id: this.generateId(),
            name,
            type: MaterialType.BASIC,
            shader: this.shaderLibrary.getShader('basic'),
            uniforms: new Map([
                ['uBaseColor', { name: 'uBaseColor', type: 'vec4', value: vec4.clone(color), needsUpdate: true }],
                ['uUseDiffuseMap', { name: 'uUseDiffuseMap', type: 'bool', value: 0, needsUpdate: true }]
            ]),
            textures: new Map(),
            blendMode: BlendMode.OPAQUE,
            doubleSided: false,
            depthWrite: true,
            depthTest: true,
            wireframe: false,
            visible: true
        };

        this.materials.set(material.id, material);
        return material;
    }

    createPBRMaterial(name: string, params?: Partial<PBRMaterial>): PBRMaterial {
        const material: PBRMaterial = {
            id: this.generateId(),
            name,
            type: MaterialType.PBR,
            shader: this.shaderLibrary.getShader('pbr'),
            uniforms: new Map(),
            textures: new Map(),
            blendMode: BlendMode.OPAQUE,
            doubleSided: false,
            depthWrite: true,
            depthTest: true,
            wireframe: false,
            visible: true,
            // PBR properties
            baseColor: params?.baseColor || vec4.fromValues(1, 1, 1, 1),
            metalness: params?.metalness ?? 0,
            roughness: params?.roughness ?? 0.5,
            ao: params?.ao ?? 1,
            emissive: params?.emissive || vec3.fromValues(0, 0, 0),
            emissiveIntensity: params?.emissiveIntensity ?? 1,
            normalScale: params?.normalScale ?? 1,
            clearcoat: params?.clearcoat ?? 0,
            clearcoatRoughness: params?.clearcoatRoughness ?? 0,
            sheen: params?.sheen ?? 0,
            sheenColor: params?.sheenColor || vec3.fromValues(0, 0, 0),
            transmission: params?.transmission ?? 0,
            ior: params?.ior ?? 1.5,
            thickness: params?.thickness ?? 0
        };

        // Set uniforms
        this.updatePBRUniforms(material);

        this.materials.set(material.id, material);
        return material;
    }

    private updatePBRUniforms(material: PBRMaterial): void {
        material.uniforms.set('uBaseColor', {
            name: 'uBaseColor',
            type: 'vec4',
            value: vec4.clone(material.baseColor),
            needsUpdate: true
        });

        material.uniforms.set('uMetalness', {
            name: 'uMetalness',
            type: 'float',
            value: material.metalness,
            needsUpdate: true
        });

        material.uniforms.set('uRoughness', {
            name: 'uRoughness',
            type: 'float',
            value: material.roughness,
            needsUpdate: true
        });

        material.uniforms.set('uAO', {
            name: 'uAO',
            type: 'float',
            value: material.ao,
            needsUpdate: true
        });

        material.uniforms.set('uEmissive', {
            name: 'uEmissive',
            type: 'vec3',
            value: vec3.clone(material.emissive),
            needsUpdate: true
        });

        material.uniforms.set('uEmissiveIntensity', {
            name: 'uEmissiveIntensity',
            type: 'float',
            value: material.emissiveIntensity,
            needsUpdate: true
        });

        material.uniforms.set('uNormalScale', {
            name: 'uNormalScale',
            type: 'float',
            value: material.normalScale,
            needsUpdate: true
        });

        // Texture usage flags
        const textureTypes = [
            TextureType.DIFFUSE,
            TextureType.NORMAL,
            TextureType.ROUGHNESS,
            TextureType.METALNESS,
            TextureType.AO,
            TextureType.EMISSIVE
        ];

        for (const type of textureTypes) {
            const uniformName = `uUse${type.charAt(0).toUpperCase() + type.slice(1)}Map`;
            material.uniforms.set(uniformName, {
                name: uniformName,
                type: 'bool',
                value: material.textures.has(type) ? 1 : 0,
                needsUpdate: true
            });
        }
    }

    // Texture management

    getMaterial(id: string): Material | undefined {
        return this.materials.get(id);
    }

    deleteMaterial(id: string): void {
        this.materials.delete(id);
    }

    getDefaultMaterial(): Material {
        return this.defaultMaterial;
    }

    // Shader compilation

    compileShader(shader: Shader, isWebGPU: boolean): void {
        if (shader.compiled) return;

        let processedVertex = this.shaderLibrary.processIncludes(shader.vertexSource);
        let processedFragment = this.shaderLibrary.processIncludes(shader.fragmentSource);

        // Add defines
        const defineString = Array.from(shader.defines.entries())
            .map(([key, value]) => `#define ${key} ${value}`)
            .join('\n');

        if (defineString) {
            processedVertex = defineString + '\n' + processedVertex;
            processedFragment = defineString + '\n' + processedFragment;
        }

        // Store processed sources
        shader.vertexSource = processedVertex;
        shader.fragmentSource = processedFragment;
        shader.compiled = true;
    }

    // Utility

    private generateId(): string {
        return `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getShaderLibrary(): ShaderLibrary {
        return this.shaderLibrary;
    }

    getAllMaterials(): Material[] {
        return Array.from(this.materials.values());
    }

    getAllTextures(): Texture[] {
        return Array.from(this.textures.values());
    }

    /**
     * Create a material with flexible parameters
     */
    createMaterial(params: any): Material {
        const materialType = params.type || 'basic';
        
        switch (materialType) {
            case 'basic':
                return this.createBasicMaterial(
                    params.name || 'basic_material',
                    params.color ? vec4.fromValues(params.color.r, params.color.g, params.color.b, params.color.a) : vec4.fromValues(0.8, 0.8, 0.8, 1.0)
                );
            
            case 'pbr':
            case 'standard':
                return this.createPBRMaterial(params.name || 'pbr_material', {
                    baseColor: params.color ? vec4.fromValues(params.color.r, params.color.g, params.color.b, params.color.a) : vec4.fromValues(1, 1, 1, 1),
                    metalness: params.metalness || 0,
                    roughness: params.roughness || 0.5,
                    emissive: params.emissive ? vec3.fromValues(params.emissive.r, params.emissive.g, params.emissive.b) : vec3.fromValues(0, 0, 0),
                    emissiveIntensity: params.emissiveIntensity || 0
                });
            
            case 'glass':
                return this.createGlassMaterial(params.name || 'glass_material', {
                    baseColor: params.color ? vec4.fromValues(params.color.r, params.color.g, params.color.b, params.opacity || 0.5) : vec4.fromValues(1, 1, 1, 0.5),
                    roughness: params.roughness || 0.1,
                    transmission: params.transmission || 0.9,
                    thickness: params.thickness || 0.1
                });
            
            case 'points':
                return this.createPointsMaterial(params.name || 'points_material', {
                    color: params.color ? vec4.fromValues(params.color.r, params.color.g, params.color.b, params.color.a) : vec4.fromValues(1, 1, 1, 1),
                    size: params.size || 1,
                    vertexColors: params.vertexColors || false
                });
            
            default:
                return this.createBasicMaterial(params.name || 'default_material', vec4.fromValues(0.8, 0.8, 0.8, 1.0));
        }
    }

    /**
     * Create a texture from various sources
     */
    async createTexture(source: HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData | string): Promise<Texture> {
        const textureId = this.generateId();
        
        let imageSource: HTMLImageElement | HTMLCanvasElement | ImageBitmap;
        
        if (typeof source === 'string') {
            // Load image from URL
            imageSource = await this.loadImageFromUrl(source);
        } else if (source instanceof ImageData) {
            // Convert ImageData to canvas
            imageSource = this.imageDataToCanvas(source);
        } else {
            imageSource = source;
        }

        const texture: Texture = {
            id: textureId,
            source: imageSource,
            width: imageSource.width || (source as ImageData).width,
            height: imageSource.height || (source as ImageData).height,
            format: (WebGPU ? 'rgba8unorm' : 0x1908) as any, // RGBA
            wrapS: (WebGPU ? 'repeat' : 0x2901) as any, // REPEAT
            wrapT: (WebGPU ? 'repeat' : 0x2901) as any,
            minFilter: (WebGPU ? 'linear' : 0x2729) as any, // LINEAR_MIPMAP_LINEAR
            magFilter: (WebGPU ? 'linear' : 0x2729) as any,
            anisotropy: 16,
            generateMipmaps: true,
            needsUpdate: true
        };

        this.textures.set(textureId, texture);
        return texture;
    }

    setMaterialTexture(material: Material, type: TextureType, texture: Texture): void {
        material.textures.set(type, texture);

        // Update uniform
        const uniformName = `uUse${type.charAt(0).toUpperCase() + type.slice(1)}Map`;
        const uniform = material.uniforms.get(uniformName);
        if (uniform) {
            uniform.value = 1;
            uniform.needsUpdate = true;
        }

        // Add texture uniform
        const textureUniformName = `u${type.charAt(0).toUpperCase() + type.slice(1)}Map`;
        material.uniforms.set(textureUniformName, {
            name: textureUniformName,
            type: 'sampler2D',
            value: texture,
            needsUpdate: true
        });
    }

    /**
     * Create a text sprite
     */
    createTextSprite(text: string, options: any = {}): any {
        const fontSize = options.fontSize || 16;
        const color = options.color || { r: 1, g: 1, b: 1, a: 1 };
        const backgroundColor = options.backgroundColor || { r: 0, g: 0, b: 0, a: 0.7 };
        const padding = options.padding || 4;

        // Create canvas for text rendering
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context for text sprite');
        }

        // Set font
        ctx.font = `${fontSize}px Arial`;
        
        // Measure text
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;

        // Set canvas size
        canvas.width = textWidth + padding * 2;
        canvas.height = textHeight + padding * 2;

        // Draw background
        ctx.fillStyle = `rgba(${backgroundColor.r * 255}, ${backgroundColor.g * 255}, ${backgroundColor.b * 255}, ${backgroundColor.a})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text
        ctx.fillStyle = `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${color.a})`;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        // Create sprite object
        const sprite = {
            id: this.generateId(),
            type: 'sprite',
            canvas: canvas,
            texture: null as any,
            position: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            visible: true,
            userData: { text, options }
        };

        // Create texture from canvas
        this.createTexture(canvas).then(texture => {
            sprite.texture = texture;
        });

        return sprite;
    }

    /**
     * Update material properties
     */
    updateMaterial(material: Material, updates: any): void {
        if (!material) return;

        // Update basic properties
        if (updates.color) {
            const colorUniform = material.uniforms.get('uBaseColor');
            if (colorUniform) {
                colorUniform.value = vec4.fromValues(updates.color.r, updates.color.g, updates.color.b, updates.color.a || 1);
                colorUniform.needsUpdate = true;
            }
        }

        if (updates.emissive) {
            const emissiveUniform = material.uniforms.get('uEmissive');
            if (emissiveUniform) {
                emissiveUniform.value = vec3.fromValues(updates.emissive.r, updates.emissive.g, updates.emissive.b);
                emissiveUniform.needsUpdate = true;
            }
        }

        if (updates.emissiveIntensity !== undefined) {
            const emissiveIntensityUniform = material.uniforms.get('uEmissiveIntensity');
            if (emissiveIntensityUniform) {
                emissiveIntensityUniform.value = updates.emissiveIntensity;
                emissiveIntensityUniform.needsUpdate = true;
            }
        }

        if (updates.opacity !== undefined) {
            const colorUniform = material.uniforms.get('uBaseColor');
            if (colorUniform && colorUniform.value) {
                (colorUniform.value as vec4)[3] = updates.opacity;
                colorUniform.needsUpdate = true;
            }
        }

        // Update PBR properties
        if (material.type === MaterialType.PBR) {
            if (updates.metalness !== undefined) {
                const metalnessUniform = material.uniforms.get('uMetalness');
                if (metalnessUniform) {
                    metalnessUniform.value = updates.metalness;
                    metalnessUniform.needsUpdate = true;
                }
            }

            if (updates.roughness !== undefined) {
                const roughnessUniform = material.uniforms.get('uRoughness');
                if (roughnessUniform) {
                    roughnessUniform.value = updates.roughness;
                    roughnessUniform.needsUpdate = true;
                }
            }
        }

        // Update visibility and other properties
        if (updates.visible !== undefined) {
            material.visible = updates.visible;
        }

        if (updates.transparent !== undefined) {
            material.blendMode = updates.transparent ? BlendMode.TRANSPARENT : BlendMode.OPAQUE;
        }

        if (updates.wireframe !== undefined) {
            material.wireframe = updates.wireframe;
        }
    }

    /**
     * Create a glass material
     */
    createGlassMaterial(name: string, params: any = {}): Material {
        const material: Material = {
            id: this.generateId(),
            name,
            type: MaterialType.PBR,
            shader: this.shaderLibrary.getShader('pbr'),
            uniforms: new Map(),
            textures: new Map(),
            blendMode: BlendMode.TRANSPARENT,
            doubleSided: false,
            depthWrite: false,
            depthTest: true,
            wireframe: false,
            visible: true
        };

        // Set glass-specific uniforms
        material.uniforms.set('uBaseColor', { 
            name: 'uBaseColor', 
            type: 'vec4', 
            value: params.baseColor || vec4.fromValues(1, 1, 1, 0.5), 
            needsUpdate: true 
        });
        material.uniforms.set('uMetalness', { 
            name: 'uMetalness', 
            type: 'float', 
            value: 0, 
            needsUpdate: true 
        });
        material.uniforms.set('uRoughness', { 
            name: 'uRoughness', 
            type: 'float', 
            value: params.roughness || 0.1, 
            needsUpdate: true 
        });
        material.uniforms.set('uTransmission', { 
            name: 'uTransmission', 
            type: 'float', 
            value: params.transmission || 0.9, 
            needsUpdate: true 
        });
        material.uniforms.set('uThickness', { 
            name: 'uThickness', 
            type: 'float', 
            value: params.thickness || 0.1, 
            needsUpdate: true 
        });

        this.materials.set(material.id, material);
        return material;
    }

    /**
     * Create a points material
     */
    createPointsMaterial(name: string, params: any = {}): Material {
        const material: Material = {
            id: this.generateId(),
            name,
            type: MaterialType.BASIC,
            shader: this.shaderLibrary.getShader('points'),
            uniforms: new Map(),
            textures: new Map(),
            blendMode: BlendMode.OPAQUE,
            doubleSided: false,
            depthWrite: true,
            depthTest: true,
            wireframe: false,
            visible: true
        };

        // Set points-specific uniforms
        material.uniforms.set('uBaseColor', { 
            name: 'uBaseColor', 
            type: 'vec4', 
            value: params.color || vec4.fromValues(1, 1, 1, 1), 
            needsUpdate: true 
        });
        material.uniforms.set('uPointSize', { 
            name: 'uPointSize', 
            type: 'float', 
            value: params.size || 1, 
            needsUpdate: true 
        });
        material.uniforms.set('uVertexColors', { 
            name: 'uVertexColors', 
            type: 'bool', 
            value: params.vertexColors ? 1 : 0, 
            needsUpdate: true 
        });

        this.materials.set(material.id, material);
        return material;
    }

    // Helper methods

    private async loadImageFromUrl(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.crossOrigin = 'anonymous';
            img.src = url;
        });
    }

    private imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.putImageData(imageData, 0, 0);
        }
        return canvas;
    }
}

// Check if WebGPU is available
const WebGPU = 'gpu' in navigator;

// Export factory function
export function createG3DMaterialSystem(): MaterialSystem {
    return new MaterialSystem();
}