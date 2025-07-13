'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  SparklesIcon,
  BoltIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PhotoIcon,
  InformationCircleIcon,
  CheckBadgeIcon,
  SunIcon,
  MoonIcon,
  AcademicCapIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ChartBarIcon,
  RectangleGroupIcon,
  Square3Stack3DIcon,
  CircleStackIcon,
  CalendarIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface DICOMViewerProps {
  studyId?: string;
  className?: string;
  onMeasurement?: (measurement: any) => void;
  onAnnotation?: (annotation: any) => void;
  onAIAnalysis?: (analysis: any) => void;
  showAIOverlay?: boolean;
  showMeasurements?: boolean;
  showAnnotations?: boolean;
  emergencyMode?: boolean;
  collaborationMode?: boolean;
}

interface ViewerState {
  currentSeries: number;
  currentImage: number;
  windowLevel: number;
  windowWidth: number;
  zoom: number;
  pan: { x: number; y: number };
  rotation: number;
  isPlaying: boolean;
  playbackSpeed: number;
  brightness: number;
  contrast: number;
  invert: boolean;
  interpolation: 'nearest' | 'bilinear' | 'bicubic';
  orientation: 'axial' | 'coronal' | 'sagittal';
  crosshairs: boolean;
  rulers: boolean;
  grid: boolean;
  annotations: boolean;
  measurements: boolean;
  aiOverlay: boolean;
  hangingProtocol: 'default' | 'chest' | 'abdomen' | 'brain' | 'bone' | 'mri';
}

interface Annotation {
  id: string;
  type: 'arrow' | 'text' | 'rectangle' | 'circle' | 'freehand';
  coordinates: { x: number; y: number }[];
  text?: string;
  color: string;
  thickness: number;
  timestamp: string;
  user: string;
  series: number;
  image: number;
}

interface Measurement {
  id: string;
  type: 'length' | 'area' | 'angle' | 'circle' | 'ellipse' | 'ratio';
  coordinates: { x: number; y: number }[];
  value: number;
  unit: string;
  confidence: number;
  timestamp: string;
  user: string;
  series: number;
  image: number;
}

interface AIAnalysis {
  id: string;
  type: 'detection' | 'segmentation' | 'classification' | 'measurement';
  region: { x: number; y: number; width: number; height: number };
  confidence: number;
  label: string;
  finding: string;
  severity: 'normal' | 'abnormal' | 'critical' | 'urgent';
  timestamp: string;
  model: string;
  version: string;
}

