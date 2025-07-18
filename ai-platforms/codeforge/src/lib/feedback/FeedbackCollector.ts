import { EventEmitter } from 'events';

// Core feedback types
export interface Feedback {
  id: string;
  type: FeedbackType;
  target: FeedbackTarget;
  rating: number; // 1-5 or -1 to 1 depending on type
  comment?: string;
  metadata: FeedbackMetadata;
  context: FeedbackContext;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  processed: boolean;
}

export enum FeedbackType {
  THUMBS_UP_DOWN = 'thumbs_up_down', // -1 or 1
  STAR_RATING = 'star_rating', // 1-5
  CODE_QUALITY = 'code_quality', // 1-5
  RELEVANCE = 'relevance', // 1-5
  USEFULNESS = 'usefulness', // 1-5
  ACCURACY = 'accuracy', // 1-5
  PERFORMANCE = 'performance', // 1-5
  SUGGESTION_ACCEPTANCE = 'suggestion_acceptance', // -1 or 1
  BUG_REPORT = 'bug_report',
  FEATURE_REQUEST = 'feature_request'
}

export interface FeedbackTarget {
  type: TargetType;
  id: string;
  agentId?: string;
  component?: string;
  feature?: string;
  version?: string;
}

export enum TargetType {
  CODE_SUGGESTION = 'code_suggestion',
  AI_AGENT = 'ai_agent',
  WORKFLOW = 'workflow',
  GHOST_BRANCH = 'ghost_branch',
  DOCUMENTATION = 'documentation',
  FEATURE = 'feature',
  PERFORMANCE = 'performance',
  USER_INTERFACE = 'user_interface',
  SEARCH_RESULTS = 'search_results',
  AUTOCOMPLETE = 'autocomplete'
}

export interface FeedbackMetadata {
  source: string; // Component that generated the feedback
  version: string;
  environment: string;
  deviceInfo?: DeviceInfo;
  userAgent?: string;
  location?: string;
}

export interface DeviceInfo {
  platform: string;
  browser: string;
  screenResolution: string;
  viewportSize: string;
  touchSupport: boolean;
}

export interface FeedbackContext {
  taskId?: string;
  workflowId?: string;
  fileContext?: FileContext;
  codeContext?: CodeContext;
  searchQuery?: string;
  previousActions?: string[];
  currentState?: Record<string, any>;
}

export interface FileContext {
  filePath: string;
  language: string;
  lineNumber?: number;
  function?: string;
  class?: string;
}

export interface CodeContext {
  beforeCode: string;
  suggestedCode: string;
  afterCode: string;
  applied: boolean;
  modifications?: string[];
}

// Aggregated feedback analytics
export interface FeedbackAnalytics {
  summary: FeedbackSummary;
  trends: FeedbackTrends;
  patterns: FeedbackPatterns;
  insights: FeedbackInsights;
  recommendations: FeedbackRecommendations;
}

export interface FeedbackSummary {
  totalFeedback: number;
  averageRating: number;
  positiveFeedback: number;
  negativeFeedback: number;
  byType: Record<FeedbackType, FeedbackTypeStats>;
  byTarget: Record<TargetType, FeedbackTargetStats>;
  byAgent: Record<string, AgentFeedbackStats>;
  timeRange: TimeRange;
}

