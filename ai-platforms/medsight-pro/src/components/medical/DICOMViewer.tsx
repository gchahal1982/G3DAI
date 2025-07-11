'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  EyeIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowPathIcon,
  SunIcon,
  MoonIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  Squares2X2Icon,
  Square3Stack3DIcon,
  CpuChipIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  PhotoIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export interface DICOMImage {
  id: string;
  instanceUID: string;
  seriesUID: string;
  studyUID: string;
  imageNumber: number;
  sliceLocation?: number;
  imageUrl: string;
  thumbnailUrl?: string;
  metadata: {
    patientName: string;
    patientId: string;
    studyDate: string;
    modality: string;
    bodyPart: string;
    pixelSpacing?: [number, number];
    sliceThickness?: number;
    rows: number;
    columns: number;
    bitsAllocated: number;
    windowCenter?: number;
    windowWidth?: number;
    orientation?: string;
  };
  processing?: {
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress?: number;
    errorMessage?: string;
  };
}

export interface DICOMSeries {
  id: string;
  seriesUID: string;
  studyUID: string;
  seriesNumber: number;
  seriesDescription: string;
  modality: string;
  bodyPart: string;
  imageCount: number;
  images: DICOMImage[];
  thumbnailUrl?: string;
}

export interface AIAnnotation {
  id: string;
  type: 'detection' | 'segmentation' | 'measurement' | 'finding';
  label: string;
  confidence: number;
  coordinates: {
    type: 'rectangle' | 'polygon' | 'point' | 'line';
    points: Array<{ x: number; y: number }>;
  };
  metadata: {
    finding: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendations?: string[];
  };
  aiModel: string;
  timestamp: Date;
  verified: boolean;
  reviewedBy?: string;
}

export interface ViewportSettings {
  windowCenter: number;
  windowWidth: number;
  zoom: number;
  pan: { x: number; y: number };
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  invert: boolean;
  interpolation: 'nearest' | 'linear' | 'cubic';
}

export interface DICOMViewerProps {
  series?: DICOMSeries[];
  currentSeriesIndex?: number;
  currentImageIndex?: number;
  aiAnnotations?: AIAnnotation[];
  onImageChange?: (seriesIndex: number, imageIndex: number) => void;
  onViewportChange?: (settings: ViewportSettings) => void;
  onAnnotationClick?: (annotation: AIAnnotation) => void;
  showAIOverlay?: boolean;
  showMeasurements?: boolean;
  enableCine?: boolean;
  enableMultiplanar?: boolean;
  readOnly?: boolean;
}

