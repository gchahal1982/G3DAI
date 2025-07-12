'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  PhotoIcon,
  EyeIcon,
  EyeSlashIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Squares2X2Icon,
  RectangleStackIcon,
  DocumentTextIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  CogIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  ComputerDesktopIcon,
  FireIcon,
  LockClosedIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { 
  PhotoIcon as PhotoIconSolid,
  EyeIcon as EyeIconSolid,
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid
} from '@heroicons/react/24/solid';
import React from 'react';

interface DICOMImage {
  id: string;
  seriesId: string;
  studyId: string;
  instanceNumber: number;
  sopInstanceUID: string;
  imageData: ArrayBuffer | null;
  metadata: {
    rows: number;
    columns: number;
    bitsAllocated: number;
    bitsStored: number;
    pixelRepresentation: number;
    photometricInterpretation: string;
    samplesPerPixel: number;
    planarConfiguration?: number;
    pixelSpacing?: [number, number];
    sliceThickness?: number;
    sliceLocation?: number;
    imagePosition?: [number, number, number];
    imageOrientation?: [number, number, number, number, number, number];
    windowCenter?: number;
    windowWidth?: number;
    rescaleIntercept?: number;
    rescaleSlope?: number;
  };
  processed: boolean;
  cached: boolean;
  loadTime: number;
  fileSize: number;
}

interface DICOMSeries {
  id: string;
  studyId: string;
  seriesNumber: number;
  seriesDescription: string;
  modality: string;
  bodyPart: string;
  imageCount: number;
  images: DICOMImage[];
  loaded: boolean;
  loading: boolean;
  error?: string;
}

interface ViewerState {
  windowLevel: number;
  windowWidth: number;
  zoom: number;
  pan: { x: number; y: number };
  rotation: number;
  invert: boolean;
  interpolation: 'nearest' | 'linear' | 'cubic';
  overlays: boolean;
  annotations: boolean;
  measurements: boolean;
  cineMode: boolean;
  cineSpeed: number; // FPS
  currentFrame: number;
  playing: boolean;
  muted: boolean;
  layout: 'single' | 'dual' | 'quad' | 'stack';
  crosshairs: boolean;
  rulers: boolean;
  grid: boolean;
  magnifier: boolean;
  histogram: boolean;
}

interface ViewerTool {
  id: string;
  name: string;
  icon: any;
  description: string;
  active: boolean;
  category: 'navigation' | 'windowing' | 'measurement' | 'annotation' | 'analysis';
  cursor?: string;
  shortcut?: string;
}

interface DICOMViewerProps {
  studyId: string;
  seriesId?: string;
  imageId?: string;
  onImageChange?: (imageId: string) => void;
  onSeriesChange?: (seriesId: string) => void;
  onMeasurement?: (measurement: any) => void;
  onAnnotation?: (annotation: any) => void;
  className?: string;
  readOnly?: boolean;
  showControls?: boolean;
  showOverlays?: boolean;
  autoPlay?: boolean;
  preloadImages?: boolean;
}