export default function DICOMViewer({
  studyId,
  className = '',
  onMeasurement,
  onAnnotation,
  onAIAnalysis,
  showAIOverlay = true,
  showMeasurements = true,
  showAnnotations = true,
  emergencyMode = false,
  collaborationMode = false
}: DICOMViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewerState, setViewerState] = useState<ViewerState>({
    currentSeries: 0,
    currentImage: 0,
    windowLevel: 40,
    windowWidth: 400,
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    rotation: 0,
    isPlaying: false,
    playbackSpeed: 5,
    brightness: 50,
    contrast: 50,
    invert: false,
    interpolation: 'bilinear',
    orientation: 'axial',
    crosshairs: false,
    rulers: false,
    grid: false,
    annotations: showAnnotations,
    measurements: showMeasurements,
    aiOverlay: showAIOverlay,
    hangingProtocol: 'default'
  });

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [aiAnalyses, setAIAnalyses] = useState<AIAnalysis[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('pan');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<{ x: number; y: number }[]>([]);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [studyMetadata, setStudyMetadata] = useState<any>(null);

  // Mock study data
  const mockStudyData = {
    id: studyId || 'STU001',
    patientName: 'Smith, John',
    patientId: 'PAT001',
    studyDescription: 'Chest CT with Contrast',
    modality: 'CT',
    seriesCount: 4,
    imageCount: 256,
    currentSeries: viewerState.currentSeries,
    currentImage: viewerState.currentImage,
    windowPresets: [
      { name: 'Lung', level: -500, width: 1500 },
      { name: 'Mediastinum', level: 50, width: 350 },
      { name: 'Bone', level: 300, width: 1500 },
      { name: 'Soft Tissue', level: 40, width: 400 }
    ],
    pixelSpacing: [0.7, 0.7],
    sliceThickness: 5.0,
    imagePosition: [0, 0, 0],
    imageOrientation: [1, 0, 0, 0, 1, 0]
  };

  const handleZoomIn = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.2, 10.0)
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.2, 0.1)
    }));
  }, []);

  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setViewerState(prev => ({
      ...prev,
      pan: {
        x: prev.pan.x + deltaX,
        y: prev.pan.y + deltaY
      }
    }));
  }, []);

  const handleRotate = useCallback((degrees: number) => {
    setViewerState(prev => ({
      ...prev,
      rotation: (prev.rotation + degrees) % 360
    }));
  }, []);

  const handleWindowLevel = useCallback((level: number, width: number) => {
    setViewerState(prev => ({
      ...prev,
      windowLevel: level,
      windowWidth: width
    }));
  }, []);

  const handlePlayPause = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  }, []);

  const handleNextImage = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      currentImage: Math.min(prev.currentImage + 1, mockStudyData.imageCount - 1)
    }));
  }, []);

  const handlePrevImage = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      currentImage: Math.max(prev.currentImage - 1, 0)
    }));
  }, []);

  const handleNextSeries = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      currentSeries: Math.min(prev.currentSeries + 1, mockStudyData.seriesCount - 1),
      currentImage: 0
    }));
  }, []);

  const handlePrevSeries = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      currentSeries: Math.max(prev.currentSeries - 1, 0),
      currentImage: 0
    }));
  }, []);

  const handleReset = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      rotation: 0,
      windowLevel: 40,
      windowWidth: 400,
      brightness: 50,
      contrast: 50,
      invert: false
    }));
  }, []);

  const handleToolChange = useCallback((tool: string) => {
    setSelectedTool(tool);
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (selectedTool === 'annotation') {
      const annotation: Annotation = {
        id: `ann_${Date.now()}`,
        type: 'text',
        coordinates: [{ x, y }],
        text: 'New annotation',
        color: '#0ea5e9',
        thickness: 2,
        timestamp: new Date().toISOString(),
        user: 'Current User',
        series: viewerState.currentSeries,
        image: viewerState.currentImage
      };
      setAnnotations(prev => [...prev, annotation]);
      onAnnotation?.(annotation);
    } else if (selectedTool === 'measurement') {
      // Start measurement
      setCurrentDrawing([{ x, y }]);
      setIsDrawing(true);
    }
  }, [selectedTool, viewerState.currentSeries, viewerState.currentImage, onAnnotation]);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedTool !== 'measurement') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (currentDrawing.length > 0) {
      setCurrentDrawing(prev => [...prev.slice(0, 1), { x, y }]);
    }
  }, [isDrawing, selectedTool, currentDrawing]);

  const handleCanvasMouseUp = useCallback(() => {
    if (isDrawing && selectedTool === 'measurement' && currentDrawing.length >= 2) {
      const start = currentDrawing[0];
      const end = currentDrawing[1];
      const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      
      const measurement: Measurement = {
        id: `meas_${Date.now()}`,
        type: 'length',
        coordinates: currentDrawing,
        value: distance * mockStudyData.pixelSpacing[0], // Convert to mm
        unit: 'mm',
        confidence: 95,
        timestamp: new Date().toISOString(),
        user: 'Current User',
        series: viewerState.currentSeries,
        image: viewerState.currentImage
      };
      
      setMeasurements(prev => [...prev, measurement]);
      onMeasurement?.(measurement);
    }
    
    setIsDrawing(false);
    setCurrentDrawing([]);
  }, [isDrawing, selectedTool, currentDrawing, viewerState.currentSeries, viewerState.currentImage, onMeasurement]);

  // Mock AI analysis
  useEffect(() => {
    if (showAIOverlay) {
      const mockAIAnalysis: AIAnalysis[] = [
        {
          id: 'ai_001',
          type: 'detection',
          region: { x: 150, y: 120, width: 80, height: 60 },
          confidence: 92,
          label: 'Pulmonary Nodule',
          finding: 'Small nodule in right upper lobe',
          severity: 'abnormal',
          timestamp: new Date().toISOString(),
          model: 'MedicalAI-CT-v2.1',
          version: '2.1.0'
        }
      ];
      setAIAnalyses(mockAIAnalysis);
    }
  }, [showAIOverlay]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw mock medical image
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw mock CT scan
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 150, 0, 2 * Math.PI);
    ctx.fill();

    // Draw mock organs
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(canvas.width / 2 - 50, canvas.height / 2 - 30, 40, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvas.width / 2 + 50, canvas.height / 2 - 30, 40, 0, 2 * Math.PI);
    ctx.fill();

    // Draw AI analysis overlays
    if (viewerState.aiOverlay && aiAnalyses.length > 0) {
      aiAnalyses.forEach(analysis => {
        ctx.strokeStyle = analysis.severity === 'critical' ? '#dc2626' : 
                         analysis.severity === 'abnormal' ? '#ef4444' : 
                         '#10b981';
        ctx.lineWidth = 2;
        ctx.strokeRect(analysis.region.x, analysis.region.y, analysis.region.width, analysis.region.height);
        
        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = '12px sans-serif';
        ctx.fillText(`${analysis.label} (${analysis.confidence}%)`, 
                    analysis.region.x, analysis.region.y - 5);
      });
    }

    // Draw measurements
    if (viewerState.measurements && measurements.length > 0) {
      measurements.forEach(measurement => {
        if (measurement.series === viewerState.currentSeries && 
            measurement.image === viewerState.currentImage) {
          ctx.strokeStyle = '#0ea5e9';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(measurement.coordinates[0].x, measurement.coordinates[0].y);
          for (let i = 1; i < measurement.coordinates.length; i++) {
            ctx.lineTo(measurement.coordinates[i].x, measurement.coordinates[i].y);
          }
          ctx.stroke();
          
          ctx.fillStyle = '#0ea5e9';
          ctx.font = '12px sans-serif';
          ctx.fillText(`${measurement.value.toFixed(1)} ${measurement.unit}`, 
                      measurement.coordinates[0].x + 5, measurement.coordinates[0].y - 5);
        }
      });
    }

    // Draw current drawing
    if (isDrawing && currentDrawing.length > 0) {
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentDrawing[0].x, currentDrawing[0].y);
      for (let i = 1; i < currentDrawing.length; i++) {
        ctx.lineTo(currentDrawing[i].x, currentDrawing[i].y);
      }
      ctx.stroke();
    }

    // Draw annotations
    if (viewerState.annotations && annotations.length > 0) {
      annotations.forEach(annotation => {
        if (annotation.series === viewerState.currentSeries && 
            annotation.image === viewerState.currentImage) {
          ctx.fillStyle = annotation.color;
          ctx.font = '14px sans-serif';
          ctx.fillText(annotation.text || '', 
                      annotation.coordinates[0].x, annotation.coordinates[0].y);
        }
      });
    }

    // Draw crosshairs
    if (viewerState.crosshairs) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }

    // Draw rulers
    if (viewerState.rulers) {
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1;
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#6b7280';
      
      // Top ruler
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 10);
        ctx.stroke();
        ctx.fillText(`${i}`, i + 2, 8);
      }
      
      // Left ruler
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(10, i);
        ctx.stroke();
        ctx.fillText(`${i}`, 2, i - 2);
      }
    }

    // Draw image info overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 100);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Series: ${viewerState.currentSeries + 1}/${mockStudyData.seriesCount}`, 20, 30);
    ctx.fillText(`Image: ${viewerState.currentImage + 1}/${mockStudyData.imageCount}`, 20, 50);
    ctx.fillText(`W/L: ${viewerState.windowWidth}/${viewerState.windowLevel}`, 20, 70);
    ctx.fillText(`Zoom: ${(viewerState.zoom * 100).toFixed(0)}%`, 20, 90);

  }, [viewerState, annotations, measurements, aiAnalyses, isDrawing, currentDrawing]);

  return (
    <div className={`relative h-full bg-black ${className}`}>
      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
      />

      {/* Overlay Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 medsight-control-glass p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-900">DICOM Viewer</h3>
            <button
              onClick={() => setShowControls(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <button onClick={handlePrevImage} className="btn-medsight p-1">
                <BackwardIcon className="w-3 h-3" />
              </button>
              <button onClick={handlePlayPause} className="btn-medsight p-1">
                {viewerState.isPlaying ? <PauseIcon className="w-3 h-3" /> : <PlayIcon className="w-3 h-3" />}
              </button>
              <button onClick={handleNextImage} className="btn-medsight p-1">
                <ForwardIcon className="w-3 h-3" />
              </button>
            </div>
            
            {/* Tools */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleToolChange('pan')}
                className={`btn-medsight p-1 ${selectedTool === 'pan' ? 'bg-medsight-primary/20' : ''}`}
              >
                <ArrowsPointingOutIcon className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleToolChange('annotation')}
                className={`btn-medsight p-1 ${selectedTool === 'annotation' ? 'bg-medsight-primary/20' : ''}`}
              >
                <PencilIcon className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleToolChange('measurement')}
                className={`btn-medsight p-1 ${selectedTool === 'measurement' ? 'bg-medsight-primary/20' : ''}`}
              >
                <BeakerIcon className="w-3 h-3" />
              </button>
            </div>
            
            {/* Zoom */}
            <div className="flex items-center gap-1">
              <button onClick={handleZoomOut} className="btn-medsight p-1">
                <ArrowsPointingInIcon className="w-3 h-3" />
              </button>
              <button onClick={handleZoomIn} className="btn-medsight p-1">
                <ArrowsPointingOutIcon className="w-3 h-3" />
              </button>
              <button onClick={handleReset} className="btn-medsight p-1">
                <ArrowUpIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Window Presets */}
      <div className="absolute bottom-4 left-4 medsight-control-glass p-2 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Presets:</span>
          {mockStudyData.windowPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => handleWindowLevel(preset.level, preset.width)}
              className="btn-medsight text-xs px-2 py-1"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* AI Analysis Panel */}
      {showAIOverlay && aiAnalyses.length > 0 && (
        <div className="absolute top-4 right-4 medsight-ai-glass p-3 rounded-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-4 h-4 text-medsight-ai-high" />
            <span className="text-sm font-medium text-white">AI Analysis</span>
          </div>
          <div className="space-y-2">
            {aiAnalyses.map((analysis) => (
              <div key={analysis.id} className="text-xs text-gray-300">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{analysis.label}</span>
                  <span className={`px-1 py-0.5 rounded text-xs ${
                    analysis.confidence >= 90 ? 'bg-medsight-ai-high/20 text-medsight-ai-high' :
                    analysis.confidence >= 70 ? 'bg-medsight-ai-medium/20 text-medsight-ai-medium' :
                    'bg-medsight-ai-low/20 text-medsight-ai-low'
                  }`}>
                    {analysis.confidence}%
                  </span>
                </div>
                <div className="text-gray-400 mt-1">{analysis.finding}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <SparklesIcon className="w-8 h-8 text-medsight-primary animate-spin mx-auto mb-2" />
            <p className="text-white">Loading DICOM images...</p>
          </div>
        </div>
      )}

      {/* Emergency Mode Indicator */}
      {emergencyMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-medsight-critical/20 border border-medsight-critical text-medsight-critical px-3 py-1 rounded-lg text-sm font-medium">
          <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
          Emergency Mode Active
        </div>
      )}

      {/* Collaboration Indicator */}
      {collaborationMode && (
        <div className="absolute bottom-4 right-4 medsight-control-glass p-2 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <UserGroupIcon className="w-4 h-4 text-medsight-primary" />
            <span className="text-gray-600">2 users viewing</span>
          </div>
        </div>
      )}

      {/* Collapsed Controls Toggle */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-4 left-4 medsight-control-glass p-2 rounded-lg"
        >
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
} 