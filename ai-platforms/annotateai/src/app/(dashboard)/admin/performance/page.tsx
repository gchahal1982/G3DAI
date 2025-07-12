'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Badge, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger, 
  Progress, 
  Alert, 
  AlertDescription, 
  ScrollArea, 
  Switch, 
  Slider, 
  Input, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Textarea, 
  Separator 
} from '../../../../../../../shared/components/ui';
import { 
  Activity, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network, 
  Thermometer, 
  Gauge, 
  Settings, 
  BarChart3, 
  LineChart, 
  PieChart, 
  RefreshCw, 
  Play, 
  Pause, 
  Square, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Zap, 
  Server, 
  Database, 
  Layers, 
  Box, 
  Package, 
  Target, 
  Award, 
  Star, 
  Heart, 
  Bookmark, 
  Flag, 
  Bell, 
  Mail, 
  Phone, 
  MapPin, 
  Download, 
  Upload, 
  Share, 
  MoreHorizontal, 
  MoreVertical 
} from 'lucide-react';

// Performance Monitoring Types
interface SystemMetrics {
  cpu: Metric;
  memory: Metric;
  disk: Metric;
  network: Metric;
  gpu?: Metric;
  temperature?: Metric;
}

interface Metric {
  usage: number;
  capacity: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'high' | 'critical';
  details?: Record<string, any>;
}

interface ServicePerformance {
  id: string;
  name: string;
  type: 'backend' | 'frontend' | 'database' | 'cache' | 'worker' | 'external';
  status: 'running' | 'stopped' | 'degraded' | 'error';
  metrics: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
    cpu: number;
    memory: number;
  };
  dependencies: string[];
  lastChecked: Date;
  incidents: Incident[];
  optimization: OptimizationRecommendation[];
}

interface Incident {
  id: string;
  timestamp: Date;
  type: 'downtime' | 'performance_degradation' | 'error_spike' | 'resource_limit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'monitoring';
  description: string;
  impact: string;
  duration?: number;
}

