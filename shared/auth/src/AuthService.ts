/**
 * G3D Unified Authentication Service
 * Shared across all 24 AI services
 */

import {
    User,
    AuthRequest,
    AuthResponse,
    AuthTokens,
    MFASetup,
    MFAChallenge,
    MFAVerification,
    MFAType,
    UserSession,
    Organization,
    AuthError,
    AuthErrorCode,
    SecurityEvent,
    SecurityEventMetadata,
    AuditLog,
    DeviceInfo,
    GeoLocation
} from './types';

export class AuthService {
    private apiUrl: string;
    private serviceId: string;
    private tokenStorage: TokenStorage;
    private sessionManager: SessionManager;
    private securityLogger: SecurityLogger;

    constructor(config: AuthConfig) {
        this.apiUrl = config.apiUrl || 'https://auth.g3d.ai';
        this.serviceId = config.serviceId;
        this.tokenStorage = new TokenStorage(config.storage);
        this.sessionManager = new SessionManager(config.session);
        this.securityLogger = new SecurityLogger(config.logging);
    }

    // Authentication Methods
    async login(request: AuthRequest): Promise<AuthResponse> {
        try {
            const response = await this.makeRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    ...request,
                    serviceId: this.serviceId,
                    deviceInfo: await this.getDeviceInfo()
                })
            });

            if (response.success && response.tokens) {
                await this.tokenStorage.store(response.tokens);
                await this.sessionManager.create(response.user!, response.tokens);

                // Log successful login
                await this.securityLogger.log({
                    type: 'login_success',
                    severity: 'low',
                    userId: response.user!.id,
                    description: `User logged in successfully`,
                    metadata: {
                        ipAddress: await this.getClientIP(),
                        userAgent: navigator.userAgent,
                        deviceInfo: await this.getDeviceInfo()
                    }
                });
            }

            return response;
        } catch (error) {
            await this.securityLogger.log({
                type: 'login_failure',
                severity: 'medium',
                description: `Login attempt failed: ${error.message}`,
                metadata: {
                    ipAddress: await this.getClientIP(),
                    userAgent: navigator.userAgent,
                    additionalContext: { email: request.email }
                }
            });

            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            const tokens = await this.tokenStorage.get();
            if (tokens) {
                await this.makeRequest('/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${tokens.accessToken}`
                    }
                });
            }
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            await this.tokenStorage.clear();
            await this.sessionManager.destroy();
        }
    }

    async register(userData: RegisterRequest): Promise<AuthResponse> {
        const response = await this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                ...userData,
                serviceId: this.serviceId,
                deviceInfo: await this.getDeviceInfo()
            })
        });

        if (response.success && response.tokens) {
            await this.tokenStorage.store(response.tokens);
            await this.sessionManager.create(response.user!, response.tokens);
        }

        return response;
    }

    async refreshToken(): Promise<AuthTokens> {
        const tokens = await this.tokenStorage.get();
        if (!tokens?.refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await this.makeRequest('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({
                refreshToken: tokens.refreshToken,
                serviceId: this.serviceId
            })
        });

        if (response.tokens) {
            await this.tokenStorage.store(response.tokens);
            return response.tokens;
        }

        throw new Error('Token refresh failed');
    }

    async verifyToken(): Promise<User | null> {
        const tokens = await this.tokenStorage.get();
        if (!tokens?.accessToken) {
            return null;
        }

        try {
            const response = await this.makeRequest('/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${tokens.accessToken}`
                }
            });

            return response.user || null;
        } catch (error) {
            // Token might be expired, try to refresh
            try {
                await this.refreshToken();
                return this.verifyToken();
            } catch (refreshError) {
                await this.logout();
                return null;
            }
        }
    }

    // Multi-Factor Authentication
    async setupMFA(type: MFAType): Promise<MFASetup> {
        const tokens = await this.requireAuth();

        const response = await this.makeRequest('/auth/mfa/setup', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokens.accessToken}`
            },
            body: JSON.stringify({ type })
        });

        return response.mfaSetup;
    }

    async verifyMFA(verification: MFAVerification): Promise<AuthResponse> {
        const response = await this.makeRequest('/auth/mfa/verify', {
            method: 'POST',
            body: JSON.stringify({
                ...verification,
                deviceInfo: await this.getDeviceInfo()
            })
        });

        if (response.success && response.tokens) {
            await this.tokenStorage.store(response.tokens);
            await this.sessionManager.create(response.user!, response.tokens);
        }

        return response;
    }

    async disableMFA(mfaId: string): Promise<void> {
        const tokens = await this.requireAuth();

        await this.makeRequest(`/auth/mfa/${mfaId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${tokens.accessToken}`
            }
        });
    }

    // Session Management
    async getCurrentSession(): Promise<UserSession | null> {
        return this.sessionManager.getCurrent();
    }

    async getSessions(): Promise<UserSession[]> {
        const tokens = await this.requireAuth();

        const response = await this.makeRequest('/auth/sessions', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokens.accessToken}`
            }
        });

        return response.sessions;
    }

    async revokeSession(sessionId: string): Promise<void> {
        const tokens = await this.requireAuth();

        await this.makeRequest(`/auth/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${tokens.accessToken}`
            }
        });
    }

    // User Management
    async getCurrentUser(): Promise<User | null> {
        const tokens = await this.tokenStorage.get();
        if (!tokens) return null;

        try {
            const response = await this.makeRequest('/auth/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${tokens.accessToken}`
                }
            });

            return response.user;
        } catch (error) {
            return null;
        }
    }

    async updateUser(updates: Partial<User>): Promise<User> {
        const tokens = await this.requireAuth();

        const response = await this.makeRequest('/auth/user', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${tokens.accessToken}`
            },
            body: JSON.stringify(updates)
        });

        return response.user;
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        const tokens = await this.requireAuth();

        await this.makeRequest('/auth/password', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokens.accessToken}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        // Log password change
        await this.securityLogger.log({
            type: 'password_change',
            severity: 'medium',
            description: 'User changed password',
            metadata: {
                ipAddress: await this.getClientIP(),
                userAgent: navigator.userAgent
            }
        });
    }

    async requestPasswordReset(email: string): Promise<void> {
        await this.makeRequest('/auth/password/reset', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        await this.makeRequest('/auth/password/reset/confirm', {
            method: 'POST',
            body: JSON.stringify({
                token,
                newPassword
            })
        });
    }

    // Organization Management
    async getOrganizations(): Promise<Organization[]> {
        const tokens = await this.requireAuth();

        const response = await this.makeRequest('/auth/organizations', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokens.accessToken}`
            }
        });

        return response.organizations;
    }

    async switchOrganization(organizationId: string): Promise<AuthTokens> {
        const tokens = await this.requireAuth();

        const response = await this.makeRequest('/auth/organizations/switch', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokens.accessToken}`
            },
            body: JSON.stringify({ organizationId })
        });

        await this.tokenStorage.store(response.tokens);
        return response.tokens;
    }

    // Utility Methods
    private async requireAuth(): Promise<AuthTokens> {
        const tokens = await this.tokenStorage.get();
        if (!tokens) {
            const error: AuthError = {
                code: 'TOKEN_INVALID',
                message: 'Authentication required',
                timestamp: new Date()
            };
            throw error;
        }
        return tokens;
    }

    private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
        const url = `${this.apiUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-Service-ID': this.serviceId,
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const error: AuthError = {
                code: data.code || 'UNKNOWN_ERROR',
                message: data.message || 'Request failed',
                details: data.details,
                timestamp: new Date()
            };
            throw error;
        }

        return data;
    }

    private async getDeviceInfo(): Promise<DeviceInfo> {
        return {
            userAgent: navigator.userAgent,
            ipAddress: await this.getClientIP(),
            deviceId: await this.getDeviceId(),
            platform: navigator.platform,
            browser: this.getBrowserInfo(),
            location: await this.getLocation()
        };
    }

    private async getClientIP(): Promise<string> {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    private async getDeviceId(): Promise<string> {
        // Generate a consistent device ID based on browser fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx!.textBaseline = 'top';
        ctx!.font = '14px Arial';
        ctx!.fillText('Device fingerprint', 2, 2);

        const fingerprint = canvas.toDataURL();
        const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprint));
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    private getBrowserInfo(): string {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    private async getLocation(): Promise<GeoLocation | undefined> {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            return {
                country: data.country_name,
                region: data.region,
                city: data.city,
                latitude: data.latitude,
                longitude: data.longitude
            };
        } catch (error) {
            return undefined;
        }
    }
}

