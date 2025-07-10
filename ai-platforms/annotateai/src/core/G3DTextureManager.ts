/**
 * G3DTextureManager.ts
 * Advanced texture management and processing engine for G3D AnnotateAI
 */

import { ComputeShaders } from '../ai/G3DComputeShaders';

export interface Texture3D {
    id: string;
    name: string;
    width: number;
    height: number;
    depth?: number;
    format: TextureFormat;
    type: TextureType;
    data: ArrayBuffer;
    mipmaps: boolean;
    metadata: TextureMetadata;
}

export type TextureFormat = 'rgba8' | 'rgb8' | 'rg8' | 'r8' | 'rgba16f' | 'rgb16f' | 'rgba32f';
export type TextureType = '2d' | '3d' | 'cube' | 'array';

export interface TextureMetadata {
    compression: CompressionInfo;
    filtering: FilteringInfo;
    wrapping: WrappingInfo;
    quality: number;
    memoryUsage: number;
}

export interface CompressionInfo {
    algorithm: 'none' | 'dxt1' | 'dxt5' | 'bc7' | 'astc' | 'etc2';
    ratio: number;
    quality: number;
}

export interface FilteringInfo {
    minFilter: 'nearest' | 'linear' | 'nearest_mipmap' | 'linear_mipmap';
    magFilter: 'nearest' | 'linear';
    anisotropy: number;
}

export interface WrappingInfo {
    wrapS: 'repeat' | 'clamp' | 'mirror';
    wrapT: 'repeat' | 'clamp' | 'mirror';
    wrapR: 'repeat' | 'clamp' | 'mirror';
}

export interface TextureProcessingConfig {
    compression: CompressionConfig;
    filtering: FilteringConfig;
    generation: GenerationConfig;
    streaming: StreamingConfig;
    caching: CachingConfig;
}

export interface CompressionConfig {
    enabled: boolean;
    algorithm: 'dxt1' | 'dxt5' | 'bc7' | 'astc' | 'etc2';
    quality: number;
    adaptiveQuality: boolean;
}

export interface FilteringConfig {
    generateMipmaps: boolean;
    mipmapFilter: 'box' | 'triangle' | 'kaiser';
    anisotropicFiltering: boolean;
    maxAnisotropy: number;
}

export interface GenerationConfig {
    normalMaps: boolean;
    heightMaps: boolean;
    roughnessMaps: boolean;
    ambientOcclusion: boolean;
}

export interface StreamingConfig {
    enabled: boolean;
    chunkSize: number;
    prefetchDistance: number;
    compressionLevel: number;
}

export interface CachingConfig {
    enabled: boolean;
    maxSize: number;
    strategy: 'lru' | 'lfu' | 'adaptive';
    persistent: boolean;
}

export interface TextureAtlas {
    id: string;
    width: number;
    height: number;
    textures: AtlasEntry[];
    data: ArrayBuffer;
}

export interface AtlasEntry {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    uvTransform: [number, number, number, number];
}

export class TextureManager {
    private computeShaders: ComputeShaders;
    private textures: Map<string, Texture3D> = new Map();
    private atlases: Map<string, TextureAtlas> = new Map();
    private cache: Map<string, ArrayBuffer> = new Map();
    private config: TextureProcessingConfig;

    // Performance tracking
    private stats = {
        texturesLoaded: 0,
        memoryUsed: 0,
        compressionRatio: 0,
        cacheHits: 0,
        cacheMisses: 0
    };

    constructor(config?: Partial<TextureProcessingConfig>) {
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
        console.log('Initializing G3D Texture Manager...');
        await this.computeShaders.init();
        await this.createTextureKernels();
        console.log('G3D Texture Manager initialized successfully');
    }

    public async loadTexture(id: string, data: ArrayBuffer, metadata: Partial<TextureMetadata> = {}): Promise<Texture3D> {
        try {
            const textureInfo = this.analyzeTextureData(data);

            const texture: Texture3D = {
                id,
                name: metadata.quality?.toString() || id,
                width: textureInfo.width,
                height: textureInfo.height,
                depth: textureInfo.depth,
                format: textureInfo.format,
                type: textureInfo.type,
                data: data,
                mipmaps: this.config.filtering.generateMipmaps,
                metadata: {
                    compression: metadata.compression || { algorithm: 'none', ratio: 1.0, quality: 1.0 },
                    filtering: metadata.filtering || { minFilter: 'linear', magFilter: 'linear', anisotropy: 1.0 },
                    wrapping: metadata.wrapping || { wrapS: 'repeat', wrapT: 'repeat', wrapR: 'repeat' },
                    quality: metadata.quality || 1.0,
                    memoryUsage: data.byteLength
                }
            };

            // Process texture based on configuration
            const processedTexture = await this.processTexture(texture);

            this.textures.set(id, processedTexture);
            this.updateStats(processedTexture);

            console.log(`Loaded texture: ${id} (${texture.width}x${texture.height})`);
            return processedTexture;

        } catch (error) {
            console.error('Failed to load texture:', error);
            throw error;
        }
    }

