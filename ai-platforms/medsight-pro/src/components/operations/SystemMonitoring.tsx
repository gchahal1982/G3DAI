"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  CpuIcon, 
  Database, 
  HardDrive, 
  Monitor, 
  Network, 
  Shield, 
  Thermometer, 
  TrendingUp,
  Users,
  Zap,
  Heart,
  AlertCircle,
  RefreshCw,
  Settings,
  Download,
  BarChart3,
  Server,
  Wifi,
  Lock,
  Eye,
  BookOpen,
  Globe,
  Smartphone,
  Tablet,
  UserCheck,
  FileText,
  Search,
  Filter,
  Calendar,
  Bell,
  Info,
  X,
  Plus,
  Minus,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  Copy,
  Share
} from 'lucide-react';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: {
    warning: number;
    critical: number;
  };
  lastUpdated: Date;
  history: { timestamp: Date; value: number }[];
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  category: 'system' | 'security' | 'performance' | 'compliance' | 'medical';
  source: string;
  action?: string;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  uptime: number;
  responseTime: number;
  lastCheck: Date;
  version: string;
  dependencies: string[];
  endpoint: string;
}

interface ComplianceStatus {
  id: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'pending' | 'warning';
  lastAudit: Date;
  nextAudit: Date;
  score: number;
  details: string;
  regulation: 'HIPAA' | 'FDA' | 'DICOM' | 'HL7' | 'GDPR';
}

