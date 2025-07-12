import React from 'react';
import { 
  Server, Database, Cpu, HardDrive, Network, 
  Activity, AlertTriangle, CheckCircle, Clock, 
  Zap, Monitor, Shield
} from 'lucide-react';

interface SystemHealthProps {
  className?: string;
}

export default function SystemHealth({ className = '' }: SystemHealthProps) {
  const systemServices = [
    { 
      name: 'DICOM Server',
      status: 'online',
      uptime: '99.8%',
      responseTime: '12ms',
      lastCheck: '2 min ago'
    },
    {
      name: 'AI Engine',
      status: 'online',
      uptime: '98.5%',
      responseTime: '45ms',
      lastCheck: '1 min ago'
    },
    {
      name: 'Database',
      status: 'online',
      uptime: '99.9%',
      responseTime: '8ms',
      lastCheck: '30 sec ago'
    },
    {
      name: 'File Storage',
      status: 'warning',
      uptime: '97.2%',
      responseTime: '120ms',
      lastCheck: '5 min ago'
    },
    {
      name: 'API Gateway',
      status: 'online',
      uptime: '99.7%',
      responseTime: '15ms',
      lastCheck: '1 min ago'
    },
    {
      name: 'Security Service',
      status: 'online',
      uptime: '100%',
      responseTime: '5ms',
      lastCheck: '30 sec ago'
    }
  ];

  const systemMetrics = [
    {
      label: 'CPU Usage',
      value: '24%',
      trend: 'down',
      icon: Cpu,
      color: 'text-medsight-secondary'
    },
    {
      label: 'Memory Usage',
      value: '67%',
      trend: 'up',
      icon: Database,
      color: 'text-medsight-pending'
    },
    {
      label: 'Storage',
      value: '45%',
      trend: 'stable',
      icon: HardDrive,
      color: 'text-medsight-secondary'
    },
    {
      label: 'Network',
      value: '89%',
      trend: 'up',
      icon: Network,
      color: 'text-medsight-abnormal'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-medsight-secondary';
      case 'warning': return 'text-medsight-pending';
      case 'error': return 'text-medsight-abnormal';
      default: return 'text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4 text-medsight-secondary" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-medsight-pending" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-medsight-abnormal" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <Server className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">System Health</h3>
            <p className="text-sm text-slate-600">Real-time system monitoring</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-medsight-secondary rounded-full animate-pulse"></div>
          <span className="text-sm text-medsight-secondary font-medium">Live</span>
        </div>
      </div>

      {/* System Services */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">System Services</h4>
        <div className="space-y-3">
          {systemServices.map((service, index) => (
            <div key={index} className="medsight-control-glass rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h5 className="font-medium text-slate-800">{service.name}</h5>
                    <p className="text-sm text-slate-600">
                      Uptime: {service.uptime} | Response: {service.responseTime}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                    {service.status.toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-500">{service.lastCheck}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Metrics */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">System Metrics</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {systemMetrics.map((metric, index) => (
            <div key={index} className="medsight-control-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                <span className="text-xs text-slate-500">
                  {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                </span>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{metric.value}</p>
                <p className="text-xs text-slate-600">{metric.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">System Actions</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <Monitor className="w-3 h-3 mr-1" />
              Details
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              Restart
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Shield className="w-3 h-3 mr-1" />
              Diagnose
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 