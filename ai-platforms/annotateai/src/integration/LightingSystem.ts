/**
 * G3D Lighting System - Professional lighting with PBR support
 * Provides advanced lighting including directional, point, spot, area, and IBL
 */

import { vec3, vec4, mat4 } from 'gl-matrix';
import { SceneNode } from './SceneManager';

// Light types
export enum LightType {
    DIRECTIONAL = 'directional',
    POINT = 'point',
    SPOT = 'spot',
    AREA = 'area',
    HEMISPHERE = 'hemisphere',
    IBL = 'ibl'  // Image-based lighting
}

// Base light interface
export interface Light {
    type: LightType;
    color: vec3;
    intensity: number;
    enabled: boolean;
    castShadow: boolean;
    shadowConfig?: ShadowConfig;
}

// Directional light
export interface DirectionalLight extends Light {
    type: LightType.DIRECTIONAL;
    direction: vec3;
}

// Point light
export interface PointLight extends Light {
    type: LightType.POINT;
    position: vec3;
    range: number;
    decay: number;
}

// Spot light
export interface SpotLight extends Light {
    type: LightType.SPOT;
    position: vec3;
    direction: vec3;
    angle: number;  // Cone angle in radians
    penumbra: number;  // Penumbra percentage (0-1)
    range: number;
    decay: number;
}

// Area light
export interface AreaLight extends Light {
    type: LightType.AREA;
    position: vec3;
    width: number;
    height: number;
    normal: vec3;
}

// Hemisphere light
export interface HemisphereLight extends Light {
    type: LightType.HEMISPHERE;
    skyColor: vec3;
    groundColor: vec3;
    direction: vec3;
}

// Image-based lighting
export interface IBLLight extends Light {
    type: LightType.IBL;
    environmentMap: CubeTexture;
    irradianceMap?: CubeTexture;
    prefilterMap?: CubeTexture;
    brdfLUT?: Texture;
}

// Shadow configuration
export interface ShadowConfig {
    mapSize: number;
    bias: number;
    normalBias: number;
    radius: number;
    blurSamples: number;
    camera?: {
        near: number;
        far: number;
        fov?: number;  // For spot lights
        left?: number;  // For directional lights
        right?: number;
        top?: number;
        bottom?: number;
    };
}

// Texture interfaces
export interface Texture {
    texture: GPUTexture | WebGLTexture;
    width: number;
    height: number;
}

export interface CubeTexture {
    texture: GPUTexture | WebGLTexture;
    size: number;
}

// Light uniform buffer structure
export interface LightUniforms {
    // Directional lights (max 4)
    directionalLights: {
        direction: vec4;  // w = enabled
        color: vec4;      // w = intensity
    }[];

    // Point lights (max 16)
    pointLights: {
        position: vec4;   // w = range
        color: vec4;      // w = intensity
        attenuation: vec4; // x = constant, y = linear, z = quadratic, w = enabled
    }[];

    // Spot lights (max 8)
    spotLights: {
        position: vec4;    // w = range
        direction: vec4;   // w = cos(angle)
        color: vec4;       // w = intensity
        params: vec4;      // x = cos(angle), y = penumbra, z = decay, w = enabled
    }[];

    // Area lights (max 4)
    areaLights: {
        position: vec4;    // w = width
        normal: vec4;      // w = height
        color: vec4;       // w = intensity
        tangent: vec4;     // w = enabled
    }[];

    // Global lighting
    ambientColor: vec4;
    fogColor: vec4;
    fogParams: vec4;   // x = near, y = far, z = density, w = enabled
}

// Lighting statistics
export interface LightingStats {
    totalLights: number;
    activeLights: number;
    shadowCasters: number;
    shadowMapMemory: number;
    updateTime: number;
}

// Main G3D Lighting System Class
export class LightingSystem {
    private lights: Map<string, { light: Light; node: SceneNode }> = new Map();
    private shadowMaps: Map<string, ShadowMap> = new Map();
    private lightUniforms: LightUniforms;
    private stats: LightingStats = {
        totalLights: 0,
        activeLights: 0,
        shadowCasters: 0,
        shadowMapMemory: 0,
        updateTime: 0
    };

