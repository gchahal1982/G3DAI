export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
  category?: string;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  role?: string;
  organizationId?: string;
  [key: string]: any;
}

export interface AnalyticsConfig {
  enabled: boolean;
  apiEndpoint?: string;
  batchSize: number;
  flushInterval: number;
  enableDebugLogging: boolean;
  anonymizeData: boolean;
}

/**
 * Analytics service for tracking user interactions and application metrics
 */
export class AnalyticsService {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private userProperties: UserProperties = {};
  private sessionId: string;
  private flushTimer?: number;

  constructor(config?: Partial<AnalyticsConfig>) {
    this.config = {
      enabled: true,
      batchSize: 20,
      flushInterval: 30000, // 30 seconds
      enableDebugLogging: false,
      anonymizeData: false,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
  }

  /**
   * Track an analytics event
   */
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) {
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties: this.sanitizeProperties(properties),
      timestamp: new Date().toISOString(),
      userId: this.userProperties.userId,
      sessionId: this.sessionId,
    };

    if (this.config.enableDebugLogging) {
      console.debug('[Analytics] Tracking event:', event);
    }

    this.eventQueue.push(event);

    // Flush if batch size reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Track page view
   */
  page(pageName: string, properties?: Record<string, any>): void {
    this.track('page_view', {
      page_name: pageName,
      url: window.location.href,
      referrer: document.referrer,
      ...properties,
    });
  }

  /**
   * Set user properties
   */
  identify(userId: string, properties?: UserProperties): void {
    this.userProperties = {
      ...this.userProperties,
      userId,
      ...properties,
    };

    this.track('user_identified', {
      user_id: userId,
      ...properties,
    });
  }

  /**
   * Track user action timing
   */
  time(eventName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.track(eventName, { duration_ms: Math.round(duration) });
    };
  }

  /**
   * Track error events
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error_occurred', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  /**
   * Track AI-related events
   */
  trackAIEvent(eventType: string, modelId?: string, properties?: Record<string, any>): void {
    this.track(`ai_${eventType}`, {
      model_id: modelId,
      category: 'ai',
      ...properties,
    });
  }

  /**
   * Track medical workflow events
   */
  trackMedicalEvent(eventType: string, properties?: Record<string, any>): void {
    this.track(`medical_${eventType}`, {
      category: 'medical',
      ...properties,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metricName: string, value: number, unit: string = 'ms'): void {
    this.track('performance_metric', {
      metric_name: metricName,
      value,
      unit,
      category: 'performance',
    });
  }

  /**
   * Flush events to analytics endpoint
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.config.enabled) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    if (!this.config.apiEndpoint) {
      if (this.config.enableDebugLogging) {
        console.debug('[Analytics] No API endpoint configured, events:', events);
      }
      return;
    }

    try {
      await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          session_id: this.sessionId,
          user_properties: this.userProperties,
          timestamp: new Date().toISOString(),
        }),
      });

      if (this.config.enableDebugLogging) {
        console.debug(`[Analytics] Flushed ${events.length} events`);
      }
    } catch (error) {
      console.warn('[Analytics] Failed to flush events:', error);
      // Re-add events to queue for retry
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Update analytics configuration
   */
  updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.enabled === false) {
      this.clearEventQueue();
    }
    
    if (config.flushInterval && config.flushInterval !== this.config.flushInterval) {
      this.restartFlushTimer();
    }
  }

  /**
   * Clear all queued events
   */
  clearEventQueue(): void {
    this.eventQueue = [];
  }

  /**
   * Get current session information
   */
  getSessionInfo(): { sessionId: string; userProperties: UserProperties } {
    return {
      sessionId: this.sessionId,
      userProperties: { ...this.userProperties },
    };
  }

  /**
   * Start new session
   */
  startNewSession(): void {
    this.sessionId = this.generateSessionId();
    this.track('session_started');
  }

  /**
   * End current session
   */
  endSession(): void {
    this.track('session_ended');
    this.flush();
    this.stopFlushTimer();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize event properties
   */
  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> | undefined {
    if (!properties) {
      return undefined;
    }

    const sanitized: Record<string, any> = {};

    Object.entries(properties).forEach(([key, value]) => {
      // Skip functions and undefined values
      if (typeof value === 'function' || value === undefined) {
        return;
      }

      // Anonymize sensitive data if configured
      if (this.config.anonymizeData && this.isSensitiveKey(key)) {
        sanitized[key] = '[REDACTED]';
        return;
      }

      // Limit string length
      if (typeof value === 'string' && value.length > 1000) {
        sanitized[key] = value.substring(0, 1000) + '...';
        return;
      }

      sanitized[key] = value;
    });

    return sanitized;
  }

  /**
   * Check if property key is sensitive
   */
  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'credential',
      'ssn',
      'social_security',
      'credit_card',
      'patient_id',
      'medical_record',
    ];

    const lowerKey = key.toLowerCase();
    return sensitiveKeys.some(sensitiveKey => lowerKey.includes(sensitiveKey));
  }

  /**
   * Start automatic flush timer
   */
  private startFlushTimer(): void {
    if (typeof window !== 'undefined') {
      this.flushTimer = window.setInterval(() => {
        this.flush();
      }, this.config.flushInterval);
    }
  }

  /**
   * Stop flush timer
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Restart flush timer with new interval
   */
  private restartFlushTimer(): void {
    this.stopFlushTimer();
    this.startFlushTimer();
  }
} 