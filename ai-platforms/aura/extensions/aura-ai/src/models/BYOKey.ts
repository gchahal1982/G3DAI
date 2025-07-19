/**
 * BYOKey - Bring Your Own Key Provider Management
 * Aura MVP - Updated for July 2025 Model Ecosystem
 * 
 * Supports secure API key management for all major AI providers with
 * the latest 2025 models, usage tracking, cost analytics, and compliance.
 */

import { EventEmitter } from 'events';
import { encrypt, decrypt } from '../crypto/encryption';

// Provider Configuration Types
export interface ProviderEndpoint {
  id: string;
  name: string;
  baseUrl: string;
  authType: 'bearer' | 'api-key' | 'oauth';
  models: ModelEndpoint[];
  pricing: PricingTier[];
  limits: RateLimits;
  regions: string[];
  compliance: ComplianceFeatures;
}

export interface ModelEndpoint {
  id: string;
  name: string;
  endpoint: string;
  contextWindow: number;
  outputTokens: number;
  multimodal: boolean;
  streamingSupported: boolean;
  pricing: {
    inputPerMToken: number;
    outputPerMToken: number;
  };
  capabilities: string[];
}

export interface PricingTier {
  name: string;
  monthlySpend: number;
  discount: number;
  features: string[];
}

export interface RateLimits {
  requestsPerMinute: number;
  tokensPerMinute: number;
  tokensPerDay: number;
  concurrentRequests: number;
}

export interface ComplianceFeatures {
  dataRetention: string;
  training: 'opt-in' | 'opt-out' | 'never';
  regions: string[];
  certifications: string[];
}

export interface BYOKeyConfig {
  providerId: string;
  apiKey: string;
  organizationId?: string;
  projectId?: string;
  region?: string;
  customEndpoint?: string;
  enabledModels: string[];
  budgetLimits: {
    daily: number;
    monthly: number;
    alertThreshold: number;
  };
  complianceSettings: {
    optOutTraining: boolean;
    dataLocation: string;
    retentionPolicy: string;
  };
}

export interface UsageMetrics {
  providerId: string;
  modelId: string;
  period: string;
  requests: number;
  tokensInput: number;
  tokensOutput: number;
  cost: number;
  latencyP95: number;
  errors: number;
}

// 2025 Provider Configurations
export class ProviderRegistry {
  private static providers: Map<string, ProviderEndpoint> = new Map();

  static {
    // Initialize all 2025 providers
    this.initializeProviders();
  }

