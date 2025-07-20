import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { createWriteStream, createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createHash } from 'crypto';

/**
 * ModelDownloader - Downloads and manages AI models with Node.js compatibility
 * Handles model downloading, caching, integrity verification, and progress tracking
 */
export class ModelDownloader {
    private readonly downloadPath: string;
    private readonly context: vscode.ExtensionContext;
    private activeDownloads = new Map<string, DownloadTask>();
    private maxConcurrentDownloads = 3;
    private retryAttempts = 3;
    private chunkSize = 1024 * 1024; // 1MB chunks

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.downloadPath = path.join(context.globalStorageUri.fsPath, 'models');
        this.ensureDownloadDirectory();
    }

    private async ensureDownloadDirectory(): Promise<void> {
        try {
            await fs.access(this.downloadPath);
        } catch {
            await fs.mkdir(this.downloadPath, { recursive: true });
        }
    }

    /**
     * Download a model with progress tracking and resume capability
     */
    public async downloadModel(
        modelConfig: ModelConfig,
        onProgress?: (progress: DownloadProgress) => void
    ): Promise<string> {
        const taskId = `${modelConfig.provider}-${modelConfig.modelId}`;
        
        if (this.activeDownloads.has(taskId)) {
            throw new Error(`Model ${taskId} is already being downloaded`);
        }

        // Check if model already exists and is valid
        const localPath = await this.getModelPath(modelConfig);
        if (await this.isModelValid(localPath, modelConfig.checksum)) {
            return localPath;
        }

        // Create download task
        const task: DownloadTask = {
            id: taskId,
            config: modelConfig,
            progress: {
                downloaded: 0,
                total: modelConfig.size || 0,
                percentage: 0,
                speed: 0,
                eta: 0,
                status: 'downloading'
            },
            startTime: Date.now(),
            onProgress
        };

        this.activeDownloads.set(taskId, task);

        try {
            const result = await this.performDownload(task);
            this.activeDownloads.delete(taskId);
            return result;
        } catch (error) {
            this.activeDownloads.delete(taskId);
            throw error;
        }
    }

    private async performDownload(task: DownloadTask): Promise<string> {
        const { config } = task;
        const tempPath = `${await this.getModelPath(config)}.tmp`;
        const localPath = await this.getModelPath(config);

        // Check for partial download and resume if possible
        let resumePosition = 0;
        try {
            const stats = await fs.stat(tempPath);
            resumePosition = stats.size;
            task.progress.downloaded = resumePosition;
        } catch {
            // No partial download exists
        }

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                await this.downloadWithResume(task, tempPath, resumePosition);
                
                // Verify download integrity
                if (config.checksum && !(await this.verifyChecksum(tempPath, config.checksum))) {
                    throw new Error('Download integrity check failed');
                }

                // Move temp file to final location
                await fs.rename(tempPath, localPath);
                
                task.progress.status = 'completed';
                task.onProgress?.(task.progress);
                
                return localPath;
            } catch (error) {
                if (attempt === this.retryAttempts) {
                    task.progress.status = 'failed';
                    task.onProgress?.(task.progress);
                    throw error;
                }
                
                // Wait before retry
                await this.delay(1000 * attempt);
                resumePosition = 0; // Reset on retry
            }
        }

        throw new Error('Download failed after all retry attempts');
    }

    private async downloadWithResume(
        task: DownloadTask,
        tempPath: string,
        resumePosition: number
    ): Promise<void> {
        const { config } = task;
        
        return new Promise((resolve, reject) => {
            const headers: Record<string, string> = {
                'User-Agent': 'Aura-AI-IDE/1.0.0'
            };

            if (resumePosition > 0) {
                headers['Range'] = `bytes=${resumePosition}-`;
            }

            const requestModule = config.url.startsWith('https:') ? https : http;
            
            const request = requestModule.get(config.url, { headers }, (response) => {
                if (response.statusCode && response.statusCode >= 400) {
                    reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                    return;
                }

                // Handle redirects
                if (response.statusCode === 301 || response.statusCode === 302) {
                    if (response.headers.location) {
                        config.url = response.headers.location;
                        this.downloadWithResume(task, tempPath, resumePosition)
                            .then(resolve)
                            .catch(reject);
                        return;
                    }
                }

                const totalSize = resumePosition + parseInt(response.headers['content-length'] || '0', 10);
                task.progress.total = totalSize;

                const writeStream = createWriteStream(tempPath, { 
                    flags: resumePosition > 0 ? 'a' : 'w' 
                });

                let lastUpdateTime = Date.now();
                let lastDownloaded = task.progress.downloaded;

                response.on('data', (chunk: Buffer) => {
                    task.progress.downloaded += chunk.length;
                    
                    const now = Date.now();
                    if (now - lastUpdateTime > 1000) { // Update every second
                        const timeDiff = (now - lastUpdateTime) / 1000;
                        const bytesDiff = task.progress.downloaded - lastDownloaded;
                        
                        task.progress.speed = bytesDiff / timeDiff;
                        task.progress.percentage = (task.progress.downloaded / task.progress.total) * 100;
                        
                        if (task.progress.speed > 0) {
                            const remaining = task.progress.total - task.progress.downloaded;
                            task.progress.eta = remaining / task.progress.speed;
                        }
                        
                        task.onProgress?.(task.progress);
                        
                        lastUpdateTime = now;
                        lastDownloaded = task.progress.downloaded;
                    }
                });

                response.on('error', reject);
                writeStream.on('error', reject);
                writeStream.on('finish', resolve);

                response.pipe(writeStream);
            });

            request.on('error', reject);
            request.setTimeout(30000, () => {
                request.destroy();
                reject(new Error('Download timeout'));
            });
        });
    }

    private async verifyChecksum(filePath: string, expectedChecksum: string): Promise<boolean> {
        try {
            const hash = createHash('sha256');
            const stream = createReadStream(filePath);
            
            await pipeline(stream, hash);
            
            const actualChecksum = hash.digest('hex');
            return actualChecksum === expectedChecksum;
        } catch {
            return false;
        }
    }

    private async isModelValid(modelPath: string, checksum?: string): Promise<boolean> {
        try {
            await fs.access(modelPath);
            
            if (checksum) {
                return await this.verifyChecksum(modelPath, checksum);
            }
            
            return true;
        } catch {
            return false;
        }
    }

    private async getModelPath(config: ModelConfig): Promise<string> {
        const filename = `${config.provider}-${config.modelId}-${config.version || 'latest'}.model`;
        return path.join(this.downloadPath, filename);
    }

    /**
     * Get download progress for a specific model
     */
    public getDownloadProgress(modelId: string): DownloadProgress | null {
        const task = this.activeDownloads.get(modelId);
        return task?.progress || null;
    }

    /**
     * Cancel an active download
     */
    public cancelDownload(modelId: string): boolean {
        const task = this.activeDownloads.get(modelId);
        if (task) {
            task.progress.status = 'cancelled';
            this.activeDownloads.delete(modelId);
            return true;
        }
        return false;
    }

    /**
     * List all downloaded models
     */
    public async listDownloadedModels(): Promise<ModelInfo[]> {
        try {
            const files = await fs.readdir(this.downloadPath);
            const models: ModelInfo[] = [];

            for (const file of files) {
                if (file.endsWith('.model')) {
                    const filePath = path.join(this.downloadPath, file);
                    const stats = await fs.stat(filePath);
                    
                    const [provider, modelId, version] = file.replace('.model', '').split('-');
                    
                    models.push({
                        provider,
                        modelId,
                        version: version || 'latest',
                        size: stats.size,
                        downloadDate: stats.mtime,
                        path: filePath
                    });
                }
            }

            return models;
        } catch {
            return [];
        }
    }

    /**
     * Delete a downloaded model
     */
    public async deleteModel(provider: string, modelId: string, version?: string): Promise<boolean> {
        try {
            const filename = `${provider}-${modelId}-${version || 'latest'}.model`;
            const filePath = path.join(this.downloadPath, filename);
            await fs.unlink(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get total size of downloaded models
     */
    public async getTotalSize(): Promise<number> {
        try {
            const files = await fs.readdir(this.downloadPath);
            let totalSize = 0;

            for (const file of files) {
                if (file.endsWith('.model')) {
                    const stats = await fs.stat(path.join(this.downloadPath, file));
                    totalSize += stats.size;
                }
            }

            return totalSize;
        } catch {
            return 0;
        }
    }

    /**
     * Clean up old or corrupted downloads
     */
    public async cleanup(): Promise<void> {
        try {
            const files = await fs.readdir(this.downloadPath);
            
            for (const file of files) {
                const filePath = path.join(this.downloadPath, file);
                
                // Remove temporary files
                if (file.endsWith('.tmp')) {
                    await fs.unlink(filePath);
                    continue;
                }
                
                // Check for corrupted files (size 0)
                if (file.endsWith('.model')) {
                    const stats = await fs.stat(filePath);
                    if (stats.size === 0) {
                        await fs.unlink(filePath);
                    }
                }
            }
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public dispose(): void {
        // Cancel all active downloads
        for (const [taskId] of this.activeDownloads) {
            this.cancelDownload(taskId);
        }
    }
}

// Type definitions
export interface ModelConfig {
    provider: string;
    modelId: string;
    version?: string;
    url: string;
    size?: number;
    checksum?: string;
    metadata?: Record<string, any>;
}

export interface DownloadProgress {
    downloaded: number;
    total: number;
    percentage: number;
    speed: number; // bytes per second
    eta: number; // seconds
    status: 'downloading' | 'completed' | 'failed' | 'cancelled' | 'paused';
}

export interface DownloadTask {
    id: string;
    config: ModelConfig;
    progress: DownloadProgress;
    startTime: number;
    onProgress?: (progress: DownloadProgress) => void;
}

export interface ModelInfo {
    provider: string;
    modelId: string;
    version: string;
    size: number;
    downloadDate: Date;
    path: string;
} 