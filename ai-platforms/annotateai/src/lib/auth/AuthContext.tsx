'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AuthContextType, 
  User, 
  Organization, 
  LoginRequest, 
  AuthResponse, 
  UserRole,
  SubscriptionPlan
} from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing session on mount
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // For demo purposes, only create demo user for specific demo tokens
      // In production, this would validate the token with the backend
      if (token === 'demo-token-123' && !user) {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const demoUser: User = {
          id: 'demo-user-1',
          email: 'demo@annotateai.com',
          firstName: 'Demo',
          lastName: 'User',
          name: 'Demo User',
          role: UserRole.OWNER,
          avatar: null,
          createdAt: now,
          updatedAt: now,
          twoFactorEnabled: false,
          preferences: {
            theme: 'dark',
            notifications: {
              email: {
                projectUpdates: true,
                teamInvites: true,
                billingAlerts: true,
                securityAlerts: true,
                productUpdates: false,
                weeklyDigest: true
              },
              browser: true,
              mobile: true,
              push: {
                projectUpdates: true,
                mentions: true,
                deadlines: true,
                systemAlerts: true
              },
              inApp: {
                projectUpdates: true,
                teamActivity: true,
                systemNotifications: true
              }
            },
            language: 'en',
            timezone: 'UTC',
            privacy: {
              analyticsEnabled: true,
              crashReportingEnabled: true,
              dataSharingEnabled: false,
              activityLogging: true,
              profileVisibility: 'organization'
            },
            workspace: {
              defaultExportFormat: 'json',
              autoSaveInterval: 30,
              keyboardShortcuts: true,
              showTutorials: true,
              gridSnapping: true,
              darkModeAnnotations: true
            },
            accessibility: {
              reducedMotion: false,
              highContrast: false,
              fontSize: 'medium',
              colorBlindMode: 'none',
              keyboardNavigation: false,
              screenReader: false
            }
          },
          subscription: {
            id: 'demo-subscription-1',
            plan: SubscriptionPlan.PROFESSIONAL,
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: thirtyDaysFromNow,
            cancelAtPeriodEnd: false,
            usage: {
              projects: 5,
              storage: 1024,
              apiCalls: 1000,
              annotations: 5000,
              teamMembers: 3,
              modelTraining: 2,
              exports: 10
            },
            limits: {
              projects: 'unlimited',
              storage: 'unlimited',
              apiCalls: 'unlimited',
              annotations: 'unlimited',
              teamMembers: 10,
              modelTraining: 'unlimited',
              exports: 'unlimited',
              supportLevel: 'priority'
            }
          }
        };

        const demoOrganization: Organization = {
          id: 'demo-org-1',
          name: 'Demo Organization',
          domain: 'demo.annotateai.com',
          teamSize: 3,
          members: [demoUser],
          createdAt: now,
          updatedAt: now,
          settings: {
            allowInvites: true,
            requireApproval: false,
            defaultRole: UserRole.ANNOTATOR,
            ssoEnabled: false,
            auditLogging: true
          },
          subscription: {
            id: 'demo-org-subscription-1',
            plan: SubscriptionPlan.PROFESSIONAL,
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: thirtyDaysFromNow,
            cancelAtPeriodEnd: false,
            usage: {
              projects: 8,
              storage: 2048,
              apiCalls: 3000,
              annotations: 15000,
              teamMembers: 3,
              modelTraining: 5,
              exports: 25
            },
            limits: {
              projects: 'unlimited',
              storage: 'unlimited',
              apiCalls: 'unlimited',
              annotations: 'unlimited',
              teamMembers: 20,
              modelTraining: 'unlimited',
              exports: 'unlimited',
              supportLevel: 'priority'
            }
          }
        };

        setUser(demoUser);
        setOrganization(demoOrganization);
        setError(null);
      } else if (token !== 'demo-token-123') {
        // Clear invalid/unknown tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setOrganization(null);
        setError(null);
      }
      
    } catch (error) {
      console.error('Auth session check failed:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      setError('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const authResponse: AuthResponse = await response.json();
      
      // Store tokens (matching what the API sets)
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', authResponse.accessToken);
        localStorage.setItem('refresh_token', authResponse.refreshToken);
      }

      // Update state immediately
      setUser(authResponse.user);
      setOrganization(authResponse.organization || null);
      setError(null);

      return authResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: import('@/types/auth').SignupRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const authResponse: AuthResponse = await response.json();
      
      // Store tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', authResponse.accessToken);
        localStorage.setItem('refresh_token', authResponse.refreshToken);
      }

      // Update state
      setUser(authResponse.user);
      setOrganization(authResponse.organization || null);

      return authResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    setUser(null);
    setOrganization(null);
    setError(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setError(null);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      setError(errorMessage);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    organization,
    isLoading,
    loading: isLoading, // Alias for isLoading
    error,
    isAuthenticated,
    login,
    logout,
    signup,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Export useAuth as an alias for useAuthContext
export const useAuth = useAuthContext;

// Higher Order Component for authentication
export const withAuth = <P extends {}>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => {
    const auth = useAuthContext();
    
    if (!auth.isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }
    
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export { AuthContext }; 