    public async processTexture(texture: Texture3D): Promise<Texture3D> {
        let processedTexture = { ...texture };

        // Generate mipmaps if enabled
        if (this.config.filtering.generateMipmaps) {
            processedTexture = await this.generateMipmaps(processedTexture);
        }

        // Apply compression if enabled
        if (this.config.compression.enabled) {
            processedTexture = await this.compressTexture(processedTexture);
        }

        // Generate derived textures
        if (this.config.generation.normalMaps) {
            await this.generateNormalMap(processedTexture);
        }

        if (this.config.generation.roughnessMaps) {
            await this.generateRoughnessMap(processedTexture);
        }

        return processedTexture;
    }

    public async createTextureAtlas(textureIds: string[], atlasSize: number = 2048): Promise<TextureAtlas> {
        console.log(`Creating texture atlas from ${textureIds.length} textures...`);

        const textures = textureIds.map(id => this.textures.get(id)).filter(Boolean) as Texture3D[];

        if (textures.length === 0) {
            throw new Error('No valid textures found for atlas creation');
        }

        // Sort textures by size (largest first) for better packing
        textures.sort((a, b) => (b.width * b.height) - (a.width * a.height));

        const atlas: TextureAtlas = {
            id: `atlas_${Date.now()}`,
            width: atlasSize,
            height: atlasSize,
            textures: [],
            data: new ArrayBuffer(atlasSize * atlasSize * 4) // RGBA
        };

        // Simple bin packing algorithm
        let currentX = 0;
        let currentY = 0;
        let rowHeight = 0;

        for (const texture of textures) {
            // Check if texture fits in current row
            if (currentX + texture.width > atlasSize) {
                // Move to next row
                currentX = 0;
                currentY += rowHeight;
                rowHeight = 0;
            }

            // Check if texture fits in atlas
            if (currentY + texture.height > atlasSize) {
                console.warn(`Texture ${texture.id} doesn't fit in atlas, skipping`);
                continue;
            }

            // Add texture to atlas
            const entry: AtlasEntry = {
                id: texture.id,
                x: currentX,
                y: currentY,
                width: texture.width,
                height: texture.height,
                uvTransform: [
                    currentX / atlasSize,
                    currentY / atlasSize,
                    texture.width / atlasSize,
                    texture.height / atlasSize
                ]
            };

            atlas.textures.push(entry);

            // Copy texture data to atlas
            await this.copyTextureToAtlas(texture, atlas, entry);

            // Update position
            currentX += texture.width;
            rowHeight = Math.max(rowHeight, texture.height);
        }

        this.atlases.set(atlas.id, atlas);
        console.log(`Created texture atlas: ${atlas.id} with ${atlas.textures.length} textures`);

        return atlas;
    }

    public async streamTexture(id: string, level: number = 0): Promise<ArrayBuffer> {
        if (!this.config.streaming.enabled) {
            const texture = this.textures.get(id);
            return texture?.data || new ArrayBuffer(0);
        }

        // Check cache first
        const cacheKey = `${id}_${level}`;
        if (this.cache.has(cacheKey)) {
            this.stats.cacheHits++;
            return this.cache.get(cacheKey)!;
        }

        this.stats.cacheMisses++;

        // Load texture data (simplified - would normally stream from storage)
        const texture = this.textures.get(id);
        if (!texture) {
            throw new Error(`Texture not found: ${id}`);
        }

        // Generate mipmap level data
        const levelData = await this.generateMipmapLevel(texture, level);

        // Cache the result
        if (this.config.caching.enabled) {
            this.addToCache(cacheKey, levelData);
        }

        return levelData;
    }

    private async generateMipmaps(texture: Texture3D): Promise<Texture3D> {
        console.log(`Generating mipmaps for texture: ${texture.id}`);

        // Use GPU compute shader for mipmap generation
        await this.computeShaders.executeKernel(
            'generate_mipmaps',
            ['texture_data'],
            [Math.ceil(texture.width / 8), Math.ceil(texture.height / 8), 1]
        );

        return { ...texture, mipmaps: true };
    }

