'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon,
  KeyIcon,
  UsersIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CalendarIcon,
  BellIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

interface License {
  id: string;
  name: string;
  type: 'concurrent' | 'named' | 'floating' | 'enterprise' | 'academic';
  status: 'active' | 'expired' | 'suspended' | 'pending' | 'trial';
  totalSeats: number;
  usedSeats: number;
  availableSeats: number;
  features: string[];
  purchaseDate: Date;
  expirationDate: Date;
  renewalDate?: Date;
  vendor: string;
  licenseKey: string;
  cost: {
    amount: number;
    currency: string;
    billingPeriod: 'monthly' | 'quarterly' | 'annually';
  };
  compliance: {
    auditRequired: boolean;
    lastAudit: Date;
    nextAudit: Date;
    complianceScore: number;
  };
  usage: {
    dailyAverage: number;
    peakUsage: number;
    utilizationRate: number;
    growthRate: number;
  };
  restrictions: {
    ipRestrictions: string[];
    domainRestrictions: string[];
    timeRestrictions?: {
      startTime: string;
      endTime: string;
      days: string[];
    };
  };
  support: {
    level: 'basic' | 'standard' | 'premium' | 'enterprise';
    contactEmail: string;
    phone?: string;
    documentation: string[];
  };
}

interface LicenseAllocation {
  id: string;
  licenseId: string;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  assignedDate: Date;
  lastUsed?: Date;
  usageHours: number;
  features: string[];
  status: 'assigned' | 'active' | 'inactive' | 'revoked';
}

interface LicenseAlert {
  id: string;
  licenseId: string;
  type: 'expiration' | 'utilization' | 'compliance' | 'violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: string;
  timestamp: Date;
  acknowledged: boolean;
  dueDate?: Date;
}

