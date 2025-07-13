'use client';

import React, { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  UserGroupIcon, 
  BookOpenIcon, 
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  BellIcon,
  Cog6ToothIcon,
  PhoneIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  TagIcon,
  CalendarIcon,
  StarIcon,
  TrophyIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FireIcon,
  LightBulbIcon,
  LinkIcon,
  PrinterIcon,
  ShareIcon,
  ArchiveBoxIcon,
  AcademicCapIcon as CertificateIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon,
  MapIcon,
  ClockIcon as Clock24Icon,
  CalendarDaysIcon,
  FlagIcon,
  ExclamationCircleIcon,
  QuestionMarkCircleIcon,
  LockClosedIcon,
  EyeSlashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  SignalIcon,
  WifiIcon,
  BoltIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BeakerIcon,
  CommandLineIcon,
  CubeIcon,
  CircleStackIcon,
  ServerIcon,
  CloudIcon,
  ShieldExclamationIcon,
  NoSymbolIcon,
  HandRaisedIcon,
  LightBulbIcon as BulbIcon,
  MegaphoneIcon,
  SunIcon,
  MoonIcon,
  Squares2X2Icon as ViewGridIcon,
  ListBulletIcon as ViewListIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';

import { 
  HeartIcon as HeartSolid,
  UserGroupIcon as UserGroupSolid,
  BookOpenIcon as BookOpenSolid,
  ChartBarIcon as ChartBarSolid,
  ClockIcon as ClockSolid,
  ExclamationTriangleIcon as ExclamationTriangleSolid,
  CheckCircleIcon as CheckCircleSolid,
  XCircleIcon as XCircleSolid,
  InformationCircleIcon as InformationCircleSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightSolid,
  DocumentTextIcon as DocumentTextSolid,
  AcademicCapIcon as AcademicCapSolid,
  ShieldCheckIcon as ShieldCheckSolid,
  CpuChipIcon as CpuChipSolid,
  BellIcon as BellSolid,
  PhoneIcon as PhoneSolid,
  EnvelopeIcon as EnvelopeSolid,
  VideoCameraIcon as VideoCameraSolid,
  TagIcon as TagSolid,
  CalendarIcon as CalendarSolid,
  StarIcon as StarSolid,
  TrophyIcon as TrophySolid,
  PlayIcon as PlaySolid,
  PauseIcon as PauseSolid,
  FireIcon as FireSolid,
  LightBulbIcon as LightBulbSolid,
  AcademicCapIcon as CertificateSolid,
  UserIcon as UserSolid,
  UsersIcon as UsersSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListSolid,
  GlobeAltIcon as GlobeAltSolid,
  DevicePhoneMobileIcon as DevicePhoneMobileSolid,
  ComputerDesktopIcon as ComputerDesktopSolid,
  BuildingOfficeIcon as BuildingOfficeSolid,
  MapIcon as MapSolid,
  CalendarDaysIcon as CalendarDaysSolid,
  FlagIcon as FlagSolid,
  ExclamationCircleIcon as ExclamationCircleSolid,
  QuestionMarkCircleIcon as QuestionMarkCircleSolid,
  LockClosedIcon as LockClosedSolid,
  EyeSlashIcon as EyeSlashSolid,
  SpeakerWaveIcon as SpeakerWaveSolid,
  SpeakerXMarkIcon as SpeakerXMarkSolid,
  SignalIcon as SignalSolid,
  WifiIcon as WifiSolid,
  BoltIcon as BoltSolid,
  SparklesIcon as SparklesSolid,
  RocketLaunchIcon as RocketLaunchSolid,
  BeakerIcon as BeakerSolid,
  CommandLineIcon as CommandLineSolid,
  CubeIcon as CubeSolid,
  CircleStackIcon as CircleStackSolid,
  ServerIcon as ServerSolid,
  CloudIcon as CloudSolid,
  ShieldExclamationIcon as ShieldExclamationSolid,
  NoSymbolIcon as NoSymbolSolid,
  HandRaisedIcon as HandRaisedSolid,
  MegaphoneIcon as MegaphoneSolid,
  SunIcon as SunSolid,
  MoonIcon as MoonSolid
} from '@heroicons/react/24/solid';

// Type definitions
interface SupportTicket {
  id: string;
  title: string;
  description: string;
  priority: 'emergency' | 'high' | 'medium' | 'low';
  category: 'technical' | 'clinical' | 'compliance' | 'training' | 'integration';
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
  requester: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  responseTime?: number;
  resolutionTime?: number;
  satisfactionRating?: number;
  attachments: number;
  urgencyLevel: 'critical' | 'high' | 'normal' | 'low';
  medicalContext?: {
    patientId?: string;
    studyId?: string;
    modalityType?: string;
    urgency?: 'stat' | 'urgent' | 'routine';
  };
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  type: 'clinical' | 'technical' | 'compliance' | 'safety' | 'device_training' | 'simulation';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number;
  cmeCredits: number;
  completionRate: number;
  averageScore: number;
  lastUpdated: Date;
  instructors: string[];
  isRequired: boolean;
  prerequisites: string[];
  tags: string[];
  medicalSpecialty: string[];
  rating: number;
  enrollments: number;
  status: 'draft' | 'published' | 'archived';
  thumbnail?: string;
}

interface SupportAgent {
  id: string;
  name: string;
  role: 'technical' | 'clinical' | 'compliance' | 'training' | 'specialist';
  status: 'available' | 'busy' | 'offline' | 'on_call';
  currentWorkload: number;
  maxWorkload: number;
  expertise: string[];
  languages: string[];
  responseTime: number;
  satisfactionScore: number;
  avatar?: string;
  onlineStatus: 'online' | 'away' | 'offline';
  lastSeen: Date;
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  helpfulCount: number;
  rating: number;
  isPublished: boolean;
  medicalSpecialty?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  relatedArticles: string[];
  attachments: number;
}

interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  satisfactionScore: number;
  activeAgents: number;
  trainingModulesActive: number;
  knowledgeBaseArticles: number;
  emergencyTickets: number;
  slaCompliance: number;
  ticketTrends: Array<{ date: string; count: number }>;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  specialization: string[];
  avatar?: string;
  timezone: string;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  trainingProgress: {
    completedModules: number;
    totalModules: number;
    cmeCredits: number;
    certifications: number;
  };
  supportHistory: {
    totalTickets: number;
    resolvedTickets: number;
    averageRating: number;
  };
}

