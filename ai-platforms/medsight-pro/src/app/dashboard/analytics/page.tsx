'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  Users, 
  Clock,
  Target,
  Zap,
  Globe,
  PieChart,
  LineChart,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Settings,
  Eye,
  AlertTriangle,
  CheckCircle,
  Brain,
  Heart,
  Stethoscope,
  FileText,
  Database,
  Server,
  Shield,
  Award,
  Gauge,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search
} from 'lucide-react';

// Import analytics components
import MedicalInsights from '@/components/analytics/MedicalInsights';
import PatientAnalytics from '@/components/analytics/PatientAnalytics';
import DiagnosticAnalytics from '@/components/analytics/DiagnosticAnalytics';
import PerformanceMetrics from '@/components/analytics/PerformanceMetrics';
import PredictiveAnalytics from '@/components/analytics/PredictiveAnalytics';
import RealtimeMonitoring from '@/components/analytics/RealtimeMonitoring';
import ComplianceAnalytics from '@/components/analytics/ComplianceAnalytics';

interface AnalyticsMetrics {
  medical: {
    totalPatients: number;
    activeStudies: number;
    completedScans: number;
    diagnosticAccuracy: number;
    averageProcessingTime: number;
    aiAssistanceUsage: number;
    criticalFindings: number;
    followUpRequired: number;
  };
  performance: {
    systemUptime: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
    cacheHitRate: number;
    apiCallsPerMinute: number;
    concurrentUsers: number;
    resourceUtilization: number;
  };
  patient: {
    newPatients: number;
    returningPatients: number;
    appointmentCompletionRate: number;
    patientSatisfaction: number;
    averageWaitTime: number;
    noShowRate: number;
    emergencyAdmissions: number;
    dischargeRate: number;
  };
  diagnostic: {
    imagingStudies: number;
    labResults: number;
    pathologyReports: number;
    radiologyTurnaround: number;
    criticalValueAlerts: number;
    aiDetectionRate: number;
    falsePositiveRate: number;
    qualityScore: number;
  };
  compliance: {
    hipaaScore: number;
    auditScore: number;
    dataRetentionCompliance: number;
    accessControlScore: number;
    encryptionCompliance: number;
    backupCompliance: number;
    incidentCount: number;
    trainingCompletionRate: number;
  };
  predictions: {
    patientVolumeForecast: number[];
    resourceDemandForecast: number[];
    riskScores: {
      operational: number;
      clinical: number;
      financial: number;
      compliance: number;
    };
    trendAnalysis: {
      direction: 'up' | 'down' | 'stable';
      confidence: number;
      timeframe: string;
    };
  };
}

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'medical' | 'system' | 'compliance' | 'performance';
  title: string;
  description: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired: boolean;
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState(['medical', 'performance']);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAnalyticsData();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    try {
      // Mock data - replace with actual API calls
      const mockMetrics: AnalyticsMetrics = {
        medical: {
          totalPatients: 18947,
          activeStudies: 324,
          completedScans: 8734,
          diagnosticAccuracy: 94.7,
          averageProcessingTime: 2.3,
          aiAssistanceUsage: 78.2,
          criticalFindings: 47,
          followUpRequired: 156
        },
        performance: {
          systemUptime: 99.97,
          responseTime: 124,
          throughput: 1247,
          errorRate: 0.03,
          cacheHitRate: 94.3,
          apiCallsPerMinute: 2847,
          concurrentUsers: 1623,
          resourceUtilization: 68.4
        },
        patient: {
          newPatients: 234,
          returningPatients: 1389,
          appointmentCompletionRate: 92.8,
          patientSatisfaction: 4.6,
          averageWaitTime: 12.5,
          noShowRate: 7.2,
          emergencyAdmissions: 89,
          dischargeRate: 94.1
        },
        diagnostic: {
          imagingStudies: 456,
          labResults: 1247,
          pathologyReports: 89,
          radiologyTurnaround: 1.8,
          criticalValueAlerts: 23,
          aiDetectionRate: 87.4,
          falsePositiveRate: 2.1,
          qualityScore: 96.2
        },
        compliance: {
          hipaaScore: 98.1,
          auditScore: 96.8,
          dataRetentionCompliance: 99.2,
          accessControlScore: 97.5,
          encryptionCompliance: 100.0,
          backupCompliance: 98.9,
          incidentCount: 2,
          trainingCompletionRate: 94.7
        },
        predictions: {
          patientVolumeForecast: [1650, 1720, 1580, 1890, 1750, 1620, 1840],
          resourceDemandForecast: [72, 78, 68, 85, 76, 70, 82],
          riskScores: {
            operational: 15.2,
            clinical: 8.7,
            financial: 12.4,
            compliance: 5.1
          },
          trendAnalysis: {
            direction: 'up',
            confidence: 87.5,
            timeframe: '30 days'
          }
        }
      };

      const mockAlerts: AlertItem[] = [
        {
          id: '1',
          type: 'critical',
          category: 'medical',
          title: 'Critical Findings Requiring Immediate Attention',
          description: '3 critical diagnostic findings require immediate physician review',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          acknowledged: false,
          actionRequired: true
        },
        {
          id: '2',
          type: 'warning',
          category: 'system',
          title: 'High System Load Detected',
          description: 'System experiencing higher than normal load - response times may be affected',
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          acknowledged: false,
          actionRequired: false
        },
        {
          id: '3',
          type: 'info',
          category: 'compliance',
          title: 'Scheduled Compliance Audit',
          description: 'Monthly HIPAA compliance audit scheduled for tomorrow',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          acknowledged: true,
          actionRequired: false
        },
        {
          id: '4',
          type: 'warning',
          category: 'performance',
          title: 'Storage Capacity Warning',
          description: 'Medical imaging storage is at 85% capacity',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
          acknowledged: false,
          actionRequired: true
        }
      ];

      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'critical':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Critical
        </span>;
      case 'warning':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Warning
        </span>;
      case 'info':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Info
        </span>;
      default:
        return null;
    }
  };

  const getTrendIcon = (direction: string, value: number) => {
    if (direction === 'up') {
      return <ArrowUpRight className={`w-4 h-4 ${value > 0 ? 'text-green-600' : 'text-red-600'}`} />;
    } else if (direction === 'down') {
      return <ArrowDownRight className={`w-4 h-4 ${value > 0 ? 'text-red-600' : 'text-green-600'}`} />;
    }
    return <ArrowUpRight className="w-4 h-4 text-gray-600" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading analytics dashboard...</div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-gray-600">Failed to load analytics data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600">Medical data insights and performance analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
                </label>
                <RefreshCw 
                  className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600"
                  onClick={() => loadAnalyticsData()}
                />
              </div>
              
              <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {alerts.filter(a => a.type === 'critical' && !a.acknowledged).length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {alerts.filter(a => a.type === 'critical' && !a.acknowledged).length} critical alerts require immediate attention
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.medical.totalPatients)}</p>
                <p className="text-sm text-blue-600 flex items-center">
                  {getTrendIcon('up', metrics.patient.newPatients)}
                  <span className="ml-1">{metrics.patient.newPatients} new today</span>
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Diagnostic Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.medical.diagnosticAccuracy)}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>AI-assisted</span>
                </p>
              </div>
              <Brain className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.performance.systemUptime)}</p>
                <p className="text-sm text-gray-500">Response: {metrics.performance.responseTime}ms</p>
              </div>
              <Server className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">HIPAA Compliance</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.compliance.hipaaScore)}`}>
                  {formatPercentage(metrics.compliance.hipaaScore)}
                </p>
                <p className="text-sm text-gray-500">Last audit: excellent</p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Medical Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Active Medical Studies</h3>
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{metrics.medical.activeStudies}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Completed</div>
                <div className="font-medium">{formatNumber(metrics.medical.completedScans)}</div>
              </div>
              <div>
                <div className="text-gray-600">Critical Findings</div>
                <div className="font-medium text-red-600">{metrics.medical.criticalFindings}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">AI Performance</h3>
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatPercentage(metrics.medical.aiAssistanceUsage)}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Detection Rate</div>
                <div className="font-medium">{formatPercentage(metrics.diagnostic.aiDetectionRate)}</div>
              </div>
              <div>
                <div className="text-gray-600">False Positive</div>
                <div className="font-medium">{formatPercentage(metrics.diagnostic.falsePositiveRate)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Patient Satisfaction</h3>
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {metrics.patient.patientSatisfaction}/5
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Completion Rate</div>
                <div className="font-medium">{formatPercentage(metrics.patient.appointmentCompletionRate)}</div>
              </div>
              <div>
                <div className="text-gray-600">Avg Wait Time</div>
                <div className="font-medium">{metrics.patient.averageWaitTime}min</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                    {getAlertBadge(alert.type)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{alert.description}</div>
                  <div className="text-xs text-gray-500 mt-1">{formatTimeAgo(alert.timestamp)}</div>
                </div>
                {alert.actionRequired && (
                  <button className="ml-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    Action Required
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'medical', label: 'Medical Insights', icon: Stethoscope },
                { id: 'patients', label: 'Patient Analytics', icon: Users },
                { id: 'diagnostics', label: 'Diagnostic Analytics', icon: Brain },
                { id: 'performance', label: 'Performance', icon: Gauge },
                { id: 'predictions', label: 'Predictions', icon: TrendingUp },
                { id: 'realtime', label: 'Real-time', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">System Performance Overview</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{formatPercentage(metrics.performance.systemUptime)}</div>
                        <div className="text-sm text-gray-600">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{metrics.performance.responseTime}ms</div>
                        <div className="text-sm text-gray-600">Response Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{formatNumber(metrics.performance.throughput)}</div>
                        <div className="text-sm text-gray-600">Throughput</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{formatPercentage(metrics.performance.errorRate)}</div>
                        <div className="text-sm text-gray-600">Error Rate</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Predictive Insights</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Operational Risk</span>
                        <span className={`text-sm font-medium ${metrics.predictions.riskScores.operational < 20 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {formatPercentage(metrics.predictions.riskScores.operational)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Clinical Risk</span>
                        <span className={`text-sm font-medium ${metrics.predictions.riskScores.clinical < 15 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {formatPercentage(metrics.predictions.riskScores.clinical)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Trend Confidence</span>
                        <span className="text-sm font-medium text-blue-600">
                          {formatPercentage(metrics.predictions.trendAnalysis.confidence)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'medical' && (
              <MedicalInsights 
                metrics={metrics.medical}
                timeRange={timeRange}
              />
            )}
            
            {activeTab === 'patients' && (
              <PatientAnalytics 
                metrics={metrics.patient}
                timeRange={timeRange}
              />
            )}
            
            {activeTab === 'diagnostics' && (
              <DiagnosticAnalytics 
                metrics={metrics.diagnostic}
                timeRange={timeRange}
              />
            )}
            
            {activeTab === 'performance' && (
              <PerformanceMetrics 
                metrics={metrics.performance}
                timeRange={timeRange}
              />
            )}
            
            {activeTab === 'predictions' && (
              <PredictiveAnalytics 
                predictions={metrics.predictions}
                timeRange={timeRange}
              />
            )}
            
            {activeTab === 'realtime' && (
              <RealtimeMonitoring 
                metrics={metrics}
                alerts={alerts}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 