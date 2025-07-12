import React from 'react';
import { 
  Shield, ShieldCheck, ShieldAlert, Lock, 
  AlertTriangle, CheckCircle, Eye, Activity,
  Key, Fingerprint, Globe, Zap
} from 'lucide-react';

interface SecurityStatusProps {
  className?: string;
}

export default function SecurityStatus({ className = '' }: SecurityStatusProps) {
  const securityMetrics = [
    {
      label: 'Security Score',
      value: '98.5',
      status: 'excellent',
      icon: Shield,
      color: 'text-medsight-ai-high'
    },
    {
      label: 'Threats Blocked',
      value: '247',
      status: 'active',
      icon: ShieldCheck,
      color: 'text-medsight-secondary'
    },
    {
      label: 'Active Sessions',
      value: '892',
      status: 'normal',
      icon: Activity,
      color: 'text-medsight-primary'
    },
    {
      label: 'Compliance',
      value: '100%',
      status: 'compliant',
      icon: CheckCircle,
      color: 'text-medsight-secondary'
    }
  ];

  const securityEvents = [
    {
      type: 'warning',
      title: 'Multiple Failed Login Attempts',
      description: 'User: dr.smith@hospital.com',
      time: '2 min ago',
      severity: 'medium'
    },
    {
      type: 'success',
      title: 'Security Scan Completed',
      description: 'All systems secure',
      time: '15 min ago',
      severity: 'info'
    },
    {
      type: 'info',
      title: 'New Device Login',
      description: 'Dr. Johnson from IP: 192.168.1.45',
      time: '1 hour ago',
      severity: 'low'
    },
    {
      type: 'warning',
      title: 'Unusual Access Pattern',
      description: 'After hours access detected',
      time: '3 hours ago',
      severity: 'medium'
    }
  ];

  const complianceStatus = [
    {
      name: 'HIPAA',
      status: 'compliant',
      lastCheck: '2 hours ago',
      score: '100%'
    },
    {
      name: 'DICOM',
      status: 'compliant',
      lastCheck: '1 day ago',
      score: '98%'
    },
    {
      name: 'FDA Class II',
      status: 'compliant',
      lastCheck: '1 week ago',
      score: '96%'
    },
    {
      name: 'ISO 27001',
      status: 'compliant',
      lastCheck: '1 day ago',
      score: '100%'
    }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-medsight-pending" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-medsight-secondary" />;
      case 'info': return <Eye className="w-4 h-4 text-medsight-primary" />;
      default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-l-medsight-abnormal';
      case 'medium': return 'border-l-medsight-pending';
      case 'low': return 'border-l-medsight-secondary';
      default: return 'border-l-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-medsight-secondary';
      case 'warning': return 'text-medsight-pending';
      case 'critical': return 'text-medsight-abnormal';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <Shield className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">Security Status</h3>
            <p className="text-sm text-slate-600">Security monitoring and compliance</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-medsight-secondary rounded-full animate-pulse"></div>
          <span className="text-sm text-medsight-secondary font-medium">Monitoring</span>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {securityMetrics.map((metric, index) => (
          <div key={index} className="medsight-control-glass rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(metric.status)} bg-current bg-opacity-10`}>
                {metric.status}
              </span>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{metric.value}</p>
              <p className="text-xs text-slate-600">{metric.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Security Events */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Security Events</h4>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {securityEvents.map((event, index) => (
            <div key={index} className={`medsight-control-glass rounded-lg p-3 border-l-4 ${getSeverityColor(event.severity)}`}>
              <div className="flex items-start space-x-3">
                {getEventIcon(event.type)}
                <div className="flex-1">
                  <h5 className="font-medium text-slate-800 text-sm">{event.title}</h5>
                  <p className="text-xs text-slate-600 mt-1">{event.description}</p>
                  <p className="text-xs text-slate-500 mt-2">{event.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Status */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Compliance Status</h4>
        <div className="grid grid-cols-2 gap-3">
          {complianceStatus.map((compliance, index) => (
            <div key={index} className="medsight-control-glass rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-800">{compliance.name}</span>
                <span className={`text-xs ${getStatusColor(compliance.status)}`}>
                  {compliance.score}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(compliance.status)} bg-current bg-opacity-10`}>
                  {compliance.status}
                </span>
                <span className="text-xs text-slate-500">{compliance.lastCheck}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">Security Actions</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <Eye className="w-3 h-3 mr-1" />
              View Logs
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              Scan
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Key className="w-3 h-3 mr-1" />
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 