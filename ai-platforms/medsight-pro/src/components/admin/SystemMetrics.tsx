import React from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Clock, 
  Zap, Activity, Gauge, PieChart, LineChart,
  Users, Server, Database, HardDrive
} from 'lucide-react';

interface SystemMetricsProps {
  className?: string;
}

export default function SystemMetrics({ className = '' }: SystemMetricsProps) {
  const performanceMetrics = [
    {
      label: 'DICOM Processing',
      value: '847',
      unit: 'studies/hour',
      trend: 'up',
      percentage: 12.5,
      icon: Activity,
      color: 'text-medsight-secondary'
    },
    {
      label: 'AI Analysis',
      value: '234',
      unit: 'analyses/hour',
      trend: 'up',
      percentage: 8.2,
      icon: Zap,
      color: 'text-medsight-ai-high'
    },
    {
      label: 'Database Queries',
      value: '12.4K',
      unit: 'queries/min',
      trend: 'stable',
      percentage: 0.8,
      icon: Database,
      color: 'text-medsight-primary'
    },
    {
      label: 'Storage Usage',
      value: '2.8TB',
      unit: 'of 10TB',
      trend: 'up',
      percentage: 4.1,
      icon: HardDrive,
      color: 'text-medsight-pending'
    }
  ];

  const systemStats = [
    {
      label: 'Response Time',
      value: '45ms',
      status: 'excellent',
      target: '< 100ms'
    },
    {
      label: 'Throughput',
      value: '1.2K/s',
      status: 'good',
      target: '> 1K/s'
    },
    {
      label: 'Error Rate',
      value: '0.02%',
      status: 'excellent',
      target: '< 0.1%'
    },
    {
      label: 'Availability',
      value: '99.97%',
      status: 'excellent',
      target: '> 99.9%'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-medsight-secondary';
      case 'good': return 'text-medsight-ai-high';
      case 'warning': return 'text-medsight-pending';
      case 'critical': return 'text-medsight-abnormal';
      default: return 'text-slate-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-medsight-secondary" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-medsight-abnormal" />;
      default: return <div className="w-4 h-4 bg-slate-300 rounded-full"></div>;
    }
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <BarChart3 className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">System Metrics</h3>
            <p className="text-sm text-slate-600">Performance analytics and statistics</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-500">Updated 30s ago</span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="medsight-control-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                  <span className="text-sm text-slate-700">{metric.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-xs ${metric.trend === 'up' ? 'text-medsight-secondary' : 'text-medsight-abnormal'}`}>
                    {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}
                    {metric.percentage}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{metric.value}</p>
                <p className="text-xs text-slate-600">{metric.unit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Statistics */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">System Statistics</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {systemStats.map((stat, index) => (
            <div key={index} className="medsight-control-glass rounded-lg p-4 text-center">
              <div className="mb-2">
                <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-600">{stat.label}</p>
              </div>
              <div className="space-y-1">
                <div className={`text-xs font-medium ${getStatusColor(stat.status)}`}>
                  {stat.status.toUpperCase()}
                </div>
                <div className="text-xs text-slate-500">
                  Target: {stat.target}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Usage Chart */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Resource Usage (Last 24h)</h4>
        <div className="medsight-control-glass rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU Usage */}
            <div className="text-center">
              <div className="relative mb-3">
                <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto flex items-center justify-center">
                  <div className="w-12 h-12 bg-medsight-secondary rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">24%</span>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700">CPU Usage</p>
              <p className="text-xs text-slate-600">Avg: 24% | Peak: 67%</p>
            </div>

            {/* Memory Usage */}
            <div className="text-center">
              <div className="relative mb-3">
                <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto flex items-center justify-center">
                  <div className="w-12 h-12 bg-medsight-pending rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">67%</span>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700">Memory</p>
              <p className="text-xs text-slate-600">Avg: 67% | Peak: 89%</p>
            </div>

            {/* Disk Usage */}
            <div className="text-center">
              <div className="relative mb-3">
                <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto flex items-center justify-center">
                  <div className="w-12 h-12 bg-medsight-secondary rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">45%</span>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700">Storage</p>
              <p className="text-xs text-slate-600">Avg: 45% | Peak: 52%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">Performance Tools</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <PieChart className="w-3 h-3 mr-1" />
              Detailed View
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <LineChart className="w-3 h-3 mr-1" />
              Historical
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Server className="w-3 h-3 mr-1" />
              Optimize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 