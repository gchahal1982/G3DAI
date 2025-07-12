import React from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, PieChart, 
  LineChart, Target, DollarSign, Users, 
  Activity, Calendar, Download, Eye
} from 'lucide-react';

interface BusinessIntelligenceProps {
  className?: string;
}

export default function BusinessIntelligence({ className = '' }: BusinessIntelligenceProps) {
  const kpiMetrics = [
    {
      label: 'Monthly Recurring Revenue',
      value: '$2.4M',
      change: '+18%',
      trend: 'up',
      target: '$3M',
      color: 'text-medsight-ai-high'
    },
    {
      label: 'Customer Acquisition Cost',
      value: '$1,247',
      change: '-12%',
      trend: 'down',
      target: '$1,000',
      color: 'text-medsight-secondary'
    },
    {
      label: 'Customer Lifetime Value',
      value: '$24,789',
      change: '+8%',
      trend: 'up',
      target: '$25,000',
      color: 'text-medsight-ai-high'
    },
    {
      label: 'Churn Rate',
      value: '2.3%',
      change: '-0.5%',
      trend: 'down',
      target: '< 2%',
      color: 'text-medsight-secondary'
    }
  ];

  const businessInsights = [
    {
      title: 'Revenue Growth Acceleration',
      description: 'Q4 shows 18% increase in MRR driven by enterprise tier growth',
      type: 'growth',
      impact: 'high',
      timeframe: 'Q4 2024'
    },
    {
      title: 'Customer Acquisition Optimization',
      description: 'CAC reduced by 12% through improved marketing efficiency',
      type: 'efficiency',
      impact: 'medium',
      timeframe: 'Last 3 months'
    },
    {
      title: 'Market Expansion Opportunity',
      description: 'European market shows 45% higher engagement rates',
      type: 'opportunity',
      impact: 'high',
      timeframe: 'Next 6 months'
    },
    {
      title: 'Product Usage Patterns',
      description: 'AI analysis features drive 67% longer session times',
      type: 'insight',
      impact: 'medium',
      timeframe: 'Current quarter'
    }
  ];

  const revenueBreakdown = [
    { category: 'Enterprise', percentage: 45, amount: '$1.08M', color: 'bg-medsight-ai-high' },
    { category: 'Professional', percentage: 35, amount: '$840K', color: 'bg-medsight-primary' },
    { category: 'Standard', percentage: 20, amount: '$480K', color: 'bg-medsight-pending' }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-medsight-ai-high bg-medsight-ai-high/10';
      case 'medium': return 'text-medsight-pending bg-medsight-pending/10';
      case 'low': return 'text-medsight-secondary bg-medsight-secondary/10';
      default: return 'text-slate-500 bg-slate-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'growth': return <TrendingUp className="w-4 h-4 text-medsight-ai-high" />;
      case 'efficiency': return <Target className="w-4 h-4 text-medsight-secondary" />;
      case 'opportunity': return <Eye className="w-4 h-4 text-medsight-primary" />;
      case 'insight': return <Activity className="w-4 h-4 text-medsight-pending" />;
      default: return <BarChart3 className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <BarChart3 className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">Business Intelligence</h3>
            <p className="text-sm text-slate-600">Key performance indicators and insights</p>
          </div>
        </div>
        <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
          <Download className="w-4 h-4" />
          <span className="text-sm">Export Report</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {kpiMetrics.map((metric, index) => (
          <div key={index} className="medsight-control-glass rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">{metric.label}</span>
              <span className={`text-xs ${metric.trend === 'up' ? 'text-medsight-secondary' : 'text-medsight-abnormal'}`}>
                {metric.change}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
              {metric.trend === 'up' ? 
                <TrendingUp className="w-4 h-4 text-medsight-secondary" /> : 
                <TrendingDown className="w-4 h-4 text-medsight-abnormal" />
              }
            </div>
            <div className="text-xs text-slate-500">
              Target: {metric.target}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Revenue Breakdown</h4>
        <div className="medsight-control-glass rounded-lg p-4">
          <div className="space-y-3">
            {revenueBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-slate-800">{item.category}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-2 bg-slate-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-800">{item.amount}</span>
                    <span className="text-xs text-slate-500 ml-1">({item.percentage}%)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business Insights */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Business Insights</h4>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {businessInsights.map((insight, index) => (
            <div key={index} className="medsight-control-glass rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="medsight-ai-glass p-2 rounded-lg">
                  {getTypeIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-slate-800 text-sm">{insight.title}</h5>
                    <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(insight.impact)}`}>
                      {insight.impact} impact
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{insight.description}</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-500">{insight.timeframe}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BI Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">Analytics Actions</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <LineChart className="w-3 h-3 mr-1" />
              Detailed View
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Target className="w-3 h-3 mr-1" />
              Set Goals
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Calendar className="w-3 h-3 mr-1" />
              Schedule Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 