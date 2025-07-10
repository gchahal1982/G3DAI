import { Logger, LogCategory } from '../debug/DebugLogger';
/**
 * DevelopmentSafeguards.ts - Enhanced error handling and safeguards for development environments
 * 
 * Provides comprehensive safeguards, enhanced error reporting, and development-specific
 * utilities to improve the G3D development experience and prevent common issues.
 */
import { reactDevModeDetector, ReactDevEnvironment } from './ReactDevModeDetector';
import { resourceDisposalValidator } from '../memory/ResourceDisposalValidator';

export interface DevelopmentConfig {
  enableStackTraces: boolean;
  enablePerformanceWarnings: boolean;
  enableMemoryLeakDetection: boolean;
  enableWebGLValidation: boolean;
  enableReactStrictModeHandling: boolean;
  enableHotReloadProtection: boolean;
  verboseLogging: boolean;
  maxConsoleWarnings: number;
  warningThrottleMs: number;
}

export interface PerformanceThresholds {
  frameTimeMs: number;
  memoryUsageMB: number;
  webglDrawCalls: number;
  contextSwitches: number;
}

export interface DevelopmentMetrics {
  warningsIssued: number;
  errorsHandled: number;
  memoryLeaksDetected: number;
  contextLossEvents: number;
  performanceViolations: number;
  reactStrictModeDetections: number;
}

class DevelopmentSafeguards {
  private static instance: DevelopmentSafeguards;
  private config: DevelopmentConfig;
  private thresholds: PerformanceThresholds;
  private metrics: DevelopmentMetrics;
  private warningCounts = new Map<string, number>();
  private lastWarningTime = new Map<string, number>();
  private devEnvironment: ReactDevEnvironment;

  private constructor() {
    this.config = {
      enableStackTraces: true,
      enablePerformanceWarnings: true,
      enableMemoryLeakDetection: true,
      enableWebGLValidation: true,
      enableReactStrictModeHandling: true,
      enableHotReloadProtection: true,
      verboseLogging: false,
      maxConsoleWarnings: 50,
      warningThrottleMs: 5000 // Increased from 1s to 5s to reduce console noise
    };

    this.thresholds = {
      frameTimeMs: 16.67, // 60 FPS - base threshold, actual warnings use 5x this (83ms) for less noise
      memoryUsageMB: 1500, // Increased to 1.5GB for modern development with large models
      webglDrawCalls: 1500, // More lenient for complex scenes
      contextSwitches: 15 // More lenient for development
    };

    this.metrics = {
      warningsIssued: 0,
      errorsHandled: 0,
      memoryLeaksDetected: 0,
      contextLossEvents: 0,
      performanceViolations: 0,
      reactStrictModeDetections: 0
    };

    this.devEnvironment = reactDevModeDetector.detect();

    // Automatically set low performance sensitivity in development to reduce noise
    if (this.devEnvironment.isDevelopment) {
      this.setPerformanceSensitivity('low');
    }

    this.initialize();
  }

  static getInstance(): DevelopmentSafeguards {
    if (!DevelopmentSafeguards.instance) {
      DevelopmentSafeguards.instance = new DevelopmentSafeguards();
    }
    return DevelopmentSafeguards.instance;
  }

  /**
   * Initialize development safeguards
   */
  private initialize(): void {
    if (!this.isDevelopmentMode()) return;

    Logger.info('Development safeguards initialized', LogCategory.Debug, {
      environment: this.devEnvironment,
      config: this.config
    });

    this.setupGlobalErrorHandling();
    this.setupPerformanceMonitoring();
    this.setupMemoryLeakDetection();
    this.setupWebGLValidation();
    this.setupReactStrictModeHandling();
    this.setupConsoleEnhancements();
  }

  /**
   * Check if we're in development mode
   */
  private isDevelopmentMode(): boolean {
    return this.devEnvironment.isDevelopment;
  }

