/**
 * MedSight Pro - Performance Benchmarks Component
 * Visualizes clinical performance benchmarks and metrics
 * 
 * Features:
 * - Clinical accuracy metrics visualization
 * - System performance charts
 * - Benchmarking reports
 * - Trend analysis
 * - Comparative analysis
 * - Performance recommendations
 * 
 * @version 1.0.0
 * @author MedSight Pro Development Team
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChartBarIcon, 
    ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentChartBarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { 
  PerformanceBenchmark, 
  BenchmarkComparison, 
  PerformanceReport,
  PerformanceRecommendation,
  BenchmarkCategory
} from '@/lib/quality/performance-benchmarking';

// Types
interface BenchmarkMetric {
  id: string;
  name: string;
  current: number;
  target: number;
  industry: number;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
  category: BenchmarkCategory;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface PerformanceData {
  timestamp: Date;
  value: number;
  target: number;
}

interface BenchmarkChart {
  id: string;
  title: string;
  data: PerformanceData[];
  category: BenchmarkCategory;
  unit: string;
}

/**
 * Performance Benchmarks Component
 */
export default function PerformanceBenchmarks() {
  // State Management
  const [activeCategory, setActiveCategory] = useState<BenchmarkCategory | 'all'>('all');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [benchmarks, setBenchmarks] = useState<BenchmarkMetric[]>([]);
  const [comparisons, setComparisons] = useState<BenchmarkComparison[]>([]);
  const [recommendations, setRecommendations] = useState<PerformanceRecommendation[]>([]);
  const [charts, setCharts] = useState<BenchmarkChart[]>([]);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBenchmark, setSelectedBenchmark] = useState<string | null>(null);

  // Initialize component
  useEffect(() => {
    initializeBenchmarks();
  }, [activeCategory, timeRange]);

  const initializeBenchmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load benchmark data
      const benchmarkData = await loadBenchmarkData();
      setBenchmarks(benchmarkData);

      // Load comparison data
      const comparisonData = await loadComparisonData();
      setComparisons(comparisonData);

      // Load recommendations
      const recommendationData = await loadRecommendations();
      setRecommendations(recommendationData);

      // Load chart data
      const chartData = await loadChartData();
      setCharts(chartData);

      // Load report
      const reportData = await loadPerformanceReport();
      setReport(reportData);
    } catch (error) {
      console.error('Error initializing benchmarks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, timeRange]);

  // Mock data loading functions
  const loadBenchmarkData = async (): Promise<BenchmarkMetric[]> => {
    const mockData: BenchmarkMetric[] = [
      {
        id: 'diagnostic_accuracy',
        name: 'Diagnostic Accuracy',
        current: 94.2,
        target: 95.0,
        industry: 92.1,
        percentile: 78,
        trend: 'up',
        category: 'clinical_accuracy',
        unit: '%',
        status: 'good'
      },
      {
        id: 'response_time',
        name: 'System Response Time',
        current: 1.8,
        target: 2.0,
        industry: 2.3,
        percentile: 85,
        trend: 'stable',
        category: 'system_performance',
        unit: 'sec',
        status: 'excellent'
      },
      {
        id: 'workflow_efficiency',
        name: 'Workflow Efficiency',
        current: 87.5,
        target: 90.0,
        industry: 84.2,
        percentile: 72,
        trend: 'up',
        category: 'workflow_efficiency',
        unit: '%',
        status: 'warning'
      },
      {
        id: 'user_satisfaction',
        name: 'User Satisfaction',
        current: 4.3,
        target: 4.5,
        industry: 4.1,
        percentile: 65,
        trend: 'stable',
        category: 'user_satisfaction',
        unit: '/5',
        status: 'good'
      },
      {
        id: 'compliance_score',
        name: 'Compliance Score',
        current: 96.8,
        target: 98.0,
        industry: 94.5,
        percentile: 82,
        trend: 'up',
        category: 'regulatory_compliance',
        unit: '%',
        status: 'good'
      }
    ];

    if (activeCategory !== 'all') {
      return mockData.filter(metric => metric.category === activeCategory);
    }
    return mockData;
  };

  const loadComparisonData = async (): Promise<BenchmarkComparison[]> => {
    return [
      {
        benchmarkId: 'diagnostic_accuracy',
        industryStandard: 92.0,
        peerAverage: 91.5,
        bestPractice: 97.2,
        currentPerformance: 94.2,
        percentile: 78,
        ranking: 45,
        totalParticipants: 200,
        comparisonDate: new Date()
      },
      {
        benchmarkId: 'response_time',
        industryStandard: 2.5,
        peerAverage: 2.3,
        bestPractice: 1.2,
        currentPerformance: 1.8,
        percentile: 85,
        ranking: 30,
        totalParticipants: 200,
        comparisonDate: new Date()
      }
    ];
  };

  const loadRecommendations = async (): Promise<PerformanceRecommendation[]> => {
    return [
      {
        id: 'rec_001',
        benchmarkId: 'workflow_efficiency',
        priority: 'high',
        category: 'process',
        title: 'Optimize Workflow Automation',
        description: 'Implement automated workflow steps to improve efficiency by 15%',
        expectedImpact: 15,
        implementationEffort: 'medium',
        estimatedCost: 75000,
        timeline: '3-6 months',
        resources: ['Process analysts', 'Automation tools'],
        dependencies: ['workflow_mapping'],
        riskLevel: 'medium'
      },
      {
        id: 'rec_002',
        benchmarkId: 'diagnostic_accuracy',
        priority: 'medium',
        category: 'training',
        title: 'AI-Assisted Diagnosis Training',
        description: 'Enhanced training program with AI assistance to reach 95% accuracy',
        expectedImpact: 8,
        implementationEffort: 'low',
        estimatedCost: 25000,
        timeline: '2-3 months',
        resources: ['Training materials', 'AI tools'],
        dependencies: [],
        riskLevel: 'low'
      }
    ];
  };

  const loadChartData = async (): Promise<BenchmarkChart[]> => {
    const generateMockData = (baseValue: number, target: number, days: number): PerformanceData[] => {
      const data: PerformanceData[] = [];
      for (let i = days; i >= 0; i--) {
        const variation = (Math.random() - 0.5) * 0.1;
        data.push({
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          value: baseValue + (baseValue * variation),
          target
        });
      }
      return data;
    };

    const timeRangeDays = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

    return [
      {
        id: 'diagnostic_accuracy_chart',
        title: 'Diagnostic Accuracy Trend',
        data: generateMockData(94.2, 95.0, timeRangeDays),
        category: 'clinical_accuracy',
        unit: '%'
      },
      {
        id: 'response_time_chart',
        title: 'System Response Time',
        data: generateMockData(1.8, 2.0, timeRangeDays),
        category: 'system_performance',
        unit: 'sec'
      },
      {
        id: 'workflow_efficiency_chart',
        title: 'Workflow Efficiency',
        data: generateMockData(87.5, 90.0, timeRangeDays),
        category: 'workflow_efficiency',
        unit: '%'
      }
    ];
  };

  const loadPerformanceReport = async (): Promise<PerformanceReport | null> => {
    return {
      id: 'report_001',
      title: 'Monthly Performance Report',
      generatedAt: new Date(),
      reportType: 'monthly',
      summary: {
        totalBenchmarks: 15,
        benchmarksAtTarget: 12,
        benchmarksBelowTarget: 3,
        improvementTrends: 8,
        criticalIssues: 0,
        overallScore: 87.5,
        performanceGrade: 'B'
      },
      benchmarks: [],
      comparisons: [],
      recommendations: [],
      trends: [],
      complianceStatus: {
        overall: 'compliant',
        regulatoryCompliance: {
          fda: 'compliant',
          hipaa: 'compliant',
          dicom: 'compliant',
          hl7: 'compliant'
        },
        clinicalCompliance: {
          qualityStandards: 'compliant',
          safetyProtocols: 'compliant',
          performanceStandards: 'compliant'
        },
        lastAuditDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextAuditDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      }
    };
  };

  // Event handlers
  const handleCategoryChange = (category: BenchmarkCategory | 'all') => {
    setActiveCategory(category);
  };

  const handleTimeRangeChange = (range: '24h' | '7d' | '30d' | '90d') => {
    setTimeRange(range);
  };

  const handleBenchmarkSelect = (benchmarkId: string) => {
    setSelectedBenchmark(selectedBenchmark === benchmarkId ? null : benchmarkId);
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-medsight-normal';
      case 'warning': return 'text-medsight-pending';
      case 'critical': return 'text-medsight-critical';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'excellent': 'bg-green-100 text-green-800',
      'good': 'bg-blue-100 text-blue-800',
      'warning': 'bg-yellow-100 text-yellow-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDownIcon className="w-4 h-4 text-red-600" />;
      default: return <ArrowRightIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'sec') {
      return `${value.toFixed(1)}s`;
    }
    return `${value.toFixed(1)}${unit}`;
  };

  const categories: { id: BenchmarkCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'clinical_accuracy', label: 'Clinical Accuracy' },
    { id: 'system_performance', label: 'System Performance' },
    { id: 'workflow_efficiency', label: 'Workflow Efficiency' },
    { id: 'user_satisfaction', label: 'User Satisfaction' },
    { id: 'regulatory_compliance', label: 'Compliance' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-medsight-primary/5 to-medsight-secondary/5 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="medsight-glass p-6 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-medsight-primary">Performance Benchmarks</h1>
              <p className="text-gray-600 mt-1">Monitor and analyze clinical performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value as any)}
                className="input-medsight"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button
                onClick={initializeBenchmarks}
                className="btn-medsight"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="medsight-glass p-4 rounded-xl mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handleCategoryChange(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === id
                    ? 'bg-medsight-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-medsight-primary/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        {report && (
          <div className="medsight-glass p-6 rounded-xl mb-6">
            <h2 className="text-xl font-semibold text-medsight-primary mb-4">Performance Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-medsight-primary">{report.summary.overallScore}%</div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-medsight-primary">{report.summary.performanceGrade}</div>
                <div className="text-sm text-gray-600">Grade</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{report.summary.benchmarksAtTarget}</div>
                <div className="text-sm text-gray-600">At Target</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{report.summary.benchmarksBelowTarget}</div>
                <div className="text-sm text-gray-600">Below Target</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{report.summary.improvementTrends}</div>
                <div className="text-sm text-gray-600">Improving</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{report.summary.criticalIssues}</div>
                <div className="text-sm text-gray-600">Critical Issues</div>
              </div>
            </div>
          </div>
        )}

        {/* Benchmarks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {benchmarks.map((benchmark) => (
            <div
              key={benchmark.id}
              className={`medsight-glass p-6 rounded-xl cursor-pointer transition-all ${
                selectedBenchmark === benchmark.id ? 'ring-2 ring-medsight-primary' : 'hover:shadow-lg'
              }`}
              onClick={() => handleBenchmarkSelect(benchmark.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{benchmark.name}</h3>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(benchmark.trend)}
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(benchmark.status)}`}>
                    {benchmark.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current</span>
                  <span className="font-bold text-medsight-primary">
                    {formatValue(benchmark.current, benchmark.unit)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Target</span>
                  <span className="font-medium text-gray-700">
                    {formatValue(benchmark.target, benchmark.unit)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Industry Avg</span>
                  <span className="font-medium text-gray-700">
                    {formatValue(benchmark.industry, benchmark.unit)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Percentile</span>
                  <span className="font-medium text-blue-600">{benchmark.percentile}th</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress to Target</span>
                  <span>{Math.round((benchmark.current / benchmark.target) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-medsight-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((benchmark.current / benchmark.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="medsight-glass p-6 rounded-xl mb-6">
            <h2 className="text-xl font-semibold text-medsight-primary mb-4">Performance Recommendations</h2>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-500">Expected Impact:</span>
                      <span className="font-medium text-green-600 ml-1">+{rec.expectedImpact}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Timeline:</span>
                      <span className="font-medium text-gray-700 ml-1">{rec.timeline}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Effort:</span>
                      <span className="font-medium text-gray-700 ml-1">{rec.implementationEffort}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Cost:</span>
                      <span className="font-medium text-gray-700 ml-1">${rec.estimatedCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((chart) => (
            <div key={chart.id} className="medsight-glass p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-medsight-primary mb-4">{chart.title}</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ChartBarIcon className="w-16 h-16 mx-auto mb-2" />
                  <p>Chart visualization would be rendered here</p>
                  <p className="text-sm">Data points: {chart.data.length}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 