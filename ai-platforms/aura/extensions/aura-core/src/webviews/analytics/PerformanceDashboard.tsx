/**
 * PerformanceDashboard - Real-time Performance Monitoring UI
 * 
 * Comprehensive performance analytics dashboard for Aura:
 * - Real-time latency visualization charts with multi-metric support
 * - p95 completion latency monitoring with threshold alerts
 * - FPS tracking for 3D minimap components with performance optimization
 * - Model performance comparison views with detailed breakdowns
 * - Crash-free session tracking with stability metrics
 * - Telemetry opt-in rate monitoring and privacy controls
 * - Performance regression alerts with automated detection
 * - Data export functionality for analysis and reporting
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Fade,
  Collapse
} from '@mui/material';
import {
  Timeline,
  Download,
  Refresh,
  Settings,
  Warning,
  CheckCircle,
  Error,
  TrendingUp,
  TrendingDown,
  Speed,
  Memory,
  Visibility,
  GraphicEq,
  Assessment,
  FileDownload,
  FilterList,
  NotificationsActive,
  Security,
  Computer
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';

// Styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, rgba(15, 15, 25, 0.95) 0%, rgba(25, 25, 40, 0.95) 100%)',
  minHeight: '100vh',
  color: theme.palette.text.primary
}));

const MetricCard = styled(Card)(({ theme }: { theme: any }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8]
  }
}));

const AlertCard = styled(Card)(({ theme, severity }: { theme: any; severity: 'error' | 'warning' | 'info' | 'success' }) => ({
  background: severity === 'error' ? 'rgba(244, 67, 54, 0.1)' : 
              severity === 'warning' ? 'rgba(255, 152, 0, 0.1)' :
              severity === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(33, 150, 243, 0.1)',
  border: `1px solid ${
    severity === 'error' ? 'rgba(244, 67, 54, 0.3)' : 
    severity === 'warning' ? 'rgba(255, 152, 0, 0.3)' :
    severity === 'success' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(33, 150, 243, 0.3)'
  }`,
  marginBottom: theme.spacing(2)
}));

// Interfaces
interface PerformanceMetrics {
  timestamp: number;
  latency: {
    p50: number;
    p95: number;
    p99: number;
    average: number;
  };
  fps: {
    current: number;
    average: number;
    min: number;
    max: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  models: {
    [modelId: string]: {
      latency: number;
      throughput: number;
      errorRate: number;
      usage: number;
    };
  };
  sessions: {
    total: number;
    crashFree: number;
    crashRate: number;
  };
  telemetry: {
    optInRate: number;
    dataPoints: number;
    coverage: number;
  };
}

interface PerformanceAlert {
  id: string;
  type: 'regression' | 'threshold' | 'anomaly' | 'crash';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  metric: string;
  value: number;
  threshold: number;
  acknowledged: boolean;
}

interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  timeRange: 'hour' | 'day' | 'week' | 'month';
  metrics: string[];
  includeCharts: boolean;
}

const PerformanceDashboard: React.FC = () => {
  // State management
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [selectedModels, setSelectedModels] = useState<string[]>(['all']);
  const [showAlerts, setShowAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    timeRange: 'day',
    metrics: ['latency', 'fps', 'memory'],
    includeCharts: true
  });
  const [loading, setLoading] = useState(false);
  const [telemetryEnabled, setTelemetryEnabled] = useState(true);

  const refreshTimer = useRef<NodeJS.Timeout>();

  // Chart colors
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4'
  };

  // Load performance data
  const loadPerformanceData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual metrics collection
      const mockData = generateMockMetrics();
      setMetrics(mockData);
      
      // Check for performance regressions
      const newAlerts = detectPerformanceRegressions(mockData);
      setAlerts(prev => [...prev, ...newAlerts]);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTimeRange, selectedModels]);

  // Generate mock metrics (replace with actual data fetching)
  const generateMockMetrics = (): PerformanceMetrics[] => {
    const now = Date.now();
    const points = selectedTimeRange === '1h' ? 60 : 
                   selectedTimeRange === '6h' ? 360 : 
                   selectedTimeRange === '24h' ? 1440 : 
                   selectedTimeRange === '7d' ? 10080 : 43200;
    
    return Array.from({ length: Math.min(points, 100) }, (_, i) => ({
      timestamp: now - (points - i) * 60000,
      latency: {
        p50: Math.random() * 50 + 20,
        p95: Math.random() * 100 + 80,
        p99: Math.random() * 200 + 150,
        average: Math.random() * 60 + 30
      },
      fps: {
        current: Math.random() * 20 + 40,
        average: Math.random() * 15 + 45,
        min: Math.random() * 10 + 30,
        max: Math.random() * 10 + 55
      },
      memory: {
        heapUsed: Math.random() * 200 + 100,
        heapTotal: Math.random() * 50 + 300,
        external: Math.random() * 50 + 20
      },
      models: {
        'qwen-3-coder': {
          latency: Math.random() * 40 + 15,
          throughput: Math.random() * 100 + 50,
          errorRate: Math.random() * 2,
          usage: Math.random() * 100
        },
        'phi-4-mini': {
          latency: Math.random() * 20 + 10,
          throughput: Math.random() * 150 + 75,
          errorRate: Math.random() * 1,
          usage: Math.random() * 80
        },
        'deepseek-r1': {
          latency: Math.random() * 80 + 40,
          throughput: Math.random() * 80 + 40,
          errorRate: Math.random() * 3,
          usage: Math.random() * 60
        }
      },
      sessions: {
        total: Math.floor(Math.random() * 1000 + 500),
        crashFree: Math.floor(Math.random() * 50 + 950),
        crashRate: Math.random() * 5
      },
      telemetry: {
        optInRate: Math.random() * 20 + 75,
        dataPoints: Math.floor(Math.random() * 10000 + 5000),
        coverage: Math.random() * 10 + 85
      }
    }));
  };

  // Detect performance regressions
  const detectPerformanceRegressions = (data: PerformanceMetrics[]): PerformanceAlert[] => {
    const alerts: PerformanceAlert[] = [];
    const latest = data[data.length - 1];
    
    if (latest) {
      // P95 latency threshold
      if (latest.latency.p95 > 100) {
        alerts.push({
          id: `p95-${Date.now()}`,
          type: 'threshold',
          severity: latest.latency.p95 > 200 ? 'critical' : 'high',
          title: 'High P95 Latency Detected',
          description: `P95 latency (${latest.latency.p95.toFixed(1)}ms) exceeds threshold (100ms)`,
          timestamp: latest.timestamp,
          metric: 'latency.p95',
          value: latest.latency.p95,
          threshold: 100,
          acknowledged: false
        });
      }

      // FPS performance
      if (latest.fps.current < 30) {
        alerts.push({
          id: `fps-${Date.now()}`,
          type: 'threshold',
          severity: latest.fps.current < 20 ? 'critical' : 'medium',
          title: 'Low FPS in 3D Minimap',
          description: `3D minimap FPS (${latest.fps.current.toFixed(1)}) below target (30 FPS)`,
          timestamp: latest.timestamp,
          metric: 'fps.current',
          value: latest.fps.current,
          threshold: 30,
          acknowledged: false
        });
      }

      // Crash rate
      if (latest.sessions.crashRate > 2) {
        alerts.push({
          id: `crash-${Date.now()}`,
          type: 'crash',
          severity: latest.sessions.crashRate > 5 ? 'critical' : 'high',
          title: 'Elevated Crash Rate',
          description: `Session crash rate (${latest.sessions.crashRate.toFixed(2)}%) exceeds threshold (2%)`,
          timestamp: latest.timestamp,
          metric: 'sessions.crashRate',
          value: latest.sessions.crashRate,
          threshold: 2,
          acknowledged: false
        });
      }
    }

    return alerts;
  };

  // Export performance data
  const exportData = async () => {
    try {
      setLoading(true);
      
      const exportData = {
        metrics: metrics.slice(-getDataPointsForTimeRange(exportOptions.timeRange)),
        alerts: alerts,
        metadata: {
          exportedAt: new Date().toISOString(),
          timeRange: exportOptions.timeRange,
          format: exportOptions.format,
          selectedMetrics: exportOptions.metrics
        }
      };

      // Create downloadable file
      let content: string;
      let mimeType: string;
      let filename: string;

      switch (exportOptions.format) {
        case 'csv':
          content = convertToCSV(exportData.metrics);
          mimeType = 'text/csv';
          filename = `aura-performance-${Date.now()}.csv`;
          break;
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          filename = `aura-performance-${Date.now()}.json`;
          break;
        default:
          content = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          filename = `aura-performance-${Date.now()}.json`;
      }

      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportDialogOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data: PerformanceMetrics[]): string => {
    const headers = ['timestamp', 'p50_latency', 'p95_latency', 'p99_latency', 'avg_latency', 'fps', 'memory_used', 'crash_rate'];
    const rows = data.map(metric => [
      new Date(metric.timestamp).toISOString(),
      metric.latency.p50,
      metric.latency.p95,
      metric.latency.p99,
      metric.latency.average,
      metric.fps.current,
      metric.memory.heapUsed,
      metric.sessions.crashRate
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const getDataPointsForTimeRange = (range: string): number => {
    switch (range) {
      case 'hour': return 60;
      case 'day': return 1440;
      case 'week': return 10080;
      case 'month': return 43200;
      default: return 1440;
    }
  };

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      refreshTimer.current = setInterval(loadPerformanceData, refreshInterval);
    } else {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    }

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadPerformanceData]);

  // Initial data load
  useEffect(() => {
    loadPerformanceData();
  }, [loadPerformanceData]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (metrics.length === 0) return null;

    const latest = metrics[metrics.length - 1];
    const previous = metrics[metrics.length - 2];

    return {
      avgLatency: {
        current: latest.latency.average,
        change: previous ? ((latest.latency.average - previous.latency.average) / previous.latency.average) * 100 : 0
      },
      avgFps: {
        current: latest.fps.current,
        change: previous ? ((latest.fps.current - previous.fps.current) / previous.fps.current) * 100 : 0
      },
      crashRate: {
        current: latest.sessions.crashRate,
        change: previous ? latest.sessions.crashRate - previous.sessions.crashRate : 0
      },
      telemetryOptIn: {
        current: latest.telemetry.optInRate,
        change: previous ? latest.telemetry.optInRate - previous.telemetry.optInRate : 0
      }
    };
  }, [metrics]);

  const activeAlerts = alerts.filter(alert => !alert.acknowledged);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');

  return (
    <DashboardContainer>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Performance Dashboard
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="primary"
              />
            }
            label="Auto Refresh"
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            >
              <MenuItem value="1h">1 Hour</MenuItem>
              <MenuItem value="6h">6 Hours</MenuItem>
              <MenuItem value="24h">24 Hours</MenuItem>
              <MenuItem value="7d">7 Days</MenuItem>
              <MenuItem value="30d">30 Days</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={loadPerformanceData} disabled={loading}>
            <Refresh />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Alerts Section */}
      {showAlerts && activeAlerts.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Active Alerts ({activeAlerts.length})
            {criticalAlerts.length > 0 && (
              <Chip
                label={`${criticalAlerts.length} Critical`}
                color="error"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          {activeAlerts.slice(0, 3).map((alert) => (
            <AlertCard key={alert.id} severity={alert.severity === 'critical' ? 'error' : 'warning'}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" color={alert.severity === 'critical' ? 'error' : 'warning'}>
                      {alert.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {alert.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(alert.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setAlerts(prev => prev.map(a => 
                        a.id === alert.id ? { ...a, acknowledged: true } : a
                      ));
                    }}
                  >
                    <CheckCircle />
                  </IconButton>
                </Box>
              </CardContent>
            </AlertCard>
          ))}
        </Box>
      )}

      {/* Summary Cards */}
      {summaryStats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {summaryStats.avgLatency.current.toFixed(1)}ms
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Latency
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    {summaryStats.avgLatency.change > 0 ? <TrendingUp color="error" /> : <TrendingDown color="success" />}
                    <Typography
                      variant="body2"
                      color={summaryStats.avgLatency.change > 0 ? 'error' : 'success'}
                      ml={1}
                    >
                      {Math.abs(summaryStats.avgLatency.change).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </MetricCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {summaryStats.avgFps.current.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      3D Minimap FPS
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    {summaryStats.avgFps.change > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                    <Typography
                      variant="body2"
                      color={summaryStats.avgFps.change > 0 ? 'success' : 'error'}
                      ml={1}
                    >
                      {Math.abs(summaryStats.avgFps.change).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </MetricCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {(100 - summaryStats.crashRate.current).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Crash-Free Sessions
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    {summaryStats.crashRate.change < 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                    <Typography
                      variant="body2"
                      color={summaryStats.crashRate.change < 0 ? 'success' : 'error'}
                      ml={1}
                    >
                      {Math.abs(summaryStats.crashRate.change).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </MetricCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {summaryStats.telemetryOptIn.current.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Telemetry Opt-in Rate
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    {summaryStats.telemetryOptIn.change > 0 ? <TrendingUp color="success" /> : <TrendingDown color="warning" />}
                    <Typography
                      variant="body2"
                      color={summaryStats.telemetryOptIn.change > 0 ? 'success' : 'warning'}
                      ml={1}
                    >
                      {Math.abs(summaryStats.telemetryOptIn.change).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </MetricCard>
          </Grid>
        </Grid>
      )}

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Latency Chart */}
        <Grid item xs={12} lg={6}>
          <MetricCard>
            <CardHeader title="Completion Latency" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    stroke="rgba(255,255,255,0.7)"
                  />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <RechartsTooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="latency.p50" stroke={chartColors.primary} name="P50" strokeWidth={2} />
                  <Line type="monotone" dataKey="latency.p95" stroke={chartColors.warning} name="P95" strokeWidth={2} />
                  <Line type="monotone" dataKey="latency.p99" stroke={chartColors.error} name="P99" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </MetricCard>
        </Grid>

        {/* FPS Chart */}
        <Grid item xs={12} lg={6}>
          <MetricCard>
            <CardHeader title="3D Minimap Performance" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    stroke="rgba(255,255,255,0.7)"
                  />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <RechartsTooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="fps.current" 
                    stroke={chartColors.success} 
                    fill={`${chartColors.success}20`}
                    name="FPS"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </MetricCard>
        </Grid>

        {/* Model Performance Comparison */}
        <Grid item xs={12} lg={6}>
          <MetricCard>
            <CardHeader title="Model Performance Comparison" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.length > 0 ? Object.entries(metrics[metrics.length - 1].models).map(([name, data]) => ({
                  name,
                  latency: data.latency,
                  throughput: data.throughput,
                  errorRate: data.errorRate
                })) : []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="latency" fill={chartColors.primary} name="Latency (ms)" />
                  <Bar dataKey="throughput" fill={chartColors.secondary} name="Throughput" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </MetricCard>
        </Grid>

        {/* Memory Usage */}
        <Grid item xs={12} lg={6}>
          <MetricCard>
            <CardHeader title="Memory Usage" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    stroke="rgba(255,255,255,0.7)"
                  />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <RechartsTooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="memory.heapUsed" 
                    stackId="1"
                    stroke={chartColors.info} 
                    fill={`${chartColors.info}60`}
                    name="Heap Used (MB)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="memory.external" 
                    stackId="1"
                    stroke={chartColors.secondary} 
                    fill={`${chartColors.secondary}60`}
                    name="External (MB)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </MetricCard>
        </Grid>
      </Grid>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Performance Data</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="xlsx">Excel</MenuItem>
                  <MenuItem value="pdf">PDF Report</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={exportOptions.timeRange}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, timeRange: e.target.value as any }))}
                >
                  <MenuItem value="hour">Last Hour</MenuItem>
                  <MenuItem value="day">Last Day</MenuItem>
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={exportData}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <FileDownload />}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {loading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="rgba(0,0,0,0.5)"
          zIndex={9999}
        >
          <CircularProgress size={60} />
        </Box>
      )}
    </DashboardContainer>
  );
};

export default PerformanceDashboard; 