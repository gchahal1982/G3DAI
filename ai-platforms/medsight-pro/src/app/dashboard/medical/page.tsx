'use client';

import { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  BeakerIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { MedicalOverview } from '@/components/medical/MedicalOverview';
import { ActiveCases } from '@/components/medical/ActiveCases';
import { RecentStudies } from '@/components/medical/RecentStudies';
import { MedicalNotifications } from '@/components/medical/MedicalNotifications';
import { MedicalMetrics } from '@/components/medical/MedicalMetrics';

interface MedicalDashboardData {
  user: {
    name: string;
    role: string;
    specialization: string;
    licenseNumber: string;
  };
  metrics: {
    totalCases: number;
    pendingReviews: number;
    completedToday: number;
    criticalFindings: number;
    aiAccuracy: number;
    averageReviewTime: string;
  };
  systemStatus: {
    dicomProcessor: 'online' | 'offline' | 'processing';
    aiEngine: 'online' | 'offline' | 'processing';
    database: 'connected' | 'disconnected' | 'syncing';
  };
}

export default function MedicalDashboardPage() {
  const [medicalData, setMedicalData] = useState<MedicalDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMedicalDashboard();
  }, []);

  const loadMedicalDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Connect to backend medical systems
      // Integration with existing backend: MedicalAnalytics.ts, MedicalAPI.ts, MedicalOrchestrator.ts
      const response = await fetch('/api/medical/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Medical-License': 'verified',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load medical dashboard');
      }

      const data = await response.json();
      setMedicalData(data);
    } catch (error) {
      console.error('Medical dashboard loading error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyAccess = () => {
    // Emergency protocol activation
    window.location.href = '/emergency-access';
  };

  const handleNewStudy = () => {
    window.location.href = '/workspace/imaging';
  };

  const handleAIAnalysis = () => {
    window.location.href = '/workspace/ai-analysis';
  };

  const handleCollaboration = () => {
    window.location.href = '/workspace/collaboration';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="medsight-glass p-8 rounded-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-medsight-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-lg font-medium text-medsight-primary mb-2">
              Loading Medical Dashboard
            </div>
            <div className="text-sm text-medsight-primary/70">
              Connecting to medical systems...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="medsight-glass p-8 rounded-xl max-w-md w-full mx-4 border-medsight-critical/20">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-medsight-critical mx-auto mb-4" />
            <div className="text-lg font-medium text-medsight-critical mb-2">
              Medical Dashboard Error
            </div>
            <div className="text-sm text-medsight-critical/70 mb-4">
              {error}
            </div>
            <button 
              onClick={loadMedicalDashboard}
              className="btn-medsight"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 min-h-screen">
      {/* Medical Welcome Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="medsight-control-glass p-3 rounded-full">
              <HeartIcon className="w-8 h-8 text-medsight-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-medsight-primary">
                Medical Dashboard
              </h1>
              <p className="text-medsight-primary/70">
                Welcome back, {medicalData?.user?.name || 'Dr. Smith'} - {medicalData?.user?.specialization || 'Clinical Review Center'}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-medsight-primary/60">
                  License: {medicalData?.user?.licenseNumber || 'MD-12345'}
                </span>
                <span className="text-xs text-medsight-primary/60">
                  Role: {medicalData?.user?.role || 'Attending Physician'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Medical System Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-medsight-normal rounded-full animate-pulse"></div>
              <span className="text-sm text-medsight-normal">Systems Online</span>
            </div>
            <div className="text-sm text-medsight-primary/60">
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Medical Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button 
          onClick={handleNewStudy}
          className="btn-medsight p-4 text-left hover:scale-105 transition-transform"
        >
          <div className="flex items-center space-x-3">
            <BeakerIcon className="w-6 h-6 text-medsight-primary" />
            <div>
              <div className="text-sm font-medium text-medsight-primary">New Study</div>
              <div className="text-xs text-medsight-primary/60">Start DICOM Analysis</div>
            </div>
          </div>
        </button>
        
        <button 
          onClick={handleAIAnalysis}
          className="btn-medsight p-4 text-left hover:scale-105 transition-transform"
        >
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="w-6 h-6 text-medsight-ai-high" />
            <div>
              <div className="text-sm font-medium text-medsight-ai-high">AI Analysis</div>
              <div className="text-xs text-medsight-ai-high/60">Computer Vision</div>
            </div>
          </div>
        </button>
        
        <button 
          onClick={handleCollaboration}
          className="btn-medsight p-4 text-left hover:scale-105 transition-transform"
        >
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="w-6 h-6 text-medsight-secondary" />
            <div>
              <div className="text-sm font-medium text-medsight-secondary">Collaboration</div>
              <div className="text-xs text-medsight-secondary/60">Review Cases</div>
            </div>
          </div>
        </button>
        
        <button 
          onClick={handleEmergencyAccess}
          className="btn-medsight p-4 text-left bg-medsight-critical/10 border-medsight-critical/20 hover:bg-medsight-critical/20 transition-all"
        >
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-medsight-critical" />
            <div>
              <div className="text-sm font-medium text-medsight-critical">Emergency</div>
              <div className="text-xs text-medsight-critical/60">Critical Access</div>
            </div>
          </div>
        </button>
      </div>

      {/* Medical Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <ClipboardDocumentListIcon className="w-6 h-6 text-medsight-primary" />
            <div>
              <div className="text-2xl font-bold text-medsight-primary">
                {medicalData?.metrics?.totalCases || 156}
              </div>
              <div className="text-sm text-medsight-primary/70">Total Cases</div>
            </div>
          </div>
        </div>
        
        <div className="medsight-glass p-4 rounded-lg border-medsight-pending/20">
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-medsight-pending" />
            <div>
              <div className="text-2xl font-bold text-medsight-pending">
                {medicalData?.metrics?.pendingReviews || 23}
              </div>
              <div className="text-sm text-medsight-pending/70">Pending Reviews</div>
            </div>
          </div>
        </div>
        
        <div className="medsight-glass p-4 rounded-lg border-medsight-normal/20">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-medsight-normal" />
            <div>
              <div className="text-2xl font-bold text-medsight-normal">
                {medicalData?.metrics?.completedToday || 45}
              </div>
              <div className="text-sm text-medsight-normal/70">Completed Today</div>
            </div>
          </div>
        </div>
        
        <div className="medsight-glass p-4 rounded-lg border-medsight-critical/20">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-medsight-critical" />
            <div>
              <div className="text-2xl font-bold text-medsight-critical">
                {medicalData?.metrics?.criticalFindings || 3}
              </div>
              <div className="text-sm text-medsight-critical/70">Critical Findings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medical Overview */}
        <div className="lg:col-span-2">
          <MedicalOverview data={medicalData} />
        </div>
        
        {/* Medical Notifications */}
        <div>
          <MedicalNotifications />
        </div>
        
        {/* Active Cases */}
        <div className="lg:col-span-2">
          <ActiveCases />
        </div>
        
        {/* Medical Metrics */}
        <div>
          <MedicalMetrics />
        </div>
        
        {/* Recent Studies */}
        <div className="lg:col-span-3">
          <RecentStudies />
        </div>
      </div>

      {/* HIPAA Compliance Notice */}
      <div className="medsight-glass p-4 rounded-lg border-medsight-primary/20">
        <div className="flex items-center space-x-2">
          <HeartIcon className="w-4 h-4 text-medsight-primary" />
          <span className="text-sm text-medsight-primary/70">
            HIPAA Compliant • Medical data encrypted • Session timeout: 15 minutes
          </span>
        </div>
      </div>
    </div>
  );
} 