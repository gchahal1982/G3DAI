/**
 * License Validation System
 * 
 * Client-side license validation and enforcement system:
 * - Real-time license verification
 * - GPU usage tracking and enforcement
 * - License expiration monitoring
 * - Audit logging for compliance
 * - Automated renewal notifications
 */

import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import {
  RuntimeLicense,
  LicenseValidationResult,
  HardwareFingerprint,
  GPUUsageMetric,
  ModelUsageMetric,
  FeatureUsageMetric,
  LicenseTier
} from './RuntimeKeyIssuer';

export interface ValidationConfig {
  enableOfflineGrace: boolean;
  offlineGracePeriodHours: number;
  validationIntervalMinutes: number;
  enableStrictHardwareValidation: boolean;
  enableUsageTracking: boolean;
  enableAuditLogging: boolean;
  maxRetryAttempts: number;
}

export interface LicenseStatus {
  isValid: boolean;
  isExpired: boolean;
  isRevoked: boolean;
  daysUntilExpiry: number;
  currentUsers: number;
  currentGPUs: number;
  remainingUsers: number;
  remainingGPUs: number;
  lastValidation: Date;
  nextValidation: Date;
  offlineMode: boolean;
  errors: string[];
  warnings: string[];
}

export interface UsageSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  gpusUsed: string[];
  modelsUsed: string[];
  featuresUsed: string[];
  isActive: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  event: string;
  userId?: string;
  sessionId?: string;
  details: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface LicenseCache {
  license: RuntimeLicense;
  lastValidation: Date;
  validationCount: number;
  isOfflineValid: boolean;
  offlineValidUntil: Date;
}

export interface GPUMonitoringData {
  gpuId: string;
  inUse: boolean;
  currentUser?: string;
  currentSession?: string;
  utilizationPercent: number;
  memoryUsedGB: number;
  temperature: number;
  lastUpdated: Date;
}

export class LicenseValidator extends EventEmitter {
  private static instance: LicenseValidator;
  private config: ValidationConfig;
  private licenseCache?: LicenseCache;
  private activeSessions: Map<string, UsageSession> = new Map();
  private gpuMonitoring: Map<string, GPUMonitoringData> = new Map();
  private auditLog: AuditLogEntry[] = [];
  private validationTimer?: NodeJS.Timeout;
  private hardwareFingerprint?: HardwareFingerprint;

  public static getInstance(): LicenseValidator {
    if (!LicenseValidator.instance) {
      LicenseValidator.instance = new LicenseValidator();
    }
    return LicenseValidator.instance;
  }

  private constructor() {
    super();
    this.config = this.getDefaultConfig();
    this.initializeHardwareFingerprinting();
    this.startPeriodicValidation();
  }

  private getDefaultConfig(): ValidationConfig {
    return {
      enableOfflineGrace: true,
      offlineGracePeriodHours: 72, // 3 days
      validationIntervalMinutes: 60, // Every hour
      enableStrictHardwareValidation: true,
      enableUsageTracking: true,
      enableAuditLogging: true,
      maxRetryAttempts: 3
    };
  }

  /**
   * Initialize license with validation
   */
  public async initializeLicense(licenseKey: string): Promise<LicenseStatus> {
    try {
      this.auditLog.push({
        id: this.generateId(),
        timestamp: new Date(),
        event: 'license_initialization_started',
        details: { licenseKey: licenseKey.substr(0, 8) + '...' },
        severity: 'info'
      });

      // Validate license with server
      const validationResult = await this.validateWithServer(licenseKey);
      
      if (!validationResult.isValid) {
        this.auditLog.push({
          id: this.generateId(),
          timestamp: new Date(),
          event: 'license_initialization_failed',
          details: { errors: validationResult.errors },
          severity: 'error'
        });
        
        throw new Error(`License initialization failed: ${validationResult.errors.join(', ')}`);
      }

      // Cache license for offline validation
      this.licenseCache = {
        license: validationResult.license!,
        lastValidation: new Date(),
        validationCount: 1,
        isOfflineValid: true,
        offlineValidUntil: new Date(Date.now() + (this.config.offlineGracePeriodHours * 60 * 60 * 1000))
      };

      const status = this.generateLicenseStatus();

      this.auditLog.push({
        id: this.generateId(),
        timestamp: new Date(),
        event: 'license_initialized',
        details: {
          tier: this.licenseCache.license.tier,
          maxUsers: this.licenseCache.license.maxUsers,
          maxGPUs: this.licenseCache.license.maxGPUs,
          expiresAt: this.licenseCache.license.expiresAt
        },
        severity: 'info'
      });

      this.emit('licenseInitialized', status);
      return status;

    } catch (error) {
      this.auditLog.push({
        id: this.generateId(),
        timestamp: new Date(),
        event: 'license_initialization_error',
        details: { error: error instanceof Error ? error.message : String(error) },
        severity: 'critical'
      });
      
      throw error;
    }
  }

