'use client';

import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  BeakerIcon,
  CpuChipIcon,
  HeartIcon,
  UserGroupIcon,
  EyeIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon,
  ServerIcon,
  CloudIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

interface MedicalOverviewData {
  totalCases: number;
  pendingReviews: number;
  completedToday: number;
  criticalFindings: number;
  aiAccuracy: number;
  averageReviewTime: string;
  systemStatus: {
    dicomServer: 'online' | 'offline' | 'warning' | 'processing';
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

interface MedicalOverviewProps {
  data: MedicalOverviewData | null;
}

interface WorkflowStatus {
  id: string;
  name: string;
  status: 'online' | 'processing' | 'warning' | 'offline';
  description: string;
  lastUpdate: string;
}

interface QualityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export function MedicalOverview({ data }: MedicalOverviewProps) {
  if (!data) {
    return (
      <div className="medsight-glass p-6 rounded-xl">
        <div className="animate-pulse">
          <div className="h-4 bg-medsight-primary/20 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-medsight-primary/20 rounded w-3/4"></div>
            <div className="h-3 bg-medsight-primary/20 rounded w-1/2"></div>
            <div className="h-3 bg-medsight-primary/20 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const workflowStatuses: WorkflowStatus[] = [
    {
      id: 'dicom-processing',
      name: 'DICOM Processing',
      status: data.systemStatus.dicomServer,
      description: 'Medical image processing pipeline',
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'ai-inference',
      name: 'AI Inference Engine',
      status: data.systemStatus.aiEngine === 'processing' ? 'processing' : 
              data.systemStatus.aiEngine === 'online' ? 'online' : 'offline',
      description: 'Medical AI analysis and prediction',
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'clinical-workflow',
      name: 'Clinical Workflow',
      status: 'online',
      description: 'Medical case management system',
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'collaboration',
      name: 'Collaboration System',
      status: 'online',
      description: 'Multi-user medical review platform',
      lastUpdate: new Date().toISOString()
    }
  ];

  const qualityMetrics: QualityMetric[] = [
    {
      id: 'ai-accuracy',
      name: 'AI Diagnostic Accuracy',
      value: data.aiAccuracy,
      unit: '%',
      status: data.aiAccuracy >= 90 ? 'normal' : data.aiAccuracy >= 80 ? 'warning' : 'critical',
      trend: 'stable'
    },
    {
      id: 'review-time',
      name: 'Average Review Time',
      value: parseInt(data.averageReviewTime.split(' ')[0]),
      unit: 'min',
      status: parseInt(data.averageReviewTime.split(' ')[0]) <= 15 ? 'normal' : 
              parseInt(data.averageReviewTime.split(' ')[0]) <= 30 ? 'warning' : 'critical',
      trend: 'down'
    },
    {
      id: 'completion-rate',
      name: 'Daily Completion Rate',
      value: Math.round((data.completedToday / (data.completedToday + data.pendingReviews)) * 100),
      unit: '%',
      status: 'normal',
      trend: 'up'
    },
    {
      id: 'critical-response',
      name: 'Critical Response Time',
      value: 3,
      unit: 'min',
      status: 'normal',
      trend: 'stable'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'normal':
        return 'medsight-normal';
      case 'processing':
        return 'medsight-ai-high';
      case 'warning':
        return 'medsight-pending';
      case 'offline':
      case 'critical':
        return 'medsight-critical';
      default:
        return 'medsight-primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'processing':
        return <CpuChipIcon className="w-4 h-4 animate-pulse" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'offline':
        return <ServerIcon className="w-4 h-4" />;
      default:
        return <SignalIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <ChartBarIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-primary">
            Medical Performance Overview
          </h2>
        </div>
        <div className="text-sm text-gray-600">
          Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Key Metrics - Simple Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Cases */}
        <div className="medical-card-primary p-4">
          <div className="flex items-center space-x-3">
            <DocumentChartBarIcon className="w-6 h-6 text-primary" />
            <div>
              <div className="text-2xl font-bold text-primary">
                {data.totalCases}
              </div>
              <div className="text-sm text-gray-600">Total Cases</div>
            </div>
          </div>
        </div>
        
        {/* Pending Reviews */}
        <div className="medical-card-warning p-4">
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-warning" />
            <div>
              <div className="text-2xl font-bold text-warning">
                {data.pendingReviews}
              </div>
              <div className="text-sm text-gray-600">Pending Reviews</div>
            </div>
          </div>
        </div>
        
        {/* Completed Today */}
        <div className="medical-card-success p-4">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-success" />
            <div>
              <div className="text-2xl font-bold text-success">
                {data.completedToday}
              </div>
              <div className="text-sm text-gray-600">Completed Today</div>
            </div>
          </div>
        </div>
        
        {/* Critical Findings */}
        <div className="medical-card-danger p-4">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-danger" />
            <div>
              <div className="text-2xl font-bold text-danger">
                {data.criticalFindings}
              </div>
              <div className="text-sm text-gray-600">Critical Findings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="glass-card-secondary p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <ShieldCheckIcon className="w-5 h-5 mr-2 text-secondary" />
          Quality Metrics
        </h3>
        <div className="space-y-3">
          {qualityMetrics.map(metric => (
            <div key={metric.id} className="flex justify-between items-center">
              <span className="text-sm text-gray-700">{metric.name}</span>
              <div className={`text-right ${getStatusColor(metric.status)}`}>
                <div className="font-bold">{metric.value}{metric.unit}</div>
                <div className="text-xs capitalize">{metric.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="glass-card-secondary p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <ServerIcon className="w-5 h-5 mr-2 text-info" />
          System Health
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <SignalIcon className="w-6 h-6 text-success mx-auto mb-1" />
            <div className="text-xs font-semibold text-gray-700">DICOM</div>
            <div className="text-xs text-success">Online</div>
          </div>
          <div>
            <CpuChipIcon className="w-6 h-6 text-success mx-auto mb-1" />
            <div className="text-xs font-semibold text-gray-700">AI Engine</div>
            <div className="text-xs text-success">Online</div>
          </div>
          <div>
            <BeakerIcon className="w-6 h-6 text-success mx-auto mb-1" />
            <div className="text-xs font-semibold text-gray-700">Database</div>
            <div className="text-xs text-success">Online</div>
          </div>
        </div>
      </div>
    </div>
  );
} 