    // Configuration
    private config = {
        maxDirectionalLights: 4,
        maxPointLights: 16,
        maxSpotLights: 8,
        maxAreaLights: 4,
        shadowMapSize: 2048,
        shadowCascades: 4,  // For cascaded shadow maps
        enableSoftShadows: true,
        enableAreaLightApproximation: true
    };

    // Ambient and fog
    private ambientColor: vec3 = vec3.fromValues(0.1, 0.1, 0.1);
    private fogConfig = {
        enabled: false,
        color: vec3.fromValues(0.5, 0.5, 0.5),
        near: 10,
        far: 100,
        density: 0.01
    };

    constructor() {
        this.initializeLightUniforms();
    }

    private initializeLightUniforms(): void {
        this.lightUniforms = {
            directionalLights: Array(this.config.maxDirectionalLights).fill(null).map(() => ({
                direction: vec4.create(),
                color: vec4.create()
            })),
            pointLights: Array(this.config.maxPointLights).fill(null).map(() => ({
                position: vec4.create(),
                color: vec4.create(),
                attenuation: vec4.create()
            })),
            spotLights: Array(this.config.maxSpotLights).fill(null).map(() => ({
                position: vec4.create(),
                direction: vec4.create(),
                color: vec4.create(),
                params: vec4.create()
            })),
            areaLights: Array(this.config.maxAreaLights).fill(null).map(() => ({
                position: vec4.create(),
                normal: vec4.create(),
                color: vec4.create(),
                tangent: vec4.create()
            })),
            ambientColor: vec4.create(),
            fogColor: vec4.create(),
            fogParams: vec4.create()
        };
    }

    // Light management

    addLight(id: string, light: Light, node: SceneNode): void {
        this.lights.set(id, { light, node });
        this.stats.totalLights++;

        // Create shadow map if needed
        if (light.castShadow && light.shadowConfig) {
            this.createShadowMap(id, light);
        }
    }

    removeLight(id: string): void {
        const lightData = this.lights.get(id);
        if (!lightData) return;

        this.lights.delete(id);
        this.stats.totalLights--;

        // Remove shadow map
        const shadowMap = this.shadowMaps.get(id);
        if (shadowMap) {
            this.destroyShadowMap(id);
        }
    }

    getLight(id: string): Light | undefined {
        const lightData = this.lights.get(id);
        return lightData?.light;
    }

    // Shadow map management

    private createShadowMap(id: string, light: Light): void {
        const config = light.shadowConfig!;
        const shadowMap: ShadowMap = {
            texture: null!,  // Will be created by renderer
            size: config.mapSize || this.config.shadowMapSize,
            viewMatrix: mat4.create(),
            projectionMatrix: mat4.create(),
            viewProjectionMatrix: mat4.create()
        };

        this.shadowMaps.set(id, shadowMap);
        this.stats.shadowCasters++;
        this.stats.shadowMapMemory += shadowMap.size * shadowMap.size * 4;  // Assuming 32-bit depth
    }

    private destroyShadowMap(id: string): void {
        const shadowMap = this.shadowMaps.get(id);
        if (!shadowMap) return;

        this.shadowMaps.delete(id);
        this.stats.shadowCasters--;
        this.stats.shadowMapMemory -= shadowMap.size * shadowMap.size * 4;
    }

    // Update methods

