'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  HeartIcon,
  BeakerIcon,
  UserIcon,
  CalendarIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  EyeIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

export interface MedicalMetricsData {
  clinicalMetrics: {
    totalCases: number;
    completedCases: number;
    pendingCases: number;
    criticalCases: number;
    averageReviewTime: number; // minutes
    accuracyRate: number; // percentage
    productivityScore: number; // percentage
    qualityScore: number; // percentage
  };
  aiMetrics: {
    aiAccuracy: number; // percentage
    aiConfidence: number; // percentage
    aiProcessingTime: number; // seconds
    aiRecommendations: number;
    aiValidationRate: number; // percentage
    falsePositiveRate: number; // percentage
    falseNegativeRate: number; // percentage
  };
  systemMetrics: {
    systemUptime: number; // percentage
    averageResponseTime: number; // milliseconds
    errorRate: number; // percentage
    throughput: number; // cases per hour
    storageUsage: number; // percentage
    networkLatency: number; // milliseconds
  };
  timeMetrics: {
    currentHour: number;
    todayCompleted: number;
    yesterdayCompleted: number;
    weeklyCompleted: number;
    monthlyCompleted: number;
    yearlyCompleted: number;
  };
  trends: {
    casesChange: number; // percentage change
    accuracyChange: number; // percentage change
    productivityChange: number; // percentage change
    aiPerformanceChange: number; // percentage change
  };
}

export interface MedicalMetricsProps {
  metrics?: MedicalMetricsData;
  timeRange?: 'today' | 'week' | 'month' | 'year';
  user?: {
    id: string;
    name: string;
    role: string;
    specialization: string;
  };
  onMetricClick?: (metric: string) => void;
}