  private static initializeProviders() {
    // OpenAI 2025 Models
    this.providers.set('openai', {
      id: 'openai',
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      authType: 'bearer',
      models: [
        {
          id: 'gpt-4.1',
          name: 'GPT-4.1',
          endpoint: '/chat/completions',
          contextWindow: 1000000,
          outputTokens: 32768,
          multimodal: true,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 15.0,
            outputPerMToken: 30.0
          },
          capabilities: ['coding', 'reasoning', 'multimodal', 'function-calling']
        },
        {
          id: 'o3',
          name: 'OpenAI o3',
          endpoint: '/chat/completions',
          contextWindow: 200000,
          outputTokens: 16384,
          multimodal: false,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 60.0,
            outputPerMToken: 120.0
          },
          capabilities: ['advanced-reasoning', 'thinking-mode', 'coding', 'mathematics']
        },
        {
          id: 'o3-pro',
          name: 'OpenAI o3 Pro',
          endpoint: '/chat/completions',
          contextWindow: 200000,
          outputTokens: 16384,
          multimodal: false,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 180.0,
            outputPerMToken: 360.0
          },
          capabilities: ['expert-reasoning', 'thinking-mode', 'research', 'mathematics']
        },
        {
          id: 'o4-mini',
          name: 'OpenAI o4 Mini',
          endpoint: '/chat/completions',
          contextWindow: 128000,
          outputTokens: 8192,
          multimodal: true,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 1.5,
            outputPerMToken: 6.0
          },
          capabilities: ['reasoning', 'coding', 'multimodal', 'cost-efficient']
        }
      ],
      pricing: [
        { name: 'Pay-as-you-go', monthlySpend: 0, discount: 0, features: ['Standard support'] },
        { name: 'Scale', monthlySpend: 1000, discount: 5, features: ['Priority support', 'Higher limits'] },
        { name: 'Enterprise', monthlySpend: 10000, discount: 10, features: ['Custom models', 'SLA'] }
      ],
      limits: {
        requestsPerMinute: 10000,
        tokensPerMinute: 2000000,
        tokensPerDay: 50000000,
        concurrentRequests: 100
      },
      regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
      compliance: {
        dataRetention: '30 days',
        training: 'opt-out',
        regions: ['US', 'EU'],
        certifications: ['SOC 2', 'ISO 27001']
      }
    });

    // Anthropic Claude 4 Models
    this.providers.set('anthropic', {
      id: 'anthropic',
      name: 'Anthropic',
      baseUrl: 'https://api.anthropic.com/v1',
      authType: 'api-key',
      models: [
        {
          id: 'claude-4-sonnet-20250718',
          name: 'Claude 4 Sonnet',
          endpoint: '/messages',
          contextWindow: 200000,
          outputTokens: 8192,
          multimodal: true,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 15.0,
            outputPerMToken: 75.0
          },
          capabilities: ['reasoning', 'coding', 'analysis', 'thinking-mode', 'safety']
        },
        {
          id: 'claude-4-opus-20250718',
          name: 'Claude 4 Opus',
          endpoint: '/messages',
          contextWindow: 200000,
          outputTokens: 8192,
          multimodal: true,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 75.0,
            outputPerMToken: 225.0
          },
          capabilities: ['expert-reasoning', 'research', 'coding', 'thinking-mode', 'safety']
        },
        {
          id: 'claude-4-haiku-20250718',
          name: 'Claude 4 Haiku',
          endpoint: '/messages',
          contextWindow: 200000,
          outputTokens: 8192,
          multimodal: true,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 1.0,
            outputPerMToken: 5.0
          },
          capabilities: ['fast-reasoning', 'coding', 'analysis', 'cost-efficient']
        }
      ],
      pricing: [
        { name: 'Developer', monthlySpend: 0, discount: 0, features: ['Standard API'] },
        { name: 'Pro', monthlySpend: 500, discount: 3, features: ['Higher limits', 'Priority'] },
        { name: 'Enterprise', monthlySpend: 5000, discount: 8, features: ['Custom fine-tuning', 'SLA'] }
      ],
      limits: {
        requestsPerMinute: 5000,
        tokensPerMinute: 1000000,
        tokensPerDay: 25000000,
        concurrentRequests: 50
      },
      regions: ['us-east-1', 'us-west-2', 'eu-west-1'],
      compliance: {
        dataRetention: '90 days',
        training: 'never',
        regions: ['US', 'EU'],
        certifications: ['SOC 2', 'ISO 27001', 'HIPAA']
      }
    });

    // Google Gemini 2.5 Pro
    this.providers.set('google', {
      id: 'google',
      name: 'Google AI',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      authType: 'api-key',
      models: [
        {
          id: 'gemini-2.5-pro',
          name: 'Gemini 2.5 Pro',
          endpoint: '/models/gemini-2.5-pro:generateContent',
          contextWindow: 1000000,
          outputTokens: 60000,
          multimodal: true,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 7.0,
            outputPerMToken: 21.0
          },
          capabilities: ['reasoning', 'coding', 'multimodal', 'code-execution', 'large-context']
        },
        {
          id: 'gemini-2.5-flash',
          name: 'Gemini 2.5 Flash',
          endpoint: '/models/gemini-2.5-flash:generateContent',
          contextWindow: 1000000,
          outputTokens: 8192,
          multimodal: true,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 0.35,
            outputPerMToken: 1.05
          },
          capabilities: ['fast-reasoning', 'coding', 'multimodal', 'cost-efficient']
        }
      ],
      pricing: [
        { name: 'Free Tier', monthlySpend: 0, discount: 0, features: ['15 RPM limit'] },
        { name: 'Pay-as-you-go', monthlySpend: 0, discount: 0, features: ['Standard limits'] },
        { name: 'Enterprise', monthlySpend: 2000, discount: 15, features: ['Higher limits', 'SLA'] }
      ],
      limits: {
        requestsPerMinute: 15,
        tokensPerMinute: 1000000,
        tokensPerDay: 50000000,
        concurrentRequests: 10
      },
      regions: ['global'],
      compliance: {
        dataRetention: '48 hours',
        training: 'opt-out',
        regions: ['Global'],
        certifications: ['SOC 2', 'ISO 27001']
      }
    });

    // xAI Grok 3
    this.providers.set('xai', {
      id: 'xai',
      name: 'xAI',
      baseUrl: 'https://api.x.ai/v1',
      authType: 'bearer',
      models: [
        {
          id: 'grok-3',
          name: 'Grok 3',
          endpoint: '/chat/completions',
          contextWindow: 256000,
          outputTokens: 8192,
          multimodal: false,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 10.0,
            outputPerMToken: 30.0
          },
          capabilities: ['reasoning', 'coding', 'real-time-data', 'humor', 'uncensored']
        },
        {
          id: 'grok-3-mini',
          name: 'Grok 3 Mini',
          endpoint: '/chat/completions',
          contextWindow: 128000,
          outputTokens: 4096,
          multimodal: false,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 2.0,
            outputPerMToken: 8.0
          },
          capabilities: ['fast-reasoning', 'coding', 'cost-efficient']
        }
      ],
      pricing: [
        { name: 'Developer', monthlySpend: 0, discount: 0, features: ['Standard API'] },
        { name: 'Pro', monthlySpend: 1000, discount: 10, features: ['Higher limits'] }
      ],
      limits: {
        requestsPerMinute: 1000,
        tokensPerMinute: 500000,
        tokensPerDay: 10000000,
        concurrentRequests: 20
      },
      regions: ['us-east-1'],
      compliance: {
        dataRetention: '30 days',
        training: 'opt-out',
        regions: ['US'],
        certifications: ['SOC 2']
      }
    });

    // DeepSeek R1
    this.providers.set('deepseek', {
      id: 'deepseek',
      name: 'DeepSeek',
      baseUrl: 'https://api.deepseek.com/v1',
      authType: 'bearer',
      models: [
        {
          id: 'deepseek-r1-0324',
          name: 'DeepSeek R1',
          endpoint: '/chat/completions',
          contextWindow: 256000,
          outputTokens: 8192,
          multimodal: false,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 0.27,
            outputPerMToken: 1.10
          },
          capabilities: ['coding', 'reasoning', 'mathematics', 'cost-efficient']
        },
        {
          id: 'deepseek-r1-0528',
          name: 'DeepSeek R1',
          endpoint: '/chat/completions',
          contextWindow: 256000,
          outputTokens: 8192,
          multimodal: false,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 0.27,
            outputPerMToken: 1.10
          },
          capabilities: ['reasoning-mode', 'coding', 'mathematics', 'thinking-chains']
        },
        {
          id: 'deepseek-r1-lite-16b',
          name: 'DeepSeek R1 Lite 16B',
          endpoint: '/chat/completions',
          contextWindow: 128000,
          outputTokens: 4096,
          multimodal: false,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 0.27,
            outputPerMToken: 1.10
          },
          capabilities: ['coding', 'cost-efficient', 'high-accuracy']
        }
      ],
      pricing: [
        { name: 'Pay-as-you-go', monthlySpend: 0, discount: 0, features: ['Standard API'] },
        { name: 'Volume', monthlySpend: 500, discount: 20, features: ['Volume discount'] }
      ],
      limits: {
        requestsPerMinute: 500,
        tokensPerMinute: 1000000,
        tokensPerDay: 100000000,
        concurrentRequests: 10
      },
      regions: ['global'],
      compliance: {
        dataRetention: '7 days',
        training: 'opt-out',
        regions: ['Global'],
        certifications: ['ISO 27001']
      }
    });

    // Alibaba Qwen3
    this.providers.set('qwen', {
      id: 'qwen',
      name: 'Alibaba Qwen',
      baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
      authType: 'api-key',
      models: [
        {
          id: 'qwen3-235b-a22b',
          name: 'Qwen3 235B-A22B',
          endpoint: '/services/aigc/text-generation/generation',
          contextWindow: 256000,
          outputTokens: 8192,
          multimodal: true,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 8.0,
            outputPerMToken: 24.0
          },
          capabilities: ['dual-thinking-modes', 'coding', 'reasoning', 'multimodal']
        },
        {
          id: 'qwen3-coder-14b',
          name: 'Qwen3 Coder 14B',
          endpoint: '/services/aigc/text-generation/generation',
          contextWindow: 256000,
          outputTokens: 8192,
          multimodal: false,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 2.0,
            outputPerMToken: 8.0
          },
          capabilities: ['coding', 'thinking-modes', 'analysis', 'cost-efficient']
        },
        {
          id: 'qwen3-coder-72b',
          name: 'Qwen3 Coder 72B',
          endpoint: '/services/aigc/text-generation/generation',
          contextWindow: 256000,
          outputTokens: 8192,
          multimodal: false,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 5.0,
            outputPerMToken: 15.0
          },
          capabilities: ['advanced-coding', 'thinking-modes', 'architecture', 'refactoring']
        }
      ],
      pricing: [
        { name: 'Pay-as-you-go', monthlySpend: 0, discount: 0, features: ['Standard API'] },
        { name: 'Package', monthlySpend: 200, discount: 15, features: ['Package pricing'] }
      ],
      limits: {
        requestsPerMinute: 100,
        tokensPerMinute: 500000,
        tokensPerDay: 10000000,
        concurrentRequests: 5
      },
      regions: ['cn-beijing', 'ap-southeast-1'],
      compliance: {
        dataRetention: '30 days',
        training: 'opt-in',
        regions: ['China', 'Singapore'],
        certifications: ['ISO 27001']
      }
    });

    // Meta Llama 4 (via Together AI, Replicate, etc.)
    this.providers.set('meta-llama', {
      id: 'meta-llama',
      name: 'Meta Llama',
      baseUrl: 'https://api.together.xyz/v1',
      authType: 'bearer',
      models: [
        {
          id: 'llama-4-scout-8b',
          name: 'Llama 4 Scout 8B',
          endpoint: '/chat/completions',
          contextWindow: 10000000, // 10M tokens
          outputTokens: 32768,
          multimodal: true,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 0.5,
            outputPerMToken: 2.0
          },
          capabilities: ['coding', 'multimodal', 'large-context', 'cost-efficient']
        },
        {
          id: 'llama-4-maverick-70b',
          name: 'Llama 4 Maverick 70B',
          endpoint: '/chat/completions',
          contextWindow: 256000,
          outputTokens: 8192,
          multimodal: true,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 4.0,
            outputPerMToken: 12.0
          },
          capabilities: ['advanced-reasoning', 'coding', 'multimodal', 'analysis']
        },
        {
          id: 'llama-4-behemoth-405b',
          name: 'Llama 4 Behemoth 405B',
          endpoint: '/chat/completions',
          contextWindow: 128000,
          outputTokens: 4096,
          multimodal: true,
          streamingSupported: true,
          pricing: {
            inputPerMToken: 15.0,
            outputPerMToken: 45.0
          },
          capabilities: ['expert-reasoning', 'research', 'multimodal', 'flagship']
        }
      ],
      pricing: [
        { name: 'Developer', monthlySpend: 0, discount: 0, features: ['Standard API'] },
        { name: 'Pro', monthlySpend: 500, discount: 10, features: ['Higher limits'] }
      ],
      limits: {
        requestsPerMinute: 200,
        tokensPerMinute: 1000000,
        tokensPerDay: 25000000,
        concurrentRequests: 10
      },
      regions: ['us-east-1', 'us-west-2'],
      compliance: {
        dataRetention: '7 days',
        training: 'never',
        regions: ['US'],
        certifications: ['SOC 2']
      }
    });
  }

  static getProvider(providerId: string): ProviderEndpoint | undefined {
    return this.providers.get(providerId);
  }

  static getAllProviders(): ProviderEndpoint[] {
    return Array.from(this.providers.values());
  }

  static getModelsByProvider(providerId: string): ModelEndpoint[] {
    const provider = this.providers.get(providerId);
    return provider?.models || [];
  }

  static searchModels(query: string): ModelEndpoint[] {
    const results: ModelEndpoint[] = [];
    
    for (const provider of this.providers.values()) {
      for (const model of provider.models) {
        if (model.name.toLowerCase().includes(query.toLowerCase()) ||
            model.capabilities.some(cap => cap.includes(query.toLowerCase()))) {
          results.push(model);
        }
      }
    }

    return results;
  }
}

