export interface ApiClientOptions {
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * HTTP API Client for making requests to backend services
 */
export class ApiClient {
  private baseHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor() {
    this.baseHeaders = {
      'Content-Type': 'application/json',
    };
    this.defaultTimeout = 30000; // 30 seconds
  }

  /**
   * Set default headers for all requests
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.baseHeaders = { ...this.baseHeaders, ...headers };
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.baseHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Make GET request
   */
  async get<T = any>(url: string, options: ApiClientOptions = {}): Promise<T> {
    return this.request<T>('GET', url, undefined, options);
  }

  /**
   * Make POST request
   */
  async post<T = any>(url: string, data?: any, options: ApiClientOptions = {}): Promise<T> {
    return this.request<T>('POST', url, data, options);
  }

  /**
   * Make PUT request
   */
  async put<T = any>(url: string, data?: any, options: ApiClientOptions = {}): Promise<T> {
    return this.request<T>('PUT', url, data, options);
  }

  /**
   * Make PATCH request
   */
  async patch<T = any>(url: string, data?: any, options: ApiClientOptions = {}): Promise<T> {
    return this.request<T>('PATCH', url, data, options);
  }

  /**
   * Make DELETE request
   */
  async delete<T = any>(url: string, options: ApiClientOptions = {}): Promise<T> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  /**
   * Generic request method
   */
  private async request<T>(
    method: string,
    url: string,
    data?: any,
    options: ApiClientOptions = {}
  ): Promise<T> {
    const { timeout = this.defaultTimeout, headers = {}, params } = options;

    // Build URL with query parameters
    const requestUrl = this.buildUrl(url, params);

    // Prepare headers
    const requestHeaders = { ...this.baseHeaders, ...headers };

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    };

    // Add body for POST/PUT/PATCH requests
    if (data !== undefined && method !== 'GET' && method !== 'DELETE') {
      if (data instanceof FormData) {
        // Remove Content-Type for FormData (browser will set it with boundary)
        delete requestHeaders['Content-Type'];
        fetchOptions.body = data;
      } else {
        fetchOptions.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(requestUrl, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Try to parse JSON, fall back to text
      let responseData: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
      }
      throw new Error('Unknown error occurred during request');
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(url: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${searchParams.toString()}`;
  }

  /**
   * Create form data from object
   */
  createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return formData;
  }
} 