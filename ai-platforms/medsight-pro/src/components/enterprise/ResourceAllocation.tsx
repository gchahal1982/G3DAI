'use client';

import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Zap, 
  Network,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Settings,
  Sliders,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  RefreshCw,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Users,
  DollarSign,
  Shield,
  Layers,
  Monitor,
  Wifi,
  Power,
  Gauge
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

interface ResourcePool {
  id: string;
  name: string;
  type: 'compute' | 'storage' | 'network' | 'database';
  total: number;
  allocated: number;
  available: number;
  reserved: number;
  efficiency: number;
  cost: number;
  region: string;
  tenants: {
    tenantId: string;
    tenantName: string;
    allocated: number;
    usage: number;
    tier: string;
  }[];
}

interface ScalingPolicy {
  id: string;
  name: string;
  resourceType: string;
  tenantId?: string;
  triggers: {
    metricType: 'cpu' | 'memory' | 'storage' | 'users';
    threshold: number;
    operator: 'greater_than' | 'less_than';
    duration: number;
  }[];
  actions: {
    type: 'scale_up' | 'scale_down' | 'notify';
    amount: number;
    maxLimit: number;
    minLimit: number;
  }[];
  enabled: boolean;
  lastTriggered?: Date;
}

interface ResourceAllocationProps {
  metrics: EnterpriseMetrics;
  tenants: TenantSummary[];
  className?: string;
}

