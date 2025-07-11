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

// Import shared UI components from G3DAI infrastructure
import { 
  GlassCard, 
  GlassButton, 
  Modal, 
  Progress,
  Tabs,
  Badge,
  Input,
  Select,
  Checkbox,
  Button,
  Card,
  Alert,
  Tooltip,
  Dropdown,
  Accordion,
  Breadcrumb,
  Pagination,
  Table,
  Avatar,
  Spinner,
  Switch,
  Textarea,
  DatePicker,
  TimePicker,
  Slider,
  RadioGroup,
  FileUpload,
  SearchInput
} from '@/shared/components/ui';

// Import shared authentication services
import { AuthService } from '@/shared/auth/AuthService';

// Import shared API client
import { APIGateway } from '@/shared/api-client/api-gateway/gateway';

// Import shared admin components
import { AdminDashboard } from '@/shared/admin/src/AdminDashboard';

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

// MedSight Pro Wrapped Components
export const MedSightUI = {
  // Medical Glass Cards
  MedicalCard: ({ variant = 'primary', className = '', children, ...props }: any) => (
    <GlassCard 
      className={`${medsightTheme.glassEffects[variant as keyof typeof medsightTheme.glassEffects]} ${className}`}
      {...props}
    >
      {children}
    </GlassCard>
  ),
  
  // Medical Buttons
  MedicalButton: ({ variant = 'primary', size = 'md', className = '', children, ...props }: any) => (
    <GlassButton 
      className={`btn-medsight btn-medsight-${variant} ${className}`}
      size={size}
      {...props}
    >
      {children}
    </GlassButton>
  ),
  
  // Medical Status Badge
  MedicalStatusBadge: ({ status, confidence, className = '', children, ...props }: any) => {
    const statusColor = medsightTheme.colors[status as keyof typeof medsightTheme.colors] || medsightTheme.colors.pending;
    const confidenceClass = confidence ? `medsight-confidence-${confidence}` : '';
    
    return (
      <Badge 
        className={`medsight-status-${status} ${confidenceClass} ${className}`}
        style={{ backgroundColor: statusColor }}
        {...props}
      >
        {children}
      </Badge>
    );
  },
  
  // Medical Progress Indicator
  MedicalProgress: ({ value, status = 'normal', showConfidence = false, className = '', ...props }: any) => (
    <Progress 
      value={value}
      className={`medsight-progress medsight-status-${status} ${className}`}
      {...props}
    />
  ),
  
  // Medical Modal
  MedicalModal: ({ className = '', children, ...props }: any) => (
    <Modal 
      className={`${medsightTheme.glassEffects.modal} ${className}`}
      {...props}
    >
      {children}
    </Modal>
  ),
  
  // Medical Input
  MedicalInput: ({ variant = 'primary', className = '', ...props }: any) => (
    <Input 
      className={`input-medsight input-medsight-${variant} ${className}`}
      {...props}
    />
  ),
  
  // Medical Select
  MedicalSelect: ({ className = '', ...props }: any) => (
    <Select 
      className={`select-medsight ${className}`}
      {...props}
    />
  ),
  
  // Medical Alert
  MedicalAlert: ({ severity = 'info', className = '', children, ...props }: any) => {
    const severityColor = {
      info: medsightTheme.colors.primary,
      success: medsightTheme.colors.normal,
      warning: medsightTheme.colors.pending,
      error: medsightTheme.colors.critical,
      emergency: medsightTheme.colors.emergency
    }[severity];
    
    return (
      <Alert 
        className={`medsight-alert medsight-alert-${severity} ${className}`}
        style={{ borderColor: severityColor }}
        {...props}
      >
        {children}
      </Alert>
    );
  },
  
  // Medical Tabs
  MedicalTabs: ({ className = '', ...props }: any) => (
    <Tabs 
      className={`medsight-tabs ${className}`}
      {...props}
    />
  ),
  
  // Medical Table
  MedicalTable: ({ className = '', ...props }: any) => (
    <Table 
      className={`medsight-table ${className}`}
      {...props}
    />
  ),
  
  // Medical Tooltip
  MedicalTooltip: ({ className = '', ...props }: any) => (
    <Tooltip 
      className={`medsight-tooltip ${className}`}
      {...props}
    />
  ),
  
  // Medical Spinner
  MedicalSpinner: ({ size = 'md', className = '', ...props }: any) => (
    <Spinner 
      className={`medsight-spinner ${className}`}
      size={size}
      {...props}
    />
  )
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
export const medicalAuthService = new AuthService({
  serviceId: 'medsight-pro',
  apiUrl: process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://auth.g3d.ai',
  storage: { 
    type: 'local', 
    encrypt: true
  },
  session: { 
    timeout: 60 * 15      // 15 minutes for medical security
  },
  logging: { 
    level: 'info'
  }
});

// Medical API Gateway Configuration
export const medicalAPIGateway = new APIGateway({
  port: 3000,
  host: '0.0.0.0',
  cors: {
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    algorithm: 'HS256'
  },
  services: [],
  monitoring: {
    enabled: true,
    endpoint: '/metrics',
    interval: 30000
  },
  logging: {
    level: 'info',
    format: 'combined'
  }
});

// Export all shared components with MedSight Pro theming
export {
  // Original shared components (with MedSight Pro theming applied)
  GlassCard,
  GlassButton,
  Modal,
  Progress,
  Tabs,
  Badge,
  Input,
  Select,
  Checkbox,
  Button,
  Card,
  Alert,
  Tooltip,
  Dropdown,
  Accordion,
  Breadcrumb,
  Pagination,
  Table,
  Avatar,
  Spinner,
  Switch,
  Textarea,
  DatePicker,
  TimePicker,
  Slider,
  RadioGroup,
  FileUpload,
  SearchInput,
  
  // Shared services
  AuthService,
  APIGateway,
  AdminDashboard
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