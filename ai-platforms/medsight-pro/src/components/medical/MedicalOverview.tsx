'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  HeartIcon,
  ComputerDesktopIcon,
  EyeIcon,
  BeakerIcon,
  ShieldCheckIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

export interface MedicalOverviewData {
  totalCases: number;
  activeCases: number;
  completedToday: number;
  criticalFindings: number;
  pendingReviews: number;
  aiAccuracy: number;
  averageReviewTime: string;
  systemStatus: {
    dicomProcessor: 'online' | 'offline' | 'processing';
    aiEngine: 'online' | 'offline' | 'processing';
    database: 'connected' | 'disconnected' | 'syncing';
    pacs: 'connected' | 'disconnected' | 'syncing';
  };
  workflowStatus: {
    imagingQueue: number;
    aiAnalysisQueue: number;
    reviewQueue: number;
    completedToday: number;
  };
  qualityMetrics: {
    accuracy: number;
    sensitivity: number;
    specificity: number;
    npe: number; // Negative Predictive Value
    ppv: number; // Positive Predictive Value
  };
}

interface MedicalOverviewProps {
  data: MedicalOverviewData | null;
}

export function MedicalOverview({ data }: MedicalOverviewProps) {
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    processingLoad: 23,
    memoryUsage: 67,
    networkLatency: 12,
    throughput: 145
  });

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        processingLoad: Math.max(5, Math.min(95, prev.processingLoad + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(20, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 8)),
        networkLatency: Math.max(5, Math.min(50, prev.networkLatency + (Math.random() - 0.5) * 5)),
        throughput: Math.max(50, Math.min(200, prev.throughput + (Math.random() - 0.5) * 20))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const medicalStats = data || {
    totalCases: 156,
    activeCases: 47,
    completedToday: 45,
    criticalFindings: 3,
    pendingReviews: 23,
    aiAccuracy: 94.5,
    averageReviewTime: '12 min',
    systemStatus: {
      dicomProcessor: 'online' as const,
      aiEngine: 'processing' as const,
      database: 'connected' as const,
      pacs: 'connected' as const
    },
    workflowStatus: {
      imagingQueue: 12,
      aiAnalysisQueue: 8,
      reviewQueue: 15,
      completedToday: 45
    },
    qualityMetrics: {
      accuracy: 94.2,
      sensitivity: 96.1,
      specificity: 92.8,
      npe: 98.7,
      ppv: 89.4
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
        return 'text-medsight-normal';
      case 'processing':
      case 'syncing':
        return 'text-medsight-pending';
      case 'offline':
      case 'disconnected':
        return 'text-medsight-critical';
      default:
        return 'text-medsight-primary';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
        return 'bg-medsight-normal';
      case 'processing':
      case 'syncing':
        return 'bg-medsight-pending';
      case 'offline':
      case 'disconnected':
        return 'bg-medsight-critical';
      default:
        return 'bg-medsight-primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Medical Performance Summary */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-medsight-primary">
            Medical Performance Overview
          </h2>
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-6 h-6 text-medsight-primary" />
            <div className="text-sm text-medsight-primary/70">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Total Cases */}
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <HeartIcon className="w-5 h-5 text-medsight-primary" />
              <span className="text-sm font-medium text-medsight-primary">Total Cases</span>
            </div>
            <div className="text-2xl font-bold text-medsight-primary">
              {medicalStats.totalCases}
            </div>
            <div className="text-xs text-medsight-primary/60 mt-1">
              {medicalStats.activeCases} active
            </div>
          </div>
          
          {/* Pending Reviews */}
          <div className="medsight-glass p-4 rounded-lg border-medsight-pending/20">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-5 h-5 text-medsight-pending" />
              <span className="text-sm font-medium text-medsight-pending">Pending Reviews</span>
            </div>
            <div className="text-2xl font-bold text-medsight-pending">
              {medicalStats.pendingReviews}
            </div>
            <div className="text-xs text-medsight-pending/60 mt-1">
              Avg wait: {medicalStats.averageReviewTime}
            </div>
          </div>
          
          {/* Completed Today */}
          <div className="medsight-glass p-4 rounded-lg border-medsight-normal/20">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-medsight-normal" />
              <span className="text-sm font-medium text-medsight-normal">Completed Today</span>
            </div>
            <div className="text-2xl font-bold text-medsight-normal">
              {medicalStats.completedToday}
            </div>
            <div className="text-xs text-medsight-normal/60 mt-1">
              Target: 40 cases
            </div>
          </div>
          
          {/* Critical Findings */}
          <div className="medsight-glass p-4 rounded-lg border-medsight-critical/20">
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-medsight-critical" />
              <span className="text-sm font-medium text-medsight-critical">Critical Findings</span>
            </div>
            <div className="text-2xl font-bold text-medsight-critical">
              {medicalStats.criticalFindings}
            </div>
            <div className="text-xs text-medsight-critical/60 mt-1">
              Require immediate attention
            </div>
          </div>
          
          {/* AI Accuracy */}
          <div className="medsight-ai-glass p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CpuChipIcon className="w-5 h-5 text-medsight-ai-high" />
              <span className="text-sm font-medium text-medsight-ai-high">AI Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-medsight-ai-high">
              {medicalStats.aiAccuracy}%
            </div>
            <div className="text-xs text-medsight-ai-high/60 mt-1">
              Clinical validation score
            </div>
          </div>
          
          {/* Average Review Time */}
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-5 h-5 text-medsight-primary" />
              <span className="text-sm font-medium text-medsight-primary">Avg Review Time</span>
            </div>
            <div className="text-2xl font-bold text-medsight-primary">
              {medicalStats.averageReviewTime}
            </div>
            <div className="text-xs text-medsight-primary/60 mt-1">
              Target: 10 min
            </div>
          </div>
        </div>
      </div>
      
      {/* Medical System Status */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4 flex items-center space-x-2">
          <ShieldCheckIcon className="w-5 h-5" />
          <span>Medical System Status</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DICOM Processor */}
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <EyeIcon className="w-4 h-4 text-medsight-primary" />
                <span className="text-sm font-medium text-medsight-primary">DICOM Processor</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusBgColor(medicalStats.systemStatus.dicomProcessor)}`}></div>
                <span className={`text-xs font-medium ${getStatusColor(medicalStats.systemStatus.dicomProcessor)}`}>
                  {medicalStats.systemStatus.dicomProcessor}
                </span>
              </div>
            </div>
            <div className="text-xs text-medsight-primary/60">
              Processing: {medicalStats.workflowStatus.imagingQueue} studies
            </div>
          </div>
          
          {/* AI Analysis Engine */}
          <div className="medsight-ai-glass p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <BeakerIcon className="w-4 h-4 text-medsight-ai-high" />
                <span className="text-sm font-medium text-medsight-ai-high">AI Analysis Engine</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusBgColor(medicalStats.systemStatus.aiEngine)}`}></div>
                <span className={`text-xs font-medium ${getStatusColor(medicalStats.systemStatus.aiEngine)}`}>
                  {medicalStats.systemStatus.aiEngine}
                </span>
              </div>
            </div>
            <div className="text-xs text-medsight-ai-high/60">
              Queue: {medicalStats.workflowStatus.aiAnalysisQueue} analyses
            </div>
          </div>
          
          {/* Medical Database */}
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <ComputerDesktopIcon className="w-4 h-4 text-medsight-primary" />
                <span className="text-sm font-medium text-medsight-primary">Medical Database</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusBgColor(medicalStats.systemStatus.database)}`}></div>
                <span className={`text-xs font-medium ${getStatusColor(medicalStats.systemStatus.database)}`}>
                  {medicalStats.systemStatus.database}
                </span>
              </div>
            </div>
            <div className="text-xs text-medsight-primary/60">
              Latency: {realTimeMetrics.networkLatency}ms
            </div>
          </div>
          
          {/* PACS Integration */}
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <HeartIcon className="w-4 h-4 text-medsight-primary" />
                <span className="text-sm font-medium text-medsight-primary">PACS Integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusBgColor(medicalStats.systemStatus.pacs)}`}></div>
                <span className={`text-xs font-medium ${getStatusColor(medicalStats.systemStatus.pacs)}`}>
                  {medicalStats.systemStatus.pacs}
                </span>
              </div>
            </div>
            <div className="text-xs text-medsight-primary/60">
              Throughput: {realTimeMetrics.throughput}/hour
            </div>
          </div>
        </div>
      </div>
      
      {/* Clinical Quality Metrics */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4 flex items-center space-x-2">
          <ChartBarIcon className="w-5 h-5" />
          <span>Clinical Quality Metrics</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="medsight-ai-glass p-3 rounded-lg text-center">
            <div className="text-sm font-medium text-medsight-ai-high mb-1">Accuracy</div>
            <div className="text-lg font-bold text-medsight-ai-high">{medicalStats.qualityMetrics.accuracy}%</div>
          </div>
          
          <div className="medsight-ai-glass p-3 rounded-lg text-center">
            <div className="text-sm font-medium text-medsight-ai-high mb-1">Sensitivity</div>
            <div className="text-lg font-bold text-medsight-ai-high">{medicalStats.qualityMetrics.sensitivity}%</div>
          </div>
          
          <div className="medsight-ai-glass p-3 rounded-lg text-center">
            <div className="text-sm font-medium text-medsight-ai-high mb-1">Specificity</div>
            <div className="text-lg font-bold text-medsight-ai-high">{medicalStats.qualityMetrics.specificity}%</div>
          </div>
          
          <div className="medsight-ai-glass p-3 rounded-lg text-center">
            <div className="text-sm font-medium text-medsight-ai-high mb-1">NPV</div>
            <div className="text-lg font-bold text-medsight-ai-high">{medicalStats.qualityMetrics.npe}%</div>
          </div>
          
          <div className="medsight-ai-glass p-3 rounded-lg text-center">
            <div className="text-sm font-medium text-medsight-ai-high mb-1">PPV</div>
            <div className="text-lg font-bold text-medsight-ai-high">{medicalStats.qualityMetrics.ppv}%</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 medsight-control-glass rounded-lg">
          <div className="text-xs text-medsight-primary/70 text-center">
            Clinical validation metrics based on {medicalStats.totalCases} cases • Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
      
      {/* Real-time Performance */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4 flex items-center space-x-2">
          <CpuChipIcon className="w-5 h-5" />
          <span>Real-time Performance</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-medsight-primary">Processing Load</span>
              <span className="text-sm text-medsight-primary">{realTimeMetrics.processingLoad}%</span>
            </div>
            <div className="w-full bg-medsight-control-glass rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-medsight-primary to-medsight-ai-high h-2 rounded-full transition-all duration-1000"
                style={{ width: `${realTimeMetrics.processingLoad}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-medsight-primary">Memory Usage</span>
              <span className="text-sm text-medsight-primary">{realTimeMetrics.memoryUsage}%</span>
            </div>
            <div className="w-full bg-medsight-control-glass rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-medsight-secondary to-medsight-pending h-2 rounded-full transition-all duration-1000"
                style={{ width: `${realTimeMetrics.memoryUsage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 