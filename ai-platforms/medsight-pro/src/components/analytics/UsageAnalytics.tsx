import React from 'react';
import { 
  Users, Clock, Activity, Eye, 
  TrendingUp, TrendingDown, Calendar, MapPin,
  Smartphone, Monitor, Globe, Star
} from 'lucide-react';

interface UsageAnalyticsProps {
  className?: string;
}

export default function UsageAnalytics({ className = '' }: UsageAnalyticsProps) {
  const usageMetrics = [
    {
      metric: 'Daily Active Users',
      value: '18,247',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-medsight-primary'
    },
    {
      metric: 'Avg Session Duration',
      value: '24min',
      change: '+8%',
      trend: 'up',
      icon: Clock,
      color: 'text-medsight-secondary'
    },
    {
      metric: 'Page Views',
      value: '847K',
      change: '+15%',
      trend: 'up',
      icon: Eye,
      color: 'text-medsight-ai-high'
    },
    {
      metric: 'Feature Engagement',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: Activity,
      color: 'text-medsight-pending'
    }
  ];

  const topFeatures = [
    {
      feature: 'Medical Imaging Viewer',
      usage: 89,
      users: '16,234',
      avgTime: '18min',
      satisfaction: 4.8,
      color: 'bg-medsight-primary'
    },
    {
      feature: 'AI Analysis Tools',
      usage: 76,
      users: '13,847',
      avgTime: '12min',
      satisfaction: 4.7,
      color: 'bg-medsight-ai-high'
    },
    {
      feature: 'Collaboration Hub',
      usage: 64,
      users: '11,678',
      avgTime: '15min',
      satisfaction: 4.6,
      color: 'bg-medsight-secondary'
    },
    {
      feature: 'Reporting Dashboard',
      usage: 52,
      users: '9,456',
      avgTime: '8min',
      satisfaction: 4.5,
      color: 'bg-medsight-pending'
    },
    {
      feature: 'User Management',
      usage: 31,
      users: '5,678',
      avgTime: '6min',
      satisfaction: 4.3,
      color: 'bg-slate-400'
    }
  ];

  const deviceBreakdown = [
    { device: 'Desktop', percentage: 68, users: '12,408', color: 'bg-medsight-primary' },
    { device: 'Tablet', percentage: 22, users: '4,014', color: 'bg-medsight-secondary' },
    { device: 'Mobile', percentage: 10, users: '1,825', color: 'bg-medsight-pending' }
  ];

  const geographicData = [
    { region: 'North America', users: '8,247', percentage: 45, growth: '+12%' },
    { region: 'Europe', users: '5,478', percentage: 30, growth: '+18%' },
    { region: 'Asia Pacific', users: '3,456', percentage: 19, growth: '+25%' },
    { region: 'Others', users: '1,066', percentage: 6, growth: '+8%' }
  ];

  const getUserTypeColor = (usage: number) => {
    if (usage >= 80) return 'text-medsight-ai-high';
    if (usage >= 60) return 'text-medsight-secondary';
    if (usage >= 40) return 'text-medsight-pending';
    return 'text-slate-500';
  };

  const getSatisfactionStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-medsight-pending fill-current' : 'text-slate-300'}`} 
        />
      );
    }
    return stars;
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <Users className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">Usage Analytics</h3>
            <p className="text-sm text-slate-600">User engagement and platform adoption</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-500">Last 30 days</span>
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
            <div className="flex items-center space-x-2 mb-1">
              <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
              <TrendingUp className="w-4 h-4 text-medsight-secondary" />
            </div>
            <p className="text-xs text-slate-600">{metric.metric}</p>
          </div>
        ))}
      </div>

      {/* Top Features */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Most Used Features</h4>
        <div className="medsight-control-glass rounded-lg p-4">
          <div className="space-y-4">
            {topFeatures.map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${feature.color}`}></div>
                  <span className="text-sm font-medium text-slate-800">{feature.feature}</span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <span className="text-xs text-slate-600 block">Usage</span>
                    <span className={`text-sm font-medium ${getUserTypeColor(feature.usage)}`}>
                      {feature.usage}%
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-slate-600 block">Users</span>
                    <span className="text-sm font-medium text-slate-800">{feature.users}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-slate-600 block">Avg Time</span>
                    <span className="text-sm font-medium text-medsight-secondary">{feature.avgTime}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-slate-600 block">Rating</span>
                    <div className="flex items-center space-x-1">
                      {getSatisfactionStars(feature.satisfaction)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device & Geographic Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">Device Usage</h4>
          <div className="medsight-control-glass rounded-lg p-4">
            <div className="space-y-3">
              {deviceBreakdown.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${device.color}`}></div>
                    <span className="text-sm font-medium text-slate-800">{device.device}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-2 bg-slate-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${device.color}`}
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right min-w-16">
                      <span className="text-sm font-medium text-slate-800">{device.percentage}%</span>
                      <span className="text-xs text-slate-500 block">{device.users}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">Geographic Distribution</h4>
          <div className="medsight-control-glass rounded-lg p-4">
            <div className="space-y-3">
              {geographicData.map((region, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-3 h-3 text-medsight-primary" />
                    <span className="text-sm font-medium text-slate-800">{region.region}</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-800">{region.users}</span>
                      <span className="text-xs text-slate-500">({region.percentage}%)</span>
                    </div>
                    <span className="text-xs text-medsight-secondary">{region.growth}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">Usage Insights</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <Monitor className="w-3 h-3 mr-1" />
              Detailed View
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Globe className="w-3 h-3 mr-1" />
              Geographic Map
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Calendar className="w-3 h-3 mr-1" />
              Historical Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 