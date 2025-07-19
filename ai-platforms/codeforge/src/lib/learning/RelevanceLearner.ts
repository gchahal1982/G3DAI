/**
 * RelevanceLearner.ts - Context Relevance Learning Engine
 * 
 * Implements online learning for context chunk relevance scoring with:
 * - Multi-armed bandit algorithm for optimal context selection
 * - User feedback integration (thumbs up/down)
 * - Merge success metrics tracking
 * - A/B testing for scoring algorithms
 * - Adaptive relevance scoring formula tuning
 */

import { EventEmitter } from 'events';

export interface RelevanceMetrics {
  chunkId: string;
  similarity: number;
  recency: number;
  frequency: number;
  userPin: boolean;
  feedbackScore: number;
  mergeSuccessRate: number;
  timestamp: number;
}

export interface FeedbackEvent {
  chunkId: string;
  userId: string;
  action: 'thumbs_up' | 'thumbs_down' | 'pin' | 'unpin' | 'merge_success' | 'merge_failure';
  context: string;
  sessionId: string;
  timestamp: number;
}

export interface ScoringWeights {
  alpha: number;    // similarity weight
  beta: number;     // recency weight  
  gamma: number;    // frequency weight
  delta: number;    // user pin weight
  epsilon: number;  // feedback weight
}

export interface BanditArm {
  weightConfig: ScoringWeights;
  totalReward: number;
  timesPlayed: number;
  averageReward: number;
  confidence: number;
}

export class RelevanceLearner extends EventEmitter {
  private feedbackHistory: FeedbackEvent[] = [];
  private chunkMetrics: Map<string, RelevanceMetrics> = new Map();
  private banditArms: BanditArm[] = [];
  private currentWeights: ScoringWeights = {
    alpha: 0.4,   // similarity baseline
    beta: 0.2,    // recency
    gamma: 0.2,   // frequency
    delta: 0.1,   // user pin
    epsilon: 0.1  // feedback
  };
  private explorationRate = 0.1;
  private decayFactor = 0.95;
  private minSampleSize = 10;

  constructor() {
    super();
    this.initializeBanditArms();
    this.loadStoredMetrics();
  }

  /**
   * Initialize multi-armed bandit with different weight configurations
   */
  private initializeBanditArms(): void {
    const configs: ScoringWeights[] = [
      // Similarity-focused
      { alpha: 0.6, beta: 0.15, gamma: 0.15, delta: 0.05, epsilon: 0.05 },
      // Balanced baseline
      { alpha: 0.4, beta: 0.2, gamma: 0.2, delta: 0.1, epsilon: 0.1 },
      // Recency-focused
      { alpha: 0.3, beta: 0.4, gamma: 0.15, delta: 0.1, epsilon: 0.05 },
      // Frequency-focused
      { alpha: 0.3, beta: 0.15, gamma: 0.4, delta: 0.1, epsilon: 0.05 },
      // User-preference focused
      { alpha: 0.25, beta: 0.15, gamma: 0.15, delta: 0.3, epsilon: 0.15 },
      // Feedback-driven
      { alpha: 0.3, beta: 0.15, gamma: 0.15, delta: 0.15, epsilon: 0.25 }
    ];

    this.banditArms = configs.map(config => ({
      weightConfig: config,
      totalReward: 0,
      timesPlayed: 0,
      averageReward: 0,
      confidence: 1.0
    }));
  }

  /**
   * Record user feedback for online learning
   */
  async recordFeedback(feedback: FeedbackEvent): Promise<void> {
    try {
      this.feedbackHistory.push(feedback);
      
      // Update chunk metrics based on feedback
      await this.updateChunkMetrics(feedback);
      
      // Update bandit arm rewards
      await this.updateBanditRewards(feedback);
      
      // Trigger learning update
      this.emit('feedback_recorded', feedback);
      
      // Store feedback persistently
      await this.storeFeedback(feedback);
      
    } catch (error) {
      console.error('Error recording feedback:', error);
      this.emit('error', error);
    }
  }

