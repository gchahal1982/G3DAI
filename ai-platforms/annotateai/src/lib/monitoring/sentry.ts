// Mock Sentry implementation for development
const Sentry = {
  init: (config: any) => {},
  captureException: (error: Error, config?: any) => 'mock-error-id',
  captureMessage: (message: string, config?: any) => 'mock-message-id',
  setUser: (user: any) => {},
  setContext: (key: string, context: any) => {},
  setTag: (key: string, value: string) => {},
  setTags: (tags: any) => {},
  addBreadcrumb: (breadcrumb: any) => {},
  startTransaction: (config: any) => ({ finish: () => {} }),
  replayIntegration: () => ({}),
  browserTracingIntegration: (config: any) => ({}),
  httpIntegration: (config: any) => ({}),
  metrics: {
    gauge: (name: string, value: number, options?: any) => {}
  }
};

export interface ErrorContext {
  userId?: string;
  organizationId?: string;
  projectId?: string;
  annotationId?: string;
  sessionId?: string;
  feature?: string;
  action?: string;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
  buildVersion?: string;
  environment: 'development' | 'staging' | 'production';
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  tags?: Record<string, string>;
  timestamp: string;
  context?: Partial<ErrorContext>; // Changed to Partial<ErrorContext>
}

export interface CustomEvent {
  type: 'annotation_created' | 'annotation_updated' | 'project_created' | 'export_completed' | 'collaboration_event' | 'ai_inference' | 'quality_check' | 'user_action';
  properties: Record<string, any>;
  context: ErrorContext;
  severity: 'info' | 'warning' | 'error' | 'critical';
  fingerprint?: string[];
}

export interface ReleaseInfo {
  version: string;
  environment: string;
  commits?: Array<{
    id: string;
    message: string;
    author: string;
    timestamp: string;
  }>;
  deployedAt: string;
  features?: string[];
  bugFixes?: string[];
}

export class ErrorMonitoring {
  private isInitialized: boolean = false;
  private performanceMetrics: PerformanceMetric[] = [];
  private customEvents: CustomEvent[] = [];
  private userContext: Partial<ErrorContext> = {};
  private releaseInfo?: ReleaseInfo;

  constructor() {
    this.initializeSentry();
  }

  private initializeSentry(): void {
    if (this.isInitialized) return;

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      
      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Session replay for debugging
      replaysSessionSampleRate: 0.01,
      replaysOnErrorSampleRate: 0.1,
      
      // Error filtering
      beforeSend: (event, hint) => {
        return this.filterSensitiveData(event, hint);
      },
      
      // Performance filtering
      beforeSendTransaction: (event) => {
        return this.filterPerformanceData(event);
      },
      
      // Additional configuration
      integrations: [
        Sentry.replayIntegration(),
        Sentry.browserTracingIntegration({
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/api\.annotateai\.com/,
            /^https:\/\/app\.annotateai\.com/
          ]
        }),
        Sentry.httpIntegration({
          tracing: true
        })
      ],
      
