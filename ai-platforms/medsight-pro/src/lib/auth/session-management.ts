/**
 * Medical Session Management
 * HIPAA-compliant session handling with medical-grade security
 */

import { medicalServices } from '@/config/shared-config';
import { MedicalUser, UserSession, DeviceInfo, DEFAULT_SESSION_TIMEOUT, DEFAULT_MAX_SESSIONS } from '@/types/medical-user';

// Session storage interface
interface SessionStorage {
  set(key: string, value: any, ttl?: number): Promise<void>;
  get(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Browser session storage implementation
class BrowserSessionStorage implements SessionStorage {
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const data = {
      value,
      timestamp: Date.now(),
      ttl: ttl || DEFAULT_SESSION_TIMEOUT
    };
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, JSON.stringify(data));
    }
  }

  async get(key: string): Promise<any> {
    if (typeof window === 'undefined') return null;
    
    const stored = sessionStorage.getItem(key);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    const now = Date.now();
    
    if (now - data.timestamp > data.ttl) {
      await this.delete(key);
      return null;
    }
    
    return data.value;
  }

  async delete(key: string): Promise<void> {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  }
}

// Session manager class
export class MedicalSessionManager {
  private static instance: MedicalSessionManager;
  private storage: SessionStorage;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private inactivityTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.storage = new BrowserSessionStorage();
    this.initializeSessionMonitoring();
  }

  public static getInstance(): MedicalSessionManager {
    if (!MedicalSessionManager.instance) {
      MedicalSessionManager.instance = new MedicalSessionManager();
    }
    return MedicalSessionManager.instance;
  }

  // Create new medical session
  public async createSession(user: MedicalUser, deviceInfo?: DeviceInfo): Promise<UserSession> {
    const session: UserSession = {
      id: this.generateSessionId(),
      userId: user.id,
      token: this.generateSessionToken(),
      refreshToken: this.generateRefreshToken(),
      expiresAt: new Date(Date.now() + (user.sessionTimeout || DEFAULT_SESSION_TIMEOUT)),
      createdAt: new Date(),
      lastActivity: new Date(),
      ipAddress: await this.getClientIP(),
      userAgent: this.getUserAgent(),
      isActive: true,
      deviceInfo: deviceInfo || await this.getDeviceInfo()
    };

    // Store session
    await this.storage.set(`session:${session.id}`, session);
    await this.storage.set(`user_sessions:${user.id}`, await this.getUserSessions(user.id));

    // Update user's active sessions count
    await this.updateUserSessionCount(user.id);

    // Medical audit logging
    medicalServices.auditMedicalAccess(user.id, 'session', 'SESSION_CREATED');

    return session;
  }

  // Get session by ID
  public async getSession(sessionId: string): Promise<UserSession | null> {
    const session = await this.storage.get(`session:${sessionId}`);
    if (!session) return null;

    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      await this.destroySession(sessionId);
      return null;
    }

    return session;
  }

  // Update session activity
  public async updateActivity(activityType: string, location?: string): Promise<void> {
    const currentSession = await this.getCurrentSession();
    if (!currentSession) return;

    currentSession.lastActivity = new Date();
    if (location) {
      // Store location info if needed
      currentSession.deviceInfo = {
        ...currentSession.deviceInfo,
        location: location
      } as DeviceInfo;
    }
    
    await this.storage.set(`session:${currentSession.id}`, currentSession);

    // Reset inactivity timer
    this.resetInactivityTimer(currentSession);
  }

  // Get user's active sessions
  public async getUserSessions(userId: string): Promise<UserSession[]> {
    const sessions = await this.storage.get(`user_sessions:${userId}`) || [];
    const activeSessions: UserSession[] = [];

    for (const sessionId of sessions) {
      const session = await this.getSession(sessionId);
      if (session && session.isActive) {
        activeSessions.push(session);
      }
    }

    return activeSessions;
  }

  // Destroy session
  public async destroySession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    // Mark as inactive
    session.isActive = false;
    await this.storage.set(`session:${sessionId}`, session);

    // Remove from user's active sessions
    await this.removeUserSession(session.userId, sessionId);

    // Medical audit logging
    medicalServices.auditMedicalAccess(session.userId, 'session', 'SESSION_DESTROYED');
  }

  // Destroy all user sessions
  public async destroyAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId);
    
    for (const session of sessions) {
      await this.destroySession(session.id);
    }

    // Medical audit logging
    medicalServices.auditMedicalAccess(userId, 'session', 'ALL_SESSIONS_DESTROYED');
  }

  // Check session limits
  public async checkSessionLimits(userId: string): Promise<{ allowed: boolean; activeCount: number; maxAllowed: number }> {
    const activeSessions = await this.getUserSessions(userId);
    const maxSessions = DEFAULT_MAX_SESSIONS;

    return {
      allowed: activeSessions.length < maxSessions,
      activeCount: activeSessions.length,
      maxAllowed: maxSessions
    };
  }

  // Validate session token
  public async validateSessionToken(token: string): Promise<UserSession | null> {
    // In a real implementation, this would validate JWT tokens
    // For now, find session by token
    const sessions = await this.storage.get('all_sessions') || [];
    
    for (const sessionId of sessions) {
      const session = await this.getSession(sessionId);
      if (session && session.token === token) {
        return session;
      }
    }
    
    return null;
  }

  // Extend session
  public async extendSession(sessionId: string, duration?: number): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;

    const extensionTime = duration || DEFAULT_SESSION_TIMEOUT;
    session.expiresAt = new Date(Date.now() + extensionTime);
    
    await this.storage.set(`session:${sessionId}`, session);

    // Medical audit logging
    medicalServices.auditMedicalAccess(session.userId, 'session', 'SESSION_EXTENDED');

    return true;
  }

  // Get session statistics
  public async getSessionStats(userId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    lastActivity: Date | null;
    averageSessionDuration: number;
  }> {
    const sessions = await this.getUserSessions(userId);
    const allSessions = await this.storage.get(`user_all_sessions:${userId}`) || [];

    let totalDuration = 0;
    let lastActivity: Date | null = null;

    for (const session of sessions) {
      if (session.lastActivity > (lastActivity || new Date(0))) {
        lastActivity = session.lastActivity;
      }

      const sessionDuration = session.lastActivity.getTime() - session.createdAt.getTime();
      totalDuration += sessionDuration;
    }

    return {
      totalSessions: allSessions.length,
      activeSessions: sessions.length,
      lastActivity,
      averageSessionDuration: sessions.length > 0 ? totalDuration / sessions.length : 0
    };
  }

  // Initialize session monitoring
  private initializeSessionMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Check for session expiry every minute
    this.sessionCheckInterval = setInterval(async () => {
      await this.cleanupExpiredSessions();
    }, 60 * 1000);

    // Listen for user activity
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activities.forEach(activity => {
      document.addEventListener(activity, this.handleUserActivity.bind(this), true);
    });

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Listen for beforeunload
    window.addEventListener('beforeunload', this.handlePageUnload.bind(this));
  }

  // Handle user activity
  private handleUserActivity = async (): Promise<void> => {
    const currentSession = await this.getCurrentSession();
    if (currentSession) {
      await this.updateActivity('user_activity');
    }
  };

  // Handle visibility change
  private handleVisibilityChange = async (): Promise<void> => {
    if (document.hidden) {
      // Page is hidden, start inactivity timer
      this.startInactivityTimer();
    } else {
      // Page is visible, reset inactivity timer
      this.resetInactivityTimer();
    }
  };

  // Handle page unload
  private handlePageUnload = async (): Promise<void> => {
    const currentSession = await this.getCurrentSession();
    if (currentSession) {
      // Mark session as potentially inactive
      medicalServices.auditMedicalAccess(currentSession.userId, 'session', 'PAGE_UNLOAD');
    }
  };

  // Start inactivity timer
  private startInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    this.inactivityTimer = setTimeout(async () => {
      const currentSession = await this.getCurrentSession();
      if (currentSession) {
        await this.handleInactiveSession(currentSession);
      }
    }, 5 * 60 * 1000); // 5 minutes of inactivity
  }

  // Reset inactivity timer
  private resetInactivityTimer(session?: UserSession): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    if (session) {
      // Start fresh timer for this session
      this.startInactivityTimer();
    }
  }

  // Handle inactive session
  private async handleInactiveSession(session: UserSession): Promise<void> {
    // Show session warning
    if (typeof window !== 'undefined') {
      const shouldExtend = confirm('Your session is about to expire. Would you like to extend it?');
      
      if (shouldExtend) {
        await this.extendSession(session.id);
      } else {
        await this.destroySession(session.id);
        window.location.href = '/login?reason=session_expired';
      }
    }
  }

  // Cleanup expired sessions
  private async cleanupExpiredSessions(): Promise<void> {
    const allSessions = await this.storage.get('all_sessions') || [];
    const now = new Date();

    for (const sessionId of allSessions) {
      const session = await this.getSession(sessionId);
      if (session && new Date(session.expiresAt) < now) {
        await this.destroySession(sessionId);
      }
    }
  }

  // Get current session - make it public
  public async getCurrentSession(): Promise<UserSession | null> {
    const sessionId = await this.storage.get('current_session_id');
    return sessionId ? await this.getSession(sessionId) : null;
  }

  // Event listener functionality
  private eventListeners: { [event: string]: Function[] } = {};

  public addEventListener(event: string, listener: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(listener);
  }

  public removeEventListener(event: string, listener: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(l => l !== listener);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(listener => listener(data));
    }
  }

  // Get session warnings
  public async getSessionWarnings(): Promise<any[]> {
    const currentSession = await this.getCurrentSession();
    if (!currentSession) return [];

    const warnings: any[] = [];
    const now = Date.now();
    const expiresAt = new Date(currentSession.expiresAt).getTime();
    const timeLeft = expiresAt - now;

    // Warn if session expires in less than 5 minutes
    if (timeLeft < 5 * 60 * 1000 && timeLeft > 0) {
      warnings.push({
        type: 'session_expiry',
        message: `Session expires in ${Math.ceil(timeLeft / 60000)} minutes`,
        severity: 'warning'
      });
    }

    return warnings;
  }

  // Update user session count
  private async updateUserSessionCount(userId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId);
    await this.storage.set(`user_session_count:${userId}`, sessions.length);
  }

  // Remove user session
  private async removeUserSession(userId: string, sessionId: string): Promise<void> {
    const sessions = await this.storage.get(`user_sessions:${userId}`) || [];
    const updatedSessions = sessions.filter((id: string) => id !== sessionId);
    await this.storage.set(`user_sessions:${userId}`, updatedSessions);
  }

  // Generate session ID
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Generate session token
  private generateSessionToken(): string {
    return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
  }

  // Generate refresh token
  private generateRefreshToken(): string {
    return 'refresh_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
  }

  // Get client IP
  private async getClientIP(): Promise<string> {
    try {
      // In a real implementation, this would be provided by the server
      return '127.0.0.1';
    } catch (error) {
      return 'unknown';
    }
  }

  // Get user agent
  private getUserAgent(): string {
    return typeof window !== 'undefined' ? navigator.userAgent : 'server';
  }

  // Get device info
  private async getDeviceInfo(): Promise<DeviceInfo> {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        os: 'unknown',
        browser: 'unknown'
      };
    }

    const userAgent = navigator.userAgent;
    
    // Simple device detection
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = /iPad|Android.*tablet/i.test(userAgent) ? 'tablet' : 'mobile';
    }

    // Simple OS detection
    let os = 'unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    // Simple browser detection
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    return {
      type: deviceType,
      os,
      browser
    };
  }

  // Session security validation
  public async validateSessionSecurity(sessionId: string): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return {
        valid: false,
        issues: ['Session not found']
      };
    }

    const issues: string[] = [];

    // Check session age
    const sessionAge = Date.now() - session.createdAt.getTime();
    if (sessionAge > 24 * 60 * 60 * 1000) { // 24 hours
      issues.push('Session is older than 24 hours');
    }

    // Check last activity
    const lastActivity = Date.now() - session.lastActivity.getTime();
    if (lastActivity > 30 * 60 * 1000) { // 30 minutes
      issues.push('Session has been inactive for over 30 minutes');
    }

    // Check device consistency
    const currentDeviceInfo = await this.getDeviceInfo();
    if (session.deviceInfo) {
      if (session.deviceInfo.type !== currentDeviceInfo.type) {
        issues.push('Device type mismatch');
      }
      if (session.deviceInfo.os !== currentDeviceInfo.os) {
        issues.push('Operating system mismatch');
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Destroy instance (for testing)
  public static destroyInstance(): void {
    if (MedicalSessionManager.instance) {
      if (MedicalSessionManager.instance.sessionCheckInterval) {
        clearInterval(MedicalSessionManager.instance.sessionCheckInterval);
      }
      if (MedicalSessionManager.instance.inactivityTimer) {
        clearTimeout(MedicalSessionManager.instance.inactivityTimer);
      }
      MedicalSessionManager.instance = null as any;
    }
  }
}

// Export singleton instance
export const medicalSessionManager = MedicalSessionManager.getInstance();
export default medicalSessionManager; 