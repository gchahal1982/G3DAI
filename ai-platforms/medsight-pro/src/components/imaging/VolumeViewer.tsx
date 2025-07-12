'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CubeIcon,
  CubeTransparentIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  Cog6ToothIcon,
  PhotoIcon,
  FilmIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Square3Stack3DIcon,
  PaintBrushIcon,
  LightBulbIcon,
  SwatchIcon,
  AcademicCapIcon,
  BeakerIcon,
  HeartIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Squares2X2Icon,
  XMarkIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { 
  CubeIcon as CubeIconSolid,
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid,
  EyeIcon as EyeIconSolid
} from '@heroicons/react/24/solid';
import React from 'react';

interface VolumeData {
  id: string;
  studyId: string;
  seriesId: string;
  dimensions: [number, number, number]; // width, height, depth
  spacing: [number, number, number]; // pixel spacing in mm
  origin: [number, number, number]; // origin position
  orientation: number[]; // 9-element orientation matrix
  dataType: 'uint8' | 'uint16' | 'int16' | 'float32';
  data: ArrayBuffer | null;
  metadata: {
    modality: string;
    bodyPart: string;
    patientPosition: string;
    sliceThickness: number;
    kvp?: number;
    mas?: number;
    exposureTime?: number;
    contrastAgent?: boolean;
    acquisitionDate: string;
    acquisitionTime: string;
  };
  processed: boolean;
  fileSize: number;
  loadTime: number;
}

interface VolumeRenderingSettings {
  renderingMode: 'mip' | 'minip' | 'average' | 'vr' | 'iso';
  qualityLevel: 'low' | 'medium' | 'high' | 'ultra';
  stepSize: number;
  opacity: number;
  threshold: number;
  isoValue: number;
  windowLevel: number;
  windowWidth: number;
  ambient: number;
  diffuse: number;
  specular: number;
  shininess: number;
  gradientOpacity: number;
  shading: boolean;
  interpolation: 'nearest' | 'linear' | 'cubic';
  colorMap: string;
  clipping: {
    enabled: boolean;
    planes: Array<{
      normal: [number, number, number];
      distance: number;
      enabled: boolean;
    }>;
  };
  cropping: {
    enabled: boolean;
    bounds: [number, number, number, number, number, number]; // xmin, xmax, ymin, ymax, zmin, zmax
  };
}

interface Camera {
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
  fov: number;
  near: number;
  far: number;
  zoom: number;
}

interface VolumeViewerProps {
  volumeData: VolumeData | null;
  onVolumeChange?: (volumeId: string) => void;
  onMeasurement?: (measurement: any) => void;
  onAnnotation?: (annotation: any) => void;
  className?: string;
  readOnly?: boolean;
  showControls?: boolean;
  autoRotate?: boolean;
  enableClipping?: boolean;
  enableCropping?: boolean;
}

