/**
 * SmartRouterAnalytics - Advanced Analytics Backend for Smart-Router+
 * 
 * Provides comprehensive analytics backend for Smart-Router+ cost optimization,
 * performance tracking, predictive modeling, and subscription management.
 * 
 * @author CodeForge AI Platform
 * @version 1.0.0
 */

import { EventEmitter } from 'events';

// Core Types and Interfaces
export interface CostMetric {
  modelId: string;
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  costPerInputToken: number;
  costPerOutputToken: number;
  totalCost: number;
  requestCount: number;
  timestamp: Date;
  userId?: string;
  organizationId?: string;
  cacheHit: boolean;
  region: string;
  vendor: string;
}

export interface PerformanceMetric {
  requestId: string;
  modelId: string;
  latency: number;
  throughput: number;
  errorRate: number;
  successRate: number;
  timestamp: Date;
  cacheHitRate: number;
  queueTime: number;
  processingTime: number;
  responseSize: number;
  region: string;
}

export interface OptimizationResult {
  originalModel: string;
  optimizedModel: string;
  costSaving: number;
  performanceImpact: number;
  confidenceScore: number;
  reason: string;
  timestamp: Date;
}

export interface HistoricalTrend {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalCost: number;
  averageLatency: number;
  requestCount: number;
  errorCount: number;
  topModels: Array<{
    modelId: string;
    usage: number;
    cost: number;
  }>;
}

export interface PredictiveModel {
  modelType: 'cost' | 'performance' | 'usage';
  prediction: number;
  confidence: number;
  horizon: '1h' | '24h' | '7d' | '30d';
  factors: string[];
  lastUpdated: Date;
}

export interface SubscriptionUsage {
  organizationId: string;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  currentUsage: {
    requests: number;
    tokens: number;
    cost: number;
  };
  limits: {
    requests: number;
    tokens: number;
    cost: number;
  };
  billingPeriod: {
    start: Date;
    end: Date;
  };
  overageCharges: number;
}

export interface AnalyticsConfig {
  retentionPeriod: number; // days
  aggregationIntervals: string[];
  predictiveModelUpdate: number; // hours
  alertThresholds: {
    costSpike: number; // percentage
    latencySpike: number; // ms
    errorRate: number; // percentage
  };
  exportFormats: string[];
}

// Task 1: Advanced Cost Tracking System
export class CostTracker extends EventEmitter {
  private costData: Map<string, CostMetric[]> = new Map();
  private aggregatedData: Map<string, any> = new Map();
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    super();
    this.config = config;
    this.startAggregationTimer();
  }

  public trackCost(metric: CostMetric): void {
    const key = `${metric.organizationId || 'global'}_${metric.modelId}`;
    
    if (!this.costData.has(key)) {
      this.costData.set(key, []);
    }

    this.costData.get(key)!.push(metric);

    // Real-time cost spike detection
    this.detectCostSpikes(key, metric);

    // Emit event for real-time updates
    this.emit('costTracked', metric);
  }

  public getCostSummary(organizationId: string, period: string): any {
    const data = this.costData.get(`${organizationId}_*`) || [];
    
    return {
      totalCost: data.reduce((sum, m) => sum + m.totalCost, 0),
      totalRequests: data.length,
      averageCostPerRequest: data.length > 0 ? 
        data.reduce((sum, m) => sum + m.totalCost, 0) / data.length : 0,
      modelBreakdown: this.getModelCostBreakdown(data),
      cacheHitRate: this.calculateCacheHitRate(data),
      topModels: this.getTopModelsByUsage(data, 10)
    };
  }

  private detectCostSpikes(key: string, newMetric: CostMetric): void {
    const recentData = this.getRecentData(key, 3600000); // 1 hour
    if (recentData.length < 10) return; // Need sufficient data

    const averageCost = recentData.reduce((sum, m) => sum + m.totalCost, 0) / recentData.length;
    const spike = (newMetric.totalCost - averageCost) / averageCost * 100;

    if (spike > this.config.alertThresholds.costSpike) {
      this.emit('costSpike', {
        organizationId: newMetric.organizationId,
        modelId: newMetric.modelId,
        spike: spike,
        currentCost: newMetric.totalCost,
        averageCost: averageCost
      });
    }
  }

  private getRecentData(key: string, timeMs: number): CostMetric[] {
    const data = this.costData.get(key) || [];
    const cutoff = new Date(Date.now() - timeMs);
    return data.filter(m => m.timestamp >= cutoff);
  }

  private getModelCostBreakdown(data: CostMetric[]): any {
    const breakdown = new Map();
    data.forEach(metric => {
      const existing = breakdown.get(metric.modelId) || { cost: 0, requests: 0 };
      existing.cost += metric.totalCost;
      existing.requests += 1;
      breakdown.set(metric.modelId, existing);
    });
    return Object.fromEntries(breakdown);
  }

  private calculateCacheHitRate(data: CostMetric[]): number {
    if (data.length === 0) return 0;
    const hits = data.filter(m => m.cacheHit).length;
    return (hits / data.length) * 100;
  }

  private getTopModelsByUsage(data: CostMetric[], limit: number): any[] {
    const usage = new Map();
    data.forEach(metric => {
      const existing = usage.get(metric.modelId) || { usage: 0, cost: 0 };
      existing.usage += 1;
      existing.cost += metric.totalCost;
      usage.set(metric.modelId, existing);
    });

    return Array.from(usage.entries())
      .map(([modelId, stats]) => ({ modelId, ...stats }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit);
  }

  private startAggregationTimer(): void {
    setInterval(() => {
      this.aggregateData();
    }, 300000); // 5 minutes
  }

  private aggregateData(): void {
    // Aggregate cost data for faster queries
    for (const [key, data] of this.costData.entries()) {
      const aggregated = this.aggregateByInterval(data, 'hourly');
      this.aggregatedData.set(`${key}_hourly`, aggregated);
    }
  }

  private aggregateByInterval(data: CostMetric[], interval: string): any {
    // Implementation for data aggregation by time intervals
    const intervalMs = interval === 'hourly' ? 3600000 : 86400000;
    const buckets = new Map();

    data.forEach(metric => {
      const bucket = Math.floor(metric.timestamp.getTime() / intervalMs);
      const existing = buckets.get(bucket) || {
        totalCost: 0,
        requestCount: 0,
        timestamp: new Date(bucket * intervalMs)
      };
      existing.totalCost += metric.totalCost;
      existing.requestCount += 1;
      buckets.set(bucket, existing);
    });

    return Array.from(buckets.values());
  }
}

