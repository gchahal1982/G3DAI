'use client';

import React, { useState, useEffect } from 'react';

interface UsageMetric {
  name: string;
  current: number;
  limit: number;
  unit: string;
  trend: number; // Percentage change from previous period
  icon: string;
  color: string;
}

interface UsageData {
  period: string;
  metrics: UsageMetric[];
  dailyUsage: {
    date: string;
    annotations: number;
    aiInference: number;
    storage: number;
  }[];
  predictions: {
    annotationsThisMonth: number;
    aiInferenceThisMonth: number;
    storageThisMonth: number;
    estimatedOverage: number;
  };
}

export default function UsageTracking() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('annotations');

  useEffect(() => {
    loadUsageData();
  }, [selectedPeriod]);

  const loadUsageData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/billing/usage?period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('Failed to load usage data');
      }
      const data = await response.json();
      setUsageData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatStorage = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1000) {
      return `${(gb / 1000).toFixed(1)} TB`;
    }
    return `${gb.toFixed(2)} GB`;
  };

  const getUsagePercentage = (current: number, limit: number): number => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage < 50) return 'from-green-500 to-emerald-500';
    if (percentage < 80) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return (
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    } else if (trend < 0) {
      return (
        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      );
    }
  };

  const getMetricIcon = (iconName: string) => {
    switch (iconName) {
      case 'annotations':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'ai':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'storage':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        );
      case 'projects':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 flex items-center justify-center">
        <div className="annotate-glass rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div>
          <p className="text-white/70 mt-4 text-center">Loading usage data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 flex items-center justify-center">
        <div className="annotate-glass rounded-xl p-8 text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white font-semibold">Error loading usage data</p>
          <p className="text-white/70 mt-2">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  if (!usageData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Usage Analytics</h1>
          <p className="text-white/70">Track your resource usage and optimize your workflow</p>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center mb-8">
          <div className="annotate-glass rounded-xl p-2">
            <div className="flex items-center gap-2">
              {(['7d', '30d', '90d'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period
                      ? 'bg-indigo-600 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Usage Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {usageData.metrics.map((metric, index) => {
            const percentage = getUsagePercentage(metric.current, metric.limit);
            const isNearLimit = percentage > 80;
            const formatValue = (value: number) => {
              if (metric.unit === 'GB') {
                return formatStorage(value * 1024 * 1024 * 1024);
              }
              return formatNumber(value);
            };

            return (
              <div key={index} className="annotate-ai-glass rounded-lg p-6 relative">
                {isNearLimit && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-${metric.color}-400`}>
                    {getMetricIcon(metric.icon)}
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    <span className="text-white/60 text-sm">
                      {Math.abs(metric.trend).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <h3 className="text-white font-semibold mb-2">{metric.name}</h3>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/80 text-sm">
                      {formatValue(metric.current)}
                    </span>
                    <span className="text-white/60 text-sm">
                      {metric.limit === -1 ? '∞' : formatValue(metric.limit)}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${getUsageColor(percentage)} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-white/60 text-xs">
                  {percentage.toFixed(1)}% of quota used
                </div>
              </div>
            );
          })}
        </div>

        {/* Usage Trends Chart */}
        <div className="annotate-glass rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Usage Trends</h2>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm"
            >
              <option value="annotations">Annotations</option>
              <option value="aiInference">AI Inference</option>
              <option value="storage">Storage</option>
            </select>
          </div>

          <div className="h-64 flex items-end justify-between gap-2">
            {usageData.dailyUsage.slice(-14).map((day, index) => {
              const value = day[selectedMetric as keyof typeof day] as number;
              const maxValue = Math.max(...usageData.dailyUsage.map(d => d[selectedMetric as keyof typeof d] as number));
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-white/10 rounded-t-lg relative group">
                    <div
                      className="bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all duration-300 group-hover:from-indigo-400 group-hover:to-purple-400"
                      style={{ height: `${height}%`, minHeight: '2px' }}
                    ></div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {formatNumber(value)} {selectedMetric === 'storage' ? 'GB' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-white/60 text-xs mt-2 rotate-45 origin-top-left">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Predictions and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usage Predictions */}
          <div className="annotate-glass rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Monthly Predictions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Annotations</span>
                <span className="text-white font-semibold">
                  {formatNumber(usageData.predictions.annotationsThisMonth)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">AI Inference</span>
                <span className="text-white font-semibold">
                  {formatNumber(usageData.predictions.aiInferenceThisMonth)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Storage</span>
                <span className="text-white font-semibold">
                  {formatStorage(usageData.predictions.storageThisMonth * 1024 * 1024 * 1024)}
                </span>
              </div>
              
              {usageData.predictions.estimatedOverage > 0 && (
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-400 font-semibold">Potential Overage</span>
                  </div>
                  <div className="text-white/80 text-sm">
                    Estimated additional cost: <span className="font-semibold">${usageData.predictions.estimatedOverage.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="annotate-glass rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Optimization Tips</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Batch Processing</p>
                  <p className="text-white/70 text-sm">Process multiple annotations together to reduce API calls</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Storage Cleanup</p>
                  <p className="text-white/70 text-sm">Archive old projects to free up storage space</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Plan Upgrade</p>
                  <p className="text-white/70 text-sm">Consider upgrading for better value and higher limits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 