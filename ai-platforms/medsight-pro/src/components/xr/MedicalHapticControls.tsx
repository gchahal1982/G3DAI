'use client';

import React, { useState, useEffect } from 'react';
import { 
  HandRaisedIcon, Cog6ToothIcon, PlayIcon, PauseIcon, 
  ChartBarIcon, ExclamationTriangleIcon, CheckCircleIcon, 
  XCircleIcon, HeartIcon, ShieldCheckIcon, BoltIcon,
  AdjustmentsHorizontalIcon, SignalIcon, ClockIcon,
  CpuChipIcon, FireIcon, SpeakerWaveIcon, MagnifyingGlassIcon,
  ArrowPathIcon, InformationCircleIcon, WifiIcon, CloudIcon,
  ViewfinderCircleIcon, RectangleGroupIcon, TagIcon,
  LightBulbIcon, PaintBrushIcon, SparklesIcon, UsersIcon,
  DocumentTextIcon, UserGroupIcon, AcademicCapIcon,
  Square3Stack3DIcon, CubeTransparentIcon, BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface HapticDevice {
  id: string;
  name: string;
  type: 'glove' | 'stylus' | 'controller' | 'suit' | 'actuator';
  status: 'connected' | 'disconnected' | 'error' | 'calibrating';
  batteryLevel: number;
  firmwareVersion: string;
  lastCalibration: string;
  capabilities: {
    force: boolean;
    vibration: boolean;
    temperature: boolean;
    texture: boolean;
    position: boolean;
  };
  specifications: {
    maxForce: number;
    frequency: number;
    resolution: number;
    workspace: string;
  };
  currentSettings: {
    intensity: number;
    frequency: number;
    duration: number;
    pattern: string;
  };
}

interface HapticFeedback {
  id: string;
  name: string;
  type: 'force' | 'vibration' | 'texture' | 'temperature' | 'kinesthetic';
  medicalContext: string;
  intensity: number;
  frequency: number;
  duration: number;
  pattern: 'continuous' | 'pulse' | 'burst' | 'wave' | 'custom';
  enabled: boolean;
  triggers: Array<{
    condition: string;
    threshold: number;
    response: string;
  }>;
  medicalApplication: string;
  safetyLimits: {
    maxIntensity: number;
    maxDuration: number;
    cooldownTime: number;
  };
}

interface HapticSession {
  id: string;
  name: string;
  type: 'surgery' | 'training' | 'therapy' | 'examination';
  status: 'active' | 'paused' | 'completed' | 'error';
  startTime: string;
  duration: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    deviceId: string;
  }>;
  medicalProcedure: string;
  hapticData: {
    totalInteractions: number;
    forceEvents: number;
    vibrationEvents: number;
    averageIntensity: number;
    peakForce: number;
  };
  recordingEnabled: boolean;
}

interface MedicalHapticScenario {
  id: string;
  name: string;
  type: 'surgical' | 'diagnostic' | 'therapeutic' | 'educational';
  description: string;
  medicalProcedure: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: string;
  hapticElements: Array<{
    id: string;
    name: string;
    type: 'tissue' | 'bone' | 'fluid' | 'organ' | 'instrument';
    properties: {
      stiffness: number;
      damping: number;
      friction: number;
      texture: string;
    };
  }>;
  learningObjectives: string[];
  assessment: {
    precisionScore: number;
    forceControl: number;
    timeToComplete: number;
    errorRate: number;
  };
}

