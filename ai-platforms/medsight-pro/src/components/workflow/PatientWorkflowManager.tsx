'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  UserIcon, 
  CalendarIcon, 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  XMarkIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon,
  HeartIcon,
  BeakerIcon,
  CameraIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

interface Patient {
  id: string;
  name: string;
  dateOfBirth: Date;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mrn: string;
  contactInfo: {
    phone: string;
    email: string;
    emergencyContact: string;
  };
  insuranceInfo: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  medicalHistory: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    surgeries: string[];
  };
  status: 'active' | 'inactive' | 'deceased';
  lastVisit: Date;
  nextAppointment?: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ClinicalWorkflow {
  id: string;
  name: string;
  type: 'diagnostic' | 'treatment' | 'follow_up' | 'emergency' | 'research' | 'preventive';
  category: 'imaging' | 'lab' | 'cardiology' | 'neurology' | 'oncology' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'delayed' | 'on_hold';
  startDate: Date;
  endDate?: Date;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  assignedTeam: string[];
  primaryPhysician: string;
  progress: number;
  steps: WorkflowStep[];
  compliance: ComplianceStatus;
  alerts: Alert[];
  notes: ClinicalNote[];
  outcomes: ClinicalOutcome[];
  dependencies: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'task' | 'decision' | 'approval' | 'wait' | 'parallel';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped' | 'blocked';
  assignedTo: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  startTime?: Date;
  endTime?: Date;
  prerequisites: string[];
  deliverables: string[];
  quality: {
    required: boolean;
    criteria: string[];
    score?: number;
    reviewer?: string;
  };
  automation: {
    enabled: boolean;
    triggers: string[];
    actions: string[];
  };
}

interface ComplianceStatus {
  hipaaCompliant: boolean;
  qualityAssured: boolean;
  peerReviewed: boolean;
  documentationComplete: boolean;
  regulatoryApproved: boolean;
  auditTrail: AuditEntry[];
}

interface AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details: string;
  ipAddress?: string;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  escalated: boolean;
  priority: number;
}

interface ClinicalNote {
  id: string;
  type: 'progress' | 'assessment' | 'plan' | 'observation' | 'communication';
  author: string;
  content: string;
  timestamp: Date;
  attachments: string[];
  tags: string[];
}

interface ClinicalOutcome {
  id: string;
  type: 'diagnosis' | 'treatment_response' | 'complication' | 'recovery' | 'follow_up';
  description: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  timestamp: Date;
  associatedWorkflow: string;
  metrics: { [key: string]: number };
}

interface PatientCase {
  id: string;
  patient: Patient;
  chiefComplaint: string;
  presentingSymptoms: string[];
  workflows: ClinicalWorkflow[];
  timeline: TimelineEvent[];
  careTeam: CareTeamMember[];
  currentStatus: CaseStatus;
  metrics: CaseMetrics;
  resources: CaseResource[];
  communications: Communication[];
  billing: BillingInfo;
  createdAt: Date;
  updatedAt: Date;
}

interface TimelineEvent {
  id: string;
  type: 'workflow_start' | 'workflow_complete' | 'appointment' | 'test_result' | 'medication' | 'communication' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedWorkflow?: string;
  attachments: string[];
}

interface CareTeamMember {
  id: string;
  name: string;
  role: 'primary_physician' | 'specialist' | 'nurse' | 'technician' | 'coordinator' | 'admin';
  specialty: string;
  contact: string;
  availability: string;
  workload: number;
  active: boolean;
}

interface CaseStatus {
  overall: 'new' | 'active' | 'pending' | 'resolved' | 'follow_up' | 'transferred';
  medicalStatus: 'stable' | 'improving' | 'deteriorating' | 'critical' | 'recovered';
  workflowStatus: 'on_track' | 'delayed' | 'at_risk' | 'blocked' | 'expedited';
  lastUpdate: Date;
  nextReview: Date;
  flags: string[];
}

interface CaseMetrics {
  totalWorkflows: number;
  completedWorkflows: number;
  activeWorkflows: number;
  overallProgress: number;
  timeToCompletion: number;
  efficiency: number;
  qualityScore: number;
  patientSatisfaction: number;
  costEffectiveness: number;
  complianceScore: number;
}

