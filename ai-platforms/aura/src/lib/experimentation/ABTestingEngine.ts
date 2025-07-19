/**
 * ABTestingEngine - Advanced A/B Testing and Feature Flag Management
 * 
 * Provides comprehensive A/B testing capabilities with OpenFeature SDK integration,
 * experiment management, statistical analysis, and automated rollout controls.
 * 
 * @author Aura AI Platform
 * @version 1.0.0
 */

import { EventEmitter } from 'events';

// Core Types and Interfaces
export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  hypothesis: string;
  primaryMetric: string;
  secondaryMetrics: string[];
  variants: ExperimentVariant[];
  trafficAllocation: number; // percentage of users exposed
  startDate?: Date;
  endDate?: Date;
  duration?: number; // days
  createdBy: string;
  organizationId: string;
  tags: string[];
  targetingRules: TargetingRule[];
  samplingRate: number;
  minimumSampleSize: number;
  confidenceLevel: number; // e.g., 95, 99
  statisticalPower: number; // e.g., 0.8, 0.9
  segmentation: UserSegmentation;
  rolloutConfig: RolloutConfiguration;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  trafficWeight: number; // percentage allocation
  configuration: { [key: string]: any };
  isControl: boolean;
  flagOverrides?: { [flagKey: string]: any };
}

export interface TargetingRule {
  id: string;
  name: string;
  conditions: TargetingCondition[];
  action: 'include' | 'exclude';
  priority: number;
}

export interface TargetingCondition {
  attribute: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'gt' | 'lt' | 'gte' | 'lte';
  value: any;
}

export interface UserSegmentation {
  id: string;
  name: string;
  description: string;
  criteria: SegmentationCriteria[];
  userCount?: number;
  lastUpdated: Date;
}

export interface SegmentationCriteria {
  type: 'demographic' | 'behavioral' | 'geographic' | 'technographic' | 'custom';
  attribute: string;
  operator: string;
  value: any;
  weight: number;
}

export interface RolloutConfiguration {
  strategy: 'immediate' | 'gradual' | 'canary' | 'blue_green';
  phases: RolloutPhase[];
  autoPromote: boolean;
  promotionCriteria: PromotionCriteria;
  rollbackCriteria: RollbackCriteria;
  notificationChannels: string[];
}

export interface RolloutPhase {
  id: string;
  name: string;
  percentage: number;
  duration: number; // hours
  successCriteria: MetricThreshold[];
  autoPromote: boolean;
}

export interface PromotionCriteria {
  minimumDuration: number; // hours
  conversionRateThreshold?: number;
  significanceThreshold: number;
  minimumSampleSize: number;
  maxErrorRate: number;
}

export interface RollbackCriteria {
  maxErrorRate: number;
  minConversionRate?: number;
  maxResponseTime?: number;
  customMetrics: MetricThreshold[];
  autoRollback: boolean;
}

export interface MetricThreshold {
  metric: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  value: number;
  window: number; // minutes
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  metrics: MetricResult[];
  participantCount: number;
  conversionRate: number;
  statisticalSignificance: number;
  confidenceInterval: { lower: number; upper: number };
  effectSize: number;
  pValue: number;
  isStatisticallySignificant: boolean;
  isWinner: boolean;
  timestamp: Date;
}

export interface MetricResult {
  metric: string;
  value: number;
  variance: number;
  sampleSize: number;
  change: number; // vs control
  changePercent: number;
  statisticalSignificance: number;
  confidenceInterval: { lower: number; upper: number };
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  defaultValue: any;
  variants: FlagVariant[];
  targeting: FlagTargeting;
  rolloutPercentage: number;
  organizationId: string;
  environment: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags: string[];
}

export interface FlagVariant {
  id: string;
  value: any;
  weight: number;
  name?: string;
}

export interface FlagTargeting {
  rules: TargetingRule[];
  fallthrough: {
    variation: string;
    rollout?: {
      variations: Array<{
        variation: string;
        weight: number;
      }>;
    };
  };
}

export interface UserContext {
  userId: string;
  sessionId?: string;
  organizationId?: string;
  email?: string;
  cohort?: string;
  plan?: string;
  region?: string;
  device?: string;
  browser?: string;
  customAttributes?: { [key: string]: any };
}

export interface ExperimentEvent {
  eventId: string;
  experimentId: string;
  variantId: string;
  userId: string;
  eventType: 'exposure' | 'conversion' | 'custom';
  eventName?: string;
  value?: number;
  properties?: { [key: string]: any };
  timestamp: Date;
  sessionId?: string;
}

export interface StatisticalAnalysis {
  experimentId: string;
  analysisType: 'frequentist' | 'bayesian';
  results: ExperimentResult[];
  recommendations: string[];
  summary: {
    winner?: string;
    confidence: number;
    effect: number;
    significance: number;
    duration: number;
    participants: number;
  };
  generatedAt: Date;
}

export interface ABTestConfig {
  defaultSampleSize: number;
  defaultConfidenceLevel: number;
  defaultStatisticalPower: number;
  minimumExperimentDuration: number; // hours
  maximumExperimentDuration: number; // hours
  autoAnalysisInterval: number; // hours
  significanceThreshold: number;
  minimumDetectableEffect: number;
  openFeatureConfig: {
    provider: string;
    endpoint?: string;
    apiKey?: string;
    pollInterval?: number;
  };
  analyticsConfig: {
    trackingEndpoint: string;
    flushInterval: number;
    batchSize: number;
  };
  notifications: {
    slack?: { webhook: string };
    email?: { smtp: string };
    webhook?: { url: string };
  };
}

// Task 1: OpenFeature SDK Integration
export class OpenFeatureClient extends EventEmitter {
  private client: any;
  private provider: any;
  private config: ABTestConfig;
  private flagCache: Map<string, FeatureFlag> = new Map();
  private lastSync: Date = new Date();

  constructor(config: ABTestConfig) {
    super();
    this.config = config;
    this.initializeOpenFeature();
  }