// Sample data
const sampleTickets: SupportTicket[] = [
  {
    id: 'MED-2024-001',
    title: 'DICOM Viewer Loading Issue',
    description: 'Medical images not loading properly in the DICOM viewer for CT scans',
    priority: 'high',
    category: 'technical',
    status: 'in_progress',
    requester: 'Dr. Sarah Chen',
    assignedTo: 'Tech Support Team',
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T14:20:00'),
    responseTime: 15,
    urgencyLevel: 'high',
    attachments: 2,
    medicalContext: {
      studyId: 'ST-2024-001',
      modalityType: 'CT',
      urgency: 'urgent'
    }
  },
  {
    id: 'MED-2024-002',
    title: 'EMR Integration Authentication',
    description: 'Unable to authenticate with hospital EMR system for patient data sync',
    priority: 'medium',
    category: 'integration',
    status: 'open',
    requester: 'Dr. Michael Rodriguez',
    createdAt: new Date('2024-01-15T09:15:00'),
    updatedAt: new Date('2024-01-15T09:15:00'),
    urgencyLevel: 'normal',
    attachments: 1
  },
  {
    id: 'MED-2024-003',
    title: 'HIPAA Compliance Training',
    description: 'Need updated HIPAA compliance training materials for new staff',
    priority: 'medium',
    category: 'compliance',
    status: 'resolved',
    requester: 'Jane Smith',
    assignedTo: 'Training Department',
    createdAt: new Date('2024-01-14T16:45:00'),
    updatedAt: new Date('2024-01-15T11:30:00'),
    responseTime: 30,
    resolutionTime: 1140,
    satisfactionRating: 4.5,
    urgencyLevel: 'normal',
    attachments: 3
  },
  {
    id: 'MED-2024-004',
    title: 'AI Analysis Engine Error',
    description: 'AI analysis failing for mammography studies with specific error code',
    priority: 'emergency',
    category: 'technical',
    status: 'escalated',
    requester: 'Dr. Emily Johnson',
    assignedTo: 'AI Engineering Team',
    createdAt: new Date('2024-01-15T08:00:00'),
    updatedAt: new Date('2024-01-15T08:30:00'),
    responseTime: 5,
    urgencyLevel: 'critical',
    attachments: 4,
    medicalContext: {
      studyId: 'ST-2024-002',
      modalityType: 'MG',
      urgency: 'stat'
    }
  },
  {
    id: 'MED-2024-005',
    title: 'Clinical Workflow Training',
    description: 'Request for advanced clinical workflow training for radiology department',
    priority: 'low',
    category: 'training',
    status: 'open',
    requester: 'Dr. Robert Lee',
    createdAt: new Date('2024-01-15T13:20:00'),
    updatedAt: new Date('2024-01-15T13:20:00'),
    urgencyLevel: 'low',
    attachments: 0
  }
];

