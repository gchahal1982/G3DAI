'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  ClockIcon, 
  LockClosedIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  EyeIcon,
  CogIcon,
  DocumentCheckIcon,
  KeyIcon,
  WifiIcon,
  GlobeAltIcon,
  UsersIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  FireIcon,
  CloudIcon,
  CpuChipIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import { 
  ShieldCheckIcon as ShieldCheckIconSolid,
  LockClosedIcon as LockClosedIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';
import React from 'react';

interface SessionSecurityConfig {
  sessionTimeout: {
    enabled: boolean;
    idleTimeout: number; // minutes
    maxSessionDuration: number; // minutes
    warningTime: number; // minutes before timeout
    forceLogout: boolean;
    emergencyOverride: boolean;
  };
  mfaRequirements: {
    enabled: boolean;
    requiredForRoles: string[];
    requiredForActions: string[];
    mfaTimeout: number; // minutes
    backupCodes: boolean;
    trustedDevices: boolean;
    trustedDeviceExpiry: number; // days
  };
  deviceSecurity: {
    deviceRegistration: boolean;
    maxDevicesPerUser: number;
    deviceTrust: boolean;
    geoLocationTracking: boolean;
    suspiciousLocationBlocking: boolean;
    newDeviceVerification: boolean;
  };
  networkSecurity: {
    ipWhitelisting: boolean;
    vpnRequired: boolean;
    publicWifiBlocking: boolean;
    minimumEncryption: string;
    certificateValidation: boolean;
  };
  complianceSettings: {
    auditLogging: boolean;
    dataRetentionPeriod: number; // days
    encryptionRequired: boolean;
    backupRequired: boolean;
    hipaaCompliance: boolean;
    gdprCompliance: boolean;
    emergencyAccess: boolean;
  };
  medicalSettings: {
    emergencyOverride: boolean;
    supervisorApproval: boolean;
    patientDataAccess: boolean;
    studyAccessLogging: boolean;
    imageViewingTracking: boolean;
    reportAccessControl: boolean;
  };
  alertSettings: {
    securityAlerts: boolean;
    complianceAlerts: boolean;
    timeoutWarnings: boolean;
    suspiciousActivity: boolean;
    emergencyAccess: boolean;
    alertRecipients: string[];
  };
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data' | 'network' | 'compliance';
  rules: string[];
  lastUpdated: string;
}

export default function SessionSecurityControls() {
  const [config, setConfig] = useState<SessionSecurityConfig>({
    sessionTimeout: {
      enabled: true,
      idleTimeout: 15,
      maxSessionDuration: 480, // 8 hours
      warningTime: 5,
      forceLogout: true,
      emergencyOverride: true
    },
    mfaRequirements: {
      enabled: true,
      requiredForRoles: ['System Administrator', 'Clinical Administrator', 'Radiologist'],
      requiredForActions: ['data_export', 'user_management', 'system_config'],
      mfaTimeout: 30,
      backupCodes: true,
      trustedDevices: true,
      trustedDeviceExpiry: 30
    },
    deviceSecurity: {
      deviceRegistration: true,
      maxDevicesPerUser: 5,
      deviceTrust: true,
      geoLocationTracking: true,
      suspiciousLocationBlocking: true,
      newDeviceVerification: true
    },
    networkSecurity: {
      ipWhitelisting: false,
      vpnRequired: false,
      publicWifiBlocking: true,
      minimumEncryption: 'TLS 1.3',
      certificateValidation: true
    },
    complianceSettings: {
      auditLogging: true,
      dataRetentionPeriod: 2555, // 7 years
      encryptionRequired: true,
      backupRequired: true,
      hipaaCompliance: true,
      gdprCompliance: true,
      emergencyAccess: true
    },
    medicalSettings: {
      emergencyOverride: true,
      supervisorApproval: false,
      patientDataAccess: true,
      studyAccessLogging: true,
      imageViewingTracking: true,
      reportAccessControl: true
    },
    alertSettings: {
      securityAlerts: true,
      complianceAlerts: true,
      timeoutWarnings: true,
      suspiciousActivity: true,
      emergencyAccess: true,
      alertRecipients: ['security@medsight.pro', 'admin@medsight.pro']
    }
  });

  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('session');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSecurityPolicies();
  }, []);

  const loadSecurityPolicies = async () => {
    try {
      // Mock data - in production, this would load from backend
      const mockPolicies: SecurityPolicy[] = [
        {
          id: 'policy_001',
          name: 'HIPAA Compliance Policy',
          description: 'Ensures all medical data access complies with HIPAA regulations',
          enabled: true,
          severity: 'critical',
          category: 'compliance',
          rules: [
            'All medical data must be encrypted at rest and in transit',
            'Access to patient data must be logged and audited',
            'Users must have valid medical licenses',
            'Emergency access must be tracked and reviewed'
          ],
          lastUpdated: '2024-01-15T10:00:00Z'
        },
        {
          id: 'policy_002',
          name: 'Multi-Factor Authentication Policy',
          description: 'Requires MFA for all medical professional access',
          enabled: true,
          severity: 'high',
          category: 'authentication',
          rules: [
            'MFA required for all medical professionals',
            'Backup codes must be available',
            'Trusted devices expire after 30 days',
            'MFA bypass requires supervisor approval'
          ],
          lastUpdated: '2024-01-15T10:00:00Z'
        },
        {
          id: 'policy_003',
          name: 'Session Management Policy',
          description: 'Controls session timeouts and duration limits',
          enabled: true,
          severity: 'medium',
          category: 'authentication',
          rules: [
            'Maximum idle time: 15 minutes',
            'Maximum session duration: 8 hours',
            'Warning shown 5 minutes before timeout',
            'Emergency override available for critical cases'
          ],
          lastUpdated: '2024-01-15T10:00:00Z'
        }
      ];

      setPolicies(mockPolicies);
      setLoading(false);
    } catch (error) {
      console.error('Error loading security policies:', error);
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    try {
      // Mock save - in production, this would save to backend
      console.log('Saving security configuration:', config);
      setHasChanges(false);
      // Show success notification
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  const resetConfiguration = () => {
    // Reset to default configuration
    setConfig({
      sessionTimeout: {
        enabled: true,
        idleTimeout: 15,
        maxSessionDuration: 480,
        warningTime: 5,
        forceLogout: true,
        emergencyOverride: true
      },
      mfaRequirements: {
        enabled: true,
        requiredForRoles: ['System Administrator', 'Clinical Administrator', 'Radiologist'],
        requiredForActions: ['data_export', 'user_management', 'system_config'],
        mfaTimeout: 30,
        backupCodes: true,
        trustedDevices: true,
        trustedDeviceExpiry: 30
      },
      deviceSecurity: {
        deviceRegistration: true,
        maxDevicesPerUser: 5,
        deviceTrust: true,
        geoLocationTracking: true,
        suspiciousLocationBlocking: true,
        newDeviceVerification: true
      },
      networkSecurity: {
        ipWhitelisting: false,
        vpnRequired: false,
        publicWifiBlocking: true,
        minimumEncryption: 'TLS 1.3',
        certificateValidation: true
      },
      complianceSettings: {
        auditLogging: true,
        dataRetentionPeriod: 2555,
        encryptionRequired: true,
        backupRequired: true,
        hipaaCompliance: true,
        gdprCompliance: true,
        emergencyAccess: true
      },
      medicalSettings: {
        emergencyOverride: true,
        supervisorApproval: false,
        patientDataAccess: true,
        studyAccessLogging: true,
        imageViewingTracking: true,
        reportAccessControl: true
      },
      alertSettings: {
        securityAlerts: true,
        complianceAlerts: true,
        timeoutWarnings: true,
        suspiciousActivity: true,
        emergencyAccess: true,
        alertRecipients: ['security@medsight.pro', 'admin@medsight.pro']
      }
    });
    setHasChanges(false);
  };

  const updateConfig = (section: keyof SessionSecurityConfig, updates: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
    setHasChanges(true);
  };

  const togglePolicy = (policyId: string) => {
    setPolicies(prev => prev.map(policy => 
      policy.id === policyId 
        ? { ...policy, enabled: !policy.enabled }
        : policy
    ));
    setHasChanges(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-medsight-critical';
      case 'high': return 'text-medsight-abnormal';
      case 'medium': return 'text-medsight-pending';
      case 'low': return 'text-slate-600';
      default: return 'text-slate-600';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-medsight-critical/10';
      case 'high': return 'bg-medsight-abnormal/10';
      case 'medium': return 'bg-medsight-pending/10';
      case 'low': return 'bg-slate-100';
      default: return 'bg-slate-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <KeyIcon className="w-4 h-4" />;
      case 'authorization': return <ShieldCheckIcon className="w-4 h-4" />;
      case 'data': return <DocumentCheckIcon className="w-4 h-4" />;
      case 'network': return <WifiIcon className="w-4 h-4" />;
      case 'compliance': return <CheckCircleIcon className="w-4 h-4" />;
      default: return <CogIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medsight-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-medsight-primary">Session Security Controls</h2>
          <p className="text-slate-600 mt-1">Configure medical session security settings and compliance policies</p>
        </div>
        <div className="flex items-center space-x-4">
          {hasChanges && (
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-medsight-pending" />
              <span className="text-sm text-medsight-pending">Unsaved changes</span>
            </div>
          )}
          <button 
            onClick={resetConfiguration}
            className="btn-medsight"
            disabled={!hasChanges}
          >
            Reset
          </button>
          <button 
            onClick={saveConfiguration}
            className="btn-medsight bg-medsight-primary text-white"
            disabled={!hasChanges}
          >
            Save Configuration
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="medsight-glass p-1 rounded-xl">
        <div className="flex space-x-1">
          {[
            { id: 'session', label: 'Session Management', icon: ClockIcon },
            { id: 'mfa', label: 'Multi-Factor Auth', icon: LockClosedIcon },
            { id: 'device', label: 'Device Security', icon: ComputerDesktopIcon },
            { id: 'network', label: 'Network Security', icon: WifiIcon },
            { id: 'compliance', label: 'Compliance', icon: DocumentCheckIcon },
            { id: 'medical', label: 'Medical Settings', icon: UsersIcon },
            { id: 'alerts', label: 'Alerts', icon: BellIcon },
            { id: 'policies', label: 'Security Policies', icon: ShieldCheckIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-medsight-primary text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Session Management */}
      {activeTab === 'session' && (
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-6">Session Management Settings</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-5 h-5 text-medsight-primary" />
                <div>
                  <p className="font-medium text-slate-900">Session Timeout</p>
                  <p className="text-sm text-slate-600">Automatically logout inactive sessions</p>
                </div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.sessionTimeout.enabled}
                  onChange={(e) => updateConfig('sessionTimeout', { enabled: e.target.checked })}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  config.sessionTimeout.enabled ? 'bg-medsight-primary' : 'bg-slate-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    config.sessionTimeout.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </div>

            {config.sessionTimeout.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Idle Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={config.sessionTimeout.idleTimeout}
                    onChange={(e) => updateConfig('sessionTimeout', { idleTimeout: parseInt(e.target.value) })}
                    className="input-medsight"
                    min="1"
                    max="60"
                  />
                  <p className="text-xs text-slate-500 mt-1">Medical recommendation: 15 minutes</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Maximum Session Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={config.sessionTimeout.maxSessionDuration}
                    onChange={(e) => updateConfig('sessionTimeout', { maxSessionDuration: parseInt(e.target.value) })}
                    className="input-medsight"
                    min="60"
                    max="1440"
                  />
                  <p className="text-xs text-slate-500 mt-1">Medical recommendation: 480 minutes (8 hours)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Warning Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={config.sessionTimeout.warningTime}
                    onChange={(e) => updateConfig('sessionTimeout', { warningTime: parseInt(e.target.value) })}
                    className="input-medsight"
                    min="1"
                    max="30"
                  />
                  <p className="text-xs text-slate-500 mt-1">Show warning before timeout</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.sessionTimeout.forceLogout}
                      onChange={(e) => updateConfig('sessionTimeout', { forceLogout: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Force logout on timeout</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.sessionTimeout.emergencyOverride}
                      onChange={(e) => updateConfig('sessionTimeout', { emergencyOverride: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Allow emergency override</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Multi-Factor Authentication */}
      {activeTab === 'mfa' && (
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-6">Multi-Factor Authentication Settings</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <LockClosedIconSolid className="w-5 h-5 text-medsight-primary" />
                <div>
                  <p className="font-medium text-slate-900">MFA Requirements</p>
                  <p className="text-sm text-slate-600">Require multi-factor authentication for enhanced security</p>
                </div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.mfaRequirements.enabled}
                  onChange={(e) => updateConfig('mfaRequirements', { enabled: e.target.checked })}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  config.mfaRequirements.enabled ? 'bg-medsight-primary' : 'bg-slate-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    config.mfaRequirements.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </div>

            {config.mfaRequirements.enabled && (
              <div className="space-y-6 ml-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Roles Requiring MFA
                  </label>
                  <div className="space-y-2">
                    {[
                      'System Administrator',
                      'Clinical Administrator', 
                      'Radiologist',
                      'Cardiologist',
                      'Emergency Physician',
                      'Surgeon',
                      'Resident'
                    ].map((role) => (
                      <label key={role} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={config.mfaRequirements.requiredForRoles.includes(role)}
                          onChange={(e) => {
                            const roles = e.target.checked
                              ? [...config.mfaRequirements.requiredForRoles, role]
                              : config.mfaRequirements.requiredForRoles.filter(r => r !== role);
                            updateConfig('mfaRequirements', { requiredForRoles: roles });
                          }}
                          className="rounded border-slate-300 text-medsight-primary"
                        />
                        <span className="text-sm text-slate-700">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      MFA Session Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={config.mfaRequirements.mfaTimeout}
                      onChange={(e) => updateConfig('mfaRequirements', { mfaTimeout: parseInt(e.target.value) })}
                      className="input-medsight"
                      min="5"
                      max="120"
                    />
                    <p className="text-xs text-slate-500 mt-1">How long MFA verification lasts</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Trusted Device Expiry (days)
                    </label>
                    <input
                      type="number"
                      value={config.mfaRequirements.trustedDeviceExpiry}
                      onChange={(e) => updateConfig('mfaRequirements', { trustedDeviceExpiry: parseInt(e.target.value) })}
                      className="input-medsight"
                      min="1"
                      max="90"
                    />
                    <p className="text-xs text-slate-500 mt-1">Medical recommendation: 30 days</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.mfaRequirements.backupCodes}
                      onChange={(e) => updateConfig('mfaRequirements', { backupCodes: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Enable backup codes</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.mfaRequirements.trustedDevices}
                      onChange={(e) => updateConfig('mfaRequirements', { trustedDevices: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Allow trusted devices</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Device Security */}
      {activeTab === 'device' && (
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-6">Device Security Settings</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Maximum Devices Per User
                </label>
                <input
                  type="number"
                  value={config.deviceSecurity.maxDevicesPerUser}
                  onChange={(e) => updateConfig('deviceSecurity', { maxDevicesPerUser: parseInt(e.target.value) })}
                  className="input-medsight"
                  min="1"
                  max="10"
                />
                <p className="text-xs text-slate-500 mt-1">Medical recommendation: 5 devices</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ComputerDesktopIcon className="w-5 h-5 text-medsight-primary" />
                  <div>
                    <p className="font-medium text-slate-900">Device Registration</p>
                    <p className="text-sm text-slate-600">Require device registration for access</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.deviceSecurity.deviceRegistration}
                    onChange={(e) => updateConfig('deviceSecurity', { deviceRegistration: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    config.deviceSecurity.deviceRegistration ? 'bg-medsight-primary' : 'bg-slate-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.deviceSecurity.deviceRegistration ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="w-5 h-5 text-medsight-primary" />
                  <div>
                    <p className="font-medium text-slate-900">Device Trust</p>
                    <p className="text-sm text-slate-600">Enable device trust scoring</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.deviceSecurity.deviceTrust}
                    onChange={(e) => updateConfig('deviceSecurity', { deviceTrust: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    config.deviceSecurity.deviceTrust ? 'bg-medsight-primary' : 'bg-slate-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.deviceSecurity.deviceTrust ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="w-5 h-5 text-medsight-primary" />
                  <div>
                    <p className="font-medium text-slate-900">Geo-location Tracking</p>
                    <p className="text-sm text-slate-600">Track device location for security</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.deviceSecurity.geoLocationTracking}
                    onChange={(e) => updateConfig('deviceSecurity', { geoLocationTracking: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    config.deviceSecurity.geoLocationTracking ? 'bg-medsight-primary' : 'bg-slate-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.deviceSecurity.geoLocationTracking ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-medsight-abnormal" />
                  <div>
                    <p className="font-medium text-slate-900">Suspicious Location Blocking</p>
                    <p className="text-sm text-slate-600">Block access from suspicious locations</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.deviceSecurity.suspiciousLocationBlocking}
                    onChange={(e) => updateConfig('deviceSecurity', { suspiciousLocationBlocking: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    config.deviceSecurity.suspiciousLocationBlocking ? 'bg-medsight-primary' : 'bg-slate-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.deviceSecurity.suspiciousLocationBlocking ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Settings */}
      {activeTab === 'compliance' && (
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-6">Compliance Settings</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Data Retention Period (days)
                </label>
                <input
                  type="number"
                  value={config.complianceSettings.dataRetentionPeriod}
                  onChange={(e) => updateConfig('complianceSettings', { dataRetentionPeriod: parseInt(e.target.value) })}
                  className="input-medsight"
                  min="365"
                  max="3650"
                />
                <p className="text-xs text-slate-500 mt-1">Medical recommendation: 2555 days (7 years)</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DocumentCheckIcon className="w-5 h-5 text-medsight-primary" />
                  <div>
                    <p className="font-medium text-slate-900">HIPAA Compliance</p>
                    <p className="text-sm text-slate-600">Enable HIPAA compliance features</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.complianceSettings.hipaaCompliance}
                    onChange={(e) => updateConfig('complianceSettings', { hipaaCompliance: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    config.complianceSettings.hipaaCompliance ? 'bg-medsight-primary' : 'bg-slate-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.complianceSettings.hipaaCompliance ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <LockClosedIcon className="w-5 h-5 text-medsight-primary" />
                  <div>
                    <p className="font-medium text-slate-900">Encryption Required</p>
                    <p className="text-sm text-slate-600">Require encryption for all medical data</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.complianceSettings.encryptionRequired}
                    onChange={(e) => updateConfig('complianceSettings', { encryptionRequired: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    config.complianceSettings.encryptionRequired ? 'bg-medsight-primary' : 'bg-slate-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.complianceSettings.encryptionRequired ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ChartBarIcon className="w-5 h-5 text-medsight-primary" />
                  <div>
                    <p className="font-medium text-slate-900">Audit Logging</p>
                    <p className="text-sm text-slate-600">Enable comprehensive audit logging</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.complianceSettings.auditLogging}
                    onChange={(e) => updateConfig('complianceSettings', { auditLogging: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    config.complianceSettings.auditLogging ? 'bg-medsight-primary' : 'bg-slate-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.complianceSettings.auditLogging ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FireIcon className="w-5 h-5 text-medsight-critical" />
                  <div>
                    <p className="font-medium text-slate-900">Emergency Access</p>
                    <p className="text-sm text-slate-600">Allow emergency access override</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.complianceSettings.emergencyAccess}
                    onChange={(e) => updateConfig('complianceSettings', { emergencyAccess: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    config.complianceSettings.emergencyAccess ? 'bg-medsight-primary' : 'bg-slate-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.complianceSettings.emergencyAccess ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Security Policies */}
      {activeTab === 'policies' && (
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-6">Security Policies</h3>
          
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getSeverityBgColor(policy.severity)}`}>
                      {getCategoryIcon(policy.category)}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{policy.name}</h4>
                      <p className="text-sm text-slate-600">{policy.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityBgColor(policy.severity)} ${getSeverityColor(policy.severity)}`}>
                      {policy.severity.toUpperCase()}
                    </span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={policy.enabled}
                        onChange={() => togglePolicy(policy.id)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        policy.enabled ? 'bg-medsight-primary' : 'bg-slate-200'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          policy.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="mt-4 ml-11">
                  <h5 className="text-sm font-medium text-slate-700 mb-2">Policy Rules:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {policy.rules.map((rule, index) => (
                      <li key={index} className="text-sm text-slate-600">{rule}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-500 mt-2">
                    Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Settings */}
      {activeTab === 'medical' && (
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-6">Medical-Specific Settings</h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FireIcon className="w-5 h-5 text-medsight-critical" />
                <div>
                  <p className="font-medium text-slate-900">Emergency Override</p>
                  <p className="text-sm text-slate-600">Allow emergency access override for critical cases</p>
                </div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.medicalSettings.emergencyOverride}
                  onChange={(e) => updateConfig('medicalSettings', { emergencyOverride: e.target.checked })}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  config.medicalSettings.emergencyOverride ? 'bg-medsight-primary' : 'bg-slate-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    config.medicalSettings.emergencyOverride ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UsersIcon className="w-5 h-5 text-medsight-primary" />
                <div>
                  <p className="font-medium text-slate-900">Supervisor Approval</p>
                  <p className="text-sm text-slate-600">Require supervisor approval for certain actions</p>
                </div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.medicalSettings.supervisorApproval}
                  onChange={(e) => updateConfig('medicalSettings', { supervisorApproval: e.target.checked })}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  config.medicalSettings.supervisorApproval ? 'bg-medsight-primary' : 'bg-slate-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    config.medicalSettings.supervisorApproval ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ChartBarIcon className="w-5 h-5 text-medsight-primary" />
                <div>
                  <p className="font-medium text-slate-900">Study Access Logging</p>
                  <p className="text-sm text-slate-600">Log all medical study access for audit</p>
                </div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.medicalSettings.studyAccessLogging}
                  onChange={(e) => updateConfig('medicalSettings', { studyAccessLogging: e.target.checked })}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  config.medicalSettings.studyAccessLogging ? 'bg-medsight-primary' : 'bg-slate-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    config.medicalSettings.studyAccessLogging ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <EyeIcon className="w-5 h-5 text-medsight-primary" />
                <div>
                  <p className="font-medium text-slate-900">Image Viewing Tracking</p>
                  <p className="text-sm text-slate-600">Track medical image viewing for compliance</p>
                </div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.medicalSettings.imageViewingTracking}
                  onChange={(e) => updateConfig('medicalSettings', { imageViewingTracking: e.target.checked })}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  config.medicalSettings.imageViewingTracking ? 'bg-medsight-primary' : 'bg-slate-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    config.medicalSettings.imageViewingTracking ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </label>
          </div>
        </div>
      )}

      {/* Alerts */}
      {activeTab === 'alerts' && (
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-6">Alert Configuration</h3>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BellIcon className="w-5 h-5 text-medsight-primary" />
                  <div>
                    <p className="font-medium text-slate-900">Security Alerts</p>
                    <p className="text-sm text-slate-600">Alert on security events and threats</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.alertSettings.securityAlerts}
                    onChange={(e) => updateConfig('alertSettings', { securityAlerts: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    config.alertSettings.securityAlerts ? 'bg-medsight-primary' : 'bg-slate-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.alertSettings.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DocumentCheckIcon className="w-5 h-5 text-medsight-primary" />
                  <div>
                    <p className="font-medium text-slate-900">Compliance Alerts</p>
                    <p className="text-sm text-slate-600">Alert on compliance violations</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.alertSettings.complianceAlerts}
                    onChange={(e) => updateConfig('alertSettings', { complianceAlerts: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    config.alertSettings.complianceAlerts ? 'bg-medsight-primary' : 'bg-slate-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.alertSettings.complianceAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FireIcon className="w-5 h-5 text-medsight-critical" />
                  <div>
                    <p className="font-medium text-slate-900">Emergency Access Alerts</p>
                    <p className="text-sm text-slate-600">Alert on emergency access usage</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.alertSettings.emergencyAccess}
                    onChange={(e) => updateConfig('alertSettings', { emergencyAccess: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    config.alertSettings.emergencyAccess ? 'bg-medsight-primary' : 'bg-slate-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.alertSettings.emergencyAccess ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Alert Recipients
              </label>
              <div className="space-y-2">
                {config.alertSettings.alertRecipients.map((recipient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="email"
                      value={recipient}
                      onChange={(e) => {
                        const newRecipients = [...config.alertSettings.alertRecipients];
                        newRecipients[index] = e.target.value;
                        updateConfig('alertSettings', { alertRecipients: newRecipients });
                      }}
                      className="input-medsight flex-1"
                      placeholder="Enter email address"
                    />
                    <button
                      onClick={() => {
                        const newRecipients = config.alertSettings.alertRecipients.filter((_, i) => i !== index);
                        updateConfig('alertSettings', { alertRecipients: newRecipients });
                      }}
                      className="btn-medsight text-sm bg-medsight-abnormal text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newRecipients = [...config.alertSettings.alertRecipients, ''];
                    updateConfig('alertSettings', { alertRecipients: newRecipients });
                  }}
                  className="btn-medsight text-sm"
                >
                  Add Recipient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 