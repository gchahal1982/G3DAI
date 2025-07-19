/**
 * Token Management System
 * 
 * Enforces token usage limits and rate limiting across subscription tiers:
 * - Developer: 15k tokens/day, 100 req/hour, $0.002/token overage
 * - Team: Unlimited tokens, 500 req/hour
 * - Enterprise: Unlimited tokens, 2000 req/hour
 * - G3D Enterprise: No limits (on-prem)
 */

import { EventEmitter } from 'events';

export interface TokenUsage {
  userId: string;
  organizationId?: string;
  tokensUsed: number;
  requestCount: number;
  timestamp: Date;
  modelUsed: string;
  tier: SubscriptionTier;
}

export interface UsageLimit {
  dailyTokenLimit?: number;
  hourlyRequestLimit: number;
  overageRate?: number; // $/token
  alertThresholds: number[]; // percentage thresholds
}

export enum SubscriptionTier {
  DEVELOPER = 'developer',
  TEAM = 'team',
  ENTERPRISE = 'enterprise',
  G3D_ENTERPRISE = 'g3d_enterprise'
}

export interface TierLimits {
  [SubscriptionTier.DEVELOPER]: UsageLimit;
  [SubscriptionTier.TEAM]: UsageLimit;
  [SubscriptionTier.ENTERPRISE]: UsageLimit;
  [SubscriptionTier.G3D_ENTERPRISE]: UsageLimit;
}

export interface UsageAlert {
  userId: string;
  organizationId?: string;
  tier: SubscriptionTier;
  alertType: 'token_threshold' | 'rate_limit' | 'overage' | 'daily_limit';
  currentUsage: number;
  limit: number;
  percentage: number;
  timestamp: Date;
}

export interface OverageBilling {
  userId: string;
  organizationId?: string;
  period: string; // YYYY-MM-DD
  excessTokens: number;
  overageAmount: number; // USD
  billingStatus: 'pending' | 'charged' | 'failed';
}

export class TokenManager extends EventEmitter {
  private static instance: TokenManager;
  private usageCache: Map<string, TokenUsage[]> = new Map();
  private rateLimitCache: Map<string, number[]> = new Map();
  private alertsSent: Set<string> = new Set();

  private readonly TIER_LIMITS: TierLimits = {
    [SubscriptionTier.DEVELOPER]: {
      dailyTokenLimit: 15000,
      hourlyRequestLimit: 100,
      overageRate: 0.002,
      alertThresholds: [50, 75, 90, 95]
    },
    [SubscriptionTier.TEAM]: {
      hourlyRequestLimit: 500,
      alertThresholds: [80, 90, 95]
    },
    [SubscriptionTier.ENTERPRISE]: {
      hourlyRequestLimit: 2000,
      alertThresholds: [85, 95]
    },
    [SubscriptionTier.G3D_ENTERPRISE]: {
      hourlyRequestLimit: Infinity,
      alertThresholds: []
    }
  };

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  private constructor() {
    super();
    this.initializeCleanupScheduler();
  }

  /**
   * Check if a token request is allowed under current limits
   */
  public async canUseTokens(
    userId: string,
    tokensRequested: number,
    tier: SubscriptionTier,
    organizationId?: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
    overageInfo?: {
      excessTokens: number;
      estimatedCost: number;
    };
  }> {
    const key = organizationId || userId;
    const limits = this.TIER_LIMITS[tier];

    // Check rate limiting first
    const rateLimitOk = await this.checkRateLimit(key, limits.hourlyRequestLimit);
    if (!rateLimitOk) {
      return {
        allowed: false,
        reason: `Rate limit exceeded. Maximum ${limits.hourlyRequestLimit} requests per hour.`
      };
    }

    // G3D Enterprise has no token limits
    if (tier === SubscriptionTier.G3D_ENTERPRISE) {
      return { allowed: true };
    }

    // Team and Enterprise have unlimited tokens
    if (tier === SubscriptionTier.TEAM || tier === SubscriptionTier.ENTERPRISE) {
      return { allowed: true };
    }

    // Developer tier: check daily token limit
    if (limits.dailyTokenLimit) {
      const dailyUsage = await this.getDailyTokenUsage(key);
      const totalAfterRequest = dailyUsage + tokensRequested;

      if (totalAfterRequest <= limits.dailyTokenLimit) {
        return { allowed: true };
      }

      // Calculate overage
      const excessTokens = totalAfterRequest - limits.dailyTokenLimit;
      const estimatedCost = excessTokens * (limits.overageRate || 0);

      return {
        allowed: true, // Allow with overage billing
        overageInfo: {
          excessTokens,
          estimatedCost
        }
      };
    }

    return { allowed: true };
  }

