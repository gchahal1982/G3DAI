'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Database, 
  Globe, 
  Lock,
  Key,
  Server,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Download,
  Upload,
  Mail,
  Bell,
  Clock,
  FileText,
  Users,
  Activity,
  Zap,
  HardDrive,
  Wifi,
  Monitor
} from 'lucide-react';

interface SystemConfig {
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      maxAge: number;
    };
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    twoFactorAuth: boolean;
    ipWhitelist: string[];
    auditLogging: boolean;
  };
  api: {
    rateLimit: number;
    timeout: number;
    retryAttempts: number;
    enableCors: boolean;
    allowedOrigins: string[];
    apiKeys: {
      primary: string;
      secondary: string;
    };
  };
  compliance: {
    hipaaCompliance: boolean;
    auditRetentionDays: number;
    dataEncryption: boolean;
    backupFrequency: string;
    accessLogRetention: number;
    complianceReporting: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    alertThresholds: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      errorRate: number;
    };
  };
  performance: {
    cacheTimeout: number;
    maxConcurrentUsers: number;
    compressionEnabled: boolean;
    cdnEnabled: boolean;
    loadBalancing: boolean;
  };
  maintenance: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    scheduledMaintenance: Date | null;
    backupSchedule: string;
    logRotation: string;
  };
}

interface SystemConfigurationProps {
  className?: string;
}

