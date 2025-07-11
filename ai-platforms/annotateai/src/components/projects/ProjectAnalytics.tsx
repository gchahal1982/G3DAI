'use client';

import React, { useState, useEffect } from 'react';

interface AnalyticsData {
  overview: {
    totalAnnotations: number;
    completedAnnotations: number;
    pendingAnnotations: number;
    reviewedAnnotations: number;
    progress: number;
    qualityScore: number;
    estimatedCompletion: string;
  };
  productivity: {
    annotationsPerDay: number;
    averageTimePerAnnotation: number;
    activeAnnotators: number;
    peakProductivityHour: string;
    weeklyTrend: { day: string; annotations: number; time: number }[];
  };
  quality: {
    overallScore: number;
    interAnnotatorAgreement: number;
    reviewAcceptanceRate: number;
    commonIssues: { issue: string; count: number; severity: 'low' | 'medium' | 'high' }[];
  };
  collaboration: {
    totalCollaborators: number;
    activeToday: number;
    contributions: { name: string; annotations: number; quality: number; role: string }[];
    activity: { date: string; user: string; action: string; count: number }[];
  };
  costs: {
    totalCost: number;
    costPerAnnotation: number;
    budgetUsed: number;
    projectedCost: number;
    breakdown: { category: string; amount: number; percentage: number }[];
  };
}

