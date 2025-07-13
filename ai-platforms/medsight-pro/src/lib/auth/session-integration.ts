/**
 * Enhanced Session Integration Library
 * Connects session management components to backend session-management.ts
 * Provides medical-specific session features and compliance monitoring
 */

import { EventEmitter } from 'events';

// Session Management Interfaces
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  license: string;
  department: string;
  organization: string;
  permissions: string[];
  mfaEnabled: boolean;
  mfaVerified: boolean;
  lastLogin: string;
  loginCount: number;
  failedLoginAttempts: number;
  accountLocked: boolean;
  licenseExpiry: string;
  certifications: string[];
  specializations: string[];
}

export interface SessionConfig {
  timeout: number; // milliseconds
  warningTime: number; // milliseconds
  maxSessions: number;
  maxExtensions: number;
  extensionDuration: number; // milliseconds
  emergencyTimeout: number; // milliseconds
  mfaRequired: boolean;
  mfaTimeout: number; // milliseconds
  deviceRegistration: boolean;
  locationTracking: boolean;
  auditLogging: boolean;
  encryptionRequired: boolean;
  ipWhitelisting: boolean;
  concurrentSessionLimit: number;
  emergencyOverrideEnabled: boolean;
  supervisorApprovalRequired: boolean;
  complianceMode: 'strict' | 'standard' | 'emergency';
}

export interface SessionData {
  id: string;
  userId: string;
  user: SessionUser;
  startTime: Date;
  lastActivity: Date;
  expiryTime: Date;
  status: 'active' | 'idle' | 'warning' | 'expired' | 'terminated' | 'emergency_override';
  deviceInfo: {
    id: string;
    type: 'desktop' | 'tablet' | 'mobile';
    name: string;
    browser: string;
    os: string;
    userAgent: string;
    trusted: boolean;
  };
  locationInfo: {
    ipAddress: string;
    country: string;
    city: string;
    timezone: string;
    isp: string;
    suspicious: boolean;
  };
  securityInfo: {
    mfaVerified: boolean;
    encryptionLevel: string;
    securityScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    threats: string[];
  };
  medicalInfo: {
    currentActivity: string;
    currentPage: string;
    studiesAccessed: string[];
    patientsAccessed: string[];
    imagesViewed: number;
    reportsGenerated: number;
    dataModified: boolean;
    emergencyAccess: boolean;
    supervisorOverride: boolean;
    complianceViolations: string[];
  };
  metrics: {
    bytesTransferred: number;
    requestsCount: number;
    errorsCount: number;
    averageResponseTime: number;
    cpuUsage: number;
    memoryUsage: number;
    networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  extensions: {
    count: number;
    maxAllowed: number;
    lastExtension: Date | null;
    extensionReasons: string[];
  };
}

export interface SessionEvent {
  id: string;
  type: 'login' | 'logout' | 'timeout' | 'extension' | 'warning' | 'violation' | 'emergency_override';
  sessionId: string;
  userId: string;
  timestamp: Date;
  data: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  action: string;
  resolved: boolean;
}

export interface SessionViolation {
  id: string;
  type: 'max_sessions' | 'concurrent_location' | 'device_limit' | 'suspicious_activity' | 'compliance_breach';
  sessionId: string;
  userId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  action: string;
  evidence: any;
}

export interface SessionAlert {
  id: string;
  type: 'security' | 'compliance' | 'timeout' | 'violation' | 'emergency';
  sessionId: string;
  userId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  recipients: string[];
  actions: string[];
}

// Session Integration Class
export class SessionIntegration extends EventEmitter {
  private config: SessionConfig;
  private sessions: Map<string, SessionData> = new Map();
  private events: SessionEvent[] = [];
  private violations: SessionViolation[] = [];
  private alerts: SessionAlert[] = [];
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private warningTimers: Map<string, NodeJS.Timeout> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: SessionConfig) {
    super();
    this.config = config;
    this.startMonitoring();
  }

