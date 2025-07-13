'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon,
  VideoCameraIcon,
  PhoneIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  MagnifyingGlassIcon,
  BellIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  StarIcon,
  TagIcon,
  DocumentTextIcon,
  PhotoIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  CameraIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  EnvelopeIcon, // Replaces MailIcon
  ChatBubbleOvalLeftIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  HandRaisedIcon,
  ShareIcon,
  ArrowRightIcon,
  PlusIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  SignalIcon,
  WifiIcon,
  HeartIcon,
  BeakerIcon,
  CpuChipIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  ArchiveBoxIcon,
  BookmarkIcon,
  FlagIcon,
  ExclamationCircleIcon,
  QuestionMarkCircleIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  MegaphoneIcon, // Replaces SpeakerphoneIcon
  RadioIcon,
  TvIcon,
  CloudIcon,
  ServerIcon,
  CogIcon,
  AdjustmentsHorizontalIcon,
  Cog6ToothIcon,
  WrenchIcon,
  BugAntIcon,
  CommandLineIcon, // Replaces TerminalIcon
  CodeBracketIcon,
  FireIcon,
  BoltIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ArrowUpOnSquareIcon,
  ArrowDownOnSquareIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  InboxIcon, // Removing OutboxIcon as it doesn't exist
  AtSymbolIcon,
  HashtagIcon,
  ListBulletIcon,
  TableCellsIcon,
  ChartPieIcon,
  FunnelIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ViewfinderCircleIcon,
  CursorArrowRaysIcon,
  CursorArrowRippleIcon,
  FingerPrintIcon,
  KeyIcon,
  IdentificationIcon,
  ShieldExclamationIcon,
  NoSymbolIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerXMarkIcon, // Replaces volume icons
  VideoCameraSlashIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleBottomCenterIcon,
  Squares2X2Icon,
  Square2StackIcon,
  RectangleGroupIcon,
  RectangleStackIcon,
  PaintBrushIcon,
  SwatchIcon, // Replaces ColorSwatchIcon
  EyeDropperIcon,
  PencilIcon,
  PencilSquareIcon,
  Bars3Icon,
  Bars4Icon,
  EllipsisHorizontalIcon,
  MinusIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  XCircleIcon,
  CheckBadgeIcon,
  BellAlertIcon,
  BellSlashIcon,
  BellSnoozeIcon,
  CalendarDaysIcon,
  MapIcon,
  GlobeAmericasIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  HomeIcon,
  HomeModernIcon,
  TruckIcon,
  RocketLaunchIcon,
  TrophyIcon,
  PuzzlePieceIcon,
  FilmIcon
} from '@heroicons/react/24/outline';

interface TeamMember {
  id: string;
  name: string;
  role: 'physician' | 'nurse' | 'specialist' | 'technician' | 'admin' | 'consultant' | 'student';
  specialty: string;
  department: string;
  title: string;
  avatar: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  lastSeen: Date;
  contactInfo: {
    email: string;
    phone: string;
    pager?: string;
    extension?: string;
  };
  credentials: string[];
  experience: number;
  location: string;
  timezone: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    mobileNotifications: boolean;
    workingHours: {
      start: string;
      end: string;
      days: string[];
    };
  };
  workload: {
    currentCases: number;
    maxCases: number;
    availability: number;
    responseTime: number;
  };
  ratings: {
    overall: number;
    communication: number;
    expertise: number;
    timeliness: number;
    collaboration: number;
  };
}