  private async initializeOpenFeature(): Promise<void> {
    try {
      // Mock OpenFeature SDK initialization
      // In real implementation: import { OpenFeature } from '@openfeature/web-sdk';
      
      console.log('Initializing OpenFeature SDK...');
      
      // Initialize provider based on config
      switch (this.config.openFeatureConfig.provider) {
        case 'flagd':
          this.provider = this.createFlagdProvider();
          break;
        case 'launchdarkly':
          this.provider = this.createLaunchDarklyProvider();
          break;
        case 'split':
          this.provider = this.createSplitProvider();
          break;
        default:
          this.provider = this.createInMemoryProvider();
      }

      // Set provider and get client
      // OpenFeature.setProvider(this.provider);
      // this.client = OpenFeature.getClient();
      
      this.client = { 
        getBooleanValue: this.getBooleanValue.bind(this),
        getStringValue: this.getStringValue.bind(this),
        getNumberValue: this.getNumberValue.bind(this),
        getObjectValue: this.getObjectValue.bind(this)
      };

      // Set up event handlers
      this.setupEventHandlers();

      // Start periodic sync
      this.startPeriodicSync();

      this.emit('initialized');
      console.log('OpenFeature SDK initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize OpenFeature SDK:', error);
      this.emit('error', error);
    }
  }

  public async evaluateFlag(flagKey: string, defaultValue: any, userContext: UserContext): Promise<any> {
    try {
      const flag = this.flagCache.get(flagKey);
      if (!flag) {
        console.warn(`Flag not found: ${flagKey}, returning default value`);
        return defaultValue;
      }

      // Check if flag is enabled
      if (!flag.enabled) {
        return defaultValue;
      }

      // Evaluate targeting rules
      const targetingResult = this.evaluateTargeting(flag, userContext);
      if (!targetingResult.shouldEvaluate) {
        return defaultValue;
      }

      // Apply rollout percentage
      if (!this.shouldIncludeUser(userContext.userId, flag.rolloutPercentage)) {
        return defaultValue;
      }

      // Select variant based on weight
      const selectedVariant = this.selectVariant(flag.variants, userContext.userId);
      
      this.emit('flagEvaluated', {
        flagKey,
        userId: userContext.userId,
        variant: selectedVariant,
        value: selectedVariant.value,
        timestamp: new Date()
      });

      return selectedVariant.value;

    } catch (error) {
      console.error(`Error evaluating flag ${flagKey}:`, error);
      this.emit('error', { flagKey, error, defaultValue });
      return defaultValue;
    }
  }

  public async getBooleanValue(flagKey: string, defaultValue: boolean, userContext: UserContext): Promise<boolean> {
    return await this.evaluateFlag(flagKey, defaultValue, userContext);
  }

  public async getStringValue(flagKey: string, defaultValue: string, userContext: UserContext): Promise<string> {
    return await this.evaluateFlag(flagKey, defaultValue, userContext);
  }

  public async getNumberValue(flagKey: string, defaultValue: number, userContext: UserContext): Promise<number> {
    return await this.evaluateFlag(flagKey, defaultValue, userContext);
  }

  public async getObjectValue(flagKey: string, defaultValue: object, userContext: UserContext): Promise<object> {
    return await this.evaluateFlag(flagKey, defaultValue, userContext);
  }

  public async syncFlags(): Promise<void> {
    try {
      // Fetch latest flags from provider
      const flags = await this.fetchFlagsFromProvider();
      
      // Update cache
      for (const flag of flags) {
        this.flagCache.set(flag.key, flag);
      }

      this.lastSync = new Date();
      this.emit('flagsSynced', { count: flags.length, timestamp: this.lastSync });
      
    } catch (error) {
      console.error('Failed to sync flags:', error);
      this.emit('syncError', error);
    }
  }

  private createFlagdProvider(): any {
    return {
      name: 'flagd-provider',
      endpoint: this.config.openFeatureConfig.endpoint,
      initialize: async () => console.log('Flagd provider initialized')
    };
  }

  private createLaunchDarklyProvider(): any {
    return {
      name: 'launchdarkly-provider',
      apiKey: this.config.openFeatureConfig.apiKey,
      initialize: async () => console.log('LaunchDarkly provider initialized')
    };
  }

  private createSplitProvider(): any {
    return {
      name: 'split-provider',
      apiKey: this.config.openFeatureConfig.apiKey,
      initialize: async () => console.log('Split provider initialized')
    };
  }

  private createInMemoryProvider(): any {
    return {
      name: 'in-memory-provider',
      flags: new Map<string, FeatureFlag>(),
      initialize: async () => console.log('In-memory provider initialized')
    };
  }

  private evaluateTargeting(flag: FeatureFlag, userContext: UserContext): { shouldEvaluate: boolean; reason?: string } {
    if (!flag.targeting.rules || flag.targeting.rules.length === 0) {
      return { shouldEvaluate: true };
    }

    // Evaluate targeting rules in priority order
    const sortedRules = flag.targeting.rules.sort((a, b) => b.priority - a.priority);
    
    for (const rule of sortedRules) {
      const matches = this.evaluateTargetingRule(rule, userContext);
      
      if (matches) {
        if (rule.action === 'exclude') {
          return { shouldEvaluate: false, reason: `Excluded by rule: ${rule.name}` };
        } else if (rule.action === 'include') {
          return { shouldEvaluate: true, reason: `Included by rule: ${rule.name}` };
        }
      }
    }

    // If no rules matched, use fallthrough behavior
    return { shouldEvaluate: true, reason: 'Fallthrough targeting' };
  }

  private evaluateTargetingRule(rule: TargetingRule, userContext: UserContext): boolean {
    return rule.conditions.every(condition => this.evaluateCondition(condition, userContext));
  }

