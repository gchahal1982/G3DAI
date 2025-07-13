'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AcademicCapIcon, 
  DocumentTextIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  TagIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BeakerIcon,
  HeartIcon,
  CpuChipIcon, // Replaces BrainIcon
  EyeIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon, // Replaces RefreshIcon
  PrinterIcon,
  ShareIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  ClockIcon,
  HandRaisedIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
  SparklesIcon,
  CircleStackIcon,
  CommandLineIcon,
  GlobeAltIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  BellIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClipboardIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  ServerIcon,
  CloudIcon,
  LockClosedIcon,
  KeyIcon,
  IdentificationIcon,
  CreditCardIcon,
  BanknotesIcon,
  CalculatorIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  TableCellsIcon,
  ListBulletIcon,
  Squares2X2Icon,
  QrCodeIcon,
  ArchiveBoxIcon,
  InboxIcon,
  PaperClipIcon,
  PhotoIcon,
  VideoCameraIcon, // Replaces VideoIcon
  SpeakerWaveIcon,
  MicrophoneIcon,
  CameraIcon,
  FilmIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ArrowUpOnSquareIcon,
  ArrowDownOnSquareIcon,
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  BackwardIcon,
  ForwardIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  StopCircleIcon,
  SpeakerXMarkIcon,
  Bars3Icon,
  Bars4Icon,
  EllipsisHorizontalIcon,
  EllipsisVerticalIcon,
  HomeIcon,
  MapIcon,
  MapPinIcon,
  GlobeAmericasIcon,
  NoSymbolIcon,
  PowerIcon,
  SignalIcon,
  SignalSlashIcon,
  WifiIcon,
  RocketLaunchIcon,
  FireIcon,
  BoltIcon,
  SunIcon,
  MoonIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  FlagIcon,
  TrophyIcon,
  GiftIcon,
  CakeIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  PuzzlePieceIcon,
  SwatchIcon,
  PaintBrushIcon,
  WrenchIcon,
  Cog6ToothIcon,
  Cog8ToothIcon,
  CodeBracketIcon,
  CodeBracketSquareIcon,
  BugAntIcon,
  MegaphoneIcon,
  ChatBubbleOvalLeftIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  RadioIcon,
  TvIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ServerStackIcon,
  Battery0Icon,
  Battery50Icon,
  Battery100Icon,
  FingerPrintIcon,
  EyeSlashIcon,
  UserCircleIcon,
  UserPlusIcon,
  UserMinusIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface DecisionNode {
  id: string;
  type: 'question' | 'condition' | 'action' | 'recommendation' | 'reference' | 'calculation';
  title: string;
  description: string;
  content: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  confidence: number;
  children: string[];
  parents: string[];
  conditions: DecisionCondition[];
  actions: DecisionAction[];
  references: Reference[];
  metadata: {
    specialty: string;
    category: string;
    tags: string[];
    version: string;
    lastUpdated: Date;
    author: string;
    reviewed: boolean;
    guidelines: string[];
  };
  userInteraction: {
    selected: boolean;
    notes: string;
    timestamp: Date;
    userId: string;
  };
}

interface DecisionCondition {
  id: string;
  parameter: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'in' | 'not_in';
  value: any;
  weight: number;
  required: boolean;
}

interface DecisionAction {
  id: string;
  type: 'medication' | 'procedure' | 'test' | 'referral' | 'monitor' | 'follow_up' | 'alert';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timing: string;
  contraindications: string[];
  precautions: string[];
  alternatives: string[];
  cost: number;
  duration: string;
  frequency: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
}

interface Reference {
  id: string;
  type: 'guideline' | 'study' | 'textbook' | 'journal' | 'database' | 'website';
  title: string;
  authors: string[];
  source: string;
  year: number;
  url?: string;
  doi?: string;
  abstract?: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  relevance: number;
}

