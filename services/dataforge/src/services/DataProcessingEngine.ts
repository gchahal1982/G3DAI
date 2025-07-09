import {
    DataStream,
    ProcessingConfig,
    ProcessingResult,
    PipelineStage,
    ProcessingStatus,
    ProcessingMetrics,
    ProcessingError,
    Checkpoint,
    OutputLocation,
    DataSchema,
    SchemaField,
    Anomaly,
    AnomalyType,
    DataComplianceConfig,
    MLPipelineConfig,
    DataQualityRule,
    TransformationConfig,
    AlertConfiguration,
    RealTimeMetrics,
    ThroughputMetrics,
    LatencyMetrics,
    ResourceMetrics
} from '@/types/dataforge.types';

export interface DataProcessingEngineConfig {
    kafka: {
        brokers: string[];
        clientId: string;
        groupId: string;
        sasl?: {
            mechanism: string;
            username: string;
            password: string;
        };
    };
    storage: {
        type: 's3' | 'hdfs' | 'gcs' | 'azure';
        bucket: string;
        prefix: string;
        credentials?: Record<string, any>;
    };
    processing: {
        defaultParallelism: number;
        maxRetries: number;
        checkpointInterval: number;
        windowDuration: number;
    };
    monitoring: {
        metricsEndpoint: string;
        logsEndpoint: string;
        tracingEndpoint: string;
    };
}

export class DataProcessingEngine {
    private streamProcessor!: KafkaStreamProcessor;
    private mlPipeline!: MLPipelineOrchestrator;
    private complianceEngine!: DataComplianceEngine;
    private anomalyDetector!: AnomalyDetectionSystem;
    private qualityChecker!: DataQualityChecker;
    private transformationEngine!: TransformationEngine;
    private metricsCollector!: MetricsCollector;
    private alertManager!: AlertManager;

    private activeStreams: Map<string, StreamContext> = new Map();
    private processingMetrics: Map<string, ProcessingMetrics> = new Map();

    constructor(
        private config: DataProcessingEngineConfig,
        private logger: Logger
    ) {
        this.initializeComponents();
    }

    private initializeComponents(): void {
        this.streamProcessor = new KafkaStreamProcessor(this.config.kafka);
        this.mlPipeline = new MLPipelineOrchestrator();
        this.complianceEngine = new DataComplianceEngine();
        this.anomalyDetector = new AnomalyDetectionSystem();
        this.qualityChecker = new DataQualityChecker();
        this.transformationEngine = new TransformationEngine();
        this.metricsCollector = new MetricsCollector(this.config.monitoring);
        this.alertManager = new AlertManager();
    }

    async processDataStream(
        stream: DataStream,
        config: ProcessingConfig
    ): Promise<ProcessingResult> {
        const startTime = Date.now();
        const streamContext = this.createStreamContext(stream, config);

        try {
            // Register stream
            this.activeStreams.set(stream.id, streamContext);

            // Initialize processing pipeline
            const pipeline = await this.createProcessingPipeline(stream, config);

            // Start metrics collection
            this.startMetricsCollection(stream.id);

            // Process stream with pipeline
            const result = await this.executeProcessingPipeline(
                stream,
                pipeline,
                streamContext,
                config
            );

            // Finalize processing
            await this.finalizeProcessing(stream.id, result);

            return result;

        } catch (error) {
            this.logger.error(`Processing failed for stream ${stream.id}`, error);

            const errorObj = error as Error;
            const errorResult: ProcessingResult = {
                streamId: stream.id,
                pipelineId: streamContext.pipelineId,
                status: {
                    state: 'failed',
                    progress: streamContext.progress,
                    startTime: new Date(startTime),
                    endTime: new Date(),
                    currentStage: streamContext.currentStage
                },
                metrics: this.getStreamMetrics(stream.id),
                errors: [{
                    timestamp: new Date(),
                    stage: streamContext.currentStage || 'initialization',
                    errorType: errorObj.name || 'UnknownError',
                    message: errorObj.message || 'Unknown error occurred',
                    stackTrace: errorObj.stack,
                    affectedRecords: 0
                }],
                checkpoints: streamContext.checkpoints,
                outputLocations: []
            };

            return errorResult;

        } finally {
            this.activeStreams.delete(stream.id);
        }
    }

