'use client';

import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon,
  BookOpenIcon,
  AcademicCapIcon as CertificateIcon,
  ChartBarIcon,
  ClockIcon,
  TrophyIcon,
  StarIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  UsersIcon,
  CalendarIcon,
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FireIcon,
  LightBulbIcon,
  BeakerIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  HeartIcon,
  BoltIcon,
  SparklesIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CloudIcon,
  ServerIcon,
  CubeIcon,
  CircleStackIcon,
  CommandLineIcon,
  Cog6ToothIcon,
  BellIcon,
  EnvelopeIcon,
  PhoneIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  ShareIcon,
  PrinterIcon,
  LinkIcon,
  BuildingOfficeIcon,
  MapIcon,
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
  HandRaisedIcon,
  NoSymbolIcon,
  ShieldExclamationIcon,
  MegaphoneIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

import { 
  AcademicCapIcon as AcademicCapSolid,
  BookOpenIcon as BookOpenSolid,
  AcademicCapIcon as CertificateSolid,
  ChartBarIcon as ChartBarSolid,
  ClockIcon as ClockSolid,
  TrophyIcon as TrophySolid,
  StarIcon as StarSolid,
  PlayIcon as PlaySolid,
  PauseIcon as PauseSolid,
  CheckCircleIcon as CheckCircleSolid,
  XCircleIcon as XCircleSolid,
  ExclamationTriangleIcon as ExclamationTriangleSolid,
  InformationCircleIcon as InformationCircleSolid,
  UserIcon as UserSolid,
  UsersIcon as UsersSolid,
  CalendarIcon as CalendarSolid,
  TagIcon as TagSolid,
  FireIcon as FireSolid,
  LightBulbIcon as LightBulbSolid,
  BeakerIcon as BeakerSolid,
  CpuChipIcon as CpuChipSolid,
  ShieldCheckIcon as ShieldCheckSolid,
  HeartIcon as HeartSolid,
  BoltIcon as BoltSolid,
  SparklesIcon as SparklesSolid,
  RocketLaunchIcon as RocketLaunchSolid,
  GlobeAltIcon as GlobeAltSolid,
  DevicePhoneMobileIcon as DevicePhoneMobileSolid,
  ComputerDesktopIcon as ComputerDesktopSolid,
  CloudIcon as CloudSolid,
  ServerIcon as ServerSolid,
  CubeIcon as CubeSolid,
  CircleStackIcon as CircleStackSolid,
  CommandLineIcon as CommandLineSolid,
  BellIcon as BellSolid,
  EnvelopeIcon as EnvelopeSolid,
  PhoneIcon as PhoneSolid,
  VideoCameraIcon as VideoCameraSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightSolid,
  DocumentTextIcon as DocumentTextSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListSolid,
  ArchiveBoxIcon as ArchiveBoxSolid,
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
  HandRaisedIcon as HandRaisedSolid,
  NoSymbolIcon as NoSymbolSolid,
  ShieldExclamationIcon as ShieldExclamationSolid,
  MegaphoneIcon as MegaphoneSolid,
  SunIcon as SunSolid,
  MoonIcon as MoonSolid
} from '@heroicons/react/24/solid';

// Type definitions
interface TrainingModule {
  id: string;
  title: string;
  description: string;
  type: 'clinical' | 'technical' | 'compliance' | 'safety' | 'device_training' | 'simulation';
  category: string;
  subcategory: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number;
  estimatedTime: number;
  cmeCredits: number;
  completionRate: number;
  averageScore: number;
  passingScore: number;
  lastUpdated: Date;
  createdAt: Date;
  instructors: string[];
  isRequired: boolean;
  prerequisites: string[];
  tags: string[];
  medicalSpecialty: string[];
  rating: number;
  enrollments: number;
  status: 'draft' | 'published' | 'archived';
  thumbnail?: string;
  videoContent: number;
  interactiveContent: number;
  assessments: number;
  simulations: number;
  certificationEarned?: string;
  renewalPeriod?: number;
  complianceLevel: 'basic' | 'enhanced' | 'advanced';
  accessLevel: 'public' | 'internal' | 'restricted';
  languages: string[];
  deviceCompatibility: string[];
  offlineAvailable: boolean;
  progressTracking: boolean;
  collaborativeFeatures: boolean;
  gamificationElements: boolean;
  virtualReality: boolean;
  augmentedReality: boolean;
  mobileOptimized: boolean;
  accessibility: boolean;
  analytics: ModuleAnalytics;
  feedback: ModuleFeedback[];
  reviews: ModuleReview[];
}