const sampleTrainingModules: TrainingModule[] = [
  {
    id: 'TM-001',
    title: 'Advanced DICOM Fundamentals',
    description: 'Comprehensive training on DICOM standards and implementation',
    type: 'technical',
    category: 'Medical Imaging',
    difficulty: 'intermediate',
    duration: 180,
    cmeCredits: 3,
    completionRate: 87,
    averageScore: 92,
    lastUpdated: new Date('2024-01-10'),
    instructors: ['Dr. Medical Expert', 'Tech Specialist'],
    isRequired: true,
    prerequisites: ['Basic Medical Imaging'],
    tags: ['DICOM', 'Medical Imaging', 'Standards'],
    medicalSpecialty: ['Radiology', 'Pathology'],
    rating: 4.8,
    enrollments: 234,
    status: 'published'
  },
  {
    id: 'TM-002',
    title: 'HIPAA Privacy & Security',
    description: 'Complete HIPAA compliance training for medical professionals',
    type: 'compliance',
    category: 'Regulatory',
    difficulty: 'beginner',
    duration: 120,
    cmeCredits: 2,
    completionRate: 96,
    averageScore: 89,
    lastUpdated: new Date('2024-01-12'),
    instructors: ['Compliance Officer', 'Legal Expert'],
    isRequired: true,
    prerequisites: [],
    tags: ['HIPAA', 'Privacy', 'Compliance'],
    medicalSpecialty: ['All'],
    rating: 4.9,
    enrollments: 567,
    status: 'published'
  },
  {
    id: 'TM-003',
    title: 'AI-Assisted Diagnosis',
    description: 'Learn to effectively use AI tools for medical diagnosis',
    type: 'clinical',
    category: 'Artificial Intelligence',
    difficulty: 'advanced',
    duration: 240,
    cmeCredits: 4,
    completionRate: 72,
    averageScore: 85,
    lastUpdated: new Date('2024-01-08'),
    instructors: ['Dr. AI Specialist', 'Clinical Researcher'],
    isRequired: false,
    prerequisites: ['Medical Imaging Basics', 'Clinical Decision Making'],
    tags: ['AI', 'Diagnosis', 'Machine Learning'],
    medicalSpecialty: ['Radiology', 'Pathology', 'Cardiology'],
    rating: 4.6,
    enrollments: 189,
    status: 'published'
  },
  {
    id: 'TM-004',
    title: 'Emergency Response Protocols',
    description: 'Critical procedures for medical emergencies and system failures',
    type: 'safety',
    category: 'Emergency Medicine',
    difficulty: 'intermediate',
    duration: 90,
    cmeCredits: 1.5,
    completionRate: 91,
    averageScore: 94,
    lastUpdated: new Date('2024-01-14'),
    instructors: ['Emergency Medicine Physician', 'Safety Officer'],
    isRequired: true,
    prerequisites: ['Basic Emergency Care'],
    tags: ['Emergency', 'Safety', 'Protocols'],
    medicalSpecialty: ['Emergency Medicine', 'Critical Care'],
    rating: 4.7,
    enrollments: 342,
    status: 'published'
  },
  {
    id: 'TM-005',
    title: 'Medical Device Integration',
    description: 'Training on integrating medical devices with MedSight Pro platform',
    type: 'device_training',
    category: 'Technology',
    difficulty: 'advanced',
    duration: 300,
    cmeCredits: 5,
    completionRate: 68,
    averageScore: 88,
    lastUpdated: new Date('2024-01-05'),
    instructors: ['Biomedical Engineer', 'Integration Specialist'],
    isRequired: false,
    prerequisites: ['Medical Device Basics', 'System Integration'],
    tags: ['Devices', 'Integration', 'Technology'],
    medicalSpecialty: ['Biomedical Engineering', 'Clinical Engineering'],
    rating: 4.5,
    enrollments: 98,
    status: 'published'
  }
];

