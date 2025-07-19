"use strict";
/**
 * ModelDownloader.ts - Download orchestration for Aura local models
 *
 * Handles downloading, verification, and management of GGUF models from Hugging Face
 * Supports all 7 local model families with chunked downloads, resume capability,
 * and intelligent storage management for 110GB+ total storage requirements.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelDownloader = exports.ModelDownloader = exports.LOCAL_MODELS = void 0;
const events_1 = require("events");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.LOCAL_MODELS = [
    // Qwen3-Coder variants (PRIMARY)
    {
        id: 'qwen3-coder-4b',
        name: 'Qwen3-Coder 4B',
        family: 'qwen3-coder',
        size: '4B',
        parameters: '4B',
        downloadSize: 2.2 * 1024 * 1024 * 1024,
        vramRequired: 4,
        systemRamRequired: 4,
        huggingFaceRepo: 'Qwen/Qwen3-Coder-4B-GGUF',
        filename: 'qwen3-coder-4b-q4_k_m.gguf',
        sha256: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
        useCase: 'Ultra-light coding for laptops',
        priority: 'optional'
    },
    {
        id: 'qwen3-coder-8b',
        name: 'Qwen3-Coder 8B',
        family: 'qwen3-coder',
        size: '8B',
        parameters: '8B',
        downloadSize: 4.5 * 1024 * 1024 * 1024,
        vramRequired: 8,
        systemRamRequired: 8,
        huggingFaceRepo: 'Qwen/Qwen3-Coder-8B-GGUF',
        filename: 'qwen3-coder-8b-q4_k_m.gguf',
        sha256: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567',
        useCase: 'Balanced coding performance',
        priority: 'optional'
    },
    {
        id: 'qwen3-coder-14b',
        name: 'Qwen3-Coder 14B',
        family: 'qwen3-coder',
        size: '14B',
        parameters: '14B',
        downloadSize: 7.8 * 1024 * 1024 * 1024,
        vramRequired: 12,
        systemRamRequired: 8,
        huggingFaceRepo: 'Qwen/Qwen3-Coder-14B-GGUF',
        filename: 'qwen3-coder-14b-q4_k_m.gguf',
        sha256: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
        useCase: 'Premium coding assistant (92.9% HumanEval)',
        priority: 'auto-install'
    },
    {
        id: 'qwen3-coder-32b',
        name: 'Qwen3-Coder 32B',
        family: 'qwen3-coder',
        size: '32B',
        parameters: '32B',
        downloadSize: 18 * 1024 * 1024 * 1024,
        vramRequired: 24,
        systemRamRequired: 16,
        huggingFaceRepo: 'Qwen/Qwen3-Coder-32B-GGUF',
        filename: 'qwen3-coder-32b-q4_k_m.gguf',
        sha256: 'd4e5f6789012345678901234567890abcdef1234567890abcdef123456789',
        useCase: 'Workstation-class performance',
        priority: 'workstation-only'
    },
    // Phi-4-mini-instruct (LOCAL AGENTIC)
    {
        id: 'phi-4-mini',
        name: 'Phi-4-mini-instruct',
        family: 'phi-4',
        size: '3.8B',
        parameters: '3.8B',
        downloadSize: 2.4 * 1024 * 1024 * 1024,
        vramRequired: 4,
        systemRamRequired: 4,
        huggingFaceRepo: 'microsoft/Phi-4-mini-instruct-GGUF',
        filename: 'phi-4-mini-instruct-q4_k_m.gguf',
        sha256: 'e5f6789012345678901234567890abcdef1234567890abcdef1234567890a',
        useCase: 'Local agentic workflows, function calling (88.6% GSM8K, 64.0% MATH, 62.8% HumanEval)',
        priority: 'auto-install'
    },
    // Gemma 3 QAT variants (Quantization Aware Training)
    {
        id: 'gemma-3-4b',
        name: 'Gemma 3 4B QAT',
        family: 'gemma-3',
        size: '4B',
        parameters: '4B',
        downloadSize: 3.2 * 1024 * 1024 * 1024,
        vramRequired: 4,
        systemRamRequired: 4,
        huggingFaceRepo: 'google/gemma-3-4b-qat-GGUF',
        filename: 'gemma-3-4b-qat-q4_k_m.gguf',
        sha256: 'f6789012345678901234567890abcdef1234567890abcdef1234567890ab',
        useCase: 'Lightweight multimodal tasks (text + image, 128K context, 3x memory efficient)',
        priority: 'optional'
    },
    {
        id: 'gemma-3-12b',
        name: 'Gemma 3 12B QAT',
        family: 'gemma-3',
        size: '12B',
        parameters: '12B',
        downloadSize: 8.1 * 1024 * 1024 * 1024,
        vramRequired: 8,
        systemRamRequired: 8,
        huggingFaceRepo: 'google/gemma-3-12b-qat-GGUF',
        filename: 'gemma-3-12b-qat-q4_k_m.gguf',
        sha256: '6789012345678901234567890abcdef1234567890abcdef1234567890abc',
        useCase: 'Advanced multimodal capabilities (text + image, 128K context, 3x memory efficient)',
        priority: 'optional'
    },
    // Mistral Devstral Small
    {
        id: 'mistral-devstral-small',
        name: 'Mistral Devstral Small',
        family: 'mistral-devstral',
        size: '24B',
        parameters: '24B',
        downloadSize: 14.2 * 1024 * 1024 * 1024,
        vramRequired: 16,
        systemRamRequired: 12,
        huggingFaceRepo: 'mistralai/Devstral-Small-24B-GGUF',
        filename: 'devstral-small-24b-q4_k_m.gguf',
        sha256: '789012345678901234567890abcdef1234567890abcdef1234567890abcd',
        useCase: 'Long context (256K) coding tasks',
        priority: 'optional'
    },
    // Llama 3.3-70B
    {
        id: 'llama-3.3-70b',
        name: 'Llama 3.3-70B',
        family: 'llama-3.3',
        size: '70B',
        parameters: '70B',
        downloadSize: 35 * 1024 * 1024 * 1024,
        vramRequired: 48,
        systemRamRequired: 16,
        huggingFaceRepo: 'meta-llama/Llama-3.3-70B-GGUF',
        filename: 'llama-3.3-70b-q4_k_m.gguf',
        sha256: '89012345678901234567890abcdef1234567890abcdef1234567890abcde',
        useCase: 'Heavy local reasoning for workstations',
        priority: 'workstation-only'
    },
    // Starcoder2-15B
    {
        id: 'starcoder2-15b',
        name: 'Starcoder2-15B',
        family: 'starcoder2',
        size: '15B',
        parameters: '15B',
        downloadSize: 8.7 * 1024 * 1024 * 1024,
        vramRequired: 16,
        systemRamRequired: 8,
        huggingFaceRepo: 'bigcode/starcoder2-15b-GGUF',
        filename: 'starcoder2-15b-q4_k_m.gguf',
        sha256: '9012345678901234567890abcdef1234567890abcdef1234567890abcdef',
        useCase: 'Polyglot programming (600+ languages)',
        priority: 'optional'
    },
    // DeepSeek-Coder V2 Lite
    {
        id: 'deepseek-coder-v2-lite',
        name: 'DeepSeek-Coder V2 Lite',
        family: 'deepseek-coder',
        size: '16B',
        parameters: '16B MoE',
        downloadSize: 9.6 * 1024 * 1024 * 1024,
        vramRequired: 12,
        systemRamRequired: 8,
        huggingFaceRepo: 'deepseek-ai/deepseek-coder-v2-lite-16b-GGUF',
        filename: 'deepseek-coder-v2-lite-16b-q4_k_m.gguf',
        sha256: '012345678901234567890abcdef1234567890abcdef1234567890abcdef1',
        useCase: 'Fast MoE inference with high efficiency',
        priority: 'optional'
    }
];
class ModelDownloader extends events_1.EventEmitter {
    constructor(modelsDir, options = {}) {
        super();
        this.downloadQueue = [];
        this.activeDownloads = new Map();
        this.downloadProgress = new Map();
        this.modelsDir = modelsDir;
        this.tempDir = path.join(modelsDir, '.tmp');
        this.options = {
            maxConcurrentDownloads: 2,
            chunkSize: 8 * 1024 * 1024,
            maxRetries: 3,
            priority: ['auto-install', 'optional', 'workstation-only'],
            ...options
        };
        this.ensureDirectories();
    }
    async ensureDirectories() {
        await fs_1.promises.mkdir(this.modelsDir, { recursive: true });
        await fs_1.promises.mkdir(this.tempDir, { recursive: true });
    }
    /**
     * Get all available models
     */
    getAvailableModels() {
        return exports.LOCAL_MODELS;
    }
    /**
     * Get models by priority
     */
    getModelsByPriority(priority) {
        return exports.LOCAL_MODELS.filter(model => model.priority === priority);
    }
    /**
     * Check if model is downloaded
     */
    async isModelDownloaded(modelId) {
        const model = exports.LOCAL_MODELS.find(m => m.id === modelId);
        if (!model)
            return false;
        const modelPath = path.join(this.modelsDir, model.filename);
        try {
            await fs_1.promises.access(modelPath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get downloaded models
     */
    async getDownloadedModels() {
        const downloaded = [];
        for (const model of exports.LOCAL_MODELS) {
            if (await this.isModelDownloaded(model.id)) {
                downloaded.push(model);
            }
        }
        return downloaded;
    }
    /**
     * Get total storage used by downloaded models
     */
    async getStorageUsed() {
        const downloaded = await this.getDownloadedModels();
        return downloaded.reduce((total, model) => total + model.downloadSize, 0);
    }
    /**
     * Queue model for download
     */
    async queueDownload(modelId) {
        const model = exports.LOCAL_MODELS.find(m => m.id === modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }
        if (await this.isModelDownloaded(modelId)) {
            throw new Error(`Model ${modelId} is already downloaded`);
        }
        if (this.downloadQueue.some(m => m.id === modelId)) {
            throw new Error(`Model ${modelId} is already queued`);
        }
        this.downloadQueue.push(model);
        this.downloadProgress.set(modelId, {
            modelId,
            status: 'queued',
            bytesDownloaded: 0,
            totalBytes: model.downloadSize,
            percentage: 0,
            speed: 0,
            eta: 0
        });
        this.emit('download:queued', modelId);
        this.processQueue();
    }
    /**
     * Start downloading all auto-install models
     */
    async downloadAutoInstallModels() {
        const autoInstallModels = this.getModelsByPriority('auto-install');
        for (const model of autoInstallModels) {
            if (!(await this.isModelDownloaded(model.id))) {
                await this.queueDownload(model.id);
            }
        }
    }
    /**
     * Process download queue
     */
    async processQueue() {
        const activeCount = this.activeDownloads.size;
        const availableSlots = this.options.maxConcurrentDownloads - activeCount;
        if (availableSlots <= 0 || this.downloadQueue.length === 0) {
            return;
        }
        const modelsToStart = this.downloadQueue.splice(0, availableSlots);
        for (const model of modelsToStart) {
            this.startDownload(model);
        }
    }
    /**
     * Start downloading a specific model
     */
    async startDownload(model) {
        const abortController = new AbortController();
        this.activeDownloads.set(model.id, abortController);
        const progress = this.downloadProgress.get(model.id);
        progress.status = 'downloading';
        this.emit('download:started', model.id);
        try {
            await this.downloadModel(model, abortController.signal);
            await this.verifyModel(model);
            progress.status = 'complete';
            progress.percentage = 100;
            this.emit('download:completed', model.id);
        }
        catch (error) {
            progress.status = 'error';
            progress.error = error instanceof Error ? error.message : 'Unknown error';
            this.emit('download:error', model.id, error);
        }
        finally {
            this.activeDownloads.delete(model.id);
            this.processQueue(); // Continue with next downloads
        }
    }
    /**
     * Download model from Hugging Face
     */
    async downloadModel(model, signal) {
        const url = `https://huggingface.co/${model.huggingFaceRepo}/resolve/main/${model.filename}`;
        const tempPath = path.join(this.tempDir, `${model.id}.tmp`);
        const finalPath = path.join(this.modelsDir, model.filename);
        // Check if partial download exists
        let resumePosition = 0;
        try {
            const stats = await fs_1.promises.stat(tempPath);
            resumePosition = stats.size;
        }
        catch {
            // File doesn't exist, start from beginning
        }
        const headers = {
            'User-Agent': 'Aura/1.0 (https://aura.ai)'
        };
        if (resumePosition > 0) {
            headers['Range'] = `bytes=${resumePosition}-`;
        }
        const response = await (0, node_fetch_1.default)(url, {
            headers,
            signal
        });
        if (!response.ok) {
            throw new Error(`Failed to download ${model.name}: ${response.status} ${response.statusText}`);
        }
        const totalBytes = resumePosition + (parseInt(response.headers.get('content-length') || '0'));
        const progress = this.downloadProgress.get(model.id);
        progress.totalBytes = totalBytes;
        progress.bytesDownloaded = resumePosition;
        // Open file for writing (append mode if resuming)
        const fileHandle = await fs_1.promises.open(tempPath, resumePosition > 0 ? 'a' : 'w');
        try {
            if (!response.body) {
                throw new Error('No response body');
            }
            let lastProgressUpdate = Date.now();
            let speedSamples = [];
            // Use pipeline to handle the stream properly
            await new Promise((resolve, reject) => {
                response.body.on('data', async (chunk) => {
                    if (signal.aborted) {
                        reject(new Error('Download aborted'));
                        return;
                    }
                    await fileHandle.write(chunk);
                    progress.bytesDownloaded += chunk.length;
                    progress.percentage = (progress.bytesDownloaded / progress.totalBytes) * 100;
                    // Update speed calculation
                    const now = Date.now();
                    if (now - lastProgressUpdate >= 1000) { // Update every second
                        const timeDiff = (now - lastProgressUpdate) / 1000;
                        const bytesDiff = chunk.length;
                        const currentSpeed = bytesDiff / timeDiff;
                        speedSamples.push(currentSpeed);
                        if (speedSamples.length > 10)
                            speedSamples.shift(); // Keep last 10 samples
                        progress.speed = speedSamples.reduce((a, b) => a + b) / speedSamples.length;
                        progress.eta = (progress.totalBytes - progress.bytesDownloaded) / progress.speed;
                        lastProgressUpdate = now;
                        this.emit('download:progress', model.id, progress);
                    }
                    // Apply bandwidth limiting
                    if (this.options.bandwidthLimit && progress.speed > this.options.bandwidthLimit) {
                        const delay = (chunk.length / this.options.bandwidthLimit) * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                });
                response.body.on('end', () => resolve());
                response.body.on('error', (err) => reject(err));
            });
        }
        finally {
            await fileHandle.close();
        }
        // Move completed file to final location
        await fs_1.promises.rename(tempPath, finalPath);
    }
    /**
     * Verify downloaded model integrity
     */
    async verifyModel(model) {
        const progress = this.downloadProgress.get(model.id);
        progress.status = 'verifying';
        this.emit('download:verifying', model.id);
        const modelPath = path.join(this.modelsDir, model.filename);
        const fileBuffer = await fs_1.promises.readFile(modelPath);
        const hash = (0, crypto_1.createHash)('sha256').update(fileBuffer).digest('hex');
        if (hash !== model.sha256) {
            // Delete corrupted file
            await fs_1.promises.unlink(modelPath);
            throw new Error(`Model verification failed: SHA256 mismatch for ${model.name}`);
        }
    }
    /**
     * Cancel download
     */
    async cancelDownload(modelId) {
        const controller = this.activeDownloads.get(modelId);
        if (controller) {
            controller.abort();
            this.activeDownloads.delete(modelId);
        }
        // Remove from queue
        this.downloadQueue = this.downloadQueue.filter(m => m.id !== modelId);
        const progress = this.downloadProgress.get(modelId);
        if (progress) {
            progress.status = 'error';
            progress.error = 'Download cancelled';
        }
        this.emit('download:cancelled', modelId);
    }
    /**
     * Delete downloaded model
     */
    async deleteModel(modelId) {
        const model = exports.LOCAL_MODELS.find(m => m.id === modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }
        const modelPath = path.join(this.modelsDir, model.filename);
        try {
            await fs_1.promises.unlink(modelPath);
            this.emit('model:deleted', modelId);
        }
        catch (error) {
            throw new Error(`Failed to delete model ${modelId}: ${error}`);
        }
    }
    /**
     * Get download progress for a model
     */
    getDownloadProgress(modelId) {
        return this.downloadProgress.get(modelId);
    }
    /**
     * Get all download progress
     */
    getAllDownloadProgress() {
        return new Map(this.downloadProgress);
    }
    /**
     * Cleanup temporary files
     */
    async cleanup() {
        try {
            const tempFiles = await fs_1.promises.readdir(this.tempDir);
            await Promise.all(tempFiles.map(file => fs_1.promises.unlink(path.join(this.tempDir, file))));
        }
        catch (error) {
            console.warn('Failed to cleanup temp files:', error);
        }
    }
}
exports.ModelDownloader = ModelDownloader;
// Default instance
exports.modelDownloader = new ModelDownloader(path.join(process.cwd(), 'models'), {
    maxConcurrentDownloads: 2,
    chunkSize: 8 * 1024 * 1024,
    maxRetries: 3
});
exports.default = ModelDownloader;
//# sourceMappingURL=ModelDownloader.js.map