/**
 * Subscription Tier Management System
 * 
 * Manages access to features across subscription tiers:
 * - Developer: All 7 local models, basic features
 * - Team: All 7 local models, collaboration features 
 * - Enterprise: All 7 local models + custom models, advanced features
 * - G3D Enterprise: On-prem deployment, unlimited features
 */

import { EventEmitter } from 'events';
import { SubscriptionTier } from './TokenManager';

export interface TierFeatures {
  // Model Access
  localModels: string[];
  customModels: boolean;
  onPremDeployment: boolean;
  
  // Core Features
  collaboration: boolean;
  xrSupport: boolean;
  g3dVisualization: boolean;
  aiSwarm: boolean;
  marketplace: boolean;
  
  // Enterprise Features
  ssoAuthentication: boolean;
  auditLogs: boolean;
  complianceReports: boolean;
  privateVpc: boolean;
  whiteLabel: boolean;
  
  // Analytics & Monitoring
  basicAnalytics: boolean;
  advancedAnalytics: boolean;
  costOptimization: boolean;
  performanceMonitoring: boolean;
  
  // Support Features
  communitySupport: boolean;
  emailSupport: boolean;
  chatSupport: boolean;
  phoneSupport: boolean;
  dedicatedSupport: boolean;
  
  // Limits & Quotas
  maxUsers: number;
  maxProjects: number;
  maxStorageGB: number;
  maxConcurrentSessions: number;
}

export interface TierPricing {
  monthlyPrice: number;
  yearlyPrice: number;
  currency: 'USD';
  billingCycle: 'monthly' | 'yearly' | 'custom';
  setupFee?: number;
  customPricing?: boolean;
}

export interface TierConfiguration {
  tier: SubscriptionTier;
  name: string;
  description: string;
  features: TierFeatures;
  pricing: TierPricing;
  isActive: boolean;
  targetAudience: string[];
}

export interface UserSubscription {
  userId: string;
  organizationId?: string;
  tier: SubscriptionTier;
  status: 'active' | 'suspended' | 'cancelled' | 'trial';
  startDate: Date;
  endDate?: Date;
  trialEndDate?: Date;
  billingCycle: 'monthly' | 'yearly' | 'custom';
  autoRenew: boolean;
  features: TierFeatures;
  customizations?: Partial<TierFeatures>;
}

export interface TierUpgradeRequest {
  userId: string;
  organizationId?: string;
  fromTier: SubscriptionTier;
  toTier: SubscriptionTier;
  requestedDate: Date;
  effectiveDate: Date;
  reason?: string;
  approvalRequired: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

export interface TierUsageValidation {
  isValid: boolean;
  feature: string;
  tier: SubscriptionTier;
  limit?: number;
  currentUsage?: number;
  reason?: string;
  upgradeRequired?: SubscriptionTier;
}

export class TierManager extends EventEmitter {
  private static instance: TierManager;
  private subscriptions: Map<string, UserSubscription> = new Map();
  private tierConfigurations: Map<SubscriptionTier, TierConfiguration> = new Map();

  public static getInstance(): TierManager {
    if (!TierManager.instance) {
      TierManager.instance = new TierManager();
    }
    return TierManager.instance;
  }

  private constructor() {
    super();
    this.initializeTierConfigurations();
  }