export function LicenseManagement() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [allocations, setAllocations] = useState<LicenseAllocation[]>([]);
  const [alerts, setAlerts] = useState<LicenseAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'licenses' | 'allocations' | 'alerts' | 'compliance'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'expiration' | 'usage' | 'cost'>('expiration');

  useEffect(() => {
    loadLicenseData();
  }, []);

  const loadLicenseData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockLicenses: License[] = [
      {
        id: 'lic-001',
        name: 'MedSight Pro Enterprise',
        type: 'concurrent',
        status: 'active',
        totalSeats: 100,
        usedSeats: 72,
        availableSeats: 28,
        features: ['dicom_viewer', 'ai_analysis', 'collaboration', 'reporting', 'admin_tools'],
        purchaseDate: new Date('2023-01-15'),
        expirationDate: new Date('2024-01-15'),
        renewalDate: new Date('2023-12-15'),
        vendor: 'MedSight Technologies',
        licenseKey: 'MSP-ENT-2023-********',
        cost: {
          amount: 25000,
          currency: 'USD',
          billingPeriod: 'annually'
        },
        compliance: {
          auditRequired: true,
          lastAudit: new Date('2023-06-01'),
          nextAudit: new Date('2024-06-01'),
          complianceScore: 95
        },
        usage: {
          dailyAverage: 68,
          peakUsage: 89,
          utilizationRate: 72,
          growthRate: 15
        },
        restrictions: {
          ipRestrictions: ['192.168.1.0/24', '10.0.0.0/16'],
          domainRestrictions: ['hospital.com', 'clinic.org']
        },
        support: {
          level: 'enterprise',
          contactEmail: 'support@medsight.com',
          phone: '+1-800-MED-SIGHT',
          documentation: ['user_manual', 'admin_guide', 'api_docs']
        }
      },
      {
        id: 'lic-002',
        name: 'AI Analysis Module',
        type: 'floating',
        status: 'active',
        totalSeats: 50,
        usedSeats: 38,
        availableSeats: 12,
        features: ['ai_analysis', 'ml_models', 'automated_reports'],
        purchaseDate: new Date('2023-03-01'),
        expirationDate: new Date('2024-03-01'),
        vendor: 'AI Medical Solutions',
        licenseKey: 'AIM-FLT-2023-********',
        cost: {
          amount: 15000,
          currency: 'USD',
          billingPeriod: 'annually'
        },
        compliance: {
          auditRequired: false,
          lastAudit: new Date('2023-03-01'),
          nextAudit: new Date('2024-03-01'),
          complianceScore: 88
        },
        usage: {
          dailyAverage: 35,
          peakUsage: 47,
          utilizationRate: 76,
          growthRate: 22
        },
        restrictions: {
          ipRestrictions: [],
          domainRestrictions: ['hospital.com']
        },
        support: {
          level: 'premium',
          contactEmail: 'ai-support@aimedical.com',
          documentation: ['ai_guide', 'model_docs']
        }
      },
      {
        id: 'lic-003',
        name: 'DICOM Storage Plus',
        type: 'enterprise',
        status: 'active',
        totalSeats: 1000,
        usedSeats: 1000,
        availableSeats: 0,
        features: ['unlimited_storage', 'backup_sync', 'compression'],
        purchaseDate: new Date('2023-02-01'),
        expirationDate: new Date('2025-02-01'),
        vendor: 'PACS Solutions Inc',
        licenseKey: 'DSP-ENT-2023-********',
        cost: {
          amount: 8000,
          currency: 'USD',
          billingPeriod: 'annually'
        },
        compliance: {
          auditRequired: true,
          lastAudit: new Date('2023-08-01'),
          nextAudit: new Date('2024-08-01'),
          complianceScore: 92
        },
        usage: {
          dailyAverage: 1000,
          peakUsage: 1000,
          utilizationRate: 100,
          growthRate: 5
        },
        restrictions: {
          ipRestrictions: [],
          domainRestrictions: []
        },
        support: {
          level: 'standard',
          contactEmail: 'support@pacssolutions.com',
          documentation: ['setup_guide', 'backup_manual']
        }
      },
      {
        id: 'lic-004',
        name: 'Mobile Access License',
        type: 'named',
        status: 'expired',
        totalSeats: 25,
        usedSeats: 0,
        availableSeats: 0,
        features: ['mobile_app', 'offline_sync', 'push_notifications'],
        purchaseDate: new Date('2022-06-01'),
        expirationDate: new Date('2023-06-01'),
        vendor: 'MobileMed Corp',
        licenseKey: 'MAL-NAM-2022-********',
        cost: {
          amount: 3000,
          currency: 'USD',
          billingPeriod: 'annually'
        },
        compliance: {
          auditRequired: false,
          lastAudit: new Date('2023-01-01'),
          nextAudit: new Date('2024-01-01'),
          complianceScore: 75
        },
        usage: {
          dailyAverage: 0,
          peakUsage: 22,
          utilizationRate: 0,
          growthRate: -100
        },
        restrictions: {
          ipRestrictions: [],
          domainRestrictions: ['hospital.com']
        },
        support: {
          level: 'basic',
          contactEmail: 'help@mobilemed.com',
          documentation: ['mobile_guide']
        }
      },
      {
        id: 'lic-005',
        name: 'Research Analytics Suite',
        type: 'academic',
        status: 'trial',
        totalSeats: 10,
        usedSeats: 6,
        availableSeats: 4,
        features: ['research_tools', 'anonymization', 'export_tools', 'statistics'],
        purchaseDate: new Date('2023-11-01'),
        expirationDate: new Date('2023-12-01'),
        vendor: 'Research Medical Inc',
        licenseKey: 'RAS-ACA-2023-********',
        cost: {
          amount: 0,
          currency: 'USD',
          billingPeriod: 'monthly'
        },
        compliance: {
          auditRequired: false,
          lastAudit: new Date('2023-11-01'),
          nextAudit: new Date('2024-11-01'),
          complianceScore: 90
        },
        usage: {
          dailyAverage: 5,
          peakUsage: 8,
          utilizationRate: 60,
          growthRate: 200
        },
        restrictions: {
          ipRestrictions: ['192.168.1.0/24'],
          domainRestrictions: ['research.hospital.com']
        },
        support: {
          level: 'basic',
          contactEmail: 'trial-support@researchmed.com',
          documentation: ['trial_guide']
        }
      }
    ];

    const mockAlerts: LicenseAlert[] = [
      {
        id: 'alert-001',
        licenseId: 'lic-001',
        type: 'expiration',
        severity: 'high',
        message: 'License expiring in 45 days',
        details: 'MedSight Pro Enterprise license will expire on January 15, 2024. Renewal process should be initiated.',
        timestamp: new Date(),
        acknowledged: false,
        dueDate: new Date('2024-01-15')
      },
      {
        id: 'alert-002',
        licenseId: 'lic-003',
        type: 'utilization',
        severity: 'critical',
        message: 'License at 100% capacity',
        details: 'DICOM Storage Plus license is at maximum capacity. Consider upgrading or adding more seats.',
        timestamp: new Date(),
        acknowledged: false
      },
      {
        id: 'alert-003',
        licenseId: 'lic-004',
        type: 'expiration',
        severity: 'critical',
        message: 'License expired',
        details: 'Mobile Access License expired 5 months ago. Features have been disabled.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150),
        acknowledged: false
      },
      {
        id: 'alert-004',
        licenseId: 'lic-005',
        type: 'expiration',
        severity: 'medium',
        message: 'Trial ending soon',
        details: 'Research Analytics Suite trial ends in 5 days. Consider purchasing full license.',
        timestamp: new Date(),
        acknowledged: false,
        dueDate: new Date('2023-12-01')
      }
    ];

    const mockAllocations: LicenseAllocation[] = [
      {
        id: 'alloc-001',
        licenseId: 'lic-001',
        userId: 'user-001',
        userName: 'Dr. Sarah Johnson',
        userEmail: 'sarah.johnson@hospital.com',
        department: 'Radiology',
        assignedDate: new Date('2023-01-20'),
        lastUsed: new Date(),
        usageHours: 1240,
        features: ['dicom_viewer', 'ai_analysis', 'reporting'],
        status: 'active'
      },
      {
        id: 'alloc-002',
        licenseId: 'lic-001',
        userId: 'user-002',
        userName: 'Dr. Michael Chen',
        userEmail: 'michael.chen@hospital.com',
        department: 'Cardiology',
        assignedDate: new Date('2023-02-01'),
        lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        usageHours: 856,
        features: ['dicom_viewer', 'collaboration'],
        status: 'active'
      },
      {
        id: 'alloc-003',
        licenseId: 'lic-002',
        userId: 'user-003',
        userName: 'Dr. Emily Watson',
        userEmail: 'emily.watson@hospital.com',
        department: 'Oncology',
        assignedDate: new Date('2023-03-15'),
        lastUsed: new Date(),
        usageHours: 652,
        features: ['ai_analysis', 'ml_models'],
        status: 'active'
      }
    ];

    setLicenses(mockLicenses);
    setAlerts(mockAlerts);
    setAllocations(mockAllocations);
    setLoading(false);
  };

  const getStatusColor = (status: License['status']) => {
    switch (status) {
      case 'active': return 'text-medsight-normal';
      case 'expired': return 'text-medsight-critical';
      case 'suspended': return 'text-medsight-critical';
      case 'pending': return 'text-medsight-pending';
      case 'trial': return 'text-medsight-secondary';
      default: return 'text-medsight-primary';
    }
  };

  const getStatusBg = (status: License['status']) => {
    switch (status) {
      case 'active': return 'bg-medsight-normal/10 border-medsight-normal/20';
      case 'expired': return 'bg-medsight-critical/10 border-medsight-critical/20';
      case 'suspended': return 'bg-medsight-critical/10 border-medsight-critical/20';
      case 'pending': return 'bg-medsight-pending/10 border-medsight-pending/20';
      case 'trial': return 'bg-medsight-secondary/10 border-medsight-secondary/20';
      default: return 'bg-medsight-primary/10 border-medsight-primary/20';
    }
  };

  const getAlertColor = (severity: LicenseAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-medsight-critical';
      case 'high': return 'text-medsight-pending';
      case 'medium': return 'text-medsight-secondary';
      case 'low': return 'text-medsight-normal';
      default: return 'text-medsight-primary';
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 95) return 'text-medsight-critical';
    if (rate >= 80) return 'text-medsight-pending';
    if (rate >= 60) return 'text-medsight-secondary';
    return 'text-medsight-normal';
  };

  const getDaysUntilExpiration = (expirationDate: Date) => {
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const filteredLicenses = licenses
    .filter(license => {
      const matchesSearch = license.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           license.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || license.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'expiration':
          return a.expirationDate.getTime() - b.expirationDate.getTime();
        case 'usage':
          return b.usage.utilizationRate - a.usage.utilizationRate;
        case 'cost':
          return b.cost.amount - a.cost.amount;
        default:
          return 0;
      }
    });

  const totalCost = licenses.reduce((sum, license) => sum + license.cost.amount, 0);
  const totalSeats = licenses.reduce((sum, license) => sum + license.totalSeats, 0);
  const totalUsed = licenses.reduce((sum, license) => sum + license.usedSeats, 0);
  const averageUtilization = totalSeats > 0 ? (totalUsed / totalSeats) * 100 : 0;
  const expiringLicenses = licenses.filter(license => {
    const daysUntil = getDaysUntilExpiration(license.expirationDate);
    return daysUntil <= 90 && daysUntil > 0;
  });
  const expiredLicenses = licenses.filter(license => license.status === 'expired');
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const handleLicenseAction = (licenseId: string, action: string) => {
    console.log(`License action: ${action} for ${licenseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="medsight-glass p-8 rounded-xl">
          <div className="w-8 h-8 border-4 border-medsight-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-sm text-medsight-primary">Loading license data...</div>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <KeyIcon className="w-6 h-6 text-medsight-primary" />
            <div>
              <div className="text-2xl font-bold text-medsight-primary">{licenses.length}</div>
              <div className="text-sm text-medsight-primary/70">Total Licenses</div>
              <div className="text-xs text-medsight-primary/50">
                {licenses.filter(l => l.status === 'active').length} active
              </div>
            </div>
          </div>
        </div>
        
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <UsersIcon className="w-6 h-6 text-medsight-secondary" />
            <div>
              <div className="text-2xl font-bold text-medsight-secondary">
                {totalUsed}/{totalSeats}
              </div>
              <div className="text-sm text-medsight-secondary/70">Seat Utilization</div>
              <div className={`text-xs font-medium ${getUtilizationColor(averageUtilization)}`}>
                {averageUtilization.toFixed(1)}% utilized
              </div>
            </div>
          </div>
        </div>
        
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <CreditCardIcon className="w-6 h-6 text-medsight-pending" />
            <div>
              <div className="text-2xl font-bold text-medsight-pending">
                {formatCurrency(totalCost, 'USD')}
              </div>
              <div className="text-sm text-medsight-pending/70">Annual Cost</div>
              <div className="text-xs text-medsight-pending/50">
                {formatCurrency(totalCost / 12, 'USD')}/month
              </div>
            </div>
          </div>
        </div>
        
        <div className="medsight-control-glass p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-medsight-critical" />
            <div>
              <div className="text-2xl font-bold text-medsight-critical">
                {unacknowledgedAlerts.length}
              </div>
              <div className="text-sm text-medsight-critical/70">Active Alerts</div>
              <div className="text-xs text-medsight-critical/50">
                {expiringLicenses.length} expiring soon
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {unacknowledgedAlerts.filter(a => a.severity === 'critical').length > 0 && (
        <div className="medsight-glass p-4 rounded-xl border-medsight-critical/20">
          <h3 className="text-lg font-semibold text-medsight-critical mb-3">Critical License Issues</h3>
          <div className="space-y-2">
            {unacknowledgedAlerts
              .filter(alert => alert.severity === 'critical')
              .map(alert => (
                <div key={alert.id} className="flex items-start justify-between p-3 bg-medsight-critical/5 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-medsight-critical">{alert.message}</p>
                    <p className="text-xs text-medsight-critical/70 mt-1">{alert.details}</p>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="ml-3 text-xs text-medsight-critical hover:text-medsight-critical/70"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* License Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">License Utilization</h3>
          <div className="space-y-4">
            {licenses.slice(0, 5).map(license => (
              <div key={license.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-medsight-primary">{license.name}</span>
                  <span className={`text-sm ${getUtilizationColor(license.usage.utilizationRate)}`}>
                    {license.usage.utilizationRate}%
                  </span>
                </div>
                <div className="w-full bg-medsight-primary/20 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      license.usage.utilizationRate >= 95 ? 'bg-medsight-critical' :
                      license.usage.utilizationRate >= 80 ? 'bg-medsight-pending' :
                      license.usage.utilizationRate >= 60 ? 'bg-medsight-secondary' :
                      'bg-medsight-normal'
                    }`}
                    style={{ width: `${license.usage.utilizationRate}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-medsight-primary/60">
                  <span>{license.usedSeats} used</span>
                  <span>{license.availableSeats} available</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">Expiration Timeline</h3>
          <div className="space-y-3">
            {[...expiringLicenses, ...expiredLicenses].slice(0, 5).map(license => {
              const daysUntil = getDaysUntilExpiration(license.expirationDate);
              return (
                <div key={license.id} className="flex items-center justify-between p-3 bg-medsight-primary/5 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-medsight-primary">{license.name}</div>
                    <div className="text-xs text-medsight-primary/60">{license.vendor}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      daysUntil < 0 ? 'text-medsight-critical' :
                      daysUntil <= 30 ? 'text-medsight-critical' :
                      daysUntil <= 90 ? 'text-medsight-pending' :
                      'text-medsight-normal'
                    }`}>
                      {daysUntil < 0 ? `Expired ${Math.abs(daysUntil)} days ago` :
                       daysUntil === 0 ? 'Expires today' :
                       `${daysUntil} days`}
                    </div>
                    <div className="text-xs text-medsight-primary/60">
                      {license.expirationDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">Cost Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-primary">
              {formatCurrency(totalCost, 'USD')}
            </div>
            <div className="text-sm text-medsight-primary/70">Total Annual Cost</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-secondary">
              {formatCurrency(totalCost / totalSeats, 'USD')}
            </div>
            <div className="text-sm text-medsight-secondary/70">Cost per Seat</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-pending">
              {formatCurrency((totalCost / totalSeats) * totalUsed, 'USD')}
            </div>
            <div className="text-sm text-medsight-pending/70">Utilized Cost</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLicenses = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search licenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-medsight w-full"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-medsight"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspended</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input-medsight"
          >
            <option value="expiration">Sort by Expiration</option>
            <option value="name">Sort by Name</option>
            <option value="usage">Sort by Usage</option>
            <option value="cost">Sort by Cost</option>
          </select>
          
          <button className="btn-medsight">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add License
          </button>
        </div>
      </div>

      {/* Licenses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLicenses.map(license => (
          <div key={license.id} className="medsight-glass p-6 rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-medsight-primary">{license.name}</h4>
                <p className="text-sm text-medsight-primary/70">{license.vendor}</p>
                <p className="text-xs text-medsight-primary/50">{license.type} license</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBg(license.status)}`}>
                <span className={getStatusColor(license.status)}>{license.status.toUpperCase()}</span>
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-medsight-primary/70">Utilization</span>
                <span className={`text-sm font-medium ${getUtilizationColor(license.usage.utilizationRate)}`}>
                  {license.usedSeats}/{license.totalSeats} ({license.usage.utilizationRate}%)
                </span>
              </div>
              
              <div className="w-full bg-medsight-primary/20 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getUtilizationColor(license.usage.utilizationRate).replace('text-', 'bg-')}`}
                  style={{ width: `${license.usage.utilizationRate}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-medsight-primary/70">Expires:</span>
                  <div className={`font-medium ${
                    getDaysUntilExpiration(license.expirationDate) <= 30 ? 'text-medsight-critical' :
                    getDaysUntilExpiration(license.expirationDate) <= 90 ? 'text-medsight-pending' :
                    'text-medsight-primary'
                  }`}>
                    {license.expirationDate.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-medsight-primary/70">Cost:</span>
                  <div className="font-medium text-medsight-primary">
                    {formatCurrency(license.cost.amount, license.cost.currency)}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-sm text-medsight-primary/70">Features:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {license.features.slice(0, 3).map(feature => (
                    <span key={feature} className="px-2 py-1 bg-medsight-primary/10 text-medsight-primary text-xs rounded">
                      {feature.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {license.features.length > 3 && (
                    <span className="text-xs text-medsight-primary/60">
                      +{license.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => setSelectedLicense(license.id)}
                  className="flex-1 text-xs bg-medsight-primary/10 text-medsight-primary px-3 py-2 rounded hover:bg-medsight-primary/20"
                >
                  <EyeIcon className="w-3 h-3 mr-1 inline" />
                  View Details
                </button>
                <button
                  onClick={() => handleLicenseAction(license.id, 'edit')}
                  className="flex-1 text-xs bg-medsight-secondary/10 text-medsight-secondary px-3 py-2 rounded hover:bg-medsight-secondary/20"
                >
                  <PencilIcon className="w-3 h-3 mr-1 inline" />
                  Edit
                </button>
                <button
                  onClick={() => handleLicenseAction(license.id, 'renew')}
                  className="flex-1 text-xs bg-medsight-normal/10 text-medsight-normal px-3 py-2 rounded hover:bg-medsight-normal/20"
                >
                  <ArrowPathIcon className="w-3 h-3 mr-1 inline" />
                  Renew
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="medsight-control-glass p-2 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-medsight-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">License Management</h2>
              <p className="text-sm text-medsight-primary/70">
                {licenses.length} licenses • {formatCurrency(totalCost, 'USD')} annual cost • {averageUtilization.toFixed(1)}% utilized
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg">
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
            <button className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg">
              <ArrowUpTrayIcon className="w-4 h-4" />
            </button>
            <button onClick={loadLicenseData} className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg">
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex space-x-2 bg-medsight-primary/10 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'licenses', label: 'Licenses', icon: KeyIcon },
            { id: 'allocations', label: 'Allocations', icon: UsersIcon },
            { id: 'alerts', label: 'Alerts', icon: BellIcon },
            { id: 'compliance', label: 'Compliance', icon: DocumentTextIcon }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewMode(id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                viewMode === id 
                  ? 'bg-medsight-primary text-white' 
                  : 'text-medsight-primary hover:bg-medsight-primary/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'licenses' && renderLicenses()}
      {viewMode === 'allocations' && (
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">License Allocations</h3>
          <p className="text-medsight-primary/70">License allocation management coming soon...</p>
        </div>
      )}
      {viewMode === 'alerts' && (
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">License Alerts</h3>
          <p className="text-medsight-primary/70">License alerts management coming soon...</p>
        </div>
      )}
      {viewMode === 'compliance' && (
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">Compliance Reports</h3>
          <p className="text-medsight-primary/70">Compliance reporting coming soon...</p>
        </div>
      )}
    </div>
  );
} 