import { EventEmitter } from 'events';

// Types and Interfaces
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

export class StreamProcessor extends EventEmitter {
    private sources: Map<string, StreamSource> = new Map();
    private processors: Map<string, StreamProcessorInterface> = new Map();
    private pipelines: Map<string, StreamPipeline> = new Map();
    private sinks: Map<string, StreamSink> = new Map();
    private buffers: Map<string, BufferManager> = new Map();

    private activeStreams: Set<string> = new Set();
    private frameQueue: StreamFrame[] = [];
    private processingQueue: Map<string, StreamFrame[]> = new Map();

    private isRunning: boolean = false;
    private processingInterval: NodeJS.Timeout | null = null;
    private metricsInterval: NodeJS.Timeout | null = null;
    private cleanupInterval: NodeJS.Timeout | null = null;

    private maxConcurrentStreams: number = 50;
    private maxFrameRate: number = 60;
    private defaultBufferSize: number = 1000;

    constructor() {
        super();
        this.initializeStreamProcessor();
        this.setupEventHandlers();
    }

    private initializeStreamProcessor(): void {
        console.log('Initializing G3D Stream Processor');
    }

    private setupEventHandlers(): void {
        this.on('frameReceived', this.handleFrameReceived.bind(this));
        this.on('processingComplete', this.handleProcessingComplete.bind(this));
        this.on('processingError', this.handleProcessingError.bind(this));
        this.on('bufferOverflow', this.handleBufferOverflow.bind(this));
        this.on('backpressure', this.handleBackpressure.bind(this));
        this.on('pipelineError', this.handlePipelineError.bind(this));
    }

    // Source Management
    public createSource(sourceInfo: Partial<StreamSource>): string {
        const sourceId = sourceInfo.id || this.generateSourceId();

        const source: StreamSource = {
            id: sourceId,
            name: sourceInfo.name || `Source-${sourceId}`,
            type: sourceInfo.type || 'video',
            url: sourceInfo.url || '',
            format: sourceInfo.format || 'raw',
            codec: sourceInfo.codec,
            bitrate: sourceInfo.bitrate,
            resolution: sourceInfo.resolution,
            frameRate: sourceInfo.frameRate || 30,
            sampleRate: sourceInfo.sampleRate,
            channels: sourceInfo.channels,
            status: 'inactive',
            metadata: sourceInfo.metadata || {},
            createdAt: new Date(),
            lastActivity: new Date()
        };

        this.sources.set(sourceId, source);

        console.log(`Stream source created: ${sourceId} (${source.type})`);
        this.emit('sourceCreated', source);

        return sourceId;
    }

    public startSource(sourceId: string): void {
        const source = this.sources.get(sourceId);
        if (!source) return;

        source.status = 'active';
        source.lastActivity = new Date();
        this.activeStreams.add(sourceId);

        // Start receiving frames from source
        this.startFrameIngestion(source);

        console.log(`Stream source started: ${sourceId}`);
        this.emit('sourceStarted', source);
    }

    public stopSource(sourceId: string): void {
        const source = this.sources.get(sourceId);
        if (!source) return;

        source.status = 'inactive';
        this.activeStreams.delete(sourceId);

        // Stop frame ingestion
        this.stopFrameIngestion(sourceId);

        console.log(`Stream source stopped: ${sourceId}`);
        this.emit('sourceStopped', source);
    }

    // Processor Management
    public createProcessor(processorInfo: Partial<StreamProcessorInterface>): string {
        const processorId = this.generateProcessorId();

        const processor: StreamProcessorInterface = {
            id: processorId,
            name: processorInfo.name || `Processor-${processorId}`,
            type: processorInfo.type || 'filter',
            config: processorInfo.config || this.getDefaultProcessorConfig(),
            inputFormat: processorInfo.inputFormat || 'raw',
            outputFormat: processorInfo.outputFormat || 'raw',
            status: 'idle',
            performance: {
                throughput: 0,
                latency: 0,
                cpuUsage: 0,
                memoryUsage: 0,
                gpuUsage: 0,
                errorRate: 0,
                processedFrames: 0,
                droppedFrames: 0,
                lastUpdate: new Date()
            },
            createdAt: new Date()
        };

        this.processors.set(processorId, processor);

        console.log(`Stream processor created: ${processorId} (${processor.type})`);
        this.emit('processorCreated', processor);

        return processorId;
    }