  private initializeTierConfigurations(): void {
    // Developer Tier
    this.tierConfigurations.set(SubscriptionTier.DEVELOPER, {
      tier: SubscriptionTier.DEVELOPER,
      name: 'Developer',
      description: 'Perfect for individual developers and small projects',
      features: {
        localModels: ['qwen3-coder', 'phi-4-mini', 'codellama', 'starcoder2', 'deepseek-coder'],
        customModels: false,
        onPremDeployment: false,
        collaboration: false,
        xrSupport: false,
        g3dVisualization: true,
        aiSwarm: false,
        marketplace: true,
        ssoAuthentication: false,
        auditLogs: false,
        complianceReports: false,
        privateVpc: false,
        whiteLabel: false,
        basicAnalytics: true,
        advancedAnalytics: false,
        costOptimization: false,
        performanceMonitoring: false,
        communitySupport: true,
        emailSupport: false,
        chatSupport: false,
        phoneSupport: false,
        dedicatedSupport: false,
        maxUsers: 1,
        maxProjects: 5,
        maxStorageGB: 10,
        maxConcurrentSessions: 1
      },
      pricing: {
        monthlyPrice: 39,
        yearlyPrice: 390,
        currency: 'USD',
        billingCycle: 'monthly'
      },
      isActive: true,
      targetAudience: ['Individual Developers', 'Students', 'Open Source Contributors']
    });

    // Team Tier
    this.tierConfigurations.set(SubscriptionTier.TEAM, {
      tier: SubscriptionTier.TEAM,
      name: 'Team',
      description: 'Collaboration features for small to medium teams',
      features: {
        localModels: ['qwen3-coder', 'phi-4-mini', 'codellama', 'starcoder2', 'deepseek-coder', 'mistral-codestral', 'gemma'],
        customModels: false,
        onPremDeployment: false,
        collaboration: true,
        xrSupport: true,
        g3dVisualization: true,
        aiSwarm: true,
        marketplace: true,
        ssoAuthentication: false,
        auditLogs: true,
        complianceReports: false,
        privateVpc: false,
        whiteLabel: false,
        basicAnalytics: true,
        advancedAnalytics: true,
        costOptimization: true,
        performanceMonitoring: true,
        communitySupport: true,
        emailSupport: true,
        chatSupport: true,
        phoneSupport: false,
        dedicatedSupport: false,
        maxUsers: 50,
        maxProjects: 25,
        maxStorageGB: 100,
        maxConcurrentSessions: 10
      },
      pricing: {
        monthlyPrice: 99,
        yearlyPrice: 990,
        currency: 'USD',
        billingCycle: 'monthly'
      },
      isActive: true,
      targetAudience: ['Small Teams', 'Startups', 'Growing Companies']
    });

    // Enterprise Tier
    this.tierConfigurations.set(SubscriptionTier.ENTERPRISE, {
      tier: SubscriptionTier.ENTERPRISE,
      name: 'Enterprise',
      description: 'Advanced features for large organizations',
      features: {
        localModels: ['qwen3-coder', 'phi-4-mini', 'codellama', 'starcoder2', 'deepseek-coder', 'mistral-codestral', 'gemma'],
        customModels: true,
        onPremDeployment: false,
        collaboration: true,
        xrSupport: true,
        g3dVisualization: true,
        aiSwarm: true,
        marketplace: true,
        ssoAuthentication: true,
        auditLogs: true,
        complianceReports: true,
        privateVpc: true,
        whiteLabel: false,
        basicAnalytics: true,
        advancedAnalytics: true,
        costOptimization: true,
        performanceMonitoring: true,
        communitySupport: true,
        emailSupport: true,
        chatSupport: true,
        phoneSupport: true,
        dedicatedSupport: false,
        maxUsers: 5000,
        maxProjects: 1000,
        maxStorageGB: 1000,
        maxConcurrentSessions: 100
      },
      pricing: {
        monthlyPrice: 299,
        yearlyPrice: 2990,
        currency: 'USD',
        billingCycle: 'monthly'
      },
      isActive: true,
      targetAudience: ['Large Teams', 'Enterprises', 'Government Agencies']
    });

    // G3D Enterprise Tier
    this.tierConfigurations.set(SubscriptionTier.G3D_ENTERPRISE, {
      tier: SubscriptionTier.G3D_ENTERPRISE,
      name: 'G3D Enterprise',
      description: 'On-premises deployment with unlimited features',
      features: {
        localModels: ['qwen3-coder', 'phi-4-mini', 'codellama', 'starcoder2', 'deepseek-coder', 'mistral-codestral', 'gemma'],
        customModels: true,
        onPremDeployment: true,
        collaboration: true,
        xrSupport: true,
        g3dVisualization: true,
        aiSwarm: true,
        marketplace: true,
        ssoAuthentication: true,
        auditLogs: true,
        complianceReports: true,
        privateVpc: true,
        whiteLabel: true,
        basicAnalytics: true,
        advancedAnalytics: true,
        costOptimization: true,
        performanceMonitoring: true,
        communitySupport: true,
        emailSupport: true,
        chatSupport: true,
        phoneSupport: true,
        dedicatedSupport: true,
        maxUsers: Infinity,
        maxProjects: Infinity,
        maxStorageGB: Infinity,
        maxConcurrentSessions: Infinity
      },
      pricing: {
        monthlyPrice: 100000,
        yearlyPrice: 1000000,
        currency: 'USD',
        billingCycle: 'custom',
        customPricing: true
      },
      isActive: true,
      targetAudience: ['Fortune 500', 'Government', 'High-Security Organizations']
    });
  }

  /**
   * Get tier configuration
   */
  public getTierConfiguration(tier: SubscriptionTier): TierConfiguration | undefined {
    return this.tierConfigurations.get(tier);
  }

  /**
   * Get all available tier configurations
   */
  public getAllTierConfigurations(): TierConfiguration[] {
    return Array.from(this.tierConfigurations.values()).filter(config => config.isActive);
  }

