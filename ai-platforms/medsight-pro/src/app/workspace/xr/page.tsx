'use client';

import React, { useState, useEffect } from 'react';
import { 
  CubeIcon, 
  CameraIcon, 
  HandRaisedIcon,
  GlobeAltIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  Cog6ToothIcon,
  UsersIcon,
  ChartBarIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  HeartIcon,
  ShieldCheckIcon,
  CloudIcon,
  Square3Stack3DIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  WifiIcon,
  BoltIcon,
  CpuChipIcon,
  CircleStackIcon,
  ClockIcon,
  FireIcon,
  LightBulbIcon,
  PaintBrushIcon,
  CubeTransparentIcon,
  ChartPieIcon,
  SparklesIcon,
  MicrophoneIcon,
  SpeakerXMarkIcon,
  ViewfinderCircleIcon,
  RectangleGroupIcon,
  ArrowPathIcon,
  SignalIcon,
  MapIcon,
  TagIcon,
  StarIcon,
  HomeIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface XREnvironment {
  id: string;
  name: string;
  type: 'vr' | 'ar' | 'mixed';
  status: 'active' | 'inactive' | 'setup' | 'calibrating';
  description: string;
  quality: 'high' | 'medium' | 'low';
  participants: number;
  medicalUseCase: string;
  lastUsed: string;
  devices: string[];
  tracking: {
    headset: boolean;
    controllers: boolean;
    eyeTracking: boolean;
    handTracking: boolean;
  };
  performance: {
    fps: number;
    latency: number;
    renderTime: number;
  };
}

interface XRSession {
  id: string;
  name: string;
  type: 'diagnosis' | 'surgery' | 'training' | 'consultation';
  participants: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: 'active' | 'idle' | 'away';
  }>;
  duration: string;
  recording: boolean;
  medicalData: {
    patientId?: string;
    studyId?: string;
    procedureType?: string;
    annotations: number;
    measurements: number;
  };
}

interface HapticFeedback {
  id: string;
  type: 'vibration' | 'force' | 'texture' | 'temperature';
  intensity: number;
  duration: number;
  pattern: string;
  medicalContext: string;
  enabled: boolean;
}

