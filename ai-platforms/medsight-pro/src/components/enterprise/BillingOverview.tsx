import React from 'react';
import { 
  DollarSign, TrendingUp, CreditCard, Receipt, 
  Calendar, AlertTriangle, CheckCircle, Clock,
  Users, Building, Download, Settings
} from 'lucide-react';

interface BillingOverviewProps {
  className?: string;
}

export default function BillingOverview({ className = '' }: BillingOverviewProps) {
  const billingMetrics = [
    {
      label: 'Monthly Revenue',
      value: '$2.4M',
      change: '+18%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-medsight-ai-high'
    },
    {
      label: 'Active Subscriptions',
      value: '247',
      change: '+12',
      trend: 'up',
      icon: Users,
      color: 'text-medsight-primary'
    },
    {
      label: 'Average Revenue Per User',
      value: '$9,718',
      change: '+6%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-medsight-secondary'
    },
    {
      label: 'Payment Success Rate',
      value: '98.7%',
      change: '+0.3%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-medsight-secondary'
    }
  ];

  const recentInvoices = [
    {
      organization: 'Metro General Hospital',
      amount: '$24,700',
      status: 'paid',
      date: '2024-01-15',
      dueDate: '2024-01-15',
      plan: 'Enterprise'
    },
    {
      organization: 'Pacific Medical Center',
      amount: '$18,900',
      status: 'paid',
      date: '2024-01-14',
      dueDate: '2024-01-14',
      plan: 'Professional'
    },
    {
      organization: 'Heart Institute',
      amount: '$15,200',
      status: 'pending',
      date: '2024-01-13',
      dueDate: '2024-01-20',
      plan: 'Professional'
    },
    {
      organization: 'Children\'s Medical Center',
      amount: '$12,300',
      status: 'overdue',
      date: '2024-01-10',
      dueDate: '2024-01-17',
      plan: 'Standard'
    }
  ];

  const subscriptionTiers = [
    {
      tier: 'Enterprise',
      count: 89,
      revenue: '$2.18M',
      percentage: 45,
      color: 'bg-medsight-ai-high'
    },
    {
      tier: 'Professional',
      count: 126,
      revenue: '$1.26M',
      percentage: 35,
      color: 'bg-medsight-primary'
    },
    {
      tier: 'Standard',
      count: 32,
      revenue: '$320K',
      percentage: 20,
      color: 'bg-medsight-pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-medsight-secondary bg-medsight-secondary/10';
      case 'pending': return 'text-medsight-pending bg-medsight-pending/10';
      case 'overdue': return 'text-medsight-abnormal bg-medsight-abnormal/10';
      default: return 'text-slate-500 bg-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-medsight-secondary" />;
      case 'pending': return <Clock className="w-4 h-4 text-medsight-pending" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-medsight-abnormal" />;
      default: return <Receipt className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <DollarSign className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">Billing Overview</h3>
            <p className="text-sm text-slate-600">Revenue tracking and billing management</p>
          </div>
        </div>
        <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Configure</span>
        </button>
      </div>

      {/* Billing Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {billingMetrics.map((metric, index) => (
          <div key={index} className="medsight-control-glass rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <span className={`text-xs ${metric.trend === 'up' ? 'text-medsight-secondary' : 'text-medsight-abnormal'}`}>
                {metric.change}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
              <TrendingUp className="w-4 h-4 text-medsight-secondary" />
            </div>
            <p className="text-xs text-slate-600 mt-1">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Subscription Tiers */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Subscription Tiers</h4>
        <div className="medsight-control-glass rounded-lg p-4">
          <div className="space-y-3">
            {subscriptionTiers.map((tier, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${tier.color}`}></div>
                  <span className="text-sm font-medium text-slate-800">{tier.tier}</span>
                  <span className="text-xs text-slate-600">({tier.count} orgs)</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-2 bg-slate-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${tier.color}`}
                      style={{ width: `${tier.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-medsight-ai-high">{tier.revenue}</span>
                    <span className="text-xs text-slate-500 ml-1">({tier.percentage}%)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Invoices</h4>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {recentInvoices.map((invoice, index) => (
            <div key={index} className="medsight-control-glass rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                    <Building className="w-3 h-3 text-medsight-primary" />
                  </div>
                  <div>
                    <h5 className="font-medium text-slate-800 text-sm">{invoice.organization}</h5>
                    <p className="text-xs text-slate-600">{invoice.plan} Plan</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(invoice.status)}
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm font-semibold text-medsight-ai-high">{invoice.amount}</p>
                  <p className="text-xs text-slate-600">Invoice: {invoice.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">Due: {invoice.dueDate}</p>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-500">
                      {invoice.status === 'overdue' ? 'Overdue' : 'On time'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">Billing Actions</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <Receipt className="w-3 h-3 mr-1" />
              Generate Report
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Download className="w-3 h-3 mr-1" />
              Export Data
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Settings className="w-3 h-3 mr-1" />
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 