'use client';

import React, { useState, useEffect } from 'react';
import { 
  CogIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  BellIcon,
  PaintBrushIcon,
  ChartBarIcon,
  CloudIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  KeyIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  CalendarIcon,
  ServerIcon,
  WifiIcon,
  LockClosedIcon,
  FireIcon,
  CubeIcon,
  CommandLineIcon,
  ComputerDesktopIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface SystemSetting {
  id: string;
  category: string;
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json' | 'password' | 'file';
  value: any;
  defaultValue: any;
  options?: { value: string; label: string; description?: string }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  sensitive?: boolean;
  restartRequired?: boolean;
  deprecated?: boolean;
  lastModified?: Date;
  modifiedBy?: string;
  tags: string[];
}

interface SettingCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  settings: SystemSetting[];
}

interface ConfigurationBackup {
  id: string;
  name: string;
  description: string;
  timestamp: Date;
  size: number;
  settings: Record<string, any>;
  checksum: string;
  createdBy: string;
  type: 'manual' | 'automatic' | 'scheduled';
}

export function SystemSettings() {
  const [categories, setCategories] = useState<SettingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSensitive, setShowSensitive] = useState(false);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [configurationBackups, setConfigurationBackups] = useState<ConfigurationBackup[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSystemSettings();
    loadConfigurationBackups();
  }, []);

  const loadSystemSettings = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockCategories: SettingCategory[] = [
      {
        id: 'general',
        name: 'General Settings',
        description: 'Basic system configuration and preferences',
        icon: CogIcon,
        color: 'text-medsight-primary',
        settings: [
          {
            id: 'system_name',
            category: 'general',
            name: 'System Name',
            description: 'The display name for this MedSight Pro instance',
            type: 'string',
            value: 'MedSight Pro Enterprise',
            defaultValue: 'MedSight Pro',
            validation: { required: true },
            lastModified: new Date(),
            modifiedBy: 'admin@hospital.com',
            tags: ['display', 'branding']
          },
          {
            id: 'system_timezone',
            category: 'general',
            name: 'System Timezone',
            description: 'Default timezone for system operations',
            type: 'select',
            value: 'America/New_York',
            defaultValue: 'UTC',
            options: [
              { value: 'UTC', label: 'UTC' },
              { value: 'America/New_York', label: 'Eastern Time' },
              { value: 'America/Chicago', label: 'Central Time' },
              { value: 'America/Denver', label: 'Mountain Time' },
              { value: 'America/Los_Angeles', label: 'Pacific Time' }
            ],
            validation: { required: true },
            restartRequired: true,
            tags: ['time', 'localization']
          },
          {
            id: 'maintenance_mode',
            category: 'general',
            name: 'Maintenance Mode',
            description: 'Enable maintenance mode to restrict system access',
            type: 'boolean',
            value: false,
            defaultValue: false,
            tags: ['maintenance', 'access']
          },
          {
            id: 'max_concurrent_users',
            category: 'general',
            name: 'Maximum Concurrent Users',
            description: 'Maximum number of users that can be logged in simultaneously',
            type: 'number',
            value: 500,
            defaultValue: 100,
            validation: { required: true, min: 1, max: 10000 },
            tags: ['performance', 'access']
          }
        ]
      },
      {
        id: 'security',
        name: 'Security Settings',
        description: 'Security policies and authentication settings',
        icon: ShieldCheckIcon,
        color: 'text-medsight-critical',
        settings: [
          {
            id: 'session_timeout',
            category: 'security',
            name: 'Session Timeout (minutes)',
            description: 'Automatic logout after period of inactivity',
            type: 'number',
            value: 30,
            defaultValue: 60,
            validation: { required: true, min: 5, max: 480 },
            tags: ['session', 'timeout']
          },
          {
            id: 'password_policy',
            category: 'security',
            name: 'Password Policy',
            description: 'Password complexity requirements',
            type: 'json',
            value: {
              minLength: 8,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSpecialChars: true,
              maxAge: 90
            },
            defaultValue: {
              minLength: 6,
              requireUppercase: false,
              requireLowercase: false,
              requireNumbers: false,
              requireSpecialChars: false,
              maxAge: 365
            },
            validation: { required: true },
            tags: ['password', 'policy']
          },
          {
            id: 'two_factor_required',
            category: 'security',
            name: 'Require Two-Factor Authentication',
            description: 'Mandate 2FA for all user accounts',
            type: 'boolean',
            value: true,
            defaultValue: false,
            tags: ['2fa', 'authentication']
          },
          {
            id: 'encryption_key',
            category: 'security',
            name: 'Data Encryption Key',
            description: 'Master encryption key for sensitive data',
            type: 'password',
            value: '••••••••••••••••••••••••••••••••',
            defaultValue: '',
            validation: { required: true },
            sensitive: true,
            restartRequired: true,
            tags: ['encryption', 'data']
          },
          {
            id: 'allowed_ip_ranges',
            category: 'security',
            name: 'Allowed IP Ranges',
            description: 'IP address ranges permitted to access the system',
            type: 'multiselect',
            value: ['192.168.1.0/24', '10.0.0.0/16'],
            defaultValue: [],
            options: [
              { value: '192.168.1.0/24', label: '192.168.1.0/24 - Hospital Network' },
              { value: '10.0.0.0/16', label: '10.0.0.0/16 - VPN Network' },
              { value: '172.16.0.0/12', label: '172.16.0.0/12 - Private Network' }
            ],
            tags: ['network', 'access']
          }
        ]
      },
      {
        id: 'performance',
        name: 'Performance Settings',
        description: 'System performance and optimization settings',
        icon: ChartBarIcon,
        color: 'text-medsight-secondary',
        settings: [
          {
            id: 'cache_size_mb',
            category: 'performance',
            name: 'Cache Size (MB)',
            description: 'Amount of memory allocated for caching',
            type: 'number',
            value: 2048,
            defaultValue: 1024,
            validation: { required: true, min: 256, max: 8192 },
            restartRequired: true,
            tags: ['cache', 'memory']
          },
          {
            id: 'max_file_size_mb',
            category: 'performance',
            name: 'Maximum File Size (MB)',
            description: 'Maximum size for uploaded files',
            type: 'number',
            value: 100,
            defaultValue: 50,
            validation: { required: true, min: 1, max: 1000 },
            tags: ['upload', 'file']
          },
          {
            id: 'database_connection_pool',
            category: 'performance',
            name: 'Database Connection Pool Size',
            description: 'Number of concurrent database connections',
            type: 'number',
            value: 20,
            defaultValue: 10,
            validation: { required: true, min: 5, max: 100 },
            restartRequired: true,
            tags: ['database', 'connections']
          },
          {
            id: 'enable_compression',
            category: 'performance',
            name: 'Enable Response Compression',
            description: 'Compress HTTP responses to reduce bandwidth',
            type: 'boolean',
            value: true,
            defaultValue: false,
            tags: ['compression', 'bandwidth']
          }
        ]
      },
      {
        id: 'backup',
        name: 'Backup & Maintenance',
        description: 'Data backup and system maintenance settings',
        icon: CircleStackIcon,
        color: 'text-medsight-pending',
        settings: [
          {
            id: 'backup_schedule',
            category: 'backup',
            name: 'Backup Schedule',
            description: 'Automatic backup frequency',
            type: 'select',
            value: 'daily',
            defaultValue: 'weekly',
            options: [
              { value: 'hourly', label: 'Hourly' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' }
            ],
            validation: { required: true },
            tags: ['backup', 'schedule']
          },
          {
            id: 'backup_retention_days',
            category: 'backup',
            name: 'Backup Retention (Days)',
            description: 'Number of days to keep backup files',
            type: 'number',
            value: 90,
            defaultValue: 30,
            validation: { required: true, min: 1, max: 365 },
            tags: ['backup', 'retention']
          },
          {
            id: 'backup_location',
            category: 'backup',
            name: 'Backup Location',
            description: 'Storage location for backup files',
            type: 'string',
            value: '/backups/medsight-pro',
            defaultValue: '/var/backups',
            validation: { required: true },
            tags: ['backup', 'storage']
          },
          {
            id: 'maintenance_window',
            category: 'backup',
            name: 'Maintenance Window',
            description: 'Scheduled maintenance time window',
            type: 'json',
            value: {
              start: '02:00',
              end: '04:00',
              timezone: 'America/New_York',
              days: ['Sunday']
            },
            defaultValue: {
              start: '03:00',
              end: '05:00',
              timezone: 'UTC',
              days: ['Sunday']
            },
            validation: { required: true },
            tags: ['maintenance', 'schedule']
          }
        ]
      },
      {
        id: 'notifications',
        name: 'Notification Settings',
        description: 'System alerts and notification preferences',
        icon: BellIcon,
        color: 'text-medsight-normal',
        settings: [
          {
            id: 'email_notifications',
            category: 'notifications',
            name: 'Enable Email Notifications',
            description: 'Send system alerts via email',
            type: 'boolean',
            value: true,
            defaultValue: true,
            tags: ['email', 'alerts']
          },
          {
            id: 'smtp_server',
            category: 'notifications',
            name: 'SMTP Server',
            description: 'Email server configuration',
            type: 'string',
            value: 'smtp.hospital.com',
            defaultValue: 'localhost',
            validation: { required: true },
            tags: ['email', 'smtp']
          },
          {
            id: 'admin_email',
            category: 'notifications',
            name: 'Administrator Email',
            description: 'Email address for system alerts',
            type: 'string',
            value: 'admin@hospital.com',
            defaultValue: '',
            validation: { required: true, pattern: '^[^@]+@[^@]+\\.[^@]+$' },
            tags: ['email', 'admin']
          },
          {
            id: 'alert_thresholds',
            category: 'notifications',
            name: 'Alert Thresholds',
            description: 'System monitoring alert thresholds',
            type: 'json',
            value: {
              cpu: 80,
              memory: 85,
              disk: 90,
              errors: 10
            },
            defaultValue: {
              cpu: 90,
              memory: 90,
              disk: 95,
              errors: 25
            },
            validation: { required: true },
            tags: ['monitoring', 'thresholds']
          }
        ]
      },
      {
        id: 'integration',
        name: 'Integration Settings',
        description: 'External system integrations and API settings',
        icon: GlobeAltIcon,
        color: 'text-medsight-secondary',
        settings: [
          {
            id: 'api_rate_limit',
            category: 'integration',
            name: 'API Rate Limit',
            description: 'Maximum API requests per minute',
            type: 'number',
            value: 1000,
            defaultValue: 500,
            validation: { required: true, min: 100, max: 10000 },
            tags: ['api', 'rate-limit']
          },
          {
            id: 'webhook_timeout',
            category: 'integration',
            name: 'Webhook Timeout (seconds)',
            description: 'Timeout for outgoing webhook calls',
            type: 'number',
            value: 30,
            defaultValue: 10,
            validation: { required: true, min: 5, max: 300 },
            tags: ['webhook', 'timeout']
          },
          {
            id: 'external_auth_enabled',
            category: 'integration',
            name: 'External Authentication',
            description: 'Enable LDAP/AD authentication',
            type: 'boolean',
            value: false,
            defaultValue: false,
            tags: ['auth', 'ldap']
          },
          {
            id: 'ldap_server',
            category: 'integration',
            name: 'LDAP Server',
            description: 'LDAP server configuration',
            type: 'string',
            value: 'ldap.hospital.com',
            defaultValue: '',
            tags: ['ldap', 'directory']
          }
        ]
      }
    ];

    setCategories(mockCategories);
    setLoading(false);
  };

  const loadConfigurationBackups = async () => {
    const mockBackups: ConfigurationBackup[] = [
      {
        id: 'backup-001',
        name: 'Pre-Security-Update',
        description: 'Configuration backup before security policy update',
        timestamp: new Date('2023-11-15T10:30:00Z'),
        size: 2048,
        settings: {},
        checksum: 'sha256:abc123...',
        createdBy: 'admin@hospital.com',
        type: 'manual'
      },
      {
        id: 'backup-002',
        name: 'Daily Backup',
        description: 'Automated daily configuration backup',
        timestamp: new Date('2023-11-14T03:00:00Z'),
        size: 1856,
        settings: {},
        checksum: 'sha256:def456...',
        createdBy: 'system',
        type: 'automatic'
      }
    ];

    setConfigurationBackups(mockBackups);
  };

  const handleSettingChange = (settingId: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [settingId]: value
    }));

    // Validate the setting
    const setting = categories
      .flatMap(cat => cat.settings)
      .find(s => s.id === settingId);

    if (setting && setting.validation) {
      const error = validateSetting(setting, value);
      setValidationErrors(prev => ({
        ...prev,
        [settingId]: error || ''
      }));
    }
  };

  const validateSetting = (setting: SystemSetting, value: any): string | null => {
    if (!setting.validation) return null;

    const { required, min, max, pattern } = setting.validation;

    if (required && (value === null || value === undefined || value === '')) {
      return 'This field is required';
    }

    if (setting.type === 'number' && typeof value === 'number') {
      if (min !== undefined && value < min) {
        return `Value must be at least ${min}`;
      }
      if (max !== undefined && value > max) {
        return `Value must be at most ${max}`;
      }
    }

    if (setting.type === 'string' && typeof value === 'string' && pattern) {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        return 'Invalid format';
      }
    }

    return null;
  };

  const saveSettings = async () => {
    setSaving(true);
    
    // Validate all pending changes
    const errors: Record<string, string> = {};
    const allSettings = categories.flatMap(cat => cat.settings);
    
    Object.entries(pendingChanges).forEach(([settingId, value]) => {
      const setting = allSettings.find(s => s.id === settingId);
      if (setting) {
        const error = validateSetting(setting, value);
        if (error) {
          errors[settingId] = error;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSaving(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the settings
      setCategories(prev => prev.map(category => ({
        ...category,
        settings: category.settings.map(setting => ({
          ...setting,
          value: pendingChanges[setting.id] !== undefined ? pendingChanges[setting.id] : setting.value,
          lastModified: pendingChanges[setting.id] !== undefined ? new Date() : setting.lastModified,
          modifiedBy: pendingChanges[setting.id] !== undefined ? 'admin@hospital.com' : setting.modifiedBy
        }))
      })));

      setPendingChanges({});
      setValidationErrors({});
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
    
    setSaving(false);
  };

  const resetSettings = () => {
    setPendingChanges({});
    setValidationErrors({});
  };

  const createBackup = async (name: string, description: string) => {
    // Simulate backup creation
    const backup: ConfigurationBackup = {
      id: `backup-${Date.now()}`,
      name,
      description,
      timestamp: new Date(),
      size: 2048,
      settings: {},
      checksum: 'sha256:' + Math.random().toString(36).substr(2, 9),
      createdBy: 'admin@hospital.com',
      type: 'manual'
    };

    setConfigurationBackups(prev => [backup, ...prev]);
  };

  const restoreBackup = async (backupId: string) => {
    console.log('Restoring backup:', backupId);
    // Simulate restore operation
  };

  const exportSettings = () => {
    const allSettings = categories.reduce((acc, category) => {
      category.settings.forEach(setting => {
        acc[setting.id] = setting.value;
      });
      return acc;
    }, {} as Record<string, any>);

    const dataStr = JSON.stringify(allSettings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `medsight-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    settings: category.settings.filter(setting => {
      const matchesSearch = searchTerm === '' || 
        setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = filterTags.length === 0 || 
        filterTags.some(tag => setting.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    })
  }));

  const selectedCategoryData = filteredCategories.find(cat => cat.id === selectedCategory);

  const renderSettingInput = (setting: SystemSetting) => {
    const currentValue = pendingChanges[setting.id] !== undefined ? pendingChanges[setting.id] : setting.value;
    const hasError = validationErrors[setting.id];

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={setting.id}
              checked={currentValue}
              onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
              className="h-4 w-4 text-medsight-primary border-medsight-primary/30 rounded focus:ring-medsight-primary"
            />
            <label htmlFor={setting.id} className="text-sm text-medsight-primary">
              {setting.name}
            </label>
          </div>
        );

      case 'select':
        return (
          <select
            value={currentValue}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="input-medsight"
          >
            {setting.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {setting.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${setting.id}-${option.value}`}
                  checked={Array.isArray(currentValue) && currentValue.includes(option.value)}
                  onChange={(e) => {
                    const newValue = Array.isArray(currentValue) ? [...currentValue] : [];
                    if (e.target.checked) {
                      newValue.push(option.value);
                    } else {
                      const index = newValue.indexOf(option.value);
                      if (index > -1) {
                        newValue.splice(index, 1);
                      }
                    }
                    handleSettingChange(setting.id, newValue);
                  }}
                  className="h-4 w-4 text-medsight-primary border-medsight-primary/30 rounded focus:ring-medsight-primary"
                />
                <label htmlFor={`${setting.id}-${option.value}`} className="text-sm text-medsight-primary">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'password':
        return (
          <div className="relative">
            <input
              type={showSensitive ? 'text' : 'password'}
              value={currentValue}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              className="input-medsight pr-10"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowSensitive(!showSensitive)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-medsight-primary/50"
            >
              {showSensitive ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        );

      case 'json':
        return (
          <textarea
            value={typeof currentValue === 'object' ? JSON.stringify(currentValue, null, 2) : currentValue}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleSettingChange(setting.id, parsed);
              } catch {
                handleSettingChange(setting.id, e.target.value);
              }
            }}
            className="input-medsight h-32 font-mono text-xs"
            placeholder="Enter JSON configuration"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
            className="input-medsight"
            min={setting.validation?.min}
            max={setting.validation?.max}
          />
        );

      case 'string':
      default:
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="input-medsight"
            placeholder={`Enter ${setting.name.toLowerCase()}`}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="medsight-glass p-8 rounded-xl">
          <div className="w-8 h-8 border-4 border-medsight-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-sm text-medsight-primary">Loading system settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="medsight-control-glass p-2 rounded-lg">
              <CogIcon className="w-6 h-6 text-medsight-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-medsight-primary">System Settings</h2>
              <p className="text-sm text-medsight-primary/70">
                Configure system preferences and operational parameters
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button onClick={exportSettings} className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg">
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
            <button onClick={resetSettings} className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg">
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex space-x-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medsight-primary/50" />
            <input
              type="text"
              placeholder="Search settings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-medsight pl-10 w-full"
            />
          </div>
          
          <button
            onClick={() => setShowSensitive(!showSensitive)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showSensitive 
                ? 'bg-medsight-critical/10 text-medsight-critical' 
                : 'bg-medsight-primary/10 text-medsight-primary hover:bg-medsight-primary/20'
            }`}
          >
            {showSensitive ? <EyeSlashIcon className="w-4 h-4 mr-2 inline" /> : <EyeIcon className="w-4 h-4 mr-2 inline" />}
            {showSensitive ? 'Hide' : 'Show'} Sensitive
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 bg-medsight-primary/10 rounded-lg p-1">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                  selectedCategory === category.id 
                    ? 'bg-medsight-primary text-white' 
                    : 'text-medsight-primary hover:bg-medsight-primary/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Content */}
      {selectedCategoryData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-6">
                <selectedCategoryData.icon className={`w-6 h-6 ${selectedCategoryData.color}`} />
                <div>
                  <h3 className="text-lg font-semibold text-medsight-primary">{selectedCategoryData.name}</h3>
                  <p className="text-sm text-medsight-primary/70">{selectedCategoryData.description}</p>
                </div>
              </div>

              <div className="space-y-6">
                {selectedCategoryData.settings.map(setting => (
                  <div key={setting.id} className="border-b border-medsight-primary/10 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium text-medsight-primary">
                            {setting.name}
                          </label>
                          {setting.sensitive && (
                            <LockClosedIcon className="w-4 h-4 text-medsight-critical" />
                          )}
                          {setting.restartRequired && (
                            <ArrowPathIcon className="w-4 h-4 text-medsight-pending" />
                          )}
                          {setting.deprecated && (
                            <ExclamationTriangleIcon className="w-4 h-4 text-medsight-pending" />
                          )}
                        </div>
                        <p className="text-xs text-medsight-primary/60 mt-1">{setting.description}</p>
                        {setting.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {setting.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-medsight-primary/10 text-medsight-primary text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {setting.type !== 'boolean' && (
                        <label className="block text-xs font-medium text-medsight-primary/70 mb-1">
                          Value
                        </label>
                      )}
                      {renderSettingInput(setting)}
                      
                      {validationErrors[setting.id] && (
                        <p className="text-xs text-medsight-critical flex items-center space-x-1">
                          <ExclamationCircleIcon className="w-3 h-3" />
                          <span>{validationErrors[setting.id]}</span>
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-medsight-primary/50">
                        <span>Default: {
                          typeof setting.defaultValue === 'object' 
                            ? JSON.stringify(setting.defaultValue) 
                            : String(setting.defaultValue)
                        }</span>
                        {setting.lastModified && (
                          <span>
                            Modified: {setting.lastModified.toLocaleDateString()} by {setting.modifiedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Changes */}
            {Object.keys(pendingChanges).length > 0 && (
              <div className="medsight-glass p-4 rounded-xl">
                <h4 className="font-medium text-medsight-primary mb-3">Pending Changes</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(pendingChanges).map(([settingId, value]) => {
                    const setting = categories.flatMap(cat => cat.settings).find(s => s.id === settingId);
                    return (
                      <div key={settingId} className="flex items-center justify-between p-2 bg-medsight-primary/5 rounded">
                        <span className="text-medsight-primary/70">{setting?.name}</span>
                        <span className="text-medsight-primary font-medium">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="flex-1 btn-medsight"
                  >
                    {saving ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetSettings}
                    className="px-4 py-2 bg-medsight-primary/10 text-medsight-primary rounded-lg hover:bg-medsight-primary/20"
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Configuration Backups */}
            <div className="medsight-glass p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-medsight-primary">Configuration Backups</h4>
                <button
                  onClick={() => createBackup('Manual Backup', 'User-initiated backup')}
                  className="text-xs bg-medsight-primary/10 text-medsight-primary px-2 py-1 rounded hover:bg-medsight-primary/20"
                >
                  <PlusIcon className="w-3 h-3 mr-1 inline" />
                  Create
                </button>
              </div>
              
              <div className="space-y-2">
                {configurationBackups.slice(0, 3).map(backup => (
                  <div key={backup.id} className="p-3 bg-medsight-primary/5 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-medsight-primary">{backup.name}</div>
                        <div className="text-xs text-medsight-primary/60">
                          {backup.timestamp.toLocaleDateString()} • {backup.size} bytes
                        </div>
                      </div>
                      <button
                        onClick={() => restoreBackup(backup.id)}
                        className="text-xs text-medsight-primary hover:text-medsight-primary/70"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="medsight-glass p-4 rounded-xl">
              <h4 className="font-medium text-medsight-primary mb-3">System Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-medsight-primary/70">Configuration</span>
                  <span className="text-medsight-normal">Valid</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-medsight-primary/70">Restart Required</span>
                  <span className="text-medsight-pending">
                    {categories.flatMap(cat => cat.settings).some(s => s.restartRequired && pendingChanges[s.id] !== undefined) ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-medsight-primary/70">Last Backup</span>
                  <span className="text-medsight-primary">
                    {configurationBackups[0]?.timestamp.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 