'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign,
  Building2,
  Activity,
  Clock,
  Target,
  Zap,
  Globe,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  Eye,
  RefreshCw,
  Star,
  Award,
  AlertTriangle,
  CheckCircle,
  Database,
  Server,
  Network,
  Shield,
  Layers,
  Gauge,
  TrendingUp as Growth,
  Calculator,
  Brain
} from 'lucide-react';

interface EnterpriseMetrics {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  systemUptime: number;
  complianceScore: number;
  securityScore: number;
  performanceScore: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
}

interface AnalyticsData {
  revenue: {
    monthly: number[];
    quarterly: number[];
    yearly: number[];
    forecast: number[];
    growth: number;
    churn: number;
    arpu: number; // Average Revenue Per User
  };
  users: {
    total: number[];
    active: number[];
    new: number[];
    retention: number[];
    growth: number;
    engagement: number;
    churnRate: number;
  };
  tenants: {
    total: number[];
    active: number[];
    tier_distribution: {
      enterprise: number;
      professional: number;
      basic: number;
    };
    satisfaction: number;
    expansion: number;
  };
  performance: {
    uptime: number[];
    response_time: number[];
    throughput: number[];
    error_rate: number[];
    sla_compliance: number;
  };
  usage: {
    storage: number[];
    compute: number[];
    bandwidth: number[];
    api_calls: number[];
    peak_usage: number;
  };
  predictions: {
    revenue_forecast: number[];
    user_growth_forecast: number[];
    churn_prediction: number[];
    capacity_forecast: number[];
    confidence: number;
  };
}

interface EnterpriseAnalyticsProps {
  metrics: EnterpriseMetrics;
  timeRange: string;
  className?: string;
}

