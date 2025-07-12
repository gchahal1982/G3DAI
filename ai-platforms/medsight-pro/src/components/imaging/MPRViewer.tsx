'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Squares2X2Icon,
  Square3Stack3DIcon,
  ArrowsPointingOutIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
  CubeIcon,
  BeakerIcon,
  HeartIcon,
  CpuChipIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  LockClosedIcon,
  LockOpenIcon,
  LinkIcon,
  MapPinIcon,
  CrosshairIcon,
  ViewfinderCircleIcon
} from '@heroicons/react/24/outline';
import { 
  Squares2X2Icon as Squares2X2IconSolid,
  EyeIcon as EyeIconSolid,
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid,
  LockClosedIcon as LockClosedIconSolid
} from '@heroicons/react/24/solid';
import React from 'react';

interface MPRSlice {
  id: string;
  seriesId: string;
  orientation: 'axial' | 'coronal' | 'sagittal';
  sliceIndex: number;
  slicePosition: number; // mm
  imageData: ArrayBuffer | null;
  metadata: {
    rows: number;
    columns: number;
    pixelSpacing: [number, number];
    sliceThickness: number;
    imagePosition: [number, number, number];
    imageOrientation: [number, number, number, number, number, number];
    windowCenter: number;
    windowWidth: number;
    rescaleIntercept: number;
    rescaleSlope: number;
  };
  processed: boolean;
  loadTime: number;
}

interface MPRSeries {
  id: string;
  studyId: string;
  originalSeriesId: string;
  modality: string;
  seriesDescription: string;
  axialSlices: MPRSlice[];
  coronalSlices: MPRSlice[];
  sagittalSlices: MPRSlice[];
  volumeDimensions: [number, number, number]; // width, height, depth
  voxelSpacing: [number, number, number]; // mm
  loaded: boolean;
  loading: boolean;
  error?: string;
}

interface MPRViewSettings {
  layout: 'quad' | 'axial' | 'coronal' | 'sagittal' | 'custom';
  synchronized: boolean;
  crosshairs: boolean;
  referenceLines: boolean;
  orientationLabels: boolean;
  scaleBar: boolean;
  windowLevel: number;
  windowWidth: number;
  zoom: number;
  pan: { x: number; y: number };
  interpolation: 'nearest' | 'linear' | 'cubic';
  overlays: boolean;
  measurements: boolean;
  annotations: boolean;
  colorInvert: boolean;
  autoCenter: boolean;
  linkZoom: boolean;
  linkPan: boolean;
  linkWindowing: boolean;
}

interface MPRCrosshair {
  position: [number, number, number]; // x, y, z in world coordinates
  visible: boolean;
  color: string;
  thickness: number;
}

interface ViewportInfo {
  orientation: 'axial' | 'coronal' | 'sagittal';
  sliceIndex: number;
  slicePosition: number;
  zoom: number;
  pan: { x: number; y: number };
  windowLevel: number;
  windowWidth: number;
  cursorPosition?: { x: number; y: number };
  pixelValue?: number;
  anatomicalPosition?: [number, number, number];
}

interface MPRViewerProps {
  seriesData: MPRSeries | null;
  onSliceChange?: (orientation: string, sliceIndex: number) => void;
  onCrosshairMove?: (position: [number, number, number]) => void;
  onMeasurement?: (measurement: any) => void;
  onAnnotation?: (annotation: any) => void;
  className?: string;
  readOnly?: boolean;
  showControls?: boolean;
  enableSynchronization?: boolean;
  enableMeasurements?: boolean;
  enableAnnotations?: boolean;
  initialLayout?: 'quad' | 'axial' | 'coronal' | 'sagittal';
}