const ResourceAllocation: React.FC<ResourceAllocationProps> = ({
  metrics,
  tenants,
  className = ''
}) => {
  const [resourcePools, setResourcePools] = useState<ResourcePool[]>([]);
  const [scalingPolicies, setScalingPolicies] = useState<ScalingPolicy[]>([]);
  const [selectedPool, setSelectedPool] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(true);

  useEffect(() => {
    loadResourceData();
  }, []);

  const loadResourceData = async () => {
    setLoading(true);
    
    // Mock data - replace with actual API calls
    const mockPools: ResourcePool[] = [
      {
        id: '1',
        name: 'Primary Compute Cluster',
        type: 'compute',
        total: 1000,
        allocated: 680,
        available: 320,
        reserved: 100,
        efficiency: 87.2,
        cost: 15420,
        region: 'us-east-1',
        tenants: [
          { tenantId: '1', tenantName: 'General Hospital', allocated: 300, usage: 245, tier: 'enterprise' },
          { tenantId: '2', tenantName: 'Regional Medical', allocated: 200, usage: 180, tier: 'professional' },
          { tenantId: '3', tenantName: 'City Clinic', allocated: 80, usage: 65, tier: 'basic' },
          { tenantId: '4', tenantName: 'Specialized Imaging', allocated: 100, usage: 0, tier: 'professional' }
        ]
      },
      {
        id: '2',
        name: 'High-Performance Storage',
        type: 'storage',
        total: 50000,
        allocated: 32500,
        available: 17500,
        reserved: 5000,
        efficiency: 92.8,
        cost: 8750,
        region: 'us-east-1',
        tenants: [
          { tenantId: '1', tenantName: 'General Hospital', allocated: 15000, usage: 12400, tier: 'enterprise' },
          { tenantId: '2', tenantName: 'Regional Medical', allocated: 10000, usage: 8900, tier: 'professional' },
          { tenantId: '3', tenantName: 'City Clinic', allocated: 3000, usage: 2100, tier: 'basic' },
          { tenantId: '4', tenantName: 'Specialized Imaging', allocated: 4500, usage: 0, tier: 'professional' }
        ]
      },
      {
        id: '3',
        name: 'Network Infrastructure',
        type: 'network',
        total: 10000,
        allocated: 4300,
        available: 5700,
        reserved: 1000,
        efficiency: 78.4,
        cost: 3250,
        region: 'global',
        tenants: [
          { tenantId: '1', tenantName: 'General Hospital', allocated: 2000, usage: 1620, tier: 'enterprise' },
          { tenantId: '2', tenantName: 'Regional Medical', allocated: 1500, usage: 1240, tier: 'professional' },
          { tenantId: '3', tenantName: 'City Clinic', allocated: 500, usage: 320, tier: 'basic' },
          { tenantId: '4', tenantName: 'Specialized Imaging', allocated: 300, usage: 0, tier: 'professional' }
        ]
      },
      {
        id: '4',
        name: 'Database Cluster',
        type: 'database',
        total: 500,
        allocated: 340,
        available: 160,
        reserved: 50,
        efficiency: 89.6,
        cost: 12800,
        region: 'us-east-1',
        tenants: [
          { tenantId: '1', tenantName: 'General Hospital', allocated: 150, usage: 128, tier: 'enterprise' },
          { tenantId: '2', tenantName: 'Regional Medical', allocated: 100, usage: 87, tier: 'professional' },
          { tenantId: '3', tenantName: 'City Clinic', allocated: 40, usage: 32, tier: 'basic' },
          { tenantId: '4', tenantName: 'Specialized Imaging', allocated: 50, usage: 0, tier: 'professional' }
        ]
      }
    ];

    const mockPolicies: ScalingPolicy[] = [
      {
        id: '1',
        name: 'High CPU Auto-Scale',
        resourceType: 'compute',
        triggers: [
          { metricType: 'cpu', threshold: 80, operator: 'greater_than', duration: 300 }
        ],
        actions: [
          { type: 'scale_up', amount: 20, maxLimit: 1500, minLimit: 500 }
        ],
        enabled: true,
        lastTriggered: new Date('2024-01-15T14:30:00Z')
      },
      {
        id: '2',
        name: 'Storage Capacity Warning',
        resourceType: 'storage',
        triggers: [
          { metricType: 'storage', threshold: 85, operator: 'greater_than', duration: 60 }
        ],
        actions: [
          { type: 'notify', amount: 0, maxLimit: 0, minLimit: 0 }
        ],
        enabled: true
      },
      {
        id: '3',
        name: 'Enterprise Tenant Priority',
        resourceType: 'compute',
        tenantId: '1',
        triggers: [
          { metricType: 'cpu', threshold: 90, operator: 'greater_than', duration: 120 }
        ],
        actions: [
          { type: 'scale_up', amount: 50, maxLimit: 2000, minLimit: 200 }
        ],
        enabled: true
      }
    ];

    setResourcePools(mockPools);
    setScalingPolicies(mockPolicies);
    setLoading(false);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'compute': return <Cpu className="w-5 h-5 text-blue-600" />;
      case 'storage': return <HardDrive className="w-5 h-5 text-green-600" />;
      case 'network': return <Wifi className="w-5 h-5 text-purple-600" />;
      case 'database': return <Database className="w-5 h-5 text-orange-600" />;
      default: return <Server className="w-5 h-5 text-gray-600" />;
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    if (percentage >= 50) return 'text-blue-600';
    return 'text-green-600';
  };

  const getUtilizationBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-yellow-600';
    if (percentage >= 50) return 'bg-blue-600';
    return 'bg-green-600';
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 85) return 'text-green-600';
    if (efficiency >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getUtilizationPercentage = (allocated: number, total: number) => {
    return (allocated / total) * 100;
  };

  const getUsagePercentage = (usage: number, allocated: number) => {
    return allocated > 0 ? (usage / allocated) * 100 : 0;
  };

  const calculateOptimizationSavings = () => {
    // Mock calculation for potential savings through optimization
    return resourcePools.reduce((savings, pool) => {
      const wastedResources = pool.allocated - pool.tenants.reduce((sum, t) => sum + t.usage, 0);
      const wastedCost = (wastedResources / pool.total) * pool.cost;
      return savings + wastedCost * 0.7; // Assume 70% of waste can be optimized
    }, 0);
  };

  const handleResourceReallocation = (poolId: string, tenantId: string, newAllocation: number) => {
    setResourcePools(pools => 
      pools.map(pool => {
        if (pool.id === poolId) {
          const updatedTenants = pool.tenants.map(tenant => 
            tenant.tenantId === tenantId 
              ? { ...tenant, allocated: newAllocation }
              : tenant
          );
          const totalAllocated = updatedTenants.reduce((sum, t) => sum + t.allocated, 0);
          return {
            ...pool,
            allocated: totalAllocated,
            available: pool.total - totalAllocated - pool.reserved,
            tenants: updatedTenants
          };
        }
        return pool;
      })
    );
  };

  const handleScalingPolicyToggle = (policyId: string) => {
    setScalingPolicies(policies =>
      policies.map(policy =>
        policy.id === policyId
          ? { ...policy, enabled: !policy.enabled }
          : policy
      )
    );
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Resource Allocation</h3>
          <p className="text-sm text-gray-600">
            Monitor and optimize resource usage across all tenants
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoOptimize}
              onChange={(e) => setAutoOptimize(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Auto-optimize</span>
          </label>
          <button
            onClick={() => setShowAddPolicy(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Policy
          </button>
        </div>
      </div>

      {/* Resource Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {resourcePools.map((pool) => {
          const utilizationPercentage = getUtilizationPercentage(pool.allocated, pool.total);
          return (
            <div key={pool.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getResourceIcon(pool.type)}
                  <h4 className="ml-2 font-medium text-gray-900 capitalize">{pool.type}</h4>
                </div>
                <div className={`text-sm font-medium ${getEfficiencyColor(pool.efficiency)}`}>
                  {formatPercentage(pool.efficiency)} efficient
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Allocated</span>
                  <span className={getUtilizationColor(utilizationPercentage)}>
                    {formatNumber(pool.allocated)} / {formatNumber(pool.total)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUtilizationBgColor(utilizationPercentage)}`}
                    style={{ width: `${utilizationPercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatPercentage(utilizationPercentage)} utilized
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-medium">{formatNumber(pool.available)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reserved:</span>
                  <span className="font-medium">{formatNumber(pool.reserved)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Cost:</span>
                  <span className="font-medium">{formatCurrency(pool.cost)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPool(pool.id)}
                className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm"
              >
                Manage Resources
              </button>
            </div>
          );
        })}
      </div>

      {/* Optimization Insights */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Optimization Insights</h4>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              Potential Savings: {formatCurrency(calculateOptimizationSavings())}/month
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Underutilized Resources</span>
            </div>
            <div className="text-2xl font-bold text-green-900 mb-1">23%</div>
            <div className="text-sm text-green-700">Can be reallocated or scaled down</div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">High Utilization</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900 mb-1">12%</div>
            <div className="text-sm text-yellow-700">Resources nearing capacity limits</div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Gauge className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Optimal Usage</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 mb-1">65%</div>
            <div className="text-sm text-blue-700">Resources operating efficiently</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'tenants', label: 'Tenant Resources', icon: Building2 },
              { id: 'scaling', label: 'Auto-scaling', icon: TrendingUp },
              { id: 'optimization', label: 'Optimization', icon: Target }
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

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-4">Resource Distribution</h5>
                  <div className="space-y-4">
                    {resourcePools.map((pool) => (
                      <div key={pool.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {getResourceIcon(pool.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{pool.name}</div>
                            <div className="text-sm text-gray-500">{pool.region}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPercentage(getUtilizationPercentage(pool.allocated, pool.total))}
                          </div>
                          <div className="text-sm text-gray-500">utilized</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-4">Cost Breakdown</h5>
                  <div className="space-y-4">
                    {resourcePools.map((pool) => (
                      <div key={pool.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {getResourceIcon(pool.type)}
                          <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                            {pool.type}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(pool.cost)}
                          </div>
                          <div className="text-sm text-gray-500">per month</div>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-t border-blue-200">
                      <span className="text-sm font-medium text-blue-900">Total Monthly Cost</span>
                      <span className="text-sm font-bold text-blue-900">
                        {formatCurrency(resourcePools.reduce((sum, pool) => sum + pool.cost, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tenants' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Tenant</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Tier</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Compute</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Storage</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Network</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Database</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Usage Efficiency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tenants.map((tenant) => {
                      const computePool = resourcePools.find(p => p.type === 'compute');
                      const storagePool = resourcePools.find(p => p.type === 'storage');
                      const networkPool = resourcePools.find(p => p.type === 'network');
                      const databasePool = resourcePools.find(p => p.type === 'database');

                      const computeTenant = computePool?.tenants.find(t => t.tenantId === tenant.id);
                      const storageTenant = storagePool?.tenants.find(t => t.tenantId === tenant.id);
                      const networkTenant = networkPool?.tenants.find(t => t.tenantId === tenant.id);
                      const databaseTenant = databasePool?.tenants.find(t => t.tenantId === tenant.id);

                      const overallEfficiency = [computeTenant, storageTenant, networkTenant, databaseTenant]
                        .filter(Boolean)
                        .reduce((avg, t, _, arr) => avg + (t!.usage / t!.allocated * 100) / arr.length, 0);

                      return (
                        <tr key={tenant.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                              <div className="text-sm text-gray-500">{tenant.organization}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(tenant.tier)}`}>
                              {tenant.tier}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">
                              {computeTenant ? `${computeTenant.usage}/${computeTenant.allocated}` : 'N/A'}
                            </div>
                            {computeTenant && (
                              <div className="text-xs text-gray-500">
                                {formatPercentage(getUsagePercentage(computeTenant.usage, computeTenant.allocated))} used
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">
                              {storageTenant ? `${formatNumber(storageTenant.usage)}/${formatNumber(storageTenant.allocated)} GB` : 'N/A'}
                            </div>
                            {storageTenant && (
                              <div className="text-xs text-gray-500">
                                {formatPercentage(getUsagePercentage(storageTenant.usage, storageTenant.allocated))} used
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">
                              {networkTenant ? `${formatNumber(networkTenant.usage)}/${formatNumber(networkTenant.allocated)} GB` : 'N/A'}
                            </div>
                            {networkTenant && (
                              <div className="text-xs text-gray-500">
                                {formatPercentage(getUsagePercentage(networkTenant.usage, networkTenant.allocated))} used
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">
                              {databaseTenant ? `${databaseTenant.usage}/${databaseTenant.allocated}` : 'N/A'}
                            </div>
                            {databaseTenant && (
                              <div className="text-xs text-gray-500">
                                {formatPercentage(getUsagePercentage(databaseTenant.usage, databaseTenant.allocated))} used
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className={`text-sm font-medium ${getEfficiencyColor(overallEfficiency)}`}>
                              {formatPercentage(overallEfficiency)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'scaling' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-gray-900">Auto-scaling Policies</h5>
                <button
                  onClick={() => setShowAddPolicy(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Add Policy
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {scalingPolicies.map((policy) => (
                  <div key={policy.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={policy.enabled}
                            onChange={() => handleScalingPolicyToggle(policy.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-900">{policy.name}</span>
                        </div>
                        <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {policy.resourceType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {policy.lastTriggered && (
                          <span className="text-xs text-gray-500">
                            Last triggered: {policy.lastTriggered.toLocaleDateString()}
                          </span>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Triggers:</span>
                        <ul className="mt-1 space-y-1">
                          {policy.triggers.map((trigger, index) => (
                            <li key={index} className="text-gray-900">
                              {trigger.metricType} {trigger.operator.replace('_', ' ')} {trigger.threshold}% for {trigger.duration}s
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-gray-600">Actions:</span>
                        <ul className="mt-1 space-y-1">
                          {policy.actions.map((action, index) => (
                            <li key={index} className="text-gray-900">
                              {action.type.replace('_', ' ')} by {action.amount} (min: {action.minLimit}, max: {action.maxLimit})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'optimization' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-3">Optimization Recommendations</h5>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <TrendingDown className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Reduce Storage Allocation</div>
                        <div className="text-sm text-gray-600">City Clinic is using only 70% of allocated storage</div>
                        <div className="text-sm text-green-600">Potential savings: $150/month</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <TrendingUp className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Increase Compute Allocation</div>
                        <div className="text-sm text-gray-600">General Hospital is at 98% compute utilization</div>
                        <div className="text-sm text-blue-600">Recommended increase: 20%</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <RefreshCw className="w-5 h-5 text-purple-600 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Enable Auto-scaling</div>
                        <div className="text-sm text-gray-600">3 tenants could benefit from auto-scaling policies</div>
                        <div className="text-sm text-purple-600">Improve efficiency by 15%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-3">Resource Efficiency Trends</h5>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Efficiency</span>
                        <span className="font-medium">87.2%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '87.2%' }}></div>
                      </div>
                      <div className="text-xs text-green-600 mt-1">↑ 3.2% from last month</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Cost Efficiency</span>
                        <span className="font-medium">82.4%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '82.4%' }}></div>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">↑ 1.8% from last month</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Waste Reduction</span>
                        <span className="font-medium">76.8%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '76.8%' }}></div>
                      </div>
                      <div className="text-xs text-yellow-600 mt-1">↓ 0.5% from last month</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceAllocation; 