  /**
   * Record token usage and handle billing
   */
  public async recordTokenUsage(usage: TokenUsage): Promise<void> {
    const key = usage.organizationId || usage.userId;
    
    // Cache usage data
    if (!this.usageCache.has(key)) {
      this.usageCache.set(key, []);
    }
    this.usageCache.get(key)!.push(usage);

    // Check for alerts
    await this.checkUsageAlerts(usage);

    // Handle overage billing for Developer tier
    if (usage.tier === SubscriptionTier.DEVELOPER) {
      await this.handleOverageBilling(usage);
    }

    // Emit usage event for analytics
    this.emit('tokenUsage', usage);
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(key: string, hourlyLimit: number): Promise<boolean> {
    if (hourlyLimit === Infinity) return true;

    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Get recent requests
    if (!this.rateLimitCache.has(key)) {
      this.rateLimitCache.set(key, []);
    }

    const requests = this.rateLimitCache.get(key)!;
    
    // Remove old requests
    const recentRequests = requests.filter(timestamp => timestamp > oneHourAgo);
    this.rateLimitCache.set(key, recentRequests);

    // Check if we can add another request
    if (recentRequests.length >= hourlyLimit) {
      return false;
    }

    // Record this request
    recentRequests.push(now);
    return true;
  }

  /**
   * Get daily token usage for a user/organization
   */
  private async getDailyTokenUsage(key: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usages = this.usageCache.get(key) || [];
    return usages
      .filter(usage => usage.timestamp >= today)
      .reduce((total, usage) => total + usage.tokensUsed, 0);
  }

  /**
   * Check for usage alerts and send notifications
   */
  private async checkUsageAlerts(usage: TokenUsage): Promise<void> {
    const limits = this.TIER_LIMITS[usage.tier];
    if (!limits.dailyTokenLimit || limits.alertThresholds.length === 0) {
      return;
    }

    const key = usage.organizationId || usage.userId;
    const dailyUsage = await this.getDailyTokenUsage(key);
    const usagePercentage = (dailyUsage / limits.dailyTokenLimit) * 100;

    for (const threshold of limits.alertThresholds) {
      const alertKey = `${key}-${threshold}-${this.getDateKey()}`;
      
      if (usagePercentage >= threshold && !this.alertsSent.has(alertKey)) {
        const alert: UsageAlert = {
          userId: usage.userId,
          ...(usage.organizationId && { organizationId: usage.organizationId }),
          tier: usage.tier,
          alertType: 'token_threshold',
          currentUsage: dailyUsage,
          limit: limits.dailyTokenLimit,
          percentage: usagePercentage,
          timestamp: new Date()
        };

        this.emit('usageAlert', alert);
        this.alertsSent.add(alertKey);
      }
    }
  }

  /**
   * Handle overage billing for Developer tier
   */
  private async handleOverageBilling(usage: TokenUsage): Promise<void> {
    if (usage.tier !== SubscriptionTier.DEVELOPER) return;

    const limits = this.TIER_LIMITS[usage.tier];
    if (!limits.dailyTokenLimit || !limits.overageRate) return;

    const key = usage.organizationId || usage.userId;
    const dailyUsage = await this.getDailyTokenUsage(key);

    if (dailyUsage > limits.dailyTokenLimit) {
      const excessTokens = dailyUsage - limits.dailyTokenLimit;
      const overageAmount = excessTokens * limits.overageRate;

      const billing: OverageBilling = {
        userId: usage.userId,
        organizationId: usage.organizationId,
        period: this.getDateKey(),
        excessTokens,
        overageAmount,
        billingStatus: 'pending'
      };

      this.emit('overageBilling', billing);
    }
  }

  /**
   * Get usage statistics for analytics
   */
  public async getUsageStatistics(
    userId: string,
    organizationId?: string,
    timeRange: 'day' | 'week' | 'month' = 'day'
  ): Promise<{
    totalTokens: number;
    totalRequests: number;
    averageTokensPerRequest: number;
    topModels: Array<{ model: string; tokens: number; requests: number }>;
    dailyBreakdown: Array<{ date: string; tokens: number; requests: number }>;
  }> {
    const key = organizationId || userId;
    const usages = this.usageCache.get(key) || [];

    const now = new Date();
    const timeRangeMs = this.getTimeRangeMs(timeRange);
    const cutoff = new Date(now.getTime() - timeRangeMs);

    const filteredUsages = usages.filter(usage => usage.timestamp >= cutoff);

    const totalTokens = filteredUsages.reduce((sum, usage) => sum + usage.tokensUsed, 0);
    const totalRequests = filteredUsages.length;

    // Group by model
    const modelStats = new Map<string, { tokens: number; requests: number }>();
    filteredUsages.forEach(usage => {
      const existing = modelStats.get(usage.modelUsed) || { tokens: 0, requests: 0 };
      existing.tokens += usage.tokensUsed;
      existing.requests += 1;
      modelStats.set(usage.modelUsed, existing);
    });

    const topModels = Array.from(modelStats.entries())
      .map(([model, stats]) => ({ model, ...stats }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 5);

    // Daily breakdown
    const dailyBreakdown = this.generateDailyBreakdown(filteredUsages, timeRange);

    return {
      totalTokens,
      totalRequests,
      averageTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
      topModels,
      dailyBreakdown
    };
  }

  /**
   * Get current tier limits for a user
   */
  public getTierLimits(tier: SubscriptionTier): UsageLimit {
    return { ...this.TIER_LIMITS[tier] };
  }

  /**
   * Force reset usage for testing/admin purposes
   */
  public async resetUsage(userId: string, organizationId?: string): Promise<void> {
    const key = organizationId || userId;
    this.usageCache.delete(key);
    this.rateLimitCache.delete(key);
    
    // Clear alert cache for this user
    const dateKey = this.getDateKey();
    this.TIER_LIMITS[SubscriptionTier.DEVELOPER].alertThresholds.forEach(threshold => {
      this.alertsSent.delete(`${key}-${threshold}-${dateKey}`);
    });

    this.emit('usageReset', { userId, organizationId });
  }

  private getDateKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getTimeRangeMs(timeRange: 'day' | 'week' | 'month'): number {
    switch (timeRange) {
      case 'day': return 24 * 60 * 60 * 1000;
      case 'week': return 7 * 24 * 60 * 60 * 1000;
      case 'month': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  private generateDailyBreakdown(
    usages: TokenUsage[],
    timeRange: 'day' | 'week' | 'month'
  ): Array<{ date: string; tokens: number; requests: number }> {
    const breakdown = new Map<string, { tokens: number; requests: number }>();

    usages.forEach(usage => {
      const dateKey = usage.timestamp.toISOString().split('T')[0];
      const existing = breakdown.get(dateKey) || { tokens: 0, requests: 0 };
      existing.tokens += usage.tokensUsed;
      existing.requests += 1;
      breakdown.set(dateKey, existing);
    });

    return Array.from(breakdown.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private initializeCleanupScheduler(): void {
    // Clean up old cached data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);
  }

  private cleanupOldData(): void {
    const oneWeekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));

    // Clean up usage cache
    for (const [key, usages] of this.usageCache.entries()) {
      const recentUsages = usages.filter(usage => usage.timestamp >= oneWeekAgo);
      if (recentUsages.length === 0) {
        this.usageCache.delete(key);
      } else {
        this.usageCache.set(key, recentUsages);
      }
    }

    // Clean up rate limit cache
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [key, requests] of this.rateLimitCache.entries()) {
      const recentRequests = requests.filter(timestamp => timestamp > oneHourAgo);
      if (recentRequests.length === 0) {
        this.rateLimitCache.delete(key);
      } else {
        this.rateLimitCache.set(key, recentRequests);
      }
    }

    // Clean up old alert cache
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];
    
    const alertsToRemove = Array.from(this.alertsSent)
      .filter(alertKey => alertKey.endsWith(yesterdayKey));
    alertsToRemove.forEach(alertKey => this.alertsSent.delete(alertKey));
  }
}

export default TokenManager; 