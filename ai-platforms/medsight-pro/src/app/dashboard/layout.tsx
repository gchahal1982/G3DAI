'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { MedicalNavigation } from '@/components/navigation/MedicalNavigation';
import { medicalAuth } from '@/lib/auth/medical-auth';
import { medicalSessionManager } from '@/lib/auth/session-management';
import type { MedicalUser } from '@/types/medical-user';

// Dashboard layout props
interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Medical alert interface
interface MedicalAlert {
  id: string;
  type: 'emergency' | 'compliance' | 'session' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  action?: () => void;
  dismissible: boolean;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<MedicalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [navigationCollapsed, setNavigationCollapsed] = useState(false);
  const [medicalAlerts, setMedicalAlerts] = useState<MedicalAlert[]>([]);
  const [sessionWarnings, setSessionWarnings] = useState<any[]>([]);

  // Initialize dashboard
  useEffect(() => {
    initializeDashboard();
  }, []);

  // Session monitoring
  useEffect(() => {
    if (currentUser) {
      initializeSessionMonitoring();
    }
  }, [currentUser]);

  // Initialize dashboard
  const initializeDashboard = async () => {
    try {
      setLoading(true);

      // Get current medical user
      const user = await medicalAuth.getCurrentMedicalUser();
      if (!user) {
        console.log('🔒 No authenticated medical user found, redirecting to login');
        router.push('/login?redirect=/dashboard');
        return;
      }

      setCurrentUser(user);
      
      // Initialize medical session monitoring
      await initializeMedicalSession(user);
      
      // Check medical compliance alerts
      checkMedicalCompliance(user);
      
      console.log('🏥 Medical dashboard initialized for:', user.name);
      
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      router.push('/login?error=session_error');
    } finally {
      setLoading(false);
    }
  };

  // Initialize medical session
  const initializeMedicalSession = async (user: MedicalUser) => {
    try {
      // Create or resume medical session
      if (!medicalSessionManager.getCurrentSession()) {
        await medicalSessionManager.createSession(user, {
          emergencyAccess: false,
          extendedSession: false,
          location: {
            hospital: user.departmentAffiliations[0]?.hospitalName || 'Unknown',
            department: user.departmentAffiliations[0]?.departmentName || 'Unknown',
            workstation: 'Web Browser'
          }
        });
      }

      // Update activity
      medicalSessionManager.updateActivity('dashboard_access', '/dashboard');
      
    } catch (error) {
      console.error('Session initialization error:', error);
    }
  };