  private evaluateCondition(condition: TargetingCondition, userContext: UserContext): boolean {
    const userValue = this.getUserAttribute(condition.attribute, userContext);
    
    switch (condition.operator) {
      case 'equals':
        return userValue === condition.value;
      case 'not_equals':
        return userValue !== condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(userValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(userValue);
      case 'contains':
        return typeof userValue === 'string' && userValue.includes(condition.value);
      case 'starts_with':
        return typeof userValue === 'string' && userValue.startsWith(condition.value);
      case 'ends_with':
        return typeof userValue === 'string' && userValue.endsWith(condition.value);
      case 'regex':
        return typeof userValue === 'string' && new RegExp(condition.value).test(userValue);
      case 'gt':
        return typeof userValue === 'number' && userValue > condition.value;
      case 'lt':
        return typeof userValue === 'number' && userValue < condition.value;
      case 'gte':
        return typeof userValue === 'number' && userValue >= condition.value;
      case 'lte':
        return typeof userValue === 'number' && userValue <= condition.value;
      default:
        console.warn(`Unknown operator: ${condition.operator}`);
        return false;
    }
  }

  private getUserAttribute(attribute: string, userContext: UserContext): any {
    switch (attribute) {
      case 'userId':
        return userContext.userId;
      case 'organizationId':
        return userContext.organizationId;
      case 'email':
        return userContext.email;
      case 'cohort':
        return userContext.cohort;
      case 'plan':
        return userContext.plan;
      case 'region':
        return userContext.region;
      case 'device':
        return userContext.device;
      case 'browser':
        return userContext.browser;
      default:
        return userContext.customAttributes?.[attribute];
    }
  }

  private shouldIncludeUser(userId: string, rolloutPercentage: number): boolean {
    // Consistent hash-based rollout
    const hash = this.hashUserId(userId);
    return (hash % 100) < rolloutPercentage;
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private selectVariant(variants: FlagVariant[], userId: string): FlagVariant {
    if (variants.length === 0) {
      throw new Error('No variants available');
    }

    if (variants.length === 1) {
      return variants[0];
    }

    // Weighted selection based on user hash
    const hash = this.hashUserId(userId);
    const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
    const target = hash % totalWeight;

    let current = 0;
    for (const variant of variants) {
      current += variant.weight;
      if (target < current) {
        return variant;
      }
    }

    // Fallback to first variant
    return variants[0];
  }

  private async fetchFlagsFromProvider(): Promise<FeatureFlag[]> {
    // Mock implementation - in real system, fetch from actual provider
    return [
      {
        key: 'new_ui_design',
        name: 'New UI Design',
        description: 'Enable new user interface design',
        enabled: true,
        defaultValue: false,
        variants: [
          { id: 'control', value: false, weight: 50 },
          { id: 'treatment', value: true, weight: 50 }
        ],
        targeting: {
          rules: [],
          fallthrough: { variation: 'control' }
        },
        rolloutPercentage: 50,
        organizationId: 'org1',
        environment: 'production',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        tags: ['ui', 'frontend']
      }
    ];
  }

  private setupEventHandlers(): void {
    // Handle provider events
    this.on('flagEvaluated', (event) => {
      console.log(`Flag evaluated: ${event.flagKey} for user ${event.userId}`);
    });

    this.on('error', (error) => {
      console.error('OpenFeature error:', error);
    });
  }

  private startPeriodicSync(): void {
    const interval = this.config.openFeatureConfig.pollInterval || 30000; // 30 seconds default
    
    setInterval(async () => {
      await this.syncFlags();
    }, interval);
  }

  public addFlag(flag: FeatureFlag): void {
    this.flagCache.set(flag.key, flag);
    this.emit('flagAdded', flag);
  }

  public removeFlag(flagKey: string): void {
    this.flagCache.delete(flagKey);
    this.emit('flagRemoved', flagKey);
  }

  public getFlags(): FeatureFlag[] {
    return Array.from(this.flagCache.values());
  }
}

// Task 2: Experiment Management System
export class ExperimentManager extends EventEmitter {
  private experiments: Map<string, Experiment> = new Map();
  private config: ABTestConfig;

  constructor(config: ABTestConfig) {
    super();
    this.config = config;
  }

  public async createExperiment(experiment: Omit<Experiment, 'id'>): Promise<Experiment> {
    const id = this.generateExperimentId();
    
    const fullExperiment: Experiment = {
      ...experiment,
      id,
      status: 'draft',
      samplingRate: experiment.samplingRate || 1.0,
      minimumSampleSize: experiment.minimumSampleSize || this.config.defaultSampleSize,
      confidenceLevel: experiment.confidenceLevel || this.config.defaultConfidenceLevel,
      statisticalPower: experiment.statisticalPower || this.config.defaultStatisticalPower
    };

    // Validate experiment configuration
    this.validateExperiment(fullExperiment);

    this.experiments.set(id, fullExperiment);
    this.emit('experimentCreated', fullExperiment);

    return fullExperiment;
  }

  public async updateExperiment(id: string, updates: Partial<Experiment>): Promise<Experiment> {
    const experiment = this.experiments.get(id);
    if (!experiment) {
      throw new Error(`Experiment not found: ${id}`);
    }

    // Prevent updates to running experiments (except status)
    if (experiment.status === 'running' && updates.status !== 'paused' && updates.status !== 'completed') {
      throw new Error('Cannot modify running experiment configuration');
    }

    const updatedExperiment = { ...experiment, ...updates };
    this.validateExperiment(updatedExperiment);

    this.experiments.set(id, updatedExperiment);
    this.emit('experimentUpdated', updatedExperiment);

    return updatedExperiment;
  }

  public async startExperiment(id: string): Promise<void> {
    const experiment = this.experiments.get(id);
    if (!experiment) {
      throw new Error(`Experiment not found: ${id}`);
    }

    if (experiment.status !== 'draft' && experiment.status !== 'paused') {
      throw new Error(`Cannot start experiment in status: ${experiment.status}`);
    }

    // Pre-flight checks
    await this.performPreflightChecks(experiment);

    // Update experiment status
    experiment.status = 'running';
    experiment.startDate = new Date();
    
    if (experiment.duration) {
      experiment.endDate = new Date(Date.now() + experiment.duration * 24 * 60 * 60 * 1000);
    }

    this.experiments.set(id, experiment);
    this.emit('experimentStarted', experiment);

    // Schedule automatic analysis
    this.scheduleAnalysis(experiment);
  }

  public async pauseExperiment(id: string): Promise<void> {
    const experiment = this.experiments.get(id);
    if (!experiment) {
      throw new Error(`Experiment not found: ${id}`);
    }

    if (experiment.status !== 'running') {
      throw new Error(`Cannot pause experiment in status: ${experiment.status}`);
    }

    experiment.status = 'paused';
    this.experiments.set(id, experiment);
    this.emit('experimentPaused', experiment);
  }

  public async stopExperiment(id: string, reason?: string): Promise<void> {
    const experiment = this.experiments.get(id);
    if (!experiment) {
      throw new Error(`Experiment not found: ${id}`);
    }

    if (experiment.status !== 'running' && experiment.status !== 'paused') {
      throw new Error(`Cannot stop experiment in status: ${experiment.status}`);
    }

    experiment.status = 'completed';
    experiment.endDate = new Date();
    
    this.experiments.set(id, experiment);
    this.emit('experimentStopped', { experiment, reason });
  }

  public getExperiment(id: string): Experiment | null {
    return this.experiments.get(id) || null;
  }

  public getExperimentsByOrganization(organizationId: string): Experiment[] {
    return Array.from(this.experiments.values())
      .filter(experiment => experiment.organizationId === organizationId);
  }

  public getRunningExperiments(): Experiment[] {
    return Array.from(this.experiments.values())
      .filter(experiment => experiment.status === 'running');
  }

  public async getExperimentAssignment(experimentId: string, userContext: UserContext): Promise<string | null> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check if user should be included in experiment
    if (!this.shouldIncludeUser(experiment, userContext)) {
      return null;
    }

    // Apply targeting rules
    if (!this.evaluateTargetingRules(experiment.targetingRules, userContext)) {
      return null;
    }

    // Apply segmentation
    if (!this.matchesSegmentation(experiment.segmentation, userContext)) {
      return null;
    }

    // Assign variant based on traffic allocation
    const variantId = this.assignVariant(experiment, userContext.userId);
    
    this.emit('userAssigned', {
      experimentId,
      userId: userContext.userId,
      variantId,
      timestamp: new Date()
    });

    return variantId;
  }

  private generateExperimentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `EXP-${timestamp}-${random}`.toUpperCase();
  }

