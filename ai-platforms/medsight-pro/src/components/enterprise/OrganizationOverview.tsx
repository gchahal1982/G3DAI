import React from 'react';
import { 
  Building, Users, Activity, TrendingUp, 
  TrendingDown, MapPin, Calendar, Settings,
  CheckCircle, AlertTriangle, Clock, Star
} from 'lucide-react';

interface OrganizationOverviewProps {
  className?: string;
}

export default function OrganizationOverview({ className = '' }: OrganizationOverviewProps) {
  const topOrganizations = [
    {
      name: 'Metro General Hospital',
      location: 'New York, NY',
      users: 1247,
      studies: 12847,
      tier: 'Enterprise',
      status: 'active',
      growth: 12.5,
      revenue: '$124,700'
    },
    {
      name: 'Pacific Medical Center',
      location: 'San Francisco, CA',
      users: 892,
      studies: 8934,
      tier: 'Professional',
      status: 'active',
      growth: 8.2,
      revenue: '$89,200'
    },
    {
      name: 'Heart & Vascular Institute',
      location: 'Chicago, IL',
      users: 743,
      studies: 7234,
      tier: 'Professional',
      status: 'active',
      growth: 15.8,
      revenue: '$74,300'
    },
    {
      name: 'Children\'s Medical Center',
      location: 'Houston, TX',
      users: 567,
      studies: 5678,
      tier: 'Standard',
      status: 'warning',
      growth: -2.1,
      revenue: '$56,700'
    },
    {
      name: 'Regional Cancer Center',
      location: 'Miami, FL',
      users: 423,
      studies: 4567,
      tier: 'Standard',
      status: 'active',
      growth: 6.7,
      revenue: '$42,300'
    }
  ];

  const organizationStats = [
    {
      label: 'Active Organizations',
      value: '234',
      change: '+12',
      trend: 'up',
      color: 'text-medsight-secondary'
    },
    {
      label: 'New This Month',
      value: '18',
      change: '+3',
      trend: 'up',
      color: 'text-medsight-primary'
    },
    {
      label: 'Total Users',
      value: '24,789',
      change: '+1,247',
      trend: 'up',
      color: 'text-medsight-secondary'
    },
    {
      label: 'Avg. Monthly Studies',
      value: '847K',
      change: '+67K',
      trend: 'up',
      color: 'text-medsight-ai-high'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-medsight-secondary';
      case 'warning': return 'text-medsight-pending';
      case 'inactive': return 'text-medsight-abnormal';
      default: return 'text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-medsight-secondary" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-medsight-pending" />;
      case 'inactive': return <Clock className="w-4 h-4 text-medsight-abnormal" />;
      default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Enterprise': return 'text-medsight-ai-high bg-medsight-ai-high/10';
      case 'Professional': return 'text-medsight-primary bg-medsight-primary/10';
      case 'Standard': return 'text-medsight-pending bg-medsight-pending/10';
      default: return 'text-slate-500 bg-slate-100';
    }
  };

  const getTrendIcon = (growth: number) => {
    return growth > 0 ? 
      <TrendingUp className="w-4 h-4 text-medsight-secondary" /> : 
      <TrendingDown className="w-4 h-4 text-medsight-abnormal" />;
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <Building className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">Organizations</h3>
            <p className="text-sm text-slate-600">Multi-tenant organization management</p>
          </div>
        </div>
        <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Manage</span>
        </button>
      </div>

      {/* Organization Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {organizationStats.map((stat, index) => (
          <div key={index} className="medsight-control-glass rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">{stat.label}</span>
              <span className={`text-xs ${stat.trend === 'up' ? 'text-medsight-secondary' : 'text-medsight-abnormal'}`}>
                {stat.change}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              {stat.trend === 'up' ? 
                <TrendingUp className="w-4 h-4 text-medsight-secondary" /> : 
                <TrendingDown className="w-4 h-4 text-medsight-abnormal" />
              }
            </div>
          </div>
        ))}
      </div>

      {/* Top Organizations */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Top Organizations</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {topOrganizations.map((org, index) => (
            <div key={index} className="medsight-control-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                    <Building className="w-4 h-4 text-medsight-primary" />
                  </div>
                  <div>
                    <h5 className="font-medium text-slate-800">{org.name}</h5>
                    <div className="flex items-center space-x-2 text-xs text-slate-600">
                      <MapPin className="w-3 h-3" />
                      <span>{org.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(org.status)}
                  <span className={`text-xs px-2 py-1 rounded-full ${getTierColor(org.tier)}`}>
                    {org.tier}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-800">{org.users.toLocaleString()}</p>
                  <p className="text-xs text-slate-600">Users</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-800">{org.studies.toLocaleString()}</p>
                  <p className="text-xs text-slate-600">Studies</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-medsight-ai-high">{org.revenue}</p>
                  <p className="text-xs text-slate-600">Revenue</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(org.growth)}
                  <span className={`text-xs ${org.growth > 0 ? 'text-medsight-secondary' : 'text-medsight-abnormal'}`}>
                    {org.growth > 0 ? '+' : ''}{org.growth}% growth
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-medsight-pending" />
                  <span className="text-xs text-slate-600">Premium</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Organization Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">Organization Actions</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <Users className="w-3 h-3 mr-1" />
              View All
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Calendar className="w-3 h-3 mr-1" />
              Schedule Review
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Settings className="w-3 h-3 mr-1" />
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 