    private async createProcessingPipeline(
        stream: DataStream,
        config: ProcessingConfig
    ): Promise<ProcessingPipeline> {
        const pipeline = new ProcessingPipeline();

        // Build pipeline stages
        for (const stageConfig of config.pipeline) {
            const stage = await this.createPipelineStage(stageConfig, stream.schema);
            pipeline.addStage(stage);
        }

        // Add compliance stage if required
        // TODO: Add compliance configuration to ProcessingConfig type
        // if (config.compliance) {
        //   const complianceStage = await this.createComplianceStage(config.compliance);
        //   pipeline.addStage(complianceStage);
        // }

        // Add ML inference stages if configured
        // TODO: Add mlPipeline configuration to ProcessingConfig type
        // if (config.mlPipeline) {
        //   const mlStages = await this.createMLStages(config.mlPipeline);
        //   mlStages.forEach((stage: ProcessingStage) => pipeline.addStage(stage));
        // }

        // Add quality check stage
        // TODO: Add qualityRules configuration to ProcessingConfig type
        // if (config.qualityRules && config.qualityRules.length > 0) {
        //   const qualityStage = await this.createQualityStage(config.qualityRules);
        //   pipeline.addStage(qualityStage);
        // }

        // Configure pipeline settings
        pipeline.setParallelism(config.parallelism);
        pipeline.setCheckpointing(config.checkpointing);
        pipeline.setErrorHandling(config.errorHandling);

        return pipeline;
    }

    private async createPipelineStage(
        stageConfig: PipelineStage,
        schema: DataSchema
    ): Promise<ProcessingStage> {
        // Placeholder implementation - would create actual stage based on type
        return {} as ProcessingStage;
    }

    private async executeProcessingPipeline(
        stream: DataStream,
        pipeline: ProcessingPipeline,
        context: StreamContext,
        config: ProcessingConfig
    ): Promise<ProcessingResult> {
        const startTime = Date.now();
        const metrics: ProcessingMetrics = this.initializeMetrics();
        const errors: ProcessingError[] = [];
        const checkpoints: Checkpoint[] = [];
        const outputLocations: OutputLocation[] = [];

        try {
            // Create stream subscription
            const subscription = await this.streamProcessor.subscribe(
                stream.source,
                {
                    fromOffset: context.lastOffset || 'earliest',
                    autoCommit: false,
                    maxBatchSize: config.batchSize || 1000,
                    maxWaitTime: config.maxWaitTime || 1000
                }
            );

            // Process batches
            let batchCount = 0;
            let shouldContinue = true;

            while (shouldContinue && context.status.state === 'running') {
                try {
                    // Fetch batch
                    const batch = await subscription.fetchBatch();

                    if (batch.isEmpty()) {
                        // No more data or timeout
                        if (stream.type === 'batch') {
                            shouldContinue = false;
                            break;
                        }
                        continue;
                    }

                    // Update metrics
                    metrics.recordsProcessed += batch.size();
                    metrics.bytesProcessed += batch.sizeInBytes();

                    // Process through pipeline
                    const batchStartTime = Date.now();
                    const processedBatch = await pipeline.process(batch, context);
                    const batchProcessingTime = Date.now() - batchStartTime;

                    // Update latency metrics
                    this.updateLatencyMetrics(metrics.latency, batchProcessingTime / batch.size());

                    // Handle processed results
                    if (processedBatch.hasErrors()) {
                        const batchErrors = processedBatch.getErrors();
                        errors.push(...batchErrors);
                        metrics.recordsErrored += batchErrors.length;
                    }

                    // Write to sink
                    if (processedBatch.hasRecords()) {
                        const sinkResult = await this.writeBatchToSink(
                            processedBatch,
                            config.sink,
                            context
                        );

                        if (sinkResult.location) {
                            outputLocations.push(sinkResult.location);
                        }
                    }

                    // Checkpoint if needed
                    if (++batchCount % config.checkpointing.interval === 0) {
                        const checkpoint = await this.createCheckpoint(
                            stream.id,
                            batch.lastOffset(),
                            metrics
                        );
                        checkpoints.push(checkpoint);
                        context.checkpoints.push(checkpoint);

                        // Commit offset
                        await subscription.commit(batch.lastOffset());
                    }

                    // Update progress
                    context.progress = this.calculateProgress(metrics, stream);

                    // Check for anomalies
                    await this.checkForAnomalies(stream, metrics, batch);

                    // Update throughput metrics
                    this.updateThroughputMetrics(
                        metrics.throughput,
                        batch.size(),
                        batchProcessingTime
                    );

                } catch (batchError) {
                    this.logger.error(`Batch processing error for stream ${stream.id}`, batchError);

                    errors.push({
                        timestamp: new Date(),
                        stage: context.currentStage || 'batch-processing',
                        errorType: batchError.name || 'BatchProcessingError',
                        message: batchError.message,
                        stackTrace: batchError.stack,
                        affectedRecords: 0
                    });

                    // Apply error handling strategy
                    if (config.errorHandling.onError === 'fail') {
                        throw batchError;
                    }
                }

                // Check resource usage
                const resourceMetrics = await this.getResourceMetrics();
                metrics.resourceUsage = resourceMetrics;

                // Auto-scaling check
                if (config.optimization?.autoScaling?.enabled) {
                    await this.checkAutoScaling(metrics, config.optimization.autoScaling);
                }
            }

            // Final checkpoint
            if (metrics.recordsProcessed > 0) {
                const finalCheckpoint = await this.createCheckpoint(
                    stream.id,
                    context.lastOffset || '',
                    metrics
                );
                checkpoints.push(finalCheckpoint);
            }

            // Calculate final metrics
            const processingTime = Date.now() - startTime;
            metrics.processingTime = processingTime;

            return {
                streamId: stream.id,
                pipelineId: context.pipelineId,
                status: {
                    state: 'completed',
                    progress: 100,
                    startTime: new Date(startTime),
                    endTime: new Date(),
                    currentStage: 'completed'
                },
                metrics,
                errors,
                checkpoints,
                outputLocations
            };

        } finally {
            // Cleanup
            await pipeline.shutdown();
        }
    }

