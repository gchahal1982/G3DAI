/**
 * MedSight Pro - Shared UI Integration
 * Wraps G3DAI shared components with MedSight Pro medical theme and glassmorphism effects
 * 
 * @fileoverview This file integrates shared UI components from the G3DAI infrastructure
 * with MedSight Pro's medical-specific design system, glassmorphism effects, and clinical workflow optimizations.
 * 
 * Design System Compliance: Follows @UIUX.md MedSight Pro specifications
 * - Medical Blue (#0ea5e9), Medical Green (#10b981), Medical Gold (#f59e0b)
 * - Glassmorphism effects (.medsight-glass, .medsight-viewer-glass, .medsight-control-glass)
 * - Medical status colors (normal, abnormal, critical, pending)
 * - AI confidence indicators (high, medium, low)
 */

import React from 'react';

// Mock imports since the shared modules don't exist yet
// import { Card, Button, Badge, Progress, Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui';

// import { AuthService } from '@/shared/auth/AuthService';

// import { APIGateway } from '@/shared/api-client/api-gateway/gateway';

// import { AdminDashboard } from '@/shared/admin/src/AdminDashboard';

// For now, create simple mock implementations
const Card = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={`p-4 border rounded-lg ${className}`} {...props}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', className = '', ...props }: { children: React.ReactNode; variant?: string; className?: string; [key: string]: any }) => (
  <button 
    className={`px-4 py-2 rounded ${variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200'} ${className}`} 
    {...props}
  >
    {children}
  </button>
);

// MedSight Pro Theme Configuration
export const medsightTheme = {
  colors: {
    // Primary Medical Colors (from UIUX.md)
    primary: '#0ea5e9',      // Medical Blue - Trust, healthcare, precision
    secondary: '#10b981',    // Medical Green - Health, safety, positive outcomes  
    accent: '#f59e0b',       // Medical Gold - Premium, accuracy, clinical excellence
    
    // Medical Status Colors
    normal: '#10b981',       // Normal findings
    abnormal: '#ef4444',     // Abnormal findings
    pending: '#f59e0b',      // Pending review
    critical: '#dc2626',     // Critical findings
    reviewed: '#6366f1',     // Reviewed status
    
    // AI Confidence Indicators
    aiHigh: '#059669',       // 90%+ AI confidence
    aiMedium: '#d97706',     // 70-90% AI confidence
    aiLow: '#dc2626',        // <70% AI confidence
    
    // Medical Workflow Colors
    emergency: '#dc2626',    // Emergency cases
    urgent: '#f59e0b',       // Urgent cases
    routine: '#10b981',      // Routine cases
    scheduled: '#6366f1',    // Scheduled cases
    
    // Medical Professional Colors
    radiologist: '#8b5cf6',  // Radiologist role
    physician: '#0ea5e9',    // Physician role
    technician: '#10b981',   // Technician role
    admin: '#f59e0b'         // Admin role
  },
  
  // Glassmorphism Effects (from UIUX.md)
  glassEffects: {
    primary: 'medsight-glass',           // Primary medical interface
    viewer: 'medsight-viewer-glass',     // Medical image viewer
    control: 'medsight-control-glass',   // Medical control panels
    ai: 'medsight-ai-glass',             // AI diagnostic interfaces
    status: 'medsight-status-glass',     // Medical status indicators
    modal: 'medsight-modal-glass',       // Medical modal dialogs
    sidebar: 'medsight-sidebar-glass',   // Medical navigation sidebar
    header: 'medsight-header-glass'      // Medical dashboard header
  },
  
  // Medical Typography
  typography: {
    fontFamily: 'Inter Variable, system-ui, sans-serif',
    lineHeight: 1.6,        // Enhanced readability for medical data
    letterSpacing: '0.01em' // Improved medical text clarity
  },
  
  // Medical Animation Timings
  animation: {
    fast: '150ms',          // Quick medical interactions
    normal: '300ms',        // Standard medical transitions
    slow: '500ms',          // Medical data loading
    critical: '100ms'       // Emergency medical alerts
  }
};