  /**
   * Configure development safeguards
   */
  configure(config: Partial<DevelopmentConfig>): void {
    this.config = { ...this.config, ...config };
    Logger.info('Development safeguards reconfigured', LogCategory.Debug, config);
  }

  /**
   * Set performance thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    Logger.info('Performance thresholds updated', LogCategory.Performance, thresholds);
  }

  /**
   * Configure performance monitoring sensitivity
   */
  setPerformanceSensitivity(sensitivity: 'low' | 'medium' | 'high'): void {
    switch (sensitivity) {
      case 'low':
        this.config.warningThrottleMs = 15000; // 15 seconds
        this.thresholds.frameTimeMs = 50.0; // 20 FPS base threshold (very relaxed)
        this.thresholds.memoryUsageMB = 3000; // 3GB
        break;
      case 'medium':
        this.config.warningThrottleMs = 8000; // 8 seconds
        this.thresholds.frameTimeMs = 33.33; // 30 FPS base threshold (more relaxed than before)
        this.thresholds.memoryUsageMB = 1500; // 1.5GB
        break;
      case 'high':
        this.config.warningThrottleMs = 3000; // 3 seconds
        this.thresholds.frameTimeMs = 16.67; // 60 FPS base threshold
        this.thresholds.memoryUsageMB = 800; // 800MB
        break;
    }
    Logger.info(`Performance monitoring sensitivity set to ${sensitivity}`, LogCategory.Performance, {
      throttleMs: this.config.warningThrottleMs,
      frameTimeMs: this.thresholds.frameTimeMs,
      memoryMB: this.thresholds.memoryUsageMB
    });
  }

