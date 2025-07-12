import React from 'react';
import { 
  Building, Globe, Users, TrendingUp, 
  DollarSign, BarChart3, PieChart, Activity,
  MapPin, Calendar, Settings, Plus
} from 'lucide-react';
import OrganizationOverview from '@/components/enterprise/OrganizationOverview';
import BusinessIntelligence from '@/components/enterprise/BusinessIntelligence';
import UsageAnalytics from '@/components/enterprise/UsageAnalytics';
import BillingOverview from '@/components/enterprise/BillingOverview';

export default function EnterpriseDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-medsight-primary mb-2">
                Enterprise Management
              </h1>
              <p className="text-slate-600">
                Multi-tenant organization management and business intelligence
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-medsight-secondary rounded-full animate-pulse"></div>
                <span className="text-sm text-medsight-secondary font-medium">
                  Global Operations
                </span>
              </div>
              <div className="medsight-control-glass px-3 py-1 rounded-lg">
                <span className="text-sm text-slate-700">
                  {new Date().toLocaleString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Organizations</p>
                <p className="text-2xl font-bold text-medsight-primary">247</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <Building className="w-6 h-6 text-medsight-primary" />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-xs text-medsight-secondary">+12 this month</span>
            </div>
          </div>

          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Global Users</p>
                <p className="text-2xl font-bold text-medsight-primary">24,789</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <Users className="w-6 h-6 text-medsight-primary" />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-xs text-medsight-secondary">+847 this week</span>
            </div>
          </div>

          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Global Revenue</p>
                <p className="text-2xl font-bold text-medsight-ai-high">$2.4M</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-medsight-ai-high" />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-xs text-medsight-secondary">+18% growth</span>
            </div>
          </div>

          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Regions</p>
                <p className="text-2xl font-bold text-medsight-primary">23</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <Globe className="w-6 h-6 text-medsight-primary" />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-xs text-medsight-secondary">5 continents</span>
            </div>
          </div>

          <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Uptime</p>
                <p className="text-2xl font-bold text-medsight-secondary">99.97%</p>
              </div>
              <div className="medsight-ai-glass p-3 rounded-lg">
                <Activity className="w-6 h-6 text-medsight-secondary" />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-xs text-medsight-secondary">SLA compliant</span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Organizations & Business Intelligence */}
          <div className="space-y-6">
            <OrganizationOverview />
            <BusinessIntelligence />
          </div>

          {/* Right Column - Usage Analytics & Billing */}
          <div className="space-y-6">
            <UsageAnalytics />
            <BillingOverview />
          </div>
        </div>

        {/* Regional Performance */}
        <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="medsight-ai-glass p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-medsight-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-medsight-primary">Regional Performance</h3>
                <p className="text-sm text-slate-600">Global deployment statistics</p>
              </div>
            </div>
            <button className="btn-medsight flex items-center space-x-2 px-3 py-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm">View Map</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="medsight-control-glass rounded-lg p-4 text-center">
              <h4 className="font-semibold text-medsight-primary mb-2">North America</h4>
              <p className="text-2xl font-bold text-slate-800">89</p>
              <p className="text-sm text-slate-600">Organizations</p>
              <p className="text-xs text-medsight-secondary mt-1">12,347 users</p>
            </div>
            <div className="medsight-control-glass rounded-lg p-4 text-center">
              <h4 className="font-semibold text-medsight-primary mb-2">Europe</h4>
              <p className="text-2xl font-bold text-slate-800">67</p>
              <p className="text-sm text-slate-600">Organizations</p>
              <p className="text-xs text-medsight-secondary mt-1">8,923 users</p>
            </div>
            <div className="medsight-control-glass rounded-lg p-4 text-center">
              <h4 className="font-semibold text-medsight-primary mb-2">Asia Pacific</h4>
              <p className="text-2xl font-bold text-slate-800">56</p>
              <p className="text-sm text-slate-600">Organizations</p>
              <p className="text-xs text-medsight-secondary mt-1">6,789 users</p>
            </div>
            <div className="medsight-control-glass rounded-lg p-4 text-center">
              <h4 className="font-semibold text-medsight-primary mb-2">Others</h4>
              <p className="text-2xl font-bold text-slate-800">35</p>
              <p className="text-sm text-slate-600">Organizations</p>
              <p className="text-xs text-medsight-secondary mt-1">4,567 users</p>
            </div>
          </div>
        </div>

        {/* Enterprise Actions */}
        <div className="medsight-glass rounded-xl p-6 border border-medsight-primary/20">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">
            Enterprise Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <Plus className="w-5 h-5" />
              <span>Add Organization</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <BarChart3 className="w-5 h-5" />
              <span>Analytics Report</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <Settings className="w-5 h-5" />
              <span>Global Settings</span>
            </button>
            <button className="btn-medsight flex items-center justify-center space-x-2 p-4">
              <Calendar className="w-5 h-5" />
              <span>Schedule Review</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 