const SystemMonitoring = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'alerts' | 'services' | 'compliance'>('overview');
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const [complianceStatuses, setComplianceStatuses] = useState<ComplianceStatus[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [alertFilter, setAlertFilter] = useState('all');

  // Initialize system monitoring data
  useEffect(() => {
    const initializeMonitoring = () => {
      // Initialize system metrics
      const metrics: SystemMetric[] = [
        {
          id: 'cpu-usage',
          name: 'CPU Usage',
          value: 45.2,
          unit: '%',
          status: 'healthy',
          trend: 'stable',
          threshold: { warning: 70, critical: 85 },
          lastUpdated: new Date(),
          history: generateMetricHistory(45.2, 24)
        },
        {
          id: 'memory-usage',
          name: 'Memory Usage',
          value: 68.5,
          unit: '%',
          status: 'warning',
          trend: 'up',
          threshold: { warning: 75, critical: 90 },
          lastUpdated: new Date(),
          history: generateMetricHistory(68.5, 24)
        },
        {
          id: 'disk-usage',
          name: 'Disk Usage',
          value: 42.8,
          unit: '%',
          status: 'healthy',
          trend: 'stable',
          threshold: { warning: 80, critical: 95 },
          lastUpdated: new Date(),
          history: generateMetricHistory(42.8, 24)
        },
        {
          id: 'network-throughput',
          name: 'Network Throughput',
          value: 125.3,
          unit: 'Mbps',
          status: 'healthy',
          trend: 'up',
          threshold: { warning: 500, critical: 800 },
          lastUpdated: new Date(),
          history: generateMetricHistory(125.3, 24)
        },
        {
          id: 'response-time',
          name: 'Response Time',
          value: 245,
          unit: 'ms',
          status: 'healthy',
          trend: 'down',
          threshold: { warning: 1000, critical: 2000 },
          lastUpdated: new Date(),
          history: generateMetricHistory(245, 24)
        },
        {
          id: 'active-sessions',
          name: 'Active Sessions',
          value: 128,
          unit: '',
          status: 'healthy',
          trend: 'stable',
          threshold: { warning: 500, critical: 1000 },
          lastUpdated: new Date(),
          history: generateMetricHistory(128, 24)
        }
      ];

      // Initialize system alerts
      const alerts: SystemAlert[] = [
        {
          id: 'alert-1',
          type: 'warning',
          title: 'High Memory Usage',
          message: 'Memory usage has exceeded 65% threshold',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          severity: 'medium',
          acknowledged: false,
          category: 'performance',
          source: 'System Monitor',
          action: 'Investigate memory-intensive processes'
        },
        {
          id: 'alert-2',
          type: 'info',
          title: 'Scheduled Maintenance',
          message: 'System maintenance window scheduled for tonight',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          severity: 'low',
          acknowledged: true,
          category: 'system',
          source: 'Maintenance Scheduler'
        },
        {
          id: 'alert-3',
          type: 'success',
          title: 'Backup Completed',
          message: 'Daily backup completed successfully',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          severity: 'low',
          acknowledged: true,
          category: 'system',
          source: 'Backup Service'
        }
      ];

      // Initialize service statuses
      const services: ServiceStatus[] = [
        {
          id: 'dicom-service',
          name: 'DICOM Processing Service',
          status: 'online',
          uptime: 99.8,
          responseTime: 125,
          lastCheck: new Date(),
          version: '2.1.0',
          dependencies: ['database', 'storage'],
          endpoint: '/api/dicom'
        },
        {
          id: 'ai-inference',
          name: 'AI Inference Engine',
          status: 'online',
          uptime: 99.5,
          responseTime: 340,
          lastCheck: new Date(),
          version: '1.5.2',
          dependencies: ['gpu-compute', 'ml-models'],
          endpoint: '/api/ai'
        },
        {
          id: 'auth-service',
          name: 'Authentication Service',
          status: 'online',
          uptime: 99.9,
          responseTime: 85,
          lastCheck: new Date(),
          version: '3.2.1',
          dependencies: ['database', 'ldap'],
          endpoint: '/api/auth'
        },
        {
          id: 'storage-service',
          name: 'Medical Storage Service',
          status: 'degraded',
          uptime: 97.2,
          responseTime: 520,
          lastCheck: new Date(),
          version: '1.8.0',
          dependencies: ['file-system', 'encryption'],
          endpoint: '/api/storage'
        }
      ];

      // Initialize compliance statuses
      const compliance: ComplianceStatus[] = [
        {
          id: 'hipaa-compliance',
          requirement: 'HIPAA Technical Safeguards',
          status: 'compliant',
          lastAudit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
          nextAudit: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
          score: 98.5,
          details: 'All technical safeguards implemented and validated',
          regulation: 'HIPAA'
        },
        {
          id: 'fda-compliance',
          requirement: 'FDA Class II Medical Device',
          status: 'compliant',
          lastAudit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
          nextAudit: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
          score: 95.2,
          details: 'Software compliance validated for medical device classification',
          regulation: 'FDA'
        },
        {
          id: 'dicom-compliance',
          requirement: 'DICOM Conformance Statement',
          status: 'compliant',
          lastAudit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
          nextAudit: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
          score: 99.1,
          details: 'Full DICOM standard compliance verified',
          regulation: 'DICOM'
        },
        {
          id: 'hl7-compliance',
          requirement: 'HL7 FHIR R4 Integration',
          status: 'warning',
          lastAudit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
          nextAudit: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          score: 87.3,
          details: 'Minor integration issues identified, remediation in progress',
          regulation: 'HL7'
        }
      ];

      setSystemMetrics(metrics);
      setSystemAlerts(alerts);
      setServiceStatuses(services);
      setComplianceStatuses(compliance);
    };

    initializeMonitoring();
  }, []);

  // Generate metric history for charts
  const generateMetricHistory = (currentValue: number, hours: number) => {
    const history = [];
    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * 20;
      const value = Math.max(0, currentValue + variation);
      history.push({ timestamp, value });
    }
    return history;
  };

  // Real-time monitoring simulation
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setSystemMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * 5),
        lastUpdated: new Date()
      })));
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'compliant':
        return 'text-green-400';
      case 'warning':
      case 'degraded':
        return 'text-yellow-400';
      case 'critical':
      case 'offline':
      case 'non-compliant':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'compliant':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
      case 'offline':
      case 'non-compliant':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setSystemAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const filteredAlerts = systemAlerts.filter(alert => {
    if (alertFilter === 'all') return true;
    if (alertFilter === 'unacknowledged') return !alert.acknowledged;
    return alert.type === alertFilter;
  });

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                System Monitoring
              </h1>
              <p className="text-slate-300">
                Real-time monitoring of medical platform infrastructure
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-white">
                  {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
                </span>
              </div>
              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isMonitoring ? 'Pause' : 'Resume'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Monitor },
              { id: 'metrics', label: 'Metrics', icon: BarChart3 },
              { id: 'alerts', label: 'Alerts', icon: Bell },
              { id: 'services', label: 'Services', icon: Server },
              { id: 'compliance', label: 'Compliance', icon: Shield }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">System Health</p>
                    <p className="text-2xl font-bold text-green-400">98.5%</p>
                  </div>
                  <div className="bg-green-400/20 p-3 rounded-full">
                    <Heart className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+2.1% from last week</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Active Services</p>
                    <p className="text-2xl font-bold text-blue-400">24/26</p>
                  </div>
                  <div className="bg-blue-400/20 p-3 rounded-full">
                    <Server className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-blue-400 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>All critical services online</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Active Alerts</p>
                    <p className="text-2xl font-bold text-yellow-400">3</p>
                  </div>
                  <div className="bg-yellow-400/20 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-yellow-400 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span>1 unacknowledged</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Compliance Score</p>
                    <p className="text-2xl font-bold text-green-400">95.0%</p>
                  </div>
                  <div className="bg-green-400/20 p-3 rounded-full">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-green-400 text-sm">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>All audits passed</span>
                </div>
              </motion.div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4">System Performance</h3>
                <div className="space-y-4">
                  {systemMetrics.slice(0, 3).map(metric => (
                    <div key={metric.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(metric.status).replace('text-', 'bg-')}`}></div>
                        <span className="text-slate-300">{metric.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-semibold">{metric.value.toFixed(1)}{metric.unit}</span>
                        <div className={`text-xs ${getStatusColor(metric.status)}`}>
                          {metric.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Alerts</h3>
                <div className="space-y-3">
                  {systemAlerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className="flex items-start space-x-3">
                      <div className={`mt-1 ${getStatusColor(alert.type)}`}>
                        {getStatusIcon(alert.type)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{alert.title}</p>
                        <p className="text-slate-400 text-sm">{alert.message}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {alert.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">System Metrics</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemMetrics.map(metric => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{metric.name}</h3>
                      <p className="text-2xl font-bold text-blue-400">
                        {metric.value.toFixed(1)}{metric.unit}
                      </p>
                    </div>
                    <div className={`${getStatusColor(metric.status)}`}>
                      {getStatusIcon(metric.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className={`${getStatusColor(metric.status)} font-medium`}>
                      {metric.status.toUpperCase()}
                    </span>
                    <span className="text-slate-400">
                      Updated: {metric.lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="mt-4 bg-slate-900/50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                      <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          metric.status === 'critical' ? 'bg-red-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (metric.value / metric.threshold.critical) * 100)}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">System Alerts</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg"
                >
                  <option value="all">All Alerts</option>
                  <option value="unacknowledged">Unacknowledged</option>
                  <option value="error">Errors</option>
                  <option value="warning">Warnings</option>
                  <option value="info">Info</option>
                </select>
                <div className="text-slate-400">
                  {filteredAlerts.length} alerts
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredAlerts.map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border-l-4 ${
                    alert.type === 'error' ? 'border-red-500' :
                    alert.type === 'warning' ? 'border-yellow-500' :
                    alert.type === 'info' ? 'border-blue-500' :
                    'border-green-500'
                  } ${alert.acknowledged ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`mt-1 ${
                        alert.type === 'error' ? 'text-red-400' :
                        alert.type === 'warning' ? 'text-yellow-400' :
                        alert.type === 'info' ? 'text-blue-400' :
                        'text-green-400'
                      }`}>
                        {getStatusIcon(alert.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                        <p className="text-slate-300 mt-1">{alert.message}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                          <span>{alert.timestamp.toLocaleString()}</span>
                          <span>•</span>
                          <span>{alert.source}</span>
                          <span>•</span>
                          <span className="capitalize">{alert.severity} severity</span>
                        </div>
                        {alert.action && (
                          <div className="mt-2 text-sm text-blue-400">
                            Recommended action: {alert.action}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.acknowledged && (
                        <span className="text-green-400 text-sm">✓ Acknowledged</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Service Status</h2>
              <div className="text-slate-400">
                {serviceStatuses.filter(s => s.status === 'online').length} of {serviceStatuses.length} services online
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {serviceStatuses.map(service => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                        <p className="text-slate-400 text-sm">v{service.version}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`${getStatusColor(service.status)} font-medium`}>
                        {service.status.toUpperCase()}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {service.uptime}% uptime
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Response Time</span>
                      <span className="text-white">{service.responseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Last Check</span>
                      <span className="text-white">{service.lastCheck.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Endpoint</span>
                      <span className="text-blue-400 font-mono text-sm">{service.endpoint}</span>
                    </div>
                  </div>

                  {service.dependencies.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-slate-300 text-sm mb-2">Dependencies:</p>
                      <div className="flex flex-wrap gap-2">
                        {service.dependencies.map(dep => (
                          <span key={dep} className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Compliance Status</h2>
              <div className="text-slate-400">
                {complianceStatuses.filter(c => c.status === 'compliant').length} of {complianceStatuses.length} requirements compliant
              </div>
            </div>

            <div className="space-y-4">
              {complianceStatuses.map(compliance => (
                <motion.div
                  key={compliance.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`${getStatusColor(compliance.status)}`}>
                        {getStatusIcon(compliance.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{compliance.requirement}</h3>
                        <p className="text-slate-400 text-sm">{compliance.regulation} Compliance</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`${getStatusColor(compliance.status)} font-medium`}>
                        {compliance.status.toUpperCase()}
                      </div>
                      <div className="text-slate-400 text-sm">
                        Score: {compliance.score}%
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          compliance.score >= 90 ? 'bg-green-500' :
                          compliance.score >= 70 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${compliance.score}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Last Audit</span>
                      <span className="text-white">{compliance.lastAudit.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Next Audit</span>
                      <span className="text-white">{compliance.nextAudit.toLocaleDateString()}</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-slate-300 text-sm mb-1">Details:</p>
                      <p className="text-slate-400 text-sm">{compliance.details}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Medical Compliance Footer */}
        <div className="mt-12 bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Medical Compliance Standards</h3>
                <p className="text-slate-400">
                  HIPAA • FDA Class II • DICOM • HL7 FHIR • Medical Device Regulations
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-semibold">System Compliant</p>
              <p className="text-slate-400 text-sm">Last verified: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring; 