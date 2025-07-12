import React from 'react';
import { 
  Activity, Heart, Brain, Eye, 
  TrendingUp, TrendingDown, Target, Award,
  Calendar, Users, BarChart3, PieChart
} from 'lucide-react';

interface MedicalAnalyticsProps {
  className?: string;
}

export default function MedicalAnalytics({ className = '' }: MedicalAnalyticsProps) {
  const medicalMetrics = [
    {
      category: 'Diagnostic Accuracy',
      value: '97.8%',
      change: '+2.1%',
      trend: 'up',
      target: '98%',
      icon: Target,
      color: 'text-medsight-ai-high'
    },
    {
      category: 'Studies Processed',
      value: '2.4M',
      change: '+18%',
      trend: 'up',
      target: '3M',
      icon: Activity,
      color: 'text-medsight-primary'
    },
    {
      category: 'AI Analysis Time',
      value: '24.7s',
      change: '-15%',
      trend: 'down',
      target: '< 30s',
      icon: Brain,
      color: 'text-medsight-secondary'
    },
    {
      category: 'Critical Findings',
      value: '8,247',
      change: '+12%',
      trend: 'up',
      target: 'Monitor',
      icon: Eye,
      color: 'text-medsight-abnormal'
    }
  ];

  const medicalSpecialties = [
    {
      specialty: 'Radiology',
      studies: 847234,
      accuracy: 98.2,
      avgTime: '22s',
      findings: 12847,
      color: 'bg-medsight-primary'
    },
    {
      specialty: 'Cardiology',
      studies: 423567,
      accuracy: 97.8,
      avgTime: '28s',
      findings: 8934,
      color: 'bg-medsight-ai-high'
    },
    {
      specialty: 'Neurology',
      studies: 234789,
      accuracy: 96.9,
      avgTime: '35s',
      findings: 5678,
      color: 'bg-medsight-secondary'
    },
    {
      specialty: 'Oncology',
      studies: 189456,
      accuracy: 98.5,
      avgTime: '31s',
      findings: 7234,
      color: 'bg-medsight-pending'
    },
    {
      specialty: 'Orthopedics',
      studies: 156789,
      accuracy: 97.1,
      avgTime: '19s',
      findings: 3456,
      color: 'bg-slate-400'
    }
  ];

  const qualityMetrics = [
    {
      metric: 'Sensitivity',
      value: '96.8%',
      benchmark: '95%',
      status: 'excellent'
    },
    {
      metric: 'Specificity',
      value: '98.2%',
      benchmark: '97%',
      status: 'excellent'
    },
    {
      metric: 'Positive Predictive Value',
      value: '94.7%',
      benchmark: '90%',
      status: 'excellent'
    },
    {
      metric: 'Negative Predictive Value',
      value: '99.1%',
      benchmark: '98%',
      status: 'excellent'
    }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-medsight-secondary" /> : 
      <TrendingDown className="w-4 h-4 text-medsight-secondary" />;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 98) return 'text-medsight-ai-high';
    if (accuracy >= 95) return 'text-medsight-secondary';
    if (accuracy >= 90) return 'text-medsight-pending';
    return 'text-medsight-abnormal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-medsight-ai-high bg-medsight-ai-high/10';
      case 'good': return 'text-medsight-secondary bg-medsight-secondary/10';
      case 'warning': return 'text-medsight-pending bg-medsight-pending/10';
      case 'critical': return 'text-medsight-abnormal bg-medsight-abnormal/10';
      default: return 'text-slate-500 bg-slate-100';
    }
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <Activity className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">Medical Analytics</h3>
            <p className="text-sm text-slate-600">Clinical data insights and outcomes</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-medsight-ai-high rounded-full animate-pulse"></div>
          <span className="text-sm text-medsight-ai-high font-medium">Live Data</span>
        </div>
      </div>

      {/* Medical Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {medicalMetrics.map((metric, index) => (
          <div key={index} className="medsight-control-glass rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <span className={`text-xs ${metric.trend === 'up' ? 'text-medsight-secondary' : 'text-medsight-secondary'}`}>
                {metric.change}
              </span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
              {getTrendIcon(metric.trend)}
            </div>
            <p className="text-xs text-slate-600 mb-1">{metric.category}</p>
            <p className="text-xs text-slate-500">Target: {metric.target}</p>
          </div>
        ))}
      </div>

      {/* Medical Specialties */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Performance by Medical Specialty</h4>
        <div className="medsight-control-glass rounded-lg p-4">
          <div className="space-y-4">
            {medicalSpecialties.map((specialty, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${specialty.color}`}></div>
                  <span className="text-sm font-medium text-slate-800">{specialty.specialty}</span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <span className="text-xs text-slate-600 block">Studies</span>
                    <span className="text-sm font-medium text-slate-800">
                      {(specialty.studies / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-slate-600 block">Accuracy</span>
                    <span className={`text-sm font-medium ${getAccuracyColor(specialty.accuracy)}`}>
                      {specialty.accuracy}%
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-slate-600 block">Avg Time</span>
                    <span className="text-sm font-medium text-medsight-secondary">
                      {specialty.avgTime}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-slate-600 block">Findings</span>
                    <span className="text-sm font-medium text-medsight-abnormal">
                      {specialty.findings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Clinical Quality Metrics</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {qualityMetrics.map((metric, index) => (
            <div key={index} className="medsight-control-glass rounded-lg p-4 text-center">
              <div className="mb-2">
                <p className="text-lg font-bold text-medsight-ai-high">{metric.value}</p>
                <p className="text-xs text-slate-600">{metric.metric}</p>
              </div>
              <div className="space-y-1">
                <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </div>
                <div className="text-xs text-slate-500">
                  Benchmark: {metric.benchmark}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Analytics Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">Medical Analytics</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <BarChart3 className="w-3 h-3 mr-1" />
              Detailed Report
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Calendar className="w-3 h-3 mr-1" />
              Historical Trends
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Award className="w-3 h-3 mr-1" />
              Quality Metrics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 