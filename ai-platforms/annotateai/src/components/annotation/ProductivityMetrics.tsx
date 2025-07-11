'use client';

import { useState, useEffect } from 'react';

export interface ProductivityMetrics {
  annotatorId: string;
  annotatorName: string;
  timeRange: {
    start: string;
    end: string;
  };
  annotations: {
    total: number;
    completed: number;
    reviewed: number;
    approved: number;
    rejected: number;
    pending: number;
  };
  time: {
    totalTimeMinutes: number;
    activeTimeMinutes: number;
    averagePerAnnotation: number;
    sessions: number;
    longestSession: number;
  };
  quality: {
    averageScore: number;
    accuracyRate: number;
    consistencyScore: number;
    rejectionRate: number;
    revisionRequests: number;
  };
  efficiency: {
    annotationsPerHour: number;
    annotationsPerDay: number;
    improvementRate: number;
    streakDays: number;
    productivity: 'excellent' | 'good' | 'average' | 'needs_improvement';
  };
  tools: {
    mostUsed: string;
    efficiency: Record<string, number>;
    shortcuts: number;
    errors: number;
  };
  categories: Record<string, {
    count: number;
    averageTime: number;
    accuracy: number;
  }>;
  trends: Array<{
    date: string;
    annotations: number;
    timeMinutes: number;
    qualityScore: number;
  }>;
  goals: {
    dailyTarget: number;
    qualityTarget: number;
    progress: number;
    streakTarget: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    achievedAt: string;
    icon: string;
  }>;
}

interface ProductivityMetricsProps {
  visible: boolean;
  onClose: () => void;
  annotatorId?: string;
  timeRange?: '1d' | '7d' | '30d' | '90d';
  showComparison?: boolean;
}

const mockMetrics: ProductivityMetrics = {
  annotatorId: 'annotator_001',
  annotatorName: 'Sarah Chen',
  timeRange: {
    start: '2024-01-01T00:00:00Z',
    end: '2024-01-30T23:59:59Z'
  },
  annotations: {
    total: 1247,
    completed: 1198,
    reviewed: 1156,
    approved: 1089,
    rejected: 67,
    pending: 49
  },
  time: {
    totalTimeMinutes: 3480, // 58 hours
    activeTimeMinutes: 2950, // 49.2 hours
    averagePerAnnotation: 2.8,
    sessions: 24,
    longestSession: 240 // 4 hours
  },
  quality: {
    averageScore: 92.5,
    accuracyRate: 94.2,
    consistencyScore: 89.8,
    rejectionRate: 5.8,
    revisionRequests: 23
  },
  efficiency: {
    annotationsPerHour: 24.3,
    annotationsPerDay: 52.4,
    improvementRate: 12.8,
    streakDays: 14,
    productivity: 'excellent'
  },
  tools: {
    mostUsed: 'bbox',
    efficiency: {
      bbox: 95.2,
      polygon: 87.6,
      keypoints: 82.1,
      classification: 98.1
    },
    shortcuts: 156,
    errors: 12
  },
  categories: {
    person: { count: 456, averageTime: 2.1, accuracy: 96.3 },
    vehicle: { count: 312, averageTime: 1.8, accuracy: 94.7 },
    animal: { count: 189, averageTime: 3.2, accuracy: 91.2 },
    object: { count: 290, averageTime: 1.5, accuracy: 93.8 }
  },
  trends: [
    { date: '2024-01-01', annotations: 45, timeMinutes: 180, qualityScore: 89.2 },
    { date: '2024-01-02', annotations: 52, timeMinutes: 195, qualityScore: 91.5 },
    { date: '2024-01-03', annotations: 48, timeMinutes: 172, qualityScore: 93.1 },
    { date: '2024-01-04', annotations: 56, timeMinutes: 205, qualityScore: 92.8 },
    { date: '2024-01-05', annotations: 61, timeMinutes: 220, qualityScore: 94.2 },
    { date: '2024-01-06', annotations: 49, timeMinutes: 168, qualityScore: 93.7 },
    { date: '2024-01-07', annotations: 53, timeMinutes: 185, qualityScore: 95.1 }
  ],
  goals: {
    dailyTarget: 50,
    qualityTarget: 90,
    progress: 87.3,
    streakTarget: 20
  },
  achievements: [
    {
      id: 'streak_14',
      name: '14-Day Streak',
      description: 'Completed daily annotation goals for 14 consecutive days',
      achievedAt: '2024-01-15T10:30:00Z',
      icon: 'fire'
    },
    {
      id: 'quality_master',
      name: 'Quality Master',
      description: 'Maintained 90%+ quality score for one month',
      achievedAt: '2024-01-20T14:20:00Z',
      icon: 'star'
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Annotated 100+ items in a single day',
      achievedAt: '2024-01-12T18:45:00Z',
      icon: 'lightning'
    }
  ]
};

