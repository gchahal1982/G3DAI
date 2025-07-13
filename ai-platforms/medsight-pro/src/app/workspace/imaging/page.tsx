'use client';

import { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  BeakerIcon,
  CubeIcon,
  ShareIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  HeartIcon,
  CpuChipIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  AcademicCapIcon,
  LightBulbIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  PhotoIcon,
  FilmIcon,
  RectangleGroupIcon,
  Square3Stack3DIcon,
  CircleStackIcon,
  CalendarIcon,
  ClockIcon as TimeIcon,
  UserIcon,
  TagIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
  SparklesIcon,
  BoltIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface Study {
  id: string;
  patientName: string;
  patientId: string;
  studyDate: string;
  studyTime: string;
  modality: string;
  studyDescription: string;
  seriesCount: number;
  imageCount: number;
  studySize: string;
  status: 'pending' | 'in_progress' | 'completed' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  aiAnalysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  aiConfidence: number;
  findings: string[];
  measurements: Array<{
    id: string;
    type: string;
    value: string;
    unit: string;
    confidence: number;
  }>;
}

interface ViewerSettings {
  layout: '1x1' | '2x1' | '2x2' | '3x3';
  orientation: 'axial' | 'coronal' | 'sagittal' | 'oblique';
  windowLevel: number;
  windowWidth: number;
  zoom: number;
  pan: { x: number; y: number };
  rotation: number;
  invert: boolean;
  showAnnotations: boolean;
  showMeasurements: boolean;
  showAIOverlay: boolean;
  cineMode: boolean;
  cineSpeed: number;
  hangingProtocol: string;
}

export default function MedicalImagingWorkspace() {
  const [activeStudy, setActiveStudy] = useState<Study | null>(null);
  const [studies, setStudies] = useState<Study[]>([]);
  const [viewerSettings, setViewerSettings] = useState<ViewerSettings>({
    layout: '1x1',
    orientation: 'axial',
    windowLevel: 40,
    windowWidth: 400,
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    rotation: 0,
    invert: false,
    showAnnotations: true,
    showMeasurements: true,
    showAIOverlay: true,
    cineMode: false,
    cineSpeed: 5,
    hangingProtocol: 'default'
  });
  const [selectedTool, setSelectedTool] = useState('select');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [currentSeries, setCurrentSeries] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [collaborationMode, setCollaborationMode] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockStudies: Study[] = [
      {
        id: 'STU001',
        patientName: 'Smith, John',
        patientId: 'PAT001',
        studyDate: '2024-01-15',
        studyTime: '14:30:00',
        modality: 'CT',
        studyDescription: 'Chest CT with Contrast',
        seriesCount: 4,
        imageCount: 256,
        studySize: '145.2 MB',
        status: 'pending',
        priority: 'high',
        aiAnalysisStatus: 'completed',
        aiConfidence: 92,
        findings: [
          'Nodule in right upper lobe (8mm)',
          'Mediastinal lymph nodes within normal limits',
          'No pleural effusion'
        ],
        measurements: [
          { id: 'M001', type: 'length', value: '8.2', unit: 'mm', confidence: 95 },
          { id: 'M002', type: 'area', value: '52.4', unit: 'mm²', confidence: 88 }
        ]
      },
      {
        id: 'STU002',
        patientName: 'Johnson, Sarah',
        patientId: 'PAT002',
        studyDate: '2024-01-15',
        studyTime: '15:45:00',
        modality: 'MRI',
        studyDescription: 'Brain MRI T1/T2',
        seriesCount: 6,
        imageCount: 384,
        studySize: '298.7 MB',
        status: 'critical',
        priority: 'urgent',
        aiAnalysisStatus: 'processing',
        aiConfidence: 0,
        findings: [],
        measurements: []
      }
    ];
    setStudies(mockStudies);
    setActiveStudy(mockStudies[0]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-medsight-pending';
      case 'in_progress': return 'text-blue-500';
      case 'completed': return 'text-medsight-normal';
      case 'critical': return 'text-medsight-critical';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'in_progress': return <PlayIcon className="w-4 h-4" />;
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'critical': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  const getAIConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-medsight-ai-high';
    if (confidence >= 70) return 'text-medsight-ai-medium';
    return 'text-medsight-ai-low';
  };

  const handleToolChange = (tool: string) => {
    setSelectedTool(tool);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleZoomIn = () => {
    setViewerSettings(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.2, 10)
    }));
  };

  const handleZoomOut = () => {
    setViewerSettings(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.2, 0.1)
    }));
  };

  const handleResetView = () => {
    setViewerSettings(prev => ({
      ...prev,
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      rotation: 0
    }));
  };

  const handleEmergencyMode = () => {
    setEmergencyMode(!emergencyMode);
    if (!emergencyMode) {
      // Emergency mode actions
      setViewerSettings(prev => ({
        ...prev,
        layout: '2x2',
        showAIOverlay: true,
        showMeasurements: true
      }));
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Study List Panel */}
      <div className="w-80 medsight-glass border-r border-medsight-primary/20 flex flex-col">
        <div className="p-4 border-b border-medsight-primary/20">
          <h2 className="text-lg font-semibold text-medsight-primary mb-2">
            Medical Studies
          </h2>
          <div className="flex gap-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <CloudArrowUpIcon className="w-4 h-4 mr-1" />
              Import
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <MagnifyingGlassIcon className="w-4 h-4 mr-1" />
              Search
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {studies.map((study) => (
            <div
              key={study.id}
              className={`medsight-control-glass p-3 rounded-lg cursor-pointer transition-all ${
                activeStudy?.id === study.id 
                  ? 'ring-2 ring-medsight-primary' 
                  : 'hover:bg-medsight-primary/10'
              }`}
              onClick={() => setActiveStudy(study)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {study.patientName}
                </span>
                <div className={`flex items-center gap-1 ${getStatusColor(study.status)}`}>
                  {getStatusIcon(study.status)}
                  <span className="text-xs font-medium">
                    {study.status}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>ID: {study.patientId}</span>
                  <span className="font-medium text-medsight-primary">
                    {study.modality}
                  </span>
                </div>
                <div>{study.studyDescription}</div>
                <div className="flex justify-between">
                  <span>{study.studyDate}</span>
                  <span>{study.studyTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>{study.seriesCount} series</span>
                  <span>{study.imageCount} images</span>
                </div>
                
                {study.aiAnalysisStatus === 'completed' && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                    <span className="text-xs">AI Analysis</span>
                    <div className={`flex items-center gap-1 ${getAIConfidenceColor(study.aiConfidence)}`}>
                      <SparklesIcon className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {study.aiConfidence}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Viewer Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="medsight-control-glass border-b border-medsight-primary/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Patient Info */}
              {activeStudy && (
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-semibold text-medsight-primary">
                      {activeStudy.patientName}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {activeStudy.patientId}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {activeStudy.modality} • {activeStudy.studyDate}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Emergency Mode */}
              <button
                onClick={handleEmergencyMode}
                className={`btn-medsight ${
                  emergencyMode 
                    ? 'bg-medsight-critical/20 text-medsight-critical' 
                    : ''
                }`}
              >
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                Emergency
              </button>
              
              {/* Collaboration */}
              <button
                onClick={() => setCollaborationMode(!collaborationMode)}
                className="btn-medsight"
              >
                <UserGroupIcon className="w-4 h-4 mr-1" />
                Collaborate
              </button>
              
              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="btn-medsight"
              >
                <Cog6ToothIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tool Palette */}
        <div className="medsight-control-glass border-b border-medsight-primary/20 p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Navigation Tools */}
              <div className="flex items-center gap-1 mr-4">
                <button
                  onClick={handlePlayPause}
                  className="btn-medsight"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-4 h-4" />
                  ) : (
                    <PlayIcon className="w-4 h-4" />
                  )}
                </button>
                <button className="btn-medsight">
                  <BackwardIcon className="w-4 h-4" />
                </button>
                <button className="btn-medsight">
                  <ForwardIcon className="w-4 h-4" />
                </button>
              </div>
              
              {/* Annotation Tools */}
              <div className="flex items-center gap-1 mr-4">
                <button
                  onClick={() => handleToolChange('select')}
                  className={`btn-medsight ${selectedTool === 'select' ? 'bg-medsight-primary/20' : ''}`}
                >
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToolChange('annotate')}
                  className={`btn-medsight ${selectedTool === 'annotate' ? 'bg-medsight-primary/20' : ''}`}
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                                 <button
                   onClick={() => handleToolChange('measure')}
                   className={`btn-medsight ${selectedTool === 'measure' ? 'bg-medsight-primary/20' : ''}`}
                 >
                   <BeakerIcon className="w-4 h-4" />
                 </button>
              </div>
              
              {/* View Tools */}
              <div className="flex items-center gap-1">
                <button onClick={handleZoomIn} className="btn-medsight">
                  <ArrowsPointingOutIcon className="w-4 h-4" />
                </button>
                <button onClick={handleZoomOut} className="btn-medsight">
                  <ArrowsPointingInIcon className="w-4 h-4" />
                </button>
                <button onClick={handleResetView} className="btn-medsight">
                  <ComputerDesktopIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Layout Options */}
              <select
                value={viewerSettings.layout}
                onChange={(e) => setViewerSettings(prev => ({
                  ...prev,
                  layout: e.target.value as any
                }))}
                className="input-medsight text-sm"
              >
                <option value="1x1">1×1</option>
                <option value="2x1">2×1</option>
                <option value="2x2">2×2</option>
                <option value="3x3">3×3</option>
              </select>
              
              {/* Window/Level */}
              <div className="flex items-center gap-2 text-sm">
                <span>W/L:</span>
                <span className="font-mono text-medsight-primary">
                  {viewerSettings.windowWidth}/{viewerSettings.windowLevel}
                </span>
              </div>
              
              {/* Zoom */}
              <div className="flex items-center gap-2 text-sm">
                <span>Zoom:</span>
                <span className="font-mono text-medsight-primary">
                  {(viewerSettings.zoom * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Image Viewer */}
          <div className="flex-1 relative">
            <div className="w-full h-full bg-black medsight-viewer-glass flex items-center justify-center">
              {activeStudy ? (
                <div className="text-center">
                  <div className="text-white text-lg mb-4">
                    DICOM Viewer Area
                  </div>
                  <div className="text-gray-300 text-sm">
                    {activeStudy.modality} Study: {activeStudy.studyDescription}
                  </div>
                  <div className="text-gray-400 text-xs mt-2">
                    Series {currentSeries + 1} of {activeStudy.seriesCount} • 
                    Image {currentImage + 1} of {activeStudy.imageCount}
                  </div>
                  
                  {/* AI Analysis Overlay */}
                  {viewerSettings.showAIOverlay && activeStudy.aiAnalysisStatus === 'completed' && (
                    <div className="absolute top-4 left-4 medsight-ai-glass p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <SparklesIcon className="w-4 h-4 text-medsight-ai-high" />
                        <span className="text-sm font-medium text-white">
                          AI Analysis
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 space-y-1">
                        {activeStudy.findings.map((finding, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-medsight-ai-high rounded-full mt-1"></div>
                            <span>{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                                     {/* Measurement Overlay */}
                   {viewerSettings.showMeasurements && activeStudy.measurements.length > 0 && (
                     <div className="absolute top-4 right-4 medsight-control-glass p-3 rounded-lg">
                       <div className="flex items-center gap-2 mb-2">
                         <BeakerIcon className="w-4 h-4 text-medsight-primary" />
                         <span className="text-sm font-medium text-gray-900">
                           Measurements
                         </span>
                       </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {activeStudy.measurements.map((measurement) => (
                          <div key={measurement.id} className="flex justify-between gap-3">
                            <span>{measurement.type}:</span>
                            <span className="font-mono">
                              {measurement.value} {measurement.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <PhotoIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a study to begin viewing</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-80 medsight-glass border-l border-medsight-primary/20 flex flex-col">
            {/* AI Analysis Panel */}
            {showAIPanel && (
              <div className="p-4 border-b border-medsight-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-medsight-primary">
                    AI Analysis
                  </h3>
                  <button
                    onClick={() => setShowAIPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
                
                {activeStudy && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <div className="flex items-center gap-2">
                        {activeStudy.aiAnalysisStatus === 'completed' ? (
                          <CheckBadgeIcon className="w-4 h-4 text-medsight-normal" />
                        ) : activeStudy.aiAnalysisStatus === 'processing' ? (
                          <BoltIcon className="w-4 h-4 text-medsight-pending animate-pulse" />
                        ) : (
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm capitalize">
                          {activeStudy.aiAnalysisStatus}
                        </span>
                      </div>
                    </div>
                    
                    {activeStudy.aiAnalysisStatus === 'completed' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Confidence:</span>
                          <div className={`flex items-center gap-2 ${getAIConfidenceColor(activeStudy.aiConfidence)}`}>
                            <span className="text-sm font-medium">
                              {activeStudy.aiConfidence}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <span className="text-sm text-gray-600">Findings:</span>
                          {activeStudy.findings.map((finding, idx) => (
                            <div key={idx} className="medsight-ai-glass p-2 rounded text-xs">
                              {finding}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Measurements Panel */}
            {showMeasurements && (
              <div className="p-4 border-b border-medsight-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-medsight-primary">
                    Measurements
                  </h3>
                  <button
                    onClick={() => setShowMeasurements(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
                
                {activeStudy && activeStudy.measurements.length > 0 ? (
                  <div className="space-y-2">
                    {activeStudy.measurements.map((measurement) => (
                      <div key={measurement.id} className="medsight-control-glass p-2 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {measurement.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {measurement.confidence}%
                          </span>
                        </div>
                        <div className="text-lg font-mono text-medsight-primary">
                          {measurement.value} {measurement.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                                 ) : (
                   <div className="text-center text-gray-400 py-4">
                     <BeakerIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                     <p className="text-sm">No measurements yet</p>
                   </div>
                 )}
              </div>
            )}

            {/* Study Information */}
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="text-sm font-semibold text-medsight-primary mb-3">
                Study Information
              </h3>
              
              {activeStudy ? (
                <div className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patient:</span>
                      <span className="font-medium">{activeStudy.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-mono">{activeStudy.patientId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modality:</span>
                      <span className="font-medium text-medsight-primary">
                        {activeStudy.modality}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{activeStudy.studyDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span>{activeStudy.studyTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Series:</span>
                      <span>{activeStudy.seriesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Images:</span>
                      <span>{activeStudy.imageCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span>{activeStudy.studySize}</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Status:</span>
                      <div className={`flex items-center gap-1 ${getStatusColor(activeStudy.status)}`}>
                        {getStatusIcon(activeStudy.status)}
                        <span className="capitalize">{activeStudy.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`capitalize ${
                        activeStudy.priority === 'urgent' ? 'text-medsight-critical' :
                        activeStudy.priority === 'high' ? 'text-medsight-abnormal' :
                        activeStudy.priority === 'medium' ? 'text-medsight-pending' :
                        'text-medsight-normal'
                      }`}>
                        {activeStudy.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <InformationCircleIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a study to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 