export function DICOMViewer({
  series = [],
  currentSeriesIndex = 0,
  currentImageIndex = 0,
  aiAnnotations = [],
  onImageChange,
  onViewportChange,
  onAnnotationClick,
  showAIOverlay = true,
  showMeasurements = true,
  enableCine = true,
  enableMultiplanar = false,
  readOnly = false
}: DICOMViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<ViewportSettings>({
    windowCenter: 40,
    windowWidth: 400,
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    rotation: 0,
    flipH: false,
    flipV: false,
    invert: false,
    interpolation: 'linear'
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedTool, setSelectedTool] = useState<'none' | 'pan' | 'zoom' | 'window' | 'measure'>('none');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [presets, setPresets] = useState([
    { name: 'Abdomen', center: 60, width: 400 },
    { name: 'Bone', center: 300, width: 1500 },
    { name: 'Brain', center: 40, width: 80 },
    { name: 'Chest', center: -500, width: 1500 },
    { name: 'Lung', center: -600, width: 1200 },
    { name: 'Liver', center: 60, width: 160 }
  ]);

  const currentSeries = series[currentSeriesIndex];
  const currentImage = currentSeries?.images[currentImageIndex];

  useEffect(() => {
    if (currentImage) {
      loadImage();
    }
  }, [currentSeriesIndex, currentImageIndex]);

  useEffect(() => {
    // Auto-cine playback
    let interval: NodeJS.Timeout;
    if (isPlaying && currentSeries && currentSeries.images.length > 1) {
      interval = setInterval(() => {
        const nextIndex = (currentImageIndex + 1) % currentSeries.images.length;
        onImageChange?.(currentSeriesIndex, nextIndex);
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentImageIndex, currentSeries]);

  const loadImage = useCallback(async () => {
    if (!currentImage || !canvasRef.current) return;

    setImageLoading(true);
    setImageError(null);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Create image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply viewport transformations
        ctx.save();
        
        // Center the image
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        // Apply zoom
        ctx.scale(viewport.zoom, viewport.zoom);
        
        // Apply rotation
        ctx.rotate((viewport.rotation * Math.PI) / 180);
        
        // Apply flips
        ctx.scale(viewport.flipH ? -1 : 1, viewport.flipV ? -1 : 1);
        
        // Apply pan
        ctx.translate(viewport.pan.x, viewport.pan.y);
        
        // Draw image
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        // Apply invert if needed
        if (viewport.invert) {
          ctx.globalCompositeOperation = 'difference';
          ctx.fillStyle = 'white';
          ctx.fillRect(-img.width / 2, -img.height / 2, img.width, img.height);
        }
        
        ctx.restore();

        // Draw AI annotations
        if (showAIOverlay && aiAnnotations.length > 0) {
          drawAIAnnotations(ctx);
        }

        setImageLoading(false);
      };

      img.onerror = () => {
        setImageError('Failed to load DICOM image');
        setImageLoading(false);
      };

      img.src = currentImage.imageUrl;
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Unknown error');
      setImageLoading(false);
    }
  }, [currentImage, viewport, showAIOverlay, aiAnnotations]);

  const drawAIAnnotations = (ctx: CanvasRenderingContext2D) => {
    aiAnnotations.forEach(annotation => {
      const { coordinates, metadata, confidence } = annotation;
      
      // Set annotation style based on severity
      const severityColors = {
        low: '#22c55e',
        medium: '#f59e0b',
        high: '#ef4444',
        critical: '#dc2626'
      };
      
      ctx.strokeStyle = severityColors[metadata.severity];
      ctx.lineWidth = 2;
      ctx.fillStyle = `${severityColors[metadata.severity]}20`;

      if (coordinates.type === 'rectangle' && coordinates.points.length >= 2) {
        const [p1, p2] = coordinates.points;
        const width = p2.x - p1.x;
        const height = p2.y - p1.y;
        
        ctx.fillRect(p1.x, p1.y, width, height);
        ctx.strokeRect(p1.x, p1.y, width, height);
        
        // Draw label
        ctx.fillStyle = severityColors[metadata.severity];
        ctx.font = '12px Inter';
        ctx.fillText(
          `${annotation.label} (${(confidence * 100).toFixed(1)}%)`,
          p1.x,
          p1.y - 5
        );
      } else if (coordinates.type === 'polygon') {
        ctx.beginPath();
        coordinates.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || readOnly) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    if (selectedTool === 'pan') {
      setViewport(prev => ({
        ...prev,
        pan: {
          x: prev.pan.x + deltaX / prev.zoom,
          y: prev.pan.y + deltaY / prev.zoom
        }
      }));
      setDragStart({ x, y });
    } else if (selectedTool === 'window') {
      setViewport(prev => ({
        ...prev,
        windowCenter: prev.windowCenter + deltaX,
        windowWidth: Math.max(1, prev.windowWidth + deltaY * 2)
      }));
      setDragStart({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (readOnly) return;
    
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(10, prev.zoom * zoomFactor))
    }));
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setViewport(prev => ({
      ...prev,
      windowCenter: preset.center,
      windowWidth: preset.width
    }));
  };

  const resetViewport = () => {
    setViewport({
      windowCenter: currentImage?.metadata.windowCenter || 40,
      windowWidth: currentImage?.metadata.windowWidth || 400,
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      rotation: 0,
      flipH: false,
      flipV: false,
      invert: false,
      interpolation: 'linear'
    });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleCinePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!currentSeries) return;

    let newIndex = currentImageIndex;
    if (direction === 'next') {
      newIndex = (currentImageIndex + 1) % currentSeries.images.length;
    } else {
      newIndex = currentImageIndex === 0 ? currentSeries.images.length - 1 : currentImageIndex - 1;
    }
    
    onImageChange?.(currentSeriesIndex, newIndex);
  };

  const navigateSeries = (direction: 'prev' | 'next') => {
    if (series.length <= 1) return;

    let newSeriesIndex = currentSeriesIndex;
    if (direction === 'next') {
      newSeriesIndex = (currentSeriesIndex + 1) % series.length;
    } else {
      newSeriesIndex = currentSeriesIndex === 0 ? series.length - 1 : currentSeriesIndex - 1;
    }
    
    onImageChange?.(newSeriesIndex, 0);
  };

  const getCriticalAnnotations = () => {
    return aiAnnotations.filter(ann => ann.metadata.severity === 'critical');
  };

  const getHighAnnotations = () => {
    return aiAnnotations.filter(ann => ann.metadata.severity === 'high');
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[600px]'}`}
    >
      {/* DICOM Image Canvas */}
      <div className="relative w-full h-full flex items-center justify-center">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="medsight-glass p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-medsight-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-medsight-primary">Loading DICOM image...</span>
              </div>
            </div>
          </div>
        )}
        
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="medsight-glass p-4 rounded-lg max-w-md">
              <div className="flex items-center space-x-3 mb-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-medsight-critical" />
                <span className="text-sm font-medium text-medsight-critical">DICOM Error</span>
              </div>
              <p className="text-xs text-medsight-critical/70 mb-3">{imageError}</p>
              <button onClick={loadImage} className="btn-medsight text-sm">
                Retry Load
              </button>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* AI Critical Findings Alert */}
        {getCriticalAnnotations().length > 0 && (
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-medsight-critical/90 text-white p-3 rounded-lg animate-pulse">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {getCriticalAnnotations().length} Critical Finding{getCriticalAnnotations().length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Image Info Overlay */}
        {currentImage && (
          <div className="absolute top-4 right-4 z-20">
            <div className="medsight-glass p-3 rounded-lg text-xs">
              <div className="space-y-1 text-medsight-primary">
                <div>{currentImage.metadata.patientName}</div>
                <div>{currentImage.metadata.studyDate}</div>
                <div>{currentImage.metadata.modality} - {currentImage.metadata.bodyPart}</div>
                <div>Image {currentImageIndex + 1} of {currentSeries?.images.length || 0}</div>
                <div>WC: {viewport.windowCenter} WW: {viewport.windowWidth}</div>
                <div>Zoom: {(viewport.zoom * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Viewport Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="medsight-glass p-3 rounded-xl">
            <div className="flex items-center space-x-2">
              {/* Navigation Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => navigateSeries('prev')}
                  disabled={series.length <= 1}
                  className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous Series"
                >
                  <Square3Stack3DIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => navigateImage('prev')}
                  disabled={!currentSeries || currentSeries.images.length <= 1}
                  className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg disabled:opacity-50"
                  title="Previous Image"
                >
                  <BackwardIcon className="w-4 h-4" />
                </button>
                
                {enableCine && (
                  <button
                    onClick={toggleCinePlay}
                    disabled={!currentSeries || currentSeries.images.length <= 1}
                    className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg disabled:opacity-50"
                    title={isPlaying ? "Pause Cine" : "Play Cine"}
                  >
                    {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                  </button>
                )}
                
                <button
                  onClick={() => navigateImage('next')}
                  disabled={!currentSeries || currentSeries.images.length <= 1}
                  className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg disabled:opacity-50"
                  title="Next Image"
                >
                  <ForwardIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => navigateSeries('next')}
                  disabled={series.length <= 1}
                  className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg disabled:opacity-50"
                  title="Next Series"
                >
                  <Square3Stack3DIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="w-px h-6 bg-medsight-primary/20"></div>

              {/* Tool Selection */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setSelectedTool(selectedTool === 'pan' ? 'none' : 'pan')}
                  className={`p-2 rounded-lg ${selectedTool === 'pan' ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'}`}
                  title="Pan Tool"
                >
                  <ArrowsPointingOutIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setSelectedTool(selectedTool === 'zoom' ? 'none' : 'zoom')}
                  className={`p-2 rounded-lg ${selectedTool === 'zoom' ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'}`}
                  title="Zoom Tool"
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setSelectedTool(selectedTool === 'window' ? 'none' : 'window')}
                  className={`p-2 rounded-lg ${selectedTool === 'window' ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'}`}
                  title="Window Level"
                >
                  <SunIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="w-px h-6 bg-medsight-primary/20"></div>

              {/* Viewport Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setViewport(prev => ({ ...prev, flipH: !prev.flipH }))}
                  className={`p-2 rounded-lg ${viewport.flipH ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'}`}
                  title="Flip Horizontal"
                >
                  ⇄
                </button>
                
                <button
                  onClick={() => setViewport(prev => ({ ...prev, flipV: !prev.flipV }))}
                  className={`p-2 rounded-lg ${viewport.flipV ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'}`}
                  title="Flip Vertical"
                >
                  ⇅
                </button>
                
                <button
                  onClick={() => setViewport(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))}
                  className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg"
                  title="Rotate 90°"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setViewport(prev => ({ ...prev, invert: !prev.invert }))}
                  className={`p-2 rounded-lg ${viewport.invert ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'}`}
                  title="Invert Colors"
                >
                  <MoonIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={resetViewport}
                  className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg"
                  title="Reset View"
                >
                  <ArrowsPointingInIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="w-px h-6 bg-medsight-primary/20"></div>

              {/* AI & Display Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setShowControls(!showControls)}
                  className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg"
                  title="Toggle Controls"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg"
                  title="Toggle Fullscreen"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Window Level Presets */}
      <div className="absolute left-4 bottom-4 z-30">
        <div className="medsight-glass p-3 rounded-xl">
          <div className="space-y-2">
            <div className="text-xs font-medium text-medsight-primary mb-2">Window Presets</div>
            <div className="grid grid-cols-2 gap-1">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="px-2 py-1 text-xs text-medsight-primary hover:bg-medsight-primary/10 rounded"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Annotations Panel */}
      {aiAnnotations.length > 0 && (
        <div className="absolute right-4 bottom-4 z-30 max-w-xs">
          <div className="medsight-ai-glass p-3 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <BeakerIcon className="w-4 h-4 text-medsight-ai-high" />
              <span className="text-xs font-medium text-medsight-ai-high">AI Findings</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {aiAnnotations.slice(0, 3).map((annotation) => (
                <div
                  key={annotation.id}
                  onClick={() => onAnnotationClick?.(annotation)}
                  className="p-2 bg-white/10 rounded cursor-pointer hover:bg-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-medsight-ai-high">{annotation.label}</span>
                    <span className="text-xs text-medsight-ai-high/70">
                      {(annotation.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  {annotation.metadata.severity === 'critical' && (
                    <div className="flex items-center space-x-1 mt-1">
                      <ExclamationTriangleIcon className="w-3 h-3 text-medsight-critical" />
                      <span className="text-xs text-medsight-critical">Critical</span>
                    </div>
                  )}
                </div>
              ))}
              {aiAnnotations.length > 3 && (
                <div className="text-xs text-medsight-ai-high/70 text-center py-1">
                  +{aiAnnotations.length - 3} more findings
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 