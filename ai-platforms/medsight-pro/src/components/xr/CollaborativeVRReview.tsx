'use client';

import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, UserGroupIcon, VideoCameraIcon, MicrophoneIcon, 
  ChatBubbleLeftRightIcon, PlayIcon, PauseIcon, StopIcon,
  EyeIcon, HandRaisedIcon, CubeIcon, ShareIcon, 
  CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, 
  ShieldCheckIcon, ClockIcon, SignalIcon, WifiIcon,
  AcademicCapIcon, DocumentTextIcon, HeartIcon, 
  ViewfinderCircleIcon, TagIcon, MagnifyingGlassIcon,
  ArrowPathIcon, InformationCircleIcon, Cog6ToothIcon,
  SpeakerWaveIcon, MicrophoneIcon as MicIcon, 
  SpeakerXMarkIcon, CameraIcon, UserIcon, 
  BuildingOfficeIcon, UserPlusIcon, UserMinusIcon,
  PresentationChartLineIcon, BookOpenIcon, MapIcon,
  Square3Stack3DIcon, CubeTransparentIcon, RectangleGroupIcon
} from '@heroicons/react/24/outline';

interface CollaborativeUser {
  id: string;
  name: string;
  role: 'surgeon' | 'resident' | 'student' | 'observer' | 'instructor';
  avatar: string;
  isOnline: boolean;
  isInVR: boolean;
  deviceType: 'vr' | 'ar' | 'desktop' | 'mobile';
  permissions: {
    canAnnotate: boolean;
    canMeasure: boolean;
    canModify: boolean;
    canRecord: boolean;
    canInvite: boolean;
  };
  presence: {
    position: { x: number; y: number; z: number };
    orientation: { x: number; y: number; z: number };
    isActive: boolean;
    lastActivity: string;
  };
  audio: {
    isMuted: boolean;
    isDeafened: boolean;
    volume: number;
    quality: 'high' | 'medium' | 'low';
  };
  video: {
    isEnabled: boolean;
    quality: 'high' | 'medium' | 'low';
    frameRate: number;
  };
}

interface CollaborativeSession {
  id: string;
  name: string;
  type: 'case_review' | 'surgery_planning' | 'education' | 'consultation';
  status: 'active' | 'paused' | 'waiting' | 'ended';
  host: string;
  participants: CollaborativeUser[];
  maxParticipants: number;
  startTime: string;
  duration: string;
  medicalCase: {
    patientId: string;
    studyId: string;
    diagnosis: string;
    modality: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  };
  sharedContent: {
    medicalImages: string[];
    annotations: number;
    measurements: number;
    documents: string[];
  };
  recording: {
    isEnabled: boolean;
    duration: string;
    size: string;
    participants: string[];
  };
  collaboration: {
    sharedPointer: boolean;
    syncedNavigation: boolean;
    realTimeAnnotation: boolean;
    voiceChat: boolean;
    textChat: boolean;
  };
}

interface VREnvironment {
  id: string;
  name: string;
  type: 'operating_room' | 'classroom' | 'conference_room' | 'anatomy_lab';
  description: string;
  maxUsers: number;
  features: {
    spatialAudio: boolean;
    handTracking: boolean;
    eyeTracking: boolean;
    physicsSimulation: boolean;
    realTimeRendering: boolean;
  };
  medicalAssets: {
    anatomyModels: string[];
    medicalDevices: string[];
    pharmaceuticals: string[];
    procedureGuides: string[];
  };
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'audio' | 'annotation' | 'system';
  priority: 'normal' | 'urgent' | 'critical';
  medicalContext?: string;
}