const sampleAgents: SupportAgent[] = [
  {
    id: 'agent-001',
    name: 'Dr. Sarah Wilson',
    role: 'clinical',
    status: 'available',
    currentWorkload: 3,
    maxWorkload: 8,
    expertise: ['Clinical Workflows', 'Medical Imaging', 'Diagnosis'],
    languages: ['English', 'Spanish'],
    responseTime: 12,
    satisfactionScore: 4.8,
    onlineStatus: 'online',
    lastSeen: new Date()
  },
  {
    id: 'agent-002',
    name: 'Michael Chen',
    role: 'technical',
    status: 'busy',
    currentWorkload: 6,
    maxWorkload: 8,
    expertise: ['DICOM', 'System Integration', 'AI Platform'],
    languages: ['English', 'Mandarin'],
    responseTime: 8,
    satisfactionScore: 4.9,
    onlineStatus: 'online',
    lastSeen: new Date()
  },
  {
    id: 'agent-003',
    name: 'Jennifer Rodriguez',
    role: 'compliance',
    status: 'available',
    currentWorkload: 2,
    maxWorkload: 6,
    expertise: ['HIPAA', 'FDA Regulations', 'Medical Compliance'],
    languages: ['English', 'Spanish'],
    responseTime: 15,
    satisfactionScore: 4.7,
    onlineStatus: 'online',
    lastSeen: new Date()
  },
  {
    id: 'agent-004',
    name: 'David Kim',
    role: 'training',
    status: 'available',
    currentWorkload: 4,
    maxWorkload: 10,
    expertise: ['Medical Training', 'CME', 'Certification'],
    languages: ['English', 'Korean'],
    responseTime: 20,
    satisfactionScore: 4.6,
    onlineStatus: 'online',
    lastSeen: new Date()
  },
  {
    id: 'agent-005',
    name: 'Dr. Lisa Johnson',
    role: 'specialist',
    status: 'on_call',
    currentWorkload: 1,
    maxWorkload: 5,
    expertise: ['Emergency Support', 'Critical Systems', 'Crisis Management'],
    languages: ['English'],
    responseTime: 5,
    satisfactionScore: 4.9,
    onlineStatus: 'away',
    lastSeen: new Date(Date.now() - 15 * 60 * 1000)
  }
];

const sampleKnowledgeBase: KnowledgeBaseArticle[] = [
  {
    id: 'kb-001',
    title: 'DICOM Image Loading Troubleshooting',
    content: 'Step-by-step guide to resolve DICOM image loading issues',
    category: 'Technical Support',
    tags: ['DICOM', 'Troubleshooting', 'Medical Imaging'],
    author: 'Technical Support Team',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-14'),
    viewCount: 1234,
    helpfulCount: 987,
    rating: 4.5,
    isPublished: true,
    medicalSpecialty: 'Radiology',
    difficulty: 'intermediate',
    estimatedReadTime: 8,
    relatedArticles: ['kb-002', 'kb-003'],
    attachments: 3
  },
  {
    id: 'kb-002',
    title: 'EMR Integration Setup Guide',
    content: 'Complete guide for setting up EMR integration with MedSight Pro',
    category: 'Integration',
    tags: ['EMR', 'Integration', 'Setup'],
    author: 'Integration Team',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-12'),
    viewCount: 856,
    helpfulCount: 743,
    rating: 4.7,
    isPublished: true,
    difficulty: 'advanced',
    estimatedReadTime: 15,
    relatedArticles: ['kb-001', 'kb-004'],
    attachments: 5
  },
  {
    id: 'kb-003',
    title: 'HIPAA Compliance Checklist',
    content: 'Essential HIPAA compliance requirements for medical professionals',
    category: 'Compliance',
    tags: ['HIPAA', 'Compliance', 'Privacy'],
    author: 'Compliance Team',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-13'),
    viewCount: 2156,
    helpfulCount: 1987,
    rating: 4.9,
    isPublished: true,
    medicalSpecialty: 'All',
    difficulty: 'beginner',
    estimatedReadTime: 6,
    relatedArticles: ['kb-005'],
    attachments: 2
  },
  {
    id: 'kb-004',
    title: 'AI Analysis Best Practices',
    content: 'Guide to effectively use AI analysis tools in clinical practice',
    category: 'Clinical',
    tags: ['AI', 'Clinical Practice', 'Best Practices'],
    author: 'Clinical Team',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-15'),
    viewCount: 567,
    helpfulCount: 498,
    rating: 4.6,
    isPublished: true,
    medicalSpecialty: 'Radiology',
    difficulty: 'advanced',
    estimatedReadTime: 12,
    relatedArticles: ['kb-001', 'kb-002'],
    attachments: 4
  },
  {
    id: 'kb-005',
    title: 'Emergency Response Procedures',
    content: 'Critical procedures for handling medical emergencies in digital workflow',
    category: 'Emergency',
    tags: ['Emergency', 'Procedures', 'Safety'],
    author: 'Emergency Response Team',
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-11'),
    viewCount: 934,
    helpfulCount: 876,
    rating: 4.8,
    isPublished: true,
    medicalSpecialty: 'Emergency Medicine',
    difficulty: 'intermediate',
    estimatedReadTime: 10,
    relatedArticles: ['kb-003'],
    attachments: 1
  }
];