  private validateExperiment(experiment: Experiment): void {
    if (!experiment.name || experiment.name.trim().length === 0) {
      throw new Error('Experiment name is required');
    }

    if (!experiment.primaryMetric) {
      throw new Error('Primary metric is required');
    }

    if (!experiment.variants || experiment.variants.length < 2) {
      throw new Error('At least 2 variants are required');
    }

    const totalWeight = experiment.variants.reduce((sum, variant) => sum + variant.trafficWeight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variant traffic weights must sum to 100%');
    }

    const controlVariants = experiment.variants.filter(v => v.isControl);
    if (controlVariants.length !== 1) {
      throw new Error('Exactly one control variant is required');
    }

    if (experiment.trafficAllocation < 0 || experiment.trafficAllocation > 100) {
      throw new Error('Traffic allocation must be between 0 and 100%');
    }

    if (experiment.confidenceLevel < 90 || experiment.confidenceLevel > 99.9) {
      throw new Error('Confidence level must be between 90% and 99.9%');
    }
  }

  private async performPreflightChecks(experiment: Experiment): Promise<void> {
    // Check for conflicting experiments
    const runningExperiments = this.getRunningExperiments()
      .filter(e => e.organizationId === experiment.organizationId && e.id !== experiment.id);

    for (const running of runningExperiments) {
      if (this.hasOverlappingSegmentation(experiment.segmentation, running.segmentation)) {
        console.warn(`Potential conflict with running experiment: ${running.name}`);
      }
    }

    // Validate minimum sample size
    const estimatedUsers = await this.estimateEligibleUsers(experiment);
    if (estimatedUsers < experiment.minimumSampleSize) {
      throw new Error(`Insufficient eligible users. Estimated: ${estimatedUsers}, Required: ${experiment.minimumSampleSize}`);
    }

    // Check metric tracking setup
    await this.validateMetricTracking(experiment.primaryMetric);
    for (const metric of experiment.secondaryMetrics) {
      await this.validateMetricTracking(metric);
    }
  }

  private shouldIncludeUser(experiment: Experiment, userContext: UserContext): boolean {
    // Apply sampling rate
    const hash = this.hashString(`${experiment.id}-${userContext.userId}`);
    const samplingThreshold = experiment.samplingRate * 100;
    
    if ((hash % 100) >= samplingThreshold) {
      return false;
    }

    // Apply traffic allocation
    const allocationThreshold = experiment.trafficAllocation;
    const allocationHash = this.hashString(`${experiment.id}-allocation-${userContext.userId}`);
    
    return (allocationHash % 100) < allocationThreshold;
  }

  private evaluateTargetingRules(rules: TargetingRule[], userContext: UserContext): boolean {
    if (!rules || rules.length === 0) {
      return true;
    }

    // Evaluate rules in priority order
    const sortedRules = rules.sort((a, b) => b.priority - a.priority);
    
    for (const rule of sortedRules) {
      const matches = rule.conditions.every(condition => 
        this.evaluateTargetingCondition(condition, userContext)
      );
      
      if (matches) {
        return rule.action === 'include';
      }
    }

    // Default to include if no rules match
    return true;
  }

