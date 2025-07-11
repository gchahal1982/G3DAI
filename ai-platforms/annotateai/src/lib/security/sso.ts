export interface SSOConfiguration {
  id: string;
  organizationId: string;
  name: string;
  type: 'saml' | 'oidc' | 'oauth2' | 'ldap' | 'azure_ad' | 'google_workspace' | 'okta';
  enabled: boolean;
  defaultDomain?: string;
  autoProvisioning: boolean;
  roleMapping: Record<string, string>;
  attributeMapping: Record<string, string>;
  config: SAMLConfig | OIDCConfig | OAuth2Config | LDAPConfig;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  metadata?: Record<string, any>;
}

export interface SAMLConfig {
  entityId: string;
  ssoUrl: string;
  sloUrl?: string;
  x509Certificate: string;
  signatureAlgorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digestAlgorithm: 'SHA1' | 'SHA256' | 'SHA512';
  nameIdFormat: 'email' | 'persistent' | 'transient' | 'unspecified';
  wantAssertionsSigned: boolean;
  wantResponseSigned: boolean;
  requestSigningCert?: string;
  requestSigningKey?: string;
  relayState?: string;
  attributeConsumingService?: {
    serviceName: string;
    attributes: Array<{
      name: string;
      required: boolean;
      friendlyName?: string;
    }>;
  };
}

export interface OIDCConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  discoveryUrl?: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  jwksUrl: string;
  scopes: string[];
  responseType: 'code' | 'id_token' | 'token' | 'code id_token' | 'code token' | 'id_token token' | 'code id_token token';
  responseMode: 'query' | 'fragment' | 'form_post';
  prompt?: 'none' | 'login' | 'consent' | 'select_account';
  maxAge?: number;
  extraParams?: Record<string, string>;
}

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
  redirectUri: string;
  state?: string;
  pkce: boolean;
  extraParams?: Record<string, string>;
}

export interface LDAPConfig {
  host: string;
  port: number;
  secure: boolean;
  baseDN: string;
  bindDN: string;
  bindPassword: string;
  userFilter: string;
  userAttributes: string[];
  groupFilter?: string;
  groupAttributes?: string[];
  timeout: number;
  reconnect: boolean;
}

export interface SSOSession {
  id: string;
  userId: string;
  organizationId: string;
  ssoConfigId: string;
  sessionIndex?: string;
  nameId?: string;
  attributes: Record<string, any>;
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  active: boolean;
}

export interface MFAConfiguration {
  enabled: boolean;
  required: boolean;
  methods: ('totp' | 'sms' | 'email' | 'backup_codes' | 'hardware_key')[];
  totpIssuer: string;
  smsProvider?: 'twilio' | 'aws_sns' | 'messagebird';
  backupCodesCount: number;
  sessionDuration: number;
  rememberDevice: boolean;
  deviceRememberDuration: number;
}

export interface SecurityHeaders {
  strictTransportSecurity: boolean;
  contentSecurityPolicy: string;
  xFrameOptions: string;
  xContentTypeOptions: boolean;
  referrerPolicy: string;
  permissionsPolicy: string;
  crossOriginEmbedderPolicy: string;
  crossOriginOpenerPolicy: string;
  crossOriginResourcePolicy: string;
}

export class SSOManager {
  private configurations: Map<string, SSOConfiguration> = new Map();
  private activeSessions: Map<string, SSOSession> = new Map();
  private mfaConfig: MFAConfiguration;
  private securityConfig: SecurityHeaders;

  constructor() {
    this.initializeMFAConfig();
    this.initializeSecurityHeaders();
  }

  private initializeMFAConfig(): void {
    this.mfaConfig = {
      enabled: true,
      required: false,
      methods: ['totp', 'backup_codes'],
      totpIssuer: 'AnnotateAI',
      backupCodesCount: 8,
      sessionDuration: 3600, // 1 hour
      rememberDevice: true,
      deviceRememberDuration: 2592000 // 30 days
    };
  }

