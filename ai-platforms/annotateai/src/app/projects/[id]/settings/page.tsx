'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Settings, 
  Users, 
  Lock, 
  Trash2, 
  Save, 
  Upload, 
  Download, 
  Eye, 
  EyeOff,
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Shield
} from 'lucide-react';

interface ProjectSettings {
  id: string;
  name: string;
  description: string;
  visibility: 'private' | 'team' | 'organization' | 'public';
  annotationSettings: {
    allowOverlapping: boolean;
    requireReview: boolean;
    autoSave: boolean;
    autoSaveInterval: number;
    defaultLabelColor: string;
    showConfidence: boolean;
    enableKeyboardShortcuts: boolean;
  };
  qualitySettings: {
    minAnnotationsPerImage: number;
    maxAnnotationsPerImage: number;
    requireDescription: boolean;
    enableQualityScoring: boolean;
    consensusThreshold: number;
  };
  exportSettings: {
    defaultFormat: string;
    includeMetadata: boolean;
    includeImages: boolean;
    compressionLevel: number;
  };
  teamSettings: {
    allowInvites: boolean;
    defaultRole: 'viewer' | 'annotator' | 'reviewer' | 'admin';
    requireApproval: boolean;
  };
  integrations: {
    webhookUrl?: string;
    slackChannel?: string;
    emailNotifications: boolean;
  };
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState('');

