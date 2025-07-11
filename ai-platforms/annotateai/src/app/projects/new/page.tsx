'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: 'image' | 'video' | 'medical' | '3d';
  category: 'computer-vision' | 'medical' | 'automotive' | 'retail' | 'research';
  features: string[];
  estimatedTime: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  settings: {
    annotationTypes: string[];
    qualityControl: boolean;
    collaboration: boolean;
    aiAssistance: boolean;
  };
}

interface ProjectFormData {
  name: string;
  description: string;
  type: 'image' | 'video' | 'medical' | '3d';
  template: string;
  settings: {
    privacy: 'private' | 'team' | 'organization';
    qualityControl: boolean;
    reviewRequired: boolean;
    aiPreAnnotation: boolean;
    collaborationEnabled: boolean;
    deadlineEnabled: boolean;
    deadline?: string;
    tags: string[];
  };
  team: {
    members: string[];
    roles: Record<string, 'viewer' | 'annotator' | 'reviewer' | 'admin'>;
  };
}

const projectTemplates: ProjectTemplate[] = [
  {
    id: 'object-detection',
    name: 'Object Detection',
    description: 'Detect and classify objects in images with bounding boxes',
    type: 'image',
    category: 'computer-vision',
    features: ['Bounding boxes', 'Multi-class labeling', 'AI pre-annotation'],
    estimatedTime: '2-4 weeks',
    complexity: 'beginner',
    thumbnail: '🎯',
    settings: {
      annotationTypes: ['bbox'],
      qualityControl: true,
      collaboration: true,
      aiAssistance: true
    }
  },
  {
    id: 'image-segmentation',
    name: 'Image Segmentation',
    description: 'Pixel-level annotation for semantic and instance segmentation',
    type: 'image',
    category: 'computer-vision',
    features: ['Semantic masks', 'Instance segmentation', 'Polygon tools'],
    estimatedTime: '4-8 weeks',
    complexity: 'intermediate',
    thumbnail: '🖼️',
    settings: {
      annotationTypes: ['mask', 'polygon'],
      qualityControl: true,
      collaboration: true,
      aiAssistance: true
    }
  },
  {
    id: 'medical-imaging',
    name: 'Medical Imaging',
    description: 'Specialized tools for medical image annotation and analysis',
    type: 'medical',
    category: 'medical',
    features: ['DICOM support', 'Medical measurements', 'Compliance features'],
    estimatedTime: '6-12 weeks',
    complexity: 'advanced',
    thumbnail: '🏥',
    settings: {
      annotationTypes: ['mask', 'point', 'measurement'],
      qualityControl: true,
      collaboration: true,
      aiAssistance: false
    }
  },
  {
    id: 'video-tracking',
    name: 'Video Object Tracking',
    description: 'Track objects across video frames with temporal consistency',
    type: 'video',
    category: 'computer-vision',
    features: ['Frame-by-frame tracking', 'Interpolation', 'Video timeline'],
    estimatedTime: '6-10 weeks',
    complexity: 'advanced',
    thumbnail: '🎬',
    settings: {
      annotationTypes: ['bbox', 'tracking'],
      qualityControl: true,
      collaboration: true,
      aiAssistance: true
    }
  },
  {
    id: 'point-cloud',
    name: '3D Point Cloud',
    description: 'Annotate 3D point clouds from LiDAR and depth sensors',
    type: '3d',
    category: 'automotive',
    features: ['3D bounding boxes', 'Point labeling', '3D visualization'],
    estimatedTime: '8-12 weeks',
    complexity: 'advanced',
    thumbnail: '📍',
    settings: {
      annotationTypes: ['3d-bbox', 'point'],
      qualityControl: true,
      collaboration: true,
      aiAssistance: false
    }
  },
  {
    id: 'custom',
    name: 'Custom Project',
    description: 'Start from scratch with custom settings and workflows',
    type: 'image',
    category: 'research',
    features: ['Custom workflow', 'Flexible annotation types', 'Advanced settings'],
    estimatedTime: 'Variable',
    complexity: 'advanced',
    thumbnail: '⚙️',
    settings: {
      annotationTypes: [],
      qualityControl: false,
      collaboration: false,
      aiAssistance: false
    }
  }
];