export interface FeedbackTypeStats {
  count: number;
  averageRating: number;
  positiveRatio: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface FeedbackTargetStats {
  count: number;
  averageRating: number;
  improvementScore: number;
  criticalIssues: number;
}

export interface AgentFeedbackStats {
  agentId: string;
  agentName: string;
  totalFeedback: number;
  averageRating: number;
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
}

export interface TimeRange {
  start: Date;
  end: Date;
  period: 'hour' | 'day' | 'week' | 'month';
}

export interface FeedbackTrends {
  hourly: TrendPoint[];
  daily: TrendPoint[];
  weekly: TrendPoint[];
  monthly: TrendPoint[];
}

export interface TrendPoint {
  timestamp: Date;
  value: number;
  count: number;
  category?: string;
}

export interface FeedbackPatterns {
  commonIssues: IssuePattern[];
  userBehaviors: BehaviorPattern[];
  contextualFactors: ContextualPattern[];
  correlations: CorrelationPattern[];
}

export interface IssuePattern {
  issue: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  affectedFeatures: string[];
  suggestedFixes: string[];
}

export interface BehaviorPattern {
  behavior: string;
  frequency: number;
  userSegment: string;
  triggers: string[];
  outcomes: string[];
}

export interface ContextualPattern {
  context: string;
  impact: number;
  conditions: string[];
  recommendations: string[];
}

export interface CorrelationPattern {
  factor1: string;
  factor2: string;
  correlation: number;
  significance: number;
  insight: string;
}

export interface FeedbackInsights {
  topIssues: InsightItem[];
  keySuccesses: InsightItem[];
  userSentiment: SentimentAnalysis;
  performanceMetrics: PerformanceInsight[];
  aiAgentPerformance: AgentPerformanceInsight[];
}

export interface InsightItem {
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  frequency: number;
  trendDirection: 'improving' | 'degrading' | 'stable';
  actionRequired: boolean;
}

export interface SentimentAnalysis {
  overall: number; // -1 to 1
  byFeature: Record<string, number>;
  byTimeOfDay: Record<string, number>;
  keyPhrases: SentimentPhrase[];
}

export interface SentimentPhrase {
  phrase: string;
  sentiment: number;
  frequency: number;
  context: string[];
}

export interface PerformanceInsight {
  metric: string;
  currentValue: number;
  targetValue: number;
  trend: 'improving' | 'degrading' | 'stable';
  factors: string[];
}

export interface AgentPerformanceInsight {
  agentId: string;
  agentName: string;
  overallScore: number;
  strengths: string[];
  opportunities: string[];
  compareToAverage: number;
}

export interface FeedbackRecommendations {
  immediate: Recommendation[];
  shortTerm: Recommendation[];
  longTerm: Recommendation[];
  experimental: Recommendation[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  category: string;
  implementation: string[];
  expectedOutcome: string;
  successMetrics: string[];
}

// Model tuning integration
export interface ModelTuningData {
  feedbackId: string;
  modelId: string;
  inputData: any;
  expectedOutput: any;
  actualOutput: any;
  userCorrection?: any;
  weight: number; // Based on feedback confidence/quality
  context: ModelContext;
}

export interface ModelContext {
  task: string;
  domain: string;
  complexity: number;
  userExperience: 'beginner' | 'intermediate' | 'expert';
  codeLanguage?: string;
  framework?: string;
}

// Feedback collection strategies
export interface FeedbackStrategy {
  name: string;
  description: string;
  triggers: FeedbackTrigger[];
  timing: FeedbackTiming;
  presentation: FeedbackPresentation;
  incentives?: FeedbackIncentive[];
}

export interface FeedbackTrigger {
  event: string;
  conditions: string[];
  probability: number; // 0-1, for sampling
}

export interface FeedbackTiming {
  delay: number; // ms
  timeout: number; // ms
  retryStrategy: 'none' | 'delayed' | 'context_change';
  optimalMoments: string[];
}

export interface FeedbackPresentation {
  type: 'modal' | 'inline' | 'toast' | 'sidebar' | 'overlay';
  style: 'minimal' | 'detailed' | 'gamified';
  customization: Record<string, any>;
}

export interface FeedbackIncentive {
  type: 'points' | 'badges' | 'features' | 'recognition';
  value: number;
  threshold: number;
  description: string;
}

// Real-time feedback processing
export interface FeedbackProcessor {
  processImmediate(feedback: Feedback): Promise<ProcessingResult>;
  processBatch(feedbacks: Feedback[]): Promise<BatchProcessingResult>;
  updateModelWeights(tuningData: ModelTuningData[]): Promise<void>;
  generateInsights(timeRange: TimeRange): Promise<FeedbackInsights>;
}

export interface ProcessingResult {
  feedbackId: string;
  processed: boolean;
  actions: ProcessingAction[];
  updates: ModelUpdate[];
  alerts: Alert[];
}

export interface BatchProcessingResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  insights: FeedbackInsights;
  modelUpdates: ModelUpdate[];
}

export interface ProcessingAction {
  type: 'model_update' | 'alert' | 'routing_change' | 'feature_flag';
  target: string;
  parameters: Record<string, any>;
  priority: number;
}

export interface ModelUpdate {
  modelId: string;
  updateType: 'weight' | 'bias' | 'routing' | 'threshold';
  changes: Record<string, number>;
  confidence: number;
}

export interface Alert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  context: string;
  actionRequired: boolean;
}

