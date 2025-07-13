'use client';

import React, { useState, useEffect } from 'react';
import { 
  CubeIcon, EyeIcon, HandRaisedIcon, PlayIcon, PauseIcon, 
  Cog6ToothIcon, UsersIcon, ChartBarIcon, ExclamationTriangleIcon,
  CheckCircleIcon, XCircleIcon, HeartIcon, ShieldCheckIcon,
  Square3Stack3DIcon, ViewfinderCircleIcon, AcademicCapIcon,
  DocumentTextIcon, UserGroupIcon, MicrophoneIcon, VideoCameraIcon,
  ArrowPathIcon, SignalIcon, FireIcon, BoltIcon, CpuChipIcon,
  InformationCircleIcon, WifiIcon, CloudIcon, ClockIcon
} from '@heroicons/react/24/outline';

interface VREnvironment {
  id: string;
  name: string;
  type: 'surgery' | 'anatomy' | 'training' | 'consultation';
  status: 'active' | 'loading' | 'error' | 'ready';
  medicalProcedure: string;
  participants: number;
  immersionLevel: 'low' | 'medium' | 'high';
  renderQuality: 'standard' | 'high' | 'ultra';
  hapticFeedback: boolean;
  eyeTracking: boolean;
  handTracking: boolean;
  performance: {
    fps: number;
    latency: number;
    cpuUsage: number;
    gpuUsage: number;
  };
}

interface VRUser {
  id: string;
  name: string;
  role: 'surgeon' | 'resident' | 'student' | 'observer';
  avatar: string;
  position: { x: number; y: number; z: number };
  isActive: boolean;
  headsetConnected: boolean;
  controllersConnected: boolean;
}

interface VRMedicalData {
  patientId: string;
  studyId: string;
  anatomyModel: string;
  surgicalPlan: string;
  annotations: Array<{
    id: string;
    type: 'measurement' | 'annotation' | 'highlight';
    position: { x: number; y: number; z: number };
    content: string;
    author: string;
    timestamp: string;
  }>;
  measurements: Array<{
    id: string;
    type: 'distance' | 'angle' | 'volume' | 'area';
    value: number;
    unit: string;
    points: Array<{ x: number; y: number; z: number }>;
  }>;
}