export function ProductivityMetrics({ visible, onClose, annotatorId, timeRange = '30d', showComparison = false }: ProductivityMetricsProps) {
  const [metrics, setMetrics] = useState<ProductivityMetrics>(mockMetrics);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'trends' | 'goals'>('overview');
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<ProductivityMetrics | null>(null);

  useEffect(() => {
    if (visible) {
      loadMetrics();
    }
  }, [visible, annotatorId, selectedTimeRange]);

  const loadMetrics = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real implementation, fetch metrics based on annotatorId and timeRange
    setMetrics(mockMetrics);
    
    if (showComparison) {
      // Load comparison data (team average, previous period, etc.)
      setComparisonData({
        ...mockMetrics,
        annotatorName: 'Team Average',
        quality: { ...mockMetrics.quality, averageScore: 87.2 },
        efficiency: { ...mockMetrics.efficiency, annotationsPerHour: 18.6 }
      });
    }
    
    setLoading(false);
  };

  const getProductivityColor = (productivity: string) => {
    switch (productivity) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'needs_improvement': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Productivity Analytics
            </h2>
            <p className="text-gray-600 mt-1">
              Performance metrics for {metrics.annotatorName} - {selectedTimeRange.replace('d', ' days')}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1d">Last Day</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  activeTab === 'overview' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('detailed')}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  activeTab === 'detailed' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Detailed
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  activeTab === 'trends' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Trends
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  activeTab === 'goals' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Goals
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading productivity metrics...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Annotations</p>
                          <p className="text-2xl font-bold text-indigo-600">{formatNumber(metrics.annotations.total)}</p>
                          <p className="text-xs text-green-600">+12.5% vs last period</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Quality Score</p>
                          <p className="text-2xl font-bold text-green-600">{metrics.quality.averageScore.toFixed(1)}%</p>
                          <p className="text-xs text-green-600">+2.3% vs last period</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Efficiency</p>
                          <p className="text-2xl font-bold text-blue-600">{metrics.efficiency.annotationsPerHour.toFixed(1)}/hr</p>
                          <p className="text-xs text-blue-600">+8.7% vs last period</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Active Time</p>
                          <p className="text-2xl font-bold text-purple-600">{formatTime(metrics.time.activeTimeMinutes)}</p>
                          <p className="text-xs text-purple-600">{metrics.time.sessions} sessions</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Annotation Status</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Completed</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(metrics.annotations.completed / metrics.annotations.total) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-medium text-gray-900">{metrics.annotations.completed}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Approved</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(metrics.annotations.approved / metrics.annotations.total) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-medium text-gray-900">{metrics.annotations.approved}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Rejected</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${(metrics.annotations.rejected / metrics.annotations.total) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-medium text-gray-900">{metrics.annotations.rejected}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Pending</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full"
                                style={{ width: `${(metrics.annotations.pending / metrics.annotations.total) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-medium text-gray-900">{metrics.annotations.pending}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tool Efficiency</h3>
                      <div className="space-y-3">
                        {Object.entries(metrics.tools.efficiency).map(([tool, efficiency]) => (
                          <div key={tool} className="flex items-center justify-between">
                            <span className="text-gray-600 capitalize">{tool}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                  style={{ width: `${efficiency}%` }}
                                ></div>
                              </div>
                              <span className="font-medium text-gray-900">{efficiency.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Keyboard shortcuts used</span>
                          <span className="font-medium text-gray-900">{metrics.tools.shortcuts}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Productivity Status */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Productivity Assessment</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProductivityColor(metrics.efficiency.productivity)}`}>
                        {metrics.efficiency.productivity.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{metrics.efficiency.streakDays}</div>
                        <div className="text-sm text-gray-600">Day Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{metrics.efficiency.improvementRate.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Improvement Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{metrics.quality.rejectionRate.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Rejection Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'detailed' && (
                <div className="space-y-6">
                  {/* Category Performance */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Category</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-gray-600">Category</th>
                            <th className="text-right py-2 text-gray-600">Count</th>
                            <th className="text-right py-2 text-gray-600">Avg Time</th>
                            <th className="text-right py-2 text-gray-600">Accuracy</th>
                            <th className="text-right py-2 text-gray-600">Performance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(metrics.categories).map(([category, stats]) => (
                            <tr key={category} className="border-b border-gray-100">
                              <td className="py-2 font-medium text-gray-900 capitalize">{category}</td>
                              <td className="text-right py-2 text-gray-600">{stats.count}</td>
                              <td className="text-right py-2 text-gray-600">{stats.averageTime.toFixed(1)}m</td>
                              <td className="text-right py-2 text-gray-600">{stats.accuracy.toFixed(1)}%</td>
                              <td className="text-right py-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2 ml-auto">
                                  <div 
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                    style={{ width: `${stats.accuracy}%` }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Time Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Analysis</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Total Time</span>
                          <span className="font-medium text-gray-900">{formatTime(metrics.time.totalTimeMinutes)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Active Time</span>
                          <span className="font-medium text-gray-900">{formatTime(metrics.time.activeTimeMinutes)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Average per Annotation</span>
                          <span className="font-medium text-gray-900">{metrics.time.averagePerAnnotation.toFixed(1)}m</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Sessions</span>
                          <span className="font-medium text-gray-900">{metrics.time.sessions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Longest Session</span>
                          <span className="font-medium text-gray-900">{formatTime(metrics.time.longestSession)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Average Score</span>
                          <span className="font-medium text-gray-900">{metrics.quality.averageScore.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Accuracy Rate</span>
                          <span className="font-medium text-gray-900">{metrics.quality.accuracyRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Consistency</span>
                          <span className="font-medium text-gray-900">{metrics.quality.consistencyScore.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Rejection Rate</span>
                          <span className="font-medium text-gray-900">{metrics.quality.rejectionRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Revision Requests</span>
                          <span className="font-medium text-gray-900">{metrics.quality.revisionRequests}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'trends' && (
                <div className="space-y-6">
                  {/* Trends Chart */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                      {metrics.trends.map((trend, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="flex flex-col items-center space-y-1 mb-2">
                            <div 
                              className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-sm"
                              style={{ height: `${(trend.annotations / 70) * 150}px`, minHeight: '4px' }}
                              title={`${trend.annotations} annotations`}
                            ></div>
                            <div 
                              className="w-full bg-gradient-to-t from-green-500 to-blue-500 rounded-t-sm"
                              style={{ height: `${(trend.qualityScore / 100) * 50}px`, minHeight: '2px' }}
                              title={`${trend.qualityScore.toFixed(1)}% quality`}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 transform rotate-45 origin-left">
                            {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded"></div>
                        <span className="text-gray-600">Annotations</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded"></div>
                        <span className="text-gray-600">Quality Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                    <div className="space-y-3">
                      {metrics.achievements.map(achievement => (
                        <div key={achievement.id} className="flex items-center space-x-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <AchievementIcon name={achievement.icon} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{achievement.name}</div>
                            <div className="text-sm text-gray-600">{achievement.description}</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(achievement.achievedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'goals' && (
                <div className="space-y-6">
                  {/* Goal Progress */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Progress</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Daily Annotation Target</span>
                          <span className="font-medium text-gray-900">{metrics.efficiency.annotationsPerDay.toFixed(0)} / {metrics.goals.dailyTarget}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full"
                            style={{ width: `${Math.min((metrics.efficiency.annotationsPerDay / metrics.goals.dailyTarget) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Quality Target</span>
                          <span className="font-medium text-gray-900">{metrics.quality.averageScore.toFixed(1)}% / {metrics.goals.qualityTarget}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                            style={{ width: `${Math.min((metrics.quality.averageScore / metrics.goals.qualityTarget) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Streak Target</span>
                          <span className="font-medium text-gray-900">{metrics.efficiency.streakDays} / {metrics.goals.streakTarget} days</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                            style={{ width: `${Math.min((metrics.efficiency.streakDays / metrics.goals.streakTarget) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Goal Setting */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Adjust Goals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Daily Annotations
                        </label>
                        <input
                          type="number"
                          value={metrics.goals.dailyTarget}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quality Target (%)
                        </label>
                        <input
                          type="number"
                          value={metrics.goals.qualityTarget}
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Streak Target (days)
                        </label>
                        <input
                          type="number"
                          value={metrics.goals.streakTarget}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Update Goals
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AchievementIcon({ name }: { name: string }) {
  switch (name) {
    case 'fire':
      return <span className="text-orange-500 text-lg">🔥</span>;
    case 'star':
      return <span className="text-yellow-500 text-lg">⭐</span>;
    case 'lightning':
      return <span className="text-blue-500 text-lg">⚡</span>;
    default:
      return <span className="text-purple-500 text-lg">🏆</span>;
  }
} 