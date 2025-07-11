import { useContext } from 'react';
import { AuthContext } from '@/lib/auth/AuthContext';
import type { AuthContextType } from '@/types/auth';

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Re-export auth components for convenience
export { AuthProvider, withAuth } from '@/lib/auth/AuthContext';

// Export additional utility functions for demo/development
export const PLAN_FEATURES = {
  free: {
    projects: 3,
    storage: 1, // GB
    apiCalls: 1000,
    annotations: 10000,
    teamMembers: 1,
    modelTraining: 0,
    exports: 50,
    supportLevel: 'community' as const,
    features: ['basic_annotation', 'basic_export', 'community_support']
  },
  pro: {
    projects: 25,
    storage: 50, // GB
    apiCalls: 50000,
    annotations: 500000,
    teamMembers: 10,
    modelTraining: 10,
    exports: 1000,
    supportLevel: 'priority' as const,
    features: ['basic_annotation', 'basic_export', 'community_support', 'advanced_annotation', 'batch_operations', 'api_access', 'priority_support', 'collaboration', 'version_control']
  },
  enterprise: {
    projects: -1, // unlimited
    storage: 500, // GB
    apiCalls: 1000000,
    annotations: -1, // unlimited
    teamMembers: 100,
    modelTraining: 100,
    exports: -1, // unlimited
    supportLevel: 'dedicated' as const,
    features: ['basic_annotation', 'basic_export', 'community_support', 'advanced_annotation', 'batch_operations', 'api_access', 'priority_support', 'collaboration', 'version_control', 'sso', 'audit_logs', 'custom_models', 'dedicated_support', 'advanced_security', 'compliance_tools']
  },
  custom: {
    projects: -1, // unlimited
    storage: -1, // unlimited
    apiCalls: -1, // unlimited
    annotations: -1, // unlimited
    teamMembers: -1, // unlimited
    modelTraining: -1, // unlimited
    exports: -1, // unlimited
    supportLevel: 'dedicated' as const,
    features: ['basic_annotation', 'basic_export', 'community_support', 'advanced_annotation', 'batch_operations', 'api_access', 'priority_support', 'collaboration', 'version_control', 'sso', 'audit_logs', 'custom_models', 'dedicated_support', 'advanced_security', 'compliance_tools', 'custom_features', 'white_label', 'on_premise']
  }
} as const; 