      // Tags for all events
      initialScope: {
        tags: {
          component: 'annotateai',
          platform: 'web',
          framework: 'nextjs'
        }
      }
    });

    this.isInitialized = true;
  }

  // Error Reporting
  public captureError(error: Error, context?: Partial<ErrorContext>): string {
    const errorId = Sentry.captureException(error, {
      contexts: {
        app: {
          ...this.userContext,
          ...context,
          timestamp: new Date().toISOString()
        }
      },
      tags: {
        feature: context?.feature,
        action: context?.action,
        environment: context?.environment || process.env.NODE_ENV
      },
      user: context?.userId ? {
        id: context.userId,
        ip_address: context.ipAddress,
        organizationId: context.organizationId
      } : undefined,
      fingerprint: this.generateErrorFingerprint(error, context)
    });

    // Log locally for development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', error, 'Context:', context, 'Error ID:', errorId);
    }

    return errorId;
  }

  public captureMessage(message: string, level: 'info' | 'warning' | 'error' | 'debug' = 'info', context?: Partial<ErrorContext>): string {
    const messageId = Sentry.captureMessage(message, {
      level,
      contexts: {
        app: {
          ...this.userContext,
          ...context,
          timestamp: new Date().toISOString()
        }
      },
      tags: {
        feature: context?.feature,
        action: context?.action,
        environment: context?.environment || process.env.NODE_ENV
      }
    });

    return messageId;
  }

  // Performance Monitoring
  public startTransaction(name: string, op: string, context?: Partial<ErrorContext>): any {
    const transaction = Sentry.startTransaction({
      name,
      op,
      tags: {
        feature: context?.feature,
        action: context?.action
      },
      data: context
    });

    return transaction;
  }

  public recordPerformanceMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const performanceMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date().toISOString()
    };

    this.performanceMetrics.push(performanceMetric);

    // Send to Sentry as custom metric
    Sentry.metrics.gauge(metric.name, metric.value, {
      unit: metric.unit,
      tags: metric.tags
    });

    // Log annotation-specific metrics
    if (metric.name.startsWith('annotation_')) {
      this.recordAnnotationMetric(performanceMetric);
    }
  }

  public measureExecutionTime<T>(name: string, fn: () => Promise<T>, context?: Partial<ErrorContext>): Promise<T> {
    const start = Date.now();
    
    return fn().then(
      (result) => {
        const duration = Date.now() - start;
        this.recordPerformanceMetric({
          name: `${name}_duration`,
          value: duration,
          unit: 'ms',
          context
        });
        return result;
      },
      (error) => {
        const duration = Date.now() - start;
        this.recordPerformanceMetric({
          name: `${name}_duration_error`,
          value: duration,
          unit: 'ms',
          context
        });
        this.captureError(error, { ...context, action: name });
        throw error;
      }
    );
  }

  // User Context Management
  public setUserContext(context: Partial<ErrorContext>): void {
    this.userContext = { ...this.userContext, ...context };

    Sentry.setUser({
      id: context.userId,
      ip_address: context.ipAddress
    });

    Sentry.setContext('app', {
      organizationId: context.organizationId,
      projectId: context.projectId,
      sessionId: context.sessionId,
      buildVersion: context.buildVersion,
      environment: context.environment
    });

    Sentry.setTags({
      feature: context.feature,
      organizationId: context.organizationId,
      environment: context.environment || process.env.NODE_ENV
    });
  }

  public clearUserContext(): void {
    this.userContext = {};
    Sentry.setUser(null);
    Sentry.setContext('app', null);
  }

  // Custom Events
  public recordCustomEvent(event: Omit<CustomEvent, 'context'>, context?: Partial<ErrorContext>): void {
    const customEvent: CustomEvent = {
      ...event,
      context: {
        ...this.userContext,
        ...context,
        timestamp: new Date().toISOString(),
        environment: context?.environment || process.env.NODE_ENV as any
      }
    };

    this.customEvents.push(customEvent);

    // Send to Sentry
    Sentry.addBreadcrumb({
      category: 'custom_event',
      message: `${event.type}: ${JSON.stringify(event.properties)}`,
      level: event.severity === 'critical' ? 'error' : event.severity as any,
      data: event.properties,
      timestamp: new Date(customEvent.context.timestamp).getTime() / 1000
    });

    // Send as custom event for critical events
    if (event.severity === 'critical' || event.severity === 'error') {
      this.captureMessage(`Custom event: ${event.type}`, event.severity === 'critical' ? 'error' : 'warning', customEvent.context);
    }
  }

  // Annotation-specific monitoring
  public recordAnnotationEvent(
    type: 'created' | 'updated' | 'deleted' | 'exported' | 'reviewed' | 'approved' | 'rejected',
    annotationId: string,
    metadata: Record<string, any> = {}
  ): void {
    this.recordCustomEvent({
      type: 'annotation_created',
      properties: {
        action: type,
        annotationId,
        annotationType: metadata.type,
        category: metadata.category,
        confidence: metadata.confidence,
        duration: metadata.duration,
        toolUsed: metadata.tool,
        collaborators: metadata.collaborators
      },
      severity: 'info'
    });

    // Track annotation quality metrics
    if (metadata.confidence) {
      this.recordPerformanceMetric({
        name: 'annotation_confidence',
        value: metadata.confidence,
        unit: 'percentage',
        tags: {
          type: metadata.type,
          category: metadata.category
        }
      });
    }
  }

  public recordAIInferenceEvent(
    modelName: string,
    inferenceTime: number,
    accuracy?: number,
    metadata: Record<string, any> = {}
  ): void {
    this.recordCustomEvent({
      type: 'ai_inference',
      properties: {
        modelName,
        inferenceTime,
        accuracy,
        imageSize: metadata.imageSize,
        batchSize: metadata.batchSize,
        gpuUsed: metadata.gpuUsed,
        errorCount: metadata.errorCount
      },
      severity: metadata.errorCount > 0 ? 'warning' : 'info'
    });

    this.recordPerformanceMetric({
      name: 'ai_inference_time',
      value: inferenceTime,
      unit: 'ms',
      tags: {
        model: modelName,
        gpu: metadata.gpuUsed ? 'true' : 'false'
      }
    });

    if (accuracy) {
      this.recordPerformanceMetric({
        name: 'ai_model_accuracy',
        value: accuracy,
        unit: 'percentage',
        tags: {
          model: modelName
        }
      });
    }
  }

  public recordCollaborationEvent(
    type: 'user_joined' | 'user_left' | 'conflict_detected' | 'conflict_resolved' | 'comment_added',
    userCount: number,
    metadata: Record<string, any> = {}
  ): void {
    this.recordCustomEvent({
      type: 'collaboration_event',
      properties: {
        action: type,
        activeUsers: userCount,
        conflictType: metadata.conflictType,
        resolutionMethod: metadata.resolutionMethod,
        sessionDuration: metadata.sessionDuration
      },
      severity: type === 'conflict_detected' ? 'warning' : 'info'
    });
  }

  // Release Management
  public setRelease(releaseInfo: ReleaseInfo): void {
    this.releaseInfo = releaseInfo;

    Sentry.setTag('release', releaseInfo.version);
    Sentry.setContext('release', {
      version: releaseInfo.version,
      environment: releaseInfo.environment,
      deployedAt: releaseInfo.deployedAt,
      features: releaseInfo.features,
      bugFixes: releaseInfo.bugFixes
    });
  }

  public recordDeployment(environment: string, version: string): void {
    this.recordCustomEvent({
      type: 'user_action',
      properties: {
        action: 'deployment',
        environment,
        version,
        timestamp: new Date().toISOString()
      },
      severity: 'info'
    });
  }

  // Analytics & Insights
  public getPerformanceMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): PerformanceMetric[] {
    const cutoff = this.getTimeRangeCutoff(timeRange);
    return this.performanceMetrics.filter(metric => 
      new Date(metric.timestamp) >= cutoff
    );
  }

  public getErrorSummary(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): any {
    // This would typically fetch from Sentry API
    return {
      totalErrors: 0,
      uniqueErrors: 0,
      affectedUsers: 0,
      errorRate: 0,
      topErrors: [],
      timeRange
    };
  }

  public getCustomEvents(type?: CustomEvent['type'], timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): CustomEvent[] {
    const cutoff = this.getTimeRangeCutoff(timeRange);
    return this.customEvents.filter(event => {
      const eventTime = new Date(event.context.timestamp);
      const typeMatch = !type || event.type === type;
      return eventTime >= cutoff && typeMatch;
    });
  }

  // Health Monitoring
  public recordHealthCheck(service: string, status: 'healthy' | 'degraded' | 'unhealthy', responseTime: number): void {
    this.recordPerformanceMetric({
      name: 'service_health_response_time',
      value: responseTime,
      unit: 'ms',
      tags: {
        service,
        status
      }
    });

    if (status !== 'healthy') {
      this.captureMessage(`Service ${service} is ${status}`, status === 'unhealthy' ? 'error' : 'warning', {
        feature: 'health_check',
        action: 'check_service'
      });
    }
  }

  public recordDatabasePerformance(operation: string, duration: number, recordCount?: number): void {
    this.recordPerformanceMetric({
      name: 'database_operation_duration',
      value: duration,
      unit: 'ms',
      tags: {
        operation
      }
    });

    if (recordCount) {
      this.recordPerformanceMetric({
        name: 'database_records_processed',
        value: recordCount,
        unit: 'count',
        tags: {
          operation
        }
      });
    }
  }

  public recordMemoryUsage(used: number, total: number): void {
    this.recordPerformanceMetric({
      name: 'memory_usage',
      value: used,
      unit: 'bytes'
    });

    this.recordPerformanceMetric({
      name: 'memory_usage_percentage',
      value: (used / total) * 100,
      unit: 'percentage'
    });
  }

  // Private helper methods
  private filterSensitiveData(event: any, hint: any): any {
    // Remove sensitive data from error reports
    if (event.request?.data) {
      const data = event.request.data;
      if (typeof data === 'object') {
        delete data.password;
        delete data.token;
        delete data.apiKey;
        delete data.secret;
        delete data.authorization;
      }
    }

    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
      delete event.request.headers['x-api-key'];
    }

    // Remove PII from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs.forEach((breadcrumb: any) => {
        if (breadcrumb.data) {
          delete breadcrumb.data.email;
          delete breadcrumb.data.phone;
          delete breadcrumb.data.ssn;
        }
      });
    }

    return event;
  }

  private filterPerformanceData(event: any): any {
    // Filter out noise from performance monitoring
    if (event.transaction) {
      // Skip health check transactions
      if (event.transaction.includes('/health') || event.transaction.includes('/status')) {
        return null;
      }

      // Skip very fast transactions (likely static assets)
      if (event.start_timestamp && event.timestamp) {
        const duration = (event.timestamp - event.start_timestamp) * 1000;
        if (duration < 10) { // Less than 10ms
          return null;
        }
      }
    }

    return event;
  }

  private generateErrorFingerprint(error: Error, context?: Partial<ErrorContext>): string[] {
    const fingerprint = [error.name];
    
    if (context?.feature) {
      fingerprint.push(context.feature);
    }
    
    if (context?.action) {
      fingerprint.push(context.action);
    }
    
    // Add error location if available
    if (error.stack) {
      const stackLine = error.stack.split('\n')[1];
      if (stackLine) {
        const match = stackLine.match(/at .+ \((.+):(\d+):\d+\)/);
        if (match) {
          fingerprint.push(`${match[1]}:${match[2]}`);
        }
      }
    }
    
    return fingerprint;
  }

  private recordAnnotationMetric(metric: PerformanceMetric): void {
    // Additional processing for annotation-specific metrics
    if (metric.context?.projectId) {
      Sentry.setTag('projectId', metric.context.projectId);
    }
  }

  private getTimeRangeCutoff(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }
}