  /**
   * Update chunk relevance metrics based on user feedback
   */
  private async updateChunkMetrics(feedback: FeedbackEvent): Promise<void> {
    let metrics = this.chunkMetrics.get(feedback.chunkId);
    
    if (!metrics) {
      metrics = {
        chunkId: feedback.chunkId,
        similarity: 0,
        recency: 0,
        frequency: 1,
        userPin: false,
        feedbackScore: 0.5,
        mergeSuccessRate: 0.5,
        timestamp: Date.now()
      };
      this.chunkMetrics.set(feedback.chunkId, metrics);
    }

    // Update based on feedback type
    switch (feedback.action) {
      case 'thumbs_up':
        metrics.feedbackScore = Math.min(1.0, metrics.feedbackScore + 0.1);
        break;
      case 'thumbs_down':
        metrics.feedbackScore = Math.max(0.0, metrics.feedbackScore - 0.1);
        break;
      case 'pin':
        metrics.userPin = true;
        break;
      case 'unpin':
        metrics.userPin = false;
        break;
      case 'merge_success':
        metrics.mergeSuccessRate = (metrics.mergeSuccessRate * 0.9) + (1.0 * 0.1);
        break;
      case 'merge_failure':
        metrics.mergeSuccessRate = (metrics.mergeSuccessRate * 0.9) + (0.0 * 0.1);
        break;
    }

    // Update frequency and timestamp
    metrics.frequency += 1;
    metrics.timestamp = Date.now();
  }

