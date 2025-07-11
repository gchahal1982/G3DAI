'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isOptional?: boolean;
  completionCriteria?: string[];
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  icon: string;
  steps: string[];
  features: string[];
}

interface OnboardingData {
  role: string;
  organization: {
    name: string;
    type: 'startup' | 'enterprise' | 'research' | 'healthcare' | 'automotive';
    size: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  };
  useCase: string;
  experience: 'beginner' | 'intermediate' | 'expert';
  goals: string[];
  preferences: {
    notifications: boolean;
    tutorials: boolean;
    sampleData: boolean;
    teamInvites: boolean;
  };
  project: {
    create: boolean;
    type?: 'image' | 'video' | 'medical' | '3d';
    template?: string;
  };
}

const userRoles: UserRole[] = [
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    description: 'I build and train machine learning models',
    icon: '🔬',
    steps: ['role', 'organization', 'experience', 'goals', 'project', 'complete'],
    features: ['Advanced AI models', 'Custom workflows', 'Export formats', 'API access']
  },
  {
    id: 'annotator',
    name: 'Annotator',
    description: 'I label and annotate data for projects',
    icon: '✏️',
    steps: ['role', 'organization', 'experience', 'tools', 'complete'],
    features: ['Annotation tools', 'Quality tracking', 'Collaboration', 'Productivity metrics']
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'I manage annotation projects and teams',
    icon: '📊',
    steps: ['role', 'organization', 'team', 'goals', 'complete'],
    features: ['Team management', 'Progress tracking', 'Quality control', 'Reporting']
  },
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'I conduct research with computer vision data',
    icon: '🎓',
    steps: ['role', 'organization', 'research', 'preferences', 'complete'],
    features: ['Research tools', 'Data analysis', 'Publication export', 'Collaboration']
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'I manage the platform and organization settings',
    icon: '⚙️',
    steps: ['role', 'organization', 'setup', 'team', 'complete'],
    features: ['User management', 'Security settings', 'Billing', 'Analytics']
  }
];

const organizationTypes = [
  { id: 'startup', name: 'Startup', icon: '🚀' },
  { id: 'enterprise', name: 'Enterprise', icon: '🏢' },
  { id: 'research', name: 'Research Institution', icon: '🎓' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'automotive', name: 'Automotive', icon: '🚗' }
];

const useCases = [
  'Autonomous Vehicles',
  'Medical Imaging',
  'Retail & E-commerce',
  'Manufacturing Quality Control',
  'Security & Surveillance',
  'Agricultural Monitoring',
  'Content Moderation',
  'Scientific Research',
  'Sports Analytics',
  'Other'
];