// BYO Key Manager
export class BYOKeyManager extends EventEmitter {
  private configs: Map<string, BYOKeyConfig> = new Map();
  private usage: Map<string, UsageMetrics[]> = new Map();
  private encryptionKey: string;

  constructor(encryptionKey: string) {
    super();
    this.encryptionKey = encryptionKey;
    this.loadConfigs();
  }

  async addProvider(config: BYOKeyConfig): Promise<void> {
    // Validate API key
    await this.validateApiKey(config);
    
    // Encrypt sensitive data
    const encryptedConfig = {
      ...config,
      apiKey: encrypt(config.apiKey, this.encryptionKey)
    };

    this.configs.set(config.providerId, encryptedConfig);
    await this.saveConfigs();

    this.emit('providerAdded', config.providerId);
  }

  async updateProvider(providerId: string, updates: Partial<BYOKeyConfig>): Promise<void> {
    const existing = this.configs.get(providerId);
    if (!existing) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const updated = {
      ...existing,
      ...updates,
      apiKey: updates.apiKey ? encrypt(updates.apiKey, this.encryptionKey) : existing.apiKey
    };

    this.configs.set(providerId, updated);
    await this.saveConfigs();

    this.emit('providerUpdated', providerId);
  }

  removeProvider(providerId: string): void {
    if (!this.configs.has(providerId)) {
      throw new Error(`Provider ${providerId} not found`);
    }

    this.configs.delete(providerId);
    this.usage.delete(providerId);
    this.saveConfigs();

    this.emit('providerRemoved', providerId);
  }