// Global instance
let globalErrorMonitoring: ErrorMonitoring | null = null;

export function getErrorMonitoring(): ErrorMonitoring {
  if (!globalErrorMonitoring) {
    globalErrorMonitoring = new ErrorMonitoring();
  }
  return globalErrorMonitoring;
}

// Utility functions
export const monitoringUtils = {
  withErrorBoundary: <T extends (...args: any[]) => any>(
    fn: T,
    context?: Partial<ErrorContext>
  ): T => {
    return ((...args: Parameters<T>) => {
      try {
        const result = fn(...args);
        
        // Handle promises
        if (result && typeof result.then === 'function') {
          return result.catch((error: Error) => {
            getErrorMonitoring().captureError(error, context);
            throw error;
          });
        }
        
        return result;
      } catch (error) {
        getErrorMonitoring().captureError(error as Error, context);
        throw error;
      }
    }) as T;
  },

  measureAsync: async <T>(
    name: string,
    fn: () => Promise<T>,
    context?: Partial<ErrorContext>
  ): Promise<T> => {
    return getErrorMonitoring().measureExecutionTime(name, fn, context);
  },

  trackPageView: (pageName: string, context?: Partial<ErrorContext>): void => {
    getErrorMonitoring().recordCustomEvent({
      type: 'user_action',
      properties: {
        action: 'page_view',
        page: pageName
      },
      severity: 'info'
    }, context);
  },

  trackUserAction: (action: string, properties?: Record<string, any>, context?: Partial<ErrorContext>): void => {
    getErrorMonitoring().recordCustomEvent({
      type: 'user_action',
      properties: {
        action,
        ...properties
      },
      severity: 'info'
    }, context);
  }
};

// React Error Boundary
export class ErrorBoundary extends Error {
  constructor(message: string, public originalError?: Error, public context?: Partial<ErrorContext>) {
    super(message);
    this.name = 'ErrorBoundary';
  }
}

// Performance monitoring decorator
export function Monitor(context?: Partial<ErrorContext>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const monitoring = getErrorMonitoring();
      const methodContext = {
        ...context,
        feature: target.constructor.name,
        action: propertyKey
      };

      try {
        const result = originalMethod.apply(this, args);
        
        if (result && typeof result.then === 'function') {
          return monitoring.measureExecutionTime(
            `${target.constructor.name}.${propertyKey}`,
            () => result,
            methodContext
          );
        }
        
        return result;
      } catch (error) {
        monitoring.captureError(error as Error, methodContext);
        throw error;
      }
    };

    return descriptor;
  };
} 