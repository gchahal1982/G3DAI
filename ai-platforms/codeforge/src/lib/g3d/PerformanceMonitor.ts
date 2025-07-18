/**
 * CodeForge 3D Performance Monitor
 * Monitors and optimizes 3D rendering performance in real-time
 * 
 * Features:
 * - Frame pacing analysis with 30+ FPS target
 * - GPU utilization tracking and optimization
 * - Memory pool monitoring and cleanup
 * - Automated LOD adjustment
 * - Performance regression detection
 * - Thermal throttling detection
 * - Rendering bottleneck identification
 * - Performance telemetry collection
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

// Interfaces and types
interface PerformanceMetrics {
  // Frame timing
  fps: number;
  frameTime: number;
  framePacing: number;
  targetFPS: number;
  
  // GPU metrics
  gpuUtilization: number;
  gpuMemoryUsed: number;
  gpuMemoryTotal: number;
  gpuTemperature: number;
  
  // CPU metrics
  cpuUsage: number;
  mainThreadTime: number;
  renderThreadTime: number;
  
  // Memory metrics
  memoryUsed: number;
  memoryTotal: number;
  textureMemory: number;
  bufferMemory: number;
  geometryMemory: number;
  
  // Rendering metrics
  drawCalls: number;
  triangles: number;
  vertices: number;
  textures: number;
  shaderSwitches: number;
  stateChanges: number;
  
  // LOD metrics
  lodLevel: number;
  visibleObjects: number;
  culledObjects: number;
  
  // Quality metrics
  qualityScore: number;
  stabilityScore: number;
  efficiencyScore: number;
}

interface PerformanceThresholds {
  // Target thresholds
  targetFPS: number;
  maxFrameTime: number;
  maxGPUUtilization: number;
  maxMemoryUsage: number;
  
  // Warning thresholds
  warningFPS: number;
  warningFrameTime: number;
  warningGPUUtilization: number;
  warningMemoryUsage: number;
  
  // Critical thresholds
  criticalFPS: number;
  criticalFrameTime: number;
  criticalGPUUtilization: number;
  criticalMemoryUsage: number;
}

interface PerformanceEvent {
  type: 'fps_drop' | 'memory_pressure' | 'gpu_throttling' | 'lod_change' | 'quality_change';
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
  data: any;
  description: string;
}

interface PerformanceHistory {
  timestamp: number;
  metrics: PerformanceMetrics;
}

interface OptimizationAction {
  type: 'reduce_lod' | 'reduce_quality' | 'cull_objects' | 'reduce_effects' | 'cleanup_memory';
  priority: number;
  impact: number;
  cost: number;
  execute: () => Promise<void>;
  undo: () => Promise<void>;
}

interface PerformanceProfile {
  name: string;
  description: string;
  thresholds: PerformanceThresholds;
  lodBias: number;
  qualityMultiplier: number;
  effectsEnabled: boolean;
  shadowsEnabled: boolean;
  antialiasing: boolean;
}

// Configuration constants
const PERFORMANCE_CONFIG = {
  // Monitoring intervals
  METRICS_UPDATE_INTERVAL: 100, // ms
  HISTORY_RETENTION_TIME: 60000, // 60 seconds
  OPTIMIZATION_CHECK_INTERVAL: 1000, // 1 second
  
  // Performance targets
  TARGET_FPS: 30,
  MAX_FRAME_TIME: 33.33, // ms (30 FPS)
  TARGET_GPU_UTILIZATION: 80, // %
  MAX_MEMORY_USAGE: 1024, // MB
  
  // Analysis windows
  FPS_ANALYSIS_WINDOW: 60, // frames
  PACING_ANALYSIS_WINDOW: 30, // frames
  TREND_ANALYSIS_WINDOW: 300, // frames
  
  // Optimization parameters
  LOD_ADJUSTMENT_THRESHOLD: 0.8,
  QUALITY_ADJUSTMENT_THRESHOLD: 0.7,
  MEMORY_CLEANUP_THRESHOLD: 0.9,
  EMERGENCY_OPTIMIZATION_THRESHOLD: 0.5,
  
  // Stability thresholds
  FRAME_VARIANCE_THRESHOLD: 10, // ms
  GPU_THROTTLING_THRESHOLD: 90, // %
  MEMORY_PRESSURE_THRESHOLD: 0.85
};

export class PerformanceMonitor extends EventEmitter {
  private isMonitoring: boolean = false;
  private metricsTimer: NodeJS.Timeout | null = null;
  private optimizationTimer: NodeJS.Timeout | null = null;
  
  private currentMetrics: PerformanceMetrics;
  private performanceHistory: PerformanceHistory[] = [];
  private frameTimings: number[] = [];
  private thresholds: PerformanceThresholds;
  private currentProfile: PerformanceProfile;
  
  private renderingContext: any = null;
  private gpuAdapter: any = null;
  private memoryObserver: PerformanceObserver | null = null;
  
  private optimizationActions: OptimizationAction[] = [];
  private appliedOptimizations: OptimizationAction[] = [];
  private isOptimizing: boolean = false;
  
  constructor() {
    super();
    
    this.currentMetrics = this.createEmptyMetrics();
    this.thresholds = this.createDefaultThresholds();
    this.currentProfile = this.createDefaultProfile();
    
    this.initializeMonitoring();
  }

  private createEmptyMetrics(): PerformanceMetrics {
    return {
      fps: 0,
      frameTime: 0,
      framePacing: 0,
      targetFPS: PERFORMANCE_CONFIG.TARGET_FPS,
      gpuUtilization: 0,
      gpuMemoryUsed: 0,
      gpuMemoryTotal: 0,
      gpuTemperature: 0,
      cpuUsage: 0,
      mainThreadTime: 0,
      renderThreadTime: 0,
      memoryUsed: 0,
      memoryTotal: 0,
      textureMemory: 0,
      bufferMemory: 0,
      geometryMemory: 0,
      drawCalls: 0,
      triangles: 0,
      vertices: 0,
      textures: 0,
      shaderSwitches: 0,
      stateChanges: 0,
      lodLevel: 0,
      visibleObjects: 0,
      culledObjects: 0,
      qualityScore: 100,
      stabilityScore: 100,
      efficiencyScore: 100
    };
  }

  private createDefaultThresholds(): PerformanceThresholds {
    return {
      targetFPS: PERFORMANCE_CONFIG.TARGET_FPS,
      maxFrameTime: PERFORMANCE_CONFIG.MAX_FRAME_TIME,
      maxGPUUtilization: PERFORMANCE_CONFIG.TARGET_GPU_UTILIZATION,
      maxMemoryUsage: PERFORMANCE_CONFIG.MAX_MEMORY_USAGE,
      
      warningFPS: PERFORMANCE_CONFIG.TARGET_FPS * 0.8,
      warningFrameTime: PERFORMANCE_CONFIG.MAX_FRAME_TIME * 1.2,
      warningGPUUtilization: PERFORMANCE_CONFIG.TARGET_GPU_UTILIZATION * 1.1,
      warningMemoryUsage: PERFORMANCE_CONFIG.MAX_MEMORY_USAGE * 0.8,
      
      criticalFPS: PERFORMANCE_CONFIG.TARGET_FPS * 0.5,
      criticalFrameTime: PERFORMANCE_CONFIG.MAX_FRAME_TIME * 2.0,
      criticalGPUUtilization: PERFORMANCE_CONFIG.TARGET_GPU_UTILIZATION * 1.3,
      criticalMemoryUsage: PERFORMANCE_CONFIG.MAX_MEMORY_USAGE * 0.95
    };
  }

  private createDefaultProfile(): PerformanceProfile {
    return {
      name: 'Balanced',
      description: 'Balanced performance and quality',
      thresholds: this.createDefaultThresholds(),
      lodBias: 1.0,
      qualityMultiplier: 1.0,
      effectsEnabled: true,
      shadowsEnabled: true,
      antialiasing: true
    };
  }

  private async initializeMonitoring(): Promise<void> {
    // Initialize performance observers
    try {
      if ('PerformanceObserver' in window) {
        this.memoryObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'measure') {
              this.handlePerformanceMeasure(entry as PerformanceMeasure);
            }
          });
        });
        
        this.memoryObserver.observe({ entryTypes: ['measure'] });
      }
    } catch (error) {
      console.warn('Failed to initialize performance observers:', error);
    }
    
    this.emit('monitor_initialized');
  }

  // Main monitoring methods
  startMonitoring(renderingContext?: any, gpuAdapter?: any): void {
    if (this.isMonitoring) return;
    
    this.renderingContext = renderingContext;
    this.gpuAdapter = gpuAdapter;
    this.isMonitoring = true;
    
    // Start metrics collection
    this.metricsTimer = setInterval(() => {
      this.collectMetrics();
    }, PERFORMANCE_CONFIG.METRICS_UPDATE_INTERVAL);
    
    // Start optimization checks
    this.optimizationTimer = setInterval(() => {
      this.checkOptimizations();
    }, PERFORMANCE_CONFIG.OPTIMIZATION_CHECK_INTERVAL);
    
    this.emit('monitoring_started');
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = null;
    }
    
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
      this.optimizationTimer = null;
    }
    
    this.emit('monitoring_stopped');
  }

  // Metrics collection
  private async collectMetrics(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Collect frame timing metrics
      await this.collectFrameMetrics();
      
      // Collect GPU metrics
      await this.collectGPUMetrics();
      
      // Collect memory metrics
      await this.collectMemoryMetrics();
      
      // Collect rendering metrics
      await this.collectRenderingMetrics();
      
      // Calculate derived metrics
      this.calculateDerivedMetrics();
      
      // Store history
      this.storeMetricsHistory();
      
      // Analyze performance
      this.analyzePerformance();
      
      this.emit('metrics_updated', this.currentMetrics);
      
    } catch (error) {
      console.error('Failed to collect metrics:', error);
    }
    
    const collectionTime = performance.now() - startTime;
    this.currentMetrics.mainThreadTime = collectionTime;
  }

  private async collectFrameMetrics(): Promise<void> {
    const currentTime = performance.now();
    
    // Add current frame time
    if (this.frameTimings.length > 0) {
      const frameTime = currentTime - this.frameTimings[this.frameTimings.length - 1];
      this.frameTimings.push(currentTime);
      
      // Keep only recent frames
      const cutoffTime = currentTime - (PERFORMANCE_CONFIG.FPS_ANALYSIS_WINDOW * 1000 / PERFORMANCE_CONFIG.TARGET_FPS);
      this.frameTimings = this.frameTimings.filter(time => time > cutoffTime);
      
      // Calculate FPS and frame time
      if (this.frameTimings.length > 1) {
        const totalTime = this.frameTimings[this.frameTimings.length - 1] - this.frameTimings[0];
        this.currentMetrics.fps = (this.frameTimings.length - 1) / (totalTime / 1000);
        this.currentMetrics.frameTime = frameTime;
      }
      
      // Calculate frame pacing (variance in frame times)
      if (this.frameTimings.length >= PERFORMANCE_CONFIG.PACING_ANALYSIS_WINDOW) {
        const recentFrameTimes = [];
        for (let i = 1; i < Math.min(PERFORMANCE_CONFIG.PACING_ANALYSIS_WINDOW, this.frameTimings.length); i++) {
          recentFrameTimes.push(this.frameTimings[i] - this.frameTimings[i - 1]);
        }
        
        const avgFrameTime = recentFrameTimes.reduce((sum, time) => sum + time, 0) / recentFrameTimes.length;
        const variance = recentFrameTimes.reduce((sum, time) => sum + Math.pow(time - avgFrameTime, 2), 0) / recentFrameTimes.length;
        this.currentMetrics.framePacing = Math.sqrt(variance);
      }
    } else {
      this.frameTimings.push(currentTime);
    }
  }

  private async collectGPUMetrics(): Promise<void> {
    if (!this.gpuAdapter) return;
    
    try {
      // Try to get GPU info (WebGPU)
      if (this.gpuAdapter.requestAdapterInfo) {
        const adapterInfo = await this.gpuAdapter.requestAdapterInfo();
        // GPU metrics would be extracted here in a real implementation
      }
      
      // Estimate GPU utilization based on frame timing and complexity
      const targetFrameTime = 1000 / this.currentMetrics.targetFPS;
      const utilizationEstimate = Math.min(100, (this.currentMetrics.frameTime / targetFrameTime) * 100);
      this.currentMetrics.gpuUtilization = utilizationEstimate;
      
      // Memory estimates (would be actual queries in real implementation)
      this.currentMetrics.gpuMemoryUsed = this.estimateGPUMemoryUsage();
      this.currentMetrics.gpuMemoryTotal = this.estimateGPUMemoryTotal();
      
    } catch (error) {
      console.warn('Failed to collect GPU metrics:', error);
    }
  }

  private async collectMemoryMetrics(): Promise<void> {
    try {
      // JavaScript heap memory
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.currentMetrics.memoryUsed = memory.usedJSHeapSize / (1024 * 1024); // MB
        this.currentMetrics.memoryTotal = memory.totalJSHeapSize / (1024 * 1024); // MB
      }
      
      // Estimate texture and buffer memory usage
      this.currentMetrics.textureMemory = this.estimateTextureMemory();
      this.currentMetrics.bufferMemory = this.estimateBufferMemory();
      this.currentMetrics.geometryMemory = this.estimateGeometryMemory();
      
    } catch (error) {
      console.warn('Failed to collect memory metrics:', error);
    }
  }

  private async collectRenderingMetrics(): Promise<void> {
    if (!this.renderingContext) return;
    
    try {
      // These would be actual queries in a real implementation
      this.currentMetrics.drawCalls = this.estimateDrawCalls();
      this.currentMetrics.triangles = this.estimateTriangles();
      this.currentMetrics.vertices = this.estimateVertices();
      this.currentMetrics.textures = this.estimateActiveTextures();
      this.currentMetrics.shaderSwitches = this.estimateShaderSwitches();
      this.currentMetrics.stateChanges = this.estimateStateChanges();
      
    } catch (error) {
      console.warn('Failed to collect rendering metrics:', error);
    }
  }

  private calculateDerivedMetrics(): void {
    // Calculate quality score (0-100)
    const fpsScore = Math.min(100, (this.currentMetrics.fps / this.currentMetrics.targetFPS) * 100);
    const memoryScore = Math.max(0, 100 - (this.currentMetrics.memoryUsed / this.thresholds.maxMemoryUsage) * 100);
    const gpuScore = Math.max(0, 100 - (this.currentMetrics.gpuUtilization / 100) * 100);
    
    this.currentMetrics.qualityScore = (fpsScore + memoryScore + gpuScore) / 3;
    
    // Calculate stability score based on frame pacing
    const maxFramePacing = 10; // ms
    this.currentMetrics.stabilityScore = Math.max(0, 100 - (this.currentMetrics.framePacing / maxFramePacing) * 100);
    
    // Calculate efficiency score based on resource utilization
    const drawCallEfficiency = Math.max(0, 100 - (this.currentMetrics.drawCalls / 1000) * 100);
    const memoryEfficiency = Math.max(0, 100 - (this.currentMetrics.memoryUsed / this.thresholds.maxMemoryUsage) * 100);
    this.currentMetrics.efficiencyScore = (drawCallEfficiency + memoryEfficiency) / 2;
  }

  private storeMetricsHistory(): void {
    const historyEntry: PerformanceHistory = {
      timestamp: performance.now(),
      metrics: { ...this.currentMetrics }
    };
    
    this.performanceHistory.push(historyEntry);
    
    // Keep only recent history
    const cutoffTime = historyEntry.timestamp - PERFORMANCE_CONFIG.HISTORY_RETENTION_TIME;
    this.performanceHistory = this.performanceHistory.filter(entry => entry.timestamp > cutoffTime);
  }

  // Performance analysis
  private analyzePerformance(): void {
    this.detectPerformanceEvents();
    this.detectTrends();
    this.detectBottlenecks();
  }

  private detectPerformanceEvents(): void {
    const metrics = this.currentMetrics;
    
    // FPS drop detection
    if (metrics.fps < this.thresholds.criticalFPS) {
      this.emitPerformanceEvent('fps_drop', 'critical', {
        fps: metrics.fps,
        threshold: this.thresholds.criticalFPS
      }, `Critical FPS drop: ${metrics.fps.toFixed(1)} FPS`);
    } else if (metrics.fps < this.thresholds.warningFPS) {
      this.emitPerformanceEvent('fps_drop', 'warning', {
        fps: metrics.fps,
        threshold: this.thresholds.warningFPS
      }, `FPS below target: ${metrics.fps.toFixed(1)} FPS`);
    }
    
    // Memory pressure detection
    if (metrics.memoryUsed > this.thresholds.criticalMemoryUsage) {
      this.emitPerformanceEvent('memory_pressure', 'critical', {
        memoryUsed: metrics.memoryUsed,
        memoryTotal: metrics.memoryTotal,
        threshold: this.thresholds.criticalMemoryUsage
      }, `Critical memory usage: ${metrics.memoryUsed.toFixed(1)}MB`);
    }
    
    // GPU throttling detection
    if (metrics.gpuUtilization > 95) {
      this.emitPerformanceEvent('gpu_throttling', 'warning', {
        gpuUtilization: metrics.gpuUtilization
      }, `High GPU utilization: ${metrics.gpuUtilization.toFixed(1)}%`);
    }
  }

  private detectTrends(): void {
    if (this.performanceHistory.length < PERFORMANCE_CONFIG.TREND_ANALYSIS_WINDOW) return;
    
    const recentHistory = this.performanceHistory.slice(-PERFORMANCE_CONFIG.TREND_ANALYSIS_WINDOW);
    
    // Analyze FPS trend
    const fpsValues = recentHistory.map(entry => entry.metrics.fps);
    const fpsTrend = this.calculateTrend(fpsValues);
    
    if (fpsTrend < -0.1) { // Declining FPS
      this.emit('performance_trend', {
        type: 'fps_decline',
        trend: fpsTrend,
        description: 'FPS trending downward'
      });
    }
    
    // Analyze memory trend
    const memoryValues = recentHistory.map(entry => entry.metrics.memoryUsed);
    const memoryTrend = this.calculateTrend(memoryValues);
    
    if (memoryTrend > 0.1) { // Rising memory usage
      this.emit('performance_trend', {
        type: 'memory_growth',
        trend: memoryTrend,
        description: 'Memory usage trending upward'
      });
    }
  }

  private detectBottlenecks(): void {
    const metrics = this.currentMetrics;
    
    // High draw calls
    if (metrics.drawCalls > 1000) {
      this.emit('performance_bottleneck', {
        type: 'draw_calls',
        value: metrics.drawCalls,
        description: 'High number of draw calls'
      });
    }
    
    // High triangle count
    if (metrics.triangles > 100000) {
      this.emit('performance_bottleneck', {
        type: 'triangles',
        value: metrics.triangles,
        description: 'High triangle count'
      });
    }
    
    // Excessive state changes
    if (metrics.stateChanges > 100) {
      this.emit('performance_bottleneck', {
        type: 'state_changes',
        value: metrics.stateChanges,
        description: 'Excessive state changes'
      });
    }
  }

  // Optimization system
  private async checkOptimizations(): Promise<void> {
    if (this.isOptimizing) return;
    
    const needsOptimization = this.needsOptimization();
    if (!needsOptimization) return;
    
    this.isOptimizing = true;
    
    try {
      await this.performOptimizations();
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      this.isOptimizing = false;
    }
  }

  private needsOptimization(): boolean {
    const metrics = this.currentMetrics;
    
    // Critical performance issues
    if (metrics.fps < this.thresholds.criticalFPS ||
        metrics.memoryUsed > this.thresholds.criticalMemoryUsage ||
        metrics.gpuUtilization > this.thresholds.criticalGPUUtilization) {
      return true;
    }
    
    // Sustained performance issues
    if (this.performanceHistory.length >= 10) {
      const recentMetrics = this.performanceHistory.slice(-10);
      const avgFPS = recentMetrics.reduce((sum, entry) => sum + entry.metrics.fps, 0) / recentMetrics.length;
      
      if (avgFPS < this.thresholds.warningFPS) {
        return true;
      }
    }
    
    return false;
  }

  private async performOptimizations(): Promise<void> {
    const optimizations = this.selectOptimizations();
    
    for (const optimization of optimizations) {
      try {
        await optimization.execute();
        this.appliedOptimizations.push(optimization);
        
        this.emitPerformanceEvent('quality_change', 'info', {
          optimization: optimization.type,
          impact: optimization.impact
        }, `Applied optimization: ${optimization.type}`);
        
        // Wait a bit to see the effect
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if optimization helped
        if (this.currentMetrics.fps > this.thresholds.warningFPS) {
          break; // Optimization successful
        }
        
      } catch (error) {
        console.error(`Failed to apply optimization ${optimization.type}:`, error);
      }
    }
  }

  private selectOptimizations(): OptimizationAction[] {
    const optimizations: OptimizationAction[] = [];
    const metrics = this.currentMetrics;
    
    // LOD reduction
    if (metrics.triangles > 50000) {
      optimizations.push({
        type: 'reduce_lod',
        priority: 1,
        impact: 0.3,
        cost: 0.2,
        execute: async () => {
          this.emit('optimization_request', {
            type: 'reduce_lod',
            amount: 0.2
          });
        },
        undo: async () => {
          this.emit('optimization_request', {
            type: 'increase_lod',
            amount: 0.2
          });
        }
      });
    }
    
    // Quality reduction
    if (metrics.gpuUtilization > 90) {
      optimizations.push({
        type: 'reduce_quality',
        priority: 2,
        impact: 0.25,
        cost: 0.3,
        execute: async () => {
          this.emit('optimization_request', {
            type: 'reduce_quality',
            settings: ['shadows', 'antialiasing']
          });
        },
        undo: async () => {
          this.emit('optimization_request', {
            type: 'restore_quality',
            settings: ['shadows', 'antialiasing']
          });
        }
      });
    }
    
    // Memory cleanup
    if (metrics.memoryUsed > this.thresholds.warningMemoryUsage) {
      optimizations.push({
        type: 'cleanup_memory',
        priority: 3,
        impact: 0.2,
        cost: 0.1,
        execute: async () => {
          this.emit('optimization_request', {
            type: 'cleanup_memory'
          });
        },
        undo: async () => {
          // Memory cleanup is generally non-reversible
        }
      });
    }
    
    // Sort by priority and impact
    return optimizations.sort((a, b) => a.priority - b.priority || b.impact - a.impact);
  }

  // Utility methods
  private emitPerformanceEvent(type: PerformanceEvent['type'], severity: PerformanceEvent['severity'], data: any, description: string): void {
    const event: PerformanceEvent = {
      type,
      timestamp: performance.now(),
      severity,
      data,
      description
    };
    
    this.emit('performance_event', event);
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    // Simple linear regression
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  private handlePerformanceMeasure(measure: PerformanceMeasure): void {
    // Handle performance measures from PerformanceObserver
    if (measure.name.startsWith('render-')) {
      this.currentMetrics.renderThreadTime = measure.duration;
    }
  }

  // Estimation methods (would be replaced with actual measurements)
  private estimateGPUMemoryUsage(): number {
    return this.currentMetrics.textureMemory + this.currentMetrics.bufferMemory + this.currentMetrics.geometryMemory;
  }

  private estimateGPUMemoryTotal(): number {
    // Rough estimate - would query actual GPU memory
    return 2048; // MB
  }

  private estimateTextureMemory(): number {
    return this.currentMetrics.textures * 4; // MB estimate
  }

  private estimateBufferMemory(): number {
    return this.currentMetrics.vertices * 0.032 / 1024; // MB estimate
  }

  private estimateGeometryMemory(): number {
    return this.currentMetrics.triangles * 0.072 / 1024; // MB estimate
  }

  private estimateDrawCalls(): number {
    return Math.floor(this.currentMetrics.visibleObjects * 1.2);
  }

  private estimateTriangles(): number {
    return this.currentMetrics.visibleObjects * 100; // Rough estimate
  }

  private estimateVertices(): number {
    return this.currentMetrics.triangles * 3;
  }

  private estimateActiveTextures(): number {
    return Math.floor(this.currentMetrics.visibleObjects * 0.5);
  }

  private estimateShaderSwitches(): number {
    return Math.floor(this.currentMetrics.drawCalls * 0.3);
  }

  private estimateStateChanges(): number {
    return Math.floor(this.currentMetrics.drawCalls * 0.2);
  }

  // Public API methods
  getMetrics(): PerformanceMetrics {
    return { ...this.currentMetrics };
  }

  getHistory(duration?: number): PerformanceHistory[] {
    if (!duration) return [...this.performanceHistory];
    
    const cutoffTime = performance.now() - duration;
    return this.performanceHistory.filter(entry => entry.timestamp > cutoffTime);
  }

  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    this.emit('thresholds_updated', this.thresholds);
  }

  getCurrentProfile(): PerformanceProfile {
    return { ...this.currentProfile };
  }

  setProfile(profile: PerformanceProfile): void {
    this.currentProfile = profile;
    this.thresholds = profile.thresholds;
    this.emit('profile_changed', profile);
  }

  updateRenderingMetrics(metrics: Partial<PerformanceMetrics>): void {
    Object.assign(this.currentMetrics, metrics);
  }

  requestOptimization(type: OptimizationAction['type']): void {
    const optimization = this.optimizationActions.find(opt => opt.type === type);
    if (optimization) {
      optimization.execute();
    }
  }

  undoLastOptimization(): void {
    const lastOptimization = this.appliedOptimizations.pop();
    if (lastOptimization && lastOptimization.undo) {
      lastOptimization.undo();
    }
  }

  resetOptimizations(): void {
    // Undo all applied optimizations
    this.appliedOptimizations.reverse().forEach(optimization => {
      if (optimization.undo) {
        optimization.undo();
      }
    });
    
    this.appliedOptimizations = [];
    this.emit('optimizations_reset');
  }

  destroy(): void {
    this.stopMonitoring();
    
    if (this.memoryObserver) {
      this.memoryObserver.disconnect();
      this.memoryObserver = null;
    }
    
    this.performanceHistory = [];
    this.frameTimings = [];
    this.optimizationActions = [];
    this.appliedOptimizations = [];
    
    this.emit('monitor_destroyed');
  }
}

// Singleton instance for global usage
export const performanceMonitor = new PerformanceMonitor();

// Export types and main class
export type { 
  PerformanceMetrics, 
  PerformanceThresholds, 
  PerformanceEvent, 
  PerformanceHistory, 
  PerformanceProfile,
  OptimizationAction
};
export default PerformanceMonitor; 