    private async compressTexture(texture: Texture3D): Promise<Texture3D> {
        console.log(`Compressing texture: ${texture.id} with ${this.config.compression.algorithm}`);

        // Apply texture compression based on algorithm
        const compressedData = await this.applyCompression(texture.data, this.config.compression);

        const compressedTexture = {
            ...texture,
            data: compressedData,
            metadata: {
                ...texture.metadata,
                compression: {
                    algorithm: this.config.compression.algorithm,
                    ratio: texture.data.byteLength / compressedData.byteLength,
                    quality: this.config.compression.quality
                },
                memoryUsage: compressedData.byteLength
            }
        };

        return compressedTexture;
    }

    private async generateNormalMap(texture: Texture3D): Promise<Texture3D> {
        console.log(`Generating normal map from: ${texture.id}`);

        // Use height information to generate normal map
        await this.computeShaders.executeKernel(
            'generate_normal_map',
            ['height_data', 'normal_data'],
            [Math.ceil(texture.width / 8), Math.ceil(texture.height / 8), 1]
        );

        // Create new normal map texture
        const normalMapId = `${texture.id}_normal`;
        const normalMapTexture: Texture3D = {
            ...texture,
            id: normalMapId,
            name: `${texture.name} Normal Map`,
            format: 'rgba8'
        };

        this.textures.set(normalMapId, normalMapTexture);
        return normalMapTexture;
    }

    private async generateRoughnessMap(texture: Texture3D): Promise<Texture3D> {
        console.log(`Generating roughness map from: ${texture.id}`);

        // Generate roughness from texture variation
        await this.computeShaders.executeKernel(
            'generate_roughness_map',
            ['texture_data', 'roughness_data'],
            [Math.ceil(texture.width / 8), Math.ceil(texture.height / 8), 1]
        );

        // Create new roughness map texture
        const roughnessMapId = `${texture.id}_roughness`;
        const roughnessMapTexture: Texture3D = {
            ...texture,
            id: roughnessMapId,
            name: `${texture.name} Roughness Map`,
            format: 'r8'
        };

        this.textures.set(roughnessMapId, roughnessMapTexture);
        return roughnessMapTexture;
    }

    private async copyTextureToAtlas(texture: Texture3D, atlas: TextureAtlas, entry: AtlasEntry): Promise<void> {
        // Copy texture data to atlas at specified position
        console.log(`Copying texture ${texture.id} to atlas at (${entry.x}, ${entry.y})`);

        // Implementation would copy pixel data from texture to atlas
        // This is a simplified placeholder
    }

    private async generateMipmapLevel(texture: Texture3D, level: number): Promise<ArrayBuffer> {
        const scale = Math.pow(2, level);
        const levelWidth = Math.max(1, Math.floor(texture.width / scale));
        const levelHeight = Math.max(1, Math.floor(texture.height / scale));

        // Generate downsampled texture data
        const levelSize = levelWidth * levelHeight * 4; // RGBA
        return new ArrayBuffer(levelSize);
    }

    private async applyCompression(data: ArrayBuffer, config: CompressionConfig): Promise<ArrayBuffer> {
        // Apply texture compression algorithm
        console.log(`Applying ${config.algorithm} compression...`);

        // Simplified compression - would use actual compression algorithms
        const compressionRatio = 0.5; // 50% compression
        const compressedSize = Math.floor(data.byteLength * compressionRatio);
        return new ArrayBuffer(compressedSize);
    }

    private analyzeTextureData(data: ArrayBuffer): { width: number; height: number; depth?: number; format: TextureFormat; type: TextureType } {
        // Analyze texture data to determine properties
        // This is a simplified implementation
        return {
            width: 512,
            height: 512,
            format: 'rgba8',
            type: '2d'
        };
    }

