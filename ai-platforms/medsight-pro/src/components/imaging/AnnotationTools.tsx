'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  ArrowRightIcon,
  StarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  HeartIcon,
  BeakerIcon,
  CpuChipIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  FireIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  UserGroupIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  TagIcon,
  BookmarkIcon,
  FlagIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  MinusIcon,
  Cog6ToothIcon,
  PaintBrushIcon,
  SwatchIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationCircleIcon,
  HandRaisedIcon,
  BugAntIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  Square2StackIcon,
  RectangleStackIcon,
  CircleStackIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  CursorArrowRaysIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  DocumentTextIcon as DocumentTextIconSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
  ArrowRightIcon as ArrowRightIconSolid,
  StarIcon as StarIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  HeartIcon as HeartIconSolid,
  EyeIcon as EyeIconSolid,
  CheckIcon as CheckIconSolid,
  FlagIcon as FlagIconSolid
} from '@heroicons/react/24/solid';
import React from 'react';

interface Point2D {
  x: number;
  y: number;
}

interface AnnotationBase {
  id: string;
  type: string;
  text: string;
  position: Point2D;
  createdAt: Date;
  createdBy: string;
  modifiedAt?: Date;
  modifiedBy?: string;
  visible: boolean;
  color: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth: number;
  opacity: number;
  imageId?: string;
  seriesId?: string;
  studyId?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  tags: string[];
  isPrivate: boolean;
  linkedAnnotations?: string[];
  attachments?: string[];
}

interface TextAnnotation extends AnnotationBase {
  type: 'text';
  textAlign: 'left' | 'center' | 'right';
  textStyle: 'normal' | 'italic';
  multiLine: boolean;
  wordWrap: boolean;
  maxWidth?: number;
}

interface ArrowAnnotation extends AnnotationBase {
  type: 'arrow';
  endPosition: Point2D;
  arrowStyle: 'simple' | 'filled' | 'curved';
  arrowSize: number;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  lineWidth: number;
}

interface ShapeAnnotation extends AnnotationBase {
  type: 'rectangle' | 'circle' | 'ellipse' | 'polygon';
  points: Point2D[];
  filled: boolean;
  fillColor?: string;
  fillOpacity: number;
}

interface CalloutAnnotation extends AnnotationBase {
  type: 'callout';
  targetPosition: Point2D;
  calloutStyle: 'speech' | 'thought' | 'rectangular';
  cornerRadius: number;
  tailLength: number;
  tailWidth: number;
}

interface BookmarkAnnotation extends AnnotationBase {
  type: 'bookmark';
  bookmarkType: 'finding' | 'measurement' | 'reference' | 'question' | 'todo';
  importance: number; // 1-5 scale
  isResolved: boolean;
  linkedMeasurements?: string[];
}

type Annotation = TextAnnotation | ArrowAnnotation | ShapeAnnotation | CalloutAnnotation | BookmarkAnnotation;

interface AnnotationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  icon: any;
  defaultText: string;
  defaultStyle: Partial<AnnotationBase>;
  medicalContext?: string;
  suggestedUse?: string;
}

interface CollaborationState {
  activeUsers: Array<{
    id: string;
    name: string;
    color: string;
    lastActivity: Date;
    cursor?: Point2D;
  }>;
  sharedSession: boolean;
  sessionId?: string;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canShare: boolean;
  };
}

interface AnnotationToolsProps {
  annotations: Annotation[];
  onAnnotationAdd: (annotation: Annotation) => void;
  onAnnotationUpdate: (id: string, updates: Partial<Annotation>) => void;
  onAnnotationDelete: (id: string) => void;
  onAnnotationSelect?: (id: string | null) => void;
  selectedAnnotationId?: string | null;
  collaboration?: CollaborationState;
  onCollaborationUpdate?: (state: CollaborationState) => void;
  modality?: string;
  anatomicalRegion?: string;
  className?: string;
  readOnly?: boolean;
  showTemplates?: boolean;
  showCollaboration?: boolean;
  enablePrivateAnnotations?: boolean;
  currentUser?: string;
  userRole?: 'radiologist' | 'resident' | 'technician' | 'student' | 'admin';
}

