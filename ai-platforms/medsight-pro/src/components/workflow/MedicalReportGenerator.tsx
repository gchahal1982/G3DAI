'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  DocumentTextIcon, 
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
  PrinterIcon,
  ShareIcon,
  PencilIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ChartBarIcon,
  UserIcon,
  CalendarIcon,
  BeakerIcon,
  CameraIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  PlusIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  DocumentCheckIcon,
  ClipboardDocumentListIcon,
  SignalIcon,
  ShieldCheckIcon,
  PaperAirplaneIcon,
  BookOpenIcon,
  TableCellsIcon,
  PhotoIcon,
  QrCodeIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  TagIcon,
  LanguageIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface ReportTemplate {
  id: string;
  name: string;
  type: 'radiology' | 'pathology' | 'laboratory' | 'clinical' | 'surgical' | 'discharge' | 'consultation' | 'emergency';
  category: string;
  description: string;
  structure: ReportSection[];
  requiredFields: string[];
  optionalFields: string[];
  autoGeneration: {
    enabled: boolean;
    aiAssisted: boolean;
    triggers: string[];
    rules: GenerationRule[];
  };
  formatting: {
    layout: 'standard' | 'structured' | 'narrative' | 'tabular';
    includeDiagrams: boolean;
    includeImages: boolean;
    includeMetrics: boolean;
    headerFooter: boolean;
  };
  compliance: {
    hipaaCompliant: boolean;
    regulatoryStandards: string[];
    qualityRequirements: string[];
    approvalRequired: boolean;
  };
  version: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
  usage: {
    totalGenerated: number;
    lastUsed: Date;
    averageGenerationTime: number;
    satisfactionScore: number;
  };
}

interface ReportSection {
  id: string;
  name: string;
  type: 'header' | 'findings' | 'impression' | 'recommendations' | 'technical' | 'narrative' | 'structured' | 'table' | 'image';
  required: boolean;
  order: number;
  content: {
    template: string;
    placeholders: string[];
    defaultValues: { [key: string]: string };
    validationRules: ValidationRule[];
  };
  aiGeneration: {
    enabled: boolean;
    model: string;
    prompt: string;
    confidence: number;
    reviewRequired: boolean;
  };
  formatting: {
    fontSize: number;
    fontFamily: string;
    alignment: 'left' | 'center' | 'right' | 'justify';
    spacing: number;
    borders: boolean;
    highlighting: boolean;
  };
}

interface GenerationRule {
  id: string;
  name: string;
  condition: string;
  action: 'include' | 'exclude' | 'modify' | 'flag';
  parameters: { [key: string]: any };
  priority: number;
}

interface ValidationRule {
  type: 'required' | 'format' | 'length' | 'range' | 'pattern' | 'custom';
  parameters: { [key: string]: any };
  message: string;
}

interface MedicalReport {
  id: string;
  templateId: string;
  patientId: string;
  studyId?: string;
  workflowId?: string;
  title: string;
  type: ReportTemplate['type'];
  status: 'draft' | 'pending_review' | 'approved' | 'finalized' | 'signed' | 'delivered' | 'archived';
  content: ReportContent;
  metadata: ReportMetadata;
  generation: {
    method: 'manual' | 'ai_assisted' | 'fully_automated';
    aiConfidence: number;
    generationTime: number;
    reviewRequired: boolean;
    qualityScore: number;
  };
  workflow: {
    createdBy: string;
    createdAt: Date;
    reviewedBy?: string;
    reviewedAt?: Date;
    approvedBy?: string;
    approvedAt?: Date;
    signedBy?: string;
    signedAt?: Date;
  };
  versions: ReportVersion[];
  attachments: ReportAttachment[];
  distribution: {
    recipients: string[];
    deliveryMethod: 'email' | 'print' | 'portal' | 'fax' | 'secure_message';
    deliveredAt?: Date;
    readBy: string[];
  };
  compliance: {
    hipaaCompliant: boolean;
    auditTrail: AuditEntry[];
    retentionPolicy: string;
    accessLog: AccessEntry[];
  };
  feedback: {
    rating: number;
    comments: string;
    submittedBy: string;
    submittedAt: Date;
  }[];
}

