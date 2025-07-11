'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Globe, 
  Users, 
  Shield, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Server,
  Database,
  Zap,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Award,
  Clock,
  RefreshCw,
  Settings,
  Bell,
  Download,
  Filter,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Network,
  Lock
} from 'lucide-react';

// Import enterprise components
import EnterpriseOverview from '@/components/enterprise/EnterpriseOverview';
import TenantManagement from '@/components/enterprise/TenantManagement';
import ResourceAllocation from '@/components/enterprise/ResourceAllocation';
import EnterpriseAnalytics from '@/components/enterprise/EnterpriseAnalytics';
import ComplianceDashboard from '@/components/enterprise/ComplianceDashboard';
import PerformanceMonitoring from '@/components/enterprise/PerformanceMonitoring';

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
  createdAt: Date;
  billing: {
    plan: string;
    amount: number;
    currency: string;
    period: string;
  };
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
  limits: {
    users: number;
    storage: number;
    bandwidth: number;
  };
}

export default function EnterpriseDashboard() {
  const [metrics, setMetrics] = useState<EnterpriseMetrics | null>(null);
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadDashboardData();
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadDashboardData = async () => {
    setLoading(true);
    
    try {
      // Mock data - replace with actual API calls
      const mockMetrics: EnterpriseMetrics = {
        totalTenants: 247,
        activeTenants: 234,
        totalUsers: 18947,
        activeUsers: 12463,
        totalRevenue: 2847650,
        monthlyRevenue: 189750,
        systemUptime: 99.97,
        complianceScore: 98.1,
        securityScore: 96.8,
        performanceScore: 94.3,
        resourceUtilization: {
          cpu: 68,
          memory: 74,
          storage: 52,
          network: 43
        },
        alerts: {
          critical: 3,
          warning: 12,
          info: 28
        }
      };

      const mockTenants: TenantSummary[] = [
        {
          id: '1',
          name: 'General Hospital',
          organization: 'Metro Health System',
          users: 1247,
          status: 'active',
          tier: 'enterprise',
          usage: {
            storage: 2400,
            compute: 85,
            bandwidth: 1200
          },
          compliance: 98.5,
          lastActivity: new Date(Date.now() - 1000 * 60 * 15),
          createdAt: new Date(2023, 0, 15),
          billing: {
            plan: 'Enterprise',
            amount: 50000,
            currency: 'USD',
            period: 'monthly'
          },
          contact: {
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@generalhospital.com',
            phone: '+1-555-0123'
          },
          limits: {
            users: 2000,
            storage: 5000,
            bandwidth: 10000
          }
        },
        {
          id: '2',
          name: 'Regional Medical Center',
          organization: 'HealthCorp Inc.',
          users: 892,
          status: 'active',
          tier: 'professional',
          usage: {
            storage: 1800,
            compute: 67,
            bandwidth: 890
          },
          compliance: 96.2,
          lastActivity: new Date(Date.now() - 1000 * 60 * 30),
          createdAt: new Date(2023, 1, 20),
          billing: {
            plan: 'Professional',
            amount: 25000,
            currency: 'USD',
            period: 'monthly'
          },
          contact: {
            name: 'Dr. Michael Chen',
            email: 'michael.chen@regionalmedical.com',
            phone: '+1-555-0456'
          },
          limits: {
            users: 1000,
            storage: 3000,
            bandwidth: 5000
          }
        },
        {
          id: '3',
          name: 'City Clinic',
          organization: 'Independent Practice',
          users: 156,
          status: 'active',
          tier: 'basic',
          usage: {
            storage: 450,
            compute: 34,
            bandwidth: 230
          },
          compliance: 94.8,
          lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
          createdAt: new Date(2023, 3, 10),
          billing: {
            plan: 'Basic',
            amount: 5000,
            currency: 'USD',
            period: 'monthly'
          },
          contact: {
            name: 'Dr. Lisa Rodriguez',
            email: 'lisa.rodriguez@cityclinic.com',
            phone: '+1-555-0789'
          },
          limits: {
            users: 200,
            storage: 1000,
            bandwidth: 1000
          }
        },
        {
          id: '4',
          name: 'Specialized Imaging',
          organization: 'RadTech Solutions',
          users: 234,
          status: 'suspended',
          tier: 'professional',
          usage: {
            storage: 600,
            compute: 0,
            bandwidth: 0
          },
          compliance: 87.3,
          lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          createdAt: new Date(2023, 2, 5),
          billing: {
            plan: 'Professional',
            amount: 25000,
            currency: 'USD',
            period: 'monthly'
          },
          contact: {
            name: 'Dr. James Park',
            email: 'james.park@specializedimaging.com',
            phone: '+1-555-0321'
          },
          limits: {
            users: 500,
            storage: 2000,
            bandwidth: 3000
          }
        }
      ];

      setMetrics(mockMetrics);
      setTenants(mockTenants);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'suspended': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Enterprise
        </span>;
      case 'professional':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Professional
        </span>;
      case 'basic':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Basic
        </span>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-yellow-600';
    if (score >= 80) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 95) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 90) return <CheckCircle className="w-4 h-4 text-yellow-600" />;
    if (score >= 80) return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading enterprise dashboard...</div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-gray-600">Failed to load dashboard data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Enterprise Dashboard</h1>
                <p className="text-sm text-gray-600">Multi-tenant management and monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
                </label>
                <RefreshCw 
                  className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600"
                  onClick={() => loadDashboardData()}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-400" />
                <div className="relative">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{metrics.alerts.critical}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {metrics.alerts.critical > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {metrics.alerts.critical} critical alerts require immediate attention
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalTenants}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  {metrics.activeTenants} active
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalUsers)}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  {formatNumber(metrics.activeUsers)} active
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.monthlyRevenue)}</p>
                <p className="text-sm text-gray-500">
                  Total: {formatCurrency(metrics.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.systemUptime}%</p>
                <p className="text-sm text-gray-500">Last 30 days</p>
              </div>
              <div className="flex items-center">
                {getScoreIcon(metrics.systemUptime)}
                <Server className="w-8 h-8 text-blue-600 ml-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.complianceScore)}`}>
                  {metrics.complianceScore}%
                </p>
                <p className="text-sm text-gray-500">HIPAA & SOC 2</p>
              </div>
              <div className="flex items-center">
                {getScoreIcon(metrics.complianceScore)}
                <Shield className="w-8 h-8 text-green-600 ml-2" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.securityScore)}`}>
                  {metrics.securityScore}%
                </p>
                <p className="text-sm text-gray-500">Threat detection</p>
              </div>
              <div className="flex items-center">
                {getScoreIcon(metrics.securityScore)}
                <Lock className="w-8 h-8 text-red-600 ml-2" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.performanceScore)}`}>
                  {metrics.performanceScore}%
                </p>
                <p className="text-sm text-gray-500">System performance</p>
              </div>
              <div className="flex items-center">
                {getScoreIcon(metrics.performanceScore)}
                <Zap className="w-8 h-8 text-yellow-600 ml-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Utilization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">CPU Usage</span>
                <span className="text-sm font-bold text-blue-900">{metrics.resourceUtilization.cpu}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${metrics.resourceUtilization.cpu}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Memory Usage</span>
                <span className="text-sm font-bold text-green-900">{metrics.resourceUtilization.memory}%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${metrics.resourceUtilization.memory}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-700">Storage Usage</span>
                <span className="text-sm font-bold text-yellow-900">{metrics.resourceUtilization.storage}%</span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${metrics.resourceUtilization.storage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700">Network Usage</span>
                <span className="text-sm font-bold text-purple-900">{metrics.resourceUtilization.network}%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${metrics.resourceUtilization.network}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'tenants', label: 'Tenants', icon: Building2 },
                { id: 'resources', label: 'Resources', icon: Server },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'compliance', label: 'Compliance', icon: Shield },
                { id: 'performance', label: 'Performance', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <EnterpriseOverview 
                metrics={metrics}
                tenants={tenants}
                timeRange={timeRange}
              />
            )}
            
            {activeTab === 'tenants' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Tenant Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{tenant.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          tenant.status === 'active' ? 'bg-green-100 text-green-800' :
                          tenant.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tenant.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{tenant.organization}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <div>Users: {tenant.users}</div>
                        <div>Tier: {tenant.tier}</div>
                        <div>Compliance: {tenant.compliance}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'resources' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Resource Allocation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">CPU Usage</h4>
                    <div className="text-2xl font-bold text-blue-600">{metrics.resourceUtilization.cpu}%</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Memory Usage</h4>
                    <div className="text-2xl font-bold text-green-600">{metrics.resourceUtilization.memory}%</div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Enterprise Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Revenue</h4>
                    <div className="text-2xl font-bold text-green-600">${metrics.monthlyRevenue.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Active Users</h4>
                    <div className="text-2xl font-bold text-blue-600">{metrics.activeUsers.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'compliance' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Compliance Dashboard</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Overall Compliance Score</h4>
                  <div className="text-2xl font-bold text-green-600">{metrics.complianceScore}%</div>
                </div>
              </div>
            )}
            
            {activeTab === 'performance' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Performance Monitoring</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">System Performance</h4>
                  <div className="text-2xl font-bold text-yellow-600">{metrics.performanceScore}%</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 