// Main FeedbackCollector implementation
export class FeedbackCollector extends EventEmitter {
  private feedbacks = new Map<string, Feedback>();
  private analytics: FeedbackAnalytics | null = null;
  private strategies = new Map<string, FeedbackStrategy>();
  private processor: FeedbackProcessor;
  private cacheTimeout = 300000; // 5 minutes
  private lastAnalyticsUpdate = 0;

  constructor() {
    super();
    this.processor = new DefaultFeedbackProcessor();
    this.initializeDefaultStrategies();
    this.startPeriodicProcessing();
  }

  // Core feedback collection
  async collectFeedback(feedback: Omit<Feedback, 'id' | 'timestamp' | 'processed'>): Promise<Feedback> {
    const newFeedback: Feedback = {
      ...feedback,
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      processed: false
    };

    this.feedbacks.set(newFeedback.id, newFeedback);
    this.emit('feedbackCollected', newFeedback);

    // Process immediately for high-priority feedback
    if (this.isHighPriorityFeedback(newFeedback)) {
      await this.processor.processImmediate(newFeedback);
      newFeedback.processed = true;
    }

    return newFeedback;
  }

  // Specific feedback collection methods
  async collectThumbsFeedback(
    targetId: string,
    targetType: TargetType,
    isPositive: boolean,
    context: Partial<FeedbackContext> = {},
    userId?: string,
    sessionId: string = 'anonymous'
  ): Promise<Feedback> {
    return this.collectFeedback({
      type: FeedbackType.THUMBS_UP_DOWN,
      target: {
        type: targetType,
        id: targetId
      },
      rating: isPositive ? 1 : -1,
      metadata: this.generateMetadata(),
      context: context as FeedbackContext,
      userId,
      sessionId
    });
  }

  async collectStarRating(
    targetId: string,
    targetType: TargetType,
    rating: number,
    comment?: string,
    context: Partial<FeedbackContext> = {},
    userId?: string,
    sessionId: string = 'anonymous'
  ): Promise<Feedback> {
    if (rating < 1 || rating > 5) {
      throw new Error('Star rating must be between 1 and 5');
    }

    return this.collectFeedback({
      type: FeedbackType.STAR_RATING,
      target: {
        type: targetType,
        id: targetId
      },
      rating,
      comment,
      metadata: this.generateMetadata(),
      context: context as FeedbackContext,
      userId,
      sessionId
    });
  }

  async collectCodeFeedback(
    suggestionId: string,
    agentId: string,
    accepted: boolean,
    codeContext: CodeContext,
    qualityRating?: number,
    comment?: string,
    userId?: string,
    sessionId: string = 'anonymous'
  ): Promise<Feedback> {
    const feedback = await this.collectFeedback({
      type: FeedbackType.SUGGESTION_ACCEPTANCE,
      target: {
        type: TargetType.CODE_SUGGESTION,
        id: suggestionId,
        agentId
      },
      rating: accepted ? 1 : -1,
      comment,
      metadata: this.generateMetadata(),
      context: {
        codeContext
      },
      userId,
      sessionId
    });

    // Collect additional quality rating if provided
    if (qualityRating !== undefined) {
      await this.collectFeedback({
        type: FeedbackType.CODE_QUALITY,
        target: {
          type: TargetType.CODE_SUGGESTION,
          id: suggestionId,
          agentId
        },
        rating: qualityRating,
        metadata: this.generateMetadata(),
        context: {
          codeContext
        },
        userId,
        sessionId
      });
    }

    return feedback;
  }

  async collectBugReport(
    targetId: string,
    targetType: TargetType,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context: Partial<FeedbackContext> = {},
    userId?: string,
    sessionId: string = 'anonymous'
  ): Promise<Feedback> {
    const severityRating = { low: 1, medium: 2, high: 4, critical: 5 }[severity];

    return this.collectFeedback({
      type: FeedbackType.BUG_REPORT,
      target: {
        type: targetType,
        id: targetId
      },
      rating: severityRating,
      comment: description,
      metadata: {
        ...this.generateMetadata(),
        severity
      },
      context: context as FeedbackContext,
      userId,
      sessionId
    });
  }