interface Consultation {
  id: string;
  type: 'urgent' | 'routine' | 'follow_up' | 'second_opinion' | 'multidisciplinary';
  title: string;
  description: string;
  patientId: string;
  requestedBy: string;
  requestedAt: Date;
  urgency: 'stat' | 'urgent' | 'routine' | 'elective';
  specialty: string;
  department: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  assignedTo: string[];
  participants: string[];
  scheduledFor?: Date;
  estimatedDuration: number;
  actualDuration?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  attachments: ConsultationAttachment[];
  notes: ConsultationNote[];
  recommendations: string[];
  outcome: {
    summary: string;
    nextSteps: string[];
    followUpRequired: boolean;
    followUpDate?: Date;
    satisfactionRating?: number;
  };
  billing: {
    billable: boolean;
    code: string;
    amount: number;
    insurance: string;
  };
  compliance: {
    documented: boolean;
    signed: boolean;
    auditTrail: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ConsultationAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'dicom';
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  description: string;
  metadata?: any;
}

interface ConsultationNote {
  id: string;
  type: 'assessment' | 'recommendation' | 'follow_up' | 'question' | 'observation';
  content: string;
  author: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  attachments: string[];
  mentions: string[];
  replies: ConsultationNote[];
}

interface ChatMessage {
  id: string;
  consultationId: string;
  sender: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'system';
  timestamp: Date;
  edited: boolean;
  editedAt?: Date;
  replyTo?: string;
  mentions: string[];
  reactions: {
    emoji: string;
    users: string[];
    count: number;
  }[];
  attachments: string[];
  urgent: boolean;
  read: boolean;
  readBy: {
    userId: string;
    readAt: Date;
  }[];
  metadata?: any;
}

interface VideoConference {
  id: string;
  consultationId: string;
  title: string;
  description: string;
  hostId: string;
  participants: VideoParticipant[];
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meetingUrl: string;
  dialInInfo: {
    phone: string;
    accessCode: string;
    pin: string;
  };
  recording: {
    enabled: boolean;
    url?: string;
    duration?: number;
    size?: number;
  };
  features: {
    screenShare: boolean;
    chat: boolean;
    whiteboard: boolean;
    breakoutRooms: boolean;
    polling: boolean;
    recording: boolean;
  };
  security: {
    waitingRoom: boolean;
    password: boolean;
    encryption: boolean;
    authenticatedUsers: boolean;
  };
  metadata: {
    platform: string;
    quality: string;
    bandwidth: string;
    devices: string[];
  };
}

interface VideoParticipant {
  userId: string;
  name: string;
  role: 'host' | 'moderator' | 'participant' | 'observer';
  joinedAt?: Date;
  leftAt?: Date;
  status: 'waiting' | 'connected' | 'disconnected' | 'reconnecting';
  audio: {
    enabled: boolean;
    muted: boolean;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  };
  video: {
    enabled: boolean;
    camera: boolean;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  };
  screen: {
    sharing: boolean;
    viewing: boolean;
  };
  connection: {
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    latency: number;
    bandwidth: number;
  };
}

interface CollaborationStats {
  totalConsultations: number;
  activeConsultations: number;
  completedConsultations: number;
  averageResponseTime: number;
  averageConsultationDuration: number;
  teamUtilization: number;
  patientSatisfaction: number;
  qualityMetrics: {
    timeToConsultation: number;
    consultationCompletionRate: number;
    followUpAdherence: number;
    documentationQuality: number;
  };
  specialtyBreakdown: {
    [specialty: string]: {
      count: number;
      averageDuration: number;
      satisfaction: number;
    };
  };
}

interface MedicalCollaborationHubProps {
  patientId?: string;
  consultationId?: string;
  teamId?: string;
  onConsultationCreated?: (consultation: Consultation) => void;
  onConsultationUpdated?: (consultation: Consultation) => void;
  onMessageSent?: (message: ChatMessage) => void;
  onVideoCallStarted?: (conference: VideoConference) => void;
  className?: string;
}

export default function MedicalCollaborationHub({
  patientId,
  consultationId,
  teamId,
  onConsultationCreated,
  onConsultationUpdated,
  onMessageSent,
  onVideoCallStarted,
  className = ''
}: MedicalCollaborationHubProps) {
  const [activeTab, setActiveTab] = useState<'consultations' | 'chat' | 'team' | 'video' | 'stats'>('consultations');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeVideoConference, setActiveVideoConference] = useState<VideoConference | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Consultation['status']>('all');
  const [filterUrgency, setFilterUrgency] = useState<'all' | Consultation['urgency']>('all');
  const [showCreateConsultation, setShowCreateConsultation] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [onlineMembers, setOnlineMembers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState<CollaborationStats | null>(null);

  // Mock data
  const mockTeamMembers: TeamMember[] = [
    {
      id: 'member-001',
      name: 'Dr. Sarah Johnson',
      role: 'physician',
      specialty: 'Cardiology',
      department: 'Cardiology',
      title: 'Senior Cardiologist',
      avatar: '/avatars/sarah.jpg',
      status: 'online',
      lastSeen: new Date(),
      contactInfo: {
        email: 'sarah.johnson@hospital.com',
        phone: '(555) 123-4567',
        pager: '123-456',
        extension: '1234'
      },
      credentials: ['MD', 'FACC', 'FSCAI'],
      experience: 15,
      location: 'Main Hospital',
      timezone: 'EST',
      preferences: {
        notifications: true,
        emailUpdates: true,
        mobileNotifications: true,
        workingHours: {
          start: '07:00',
          end: '18:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
      },
      workload: {
        currentCases: 12,
        maxCases: 20,
        availability: 85,
        responseTime: 15
      },
      ratings: {
        overall: 4.8,
        communication: 4.9,
        expertise: 4.9,
        timeliness: 4.7,
        collaboration: 4.8
      }
    },
    {
      id: 'member-002',
      name: 'Dr. Michael Chen',
      role: 'specialist',
      specialty: 'Radiology',
      department: 'Radiology',
      title: 'Interventional Radiologist',
      avatar: '/avatars/michael.jpg',
      status: 'busy',
      lastSeen: new Date(Date.now() - 300000),
      contactInfo: {
        email: 'michael.chen@hospital.com',
        phone: '(555) 234-5678',
        pager: '234-567',
        extension: '2345'
      },
      credentials: ['MD', 'FSIR', 'ABR'],
      experience: 12,
      location: 'Imaging Center',
      timezone: 'EST',
      preferences: {
        notifications: true,
        emailUpdates: false,
        mobileNotifications: true,
        workingHours: {
          start: '08:00',
          end: '17:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
      },
      workload: {
        currentCases: 18,
        maxCases: 25,
        availability: 70,
        responseTime: 25
      },
      ratings: {
        overall: 4.6,
        communication: 4.5,
        expertise: 4.8,
        timeliness: 4.4,
        collaboration: 4.7
      }
    }
  ];

  const mockConsultations: Consultation[] = [
    {
      id: 'consult-001',
      type: 'urgent',
      title: 'Cardiac Catheterization Consultation',
      description: 'Patient with acute MI requiring urgent catheterization',
      patientId: 'pat-001',
      requestedBy: 'member-001',
      requestedAt: new Date(Date.now() - 1800000),
      urgency: 'urgent',
      specialty: 'Cardiology',
      department: 'Cardiology',
      status: 'in_progress',
      assignedTo: ['member-001', 'member-002'],
      participants: ['member-001', 'member-002'],
      scheduledFor: new Date(Date.now() + 1800000),
      estimatedDuration: 60,
      priority: 'high',
      tags: ['cardiac', 'catheterization', 'MI'],
      attachments: [
        {
          id: 'attach-001',
          name: 'ECG Results',
          type: 'image',
          url: '/files/ecg-001.jpg',
          size: 1024000,
          uploadedBy: 'member-001',
          uploadedAt: new Date(),
          description: '12-lead ECG showing ST elevation'
        }
      ],
      notes: [
        {
          id: 'note-001',
          type: 'assessment',
          content: 'Patient presents with acute STEMI. Requires immediate intervention.',
          author: 'member-001',
          timestamp: new Date(Date.now() - 1800000),
          priority: 'high',
          tags: ['STEMI', 'acute'],
          attachments: [],
          mentions: ['member-002'],
          replies: []
        }
      ],
      recommendations: ['Immediate cardiac catheterization', 'Dual antiplatelet therapy', 'Beta-blocker therapy'],
      outcome: {
        summary: '',
        nextSteps: [],
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 86400000)
      },
      billing: {
        billable: true,
        code: 'CPT-93458',
        amount: 2500,
        insurance: 'Medicare'
      },
      compliance: {
        documented: false,
        signed: false,
        auditTrail: []
      },
      createdAt: new Date(Date.now() - 1800000),
      updatedAt: new Date(Date.now() - 900000)
    }
  ];

  const mockMessages: ChatMessage[] = [
    {
      id: 'msg-001',
      consultationId: 'consult-001',
      sender: 'member-001',
      content: 'Patient is ready for catheterization. ETA 30 minutes.',
      type: 'text',
      timestamp: new Date(Date.now() - 900000),
      edited: false,
      mentions: ['member-002'],
      reactions: [
        {
          emoji: '👍',
          users: ['member-002'],
          count: 1
        }
      ],
      attachments: [],
      urgent: true,
      read: true,
      readBy: [
        {
          userId: 'member-002',
          readAt: new Date(Date.now() - 800000)
        }
      ]
    },
    {
      id: 'msg-002',
      consultationId: 'consult-001',
      sender: 'member-002',
      content: 'Cath lab is ready. Please bring patient to room 3.',
      type: 'text',
      timestamp: new Date(Date.now() - 600000),
      edited: false,
      mentions: ['member-001'],
      reactions: [],
      attachments: [],
      urgent: false,
      read: true,
      readBy: [
        {
          userId: 'member-001',
          readAt: new Date(Date.now() - 500000)
        }
      ]
    }
  ];

  const mockStats: CollaborationStats = {
    totalConsultations: 245,
    activeConsultations: 18,
    completedConsultations: 227,
    averageResponseTime: 22,
    averageConsultationDuration: 45,
    teamUtilization: 78,
    patientSatisfaction: 4.6,
    qualityMetrics: {
      timeToConsultation: 25,
      consultationCompletionRate: 92,
      followUpAdherence: 87,
      documentationQuality: 94
    },
    specialtyBreakdown: {
      'Cardiology': {
        count: 89,
        averageDuration: 52,
        satisfaction: 4.7
      },
      'Radiology': {
        count: 67,
        averageDuration: 31,
        satisfaction: 4.5
      },
      'Neurology': {
        count: 45,
        averageDuration: 48,
        satisfaction: 4.6
      }
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setTeamMembers(mockTeamMembers);
      setConsultations(mockConsultations);
      setChatMessages(mockMessages);
      setStats(mockStats);
      setOnlineMembers(['member-001', 'member-002']);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredConsultations = useMemo(() => {
    return consultations.filter(consultation => {
      if (filterStatus !== 'all' && consultation.status !== filterStatus) return false;
      if (filterUrgency !== 'all' && consultation.urgency !== filterUrgency) return false;
      if (searchTerm && !consultation.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [consultations, filterStatus, filterUrgency, searchTerm]);

  const handleConsultationCreate = (consultationData: Partial<Consultation>) => {
    const newConsultation: Consultation = {
      id: `consult-${Date.now()}`,
      type: consultationData.type || 'routine',
      title: consultationData.title || 'New Consultation',
      description: consultationData.description || '',
      patientId: patientId || 'unknown',
      requestedBy: 'current-user',
      requestedAt: new Date(),
      urgency: consultationData.urgency || 'routine',
      specialty: consultationData.specialty || 'General',
      department: consultationData.department || 'General',
      status: 'pending',
      assignedTo: consultationData.assignedTo || [],
      participants: consultationData.participants || [],
      scheduledFor: consultationData.scheduledFor,
      estimatedDuration: consultationData.estimatedDuration || 30,
      priority: consultationData.priority || 'medium',
      tags: consultationData.tags || [],
      attachments: [],
      notes: [],
      recommendations: [],
      outcome: {
        summary: '',
        nextSteps: [],
        followUpRequired: false
      },
      billing: {
        billable: false,
        code: '',
        amount: 0,
        insurance: ''
      },
      compliance: {
        documented: false,
        signed: false,
        auditTrail: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setConsultations(prev => [...prev, newConsultation]);
    setShowCreateConsultation(false);
    onConsultationCreated?.(newConsultation);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConsultation) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      consultationId: selectedConsultation.id,
      sender: 'current-user',
      content: messageText,
      type: 'text',
      timestamp: new Date(),
      edited: false,
      mentions: [],
      reactions: [],
      attachments: [],
      urgent: false,
      read: false,
      readBy: []
    };

    setChatMessages(prev => [...prev, newMessage]);
    setMessageText('');
    onMessageSent?.(newMessage);
  };

  const handleVideoCallStart = () => {
    if (!selectedConsultation) return;

    const videoConference: VideoConference = {
      id: `video-${Date.now()}`,
      consultationId: selectedConsultation.id,
      title: `Video Call - ${selectedConsultation.title}`,
      description: selectedConsultation.description,
      hostId: 'current-user',
      participants: selectedConsultation.participants.map(id => ({
        userId: id,
        name: teamMembers.find(m => m.id === id)?.name || 'Unknown',
        role: 'participant',
        status: 'waiting',
        audio: { enabled: true, muted: false, quality: 'good' },
        video: { enabled: true, camera: true, quality: 'good' },
        screen: { sharing: false, viewing: false },
        connection: { quality: 'good', latency: 50, bandwidth: 1000 }
      })),
      scheduledStart: new Date(),
      scheduledEnd: new Date(Date.now() + selectedConsultation.estimatedDuration * 60000),
      status: 'scheduled',
      meetingUrl: `https://meet.hospital.com/room/${selectedConsultation.id}`,
      dialInInfo: {
        phone: '1-800-MEET-NOW',
        accessCode: '123456',
        pin: '789'
      },
      recording: {
        enabled: false
      },
      features: {
        screenShare: true,
        chat: true,
        whiteboard: true,
        breakoutRooms: false,
        polling: false,
        recording: true
      },
      security: {
        waitingRoom: true,
        password: false,
        encryption: true,
        authenticatedUsers: true
      },
      metadata: {
        platform: 'MedSight Video',
        quality: 'HD',
        bandwidth: '1 Mbps',
        devices: ['Desktop', 'Mobile']
      }
    };

    setActiveVideoConference(videoConference);
    setShowVideoCall(true);
    onVideoCallStarted?.(videoConference);
  };

  const getStatusColor = (status: Consultation['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'in_progress': return 'text-medsight-primary';
      case 'completed': return 'text-medsight-normal';
      case 'cancelled': return 'text-red-500';
      case 'on_hold': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getUrgencyColor = (urgency: Consultation['urgency']) => {
    switch (urgency) {
      case 'stat': return 'text-red-600 bg-red-100';
      case 'urgent': return 'text-orange-600 bg-orange-100';
      case 'routine': return 'text-blue-600 bg-blue-100';
      case 'elective': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOnlineStatus = (memberId: string) => {
    return onlineMembers.includes(memberId);
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
              Medical Collaboration Hub
            </h1>
            <p className="text-gray-600">Multi-disciplinary team collaboration and consultation</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <BellIcon className="w-6 h-6 text-gray-500" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
            
            <button
              onClick={() => setShowCreateConsultation(true)}
              className="btn-medsight bg-medsight-primary text-white"
            >
              <PlusIcon className="w-4 h-4" />
              New Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'consultations', label: 'Consultations', icon: ClipboardDocumentListIcon },
            { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
            { id: 'team', label: 'Team', icon: UserGroupIcon },
            { id: 'video', label: 'Video', icon: VideoCameraIcon },
            { id: 'stats', label: 'Analytics', icon: ChartBarIcon }
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
        {/* Consultations Tab */}
        {activeTab === 'consultations' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consultations List */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Active Consultations</h3>
                
                {/* Filters */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    
                    <select
                      value={filterUrgency}
                      onChange={(e) => setFilterUrgency(e.target.value as any)}
                      className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    >
                      <option value="all">All Urgency</option>
                      <option value="stat">STAT</option>
                      <option value="urgent">Urgent</option>
                      <option value="routine">Routine</option>
                      <option value="elective">Elective</option>
                    </select>
                  </div>
                  
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search consultations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Consultations List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredConsultations.map(consultation => (
                    <div
                      key={consultation.id}
                      onClick={() => setSelectedConsultation(consultation)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedConsultation?.id === consultation.id
                          ? 'bg-medsight-primary/10 border-medsight-primary'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{consultation.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(consultation.urgency)}`}>
                          {consultation.urgency.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{consultation.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${getStatusColor(consultation.status)}`}>
                            {consultation.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {consultation.specialty}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UserGroupIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{consultation.participants.length}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Consultation Details */}
            <div className="space-y-4">
              {selectedConsultation ? (
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Consultation Details</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleVideoCallStart}
                        className="btn-medsight bg-blue-500 text-white"
                      >
                        <VideoCameraIcon className="w-4 h-4" />
                        Video Call
                      </button>
                      <button className="btn-medsight">
                        <ShareIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">{selectedConsultation.title}</h4>
                      <p className="text-sm text-gray-600">{selectedConsultation.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <p className={`font-medium ${getStatusColor(selectedConsultation.status)}`}>
                          {selectedConsultation.status.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Urgency:</span>
                        <p className="font-medium">{selectedConsultation.urgency}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Specialty:</span>
                        <p className="font-medium">{selectedConsultation.specialty}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <p className="font-medium">{selectedConsultation.estimatedDuration} min</p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Participants</h5>
                      <div className="space-y-2">
                        {selectedConsultation.participants.map(participantId => {
                          const member = teamMembers.find(m => m.id === participantId);
                          return member ? (
                            <div key={participantId} className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-medsight-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">{member.name.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.specialty}</p>
                              </div>
                              <div className={`w-3 h-3 rounded-full ${getOnlineStatus(member.id) ? 'bg-green-500' : 'bg-gray-400'}`} />
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                    
                    {selectedConsultation.notes.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Notes</h5>
                        <div className="space-y-2">
                          {selectedConsultation.notes.map(note => (
                            <div key={note.id} className="p-2 bg-gray-50 rounded">
                              <p className="text-sm">{note.content}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {note.author} • {note.timestamp.toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg border">
                  <div className="text-center text-gray-500">
                    <ClipboardDocumentListIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Select a Consultation</h3>
                    <p>Choose a consultation to view details and collaborate</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Messages */}
            <div className="lg:col-span-2 bg-white rounded-lg border flex flex-col h-96">
              <div className="p-4 border-b">
                <h3 className="font-medium">
                  {selectedConsultation ? selectedConsultation.title : 'Select a consultation'}
                </h3>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                {selectedConsultation ? (
                  <div className="space-y-4">
                    {chatMessages
                      .filter(msg => msg.consultationId === selectedConsultation.id)
                      .map(message => (
                        <div key={message.id} className="flex gap-3">
                          <div className="w-8 h-8 bg-medsight-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {teamMembers.find(m => m.id === message.sender)?.name.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {teamMembers.find(m => m.id === message.sender)?.name || 'Unknown'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                              {message.urgent && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                  URGENT
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{message.content}</p>
                            {message.reactions.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                {message.reactions.map((reaction, index) => (
                                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {reaction.emoji} {reaction.count}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>Select a consultation to start chatting</p>
                  </div>
                )}
              </div>
              
              {selectedConsultation && (
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="btn-medsight bg-medsight-primary text-white disabled:opacity-50"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Online Team Members */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium mb-4">Online Team</h3>
              <div className="space-y-2">
                {teamMembers.filter(member => getOnlineStatus(member.id)).map(member => (
                  <div key={member.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-medsight-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{member.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.specialty}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map(member => (
              <div key={member.id} className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-medsight-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium">{member.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.title}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getOnlineStatus(member.id) ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Specialty:</span>
                    <p className="font-medium">{member.specialty}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <p className="font-medium">{member.department}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Experience:</span>
                    <p className="font-medium">{member.experience} years</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Availability:</span>
                    <p className="font-medium">{member.workload.availability}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Rating:</span>
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{member.ratings.overall}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <button className="btn-medsight text-xs">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      Message
                    </button>
                    <button className="btn-medsight text-xs">
                      <VideoCameraIcon className="w-4 h-4" />
                      Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Video Tab */}
        {activeTab === 'video' && (
          <div className="space-y-6">
            {activeVideoConference ? (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Active Video Conference</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">{activeVideoConference.title}</h4>
                    <p className="text-sm text-gray-600">{activeVideoConference.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {activeVideoConference.participants.map(participant => (
                      <div key={participant.userId} className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                          <span className="font-medium">{participant.name.charAt(0)}</span>
                        </div>
                        <p className="text-sm font-medium">{participant.name}</p>
                        <p className="text-xs text-gray-500">{participant.status}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center gap-4">
                    <button className="btn-medsight bg-red-500 text-white">
                      <MicrophoneIcon className="w-4 h-4" />
                      Mute
                    </button>
                    <button className="btn-medsight bg-blue-500 text-white">
                      <VideoCameraIcon className="w-4 h-4" />
                      Camera
                    </button>
                    <button className="btn-medsight bg-green-500 text-white">
                      <ShareIcon className="w-4 h-4" />
                      Share
                    </button>
                    <button className="btn-medsight bg-red-600 text-white">
                      <XMarkIcon className="w-4 h-4" />
                      End Call
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg border">
                <div className="text-center text-gray-500">
                  <VideoCameraIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Active Video Conference</h3>
                  <p className="mb-4">Start a video call from a consultation</p>
                  <button
                    onClick={() => setActiveTab('consultations')}
                    className="btn-medsight bg-medsight-primary text-white"
                  >
                    View Consultations
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                  <p className="text-2xl font-bold text-medsight-primary">{stats.totalConsultations}</p>
                </div>
                <ClipboardDocumentListIcon className="w-8 h-8 text-medsight-primary/30" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-medsight-primary">{stats.activeConsultations}</p>
                </div>
                <PlayIcon className="w-8 h-8 text-medsight-primary/30" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-medsight-primary">{stats.averageResponseTime}m</p>
                </div>
                <ClockIcon className="w-8 h-8 text-medsight-primary/30" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Utilization</p>
                  <p className="text-2xl font-bold text-medsight-primary">{stats.teamUtilization}%</p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-medsight-primary/30" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Create Consultation Modal */}
      {showCreateConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Consultation</h3>
              <button
                onClick={() => setShowCreateConsultation(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleConsultationCreate({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as any,
                urgency: formData.get('urgency') as any,
                specialty: formData.get('specialty') as string,
                department: formData.get('department') as string,
                estimatedDuration: parseInt(formData.get('estimatedDuration') as string),
                assignedTo: [formData.get('assignedTo') as string],
                participants: [formData.get('assignedTo') as string]
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    placeholder="Enter consultation title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    placeholder="Enter consultation description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="follow_up">Follow-up</option>
                      <option value="second_opinion">Second Opinion</option>
                      <option value="multidisciplinary">Multidisciplinary</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Urgency
                    </label>
                    <select
                      name="urgency"
                      required
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT</option>
                      <option value="elective">Elective</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialty
                    </label>
                    <select
                      name="specialty"
                      required
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Surgery">Surgery</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="estimatedDuration"
                      required
                      min="15"
                      max="240"
                      defaultValue="30"
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To
                  </label>
                  <select
                    name="assignedTo"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-medsight-primary focus:border-transparent"
                  >
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} - {member.specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateConsultation(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-medsight-primary text-white rounded-md hover:bg-medsight-primary/90"
                >
                  Create Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 