interface ProjectAnalyticsProps {
  projectId: string;
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

export default function ProjectAnalytics({ projectId, timeRange = '30d' }: ProjectAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'productivity' | 'quality' | 'collaboration' | 'costs'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, [projectId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/projects/${projectId}/analytics?timeRange=${timeRange}`);
      // const data = await response.json();
      
      // Mock data for development
      const mockData: AnalyticsData = {
        overview: {
          totalAnnotations: 5420,
          completedAnnotations: 3650,
          pendingAnnotations: 1200,
          reviewedAnnotations: 2890,
          progress: 67.3,
          qualityScore: 94.2,
          estimatedCompletion: '2024-03-15'
        },
        productivity: {
          annotationsPerDay: 85,
          averageTimePerAnnotation: 4.2,
          activeAnnotators: 8,
          peakProductivityHour: '2:00 PM',
          weeklyTrend: [
            { day: 'Mon', annotations: 120, time: 3.8 },
            { day: 'Tue', annotations: 98, time: 4.1 },
            { day: 'Wed', annotations: 156, time: 3.9 },
            { day: 'Thu', annotations: 143, time: 4.3 },
            { day: 'Fri', annotations: 89, time: 4.7 },
            { day: 'Sat', annotations: 45, time: 5.1 },
            { day: 'Sun', annotations: 23, time: 4.8 }
          ]
        },
        quality: {
          overallScore: 94.2,
          interAnnotatorAgreement: 89.7,
          reviewAcceptanceRate: 92.1,
          commonIssues: [
            { issue: 'Inconsistent boundary marking', count: 23, severity: 'medium' },
            { issue: 'Missing small objects', count: 18, severity: 'high' },
            { issue: 'Incorrect class assignment', count: 12, severity: 'low' },
            { issue: 'Overlapping annotations', count: 8, severity: 'medium' }
          ]
        },
        collaboration: {
          totalCollaborators: 12,
          activeToday: 8,
          contributions: [
            { name: 'Sarah Chen', annotations: 890, quality: 96.5, role: 'Senior Annotator' },
            { name: 'Mark Johnson', annotations: 756, quality: 93.2, role: 'Annotator' },
            { name: 'Lisa Wang', annotations: 623, quality: 95.1, role: 'Reviewer' },
            { name: 'David Kim', annotations: 589, quality: 91.8, role: 'Annotator' },
            { name: 'Emma Wilson', annotations: 445, quality: 94.7, role: 'Junior Annotator' }
          ],
          activity: [
            { date: '2024-01-20', user: 'Sarah Chen', action: 'annotations_created', count: 45 },
            { date: '2024-01-20', user: 'Mark Johnson', action: 'annotations_reviewed', count: 32 },
            { date: '2024-01-19', user: 'Lisa Wang', action: 'quality_check', count: 28 }
          ]
        },
        costs: {
          totalCost: 12450,
          costPerAnnotation: 3.41,
          budgetUsed: 68.2,
          projectedCost: 18250,
          breakdown: [
            { category: 'Annotation Labor', amount: 8900, percentage: 71.5 },
            { category: 'Review & QA', amount: 2100, percentage: 16.9 },
            { category: 'AI Processing', amount: 850, percentage: 6.8 },
            { category: 'Platform Usage', amount: 600, percentage: 4.8 }
          ]
        }
      };
      
      setAnalytics(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'annotations':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'quality':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'time':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'users':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case 'cost':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return 'text-yellow-400 bg-yellow-400/10';
      case 'medium': return 'text-orange-400 bg-orange-400/10';
      case 'high': return 'text-red-400 bg-red-400/10';
    }
  };

  if (loading) {
    return (
      <div className="annotate-glass rounded-xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="annotate-glass rounded-xl p-8 text-center">
        <div className="text-white/40 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-white/70">Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="annotate-glass rounded-xl p-2">
        <div className="flex items-center gap-1">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'productivity', label: 'Productivity', icon: '⚡' },
            { key: 'quality', label: 'Quality', icon: '✅' },
            { key: 'collaboration', label: 'Team', icon: '👥' },
            { key: 'costs', label: 'Costs', icon: '💰' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Total Annotations</span>
                <div className="text-indigo-400">{getMetricIcon('annotations')}</div>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.overview.totalAnnotations.toLocaleString()}</div>
              <div className="text-xs text-green-400 mt-1">
                {analytics.overview.completedAnnotations} completed
              </div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Progress</span>
                <div className="text-green-400">{getMetricIcon('quality')}</div>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.overview.progress}%</div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  style={{ width: `${analytics.overview.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Quality Score</span>
                <div className="text-purple-400">{getMetricIcon('quality')}</div>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.overview.qualityScore}%</div>
              <div className="text-xs text-purple-400 mt-1">
                Above target (90%)
              </div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Est. Completion</span>
                <div className="text-cyan-400">{getMetricIcon('time')}</div>
              </div>
              <div className="text-lg font-bold text-white">
                {new Date(analytics.overview.estimatedCompletion).toLocaleDateString()}
              </div>
              <div className="text-xs text-cyan-400 mt-1">
                In 8 weeks
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="annotate-glass rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Annotation Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Completed</span>
                  <span className="text-green-400 font-medium">
                    {analytics.overview.completedAnnotations.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Pending</span>
                  <span className="text-yellow-400 font-medium">
                    {analytics.overview.pendingAnnotations.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Under Review</span>
                  <span className="text-blue-400 font-medium">
                    {analytics.overview.reviewedAnnotations.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="annotate-glass rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Project Health</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/80 text-sm">Annotation Quality</span>
                    <span className="text-white font-medium">{analytics.overview.qualityScore}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full"
                      style={{ width: `${analytics.overview.qualityScore}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/80 text-sm">Completion Rate</span>
                    <span className="text-white font-medium">{analytics.overview.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      style={{ width: `${analytics.overview.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Productivity Tab */}
      {selectedTab === 'productivity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Daily Output</span>
                <div className="text-cyan-400">{getMetricIcon('annotations')}</div>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.productivity.annotationsPerDay}</div>
              <div className="text-xs text-cyan-400 mt-1">annotations/day</div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Avg Time</span>
                <div className="text-orange-400">{getMetricIcon('time')}</div>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.productivity.averageTimePerAnnotation}m</div>
              <div className="text-xs text-orange-400 mt-1">per annotation</div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Active Users</span>
                <div className="text-green-400">{getMetricIcon('users')}</div>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.productivity.activeAnnotators}</div>
              <div className="text-xs text-green-400 mt-1">currently active</div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Peak Hour</span>
                <div className="text-purple-400">{getMetricIcon('time')}</div>
              </div>
              <div className="text-xl font-bold text-white">{analytics.productivity.peakProductivityHour}</div>
              <div className="text-xs text-purple-400 mt-1">most productive</div>
            </div>
          </div>

          <div className="annotate-glass rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Weekly Productivity Trend</h3>
            <div className="space-y-4">
              {analytics.productivity.weeklyTrend.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-white/70 text-sm">{day.day}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/80 text-sm">{day.annotations} annotations</span>
                      <span className="text-white/60 text-sm">{day.time}m avg</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${(day.annotations / 200) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quality Tab */}
      {selectedTab === 'quality' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Overall Score</span>
                <div className="text-green-400">{getMetricIcon('quality')}</div>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.quality.overallScore}%</div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Agreement</span>
                <div className="text-blue-400">{getMetricIcon('quality')}</div>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.quality.interAnnotatorAgreement}%</div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Acceptance Rate</span>
                <div className="text-purple-400">{getMetricIcon('quality')}</div>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.quality.reviewAcceptanceRate}%</div>
            </div>
          </div>

          <div className="annotate-glass rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Common Quality Issues</h3>
            <div className="space-y-3">
              {analytics.quality.commonIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                      {issue.severity}
                    </span>
                    <span className="text-white/90">{issue.issue}</span>
                  </div>
                  <span className="text-white/70 font-medium">{issue.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Tab */}
      {selectedTab === 'collaboration' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Total Members</span>
                <div className="text-indigo-400">{getMetricIcon('users')}</div>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.collaboration.totalCollaborators}</div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Active Today</span>
                <div className="text-green-400">{getMetricIcon('users')}</div>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.collaboration.activeToday}</div>
            </div>
          </div>

          <div className="annotate-glass rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Team Contributions</h3>
            <div className="space-y-3">
              {analytics.collaboration.contributions.map((contributor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {contributor.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{contributor.name}</div>
                      <div className="text-white/60 text-sm">{contributor.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{contributor.annotations}</div>
                    <div className="text-green-400 text-sm">{contributor.quality}% quality</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Costs Tab */}
      {selectedTab === 'costs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Total Cost</span>
                <div className="text-green-400">{getMetricIcon('cost')}</div>
              </div>
              <div className="text-2xl font-bold text-white">${analytics.costs.totalCost.toLocaleString()}</div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Cost per Item</span>
                <div className="text-blue-400">{getMetricIcon('cost')}</div>
              </div>
              <div className="text-2xl font-bold text-white">${analytics.costs.costPerAnnotation}</div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Budget Used</span>
                <div className="text-orange-400">{getMetricIcon('cost')}</div>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.costs.budgetUsed}%</div>
            </div>

            <div className="annotate-ai-glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Projected Total</span>
                <div className="text-purple-400">{getMetricIcon('cost')}</div>
              </div>
              <div className="text-2xl font-bold text-white">${analytics.costs.projectedCost.toLocaleString()}</div>
            </div>
          </div>

          <div className="annotate-glass rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Cost Breakdown</h3>
            <div className="space-y-4">
              {analytics.costs.breakdown.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">{item.category}</span>
                    <span className="text-white font-medium">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 