  // Session Management
  async createSession(user: SessionUser, deviceInfo: any, locationInfo: any): Promise<SessionData> {
    const sessionId = this.generateSessionId();
    
    // Check concurrent session limits
    const userSessions = this.getUserSessions(user.id);
    if (userSessions.length >= this.config.maxSessions) {
      throw new Error(`Maximum concurrent sessions exceeded for user ${user.name}`);
    }

    // Check for suspicious activity
    const suspiciousActivity = await this.checkSuspiciousActivity(user.id, locationInfo);
    if (suspiciousActivity && this.config.complianceMode === 'strict') {
      throw new Error('Suspicious activity detected - session creation blocked');
    }

    const session: SessionData = {
      id: sessionId,
      userId: user.id,
      user,
      startTime: new Date(),
      lastActivity: new Date(),
      expiryTime: new Date(Date.now() + this.config.timeout),
      status: 'active',
      deviceInfo: {
        ...deviceInfo,
        trusted: await this.isDeviceTrusted(deviceInfo.id, user.id)
      },
      locationInfo: {
        ...locationInfo,
        suspicious: suspiciousActivity
      },
      securityInfo: {
        mfaVerified: user.mfaVerified,
        encryptionLevel: 'AES-256',
        securityScore: this.calculateSecurityScore(user, deviceInfo, locationInfo),
        riskLevel: this.calculateRiskLevel(user, deviceInfo, locationInfo),
        threats: []
      },
      medicalInfo: {
        currentActivity: 'Login',
        currentPage: '/dashboard',
        studiesAccessed: [],
        patientsAccessed: [],
        imagesViewed: 0,
        reportsGenerated: 0,
        dataModified: false,
        emergencyAccess: false,
        supervisorOverride: false,
        complianceViolations: []
      },
      metrics: {
        bytesTransferred: 0,
        requestsCount: 0,
        errorsCount: 0,
        averageResponseTime: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        networkQuality: 'excellent'
      },
      extensions: {
        count: 0,
        maxAllowed: this.config.maxExtensions,
        lastExtension: null,
        extensionReasons: []
      }
    };

    this.sessions.set(sessionId, session);
    this.startSessionTimer(sessionId);
    this.startSessionWarningTimer(sessionId);
    
    // Log session creation event
    await this.logEvent({
      id: this.generateEventId(),
      type: 'login',
      sessionId,
      userId: user.id,
      timestamp: new Date(),
      data: { deviceInfo, locationInfo },
      severity: 'low',
      message: `User ${user.name} logged in from ${locationInfo.city}`,
      action: 'session_created',
      resolved: true
    });

    this.emit('session_created', session);
    return session;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    return this.sessions.get(sessionId) || null;
  }

  async updateSessionActivity(sessionId: string, activity: string, page: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.lastActivity = new Date();
    session.medicalInfo.currentActivity = activity;
    session.medicalInfo.currentPage = page;
    
    // Reset session timer
    this.resetSessionTimer(sessionId);
    
    // Update metrics
    session.metrics.requestsCount++;
    
    this.sessions.set(sessionId, session);
    this.emit('session_updated', session);
  }

