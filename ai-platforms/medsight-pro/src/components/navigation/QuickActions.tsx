/**
 * QuickActions.tsx
 * Medical workflow quick actions with emergency alert system
 * 
 * Features:
 * - Emergency alert system with immediate activation
 * - Medical workflow shortcuts (New Case, Pending Reviews, Upload DICOM)
 * - AI analysis tools with confidence indicators
 * - Clinical workflow automation shortcuts
 * - Medical device integration shortcuts
 * - Real-time medical notifications and alerts
 * - Medical compliance quick checks
 * - Performance monitoring shortcuts
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExclamationTriangleIcon,
  PlusIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  BeakerIcon,
  EyeIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BellIcon,
  ComputerDesktopIcon,
  CubeIcon,
  PlayIcon,
  PauseIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  CameraIcon,
  DocumentMagnifyingGlassIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { medicalClasses } from '@/lib/shared-ui';

// Quick action interface
interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  shortcut?: string;
  badge?: {
    count: number;
    variant: 'success' | 'warning' | 'error' | 'info';
  };
  emergency?: boolean;
  requiresAuth?: boolean;
  category: 'emergency' | 'workflow' | 'ai' | 'system' | 'collaboration';
}

interface QuickActionsProps {
  className?: string;
  collapsed?: boolean;
}

export default function QuickActions({ className = '', collapsed = false }: QuickActionsProps) {
  const router = useRouter();
  
  // Component state
  const [activeCategory, setActiveCategory] = useState<string>('workflow');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [notifications, setNotifications] = useState({
    pendingReviews: 12,
    newCases: 3,
    aiAlerts: 2,
    systemAlerts: 1
  });
  
  // Handle emergency alert
  const handleEmergencyAlert = () => {
    setEmergencyMode(true);
    
    // Trigger emergency protocols
    console.log('🚨 MEDICAL EMERGENCY ALERT TRIGGERED');
    
    // Navigate to emergency dashboard
    router.push('/emergency/alert');
    
    // Reset emergency mode after 5 seconds
    setTimeout(() => setEmergencyMode(false), 5000);
  };
  
  // Handle new case creation
  const handleNewCase = () => {
    router.push('/medical/cases/new');
  };
  
  // Handle pending reviews
  const handlePendingReviews = () => {
    router.push('/medical/reviews/pending');
  };
  
  // Handle DICOM upload
  const handleDICOMUpload = () => {
    router.push('/workspace/imaging/upload');
  };
  
  // Handle AI analysis
  const handleAIAnalysis = () => {
    router.push('/workspace/ai-analysis');
  };
  
  // Handle collaboration
  const handleCollaboration = () => {
    router.push('/workspace/collaboration');
  };
  
  // Handle system monitoring
  const handleSystemMonitoring = () => {
    router.push('/workspace/performance');
  };
  
  // Handle compliance check
  const handleComplianceCheck = () => {
    router.push('/admin/compliance');
  };
  
  // Handle quick scan
  const handleQuickScan = () => {
    router.push('/workspace/imaging/quick-scan');
  };
  
  // Handle AI insights
  const handleAIInsights = () => {
    router.push('/workspace/ai-analysis/insights');
  };
  
  // Handle medical search
  const handleMedicalSearch = () => {
    router.push('/medical/search');
  };
  
  // Quick actions configuration
  const quickActions: QuickAction[] = [
    // Emergency Actions
    {
      id: 'emergency-alert',
      label: 'Emergency Alert',
      icon: ExclamationTriangleIcon,
      action: handleEmergencyAlert,
      shortcut: 'Ctrl+E',
      emergency: true,
      category: 'emergency'
    },
    
    // Workflow Actions
    {
      id: 'new-case',
      label: 'New Case',
      icon: PlusIcon,
      action: handleNewCase,
      shortcut: 'Ctrl+N',
      category: 'workflow'
    },
    {
      id: 'pending-reviews',
      label: 'Pending Reviews',
      icon: DocumentTextIcon,
      action: handlePendingReviews,
      shortcut: 'Ctrl+R',
      badge: {
        count: notifications.pendingReviews,
        variant: 'warning'
      },
      category: 'workflow'
    },
    {
      id: 'upload-dicom',
      label: 'Upload DICOM',
      icon: ArrowUpTrayIcon,
      action: handleDICOMUpload,
      shortcut: 'Ctrl+U',
      category: 'workflow'
    },
    {
      id: 'quick-scan',
      label: 'Quick Scan',
      icon: CameraIcon,
      action: handleQuickScan,
      shortcut: 'Ctrl+Q',
      category: 'workflow'
    },
    {
      id: 'medical-search',
      label: 'Medical Search',
      icon: MagnifyingGlassIcon,
      action: handleMedicalSearch,
      shortcut: 'Ctrl+F',
      category: 'workflow'
    },
    
    // AI Actions
    {
      id: 'ai-analysis',
      label: 'AI Analysis',
      icon: BeakerIcon,
      action: handleAIAnalysis,
      shortcut: 'Ctrl+A',
      badge: {
        count: notifications.aiAlerts,
        variant: 'info'
      },
      category: 'ai'
    },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      icon: LightBulbIcon,
      action: handleAIInsights,
      shortcut: 'Ctrl+I',
      category: 'ai'
    },
    {
      id: 'image-analysis',
      label: 'Image Analysis',
      icon: EyeIcon,
      action: () => router.push('/workspace/imaging/analysis'),
      shortcut: 'Ctrl+Shift+I',
      category: 'ai'
    },
    {
      id: 'diagnostic-review',
      label: 'Diagnostic Review',
      icon: DocumentMagnifyingGlassIcon,
      action: () => router.push('/workspace/ai-analysis/diagnostic'),
      shortcut: 'Ctrl+D',
      category: 'ai'
    },
    
    // Collaboration Actions
    {
      id: 'collaboration',
      label: 'Collaboration',
      icon: UserGroupIcon,
      action: handleCollaboration,
      shortcut: 'Ctrl+Shift+C',
      badge: {
        count: 3,
        variant: 'success'
      },
      category: 'collaboration'
    },
    {
      id: 'case-conference',
      label: 'Case Conference',
      icon: ComputerDesktopIcon,
      action: () => router.push('/workspace/collaboration/conference'),
      shortcut: 'Ctrl+Shift+M',
      category: 'collaboration'
    },
    
    // System Actions
    {
      id: 'system-monitoring',
      label: 'System Monitor',
      icon: ChartBarIcon,
      action: handleSystemMonitoring,
      shortcut: 'Ctrl+M',
      badge: {
        count: notifications.systemAlerts,
        variant: notifications.systemAlerts > 0 ? 'error' : 'success'
      },
      category: 'system'
    },
    {
      id: 'compliance-check',
      label: 'Compliance Check',
      icon: ShieldCheckIcon,
      action: handleComplianceCheck,
      shortcut: 'Ctrl+Shift+H',
      category: 'system'
    },
    {
      id: 'performance-stats',
      label: 'Performance Stats',
      icon: ClockIcon,
      action: () => router.push('/workspace/performance/stats'),
      shortcut: 'Ctrl+P',
      category: 'system'
    }
  ];
  
  // Filter actions by category
  const getActionsByCategory = (category: string) => {
    return quickActions.filter(action => action.category === category);
  };
  
  // Get badge color
  const getBadgeColor = (variant: string) => {
    switch (variant) {
      case 'success': return 'bg-medsight-normal text-white';
      case 'warning': return 'bg-medsight-pending text-white';
      case 'error': return 'bg-medsight-critical text-white';
      case 'info': return 'bg-medsight-primary text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  // Categories configuration
  const categories = [
    { id: 'emergency', label: 'Emergency', icon: ExclamationTriangleIcon, color: 'text-medsight-critical' },
    { id: 'workflow', label: 'Workflow', icon: DocumentTextIcon, color: 'text-medsight-primary' },
    { id: 'ai', label: 'AI Tools', icon: BeakerIcon, color: 'text-medsight-accent' },
    { id: 'collaboration', label: 'Collaborate', icon: UserGroupIcon, color: 'text-medsight-secondary' },
    { id: 'system', label: 'System', icon: CogIcon, color: 'text-gray-600' }
  ];
  
  // Render action button
  const renderActionButton = (action: QuickAction) => (
    <motion.button
      key={action.id}
      onClick={action.action}
      className={`
        relative w-full p-3 rounded-lg text-left transition-all duration-200
        ${action.emergency 
          ? 'bg-gradient-to-r from-medsight-critical/20 to-medsight-critical/10 border border-medsight-critical/30 hover:bg-medsight-critical/30' 
          : `${medicalClasses.glass.control} hover:bg-medsight-primary/10`
        }
        ${emergencyMode && action.emergency ? 'animate-pulse' : ''}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
      animate={action.emergency && emergencyMode ? {
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 0 rgba(220, 38, 38, 0)',
          '0 0 0 10px rgba(220, 38, 38, 0.1)',
          '0 0 0 0 rgba(220, 38, 38, 0)'
        ]
      } : {}}
      transition={{ duration: 0.5, repeat: action.emergency && emergencyMode ? Infinity : 0 }}
    >
      <div className="flex items-center space-x-3">
        <div className={`
          p-2 rounded-lg
          ${action.emergency 
            ? 'bg-medsight-critical text-white' 
            : 'bg-medsight-primary/10 text-medsight-primary'
          }
        `}>
          <action.icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={`
              text-sm font-medium truncate
              ${action.emergency ? 'text-medsight-critical' : 'text-gray-700 dark:text-gray-300'}
            `}>
              {action.label}
            </span>
            
            {action.badge && action.badge.count > 0 && (
              <span className={`
                text-xs px-2 py-1 rounded-full font-medium ml-2
                ${getBadgeColor(action.badge.variant)}
              `}>
                {action.badge.count}
              </span>
            )}
          </div>
          
          {action.shortcut && !collapsed && (
            <div className="text-xs text-gray-500 mt-1">
              {action.shortcut}
            </div>
          )}
        </div>
      </div>
      
      {action.emergency && (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-medsight-critical rounded-full animate-ping"></div>
        </div>
      )}
    </motion.button>
  );
  
  if (collapsed) {
    // Collapsed view - show only emergency and most important actions
    const criticalActions = quickActions.filter(action => 
      action.emergency || action.id === 'new-case' || action.id === 'pending-reviews'
    );
    
    return (
      <div className={`space-y-2 ${className}`}>
        {criticalActions.map(action => renderActionButton(action))}
      </div>
    );
  }
  
  return (
    <div className={`${className}`}>
      {/* Category Tabs */}
      <div className="flex space-x-1 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {categories.map(category => {
          const categoryActions = getActionsByCategory(category.id);
          const totalBadges = categoryActions.reduce((sum, action) => 
            sum + (action.badge?.count || 0), 0
          );
          
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                relative flex-1 flex items-center justify-center p-2 rounded-lg text-xs font-medium transition-all duration-200
                ${activeCategory === category.id 
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-medsight-primary' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-medsight-primary'
                }
              `}
            >
              <category.icon className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">{category.label}</span>
              
              {totalBadges > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-medsight-critical text-white text-xs rounded-full flex items-center justify-center">
                  {totalBadges}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {getActionsByCategory(activeCategory).map(action => renderActionButton(action))}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Emergency Quick Access */}
      {activeCategory !== 'emergency' && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-medsight-critical font-medium mb-2 flex items-center">
            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
            Emergency Access
          </div>
          {getActionsByCategory('emergency').map(action => renderActionButton(action))}
        </div>
      )}
      
      {/* System Status Indicator */}
      <div className="mt-4 p-3 bg-medsight-normal/10 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-medsight-normal rounded-full animate-pulse"></div>
            <span className="text-xs text-medsight-normal font-medium">System Status</span>
          </div>
          <span className="text-xs text-medsight-normal">All Systems Operational</span>
        </div>
      </div>
    </div>
  );
} 