const CollaborativeVRReview: React.FC = () => {
  const [collaborativeSessions, setCollaborativeSessions] = useState<CollaborativeSession[]>([]);
  const [activeSession, setActiveSession] = useState<string>('');
  const [vrEnvironments, setVREnvironments] = useState<VREnvironment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<CollaborativeUser | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isVRConnected, setIsVRConnected] = useState(false);
  const [sessionSettings, setSessionSettings] = useState({
    audioEnabled: true,
    videoEnabled: true,
    annotationEnabled: true,
    recordingEnabled: false,
    inviteEnabled: true,
    moderationEnabled: true
  });

  // Initialize collaborative sessions and environments
  useEffect(() => {
    const mockSessions: CollaborativeSession[] = [
      {
        id: 'session-001',
        name: 'Cardiac Surgery Case Review',
        type: 'case_review',
        status: 'active',
        host: 'user-001',
        participants: [
          {
            id: 'user-001',
            name: 'Dr. Sarah Johnson',
            role: 'surgeon',
            avatar: '/avatars/surgeon1.jpg',
            isOnline: true,
            isInVR: true,
            deviceType: 'vr',
            permissions: {
              canAnnotate: true,
              canMeasure: true,
              canModify: true,
              canRecord: true,
              canInvite: true
            },
            presence: {
              position: { x: 0, y: 1.7, z: 0 },
              orientation: { x: 0, y: 0, z: 0 },
              isActive: true,
              lastActivity: '2024-01-15T14:30:00Z'
            },
            audio: {
              isMuted: false,
              isDeafened: false,
              volume: 80,
              quality: 'high'
            },
            video: {
              isEnabled: true,
              quality: 'high',
              frameRate: 60
            }
          },
          {
            id: 'user-002',
            name: 'Dr. Michael Chen',
            role: 'resident',
            avatar: '/avatars/resident1.jpg',
            isOnline: true,
            isInVR: true,
            deviceType: 'vr',
            permissions: {
              canAnnotate: true,
              canMeasure: true,
              canModify: false,
              canRecord: false,
              canInvite: false
            },
            presence: {
              position: { x: 2, y: 1.8, z: 1 },
              orientation: { x: 0, y: -45, z: 0 },
              isActive: true,
              lastActivity: '2024-01-15T14:29:00Z'
            },
            audio: {
              isMuted: false,
              isDeafened: false,
              volume: 75,
              quality: 'high'
            },
            video: {
              isEnabled: false,
              quality: 'medium',
              frameRate: 30
            }
          },
          {
            id: 'user-003',
            name: 'Student - Alex Wilson',
            role: 'student',
            avatar: '/avatars/student1.jpg',
            isOnline: true,
            isInVR: false,
            deviceType: 'desktop',
            permissions: {
              canAnnotate: false,
              canMeasure: false,
              canModify: false,
              canRecord: false,
              canInvite: false
            },
            presence: {
              position: { x: -1, y: 0, z: 2 },
              orientation: { x: 0, y: 180, z: 0 },
              isActive: true,
              lastActivity: '2024-01-15T14:28:00Z'
            },
            audio: {
              isMuted: true,
              isDeafened: false,
              volume: 60,
              quality: 'medium'
            },
            video: {
              isEnabled: false,
              quality: 'low',
              frameRate: 15
            }
          }
        ],
        maxParticipants: 8,
        startTime: '2024-01-15T14:00:00Z',
        duration: '45m',
        medicalCase: {
          patientId: 'PAT-2024-001',
          studyId: 'STU-CT-2024-045',
          diagnosis: 'Coronary Artery Disease',
          modality: 'CT Angiography',
          urgency: 'high'
        },
        sharedContent: {
          medicalImages: ['CT-001', 'CT-002', 'CT-003'],
          annotations: 12,
          measurements: 8,
          documents: ['Surgery-Plan-001', 'Patient-History-001']
        },
        recording: {
          isEnabled: true,
          duration: '45m',
          size: '2.3GB',
          participants: ['user-001', 'user-002', 'user-003']
        },
        collaboration: {
          sharedPointer: true,
          syncedNavigation: true,
          realTimeAnnotation: true,
          voiceChat: true,
          textChat: true
        }
      }
    ];
    setCollaborativeSessions(mockSessions);

    const mockEnvironments: VREnvironment[] = [
      {
        id: 'env-001',
        name: 'Operating Room Suite',
        type: 'operating_room',
        description: 'Realistic operating room environment for surgical planning',
        maxUsers: 8,
        features: {
          spatialAudio: true,
          handTracking: true,
          eyeTracking: true,
          physicsSimulation: true,
          realTimeRendering: true
        },
        medicalAssets: {
          anatomyModels: ['Heart-3D', 'Lung-3D', 'Brain-3D'],
          medicalDevices: ['Scalpel', 'Forceps', 'Sutures', 'Monitors'],
          pharmaceuticals: ['Anesthesia', 'Antibiotics', 'Pain-Management'],
          procedureGuides: ['CABG-Guide', 'Valve-Repair', 'Bypass-Surgery']
        }
      },
      {
        id: 'env-002',
        name: 'Medical Classroom',
        type: 'classroom',
        description: 'Interactive classroom for medical education',
        maxUsers: 20,
        features: {
          spatialAudio: true,
          handTracking: false,
          eyeTracking: false,
          physicsSimulation: false,
          realTimeRendering: true
        },
        medicalAssets: {
          anatomyModels: ['Full-Body-Atlas', 'Organ-Systems', 'Skeletal-System'],
          medicalDevices: ['Stethoscope', 'Thermometer', 'BP-Cuff'],
          pharmaceuticals: ['Drug-Database', 'Interaction-Guide'],
          procedureGuides: ['Basic-Examination', 'Diagnostic-Procedures']
        }
      }
    ];
    setVREnvironments(mockEnvironments);

    // Mock current user
    const mockCurrentUser: CollaborativeUser = {
      id: 'user-current',
      name: 'Dr. Current User',
      role: 'surgeon',
      avatar: '/avatars/current-user.jpg',
      isOnline: true,
      isInVR: false,
      deviceType: 'desktop',
      permissions: {
        canAnnotate: true,
        canMeasure: true,
        canModify: true,
        canRecord: true,
        canInvite: true
      },
      presence: {
        position: { x: 0, y: 0, z: 0 },
        orientation: { x: 0, y: 0, z: 0 },
        isActive: true,
        lastActivity: '2024-01-15T14:30:00Z'
      },
      audio: {
        isMuted: false,
        isDeafened: false,
        volume: 80,
        quality: 'high'
      },
      video: {
        isEnabled: true,
        quality: 'high',
        frameRate: 60
      }
    };
    setCurrentUser(mockCurrentUser);

    // Mock chat messages
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg-001',
        userId: 'user-001',
        userName: 'Dr. Sarah Johnson',
        message: 'Let\'s focus on the LAD stenosis in this case',
        timestamp: '2024-01-15T14:25:00Z',
        type: 'text',
        priority: 'normal',
        medicalContext: 'Coronary Artery Analysis'
      },
      {
        id: 'msg-002',
        userId: 'user-002',
        userName: 'Dr. Michael Chen',
        message: 'I\'ve added measurements to the critical areas',
        timestamp: '2024-01-15T14:26:00Z',
        type: 'annotation',
        priority: 'normal',
        medicalContext: 'Measurement Annotation'
      },
      {
        id: 'msg-003',
        userId: 'system',
        userName: 'System',
        message: 'Recording started - all participants consented',
        timestamp: '2024-01-15T14:27:00Z',
        type: 'system',
        priority: 'normal'
      }
    ];
    setChatMessages(mockMessages);
  }, []);

  const handleJoinSession = (sessionId: string) => {
    setActiveSession(sessionId);
    setIsVRConnected(true);
    // Connect to backend CollaborativeReview.ts
    console.log('Joining collaborative session:', sessionId);
  };

  const handleLeaveSession = () => {
    setActiveSession('');
    setIsVRConnected(false);
    console.log('Leaving collaborative session');
  };

  const handleToggleAudio = (userId: string) => {
    // Toggle audio for user
    console.log('Toggling audio for user:', userId);
  };

  const handleToggleVideo = (userId: string) => {
    // Toggle video for user
    console.log('Toggling video for user:', userId);
  };

  const handleSendMessage = (message: string) => {
    if (currentUser && message.trim()) {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        type: 'text',
        priority: 'normal'
      };
      setChatMessages(prev => [...prev, newMessage]);
    }
  };

  const handleInviteUser = () => {
    console.log('Inviting user to session');
  };

  const handleKickUser = (userId: string) => {
    console.log('Kicking user from session:', userId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-medsight-normal';
      case 'paused': return 'text-medsight-accent';
      case 'waiting': return 'text-medsight-pending';
      case 'ended': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayIcon className="w-4 h-4" />;
      case 'paused': return <PauseIcon className="w-4 h-4" />;
      case 'waiting': return <ClockIcon className="w-4 h-4" />;
      case 'ended': return <StopIcon className="w-4 h-4" />;
      default: return <XCircleIcon className="w-4 h-4" />;
    }
  };

  const getUserRoleColor = (role: string) => {
    switch (role) {
      case 'surgeon': return 'text-red-600 bg-red-100';
      case 'resident': return 'text-blue-600 bg-blue-100';
      case 'student': return 'text-green-600 bg-green-100';
      case 'instructor': return 'text-purple-600 bg-purple-100';
      case 'observer': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Collaborative Review Header */}
      <div className="medsight-glass p-6 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-medsight-primary/10 rounded-xl">
              <UserGroupIcon className="w-8 h-8 text-medsight-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-medsight-primary">Collaborative VR Review</h2>
              <p className="text-gray-600">Multi-user medical examination and collaboration</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${isVRConnected ? 'text-medsight-normal' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${isVRConnected ? 'bg-medsight-normal animate-pulse' : 'bg-gray-400'}`} />
              <span className="font-medium">{isVRConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            {isVRConnected && (
              <button 
                onClick={handleLeaveSession}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
              >
                <StopIcon className="w-4 h-4 mr-2 inline" />
                Leave Session
              </button>
            )}
          </div>
        </div>

        {/* Collaboration Safety Notice */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Medical Collaboration Protocols Active - All sessions are recorded for quality assurance
            </span>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {collaborativeSessions.map((session) => (
          <div key={session.id} className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  session.type === 'case_review' ? 'bg-blue-100' :
                  session.type === 'surgery_planning' ? 'bg-red-100' :
                  session.type === 'education' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {session.type === 'case_review' ? <DocumentTextIcon className="w-5 h-5 text-blue-600" /> :
                   session.type === 'surgery_planning' ? <HeartIcon className="w-5 h-5 text-red-600" /> :
                   session.type === 'education' ? <AcademicCapIcon className="w-5 h-5 text-green-600" /> :
                   <UserGroupIcon className="w-5 h-5 text-gray-600" />}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{session.name}</h3>
                  <p className="text-sm text-gray-600">{session.medicalCase.diagnosis}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getStatusColor(session.status)}`}>
                {getStatusIcon(session.status)}
                <span className="text-sm font-medium capitalize">{session.status}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium ml-2">{session.duration}</span>
                </div>
                <div>
                  <span className="text-gray-600">Participants:</span>
                  <span className="font-medium ml-2">{session.participants.length}/{session.maxParticipants}</span>
                </div>
                <div>
                  <span className="text-gray-600">Patient:</span>
                  <span className="font-medium ml-2">{session.medicalCase.patientId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Urgency:</span>
                  <span className={`font-medium ml-2 ${
                    session.medicalCase.urgency === 'critical' ? 'text-red-600' :
                    session.medicalCase.urgency === 'high' ? 'text-orange-600' :
                    session.medicalCase.urgency === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {session.medicalCase.urgency}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Participants:</h4>
                <div className="flex flex-wrap gap-2">
                  {session.participants.map((participant) => (
                    <div 
                      key={participant.id}
                      className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100 text-sm"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        participant.isOnline ? 'bg-medsight-normal' : 'bg-gray-400'
                      }`} />
                      <span>{participant.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getUserRoleColor(participant.role)}`}>
                        {participant.role}
                      </span>
                      {participant.isInVR && (
                        <CubeIcon className="w-3 h-3 text-medsight-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Annotations:</span>
                  <span className="font-medium ml-2">{session.sharedContent.annotations}</span>
                </div>
                <div>
                  <span className="text-gray-600">Measurements:</span>
                  <span className="font-medium ml-2">{session.sharedContent.measurements}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs">
                <div className={`flex items-center space-x-1 ${session.collaboration.voiceChat ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <SpeakerWaveIcon className="w-4 h-4" />
                  <span>Voice</span>
                </div>
                <div className={`flex items-center space-x-1 ${session.collaboration.textChat ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  <span>Chat</span>
                </div>
                <div className={`flex items-center space-x-1 ${session.collaboration.sharedPointer ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <ViewfinderCircleIcon className="w-4 h-4" />
                  <span>Shared</span>
                </div>
                <div className={`flex items-center space-x-1 ${session.recording.isEnabled ? 'text-red-600' : 'text-gray-400'}`}>
                  <VideoCameraIcon className="w-4 h-4" />
                  <span>Recording</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => handleJoinSession(session.id)}
                  className="flex-1 py-2 px-4 bg-medsight-primary text-white rounded-lg hover:bg-medsight-primary/90 transition-colors"
                >
                  <PlayIcon className="w-4 h-4 mr-2 inline" />
                  Join Session
                </button>
                <button className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <ShareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VR Environment Selection */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">VR Environments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vrEnvironments.map((env) => (
            <div 
              key={env.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedEnvironment === env.id
                  ? 'border-medsight-primary bg-medsight-primary/5'
                  : 'border-gray-200 hover:border-medsight-primary/50'
              }`}
              onClick={() => setSelectedEnvironment(env.id)}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  env.type === 'operating_room' ? 'bg-red-100' :
                  env.type === 'classroom' ? 'bg-blue-100' :
                  env.type === 'conference_room' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {env.type === 'operating_room' ? <HeartIcon className="w-5 h-5 text-red-600" /> :
                   env.type === 'classroom' ? <AcademicCapIcon className="w-5 h-5 text-blue-600" /> :
                   env.type === 'conference_room' ? <UserGroupIcon className="w-5 h-5 text-green-600" /> :
                   <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />}
                </div>
                <div>
                  <h4 className="font-medium">{env.name}</h4>
                  <p className="text-sm text-gray-600">{env.description}</p>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Max Users:</span>
                <span className="font-medium ml-2">{env.maxUsers}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Compliance */}
      <div className="medsight-glass p-4 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-medsight-normal" />
            <span className="text-sm font-medium text-medsight-normal">Medical Collaboration Compliance</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-medsight-normal">HIPAA Compliant</span>
            <span className="text-medsight-normal">Secure Recording</span>
            <span className="text-medsight-normal">Encrypted Communications</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeVRReview; 