import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRouteProps, UserRole, SubscriptionPlan } from '@/types/auth';

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPlan,
  requiredFeature,
  fallback
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show fallback if not authenticated
  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  // Check role requirements
  if (requiredRole && user.role !== requiredRole) {
    // Check if user has higher permission level
    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.VIEWER]: 1,
      [UserRole.ANNOTATOR]: 2,
      [UserRole.MANAGER]: 3,
      [UserRole.ADMIN]: 4,
      [UserRole.OWNER]: 5
    };

    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Insufficient Permissions</h2>
            <p className="text-gray-600">You don't have the required role to access this page.</p>
            <p className="text-sm text-gray-500 mt-1">Required: {requiredRole}, Your role: {user.role}</p>
          </div>
        </div>
      );
    }
  }

  // Check subscription plan requirements
  if (requiredPlan && user.subscription.plan !== requiredPlan) {
    const planHierarchy: Record<SubscriptionPlan, number> = {
      [SubscriptionPlan.FREE]: 1,
      [SubscriptionPlan.STARTER]: 2,
      [SubscriptionPlan.PROFESSIONAL]: 3,
      [SubscriptionPlan.ENTERPRISE]: 4
    };

    const userPlanLevel = planHierarchy[user.subscription.plan];
    const requiredPlanLevel = planHierarchy[requiredPlan];

    if (userPlanLevel < requiredPlanLevel) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Upgrade Required</h2>
            <p className="text-gray-600">This feature requires a higher subscription plan.</p>
            <p className="text-sm text-gray-500 mt-1">Required: {requiredPlan}, Your plan: {user.subscription.plan}</p>
            <button 
              onClick={() => router.push('/billing')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      );
    }
  }

  // Check feature-specific requirements
  if (requiredFeature) {
    // This would integrate with your feature flag system
    // For now, we'll assume all features are available
    console.log(`Checking feature requirement: ${requiredFeature}`);
  }

  // User has all required permissions
  return <>{children}</>;
};

// Auth Guard wrapper component
export const AuthGuard: React.FC<ProtectedRouteProps & { redirectTo?: string }> = ({
  children,
  redirectTo = '/login',
  ...props
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (!isAuthenticated) {
    return null;
  }

  return <ProtectedRoute {...props}>{children}</ProtectedRoute>;
};

// HOC for protecting pages
export const withProtectedRoute = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) => {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

export default ProtectedRoute; 