    update(deltaTime: number): void {
        const startTime = Date.now();

        // Clear uniform data
        this.clearLightUniforms();

        // Update ambient and fog
        vec4.set(this.lightUniforms.ambientColor,
            this.ambientColor[0], this.ambientColor[1], this.ambientColor[2], 1);
        vec4.set(this.lightUniforms.fogColor,
            this.fogConfig.color[0], this.fogConfig.color[1], this.fogConfig.color[2], 1);
        vec4.set(this.lightUniforms.fogParams,
            this.fogConfig.near, this.fogConfig.far, this.fogConfig.density,
            this.fogConfig.enabled ? 1 : 0);

        // Counters for each light type
        let directionalCount = 0;
        let pointCount = 0;
        let spotCount = 0;
        let areaCount = 0;

        this.stats.activeLights = 0;

        // Process each light
        this.lights.forEach(({ light, node }, id) => {
            if (!light.enabled || !node.visible) return;

            this.stats.activeLights++;

            switch (light.type) {
                case LightType.DIRECTIONAL:
                    if (directionalCount < this.config.maxDirectionalLights) {
                        this.updateDirectionalLight(light as DirectionalLight, node, directionalCount++);
                    }
                    break;

                case LightType.POINT:
                    if (pointCount < this.config.maxPointLights) {
                        this.updatePointLight(light as PointLight, node, pointCount++);
                    }
                    break;

                case LightType.SPOT:
                    if (spotCount < this.config.maxSpotLights) {
                        this.updateSpotLight(light as SpotLight, node, spotCount++);
                    }
                    break;

                case LightType.AREA:
                    if (areaCount < this.config.maxAreaLights) {
                        this.updateAreaLight(light as AreaLight, node, areaCount++);
                    }
                    break;
            }

            // Update shadow map if needed
            if (light.castShadow) {
                this.updateShadowMap(id, light, node);
            }
        });

        this.stats.updateTime = Date.now() - startTime;
    }

    private clearLightUniforms(): void {
        // Clear all light data
        for (const light of this.lightUniforms.directionalLights) {
            vec4.set(light.direction, 0, 0, 0, 0);
            vec4.set(light.color, 0, 0, 0, 0);
        }

        for (const light of this.lightUniforms.pointLights) {
            vec4.set(light.position, 0, 0, 0, 0);
            vec4.set(light.color, 0, 0, 0, 0);
            vec4.set(light.attenuation, 0, 0, 0, 0);
        }

        for (const light of this.lightUniforms.spotLights) {
            vec4.set(light.position, 0, 0, 0, 0);
            vec4.set(light.direction, 0, 0, 0, 0);
            vec4.set(light.color, 0, 0, 0, 0);
            vec4.set(light.params, 0, 0, 0, 0);
        }

        for (const light of this.lightUniforms.areaLights) {
            vec4.set(light.position, 0, 0, 0, 0);
            vec4.set(light.normal, 0, 0, 0, 0);
            vec4.set(light.color, 0, 0, 0, 0);
            vec4.set(light.tangent, 0, 0, 0, 0);
        }
    }

    private updateDirectionalLight(light: DirectionalLight, node: SceneNode, index: number): void {
        const uniform = this.lightUniforms.directionalLights[index];

        // Transform direction to world space
        const worldDir = vec3.create();
        vec3.transformMat4(worldDir, light.direction, node.transform.worldMatrix);
        vec3.normalize(worldDir, worldDir);

        vec4.set(uniform.direction, worldDir[0], worldDir[1], worldDir[2], 1);
        vec4.set(uniform.color,
            light.color[0] * light.intensity,
            light.color[1] * light.intensity,
            light.color[2] * light.intensity,
            light.intensity);
    }

    private updatePointLight(light: PointLight, node: SceneNode, index: number): void {
        const uniform = this.lightUniforms.pointLights[index];

        // Get world position
        const worldPos = vec3.create();
        mat4.getTranslation(worldPos, node.transform.worldMatrix);

        vec4.set(uniform.position, worldPos[0], worldPos[1], worldPos[2], light.range);
        vec4.set(uniform.color,
            light.color[0] * light.intensity,
            light.color[1] * light.intensity,
            light.color[2] * light.intensity,
            light.intensity);

        // Calculate attenuation coefficients
        const constant = 1.0;
        const linear = 2.0 / light.range;
        const quadratic = 1.0 / (light.range * light.range);
        vec4.set(uniform.attenuation, constant, linear, quadratic * light.decay, 1);
    }

    private updateSpotLight(light: SpotLight, node: SceneNode, index: number): void {
        const uniform = this.lightUniforms.spotLights[index];

        // Get world position
        const worldPos = vec3.create();
        mat4.getTranslation(worldPos, node.transform.worldMatrix);

        // Transform direction to world space
        const worldDir = vec3.create();
        vec3.transformMat4(worldDir, light.direction, node.transform.worldMatrix);
        vec3.normalize(worldDir, worldDir);

        const cosAngle = Math.cos(light.angle);
        const cosInnerAngle = Math.cos(light.angle * (1 - light.penumbra));

        vec4.set(uniform.position, worldPos[0], worldPos[1], worldPos[2], light.range);
        vec4.set(uniform.direction, worldDir[0], worldDir[1], worldDir[2], cosAngle);
        vec4.set(uniform.color,
            light.color[0] * light.intensity,
            light.color[1] * light.intensity,
            light.color[2] * light.intensity,
            light.intensity);
        vec4.set(uniform.params, cosAngle, cosInnerAngle, light.decay, 1);
    }