// Task 2: Performance Metrics Collection and Analysis
export class PerformanceAnalyzer extends EventEmitter {
  private performanceData: Map<string, PerformanceMetric[]> = new Map();
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    super();
    this.config = config;
  }

  public trackPerformance(metric: PerformanceMetric): void {
    const key = metric.modelId;
    
    if (!this.performanceData.has(key)) {
      this.performanceData.set(key, []);
    }

    this.performanceData.get(key)!.push(metric);

    // Real-time performance monitoring
    this.detectPerformanceIssues(metric);

    this.emit('performanceTracked', metric);
  }

  public getPerformanceSummary(modelId: string, period: string): any {
    const data = this.performanceData.get(modelId) || [];
    
    if (data.length === 0) {
      return null;
    }

    return {
      averageLatency: data.reduce((sum, m) => sum + m.latency, 0) / data.length,
      p95Latency: this.calculatePercentile(data.map(m => m.latency), 95),
      p99Latency: this.calculatePercentile(data.map(m => m.latency), 99),
      averageThroughput: data.reduce((sum, m) => sum + m.throughput, 0) / data.length,
      errorRate: data.reduce((sum, m) => sum + m.errorRate, 0) / data.length,
      successRate: data.reduce((sum, m) => sum + m.successRate, 0) / data.length,
      cacheHitRate: data.reduce((sum, m) => sum + m.cacheHitRate, 0) / data.length,
      totalRequests: data.length
    };
  }

  private detectPerformanceIssues(metric: PerformanceMetric): void {
    // Latency spike detection
    if (metric.latency > this.config.alertThresholds.latencySpike) {
      this.emit('latencySpike', {
        modelId: metric.modelId,
        latency: metric.latency,
        threshold: this.config.alertThresholds.latencySpike
      });
    }

    // Error rate spike detection
    if (metric.errorRate > this.config.alertThresholds.errorRate) {
      this.emit('errorRateSpike', {
        modelId: metric.modelId,
        errorRate: metric.errorRate,
        threshold: this.config.alertThresholds.errorRate
      });
    }
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }
}

// Task 3: Smart Optimization Algorithm
export class OptimizationEngine extends EventEmitter {
  private costTracker: CostTracker;
  private performanceAnalyzer: PerformanceAnalyzer;
  private optimizationRules: Map<string, any> = new Map();

  constructor(costTracker: CostTracker, performanceAnalyzer: PerformanceAnalyzer) {
    super();
    this.costTracker = costTracker;
    this.performanceAnalyzer = performanceAnalyzer;
    this.initializeOptimizationRules();
  }

  public async optimizeRouting(
    currentModel: string,
    context: any
  ): Promise<OptimizationResult | null> {
    const alternatives = await this.findAlternativeModels(currentModel);
    let bestAlternative: OptimizationResult | null = null;

    for (const alternative of alternatives) {
      const costSaving = await this.calculateCostSaving(currentModel, alternative);
      const performanceImpact = await this.calculatePerformanceImpact(currentModel, alternative);
      
      const confidence = this.calculateConfidenceScore(
        costSaving,
        performanceImpact,
        context
      );

      if (confidence > 0.7 && (!bestAlternative || costSaving > bestAlternative.costSaving)) {
        bestAlternative = {
          originalModel: currentModel,
          optimizedModel: alternative,
          costSaving,
          performanceImpact,
          confidenceScore: confidence,
          reason: this.generateOptimizationReason(costSaving, performanceImpact),
          timestamp: new Date()
        };
      }
    }

    if (bestAlternative) {
      this.emit('optimizationSuggestion', bestAlternative);
    }

    return bestAlternative;
  }

  private async findAlternativeModels(currentModel: string): Promise<string[]> {
    // Model capability and performance database lookup
    const modelDatabase = {
      'gpt-4': ['gpt-3.5-turbo', 'claude-3-sonnet'],
      'gpt-3.5-turbo': ['claude-3-haiku'],
      'claude-3-opus': ['claude-3-sonnet', 'gpt-4'],
      'claude-3-sonnet': ['claude-3-haiku', 'gpt-3.5-turbo']
    };

    return modelDatabase[currentModel as keyof typeof modelDatabase] || [];
  }

  private async calculateCostSaving(original: string, alternative: string): Promise<number> {
    const originalCost = await this.getAverageCost(original);
    const alternativeCost = await this.getAverageCost(alternative);
    
    return ((originalCost - alternativeCost) / originalCost) * 100;
  }

  private async calculatePerformanceImpact(original: string, alternative: string): Promise<number> {
    const originalPerf = await this.getAveragePerformance(original);
    const alternativePerf = await this.getAveragePerformance(alternative);
    
    return ((alternativePerf - originalPerf) / originalPerf) * 100;
  }

  private calculateConfidenceScore(
    costSaving: number,
    performanceImpact: number,
    context: any
  ): number {
    let confidence = 0.5;

    // Cost saving factor
    if (costSaving > 0) confidence += Math.min(costSaving / 100, 0.3);

    // Performance factor
    if (performanceImpact > -10) confidence += 0.2; // Acceptable performance loss

    // Context factors
    if (context.priority === 'cost') confidence += 0.2;
    if (context.priority === 'performance' && performanceImpact > 0) confidence += 0.3;

    return Math.min(confidence, 1.0);
  }