const MedicalVRInterface: React.FC = () => {
  const [vrEnvironments, setVREnvironments] = useState<VREnvironment[]>([]);
  const [activeEnvironment, setActiveEnvironment] = useState<string>('');
  const [vrUsers, setVRUsers] = useState<VRUser[]>([]);
  const [vrMedicalData, setVRMedicalData] = useState<VRMedicalData | null>(null);
  const [isVRActive, setIsVRActive] = useState(false);
  const [vrSettings, setVRSettings] = useState({
    immersionLevel: 'high',
    renderQuality: 'high',
    hapticFeedback: true,
    spatialAudio: true,
    eyeTracking: true,
    handTracking: true,
    comfort: 'standard'
  });

  // Initialize VR environments
  useEffect(() => {
    const mockEnvironments: VREnvironment[] = [
      {
        id: 'cardiac-surgery',
        name: 'Cardiac Surgery Suite',
        type: 'surgery',
        status: 'active',
        medicalProcedure: 'Coronary Artery Bypass',
        participants: 4,
        immersionLevel: 'high',
        renderQuality: 'ultra',
        hapticFeedback: true,
        eyeTracking: true,
        handTracking: true,
        performance: { fps: 90, latency: 11, cpuUsage: 65, gpuUsage: 78 }
      },
      {
        id: 'anatomy-explorer',
        name: 'Human Anatomy Explorer',
        type: 'anatomy',
        status: 'ready',
        medicalProcedure: 'Anatomical Study',
        participants: 0,
        immersionLevel: 'medium',
        renderQuality: 'high',
        hapticFeedback: false,
        eyeTracking: true,
        handTracking: true,
        performance: { fps: 72, latency: 8, cpuUsage: 45, gpuUsage: 52 }
      },
      {
        id: 'surgical-training',
        name: 'Surgical Training Lab',
        type: 'training',
        status: 'ready',
        medicalProcedure: 'Laparoscopic Surgery',
        participants: 0,
        immersionLevel: 'high',
        renderQuality: 'high',
        hapticFeedback: true,
        eyeTracking: false,
        handTracking: true,
        performance: { fps: 90, latency: 12, cpuUsage: 70, gpuUsage: 85 }
      }
    ];
    setVREnvironments(mockEnvironments);

    // Mock VR users
    const mockUsers: VRUser[] = [
      {
        id: 'user-1',
        name: 'Dr. Sarah Johnson',
        role: 'surgeon',
        avatar: '/avatars/surgeon1.jpg',
        position: { x: 0, y: 1.7, z: 0 },
        isActive: true,
        headsetConnected: true,
        controllersConnected: true
      },
      {
        id: 'user-2',
        name: 'Dr. Michael Chen',
        role: 'resident',
        avatar: '/avatars/resident1.jpg',
        position: { x: 2, y: 1.8, z: 1 },
        isActive: true,
        headsetConnected: true,
        controllersConnected: true
      }
    ];
    setVRUsers(mockUsers);

    // Mock medical data
    const mockMedicalData: VRMedicalData = {
      patientId: 'PAT-2024-001',
      studyId: 'STU-CT-2024-045',
      anatomyModel: 'Heart-3D-Model-v2.3',
      surgicalPlan: 'CABG-Plan-2024-001',
      annotations: [
        {
          id: 'ann-1',
          type: 'highlight',
          position: { x: 0.5, y: 0.2, z: 0.3 },
          content: 'Stenosis location - 90% occlusion',
          author: 'Dr. Sarah Johnson',
          timestamp: '2024-01-15T10:30:00Z'
        }
      ],
      measurements: [
        {
          id: 'meas-1',
          type: 'distance',
          value: 12.5,
          unit: 'mm',
          points: [{ x: 0, y: 0, z: 0 }, { x: 0.125, y: 0, z: 0 }]
        }
      ]
    };
    setVRMedicalData(mockMedicalData);
  }, []);

  const handleStartVR = (environmentId: string) => {
    setActiveEnvironment(environmentId);
    setIsVRActive(true);
    // Connect to backend MedicalVR.ts
    console.log('Starting VR environment:', environmentId);
  };

  const handleStopVR = () => {
    setIsVRActive(false);
    setActiveEnvironment('');
    console.log('Stopping VR session');
  };

  const handleSettingsChange = (setting: string, value: any) => {
    setVRSettings(prev => ({ ...prev, [setting]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-medsight-normal';
      case 'ready': return 'text-medsight-accent';
      case 'loading': return 'text-medsight-pending';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'ready': return <PlayIcon className="w-4 h-4" />;
      case 'loading': return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
      case 'error': return <XCircleIcon className="w-4 h-4" />;
      default: return <XCircleIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* VR Status Header */}
      <div className="medsight-glass p-6 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-medsight-primary/10 rounded-xl">
              <CubeIcon className="w-8 h-8 text-medsight-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-medsight-primary">Medical VR Interface</h2>
              <p className="text-gray-600">Immersive medical visualization and surgical planning</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${isVRActive ? 'text-medsight-normal' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${isVRActive ? 'bg-medsight-normal animate-pulse' : 'bg-gray-400'}`} />
              <span className="font-medium">{isVRActive ? 'VR Active' : 'VR Inactive'}</span>
            </div>
            {isVRActive && (
              <button 
                onClick={handleStopVR}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
              >
                <PauseIcon className="w-4 h-4 mr-2 inline" />
                Stop VR
              </button>
            )}
          </div>
        </div>

        {/* Emergency VR Exit */}
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">VR Emergency Exit Protocol</span>
            </div>
            <button className="text-xs bg-red-600 text-white px-3 py-1 rounded font-medium">
              EMERGENCY EXIT
            </button>
          </div>
        </div>
      </div>

      {/* VR Environment Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {vrEnvironments.map((env) => (
          <div 
            key={env.id}
            className={`medsight-glass p-6 rounded-xl border-2 cursor-pointer transition-all ${
              activeEnvironment === env.id
                ? 'border-medsight-primary bg-medsight-primary/5'
                : 'border-gray-200 hover:border-medsight-primary/50'
            }`}
            onClick={() => !isVRActive && handleStartVR(env.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  env.type === 'surgery' ? 'bg-red-100' :
                  env.type === 'anatomy' ? 'bg-blue-100' :
                  env.type === 'training' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {env.type === 'surgery' ? <HeartIcon className="w-5 h-5 text-red-600" /> :
                   env.type === 'anatomy' ? <AcademicCapIcon className="w-5 h-5 text-blue-600" /> :
                   env.type === 'training' ? <UserGroupIcon className="w-5 h-5 text-green-600" /> :
                   <DocumentTextIcon className="w-5 h-5 text-gray-600" />}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{env.name}</h3>
                  <p className="text-sm text-gray-600">{env.medicalProcedure}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getStatusColor(env.status)}`}>
                {getStatusIcon(env.status)}
                <span className="text-sm font-medium capitalize">{env.status}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Participants:</span>
                  <span className="font-medium ml-2">{env.participants}</span>
                </div>
                <div>
                  <span className="text-gray-600">Quality:</span>
                  <span className="font-medium ml-2 capitalize">{env.renderQuality}</span>
                </div>
                <div>
                  <span className="text-gray-600">FPS:</span>
                  <span className="font-medium ml-2">{env.performance.fps}</span>
                </div>
                <div>
                  <span className="text-gray-600">Latency:</span>
                  <span className="font-medium ml-2">{env.performance.latency}ms</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs">
                <div className={`flex items-center space-x-1 ${env.hapticFeedback ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <HandRaisedIcon className="w-4 h-4" />
                  <span>Haptic</span>
                </div>
                <div className={`flex items-center space-x-1 ${env.eyeTracking ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <EyeIcon className="w-4 h-4" />
                  <span>Eye Track</span>
                </div>
                <div className={`flex items-center space-x-1 ${env.handTracking ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <ViewfinderCircleIcon className="w-4 h-4" />
                  <span>Hand Track</span>
                </div>
              </div>

              {env.id === activeEnvironment && isVRActive && (
                <div className="mt-4 p-3 bg-medsight-primary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-medsight-primary">Active Session</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-medsight-normal rounded-full animate-pulse" />
                      <span className="text-xs text-medsight-normal">Recording</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* VR Controls and Settings */}
      {isVRActive && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* VR Users */}
          <div className="medsight-glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-medsight-primary mb-4">VR Participants</h3>
            <div className="space-y-3">
              {vrUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-medsight-primary/10 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-medsight-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-medsight-normal' : 'bg-gray-400'}`} />
                    <span className="text-xs">{user.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Data */}
          <div className="medsight-glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-medsight-primary mb-4">Medical Data</h3>
            {vrMedicalData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Patient ID:</span>
                    <span className="font-medium ml-2">{vrMedicalData.patientId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Study ID:</span>
                    <span className="font-medium ml-2">{vrMedicalData.studyId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Annotations:</span>
                    <span className="font-medium ml-2">{vrMedicalData.annotations.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Measurements:</span>
                    <span className="font-medium ml-2">{vrMedicalData.measurements.length}</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Recent Annotation</h4>
                  {vrMedicalData.annotations[0] && (
                    <p className="text-sm">{vrMedicalData.annotations[0].content}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medical Compliance */}
      <div className="medsight-glass p-4 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-medsight-normal" />
            <span className="text-sm font-medium text-medsight-normal">Medical VR Compliance</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-medsight-normal">HIPAA Compliant</span>
            <span className="text-medsight-normal">FDA Class II</span>
            <span className="text-medsight-normal">Medical Device</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalVRInterface; 