  /**
   * Start a user session
   */
  public async startSession(
    userId: string,
    requestedGPUs: string[] = [],
    requestedFeatures: string[] = []
  ): Promise<{ sessionId: string; allowedGPUs: string[]; allowedFeatures: string[] }> {
    if (!this.licenseCache) {
      throw new Error('License not initialized');
    }

    const status = this.getCurrentStatus();
    if (!status.isValid) {
      throw new Error(`Cannot start session: ${status.errors.join(', ')}`);
    }

    // Check user limits
    const activeUserSessions = Array.from(this.activeSessions.values())
      .filter(session => session.isActive);
    const activeUsers = new Set(activeUserSessions.map(s => s.userId));

    if (this.licenseCache.license.maxUsers !== Infinity && 
        activeUsers.size >= this.licenseCache.license.maxUsers && 
        !activeUsers.has(userId)) {
      throw new Error(`User limit exceeded: ${activeUsers.size}/${this.licenseCache.license.maxUsers}`);
    }

    // Check GPU limits and availability
    const availableGPUs = this.getAvailableGPUs();
    const allowedGPUs = requestedGPUs.filter(gpuId => 
      availableGPUs.includes(gpuId) &&
      this.licenseCache!.license.maxGPUs === Infinity ||
      Array.from(this.gpuMonitoring.values()).filter(gpu => gpu.inUse).length < this.licenseCache!.license.maxGPUs
    );

    // Validate features against license
    const allowedFeatures = requestedFeatures.filter(feature =>
      this.licenseCache!.license.features.includes(feature)
    );

    const sessionId = this.generateSessionId();
    const session: UsageSession = {
      sessionId,
      userId,
      startTime: new Date(),
      gpusUsed: allowedGPUs,
      modelsUsed: [],
      featuresUsed: allowedFeatures,
      isActive: true
    };

    this.activeSessions.set(sessionId, session);

    // Mark GPUs as in use
    allowedGPUs.forEach(gpuId => {
      const gpu = this.gpuMonitoring.get(gpuId);
      if (gpu) {
        gpu.inUse = true;
        gpu.currentUser = userId;
        gpu.currentSession = sessionId;
      }
    });

    this.auditLog.push({
      id: this.generateId(),
      timestamp: new Date(),
      event: 'session_started',
      userId,
      sessionId,
      details: {
        requestedGPUs,
        allowedGPUs,
        requestedFeatures,
        allowedFeatures
      },
      severity: 'info'
    });

    this.emit('sessionStarted', { sessionId, userId, allowedGPUs, allowedFeatures });

    return { sessionId, allowedGPUs, allowedFeatures };
  }

  /**
   * End a user session
   */
  public async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.endTime = new Date();
    session.isActive = false;

    // Free up GPUs
    session.gpusUsed.forEach(gpuId => {
      const gpu = this.gpuMonitoring.get(gpuId);
      if (gpu && gpu.currentSession === sessionId) {
        gpu.inUse = false;
        delete gpu.currentUser;
        delete gpu.currentSession;
      }
    });

    this.auditLog.push({
      id: this.generateId(),
      timestamp: new Date(),
      event: 'session_ended',
      userId: session.userId,
      sessionId,
      details: {
        duration: session.endTime.getTime() - session.startTime.getTime(),
        gpusUsed: session.gpusUsed,
        modelsUsed: session.modelsUsed,
        featuresUsed: session.featuresUsed
      },
      severity: 'info'
    });

