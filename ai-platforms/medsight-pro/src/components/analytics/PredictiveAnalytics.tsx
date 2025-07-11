'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Users,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Zap,
  Shield,
  DollarSign,
  Settings,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';

interface PredictiveAnalyticsProps {
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
  timeRange: string;
}

interface PredictionModel {
  id: string;
  name: string;
  accuracy: number;
  lastUpdated: Date;
  status: 'active' | 'training' | 'error';
  predictions: number;
}

interface RiskFactor {
  category: string;
  score: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface ForecastData {
  category: string;
  current: number;
  predicted: number;
  variance: number;
  confidence: number;
  timeframe: string;
}

export default function PredictiveAnalytics({ predictions, timeRange }: PredictiveAnalyticsProps) {
  const [selectedModel, setSelectedModel] = useState('patient-volume');
  const [refreshing, setRefreshing] = useState(false);
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);

  useEffect(() => {
    loadPredictiveData();
  }, [timeRange]);

  const loadPredictiveData = async () => {
    setRefreshing(true);
    
    try {
      // Mock prediction models
      const mockModels: PredictionModel[] = [
        {
          id: 'patient-volume',
          name: 'Patient Volume Prediction',
          accuracy: 92.4,
          lastUpdated: new Date(Date.now() - 1000 * 60 * 30),
          status: 'active',
          predictions: 1247
        },
        {
          id: 'resource-demand',
          name: 'Resource Demand Forecasting',
          accuracy: 89.7,
          lastUpdated: new Date(Date.now() - 1000 * 60 * 15),
          status: 'active',
          predictions: 892
        },
        {
          id: 'risk-assessment',
          name: 'Risk Assessment Model',
          accuracy: 94.1,
          lastUpdated: new Date(Date.now() - 1000 * 60 * 45),
          status: 'active',
          predictions: 567
        },
        {
          id: 'capacity-planning',
          name: 'Capacity Planning Model',
          accuracy: 87.3,
          lastUpdated: new Date(Date.now() - 1000 * 60 * 120),
          status: 'training',
          predictions: 234
        }
      ];

      // Mock risk factors
      const mockRiskFactors: RiskFactor[] = [
        {
          category: 'Operational',
          score: 15.2,
          trend: 'decreasing',
          impact: 'medium',
          recommendations: [
            'Optimize staff scheduling during peak hours',
            'Implement predictive maintenance for equipment',
            'Enhance resource allocation algorithms'
          ]
        },
        {
          category: 'Clinical',
          score: 8.7,
          trend: 'stable',
          impact: 'low',
          recommendations: [
            'Continue monitoring diagnostic accuracy',
            'Maintain current quality assurance protocols',
            'Regular clinical staff training updates'
          ]
        },
        {
          category: 'Financial',
          score: 12.4,
          trend: 'increasing',
          impact: 'medium',
          recommendations: [
            'Review billing processes for efficiency',
            'Optimize resource utilization',
            'Implement cost-saving measures'
          ]
        },
        {
          category: 'Compliance',
          score: 5.1,
          trend: 'decreasing',
          impact: 'low',
          recommendations: [
            'Maintain current compliance standards',
            'Regular audit compliance checks',
            'Staff training on regulatory updates'
          ]
        }
      ];

      // Mock forecast data
      const mockForecasts: ForecastData[] = [
        {
          category: 'Patient Volume',
          current: 1650,
          predicted: 1840,
          variance: 11.5,
          confidence: 92.4,
          timeframe: 'Next 30 days'
        },
        {
          category: 'Resource Demand',
          current: 72,
          predicted: 82,
          variance: 13.9,
          confidence: 89.7,
          timeframe: 'Next 30 days'
        },
        {
          category: 'Equipment Usage',
          current: 68,
          predicted: 75,
          variance: 10.3,
          confidence: 87.1,
          timeframe: 'Next 30 days'
        },
        {
          category: 'Staff Requirements',
          current: 145,
          predicted: 162,
          variance: 11.7,
          confidence: 90.3,
          timeframe: 'Next 30 days'
        }
      ];

      setModels(mockModels);
      setRiskFactors(mockRiskFactors);
      setForecasts(mockForecasts);
    } catch (error) {
      console.error('Failed to load predictive analytics data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'training': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBackground = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-50 border-green-200';
      case 'training': return 'bg-blue-50 border-blue-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (score: number): string => {
    if (score < 10) return 'text-green-600';
    if (score < 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBackground = (score: number): string => {
    if (score < 10) return 'bg-green-50 border-green-200';
    if (score < 20) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'stable':
        return <ArrowRight className="w-4 h-4 text-gray-600" />;
      default:
        return <ArrowRight className="w-4 h-4 text-gray-600" />;
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

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimeAgo = (date: Date): string => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics</h2>
          <p className="text-gray-600">AI-powered forecasting and risk assessment</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadPredictiveData}
            disabled={refreshing}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Models
          </button>
          <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trend Direction</p>
              <p className="text-2xl font-bold text-blue-600 capitalize">{predictions.trendAnalysis.direction}</p>
              <p className="text-sm text-gray-500">Confidence: {formatPercentage(predictions.trendAnalysis.confidence)}</p>
            </div>
            {predictions.trendAnalysis.direction === 'up' ? (
              <ArrowUpRight className="w-8 h-8 text-green-600" />
            ) : predictions.trendAnalysis.direction === 'down' ? (
              <ArrowDownRight className="w-8 h-8 text-red-600" />
            ) : (
              <ArrowRight className="w-8 h-8 text-gray-600" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Operational Risk</p>
              <p className={`text-2xl font-bold ${getRiskColor(predictions.riskScores.operational)}`}>
                {formatPercentage(predictions.riskScores.operational)}
              </p>
              <p className="text-sm text-gray-500">Next 30 days</p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clinical Risk</p>
              <p className={`text-2xl font-bold ${getRiskColor(predictions.riskScores.clinical)}`}>
                {formatPercentage(predictions.riskScores.clinical)}
              </p>
              <p className="text-sm text-gray-500">Quality metrics</p>
            </div>
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Financial Risk</p>
              <p className={`text-2xl font-bold ${getRiskColor(predictions.riskScores.financial)}`}>
                {formatPercentage(predictions.riskScores.financial)}
              </p>
              <p className="text-sm text-gray-500">Cost optimization</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Forecast Data */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Forecasting Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forecasts.map((forecast, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">{forecast.category}</h4>
                <div className={`text-sm font-medium ${getConfidenceColor(forecast.confidence)}`}>
                  {formatPercentage(forecast.confidence)} confidence
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Current</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(forecast.current)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Predicted</p>
                  <p className="text-xl font-bold text-blue-600">{formatNumber(forecast.predicted)}</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Variance</span>
                  <span className={`text-xs font-medium ${forecast.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {forecast.variance > 0 ? '+' : ''}{formatPercentage(forecast.variance)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">Timeframe</span>
                  <span className="text-xs text-gray-700">{forecast.timeframe}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prediction Models */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">AI Prediction Models</h3>
        <div className="space-y-4">
          {models.map((model) => (
            <div key={model.id} className={`p-4 rounded-lg border ${getStatusBackground(model.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Brain className={`w-5 h-5 ${getStatusColor(model.status)}`} />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{model.name}</h4>
                    <p className="text-xs text-gray-500">Updated {formatTimeAgo(model.lastUpdated)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{formatPercentage(model.accuracy)}</p>
                    <p className="text-xs text-gray-500">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{formatNumber(model.predictions)}</p>
                    <p className="text-xs text-gray-500">Predictions</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(model.status)}`}>
                    {model.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment</h3>
        <div className="space-y-4">
          {riskFactors.map((factor, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getRiskBackground(factor.score)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">{factor.category} Risk</h4>
                    {getTrendIcon(factor.trend)}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`text-lg font-bold ${getRiskColor(factor.score)}`}>
                    {formatPercentage(factor.score)}
                  </div>
                  {getImpactBadge(factor.impact)}
                </div>
              </div>
              
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">Recommendations:</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  {factor.recommendations.map((rec, recIndex) => (
                    <li key={recIndex} className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Trend Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Patient Volume Trend</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {predictions.trendAnalysis.direction === 'up' ? '+' : predictions.trendAnalysis.direction === 'down' ? '-' : ''}
                    {Math.abs(predictions.patientVolumeForecast[predictions.patientVolumeForecast.length - 1] - predictions.patientVolumeForecast[0])}
                  </p>
                  <p className="text-sm text-blue-600">Expected change</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">Resource Optimization</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.max(...predictions.resourceDemandForecast)}%
                  </p>
                  <p className="text-sm text-green-600">Peak utilization</p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-800 mb-2">Prediction Accuracy</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPercentage(models.reduce((acc, model) => acc + model.accuracy, 0) / models.length)}
                  </p>
                  <p className="text-sm text-purple-600">Average accuracy</p>
                </div>
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Model Confidence</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatPercentage(predictions.trendAnalysis.confidence)}
                  </p>
                  <p className="text-sm text-yellow-600">Overall confidence</p>
                </div>
                <CheckCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 