  /**
   * Validate feature access for a user
   */
  public async validateFeatureAccess(
    userId: string,
    feature: keyof TierFeatures,
    organizationId?: string
  ): Promise<TierUsageValidation> {
    const subscription = await this.getUserSubscription(userId, organizationId);
    
    if (!subscription) {
      return {
        isValid: false,
        feature,
        tier: SubscriptionTier.DEVELOPER,
        reason: 'No active subscription found',
        upgradeRequired: SubscriptionTier.DEVELOPER
      };
    }

    const tierConfig = this.tierConfigurations.get(subscription.tier);
    if (!tierConfig) {
      return {
        isValid: false,
        feature,
        tier: subscription.tier,
        reason: 'Invalid tier configuration'
      };
    }

    const hasFeature = tierConfig.features[feature];
    
    if (typeof hasFeature === 'boolean') {
      const result: TierUsageValidation = {
        isValid: hasFeature,
        feature,
        tier: subscription.tier
      };
      
      if (!hasFeature) {
        result.reason = `Feature not available in ${tierConfig.name} tier`;
        result.upgradeRequired = this.getMinimumTierForFeature(feature);
      }
      
      return result;
    }

    // Handle numeric limits
    if (typeof hasFeature === 'number') {
      return {
        isValid: true,
        feature,
        tier: subscription.tier,
        limit: hasFeature,
        currentUsage: 0 // This would be populated from usage tracking
      };
    }

    // Handle array features (like models)
    if (Array.isArray(hasFeature)) {
      return {
        isValid: hasFeature.length > 0,
        feature,
        tier: subscription.tier
      };
    }

    return {
      isValid: false,
      feature,
      tier: subscription.tier,
      reason: 'Unable to validate feature access'
    };
  }

  /**
   * Get user subscription
   */
  public async getUserSubscription(
    userId: string,
    organizationId?: string
  ): Promise<UserSubscription | undefined> {
    const key = organizationId || userId;
    return this.subscriptions.get(key);
  }

  /**
   * Create or update user subscription
   */
  public async updateSubscription(subscription: UserSubscription): Promise<void> {
    const key = subscription.organizationId || subscription.userId;
    const oldSubscription = this.subscriptions.get(key);
    
    this.subscriptions.set(key, subscription);
    
    this.emit('subscriptionUpdated', {
      userId: subscription.userId,
      organizationId: subscription.organizationId,
      oldTier: oldSubscription?.tier,
      newTier: subscription.tier,
      timestamp: new Date()
    });
  }

  /**
   * Request tier upgrade
   */
  public async requestTierUpgrade(
    userId: string,
    toTier: SubscriptionTier,
    organizationId?: string,
    reason?: string
  ): Promise<TierUpgradeRequest> {
    const currentSubscription = await this.getUserSubscription(userId, organizationId);
    const fromTier = currentSubscription?.tier || SubscriptionTier.DEVELOPER;

    const upgradeRequest: TierUpgradeRequest = {
      userId,
      ...(organizationId && { organizationId }),
      fromTier,
      toTier,
      requestedDate: new Date(),
      effectiveDate: new Date(), // Immediate by default
      ...(reason && { reason }),
      approvalRequired: this.requiresApprovalForUpgrade(fromTier, toTier),
      status: 'pending'
    };

    this.emit('tierUpgradeRequested', upgradeRequest);
    return upgradeRequest;
  }

  /**
   * Process tier upgrade
   */
  public async processTierUpgrade(
    upgradeRequest: TierUpgradeRequest,
    approved: boolean = true
  ): Promise<void> {
    if (!approved) {
      upgradeRequest.status = 'rejected';
      this.emit('tierUpgradeRejected', upgradeRequest);
      return;
    }

    const newTierConfig = this.tierConfigurations.get(upgradeRequest.toTier);
    if (!newTierConfig) {
      throw new Error(`Invalid tier: ${upgradeRequest.toTier}`);
    }

    const currentSubscription = await this.getUserSubscription(
      upgradeRequest.userId,
      upgradeRequest.organizationId
    );

    const updatedSubscription: UserSubscription = {
      userId: upgradeRequest.userId,
      ...(upgradeRequest.organizationId && { organizationId: upgradeRequest.organizationId }),
      tier: upgradeRequest.toTier,
      status: 'active',
      startDate: upgradeRequest.effectiveDate,
      ...(currentSubscription?.endDate && { endDate: currentSubscription.endDate }),
      ...(currentSubscription?.trialEndDate && { trialEndDate: currentSubscription.trialEndDate }),
      billingCycle: newTierConfig.pricing.billingCycle as any,
      autoRenew: currentSubscription?.autoRenew || true,
      features: { ...newTierConfig.features },
      ...(currentSubscription?.customizations && { customizations: currentSubscription.customizations })
    };

    await this.updateSubscription(updatedSubscription);
    
    upgradeRequest.status = 'completed';
    this.emit('tierUpgradeCompleted', upgradeRequest);
  }