const SystemConfiguration: React.FC<SystemConfigurationProps> = ({ className = '' }) => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('security');
  const [showPasswords, setShowPasswords] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    // Mock data - replace with actual API call
    const mockConfig: SystemConfig = {
      security: {
        passwordPolicy: {
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          maxAge: 90
        },
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        twoFactorAuth: true,
        ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
        auditLogging: true
      },
      api: {
        rateLimit: 1000,
        timeout: 30000,
        retryAttempts: 3,
        enableCors: true,
        allowedOrigins: ['https://medsight-pro.com', 'https://api.medsight-pro.com'],
        apiKeys: {
          primary: 'msp_live_key_****',
          secondary: 'msp_backup_key_****'
        }
      },
      compliance: {
        hipaaCompliance: true,
        auditRetentionDays: 2555, // 7 years
        dataEncryption: true,
        backupFrequency: 'daily',
        accessLogRetention: 90,
        complianceReporting: true
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        alertThresholds: {
          cpuUsage: 85,
          memoryUsage: 90,
          diskUsage: 80,
          errorRate: 5
        }
      },
      performance: {
        cacheTimeout: 3600,
        maxConcurrentUsers: 10000,
        compressionEnabled: true,
        cdnEnabled: true,
        loadBalancing: true
      },
      maintenance: {
        maintenanceMode: false,
        maintenanceMessage: 'System is under maintenance. Please check back later.',
        scheduledMaintenance: null,
        backupSchedule: 'daily-2am',
        logRotation: 'weekly'
      }
    };

    setConfig(mockConfig);
    setLoading(false);
  };

  const handleConfigChange = (section: string, key: string, value: any) => {
    if (!config) return;

    const newConfig = { ...config };
    
    // Handle nested keys
    if (key.includes('.')) {
      const keys = key.split('.');
      let current = newConfig[section as keyof SystemConfig] as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
    } else {
      (newConfig[section as keyof SystemConfig] as any)[key] = value;
    }

    setConfig(newConfig);
    setHasChanges(true);
    validateConfiguration(newConfig);
  };

  const validateConfiguration = (config: SystemConfig) => {
    const errors: string[] = [];

    // Security validations
    if (config.security.passwordPolicy.minLength < 8) {
      errors.push('Password minimum length must be at least 8 characters');
    }
    if (config.security.sessionTimeout < 5) {
      errors.push('Session timeout must be at least 5 minutes');
    }
    if (config.security.maxLoginAttempts < 3) {
      errors.push('Maximum login attempts must be at least 3');
    }

    // API validations
    if (config.api.rateLimit < 100) {
      errors.push('API rate limit must be at least 100 requests per hour');
    }
    if (config.api.timeout < 5000) {
      errors.push('API timeout must be at least 5 seconds');
    }

    // Compliance validations
    if (config.compliance.hipaaCompliance && config.compliance.auditRetentionDays < 2555) {
      errors.push('HIPAA compliance requires audit retention of at least 7 years (2555 days)');
    }

    setValidationErrors(errors);
  };

  const handleSave = async () => {
    if (!config || validationErrors.length > 0) return;

    setSaving(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHasChanges(false);
      console.log('Configuration saved:', config);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadConfiguration();
    setHasChanges(false);
    setValidationErrors([]);
  };

  const exportConfiguration = () => {
    if (!config) return;
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `medsight-pro-config-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Failed to load configuration
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">System Configuration</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportConfiguration}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving || validationErrors.length > 0}
              className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-1" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-4 flex items-center space-x-4">
          {hasChanges && (
            <div className="flex items-center text-amber-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
          {validationErrors.length > 0 && (
            <div className="flex items-center text-red-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">{validationErrors.length} validation errors</span>
            </div>
          )}
          {!hasChanges && validationErrors.length === 0 && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Configuration valid</span>
            </div>
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Configuration Errors</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {[
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'api', label: 'API', icon: Globe },
            { id: 'compliance', label: 'Compliance', icon: FileText },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'performance', label: 'Performance', icon: Zap },
            { id: 'maintenance', label: 'Maintenance', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Configuration Content */}
      <div className="p-6">
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
              
              {/* Password Policy */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Password Policy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Length
                    </label>
                    <input
                      type="number"
                      value={config.security.passwordPolicy.minLength}
                      onChange={(e) => handleConfigChange('security', 'passwordPolicy.minLength', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Age (days)
                    </label>
                    <input
                      type="number"
                      value={config.security.passwordPolicy.maxAge}
                      onChange={(e) => handleConfigChange('security', 'passwordPolicy.maxAge', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    { key: 'requireUppercase', label: 'Require Uppercase Letters' },
                    { key: 'requireLowercase', label: 'Require Lowercase Letters' },
                    { key: 'requireNumbers', label: 'Require Numbers' },
                    { key: 'requireSpecialChars', label: 'Require Special Characters' }
                  ].map((option) => (
                    <label key={option.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.security.passwordPolicy[option.key as keyof typeof config.security.passwordPolicy] as boolean}
                        onChange={(e) => handleConfigChange('security', `passwordPolicy.${option.key}`, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Session & Login Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={config.security.sessionTimeout}
                    onChange={(e) => handleConfigChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={config.security.maxLoginAttempts}
                    onChange={(e) => handleConfigChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lockout Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={config.security.lockoutDuration}
                    onChange={(e) => handleConfigChange('security', 'lockoutDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Security Options */}
              <div className="mt-4 space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.security.twoFactorAuth}
                    onChange={(e) => handleConfigChange('security', 'twoFactorAuth', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Two-Factor Authentication</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.security.auditLogging}
                    onChange={(e) => handleConfigChange('security', 'auditLogging', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Audit Logging</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate Limit (requests/hour)
                  </label>
                  <input
                    type="number"
                    value={config.api.rateLimit}
                    onChange={(e) => handleConfigChange('api', 'rateLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timeout (milliseconds)
                  </label>
                  <input
                    type="number"
                    value={config.api.timeout}
                    onChange={(e) => handleConfigChange('api', 'timeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retry Attempts
                  </label>
                  <input
                    type="number"
                    value={config.api.retryAttempts}
                    onChange={(e) => handleConfigChange('api', 'retryAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.api.enableCors}
                    onChange={(e) => handleConfigChange('api', 'enableCors', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable CORS</span>
                </label>
              </div>

              {/* API Keys */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">API Keys</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary API Key
                    </label>
                    <div className="flex">
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={config.api.apiKeys.primary}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-100"
                      />
                      <button
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-50"
                      >
                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secondary API Key
                    </label>
                    <div className="flex">
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={config.api.apiKeys.secondary}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-100"
                      />
                      <button
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-50"
                      >
                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Settings</h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.compliance.hipaaCompliance}
                    onChange={(e) => handleConfigChange('compliance', 'hipaaCompliance', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">HIPAA Compliance Mode</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.compliance.dataEncryption}
                    onChange={(e) => handleConfigChange('compliance', 'dataEncryption', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Data Encryption at Rest</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.compliance.complianceReporting}
                    onChange={(e) => handleConfigChange('compliance', 'complianceReporting', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Automated Compliance Reporting</span>
                </label>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audit Retention (days)
                  </label>
                  <input
                    type="number"
                    value={config.compliance.auditRetentionDays}
                    onChange={(e) => handleConfigChange('compliance', 'auditRetentionDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Log Retention (days)
                  </label>
                  <input
                    type="number"
                    value={config.compliance.accessLogRetention}
                    onChange={(e) => handleConfigChange('compliance', 'accessLogRetention', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Frequency
                  </label>
                  <select
                    value={config.compliance.backupFrequency}
                    onChange={(e) => handleConfigChange('compliance', 'backupFrequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.notifications.emailNotifications}
                    onChange={(e) => handleConfigChange('notifications', 'emailNotifications', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.notifications.smsNotifications}
                    onChange={(e) => handleConfigChange('notifications', 'smsNotifications', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">SMS Notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.notifications.pushNotifications}
                    onChange={(e) => handleConfigChange('notifications', 'pushNotifications', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Push Notifications</span>
                </label>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Alert Thresholds</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPU Usage (%)
                    </label>
                    <input
                      type="number"
                      value={config.notifications.alertThresholds.cpuUsage}
                      onChange={(e) => handleConfigChange('notifications', 'alertThresholds.cpuUsage', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Memory Usage (%)
                    </label>
                    <input
                      type="number"
                      value={config.notifications.alertThresholds.memoryUsage}
                      onChange={(e) => handleConfigChange('notifications', 'alertThresholds.memoryUsage', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Disk Usage (%)
                    </label>
                    <input
                      type="number"
                      value={config.notifications.alertThresholds.diskUsage}
                      onChange={(e) => handleConfigChange('notifications', 'alertThresholds.diskUsage', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Error Rate (%)
                    </label>
                    <input
                      type="number"
                      value={config.notifications.alertThresholds.errorRate}
                      onChange={(e) => handleConfigChange('notifications', 'alertThresholds.errorRate', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cache Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={config.performance.cacheTimeout}
                    onChange={(e) => handleConfigChange('performance', 'cacheTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Concurrent Users
                  </label>
                  <input
                    type="number"
                    value={config.performance.maxConcurrentUsers}
                    onChange={(e) => handleConfigChange('performance', 'maxConcurrentUsers', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.performance.compressionEnabled}
                    onChange={(e) => handleConfigChange('performance', 'compressionEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Compression</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.performance.cdnEnabled}
                    onChange={(e) => handleConfigChange('performance', 'cdnEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable CDN</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.performance.loadBalancing}
                    onChange={(e) => handleConfigChange('performance', 'loadBalancing', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Load Balancing</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Settings</h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.maintenance.maintenanceMode}
                    onChange={(e) => handleConfigChange('maintenance', 'maintenanceMode', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Maintenance Mode</span>
                </label>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance Message
                </label>
                <textarea
                  value={config.maintenance.maintenanceMessage}
                  onChange={(e) => handleConfigChange('maintenance', 'maintenanceMessage', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Schedule
                  </label>
                  <select
                    value={config.maintenance.backupSchedule}
                    onChange={(e) => handleConfigChange('maintenance', 'backupSchedule', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily-2am">Daily at 2 AM</option>
                    <option value="daily-midnight">Daily at Midnight</option>
                    <option value="weekly-sunday">Weekly on Sunday</option>
                    <option value="hourly">Every Hour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Log Rotation
                  </label>
                  <select
                    value={config.maintenance.logRotation}
                    onChange={(e) => handleConfigChange('maintenance', 'logRotation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemConfiguration; 