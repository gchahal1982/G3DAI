'use client';

import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Brain, 
  Heart, 
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  BarChart3,
  PieChart,
  Eye,
  Download,
  Calendar,
  Award,
  Zap,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Star,
  Gauge
} from 'lucide-react';

interface MedicalMetrics {
  totalPatients: number;
  activeStudies: number;
  completedScans: number;
  diagnosticAccuracy: number;
  averageProcessingTime: number;
  aiAssistanceUsage: number;
  criticalFindings: number;
  followUpRequired: number;
}

interface ClinicalInsight {
  id: string;
  category: 'diagnosis' | 'treatment' | 'outcome' | 'risk';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  affectedPatients: number;
  recommendation: string;
  lastUpdated: Date;
  trendDirection: 'up' | 'down' | 'stable';
}

interface DiagnosticTrend {
  condition: string;
  code: string;
  cases: number;
  trend: number;
  severity: 'critical' | 'moderate' | 'mild';
  aiAccuracy: number;
  avgProcessingTime: number;
  treatmentSuccess: number;
}

interface TreatmentOutcome {
  treatmentType: string;
  totalCases: number;
  successRate: number;
  averageDuration: number;
  costEffectiveness: number;
  patientSatisfaction: number;
  complications: number;
  readmissionRate: number;
}

interface MedicalInsightsProps {
  metrics: MedicalMetrics;
  timeRange: string;
  className?: string;
}