const sampleMetrics: SupportMetrics = {
  totalTickets: 1247,
  openTickets: 89,
  resolvedTickets: 1158,
  averageResponseTime: 14.2,
  averageResolutionTime: 324.5,
  satisfactionScore: 4.7,
  activeAgents: 12,
  trainingModulesActive: 45,
  knowledgeBaseArticles: 234,
  emergencyTickets: 3,
  slaCompliance: 96.8,
  ticketTrends: [
    { date: '2024-01-01', count: 23 },
    { date: '2024-01-02', count: 31 },
    { date: '2024-01-03', count: 28 },
    { date: '2024-01-04', count: 35 },
    { date: '2024-01-05', count: 42 },
    { date: '2024-01-06', count: 38 },
    { date: '2024-01-07', count: 29 }
  ],
  categoryDistribution: {
    technical: 45,
    clinical: 25,
    compliance: 15,
    training: 10,
    integration: 5
  },
  priorityDistribution: {
    emergency: 2,
    high: 18,
    medium: 35,
    low: 45
  }
};

const sampleUser: UserProfile = {
  id: 'user-001',
  name: 'Dr. Sarah Chen',
  email: 'sarah.chen@hospital.com',
  role: 'Radiologist',
  department: 'Radiology',
  specialization: ['Diagnostic Radiology', 'Interventional Radiology'],
  timezone: 'America/New_York',
  preferences: {
    notifications: true,
    theme: 'light',
    language: 'en'
  },
  trainingProgress: {
    completedModules: 12,
    totalModules: 15,
    cmeCredits: 24.5,
    certifications: 3
  },
  supportHistory: {
    totalTickets: 23,
    resolvedTickets: 21,
    averageRating: 4.6
  }
};

/**
 * Clinical Support Center Component
 * Comprehensive support interface with helpdesk and training modules
 */
