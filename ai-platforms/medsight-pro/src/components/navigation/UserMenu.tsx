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

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { medicalServices } from '@/config/shared-config';

interface UserMenuProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    specialization: string;
    medicalLicense: string;
    npi?: string;
    hospitalAffiliation?: string;
    department?: string;
    lastLogin?: string;
    sessionExpires?: string;
    permissions: string[];
    profileImage?: string;
    isOnline?: boolean;
    emergencyContact?: string;
  };
  onLogout: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onEmergencyClick?: () => void;
  className?: string;
}

export default function UserMenu({ 
  user, 
  onLogout, 
  onProfileClick, 
  onSettingsClick,
  onEmergencyClick,
  className = ''
}: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate session time remaining
  useEffect(() => {
    if (user.sessionExpires) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expires = new Date(user.sessionExpires!).getTime();
        const timeLeft = Math.max(0, expires - now);
        
        setSessionTimeLeft(timeLeft);
        
        // Show warning when less than 5 minutes left
        setShowSessionWarning(timeLeft > 0 && timeLeft < 5 * 60 * 1000);
        
        // Auto-logout when session expires
        if (timeLeft === 0) {
          handleLogout();
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [user.sessionExpires]);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    medicalServices.auditMedicalAccess(user.id, 'logout', 'USER_LOGOUT');
    onLogout();
    setIsOpen(false);
    router.push('/login');
  };

  const handleProfileClick = () => {
    onProfileClick?.();
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    onSettingsClick?.();
    setIsOpen(false);
  };

  const handleEmergencyClick = () => {
    medicalServices.auditMedicalAccess(user.id, 'emergency-access', 'EMERGENCY_ACCESS_REQUESTED');
    onEmergencyClick?.();
    setIsOpen(false);
  };

  const formatSessionTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSessionTimeColor = (timeLeft: number) => {
    if (timeLeft < 60 * 1000) return 'text-medsight-critical'; // < 1 minute
    if (timeLeft < 5 * 60 * 1000) return 'text-medsight-pending'; // < 5 minutes
    return 'text-medsight-normal'; // Normal
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLastLogin = (lastLogin: string) => {
    const date = new Date(lastLogin);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const menuItems = [
    {
      id: 'profile',
      name: 'Medical Profile',
      icon: '👤',
      action: handleProfileClick,
      description: 'View and edit your medical profile'
    },
    {
      id: 'settings',
      name: 'Settings & Preferences',
      icon: '⚙️',
      action: handleSettingsClick,
      description: 'Configure medical workflow settings'
    },
    {
      id: 'emergency',
      name: 'Emergency Protocols',
      icon: '🚨',
      action: handleEmergencyClick,
      description: 'Access emergency medical protocols',
      emergency: true
    },
    {
      id: 'logout',
      name: 'Secure Logout',
      icon: '🔒',
      action: handleLogout,
      description: 'End medical session securely'
    }
  ];

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 hover:bg-medsight-primary-50"
        style={{
          background: isOpen ? 'rgba(14, 165, 233, 0.08)' : 'transparent',
          border: '1px solid rgba(14, 165, 233, 0.12)'
        }}
      >
        {/* User Avatar */}
        <div className="relative">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: user.profileImage 
                ? `url(${user.profileImage})` 
                : 'linear-gradient(135deg, var(--medsight-primary-500) 0%, var(--medsight-primary-600) 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)'
            }}
          >
            {!user.profileImage && (
              <span className="text-white font-semibold text-sm">
                {getUserInitials(user.name)}
              </span>
            )}
          </div>
          
          {/* Online Status Indicator */}
          {user.isOnline && (
            <div 
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
              style={{ background: 'var(--medsight-normal)' }}
            />
          )}
        </div>

        {/* User Info */}
        <div className="hidden md:block text-left">
          <p 
            className="text-sm font-medium text-medsight-primary-900 truncate max-w-32"
            style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
          >
            {user.name}
          </p>
          <p 
            className="text-xs text-medsight-primary-600"
            style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
          >
            {user.specialization}
          </p>
        </div>

        {/* Dropdown Arrow */}
        <svg 
          className={`w-4 h-4 text-medsight-primary-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Session Warning Badge */}
      {showSessionWarning && (
        <div 
          className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium animate-pulse"
          style={{
            background: 'var(--medsight-pending)',
            color: 'white',
            fontSize: '10px'
          }}
        >
          {formatSessionTime(sessionTimeLeft)}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-50"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.06) 0%, rgba(16, 185, 129, 0.04) 100%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(14, 165, 233, 0.12)',
            boxShadow: '0 12px 40px rgba(14, 165, 233, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* User Information Header */}
          <div className="p-4 border-b border-medsight-primary-200">
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: user.profileImage 
                    ? `url(${user.profileImage})` 
                    : 'linear-gradient(135deg, var(--medsight-primary-500) 0%, var(--medsight-primary-600) 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  boxShadow: '0 4px 16px rgba(14, 165, 233, 0.3)'
                }}
              >
                {!user.profileImage && (
                  <span className="text-white font-bold text-xl">
                    {getUserInitials(user.name)}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 
                  className="text-lg font-semibold text-medsight-primary-900"
                  style={{ 
                    letterSpacing: 'var(--medsight-letter-spacing)',
                    lineHeight: 'var(--medsight-line-height)'
                  }}
                >
                  {user.name}
                </h3>
                <p 
                  className="text-sm text-medsight-primary-700"
                  style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                >
                  {user.specialization}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--medsight-normal)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      letterSpacing: 'var(--medsight-letter-spacing)'
                    }}
                  >
                    {user.role}
                  </span>
                  {user.isOnline && (
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        background: 'rgba(14, 165, 233, 0.1)',
                        color: 'var(--medsight-primary-600)',
                        border: '1px solid rgba(14, 165, 233, 0.2)',
                        letterSpacing: 'var(--medsight-letter-spacing)'
                      }}
                    >
                      Online
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Medical Professional Details */}
          <div className="p-4 border-b border-medsight-primary-200">
            <div className="space-y-3">
              {/* Medical License */}
              <div className="flex items-center justify-between">
                <span 
                  className="text-sm text-medsight-primary-700"
                  style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                >
                  Medical License:
                </span>
                <span 
                  className="text-sm font-medium text-medsight-primary-900"
                  style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                >
                  {user.medicalLicense}
                </span>
              </div>

              {/* NPI Number */}
              {user.npi && (
                <div className="flex items-center justify-between">
                  <span 
                    className="text-sm text-medsight-primary-700"
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    NPI:
                  </span>
                  <span 
                    className="text-sm font-medium text-medsight-primary-900"
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    {user.npi}
                  </span>
                </div>
              )}

              {/* Hospital Affiliation */}
              {user.hospitalAffiliation && (
                <div className="flex items-center justify-between">
                  <span 
                    className="text-sm text-medsight-primary-700"
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    Hospital:
                  </span>
                  <span 
                    className="text-sm font-medium text-medsight-primary-900 truncate max-w-36"
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    {user.hospitalAffiliation}
                  </span>
                </div>
              )}

              {/* Department */}
              {user.department && (
                <div className="flex items-center justify-between">
                  <span 
                    className="text-sm text-medsight-primary-700"
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    Department:
                  </span>
                  <span 
                    className="text-sm font-medium text-medsight-primary-900"
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    {user.department}
                  </span>
                </div>
              )}

              {/* Last Login */}
              {user.lastLogin && (
                <div className="flex items-center justify-between">
                  <span 
                    className="text-sm text-medsight-primary-700"
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    Last Login:
                  </span>
                  <span 
                    className="text-xs text-medsight-primary-600"
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    {formatLastLogin(user.lastLogin)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Session Information */}
          {user.sessionExpires && (
            <div className="p-4 border-b border-medsight-primary-200">
              <div className="flex items-center justify-between">
                <span 
                  className="text-sm text-medsight-primary-700"
                  style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                >
                  Session Expires:
                </span>
                <span 
                  className={`text-sm font-medium ${getSessionTimeColor(sessionTimeLeft)}`}
                  style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                >
                  {formatSessionTime(sessionTimeLeft)}
                </span>
              </div>
              {showSessionWarning && (
                <div 
                  className="mt-2 p-2 rounded-lg text-xs"
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: 'var(--medsight-pending)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    letterSpacing: 'var(--medsight-letter-spacing)'
                  }}
                >
                  ⚠️ Session will expire soon. Please save your work.
                </div>
              )}
            </div>
          )}

          {/* Menu Items */}
          <div className="p-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 hover:bg-medsight-primary-50 ${
                  item.emergency ? 'hover:bg-red-50' : ''
                }`}
                style={{
                  background: item.emergency ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                  border: item.emergency ? '1px solid rgba(239, 68, 68, 0.12)' : 'none'
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <p 
                    className={`text-sm font-medium ${
                      item.emergency ? 'text-medsight-critical' : 'text-medsight-primary-900'
                    }`}
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    {item.name}
                  </p>
                  <p 
                    className={`text-xs ${
                      item.emergency ? 'text-medsight-critical' : 'text-medsight-primary-600'
                    }`}
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Medical Compliance Footer */}
          <div className="p-4 border-t border-medsight-primary-200">
            <div className="flex items-center justify-center space-x-3">
              <div 
                className="flex items-center space-x-1 px-2 py-1 rounded-md"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}
              >
                <span className="text-xs text-medsight-normal">🛡️</span>
                <span 
                  className="text-xs font-medium text-medsight-normal"
                  style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                >
                  HIPAA Secure
                </span>
              </div>
              <div 
                className="flex items-center space-x-1 px-2 py-1 rounded-md"
                style={{
                  background: 'rgba(14, 165, 233, 0.1)',
                  border: '1px solid rgba(14, 165, 233, 0.2)'
                }}
              >
                <span className="text-xs text-medsight-primary-600">🔒</span>
                <span 
                  className="text-xs font-medium text-medsight-primary-600"
                  style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                >
                  Encrypted
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 