  // Mock project settings data
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings({
        id: projectId,
        name: 'Medical Image Segmentation',
        description: 'Advanced segmentation project for medical imaging data with multi-class organ detection and pathology identification.',
        visibility: 'team',
        annotationSettings: {
          allowOverlapping: true,
          requireReview: true,
          autoSave: true,
          autoSaveInterval: 30,
          defaultLabelColor: '#6366f1',
          showConfidence: true,
          enableKeyboardShortcuts: true,
        },
        qualitySettings: {
          minAnnotationsPerImage: 1,
          maxAnnotationsPerImage: 50,
          requireDescription: false,
          enableQualityScoring: true,
          consensusThreshold: 0.8,
        },
        exportSettings: {
          defaultFormat: 'COCO',
          includeMetadata: true,
          includeImages: true,
          compressionLevel: 80,
        },
        teamSettings: {
          allowInvites: true,
          defaultRole: 'annotator',
          requireApproval: false,
        },
        integrations: {
          webhookUrl: 'https://api.example.com/webhooks/project-updates',
          slackChannel: '#medical-ai-team',
          emailNotifications: true,
        },
      });
      setLoading(false);
    };

    fetchSettings();
  }, [projectId]);

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSaving(false);
    
    // Show success message
    alert('Settings saved successfully!');
  };

  const handleDeleteProject = async () => {
    if (!settings) return;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to projects page
    window.location.href = '/projects';
  };

  const updateSettings = (section: keyof ProjectSettings, updates: any) => {
    setSettings((prevSettings) => {
      if (!prevSettings) return prevSettings;
      
      const currentSection = prevSettings[section];
      if (typeof currentSection === 'object' && currentSection !== null) {
        return {
          ...prevSettings,
          [section]: {
            ...(currentSection as Record<string, any>),
            ...updates,
          },
        };
      }
      
      return {
        ...prevSettings,
        [section]: updates,
      };
    });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'annotation', label: 'Annotation', icon: Eye },
    { id: 'quality', label: 'Quality', icon: CheckCircle },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="annotate-glass rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="annotate-glass rounded-2xl p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600">The project you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Settings</h1>
              <p className="text-gray-600 mt-2">{settings.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="annotate-glass rounded-xl p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="annotate-glass rounded-xl p-8">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">General Settings</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={settings.description}
                      onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Describe your project's purpose and goals..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibility
                    </label>
                    <select
                      value={settings.visibility}
                      onChange={(e) => setSettings({ ...settings, visibility: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="private">Private - Only you can access</option>
                      <option value="team">Team - Team members can access</option>
                      <option value="organization">Organization - All organization members</option>
                      <option value="public">Public - Anyone with the link</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Annotation Settings */}
              {activeTab === 'annotation' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Annotation Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Allow Overlapping Annotations</h3>
                        <p className="text-sm text-gray-500">Enable annotations to overlap with each other</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.annotationSettings.allowOverlapping}
                          onChange={(e) => updateSettings('annotationSettings', { allowOverlapping: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Require Review</h3>
                        <p className="text-sm text-gray-500">All annotations must be reviewed before approval</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.annotationSettings.requireReview}
                          onChange={(e) => updateSettings('annotationSettings', { requireReview: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Auto Save</h3>
                        <p className="text-sm text-gray-500">Automatically save annotations while working</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.annotationSettings.autoSave}
                          onChange={(e) => updateSettings('annotationSettings', { autoSave: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Show Confidence Scores</h3>
                        <p className="text-sm text-gray-500">Display AI confidence scores for annotations</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.annotationSettings.showConfidence}
                          onChange={(e) => updateSettings('annotationSettings', { showConfidence: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto Save Interval (seconds)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="300"
                      value={settings.annotationSettings.autoSaveInterval}
                      onChange={(e) => updateSettings('annotationSettings', { autoSaveInterval: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Label Color
                    </label>
                    <input
                      type="color"
                      value={settings.annotationSettings.defaultLabelColor}
                      onChange={(e) => updateSettings('annotationSettings', { defaultLabelColor: e.target.value })}
                      className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Quality Settings */}
              {activeTab === 'quality' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quality Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Annotations per Image
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={settings.qualitySettings.minAnnotationsPerImage}
                        onChange={(e) => updateSettings('qualitySettings', { minAnnotationsPerImage: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Annotations per Image
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={settings.qualitySettings.maxAnnotationsPerImage}
                        onChange={(e) => updateSettings('qualitySettings', { maxAnnotationsPerImage: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consensus Threshold
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="1"
                      step="0.1"
                      value={settings.qualitySettings.consensusThreshold}
                      onChange={(e) => updateSettings('qualitySettings', { consensusThreshold: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>50%</span>
                      <span>Current: {Math.round(settings.qualitySettings.consensusThreshold * 100)}%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Require Description</h3>
                      <p className="text-sm text-gray-500">Require annotators to provide descriptions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.qualitySettings.requireDescription}
                        onChange={(e) => updateSettings('qualitySettings', { requireDescription: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Enable Quality Scoring</h3>
                      <p className="text-sm text-gray-500">Automatically score annotation quality</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.qualitySettings.enableQualityScoring}
                        onChange={(e) => updateSettings('qualitySettings', { enableQualityScoring: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Export Settings */}
              {activeTab === 'export' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Export Settings</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Export Format
                    </label>
                    <select
                      value={settings.exportSettings.defaultFormat}
                      onChange={(e) => updateSettings('exportSettings', { defaultFormat: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="COCO">COCO JSON</option>
                      <option value="YOLO">YOLO</option>
                      <option value="Pascal VOC">Pascal VOC</option>
                      <option value="TensorFlow">TensorFlow Records</option>
                      <option value="PyTorch">PyTorch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Compression Level
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={settings.exportSettings.compressionLevel}
                      onChange={(e) => updateSettings('exportSettings', { compressionLevel: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>10% (High compression)</span>
                      <span>Current: {settings.exportSettings.compressionLevel}%</span>
                      <span>100% (No compression)</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Include Metadata</h3>
                        <p className="text-sm text-gray-500">Include annotation metadata in exports</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.exportSettings.includeMetadata}
                          onChange={(e) => updateSettings('exportSettings', { includeMetadata: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Include Images</h3>
                        <p className="text-sm text-gray-500">Include original images in export package</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.exportSettings.includeImages}
                          onChange={(e) => updateSettings('exportSettings', { includeImages: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Settings */}
              {activeTab === 'team' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Team Settings</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Role for New Members
                    </label>
                    <select
                      value={settings.teamSettings.defaultRole}
                      onChange={(e) => updateSettings('teamSettings', { defaultRole: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="viewer">Viewer - Can view annotations only</option>
                      <option value="annotator">Annotator - Can create and edit annotations</option>
                      <option value="reviewer">Reviewer - Can review and approve annotations</option>
                      <option value="admin">Admin - Full project access</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Allow Team Invites</h3>
                        <p className="text-sm text-gray-500">Team members can invite new members</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.teamSettings.allowInvites}
                          onChange={(e) => updateSettings('teamSettings', { allowInvites: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Require Approval</h3>
                        <p className="text-sm text-gray-500">New members need approval before joining</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.teamSettings.requireApproval}
                          onChange={(e) => updateSettings('teamSettings', { requireApproval: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invite Team Member
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        value={newTeamMember}
                        onChange={(e) => setNewTeamMember(e.target.value)}
                        placeholder="Enter email address"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          if (newTeamMember) {
                            alert(`Invitation sent to ${newTeamMember}`);
                            setNewTeamMember('');
                          }
                        }}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations */}
              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Integrations</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      value={settings.integrations.webhookUrl || ''}
                      onChange={(e) => updateSettings('integrations', { webhookUrl: e.target.value })}
                      placeholder="https://your-api.com/webhooks/annotateai"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Receive notifications about project updates and annotation progress
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slack Channel
                    </label>
                    <input
                      type="text"
                      value={settings.integrations.slackChannel || ''}
                      onChange={(e) => updateSettings('integrations', { slackChannel: e.target.value })}
                      placeholder="#your-channel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Send project notifications to your Slack channel
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive email updates about project activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.integrations.emailNotifications}
                        onChange={(e) => updateSettings('integrations', { emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              {activeTab === 'danger' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-red-600 mb-6">Danger Zone</h2>
                  
                  <div className="border border-red-300 rounded-lg p-6 bg-red-50">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Delete Project</h3>
                    <p className="text-red-700 mb-4">
                      Once you delete a project, there is no going back. Please be certain.
                    </p>
                    
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-red-800 font-medium">
                          Are you absolutely sure? This action cannot be undone.
                        </p>
                        <div className="flex space-x-4">
                          <button
                            onClick={handleDeleteProject}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                          >
                            Yes, Delete Project
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 