// Token Storage
class TokenStorage {
    private storage: Storage;
    private key = 'g3d_auth_tokens';

    constructor(config: StorageConfig) {
        this.storage = config.type === 'session' ? sessionStorage : localStorage;
    }

    async store(tokens: AuthTokens): Promise<void> {
        const encrypted = await this.encrypt(JSON.stringify(tokens));
        this.storage.setItem(this.key, encrypted);
    }

    async get(): Promise<AuthTokens | null> {
        const encrypted = this.storage.getItem(this.key);
        if (!encrypted) return null;

        try {
            const decrypted = await this.decrypt(encrypted);
            return JSON.parse(decrypted);
        } catch (error) {
            await this.clear();
            return null;
        }
    }

    async clear(): Promise<void> {
        this.storage.removeItem(this.key);
    }

    private async encrypt(data: string): Promise<string> {
        // Simple base64 encoding for now - in production, use proper encryption
        return btoa(data);
    }

    private async decrypt(encrypted: string): Promise<string> {
        // Simple base64 decoding for now - in production, use proper decryption
        return atob(encrypted);
    }
}

// Session Manager
class SessionManager {
    private currentSession: UserSession | null = null;

    constructor(private config: SessionConfig) { }

    async create(user: User, tokens: AuthTokens): Promise<UserSession> {
        this.currentSession = {
            id: crypto.randomUUID(),
            userId: user.id,
            deviceInfo: await this.getDeviceInfo(),
            createdAt: new Date(),
            lastActivityAt: new Date(),
            expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
            status: 'active',
            services: [{
                serviceId: 'current',
                serviceName: 'Current Service',
                permissions: [],
                lastAccessAt: new Date(),
                accessCount: 1
            }]
        };

        return this.currentSession;
    }