const MedicalXRWorkspace: React.FC = () => {
  const [activeEnvironment, setActiveEnvironment] = useState<string>('vr-surgery');
  const [xrSessions, setXrSessions] = useState<XRSession[]>([]);
  const [hapticSettings, setHapticSettings] = useState<HapticFeedback[]>([]);
  const [isVRActive, setIsVRActive] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    vr: { online: true, devices: 3, latency: 12 },
    ar: { online: true, devices: 2, latency: 8 },
    haptic: { online: true, devices: 4, latency: 2 },
    tracking: { online: true, accuracy: 99.8 }
  });
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [xrMetrics, setXrMetrics] = useState({
    totalSessions: 127,
    activeUsers: 8,
    avgSessionTime: '45m',
    systemUptime: '99.9%',
    medicalProcedures: 34,
    trainingHours: 156
  });

  // Mock XR environments
  const xrEnvironments: XREnvironment[] = [
    {
      id: 'vr-surgery',
      name: 'Virtual Surgery Suite',
      type: 'vr',
      status: 'active',
      description: 'Immersive surgical planning and training environment',
      quality: 'high',
      participants: 3,
      medicalUseCase: 'Cardiac Surgery Planning',
      lastUsed: '2 minutes ago',
      devices: ['Meta Quest Pro', 'HTC Vive Pro', 'Haptic Gloves'],
      tracking: {
        headset: true,
        controllers: true,
        eyeTracking: true,
        handTracking: true
      },
      performance: {
        fps: 90,
        latency: 11,
        renderTime: 8.5
      }
    },
    {
      id: 'ar-anatomy',
      name: 'AR Anatomy Explorer',
      type: 'ar',
      status: 'active',
      description: 'Augmented reality anatomical visualization',
      quality: 'high',
      participants: 2,
      medicalUseCase: 'Medical Education',
      lastUsed: '5 minutes ago',
      devices: ['HoloLens 2', 'Magic Leap 2'],
      tracking: {
        headset: true,
        controllers: false,
        eyeTracking: true,
        handTracking: true
      },
      performance: {
        fps: 60,
        latency: 8,
        renderTime: 12.3
      }
    },
    {
      id: 'mixed-consultation',
      name: 'Mixed Reality Consultation',
      type: 'mixed',
      status: 'setup',
      description: 'Collaborative medical consultation space',
      quality: 'medium',
      participants: 0,
      medicalUseCase: 'Remote Consultation',
      lastUsed: '1 hour ago',
      devices: ['Varjo Aero', 'Apple Vision Pro'],
      tracking: {
        headset: true,
        controllers: true,
        eyeTracking: true,
        handTracking: true
      },
      performance: {
        fps: 72,
        latency: 15,
        renderTime: 10.2
      }
    }
  ];

  // Mock XR sessions
  useEffect(() => {
    const mockSessions: XRSession[] = [
      {
        id: 'session-1',
        name: 'Cardiac Surgery Planning',
        type: 'surgery',
        participants: [
          { id: '1', name: 'Dr. Sarah Johnson', role: 'Surgeon', avatar: '/avatars/surgeon1.jpg', status: 'active' },
          { id: '2', name: 'Dr. Michael Chen', role: 'Cardiologist', avatar: '/avatars/cardio1.jpg', status: 'active' },
          { id: '3', name: 'Dr. Emily Rodriguez', role: 'Anesthesiologist', avatar: '/avatars/anesthesia1.jpg', status: 'idle' }
        ],
        duration: '1h 23m',
        recording: true,
        medicalData: {
          patientId: 'PAT-2024-001',
          studyId: 'STU-CT-2024-045',
          procedureType: 'CABG',
          annotations: 15,
          measurements: 8
        }
      },
      {
        id: 'session-2',
        name: 'Medical Student Training',
        type: 'training',
        participants: [
          { id: '4', name: 'Dr. Alex Thompson', role: 'Instructor', avatar: '/avatars/instructor1.jpg', status: 'active' },
          { id: '5', name: 'Student - Jake Wilson', role: 'Student', avatar: '/avatars/student1.jpg', status: 'active' }
        ],
        duration: '45m',
        recording: false,
        medicalData: {
          procedureType: 'Basic Anatomy',
          annotations: 23,
          measurements: 12
        }
      }
    ];
    setXrSessions(mockSessions);

    // Mock haptic settings
    const mockHapticSettings: HapticFeedback[] = [
      {
        id: 'haptic-1',
        type: 'force',
        intensity: 75,
        duration: 500,
        pattern: 'pulse',
        medicalContext: 'Tissue resistance during surgery',
        enabled: true
      },
      {
        id: 'haptic-2', 
        type: 'vibration',
        intensity: 60,
        duration: 200,
        pattern: 'burst',
        medicalContext: 'Instrument collision warning',
        enabled: true
      }
    ];
    setHapticSettings(mockHapticSettings);
  }, []);

  const handleEnvironmentSwitch = (environmentId: string) => {
    setActiveEnvironment(environmentId);
  };

  const handleSessionStart = (sessionType: string) => {
    if (sessionType === 'vr') {
      setIsVRActive(true);
    } else if (sessionType === 'ar') {
      setIsARActive(true);
    }
  };

  const handleSessionStop = (sessionType: string) => {
    if (sessionType === 'vr') {
      setIsVRActive(false);
    } else if (sessionType === 'ar') {
      setIsARActive(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-medsight-normal';
      case 'inactive': return 'text-gray-400';
      case 'setup': return 'text-medsight-pending';
      case 'calibrating': return 'text-medsight-accent';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'inactive': return <XCircleIcon className="w-4 h-4" />;
      case 'setup': return <Cog6ToothIcon className="w-4 h-4 animate-spin" />;
      case 'calibrating': return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
      default: return <XCircleIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl mb-6 border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CubeTransparentIcon className="w-8 h-8 text-medsight-primary" />
              <div>
                <h1 className="text-2xl font-bold text-medsight-primary">Medical XR Workspace</h1>
                <p className="text-gray-600">Immersive medical visualization and collaboration</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-medsight-normal" />
              <span className="text-sm font-medium text-medsight-normal">
                {xrMetrics.activeUsers} Active Users
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5 text-medsight-accent" />
              <span className="text-sm font-medium text-medsight-accent">
                {xrMetrics.totalSessions} Sessions
              </span>
            </div>
            <button 
              onClick={() => setShowSystemInfo(!showSystemInfo)}
              className="btn-medsight flex items-center space-x-2"
            >
              <InformationCircleIcon className="w-4 h-4" />
              <span>System Info</span>
            </button>
          </div>
        </div>

        {/* Emergency Protocols */}
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">XR Emergency Protocols Active</span>
            <button className="ml-auto text-xs bg-red-600 text-white px-2 py-1 rounded">
              Emergency Exit
            </button>
          </div>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* VR System Status */}
        <div className="medsight-glass p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <CubeIcon className="w-5 h-5 text-medsight-primary" />
              <h3 className="font-medium text-medsight-primary">VR System</h3>
            </div>
            <div className={`flex items-center space-x-1 ${systemStatus.vr.online ? 'text-medsight-normal' : 'text-red-500'}`}>
              <div className={`w-2 h-2 rounded-full ${systemStatus.vr.online ? 'bg-medsight-normal' : 'bg-red-500'}`} />
              <span className="text-sm">{systemStatus.vr.online ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Devices</span>
              <span className="font-medium">{systemStatus.vr.devices}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Latency</span>
              <span className="font-medium">{systemStatus.vr.latency}ms</span>
            </div>
            <button 
              onClick={() => handleSessionStart('vr')}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                isVRActive 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-medsight-primary/10 text-medsight-primary hover:bg-medsight-primary/20'
              }`}
            >
              {isVRActive ? 'Stop VR Session' : 'Start VR Session'}
            </button>
          </div>
        </div>

        {/* AR System Status */}
        <div className="medsight-glass p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <EyeIcon className="w-5 h-5 text-medsight-secondary" />
              <h3 className="font-medium text-medsight-secondary">AR System</h3>
            </div>
            <div className={`flex items-center space-x-1 ${systemStatus.ar.online ? 'text-medsight-normal' : 'text-red-500'}`}>
              <div className={`w-2 h-2 rounded-full ${systemStatus.ar.online ? 'bg-medsight-normal' : 'bg-red-500'}`} />
              <span className="text-sm">{systemStatus.ar.online ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Devices</span>
              <span className="font-medium">{systemStatus.ar.devices}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Latency</span>
              <span className="font-medium">{systemStatus.ar.latency}ms</span>
            </div>
            <button 
              onClick={() => handleSessionStart('ar')}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                isARActive 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-medsight-secondary/10 text-medsight-secondary hover:bg-medsight-secondary/20'
              }`}
            >
              {isARActive ? 'Stop AR Session' : 'Start AR Session'}
            </button>
          </div>
        </div>

        {/* Haptic System Status */}
        <div className="medsight-glass p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <HandRaisedIcon className="w-5 h-5 text-medsight-accent" />
              <h3 className="font-medium text-medsight-accent">Haptic System</h3>
            </div>
            <div className={`flex items-center space-x-1 ${systemStatus.haptic.online ? 'text-medsight-normal' : 'text-red-500'}`}>
              <div className={`w-2 h-2 rounded-full ${systemStatus.haptic.online ? 'bg-medsight-normal' : 'bg-red-500'}`} />
              <span className="text-sm">{systemStatus.haptic.online ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Devices</span>
              <span className="font-medium">{systemStatus.haptic.devices}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Latency</span>
              <span className="font-medium">{systemStatus.haptic.latency}ms</span>
            </div>
            <button className="w-full py-2 px-3 rounded-lg text-sm font-medium bg-medsight-accent/10 text-medsight-accent hover:bg-medsight-accent/20 transition-colors">
              Calibrate Haptics
            </button>
          </div>
        </div>

        {/* Tracking System Status */}
        <div className="medsight-glass p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ViewfinderCircleIcon className="w-5 h-5 text-medsight-primary" />
              <h3 className="font-medium text-medsight-primary">Tracking</h3>
            </div>
            <div className={`flex items-center space-x-1 ${systemStatus.tracking.online ? 'text-medsight-normal' : 'text-red-500'}`}>
              <div className={`w-2 h-2 rounded-full ${systemStatus.tracking.online ? 'bg-medsight-normal' : 'bg-red-500'}`} />
              <span className="text-sm">{systemStatus.tracking.online ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Accuracy</span>
              <span className="font-medium">{systemStatus.tracking.accuracy}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Calibration</span>
              <span className="font-medium text-medsight-normal">Complete</span>
            </div>
            <button className="w-full py-2 px-3 rounded-lg text-sm font-medium bg-medsight-primary/10 text-medsight-primary hover:bg-medsight-primary/20 transition-colors">
              Recalibrate
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* XR Environments */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-medsight-primary">XR Environments</h2>
            <button className="btn-medsight text-sm">
              <Square3Stack3DIcon className="w-4 h-4 mr-1" />
              Create New
            </button>
          </div>
          <div className="space-y-4">
            {xrEnvironments.map((env) => (
              <div 
                key={env.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  activeEnvironment === env.id
                    ? 'border-medsight-primary bg-medsight-primary/5'
                    : 'border-gray-200 hover:border-medsight-primary/50'
                }`}
                onClick={() => handleEnvironmentSwitch(env.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${
                      env.type === 'vr' ? 'bg-medsight-primary/10' :
                      env.type === 'ar' ? 'bg-medsight-secondary/10' : 'bg-medsight-accent/10'
                    }`}>
                      {env.type === 'vr' ? <CubeIcon className="w-4 h-4" /> :
                       env.type === 'ar' ? <EyeIcon className="w-4 h-4" /> : <GlobeAltIcon className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-medium">{env.name}</h3>
                      <p className="text-sm text-gray-600">{env.description}</p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 ${getStatusColor(env.status)}`}>
                    {getStatusIcon(env.status)}
                    <span className="text-sm capitalize">{env.status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{env.medicalUseCase}</span>
                  <span>{env.participants} participants</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs">
                    <span>FPS: {env.performance.fps}</span>
                    <span>Latency: {env.performance.latency}ms</span>
                  </div>
                  <span className="text-xs text-gray-500">{env.lastUsed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Sessions */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-medsight-primary">Active Sessions</h2>
            <button className="btn-medsight text-sm">
              <UsersIcon className="w-4 h-4 mr-1" />
              Join Session
            </button>
          </div>
          <div className="space-y-4">
            {xrSessions.map((session) => (
              <div key={session.id} className="p-4 rounded-lg border border-gray-200 hover:border-medsight-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${
                      session.type === 'surgery' ? 'bg-red-100' :
                      session.type === 'training' ? 'bg-blue-100' :
                      session.type === 'consultation' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {session.type === 'surgery' ? <CubeIcon className="w-4 h-4 text-red-600" /> :
                       session.type === 'training' ? <AcademicCapIcon className="w-4 h-4 text-blue-600" /> :
                       session.type === 'consultation' ? <UserGroupIcon className="w-4 h-4 text-green-600" /> :
                       <DocumentTextIcon className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div>
                      <h3 className="font-medium">{session.name}</h3>
                      <p className="text-sm text-gray-600">Duration: {session.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {session.recording && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                        <span className="text-xs">Recording</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-600">{session.participants.length} participants</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  {session.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        participant.status === 'active' ? 'bg-medsight-normal' :
                        participant.status === 'idle' ? 'bg-medsight-accent' : 'bg-gray-400'
                      }`} />
                      <span className="text-xs">{participant.name}</span>
                    </div>
                  ))}
                </div>
                {session.medicalData && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-center justify-between">
                      <span>Patient: {session.medicalData.patientId}</span>
                      <span>Annotations: {session.medicalData.annotations}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Medical Compliance Notice */}
      <div className="mt-6 medsight-glass p-4 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-medsight-normal" />
            <span className="text-sm font-medium text-medsight-normal">Medical XR Compliance</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-medsight-normal">HIPAA Compliant</span>
            <span className="text-medsight-normal">FDA Class II</span>
            <span className="text-medsight-normal">ISO 27001</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalXRWorkspace; 