    // Pipeline Management
    public createPipeline(pipelineInfo: Partial<StreamPipeline>): string {
        const pipelineId = this.generatePipelineId();

        const pipeline: StreamPipeline = {
            id: pipelineId,
            name: pipelineInfo.name || `Pipeline-${pipelineId}`,
            sourceId: pipelineInfo.sourceId || '',
            processors: pipelineInfo.processors || [],
            sinks: pipelineInfo.sinks || [],
            status: 'stopped',
            config: pipelineInfo.config || this.getDefaultPipelineConfig(),
            metrics: {
                totalFrames: 0,
                processedFrames: 0,
                droppedFrames: 0,
                errorFrames: 0,
                averageLatency: 0,
                throughput: 0,
                backpressureEvents: 0,
                restartCount: 0,
                uptime: 0
            },
            createdAt: new Date()
        };

        this.pipelines.set(pipelineId, pipeline);

        // Create buffer for pipeline
        this.buffers.set(pipelineId, {
            maxSize: pipeline.config.maxBufferSize,
            currentSize: 0,
            policy: 'fifo',
            frames: new Map(),
            overflow: 0,
            underflow: 0
        });

        console.log(`Stream pipeline created: ${pipelineId}`);
        this.emit('pipelineCreated', pipeline);

        return pipelineId;
    }

    public startPipeline(pipelineId: string): void {
        const pipeline = this.pipelines.get(pipelineId);
        if (!pipeline) return;

        // Validate pipeline configuration
        if (!this.validatePipeline(pipeline)) {
            console.error(`Pipeline validation failed: ${pipelineId}`);
            return;
        }

        pipeline.status = 'running';
        pipeline.startedAt = new Date();

        // Start source if not already started
        if (pipeline.sourceId) {
            this.startSource(pipeline.sourceId);
        }

        console.log(`Stream pipeline started: ${pipelineId}`);
        this.emit('pipelineStarted', pipeline);
    }

    public stopPipeline(pipelineId: string): void {
        const pipeline = this.pipelines.get(pipelineId);
        if (!pipeline) return;

        pipeline.status = 'stopped';
        pipeline.stoppedAt = new Date();

        // Update uptime
        if (pipeline.startedAt) {
            pipeline.metrics.uptime += Date.now() - pipeline.startedAt.getTime();
        }

        console.log(`Stream pipeline stopped: ${pipelineId}`);
        this.emit('pipelineStopped', pipeline);
    }

    // Sink Management
    public createSink(sinkInfo: Partial<StreamSink>): string {
        const sinkId = this.generateSinkId();

        const sink: StreamSink = {
            id: sinkId,
            name: sinkInfo.name || `Sink-${sinkId}`,
            type: sinkInfo.type || 'file',
            destination: sinkInfo.destination || '',
            format: sinkInfo.format || 'raw',
            config: sinkInfo.config || this.getDefaultSinkConfig(),
            status: 'inactive',
            metrics: {
                bytesWritten: 0,
                framesWritten: 0,
                errors: 0,
                lastWrite: new Date(),
                writeRate: 0
            },
            createdAt: new Date()
        };

        this.sinks.set(sinkId, sink);

        console.log(`Stream sink created: ${sinkId} (${sink.type})`);
        this.emit('sinkCreated', sink);

        return sinkId;
    }

    // Stream Processing Operations
    public startStreamProcessor(): void {
        if (this.isRunning) return;

        this.isRunning = true;

        // Start frame processing
        this.processingInterval = setInterval(() => {
            this.processFrameQueue();
        }, 16); // ~60 FPS

        // Start metrics collection
        this.metricsInterval = setInterval(() => {
            this.updateMetrics();
        }, 1000); // Every second

        // Start cleanup
        this.cleanupInterval = setInterval(() => {
            this.performCleanup();
        }, 30000); // Every 30 seconds

        console.log('G3D Stream Processor started');
        this.emit('processorStarted');
    }

    public stopStreamProcessor(): void {
        if (!this.isRunning) return;

        this.isRunning = false;

        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }

        // Stop all active sources
        for (const sourceId of this.activeStreams) {
            this.stopSource(sourceId);
        }

