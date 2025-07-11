import { EventEmitter } from 'events';
interface StreamSource {
    id: string;
    name: string;
    type: 'video' | 'audio' | 'sensor' | 'api' | 'file' | 'database';
    url: string;
    format: string;
    codec?: string;
    bitrate?: number;
    resolution?: string;
    frameRate?: number;
    sampleRate?: number;
    channels?: number;
    status: 'active' | 'inactive' | 'error' | 'buffering';
    metadata: Record<string, any>;
    createdAt: Date;
    lastActivity: Date;
}
export interface StreamProcessorInterface {
    id: string;
    name: string;
    type: 'filter' | 'transform' | 'analyze' | 'encode' | 'decode' | 'ml_inference';
    config: ProcessorConfig;
    inputFormat: string;
    outputFormat: string;
    status: 'idle' | 'processing' | 'error' | 'paused';
    performance: ProcessorPerformance;
    createdAt: Date;
}
interface ProcessorConfig {
    algorithm: string;
    parameters: Record<string, any>;
    bufferSize: number;
    batchSize: number;
    timeout: number;
    retries: number;
    gpuEnabled: boolean;
    multiThreaded: boolean;
}
interface ProcessorPerformance {
    throughput: number;
    latency: number;
    cpuUsage: number;
    memoryUsage: number;
    gpuUsage: number;
    errorRate: number;
    processedFrames: number;
    droppedFrames: number;
    lastUpdate: Date;
}
interface StreamPipeline {
    id: string;
    name: string;
    sourceId: string;
    processors: string[];
    sinks: string[];
    status: 'running' | 'stopped' | 'error' | 'paused';
    config: PipelineConfig;
    metrics: PipelineMetrics;
    createdAt: Date;
    startedAt?: Date;
    stoppedAt?: Date;
}
interface PipelineConfig {
    bufferPolicy: 'drop' | 'block' | 'overflow';
    maxBufferSize: number;
    parallelism: number;
    backpressureThreshold: number;
    checkpointInterval: number;
    faultTolerance: boolean;
    autoRestart: boolean;
}
interface PipelineMetrics {
    totalFrames: number;
    processedFrames: number;
    droppedFrames: number;
    errorFrames: number;
    averageLatency: number;
    throughput: number;
    backpressureEvents: number;
    restartCount: number;
    uptime: number;
}
interface StreamSink {
    id: string;
    name: string;
    type: 'file' | 'rtmp' | 'websocket' | 'api' | 'database' | 'display';
    destination: string;
    format: string;
    config: SinkConfig;
    status: 'active' | 'inactive' | 'error';
    metrics: SinkMetrics;
    createdAt: Date;
}
interface SinkConfig {
    compression: boolean;
    quality: number;
    maxFileSize?: number;
    rotationPolicy?: string;
    retryPolicy: {
        maxRetries: number;
        backoffMs: number;
        exponential: boolean;
    };
}
interface SinkMetrics {
    bytesWritten: number;
    framesWritten: number;
    errors: number;
    lastWrite: Date;
    writeRate: number;
}
interface StreamFrame {
    id: string;
    sourceId: string;
    pipelineId: string;
    timestamp: Date;
    sequenceNumber: number;
    data: ArrayBuffer | string | any;
    metadata: FrameMetadata;
    processingSteps: ProcessingStep[];
}
interface FrameMetadata {
    width?: number;
    height?: number;
    channels?: number;
    format: string;
    size: number;
    checksum: string;
    tags: string[];
    custom: Record<string, any>;
}
interface ProcessingStep {
    processorId: string;
    startTime: Date;
    endTime?: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: any;
    error?: string;
    metrics: {
        duration: number;
        cpuTime: number;
        memoryPeak: number;
    };
}
interface BufferManager {
    maxSize: number;
    currentSize: number;
    policy: 'fifo' | 'lifo' | 'priority';
    frames: Map<string, StreamFrame>;
    overflow: number;
    underflow: number;
}
export declare class StreamProcessor extends EventEmitter {
    private sources;
    private processors;
    private pipelines;
    private sinks;
    private buffers;
    private activeStreams;
    private frameQueue;
    private processingQueue;
    private isRunning;
    private processingInterval;
    private metricsInterval;
    private cleanupInterval;
    private maxConcurrentStreams;
    private maxFrameRate;
    private defaultBufferSize;
    constructor();
    private initializeStreamProcessor;
    private setupEventHandlers;
    createSource(sourceInfo: Partial<StreamSource>): string;
    startSource(sourceId: string): void;
    stopSource(sourceId: string): void;
    createProcessor(processorInfo: Partial<StreamProcessorInterface>): string;
    createPipeline(pipelineInfo: Partial<StreamPipeline>): string;
    startPipeline(pipelineId: string): void;
    stopPipeline(pipelineId: string): void;
    createSink(sinkInfo: Partial<StreamSink>): string;
    startStreamProcessor(): void;
    stopStreamProcessor(): void;
    private startFrameIngestion;
    private stopFrameIngestion;
    private ingestFrame;
    private processFrameQueue;
    private processFrame;
    private executeProcessor;
    private sendToSink;
    private applyFilter;
    private applyTransform;
    private analyzeFrame;
    private encodeFrame;
    private decodeFrame;
    private runMLInference;
    private handleFrameReceived;
    private handleProcessingComplete;
    private handleProcessingError;
    private handleBufferOverflow;
    private handleBackpressure;
    private handlePipelineError;
    private handlePipelineRestart;
    private validatePipeline;
    private generateFrame;
    private generateFrameData;
    private estimateFrameSize;
    private updateMetrics;
    private performCleanup;
    private getDefaultProcessorConfig;
    private getDefaultPipelineConfig;
    private getDefaultSinkConfig;
    private generateSourceId;
    private generateProcessorId;
    private generatePipelineId;
    private generateSinkId;
    private generateFrameId;
    private generateChecksum;
    getStreamStatus(): {
        sources: number;
        activeSources: number;
        processors: number;
        pipelines: number;
        runningPipelines: number;
        sinks: number;
        queueLength: number;
    };
    getSourceDetails(sourceId: string): StreamSource | null;
    getProcessorDetails(processorId: string): StreamProcessorInterface | null;
    getPipelineDetails(pipelineId: string): StreamPipeline | null;
    getSinkDetails(sinkId: string): StreamSink | null;
    getBufferStatus(pipelineId: string): BufferManager | null;
    pausePipeline(pipelineId: string): void;
    resumePipeline(pipelineId: string): void;
    adjustBufferSize(pipelineId: string, newSize: number): void;
}
export {};
//# sourceMappingURL=StreamProcessor.d.ts.map