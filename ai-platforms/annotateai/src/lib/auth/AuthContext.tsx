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

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing session on mount
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        setOrganization(userData.organization);
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    } catch (error) {
      console.error('Auth session check failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    setIsLoading(true);
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
      
      // Store tokens
      localStorage.setItem('access_token', authResponse.accessToken);
      localStorage.setItem('refresh_token', authResponse.refreshToken);

      // Update state
      setUser(authResponse.user);
      setOrganization(authResponse.organization || null);

      return authResponse;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setOrganization(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('access_token');
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
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    organization,
    isLoading,
    isAuthenticated,
    login,
    logout,
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