import { EventEmitter } from 'events';
import * as crypto from 'crypto';
export class SecurityManager extends EventEmitter {
    constructor() {
        super();
        this.users = new Map();
        this.sessions = new Map();
        this.policies = new Map();
        this.events = [];
        this.threatIntel = new Map();
        this.encryptionKeys = new Map();
        this.accessControls = new Map();
        this.isRunning = false;
        this.sessionCleanupInterval = null;
        this.threatScanInterval = null;
        this.metricsInterval = null;
        this.defaultSessionTimeout = 3600000; // 1 hour
        this.maxFailedAttempts = 5;
        this.lockoutDuration = 900000; // 15 minutes
        this.initializeSecurityManager();
        this.setupDefaultPolicies();
        this.setupDefaultRoles();
        this.initializeMetrics();
    }
    initializeSecurityManager() {
        console.log('Initializing G3D Security Manager');
        this.setupEventHandlers();
        this.generateMasterKeys();
    }
    setupEventHandlers() {
        this.on('loginAttempt', this.handleLoginAttempt.bind(this));
        this.on('accessDenied', this.handleAccessDenied.bind(this));
        this.on('threatDetected', this.handleThreatDetected.bind(this));
        this.on('policyViolation', this.handlePolicyViolation.bind(this));
        this.on('dataAccess', this.handleDataAccess.bind(this));
    }
    setupDefaultPolicies() {
        // Password Policy
        this.createPolicy({
            name: 'Password Policy',
            description: 'Enforce strong password requirements',
            level: 'high',
            rules: [
                {
                    id: 'pwd-001',
                    type: 'authentication',
                    condition: 'password_strength',
                    action: 'enforce_complexity',
                    priority: 10,
                    parameters: {
                        minLength: 12,
                        requireUppercase: true,
                        requireLowercase: true,
                        requireNumbers: true,
                        requireSymbols: true,
                        preventReuse: 5
                    }
                }
            ],
            enforcement: 'blocking'
        });
        // Access Control Policy
        this.createPolicy({
            name: 'Access Control Policy',
            description: 'Control resource access based on roles and permissions',
            level: 'critical',
            rules: [
                {
                    id: 'ac-001',
                    type: 'authorization',
                    condition: 'resource_access',
                    action: 'check_permissions',
                    priority: 10,
                    parameters: {
                        requireAuthentication: true,
                        checkRoles: true,
                        checkPermissions: true,
                        logAccess: true
                    }
                }
            ],
            enforcement: 'blocking'
        });
        // Data Encryption Policy
        this.createPolicy({
            name: 'Data Encryption Policy',
            description: 'Encrypt sensitive data at rest and in transit',
            level: 'critical',
            rules: [
                {
                    id: 'enc-001',
                    type: 'encryption',
                    condition: 'sensitive_data',
                    action: 'encrypt_data',
                    priority: 10,
                    parameters: {
                        algorithm: 'AES-256-GCM',
                        keyRotationInterval: 2592000000, // 30 days
                        requireTLS: true
                    }
                }
            ],
            enforcement: 'blocking'
        });
    }
    setupDefaultRoles() {
        // Create default access controls
        this.accessControls.set('admin', {
            resource: '*',
            permissions: ['read', 'write', 'delete', 'admin'],
            roles: ['admin'],
            conditions: []
        });
        this.accessControls.set('user', {
            resource: '/user/*',
            permissions: ['read', 'write'],
            roles: ['user'],
            conditions: [
                {
                    type: 'attribute',
                    operator: 'equals',
                    value: 'self'
                }
            ]
        });
        this.accessControls.set('guest', {
            resource: '/public/*',
            permissions: ['read'],
            roles: ['guest'],
            conditions: []
        });
    }
    generateMasterKeys() {
        // Generate master encryption key
        const masterKey = this.generateEncryptionKey('AES-256-GCM', 'encryption');
        this.encryptionKeys.set('master', masterKey);
        // Generate signing key
        const signingKey = this.generateEncryptionKey('HMAC-SHA256', 'signing');
        this.encryptionKeys.set('signing', signingKey);
        console.log('Master encryption keys generated');
    }
    initializeMetrics() {
        this.metrics = {
            totalUsers: 0,
            activeSessions: 0,
            failedLogins: 0,
            blockedAttempts: 0,
            securityEvents: 0,
            threatsDetected: 0,
            encryptedData: 0,
            complianceScore: 100,
            riskLevel: 0
        };
    }
    // User Management
    async createUser(userData) {
        const userId = this.generateUserId();
        // Validate password policy
        if (!this.validatePassword(userData.password)) {
            throw new Error('Password does not meet security requirements');
        }
        const passwordHash = await this.hashPassword(userData.password);
        const user = {
            id: userId,
            username: userData.username,
            email: userData.email,
            roles: userData.roles || ['user'],
            permissions: userData.permissions || [],
            mfaEnabled: false,
            lastLogin: new Date(),
            failedAttempts: 0,
            isLocked: false,
            createdAt: new Date(),
            metadata: { passwordHash }
        };
        this.users.set(userId, user);
        this.updateMetrics();
        this.logSecurityEvent({
            type: 'login',
            severity: 'info',
            userId,
            resource: 'user_management',
            action: 'create_user',
            result: 'success',
            details: { username: userData.username, email: userData.email },
            ipAddress: '127.0.0.1',
            userAgent: 'system'
        });
        console.log(`User created: ${userData.username}`);
        return userId;
    }
    async authenticateUser(username, password, options = {}) {
        const user = Array.from(this.users.values()).find(u => u.username === username);
        this.emit('loginAttempt', {
            username,
            ipAddress: options.ipAddress || '127.0.0.1',
            userAgent: options.userAgent || 'unknown'
        });
        if (!user) {
            this.logSecurityEvent({
                type: 'login',
                severity: 'warning',
                resource: 'authentication',
                action: 'login_attempt',
                result: 'failure',
                details: { reason: 'user_not_found', username },
                ipAddress: options.ipAddress || '127.0.0.1',
                userAgent: options.userAgent || 'unknown'
            });
            return null;
        }
        if (user.isLocked) {
            this.logSecurityEvent({
                type: 'login',
                severity: 'warning',
                userId: user.id,
                resource: 'authentication',
                action: 'login_attempt',
                result: 'blocked',
                details: { reason: 'account_locked' },
                ipAddress: options.ipAddress || '127.0.0.1',
                userAgent: options.userAgent || 'unknown'
            });
            return null;
        }
        const isValidPassword = await this.verifyPassword(password, user.metadata.passwordHash);
        if (!isValidPassword) {
            user.failedAttempts++;
            if (user.failedAttempts >= this.maxFailedAttempts) {
                user.isLocked = true;
                setTimeout(() => {
                    user.isLocked = false;
                    user.failedAttempts = 0;
                }, this.lockoutDuration);
            }
            this.logSecurityEvent({
                type: 'login',
                severity: 'warning',
                userId: user.id,
                resource: 'authentication',
                action: 'login_attempt',
                result: 'failure',
                details: { reason: 'invalid_password', failedAttempts: user.failedAttempts },
                ipAddress: options.ipAddress || '127.0.0.1',
                userAgent: options.userAgent || 'unknown'
            });
            return null;
        }
        // Check MFA if enabled
        if (user.mfaEnabled && !this.verifyMFA(user.id, options.mfaToken)) {
            this.logSecurityEvent({
                type: 'login',
                severity: 'warning',
                userId: user.id,
                resource: 'authentication',
                action: 'login_attempt',
                result: 'failure',
                details: { reason: 'mfa_failed' },
                ipAddress: options.ipAddress || '127.0.0.1',
                userAgent: options.userAgent || 'unknown'
            });
            return null;
        }
        // Create session
        const session = this.createSession(user, options);
        // Reset failed attempts
        user.failedAttempts = 0;
        user.lastLogin = new Date();
        this.logSecurityEvent({
            type: 'login',
            severity: 'info',
            userId: user.id,
            sessionId: session.id,
            resource: 'authentication',
            action: 'login_success',
            result: 'success',
            details: {},
            ipAddress: options.ipAddress || '127.0.0.1',
            userAgent: options.userAgent || 'unknown'
        });
        console.log(`User authenticated: ${username}`);
        return session;
    }
    validateSession(sessionToken) {
        const session = Array.from(this.sessions.values())
            .find(s => s.token === sessionToken);
        if (!session || !session.isActive) {
            return null;
        }
        if (session.expiresAt < new Date()) {
            this.invalidateSession(session.id);
            return null;
        }
        // Update last activity
        session.lastActivity = new Date();
        return session;
    }
    invalidateSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.isActive = false;
            this.sessions.delete(sessionId);
            this.logSecurityEvent({
                type: 'logout',
                severity: 'info',
                userId: session.userId,
                sessionId: session.id,
                resource: 'authentication',
                action: 'logout',
                result: 'success',
                details: {},
                ipAddress: session.ipAddress,
                userAgent: session.userAgent
            });
        }
    }
    // Access Control
    checkPermission(userId, resource, action) {
        const user = this.users.get(userId);
        if (!user)
            return false;
        // Check if user has direct permission
        if (user.permissions.includes(`${resource}:${action}`) || user.permissions.includes('*')) {
            return true;
        }
        // Check role-based permissions
        for (const role of user.roles) {
            const accessControl = this.findMatchingAccessControl(resource, role);
            if (accessControl && this.checkAccessControl(accessControl, user, resource, action)) {
                return true;
            }
        }
        this.emit('accessDenied', {
            userId,
            resource,
            action,
            reason: 'insufficient_permissions'
        });
        return false;
    }
    findMatchingAccessControl(resource, role) {
        for (const [key, ac] of this.accessControls) {
            if (ac.roles.includes(role) && this.matchesResourcePattern(resource, ac.resource)) {
                return ac;
            }
        }
        return null;
    }
    matchesResourcePattern(resource, pattern) {
        if (pattern === '*')
            return true;
        // Convert glob pattern to regex
        const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        return new RegExp(`^${regexPattern}$`).test(resource);
    }
    checkAccessControl(ac, user, resource, action) {
        // Check if action is permitted
        if (!ac.permissions.includes(action) && !ac.permissions.includes('*')) {
            return false;
        }
        // Check conditions
        for (const condition of ac.conditions) {
            if (!this.evaluateCondition(condition, user, resource)) {
                return false;
            }
        }
        return true;
    }
    evaluateCondition(condition, user, resource) {
        switch (condition.type) {
            case 'time':
                return this.evaluateTimeCondition(condition);
            case 'location':
                return this.evaluateLocationCondition(condition, user);
            case 'device':
                return this.evaluateDeviceCondition(condition, user);
            case 'network':
                return this.evaluateNetworkCondition(condition, user);
            case 'attribute':
                return this.evaluateAttributeCondition(condition, user, resource);
            default:
                return false;
        }
    }
    // Encryption and Decryption
    encrypt(data, keyId = 'master') {
        const key = this.encryptionKeys.get(keyId);
        if (!key) {
            throw new Error(`Encryption key not found: ${keyId}`);
        }
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key.key, iv);
        const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
        let encrypted = cipher.update(dataBuffer, undefined, 'hex');
        encrypted += cipher.final('hex');
        const result = {
            encrypted,
            iv: iv.toString('hex')
        };
        this.metrics.encryptedData++;
        return result;
    }
    decrypt(encryptedData, keyId = 'master') {
        const key = this.encryptionKeys.get(keyId);
        if (!key) {
            throw new Error(`Decryption key not found: ${keyId}`);
        }
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key.key, iv);
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    sign(data, keyId = 'signing') {
        const key = this.encryptionKeys.get(keyId);
        if (!key) {
            throw new Error(`Signing key not found: ${keyId}`);
        }
        const hmac = crypto.createHmac('sha256', key.key);
        hmac.update(data);
        return hmac.digest('hex');
    }
    verifySignature(data, signature, keyId = 'signing') {
        const expectedSignature = this.sign(data, keyId);
        return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    }
    // Security Monitoring
    startSecurityMonitoring() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        // Session cleanup
        this.sessionCleanupInterval = setInterval(() => {
            this.cleanupExpiredSessions();
        }, 300000); // Every 5 minutes
        // Threat scanning
        this.threatScanInterval = setInterval(() => {
            this.scanForThreats();
        }, 60000); // Every minute
        // Metrics update
        this.metricsInterval = setInterval(() => {
            this.updateMetrics();
            this.calculateRiskLevel();
        }, 30000); // Every 30 seconds
        console.log('G3D Security Manager monitoring started');
        this.emit('monitoringStarted');
    }
    stopSecurityMonitoring() {
        if (!this.isRunning)
            return;
        this.isRunning = false;
        if (this.sessionCleanupInterval) {
            clearInterval(this.sessionCleanupInterval);
            this.sessionCleanupInterval = null;
        }
        if (this.threatScanInterval) {
            clearInterval(this.threatScanInterval);
            this.threatScanInterval = null;
        }
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }
        console.log('G3D Security Manager monitoring stopped');
        this.emit('monitoringStopped');
    }
    // Policy Management
    createPolicy(policyData) {
        const policyId = this.generatePolicyId();
        const policy = {
            id: policyId,
            name: policyData.name || 'Unnamed Policy',
            description: policyData.description || '',
            level: policyData.level || 'medium',
            rules: policyData.rules || [],
            enforcement: policyData.enforcement || 'advisory',
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };
        this.policies.set(policyId, policy);
        console.log(`Security policy created: ${policy.name}`);
        return policyId;
    }
    evaluatePolicy(policyId, context) {
        const policy = this.policies.get(policyId);
        if (!policy || !policy.isActive)
            return true;
        for (const rule of policy.rules) {
            if (!this.evaluateRule(rule, context)) {
                this.emit('policyViolation', {
                    policyId,
                    ruleId: rule.id,
                    context,
                    enforcement: policy.enforcement
                });
                if (policy.enforcement === 'blocking') {
                    return false;
                }
            }
        }
        return true;
    }
    // Event Handlers
    handleLoginAttempt(event) {
        console.log('Login attempt:', event);
        this.metrics.failedLogins++;
    }
    handleAccessDenied(event) {
        console.warn('Access denied:', event);
        this.logSecurityEvent({
            type: 'access_denied',
            severity: 'warning',
            userId: event.userId,
            resource: event.resource,
            action: event.action,
            result: 'blocked',
            details: { reason: event.reason },
            ipAddress: '127.0.0.1',
            userAgent: 'unknown'
        });
    }
    handleThreatDetected(event) {
        console.error('Threat detected:', event);
        this.metrics.threatsDetected++;
        this.logSecurityEvent({
            type: 'intrusion',
            severity: 'critical',
            resource: 'threat_detection',
            action: 'threat_detected',
            result: 'blocked',
            details: event,
            ipAddress: event.ipAddress || '127.0.0.1',
            userAgent: event.userAgent || 'unknown'
        });
    }
    handlePolicyViolation(event) {
        console.warn('Policy violation:', event);
        this.logSecurityEvent({
            type: 'policy_violation',
            severity: 'warning',
            resource: 'policy_enforcement',
            action: 'policy_violation',
            result: event.enforcement === 'blocking' ? 'blocked' : 'failure',
            details: event,
            ipAddress: '127.0.0.1',
            userAgent: 'unknown'
        });
    }
    handleDataAccess(event) {
        // Log data access for audit purposes
        this.logSecurityEvent({
            type: 'access_denied',
            severity: 'info',
            userId: event.userId,
            resource: event.resource,
            action: event.action,
            result: 'success',
            details: event.details,
            ipAddress: event.ipAddress || '127.0.0.1',
            userAgent: event.userAgent || 'unknown'
        });
    }
    // Utility Methods
    createSession(user, options) {
        const sessionId = this.generateSessionId();
        const token = this.generateToken();
        const refreshToken = this.generateToken();
        const session = {
            id: sessionId,
            userId: user.id,
            token,
            refreshToken,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + this.defaultSessionTimeout),
            lastActivity: new Date(),
            ipAddress: options.ipAddress || '127.0.0.1',
            userAgent: options.userAgent || 'unknown',
            isActive: true,
            permissions: [...user.permissions]
        };
        this.sessions.set(sessionId, session);
        this.updateMetrics();
        return session;
    }
    async hashPassword(password) {
        const salt = crypto.randomBytes(16);
        const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
        return `${salt.toString('hex')}:${hash.toString('hex')}`;
    }
    async verifyPassword(password, hash) {
        const [salt, storedHash] = hash.split(':');
        const computedHash = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 64, 'sha512');
        return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), computedHash);
    }
    validatePassword(password) {
        const policy = Array.from(this.policies.values())
            .find(p => p.name === 'Password Policy');
        if (!policy)
            return password.length >= 8;
        const rule = policy.rules.find(r => r.condition === 'password_strength');
        if (!rule)
            return password.length >= 8;
        const params = rule.parameters;
        if (password.length < params.minLength)
            return false;
        if (params.requireUppercase && !/[A-Z]/.test(password))
            return false;
        if (params.requireLowercase && !/[a-z]/.test(password))
            return false;
        if (params.requireNumbers && !/\d/.test(password))
            return false;
        if (params.requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password))
            return false;
        return true;
    }
    verifyMFA(userId, token) {
        // Simplified MFA verification
        // In real implementation, this would verify TOTP, SMS, etc.
        return token === '123456';
    }
    generateEncryptionKey(algorithm, usage) {
        let keySize = 32; // Default 256 bits
        if (algorithm.includes('128'))
            keySize = 16;
        if (algorithm.includes('192'))
            keySize = 24;
        if (algorithm.includes('256'))
            keySize = 32;
        return {
            id: this.generateKeyId(),
            algorithm,
            keySize,
            key: crypto.randomBytes(keySize),
            iv: crypto.randomBytes(16),
            salt: crypto.randomBytes(16),
            createdAt: new Date(),
            usage,
            isActive: true
        };
    }
    cleanupExpiredSessions() {
        const now = new Date();
        let cleanedCount = 0;
        for (const [sessionId, session] of this.sessions) {
            if (session.expiresAt < now || !session.isActive) {
                this.sessions.delete(sessionId);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} expired sessions`);
            this.updateMetrics();
        }
    }
    scanForThreats() {
        // Simplified threat scanning
        // In real implementation, this would scan for various threats
        const recentEvents = this.events.slice(-100);
        // Check for brute force attacks
        const failedLogins = recentEvents.filter(e => e.type === 'login' &&
            e.result === 'failure' &&
            Date.now() - e.timestamp.getTime() < 300000 // Last 5 minutes
        );
        if (failedLogins.length > 10) {
            this.emit('threatDetected', {
                type: 'brute_force',
                severity: 'high',
                details: { failedAttempts: failedLogins.length }
            });
        }
    }
    updateMetrics() {
        this.metrics = {
            totalUsers: this.users.size,
            activeSessions: Array.from(this.sessions.values()).filter(s => s.isActive).length,
            failedLogins: this.events.filter(e => e.type === 'login' && e.result === 'failure').length,
            blockedAttempts: this.events.filter(e => e.result === 'blocked').length,
            securityEvents: this.events.length,
            threatsDetected: this.events.filter(e => e.type === 'intrusion').length,
            encryptedData: this.metrics.encryptedData,
            complianceScore: this.calculateComplianceScore(),
            riskLevel: this.calculateRiskLevel()
        };
        this.emit('metricsUpdated', this.metrics);
    }
    calculateComplianceScore() {
        let score = 100;
        // Deduct points for policy violations
        const violations = this.events.filter(e => e.type === 'policy_violation').length;
        score -= Math.min(violations * 2, 50);
        // Deduct points for failed security events
        const failures = this.events.filter(e => e.result === 'failure').length;
        score -= Math.min(failures, 30);
        return Math.max(score, 0);
    }
    calculateRiskLevel() {
        let risk = 0;
        // Add risk for threats
        risk += this.metrics.threatsDetected * 10;
        // Add risk for failed logins
        risk += this.metrics.failedLogins * 2;
        // Add risk for policy violations
        const violations = this.events.filter(e => e.type === 'policy_violation').length;
        risk += violations * 5;
        return Math.min(risk, 100);
    }
    evaluateRule(rule, context) {
        // Simplified rule evaluation
        // In real implementation, this would be more sophisticated
        return true;
    }
    evaluateTimeCondition(condition) {
        // Time-based access control
        return true;
    }
    evaluateLocationCondition(condition, user) {
        // Location-based access control
        return true;
    }
    evaluateDeviceCondition(condition, user) {
        // Device-based access control
        return true;
    }
    evaluateNetworkCondition(condition, user) {
        // Network-based access control
        return true;
    }
    evaluateAttributeCondition(condition, user, resource) {
        // Attribute-based access control
        return true;
    }
    logSecurityEvent(eventData) {
        const event = {
            id: this.generateEventId(),
            type: eventData.type || 'access_denied',
            severity: eventData.severity || 'info',
            userId: eventData.userId,
            sessionId: eventData.sessionId,
            resource: eventData.resource || 'unknown',
            action: eventData.action || 'unknown',
            result: eventData.result || 'failure',
            timestamp: new Date(),
            details: eventData.details || {},
            ipAddress: eventData.ipAddress || '127.0.0.1',
            userAgent: eventData.userAgent || 'unknown'
        };
        this.events.push(event);
        // Keep only last 10000 events
        if (this.events.length > 10000) {
            this.events = this.events.slice(-10000);
        }
        this.emit('securityEvent', event);
    }
    // Utility Functions
    generateUserId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generatePolicyId() {
        return `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateKeyId() {
        return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    // Public API
    getSecurityStatus() {
        const threatLevel = this.metrics.riskLevel < 25 ? 'low' :
            this.metrics.riskLevel < 50 ? 'medium' :
                this.metrics.riskLevel < 75 ? 'high' : 'critical';
        return {
            metrics: this.metrics,
            activeUsers: Array.from(this.users.values()).filter(u => !u.isLocked).length,
            activeSessions: this.metrics.activeSessions,
            recentEvents: this.events.filter(e => Date.now() - e.timestamp.getTime() < 3600000).length,
            threatLevel
        };
    }
    getUser(userId) {
        return this.users.get(userId) || null;
    }
    getSecurityEvents(limit = 100) {
        return this.events.slice(-limit);
    }
    rotateKeys() {
        // Rotate encryption keys
        for (const [keyId, key] of this.encryptionKeys) {
            if (key.isActive && Date.now() - key.createdAt.getTime() > 2592000000) { // 30 days
                const newKey = this.generateEncryptionKey(key.algorithm, key.usage);
                this.encryptionKeys.set(keyId, newKey);
                console.log(`Encryption key rotated: ${keyId}`);
            }
        }
    }
    setAccessControl(resource, accessControl) {
        this.accessControls.set(resource, accessControl);
        console.log(`Access control set for resource: ${resource}`);
    }
}