const goals = [
  'Train computer vision models',
  'Improve data quality',
  'Scale annotation processes',
  'Collaborate with team',
  'Reduce annotation costs',
  'Implement quality control',
  'Export to ML frameworks',
  'Research & development'
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    role: '',
    organization: {
      name: '',
      type: 'startup',
      size: '1-10'
    },
    useCase: '',
    experience: 'beginner',
    goals: [],
    preferences: {
      notifications: true,
      tutorials: true,
      sampleData: true,
      teamInvites: false
    },
    project: {
      create: false
    }
  });
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data.role) {
      const role = userRoles.find(r => r.id === data.role);
      setSelectedRole(role || null);
    }
  }, [data.role]);

  const getCurrentSteps = () => {
    return selectedRole?.steps || ['role', 'organization', 'complete'];
  };

  const getStepTitle = (stepId: string) => {
    switch (stepId) {
      case 'role': return 'Choose Your Role';
      case 'organization': return 'Organization Info';
      case 'experience': return 'Experience Level';
      case 'tools': return 'Annotation Tools';
      case 'team': return 'Team Setup';
      case 'goals': return 'Your Goals';
      case 'research': return 'Research Focus';
      case 'setup': return 'Platform Setup';
      case 'preferences': return 'Preferences';
      case 'project': return 'First Project';
      case 'complete': return 'Welcome!';
      default: return 'Setup';
    }
  };

  const handleNext = () => {
    const steps = getCurrentSteps();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/');
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setData({
      ...data,
      goals: data.goals.includes(goal)
        ? data.goals.filter(g => g !== goal)
        : [...data.goals, goal]
    });
  };

  const steps = getCurrentSteps();
  const currentStepId = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const isStepComplete = () => {
    switch (currentStepId) {
      case 'role': return data.role.length > 0;
      case 'organization': return data.organization.name.length > 0;
      case 'experience': return data.experience.length > 0;
      case 'goals': return data.goals.length > 0;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome to AnnotateAI</h1>
          </div>
          <p className="text-white/70 text-lg">Let's set up your account and get you started</p>
        </div>

        {/* Progress Bar */}
        <div className="annotate-glass rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">{getStepTitle(currentStepId)}</h2>
            <span className="text-white/70 text-sm">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-white/60">
            <span>Getting Started</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="annotate-glass rounded-xl p-8 mb-8">
          {/* Role Selection */}
          {currentStepId === 'role' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">What's your primary role?</h3>
              <p className="text-white/70 mb-8">This helps us customize your experience and show relevant features.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userRoles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setData({ ...data, role: role.id })}
                    className={`annotate-tool-glass rounded-lg p-6 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      data.role === role.id ? 'ring-2 ring-indigo-500 bg-indigo-500/10' : ''
                    }`}
                  >
                    <div className="text-4xl mb-4">{role.icon}</div>
                    <h4 className="text-white font-semibold mb-2">{role.name}</h4>
                    <p className="text-white/70 text-sm mb-4">{role.description}</p>
                    
                    <div className="space-y-1">
                      {role.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-white/60">
                          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organization Info */}
          {currentStepId === 'organization' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Tell us about your organization</h3>
              <p className="text-white/70 mb-8">This helps us understand your needs and compliance requirements.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={data.organization.name}
                    onChange={(e) => setData({
                      ...data,
                      organization: { ...data.organization, name: e.target.value }
                    })}
                    placeholder="Enter your organization name"
                    className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-4">
                    Organization Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {organizationTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setData({
                          ...data,
                          organization: { ...data.organization, type: type.id as any }
                        })}
                        className={`p-4 rounded-lg border text-center transition-colors ${
                          data.organization.type === type.id
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="text-sm font-medium">{type.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Team Size
                  </label>
                  <select
                    value={data.organization.size}
                    onChange={(e) => setData({
                      ...data,
                      organization: { ...data.organization, size: e.target.value as any }
                    })}
                    className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="1-10">1-10 people</option>
                    <option value="11-50">11-50 people</option>
                    <option value="51-200">51-200 people</option>
                    <option value="201-1000">201-1000 people</option>
                    <option value="1000+">1000+ people</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-4">
                    Primary Use Case
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {useCases.map((useCase) => (
                      <button
                        key={useCase}
                        onClick={() => setData({ ...data, useCase })}
                        className={`p-3 rounded-lg border text-sm transition-colors ${
                          data.useCase === useCase
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                        }`}
                      >
                        {useCase}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Experience Level */}
          {currentStepId === 'experience' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">What's your experience level?</h3>
              <p className="text-white/70 mb-8">This helps us provide appropriate tutorials and features.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: 'beginner',
                    title: 'Beginner',
                    description: 'New to computer vision and annotation',
                    icon: '🌱',
                    features: ['Step-by-step tutorials', 'Guided workflows', 'Best practices']
                  },
                  {
                    id: 'intermediate',
                    title: 'Intermediate',
                    description: 'Some experience with data labeling',
                    icon: '📈',
                    features: ['Advanced tools', 'Quality controls', 'Team collaboration']
                  },
                  {
                    id: 'expert',
                    title: 'Expert',
                    description: 'Experienced with ML and annotation platforms',
                    icon: '🚀',
                    features: ['Custom workflows', 'API access', 'Advanced analytics']
                  }
                ].map((level) => (
                  <div
                    key={level.id}
                    onClick={() => setData({ ...data, experience: level.id as any })}
                    className={`annotate-tool-glass rounded-lg p-6 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      data.experience === level.id ? 'ring-2 ring-indigo-500 bg-indigo-500/10' : ''
                    }`}
                  >
                    <div className="text-4xl mb-4">{level.icon}</div>
                    <h4 className="text-white font-semibold mb-2">{level.title}</h4>
                    <p className="text-white/70 text-sm mb-4">{level.description}</p>
                    
                    <div className="space-y-1">
                      {level.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-white/60">
                          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goals */}
          {currentStepId === 'goals' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">What are your main goals?</h3>
              <p className="text-white/70 mb-8">Select all that apply. We'll help you achieve these goals.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((goal) => (
                  <label
                    key={goal}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      data.goals.includes(goal)
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={data.goals.includes(goal)}
                      onChange={() => toggleGoal(goal)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      data.goals.includes(goal) ? 'border-indigo-500 bg-indigo-500' : 'border-white/40'
                    }`}>
                      {data.goals.includes(goal) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{goal}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          {currentStepId === 'preferences' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Set your preferences</h3>
              <p className="text-white/70 mb-8">You can change these later in your settings.</p>
              
              <div className="space-y-6">
                {[
                  {
                    key: 'notifications',
                    title: 'Email Notifications',
                    description: 'Get updates about your projects and team activity'
                  },
                  {
                    key: 'tutorials',
                    title: 'Show Tutorials',
                    description: 'Display helpful tips and guides as you use the platform'
                  },
                  {
                    key: 'sampleData',
                    title: 'Load Sample Data',
                    description: 'Include sample projects and datasets to explore features'
                  },
                  {
                    key: 'teamInvites',
                    title: 'Auto-accept Team Invites',
                    description: 'Automatically accept invitations from your organization'
                  }
                ].map((pref) => (
                  <label key={pref.key} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.preferences[pref.key as keyof typeof data.preferences]}
                      onChange={(e) => setData({
                        ...data,
                        preferences: {
                          ...data.preferences,
                          [pref.key]: e.target.checked
                        }
                      })}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-white font-medium">{pref.title}</div>
                      <div className="text-white/70 text-sm">{pref.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Project Creation */}
          {currentStepId === 'project' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Create your first project?</h3>
              <p className="text-white/70 mb-8">We can help you set up your first annotation project right now.</p>
              
              <div className="space-y-6">
                <label className="flex items-center gap-4 p-6 bg-white/5 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.project.create}
                    onChange={(e) => setData({
                      ...data,
                      project: { ...data.project, create: e.target.checked }
                    })}
                  />
                  <div>
                    <div className="text-white font-semibold text-lg">Yes, create a project</div>
                    <div className="text-white/70">We'll guide you through setting up your first annotation project</div>
                  </div>
                </label>

                {data.project.create && (
                  <div className="ml-10 space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Project Type</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['image', 'video', 'medical', '3d'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setData({
                              ...data,
                              project: { ...data.project, type: type as any }
                            })}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                              data.project.type === type
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                            }`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completion */}
          {currentStepId === 'complete' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-4">You're all set!</h3>
              <p className="text-white/70 text-lg mb-8">
                Welcome to AnnotateAI. Let's start building amazing computer vision models together.
              </p>

              {selectedRole && (
                <div className="annotate-ai-glass rounded-lg p-6 mb-8">
                  <h4 className="text-white font-semibold mb-4">Your customized experience as a {selectedRole.name}:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    {selectedRole.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-white/80">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-semibold text-lg transition-all duration-200"
                >
                  {loading ? 'Setting up your account...' : 'Enter AnnotateAI'}
                </button>
                
                <p className="text-white/60 text-sm">
                  This will save your preferences and take you to your dashboard
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Exit Setup
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Back
              </button>
            )}

            {currentStep < steps.length - 1 && (
              <button
                onClick={handleNext}
                disabled={!isStepComplete()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 