export default function MPRViewer({
  seriesData,
  onSliceChange,
  onCrosshairMove,
  onMeasurement,
  onAnnotation,
  className = '',
  readOnly = false,
  showControls = true,
  enableSynchronization = true,
  enableMeasurements = true,
  enableAnnotations = true,
  initialLayout = 'quad'
}: MPRViewerProps) {
  const axialCanvasRef = useRef<HTMLCanvasElement>(null);
  const coronalCanvasRef = useRef<HTMLCanvasElement>(null);
  const sagittalCanvasRef = useRef<HTMLCanvasElement>(null);
  const threeDCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewSettings, setViewSettings] = useState<MPRViewSettings>({
    layout: initialLayout,
    synchronized: enableSynchronization,
    crosshairs: true,
    referenceLines: true,
    orientationLabels: true,
    scaleBar: true,
    windowLevel: 40,
    windowWidth: 400,
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    interpolation: 'linear',
    overlays: true,
    measurements: enableMeasurements,
    annotations: enableAnnotations,
    colorInvert: false,
    autoCenter: true,
    linkZoom: true,
    linkPan: true,
    linkWindowing: true
  });

  const [viewportInfos, setViewportInfos] = useState<Record<string, ViewportInfo>>({
    axial: {
      orientation: 'axial',
      sliceIndex: 0,
      slicePosition: 0,
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      windowLevel: 40,
      windowWidth: 400
    },
    coronal: {
      orientation: 'coronal',
      sliceIndex: 0,
      slicePosition: 0,
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      windowLevel: 40,
      windowWidth: 400
    },
    sagittal: {
      orientation: 'sagittal',
      sliceIndex: 0,
      slicePosition: 0,
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      windowLevel: 40,
      windowWidth: 400
    }
  });

  const [crosshair, setCrosshair] = useState<MPRCrosshair>({
    position: [0, 0, 0],
    visible: true,
    color: '#00ff00',
    thickness: 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [activeTool, setActiveTool] = useState<string>('crosshair');
  const [activeViewport, setActiveViewport] = useState<string>('axial');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

  const layouts = [
    { 
      id: 'quad', 
      name: 'Quad View', 
      icon: Squares2X2IconSolid, 
      description: 'Four-panel view with all orientations' 
    },
    { 
      id: 'axial', 
      name: 'Axial Only', 
      icon: PhotoIcon, 
      description: 'Axial view only' 
    },
    { 
      id: 'coronal', 
      name: 'Coronal Only', 
      icon: PhotoIcon, 
      description: 'Coronal view only' 
    },
    { 
      id: 'sagittal', 
      name: 'Sagittal Only', 
      icon: PhotoIcon, 
      description: 'Sagittal view only' 
    }
  ];

  const tools = [
    {
      id: 'crosshair',
      name: 'Crosshair',
      icon: ViewfinderCircleIcon,
      description: 'Move crosshair cursor',
      cursor: 'crosshair'
    },
    {
      id: 'pan',
      name: 'Pan',
      icon: ArrowsPointingOutIcon,
      description: 'Pan the image',
      cursor: 'grab'
    },
    {
      id: 'zoom',
      name: 'Zoom',
      icon: MagnifyingGlassIcon,
      description: 'Zoom in/out',
      cursor: 'zoom-in'
    },
    {
      id: 'windowing',
      name: 'Window/Level',
      icon: AdjustmentsHorizontalIcon,
      description: 'Adjust window/level',
      cursor: 'ew-resize'
    },
    {
      id: 'length',
      name: 'Length',
      icon: ChartBarIcon,
      description: 'Measure length',
      cursor: 'crosshair'
    },
    {
      id: 'angle',
      name: 'Angle',
      icon: ChartBarIcon,
      description: 'Measure angle',
      cursor: 'crosshair'
    }
  ];

  const orientationPresets = [
    {
      id: 'head_feet',
      name: 'Head-Feet',
      icon: AcademicCapIcon,
      description: 'Standard head-to-feet orientation'
    },
    {
      id: 'anterior_posterior',
      name: 'Anterior-Posterior',
      icon: HeartIcon,
      description: 'Front-to-back orientation'
    },
    {
      id: 'left_right',
      name: 'Left-Right',
      icon: CpuChipIcon,
      description: 'Left-to-right orientation'
    },
    {
      id: 'radiological',
      name: 'Radiological',
      icon: ShieldCheckIcon,
      description: 'Radiological convention'
    },
    {
      id: 'neurological',
      name: 'Neurological',
      icon: CpuChipIcon,
      description: 'Neurological convention'
    }
  ];

  useEffect(() => {
    if (seriesData) {
      initializeMPRViewer();
    }
  }, [seriesData]);

  useEffect(() => {
    renderAllViews();
  }, [viewSettings, viewportInfos, crosshair]);

  const initializeMPRViewer = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!seriesData) {
        throw new Error('No MPR series data provided');
      }

      // Initialize viewport positions to center slices
      const axialCenter = Math.floor(seriesData.axialSlices.length / 2);
      const coronalCenter = Math.floor(seriesData.coronalSlices.length / 2);
      const sagittalCenter = Math.floor(seriesData.sagittalSlices.length / 2);

      setViewportInfos({
        axial: {
          orientation: 'axial',
          sliceIndex: axialCenter,
          slicePosition: seriesData.axialSlices[axialCenter]?.slicePosition || 0,
          zoom: 1.0,
          pan: { x: 0, y: 0 },
          windowLevel: seriesData.axialSlices[0]?.metadata.windowCenter || 40,
          windowWidth: seriesData.axialSlices[0]?.metadata.windowWidth || 400
        },
        coronal: {
          orientation: 'coronal',
          sliceIndex: coronalCenter,
          slicePosition: seriesData.coronalSlices[coronalCenter]?.slicePosition || 0,
          zoom: 1.0,
          pan: { x: 0, y: 0 },
          windowLevel: seriesData.coronalSlices[0]?.metadata.windowCenter || 40,
          windowWidth: seriesData.coronalSlices[0]?.metadata.windowWidth || 400
        },
        sagittal: {
          orientation: 'sagittal',
          sliceIndex: sagittalCenter,
          slicePosition: seriesData.sagittalSlices[sagittalCenter]?.slicePosition || 0,
          zoom: 1.0,
          pan: { x: 0, y: 0 },
          windowLevel: seriesData.sagittalSlices[0]?.metadata.windowCenter || 40,
          windowWidth: seriesData.sagittalSlices[0]?.metadata.windowWidth || 400
        }
      });

      // Set initial crosshair position to volume center
      const [width, height, depth] = seriesData.volumeDimensions;
      setCrosshair(prev => ({
        ...prev,
        position: [width / 2, height / 2, depth / 2]
      }));

      // Set initial window/level
      const initialWL = seriesData.axialSlices[0]?.metadata.windowCenter || 40;
      const initialWW = seriesData.axialSlices[0]?.metadata.windowWidth || 400;
      setViewSettings(prev => ({
        ...prev,
        windowLevel: initialWL,
        windowWidth: initialWW
      }));

      setLoading(false);
    } catch (error) {
      console.error('Error initializing MPR viewer:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize MPR viewer');
      setLoading(false);
    }
  };

  const renderAllViews = useCallback(() => {
    if (!seriesData) return;

    renderView('axial', axialCanvasRef.current);
    renderView('coronal', coronalCanvasRef.current);
    renderView('sagittal', sagittalCanvasRef.current);
    
    if (viewSettings.layout === 'quad') {
      render3DView(threeDCanvasRef.current);
    }
  }, [seriesData, viewSettings, viewportInfos, crosshair]);

  const renderView = (orientation: 'axial' | 'coronal' | 'sagittal', canvas: HTMLCanvasElement | null) => {
    if (!canvas || !seriesData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to container
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const viewport = viewportInfos[orientation];
    if (!viewport) return;

    // Get current slice data
    let slices: MPRSlice[];
    switch (orientation) {
      case 'axial':
        slices = seriesData.axialSlices;
        break;
      case 'coronal':
        slices = seriesData.coronalSlices;
        break;
      case 'sagittal':
        slices = seriesData.sagittalSlices;
        break;
      default:
        return;
    }

    if (slices.length === 0 || viewport.sliceIndex >= slices.length) return;

    const currentSlice = slices[viewport.sliceIndex];
    
    // Mock image rendering with gradient pattern
    const imageWidth = currentSlice.metadata.columns;
    const imageHeight = currentSlice.metadata.rows;
    
    // Calculate display dimensions with zoom and pan
    const scaledWidth = imageWidth * viewport.zoom;
    const scaledHeight = imageHeight * viewport.zoom;
    const x = (canvas.width - scaledWidth) / 2 + viewport.pan.x;
    const y = (canvas.height - scaledHeight) / 2 + viewport.pan.y;

    // Apply window/level to create mock image
    const normalizedLevel = (viewport.windowLevel + 1024) / 4096;
    const normalizedWidth = viewport.windowWidth / 4096;
    
    // Create anatomical pattern based on orientation
    let gradient;
    const centerX = x + scaledWidth / 2;
    const centerY = y + scaledHeight / 2;
    
    switch (orientation) {
      case 'axial':
        // Circular pattern for axial slices
        gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(scaledWidth, scaledHeight) / 3);
        break;
      case 'coronal':
        // Vertical gradient for coronal slices
        gradient = ctx.createLinearGradient(x, y, x, y + scaledHeight);
        break;
      case 'sagittal':
        // Horizontal gradient for sagittal slices
        gradient = ctx.createLinearGradient(x, y, x + scaledWidth, y);
        break;
    }

    if (viewSettings.colorInvert) {
      gradient.addColorStop(0, `rgb(${255 - Math.floor(normalizedLevel * 255)}, ${255 - Math.floor(normalizedLevel * 255)}, ${255 - Math.floor(normalizedLevel * 255)})`);
      gradient.addColorStop(1, `rgb(${255 - Math.floor((normalizedLevel + normalizedWidth) * 255)}, ${255 - Math.floor((normalizedLevel + normalizedWidth) * 255)}, ${255 - Math.floor((normalizedLevel + normalizedWidth) * 255)})`);
    } else {
      gradient.addColorStop(0, `rgb(${Math.floor(normalizedLevel * 255)}, ${Math.floor(normalizedLevel * 255)}, ${Math.floor(normalizedLevel * 255)})`);
      gradient.addColorStop(1, `rgb(${Math.floor((normalizedLevel + normalizedWidth) * 255)}, ${Math.floor((normalizedLevel + normalizedWidth) * 255)}, ${Math.floor((normalizedLevel + normalizedWidth) * 255)})`);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, scaledWidth, scaledHeight);

    // Add mock anatomical structures
    ctx.strokeStyle = viewSettings.colorInvert ? '#333333' : '#cccccc';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    // Draw orientation-specific structures
    switch (orientation) {
      case 'axial':
        // Draw some ellipses for organs
        for (let i = 0; i < 2; i++) {
          ctx.beginPath();
          const orgX = centerX + (Math.random() - 0.5) * scaledWidth * 0.5;
          const orgY = centerY + (Math.random() - 0.5) * scaledHeight * 0.5;
          ctx.ellipse(orgX, orgY, scaledWidth * 0.1, scaledHeight * 0.15, Math.random() * Math.PI, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;
      case 'coronal':
        // Draw spine and ribs
        ctx.beginPath();
        ctx.moveTo(centerX, y);
        ctx.lineTo(centerX, y + scaledHeight);
        ctx.stroke();
        
        for (let i = 0; i < 8; i++) {
          const ribY = y + (i + 2) * scaledHeight / 12;
          ctx.beginPath();
          ctx.arc(centerX, ribY, scaledWidth * 0.2, 0, Math.PI);
          ctx.stroke();
        }
        break;
      case 'sagittal':
        // Draw vertebrae
        for (let i = 0; i < 12; i++) {
          const vertY = y + (i + 1) * scaledHeight / 14;
          ctx.beginPath();
          ctx.rect(centerX - scaledWidth * 0.05, vertY - scaledHeight * 0.02, scaledWidth * 0.1, scaledHeight * 0.04);
          ctx.stroke();
        }
        break;
    }

    ctx.setLineDash([]);

    // Render crosshairs
    if (viewSettings.crosshairs && crosshair.visible) {
      renderCrosshairs(ctx, canvas, orientation);
    }

    // Render reference lines
    if (viewSettings.referenceLines) {
      renderReferenceLines(ctx, canvas, orientation);
    }

    // Render overlays
    if (viewSettings.overlays) {
      renderOverlays(ctx, canvas, orientation, currentSlice);
    }

    // Render orientation labels
    if (viewSettings.orientationLabels) {
      renderOrientationLabels(ctx, canvas, orientation);
    }

    // Render scale bar
    if (viewSettings.scaleBar) {
      renderScaleBar(ctx, canvas, currentSlice);
    }
  };

  const render3DView = (canvas: HTMLCanvasElement | null) => {
    if (!canvas || !seriesData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to container
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    // Clear canvas
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw 3D volume outline
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(canvas.width, canvas.height) * 0.3;

    // Draw 3D cube wireframe
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Front face
    ctx.strokeRect(centerX - size/2, centerY - size/2, size, size);
    
    // Back face (offset for 3D effect)
    const offset = size * 0.2;
    ctx.strokeRect(centerX - size/2 + offset, centerY - size/2 - offset, size, size);
    
    // Connecting lines
    ctx.beginPath();
    ctx.moveTo(centerX - size/2, centerY - size/2);
    ctx.lineTo(centerX - size/2 + offset, centerY - size/2 - offset);
    ctx.moveTo(centerX + size/2, centerY - size/2);
    ctx.lineTo(centerX + size/2 + offset, centerY - size/2 - offset);
    ctx.moveTo(centerX - size/2, centerY + size/2);
    ctx.lineTo(centerX - size/2 + offset, centerY + size/2 - offset);
    ctx.moveTo(centerX + size/2, centerY + size/2);
    ctx.lineTo(centerX + size/2 + offset, centerY + size/2 - offset);
    ctx.stroke();

    // Draw crosshair planes
    if (crosshair.visible) {
      ctx.strokeStyle = crosshair.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      // Axial plane (horizontal)
      const axialY = centerY + (crosshair.position[2] / seriesData.volumeDimensions[2] - 0.5) * size;
      ctx.beginPath();
      ctx.moveTo(centerX - size/2, axialY);
      ctx.lineTo(centerX + size/2, axialY);
      ctx.stroke();
      
      // Coronal plane (vertical)
      const coronalX = centerX + (crosshair.position[1] / seriesData.volumeDimensions[1] - 0.5) * size;
      ctx.beginPath();
      ctx.moveTo(coronalX, centerY - size/2);
      ctx.lineTo(coronalX, centerY + size/2);
      ctx.stroke();
      
      // Sagittal plane (diagonal for perspective)
      const sagittalX = centerX + (crosshair.position[0] / seriesData.volumeDimensions[0] - 0.5) * size;
      ctx.beginPath();
      ctx.moveTo(sagittalX, centerY - size/2);
      ctx.lineTo(sagittalX + offset, centerY - size/2 - offset);
      ctx.moveTo(sagittalX, centerY + size/2);
      ctx.lineTo(sagittalX + offset, centerY + size/2 - offset);
      ctx.stroke();
      
      ctx.setLineDash([]);
    }

    // Draw labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('3D Volume', centerX, canvas.height - 10);
  };

  const renderCrosshairs = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, orientation: string) => {
    if (!seriesData) return;

    ctx.strokeStyle = crosshair.color;
    ctx.lineWidth = crosshair.thickness;
    ctx.setLineDash([]);

    const viewport = viewportInfos[orientation];
    if (!viewport) return;

    // Calculate crosshair position on this view
    let crossX = canvas.width / 2;
    let crossY = canvas.height / 2;

    // Project 3D crosshair position to 2D view
    switch (orientation) {
      case 'axial':
        crossX = (crosshair.position[0] / seriesData.volumeDimensions[0]) * canvas.width;
        crossY = (crosshair.position[1] / seriesData.volumeDimensions[1]) * canvas.height;
        break;
      case 'coronal':
        crossX = (crosshair.position[0] / seriesData.volumeDimensions[0]) * canvas.width;
        crossY = (crosshair.position[2] / seriesData.volumeDimensions[2]) * canvas.height;
        break;
      case 'sagittal':
        crossX = (crosshair.position[1] / seriesData.volumeDimensions[1]) * canvas.width;
        crossY = (crosshair.position[2] / seriesData.volumeDimensions[2]) * canvas.height;
        break;
    }

    // Draw crosshair lines
    ctx.beginPath();
    ctx.moveTo(0, crossY);
    ctx.lineTo(canvas.width, crossY);
    ctx.moveTo(crossX, 0);
    ctx.lineTo(crossX, canvas.height);
    ctx.stroke();
  };

  const renderReferenceLines = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, orientation: string) => {
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 5]);

    // Draw reference lines for other plane positions
    const otherViewports = Object.entries(viewportInfos).filter(([key]) => key !== orientation);
    
    otherViewports.forEach(([key, viewport], index) => {
      const color = index === 0 ? '#ff0000' : '#0000ff';
      ctx.strokeStyle = color;
      
      let linePos = 0;
      
      // Calculate where the other plane intersects this view
      switch (orientation) {
        case 'axial':
          if (key === 'coronal') {
            linePos = (viewport.slicePosition / 100) * canvas.height; // Mock calculation
          } else if (key === 'sagittal') {
            linePos = (viewport.slicePosition / 100) * canvas.width;
          }
          break;
        // Add other cases as needed
      }
      
      // Draw the reference line
      if (key === 'coronal' && orientation === 'axial') {
        ctx.beginPath();
        ctx.moveTo(0, linePos);
        ctx.lineTo(canvas.width, linePos);
        ctx.stroke();
      } else if (key === 'sagittal' && orientation === 'axial') {
        ctx.beginPath();
        ctx.moveTo(linePos, 0);
        ctx.lineTo(linePos, canvas.height);
        ctx.stroke();
      }
    });

    ctx.setLineDash([]);
  };

  const renderOverlays = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, orientation: string, slice: MPRSlice) => {
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';

    // Top left - Orientation and slice info
    const topLeftInfo = [
      `${orientation.toUpperCase()}`,
      `Slice: ${slice.sliceIndex + 1}/${getSliceCount(orientation)}`,
      `Position: ${slice.slicePosition.toFixed(1)}mm`
    ];

    topLeftInfo.forEach((text, index) => {
      ctx.fillText(text, 10, 20 + index * 15);
    });

    // Top right - Technical info
    ctx.textAlign = 'right';
    const viewport = viewportInfos[orientation];
    if (viewport) {
      const topRightInfo = [
        `WL: ${viewport.windowLevel} WW: ${viewport.windowWidth}`,
        `Zoom: ${(viewport.zoom * 100).toFixed(0)}%`,
        `${slice.metadata.rows}×${slice.metadata.columns}`
      ];

      topRightInfo.forEach((text, index) => {
        ctx.fillText(text, canvas.width - 10, 20 + index * 15);
      });
    }

    // Bottom left - Pixel spacing
    ctx.textAlign = 'left';
    const bottomLeftInfo = [
      `Pixel: ${slice.metadata.pixelSpacing.map(p => p.toFixed(2)).join('×')}mm`,
      `Thickness: ${slice.metadata.sliceThickness.toFixed(1)}mm`
    ];

    bottomLeftInfo.forEach((text, index) => {
      ctx.fillText(text, 10, canvas.height - 30 + index * 15);
    });

    // Bottom right - Cursor info
    if (viewport?.cursorPosition && viewport?.pixelValue !== undefined) {
      ctx.textAlign = 'right';
      const bottomRightInfo = [
        `X: ${viewport.cursorPosition.x.toFixed(0)} Y: ${viewport.cursorPosition.y.toFixed(0)}`,
        `Value: ${viewport.pixelValue.toFixed(0)}`
      ];

      bottomRightInfo.forEach((text, index) => {
        ctx.fillText(text, canvas.width - 10, canvas.height - 30 + index * 15);
      });
    }
  };

  const renderOrientationLabels = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, orientation: string) => {
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';

    const labels = getOrientationLabels(orientation);
    
    // Top
    ctx.fillText(labels.top, canvas.width / 2, 20);
    // Bottom
    ctx.fillText(labels.bottom, canvas.width / 2, canvas.height - 10);
    // Left
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(labels.left, 0, 0);
    ctx.restore();
    // Right
    ctx.save();
    ctx.translate(canvas.width - 15, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(labels.right, 0, 0);
    ctx.restore();
  };

  const renderScaleBar = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, slice: MPRSlice) => {
    const pixelSpacing = slice.metadata.pixelSpacing[0]; // Assume square pixels
    const scaleLength = 50; // pixels
    const realLength = scaleLength * pixelSpacing; // mm

    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.font = '12px Arial';

    const x = canvas.width - 80;
    const y = canvas.height - 30;

    // Draw scale bar
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + scaleLength, y);
    ctx.moveTo(x, y - 5);
    ctx.lineTo(x, y + 5);
    ctx.moveTo(x + scaleLength, y - 5);
    ctx.lineTo(x + scaleLength, y + 5);
    ctx.stroke();

    // Draw label
    ctx.textAlign = 'center';
    ctx.fillText(`${realLength.toFixed(1)}mm`, x + scaleLength / 2, y - 10);
  };

  const getSliceCount = (orientation: string): number => {
    if (!seriesData) return 0;
    
    switch (orientation) {
      case 'axial':
        return seriesData.axialSlices.length;
      case 'coronal':
        return seriesData.coronalSlices.length;
      case 'sagittal':
        return seriesData.sagittalSlices.length;
      default:
        return 0;
    }
  };

  const getOrientationLabels = (orientation: string) => {
    // Standard anatomical orientation labels
    switch (orientation) {
      case 'axial':
        return {
          top: 'A', // Anterior
          bottom: 'P', // Posterior
          left: 'R', // Right (radiological convention)
          right: 'L' // Left
        };
      case 'coronal':
        return {
          top: 'S', // Superior
          bottom: 'I', // Inferior
          left: 'R', // Right
          right: 'L' // Left
        };
      case 'sagittal':
        return {
          top: 'S', // Superior
          bottom: 'I', // Inferior
          left: 'A', // Anterior
          right: 'P' // Posterior
        };
      default:
        return { top: '', bottom: '', left: '', right: '' };
    }
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>, orientation: string) => {
    setIsMouseDown(true);
    setActiveViewport(orientation);
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setLastMousePosition({ x, y });

    // Update cursor position and pixel value
    updateCursorInfo(x, y, orientation);

    if (activeTool === 'crosshair') {
      updateCrosshairPosition(x, y, orientation);
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>, orientation: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Always update cursor info
    updateCursorInfo(x, y, orientation);

    if (isMouseDown && activeViewport === orientation) {
      const deltaX = x - lastMousePosition.x;
      const deltaY = y - lastMousePosition.y;

      switch (activeTool) {
        case 'crosshair':
          updateCrosshairPosition(x, y, orientation);
          break;
        case 'pan':
          updateViewportPan(orientation, deltaX, deltaY);
          break;
        case 'zoom':
          updateViewportZoom(orientation, deltaY);
          break;
        case 'windowing':
          updateViewportWindowing(orientation, deltaX, deltaY);
          break;
      }

      setLastMousePosition({ x, y });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleCanvasWheel = (event: React.WheelEvent<HTMLCanvasElement>, orientation: string) => {
    event.preventDefault();
    
    if (event.ctrlKey) {
      // Zoom with Ctrl+Wheel
      const zoomDelta = event.deltaY > 0 ? -0.1 : 0.1;
      updateViewportZoom(orientation, zoomDelta * 100);
    } else {
      // Navigate slices with Wheel
      const direction = event.deltaY > 0 ? 1 : -1;
      navigateSlice(orientation, direction);
    }
  };

  const updateCursorInfo = (x: number, y: number, orientation: string) => {
    // Mock pixel value calculation
    const pixelValue = Math.floor(Math.random() * 4096 - 1024);
    
    setViewportInfos(prev => ({
      ...prev,
      [orientation]: {
        ...prev[orientation],
        cursorPosition: { x, y },
        pixelValue
      }
    }));
  };

  const updateCrosshairPosition = (x: number, y: number, orientation: string) => {
    if (!seriesData) return;

    const canvas = getCanvasForOrientation(orientation);
    if (!canvas) return;

    // Convert canvas coordinates to volume coordinates
    const volumeX = (x / canvas.width) * seriesData.volumeDimensions[0];
    const volumeY = (y / canvas.height) * seriesData.volumeDimensions[1];
    const volumeZ = viewportInfos[orientation].sliceIndex;

    let newPosition: [number, number, number];
    
    switch (orientation) {
      case 'axial':
        newPosition = [volumeX, volumeY, volumeZ];
        break;
      case 'coronal':
        newPosition = [volumeX, volumeZ, volumeY];
        break;
      case 'sagittal':
        newPosition = [volumeZ, volumeX, volumeY];
        break;
      default:
        return;
    }

    setCrosshair(prev => ({ ...prev, position: newPosition }));
    onCrosshairMove?.(newPosition);

    // Update corresponding slice positions if synchronized
    if (viewSettings.synchronized) {
      synchronizeCrosshair(newPosition, orientation);
    }
  };

  const synchronizeCrosshair = (position: [number, number, number], sourceOrientation: string) => {
    if (!seriesData) return;

    const [x, y, z] = position;
    
    // Calculate corresponding slice indices for other orientations
    const updates: Partial<Record<string, Partial<ViewportInfo>>> = {};
    
    Object.keys(viewportInfos).forEach(orientation => {
      if (orientation === sourceOrientation) return;
      
      let newSliceIndex = 0;
      
      switch (orientation) {
        case 'axial':
          newSliceIndex = Math.floor(z);
          break;
        case 'coronal':
          newSliceIndex = Math.floor(y);
          break;
        case 'sagittal':
          newSliceIndex = Math.floor(x);
          break;
      }
      
      const maxSlices = getSliceCount(orientation);
      newSliceIndex = Math.max(0, Math.min(maxSlices - 1, newSliceIndex));
      
      updates[orientation] = {
        sliceIndex: newSliceIndex,
        slicePosition: getSlicePosition(orientation, newSliceIndex)
      };
    });

    setViewportInfos(prev => {
      const newState = { ...prev };
      Object.entries(updates).forEach(([orientation, update]) => {
        newState[orientation] = { ...newState[orientation], ...update };
      });
      return newState;
    });
  };

  const getCanvasForOrientation = (orientation: string): HTMLCanvasElement | null => {
    switch (orientation) {
      case 'axial':
        return axialCanvasRef.current;
      case 'coronal':
        return coronalCanvasRef.current;
      case 'sagittal':
        return sagittalCanvasRef.current;
      default:
        return null;
    }
  };

  const getSlicePosition = (orientation: string, sliceIndex: number): number => {
    if (!seriesData) return 0;
    
    let slices: MPRSlice[];
    switch (orientation) {
      case 'axial':
        slices = seriesData.axialSlices;
        break;
      case 'coronal':
        slices = seriesData.coronalSlices;
        break;
      case 'sagittal':
        slices = seriesData.sagittalSlices;
        break;
      default:
        return 0;
    }
    
    return slices[sliceIndex]?.slicePosition || 0;
  };

  const updateViewportPan = (orientation: string, deltaX: number, deltaY: number) => {
    if (viewSettings.linkPan && viewSettings.synchronized) {
      // Update all viewports
      setViewportInfos(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          newState[key] = {
            ...newState[key],
            pan: {
              x: newState[key].pan.x + deltaX,
              y: newState[key].pan.y + deltaY
            }
          };
        });
        return newState;
      });
    } else {
      // Update only active viewport
      setViewportInfos(prev => ({
        ...prev,
        [orientation]: {
          ...prev[orientation],
          pan: {
            x: prev[orientation].pan.x + deltaX,
            y: prev[orientation].pan.y + deltaY
          }
        }
      }));
    }
  };

  const updateViewportZoom = (orientation: string, deltaY: number) => {
    const zoomFactor = 1 + deltaY * 0.001;
    
    if (viewSettings.linkZoom && viewSettings.synchronized) {
      // Update all viewports
      setViewportInfos(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          newState[key] = {
            ...newState[key],
            zoom: Math.max(0.1, Math.min(10, newState[key].zoom * zoomFactor))
          };
        });
        return newState;
      });
    } else {
      // Update only active viewport
      setViewportInfos(prev => ({
        ...prev,
        [orientation]: {
          ...prev[orientation],
          zoom: Math.max(0.1, Math.min(10, prev[orientation].zoom * zoomFactor))
        }
      }));
    }
  };

  const updateViewportWindowing = (orientation: string, deltaX: number, deltaY: number) => {
    const levelDelta = deltaX * 2;
    const widthDelta = deltaY * 2;
    
    if (viewSettings.linkWindowing && viewSettings.synchronized) {
      // Update all viewports
      setViewportInfos(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          newState[key] = {
            ...newState[key],
            windowLevel: Math.max(-1024, Math.min(3071, newState[key].windowLevel + levelDelta)),
            windowWidth: Math.max(1, Math.min(4096, newState[key].windowWidth + widthDelta))
          };
        });
        return newState;
      });
    } else {
      // Update only active viewport
      setViewportInfos(prev => ({
        ...prev,
        [orientation]: {
          ...prev[orientation],
          windowLevel: Math.max(-1024, Math.min(3071, prev[orientation].windowLevel + levelDelta)),
          windowWidth: Math.max(1, Math.min(4096, prev[orientation].windowWidth + widthDelta))
        }
      }));
    }
  };

  const navigateSlice = (orientation: string, direction: number) => {
    const maxSlices = getSliceCount(orientation);
    if (maxSlices === 0) return;

    setViewportInfos(prev => {
      const currentIndex = prev[orientation].sliceIndex;
      const newIndex = Math.max(0, Math.min(maxSlices - 1, currentIndex + direction));
      
      if (newIndex !== currentIndex) {
        onSliceChange?.(orientation, newIndex);
        
        return {
          ...prev,
          [orientation]: {
            ...prev[orientation],
            sliceIndex: newIndex,
            slicePosition: getSlicePosition(orientation, newIndex)
          }
        };
      }
      
      return prev;
    });
  };

  const updateViewSettings = (updates: Partial<MPRViewSettings>) => {
    setViewSettings(prev => ({ ...prev, ...updates }));
  };

  const resetView = (orientation?: string) => {
    if (orientation) {
      setViewportInfos(prev => ({
        ...prev,
        [orientation]: {
          ...prev[orientation],
          zoom: 1.0,
          pan: { x: 0, y: 0 }
        }
      }));
    } else {
      // Reset all views
      setViewportInfos(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          newState[key] = {
            ...newState[key],
            zoom: 1.0,
            pan: { x: 0, y: 0 }
          };
        });
        return newState;
      });
    }
  };

  const exportView = (orientation?: string) => {
    const canvas = orientation ? getCanvasForOrientation(orientation) : null;
    
    if (canvas) {
      const link = document.createElement('a');
      link.download = `mpr_${orientation}_${seriesData?.id || 'export'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (loading) {
    return (
      <div className={`medsight-viewer-glass rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medsight-primary mx-auto mb-4"></div>
          <p>Initializing MPR viewer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`medsight-viewer-glass rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <ExclamationTriangleIcon className="w-12 h-12 text-medsight-abnormal mx-auto mb-4" />
          <p className="text-medsight-abnormal mb-4">{error}</p>
          <button onClick={initializeMPRViewer} className="btn-medsight">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!seriesData) {
    return (
      <div className={`medsight-viewer-glass rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <Square3Stack3DIcon className="w-24 h-24 mx-auto mb-4 text-slate-500" />
          <h3 className="text-xl font-semibold mb-2 text-slate-400">No MPR Data</h3>
          <p className="text-slate-500">Load a 3D volume dataset to begin MPR viewing</p>
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
                  onClick={() => setActiveTool(tool.id)}
                  className={`p-2 rounded transition-all ${
                    activeTool === tool.id 
                      ? 'bg-medsight-primary text-white' 
                      : 'text-white hover:bg-white/20'
                  }`}
                  title={tool.description}
                >
                  <tool.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Layout */}
            <div className="flex items-center space-x-1 bg-black/50 rounded-lg p-1">
              {layouts.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => updateViewSettings({ layout: layout.id as any })}
                  className={`p-2 rounded transition-all ${
                    viewSettings.layout === layout.id 
                      ? 'bg-medsight-primary text-white' 
                      : 'text-white hover:bg-white/20'
                  }`}
                  title={layout.description}
                >
                  <layout.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Synchronization */}
            <div className="flex items-center space-x-1 bg-black/50 rounded-lg p-1">
              <button 
                onClick={() => updateViewSettings({ synchronized: !viewSettings.synchronized })}
                className={`p-2 rounded transition-all ${
                  viewSettings.synchronized 
                    ? 'bg-medsight-primary text-white' 
                    : 'text-white hover:bg-white/20'
                }`}
                title="Synchronize Views"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => updateViewSettings({ crosshairs: !viewSettings.crosshairs })}
                className={`p-2 rounded transition-all ${
                  viewSettings.crosshairs 
                    ? 'bg-medsight-primary text-white' 
                    : 'text-white hover:bg-white/20'
                }`}
                title="Show Crosshairs"
              >
                <ViewfinderCircleIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Info */}
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 bg-black/50 rounded-lg transition-colors ${
                showInfo ? 'bg-white/20' : 'hover:bg-black/70'
              }`}
              title="MPR Information"
            >
              <InformationCircleIcon className="w-4 h-4 text-white" />
            </button>

            {/* Settings */}
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
              title="Settings"
            >
              <Cog6ToothIcon className="w-4 h-4 text-white" />
            </button>

            {/* Reset */}
            <button 
              onClick={() => resetView()}
              className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
              title="Reset All Views"
            >
              <ArrowPathIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* MPR Views */}
      <div ref={containerRef} className="w-full h-full pt-16">
        {viewSettings.layout === 'quad' ? (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-1">
            {/* Axial View */}
            <div className="relative bg-black border border-slate-600">
              <canvas
                ref={axialCanvasRef}
                className="w-full h-full"
                style={{ cursor: tools.find(t => t.id === activeTool)?.cursor || 'default' }}
                onMouseDown={(e) => handleCanvasMouseDown(e, 'axial')}
                onMouseMove={(e) => handleCanvasMouseMove(e, 'axial')}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onWheel={(e) => handleCanvasWheel(e, 'axial')}
              />
              <div className="absolute top-2 left-2 text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded">
                AXIAL
              </div>
            </div>

            {/* Coronal View */}
            <div className="relative bg-black border border-slate-600">
              <canvas
                ref={coronalCanvasRef}
                className="w-full h-full"
                style={{ cursor: tools.find(t => t.id === activeTool)?.cursor || 'default' }}
                onMouseDown={(e) => handleCanvasMouseDown(e, 'coronal')}
                onMouseMove={(e) => handleCanvasMouseMove(e, 'coronal')}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onWheel={(e) => handleCanvasWheel(e, 'coronal')}
              />
              <div className="absolute top-2 left-2 text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded">
                CORONAL
              </div>
            </div>

            {/* Sagittal View */}
            <div className="relative bg-black border border-slate-600">
              <canvas
                ref={sagittalCanvasRef}
                className="w-full h-full"
                style={{ cursor: tools.find(t => t.id === activeTool)?.cursor || 'default' }}
                onMouseDown={(e) => handleCanvasMouseDown(e, 'sagittal')}
                onMouseMove={(e) => handleCanvasMouseMove(e, 'sagittal')}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onWheel={(e) => handleCanvasWheel(e, 'sagittal')}
              />
              <div className="absolute top-2 left-2 text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded">
                SAGITTAL
              </div>
            </div>

            {/* 3D View */}
            <div className="relative bg-black border border-slate-600">
              <canvas
                ref={threeDCanvasRef}
                className="w-full h-full"
              />
              <div className="absolute top-2 left-2 text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded">
                3D
              </div>
            </div>
          </div>
        ) : (
          // Single view mode
          <div className="w-full h-full">
            {viewSettings.layout === 'axial' && (
              <div className="relative bg-black w-full h-full">
                <canvas
                  ref={axialCanvasRef}
                  className="w-full h-full"
                  style={{ cursor: tools.find(t => t.id === activeTool)?.cursor || 'default' }}
                  onMouseDown={(e) => handleCanvasMouseDown(e, 'axial')}
                  onMouseMove={(e) => handleCanvasMouseMove(e, 'axial')}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onWheel={(e) => handleCanvasWheel(e, 'axial')}
                />
                <div className="absolute top-2 left-2 text-white text-lg font-semibold bg-black/50 px-3 py-2 rounded">
                  AXIAL
                </div>
              </div>
            )}
            {viewSettings.layout === 'coronal' && (
              <div className="relative bg-black w-full h-full">
                <canvas
                  ref={coronalCanvasRef}
                  className="w-full h-full"
                  style={{ cursor: tools.find(t => t.id === activeTool)?.cursor || 'default' }}
                  onMouseDown={(e) => handleCanvasMouseDown(e, 'coronal')}
                  onMouseMove={(e) => handleCanvasMouseMove(e, 'coronal')}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onWheel={(e) => handleCanvasWheel(e, 'coronal')}
                />
                <div className="absolute top-2 left-2 text-white text-lg font-semibold bg-black/50 px-3 py-2 rounded">
                  CORONAL
                </div>
              </div>
            )}
            {viewSettings.layout === 'sagittal' && (
              <div className="relative bg-black w-full h-full">
                <canvas
                  ref={sagittalCanvasRef}
                  className="w-full h-full"
                  style={{ cursor: tools.find(t => t.id === activeTool)?.cursor || 'default' }}
                  onMouseDown={(e) => handleCanvasMouseDown(e, 'sagittal')}
                  onMouseMove={(e) => handleCanvasMouseMove(e, 'sagittal')}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onWheel={(e) => handleCanvasWheel(e, 'sagittal')}
                />
                <div className="absolute top-2 left-2 text-white text-lg font-semibold bg-black/50 px-3 py-2 rounded">
                  SAGITTAL
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slice Navigators */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="grid grid-cols-3 gap-4">
          {['axial', 'coronal', 'sagittal'].map((orientation) => {
            const viewport = viewportInfos[orientation];
            const maxSlices = getSliceCount(orientation);
            
            return (
              <div key={orientation} className="bg-black/50 rounded-lg p-2">
                <div className="flex items-center space-x-2 text-white text-xs">
                  <span className="font-semibold min-w-[60px]">{orientation.toUpperCase()}</span>
                  <span>{viewport.sliceIndex + 1}/{maxSlices}</span>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max={maxSlices - 1}
                      value={viewport.sliceIndex}
                      onChange={(e) => {
                        const newIndex = parseInt(e.target.value);
                        setViewportInfos(prev => ({
                          ...prev,
                          [orientation]: {
                            ...prev[orientation],
                            sliceIndex: newIndex,
                            slicePosition: getSlicePosition(orientation, newIndex)
                          }
                        }));
                        onSliceChange?.(orientation, newIndex);
                      }}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <span className="text-xs">{viewport.slicePosition.toFixed(1)}mm</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MPR Information Panel */}
      {showInfo && seriesData && (
        <div className="absolute top-20 right-4 w-80 bg-black/80 rounded-lg p-4 text-white text-sm z-20">
          <h4 className="font-semibold mb-3">MPR Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Volume Dimensions:</span>
              <span>{seriesData.volumeDimensions.join(' × ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Voxel Spacing:</span>
              <span>{seriesData.voxelSpacing.map(s => s.toFixed(2)).join(' × ')} mm</span>
            </div>
            <div className="flex justify-between">
              <span>Modality:</span>
              <span>{seriesData.modality}</span>
            </div>
            <div className="flex justify-between">
              <span>Axial Slices:</span>
              <span>{seriesData.axialSlices.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Coronal Slices:</span>
              <span>{seriesData.coronalSlices.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Sagittal Slices:</span>
              <span>{seriesData.sagittalSlices.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Crosshair Position:</span>
              <span>{crosshair.position.map(p => p.toFixed(1)).join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Viewport:</span>
              <span className="capitalize">{activeViewport}</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button onClick={() => exportView()} className="btn-medsight w-full text-sm">
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export All Views
            </button>
            <button className="btn-medsight w-full text-sm">
              <ShareIcon className="w-4 h-4 mr-2" />
              Share MPR
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">MPR Viewer Settings</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="btn-medsight p-2"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Display Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Display</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewSettings.synchronized}
                      onChange={(e) => updateViewSettings({ synchronized: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Synchronize Views</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewSettings.crosshairs}
                      onChange={(e) => updateViewSettings({ crosshairs: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Show Crosshairs</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewSettings.referenceLines}
                      onChange={(e) => updateViewSettings({ referenceLines: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Show Reference Lines</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewSettings.orientationLabels}
                      onChange={(e) => updateViewSettings({ orientationLabels: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Show Orientation Labels</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewSettings.scaleBar}
                      onChange={(e) => updateViewSettings({ scaleBar: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Show Scale Bar</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewSettings.overlays}
                      onChange={(e) => updateViewSettings({ overlays: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Show Overlays</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewSettings.colorInvert}
                      onChange={(e) => updateViewSettings({ colorInvert: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Invert Colors</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Interpolation</label>
                  <select 
                    value={viewSettings.interpolation}
                    onChange={(e) => updateViewSettings({ interpolation: e.target.value as any })}
                    className="input-medsight"
                  >
                    <option value="nearest">Nearest Neighbor</option>
                    <option value="linear">Linear</option>
                    <option value="cubic">Cubic</option>
                  </select>
                </div>
              </div>

              {/* Synchronization Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Synchronization</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewSettings.linkZoom}
                      onChange={(e) => updateViewSettings({ linkZoom: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Link Zoom</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewSettings.linkPan}
                      onChange={(e) => updateViewSettings({ linkPan: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Link Pan</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewSettings.linkWindowing}
                      onChange={(e) => updateViewSettings({ linkWindowing: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Link Windowing</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={viewSettings.autoCenter}
                      onChange={(e) => updateViewSettings({ autoCenter: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Auto Center</span>
                  </label>
                </div>

                <div>
                  <h5 className="font-medium text-slate-700 mb-2">Crosshair Settings</h5>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Color</label>
                      <input
                        type="color"
                        value={crosshair.color}
                        onChange={(e) => setCrosshair(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full h-8 rounded border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Thickness: {crosshair.thickness}px
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={crosshair.thickness}
                        onChange={(e) => setCrosshair(prev => ({ ...prev, thickness: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-slate-700 mb-2">Orientation Presets</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {orientationPresets.map((preset) => (
                      <button
                        key={preset.id}
                        className="flex items-center space-x-3 p-2 rounded hover:bg-slate-100 transition-colors text-left"
                      >
                        <preset.icon className="w-4 h-4 text-medsight-primary" />
                        <div>
                          <span className="text-sm font-medium">{preset.name}</span>
                          <p className="text-xs text-slate-600">{preset.description}</p>
                        </div>
                      </button>
                    ))}
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