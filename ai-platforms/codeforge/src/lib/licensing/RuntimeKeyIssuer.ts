/**
 * Runtime License Key Issuer System
 * 
 * Issues and manages on-premises runtime licenses with GPU-based pricing:
 * - Single GPU: $5k, 10 users, all local models
 * - Multi-GPU: $15k, 50 users, all models + custom
 * - Cluster: $50k, unlimited users, full enterprise features
 * - Enterprise: Custom pricing, unlimited users, white-label
 */

import { EventEmitter } from 'events';
import { createHash, randomBytes } from 'crypto';

export enum LicenseTier {
  SINGLE_GPU = 'single_gpu',
  MULTI_GPU = 'multi_gpu',
  CLUSTER = 'cluster',
  ENTERPRISE = 'enterprise'
}

export interface LicenseConfiguration {
  tier: LicenseTier;
  name: string;
  description: string;
  pricing: number; // USD
  maxUsers: number;
  maxGPUs: number;
  allowedModels: string[];
  customModels: boolean;
  whiteLabel: boolean;
  enterpriseFeatures: string[];
  validityMonths: number;
}

export interface RuntimeLicense {
  id: string;
  organizationId: string;
  organizationName: string;
  tier: LicenseTier;
  licenseKey: string;
  signedKey: string;
  issuedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  isRevoked: boolean;
  maxUsers: number;
  maxGPUs: number;
  currentUsers: number;
  currentGPUs: number;
  allowedModels: string[];
  customModels: boolean;
  whiteLabel: boolean;
  features: string[];
  hardwareFingerprint?: string;
  lastValidation?: Date;
  usageMetrics: LicenseUsageMetrics;
}

export interface LicenseUsageMetrics {
  totalSessions: number;
  activeUsers: string[];
  gpuUtilization: GPUUsageMetric[];
  modelUsage: ModelUsageMetric[];
  featureUsage: FeatureUsageMetric[];
  dailyUsage: DailyUsageMetric[];
}

export interface GPUUsageMetric {
  gpuId: string;
  gpuModel: string;
  utilizationPercent: number;
  memoryUsedGB: number;
  memoryTotalGB: number;
  temperature: number;
  lastUpdated: Date;
}

export interface ModelUsageMetric {
  modelName: string;
  inferenceCount: number;
  totalTokens: number;
  avgLatencyMs: number;
  lastUsed: Date;
}

export interface FeatureUsageMetric {
  featureName: string;
  usageCount: number;
  lastUsed: Date;
}

export interface DailyUsageMetric {
  date: string;
  activeUsers: number;
  sessions: number;
  tokenGenerated: number;
  gpuHours: number;
}

export interface LicenseValidationResult {
  isValid: boolean;
  license?: RuntimeLicense;
  errors: string[];
  warnings: string[];
  remainingUsers: number;
  remainingGPUs: number;
  daysUntilExpiry: number;
}

export interface HardwareFingerprint {
  cpuModel: string;
  systemMemoryGB: number;
  gpus: Array<{
    model: string;
    memoryGB: number;
    uuid: string;
  }>;
  osVersion: string;
  hash: string;
}

export class RuntimeKeyIssuer extends EventEmitter {
  private static instance: RuntimeKeyIssuer;
  private licenses: Map<string, RuntimeLicense> = new Map();
  private configurations: Map<LicenseTier, LicenseConfiguration> = new Map();
  private signingKey: string;

  public static getInstance(): RuntimeKeyIssuer {
    if (!RuntimeKeyIssuer.instance) {
      RuntimeKeyIssuer.instance = new RuntimeKeyIssuer();
    }
    return RuntimeKeyIssuer.instance;
  }

  private constructor() {
    super();
    this.signingKey = process.env.LICENSE_SIGNING_KEY || this.generateSigningKey();
    this.initializeLicenseConfigurations();
    this.startUsageMonitoring();
  }