    private updateAreaLight(light: AreaLight, node: SceneNode, index: number): void {
        const uniform = this.lightUniforms.areaLights[index];

        // Get world position
        const worldPos = vec3.create();
        mat4.getTranslation(worldPos, node.transform.worldMatrix);

        // Transform normal to world space
        const worldNormal = vec3.create();
        vec3.transformMat4(worldNormal, light.normal, node.transform.worldMatrix);
        vec3.normalize(worldNormal, worldNormal);

        // Calculate tangent
        const tangent = vec3.create();
        if (Math.abs(worldNormal[1]) < 0.999) {
            vec3.cross(tangent, worldNormal, [0, 1, 0]);
        } else {
            vec3.cross(tangent, worldNormal, [1, 0, 0]);
        }
        vec3.normalize(tangent, tangent);

        vec4.set(uniform.position, worldPos[0], worldPos[1], worldPos[2], light.width);
        vec4.set(uniform.normal, worldNormal[0], worldNormal[1], worldNormal[2], light.height);
        vec4.set(uniform.color,
            light.color[0] * light.intensity,
            light.color[1] * light.intensity,
            light.color[2] * light.intensity,
            light.intensity);
        vec4.set(uniform.tangent, tangent[0], tangent[1], tangent[2], 1);
    }

    private updateShadowMap(id: string, light: Light, node: SceneNode): void {
        const shadowMap = this.shadowMaps.get(id);
        if (!shadowMap || !light.shadowConfig) return;

        const config = light.shadowConfig;

        switch (light.type) {
            case LightType.DIRECTIONAL:
                this.updateDirectionalShadowMap(light as DirectionalLight, node, shadowMap, config);
                break;

            case LightType.SPOT:
                this.updateSpotShadowMap(light as SpotLight, node, shadowMap, config);
                break;

            case LightType.POINT:
                // Point lights would use cube shadow maps
                this.updatePointShadowMap(light as PointLight, node, shadowMap, config);
                break;
        }

        // Update view-projection matrix
        mat4.multiply(shadowMap.viewProjectionMatrix, shadowMap.projectionMatrix, shadowMap.viewMatrix);
    }

    private updateDirectionalShadowMap(
        light: DirectionalLight,
        node: SceneNode,
        shadowMap: ShadowMap,
        config: ShadowConfig
    ): void {
        // Get light direction in world space
        const worldDir = vec3.create();
        vec3.transformMat4(worldDir, light.direction, node.transform.worldMatrix);
        vec3.normalize(worldDir, worldDir);

        // Calculate view matrix (looking along light direction)
        const target = vec3.create();
        const up = Math.abs(worldDir[1]) < 0.999 ? vec3.fromValues(0, 1, 0) : vec3.fromValues(1, 0, 0);
        mat4.lookAt(shadowMap.viewMatrix, worldDir, target, up);

        // Orthographic projection for directional lights
        const camera = config.camera || {} as any;
        mat4.ortho(shadowMap.projectionMatrix,
            camera.left || -50,
            camera.right || 50,
            camera.bottom || -50,
            camera.top || 50,
            camera.near || 0.1,
            camera.far || 100);
    }

