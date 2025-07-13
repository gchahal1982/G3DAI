/**
 * Medical Data Pipeline Integration Library - MedSight Pro
 * Connects frontend to backend MedicalDataPipeline.ts for real-time data processing
 * 
 * Features:
 * - Real-time medical data streaming
 * - Data transformation and validation
 * - Multi-source data integration
 * - Automated data routing and processing
 * - Real-time analytics and monitoring
 * - Medical compliance and audit integration
 */

import { MedicalDataPipeline } from '@/core/MedicalDataPipeline';
import { MedicalAuthService } from '@/lib/auth/medical-auth';
import { ComplianceAuditTrail } from '@/lib/compliance/audit-trail';

// Medical Data Pipeline Data Structures
export interface DataPipeline {
  id: string;
  name: string;
  description: string;
  type: 'real_time' | 'batch' | 'hybrid' | 'event_driven';
  category: 'clinical' | 'imaging' | 'laboratory' | 'monitoring' | 'administrative';
  status: 'active' | 'paused' | 'stopped' | 'error' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  sources: DataSource[];
  transformations: DataTransformation[];
  destinations: DataDestination[];
  filters: DataFilter[];
  validations: DataValidation[];
  routing: RoutingRule[];
  scheduling: ScheduleConfig;
  monitoring: MonitoringConfig;
  compliance: ComplianceConfig;
  performance: PerformanceMetrics;
  retryPolicy: RetryPolicy;
  errorHandling: ErrorHandlingConfig;
  isTemplate: boolean;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  nextRun?: Date;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'dicom' | 'hl7' | 'fhir' | 'database' | 'api' | 'file' | 'stream' | 'sensor';
  connectionString: string;
  configuration: SourceConfiguration;
  authentication: AuthenticationConfig;
  dataFormat: 'json' | 'xml' | 'csv' | 'binary' | 'dicom' | 'hl7' | 'custom';
  compression?: string;
  encryption?: string;
  batchSize?: number;
  pollInterval?: number;
  isActive: boolean;
  lastSyncTime?: Date;
  errorCount: number;
  totalRecords: number;
}

export interface SourceConfiguration {
  host?: string;
  port?: number;
  database?: string;
  schema?: string;
  table?: string;
  query?: string;
  endpoint?: string;
  headers?: Record<string, string>;
  parameters?: Record<string, any>;
  customConfig?: Record<string, any>;
}

export interface AuthenticationConfig {
  type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth' | 'certificate' | 'custom';
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  certificate?: string;
  privateKey?: string;
  customAuth?: Record<string, any>;
}

export interface DataTransformation {
  id: string;
  name: string;
  type: 'mapping' | 'filtering' | 'aggregation' | 'enrichment' | 'normalization' | 'custom';
  order: number;
  isActive: boolean;
  configuration: TransformationConfig;
  inputSchema?: string;
  outputSchema?: string;
  errorHandling: 'skip' | 'fail' | 'log' | 'retry';
  performance: TransformationMetrics;
}

export interface TransformationConfig {
  mappingRules?: MappingRule[];
  filterConditions?: FilterCondition[];
  aggregationConfig?: AggregationConfig;
  enrichmentRules?: EnrichmentRule[];
  normalizationRules?: NormalizationRule[];
  customScript?: string;
  parameters?: Record<string, any>;
}

export interface MappingRule {
  sourceField: string;
  targetField: string;
  transformation?: string;
  defaultValue?: any;
  required: boolean;
  validation?: string;
}

export interface FilterCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex' | 'exists';
  value: any;
  logicalOperator?: 'and' | 'or' | 'not';
}

export interface AggregationConfig {
  groupBy: string[];
  aggregations: {
    field: string;
    function: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct';
    alias?: string;
  }[];
  timeWindow?: number;
  triggerCondition?: string;
}

export interface EnrichmentRule {
  sourceField: string;
  enrichmentSource: string;
  lookupKey: string;
  targetFields: string[];
  cacheTimeout?: number;
  fallbackValue?: any;
}

export interface NormalizationRule {
  field: string;
  type: 'standardize' | 'format' | 'validate' | 'convert';
  targetFormat: string;
  validationRules?: string[];
  conversionMap?: Record<string, any>;
}