  private initializeSecurityHeaders(): void {
    this.securityConfig = {
      strictTransportSecurity: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' wss: https:; frame-ancestors 'none';",
      xFrameOptions: "DENY",
      xContentTypeOptions: true,
      referrerPolicy: "strict-origin-when-cross-origin",
      permissionsPolicy: "camera=(), microphone=(), geolocation=()",
      crossOriginEmbedderPolicy: "require-corp",
      crossOriginOpenerPolicy: "same-origin",
      crossOriginResourcePolicy: "same-origin"
    };
  }

  // SSO Configuration Management
  public async createSSOConfiguration(config: Omit<SSOConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const configId = this.generateId();
    const ssoConfig: SSOConfiguration = {
      id: configId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...config
    };

    // Validate configuration
    await this.validateSSOConfiguration(ssoConfig);
    
    // Test connectivity
    await this.testSSOConnection(ssoConfig);

    this.configurations.set(configId, ssoConfig);
    await this.storeSSOConfiguration(ssoConfig);

    return configId;
  }

  public async updateSSOConfiguration(configId: string, updates: Partial<SSOConfiguration>): Promise<void> {
    const config = this.configurations.get(configId);
    if (!config) {
      throw new Error('SSO configuration not found');
    }

    const updatedConfig = {
      ...config,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.validateSSOConfiguration(updatedConfig);
    
    this.configurations.set(configId, updatedConfig);
    await this.storeSSOConfiguration(updatedConfig);
  }

  public async deleteSSOConfiguration(configId: string): Promise<void> {
    const config = this.configurations.get(configId);
    if (!config) {
      throw new Error('SSO configuration not found');
    }

    // Invalidate all sessions using this configuration
    await this.invalidateConfigurationSessions(configId);
    
    this.configurations.delete(configId);
    await this.removeSSOConfiguration(configId);
  }

  // SAML Authentication
  public async initiateSAMLAuth(configId: string, relayState?: string): Promise<string> {
    const config = this.configurations.get(configId);
    if (!config || config.type !== 'saml') {
      throw new Error('Invalid SAML configuration');
    }

    const samlConfig = config.config as SAMLConfig;
    const requestId = this.generateId();
    const timestamp = new Date().toISOString();

    const authnRequest = this.buildSAMLAuthnRequest({
      id: requestId,
      timestamp,
      destination: samlConfig.ssoUrl,
      entityId: samlConfig.entityId,
      nameIdFormat: samlConfig.nameIdFormat,
      relayState: relayState || samlConfig.relayState
    });

    // Sign request if certificate provided
    if (samlConfig.requestSigningCert && samlConfig.requestSigningKey) {
      return this.signSAMLRequest(authnRequest, samlConfig);
    }

    return authnRequest;
  }

  public async processSAMLResponse(response: string, configId: string): Promise<SSOSession> {
    const config = this.configurations.get(configId);
    if (!config || config.type !== 'saml') {
      throw new Error('Invalid SAML configuration');
    }

    const samlConfig = config.config as SAMLConfig;
    
    // Validate and parse SAML response
    const parsedResponse = await this.parseSAMLResponse(response);
    await this.validateSAMLSignature(parsedResponse, samlConfig);
    
    const userAttributes = this.extractSAMLAttributes(parsedResponse);
    const user = await this.provisionUser(userAttributes, config);
    
    return this.createSSOSession({
      userId: user.id,
      organizationId: config.organizationId,
      ssoConfigId: configId,
      sessionIndex: parsedResponse.sessionIndex,
      nameId: parsedResponse.nameId,
      attributes: userAttributes,
      ipAddress: '0.0.0.0', // Should be set from request
      userAgent: 'Unknown' // Should be set from request
    });
  }

  // OIDC Authentication
  public async initiateOIDCAuth(configId: string, state?: string): Promise<string> {
    const config = this.configurations.get(configId);
    if (!config || config.type !== 'oidc') {
      throw new Error('Invalid OIDC configuration');
    }

    const oidcConfig = config.config as OIDCConfig;
    const nonce = this.generateNonce();
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    // Store PKCE parameters for verification
    await this.storePKCEChallenge(state || this.generateId(), {
      codeVerifier,
      codeChallenge,
      nonce
    });

    const authUrl = new URL(oidcConfig.authorizationUrl);
    authUrl.searchParams.append('client_id', oidcConfig.clientId);
    authUrl.searchParams.append('response_type', oidcConfig.responseType);
    authUrl.searchParams.append('scope', oidcConfig.scopes.join(' '));
    authUrl.searchParams.append('redirect_uri', process.env.OIDC_REDIRECT_URI!);
    authUrl.searchParams.append('state', state || this.generateId());
    authUrl.searchParams.append('nonce', nonce);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    if (oidcConfig.prompt) {
      authUrl.searchParams.append('prompt', oidcConfig.prompt);
    }

    if (oidcConfig.maxAge) {
      authUrl.searchParams.append('max_age', oidcConfig.maxAge.toString());
    }

    // Add extra parameters
    if (oidcConfig.extraParams) {
      Object.entries(oidcConfig.extraParams).forEach(([key, value]) => {
        authUrl.searchParams.append(key, value);
      });
    }

    return authUrl.toString();
  }

  public async processOIDCCallback(code: string, state: string, configId: string): Promise<SSOSession> {
    const config = this.configurations.get(configId);
    if (!config || config.type !== 'oidc') {
      throw new Error('Invalid OIDC configuration');
    }

    const oidcConfig = config.config as OIDCConfig;
    const pkceData = await this.retrievePKCEChallenge(state);

    // Exchange code for tokens
    const tokenResponse = await this.exchangeOIDCCode(code, oidcConfig, pkceData.codeVerifier);
    
    // Validate ID token
    const idTokenPayload = await this.validateOIDCIdToken(tokenResponse.id_token, oidcConfig, pkceData.nonce);
    
    // Get user info
    const userInfo = await this.getOIDCUserInfo(tokenResponse.access_token, oidcConfig);
    
    const userAttributes = { ...idTokenPayload, ...userInfo };
    const user = await this.provisionUser(userAttributes, config);
    
    return this.createSSOSession({
      userId: user.id,
      organizationId: config.organizationId,
      ssoConfigId: configId,
      attributes: userAttributes,
      ipAddress: '0.0.0.0', // Should be set from request
      userAgent: 'Unknown' // Should be set from request
    });
  }

  // OAuth 2.0 Authentication
  public async initiateOAuth2Auth(configId: string, state?: string): Promise<string> {
    const config = this.configurations.get(configId);
    if (!config || config.type !== 'oauth2') {
      throw new Error('Invalid OAuth2 configuration');
    }

    const oauth2Config = config.config as OAuth2Config;
    const authState = state || this.generateId();
    let codeVerifier, codeChallenge;

    if (oauth2Config.pkce) {
      codeVerifier = this.generateCodeVerifier();
      codeChallenge = this.generateCodeChallenge(codeVerifier);
      
      await this.storePKCEChallenge(authState, { codeVerifier, codeChallenge });
    }

    const authUrl = new URL(oauth2Config.authorizationUrl);
    authUrl.searchParams.append('client_id', oauth2Config.clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', oauth2Config.scopes.join(' '));
    authUrl.searchParams.append('redirect_uri', oauth2Config.redirectUri);
    authUrl.searchParams.append('state', authState);

    if (oauth2Config.pkce) {
      authUrl.searchParams.append('code_challenge', codeChallenge!);
      authUrl.searchParams.append('code_challenge_method', 'S256');
    }

    if (oauth2Config.extraParams) {
      Object.entries(oauth2Config.extraParams).forEach(([key, value]) => {
        authUrl.searchParams.append(key, value);
      });
    }

    return authUrl.toString();
  }

  // Multi-Factor Authentication
  public async setupTOTP(userId: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    const secret = this.generateTOTPSecret();
    const qrCode = this.generateTOTPQRCode(userId, secret);
    const backupCodes = this.generateBackupCodes();

    await this.storeMFACredentials(userId, {
      type: 'totp',
      secret,
      backupCodes,
      createdAt: new Date().toISOString()
    });

    return { secret, qrCode, backupCodes };
  }

  public async verifyTOTP(userId: string, code: string): Promise<boolean> {
    const mfaCredentials = await this.getMFACredentials(userId, 'totp');
    if (!mfaCredentials) {
      return false;
    }

    // Verify TOTP code with time window tolerance
    return this.validateTOTPCode(code, mfaCredentials.secret);
  }

  public async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const mfaCredentials = await this.getMFACredentials(userId, 'totp');
    if (!mfaCredentials || !mfaCredentials.backupCodes) {
      return false;
    }

    const codeIndex = mfaCredentials.backupCodes.indexOf(code);
    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    mfaCredentials.backupCodes.splice(codeIndex, 1);
    await this.storeMFACredentials(userId, mfaCredentials);

    return true;
  }

  // Session Management
  public async createSSOSession(sessionData: Omit<SSOSession, 'id' | 'createdAt' | 'expiresAt' | 'lastActivity' | 'active'>): Promise<SSOSession> {
    const sessionId = this.generateId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // 8 hours

    const session: SSOSession = {
      id: sessionId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastActivity: now.toISOString(),
      active: true,
      ipAddress: '0.0.0.0', // Should be set from request
      userAgent: 'Unknown', // Should be set from request
      ...sessionData
    };

    this.activeSessions.set(sessionId, session);
    await this.storeSSOSession(session);

    return session;
  }

  public async validateSession(sessionId: string): Promise<SSOSession | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.active) {
      return null;
    }

