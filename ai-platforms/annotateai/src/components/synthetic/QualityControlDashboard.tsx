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
  Separator 
} from '../../../../../shared/components/ui';
import { 
  Target, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  RefreshCw, 
  Settings, 
  Filter, 
  Search, 
  Calendar, 
  Clock, 
  Star, 
  Heart, 
  Zap, 
  Activity, 
  Database, 
  Cpu, 
  MemoryStick, 
  Gauge, 
  Timer, 
  LineChart, 
  PieChart, 
  BarChart, 
  Layers, 
  Grid, 
  Map, 
  Maximize, 
  Minimize, 
  Plus, 
  Minus, 
  ArrowUp, 
  ArrowDown, 
  ArrowRight, 
  ArrowLeft, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  Beaker, 
  TestTube, 
  Microscope, 
  FlaskConical, 
  Award, 
  Shield, 
  Lock, 
  Users, 
  User, 
  Image, 
  Video, 
  FileText, 
  Folder, 
  FolderOpen, 
  Archive, 
  Trash2, 
  Edit, 
  Save, 
  Copy, 
  Share, 
  ExternalLink 
} from 'lucide-react';

// Types from QualityMetrics backend
interface QualityReport {
  id: string;
  datasetId: string;
  datasetName: string;
  timestamp: Date;
  overallScore: number;
  overallGrade: 'excellent' | 'good' | 'fair' | 'poor';
  metrics: QualityMetricResult[];
  summary: QualitySummary;
  recommendations: string[];
  metadata: QualityMetadata;
  status: 'running' | 'completed' | 'failed';
}

interface QualityMetricResult {
  name: string;
  value: number;
  score: number;
  grade: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  trend: 'up' | 'down' | 'stable';
  history: number[];
  details: QualityMetricDetails;
}

interface QualityMetricDetails {
  distribution: number[];
  samples: QualitySample[];
  outliers: QualityOutlier[];
  benchmarks: QualityBenchmark[];
}

interface QualitySample {
  id: string;
  value: number;
  grade: 'excellent' | 'good' | 'fair' | 'poor';
  thumbnail?: string;
  metadata: Record<string, any>;
}

interface QualityOutlier {
  id: string;
  value: number;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

interface QualityBenchmark {
  name: string;
  value: number;
  type: 'industry' | 'internal' | 'target';
  description: string;
}

interface QualitySummary {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  risks: string[];
  confidence: number;
}

interface QualityMetadata {
  evaluationTime: number;
  datasetSize: number;
  sampleCount: number;
  metricsComputed: string[];
  processingTime: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    gpu: number;
  };
}

interface QualityThresholds {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

interface QualityFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  grades: string[];
  metrics: string[];
  datasets: string[];
  minScore: number;
  maxScore: number;
}

interface QualityTrend {
  metric: string;
  period: 'day' | 'week' | 'month' | 'quarter';
  data: TrendDataPoint[];
  direction: 'up' | 'down' | 'stable';
  changePercent: number;
}

interface TrendDataPoint {
  timestamp: Date;
  value: number;
  grade: 'excellent' | 'good' | 'fair' | 'poor';
}

interface QualityAlert {
  id: string;
  type: 'threshold' | 'trend' | 'outlier' | 'failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
}

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equal_to' | 'between';
  threshold: number | [number, number];
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  autoFix: boolean;
}