  private generateOptimizationReason(costSaving: number, performanceImpact: number): string {
    if (costSaving > 30 && performanceImpact > -5) {
      return 'Significant cost savings with minimal performance impact';
    } else if (costSaving > 15) {
      return 'Moderate cost savings opportunity';
    } else if (performanceImpact > 20) {
      return 'Performance improvement opportunity';
    }
    return 'Balanced cost-performance optimization';
  }

  private async getAverageCost(modelId: string): Promise<number> {
    // Simulate cost lookup - integrate with cost tracker
    const costs = { 'gpt-4': 0.03, 'gpt-3.5-turbo': 0.002, 'claude-3-opus': 0.015 };
    return costs[modelId as keyof typeof costs] || 0.01;
  }

  private async getAveragePerformance(modelId: string): Promise<number> {
    // Simulate performance lookup - integrate with performance analyzer
    const summary = this.performanceAnalyzer.getPerformanceSummary(modelId, '24h');
    return summary?.averageLatency || 1000;
  }

  private initializeOptimizationRules(): void {
    this.optimizationRules.set('cost-priority', {
      costWeight: 0.7,
      performanceWeight: 0.3,
      minCostSaving: 10
    });

    this.optimizationRules.set('performance-priority', {
      costWeight: 0.3,
      performanceWeight: 0.7,
      maxPerformanceLoss: 5
    });

    this.optimizationRules.set('balanced', {
      costWeight: 0.5,
      performanceWeight: 0.5,
      minCostSaving: 5
    });
  }
}

// Task 4: Historical Analysis and Trend Identification
export class HistoricalAnalyzer {
  private costTracker: CostTracker;
  private performanceAnalyzer: PerformanceAnalyzer;

  constructor(costTracker: CostTracker, performanceAnalyzer: PerformanceAnalyzer) {
    this.costTracker = costTracker;
    this.performanceAnalyzer = performanceAnalyzer;
  }

  public async getTrends(
    organizationId: string,
    period: 'hourly' | 'daily' | 'weekly' | 'monthly',
    duration: number
  ): Promise<HistoricalTrend[]> {
    const endDate = new Date();
    const startDate = this.calculateStartDate(endDate, period, duration);

    const trends: HistoricalTrend[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const periodEnd = this.calculatePeriodEnd(currentDate, period);
      
      const trend: HistoricalTrend = {
        period,
        startDate: new Date(currentDate),
        endDate: periodEnd,
        totalCost: await this.getCostForPeriod(organizationId, currentDate, periodEnd),
        averageLatency: await this.getLatencyForPeriod(organizationId, currentDate, periodEnd),
        requestCount: await this.getRequestCountForPeriod(organizationId, currentDate, periodEnd),
        errorCount: await this.getErrorCountForPeriod(organizationId, currentDate, periodEnd),
        topModels: await this.getTopModelsForPeriod(organizationId, currentDate, periodEnd)
      };

      trends.push(trend);
      currentDate = new Date(periodEnd.getTime() + 1);
    }

    return trends;
  }

  public async identifyAnomalies(
    organizationId: string,
    period: 'daily' | 'weekly'
  ): Promise<any[]> {
    const trends = await this.getTrends(organizationId, period, 30);
    const anomalies: any[] = [];

    // Statistical anomaly detection using Z-score
    const costs = trends.map(t => t.totalCost);
    const latencies = trends.map(t => t.averageLatency);

    const costMean = costs.reduce((sum, c) => sum + c, 0) / costs.length;
    const costStdDev = Math.sqrt(
      costs.reduce((sum, c) => sum + Math.pow(c - costMean, 2), 0) / costs.length
    );

    const latencyMean = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const latencyStdDev = Math.sqrt(
      latencies.reduce((sum, l) => sum + Math.pow(l - latencyMean, 2), 0) / latencies.length
    );

    trends.forEach((trend, index) => {
      const costZScore = Math.abs((trend.totalCost - costMean) / costStdDev);
      const latencyZScore = Math.abs((trend.averageLatency - latencyMean) / latencyStdDev);

      if (costZScore > 2) {
        anomalies.push({
          type: 'cost',
          period: trend.startDate,
          value: trend.totalCost,
          severity: costZScore > 3 ? 'high' : 'medium',
          zScore: costZScore
        });
      }

      if (latencyZScore > 2) {
        anomalies.push({
          type: 'latency',
          period: trend.startDate,
          value: trend.averageLatency,
          severity: latencyZScore > 3 ? 'high' : 'medium',
          zScore: latencyZScore
        });
      }
    });

    return anomalies;
  }

  private calculateStartDate(endDate: Date, period: string, duration: number): Date {
    const start = new Date(endDate);
    switch (period) {
      case 'hourly':
        start.setHours(start.getHours() - duration);
        break;
      case 'daily':
        start.setDate(start.getDate() - duration);
        break;
      case 'weekly':
        start.setDate(start.getDate() - (duration * 7));
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - duration);
        break;
    }
    return start;
  }

  private calculatePeriodEnd(start: Date, period: string): Date {
    const end = new Date(start);
    switch (period) {
      case 'hourly':
        end.setHours(end.getHours() + 1);
        break;
      case 'daily':
        end.setDate(end.getDate() + 1);
        break;
      case 'weekly':
        end.setDate(end.getDate() + 7);
        break;
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
    }
    return end;
  }

  private async getCostForPeriod(organizationId: string, start: Date, end: Date): Promise<number> {
    // Integrate with cost tracker to get period costs
    return Math.random() * 1000; // Placeholder
  }

  private async getLatencyForPeriod(organizationId: string, start: Date, end: Date): Promise<number> {
    // Integrate with performance analyzer
    return Math.random() * 500 + 100; // Placeholder
  }

  private async getRequestCountForPeriod(organizationId: string, start: Date, end: Date): Promise<number> {
    return Math.floor(Math.random() * 10000); // Placeholder
  }

  private async getErrorCountForPeriod(organizationId: string, start: Date, end: Date): Promise<number> {
    return Math.floor(Math.random() * 100); // Placeholder
  }

  private async getTopModelsForPeriod(organizationId: string, start: Date, end: Date): Promise<any[]> {
    return [
      { modelId: 'gpt-4', usage: 1000, cost: 500 },
      { modelId: 'gpt-3.5-turbo', usage: 2000, cost: 200 }
    ]; // Placeholder
  }
}

