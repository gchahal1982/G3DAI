'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowRightIcon,
  FolderOpenIcon
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
  
  // Load mock studies data - SINGLE useEffect
  useEffect(() => {
    const mockStudies: Study[] = [
      {
        id: 'PAT001',
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
        priority: 'medium',
        aiAnalysisStatus: 'completed',
        aiConfidence: 92,
        findings: [
          'Nodule in right upper lobe (8mm)',
          'Mediastinal lymph nodes within normal limits',
          'No pleural effusion'
        ],
        measurements: [
          { id: 'm1', type: 'length', value: '8.2', unit: 'mm', confidence: 95 },
          { id: 'm2', type: 'area', value: '52.4', unit: 'mm²', confidence: 88 }
        ]
      },
      {
        id: 'PAT002',
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
        aiAnalysisStatus: 'completed',
        aiConfidence: 96,
        findings: [
          'Moderate ventricular dilatation observed',
          'White matter hyperintensities consistent with age',
          'No acute hemorrhage detected',
          'Normal brain parenchyma enhancement'
        ],
        measurements: [
          { id: 'm3', type: 'ventricular width', value: '12.5', unit: 'mm', confidence: 97 },
          { id: 'm4', type: 'cortical thickness', value: '2.8', unit: 'mm', confidence: 93 },
          { id: 'm5', type: 'lesion diameter', value: '4.2', unit: 'mm', confidence: 89 }
        ]
      }
    ];
    setStudies(mockStudies);
    if (mockStudies.length > 0) {
      setActiveStudy(mockStudies[0]); // Auto-select first study
    }
  }, []);
  
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
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const getStatusPillClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-400/10 text-yellow-400';
      case 'in_progress': return 'bg-blue-400/10 text-blue-400';
      case 'completed': return 'bg-green-400/10 text-green-400';
      case 'critical': return 'bg-red-400/10 text-red-400';
      default: return 'bg-gray-400/10 text-gray-400';
    }
  };

  const handleToolChange = (tool: string) => {
    setSelectedTool(tool);
    console.log(`Tool changed to: ${tool}`);
    
    // Real functionality would:
    // - Change cursor based on tool
    // - Enable/disable mouse interactions
    // - Show tool-specific UI overlays
    
    if (tool === 'measure') {
      console.log('Measurement tool activated - click and drag to measure');
    } else if (tool === 'annotate') {
      console.log('Annotation tool activated - click to add notes');
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      // Start cine loop through images
      console.log('Starting cine loop...');
      const interval = setInterval(() => {
        setCurrentImage(prev => {
          const nextImage = (prev + 1) % (activeStudy?.imageCount || 120);
          console.log(`Playing image ${nextImage + 1}/${activeStudy?.imageCount || 120}`);
          return nextImage;
        });
      }, 1000 / (viewerSettings.cineSpeed || 5)); // Speed control
      
      // Store interval to clear later
      (window as any).cineInterval = interval;
    } else {
      // Stop cine loop
      console.log('Stopping cine loop...');
      if ((window as any).cineInterval) {
        clearInterval((window as any).cineInterval);
      }
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(viewerSettings.zoom * 1.2, 10);
    setViewerSettings(prev => ({
      ...prev,
      zoom: newZoom
    }));
    console.log(`Zooming in to ${Math.round(newZoom * 100)}%`);
    
    // Real functionality would:
    // - Apply CSS transform to image
    // - Maintain zoom center point
    // - Update scroll bars if needed
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(viewerSettings.zoom / 1.2, 0.1);
    setViewerSettings(prev => ({
      ...prev,
      zoom: newZoom
    }));
    console.log(`Zooming out to ${Math.round(newZoom * 100)}%`);
  };

  const handleResetView = () => {
    setViewerSettings(prev => ({
      ...prev,
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      rotation: 0
    }));
    console.log('View reset to original state');
    
    // Real functionality would:
    // - Reset image transforms
    // - Clear any pan offsets
    // - Reset rotation
    // - Center image in viewport
  };

  const handleNextImage = () => {
    const maxImages = activeStudy?.imageCount || 120;
    setCurrentImage(prev => {
      const next = Math.min(prev + 1, maxImages - 1);
      console.log(`Next image: ${next + 1}/${maxImages}`);
      return next;
    });
  };

  const handlePrevImage = () => {
    setCurrentImage(prev => {
      const previous = Math.max(prev - 1, 0);
      console.log(`Previous image: ${previous + 1}/${activeStudy?.imageCount || 120}`);
      return previous;
    });
  };

  const handleWindowLevel = (level: number, width: number) => {
    setViewerSettings(prev => ({
      ...prev,
      windowLevel: level,
      windowWidth: width
    }));
    console.log(`Window Level: ${level}, Window Width: ${width}`);
    
    // Real functionality would:
    // - Adjust image brightness/contrast
    // - Apply DICOM windowing algorithms
    // - Update pixel intensity display
  };

  const handleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // Enter fullscreen
        const viewerElement = document.querySelector('.medical-viewer-container');
        if (viewerElement && viewerElement.requestFullscreen) {
          await viewerElement.requestFullscreen();
          setIsFullscreen(true);
          console.log('Entered fullscreen mode');
        } else if ((viewerElement as any)?.webkitRequestFullscreen) {
          // Safari support
          await (viewerElement as any).webkitRequestFullscreen();
          setIsFullscreen(true);
        } else if ((viewerElement as any)?.msRequestFullscreen) {
          // IE/Edge support
          await (viewerElement as any).msRequestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
        console.log('Exited fullscreen mode');
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

         return () => {
       document.removeEventListener('fullscreenchange', handleFullscreenChange);
       document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
       document.removeEventListener('msfullscreenchange', handleFullscreenChange);
     };
   }, []);

   // Keyboard shortcut for fullscreen (F key)
   React.useEffect(() => {
     const handleKeyPress = (event: KeyboardEvent) => {
       if (event.key === 'f' || event.key === 'F') {
         event.preventDefault();
         handleFullscreen();
       }
       // ESC key to exit fullscreen
       if (event.key === 'Escape' && isFullscreen) {
         handleFullscreen();
       }
     };

     document.addEventListener('keydown', handleKeyPress);
     return () => document.removeEventListener('keydown', handleKeyPress);
   }, [isFullscreen]);

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
      {/* Study List Panel (Left) */}
      <div className="w-96 bg-white/5 backdrop-blur-sm border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Medical Studies</h2>
          <div className="flex gap-2">
            <button className="btn-medical btn-secondary w-full text-sm">
              <CloudArrowUpIcon className="w-4 h-4 mr-2" />
              Import
            </button>
            <button className="btn-medical btn-secondary w-full text-sm">
              <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
              Search
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {studies.map((study) => (
            <div
              key={study.id}
              className={`bg-white/10 backdrop-blur-sm border border-white/20 p-3.5 rounded-lg cursor-pointer transition-all duration-200 ${
                activeStudy?.id === study.id ? 'ring-2 ring-primary border-primary/50 bg-primary/10' : 'hover:bg-white/15 hover:border-white/30'
              }`}
              onClick={() => setActiveStudy(study)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">{study.patientName}</span>
                <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${getStatusPillClass(study.status)}`}>
                  {getStatusIcon(study.status)}
                  <span>{study.status.charAt(0).toUpperCase() + study.status.slice(1)}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>{study.studyDescription}</div>
                <div className="flex justify-between text-xs text-gray-500 pt-1">
                  <span>ID: {study.patientId}</span>
                  <span className="font-medium text-primary">{study.modality}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Viewer and AI Panel */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 p-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeStudy && (
              <>
                <div className="text-sm font-semibold text-primary">{activeStudy.patientName}</div>
                <div className="text-xs text-gray-500">{activeStudy.patientId} • {activeStudy.modality} • {activeStudy.studyDate}</div>
              </>
              )}
            </div>
            <div className="flex items-center gap-2">
            <button onClick={handleEmergencyMode} className={`btn-medical text-sm ${emergencyMode ? 'bg-danger text-white' : 'btn-secondary'}`}>
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                Emergency
              </button>
            <button onClick={() => setCollaborationMode(!collaborationMode)} className="btn-medical btn-secondary text-sm">
                <UserGroupIcon className="w-4 h-4 mr-1" />
                Collaborate
              </button>
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Image Viewer */}
          <div className={`medical-viewer-container flex-1 bg-gray-900 relative overflow-hidden ${isFullscreen ? 'fullscreen-viewer' : ''}`}>
            {/* Toolbar */}
            <div className="absolute top-0 left-0 right-0 z-10 py-6 px-4 bg-white border-b-2 border-gray-300 shadow-lg">
              <div className="flex items-center justify-center gap-8 flex-wrap">
                                  <div className="flex items-center gap-2">
                    <button onClick={handlePlayPause} className="px-3 py-2 bg-gray-100 border border-gray-400 rounded-lg text-gray-900 hover:bg-gray-200 transition-colors" title={isPlaying ? "Pause cine loop" : "Start cine loop"}>
                      {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                    </button>
                    <button onClick={handlePrevImage} className="px-3 py-2 bg-gray-100 border border-gray-400 rounded-lg text-gray-900 hover:bg-gray-200 transition-colors" title="Previous image">
                      <BackwardIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handleNextImage} className="px-3 py-2 bg-gray-100 border border-gray-400 rounded-lg text-gray-900 hover:bg-gray-200 transition-colors" title="Next image">
                      <ForwardIcon className="w-5 h-5" />
                    </button>
                  </div>
                                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToolChange('select')} className={`px-3 py-2 border rounded-lg text-gray-900 transition-colors ${selectedTool === 'select' ? 'bg-blue-200 border-blue-400' : 'bg-gray-100 border-gray-400 hover:bg-gray-200'}`} title="Select/Pan tool">
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleToolChange('annotate')} className={`px-3 py-2 border rounded-lg text-gray-900 transition-colors ${selectedTool === 'annotate' ? 'bg-blue-200 border-blue-400' : 'bg-gray-100 border-gray-400 hover:bg-gray-200'}`} title="Annotation tool">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleToolChange('measure')} className={`px-3 py-2 border rounded-lg text-gray-900 transition-colors ${selectedTool === 'measure' ? 'bg-blue-200 border-blue-400' : 'bg-gray-100 border-gray-400 hover:bg-gray-200'}`} title="Measurement tool">
                      <BeakerIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleZoomIn} className="px-3 py-2 bg-gray-100 border border-gray-400 rounded-lg text-gray-900 hover:bg-gray-200 transition-colors" title={`Zoom in (${Math.round(viewerSettings.zoom * 100)}%)`}>
                      <ArrowsPointingOutIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handleZoomOut} className="px-3 py-2 bg-gray-100 border border-gray-400 rounded-lg text-gray-900 hover:bg-gray-200 transition-colors" title={`Zoom out (${Math.round(viewerSettings.zoom * 100)}%)`}>
                      <ArrowsPointingInIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handleFullscreen} className={`px-3 py-2 border border-gray-400 rounded-lg text-gray-900 hover:bg-gray-200 transition-colors ${isFullscreen ? 'bg-blue-200 border-blue-400' : 'bg-gray-100'}`} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                      <ComputerDesktopIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Image Navigation Controls */}
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-300">
                    <button onClick={handlePrevImage} className="text-gray-900 hover:text-blue-600 p-1">
                      <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <span className="text-gray-900 text-sm font-mono font-bold px-2">
                      {currentImage + 1} / {activeStudy?.imageCount || 120}
                    </span>
                    <button onClick={handleNextImage} className="text-gray-900 hover:text-blue-600 p-1">
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                  </div>
              </div>
            </div>

            {/* Main Viewer Content */}
            <div className="h-full pt-24 flex items-center justify-center p-4">
              {activeStudy ? (
                <div className="w-full h-full max-w-4xl max-h-[700px] relative">
                  {/* DICOM Image Viewport */}
                  <div className="w-full h-full bg-black rounded-lg border border-gray-600 relative overflow-hidden">
                    {/* Mock Medical Image */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center relative">
                      {/* Simulated Medical Image Background */}
                      <div className="absolute inset-0">
                        <div className="w-full h-full bg-gradient-to-br from-gray-800/40 via-gray-700/60 to-gray-900/80"></div>
                      </div>
                      
                      {/* Medical Image Grid Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="grid grid-cols-16 grid-rows-16 h-full w-full">
                          {Array.from({ length: 256 }).map((_, i) => (
                            <div key={i} className="border border-gray-500"></div>
                          ))}
                        </div>
                      </div>

                      {/* Mock Anatomy Structure */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Main organ/structure */}
                        <div className="relative">
                          {/* Central structure (e.g., lung, brain) */}
                          <div className="w-64 h-48 bg-gradient-to-br from-gray-600/40 to-gray-700/60 rounded-full opacity-70 relative">
                            {/* Internal structures */}
                            <div className="absolute top-8 left-12 w-16 h-12 bg-gray-500/30 rounded-full"></div>
                            <div className="absolute top-12 right-16 w-12 h-8 bg-gray-600/40 rounded-full"></div>
                            <div className="absolute bottom-8 left-1/3 w-20 h-10 bg-gray-500/35 rounded-full"></div>
                            
                            {/* Highlighted finding area */}
                            <div className="absolute top-16 right-12 w-8 h-6 bg-red-500/60 rounded-full border border-red-400"></div>
                          </div>
                          
                          {/* Surrounding tissue */}
                          <div className="absolute -top-4 -left-8 w-80 h-56 bg-gradient-to-br from-gray-700/20 to-gray-800/30 rounded-full opacity-40"></div>
                        </div>
                      </div>

                      {/* Enhanced Medical Info Display */}
                      <div className="relative z-10 text-center">
                        <div className="text-gray-300 text-sm space-y-1">
                          <div className="font-mono text-lg text-white">{activeStudy.modality} Image</div>
                          <div className="text-xs text-gray-400">{activeStudy.studyDescription}</div>
                          <div className="text-xs text-gray-500 mt-2">Slice: 45/120 | WW: 400 | WL: 50</div>
                        </div>
                      </div>

                      {/* Image Overlays */}
                      <div className="absolute top-3 left-3 text-white text-xs font-mono space-y-1 bg-black/50 p-2 rounded">
                        <div>Patient: {activeStudy.patientName}</div>
                        <div>Study: {activeStudy.studyDate}</div>
                        <div>Series: 1/3</div>
                      </div>

                      <div className="absolute top-3 right-3 text-white text-xs font-mono space-y-1 bg-black/50 p-2 rounded text-right">
                        <div>Zoom: {Math.round(viewerSettings.zoom * 100)}%</div>
                        <div>WW/WL: {viewerSettings.windowWidth}/{viewerSettings.windowLevel}</div>
                        <div>{activeStudy.modality}</div>
                      </div>

                      <div className="absolute bottom-3 left-3 text-white text-xs font-mono bg-black/50 p-2 rounded">
                        <div>Institution: MedSight Medical Center</div>
                        <div>Manufacturer: Siemens Healthineers</div>
                      </div>

                      <div className="absolute bottom-3 right-3 text-white text-xs font-mono bg-black/50 p-2 rounded text-right">
                        <div>Image: 45/120</div>
                        <div>Thickness: 5.0mm</div>
                      </div>

                      {/* Crosshair */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="absolute w-full h-px bg-green-400 opacity-40"></div>
                        <div className="absolute h-full w-px bg-green-400 opacity-40"></div>
                      </div>

                      {/* Measurements */}
                      {viewerSettings.showMeasurements && (
                        <div className="absolute top-1/4 left-1/4">
                          <div className="relative">
                            <div className="h-20 w-px bg-yellow-400"></div>
                            <div className="w-16 h-px bg-yellow-400"></div>
                            <div className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <div className="absolute -top-6 left-8 text-yellow-400 text-xs font-mono bg-black/70 px-1 rounded">
                              8.2 mm
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AI Overlay */}
                      {viewerSettings.showAIOverlay && (
                        <div className="absolute top-1/3 right-1/4">
                          <div className="w-16 h-12 border-2 border-red-400 rounded opacity-60">
                            <div className="w-full h-full bg-red-400/20"></div>
                          </div>
                          <div className="absolute -top-6 -left-4 text-red-400 text-xs font-mono bg-black/70 px-1 rounded">
                            AI: 94% confidence
                          </div>
                        </div>
                      )}
                    </div>


                  </div>
                  

                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <PhotoIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Study Selected</h3>
                  <p className="text-sm">Select a study from the left panel to view medical images</p>
                </div>
              )}
            </div>
          </div>

          {/* AI & Info Panel (Right) */}
          <div className="w-96 bg-white/5 backdrop-blur-sm border-l border-white/10 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* AI Analysis Section */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-md font-semibold text-gray-800">AI Analysis</h3>
                  <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-medium">
                    {activeStudy?.aiConfidence}% confident
                  </span>
                </div>
                <div className="space-y-2">
                  {activeStudy?.findings.map((finding, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 leading-relaxed">{finding}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Measurements Section */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-3">
                  <BeakerIcon className="w-5 h-5 text-warning" />
                  <h3 className="text-md font-semibold text-gray-800">Measurements</h3>
                </div>
                <div className="space-y-2">
                  {activeStudy?.measurements.map(m => (
                    <div key={m.id} className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600">{m.type}:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-gray-800">{m.value} {m.unit}</span>
                        <span className="text-xs text-success">({m.confidence}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Information Section */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-3">
                  <InformationCircleIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-md font-semibold text-gray-800">Study Information</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Patient:</span> 
                    <span className="font-medium text-gray-800">{activeStudy?.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Modality:</span> 
                    <span className="font-medium text-gray-800">{activeStudy?.modality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date:</span> 
                    <span className="font-medium text-gray-800">{activeStudy?.studyDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Series:</span> 
                    <span className="font-medium text-gray-800">{activeStudy?.seriesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Images:</span> 
                    <span className="font-medium text-gray-800">{activeStudy?.imageCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Size:</span> 
                    <span className="font-medium text-gray-800">{activeStudy?.studySize}</span>
                  </div>
                </div>
              </div>
                    </div>
            <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-success">
                    <ShieldCheckIcon className="w-4 h-4" /> 
                    <span>HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircleIcon className="w-4 h-4" /> 
                    <span>Systems Online</span>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 