interface CaseResource {
  id: string;
  type: 'equipment' | 'room' | 'staff' | 'medication' | 'consumable';
  name: string;
  quantity: number;
  allocated: boolean;
  available: boolean;
  scheduledTime?: Date;
  cost: number;
}

interface Communication {
  id: string;
  type: 'internal' | 'patient' | 'family' | 'external' | 'system';
  from: string;
  to: string[];
  subject: string;
  content: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read' | 'responded';
  attachments: string[];
}

interface BillingInfo {
  totalCost: number;
  insuranceCoverage: number;
  patientResponsibility: number;
  billingStatus: 'pending' | 'submitted' | 'approved' | 'denied' | 'paid';
  cptCodes: string[];
  icdCodes: string[];
}

interface PatientWorkflowManagerProps {
  caseId?: string;
  patientId?: string;
  onCaseUpdate?: (patientCase: PatientCase) => void;
  onWorkflowUpdate?: (workflow: ClinicalWorkflow) => void;
  onAlertGenerated?: (alert: Alert) => void;
  className?: string;
}

export default function PatientWorkflowManager({
  caseId,
  patientId,
  onCaseUpdate,
  onWorkflowUpdate,
  onAlertGenerated,
  className = ''
}: PatientWorkflowManagerProps) {
  const [currentCase, setCurrentCase] = useState<PatientCase | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'workflows' | 'timeline' | 'team' | 'resources' | 'compliance'>('overview');
  const [workflowFilter, setWorkflowFilter] = useState<'all' | 'active' | 'completed' | 'delayed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  // Mock patient case data
  const mockPatientCase: PatientCase = {
    id: 'case-001',
    patient: {
      id: 'pat-001',
      name: 'Sarah Johnson',
      dateOfBirth: new Date('1985-03-15'),
      age: 38,
      gender: 'Female',
      mrn: 'MRN-78901',
      contactInfo: {
        phone: '(555) 123-4567',
        email: 'sarah.johnson@email.com',
        emergencyContact: '(555) 987-6543'
      },
      insuranceInfo: {
        provider: 'United Healthcare',
        policyNumber: 'UHC-123456789',
        groupNumber: 'GRP-001'
      },
      medicalHistory: {
        allergies: ['Penicillin', 'Latex'],
        medications: ['Metformin 500mg', 'Lisinopril 10mg'],
        conditions: ['Type 2 Diabetes', 'Hypertension'],
        surgeries: ['Appendectomy (2010)']
      },
      status: 'active',
      lastVisit: new Date(Date.now() - 86400000 * 3),
      nextAppointment: new Date(Date.now() + 86400000 * 7),
      riskLevel: 'medium'
    },
    chiefComplaint: 'Chest pain and shortness of breath',
    presentingSymptoms: ['Chest pain', 'Shortness of breath', 'Fatigue', 'Dizziness'],
    workflows: [
      {
        id: 'wf-001',
        name: 'Cardiac Evaluation Protocol',
        type: 'diagnostic',
        category: 'cardiology',
        priority: 'high',
        status: 'in_progress',
        startDate: new Date(Date.now() - 86400000 * 2),
        estimatedDuration: 6,
        actualDuration: 4,
        assignedTeam: ['card-001', 'tech-001', 'nurse-001'],
        primaryPhysician: 'Dr. Smith',
        progress: 65,
        steps: [
          {
            id: 'step-001',
            name: 'Initial Assessment',
            description: 'Comprehensive patient evaluation',
            type: 'task',
            status: 'completed',
            assignedTo: 'nurse-001',
            estimatedDuration: 30,
            actualDuration: 25,
            startTime: new Date(Date.now() - 86400000 * 2),
            endTime: new Date(Date.now() - 86400000 * 2 + 1500000),
            prerequisites: [],
            deliverables: ['Vital signs', 'Patient history'],
            quality: {
              required: true,
              criteria: ['Complete vital signs', 'Accurate history'],
              score: 95,
              reviewer: 'nurse-supervisor'
            },
            automation: {
              enabled: false,
              triggers: [],
              actions: []
            }
          },
          {
            id: 'step-002',
            name: 'ECG Recording',
            description: '12-lead electrocardiogram',
            type: 'task',
            status: 'completed',
            assignedTo: 'tech-001',
            estimatedDuration: 15,
            actualDuration: 12,
            startTime: new Date(Date.now() - 86400000 * 2 + 1800000),
            endTime: new Date(Date.now() - 86400000 * 2 + 2520000),
            prerequisites: ['step-001'],
            deliverables: ['ECG report'],
            quality: {
              required: true,
              criteria: ['Clear recording', 'Proper lead placement'],
              score: 98,
              reviewer: 'tech-supervisor'
            },
            automation: {
              enabled: true,
              triggers: ['patient_ready'],
              actions: ['auto_analyze']
            }
          },
          {
            id: 'step-003',
            name: 'Cardiac Enzyme Labs',
            description: 'Troponin, CK-MB, BNP testing',
            type: 'task',
            status: 'in_progress',
            assignedTo: 'lab-001',
            estimatedDuration: 45,
            startTime: new Date(Date.now() - 86400000 + 3600000),
            prerequisites: ['step-001'],
            deliverables: ['Lab results'],
            quality: {
              required: true,
              criteria: ['Accurate results', 'Timely reporting'],
              reviewer: 'lab-director'
            },
            automation: {
              enabled: true,
              triggers: ['sample_received'],
              actions: ['auto_process', 'flag_abnormal']
            }
          }
        ],
        compliance: {
          hipaaCompliant: true,
          qualityAssured: true,
          peerReviewed: false,
          documentationComplete: false,
          regulatoryApproved: true,
          auditTrail: [
            {
              id: 'audit-001',
              action: 'Workflow created',
              user: 'Dr. Smith',
              timestamp: new Date(Date.now() - 86400000 * 2),
              details: 'Cardiac evaluation protocol initiated'
            }
          ]
        },
        alerts: [
          {
            id: 'alert-001',
            type: 'warning',
            message: 'Lab results pending for over 2 hours',
            timestamp: new Date(Date.now() - 7200000),
            acknowledged: false,
            escalated: false,
            priority: 2
          }
        ],
        notes: [
          {
            id: 'note-001',
            type: 'progress',
            author: 'Dr. Smith',
            content: 'Patient presenting with classic chest pain symptoms. ECG shows ST depression in leads II, III, aVF.',
            timestamp: new Date(Date.now() - 86400000),
            attachments: [],
            tags: ['cardiac', 'st_depression']
          }
        ],
        outcomes: [],
        dependencies: [],
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 3600000)
      },
      {
        id: 'wf-002',
        name: 'Medication Review',
        type: 'treatment',
        category: 'general',
        priority: 'medium',
        status: 'scheduled',
        startDate: new Date(Date.now() + 86400000),
        estimatedDuration: 1,
        assignedTeam: ['pharm-001'],
        primaryPhysician: 'Dr. Smith',
        progress: 0,
        steps: [
          {
            id: 'step-004',
            name: 'Medication Reconciliation',
            description: 'Review current medications and interactions',
            type: 'task',
            status: 'pending',
            assignedTo: 'pharm-001',
            estimatedDuration: 30,
            prerequisites: [],
            deliverables: ['Medication list', 'Interaction report'],
            quality: {
              required: true,
              criteria: ['Complete medication list', 'Interaction analysis'],
              reviewer: 'pharm-supervisor'
            },
            automation: {
              enabled: true,
              triggers: ['new_medication'],
              actions: ['check_interactions']
            }
          }
        ],
        compliance: {
          hipaaCompliant: true,
          qualityAssured: false,
          peerReviewed: false,
          documentationComplete: false,
          regulatoryApproved: true,
          auditTrail: []
        },
        alerts: [],
        notes: [],
        outcomes: [],
        dependencies: ['wf-001'],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000)
      }
    ],
    timeline: [
      {
        id: 'timeline-001',
        type: 'workflow_start',
        title: 'Cardiac Evaluation Started',
        description: 'Comprehensive cardiac evaluation protocol initiated',
        timestamp: new Date(Date.now() - 86400000 * 2),
        category: 'cardiology',
        priority: 'high',
        relatedWorkflow: 'wf-001',
        attachments: []
      },
      {
        id: 'timeline-002',
        type: 'test_result',
        title: 'ECG Completed',
        description: 'ECG shows ST depression in inferior leads',
        timestamp: new Date(Date.now() - 86400000 * 2 + 2520000),
        category: 'diagnostic',
        priority: 'high',
        relatedWorkflow: 'wf-001',
        attachments: ['ecg-report.pdf']
      },
      {
        id: 'timeline-003',
        type: 'alert',
        title: 'Lab Results Delayed',
        description: 'Cardiac enzymes taking longer than expected',
        timestamp: new Date(Date.now() - 7200000),
        category: 'alert',
        priority: 'medium',
        relatedWorkflow: 'wf-001',
        attachments: []
      }
    ],
    careTeam: [
      {
        id: 'card-001',
        name: 'Dr. Michael Smith',
        role: 'primary_physician',
        specialty: 'Cardiology',
        contact: 'msmith@hospital.com',
        availability: 'Available',
        workload: 85,
        active: true
      },
      {
        id: 'nurse-001',
        name: 'Jennifer Davis',
        role: 'nurse',
        specialty: 'Cardiac Care',
        contact: 'jdavis@hospital.com',
        availability: 'On duty',
        workload: 70,
        active: true
      },
      {
        id: 'tech-001',
        name: 'Robert Kim',
        role: 'technician',
        specialty: 'Cardiology Tech',
        contact: 'rkim@hospital.com',
        availability: 'Available',
        workload: 60,
        active: true
      }
    ],
    currentStatus: {
      overall: 'active',
      medicalStatus: 'stable',
      workflowStatus: 'on_track',
      lastUpdate: new Date(Date.now() - 3600000),
      nextReview: new Date(Date.now() + 86400000),
      flags: ['lab_pending', 'cardiac_risk']
    },
    metrics: {
      totalWorkflows: 2,
      completedWorkflows: 0,
      activeWorkflows: 1,
      overallProgress: 35,
      timeToCompletion: 8,
      efficiency: 88,
      qualityScore: 92,
      patientSatisfaction: 85,
      costEffectiveness: 78,
      complianceScore: 95
    },
    resources: [
      {
        id: 'res-001',
        type: 'equipment',
        name: 'ECG Machine',
        quantity: 1,
        allocated: true,
        available: false,
        cost: 150
      },
      {
        id: 'res-002',
        type: 'staff',
        name: 'Cardiac Technician',
        quantity: 1,
        allocated: true,
        available: true,
        cost: 75
      }
    ],
    communications: [
      {
        id: 'comm-001',
        type: 'internal',
        from: 'Dr. Smith',
        to: ['nurse-001', 'tech-001'],
        subject: 'Patient care coordination',
        content: 'Please ensure lab results are followed up promptly.',
        timestamp: new Date(Date.now() - 7200000),
        priority: 'medium',
        status: 'read',
        attachments: []
      }
    ],
    billing: {
      totalCost: 2500,
      insuranceCoverage: 2000,
      patientResponsibility: 500,
      billingStatus: 'pending',
      cptCodes: ['93000', '80053'],
      icdCodes: ['R06.02', 'R50.9']
    },
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 3600000)
  };

  useEffect(() => {
    if (caseId || patientId) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setCurrentCase(mockPatientCase);
        setIsLoading(false);
      }, 1000);
    }
  }, [caseId, patientId]);

  useEffect(() => {
    if (autoRefresh && currentCase) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        setCurrentCase(prev => {
          if (!prev) return null;
          
          const updated = { ...prev };
          
          // Update workflow progress
          updated.workflows.forEach(workflow => {
            if (workflow.status === 'in_progress') {
              const inProgressStep = workflow.steps.find(s => s.status === 'in_progress');
              if (inProgressStep && inProgressStep.startTime) {
                const elapsed = Date.now() - inProgressStep.startTime.getTime();
                const expectedTime = inProgressStep.estimatedDuration * 60000;
                const progress = Math.min(elapsed / expectedTime, 1);
                
                if (progress >= 1) {
                  inProgressStep.status = 'completed';
                  inProgressStep.endTime = new Date();
                  inProgressStep.actualDuration = Math.round(elapsed / 60000);
                  
                  // Start next step
                  const nextStep = workflow.steps.find(s => 
                    s.status === 'pending' && 
                    s.prerequisites.every(prereq => 
                      workflow.steps.find(step => step.id === prereq)?.status === 'completed'
                    )
                  );
                  
                  if (nextStep) {
                    nextStep.status = 'in_progress';
                    nextStep.startTime = new Date();
                  }
                }
              }
              
              // Update workflow progress
              const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
              workflow.progress = Math.round((completedSteps / workflow.steps.length) * 100);
            }
          });
          
          // Update case metrics
          updated.metrics.completedWorkflows = updated.workflows.filter(w => w.status === 'completed').length;
          updated.metrics.activeWorkflows = updated.workflows.filter(w => w.status === 'in_progress').length;
          updated.metrics.overallProgress = Math.round(
            updated.workflows.reduce((sum, w) => sum + w.progress, 0) / updated.workflows.length
          );
          
          return updated;
        });
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, currentCase]);

  const filteredWorkflows = useMemo(() => {
    if (!currentCase) return [];
    
    return currentCase.workflows.filter(workflow => {
      // Filter by status
      if (workflowFilter === 'active' && workflow.status !== 'in_progress') return false;
      if (workflowFilter === 'completed' && workflow.status !== 'completed') return false;
      if (workflowFilter === 'delayed' && workflow.status !== 'delayed') return false;
      
      // Filter by search term
      if (searchTerm && !workflow.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      return true;
    });
  }, [currentCase, workflowFilter, searchTerm]);

  const activeAlerts = useMemo(() => {
    if (!currentCase) return [];
    
    return currentCase.workflows.flatMap(workflow => 
      workflow.alerts.filter(alert => !alert.acknowledged)
    );
  }, [currentCase]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-medsight-normal';
      case 'in_progress': return 'text-medsight-primary';
      case 'scheduled': case 'pending': return 'text-medsight-pending';
      case 'delayed': case 'failed': return 'text-medsight-abnormal';
      case 'on_hold': case 'cancelled': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-5 h-5 text-medsight-normal" />;
      case 'in_progress': return <PlayIcon className="w-5 h-5 text-medsight-primary" />;
      case 'scheduled': case 'pending': return <ClockIcon className="w-5 h-5 text-medsight-pending" />;
      case 'delayed': case 'failed': return <ExclamationTriangleIcon className="w-5 h-5 text-medsight-abnormal" />;
      case 'on_hold': return <PauseIcon className="w-5 h-5 text-gray-500" />;
      case 'cancelled': return <StopIcon className="w-5 h-5 text-gray-500" />;
      default: return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': case 'emergency': return 'text-medsight-critical bg-medsight-critical/10';
      case 'high': return 'text-medsight-abnormal bg-medsight-abnormal/10';
      case 'medium': return 'text-medsight-pending bg-medsight-pending/10';
      case 'low': return 'text-medsight-normal bg-medsight-normal/10';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-medsight-critical bg-medsight-critical/10';
      case 'high': return 'text-medsight-abnormal bg-medsight-abnormal/10';
      case 'medium': return 'text-medsight-pending bg-medsight-pending/10';
      case 'low': return 'text-medsight-normal bg-medsight-normal/10';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const handleWorkflowAction = (workflowId: string, action: 'start' | 'pause' | 'resume' | 'complete' | 'cancel') => {
    if (!currentCase) return;
    
    const updatedCase = { ...currentCase };
    const workflow = updatedCase.workflows.find(w => w.id === workflowId);
    
    if (!workflow) return;
    
    switch (action) {
      case 'start':
        workflow.status = 'in_progress';
        workflow.startDate = new Date();
        // Start first step
        const firstStep = workflow.steps.find(s => s.prerequisites.length === 0);
        if (firstStep) {
          firstStep.status = 'in_progress';
          firstStep.startTime = new Date();
        }
        break;
      case 'pause':
        workflow.status = 'on_hold';
        // Pause current step
        const currentStep = workflow.steps.find(s => s.status === 'in_progress');
        if (currentStep) {
          currentStep.status = 'pending';
        }
        break;
      case 'resume':
        workflow.status = 'in_progress';
        // Resume paused step
        const pausedStep = workflow.steps.find(s => s.status === 'pending');
        if (pausedStep) {
          pausedStep.status = 'in_progress';
          pausedStep.startTime = new Date();
        }
        break;
      case 'complete':
        workflow.status = 'completed';
        workflow.endDate = new Date();
        workflow.actualDuration = Math.round((Date.now() - workflow.startDate.getTime()) / 3600000);
        workflow.progress = 100;
        break;
      case 'cancel':
        workflow.status = 'cancelled';
        workflow.endDate = new Date();
        break;
    }
    
    updatedCase.updatedAt = new Date();
    setCurrentCase(updatedCase);
    onCaseUpdate?.(updatedCase);
    onWorkflowUpdate?.(workflow);
  };

  const handleCreateWorkflow = (workflowData: Partial<ClinicalWorkflow>) => {
    if (!currentCase) return;
    
    const newWorkflow: ClinicalWorkflow = {
      id: `wf-${Date.now()}`,
      name: workflowData.name || 'New Workflow',
      type: workflowData.type || 'diagnostic',
      category: workflowData.category || 'general',
      priority: workflowData.priority || 'medium',
      status: 'scheduled',
      startDate: workflowData.startDate || new Date(),
      estimatedDuration: workflowData.estimatedDuration || 1,
      assignedTeam: workflowData.assignedTeam || [],
      primaryPhysician: workflowData.primaryPhysician || currentCase.careTeam[0]?.name || 'Unknown',
      progress: 0,
      steps: workflowData.steps || [],
      compliance: {
        hipaaCompliant: false,
        qualityAssured: false,
        peerReviewed: false,
        documentationComplete: false,
        regulatoryApproved: false,
        auditTrail: []
      },
      alerts: [],
      notes: [],
      outcomes: [],
      dependencies: workflowData.dependencies || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedCase = {
      ...currentCase,
      workflows: [...currentCase.workflows, newWorkflow],
      updatedAt: new Date()
    };
    
    setCurrentCase(updatedCase);
    setShowCreateWorkflow(false);
    onCaseUpdate?.(updatedCase);
  };

  const handleAlertAcknowledge = (alertId: string) => {
    if (!currentCase) return;
    
    const updatedCase = { ...currentCase };
    
    updatedCase.workflows.forEach(workflow => {
      const alert = workflow.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedBy = 'current_user'; // This would be the actual user
      }
    });
    
    setCurrentCase(updatedCase);
    onCaseUpdate?.(updatedCase);
  };

  if (isLoading) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-medsight-primary/20 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-medsight-primary/10 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-medsight-primary/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentCase) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="text-center text-gray-500">
          <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No Patient Case Selected</h3>
          <p>Select a patient case to view workflow management</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`medsight-glass p-6 rounded-xl ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-medsight-primary mb-1">
                {currentCase.patient.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{currentCase.patient.age}y/o {currentCase.patient.gender}</span>
                <span>MRN: {currentCase.patient.mrn}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(currentCase.patient.riskLevel)}`}>
                  {currentCase.patient.riskLevel.toUpperCase()} RISK
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Alerts */}
            <div className="relative">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className={`btn-medsight ${activeAlerts.length > 0 ? 'text-medsight-abnormal' : ''}`}
              >
                <BellIcon className="w-5 h-5" />
                {activeAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-medsight-abnormal text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeAlerts.length}
                  </span>
                )}
              </button>
              
              {showAlerts && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border z-50">
                  <div className="p-4">
                    <h3 className="font-medium mb-3">Active Alerts</h3>
                    {activeAlerts.length === 0 ? (
                      <p className="text-gray-500 text-sm">No active alerts</p>
                    ) : (
                      <div className="space-y-2">
                        {activeAlerts.map(alert => (
                          <div key={alert.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                            <ExclamationTriangleIcon className="w-4 h-4 text-medsight-abnormal mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{alert.message}</p>
                              <p className="text-xs text-gray-500">
                                {alert.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleAlertAcknowledge(alert.id)}
                              className="text-xs text-medsight-primary hover:text-medsight-primary/80"
                            >
                              Acknowledge
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Auto-refresh */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`btn-medsight ${autoRefresh ? 'bg-medsight-primary/20' : ''}`}
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
            
            {/* Create Workflow */}
            <button
              onClick={() => setShowCreateWorkflow(true)}
              className="btn-medsight bg-medsight-primary text-white"
            >
              <PlusIcon className="w-5 h-5" />
              New Workflow
            </button>
          </div>
        </div>
        
        {/* Case Info */}
        <div className="bg-medsight-primary/5 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-medsight-primary mb-1">
                {currentCase.chiefComplaint}
              </h3>
              <p className="text-sm text-gray-600">
                Case Status: <span className={`font-medium ${getStatusColor(currentCase.currentStatus.overall)}`}>
                  {currentCase.currentStatus.overall.toUpperCase()}
                </span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-medsight-primary">
                {currentCase.metrics.overallProgress}%
              </div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'workflows', label: 'Workflows', icon: ClipboardDocumentListIcon },
            { id: 'timeline', label: 'Timeline', icon: CalendarIcon },
            { id: 'team', label: 'Care Team', icon: UserGroupIcon },
            { id: 'resources', label: 'Resources', icon: BeakerIcon },
            { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-medsight-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                    <p className="text-2xl font-bold text-medsight-primary">
                      {currentCase.metrics.activeWorkflows}
                    </p>
                  </div>
                  <PlayIcon className="w-8 h-8 text-medsight-primary/30" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-medsight-normal">
                      {currentCase.metrics.completedWorkflows}
                    </p>
                  </div>
                  <CheckCircleIcon className="w-8 h-8 text-medsight-normal/30" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quality Score</p>
                    <p className="text-2xl font-bold text-medsight-primary">
                      {currentCase.metrics.qualityScore}%
                    </p>
                  </div>
                  <ArrowTrendingUpIcon className="w-8 h-8 text-medsight-primary/30" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Efficiency</p>
                    <p className="text-2xl font-bold text-medsight-normal">
                      {currentCase.metrics.efficiency}%
                    </p>
                  </div>
                  <ChartBarIcon className="w-8 h-8 text-medsight-normal/30" />
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {currentCase.timeline.slice(0, 5).map(event => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(event.priority).split(' ')[0]}`} />
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div className="space-y-6">
            {/* Workflow Controls */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                />
              </div>
              
              <select
                value={workflowFilter}
                onChange={(e) => setWorkflowFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
              >
                <option value="all">All Workflows</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
            
            {/* Workflow List */}
            <div className="space-y-4">
              {filteredWorkflows.map(workflow => (
                <div key={workflow.id} className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(workflow.status)}
                      <div>
                        <h3 className="font-medium text-lg">{workflow.name}</h3>
                        <p className="text-sm text-gray-600">
                          {workflow.category} • {workflow.type}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(workflow.priority)}`}>
                        {workflow.priority.toUpperCase()}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {workflow.status === 'scheduled' && (
                          <button
                            onClick={() => handleWorkflowAction(workflow.id, 'start')}
                            className="btn-medsight text-medsight-primary"
                          >
                            <PlayIcon className="w-4 h-4" />
                          </button>
                        )}
                        
                        {workflow.status === 'in_progress' && (
                          <button
                            onClick={() => handleWorkflowAction(workflow.id, 'pause')}
                            className="btn-medsight text-medsight-pending"
                          >
                            <PauseIcon className="w-4 h-4" />
                          </button>
                        )}
                        
                        {workflow.status === 'on_hold' && (
                          <button
                            onClick={() => handleWorkflowAction(workflow.id, 'resume')}
                            className="btn-medsight text-medsight-primary"
                          >
                            <PlayIcon className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => setSelectedWorkflow(selectedWorkflow === workflow.id ? null : workflow.id)}
                          className="btn-medsight"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-medium text-medsight-primary">{workflow.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-medsight-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${workflow.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Workflow Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Started:</span>
                      <p className="font-medium">{workflow.startDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <p className="font-medium">{workflow.estimatedDuration}h est.</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Team:</span>
                      <p className="font-medium">{workflow.assignedTeam.length} members</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Steps:</span>
                      <p className="font-medium">{workflow.steps.length} total</p>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {selectedWorkflow === workflow.id && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-3">Workflow Steps</h4>
                      <div className="space-y-2">
                        {workflow.steps.map(step => (
                          <div key={step.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            {getStatusIcon(step.status)}
                            <div className="flex-1">
                              <p className="font-medium">{step.name}</p>
                              <p className="text-sm text-gray-600">{step.description}</p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="font-medium">{step.estimatedDuration}min</p>
                              <p className="text-gray-500">{step.assignedTo}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Patient Timeline</h3>
              <div className="space-y-4">
                {currentCase.timeline.map(event => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-2 ${getPriorityColor(event.priority).split(' ')[0]}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{event.title}</h4>
                        <span className="text-sm text-gray-500">
                          {event.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {event.category}
                        </span>
                        {event.attachments.length > 0 && (
                          <span className="text-xs text-medsight-primary">
                            {event.attachments.length} attachment(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Care Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Care Team</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCase.careTeam.map(member => (
                  <div key={member.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{member.name}</h4>
                      <span className={`w-3 h-3 rounded-full ${member.active ? 'bg-medsight-normal' : 'bg-gray-400'}`} />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{member.role.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-600 mb-2">{member.specialty}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Workload:</span>
                      <span className="font-medium">{member.workload}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${member.workload > 80 ? 'bg-medsight-abnormal' : 'bg-medsight-normal'}`}
                        style={{ width: `${member.workload}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Allocated Resources</h3>
              <div className="space-y-3">
                {currentCase.resources.map(resource => (
                  <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${resource.available ? 'bg-medsight-normal' : 'bg-medsight-abnormal'}`} />
                      <div>
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-sm text-gray-600">{resource.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${resource.cost}</p>
                      <p className="text-sm text-gray-600">Qty: {resource.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium mb-4">Compliance Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCase.workflows.map(workflow => (
                  <div key={workflow.id} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">{workflow.name}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">HIPAA Compliant</span>
                        <span className={`text-sm font-medium ${workflow.compliance.hipaaCompliant ? 'text-medsight-normal' : 'text-medsight-abnormal'}`}>
                          {workflow.compliance.hipaaCompliant ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Quality Assured</span>
                        <span className={`text-sm font-medium ${workflow.compliance.qualityAssured ? 'text-medsight-normal' : 'text-medsight-abnormal'}`}>
                          {workflow.compliance.qualityAssured ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Peer Reviewed</span>
                        <span className={`text-sm font-medium ${workflow.compliance.peerReviewed ? 'text-medsight-normal' : 'text-medsight-abnormal'}`}>
                          {workflow.compliance.peerReviewed ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Documentation Complete</span>
                        <span className={`text-sm font-medium ${workflow.compliance.documentationComplete ? 'text-medsight-normal' : 'text-medsight-abnormal'}`}>
                          {workflow.compliance.documentationComplete ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Create Workflow Modal */}
      {showCreateWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Workflow</h3>
              <button
                onClick={() => setShowCreateWorkflow(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleCreateWorkflow({
                name: formData.get('name') as string,
                type: formData.get('type') as any,
                category: formData.get('category') as any,
                priority: formData.get('priority') as any,
                estimatedDuration: parseInt(formData.get('estimatedDuration') as string),
                assignedTeam: [(formData.get('assignedTeam') as string)],
                primaryPhysician: formData.get('primaryPhysician') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    placeholder="Enter workflow name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                  >
                    <option value="diagnostic">Diagnostic</option>
                    <option value="treatment">Treatment</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="emergency">Emergency</option>
                    <option value="research">Research</option>
                    <option value="preventive">Preventive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="imaging">Imaging</option>
                    <option value="lab">Laboratory</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="neurology">Neurology</option>
                    <option value="oncology">Oncology</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Duration (hours)
                  </label>
                  <input
                    type="number"
                    name="estimatedDuration"
                    required
                    min="1"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    placeholder="Enter estimated duration"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Physician
                  </label>
                  <select
                    name="primaryPhysician"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                  >
                    {currentCase.careTeam.map(member => (
                      <option key={member.id} value={member.name}>
                        {member.name} ({member.specialty})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Team Member
                  </label>
                  <select
                    name="assignedTeam"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                  >
                    {currentCase.careTeam.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateWorkflow(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-medsight-primary text-white rounded-md hover:bg-medsight-primary/90"
                >
                  Create Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 