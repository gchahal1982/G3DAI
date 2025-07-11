/**
 * MedSight Pro - Medical Session Management System
 * Medical-grade session handling with HIPAA compliance and clinical workflow optimization
 * Enhanced security for medical data access and automatic timeout protection
 */

// Medical session interfaces
interface MedicalSession {
  id: string;
  userId: string;
  userEmail: string;
  medicalLicense: string;
  roles: string[];
  startTime: Date;
  lastActivity: Date;
  timeout: number; // in milliseconds
  autoExtend: boolean;
  deviceFingerprint: string;
  ipAddress: string;
  location?: {
    hospital: string;
    department: string;
    workstation: string;
  };
  metadata: {
    mfaVerified: boolean;
    emergencyAccess: boolean;
    complianceLevel: 'basic' | 'standard' | 'high';
    auditLevel: 'basic' | 'detailed' | 'comprehensive';
  };
}

interface SessionWarning {
  type: 'timeout' | 'inactivity' | 'concurrent' | 'security';
  message: string;
  timeRemaining?: number;
  action: 'extend' | 'logout' | 'verify';
}

interface SessionActivity {
  timestamp: Date;
  action: string;
  route: string;
  data?: any;
  ipAddress: string;
  userAgent: string;
}

// Medical session configuration
const MEDICAL_SESSION_CONFIG = {
  timeout: {
    default: 15 * 60 * 1000, // 15 minutes
    emergency: 60 * 60 * 1000, // 1 hour for emergency access
    admin: 30 * 60 * 1000, // 30 minutes for admin
    extended: 60 * 60 * 1000 // 1 hour for extended sessions
  },
  warnings: {
    first: 5 * 60 * 1000, // 5 minutes before timeout
    second: 2 * 60 * 1000, // 2 minutes before timeout
    final: 30 * 1000 // 30 seconds before timeout
  },
  security: {
    maxConcurrentSessions: 3,
    deviceFingerprintRequired: true,
    ipValidationEnabled: true,
    activityTrackingEnabled: true
  },
  autoExtend: {
    enabled: true,
    onActivity: ['medical_action', 'patient_access', 'imaging_view'],
    maxExtensions: 4,
    extensionDuration: 15 * 60 * 1000 // 15 minutes
  }
};

