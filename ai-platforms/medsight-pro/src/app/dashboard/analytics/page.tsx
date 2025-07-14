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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Comprehensive data analytics and business intelligence reporting
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm text-success font-medium">
                  Real-time Analytics
                </span>
              </div>
              <div className="glass-card-secondary px-3 py-1 rounded-lg">
                <span className="text-sm text-gray-700">
                  Last Updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Studies Analyzed</p>
                <p className="text-2xl font-bold text-gray-800">2.4M</p>
              </div>
              <div className="glass-card-secondary p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-success">+18% this month</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">AI Accuracy Score</p>
                <p className="text-2xl font-bold text-success">97.8%</p>
              </div>
              <div className="glass-card-secondary p-3 rounded-lg">
                <Brain className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-success">+2.1% improvement</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Users Today</p>
                <p className="text-2xl font-bold text-gray-800">18,247</p>
              </div>
              <div className="glass-card-secondary p-3 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-success">+12% vs yesterday</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg. Processing Time</p>
                <p className="text-2xl font-bold text-warning">24.7s</p>
              </div>
              <div className="glass-card-secondary p-3 rounded-lg">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-success">15% faster</span>
            </div>
          </div>
        </div>

        {/* Analytics Controls */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-800">Analytics Controls</h3>
              <div className="flex items-center space-x-2">
                <button className="btn-medical btn-secondary flex items-center space-x-2 px-3 py-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Date Range</span>
                </button>
                <button className="btn-medical btn-secondary flex items-center space-x-2 px-3 py-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filter</span>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="btn-medical btn-secondary flex items-center space-x-2 px-3 py-2">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
              <button className="btn-medical btn-secondary flex items-center space-x-2 px-3 py-2">
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
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="glass-card-secondary p-2 rounded-lg">
                <LineChart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Analytics Summary</h3>
                <p className="text-sm text-gray-600">Key insights and recommendations</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card-secondary rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-warning" />
                </div>
                <h4 className="font-semibold text-warning">Performance Insights</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• System performance improved 15% this month</li>
                <li>• AI processing speed increased significantly</li>
                <li>• 99.7% uptime maintained across all services</li>
                <li>• Database query optimization showing results</li>
              </ul>
            </div>

            <div className="glass-card-secondary rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-success" />
                </div>
                <h4 className="font-semibold text-success">AI Insights</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Medical AI accuracy reached 97.8%</li>
                <li>• 22% increase in AI analysis usage</li>
                <li>• New neural network models deployed</li>
                <li>• False positive rate reduced to 1.2%</li>
              </ul>
            </div>

            <div className="glass-card-secondary rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <h4 className="font-semibold text-primary">User Insights</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 18% growth in daily active users</li>
                <li>• Session duration increased by 8%</li>
                <li>• Medical imaging most used feature</li>
                <li>• High user satisfaction scores (4.8/5)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Analytics Actions */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Analytics Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="btn-medical btn-secondary flex items-center justify-center space-x-2 p-4">
              <BarChart3 className="w-5 h-5" />
              <span>Generate Report</span>
            </button>
            <button className="btn-medical btn-secondary flex items-center justify-center space-x-2 p-4">
              <PieChart className="w-5 h-5" />
              <span>Custom Dashboard</span>
            </button>
            <button className="btn-medical btn-secondary flex items-center justify-center space-x-2 p-4">
              <Calendar className="w-5 h-5" />
              <span>Schedule Report</span>
            </button>
            <button className="btn-medical btn-secondary flex items-center justify-center space-x-2 p-4">
              <Activity className="w-5 h-5" />
              <span>Real-time Monitor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 