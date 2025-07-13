'use client';

import React, { useState, useEffect } from 'react';
import { 
  Square3Stack3DIcon, CubeTransparentIcon, SparklesIcon, 
  LightBulbIcon, PaintBrushIcon, AdjustmentsHorizontalIcon,
  EyeIcon, ViewfinderCircleIcon, MagnifyingGlassIcon,
  PlayIcon, PauseIcon, StopIcon, ArrowPathIcon,
  CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon,
  ShieldCheckIcon, CpuChipIcon, BoltIcon, SignalIcon,
  HeartIcon, AcademicCapIcon, UserGroupIcon, DocumentTextIcon,
  ChartBarIcon, ClockIcon, InformationCircleIcon, Cog6ToothIcon,
  CameraIcon, VideoCameraIcon, PhotoIcon, SpeakerWaveIcon,
  WifiIcon, CloudIcon, FireIcon, RectangleGroupIcon,
  TagIcon, MapIcon, BuildingOfficeIcon, UserIcon,
  HandRaisedIcon, CubeIcon, GlobeAltIcon, UsersIcon
} from '@heroicons/react/24/outline';

interface HolographicDisplay {
  id: string;
  name: string;
  type: 'looking_glass' | 'hologram_table' | 'air_display' | 'mixed_reality';
  status: 'active' | 'inactive' | 'calibrating' | 'error';
  resolution: string;
  refreshRate: number;
  viewingAngle: number;
  brightness: number;
  contrast: number;
  colorGamut: string;
  stereoscopicCapability: boolean;
  multiUserViewing: boolean;
  maxViewers: number;
  currentViewers: number;
  medicalCertification: boolean;
  location: string;
  lastCalibration: string;
  batteryLevel?: number;
  powerConsumption: number;
}

interface HolographicContent {
  id: string;
  name: string;
  type: 'anatomy' | 'pathology' | 'surgical_plan' | 'medical_device' | 'medication';
  medicalContext: string;
  patientId?: string;
  studyId?: string;
  modality: 'CT' | 'MRI' | 'PET' | 'Ultrasound' | 'X-Ray' | '3D_Model';
  resolution: string;
  fileSize: string;
  renderQuality: 'low' | 'medium' | 'high' | 'ultra';
  animationEnabled: boolean;
  interactionEnabled: boolean;
  annotationsCount: number;
  measurements: Array<{
    id: string;
    type: 'distance' | 'area' | 'volume' | 'angle';
    value: number;
    unit: string;
  }>;
  lastModified: string;
  createdBy: string;
  medicalApproval: {
    approved: boolean;
    approvedBy?: string;
    approvalDate?: string;
    comments?: string;
  };
}

interface HolographicSession {
  id: string;
  name: string;
  type: 'diagnosis' | 'surgery_planning' | 'education' | 'research' | 'presentation';
  status: 'active' | 'paused' | 'completed' | 'scheduled';
  startTime: string;
  duration: string;
  participants: Array<{
    id: string;
    name: string;
    role: 'surgeon' | 'resident' | 'student' | 'researcher' | 'observer';
    position: string;
    isActive: boolean;
  }>;
  medicalCase: {
    patientId: string;
    diagnosis: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    procedureType?: string;
  };
  content: HolographicContent[];
  displaySettings: {
    brightness: number;
    contrast: number;
    scale: number;
    rotation: { x: number; y: number; z: number };
    position: { x: number; y: number; z: number };
  };
  interaction: {
    gestureControl: boolean;
    voiceCommands: boolean;
    eyeTracking: boolean;
    handTracking: boolean;
  };
  recording: {
    enabled: boolean;
    quality: 'standard' | 'high' | 'ultra';
    participants: string[];
    duration: string;
    fileSize: string;
  };
}

interface HolographicSettings {
  globalBrightness: number;
  globalContrast: number;
  autoCalibration: boolean;
  medicalMode: boolean;
  safetyLimits: boolean;
  powerSaving: boolean;
  displayTimeout: number;
  gestureRecognition: boolean;
  voiceControl: boolean;
  eyeTrackingEnabled: boolean;
  handTrackingEnabled: boolean;
  spatialAudio: boolean;
  hapticFeedback: boolean;
  medicalAnnotations: boolean;
  measurementTools: boolean;
  collaborativeMode: boolean;
  recordingEnabled: boolean;
  emergencyOverride: boolean;
}

