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
      status: data.systemStatus.dicomServer === 'online' ? 'online' : 'offline',
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
      {/* Medical Performance Summary */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-medsight-primary/10 rounded-full flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4 text-medsight-primary" />
            </div>
            <h2 className="text-lg font-semibold text-medsight-primary">
              Medical Performance Overview
            </h2>
          </div>
          <div className="text-sm text-medsight-primary/70">
            Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Cases */}
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <DocumentChartBarIcon className="w-6 h-6 text-medsight-primary" />
              <div>
                <div className="text-2xl font-bold text-medsight-primary">
                  {data.totalCases}
                </div>
                <div className="text-sm text-medsight-primary/70">
                  Total Cases
                </div>
              </div>
            </div>
          </div>
          
          {/* Pending Reviews */}
          <div className="medsight-glass p-4 rounded-lg border-medsight-pending/20 bg-medsight-pending/5">
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-6 h-6 text-medsight-pending" />
              <div>
                <div className="text-2xl font-bold text-medsight-pending">
                  {data.pendingReviews}
                </div>
                <div className="text-sm text-medsight-pending/70">
                  Pending Reviews
                </div>
              </div>
            </div>
          </div>
          
          {/* Completed Today */}
          <div className="medsight-glass p-4 rounded-lg border-medsight-normal/20 bg-medsight-normal/5">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-6 h-6 text-medsight-normal" />
              <div>
                <div className="text-2xl font-bold text-medsight-normal">
                  {data.completedToday}
                </div>
                <div className="text-sm text-medsight-normal/70">
                  Completed Today
                </div>
              </div>
            </div>
          </div>
          
          {/* Critical Findings */}
          <div className="medsight-glass p-4 rounded-lg border-medsight-critical/20 bg-medsight-critical/5">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-medsight-critical" />
              <div>
                <div className="text-2xl font-bold text-medsight-critical">
                  {data.criticalFindings}
                </div>
                <div className="text-sm text-medsight-critical/70">
                  Critical Findings
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-medsight-ai-high/10 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="w-4 h-4 text-medsight-ai-high" />
          </div>
          <h3 className="text-lg font-semibold text-medsight-primary">
            Quality Metrics
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {qualityMetrics.map((metric) => (
            <div key={metric.id} className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-medsight-primary">
                  {metric.name}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full bg-${getStatusColor(metric.status)}/10 text-${getStatusColor(metric.status)}`}>
                  {metric.status.toUpperCase()}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`text-2xl font-bold text-${getStatusColor(metric.status)}`}>
                  {metric.value}{metric.unit}
                </div>
                <div className={`text-sm text-${getStatusColor(metric.status)}/70`}>
                  {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Clinical Workflow Status */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-medsight-secondary/10 rounded-full flex items-center justify-center">
            <HeartIcon className="w-4 h-4 text-medsight-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-medsight-primary">
            Clinical Workflow Status
          </h3>
        </div>
        
        <div className="space-y-3">
          {workflowStatuses.map((workflow) => (
            <div key={workflow.id} className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`text-${getStatusColor(workflow.status)}`}>
                    {getStatusIcon(workflow.status)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-medsight-primary">
                      {workflow.name}
                    </div>
                    <div className="text-xs text-medsight-primary/60">
                      {workflow.description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium text-${getStatusColor(workflow.status)}`}>
                    {workflow.status.toUpperCase()}
                  </div>
                  <div className="text-xs text-medsight-primary/60">
                    {new Date(workflow.lastUpdate).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-medsight-accent/10 rounded-full flex items-center justify-center">
            <ServerIcon className="w-4 h-4 text-medsight-accent" />
          </div>
          <h3 className="text-lg font-semibold text-medsight-primary">
            System Health
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full bg-${getStatusColor(data.systemStatus.dicomServer)}`}></div>
              <div>
                <div className="text-sm font-medium text-medsight-primary">
                  DICOM Server
                </div>
                <div className={`text-xs text-${getStatusColor(data.systemStatus.dicomServer)}`}>
                  {data.systemStatus.dicomServer.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full bg-${getStatusColor(data.systemStatus.aiEngine)} ${
                data.systemStatus.aiEngine === 'processing' ? 'animate-pulse' : ''
              }`}></div>
              <div>
                <div className="text-sm font-medium text-medsight-primary">
                  AI Engine
                </div>
                <div className={`text-xs text-${getStatusColor(data.systemStatus.aiEngine)}`}>
                  {data.systemStatus.aiEngine.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full bg-${getStatusColor(data.systemStatus.database)}`}></div>
              <div>
                <div className="text-sm font-medium text-medsight-primary">
                  Database
                </div>
                <div className={`text-xs text-${getStatusColor(data.systemStatus.database)}`}>
                  {data.systemStatus.database.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Professional Info */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="w-5 h-5 text-medsight-primary" />
            <div>
              <div className="text-sm font-medium text-medsight-primary">
                {data.userInfo.name} - {data.userInfo.role}
              </div>
              <div className="text-xs text-medsight-primary/60">
                {data.userInfo.department} • License: {data.userInfo.license}
              </div>
            </div>
          </div>
          <div className="text-xs text-medsight-primary/60">
            Last Login: {new Date(data.userInfo.lastLogin).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
} 