'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Shield,
  Target,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Eye,
  Settings,
  Download,
  RefreshCw,
  Star,
  Award,
  Layers,
  Network
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

interface TenantSummary {
  id: string;
  name: string;
  organization: string;
  users: number;
  status: 'active' | 'inactive' | 'suspended';
  tier: 'basic' | 'professional' | 'enterprise';
  usage: {
    storage: number;
    compute: number;
    bandwidth: number;
  };
  compliance: number;
  lastActivity: Date;
}

interface EnterpriseOverviewProps {
  metrics: EnterpriseMetrics;
  tenants: TenantSummary[];
  timeRange: string;
  className?: string;
}

const EnterpriseOverview: React.FC<EnterpriseOverviewProps> = ({
  metrics,
  tenants,
  timeRange,
  className = ''
}) => {
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [viewMode, setViewMode] = useState('cards');
  const [loading, setLoading] = useState(false);

  // Calculate derived metrics
  const tenantGrowthRate = 12.5; // Mock growth rate
  const userGrowthRate = 8.7; // Mock growth rate
  const revenueGrowthRate = 15.2; // Mock growth rate
  
  const topTenants = tenants
    .sort((a, b) => b.users - a.users)
    .slice(0, 5);

  const tenantsByTier = {
    enterprise: tenants.filter(t => t.tier === 'enterprise').length,
    professional: tenants.filter(t => t.tier === 'professional').length,
    basic: tenants.filter(t => t.tier === 'basic').length
  };

  const averageComplianceScore = tenants.length > 0 
    ? tenants.reduce((sum, t) => sum + t.compliance, 0) / tenants.length
    : 0;

  const totalStorageUsed = tenants.reduce((sum, t) => sum + t.usage.storage, 0);
  const totalComputeUsed = tenants.reduce((sum, t) => sum + t.usage.compute, 0);
  const totalBandwidthUsed = tenants.reduce((sum, t) => sum + t.usage.bandwidth, 0);

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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'suspended': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-yellow-600';
    if (score >= 80) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Enterprise Overview</h3>
          <p className="text-sm text-gray-600">
            Comprehensive view of all tenants and system performance
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
            <option value="compliance">Compliance</option>
          </select>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="cards">Cards</option>
            <option value="table">Table</option>
            <option value="chart">Chart</option>
          </select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(metrics.totalRevenue)}</p>
              <p className={`text-sm flex items-center ${getGrowthColor(revenueGrowthRate)}`}>
                {getGrowthIcon(revenueGrowthRate)}
                <span className="ml-1">{formatPercentage(revenueGrowthRate)} growth</span>
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Active Tenants</p>
              <p className="text-2xl font-bold text-green-900">{metrics.activeTenants}</p>
              <p className={`text-sm flex items-center ${getGrowthColor(tenantGrowthRate)}`}>
                {getGrowthIcon(tenantGrowthRate)}
                <span className="ml-1">{formatPercentage(tenantGrowthRate)} growth</span>
              </p>
            </div>
            <Building2 className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Total Users</p>
              <p className="text-2xl font-bold text-purple-900">{formatNumber(metrics.totalUsers)}</p>
              <p className={`text-sm flex items-center ${getGrowthColor(userGrowthRate)}`}>
                {getGrowthIcon(userGrowthRate)}
                <span className="ml-1">{formatPercentage(userGrowthRate)} growth</span>
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">Avg Compliance</p>
              <p className="text-2xl font-bold text-amber-900">{formatPercentage(averageComplianceScore)}</p>
              <p className="text-sm text-amber-600">Across all tenants</p>
            </div>
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Tenant Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Tenant Distribution by Tier</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-600 rounded mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Enterprise</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900 mr-2">{tenantsByTier.enterprise}</span>
                <span className="text-sm text-gray-500">
                  ({formatPercentage((tenantsByTier.enterprise / metrics.totalTenants) * 100)})
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-600 rounded mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Professional</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900 mr-2">{tenantsByTier.professional}</span>
                <span className="text-sm text-gray-500">
                  ({formatPercentage((tenantsByTier.professional / metrics.totalTenants) * 100)})
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-600 rounded mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Basic</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900 mr-2">{tenantsByTier.basic}</span>
                <span className="text-sm text-gray-500">
                  ({formatPercentage((tenantsByTier.basic / metrics.totalTenants) * 100)})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">System Health Overview</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatPercentage(metrics.systemUptime)}</div>
              <div className="text-sm text-gray-600">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatPercentage(metrics.complianceScore)}</div>
              <div className="text-sm text-gray-600">Compliance Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatPercentage(metrics.securityScore)}</div>
              <div className="text-sm text-gray-600">Security Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{formatPercentage(metrics.performanceScore)}</div>
              <div className="text-sm text-gray-600">Performance Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Usage Overview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Resource Usage Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Server className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Storage</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{formatNumber(totalStorageUsed)} GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min((totalStorageUsed / 10000) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatPercentage(Math.min((totalStorageUsed / 10000) * 100, 100))} of 10TB used
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Compute</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{formatNumber(totalComputeUsed)} units</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${Math.min((totalComputeUsed / 1000) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatPercentage(Math.min((totalComputeUsed / 1000) * 100, 100))} of 1000 units used
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Network className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Bandwidth</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{formatNumber(totalBandwidthUsed)} GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${Math.min((totalBandwidthUsed / 5000) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatPercentage(Math.min((totalBandwidthUsed / 5000) * 100, 100))} of 5TB used
            </div>
          </div>
        </div>
      </div>

      {/* Top Tenants */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Top Tenants by Users</h4>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {topTenants.map((tenant, index) => (
            <div key={tenant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                  <div className="text-sm text-gray-500">{tenant.organization}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-sm font-bold text-gray-900">{formatNumber(tenant.users)}</div>
                  <div className="text-xs text-gray-500">Users</div>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-bold ${getComplianceColor(tenant.compliance)}`}>
                    {formatPercentage(tenant.compliance)}
                  </div>
                  <div className="text-xs text-gray-500">Compliance</div>
                </div>
                <div className="text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(tenant.tier)}`}>
                    {tenant.tier}
                  </span>
                </div>
                <div className="text-center">
                  <div className={`text-sm ${getStatusColor(tenant.status)}`}>
                    {tenant.status}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTimeAgo(tenant.lastActivity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Summary */}
      {(metrics.alerts.critical > 0 || metrics.alerts.warning > 0) && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">System Alerts</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.alerts.critical > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-red-800">Critical Alerts</div>
                    <div className="text-2xl font-bold text-red-900">{metrics.alerts.critical}</div>
                  </div>
                </div>
              </div>
            )}
            
            {metrics.alerts.warning > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-yellow-800">Warning Alerts</div>
                    <div className="text-2xl font-bold text-yellow-900">{metrics.alerts.warning}</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-blue-800">Info Alerts</div>
                  <div className="text-2xl font-bold text-blue-900">{metrics.alerts.info}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseOverview; 