  /**
   * Calculate relevance score using current weights
   */
  calculateRelevanceScore(
    similarity: number,
    recency: number,
    frequency: number,
    userPin: boolean,
    chunkId?: string
  ): number {
    const weights = this.getCurrentWeights();
    const metrics = chunkId ? this.chunkMetrics.get(chunkId) : null;
    
    const feedbackScore = metrics?.feedbackScore ?? 0.5;
    const pinScore = userPin ? 1.0 : 0.0;
    
    const score = (
      weights.alpha * similarity +
      weights.beta * recency +
      weights.gamma * Math.log(frequency + 1) / 10 + // log scaling for frequency
      weights.delta * pinScore +
      weights.epsilon * feedbackScore
    );

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Select optimal scoring weights using multi-armed bandit
   */
  private getCurrentWeights(): ScoringWeights {
    // Epsilon-greedy exploration
    if (Math.random() < this.explorationRate) {
      // Explore: random arm
      const randomArm = this.banditArms[Math.floor(Math.random() * this.banditArms.length)];
      return randomArm.weightConfig;
    } else {
      // Exploit: best performing arm
      const bestArm = this.banditArms.reduce((best, current) => 
        current.averageReward > best.averageReward ? current : best
      );
      return bestArm.weightConfig;
    }
  }

  /**
   * Update bandit arm rewards based on feedback
   */
  private async updateBanditRewards(feedback: FeedbackEvent): Promise<void> {
    const reward = this.calculateReward(feedback);
    
    // Find which arm was used for this feedback
    const armIndex = this.findArmUsedForFeedback(feedback);
    if (armIndex >= 0) {
      const arm = this.banditArms[armIndex];
      arm.totalReward += reward;
      arm.timesPlayed += 1;
      arm.averageReward = arm.totalReward / arm.timesPlayed;
      
      // Update confidence using UCB1 algorithm
      const totalPlays = this.banditArms.reduce((sum, a) => sum + a.timesPlayed, 0);
      arm.confidence = arm.averageReward + Math.sqrt(
        (2 * Math.log(totalPlays)) / arm.timesPlayed
      );
    }
  }

  /**
   * Calculate reward value from feedback
   */
  private calculateReward(feedback: FeedbackEvent): number {
    switch (feedback.action) {
      case 'thumbs_up': return 1.0;
      case 'thumbs_down': return -0.5;
      case 'pin': return 0.8;
      case 'unpin': return -0.2;
      case 'merge_success': return 1.5;
      case 'merge_failure': return -1.0;
      default: return 0.0;
    }
  }

  /**
   * Find which bandit arm was used for specific feedback
   */
  private findArmUsedForFeedback(feedback: FeedbackEvent): number {
    // In a real implementation, we'd track which weights were used
    // For now, assume current best arm
    return this.banditArms.findIndex(arm => 
      arm.averageReward === Math.max(...this.banditArms.map(a => a.averageReward))
    );
  }

  /**
   * Get learning analytics and performance metrics
   */
  getAnalytics(): {
    totalFeedback: number;
    positiveRatio: number;
    averageReward: number;
    bestWeights: ScoringWeights;
    armPerformance: BanditArm[];
    recentTrends: any;
  } {
    const totalFeedback = this.feedbackHistory.length;
    const positiveActions = this.feedbackHistory.filter(f => 
      ['thumbs_up', 'pin', 'merge_success'].includes(f.action)
    ).length;
    
    const bestArm = this.banditArms.reduce((best, current) => 
      current.averageReward > best.averageReward ? current : best
    );

    return {
      totalFeedback,
      positiveRatio: totalFeedback > 0 ? positiveActions / totalFeedback : 0,
      averageReward: bestArm.averageReward,
      bestWeights: bestArm.weightConfig,
      armPerformance: [...this.banditArms],
      recentTrends: this.calculateRecentTrends()
    };
  }

  /**
   * Calculate recent performance trends
   */
  private calculateRecentTrends(): any {
    const recentFeedback = this.feedbackHistory.slice(-100); // Last 100 events
    const hourlyStats = new Map<number, { positive: number; total: number }>();
    
    recentFeedback.forEach(feedback => {
      const hour = Math.floor(feedback.timestamp / (1000 * 60 * 60));
      const stats = hourlyStats.get(hour) || { positive: 0, total: 0 };
      
      stats.total += 1;
      if (['thumbs_up', 'pin', 'merge_success'].includes(feedback.action)) {
        stats.positive += 1;
      }
      
      hourlyStats.set(hour, stats);
    });

    return Array.from(hourlyStats.entries()).map(([hour, stats]) => ({
      hour,
      positiveRatio: stats.positive / stats.total,
      total: stats.total
    }));
  }

  /**
   * A/B test different scoring algorithms
   */
  async runABTest(
    testName: string,
    variantWeights: ScoringWeights,
    duration: number = 24 * 60 * 60 * 1000 // 24 hours
  ): Promise<void> {
    console.log(`Starting A/B test: ${testName}`);
    
    // Add variant as new bandit arm
    const variantArm: BanditArm = {
      weightConfig: variantWeights,
      totalReward: 0,
      timesPlayed: 0,
      averageReward: 0,
      confidence: 1.0
    };
    
    this.banditArms.push(variantArm);
    
    // Run test for specified duration
    setTimeout(() => {
      this.analyzeABTestResults(testName, variantArm);
    }, duration);
    
    this.emit('ab_test_started', { testName, variantWeights, duration });
  }

  /**
   * Analyze A/B test results
   */
  private analyzeABTestResults(testName: string, variantArm: BanditArm): void {
    const results = {
      testName,
      variantPerformance: variantArm.averageReward,
      baselinePerformance: this.banditArms[1].averageReward, // Assume index 1 is baseline
      improvement: variantArm.averageReward - this.banditArms[1].averageReward,
      significanceLevel: this.calculateSignificance(variantArm, this.banditArms[1])
    };
    
    console.log(`A/B test results for ${testName}:`, results);
    this.emit('ab_test_completed', results);
    
    // If variant performs significantly better, promote it
    if (results.improvement > 0.1 && results.significanceLevel > 0.95) {
      this.currentWeights = variantArm.weightConfig;
      console.log(`Promoting variant weights for ${testName}`);
    }
  }

  /**
   * Calculate statistical significance between two arms
   */
  private calculateSignificance(armA: BanditArm, armB: BanditArm): number {
    // Simplified significance calculation
    // In production, would use proper statistical tests (t-test, etc.)
    const minSamples = Math.min(armA.timesPlayed, armB.timesPlayed);
    if (minSamples < this.minSampleSize) return 0;
    
    const diff = Math.abs(armA.averageReward - armB.averageReward);
    const avgSample = (armA.timesPlayed + armB.timesPlayed) / 2;
    
    // Rough approximation - replace with proper statistical test
    return Math.min(0.99, diff * Math.sqrt(avgSample) / 2);
  }

  /**
   * Load stored metrics from persistent storage
   */
  private async loadStoredMetrics(): Promise<void> {
    try {
      // In production, load from database/file system
      // For now, initialize empty
      console.log('Loading stored relevance metrics...');
    } catch (error) {
      console.error('Error loading stored metrics:', error);
    }
  }

  /**
   * Store feedback persistently
   */
  private async storeFeedback(feedback: FeedbackEvent): Promise<void> {
    try {
      // In production, store to database
      console.log('Storing feedback:', feedback.action, feedback.chunkId);
    } catch (error) {
      console.error('Error storing feedback:', error);
    }
  }

  /**
   * Export learning data for analysis
   */
  exportLearningData(): {
    feedbackHistory: FeedbackEvent[];
    chunkMetrics: RelevanceMetrics[];
    banditArms: BanditArm[];
    currentWeights: ScoringWeights;
  } {
    return {
      feedbackHistory: [...this.feedbackHistory],
      chunkMetrics: Array.from(this.chunkMetrics.values()),
      banditArms: [...this.banditArms],
      currentWeights: { ...this.currentWeights }
    };
  }

  /**
   * Reset learning state (useful for testing)
   */
  reset(): void {
    this.feedbackHistory = [];
    this.chunkMetrics.clear();
    this.initializeBanditArms();
    this.emit('reset');
  }

  /**
   * Get user-specific preference patterns
   */
  getUserPreferences(userId: string): {
    preferredChunkTypes: string[];
    feedbackPatterns: any;
    optimalWeights: ScoringWeights;
  } {
    const userFeedback = this.feedbackHistory.filter(f => f.userId === userId);
    
    // Analyze user patterns
    const positiveChunks = userFeedback
      .filter(f => ['thumbs_up', 'pin'].includes(f.action))
      .map(f => f.chunkId);
    
    const patterns = this.analyzeFeedbackPatterns(userFeedback);
    
    return {
      preferredChunkTypes: [...new Set(positiveChunks)],
      feedbackPatterns: patterns,
      optimalWeights: this.calculateUserOptimalWeights(userFeedback)
    };
  }

  /**
   * Analyze feedback patterns for insights
   */
  private analyzeFeedbackPatterns(feedback: FeedbackEvent[]): any {
    const patterns = {
      activityByHour: new Array(24).fill(0),
      actionDistribution: {} as Record<string, number>,
      sessionLengths: [] as number[]
    };
    
    feedback.forEach(f => {
      const hour = new Date(f.timestamp).getHours();
      patterns.activityByHour[hour]++;
      patterns.actionDistribution[f.action] = (patterns.actionDistribution[f.action] || 0) + 1;
    });
    
    return patterns;
  }

  /**
   * Calculate optimal weights for specific user
   */
  private calculateUserOptimalWeights(userFeedback: FeedbackEvent[]): ScoringWeights {
    // Simplified user-specific weight optimization
    // In production, would use more sophisticated ML techniques
    
    const totalPositive = userFeedback.filter(f => 
      ['thumbs_up', 'pin', 'merge_success'].includes(f.action)
    ).length;
    
    const totalFeedback = userFeedback.length;
    const positiveRatio = totalFeedback > 0 ? totalPositive / totalFeedback : 0.5;
    
    // Adjust weights based on user behavior
    return {
      alpha: 0.4 + (positiveRatio - 0.5) * 0.2,
      beta: 0.2,
      gamma: 0.2,
      delta: 0.1 + (positiveRatio - 0.5) * 0.1,
      epsilon: 0.1 + (positiveRatio - 0.5) * 0.1
    };
  }
}

export default RelevanceLearner; 