  private evaluateTargetingCondition(condition: TargetingCondition, userContext: UserContext): boolean {
    const userValue = this.getUserAttribute(condition.attribute, userContext);
    
    switch (condition.operator) {
      case 'equals':
        return userValue === condition.value;
      case 'not_equals':
        return userValue !== condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(userValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(userValue);
      case 'contains':
        return typeof userValue === 'string' && userValue.includes(condition.value);
      case 'starts_with':
        return typeof userValue === 'string' && userValue.startsWith(condition.value);
      case 'ends_with':
        return typeof userValue === 'string' && userValue.endsWith(condition.value);
      case 'regex':
        return typeof userValue === 'string' && new RegExp(condition.value).test(userValue);
      case 'gt':
        return typeof userValue === 'number' && userValue > condition.value;
      case 'lt':
        return typeof userValue === 'number' && userValue < condition.value;
      case 'gte':
        return typeof userValue === 'number' && userValue >= condition.value;
      case 'lte':
        return typeof userValue === 'number' && userValue <= condition.value;
      default:
        return false;
    }
  }

  private getUserAttribute(attribute: string, userContext: UserContext): any {
    switch (attribute) {
      case 'userId':
        return userContext.userId;
      case 'organizationId':
        return userContext.organizationId;
      case 'email':
        return userContext.email;
      case 'cohort':
        return userContext.cohort;
      case 'plan':
        return userContext.plan;
      case 'region':
        return userContext.region;
      case 'device':
        return userContext.device;
      case 'browser':
        return userContext.browser;
      default:
        return userContext.customAttributes?.[attribute];
    }
  }

  private matchesSegmentation(segmentation: UserSegmentation, userContext: UserContext): boolean {
    if (!segmentation.criteria || segmentation.criteria.length === 0) {
      return true;
    }

    let totalScore = 0;
    let totalWeight = 0;

    for (const criteria of segmentation.criteria) {
      const userValue = this.getUserAttribute(criteria.attribute, userContext);
      const matches = this.evaluateSegmentationCriteria(criteria, userValue);
      
      if (matches) {
        totalScore += criteria.weight;
      }
      totalWeight += criteria.weight;
    }

    // User matches if they meet more than 50% of weighted criteria
    return totalWeight > 0 && (totalScore / totalWeight) > 0.5;
  }

  private evaluateSegmentationCriteria(criteria: SegmentationCriteria, userValue: any): boolean {
    // Simplified evaluation - in real implementation, this would be more sophisticated
    switch (criteria.operator) {
      case 'equals':
        return userValue === criteria.value;
      case 'in':
        return Array.isArray(criteria.value) && criteria.value.includes(userValue);
      case 'gt':
        return typeof userValue === 'number' && userValue > criteria.value;
      case 'lt':
        return typeof userValue === 'number' && userValue < criteria.value;
      default:
        return false;
    }
  }

  private assignVariant(experiment: Experiment, userId: string): string {
    const hash = this.hashString(`${experiment.id}-variant-${userId}`);
    const target = hash % 100;

    let current = 0;
    for (const variant of experiment.variants) {
      current += variant.trafficWeight;
      if (target < current) {
        return variant.id;
      }
    }

    // Fallback to control variant
    const controlVariant = experiment.variants.find(v => v.isControl);
    return controlVariant?.id || experiment.variants[0].id;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private hasOverlappingSegmentation(seg1: UserSegmentation, seg2: UserSegmentation): boolean {
    // Simplified overlap detection
    const attrs1 = new Set(seg1.criteria.map(c => c.attribute));
    const attrs2 = new Set(seg2.criteria.map(c => c.attribute));
    
    // Check if they target similar attributes
    const intersection = new Set([...attrs1].filter(x => attrs2.has(x)));
    return intersection.size > 0;
  }

  private async estimateEligibleUsers(experiment: Experiment): Promise<number> {
    // Mock implementation - in real system, query user database
    return Math.floor(Math.random() * 10000) + 1000;
  }

  private async validateMetricTracking(metric: string): Promise<void> {
    // Mock validation - in real system, verify metric is properly tracked
    console.log(`Validating metric tracking for: ${metric}`);
  }

  private scheduleAnalysis(experiment: Experiment): void {
    const interval = this.config.autoAnalysisInterval * 60 * 60 * 1000; // Convert hours to ms
    
    const analysisTimer = setInterval(() => {
      const current = this.experiments.get(experiment.id);
      if (!current || current.status !== 'running') {
        clearInterval(analysisTimer);
        return;
      }

      this.emit('scheduleAnalysis', experiment.id);
    }, interval);
  }
}

// Task 3: Flag Rollout Management  
export class FlagRolloutManager extends EventEmitter {
  private rollouts: Map<string, any> = new Map();
  private config: ABTestConfig;
  private flagClient: OpenFeatureClient;

  constructor(config: ABTestConfig, flagClient: OpenFeatureClient) {
    super();
    this.config = config;
    this.flagClient = flagClient;
  }

  public async createRollout(flagKey: string, rolloutConfig: RolloutConfiguration): Promise<string> {
    const rolloutId = this.generateRolloutId();
    
    const rollout = {
      id: rolloutId,
      flagKey,
      config: rolloutConfig,
      status: 'pending',
      currentPhase: 0,
      startedAt: new Date(),
      phases: rolloutConfig.phases.map(phase => ({
        ...phase,
        status: 'pending',
        startedAt: null,
        completedAt: null,
        metrics: new Map()
      }))
    };

    this.rollouts.set(rolloutId, rollout);
    this.emit('rolloutCreated', rollout);

    // Start rollout if strategy is immediate
    if (rolloutConfig.strategy === 'immediate') {
      await this.startRollout(rolloutId);
    }

    return rolloutId;
  }

  public async startRollout(rolloutId: string): Promise<void> {
    const rollout = this.rollouts.get(rolloutId);
    if (!rollout) {
      throw new Error(`Rollout not found: ${rolloutId}`);
    }

    if (rollout.status !== 'pending') {
      throw new Error(`Cannot start rollout in status: ${rollout.status}`);
    }

    rollout.status = 'running';
    this.rollouts.set(rolloutId, rollout);

    // Start first phase
    await this.startPhase(rolloutId, 0);
    
    this.emit('rolloutStarted', rollout);
  }

  public async pauseRollout(rolloutId: string): Promise<void> {
    const rollout = this.rollouts.get(rolloutId);
    if (!rollout) {
      throw new Error(`Rollout not found: ${rolloutId}`);
    }

    rollout.status = 'paused';
    this.rollouts.set(rolloutId, rollout);
    this.emit('rolloutPaused', rollout);
  }

  public async rollbackRollout(rolloutId: string, reason: string): Promise<void> {
    const rollout = this.rollouts.get(rolloutId);
    if (!rollout) {
      throw new Error(`Rollout not found: ${rolloutId}`);
    }

    // Reset flag to 0% rollout
    await this.updateFlagRolloutPercentage(rollout.flagKey, 0);

    rollout.status = 'rolled_back';
    rollout.rollbackReason = reason;
    rollout.rollbackAt = new Date();
    
    this.rollouts.set(rolloutId, rollout);
    this.emit('rolloutRolledBack', { rollout, reason });

    // Send notifications
    await this.sendRollbackNotifications(rollout, reason);
  }

  private async startPhase(rolloutId: string, phaseIndex: number): Promise<void> {
    const rollout = this.rollouts.get(rolloutId);
    if (!rollout || phaseIndex >= rollout.phases.length) {
      return;
    }

    const phase = rollout.phases[phaseIndex];
    phase.status = 'running';
    phase.startedAt = new Date();
    rollout.currentPhase = phaseIndex;

    // Update flag rollout percentage
    await this.updateFlagRolloutPercentage(rollout.flagKey, phase.percentage);

    this.rollouts.set(rolloutId, rollout);
    this.emit('phaseStarted', { rollout, phase, phaseIndex });

    // Schedule phase completion check
    setTimeout(async () => {
      await this.checkPhaseCompletion(rolloutId, phaseIndex);
    }, phase.duration * 60 * 60 * 1000); // Convert hours to ms

    // Start monitoring phase metrics
    this.startPhaseMonitoring(rolloutId, phaseIndex);
  }

  private async checkPhaseCompletion(rolloutId: string, phaseIndex: number): Promise<void> {
    const rollout = this.rollouts.get(rolloutId);
    if (!rollout || rollout.status !== 'running') {
      return;
    }

    const phase = rollout.phases[phaseIndex];
    if (phase.status !== 'running') {
      return;
    }

    // Check success criteria
    const criteriaChecks = await Promise.all(
      phase.successCriteria.map((criteria: MetricThreshold) => this.checkMetricThreshold(rollout.flagKey, criteria))
    );

    const allCriteriaMet = criteriaChecks.every(check => check.passed);

    if (allCriteriaMet) {
      await this.completePhase(rolloutId, phaseIndex);
    } else {
      // Check if we should rollback
      const rollbackChecks = await Promise.all(
        rollout.config.rollbackCriteria.customMetrics.map((criteria: MetricThreshold) => 
          this.checkMetricThreshold(rollout.flagKey, criteria)
        )
      );

      const shouldRollback = rollbackChecks.some(check => !check.passed);
      
      if (shouldRollback && rollout.config.rollbackCriteria.autoRollback) {
        await this.rollbackRollout(rolloutId, 'Automatic rollback due to failed criteria');
      } else if (phase.autoPromote) {
        // Auto-promote even if criteria not met (risky)
        await this.completePhase(rolloutId, phaseIndex);
      } else {
        // Pause rollout for manual review
        rollout.status = 'paused';
        this.rollouts.set(rolloutId, rollout);
        this.emit('rolloutPausedForReview', { rollout, phaseIndex, reason: 'Success criteria not met' });
      }
    }
  }

  private async completePhase(rolloutId: string, phaseIndex: number): Promise<void> {
    const rollout = this.rollouts.get(rolloutId);
    if (!rollout) return;

    const phase = rollout.phases[phaseIndex];
    phase.status = 'completed';
    phase.completedAt = new Date();

    this.rollouts.set(rolloutId, rollout);
    this.emit('phaseCompleted', { rollout, phase, phaseIndex });

    // Check if this was the last phase
    if (phaseIndex === rollout.phases.length - 1) {
      rollout.status = 'completed';
      rollout.completedAt = new Date();
      this.rollouts.set(rolloutId, rollout);
      this.emit('rolloutCompleted', rollout);
    } else {
      // Start next phase
      await this.startPhase(rolloutId, phaseIndex + 1);
    }
  }

  private startPhaseMonitoring(rolloutId: string, phaseIndex: number): void {
    const monitoringInterval = setInterval(async () => {
      const rollout = this.rollouts.get(rolloutId);
      if (!rollout || rollout.phases[phaseIndex].status !== 'running') {
        clearInterval(monitoringInterval);
        return;
      }

      // Collect metrics for current phase
      const metrics = await this.collectPhaseMetrics(rollout.flagKey);
      rollout.phases[phaseIndex].metrics = metrics;
      
      // Check rollback criteria
      const rollbackChecks = await Promise.all(
        rollout.config.rollbackCriteria.customMetrics.map((criteria: MetricThreshold) => 
          this.checkMetricThreshold(rollout.flagKey, criteria)
        )
      );

      const shouldRollback = rollbackChecks.some(check => !check.passed);
      
      if (shouldRollback && rollout.config.rollbackCriteria.autoRollback) {
        clearInterval(monitoringInterval);
        await this.rollbackRollout(rolloutId, 'Automatic rollback due to failed metrics');
      }

    }, 60000); // Check every minute
  }

  private async updateFlagRolloutPercentage(flagKey: string, percentage: number): Promise<void> {
    const flags = this.flagClient.getFlags();
    const flag = flags.find(f => f.key === flagKey);
    
    if (flag) {
      flag.rolloutPercentage = percentage;
      flag.updatedAt = new Date();
      flag.version += 1;
      
      this.flagClient.addFlag(flag);
      this.emit('flagUpdated', { flagKey, percentage });
    }
  }

  private async checkMetricThreshold(flagKey: string, threshold: MetricThreshold): Promise<{ passed: boolean; value: number }> {
    // Mock metric collection - in real system, query analytics
    const currentValue = Math.random() * 100;
    
    let passed = false;
    switch (threshold.operator) {
      case 'gt':
        passed = currentValue > threshold.value;
        break;
      case 'lt':
        passed = currentValue < threshold.value;
        break;
      case 'gte':
        passed = currentValue >= threshold.value;
        break;
      case 'lte':
        passed = currentValue <= threshold.value;
        break;
      case 'eq':
        passed = Math.abs(currentValue - threshold.value) < 0.01;
        break;
    }

    return { passed, value: currentValue };
  }

  private async collectPhaseMetrics(flagKey: string): Promise<Map<string, any>> {
    // Mock metrics collection
    return new Map([
      ['conversion_rate', Math.random() * 10],
      ['error_rate', Math.random() * 2],
      ['response_time', Math.random() * 500 + 100]
    ]);
  }

  private async sendRollbackNotifications(rollout: any, reason: string): Promise<void> {
    for (const channel of rollout.config.notificationChannels) {
      try {
        await this.sendNotification(channel, {
          type: 'rollback',
          flagKey: rollout.flagKey,
          rolloutId: rollout.id,
          reason,
          timestamp: new Date()
        });
      } catch (error) {
        console.error(`Failed to send notification to ${channel}:`, error);
      }
    }
  }

  private async sendNotification(channel: string, message: any): Promise<void> {
    // Mock notification sending
    console.log(`Sending notification to ${channel}:`, message);
  }

  private generateRolloutId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ROLLOUT-${timestamp}-${random}`.toUpperCase();
  }

  public getRollout(rolloutId: string): any {
    return this.rollouts.get(rolloutId);
  }

  public getRolloutsByFlag(flagKey: string): any[] {
    return Array.from(this.rollouts.values())
      .filter(rollout => rollout.flagKey === flagKey);
  }
}

// Task 4: User Segmentation Engine
export class UserSegmentationEngine extends EventEmitter {
  private segments: Map<string, UserSegmentation> = new Map();
  private userProfiles: Map<string, any> = new Map();
  private config: ABTestConfig;

  constructor(config: ABTestConfig) {
    super();
    this.config = config;
    this.initializeDefaultSegments();
  }

  public async createSegment(segment: Omit<UserSegmentation, 'id' | 'lastUpdated'>): Promise<UserSegmentation> {
    const id = this.generateSegmentId();
    
    const fullSegment: UserSegmentation = {
      ...segment,
      id,
      lastUpdated: new Date()
    };

    // Calculate initial user count
    fullSegment.userCount = await this.calculateSegmentSize(fullSegment);

    this.segments.set(id, fullSegment);
    this.emit('segmentCreated', fullSegment);

    return fullSegment;
  }

  public async updateSegment(id: string, updates: Partial<UserSegmentation>): Promise<UserSegmentation> {
    const segment = this.segments.get(id);
    if (!segment) {
      throw new Error(`Segment not found: ${id}`);
    }

    const updatedSegment = {
      ...segment,
      ...updates,
      lastUpdated: new Date()
    };

    // Recalculate user count if criteria changed
    if (updates.criteria) {
      updatedSegment.userCount = await this.calculateSegmentSize(updatedSegment);
    }

    this.segments.set(id, updatedSegment);
    this.emit('segmentUpdated', updatedSegment);

    return updatedSegment;
  }

  public async deleteSegment(id: string): Promise<void> {
    const segment = this.segments.get(id);
    if (!segment) {
      throw new Error(`Segment not found: ${id}`);
    }

    this.segments.delete(id);
    this.emit('segmentDeleted', { id, segment });
  }

  public getSegment(id: string): UserSegmentation | null {
    return this.segments.get(id) || null;
  }

  public getAllSegments(): UserSegmentation[] {
    return Array.from(this.segments.values());
  }

  public async evaluateUserSegments(userContext: UserContext): Promise<string[]> {
    const matchingSegments: string[] = [];

    for (const segment of this.segments.values()) {
      if (await this.userMatchesSegment(userContext, segment)) {
        matchingSegments.push(segment.id);
      }
    }

    // Cache user profile for faster future evaluations
    this.updateUserProfile(userContext);

    return matchingSegments;
  }

  public async userMatchesSegment(userContext: UserContext, segment: UserSegmentation): Promise<boolean> {
    if (!segment.criteria || segment.criteria.length === 0) {
      return true; // Empty criteria matches all users
    }

    let totalScore = 0;
    let totalWeight = 0;

    for (const criteria of segment.criteria) {
      const userValue = this.getUserAttribute(criteria.attribute, userContext);
      const matches = this.evaluateCriteria(criteria, userValue);
      
      if (matches) {
        totalScore += criteria.weight;
      }
      totalWeight += criteria.weight;
    }

    // User matches if they meet the weighted threshold (typically 50%)
    const threshold = 0.5; // Could be configurable per segment
    return totalWeight > 0 && (totalScore / totalWeight) >= threshold;
  }

  public async calculateSegmentOverlap(segmentId1: string, segmentId2: string): Promise<{
    overlapCount: number;
    overlapPercentage: number;
    segment1Size: number;
    segment2Size: number;
  }> {
    const segment1 = this.segments.get(segmentId1);
    const segment2 = this.segments.get(segmentId2);

    if (!segment1 || !segment2) {
      throw new Error('One or both segments not found');
    }

    // Mock implementation - in real system, query user database
    const segment1Size = segment1.userCount || 0;
    const segment2Size = segment2.userCount || 0;
    const overlapCount = Math.floor(Math.min(segment1Size, segment2Size) * Math.random() * 0.3);
    const overlapPercentage = segment1Size > 0 ? (overlapCount / segment1Size) * 100 : 0;

    return {
      overlapCount,
      overlapPercentage,
      segment1Size,
      segment2Size
    };
  }

  public async getSegmentInsights(segmentId: string): Promise<any> {
    const segment = this.segments.get(segmentId);
    if (!segment) {
      throw new Error(`Segment not found: ${segmentId}`);
    }

    // Mock insights generation
    return {
      segmentId,
      userCount: segment.userCount,
      growthRate: Math.random() * 20 - 10, // -10% to +10%
      topAttributes: [
        { attribute: 'plan', value: 'pro', percentage: 65 },
        { attribute: 'region', value: 'us-west', percentage: 45 },
        { attribute: 'device', value: 'desktop', percentage: 78 }
      ],
      behaviorPatterns: [
        { pattern: 'High feature adoption', score: 85 },
        { pattern: 'Active in evenings', score: 72 },
        { pattern: 'Mobile-first usage', score: 34 }
      ],
      conversionMetrics: {
        averageConversionRate: Math.random() * 15 + 5,
        lifetimeValue: Math.random() * 1000 + 500,
        retentionRate: Math.random() * 40 + 60
      }
    };
  }

  private async calculateSegmentSize(segment: UserSegmentation): Promise<number> {
    // Mock calculation - in real system, query user database
    // More complex criteria = smaller segment size
    const complexityFactor = segment.criteria.length * 0.1;
    const baseSize = 10000;
    const adjustedSize = Math.floor(baseSize * (1 - complexityFactor) * Math.random());
    return Math.max(100, adjustedSize); // Minimum 100 users
  }

  private evaluateCriteria(criteria: SegmentationCriteria, userValue: any): boolean {
    try {
      switch (criteria.operator) {
        case 'equals':
          return userValue === criteria.value;
        case 'not_equals':
          return userValue !== criteria.value;
        case 'in':
          return Array.isArray(criteria.value) && criteria.value.includes(userValue);
        case 'not_in':
          return Array.isArray(criteria.value) && !criteria.value.includes(userValue);
        case 'contains':
          return typeof userValue === 'string' && userValue.includes(criteria.value);
        case 'starts_with':
          return typeof userValue === 'string' && userValue.startsWith(criteria.value);
        case 'ends_with':
          return typeof userValue === 'string' && userValue.endsWith(criteria.value);
        case 'regex':
          return typeof userValue === 'string' && new RegExp(criteria.value).test(userValue);
        case 'gt':
          return typeof userValue === 'number' && userValue > criteria.value;
        case 'lt':
          return typeof userValue === 'number' && userValue < criteria.value;
        case 'gte':
          return typeof userValue === 'number' && userValue >= criteria.value;
        case 'lte':
          return typeof userValue === 'number' && userValue <= criteria.value;
        case 'between':
          return typeof userValue === 'number' && 
                 Array.isArray(criteria.value) && 
                 criteria.value.length === 2 &&
                 userValue >= criteria.value[0] && 
                 userValue <= criteria.value[1];
        case 'exists':
          return userValue !== undefined && userValue !== null;
        case 'not_exists':
          return userValue === undefined || userValue === null;
        default:
          console.warn(`Unknown segmentation operator: ${criteria.operator}`);
          return false;
      }
    } catch (error) {
      console.error(`Error evaluating criteria:`, error);
      return false;
    }
  }

  private getUserAttribute(attribute: string, userContext: UserContext): any {
    // Enhanced attribute extraction with computed attributes
    switch (attribute) {
      // Direct attributes
      case 'userId':
        return userContext.userId;
      case 'organizationId':
        return userContext.organizationId;
      case 'email':
        return userContext.email;
      case 'cohort':
        return userContext.cohort;
      case 'plan':
        return userContext.plan;
      case 'region':
        return userContext.region;
      case 'device':
        return userContext.device;
      case 'browser':
        return userContext.browser;
      
      // Computed attributes
      case 'email_domain':
        return userContext.email ? userContext.email.split('@')[1] : null;
      case 'user_age_days':
        // Mock calculation - in real system, calculate from user creation date
        return Math.floor(Math.random() * 365) + 1;
      case 'is_weekend_user':
        // Mock calculation - in real system, analyze usage patterns
        return Math.random() > 0.5;
      case 'session_count':
        // Mock calculation - in real system, query session data
        return Math.floor(Math.random() * 100) + 1;
      
      // Custom attributes
      default:
        return userContext.customAttributes?.[attribute];
    }
  }

  private updateUserProfile(userContext: UserContext): void {
    const existingProfile = this.userProfiles.get(userContext.userId) || {};
    
    const updatedProfile = {
      ...existingProfile,
      userId: userContext.userId,
      lastSeen: new Date(),
      email: userContext.email,
      organizationId: userContext.organizationId,
      plan: userContext.plan,
      region: userContext.region,
      device: userContext.device,
      browser: userContext.browser,
      customAttributes: { ...existingProfile.customAttributes, ...userContext.customAttributes }
    };

    this.userProfiles.set(userContext.userId, updatedProfile);
  }

  private initializeDefaultSegments(): void {
    // Create some default segments
    const defaultSegments = [
      {
        name: 'All Users',
        description: 'All users in the system',
        criteria: []
      },
      {
        name: 'Enterprise Users',
        description: 'Users on enterprise plans',
        criteria: [
          {
            type: 'demographic' as const,
            attribute: 'plan',
            operator: 'equals',
            value: 'enterprise',
            weight: 1
          }
        ]
      },
      {
        name: 'Mobile Users',
        description: 'Users primarily on mobile devices',
        criteria: [
          {
            type: 'technographic' as const,
            attribute: 'device',
            operator: 'in',
            value: ['mobile', 'tablet'],
            weight: 1
          }
        ]
      },
      {
        name: 'New Users',
        description: 'Users created in the last 30 days',
        criteria: [
          {
            type: 'behavioral' as const,
            attribute: 'user_age_days',
            operator: 'lte',
            value: 30,
            weight: 1
          }
        ]
      }
    ];

    for (const segmentData of defaultSegments) {
      this.createSegment(segmentData);
    }
  }

  private generateSegmentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `SEG-${timestamp}-${random}`.toUpperCase();
  }
}

// Continue in next part due to length... 