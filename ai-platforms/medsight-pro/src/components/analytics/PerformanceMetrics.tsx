'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Zap, 
  Globe, 
  Monitor,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';

interface PerformanceMetricsProps {
  metrics: {
    systemUptime: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
    cacheHitRate: number;
    apiCallsPerMinute: number;
    concurrentUsers: number;
    resourceUtilization: number;
  };
  timeRange: string;
}

interface MetricTrend {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface ResourceMetrics {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
}

interface ApiMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  slowestEndpoint: string;
  fastestEndpoint: string;
  errorBreakdown: {
    '4xx': number;
    '5xx': number;
  };
}

export default function PerformanceMetrics({ metrics, timeRange }: PerformanceMetricsProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [timeSeriesData, setTimeSeriesData] = useState<number[]>([]);
  const [resourceMetrics, setResourceMetrics] = useState<ResourceMetrics>({
    cpu: 0,
    memory: 0,
    storage: 0,
    network: 0
  });
  const [apiMetrics, setApiMetrics] = useState<ApiMetrics>({
    totalRequests: 0,
    successRate: 0,
    averageResponseTime: 0,
    slowestEndpoint: '',
    fastestEndpoint: '',
    errorBreakdown: { '4xx': 0, '5xx': 0 }
  });

  useEffect(() => {
    loadPerformanceData();
  }, [timeRange]);

  const loadPerformanceData = async () => {
    setRefreshing(true);
    
    try {
      // Mock time series data
      const mockTimeSeries = Array.from({ length: 24 }, (_, i) => 
        Math.floor(Math.random() * 100) + 50
      );
      
      // Mock resource metrics
      const mockResourceMetrics: ResourceMetrics = {
        cpu: 68.4,
        memory: 74.2,
        storage: 45.8,
        network: 23.7
      };
      
      // Mock API metrics
      const mockApiMetrics: ApiMetrics = {
        totalRequests: 284756,
        successRate: 99.7,
        averageResponseTime: 124,
        slowestEndpoint: '/api/medical/imaging/analyze',
        fastestEndpoint: '/api/auth/validate',
        errorBreakdown: {
          '4xx': 247,
          '5xx': 89
        }
      };
      
      setTimeSeriesData(mockTimeSeries);
      setResourceMetrics(mockResourceMetrics);
      setApiMetrics(mockApiMetrics);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResourceStatusColor = (value: number): string => {
    if (value < 50) return 'bg-green-500';
    if (value < 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: string, value: number) => {
    const isPositive = trend === 'up' ? value > 0 : value < 0;
    if (trend === 'up') {
      return <ArrowUp className={`w-4 h-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />;
    } else if (trend === 'down') {
      return <ArrowDown className={`w-4 h-4 ${isPositive ? 'text-red-600' : 'text-green-600'}`} />;
    }
    return null;
  };

  const metricTrends: Record<string, MetricTrend> = {
    uptime: { value: metrics.systemUptime, change: 0.02, trend: 'stable' },
    responseTime: { value: metrics.responseTime, change: -8.3, trend: 'down' },
    throughput: { value: metrics.throughput, change: 12.5, trend: 'up' },
    errorRate: { value: metrics.errorRate, change: -0.01, trend: 'down' },
    cacheHitRate: { value: metrics.cacheHitRate, change: 2.1, trend: 'up' },
    concurrentUsers: { value: metrics.concurrentUsers, change: 156, trend: 'up' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Metrics</h2>
          <p className="text-gray-600">Real-time system performance and resource utilization</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadPerformanceData}
            disabled={refreshing}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.systemUptime, { good: 99, warning: 95 })}`}>
                {formatPercentage(metrics.systemUptime)}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                {getTrendIcon(metricTrends.uptime.trend, metricTrends.uptime.change)}
                <span className="ml-1">{metricTrends.uptime.change > 0 ? '+' : ''}{metricTrends.uptime.change}%</span>
              </div>
            </div>
            <Server className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className={`text-2xl font-bold ${getStatusColor(200 - metrics.responseTime, { good: 150, warning: 100 })}`}>
                {metrics.responseTime}ms
              </p>
              <div className="flex items-center text-sm text-gray-500">
                {getTrendIcon(metricTrends.responseTime.trend, metricTrends.responseTime.change)}
                <span className="ml-1">{metricTrends.responseTime.change > 0 ? '+' : ''}{metricTrends.responseTime.change}ms</span>
              </div>
            </div>
            <Zap className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Throughput</p>
              <p className="text-2xl font-bold text-green-600">{formatNumber(metrics.throughput)}/min</p>
              <div className="flex items-center text-sm text-gray-500">
                {getTrendIcon(metricTrends.throughput.trend, metricTrends.throughput.change)}
                <span className="ml-1">{metricTrends.throughput.change > 0 ? '+' : ''}{metricTrends.throughput.change}%</span>
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className={`text-2xl font-bold ${getStatusColor(1 - metrics.errorRate, { good: 0.99, warning: 0.95 })}`}>
                {formatPercentage(metrics.errorRate)}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                {getTrendIcon(metricTrends.errorRate.trend, metricTrends.errorRate.change)}
                <span className="ml-1">{metricTrends.errorRate.change > 0 ? '+' : ''}{metricTrends.errorRate.change}%</span>
              </div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.cacheHitRate, { good: 90, warning: 80 })}`}>
                {formatPercentage(metrics.cacheHitRate)}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                {getTrendIcon(metricTrends.cacheHitRate.trend, metricTrends.cacheHitRate.change)}
                <span className="ml-1">{metricTrends.cacheHitRate.change > 0 ? '+' : ''}{metricTrends.cacheHitRate.change}%</span>
              </div>
            </div>
            <Database className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Concurrent Users</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(metrics.concurrentUsers)}</p>
              <div className="flex items-center text-sm text-gray-500">
                {getTrendIcon(metricTrends.concurrentUsers.trend, metricTrends.concurrentUsers.change)}
                <span className="ml-1">{metricTrends.concurrentUsers.change > 0 ? '+' : ''}{metricTrends.concurrentUsers.change}</span>
              </div>
            </div>
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Utilization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-2">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - resourceMetrics.cpu / 100)}`}
                  className={getResourceStatusColor(resourceMetrics.cpu).replace('bg-', 'text-')}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700">{resourceMetrics.cpu}%</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">CPU Usage</div>
          </div>

          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-2">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - resourceMetrics.memory / 100)}`}
                  className={getResourceStatusColor(resourceMetrics.memory).replace('bg-', 'text-')}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700">{resourceMetrics.memory}%</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">Memory Usage</div>
          </div>

          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-2">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - resourceMetrics.storage / 100)}`}
                  className={getResourceStatusColor(resourceMetrics.storage).replace('bg-', 'text-')}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700">{resourceMetrics.storage}%</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">Storage Usage</div>
          </div>

          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-2">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - resourceMetrics.network / 100)}`}
                  className={getResourceStatusColor(resourceMetrics.network).replace('bg-', 'text-')}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700">{resourceMetrics.network}%</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">Network Usage</div>
          </div>
        </div>
      </div>

      {/* API Performance */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Requests</p>
                <p className="text-2xl font-bold text-blue-800">{formatNumber(apiMetrics.totalRequests)}</p>
                <p className="text-sm text-blue-600">Last 24 hours</p>
              </div>
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-800">{formatPercentage(apiMetrics.successRate)}</p>
                <p className="text-sm text-green-600">
                  {apiMetrics.errorBreakdown['4xx'] + apiMetrics.errorBreakdown['5xx']} errors
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-purple-800">{apiMetrics.averageResponseTime}ms</p>
                <p className="text-sm text-purple-600">Across all endpoints</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Endpoint Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Fastest</span>
                <span className="text-sm font-medium text-green-600">{apiMetrics.fastestEndpoint}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Slowest</span>
                <span className="text-sm font-medium text-red-600">{apiMetrics.slowestEndpoint}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Error Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">4xx Errors</span>
                <span className="text-sm font-medium text-yellow-600">{apiMetrics.errorBreakdown['4xx']}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">5xx Errors</span>
                <span className="text-sm font-medium text-red-600">{apiMetrics.errorBreakdown['5xx']}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 