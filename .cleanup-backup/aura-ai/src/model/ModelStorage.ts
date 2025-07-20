import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ModelConfig, ModelInfo } from './ModelDownloader';

/**
 * ModelStorage - Manages model storage, caching, and metadata with compilation fixes
 * Handles model indexing, search, versioning, and storage optimization
 */
export class ModelStorage {
    private readonly storagePath: string;
    private readonly metadataPath: string;
    private readonly context: vscode.ExtensionContext;
    private modelIndex: Map<string, StoredModel> = new Map();
    private readonly indexPath: string;
    private readonly maxCacheSize = 10 * 1024 * 1024 * 1024; // 10GB default
    private isInitialized = false;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.storagePath = path.join(context.globalStorageUri.fsPath, 'models');
        this.metadataPath = path.join(context.globalStorageUri.fsPath, 'metadata');
        this.indexPath = path.join(this.metadataPath, 'model-index.json');
        this.initializeStorage();
    }

    private async initializeStorage(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Ensure directories exist
            await fs.mkdir(this.storagePath, { recursive: true });
            await fs.mkdir(this.metadataPath, { recursive: true });

            // Load existing index
            await this.loadIndex();
            
            // Verify model integrity
            await this.verifyModels();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize model storage:', error);
            throw new Error(`Model storage initialization failed: ${error}`);
        }
    }

    private async loadIndex(): Promise<void> {
        try {
            const indexData = await fs.readFile(this.indexPath, 'utf-8');
            const indexObj = JSON.parse(indexData);
            
            this.modelIndex.clear();
            for (const [key, value] of Object.entries(indexObj)) {
                this.modelIndex.set(key, value as StoredModel);
            }
        } catch {
            // Index doesn't exist or is corrupted, start fresh
            this.modelIndex.clear();
            await this.rebuildIndex();
        }
    }

    private async saveIndex(): Promise<void> {
        try {
            const indexObj = Object.fromEntries(this.modelIndex);
            await fs.writeFile(this.indexPath, JSON.stringify(indexObj, null, 2), 'utf-8');
        } catch (error) {
            console.error('Failed to save model index:', error);
        }
    }

    private async rebuildIndex(): Promise<void> {
        try {
            const files = await fs.readdir(this.storagePath);
            this.modelIndex.clear();

            for (const file of files) {
                if (file.endsWith('.model')) {
                    const modelPath = path.join(this.storagePath, file);
                    const stats = await fs.stat(modelPath);
                    
                    // Parse filename to extract model info
                    const parts = file.replace('.model', '').split('-');
                    if (parts.length >= 2) {
                        const provider = parts[0];
                        const modelId = parts[1];
                        const version = parts.slice(2).join('-') || 'latest';
                        
                        const modelKey = this.getModelKey(provider, modelId, version);
                        const storedModel: StoredModel = {
                            provider,
                            modelId,
                            version,
                            filePath: modelPath,
                            size: stats.size,
                            createdAt: stats.birthtime,
                            lastAccessed: stats.atime,
                            checksum: await this.calculateChecksum(modelPath),
                            metadata: {}
                        };
                        
                        this.modelIndex.set(modelKey, storedModel);
                    }
                }
            }

            await this.saveIndex();
        } catch (error) {
            console.error('Failed to rebuild index:', error);
        }
    }

    /**
     * Store a model with metadata
     */
    public async storeModel(
        modelInfo: ModelInfo,
        config: ModelConfig,
        metadata: ModelMetadata = {}
    ): Promise<void> {
        await this.ensureInitialized();

        const modelKey = this.getModelKey(modelInfo.provider, modelInfo.modelId, modelInfo.version);
        
        // Ensure we don't exceed cache size
        await this.enforceStorageLimit();

        const storedModel: StoredModel = {
            provider: modelInfo.provider,
            modelId: modelInfo.modelId,
            version: modelInfo.version,
            filePath: modelInfo.path,
            size: modelInfo.size,
            createdAt: modelInfo.downloadDate,
            lastAccessed: new Date(),
            checksum: config.checksum || await this.calculateChecksum(modelInfo.path),
            metadata: {
                ...metadata,
                originalUrl: config.url,
                downloadConfig: config
            }
        };

        this.modelIndex.set(modelKey, storedModel);
        await this.saveIndex();
    }

    /**
     * Retrieve a model by provider, ID, and version
     */
    public async getModel(
        provider: string,
        modelId: string,
        version: string = 'latest'
    ): Promise<StoredModel | null> {
        await this.ensureInitialized();

        const modelKey = this.getModelKey(provider, modelId, version);
        const model = this.modelIndex.get(modelKey);

        if (model) {
            // Update last accessed time
            model.lastAccessed = new Date();
            await this.saveIndex();
            return model;
        }

        return null;
    }

    /**
     * Check if a model exists in storage
     */
    public async hasModel(
        provider: string,
        modelId: string,
        version: string = 'latest'
    ): Promise<boolean> {
        await this.ensureInitialized();
        
        const modelKey = this.getModelKey(provider, modelId, version);
        const model = this.modelIndex.get(modelKey);
        
        if (!model) return false;

        // Verify file still exists
        try {
            await fs.access(model.filePath);
            return true;
        } catch {
            // File was deleted externally, remove from index
            this.modelIndex.delete(modelKey);
            await this.saveIndex();
            return false;
        }
    }

    /**
     * List all stored models with filtering options
     */
    public async listModels(filter?: ModelFilter): Promise<StoredModel[]> {
        await this.ensureInitialized();

        let models = Array.from(this.modelIndex.values());

        if (filter) {
            if (filter.provider) {
                models = models.filter(m => m.provider === filter.provider);
            }
            if (filter.modelId) {
                models = models.filter(m => m.modelId.includes(filter.modelId!));
            }
            if (filter.version) {
                models = models.filter(m => m.version === filter.version);
            }
            if (filter.sizeRange) {
                models = models.filter(m => 
                    m.size >= (filter.sizeRange!.min || 0) &&
                    m.size <= (filter.sizeRange!.max || Infinity)
                );
            }
        }

        // Sort by last accessed (most recent first)
        return models.sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());
    }

    /**
     * Delete a model from storage
     */
    public async deleteModel(
        provider: string,
        modelId: string,
        version: string = 'latest'
    ): Promise<boolean> {
        await this.ensureInitialized();

        const modelKey = this.getModelKey(provider, modelId, version);
        const model = this.modelIndex.get(modelKey);

        if (!model) return false;

        try {
            // Delete the file
            await fs.unlink(model.filePath);
            
            // Remove from index
            this.modelIndex.delete(modelKey);
            await this.saveIndex();
            
            return true;
        } catch (error) {
            console.error('Failed to delete model:', error);
            return false;
        }
    }

    /**
     * Update model metadata
     */
    public async updateMetadata(
        provider: string,
        modelId: string,
        version: string,
        metadata: Partial<ModelMetadata>
    ): Promise<boolean> {
        await this.ensureInitialized();

        const modelKey = this.getModelKey(provider, modelId, version);
        const model = this.modelIndex.get(modelKey);

        if (!model) return false;

        model.metadata = { ...model.metadata, ...metadata };
        model.lastAccessed = new Date();
        
        await this.saveIndex();
        return true;
    }

    /**
     * Get storage statistics
     */
    public async getStorageStats(): Promise<StorageStats> {
        await this.ensureInitialized();

        const models = Array.from(this.modelIndex.values());
        const totalSize = models.reduce((sum, model) => sum + model.size, 0);
        const modelCount = models.length;
        
        const providerStats = new Map<string, number>();
        for (const model of models) {
            providerStats.set(model.provider, (providerStats.get(model.provider) || 0) + 1);
        }

        return {
            totalModels: modelCount,
            totalSize,
            availableSpace: this.maxCacheSize - totalSize,
            providerBreakdown: Object.fromEntries(providerStats),
            oldestModel: models.reduce((oldest, model) => 
                !oldest || model.lastAccessed < oldest.lastAccessed ? model : oldest
            , null as StoredModel | null),
            newestModel: models.reduce((newest, model) => 
                !newest || model.lastAccessed > newest.lastAccessed ? model : newest
            , null as StoredModel | null)
        };
    }

    /**
     * Clean up old or unused models based on LRU policy
     */
    public async cleanup(targetSizeBytes?: number): Promise<number> {
        await this.ensureInitialized();

        const target = targetSizeBytes || this.maxCacheSize * 0.8; // 80% of max size
        const models = Array.from(this.modelIndex.values());
        const currentSize = models.reduce((sum, model) => sum + model.size, 0);

        if (currentSize <= target) return 0;

        // Sort by last accessed (oldest first)
        const sortedModels = models.sort((a, b) => a.lastAccessed.getTime() - b.lastAccessed.getTime());
        
        let freedSpace = 0;
        let deletedCount = 0;

        for (const model of sortedModels) {
            if (currentSize - freedSpace <= target) break;

            try {
                await this.deleteModel(model.provider, model.modelId, model.version);
                freedSpace += model.size;
                deletedCount++;
            } catch (error) {
                console.error('Failed to delete model during cleanup:', error);
            }
        }

        return deletedCount;
    }

    /**
     * Verify integrity of all stored models
     */
    public async verifyModels(): Promise<ModelVerificationResult[]> {
        await this.ensureInitialized();

        const results: ModelVerificationResult[] = [];
        
        for (const [key, model] of this.modelIndex) {
            const result: ModelVerificationResult = {
                modelKey: key,
                provider: model.provider,
                modelId: model.modelId,
                version: model.version,
                exists: false,
                checksumValid: false,
                size: 0
            };

            try {
                // Check if file exists
                const stats = await fs.stat(model.filePath);
                result.exists = true;
                result.size = stats.size;

                // Update size if different
                if (stats.size !== model.size) {
                    model.size = stats.size;
                }

                // Verify checksum if available
                if (model.checksum) {
                    const actualChecksum = await this.calculateChecksum(model.filePath);
                    result.checksumValid = actualChecksum === model.checksum;
                }

            } catch {
                // File doesn't exist, remove from index
                this.modelIndex.delete(key);
            }

            results.push(result);
        }

        await this.saveIndex();
        return results;
    }

    private async enforceStorageLimit(): Promise<void> {
        const stats = await this.getStorageStats();
        if (stats.totalSize > this.maxCacheSize) {
            await this.cleanup();
        }
    }

    private getModelKey(provider: string, modelId: string, version: string): string {
        return `${provider}:${modelId}:${version}`;
    }

    private async calculateChecksum(filePath: string): Promise<string> {
        try {
            const { createHash } = await import('crypto');
            const { createReadStream } = await import('fs');
            const { pipeline } = await import('stream/promises');

            const hash = createHash('sha256');
            const stream = createReadStream(filePath);
            await pipeline(stream, hash);
            return hash.digest('hex');
        } catch {
            return '';
        }
    }

    private async ensureInitialized(): Promise<void> {
        if (!this.isInitialized) {
            await this.initializeStorage();
        }
    }

    /**
     * Export model metadata for backup
     */
    public async exportMetadata(): Promise<string> {
        await this.ensureInitialized();
        return JSON.stringify(Object.fromEntries(this.modelIndex), null, 2);
    }

    /**
     * Import model metadata from backup
     */
    public async importMetadata(metadataJson: string): Promise<void> {
        try {
            const imported = JSON.parse(metadataJson);
            this.modelIndex.clear();
            
            for (const [key, value] of Object.entries(imported)) {
                this.modelIndex.set(key, value as StoredModel);
            }
            
            await this.saveIndex();
        } catch (error) {
            throw new Error(`Failed to import metadata: ${error}`);
        }
    }

    public dispose(): void {
        // Save final state
        this.saveIndex().catch(console.error);
    }
}