export interface DataDestination {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'stream' | 'queue' | 'webhook' | 'email' | 'dashboard';
  connectionString: string;
  configuration: DestinationConfiguration;
  authentication: AuthenticationConfig;
  outputFormat: 'json' | 'xml' | 'csv' | 'binary' | 'custom';
  batchSize?: number;
  bufferTimeout?: number;
  isActive: boolean;
  errorCount: number;
  successCount: number;
  lastDelivery?: Date;
}

export interface DestinationConfiguration {
  host?: string;
  port?: number;
  database?: string;
  table?: string;
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
  filePath?: string;
  fileName?: string;
  queueName?: string;
  topicName?: string;
  customConfig?: Record<string, any>;
}

export interface DataFilter {
  id: string;
  name: string;
  description: string;
  conditions: FilterCondition[];
  action: 'include' | 'exclude' | 'route' | 'transform';
  priority: number;
  isActive: boolean;
  applyOrder: 'pre_transform' | 'post_transform' | 'pre_destination';
}

export interface DataValidation {
  id: string;
  name: string;
  type: 'schema' | 'business' | 'reference' | 'format' | 'custom';
  rules: ValidationRule[];
  onFailure: 'reject' | 'flag' | 'correct' | 'route';
  severity: 'error' | 'warning' | 'info';
  isActive: boolean;
}

export interface ValidationRule {
  field: string;
  rule: string;
  parameters?: any[];
  message: string;
  correctiveAction?: string;
}

export interface RoutingRule {
  id: string;
  name: string;
  conditions: FilterCondition[];
  destination: string;
  transformation?: string;
  priority: number;
  isActive: boolean;
}

export interface ScheduleConfig {
  type: 'immediate' | 'interval' | 'cron' | 'event' | 'manual';
  interval?: number;
  cronExpression?: string;
  eventTrigger?: string;
  timezone?: string;
  startDate?: Date;
  endDate?: Date;
  maxRuns?: number;
  isActive: boolean;
}

export interface MonitoringConfig {
  enableMetrics: boolean;
  enableAlerts: boolean;
  alertThresholds: AlertThreshold[];
  healthChecks: HealthCheck[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  retentionPeriod: number;
  dashboardConfig?: DashboardConfig;
}

export interface AlertThreshold {
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'email' | 'sms' | 'webhook' | 'page';
  cooldown: number;
}

export interface HealthCheck {
  name: string;
  type: 'connectivity' | 'latency' | 'throughput' | 'data_quality' | 'custom';
  configuration: Record<string, any>;
  frequency: number;
  timeout: number;
  retryCount: number;
}

export interface DashboardConfig {
  widgets: DashboardWidget[];
  refreshInterval: number;
  autoRefresh: boolean;
  layout: string;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'status';
  title: string;
  configuration: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
}

export interface ComplianceConfig {
  enableAuditTrail: boolean;
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  retentionPolicy: RetentionPolicy;
  encryptionRequired: boolean;
  anonymizationRules: AnonymizationRule[];
  consentTracking: boolean;
  regulatoryCompliance: string[];
}

export interface RetentionPolicy {
  retentionPeriod: number;
  archiveAfter: number;
  deleteAfter: number;
  backupRequired: boolean;
  compressionEnabled: boolean;
}

export interface AnonymizationRule {
  field: string;
  method: 'hash' | 'encrypt' | 'mask' | 'remove' | 'generalize';
  parameters?: Record<string, any>;
  preserveFormat: boolean;
}

export interface PerformanceMetrics {
  totalRecordsProcessed: number;
  averageProcessingTime: number;
  throughputPerSecond: number;
  errorRate: number;
  successRate: number;
  uptime: number;
  lastPerformanceCheck: Date;
  bottlenecks: string[];
  recommendations: string[];
}

export interface RetryPolicy {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  maxRetryDelay: number;
  retryableErrors: string[];
  deadLetterQueue?: string;
}

export interface ErrorHandlingConfig {
  onError: 'stop' | 'continue' | 'retry' | 'route';
  errorDestination?: string;
  notificationLevel: 'none' | 'errors_only' | 'all';
  errorLogRetention: number;
  automaticRecovery: boolean;
  recoveryAttempts: number;
}

// Pipeline Execution Data Structures
export interface PipelineExecution {
  id: string;
  pipelineId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  trigger: 'manual' | 'scheduled' | 'event' | 'api';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  bytesProcessed: number;
  executionLog: ExecutionLogEntry[];
  errors: ExecutionError[];
  performance: ExecutionPerformance;
  context: ExecutionContext;
}

export interface ExecutionLogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  component: string;
  message: string;
  data?: any;
  duration?: number;
}

