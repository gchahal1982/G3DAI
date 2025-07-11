'use client';

import React, { useState } from 'react';
import { 
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: 'auto',
    notifications: {
      email: true,
      push: true,
      sms: false,
      emergency: true
    },
    privacy: {
      shareAnalytics: false,
      showStatus: true
    },
    preferences: {
      language: 'en',
      timezone: 'America/New_York',
      autoSave: true
    }
  });

  const updateSetting = (section: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, any>),
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CogIcon className="w-8 h-8 text-gray-600 mr-3" />
              Settings & Preferences
            </h1>
            <p className="text-gray-700 mt-1">Customize your MedSight Pro experience</p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Appearance */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <PaintBrushIcon className="w-6 h-6 text-blue-600 mr-3" />
            Appearance
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', icon: SunIcon, label: 'Light' },
                  { value: 'dark', icon: MoonIcon, label: 'Dark' },
                  { value: 'auto', icon: ComputerDesktopIcon, label: 'Auto' }
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setSettings(prev => ({ ...prev, theme: theme.value }))}
                    className={`p-3 rounded-xl border transition-all duration-200 ${
                      settings.theme === theme.value
                        ? 'bg-blue-500/20 border-blue-200/50 text-blue-700'
                        : 'bg-white/50 border-white/30 text-gray-600 hover:bg-white/70'
                    }`}
                  >
                    <theme.icon className="w-5 h-5 mx-auto mb-2" />
                    <div className="text-xs font-medium">{theme.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <BellIcon className="w-6 h-6 text-green-600 mr-3" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
              { key: 'sms', label: 'SMS Alerts', desc: 'Text message notifications' },
              { key: 'emergency', label: 'Emergency Alerts', desc: 'Critical medical alerts' }
            ].map((notification) => (
              <div key={notification.key} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/30">
                <div>
                  <div className="text-sm font-medium text-gray-900">{notification.label}</div>
                  <div className="text-xs text-gray-600">{notification.desc}</div>
                </div>
                <button
                  onClick={() => updateSetting('notifications', notification.key, !settings.notifications[notification.key as keyof typeof settings.notifications])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications[notification.key as keyof typeof settings.notifications]
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications[notification.key as keyof typeof settings.notifications]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <ShieldCheckIcon className="w-6 h-6 text-purple-600 mr-3" />
            Privacy & Security
          </h2>
          
          <div className="space-y-4">
            {[
              { key: 'shareAnalytics', label: 'Share Analytics', desc: 'Help improve our services' },
              { key: 'showStatus', label: 'Show Online Status', desc: 'Let others see when you\'re active' }
            ].map((privacy) => (
              <div key={privacy.key} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/30">
                <div>
                  <div className="text-sm font-medium text-gray-900">{privacy.label}</div>
                  <div className="text-xs text-gray-600">{privacy.desc}</div>
                </div>
                <button
                  onClick={() => updateSetting('privacy', privacy.key, !settings.privacy[privacy.key as keyof typeof settings.privacy])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacy[privacy.key as keyof typeof settings.privacy]
                      ? 'bg-purple-600'
                      : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy[privacy.key as keyof typeof settings.privacy]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <GlobeAltIcon className="w-6 h-6 text-orange-600 mr-3" />
            Preferences
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select 
                value={settings.preferences.language}
                onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/50 border border-white/30 text-gray-900"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select 
                value={settings.preferences.timezone}
                onChange={(e) => updateSetting('preferences', 'timezone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/50 border border-white/30 text-gray-900"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/30">
              <div>
                <div className="text-sm font-medium text-gray-900">Auto-save</div>
                <div className="text-xs text-gray-600">Automatically save your work</div>
              </div>
              <button
                onClick={() => updateSetting('preferences', 'autoSave', !settings.preferences.autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.preferences.autoSave
                    ? 'bg-orange-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.preferences.autoSave
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Settings are automatically saved</div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-gray-500/20 text-gray-700 rounded-xl border border-gray-200/50 hover:bg-gray-500/30 transition-colors">
              Reset to Defaults
            </button>
            <button className="px-6 py-2 bg-blue-500/20 text-blue-700 rounded-xl border border-blue-200/50 hover:bg-blue-500/30 transition-colors font-medium">
              Export Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 