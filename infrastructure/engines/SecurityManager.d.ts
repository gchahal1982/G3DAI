import { EventEmitter } from 'events';
interface SecurityPolicy {
    id: string;
    name: string;
    description: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    rules: SecurityRule[];
    enforcement: 'advisory' | 'blocking' | 'quarantine';
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}
interface SecurityRule {
    id: string;
    type: 'access' | 'encryption' | 'authentication' | 'authorization' | 'audit' | 'network';
    condition: string;
    action: string;
    priority: number;
    parameters: Record<string, any>;
}
interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
    mfaEnabled: boolean;
    lastLogin: Date;
    failedAttempts: number;
    isLocked: boolean;
    createdAt: Date;
    metadata: Record<string, any>;
}
interface Session {
    id: string;
    userId: string;
    token: string;
    refreshToken: string;
    createdAt: Date;
    expiresAt: Date;
    lastActivity: Date;
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
    permissions: string[];
}
interface SecurityEvent {
    id: string;
    type: 'login' | 'logout' | 'access_denied' | 'data_breach' | 'malware' | 'intrusion' | 'policy_violation';
    severity: 'info' | 'warning' | 'error' | 'critical';
    userId?: string;
    sessionId?: string;
    resource: string;
    action: string;
    result: 'success' | 'failure' | 'blocked';
    timestamp: Date;
    details: Record<string, any>;
    ipAddress: string;
    userAgent: string;
}
interface SecurityMetrics {
    totalUsers: number;
    activeSessions: number;
    failedLogins: number;
    blockedAttempts: number;
    securityEvents: number;
    threatsDetected: number;
    encryptedData: number;
    complianceScore: number;
    riskLevel: number;
}
interface AccessControl {
    resource: string;
    permissions: string[];
    roles: string[];
    conditions: AccessCondition[];
}
interface AccessCondition {
    type: 'time' | 'location' | 'device' | 'network' | 'attribute';
    operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in' | 'greater' | 'less';
    value: any;
}
export declare class SecurityManager extends EventEmitter {
    private users;
    private sessions;
    private policies;
    private events;
    private threatIntel;
    private encryptionKeys;
    private accessControls;
    private metrics;
    private isRunning;
    private sessionCleanupInterval;
    private threatScanInterval;
    private metricsInterval;
    private defaultSessionTimeout;
    private maxFailedAttempts;
    private lockoutDuration;
    constructor();
    private initializeSecurityManager;
    private setupEventHandlers;
    private setupDefaultPolicies;
    private setupDefaultRoles;
    private generateMasterKeys;
    private initializeMetrics;
    createUser(userData: {
        username: string;
        email: string;
        password: string;
        roles?: string[];
        permissions?: string[];
    }): Promise<string>;
    authenticateUser(username: string, password: string, options?: {
        ipAddress?: string;
        userAgent?: string;
        mfaToken?: string;
    }): Promise<Session | null>;
    validateSession(sessionToken: string): Session | null;
    invalidateSession(sessionId: string): void;
    checkPermission(userId: string, resource: string, action: string): boolean;
    private findMatchingAccessControl;
    private matchesResourcePattern;
    private checkAccessControl;
    private evaluateCondition;
    encrypt(data: string | Buffer, keyId?: string): {
        encrypted: string;
        iv: string;
        tag?: string;
    };
    decrypt(encryptedData: {
        encrypted: string;
        iv: string;
        tag?: string;
    }, keyId?: string): string;
    sign(data: string, keyId?: string): string;
    verifySignature(data: string, signature: string, keyId?: string): boolean;
    startSecurityMonitoring(): void;
    stopSecurityMonitoring(): void;
    createPolicy(policyData: Partial<SecurityPolicy>): string;
    evaluatePolicy(policyId: string, context: any): boolean;
    private handleLoginAttempt;
    private handleAccessDenied;
    private handleThreatDetected;
    private handlePolicyViolation;
    private handleDataAccess;
    private createSession;
    private hashPassword;
    private verifyPassword;
    private validatePassword;
    private verifyMFA;
    private generateEncryptionKey;
    private cleanupExpiredSessions;
    private scanForThreats;
    private updateMetrics;
    private calculateComplianceScore;
    private calculateRiskLevel;
    private evaluateRule;
    private evaluateTimeCondition;
    private evaluateLocationCondition;
    private evaluateDeviceCondition;
    private evaluateNetworkCondition;
    private evaluateAttributeCondition;
    private logSecurityEvent;
    private generateUserId;
    private generateSessionId;
    private generatePolicyId;
    private generateEventId;
    private generateKeyId;
    private generateToken;
    getSecurityStatus(): {
        metrics: SecurityMetrics;
        activeUsers: number;
        activeSessions: number;
        recentEvents: number;
        threatLevel: string;
    };
    getUser(userId: string): User | null;
    getSecurityEvents(limit?: number): SecurityEvent[];
    rotateKeys(): void;
    setAccessControl(resource: string, accessControl: AccessControl): void;
}
export {};
//# sourceMappingURL=SecurityManager.d.ts.map