const MedicalHapticControls: React.FC = () => {
  const [hapticDevices, setHapticDevices] = useState<HapticDevice[]>([]);
  const [hapticFeedbacks, setHapticFeedbacks] = useState<HapticFeedback[]>([]);
  const [hapticSessions, setHapticSessions] = useState<HapticSession[]>([]);
  const [hapticScenarios, setHapticScenarios] = useState<MedicalHapticScenario[]>([]);
  const [activeSession, setActiveSession] = useState<string>('');
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isHapticActive, setIsHapticActive] = useState(false);
  const [hapticSettings, setHapticSettings] = useState({
    globalIntensity: 75,
    safetyMode: true,
    forceScaling: 1.0,
    vibrationEnabled: true,
    temperatureEnabled: false,
    textureEnabled: true,
    autoCalibration: true,
    emergencyStop: false
  });

  // Initialize haptic devices and feedback
  useEffect(() => {
    const mockDevices: HapticDevice[] = [
      {
        id: 'glove-001',
        name: 'SenseGlove DK1 - Right',
        type: 'glove',
        status: 'connected',
        batteryLevel: 92,
        firmwareVersion: '2.1.3',
        lastCalibration: '2024-01-15T09:00:00Z',
        capabilities: {
          force: true,
          vibration: true,
          temperature: false,
          texture: true,
          position: true
        },
        specifications: {
          maxForce: 40,
          frequency: 1000,
          resolution: 0.1,
          workspace: '20cm sphere'
        },
        currentSettings: {
          intensity: 75,
          frequency: 250,
          duration: 500,
          pattern: 'pulse'
        }
      },
      {
        id: 'stylus-001',
        name: 'Phantom Omni Stylus',
        type: 'stylus',
        status: 'connected',
        batteryLevel: 100,
        firmwareVersion: '1.8.2',
        lastCalibration: '2024-01-14T16:30:00Z',
        capabilities: {
          force: true,
          vibration: false,
          temperature: false,
          texture: true,
          position: true
        },
        specifications: {
          maxForce: 3.3,
          frequency: 1000,
          resolution: 0.03,
          workspace: '15cm cube'
        },
        currentSettings: {
          intensity: 80,
          frequency: 0,
          duration: 0,
          pattern: 'continuous'
        }
      },
      {
        id: 'suit-001',
        name: 'Ultraleap Haptic Suit',
        type: 'suit',
        status: 'calibrating',
        batteryLevel: 85,
        firmwareVersion: '3.0.1',
        lastCalibration: '2024-01-15T08:00:00Z',
        capabilities: {
          force: false,
          vibration: true,
          temperature: true,
          texture: true,
          position: false
        },
        specifications: {
          maxForce: 0,
          frequency: 200,
          resolution: 1.0,
          workspace: 'full body'
        },
        currentSettings: {
          intensity: 60,
          frequency: 100,
          duration: 200,
          pattern: 'wave'
        }
      }
    ];
    setHapticDevices(mockDevices);

    const mockFeedbacks: HapticFeedback[] = [
      {
        id: 'feedback-001',
        name: 'Tissue Resistance',
        type: 'force',
        medicalContext: 'Simulating tissue density during surgical cutting',
        intensity: 80,
        frequency: 0,
        duration: 0,
        pattern: 'continuous',
        enabled: true,
        triggers: [
          {
            condition: 'tool_contact',
            threshold: 0.5,
            response: 'gradual_increase'
          }
        ],
        medicalApplication: 'Surgical Training',
        safetyLimits: {
          maxIntensity: 90,
          maxDuration: 30000,
          cooldownTime: 1000
        }
      },
      {
        id: 'feedback-002',
        name: 'Heartbeat Simulation',
        type: 'vibration',
        medicalContext: 'Simulating patient heartbeat during examination',
        intensity: 65,
        frequency: 72,
        duration: 500,
        pattern: 'pulse',
        enabled: true,
        triggers: [
          {
            condition: 'examination_start',
            threshold: 1.0,
            response: 'immediate'
          }
        ],
        medicalApplication: 'Physical Examination',
        safetyLimits: {
          maxIntensity: 80,
          maxDuration: 600000,
          cooldownTime: 100
        }
      },
      {
        id: 'feedback-003',
        name: 'Bone Density',
        type: 'texture',
        medicalContext: 'Simulating bone hardness during drilling',
        intensity: 90,
        frequency: 300,
        duration: 0,
        pattern: 'continuous',
        enabled: true,
        triggers: [
          {
            condition: 'drill_contact',
            threshold: 0.8,
            response: 'immediate'
          }
        ],
        medicalApplication: 'Orthopedic Surgery',
        safetyLimits: {
          maxIntensity: 95,
          maxDuration: 60000,
          cooldownTime: 2000
        }
      }
    ];
    setHapticFeedbacks(mockFeedbacks);

    const mockSessions: HapticSession[] = [
      {
        id: 'session-001',
        name: 'Laparoscopic Surgery Training',
        type: 'training',
        status: 'active',
        startTime: '2024-01-15T10:00:00Z',
        duration: '45m',
        participants: [
          {
            id: 'user-001',
            name: 'Dr. Sarah Johnson',
            role: 'Trainee',
            deviceId: 'glove-001'
          },
          {
            id: 'user-002',
            name: 'Dr. Michael Chen',
            role: 'Instructor',
            deviceId: 'stylus-001'
          }
        ],
        medicalProcedure: 'Laparoscopic Cholecystectomy',
        hapticData: {
          totalInteractions: 1247,
          forceEvents: 523,
          vibrationEvents: 724,
          averageIntensity: 72.5,
          peakForce: 2.8
        },
        recordingEnabled: true
      }
    ];
    setHapticSessions(mockSessions);

    const mockScenarios: MedicalHapticScenario[] = [
      {
        id: 'scenario-001',
        name: 'Basic Suturing',
        type: 'surgical',
        description: 'Learn basic suturing techniques with realistic tissue feedback',
        medicalProcedure: 'Wound Closure',
        difficulty: 'beginner',
        duration: '30 minutes',
        hapticElements: [
          {
            id: 'tissue-001',
            name: 'Skin Tissue',
            type: 'tissue',
            properties: {
              stiffness: 0.6,
              damping: 0.3,
              friction: 0.4,
              texture: 'smooth'
            }
          },
          {
            id: 'needle-001',
            name: 'Suture Needle',
            type: 'instrument',
            properties: {
              stiffness: 0.9,
              damping: 0.1,
              friction: 0.2,
              texture: 'metallic'
            }
          }
        ],
        learningObjectives: [
          'Proper needle handling',
          'Consistent stitch spacing',
          'Appropriate tension control'
        ],
        assessment: {
          precisionScore: 0,
          forceControl: 0,
          timeToComplete: 0,
          errorRate: 0
        }
      }
    ];
    setHapticScenarios(mockScenarios);
  }, []);

  const handleStartHapticSession = (sessionId: string) => {
    setActiveSession(sessionId);
    setIsHapticActive(true);
    // Connect to backend MedicalHaptics.ts
    console.log('Starting haptic session:', sessionId);
  };

  const handleStopHapticSession = () => {
    setIsHapticActive(false);
    setActiveSession('');
    console.log('Stopping haptic session');
  };

  const handleDeviceCalibration = (deviceId: string) => {
    setSelectedDevice(deviceId);
    // Start calibration process
    console.log('Starting calibration for device:', deviceId);
  };

  const handleSettingsChange = (setting: string, value: any) => {
    setHapticSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleFeedbackToggle = (feedbackId: string) => {
    setHapticFeedbacks(prev => 
      prev.map(feedback => 
        feedback.id === feedbackId 
          ? { ...feedback, enabled: !feedback.enabled }
          : feedback
      )
    );
  };

  const handleEmergencyStop = () => {
    setHapticSettings(prev => ({ ...prev, emergencyStop: true }));
    setIsHapticActive(false);
    console.log('Emergency stop activated');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-medsight-normal';
      case 'active': return 'text-medsight-normal';
      case 'calibrating': return 'text-medsight-accent';
      case 'paused': return 'text-medsight-pending';
      case 'disconnected': return 'text-gray-400';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircleIcon className="w-4 h-4" />;
      case 'active': return <PlayIcon className="w-4 h-4" />;
      case 'calibrating': return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
      case 'paused': return <PauseIcon className="w-4 h-4" />;
      case 'disconnected': return <XCircleIcon className="w-4 h-4" />;
      case 'error': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <XCircleIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Haptic Status Header */}
      <div className="medsight-glass p-6 rounded-xl border border-medsight-accent/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-medsight-accent/10 rounded-xl">
              <HandRaisedIcon className="w-8 h-8 text-medsight-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-medsight-accent">Medical Haptic Controls</h2>
              <p className="text-gray-600">Tactile feedback systems for medical simulation</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${isHapticActive ? 'text-medsight-normal' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${isHapticActive ? 'bg-medsight-normal animate-pulse' : 'bg-gray-400'}`} />
              <span className="font-medium">{isHapticActive ? 'Haptic Active' : 'Haptic Inactive'}</span>
            </div>
            <button 
              onClick={handleEmergencyStop}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <ExclamationTriangleIcon className="w-4 h-4 mr-2 inline" />
              EMERGENCY STOP
            </button>
          </div>
        </div>

        {/* Haptic Safety Notice */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              Medical Haptic Safety Protocols Active - Maximum force limits enforced
            </span>
          </div>
        </div>
      </div>

      {/* Haptic Device Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hapticDevices.map((device) => (
          <div key={device.id} className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  device.type === 'glove' ? 'bg-blue-100' :
                  device.type === 'stylus' ? 'bg-green-100' :
                  device.type === 'suit' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {device.type === 'glove' ? <HandRaisedIcon className="w-5 h-5 text-blue-600" /> :
                   device.type === 'stylus' ? <ViewfinderCircleIcon className="w-5 h-5 text-green-600" /> :
                   device.type === 'suit' ? <UsersIcon className="w-5 h-5 text-purple-600" /> :
                   <Cog6ToothIcon className="w-5 h-5 text-gray-600" />}
                </div>
                <div>
                  <h3 className="font-semibold">{device.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{device.type}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getStatusColor(device.status)}`}>
                {getStatusIcon(device.status)}
                <span className="text-sm font-medium capitalize">{device.status}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Battery:</span>
                  <span className="font-medium ml-2">{device.batteryLevel}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Max Force:</span>
                  <span className="font-medium ml-2">{device.specifications.maxForce}N</span>
                </div>
                <div>
                  <span className="text-gray-600">Intensity:</span>
                  <span className="font-medium ml-2">{device.currentSettings.intensity}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Pattern:</span>
                  <span className="font-medium ml-2 capitalize">{device.currentSettings.pattern}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className={`flex items-center space-x-1 ${device.capabilities.force ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <BoltIcon className="w-3 h-3" />
                  <span>Force</span>
                </div>
                <div className={`flex items-center space-x-1 ${device.capabilities.vibration ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <SpeakerWaveIcon className="w-3 h-3" />
                  <span>Vibration</span>
                </div>
                <div className={`flex items-center space-x-1 ${device.capabilities.texture ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <PaintBrushIcon className="w-3 h-3" />
                  <span>Texture</span>
                </div>
                <div className={`flex items-center space-x-1 ${device.capabilities.temperature ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <FireIcon className="w-3 h-3" />
                  <span>Temp</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => handleDeviceCalibration(device.id)}
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

      {/* Haptic Feedback Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Settings */}
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-accent mb-4">Haptic Feedback</h3>
          <div className="space-y-4">
            {hapticFeedbacks.map((feedback) => (
              <div 
                key={feedback.id} 
                className={`p-4 rounded-lg border-2 transition-all ${
                  feedback.enabled 
                    ? 'border-medsight-accent bg-medsight-accent/5' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      feedback.type === 'force' ? 'bg-red-100' :
                      feedback.type === 'vibration' ? 'bg-blue-100' :
                      feedback.type === 'texture' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {feedback.type === 'force' ? <BoltIcon className="w-4 h-4 text-red-600" /> :
                       feedback.type === 'vibration' ? <SpeakerWaveIcon className="w-4 h-4 text-blue-600" /> :
                       feedback.type === 'texture' ? <PaintBrushIcon className="w-4 h-4 text-green-600" /> :
                       <Cog6ToothIcon className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{feedback.name}</h4>
                      <p className="text-sm text-gray-600">{feedback.medicalApplication}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleFeedbackToggle(feedback.id)}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                      feedback.enabled 
                        ? 'bg-medsight-normal text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {feedback.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Intensity:</span>
                    <span className="font-medium ml-2">{feedback.intensity}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-medium ml-2">{feedback.frequency}Hz</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pattern:</span>
                    <span className="font-medium ml-2 capitalize">{feedback.pattern}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-600">
                  {feedback.medicalContext}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Sessions */}
        <div className="medsight-glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-medsight-accent mb-4">Active Sessions</h3>
          <div className="space-y-4">
            {hapticSessions.map((session) => (
              <div key={session.id} className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      session.type === 'surgery' ? 'bg-red-100' :
                      session.type === 'training' ? 'bg-blue-100' :
                      session.type === 'therapy' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {session.type === 'surgery' ? <HeartIcon className="w-4 h-4 text-red-600" /> :
                       session.type === 'training' ? <AcademicCapIcon className="w-4 h-4 text-blue-600" /> :
                       session.type === 'therapy' ? <UserGroupIcon className="w-4 h-4 text-green-600" /> :
                       <DocumentTextIcon className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{session.name}</h4>
                      <p className="text-sm text-gray-600">{session.medicalProcedure}</p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 ${getStatusColor(session.status)}`}>
                    {getStatusIcon(session.status)}
                    <span className="text-sm font-medium capitalize">{session.status}</span>
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
                    <span className="text-gray-600">Interactions:</span>
                    <span className="font-medium ml-2">{session.hapticData.totalInteractions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Peak Force:</span>
                    <span className="font-medium ml-2">{session.hapticData.peakForce}N</span>
                  </div>
                </div>
                
                {session.recordingEnabled && (
                  <div className="flex items-center space-x-2 text-xs text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    <span>Recording haptic data</span>
                  </div>
                )}
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
            <span className="text-sm font-medium text-medsight-normal">Medical Haptic Compliance</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-medsight-normal">HIPAA Compliant</span>
            <span className="text-medsight-normal">FDA Class II</span>
            <span className="text-medsight-normal">ISO 13485</span>
            <span className="text-medsight-normal">Safety Standards</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHapticControls; 