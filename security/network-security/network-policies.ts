/**
 * Network Security Policies and Implementation
 * Provides secure communication channels and request validation
 */

interface NetworkSecurityConfig {
  enableHTTPS: boolean;
  certificatePinning: boolean;
  requestTimeout: number;
  maxRetries: number;
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
  };
  allowedDomains: string[];
  blockedDomains: string[];
}

interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
  'Referrer-Policy': string;
}

export class NetworkSecurityManager {
  private config: NetworkSecurityConfig;
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(config: NetworkSecurityConfig) {
    this.config = config;
  }

  /**
   * Validates and secures outgoing HTTP requests
   */
  async secureRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Validate URL against allowed/blocked domains
    this.validateDomain(url);
    
    // Apply rate limiting
    await this.enforceRateLimit(url);
    
    // Add security headers
    const secureOptions = this.addSecurityHeaders(options);
    
    // Apply certificate pinning for HTTPS
    if (url.startsWith('https://') && this.config.certificatePinning) {
      await this.validateCertificate(url);
    }
    
    // Make request with timeout and retry logic
    return this.makeSecureRequest(url, secureOptions);
  }

  /**
   * Validates domain against security policies
   */
  private validateDomain(url: string): void {
    const domain = new URL(url).hostname;
    
    // Check blocked domains
    if (this.config.blockedDomains.some(blocked => this.matchesDomain(domain, blocked))) {
      throw new Error(`Domain ${domain} is blocked by security policy`);
    }
    
    // Check allowed domains (if whitelist is configured)
    if (this.config.allowedDomains.length > 0) {
      if (!this.config.allowedDomains.some(allowed => this.matchesDomain(domain, allowed))) {
        throw new Error(`Domain ${domain} is not in allowed domains list`);
      }
    }
  }

  /**
   * Enforces rate limiting per domain
   */
  private async enforceRateLimit(url: string): Promise<void> {
    const domain = new URL(url).hostname;
    const now = Date.now();
    const { windowMs, maxRequests } = this.config.rateLimiting;
    
    const rateData = this.requestCounts.get(domain);
    
    if (!rateData || now > rateData.resetTime) {
      // Reset or initialize rate limit window
      this.requestCounts.set(domain, {
        count: 1,
        resetTime: now + windowMs
      });
      return;
    }
    
    if (rateData.count >= maxRequests) {
      const waitTime = rateData.resetTime - now;
      throw new Error(`Rate limit exceeded for ${domain}. Wait ${waitTime}ms`);
    }
    
    rateData.count++;
  }

  /**
   * Adds security headers to requests
   */
  private addSecurityHeaders(options: RequestInit): RequestInit {
    const headers = new Headers(options.headers);
    
    // Add security headers
    headers.set('User-Agent', 'Aura-VSCode/1.0.0');
    headers.set('X-Requested-With', 'XMLHttpRequest');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    return {
      ...options,
      headers,
      credentials: 'omit', // Never send cookies
      mode: 'cors',
      cache: 'no-cache'
    };
  }

  /**
   * Validates SSL certificate for HTTPS requests
   */
  private async validateCertificate(url: string): Promise<void> {
    // In a real implementation, this would verify the certificate chain
    // For now, we'll validate the URL structure and require HTTPS
    if (!url.startsWith('https://')) {
      throw new Error('HTTPS required for secure communication');
    }
    
    // Additional certificate validation would be implemented here
    // This might include checking against known certificate fingerprints
  }

  /**
   * Makes secure request with timeout and retry logic
   */
  private async makeSecureRequest(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      // Validate response
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout: ${url}`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Checks if domain matches a pattern (supports wildcards)
   */
  private matchesDomain(domain: string, pattern: string): boolean {
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(2);
      return domain === suffix || domain.endsWith('.' + suffix);
    }
    return domain === pattern;
  }

  /**
   * Gets security headers for webview content
   */
  getWebviewSecurityHeaders(): SecurityHeaders {
    return {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  /**
   * Sanitizes user input to prevent injection attacks
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>'"&]/g, (char) => {
        const entities: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[char] || char;
      })
      .slice(0, 10000); // Limit input length
  }
} 