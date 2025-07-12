import React from 'react';
import { 
  Zap, Server, Database, Gauge, 
  TrendingUp, TrendingDown, Clock, Activity,
  Cpu, HardDrive, Network, Monitor
} from 'lucide-react';

interface PerformanceAnalyticsProps {
  className?: string;
}

export default function PerformanceAnalytics({ className = '' }: PerformanceAnalyticsProps) {
  const performanceMetrics = [
    {
      metric: 'Response Time',
      value: '24.7ms',
      change: '-15%',
      trend: 'down',
      target: '< 50ms',
      icon: Clock,
      color: 'text-medsight-secondary'
    },
    {
      metric: 'Throughput',
      value: '12.4K/s',
      change: '+22%',
      trend: 'up',
      target: '> 10K/s',
      icon: Zap,
      color: 'text-medsight-ai-high'
    },
    {
      metric: 'System Uptime',
      value: '99.97%',
      change: '+0.1%',
      trend: 'up',
      target: '> 99.9%',
      icon: Server,
      color: 'text-medsight-secondary'
    },
    {
      metric: 'Error Rate',
      value: '0.02%',
      change: '-0.01%',
      trend: 'down',
      target: '< 0.1%',
      icon: Activity,
      color: 'text-medsight-secondary'
    }
  ];

  const systemResources = [
    {
      resource: 'CPU Usage',
      current: 24,
      average: 28,
      peak: 67,
      trend: 'down',
      status: 'optimal',
      color: 'bg-medsight-secondary'
    },
    {
      resource: 'Memory Usage',
      current: 67,
      average: 72,
      peak: 89,
      trend: 'stable',
      status: 'good',
      color: 'bg-medsight-pending'
    },
    {
      resource: 'Storage Usage',
      current: 45,
      average: 48,
      peak: 52,
      trend: 'up',
      status: 'optimal',
      color: 'bg-medsight-secondary'
    },
    {
      resource: 'Network I/O',
      current: 78,
      average: 65,
      peak: 94,
      trend: 'up',
      status: 'warning',
      color: 'bg-medsight-abnormal'
    }
  ];

  const servicePerformance = [
    {
      service: 'DICOM Server',
      latency: '12ms',
      throughput: '847/s',
      uptime: '99.8%',
      status: 'excellent'
    },
    {
      service: 'AI Engine',
      latency: '45ms',
      throughput: '234/s',
      uptime: '98.5%',
      status: 'good'
    },
    {
      service: 'Database',
      latency: '8ms',
      throughput: '12.4K/s',
      uptime: '99.9%',
      status: 'excellent'
    },
    {
      service: 'API Gateway',
      latency: '15ms',
      throughput: '3.2K/s',
      uptime: '99.7%',
      status: 'excellent'
    }
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-medsight-abnormal" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-medsight-secondary" />;
    return <div className="w-4 h-4 bg-slate-300 rounded-full"></div>;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-medsight-ai-high bg-medsight-ai-high/10';
      case 'good': return 'text-medsight-secondary bg-medsight-secondary/10';
      case 'warning': return 'text-medsight-pending bg-medsight-pending/10';
      case 'optimal': return 'text-medsight-secondary bg-medsight-secondary/10';
      case 'critical': return 'text-medsight-abnormal bg-medsight-abnormal/10';
      default: return 'text-slate-500 bg-slate-100';
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'CPU Usage': return <Cpu className="w-4 h-4" />;
      case 'Memory Usage': return <Database className="w-4 h-4" />;
      case 'Storage Usage': return <HardDrive className="w-4 h-4" />;
      case 'Network I/O': return <Network className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <Gauge className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">Performance Analytics</h3>
            <p className="text-sm text-slate-600">System performance metrics and optimization</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-medsight-secondary rounded-full animate-pulse"></div>
          <span className="text-sm text-medsight-secondary font-medium">Real-time</span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {performanceMetrics.map((metric, index) => (
          <div key={index} className="medsight-control-glass rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <span className={`text-xs ${metric.trend === 'down' && metric.metric === 'Response Time' ? 'text-medsight-secondary' : metric.trend === 'up' ? 'text-medsight-secondary' : 'text-medsight-secondary'}`}>
                {metric.change}
              </span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
              {metric.trend === 'down' && metric.metric === 'Response Time' ? 
                <TrendingDown className="w-4 h-4 text-medsight-secondary" /> :
                metric.trend === 'up' ? 
                <TrendingUp className="w-4 h-4 text-medsight-secondary" /> :
                <TrendingDown className="w-4 h-4 text-medsight-secondary" />
              }
            </div>
            <p className="text-xs text-slate-600 mb-1">{metric.metric}</p>
            <p className="text-xs text-slate-500">Target: {metric.target}</p>
          </div>
        ))}
      </div>

      {/* System Resources */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">System Resource Utilization</h4>
        <div className="medsight-control-glass rounded-lg p-4">
          <div className="space-y-4">
            {systemResources.map((resource, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(resource.status)}`}>
                    {getResourceIcon(resource.resource)}
                  </div>
                  <span className="text-sm font-medium text-slate-800">{resource.resource}</span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <span className="text-xs text-slate-600 block">Current</span>
                    <span className="text-sm font-medium text-slate-800">{resource.current}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-slate-600 block">Average</span>
                    <span className="text-sm font-medium text-slate-800">{resource.average}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-slate-600 block">Peak</span>
                    <span className="text-sm font-medium text-slate-800">{resource.peak}%</span>
                  </div>
                  <div className="w-24 h-2 bg-slate-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${resource.color}`}
                      style={{ width: `${resource.current}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(resource.trend)}
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(resource.status)}`}>
                      {resource.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Performance */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Service Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servicePerformance.map((service, index) => (
            <div key={index} className="medsight-control-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-slate-800">{service.service}</h5>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <span className="text-xs text-slate-600 block">Latency</span>
                  <span className="text-sm font-medium text-medsight-secondary">{service.latency}</span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-slate-600 block">Throughput</span>
                  <span className="text-sm font-medium text-medsight-primary">{service.throughput}</span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-slate-600 block">Uptime</span>
                  <span className="text-sm font-medium text-medsight-ai-high">{service.uptime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">Performance Tools</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <Gauge className="w-3 h-3 mr-1" />
              Optimize
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Monitor className="w-3 h-3 mr-1" />
              Monitor
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Activity className="w-3 h-3 mr-1" />
              Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 