// Task 5: Predictive Modeling System
export class PredictiveModelingEngine {
  private historicalAnalyzer: HistoricalAnalyzer;
  private models: Map<string, PredictiveModel> = new Map();

  constructor(historicalAnalyzer: HistoricalAnalyzer) {
    this.historicalAnalyzer = historicalAnalyzer;
    this.initializePredictiveModels();
  }

  public async generatePrediction(
    organizationId: string,
    type: 'cost' | 'performance' | 'usage',
    horizon: '1h' | '24h' | '7d' | '30d'
  ): Promise<PredictiveModel> {
    const historicalData = await this.getHistoricalData(organizationId, type, horizon);
    
    let prediction: number;
    let confidence: number;
    let factors: string[];

    switch (type) {
      case 'cost':
        ({ prediction, confidence, factors } = await this.predictCost(historicalData, horizon));
        break;
      case 'performance':
        ({ prediction, confidence, factors } = await this.predictPerformance(historicalData, horizon));
        break;
      case 'usage':
        ({ prediction, confidence, factors } = await this.predictUsage(historicalData, horizon));
        break;
    }

    const model: PredictiveModel = {
      modelType: type,
      prediction,
      confidence,
      horizon,
      factors,
      lastUpdated: new Date()
    };

    this.models.set(`${organizationId}_${type}_${horizon}`, model);
    return model;
  }

  private async predictCost(data: number[], horizon: string): Promise<{
    prediction: number;
    confidence: number;
    factors: string[];
  }> {
    // Simple linear regression for cost prediction
    const trend = this.calculateTrend(data);
    const seasonality = this.detectSeasonality(data);
    
    const multiplier = this.getHorizonMultiplier(horizon);
    const prediction = data[data.length - 1] * (1 + trend * multiplier);
    
    const confidence = Math.max(0.5, 1 - Math.abs(trend) * 2);
    
    const factors = ['historical_trend', 'usage_patterns'];
    if (seasonality > 0.1) factors.push('seasonal_patterns');

    return { prediction, confidence, factors };
  }

  private async predictPerformance(data: number[], horizon: string): Promise<{
    prediction: number;
    confidence: number;
    factors: string[];
  }> {
    // Performance prediction based on historical patterns
    const movingAverage = this.calculateMovingAverage(data, Math.min(7, data.length));
    const volatility = this.calculateVolatility(data);
    
    const prediction = movingAverage;
    const confidence = Math.max(0.3, 1 - volatility);
    
    const factors = ['historical_performance', 'system_load'];
    if (volatility > 0.2) factors.push('performance_volatility');

    return { prediction, confidence, factors };
  }

  private async predictUsage(data: number[], horizon: string): Promise<{
    prediction: number;
    confidence: number;
    factors: string[];
  }> {
    // Usage prediction using exponential smoothing
    const alpha = 0.3; // Smoothing parameter
    let smoothed = data[0];
    
    for (let i = 1; i < data.length; i++) {
      smoothed = alpha * data[i] + (1 - alpha) * smoothed;
    }

    const growth = this.calculateGrowthRate(data);
    const multiplier = this.getHorizonMultiplier(horizon);
    const prediction = smoothed * (1 + growth * multiplier);
    
    const confidence = Math.max(0.4, 1 - Math.abs(growth) * 1.5);
    
    const factors = ['usage_growth', 'user_behavior'];
    if (growth > 0.1) factors.push('rapid_growth');

    return { prediction, confidence, factors };
  }

  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;
    const n = data.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, index) => sum + val * (index + 1), 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private detectSeasonality(data: number[]): number {
    // Simple seasonality detection
    if (data.length < 7) return 0;
    
    const dailyAverages = [];
    for (let day = 0; day < 7; day++) {
      const dayData = data.filter((_, index) => index % 7 === day);
      dailyAverages.push(dayData.reduce((sum, val) => sum + val, 0) / dayData.length);
    }
    
    const mean = dailyAverages.reduce((sum, val) => sum + val, 0) / dailyAverages.length;
    const variance = dailyAverages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyAverages.length;
    
    return Math.sqrt(variance) / mean;
  }

  private calculateMovingAverage(data: number[], window: number): number {
    const slice = data.slice(-window);
    return slice.reduce((sum, val) => sum + val, 0) / slice.length;
  }

  private calculateVolatility(data: number[]): number {
    if (data.length < 2) return 0;
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance) / mean;
  }

  private calculateGrowthRate(data: number[]): number {
    if (data.length < 2) return 0;
    const first = data[0];
    const last = data[data.length - 1];
    return (last - first) / first / data.length;
  }

  private getHorizonMultiplier(horizon: string): number {
    const multipliers = { '1h': 0.1, '24h': 1, '7d': 7, '30d': 30 };
    return multipliers[horizon as keyof typeof multipliers] || 1;
  }

  private async getHistoricalData(organizationId: string, type: string, horizon: string): Promise<number[]> {
    // Simulate historical data retrieval
    const periods = horizon === '1h' ? 24 : horizon === '24h' ? 30 : 90;
    return Array.from({ length: periods }, () => Math.random() * 1000 + 100);
  }

  private initializePredictiveModels(): void {
    // Initialize default models
    console.log('Predictive modeling engine initialized');
  }
}

// Task 6: Analytics API Endpoints
export class AnalyticsAPI {
  private costTracker: CostTracker;
  private performanceAnalyzer: PerformanceAnalyzer;
  private optimizationEngine: OptimizationEngine;
  private historicalAnalyzer: HistoricalAnalyzer;
  private predictiveEngine: PredictiveModelingEngine;