export default function DICOMViewer({
  studyId,
  seriesId,
  imageId,
  onImageChange,
  onSeriesChange,
  onMeasurement,
  onAnnotation,
  className = '',
  readOnly = false,
  showControls = true,
  showOverlays = true,
  autoPlay = false,
  preloadImages = true
}: DICOMViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [series, setSeries] = useState<DICOMSeries[]>([]);
  const [currentSeries, setCurrentSeries] = useState<DICOMSeries | null>(null);
  const [currentImage, setCurrentImage] = useState<DICOMImage | null>(null);
  const [viewerState, setViewerState] = useState<ViewerState>({
    windowLevel: 40,
    windowWidth: 400,
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    rotation: 0,
    invert: false,
    interpolation: 'linear',
    overlays: showOverlays,
    annotations: true,
    measurements: true,
    cineMode: false,
    cineSpeed: 10,
    currentFrame: 0,
    playing: false,
    muted: false,
    layout: 'single',
    crosshairs: false,
    rulers: false,
    grid: false,
    magnifier: false,
    histogram: false
  });
  const [activeTool, setActiveTool] = useState<string>('pan');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [pixelValue, setPixelValue] = useState<number | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

  const tools: ViewerTool[] = [
    {
      id: 'pan',
      name: 'Pan',
      icon: ArrowsPointingOutIcon,
      description: 'Pan the image',
      active: activeTool === 'pan',
      category: 'navigation',
      cursor: 'grab',
      shortcut: 'P'
    },
    {
      id: 'zoom',
      name: 'Zoom',
      icon: MagnifyingGlassIcon,
      description: 'Zoom in/out',
      active: activeTool === 'zoom',
      category: 'navigation',
      cursor: 'zoom-in',
      shortcut: 'Z'
    },
    {
      id: 'windowing',
      name: 'Window/Level',
      icon: AdjustmentsHorizontalIcon,
      description: 'Adjust window/level',
      active: activeTool === 'windowing',
      category: 'windowing',
      cursor: 'ew-resize',
      shortcut: 'W'
    },
    {
      id: 'length',
      name: 'Length',
      icon: ChartBarIcon,
      description: 'Measure length',
      active: activeTool === 'length',
      category: 'measurement',
      cursor: 'crosshair',
      shortcut: 'L'
    },
    {
      id: 'angle',
      name: 'Angle',
      icon: ChartBarIcon,
      description: 'Measure angle',
      active: activeTool === 'angle',
      category: 'measurement',
      cursor: 'crosshair',
      shortcut: 'A'
    },
    {
      id: 'rectangle',
      name: 'Rectangle ROI',
      icon: Squares2X2Icon,
      description: 'Rectangle region of interest',
      active: activeTool === 'rectangle',
      category: 'measurement',
      cursor: 'crosshair',
      shortcut: 'R'
    },
    {
      id: 'annotation',
      name: 'Annotation',
      icon: DocumentTextIcon,
      description: 'Add text annotation',
      active: activeTool === 'annotation',
      category: 'annotation',
      cursor: 'text',
      shortcut: 'T'
    },
    {
      id: 'magnifier',
      name: 'Magnifier',
      icon: MagnifyingGlassPlusIcon,
      description: 'Magnifying glass',
      active: activeTool === 'magnifier',
      category: 'analysis',
      cursor: 'zoom-in',
      shortcut: 'M'
    }
  ];

  useEffect(() => {
    loadDICOMStudy();
  }, [studyId]);

  useEffect(() => {
    if (seriesId && series.length > 0) {
      const targetSeries = series.find(s => s.id === seriesId);
      if (targetSeries) {
        setCurrentSeries(targetSeries);
        if (targetSeries.images.length > 0) {
          setCurrentImage(targetSeries.images[0]);
        }
      }
    }
  }, [seriesId, series]);

  useEffect(() => {
    if (imageId && currentSeries) {
      const targetImage = currentSeries.images.find(img => img.id === imageId);
      if (targetImage) {
        setCurrentImage(targetImage);
      }
    }
  }, [imageId, currentSeries]);

  useEffect(() => {
    if (currentImage) {
      renderDICOMImage();
    }
  }, [currentImage, viewerState]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (viewerState.playing && viewerState.cineMode && currentSeries) {
      interval = setInterval(() => {
        nextFrame();
      }, 1000 / viewerState.cineSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [viewerState.playing, viewerState.cineMode, viewerState.cineSpeed, currentSeries]);

  const loadDICOMStudy = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data - in production, this would connect to backend DICOMProcessor.ts
      const mockSeries: DICOMSeries[] = [
        {
          id: 'series_001',
          studyId,
          seriesNumber: 1,
          seriesDescription: 'Axial CT Chest with Contrast',
          modality: 'CT',
          bodyPart: 'Chest',
          imageCount: 128,
          images: Array.from({ length: 128 }, (_, index) => ({
            id: `image_${index + 1}`,
            seriesId: 'series_001',
            studyId,
            instanceNumber: index + 1,
            sopInstanceUID: `1.2.3.4.5.6.${index + 1}`,
            imageData: null,
            metadata: {
              rows: 512,
              columns: 512,
              bitsAllocated: 16,
              bitsStored: 12,
              pixelRepresentation: 0,
              photometricInterpretation: 'MONOCHROME2',
              samplesPerPixel: 1,
              pixelSpacing: [0.625, 0.625],
              sliceThickness: 5.0,
              sliceLocation: index * 5.0,
              imagePosition: [0, 0, index * 5.0],
              imageOrientation: [1, 0, 0, 0, 1, 0],
              windowCenter: 40,
              windowWidth: 400,
              rescaleIntercept: -1024,
              rescaleSlope: 1
            },
            processed: false,
            cached: false,
            loadTime: 0,
            fileSize: 524288 // 512KB
          })),
          loaded: true,
          loading: false
        },
        {
          id: 'series_002',
          studyId,
          seriesNumber: 2,
          seriesDescription: 'Coronal CT Chest with Contrast',
          modality: 'CT',
          bodyPart: 'Chest',
          imageCount: 96,
          images: Array.from({ length: 96 }, (_, index) => ({
            id: `image_cor_${index + 1}`,
            seriesId: 'series_002',
            studyId,
            instanceNumber: index + 1,
            sopInstanceUID: `1.2.3.4.5.7.${index + 1}`,
            imageData: null,
            metadata: {
              rows: 512,
              columns: 512,
              bitsAllocated: 16,
              bitsStored: 12,
              pixelRepresentation: 0,
              photometricInterpretation: 'MONOCHROME2',
              samplesPerPixel: 1,
              pixelSpacing: [0.625, 0.625],
              sliceThickness: 5.0,
              sliceLocation: index * 5.0,
              imagePosition: [0, index * 5.0, 0],
              imageOrientation: [1, 0, 0, 0, 0, -1],
              windowCenter: 40,
              windowWidth: 400,
              rescaleIntercept: -1024,
              rescaleSlope: 1
            },
            processed: false,
            cached: false,
            loadTime: 0,
            fileSize: 524288
          })),
          loaded: true,
          loading: false
        }
      ];

      setSeries(mockSeries);
      
      // Set initial series and image
      if (mockSeries.length > 0) {
        const initialSeries = mockSeries[0];
        setCurrentSeries(initialSeries);
        if (initialSeries.images.length > 0) {
          setCurrentImage(initialSeries.images[0]);
          
          // Set initial window/level from DICOM metadata
          const firstImage = initialSeries.images[0];
          if (firstImage.metadata.windowCenter && firstImage.metadata.windowWidth) {
            setViewerState(prev => ({
              ...prev,
              windowLevel: firstImage.metadata.windowCenter!,
              windowWidth: firstImage.metadata.windowWidth!
            }));
          }
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading DICOM study:', error);
      setError('Failed to load DICOM study');
      setLoading(false);
    }
  };

  const renderDICOMImage = useCallback(() => {
    if (!currentImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mock DICOM image rendering
    const { rows, columns } = currentImage.metadata;
    const imageWidth = columns;
    const imageHeight = rows;

    // Calculate display dimensions with zoom and pan
    const scaledWidth = imageWidth * viewerState.zoom;
    const scaledHeight = imageHeight * viewerState.zoom;
    const x = (canvas.width - scaledWidth) / 2 + viewerState.pan.x;
    const y = (canvas.height - scaledHeight) / 2 + viewerState.pan.y;

    // Save context for transformations
    ctx.save();

    // Apply rotation
    if (viewerState.rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((viewerState.rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Mock image data (gradient pattern)
    const gradient = ctx.createRadialGradient(
      x + scaledWidth / 2, y + scaledHeight / 2, 0,
      x + scaledWidth / 2, y + scaledHeight / 2, Math.min(scaledWidth, scaledHeight) / 2
    );

    // Apply window/level to gradient colors
    const normalizedLevel = (viewerState.windowLevel + 1024) / 4096; // Normalize to 0-1
    const normalizedWidth = viewerState.windowWidth / 4096;
    
    if (viewerState.invert) {
      gradient.addColorStop(0, `rgb(${255 - Math.floor(normalizedLevel * 255)}, ${255 - Math.floor(normalizedLevel * 255)}, ${255 - Math.floor(normalizedLevel * 255)})`);
      gradient.addColorStop(1, `rgb(${255 - Math.floor((normalizedLevel + normalizedWidth) * 255)}, ${255 - Math.floor((normalizedLevel + normalizedWidth) * 255)}, ${255 - Math.floor((normalizedLevel + normalizedWidth) * 255)})`);
    } else {
      gradient.addColorStop(0, `rgb(${Math.floor(normalizedLevel * 255)}, ${Math.floor(normalizedLevel * 255)}, ${Math.floor(normalizedLevel * 255)})`);
      gradient.addColorStop(1, `rgb(${Math.floor((normalizedLevel + normalizedWidth) * 255)}, ${Math.floor((normalizedLevel + normalizedWidth) * 255)}, ${Math.floor((normalizedLevel + normalizedWidth) * 255)})`);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, scaledWidth, scaledHeight);

    // Add mock anatomical pattern
    ctx.strokeStyle = viewerState.invert ? '#333333' : '#cccccc';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Draw some mock anatomical structures
    ctx.beginPath();
    ctx.ellipse(x + scaledWidth * 0.3, y + scaledHeight * 0.4, scaledWidth * 0.15, scaledHeight * 0.2, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.ellipse(x + scaledWidth * 0.7, y + scaledHeight * 0.4, scaledWidth * 0.15, scaledHeight * 0.2, 0, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.setLineDash([]);

    // Restore context
    ctx.restore();

    // Render overlays
    if (viewerState.overlays && showOverlays) {
      renderOverlays(ctx, canvas);
    }

    // Render crosshairs
    if (viewerState.crosshairs) {
      renderCrosshairs(ctx, canvas);
    }

    // Render grid
    if (viewerState.grid) {
      renderGrid(ctx, canvas);
    }

    // Render rulers
    if (viewerState.rulers) {
      renderRulers(ctx, canvas);
    }

  }, [currentImage, viewerState, showOverlays]);

  const renderOverlays = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!currentImage) return;

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';

    // Top left - Patient info
    const topLeftInfo = [
      `Patient: ${currentImage.studyId}`,
      `Series: ${currentSeries?.seriesNumber} - ${currentSeries?.seriesDescription}`,
      `Image: ${currentImage.instanceNumber}/${currentSeries?.imageCount}`
    ];

    topLeftInfo.forEach((text, index) => {
      ctx.fillText(text, 10, 20 + index * 15);
    });

    // Top right - Study info
    ctx.textAlign = 'right';
    const topRightInfo = [
      `${currentSeries?.modality}`,
      `${currentImage.metadata.rows}x${currentImage.metadata.columns}`,
      `Slice: ${currentImage.metadata.sliceLocation?.toFixed(1)}mm`
    ];

    topRightInfo.forEach((text, index) => {
      ctx.fillText(text, canvas.width - 10, 20 + index * 15);
    });

    // Bottom left - Technical info
    ctx.textAlign = 'left';
    const bottomLeftInfo = [
      `WL: ${viewerState.windowLevel} WW: ${viewerState.windowWidth}`,
      `Zoom: ${(viewerState.zoom * 100).toFixed(0)}%`,
      `Pixel Spacing: ${currentImage.metadata.pixelSpacing?.join('x') || 'N/A'}`
    ];

    bottomLeftInfo.forEach((text, index) => {
      ctx.fillText(text, 10, canvas.height - 60 + index * 15);
    });

    // Bottom right - Mouse position and pixel value
    ctx.textAlign = 'right';
    const bottomRightInfo = [
      `X: ${mousePosition.x.toFixed(0)} Y: ${mousePosition.y.toFixed(0)}`,
      pixelValue !== null ? `Value: ${pixelValue.toFixed(0)}` : '',
      `Frame: ${viewerState.currentFrame + 1}/${currentSeries?.imageCount || 1}`
    ].filter(Boolean);

    bottomRightInfo.forEach((text, index) => {
      ctx.fillText(text, canvas.width - 10, canvas.height - 60 + index * 15);
    });
  };

  const renderCrosshairs = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    ctx.setLineDash([]);
  };

  const renderGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 0.5;
    
    const gridSize = 50;
    
    // Vertical lines
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const renderRulers = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';

    const rulerSize = 20;
    const tickSize = 5;
    const majorTickInterval = 50;
    const minorTickInterval = 10;

    // Top ruler
    ctx.fillRect(0, 0, canvas.width, rulerSize);
    ctx.strokeStyle = '#000000';
    for (let x = 0; x < canvas.width; x += minorTickInterval) {
      const isMajor = x % majorTickInterval === 0;
      ctx.beginPath();
      ctx.moveTo(x, rulerSize);
      ctx.lineTo(x, rulerSize - (isMajor ? tickSize * 2 : tickSize));
      ctx.stroke();
      
      if (isMajor && x > 0) {
        ctx.fillStyle = '#000000';
        ctx.fillText(x.toString(), x, rulerSize - 8);
        ctx.fillStyle = '#ffffff';
      }
    }

    // Left ruler
    ctx.fillRect(0, 0, rulerSize, canvas.height);
    for (let y = 0; y < canvas.height; y += minorTickInterval) {
      const isMajor = y % majorTickInterval === 0;
      ctx.beginPath();
      ctx.moveTo(rulerSize, y);
      ctx.lineTo(rulerSize - (isMajor ? tickSize * 2 : tickSize), y);
      ctx.stroke();
      
      if (isMajor && y > 0) {
        ctx.save();
        ctx.translate(8, y);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#000000';
        ctx.fillText(y.toString(), 0, 0);
        ctx.restore();
      }
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setLastMousePosition({ x, y });
      setMousePosition({ x, y });
      
      // Mock pixel value calculation
      setPixelValue(Math.floor(Math.random() * 4096 - 1024));
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setMousePosition({ x, y });
      
      // Mock pixel value calculation
      setPixelValue(Math.floor(Math.random() * 4096 - 1024));

      if (isMouseDown) {
        const deltaX = x - lastMousePosition.x;
        const deltaY = y - lastMousePosition.y;

        switch (activeTool) {
          case 'pan':
            setViewerState(prev => ({
              ...prev,
              pan: {
                x: prev.pan.x + deltaX,
                y: prev.pan.y + deltaY
              }
            }));
            break;
          case 'zoom':
            const zoomFactor = 1 + deltaY * 0.01;
            setViewerState(prev => ({
              ...prev,
              zoom: Math.max(0.1, Math.min(10, prev.zoom * zoomFactor))
            }));
            break;
          case 'windowing':
            setViewerState(prev => ({
              ...prev,
              windowLevel: Math.max(-1024, Math.min(3071, prev.windowLevel + deltaX)),
              windowWidth: Math.max(1, Math.min(4096, prev.windowWidth + deltaY))
            }));
            break;
        }

        setLastMousePosition({ x, y });
      }
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    if (event.ctrlKey) {
      // Zoom with Ctrl+Wheel
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      setViewerState(prev => ({
        ...prev,
        zoom: Math.max(0.1, Math.min(10, prev.zoom * zoomFactor))
      }));
    } else {
      // Navigate frames with Wheel
      if (currentSeries && currentSeries.images.length > 1) {
        const direction = event.deltaY > 0 ? 1 : -1;
        const newFrame = Math.max(0, Math.min(currentSeries.images.length - 1, viewerState.currentFrame + direction));
        setViewerState(prev => ({ ...prev, currentFrame: newFrame }));
        setCurrentImage(currentSeries.images[newFrame]);
        onImageChange?.(currentSeries.images[newFrame].id);
      }
    }
  };

  const selectTool = (toolId: string) => {
    setActiveTool(toolId);
  };

  const updateViewerState = (updates: Partial<ViewerState>) => {
    setViewerState(prev => ({ ...prev, ...updates }));
  };

  const resetViewer = () => {
    setViewerState(prev => ({
      ...prev,
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      rotation: 0,
      windowLevel: currentImage?.metadata.windowCenter || 40,
      windowWidth: currentImage?.metadata.windowWidth || 400
    }));
  };

  const nextFrame = () => {
    if (currentSeries && currentSeries.images.length > 1) {
      const newFrame = (viewerState.currentFrame + 1) % currentSeries.images.length;
      setViewerState(prev => ({ ...prev, currentFrame: newFrame }));
      setCurrentImage(currentSeries.images[newFrame]);
      onImageChange?.(currentSeries.images[newFrame].id);
    }
  };

  const previousFrame = () => {
    if (currentSeries && currentSeries.images.length > 1) {
      const newFrame = viewerState.currentFrame === 0 ? currentSeries.images.length - 1 : viewerState.currentFrame - 1;
      setViewerState(prev => ({ ...prev, currentFrame: newFrame }));
      setCurrentImage(currentSeries.images[newFrame]);
      onImageChange?.(currentSeries.images[newFrame].id);
    }
  };

  const togglePlay = () => {
    setViewerState(prev => ({ 
      ...prev, 
      playing: !prev.playing,
      cineMode: !prev.playing || prev.cineMode
    }));
  };

  if (loading) {
    return (
      <div className={`medsight-viewer-glass rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medsight-primary mx-auto mb-4"></div>
          <p>Loading DICOM images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`medsight-viewer-glass rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <ExclamationTriangleIcon className="w-12 h-12 text-medsight-abnormal mx-auto mb-4" />
          <p className="text-medsight-abnormal">{error}</p>
          <button onClick={loadDICOMStudy} className="btn-medsight mt-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative medsight-viewer-glass rounded-xl overflow-hidden ${className}`}>
      {/* Controls Bar */}
      {showControls && (
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Tools */}
            <div className="flex items-center space-x-1 bg-black/50 rounded-lg p-1">
              {tools.slice(0, 4).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => selectTool(tool.id)}
                  className={`p-2 rounded transition-all ${
                    tool.active 
                      ? 'bg-medsight-primary text-white' 
                      : 'text-white hover:bg-white/20'
                  }`}
                  title={`${tool.name}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                >
                  <tool.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Layout */}
            <div className="flex items-center space-x-1 bg-black/50 rounded-lg p-1">
              <button 
                onClick={() => updateViewerState({ layout: 'single' })}
                className={`p-2 rounded ${viewerState.layout === 'single' ? 'bg-white/20' : ''}`}
              >
                <PhotoIconSolid className="w-4 h-4 text-white" />
              </button>
              <button 
                onClick={() => updateViewerState({ layout: 'dual' })}
                className={`p-2 rounded ${viewerState.layout === 'dual' ? 'bg-white/20' : ''}`}
              >
                <RectangleStackIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Playback Controls */}
            {currentSeries && currentSeries.images.length > 1 && (
              <div className="flex items-center space-x-1 bg-black/50 rounded-lg p-1">
                <button onClick={previousFrame} className="p-2 rounded hover:bg-white/20">
                  <BackwardIcon className="w-4 h-4 text-white" />
                </button>
                <button onClick={togglePlay} className="p-2 rounded hover:bg-white/20">
                  {viewerState.playing ? 
                    <PauseIconSolid className="w-4 h-4 text-white" /> : 
                    <PlayIconSolid className="w-4 h-4 text-white" />
                  }
                </button>
                <button onClick={nextFrame} className="p-2 rounded hover:bg-white/20">
                  <ForwardIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            {/* View Options */}
            <div className="flex items-center space-x-1 bg-black/50 rounded-lg p-1">
              <button 
                onClick={() => updateViewerState({ overlays: !viewerState.overlays })}
                className={`p-2 rounded ${viewerState.overlays ? 'bg-white/20' : ''}`}
                title="Toggle Overlays"
              >
                {viewerState.overlays ? 
                  <EyeIconSolid className="w-4 h-4 text-white" /> : 
                  <EyeSlashIcon className="w-4 h-4 text-white" />
                }
              </button>
              <button 
                onClick={() => updateViewerState({ crosshairs: !viewerState.crosshairs })}
                className={`p-2 rounded ${viewerState.crosshairs ? 'bg-white/20' : ''}`}
                title="Toggle Crosshairs"
              >
                <PlusIcon className="w-4 h-4 text-white" />
              </button>
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded ${showInfo ? 'bg-white/20' : ''}`}
                title="Image Information"
              >
                <InformationCircleIcon className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Settings */}
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
              title="Settings"
            >
              <CogIcon className="w-4 h-4 text-white" />
            </button>

            {/* Reset */}
            <button 
              onClick={resetViewer}
              className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
              title="Reset View"
            >
              <ArrowPathIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* DICOM Canvas */}
      <div ref={containerRef} className="w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ cursor: tools.find(t => t.id === activeTool)?.cursor || 'default' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
      </div>

      {/* Series Navigator */}
      {currentSeries && currentSeries.images.length > 1 && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-black/50 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <span className="text-white text-sm font-medium">
                {viewerState.currentFrame + 1} / {currentSeries.images.length}
              </span>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={currentSeries.images.length - 1}
                  value={viewerState.currentFrame}
                  onChange={(e) => {
                    const frame = parseInt(e.target.value);
                    setViewerState(prev => ({ ...prev, currentFrame: frame }));
                    setCurrentImage(currentSeries.images[frame]);
                    onImageChange?.(currentSeries.images[frame].id);
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <span className="text-white text-sm">
                {currentSeries.seriesDescription}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Image Information Panel */}
      {showInfo && currentImage && (
        <div className="absolute top-20 right-4 w-80 bg-black/80 rounded-lg p-4 text-white text-sm z-20">
          <h4 className="font-semibold mb-3">Image Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>SOP Instance UID:</span>
              <span className="font-mono text-xs">{currentImage.sopInstanceUID}</span>
            </div>
            <div className="flex justify-between">
              <span>Instance Number:</span>
              <span>{currentImage.instanceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Dimensions:</span>
              <span>{currentImage.metadata.rows} × {currentImage.metadata.columns}</span>
            </div>
            <div className="flex justify-between">
              <span>Pixel Spacing:</span>
              <span>{currentImage.metadata.pixelSpacing?.join(' × ') || 'N/A'} mm</span>
            </div>
            <div className="flex justify-between">
              <span>Slice Thickness:</span>
              <span>{currentImage.metadata.sliceThickness || 'N/A'} mm</span>
            </div>
            <div className="flex justify-between">
              <span>Slice Location:</span>
              <span>{currentImage.metadata.sliceLocation?.toFixed(2) || 'N/A'} mm</span>
            </div>
            <div className="flex justify-between">
              <span>Bits Allocated:</span>
              <span>{currentImage.metadata.bitsAllocated}</span>
            </div>
            <div className="flex justify-between">
              <span>Window Center:</span>
              <span>{viewerState.windowLevel}</span>
            </div>
            <div className="flex justify-between">
              <span>Window Width:</span>
              <span>{viewerState.windowWidth}</span>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">DICOM Viewer Settings</h3>
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
                      value={viewerState.windowLevel}
                      onChange={(e) => updateViewerState({ windowLevel: parseInt(e.target.value) })}
                      className="input-medsight"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Window Width</label>
                    <input
                      type="number"
                      value={viewerState.windowWidth}
                      onChange={(e) => updateViewerState({ windowWidth: parseInt(e.target.value) })}
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
                      checked={viewerState.overlays}
                      onChange={(e) => updateViewerState({ overlays: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Show Overlays</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewerState.crosshairs}
                      onChange={(e) => updateViewerState({ crosshairs: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Show Crosshairs</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewerState.grid}
                      onChange={(e) => updateViewerState({ grid: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Show Grid</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewerState.rulers}
                      onChange={(e) => updateViewerState({ rulers: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Show Rulers</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewerState.invert}
                      onChange={(e) => updateViewerState({ invert: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Invert Colors</span>
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
                      checked={viewerState.cineMode}
                      onChange={(e) => updateViewerState({ cineMode: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Enable Cine Mode</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Cine Speed (FPS): {viewerState.cineSpeed}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={viewerState.cineSpeed}
                      onChange={(e) => updateViewerState({ cineSpeed: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Interpolation */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Image Interpolation</h4>
                <select 
                  value={viewerState.interpolation}
                  onChange={(e) => updateViewerState({ interpolation: e.target.value as any })}
                  className="input-medsight"
                >
                  <option value="nearest">Nearest Neighbor</option>
                  <option value="linear">Linear</option>
                  <option value="cubic">Cubic</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 