const EnterpriseAnalytics: React.FC<EnterpriseAnalyticsProps> = ({
  metrics,
  timeRange,
  className = ''
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [viewMode, setViewMode] = useState('chart');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');
  const [showPredictions, setShowPredictions] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    // Mock data - replace with actual API call
    const mockData: AnalyticsData = {
      revenue: {
        monthly: [145000, 152000, 167000, 178000, 189000, 195000, 203000],
        quarterly: [464000, 512000, 587000, 612000],
        yearly: [1980000, 2175000],
        forecast: [210000, 218000, 225000, 232000],
        growth: 15.2,
        churn: 3.8,
        arpu: 127.50
      },
      users: {
        total: [15000, 15800, 16500, 17200, 17800, 18200, 18947],
        active: [11200, 11850, 12400, 12950, 13500, 13800, 14200],
        new: [450, 520, 480, 590, 620, 580, 640],
        retention: [87.2, 88.1, 87.8, 88.5, 89.2, 88.9, 89.4],
        growth: 8.7,
        engagement: 76.3,
        churnRate: 4.2
      },
      tenants: {
        total: [220, 225, 230, 238, 242, 245, 247],
        active: [210, 215, 220, 228, 232, 235, 234],
        tier_distribution: {
          enterprise: 45,
          professional: 128,
          basic: 74
        },
        satisfaction: 4.6,
        expansion: 23.4
      },
      performance: {
        uptime: [99.95, 99.97, 99.96, 99.98, 99.97, 99.98, 99.97],
        response_time: [125, 118, 124, 119, 117, 121, 124],
        throughput: [1420, 1480, 1520, 1580, 1620, 1650, 1680],
        error_rate: [0.05, 0.03, 0.04, 0.02, 0.03, 0.02, 0.03],
        sla_compliance: 99.2
      },
      usage: {
        storage: [28000, 29500, 31200, 32800, 34100, 35600, 37200],
        compute: [520, 545, 580, 610, 640, 665, 680],
        bandwidth: [3200, 3400, 3650, 3850, 4100, 4250, 4300],
        api_calls: [2400000, 2520000, 2680000, 2780000, 2890000, 2950000, 3100000],
        peak_usage: 87.3
      },
      predictions: {
        revenue_forecast: [210000, 218000, 225000, 232000, 240000, 248000],
        user_growth_forecast: [19500, 20200, 20900, 21600, 22400, 23200],
        churn_prediction: [4.1, 3.9, 3.8, 3.7, 3.6, 3.5],
        capacity_forecast: [780, 820, 860, 900, 950, 1000],
        confidence: 87.5
      }
    };

    setAnalyticsData(mockData);
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getGrowthIcon = (rate: number) => {
    return rate >= 0 ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-600" />
    );
  };

  const getGrowthColor = (rate: number) => {
    return rate >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getMetricColor = (value: number, threshold: number, inverse = false) => {
    const isGood = inverse ? value <= threshold : value >= threshold;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '1d': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      default: return 'Last 7 Days';
    }
  };

  const getDataPointsForRange = (data: number[]) => {
    switch (timeRange) {
      case '1d': return data.slice(-24);
      case '7d': return data.slice(-7);
      case '30d': return data.slice(-30);
      case '90d': return data.slice(-90);
      default: return data.slice(-7);
    }
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      metrics: analyticsData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `enterprise-analytics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Failed to load analytics data
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Enterprise Analytics</h3>
          <p className="text-sm text-gray-600">
            Advanced analytics and insights for {getTimeRangeLabel(timeRange)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="revenue">Revenue</option>
            <option value="users">Users</option>
            <option value="tenants">Tenants</option>
            <option value="performance">Performance</option>
            <option value="usage">Usage</option>
          </select>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showPredictions}
              onChange={(e) => setShowPredictions(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show Predictions</span>
          </label>
          <button
            onClick={exportData}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Revenue Growth</p>
              <p className="text-2xl font-bold text-green-900">
                {formatPercentage(analyticsData.revenue.growth)}
              </p>
              <p className="text-sm text-green-600 flex items-center">
                {getGrowthIcon(analyticsData.revenue.growth)}
                <span className="ml-1">vs previous period</span>
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">User Growth</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatPercentage(analyticsData.users.growth)}
              </p>
              <p className="text-sm text-blue-600 flex items-center">
                {getGrowthIcon(analyticsData.users.growth)}
                <span className="ml-1">{formatNumber(analyticsData.users.new[analyticsData.users.new.length - 1])} new users</span>
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Tenant Expansion</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatPercentage(analyticsData.tenants.expansion)}
              </p>
              <p className="text-sm text-purple-600 flex items-center">
                <Star className="w-4 h-4 mr-1" />
                <span>{analyticsData.tenants.satisfaction}/5 satisfaction</span>
              </p>
            </div>
            <Building2 className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">SLA Compliance</p>
              <p className="text-2xl font-bold text-amber-900">
                {formatPercentage(analyticsData.performance.sla_compliance)}
              </p>
              <p className="text-sm text-amber-600 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Target: 99%+</span>
              </p>
            </div>
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Revenue Metrics</h4>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(analyticsData.revenue.monthly[analyticsData.revenue.monthly.length - 1])}
              </div>
              <div className="text-sm text-gray-600">Current Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(analyticsData.revenue.arpu)}
              </div>
              <div className="text-sm text-gray-600">ARPU</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly Growth</span>
              <span className={`text-sm font-medium ${getGrowthColor(analyticsData.revenue.growth)}`}>
                {formatPercentage(analyticsData.revenue.growth)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Churn Rate</span>
              <span className={`text-sm font-medium ${getMetricColor(analyticsData.revenue.churn, 5, true)}`}>
                {formatPercentage(analyticsData.revenue.churn)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Quarterly Revenue</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(analyticsData.revenue.quarterly[analyticsData.revenue.quarterly.length - 1])}
              </span>
            </div>
          </div>

          {showPredictions && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Brain className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Revenue Forecast</span>
              </div>
              <div className="text-sm text-blue-700">
                Next month: {formatCurrency(analyticsData.predictions.revenue_forecast[0])}
                <span className="ml-2 text-xs">
                  ({formatPercentage(analyticsData.predictions.confidence)} confidence)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">User Analytics</h4>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(analyticsData.users.total[analyticsData.users.total.length - 1])}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(analyticsData.users.engagement)}
              </div>
              <div className="text-sm text-gray-600">Engagement</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">User Growth</span>
              <span className={`text-sm font-medium ${getGrowthColor(analyticsData.users.growth)}`}>
                {formatPercentage(analyticsData.users.growth)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Retention Rate</span>
              <span className={`text-sm font-medium ${getMetricColor(analyticsData.users.retention[analyticsData.users.retention.length - 1], 85)}`}>
                {formatPercentage(analyticsData.users.retention[analyticsData.users.retention.length - 1])}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Churn Rate</span>
              <span className={`text-sm font-medium ${getMetricColor(analyticsData.users.churnRate, 5, true)}`}>
                {formatPercentage(analyticsData.users.churnRate)}
              </span>
            </div>
          </div>

          {showPredictions && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Brain className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">User Growth Forecast</span>
              </div>
              <div className="text-sm text-green-700">
                Next month: {formatNumber(analyticsData.predictions.user_growth_forecast[0])} users
                <span className="ml-2 text-xs">
                  ({formatPercentage(analyticsData.predictions.confidence)} confidence)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tenant Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Tenant Distribution & Performance</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {analyticsData.tenants.tier_distribution.enterprise}
            </div>
            <div className="text-sm text-gray-600 mb-1">Enterprise Tenants</div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${(analyticsData.tenants.tier_distribution.enterprise / metrics.totalTenants) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {analyticsData.tenants.tier_distribution.professional}
            </div>
            <div className="text-sm text-gray-600 mb-1">Professional Tenants</div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(analyticsData.tenants.tier_distribution.professional / metrics.totalTenants) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              {analyticsData.tenants.tier_distribution.basic}
            </div>
            <div className="text-sm text-gray-600 mb-1">Basic Tenants</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-600 h-2 rounded-full" 
                style={{ width: `${(analyticsData.tenants.tier_distribution.basic / metrics.totalTenants) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3">Tenant Satisfaction</h5>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className={`w-5 h-5 ${
                      star <= analyticsData.tenants.satisfaction 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-gray-900">
                {analyticsData.tenants.satisfaction}/5
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Based on {analyticsData.tenants.active[analyticsData.tenants.active.length - 1]} active tenants
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3">Expansion Rate</h5>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatPercentage(analyticsData.tenants.expansion)}
            </div>
            <div className="text-sm text-gray-600">
              Tenants expanding their usage and tier levels
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${analyticsData.tenants.expansion}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Performance */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">System Performance & Usage</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatPercentage(analyticsData.performance.uptime[analyticsData.performance.uptime.length - 1])}
            </div>
            <div className="text-sm text-gray-600 mb-2">System Uptime</div>
            <div className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-xs text-green-600">Excellent</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {analyticsData.performance.response_time[analyticsData.performance.response_time.length - 1]}ms
            </div>
            <div className="text-sm text-gray-600 mb-2">Response Time</div>
            <div className="flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-xs text-blue-600">Fast</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatNumber(analyticsData.performance.throughput[analyticsData.performance.throughput.length - 1])}
            </div>
            <div className="text-sm text-gray-600 mb-2">Req/sec</div>
            <div className="flex items-center justify-center">
              <Activity className="w-4 h-4 text-purple-600 mr-1" />
              <span className="text-xs text-purple-600">High</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {formatPercentage(analyticsData.performance.error_rate[analyticsData.performance.error_rate.length - 1])}
            </div>
            <div className="text-sm text-gray-600 mb-2">Error Rate</div>
            <div className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-xs text-green-600">Low</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Database className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Storage Usage</span>
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">
              {formatNumber(analyticsData.usage.storage[analyticsData.usage.storage.length - 1])} GB
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${analyticsData.usage.peak_usage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatPercentage(analyticsData.usage.peak_usage)} of capacity
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Server className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Compute Usage</span>
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">
              {analyticsData.usage.compute[analyticsData.usage.compute.length - 1]} units
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${(analyticsData.usage.compute[analyticsData.usage.compute.length - 1] / 1000) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatPercentage((analyticsData.usage.compute[analyticsData.usage.compute.length - 1] / 1000) * 100)} of capacity
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Network className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">API Calls</span>
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">
              {formatNumber(analyticsData.usage.api_calls[analyticsData.usage.api_calls.length - 1])}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Monthly API requests
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Analytics */}
      {showPredictions && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Brain className="w-6 h-6 text-purple-600 mr-2" />
              <h4 className="text-lg font-medium text-gray-900">Predictive Analytics</h4>
            </div>
            <div className="text-sm text-gray-600">
              Confidence: {formatPercentage(analyticsData.predictions.confidence)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-3">6-Month Forecasts</h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Revenue Growth</span>
                  <span className="text-sm font-medium text-blue-900">
                    {formatCurrency(analyticsData.predictions.revenue_forecast[5])}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">User Growth</span>
                  <span className="text-sm font-medium text-blue-900">
                    {formatNumber(analyticsData.predictions.user_growth_forecast[5])}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Capacity Needed</span>
                  <span className="text-sm font-medium text-blue-900">
                    {analyticsData.predictions.capacity_forecast[5]} units
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg">
              <h5 className="font-medium text-amber-900 mb-3">Risk Assessment</h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-amber-700">Churn Risk</span>
                  <span className={`text-sm font-medium ${getMetricColor(analyticsData.predictions.churn_prediction[0], 5, true)}`}>
                    {formatPercentage(analyticsData.predictions.churn_prediction[0])}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-amber-700">Capacity Risk</span>
                  <span className="text-sm font-medium text-green-600">Low</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-amber-700">Revenue Risk</span>
                  <span className="text-sm font-medium text-green-600">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseAnalytics; 