// Type definitions
export interface StoredModel {
    provider: string;
    modelId: string;
    version: string;
    filePath: string;
    size: number;
    createdAt: Date;
    lastAccessed: Date;
    checksum?: string;
    metadata: ModelMetadata;
}

export interface ModelMetadata {
    description?: string;
    tags?: string[];
    capabilities?: string[];
    performanceMetrics?: {
        tokensPerSecond?: number;
        memoryUsage?: number;
        accuracy?: number;
    };
    requirements?: {
        minMemory?: number;
        gpuRequired?: boolean;
        architectures?: string[];
    };
    originalUrl?: string;
    downloadConfig?: ModelConfig;
    [key: string]: any;
}

export interface ModelFilter {
    provider?: string;
    modelId?: string;
    version?: string;
    tags?: string[];
    sizeRange?: {
        min?: number;
        max?: number;
    };
}

export interface StorageStats {
    totalModels: number;
    totalSize: number;
    availableSpace: number;
    providerBreakdown: Record<string, number>;
    oldestModel: StoredModel | null;
    newestModel: StoredModel | null;
}

export interface ModelVerificationResult {
    modelKey: string;
    provider: string;
    modelId: string;
    version: string;
    exists: boolean;
    checksumValid: boolean;
    size: number;
    error?: string;
} 