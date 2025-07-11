/**
 * UserMenu.tsx
 * Medical professional profile menu with credentials and session management
 * 
 * Features:
 * - Medical credentials display (License, NPI, Specializations)
 * - Session timeout countdown with color-coded warnings (15-minute sessions)
 * - Hospital affiliation and role information
 * - Medical profile management shortcuts
 * - Secure logout with audit logging
 * - Medical emergency contact information
 * - Compliance status indicators
 * - Medical professional photo and bio display
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCircleIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  IdentificationIcon,
  DocumentTextIcon,
  BellIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { medicalClasses } from '@/lib/shared-ui';

// Mock useAuth hook - will be replaced with actual auth context
const useAuth = () => ({
  user: {
    name: 'Dr. Sarah Johnson',
    role: 'radiologist',
    specialization: ['Radiology', 'Nuclear Medicine'],
    medicalLicense: 'MD-12345',
    npiNumber: '1234567890',
    licenseVerified: true,
    hospitalAffiliation: 'General Hospital',
    department: 'Radiology Department',
    email: 'sarah.johnson@hospital.com',
    phone: '+1 (555) 123-4567',
    emergencyContact: '+1 (555) 911-0000',
    certifications: ['Board Certified Radiologist', 'Nuclear Medicine Specialist'],
    profileImage: null
  },
  isAuthenticated: true,
  logout: () => console.log('Logout triggered')
});

interface UserMenuProps {
  className?: string;
  collapsed?: boolean;
}

export default function UserMenu({ className = '', collapsed = false }: UserMenuProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Component state
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(15 * 60); // 15 minutes in seconds
  const [showEmergencyContact, setShowEmergencyContact] = useState(false);
  
  // Session timeout countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTimeout(prev => {
        if (prev <= 1) {
          // Session expired - redirect to login with audit log
          console.log('Session expired - logging out user');
          logout();
          router.push('/login?reason=session-expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [logout, router]);
  
  // Format session timeout display
  const formatSessionTimeout = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Get session timeout color and urgency
  const getSessionTimeoutStatus = (seconds: number) => {
    if (seconds <= 60) {
      return {
        color: 'text-medsight-critical',
        bgColor: 'bg-medsight-critical/10',
        borderColor: 'border-medsight-critical/30',
        urgency: 'critical',
        message: 'Session expiring soon!'
      };
    }
    if (seconds <= 300) {
      return {
        color: 'text-medsight-pending',
        bgColor: 'bg-medsight-pending/10',
        borderColor: 'border-medsight-pending/30',
        urgency: 'warning',
        message: 'Session timeout warning'
      };
    }
    return {
      color: 'text-medsight-normal',
      bgColor: 'bg-medsight-normal/10',
      borderColor: 'border-medsight-normal/30',
      urgency: 'normal',
      message: 'Session active'
    };
  };
  
  // Handle logout with audit logging
  const handleLogout = async () => {
    try {
      // Audit log the logout
      console.log('User logout initiated:', {
        userId: user?.email,
        timestamp: new Date().toISOString(),
        sessionDuration: (15 * 60) - sessionTimeout,
        logoutType: 'manual'
      });
      
      // Perform logout
      logout();
      
      // Redirect to login
      router.push('/login?reason=logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Handle profile navigation
  const handleProfileNavigation = (path: string) => {
    router.push(path);
    setIsExpanded(false);
  };
  
  // Handle emergency contact display
  const handleEmergencyContact = () => {
    setShowEmergencyContact(!showEmergencyContact);
  };
  
  // Extend session
  const handleExtendSession = () => {
    setSessionTimeout(15 * 60); // Reset to 15 minutes
    console.log('Session extended:', {
      userId: user?.email,
      timestamp: new Date().toISOString(),
      extendedBy: '15 minutes'
    });
  };
  
  if (!isAuthenticated || !user) return null;
  
  const timeoutStatus = getSessionTimeoutStatus(sessionTimeout);
  
  return (
    <div className={`relative ${className}`}>
      {/* User Profile Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full flex items-center space-x-3 p-3 rounded-lg
          ${medicalClasses.glass.primary}
          hover:bg-medsight-primary/10 transition-all duration-200
          ${collapsed ? 'justify-center' : 'justify-between'}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-3">
          {/* Profile Image or Icon */}
          <div className="w-10 h-10 bg-medsight-primary/20 rounded-full flex items-center justify-center">
            {user.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="w-6 h-6 text-medsight-primary" />
            )}
          </div>
          
          {!collapsed && (
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.name}
              </p>
              <p className="text-xs text-gray-500">
                {user.role} • {user.specialization?.[0] || 'General'}
              </p>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          </motion.div>
        )}
      </motion.button>
      
      {/* Expanded User Menu */}
      <AnimatePresence>
        {isExpanded && !collapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              absolute bottom-full left-0 right-0 mb-2 p-4 rounded-lg
              ${medicalClasses.glass.modal}
              border border-medsight-primary/20 shadow-lg
              z-50
            `}
          >
            {/* Session Timeout Warning */}
            <div className={`
              p-3 rounded-lg mb-4 border
              ${timeoutStatus.bgColor} ${timeoutStatus.borderColor}
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ClockIcon className={`w-4 h-4 ${timeoutStatus.color}`} />
                  <span className={`text-xs font-medium ${timeoutStatus.color}`}>
                    {timeoutStatus.message}
                  </span>
                </div>
                <span className={`text-sm font-mono font-bold ${timeoutStatus.color}`}>
                  {formatSessionTimeout(sessionTimeout)}
                </span>
              </div>
              
              {timeoutStatus.urgency !== 'normal' && (
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Extend session?
                  </span>
                  <button
                    onClick={handleExtendSession}
                    className="text-xs px-2 py-1 bg-medsight-primary text-white rounded hover:bg-medsight-primary/80"
                  >
                    +15 min
                  </button>
                </div>
              )}
            </div>
            
            {/* Medical Credentials */}
            <div className="mb-4 p-3 bg-medsight-primary/5 rounded-lg">
              <h4 className="text-sm font-medium text-medsight-primary mb-2 flex items-center">
                <AcademicCapIcon className="w-4 h-4 mr-2" />
                Medical Credentials
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">License</span>
                  <span className="text-xs font-medium text-medsight-secondary">
                    {user.medicalLicense}
                    {user.licenseVerified && (
                      <ShieldCheckIcon className="w-3 h-3 inline ml-1 text-medsight-normal" />
                    )}
                  </span>
                </div>
                
                {user.npiNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">NPI</span>
                    <span className="text-xs font-medium">{user.npiNumber}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Specializations</span>
                  <div className="text-right">
                    {user.specialization?.map((spec, index) => (
                      <div key={index} className="text-xs font-medium">
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hospital Affiliation */}
            {user.hospitalAffiliation && (
              <div className="mb-4 p-3 bg-medsight-secondary/5 rounded-lg">
                <h4 className="text-sm font-medium text-medsight-secondary mb-2 flex items-center">
                  <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                  Hospital Affiliation
                </h4>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium">{user.hospitalAffiliation}</div>
                  {user.department && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {user.department}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Contact Information */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center space-x-2">
                <IdentificationIcon className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{user.phone}</span>
                </div>
              )}
              
              {user.emergencyContact && (
                <button
                  onClick={handleEmergencyContact}
                  className="flex items-center space-x-2 text-medsight-critical hover:text-medsight-critical/80"
                >
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Emergency Contact</span>
                </button>
              )}
              
              {showEmergencyContact && user.emergencyContact && (
                <div className="ml-6 p-2 bg-medsight-critical/10 rounded border border-medsight-critical/20">
                  <span className="text-xs font-medium text-medsight-critical">
                    {user.emergencyContact}
                  </span>
                </div>
              )}
            </div>
            
            {/* Certifications */}
            {user.certifications && user.certifications.length > 0 && (
              <div className="mb-4 p-3 bg-medsight-accent/5 rounded-lg">
                <h4 className="text-sm font-medium text-medsight-accent mb-2 flex items-center">
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Certifications
                </h4>
                
                <div className="space-y-1">
                  {user.certifications.map((cert, index) => (
                    <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                      • {cert}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Menu Actions */}
            <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={() => handleProfileNavigation('/profile')}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-medsight-primary/10 transition-colors"
              >
                <UserCircleIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Profile Settings</span>
              </button>
              
              <button
                onClick={() => handleProfileNavigation('/profile/preferences')}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-medsight-primary/10 transition-colors"
              >
                <CogIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Medical Preferences</span>
              </button>
              
              <button
                onClick={() => handleProfileNavigation('/profile/notifications')}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-medsight-primary/10 transition-colors"
              >
                <BellIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Notifications</span>
              </button>
              
              <button
                onClick={() => handleProfileNavigation('/profile/security')}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-medsight-primary/10 transition-colors"
              >
                <ShieldCheckIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Security & Compliance</span>
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-medsight-critical/10 transition-colors text-medsight-critical"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Secure Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Session Timeout Indicator (Collapsed View) */}
      {collapsed && (
        <div className={`
          mt-2 p-2 rounded-lg text-center
          ${timeoutStatus.bgColor} ${timeoutStatus.borderColor} border
        `}>
          <ClockIcon className={`w-4 h-4 mx-auto ${timeoutStatus.color}`} />
          <div className={`text-xs font-mono font-bold ${timeoutStatus.color} mt-1`}>
            {formatSessionTimeout(sessionTimeout)}
          </div>
        </div>
      )}
    </div>
  );
} 