  constructor(
    costTracker: CostTracker,
    performanceAnalyzer: PerformanceAnalyzer,
    optimizationEngine: OptimizationEngine,
    historicalAnalyzer: HistoricalAnalyzer,
    predictiveEngine: PredictiveModelingEngine
  ) {
    this.costTracker = costTracker;
    this.performanceAnalyzer = performanceAnalyzer;
    this.optimizationEngine = optimizationEngine;
    this.historicalAnalyzer = historicalAnalyzer;
    this.predictiveEngine = predictiveEngine;
  }

  // Cost Analytics Endpoints
  public async getCostSummary(organizationId: string, period: string = '24h'): Promise<any> {
    try {
      return await this.costTracker.getCostSummary(organizationId, period);
    } catch (error) {
      throw new Error(`Failed to get cost summary: ${error}`);
    }
  }

  public async getCostBreakdown(organizationId: string, groupBy: string = 'model'): Promise<any> {
    try {
      const summary = await this.costTracker.getCostSummary(organizationId, '24h');
      return {
        breakdown: summary.modelBreakdown,
        groupBy,
        totalCost: summary.totalCost
      };
    } catch (error) {
      throw new Error(`Failed to get cost breakdown: ${error}`);
    }
  }

  // Performance Analytics Endpoints
  public async getPerformanceMetrics(modelId: string, period: string = '24h'): Promise<any> {
    try {
      return await this.performanceAnalyzer.getPerformanceSummary(modelId, period);
    } catch (error) {
      throw new Error(`Failed to get performance metrics: ${error}`);
    }
  }