    this.emit('sessionEnded', { sessionId, userId: session.userId });
  }

  /**
   * Track model usage in a session
   */
  public async trackModelUsage(
    sessionId: string,
    modelName: string,
    tokensGenerated: number,
    latencyMs: number
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.isActive) {
      throw new Error(`Invalid or inactive session: ${sessionId}`);
    }

    // Check if model is allowed by license
    if (!this.licenseCache?.license.allowedModels.includes(modelName) &&
        !this.licenseCache?.license.customModels) {
      throw new Error(`Model ${modelName} not allowed by license`);
    }

    if (!session.modelsUsed.includes(modelName)) {
      session.modelsUsed.push(modelName);
    }

    this.auditLog.push({
      id: this.generateId(),
      timestamp: new Date(),
      event: 'model_usage_tracked',
      userId: session.userId,
      sessionId,
      details: {
        modelName,
        tokensGenerated,
        latencyMs
      },
      severity: 'info'
    });

    this.emit('modelUsageTracked', {
      sessionId,
      userId: session.userId,
      modelName,
      tokensGenerated,
      latencyMs
    });
  }

  /**
   * Update GPU monitoring data
   */
  public async updateGPUMetrics(gpuMetrics: GPUUsageMetric[]): Promise<void> {
    gpuMetrics.forEach(metric => {
      const existing = this.gpuMonitoring.get(metric.gpuId) || {
        gpuId: metric.gpuId,
        inUse: false,
        utilizationPercent: 0,
        memoryUsedGB: 0,
        temperature: 0,
        lastUpdated: new Date()
      };

      existing.utilizationPercent = metric.utilizationPercent;
      existing.memoryUsedGB = metric.memoryUsedGB;
      existing.temperature = metric.temperature;
      existing.lastUpdated = metric.lastUpdated;

      this.gpuMonitoring.set(metric.gpuId, existing);
    });

    this.emit('gpuMetricsUpdated', gpuMetrics);
  }

  /**
   * Get current license status
   */
  public getCurrentStatus(): LicenseStatus {
    return this.generateLicenseStatus();
  }

  /**
   * Get active sessions
   */
  public getActiveSessions(): UsageSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.isActive);
  }

  /**
   * Get GPU monitoring status
   */
  public getGPUStatus(): GPUMonitoringData[] {
    return Array.from(this.gpuMonitoring.values());
  }

  /**
   * Get audit log
   */
  public getAuditLog(
    startDate?: Date,
    endDate?: Date,
    severity?: 'info' | 'warning' | 'error' | 'critical'
  ): AuditLogEntry[] {
    let filtered = this.auditLog;

    if (startDate) {
      filtered = filtered.filter(entry => entry.timestamp >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(entry => entry.timestamp <= endDate);
    }

    if (severity) {
      filtered = filtered.filter(entry => entry.severity === severity);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Force license revalidation
   */
  public async revalidateLicense(): Promise<LicenseStatus> {
    if (!this.licenseCache) {
      throw new Error('License not initialized');
    }

    try {
      const validationResult = await this.validateWithServer(this.licenseCache.license.licenseKey);
      
      if (validationResult.isValid) {
        this.licenseCache.license = validationResult.license!;
        this.licenseCache.lastValidation = new Date();
        this.licenseCache.validationCount++;
        this.licenseCache.isOfflineValid = true;
        this.licenseCache.offlineValidUntil = new Date(Date.now() + (this.config.offlineGracePeriodHours * 60 * 60 * 1000));

        this.auditLog.push({
          id: this.generateId(),
          timestamp: new Date(),
          event: 'license_revalidated',
          details: { validationCount: this.licenseCache.validationCount },
          severity: 'info'
        });
      } else {
        this.auditLog.push({
          id: this.generateId(),
          timestamp: new Date(),
          event: 'license_revalidation_failed',
          details: { errors: validationResult.errors },
          severity: 'error'
        });
      }

      const status = this.generateLicenseStatus();
      this.emit('licenseRevalidated', status);
      return status;

    } catch (error) {
      this.auditLog.push({
        id: this.generateId(),
        timestamp: new Date(),
        event: 'license_revalidation_error',
        details: { error: error instanceof Error ? error.message : String(error) },
        severity: 'error'
      });

      // Return current status on error
      return this.generateLicenseStatus();
    }
  }

  private async validateWithServer(
    licenseKey: string,
    currentUsers?: number,
    currentGPUs?: number
  ): Promise<LicenseValidationResult> {
    // This would normally make an HTTP request to the license server
    // For now, we'll simulate server validation
    
    const activeUsers = Array.from(this.activeSessions.values())
      .filter(s => s.isActive)
      .reduce((users, session) => users.add(session.userId), new Set()).size;
    
    const activeGPUs = Array.from(this.gpuMonitoring.values())
      .filter(gpu => gpu.inUse).length;

    // Simulate API call to RuntimeKeyIssuer.validateLicense()
    return {
      isValid: true, // This would come from server
      errors: [],
      warnings: [],
      remainingUsers: Math.max(0, (currentUsers || 0) - activeUsers),
      remainingGPUs: Math.max(0, (currentGPUs || 0) - activeGPUs),
      daysUntilExpiry: 30 // This would come from server
    };
  }

  private generateLicenseStatus(): LicenseStatus {
    if (!this.licenseCache) {
      return {
        isValid: false,
        isExpired: false,
        isRevoked: false,
        daysUntilExpiry: 0,
        currentUsers: 0,
        currentGPUs: 0,
        remainingUsers: 0,
        remainingGPUs: 0,
        lastValidation: new Date(),
        nextValidation: new Date(),
        offlineMode: false,
        errors: ['License not initialized'],
        warnings: []
      };
    }

    const now = new Date();
    const isExpired = now > this.licenseCache.license.expiresAt;
    const isRevoked = this.licenseCache.license.isRevoked;
    const daysUntilExpiry = Math.ceil(
      (this.licenseCache.license.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const activeUsers = Array.from(this.activeSessions.values())
      .filter(s => s.isActive)
      .reduce((users, session) => users.add(session.userId), new Set()).size;
    
    const activeGPUs = Array.from(this.gpuMonitoring.values())
      .filter(gpu => gpu.inUse).length;

    const remainingUsers = this.licenseCache.license.maxUsers === Infinity 
      ? Infinity 
      : Math.max(0, this.licenseCache.license.maxUsers - activeUsers);
    
    const remainingGPUs = this.licenseCache.license.maxGPUs === Infinity 
      ? Infinity 
      : Math.max(0, this.licenseCache.license.maxGPUs - activeGPUs);

    const errors: string[] = [];
    const warnings: string[] = [];

    if (isExpired) {
      errors.push('License has expired');
    }

    if (isRevoked) {
      errors.push('License has been revoked');
    }

    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      warnings.push(`License expires in ${daysUntilExpiry} days`);
    }

    const isOfflineMode = now > this.licenseCache.offlineValidUntil;
    const isValid = !isExpired && !isRevoked && 
      (this.licenseCache.isOfflineValid || !isOfflineMode);

    const nextValidation = new Date(
      this.licenseCache.lastValidation.getTime() + 
      (this.config.validationIntervalMinutes * 60 * 1000)
    );

    return {
      isValid,
      isExpired,
      isRevoked,
      daysUntilExpiry: Math.max(0, daysUntilExpiry),
      currentUsers: activeUsers,
      currentGPUs: activeGPUs,
      remainingUsers,
      remainingGPUs,
      lastValidation: this.licenseCache.lastValidation,
      nextValidation,
      offlineMode: isOfflineMode,
      errors,
      warnings
    };
  }

  private getAvailableGPUs(): string[] {
    return Array.from(this.gpuMonitoring.keys())
      .filter(gpuId => {
        const gpu = this.gpuMonitoring.get(gpuId);
        return gpu && !gpu.inUse;
      });
  }

  private startPeriodicValidation(): void {
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
    }

    this.validationTimer = setInterval(async () => {
      if (this.licenseCache) {
        await this.revalidateLicense();
      }
    }, this.config.validationIntervalMinutes * 60 * 1000);
  }

  private async initializeHardwareFingerprinting(): Promise<void> {
    try {
      // In a real implementation, this would detect actual hardware
      this.hardwareFingerprint = {
        cpuModel: 'Mock CPU Model',
        systemMemoryGB: 32,
        gpus: [
          { model: 'Mock GPU 1', memoryGB: 24, uuid: 'gpu-001' },
          { model: 'Mock GPU 2', memoryGB: 24, uuid: 'gpu-002' }
        ],
        osVersion: 'Mock OS 1.0',
        hash: createHash('sha256').update('mock-hardware').digest('hex')
      };

      // Initialize GPU monitoring
      this.hardwareFingerprint.gpus.forEach(gpu => {
        this.gpuMonitoring.set(gpu.uuid, {
          gpuId: gpu.uuid,
          inUse: false,
          utilizationPercent: 0,
          memoryUsedGB: 0,
          temperature: 65,
          lastUpdated: new Date()
        });
      });

    } catch (error) {
      this.auditLog.push({
        id: this.generateId(),
        timestamp: new Date(),
        event: 'hardware_fingerprinting_failed',
        details: { error: error instanceof Error ? error.message : String(error) },
        severity: 'warning'
      });
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `SES-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`.toUpperCase();
  }

  public destroy(): void {
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
    }
    
    // End all active sessions
    Array.from(this.activeSessions.keys()).forEach(sessionId => {
      this.endSession(sessionId);
    });

    this.auditLog.push({
      id: this.generateId(),
      timestamp: new Date(),
      event: 'license_validator_destroyed',
      details: {},
      severity: 'info'
    });
  }
}

export default LicenseValidator; 