    private async checkForAnomalies(
        stream: DataStream,
        metrics: ProcessingMetrics,
        batch: DataBatch
    ): Promise<void> {
        const anomalies = await this.anomalyDetector.detect({
            streamId: stream.id,
            metrics,
            sampleData: batch.sample(100),
            timeWindow: {
                start: new Date(Date.now() - 3600000), // 1 hour
                end: new Date(),
                duration: { value: 1, unit: 'h' }
            }
        });

        for (const anomaly of anomalies) {
            await this.handleAnomaly(anomaly, stream);
        }
    }

    private async handleAnomaly(anomaly: Anomaly, stream: DataStream): Promise<void> {
        this.logger.warn(`Anomaly detected in stream ${stream.id}`, {
            type: anomaly.type,
            severity: anomaly.severity,
            confidence: anomaly.confidence
        });

        // Send alerts based on severity
        if (anomaly.severity === 'critical' || anomaly.severity === 'high') {
            await this.alertManager.sendAlert({
                title: `Anomaly Detected: ${anomaly.type}`,
                description: anomaly.description,
                severity: anomaly.severity,
                streamId: stream.id,
                timestamp: anomaly.timestamp,
                context: anomaly.context
            });
        }

        // Auto-remediation for certain anomaly types
        if (anomaly.suggestedActions.includes('auto-scale')) {
            await this.autoScale(stream.id, 'up');
        }

        if (anomaly.suggestedActions.includes('throttle')) {
            await this.throttleStream(stream.id, 0.5);
        }
    }

    async getRealTimeMetrics(streamId?: string): Promise<RealTimeMetrics | RealTimeMetrics[]> {
        if (streamId) {
            return this.getStreamRealTimeMetrics(streamId);
        }

        // Get metrics for all active streams
        const allMetrics: RealTimeMetrics[] = [];

        for (const [id, context] of this.activeStreams) {
            const metrics = await this.getStreamRealTimeMetrics(id);
            allMetrics.push(metrics);
        }

        return allMetrics;
    }

    private async getStreamRealTimeMetrics(streamId: string): Promise<RealTimeMetrics> {
        const context = this.activeStreams.get(streamId);
        const metrics = this.processingMetrics.get(streamId) || this.initializeMetrics();

        const qualityIssues = await this.qualityChecker.getCurrentIssues(streamId);

        return {
            timestamp: new Date(),
            volume: metrics.recordsProcessed,
            volumeTrend: this.calculateTrend('volume', streamId),
            latency: metrics.latency.avg,
            latencyDistribution: [
                metrics.latency.min,
                metrics.latency.p50,
                metrics.latency.p95,
                metrics.latency.p99,
                metrics.latency.max
            ],
            quality: this.calculateQualityScore(qualityIssues),
            qualityIssues,
            throughput: metrics.throughput,
            errorRate: metrics.recordsErrored / Math.max(metrics.recordsProcessed, 1),
            activeStreams: this.activeStreams.size,
            queueDepth: context?.queueDepth || 0
        };
    }

