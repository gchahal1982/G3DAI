'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network, 
  Heart, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Monitor,
  Shield,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Wifi,
  Cloud,
  Eye,
  Settings
} from 'lucide-react';

interface SystemMetrics {
  cpu: {
    usage: number;
    temperature: number;
    load: number[];
    status: 'healthy' | 'warning' | 'critical';
  };
  memory: {
    used: number;
    total: number;
    usage: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  storage: {
    used: number;
    total: number;
    usage: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  network: {
    latency: number;
    bandwidth: number;
    packetLoss: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  uptime: number;
  lastUpdate: Date;
}

interface MedicalSystemStatus {
  dicomServer: {
    status: 'online' | 'offline' | 'degraded';
    responseTime: number;
    studies: number;
    connections: number;
  };
  aiEngine: {
    status: 'online' | 'offline' | 'degraded';
    modelsLoaded: number;
    queueSize: number;
    processedToday: number;
  };
  database: {
    status: 'online' | 'offline' | 'degraded';
    connections: number;
    queries: number;
    performance: number;
  };
  pacsConnections: {
    status: 'online' | 'offline' | 'degraded';
    activeConnections: number;
    totalConfigured: number;
  };
  backupSystem: {
    status: 'online' | 'offline' | 'degraded';
    lastBackup: Date;
    backupSize: number;
    retention: number;
  };
}

interface SystemHealthProps {
  refreshInterval?: number;
  showDetails?: boolean;
  compactView?: boolean;
}

export default function SystemHealth({ 
  refreshInterval = 30000, 
  showDetails = true, 
  compactView = false 
}: SystemHealthProps) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [medicalSystems, setMedicalSystems] = useState<MedicalSystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSystemHealth();
    
    if (autoRefresh) {
      const interval = setInterval(loadSystemHealth, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadSystemHealth = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/admin/system/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Medical-Context': 'system-health',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load system health data');
      }

      const data = await response.json();
      setMetrics(data.metrics);
      setMedicalSystems(data.medicalSystems);
    } catch (error) {
      console.error('System health error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // Mock data for development
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockMetrics: SystemMetrics = {
      cpu: {
        usage: 68.5,
        temperature: 72,
        load: [0.8, 1.2, 0.9],
        status: 'healthy'
      },
      memory: {
        used: 12.8,
        total: 32,
        usage: 40,
        status: 'healthy'
      },
      storage: {
        used: 2.4,
        total: 10,
        usage: 24,
        status: 'healthy'
      },
      network: {
        latency: 12,
        bandwidth: 95.2,
        packetLoss: 0.01,
        status: 'healthy'
      },
      uptime: 87.5,
      lastUpdate: new Date()
    };

    const mockMedicalSystems: MedicalSystemStatus = {
      dicomServer: {
        status: 'online',
        responseTime: 145,
        studies: 2847,
        connections: 12
      },
      aiEngine: {
        status: 'online',
        modelsLoaded: 8,
        queueSize: 3,
        processedToday: 156
      },
      database: {
        status: 'online',
        connections: 24,
        queries: 1245,
        performance: 92.3
      },
      pacsConnections: {
        status: 'degraded',
        activeConnections: 3,
        totalConfigured: 4
      },
      backupSystem: {
        status: 'online',
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000),
        backupSize: 1.2,
        retention: 30
      }
    };

    setMetrics(mockMetrics);
    setMedicalSystems(mockMedicalSystems);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-medsight-normal';
      case 'warning':
      case 'degraded':
        return 'text-medsight-pending';
      case 'critical':
      case 'offline':
        return 'text-medsight-critical';
      default:
        return 'text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="w-4 h-4 text-medsight-normal" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-medsight-pending" />;
      case 'critical':
      case 'offline':
        return <XCircle className="w-4 h-4 text-medsight-critical" />;
      default:
        return <Monitor className="w-4 h-4 text-slate-400" />;
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage < 60) return 'text-medsight-normal';
    if (usage < 80) return 'text-medsight-pending';
    return 'text-medsight-critical';
  };

  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} GB`;
    return `${(bytes / 1024).toFixed(1)} TB`;
  };

  if (loading) {
    return (
      <div className="medsight-glass p-8 rounded-xl">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-medsight-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-4 text-medsight-primary">Loading system health...</span>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="medsight-glass p-8 rounded-xl border-medsight-critical/20">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-medsight-critical mx-auto mb-4" />
          <div className="text-lg font-medium text-medsight-critical mb-2">
            System Health Error
          </div>
          <div className="text-sm text-medsight-critical/70 mb-4">
            {error}
          </div>
          <button onClick={loadSystemHealth} className="btn-medsight">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (compactView) {
    return (
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Heart className="w-5 h-5 text-medsight-normal" />
            <div>
              <div className="text-sm font-medium text-medsight-primary">System Health</div>
              <div className="text-xs text-slate-600">All systems operational</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-medsight-normal">
                {metrics?.cpu.usage.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500">CPU</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-medsight-normal">
                {metrics?.memory.usage}%
              </div>
              <div className="text-xs text-slate-500">Memory</div>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg ${
                autoRefresh 
                  ? 'bg-medsight-primary/10 text-medsight-primary' 
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-medsight-primary mb-2">
              System Health Dashboard
            </h2>
            <p className="text-slate-600">
              Real-time monitoring of medical system infrastructure
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg ${
                  autoRefresh 
                    ? 'bg-medsight-primary/10 text-medsight-primary' 
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-sm text-slate-600">
                {autoRefresh ? 'Auto-refresh' : 'Manual refresh'}
              </span>
            </div>
            <button onClick={loadSystemHealth} className="btn-medsight">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CPU Usage */}
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-primary/10">
                <Cpu className="w-6 h-6 text-medsight-primary" />
              </div>
              {getStatusIcon(metrics.cpu.status)}
            </div>
            <div className="text-2xl font-bold text-medsight-primary mb-1">
              {metrics.cpu.usage.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-600 mb-2">CPU Usage</div>
            <div className="text-xs text-slate-500">
              Temp: {metrics.cpu.temperature}°C
            </div>
          </div>

                     {/* Memory Usage */}
           <div className="medsight-glass p-6 rounded-xl">
             <div className="flex items-center justify-between mb-4">
               <div className="p-3 rounded-lg bg-medsight-secondary/10">
                 <MemoryStick className="w-6 h-6 text-medsight-secondary" />
               </div>
              {getStatusIcon(metrics.memory.status)}
            </div>
            <div className="text-2xl font-bold text-medsight-secondary mb-1">
              {metrics.memory.usage}%
            </div>
            <div className="text-sm text-slate-600 mb-2">Memory Usage</div>
            <div className="text-xs text-slate-500">
              {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
            </div>
          </div>

          {/* Storage Usage */}
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-accent/10">
                <HardDrive className="w-6 h-6 text-medsight-accent" />
              </div>
              {getStatusIcon(metrics.storage.status)}
            </div>
            <div className="text-2xl font-bold text-medsight-accent mb-1">
              {metrics.storage.usage}%
            </div>
            <div className="text-sm text-slate-600 mb-2">Storage Usage</div>
            <div className="text-xs text-slate-500">
              {formatBytes(metrics.storage.used)} / {formatBytes(metrics.storage.total)}
            </div>
          </div>

          {/* Network Status */}
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-ai-high/10">
                <Network className="w-6 h-6 text-medsight-ai-high" />
              </div>
              {getStatusIcon(metrics.network.status)}
            </div>
            <div className="text-2xl font-bold text-medsight-ai-high mb-1">
              {metrics.network.latency}ms
            </div>
            <div className="text-sm text-slate-600 mb-2">Network Latency</div>
            <div className="text-xs text-slate-500">
              {metrics.network.bandwidth}% bandwidth
            </div>
          </div>
        </div>
      )}

      {/* Medical Systems Status */}
      {medicalSystems && (
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-medsight-primary">
                Medical Systems Status
              </h3>
              <p className="text-slate-600 mt-1">
                Status of critical medical infrastructure components
              </p>
            </div>
            <button className="btn-medsight">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* DICOM Server */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-medsight-primary" />
                  <h4 className="font-medium text-medsight-primary">DICOM Server</h4>
                </div>
                {getStatusIcon(medicalSystems.dicomServer.status)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Response Time</span>
                  <span className="text-sm font-medium">{medicalSystems.dicomServer.responseTime}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Studies</span>
                  <span className="text-sm font-medium">{medicalSystems.dicomServer.studies}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Connections</span>
                  <span className="text-sm font-medium">{medicalSystems.dicomServer.connections}</span>
                </div>
              </div>
            </div>

            {/* AI Engine */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-medsight-primary" />
                  <h4 className="font-medium text-medsight-primary">AI Engine</h4>
                </div>
                {getStatusIcon(medicalSystems.aiEngine.status)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Models Loaded</span>
                  <span className="text-sm font-medium">{medicalSystems.aiEngine.modelsLoaded}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Queue Size</span>
                  <span className="text-sm font-medium">{medicalSystems.aiEngine.queueSize}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Processed Today</span>
                  <span className="text-sm font-medium">{medicalSystems.aiEngine.processedToday}</span>
                </div>
              </div>
            </div>

            {/* Database */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-medsight-primary" />
                  <h4 className="font-medium text-medsight-primary">Database</h4>
                </div>
                {getStatusIcon(medicalSystems.database.status)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Connections</span>
                  <span className="text-sm font-medium">{medicalSystems.database.connections}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Queries/min</span>
                  <span className="text-sm font-medium">{medicalSystems.database.queries}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Performance</span>
                  <span className="text-sm font-medium">{medicalSystems.database.performance}%</span>
                </div>
              </div>
            </div>

            {/* PACS Connections */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Wifi className="w-5 h-5 text-medsight-primary" />
                  <h4 className="font-medium text-medsight-primary">PACS Connections</h4>
                </div>
                {getStatusIcon(medicalSystems.pacsConnections.status)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Active</span>
                  <span className="text-sm font-medium">{medicalSystems.pacsConnections.activeConnections}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Configured</span>
                  <span className="text-sm font-medium">{medicalSystems.pacsConnections.totalConfigured}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className={`text-sm font-medium ${getStatusColor(medicalSystems.pacsConnections.status)}`}>
                    {medicalSystems.pacsConnections.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Backup System */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Cloud className="w-5 h-5 text-medsight-primary" />
                  <h4 className="font-medium text-medsight-primary">Backup System</h4>
                </div>
                {getStatusIcon(medicalSystems.backupSystem.status)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Last Backup</span>
                  <span className="text-sm font-medium">
                    {medicalSystems.backupSystem.lastBackup.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Size</span>
                  <span className="text-sm font-medium">{formatBytes(medicalSystems.backupSystem.backupSize)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Retention</span>
                  <span className="text-sm font-medium">{medicalSystems.backupSystem.retention} days</span>
                </div>
              </div>
            </div>

            {/* System Uptime */}
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-medsight-primary" />
                  <h4 className="font-medium text-medsight-primary">System Uptime</h4>
                </div>
                <CheckCircle className="w-4 h-4 text-medsight-normal" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Uptime</span>
                  <span className="text-sm font-medium">
                    {metrics && formatUptime(metrics.uptime)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Availability</span>
                  <span className="text-sm font-medium text-medsight-normal">99.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Last Update</span>
                  <span className="text-sm font-medium">
                    {metrics && metrics.lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Performance Trends */}
      {showDetails && (
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-medsight-primary">
                Performance Trends
              </h3>
              <p className="text-slate-600 mt-1">
                Historical performance metrics and trends
              </p>
            </div>
            <button className="btn-medsight">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-medsight-primary">CPU Performance</h4>
                <TrendingUp className="w-4 h-4 text-medsight-normal" />
              </div>
              <div className="text-2xl font-bold text-medsight-primary mb-1">
                {metrics?.cpu.usage.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">
                Average usage over last 24 hours
              </div>
            </div>

            <div className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-medsight-primary">Memory Efficiency</h4>
                <TrendingUp className="w-4 h-4 text-medsight-normal" />
              </div>
              <div className="text-2xl font-bold text-medsight-secondary mb-1">
                {metrics?.memory.usage}%
              </div>
              <div className="text-sm text-slate-600">
                Memory utilization trend
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 