    private addToCache(key: string, data: ArrayBuffer): void {
        if (this.cache.size >= this.config.caching.maxSize) {
            // Remove oldest entry (LRU)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, data);
    }

    private updateStats(texture: Texture3D): void {
        this.stats.texturesLoaded++;
        this.stats.memoryUsed += texture.metadata.memoryUsage;

        if (texture.metadata.compression.algorithm !== 'none') {
            this.stats.compressionRatio = (this.stats.compressionRatio + texture.metadata.compression.ratio) / 2;
        }
    }

    private async createTextureKernels(): Promise<void> {
        try {
            // Mipmap generation kernel
            await this.computeShaders.createKernel(
                'generate_mipmaps',
                'Generate Texture Mipmaps',
                this.getMipmapShader(),
                [8, 8, 1]
            );

            // Normal map generation kernel
            await this.computeShaders.createKernel(
                'generate_normal_map',
                'Generate Normal Map',
                this.getNormalMapShader(),
                [8, 8, 1]
            );

            // Roughness map generation kernel
            await this.computeShaders.createKernel(
                'generate_roughness_map',
                'Generate Roughness Map',
                this.getRoughnessMapShader(),
                [8, 8, 1]
            );

            console.log('Texture processing kernels created');
        } catch (error) {
            console.warn('Failed to create some texture kernels:', error);
        }
    }

    private getMipmapShader(): string {
        return `
      #version 450
      layout(local_size_x = 8, local_size_y = 8, local_size_z = 1) in;
      
      layout(set = 0, binding = 0, rgba8) uniform image2D texture_data;
      
      void main() {
        ivec2 coord = ivec2(gl_GlobalInvocationID.xy);
        
        // Sample 2x2 area and average for mipmap
        vec4 color = vec4(0.0);
        for (int y = 0; y < 2; y++) {
          for (int x = 0; x < 2; x++) {
            color += imageLoad(texture_data, coord * 2 + ivec2(x, y));
          }
        }
        color /= 4.0;
        
        imageStore(texture_data, coord, color);
      }
    `;
    }

    private getNormalMapShader(): string {
        return `
      #version 450
      layout(local_size_x = 8, local_size_y = 8, local_size_z = 1) in;
      
      layout(set = 0, binding = 0, r8) uniform image2D height_data;
      layout(set = 0, binding = 1, rgba8) uniform image2D normal_data;
      
      void main() {
        ivec2 coord = ivec2(gl_GlobalInvocationID.xy);
        
        // Sample height values
        float h_left = imageLoad(height_data, coord + ivec2(-1, 0)).r;
        float h_right = imageLoad(height_data, coord + ivec2(1, 0)).r;
        float h_down = imageLoad(height_data, coord + ivec2(0, -1)).r;
        float h_up = imageLoad(height_data, coord + ivec2(0, 1)).r;
        
        // Calculate normal
        vec3 normal = normalize(vec3(h_left - h_right, h_down - h_up, 1.0));
        
        // Store as RGB normal map
        vec4 normalColor = vec4(normal * 0.5 + 0.5, 1.0);
        imageStore(normal_data, coord, normalColor);
      }
    `;
    }

    private getRoughnessMapShader(): string {
        return `
      #version 450
      layout(local_size_x = 8, local_size_y = 8, local_size_z = 1) in;
      
      layout(set = 0, binding = 0, rgba8) uniform image2D texture_data;
      layout(set = 0, binding = 1, r8) uniform image2D roughness_data;
      
      void main() {
        ivec2 coord = ivec2(gl_GlobalInvocationID.xy);
        
        // Calculate local variation as roughness
        vec4 center = imageLoad(texture_data, coord);
        float variation = 0.0;
        
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            if (x == 0 && y == 0) continue;
            vec4 neighbor = imageLoad(texture_data, coord + ivec2(x, y));
            variation += distance(center.rgb, neighbor.rgb);
          }
        }
        
        variation /= 8.0; // Average variation
        imageStore(roughness_data, coord, vec4(variation, 0, 0, 1));
      }
    `;
    }

    private createDefaultConfig(config?: Partial<TextureProcessingConfig>): TextureProcessingConfig {
        return {
            compression: {
                enabled: true,
                algorithm: 'bc7',
                quality: 0.8,
                adaptiveQuality: true
            },
            filtering: {
                generateMipmaps: true,
                mipmapFilter: 'kaiser',
                anisotropicFiltering: true,
                maxAnisotropy: 16
            },
            generation: {
                normalMaps: false,
                heightMaps: false,
                roughnessMaps: false,
                ambientOcclusion: false
            },
            streaming: {
                enabled: true,
                chunkSize: 256 * 256,
                prefetchDistance: 2,
                compressionLevel: 3
            },
            caching: {
                enabled: true,
                maxSize: 100,
                strategy: 'lru',
                persistent: false
            },
            ...config
        };
    }

    // Public API methods
    public getTexture(id: string): Texture3D | undefined {
        return this.textures.get(id);
    }

    public getAtlas(id: string): TextureAtlas | undefined {
        return this.atlases.get(id);
    }

    public listTextures(): string[] {
        return Array.from(this.textures.keys());
    }

    public getStats(): any {
        return { ...this.stats };
    }

    public updateConfig(config: Partial<TextureProcessingConfig>): void {
        this.config = { ...this.config, ...config };
    }

    public clearCache(): void {
        this.cache.clear();
        this.stats.cacheHits = 0;
        this.stats.cacheMisses = 0;
    }

    public dispose(): void {
        this.computeShaders.cleanup();
        this.textures.clear();
        this.atlases.clear();
        this.cache.clear();
        console.log('G3D Texture Manager disposed');
    }
}