interface ModuleAnalytics {
  totalViews: number;
  completions: number;
  averageTimeSpent: number;
  dropoutRate: number;
  engagementScore: number;
  knowledgeRetention: number;
  skillImprovement: number;
  certificationRate: number;
  retakeRate: number;
  satisfactionScore: number;
}

interface ModuleFeedback {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  helpful: boolean;
  timestamp: Date;
  category: 'content' | 'difficulty' | 'instructor' | 'technical' | 'overall';
  verified: boolean;
}

interface ModuleReview {
  id: string;
  reviewer: string;
  rating: number;
  review: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  completionDate: Date;
  helpfulVotes: number;
  totalVotes: number;
}

interface UserProgress {
  moduleId: string;
  userId: string;
  progress: number;
  currentLesson: number;
  totalLessons: number;
  timeSpent: number;
  lastAccessed: Date;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  attempts: number;
  bookmarks: number;
  notes: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'expired';
  certificateEarned?: string;
  nextReviewDate?: Date;
}

interface Certification {
  id: string;
  name: string;
  description: string;
  issuer: string;
  type: 'completion' | 'competency' | 'cme' | 'board' | 'specialty';
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  validityPeriod: number;
  renewalRequired: boolean;
  cmeCredits: number;
  requirements: string[];
  badges: string[];
  verificationId: string;
  blockchainVerified: boolean;
  socialSharing: boolean;
  printable: boolean;
  digitalWallet: boolean;
  industryRecognition: string[];
  careerBenefits: string[];
  salaryImpact: string;
  jobMarketDemand: string;
  skillsValidated: string[];
  competenciesEarned: string[];
  continuingEducation: string[];
  recertificationPath: string[];
}

interface TrainingPath {
  id: string;
  name: string;
  description: string;
  category: string;
  specialization: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number;
  modules: string[];
  prerequisites: string[];
  certifications: string[];
  cmeCredits: number;
  completionRate: number;
  enrollments: number;
  rating: number;
  featured: boolean;
  trending: boolean;
  newRelease: boolean;
  lastUpdated: Date;
  estimatedSalaryIncrease: string;
  careerOutcomes: string[];
  skillsGained: string[];
  jobRoles: string[];
  industryPartners: string[];
  mentorshipAvailable: boolean;
  cohortLearning: boolean;
  personalizedPath: boolean;
  adaptiveLearning: boolean;
}