// Medical-specific UI components
export const MedSightUI = {
  Card,
  Button,
  
  // Medical Status Badge
  MedicalStatusBadge: ({ status, confidence, className = '', children, ...props }: { 
    status: string; 
    confidence?: number; 
    className?: string; 
    children: React.ReactNode; 
    [key: string]: any 
  }) => {
    const statusColors = {
      normal: 'bg-green-100 text-green-800',
      abnormal: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
      pending: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span 
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'} ${className}`}
        {...props}
      >
        {children}
        {confidence && <span className="ml-1">({confidence}%)</span>}
      </span>
    );
  },

  // Medical Progress Indicator
  MedicalProgress: ({ value, size = 'medium', className = '', ...props }: { 
    value: number; 
    size?: string; 
    className?: string; 
    [key: string]: any 
  }) => {
    const sizeClasses = {
      small: 'h-2',
      medium: 'h-4', 
      large: 'h-6'
    };
    
    return (
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size as keyof typeof sizeClasses]} ${className}`} {...props}>
        <div 
          className="bg-blue-600 h-full rounded-full transition-all duration-300" 
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    );
  }
};

// Medical-Specific Utilities
export const medicalUtils = {
  // Medical Status Helper
  getStatusColor: (status: string) => {
    return medsightTheme.colors[status as keyof typeof medsightTheme.colors] || medsightTheme.colors.pending;
  },
  
  // AI Confidence Helper
  getConfidenceLevel: (confidence: number) => {
    if (confidence >= 90) return 'high';
    if (confidence >= 70) return 'medium';
    return 'low';
  },
  
  // Medical Priority Helper
  getPriorityColor: (priority: string) => {
    const priorityColors = {
      emergency: medsightTheme.colors.emergency,
      urgent: medsightTheme.colors.pending,
      routine: medsightTheme.colors.normal,
      scheduled: medsightTheme.colors.primary
    };
    return priorityColors[priority as keyof typeof priorityColors] || priorityColors.routine;
  },
  
  // Medical Role Helper
  getRoleColor: (role: string) => {
    return medsightTheme.colors[role as keyof typeof medsightTheme.colors] || medsightTheme.colors.primary;
  },
  
  // Medical Glass Effect Helper
  getGlassEffect: (type: string) => {
    return medsightTheme.glassEffects[type as keyof typeof medsightTheme.glassEffects] || medsightTheme.glassEffects.primary;
  },
  
  // Medical Animation Helper
  getAnimationTiming: (type: string) => {
    return medsightTheme.animation[type as keyof typeof medsightTheme.animation] || medsightTheme.animation.normal;
  }
};

// Medical CSS Class Utilities
export const medicalClasses = {
  // Glass Effects
  glass: {
    primary: 'medsight-glass',
    viewer: 'medsight-viewer-glass',
    control: 'medsight-control-glass',
    ai: 'medsight-ai-glass',
    status: 'medsight-status-glass',
    modal: 'medsight-modal-glass',
    sidebar: 'medsight-sidebar-glass',
    header: 'medsight-header-glass'
  },
  
  // Status Classes
  status: {
    normal: 'medsight-status-normal',
    abnormal: 'medsight-status-abnormal',
    critical: 'medsight-status-critical',
    pending: 'medsight-status-pending',
    reviewed: 'medsight-status-reviewed'
  },
  
  // Confidence Classes
  confidence: {
    high: 'medsight-confidence-high',
    medium: 'medsight-confidence-medium',
    low: 'medsight-confidence-low'
  },
  
  // Priority Classes
  priority: {
    emergency: 'medsight-priority-emergency',
    urgent: 'medsight-priority-urgent',
    routine: 'medsight-priority-routine',
    scheduled: 'medsight-priority-scheduled'
  },
  
  // Role Classes
  role: {
    radiologist: 'medsight-role-radiologist',
    physician: 'medsight-role-physician',
    technician: 'medsight-role-technician',
    admin: 'medsight-role-admin'
  },
  
  // Component Classes
  components: {
    button: 'btn-medsight',
    card: 'card-medsight',
    input: 'input-medsight',
    select: 'select-medsight',
    table: 'medsight-table',
    modal: 'medsight-modal',
    alert: 'medsight-alert',
    tabs: 'medsight-tabs',
    tooltip: 'medsight-tooltip',
    spinner: 'medsight-spinner',
    progress: 'medsight-progress'
  }
};

// Medical Authentication Service Configuration
export const medicalAuthService = {
  // Mock AuthService
  login: async (username: string, password: string) => {
    if (username === 'testuser' && password === 'testpass') {
      return { success: true, token: 'mock-token' };
    }
    return { success: false, message: 'Invalid credentials' };
  },
  logout: () => {
    // Mock logout
    return { success: true };
  },
  getCurrentUser: () => {
    // Mock current user
    return { id: 'mock-user-id', username: 'Test User', role: 'admin' };
  },
  isAuthenticated: () => true,
  getToken: () => 'mock-token',
  setToken: (token: string) => {
    // Mock set token
  },
  clearToken: () => {
    // Mock clear token
  }
};

// Medical API Gateway Configuration
export const medicalAPIGateway = {
  // Mock APIGateway
  get: async (path: string) => {
    if (path === '/api/test') {
      return { success: true, data: { message: 'Test data' } };
    }
    return { success: false, message: 'Resource not found' };
  },
  post: async (path: string, data: any) => {
    if (path === '/api/test') {
      return { success: true, data: { message: 'Test data posted' } };
    }
    return { success: false, message: 'Resource not found' };
  },
  put: async (path: string, data: any) => {
    if (path === '/api/test') {
      return { success: true, data: { message: 'Test data updated' } };
    }
    return { success: false, message: 'Resource not found' };
  },
  delete: async (path: string) => {
    if (path === '/api/test') {
      return { success: true, data: { message: 'Test data deleted' } };
    }
    return { success: false, message: 'Resource not found' };
  },
  setHeaders: (headers: any) => {
    // Mock set headers
  },
  getHeaders: () => {
    // Mock get headers
    return {};
  },
  setBaseUrl: (baseUrl: string) => {
    // Mock set base URL
  },
  getBaseUrl: () => {
    // Mock get base URL
    return '';
  },
  setPort: (port: number) => {
    // Mock set port
  },
  getPort: () => {
    // Mock get port
    return 3000;
  },
  setHost: (host: string) => {
    // Mock set host
  },
  getHost: () => {
    // Mock get host
    return '0.0.0.0';
  },
  setCors: (cors: any) => {
    // Mock set cors
  },
  getCors: () => {
    // Mock get cors
    return {};
  },
  setRedis: (redis: any) => {
    // Mock set redis
  },
  getRedis: () => {
    // Mock get redis
    return {};
  },
  setJwt: (jwt: any) => {
    // Mock set jwt
  },
  getJwt: () => {
    // Mock get jwt
    return {};
  },
  setServices: (services: any[]) => {
    // Mock set services
  },
  getServices: () => {
    // Mock get services
    return [];
  },
  setMonitoring: (monitoring: any) => {
    // Mock set monitoring
  },
  getMonitoring: () => {
    // Mock get monitoring
    return {};
  },
  setLogging: (logging: any) => {
    // Mock set logging
  },
  getLogging: () => {
    // Mock get logging
    return {};
  }
};

// Export all shared components with MedSight Pro theming
export {
  // Original shared components (with MedSight Pro theming applied)
  Card,
  Button,
  // Modal, // Modal is not imported
  // Progress, // Progress is not imported
  // Tabs, // Tabs is not imported
  // Badge, // Badge is not imported
  // Input, // Input is not imported
  // Select, // Select is not imported
  // Checkbox, // Checkbox is not imported
  // Button, // Button is now a mock
  // Card, // Card is now a mock
  // Alert, // Alert is not imported
  // Tooltip, // Tooltip is not imported
  // Dropdown, // Dropdown is not imported
  // Accordion, // Accordion is not imported
  // Breadcrumb, // Breadcrumb is not imported
  // Pagination, // Pagination is not imported
  // Table, // Table is now a mock
  // Avatar, // Avatar is not imported
  // Spinner, // Spinner is now a mock
  // Switch, // Switch is not imported
  // Textarea, // Textarea is not imported
  // DatePicker, // DatePicker is not imported
  // TimePicker, // TimePicker is not imported
  // Slider, // Slider is not imported
  // RadioGroup, // RadioGroup is not imported
  // FileUpload, // FileUpload is not imported
  // SearchInput, // SearchInput is not imported
  
  // Shared services
  // AuthService, // AuthService is now a mock
  // APIGateway, // APIGateway is now a mock
  // AdminDashboard // AdminDashboard is not imported
};

// Default export for convenience
export default {
  UI: MedSightUI,
  theme: medsightTheme,
  utils: medicalUtils,
  classes: medicalClasses,
  auth: medicalAuthService,
  api: medicalAPIGateway
}; 