export default function VolumeViewer({
  volumeData,
  onVolumeChange,
  onMeasurement,
  onAnnotation,
  className = '',
  readOnly = false,
  showControls = true,
  autoRotate = false,
  enableClipping = true,
  enableCropping = true
}: VolumeViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  
  const [renderingSettings, setRenderingSettings] = useState<VolumeRenderingSettings>({
    renderingMode: 'vr',
    qualityLevel: 'medium',
    stepSize: 0.5,
    opacity: 1.0,
    threshold: 0.1,
    isoValue: 128,
    windowLevel: 40,
    windowWidth: 400,
    ambient: 0.2,
    diffuse: 0.8,
    specular: 0.3,
    shininess: 10,
    gradientOpacity: 0.5,
    shading: true,
    interpolation: 'linear',
    colorMap: 'grayscale',
    clipping: {
      enabled: false,
      planes: [
        { normal: [1, 0, 0], distance: 0, enabled: false },
        { normal: [0, 1, 0], distance: 0, enabled: false },
        { normal: [0, 0, 1], distance: 0, enabled: false }
      ]
    },
    cropping: {
      enabled: false,
      bounds: [0, 1, 0, 1, 0, 1]
    }
  });

  const [camera, setCamera] = useState<Camera>({
    position: [0, 0, 300],
    target: [0, 0, 0],
    up: [0, 1, 0],
    fov: 45,
    near: 0.1,
    far: 1000,
    zoom: 1.0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [renderTime, setRenderTime] = useState(0);
  const [fps, setFps] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<string>('rotate');

  const renderingModes = [
    { id: 'vr', name: 'Volume Rendering', icon: CubeIcon, description: 'Full volume rendering' },
    { id: 'mip', name: 'Maximum Intensity', icon: Square3Stack3DIcon, description: 'Maximum intensity projection' },
    { id: 'minip', name: 'Minimum Intensity', icon: Square3Stack3DIcon, description: 'Minimum intensity projection' },
    { id: 'average', name: 'Average Intensity', icon: Square3Stack3DIcon, description: 'Average intensity projection' },
    { id: 'iso', name: 'Isosurface', icon: CubeTransparentIcon, description: 'Isosurface rendering' }
  ];

  const colorMaps = [
    { id: 'grayscale', name: 'Grayscale', colors: ['#000000', '#ffffff'] },
    { id: 'hot', name: 'Hot', colors: ['#000000', '#ff0000', '#ffff00', '#ffffff'] },
    { id: 'cool', name: 'Cool', colors: ['#00ffff', '#ff00ff'] },
    { id: 'rainbow', name: 'Rainbow', colors: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff'] },
    { id: 'bone', name: 'Bone', colors: ['#000000', '#545474', '#a8a8ba', '#ffffff'] },
    { id: 'copper', name: 'Copper', colors: ['#000000', '#ff7f00', '#ffbf80', '#ffffff'] }
  ];

  const presets = [
    {
      id: 'ct_bone',
      name: 'CT Bone',
      icon: AcademicCapIcon,
      settings: {
        renderingMode: 'vr' as const,
        windowLevel: 400,
        windowWidth: 1000,
        opacity: 0.8,
        threshold: 0.3,
        colorMap: 'bone'
      }
    },
    {
      id: 'ct_soft_tissue',
      name: 'CT Soft Tissue',
      icon: HeartIcon,
      settings: {
        renderingMode: 'vr' as const,
        windowLevel: 40,
        windowWidth: 400,
        opacity: 0.6,
        threshold: 0.1,
        colorMap: 'grayscale'
      }
    },
    {
      id: 'ct_lung',
      name: 'CT Lung',
      icon: BeakerIcon,
      settings: {
        renderingMode: 'vr' as const,
        windowLevel: -600,
        windowWidth: 1600,
        opacity: 0.4,
        threshold: 0.05,
        colorMap: 'cool'
      }
    },
    {
      id: 'mri_brain',
      name: 'MRI Brain',
      icon: CpuChipIcon,
      settings: {
        renderingMode: 'vr' as const,
        windowLevel: 128,
        windowWidth: 256,
        opacity: 0.7,
        threshold: 0.2,
        colorMap: 'hot'
      }
    },
    {
      id: 'angio',
      name: 'Angiography',
      icon: HeartIcon,
      settings: {
        renderingMode: 'mip' as const,
        windowLevel: 200,
        windowWidth: 600,
        opacity: 1.0,
        threshold: 0.4,
        colorMap: 'hot'
      }
    }
  ];

  const tools = [
    {
      id: 'rotate',
      name: 'Rotate',
      icon: ArrowPathIcon,
      description: 'Rotate the volume',
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
      id: 'pan',
      name: 'Pan',
      icon: ArrowsPointingOutIcon,
      description: 'Pan the volume',
      cursor: 'move'
    },
    {
      id: 'clip',
      name: 'Clipping',
      icon: Squares2X2Icon,
      description: 'Clipping planes',
      cursor: 'crosshair'
    }
  ];

  useEffect(() => {
    if (volumeData) {
      initializeVolumeRenderer();
    }
  }, [volumeData]);

  useEffect(() => {
    renderVolume();
  }, [renderingSettings, camera]);

  useEffect(() => {
    if (isRotating) {
      startAutoRotation();
    } else {
      stopAutoRotation();
    }
    return () => stopAutoRotation();
  }, [isRotating]);

  const initializeVolumeRenderer = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!volumeData) {
        throw new Error('No volume data provided');
      }

      // Initialize WebGL context and volume renderer
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not available');
      }

      const gl = canvas.getContext('webgl2');
      if (!gl) {
        throw new Error('WebGL 2.0 not supported');
      }

      // Set initial window/level from volume metadata
      if (volumeData.metadata.modality === 'CT') {
        setRenderingSettings(prev => ({
          ...prev,
          windowLevel: 40,
          windowWidth: 400
        }));
      } else if (volumeData.metadata.modality === 'MRI') {
        setRenderingSettings(prev => ({
          ...prev,
          windowLevel: 128,
          windowWidth: 256
        }));
      }

      // Initialize camera based on volume dimensions
      const [width, height, depth] = volumeData.dimensions;
      const maxDim = Math.max(width, height, depth);
      setCamera(prev => ({
        ...prev,
        position: [0, 0, maxDim * 2],
        far: maxDim * 4
      }));

      setLoading(false);
    } catch (error) {
      console.error('Error initializing volume renderer:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize volume renderer');
      setLoading(false);
    }
  };

  const renderVolume = useCallback(() => {
    if (!volumeData || !canvasRef.current) return;

    const startTime = performance.now();
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    // Clear canvas
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Mock volume rendering
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create gradient pattern based on rendering mode
      let gradient;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) / 3;

      switch (renderingSettings.renderingMode) {
        case 'mip':
          gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
          gradient.addColorStop(0.5, 'rgba(128, 128, 128, 0.8)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
          break;
        case 'minip':
          gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
          gradient.addColorStop(0.5, 'rgba(64, 64, 64, 0.8)');
          gradient.addColorStop(1, 'rgba(128, 128, 128, 0.2)');
          break;
        case 'iso':
          gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
          gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.9)');
          gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          break;
        default: // vr
          gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${renderingSettings.opacity})`);
          gradient.addColorStop(0.3, `rgba(200, 200, 200, ${renderingSettings.opacity * 0.8})`);
          gradient.addColorStop(0.6, `rgba(128, 128, 128, ${renderingSettings.opacity * 0.6})`);
          gradient.addColorStop(1, `rgba(0, 0, 0, ${renderingSettings.opacity * 0.2})`);
      }

      // Apply color map
      if (renderingSettings.colorMap !== 'grayscale') {
        const colorMap = colorMaps.find(cm => cm.id === renderingSettings.colorMap);
        if (colorMap) {
          gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          colorMap.colors.forEach((color, index) => {
            const stop = index / (colorMap.colors.length - 1);
            gradient.addColorStop(stop, color);
          });
        }
      }

      ctx.fillStyle = gradient;
      
      // Apply camera zoom
      const scaledRadius = radius * camera.zoom;
      
      // Draw volume
      ctx.beginPath();
      ctx.arc(centerX, centerY, scaledRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Add some mock 3D structure
      if (renderingSettings.shading) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
      }

      // Draw mock anatomical structures
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      // Draw some ellipses to simulate organs
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const x = centerX + (Math.random() - 0.5) * scaledRadius;
        const y = centerY + (Math.random() - 0.5) * scaledRadius;
        const rx = scaledRadius * 0.2 * Math.random();
        const ry = scaledRadius * 0.3 * Math.random();
        ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, 2 * Math.PI);
        ctx.stroke();
      }

      ctx.setLineDash([]);
      ctx.shadowColor = 'transparent';

      // Draw clipping planes if enabled
      if (renderingSettings.clipping.enabled) {
        renderingSettings.clipping.planes.forEach((plane, index) => {
          if (plane.enabled) {
            ctx.strokeStyle = `hsl(${index * 120}, 70%, 50%)`;
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            
            // Draw plane representation
            const planeY = centerY + plane.distance * scaledRadius;
            ctx.beginPath();
            ctx.moveTo(centerX - scaledRadius, planeY);
            ctx.lineTo(centerX + scaledRadius, planeY);
            ctx.stroke();
            
            ctx.setLineDash([]);
          }
        });
      }

      // Draw cropping box if enabled
      if (renderingSettings.cropping.enabled) {
        const [xmin, xmax, ymin, ymax] = renderingSettings.cropping.bounds;
        const cropX = centerX - scaledRadius + (xmin * scaledRadius * 2);
        const cropY = centerY - scaledRadius + (ymin * scaledRadius * 2);
        const cropWidth = (xmax - xmin) * scaledRadius * 2;
        const cropHeight = (ymax - ymin) * scaledRadius * 2;
        
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
        ctx.setLineDash([]);
      }
    }

    const endTime = performance.now();
    setRenderTime(endTime - startTime);
    
    // Calculate FPS
    const currentFps = 1000 / (endTime - startTime);
    setFps(Math.round(currentFps));
  }, [volumeData, renderingSettings, camera]);

  const startAutoRotation = () => {
    const rotate = () => {
      setCamera(prev => {
        const angle = 0.01; // Rotation speed
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newX = prev.position[0] * cos - prev.position[2] * sin;
        const newZ = prev.position[0] * sin + prev.position[2] * cos;
        return {
          ...prev,
          position: [newX, prev.position[1], newZ]
        };
      });
      
      if (isRotating) {
        animationRef.current = requestAnimationFrame(rotate);
      }
    };
    
    animationRef.current = requestAnimationFrame(rotate);
  };

  const stopAutoRotation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setLastMousePosition({ x, y });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDown) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const deltaX = x - lastMousePosition.x;
      const deltaY = y - lastMousePosition.y;

      switch (activeTool) {
        case 'rotate':
          // Rotate camera around volume
          setCamera(prev => {
            const sensitivity = 0.01;
            const yaw = deltaX * sensitivity;
            const pitch = deltaY * sensitivity;
            
            // Simple rotation around Y and X axes
            const cosYaw = Math.cos(yaw);
            const sinYaw = Math.sin(yaw);
            const cosPitch = Math.cos(pitch);
            const sinPitch = Math.sin(pitch);
            
            let newX = prev.position[0] * cosYaw - prev.position[2] * sinYaw;
            let newZ = prev.position[0] * sinYaw + prev.position[2] * cosYaw;
            let newY = prev.position[1] * cosPitch - newZ * sinPitch;
            newZ = prev.position[1] * sinPitch + newZ * cosPitch;
            
            return {
              ...prev,
              position: [newX, newY, newZ]
            };
          });
          break;
        case 'zoom':
          setCamera(prev => ({
            ...prev,
            zoom: Math.max(0.1, Math.min(5, prev.zoom + deltaY * 0.01))
          }));
          break;
        case 'pan':
          setCamera(prev => ({
            ...prev,
            target: [
              prev.target[0] - deltaX * 0.5,
              prev.target[1] + deltaY * 0.5,
              prev.target[2]
            ]
          }));
          break;
      }

      setLastMousePosition({ x, y });
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
      setCamera(prev => ({
        ...prev,
        zoom: Math.max(0.1, Math.min(5, prev.zoom * zoomFactor))
      }));
    } else {
      // Adjust opacity with Wheel
      const opacityDelta = event.deltaY > 0 ? -0.05 : 0.05;
      setRenderingSettings(prev => ({
        ...prev,
        opacity: Math.max(0, Math.min(1, prev.opacity + opacityDelta))
      }));
    }
  };

  const updateRenderingSettings = (updates: Partial<VolumeRenderingSettings>) => {
    setRenderingSettings(prev => ({ ...prev, ...updates }));
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setRenderingSettings(prev => ({
      ...prev,
      ...preset.settings
    }));
    setShowPresets(false);
  };

  const resetCamera = () => {
    if (volumeData) {
      const [width, height, depth] = volumeData.dimensions;
      const maxDim = Math.max(width, height, depth);
      setCamera({
        position: [0, 0, maxDim * 2],
        target: [0, 0, 0],
        up: [0, 1, 0],
        fov: 45,
        near: 0.1,
        far: maxDim * 4,
        zoom: 1.0
      });
    }
  };

  const exportVolume = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `volume_${volumeData?.id || 'export'}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  if (loading) {
    return (
      <div className={`medsight-viewer-glass rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medsight-primary mx-auto mb-4"></div>
          <p>Initializing volume renderer...</p>
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
          <button onClick={initializeVolumeRenderer} className="btn-medsight">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!volumeData) {
    return (
      <div className={`medsight-viewer-glass rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <CubeIcon className="w-24 h-24 mx-auto mb-4 text-slate-500" />
          <h3 className="text-xl font-semibold mb-2 text-slate-400">No Volume Data</h3>
          <p className="text-slate-500">Load a 3D volume dataset to begin rendering</p>
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
              {tools.map((tool) => (
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

            {/* Rendering Mode */}
            <div className="flex items-center space-x-1 bg-black/50 rounded-lg p-1">
              {renderingModes.slice(0, 3).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => updateRenderingSettings({ renderingMode: mode.id as any })}
                  className={`p-2 rounded transition-all ${
                    renderingSettings.renderingMode === mode.id 
                      ? 'bg-medsight-primary text-white' 
                      : 'text-white hover:bg-white/20'
                  }`}
                  title={mode.description}
                >
                  <mode.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Quality */}
            <div className="flex items-center space-x-1 bg-black/50 rounded-lg p-1">
              <span className="text-white text-xs px-2">Quality:</span>
              <select
                value={renderingSettings.qualityLevel}
                onChange={(e) => updateRenderingSettings({ qualityLevel: e.target.value as any })}
                className="bg-transparent text-white text-xs border-none outline-none"
              >
                <option value="low" className="text-black">Low</option>
                <option value="medium" className="text-black">Medium</option>
                <option value="high" className="text-black">High</option>
                <option value="ultra" className="text-black">Ultra</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto Rotate */}
            <button 
              onClick={() => setIsRotating(!isRotating)}
              className={`p-2 bg-black/50 rounded-lg transition-colors ${
                isRotating ? 'bg-medsight-primary' : 'hover:bg-black/70'
              }`}
              title="Auto Rotate"
            >
              <ArrowPathIcon className="w-4 h-4 text-white" />
            </button>

            {/* Presets */}
            <button 
              onClick={() => setShowPresets(!showPresets)}
              className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
              title="Presets"
            >
              <SwatchIcon className="w-4 h-4 text-white" />
            </button>

            {/* Info */}
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 bg-black/50 rounded-lg transition-colors ${
                showInfo ? 'bg-white/20' : 'hover:bg-black/70'
              }`}
              title="Volume Information"
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
              onClick={resetCamera}
              className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
              title="Reset Camera"
            >
              <ArrowPathIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Volume Canvas */}
      <div ref={containerRef} className="w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ cursor: tools.find(t => t.id === activeTool)?.cursor || 'default' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
      </div>

      {/* Performance Stats */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/50 rounded-lg px-3 py-1 text-white text-xs">
          <span>FPS: {fps}</span>
          <span className="mx-2">|</span>
          <span>Render: {renderTime.toFixed(1)}ms</span>
          <span className="mx-2">|</span>
          <span>{renderingSettings.renderingMode.toUpperCase()}</span>
        </div>
      </div>

      {/* Volume Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-black/50 rounded-lg p-3">
          <div className="grid grid-cols-4 gap-4">
            {/* Opacity */}
            <div>
              <label className="block text-white text-xs mb-1">Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={renderingSettings.opacity}
                onChange={(e) => updateRenderingSettings({ opacity: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-white text-xs">{(renderingSettings.opacity * 100).toFixed(0)}%</span>
            </div>

            {/* Threshold */}
            <div>
              <label className="block text-white text-xs mb-1">Threshold</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={renderingSettings.threshold}
                onChange={(e) => updateRenderingSettings({ threshold: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-white text-xs">{(renderingSettings.threshold * 100).toFixed(0)}%</span>
            </div>

            {/* Window Level */}
            <div>
              <label className="block text-white text-xs mb-1">Window Level</label>
              <input
                type="range"
                min="-1024"
                max="3071"
                value={renderingSettings.windowLevel}
                onChange={(e) => updateRenderingSettings({ windowLevel: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-white text-xs">{renderingSettings.windowLevel}</span>
            </div>

            {/* Window Width */}
            <div>
              <label className="block text-white text-xs mb-1">Window Width</label>
              <input
                type="range"
                min="1"
                max="4096"
                value={renderingSettings.windowWidth}
                onChange={(e) => updateRenderingSettings({ windowWidth: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-white text-xs">{renderingSettings.windowWidth}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Presets Panel */}
      {showPresets && (
        <div className="absolute top-20 right-4 w-64 bg-black/80 rounded-lg p-4 text-white z-20">
          <h4 className="font-semibold mb-3">Volume Presets</h4>
          <div className="space-y-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="w-full flex items-center space-x-3 p-2 rounded hover:bg-white/10 transition-colors"
              >
                <preset.icon className="w-5 h-5 text-medsight-primary" />
                <span className="text-sm">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Volume Information Panel */}
      {showInfo && (
        <div className="absolute top-20 right-4 w-80 bg-black/80 rounded-lg p-4 text-white text-sm z-20">
          <h4 className="font-semibold mb-3">Volume Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Dimensions:</span>
              <span>{volumeData.dimensions.join(' × ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Spacing:</span>
              <span>{volumeData.spacing.map(s => s.toFixed(2)).join(' × ')} mm</span>
            </div>
            <div className="flex justify-between">
              <span>Data Type:</span>
              <span>{volumeData.dataType}</span>
            </div>
            <div className="flex justify-between">
              <span>Modality:</span>
              <span>{volumeData.metadata.modality}</span>
            </div>
            <div className="flex justify-between">
              <span>Body Part:</span>
              <span>{volumeData.metadata.bodyPart}</span>
            </div>
            <div className="flex justify-between">
              <span>File Size:</span>
              <span>{(volumeData.fileSize / 1024 / 1024).toFixed(1)} MB</span>
            </div>
            <div className="flex justify-between">
              <span>Load Time:</span>
              <span>{volumeData.loadTime.toFixed(0)} ms</span>
            </div>
            <div className="flex justify-between">
              <span>Camera Zoom:</span>
              <span>{(camera.zoom * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button onClick={exportVolume} className="btn-medsight w-full text-sm">
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export Image
            </button>
            <button className="btn-medsight w-full text-sm">
              <ShareIcon className="w-4 h-4 mr-2" />
              Share Volume
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Volume Rendering Settings</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="btn-medsight p-2"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Rendering Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Rendering</h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rendering Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {renderingModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => updateRenderingSettings({ renderingMode: mode.id as any })}
                        className={`p-3 rounded-lg border text-left ${
                          renderingSettings.renderingMode === mode.id
                            ? 'border-medsight-primary bg-medsight-primary/10'
                            : 'border-slate-200 hover:border-medsight-primary/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <mode.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{mode.name}</span>
                        </div>
                        <p className="text-xs text-slate-600">{mode.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Color Map</label>
                  <select 
                    value={renderingSettings.colorMap}
                    onChange={(e) => updateRenderingSettings({ colorMap: e.target.value })}
                    className="input-medsight"
                  >
                    {colorMaps.map((colorMap) => (
                      <option key={colorMap.id} value={colorMap.id}>
                        {colorMap.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quality Level</label>
                  <select 
                    value={renderingSettings.qualityLevel}
                    onChange={(e) => updateRenderingSettings({ qualityLevel: e.target.value as any })}
                    className="input-medsight"
                  >
                    <option value="low">Low (Fast)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra (Slow)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Interpolation</label>
                  <select 
                    value={renderingSettings.interpolation}
                    onChange={(e) => updateRenderingSettings({ interpolation: e.target.value as any })}
                    className="input-medsight"
                  >
                    <option value="nearest">Nearest Neighbor</option>
                    <option value="linear">Linear</option>
                    <option value="cubic">Cubic</option>
                  </select>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Advanced</h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Step Size: {renderingSettings.stepSize}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={renderingSettings.stepSize}
                    onChange={(e) => updateRenderingSettings({ stepSize: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Iso Value: {renderingSettings.isoValue}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={renderingSettings.isoValue}
                    onChange={(e) => updateRenderingSettings({ isoValue: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ambient: {renderingSettings.ambient.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={renderingSettings.ambient}
                    onChange={(e) => updateRenderingSettings({ ambient: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Diffuse: {renderingSettings.diffuse.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={renderingSettings.diffuse}
                    onChange={(e) => updateRenderingSettings({ diffuse: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Specular: {renderingSettings.specular.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={renderingSettings.specular}
                    onChange={(e) => updateRenderingSettings({ specular: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={renderingSettings.shading}
                      onChange={(e) => updateRenderingSettings({ shading: e.target.checked })}
                      className="rounded border-slate-300 text-medsight-primary"
                    />
                    <span className="text-sm text-slate-700">Enable Shading</span>
                  </label>
                  
                  {enableClipping && (
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={renderingSettings.clipping.enabled}
                        onChange={(e) => updateRenderingSettings({ 
                          clipping: { ...renderingSettings.clipping, enabled: e.target.checked }
                        })}
                        className="rounded border-slate-300 text-medsight-primary"
                      />
                      <span className="text-sm text-slate-700">Enable Clipping Planes</span>
                    </label>
                  )}
                  
                  {enableCropping && (
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={renderingSettings.cropping.enabled}
                        onChange={(e) => updateRenderingSettings({ 
                          cropping: { ...renderingSettings.cropping, enabled: e.target.checked }
                        })}
                        className="rounded border-slate-300 text-medsight-primary"
                      />
                      <span className="text-sm text-slate-700">Enable Volume Cropping</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 