interface LearningAnalytics {
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  totalCMECredits: number;
  earnedCMECredits: number;
  averageScore: number;
  totalTimeSpent: number;
  certifications: number;
  completionRate: number;
  engagementScore: number;
  knowledgeRetention: number;
  skillImprovement: number;
  careerProgression: number;
  goals: LearningGoal[];
  achievements: Achievement[];
  badges: Badge[];
  streaks: LearningStreak[];
  recommendations: Recommendation[];
  compareWithPeers: PeerComparison;
  learningVelocity: number;
  focusAreas: string[];
  strengthsAndWeaknesses: SkillAssessment[];
  nextSteps: string[];
  careerGuidance: string[];
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  milestones: Milestone[];
  category: 'skill' | 'certification' | 'career' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'completed' | 'paused' | 'archived';
  rewards: string[];
  trackingMetrics: string[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  completedDate?: Date;
  requirements: string[];
  rewards: string[];
  celebrationMessage: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'completion' | 'engagement' | 'excellence' | 'social' | 'milestone';
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  earnedDate: Date;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  shareableMessage: string;
  benefitsUnlocked: string[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  requirements: string[];
  earnedDate: Date;
  level: number;
  nextLevel?: {
    requirements: string[];
    rewards: string[];
  };
  displayOnProfile: boolean;
  socialSharing: boolean;
  industryRecognition: boolean;
  skillsRepresented: string[];
}

interface LearningStreak {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  current: number;
  longest: number;
  target: number;
  rewards: string[];
  milestones: number[];
  lastActivity: Date;
  isActive: boolean;
}

interface Recommendation {
  id: string;
  type: 'module' | 'path' | 'certification' | 'skill' | 'career';
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  estimatedTime: number;
  expectedBenefit: string;
  relevanceScore: number;
  trendingScore: number;
  personalizedScore: number;
  marketDemand: string;
  salaryImpact: string;
  skillGap: string[];
  prerequisites: string[];
  alternativeOptions: string[];
}

interface PeerComparison {
  rank: number;
  totalPeers: number;
  percentile: number;
  completionRate: number;
  averageScore: number;
  cmeCredits: number;
  specialtyRank: number;
  departmentRank: number;
  organizationRank: number;
  regionalRank: number;
  globalRank: number;
  improvementSuggestions: string[];
  competitiveAdvantages: string[];
  collaborationOpportunities: string[];
}

interface SkillAssessment {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  progress: number;
  strengths: string[];
  improvementAreas: string[];
  recommendedActions: string[];
  marketDemand: string;
  salaryImpact: string;
  relatedModules: string[];
  expertMentors: string[];
  practiceOpportunities: string[];
  assessmentDate: Date;
  nextAssessment: Date;
  industryBenchmark: number;
  peerComparison: number;
}

// Sample data
const sampleModules: TrainingModule[] = [
  {
    id: 'TM-001',
    title: 'Advanced DICOM Fundamentals',
    description: 'Comprehensive training on DICOM standards, implementation, and best practices for medical imaging professionals.',
    type: 'technical',
    category: 'Medical Imaging',
    subcategory: 'DICOM Standards',
    difficulty: 'intermediate',
    duration: 180,
    estimatedTime: 200,
    cmeCredits: 3,
    completionRate: 87,
    averageScore: 92,
    passingScore: 80,
    lastUpdated: new Date('2024-01-10'),
    createdAt: new Date('2023-12-01'),
    instructors: ['Dr. Medical Expert', 'Tech Specialist', 'DICOM Engineer'],
    isRequired: true,
    prerequisites: ['Basic Medical Imaging', 'Computer Fundamentals'],
    tags: ['DICOM', 'Medical Imaging', 'Standards', 'Interoperability'],
    medicalSpecialty: ['Radiology', 'Pathology', 'Cardiology'],
    rating: 4.8,
    enrollments: 234,
    status: 'published',
    videoContent: 12,
    interactiveContent: 8,
    assessments: 5,
    simulations: 3,
    certificationEarned: 'DICOM Specialist',
    renewalPeriod: 24,
    complianceLevel: 'advanced',
    accessLevel: 'internal',
    languages: ['English', 'Spanish', 'French'],
    deviceCompatibility: ['Desktop', 'Tablet', 'Mobile'],
    offlineAvailable: true,
    progressTracking: true,
    collaborativeFeatures: true,
    gamificationElements: true,
    virtualReality: false,
    augmentedReality: true,
    mobileOptimized: true,
    accessibility: true,
    analytics: {
      totalViews: 1245,
      completions: 203,
      averageTimeSpent: 180,
      dropoutRate: 13,
      engagementScore: 92,
      knowledgeRetention: 88,
      skillImprovement: 85,
      certificationRate: 78,
      retakeRate: 12,
      satisfactionScore: 4.8
    },
    feedback: [],
    reviews: []
  },
  {
    id: 'TM-002',
    title: 'HIPAA Privacy & Security Compliance',
    description: 'Essential HIPAA compliance training covering privacy rules, security safeguards, and breach notification requirements.',
    type: 'compliance',
    category: 'Regulatory',
    subcategory: 'Privacy & Security',
    difficulty: 'beginner',
    duration: 120,
    estimatedTime: 140,
    cmeCredits: 2,
    completionRate: 96,
    averageScore: 89,
    passingScore: 85,
    lastUpdated: new Date('2024-01-12'),
    createdAt: new Date('2023-11-15'),
    instructors: ['Compliance Officer', 'Legal Expert', 'Privacy Specialist'],
    isRequired: true,
    prerequisites: [],
    tags: ['HIPAA', 'Privacy', 'Compliance', 'Security'],
    medicalSpecialty: ['All'],
    rating: 4.9,
    enrollments: 567,
    status: 'published',
    videoContent: 8,
    interactiveContent: 12,
    assessments: 4,
    simulations: 2,
    certificationEarned: 'HIPAA Compliance',
    renewalPeriod: 12,
    complianceLevel: 'enhanced',
    accessLevel: 'public',
    languages: ['English', 'Spanish'],
    deviceCompatibility: ['Desktop', 'Tablet', 'Mobile'],
    offlineAvailable: true,
    progressTracking: true,
    collaborativeFeatures: false,
    gamificationElements: true,
    virtualReality: false,
    augmentedReality: false,
    mobileOptimized: true,
    accessibility: true,
    analytics: {
      totalViews: 2134,
      completions: 544,
      averageTimeSpent: 120,
      dropoutRate: 4,
      engagementScore: 96,
      knowledgeRetention: 94,
      skillImprovement: 90,
      certificationRate: 89,
      retakeRate: 6,
      satisfactionScore: 4.9
    },
    feedback: [],
    reviews: []
  },
  {
    id: 'TM-003',
    title: 'AI-Assisted Medical Diagnosis',
    description: 'Advanced training on leveraging artificial intelligence tools for enhanced medical diagnosis and decision-making.',
    type: 'clinical',
    category: 'Artificial Intelligence',
    subcategory: 'Clinical AI',
    difficulty: 'advanced',
    duration: 240,
    estimatedTime: 280,
    cmeCredits: 4,
    completionRate: 72,
    averageScore: 85,
    passingScore: 75,
    lastUpdated: new Date('2024-01-08'),
    createdAt: new Date('2023-10-20'),
    instructors: ['Dr. AI Specialist', 'Clinical Researcher', 'Machine Learning Engineer'],
    isRequired: false,
    prerequisites: ['Medical Imaging Basics', 'Clinical Decision Making', 'Statistics Fundamentals'],
    tags: ['AI', 'Diagnosis', 'Machine Learning', 'Clinical Decision Support'],
    medicalSpecialty: ['Radiology', 'Pathology', 'Cardiology', 'Oncology'],
    rating: 4.6,
    enrollments: 189,
    status: 'published',
    videoContent: 15,
    interactiveContent: 20,
    assessments: 8,
    simulations: 6,
    certificationEarned: 'AI in Medicine',
    renewalPeriod: 18,
    complianceLevel: 'advanced',
    accessLevel: 'restricted',
    languages: ['English'],
    deviceCompatibility: ['Desktop', 'Tablet'],
    offlineAvailable: false,
    progressTracking: true,
    collaborativeFeatures: true,
    gamificationElements: true,
    virtualReality: true,
    augmentedReality: true,
    mobileOptimized: false,
    accessibility: true,
    analytics: {
      totalViews: 892,
      completions: 136,
      averageTimeSpent: 240,
      dropoutRate: 28,
      engagementScore: 85,
      knowledgeRetention: 82,
      skillImprovement: 88,
      certificationRate: 65,
      retakeRate: 22,
      satisfactionScore: 4.6
    },
    feedback: [],
    reviews: []
  },
  {
    id: 'TM-004',
    title: 'Emergency Medical Response Protocols',
    description: 'Critical training on emergency response procedures, crisis management, and patient safety protocols.',
    type: 'safety',
    category: 'Emergency Medicine',
    subcategory: 'Crisis Management',
    difficulty: 'intermediate',
    duration: 90,
    estimatedTime: 100,
    cmeCredits: 1.5,
    completionRate: 91,
    averageScore: 94,
    passingScore: 90,
    lastUpdated: new Date('2024-01-14'),
    createdAt: new Date('2023-11-01'),
    instructors: ['Emergency Medicine Physician', 'Safety Officer', 'Crisis Manager'],
    isRequired: true,
    prerequisites: ['Basic Emergency Care', 'Patient Safety Fundamentals'],
    tags: ['Emergency', 'Safety', 'Protocols', 'Crisis Management'],
    medicalSpecialty: ['Emergency Medicine', 'Critical Care', 'Surgery'],
    rating: 4.7,
    enrollments: 342,
    status: 'published',
    videoContent: 6,
    interactiveContent: 4,
    assessments: 3,
    simulations: 4,
    certificationEarned: 'Emergency Response',
    renewalPeriod: 12,
    complianceLevel: 'enhanced',
    accessLevel: 'internal',
    languages: ['English', 'Spanish'],
    deviceCompatibility: ['Desktop', 'Tablet', 'Mobile'],
    offlineAvailable: true,
    progressTracking: true,
    collaborativeFeatures: true,
    gamificationElements: false,
    virtualReality: true,
    augmentedReality: false,
    mobileOptimized: true,
    accessibility: true,
    analytics: {
      totalViews: 1567,
      completions: 311,
      averageTimeSpent: 90,
      dropoutRate: 9,
      engagementScore: 91,
      knowledgeRetention: 95,
      skillImprovement: 92,
      certificationRate: 87,
      retakeRate: 8,
      satisfactionScore: 4.7
    },
    feedback: [],
    reviews: []
  },
  {
    id: 'TM-005',
    title: 'Medical Device Integration & Validation',
    description: 'Comprehensive training on integrating medical devices with healthcare systems and validation processes.',
    type: 'device_training',
    category: 'Technology',
    subcategory: 'Device Integration',
    difficulty: 'advanced',
    duration: 300,
    estimatedTime: 350,
    cmeCredits: 5,
    completionRate: 68,
    averageScore: 88,
    passingScore: 80,
    lastUpdated: new Date('2024-01-05'),
    createdAt: new Date('2023-09-15'),
    instructors: ['Biomedical Engineer', 'Integration Specialist', 'Validation Expert'],
    isRequired: false,
    prerequisites: ['Medical Device Basics', 'System Integration', 'Regulatory Standards'],
    tags: ['Devices', 'Integration', 'Technology', 'Validation'],
    medicalSpecialty: ['Biomedical Engineering', 'Clinical Engineering', 'IT'],
    rating: 4.5,
    enrollments: 98,
    status: 'published',
    videoContent: 18,
    interactiveContent: 25,
    assessments: 10,
    simulations: 8,
    certificationEarned: 'Medical Device Specialist',
    renewalPeriod: 36,
    complianceLevel: 'advanced',
    accessLevel: 'restricted',
    languages: ['English'],
    deviceCompatibility: ['Desktop'],
    offlineAvailable: false,
    progressTracking: true,
    collaborativeFeatures: true,
    gamificationElements: true,
    virtualReality: false,
    augmentedReality: true,
    mobileOptimized: false,
    accessibility: true,
    analytics: {
      totalViews: 456,
      completions: 67,
      averageTimeSpent: 300,
      dropoutRate: 32,
      engagementScore: 82,
      knowledgeRetention: 85,
      skillImprovement: 90,
      certificationRate: 60,
      retakeRate: 18,
      satisfactionScore: 4.5
    },
    feedback: [],
    reviews: []
  },
  {
    id: 'TM-006',
    title: 'Clinical Workflow Optimization',
    description: 'Training on optimizing clinical workflows, reducing inefficiencies, and improving patient care delivery.',
    type: 'clinical',
    category: 'Operations',
    subcategory: 'Workflow Management',
    difficulty: 'intermediate',
    duration: 150,
    estimatedTime: 170,
    cmeCredits: 2.5,
    completionRate: 84,
    averageScore: 87,
    passingScore: 75,
    lastUpdated: new Date('2024-01-11'),
    createdAt: new Date('2023-12-10'),
    instructors: ['Operations Manager', 'Clinical Specialist', 'Process Improvement Expert'],
    isRequired: false,
    prerequisites: ['Clinical Practice Basics', 'Quality Improvement'],
    tags: ['Workflow', 'Optimization', 'Efficiency', 'Patient Care'],
    medicalSpecialty: ['All'],
    rating: 4.4,
    enrollments: 156,
    status: 'published',
    videoContent: 10,
    interactiveContent: 15,
    assessments: 6,
    simulations: 5,
    certificationEarned: 'Workflow Optimization',
    renewalPeriod: 24,
    complianceLevel: 'basic',
    accessLevel: 'internal',
    languages: ['English', 'Spanish'],
    deviceCompatibility: ['Desktop', 'Tablet', 'Mobile'],
    offlineAvailable: true,
    progressTracking: true,
    collaborativeFeatures: true,
    gamificationElements: true,
    virtualReality: false,
    augmentedReality: false,
    mobileOptimized: true,
    accessibility: true,
    analytics: {
      totalViews: 678,
      completions: 131,
      averageTimeSpent: 150,
      dropoutRate: 16,
      engagementScore: 84,
      knowledgeRetention: 86,
      skillImprovement: 89,
      certificationRate: 74,
      retakeRate: 14,
      satisfactionScore: 4.4
    },
    feedback: [],
    reviews: []
  }
];

const sampleUserProgress: UserProgress[] = [
  {
    moduleId: 'TM-001',
    userId: 'user-001',
    progress: 85,
    currentLesson: 18,
    totalLessons: 20,
    timeSpent: 160,
    lastAccessed: new Date('2024-01-15T14:30:00'),
    startedAt: new Date('2024-01-10T09:00:00'),
    score: 92,
    attempts: 1,
    bookmarks: 5,
    notes: 12,
    status: 'in_progress',
    nextReviewDate: new Date('2024-02-15')
  },
  {
    moduleId: 'TM-002',
    userId: 'user-001',
    progress: 100,
    currentLesson: 15,
    totalLessons: 15,
    timeSpent: 120,
    lastAccessed: new Date('2024-01-12T16:45:00'),
    startedAt: new Date('2024-01-08T10:00:00'),
    completedAt: new Date('2024-01-12T16:45:00'),
    score: 95,
    attempts: 1,
    bookmarks: 3,
    notes: 8,
    status: 'completed',
    certificateEarned: 'HIPAA-2024-001',
    nextReviewDate: new Date('2025-01-12')
  },
  {
    moduleId: 'TM-003',
    userId: 'user-001',
    progress: 45,
    currentLesson: 8,
    totalLessons: 18,
    timeSpent: 120,
    lastAccessed: new Date('2024-01-14T11:20:00'),
    startedAt: new Date('2024-01-05T14:00:00'),
    attempts: 2,
    bookmarks: 8,
    notes: 15,
    status: 'in_progress'
  },
  {
    moduleId: 'TM-004',
    userId: 'user-001',
    progress: 100,
    currentLesson: 12,
    totalLessons: 12,
    timeSpent: 95,
    lastAccessed: new Date('2024-01-09T13:15:00'),
    startedAt: new Date('2024-01-07T09:30:00'),
    completedAt: new Date('2024-01-09T13:15:00'),
    score: 98,
    attempts: 1,
    bookmarks: 2,
    notes: 6,
    status: 'completed',
    certificateEarned: 'EMERG-2024-001',
    nextReviewDate: new Date('2025-01-09')
  },
  {
    moduleId: 'TM-005',
    userId: 'user-001',
    progress: 0,
    currentLesson: 0,
    totalLessons: 24,
    timeSpent: 0,
    lastAccessed: new Date('2024-01-15T09:00:00'),
    startedAt: new Date('2024-01-15T09:00:00'),
    attempts: 0,
    bookmarks: 0,
    notes: 0,
    status: 'not_started'
  },
  {
    moduleId: 'TM-006',
    userId: 'user-001',
    progress: 30,
    currentLesson: 6,
    totalLessons: 20,
    timeSpent: 45,
    lastAccessed: new Date('2024-01-13T15:30:00'),
    startedAt: new Date('2024-01-11T10:15:00'),
    attempts: 1,
    bookmarks: 4,
    notes: 7,
    status: 'in_progress'
  }
];

const sampleAnalytics: LearningAnalytics = {
  totalModules: 25,
  completedModules: 12,
  inProgressModules: 3,
  totalCMECredits: 50,
  earnedCMECredits: 24.5,
  averageScore: 91.2,
  totalTimeSpent: 2340,
  certifications: 8,
  completionRate: 48,
  engagementScore: 87,
  knowledgeRetention: 89,
  skillImprovement: 85,
  careerProgression: 78,
  goals: [],
  achievements: [],
  badges: [],
  streaks: [],
  recommendations: [],
  compareWithPeers: {
    rank: 23,
    totalPeers: 156,
    percentile: 85,
    completionRate: 48,
    averageScore: 91.2,
    cmeCredits: 24.5,
    specialtyRank: 12,
    departmentRank: 8,
    organizationRank: 45,
    regionalRank: 123,
    globalRank: 1234,
    improvementSuggestions: ['Focus on advanced modules', 'Increase study time'],
    competitiveAdvantages: ['High scores', 'Consistent completion'],
    collaborationOpportunities: ['Peer study groups', 'Mentoring junior colleagues']
  },
  learningVelocity: 92,
  focusAreas: ['AI in Medicine', 'Clinical Workflow', 'Device Integration'],
  strengthsAndWeaknesses: [],
  nextSteps: ['Complete AI module', 'Start device training', 'Review emergency protocols'],
  careerGuidance: ['Consider AI specialization', 'Explore leadership roles', 'Pursue advanced certifications']
};

/**
 * Medical Training Modules Component
 * Comprehensive training modules interface with certification tracking
 */
export default function TrainingModules() {
  const [activeTab, setActiveTab] = useState<'modules' | 'progress' | 'certifications' | 'analytics' | 'paths'>('modules');
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showModuleDetails, setShowModuleDetails] = useState(false);
  const [enrolledModules, setEnrolledModules] = useState<string[]>(['TM-001', 'TM-002', 'TM-003', 'TM-004', 'TM-006']);
  const [favoritedModules, setFavoritedModules] = useState<string[]>(['TM-001', 'TM-003']);

  // Filter and sort modules
  const filteredModules = sampleModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || module.type === filterType;
    const matchesDifficulty = filterDifficulty === 'all' || module.difficulty === filterDifficulty;
    const matchesSpecialty = filterSpecialty === 'all' || module.medicalSpecialty.includes(filterSpecialty);
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'enrolled' && enrolledModules.includes(module.id)) ||
                         (filterStatus === 'completed' && sampleUserProgress.some(p => p.moduleId === module.id && p.status === 'completed')) ||
                         (filterStatus === 'in_progress' && sampleUserProgress.some(p => p.moduleId === module.id && p.status === 'in_progress')) ||
                         (filterStatus === 'not_started' && !enrolledModules.includes(module.id));
    
