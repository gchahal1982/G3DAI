'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  User,
  AuthSession,
  LoginCredentials,
  SignupData,
  AuthResponse,
  ResetPasswordData,
  ChangePasswordData,
  TwoFactorVerification,
  AuthError,
  AuthErrorCode,
} from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  session: AuthSession | null;
  lastActivity: Date | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  signup: (data: SignupData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (data: ResetPasswordData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  verifyTwoFactor: (data: TwoFactorVerification) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  clearError: () => void;
  checkPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthResponse }
  | { type: 'LOGIN_FAILURE'; payload: AuthError }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: AuthResponse }
  | { type: 'REFRESH_TOKEN_FAILURE'; payload: AuthError }
  | { type: 'UPDATE_PROFILE_SUCCESS'; payload: User }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_LAST_ACTIVITY' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  session: null,
  lastActivity: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        session: {
          user: action.payload.user,
          token: action.payload.token,
          expiresAt: action.payload.expiresAt,
          isAuthenticated: true,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        lastActivity: new Date(),
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };

    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        session: {
          user: action.payload.user,
          token: action.payload.token,
          expiresAt: action.payload.expiresAt,
          isAuthenticated: true,
        },
        lastActivity: new Date(),
      };

    case 'REFRESH_TOKEN_FAILURE':
      return {
        ...state,
        error: action.payload,
        session: null,
        isAuthenticated: false,
      };

    case 'UPDATE_PROFILE_SUCCESS':
      return {
        ...state,
        user: action.payload,
        session: state.session ? {
          ...state.session,
          user: action.payload,
        } : null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'UPDATE_LAST_ACTIVITY':
      return {
        ...state,
        lastActivity: new Date(),
      };

    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    if (state.session?.token) {
      const interval = setInterval(() => {
        checkTokenExpiry();
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [state.session?.token]);

  // Track user activity
  useEffect(() => {
    if (state.isAuthenticated) {
      const handleActivity = () => {
        dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
      };

      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true });
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [state.isAuthenticated]);

  const initializeAuth = async () => {
    try {
      const token = getStoredToken();
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userData.user,
              token,
              refreshToken: getStoredRefreshToken() || '',
              expiresAt: new Date(userData.expiresAt),
            },
          });
        } else {
          clearStoredTokens();
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      clearStoredTokens();
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        storeTokens(data.token, data.refreshToken);
        dispatch({ type: 'LOGIN_SUCCESS', payload: data });
        return data;
      } else {
        const error: AuthError = {
          code: data.code || AuthErrorCode.INVALID_CREDENTIALS,
          message: data.message || 'Login failed',
          field: data.field,
        };
        dispatch({ type: 'LOGIN_FAILURE', payload: error });
        throw error;
      }
    } catch (error: any) {
      const authError: AuthError = {
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: error.message || 'Network error',
      };
      dispatch({ type: 'LOGIN_FAILURE', payload: authError });
      throw authError;
    }
  };

  const signup = async (data: SignupData): Promise<AuthResponse> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        storeTokens(responseData.token, responseData.refreshToken);
        dispatch({ type: 'LOGIN_SUCCESS', payload: responseData });
        return responseData;
      } else {
        const error: AuthError = {
          code: responseData.code || AuthErrorCode.EMAIL_ALREADY_EXISTS,
          message: responseData.message || 'Signup failed',
          field: responseData.field,
        };
        dispatch({ type: 'LOGIN_FAILURE', payload: error });
        throw error;
      }
    } catch (error: any) {
      const authError: AuthError = {
        code: AuthErrorCode.EMAIL_ALREADY_EXISTS,
        message: error.message || 'Network error',
      };
      dispatch({ type: 'LOGIN_FAILURE', payload: authError });
      throw authError;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const token = getStoredToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearStoredTokens();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        storeTokens(data.token, data.refreshToken);
        dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: data });
      } else {
        const error: AuthError = {
          code: AuthErrorCode.TOKEN_EXPIRED,
          message: 'Session expired',
        };
        dispatch({ type: 'REFRESH_TOKEN_FAILURE', payload: error });
        throw error;
      }
    } catch (error: any) {
      const authError: AuthError = {
        code: AuthErrorCode.TOKEN_EXPIRED,
        message: error.message || 'Failed to refresh token',
      };
      dispatch({ type: 'REFRESH_TOKEN_FAILURE', payload: authError });
      throw authError;
    }
  };

  const checkTokenExpiry = async () => {
    if (state.session?.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(state.session.expiresAt);
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();

      // Refresh token if it expires in the next 5 minutes
      if (timeUntilExpiry < 5 * 60 * 1000) {
        try {
          await refreshToken();
        } catch (error) {
          console.error('Failed to refresh token:', error);
          await logout();
        }
      }
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to send reset email');
    }
  };

  const confirmResetPassword = async (data: ResetPasswordData): Promise<void> => {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const responseData = await response.json();
      throw new Error(responseData.message || 'Failed to reset password');
    }
  };

  const changePassword = async (data: ChangePasswordData): Promise<void> => {
    const token = getStoredToken();
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const responseData = await response.json();
      throw new Error(responseData.message || 'Failed to change password');
    }
  };

  const verifyTwoFactor = async (data: TwoFactorVerification): Promise<void> => {
    const token = getStoredToken();
    const response = await fetch('/api/auth/verify-2fa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const responseData = await response.json();
      throw new Error(responseData.message || 'Invalid verification code');
    }
  };

  const resendVerificationEmail = async (): Promise<void> => {
    const token = getStoredToken();
    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to resend verification email');
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    const token = getStoredToken();
    const response = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (response.ok) {
      const updatedUser = await response.json();
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: updatedUser });
      return updatedUser;
    } else {
      const data = await response.json();
      throw new Error(data.message || 'Failed to update profile');
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const checkPermission = (permission: string): boolean => {
    if (!state.user) return false;
    
    // Admin has all permissions
    if (state.user.role === 'admin') return true;

    // Check specific permissions based on role
    const rolePermissions: Record<string, string[]> = {
      manager: ['view', 'create', 'edit', 'delete', 'manage_team'],
      annotator: ['view', 'create', 'edit'],
      reviewer: ['view', 'review', 'approve'],
      viewer: ['view'],
    };

    const userPermissions = rolePermissions[state.user.role] || [];
    return userPermissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  // Storage utilities
  const getStoredToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth-token');
  };

  const getStoredRefreshToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh-token');
  };

  const storeTokens = (token: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth-token', token);
    localStorage.setItem('refresh-token', refreshToken);
  };

  const clearStoredTokens = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth-token');
    localStorage.removeItem('refresh-token');
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    refreshToken,
    resetPassword,
    confirmResetPassword,
    changePassword,
    verifyTwoFactor,
    resendVerificationEmail,
    updateProfile,
    clearError,
    checkPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };