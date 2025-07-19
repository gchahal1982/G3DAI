/**
 * Aura Model Loader
 * Handles secure model downloading, verification, and caching
 *
 * Features:
 * - SHA-256 verification for all model downloads
 * - Intelligent caching with version management
 * - Download resumption for interrupted transfers
 * - Progressive download with streaming
 * - Bandwidth optimization and throttling
 * - Integrity checking and corruption detection
 * - Automatic retry with exponential backoff
 * - Memory-efficient streaming decompression
 */
import { EventEmitter } from 'events';
interface ModelDescriptor {
    id: string;
    name: string;
    version: string;
    type: 'local' | 'cloud';
    format: 'gguf' | 'onnx' | 'tensorrt' | 'safetensors';
    size: number;
    sha256: string;
    downloadUrl: string;
    mirrorUrls?: string[];
    dependencies?: string[];
    metadata: ModelMetadata;
}
interface ModelMetadata {
    architecture: string;
    parameters: number;
    contextLength: number;
    quantization?: string;
    license: string;
    description: string;
    tags: string[];
    capabilities: string[];
    benchmarks?: Record<string, number>;
}
interface DownloadProgress {
    modelId: string;
    bytesLoaded: number;
    bytesTotal: number;
    percentage: number;
    speed: number;
    timeRemaining: number;
    chunks: DownloadChunk[];
}
interface DownloadChunk {
    index: number;
    start: number;
    end: number;
    status: 'pending' | 'downloading' | 'completed' | 'failed';
    attempts: number;
    bytesLoaded: number;
}
interface CacheEntry {
    modelId: string;
    version: string;
    filePath: string;
    size: number;
    sha256: string;
    downloadedAt: number;
    lastAccessed: number;
    verified: boolean;
}
interface LoaderConfig {
    cacheDirectory: string;
    maxCacheSize: number;
    maxConcurrentDownloads: number;
    chunkSize: number;
    maxRetries: number;
    retryDelay: number;
    bandwidthLimit?: number;
    verifyIntegrity: boolean;
    enableResumption: boolean;
}
export declare class ModelLoader extends EventEmitter {
    private config;
    private cache;
    private activeDownloads;
    private downloadQueue;
    private isProcessingQueue;
    constructor(config?: Partial<LoaderConfig>);
    private initializeLoader;
    loadModel(modelId: string): Promise<string>;
    downloadModel(descriptor: ModelDescriptor): Promise<string>;
    private performDownload;
    private createDownloadChunks;
    private downloadChunks;
    private downloadChunkWorker;
    private downloadChunk;
    private writeChunkToFile;
    private updateDownloadProgress;
    private applyBandwidthLimit;
    private verifyModelIntegrity;
    private calculateSHA256;
    private loadCacheIndex;
    private addToCache;
    private evictOldCacheEntries;
    private verifyCachedModels;
    private startQueueProcessor;
    private processDownloadQueue;
    private getModelDescriptor;
    private generateFilePath;
    private ensureCacheDirectory;
    private getPartialDownloadSize;
    private writeChunkDataToFile;
    private moveFile;
    private removeFile;
    private saveCacheIndex;
    queueDownload(modelId: string): void;
    cancelDownload(modelId: string): void;
    getCacheStatus(): {
        totalSize: number;
        entryCount: number;
        entries: CacheEntry[];
    };
    getDownloadStatus(): {
        active: string[];
        queued: string[];
    };
    clearCache(): Promise<void>;
    updateConfig(config: Partial<LoaderConfig>): void;
    destroy(): void;
}
export declare const modelLoader: ModelLoader;
export type { ModelDescriptor, ModelMetadata, DownloadProgress, CacheEntry, LoaderConfig };
export default ModelLoader;
//# sourceMappingURL=ModelLoader.d.ts.map