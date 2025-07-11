'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { User } from '@/types/auth';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  organizationName: string;
  organizationSize: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    organizationName: user?.organization?.name || '',
    organizationSize: user?.organization?.teamSize?.toString() || ''
  });
  
  const [securityData, setSecurityData] = useState<SecuritySettings>({
    twoFactorEnabled: user?.twoFactorEnabled || false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'plan'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        avatar: user.avatar || '',
        organizationName: user.organization?.name || '',
        organizationSize: user.organization?.teamSize?.toString() || ''
      });
    }
  }, [user]);

  // Avatar upload handler
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const { avatarUrl } = await response.json();
      setProfileData(prev => ({ ...prev, avatar: avatarUrl }));
      
      // Save immediately
      handleSave();
    } catch (error) {
      console.error('Avatar upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save profile changes
  const handleSave = async () => {
    if (!user) return;

    try {
      setSaveStatus('saving');
      
      const updates: Partial<User> = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        avatar: profileData.avatar,
        organization: {
          ...user.organization,
          name: profileData.organizationName,
          teamSize: parseInt(profileData.organizationSize) || 0
        }
      };

      await updateUser(updates);
      setSaveStatus('saved');
      setIsEditing(false);
      
      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
    }
  };

  // Handle input changes
  const handleProfileChange = (field: keyof ProfileFormData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (saveStatus === 'saved') setSaveStatus('idle');
  };

  // Handle security settings
  const handleSecurityChange = (field: keyof SecuritySettings, value: string | boolean) => {
    setSecurityData(prev => ({ ...prev, [field]: value }));
  };

  // Password change handler
  const handlePasswordChange = async () => {
    if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword
        })
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      setSecurityData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setShowPasswordForm(false);
      alert('Password changed successfully');
    } catch (error) {
      console.error('Password change error:', error);
      alert('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  // Get plan display info
  const getPlanDisplayInfo = () => {
    const plan = user?.subscription?.plan;
    const planColors = {
      free: 'from-gray-500 to-gray-600',
      pro: 'from-blue-500 to-purple-600',
      enterprise: 'from-purple-600 to-pink-600'
    };

    return { plan, color: planColors[plan] || planColors.free };
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="annotate-glass p-8 rounded-2xl border border-annotate-primary-200">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-annotate-primary-200 border-t-annotate-primary-500 mx-auto" />
          <p className="mt-4 text-annotate-primary-600 text-sm text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-300">Manage your account settings and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 annotate-glass rounded-lg p-1">
            {['profile', 'security', 'plan'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-annotate-primary-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-annotate-primary-500/20'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          {activeTab === 'profile' && (
            <>
              {/* Profile Picture */}
              <div className="lg:col-span-1">
                <div className="annotate-glass rounded-2xl p-6 border border-annotate-primary-200">
                  <h2 className="text-xl font-semibold text-white mb-4">Profile Picture</h2>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-annotate-primary-500 to-annotate-accent-purple flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                        {profileData.avatar ? (
                          <img 
                            src={profileData.avatar} 
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`
                        )}
                      </div>
                      
                      <label className="absolute bottom-0 right-0 w-10 h-10 bg-annotate-primary-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-annotate-primary-600 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </label>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white">
                        {profileData.firstName} {profileData.lastName}
                      </h3>
                      <p className="text-gray-300">{profileData.email}</p>
                    </div>
                  </div>
                </div>

                {/* Organization Info */}
                {user.subscription.plan === 'enterprise' && (
                  <div className="annotate-glass rounded-2xl p-6 border border-annotate-primary-200 mt-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Organization</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Organization Name
                        </label>
                        <p className="text-white">{user.organization?.name || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Organization Size
                        </label>
                        <p className="text-white">{user.organization?.teamSize || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Form */}
              <div className="lg:col-span-2">
                <div className="annotate-glass rounded-2xl p-6 border border-annotate-primary-200">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                    
                    <div className="flex space-x-3">
                      {saveStatus === 'saved' && (
                        <span className="text-green-400 text-sm">Saved!</span>
                      )}
                      {saveStatus === 'saving' && (
                        <span className="text-yellow-400 text-sm">Saving...</span>
                      )}
                      {saveStatus === 'error' && (
                        <span className="text-red-400 text-sm">Error saving</span>
                      )}
                      
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-annotate-primary-400 hover:text-annotate-primary-300 text-sm font-medium"
                      >
                        {isEditing ? 'Cancel' : 'Edit'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleProfileChange('firstName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 glass-input rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-annotate-primary-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleProfileChange('lastName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 glass-input rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-annotate-primary-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 glass-input rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-annotate-primary-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>

                    {isEditing && (
                      <div className="md:col-span-2">
                        <button
                          onClick={handleSave}
                          disabled={isLoading}
                          className="btn-annotate px-6 py-2 bg-annotate-primary-500 text-white rounded-lg hover:bg-annotate-primary-600 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Security Section */}
          {activeTab === 'security' && (
            <div className="lg:col-span-3">
              <div className="annotate-glass rounded-2xl p-6 border border-annotate-primary-200">
                <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>

                <div className="space-y-6">
                  {/* Password Change */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
                    
                    {!showPasswordForm ? (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="btn-annotate px-4 py-2 bg-annotate-primary-500 text-white rounded-lg hover:bg-annotate-primary-600 transition-colors"
                      >
                        Change Password
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={securityData.currentPassword}
                            onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                            className="w-full px-4 py-2 glass-input rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-annotate-primary-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={securityData.newPassword}
                            onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                            className="w-full px-4 py-2 glass-input rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-annotate-primary-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={securityData.confirmPassword}
                            onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                            className="w-full px-4 py-2 glass-input rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-annotate-primary-500 focus:border-transparent"
                          />
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={handlePasswordChange}
                            disabled={isLoading}
                            className="btn-annotate px-4 py-2 bg-annotate-primary-500 text-white rounded-lg hover:bg-annotate-primary-600 transition-colors disabled:opacity-50"
                          >
                            {isLoading ? 'Updating...' : 'Update Password'}
                          </button>
                          <button
                            onClick={() => setShowPasswordForm(false)}
                            className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Two-Factor Authentication */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Two-Factor Authentication</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300">Add an extra layer of security to your account</p>
                        <p className="text-sm text-gray-400">
                          Status: {securityData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleSecurityChange('twoFactorEnabled', !securityData.twoFactorEnabled)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          securityData.twoFactorEnabled
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {securityData.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Plan Section */}
          {activeTab === 'plan' && (
            <div className="lg:col-span-3">
              <div className="annotate-glass rounded-2xl p-6 border border-annotate-primary-200">
                <h2 className="text-xl font-semibold text-white mb-6">Subscription Plan</h2>

                <div className="space-y-6">
                  {/* Current Plan */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Current Plan</h3>
                    
                    <div className={`p-4 rounded-lg bg-gradient-to-r ${getPlanDisplayInfo().color} text-white`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg capitalize">{user.subscription.plan}</h3>
                          <p className="opacity-90">
                            {user.subscription.plan === 'pro' && (
                              <>
                                Perfect for professional teams
                                <br />
                                <span className="text-sm">$29/month • Advanced features included</span>
                              </>
                            )}
                            {user.subscription.plan === 'free' && 'Perfect for getting started'}
                            {user.subscription.plan === 'pro' && 'For professional teams'}
                            {user.subscription.plan === 'enterprise' && 'For large organizations'}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {user.subscription.plan === 'free' && 'Free'}
                            {user.subscription.plan === 'pro' && '$29'}
                            {user.subscription.plan === 'enterprise' && 'Custom'}
                          </div>
                          {user.subscription.plan !== 'free' && (
                            <div className="text-sm opacity-90">per month</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Plan Features</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Feature list based on plan */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-gray-300">Basic annotation tools</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-gray-300">Export to COCO/YOLO</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-gray-300">Community support</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {user.subscription.plan === 'pro' && (
                          <>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-300">Advanced annotation tools</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-300">Team collaboration</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-300">Priority support</span>
                            </div>
                          </>
                        )}
                        
                        {user.subscription.plan === 'enterprise' && (
                          <>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-300">Custom integrations</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-300">Dedicated support</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-300">SSO integration</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upgrade Option */}
                  {user.subscription.plan !== 'enterprise' && (
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Upgrade Plan</h3>
                      <p className="text-gray-300 mb-4">
                        Get access to more features and better support by upgrading your plan.
                      </p>
                      
                      <button className="btn-annotate px-6 py-3 bg-annotate-primary-500 text-white rounded-lg hover:bg-annotate-primary-600 transition-colors">
                        Upgrade Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 