export default function SupportCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'training' | 'knowledge' | 'agents' | 'analytics'>('overview');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedTrainingModule, setSelectedTrainingModule] = useState<TrainingModule | null>(null);
  const [selectedKnowledgeArticle, setSelectedKnowledgeArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Filter tickets based on search and filters
  const filteredTickets = sampleTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.requester.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Filter training modules
  const filteredTrainingModules = sampleTrainingModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Filter knowledge base articles
  const filteredKnowledgeArticles = sampleKnowledgeBase.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'escalated': return 'text-red-600 bg-red-50 border-red-200';
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
      case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get agent status color
  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-50 border-green-200';
      case 'busy': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'offline': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'on_call': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'expert': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Render overview tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleMetrics.openTickets}</p>
            </div>
            <div className="p-3 bg-medsight-primary/10 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-medsight-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-red-500">+12% from last week</span>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleMetrics.averageResponseTime}min</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowDownIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">-8% from last week</span>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Satisfaction Score</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleMetrics.satisfactionScore}/5</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+2% from last week</span>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleMetrics.activeAgents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Online and available</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">Recent Tickets</h3>
          <div className="space-y-4">
            {sampleTickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    ticket.priority === 'emergency' ? 'bg-red-500' :
                    ticket.priority === 'high' ? 'bg-orange-500' :
                    ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{ticket.title}</p>
                    <p className="text-xs text-gray-500">{ticket.requester} • {formatTimeAgo(ticket.createdAt)}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">Training Modules</h3>
          <div className="space-y-4">
            {sampleTrainingModules.slice(0, 5).map((module) => (
              <div key={module.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-medsight-primary/10 rounded-lg">
                    <BookOpenIcon className="h-4 w-4 text-medsight-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{module.title}</p>
                    <p className="text-xs text-gray-500">{module.enrollments} enrolled • {module.cmeCredits} CME</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                    {module.difficulty}
                  </span>
                  <span className="text-xs text-gray-500">{module.completionRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowNewTicketForm(true)}
            className="flex items-center space-x-3 p-4 bg-medsight-primary/10 rounded-lg hover:bg-medsight-primary/20 transition-colors"
          >
            <PlusIcon className="h-5 w-5 text-medsight-primary" />
            <span className="font-medium text-medsight-primary">New Ticket</span>
          </button>
          
          <button
            onClick={() => setActiveTab('training')}
            className="flex items-center space-x-3 p-4 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
          >
            <AcademicCapIcon className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-600">Browse Training</span>
          </button>
          
          <button
            onClick={() => setActiveTab('knowledge')}
            className="flex items-center space-x-3 p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <BookOpenIcon className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-600">Knowledge Base</span>
          </button>
          
          <button
            onClick={() => setActiveTab('agents')}
            className="flex items-center space-x-3 p-4 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-purple-600">Live Chat</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Render tickets tab
  const renderTickets = () => (
    <div className="space-y-6">
      {/* Tickets Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-medsight-primary">Support Tickets</h2>
          <p className="text-gray-600">Manage and track support requests</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
          >
            <Cog6ToothIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setShowNewTicketForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-medsight-primary text-white rounded-lg hover:bg-medsight-primary/90 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
            >
              {viewMode === 'grid' ? <ViewListIcon className="h-5 w-5" /> : <ViewGridIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary"
            >
              <option value="all">All Categories</option>
              <option value="technical">Technical</option>
              <option value="clinical">Clinical</option>
              <option value="compliance">Compliance</option>
              <option value="training">Training</option>
              <option value="integration">Integration</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary"
            >
              <option value="all">All Priorities</option>
              <option value="emergency">Emergency</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary"
            >
              <option value="created-desc">Newest First</option>
              <option value="created-asc">Oldest First</option>
              <option value="priority-desc">High Priority First</option>
              <option value="updated-desc">Recently Updated</option>
            </select>
          </div>
        )}
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="medsight-glass p-6 rounded-xl cursor-pointer hover:bg-white/60 transition-colors"
            onClick={() => setSelectedTicket(ticket)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-mono text-sm text-gray-500">{ticket.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  {ticket.medicalContext && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-medsight-primary/10 text-medsight-primary">
                      {ticket.medicalContext.modalityType}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.title}</h3>
                <p className="text-gray-600 mb-3">{ticket.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <UserIcon className="h-4 w-4" />
                    <span>{ticket.requester}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatTimeAgo(ticket.createdAt)}</span>
                  </span>
                  {ticket.assignedTo && (
                    <span className="flex items-center space-x-1">
                      <UserGroupIcon className="h-4 w-4" />
                      <span>{ticket.assignedTo}</span>
                    </span>
                  )}
                  {ticket.attachments > 0 && (
                    <span className="flex items-center space-x-1">
                      <PaperClipIcon className="h-4 w-4" />
                      <span>{ticket.attachments} files</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {ticket.urgencyLevel === 'critical' && (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                )}
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No tickets found matching your search criteria.</p>
        </div>
      )}
    </div>
  );

  // Render training tab
  const renderTraining = () => (
    <div className="space-y-6">
      {/* Training Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-medsight-primary">Training Center</h2>
          <p className="text-gray-600">Access medical training modules and certifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
            <AcademicCapIcon className="h-4 w-4" />
            <span>My Certifications</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-medsight-primary text-white rounded-lg hover:bg-medsight-primary/90 transition-colors">
            <PlusIcon className="h-4 w-4" />
            <span>Enroll in Training</span>
          </button>
        </div>
      </div>

      {/* Training Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Modules</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleUser.trainingProgress.completedModules}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round((sampleUser.trainingProgress.completedModules / sampleUser.trainingProgress.totalModules) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${(sampleUser.trainingProgress.completedModules / sampleUser.trainingProgress.totalModules) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CME Credits</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleUser.trainingProgress.cmeCredits}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <TrophyIcon className="h-4 w-4 mr-1" />
            <span>Earned this year</span>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certifications</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleUser.trainingProgress.certifications}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <ShieldCheckIcon className="h-4 w-4 mr-1" />
            <span>Active certifications</span>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Training Hours</p>
              <p className="text-2xl font-bold text-medsight-primary">156</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>This year</span>
          </div>
        </div>
      </div>

      {/* Search Training */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search training modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary"
            />
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary">
            <option value="all">All Categories</option>
            <option value="clinical">Clinical</option>
            <option value="technical">Technical</option>
            <option value="compliance">Compliance</option>
            <option value="safety">Safety</option>
            <option value="device_training">Device Training</option>
            <option value="simulation">Simulation</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary">
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Training Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainingModules.map((module) => (
          <div
            key={module.id}
            className="medsight-glass p-6 rounded-xl cursor-pointer hover:bg-white/60 transition-colors"
            onClick={() => setSelectedTrainingModule(module)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                  {module.difficulty}
                </span>
                {module.isRequired && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                    Required
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <StarIcon className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">{module.rating}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
            <p className="text-gray-600 mb-4">{module.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">{formatDuration(module.duration)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">CME Credits</span>
                <span className="font-medium">{module.cmeCredits}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Completion Rate</span>
                <span className="font-medium">{module.completionRate}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Enrollments</span>
                <span className="font-medium">{module.enrollments}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{module.instructors[0]}</span>
                  </div>
                </div>
                <button className="flex items-center space-x-1 text-medsight-primary hover:text-medsight-primary/80 transition-colors">
                  <PlayIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Start</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render knowledge base tab
  const renderKnowledgeBase = () => (
    <div className="space-y-6">
      {/* Knowledge Base Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-medsight-primary">Knowledge Base</h2>
          <p className="text-gray-600">Find answers to common questions and browse documentation</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
            <BookOpenIcon className="h-4 w-4" />
            <span>Browse All</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-medsight-primary text-white rounded-lg hover:bg-medsight-primary/90 transition-colors">
            <PlusIcon className="h-4 w-4" />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* Knowledge Base Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Articles</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleMetrics.knowledgeBaseArticles}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Views This Month</p>
              <p className="text-2xl font-bold text-medsight-primary">12,456</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <EyeIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-medsight-primary">4.6</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Updated This Week</p>
              <p className="text-2xl font-bold text-medsight-primary">23</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <PencilIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Knowledge Base */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary"
            />
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary">
            <option value="all">All Categories</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Clinical">Clinical</option>
            <option value="Compliance">Compliance</option>
            <option value="Integration">Integration</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
      </div>

      {/* Popular Articles */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">Popular Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleKnowledgeBase.slice(0, 6).map((article) => (
            <div
              key={article.id}
              className="p-4 bg-white/50 rounded-lg cursor-pointer hover:bg-white/70 transition-colors"
              onClick={() => setSelectedKnowledgeArticle(article)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm">{article.title}</h4>
                <span className="text-xs text-gray-500">{article.viewCount} views</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{article.content.substring(0, 100)}...</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <StarIcon className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-gray-500">{article.rating}</span>
                </div>
                <span className="text-xs text-gray-500">{article.estimatedReadTime}min read</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Base Articles List */}
      <div className="space-y-4">
        {filteredKnowledgeArticles.map((article) => (
          <div
            key={article.id}
            className="medsight-glass p-6 rounded-xl cursor-pointer hover:bg-white/60 transition-colors"
            onClick={() => setSelectedKnowledgeArticle(article)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                    {article.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(article.difficulty)}`}>
                    {article.difficulty}
                  </span>
                  {article.medicalSpecialty && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-medsight-primary/10 text-medsight-primary">
                      {article.medicalSpecialty}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-3">{article.content.substring(0, 200)}...</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <UserIcon className="h-4 w-4" />
                    <span>{article.author}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{article.estimatedReadTime}min read</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>{article.viewCount} views</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4" />
                    <span>{article.rating}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render agents tab
  const renderAgents = () => (
    <div className="space-y-6">
      {/* Agents Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-medsight-primary">Support Agents</h2>
          <p className="text-gray-600">Connect with our medical support specialists</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
            <PhoneIcon className="h-4 w-4" />
            <span>Emergency Line</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-medsight-primary text-white rounded-lg hover:bg-medsight-primary/90 transition-colors">
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            <span>Start Chat</span>
          </button>
        </div>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Agents</p>
              <p className="text-2xl font-bold text-medsight-primary">
                {sampleAgents.filter(agent => agent.status === 'available').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-medsight-primary">
                {Math.round(sampleAgents.reduce((sum, agent) => sum + agent.responseTime, 0) / sampleAgents.length)}min
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Satisfaction Score</p>
              <p className="text-2xl font-bold text-medsight-primary">
                {(sampleAgents.reduce((sum, agent) => sum + agent.satisfactionScore, 0) / sampleAgents.length).toFixed(1)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emergency Support</p>
              <p className="text-2xl font-bold text-medsight-primary">24/7</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <PhoneIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleAgents.map((agent) => (
          <div key={agent.id} className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-medsight-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{agent.role} Specialist</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAgentStatusColor(agent.status)}`}>
                  {agent.status.replace('_', ' ')}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  agent.onlineStatus === 'online' ? 'bg-green-500' :
                  agent.onlineStatus === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Expertise</p>
                <div className="flex flex-wrap gap-1">
                  {agent.expertise.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-medsight-primary/10 text-medsight-primary text-xs rounded">
                      {skill}
                    </span>
                  ))}
                  {agent.expertise.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{agent.expertise.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Response Time</span>
                <span className="font-medium">{agent.responseTime}min</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Satisfaction</span>
                <div className="flex items-center space-x-1">
                  <StarIcon className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{agent.satisfactionScore}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Current Load</span>
                <span className="font-medium">{agent.currentWorkload}/{agent.maxWorkload}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Languages</span>
                <span className="font-medium">{agent.languages.join(', ')}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  disabled={agent.status === 'offline'}
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    agent.status === 'offline' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-medsight-primary text-white hover:bg-medsight-primary/90'
                  }`}
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  <span>Chat</span>
                </button>
                <button
                  disabled={agent.status === 'offline'}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    agent.status === 'offline' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  }`}
                >
                  <PhoneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render analytics tab
  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-medsight-primary">Support Analytics</h2>
          <p className="text-gray-600">Track performance metrics and trends</p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-medsight-primary text-white rounded-lg hover:bg-medsight-primary/90 transition-colors">
            <ArrowDownIcon className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleMetrics.totalTickets}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+8% from last month</span>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-bold text-medsight-primary">
                {Math.round((sampleMetrics.resolvedTickets / sampleMetrics.totalTickets) * 100)}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+5% from last month</span>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">SLA Compliance</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleMetrics.slaCompliance}%</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+2% from last month</span>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emergency Tickets</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleMetrics.emergencyTickets}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-red-500">-3% from last month</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">Ticket Trends</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Ticket trends chart would be rendered here</p>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-primary mb-4">Category Distribution</h3>
          <div className="space-y-3">
            {Object.entries(sampleMetrics.categoryDistribution).map(([category, percentage]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-medsight-primary h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">Priority Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.entries(sampleMetrics.priorityDistribution).map(([priority, percentage]) => (
            <div key={priority} className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                priority === 'emergency' ? 'bg-red-100' :
                priority === 'high' ? 'bg-orange-100' :
                priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <span className={`text-2xl font-bold ${
                  priority === 'emergency' ? 'text-red-600' :
                  priority === 'high' ? 'text-orange-600' :
                  priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {percentage}%
                </span>
              </div>
              <p className="text-sm text-gray-600 capitalize">{priority}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-medsight-primary">Clinical Support Center</h1>
              <p className="text-gray-600 mt-1">Comprehensive support for medical professionals</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BellIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">3 new notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">System operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'tickets', label: 'Support Tickets', icon: ClipboardDocumentListIcon },
              { id: 'training', label: 'Training Center', icon: AcademicCapIcon },
              { id: 'knowledge', label: 'Knowledge Base', icon: BookOpenIcon },
              { id: 'agents', label: 'Support Agents', icon: UserGroupIcon },
              { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-medsight-primary text-white'
                    : 'text-gray-600 hover:text-medsight-primary hover:bg-medsight-primary/10'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'tickets' && renderTickets()}
          {activeTab === 'training' && renderTraining()}
          {activeTab === 'knowledge' && renderKnowledgeBase()}
          {activeTab === 'agents' && renderAgents()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </div>
    </div>
  );
} 