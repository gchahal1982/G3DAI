'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import medicalAuth from '@/lib/auth/medical-auth';
import { medicalSessionManager } from '@/lib/auth/session-management';
import type { MedicalUser } from '@/types/medical-user';

// Reports layout props
interface ReportsLayoutProps {
  children: React.ReactNode;
}

export default function ReportsLayout({ children }: ReportsLayoutProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<MedicalUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize reports
  useEffect(() => {
    initializeReports();
  }, []);

  // Initialize reports
  const initializeReports = async () => {
    try {
      setLoading(true);

      // Get current medical user
      let user = await medicalAuth.getCurrentUser();
      
      // Development bypass - create mock user if no auth system
      if (!user) {
        console.log('🔧 No authentication found, using mock user for reports');
        user = {
          id: 'dev-user-001',
          email: 'dev@medsight.pro',
          firstName: 'Dr. Development',
          lastName: 'User',
          role: 'radiologist' as const,
          credentials: {
            medicalLicense: 'DEV123456',
            licenseState: 'CA',
            npi: '1234567890',
            boardCertifications: ['Diagnostic Radiology'],
            medicalSchool: 'Dev Medical School',
            graduationYear: 2015,
            specializations: ['General Radiology']
          },
          affiliations: [],
          permissions: ['view-patient-data', 'view-dicom-images', 'access-ai-tools', 'generate-reports'],
          mfaEnabled: false,
          emergencyAccess: false,
          sessionTimeout: 30 * 60 * 1000,
          maxSessions: 5,
          currentSessions: 1,
          hipaaCompliance: true,
          preferences: {
            theme: 'dark' as const,
            language: 'en',
            timezone: 'America/New_York',
            notifications: {
              email: true,
              sms: false,
              push: true,
              emergencyAlerts: true,
              aiAlerts: true,
              reportAlerts: true,
              systemAlerts: true
            },
            workspace: {
              defaultWorkspace: '/reports',
              hangingProtocols: [],
              windowLevelPresets: [],
              annotationDefaults: {
                defaultTool: 'arrow',
                defaultColor: '#FF0000',
                defaultFontSize: 14,
                showMeasurements: true
              },
              layout: 'grid' as const,
              density: 'comfortable' as const
            },
            accessibility: {
              highContrast: false,
              fontSize: 'medium' as const,
              screenReader: false,
              reducedMotion: false,
              keyboardNavigation: true
            }
          },
          isActive: true,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: new Date(),
          loginAttempts: 0
        };
      }

      setCurrentUser(user);
      console.log('📊 Medical reports initialized for:', `${user.firstName} ${user.lastName}`);
      
    } catch (error) {
      console.error('Reports initialization error:', error);
      console.log('🔧 Development mode - showing error state instead of redirect');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Loading MedSight Pro Reports
          </h2>
          <p className="text-slate-600">
            Initializing medical reports...
          </p>
        </div>
      </div>
    );
  }

  // Error state (user not found)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-slate-600 mb-4">
            Please log in to access the medical reports.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell user={currentUser}>
      {children}
    </DashboardShell>
  );
} 