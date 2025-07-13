'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  EyeIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  assignedTo?: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  startTime?: Date;
  endTime?: Date;
  dependencies: string[];
  requirements: string[];
  compliance: {
    required: boolean;
    status: 'compliant' | 'non_compliant' | 'pending';
    notes?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'imaging' | 'analysis' | 'review' | 'documentation' | 'approval' | 'delivery';
}

interface MedicalWorkflow {
  id: string;
  name: string;
  type: 'diagnostic' | 'treatment' | 'research' | 'quality_assurance';
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    mrn: string;
  };
  study: {
    id: string;
    type: string;
    modality: string;
    date: Date;
    urgency: 'routine' | 'urgent' | 'stat';
  };
  steps: WorkflowStep[];
  currentStep: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'on_hold';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  estimatedCompletion: Date;
  actualCompletion?: Date;
  assignedUsers: string[];
  compliance: {
    hipaaCompliant: boolean;
    qualityAssured: boolean;
    peerReviewed: boolean;
    documentationComplete: boolean;
  };
  metrics: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    averageStepTime: number;
    totalTime: number;
    efficiency: number;
  };
}

interface WorkflowTrackingProps {
  workflowId?: string;
  onWorkflowUpdate?: (workflow: MedicalWorkflow) => void;
  onStepComplete?: (stepId: string, workflow: MedicalWorkflow) => void;
  className?: string;
}

