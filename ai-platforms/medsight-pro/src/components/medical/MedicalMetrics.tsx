'use client';

import React, { useState } from 'react';
import { 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  AcademicCapIcon,
  StarIcon,
  BoltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import {
  ChartBarIcon as ChartBarIconSolid,
  ClockIcon as ClockIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  SparklesIcon as SparklesIconSolid,
  ArrowTrendingUpIcon as ArrowTrendingUpIconSolid,
  ArrowTrendingDownIcon as ArrowTrendingDownIconSolid,
  CalendarIcon as CalendarIconSolid,
  EyeIcon as EyeIconSolid,
  HeartIcon as HeartIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  StarIcon as StarIconSolid,
  BoltIcon as BoltIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid
} from '@heroicons/react/24/solid';

import type { MedicalUser } from '@/types/medical-user';

interface MedicalMetrics {
  dailyMetrics: {
    casesReviewed: number;
    averageTime: number;
    accuracyRate: number;
    collaborations: number;
  };
  weeklyMetrics: {
    totalCases: number;
    averageDaily: number;
    peakDay: string;
    efficiency: number;
  };
  monthlyMetrics: {
    totalCases: number;
    growthRate: number;
    qualityScore: number;
    patientSatisfaction: number;
  };
  aiMetrics: {
    analysesCompleted: number;
    averageConfidence: number;
    accuracyRate: number;
    timeReduction: number;
  };
}

interface MedicalMetricsProps {
  metrics: MedicalMetrics;
  timeRange: 'today' | 'week' | 'month';
  user: MedicalUser;
}

export function MedicalMetrics({ metrics, timeRange, user }: MedicalMetricsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'performance' | 'ai' | 'quality' | 'collaboration'>('performance');

  const timeRangeData = {
    today: metrics.dailyMetrics,
    week: metrics.weeklyMetrics,
    month: metrics.monthlyMetrics
  };

  const performanceMetrics = [
    {
      id: 'cases-reviewed',
      label: 'Cases Reviewed',
      value: timeRange === 'today' ? metrics.dailyMetrics.casesReviewed : 
             timeRange === 'week' ? metrics.weeklyMetrics.totalCases : 
             metrics.monthlyMetrics.totalCases,
      icon: ChartBarIconSolid,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      trend: timeRange === 'today' ? '+12.5%' : timeRange === 'week' ? '+8.3%' : '+15.2%',
      trendUp: true,
      suffix: '',
      description: 'Total cases reviewed'
    },
    {
      id: 'average-time',
      label: 'Average Time',
      value: timeRange === 'today' ? metrics.dailyMetrics.averageTime : 
             timeRange === 'week' ? Math.round(metrics.weeklyMetrics.averageDaily * 4.5) : 
             Math.round(metrics.monthlyMetrics.totalCases / 30 * 4.2),
      icon: ClockIconSolid,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      trend: timeRange === 'today' ? '-8.2%' : timeRange === 'week' ? '-5.1%' : '-12.3%',
      trendUp: false,
      suffix: 'min',
      description: 'Average time per case'
    },
    {
      id: 'accuracy-rate',
      label: 'Accuracy Rate',
      value: timeRange === 'today' ? metrics.dailyMetrics.accuracyRate : 
             timeRange === 'week' ? metrics.weeklyMetrics.efficiency : 
             metrics.monthlyMetrics.qualityScore,
      icon: CheckCircleIconSolid,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      trend: timeRange === 'today' ? '+2.1%' : timeRange === 'week' ? '+1.8%' : '+3.2%',
      trendUp: true,
      suffix: '%',
      description: 'Diagnostic accuracy'
    },
    {
      id: 'collaborations',
      label: 'Collaborations',
      value: timeRange === 'today' ? metrics.dailyMetrics.collaborations : 
             timeRange === 'week' ? metrics.dailyMetrics.collaborations * 7 : 
             metrics.dailyMetrics.collaborations * 30,
      icon: UserGroupIconSolid,
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      trend: timeRange === 'today' ? '+25.3%' : timeRange === 'week' ? '+18.7%' : '+22.1%',
      trendUp: true,
      suffix: '',
      description: 'Team collaborations'
    }
  ];

  const aiMetrics = [
    {
      id: 'ai-analyses',
      label: 'AI Analyses',
      value: metrics.aiMetrics.analysesCompleted,
      icon: SparklesIconSolid,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      trend: '+42.1%',
      trendUp: true,
      suffix: '',
      description: 'AI analyses completed'
    },
    {
      id: 'ai-confidence',
      label: 'AI Confidence',
      value: metrics.aiMetrics.averageConfidence,
      icon: StarIconSolid,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      trend: '+5.2%',
      trendUp: true,
      suffix: '%',
      description: 'Average AI confidence'
    },
    {
      id: 'ai-accuracy',
      label: 'AI Accuracy',
      value: metrics.aiMetrics.accuracyRate,
      icon: ShieldCheckIconSolid,
      color: 'bg-teal-500',
      textColor: 'text-teal-700',
      bgColor: 'bg-teal-50',
      trend: '+1.8%',
      trendUp: true,
      suffix: '%',
      description: 'AI diagnostic accuracy'
    },
    {
      id: 'time-reduction',
      label: 'Time Reduction',
      value: metrics.aiMetrics.timeReduction,
      icon: BoltIconSolid,
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      trend: '+12.4%',
      trendUp: true,
      suffix: '%',
      description: 'Time saved with AI'
    }
  ];

  const qualityMetrics = [
    {
      id: 'quality-score',
      label: 'Quality Score',
      value: metrics.monthlyMetrics.qualityScore,
      icon: AcademicCapIconSolid,
      color: 'bg-blue-600',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      trend: '+3.1%',
      trendUp: true,
      suffix: '%',
      description: 'Overall quality rating'
    },
    {
      id: 'patient-satisfaction',
      label: 'Patient Satisfaction',
      value: metrics.monthlyMetrics.patientSatisfaction,
      icon: HeartIconSolid,
      color: 'bg-pink-500',
      textColor: 'text-pink-700',
      bgColor: 'bg-pink-50',
      trend: '+4.7%',
      trendUp: true,
      suffix: '%',
      description: 'Patient feedback score'
    },
    {
      id: 'growth-rate',
      label: 'Growth Rate',
      value: metrics.monthlyMetrics.growthRate,
             icon: ArrowTrendingUpIconSolid,
      color: 'bg-green-600',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      trend: '+8.3%',
      trendUp: true,
      suffix: '%',
      description: 'Monthly growth rate'
    },
    {
      id: 'peak-efficiency',
      label: 'Peak Day',
      value: metrics.weeklyMetrics.peakDay === 'Monday' ? 1 : 
             metrics.weeklyMetrics.peakDay === 'Tuesday' ? 2 :
             metrics.weeklyMetrics.peakDay === 'Wednesday' ? 3 :
             metrics.weeklyMetrics.peakDay === 'Thursday' ? 4 :
             metrics.weeklyMetrics.peakDay === 'Friday' ? 5 : 0,
      icon: CalendarIconSolid,
      color: 'bg-purple-600',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      trend: metrics.weeklyMetrics.peakDay,
      trendUp: true,
      suffix: '',
      description: 'Most productive day'
    }
  ];

  const getMetricsByCategory = () => {
    switch (selectedMetric) {
      case 'ai':
        return aiMetrics;
      case 'quality':
        return qualityMetrics;
      case 'collaboration':
        return performanceMetrics.filter(m => m.id === 'collaborations');
      default:
        return performanceMetrics;
    }
  };

  const timeRangeLabels = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month'
  };

  return (
    <div className="medsight-glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 
            className="text-xl font-semibold text-slate-800"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            Medical Metrics
          </h2>
          <p 
            className="text-sm text-slate-600 mt-1"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            {timeRangeLabels[timeRange]} - Performance analytics for Dr. {user.lastName}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span 
            className="text-sm text-green-600 font-medium"
            style={{ 
              fontFamily: 'var(--font-primary)',
              letterSpacing: '0.01em'
            }}
          >
            Real-time
          </span>
        </div>
      </div>

      {/* Metric Category Selector */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setSelectedMetric('performance')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            selectedMetric === 'performance' 
              ? 'bg-medsight-primary-500 text-white' 
              : 'bg-white/50 text-slate-600 hover:bg-white/70'
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setSelectedMetric('ai')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            selectedMetric === 'ai' 
              ? 'bg-purple-500 text-white' 
              : 'bg-white/50 text-slate-600 hover:bg-white/70'
          }`}
        >
          AI Analytics
        </button>
        <button
          onClick={() => setSelectedMetric('quality')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            selectedMetric === 'quality' 
              ? 'bg-green-500 text-white' 
              : 'bg-white/50 text-slate-600 hover:bg-white/70'
          }`}
        >
          Quality
        </button>
        <button
          onClick={() => setSelectedMetric('collaboration')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            selectedMetric === 'collaboration' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white/50 text-slate-600 hover:bg-white/70'
          }`}
        >
          Team
        </button>
      </div>

      {/* Metrics Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {getMetricsByCategory().map((metric) => (
          <div
            key={metric.id}
            className={`p-4 rounded-lg ${metric.bgColor} border border-white/20 hover:shadow-lg transition-all duration-200`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${metric.color} rounded-lg flex items-center justify-center`}>
                <metric.icon className="w-5 h-5 text-white" />
              </div>
                             <div className="flex items-center space-x-1">
                 {metric.trendUp ? (
                   <ArrowTrendingUpIconSolid className="w-4 h-4 text-green-500" />
                 ) : (
                   <ArrowTrendingDownIconSolid className="w-4 h-4 text-red-500" />
                 )}
                <span 
                  className={`text-xs font-medium ${metric.trendUp ? 'text-green-600' : 'text-red-600'}`}
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  {typeof metric.trend === 'string' && metric.trend.includes('%') ? metric.trend : 
                   metric.id === 'peak-efficiency' ? metric.trend : metric.trend}
                </span>
              </div>
            </div>

            <div className="mb-2">
              <div className={`text-2xl font-bold ${metric.textColor} mb-1`}>
                {metric.id === 'peak-efficiency' ? metrics.weeklyMetrics.peakDay : `${metric.value}${metric.suffix}`}
              </div>
              <div 
                className={`text-xs ${metric.textColor}/70 font-medium`}
                style={{ 
                  fontFamily: 'var(--font-primary)',
                  letterSpacing: '0.01em'
                }}
              >
                {metric.label}
              </div>
            </div>

            <p 
              className={`text-xs ${metric.textColor}/60`}
              style={{ 
                fontFamily: 'var(--font-primary)',
                letterSpacing: '0.01em'
              }}
            >
              {metric.description}
            </p>
          </div>
        ))}
      </div>

      {/* Performance Insights */}
      <div className="bg-white/60 rounded-lg p-4 mb-6">
        <h3 
          className="text-sm font-semibold text-slate-800 mb-3"
          style={{ 
            fontFamily: 'var(--font-primary)',
            letterSpacing: '0.01em'
          }}
        >
          Performance Insights
        </h3>
        <div className="space-y-2">
          {selectedMetric === 'performance' && (
            <>
              <div className="flex items-center space-x-2">
                <CheckCircleIconSolid className="w-4 h-4 text-green-500" />
                <span 
                  className="text-xs text-slate-700"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  Accuracy rate increased by 2.1% this {timeRange}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIconSolid className="w-4 h-4 text-blue-500" />
                <span 
                  className="text-xs text-slate-700"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  Average case time reduced by 8.2% with AI assistance
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <UserGroupIconSolid className="w-4 h-4 text-purple-500" />
                <span 
                  className="text-xs text-slate-700"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  Team collaboration up 25% from last period
                </span>
              </div>
            </>
          )}
          {selectedMetric === 'ai' && (
            <>
              <div className="flex items-center space-x-2">
                <SparklesIconSolid className="w-4 h-4 text-indigo-500" />
                <span 
                  className="text-xs text-slate-700"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  AI confidence levels consistently above 90%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <BoltIconSolid className="w-4 h-4 text-orange-500" />
                <span 
                  className="text-xs text-slate-700"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  AI assistance saves 34.7% time on complex cases
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheckIconSolid className="w-4 h-4 text-teal-500" />
                <span 
                  className="text-xs text-slate-700"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  AI-human collaboration accuracy: 96.8%
                </span>
              </div>
            </>
          )}
          {selectedMetric === 'quality' && (
            <>
              <div className="flex items-center space-x-2">
                <AcademicCapIconSolid className="w-4 h-4 text-blue-500" />
                <span 
                  className="text-xs text-slate-700"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  Quality score above 97% for the month
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <HeartIconSolid className="w-4 h-4 text-pink-500" />
                <span 
                  className="text-xs text-slate-700"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.01em'
                  }}
                >
                  Patient satisfaction increased by 4.7%
                </span>
              </div>
                             <div className="flex items-center space-x-2">
                 <ArrowTrendingUpIconSolid className="w-4 h-4 text-green-500" />
                 <span 
                   className="text-xs text-slate-700"
                   style={{ 
                     fontFamily: 'var(--font-primary)',
                     letterSpacing: '0.01em'
                   }}
                 >
                   Consistent growth trend over the past quarter
                 </span>
               </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-medsight-primary-50 to-medsight-secondary-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 
              className="text-sm font-semibold text-slate-800 mb-1"
              style={{ 
                fontFamily: 'var(--font-primary)',
                letterSpacing: '0.01em'
              }}
            >
              {timeRangeLabels[timeRange]} Summary
            </h4>
            <p 
              className="text-xs text-slate-600"
              style={{ 
                fontFamily: 'var(--font-primary)',
                letterSpacing: '0.01em'
              }}
            >
              Excellent performance across all metrics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <StarIconSolid className="w-4 h-4 text-yellow-500" />
              <StarIconSolid className="w-4 h-4 text-yellow-500" />
              <StarIconSolid className="w-4 h-4 text-yellow-500" />
              <StarIconSolid className="w-4 h-4 text-yellow-500" />
              <StarIconSolid className="w-4 h-4 text-yellow-500" />
            </div>
            <span 
              className="text-xs text-slate-600 font-medium"
              style={{ 
                fontFamily: 'var(--font-primary)',
                letterSpacing: '0.01em'
              }}
            >
              5.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 