export default function QualityControlDashboard() {
  // State management
  const [reports, setReports] = useState<QualityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<QualityReport | null>(null);
  const [trends, setTrends] = useState<QualityTrend[]>([]);
  const [alerts, setAlerts] = useState<QualityAlert[]>([]);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [filter, setFilter] = useState<QualityFilter>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    grades: ['excellent', 'good', 'fair', 'poor'],
    metrics: [],
    datasets: [],
    minScore: 0,
    maxScore: 100
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [sortBy, setSortBy] = useState<'timestamp' | 'score' | 'grade'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Backend connections
  const qualityMetricsRef = useRef<any>(null);
  const alertingRef = useRef<any>(null);
  const validationRef = useRef<any>(null);

  // Initialize backend connections
  useEffect(() => {
    const initializeBackends = async () => {
      try {
        // Initialize quality metrics service
        qualityMetricsRef.current = {
          evaluateQuality: async (data: any[], config: any) => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return generateMockQualityReport();
          },
          getQualityReports: async (filter: QualityFilter) => {
            return generateMockReports();
          },
          getQualityTrends: async (metrics: string[], period: string) => {
            return generateMockTrends();
          }
        };

        // Initialize alerting service
        alertingRef.current = {
          getAlerts: async () => {
            return generateMockAlerts();
          },
          acknowledgeAlert: async (alertId: string) => {
            setAlerts(prev => prev.map(a => 
              a.id === alertId ? { ...a, acknowledged: true } : a
            ));
          }
        };

        // Initialize validation service
        validationRef.current = {
          getValidationRules: async () => {
            return generateMockValidationRules();
          },
          validateDataset: async (datasetId: string, rules: ValidationRule[]) => {
            return {
              passed: Math.random() > 0.3,
              violations: Math.floor(Math.random() * 5),
              details: []
            };
          }
        };

        // Load initial data
        await loadData();

      } catch (error) {
        console.error('Failed to initialize quality control backends:', error);
        setError('Failed to initialize quality control dashboard');
      }
    };

    initializeBackends();
  }, []);

  // Load data based on current filter
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reportsData, trendsData, alertsData, rulesData] = await Promise.all([
        qualityMetricsRef.current?.getQualityReports(filter),
        qualityMetricsRef.current?.getQualityTrends(['fid', 'is', 'lpips', 'ssim'], 'week'),
        alertingRef.current?.getAlerts(),
        validationRef.current?.getValidationRules()
      ]);

      setReports(reportsData || []);
      setTrends(trendsData || []);
      setAlerts(alertsData || []);
      setValidationRules(rulesData || []);

      if (reportsData && reportsData.length > 0) {
        setSelectedReport(reportsData[0]);
      }

    } catch (error) {
      console.error('Failed to load quality data:', error);
      setError('Failed to load quality data');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await alertingRef.current?.acknowledgeAlert(alertId);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }, []);

  // Run quality evaluation
  const runQualityEvaluation = useCallback(async (datasetId: string) => {
    setLoading(true);
    try {
      const report = await qualityMetricsRef.current?.evaluateQuality(
        [], // mock data
        { metrics: ['fid', 'is', 'lpips', 'ssim'] }
      );
      
      setReports(prev => [report, ...prev]);
      setSelectedReport(report);
      
    } catch (error) {
      console.error('Failed to run quality evaluation:', error);
      setError('Failed to run quality evaluation');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort reports
  const filteredReports = reports.filter(report => {
    const matchesGrade = filter.grades.includes(report.overallGrade);
    const matchesScore = report.overallScore >= filter.minScore && report.overallScore <= filter.maxScore;
    const matchesDate = report.timestamp >= filter.dateRange.start && report.timestamp <= filter.dateRange.end;
    
    return matchesGrade && matchesScore && matchesDate;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'timestamp':
        comparison = a.timestamp.getTime() - b.timestamp.getTime();
        break;
      case 'score':
        comparison = a.overallScore - b.overallScore;
        break;
      case 'grade':
        const gradeOrder = { excellent: 4, good: 3, fair: 2, poor: 1 };
        comparison = gradeOrder[a.overallGrade] - gradeOrder[b.overallGrade];
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <ArrowRight className="h-4 w-4 text-gray-500" />;
      default: return <ArrowRight className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get alert severity color
  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Mock data generators
  const generateMockQualityReport = (): QualityReport => {
    return {
      id: `report_${Date.now()}`,
      datasetId: 'dataset_1',
      datasetName: 'Generated Dataset',
      timestamp: new Date(),
      overallScore: 75 + Math.random() * 20,
      overallGrade: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)] as any,
      metrics: [
        {
          name: 'FID',
          value: 20 + Math.random() * 40,
          score: 70 + Math.random() * 25,
          grade: 'good' as any,
          description: 'Fréchet Inception Distance',
          trend: 'stable' as any,
          history: Array.from({ length: 10 }, () => 70 + Math.random() * 25),
          details: {
            distribution: Array.from({ length: 20 }, () => Math.random()),
            samples: [],
            outliers: [],
            benchmarks: []
          }
        },
        {
          name: 'IS',
          value: 3 + Math.random() * 2,
          score: 80 + Math.random() * 15,
          grade: 'excellent' as any,
          description: 'Inception Score',
          trend: 'up' as any,
          history: Array.from({ length: 10 }, () => 80 + Math.random() * 15),
          details: {
            distribution: Array.from({ length: 20 }, () => Math.random()),
            samples: [],
            outliers: [],
            benchmarks: []
          }
        }
      ],
      summary: {
        strengths: ['High diversity', 'Good visual quality'],
        weaknesses: ['Some artifacts', 'Limited pose variation'],
        improvements: ['Increase resolution', 'Add more training data'],
        risks: ['Overfitting', 'Mode collapse'],
        confidence: 0.85
      },
      recommendations: [
        'Increase generation steps for better quality',
        'Use different random seeds for more diversity',
        'Consider fine-tuning on domain-specific data'
      ],
      metadata: {
        evaluationTime: 2000 + Math.random() * 3000,
        datasetSize: 1000,
        sampleCount: 100,
        metricsComputed: ['FID', 'IS'],
        processingTime: 5000,
        resourceUsage: {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          gpu: Math.random() * 100
        }
      },
      status: 'completed'
    };
  };

  const generateMockReports = (): QualityReport[] => {
    return Array.from({ length: 10 }, () => generateMockQualityReport());
  };

  const generateMockTrends = (): QualityTrend[] => {
    return ['FID', 'IS', 'LPIPS', 'SSIM'].map(metric => ({
      metric,
      period: 'week' as any,
      data: Array.from({ length: 7 }, (_, i) => ({
        timestamp: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
        value: 70 + Math.random() * 25,
        grade: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)] as any
      })),
      direction: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
      changePercent: -10 + Math.random() * 20
    }));
  };

  const generateMockAlerts = (): QualityAlert[] => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `alert_${i}`,
      type: ['threshold', 'trend', 'outlier', 'failure'][Math.floor(Math.random() * 4)] as any,
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
      message: `Quality alert ${i + 1}`,
      metric: ['FID', 'IS', 'LPIPS', 'SSIM'][Math.floor(Math.random() * 4)],
      value: Math.random() * 100,
      threshold: 75,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      acknowledged: Math.random() > 0.5
    }));
  };

  const generateMockValidationRules = (): ValidationRule[] => {
    return [
      {
        id: 'rule_1',
        name: 'FID Threshold',
        description: 'FID score must be below 30',
        metric: 'FID',
        condition: 'less_than',
        threshold: 30,
        severity: 'high',
        enabled: true,
        autoFix: false
      },
      {
        id: 'rule_2',
        name: 'IS Minimum',
        description: 'IS score must be above 3.0',
        metric: 'IS',
        condition: 'greater_than',
        threshold: 3.0,
        severity: 'medium',
        enabled: true,
        autoFix: false
      }
    ];
  };

  return (
    <div className="quality-control-dashboard space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Control Dashboard</h2>
          <p className="text-gray-600">Comprehensive quality metrics and validation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => runQualityEvaluation('dataset_1')} disabled={loading}>
            <Target className="h-4 w-4 mr-2" />
            Run Evaluation
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

      {/* Quality Alerts */}
      {alerts.filter(a => !a.acknowledged).length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {alerts.filter(a => !a.acknowledged).length} unacknowledged quality alerts require attention
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
                <p className="text-2xl font-bold">
                  {reports.length > 0 ? (reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length).toFixed(1) : '0'}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold">{alerts.filter(a => !a.acknowledged).length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Validation Rules</p>
                <p className="text-2xl font-bold">{validationRules.filter(r => r.enabled).length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quality Reports
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="timestamp">Date</SelectItem>
                      <SelectItem value="score">Score</SelectItem>
                      <SelectItem value="grade">Grade</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {sortedReports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 rounded border cursor-pointer transition-all ${
                        selectedReport?.id === report.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getGradeColor(report.overallGrade)} text-white`}>
                            {report.overallGrade}
                          </Badge>
                          <span className="font-medium">{report.datasetName}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {report.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{report.overallScore.toFixed(1)}%</div>
                        <div className="flex items-center gap-2">
                          {report.metrics.map((metric, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <span className="text-xs font-medium">{metric.name}</span>
                              {getTrendIcon(metric.trend)}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Progress value={report.overallScore} className="mt-2" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Quality Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Quality Alerts ({alerts.filter(a => !a.acknowledged).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {alerts.filter(a => !a.acknowledged).map((alert) => (
                    <div key={alert.id} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={`${getAlertSeverityColor(alert.severity)} text-white`}>
                          {alert.severity}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-sm">{alert.message}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {alert.metric}: {alert.value.toFixed(2)} (threshold: {alert.threshold})
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quality Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quality Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trends.map((trend) => (
                  <div key={trend.metric} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{trend.metric}</div>
                      <div className="text-sm text-gray-600">
                        {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend.direction)}
                      <span className="text-sm font-medium">
                        {trend.data[trend.data.length - 1]?.value.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Validation Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Validation Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {validationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-gray-600">{rule.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getAlertSeverityColor(rule.severity)} text-white`}>
                        {rule.severity}
                      </Badge>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => {
                          setValidationRules(prev => prev.map(r => 
                            r.id === rule.id ? { ...r, enabled: checked } : r
                          ));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Report View */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Quality Report Details - {selectedReport.datasetName}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${getGradeColor(selectedReport.overallGrade)} text-white`}>
                  {selectedReport.overallGrade}
                </Badge>
                <span className="text-2xl font-bold">{selectedReport.overallScore.toFixed(1)}%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="metrics" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedReport.metrics.map((metric, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{metric.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getGradeColor(metric.grade)} text-white`}>
                              {metric.grade}
                            </Badge>
                            {getTrendIcon(metric.trend)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Score</span>
                            <span className="text-2xl font-bold">{metric.score.toFixed(1)}%</span>
                          </div>
                          <Progress value={metric.score} />
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Value</span>
                            <span className="font-medium">{metric.value.toFixed(3)}</span>
                          </div>
                          <div className="text-sm text-gray-600">{metric.description}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-green-600">Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedReport.summary.strengths.map((strength, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-red-600">Weaknesses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedReport.summary.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-600">Improvements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedReport.summary.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <ArrowUp className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-orange-600">Risks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedReport.summary.risks.map((risk, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Confidence Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Progress value={selectedReport.summary.confidence * 100} className="flex-1" />
                      <span className="text-2xl font-bold">{(selectedReport.summary.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-3">
                  {selectedReport.recommendations.map((recommendation, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <div className="font-medium mb-2">Recommendation {index + 1}</div>
                            <div className="text-sm text-gray-600">{recommendation}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedReport.metadata.datasetSize.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Dataset Size</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedReport.metadata.sampleCount.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Samples Analyzed</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{(selectedReport.metadata.evaluationTime / 1000).toFixed(1)}s</div>
                        <div className="text-sm text-gray-600">Evaluation Time</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedReport.metadata.resourceUsage.cpu.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">CPU Usage</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedReport.metadata.resourceUsage.memory.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Memory Usage</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedReport.metadata.resourceUsage.gpu.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">GPU Usage</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Metrics Computed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.metadata.metricsComputed.map((metric, index) => (
                        <Badge key={index} variant="outline">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 