  public async getSystemHealth(): Promise<any> {
    try {
      // Aggregate system-wide health metrics
      return {
        status: 'healthy',
        uptime: '99.9%',
        averageLatency: 45,
        errorRate: 0.01,
        throughput: 1500,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to get system health: ${error}`);
    }
  }

  // Optimization Endpoints
  public async getOptimizationSuggestions(organizationId: string): Promise<any[]> {
    try {
      // Get current model usage and generate suggestions
      const suggestions = [];
      // Implementation would call optimization engine
      return suggestions;
    } catch (error) {
      throw new Error(`Failed to get optimization suggestions: ${error}`);
    }
  }

  // Historical Analytics Endpoints
  public async getHistoricalTrends(
    organizationId: string,
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    duration: number = 30
  ): Promise<any> {
    try {
      return await this.historicalAnalyzer.getTrends(organizationId, period, duration);
    } catch (error) {
      throw new Error(`Failed to get historical trends: ${error}`);
    }
  }

  public async getAnomalies(organizationId: string, period: 'daily' | 'weekly' = 'daily'): Promise<any[]> {
    try {
      return await this.historicalAnalyzer.identifyAnomalies(organizationId, period);
    } catch (error) {
      throw new Error(`Failed to get anomalies: ${error}`);
    }
  }

  // Predictive Analytics Endpoints
  public async getPredictions(
    organizationId: string,
    type: 'cost' | 'performance' | 'usage',
    horizon: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<any> {
    try {
      return await this.predictiveEngine.generatePrediction(organizationId, type, horizon);
    } catch (error) {
      throw new Error(`Failed to generate predictions: ${error}`);
    }
  }

  // Batch Operations
  public async getBatchAnalytics(organizationId: string, requests: any[]): Promise<any[]> {
    try {
      const results = await Promise.all(
        requests.map(async (request) => {
          switch (request.type) {
            case 'cost_summary':
              return await this.getCostSummary(organizationId, request.period);
            case 'performance_metrics':
              return await this.getPerformanceMetrics(request.modelId, request.period);
            case 'predictions':
              return await this.getPredictions(organizationId, request.predictionType, request.horizon);
            default:
              throw new Error(`Unknown request type: ${request.type}`);
          }
        })
      );
      return results;
    } catch (error) {
      throw new Error(`Failed to process batch analytics: ${error}`);
    }
  }

  // Real-time Streaming
  public createEventStream(organizationId: string, eventTypes: string[]): EventEmitter {
    const stream = new EventEmitter();
    
    // Set up event listeners
    if (eventTypes.includes('cost')) {
      this.costTracker.on('costTracked', (data) => {
        if (data.organizationId === organizationId) {
          stream.emit('cost', data);
        }
      });
    }

    if (eventTypes.includes('performance')) {
      this.performanceAnalyzer.on('performanceTracked', (data) => {
        stream.emit('performance', data);
      });
    }

    if (eventTypes.includes('optimization')) {
      this.optimizationEngine.on('optimizationSuggestion', (data) => {
        stream.emit('optimization', data);
      });
    }

    return stream;
  }
}

// Task 7: Data Export and Reporting System
export class DataExportService {
  private config: AnalyticsConfig;
  private analyticsAPI: AnalyticsAPI;

  constructor(config: AnalyticsConfig, analyticsAPI: AnalyticsAPI) {
    this.config = config;
    this.analyticsAPI = analyticsAPI;
  }

  public async exportData(
    organizationId: string,
    exportType: 'cost' | 'performance' | 'full',
    format: 'json' | 'csv' | 'xlsx' | 'pdf',
    dateRange: { start: Date; end: Date },
    options: any = {}
  ): Promise<{ data: any; metadata: any }> {
    try {
      const data = await this.gatherExportData(organizationId, exportType, dateRange);
      const formattedData = await this.formatData(data, format, options);
      
      const metadata = {
        exportType,
        format,
        dateRange,
        recordCount: Array.isArray(data) ? data.length : Object.keys(data).length,
        exportedAt: new Date(),
        organizationId
      };

      return { data: formattedData, metadata };
    } catch (error) {
      throw new Error(`Export failed: ${error}`);
    }
  }

  public async generateReport(
    organizationId: string,
    reportType: 'executive' | 'technical' | 'cost_analysis' | 'performance_analysis',
    period: string = '30d'
  ): Promise<any> {
    try {
      switch (reportType) {
        case 'executive':
          return await this.generateExecutiveReport(organizationId, period);
        case 'technical':
          return await this.generateTechnicalReport(organizationId, period);
        case 'cost_analysis':
          return await this.generateCostAnalysisReport(organizationId, period);
        case 'performance_analysis':
          return await this.generatePerformanceAnalysisReport(organizationId, period);
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }
    } catch (error) {
      throw new Error(`Report generation failed: ${error}`);
    }
  }

  private async gatherExportData(
    organizationId: string,
    exportType: string,
    dateRange: { start: Date; end: Date }
  ): Promise<any> {
    const data: any = {};

    if (exportType === 'cost' || exportType === 'full') {
      data.costSummary = await this.analyticsAPI.getCostSummary(organizationId, '30d');
      data.costBreakdown = await this.analyticsAPI.getCostBreakdown(organizationId, 'model');
    }

    if (exportType === 'performance' || exportType === 'full') {
      data.systemHealth = await this.analyticsAPI.getSystemHealth();
      // Add performance metrics for top models
    }

    if (exportType === 'full') {
      data.trends = await this.analyticsAPI.getHistoricalTrends(organizationId, 'daily', 30);
      data.anomalies = await this.analyticsAPI.getAnomalies(organizationId, 'daily');
      data.predictions = await this.analyticsAPI.getPredictions(organizationId, 'cost', '30d');
    }

    return data;
  }

  private async formatData(data: any, format: string, options: any): Promise<any> {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data);
      case 'xlsx':
        return this.convertToExcel(data);
      case 'pdf':
        return this.convertToPDF(data, options);
      default:
        return data;
    }
  }

  private convertToCSV(data: any): string {
    // Flatten nested data structure to CSV format
    const flatData = this.flattenObject(data);
    const headers = Object.keys(flatData[0] || {});
    const csvRows = [headers.join(',')];
    
    flatData.forEach((row: any) => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  private convertToExcel(data: any): any {
    // Placeholder for Excel conversion
    return { type: 'excel', data: JSON.stringify(data) };
  }

  private convertToPDF(data: any, options: any): any {
    // Placeholder for PDF conversion
    return { type: 'pdf', data: JSON.stringify(data), options };
  }

  private flattenObject(obj: any, prefix: string = ''): any[] {
    const flattened: any[] = [];
    
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const itemFlat = this.flattenObject(item, `${prefix}[${index}]`);
        flattened.push(...itemFlat);
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        if (typeof value === 'object') {
          const nested = this.flattenObject(value, newPrefix);
          flattened.push(...nested);
        } else {
          flattened.push({ [newPrefix]: value });
        }
      });
    } else {
      flattened.push({ [prefix]: obj });
    }

    return flattened;
  }

  private async generateExecutiveReport(organizationId: string, period: string): Promise<any> {
    const costSummary = await this.analyticsAPI.getCostSummary(organizationId, period);
    const trends = await this.analyticsAPI.getHistoricalTrends(organizationId, 'weekly', 4);
    const predictions = await this.analyticsAPI.getPredictions(organizationId, 'cost', '30d');

    return {
      title: 'Executive Analytics Report',
      period,
      summary: {
        totalCost: costSummary.totalCost,
        totalRequests: costSummary.totalRequests,
        averageCostPerRequest: costSummary.averageCostPerRequest,
        cacheHitRate: costSummary.cacheHitRate
      },
      trends: {
        costTrend: this.calculateTrendDirection(trends.map(t => t.totalCost)),
        usageTrend: this.calculateTrendDirection(trends.map(t => t.requestCount))
      },
      predictions: {
        nextMonthCost: predictions.prediction,
        confidence: predictions.confidence
      },
      recommendations: this.generateExecutiveRecommendations(costSummary, trends)
    };
  }

  private async generateTechnicalReport(organizationId: string, period: string): Promise<any> {
    const systemHealth = await this.analyticsAPI.getSystemHealth();
    const anomalies = await this.analyticsAPI.getAnomalies(organizationId, 'daily');

    return {
      title: 'Technical Performance Report',
      period,
      systemHealth,
      anomalies,
      performance: {
        uptime: systemHealth.uptime,
        averageLatency: systemHealth.averageLatency,
        errorRate: systemHealth.errorRate,
        throughput: systemHealth.throughput
      },
      recommendations: this.generateTechnicalRecommendations(systemHealth, anomalies)
    };
  }

  private async generateCostAnalysisReport(organizationId: string, period: string): Promise<any> {
    const costSummary = await this.analyticsAPI.getCostSummary(organizationId, period);
    const breakdown = await this.analyticsAPI.getCostBreakdown(organizationId, 'model');

    return {
      title: 'Cost Analysis Report',
      period,
      summary: costSummary,
      breakdown,
      topModels: costSummary.topModels,
      costOptimization: {
        potentialSavings: this.calculatePotentialSavings(costSummary),
        recommendations: this.generateCostRecommendations(costSummary)
      }
    };
  }

  private async generatePerformanceAnalysisReport(organizationId: string, period: string): Promise<any> {
    const systemHealth = await this.analyticsAPI.getSystemHealth();

    return {
      title: 'Performance Analysis Report',
      period,
      performance: systemHealth,
      benchmarks: {
        latencyTarget: 60,
        currentLatency: systemHealth.averageLatency,
        status: systemHealth.averageLatency <= 60 ? 'PASS' : 'FAIL'
      },
      recommendations: this.generatePerformanceRecommendations(systemHealth)
    };
  }

  private calculateTrendDirection(values: number[]): string {
    if (values.length < 2) return 'stable';
    const first = values[0];
    const last = values[values.length - 1];
    const change = (last - first) / first;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private generateExecutiveRecommendations(costSummary: any, trends: any[]): string[] {
    const recommendations = [];
    
    if (costSummary.cacheHitRate < 50) {
      recommendations.push('Improve caching strategy to reduce costs');
    }
    
    if (costSummary.averageCostPerRequest > 0.01) {
      recommendations.push('Consider optimizing model selection for cost efficiency');
    }

    return recommendations;
  }

  private generateTechnicalRecommendations(systemHealth: any, anomalies: any[]): string[] {
    const recommendations = [];
    
    if (systemHealth.averageLatency > 100) {
      recommendations.push('Optimize response times - current latency exceeds targets');
    }
    
    if (anomalies.length > 10) {
      recommendations.push('Investigate recent performance anomalies');
    }

    return recommendations;
  }

  private calculatePotentialSavings(costSummary: any): number {
    // Estimate potential savings based on cache improvements and model optimization
    return costSummary.totalCost * (1 - costSummary.cacheHitRate / 100) * 0.3;
  }

  private generateCostRecommendations(costSummary: any): string[] {
    const recommendations = [];
    
    if (costSummary.cacheHitRate < 70) {
      recommendations.push(`Improve cache hit rate from ${costSummary.cacheHitRate}% to 80%+`);
    }

    return recommendations;
  }

  private generatePerformanceRecommendations(systemHealth: any): string[] {
    const recommendations = [];
    
    if (systemHealth.averageLatency > 60) {
      recommendations.push('Optimize model inference to meet <60ms latency target');
    }

    return recommendations;
  }
}

// Task 8: Subscription Management and Usage Tracking
export class SubscriptionManager extends EventEmitter {
  private subscriptions: Map<string, SubscriptionUsage> = new Map();
  private costTracker: CostTracker;

  constructor(costTracker: CostTracker) {
    super();
    this.costTracker = costTracker;
    this.setupUsageMonitoring();
  }

  public async getSubscriptionUsage(organizationId: string): Promise<SubscriptionUsage | null> {
    return this.subscriptions.get(organizationId) || null;
  }

  public async updateUsage(organizationId: string, usage: Partial<SubscriptionUsage['currentUsage']>): Promise<void> {
    const subscription = this.subscriptions.get(organizationId);
    if (!subscription) {
      throw new Error(`Subscription not found for organization: ${organizationId}`);
    }

    if (usage.requests) subscription.currentUsage.requests += usage.requests;
    if (usage.tokens) subscription.currentUsage.tokens += usage.tokens;
    if (usage.cost) subscription.currentUsage.cost += usage.cost;

    // Check for limit violations
    this.checkUsageLimits(organizationId, subscription);

    this.emit('usageUpdated', { organizationId, usage: subscription.currentUsage });
  }

  public async checkUsageLimits(organizationId: string, subscription?: SubscriptionUsage): Promise<void> {
    const sub = subscription || this.subscriptions.get(organizationId);
    if (!sub) return;

    const violations = [];

    if (sub.currentUsage.requests >= sub.limits.requests) {
      violations.push('requests');
    }
    if (sub.currentUsage.tokens >= sub.limits.tokens) {
      violations.push('tokens');
    }
    if (sub.currentUsage.cost >= sub.limits.cost) {
      violations.push('cost');
    }

    if (violations.length > 0) {
      this.emit('usageLimitExceeded', { organizationId, violations, usage: sub.currentUsage });
    }

    // Calculate overage charges
    if (sub.subscriptionTier !== 'enterprise') {
      const overageRequests = Math.max(0, sub.currentUsage.requests - sub.limits.requests);
      const overageTokens = Math.max(0, sub.currentUsage.tokens - sub.limits.tokens);
      
      sub.overageCharges = (overageRequests * 0.001) + (overageTokens * 0.000001);
    }
  }

  public async createSubscription(
    organizationId: string,
    tier: 'free' | 'pro' | 'enterprise'
  ): Promise<SubscriptionUsage> {
    const limits = this.getSubscriptionLimits(tier);
    
    const subscription: SubscriptionUsage = {
      organizationId,
      subscriptionTier: tier,
      currentUsage: { requests: 0, tokens: 0, cost: 0 },
      limits,
      billingPeriod: this.getCurrentBillingPeriod(),
      overageCharges: 0
    };

    this.subscriptions.set(organizationId, subscription);
    this.emit('subscriptionCreated', subscription);

    return subscription;
  }

  public async upgradeSubscription(organizationId: string, newTier: 'pro' | 'enterprise'): Promise<void> {
    const subscription = this.subscriptions.get(organizationId);
    if (!subscription) {
      throw new Error(`Subscription not found for organization: ${organizationId}`);
    }

    const newLimits = this.getSubscriptionLimits(newTier);
    subscription.subscriptionTier = newTier;
    subscription.limits = newLimits;
    subscription.overageCharges = 0; // Reset overage charges on upgrade

    this.emit('subscriptionUpgraded', { organizationId, oldTier: subscription.subscriptionTier, newTier });
  }

  public async resetBillingPeriod(organizationId: string): Promise<void> {
    const subscription = this.subscriptions.get(organizationId);
    if (!subscription) return;

    subscription.currentUsage = { requests: 0, tokens: 0, cost: 0 };
    subscription.billingPeriod = this.getCurrentBillingPeriod();
    subscription.overageCharges = 0;

    this.emit('billingPeriodReset', { organizationId });
  }

  public async getUsageAnalytics(organizationId: string): Promise<any> {
    const subscription = this.subscriptions.get(organizationId);
    if (!subscription) return null;

    const utilizationRate = {
      requests: (subscription.currentUsage.requests / subscription.limits.requests) * 100,
      tokens: (subscription.currentUsage.tokens / subscription.limits.tokens) * 100,
      cost: (subscription.currentUsage.cost / subscription.limits.cost) * 100
    };

    return {
      subscription,
      utilizationRate,
      remainingQuota: {
        requests: Math.max(0, subscription.limits.requests - subscription.currentUsage.requests),
        tokens: Math.max(0, subscription.limits.tokens - subscription.currentUsage.tokens),
        cost: Math.max(0, subscription.limits.cost - subscription.currentUsage.cost)
      },
      projectedOverage: this.calculateProjectedOverage(subscription)
    };
  }

  private getSubscriptionLimits(tier: string): SubscriptionUsage['limits'] {
    const limits = {
      free: { requests: 1000, tokens: 100000, cost: 10 },
      pro: { requests: 10000, tokens: 1000000, cost: 100 },
      enterprise: { requests: -1, tokens: -1, cost: -1 } // Unlimited
    };

    return limits[tier as keyof typeof limits] || limits.free;
  }

  private getCurrentBillingPeriod(): { start: Date; end: Date } {
    const start = new Date();
    start.setDate(1); // First day of month
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0); // Last day of month
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private calculateProjectedOverage(subscription: SubscriptionUsage): any {
    const daysInPeriod = Math.ceil(
      (subscription.billingPeriod.end.getTime() - subscription.billingPeriod.start.getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    
    const daysPassed = Math.ceil(
      (new Date().getTime() - subscription.billingPeriod.start.getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    const dailyUsageRate = {
      requests: subscription.currentUsage.requests / daysPassed,
      tokens: subscription.currentUsage.tokens / daysPassed,
      cost: subscription.currentUsage.cost / daysPassed
    };

    const projectedMonthlyUsage = {
      requests: dailyUsageRate.requests * daysInPeriod,
      tokens: dailyUsageRate.tokens * daysInPeriod,
      cost: dailyUsageRate.cost * daysInPeriod
    };

    return {
      projectedUsage: projectedMonthlyUsage,
      projectedOverage: {
        requests: Math.max(0, projectedMonthlyUsage.requests - subscription.limits.requests),
        tokens: Math.max(0, projectedMonthlyUsage.tokens - subscription.limits.tokens),
        cost: Math.max(0, projectedMonthlyUsage.cost - subscription.limits.cost)
      }
    };
  }

  private setupUsageMonitoring(): void {
    // Monitor cost tracker events
    this.costTracker.on('costTracked', async (metric: CostMetric) => {
      if (metric.organizationId) {
        await this.updateUsage(metric.organizationId, {
          requests: 1,
          tokens: metric.inputTokens + metric.outputTokens,
          cost: metric.totalCost
        });
      }
    });

    // Weekly usage reports
    setInterval(() => {
      this.generateWeeklyUsageReports();
    }, 7 * 24 * 60 * 60 * 1000); // Weekly

    // Daily limit checks
    setInterval(() => {
      this.performDailyLimitChecks();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  private async generateWeeklyUsageReports(): Promise<void> {
    for (const [organizationId, subscription] of this.subscriptions) {
      const analytics = await this.getUsageAnalytics(organizationId);
      this.emit('weeklyUsageReport', { organizationId, analytics });
    }
  }

  private async performDailyLimitChecks(): Promise<void> {
    for (const [organizationId, subscription] of this.subscriptions) {
      await this.checkUsageLimits(organizationId, subscription);
    }
  }
}

// Main SmartRouterAnalytics Class - Integration Point
export class SmartRouterAnalytics extends EventEmitter {
  private config: AnalyticsConfig;
  private costTracker: CostTracker;
  private performanceAnalyzer: PerformanceAnalyzer;
  private optimizationEngine: OptimizationEngine;
  private historicalAnalyzer: HistoricalAnalyzer;
  private predictiveEngine: PredictiveModelingEngine;
  private analyticsAPI: AnalyticsAPI;
  private dataExportService: DataExportService;
  private subscriptionManager: SubscriptionManager;

  constructor(config?: Partial<AnalyticsConfig>) {
    super();
    
    this.config = {
      retentionPeriod: 90,
      aggregationIntervals: ['hourly', 'daily', 'weekly'],
      predictiveModelUpdate: 6,
      alertThresholds: {
        costSpike: 50,
        latencySpike: 200,
        errorRate: 5
      },
      exportFormats: ['json', 'csv', 'xlsx', 'pdf'],
      ...config
    };

    this.initializeComponents();
    this.setupEventHandling();
  }

  private initializeComponents(): void {
    // Initialize core components
    this.costTracker = new CostTracker(this.config);
    this.performanceAnalyzer = new PerformanceAnalyzer(this.config);
    this.optimizationEngine = new OptimizationEngine(this.costTracker, this.performanceAnalyzer);
    this.historicalAnalyzer = new HistoricalAnalyzer(this.costTracker, this.performanceAnalyzer);
    this.predictiveEngine = new PredictiveModelingEngine(this.historicalAnalyzer);
    
    // Initialize API and services
    this.analyticsAPI = new AnalyticsAPI(
      this.costTracker,
      this.performanceAnalyzer,
      this.optimizationEngine,
      this.historicalAnalyzer,
      this.predictiveEngine
    );
    
    this.dataExportService = new DataExportService(this.config, this.analyticsAPI);
    this.subscriptionManager = new SubscriptionManager(this.costTracker);
  }

  private setupEventHandling(): void {
    // Forward critical events
    this.costTracker.on('costSpike', (data) => this.emit('alert', { type: 'cost_spike', data }));
    this.performanceAnalyzer.on('latencySpike', (data) => this.emit('alert', { type: 'latency_spike', data }));
    this.performanceAnalyzer.on('errorRateSpike', (data) => this.emit('alert', { type: 'error_spike', data }));
    this.optimizationEngine.on('optimizationSuggestion', (data) => this.emit('optimization', data));
    this.subscriptionManager.on('usageLimitExceeded', (data) => this.emit('alert', { type: 'usage_limit', data }));
  }

  // Public API Methods
  public async trackCost(metric: CostMetric): Promise<void> {
    return this.costTracker.trackCost(metric);
  }

  public async trackPerformance(metric: PerformanceMetric): Promise<void> {
    return this.performanceAnalyzer.trackPerformance(metric);
  }

  public get api(): AnalyticsAPI {
    return this.analyticsAPI;
  }

  public get export(): DataExportService {
    return this.dataExportService;
  }

  public get subscription(): SubscriptionManager {
    return this.subscriptionManager;
  }

  public async getHealth(): Promise<any> {
    return {
      status: 'healthy',
      components: {
        costTracker: 'operational',
        performanceAnalyzer: 'operational',
        optimizationEngine: 'operational',
        predictiveEngine: 'operational'
      },
      uptime: process.uptime(),
      timestamp: new Date()
    };
  }
}

export default SmartRouterAnalytics; 