export interface ExecutionError {
  timestamp: Date;
  component: string;
  error: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  recordId?: string;
  stackTrace?: string;
}

export interface ExecutionPerformance {
  sourceReadTime: number;
  transformationTime: number;
  validationTime: number;
  destinationWriteTime: number;
  totalTime: number;
  memoryUsage: number;
  cpuUsage: number;
  throughput: number;
}

export interface ExecutionContext {
  userId: string;
  sessionId?: string;
  parameters?: Record<string, any>;
  environment: string;
  version: string;
  correlationId?: string;
}

export interface TransformationMetrics {
  totalRecords: number;
  transformedRecords: number;
  skippedRecords: number;
  errorRecords: number;
  averageTransformTime: number;
  lastTransformTime: Date;
}

// Medical Data Pipeline Integration Class
export class MedicalDataPipelineIntegration {
  private pipeline: MedicalDataPipeline;
  private auth: MedicalAuthService;
  private auditTrail: ComplianceAuditTrail;
  private pipelineCache: Map<string, DataPipeline> = new Map();
  private executionCache: Map<string, PipelineExecution> = new Map();
  private activeExecutions: Set<string> = new Set();
  private subscriptions: Map<string, Set<(event: PipelineEvent) => void>> = new Map();
  private realTimeStreams: Map<string, any> = new Map();

  constructor() {
    this.pipeline = new MedicalDataPipeline();
    this.auth = MedicalAuthService.getInstance();
    this.auditTrail = new ComplianceAuditTrail();
    this.initializeEventListeners();
  }

  // Pipeline Management
  async createPipeline(pipeline: Omit<DataPipeline, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<DataPipeline | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required for pipeline creation');
    }

    // Check permissions
    if (!await this.auth.hasPermission(user.id, 'pipeline:create')) {
      throw new Error('Insufficient permissions to create pipelines');
    }