export class MedicalSessionManager {
  private sessions: Map<string, MedicalSession> = new Map();
  private sessionTimers: Map<string, NodeJS.Timeout> = new Map();
  private warningTimers: Map<string, NodeJS.Timeout[]> = new Map();
  private activityLog: Map<string, SessionActivity[]> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeSessionManager();
  }

  // Initialize session manager
  private initializeSessionManager(): void {
    if (typeof window !== 'undefined') {
      // Handle page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.handlePageHidden();
        } else {
          this.handlePageVisible();
        }
      });

      // Handle beforeunload for session cleanup
      window.addEventListener('beforeunload', () => {
        this.handlePageUnload();
      });

      // Track user activity
      this.initializeActivityTracking();
    }
  }

  // Create new medical session
  async createSession(user: any, options: {
    emergencyAccess?: boolean;
    extendedSession?: boolean;
    location?: any;
  } = {}): Promise<MedicalSession> {
    const sessionId = this.generateSessionId();
    const timeout = this.getSessionTimeout(user.role, options);
    
    const session: MedicalSession = {
      id: sessionId,
      userId: user.id,
      userEmail: user.email,
      medicalLicense: user.medicalLicense,
      roles: user.roles || [],
      startTime: new Date(),
      lastActivity: new Date(),
      timeout,
      autoExtend: MEDICAL_SESSION_CONFIG.autoExtend.enabled,
      deviceFingerprint: await this.getDeviceFingerprint(),
      ipAddress: await this.getClientIP(),
      location: options.location,
      metadata: {
        mfaVerified: user.mfaVerified || false,
        emergencyAccess: options.emergencyAccess || false,
        complianceLevel: this.getComplianceLevel(user),
        auditLevel: this.getAuditLevel(user.roles)
      }
    };

    // Check concurrent session limits
    await this.enforceSessionLimits(user.id, session);

    // Store session
    this.sessions.set(sessionId, session);
    this.initializeSessionTimers(sessionId);
    this.logSessionActivity(sessionId, 'session_created');

    // Store in browser storage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('medical_session_id', sessionId);
      localStorage.setItem(`medical_session_${sessionId}`, JSON.stringify({
        id: sessionId,
        userId: user.id,
        startTime: session.startTime.toISOString(),
        timeout: session.timeout
      }));
    }

    console.log('🏥 Medical session created:', {
      sessionId,
      user: user.email,
      timeout: timeout / 1000 / 60 + ' minutes',
      emergencyAccess: options.emergencyAccess
    });

    return session;
  }

  // Get current session
  getCurrentSession(): MedicalSession | null {
    if (typeof window === 'undefined') return null;

    const sessionId = sessionStorage.getItem('medical_session_id');
    if (!sessionId) return null;

    return this.sessions.get(sessionId) || null;
  }

  // Update session activity
  updateActivity(action: string, route: string, data?: any): void {
    const session = this.getCurrentSession();
    if (!session) return;

    session.lastActivity = new Date();
    this.logSessionActivity(session.id, action, route, data);

    // Auto-extend session if applicable
    if (this.shouldAutoExtendSession(action)) {
      this.extendSession(session.id, MEDICAL_SESSION_CONFIG.autoExtend.extensionDuration);
    }

    // Reset timeout timers
    this.resetSessionTimers(session.id);
  }

  // Extend session
  extendSession(sessionId: string, duration: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Check if session can be extended
    const activityCount = this.activityLog.get(sessionId)?.length || 0;
    if (activityCount >= MEDICAL_SESSION_CONFIG.autoExtend.maxExtensions) {
      return false;
    }

    session.timeout += duration;
    this.resetSessionTimers(sessionId);
    this.logSessionActivity(sessionId, 'session_extended', '', { duration });

    console.log('⏰ Medical session extended:', {
      sessionId,
      newTimeout: session.timeout / 1000 / 60 + ' minutes'
    });

    return true;
  }

  // Check session validity
  isSessionValid(sessionId?: string): boolean {
    const id = sessionId || sessionStorage.getItem('medical_session_id');
    if (!id) return false;

    const session = this.sessions.get(id);
    if (!session) return false;

    const now = Date.now();
    const sessionAge = now - session.startTime.getTime();
    const inactivityPeriod = now - session.lastActivity.getTime();

    return sessionAge < session.timeout && inactivityPeriod < session.timeout;
  }

  // Get session warnings
  getSessionWarnings(): SessionWarning[] {
    const session = this.getCurrentSession();
    if (!session) return [];

    const warnings: SessionWarning[] = [];
    const now = Date.now();
    const timeRemaining = session.timeout - (now - session.lastActivity.getTime());

    if (timeRemaining <= MEDICAL_SESSION_CONFIG.warnings.final) {
      warnings.push({
        type: 'timeout',
        message: 'Session expires in 30 seconds. Please save your work.',
        timeRemaining,
        action: 'extend'
      });
    } else if (timeRemaining <= MEDICAL_SESSION_CONFIG.warnings.second) {
      warnings.push({
        type: 'timeout',
        message: 'Session expires in 2 minutes. Extend session or save your work.',
        timeRemaining,
        action: 'extend'
      });
    } else if (timeRemaining <= MEDICAL_SESSION_CONFIG.warnings.first) {
      warnings.push({
        type: 'inactivity',
        message: 'Session will expire soon due to inactivity.',
        timeRemaining,
        action: 'extend'
      });
    }

    return warnings;
  }

  // Terminate session
  async terminateSession(sessionId?: string, reason: string = 'manual'): Promise<boolean> {
    const id = sessionId || sessionStorage.getItem('medical_session_id');
    if (!id) return false;

    const session = this.sessions.get(id);
    if (session) {
      this.logSessionActivity(id, 'session_terminated', '', { reason });
    }

    // Clear timers
    this.clearSessionTimers(id);

    // Remove session
    this.sessions.delete(id);
    this.activityLog.delete(id);

    // Clear browser storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('medical_session_id');
      localStorage.removeItem(`medical_session_${id}`);
    }

    // Emit session ended event
    this.emitEvent('sessionEnded', { sessionId: id, reason });

    console.log('🔒 Medical session terminated:', { sessionId: id, reason });
    return true;
  }

  // Initialize session timers
  private initializeSessionTimers(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Clear existing timers
    this.clearSessionTimers(sessionId);

    // Set warning timers
    const warningTimers: NodeJS.Timeout[] = [];
    
    // First warning (5 minutes before)
    const firstWarningTime = session.timeout - MEDICAL_SESSION_CONFIG.warnings.first;
    if (firstWarningTime > 0) {
      warningTimers.push(setTimeout(() => {
        this.emitSessionWarning(sessionId, 'first');
      }, firstWarningTime));
    }

    // Second warning (2 minutes before)
    const secondWarningTime = session.timeout - MEDICAL_SESSION_CONFIG.warnings.second;
    if (secondWarningTime > 0) {
      warningTimers.push(setTimeout(() => {
        this.emitSessionWarning(sessionId, 'second');
      }, secondWarningTime));
    }

    // Final warning (30 seconds before)
    const finalWarningTime = session.timeout - MEDICAL_SESSION_CONFIG.warnings.final;
    if (finalWarningTime > 0) {
      warningTimers.push(setTimeout(() => {
        this.emitSessionWarning(sessionId, 'final');
      }, finalWarningTime));
    }

    // Session timeout
    const timeoutTimer = setTimeout(() => {
      this.handleSessionTimeout(sessionId);
    }, session.timeout);

    this.sessionTimers.set(sessionId, timeoutTimer);
    this.warningTimers.set(sessionId, warningTimers);
  }

  // Reset session timers
  private resetSessionTimers(sessionId: string): void {
    this.clearSessionTimers(sessionId);
    this.initializeSessionTimers(sessionId);
  }

  // Clear session timers
  private clearSessionTimers(sessionId: string): void {
    const sessionTimer = this.sessionTimers.get(sessionId);
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      this.sessionTimers.delete(sessionId);
    }

    const warningTimers = this.warningTimers.get(sessionId);
    if (warningTimers) {
      warningTimers.forEach(timer => clearTimeout(timer));
      this.warningTimers.delete(sessionId);
    }
  }

  // Handle session timeout
  private async handleSessionTimeout(sessionId: string): Promise<void> {
    console.log('⏰ Medical session timeout:', sessionId);
    
    await this.terminateSession(sessionId, 'timeout');
    
    // Redirect to login if this is the current session
    if (typeof window !== 'undefined' && 
        sessionStorage.getItem('medical_session_id') === sessionId) {
      window.location.href = '/login?session=expired';
    }
  }

  // Emit session warning
  private emitSessionWarning(sessionId: string, level: string): void {
    const warnings = this.getSessionWarnings();
    this.emitEvent('sessionWarning', { sessionId, level, warnings });
  }

  // Activity tracking
  private initializeActivityTracking(): void {
    if (!MEDICAL_SESSION_CONFIG.security.activityTrackingEnabled) return;

    // Track mouse movement
    let mouseMoveTimeout: NodeJS.Timeout;
    document.addEventListener('mousemove', () => {
      clearTimeout(mouseMoveTimeout);
      mouseMoveTimeout = setTimeout(() => {
        this.updateActivity('mouse_activity', window.location.pathname);
      }, 1000);
    });

    // Track keyboard activity
    let keyboardTimeout: NodeJS.Timeout;
    document.addEventListener('keydown', () => {
      clearTimeout(keyboardTimeout);
      keyboardTimeout = setTimeout(() => {
        this.updateActivity('keyboard_activity', window.location.pathname);
      }, 1000);
    });

    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.updateActivity('click', window.location.pathname, {
        element: target.tagName,
        id: target.id,
        className: target.className
      });
    });
  }

  // Log session activity
  private logSessionActivity(sessionId: string, action: string, route?: string, data?: any): void {
    const activity: SessionActivity = {
      timestamp: new Date(),
      action,
      route: route || (typeof window !== 'undefined' ? window.location.pathname : ''),
      data,
      ipAddress: this.getClientIP().toString(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
    };

    if (!this.activityLog.has(sessionId)) {
      this.activityLog.set(sessionId, []);
    }

    this.activityLog.get(sessionId)!.push(activity);

    // Limit activity log size
    const activities = this.activityLog.get(sessionId)!;
    if (activities.length > 1000) {
      activities.splice(0, activities.length - 1000);
    }

    console.log('📝 Session activity:', { sessionId, action, route });
  }

  // Utility methods
  private generateSessionId(): string {
    return 'med_sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getSessionTimeout(role: string, options: any): number {
    if (options.emergencyAccess) {
      return MEDICAL_SESSION_CONFIG.timeout.emergency;
    }
    
    if (options.extendedSession) {
      return MEDICAL_SESSION_CONFIG.timeout.extended;
    }

    if (role === 'admin' || role === 'system-admin') {
      return MEDICAL_SESSION_CONFIG.timeout.admin;
    }

    return MEDICAL_SESSION_CONFIG.timeout.default;
  }

  private getComplianceLevel(user: any): 'basic' | 'standard' | 'high' {
    if (user.roles?.includes('system-admin')) return 'high';
    if (user.roles?.includes('admin')) return 'standard';
    return 'basic';
  }

  private getAuditLevel(roles: string[]): 'basic' | 'detailed' | 'comprehensive' {
    if (roles?.includes('system-admin')) return 'comprehensive';
    if (roles?.includes('admin') || roles?.includes('radiologist')) return 'detailed';
    return 'basic';
  }

  private shouldAutoExtendSession(action: string): boolean {
    return MEDICAL_SESSION_CONFIG.autoExtend.onActivity.includes(action);
  }

  private async enforceSessionLimits(userId: string, newSession: MedicalSession): Promise<void> {
    const userSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId);

    if (userSessions.length >= MEDICAL_SESSION_CONFIG.security.maxConcurrentSessions) {
      // Terminate oldest session
      const oldestSession = userSessions.sort((a, b) => 
        a.startTime.getTime() - b.startTime.getTime()
      )[0];
      
      await this.terminateSession(oldestSession.id, 'concurrent_limit');
    }
  }

  private async getDeviceFingerprint(): Promise<string> {
    if (typeof window === 'undefined') return 'server';
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  }

  private async getClientIP(): Promise<string> {
    try {
      // Mock IP - in production, get from request or service
      return '192.168.1.100';
    } catch {
      return 'unknown';
    }
  }

  // Page lifecycle handlers
  private handlePageHidden(): void {
    const session = this.getCurrentSession();
    if (session) {
      this.logSessionActivity(session.id, 'page_hidden');
    }
  }

  private handlePageVisible(): void {
    const session = this.getCurrentSession();
    if (session) {
      this.logSessionActivity(session.id, 'page_visible');
      this.updateActivity('page_focus', window.location.pathname);
    }
  }

  private handlePageUnload(): void {
    const session = this.getCurrentSession();
    if (session) {
      this.logSessionActivity(session.id, 'page_unload');
    }
  }

  // Event system
  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Session event listener error:', error);
      }
    });
  }

  // Public event methods
  addEventListener(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  removeEventListener(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Get session statistics
  getSessionStats(sessionId?: string): any {
    const id = sessionId || sessionStorage.getItem('medical_session_id');
    if (!id) return null;

    const session = this.sessions.get(id);
    const activities = this.activityLog.get(id) || [];

    if (!session) return null;

    return {
      sessionId: id,
      duration: Date.now() - session.startTime.getTime(),
      lastActivity: session.lastActivity,
      activityCount: activities.length,
      timeRemaining: session.timeout - (Date.now() - session.lastActivity.getTime()),
      warnings: this.getSessionWarnings()
    };
  }
}

// Export singleton instance
export const medicalSessionManager = new MedicalSessionManager();
export default medicalSessionManager; 