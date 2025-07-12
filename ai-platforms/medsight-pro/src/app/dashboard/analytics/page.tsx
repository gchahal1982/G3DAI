import React from 'react';
import { 
  BarChart3, LineChart, PieChart, TrendingUp, 
  Activity, Brain, Users, Clock,
  Calendar, Download, Filter, RefreshCw
} from 'lucide-react';
import MedicalAnalytics from '@/components/analytics/MedicalAnalytics';
import PerformanceAnalytics from '@/components/analytics/PerformanceAnalytics';
import UsageAnalytics from '@/components/analytics/UsageAnalytics';
import AIAnalytics from '@/components/analytics/AIAnalytics';

export default function AnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-medsight-primary mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-slate-600">
                Comprehensive data analytics and business intelligence reporting
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-medsight-ai-high rounded-full animate-pulse"></div>
                <span className="text-sm text-medsight-ai-high font-medium">
                  Real-time Analytics
                </span>
              </div>
              <div className="medsight-control-glass px-3 py-1 rounded-lg">
                <span className="text-sm text-slate-700">
                  Last Updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Studies Analyzed</p>
                <p className="text-2xl font-bold text-medsight-primary">2.4M</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-medsight-primary" />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-medsight-secondary" />
              <span className="text-xs text-medsight-secondary">+18% this month</span>
            </div>
          </div>

          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">AI Accuracy Score</p>
                <p className="text-2xl font-bold text-medsight-ai-high">97.8%</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <Brain className="w-6 h-6 text-medsight-ai-high" />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-medsight-secondary" />
              <span className="text-xs text-medsight-secondary">+2.1% improvement</span>
            </div>
          </div>

          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Active Users Today</p>
                <p className="text-2xl font-bold text-medsight-primary">18,247</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <Users className="w-6 h-6 text-medsight-primary" />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-medsight-secondary" />
              <span className="text-xs text-medsight-secondary">+12% vs yesterday</span>
            </div>
          </div>

          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Avg. Processing Time</p>
                <p className="text-2xl font-bold text-medsight-secondary">24.7s</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <Clock className="w-6 h-6 text-medsight-secondary" />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-medsight-secondary" />
              <span className="text-xs text-medsight-secondary">15% faster</span>
            </div>
          </div>
        </div>

        {/* Analytics Controls */}
        <div className="medsight-glass rounded-xl p-4 border border-medsight-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Analytics Controls</h3>
              <div className="flex items-center space-x-2">
                <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Date Range</span>
                </button>
                <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filter</span>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
              <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
                <Download className="w-4 h-4" />
                <span className="text-sm">Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column - Medical & Performance Analytics */}
          <div className="space-y-6">
            <MedicalAnalytics />
            <PerformanceAnalytics />
          </div>

          {/* Right Column - Usage & AI Analytics */}
          <div className="space-y-6">
            <UsageAnalytics />
            <AIAnalytics />
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="medsight-ai-glass p-2 rounded-lg">
                <LineChart className="w-5 h-5 text-medsight-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-medsight-primary">Analytics Summary</h3>
                <p className="text-sm text-slate-600">Key insights and recommendations</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="medsight-control-glass rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-medsight-secondary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-medsight-secondary" />
                </div>
                <h4 className="font-semibold text-medsight-secondary">Performance Insights</h4>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• System performance improved 15% this month</li>
                <li>• AI processing speed increased significantly</li>
                <li>• 99.7% uptime maintained across all services</li>
                <li>• Database query optimization showing results</li>
              </ul>
            </div>

            <div className="medsight-control-glass rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-medsight-ai-high/10 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-medsight-ai-high" />
                </div>
                <h4 className="font-semibold text-medsight-ai-high">AI Insights</h4>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Medical AI accuracy reached 97.8%</li>
                <li>• 22% increase in AI analysis usage</li>
                <li>• New neural network models deployed</li>
                <li>• False positive rate reduced to 1.2%</li>
              </ul>
            </div>

            <div className="medsight-control-glass rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-medsight-primary" />
                </div>
                <h4 className="font-semibold text-medsight-primary">User Insights</h4>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• 18% growth in daily active users</li>
                <li>• Session duration increased by 8%</li>
                <li>• Medical imaging most used feature</li>
                <li>• High user satisfaction scores (4.8/5)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Analytics Actions */}
        <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">
            Quick Analytics Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <BarChart3 className="w-5 h-5" />
              <span>Generate Report</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <PieChart className="w-5 h-5" />
              <span>Custom Dashboard</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <Calendar className="w-5 h-5" />
              <span>Schedule Report</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <Activity className="w-5 h-5" />
              <span>Real-time Monitor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 