interface ReportContent {
  sections: { [sectionId: string]: string };
  findings: ClinicalFinding[];
  impressions: string[];
  recommendations: string[];
  clinicalData: { [key: string]: any };
  measurements: Measurement[];
  observations: string[];
  conclusions: string[];
  followUp: string[];
  images: string[];
  charts: string[];
  references: string[];
}

interface ReportMetadata {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    mrn: string;
    dateOfBirth: Date;
  };
  study: {
    id: string;
    type: string;
    date: Date;
    modality: string;
    location: string;
    technician: string;
    contrast: boolean;
  };
  physician: {
    primary: string;
    referring: string;
    consulting: string[];
  };
  facility: {
    name: string;
    address: string;
    phone: string;
    license: string;
  };
  urgency: 'routine' | 'urgent' | 'stat' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  specialty: string;
  department: string;
}

interface ReportVersion {
  id: string;
  version: string;
  changes: string[];
  createdAt: Date;
  createdBy: string;
  content: ReportContent;
  approved: boolean;
}

interface ReportAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'data';
  url: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  description: string;
}

interface ClinicalFinding {
  id: string;
  category: string;
  description: string;
  severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical';
  confidence: number;
  location: string;
  measurements: Measurement[];
  aiGenerated: boolean;
  validated: boolean;
  tags: string[];
}

interface Measurement {
  name: string;
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
  abnormal: boolean;
  significance: 'normal' | 'borderline' | 'abnormal' | 'critical';
}

interface AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details: string;
  ipAddress: string;
}

interface AccessEntry {
  id: string;
  user: string;
  action: 'view' | 'edit' | 'download' | 'print' | 'share';
  timestamp: Date;
  ipAddress: string;
  successful: boolean;
}

interface MedicalReportGeneratorProps {
  templateId?: string;
  patientId?: string;
  studyId?: string;
  workflowId?: string;
  reportId?: string;
  onReportGenerated?: (report: MedicalReport) => void;
  onReportUpdated?: (report: MedicalReport) => void;
  onReportApproved?: (report: MedicalReport) => void;
  onReportSigned?: (report: MedicalReport) => void;
  className?: string;
}