    private updateSpotShadowMap(
        light: SpotLight,
        node: SceneNode,
        shadowMap: ShadowMap,
        config: ShadowConfig
    ): void {
        // Get world position and direction
        const worldPos = vec3.create();
        mat4.getTranslation(worldPos, node.transform.worldMatrix);

        const worldDir = vec3.create();
        vec3.transformMat4(worldDir, light.direction, node.transform.worldMatrix);
        vec3.normalize(worldDir, worldDir);

        // Calculate target position
        const target = vec3.create();
        vec3.scaleAndAdd(target, worldPos, worldDir, 1);

        // View matrix
        const up = Math.abs(worldDir[1]) < 0.999 ? vec3.fromValues(0, 1, 0) : vec3.fromValues(1, 0, 0);
        mat4.lookAt(shadowMap.viewMatrix, worldPos, target, up);

        // Perspective projection for spot lights
        const camera = config.camera || {} as any;
        mat4.perspective(shadowMap.projectionMatrix,
            camera.fov || light.angle * 2,
            1,  // Aspect ratio
            camera.near || 0.1,
            camera.far || light.range);
    }

    private updatePointShadowMap(
        light: PointLight,
        node: SceneNode,
        shadowMap: ShadowMap,
        config: ShadowConfig
    ): void {
        // Point lights need cube shadow maps - simplified for now
        // In a full implementation, this would render to 6 faces of a cube texture
        const worldPos = vec3.create();
        mat4.getTranslation(worldPos, node.transform.worldMatrix);

        // Just update for one face as example
        const target = vec3.add(vec3.create(), worldPos, [1, 0, 0]);
        mat4.lookAt(shadowMap.viewMatrix, worldPos, target, [0, -1, 0]);

        const camera = config.camera || {} as any;
        mat4.perspective(shadowMap.projectionMatrix,
            Math.PI / 2,  // 90 degree FOV for cube face
            1,
            camera.near || 0.1,
            camera.far || light.range);
    }

    // Public API

    setAmbientColor(r: number, g: number, b: number): void {
        vec3.set(this.ambientColor, r, g, b);
    }

    getAmbientColor(): vec3 {
        return vec3.clone(this.ambientColor);
    }

    setFog(enabled: boolean, color?: vec3, near?: number, far?: number, density?: number): void {
        this.fogConfig.enabled = enabled;
        if (color) vec3.copy(this.fogConfig.color, color);
        if (near !== undefined) this.fogConfig.near = near;
        if (far !== undefined) this.fogConfig.far = far;
        if (density !== undefined) this.fogConfig.density = density;
    }

    getFogConfig(): typeof this.fogConfig {
        return { ...this.fogConfig, color: vec3.clone(this.fogConfig.color) };
    }

    getLightUniforms(): LightUniforms {
        return this.lightUniforms;
    }

    getShadowMap(lightId: string): ShadowMap | undefined {
        return this.shadowMaps.get(lightId);
    }

    getStats(): LightingStats {
        return { ...this.stats };
    }

    // Utility functions

    createDirectionalLight(color: vec3, intensity: number, direction: vec3): DirectionalLight {
        return {
            type: LightType.DIRECTIONAL,
            color: vec3.clone(color),
            intensity,
            direction: vec3.clone(direction),
            enabled: true,
            castShadow: false
        };
    }

    createPointLight(color: vec3, intensity: number, position: vec3, range: number): PointLight {
        return {
            type: LightType.POINT,
            color: vec3.clone(color),
            intensity,
            position: vec3.clone(position),
            range,
            decay: 2,
            enabled: true,
            castShadow: false
        };
    }

    createSpotLight(
        color: vec3,
        intensity: number,
        position: vec3,
        direction: vec3,
        angle: number,
        range: number
    ): SpotLight {
        return {
            type: LightType.SPOT,
            color: vec3.clone(color),
            intensity,
            position: vec3.clone(position),
            direction: vec3.clone(direction),
            angle,
            penumbra: 0.1,
            range,
            decay: 2,
            enabled: true,
            castShadow: false
        };
    }

    createAreaLight(
        color: vec3,
        intensity: number,
        position: vec3,
        width: number,
        height: number
    ): AreaLight {
        return {
            type: LightType.AREA,
            color: vec3.clone(color),
            intensity,
            position: vec3.clone(position),
            width,
            height,
            normal: vec3.fromValues(0, 0, 1),
            enabled: true,
            castShadow: false
        };
    }
}

// Shadow map interface
interface ShadowMap {
    texture: Texture;
    size: number;
    viewMatrix: mat4;
    projectionMatrix: mat4;
    viewProjectionMatrix: mat4;
}

// Export factory function
export function createLightingSystem(): LightingSystem {
    return new LightingSystem();
}