    private createStreamContext(stream: DataStream, config: ProcessingConfig): StreamContext {
        return {
            streamId: stream.id,
            pipelineId: `pipeline_${stream.id}_${Date.now()}`,
            status: {
                state: 'running',
                health: 'healthy',
                lastHealthCheck: new Date(),
                errors: []
            },
            progress: 0,
            currentStage: 'initialization',
            checkpoints: [],
            lastOffset: undefined,
            queueDepth: 0,
            config
        };
    }

    private initializeMetrics(): ProcessingMetrics {
        return {
            recordsProcessed: 0,
            recordsFiltered: 0,
            recordsErrored: 0,
            bytesProcessed: 0,
            processingTime: 0,
            throughput: {
                recordsPerSecond: 0,
                bytesPerSecond: 0,
                avgBatchSize: 0,
                peakThroughput: 0
            },
            latency: {
                min: Infinity,
                max: 0,
                avg: 0,
                p50: 0,
                p95: 0,
                p99: 0,
                p999: 0
            },
            resourceUsage: {
                cpu: { usage: 0, cores: 0, throttling: 0 },
                memory: { used: 0, available: 0, gcTime: 0, gcCount: 0 },
                network: { bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0, errors: 0 },
                disk: { readBytes: 0, writeBytes: 0, readOps: 0, writeOps: 0, queueDepth: 0 }
            }
        };
    }

    private updateLatencyMetrics(latency: LatencyMetrics, value: number): void {
        latency.min = Math.min(latency.min, value);
        latency.max = Math.max(latency.max, value);

        // Update running average
        const count = this.latencySampleCount.get('global') || 0;
        latency.avg = (latency.avg * count + value) / (count + 1);
        this.latencySampleCount.set('global', count + 1);

        // Update percentiles (simplified - in production use proper percentile calculation)
        this.updatePercentiles(latency, value);
    }

    private updateThroughputMetrics(
        throughput: ThroughputMetrics,
        recordCount: number,
        timeMs: number
    ): void {
        const recordsPerSecond = (recordCount / timeMs) * 1000;
        const bytesPerSecond = (recordCount * 1024 / timeMs) * 1000; // Assuming 1KB average

        throughput.recordsPerSecond = recordsPerSecond;
        throughput.bytesPerSecond = bytesPerSecond;
        throughput.peakThroughput = Math.max(throughput.peakThroughput, recordsPerSecond);

        // Update average batch size
        const batchCount = this.batchCount.get('global') || 0;
        throughput.avgBatchSize = (throughput.avgBatchSize * batchCount + recordCount) / (batchCount + 1);
        this.batchCount.set('global', batchCount + 1);
    }

    private async createCheckpoint(
        streamId: string,
        offset: string,
        metrics: ProcessingMetrics
    ): Promise<Checkpoint> {
        const checkpoint: Checkpoint = {
            id: `cp_${streamId}_${Date.now()}`,
            timestamp: new Date(),
            offset,
            metadata: {
                recordsProcessed: metrics.recordsProcessed,
                bytesProcessed: metrics.bytesProcessed,
                errors: metrics.recordsErrored
            }
        };

        // Store checkpoint
        await this.storeCheckpoint(checkpoint);

        return checkpoint;
    }

    private async storeCheckpoint(checkpoint: Checkpoint): Promise<void> {
        // Implementation would store to configured checkpoint storage
        this.logger.debug(`Checkpoint created: ${checkpoint.id}`);
    }

    private calculateProgress(metrics: ProcessingMetrics, stream: DataStream): number {
        // For batch streams, calculate based on estimated total
        if (stream.type === 'batch' && stream.metadata.estimatedRecords) {
            return Math.min(100, (metrics.recordsProcessed / stream.metadata.estimatedRecords) * 100);
        }

        // For streaming, return 0-99 to indicate ongoing
        return Math.min(99, metrics.recordsProcessed > 0 ? 50 : 0);
    }