  // Initialize session monitoring
  const initializeSessionMonitoring = () => {
    // Listen for session warnings
    medicalSessionManager.addEventListener('sessionWarning', (data: any) => {
      setSessionWarnings(data.warnings || []);
    });

    // Listen for session ended
    medicalSessionManager.addEventListener('sessionEnded', (data: any) => {
      if (data.reason === 'timeout') {
        router.push('/login?session=expired');
      }
    });

    // Check session warnings periodically
    const warningInterval = setInterval(() => {
      const warnings = medicalSessionManager.getSessionWarnings();
      setSessionWarnings(warnings);
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(warningInterval);
      medicalSessionManager.removeEventListener('sessionWarning', () => {});
      medicalSessionManager.removeEventListener('sessionEnded', () => {});
    };
  };

  // Check medical compliance
  const checkMedicalCompliance = (user: MedicalUser) => {
    const alerts: MedicalAlert[] = [];
    const now = new Date();

    // Check license expiry
    if (user.licenseExpiry) {
      const daysUntilExpiry = Math.ceil((user.licenseExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 30) {
        alerts.push({
          id: 'license_expiry',
          type: 'compliance',
          severity: daysUntilExpiry <= 7 ? 'critical' : 'high',
          message: `Medical license expires in ${daysUntilExpiry} days`,
          dismissible: false
        });
      }
    }

    // Check HIPAA training
    if (user.compliance?.hipaaTraining) {
      const hipaaExpiry = user.compliance.hipaaTraining.expiryDate;
      if (hipaaExpiry) {
        const daysUntilExpiry = Math.ceil((hipaaExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 60) {
          alerts.push({
            id: 'hipaa_training',
            type: 'compliance',
            severity: daysUntilExpiry <= 14 ? 'high' : 'medium',
            message: `HIPAA training expires in ${daysUntilExpiry} days`,
            dismissible: true
          });
        }
      }
    }

    // Check board certifications
    user.boardCertifications?.forEach(cert => {
      const daysUntilExpiry = Math.ceil((cert.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 90) {
        alerts.push({
          id: `board_cert_${cert.id}`,
          type: 'compliance',
          severity: daysUntilExpiry <= 30 ? 'high' : 'medium',
          message: `${cert.specialty} certification expires in ${daysUntilExpiry} days`,
          dismissible: true
        });
      }
    });

    setMedicalAlerts(alerts);
  };

  // Handle navigation toggle
  const handleNavigationToggle = (collapsed: boolean) => {
    setNavigationCollapsed(collapsed);
    
    // Save preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('medical_nav_collapsed', collapsed.toString());
    }
  };

  // Handle alert dismissal
  const handleAlertDismiss = (alertId: string) => {
    setMedicalAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Handle session warning actions
  const handleExtendSession = () => {
    const session = medicalSessionManager.getCurrentSession();
    if (session) {
      const extended = medicalSessionManager.extendSession(session.id, 15 * 60 * 1000); // 15 minutes
      if (extended) {
        setSessionWarnings([]);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="medsight-glass p-8 rounded-2xl text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 
            className="text-xl font-semibold text-blue-300 mb-2"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em',
              lineHeight: '1.6'
            }}
          >
            Loading MedSight Pro
          </h2>
          <p 
            className="text-white/70"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            Initializing medical dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Error state (user not found)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="medsight-glass p-8 rounded-2xl text-center max-w-md">
          <div className="text-red-400 text-4xl mb-4">🔒</div>
          <h2 
            className="text-xl font-semibold text-red-300 mb-2"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em',
              lineHeight: '1.6'
            }}
          >
            Authentication Required
          </h2>
          <p 
            className="text-white/70 mb-4"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            Please log in to access the medical dashboard.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="btn-medsight px-6 py-2 rounded-lg font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Medical Navigation */}
      <MedicalNavigation 
        collapsed={navigationCollapsed}
        onToggleCollapse={handleNavigationToggle}
      />

      {/* Main Dashboard Content */}
      <div 
        className={`
          transition-all duration-300 min-h-screen
          ${navigationCollapsed ? 'ml-20' : 'ml-80'}
        `}
      >
        {/* Session Warnings */}
        {sessionWarnings.length > 0 && (
          <div className="bg-yellow-500/10 border-l-4 border-yellow-400 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-yellow-400 mr-2">⚠️</span>
                <span 
                  className="text-yellow-200"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  {sessionWarnings[0]?.message}
                </span>
              </div>
              <button
                onClick={handleExtendSession}
                className="btn-medsight btn-sm"
              >
                Extend Session
              </button>
            </div>
          </div>
        )}

        {/* Medical Alerts */}
        {medicalAlerts.map(alert => (
          <div 
            key={alert.id}
            className={`
              border-l-4 p-4
              ${alert.severity === 'critical' ? 'bg-red-500/10 border-red-400' : 
                alert.severity === 'high' ? 'bg-orange-500/10 border-orange-400' :
                'bg-yellow-500/10 border-yellow-400'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">
                  {alert.type === 'emergency' ? '🚨' :
                   alert.type === 'compliance' ? '🛡️' :
                   alert.type === 'session' ? '⏰' : '⚠️'}
                </span>
                <span 
                  className={`
                    ${alert.severity === 'critical' ? 'text-red-200' : 
                      alert.severity === 'high' ? 'text-orange-200' :
                      'text-yellow-200'
                    }
                  `}
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  {alert.message}
                </span>
              </div>
              {alert.dismissible && (
                <button
                  onClick={() => handleAlertDismiss(alert.id)}
                  className="text-white/60 hover:text-white/80 ml-4"
                  aria-label="Dismiss alert"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Dashboard Shell */}
        <DashboardShell user={currentUser}>
          {children}
        </DashboardShell>
      </div>
    </div>
  );
} 