export default function MedicalReportGenerator({
  templateId,
  patientId,
  studyId,
  workflowId,
  reportId,
  onReportGenerated,
  onReportUpdated,
  onReportApproved,
  onReportSigned,
  className = ''
}: MedicalReportGeneratorProps) {
  const [currentReport, setCurrentReport] = useState<MedicalReport | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<ReportTemplate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'preview' | 'templates' | 'history' | 'settings'>('generator');
  const [generationMethod, setGenerationMethod] = useState<'manual' | 'ai_assisted' | 'fully_automated'>('ai_assisted');
  const [showPreview, setShowPreview] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | ReportTemplate['type']>('all');
  const [reportHistory, setReportHistory] = useState<MedicalReport[]>([]);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Mock templates data
  const mockTemplates: ReportTemplate[] = [
    {
      id: 'template-001',
      name: 'CT Chest Report',
      type: 'radiology',
      category: 'Imaging',
      description: 'Standard CT chest examination report template',
      structure: [
        {
          id: 'section-001',
          name: 'Clinical History',
          type: 'narrative',
          required: true,
          order: 1,
          content: {
            template: 'Clinical History: {clinical_history}',
            placeholders: ['clinical_history'],
            defaultValues: { clinical_history: 'Patient presenting with chest pain and shortness of breath' },
            validationRules: [
              { type: 'required', parameters: {}, message: 'Clinical history is required' }
            ]
          },
          aiGeneration: {
            enabled: true,
            model: 'medical-nlp-v2',
            prompt: 'Generate clinical history based on patient symptoms and chief complaint',
            confidence: 0.85,
            reviewRequired: false
          },
          formatting: {
            fontSize: 12,
            fontFamily: 'Arial',
            alignment: 'left',
            spacing: 1.5,
            borders: false,
            highlighting: false
          }
        },
        {
          id: 'section-002',
          name: 'Technique',
          type: 'structured',
          required: true,
          order: 2,
          content: {
            template: 'Technique: {technique}\nContrast: {contrast}\nSlice Thickness: {slice_thickness}',
            placeholders: ['technique', 'contrast', 'slice_thickness'],
            defaultValues: { 
              technique: 'Axial CT images of the chest',
              contrast: 'IV contrast administered',
              slice_thickness: '5mm'
            },
            validationRules: [
              { type: 'required', parameters: {}, message: 'Technique description is required' }
            ]
          },
          aiGeneration: {
            enabled: true,
            model: 'medical-nlp-v2',
            prompt: 'Generate technique description based on study parameters',
            confidence: 0.92,
            reviewRequired: false
          },
          formatting: {
            fontSize: 12,
            fontFamily: 'Arial',
            alignment: 'left',
            spacing: 1.5,
            borders: false,
            highlighting: false
          }
        },
        {
          id: 'section-003',
          name: 'Findings',
          type: 'findings',
          required: true,
          order: 3,
          content: {
            template: 'Findings:\n{findings}',
            placeholders: ['findings'],
            defaultValues: { findings: 'The lungs are clear bilaterally without focal consolidation, pleural effusion, or pneumothorax.' },
            validationRules: [
              { type: 'required', parameters: {}, message: 'Findings are required' },
              { type: 'length', parameters: { min: 50 }, message: 'Findings must be at least 50 characters' }
            ]
          },
          aiGeneration: {
            enabled: true,
            model: 'medical-vision-v3',
            prompt: 'Analyze CT chest images and generate detailed findings',
            confidence: 0.88,
            reviewRequired: true
          },
          formatting: {
            fontSize: 12,
            fontFamily: 'Arial',
            alignment: 'left',
            spacing: 1.5,
            borders: false,
            highlighting: true
          }
        },
        {
          id: 'section-004',
          name: 'Impression',
          type: 'impression',
          required: true,
          order: 4,
          content: {
            template: 'Impression:\n{impression}',
            placeholders: ['impression'],
            defaultValues: { impression: 'Normal chest CT examination.' },
            validationRules: [
              { type: 'required', parameters: {}, message: 'Impression is required' }
            ]
          },
          aiGeneration: {
            enabled: true,
            model: 'medical-nlp-v2',
            prompt: 'Generate impression based on findings and clinical context',
            confidence: 0.90,
            reviewRequired: true
          },
          formatting: {
            fontSize: 12,
            fontFamily: 'Arial',
            alignment: 'left',
            spacing: 1.5,
            borders: false,
            highlighting: true
          }
        }
      ],
      requiredFields: ['clinical_history', 'technique', 'findings', 'impression'],
      optionalFields: ['recommendations', 'follow_up'],
      autoGeneration: {
        enabled: true,
        aiAssisted: true,
        triggers: ['image_analysis_complete', 'study_complete'],
        rules: [
          {
            id: 'rule-001',
            name: 'Auto-generate on completion',
            condition: 'study_status == "complete"',
            action: 'include',
            parameters: { auto_save: true },
            priority: 1
          }
        ]
      },
      formatting: {
        layout: 'structured',
        includeDiagrams: false,
        includeImages: true,
        includeMetrics: true,
        headerFooter: true
      },
      compliance: {
        hipaaCompliant: true,
        regulatoryStandards: ['ACR', 'RSNA'],
        qualityRequirements: ['peer_review', 'spell_check'],
        approvalRequired: true
      },
      version: '2.1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-10-15'),
      createdBy: 'Dr. Sarah Johnson',
      isActive: true,
      usage: {
        totalGenerated: 1234,
        lastUsed: new Date(),
        averageGenerationTime: 45, // seconds
        satisfactionScore: 4.6
      }
    },
    {
      id: 'template-002',
      name: 'Pathology Report',
      type: 'pathology',
      category: 'Laboratory',
      description: 'Comprehensive pathology examination report',
      structure: [
        {
          id: 'section-005',
          name: 'Specimen Information',
          type: 'structured',
          required: true,
          order: 1,
          content: {
            template: 'Specimen: {specimen_type}\nSite: {anatomic_site}\nProcedure: {procedure}',
            placeholders: ['specimen_type', 'anatomic_site', 'procedure'],
            defaultValues: { 
              specimen_type: 'Tissue biopsy',
              anatomic_site: 'Lung, right upper lobe',
              procedure: 'Needle biopsy'
            },
            validationRules: [
              { type: 'required', parameters: {}, message: 'Specimen information is required' }
            ]
          },
          aiGeneration: {
            enabled: true,
            model: 'medical-nlp-v2',
            prompt: 'Generate specimen information based on requisition',
            confidence: 0.95,
            reviewRequired: false
          },
          formatting: {
            fontSize: 12,
            fontFamily: 'Arial',
            alignment: 'left',
            spacing: 1.5,
            borders: true,
            highlighting: false
          }
        },
        {
          id: 'section-006',
          name: 'Microscopic Description',
          type: 'findings',
          required: true,
          order: 2,
          content: {
            template: 'Microscopic Description:\n{microscopic_findings}',
            placeholders: ['microscopic_findings'],
            defaultValues: { microscopic_findings: 'Microscopic examination reveals...' },
            validationRules: [
              { type: 'required', parameters: {}, message: 'Microscopic description is required' },
              { type: 'length', parameters: { min: 100 }, message: 'Description must be at least 100 characters' }
            ]
          },
          aiGeneration: {
            enabled: true,
            model: 'pathology-ai-v2',
            prompt: 'Generate microscopic description based on digital pathology analysis',
            confidence: 0.83,
            reviewRequired: true
          },
          formatting: {
            fontSize: 12,
            fontFamily: 'Arial',
            alignment: 'left',
            spacing: 1.5,
            borders: false,
            highlighting: true
          }
        },
        {
          id: 'section-007',
          name: 'Diagnosis',
          type: 'impression',
          required: true,
          order: 3,
          content: {
            template: 'Diagnosis:\n{diagnosis}',
            placeholders: ['diagnosis'],
            defaultValues: { diagnosis: 'Benign lung tissue with reactive changes' },
            validationRules: [
              { type: 'required', parameters: {}, message: 'Diagnosis is required' }
            ]
          },
          aiGeneration: {
            enabled: true,
            model: 'pathology-ai-v2',
            prompt: 'Generate diagnosis based on microscopic findings',
            confidence: 0.87,
            reviewRequired: true
          },
          formatting: {
            fontSize: 12,
            fontFamily: 'Arial',
            alignment: 'left',
            spacing: 1.5,
            borders: false,
            highlighting: true
          }
        }
      ],
      requiredFields: ['specimen_type', 'anatomic_site', 'procedure', 'microscopic_findings', 'diagnosis'],
      optionalFields: ['special_stains', 'immunohistochemistry', 'molecular_testing'],
      autoGeneration: {
        enabled: true,
        aiAssisted: true,
        triggers: ['microscopy_complete', 'staining_complete'],
        rules: [
          {
            id: 'rule-002',
            name: 'Generate after staining',
            condition: 'staining_status == "complete"',
            action: 'include',
            parameters: { include_stains: true },
            priority: 1
          }
        ]
      },
      formatting: {
        layout: 'structured',
        includeDiagrams: true,
        includeImages: true,
        includeMetrics: false,
        headerFooter: true
      },
      compliance: {
        hipaaCompliant: true,
        regulatoryStandards: ['CAP', 'CLIA'],
        qualityRequirements: ['pathologist_review', 'quality_control'],
        approvalRequired: true
      },
      version: '1.8',
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2023-11-01'),
      createdBy: 'Dr. Michael Chen',
      isActive: true,
      usage: {
        totalGenerated: 867,
        lastUsed: new Date(Date.now() - 86400000),
        averageGenerationTime: 120, // seconds
        satisfactionScore: 4.4
      }
    }
  ];

  // Mock report data
  const mockReport: MedicalReport = {
    id: 'report-001',
    templateId: 'template-001',
    patientId: 'pat-001',
    studyId: 'study-001',
    workflowId: 'wf-001',
    title: 'CT Chest - Sarah Johnson',
    type: 'radiology',
    status: 'draft',
    content: {
      sections: {
        'section-001': 'Patient presenting with chest pain and shortness of breath for 2 weeks. History of hypertension and diabetes.',
        'section-002': 'Axial CT images of the chest were obtained with IV contrast. Slice thickness 5mm.',
        'section-003': 'The lungs are clear bilaterally without focal consolidation, pleural effusion, or pneumothorax. Heart size is normal. No hilar or mediastinal lymphadenopathy.',
        'section-004': 'Normal chest CT examination. No acute findings.'
      },
      findings: [
        {
          id: 'finding-001',
          category: 'Pulmonary',
          description: 'Lungs clear bilaterally',
          severity: 'normal',
          confidence: 0.95,
          location: 'Bilateral lungs',
          measurements: [],
          aiGenerated: true,
          validated: true,
          tags: ['normal', 'pulmonary']
        }
      ],
      impressions: ['Normal chest CT examination', 'No acute findings'],
      recommendations: ['No follow-up needed unless clinically indicated'],
      clinicalData: {
        age: 38,
        gender: 'Female',
        symptoms: ['chest pain', 'shortness of breath'],
        duration: '2 weeks'
      },
      measurements: [
        {
          name: 'Heart size',
          value: 12.5,
          unit: 'cm',
          normalRange: { min: 10, max: 15 },
          abnormal: false,
          significance: 'normal'
        }
      ],
      observations: ['No acute findings', 'Normal cardiac silhouette'],
      conclusions: ['Normal examination'],
      followUp: ['No follow-up needed unless clinically indicated'],
      images: ['ct-chest-001.dcm', 'ct-chest-002.dcm'],
      charts: [],
      references: ['ACR Appropriateness Criteria']
    },
    metadata: {
      patient: {
        id: 'pat-001',
        name: 'Sarah Johnson',
        age: 38,
        gender: 'Female',
        mrn: 'MRN-78901',
        dateOfBirth: new Date('1985-03-15')
      },
      study: {
        id: 'study-001',
        type: 'CT Chest',
        date: new Date(),
        modality: 'CT',
        location: 'Radiology Department',
        technician: 'Tech-001',
        contrast: true
      },
      physician: {
        primary: 'Dr. Sarah Johnson',
        referring: 'Dr. Michael Smith',
        consulting: []
      },
      facility: {
        name: 'MedSight Medical Center',
        address: '123 Medical Plaza',
        phone: '(555) 123-4567',
        license: 'LIC-001'
      },
      urgency: 'routine',
      priority: 'medium',
      specialty: 'Radiology',
      department: 'Imaging'
    },
    generation: {
      method: 'ai_assisted',
      aiConfidence: 0.88,
      generationTime: 45,
      reviewRequired: true,
      qualityScore: 92
    },
    workflow: {
      createdBy: 'Dr. Sarah Johnson',
      createdAt: new Date(),
      reviewedBy: undefined,
      reviewedAt: undefined,
      approvedBy: undefined,
      approvedAt: undefined,
      signedBy: undefined,
      signedAt: undefined
    },
    versions: [
      {
        id: 'version-001',
        version: '1.0',
        changes: ['Initial draft'],
        createdAt: new Date(),
        createdBy: 'Dr. Sarah Johnson',
        content: {} as ReportContent,
        approved: false
      }
    ],
    attachments: [
      {
        id: 'attachment-001',
        name: 'CT Images',
        type: 'image',
        url: '/images/ct-chest-001.dcm',
        size: 12500000,
        uploadedAt: new Date(),
        uploadedBy: 'Tech-001',
        description: 'CT chest axial images'
      }
    ],
    distribution: {
      recipients: ['Dr. Michael Smith'],
      deliveryMethod: 'email',
      deliveredAt: undefined,
      readBy: []
    },
    compliance: {
      hipaaCompliant: true,
      auditTrail: [
        {
          id: 'audit-001',
          action: 'Report created',
          user: 'Dr. Sarah Johnson',
          timestamp: new Date(),
          details: 'Report generated using AI assistance',
          ipAddress: '192.168.1.100'
        }
      ],
      retentionPolicy: '7 years',
      accessLog: [
        {
          id: 'access-001',
          user: 'Dr. Sarah Johnson',
          action: 'view',
          timestamp: new Date(),
          ipAddress: '192.168.1.100',
          successful: true
        }
      ]
    },
    feedback: []
  };

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call to load templates
    setTimeout(() => {
      setAvailableTemplates(mockTemplates);
      if (templateId) {
        const template = mockTemplates.find(t => t.id === templateId);
        setSelectedTemplate(template || null);
      }
      if (reportId) {
        setCurrentReport(mockReport);
      }
      setIsLoading(false);
    }, 1000);
  }, [templateId, reportId]);

  const filteredTemplates = useMemo(() => {
    return availableTemplates.filter(template => {
      if (filterType !== 'all' && template.type !== filterType) return false;
      if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return template.isActive;
    });
  }, [availableTemplates, filterType, searchTerm]);

  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Simulate AI report generation
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      // Wait for generation to complete
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Create new report
      const newReport: MedicalReport = {
        ...mockReport,
        id: `report-${Date.now()}`,
        templateId: selectedTemplate.id,
        title: `${selectedTemplate.name} - ${mockReport.metadata.patient.name}`,
        type: selectedTemplate.type,
        generation: {
          method: generationMethod,
          aiConfidence: 0.88,
          generationTime: 45,
          reviewRequired: selectedTemplate.compliance.approvalRequired,
          qualityScore: 92
        },
        workflow: {
          createdBy: 'Current User',
          createdAt: new Date(),
          reviewedBy: undefined,
          reviewedAt: undefined,
          approvedBy: undefined,
          approvedAt: undefined,
          signedBy: undefined,
          signedAt: undefined
        }
      };
      
      setCurrentReport(newReport);
      setGenerationProgress(100);
      onReportGenerated?.(newReport);
      
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveReport = () => {
    if (!currentReport) return;
    
    const updatedReport = {
      ...currentReport,
      workflow: {
        ...currentReport.workflow,
        reviewedBy: 'Current User',
        reviewedAt: new Date()
      }
    };
    
    setCurrentReport(updatedReport);
    onReportUpdated?.(updatedReport);
  };

  const handleApproveReport = () => {
    if (!currentReport) return;
    
    const updatedReport = {
      ...currentReport,
      status: 'approved' as const,
      workflow: {
        ...currentReport.workflow,
        approvedBy: 'Current User',
        approvedAt: new Date()
      }
    };
    
    setCurrentReport(updatedReport);
    onReportApproved?.(updatedReport);
  };

  const handleSignReport = () => {
    if (!currentReport) return;
    
    const updatedReport = {
      ...currentReport,
      status: 'signed' as const,
      workflow: {
        ...currentReport.workflow,
        signedBy: 'Current User',
        signedAt: new Date()
      }
    };
    
    setCurrentReport(updatedReport);
    onReportSigned?.(updatedReport);
  };

  const handleSectionEdit = (sectionId: string, content: string) => {
    if (!currentReport) return;
    
    const updatedReport = {
      ...currentReport,
      content: {
        ...currentReport.content,
        sections: {
          ...currentReport.content.sections,
          [sectionId]: content
        }
      }
    };
    
    setCurrentReport(updatedReport);
  };

  const validateReport = () => {
    if (!currentReport || !selectedTemplate) return true;
    
    const errors: { [key: string]: string } = {};
    
    // Check required fields
    selectedTemplate.requiredFields.forEach(field => {
      if (!currentReport.content.sections[field] || currentReport.content.sections[field].trim() === '') {
        errors[field] = 'This field is required';
      }
    });
    
    // Check section validation rules
    selectedTemplate.structure.forEach(section => {
      const content = currentReport.content.sections[section.id];
      if (content) {
        section.content.validationRules.forEach(rule => {
          switch (rule.type) {
            case 'required':
              if (!content.trim()) {
                errors[section.id] = rule.message;
              }
              break;
            case 'length':
              if (rule.parameters.min && content.length < rule.parameters.min) {
                errors[section.id] = rule.message;
              }
              if (rule.parameters.max && content.length > rule.parameters.max) {
                errors[section.id] = rule.message;
              }
              break;
            case 'pattern':
              if (rule.parameters.pattern && !new RegExp(rule.parameters.pattern).test(content)) {
                errors[section.id] = rule.message;
              }
              break;
          }
        });
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getStatusColor = (status: MedicalReport['status']) => {
    switch (status) {
      case 'draft': return 'text-gray-500';
      case 'pending_review': return 'text-medsight-pending';
      case 'approved': return 'text-medsight-normal';
      case 'finalized': return 'text-medsight-primary';
      case 'signed': return 'text-medsight-normal';
      case 'delivered': return 'text-medsight-normal';
      case 'archived': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: MedicalReport['status']) => {
    switch (status) {
      case 'draft': return <PencilIcon className="w-5 h-5 text-gray-500" />;
      case 'pending_review': return <ClockIcon className="w-5 h-5 text-medsight-pending" />;
      case 'approved': return <CheckCircleIcon className="w-5 h-5 text-medsight-normal" />;
      case 'finalized': return <DocumentCheckIcon className="w-5 h-5 text-medsight-primary" />;
      case 'signed': return <DocumentCheckIcon className="w-5 h-5 text-medsight-normal" />;
      case 'delivered': return <PaperAirplaneIcon className="w-5 h-5 text-medsight-normal" />;
      case 'archived': return <DocumentArrowDownIcon className="w-5 h-5 text-gray-400" />;
      default: return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-medsight-primary/20 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-medsight-primary/10 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-medsight-primary/10 rounded"></div>
          </div>
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
            <h1 className="text-2xl font-bold text-medsight-primary mb-2">
              Medical Report Generator
            </h1>
            <p className="text-gray-600">Create and manage clinical reports with AI assistance</p>
          </div>
          
          {currentReport && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(currentReport.status)}
                <span className={`font-medium ${getStatusColor(currentReport.status)}`}>
                  {currentReport.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={handleSaveReport}
                  disabled={!validateReport()}
                  className="btn-medsight bg-medsight-primary text-white disabled:opacity-50"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  Save
                </button>
                
                {currentReport.status === 'draft' && (
                  <button
                    onClick={handleApproveReport}
                    disabled={!validateReport()}
                    className="btn-medsight bg-medsight-normal text-white disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Approve
                  </button>
                )}
                
                {currentReport.status === 'approved' && (
                  <button
                    onClick={handleSignReport}
                    className="btn-medsight bg-medsight-primary text-white"
                  >
                    <DocumentCheckIcon className="w-4 h-4" />
                    Sign
                  </button>
                )}
                
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn-medsight"
                >
                  <EyeIcon className="w-4 h-4" />
                  Preview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'generator', label: 'Generator', icon: DocumentTextIcon },
            { id: 'preview', label: 'Preview', icon: EyeIcon },
            { id: 'templates', label: 'Templates', icon: DocumentDuplicateIcon },
            { id: 'history', label: 'History', icon: ClockIcon },
            { id: 'settings', label: 'Settings', icon: CogIcon }
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
        {/* Generator Tab */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Selection */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Select Template</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="radiology">Radiology</option>
                      <option value="pathology">Pathology</option>
                      <option value="laboratory">Laboratory</option>
                      <option value="clinical">Clinical</option>
                      <option value="surgical">Surgical</option>
                      <option value="discharge">Discharge</option>
                    </select>
                    
                    <div className="flex-1 relative">
                      <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'bg-medsight-primary/10 border-medsight-primary'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">{template.usage.satisfactionScore}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {template.usage.totalGenerated} uses
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Generation Options */}
              {selectedTemplate && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-medium mb-4">Generation Options</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Generation Method
                      </label>
                      <select
                        value={generationMethod}
                        onChange={(e) => setGenerationMethod(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                      >
                        <option value="manual">Manual Entry</option>
                        <option value="ai_assisted">AI Assisted</option>
                        <option value="fully_automated">Fully Automated</option>
                      </select>
                    </div>
                    
                    {generationMethod !== 'manual' && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <SignalIcon className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-900">AI Confidence</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${selectedTemplate.structure[0]?.aiGeneration.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-blue-700">
                            {Math.round((selectedTemplate.structure[0]?.aiGeneration.confidence || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                      className="w-full btn-medsight bg-medsight-primary text-white disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          Generating... ({generationProgress}%)
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <PlusIcon className="w-4 h-4" />
                          Generate Report
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Report Editor */}
            <div className="space-y-4">
              {currentReport && selectedTemplate ? (
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Report Editor</h3>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="btn-medsight"
                    >
                      <PencilIcon className="w-4 h-4" />
                      {editMode ? 'View' : 'Edit'}
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedTemplate.structure.map(section => (
                      <div key={section.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{section.name}</h4>
                          {section.required && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        
                        {editMode ? (
                          <div>
                            <textarea
                              value={currentReport.content.sections[section.id] || ''}
                              onChange={(e) => handleSectionEdit(section.id, e.target.value)}
                              placeholder={section.content.template}
                              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                              rows={4}
                            />
                            {validationErrors[section.id] && (
                              <p className="text-sm text-red-600 mt-1">
                                {validationErrors[section.id]}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {currentReport.content.sections[section.id] || section.content.template}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg border">
                  <div className="text-center text-gray-500">
                    <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No Report Selected</h3>
                    <p>Select a template and generate a report to start editing</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="bg-white p-6 rounded-lg border">
            {currentReport ? (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{currentReport.title}</h2>
                      <p className="text-gray-600">
                        {currentReport.metadata.patient.name} • {currentReport.metadata.patient.mrn}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {currentReport.metadata.study.date.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {currentReport.metadata.facility.name}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Report Content */}
                <div className="space-y-4">
                  {selectedTemplate?.structure.map(section => (
                    <div key={section.id} className="space-y-2">
                      <h3 className="font-medium text-gray-900 border-b pb-1">
                        {section.name}
                      </h3>
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {currentReport.content.sections[section.id] || 'No content'}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Report Footer */}
                <div className="border-t pt-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <div>
                      <p>Generated by: {currentReport.workflow.createdBy}</p>
                      <p>Date: {currentReport.workflow.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p>AI Confidence: {Math.round(currentReport.generation.aiConfidence * 100)}%</p>
                      <p>Quality Score: {currentReport.generation.qualityScore}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <EyeIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Report to Preview</h3>
                <p>Generate a report to see the preview</p>
              </div>
            )}
          </div>
        )}
        
        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            {availableTemplates.map(template => (
              <div key={template.id} className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{template.name}</h3>
                    <p className="text-gray-600">{template.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      template.type === 'radiology' ? 'bg-blue-100 text-blue-800' :
                      template.type === 'pathology' ? 'bg-purple-100 text-purple-800' :
                      template.type === 'laboratory' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {template.type}
                    </span>
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="btn-medsight"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Version:</span>
                    <p className="font-medium">{template.version}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Usage:</span>
                    <p className="font-medium">{template.usage.totalGenerated}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Rating:</span>
                    <p className="font-medium">{template.usage.satisfactionScore}/5</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Updated:</span>
                    <p className="font-medium">{template.updatedAt.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Recent Reports</h3>
            <div className="text-center text-gray-500 py-8">
              <ClipboardDocumentListIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No report history available</p>
            </div>
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Report Generation Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Generation Method
                  </label>
                  <select className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent">
                    <option value="ai_assisted">AI Assisted</option>
                    <option value="manual">Manual Entry</option>
                    <option value="fully_automated">Fully Automated</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Threshold
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="85"
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-save"
                  className="rounded border-gray-300 text-medsight-primary focus:ring-medsight-primary"
                />
                <label htmlFor="auto-save" className="text-sm text-gray-700">
                  Auto-save reports during generation
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="spell-check"
                  className="rounded border-gray-300 text-medsight-primary focus:ring-medsight-primary"
                />
                <label htmlFor="spell-check" className="text-sm text-gray-700">
                  Enable spell check
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="peer-review"
                  className="rounded border-gray-300 text-medsight-primary focus:ring-medsight-primary"
                />
                <label htmlFor="peer-review" className="text-sm text-gray-700">
                  Require peer review for AI-generated reports
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 