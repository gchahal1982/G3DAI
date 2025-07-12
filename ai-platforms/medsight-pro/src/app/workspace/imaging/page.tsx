'use client';

import { useState, useEffect } from 'react';
import { 
  PhotoIcon, 
  CubeIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  Squares2X2Icon,
  RectangleStackIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  SignalIcon,
  WifiIcon,
  BellIcon,
  InformationCircleIcon,
  PlusIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  PhotoIcon as PhotoIconSolid,
  CubeIcon as CubeIconSolid,
  EyeIcon as EyeIconSolid,
  PlayIcon as PlayIconSolid
} from '@heroicons/react/24/solid';
import React from 'react';

interface MedicalStudy {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientSex: 'M' | 'F';
  studyDate: string;
  studyTime: string;
  studyDescription: string;
  modality: 'CT' | 'MRI' | 'XR' | 'US' | 'PET' | 'NM';
  bodyPart: string;
  seriesCount: number;
  imageCount: number;
  studySize: number; // bytes
  status: 'available' | 'loading' | 'processing' | 'error';
  priority: 'routine' | 'urgent' | 'stat' | 'emergency';
  aiAnalysis: {
    completed: boolean;
    confidence: number;
    findings: string[];
    abnormalities: string[];
  };
  annotations: {
    count: number;
    lastModified: string;
    collaborators: string[];
  };
  measurements: {
    count: number;
    types: string[];
  };
  reportStatus: 'pending' | 'draft' | 'final' | 'amended';
  assignedRadiologist: string;
  referringPhysician: string;
  institution: string;
  equipment: string;
}

interface ViewerSettings {
  layout: 'single' | 'dual' | 'quad' | 'mpr' | '3d';
  windowLevel: number;
  windowWidth: number;
  zoom: number;
  pan: { x: number; y: number };
  rotation: number;
  invert: boolean;
  smoothing: boolean;
  annotations: boolean;
  measurements: boolean;
  overlays: boolean;
  cineMode: boolean;
  cineSpeed: number;
  crosshairs: boolean;
  rulers: boolean;
  orientation: 'axial' | 'coronal' | 'sagittal';
}

interface ViewerTool {
  id: string;
  name: string;
  icon: any;
  description: string;
  active: boolean;
  category: 'navigation' | 'measurement' | 'annotation' | 'enhancement' | 'analysis';
  shortcut?: string;
}