export function MedicalMetrics({ 
  metrics,
  timeRange = 'today',
  user = { id: 'current-user', name: 'Dr. Smith', role: 'Radiologist', specialization: 'Chest Imaging' },
  onMetricClick
}: MedicalMetricsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [realTimeData, setRealTimeData] = useState({
    currentCases: 0,
    activeSessions: 0,
    systemLoad: 0,
    networkSpeed: 0
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        currentCases: Math.max(0, prev.currentCases + (Math.random() - 0.5) * 2),
        activeSessions: Math.max(1, prev.activeSessions + (Math.random() - 0.5) * 1),
        systemLoad: Math.max(5, Math.min(95, prev.systemLoad + (Math.random() - 0.5) * 10)),
        networkSpeed: Math.max(10, Math.min(100, prev.networkSpeed + (Math.random() - 0.5) * 5))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const defaultMetrics: MedicalMetricsData = {
    clinicalMetrics: {
      totalCases: 156,
      completedCases: 134,
      pendingCases: 22,
      criticalCases: 3,
      averageReviewTime: 12,
      accuracyRate: 94.5,
      productivityScore: 87.2,
      qualityScore: 96.1
    },
    aiMetrics: {
      aiAccuracy: 92.8,
      aiConfidence: 89.4,
      aiProcessingTime: 2.3,
      aiRecommendations: 78,
      aiValidationRate: 95.7,
      falsePositiveRate: 3.2,
      falseNegativeRate: 1.8
    },
    systemMetrics: {
      systemUptime: 99.7,
      averageResponseTime: 245,
      errorRate: 0.3,
      throughput: 45,
      storageUsage: 67,
      networkLatency: 12
    },
    timeMetrics: {
      currentHour: 8,
      todayCompleted: 45,
      yesterdayCompleted: 52,
      weeklyCompleted: 312,
      monthlyCompleted: 1247,
      yearlyCompleted: 15842
    },
    trends: {
      casesChange: 8.4,
      accuracyChange: 2.1,
      productivityChange: -1.3,
      aiPerformanceChange: 5.7
    }
  };

  const metricsData = metrics || defaultMetrics;

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-medsight-normal';
    if (value < 0) return 'text-medsight-critical';
    return 'text-medsight-primary';
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return ArrowTrendingUpIcon;
    if (value < 0) return ArrowTrendingDownIcon;
    return ArrowTrendingUpIcon;
  };

  const getPerformanceColor = (value: number, type: 'percentage' | 'time' | 'error') => {
    if (type === 'percentage') {
      if (value >= 95) return 'text-medsight-ai-high';
      if (value >= 85) return 'text-medsight-normal';
      if (value >= 70) return 'text-medsight-pending';
      return 'text-medsight-critical';
    }
    if (type === 'time') {
      if (value <= 10) return 'text-medsight-ai-high';
      if (value <= 15) return 'text-medsight-normal';
      if (value <= 20) return 'text-medsight-pending';
      return 'text-medsight-critical';
    }
    if (type === 'error') {
      if (value <= 1) return 'text-medsight-ai-high';
      if (value <= 3) return 'text-medsight-normal';
      if (value <= 5) return 'text-medsight-pending';
      return 'text-medsight-critical';
    }
    return 'text-medsight-primary';
  };

  const formatNumber = (num: number, type: 'percentage' | 'time' | 'count' | 'decimal') => {
    if (type === 'percentage') return `${num.toFixed(1)}%`;
    if (type === 'time') return `${num.toFixed(1)}min`;
    if (type === 'count') return num.toLocaleString();
    if (type === 'decimal') return num.toFixed(1);
    return num.toString();
  };

  const handleMetricClick = (metric: string) => {
    onMetricClick?.(metric);
  };

  return (
    <div className="space-y-4">
      {/* Medical Metrics Header */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="medsight-control-glass p-2 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-medsight-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-medsight-primary">
                Medical Performance Metrics
              </h3>
              <div className="text-xs text-medsight-primary/70">
                {user.name} • {user.specialization}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="text-xs border border-medsight-primary/20 rounded px-2 py-1 bg-medsight-glass"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clinical Performance Metrics */}
      <div className="medsight-glass p-4 rounded-xl">
        <h4 className="text-sm font-semibold text-medsight-primary mb-3 flex items-center space-x-2">
          <HeartIcon className="w-4 h-4" />
          <span>Clinical Performance</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div 
            className="medsight-control-glass p-3 rounded-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleMetricClick('accuracy')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-medsight-primary">Accuracy Rate</span>
              <div className="flex items-center space-x-1">
                {React.createElement(getTrendIcon(metricsData.trends.accuracyChange), {
                  className: `w-3 h-3 ${getTrendColor(metricsData.trends.accuracyChange)}`
                })}
                <span className={`text-xs ${getTrendColor(metricsData.trends.accuracyChange)}`}>
                  {formatNumber(Math.abs(metricsData.trends.accuracyChange), 'percentage')}
                </span>
              </div>
            </div>
            <div className={`text-lg font-bold ${getPerformanceColor(metricsData.clinicalMetrics.accuracyRate, 'percentage')}`}>
              {formatNumber(metricsData.clinicalMetrics.accuracyRate, 'percentage')}
            </div>
          </div>
          
          <div 
            className="medsight-control-glass p-3 rounded-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleMetricClick('review-time')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-medsight-primary">Avg Review Time</span>
              <ClockIcon className="w-3 h-3 text-medsight-primary/50" />
            </div>
            <div className={`text-lg font-bold ${getPerformanceColor(metricsData.clinicalMetrics.averageReviewTime, 'time')}`}>
              {formatNumber(metricsData.clinicalMetrics.averageReviewTime, 'time')}
            </div>
          </div>
          
          <div 
            className="medsight-control-glass p-3 rounded-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleMetricClick('productivity')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-medsight-primary">Productivity</span>
              <div className="flex items-center space-x-1">
                {React.createElement(getTrendIcon(metricsData.trends.productivityChange), {
                  className: `w-3 h-3 ${getTrendColor(metricsData.trends.productivityChange)}`
                })}
                <span className={`text-xs ${getTrendColor(metricsData.trends.productivityChange)}`}>
                  {formatNumber(Math.abs(metricsData.trends.productivityChange), 'percentage')}
                </span>
              </div>
            </div>
            <div className={`text-lg font-bold ${getPerformanceColor(metricsData.clinicalMetrics.productivityScore, 'percentage')}`}>
              {formatNumber(metricsData.clinicalMetrics.productivityScore, 'percentage')}
            </div>
          </div>
          
          <div 
            className="medsight-control-glass p-3 rounded-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleMetricClick('quality')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-medsight-primary">Quality Score</span>
              <ShieldCheckIcon className="w-3 h-3 text-medsight-primary/50" />
            </div>
            <div className={`text-lg font-bold ${getPerformanceColor(metricsData.clinicalMetrics.qualityScore, 'percentage')}`}>
              {formatNumber(metricsData.clinicalMetrics.qualityScore, 'percentage')}
            </div>
          </div>
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="medsight-ai-glass p-4 rounded-xl">
        <h4 className="text-sm font-semibold text-medsight-ai-high mb-3 flex items-center space-x-2">
          <BeakerIcon className="w-4 h-4" />
          <span>AI Performance</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div 
            className="medsight-control-glass p-3 rounded-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleMetricClick('ai-accuracy')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-medsight-ai-high">AI Accuracy</span>
              <div className="flex items-center space-x-1">
                {React.createElement(getTrendIcon(metricsData.trends.aiPerformanceChange), {
                  className: `w-3 h-3 ${getTrendColor(metricsData.trends.aiPerformanceChange)}`
                })}
                <span className={`text-xs ${getTrendColor(metricsData.trends.aiPerformanceChange)}`}>
                  {formatNumber(Math.abs(metricsData.trends.aiPerformanceChange), 'percentage')}
                </span>
              </div>
            </div>
            <div className={`text-lg font-bold ${getPerformanceColor(metricsData.aiMetrics.aiAccuracy, 'percentage')}`}>
              {formatNumber(metricsData.aiMetrics.aiAccuracy, 'percentage')}
            </div>
          </div>
          
          <div 
            className="medsight-control-glass p-3 rounded-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleMetricClick('ai-confidence')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-medsight-ai-high">AI Confidence</span>
              <CpuChipIcon className="w-3 h-3 text-medsight-ai-high/50" />
            </div>
            <div className={`text-lg font-bold ${getPerformanceColor(metricsData.aiMetrics.aiConfidence, 'percentage')}`}>
              {formatNumber(metricsData.aiMetrics.aiConfidence, 'percentage')}
            </div>
          </div>
          
          <div 
            className="medsight-control-glass p-3 rounded-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleMetricClick('ai-processing')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-medsight-ai-high">Processing Time</span>
              <ClockIcon className="w-3 h-3 text-medsight-ai-high/50" />
            </div>
            <div className="text-lg font-bold text-medsight-ai-high">
              {formatNumber(metricsData.aiMetrics.aiProcessingTime, 'decimal')}s
            </div>
          </div>
          
          <div 
            className="medsight-control-glass p-3 rounded-lg cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleMetricClick('ai-validation')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-medsight-ai-high">Validation Rate</span>
              <CheckCircleIcon className="w-3 h-3 text-medsight-ai-high/50" />
            </div>
            <div className={`text-lg font-bold ${getPerformanceColor(metricsData.aiMetrics.aiValidationRate, 'percentage')}`}>
              {formatNumber(metricsData.aiMetrics.aiValidationRate, 'percentage')}
            </div>
          </div>
        </div>
      </div>

      {/* Case Statistics */}
      <div className="medsight-glass p-4 rounded-xl">
        <h4 className="text-sm font-semibold text-medsight-primary mb-3 flex items-center space-x-2">
          <DocumentTextIcon className="w-4 h-4" />
          <span>Case Statistics</span>
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-medsight-primary">Total Cases</span>
            <span className="text-sm font-bold text-medsight-primary">
              {formatNumber(metricsData.clinicalMetrics.totalCases, 'count')}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-medsight-normal">Completed</span>
            <span className="text-sm font-bold text-medsight-normal">
              {formatNumber(metricsData.clinicalMetrics.completedCases, 'count')}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-medsight-pending">Pending</span>
            <span className="text-sm font-bold text-medsight-pending">
              {formatNumber(metricsData.clinicalMetrics.pendingCases, 'count')}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-medsight-critical">Critical</span>
            <span className="text-sm font-bold text-medsight-critical">
              {formatNumber(metricsData.clinicalMetrics.criticalCases, 'count')}
            </span>
          </div>
        </div>
      </div>

      {/* System Performance */}
      <div className="medsight-glass p-4 rounded-xl">
        <h4 className="text-sm font-semibold text-medsight-primary mb-3 flex items-center space-x-2">
          <CpuChipIcon className="w-4 h-4" />
          <span>System Performance</span>
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-medsight-primary">System Uptime</span>
            <span className={`text-sm font-bold ${getPerformanceColor(metricsData.systemMetrics.systemUptime, 'percentage')}`}>
              {formatNumber(metricsData.systemMetrics.systemUptime, 'percentage')}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-medsight-primary">Response Time</span>
            <span className="text-sm font-bold text-medsight-primary">
              {metricsData.systemMetrics.averageResponseTime}ms
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-medsight-primary">Throughput</span>
            <span className="text-sm font-bold text-medsight-primary">
              {metricsData.systemMetrics.throughput}/hour
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-medsight-primary">Error Rate</span>
            <span className={`text-sm font-bold ${getPerformanceColor(metricsData.systemMetrics.errorRate, 'error')}`}>
              {formatNumber(metricsData.systemMetrics.errorRate, 'percentage')}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="medsight-glass p-4 rounded-xl">
        <h4 className="text-sm font-semibold text-medsight-primary mb-3 flex items-center space-x-2">
          <div className="w-2 h-2 bg-medsight-normal rounded-full animate-pulse"></div>
          <span>Real-time Status</span>
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-medsight-primary">Active Sessions</span>
            <span className="text-sm font-bold text-medsight-primary">
              {Math.round(realTimeData.activeSessions)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-medsight-primary">System Load</span>
            <span className="text-sm font-bold text-medsight-primary">
              {realTimeData.systemLoad.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-medsight-primary">Network Speed</span>
            <span className="text-sm font-bold text-medsight-primary">
              {realTimeData.networkSpeed.toFixed(1)} Mbps
            </span>
          </div>
          
          <div className="text-xs text-medsight-primary/70 text-center pt-2 border-t border-medsight-primary/20">
            Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
} 