import React from 'react';
import { 
  Brain, Target, Zap, Eye, 
  TrendingUp, TrendingDown, Activity, Award,
  AlertTriangle, CheckCircle, Clock, BarChart3
} from 'lucide-react';

interface AIAnalyticsProps {
  className?: string;
}

export default function AIAnalytics({ className = '' }: AIAnalyticsProps) {
  const aiMetrics = [
    {
      metric: 'AI Accuracy',
      value: '97.8%',
      change: '+2.1%',
      trend: 'up',
      benchmark: '95%',
      icon: Target,
      color: 'text-medsight-ai-high'
    },
    {
      metric: 'Processing Speed',
      value: '24.7s',
      change: '-15%',
      trend: 'down',
      benchmark: '< 30s',
      icon: Zap,
      color: 'text-medsight-secondary'
    },
    {
      metric: 'Model Confidence',
      value: '94.2%',
      change: '+1.8%',
      trend: 'up',
      benchmark: '> 90%',
      icon: Brain,
      color: 'text-medsight-ai-high'
    },
    {
      metric: 'False Positive Rate',
      value: '1.2%',
      change: '-0.3%',
      trend: 'down',
      benchmark: '< 2%',
      icon: AlertTriangle,
      color: 'text-medsight-secondary'
    }
  ];

  const aiModels = [
    {
      model: 'Lung Cancer Detection',
      accuracy: 98.5,
      processed: 124567,
      confidence: 96.8,
      lastTrained: '2024-01-10',
      status: 'excellent'
    },
    {
      model: 'Cardiovascular Analysis',
      accuracy: 97.2,
      processed: 89234,
      confidence: 94.1,
      lastTrained: '2024-01-08',
      status: 'excellent'
    },
    {
      model: 'Neurological Imaging',
      accuracy: 96.8,
      processed: 67891,
      confidence: 92.4,
      lastTrained: '2024-01-12',
      status: 'good'
    },
    {
      model: 'Bone Fracture Detection',
      accuracy: 99.1,
      processed: 45678,
      confidence: 97.9,
      lastTrained: '2024-01-15',
      status: 'excellent'
    },
    {
      model: 'Tumor Classification',
      accuracy: 95.7,
      processed: 34567,
      confidence: 89.3,
      lastTrained: '2024-01-05',
      status: 'good'
    }
  ];

  const confidenceLevels = [
    { level: 'High Confidence (90-100%)', count: 218456, percentage: 78, color: 'bg-medsight-ai-high' },
    { level: 'Medium Confidence (70-90%)', count: 45678, percentage: 16, color: 'bg-medsight-pending' },
    { level: 'Low Confidence (<70%)', count: 16890, percentage: 6, color: 'bg-medsight-abnormal' }
  ];

  const aiInsights = [
    {
      insight: 'Model Performance Improvement',
      description: 'Lung cancer detection model accuracy increased by 2.1% this month',
      impact: 'high',
      type: 'improvement'
    },
    {
      insight: 'Processing Speed Optimization',
      description: 'Average AI analysis time reduced by 15% through infrastructure upgrades',
      impact: 'medium',
      type: 'optimization'
    },
    {
      insight: 'False Positive Reduction',
      description: 'Implemented new validation algorithms reducing false positives by 0.3%',
      impact: 'high',
      type: 'accuracy'
    },
    {
      insight: 'Model Retraining Recommendation',
      description: 'Tumor classification model requires retraining based on recent data drift',
      impact: 'medium',
      type: 'maintenance'
    }
  ];

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

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-medsight-ai-high bg-medsight-ai-high/10';
      case 'medium': return 'text-medsight-pending bg-medsight-pending/10';
      case 'low': return 'text-medsight-secondary bg-medsight-secondary/10';
      default: return 'text-slate-500 bg-slate-100';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="w-4 h-4 text-medsight-ai-high" />;
      case 'optimization': return <Zap className="w-4 h-4 text-medsight-secondary" />;
      case 'accuracy': return <Target className="w-4 h-4 text-medsight-ai-high" />;
      case 'maintenance': return <Clock className="w-4 h-4 text-medsight-pending" />;
      default: return <Brain className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <Brain className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">AI Analytics</h3>
            <p className="text-sm text-slate-600">AI model performance and insights</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-medsight-ai-high rounded-full animate-pulse"></div>
          <span className="text-sm text-medsight-ai-high font-medium">AI Active</span>
        </div>
      </div>

      {/* AI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {aiMetrics.map((metric, index) => (
          <div key={index} className="medsight-control-glass rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <span className={`text-xs ${metric.trend === 'up' ? 'text-medsight-secondary' : 'text-medsight-secondary'}`}>
                {metric.change}
              </span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
              {metric.trend === 'up' ? 
                <TrendingUp className="w-4 h-4 text-medsight-secondary" /> : 
                <TrendingDown className="w-4 h-4 text-medsight-secondary" />
              }
            </div>
            <p className="text-xs text-slate-600 mb-1">{metric.metric}</p>
            <p className="text-xs text-slate-500">Target: {metric.benchmark}</p>
          </div>
        ))}
      </div>

      {/* AI Models Performance */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">AI Model Performance</h4>
        <div className="medsight-control-glass rounded-lg p-4">
          <div className="space-y-4">
            {aiModels.map((model, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-medsight-ai-high/10 rounded-full flex items-center justify-center">
                    <Brain className="w-3 h-3 text-medsight-ai-high" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-800">{model.model}</span>
                    <p className="text-xs text-slate-600">Last trained: {model.lastTrained}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <span className="text-xs text-slate-600 block">Accuracy</span>
                    <span className={`text-sm font-medium ${getAccuracyColor(model.accuracy)}`}>
                      {model.accuracy}%
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-slate-600 block">Processed</span>
                    <span className="text-sm font-medium text-slate-800">
                      {(model.processed / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-slate-600 block">Confidence</span>
                    <span className="text-sm font-medium text-medsight-ai-high">
                      {model.confidence}%
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(model.status)}`}>
                    {model.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confidence Levels & AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Confidence Levels */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">AI Confidence Distribution</h4>
          <div className="medsight-control-glass rounded-lg p-4">
            <div className="space-y-3">
              {confidenceLevels.map((level, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                    <span className="text-sm font-medium text-slate-800">{level.level}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-2 bg-slate-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${level.color}`}
                        style={{ width: `${level.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right min-w-16">
                      <span className="text-sm font-medium text-slate-800">{level.percentage}%</span>
                      <span className="text-xs text-slate-500 block">{level.count.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">AI Insights</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {aiInsights.map((insight, index) => (
              <div key={index} className="medsight-control-glass rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <div className="medsight-ai-glass p-2 rounded-lg">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-slate-800 text-sm">{insight.insight}</h5>
                      <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(insight.impact)}`}>
                        {insight.impact}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">AI Management</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <BarChart3 className="w-3 h-3 mr-1" />
              Model Performance
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Award className="w-3 h-3 mr-1" />
              Benchmarks
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Activity className="w-3 h-3 mr-1" />
              Real-time Monitor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 