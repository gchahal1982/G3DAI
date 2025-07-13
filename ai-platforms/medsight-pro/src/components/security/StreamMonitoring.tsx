'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Server, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Play,
  Pause,
  Square,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Monitor,
  Cpu,
  HardDrive,
  Network
} from 'lucide-react';

interface StreamProcessor {
  id: string;
  name: string;
  type: 'dicom' | 'ai_inference' | 'medical_data' | 'imaging' | 'analytics';
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
  throughput: number; // messages per second
  latency: number; // milliseconds
  errorRate: number; // percentage
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  inputQueue: number;
  outputQueue: number;
  processedMessages: number;
  failedMessages: number;
  uptime: number; // hours
  lastProcessed: Date;
  configuration: {
    maxConcurrency: number;
    batchSize: number;
    timeout: number;
    retryAttempts: number;
  };
}

interface StreamMetrics {
  totalThroughput: number;
  averageLatency: number;
  totalErrors: number;
  activeProcessors: number;
  queueBacklog: number;
  systemLoad: number;
  dataProcessed: number; // GB
  uptime: number;
}

interface StreamMonitoringProps {
  refreshInterval?: number;
  showControls?: boolean;
  compactView?: boolean;
}

export default function StreamMonitoring({ 
  refreshInterval = 5000, 
  showControls = true, 
  compactView = false 
}: StreamMonitoringProps) {
  const [processors, setProcessors] = useState<StreamProcessor[]>([]);
  const [metrics, setMetrics] = useState<StreamMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProcessor, setSelectedProcessor] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadStreamData();
    
    if (autoRefresh) {
      const interval = setInterval(loadStreamData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadStreamData = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/stream/processors', {
        headers: {
          'Content-Type': 'application/json',
          'X-Medical-Context': 'stream-monitoring',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load stream data');
      }

      const data = await response.json();
      setProcessors(data.processors);
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Stream monitoring error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // Mock data for development
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockProcessors: StreamProcessor[] = [
      {
        id: 'dicom-processor-1',
        name: 'DICOM Image Processor',
        type: 'dicom',
        status: 'running',
        throughput: 156.7,
        latency: 234,
        errorRate: 0.02,
        cpuUsage: 68,
        memoryUsage: 54,
        inputQueue: 12,
        outputQueue: 3,
        processedMessages: 892456,
        failedMessages: 178,
        uptime: 72.5,
        lastProcessed: new Date(),
        configuration: {
          maxConcurrency: 8,
          batchSize: 32,
          timeout: 30000,
          retryAttempts: 3
        }
      },
      {
        id: 'ai-inference-1',
        name: 'Medical AI Inference Engine',
        type: 'ai_inference',
        status: 'running',
        throughput: 45.2,
        latency: 1850,
        errorRate: 0.15,
        cpuUsage: 89,
        memoryUsage: 92,
        inputQueue: 25,
        outputQueue: 8,
        processedMessages: 234567,
        failedMessages: 352,
        uptime: 96.2,
        lastProcessed: new Date(Date.now() - 2000),
        configuration: {
          maxConcurrency: 4,
          batchSize: 8,
          timeout: 60000,
          retryAttempts: 2
        }
      },
      {
        id: 'medical-data-1',
        name: 'Medical Data Pipeline',
        type: 'medical_data',
        status: 'running',
        throughput: 289.1,
        latency: 89,
        errorRate: 0.01,
        cpuUsage: 34,
        memoryUsage: 41,
        inputQueue: 5,
        outputQueue: 1,
        processedMessages: 1567890,
        failedMessages: 156,
        uptime: 168.7,
        lastProcessed: new Date(Date.now() - 500),
        configuration: {
          maxConcurrency: 12,
          batchSize: 64,
          timeout: 15000,
          retryAttempts: 5
        }
      },
      {
        id: 'imaging-processor-1',
        name: 'Medical Imaging Processor',
        type: 'imaging',
        status: 'error',
        throughput: 0,
        latency: 0,
        errorRate: 100,
        cpuUsage: 12,
        memoryUsage: 18,
        inputQueue: 156,
        outputQueue: 0,
        processedMessages: 456789,
        failedMessages: 2341,
        uptime: 24.1,
        lastProcessed: new Date(Date.now() - 15 * 60 * 1000),
        configuration: {
          maxConcurrency: 6,
          batchSize: 16,
          timeout: 45000,
          retryAttempts: 3
        }
      }
    ];

    const mockMetrics: StreamMetrics = {
      totalThroughput: 491.0,
      averageLatency: 816,
      totalErrors: 3027,
      activeProcessors: 3,
      queueBacklog: 42,
      systemLoad: 58.7,
      dataProcessed: 1.34,
      uptime: 72.5
    };

    setProcessors(mockProcessors);
    setMetrics(mockMetrics);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-medsight-normal';
      case 'error': return 'text-medsight-critical';
      case 'stopped': return 'text-slate-500';
      case 'starting': return 'text-medsight-pending';
      case 'stopping': return 'text-medsight-secondary';
      default: return 'text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-4 h-4 text-medsight-normal" />;
      case 'error': return <XCircle className="w-4 h-4 text-medsight-critical" />;
      case 'stopped': return <Square className="w-4 h-4 text-slate-500" />;
      case 'starting': return <Play className="w-4 h-4 text-medsight-pending" />;
      case 'stopping': return <Pause className="w-4 h-4 text-medsight-secondary" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dicom': return 'text-medsight-primary';
      case 'ai_inference': return 'text-medsight-ai-high';
      case 'medical_data': return 'text-medsight-secondary';
      case 'imaging': return 'text-medsight-accent';
      case 'analytics': return 'text-medsight-pending';
      default: return 'text-slate-600';
    }
  };

  const getPerformanceColor = (value: number, type: 'cpu' | 'memory' | 'error') => {
    if (type === 'error') {
      if (value > 5) return 'text-medsight-critical';
      if (value > 1) return 'text-medsight-pending';
      return 'text-medsight-normal';
    }
    if (value > 90) return 'text-medsight-critical';
    if (value > 75) return 'text-medsight-pending';
    if (value > 50) return 'text-medsight-secondary';
    return 'text-medsight-normal';
  };

  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const filteredProcessors = processors.filter(processor => {
    const matchesType = filterType === 'all' || processor.type === filterType;
    const matchesStatus = filterStatus === 'all' || processor.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      processor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      processor.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="medsight-glass p-8 rounded-xl">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-medsight-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-4 text-medsight-primary">Loading stream data...</span>
        </div>
      </div>
    );
  }

  if (compactView) {
    return (
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-medsight-primary" />
            <div>
              <div className="text-sm font-medium text-medsight-primary">Stream Processing</div>
              <div className="text-xs text-slate-600">
                {metrics?.activeProcessors} active processors
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-medsight-primary">
                {metrics?.totalThroughput.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500">msg/sec</div>
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
              Stream Processing Monitor
            </h2>
            <p className="text-slate-600">
              Real-time monitoring of medical data stream processors
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
            <button onClick={loadStreamData} className="btn-medsight">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stream Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-primary/10">
                <Activity className="w-6 h-6 text-medsight-primary" />
              </div>
              <TrendingUp className="w-5 h-5 text-medsight-normal" />
            </div>
            <div className="text-2xl font-bold text-medsight-primary mb-1">
              {metrics.totalThroughput.toFixed(1)}
            </div>
            <div className="text-sm text-slate-600">Messages/sec</div>
            <div className="text-xs text-slate-500">
              Total throughput
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-secondary/10">
                <Clock className="w-6 h-6 text-medsight-secondary" />
              </div>
              <CheckCircle className="w-5 h-5 text-medsight-normal" />
            </div>
            <div className="text-2xl font-bold text-medsight-secondary mb-1">
              {metrics.averageLatency}ms
            </div>
            <div className="text-sm text-slate-600">Avg Latency</div>
            <div className="text-xs text-slate-500">
              Processing time
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-accent/10">
                <Server className="w-6 h-6 text-medsight-accent" />
              </div>
              <Activity className="w-5 h-5 text-medsight-accent" />
            </div>
            <div className="text-2xl font-bold text-medsight-accent mb-1">
              {metrics.activeProcessors}
            </div>
            <div className="text-sm text-slate-600">Active Processors</div>
            <div className="text-xs text-slate-500">
              {processors.length} total
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-medsight-ai-high/10">
                <Database className="w-6 h-6 text-medsight-ai-high" />
              </div>
              <BarChart3 className="w-5 h-5 text-medsight-ai-high" />
            </div>
            <div className="text-2xl font-bold text-medsight-ai-high mb-1">
              {metrics.queueBacklog}
            </div>
            <div className="text-sm text-slate-600">Queue Backlog</div>
            <div className="text-xs text-slate-500">
              Pending messages
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="medsight-input text-sm"
            >
              <option value="all">All Types</option>
              <option value="dicom">DICOM</option>
              <option value="ai_inference">AI Inference</option>
              <option value="medical_data">Medical Data</option>
              <option value="imaging">Imaging</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="medsight-input text-sm"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
              <option value="error">Error</option>
              <option value="starting">Starting</option>
              <option value="stopping">Stopping</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 flex-1">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search processors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="medsight-input text-sm flex-1"
            />
          </div>
        </div>
      </div>

      {/* Processors List */}
      <div className="space-y-4">
        {filteredProcessors.map((processor) => (
          <div
            key={processor.id}
            className={`medsight-control-glass p-4 rounded-lg cursor-pointer transition-all ${
              selectedProcessor === processor.id ? 'ring-2 ring-medsight-primary' : ''
            }`}
            onClick={() => setSelectedProcessor(selectedProcessor === processor.id ? null : processor.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-1">
                  {getStatusIcon(processor.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-slate-900">{processor.name}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      processor.type === 'dicom' ? 'bg-medsight-primary/10 text-medsight-primary' :
                      processor.type === 'ai_inference' ? 'bg-medsight-ai-high/10 text-medsight-ai-high' :
                      processor.type === 'medical_data' ? 'bg-medsight-secondary/10 text-medsight-secondary' :
                      processor.type === 'imaging' ? 'bg-medsight-accent/10 text-medsight-accent' :
                      'bg-medsight-pending/10 text-medsight-pending'
                    }`}>
                      {processor.type.replace('_', ' ')}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(processor.status)}`}>
                      {processor.status}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500">Throughput</div>
                      <div className="font-medium">{processor.throughput.toFixed(1)} msg/s</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Latency</div>
                      <div className="font-medium">{processor.latency}ms</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Queue</div>
                      <div className="font-medium">{processor.inputQueue} in, {processor.outputQueue} out</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Uptime</div>
                      <div className="font-medium">{formatUptime(processor.uptime)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-medsight-primary">
                  {processor.errorRate.toFixed(2)}%
                </div>
                <div className="text-xs text-slate-500">Error Rate</div>
              </div>
            </div>

            {selectedProcessor === processor.id && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">
                      Performance Metrics
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">CPU Usage</span>
                        <span className={`text-sm font-medium ${getPerformanceColor(processor.cpuUsage, 'cpu')}`}>
                          {processor.cpuUsage}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Memory Usage</span>
                        <span className={`text-sm font-medium ${getPerformanceColor(processor.memoryUsage, 'memory')}`}>
                          {processor.memoryUsage}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Error Rate</span>
                        <span className={`text-sm font-medium ${getPerformanceColor(processor.errorRate, 'error')}`}>
                          {processor.errorRate.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">
                      Message Statistics
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Processed</span>
                        <span className="text-sm font-medium">{formatNumber(processor.processedMessages)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Failed</span>
                        <span className="text-sm font-medium text-medsight-critical">{formatNumber(processor.failedMessages)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Last Processed</span>
                        <span className="text-sm font-medium">{processor.lastProcessed.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">
                      Configuration
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Concurrency</span>
                        <span className="text-sm font-medium">{processor.configuration.maxConcurrency}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Batch Size</span>
                        <span className="text-sm font-medium">{processor.configuration.batchSize}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Timeout</span>
                        <span className="text-sm font-medium">{processor.configuration.timeout / 1000}s</span>
                      </div>
                    </div>
                  </div>
                </div>
                {showControls && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button className="btn-medsight text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        View Logs
                      </button>
                      <button className="btn-medsight text-xs">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      {processor.status === 'running' && (
                        <button className="btn-medsight text-xs">
                          <Pause className="w-3 h-3 mr-1" />
                          Stop
                        </button>
                      )}
                      {processor.status === 'stopped' && (
                        <button className="btn-medsight text-xs">
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </button>
                      )}
                      {processor.status === 'error' && (
                        <button className="btn-medsight text-xs">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Restart
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredProcessors.length === 0 && (
        <div className="medsight-glass p-8 rounded-xl text-center">
          <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <div className="text-lg font-medium text-slate-600 mb-2">
            No Processors Found
          </div>
          <div className="text-sm text-slate-500">
            {searchQuery || filterType !== 'all' || filterStatus !== 'all'
              ? 'No processors match your current filters.'
              : 'No stream processors configured.'}
          </div>
        </div>
      )}
    </div>
  );
} 
 