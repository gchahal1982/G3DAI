'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { medicalServices } from '@/config/shared-config';

interface MedicalNavigationProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    specialization: string;
    medicalLicense: string;
    permissions: string[];
  };
  onEmergencyAccess?: () => void;
  onNotificationClick?: () => void;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export default function MedicalNavigation({ 
  user, 
  onEmergencyAccess, 
  onNotificationClick,
  className = '',
  collapsed = false,
  onToggleCollapse
}: MedicalNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [emergencyAlerts, setEmergencyAlerts] = useState(0);
  const [systemHealth, setSystemHealth] = useState('normal');

  // Simulated notifications and alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev + Math.floor(Math.random() * 2));
      setEmergencyAlerts(prev => Math.random() < 0.1 ? prev + 1 : prev);
      setSystemHealth(Math.random() < 0.95 ? 'normal' : 'warning');
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Medical navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        name: 'Medical Dashboard',
        path: '/dashboard/medical',
        icon: '🏥',
        description: 'Main clinical workspace',
        permissions: ['view-patient-data'],
        badge: null
      },
      {
        id: 'studies',
        name: 'Medical Studies',
        path: '/workspace/imaging',
        icon: '🔬',
        description: 'DICOM imaging workspace',
        permissions: ['view-dicom-images'],
        badge: null
      },
      {
        id: 'ai-analysis',
        name: 'AI Analysis',
        path: '/workspace/ai-analysis',
        icon: '🤖',
        description: 'Medical AI tools',
        permissions: ['access-ai-tools'],
        badge: 'AI'
      },
      {
        id: 'collaboration',
        name: 'Collaboration',
        path: '/workspace/collaboration',
        icon: '👥',
        description: 'Multi-user review',
        permissions: ['view-patient-data'],
        badge: null
      },
      {
        id: 'reports',
        name: 'Medical Reports',
        path: '/reports',
        icon: '📋',
        description: 'Generate clinical reports',
        permissions: ['generate-reports'],
        badge: null
      }
    ];

    const adminItems = [
      {
        id: 'admin',
        name: 'System Admin',
        path: '/dashboard/admin',
        icon: '⚙️',
        description: 'System administration',
        permissions: ['system-administration'],
        badge: 'Admin'
      },
      {
        id: 'users',
        name: 'User Management',
        path: '/admin/users',
        icon: '👤',
        description: 'Manage medical professionals',
        permissions: ['manage-users'],
        badge: null
      },
      {
        id: 'compliance',
        name: 'Compliance',
        path: '/admin/compliance',
        icon: '🛡️',
        description: 'HIPAA & regulatory compliance',
        permissions: ['compliance-access'],
        badge: 'HIPAA'
      }
    ];

    const enterpriseItems = [
      {
        id: 'enterprise',
        name: 'Enterprise',
        path: '/dashboard/enterprise',
        icon: '🏢',
        description: 'Multi-tenant management',
        permissions: ['system-administration'],
        badge: 'Enterprise'
      },
      {
        id: 'analytics',
        name: 'Analytics',
        path: '/dashboard/analytics',
        icon: '📊',
        description: 'Business intelligence',
        permissions: ['system-administration'],
        badge: null
      }
    ];

    // Filter items based on user permissions
    const userPermissions = user?.permissions || [];
    const filteredItems = [...baseItems];

    if (userPermissions.includes('system-administration') || userPermissions.includes('manage-users')) {
      filteredItems.push(...adminItems);
    }

    if (userPermissions.includes('system-administration')) {
      filteredItems.push(...enterpriseItems);
    }

    return filteredItems.filter(item => 
      item.permissions.some(permission => userPermissions.includes(permission))
    );
  };

  const navigationItems = getNavigationItems();

  const handleEmergencyAccess = () => {
    medicalServices.auditMedicalAccess(user?.id || 'unknown', 'emergency-access', 'EMERGENCY_ACCESS_REQUESTED');
    onEmergencyAccess?.();
  };

  const handleNotificationClick = () => {
    setNotifications(0);
    onNotificationClick?.();
  };

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard/medical' && pathname === '/dashboard') return true;
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid rgba(14, 165, 233, 0.12)',
        boxShadow: '0 8px 32px rgba(14, 165, 233, 0.08)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--medsight-primary-500) 0%, var(--medsight-primary-600) 100%)',
                  boxShadow: '0 4px 16px rgba(14, 165, 233, 0.3)'
                }}
              >
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div className="hidden md:block">
                <h1 
                  className="text-xl font-bold text-medsight-primary-900"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: 'var(--medsight-letter-spacing)'
                  }}
                >
                  MedSight Pro
                </h1>
                <p 
                  className="text-xs text-medsight-primary-600"
                  style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                >
                  Medical AI Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Main Navigation Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActiveRoute(item.path)
                    ? 'text-white shadow-lg'
                    : 'text-medsight-primary-700 hover:text-medsight-primary-900'
                }`}
                style={{
                  background: isActiveRoute(item.path)
                    ? 'linear-gradient(135deg, var(--medsight-primary-500) 0%, var(--medsight-primary-600) 100%)'
                    : 'transparent',
                  boxShadow: isActiveRoute(item.path)
                    ? '0 4px 12px rgba(14, 165, 233, 0.3)'
                    : 'none',
                  letterSpacing: 'var(--medsight-letter-spacing)'
                }}
                onMouseEnter={(e) => {
                  if (!isActiveRoute(item.path)) {
                    e.currentTarget.style.background = 'rgba(14, 165, 233, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActiveRoute(item.path)) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
                title={item.description}
              >
                <div className="flex items-center space-x-2">
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                  {item.badge && (
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--medsight-normal)',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* System Health Indicator */}
            <div 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg"
              style={{
                background: systemHealth === 'normal' 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'rgba(245, 158, 11, 0.1)',
                border: systemHealth === 'normal' 
                  ? '1px solid rgba(16, 185, 129, 0.2)' 
                  : '1px solid rgba(245, 158, 11, 0.2)'
              }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{
                  background: systemHealth === 'normal' 
                    ? 'var(--medsight-normal)' 
                    : 'var(--medsight-pending)'
                }}
              />
              <span 
                className="text-xs font-medium"
                style={{
                  color: systemHealth === 'normal' 
                    ? 'var(--medsight-normal)' 
                    : 'var(--medsight-pending)',
                  letterSpacing: 'var(--medsight-letter-spacing)'
                }}
              >
                {systemHealth === 'normal' ? 'Healthy' : 'Warning'}
              </span>
            </div>

            {/* Notifications */}
            <button
              onClick={handleNotificationClick}
              className="relative p-2 rounded-lg transition-all duration-200 hover:bg-medsight-primary-50"
              style={{
                background: 'rgba(14, 165, 233, 0.08)',
                border: '1px solid rgba(14, 165, 233, 0.12)'
              }}
            >
              <svg className="w-5 h-5 text-medsight-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a1.414 1.414 0 010-2L19 9h-4V7a3 3 0 10-6 0v2H5l2.5 2.5a1.414 1.414 0 010 2L5 17h5m4 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications > 0 && (
                <span 
                  className="absolute -top-1 -right-1 bg-medsight-pending text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ fontSize: '10px' }}
                >
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>

            {/* Emergency Access */}
            <button
              onClick={handleEmergencyAccess}
              className="relative p-2 rounded-lg transition-all duration-200 hover:bg-red-50"
              style={{
                background: emergencyAlerts > 0 
                  ? 'rgba(220, 38, 38, 0.1)' 
                  : 'rgba(239, 68, 68, 0.08)',
                border: emergencyAlerts > 0 
                  ? '1px solid rgba(220, 38, 38, 0.2)' 
                  : '1px solid rgba(239, 68, 68, 0.12)'
              }}
              title="Emergency Access"
            >
              <svg className="w-5 h-5 text-medsight-critical" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {emergencyAlerts > 0 && (
                <span 
                  className="absolute -top-1 -right-1 bg-medsight-critical text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse"
                  style={{ fontSize: '10px' }}
                >
                  {emergencyAlerts}
                </span>
              )}
            </button>

            {/* User Info */}
            {user && (
              <div 
                className="flex items-center space-x-3 px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(14, 165, 233, 0.06)',
                  border: '1px solid rgba(14, 165, 233, 0.12)'
                }}
              >
                <div className="hidden md:block text-right">
                  <p 
                    className="text-sm font-medium text-medsight-primary-900"
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    {user.name}
                  </p>
                  <p 
                    className="text-xs text-medsight-primary-600"
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    {user.specialization} • {user.role}
                  </p>
                </div>
                <div 
                  className="w-8 h-8 bg-medsight-primary-500 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--medsight-primary-500) 0%, var(--medsight-primary-600) 100%)',
                    boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)'
                  }}
                >
                  <span className="text-white font-semibold text-sm">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="lg:hidden p-2 rounded-lg"
              style={{
                background: 'rgba(14, 165, 233, 0.08)',
                border: '1px solid rgba(14, 165, 233, 0.12)'
              }}
            >
              <svg className="w-5 h-5 text-medsight-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isExpanded && (
          <div 
            className="lg:hidden mt-4 pb-4 space-y-2"
            style={{
              borderTop: '1px solid rgba(14, 165, 233, 0.12)',
              paddingTop: '1rem'
            }}
          >
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActiveRoute(item.path)
                    ? 'text-white'
                    : 'text-medsight-primary-700'
                }`}
                style={{
                  background: isActiveRoute(item.path)
                    ? 'linear-gradient(135deg, var(--medsight-primary-500) 0%, var(--medsight-primary-600) 100%)'
                    : 'rgba(14, 165, 233, 0.04)',
                  border: '1px solid rgba(14, 165, 233, 0.08)',
                  letterSpacing: 'var(--medsight-letter-spacing)'
                }}
                onClick={() => setIsExpanded(false)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--medsight-normal)',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <p 
                  className="text-xs mt-1 opacity-75"
                  style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                >
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Medical Compliance Badges */}
      <div className="hidden md:flex absolute bottom-0 left-4 transform translate-y-full">
        <div className="flex items-center space-x-2 mt-2">
          <div 
            className="px-2 py-1 rounded-md text-xs font-medium"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--medsight-normal)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              letterSpacing: 'var(--medsight-letter-spacing)'
            }}
          >
            HIPAA Compliant
          </div>
          <div 
            className="px-2 py-1 rounded-md text-xs font-medium"
            style={{
              background: 'rgba(14, 165, 233, 0.1)',
              color: 'var(--medsight-primary-600)',
              border: '1px solid rgba(14, 165, 233, 0.2)',
              letterSpacing: 'var(--medsight-letter-spacing)'
            }}
          >
            DICOM Conformant
          </div>
          <div 
            className="px-2 py-1 rounded-md text-xs font-medium"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              color: 'var(--medsight-pending)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              letterSpacing: 'var(--medsight-letter-spacing)'
            }}
          >
            FDA Class II
          </div>
        </div>
      </div>
    </nav>
  );
} 