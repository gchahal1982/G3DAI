/**
 * MedicalNavigation.tsx
 * Main navigation component for MedSight Pro with medical-themed glassmorphism design
 * 
 * Features:
 * - Role-based navigation filtering (Radiologist, Attending, Resident, Admin)
 * - Hierarchical navigation with collapsible medical workspaces
 * - Emergency access protocols with animated emergency buttons
 * - Medical compliance badges (HIPAA Compliant, DICOM Certified)
 * - Responsive mobile support with medical workflow optimization
 * - Real-time notification indicators for medical alerts
 * - Medical professional profile integration
 * - Session timeout warnings with medical safety protocols
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  CubeIcon, 
  ChartBarIcon, 
  CogIcon, 
  UserGroupIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  BeakerIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
// Mock useAuth hook for now - will be replaced with actual auth context
const useAuth = () => ({
  user: {
    name: 'Dr. Sarah Johnson',
    role: 'radiologist',
    specialization: 'Radiology',
    medicalLicense: 'MD-12345',
    licenseVerified: true,
    hospitalAffiliation: 'General Hospital'
  },
  isAuthenticated: true
});
import { MedSightUI, medicalClasses, medicalUtils } from '@/lib/shared-ui';

// Medical navigation item interface
interface MedicalNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  roles: string[];
  children?: MedicalNavItem[];
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'error' | 'info';
  };
  emergency?: boolean;
  requiresLicense?: boolean;
  complianceLevel?: 'basic' | 'advanced' | 'enterprise';
}

// Medical navigation configuration
const medicalNavigation: MedicalNavItem[] = [
  {
    id: 'dashboard',
    label: 'Medical Dashboard',
    icon: HomeIcon,
    href: '/dashboard/medical',
    roles: ['radiologist', 'physician', 'technician', 'admin'],
    badge: { text: 'Active', variant: 'success' }
  },
  {
    id: 'workspaces',
    label: 'Medical Workspaces',
    icon: ComputerDesktopIcon,
    href: '/workspace',
    roles: ['radiologist', 'physician', 'technician'],
    children: [
      {
        id: 'imaging',
        label: 'Medical Imaging',
        icon: EyeIcon,
        href: '/workspace/imaging',
        roles: ['radiologist', 'physician'],
        requiresLicense: true,
        complianceLevel: 'advanced'
      },
      {
        id: 'ai-analysis',
        label: 'AI Analysis',
        icon: BeakerIcon,
        href: '/workspace/ai-analysis',
        roles: ['radiologist', 'physician'],
        requiresLicense: true,
        complianceLevel: 'enterprise'
      },
      {
        id: 'collaboration',
        label: 'Collaboration',
        icon: UserGroupIcon,
        href: '/workspace/collaboration',
        roles: ['radiologist', 'physician', 'technician'],
        badge: { text: '3 Active', variant: 'info' }
      },
      {
        id: 'performance',
        label: 'Performance Monitor',
        icon: ChartBarIcon,
        href: '/workspace/performance',
        roles: ['admin', 'technician']
      }
    ]
  },
  {
    id: 'studies',
    label: 'Medical Studies',
    icon: ClipboardDocumentListIcon,
    href: '/medical/studies',
    roles: ['radiologist', 'physician', 'technician'],
    badge: { text: '12 Pending', variant: 'warning' }
  },
  {
    id: 'patients',
    label: 'Patient Management',
    icon: UserCircleIcon,
    href: '/medical/patients',
    roles: ['radiologist', 'physician'],
    requiresLicense: true,
    complianceLevel: 'advanced'
  },
  {
    id: 'workflow',
    label: 'Clinical Workflow',
    icon: DocumentTextIcon,
    href: '/medical/workflow',
    roles: ['radiologist', 'physician', 'technician'],
    complianceLevel: 'basic'
  },
  {
    id: 'analytics',
    label: 'Medical Analytics',
    icon: ChartBarIcon,
    href: '/dashboard/analytics',
    roles: ['admin', 'physician'],
    complianceLevel: 'enterprise'
  },
  {
    id: 'admin',
    label: 'System Administration',
    icon: CogIcon,
    href: '/admin',
    roles: ['admin'],
    children: [
      {
        id: 'users',
        label: 'User Management',
        icon: UserGroupIcon,
        href: '/admin/users',
        roles: ['admin']
      },
      {
        id: 'organizations',
        label: 'Organizations',
        icon: BuildingOfficeIcon,
        href: '/admin/organizations',
        roles: ['admin']
      },
      {
        id: 'compliance',
        label: 'Compliance Monitor',
        icon: ShieldCheckIcon,
        href: '/admin/compliance',
        roles: ['admin'],
        badge: { text: 'All Clear', variant: 'success' }
      }
    ]
  }
];

// Emergency navigation items
const emergencyNavigation: MedicalNavItem[] = [
  {
    id: 'emergency-alert',
    label: 'Emergency Alert',
    icon: ExclamationTriangleIcon,
    href: '/emergency/alert',
    roles: ['radiologist', 'physician', 'technician', 'admin'],
    emergency: true
  },
  {
    id: 'emergency-access',
    label: 'Emergency Access',
    icon: ShieldCheckIcon,
    href: '/emergency/access',
    roles: ['radiologist', 'physician', 'admin'],
    emergency: true
  }
];

export default function MedicalNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  
  // Navigation state
  const [expandedItems, setExpandedItems] = useState<string[]>(['workspaces']);
  const [notifications, setNotifications] = useState(5);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(15 * 60); // 15 minutes in seconds
  
  // Session timeout countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTimeout(prev => {
        if (prev <= 1) {
          // Session expired - redirect to login
          router.push('/login?reason=session-expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [router]);
  
  // Format session timeout display
  const formatSessionTimeout = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Get session timeout color
  const getSessionTimeoutColor = (seconds: number) => {
    if (seconds <= 60) return 'text-medsight-critical'; // Red - Critical
    if (seconds <= 300) return 'text-medsight-pending'; // Yellow - Warning
    return 'text-medsight-normal'; // Green - Normal
  };
  
  // Check if user has role access
  const hasRoleAccess = (roles: string[]) => {
    if (!user?.role) return false;
    return roles.includes(user.role) || roles.includes('admin');
  };
  
  // Check if user has license requirement
  const hasLicenseAccess = (requiresLicense?: boolean) => {
    if (!requiresLicense) return true;
    return user?.medicalLicense && user?.licenseVerified;
  };
  
  // Toggle expanded item
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  // Handle navigation
  const handleNavigation = (item: MedicalNavItem) => {
    // Check access permissions
    if (!hasRoleAccess(item.roles)) {
      console.warn('Access denied: Insufficient role permissions');
      return;
    }
    
    if (!hasLicenseAccess(item.requiresLicense)) {
      console.warn('Access denied: Medical license required');
      return;
    }
    
    // Navigate to item
    router.push(item.href);
  };
  
  // Handle emergency action
  const handleEmergencyAction = (action: string) => {
    setEmergencyMode(true);
    
    // Emergency actions
    switch (action) {
      case 'alert':
        // Trigger emergency alert
        console.log('Emergency alert triggered');
        break;
      case 'access':
        // Activate emergency access
        console.log('Emergency access activated');
        break;
    }
    
    // Reset emergency mode after 5 seconds
    setTimeout(() => setEmergencyMode(false), 5000);
  };
  
  // Render navigation item
  const renderNavItem = (item: MedicalNavItem, level: number = 0) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const hasAccess = hasRoleAccess(item.roles) && hasLicenseAccess(item.requiresLicense);
    
    if (!hasAccess) return null;
    
    return (
      <div key={item.id} className="mb-1">
        <motion.div
          className={`
            relative flex items-center justify-between p-3 rounded-lg cursor-pointer
            transition-all duration-200 group
            ${isActive 
              ? `${medicalClasses.glass.primary} bg-medsight-primary/20 border-medsight-primary/30` 
              : 'hover:bg-medsight-primary/10 hover:border-medsight-primary/20'
            }
            ${level > 0 ? 'ml-4 border-l-2 border-medsight-primary/20' : ''}
            ${item.emergency ? 'border-medsight-critical/50' : ''}
          `}
          onClick={() => hasChildren ? toggleExpanded(item.id) : handleNavigation(item)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              className={`
                p-2 rounded-lg
                ${isActive 
                  ? 'bg-medsight-primary text-white' 
                  : 'bg-medsight-primary/10 text-medsight-primary group-hover:bg-medsight-primary/20'
                }
                ${item.emergency ? 'animate-pulse bg-medsight-critical text-white' : ''}
              `}
              animate={item.emergency && emergencyMode ? {
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ duration: 0.5, repeat: item.emergency && emergencyMode ? Infinity : 0 }}
            >
              <item.icon className="w-5 h-5" />
            </motion.div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className={`
                  font-medium text-sm
                  ${isActive ? 'text-medsight-primary' : 'text-gray-700 dark:text-gray-300'}
                `}>
                  {item.label}
                </span>
                
                                 {item.badge && (
                   <span className={`
                     text-xs px-2 py-1 rounded-full font-medium
                     ${item.badge.variant === 'success' ? 'bg-medsight-normal/20 text-medsight-normal' :
                       item.badge.variant === 'warning' ? 'bg-medsight-pending/20 text-medsight-pending' :
                       item.badge.variant === 'error' ? 'bg-medsight-critical/20 text-medsight-critical' :
                       'bg-medsight-primary/20 text-medsight-primary'}
                   `}>
                     {item.badge.text}
                   </span>
                 )}
                
                {item.requiresLicense && (
                  <AcademicCapIcon className="w-4 h-4 text-medsight-accent" title="Medical License Required" />
                )}
                
                {item.complianceLevel && (
                  <ShieldCheckIcon 
                    className={`w-4 h-4 ${
                      item.complianceLevel === 'enterprise' ? 'text-medsight-accent' :
                      item.complianceLevel === 'advanced' ? 'text-medsight-primary' :
                      'text-medsight-secondary'
                    }`}
                    title={`${item.complianceLevel.charAt(0).toUpperCase() + item.complianceLevel.slice(1)} Compliance`}
                  />
                )}
              </div>
              
              {item.emergency && (
                <div className="text-xs text-medsight-critical font-medium mt-1">
                  Emergency Access
                </div>
              )}
            </div>
            
            {hasChildren && (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRightIcon className="w-4 h-4 text-gray-500" />
              </motion.div>
            )}
          </div>
        </motion.div>
        
        {/* Submenu */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 space-y-1"
            >
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  if (!isAuthenticated) return null;
  
  return (
    <nav className={`${medicalClasses.glass.sidebar} h-full flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-medsight-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MS</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-medsight-primary">MedSight Pro</h1>
              <p className="text-xs text-gray-500">Medical Platform</p>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <BellIcon className="w-6 h-6 text-gray-500 cursor-pointer hover:text-medsight-primary" />
            {notifications > 0 && (
              <span className="absolute -top-2 -right-2 bg-medsight-critical text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </div>
        </div>
        
        {/* Session Timeout */}
        <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">Session Timeout</span>
            <span className={`text-xs font-mono font-medium ${getSessionTimeoutColor(sessionTimeout)}`}>
              {formatSessionTimeout(sessionTimeout)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Medical Compliance Badges */}
      <div className="p-4 border-b border-medsight-primary/20">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2 p-2 bg-medsight-secondary/10 rounded-lg">
            <ShieldCheckIcon className="w-4 h-4 text-medsight-secondary" />
            <span className="text-xs font-medium text-medsight-secondary">HIPAA</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-medsight-primary/10 rounded-lg">
            <CubeIcon className="w-4 h-4 text-medsight-primary" />
            <span className="text-xs font-medium text-medsight-primary">DICOM</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-medsight-accent/10 rounded-lg">
            <AcademicCapIcon className="w-4 h-4 text-medsight-accent" />
            <span className="text-xs font-medium text-medsight-accent">FDA II</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-medsight-secondary/10 rounded-lg">
            <DocumentTextIcon className="w-4 h-4 text-medsight-secondary" />
            <span className="text-xs font-medium text-medsight-secondary">HL7</span>
          </div>
        </div>
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {medicalNavigation.map(item => renderNavItem(item))}
        </div>
        
        {/* Emergency Section */}
        <div className="mt-8 pt-4 border-t border-medsight-critical/20">
          <h3 className="text-sm font-medium text-medsight-critical mb-3 flex items-center">
            <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
            Emergency Access
          </h3>
          <div className="space-y-2">
            {emergencyNavigation.map(item => renderNavItem(item))}
          </div>
        </div>
      </div>
      
      {/* Medical Professional Info */}
      <div className="p-4 border-t border-medsight-primary/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-medsight-primary/10 rounded-full flex items-center justify-center">
            <UserCircleIcon className="w-6 h-6 text-medsight-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.name || 'Medical Professional'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role || 'Role'} • {user?.specialization || 'General'}
            </p>
            {user?.medicalLicense && (
              <p className="text-xs text-medsight-secondary">
                License: {user.medicalLicense}
              </p>
            )}
          </div>
        </div>
        
        {/* Hospital Affiliation */}
        {user?.hospitalAffiliation && (
          <div className="mt-3 p-2 bg-medsight-primary/5 rounded-lg">
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="w-4 h-4 text-medsight-primary" />
              <span className="text-xs text-medsight-primary font-medium">
                {user.hospitalAffiliation}
              </span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 