interface DecisionTree {
  id: string;
  name: string;
  description: string;
  specialty: string;
  category: string;
  version: string;
  nodes: DecisionNode[];
  rootNodeId: string;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    approvedBy: string;
    guidelines: string[];
    evidenceBase: string[];
    usage: {
      totalUses: number;
      lastUsed: Date;
      averageCompletionTime: number;
      userSatisfaction: number;
    };
  };
  validation: {
    validated: boolean;
    validatedBy: string;
    validatedAt: Date;
    expiresAt: Date;
    accuracy: number;
  };
}

interface ClinicalGuideline {
  id: string;
  title: string;
  organization: string;
  specialty: string;
  category: string;
  version: string;
  summary: string;
  fullText: string;
  keyRecommendations: Recommendation[];
  evidenceBase: Reference[];
  implementation: {
    level: 'institutional' | 'departmental' | 'individual';
    barriers: string[];
    facilitators: string[];
    tools: string[];
  };
  metadata: {
    publishedAt: Date;
    updatedAt: Date;
    nextReviewDate: Date;
    status: 'active' | 'under_review' | 'deprecated' | 'withdrawn';
    endorsements: string[];
    conflicts: string[];
  };
}

interface Recommendation {
  id: string;
  text: string;
  strength: 'strong' | 'conditional' | 'weak';
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  applicability: string;
  exceptions: string[];
  implementation: string;
  monitoring: string;
  alternatives: string[];
}

interface DecisionPath {
  id: string;
  sessionId: string;
  userId: string;
  treeId: string;
  startedAt: Date;
  completedAt?: Date;
  currentNodeId: string;
  visitedNodes: string[];
  selectedOptions: { [nodeId: string]: any };
  recommendations: DecisionAction[];
  rationale: string;
  confidence: number;
  feedback: {
    rating: number;
    comments: string;
    submittedAt: Date;
  };
}

interface PatientContext {
  patientId: string;
  demographics: {
    age: number;
    gender: string;
    ethnicity: string;
    weight: number;
    height: number;
  };
  medicalHistory: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    surgeries: string[];
    familyHistory: string[];
  };
  currentPresentation: {
    chiefComplaint: string;
    symptoms: string[];
    vitalSigns: { [key: string]: number };
    physicalExam: { [key: string]: string };
    labResults: { [key: string]: any };
    imaging: { [key: string]: any };
  };
  riskFactors: {
    cardiovascular: number;
    diabetes: number;
    stroke: number;
    bleeding: number;
    infection: number;
    cancer: number;
  };
}

interface ClinicalDecisionSupportProps {
  patientId?: string;
  patientContext?: PatientContext;
  specialty?: string;
  category?: string;
  onDecisionMade?: (decision: DecisionPath) => void;
  onRecommendationSelected?: (recommendation: DecisionAction) => void;
  onGuidelineViewed?: (guideline: ClinicalGuideline) => void;
  className?: string;
}