    const now = new Date();
    if (now > new Date(session.expiresAt)) {
      await this.invalidateSession(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = now.toISOString();
    this.activeSessions.set(sessionId, session);
    await this.updateSessionActivity(sessionId, now.toISOString());

    return session;
  }

  public async invalidateSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.active = false;
      this.activeSessions.set(sessionId, session);
      await this.removeSSOSession(sessionId);
    }
  }

  public async invalidateAllUserSessions(userId: string): Promise<void> {
    const userSessions = Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId);

    for (const session of userSessions) {
      await this.invalidateSession(session.id);
    }
  }

  // Security Headers
  public getSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.securityConfig.strictTransportSecurity) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    headers['Content-Security-Policy'] = this.securityConfig.contentSecurityPolicy;
    headers['X-Frame-Options'] = this.securityConfig.xFrameOptions;
    headers['Referrer-Policy'] = this.securityConfig.referrerPolicy;
    headers['Permissions-Policy'] = this.securityConfig.permissionsPolicy;
    headers['Cross-Origin-Embedder-Policy'] = this.securityConfig.crossOriginEmbedderPolicy;
    headers['Cross-Origin-Opener-Policy'] = this.securityConfig.crossOriginOpenerPolicy;
    headers['Cross-Origin-Resource-Policy'] = this.securityConfig.crossOriginResourcePolicy;

    if (this.securityConfig.xContentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    return headers;
  }

  // Private helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private generateNonce(): string {
    return this.generateId();
  }

  private generateCodeVerifier(): string {
    // Generate PKCE code verifier
    const buffer = new Uint8Array(32);
    crypto.getRandomValues(buffer);
    return this.base64URLEncode(buffer);
  }

  private generateCodeChallenge(verifier: string): string {
    // Generate PKCE code challenge using SHA256
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    return crypto.subtle.digest('SHA-256', data).then(buffer => 
      this.base64URLEncode(new Uint8Array(buffer))
    ) as any; // Simplified for type safety
  }

  private base64URLEncode(buffer: Uint8Array): string {
    return btoa(String.fromCharCode(...buffer))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private generateTOTPSecret(): string {
    const buffer = new Uint8Array(20);
    crypto.getRandomValues(buffer);
    return this.base64URLEncode(buffer);
  }

  private generateTOTPQRCode(userId: string, secret: string): string {
    const issuer = encodeURIComponent(this.mfaConfig.totpIssuer);
    const label = encodeURIComponent(`${userId}@${issuer}`);
    return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`;
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.mfaConfig.backupCodesCount; i++) {
      codes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
    }
    return codes;
  }

  private validateTOTPCode(code: string, secret: string): boolean {
    // Simplified TOTP validation - in production use a proper TOTP library
    const window = Math.floor(Date.now() / 30000);
    for (let i = -1; i <= 1; i++) {
      const expectedCode = this.generateTOTPCode(secret, window + i);
      if (code === expectedCode) {
        return true;
      }
    }
    return false;
  }

  private generateTOTPCode(secret: string, window: number): string {
    // Simplified TOTP generation - use proper crypto library in production
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }

  // Placeholder methods for external integrations
  private async validateSSOConfiguration(config: SSOConfiguration): Promise<void> { }
  private async testSSOConnection(config: SSOConfiguration): Promise<void> { }
  private async storeSSOConfiguration(config: SSOConfiguration): Promise<void> { }
  private async removeSSOConfiguration(configId: string): Promise<void> { }
  private async invalidateConfigurationSessions(configId: string): Promise<void> { }
  private buildSAMLAuthnRequest(params: any): string { return ''; }
  private signSAMLRequest(request: string, config: SAMLConfig): string { return ''; }
  private async parseSAMLResponse(response: string): Promise<any> { return {}; }
  private async validateSAMLSignature(response: any, config: SAMLConfig): Promise<void> { }
  private extractSAMLAttributes(response: any): Record<string, any> { return {}; }
  private async provisionUser(attributes: Record<string, any>, config: SSOConfiguration): Promise<any> { return { id: 'user123' }; }
  private async storePKCEChallenge(state: string, data: any): Promise<void> { }
  private async retrievePKCEChallenge(state: string): Promise<any> { return {}; }
  private async exchangeOIDCCode(code: string, config: OIDCConfig, codeVerifier: string): Promise<any> { return {}; }
  private async validateOIDCIdToken(token: string, config: OIDCConfig, nonce: string): Promise<any> { return {}; }
  private async getOIDCUserInfo(accessToken: string, config: OIDCConfig): Promise<any> { return {}; }
  private async storeMFACredentials(userId: string, credentials: any): Promise<void> { }
  private async getMFACredentials(userId: string, type: string): Promise<any> { return null; }
  private async storeSSOSession(session: SSOSession): Promise<void> { }
  private async updateSessionActivity(sessionId: string, timestamp: string): Promise<void> { }
  private async removeSSOSession(sessionId: string): Promise<void> { }
}

// Factory function
export function createSSOManager(): SSOManager {
  return new SSOManager();
}

// Utility functions
export const ssoUtils = {
  extractDomainFromEmail: (email: string): string => {
    return email.split('@')[1]?.toLowerCase() || '';
  },

  validateSAMLResponse: (response: string): boolean => {
    // Basic SAML response validation
    return response.includes('<saml2:Assertion') && response.includes('</saml2:Assertion>');
  },

  parseJWT: (token: string): any => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  },

  isTokenExpired: (token: string): boolean => {
    const payload = ssoUtils.parseJWT(token);
    if (!payload || !payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  },

  generateSecureState: (): string => {
    const buffer = new Uint8Array(16);
    crypto.getRandomValues(buffer);
    return Array.from(buffer, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}; 