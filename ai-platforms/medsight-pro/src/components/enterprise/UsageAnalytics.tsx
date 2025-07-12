import React from 'react';
import { 
  Activity, Users, Clock, BarChart3, 
  TrendingUp, Eye, Play, Pause,
  Calendar, Filter, Download, RefreshCw
} from 'lucide-react';

interface UsageAnalyticsProps {
  className?: string;
}

export default function UsageAnalytics({ className = '' }: UsageAnalyticsProps) {
  const usageMetrics = [
    {
      label: 'Daily Active Users',
      value: '18,247',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-medsight-primary'
    },
    {
      label: 'Session Duration',
      value: '24min',
      change: '+8%',
      trend: 'up',
      icon: Clock,
      color: 'text-medsight-secondary'
    },
    {
      label: 'Studies Processed',
      value: '847K',
      change: '+15%',
      trend: 'up',
      icon: Activity,
      color: 'text-medsight-ai-high'
    },
    {
      label: 'AI Analyses',
      value: '234K',
      change: '+22%',
      trend: 'up',
      icon: Eye,
      color: 'text-medsight-pending'
    }
  ];

  const featureUsage = [
    {
      feature: 'Medical Imaging',
      usage: 87,
      sessions: '12,847',
      avgTime: '18min',
      color: 'bg-medsight-primary'
    },
    {
      feature: 'AI Analysis',
      usage: 73,
      sessions: '8,934',
      avgTime: '12min',
      color: 'bg-medsight-ai-high'
    },
    {
      feature: 'Collaboration',
      usage: 56,
      sessions: '6,789',
      avgTime: '15min',
      color: 'bg-medsight-secondary'
    },
    {
      feature: 'Reporting',
      usage: 45,
      sessions: '4,567',
      avgTime: '8min',
      color: 'bg-medsight-pending'
    },
    {
      feature: 'Administration',
      usage: 23,
      sessions: '2,345',
      avgTime: '6min',
      color: 'bg-slate-400'
    }
  ];

  const topOrganizations = [
    {
      name: 'Metro General Hospital',
      usage: '24.7K',
      growth: '+18%',
      sessions: '2,847'
    },
    {
      name: 'Pacific Medical Center',
      usage: '18.9K',
      growth: '+12%',
      sessions: '1,934'
    },
    {
      name: 'Heart Institute',
      usage: '15.2K',
      growth: '+8%',
      sessions: '1,523'
    }
  ];

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'text-medsight-ai-high';
    if (usage >= 60) return 'text-medsight-secondary';
    if (usage >= 40) return 'text-medsight-pending';
    return 'text-slate-500';
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <BarChart3 className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">Usage Analytics</h3>
            <p className="text-sm text-slate-600">Platform usage and engagement metrics</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-medsight text-xs px-3 py-1">
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Usage Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {usageMetrics.map((metric, index) => (
          <div key={index} className="medsight-control-glass rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <span className={`text-xs ${metric.trend === 'up' ? 'text-medsight-secondary' : 'text-medsight-abnormal'}`}>
                {metric.change}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
              <TrendingUp className="w-4 h-4 text-medsight-secondary" />
            </div>
            <p className="text-xs text-slate-600 mt-1">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Feature Usage */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Feature Usage</h4>
        <div className="medsight-control-glass rounded-lg p-4">
          <div className="space-y-4">
            {featureUsage.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-slate-800">{item.feature}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-2 bg-slate-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.usage}%` }}
                    ></div>
                  </div>
                  <div className="text-right min-w-20">
                    <span className={`text-sm font-medium ${getUsageColor(item.usage)}`}>
                      {item.usage}%
                    </span>
                  </div>
                  <div className="text-right min-w-16">
                    <span className="text-xs text-slate-600">{item.sessions}</span>
                    <span className="text-xs text-slate-500 block">{item.avgTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Organizations by Usage */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Top Organizations by Usage</h4>
        <div className="space-y-3">
          {topOrganizations.map((org, index) => (
            <div key={index} className="medsight-control-glass rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-medsight-primary">{index + 1}</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-slate-800 text-sm">{org.name}</h5>
                    <p className="text-xs text-slate-600">{org.sessions} sessions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-medsight-primary">{org.usage}</p>
                  <p className="text-xs text-medsight-secondary">{org.growth}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">Usage Actions</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <Filter className="w-3 h-3 mr-1" />
              Filter
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Download className="w-3 h-3 mr-1" />
              Export
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Calendar className="w-3 h-3 mr-1" />
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 