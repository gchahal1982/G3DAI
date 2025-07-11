'use client';

import { useState, useEffect } from 'react';
import { ReviewItem } from '@/app/projects/[id]/review/page';

interface QualityMetricsProps {
  projectId: string;
  reviewItems: ReviewItem[];
}

interface QualityMetrics {
  overallScore: number;
  totalAnnotations: number;
  reviewedAnnotations: number;
  approvedAnnotations: number;
  rejectedAnnotations: number;
  needsRevisionAnnotations: number;
  averageReviewTime: number;
  annotationTypes: Record<string, {
    count: number;
    averageScore: number;
    approvalRate: number;
  }>;
  reviewerStats: Record<string, {
    name: string;
    reviewed: number;
    averageScore: number;
    averageTime: number;
  }>;
  qualityTrends: Array<{
    date: string;
    score: number;
    reviewed: number;
    approved: number;
  }>;
  issueCategories: Record<string, number>;
  performanceMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    interAnnotatorAgreement: number;
  };
}

export function QualityMetrics({ projectId, reviewItems }: QualityMetricsProps) {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'score' | 'volume' | 'time'>('score');

  useEffect(() => {
    calculateMetrics();
  }, [reviewItems, timeRange]);

  const calculateMetrics = () => {
    if (!reviewItems.length) {
      setLoading(false);
      return;
    }

    // Filter items by time range
    const now = new Date();
    const cutoffDate = new Date();
    switch (timeRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        cutoffDate.setFullYear(2000); // Include all
    }

    const filteredItems = reviewItems.filter(item => 
      new Date(item.createdAt) >= cutoffDate
    );

    // Calculate basic metrics
    const totalAnnotations = filteredItems.length;
    const reviewedAnnotations = filteredItems.filter(item => 
      ['approved', 'rejected', 'needs_revision'].includes(item.status)
    ).length;
    const approvedAnnotations = filteredItems.filter(item => item.status === 'approved').length;
    const rejectedAnnotations = filteredItems.filter(item => item.status === 'rejected').length;
    const needsRevisionAnnotations = filteredItems.filter(item => item.status === 'needs_revision').length;

    // Calculate overall score
    const scoredItems = filteredItems.filter(item => item.qualityScore !== undefined);
    const overallScore = scoredItems.length > 0 
      ? scoredItems.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / scoredItems.length
      : 0;

    // Calculate average review time (mock calculation)
    const averageReviewTime = filteredItems
      .filter(item => item.reviewedAt && item.createdAt)
      .reduce((sum, item) => {
        const created = new Date(item.createdAt).getTime();
        const reviewed = new Date(item.reviewedAt!).getTime();
        return sum + (reviewed - created);
      }, 0) / Math.max(1, reviewedAnnotations) / (1000 * 60); // Convert to minutes

    // Calculate annotation type statistics
    const annotationTypes: Record<string, any> = {};
    filteredItems.forEach(item => {
      const type = item.metadata.annotationType;
      if (!annotationTypes[type]) {
        annotationTypes[type] = {
          count: 0,
          totalScore: 0,
          approved: 0,
          scored: 0
        };
      }
      annotationTypes[type].count++;
      if (item.qualityScore !== undefined) {
        annotationTypes[type].totalScore += item.qualityScore;
        annotationTypes[type].scored++;
      }
      if (item.status === 'approved') {
        annotationTypes[type].approved++;
      }
    });

    // Convert to final format
    Object.keys(annotationTypes).forEach(type => {
      const stats = annotationTypes[type];
      annotationTypes[type] = {
        count: stats.count,
        averageScore: stats.scored > 0 ? stats.totalScore / stats.scored : 0,
        approvalRate: stats.count > 0 ? (stats.approved / stats.count) * 100 : 0
      };
    });

    // Calculate reviewer statistics
    const reviewerStats: Record<string, any> = {};
    filteredItems.forEach(item => {
      if (item.reviewedBy) {
        const reviewerId = item.reviewedBy;
        if (!reviewerStats[reviewerId]) {
          reviewerStats[reviewerId] = {
            name: 'Reviewer ' + reviewerId, // TODO: Get actual names
            reviewed: 0,
            totalScore: 0,
            totalTime: 0,
            scored: 0
          };
        }
        reviewerStats[reviewerId].reviewed++;
        if (item.qualityScore !== undefined) {
          reviewerStats[reviewerId].totalScore += item.qualityScore;
          reviewerStats[reviewerId].scored++;
        }
        if (item.reviewedAt && item.createdAt) {
          const created = new Date(item.createdAt).getTime();
          const reviewed = new Date(item.reviewedAt).getTime();
          reviewerStats[reviewerId].totalTime += (reviewed - created) / (1000 * 60);
        }
      }
    });

    // Convert to final format
    Object.keys(reviewerStats).forEach(reviewerId => {
      const stats = reviewerStats[reviewerId];
      reviewerStats[reviewerId] = {
        name: stats.name,
        reviewed: stats.reviewed,
        averageScore: stats.scored > 0 ? stats.totalScore / stats.scored : 0,
        averageTime: stats.reviewed > 0 ? stats.totalTime / stats.reviewed : 0
      };
    });

    // Generate quality trends (mock data for demonstration)
    const qualityTrends = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      qualityTrends.push({
        date: date.toISOString().split('T')[0],
        score: Math.floor(Math.random() * 20) + 80, // 80-100 range
        reviewed: Math.floor(Math.random() * 10) + 5,
        approved: Math.floor(Math.random() * 8) + 3
      });
    }

    // Calculate issue categories
    const issueCategories: Record<string, number> = {};
    filteredItems.forEach(item => {
      item.comments.forEach(comment => {
        if (comment.type === 'issue') {
          // Simple categorization based on comment content
          if (comment.content.toLowerCase().includes('boundary')) {
            issueCategories['Boundary Issues'] = (issueCategories['Boundary Issues'] || 0) + 1;
          } else if (comment.content.toLowerCase().includes('classification')) {
            issueCategories['Classification Errors'] = (issueCategories['Classification Errors'] || 0) + 1;
          } else if (comment.content.toLowerCase().includes('missing')) {
            issueCategories['Missing Annotations'] = (issueCategories['Missing Annotations'] || 0) + 1;
          } else {
            issueCategories['Other Issues'] = (issueCategories['Other Issues'] || 0) + 1;
          }
        }
      });
    });

    // Calculate performance metrics (mock values for demonstration)
    const performanceMetrics = {
      accuracy: overallScore / 100,
      precision: Math.max(0, (overallScore - 5) / 100),
      recall: Math.max(0, (overallScore - 3) / 100),
      f1Score: Math.max(0, (overallScore - 4) / 100),
      interAnnotatorAgreement: Math.max(0, (overallScore - 10) / 100)
    };

    setMetrics({
      overallScore,
      totalAnnotations,
      reviewedAnnotations,
      approvedAnnotations,
      rejectedAnnotations,
      needsRevisionAnnotations,
      averageReviewTime,
      annotationTypes,
      reviewerStats,
      qualityTrends,
      issueCategories,
      performanceMetrics
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating quality metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">No review data available for the selected time range</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-indigo-50 via-purple-50 to-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Quality Metrics
          </h2>
          <p className="text-gray-600 mt-1">Comprehensive quality analysis and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="score">Quality Score</option>
            <option value="volume">Review Volume</option>
            <option value="time">Review Time</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Quality</p>
              <p className="text-2xl font-bold text-indigo-600">{metrics.overallScore.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reviewed</p>
              <p className="text-2xl font-bold text-green-600">{metrics.reviewedAnnotations}</p>
              <p className="text-xs text-gray-500">of {metrics.totalAnnotations}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {metrics.reviewedAnnotations > 0 ? 
                  ((metrics.approvedAnnotations / metrics.reviewedAnnotations) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Review Time</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.averageReviewTime.toFixed(1)}m</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quality Trends */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Trends</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {metrics.qualityTrends.map((trend, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-sm"
                  style={{ height: `${(trend.score / 100) * 200}px` }}
                ></div>
                <p className="text-xs text-gray-500 mt-2 transform rotate-45">
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Annotation Types */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Annotation Types</h3>
          <div className="space-y-4">
            {Object.entries(metrics.annotationTypes).map(([type, stats]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 capitalize">{type}</span>
                    <span className="text-sm text-gray-600">{stats.count} annotations</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${Math.min(stats.averageScore, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{stats.averageScore.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Indicators */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            {Object.entries(metrics.performanceMetrics).map(([metric, value]) => (
              <div key={metric} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">
                  {metric.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${value * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{(value * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issue Categories */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Categories</h3>
          {Object.keys(metrics.issueCategories).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(metrics.issueCategories).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{category}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">No issues reported</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviewer Statistics */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviewer Statistics</h3>
        {Object.keys(metrics.reviewerStats).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-600">Reviewer</th>
                  <th className="text-right py-2 text-gray-600">Reviewed</th>
                  <th className="text-right py-2 text-gray-600">Avg Score</th>
                  <th className="text-right py-2 text-gray-600">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics.reviewerStats).map(([reviewerId, stats]) => (
                  <tr key={reviewerId} className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-900">{stats.name}</td>
                    <td className="text-right py-2 text-gray-600">{stats.reviewed}</td>
                    <td className="text-right py-2 text-gray-600">{stats.averageScore.toFixed(1)}%</td>
                    <td className="text-right py-2 text-gray-600">{stats.averageTime.toFixed(1)}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600">No reviewer data available</p>
          </div>
        )}
      </div>
    </div>
  );
} 