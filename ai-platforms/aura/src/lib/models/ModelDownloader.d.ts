/**
 * ModelDownloader.ts - Download orchestration for Aura local models
 *
 * Handles downloading, verification, and management of GGUF models from Hugging Face
 * Supports all 7 local model families with chunked downloads, resume capability,
 * and intelligent storage management for 110GB+ total storage requirements.
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
export interface ModelVariant {
    id: string;
    name: string;
    family: string;
    size: string;
    parameters: string;
    downloadSize: number;
    vramRequired: number;
    systemRamRequired: number;
    huggingFaceRepo: string;
    filename: string;
    sha256: string;
    useCase: string;
    priority: 'auto-install' | 'optional' | 'workstation-only';
}
export declare const LOCAL_MODELS: ModelVariant[];
export interface DownloadProgress {
    modelId: string;
    status: 'queued' | 'downloading' | 'verifying' | 'complete' | 'error' | 'paused';
    bytesDownloaded: number;
    totalBytes: number;
    percentage: number;
    speed: number;
    eta: number;
    error?: string;
}
export interface DownloadOptions {
    maxConcurrentDownloads: number;
    chunkSize: number;
    maxRetries: number;
    bandwidthLimit?: number;
    priority: ('auto-install' | 'optional' | 'workstation-only')[];
}
export declare class ModelDownloader extends EventEmitter {
    private readonly modelsDir;
    private readonly tempDir;
    private downloadQueue;
    private activeDownloads;
    private downloadProgress;
    private options;
    constructor(modelsDir: string, options?: Partial<DownloadOptions>);
    private ensureDirectories;
    /**
     * Get all available models
     */
    getAvailableModels(): ModelVariant[];
    /**
     * Get models by priority
     */
    getModelsByPriority(priority: string): ModelVariant[];
    /**
     * Check if model is downloaded
     */
    isModelDownloaded(modelId: string): Promise<boolean>;
    /**
     * Get downloaded models
     */
    getDownloadedModels(): Promise<ModelVariant[]>;
    /**
     * Get total storage used by downloaded models
     */
    getStorageUsed(): Promise<number>;
    /**
     * Queue model for download
     */
    queueDownload(modelId: string): Promise<void>;
    /**
     * Start downloading all auto-install models
     */
    downloadAutoInstallModels(): Promise<void>;
    /**
     * Process download queue
     */
    private processQueue;
    /**
     * Start downloading a specific model
     */
    private startDownload;
    /**
     * Download model from Hugging Face
     */
    private downloadModel;
    /**
     * Verify downloaded model integrity
     */
    private verifyModel;
    /**
     * Cancel download
     */
    cancelDownload(modelId: string): Promise<void>;
    /**
     * Delete downloaded model
     */
    deleteModel(modelId: string): Promise<void>;
    /**
     * Get download progress for a model
     */
    getDownloadProgress(modelId: string): DownloadProgress | undefined;
    /**
     * Get all download progress
     */
    getAllDownloadProgress(): Map<string, DownloadProgress>;
    /**
     * Cleanup temporary files
     */
    cleanup(): Promise<void>;
}
export declare const modelDownloader: ModelDownloader;
export default ModelDownloader;
//# sourceMappingURL=ModelDownloader.d.ts.map