  /**
   * Check if tier upgrade requires approval
   */
  private requiresApprovalForUpgrade(fromTier: SubscriptionTier, toTier: SubscriptionTier): boolean {
    // G3D Enterprise always requires approval
    if (toTier === SubscriptionTier.G3D_ENTERPRISE) {
      return true;
    }

    // Any upgrade to Enterprise or above requires approval
    const tierHierarchy = [
      SubscriptionTier.DEVELOPER,
      SubscriptionTier.TEAM,
      SubscriptionTier.ENTERPRISE,
      SubscriptionTier.G3D_ENTERPRISE
    ];

    const fromIndex = tierHierarchy.indexOf(fromTier);
    const toIndex = tierHierarchy.indexOf(toTier);

    // Enterprise upgrades require approval
    return toIndex >= 2;
  }

  /**
   * Get minimum tier required for a feature
   */
  private getMinimumTierForFeature(feature: keyof TierFeatures): SubscriptionTier {
    const tiers = [
      SubscriptionTier.DEVELOPER,
      SubscriptionTier.TEAM,
      SubscriptionTier.ENTERPRISE,
      SubscriptionTier.G3D_ENTERPRISE
    ];

    for (const tier of tiers) {
      const config = this.tierConfigurations.get(tier);
      if (config && config.features[feature]) {
        return tier;
      }
    }

    return SubscriptionTier.G3D_ENTERPRISE;
  }

  /**
   * Get tier comparison for upgrade recommendations
   */
  public getTierComparison(currentTier: SubscriptionTier): {
    current: TierConfiguration;
    upgrades: Array<{
      tier: TierConfiguration;
      newFeatures: string[];
      enhancedFeatures: string[];
    }>;
  } {
    const current = this.tierConfigurations.get(currentTier)!;
    const allTiers = this.getAllTierConfigurations();
    const tierHierarchy = [
      SubscriptionTier.DEVELOPER,
      SubscriptionTier.TEAM,
      SubscriptionTier.ENTERPRISE,
      SubscriptionTier.G3D_ENTERPRISE
    ];

    const currentIndex = tierHierarchy.indexOf(currentTier);
    const upgrades = allTiers
      .filter(tier => tierHierarchy.indexOf(tier.tier) > currentIndex)
      .map(tier => ({
        tier,
        newFeatures: this.getNewFeatures(current.features, tier.features),
        enhancedFeatures: this.getEnhancedFeatures(current.features, tier.features)
      }));

    return { current, upgrades };
  }

  private getNewFeatures(currentFeatures: TierFeatures, upgradeFeatures: TierFeatures): string[] {
    const newFeatures: string[] = [];
    
    Object.entries(upgradeFeatures).forEach(([feature, value]) => {
      const currentValue = currentFeatures[feature as keyof TierFeatures];
      
      if (typeof value === 'boolean' && value && !currentValue) {
        newFeatures.push(feature);
      }
    });

    return newFeatures;
  }

  private getEnhancedFeatures(currentFeatures: TierFeatures, upgradeFeatures: TierFeatures): string[] {
    const enhancedFeatures: string[] = [];
    
    Object.entries(upgradeFeatures).forEach(([feature, value]) => {
      const currentValue = currentFeatures[feature as keyof TierFeatures];
      
      if (typeof value === 'number' && typeof currentValue === 'number' && value > currentValue) {
        enhancedFeatures.push(feature);
      }
      
      if (Array.isArray(value) && Array.isArray(currentValue) && value.length > currentValue.length) {
        enhancedFeatures.push(feature);
      }
    });

    return enhancedFeatures;
  }

  /**
   * Calculate upgrade pricing
   */
  public calculateUpgradePricing(
    fromTier: SubscriptionTier,
    toTier: SubscriptionTier,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ): {
    currentPrice: number;
    newPrice: number;
    priceDifference: number;
    prorationCredit?: number;
    nextBillAmount: number;
  } {
    const fromConfig = this.tierConfigurations.get(fromTier)!;
    const toConfig = this.tierConfigurations.get(toTier)!;

    const currentPrice = billingCycle === 'yearly' ? fromConfig.pricing.yearlyPrice : fromConfig.pricing.monthlyPrice;
    const newPrice = billingCycle === 'yearly' ? toConfig.pricing.yearlyPrice : toConfig.pricing.monthlyPrice;

    return {
      currentPrice,
      newPrice,
      priceDifference: newPrice - currentPrice,
      nextBillAmount: newPrice
    };
  }
}

export default TierManager; 