const MedicalInsights: React.FC<MedicalInsightsProps> = ({
  metrics,
  timeRange,
  className = ''
}) => {
  const [insights, setInsights] = useState<ClinicalInsight[]>([]);
  const [diagnosticTrends, setDiagnosticTrends] = useState<DiagnosticTrend[]>([]);
  const [treatmentOutcomes, setTreatmentOutcomes] = useState<TreatmentOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('insights');

  useEffect(() => {
    loadMedicalData();
  }, [timeRange]);

  const loadMedicalData = async () => {
    setLoading(true);
    
    // Mock data - replace with actual API calls
    const mockInsights: ClinicalInsight[] = [
      {
        id: '1',
        category: 'diagnosis',
        title: 'Increased Detection of Early-Stage Cardiac Abnormalities',
        description: 'AI-assisted ECG analysis has identified a 23% increase in early-stage cardiac abnormalities compared to manual review alone',
        impact: 'high',
        confidence: 94.7,
        affectedPatients: 156,
        recommendation: 'Implement enhanced cardiac screening protocols for at-risk demographics',
        lastUpdated: new Date('2024-01-15T10:30:00Z'),
        trendDirection: 'up'
      },
      {
        id: '2',
        category: 'treatment',
        title: 'Improved Response to Personalized Treatment Plans',
        description: 'Patients receiving AI-recommended personalized treatment plans show 18% better outcomes',
        impact: 'high',
        confidence: 89.2,
        affectedPatients: 324,
        recommendation: 'Expand personalized treatment protocol to additional departments',
        lastUpdated: new Date('2024-01-14T15:45:00Z'),
        trendDirection: 'up'
      },
      {
        id: '3',
        category: 'outcome',
        title: 'Reduced Hospital Readmission Rates',
        description: 'Implementation of predictive discharge planning has reduced 30-day readmissions by 12%',
        impact: 'medium',
        confidence: 91.8,
        affectedPatients: 892,
        recommendation: 'Continue predictive discharge planning and monitor long-term trends',
        lastUpdated: new Date('2024-01-13T09:15:00Z'),
        trendDirection: 'down'
      },
      {
        id: '4',
        category: 'risk',
        title: 'Enhanced Risk Stratification for Diabetic Patients',
        description: 'New risk assessment model identifies high-risk diabetic patients with 96% accuracy',
        impact: 'high',
        confidence: 96.3,
        affectedPatients: 567,
        recommendation: 'Deploy risk model hospital-wide and establish prevention protocols',
        lastUpdated: new Date('2024-01-12T14:20:00Z'),
        trendDirection: 'stable'
      }
    ];

    const mockDiagnosticTrends: DiagnosticTrend[] = [
      {
        condition: 'Myocardial Infarction',
        code: 'I21',
        cases: 89,
        trend: 12.3,
        severity: 'critical',
        aiAccuracy: 96.8,
        avgProcessingTime: 1.2,
        treatmentSuccess: 94.1
      },
      {
        condition: 'Pneumonia',
        code: 'J18',
        cases: 156,
        trend: -8.7,
        severity: 'moderate',
        aiAccuracy: 93.4,
        avgProcessingTime: 0.8,
        treatmentSuccess: 97.2
      },
      {
        condition: 'Type 2 Diabetes',
        code: 'E11',
        cases: 234,
        trend: 5.6,
        severity: 'moderate',
        aiAccuracy: 89.7,
        avgProcessingTime: 2.1,
        treatmentSuccess: 91.8
      },
      {
        condition: 'Hypertension',
        code: 'I10',
        cases: 345,
        trend: 3.2,
        severity: 'mild',
        aiAccuracy: 92.1,
        avgProcessingTime: 0.5,
        treatmentSuccess: 88.9
      },
      {
        condition: 'Stroke',
        code: 'I64',
        cases: 67,
        trend: -15.4,
        severity: 'critical',
        aiAccuracy: 95.2,
        avgProcessingTime: 1.8,
        treatmentSuccess: 87.3
      }
    ];

    const mockTreatmentOutcomes: TreatmentOutcome[] = [
      {
        treatmentType: 'Cardiac Catheterization',
        totalCases: 123,
        successRate: 96.7,
        averageDuration: 45,
        costEffectiveness: 87.3,
        patientSatisfaction: 4.7,
        complications: 2,
        readmissionRate: 3.2
      },
      {
        treatmentType: 'Antibiotic Therapy',
        totalCases: 567,
        successRate: 94.2,
        averageDuration: 7,
        costEffectiveness: 92.8,
        patientSatisfaction: 4.5,
        complications: 8,
        readmissionRate: 1.8
      },
      {
        treatmentType: 'Insulin Therapy',
        totalCases: 234,
        successRate: 89.1,
        averageDuration: 180,
        costEffectiveness: 78.9,
        patientSatisfaction: 4.2,
        complications: 12,
        readmissionRate: 8.7
      },
      {
        treatmentType: 'Physical Therapy',
        totalCases: 345,
        successRate: 91.8,
        averageDuration: 30,
        costEffectiveness: 85.6,
        patientSatisfaction: 4.6,
        complications: 3,
        readmissionRate: 2.1
      }
    ];

    setInsights(mockInsights);
    setDiagnosticTrends(mockDiagnosticTrends);
    setTreatmentOutcomes(mockTreatmentOutcomes);
    setLoading(false);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          High Impact
        </span>;
      case 'medium':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Medium Impact
        </span>;
      case 'low':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Low Impact
        </span>;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'moderate': return 'text-yellow-600';
      case 'mild': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (direction: string, value: number) => {
    if (direction === 'up') {
      return <ArrowUpRight className={`w-4 h-4 ${value > 0 ? 'text-red-600' : 'text-green-600'}`} />;
    } else if (direction === 'down') {
      return <ArrowDownRight className={`w-4 h-4 ${value > 0 ? 'text-green-600' : 'text-red-600'}`} />;
    }
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'diagnosis': return <Brain className="w-5 h-5 text-blue-600" />;
      case 'treatment': return <Stethoscope className="w-5 h-5 text-green-600" />;
      case 'outcome': return <Target className="w-5 h-5 text-purple-600" />;
      case 'risk': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredInsights = insights.filter(insight => 
    selectedCategory === 'all' || insight.category === selectedCategory
  );

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Medical Insights</h3>
          <p className="text-sm text-gray-600">
            AI-powered clinical insights and diagnostic trends
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="treatment">Treatment</option>
            <option value="outcome">Outcome</option>
            <option value="risk">Risk</option>
          </select>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="insights">Insights</option>
            <option value="trends">Trends</option>
            <option value="outcomes">Outcomes</option>
          </select>
        </div>
      </div>

      {/* Medical Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">AI Diagnostic Accuracy</p>
              <p className="text-2xl font-bold text-blue-900">{formatPercentage(metrics.diagnosticAccuracy)}</p>
              <p className="text-sm text-blue-600">Across all conditions</p>
            </div>
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Processing Time</p>
              <p className="text-2xl font-bold text-green-900">{metrics.averageProcessingTime}min</p>
              <p className="text-sm text-green-600">Average per case</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">AI Assistance Usage</p>
              <p className="text-2xl font-bold text-purple-900">{formatPercentage(metrics.aiAssistanceUsage)}</p>
              <p className="text-sm text-purple-600">Of all diagnoses</p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Critical Findings</p>
              <p className="text-2xl font-bold text-red-900">{metrics.criticalFindings}</p>
              <p className="text-sm text-red-600">Requiring attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'insights' && (
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900">Clinical Insights</h4>
          <div className="grid grid-cols-1 gap-6">
            {filteredInsights.map((insight) => (
              <div key={insight.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      {getCategoryIcon(insight.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h5 className="text-lg font-medium text-gray-900 mr-3">{insight.title}</h5>
                        {getImpactBadge(insight.impact)}
                      </div>
                      <p className="text-gray-600 mb-3">{insight.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-sm">
                          <span className="text-gray-500">Confidence:</span>
                          <span className="ml-2 font-medium text-blue-600">{formatPercentage(insight.confidence)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Affected Patients:</span>
                          <span className="ml-2 font-medium text-gray-900">{insight.affectedPatients}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Updated:</span>
                          <span className="ml-2 font-medium text-gray-900">{formatTimeAgo(insight.lastUpdated)}</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-blue-900 mb-1">Recommendation:</div>
                        <div className="text-sm text-blue-800">{insight.recommendation}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center ml-4">
                    {getTrendIcon(insight.trendDirection, 1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'trends' && (
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900">Diagnostic Trends</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processing Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Treatment Success
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {diagnosticTrends.map((trend, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{trend.condition}</div>
                      <div className="text-sm text-gray-500">ICD-10: {trend.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trend.cases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {trend.trend > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-red-600 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-green-600 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${trend.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {Math.abs(trend.trend).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        trend.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        trend.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {trend.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(trend.aiAccuracy)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trend.avgProcessingTime}min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(trend.treatmentSuccess)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'outcomes' && (
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900">Treatment Outcomes</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {treatmentOutcomes.map((outcome, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-lg font-medium text-gray-900">{outcome.treatmentType}</h5>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium text-gray-900">{outcome.patientSatisfaction}/5</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatPercentage(outcome.successRate)}</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{outcome.totalCases}</div>
                    <div className="text-sm text-gray-600">Total Cases</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Duration</span>
                    <span className="text-sm font-medium text-gray-900">{outcome.averageDuration} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cost Effectiveness</span>
                    <span className="text-sm font-medium text-gray-900">{formatPercentage(outcome.costEffectiveness)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Complications</span>
                    <span className="text-sm font-medium text-gray-900">{outcome.complications}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Readmission Rate</span>
                    <span className="text-sm font-medium text-gray-900">{formatPercentage(outcome.readmissionRate)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${outcome.successRate}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Overall effectiveness score</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Performance Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">AI Performance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{formatPercentage(metrics.diagnosticAccuracy)}</div>
            <div className="text-sm text-gray-600">Overall Diagnostic Accuracy</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${metrics.diagnosticAccuracy}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{metrics.averageProcessingTime}min</div>
            <div className="text-sm text-gray-600">Average Processing Time</div>
            <div className="text-xs text-green-600 mt-1">67% faster than manual</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{formatPercentage(metrics.aiAssistanceUsage)}</div>
            <div className="text-sm text-gray-600">AI Assistance Adoption</div>
            <div className="text-xs text-purple-600 mt-1">↑ 15% this month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalInsights; 