  private initializeLicenseConfigurations(): void {
    // Single GPU Tier
    this.configurations.set(LicenseTier.SINGLE_GPU, {
      tier: LicenseTier.SINGLE_GPU,
      name: 'Single GPU License',
      description: 'Entry-level on-premises deployment for small teams',
      pricing: 5000,
      maxUsers: 10,
      maxGPUs: 1,
      allowedModels: [
        'qwen3-coder-4b',
        'qwen3-coder-8b',
        'phi-4-mini',
        'deepseek-coder-1.3b',
        'starcoder2-3b'
      ],
      customModels: false,
      whiteLabel: false,
      enterpriseFeatures: ['basic-analytics', 'email-support'],
      validityMonths: 12
    });

    // Multi-GPU Tier
    this.configurations.set(LicenseTier.MULTI_GPU, {
      tier: LicenseTier.MULTI_GPU,
      name: 'Multi-GPU License',
      description: 'Mid-tier deployment for growing teams with custom model support',
      pricing: 15000,
      maxUsers: 50,
      maxGPUs: 4,
      allowedModels: [
        'qwen3-coder-4b',
        'qwen3-coder-8b',
        'qwen3-coder-14b',
        'phi-4-mini',
        'deepseek-coder-1.3b',
        'deepseek-coder-6.7b',
        'starcoder2-3b',
        'starcoder2-7b',
        'codellama-7b',
        'codellama-13b',
        'mistral-codestral-22b'
      ],
      customModels: true,
      whiteLabel: false,
      enterpriseFeatures: [
        'advanced-analytics',
        'collaboration',
        'g3d-visualization',
        'ai-swarm',
        'email-support',
        'chat-support'
      ],
      validityMonths: 12
    });

    // Cluster Tier
    this.configurations.set(LicenseTier.CLUSTER, {
      tier: LicenseTier.CLUSTER,
      name: 'Cluster License',
      description: 'High-performance cluster deployment with unlimited users',
      pricing: 50000,
      maxUsers: Infinity,
      maxGPUs: Infinity,
      allowedModels: [
        'qwen3-coder-4b',
        'qwen3-coder-8b',
        'qwen3-coder-14b',
        'qwen3-coder-32b',
        'phi-4-mini',
        'deepseek-coder-1.3b',
        'deepseek-coder-6.7b',
        'deepseek-coder-33b',
        'starcoder2-3b',
        'starcoder2-7b',
        'starcoder2-15b',
        'codellama-7b',
        'codellama-13b',
        'codellama-34b',
        'mistral-codestral-22b',
        'gemma-3-12b',
        'llama-3.3-70b'
      ],
      customModels: true,
      whiteLabel: false,
      enterpriseFeatures: [
        'full-analytics',
        'collaboration',
        'g3d-visualization',
        'ai-swarm',
        'xr-support',
        'marketplace',
        'sso-authentication',
        'audit-logs',
        'compliance-reports',
        'private-vpc',
        'email-support',
        'chat-support',
        'phone-support'
      ],
      validityMonths: 12
    });

    // Enterprise Tier
    this.configurations.set(LicenseTier.ENTERPRISE, {
      tier: LicenseTier.ENTERPRISE,
      name: 'Enterprise License',
      description: 'Custom enterprise deployment with white-label capabilities',
      pricing: 100000, // Base price, typically custom
      maxUsers: Infinity,
      maxGPUs: Infinity,
      allowedModels: [
        // All models available
        'qwen3-coder-4b',
        'qwen3-coder-8b',
        'qwen3-coder-14b',
        'qwen3-coder-32b',
        'phi-4-mini',
        'deepseek-coder-1.3b',
        'deepseek-coder-6.7b',
        'deepseek-coder-33b',
        'starcoder2-3b',
        'starcoder2-7b',
        'starcoder2-15b',
        'codellama-7b',
        'codellama-13b',
        'codellama-34b',
        'mistral-codestral-22b',
        'gemma-3-12b',
        'llama-3.3-70b'
      ],
      customModels: true,
      whiteLabel: true,
      enterpriseFeatures: [
        'full-analytics',
        'collaboration',
        'g3d-visualization',
        'ai-swarm',
        'xr-support',
        'marketplace',
        'sso-authentication',
        'audit-logs',
        'compliance-reports',
        'private-vpc',
        'white-label',
        'dedicated-support',
        'email-support',
        'chat-support',
        'phone-support',
        'custom-integrations',
        'priority-updates'
      ],
      validityMonths: 12
    });
  }

  /**
   * Issue a new runtime license
   */
  public async issueLicense(
    organizationId: string,
    organizationName: string,
    tier: LicenseTier,
    validityMonths?: number,
    hardwareFingerprint?: HardwareFingerprint
  ): Promise<RuntimeLicense> {
    const config = this.configurations.get(tier);
    if (!config) {
      throw new Error(`Invalid license tier: ${tier}`);
    }

    const licenseId = this.generateLicenseId();
    const licenseKey = this.generateLicenseKey(organizationId, tier);
    const signedKey = this.signLicenseKey(licenseKey);

    const issuedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + (validityMonths || config.validityMonths));

    const license: RuntimeLicense = {
      id: licenseId,
      organizationId,
      organizationName,
      tier,
      licenseKey,
      signedKey,
      issuedAt,
      expiresAt,
      isActive: true,
      isRevoked: false,
      maxUsers: config.maxUsers,
      maxGPUs: config.maxGPUs,
      currentUsers: 0,
      currentGPUs: 0,
      allowedModels: [...config.allowedModels],
      customModels: config.customModels,
      whiteLabel: config.whiteLabel,
      features: [...config.enterpriseFeatures],
      ...(hardwareFingerprint?.hash && { hardwareFingerprint: hardwareFingerprint.hash }),
      usageMetrics: {
        totalSessions: 0,
        activeUsers: [],
        gpuUtilization: [],
        modelUsage: [],
        featureUsage: [],
        dailyUsage: []
      }
    };