export default function WorkflowTracking({ 
  workflowId, 
  onWorkflowUpdate, 
  onStepComplete,
  className = ''
}: WorkflowTrackingProps) {
  const [workflow, setWorkflow] = useState<MedicalWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'duration' | 'status'>('priority');
  const [showCompliance, setShowCompliance] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock workflow data
  const mockWorkflow: MedicalWorkflow = {
    id: 'wf-001',
    name: 'CT Chest Diagnostic Workflow',
    type: 'diagnostic',
    patient: {
      id: 'pat-001',
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      mrn: 'MRN-12345'
    },
    study: {
      id: 'study-001',
      type: 'CT Chest',
      modality: 'CT',
      date: new Date(),
      urgency: 'routine'
    },
    steps: [
      {
        id: 'step-001',
        name: 'Image Acquisition',
        description: 'Acquire CT chest images with contrast',
        status: 'completed',
        assignedTo: 'tech-001',
        estimatedDuration: 30,
        actualDuration: 25,
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 2100000),
        dependencies: [],
        requirements: ['Patient consent', 'Contrast clearance'],
        compliance: {
          required: true,
          status: 'compliant',
          notes: 'All requirements met'
        },
        priority: 'high',
        category: 'imaging'
      },
      {
        id: 'step-002',
        name: 'AI Analysis',
        description: 'Automated analysis for pathology detection',
        status: 'completed',
        assignedTo: 'ai-system',
        estimatedDuration: 5,
        actualDuration: 3,
        startTime: new Date(Date.now() - 2100000),
        endTime: new Date(Date.now() - 1920000),
        dependencies: ['step-001'],
        requirements: ['Image quality check'],
        compliance: {
          required: true,
          status: 'compliant'
        },
        priority: 'medium',
        category: 'analysis'
      },
      {
        id: 'step-003',
        name: 'Radiologist Review',
        description: 'Primary interpretation by radiologist',
        status: 'in_progress',
        assignedTo: 'rad-001',
        estimatedDuration: 15,
        startTime: new Date(Date.now() - 1800000),
        dependencies: ['step-002'],
        requirements: ['Board certification', 'Continuing education'],
        compliance: {
          required: true,
          status: 'pending'
        },
        priority: 'critical',
        category: 'review'
      },
      {
        id: 'step-004',
        name: 'Report Generation',
        description: 'Generate structured diagnostic report',
        status: 'pending',
        estimatedDuration: 10,
        dependencies: ['step-003'],
        requirements: ['Template compliance', 'Spell check'],
        compliance: {
          required: true,
          status: 'pending'
        },
        priority: 'high',
        category: 'documentation'
      },
      {
        id: 'step-005',
        name: 'Peer Review',
        description: 'Secondary review for quality assurance',
        status: 'pending',
        estimatedDuration: 10,
        dependencies: ['step-004'],
        requirements: ['Senior radiologist', 'Quality metrics'],
        compliance: {
          required: true,
          status: 'pending'
        },
        priority: 'medium',
        category: 'review'
      },
      {
        id: 'step-006',
        name: 'Report Delivery',
        description: 'Deliver report to referring physician',
        status: 'pending',
        estimatedDuration: 5,
        dependencies: ['step-005'],
        requirements: ['Secure delivery', 'Delivery confirmation'],
        compliance: {
          required: true,
          status: 'pending'
        },
        priority: 'high',
        category: 'delivery'
      }
    ],
    currentStep: 2,
    status: 'in_progress',
    progress: 33,
    startTime: new Date(Date.now() - 3600000),
    estimatedCompletion: new Date(Date.now() + 2700000),
    assignedUsers: ['tech-001', 'ai-system', 'rad-001'],
    compliance: {
      hipaaCompliant: true,
      qualityAssured: false,
      peerReviewed: false,
      documentationComplete: false
    },
    metrics: {
      totalSteps: 6,
      completedSteps: 2,
      failedSteps: 0,
      averageStepTime: 14,
      totalTime: 28,
      efficiency: 85
    }
  };

  useEffect(() => {
    if (workflowId) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setWorkflow(mockWorkflow);
        setIsLoading(false);
      }, 1000);
    }
  }, [workflowId]);

  useEffect(() => {
    if (autoRefresh && workflow) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        setWorkflow(prev => {
          if (!prev) return null;
          
          const updated = { ...prev };
          const inProgressStep = updated.steps.find(s => s.status === 'in_progress');
          
          if (inProgressStep) {
            const elapsed = Date.now() - (inProgressStep.startTime?.getTime() || 0);
            const progress = Math.min(elapsed / (inProgressStep.estimatedDuration * 60000), 1);
            
            if (progress >= 1) {
              inProgressStep.status = 'completed';
              inProgressStep.endTime = new Date();
              inProgressStep.actualDuration = Math.round(elapsed / 60000);
              
              // Start next step
              const nextStep = updated.steps.find(s => 
                s.status === 'pending' && 
                s.dependencies.every(dep => updated.steps.find(step => step.id === dep)?.status === 'completed')
              );
              
              if (nextStep) {
                nextStep.status = 'in_progress';
                nextStep.startTime = new Date();
                updated.currentStep = updated.steps.indexOf(nextStep);
              }
            }
          }
          
          // Update metrics
          updated.metrics.completedSteps = updated.steps.filter(s => s.status === 'completed').length;
          updated.progress = Math.round((updated.metrics.completedSteps / updated.metrics.totalSteps) * 100);
          
          return updated;
        });
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, workflow]);

  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return 'text-medsight-normal';
      case 'in_progress': return 'text-medsight-primary';
      case 'pending': return 'text-medsight-pending';
      case 'failed': return 'text-medsight-abnormal';
      case 'skipped': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-5 h-5 text-medsight-normal" />;
      case 'in_progress': return <PlayIcon className="w-5 h-5 text-medsight-primary" />;
      case 'pending': return <ClockIcon className="w-5 h-5 text-medsight-pending" />;
      case 'failed': return <XCircleIcon className="w-5 h-5 text-medsight-abnormal" />;
      case 'skipped': return <ArrowPathIcon className="w-5 h-5 text-gray-500" />;
      default: return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: WorkflowStep['priority']) => {
    switch (priority) {
      case 'critical': return 'text-medsight-critical bg-medsight-critical/10';
      case 'high': return 'text-medsight-abnormal bg-medsight-abnormal/10';
      case 'medium': return 'text-medsight-pending bg-medsight-pending/10';
      case 'low': return 'text-medsight-normal bg-medsight-normal/10';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getComplianceColor = (status: 'compliant' | 'non_compliant' | 'pending') => {
    switch (status) {
      case 'compliant': return 'text-medsight-normal';
      case 'non_compliant': return 'text-medsight-abnormal';
      case 'pending': return 'text-medsight-pending';
      default: return 'text-gray-400';
    }
  };

  const filteredSteps = workflow?.steps.filter(step => {
    if (filter === 'all') return true;
    return step.status === filter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'duration':
        return (b.estimatedDuration || 0) - (a.estimatedDuration || 0);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const handleStepAction = (stepId: string, action: 'start' | 'pause' | 'complete' | 'skip') => {
    if (!workflow) return;
    
    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) return;
    
    const updatedWorkflow = { ...workflow };
    const updatedStep = updatedWorkflow.steps.find(s => s.id === stepId)!;
    
    switch (action) {
      case 'start':
        updatedStep.status = 'in_progress';
        updatedStep.startTime = new Date();
        break;
      case 'pause':
        updatedStep.status = 'pending';
        break;
      case 'complete':
        updatedStep.status = 'completed';
        updatedStep.endTime = new Date();
        if (updatedStep.startTime) {
          updatedStep.actualDuration = Math.round((Date.now() - updatedStep.startTime.getTime()) / 60000);
        }
        break;
      case 'skip':
        updatedStep.status = 'skipped';
        break;
    }
    
    setWorkflow(updatedWorkflow);
    onWorkflowUpdate?.(updatedWorkflow);
    if (action === 'complete') {
      onStepComplete?.(stepId, updatedWorkflow);
    }
  };

  if (isLoading) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-medsight-primary/20 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-medsight-primary/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="text-center text-gray-500">
          <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No workflow selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`medsight-glass p-6 rounded-xl ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-medsight-primary mb-2">
              {workflow.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <UserIcon className="w-4 h-4" />
                {workflow.patient.name} ({workflow.patient.mrn})
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {workflow.study.date.toLocaleDateString()}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                workflow.study.urgency === 'stat' ? 'bg-red-100 text-red-800' :
                workflow.study.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                'bg-green-100 text-green-800'
              }`}>
                {workflow.study.urgency.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`btn-medsight ${autoRefresh ? 'bg-medsight-primary/20' : ''}`}
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCompliance(!showCompliance)}
              className={`btn-medsight ${showCompliance ? 'bg-medsight-primary/20' : ''}`}
            >
              <DocumentTextIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-medsight-primary">{workflow.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-medsight-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${workflow.progress}%` }}
            />
          </div>
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-primary">{workflow.metrics.completedSteps}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-pending">{workflow.metrics.totalSteps - workflow.metrics.completedSteps}</div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-normal">{workflow.metrics.averageStepTime}m</div>
            <div className="text-sm text-gray-600">Avg Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-medsight-primary">{workflow.metrics.efficiency}%</div>
            <div className="text-sm text-gray-600">Efficiency</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as any)}
          className="input-medsight text-sm"
        >
          <option value="all">All Steps</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value as any)}
          className="input-medsight text-sm"
        >
          <option value="priority">Priority</option>
          <option value="duration">Duration</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {filteredSteps?.map((step, index) => (
          <div 
            key={step.id}
            className={`medsight-control-glass p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-medsight-primary/5 ${
              selectedStep === step.id ? 'ring-2 ring-medsight-primary' : ''
            }`}
            onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(step.status)}
                  <span className="text-sm font-medium text-gray-500">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{step.name}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(step.priority)}`}>
                  {step.priority}
                </span>
                <span className="text-sm text-gray-500">
                  {step.estimatedDuration}m
                </span>
                {step.status === 'in_progress' && (
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStepAction(step.id, 'pause');
                      }}
                      className="p-1 text-medsight-pending hover:bg-medsight-pending/20 rounded"
                    >
                      <PauseIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStepAction(step.id, 'complete');
                      }}
                      className="p-1 text-medsight-normal hover:bg-medsight-normal/20 rounded"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {step.status === 'pending' && step.dependencies.every(dep => 
                  workflow.steps.find(s => s.id === dep)?.status === 'completed'
                ) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStepAction(step.id, 'start');
                    }}
                    className="p-1 text-medsight-primary hover:bg-medsight-primary/20 rounded"
                  >
                    <PlayIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Expanded Details */}
            {selectedStep === step.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                    <div className="space-y-1 text-sm">
                      <div>Assigned to: {step.assignedTo || 'Unassigned'}</div>
                      <div>Category: {step.category}</div>
                      <div>Estimated: {step.estimatedDuration} minutes</div>
                      {step.actualDuration && (
                        <div>Actual: {step.actualDuration} minutes</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                    <div className="space-y-1 text-sm">
                      {step.requirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircleIcon className="w-3 h-3 text-medsight-normal" />
                          {req}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {showCompliance && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Compliance</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={getComplianceColor(step.compliance.status)}>
                        {step.compliance.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {step.compliance.notes && (
                        <span className="text-gray-600">- {step.compliance.notes}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 