  async extendSession(sessionId: string, duration: number = this.config.extensionDuration, reason: string = 'User request'): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.extensions.count >= session.extensions.maxAllowed) {
      throw new Error('Maximum session extensions exceeded');
    }

    session.expiryTime = new Date(session.expiryTime.getTime() + duration);
    session.extensions.count++;
    session.extensions.lastExtension = new Date();
    session.extensions.extensionReasons.push(reason);

    this.sessions.set(sessionId, session);
    this.resetSessionTimer(sessionId);

    await this.logEvent({
      id: this.generateEventId(),
      type: 'extension',
      sessionId,
      userId: session.userId,
      timestamp: new Date(),
      data: { duration, reason },
      severity: 'medium',
      message: `Session extended by ${duration / 60000} minutes: ${reason}`,
      action: 'session_extended',
      resolved: true
    });

    this.emit('session_extended', session);
  }

  async terminateSession(sessionId: string, reason: string = 'User logout'): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = 'terminated';
    this.clearSessionTimers(sessionId);
    
    await this.logEvent({
      id: this.generateEventId(),
      type: 'logout',
      sessionId,
      userId: session.userId,
      timestamp: new Date(),
      data: { reason },
      severity: 'low',
      message: `Session terminated: ${reason}`,
      action: 'session_terminated',
      resolved: true
    });

    this.sessions.delete(sessionId);
    this.emit('session_terminated', session);
  }

  async emergencyOverride(sessionId: string, reason: string, approverId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    if (!this.config.emergencyOverrideEnabled) {
      throw new Error('Emergency override is disabled');
    }

    session.status = 'emergency_override';
    session.expiryTime = new Date(Date.now() + this.config.emergencyTimeout);
    session.medicalInfo.emergencyAccess = true;
    session.medicalInfo.supervisorOverride = true;

    this.sessions.set(sessionId, session);
    this.resetSessionTimer(sessionId);

    await this.logEvent({
      id: this.generateEventId(),
      type: 'emergency_override',
      sessionId,
      userId: session.userId,
      timestamp: new Date(),
      data: { reason, approverId },
      severity: 'critical',
      message: `Emergency override applied: ${reason}`,
      action: 'emergency_override_applied',
      resolved: true
    });

    // Create alert for emergency override
    await this.createAlert({
      id: this.generateAlertId(),
      type: 'emergency',
      sessionId,
      userId: session.userId,
      priority: 'critical',
      message: `Emergency override applied for ${session.user.name}: ${reason}`,
      timestamp: new Date(),
      acknowledged: false,
      recipients: ['admin@medsight.pro', 'security@medsight.pro'],
      actions: ['review_emergency_access', 'audit_activities']
    });

    this.emit('emergency_override', session);
  }

  // Session Monitoring
  private startMonitoring(): void {
    setInterval(() => {
      this.checkSessionHealth();
      this.detectAnomalies();
      this.cleanupExpiredSessions();
    }, 5000); // Check every 5 seconds
  }

  private async checkSessionHealth(): Promise<void> {
    for (const [sessionId, session] of this.sessions) {
      // Check for idle sessions
      const idleTime = Date.now() - session.lastActivity.getTime();
      if (idleTime > this.config.timeout / 2 && session.status === 'active') {
        session.status = 'idle';
        this.sessions.set(sessionId, session);
        this.emit('session_idle', session);
      }

      // Check for compliance violations
      await this.checkComplianceViolations(session);
    }
  }

  private async detectAnomalies(): Promise<void> {
    // Check for concurrent sessions from different locations
    const userLocationMap = new Map<string, Set<string>>();
    
    for (const session of this.sessions.values()) {
      if (!userLocationMap.has(session.userId)) {
        userLocationMap.set(session.userId, new Set());
      }
      userLocationMap.get(session.userId)!.add(session.locationInfo.city);
    }

    for (const [userId, locations] of userLocationMap) {
      if (locations.size > 1) {
        await this.createViolation({
          id: this.generateViolationId(),
          type: 'concurrent_location',
          sessionId: '',
          userId,
          severity: 'medium',
          message: `User has concurrent sessions from multiple locations: ${Array.from(locations).join(', ')}`,
          timestamp: new Date(),
          resolved: false,
          action: 'verify_legitimate_access',
          evidence: { locations: Array.from(locations) }
        });
      }
    }
  }

  private async checkComplianceViolations(session: SessionData): Promise<void> {
    const violations: string[] = [];

    // Check MFA compliance
    if (this.config.mfaRequired && !session.securityInfo.mfaVerified) {
      violations.push('MFA verification required');
    }

    // Check license expiry
    if (new Date(session.user.licenseExpiry) < new Date()) {
      violations.push('Medical license expired');
    }

    // Check session duration
    const sessionDuration = Date.now() - session.startTime.getTime();
    if (sessionDuration > this.config.timeout * 2) {
      violations.push('Session duration exceeds policy');
    }

    // Check device trust
    if (!session.deviceInfo.trusted && this.config.deviceRegistration) {
      violations.push('Untrusted device access');
    }

    if (violations.length > 0) {
      session.medicalInfo.complianceViolations = violations;
      this.sessions.set(session.id, session);

      await this.createViolation({
        id: this.generateViolationId(),
        type: 'compliance_breach',
        sessionId: session.id,
        userId: session.userId,
        severity: 'high',
        message: `Compliance violations detected: ${violations.join(', ')}`,
        timestamp: new Date(),
        resolved: false,
        action: 'review_compliance_status',
        evidence: { violations }
      });
    }
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions) {
      if (session.expiryTime < now && session.status !== 'emergency_override') {
        this.terminateSession(sessionId, 'Session expired');
      }
    }
  }

  // Session Timers
  private startSessionTimer(sessionId: string): void {
    const timer = setTimeout(() => {
      this.handleSessionTimeout(sessionId);
    }, this.config.timeout);
    
    this.timers.set(sessionId, timer);
  }

  private startSessionWarningTimer(sessionId: string): void {
    const warningTimer = setTimeout(() => {
      this.handleSessionWarning(sessionId);
    }, this.config.timeout - this.config.warningTime);
    
    this.warningTimers.set(sessionId, warningTimer);
  }

  private resetSessionTimer(sessionId: string): void {
    this.clearSessionTimers(sessionId);
    this.startSessionTimer(sessionId);
    this.startSessionWarningTimer(sessionId);
  }

  private clearSessionTimers(sessionId: string): void {
    const timer = this.timers.get(sessionId);
    const warningTimer = this.warningTimers.get(sessionId);
    
    if (timer) clearTimeout(timer);
    if (warningTimer) clearTimeout(warningTimer);
    
    this.timers.delete(sessionId);
    this.warningTimers.delete(sessionId);
  }

  private async handleSessionTimeout(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = 'expired';
    this.sessions.set(sessionId, session);

    await this.logEvent({
      id: this.generateEventId(),
      type: 'timeout',
      sessionId,
      userId: session.userId,
      timestamp: new Date(),
      data: { reason: 'Session timeout' },
      severity: 'medium',
      message: `Session timed out for ${session.user.name}`,
      action: 'session_expired',
      resolved: true
    });

    this.emit('session_timeout', session);
    
    // Auto-terminate expired sessions
    setTimeout(() => {
      this.terminateSession(sessionId, 'Auto-terminated after timeout');
    }, 60000); // 1 minute grace period
  }

  private async handleSessionWarning(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = 'warning';
    this.sessions.set(sessionId, session);

    await this.logEvent({
      id: this.generateEventId(),
      type: 'warning',
      sessionId,
      userId: session.userId,
      timestamp: new Date(),
      data: { remainingTime: this.config.warningTime },
      severity: 'medium',
      message: `Session timeout warning for ${session.user.name}`,
      action: 'warning_sent',
      resolved: true
    });

    this.emit('session_warning', session);
  }

  // Utility Methods
  private generateSessionId(): string {
    return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateEventId(): string {
    return 'event_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateViolationId(): string {
    return 'violation_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateAlertId(): string {
    return 'alert_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getUserSessions(userId: string): SessionData[] {
    return Array.from(this.sessions.values()).filter(session => session.userId === userId);
  }

  private async isDeviceTrusted(deviceId: string, userId: string): Promise<boolean> {
    // Mock implementation - in production, check against trusted device database
    return true;
  }

  private async checkSuspiciousActivity(userId: string, locationInfo: any): Promise<boolean> {
    // Mock implementation - in production, check against security rules
    return false;
  }

  private calculateSecurityScore(user: SessionUser, deviceInfo: any, locationInfo: any): number {
    let score = 50; // Base score
    
    if (user.mfaEnabled) score += 20;
    if (user.mfaVerified) score += 10;
    if (deviceInfo.trusted) score += 10;
    if (locationInfo.suspicious) score -= 30;
    if (user.failedLoginAttempts > 3) score -= 20;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateRiskLevel(user: SessionUser, deviceInfo: any, locationInfo: any): 'low' | 'medium' | 'high' {
    const score = this.calculateSecurityScore(user, deviceInfo, locationInfo);
    
    if (score >= 70) return 'low';
    if (score >= 40) return 'medium';
    return 'high';
  }

  private async logEvent(event: SessionEvent): Promise<void> {
    this.events.push(event);
    this.emit('event_logged', event);
    
    // In production, persist to database
    if (this.config.auditLogging) {
      console.log('Session Event:', event);
    }
  }

  private async createViolation(violation: SessionViolation): Promise<void> {
    this.violations.push(violation);
    this.emit('violation_created', violation);
    
    // Create alert for high/critical violations
    if (violation.severity === 'high' || violation.severity === 'critical') {
      await this.createAlert({
        id: this.generateAlertId(),
        type: 'violation',
        sessionId: violation.sessionId,
        userId: violation.userId,
        priority: violation.severity,
        message: violation.message,
        timestamp: new Date(),
        acknowledged: false,
        recipients: ['admin@medsight.pro', 'security@medsight.pro'],
        actions: ['investigate_violation', 'review_access']
      });
    }
  }

  private async createAlert(alert: SessionAlert): Promise<void> {
    this.alerts.push(alert);
    this.emit('alert_created', alert);
    
    // In production, send notifications to recipients
    console.log('Session Alert:', alert);
  }

  // Public API Methods
  async getAllSessions(): Promise<SessionData[]> {
    return Array.from(this.sessions.values());
  }

  async getSessionEvents(sessionId?: string): Promise<SessionEvent[]> {
    if (sessionId) {
      return this.events.filter(event => event.sessionId === sessionId);
    }
    return this.events;
  }

  async getViolations(resolved?: boolean): Promise<SessionViolation[]> {
    if (resolved !== undefined) {
      return this.violations.filter(violation => violation.resolved === resolved);
    }
    return this.violations;
  }

  async getAlerts(acknowledged?: boolean): Promise<SessionAlert[]> {
    if (acknowledged !== undefined) {
      return this.alerts.filter(alert => alert.acknowledged === acknowledged);
    }
    return this.alerts;
  }

  async resolveViolation(violationId: string): Promise<void> {
    const violation = this.violations.find(v => v.id === violationId);
    if (violation) {
      violation.resolved = true;
      this.emit('violation_resolved', violation);
    }
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit('alert_acknowledged', alert);
    }
  }

  async getSessionStatistics(): Promise<any> {
    const sessions = Array.from(this.sessions.values());
    const activeCount = sessions.filter(s => s.status === 'active').length;
    const idleCount = sessions.filter(s => s.status === 'idle').length;
    const warningCount = sessions.filter(s => s.status === 'warning').length;
    const expiredCount = sessions.filter(s => s.status === 'expired').length;
    const emergencyCount = sessions.filter(s => s.status === 'emergency_override').length;
    
    return {
      total: sessions.length,
      active: activeCount,
      idle: idleCount,
      warning: warningCount,
      expired: expiredCount,
      emergency: emergencyCount,
      violations: this.violations.filter(v => !v.resolved).length,
      alerts: this.alerts.filter(a => !a.acknowledged).length,
      averageSessionDuration: this.calculateAverageSessionDuration(),
      peakConcurrentSessions: this.sessions.size,
      complianceRate: this.calculateComplianceRate()
    };
  }

  private calculateAverageSessionDuration(): number {
    const sessions = Array.from(this.sessions.values());
    if (sessions.length === 0) return 0;
    
    const totalDuration = sessions.reduce((sum, session) => {
      return sum + (Date.now() - session.startTime.getTime());
    }, 0);
    
    return totalDuration / sessions.length;
  }

  private calculateComplianceRate(): number {
    const sessions = Array.from(this.sessions.values());
    if (sessions.length === 0) return 100;
    
    const compliantSessions = sessions.filter(session => 
      session.medicalInfo.complianceViolations.length === 0
    ).length;
    
    return (compliantSessions / sessions.length) * 100;
  }

  // Configuration Updates
  async updateConfig(newConfig: Partial<SessionConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    this.emit('config_updated', this.config);
  }

  getConfig(): SessionConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const sessionIntegration = new SessionIntegration({
  timeout: 15 * 60 * 1000, // 15 minutes
  warningTime: 5 * 60 * 1000, // 5 minutes
  maxSessions: 5,
  maxExtensions: 3,
  extensionDuration: 15 * 60 * 1000, // 15 minutes
  emergencyTimeout: 30 * 60 * 1000, // 30 minutes
  mfaRequired: true,
  mfaTimeout: 30 * 60 * 1000, // 30 minutes
  deviceRegistration: true,
  locationTracking: true,
  auditLogging: true,
  encryptionRequired: true,
  ipWhitelisting: false,
  concurrentSessionLimit: 5,
  emergencyOverrideEnabled: true,
  supervisorApprovalRequired: false,
  complianceMode: 'strict'
}); 