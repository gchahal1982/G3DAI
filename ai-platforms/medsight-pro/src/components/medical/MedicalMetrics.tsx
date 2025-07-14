'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  EyeIcon,
  CpuChipIcon,
  UserGroupIcon,
  BeakerIcon,
  ShieldCheckIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface MedicalMetric {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  category: 'performance' | 'quality' | 'efficiency' | 'ai' | 'compliance' | 'productivity';
  status: 'excellent' | 'good' | 'fair' | 'needs-improvement' | 'critical';
  description: string;
  target?: number;
  benchmark?: number;
  lastUpdated: string;
}

interface MetricsCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  metrics: MedicalMetric[];
}

export function MedicalMetrics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('today');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [metricsData, setMetricsData] = useState<MetricsCategory[]>([]);

  useEffect(() => {
    // Simulate API call to fetch metrics based on selected period
    loadMetricsData();
  }, [selectedPeriod]);

  const loadMetricsData = () => {
    // Mock data - in production this would come from backend analytics
    const mockData: MetricsCategory[] = [
      {
        id: 'performance',
        name: 'Performance Metrics',
        icon: ChartBarIcon,
        color: 'medsight-primary',
        metrics: [
          {
            id: 'cases-reviewed',
            name: 'Cases Reviewed',
            value: 45,
            unit: 'cases',
            previousValue: 42,
            trend: 'up',
            trendPercentage: 7.1,
            category: 'performance',
            status: 'excellent',
            description: 'Total cases reviewed today',
            target: 40,
            benchmark: 35,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'avg-review-time',
            name: 'Avg Review Time',
            value: 12.3,
            unit: 'min',
            previousValue: 14.5,
            trend: 'down',
            trendPercentage: 15.2,
            category: 'performance',
            status: 'excellent',
            description: 'Average time per case review',
            target: 15.0,
            benchmark: 18.0,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'productivity-score',
            name: 'Productivity Score',
            value: 94.5,
            unit: '%',
            previousValue: 91.2,
            trend: 'up',
            trendPercentage: 3.6,
            category: 'performance',
            status: 'excellent',
            description: 'Overall productivity rating',
            target: 90.0,
            benchmark: 85.0,
            lastUpdated: new Date().toISOString()
          }
        ]
      },
      {
        id: 'quality',
        name: 'Quality Metrics',
        icon: ShieldCheckIcon,
        color: 'medsight-secondary',
        metrics: [
          {
            id: 'diagnostic-accuracy',
            name: 'Diagnostic Accuracy',
            value: 96.8,
            unit: '%',
            previousValue: 95.4,
            trend: 'up',
            trendPercentage: 1.5,
            category: 'quality',
            status: 'excellent',
            description: 'Confirmed diagnostic accuracy rate',
            target: 95.0,
            benchmark: 92.0,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'peer-agreement',
            name: 'Peer Agreement',
            value: 92.1,
            unit: '%',
            previousValue: 90.8,
            trend: 'up',
            trendPercentage: 1.4,
            category: 'quality',
            status: 'good',
            description: 'Agreement rate with peer reviews',
            target: 90.0,
            benchmark: 88.0,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'critical-miss-rate',
            name: 'Critical Miss Rate',
            value: 0.3,
            unit: '%',
            previousValue: 0.5,
            trend: 'down',
            trendPercentage: 40.0,
            category: 'quality',
            status: 'excellent',
            description: 'Rate of missed critical findings',
            target: 0.5,
            benchmark: 1.0,
            lastUpdated: new Date().toISOString()
          }
        ]
      },
      {
        id: 'ai',
        name: 'AI Metrics',
        icon: CpuChipIcon,
        color: 'medsight-ai-high',
        metrics: [
          {
            id: 'ai-accuracy',
            name: 'AI Accuracy',
            value: 94.2,
            unit: '%',
            previousValue: 93.8,
            trend: 'up',
            trendPercentage: 0.4,
            category: 'ai',
            status: 'excellent',
            description: 'AI analysis accuracy rate',
            target: 90.0,
            benchmark: 85.0,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'ai-processing-time',
            name: 'AI Processing Time',
            value: 2.8,
            unit: 'sec',
            previousValue: 3.2,
            trend: 'down',
            trendPercentage: 12.5,
            category: 'ai',
            status: 'excellent',
            description: 'Average AI analysis processing time',
            target: 5.0,
            benchmark: 8.0,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'ai-confidence',
            name: 'AI Confidence',
            value: 87.6,
            unit: '%',
            previousValue: 86.1,
            trend: 'up',
            trendPercentage: 1.7,
            category: 'ai',
            status: 'good',
            description: 'Average AI confidence score',
            target: 85.0,
            benchmark: 80.0,
            lastUpdated: new Date().toISOString()
          }
        ]
      },
      {
        id: 'efficiency',
        name: 'Efficiency Metrics',
        icon: ClockIcon,
        color: 'medsight-accent',
        metrics: [
          {
            id: 'turnaround-time',
            name: 'Turnaround Time',
            value: 23.5,
            unit: 'min',
            previousValue: 26.8,
            trend: 'down',
            trendPercentage: 12.3,
            category: 'efficiency',
            status: 'excellent',
            description: 'Average study turnaround time',
            target: 30.0,
            benchmark: 45.0,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'workflow-efficiency',
            name: 'Workflow Efficiency',
            value: 88.4,
            unit: '%',
            previousValue: 85.9,
            trend: 'up',
            trendPercentage: 2.9,
            category: 'efficiency',
            status: 'good',
            description: 'Overall workflow efficiency score',
            target: 85.0,
            benchmark: 80.0,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'pending-cases',
            name: 'Pending Cases',
            value: 8,
            unit: 'cases',
            previousValue: 12,
            trend: 'down',
            trendPercentage: 33.3,
            category: 'efficiency',
            status: 'good',
            description: 'Current pending case count',
            target: 10,
            benchmark: 15,
            lastUpdated: new Date().toISOString()
          }
        ]
      },
      {
        id: 'compliance',
        name: 'Compliance Metrics',
        icon: DocumentTextIcon,
        color: 'medsight-normal',
        metrics: [
          {
            id: 'hipaa-compliance',
            name: 'HIPAA Compliance',
            value: '100',
            unit: '%',
            trend: 'stable',
            category: 'compliance',
            status: 'excellent',
            description: 'HIPAA compliance score',
            target: 100,
            benchmark: 100,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'audit-score',
            name: 'Audit Score',
            value: 97.2,
            unit: '%',
            previousValue: 96.8,
            trend: 'up',
            trendPercentage: 0.4,
            category: 'compliance',
            status: 'excellent',
            description: 'Recent audit compliance score',
            target: 95.0,
            benchmark: 90.0,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'report-timeliness',
            name: 'Report Timeliness',
            value: 94.7,
            unit: '%',
            previousValue: 92.3,
            trend: 'up',
            trendPercentage: 2.6,
            category: 'compliance',
            status: 'excellent',
            description: 'Reports completed on time',
            target: 90.0,
            benchmark: 85.0,
            lastUpdated: new Date().toISOString()
          }
        ]
      }
    ];

    setMetricsData(mockData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'medsight-normal';
      case 'good':
        return 'medsight-ai-high';
      case 'fair':
        return 'medsight-pending';
      case 'needs-improvement':
        return 'medsight-abnormal';
      case 'critical':
        return 'medsight-critical';
      default:
        return 'medsight-primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <TrophyIcon className="w-4 h-4" />;
      case 'good':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'fair':
        return <MinusIcon className="w-4 h-4" />;
      case 'needs-improvement':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'critical':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <CheckCircleIcon className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-medsight-normal" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-medsight-critical" />;
      case 'stable':
        return <MinusIcon className="w-4 h-4 text-medsight-primary" />;
      default:
        return <MinusIcon className="w-4 h-4 text-medsight-primary" />;
    }
  };

  const getTrendColor = (trend: string, metricName: string) => {
    // For some metrics, down is good (like review time, pending cases)
    const downIsGood = ['avg-review-time', 'ai-processing-time', 'turnaround-time', 'pending-cases', 'critical-miss-rate'];
    
    if (trend === 'up') {
      return downIsGood.some(metric => metricName.includes(metric.replace(/-/g, '-'))) 
        ? 'text-medsight-critical' 
        : 'text-medsight-normal';
    } else if (trend === 'down') {
      return downIsGood.some(metric => metricName.includes(metric.replace(/-/g, '-'))) 
        ? 'text-medsight-normal' 
        : 'text-medsight-critical';
    }
    return 'text-medsight-primary';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredCategories = selectedCategory === 'all' 
    ? metricsData 
    : metricsData.filter(category => category.id === selectedCategory);

  const allMetrics = metricsData.flatMap(category => category.metrics);
  const excellentMetrics = allMetrics.filter(m => m.status === 'excellent').length;
  const needsImprovementMetrics = allMetrics.filter(m => m.status === 'needs-improvement' || m.status === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <ChartBarIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary">
              Medical Performance Metrics
            </h3>
            <p className="text-sm text-gray-600">
              {allMetrics.length} metrics • {excellentMetrics} excellent • {needsImprovementMetrics} need improvement
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <div className="text-sm text-gray-600">
            Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            selectedCategory === 'all' 
              ? 'bg-primary text-white' 
              : 'text-primary hover:bg-primary/10'
          }`}
        >
          All Metrics
        </button>
        {metricsData.map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === category.id 
                  ? 'bg-secondary text-white' 
                  : 'text-secondary hover:bg-secondary/10'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Metrics Grid - Full Width Horizontal Layout */}
      <div className="space-y-8">
        {filteredCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center space-x-3">
                <IconComponent className="w-6 h-6 text-secondary" />
                <h4 className="text-lg font-semibold text-primary">
                  {category.name}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.metrics.map((metric) => (
                  <div key={metric.id} className="glass-card-secondary p-4 hover-lift">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-medium text-medsight-primary">
                            {metric.name}
                          </h5>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-${getStatusColor(metric.status)}/10 text-${getStatusColor(metric.status)}`}>
                            {getStatusIcon(metric.status)}
                            <span className="text-xs font-medium">
                              {metric.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-medsight-primary/60 mb-2">
                          {metric.description}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-end space-x-2 mb-1">
                        <span className="text-2xl font-bold text-medsight-primary">
                          {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                        </span>
                        <span className="text-sm text-medsight-primary/70 mb-1">
                          {metric.unit}
                        </span>
                      </div>
                      
                      {metric.previousValue && metric.trendPercentage && (
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(metric.trend)}
                          <span className={`text-xs font-medium ${getTrendColor(metric.trend, metric.id)}`}>
                            {metric.trendPercentage.toFixed(1)}% vs {selectedPeriod === 'today' ? 'yesterday' : 'previous'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar for Target */}
                    {metric.target && typeof metric.value === 'number' && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-medsight-primary/60 mb-1">
                          <span>Target: {metric.target}{metric.unit}</span>
                          <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-medsight-primary/10 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              metric.value >= metric.target 
                                ? 'bg-medsight-normal' 
                                : metric.value >= metric.target * 0.8 
                                  ? 'bg-medsight-pending' 
                                  : 'bg-medsight-critical'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (metric.value / metric.target) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Benchmark Comparison */}
                    {metric.benchmark && typeof metric.value === 'number' && (
                      <div className="mb-3 p-2 medsight-control-glass rounded-lg">
                        <div className="text-xs text-medsight-primary/60 mb-1">
                          vs Industry Benchmark
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-medsight-primary">
                            Benchmark: {metric.benchmark}{metric.unit}
                          </span>
                          <span className={`text-xs font-medium ${
                            metric.value >= metric.benchmark 
                              ? 'text-medsight-normal' 
                              : 'text-medsight-critical'
                          }`}>
                            {metric.value >= metric.benchmark 
                              ? `+${((metric.value / metric.benchmark - 1) * 100).toFixed(1)}%` 
                              : `${((metric.value / metric.benchmark - 1) * 100).toFixed(1)}%`
                            }
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-medsight-primary/60">
                      <div className="flex items-center space-x-1">
                        <CalendarDaysIcon className="w-3 h-3" />
                        <span>Updated {formatTimeAgo(metric.lastUpdated)}</span>
                      </div>
                      
                      {metric.status === 'excellent' && (
                        <div className="flex items-center space-x-1 text-medsight-normal">
                          <StarIcon className="w-3 h-3 fill-current" />
                          <span>Excellent</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="medsight-glass p-4 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-medsight-normal/10 rounded-full flex items-center justify-center">
              <TrophyIcon className="w-5 h-5 text-medsight-normal" />
            </div>
            <div>
              <div className="text-lg font-bold text-medsight-normal">
                {excellentMetrics}
              </div>
              <div className="text-sm text-medsight-primary/70">
                Excellent Metrics
              </div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-4 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-medsight-primary/10 rounded-full flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-medsight-primary" />
            </div>
            <div>
              <div className="text-lg font-bold text-medsight-primary">
                {allMetrics.length}
              </div>
              <div className="text-sm text-medsight-primary/70">
                Total Metrics
              </div>
            </div>
          </div>
        </div>

        <div className="medsight-glass p-4 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-medsight-ai-high/10 rounded-full flex items-center justify-center">
              <CpuChipIcon className="w-5 h-5 text-medsight-ai-high" />
            </div>
            <div>
              <div className="text-lg font-bold text-medsight-ai-high">
                94.2%
              </div>
              <div className="text-sm text-medsight-primary/70">
                AI Accuracy
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="medsight-glass p-8 rounded-xl text-center">
          <ChartBarIcon className="w-12 h-12 text-medsight-primary/50 mx-auto mb-4" />
          <div className="text-lg font-medium text-medsight-primary mb-2">
            No Metrics Available
          </div>
          <div className="text-sm text-medsight-primary/70">
            No metrics found for the selected category
          </div>
        </div>
      )}
    </div>
  );
} 
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