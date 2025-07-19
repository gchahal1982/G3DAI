/**
 * AnalyticsDashboard.tsx
 * 
 * Comprehensive analytics dashboard for CodeForge with real-time monitoring.
 * Provides usage metrics, performance charts, cost tracking, and user insights.
 * 
 * Features:
 * - Usage metrics visualizations with interactive charts
 * - Real-time performance charts with live updates
 * - Model analytics dashboard with performance tracking
 * - Cost tracking with alerts and budget management
 * - User insights segmentation and cohort analysis
 * - A/B testing framework with experiment management
 * - Export tools for CSV and API data extraction
 * - Configurable alerting system with notifications
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  LinearProgress,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  Speed,
  Memory,
  AttachMoney,
  Group,
  Science,
  Download,
  Notifications,
  Refresh,
  Settings,
  FilterList,
  Share,
  Warning,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';

// Types and Interfaces
interface MetricData {
  timestamp: number;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

interface PerformanceMetrics {
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  gpuUsage?: number;
}

interface ModelAnalytics {
  modelId: string;
  name: string;
  requests: number;
  averageLatency: number;
  successRate: number;
  cost: number;
  lastUsed: number;
  popularity: number;
}

interface CostData {
  period: string;
  amount: number;
  breakdown: {
    compute: number;
    storage: number;
    network: number;
    apiCalls: number;
  };
  budget: number;
  alerts: CostAlert[];
}

interface CostAlert {
  id: string;
  type: 'warning' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: number;
}

interface UserSegment {
  id: string;
  name: string;
  criteria: Record<string, any>;
  userCount: number;
  averageUsage: number;
  retention: number;
  revenue: number;
}

interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  startDate: number;
  endDate?: number;
  variants: ABTestVariant[];
  metrics: ABTestMetric[];
  confidence: number;
  winner?: string;
}

interface ABTestVariant {
  id: string;
  name: string;
  allocation: number;
  users: number;
  conversions: number;
  conversionRate: number;
}

interface ABTestMetric {
  name: string;
  baseline: number;
  variants: Record<string, number>;
  significance: number;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals';
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  notifications: string[];
}

interface ExportOptions {
  format: 'csv' | 'json' | 'api';
  dateRange: {
    start: number;
    end: number;
  };
  metrics: string[];
  filters: Record<string, any>;
}

// Chart Components
const LineChart: React.FC<{ data: MetricData[]; title: string; color?: string }> = ({ 
  data, 
  title, 
  color = '#1976d2' 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <Box sx={{ height: 200, position: 'relative' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <svg width="100%" height="150" style={{ border: '1px solid #e0e0e0' }}>
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = ((maxValue - point.value) / range) * 130 + 10;
          
          if (index === 0) return null;
          
          const prevPoint = data[index - 1];
          const prevX = ((index - 1) / (data.length - 1)) * 100;
          const prevY = ((maxValue - prevPoint.value) / range) * 130 + 10;
          
          return (
            <line
              key={index}
              x1={`${prevX}%`}
              y1={prevY}
              x2={`${x}%`}
              y2={y}
              stroke={color}
              strokeWidth="2"
            />
          );
        })}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = ((maxValue - point.value) / range) * 130 + 10;
          
          return (
            <circle
              key={index}
              cx={`${x}%`}
              cy={y}
              r="3"
              fill={color}
            />
          );
        })}
      </svg>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="caption">{new Date(data[0]?.timestamp).toLocaleTimeString()}</Typography>
        <Typography variant="caption">{new Date(data[data.length - 1]?.timestamp).toLocaleTimeString()}</Typography>
      </Box>
    </Box>
  );
};

const BarChart: React.FC<{ data: MetricData[]; title: string; color?: string }> = ({ 
  data, 
  title, 
  color = '#1976d2' 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Box sx={{ height: 200 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'end', height: 150, gap: 1 }}>
        {data.map((point, index) => {
          const height = (point.value / maxValue) * 130;
          
          return (
            <Box
              key={index}
              sx={{
                flex: 1,
                backgroundColor: color,
                height: height,
                borderRadius: '2px 2px 0 0',
                position: 'relative'
              }}
            >
              <Tooltip title={`${point.label || index}: ${point.value}`}>
                <Box sx={{ height: '100%', cursor: 'pointer' }} />
              </Tooltip>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

const PieChart: React.FC<{ data: MetricData[]; title: string }> = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#1976d2', '#dc004e', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3'];

  let currentAngle = 0;
  const slices = data.map((item, index) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return {
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      color: colors[index % colors.length],
      label: item.label || `Item ${index + 1}`,
      value: item.value,
      percentage: ((item.value / total) * 100).toFixed(1)
    };
  });

  return (
    <Box sx={{ height: 200 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <svg width="150" height="150" viewBox="0 0 100 100">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.path}
              fill={slice.color}
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </svg>
        <Box>
          {slices.map((slice, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: slice.color,
                  mr: 1,
                  borderRadius: 1
                }}
              />
              <Typography variant="caption">
                {slice.label}: {slice.percentage}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// Main Dashboard Component
export const AnalyticsDashboard: React.FC = () => {
  // State management
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['latency', 'throughput', 'cost']);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'costs' | 'users' | 'experiments'>('overview');

  // Mock data - in real implementation, this would come from APIs
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    latency: { p50: 45, p95: 120, p99: 180 },
    throughput: 1250,
    errorRate: 0.2,
    memoryUsage: 68,
    cpuUsage: 45,
    gpuUsage: 72
  });

  const [usageData, setUsageData] = useState<MetricData[]>([
    { timestamp: Date.now() - 3600000, value: 100, label: '1h ago' },
    { timestamp: Date.now() - 1800000, value: 150, label: '30m ago' },
    { timestamp: Date.now() - 900000, value: 200, label: '15m ago' },
    { timestamp: Date.now() - 300000, value: 175, label: '5m ago' },
    { timestamp: Date.now(), value: 225, label: 'now' }
  ]);

  const [modelAnalytics, setModelAnalytics] = useState<ModelAnalytics[]>([
    {
      modelId: 'qwen3-14b',
      name: 'Qwen3-Coder 14B',
      requests: 15420,
      averageLatency: 45,
      successRate: 99.2,
      cost: 245.80,
      lastUsed: Date.now() - 300000,
      popularity: 92
    },
    {
      modelId: 'phi-4-mini',
      name: 'Phi-4 Mini',
      requests: 8750,
      averageLatency: 28,
      successRate: 98.8,
      cost: 120.50,
      lastUsed: Date.now() - 600000,
      popularity: 78
    },
    {
      modelId: 'deepseek-r1',
      name: 'DeepSeek R1',
      requests: 3200,
      averageLatency: 180,
      successRate: 97.5,
      cost: 890.25,
      lastUsed: Date.now() - 900000,
      popularity: 65
    }
  ]);

  const [costData, setCostData] = useState<CostData>({
    period: 'current_month',
    amount: 1256.55,
    breakdown: {
      compute: 890.25,
      storage: 156.30,
      network: 89.50,
      apiCalls: 120.50
    },
    budget: 2000,
    alerts: [
      {
        id: 'cost_alert_1',
        type: 'warning',
        message: 'Monthly cost approaching 70% of budget',
        threshold: 1400,
        currentValue: 1256.55,
        timestamp: Date.now() - 3600000
      }
    ]
  });

  const [userSegments, setUserSegments] = useState<UserSegment[]>([
    {
      id: 'power_users',
      name: 'Power Users',
      criteria: { usage_hours: '>40', features_used: '>10' },
      userCount: 150,
      averageUsage: 65.5,
      retention: 95.2,
      revenue: 4500
    },
    {
      id: 'casual_users',
      name: 'Casual Users',
      criteria: { usage_hours: '5-20', features_used: '3-8' },
      userCount: 890,
      averageUsage: 12.3,
      retention: 78.5,
      revenue: 8900
    },
    {
      id: 'trial_users',
      name: 'Trial Users',
      criteria: { plan: 'trial', days_active: '<30' },
      userCount: 234,
      averageUsage: 5.8,
      retention: 42.1,
      revenue: 0
    }
  ]);

  const [abTests, setAbTests] = useState<ABTest[]>([
    {
      id: 'test_1',
      name: 'New Editor Theme',
      status: 'running',
      startDate: Date.now() - 86400000 * 7,
      variants: [
        { id: 'control', name: 'Control', allocation: 50, users: 500, conversions: 45, conversionRate: 9.0 },
        { id: 'variant_a', name: 'Dark Theme', allocation: 50, users: 500, conversions: 58, conversionRate: 11.6 }
      ],
      metrics: [
        { name: 'Conversion Rate', baseline: 9.0, variants: { variant_a: 11.6 }, significance: 85.2 }
      ],
      confidence: 85.2
    }
  ]);

  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: 'alert_1',
      name: 'High Latency Alert',
      metric: 'latency_p95',
      condition: 'greater_than',
      threshold: 150,
      severity: 'warning',
      enabled: true,
      notifications: ['email', 'slack']
    },
    {
      id: 'alert_2',
      name: 'Error Rate Alert',
      metric: 'error_rate',
      condition: 'greater_than',
      threshold: 1.0,
      severity: 'critical',
      enabled: true,
      notifications: ['email', 'slack', 'pagerduty']
    }
  ]);

  // Real-time updates
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(() => {
      // Update performance metrics with new data
      setPerformanceMetrics(prev => ({
        ...prev,
        latency: {
          p50: prev.latency.p50 + (Math.random() - 0.5) * 10,
          p95: prev.latency.p95 + (Math.random() - 0.5) * 20,
          p99: prev.latency.p99 + (Math.random() - 0.5) * 30
        },
        throughput: prev.throughput + (Math.random() - 0.5) * 100,
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5))
      }));

      // Update usage data
      setUsageData(prev => [
        ...prev.slice(1),
        {
          timestamp: Date.now(),
          value: prev[prev.length - 1].value + (Math.random() - 0.5) * 50,
          label: 'now'
        }
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeUpdates]);

  // Export functionality
  const handleExport = useCallback((options: ExportOptions) => {
    const data = {
      timestamp: Date.now(),
      timeRange,
      metrics: selectedMetrics,
      performance: performanceMetrics,
      models: modelAnalytics,
      costs: costData,
      users: userSegments,
      experiments: abTests
    };

    if (options.format === 'csv') {
      const csv = convertToCSV(data);
      downloadFile(csv, 'analytics-data.csv', 'text/csv');
    } else if (options.format === 'json') {
      const json = JSON.stringify(data, null, 2);
      downloadFile(json, 'analytics-data.json', 'application/json');
    } else if (options.format === 'api') {
      // Generate API endpoint URL
      const apiUrl = `/api/analytics/export?${new URLSearchParams({
        start: options.dateRange.start.toString(),
        end: options.dateRange.end.toString(),
        metrics: options.metrics.join(',')
      })}`;
      
      navigator.clipboard.writeText(apiUrl);
      alert('API URL copied to clipboard');
    }

    setShowExportDialog(false);
  }, [timeRange, selectedMetrics, performanceMetrics, modelAnalytics, costData, userSegments, abTests]);

  const convertToCSV = (data: any): string => {
    const rows = [
      ['Metric', 'Value', 'Timestamp'],
      ['P50 Latency', data.performance.latency.p50, new Date().toISOString()],
      ['P95 Latency', data.performance.latency.p95, new Date().toISOString()],
      ['Throughput', data.performance.throughput, new Date().toISOString()],
      ['Error Rate', data.performance.errorRate, new Date().toISOString()],
      ['Memory Usage', data.performance.memoryUsage, new Date().toISOString()],
      ['Total Cost', data.costs.amount, new Date().toISOString()]
    ];

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Alert management
  const createAlert = useCallback((rule: Omit<AlertRule, 'id'>) => {
    const newAlert: AlertRule = {
      ...rule,
      id: `alert_${Date.now()}`
    };
    
    setAlertRules(prev => [...prev, newAlert]);
    setShowAlertDialog(false);
  }, []);

  const toggleAlert = useCallback((alertId: string) => {
    setAlertRules(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert
    ));
  }, []);

  // Render helper components
  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, color: string, trend?: number) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp 
                  sx={{ 
                    color: trend > 0 ? 'success.main' : 'error.main',
                    fontSize: 16,
                    mr: 0.5,
                    transform: trend < 0 ? 'rotate(180deg)' : 'none'
                  }} 
                />
                <Typography 
                  variant="caption" 
                  sx={{ color: trend > 0 ? 'success.main' : 'error.main' }}
                >
                  {Math.abs(trend)}% vs last period
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ color, fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12} sm={6} md={3}>
        {renderMetricCard(
          'P95 Latency',
          `${performanceMetrics.latency.p95.toFixed(0)}ms`,
          <Speed />,
          '#1976d2',
          -5.2
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderMetricCard(
          'Throughput',
          `${performanceMetrics.throughput.toLocaleString()}/s`,
          <TrendingUp />,
          '#2e7d32',
          12.8
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderMetricCard(
          'Memory Usage',
          `${performanceMetrics.memoryUsage.toFixed(1)}%`,
          <Memory />,
          '#ed6c02',
          3.1
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderMetricCard(
          'Monthly Cost',
          `$${costData.amount.toLocaleString()}`,
          <AttachMoney />,
          '#9c27b0',
          8.5
        )}
      </Grid>

      {/* Performance Charts */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <LineChart 
              data={usageData} 
              title="Request Volume" 
              color="#1976d2"
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <BarChart 
              data={[
                { timestamp: Date.now(), value: performanceMetrics.latency.p50, label: 'P50' },
                { timestamp: Date.now(), value: performanceMetrics.latency.p95, label: 'P95' },
                { timestamp: Date.now(), value: performanceMetrics.latency.p99, label: 'P99' }
              ]} 
              title="Latency Percentiles (ms)" 
              color="#dc004e"
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Cost Breakdown */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <PieChart 
              data={[
                { timestamp: Date.now(), value: costData.breakdown.compute, label: 'Compute' },
                { timestamp: Date.now(), value: costData.breakdown.storage, label: 'Storage' },
                { timestamp: Date.now(), value: costData.breakdown.network, label: 'Network' },
                { timestamp: Date.now(), value: costData.breakdown.apiCalls, label: 'API Calls' }
              ]} 
              title="Cost Breakdown"
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Alerts */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Alerts
              <Badge badgeContent={costData.alerts.length} color="error" sx={{ ml: 2 }} />
            </Typography>
            {costData.alerts.map(alert => (
              <Alert 
                key={alert.id} 
                severity={alert.type} 
                sx={{ mb: 1 }}
                action={
                  <IconButton size="small">
                    <Settings />
                  </IconButton>
                }
              >
                {alert.message}
              </Alert>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderModelsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Model Performance Analytics
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Model</TableCell>
                    <TableCell align="right">Requests</TableCell>
                    <TableCell align="right">Avg Latency</TableCell>
                    <TableCell align="right">Success Rate</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell align="right">Popularity</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modelAnalytics.map((model) => (
                    <TableRow key={model.modelId}>
                      <TableCell component="th" scope="row">
                        <Box>
                          <Typography variant="subtitle2">{model.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {model.modelId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{model.requests.toLocaleString()}</TableCell>
                      <TableCell align="right">{model.averageLatency}ms</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {model.successRate}%
                          {model.successRate > 99 ? (
                            <CheckCircle sx={{ color: 'success.main', ml: 1, fontSize: 16 }} />
                          ) : model.successRate > 95 ? (
                            <Warning sx={{ color: 'warning.main', ml: 1, fontSize: 16 }} />
                          ) : (
                            <ErrorIcon sx={{ color: 'error.main', ml: 1, fontSize: 16 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">${model.cost.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={model.popularity} 
                            sx={{ width: 60, mr: 1 }}
                          />
                          {model.popularity}%
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={Date.now() - model.lastUsed < 3600000 ? 'Active' : 'Idle'}
                          color={Date.now() - model.lastUsed < 3600000 ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderCostsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cost Tracking & Budget Management
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Budget Utilization
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(costData.amount / costData.budget) * 100}
                sx={{ height: 10, borderRadius: 5 }}
                color={costData.amount / costData.budget > 0.8 ? 'error' : 'primary'}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                ${costData.amount.toLocaleString()} of ${costData.budget.toLocaleString()} budget used 
                ({((costData.amount / costData.budget) * 100).toFixed(1)}%)
              </Typography>
            </Box>
            
            <LineChart 
              data={[
                { timestamp: Date.now() - 2592000000, value: 800, label: '30d ago' },
                { timestamp: Date.now() - 1814400000, value: 950, label: '21d ago' },
                { timestamp: Date.now() - 1209600000, value: 1100, label: '14d ago' },
                { timestamp: Date.now() - 604800000, value: 1200, label: '7d ago' },
                { timestamp: Date.now(), value: costData.amount, label: 'now' }
              ]} 
              title="Cost Trend (30 days)" 
              color="#9c27b0"
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cost Breakdown
            </Typography>
            <Box sx={{ mb: 2 }}>
              {Object.entries(costData.breakdown).map(([category, amount]) => (
                <Box key={category} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {category}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      ${amount.toFixed(2)}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(amount / costData.amount) * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderUsersTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Segmentation Analysis
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Segment</TableCell>
                    <TableCell align="right">Users</TableCell>
                    <TableCell align="right">Avg Usage</TableCell>
                    <TableCell align="right">Retention</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Value Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userSegments.map((segment) => (
                    <TableRow key={segment.id}>
                      <TableCell component="th" scope="row">
                        <Box>
                          <Typography variant="subtitle2">{segment.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {Object.entries(segment.criteria).map(([key, value]) => 
                              `${key}: ${value}`
                            ).join(', ')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{segment.userCount.toLocaleString()}</TableCell>
                      <TableCell align="right">{segment.averageUsage.toFixed(1)}h</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={segment.retention} 
                            sx={{ width: 60, mr: 1 }}
                            color={segment.retention > 80 ? 'success' : segment.retention > 60 ? 'warning' : 'error'}
                          />
                          {segment.retention.toFixed(1)}%
                        </Box>
                      </TableCell>
                      <TableCell align="right">${segment.revenue.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        {((segment.revenue / segment.userCount) * (segment.retention / 100)).toFixed(0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderExperimentsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                A/B Testing Framework
              </Typography>
              <Button variant="contained" startIcon={<Science />}>
                New Experiment
              </Button>
            </Box>
            
            {abTests.map((test) => (
              <Box key={test.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{test.name}</Typography>
                  <Chip 
                    label={test.status} 
                    color={test.status === 'running' ? 'success' : test.status === 'completed' ? 'primary' : 'default'}
                  />
                </Box>
                
                <Grid container spacing={2}>
                  {test.variants.map((variant) => (
                    <Grid item xs={12} md={6} key={variant.id}>
                      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>{variant.name}</Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {variant.users} users ({variant.allocation}% allocation)
                        </Typography>
                        <Typography variant="h4" color={variant.id === test.winner ? 'success.main' : 'text.primary'}>
                          {variant.conversionRate.toFixed(1)}%
                        </Typography>
                        <Typography variant="caption">Conversion Rate</Typography>
                        {variant.id === test.winner && (
                          <Chip label="Winner" color="success" size="small" sx={{ ml: 1 }} />
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Confidence: {test.confidence.toFixed(1)}% | 
                    Started: {new Date(test.startDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Export Dialog
  const ExportDialog = () => (
    <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>Export Analytics Data</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select defaultValue="csv">
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="api">API Endpoint</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              defaultValue={new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0]}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Select Metrics</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['latency', 'throughput', 'cost', 'errors', 'users', 'models'].map(metric => (
                <Chip
                  key={metric}
                  label={metric}
                  onClick={() => {}}
                  color={selectedMetrics.includes(metric) ? 'primary' : 'default'}
                  variant={selectedMetrics.includes(metric) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
        <Button 
          onClick={() => handleExport({
            format: 'csv',
            dateRange: { start: Date.now() - 86400000 * 30, end: Date.now() },
            metrics: selectedMetrics,
            filters: {}
          })} 
          variant="contained"
        >
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Alert Dialog
  const AlertDialog = () => (
    <Dialog open={showAlertDialog} onClose={() => setShowAlertDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>Configure Alert Rules</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Active Alert Rules
        </Typography>
        {alertRules.map((rule) => (
          <Box key={rule.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">{rule.name}</Typography>
              <Switch 
                checked={rule.enabled} 
                onChange={() => toggleAlert(rule.id)}
                color="primary"
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              {rule.metric} {rule.condition.replace('_', ' ')} {rule.threshold}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={rule.severity} 
                color={rule.severity === 'critical' ? 'error' : rule.severity === 'warning' ? 'warning' : 'info'}
                size="small"
              />
              {rule.notifications.map(notification => (
                <Chip 
                  key={notification}
                  label={notification} 
                  size="small" 
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              ))}
            </Box>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowAlertDialog(false)}>Close</Button>
        <Button variant="contained">Add New Rule</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small">
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                label="Time Range"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={realTimeUpdates}
                  onChange={(e) => setRealTimeUpdates(e.target.checked)}
                  color="primary"
                />
              }
              label="Real-time Updates"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => setShowExportDialog(true)}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<Notifications />}
              onClick={() => setShowAlertDialog(true)}
            >
              Alerts
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {[
            { key: 'overview', label: 'Overview', icon: <TrendingUp /> },
            { key: 'models', label: 'Models', icon: <Speed /> },
            { key: 'costs', label: 'Costs', icon: <AttachMoney /> },
            { key: 'users', label: 'Users', icon: <Group /> },
            { key: 'experiments', label: 'A/B Tests', icon: <Science /> }
          ].map(tab => (
            <Button
              key={tab.key}
              startIcon={tab.icon}
              onClick={() => setActiveTab(tab.key as any)}
              variant={activeTab === tab.key ? 'contained' : 'text'}
              sx={{ textTransform: 'none' }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'models' && renderModelsTab()}
      {activeTab === 'costs' && renderCostsTab()}
      {activeTab === 'users' && renderUsersTab()}
      {activeTab === 'experiments' && renderExperimentsTab()}

      {/* Dialogs */}
      <ExportDialog />
      <AlertDialog />
    </Box>
  );
};

export default AnalyticsDashboard; 