  /**
   * Setup global error handling
   */
  private setupGlobalErrorHandling(): void {
    if (typeof window === 'undefined') return;

    // Enhanced error event handler
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event.error, event.filename, event.lineno, event.colno);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event.reason);
    });

    // WebGL context loss handler
    window.addEventListener('webglcontextlost', (event) => {
      this.handleWebGLContextLoss(event as any);
    });

    // WebGL context restored handler
    window.addEventListener('webglcontextrestored', (event) => {
      this.handleWebGLContextRestored(event as any);
    });
  }

  /**
   * Handle global errors with enhanced reporting
   */
  private handleGlobalError(
    error: Error,
    filename?: string,
    lineno?: number,
    colno?: number
  ): void {
    this.metrics.errorsHandled++;

    const errorInfo = {
      message: error.message,
      stack: this.config.enableStackTraces ? error.stack : undefined,
      filename,
      lineno,
      colno,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    Logger.error('Global error caught by development safeguards', LogCategory.Debug, errorInfo);

    // Check for common development issues
    this.analyzeErrorForCommonIssues(error);
  }

  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection(reason: any): void {
    this.metrics.errorsHandled++;

    Logger.warn('Unhandled promise rejection', LogCategory.Debug, {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: this.config.enableStackTraces && reason instanceof Error ? reason.stack : undefined,
      timestamp: Date.now()
    });

    // Analyze for async disposal issues
    if (reason instanceof Error && reason.message.includes('dispose')) {
      this.warnThrottled('async-disposal',
        'Possible async disposal issue detected - ensure proper await/cleanup patterns'
      );
    }
  }

  /**
   * Handle WebGL context loss
   */
  private handleWebGLContextLoss(event: any): void {
    this.metrics.contextLossEvents++;

    Logger.warn('WebGL context lost', LogCategory.Error, {
      canvas: event.target?.id || 'unnamed',
      timestamp: Date.now(),
      reactStrictMode: false
    });

    if (false) {
      this.warnThrottled('react-context-loss',
        'WebGL context loss in React Strict Mode - consider using React-safe context creation patterns'
      );
    }
  }

  /**
   * Handle WebGL context restoration
   */
  private handleWebGLContextRestored(event: any): void {
    Logger.info('WebGL context restored', LogCategory.General, {
      canvas: event.target?.id || 'unnamed',
      timestamp: Date.now()
    });
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (!this.config.enablePerformanceWarnings) return;

    // Monitor frame time with intelligent buffering and adaptive thresholds
    let lastFrameTime = performance.now();
    let frameTimeHistory: number[] = [];
    let consecutiveSlowFrames = 0;
    const FRAME_HISTORY_SIZE = 10;
    const CONSECUTIVE_SLOW_THRESHOLD = 3;

    const checkFrameTime = () => {
      const now = performance.now();
      const frameTime = now - lastFrameTime;

      // Add to rolling window
      frameTimeHistory.push(frameTime);
      if (frameTimeHistory.length > FRAME_HISTORY_SIZE) {
        frameTimeHistory.shift();
      }

      // Calculate dynamic threshold based on recent performance
      const avgFrameTime = frameTimeHistory.reduce((a, b) => a + b, 0) / frameTimeHistory.length;
      const adaptiveThreshold = Math.max(
        this.thresholds.frameTimeMs * 5, // Increased to 5x threshold for even fewer false positives in development
        avgFrameTime * 3 // Or 3x recent average (increased from 2x)
      );

      // Only warn for consistently slow performance, not occasional spikes
      if (frameTime > adaptiveThreshold) {
        consecutiveSlowFrames++;

        if (consecutiveSlowFrames >= CONSECUTIVE_SLOW_THRESHOLD) {
          this.metrics.performanceViolations++;
          this.warnThrottled('slow-frame',
            `Sustained slow performance: ${frameTime.toFixed(2)}ms (avg: ${avgFrameTime.toFixed(2)}ms, threshold: ${adaptiveThreshold.toFixed(2)}ms)`
          );
          // Reset counter after warning to prevent spam
          consecutiveSlowFrames = 0;
        }
      } else {
        // Reset counter if we get a good frame
        consecutiveSlowFrames = 0;
      }

      lastFrameTime = now;
      requestAnimationFrame(checkFrameTime);
    };

    requestAnimationFrame(checkFrameTime);

    // Monitor memory usage with smarter thresholds and growth tracking
    if ('memory' in performance) {
      let lastMemoryUsage = 0;
      let memoryGrowthCount = 0;
      const MEMORY_GROWTH_THRESHOLD = 3; // Consecutive increases needed to warn

      setInterval(() => {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;

        // Dynamic threshold: warn at 80% of heap limit or configured threshold, whichever is higher
        const dynamicThreshold = Math.max(
          this.thresholds.memoryUsageMB,
          limitMB * 0.8
        );

        // Track memory growth trends
        if (usedMB > lastMemoryUsage + 10) { // 10MB growth
          memoryGrowthCount++;
        } else {
          memoryGrowthCount = 0;
        }

        // Warn for sustained high usage or rapid growth
        if (usedMB > dynamicThreshold) {
          this.metrics.performanceViolations++;
          this.warnThrottled('high-memory',
            `High memory usage: ${usedMB.toFixed(2)}MB / ${limitMB.toFixed(2)}MB (${(usedMB / limitMB * 100).toFixed(1)}%)`
          );
        } else if (memoryGrowthCount >= MEMORY_GROWTH_THRESHOLD) {
          this.warnThrottled('memory-growth',
            `Rapid memory growth detected: ${usedMB.toFixed(2)}MB (grew ${(usedMB - lastMemoryUsage).toFixed(2)}MB recently)`
          );
          memoryGrowthCount = 0; // Reset after warning
        }

        lastMemoryUsage = usedMB;
      }, 15000); // Check even less frequently (15s) to reduce performance monitoring overhead
    }
  }

  /**
   * Setup memory leak detection
   */
  private setupMemoryLeakDetection(): void {
    if (!this.config.enableMemoryLeakDetection) return;

    // Periodic memory leak check
    setInterval(() => {
      const stats = resourceDisposalValidator.validate();

      if (stats.totalReferences > 100) {
        this.metrics.memoryLeaksDetected++;
        this.warnThrottled('memory-leaks',
          `High reference count detected: ${stats.totalReferences} active references across ${stats.trackedObjects} objects`
        );
      }
    }, 10000);
  }

  /**
   * Setup WebGL validation
   */
  private setupWebGLValidation(): void {
    if (!this.config.enableWebGLValidation) return;

    // Monitor WebGL errors
    const originalGetError = WebGLRenderingContext.prototype.getError;
    WebGLRenderingContext.prototype.getError = function () {
      const error = originalGetError.call(this);

      if (error !== this.NO_ERROR) {
        const safeguards = DevelopmentSafeguards.getInstance();
        safeguards.handleWebGLError(error, this);
      }

      return error;
    };

    // Same for WebGL2
    if (typeof WebGL2RenderingContext !== 'undefined') {
      const originalGetError2 = WebGL2RenderingContext.prototype.getError;
      WebGL2RenderingContext.prototype.getError = function () {
        const error = originalGetError2.call(this);

        if (error !== this.NO_ERROR) {
          const safeguards = DevelopmentSafeguards.getInstance();
          safeguards.handleWebGLError(error, this);
        }

        return error;
      };
    }
  }

  /**
   * Handle WebGL errors
   */
  private handleWebGLError(
    error: number,
    context: WebGLRenderingContext | WebGL2RenderingContext
  ): void {
    const errorNames: Record<number, string> = {
      [context.INVALID_ENUM]: 'INVALID_ENUM',
      [context.INVALID_VALUE]: 'INVALID_VALUE',
      [context.INVALID_OPERATION]: 'INVALID_OPERATION',
      [context.OUT_OF_MEMORY]: 'OUT_OF_MEMORY',
      [context.CONTEXT_LOST_WEBGL]: 'CONTEXT_LOST_WEBGL'
    };

    const errorName = errorNames[error] || `UNKNOWN_ERROR_${error}`;

    this.warnThrottled(`webgl-${errorName.toLowerCase()}`,
      `WebGL Error: ${errorName} (${error})`
    );

    if (error === context.CONTEXT_LOST_WEBGL) {
      this.metrics.contextLossEvents++;
    }
  }

  /**
   * Setup React Strict Mode handling
   */
  private setupReactStrictModeHandling(): void {
    if (!this.config.enableReactStrictModeHandling || !this.devEnvironment.isReactStrictMode) {
      return;
    }

    this.metrics.reactStrictModeDetections++;

    Logger.info('React Strict Mode detected - enabling additional safeguards', LogCategory.Debug, LogCategory.General);

    // Monitor for double-effect patterns
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');

      // Detect React double-effect warnings
      if (message.includes('useEffect') || message.includes('strict mode')) {
        this.warnThrottled('react-double-effect',
          'React double-effect detected - ensure proper cleanup in useEffect'
        );
      }

      originalConsoleWarn.apply(console, args);
    };
  }

  /**
   * Setup console enhancements
   */
  private setupConsoleEnhancements(): void {
    if (!this.config.verboseLogging) return;

    // Add development info to console
    Logger.info('🚀 G3D Development Mode Active', LogCategory.Core, LogCategory.General);
    Logger.info('Environment:', LogCategory.Core, this.devEnvironment, LogCategory.General);
    Logger.info('Safeguards:', LogCategory.Core, this.config, LogCategory.General);

    // Add helpful shortcuts
    (window as any).G3D_DEBUG = {
      getMetrics: () => this.getMetrics(),
      getConfig: () => this.config,
      clearWarnings: () => this.clearWarnings(),
      toggleVerbose: () => {
        this.config.verboseLogging = !this.config.verboseLogging;
        Logger.info('Verbose logging:', LogCategory.Core, this.config.verboseLogging, LogCategory.General);
      },
      setPerformanceSensitivity: (sensitivity: 'low' | 'medium' | 'high') => {
        this.setPerformanceSensitivity(sensitivity);
        Logger.info(`Performance sensitivity set to ${sensitivity}`, LogCategory.Performance, LogCategory.General);
      },
      disablePerformanceWarnings: () => {
        this.config.enablePerformanceWarnings = false;
        Logger.info('✅ Performance warnings disabled for this session', LogCategory.Performance, LogCategory.General);
      },
      enablePerformanceWarnings: () => {
        this.config.enablePerformanceWarnings = true;
        Logger.info('⚠️ Performance warnings enabled', LogCategory.Performance, LogCategory.General);
      },
      optimizeForDevelopment: () => {
        this.setPerformanceSensitivity('low');
        this.config.warningThrottleMs = 20000; // 20 seconds
        Logger.info('✅ Optimized performance monitoring for development (very low sensitivity)', LogCategory.Performance);
      },
      silentMode: () => {
        this.config.enablePerformanceWarnings = false;
        this.config.enableMemoryLeakDetection = false;
        this.config.verboseLogging = false;
        Logger.info('🔇 Silent mode enabled - all development warnings disabled', LogCategory.Core, LogCategory.General);
      },
      restoreDefaults: () => {
        this.config.enablePerformanceWarnings = true;
        this.config.enableMemoryLeakDetection = true;
        this.setPerformanceSensitivity('low');
        Logger.info('🔄 Default development settings restored', LogCategory.Core, LogCategory.General);
      }
    };

    // Add helpful info message
    Logger.info('💡 Tip: Use G3D_DEBUG.optimizeForDevelopment() to reduce performance warnings', LogCategory.Core);
  }

  /**
   * Analyze errors for common development issues
   */
  private analyzeErrorForCommonIssues(error: Error): void {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Check for common WebGL issues
    if (message.includes('webgl') || stack.includes('webgl')) {
      if (message.includes('context')) {
        this.warnThrottled('webgl-context-issue',
          'WebGL context error detected - check for context loss or invalid operations'
        );
      }
    }

    // Check for memory issues
    if (message.includes('memory') || message.includes('allocation')) {
      this.warnThrottled('memory-issue',
        'Memory-related error detected - check for memory leaks or excessive allocations'
      );
    }

    // Check for disposal issues
    if (message.includes('dispose') || message.includes('cleanup')) {
      this.warnThrottled('disposal-issue',
        'Disposal-related error detected - ensure proper resource cleanup'
      );
    }

    // Check for React-specific issues
    if (this.devEnvironment.isReactStrictMode &&
      (message.includes('hook') || message.includes('render'))) {
      this.warnThrottled('react-issue',
        'Possible React Strict Mode issue - check for side effects in render'
      );
    }
  }

  /**
   * Issue throttled warnings to prevent console spam
   */
  private warnThrottled(key: string, message: string): void {
    const now = Date.now();
    const lastTime = this.lastWarningTime.get(key) || 0;
    const count = this.warningCounts.get(key) || 0;

    // Throttle warnings
    if (now - lastTime < this.config.warningThrottleMs) {
      this.warningCounts.set(key, count + 1);
      return;
    }

    // Check warning limits
    if (count >= this.config.maxConsoleWarnings) {
      if (count === this.config.maxConsoleWarnings) {
        Logger.warn(`Warning throttled (max ${this.config.maxConsoleWarnings} reached): ${key}`, LogCategory.Debug);
      }
      return;
    }

    this.lastWarningTime.set(key, now);
    this.warningCounts.set(key, count + 1);
    this.metrics.warningsIssued++;

    Logger.warn(`[DEV] ${message}`, LogCategory.Debug, {
      key,
      count: count + 1,
      timestamp: now
    });
  }

  /**
   * Get development metrics
   */
  getMetrics(): DevelopmentMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear warning counts
   */
  clearWarnings(): void {
    this.warningCounts.clear();
    this.lastWarningTime.clear();
    Logger.info('Development warning counts cleared', LogCategory.Debug, LogCategory.General);
  }

  /**
   * Get warning summary
   */
  getWarningSummary(): Record<string, number> {
    return Object.fromEntries(this.warningCounts);
  }

  /**
   * Create a development-safe function wrapper
   */
  createSafeWrapper<T extends (...args: any[]) => any>(
    fn: T,
    context: string,
    options?: {
      validateArgs?: boolean;
      trackPerformance?: boolean;
      logCalls?: boolean;
    }
  ): T {
    const opts = {
      validateArgs: false,
      trackPerformance: false,
      logCalls: false,
      ...options
    };

    return ((...args: any[]) => {
      const startTime = opts.trackPerformance ? performance.now() : 0;

      try {
        if (opts.logCalls && this.config.verboseLogging) {
          Logger.debug(`Calling ${context}`, LogCategory.Debug, { args }, LogCategory.General);
        }

        if (opts.validateArgs) {
          this.validateArguments(args, context);
        }

        const result = fn.apply(this, args);

        if (opts.trackPerformance) {
          const duration = performance.now() - startTime;
          if (duration > 10) { // Log slow calls
            Logger.debug(`Slow call detected: ${context} took ${duration.toFixed(2)}ms`, LogCategory.Performance);
          }
        }

        return result;
      } catch (error) {
        Logger.error(`Error in ${context}:`, LogCategory.Debug, error, LogCategory.General);
        throw error;
      }
    }) as T;
  }

  /**
   * Validate function arguments
   */
  private validateArguments(args: any[], context: string): void {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === null) {
        this.warnThrottled(`null-arg-${context}`,
          `Null argument passed to ${context} at position ${i}`
        );
      }

      if (arg === undefined) {
        this.warnThrottled(`undefined-arg-${context}`,
          `Undefined argument passed to ${context} at position ${i}`
        );
      }
    }
  }

  /**
   * Add development assertion
   */
  assert(condition: boolean, message: string, context?: string): void {
    if (!condition) {
      const fullMessage = context ? `[${context}] ${message}` : message;
      Logger.error(`Assertion failed: ${fullMessage}`, LogCategory.Debug, LogCategory.General);

      if (this.config.enableStackTraces) {
        Logger.error('Assertion stack trace:', LogCategory.Debug, new Error().stack);
      }

      throw new Error(`Assertion failed: ${fullMessage}`);
    }
  }

  /**
   * Get development environment information
   */
  getEnvironmentInfo(): ReactDevEnvironment {
    return this.devEnvironment;
  }

  /**
   * Log development info
   */
  devLog(message: string, data?: any, category: LogCategory = LogCategory.Debug): void {
    if (!this.isDevelopmentMode()) return;

    if (this.config.verboseLogging) {
      Logger.debug(`[DEV] ${message}`, category, data, LogCategory.General);
    }
  }
}

// Export singleton instance
export const developmentSafeguards = DevelopmentSafeguards.getInstance();

// Export utility functions
export function isDevelopmentMode(): boolean {
  return developmentSafeguards.getEnvironmentInfo().isDevelopment;
}

export function createSafeWrapper<T extends (...args: any[]) => any>(
  fn: T,
  context: string,
  options?: Parameters<typeof developmentSafeguards.createSafeWrapper>[2]
): T {
  return developmentSafeguards.createSafeWrapper(fn, context, options);
}

export function devAssert(condition: boolean, message: string, context?: string): void {
  developmentSafeguards.assert(condition, message, context);
}

export function devLog(message: string, data?: any, category: LogCategory = LogCategory.Debug): void {
  developmentSafeguards.devLog(message, data, category);
}

export function getDevMetrics(): DevelopmentMetrics {
  return developmentSafeguards.getMetrics();
}

export function clearDevWarnings(): void {
  developmentSafeguards.clearWarnings();
}

export function setPerformanceSensitivity(sensitivity: 'low' | 'medium' | 'high'): void {
  developmentSafeguards.setPerformanceSensitivity(sensitivity);
}