    try {
      const pipelineId = `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newPipeline: DataPipeline = {
        ...pipeline,
        id: pipelineId,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const success = await this.pipeline.createPipeline(newPipeline);
      
      if (success) {
        // Cache the pipeline
        this.pipelineCache.set(pipelineId, newPipeline);
        
        // Log creation
        await this.auditTrail.logActivity({
          action: 'medical_pipeline_create',
          resourceType: 'data_pipeline',
          resourceId: pipelineId,
          userId: user.id,
          details: {
            pipelineName: pipeline.name,
            pipelineType: pipeline.type,
            category: pipeline.category,
            sourceCount: pipeline.sources.length,
            destinationCount: pipeline.destinations.length
          }
        });
        
        return newPipeline;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating medical data pipeline:', error);
      return null;
    }
  }

  async getPipeline(pipelineId: string): Promise<DataPipeline | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check cache first
    if (this.pipelineCache.has(pipelineId)) {
      return this.pipelineCache.get(pipelineId)!;
    }

    try {
      const pipeline = await this.pipeline.getPipeline(pipelineId);
      
      if (pipeline) {
        // Cache the pipeline
        this.pipelineCache.set(pipelineId, pipeline);
        
        // Log access
        await this.auditTrail.logActivity({
          action: 'medical_pipeline_access',
          resourceType: 'data_pipeline',
          resourceId: pipelineId,
          userId: user.id,
          details: {
            pipelineName: pipeline.name,
            pipelineType: pipeline.type,
            status: pipeline.status
          }
        });
      }
      
      return pipeline;
    } catch (error) {
      console.error('Error fetching pipeline:', error);
      return null;
    }
  }

  async getPipelines(filters?: {
    type?: string;
    category?: string;
    status?: string;
    tags?: string[];
  }): Promise<DataPipeline[]> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const pipelines = await this.pipeline.getPipelines(filters);
      
      // Cache pipelines
      pipelines.forEach(pipeline => {
        this.pipelineCache.set(pipeline.id, pipeline);
      });
      
      // Log query
      await this.auditTrail.logActivity({
        action: 'medical_pipeline_query',
        resourceType: 'data_pipeline_list',
        resourceId: 'query',
        userId: user.id,
        details: {
          filters,
          resultCount: pipelines.length
        }
      });
      
      return pipelines;
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      return [];
    }
  }

  // Pipeline Execution
  async startPipeline(
    pipelineId: string, 
    options?: {
      parameters?: Record<string, any>;
      override?: Partial<DataPipeline>;
      dryRun?: boolean;
    }
  ): Promise<PipelineExecution | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required for pipeline execution');
    }

    // Check permissions
    if (!await this.auth.hasPermission(user.id, 'pipeline:execute')) {
      throw new Error('Insufficient permissions to execute pipelines');
    }

    try {
      const executionId = `execution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const execution = await this.pipeline.startPipeline(
        pipelineId, 
        executionId,
        {
          ...options,
          userId: user.id
        }
      );
      
      if (execution) {
        // Cache the execution
        this.executionCache.set(executionId, execution);
        this.activeExecutions.add(executionId);
        
        // Log start
        await this.auditTrail.logActivity({
          action: 'medical_pipeline_start',
          resourceType: 'pipeline_execution',
          resourceId: executionId,
          userId: user.id,
          details: {
            pipelineId,
            dryRun: options?.dryRun || false,
            parameters: options?.parameters ? Object.keys(options.parameters) : []
          }
        });
        
        // Emit event
        this.emitEvent('pipeline_started', {
          type: 'pipeline_started',
          executionId,
          pipelineId,
          timestamp: new Date()
        });
        
        return execution;
      }
      
      return null;
    } catch (error) {
      console.error('Error starting pipeline:', error);
      return null;
    }
  }

  async stopPipeline(executionId: string, reason?: string): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.pipeline.stopPipeline(executionId, reason);
      
      if (success) {
        // Update cache
        const execution = this.executionCache.get(executionId);
        if (execution) {
          execution.status = 'cancelled';
          execution.endTime = new Date();
          execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
          this.executionCache.set(executionId, execution);
        }
        
        this.activeExecutions.delete(executionId);
        
        // Log stop
        await this.auditTrail.logActivity({
          action: 'medical_pipeline_stop',
          resourceType: 'pipeline_execution',
          resourceId: executionId,
          userId: user.id,
          details: { reason }
        });
        
        // Emit event
        this.emitEvent('pipeline_stopped', {
          type: 'pipeline_stopped',
          executionId,
          // reason,
          timestamp: new Date()
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error stopping pipeline:', error);
      return false;
    }
  }

  async pausePipeline(executionId: string): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.pipeline.pausePipeline(executionId);
      
      if (success) {
        // Update cache
        const execution = this.executionCache.get(executionId);
        if (execution) {
          execution.status = 'paused';
          this.executionCache.set(executionId, execution);
        }
        
        // Log pause
        await this.auditTrail.logActivity({
          action: 'medical_pipeline_pause',
          resourceType: 'pipeline_execution',
          resourceId: executionId,
          userId: user.id,
          details: {}
        });
        
        // Emit event
        this.emitEvent('pipeline_paused', {
          type: 'pipeline_paused',
          executionId,
          timestamp: new Date()
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error pausing pipeline:', error);
      return false;
    }
  }

  async resumePipeline(executionId: string): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.pipeline.resumePipeline(executionId);
      
      if (success) {
        // Update cache
        const execution = this.executionCache.get(executionId);
        if (execution) {
          execution.status = 'running';
          this.executionCache.set(executionId, execution);
        }
        
        this.activeExecutions.add(executionId);
        
        // Log resume
        await this.auditTrail.logActivity({
          action: 'medical_pipeline_resume',
          resourceType: 'pipeline_execution',
          resourceId: executionId,
          userId: user.id,
          details: {}
        });
        
        // Emit event
        this.emitEvent('pipeline_resumed', {
          type: 'pipeline_resumed',
          executionId,
          timestamp: new Date()
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error resuming pipeline:', error);
      return false;
    }
  }

  // Real-time Data Streaming
  async createRealTimeStream(
    pipelineId: string, 
    streamConfig: {
      dataTypes: string[];
      filters?: FilterCondition[];
      bufferSize?: number;
      maxLatency?: number;
    }
  ): Promise<string | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const streamId = await this.pipeline.createRealTimeStream(pipelineId, streamConfig);
      
      if (streamId) {
        // Cache stream reference
        this.realTimeStreams.set(streamId, { pipelineId, ...streamConfig });
        
        // Log stream creation
        await this.auditTrail.logActivity({
          action: 'real_time_stream_create',
          resourceType: 'data_stream',
          resourceId: streamId,
          userId: user.id,
          details: {
            pipelineId,
            dataTypes: streamConfig.dataTypes,
            filterCount: streamConfig.filters?.length || 0
          }
        });
      }
      
      return streamId;
    } catch (error) {
      console.error('Error creating real-time stream:', error);
      return null;
    }
  }

  async subscribeToStream(
    streamId: string, 
    callback: (data: any) => void,
    errorCallback?: (error: Error) => void
  ): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.pipeline.subscribeToStream(streamId, callback, errorCallback);
      
      if (success) {
        // Log subscription
        await this.auditTrail.logActivity({
          action: 'real_time_stream_subscribe',
          resourceType: 'data_stream',
          resourceId: streamId,
          userId: user.id,
          details: {}
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error subscribing to stream:', error);
      return false;
    }
  }

  async unsubscribeFromStream(streamId: string): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.pipeline.unsubscribeFromStream(streamId);
      
      if (success) {
        // Log unsubscription
        await this.auditTrail.logActivity({
          action: 'real_time_stream_unsubscribe',
          resourceType: 'data_stream',
          resourceId: streamId,
          userId: user.id,
          details: {}
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error unsubscribing from stream:', error);
      return false;
    }
  }

  // Monitoring and Analytics
  async getExecutionMetrics(executionId: string): Promise<ExecutionPerformance | null> {
    try {
      return await this.pipeline.getExecutionMetrics(executionId);
    } catch (error) {
      console.error('Error fetching execution metrics:', error);
      return null;
    }
  }

  async getPipelineMetrics(pipelineId: string, dateRange?: { from: Date; to: Date }): Promise<PerformanceMetrics | null> {
    try {
      return await this.pipeline.getPipelineMetrics(pipelineId, dateRange);
    } catch (error) {
      console.error('Error fetching pipeline metrics:', error);
      return null;
    }
  }

  async getSystemMetrics(): Promise<any> {
    try {
      return await this.pipeline.getSystemMetrics();
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      return null;
    }
  }

  // Event Management
  subscribe(eventType: string, callback: (event: PipelineEvent) => void): void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    this.subscriptions.get(eventType)!.add(callback);
  }

  unsubscribe(eventType: string, callback: (event: PipelineEvent) => void): void {
    const callbacks = this.subscriptions.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emitEvent(eventType: string, event: PipelineEvent): void {
    const callbacks = this.subscriptions.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  private initializeEventListeners(): void {
    // Set up real-time event listeners from the backend
    this.pipeline.onPipelineEvent((event) => {
      this.handleBackendEvent(event);
    });
  }

  private handleBackendEvent(event: any): void {
    // Handle events from the backend pipeline
    switch (event.type) {
      case 'execution_completed':
        this.activeExecutions.delete(event.executionId);
        break;
      case 'execution_failed':
        this.activeExecutions.delete(event.executionId);
        break;
      case 'data_quality_alert':
        // Handle data quality issues
        break;
      case 'performance_alert':
        // Handle performance issues
        break;
    }
    
    // Forward event to subscribers
    this.emitEvent(event.type, event);
  }

  // Cleanup
  async cleanup(): Promise<void> {
    try {
      // Stop all active executions
      for (const executionId of this.activeExecutions) {
        await this.stopPipeline(executionId, 'System cleanup');
      }
      
      // Close all real-time streams
      for (const streamId of this.realTimeStreams.keys()) {
        await this.unsubscribeFromStream(streamId);
      }
      
      await this.pipeline.cleanup();
      this.pipelineCache.clear();
      this.executionCache.clear();
      this.activeExecutions.clear();
      this.subscriptions.clear();
      this.realTimeStreams.clear();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Getters
  getActivePipelines(): DataPipeline[] {
    return Array.from(this.pipelineCache.values())
      .filter(pipeline => pipeline.status === 'active');
  }

  getActiveExecutions(): PipelineExecution[] {
    return Array.from(this.activeExecutions)
      .map(id => this.executionCache.get(id))
      .filter(execution => execution !== undefined) as PipelineExecution[];
  }

  getRealTimeStreams(): string[] {
    return Array.from(this.realTimeStreams.keys());
  }

  getCachedPipelines(): DataPipeline[] {
    return Array.from(this.pipelineCache.values());
  }

  getCachedExecutions(): PipelineExecution[] {
    return Array.from(this.executionCache.values());
  }
}

// Event interfaces
export interface PipelineEvent {
  type: string;
  executionId?: string;
  pipelineId?: string;
  data?: any;
  error?: string;
  timestamp: Date;
}

// Export singleton instance
export const medicalDataPipelineIntegration = new MedicalDataPipelineIntegration();
export default medicalDataPipelineIntegration; 