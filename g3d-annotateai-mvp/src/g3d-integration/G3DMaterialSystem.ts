/**
 * G3D Material System - Advanced PBR materials and shader management
 * Provides physically-based rendering materials with custom shader support
 */

import { vec3, vec4, mat4 } from 'gl-matrix';

// Material types
export enum G3DMaterialType {
    BASIC = 'basic',
    STANDARD = 'standard',
    PBR = 'pbr',
    UNLIT = 'unlit',
    TOON = 'toon',
    MATCAP = 'matcap',
    CUSTOM = 'custom'
}

// Blend modes
export enum G3DBlendMode {
    OPAQUE = 'opaque',
    TRANSPARENT = 'transparent',
    ADDITIVE = 'additive',
    MULTIPLY = 'multiply',
    SCREEN = 'screen'
}

// Texture types
export enum G3DTextureType {
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
export interface G3DMaterial {
    id: string;
    name: string;
    type: G3DMaterialType;
    shader?: G3DShader;
    uniforms: Map<string, G3DUniform>;
    textures: Map<G3DTextureType, G3DTexture>;
    blendMode: G3DBlendMode;
    doubleSided: boolean;
    depthWrite: boolean;
    depthTest: boolean;
    wireframe: boolean;
    visible: boolean;
}

// PBR material properties
export interface G3DPBRMaterial extends G3DMaterial {
    type: G3DMaterialType.PBR;
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
export interface G3DShader {
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
export type G3DUniformValue = number | vec3 | vec4 | mat4 | G3DTexture;

export interface G3DUniform {
    name: string;
    type: string;
    value: G3DUniformValue;
    needsUpdate: boolean;
}

// Texture interface
export interface G3DTexture {
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
export class G3DShaderLibrary {
    private shaders: Map<string, G3DShader> = new Map();
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

    addShader(name: string, shader: G3DShader): void {
        this.shaders.set(name, shader);
    }

    getShader(name: string): G3DShader | undefined {
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
export class G3DMaterialSystem {
    private materials: Map<string, G3DMaterial> = new Map();
    private textures: Map<string, G3DTexture> = new Map();
    private shaderLibrary: G3DShaderLibrary;
    private defaultMaterial: G3DMaterial;

    constructor() {
        this.shaderLibrary = new G3DShaderLibrary();
        this.defaultMaterial = this.createBasicMaterial('default', vec4.fromValues(0.8, 0.8, 0.8, 1.0));
    }

    // Material creation

    createBasicMaterial(name: string, color: vec4): G3DMaterial {
        const material: G3DMaterial = {
            id: this.generateId(),
            name,
            type: G3DMaterialType.BASIC,
            shader: this.shaderLibrary.getShader('basic'),
            uniforms: new Map([
                ['uBaseColor', { name: 'uBaseColor', type: 'vec4', value: vec4.clone(color), needsUpdate: true }],
                ['uUseDiffuseMap', { name: 'uUseDiffuseMap', type: 'bool', value: 0, needsUpdate: true }]
            ]),
            textures: new Map(),
            blendMode: G3DBlendMode.OPAQUE,
            doubleSided: false,
            depthWrite: true,
            depthTest: true,
            wireframe: false,
            visible: true
        };

        this.materials.set(material.id, material);
        return material;
    }

    createPBRMaterial(name: string, params?: Partial<G3DPBRMaterial>): G3DPBRMaterial {
        const material: G3DPBRMaterial = {
            id: this.generateId(),
            name,
            type: G3DMaterialType.PBR,
            shader: this.shaderLibrary.getShader('pbr'),
            uniforms: new Map(),
            textures: new Map(),
            blendMode: G3DBlendMode.OPAQUE,
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

    private updatePBRUniforms(material: G3DPBRMaterial): void {
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
            G3DTextureType.DIFFUSE,
            G3DTextureType.NORMAL,
            G3DTextureType.ROUGHNESS,
            G3DTextureType.METALNESS,
            G3DTextureType.AO,
            G3DTextureType.EMISSIVE
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

    createTexture(source: ImageBitmap | HTMLImageElement | HTMLCanvasElement, params?: Partial<G3DTexture>): G3DTexture {
        const texture: G3DTexture = {
            id: this.generateId(),
            source,
            width: source.width,
            height: source.height,
            format: params?.format || (WebGPU ? 'rgba8unorm' : 0x1908), // RGBA
            wrapS: params?.wrapS || (WebGPU ? 'repeat' : 0x2901), // REPEAT
            wrapT: params?.wrapT || (WebGPU ? 'repeat' : 0x2901),
            minFilter: params?.minFilter || (WebGPU ? 'linear' : 0x2729), // LINEAR_MIPMAP_LINEAR
            magFilter: params?.magFilter || (WebGPU ? 'linear' : 0x2729),
            anisotropy: params?.anisotropy ?? 16,
            generateMipmaps: params?.generateMipmaps ?? true,
            needsUpdate: true
        };

        this.textures.set(texture.id, texture);
        return texture;
    }

    setMaterialTexture(material: G3DMaterial, type: G3DTextureType, texture: G3DTexture): void {
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

    // Material management

    getMaterial(id: string): G3DMaterial | undefined {
        return this.materials.get(id);
    }

    deleteMaterial(id: string): void {
        this.materials.delete(id);
    }

    getDefaultMaterial(): G3DMaterial {
        return this.defaultMaterial;
    }

    // Shader compilation

    compileShader(shader: G3DShader, isWebGPU: boolean): void {
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

    getShaderLibrary(): G3DShaderLibrary {
        return this.shaderLibrary;
    }

    getAllMaterials(): G3DMaterial[] {
        return Array.from(this.materials.values());
    }

    getAllTextures(): G3DTexture[] {
        return Array.from(this.textures.values());
    }
}

// Check if WebGPU is available
const WebGPU = 'gpu' in navigator;

// Export factory function
export function createG3DMaterialSystem(): G3DMaterialSystem {
    return new G3DMaterialSystem();
}