        // Stop all running pipelines
        for (const [pipelineId, pipeline] of this.pipelines) {
            if (pipeline.status === 'running') {
                this.stopPipeline(pipelineId);
            }
        }

        console.log('G3D Stream Processor stopped');
        this.emit('processorStopped');
    }

    // Frame Processing
    private startFrameIngestion(source: StreamSource): void {
        // Simulate frame ingestion
        const frameInterval = 1000 / (source.frameRate || 30);

        const ingestFrames = () => {
            if (!this.activeStreams.has(source.id)) return;

            const frame = this.generateFrame(source);
            this.ingestFrame(frame);

            setTimeout(ingestFrames, frameInterval);
        };

        ingestFrames();
    }

    private stopFrameIngestion(sourceId: string): void {
        // Frame ingestion will stop automatically when source is removed from activeStreams
    }

    private ingestFrame(frame: StreamFrame): void {
        // Find pipelines using this source
        const sourcePipelines = Array.from(this.pipelines.values())
            .filter(pipeline => pipeline.sourceId === frame.sourceId && pipeline.status === 'running');

        for (const pipeline of sourcePipelines) {
            const buffer = this.buffers.get(pipeline.id);
            if (!buffer) continue;

            // Check buffer capacity
            if (buffer.currentSize >= buffer.maxSize) {
                this.handleBufferOverflow(pipeline.id, frame);
                continue;
            }

            // Add frame to buffer
            const frameClone = { ...frame, pipelineId: pipeline.id };
            buffer.frames.set(frame.id, frameClone);
            buffer.currentSize++;

            this.frameQueue.push(frameClone);
            pipeline.metrics.totalFrames++;
        }

        this.emit('frameReceived', frame);
    }

    private processFrameQueue(): void {
        if (this.frameQueue.length === 0) return;

        const framesToProcess = this.frameQueue.splice(0, 100); // Process up to 100 frames per cycle

        for (const frame of framesToProcess) {
            this.processFrame(frame);
        }
    }

    private async processFrame(frame: StreamFrame): Promise<void> {
        const pipeline = this.pipelines.get(frame.pipelineId);
        if (!pipeline) return;

        try {
            let currentFrame = frame;

            // Process through each processor in the pipeline
            for (const processorId of pipeline.processors) {
                const processor = this.processors.get(processorId);
                if (!processor) continue;

                const step: ProcessingStep = {
                    processorId,
                    startTime: new Date(),
                    status: 'processing',
                    metrics: {
                        duration: 0,
                        cpuTime: 0,
                        memoryPeak: 0
                    }
                };

                currentFrame.processingSteps.push(step);
                processor.status = 'processing';

                try {
                    const result = await this.executeProcessor(processor, currentFrame);

                    step.endTime = new Date();
                    step.status = 'completed';
                    step.result = result;
                    step.metrics.duration = step.endTime.getTime() - step.startTime.getTime();

                    // Update frame data with result
                    if (result.data) {
                        currentFrame.data = result.data;
                        currentFrame.metadata = { ...currentFrame.metadata, ...result.metadata };
                    }

                    processor.performance.processedFrames++;
                    processor.status = 'idle';

                } catch (error) {
                    step.endTime = new Date();
                    step.status = 'failed';
                    step.error = (error as Error).message;

                    processor.status = 'error';
                    this.emit('processingError', { processor, frame: currentFrame, error });

                    pipeline.metrics.errorFrames++;
                    return;
                }
            }

            // Send to sinks
            for (const sinkId of pipeline.sinks) {
                await this.sendToSink(sinkId, currentFrame);
            }

            pipeline.metrics.processedFrames++;
            this.emit('processingComplete', { pipeline, frame: currentFrame });

        } catch (error) {
            pipeline.metrics.errorFrames++;
            this.emit('processingError', { pipeline, frame, error });
        } finally {
            // Remove frame from buffer
            const buffer = this.buffers.get(frame.pipelineId);
            if (buffer) {
                buffer.frames.delete(frame.id);
                buffer.currentSize--;
            }
        }
    }

    private async executeProcessor(processor: StreamProcessorInterface, frame: StreamFrame): Promise<any> {
        // Simulate processing delay
        const processingTime = Math.random() * 50 + 10; // 10-60ms
        await new Promise(resolve => setTimeout(resolve, processingTime));

        // Simulate different processor types
        switch (processor.type) {
            case 'filter':
                return this.applyFilter(processor, frame);
            case 'transform':
                return this.applyTransform(processor, frame);
            case 'analyze':
                return this.analyzeFrame(processor, frame);
            case 'encode':
                return this.encodeFrame(processor, frame);
            case 'decode':
                return this.decodeFrame(processor, frame);
            case 'ml_inference':
                return this.runMLInference(processor, frame);
            default:
                return { data: frame.data, metadata: {} };
        }
    }

    private async sendToSink(sinkId: string, frame: StreamFrame): Promise<void> {
        const sink = this.sinks.get(sinkId);
        if (!sink) return;

        try {
            sink.status = 'active';

            // Simulate sending to sink
            const dataSize = this.estimateFrameSize(frame);

            // Update sink metrics
            sink.metrics.bytesWritten += dataSize;
            sink.metrics.framesWritten++;
            sink.metrics.lastWrite = new Date();

            console.log(`Frame sent to sink: ${sinkId} (${dataSize} bytes)`);

        } catch (error) {
            sink.metrics.errors++;
            sink.status = 'error';
            console.error(`Sink error: ${sinkId}`, error);
        }
    }

    // Processing Methods
    private applyFilter(processor: StreamProcessorInterface, frame: StreamFrame): any {
        // Simulate filter processing
        return {
            data: frame.data,
            metadata: { filtered: true, filter: processor.config.algorithm }
        };
    }

    private applyTransform(processor: StreamProcessorInterface, frame: StreamFrame): any {
        // Simulate transform processing
        return {
            data: frame.data,
            metadata: { transformed: true, transform: processor.config.algorithm }
        };
    }

    private analyzeFrame(processor: StreamProcessorInterface, frame: StreamFrame): any {
        // Simulate analysis
        return {
            data: frame.data,
            metadata: {
                analyzed: true,
                features: ['edge', 'texture', 'color'],
                confidence: Math.random()
            }
        };
    }

    private encodeFrame(processor: StreamProcessorInterface, frame: StreamFrame): any {
        // Simulate encoding
        return {
            data: frame.data,
            metadata: { encoded: true, codec: processor.config.algorithm }
        };
    }

    private decodeFrame(processor: StreamProcessorInterface, frame: StreamFrame): any {
        // Simulate decoding
        return {
            data: frame.data,
            metadata: { decoded: true, codec: processor.config.algorithm }
        };
    }

    private runMLInference(processor: StreamProcessorInterface, frame: StreamFrame): any {
        // Simulate ML inference
        return {
            data: frame.data,
            metadata: {
                predictions: [
                    { class: 'object', confidence: Math.random(), bbox: [0, 0, 100, 100] },
                    { class: 'person', confidence: Math.random(), bbox: [50, 50, 150, 200] }
                ],
                model: processor.config.algorithm
            }
        };
    }

    // Event Handlers
    private handleFrameReceived(frame: StreamFrame): void {
        // Update source activity
        const source = this.sources.get(frame.sourceId);
        if (source) {
            source.lastActivity = new Date();
        }
    }

    private handleProcessingComplete(event: any): void {
        const { pipeline, frame } = event;

        // Update pipeline metrics
        const processingTime = frame.processingSteps.reduce((total: number, step: ProcessingStep) =>
            total + step.metrics.duration, 0);

        pipeline.metrics.averageLatency =
            (pipeline.metrics.averageLatency * (pipeline.metrics.processedFrames - 1) + processingTime) /
            pipeline.metrics.processedFrames;
    }

    private handleProcessingError(event: any): void {
        console.error('Processing error:', event);

        const { pipeline } = event;
        if (pipeline && pipeline.config.faultTolerance) {
            // Implement fault tolerance logic
            this.handlePipelineRestart(pipeline.id);
        }
    }

    private handleBufferOverflow(pipelineId: string, frame: StreamFrame): void {
        const buffer = this.buffers.get(pipelineId);
        const pipeline = this.pipelines.get(pipelineId);

        if (!buffer || !pipeline) return;

        buffer.overflow++;
        pipeline.metrics.droppedFrames++;

        // Apply buffer policy
        switch (buffer.policy) {
            case 'fifo':
                // Drop oldest frame
                const oldestFrame = buffer.frames.values().next().value;
                if (oldestFrame) {
                    buffer.frames.delete(oldestFrame.id);
                    buffer.currentSize--;
                }
                break;
            case 'lifo':
                // Drop newest frame (current frame)
                pipeline.metrics.droppedFrames++;
                return;
            case 'priority':
                // Drop lowest priority frame
                // Implementation would depend on priority logic
                break;
        }

        this.emit('bufferOverflow', { pipelineId, frame });
    }

    private handleBackpressure(pipelineId: string): void {
        const pipeline = this.pipelines.get(pipelineId);
        if (!pipeline) return;

        pipeline.metrics.backpressureEvents++;

        // Implement backpressure handling
        console.warn(`Backpressure detected in pipeline: ${pipelineId}`);
        this.emit('backpressure', { pipelineId });
    }

    private handlePipelineError(pipelineId: string, error: Error): void {
        const pipeline = this.pipelines.get(pipelineId);
        if (!pipeline) return;

        pipeline.status = 'error';

        if (pipeline.config.autoRestart) {
            this.handlePipelineRestart(pipelineId);
        }
    }

    private handlePipelineRestart(pipelineId: string): void {
        const pipeline = this.pipelines.get(pipelineId);
        if (!pipeline) return;

        pipeline.metrics.restartCount++;

        setTimeout(() => {
            if (pipeline.status === 'error') {
                console.log(`Restarting pipeline: ${pipelineId}`);
                this.startPipeline(pipelineId);
            }
        }, 5000); // 5 second delay
    }

    // Utility Methods
    private validatePipeline(pipeline: StreamPipeline): boolean {
        // Check if source exists
        if (!this.sources.has(pipeline.sourceId)) {
            console.error(`Source not found: ${pipeline.sourceId}`);
            return false;
        }

        // Check if processors exist
        for (const processorId of pipeline.processors) {
            if (!this.processors.has(processorId)) {
                console.error(`Processor not found: ${processorId}`);
                return false;
            }
        }

        // Check if sinks exist
        for (const sinkId of pipeline.sinks) {
            if (!this.sinks.has(sinkId)) {
                console.error(`Sink not found: ${sinkId}`);
                return false;
            }
        }

        return true;
    }

    private generateFrame(source: StreamSource): StreamFrame {
        return {
            id: this.generateFrameId(),
            sourceId: source.id,
            pipelineId: '',
            timestamp: new Date(),
            sequenceNumber: Math.floor(Math.random() * 1000000),
            data: this.generateFrameData(source),
            metadata: {
                width: 1920,
                height: 1080,
                channels: 3,
                format: source.format,
                size: 1920 * 1080 * 3,
                checksum: this.generateChecksum(),
                tags: [],
                custom: {}
            },
            processingSteps: []
        };
    }

    private generateFrameData(source: StreamSource): any {
        // Simulate frame data based on source type
        switch (source.type) {
            case 'video':
                return new ArrayBuffer(1920 * 1080 * 3); // RGB frame
            case 'audio':
                return new Float32Array(1024); // Audio samples
            case 'sensor':
                return { temperature: 25.5, humidity: 60.2, pressure: 1013.25 };
            default:
                return {};
        }
    }

    private estimateFrameSize(frame: StreamFrame): number {
        if (frame.data instanceof ArrayBuffer) {
            return frame.data.byteLength;
        }
        if (frame.data instanceof Float32Array) {
            return frame.data.byteLength;
        }
        return JSON.stringify(frame.data).length;
    }

    private updateMetrics(): void {
        // Update processor performance metrics
        for (const processor of this.processors.values()) {
            if (processor.status === 'processing') {
                processor.performance.cpuUsage = Math.random() * 100;
                processor.performance.memoryUsage = Math.random() * 100;
                processor.performance.gpuUsage = processor.config.gpuEnabled ? Math.random() * 100 : 0;
                processor.performance.lastUpdate = new Date();
            }
        }

        // Update pipeline throughput
        for (const pipeline of this.pipelines.values()) {
            if (pipeline.status === 'running') {
                const timeSinceStart = pipeline.startedAt ?
                    Date.now() - pipeline.startedAt.getTime() : 0;

                if (timeSinceStart > 0) {
                    pipeline.metrics.throughput =
                        (pipeline.metrics.processedFrames / timeSinceStart) * 1000; // frames per second
                }
            }
        }

        // Update sink write rates
        for (const sink of this.sinks.values()) {
            if (sink.status === 'active') {
                const timeSinceLastWrite = Date.now() - sink.metrics.lastWrite.getTime();
                if (timeSinceLastWrite < 60000) { // Last minute
                    sink.metrics.writeRate = sink.metrics.framesWritten / (timeSinceLastWrite / 1000);
                }
            }
        }
    }

    private performCleanup(): void {
        // Clean up old completed frames
        const cutoffTime = new Date(Date.now() - 300000); // 5 minutes ago

        for (const buffer of this.buffers.values()) {
            for (const [frameId, frame] of buffer.frames) {
                if (frame.timestamp < cutoffTime) {
                    buffer.frames.delete(frameId);
                    buffer.currentSize--;
                }
            }
        }

        console.log('Stream processor cleanup completed');
    }

    // Default Configurations
    private getDefaultProcessorConfig(): ProcessorConfig {
        return {
            algorithm: 'default',
            parameters: {},
            bufferSize: 100,
            batchSize: 1,
            timeout: 5000,
            retries: 3,
            gpuEnabled: false,
            multiThreaded: true
        };
    }

    private getDefaultPipelineConfig(): PipelineConfig {
        return {
            bufferPolicy: 'drop',
            maxBufferSize: this.defaultBufferSize,
            parallelism: 1,
            backpressureThreshold: 0.8,
            checkpointInterval: 10000,
            faultTolerance: true,
            autoRestart: true
        };
    }

    private getDefaultSinkConfig(): SinkConfig {
        return {
            compression: false,
            quality: 100,
            retryPolicy: {
                maxRetries: 3,
                backoffMs: 1000,
                exponential: true
            }
        };
    }

    // Utility Functions
    private generateSourceId(): string {
        return `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateProcessorId(): string {
        return `processor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generatePipelineId(): string {
        return `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateSinkId(): string {
        return `sink_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateFrameId(): string {
        return `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateChecksum(): string {
        return Math.random().toString(36).substr(2, 16);
    }

    // Public API
    public getStreamStatus(): {
        sources: number;
        activeSources: number;
        processors: number;
        pipelines: number;
        runningPipelines: number;
        sinks: number;
        queueLength: number;
    } {
        return {
            sources: this.sources.size,
            activeSources: this.activeStreams.size,
            processors: this.processors.size,
            pipelines: this.pipelines.size,
            runningPipelines: Array.from(this.pipelines.values()).filter(p => p.status === 'running').length,
            sinks: this.sinks.size,
            queueLength: this.frameQueue.length
        };
    }

    public getSourceDetails(sourceId: string): StreamSource | null {
        return this.sources.get(sourceId) || null;
    }

    public getProcessorDetails(processorId: string): StreamProcessorInterface | null {
        return this.processors.get(processorId) || null;
    }

    public getPipelineDetails(pipelineId: string): StreamPipeline | null {
        return this.pipelines.get(pipelineId) || null;
    }

    public getSinkDetails(sinkId: string): StreamSink | null {
        return this.sinks.get(sinkId) || null;
    }

    public getBufferStatus(pipelineId: string): BufferManager | null {
        return this.buffers.get(pipelineId) || null;
    }

    public pausePipeline(pipelineId: string): void {
        const pipeline = this.pipelines.get(pipelineId);
        if (pipeline && pipeline.status === 'running') {
            pipeline.status = 'paused';
            console.log(`Pipeline paused: ${pipelineId}`);
            this.emit('pipelinePaused', pipeline);
        }
    }

    public resumePipeline(pipelineId: string): void {
        const pipeline = this.pipelines.get(pipelineId);
        if (pipeline && pipeline.status === 'paused') {
            pipeline.status = 'running';
            console.log(`Pipeline resumed: ${pipelineId}`);
            this.emit('pipelineResumed', pipeline);
        }
    }

    public adjustBufferSize(pipelineId: string, newSize: number): void {
        const buffer = this.buffers.get(pipelineId);
        const pipeline = this.pipelines.get(pipelineId);

        if (buffer && pipeline) {
            buffer.maxSize = newSize;
            pipeline.config.maxBufferSize = newSize;

            console.log(`Buffer size adjusted: ${pipelineId} -> ${newSize}`);
            this.emit('bufferSizeChanged', { pipelineId, newSize });
        }
    }
}