    async getCurrent(): Promise<UserSession | null> {
        return this.currentSession;
    }

    async updateActivity(): Promise<void> {
        if (this.currentSession) {
            this.currentSession.lastActivityAt = new Date();
        }
    }

    async destroy(): Promise<void> {
        this.currentSession = null;
    }

    private async getDeviceInfo(): Promise<DeviceInfo> {
        return {
            userAgent: navigator.userAgent,
            ipAddress: 'unknown',
            deviceId: 'unknown',
            platform: navigator.platform,
            browser: 'unknown'
        };
    }
}

// Security Logger
class SecurityLogger {
    constructor(private config: LoggingConfig) { }

    async log(event: Omit<SecurityEvent, 'id' | 'createdAt' | 'resolved'>): Promise<void> {
        const securityEvent: SecurityEvent = {
            id: crypto.randomUUID(),
            ...event,
            resolved: false,
            createdAt: new Date()
        };

        // In production, send to logging service
        console.log('Security Event:', securityEvent);
    }
}

// Configuration Interfaces
export interface AuthConfig {
    apiUrl?: string;
    serviceId: string;
    storage: StorageConfig;
    session: SessionConfig;
    logging: LoggingConfig;
}

export interface StorageConfig {
    type: 'local' | 'session';
    encrypt?: boolean;
}

export interface SessionConfig {
    timeout: number; // minutes
    renewThreshold: number; // minutes before expiry to renew
}

export interface LoggingConfig {
    endpoint?: string;
    level: 'debug' | 'info' | 'warn' | 'error';
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
    acceptTerms: boolean;
}

// Export the service
export default AuthService;