    private async getResourceMetrics(): Promise<ResourceMetrics> {
        // In production, this would query actual system metrics
        return {
            cpu: {
                usage: Math.random() * 100,
                cores: 4,
                throttling: Math.random() * 5
            },
            memory: {
                used: Math.random() * 8 * 1024 * 1024 * 1024, // 0-8GB
                available: 16 * 1024 * 1024 * 1024, // 16GB
                gcTime: Math.random() * 100,
                gcCount: Math.floor(Math.random() * 10)
            },
            network: {
                bytesIn: Math.random() * 1024 * 1024 * 100, // 0-100MB
                bytesOut: Math.random() * 1024 * 1024 * 50, // 0-50MB
                packetsIn: Math.random() * 10000,
                packetsOut: Math.random() * 5000,
                errors: Math.floor(Math.random() * 10)
            },
            disk: {
                readBytes: Math.random() * 1024 * 1024 * 200, // 0-200MB
                writeBytes: Math.random() * 1024 * 1024 * 100, // 0-100MB
                readOps: Math.random() * 1000,
                writeOps: Math.random() * 500,
                queueDepth: Math.random() * 32
            }
        };
    }

    private async checkAutoScaling(
        metrics: ProcessingMetrics,
        config: AutoScalingConfig
    ): Promise<void> {
        if (!config.enabled) return;

        const cpu = metrics.resourceUsage.cpu.usage;
        const memory = (metrics.resourceUsage.memory.used / metrics.resourceUsage.memory.available) * 100;
        const throughput = metrics.throughput.recordsPerSecond;

        let shouldScale = false;
        let scaleDirection: 'up' | 'down' = 'up';

        // Check if we need to scale up
        if (
            (config.targetCPU && cpu > config.targetCPU) ||
            (config.targetMemory && memory > config.targetMemory) ||
            (config.targetThroughput && throughput < config.targetThroughput)
        ) {
            shouldScale = true;
            scaleDirection = 'up';
        }

        // Check if we can scale down
        if (
            (config.targetCPU && cpu < config.targetCPU * 0.5) &&
            (config.targetMemory && memory < config.targetMemory * 0.5) &&
            (config.targetThroughput && throughput > config.targetThroughput * 1.5)
        ) {
            shouldScale = true;
            scaleDirection = 'down';
        }

        if (shouldScale) {
            await this.autoScale('global', scaleDirection);
        }
    }

    private async autoScale(target: string, direction: 'up' | 'down'): Promise<void> {
        this.logger.info(`Auto-scaling ${target} ${direction}`);
        // Implementation would trigger actual scaling
    }

    private async throttleStream(streamId: string, factor: number): Promise<void> {
        this.logger.info(`Throttling stream ${streamId} by factor ${factor}`);
        // Implementation would adjust stream processing rate
    }

    private calculateTrend(metric: string, streamId: string): number {
        // Simplified trend calculation
        return Math.random() * 20 - 10; // -10% to +10%
    }

    private calculateQualityScore(issues: QualityIssue[]): number {
        if (issues.length === 0) return 100;

        const totalIssues = issues.reduce((sum, issue) => sum + issue.count, 0);
        const avgPercentage = issues.reduce((sum, issue) => sum + issue.percentage, 0) / issues.length;

        return Math.max(0, 100 - avgPercentage);
    }

    private async writeBatchToSink(
        batch: ProcessedBatch,
        sinkConfig: SinkConfig,
        context: StreamContext
    ): Promise<SinkResult> {
        // Implementation would write to configured sink
        return {
            success: true,
            recordsWritten: batch.size(),
            location: {
                type: 'file',
                path: `s3://bucket/path/${context.streamId}/${Date.now()}.parquet`,
                format: 'parquet',
                size: batch.sizeInBytes(),
                recordCount: batch.size()
            }
        };
    }

    private async finalizeProcessing(streamId: string, result: ProcessingResult): Promise<void> {
        // Store final metrics
        this.processingMetrics.set(streamId, result.metrics);

        // Send completion notification
        await this.alertManager.sendNotification({
            type: 'processing-complete',
            streamId,
            status: result.status.state,
            metrics: {
                recordsProcessed: result.metrics.recordsProcessed,
                duration: result.metrics.processingTime,
                errors: result.errors.length
            }
        });

        // Cleanup resources
        await this.cleanup(streamId);
    }