export default function ClinicalDecisionSupport({
  patientId,
  patientContext,
  specialty,
  category,
  onDecisionMade,
  onRecommendationSelected,
  onGuidelineViewed,
  className = ''
}: ClinicalDecisionSupportProps) {
  const [availableTrees, setAvailableTrees] = useState<DecisionTree[]>([]);
  const [selectedTree, setSelectedTree] = useState<DecisionTree | null>(null);
  const [currentNode, setCurrentNode] = useState<DecisionNode | null>(null);
  const [decisionPath, setDecisionPath] = useState<DecisionPath | null>(null);
  const [guidelines, setGuidelines] = useState<ClinicalGuideline[]>([]);
  const [activeTab, setActiveTab] = useState<'trees' | 'guidelines' | 'recommendations' | 'history'>('trees');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [selectedRecommendations, setSelectedRecommendations] = useState<DecisionAction[]>([]);
  const [pathHistory, setPathHistory] = useState<DecisionPath[]>([]);

  // Mock data
  const mockDecisionTrees: DecisionTree[] = [
    {
      id: 'tree-001',
      name: 'Chest Pain Evaluation',
      description: 'Evidence-based decision tree for acute chest pain assessment',
      specialty: 'Cardiology',
      category: 'Emergency',
      version: '3.2',
      nodes: [
        {
          id: 'node-001',
          type: 'question',
          title: 'Patient Age and Risk Factors',
          description: 'Assess cardiovascular risk factors',
          content: 'What is the patient\'s age and cardiovascular risk profile?',
          severity: 'high',
          evidenceLevel: 'A',
          confidence: 0.95,
          children: ['node-002', 'node-003'],
          parents: [],
          conditions: [
            {
              id: 'cond-001',
              parameter: 'age',
              operator: '>=',
              value: 50,
              weight: 0.3,
              required: true
            }
          ],
          actions: [],
          references: [
            {
              id: 'ref-001',
              type: 'guideline',
              title: 'AHA/ACC Chest Pain Guidelines',
              authors: ['American Heart Association'],
              source: 'Circulation',
              year: 2023,
              evidenceLevel: 'A',
              relevance: 0.95
            }
          ],
          metadata: {
            specialty: 'Cardiology',
            category: 'Assessment',
            tags: ['chest pain', 'risk factors', 'age'],
            version: '3.2',
            lastUpdated: new Date(),
            author: 'Dr. Sarah Johnson',
            reviewed: true,
            guidelines: ['AHA/ACC Chest Pain Guidelines']
          },
          userInteraction: {
            selected: false,
            notes: '',
            timestamp: new Date(),
            userId: 'user-001'
          }
        },
        {
          id: 'node-002',
          type: 'recommendation',
          title: 'High Risk - Immediate Evaluation',
          description: 'Immediate cardiac evaluation required',
          content: 'Patient requires immediate cardiac evaluation with ECG, cardiac enzymes, and chest imaging',
          severity: 'critical',
          evidenceLevel: 'A',
          confidence: 0.92,
          children: [],
          parents: ['node-001'],
          conditions: [],
          actions: [
            {
              id: 'action-001',
              type: 'test',
              title: 'ECG',
              description: '12-lead electrocardiogram',
              priority: 'urgent',
              timing: 'Immediate',
              contraindications: [],
              precautions: [],
              alternatives: [],
              cost: 150,
              duration: '5 minutes',
              frequency: 'Once',
              evidenceLevel: 'A'
            },
            {
              id: 'action-002',
              type: 'test',
              title: 'Cardiac Enzymes',
              description: 'Troponin I/T, CK-MB',
              priority: 'urgent',
              timing: 'Immediate',
              contraindications: [],
              precautions: [],
              alternatives: [],
              cost: 200,
              duration: '30 minutes',
              frequency: 'Serial',
              evidenceLevel: 'A'
            }
          ],
          references: [],
          metadata: {
            specialty: 'Cardiology',
            category: 'Treatment',
            tags: ['high risk', 'immediate', 'cardiac'],
            version: '3.2',
            lastUpdated: new Date(),
            author: 'Dr. Sarah Johnson',
            reviewed: true,
            guidelines: ['AHA/ACC Chest Pain Guidelines']
          },
          userInteraction: {
            selected: false,
            notes: '',
            timestamp: new Date(),
            userId: 'user-001'
          }
        }
      ],
      rootNodeId: 'node-001',
      metadata: {
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date(),
        createdBy: 'Dr. Sarah Johnson',
        approvedBy: 'Dr. Michael Chen',
        guidelines: ['AHA/ACC Chest Pain Guidelines', 'ESC Guidelines'],
        evidenceBase: ['Systematic reviews', 'RCTs', 'Meta-analyses'],
        usage: {
          totalUses: 1245,
          lastUsed: new Date(),
          averageCompletionTime: 180,
          userSatisfaction: 4.7
        }
      },
      validation: {
        validated: true,
        validatedBy: 'Clinical Guidelines Committee',
        validatedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        accuracy: 0.94
      }
    }
  ];

  const mockGuidelines: ClinicalGuideline[] = [
    {
      id: 'guideline-001',
      title: 'AHA/ACC Guideline for the Management of Patients with Acute Coronary Syndromes',
      organization: 'American Heart Association',
      specialty: 'Cardiology',
      category: 'Acute Care',
      version: '2023',
      summary: 'Comprehensive guidelines for the diagnosis and management of acute coronary syndromes',
      fullText: 'Detailed guideline text...',
      keyRecommendations: [
        {
          id: 'rec-001',
          text: 'All patients with suspected ACS should receive a 12-lead ECG within 10 minutes',
          strength: 'strong',
          evidenceLevel: 'A',
          applicability: 'All patients with chest pain',
          exceptions: ['Patients with obvious non-cardiac chest pain'],
          implementation: 'Institutional protocol required',
          monitoring: 'Quality metrics tracking',
          alternatives: ['Point-of-care ECG']
        }
      ],
      evidenceBase: [
        {
          id: 'evidence-001',
          type: 'study',
          title: 'Early ECG in chest pain patients',
          authors: ['Smith J', 'Johnson K'],
          source: 'NEJM',
          year: 2022,
          evidenceLevel: 'A',
          relevance: 0.95
        }
      ],
      implementation: {
        level: 'institutional',
        barriers: ['Resource limitations', 'Training requirements'],
        facilitators: ['Electronic alerts', 'Protocol integration'],
        tools: ['ECG machines', 'Electronic health records']
      },
      metadata: {
        publishedAt: new Date('2023-01-01'),
        updatedAt: new Date(),
        nextReviewDate: new Date('2025-01-01'),
        status: 'active',
        endorsements: ['ACC', 'AHA', 'ESC'],
        conflicts: []
      }
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setAvailableTrees(mockDecisionTrees);
      setGuidelines(mockGuidelines);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredTrees = useMemo(() => {
    return availableTrees.filter(tree => {
      if (filterSpecialty !== 'all' && tree.specialty !== filterSpecialty) return false;
      if (searchTerm && !tree.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [availableTrees, filterSpecialty, searchTerm]);

  const handleTreeSelection = (tree: DecisionTree) => {
    setSelectedTree(tree);
    const rootNode = tree.nodes.find(n => n.id === tree.rootNodeId);
    setCurrentNode(rootNode || null);
    
    // Initialize decision path
    const newPath: DecisionPath = {
      id: `path-${Date.now()}`,
      sessionId: `session-${Date.now()}`,
      userId: 'current-user',
      treeId: tree.id,
      startedAt: new Date(),
      currentNodeId: tree.rootNodeId,
      visitedNodes: [tree.rootNodeId],
      selectedOptions: {},
      recommendations: [],
      rationale: '',
      confidence: 0,
      feedback: {
        rating: 0,
        comments: '',
        submittedAt: new Date()
      }
    };
    
    setDecisionPath(newPath);
  };

  const handleNodeNavigation = (nodeId: string, selectedValue?: any) => {
    if (!selectedTree || !decisionPath) return;
    
    const node = selectedTree.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // Update decision path
    const updatedPath = {
      ...decisionPath,
      currentNodeId: nodeId,
      visitedNodes: [...decisionPath.visitedNodes, nodeId],
      selectedOptions: {
        ...decisionPath.selectedOptions,
        [decisionPath.currentNodeId]: selectedValue
      }
    };
    
    // If this is a recommendation node, collect actions
    if (node.type === 'recommendation') {
      updatedPath.recommendations = [...updatedPath.recommendations, ...node.actions];
      updatedPath.completedAt = new Date();
    }
    
    setDecisionPath(updatedPath);
    setCurrentNode(node);
    
    if (node.type === 'recommendation') {
      onDecisionMade?.(updatedPath);
    }
  };

  const handleRecommendationSelect = (action: DecisionAction) => {
    setSelectedRecommendations(prev => [...prev, action]);
    onRecommendationSelected?.(action);
  };

  const getEvidenceLevelColor = (level: string) => {
    switch (level) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-medsight-primary/20 rounded w-1/2 mb-4"></div>
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
              Clinical Decision Support
            </h1>
            <p className="text-gray-600">Evidence-based decision trees and clinical guidelines</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className={`btn-medsight ${showEvidence ? 'bg-medsight-primary/20' : ''}`}
            >
              <BookOpenIcon className="w-4 h-4" />
              Evidence
            </button>
            
            <button className="btn-medsight">
              <ShareIcon className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'trees', label: 'Decision Trees', icon: AcademicCapIcon },
            { id: 'guidelines', label: 'Guidelines', icon: DocumentTextIcon },
            { id: 'recommendations', label: 'Recommendations', icon: LightBulbIcon },
            { id: 'history', label: 'History', icon: ClockIcon }
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
        {/* Decision Trees Tab */}
        {activeTab === 'trees' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tree Selection */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Available Decision Trees</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={filterSpecialty}
                      onChange={(e) => setFilterSpecialty(e.target.value)}
                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    >
                      <option value="all">All Specialties</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Pulmonology">Pulmonology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                    
                    <div className="flex-1 relative">
                      <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search decision trees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredTrees.map(tree => (
                    <div
                      key={tree.id}
                      onClick={() => handleTreeSelection(tree)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTree?.id === tree.id
                          ? 'bg-medsight-primary/10 border-medsight-primary'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{tree.name}</h4>
                          <p className="text-sm text-gray-600">{tree.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {tree.specialty}
                            </span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              v{tree.version}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">{tree.metadata.usage.userSatisfaction}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {tree.metadata.usage.totalUses} uses
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Decision Tree Navigator */}
            <div className="space-y-4">
              {selectedTree && currentNode ? (
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Decision Navigator</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getEvidenceLevelColor(currentNode.evidenceLevel)}`}>
                        Level {currentNode.evidenceLevel}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(currentNode.severity)}`}>
                        {currentNode.severity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">{currentNode.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{currentNode.description}</p>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">{currentNode.content}</p>
                      </div>
                    </div>
                    
                    {currentNode.type === 'question' && (
                      <div className="space-y-2">
                        <h5 className="font-medium">Next Steps:</h5>
                        {currentNode.children.map(childId => {
                          const childNode = selectedTree.nodes.find(n => n.id === childId);
                          return childNode ? (
                            <button
                              key={childId}
                              onClick={() => handleNodeNavigation(childId, 'selected')}
                              className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{childNode.title}</span>
                                <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{childNode.description}</p>
                            </button>
                          ) : null;
                        })}
                      </div>
                    )}
                    
                    {currentNode.type === 'recommendation' && (
                      <div className="space-y-3">
                        <h5 className="font-medium">Recommended Actions:</h5>
                        {currentNode.actions.map(action => (
                          <div key={action.id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h6 className="font-medium">{action.title}</h6>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                action.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                action.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {action.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {action.timing} • {action.duration}
                              </span>
                              <button
                                onClick={() => handleRecommendationSelect(action)}
                                className="btn-medsight text-xs"
                              >
                                Select
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg border">
                  <div className="text-center text-gray-500">
                    <AcademicCapIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Select a Decision Tree</h3>
                    <p>Choose a decision tree to start clinical decision support</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Guidelines Tab */}
        {activeTab === 'guidelines' && (
          <div className="space-y-4">
            {guidelines.map(guideline => (
              <div key={guideline.id} className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{guideline.title}</h3>
                    <p className="text-gray-600">{guideline.organization} • {guideline.version}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {guideline.specialty}
                    </span>
                    <button
                      onClick={() => onGuidelineViewed?.(guideline)}
                      className="btn-medsight"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-4">{guideline.summary}</p>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Key Recommendations:</h4>
                  {guideline.keyRecommendations.slice(0, 3).map(rec => (
                    <div key={rec.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getEvidenceLevelColor(rec.evidenceLevel)}`}>
                        {rec.evidenceLevel}
                      </span>
                      <p className="text-sm">{rec.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Selected Recommendations</h3>
            {selectedRecommendations.length > 0 ? (
              <div className="space-y-3">
                {selectedRecommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{rec.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <LightBulbIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No recommendations selected yet</p>
              </div>
            )}
          </div>
        )}
        
        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Decision History</h3>
            <div className="text-center text-gray-500 py-8">
              <ClockIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No decision history available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 