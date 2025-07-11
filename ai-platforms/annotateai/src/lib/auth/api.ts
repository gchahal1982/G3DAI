// Simple toast fallback if react-hot-toast is not available
const toast = {
  error: (message: string) => {
    console.error('API Error:', message);
    // Could show browser notification or other UI feedback
    if (typeof window !== 'undefined') {
      console.warn('Toast notification:', message);
    }
  },
  success: (message: string) => {
    console.log('API Success:', message);
  }
};

// Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

interface RequestConfig extends RequestInit {
  requireAuth?: boolean;
  skipErrorHandling?: boolean;
  retryOnTokenRefresh?: boolean;
}

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

// API endpoints configuration
export const API_ENDPOINTS = {
  // Authentication endpoints
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    me: '/api/auth/me',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    validateResetToken: '/api/auth/validate-reset-token',
    updateProfile: '/api/auth/update-profile',
    changePassword: '/api/auth/change-password',
    verifyEmail: '/api/auth/verify-email',
    resendVerification: '/api/auth/resend-verification',
  },
  
  // User endpoints
  users: {
    list: '/api/users',
    get: (id: string) => `/api/users/${id}`,
    update: (id: string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,
    avatar: (id: string) => `/api/users/${id}/avatar`,
  },
  
  // Project endpoints
  projects: {
    list: '/api/projects',
    create: '/api/projects',
    get: (id: string) => `/api/projects/${id}`,
    update: (id: string) => `/api/projects/${id}`,
    delete: (id: string) => `/api/projects/${id}`,
    duplicate: (id: string) => `/api/projects/${id}/duplicate`,
    export: (id: string) => `/api/projects/${id}/export`,
    share: (id: string) => `/api/projects/${id}/share`,
  },
  
  // Dataset endpoints
  datasets: {
    list: '/api/datasets',
    create: '/api/datasets',
    get: (id: string) => `/api/datasets/${id}`,
    update: (id: string) => `/api/datasets/${id}`,
    delete: (id: string) => `/api/datasets/${id}`,
    upload: (id: string) => `/api/datasets/${id}/upload`,
    images: (id: string) => `/api/datasets/${id}/images`,
  },
  
  // Annotation endpoints
  annotations: {
    list: (datasetId: string) => `/api/datasets/${datasetId}/annotations`,
    create: (datasetId: string) => `/api/datasets/${datasetId}/annotations`,
    get: (datasetId: string, id: string) => `/api/datasets/${datasetId}/annotations/${id}`,
    update: (datasetId: string, id: string) => `/api/datasets/${datasetId}/annotations/${id}`,
    delete: (datasetId: string, id: string) => `/api/datasets/${datasetId}/annotations/${id}`,
    bulk: (datasetId: string) => `/api/datasets/${datasetId}/annotations/bulk`,
  },
  
  // AI/ML endpoints
  ai: {
    models: '/api/ai/models',
    train: '/api/ai/train',
    predict: '/api/ai/predict',
    autoAnnotate: '/api/ai/auto-annotate',
    suggestions: '/api/ai/suggestions',
  },
  
  // Analytics endpoints
  analytics: {
    overview: '/api/analytics/overview',
    projects: '/api/analytics/projects',
    performance: '/api/analytics/performance',
    usage: '/api/analytics/usage',
  },
  
  // Organization endpoints (Enterprise)
  organization: {
    get: '/api/organization',
    update: '/api/organization',
    members: '/api/organization/members',
    invitations: '/api/organization/invitations',
    billing: '/api/organization/billing',
    settings: '/api/organization/settings',
  },
  
  // System endpoints
  system: {
    health: '/api/system/health',
    status: '/api/system/status',
    version: '/api/system/version',
  }
} as const;

// Token management
class TokenManager {
  private static instance: TokenManager;
  private tokens: AuthTokens | null = null;
  private refreshPromise: Promise<string> | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Check memory first
    if (this.tokens && this.tokens.expiresAt > Date.now()) {
      return this.tokens.accessToken;
    }
    
    // Check storage
    const sessionToken = sessionStorage.getItem('authToken');
    const localToken = localStorage.getItem('authToken');
    const token = sessionToken || localToken;
    
    if (token) {
      try {
        // Parse JWT to get expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = payload.exp * 1000; // Convert to milliseconds
        
        this.tokens = {
          accessToken: token,
          expiresAt
        };
        
        return token;
      } catch (error) {
        console.error('Error parsing token:', error);
        this.clearToken();
        return null;
      }
    }
    
    return null;
  }

  setToken(token: string, remember = false): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Parse token to get expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      
      this.tokens = {
        accessToken: token,
        expiresAt
      };
      
      // Store in appropriate storage
      if (remember) {
        localStorage.setItem('authToken', token);
        sessionStorage.removeItem('authToken');
      } else {
        sessionStorage.setItem('authToken', token);
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  clearToken(): void {
    this.tokens = null;
    this.refreshPromise = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    }
  }

  isTokenExpired(): boolean {
    if (!this.tokens) return true;
    return this.tokens.expiresAt <= Date.now();
  }

  async refreshToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _performTokenRefresh(): Promise<string> {
    const currentToken = this.getToken();
    if (!currentToken) {
      throw new Error('No token to refresh');
    }

    try {
      const response = await fetch(API_ENDPOINTS.auth.refresh, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newToken = data.token || data.accessToken;
      
      if (!newToken) {
        throw new Error('No token in refresh response');
      }

      // Determine if we should remember the token
      const remember = !!localStorage.getItem('authToken');
      this.setToken(newToken, remember);
      
      return newToken;
    } catch (error) {
      this.clearToken();
      throw error;
    }
  }
}