    private async cleanup(streamId: string): Promise<void> {
        this.activeStreams.delete(streamId);
        this.processingMetrics.delete(streamId);
        // Additional cleanup as needed
    }

    private startMetricsCollection(streamId: string): void {
        // Start periodic metrics collection
        const interval = setInterval(() => {
            if (!this.activeStreams.has(streamId)) {
                clearInterval(interval);
                return;
            }

            const metrics = this.getStreamMetrics(streamId);
            this.metricsCollector.collect(streamId, metrics);
        }, 1000); // Collect every second
    }

    private getStreamMetrics(streamId: string): ProcessingMetrics {
        return this.processingMetrics.get(streamId) || this.initializeMetrics();
    }

    // Placeholder properties and methods
    private latencySampleCount = new Map<string, number>();
    private batchCount = new Map<string, number>();

    private updatePercentiles(latency: LatencyMetrics, value: number): void {
        // Simplified percentile update - in production use proper algorithm
        latency.p50 = (latency.p50 + value) / 2;
        latency.p95 = Math.max(latency.p95, value * 0.95);
        latency.p99 = Math.max(latency.p99, value * 0.99);
        latency.p999 = Math.max(latency.p999, value * 0.999);
    }
}

// Supporting classes (placeholders)
class KafkaStreamProcessor {
    constructor(config: any) { }
    async subscribe(source: any, options: any): Promise<any> {
        return { fetchBatch: async () => ({ isEmpty: () => false, size: () => 1000, sizeInBytes: () => 1024000 }) };
    }
}

class MLPipelineOrchestrator {
    constructor() { }
}

class DataComplianceEngine {
    constructor() { }
}

class AnomalyDetectionSystem {
    constructor() { }
    async detect(params: any): Promise<Anomaly[]> {
        return [];
    }
}

class DataQualityChecker {
    constructor() { }
    async getCurrentIssues(streamId: string): Promise<QualityIssue[]> {
        return [];
    }
}

class TransformationEngine {
    constructor() { }
}

class MetricsCollector {
    constructor(config: any) { }
    collect(streamId: string, metrics: any): void { }
}

class AlertManager {
    constructor() { }
    async sendAlert(alert: any): Promise<void> { }
    async sendNotification(notification: any): Promise<void> { }
}

class Logger {
    info(message: string, data?: any): void { console.log(message, data); }
    warn(message: string, data?: any): void { console.warn(message, data); }
    error(message: string, error?: any): void { console.error(message, error); }
    debug(message: string, data?: any): void { console.debug(message, data); }
}

interface StreamContext {
    streamId: string;
    pipelineId: string;
    status: any;
    progress: number;
    currentStage?: string;
    checkpoints: Checkpoint[];
    lastOffset?: string;
    queueDepth: number;
    config: ProcessingConfig;
}

interface ProcessingPipeline {
    addStage(stage: any): void;
    setParallelism(value: number): void;
    setCheckpointing(config: any): void;
    setErrorHandling(config: any): void;
    process(batch: any, context: any): Promise<any>;
    shutdown(): Promise<void>;
}

interface ProcessingStage {
    // Stage interface
}

interface DataBatch {
    isEmpty(): boolean;
    size(): number;
    sizeInBytes(): number;
    sample(count: number): any[];
    lastOffset(): string;
}

interface ProcessedBatch extends DataBatch {
    hasErrors(): boolean;
    getErrors(): ProcessingError[];
    hasRecords(): boolean;
}

interface SinkConfig {
    type: string;
    config: Record<string, any>;
}

interface SinkResult {
    success: boolean;
    recordsWritten: number;
    location?: OutputLocation;
}

interface QualityIssue {
    type: string;
    field?: string;
    count: number;
    percentage: number;
    samples: any[];
}

interface AutoScalingConfig {
    enabled: boolean;
    minInstances: number;
    maxInstances: number;
    targetCPU?: number;
    targetMemory?: number;
    targetThroughput?: number;
}

class ProcessingPipeline implements ProcessingPipeline {
    private stages: ProcessingStage[] = [];

    addStage(stage: ProcessingStage): void {
        this.stages.push(stage);
    }

    setParallelism(value: number): void { }
    setCheckpointing(config: any): void { }
    setErrorHandling(config: any): void { }

    async process(batch: any, context: any): Promise<any> {
        return batch;
    }

    async shutdown(): Promise<void> { }
}