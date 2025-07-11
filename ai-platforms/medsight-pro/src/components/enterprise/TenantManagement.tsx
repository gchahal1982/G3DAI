'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Search, 
  Filter,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  Activity,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown,
  Star,
  Globe,
  Database,
  Zap,
  Network,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Server,
  Lock,
  Unlock,
  Ban,
  RefreshCw,
  Download,
  Upload,
  Copy,
  ExternalLink
} from 'lucide-react';

interface TenantSummary {
  id: string;
  name: string;
  organization: string;
  users: number;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  tier: 'basic' | 'professional' | 'enterprise';
  usage: {
    storage: number;
    compute: number;
    bandwidth: number;
  };
  compliance: number;
  lastActivity: Date;
  createdAt: Date;
  billing: {
    plan: string;
    monthlyRevenue: number;
    nextBilling: Date;
    paymentStatus: 'paid' | 'pending' | 'overdue';
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  limits: {
    maxUsers: number;
    maxStorage: number;
    maxCompute: number;
  };
  features: string[];
  metadata: {
    region: string;
    deployment: string;
    version: string;
  };
}

interface TenantManagementProps {
  tenants: TenantSummary[];
  onTenantUpdate: () => void;
  className?: string;
}

const TenantManagement: React.FC<TenantManagementProps> = ({
  tenants,
  onTenantUpdate,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesTier = tierFilter === 'all' || tenant.tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const sortedTenants = [...filteredTenants].sort((a, b) => {
    const aValue = a[sortBy as keyof TenantSummary];
    const bValue = b[sortBy as keyof TenantSummary];
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>;
      case 'inactive':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="w-3 h-3 mr-1" />
          Inactive
        </span>;
      case 'suspended':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Ban className="w-3 h-3 mr-1" />
          Suspended
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      default:
        return null;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Crown className="w-3 h-3 mr-1" />
          Enterprise
        </span>;
      case 'professional':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Star className="w-3 h-3 mr-1" />
          Professional
        </span>;
      case 'basic':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Basic
        </span>;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Paid
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      case 'overdue':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Overdue
        </span>;
      default:
        return null;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-yellow-600';
    if (score >= 80) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const handleTenantAction = (tenantId: string, action: string) => {
    setLoading(true);
    // Mock action handling - replace with actual API calls
    setTimeout(() => {
      console.log(`Action: ${action} for tenant: ${tenantId}`);
      setLoading(false);
      onTenantUpdate();
    }, 1000);
  };

  const handleBulkAction = () => {
    if (bulkAction && selectedTenants.length > 0) {
      setLoading(true);
      // Mock bulk action handling
      setTimeout(() => {
        console.log(`Bulk action: ${bulkAction} for tenants:`, selectedTenants);
        setLoading(false);
        setSelectedTenants([]);
        setBulkAction('');
        onTenantUpdate();
      }, 1000);
    }
  };

  const DetailedTenantView = ({ tenant }: { tenant: TenantSummary }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Building2 className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
          </div>
          <button
            onClick={() => setShowDetails(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Organization:</span>
                <span className="text-sm font-medium">{tenant.organization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                {getStatusBadge(tenant.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tier:</span>
                {getTierBadge(tenant.tier)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Users:</span>
                <span className="text-sm font-medium">{formatNumber(tenant.users)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm font-medium">{formatDate(tenant.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{tenant.contact.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{tenant.contact.phone}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{tenant.contact.address}</span>
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Billing Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plan:</span>
                <span className="text-sm font-medium">{tenant.billing.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Revenue:</span>
                <span className="text-sm font-medium">{formatCurrency(tenant.billing.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Status:</span>
                {getPaymentStatusBadge(tenant.billing.paymentStatus)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Next Billing:</span>
                <span className="text-sm font-medium">{formatDate(tenant.billing.nextBilling)}</span>
              </div>
            </div>
          </div>

          {/* Usage & Limits */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Usage & Limits</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Storage</span>
                  <span className="text-sm font-medium">
                    {formatNumber(tenant.usage.storage)} GB / {formatNumber(tenant.limits.maxStorage)} GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(tenant.usage.storage, tenant.limits.maxStorage))}`}
                    style={{ width: `${getUsagePercentage(tenant.usage.storage, tenant.limits.maxStorage)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Compute</span>
                  <span className="text-sm font-medium">
                    {tenant.usage.compute} / {tenant.limits.maxCompute} units
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(tenant.usage.compute, tenant.limits.maxCompute))}`}
                    style={{ width: `${getUsagePercentage(tenant.usage.compute, tenant.limits.maxCompute)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Users</span>
                  <span className="text-sm font-medium">
                    {tenant.users} / {tenant.limits.maxUsers}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(tenant.users, tenant.limits.maxUsers))}`}
                    style={{ width: `${getUsagePercentage(tenant.users, tenant.limits.maxUsers)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Enabled Features</h4>
          <div className="flex flex-wrap gap-2">
            {tenant.features.map((feature, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleTenantAction(tenant.id, 'edit')}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button
              onClick={() => handleTenantAction(tenant.id, tenant.status === 'active' ? 'suspend' : 'activate')}
              className={`flex items-center px-3 py-2 text-sm rounded ${
                tenant.status === 'active' 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {tenant.status === 'active' ? <Ban className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
              {tenant.status === 'active' ? 'Suspend' : 'Activate'}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
              <ExternalLink className="w-4 h-4 mr-1" />
              View Portal
            </button>
            <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
              <Download className="w-4 h-4 mr-1" />
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Tenant Management</h3>
          <p className="text-sm text-gray-600">
            Manage all tenants across your enterprise platform
          </p>
        </div>
        <button
          onClick={() => setShowAddTenant(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tenant
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tiers</option>
              <option value="enterprise">Enterprise</option>
              <option value="professional">Professional</option>
              <option value="basic">Basic</option>
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="users-desc">Most Users</option>
              <option value="users-asc">Fewest Users</option>
              <option value="createdAt-desc">Newest</option>
              <option value="createdAt-asc">Oldest</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTenants.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedTenants.length} tenants selected
            </span>
            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-blue-300 rounded text-sm"
              >
                <option value="">Select Action</option>
                <option value="activate">Activate</option>
                <option value="suspend">Suspend</option>
                <option value="upgrade">Upgrade Tier</option>
                <option value="export">Export Data</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Apply'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedTenants.length === sortedTenants.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTenants(sortedTenants.map(t => t.id));
                      } else {
                        setSelectedTenants([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedTenants.includes(tenant.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTenants([...selectedTenants, tenant.id]);
                        } else {
                          setSelectedTenants(selectedTenants.filter(id => id !== tenant.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.organization}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStatusBadge(tenant.status)}
                      {getTierBadge(tenant.tier)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatNumber(tenant.users)}</div>
                    <div className="text-sm text-gray-500">
                      {formatPercentage(getUsagePercentage(tenant.users, tenant.limits.maxUsers))} of limit
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Storage: {formatNumber(tenant.usage.storage)} GB</div>
                      <div>Compute: {tenant.usage.compute} units</div>
                      <div>Bandwidth: {formatNumber(tenant.usage.bandwidth)} GB</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(tenant.billing.monthlyRevenue)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getPaymentStatusBadge(tenant.billing.paymentStatus)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getComplianceColor(tenant.compliance)}`}>
                      {formatPercentage(tenant.compliance)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowDetails(tenant.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTenantAction(tenant.id, 'edit')}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTenantAction(tenant.id, 'settings')}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Tenant Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{tenants.length}</div>
            <div className="text-sm text-blue-600">Total Tenants</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {tenants.filter(t => t.status === 'active').length}
            </div>
            <div className="text-sm text-green-600">Active Tenants</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(tenants.reduce((sum, t) => sum + t.users, 0))}
            </div>
            <div className="text-sm text-purple-600">Total Users</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(tenants.reduce((sum, t) => sum + t.billing.monthlyRevenue, 0))}
            </div>
            <div className="text-sm text-amber-600">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Detailed View Modal */}
      {showDetails && (
        <DetailedTenantView 
          tenant={tenants.find(t => t.id === showDetails)!} 
        />
      )}
    </div>
  );
};

export default TenantManagement; 