// API Client class
class ApiClient {
  private tokenManager: TokenManager;
  private baseURL: string;

  constructor(baseURL = '') {
    this.tokenManager = TokenManager.getInstance();
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      requireAuth = true,
      skipErrorHandling = false,
      retryOnTokenRefresh = true,
      ...requestConfig
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(requestConfig.headers as Record<string, string>),
    };

    // Add auth token if required
    if (requireAuth) {
      let token = this.tokenManager.getToken();
      
      // Try to refresh token if expired
      if (token && this.tokenManager.isTokenExpired() && retryOnTokenRefresh) {
        try {
          token = await this.tokenManager.refreshToken();
        } catch (error) {
          console.error('Token refresh failed:', error);
          this.handleAuthError();
          throw new ApiError('Authentication failed', 401);
        }
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else if (requireAuth) {
        this.handleAuthError();
        throw new ApiError('No authentication token', 401);
      }
    }

    try {
      const response = await fetch(url, {
        ...requestConfig,
        headers,
      });

      // Handle 401 responses
      if (response.status === 401 && requireAuth && retryOnTokenRefresh) {
        try {
          // Try to refresh token and retry request
          const newToken = await this.tokenManager.refreshToken();
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };
          
          const retryResponse = await fetch(url, {
            ...requestConfig,
            headers: retryHeaders,
          });
          
          return this.handleResponse<T>(retryResponse, skipErrorHandling);
        } catch (refreshError) {
          console.error('Token refresh failed on retry:', refreshError);
          this.handleAuthError();
          throw new ApiError('Authentication failed', 401);
        }
      }

      return this.handleResponse<T>(response, skipErrorHandling);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error('API request failed:', error);
      throw new ApiError('Network error', 0, 'NETWORK_ERROR');
    }
  }

  private async handleResponse<T>(
    response: Response,
    skipErrorHandling: boolean
  ): Promise<ApiResponse<T>> {
    let data: any;
    
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      data = { message: 'Invalid response format' };
    }

    if (!response.ok) {
      const apiError = new ApiError(
        data.message || `HTTP ${response.status}`,
        response.status,
        data.code,
        data
      );

      if (!skipErrorHandling) {
        this.handleError(apiError);
      }

      throw apiError;
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  }

  private handleError(error: ApiError): void {
    switch (error.status) {
      case 401:
        this.handleAuthError();
        break;
      case 403:
        toast.error('You do not have permission to perform this action');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 422:
        // Validation errors are usually handled by the calling component
        break;
      case 429:
        toast.error('Too many requests. Please try again later');
        break;
      case 500:
        toast.error('Server error. Please try again later');
        break;
      default:
        if (error.message && error.status !== 422) {
          toast.error(error.message);
        }
    }
  }

  private handleAuthError(): void {
    this.tokenManager.clearToken();
    
    // Trigger logout in auth context
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
      // Redirect to login with current path
      const currentPath = window.location.pathname;
      const loginUrl = currentPath === '/login' ? '/login' : `/login?redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = loginUrl;
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // File upload method
  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: Omit<RequestConfig, 'headers'>
  ): Promise<ApiResponse<T>> {
    const { requireAuth = true, ...requestConfig } = config || {};
    
    // Don't set Content-Type for FormData - browser will set it with boundary
    const headers: HeadersInit = {};
    
    if (requireAuth) {
      const token = this.tokenManager.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(endpoint, {
      ...requestConfig,
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response, false);
  }
}

// Custom error class
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export utilities
export { apiClient, ApiClient, TokenManager, ApiError };
export type { ApiResponse, RequestConfig, AuthTokens };

// Convenience functions for common auth operations
export const authApi = {
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) =>
    apiClient.post(API_ENDPOINTS.auth.login, credentials, { requireAuth: false }),
    
  signup: (userData: any) =>
    apiClient.post(API_ENDPOINTS.auth.signup, userData, { requireAuth: false }),
    
  logout: () =>
    apiClient.post(API_ENDPOINTS.auth.logout),
    
  getCurrentUser: () =>
    apiClient.get(API_ENDPOINTS.auth.me),
    
  updateProfile: (updates: any) =>
    apiClient.patch(API_ENDPOINTS.auth.updateProfile, updates),
    
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post(API_ENDPOINTS.auth.changePassword, data),
    
  forgotPassword: (email: string) =>
    apiClient.post(API_ENDPOINTS.auth.forgotPassword, { email }, { requireAuth: false }),
    
  resetPassword: (data: { token: string; email: string; password: string }) =>
    apiClient.post(API_ENDPOINTS.auth.resetPassword, data, { requireAuth: false }),
    
  validateResetToken: (data: { token: string; email: string }) =>
    apiClient.post(API_ENDPOINTS.auth.validateResetToken, data, { requireAuth: false }),
};

// Export default
export default apiClient; 