interface OptimizationRecommendation {
  id:string;
  type: 'resource_scaling' | 'caching' | 'query_optimization' | 'code_refactoring' | 'load_balancing' | 'memory_management';
  description: string;
  priority: 'low' | 'medium' | 'high';
  potentialImpact: string;
  effort: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

interface PerformanceBenchmark {
  id: string;
  name: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  type: 'load' | 'stress' | 'soak' | 'spike' | 'configuration';
  schedule: Date;
  duration: number;
  results: BenchmarkResult[];
  configuration: BenchmarkConfig;
}

interface BenchmarkResult {
  timestamp: Date;
  requests: number;
  rps: number;
  latency_p95: number;
  latency_p99: number;
  errors: number;
  cpu: number;
  memory: number;
}

interface BenchmarkConfig {
  concurrentUsers: number;
  rampUp: number;
  duration: number;
  targetRPS: number;
  environment: string;
  testPlan: string;
}

interface PerformanceAlert {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  condition: 'above' | 'below' | 'equal';
  duration: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  channels: string[];
  lastTriggered?: Date;
}

interface HistoricalData {
  cpu: TimeSeriesData[];
  memory: TimeSeriesData[];
  network: TimeSeriesData[];
  responseTime: TimeSeriesData[];
  errorRate: TimeSeriesData[];
}

interface TimeSeriesData {
  timestamp: Date;
  value: number;
}

interface PerformanceDashboardConfig {
  realTime: boolean;
  refreshInterval: number;
  defaultTimeRange: string;
  widgets: string[];
  dashboards: CustomDashboard[];
}

interface CustomDashboard {
  id: string;
  name: string;
  widgets: WidgetConfig[];
}

interface WidgetConfig {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'status' | 'alert';
  metric: string;
  chartType?: 'line' | 'bar' | 'pie' | 'gauge';
  timeRange?: string;
  filters?: Record<string, any>;
}

export default function PerformanceDashboard() {
  // State management
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [services, setServices] = useState<ServicePerformance[]>([]);
  const [benchmarks, setBenchmarks] = useState<PerformanceBenchmark[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [dashboardConfig, setDashboardConfig] = useState<PerformanceDashboardConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('1h');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);

  // Backend connection
  const optimizationEngineRef = useRef<any>(null);

  // Initialize
  useEffect(() => {
    const initializePerformance = async () => {
      try {
        optimizationEngineRef.current = {
          getSystemMetrics: async () => generateMockSystemMetrics(),
          getServicesPerformance: async () => generateMockServicesPerformance(),
          getBenchmarks: async () => generateMockBenchmarks(),
          getAlerts: async () => generateMockAlerts(),
          getHistoricalData: async (range: string) => generateMockHistoricalData(range),
          getDashboardConfig: async () => generateMockDashboardConfig(),
          runBenchmark: async (config: Partial<PerformanceBenchmark>) => {
            const newBenchmark = {
              ...config,
              id: `benchmark_${Date.now()}`,
              status: 'running' as const,
              results: []
            };
            setBenchmarks(prev => [...prev, newBenchmark as PerformanceBenchmark]);
          },
          applyOptimization: async (id: string) => {
            setServices(prev => prev.map(s => {
              const opt = s.optimization.find(o => o.id === id);
              if (opt) {
                opt.status = 'in_progress';
              }
              return s;
            }));
          }
        };

        const [metrics, servicesData, benchmarksData, alertsData, histData, config] = await Promise.all([
          optimizationEngineRef.current.getSystemMetrics(),
          optimizationEngineRef.current.getServicesPerformance(),
          optimizationEngineRef.current.getBenchmarks(),
          optimizationEngineRef.current.getAlerts(),
          optimizationEngineRef.current.getHistoricalData('1h'),
          optimizationEngineRef.current.getDashboardConfig()
        ]);

        setSystemMetrics(metrics);
        setServices(servicesData);
        setBenchmarks(benchmarksData);
        setAlerts(alertsData);
        setHistoricalData(histData);
        setDashboardConfig(config);
        setTimeRange(config.defaultTimeRange);

      } catch (error) {
        console.error('Failed to initialize performance dashboard:', error);
        setError('Failed to initialize performance dashboard');
      }
    };

    initializePerformance();

    // Set up real-time updates
    let interval: NodeJS.Timeout;
    if (realTimeEnabled) {
      interval = setInterval(async () => {
        if (optimizationEngineRef.current) {
          const metrics = await optimizationEngineRef.current.getSystemMetrics();
          setSystemMetrics(metrics);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeEnabled]);

  // Actions
  const runBenchmark = useCallback(async (config: Partial<PerformanceBenchmark>) => {
    try {
      await optimizationEngineRef.current?.runBenchmark(config);
      setShowBenchmarkModal(false);
    } catch (error) {
      console.error('Failed to run benchmark:', error);
      setError('Failed to run performance benchmark');
    }
  }, []);

  const applyOptimization = useCallback(async (optimizationId: string) => {
    try {
      await optimizationEngineRef.current?.applyOptimization(optimizationId);
    } catch (error) {
      console.error('Failed to apply optimization:', error);
      setError('Failed to apply optimization');
    }
  }, []);

  // Utilities
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': case 'completed': case 'normal': return 'bg-green-500';
      case 'degraded': case 'high': case 'warning': return 'bg-yellow-500';
      case 'error': case 'failed': case 'critical': return 'bg-red-500';
      case 'stopped': case 'scheduled': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'cpu': return <Cpu className="h-5 w-5" />;
      case 'memory': return <MemoryStick className="h-5 w-5" />;
      case 'disk': return <HardDrive className="h-5 w-5" />;
      case 'network': return <Network className="h-5 w-5" />;
      case 'gpu': return <Layers className="h-5 w-5" />;
      case 'temperature': return <Thermometer className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  // Mock data generators
  const generateMockSystemMetrics = (): SystemMetrics => ({
    cpu: { usage: 45 + Math.random() * 10, capacity: 100, unit: '%', trend: 'stable', status: 'normal' },
    memory: { usage: 60 + Math.random() * 5, capacity: 100, unit: '%', trend: 'up', status: 'high' },
    disk: { usage: 75, capacity: 100, unit: '%', trend: 'stable', status: 'normal' },
    network: { usage: 30 + Math.random() * 15, capacity: 100, unit: 'Mbps', trend: 'down', status: 'normal' },
    gpu: { usage: 25, capacity: 100, unit: '%', trend: 'stable', status: 'normal' },
    temperature: { usage: 65, capacity: 100, unit: '°C', trend: 'stable', status: 'normal' }
  });

  const generateMockServicesPerformance = (): ServicePerformance[] => [
    {
      id: 'backend-api',
      name: 'Backend API Service',
      type: 'backend',
      status: 'running',
      metrics: {
        responseTime: 120,
        throughput: 1500,
        errorRate: 0.5,
        availability: 99.9,
        cpu: 60,
        memory: 70
      },
      dependencies: ['database', 'cache'],
      lastChecked: new Date(),
      incidents: [
        { id: 'inc-1', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), type: 'performance_degradation', severity: 'medium', status: 'resolved', description: 'Increased latency on user endpoints', impact: 'Slow API responses for some users', duration: 1800 }
      ],
      optimization: [
        { id: 'opt-1', type: 'caching', description: 'Increase cache hit rate for user profiles', priority: 'high', potentialImpact: '50% latency reduction', effort: 'low', status: 'pending' }
      ]
    },
    {
      id: 'database',
      name: 'PostgreSQL Database',
      type: 'database',
      status: 'running',
      metrics: {
        responseTime: 30,
        throughput: 2500,
        errorRate: 0.1,
        availability: 99.95,
        cpu: 75,
        memory: 80
      },
      dependencies: [],
      lastChecked: new Date(),
      incidents: [],
      optimization: [
        { id: 'opt-2', type: 'query_optimization', description: 'Optimize slow query on projects table', priority: 'medium', potentialImpact: 'Improved dashboard loading times', effort: 'medium', status: 'completed' }
      ]
    }
  ];

  const generateMockBenchmarks = (): PerformanceBenchmark[] => [
    {
      id: 'benchmark-1',
      name: 'Weekly Load Test',
      status: 'completed',
      type: 'load',
      schedule: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      duration: 3600,
      results: [
        { timestamp: new Date(), requests: 120000, rps: 33.3, latency_p95: 350, latency_p99: 800, errors: 25, cpu: 75, memory: 85 }
      ],
      configuration: { concurrentUsers: 500, rampUp: 300, duration: 3600, targetRPS: 50, environment: 'staging', testPlan: 'load_test_plan.jmx' }
    }
  ];

  const generateMockAlerts = (): PerformanceAlert[] => [
    { id: 'alert-1', name: 'High CPU Usage', metric: 'cpu', threshold: 90, condition: 'above', duration: 300, severity: 'high', enabled: true, channels: ['slack', 'email'], lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: 'alert-2', name: 'High Memory Usage', metric: 'memory', threshold: 85, condition: 'above', duration: 600, severity: 'critical', enabled: true, channels: ['pagerduty'], lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000) }
  ];

  const generateMockHistoricalData = (range: string): HistoricalData => {
    const points = range === '1h' ? 60 : range === '24h' ? 24 : 7;
    const interval = range === '1h' ? 60 * 1000 : range === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    const generateSeries = (base: number, variance: number) => 
      Array.from({ length: points }, (_, i) => ({
        timestamp: new Date(Date.now() - (points - 1 - i) * interval),
        value: base + (Math.random() - 0.5) * variance
      }));

    return {
      cpu: generateSeries(50, 20),
      memory: generateSeries(65, 10),
      network: generateSeries(35, 15),
      responseTime: generateSeries(150, 50),
      errorRate: generateSeries(0.5, 0.4)
    };
  };

  const generateMockDashboardConfig = (): PerformanceDashboardConfig => ({
    realTime: true,
    refreshInterval: 5000,
    defaultTimeRange: '1h',
    widgets: ['system_metrics', 'service_status', 'active_alerts'],
    dashboards: [
      { id: 'db-1', name: 'Main Dashboard', widgets: [] },
      { id: 'db-2', name: 'Backend Services', widgets: [] }
    ]
  });

  if (!systemMetrics || !services) {
    return (
      <div className="performance-dashboard p-6">
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Loading Performance Data</h3>
          <p className="text-gray-600">Initializing performance monitoring system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-dashboard p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Performance Dashboard</h2>
            <p className="text-gray-600">Real-time system and service performance monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Real-time</Label>
            <Switch checked={realTimeEnabled} onCheckedChange={setRealTimeEnabled} />
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowBenchmarkModal(true)}>
            <Play className="h-4 w-4 mr-2" />
            Run Benchmark
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(systemMetrics).map(([key, metric]) => (
                  metric && (
                    <div key={key} className="text-center p-4 border rounded">
                      <div className="flex items-center justify-center gap-2">
                        {getMetricIcon(key)}
                        <h4 className="font-medium capitalize">{key}</h4>
                      </div>
                      <div className={`text-3xl font-bold mt-2 ${getStatusColor(metric.status)}-text`}>
                        {metric.usage.toFixed(1)}{metric.unit}
                      </div>
                      <div className="text-sm text-gray-600">
                        {metric.trend === 'up' ? '📈' : metric.trend === 'down' ? '📉' : '➡️'}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          {/* Services Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{service.name}</CardTitle>
                    <Badge className={`${getStatusColor(service.status)} text-white`}>
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Response Time:</span>
                      <span className="ml-2 font-medium">{service.metrics.responseTime}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Throughput:</span>
                      <span className="ml-2 font-medium">{service.metrics.throughput} req/s</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Error Rate:</span>
                      <span className="ml-2 font-medium">{service.metrics.errorRate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Availability:</span>
                      <span className="ml-2 font-medium">{service.metrics.availability}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {/* Optimization Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.flatMap(s => s.optimization).map((opt) => (
                  <div key={opt.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{opt.description}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Priority: {opt.priority} • Effort: {opt.effort} • Impact: {opt.potentialImpact}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => applyOptimization(opt.id)}>
                      <Zap className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          {/* Benchmark History */}
          <Card>
            <CardHeader>
              <CardTitle>Benchmark History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {benchmarks.map((benchmark) => (
                  <div key={benchmark.id} className="p-4 border rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{benchmark.name}</div>
                        <div className="text-sm text-gray-600">{benchmark.type} test</div>
                      </div>
                      <Badge className={`${getStatusColor(benchmark.status)} text-white`}>
                        {benchmark.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{benchmark.schedule.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                        <AlertTriangle className="text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{alert.name}</div>
                        <div className="text-sm text-gray-600">
                          {alert.metric} {alert.condition} {alert.threshold} for {alert.duration}s
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={alert.enabled} />
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Benchmark Modal */}
      {showBenchmarkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Run Performance Benchmark</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Benchmark Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select benchmark type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="load">Load Test</SelectItem>
                    <SelectItem value="stress">Stress Test</SelectItem>
                    <SelectItem value="soak">Soak Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Concurrent Users</Label>
                <Input type="number" placeholder="500" />
              </div>
              <div className="space-y-2">
                <Label>Duration (seconds)</Label>
                <Input type="number" placeholder="3600" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowBenchmarkModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => runBenchmark({ name: 'Manual Benchmark', type: 'load' })}>
                  Run
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 