const HolographicImagingControls: React.FC = () => {
  const [holographicDisplays, setHolographicDisplays] = useState<HolographicDisplay[]>([]);
  const [holographicContent, setHolographicContent] = useState<HolographicContent[]>([]);
  const [holographicSessions, setHolographicSessions] = useState<HolographicSession[]>([]);
  const [activeSession, setActiveSession] = useState<string>('');
  const [selectedDisplay, setSelectedDisplay] = useState<string>('');
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [isHologramActive, setIsHologramActive] = useState(false);
  const [holographicSettings, setHolographicSettings] = useState<HolographicSettings>({
    globalBrightness: 80,
    globalContrast: 75,
    autoCalibration: true,
    medicalMode: true,
    safetyLimits: true,
    powerSaving: false,
    displayTimeout: 30,
    gestureRecognition: true,
    voiceControl: true,
    eyeTrackingEnabled: true,
    handTrackingEnabled: true,
    spatialAudio: true,
    hapticFeedback: false,
    medicalAnnotations: true,
    measurementTools: true,
    collaborativeMode: true,
    recordingEnabled: false,
    emergencyOverride: false
  });

  // Initialize holographic displays and content
  useEffect(() => {
    const mockDisplays: HolographicDisplay[] = [
      {
        id: 'display-001',
        name: 'Looking Glass Portrait - OR Suite 1',
        type: 'looking_glass',
        status: 'active',
        resolution: '2048x2048',
        refreshRate: 60,
        viewingAngle: 58,
        brightness: 85,
        contrast: 80,
        colorGamut: 'sRGB',
        stereoscopicCapability: true,
        multiUserViewing: true,
        maxViewers: 4,
        currentViewers: 2,
        medicalCertification: true,
        location: 'Operating Room Suite 1',
        lastCalibration: '2024-01-15T08:00:00Z',
        powerConsumption: 45
      },
      {
        id: 'display-002',
        name: 'Hologram Table - Education Room',
        type: 'hologram_table',
        status: 'active',
        resolution: '4096x4096',
        refreshRate: 120,
        viewingAngle: 360,
        brightness: 90,
        contrast: 85,
        colorGamut: 'DCI-P3',
        stereoscopicCapability: true,
        multiUserViewing: true,
        maxViewers: 8,
        currentViewers: 5,
        medicalCertification: true,
        location: 'Medical Education Room',
        lastCalibration: '2024-01-14T16:30:00Z',
        powerConsumption: 120
      },
      {
        id: 'display-003',
        name: 'Air Display - Conference Room',
        type: 'air_display',
        status: 'calibrating',
        resolution: '1920x1080',
        refreshRate: 30,
        viewingAngle: 180,
        brightness: 75,
        contrast: 70,
        colorGamut: 'sRGB',
        stereoscopicCapability: false,
        multiUserViewing: true,
        maxViewers: 12,
        currentViewers: 0,
        medicalCertification: false,
        location: 'Conference Room A',
        lastCalibration: '2024-01-13T10:00:00Z',
        batteryLevel: 88,
        powerConsumption: 25
      }
    ];
    setHolographicDisplays(mockDisplays);

    const mockContent: HolographicContent[] = [
      {
        id: 'content-001',
        name: 'Human Heart - 3D Anatomy',
        type: 'anatomy',
        medicalContext: 'Cardiac anatomy visualization for surgical planning',
        patientId: 'PAT-2024-001',
        studyId: 'STU-CT-2024-045',
        modality: 'CT',
        resolution: '4096x4096x512',
        fileSize: '2.8GB',
        renderQuality: 'ultra',
        animationEnabled: true,
        interactionEnabled: true,
        annotationsCount: 15,
        measurements: [
          { id: 'meas-001', type: 'volume', value: 650, unit: 'ml' },
          { id: 'meas-002', type: 'distance', value: 12.5, unit: 'mm' },
          { id: 'meas-003', type: 'area', value: 45.2, unit: 'cm²' }
        ],
        lastModified: '2024-01-15T10:30:00Z',
        createdBy: 'Dr. Sarah Johnson',
        medicalApproval: {
          approved: true,
          approvedBy: 'Dr. Michael Chen',
          approvalDate: '2024-01-15T09:00:00Z',
          comments: 'Approved for surgical planning use'
        }
      },
      {
        id: 'content-002',
        name: 'Brain Tumor - Pathology',
        type: 'pathology',
        medicalContext: 'Glioblastoma visualization for surgical resection planning',
        patientId: 'PAT-2024-002',
        studyId: 'STU-MRI-2024-089',
        modality: 'MRI',
        resolution: '2048x2048x256',
        fileSize: '1.5GB',
        renderQuality: 'high',
        animationEnabled: false,
        interactionEnabled: true,
        annotationsCount: 8,
        measurements: [
          { id: 'meas-004', type: 'volume', value: 23.7, unit: 'cm³' },
          { id: 'meas-005', type: 'distance', value: 4.2, unit: 'mm' }
        ],
        lastModified: '2024-01-14T14:20:00Z',
        createdBy: 'Dr. Emily Rodriguez',
        medicalApproval: {
          approved: false,
          comments: 'Pending radiology review'
        }
      },
      {
        id: 'content-003',
        name: 'Surgical Instrument Set',
        type: 'medical_device',
        medicalContext: 'Laparoscopic surgery instrument training',
        modality: '3D_Model',
        resolution: '1024x1024x1024',
        fileSize: '500MB',
        renderQuality: 'medium',
        animationEnabled: true,
        interactionEnabled: true,
        annotationsCount: 12,
        measurements: [
          { id: 'meas-006', type: 'distance', value: 5.0, unit: 'mm' },
          { id: 'meas-007', type: 'angle', value: 30, unit: 'degrees' }
        ],
        lastModified: '2024-01-13T11:45:00Z',
        createdBy: 'Dr. Alex Thompson',
        medicalApproval: {
          approved: true,
          approvedBy: 'Dr. Sarah Johnson',
          approvalDate: '2024-01-13T12:00:00Z',
          comments: 'Approved for training use'
        }
      }
    ];
    setHolographicContent(mockContent);

    const mockSessions: HolographicSession[] = [
      {
        id: 'session-001',
        name: 'Cardiac Surgery Planning',
        type: 'surgery_planning',
        status: 'active',
        startTime: '2024-01-15T14:00:00Z',
        duration: '1h 15m',
        participants: [
          { id: 'user-001', name: 'Dr. Sarah Johnson', role: 'surgeon', position: 'Lead', isActive: true },
          { id: 'user-002', name: 'Dr. Michael Chen', role: 'surgeon', position: 'Assistant', isActive: true },
          { id: 'user-003', name: 'Dr. Emily Rodriguez', role: 'resident', position: 'Observer', isActive: true }
        ],
        medicalCase: {
          patientId: 'PAT-2024-001',
          diagnosis: 'Coronary Artery Disease',
          urgency: 'high',
          procedureType: 'CABG'
        },
        content: [mockContent[0]],
        displaySettings: {
          brightness: 85,
          contrast: 80,
          scale: 1.2,
          rotation: { x: 0, y: 0, z: 0 },
          position: { x: 0, y: 0, z: 0 }
        },
        interaction: {
          gestureControl: true,
          voiceCommands: true,
          eyeTracking: true,
          handTracking: true
        },
        recording: {
          enabled: true,
          quality: 'high',
          participants: ['user-001', 'user-002', 'user-003'],
          duration: '1h 15m',
          fileSize: '8.5GB'
        }
      }
    ];
    setHolographicSessions(mockSessions);
  }, []);

  const handleStartHologram = (displayId: string, contentId: string) => {
    setSelectedDisplay(displayId);
    setSelectedContent(contentId);
    setIsHologramActive(true);
    // Connect to backend HolographicImaging.ts
    console.log('Starting hologram:', { displayId, contentId });
  };

  const handleStopHologram = () => {
    setIsHologramActive(false);
    setSelectedDisplay('');
    setSelectedContent('');
    console.log('Stopping hologram');
  };

  const handleSessionStart = (sessionId: string) => {
    setActiveSession(sessionId);
    console.log('Starting holographic session:', sessionId);
  };

  const handleSessionStop = () => {
    setActiveSession('');
    console.log('Stopping holographic session');
  };

  const handleDisplayCalibration = (displayId: string) => {
    console.log('Starting display calibration:', displayId);
  };

  const handleSettingsChange = (setting: keyof HolographicSettings, value: any) => {
    setHolographicSettings(prev => ({ ...prev, [setting]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-medsight-normal';
      case 'inactive': return 'text-gray-400';
      case 'calibrating': return 'text-medsight-accent';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'inactive': return <XCircleIcon className="w-4 h-4" />;
      case 'calibrating': return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
      case 'error': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <XCircleIcon className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Holographic Imaging Header */}
      <div className="medsight-glass p-6 rounded-xl border border-medsight-accent/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-medsight-accent/10 rounded-xl">
              <Square3Stack3DIcon className="w-8 h-8 text-medsight-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-medsight-accent">Holographic Imaging Controls</h2>
              <p className="text-gray-600">3D medical visualization and holographic display systems</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${isHologramActive ? 'text-medsight-normal' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${isHologramActive ? 'bg-medsight-normal animate-pulse' : 'bg-gray-400'}`} />
              <span className="font-medium">{isHologramActive ? 'Hologram Active' : 'Hologram Inactive'}</span>
            </div>
            {isHologramActive && (
              <button 
                onClick={handleStopHologram}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
              >
                <StopIcon className="w-4 h-4 mr-2 inline" />
                Stop Hologram
              </button>
            )}
          </div>
        </div>

        {/* Holographic Safety Notice */}
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              Medical Holographic Display Active - Certified for clinical use
            </span>
          </div>
        </div>
      </div>

      {/* Holographic Displays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {holographicDisplays.map((display) => (
          <div key={display.id} className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  display.type === 'looking_glass' ? 'bg-blue-100' :
                  display.type === 'hologram_table' ? 'bg-green-100' :
                  display.type === 'air_display' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {display.type === 'looking_glass' ? <CubeTransparentIcon className="w-5 h-5 text-blue-600" /> :
                   display.type === 'hologram_table' ? <RectangleGroupIcon className="w-5 h-5 text-green-600" /> :
                   display.type === 'air_display' ? <SparklesIcon className="w-5 h-5 text-purple-600" /> :
                   <Square3Stack3DIcon className="w-5 h-5 text-gray-600" />}
                </div>
                <div>
                  <h3 className="font-semibold">{display.name}</h3>
                  <p className="text-sm text-gray-600">{display.location}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getStatusColor(display.status)}`}>
                {getStatusIcon(display.status)}
                <span className="text-sm font-medium capitalize">{display.status}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Resolution:</span>
                  <span className="font-medium ml-2">{display.resolution}</span>
                </div>
                <div>
                  <span className="text-gray-600">Refresh Rate:</span>
                  <span className="font-medium ml-2">{display.refreshRate}Hz</span>
                </div>
                <div>
                  <span className="text-gray-600">Viewers:</span>
                  <span className="font-medium ml-2">{display.currentViewers}/{display.maxViewers}</span>
                </div>
                <div>
                  <span className="text-gray-600">Brightness:</span>
                  <span className="font-medium ml-2">{display.brightness}%</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs">
                <div className={`flex items-center space-x-1 ${display.stereoscopicCapability ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <EyeIcon className="w-3 h-3" />
                  <span>3D</span>
                </div>
                <div className={`flex items-center space-x-1 ${display.multiUserViewing ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <UsersIcon className="w-3 h-3" />
                  <span>Multi-User</span>
                </div>
                <div className={`flex items-center space-x-1 ${display.medicalCertification ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <ShieldCheckIcon className="w-3 h-3" />
                  <span>Medical</span>
                </div>
              </div>

              <div className="text-sm">
                <span className="text-gray-600">Power:</span>
                <span className="font-medium ml-2">{display.powerConsumption}W</span>
                {display.batteryLevel && (
                  <>
                    <span className="text-gray-600 ml-4">Battery:</span>
                    <span className="font-medium ml-2">{display.batteryLevel}%</span>
                  </>
                )}
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => handleDisplayCalibration(display.id)}
                  className="flex-1 py-2 px-3 text-sm bg-medsight-accent/10 text-medsight-accent rounded-lg hover:bg-medsight-accent/20 transition-colors"
                >
                  Calibrate
                </button>
                <button className="flex-1 py-2 px-3 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Settings
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Holographic Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Library */}
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-accent mb-4">Holographic Content</h3>
          <div className="space-y-4">
            {holographicContent.map((content) => (
              <div 
                key={content.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedContent === content.id
                    ? 'border-medsight-accent bg-medsight-accent/5'
                    : 'border-gray-200 hover:border-medsight-accent/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      content.type === 'anatomy' ? 'bg-blue-100' :
                      content.type === 'pathology' ? 'bg-red-100' :
                      content.type === 'surgical_plan' ? 'bg-green-100' :
                      content.type === 'medical_device' ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      {content.type === 'anatomy' ? <HeartIcon className="w-4 h-4 text-blue-600" /> :
                       content.type === 'pathology' ? <ExclamationTriangleIcon className="w-4 h-4 text-red-600" /> :
                       content.type === 'surgical_plan' ? <DocumentTextIcon className="w-4 h-4 text-green-600" /> :
                       content.type === 'medical_device' ? <Cog6ToothIcon className="w-4 h-4 text-purple-600" /> :
                       <CubeIcon className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{content.name}</h4>
                      <p className="text-sm text-gray-600">{content.modality}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    content.medicalApproval.approved ? 'bg-medsight-normal text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {content.medicalApproval.approved ? 'Approved' : 'Pending'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Quality:</span>
                    <span className="font-medium ml-2 capitalize">{content.renderQuality}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium ml-2">{content.fileSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Annotations:</span>
                    <span className="font-medium ml-2">{content.annotationsCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Measurements:</span>
                    <span className="font-medium ml-2">{content.measurements.length}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs mb-3">
                  <div className={`flex items-center space-x-1 ${content.animationEnabled ? 'text-medsight-normal' : 'text-gray-400'}`}>
                    <PlayIcon className="w-3 h-3" />
                    <span>Animation</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${content.interactionEnabled ? 'text-medsight-normal' : 'text-gray-400'}`}>
                    <HandRaisedIcon className="w-3 h-3" />
                    <span>Interactive</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-3 h-3" />
                    <span>{content.createdBy}</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 mb-3">
                  {content.medicalContext}
                </div>
                
                <button 
                  onClick={() => handleStartHologram(holographicDisplays[0]?.id, content.id)}
                  className="w-full py-2 px-4 bg-medsight-accent/10 text-medsight-accent rounded-lg hover:bg-medsight-accent/20 transition-colors"
                >
                  Display Hologram
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Active Sessions */}
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-accent mb-4">Active Sessions</h3>
          <div className="space-y-4">
            {holographicSessions.map((session) => (
              <div key={session.id} className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      session.type === 'surgery_planning' ? 'bg-red-100' :
                      session.type === 'education' ? 'bg-blue-100' :
                      session.type === 'research' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {session.type === 'surgery_planning' ? <HeartIcon className="w-4 h-4 text-red-600" /> :
                       session.type === 'education' ? <AcademicCapIcon className="w-4 h-4 text-blue-600" /> :
                       session.type === 'research' ? <DocumentTextIcon className="w-4 h-4 text-green-600" /> :
                       <UserGroupIcon className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{session.name}</h4>
                      <p className="text-sm text-gray-600">{session.medicalCase.diagnosis}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Urgency:</span>
                    <span className={`font-medium ml-2 ${getUrgencyColor(session.medicalCase.urgency)}`}>
                      {session.medicalCase.urgency}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium ml-2">{session.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Participants:</span>
                    <span className="font-medium ml-2">{session.participants.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Content:</span>
                    <span className="font-medium ml-2">{session.content.length} items</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Recording:</span>
                    <span className={`font-medium ml-2 ${session.recording.enabled ? 'text-red-600' : 'text-gray-400'}`}>
                      {session.recording.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs mb-3">
                  <div className={`flex items-center space-x-1 ${session.interaction.gestureControl ? 'text-medsight-normal' : 'text-gray-400'}`}>
                    <HandRaisedIcon className="w-3 h-3" />
                    <span>Gesture</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${session.interaction.voiceCommands ? 'text-medsight-normal' : 'text-gray-400'}`}>
                    <SpeakerWaveIcon className="w-3 h-3" />
                    <span>Voice</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${session.interaction.eyeTracking ? 'text-medsight-normal' : 'text-gray-400'}`}>
                    <EyeIcon className="w-3 h-3" />
                    <span>Eye</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleSessionStart(session.id)}
                    className="flex-1 py-2 px-3 text-sm bg-medsight-accent/10 text-medsight-accent rounded-lg hover:bg-medsight-accent/20 transition-colors"
                  >
                    <PlayIcon className="w-3 h-3 mr-1 inline" />
                    Join
                  </button>
                  <button className="flex-1 py-2 px-3 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <InformationCircleIcon className="w-3 h-3 mr-1 inline" />
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Medical Compliance */}
      <div className="medsight-glass p-4 rounded-xl border border-medsight-accent/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-medsight-normal" />
            <span className="text-sm font-medium text-medsight-normal">Medical Holographic Compliance</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-medsight-normal">HIPAA Compliant</span>
            <span className="text-medsight-normal">FDA Class II</span>
            <span className="text-medsight-normal">Medical Device</span>
            <span className="text-medsight-normal">Certified Display</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolographicImagingControls; 