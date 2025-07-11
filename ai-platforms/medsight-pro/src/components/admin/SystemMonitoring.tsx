'use client';

import React, { useState, useEffect } from 'react';
import { 
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon as DatabaseIcon,
  WifiIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  BoltIcon,
  FireIcon,
  CloudIcon,
  ShieldCheckIcon,
  BeakerIcon,
  DocumentTextIcon,
  EyeIcon,
  Cog6ToothIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
    frequency: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    swapUsed: number;
    swapTotal: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
    readSpeed: number;
    writeSpeed: number;
  };
  network: {
    inbound: number;
    outbound: number;
    latency: number;
    packetLoss: number;
  };
  processes: {
    total: number;
    running: number;
    sleeping: number;
    zombie: number;
  };
}

interface Service {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  health: number; // 0-100
  uptime: number; // seconds
  lastCheck: Date;
  port: number;
  host: string;
  version: string;
  metrics: {
    responseTime: number;
    requestsPerSecond: number;
    errorRate: number;
    throughput: number;
  };
  dependencies: string[];
  logs: SystemLog[];
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  service: string;
  message: string;
  details: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  actions: string[];
}

interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  service: string;
  message: string;
  metadata?: Record<string, any>;
}

export function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    loadSystemData();
    
    if (autoRefresh) {
      const interval = setInterval(loadSystemData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, autoRefresh]);

  const loadSystemData = async () => {
    try {
      // Simulate real-time data loading
      const mockMetrics: SystemMetrics = {
        timestamp: new Date(),
        cpu: {
          usage: Math.random() * 30 + 40, // 40-70%
          cores: 16,
          temperature: Math.random() * 20 + 45, // 45-65°C
          frequency: 3.2
        },
        memory: {
          used: 24.5,
          total: 64,
          percentage: (24.5 / 64) * 100,
          swapUsed: 2.1,
          swapTotal: 8
        },
        disk: {
          used: 1240,
          total: 2000,
          percentage: (1240 / 2000) * 100,
          readSpeed: Math.random() * 200 + 50,
          writeSpeed: Math.random() * 150 + 30
        },
        network: {
          inbound: Math.random() * 100 + 50,
          outbound: Math.random() * 80 + 30,
          latency: Math.random() * 10 + 5,
          packetLoss: Math.random() * 0.5
        },
        processes: {
          total: 324,
          running: 12,
          sleeping: 306,
          zombie: 6
        }
      };

      const mockServices: Service[] = [
        {
          id: 'dicom-processor',
          name: 'DICOM Processor',
          status: 'online',
          health: 98,
          uptime: 86400 * 15, // 15 days
          lastCheck: new Date(),
          port: 8080,
          host: 'localhost',
          version: '2.1.4',
          metrics: {
            responseTime: Math.random() * 100 + 50,
            requestsPerSecond: Math.random() * 50 + 20,
            errorRate: Math.random() * 0.5,
            throughput: Math.random() * 1000 + 500
          },
          dependencies: ['database', 'file-storage'],
          logs: []
        },
        {
          id: 'ai-engine',
          name: 'AI Analysis Engine',
          status: 'online',
          health: 95,
          uptime: 86400 * 12,
          lastCheck: new Date(),
          port: 8081,
          host: 'ai-server',
          version: '3.2.1',
          metrics: {
            responseTime: Math.random() * 200 + 100,
            requestsPerSecond: Math.random() * 30 + 10,
            errorRate: Math.random() * 1.0,
            throughput: Math.random() * 800 + 200
          },
          dependencies: ['gpu-cluster', 'model-storage'],
          logs: []
        },
        {
          id: 'database',
          name: 'PostgreSQL Database',
          status: 'online',
          health: 99,
          uptime: 86400 * 30,
          lastCheck: new Date(),
          port: 5432,
          host: 'db-server',
          version: '14.2',
          metrics: {
            responseTime: Math.random() * 50 + 10,
            requestsPerSecond: Math.random() * 200 + 100,
            errorRate: Math.random() * 0.1,
            throughput: Math.random() * 2000 + 1000
          },
          dependencies: [],
          logs: []
        },
        {
          id: 'api-gateway',
          name: 'API Gateway',
          status: 'degraded',
          health: 85,
          uptime: 86400 * 7,
          lastCheck: new Date(),
          port: 443,
          host: 'gateway',
          version: '1.8.3',
          metrics: {
            responseTime: Math.random() * 300 + 200,
            requestsPerSecond: Math.random() * 100 + 50,
            errorRate: Math.random() * 2.0 + 1,
            throughput: Math.random() * 1500 + 500
          },
          dependencies: ['load-balancer'],
          logs: []
        },
        {
          id: 'file-storage',
          name: 'File Storage System',
          status: 'online',
          health: 92,
          uptime: 86400 * 20,
          lastCheck: new Date(),
          port: 9000,
          host: 'storage-cluster',
          version: '2.4.0',
          metrics: {
            responseTime: Math.random() * 150 + 50,
            requestsPerSecond: Math.random() * 40 + 20,
            errorRate: Math.random() * 0.8,
            throughput: Math.random() * 2500 + 1000
          },
          dependencies: ['backup-system'],
          logs: []
        }
      ];

      const mockAlerts: SystemAlert[] = [
        {
          id: 'alert-001',
          type: 'warning',
          severity: 'medium',
          service: 'api-gateway',
          message: 'High response time detected',
          details: 'API Gateway response time has exceeded 500ms threshold for the last 10 minutes',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          acknowledged: false,
          actions: ['restart_service', 'scale_up', 'check_dependencies']
        },
        {
          id: 'alert-002',
          type: 'error',
          severity: 'high',
          service: 'ai-engine',
          message: 'GPU memory utilization critical',
          details: 'GPU memory usage at 95% capacity, may affect AI processing performance',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          acknowledged: false,
          actions: ['clear_cache', 'restart_ai_service', 'add_gpu_nodes']
        },
        {
          id: 'alert-003',
          type: 'info',
          severity: 'low',
          service: 'database',
          message: 'Scheduled maintenance completed',
          details: 'Database maintenance window completed successfully',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          acknowledged: true,
          acknowledgedBy: 'admin',
          resolvedAt: new Date(Date.now() - 1000 * 60 * 60),
          actions: ['verify_performance', 'update_documentation']
        }
      ];

      const mockLogs: SystemLog[] = [
        {
          id: 'log-001',
          timestamp: new Date(Date.now() - 1000 * 60 * 2),
          level: 'info',
          service: 'dicom-processor',
          message: 'Successfully processed CT scan study',
          metadata: { studyId: 'ST12345', processingTime: '2.3s' }
        },
        {
          id: 'log-002',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          level: 'warn',
          service: 'api-gateway',
          message: 'Rate limit threshold approaching',
          metadata: { currentRate: '95/100', client: '192.168.1.100' }
        },
        {
          id: 'log-003',
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          level: 'error',
          service: 'ai-engine',
          message: 'Failed to load AI model',
          metadata: { modelId: 'chest-xray-v2', error: 'CUDA out of memory' }
        }
      ];

      setMetrics(mockMetrics);
      setServices(mockServices);
      setAlerts(mockAlerts);
      setLogs(mockLogs);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load system data:', error);
      setLoading(false);
    }
  };

  const getServiceStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'online': return 'text-medsight-normal';
      case 'degraded': return 'text-medsight-pending';
      case 'maintenance': return 'text-medsight-secondary';
      case 'offline': return 'text-medsight-critical';
      default: return 'text-medsight-primary';
    }
  };

  const getServiceStatusBg = (status: Service['status']) => {
    switch (status) {
      case 'online': return 'bg-medsight-normal';
      case 'degraded': return 'bg-medsight-pending';
      case 'maintenance': return 'bg-medsight-secondary';
      case 'offline': return 'bg-medsight-critical';
      default: return 'bg-medsight-primary';
    }
  };

  const getAlertColor = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-medsight-critical';
      case 'high': return 'text-medsight-pending';
      case 'medium': return 'text-medsight-secondary';
      case 'low': return 'text-medsight-normal';
      default: return 'text-medsight-primary';
    }
  };

  const getLogLevelColor = (level: SystemLog['level']) => {
    switch (level) {
      case 'fatal': return 'text-medsight-critical';
      case 'error': return 'text-medsight-critical';
      case 'warn': return 'text-medsight-pending';
      case 'info': return 'text-medsight-primary';
      case 'debug': return 'text-medsight-primary/60';
      default: return 'text-medsight-primary';
    }
  };

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-medsight-critical';
    if (value >= thresholds.warning) return 'text-medsight-pending';
    return 'text-medsight-normal';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId 
        ? { ...alert, acknowledged: true, acknowledgedBy: 'current-admin' }
        : alert
    ));
  };

  const handleServiceAction = (serviceId: string, action: string) => {
    console.log(`Service action: ${action} for ${serviceId}`);
    // Implement service actions (restart, scale, etc.)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="medsight-glass p-8 rounded-xl">
          <div className="w-8 h-8 border-4 border-medsight-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-sm text-medsight-primary">Loading system metrics...</div>
        </div>
      </div>
    );
  }

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(a => a.severity === 'critical');
  const onlineServices = services.filter(s => s.status === 'online').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="medsight-control-glass p-2 rounded-lg">
              <ServerIcon className="w-6 h-6 text-medsight-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">System Monitoring</h2>
              <p className="text-sm text-medsight-primary/70">
                {onlineServices}/{services.length} services online • {unacknowledgedAlerts.length} active alerts
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-medsight-primary/20 text-medsight-primary focus:ring-medsight-primary"
              />
              <span className="text-sm text-medsight-primary">Auto-refresh</span>
            </div>
            
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="input-medsight text-sm"
            >
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
              <option value={60000}>1m</option>
            </select>
            
            <button
              onClick={loadSystemData}
              className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        {criticalAlerts.length > 0 && (
          <div className="p-4 bg-medsight-critical/10 border border-medsight-critical/20 rounded-lg mb-4">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-medsight-critical" />
              <span className="text-sm font-medium text-medsight-critical">
                {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''} Require Immediate Attention
              </span>
            </div>
          </div>
        )}
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <CpuChipIcon className="w-6 h-6 text-medsight-primary" />
            <div>
              <div className={`text-2xl font-bold ${getMetricColor(metrics?.cpu.usage || 0, { warning: 70, critical: 90 })}`}>
                {metrics?.cpu.usage.toFixed(1)}%
              </div>
              <div className="text-sm text-medsight-primary/70">CPU Usage</div>
              <div className="text-xs text-medsight-primary/50">
                {metrics?.cpu.cores} cores • {metrics?.cpu.temperature.toFixed(1)}°C
              </div>
            </div>
          </div>
        </div>
        
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <DatabaseIcon className="w-6 h-6 text-medsight-secondary" />
            <div>
              <div className={`text-2xl font-bold ${getMetricColor(metrics?.memory.percentage || 0, { warning: 80, critical: 95 })}`}>
                {metrics?.memory.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-medsight-secondary/70">Memory Usage</div>
              <div className="text-xs text-medsight-secondary/50">
                {formatBytes(metrics?.memory.used * 1024 * 1024 * 1024 || 0)} / {formatBytes(metrics?.memory.total * 1024 * 1024 * 1024 || 0)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <CloudIcon className="w-6 h-6 text-medsight-pending" />
            <div>
              <div className={`text-2xl font-bold ${getMetricColor(metrics?.disk.percentage || 0, { warning: 80, critical: 95 })}`}>
                {metrics?.disk.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-medsight-pending/70">Disk Usage</div>
              <div className="text-xs text-medsight-pending/50">
                {formatBytes(metrics?.disk.used * 1024 * 1024 * 1024 || 0)} / {formatBytes(metrics?.disk.total * 1024 * 1024 * 1024 || 0)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <WifiIcon className="w-6 h-6 text-medsight-ai-high" />
            <div>
              <div className={`text-2xl font-bold ${getMetricColor(metrics?.network.latency || 0, { warning: 100, critical: 500 })}`}>
                {metrics?.network.latency.toFixed(1)}ms
              </div>
              <div className="text-sm text-medsight-ai-high/70">Network Latency</div>
              <div className="text-xs text-medsight-ai-high/50">
                ↓{(metrics?.network.inbound || 0).toFixed(1)} ↑{(metrics?.network.outbound || 0).toFixed(1)} MB/s
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-medsight-primary">Services Status</h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="input-medsight text-sm"
            >
              <option value="all">All Services</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {services
            .filter(service => selectedService === 'all' || service.id === selectedService)
            .map(service => (
              <div key={service.id} className="medsight-control-glass p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getServiceStatusBg(service.status)} animate-pulse`}></div>
                    <h4 className="text-sm font-medium text-medsight-primary">{service.name}</h4>
                  </div>
                  <span className={`text-xs font-medium ${getServiceStatusColor(service.status)}`}>
                    {service.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-medsight-primary/70">Health</span>
                    <span className={`font-medium ${getMetricColor(100 - service.health, { warning: 20, critical: 50 })}`}>
                      {service.health}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-medsight-primary/70">Uptime</span>
                    <span className="font-medium text-medsight-primary">{formatUptime(service.uptime)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-medsight-primary/70">Response Time</span>
                    <span className={`font-medium ${getMetricColor(service.metrics.responseTime, { warning: 500, critical: 1000 })}`}>
                      {service.metrics.responseTime.toFixed(0)}ms
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-medsight-primary/70">Error Rate</span>
                    <span className={`font-medium ${getMetricColor(service.metrics.errorRate, { warning: 1, critical: 5 })}`}>
                      {service.metrics.errorRate.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-medsight-primary/70">Version</span>
                    <span className="font-medium text-medsight-primary">{service.version}</span>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center space-x-2">
                  <button
                    onClick={() => handleServiceAction(service.id, 'restart')}
                    className="flex-1 text-xs bg-medsight-primary/10 text-medsight-primary px-2 py-1 rounded hover:bg-medsight-primary/20"
                  >
                    Restart
                  </button>
                  <button
                    onClick={() => handleServiceAction(service.id, 'logs')}
                    className="flex-1 text-xs bg-medsight-secondary/10 text-medsight-secondary px-2 py-1 rounded hover:bg-medsight-secondary/20"
                  >
                    Logs
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Alerts & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-medsight-primary">Active Alerts</h3>
            <span className="text-sm text-medsight-primary/70">{unacknowledgedAlerts.length} unacknowledged</span>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {unacknowledgedAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="p-3 bg-medsight-primary/5 rounded-lg border border-medsight-primary/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-medsight-primary/60">{alert.service}</span>
                    </div>
                    <p className="text-sm font-medium text-medsight-primary mb-1">{alert.message}</p>
                    <p className="text-xs text-medsight-primary/70">{alert.details}</p>
                    <div className="text-xs text-medsight-primary/50 mt-2">
                      {alert.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="ml-2 text-xs text-medsight-primary hover:text-medsight-primary/70"
                  >
                    Ack
                  </button>
                </div>
              </div>
            ))}
            
            {unacknowledgedAlerts.length === 0 && (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-8 h-8 text-medsight-normal mx-auto mb-2" />
                <p className="text-sm text-medsight-normal">No active alerts</p>
              </div>
            )}
          </div>
        </div>

        {/* System Logs */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-medsight-primary">System Logs</h3>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-sm text-medsight-primary hover:text-medsight-primary/70"
            >
              {showLogs ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.slice(0, 10).map(log => (
              <div key={log.id} className="p-2 hover:bg-medsight-primary/5 rounded transition-colors">
                <div className="flex items-start space-x-3">
                  <span className={`text-xs font-mono ${getLogLevelColor(log.level)} uppercase w-12`}>
                    {log.level}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-medsight-primary/60">{log.service}</span>
                      <span className="text-xs text-medsight-primary/50">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-medsight-primary truncate">{log.message}</p>
                    {showLogs && log.metadata && (
                      <div className="text-xs text-medsight-primary/60 mt-1 font-mono">
                        {JSON.stringify(log.metadata, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-medsight-primary">Performance Metrics</h3>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="input-medsight text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-primary mb-1">
              {(Math.random() * 1000 + 500).toFixed(0)}
            </div>
            <div className="text-sm text-medsight-primary/70">Requests/min</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-secondary mb-1">
              {(Math.random() * 10 + 5).toFixed(1)}
            </div>
            <div className="text-sm text-medsight-secondary/70">Avg Response (s)</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-normal mb-1">
              99.{(Math.random() * 9 + 1).toFixed(0)}%
            </div>
            <div className="text-sm text-medsight-normal/70">Uptime</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-pending mb-1">
              {(Math.random() * 0.5 + 0.1).toFixed(2)}%
            </div>
            <div className="text-sm text-medsight-pending/70">Error Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
} 