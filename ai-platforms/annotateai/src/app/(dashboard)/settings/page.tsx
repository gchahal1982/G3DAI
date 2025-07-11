'use client';

import { useState, useEffect } from 'react';
import { UserPreferences, User } from '@/types/auth';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function TabButton({ isActive, onClick, children, icon }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-annotate-primary-500 text-white shadow-lg'
          : 'text-annotate-primary-600 hover:bg-annotate-primary-50 hover:text-annotate-primary-700'
      }`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

interface SettingSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingSection({ title, description, children }: SettingSectionProps) {
  return (
    <div className="annotate-glass p-6 rounded-xl border border-annotate-primary-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-annotate-primary-900">{title}</h3>
        {description && (
          <p className="text-sm text-annotate-primary-600 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ enabled, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <label className="text-sm font-medium text-annotate-primary-900">{label}</label>
        {description && (
          <p className="text-xs text-annotate-primary-600">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-annotate-primary-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
  description?: string;
}

function Select({ value, onChange, options, label, description }: SelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-annotate-primary-900">{label}</label>
      {description && (
        <p className="text-xs text-annotate-primary-600">{description}</p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-annotate-primary-200 rounded-lg bg-white text-annotate-primary-900 focus:border-annotate-primary-500 focus:ring-2 focus:ring-annotate-primary-200 transition-colors"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

function NumberInput({ value, onChange, label, description, min, max, step = 1 }: NumberInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-annotate-primary-900">{label}</label>
      {description && (
        <p className="text-xs text-annotate-primary-600">{description}</p>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border border-annotate-primary-200 rounded-lg bg-white text-annotate-primary-900 focus:border-annotate-primary-500 focus:ring-2 focus:ring-annotate-primary-200 transition-colors"
      />
    </div>
  );
}

// Mock user for settings demo
const mockUser: User = {
  id: '1',
  email: 'demo@annotateai.com',
  firstName: 'Demo',
  lastName: 'User',
  avatar: null,
  role: 'admin',
  subscription: {
    id: 'sub-1',
    plan: 'pro',
    status: 'active',
    currentPeriodStart: new Date('2024-01-01'),
    currentPeriodEnd: new Date('2024-12-31'),
    cancelAtPeriodEnd: false,
    usage: {
      projects: 5,
      storage: 2.5,
      apiCalls: 1250,
      annotations: 25000,
      teamMembers: 3,
      modelTraining: 2,
      exports: 45
    },
    limits: {
      projects: 25,
      storage: 50,
      apiCalls: 50000,
      annotations: 500000,
      teamMembers: 10,
      modelTraining: 10,
      exports: 1000,
      supportLevel: 'priority',
      features: ['basic_annotation', 'advanced_annotation', 'collaboration', 'api_access']
    }
  },
  preferences: {
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: {
        projectUpdates: true,
        teamInvites: true,
        billingAlerts: true,
        securityAlerts: true,
        productUpdates: false,
        weeklyDigest: true
      },
      push: {
        projectUpdates: true,
        mentions: true,
        deadlines: true,
        systemAlerts: true
      },
      inApp: {
        projectUpdates: true,
        teamActivity: true,
        systemNotifications: true
      }
    },
    privacy: {
      analyticsEnabled: true,
      crashReportingEnabled: true,
      dataSharingEnabled: false,
      profileVisibility: 'team',
      activityLogging: true
    },
    workspace: {
      defaultExportFormat: 'coco',
      autoSaveInterval: 30,
      keyboardShortcuts: true,
      showTutorials: false,
      gridSnapping: true,
      darkModeAnnotations: true
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
      screenReader: false,
      keyboardNavigation: true,
      colorBlindMode: 'none'
    }
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
  lastLoginAt: new Date(),
  emailVerified: true,
  twoFactorEnabled: false
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('appearance');
  const [preferences, setPreferences] = useState<UserPreferences | null>(mockUser.preferences);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const user = mockUser; // Use mock user for now

  // Auto-save preferences when they change
  useEffect(() => {
    if (preferences && user?.preferences) {
      const hasChanges = JSON.stringify(preferences) !== JSON.stringify(user.preferences);
      if (hasChanges) {
        const timeoutId = setTimeout(async () => {
          await savePreferences();
        }, 1000); // Debounce saves by 1 second

        return () => clearTimeout(timeoutId);
      }
    }
  }, [preferences]);

  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSaveMessage('Settings saved');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setSaveMessage('Failed to save settings');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (path: string, value: any) => {
    if (!preferences) return;

    const keys = path.split('.');
    const newPreferences = { ...preferences };
    let current: any = newPreferences;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setPreferences(newPreferences);
  };

  // Simple plan checking functions for demo
  const hasPlan = (plan: string) => {
    const planHierarchy = { free: 1, pro: 2, enterprise: 3, custom: 4 };
    const userLevel = planHierarchy[user.subscription.plan as keyof typeof planHierarchy];
    const requiredLevel = planHierarchy[plan as keyof typeof planHierarchy];
    return userLevel >= requiredLevel;
  };

  if (!user || !preferences) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="annotate-glass p-8 rounded-2xl border border-annotate-primary-200">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-annotate-primary-200 border-t-annotate-primary-500 mx-auto" />
          <p className="mt-4 text-annotate-primary-600 text-sm text-center">Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'appearance',
      label: 'Appearance',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      )
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 9.82 2.8c.58.88.46 2.04-.19 2.82l-6.25 7.54c-.74.9-2.04.9-2.78 0L4.85 9.37c-.65-.78-.77-1.94-.19-2.82a6 6 0 0 1 9.84-2.8z" />
        </svg>
      )
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      id: 'workspace',
      label: 'Workspace',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  // Add API tab for paid plans
  if (hasPlan('pro')) {
    tabs.push({
      id: 'api',
      label: 'API Keys',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      )
    });
  }

  // Add danger zone for owners/admins
  if (user.role === 'owner' || user.role === 'admin') {
    tabs.push({
      id: 'danger',
      label: 'Danger Zone',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833-.23 2.5 1.732 2.5z" />
        </svg>
      )
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-annotate-primary-50 to-annotate-primary-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-annotate-primary-900">Settings</h1>
          <p className="text-annotate-primary-600 mt-2">
            Manage your account preferences and workspace configuration
          </p>
          
          {/* Save indicator */}
          {(saving || saveMessage) && (
            <div className={`mt-4 px-4 py-2 rounded-lg text-sm ${
              saving
                ? 'bg-blue-100 text-blue-800'
                : saveMessage === 'Settings saved'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {saving ? 'Saving...' : saveMessage}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <div className="annotate-glass p-4 rounded-xl border border-annotate-primary-200 sticky top-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    icon={tab.icon}
                  >
                    {tab.label}
                  </TabButton>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="space-y-6">
              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <>
                  <SettingSection
                    title="Theme"
                    description="Choose your preferred color scheme"
                  >
                    <Select
                      value={preferences.theme}
                      onChange={(value) => updatePreference('theme', value)}
                      options={[
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                        { value: 'system', label: 'System' }
                      ]}
                      label="Color scheme"
                      description="Select your preferred theme or follow system preference"
                    />
                  </SettingSection>

                  <SettingSection
                    title="Language & Region"
                    description="Customize your language and regional preferences"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        value={preferences.language}
                        onChange={(value) => updatePreference('language', value)}
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'es', label: 'Español' },
                          { value: 'fr', label: 'Français' },
                          { value: 'de', label: 'Deutsch' },
                          { value: 'ja', label: '日本語' },
                          { value: 'ko', label: '한국어' },
                          { value: 'zh', label: '中文' }
                        ]}
                        label="Language"
                        description="Interface language"
                      />
                      
                      <Select
                        value={preferences.timezone}
                        onChange={(value) => updatePreference('timezone', value)}
                        options={[
                          { value: 'UTC', label: 'UTC' },
                          { value: 'America/New_York', label: 'Eastern Time' },
                          { value: 'America/Chicago', label: 'Central Time' },
                          { value: 'America/Denver', label: 'Mountain Time' },
                          { value: 'America/Los_Angeles', label: 'Pacific Time' },
                          { value: 'Europe/London', label: 'London' },
                          { value: 'Europe/Paris', label: 'Paris' },
                          { value: 'Asia/Tokyo', label: 'Tokyo' },
                          { value: 'Asia/Shanghai', label: 'Shanghai' }
                        ]}
                        label="Timezone"
                        description="Your local timezone"
                      />
                    </div>
                  </SettingSection>
                </>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <>
                  <SettingSection
                    title="Email Notifications"
                    description="Control what email notifications you receive"
                  >
                    <div className="space-y-4">
                      <Toggle
                        enabled={preferences.notifications.email.projectUpdates}
                        onChange={(enabled) => updatePreference('notifications.email.projectUpdates', enabled)}
                        label="Project Updates"
                        description="Get notified when projects are updated or completed"
                      />
                      <Toggle
                        enabled={preferences.notifications.email.teamInvites}
                        onChange={(enabled) => updatePreference('notifications.email.teamInvites', enabled)}
                        label="Team Invitations"
                        description="Receive invitations to join teams and organizations"
                      />
                      <Toggle
                        enabled={preferences.notifications.email.billingAlerts}
                        onChange={(enabled) => updatePreference('notifications.email.billingAlerts', enabled)}
                        label="Billing Alerts"
                        description="Important billing and subscription notifications"
                      />
                      <Toggle
                        enabled={preferences.notifications.email.securityAlerts}
                        onChange={(enabled) => updatePreference('notifications.email.securityAlerts', enabled)}
                        label="Security Alerts"
                        description="Critical security notifications (cannot be disabled)"
                      />
                      <Toggle
                        enabled={preferences.notifications.email.productUpdates}
                        onChange={(enabled) => updatePreference('notifications.email.productUpdates', enabled)}
                        label="Product Updates"
                        description="New features and product announcements"
                      />
                      <Toggle
                        enabled={preferences.notifications.email.weeklyDigest}
                        onChange={(enabled) => updatePreference('notifications.email.weeklyDigest', enabled)}
                        label="Weekly Digest"
                        description="Weekly summary of your activity"
                      />
                    </div>
                  </SettingSection>

                  <SettingSection
                    title="Push Notifications"
                    description="Real-time notifications in your browser"
                  >
                    <div className="space-y-4">
                      <Toggle
                        enabled={preferences.notifications.push.projectUpdates}
                        onChange={(enabled) => updatePreference('notifications.push.projectUpdates', enabled)}
                        label="Project Updates"
                        description="Real-time project notifications"
                      />
                      <Toggle
                        enabled={preferences.notifications.push.mentions}
                        onChange={(enabled) => updatePreference('notifications.push.mentions', enabled)}
                        label="Mentions"
                        description="When someone mentions you in comments"
                      />
                      <Toggle
                        enabled={preferences.notifications.push.deadlines}
                        onChange={(enabled) => updatePreference('notifications.push.deadlines', enabled)}
                        label="Deadlines"
                        description="Upcoming project deadlines"
                      />
                      <Toggle
                        enabled={preferences.notifications.push.systemAlerts}
                        onChange={(enabled) => updatePreference('notifications.push.systemAlerts', enabled)}
                        label="System Alerts"
                        description="System maintenance and status updates"
                      />
                    </div>
                  </SettingSection>

                  <SettingSection
                    title="In-App Notifications"
                    description="Notifications within the AnnotateAI interface"
                  >
                    <div className="space-y-4">
                      <Toggle
                        enabled={preferences.notifications.inApp.projectUpdates}
                        onChange={(enabled) => updatePreference('notifications.inApp.projectUpdates', enabled)}
                        label="Project Updates"
                        description="Show in-app notifications for project changes"
                      />
                      <Toggle
                        enabled={preferences.notifications.inApp.teamActivity}
                        onChange={(enabled) => updatePreference('notifications.inApp.teamActivity', enabled)}
                        label="Team Activity"
                        description="Notifications about team member activity"
                      />
                      <Toggle
                        enabled={preferences.notifications.inApp.systemNotifications}
                        onChange={(enabled) => updatePreference('notifications.inApp.systemNotifications', enabled)}
                        label="System Notifications"
                        description="General system messages and updates"
                      />
                    </div>
                  </SettingSection>
                </>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <>
                  <SettingSection
                    title="Data Collection"
                    description="Control how your data is collected and used"
                  >
                    <div className="space-y-4">
                      <Toggle
                        enabled={preferences.privacy.analyticsEnabled}
                        onChange={(enabled) => updatePreference('privacy.analyticsEnabled', enabled)}
                        label="Analytics"
                        description="Help improve AnnotateAI by sharing anonymous usage data"
                      />
                      <Toggle
                        enabled={preferences.privacy.crashReportingEnabled}
                        onChange={(enabled) => updatePreference('privacy.crashReportingEnabled', enabled)}
                        label="Crash Reporting"
                        description="Automatically send crash reports to help us fix issues"
                      />
                      <Toggle
                        enabled={preferences.privacy.dataSharingEnabled}
                        onChange={(enabled) => updatePreference('privacy.dataSharingEnabled', enabled)}
                        label="Data Sharing"
                        description="Share aggregated data with research partners"
                      />
                      <Toggle
                        enabled={preferences.privacy.activityLogging}
                        onChange={(enabled) => updatePreference('privacy.activityLogging', enabled)}
                        label="Activity Logging"
                        description="Log your activity for audit and security purposes"
                      />
                    </div>
                  </SettingSection>

                  <SettingSection
                    title="Profile Visibility"
                    description="Control who can see your profile information"
                  >
                    <Select
                      value={preferences.privacy.profileVisibility}
                      onChange={(value) => updatePreference('privacy.profileVisibility', value)}
                      options={[
                        { value: 'private', label: 'Private - Only me' },
                        { value: 'team', label: 'Team - Team members only' },
                        { value: 'public', label: 'Public - Anyone in organization' }
                      ]}
                      label="Profile visibility"
                      description="Choose who can view your profile and activity"
                    />
                  </SettingSection>
                </>
              )}

              {/* Workspace Settings */}
              {activeTab === 'workspace' && (
                <>
                  <SettingSection
                    title="Annotation Preferences"
                    description="Default settings for annotation projects"
                  >
                    <div className="space-y-4">
                      <Select
                        value={preferences.workspace.defaultExportFormat}
                        onChange={(value) => updatePreference('workspace.defaultExportFormat', value)}
                        options={[
                          { value: 'coco', label: 'COCO JSON' },
                          { value: 'yolo', label: 'YOLO' },
                          { value: 'pascal', label: 'Pascal VOC' },
                          { value: 'json', label: 'Custom JSON' }
                        ]}
                        label="Default Export Format"
                        description="Preferred format for exporting annotations"
                      />
                      
                      <NumberInput
                        value={preferences.workspace.autoSaveInterval}
                        onChange={(value) => updatePreference('workspace.autoSaveInterval', value)}
                        label="Auto-save Interval (seconds)"
                        description="How often to automatically save your work"
                        min={10}
                        max={300}
                        step={10}
                      />
                      
                      <Toggle
                        enabled={preferences.workspace.keyboardShortcuts}
                        onChange={(enabled) => updatePreference('workspace.keyboardShortcuts', enabled)}
                        label="Keyboard Shortcuts"
                        description="Enable keyboard shortcuts for faster annotation"
                      />
                      
                      <Toggle
                        enabled={preferences.workspace.showTutorials}
                        onChange={(enabled) => updatePreference('workspace.showTutorials', enabled)}
                        label="Show Tutorials"
                        description="Display helpful tips and tutorials"
                      />
                      
                      <Toggle
                        enabled={preferences.workspace.gridSnapping}
                        onChange={(enabled) => updatePreference('workspace.gridSnapping', enabled)}
                        label="Grid Snapping"
                        description="Snap annotations to grid for precise alignment"
                      />
                      
                      <Toggle
                        enabled={preferences.workspace.darkModeAnnotations}
                        onChange={(enabled) => updatePreference('workspace.darkModeAnnotations', enabled)}
                        label="Dark Mode Annotations"
                        description="Use dark theme for annotation interface"
                      />
                    </div>
                  </SettingSection>
                </>
              )}

              {/* Accessibility Settings */}
              {activeTab === 'accessibility' && (
                <>
                  <SettingSection
                    title="Visual Accessibility"
                    description="Customize the interface for better accessibility"
                  >
                    <div className="space-y-4">
                      <Toggle
                        enabled={preferences.accessibility.reducedMotion}
                        onChange={(enabled) => updatePreference('accessibility.reducedMotion', enabled)}
                        label="Reduced Motion"
                        description="Minimize animations and transitions"
                      />
                      
                      <Toggle
                        enabled={preferences.accessibility.highContrast}
                        onChange={(enabled) => updatePreference('accessibility.highContrast', enabled)}
                        label="High Contrast"
                        description="Increase contrast for better visibility"
                      />
                      
                      <Select
                        value={preferences.accessibility.fontSize}
                        onChange={(value) => updatePreference('accessibility.fontSize', value)}
                        options={[
                          { value: 'small', label: 'Small' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'large', label: 'Large' }
                        ]}
                        label="Font Size"
                        description="Adjust text size throughout the interface"
                      />
                      
                      <Select
                        value={preferences.accessibility.colorBlindMode}
                        onChange={(value) => updatePreference('accessibility.colorBlindMode', value)}
                        options={[
                          { value: 'none', label: 'None' },
                          { value: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
                          { value: 'protanopia', label: 'Protanopia (Red-blind)' },
                          { value: 'tritanopia', label: 'Tritanopia (Blue-blind)' }
                        ]}
                        label="Color Blind Support"
                        description="Adjust colors for color vision deficiency"
                      />
                    </div>
                  </SettingSection>

                  <SettingSection
                    title="Navigation & Input"
                    description="Accessibility options for navigation and input"
                  >
                    <div className="space-y-4">
                      <Toggle
                        enabled={preferences.accessibility.keyboardNavigation}
                        onChange={(enabled) => updatePreference('accessibility.keyboardNavigation', enabled)}
                        label="Enhanced Keyboard Navigation"
                        description="Improve keyboard navigation with focus indicators"
                      />
                      
                      <Toggle
                        enabled={preferences.accessibility.screenReader}
                        onChange={(enabled) => updatePreference('accessibility.screenReader', enabled)}
                        label="Screen Reader Optimization"
                        description="Optimize interface for screen readers"
                      />
                    </div>
                  </SettingSection>
                </>
              )}

              {/* API Keys (Pro+ only) */}
              {activeTab === 'api' && hasPlan('pro') && (
                <>
                  <SettingSection
                    title="API Keys"
                    description="Manage your API keys for programmatic access"
                  >
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900">API Access</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Use API keys to integrate AnnotateAI with your applications. 
                          Keep your keys secure and never share them publicly.
                        </p>
                      </div>
                      
                      <div className="border border-annotate-primary-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-annotate-primary-900">Production API Key</h4>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                            sk_live_************************************************
                          </code>
                          <button className="px-3 py-2 text-sm border border-annotate-primary-200 rounded hover:bg-annotate-primary-50">
                            Copy
                          </button>
                          <button className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                            Revoke
                          </button>
                        </div>
                        <p className="text-xs text-annotate-primary-600 mt-2">
                          Created on Dec 15, 2024 • Last used 2 hours ago
                        </p>
                      </div>

                      <button className="w-full py-2 border-2 border-dashed border-annotate-primary-300 text-annotate-primary-600 rounded-lg hover:border-annotate-primary-400 hover:text-annotate-primary-700 transition-colors">
                        + Generate New API Key
                      </button>
                    </div>
                  </SettingSection>

                  <SettingSection
                    title="API Usage"
                    description="Monitor your API usage and limits"
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-annotate-primary-50 rounded-lg">
                          <div className="text-2xl font-bold text-annotate-primary-900">1,247</div>
                          <div className="text-sm text-annotate-primary-600">Requests Today</div>
                        </div>
                        <div className="text-center p-4 bg-annotate-primary-50 rounded-lg">
                          <div className="text-2xl font-bold text-annotate-primary-900">89%</div>
                          <div className="text-sm text-annotate-primary-600">Monthly Usage</div>
                        </div>
                        <div className="text-center p-4 bg-annotate-primary-50 rounded-lg">
                          <div className="text-2xl font-bold text-annotate-primary-900">50k</div>
                          <div className="text-sm text-annotate-primary-600">Monthly Limit</div>
                        </div>
                      </div>
                    </div>
                  </SettingSection>
                </>
              )}

              {/* Danger Zone (Admin/Owner only) */}
              {activeTab === 'danger' && (user.role === 'owner' || user.role === 'admin') && (
                <>
                  <SettingSection
                    title="Danger Zone"
                    description="Irreversible and destructive actions"
                  >
                    <div className="space-y-4">
                      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <h4 className="font-medium text-red-900 mb-2">Export Account Data</h4>
                        <p className="text-sm text-red-700 mb-4">
                          Download all your account data including projects, annotations, and settings.
                        </p>
                        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                          Export Data
                        </button>
                      </div>

                      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                        <p className="text-sm text-red-700 mb-4">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                          Delete Account
                        </button>
                      </div>

                      {user.role === 'owner' && (
                        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                          <h4 className="font-medium text-red-900 mb-2">Delete Organization</h4>
                          <p className="text-sm text-red-700 mb-4">
                            Permanently delete your organization and all associated data, projects, and team members. 
                            This action cannot be undone.
                          </p>
                          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                            Delete Organization
                          </button>
                        </div>
                      )}
                    </div>
                  </SettingSection>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 