  getProvider(providerId: string): BYOKeyConfig | undefined {
    const config = this.configs.get(providerId);
    if (!config) return undefined;

    // Decrypt API key for use
    return {
      ...config,
      apiKey: decrypt(config.apiKey, this.encryptionKey)
    };
  }

  getAllProviders(): BYOKeyConfig[] {
    return Array.from(this.configs.values()).map(config => ({
      ...config,
      apiKey: decrypt(config.apiKey, this.encryptionKey)
    }));
  }

  async validateApiKey(config: BYOKeyConfig): Promise<boolean> {
    const provider = ProviderRegistry.getProvider(config.providerId);
    if (!provider) {
      throw new Error(`Unknown provider: ${config.providerId}`);
    }

    try {
      // Test API key with a minimal request
      const response = await fetch(`${provider.baseUrl}/models`, {
        headers: this.buildAuthHeaders(provider, config.apiKey)
      });

      if (!response.ok) {
        throw new Error(`API key validation failed: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`API key validation failed: ${message}`);
    }
  }

  private buildAuthHeaders(provider: ProviderEndpoint, apiKey: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    switch (provider.authType) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'api-key':
        if (provider.id === 'anthropic') {
          headers['x-api-key'] = apiKey;
          headers['anthropic-version'] = '2025-07-18';
        } else if (provider.id === 'google') {
          headers['x-goog-api-key'] = apiKey;
        } else {
          headers['X-API-Key'] = apiKey;
        }
        break;
    }

    return headers;
  }

  // Usage tracking and cost analytics
  recordUsage(providerId: string, modelId: string, metrics: Partial<UsageMetrics>): void {
    const usage = this.usage.get(providerId) || [];
    
    const record: UsageMetrics = {
      providerId,
      modelId,
      period: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      requests: metrics.requests || 0,
      tokensInput: metrics.tokensInput || 0,
      tokensOutput: metrics.tokensOutput || 0,
      cost: metrics.cost || 0,
      latencyP95: metrics.latencyP95 || 0,
      errors: metrics.errors || 0
    };

    usage.push(record);
    this.usage.set(providerId, usage);

    // Check budget limits
    this.checkBudgetLimits(providerId);

    this.emit('usageRecorded', record);
  }

  private checkBudgetLimits(providerId: string): void {
    const config = this.configs.get(providerId);
    const usage = this.usage.get(providerId) || [];
    
    if (!config) return;

    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);

    const dailyCost = usage
      .filter(u => u.period === today)
      .reduce((sum, u) => sum + u.cost, 0);

    const monthlyCost = usage
      .filter(u => u.period.startsWith(thisMonth))
      .reduce((sum, u) => sum + u.cost, 0);

    // Check daily limit
    if (dailyCost >= config.budgetLimits.daily) {
      this.emit('budgetExceeded', {
        providerId,
        type: 'daily',
        limit: config.budgetLimits.daily,
        actual: dailyCost
      });
    }

    // Check monthly limit
    if (monthlyCost >= config.budgetLimits.monthly) {
      this.emit('budgetExceeded', {
        providerId,
        type: 'monthly',
        limit: config.budgetLimits.monthly,
        actual: monthlyCost
      });
    }

    // Check alert threshold
    if (monthlyCost >= config.budgetLimits.monthly * (config.budgetLimits.alertThreshold / 100)) {
      this.emit('budgetAlert', {
        providerId,
        threshold: config.budgetLimits.alertThreshold,
        limit: config.budgetLimits.monthly,
        actual: monthlyCost
      });
    }
  }

  getUsageAnalytics(providerId: string, period?: string): UsageMetrics[] {
    const usage = this.usage.get(providerId) || [];
    
    if (period) {
      return usage.filter(u => u.period.startsWith(period));
    }
    
    return usage;
  }

  getCostProjection(providerId: string): { daily: number; monthly: number; trend: string } {
    const usage = this.usage.get(providerId) || [];
    const last7Days = usage.slice(-7);
    
    if (last7Days.length === 0) {
      return { daily: 0, monthly: 0, trend: 'stable' };
    }

    const dailyAvg = last7Days.reduce((sum, u) => sum + u.cost, 0) / last7Days.length;
    const monthlyProjection = dailyAvg * 30;

    // Simple trend calculation
    const firstHalf = last7Days.slice(0, Math.floor(last7Days.length / 2));
    const secondHalf = last7Days.slice(Math.floor(last7Days.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, u) => sum + u.cost, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, u) => sum + u.cost, 0) / secondHalf.length;
    
    let trend = 'stable';
    if (secondAvg > firstAvg * 1.1) trend = 'increasing';
    else if (secondAvg < firstAvg * 0.9) trend = 'decreasing';

    return {
      daily: dailyAvg,
      monthly: monthlyProjection,
      trend
    };
  }

  // Key rotation support
  async rotateApiKey(providerId: string, newApiKey: string): Promise<void> {
    const config = this.getProvider(providerId);
    if (!config) {
      throw new Error(`Provider ${providerId} not found`);
    }

    // Validate new key
    await this.validateApiKey({ ...config, apiKey: newApiKey });

    // Update with new key
    await this.updateProvider(providerId, { apiKey: newApiKey });

    this.emit('keyRotated', providerId);
  }

  // Compliance and data governance
  setCompliancePolicy(providerId: string, policy: Partial<BYOKeyConfig['complianceSettings']>): void {
    const config = this.configs.get(providerId);
    if (!config) {
      throw new Error(`Provider ${providerId} not found`);
    }

    config.complianceSettings = {
      ...config.complianceSettings,
      ...policy
    };

    this.configs.set(providerId, config);
    this.saveConfigs();

    this.emit('compliancePolicyUpdated', providerId);
  }

  exportComplianceReport(providerId?: string): any {
    const providers = providerId ? [providerId] : Array.from(this.configs.keys());
    
    return {
      timestamp: new Date().toISOString(),
      providers: providers.map(id => {
        const config = this.configs.get(id);
        const usage = this.usage.get(id) || [];
        const provider = ProviderRegistry.getProvider(id);

        return {
          providerId: id,
          providerName: provider?.name,
          complianceSettings: config?.complianceSettings,
          dataRetention: provider?.compliance.dataRetention,
          certifications: provider?.compliance.certifications,
          usageSummary: {
            totalRequests: usage.reduce((sum, u) => sum + u.requests, 0),
            totalCost: usage.reduce((sum, u) => sum + u.cost, 0),
            period: '30 days'
          }
        };
      })
    };
  }

  private async loadConfigs(): Promise<void> {
    // Implementation would load from secure storage
    // For now, this is a placeholder
  }

  private async saveConfigs(): Promise<void> {
    // Implementation would save to secure storage
    // For now, this is a placeholder
  }
}

// Default instance for easy import
export const byoKeyManager = new BYOKeyManager(process.env.ENCRYPTION_KEY || 'default-key'); 