export default function NewProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    type: 'image',
    template: '',
    settings: {
      privacy: 'private',
      qualityControl: false,
      reviewRequired: false,
      aiPreAnnotation: false,
      collaborationEnabled: false,
      deadlineEnabled: false,
      tags: []
    },
    team: {
      members: [],
      roles: {}
    }
  });
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const totalSteps = 4;

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      type: template.type,
      template: template.id,
      settings: {
        ...formData.settings,
        qualityControl: template.settings.qualityControl,
        collaborationEnabled: template.settings.collaboration,
        aiPreAnnotation: template.settings.aiAssistance
      }
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.settings.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        settings: {
          ...formData.settings,
          tags: [...formData.settings.tags, tagInput.trim()]
        }
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        tags: formData.settings.tags.filter(t => t !== tag)
      }
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          template: formData.template,
          settings: formData.settings
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const project = await response.json();
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Choose Template';
      case 2: return 'Project Details';
      case 3: return 'Configuration';
      case 4: return 'Review & Create';
      default: return 'Project Setup';
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: return selectedTemplate !== null;
      case 2: return formData.name.length > 0 && formData.description.length > 0;
      case 3: return true; // Settings are optional
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Project</h1>
          <p className="text-white/70">Set up your annotation project with our guided wizard</p>
        </div>

        {/* Progress Indicator */}
        <div className="annotate-glass rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">{getStepTitle(currentStep)}</h2>
            <span className="text-white/70 text-sm">Step {currentStep} of {totalSteps}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => {
              const step = i + 1;
              const isActive = step === currentStep;
              const isCompleted = step < currentStep || isStepComplete(step);
              
              return (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive 
                      ? 'bg-indigo-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 text-white' 
                        : 'bg-white/20 text-white/60'
                  }`}>
                    {isCompleted && step < currentStep ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  {step < totalSteps && (
                    <div className={`flex-1 h-1 rounded ${
                      step < currentStep ? 'bg-green-600' : 'bg-white/20'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="annotate-glass rounded-xl p-8 mb-8">
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Choose a Project Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`annotate-tool-glass rounded-lg p-6 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedTemplate?.id === template.id 
                        ? 'ring-2 ring-indigo-500 bg-indigo-500/10' 
                        : ''
                    }`}
                  >
                    <div className="text-4xl mb-4">{template.thumbnail}</div>
                    <h4 className="text-white font-semibold mb-2">{template.name}</h4>
                    <p className="text-white/70 text-sm mb-4">{template.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/60">Type:</span>
                        <span className="text-white capitalize">{template.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/60">Time:</span>
                        <span className="text-white">{template.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/60">Level:</span>
                        <span className={`capitalize ${
                          template.complexity === 'beginner' ? 'text-green-400' :
                          template.complexity === 'intermediate' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {template.complexity}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {template.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-white/70">
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

          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Project Details</h3>
              
              {selectedTemplate && (
                <div className="annotate-ai-glass rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedTemplate.thumbnail}</span>
                    <div>
                      <h4 className="text-white font-medium">{selectedTemplate.name}</h4>
                      <p className="text-white/70 text-sm">{selectedTemplate.description}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Project Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter project name..."
                    className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project goals and requirements..."
                    rows={4}
                    className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Project Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['image', 'video', 'medical', '3d'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, type: type as any })}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          formData.type === type
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Tags</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add tags..."
                      className="flex-1 bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.settings.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-white/60 hover:text-white/80"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Project Configuration</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">Privacy Settings</label>
                  <div className="space-y-3">
                    {[
                      { value: 'private', label: 'Private', description: 'Only you can access this project' },
                      { value: 'team', label: 'Team', description: 'Members you invite can access' },
                      { value: 'organization', label: 'Organization', description: 'All organization members can access' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          value={option.value}
                          checked={formData.settings.privacy === option.value}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings, privacy: e.target.value as any }
                          })}
                          className="mt-1"
                        />
                        <div>
                          <div className="text-white font-medium">{option.label}</div>
                          <div className="text-white/70 text-sm">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">Quality Control</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.qualityControl}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, qualityControl: e.target.checked }
                        })}
                      />
                      <div>
                        <div className="text-white font-medium">Enable Quality Control</div>
                        <div className="text-white/70 text-sm">Track annotation quality and consistency metrics</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.reviewRequired}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, reviewRequired: e.target.checked }
                        })}
                      />
                      <div>
                        <div className="text-white font-medium">Require Review</div>
                        <div className="text-white/70 text-sm">All annotations must be reviewed before completion</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">AI Features</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.aiPreAnnotation}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, aiPreAnnotation: e.target.checked }
                        })}
                      />
                      <div>
                        <div className="text-white font-medium">AI Pre-annotation</div>
                        <div className="text-white/70 text-sm">Use AI models to generate initial annotations</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">Collaboration</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.collaborationEnabled}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, collaborationEnabled: e.target.checked }
                        })}
                      />
                      <div>
                        <div className="text-white font-medium">Enable Team Collaboration</div>
                        <div className="text-white/70 text-sm">Allow multiple users to work on this project</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.deadlineEnabled}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, deadlineEnabled: e.target.checked }
                      })}
                    />
                    <div>
                      <div className="text-white font-medium">Set Project Deadline</div>
                      <div className="text-white/70 text-sm">Add a completion deadline for tracking progress</div>
                    </div>
                  </label>
                  
                  {formData.settings.deadlineEnabled && (
                    <div className="mt-3 ml-6">
                      <input
                        type="date"
                        value={formData.settings.deadline || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, deadline: e.target.value }
                        })}
                        min={new Date().toISOString().split('T')[0]}
                        className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Review & Create Project</h3>
              
              <div className="space-y-6">
                <div className="annotate-ai-glass rounded-lg p-6">
                  <h4 className="text-white font-semibold mb-4">Project Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Name:</span>
                      <span className="text-white ml-2">{formData.name}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Type:</span>
                      <span className="text-white ml-2 capitalize">{formData.type}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Template:</span>
                      <span className="text-white ml-2">{selectedTemplate?.name}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Privacy:</span>
                      <span className="text-white ml-2 capitalize">{formData.settings.privacy}</span>
                    </div>
                  </div>
                  
                  {formData.description && (
                    <div className="mt-4">
                      <span className="text-white/60 text-sm">Description:</span>
                      <p className="text-white/80 text-sm mt-1">{formData.description}</p>
                    </div>
                  )}

                  {formData.settings.tags.length > 0 && (
                    <div className="mt-4">
                      <span className="text-white/60 text-sm">Tags:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.settings.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="annotate-ai-glass rounded-lg p-6">
                  <h4 className="text-white font-semibold mb-4">Enabled Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {formData.settings.qualityControl && (
                      <div className="flex items-center gap-2 text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Quality Control
                      </div>
                    )}
                    {formData.settings.reviewRequired && (
                      <div className="flex items-center gap-2 text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Required Review
                      </div>
                    )}
                    {formData.settings.aiPreAnnotation && (
                      <div className="flex items-center gap-2 text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        AI Pre-annotation
                      </div>
                    )}
                    {formData.settings.collaborationEnabled && (
                      <div className="flex items-center gap-2 text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Team Collaboration
                      </div>
                    )}
                    {formData.settings.deadlineEnabled && (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Deadline: {formData.settings.deadline}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/projects')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Back
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!isStepComplete(currentStep)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.name || !formData.description}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 