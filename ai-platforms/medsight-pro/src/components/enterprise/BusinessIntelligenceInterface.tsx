'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, ChartPieIcon, PresentationChartLineIcon,
  BanknotesIcon, TrendingUpIcon, TrendingDownIcon,
  UsersIcon, HeartIcon, BeakerIcon, AcademicCapIcon,
  BuildingOfficeIcon, GlobeAltIcon, ClockIcon, CalendarIcon,
  ArrowUpIcon, ArrowDownIcon, ArrowRightIcon,
  EyeIcon, DocumentTextIcon, ShareIcon, PrinterIcon,
  FunnelIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon,
  InformationCircleIcon, ExclamationTriangleIcon,
  CheckCircleIcon, XMarkIcon, PlusIcon, MinusIcon,
  CubeIcon, Square3Stack3DIcon, RectangleGroupIcon,
  TableCellsIcon, ListBulletIcon, ViewColumnsIcon,
  CloudArrowDownIcon, CloudArrowUpIcon, ServerIcon,
  CpuChipIcon, CircleStackIcon, SignalIcon, WifiIcon,
  ShieldCheckIcon, LockClosedIcon, KeyIcon, FireIcon,
  BoltIcon, LightBulbIcon, SparklesIcon, StarIcon
} from '@heroicons/react/24/outline';

interface BusinessMetrics {
  financial: {
    totalRevenue: number;
    monthlyRevenue: number;
    quarterlyRevenue: number;
    annualRevenue: number;
    growthRate: number;
    churnRate: number;
    arpu: number; // Average Revenue Per User
    ltv: number; // Lifetime Value
    cac: number; // Customer Acquisition Cost
    profitMargin: number;
  };
  customers: {
    total: number;
    new: number;
    active: number;
    churned: number;
    trial: number;
    paid: number;
    enterprise: number;
    retention: number;
  };
  medical: {
    totalPatients: number;
    totalStudies: number;
    totalProcedures: number;
    aiAnalyses: number;
    xrSessions: number;
    collaborations: number;
    medicalErrors: number;
    qualityScore: number;
  };
  usage: {
    totalSessions: number;
    avgSessionDuration: number;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    storageUsed: number;
    bandwidthUsed: number;
    apiCalls: number;
  };
  performance: {
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
    serverLoad: number;
    databasePerformance: number;
    userSatisfaction: number;
    nps: number; // Net Promoter Score
  };
}

interface BusinessReport {
  id: string;
  name: string;
  type: 'financial' | 'medical' | 'operational' | 'compliance' | 'performance';
  category: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  description: string;
  generatedDate: string;
  dataRange: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    revenue?: number;
    users?: number;
    medicalCases?: number;
    compliance?: number;
    performance?: number;
  };
  insights: string[];
  recommendations: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'completed' | 'generating' | 'scheduled' | 'failed';
  author: string;
}

interface BusinessAlert {
  id: string;
  type: 'revenue' | 'usage' | 'performance' | 'medical' | 'compliance';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
  acknowledged: boolean;
}

interface MedicalAnalytics {
  patientDemographics: {
    age: { range: string; count: number; percentage: number }[];
    gender: { type: string; count: number; percentage: number }[];
    conditions: { condition: string; count: number; percentage: number }[];
  };
  procedureAnalytics: {
    mostCommon: { procedure: string; count: number; avgDuration: number }[];
    success: { procedure: string; successRate: number; complications: number }[];
    efficiency: { procedure: string; avgTime: number; improvement: number }[];
  };
  aiPerformance: {
    accuracy: { model: string; accuracy: number; confidence: number }[];
    usage: { feature: string; usage: number; growth: number }[];
    outcomes: { prediction: string; accuracy: number; impact: string }[];
  };
  qualityMetrics: {
    errorRate: number;
    patientSatisfaction: number;
    clinicalCompliance: number;
    medicalAdherence: number;
  };
}