export default function AnnotationTools({
  annotations,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
  onAnnotationSelect,
  selectedAnnotationId,
  collaboration,
  onCollaborationUpdate,
  modality = 'CT',
  anatomicalRegion = 'General',
  className = '',
  readOnly = false,
  showTemplates = true,
  showCollaboration = true,
  enablePrivateAnnotations = true,
  currentUser = 'Dr. User',
  userRole = 'radiologist'
}: AnnotationToolsProps) {
  const [activeTool, setActiveTool] = useState<string>('text');
  const [showTemplatesPanel, setShowTemplatesPanel] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'category' | 'priority' | 'status' | 'user' | 'date' | 'none'>('category');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'text' | 'user'>('date');
  const [showOnlyVisible, setShowOnlyVisible] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const annotationTools = [
    {
      id: 'text',
      name: 'Text',
      icon: DocumentTextIconSolid,
      description: 'Add text annotation',
      cursor: 'text',
      category: 'basic'
    },
    {
      id: 'arrow',
      name: 'Arrow',
      icon: ArrowRightIconSolid,
      description: 'Point to specific area',
      cursor: 'crosshair',
      category: 'basic'
    },
    {
      id: 'callout',
      name: 'Callout',
      icon: ChatBubbleLeftIconSolid,
      description: 'Speech bubble annotation',
      cursor: 'crosshair',
      category: 'basic'
    },
    {
      id: 'rectangle',
      name: 'Rectangle',
      icon: Square2StackIcon,
      description: 'Rectangular annotation',
      cursor: 'crosshair',
      category: 'shapes'
    },
    {
      id: 'circle',
      name: 'Circle',
      icon: CircleStackIcon,
      description: 'Circular annotation',
      cursor: 'crosshair',
      category: 'shapes'
    },
    {
      id: 'bookmark',
      name: 'Bookmark',
      icon: BookmarkIcon,
      description: 'Mark important findings',
      cursor: 'crosshair',
      category: 'medical'
    }
  ];

  const annotationTemplates: AnnotationTemplate[] = [
    {
      id: 'finding_normal',
      name: 'Normal Finding',
      description: 'Mark normal anatomical structure',
      category: 'Findings',
      type: 'text',
      icon: CheckIconSolid,
      defaultText: 'Normal',
      defaultStyle: {
        color: '#10b981',
        priority: 'low',
        category: 'finding',
        tags: ['normal', 'anatomy']
      },
      medicalContext: 'Use to mark normal anatomical structures or findings',
      suggestedUse: 'Teaching, reference, quality assurance'
    },
    {
      id: 'finding_abnormal',
      name: 'Abnormal Finding',
      description: 'Mark abnormal or pathological finding',
      category: 'Findings',
      type: 'callout',
      icon: ExclamationTriangleIconSolid,
      defaultText: 'Abnormal finding - requires attention',
      defaultStyle: {
        color: '#ef4444',
        priority: 'high',
        category: 'finding',
        tags: ['abnormal', 'pathology']
      },
      medicalContext: 'Mark pathological findings requiring attention',
      suggestedUse: 'Diagnostic reporting, case review'
    },
    {
      id: 'cardiac_structure',
      name: 'Cardiac Structure',
      description: 'Label cardiac anatomy',
      category: 'Anatomy',
      type: 'arrow',
      icon: HeartIconSolid,
      defaultText: 'Cardiac structure',
      defaultStyle: {
        color: '#ff0000',
        priority: 'medium',
        category: 'anatomy',
        tags: ['cardiac', 'heart']
      },
      medicalContext: 'Label cardiac chambers, vessels, valves',
      suggestedUse: 'Cardiac imaging, teaching'
    },
    {
      id: 'brain_anatomy',
      name: 'Brain Anatomy',
      description: 'Label brain structures',
      category: 'Anatomy',
      type: 'text',
      icon: CpuChipIcon,
      defaultText: 'Brain structure',
      defaultStyle: {
        color: '#0ea5e9',
        priority: 'medium',
        category: 'anatomy',
        tags: ['brain', 'neuro']
      },
      medicalContext: 'Label brain regions, ventricles, cortex',
      suggestedUse: 'Neuroimaging, teaching'
    },
    {
      id: 'lung_finding',
      name: 'Pulmonary Finding',
      description: 'Mark lung pathology',
      category: 'Findings',
      type: 'rectangle',
      icon: BeakerIcon,
      defaultText: 'Lung finding',
      defaultStyle: {
        color: '#06b6d4',
        priority: 'medium',
        category: 'finding',
        tags: ['lung', 'pulmonary']
      },
      medicalContext: 'Mark nodules, consolidation, effusion',
      suggestedUse: 'Chest imaging, lung screening'
    },
    {
      id: 'bone_fracture',
      name: 'Bone Fracture',
      description: 'Mark bone fractures',
      category: 'Trauma',
      type: 'arrow',
      icon: AcademicCapIcon,
      defaultText: 'Fracture',
      defaultStyle: {
        color: '#dc2626',
        priority: 'high',
        category: 'trauma',
        tags: ['fracture', 'bone', 'trauma']
      },
      medicalContext: 'Mark bone fractures and breaks',
      suggestedUse: 'Trauma imaging, orthopedic assessment'
    },
    {
      id: 'comparison_prior',
      name: 'Comparison with Prior',
      description: 'Compare with previous study',
      category: 'Comparison',
      type: 'callout',
      icon: RectangleStackIcon,
      defaultText: 'Compare with prior study',
      defaultStyle: {
        color: '#7c3aed',
        priority: 'medium',
        category: 'comparison',
        tags: ['comparison', 'prior', 'temporal']
      },
      medicalContext: 'Note changes from previous imaging',
      suggestedUse: 'Follow-up studies, progression tracking'
    },
    {
      id: 'measurement_reference',
      name: 'Measurement Reference',
      description: 'Reference for measurements',
      category: 'Reference',
      type: 'bookmark',
      icon: StarIconSolid,
      defaultText: 'Measurement landmark',
      defaultStyle: {
        color: '#f59e0b',
        priority: 'medium',
        category: 'reference',
        tags: ['measurement', 'landmark', 'reference']
      },
      medicalContext: 'Mark measurement reference points',
      suggestedUse: 'Quantitative analysis, standardization'
    },
    {
      id: 'teaching_point',
      name: 'Teaching Point',
      description: 'Educational annotation',
      category: 'Education',
      type: 'callout',
      icon: LightBulbIcon,
      defaultText: 'Teaching point',
      defaultStyle: {
        color: '#059669',
        priority: 'low',
        category: 'education',
        tags: ['teaching', 'education', 'learning']
      },
      medicalContext: 'Educational points for teaching',
      suggestedUse: 'Medical education, case presentations'
    },
    {
      id: 'question_unclear',
      name: 'Question/Unclear',
      description: 'Mark uncertain findings',
      category: 'Questions',
      type: 'text',
      icon: QuestionMarkCircleIcon,
      defaultText: 'Question - needs clarification',
      defaultStyle: {
        color: '#f59e0b',
        priority: 'medium',
        category: 'question',
        tags: ['question', 'unclear', 'review']
      },
      medicalContext: 'Mark findings needing clarification',
      suggestedUse: 'Peer review, consultation requests'
    },
    {
      id: 'critical_urgent',
      name: 'Critical/Urgent',
      description: 'Mark critical findings',
      category: 'Critical',
      type: 'callout',
      icon: ExclamationCircleIcon,
      defaultText: 'CRITICAL - Immediate attention required',
      defaultStyle: {
        color: '#dc2626',
        backgroundColor: '#fef2f2',
        priority: 'critical',
        category: 'critical',
        tags: ['critical', 'urgent', 'emergency']
      },
      medicalContext: 'Mark life-threatening findings',
      suggestedUse: 'Emergency cases, critical care'
    }
  ];

  const categories = ['all', ...Array.from(new Set(annotationTemplates.map(t => t.category)))];
  const priorities = ['all', 'low', 'medium', 'high', 'critical'];
  const statuses = ['all', 'draft', 'pending', 'approved', 'rejected'];
  const users = ['all', ...Array.from(new Set(annotations.map(a => a.createdBy)))];

  const filteredAnnotations = annotations.filter(annotation => {
    if (showOnlyVisible && !annotation.visible) return false;
    if (showOnlyMine && annotation.createdBy !== currentUser) return false;
    if (searchTerm && !annotation.text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterCategory !== 'all' && annotation.category !== filterCategory) return false;
    if (filterStatus !== 'all' && annotation.status !== filterStatus) return false;
    if (filterPriority !== 'all' && annotation.priority !== filterPriority) return false;
    if (filterUser !== 'all' && annotation.createdBy !== filterUser) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'text':
        return a.text.localeCompare(b.text);
      case 'user':
        return a.createdBy.localeCompare(b.createdBy);
      default:
        return 0;
    }
  });

  const groupedAnnotations = groupBy === 'none' ? 
    { 'All': filteredAnnotations } : 
    filteredAnnotations.reduce((groups, annotation) => {
      let key: string;
      switch (groupBy) {
        case 'category':
          key = annotation.category || 'Uncategorized';
          break;
        case 'priority':
          key = annotation.priority.charAt(0).toUpperCase() + annotation.priority.slice(1);
          break;
        case 'status':
          key = annotation.status.charAt(0).toUpperCase() + annotation.status.slice(1);
          break;
        case 'user':
          key = annotation.createdBy;
          break;
        case 'date':
          key = annotation.createdAt.toDateString();
          break;
        default:
          key = 'All';
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(annotation);
      return groups;
    }, {} as Record<string, Annotation[]>);

  const calculateStatistics = () => {
    return {
      total: annotations.length,
      visible: annotations.filter(a => a.visible).length,
      byPriority: {
        critical: annotations.filter(a => a.priority === 'critical').length,
        high: annotations.filter(a => a.priority === 'high').length,
        medium: annotations.filter(a => a.priority === 'medium').length,
        low: annotations.filter(a => a.priority === 'low').length
      },
      byStatus: {
        draft: annotations.filter(a => a.status === 'draft').length,
        pending: annotations.filter(a => a.status === 'pending').length,
        approved: annotations.filter(a => a.status === 'approved').length,
        rejected: annotations.filter(a => a.status === 'rejected').length
      },
      byUser: annotations.reduce((acc, a) => {
        acc[a.createdBy] = (acc[a.createdBy] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentlyAdded: annotations.filter(a => 
        (Date.now() - a.createdAt.getTime()) < 24 * 60 * 60 * 1000
      ).length
    };
  };

  const getTemplate = (templateId: string) => {
    return annotationTemplates.find(t => t.id === templateId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'draft': return 'text-slate-600 bg-slate-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const applyTemplate = (template: AnnotationTemplate) => {
    const newAnnotation: Partial<Annotation> = {
      id: `annotation_${Date.now()}`,
      type: template.type as any,
      text: template.defaultText,
      position: { x: 100, y: 100 }, // Default position
      createdAt: new Date(),
      createdBy: currentUser,
      visible: true,
      fontSize: 14,
      fontWeight: 'normal',
      borderWidth: 1,
      opacity: 1,
      isPrivate: false,
      tags: [],
      linkedAnnotations: [],
      attachments: [],
      ...template.defaultStyle
    };

    // Type-specific defaults
    if (template.type === 'text') {
      Object.assign(newAnnotation, {
        textAlign: 'left',
        textStyle: 'normal',
        multiLine: false,
        wordWrap: false
      });
    } else if (template.type === 'arrow') {
      Object.assign(newAnnotation, {
        endPosition: { x: 150, y: 150 },
        arrowStyle: 'simple',
        arrowSize: 10,
        lineStyle: 'solid',
        lineWidth: 2
      });
    } else if (template.type === 'callout') {
      Object.assign(newAnnotation, {
        targetPosition: { x: 150, y: 150 },
        calloutStyle: 'speech',
        cornerRadius: 5,
        tailLength: 20,
        tailWidth: 10
      });
    } else if (template.type === 'bookmark') {
      Object.assign(newAnnotation, {
        bookmarkType: 'finding',
        importance: 3,
        isResolved: false
      });
    }

    onAnnotationAdd(newAnnotation as Annotation);
    setShowTemplatesPanel(false);
    setActiveTool(template.type);
  };

  const updateAnnotationVisibility = (id: string, visible: boolean) => {
    onAnnotationUpdate(id, { visible });
  };

  const updateAnnotationStatus = (id: string, status: Annotation['status']) => {
    onAnnotationUpdate(id, { 
      status,
      modifiedAt: new Date(),
      modifiedBy: currentUser
    });
  };

  const updateAnnotationPriority = (id: string, priority: Annotation['priority']) => {
    onAnnotationUpdate(id, { 
      priority,
      modifiedAt: new Date(),
      modifiedBy: currentUser
    });
  };

  const updateAnnotationText = (id: string, text: string) => {
    onAnnotationUpdate(id, { 
      text,
      modifiedAt: new Date(),
      modifiedBy: currentUser
    });
    setEditingAnnotation(null);
  };

  const deleteAnnotation = (id: string) => {
    if (confirm('Are you sure you want to delete this annotation?')) {
      onAnnotationDelete(id);
    }
  };

  const exportAnnotations = () => {
    const exportData = {
      annotations: filteredAnnotations,
      metadata: {
        modality,
        anatomicalRegion,
        exportDate: new Date().toISOString(),
        exportedBy: currentUser,
        totalCount: annotations.length,
        filteredCount: filteredAnnotations.length
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `annotations_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    let report = `Medical Annotation Report\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `Modality: ${modality}\n`;
    report += `Region: ${anatomicalRegion}\n`;
    report += `Total Annotations: ${filteredAnnotations.length}\n\n`;

    const stats = calculateStatistics();
    report += `Priority Distribution:\n`;
    Object.entries(stats.byPriority).forEach(([priority, count]) => {
      report += `  ${priority.charAt(0).toUpperCase() + priority.slice(1)}: ${count}\n`;
    });
    report += `\n`;

    Object.entries(groupedAnnotations).forEach(([group, annotations]) => {
      report += `${group}:\n`;
      annotations.forEach(annotation => {
        report += `  • [${annotation.priority.toUpperCase()}] ${annotation.text}`;
        if (annotation.createdBy !== currentUser) {
          report += ` (by ${annotation.createdBy})`;
        }
        if (annotation.tags.length > 0) {
          report += ` [${annotation.tags.join(', ')}]`;
        }
        report += `\n`;
      });
      report += `\n`;
    });

    const reportBlob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(reportBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `annotation_report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const canEdit = (annotation: Annotation) => {
    if (readOnly) return false;
    if (annotation.createdBy === currentUser) return true;
    if (userRole === 'admin') return true;
    if (userRole === 'radiologist' && annotation.status === 'pending') return true;
    return false;
  };

  const canDelete = (annotation: Annotation) => {
    if (readOnly) return false;
    if (annotation.createdBy === currentUser) return true;
    if (userRole === 'admin') return true;
    return false;
  };

  const canApprove = (annotation: Annotation) => {
    if (readOnly) return false;
    if (userRole === 'admin' || userRole === 'radiologist') return true;
    return false;
  };

  const statistics = calculateStatistics();

  return (
    <div className={`medsight-control-glass rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-medsight-primary">Annotation Tools</h3>
          <div className="flex items-center space-x-2">
            {showTemplates && (
              <button
                onClick={() => setShowTemplatesPanel(!showTemplatesPanel)}
                className="p-2 rounded-lg hover:bg-slate-100"
                title="Templates"
              >
                <TagIcon className="w-4 h-4" />
              </button>
            )}
            {showCollaboration && collaboration && (
              <button
                onClick={() => setShowCollaborationPanel(!showCollaborationPanel)}
                className="p-2 rounded-lg hover:bg-slate-100"
                title="Collaboration"
              >
                <UserGroupIcon className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-slate-100"
              title="Settings"
            >
              <Cog6ToothIcon className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1">
              <button
                onClick={exportAnnotations}
                className="p-2 rounded-lg hover:bg-slate-100"
                title="Export"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
              </button>
              <button
                onClick={generateReport}
                className="p-2 rounded-lg hover:bg-slate-100"
                title="Generate Report"
              >
                <DocumentTextIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Annotation Tools */}
      {!readOnly && (
        <div className="p-4 border-b border-slate-200">
          <h4 className="font-medium text-slate-900 mb-3">Annotation Tools</h4>
          <div className="grid grid-cols-3 gap-2">
            {annotationTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  activeTool === tool.id
                    ? 'border-medsight-primary bg-medsight-primary/10 text-medsight-primary'
                    : 'border-slate-200 hover:border-medsight-primary/50 text-slate-700'
                }`}
                title={tool.description}
              >
                <tool.icon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      <div className="p-4 border-b border-slate-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-lg font-semibold text-slate-900">{statistics.total}</div>
            <div className="text-xs text-slate-600">Total</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-red-600">{statistics.byPriority.critical + statistics.byPriority.high}</div>
            <div className="text-xs text-slate-600">High Priority</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-yellow-600">{statistics.byStatus.pending}</div>
            <div className="text-xs text-slate-600">Pending</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-green-600">{statistics.byStatus.approved}</div>
            <div className="text-xs text-slate-600">Approved</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 border-b border-slate-200">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search annotations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-medsight"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-slate-300 rounded px-2 py-2 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-xs"
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-xs"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="border border-slate-300 rounded px-2 py-1 text-xs"
            >
              <option value="none">No Grouping</option>
              <option value="category">Group by Category</option>
              <option value="priority">Group by Priority</option>
              <option value="status">Group by Status</option>
              <option value="user">Group by User</option>
              <option value="date">Group by Date</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-slate-300 rounded px-2 py-1 text-xs"
            >
              <option value="date">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="text">Sort by Text</option>
              <option value="user">Sort by User</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showOnlyVisible}
                  onChange={(e) => setShowOnlyVisible(e.target.checked)}
                  className="rounded border-slate-300 text-medsight-primary"
                />
                <span className="text-xs text-slate-600">Visible only</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showOnlyMine}
                  onChange={(e) => setShowOnlyMine(e.target.checked)}
                  className="rounded border-slate-300 text-medsight-primary"
                />
                <span className="text-xs text-slate-600">My annotations</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Annotations List */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedAnnotations).length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No annotations found</p>
            {!readOnly && (
              <p className="text-sm mt-1">Select a tool above to start annotating</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedAnnotations).map(([group, groupAnnotations]) => (
              <div key={group}>
                {groupBy !== 'none' && (
                  <h5 className="font-medium text-slate-900 mb-2 flex items-center">
                    <span>{group}</span>
                    <span className="ml-2 text-xs text-slate-500">({groupAnnotations.length})</span>
                  </h5>
                )}
                <div className="space-y-2">
                  {groupAnnotations.map((annotation) => {
                    const isSelected = selectedAnnotationId === annotation.id;
                    const isEditing = editingAnnotation === annotation.id;

                    return (
                      <div
                        key={annotation.id}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-medsight-primary bg-medsight-primary/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => onAnnotationSelect?.(annotation.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div 
                              className="w-3 h-3 rounded-full mt-1"
                              style={{ backgroundColor: annotation.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium text-slate-500 uppercase">
                                  {annotation.type}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(annotation.priority)}`}>
                                  {annotation.priority}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(annotation.status)}`}>
                                  {annotation.status}
                                </span>
                                {annotation.isPrivate && (
                                  <span className="text-xs text-slate-500" title="Private annotation">
                                    🔒
                                  </span>
                                )}
                              </div>
                              
                              {isEditing ? (
                                <div className="flex items-center space-x-2 mb-2">
                                  <input
                                    type="text"
                                    value={annotation.text}
                                    onChange={(e) => updateAnnotationText(annotation.id, e.target.value)}
                                    className="flex-1 text-sm input-medsight"
                                    autoFocus
                                    onBlur={() => setEditingAnnotation(null)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        setEditingAnnotation(null);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => setEditingAnnotation(null)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckIconSolid className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <p className="text-sm text-slate-900 mb-2">{annotation.text}</p>
                              )}
                              
                              <div className="flex items-center space-x-4 text-xs text-slate-500">
                                <span>By: {annotation.createdBy}</span>
                                <span>{annotation.createdAt.toLocaleDateString()}</span>
                                {annotation.modifiedAt && (
                                  <span>Modified: {annotation.modifiedAt.toLocaleDateString()}</span>
                                )}
                              </div>

                              {annotation.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {annotation.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-slate-100 text-xs rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateAnnotationVisibility(annotation.id, !annotation.visible);
                              }}
                              className="p-1 rounded hover:bg-slate-100"
                              title={annotation.visible ? 'Hide' : 'Show'}
                            >
                              {annotation.visible ? 
                                <EyeIconSolid className="w-4 h-4 text-slate-600" /> : 
                                <EyeIcon className="w-4 h-4 text-slate-400" />
                              }
                            </button>
                            
                            {canApprove(annotation) && annotation.status === 'pending' && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateAnnotationStatus(annotation.id, 'approved');
                                  }}
                                  className="p-1 rounded hover:bg-green-100 text-green-600"
                                  title="Approve"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateAnnotationStatus(annotation.id, 'rejected');
                                  }}
                                  className="p-1 rounded hover:bg-red-100 text-red-600"
                                  title="Reject"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            
                            {canEdit(annotation) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingAnnotation(annotation.id);
                                }}
                                className="p-1 rounded hover:bg-slate-100"
                                title="Edit"
                              >
                                <PencilIcon className="w-4 h-4 text-slate-600" />
                              </button>
                            )}
                            
                            {canDelete(annotation) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAnnotation(annotation.id);
                                }}
                                className="p-1 rounded hover:bg-red-100 text-red-600"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Templates Panel */}
      {showTemplatesPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-5xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Annotation Templates</h3>
              <button 
                onClick={() => setShowTemplatesPanel(false)}
                className="btn-medsight p-2"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-6">
              {categories.slice(1).map(category => {
                const categoryTemplates = annotationTemplates.filter(t => t.category === category);
                
                return (
                  <div key={category}>
                    <h4 className="font-medium text-slate-900 mb-3">{category}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {categoryTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className="p-4 rounded-lg border border-slate-200 hover:border-medsight-primary hover:bg-medsight-primary/5 transition-colors text-left"
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <template.icon className="w-5 h-5 text-medsight-primary" />
                            <span className="font-medium text-slate-900">{template.name}</span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                          {template.medicalContext && (
                            <div className="text-xs text-slate-500 mb-1">
                              <strong>Context:</strong> {template.medicalContext}
                            </div>
                          )}
                          {template.suggestedUse && (
                            <div className="text-xs text-slate-500">
                              <strong>Use:</strong> {template.suggestedUse}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Panel */}
      {showCollaborationPanel && collaboration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Collaboration</h3>
              <button 
                onClick={() => setShowCollaborationPanel(false)}
                className="btn-medsight p-2"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="medsight-ai-glass p-4 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-3">Active Users</h4>
                <div className="space-y-2">
                  {collaboration.activeUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: user.color }}
                      />
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-slate-500">
                        Last active: {user.lastActivity.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="medsight-ai-glass p-4 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-3">Session Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Session ID:</span>
                    <span className="font-mono">{collaboration.sessionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Shared session:</span>
                    <span className={collaboration.sharedSession ? 'text-green-600' : 'text-red-600'}>
                      {collaboration.sharedSession ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="medsight-ai-glass p-4 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-3">Permissions</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(collaboration.permissions).map(([permission, allowed]) => (
                    <div key={permission} className="flex justify-between">
                      <span className="text-slate-600 capitalize">
                        {permission.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>
                      <span className={allowed ? 'text-green-600' : 'text-red-600'}>
                        {allowed ? 'Allowed' : 'Not allowed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 