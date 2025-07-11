'use client';

import { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  BeakerIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  EyeIcon,
  CpuChipIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { MedicalOverview } from '@/components/medical/MedicalOverview';
import { ActiveCases } from '@/components/medical/ActiveCases';
import { RecentStudies } from '@/components/medical/RecentStudies';
import { MedicalNotifications } from '@/components/medical/MedicalNotifications';
import { MedicalMetrics } from '@/components/medical/MedicalMetrics';

interface MedicalDashboardData {
  totalCases: number;
  pendingReviews: number;
  completedToday: number;
  criticalFindings: number;
  aiAccuracy: number;
  averageReviewTime: string;
  systemStatus: {
    dicomServer: 'online' | 'offline' | 'warning';
    aiEngine: 'online' | 'offline' | 'processing';
    database: 'online' | 'offline' | 'warning';
  };
  userInfo: {
    name: string;
    role: string;
    department: string;
    license: string;
    lastLogin: string;
  };
}

export default function MedicalDashboardPage() {
  const [dashboardData, setDashboardData] = useState<MedicalDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emergencyMode, setEmergencyMode] = useState(false);

  useEffect(() => {
    loadMedicalDashboard();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadMedicalDashboard();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadMedicalDashboard = async () => {
    try {
      setError(null);
      
      // Simulate API call to backend medical systems
      // In production, this would connect to actual medical APIs
      const mockData: MedicalDashboardData = {
        totalCases: 156,
        pendingReviews: 23,
        completedToday: 45,
        criticalFindings: 3,
        aiAccuracy: 94.5,
        averageReviewTime: '12 min',
        systemStatus: {
          dicomServer: 'online',
          aiEngine: 'processing',
          database: 'online'
        },
        userInfo: {
          name: 'Dr. Sarah Johnson',
          role: 'Radiologist',
          department: 'Radiology',
          license: 'MD-RAD-2024-0147',
          lastLogin: new Date().toISOString()
        }
      };

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardData(mockData);
      
      // Check for critical findings
      if (mockData.criticalFindings > 0) {
        setEmergencyMode(true);
      }
      
    } catch (error) {
      console.error('Failed to load medical dashboard:', error);
      setError('Failed to load medical dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyAccess = () => {
    // Emergency access protocol
    console.log('Emergency access activated');
    // In production, this would trigger emergency medical protocols
  };

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // In production, this would navigate to appropriate medical workflow
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="medsight-glass p-8 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medsight-primary"></div>
            <div className="text-lg font-medium text-medsight-primary">
              Loading Medical Dashboard...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="medsight-glass p-8 rounded-xl border-medsight-abnormal/20">
          <div className="flex items-center space-x-4 text-medsight-abnormal">
            <XCircleIcon className="w-8 h-8" />
            <div>
              <div className="text-lg font-medium">Error Loading Dashboard</div>
              <div className="text-sm opacity-70">{error}</div>
              <button 
                onClick={loadMedicalDashboard}
                className="btn-medsight mt-4"
              >
                Retry
              </button>
            </div>
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
            <div className="w-12 h-12 bg-medsight-primary/10 rounded-full flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-medsight-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-medsight-primary">
                Medical Dashboard
              </h1>
              <p className="text-medsight-primary/70">
                Welcome back, {dashboardData?.userInfo.name} - {dashboardData?.userInfo.department}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right text-sm">
              <div className="text-medsight-primary/70">License</div>
              <div className="font-medium text-medsight-primary">
                {dashboardData?.userInfo.license}
              </div>
            </div>
            
            {emergencyMode && (
              <button
                onClick={handleEmergencyAccess}
                className="btn-medsight bg-medsight-critical/10 border-medsight-critical/20 text-medsight-critical hover:bg-medsight-critical/20"
              >
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                Emergency Access
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Critical Findings Alert */}
      {dashboardData?.criticalFindings > 0 && (
        <div className="medsight-glass p-4 rounded-xl border-medsight-critical/20 bg-medsight-critical/5">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-medsight-critical" />
            <div>
              <div className="font-medium text-medsight-critical">
                {dashboardData.criticalFindings} Critical Findings Require Immediate Attention
              </div>
              <div className="text-sm text-medsight-critical/70">
                Please review critical cases immediately
              </div>
            </div>
            <button 
              onClick={() => handleQuickAction('critical-cases')}
              className="btn-medsight bg-medsight-critical/10 border-medsight-critical/20 text-medsight-critical"
            >
              Review Now
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Medical Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => handleQuickAction('new-study')}
          className="btn-medsight p-6 text-left hover:scale-105 transition-transform"
        >
          <div className="flex items-center space-x-3">
            <BeakerIcon className="w-8 h-8 text-medsight-primary" />
            <div>
              <div className="font-medium text-medsight-primary">New Study</div>
              <div className="text-sm text-medsight-primary/60">Start Analysis</div>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => handleQuickAction('ai-analysis')}
          className="btn-medsight p-6 text-left hover:scale-105 transition-transform"
        >
          <div className="flex items-center space-x-3">
            <CpuChipIcon className="w-8 h-8 text-medsight-ai-high" />
            <div>
              <div className="font-medium text-medsight-ai-high">AI Analysis</div>
              <div className="text-sm text-medsight-ai-high/60">
                {dashboardData?.aiAccuracy}% Accuracy
              </div>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => handleQuickAction('collaboration')}
          className="btn-medsight p-6 text-left hover:scale-105 transition-transform"
        >
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="w-8 h-8 text-medsight-secondary" />
            <div>
              <div className="font-medium text-medsight-secondary">Collaboration</div>
              <div className="text-sm text-medsight-secondary/60">Review Cases</div>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => handleQuickAction('dicom-viewer')}
          className="btn-medsight p-6 text-left hover:scale-105 transition-transform"
        >
          <div className="flex items-center space-x-3">
            <EyeIcon className="w-8 h-8 text-medsight-accent" />
            <div>
              <div className="font-medium text-medsight-accent">DICOM Viewer</div>
              <div className="text-sm text-medsight-accent/60">Medical Imaging</div>
            </div>
          </div>
        </button>
      </div>

      {/* System Status Bar */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-sm font-medium text-medsight-primary">System Status:</div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                dashboardData?.systemStatus.dicomServer === 'online' ? 'bg-medsight-normal' : 
                dashboardData?.systemStatus.dicomServer === 'warning' ? 'bg-medsight-pending' : 
                'bg-medsight-abnormal'
              }`}></div>
              <span className="text-sm">DICOM Server</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                dashboardData?.systemStatus.aiEngine === 'online' ? 'bg-medsight-normal' : 
                dashboardData?.systemStatus.aiEngine === 'processing' ? 'bg-medsight-ai-high animate-pulse' : 
                'bg-medsight-abnormal'
              }`}></div>
              <span className="text-sm">AI Engine</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                dashboardData?.systemStatus.database === 'online' ? 'bg-medsight-normal' : 
                dashboardData?.systemStatus.database === 'warning' ? 'bg-medsight-pending' : 
                'bg-medsight-abnormal'
              }`}></div>
              <span className="text-sm">Database</span>
            </div>
          </div>
          
          <div className="text-sm text-medsight-primary/70">
            Last Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Medical Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medical Overview */}
        <div className="lg:col-span-2">
          <MedicalOverview data={dashboardData} />
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
    </div>
  );
} 