    this.licenses.set(licenseId, license);
    
    this.emit('licenseIssued', {
      license,
      config,
      timestamp: new Date()
    });

    return license;
  }

  /**
   * Validate a runtime license
   */
  public async validateLicense(
    licenseKey: string,
    currentUsers: number = 0,
    currentGPUs: number = 0,
    hardwareFingerprint?: HardwareFingerprint
  ): Promise<LicenseValidationResult> {
    const result: LicenseValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      remainingUsers: 0,
      remainingGPUs: 0,
      daysUntilExpiry: 0
    };

    // Find license by key
    const license = Array.from(this.licenses.values())
      .find(l => l.licenseKey === licenseKey);

    if (!license) {
      result.errors.push('Invalid license key');
      return result;
    }

    // Verify signature
    const expectedSignature = this.signLicenseKey(licenseKey);
    if (expectedSignature !== license.signedKey) {
      result.errors.push('License signature verification failed');
      return result;
    }

    // Check if license is active
    if (!license.isActive) {
      result.errors.push('License is not active');
      return result;
    }

    // Check if license is revoked
    if (license.isRevoked) {
      result.errors.push('License has been revoked');
      return result;
    }

    // Check expiry
    const now = new Date();
    const daysUntilExpiry = Math.ceil((license.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (now > license.expiresAt) {
      result.errors.push('License has expired');
      return result;
    }

    // Warning for expiry within 30 days
    if (daysUntilExpiry <= 30) {
      result.warnings.push(`License expires in ${daysUntilExpiry} days`);
    }

    // Check user limits
    if (license.maxUsers !== Infinity && currentUsers > license.maxUsers) {
      result.errors.push(`User limit exceeded: ${currentUsers}/${license.maxUsers}`);
      return result;
    }

    // Check GPU limits
    if (license.maxGPUs !== Infinity && currentGPUs > license.maxGPUs) {
      result.errors.push(`GPU limit exceeded: ${currentGPUs}/${license.maxGPUs}`);
      return result;
    }

    // Check hardware fingerprint (if required)
    if (license.hardwareFingerprint && hardwareFingerprint) {
      if (license.hardwareFingerprint !== hardwareFingerprint.hash) {
        result.errors.push('Hardware fingerprint mismatch');
        return result;
      }
    }

    // Update license usage
    license.currentUsers = currentUsers;
    license.currentGPUs = currentGPUs;
    license.lastValidation = now;

    result.isValid = true;
    result.license = license;
    result.remainingUsers = license.maxUsers === Infinity ? Infinity : license.maxUsers - currentUsers;
    result.remainingGPUs = license.maxGPUs === Infinity ? Infinity : license.maxGPUs - currentGPUs;
    result.daysUntilExpiry = daysUntilExpiry;

    this.emit('licenseValidated', {
      license,
      currentUsers,
      currentGPUs,
      hardwareFingerprint,
      timestamp: now
    });

    return result;
  }

  /**
   * Revoke a license
   */
  public async revokeLicense(licenseId: string, reason?: string): Promise<void> {
    const license = this.licenses.get(licenseId);
    if (!license) {
      throw new Error(`License ${licenseId} not found`);
    }

    license.isRevoked = true;
    license.isActive = false;

    this.emit('licenseRevoked', {
      license,
      reason,
      timestamp: new Date()
    });
  }

  /**
   * Update license usage metrics
   */
  public async updateUsageMetrics(
    licenseKey: string,
    gpuMetrics: GPUUsageMetric[],
    modelMetrics: ModelUsageMetric[],
    featureMetrics: FeatureUsageMetric[],
    activeUsers: string[]
  ): Promise<void> {
    const license = Array.from(this.licenses.values())
      .find(l => l.licenseKey === licenseKey);

    if (!license) {
      throw new Error('License not found');
    }

    // Update GPU utilization
    license.usageMetrics.gpuUtilization = gpuMetrics;

    // Update model usage
    modelMetrics.forEach(newMetric => {
      const existingIndex = license.usageMetrics.modelUsage
        .findIndex(m => m.modelName === newMetric.modelName);
      
      if (existingIndex >= 0) {
        // Update existing metric
        const existing = license.usageMetrics.modelUsage[existingIndex];
        existing.inferenceCount += newMetric.inferenceCount;
        existing.totalTokens += newMetric.totalTokens;
        existing.avgLatencyMs = (existing.avgLatencyMs + newMetric.avgLatencyMs) / 2;
        existing.lastUsed = newMetric.lastUsed;
      } else {
        // Add new metric
        license.usageMetrics.modelUsage.push(newMetric);
      }
    });

    // Update feature usage
    featureMetrics.forEach(newMetric => {
      const existingIndex = license.usageMetrics.featureUsage
        .findIndex(f => f.featureName === newMetric.featureName);
      
      if (existingIndex >= 0) {
        license.usageMetrics.featureUsage[existingIndex].usageCount += newMetric.usageCount;
        license.usageMetrics.featureUsage[existingIndex].lastUsed = newMetric.lastUsed;
      } else {
        license.usageMetrics.featureUsage.push(newMetric);
      }
    });

    // Update active users
    license.usageMetrics.activeUsers = activeUsers;
    license.currentUsers = activeUsers.length;

    // Update daily usage
    const today = new Date().toISOString().split('T')[0];
    const dailyMetricIndex = license.usageMetrics.dailyUsage
      .findIndex(d => d.date === today);

    const tokenGenerated = modelMetrics.reduce((sum, m) => sum + m.totalTokens, 0);
    const gpuHours = gpuMetrics.reduce((sum, g) => sum + (g.utilizationPercent / 100), 0);

    if (dailyMetricIndex >= 0) {
      const daily = license.usageMetrics.dailyUsage[dailyMetricIndex];
      daily.activeUsers = Math.max(daily.activeUsers, activeUsers.length);
      daily.sessions += 1;
      daily.tokenGenerated += tokenGenerated;
      daily.gpuHours += gpuHours;
    } else {
      license.usageMetrics.dailyUsage.push({
        date: today,
        activeUsers: activeUsers.length,
        sessions: 1,
        tokenGenerated,
        gpuHours
      });
    }

    this.emit('usageMetricsUpdated', {
      license,
      gpuMetrics,
      modelMetrics,
      featureMetrics,
      activeUsers,
      timestamp: new Date()
    });
  }

  /**
   * Get license configuration
   */
  public getLicenseConfiguration(tier: LicenseTier): LicenseConfiguration | undefined {
    return this.configurations.get(tier);
  }

  /**
   * Get all license configurations
   */
  public getAllLicenseConfigurations(): LicenseConfiguration[] {
    return Array.from(this.configurations.values());
  }

  /**
   * Get license by ID
   */
  public getLicense(licenseId: string): RuntimeLicense | undefined {
    return this.licenses.get(licenseId);
  }

  /**
   * Get licenses by organization
   */
  public getLicensesByOrganization(organizationId: string): RuntimeLicense[] {
    return Array.from(this.licenses.values())
      .filter(license => license.organizationId === organizationId);
  }

  /**
   * Generate hardware fingerprint
   */
  public generateHardwareFingerprint(
    cpuModel: string,
    systemMemoryGB: number,
    gpus: Array<{ model: string; memoryGB: number; uuid: string }>,
    osVersion: string
  ): HardwareFingerprint {
    const fingerprint: HardwareFingerprint = {
      cpuModel,
      systemMemoryGB,
      gpus: gpus.sort((a, b) => a.uuid.localeCompare(b.uuid)), // Sort for consistency
      osVersion,
      hash: ''
    };

    // Generate hash
    const data = JSON.stringify({
      cpu: fingerprint.cpuModel,
      memory: fingerprint.systemMemoryGB,
      gpus: fingerprint.gpus,
      os: fingerprint.osVersion
    });

    fingerprint.hash = createHash('sha256').update(data).digest('hex');
    return fingerprint;
  }

  private generateLicenseId(): string {
    return `LIC-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  private generateLicenseKey(organizationId: string, tier: LicenseTier): string {
    const timestamp = Date.now().toString(36);
    const orgHash = createHash('md5').update(organizationId).digest('hex').substr(0, 8);
    const tierCode = tier.toUpperCase().substr(0, 4);
    const random = randomBytes(4).toString('hex');
    
    return `CFG-${tierCode}-${orgHash}-${timestamp}-${random}`.toUpperCase();
  }

  private signLicenseKey(licenseKey: string): string {
    return createHash('sha256')
      .update(licenseKey + this.signingKey)
      .digest('hex');
  }

  private generateSigningKey(): string {
    return randomBytes(32).toString('hex');
  }

  private startUsageMonitoring(): void {
    // Clean up old daily usage data (keep last 90 days)
    setInterval(() => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      const cutoffString = cutoffDate.toISOString().split('T')[0];

      for (const license of this.licenses.values()) {
        license.usageMetrics.dailyUsage = license.usageMetrics.dailyUsage
          .filter(daily => daily.date >= cutoffString);
      }
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }
}

export default RuntimeKeyIssuer; 