export default function ImagingWorkspacePage() {
  const [studies, setStudies] = useState<MedicalStudy[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<MedicalStudy | null>(null);
  const [viewerSettings, setViewerSettings] = useState<ViewerSettings>({
    layout: 'single',
    windowLevel: 40,
    windowWidth: 400,
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    rotation: 0,
    invert: false,
    smoothing: true,
    annotations: true,
    measurements: true,
    overlays: true,
    cineMode: false,
    cineSpeed: 10,
    crosshairs: false,
    rulers: false,
    orientation: 'axial'
  });
  const [activeTool, setActiveTool] = useState<string>('pan');
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const tools: ViewerTool[] = [
    {
      id: 'pan',
      name: 'Pan',
      icon: ArrowsPointingOutIcon,
      description: 'Pan the image',
      active: activeTool === 'pan',
      category: 'navigation'
    },
    {
      id: 'zoom',
      name: 'Zoom',
      icon: MagnifyingGlassIcon,
      description: 'Zoom in/out',
      active: activeTool === 'zoom',
      category: 'navigation'
    },
    {
      id: 'windowing',
      name: 'Window/Level',
      icon: AdjustmentsHorizontalIcon,
      description: 'Adjust window/level',
      active: activeTool === 'windowing',
      category: 'enhancement'
    },
    {
      id: 'measure_length',
      name: 'Length',
      icon: ChartBarIcon,
      description: 'Measure length',
      active: activeTool === 'measure_length',
      category: 'measurement',
      shortcut: 'L'
    },
    {
      id: 'measure_angle',
      name: 'Angle',
      icon: ChartBarIcon,
      description: 'Measure angle',
      active: activeTool === 'measure_angle',
      category: 'measurement',
      shortcut: 'A'
    },
    {
      id: 'roi_rectangle',
      name: 'Rectangle ROI',
      icon: Squares2X2Icon,
      description: 'Rectangle region of interest',
      active: activeTool === 'roi_rectangle',
      category: 'measurement',
      shortcut: 'R'
    },
    {
      id: 'annotation',
      name: 'Annotation',
      icon: DocumentTextIcon,
      description: 'Add text annotation',
      active: activeTool === 'annotation',
      category: 'annotation',
      shortcut: 'T'
    },
    {
      id: 'arrow',
      name: 'Arrow',
      icon: ArrowPathIcon,
      description: 'Add arrow annotation',
      active: activeTool === 'arrow',
      category: 'annotation'
    }
  ];

  useEffect(() => {
    loadMedicalStudies();
  }, []);

  const loadMedicalStudies = async () => {
    try {
      // Mock data - in production, this would connect to backend DICOMProcessor.ts
      const mockStudies: MedicalStudy[] = [
        {
          id: 'study_001',
          patientId: 'PAT_12345',
          patientName: 'Johnson, Sarah M.',
          patientAge: 45,
          patientSex: 'F',
          studyDate: '2024-01-15',
          studyTime: '14:30:00',
          studyDescription: 'CT Chest with Contrast',
          modality: 'CT',
          bodyPart: 'Chest',
          seriesCount: 4,
          imageCount: 256,
          studySize: 134217728, // 128 MB
          status: 'available',
          priority: 'routine',
          aiAnalysis: {
            completed: true,
            confidence: 94,
            findings: ['Normal lung parenchyma', 'No pleural effusion', 'Heart size normal'],
            abnormalities: []
          },
          annotations: {
            count: 3,
            lastModified: '2024-01-15T15:45:00Z',
            collaborators: ['Dr. Michael Chen', 'Dr. Emily Rodriguez']
          },
          measurements: {
            count: 5,
            types: ['length', 'area', 'volume']
          },
          reportStatus: 'draft',
          assignedRadiologist: 'Dr. Sarah Johnson',
          referringPhysician: 'Dr. James Wilson',
          institution: 'General Hospital',
          equipment: 'Siemens SOMATOM Force'
        },
        {
          id: 'study_002',
          patientId: 'PAT_67890',
          patientName: 'Chen, Michael L.',
          patientAge: 62,
          patientSex: 'M',
          studyDate: '2024-01-15',
          studyTime: '16:15:00',
          studyDescription: 'MRI Brain with and without Contrast',
          modality: 'MRI',
          bodyPart: 'Brain',
          seriesCount: 8,
          imageCount: 512,
          studySize: 268435456, // 256 MB
          status: 'processing',
          priority: 'urgent',
          aiAnalysis: {
            completed: false,
            confidence: 0,
            findings: [],
            abnormalities: []
          },
          annotations: {
            count: 0,
            lastModified: '',
            collaborators: []
          },
          measurements: {
            count: 0,
            types: []
          },
          reportStatus: 'pending',
          assignedRadiologist: 'Dr. Sarah Johnson',
          referringPhysician: 'Dr. Lisa Park',
          institution: 'General Hospital',
          equipment: 'Siemens MAGNETOM Skyra'
        },
        {
          id: 'study_003',
          patientId: 'PAT_11111',
          patientName: 'Rodriguez, Emily A.',
          patientAge: 28,
          patientSex: 'F',
          studyDate: '2024-01-15',
          studyTime: '18:45:00',
          studyDescription: 'X-Ray Chest PA and Lateral',
          modality: 'XR',
          bodyPart: 'Chest',
          seriesCount: 2,
          imageCount: 2,
          studySize: 8388608, // 8 MB
          status: 'available',
          priority: 'stat',
          aiAnalysis: {
            completed: true,
            confidence: 87,
            findings: ['Possible pneumonia in right lower lobe'],
            abnormalities: ['Opacity in right lower lobe']
          },
          annotations: {
            count: 2,
            lastModified: '2024-01-15T19:15:00Z',
            collaborators: ['Dr. Emily Rodriguez']
          },
          measurements: {
            count: 1,
            types: ['area']
          },
          reportStatus: 'final',
          assignedRadiologist: 'Dr. Sarah Johnson',
          referringPhysician: 'Dr. Emergency Medicine',
          institution: 'General Hospital',
          equipment: 'GE Revolution XQ/i'
        }
      ];

      setStudies(mockStudies);
      if (mockStudies.length > 0) {
        setSelectedStudy(mockStudies[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading medical studies:', error);
      setLoading(false);
    }
  };

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'CT': return <CubeIconSolid className="w-5 h-5 text-medsight-primary" />;
      case 'MRI': return <PhotoIconSolid className="w-5 h-5 text-medsight-secondary" />;
      case 'XR': return <PhotoIcon className="w-5 h-5 text-medsight-pending" />;
      case 'US': return <EyeIconSolid className="w-5 h-5 text-medsight-ai-high" />;
      case 'PET': return <FireIcon className="w-5 h-5 text-medsight-critical" />;
      default: return <PhotoIcon className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-medsight-normal';
      case 'loading': return 'text-medsight-pending';
      case 'processing': return 'text-medsight-ai-medium';
      case 'error': return 'text-medsight-abnormal';
      default: return 'text-slate-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'routine': return 'text-medsight-normal';
      case 'urgent': return 'text-medsight-pending';
      case 'stat': return 'text-medsight-abnormal';
      case 'emergency': return 'text-medsight-critical';
      default: return 'text-slate-600';
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-slate-500';
      case 'draft': return 'text-medsight-pending';
      case 'final': return 'text-medsight-normal';
      case 'amended': return 'text-medsight-ai-high';
      default: return 'text-slate-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDateTime = (date: string, time?: string) => {
    const dateObj = new Date(date + (time ? 'T' + time : ''));
    return dateObj.toLocaleString();
  };

  const selectTool = (toolId: string) => {
    setActiveTool(toolId);
  };

  const updateViewerSetting = (key: keyof ViewerSettings, value: any) => {
    setViewerSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleCineMode = () => {
    setIsPlaying(!isPlaying);
    updateViewerSetting('cineMode', !viewerSettings.cineMode);
  };

  const nextImage = () => {
    if (selectedStudy && currentImage < selectedStudy.imageCount - 1) {
      setCurrentImage(currentImage + 1);
    }
  };

  const previousImage = () => {
    if (currentImage > 0) {
      setCurrentImage(currentImage - 1);
    }
  };

  const resetViewer = () => {
    setViewerSettings({
      layout: 'single',
      windowLevel: 40,
      windowWidth: 400,
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      rotation: 0,
      invert: false,
      smoothing: true,
      annotations: true,
      measurements: true,
      overlays: true,
      cineMode: false,
      cineSpeed: 10,
      crosshairs: false,
      rulers: false,
      orientation: 'axial'
    });
    setCurrentImage(0);
    setCurrentSeries(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medsight-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Study Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} medsight-glass border-r border-slate-200 transition-all duration-300`}>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="text-lg font-semibold text-medsight-primary">Medical Studies</h2>
            )}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="btn-medsight p-2"
            >
              {sidebarCollapsed ? <ArrowsPointingOutIcon className="w-4 h-4" /> : <ArrowsPointingInIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!sidebarCollapsed && (
          <div className="p-4 space-y-4 h-full overflow-y-auto">
            {studies.map((study) => (
              <div 
                key={study.id}
                onClick={() => setSelectedStudy(study)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedStudy?.id === study.id 
                    ? 'border-medsight-primary bg-medsight-primary/10' 
                    : 'border-slate-200 hover:border-medsight-primary/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getModalityIcon(study.modality)}
                    <span className="text-sm font-medium text-slate-900">{study.modality}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(study.status)} bg-current`}></div>
                    <span className={`text-xs font-medium ${getPriorityColor(study.priority)}`}>
                      {study.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <h3 className="font-medium text-slate-900 mb-1">{study.patientName}</h3>
                <p className="text-sm text-slate-600 mb-2">{study.studyDescription}</p>
                
                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatDateTime(study.studyDate, study.studyTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Series:</span>
                    <span>{study.seriesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Images:</span>
                    <span>{study.imageCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{formatFileSize(study.studySize)}</span>
                  </div>
                </div>

                {study.aiAnalysis.completed && (
                  <div className="mt-2 p-2 bg-medsight-ai-high/10 rounded">
                    <div className="flex items-center space-x-2">
                      <ShieldCheckIcon className="w-4 h-4 text-medsight-ai-high" />
                      <span className="text-xs font-medium text-medsight-ai-high">
                        AI Analysis: {study.aiAnalysis.confidence}%
                      </span>
                    </div>
                    {study.aiAnalysis.abnormalities.length > 0 && (
                      <div className="mt-1">
                        <ExclamationTriangleIcon className="w-3 h-3 text-medsight-abnormal inline mr-1" />
                        <span className="text-xs text-medsight-abnormal">
                          {study.aiAnalysis.abnormalities.length} abnormalities
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs font-medium ${getReportStatusColor(study.reportStatus)}`}>
                    Report: {study.reportStatus}
                  </span>
                  {study.annotations.count > 0 && (
                    <span className="text-xs text-slate-500">
                      {study.annotations.count} annotations
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Viewer Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="medsight-glass border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {selectedStudy && (
                <div className="flex items-center space-x-3">
                  {getModalityIcon(selectedStudy.modality)}
                  <div>
                    <h3 className="font-medium text-slate-900">{selectedStudy.patientName}</h3>
                    <p className="text-sm text-slate-600">{selectedStudy.studyDescription}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Layout Options */}
              <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                <button 
                  onClick={() => updateViewerSetting('layout', 'single')}
                  className={`p-2 rounded ${viewerSettings.layout === 'single' ? 'bg-white shadow' : ''}`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => updateViewerSetting('layout', 'dual')}
                  className={`p-2 rounded ${viewerSettings.layout === 'dual' ? 'bg-white shadow' : ''}`}
                >
                  <RectangleStackIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => updateViewerSetting('layout', 'quad')}
                  className={`p-2 rounded ${viewerSettings.layout === 'quad' ? 'bg-white shadow' : ''}`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                <button onClick={previousImage} className="p-2 rounded hover:bg-white">
                  <BackwardIcon className="w-4 h-4" />
                </button>
                <button onClick={toggleCineMode} className="p-2 rounded hover:bg-white">
                  {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIconSolid className="w-4 h-4" />}
                </button>
                <button onClick={nextImage} className="p-2 rounded hover:bg-white">
                  <ForwardIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Settings */}
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="btn-medsight p-2"
              >
                <CogIcon className="w-4 h-4" />
              </button>

              {/* Reset */}
              <button onClick={resetViewer} className="btn-medsight p-2">
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Tools Sidebar */}
          <div className="w-16 medsight-glass border-r border-slate-200 p-2">
            <div className="space-y-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => selectTool(tool.id)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                    tool.active 
                      ? 'bg-medsight-primary text-white shadow-lg' 
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                  title={`${tool.name}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                >
                  <tool.icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Viewer Canvas */}
          <div className="flex-1 relative bg-black">
            {selectedStudy ? (
              <div className="w-full h-full flex items-center justify-center">
                {/* Mock DICOM Viewer */}
                <div className="relative w-full h-full max-w-4xl max-h-4xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <CubeIcon className="w-24 h-24 mx-auto mb-4 text-medsight-primary" />
                      <h3 className="text-xl font-semibold mb-2">{selectedStudy.modality} Viewer</h3>
                      <p className="text-slate-300 mb-4">{selectedStudy.studyDescription}</p>
                      <div className="space-y-2 text-sm text-slate-400">
                        <p>Image {currentImage + 1} of {selectedStudy.imageCount}</p>
                        <p>Series {currentSeries + 1} of {selectedStudy.seriesCount}</p>
                        <p>WL: {viewerSettings.windowLevel} WW: {viewerSettings.windowWidth}</p>
                        <p>Zoom: {(viewerSettings.zoom * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Overlay Information */}
                  {viewerSettings.overlays && (
                    <>
                      <div className="absolute top-4 left-4 text-white text-sm space-y-1">
                        <p>{selectedStudy.patientName}</p>
                        <p>ID: {selectedStudy.patientId}</p>
                        <p>Age: {selectedStudy.patientAge} Sex: {selectedStudy.patientSex}</p>
                      </div>
                      <div className="absolute top-4 right-4 text-white text-sm text-right space-y-1">
                        <p>{selectedStudy.institution}</p>
                        <p>{formatDateTime(selectedStudy.studyDate, selectedStudy.studyTime)}</p>
                        <p>{selectedStudy.modality}</p>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white text-sm space-y-1">
                        <p>Series: {currentSeries + 1}/{selectedStudy.seriesCount}</p>
                        <p>Image: {currentImage + 1}/{selectedStudy.imageCount}</p>
                      </div>
                      <div className="absolute bottom-4 right-4 text-white text-sm text-right space-y-1">
                        <p>WL: {viewerSettings.windowLevel}</p>
                        <p>WW: {viewerSettings.windowWidth}</p>
                        <p>Zoom: {(viewerSettings.zoom * 100).toFixed(0)}%</p>
                      </div>
                    </>
                  )}

                  {/* Crosshairs */}
                  {viewerSettings.crosshairs && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-medsight-primary opacity-50"></div>
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-medsight-primary opacity-50"></div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <PhotoIcon className="w-24 h-24 mx-auto mb-4 text-slate-500" />
                  <h3 className="text-xl font-semibold mb-2 text-slate-400">No Study Selected</h3>
                  <p className="text-slate-500">Select a medical study from the sidebar to begin viewing</p>
                </div>
              </div>
            )}
          </div>

          {/* Study Information Panel */}
          {selectedStudy && (
            <div className="w-80 medsight-glass border-l border-slate-200 p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold text-medsight-primary mb-4">Study Information</h3>
              
              <div className="space-y-4">
                {/* Patient Information */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Patient Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Name:</span>
                      <span className="font-medium">{selectedStudy.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">ID:</span>
                      <span>{selectedStudy.patientId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Age:</span>
                      <span>{selectedStudy.patientAge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Sex:</span>
                      <span>{selectedStudy.patientSex}</span>
                    </div>
                  </div>
                </div>

                {/* Study Details */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Study Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Modality:</span>
                      <span className="font-medium">{selectedStudy.modality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Body Part:</span>
                      <span>{selectedStudy.bodyPart}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Date/Time:</span>
                      <span>{formatDateTime(selectedStudy.studyDate, selectedStudy.studyTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Series:</span>
                      <span>{selectedStudy.seriesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Images:</span>
                      <span>{selectedStudy.imageCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Size:</span>
                      <span>{formatFileSize(selectedStudy.studySize)}</span>
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                {selectedStudy.aiAnalysis.completed && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">AI Analysis</h4>
                    <div className="medsight-ai-glass p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <ShieldCheckIcon className="w-4 h-4 text-medsight-ai-high" />
                        <span className="text-sm font-medium text-medsight-ai-high">
                          Confidence: {selectedStudy.aiAnalysis.confidence}%
                        </span>
                      </div>
                      
                      {selectedStudy.aiAnalysis.findings.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-slate-700 mb-1">Findings:</p>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {selectedStudy.aiAnalysis.findings.map((finding, index) => (
                              <li key={index} className="flex items-start space-x-1">
                                <CheckCircleIcon className="w-3 h-3 text-medsight-normal mt-0.5 flex-shrink-0" />
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedStudy.aiAnalysis.abnormalities.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-700 mb-1">Abnormalities:</p>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {selectedStudy.aiAnalysis.abnormalities.map((abnormality, index) => (
                              <li key={index} className="flex items-start space-x-1">
                                <ExclamationTriangleIcon className="w-3 h-3 text-medsight-abnormal mt-0.5 flex-shrink-0" />
                                <span>{abnormality}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Annotations & Measurements */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Annotations & Measurements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Annotations:</span>
                      <span>{selectedStudy.annotations.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Measurements:</span>
                      <span>{selectedStudy.measurements.count}</span>
                    </div>
                    {selectedStudy.annotations.collaborators.length > 0 && (
                      <div>
                        <span className="text-slate-600">Collaborators:</span>
                        <div className="mt-1 space-y-1">
                          {selectedStudy.annotations.collaborators.map((collaborator, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <UserGroupIcon className="w-3 h-3 text-slate-400" />
                              <span className="text-xs">{collaborator}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Report Status */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Report Status</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className={`font-medium ${getReportStatusColor(selectedStudy.reportStatus)}`}>
                        {selectedStudy.reportStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Radiologist:</span>
                      <span>{selectedStudy.assignedRadiologist}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Referring:</span>
                      <span>{selectedStudy.referringPhysician}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button className="btn-medsight w-full">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Generate Report
                  </button>
                  <button className="btn-medsight w-full">
                    <ShareIcon className="w-4 h-4 mr-2" />
                    Share Study
                  </button>
                  <button className="btn-medsight w-full">
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Export DICOM
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Viewer Settings</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="btn-medsight p-2"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Window/Level */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Window/Level</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Window Level</label>
                    <input
                      type="number"
                      value={viewerSettings.windowLevel}
                      onChange={(e) => updateViewerSetting('windowLevel', parseInt(e.target.value))}
                      className="input-medsight"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Window Width</label>
                    <input
                      type="number"
                      value={viewerSettings.windowWidth}
                      onChange={(e) => updateViewerSetting('windowWidth', parseInt(e.target.value))}
                      className="input-medsight"
                    />
                  </div>
                </div>
              </div>

              {/* Display Options */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Display Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewerSettings.annotations}
                      onChange={(e) => updateViewerSetting('annotations', e.target.checked)}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Show Annotations</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewerSettings.measurements}
                      onChange={(e) => updateViewerSetting('measurements', e.target.checked)}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Show Measurements</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewerSettings.overlays}
                      onChange={(e) => updateViewerSetting('overlays', e.target.checked)}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Show Overlays</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewerSettings.crosshairs}
                      onChange={(e) => updateViewerSetting('crosshairs', e.target.checked)}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Show Crosshairs</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewerSettings.invert}
                      onChange={(e) => updateViewerSetting('invert', e.target.checked)}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Invert Colors</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewerSettings.smoothing}
                      onChange={(e) => updateViewerSetting('smoothing', e.target.checked)}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Image Smoothing</span>
                  </label>
                </div>
              </div>

              {/* Cine Mode */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Cine Mode</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewerSettings.cineMode}
                      onChange={(e) => updateViewerSetting('cineMode', e.target.checked)}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Enable Cine Mode</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Cine Speed (FPS): {viewerSettings.cineSpeed}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={viewerSettings.cineSpeed}
                      onChange={(e) => updateViewerSetting('cineSpeed', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 