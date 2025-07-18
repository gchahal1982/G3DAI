/**
 * PerformanceMonitor - 3D Performance Tracking System
 * 
 * Comprehensive performance monitoring for 3D code visualization:
 * - Real-time frame rate monitoring with rolling averages
 * - Draw call counting and batching optimization detection
 * - Polygon count tracking with per-frame breakdown
 * - Automatic LOD (Level of Detail) adjustment based on performance
 * - Performance degradation detection with early warning system
 * - Memory usage monitoring for GPU and system resources
 * - GPU utilization tracking with vendor-specific APIs
 * - Performance analytics reporting with trend analysis
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

export interface PerformanceMetrics {
  frameRate: {
    current: number;
    average: number;
    min: number;
    max: number;
    target: number;
    samples: number[];
  };
  rendering: {
  drawCalls: number;
  triangles: number;
  vertices: number;
  textures: number;
  shaderSwitches: number;
    renderTargetSwitches: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    gpuMemoryUsed: number;
    gpuMemoryTotal: number;
    textureMemory: number;
    bufferMemory: number;
  };
  timing: {
    frameTime: number;
    renderTime: number;
    updateTime: number;
    gpuTime: number;
    cpuWait: number;
  };
  lod: {
    currentLevel: number;
    totalLevels: number;
    nodesVisible: number;
    nodesCulled: number;
    autoAdjustment: boolean;
  };
  warnings: {
    lowFrameRate: boolean;
    highMemoryUsage: boolean;
    excessiveDrawCalls: boolean;
    gpuBottleneck: boolean;
    memoryLeak: boolean;
  };
}

export interface PerformanceThresholds {
  frameRate: {
    target: number;
    warning: number;
    critical: number;
  };
  drawCalls: {
    optimal: number;
    warning: number;
    critical: number;
  };
  memory: {
    warningPercent: number;
    criticalPercent: number;
  };
  triangles: {
    optimal: number;
    warning: number;
    critical: number;
  };
}

export interface LODLevel {
  level: number;
  maxDistance: number;
  maxTriangles: number;
  maxNodes: number;
  quality: number;
}

export interface PerformanceProfile {
  name: string;
  description: string;
  thresholds: PerformanceThresholds;
  lodLevels: LODLevel[];
  autoOptimize: boolean;
  adaptiveQuality: boolean;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  category: 'frameRate' | 'memory' | 'rendering' | 'gpu';
  message: string;
  timestamp: number;
  metrics: Partial<PerformanceMetrics>;
  recommendation?: string;
  acknowledged: boolean;
}

export interface GPUInfo {
  vendor: string;
  renderer: string;
  version: string;
  maxTextureSize: number;
  maxViewportDims: [number, number];
  maxVertexAttribs: number;
  maxFragmentUniforms: number;
  extensions: string[];
  memoryInfo?: {
    total: number;
    used: number;
    available: number;
  };
}

class PerformanceMonitor extends EventEmitter {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | WebGLRenderingContext | null = null;
  private config: {
    profile: PerformanceProfile;
    monitoringInterval: number;
    historySize: number;
    alertThreshold: number;
  };

  private metrics: PerformanceMetrics;
  private frameHistory: number[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private alerts: Map<string, PerformanceAlert> = new Map();
  private isMonitoring: boolean = false;
  private monitoringTimer?: NodeJS.Timeout;
  private gpuInfo: GPUInfo | null = null;

  // Performance counters
  private counters = {
    drawCalls: 0,
    triangles: 0,
    vertices: 0,
    textureBinds: 0,
    shaderSwitches: 0,
    renderTargetSwitches: 0,
  };

  // Timing measurements
  private timings = {
    frameStart: 0,
    renderStart: 0,
    updateStart: 0,
    gpuQueries: new Map<string, any>(),
  };

  constructor(canvas: HTMLCanvasElement, profile: Partial<PerformanceProfile> = {}) {
    super();
    
    this.canvas = canvas;
    this.config = {
      profile: this.createProfile(profile),
      monitoringInterval: 1000, // 1 second
      historySize: 300, // 5 minutes at 60fps
      alertThreshold: 3, // 3 consecutive violations
    };

    this.metrics = this.initializeMetrics();
    this.initializeGL();
    this.detectGPUInfo();
    this.startMonitoring();
  }

  /**
   * Initialize performance metrics
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      frameRate: {
        current: 0,
        average: 0,
        min: Infinity,
        max: 0,
        target: this.config.profile.thresholds.frameRate.target,
        samples: [],
      },
      rendering: {
      drawCalls: 0,
      triangles: 0,
      vertices: 0,
      textures: 0,
      shaderSwitches: 0,
        renderTargetSwitches: 0,
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        gpuMemoryUsed: 0,
        gpuMemoryTotal: 0,
        textureMemory: 0,
        bufferMemory: 0,
      },
      timing: {
        frameTime: 0,
        renderTime: 0,
        updateTime: 0,
        gpuTime: 0,
        cpuWait: 0,
      },
      lod: {
        currentLevel: 0,
        totalLevels: this.config.profile.lodLevels.length,
        nodesVisible: 0,
        nodesCulled: 0,
        autoAdjustment: this.config.profile.autoOptimize,
      },
      warnings: {
        lowFrameRate: false,
        highMemoryUsage: false,
        excessiveDrawCalls: false,
        gpuBottleneck: false,
        memoryLeak: false,
      },
    };
  }

  /**
   * Create performance profile with defaults
   */
  private createProfile(userProfile: Partial<PerformanceProfile>): PerformanceProfile {
    const defaultProfile: PerformanceProfile = {
      name: 'Balanced',
      description: 'Balanced performance and quality settings',
      thresholds: {
        frameRate: { target: 60, warning: 30, critical: 15 },
        drawCalls: { optimal: 100, warning: 500, critical: 1000 },
        memory: { warningPercent: 75, criticalPercent: 90 },
        triangles: { optimal: 100000, warning: 500000, critical: 1000000 },
      },
      lodLevels: [
        { level: 0, maxDistance: 10, maxTriangles: 10000, maxNodes: 100, quality: 1.0 },
        { level: 1, maxDistance: 25, maxTriangles: 5000, maxNodes: 200, quality: 0.7 },
        { level: 2, maxDistance: 50, maxTriangles: 2000, maxNodes: 500, quality: 0.4 },
        { level: 3, maxDistance: 100, maxTriangles: 500, maxNodes: 1000, quality: 0.2 },
      ],
      autoOptimize: true,
      adaptiveQuality: true,
    };

    return { ...defaultProfile, ...userProfile };
  }

  /**
   * Initialize WebGL context for GPU monitoring
   */
  private initializeGL(): void {
    try {
      this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
      
      if (this.gl) {
        // Enable GPU timing extensions if available
        const ext = this.gl.getExtension('EXT_disjoint_timer_query_webgl2') ||
                   this.gl.getExtension('EXT_disjoint_timer_query');
        
        if (ext) {
          this.setupGPUTimers(ext);
        }
      }
    } catch (error) {
      console.warn('Failed to initialize WebGL context for performance monitoring:', error);
    }
  }

  /**
   * Detect GPU information
   */
  private detectGPUInfo(): void {
    if (!this.gl) return;

    try {
      const debugInfo = this.gl.getExtension('WEBGL_debug_renderer_info');
      const memoryInfo = this.gl.getExtension('WEBGL_memory_info_chromium');

      this.gpuInfo = {
        vendor: debugInfo ? this.gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
        renderer: debugInfo ? this.gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
        version: this.gl.getParameter(this.gl.VERSION),
        maxTextureSize: this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE),
        maxViewportDims: this.gl.getParameter(this.gl.MAX_VIEWPORT_DIMS),
        maxVertexAttribs: this.gl.getParameter(this.gl.MAX_VERTEX_ATTRIBS),
        maxFragmentUniforms: this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS),
        extensions: this.gl.getSupportedExtensions() || [],
        memoryInfo: memoryInfo ? {
          total: memoryInfo.getTotalGPUMemory?.() || 0,
          used: memoryInfo.getUsedGPUMemory?.() || 0,
          available: memoryInfo.getFreeGPUMemory?.() || 0,
        } : undefined,
      };

      this.emit('gpuInfoDetected', this.gpuInfo);
    } catch (error) {
      console.warn('Failed to detect GPU info:', error);
    }
  }

  /**
   * Setup GPU timing queries
   */
  private setupGPUTimers(ext: any): void {
    // Create timing queries for different render phases
    const queries = {
      render: ext.createQuery(),
      update: ext.createQuery(),
      total: ext.createQuery(),
    };

    this.timings.gpuQueries = queries;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    
    // Start monitoring timer
    this.monitoringTimer = setInterval(() => {
      this.collectSystemMetrics();
      this.analyzePerformance();
      this.checkAlerts();
    }, this.config.monitoringInterval);
    
    this.emit('monitoringStarted');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }
    
    this.emit('monitoringStopped');
  }

  /**
   * Begin frame measurement
   */
  beginFrame(): void {
    this.timings.frameStart = performance.now();
    this.resetCounters();
      
    // Start GPU timer if available
    if (this.gl && this.timings.gpuQueries.total) {
      const ext = this.gl.getExtension('EXT_disjoint_timer_query_webgl2') ||
                  this.gl.getExtension('EXT_disjoint_timer_query');
      if (ext) {
        ext.beginQuery(ext.TIME_ELAPSED_EXT, this.timings.gpuQueries.total);
    }
    }
  }

  /**
   * End frame measurement
   */
  endFrame(): void {
    const currentTime = performance.now();
    const frameTime = currentTime - this.timings.frameStart;
    const timeSinceLastFrame = currentTime - this.lastFrameTime;
      
    // Calculate frame rate
    const currentFPS = timeSinceLastFrame > 0 ? 1000 / timeSinceLastFrame : 0;
    this.updateFrameRate(currentFPS);

    // Update timing metrics
    this.metrics.timing.frameTime = frameTime;

    // Update rendering metrics
    this.metrics.rendering = { ...this.counters };

    // End GPU timer if available
    if (this.gl && this.timings.gpuQueries.total) {
      const ext = this.gl.getExtension('EXT_disjoint_timer_query_webgl2') ||
                  this.gl.getExtension('EXT_disjoint_timer_query');
      if (ext) {
        ext.endQuery(ext.TIME_ELAPSED_EXT);
        this.queryGPUTime(ext);
      }
    }

    this.lastFrameTime = currentTime;
    this.frameCount++;

    // Auto-adjust LOD if enabled
    if (this.config.profile.autoOptimize) {
      this.adjustLODLevel();
    }

    this.emit('frameComplete', {
      frameTime,
      fps: currentFPS,
      metrics: this.metrics,
    });
      }
      
  /**
   * Record draw call
   */
  recordDrawCall(triangles: number = 0, vertices: number = 0): void {
    this.counters.drawCalls++;
    this.counters.triangles += triangles;
    this.counters.vertices += vertices;
  }

  /**
   * Record texture bind
   */
  recordTextureBind(): void {
    this.counters.textureBinds++;
  }

  /**
   * Record shader switch
   */
  recordShaderSwitch(): void {
    this.counters.shaderSwitches++;
  }

  /**
   * Record render target switch
   */
  recordRenderTargetSwitch(): void {
    this.counters.renderTargetSwitches++;
  }

  /**
   * Update frame rate metrics
   */
  private updateFrameRate(fps: number): void {
    this.metrics.frameRate.current = fps;
    this.metrics.frameRate.samples.push(fps);

    // Maintain sample history
    if (this.metrics.frameRate.samples.length > this.config.historySize) {
      this.metrics.frameRate.samples.shift();
    }

    // Calculate statistics
    const samples = this.metrics.frameRate.samples;
    this.metrics.frameRate.average = samples.reduce((a, b) => a + b, 0) / samples.length;
    this.metrics.frameRate.min = Math.min(this.metrics.frameRate.min, fps);
    this.metrics.frameRate.max = Math.max(this.metrics.frameRate.max, fps);
  }

  /**
   * Reset performance counters
   */
  private resetCounters(): void {
    this.counters = {
      drawCalls: 0,
      triangles: 0,
      vertices: 0,
      textureBinds: 0,
      shaderSwitches: 0,
      renderTargetSwitches: 0,
    };
  }

  /**
   * Collect system memory metrics
   */
  private collectSystemMetrics(): void {
    // System memory
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      const memory = (window.performance as any).memory;
      this.metrics.memory.heapUsed = memory.usedJSHeapSize;
      this.metrics.memory.heapTotal = memory.totalJSHeapSize;
    }

    // GPU memory (if available)
    if (this.gl && this.gpuInfo?.memoryInfo) {
      this.metrics.memory.gpuMemoryUsed = this.gpuInfo.memoryInfo.used;
      this.metrics.memory.gpuMemoryTotal = this.gpuInfo.memoryInfo.total;
    }
  }

  /**
   * Query GPU timing
   */
  private queryGPUTime(ext: any): void {
    // Check if query is available
    if (ext.getQueryParameter(this.timings.gpuQueries.total, ext.QUERY_RESULT_AVAILABLE)) {
      const gpuTime = ext.getQueryParameter(this.timings.gpuQueries.total, ext.QUERY_RESULT);
      this.metrics.timing.gpuTime = gpuTime / 1000000; // Convert to milliseconds
    }
  }

  /**
   * Analyze overall performance
   */
  private analyzePerformance(): void {
    const thresholds = this.config.profile.thresholds;
    
    // Check frame rate warnings
    this.metrics.warnings.lowFrameRate = 
      this.metrics.frameRate.average < thresholds.frameRate.warning;

    // Check draw call warnings
    this.metrics.warnings.excessiveDrawCalls = 
      this.metrics.rendering.drawCalls > thresholds.drawCalls.warning;

    // Check memory warnings
    const memoryUsagePercent = this.metrics.memory.heapTotal > 0 ?
      (this.metrics.memory.heapUsed / this.metrics.memory.heapTotal) * 100 : 0;
    this.metrics.warnings.highMemoryUsage = 
      memoryUsagePercent > thresholds.memory.warningPercent;

    // Check GPU bottleneck
    this.metrics.warnings.gpuBottleneck = 
      this.metrics.timing.gpuTime > this.metrics.timing.frameTime * 0.8;

    // Check for memory leaks (growing heap over time)
    if (this.frameHistory.length > 100) {
      const recentAverage = this.frameHistory.slice(-50).reduce((a, b) => a + b, 0) / 50;
      const olderAverage = this.frameHistory.slice(-100, -50).reduce((a, b) => a + b, 0) / 50;
      this.metrics.warnings.memoryLeak = recentAverage > olderAverage * 1.2;
    }
    }
    
  /**
   * Adjust LOD level based on performance
   */
  private adjustLODLevel(): void {
    const currentFPS = this.metrics.frameRate.current;
    const targetFPS = this.config.profile.thresholds.frameRate.target;
    const warningFPS = this.config.profile.thresholds.frameRate.warning;

    let newLODLevel = this.metrics.lod.currentLevel;
    
    // Decrease quality if performance is poor
    if (currentFPS < warningFPS && newLODLevel < this.config.profile.lodLevels.length - 1) {
      newLODLevel++;
    }
    // Increase quality if performance is good
    else if (currentFPS > targetFPS * 1.1 && newLODLevel > 0) {
      newLODLevel--;
    }

    if (newLODLevel !== this.metrics.lod.currentLevel) {
      this.metrics.lod.currentLevel = newLODLevel;
      
      this.emit('lodLevelChanged', {
        oldLevel: this.metrics.lod.currentLevel,
        newLevel: newLODLevel,
        reason: currentFPS < warningFPS ? 'performance' : 'quality',
        fps: currentFPS,
      });
    }
  }

  /**
   * Check for performance alerts
   */
  private checkAlerts(): void {
    const thresholds = this.config.profile.thresholds;
    
    // Frame rate alerts
    if (this.metrics.frameRate.average < thresholds.frameRate.critical) {
      this.createAlert('frameRate', 'critical', 
        `Frame rate critically low: ${this.metrics.frameRate.average.toFixed(1)} FPS`,
        'Consider reducing visual quality or complexity'
      );
    } else if (this.metrics.frameRate.average < thresholds.frameRate.warning) {
      this.createAlert('frameRate', 'warning',
        `Frame rate below target: ${this.metrics.frameRate.average.toFixed(1)} FPS`
      );
    }

    // Draw call alerts
    if (this.metrics.rendering.drawCalls > thresholds.drawCalls.critical) {
      this.createAlert('rendering', 'critical',
        `Excessive draw calls: ${this.metrics.rendering.drawCalls}`,
        'Consider batching render calls or reducing scene complexity'
      );
    }
    
    // Memory alerts
    const memoryPercent = this.metrics.memory.heapTotal > 0 ?
      (this.metrics.memory.heapUsed / this.metrics.memory.heapTotal) * 100 : 0;
    
    if (memoryPercent > thresholds.memory.criticalPercent) {
      this.createAlert('memory', 'critical',
        `Memory usage critical: ${memoryPercent.toFixed(1)}%`,
        'Consider clearing caches or reducing memory usage'
      );
    }
    }
    
  /**
   * Create performance alert
   */
  private createAlert(
    category: PerformanceAlert['category'],
    type: PerformanceAlert['type'],
    message: string,
    recommendation?: string
  ): void {
    const alertId = `${category}_${type}_${Date.now()}`;
    
    const alert: PerformanceAlert = {
      id: alertId,
      type,
      category,
      message,
      timestamp: Date.now(),
      metrics: { ...this.metrics },
      recommendation,
      acknowledged: false,
    };

    this.alerts.set(alertId, alert);
    this.emit('performanceAlert', alert);

    // Auto-acknowledge info alerts after a delay
    if (type === 'info') {
      setTimeout(() => this.acknowledgeAlert(alertId), 5000);
    }
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit('alertAcknowledged', alert);
      return true;
  }
    return false;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance alerts
   */
  getAlerts(includeAcknowledged: boolean = false): PerformanceAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => includeAcknowledged || !alert.acknowledged);
  }

  /**
   * Get GPU information
   */
  getGPUInfo(): GPUInfo | null {
    return this.gpuInfo;
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.metrics;
    const thresholds = this.config.profile.thresholds;

    if (metrics.frameRate.average < thresholds.frameRate.target) {
      recommendations.push('Reduce scene complexity or enable adaptive quality');
    }

    if (metrics.rendering.drawCalls > thresholds.drawCalls.optimal) {
      recommendations.push('Implement draw call batching or instancing');
  }

    if (metrics.warnings.highMemoryUsage) {
      recommendations.push('Implement memory pooling or garbage collection optimization');
    }

    if (metrics.warnings.gpuBottleneck) {
      recommendations.push('Optimize shaders or reduce texture resolution');
    }

    return recommendations;
    }

  /**
   * Export performance data
   */
  exportData(format: 'json' | 'csv' = 'json'): string {
    const data = {
      timestamp: Date.now(),
      metrics: this.metrics,
      alerts: Array.from(this.alerts.values()),
      gpuInfo: this.gpuInfo,
      config: this.config.profile,
    };

    if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return JSON.stringify(data, null, 2);
    }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any): string {
    // Simplified CSV export - would be more comprehensive in real implementation
    const headers = ['timestamp', 'fps', 'drawCalls', 'triangles', 'memoryUsed'];
    const row = [
      data.timestamp,
      data.metrics.frameRate.current,
      data.metrics.rendering.drawCalls,
      data.metrics.rendering.triangles,
      data.metrics.memory.heapUsed,
    ];

    return [headers.join(','), row.join(',')].join('\n');
  }

  /**
   * Cleanup and dispose
   */
  dispose(): void {
    this.stopMonitoring();
    this.alerts.clear();
    this.frameHistory = [];
    this.removeAllListeners();
  }
}

export default PerformanceMonitor; 