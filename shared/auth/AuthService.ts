// Shared Authentication Service for G3DAI platforms
export interface AuthCredentials {
  email: string;
  password: string;
  mfaToken?: string;
  rememberMe?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export class AuthService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config?: { baseUrl?: string; apiKey?: string }) {
    this.baseUrl = config?.baseUrl || process.env.NEXT_PUBLIC_API_URL || '/api';
    this.apiKey = config?.apiKey || process.env.API_KEY;
  }

  async login(credentials: AuthCredentials): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const authResponse: AuthResponse = await response.json();
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', authResponse.accessToken);
      localStorage.setItem('refresh_token', authResponse.refreshToken);

      return authResponse.user;
    } catch (error) {
      throw error;
    }
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    additionalData?: any;
  }): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const authResponse: AuthResponse = await response.json();
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', authResponse.accessToken);
      localStorage.setItem('refresh_token', authResponse.refreshToken);

      return authResponse.user;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove tokens from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        return null;
      }

      const response = await fetch(`${this.baseUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // If token is invalid, remove it
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return null;
      }

      const userData = await response.json();
      return userData.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        // If refresh token is invalid, remove all tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return null;
      }

      const { accessToken } = await response.json();
      localStorage.setItem('access_token', accessToken);
      
      return accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  async resetPassword(data: { email: string; additionalData?: any }): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset failed');
      }
    } catch (error) {
      throw error;
    }
  }

  async verifyMFA(data: { token: string; code: string; method: string }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify-mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'MFA verification failed');
      }

      const authResponse: AuthResponse = await response.json();
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', authResponse.accessToken);
      localStorage.setItem('refresh_token', authResponse.refreshToken);

      return authResponse;
    } catch (error) {
      throw error;
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Helper method for authenticated API calls
  async apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(this.apiKey && { 'X-API-Key': this.apiKey }),
      ...options.headers
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    // If token is expired, try to refresh it
    if (response.status === 401 && token) {
      const newToken = await this.refreshToken();
      
      if (newToken) {
        // Retry the request with new token
        const retryHeaders = {
          ...headers,
          'Authorization': `Bearer ${newToken}`
        };

        return fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: retryHeaders
        });
      }
    }

    return response;
  }
}