  // Analytics and insights
  async getAnalytics(timeRange?: TimeRange): Promise<FeedbackAnalytics> {
    const now = Date.now();
    
    if (this.analytics && (now - this.lastAnalyticsUpdate) < this.cacheTimeout) {
      return this.analytics;
    }

    const range = timeRange || {
      start: new Date(now - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      end: new Date(),
      period: 'day' as const
    };

    this.analytics = await this.generateAnalytics(range);
    this.lastAnalyticsUpdate = now;

    return this.analytics;
  }

  async getFeedbackSummary(timeRange?: TimeRange): Promise<FeedbackSummary> {
    const analytics = await this.getAnalytics(timeRange);
    return analytics.summary;
  }

  async getAgentPerformance(agentId?: string): Promise<AgentFeedbackStats[]> {
    const analytics = await this.getAnalytics();
    
    if (agentId) {
      const agentStats = analytics.summary.byAgent[agentId];
      return agentStats ? [agentStats] : [];
    }

    return Object.values(analytics.summary.byAgent);
  }

  async getRecommendations(): Promise<FeedbackRecommendations> {
    const analytics = await this.getAnalytics();
    return analytics.recommendations;
  }

  // Feedback querying
  getFeedback(id: string): Feedback | null {
    return this.feedbacks.get(id) || null;
  }

  getAllFeedback(): Feedback[] {
    return Array.from(this.feedbacks.values());
  }

  getFeedbackByTarget(targetType: TargetType, targetId: string): Feedback[] {
    return this.getAllFeedback().filter(f => 
      f.target.type === targetType && f.target.id === targetId
    );
  }

  getFeedbackByAgent(agentId: string): Feedback[] {
    return this.getAllFeedback().filter(f => f.target.agentId === agentId);
  }

  getFeedbackByUser(userId: string): Feedback[] {
    return this.getAllFeedback().filter(f => f.userId === userId);
  }

  getFeedbackBySession(sessionId: string): Feedback[] {
    return this.getAllFeedback().filter(f => f.sessionId === sessionId);
  }

  // Strategy management
  addFeedbackStrategy(strategy: FeedbackStrategy): void {
    this.strategies.set(strategy.name, strategy);
    this.emit('strategyAdded', strategy);
  }

  removeFeedbackStrategy(name: string): void {
    this.strategies.delete(name);
    this.emit('strategyRemoved', { name });
  }

  getStrategies(): FeedbackStrategy[] {
    return Array.from(this.strategies.values());
  }

  // Model tuning integration
  async exportForModelTuning(
    modelId: string,
    feedbackTypes: FeedbackType[] = [FeedbackType.SUGGESTION_ACCEPTANCE, FeedbackType.CODE_QUALITY],
    minRating: number = 3
  ): Promise<ModelTuningData[]> {
    const relevantFeedback = this.getAllFeedback().filter(f => 
      feedbackTypes.includes(f.type) && 
      Math.abs(f.rating) >= minRating &&
      f.context.codeContext
    );

    return relevantFeedback.map(f => ({
      feedbackId: f.id,
      modelId,
      inputData: {
        beforeCode: f.context.codeContext?.beforeCode,
        context: f.context
      },
      expectedOutput: f.context.codeContext?.suggestedCode,
      actualOutput: f.context.codeContext?.suggestedCode,
      userCorrection: f.comment,
      weight: this.calculateFeedbackWeight(f),
      context: {
        task: 'code_generation',
        domain: this.inferDomain(f),
        complexity: this.calculateComplexity(f),
        userExperience: this.inferUserExperience(f),
        codeLanguage: f.context.fileContext?.language,
        framework: this.inferFramework(f)
      }
    }));
  }

  // Private helper methods
  private generateMetadata(): FeedbackMetadata {
    return {
      source: 'feedback_collector',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      deviceInfo: this.getDeviceInfo(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };
  }

  private getDeviceInfo(): DeviceInfo | undefined {
    if (typeof window === 'undefined') return undefined;

    return {
      platform: navigator.platform,
      browser: this.getBrowserName(),
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      touchSupport: 'ontouchstart' in window
    };
  }

  private getBrowserName(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private isHighPriorityFeedback(feedback: Feedback): boolean {
    return feedback.type === FeedbackType.BUG_REPORT ||
           (feedback.type === FeedbackType.THUMBS_UP_DOWN && feedback.rating === -1) ||
           (feedback.type === FeedbackType.STAR_RATING && feedback.rating <= 2);
  }

  private async generateAnalytics(timeRange: TimeRange): Promise<FeedbackAnalytics> {
    const feedbackInRange = this.getFeedbackInTimeRange(timeRange);
    
    const summary = this.calculateSummary(feedbackInRange, timeRange);
    const trends = this.calculateTrends(feedbackInRange, timeRange);
    const patterns = this.identifyPatterns(feedbackInRange);
    const insights = await this.generateInsights(feedbackInRange);
    const recommendations = this.generateRecommendations(insights, patterns);

    return {
      summary,
      trends,
      patterns,
      insights,
      recommendations
    };
  }

  private getFeedbackInTimeRange(timeRange: TimeRange): Feedback[] {
    return this.getAllFeedback().filter(f => 
      f.timestamp >= timeRange.start && f.timestamp <= timeRange.end
    );
  }

  private calculateSummary(feedbacks: Feedback[], timeRange: TimeRange): FeedbackSummary {
    const totalFeedback = feedbacks.length;
    const averageRating = feedbacks.length > 0 
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0;
    
    const positiveFeedback = feedbacks.filter(f => f.rating > 0).length;
    const negativeFeedback = feedbacks.filter(f => f.rating < 0).length;

    // Group by type
    const byType: Record<FeedbackType, FeedbackTypeStats> = {} as any;
    for (const type of Object.values(FeedbackType)) {
      const typeFeedbacks = feedbacks.filter(f => f.type === type);
      byType[type] = {
        count: typeFeedbacks.length,
        averageRating: typeFeedbacks.length > 0 
          ? typeFeedbacks.reduce((sum, f) => sum + f.rating, 0) / typeFeedbacks.length
          : 0,
        positiveRatio: typeFeedbacks.length > 0
          ? typeFeedbacks.filter(f => f.rating > 0).length / typeFeedbacks.length
          : 0,
        trendDirection: 'stable' // Would need historical data for real trend
      };
    }

    // Group by target
    const byTarget: Record<TargetType, FeedbackTargetStats> = {} as any;
    for (const targetType of Object.values(TargetType)) {
      const targetFeedbacks = feedbacks.filter(f => f.target.type === targetType);
      byTarget[targetType] = {
        count: targetFeedbacks.length,
        averageRating: targetFeedbacks.length > 0
          ? targetFeedbacks.reduce((sum, f) => sum + f.rating, 0) / targetFeedbacks.length
          : 0,
        improvementScore: this.calculateImprovementScore(targetFeedbacks),
        criticalIssues: targetFeedbacks.filter(f => 
          f.type === FeedbackType.BUG_REPORT && f.rating >= 4
        ).length
      };
    }

    // Group by agent
    const byAgent: Record<string, AgentFeedbackStats> = {};
    const agentFeedbacks = feedbacks.filter(f => f.target.agentId);
    const agentGroups = this.groupBy(agentFeedbacks, f => f.target.agentId!);
    
    for (const [agentId, agentFeedbackList] of Object.entries(agentGroups)) {
      byAgent[agentId] = {
        agentId,
        agentName: agentId, // Would get from agent registry
        totalFeedback: agentFeedbackList.length,
        averageRating: agentFeedbackList.reduce((sum, f) => sum + f.rating, 0) / agentFeedbackList.length,
        strengths: this.identifyAgentStrengths(agentFeedbackList),
        weaknesses: this.identifyAgentWeaknesses(agentFeedbackList),
        improvementAreas: this.identifyImprovementAreas(agentFeedbackList)
      };
    }

    return {
      totalFeedback,
      averageRating,
      positiveFeedback,
      negativeFeedback,
      byType,
      byTarget,
      byAgent,
      timeRange
    };
  }

  private calculateTrends(feedbacks: Feedback[], timeRange: TimeRange): FeedbackTrends {
    // Simple implementation - would be more sophisticated in production
    const now = new Date();
    const hourly: TrendPoint[] = [];
    const daily: TrendPoint[] = [];
    const weekly: TrendPoint[] = [];
    const monthly: TrendPoint[] = [];

    // Generate sample trend data
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourFeedbacks = feedbacks.filter(f => 
        f.timestamp >= timestamp && f.timestamp < new Date(timestamp.getTime() + 60 * 60 * 1000)
      );
      
      hourly.unshift({
        timestamp,
        value: hourFeedbacks.length > 0 
          ? hourFeedbacks.reduce((sum, f) => sum + f.rating, 0) / hourFeedbacks.length
          : 0,
        count: hourFeedbacks.length
      });
    }

    return { hourly, daily, weekly, monthly };
  }

  private identifyPatterns(feedbacks: Feedback[]): FeedbackPatterns {
    const commonIssues: IssuePattern[] = [];
    const userBehaviors: BehaviorPattern[] = [];
    const contextualFactors: ContextualPattern[] = [];
    const correlations: CorrelationPattern[] = [];

    // Identify common issues from negative feedback
    const negativeFeedbacks = feedbacks.filter(f => f.rating < 0);
    const issueGroups = this.groupBy(negativeFeedbacks, f => f.target.type);
    
    for (const [targetType, issues] of Object.entries(issueGroups)) {
      if (issues.length >= 3) { // Threshold for pattern
        commonIssues.push({
          issue: `Issues with ${targetType}`,
          frequency: issues.length,
          severity: issues.some(f => f.type === FeedbackType.BUG_REPORT && f.rating >= 4) ? 'high' : 'medium',
          affectedFeatures: [targetType],
          suggestedFixes: ['Review and improve implementation', 'Add more testing']
        });
      }
    }

    return {
      commonIssues,
      userBehaviors,
      contextualFactors,
      correlations
    };
  }

  private async generateInsights(feedbacks: Feedback[]): Promise<FeedbackInsights> {
    const topIssues: InsightItem[] = [];
    const keySuccesses: InsightItem[] = [];
    
    // Identify top issues
    const negativeByTarget = this.groupBy(
      feedbacks.filter(f => f.rating < 0), 
      f => f.target.type
    );
    
    for (const [targetType, issues] of Object.entries(negativeByTarget)) {
      if (issues.length >= 2) {
        topIssues.push({
          title: `${targetType} receiving negative feedback`,
          description: `${issues.length} negative feedback items for ${targetType}`,
          impact: issues.length > 5 ? 'high' : 'medium',
          frequency: issues.length,
          trendDirection: 'stable',
          actionRequired: issues.length > 5
        });
      }
    }

    // Identify successes
    const positiveByTarget = this.groupBy(
      feedbacks.filter(f => f.rating > 0), 
      f => f.target.type
    );
    
    for (const [targetType, successes] of Object.entries(positiveByTarget)) {
      if (successes.length >= 5) {
        keySuccesses.push({
          title: `${targetType} performing well`,
          description: `${successes.length} positive feedback items for ${targetType}`,
          impact: 'medium',
          frequency: successes.length,
          trendDirection: 'improving',
          actionRequired: false
        });
      }
    }

    const userSentiment: SentimentAnalysis = {
      overall: feedbacks.length > 0 
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length / 5
        : 0,
      byFeature: {},
      byTimeOfDay: {},
      keyPhrases: []
    };

    return {
      topIssues,
      keySuccesses,
      userSentiment,
      performanceMetrics: [],
      aiAgentPerformance: []
    };
  }

  private generateRecommendations(insights: FeedbackInsights, patterns: FeedbackPatterns): FeedbackRecommendations {
    const immediate: Recommendation[] = [];
    const shortTerm: Recommendation[] = [];
    const longTerm: Recommendation[] = [];
    const experimental: Recommendation[] = [];

    // Generate recommendations based on critical issues
    for (const issue of insights.topIssues) {
      if (issue.actionRequired) {
        immediate.push({
          id: `rec-${Date.now()}`,
          title: `Address ${issue.title}`,
          description: `Immediate attention needed for ${issue.description}`,
          priority: 'high',
          effort: 'medium',
          impact: 'high',
          category: 'bug_fix',
          implementation: ['Investigate root cause', 'Implement fix', 'Add monitoring'],
          expectedOutcome: 'Reduce negative feedback by 50%',
          successMetrics: ['Feedback rating improvement', 'Issue frequency reduction']
        });
      }
    }

    // Generate recommendations based on patterns
    for (const pattern of patterns.commonIssues) {
      if (pattern.severity === 'high') {
        shortTerm.push({
          id: `rec-pattern-${Date.now()}`,
          title: `Improve ${pattern.issue}`,
          description: `Address recurring issue: ${pattern.issue}`,
          priority: 'medium',
          effort: 'high',
          impact: 'medium',
          category: 'improvement',
          implementation: pattern.suggestedFixes,
          expectedOutcome: 'Reduce issue frequency by 70%',
          successMetrics: ['User satisfaction increase', 'Issue recurrence decrease']
        });
      }
    }

    return {
      immediate,
      shortTerm,
      longTerm,
      experimental
    };
  }

  private calculateFeedbackWeight(feedback: Feedback): number {
    let weight = 1.0;

    // Adjust based on feedback type
    if (feedback.type === FeedbackType.STAR_RATING && Math.abs(feedback.rating) >= 4) {
      weight *= 1.5; // Strong ratings are more valuable
    }

    // Adjust based on comment quality
    if (feedback.comment && feedback.comment.length > 20) {
      weight *= 1.3; // Detailed feedback is more valuable
    }

    // Adjust based on user experience (if available)
    // This would require user profiling in a real implementation

    return Math.min(weight, 3.0); // Cap at 3x weight
  }

  private inferDomain(feedback: Feedback): string {
    if (feedback.context.fileContext?.language) {
      return feedback.context.fileContext.language;
    }
    return 'general';
  }

  private calculateComplexity(feedback: Feedback): number {
    let complexity = 1;
    
    if (feedback.context.codeContext) {
      const codeLength = feedback.context.codeContext.suggestedCode.length;
      complexity = Math.min(5, Math.floor(codeLength / 100) + 1);
    }

    return complexity;
  }

  private inferUserExperience(feedback: Feedback): 'beginner' | 'intermediate' | 'expert' {
    // This would be more sophisticated in a real implementation
    // Could use user history, code complexity, feedback quality, etc.
    return 'intermediate';
  }

  private inferFramework(feedback: Feedback): string | undefined {
    const code = feedback.context.codeContext?.suggestedCode || '';
    
    if (code.includes('react') || code.includes('useState') || code.includes('useEffect')) {
      return 'react';
    }
    if (code.includes('vue') || code.includes('Vue')) {
      return 'vue';
    }
    if (code.includes('angular') || code.includes('Angular')) {
      return 'angular';
    }
    
    return undefined;
  }

  private calculateImprovementScore(feedbacks: Feedback[]): number {
    if (feedbacks.length === 0) return 0;
    
    const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    return Math.max(0, (averageRating + 5) / 10); // Normalize to 0-1
  }

  private identifyAgentStrengths(feedbacks: Feedback[]): string[] {
    const strengths: string[] = [];
    const positives = feedbacks.filter(f => f.rating > 0);
    
    if (positives.length > feedbacks.length * 0.7) {
      strengths.push('High user satisfaction');
    }
    
    const codeAcceptance = feedbacks.filter(f => 
      f.type === FeedbackType.SUGGESTION_ACCEPTANCE && f.rating > 0
    ).length;
    
    if (codeAcceptance > 0) {
      strengths.push('Good code suggestions');
    }

    return strengths;
  }

  private identifyAgentWeaknesses(feedbacks: Feedback[]): string[] {
    const weaknesses: string[] = [];
    const negatives = feedbacks.filter(f => f.rating < 0);
    
    if (negatives.length > feedbacks.length * 0.3) {
      weaknesses.push('High negative feedback rate');
    }

    return weaknesses;
  }

  private identifyImprovementAreas(feedbacks: Feedback[]): string[] {
    const areas: string[] = [];
    
    const qualityIssues = feedbacks.filter(f => 
      f.type === FeedbackType.CODE_QUALITY && f.rating < 3
    );
    
    if (qualityIssues.length > 0) {
      areas.push('Code quality improvement');
    }

    return areas;
  }

  private groupBy<T, K extends string | number>(
    array: T[], 
    keyFn: (item: T) => K
  ): Record<K, T[]> {
    const result = {} as Record<K, T[]>;
    
    for (const item of array) {
      const key = keyFn(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
    }
    
    return result;
  }

  private initializeDefaultStrategies(): void {
    // Add default feedback collection strategies
    this.addFeedbackStrategy({
      name: 'code_suggestion_feedback',
      description: 'Collect feedback on AI code suggestions',
      triggers: [
        {
          event: 'code_suggestion_applied',
          conditions: ['suggestion.confidence > 0.7'],
          probability: 0.3
        },
        {
          event: 'code_suggestion_rejected',
          conditions: [],
          probability: 0.8
        }
      ],
      timing: {
        delay: 2000,
        timeout: 30000,
        retryStrategy: 'context_change',
        optimalMoments: ['after_compile_success', 'before_commit']
      },
      presentation: {
        type: 'inline',
        style: 'minimal',
        customization: {}
      }
    });

    this.addFeedbackStrategy({
      name: 'workflow_completion_feedback',
      description: 'Collect feedback after workflow completion',
      triggers: [
        {
          event: 'workflow_completed',
          conditions: ['workflow.duration > 30000'], // Only for longer workflows
          probability: 0.5
        }
      ],
      timing: {
        delay: 1000,
        timeout: 60000,
        retryStrategy: 'none',
        optimalMoments: ['workflow_success']
      },
      presentation: {
        type: 'modal',
        style: 'detailed',
        customization: {}
      }
    });
  }

  private startPeriodicProcessing(): void {
    // Process unprocessed feedback every minute
    setInterval(async () => {
      const unprocessed = this.getAllFeedback().filter(f => !f.processed);
      
      if (unprocessed.length > 0) {
        try {
          await this.processor.processBatch(unprocessed);
          unprocessed.forEach(f => f.processed = true);
        } catch (error) {
          console.error('Failed to process feedback batch:', error);
        }
      }
    }, 60000);

    // Clear old analytics cache
    setInterval(() => {
      this.analytics = null;
      this.lastAnalyticsUpdate = 0;
    }, this.cacheTimeout);
  }
}

// Default feedback processor implementation
class DefaultFeedbackProcessor implements FeedbackProcessor {
  async processImmediate(feedback: Feedback): Promise<ProcessingResult> {
    const actions: ProcessingAction[] = [];
    const updates: ModelUpdate[] = [];
    const alerts: Alert[] = [];

    // Generate alerts for critical feedback
    if (feedback.type === FeedbackType.BUG_REPORT && feedback.rating >= 4) {
      alerts.push({
        level: 'critical',
        message: `Critical bug reported: ${feedback.comment}`,
        context: `Target: ${feedback.target.type}:${feedback.target.id}`,
        actionRequired: true
      });
    }

    // Generate model updates for code feedback
    if (feedback.type === FeedbackType.SUGGESTION_ACCEPTANCE && feedback.target.agentId) {
      updates.push({
        modelId: feedback.target.agentId,
        updateType: 'weight',
        changes: {
          'suggestion_acceptance_rate': feedback.rating > 0 ? 0.01 : -0.01
        },
        confidence: 0.7
      });
    }

    return {
      feedbackId: feedback.id,
      processed: true,
      actions,
      updates,
      alerts
    };
  }

  async processBatch(feedbacks: Feedback[]): Promise<BatchProcessingResult> {
    let successful = 0;
    let failed = 0;
    const modelUpdates: ModelUpdate[] = [];

    for (const feedback of feedbacks) {
      try {
        const result = await this.processImmediate(feedback);
        if (result.processed) {
          successful++;
          modelUpdates.push(...result.updates);
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        console.error('Failed to process feedback:', feedback.id, error);
      }
    }

    return {
      totalProcessed: feedbacks.length,
      successful,
      failed,
      insights: {
        topIssues: [],
        keySuccesses: [],
        userSentiment: { overall: 0, byFeature: {}, byTimeOfDay: {}, keyPhrases: [] },
        performanceMetrics: [],
        aiAgentPerformance: []
      },
      modelUpdates
    };
  }

  async updateModelWeights(tuningData: ModelTuningData[]): Promise<void> {
    // Implementation would integrate with actual model training pipeline
    console.log(`Updating model weights with ${tuningData.length} feedback samples`);
  }

  async generateInsights(timeRange: TimeRange): Promise<FeedbackInsights> {
    return {
      topIssues: [],
      keySuccesses: [],
      userSentiment: { overall: 0, byFeature: {}, byTimeOfDay: {}, keyPhrases: [] },
      performanceMetrics: [],
      aiAgentPerformance: []
    };
  }
}

export default FeedbackCollector; 