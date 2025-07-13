'use client';

import React, { useState, useEffect } from 'react';
import { 
  EyeIcon, CameraIcon, MapIcon, PlayIcon, PauseIcon, 
  Cog6ToothIcon, UsersIcon, ChartBarIcon, ExclamationTriangleIcon,
  CheckCircleIcon, XCircleIcon, HeartIcon, ShieldCheckIcon,
  Square3Stack3DIcon, ViewfinderCircleIcon, AcademicCapIcon,
  DocumentTextIcon, UserGroupIcon, MagnifyingGlassIcon, 
  ArrowPathIcon, SignalIcon, FireIcon, BoltIcon, CpuChipIcon,
  InformationCircleIcon, WifiIcon, CloudIcon, ClockIcon,
  SpeakerWaveIcon, MicrophoneIcon, VideoCameraIcon, TagIcon,
  LightBulbIcon, PaintBrushIcon, CubeTransparentIcon,
  SparklesIcon, RectangleGroupIcon, BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface AROverlay {
  id: string;
  name: string;
  type: 'anatomy' | 'procedure' | 'navigation' | 'measurement' | 'annotation';
  status: 'active' | 'inactive' | 'calibrating' | 'error';
  opacity: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  medicalContext: string;
  visibility: boolean;
  interactionMode: 'view' | 'edit' | 'measure' | 'annotate';
}

interface AREnvironment {
  id: string;
  name: string;
  type: 'surgery' | 'examination' | 'training' | 'consultation';
  status: 'active' | 'setup' | 'error' | 'ready';
  medicalProcedure: string;
  trackingQuality: 'excellent' | 'good' | 'poor';
  lightingConditions: 'optimal' | 'adequate' | 'poor';
  cameraCalibration: boolean;
  spatialMapping: boolean;
  participants: number;
  overlays: AROverlay[];
  performance: {
    fps: number;
    trackingAccuracy: number;
    latency: number;
    batteryLevel: number;
  };
}

interface ARMedicalData {
  patientId: string;
  studyId: string;
  anatomyModel: string;
  realTimeData: {
    heartRate: number;
    bloodPressure: string;
    oxygenSaturation: number;
    temperature: number;
    timestamp: string;
  };
  overlayData: Array<{
    id: string;
    type: 'organ' | 'vessel' | 'tumor' | 'implant' | 'measurement';
    name: string;
    size: number;
    position: { x: number; y: number; z: number };
    properties: Record<string, any>;
    confidence: number;
  }>;
}

interface ARDevice {
  id: string;
  name: string;
  type: 'hololens' | 'magicleap' | 'visionpro' | 'phone' | 'tablet';
  status: 'connected' | 'disconnected' | 'error';
  batteryLevel: number;
  calibrationStatus: 'calibrated' | 'needs_calibration' | 'calibrating';
  trackingCapabilities: {
    worldTracking: boolean;
    faceTracking: boolean;
    handTracking: boolean;
    eyeTracking: boolean;
  };
}

const MedicalARInterface: React.FC = () => {
  const [arEnvironments, setArEnvironments] = useState<AREnvironment[]>([]);
  const [activeEnvironment, setActiveEnvironment] = useState<string>('');
  const [arDevices, setArDevices] = useState<ARDevice[]>([]);
  const [arMedicalData, setArMedicalData] = useState<ARMedicalData | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [selectedOverlay, setSelectedOverlay] = useState<string>('');
  const [arSettings, setArSettings] = useState({
    overlayOpacity: 0.8,
    trackingMode: 'world',
    renderQuality: 'high',
    autoCalibration: true,
    spatialAudio: true,
    occlusionHandling: true,
    lightEstimation: true
  });

  // Initialize AR environments
  useEffect(() => {
    const mockEnvironments: AREnvironment[] = [
      {
        id: 'surgical-guidance',
        name: 'Surgical Guidance AR',
        type: 'surgery',
        status: 'active',
        medicalProcedure: 'Laparoscopic Surgery',
        trackingQuality: 'excellent',
        lightingConditions: 'optimal',
        cameraCalibration: true,
        spatialMapping: true,
        participants: 3,
        overlays: [
          {
            id: 'overlay-1',
            name: 'Anatomical Structure',
            type: 'anatomy',
            status: 'active',
            opacity: 0.8,
            position: { x: 0, y: 0, z: 0.5 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            medicalContext: 'Liver anatomy overlay',
            visibility: true,
            interactionMode: 'view'
          }
        ],
        performance: {
          fps: 60,
          trackingAccuracy: 98.5,
          latency: 8,
          batteryLevel: 85
        }
      },
      {
        id: 'anatomy-education',
        name: 'Anatomy Education AR',
        type: 'training',
        status: 'ready',
        medicalProcedure: 'Anatomical Study',
        trackingQuality: 'good',
        lightingConditions: 'adequate',
        cameraCalibration: true,
        spatialMapping: false,
        participants: 0,
        overlays: [],
        performance: {
          fps: 30,
          trackingAccuracy: 85.2,
          latency: 12,
          batteryLevel: 92
        }
      },
      {
        id: 'patient-examination',
        name: 'Patient Examination AR',
        type: 'examination',
        status: 'ready',
        medicalProcedure: 'Clinical Examination',
        trackingQuality: 'good',
        lightingConditions: 'optimal',
        cameraCalibration: true,
        spatialMapping: true,
        participants: 0,
        overlays: [],
        performance: {
          fps: 60,
          trackingAccuracy: 92.1,
          latency: 6,
          batteryLevel: 78
        }
      }
    ];
    setArEnvironments(mockEnvironments);

    // Mock AR devices
    const mockDevices: ARDevice[] = [
      {
        id: 'hololens-001',
        name: 'HoloLens 2 - OR Suite 1',
        type: 'hololens',
        status: 'connected',
        batteryLevel: 85,
        calibrationStatus: 'calibrated',
        trackingCapabilities: {
          worldTracking: true,
          faceTracking: false,
          handTracking: true,
          eyeTracking: true
        }
      },
      {
        id: 'magicleap-001',
        name: 'Magic Leap 2 - Training Room',
        type: 'magicleap',
        status: 'connected',
        batteryLevel: 92,
        calibrationStatus: 'calibrated',
        trackingCapabilities: {
          worldTracking: true,
          faceTracking: true,
          handTracking: true,
          eyeTracking: true
        }
      }
    ];
    setArDevices(mockDevices);

    // Mock medical data
    const mockMedicalData: ARMedicalData = {
      patientId: 'PAT-2024-002',
      studyId: 'STU-MRI-2024-067',
      anatomyModel: 'Liver-3D-Model-v1.8',
      realTimeData: {
        heartRate: 72,
        bloodPressure: '120/80',
        oxygenSaturation: 98,
        temperature: 98.6,
        timestamp: '2024-01-15T14:30:00Z'
      },
      overlayData: [
        {
          id: 'overlay-liver',
          type: 'organ',
          name: 'Liver',
          size: 1500,
          position: { x: 0.2, y: 0.1, z: 0.3 },
          properties: { volume: '1.5L', echogenicity: 'normal' },
          confidence: 0.95
        },
        {
          id: 'overlay-tumor',
          type: 'tumor',
          name: 'Hepatic Lesion',
          size: 25,
          position: { x: 0.15, y: 0.08, z: 0.25 },
          properties: { diameter: '2.5cm', suspicious: true },
          confidence: 0.87
        }
      ]
    };
    setArMedicalData(mockMedicalData);
  }, []);

  const handleStartAR = (environmentId: string) => {
    setActiveEnvironment(environmentId);
    setIsARActive(true);
    // Connect to backend MedicalAR.ts
    console.log('Starting AR environment:', environmentId);
  };

  const handleStopAR = () => {
    setIsARActive(false);
    setActiveEnvironment('');
    console.log('Stopping AR session');
  };

  const handleOverlayToggle = (overlayId: string) => {
    setSelectedOverlay(overlayId === selectedOverlay ? '' : overlayId);
  };

  const handleSettingsChange = (setting: string, value: any) => {
    setArSettings(prev => ({ ...prev, [setting]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-medsight-normal';
      case 'ready': return 'text-medsight-accent';
      case 'setup': return 'text-medsight-pending';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'ready': return <PlayIcon className="w-4 h-4" />;
      case 'setup': return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
      case 'error': return <XCircleIcon className="w-4 h-4" />;
      default: return <XCircleIcon className="w-4 h-4" />;
    }
  };

  const getTrackingQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-medsight-normal';
      case 'good': return 'text-medsight-accent';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* AR Status Header */}
      <div className="medsight-glass p-6 rounded-xl border border-medsight-secondary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-medsight-secondary/10 rounded-xl">
              <EyeIcon className="w-8 h-8 text-medsight-secondary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-medsight-secondary">Medical AR Interface</h2>
              <p className="text-gray-600">Augmented reality medical visualization and guidance</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${isARActive ? 'text-medsight-normal' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${isARActive ? 'bg-medsight-normal animate-pulse' : 'bg-gray-400'}`} />
              <span className="font-medium">{isARActive ? 'AR Active' : 'AR Inactive'}</span>
            </div>
            {isARActive && (
              <button 
                onClick={handleStopAR}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
              >
                <PauseIcon className="w-4 h-4 mr-2 inline" />
                Stop AR
              </button>
            )}
          </div>
        </div>

        {/* AR Safety Protocols */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">AR Safety Protocols Active</span>
            </div>
            <button className="text-xs bg-amber-600 text-white px-3 py-1 rounded font-medium">
              SAFETY PAUSE
            </button>
          </div>
        </div>
      </div>

      {/* AR Device Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {arDevices.map((device) => (
          <div key={device.id} className="medsight-glass p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${
                  device.type === 'hololens' ? 'bg-blue-100' :
                  device.type === 'magicleap' ? 'bg-purple-100' :
                  device.type === 'visionpro' ? 'bg-gray-100' : 'bg-green-100'
                }`}>
                  <EyeIcon className="w-5 h-5 text-medsight-secondary" />
                </div>
                <div>
                  <h3 className="font-medium">{device.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{device.type}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${
                device.status === 'connected' ? 'text-medsight-normal' : 'text-red-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  device.status === 'connected' ? 'bg-medsight-normal' : 'bg-red-500'
                }`} />
                <span className="text-sm capitalize">{device.status}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Battery:</span>
                <span className="font-medium">{device.batteryLevel}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Calibration:</span>
                <span className={`font-medium ${
                  device.calibrationStatus === 'calibrated' ? 'text-medsight-normal' : 'text-medsight-accent'
                }`}>
                  {device.calibrationStatus.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs mt-3">
                <div className={`flex items-center space-x-1 ${
                  device.trackingCapabilities.worldTracking ? 'text-medsight-normal' : 'text-gray-400'
                }`}>
                  <MapIcon className="w-3 h-3" />
                  <span>World</span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  device.trackingCapabilities.handTracking ? 'text-medsight-normal' : 'text-gray-400'
                }`}>
                  <ViewfinderCircleIcon className="w-3 h-3" />
                  <span>Hand</span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  device.trackingCapabilities.eyeTracking ? 'text-medsight-normal' : 'text-gray-400'
                }`}>
                  <EyeIcon className="w-3 h-3" />
                  <span>Eye</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AR Environment Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {arEnvironments.map((env) => (
          <div 
            key={env.id}
            className={`medsight-glass p-6 rounded-xl border-2 cursor-pointer transition-all ${
              activeEnvironment === env.id
                ? 'border-medsight-secondary bg-medsight-secondary/5'
                : 'border-gray-200 hover:border-medsight-secondary/50'
            }`}
            onClick={() => !isARActive && handleStartAR(env.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  env.type === 'surgery' ? 'bg-red-100' :
                  env.type === 'examination' ? 'bg-blue-100' :
                  env.type === 'training' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {env.type === 'surgery' ? <HeartIcon className="w-5 h-5 text-red-600" /> :
                   env.type === 'examination' ? <MagnifyingGlassIcon className="w-5 h-5 text-blue-600" /> :
                   env.type === 'training' ? <AcademicCapIcon className="w-5 h-5 text-green-600" /> :
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
                  <span className="text-gray-600">Tracking:</span>
                  <span className={`font-medium ml-2 ${getTrackingQualityColor(env.trackingQuality)}`}>
                    {env.trackingQuality}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Lighting:</span>
                  <span className="font-medium ml-2 capitalize">{env.lightingConditions}</span>
                </div>
                <div>
                  <span className="text-gray-600">FPS:</span>
                  <span className="font-medium ml-2">{env.performance.fps}</span>
                </div>
                <div>
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-medium ml-2">{env.performance.trackingAccuracy}%</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs">
                <div className={`flex items-center space-x-1 ${env.cameraCalibration ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <CameraIcon className="w-4 h-4" />
                  <span>Calibrated</span>
                </div>
                <div className={`flex items-center space-x-1 ${env.spatialMapping ? 'text-medsight-normal' : 'text-gray-400'}`}>
                  <MapIcon className="w-4 h-4" />
                  <span>Mapped</span>
                </div>
                <div className="flex items-center space-x-1">
                  <UsersIcon className="w-4 h-4" />
                  <span>{env.participants}</span>
                </div>
              </div>

              {env.id === activeEnvironment && isARActive && (
                <div className="mt-4 p-3 bg-medsight-secondary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-medsight-secondary">Active AR Session</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs">{env.overlays.length} overlays</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* AR Controls and Data */}
      {isARActive && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AR Overlays */}
          <div className="medsight-glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-medsight-secondary mb-4">AR Overlays</h3>
            <div className="space-y-3">
              {arEnvironments.find(env => env.id === activeEnvironment)?.overlays.map((overlay) => (
                <div 
                  key={overlay.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOverlay === overlay.id
                      ? 'border-medsight-secondary bg-medsight-secondary/5'
                      : 'border-gray-200 hover:border-medsight-secondary/50'
                  }`}
                  onClick={() => handleOverlayToggle(overlay.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        overlay.type === 'anatomy' ? 'bg-blue-100' :
                        overlay.type === 'measurement' ? 'bg-green-100' :
                        overlay.type === 'annotation' ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        {overlay.type === 'anatomy' ? <CubeTransparentIcon className="w-4 h-4 text-blue-600" /> :
                         overlay.type === 'measurement' ? <RectangleGroupIcon className="w-4 h-4 text-green-600" /> :
                         overlay.type === 'annotation' ? <TagIcon className="w-4 h-4 text-yellow-600" /> :
                         <DocumentTextIcon className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{overlay.name}</h4>
                        <p className="text-sm text-gray-600">{overlay.medicalContext}</p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 ${getStatusColor(overlay.status)}`}>
                      <div className={`w-2 h-2 rounded-full ${
                        overlay.status === 'active' ? 'bg-medsight-normal' : 'bg-gray-400'
                      }`} />
                      <span className="text-sm">Opacity: {Math.round(overlay.opacity * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Medical Data */}
          <div className="medsight-glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-medsight-secondary mb-4">Medical Data</h3>
            {arMedicalData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Patient ID:</span>
                    <span className="font-medium ml-2">{arMedicalData.patientId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Study ID:</span>
                    <span className="font-medium ml-2">{arMedicalData.studyId}</span>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Real-time Vitals</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <HeartIcon className="w-4 h-4 text-red-500" />
                      <span>HR: {arMedicalData.realTimeData.heartRate} bpm</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <SignalIcon className="w-4 h-4 text-blue-500" />
                      <span>BP: {arMedicalData.realTimeData.bloodPressure}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CloudIcon className="w-4 h-4 text-green-500" />
                      <span>SpO2: {arMedicalData.realTimeData.oxygenSaturation}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FireIcon className="w-4 h-4 text-orange-500" />
                      <span>Temp: {arMedicalData.realTimeData.temperature}°F</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">AR Overlay Data</h4>
                  <div className="space-y-2">
                    {arMedicalData.overlayData.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-medium text-medsight-secondary">
                          {Math.round(item.confidence * 100)}% confidence
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medical Compliance */}
      <div className="medsight-glass p-4 rounded-xl border border-medsight-secondary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-medsight-normal" />
            <span className="text-sm font-medium text-medsight-normal">Medical AR Compliance</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-medsight-normal">HIPAA Compliant</span>
            <span className="text-medsight-normal">FDA Class II</span>
            <span className="text-medsight-normal">AR Safety Standards</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalARInterface; 