    return matchesSearch && matchesType && matchesDifficulty && matchesSpecialty && matchesStatus;
  }).sort((a, b) => {
    const aValue = (a as any)[sortBy];
    const bValue = (b as any)[sortBy];
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Get user progress for a module
  const getUserProgress = (moduleId: string) => {
    return sampleUserProgress.find(p => p.moduleId === moduleId);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'clinical': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'technical': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'compliance': return 'bg-red-100 text-red-800 border-red-200';
      case 'safety': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'device_training': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'simulation': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not_started': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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

  // Handle module enrollment
  const handleEnrollModule = (moduleId: string) => {
    setEnrolledModules(prev => [...prev, moduleId]);
  };

  // Handle module favoriting
  const handleFavoriteModule = (moduleId: string) => {
    setFavoritedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Render modules tab
  const renderModules = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search training modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
            >
              {viewMode === 'grid' ? <ClipboardDocumentListIcon className="h-5 w-5" /> : <CubeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary"
            >
              <option value="all">All Types</option>
              <option value="clinical">Clinical</option>
              <option value="technical">Technical</option>
              <option value="compliance">Compliance</option>
              <option value="safety">Safety</option>
              <option value="device_training">Device Training</option>
              <option value="simulation">Simulation</option>
            </select>
            
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary"
            >
              <option value="all">All Specialties</option>
              <option value="Radiology">Radiology</option>
              <option value="Pathology">Pathology</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Emergency Medicine">Emergency Medicine</option>
              <option value="Critical Care">Critical Care</option>
              <option value="Surgery">Surgery</option>
              <option value="Oncology">Oncology</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medsight-primary focus:border-medsight-primary"
            >
              <option value="all">All Status</option>
              <option value="enrolled">Enrolled</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="not_started">Not Started</option>
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
              <option value="rating-desc">Highest Rated</option>
              <option value="enrollments-desc">Most Popular</option>
              <option value="lastUpdated-desc">Recently Updated</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="duration-asc">Shortest Duration</option>
              <option value="cmeCredits-desc">Most CME Credits</option>
            </select>
          </div>
        )}
      </div>

      {/* Modules Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredModules.map((module) => {
          const progress = getUserProgress(module.id);
          const isEnrolled = enrolledModules.includes(module.id);
          const isFavorited = favoritedModules.includes(module.id);
          
          return (
            <div
              key={module.id}
              className={`medsight-glass p-6 rounded-xl cursor-pointer hover:bg-white/60 transition-colors ${
                viewMode === 'list' ? 'flex items-center space-x-6' : ''
              }`}
              onClick={() => {
                setSelectedModule(module);
                setShowModuleDetails(true);
              }}
            >
              {viewMode === 'grid' ? (
                <div className="space-y-4">
                  {/* Module Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                        {module.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(module.type)}`}>
                        {module.type.replace('_', ' ')}
                      </span>
                      {module.isRequired && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteModule(module.id);
                        }}
                        className={`p-1 rounded-full hover:bg-white/50 transition-colors ${
                          isFavorited ? 'text-red-500' : 'text-gray-400'
                        }`}
                      >
                        <HeartIcon className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                      </button>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">{module.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Module Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                    
                    {/* Progress Bar */}
                    {progress && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{progress.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-medsight-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Module Stats */}
                    <div className="space-y-2">
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
                        <span className="text-gray-500">Enrolled</span>
                        <span className="font-medium">{module.enrollments}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {module.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-medsight-primary/10 text-medsight-primary text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {module.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{module.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{module.instructors[0]}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {progress && progress.status === 'completed' ? (
                          <button className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Completed</span>
                          </button>
                        ) : progress && progress.status === 'in_progress' ? (
                          <button className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
                            <PlayIcon className="h-4 w-4" />
                            <span>Continue</span>
                          </button>
                        ) : isEnrolled ? (
                          <button className="flex items-center space-x-1 px-3 py-1 bg-medsight-primary text-white rounded-lg text-sm">
                            <PlayIcon className="h-4 w-4" />
                            <span>Start</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEnrollModule(module.id);
                            }}
                            className="flex items-center space-x-1 px-3 py-1 bg-white/50 text-gray-700 rounded-lg text-sm hover:bg-white/70 transition-colors"
                          >
                            <PlusIcon className="h-4 w-4" />
                            <span>Enroll</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // List view
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-medsight-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpenIcon className="h-8 w-8 text-medsight-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                          {module.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(module.type)}`}>
                          {module.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatDuration(module.duration)}</span>
                        <span>{module.cmeCredits} CME</span>
                        <span>{module.enrollments} enrolled</span>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="h-4 w-4 text-yellow-500" />
                          <span>{module.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {progress && (
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">{progress.progress}%</div>
                        <div className="text-xs text-gray-500">Complete</div>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteModule(module.id);
                        }}
                        className={`p-2 rounded-full hover:bg-white/50 transition-colors ${
                          isFavorited ? 'text-red-500' : 'text-gray-400'
                        }`}
                      >
                        <HeartIcon className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                      </button>
                      {progress && progress.status === 'completed' ? (
                        <button className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>Completed</span>
                        </button>
                      ) : progress && progress.status === 'in_progress' ? (
                        <button className="flex items-center space-x-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
                          <PlayIcon className="h-4 w-4" />
                          <span>Continue</span>
                        </button>
                      ) : isEnrolled ? (
                        <button className="flex items-center space-x-1 px-3 py-2 bg-medsight-primary text-white rounded-lg text-sm">
                          <PlayIcon className="h-4 w-4" />
                          <span>Start</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEnrollModule(module.id);
                          }}
                          className="flex items-center space-x-1 px-3 py-2 bg-white/50 text-gray-700 rounded-lg text-sm hover:bg-white/70 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4" />
                          <span>Enroll</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No training modules found matching your criteria.</p>
        </div>
      )}
    </div>
  );

  // Render progress tab
  const renderProgress = () => (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Modules</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleAnalytics.completedModules}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round((sampleAnalytics.completedModules / sampleAnalytics.totalModules) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${(sampleAnalytics.completedModules / sampleAnalytics.totalModules) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CME Credits</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleAnalytics.earnedCMECredits}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Target</span>
              <span>{sampleAnalytics.totalCMECredits}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(sampleAnalytics.earnedCMECredits / sampleAnalytics.totalCMECredits) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleAnalytics.averageScore}%</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <TrophyIcon className="h-4 w-4 mr-1" />
            <span>Excellent performance</span>
          </div>
        </div>

        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certifications</p>
              <p className="text-2xl font-bold text-medsight-primary">{sampleAnalytics.certifications}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <ShieldCheckIcon className="h-4 w-4 mr-1" />
            <span>Verified credentials</span>
          </div>
        </div>
      </div>

      {/* Current Progress */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">Current Progress</h3>
        <div className="space-y-4">
          {sampleUserProgress.filter(p => p.status === 'in_progress').map((progress) => {
            const module = sampleModules.find(m => m.id === progress.moduleId);
            if (!module) return null;
            
            return (
              <div key={progress.moduleId} className="p-4 bg-white/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{module.title}</h4>
                    <p className="text-sm text-gray-600">{module.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{progress.progress}%</p>
                    <p className="text-xs text-gray-500">Lesson {progress.currentLesson} of {progress.totalLessons}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-medsight-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Time spent: {formatDuration(progress.timeSpent)}</span>
                  <span>Last accessed: {formatTimeAgo(progress.lastAccessed)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Modules */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">Completed Modules</h3>
        <div className="space-y-4">
          {sampleUserProgress.filter(p => p.status === 'completed').map((progress) => {
            const module = sampleModules.find(m => m.id === progress.moduleId);
            if (!module) return null;
            
            return (
              <div key={progress.moduleId} className="p-4 bg-white/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{module.title}</h4>
                      <p className="text-sm text-gray-600">{module.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{progress.score}%</p>
                    <p className="text-xs text-gray-500">Completed {formatTimeAgo(progress.completedAt!)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Duration: {formatDuration(progress.timeSpent)}</span>
                    <span>CME: {module.cmeCredits}</span>
                    {progress.certificateEarned && (
                      <span className="flex items-center space-x-1">
                        <AcademicCapIcon className="h-4 w-4" />
                        <span>Certificate earned</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-medsight-primary hover:text-medsight-primary/80 text-sm">
                      View Certificate
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm">
                      Retake
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render certifications tab
  const renderCertifications = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Certifications view coming soon...</p>
      </div>
    </div>
  );

  // Render analytics tab
  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Analytics view coming soon...</p>
      </div>
    </div>
  );

  // Render learning paths tab
  const renderPaths = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Learning paths view coming soon...</p>
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
              <h1 className="text-3xl font-bold text-medsight-primary">Training Modules</h1>
              <p className="text-gray-600 mt-1">Access medical training modules and track your certification progress</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">24/7 Support Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <BellIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">2 new modules</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'modules', label: 'Training Modules', icon: BookOpenIcon },
              { id: 'progress', label: 'My Progress', icon: ChartBarIcon },
              { id: 'certifications', label: 'Certifications', icon: AcademicCapIcon },
              { id: 'analytics', label: 'Analytics', icon: TrophyIcon },
              { id: 'paths', label: 'Learning Paths', icon: MapIcon }
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
          {activeTab === 'modules' && renderModules()}
          {activeTab === 'progress' && renderProgress()}
          {activeTab === 'certifications' && renderCertifications()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'paths' && renderPaths()}
        </div>
      </div>
    </div>
  );
} 