const BusinessIntelligenceInterface: React.FC = () => {
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [businessReports, setBusinessReports] = useState<BusinessReport[]>([]);
  const [businessAlerts, setBusinessAlerts] = useState<BusinessAlert[]>([]);
  const [medicalAnalytics, setMedicalAnalytics] = useState<MedicalAnalytics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetricType, setSelectedMetricType] = useState<'financial' | 'medical' | 'operational' | 'all'>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'reports'>('overview');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Initialize business intelligence data
  useEffect(() => {
    const mockBusinessMetrics: BusinessMetrics = {
      financial: {
        totalRevenue: 28080000,
        monthlyRevenue: 2340000,
        quarterlyRevenue: 7020000,
        annualRevenue: 28080000,
        growthRate: 15.2,
        churnRate: 2.8,
        arpu: 1250,
        ltv: 18750,
        cac: 850,
        profitMargin: 42.5
      },
      customers: {
        total: 247,
        new: 23,
        active: 189,
        churned: 7,
        trial: 34,
        paid: 213,
        enterprise: 45,
        retention: 97.2
      },
      medical: {
        totalPatients: 1234567,
        totalStudies: 2345678,
        totalProcedures: 345678,
        aiAnalyses: 456789,
        xrSessions: 23456,
        collaborations: 12345,
        medicalErrors: 23,
        qualityScore: 98.7
      },
      usage: {
        totalSessions: 567890,
        avgSessionDuration: 42.5,
        dailyActiveUsers: 12345,
        weeklyActiveUsers: 45678,
        monthlyActiveUsers: 123456,
        storageUsed: 45.7,
        bandwidthUsed: 12.3,
        apiCalls: 2345678
      },
      performance: {
        uptime: 99.8,
        avgResponseTime: 115,
        errorRate: 0.008,
        throughput: 5670,
        serverLoad: 65.4,
        databasePerformance: 92.3,
        userSatisfaction: 4.8,
        nps: 72
      }
    };
    setBusinessMetrics(mockBusinessMetrics);

    const mockReports: BusinessReport[] = [
      {
        id: 'report-001',
        name: 'Monthly Financial Summary',
        type: 'financial',
        category: 'monthly',
        description: 'Comprehensive financial performance analysis for January 2024',
        generatedDate: '2024-01-31T23:59:00Z',
        dataRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        },
        metrics: {
          revenue: 2340000,
          users: 189,
          performance: 99.8
        },
        insights: [
          'Revenue increased 15.2% compared to previous month',
          'Enterprise customers drove 68% of total revenue',
          'Customer acquisition cost decreased by 12%'
        ],
        recommendations: [
          'Focus on enterprise customer expansion',
          'Invest in customer success programs',
          'Optimize pricing for mid-market segment'
        ],
        priority: 'high',
        status: 'completed',
        author: 'Business Intelligence System'
      },
      {
        id: 'report-002',
        name: 'Medical Quality Assessment',
        type: 'medical',
        category: 'quarterly',
        description: 'Medical quality metrics and patient outcomes analysis',
        generatedDate: '2024-01-15T12:00:00Z',
        dataRange: {
          startDate: '2023-10-01',
          endDate: '2023-12-31'
        },
        metrics: {
          medicalCases: 345678,
          compliance: 98.7,
          performance: 96.4
        },
        insights: [
          'AI diagnostic accuracy improved to 94.2%',
          'Patient satisfaction scores increased 8%',
          'Medical error rate decreased to 0.007%'
        ],
        recommendations: [
          'Expand AI-assisted diagnostic programs',
          'Implement additional quality checkpoints',
          'Enhance clinical training protocols'
        ],
        priority: 'medium',
        status: 'completed',
        author: 'Medical Quality Team'
      },
      {
        id: 'report-003',
        name: 'System Performance Report',
        type: 'performance',
        category: 'weekly',
        description: 'Infrastructure and system performance analysis',
        generatedDate: '2024-01-14T06:00:00Z',
        dataRange: {
          startDate: '2024-01-07',
          endDate: '2024-01-14'
        },
        metrics: {
          performance: 99.8,
          users: 12345
        },
        insights: [
          'System uptime exceeded 99.8% target',
          'Response times improved by 8%',
          'Database optimization reduced query time by 15%'
        ],
        recommendations: [
          'Continue infrastructure monitoring',
          'Implement additional caching layers',
          'Plan for Q2 capacity expansion'
        ],
        priority: 'low',
        status: 'completed',
        author: 'Infrastructure Team'
      }
    ];
    setBusinessReports(mockReports);

    const mockAlerts: BusinessAlert[] = [
      {
        id: 'alert-001',
        type: 'revenue',
        severity: 'warning',
        title: 'Revenue Growth Slowing',
        message: 'Monthly revenue growth rate has decreased from 18.5% to 15.2%',
        metric: 'Monthly Revenue Growth',
        currentValue: 15.2,
        threshold: 17.0,
        trend: 'down',
        timestamp: '2024-01-15T14:30:00Z',
        acknowledged: false
      },
      {
        id: 'alert-002',
        type: 'usage',
        severity: 'info',
        title: 'Storage Usage Increasing',
        message: 'Total storage usage approaching 50TB threshold',
        metric: 'Storage Usage',
        currentValue: 45.7,
        threshold: 50.0,
        trend: 'up',
        timestamp: '2024-01-15T13:15:00Z',
        acknowledged: true
      },
      {
        id: 'alert-003',
        type: 'medical',
        severity: 'critical',
        title: 'AI Model Performance Drop',
        message: 'Diagnostic AI model accuracy dropped below 90% threshold',
        metric: 'AI Diagnostic Accuracy',
        currentValue: 89.2,
        threshold: 90.0,
        trend: 'down',
        timestamp: '2024-01-15T11:45:00Z',
        acknowledged: false
      }
    ];
    setBusinessAlerts(mockAlerts);

    const mockMedicalAnalytics: MedicalAnalytics = {
      patientDemographics: {
        age: [
          { range: '0-18', count: 123456, percentage: 15.2 },
          { range: '19-35', count: 234567, percentage: 28.9 },
          { range: '36-50', count: 198765, percentage: 24.5 },
          { range: '51-65', count: 156789, percentage: 19.3 },
          { range: '65+', count: 98765, percentage: 12.1 }
        ],
        gender: [
          { type: 'Female', count: 456789, percentage: 56.2 },
          { type: 'Male', count: 345678, percentage: 42.5 },
          { type: 'Other', count: 10567, percentage: 1.3 }
        ],
        conditions: [
          { condition: 'Cardiovascular', count: 234567, percentage: 28.9 },
          { condition: 'Respiratory', count: 123456, percentage: 15.2 },
          { condition: 'Neurological', count: 98765, percentage: 12.1 },
          { condition: 'Oncology', count: 87654, percentage: 10.8 },
          { condition: 'Orthopedic', count: 76543, percentage: 9.4 }
        ]
      },
      procedureAnalytics: {
        mostCommon: [
          { procedure: 'CT Scan', count: 45678, avgDuration: 25 },
          { procedure: 'MRI', count: 34567, avgDuration: 45 },
          { procedure: 'X-Ray', count: 56789, avgDuration: 10 },
          { procedure: 'Ultrasound', count: 23456, avgDuration: 20 },
          { procedure: 'PET Scan', count: 12345, avgDuration: 90 }
        ],
        success: [
          { procedure: 'Cardiac Surgery', successRate: 96.8, complications: 12 },
          { procedure: 'Neurosurgery', successRate: 94.2, complications: 23 },
          { procedure: 'Orthopedic Surgery', successRate: 98.1, complications: 8 },
          { procedure: 'General Surgery', successRate: 97.5, complications: 15 },
          { procedure: 'Minimally Invasive', successRate: 99.2, complications: 3 }
        ],
        efficiency: [
          { procedure: 'Laparoscopy', avgTime: 85, improvement: 12.5 },
          { procedure: 'Endoscopy', avgTime: 35, improvement: 8.2 },
          { procedure: 'Biopsy', avgTime: 15, improvement: 15.3 },
          { procedure: 'Angioplasty', avgTime: 120, improvement: 6.7 },
          { procedure: 'Arthroscopy', avgTime: 65, improvement: 11.1 }
        ]
      },
      aiPerformance: {
        accuracy: [
          { model: 'Cardiac AI', accuracy: 94.2, confidence: 97.8 },
          { model: 'Radiology AI', accuracy: 92.5, confidence: 95.6 },
          { model: 'Pathology AI', accuracy: 89.7, confidence: 94.2 },
          { model: 'Emergency AI', accuracy: 91.3, confidence: 96.1 },
          { model: 'Surgical AI', accuracy: 96.8, confidence: 98.4 }
        ],
        usage: [
          { feature: 'AI Diagnosis', usage: 23456, growth: 18.5 },
          { feature: 'Image Analysis', usage: 34567, growth: 22.3 },
          { feature: 'Risk Assessment', usage: 12345, growth: 15.7 },
          { feature: 'Treatment Planning', usage: 8901, growth: 25.4 },
          { feature: 'Outcome Prediction', usage: 5678, growth: 31.2 }
        ],
        outcomes: [
          { prediction: 'Early Diagnosis', accuracy: 94.5, impact: 'Reduced mortality by 15%' },
          { prediction: 'Treatment Response', accuracy: 91.2, impact: 'Improved outcomes by 12%' },
          { prediction: 'Risk Stratification', accuracy: 88.7, impact: 'Reduced complications by 18%' },
          { prediction: 'Resource Planning', accuracy: 93.4, impact: 'Optimized capacity by 20%' },
          { prediction: 'Cost Estimation', accuracy: 89.9, impact: 'Reduced costs by 8%' }
        ]
      },
      qualityMetrics: {
        errorRate: 0.007,
        patientSatisfaction: 4.8,
        clinicalCompliance: 98.7,
        medicalAdherence: 96.4
      }
    };
    setMedicalAnalytics(mockMedicalAnalytics);
  }, []);

  const handleGenerateReport = async (reportType: string) => {
    setIsGeneratingReport(true);
    // Connect to backend BusinessIntelligence.ts
    console.log('Generating business report:', reportType);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGeneratingReport(false);
  };

  const handleAlertAcknowledge = (alertId: string) => {
    setBusinessAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'info': return <InformationCircleIcon className="w-5 h-5" />;
      default: return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  const getTrendIcon = (trend: string, value: number) => {
    if (trend === 'up' && value > 0) return <ArrowUpIcon className="w-4 h-4 text-green-600" />;
    if (trend === 'down' && value < 0) return <ArrowDownIcon className="w-4 h-4 text-red-600" />;
    return <ArrowRightIcon className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-medsight-primary/10 rounded-xl">
              <ChartBarIcon className="w-8 h-8 text-medsight-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-medsight-primary">Business Intelligence</h2>
              <p className="text-gray-600">Medical analytics and business insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="input-medsight"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <select
              value={selectedMetricType}
              onChange={(e) => setSelectedMetricType(e.target.value as any)}
              className="input-medsight"
            >
              <option value="all">All Metrics</option>
              <option value="financial">Financial</option>
              <option value="medical">Medical</option>
              <option value="operational">Operational</option>
            </select>
            <button 
              onClick={() => handleGenerateReport('custom')}
              className="btn-medsight"
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <DocumentTextIcon className="w-4 h-4 mr-2" />
              )}
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'overview'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'detailed'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Detailed Analytics
          </button>
          <button
            onClick={() => setViewMode('reports')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'reports'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && businessMetrics && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-medsight-primary">
                    {formatCurrency(businessMetrics.financial.monthlyRevenue)}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    {getTrendIcon('up', businessMetrics.financial.growthRate)}
                    <span className="text-sm text-green-600">+{businessMetrics.financial.growthRate}%</span>
                  </div>
                </div>
                <BanknotesIcon className="w-8 h-8 text-medsight-primary" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-medsight-secondary">
                    {formatNumber(businessMetrics.customers.active)}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    {getTrendIcon('up', businessMetrics.customers.retention)}
                    <span className="text-sm text-green-600">{businessMetrics.customers.retention}% retention</span>
                  </div>
                </div>
                <UsersIcon className="w-8 h-8 text-medsight-secondary" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Medical Patients</p>
                  <p className="text-2xl font-bold text-medsight-accent">
                    {formatNumber(businessMetrics.medical.totalPatients)}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">{businessMetrics.medical.qualityScore}% quality</span>
                  </div>
                </div>
                <HeartIcon className="w-8 h-8 text-medsight-accent" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI Analyses</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatNumber(businessMetrics.medical.aiAnalyses)}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <SparklesIcon className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-600">94.2% accuracy</span>
                  </div>
                </div>
                <BeakerIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Business Alerts */}
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Business Alerts</h3>
              <span className="text-sm text-gray-600">
                {businessAlerts.filter(alert => !alert.acknowledged).length} unacknowledged
              </span>
            </div>
            <div className="space-y-3">
              {businessAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getAlertColor(alert.severity)} ${
                    alert.acknowledged ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.severity)}
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm mt-1">{alert.message}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs">
                          <span>Current: {alert.currentValue}</span>
                          <span>Threshold: {alert.threshold}</span>
                          <span className="flex items-center space-x-1">
                            {getTrendIcon(alert.trend, alert.currentValue - alert.threshold)}
                            <span>{alert.trend}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button 
                        onClick={() => handleAlertAcknowledge(alert.id)}
                        className="text-sm bg-white px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Detailed Analytics Mode */}
      {viewMode === 'detailed' && medicalAnalytics && (
        <>
          {/* Medical Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Demographics */}
            <div className="medsight-glass p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-medsight-primary mb-4">Patient Demographics</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Age Distribution</h4>
                  <div className="space-y-2">
                    {medicalAnalytics.patientDemographics.age.map((age) => (
                      <div key={age.range} className="flex items-center justify-between">
                        <span className="text-sm">{age.range}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-medsight-primary h-2 rounded-full"
                              style={{ width: `${age.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{age.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Common Conditions</h4>
                  <div className="space-y-2">
                    {medicalAnalytics.patientDemographics.conditions.slice(0, 5).map((condition) => (
                      <div key={condition.condition} className="flex items-center justify-between">
                        <span className="text-sm">{condition.condition}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{formatNumber(condition.count)}</span>
                          <span className="text-sm font-medium text-medsight-accent">{condition.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Performance */}
            <div className="medsight-glass p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-medsight-primary mb-4">AI Performance</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Model Accuracy</h4>
                  <div className="space-y-2">
                    {medicalAnalytics.aiPerformance.accuracy.map((model) => (
                      <div key={model.model} className="flex items-center justify-between">
                        <span className="text-sm">{model.model}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${model.accuracy}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{model.accuracy}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Usage Growth</h4>
                  <div className="space-y-2">
                    {medicalAnalytics.aiPerformance.usage.map((feature) => (
                      <div key={feature.feature} className="flex items-center justify-between">
                        <span className="text-sm">{feature.feature}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{formatNumber(feature.usage)}</span>
                          <div className="flex items-center space-x-1">
                            <ArrowUpIcon className="w-3 h-3 text-green-600" />
                            <span className="text-sm font-medium text-green-600">+{feature.growth}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Procedure Analytics */}
          <div className="medsight-glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-medsight-primary mb-4">Procedure Analytics</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-3">Most Common Procedures</h4>
                <div className="space-y-3">
                  {medicalAnalytics.procedureAnalytics.mostCommon.map((procedure) => (
                    <div key={procedure.procedure} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{procedure.procedure}</span>
                        <span className="text-sm text-gray-600">{formatNumber(procedure.count)}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Avg Duration: {procedure.avgDuration} min
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Success Rates</h4>
                <div className="space-y-3">
                  {medicalAnalytics.procedureAnalytics.success.map((procedure) => (
                    <div key={procedure.procedure} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{procedure.procedure}</span>
                        <span className="text-sm font-medium text-green-600">{procedure.successRate}%</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Complications: {procedure.complications}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Efficiency Improvements</h4>
                <div className="space-y-3">
                  {medicalAnalytics.procedureAnalytics.efficiency.map((procedure) => (
                    <div key={procedure.procedure} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{procedure.procedure}</span>
                        <span className="text-sm text-gray-600">{procedure.avgTime} min</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <ArrowUpIcon className="w-3 h-3 text-green-600" />
                        <span className="text-sm text-green-600">+{procedure.improvement}% faster</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reports Mode */}
      {viewMode === 'reports' && (
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-medsight-primary">Business Reports</h3>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleGenerateReport('financial')}
                className="btn-medsight text-sm"
              >
                <BanknotesIcon className="w-4 h-4 mr-1" />
                Financial Report
              </button>
              <button 
                onClick={() => handleGenerateReport('medical')}
                className="btn-medsight text-sm"
              >
                <HeartIcon className="w-4 h-4 mr-1" />
                Medical Report
              </button>
              <button 
                onClick={() => handleGenerateReport('performance')}
                className="btn-medsight text-sm"
              >
                <ChartBarIcon className="w-4 h-4 mr-1" />
                Performance Report
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {businessReports.map((report) => (
              <div key={report.id} className="p-6 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-lg">{report.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        report.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        report.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        report.status === 'completed' ? 'bg-green-100 text-green-800' :
                        report.status === 'generating' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'scheduled' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{report.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h5 className="font-medium mb-2">Key Insights</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {report.insights.map((insight, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Recommendations</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {report.recommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <LightBulbIcon className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <span>{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Metrics</h5>
                        <div className="space-y-2 text-sm">
                          {report.metrics.revenue && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Revenue:</span>
                              <span className="font-medium">{formatCurrency(report.metrics.revenue)}</span>
                            </div>
                          )}
                          {report.metrics.users && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Users:</span>
                              <span className="font-medium">{formatNumber(report.metrics.users)}</span>
                            </div>
                          )}
                          {report.metrics.performance && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Performance:</span>
                              <span className="font-medium">{report.metrics.performance}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Generated: {new Date(report.generatedDate).toLocaleDateString()}</span>
                      <span>Period: {new Date(report.dataRange.startDate).toLocaleDateString()} - {new Date(report.dataRange.endDate).toLocaleDateString()}</span>
                      <span>Author: {report.author}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button className="p-2 text-gray-600 hover:text-medsight-primary">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-medsight-primary">
                      <ShareIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-medsight-primary">
                      <PrinterIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Compliance */}
      <div className="medsight-glass p-4 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-medsight-normal" />
            <span className="text-sm font-medium text-medsight-normal">Business Intelligence Compliance</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-medsight-normal">HIPAA Compliant Data</span>
            <span className="text-medsight-normal">Medical Analytics</span>
            <span className="text-medsight-normal">Secure Reporting</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligenceInterface; 