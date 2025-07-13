'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CubeIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  SparklesIcon,
  BeakerIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PresentationChartBarIcon,
  CpuChipIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  Square3Stack3DIcon,
  RectangleGroupIcon,
  CircleStackIcon,
  SunIcon,
  MoonIcon,
  LightBulbIcon,
  ChartBarIcon,
  PencilIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ScissorsIcon,
  ViewfinderCircleIcon,
  CursorArrowRaysIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface MPRViewerProps {
  studyId?: string;
  className?: string;
  onPlaneChange?: (plane: string, slice: number) => void;
  onMeasurement?: (measurement: any) => void;
  onSynchronization?: (enabled: boolean) => void;
  showCrosshairs?: boolean;
  showMeasurements?: boolean;
  showAnnotations?: boolean;
  emergencyMode?: boolean;
  collaborationMode?: boolean;
}

interface MPRState {
  planes: {
    axial: { slice: number; windowLevel: number; windowWidth: number; zoom: number; pan: { x: number; y: number } };
    coronal: { slice: number; windowLevel: number; windowWidth: number; zoom: number; pan: { x: number; y: number } };
    sagittal: { slice: number; windowLevel: number; windowWidth: number; zoom: number; pan: { x: number; y: number } };
  };
  crosshairs: {
    enabled: boolean;
    position: { x: number; y: number; z: number };
    color: string;
    thickness: number;
    style: 'solid' | 'dashed' | 'dotted';
  };
  synchronization: {
    enabled: boolean;
    windowLevel: boolean;
    zoom: boolean;
    pan: boolean;
    playback: boolean;
  };
  playback: {
    isPlaying: boolean;
    speed: number;
    direction: 'forward' | 'backward';
    loop: boolean;
    activePane: 'axial' | 'coronal' | 'sagittal' | 'all';
  };
  layout: '2x2' | '1x3' | '3x1' | 'custom';
  orientation: {
    axial: 'R-L_A-P' | 'L-R_A-P' | 'R-L_P-A' | 'L-R_P-A';
    coronal: 'R-L_S-I' | 'L-R_S-I' | 'R-L_I-S' | 'L-R_I-S';
    sagittal: 'A-P_S-I' | 'P-A_S-I' | 'A-P_I-S' | 'P-A_I-S';
  };
  measurements: Array<{
    id: string;
    plane: 'axial' | 'coronal' | 'sagittal';
    type: 'length' | 'area' | 'angle' | 'cross-reference';
    coordinates: { x: number; y: number }[];
    value: number;
    unit: string;
    slice: number;
  }>;
  annotations: Array<{
    id: string;
    plane: 'axial' | 'coronal' | 'sagittal';
    type: 'text' | 'arrow' | 'circle';
    position: { x: number; y: number };
    text?: string;
    slice: number;
  }>;
  presets: {
    current: string;
    available: string[];
  };
  imageData: {
    axial: { sliceCount: number; dimensions: { width: number; height: number } };
    coronal: { sliceCount: number; dimensions: { width: number; height: number } };
    sagittal: { sliceCount: number; dimensions: { width: number; height: number } };
    spacing: { x: number; y: number; z: number };
    origin: { x: number; y: number; z: number };
  };
}

interface WindowPreset {
  name: string;
  level: number;
  width: number;
  description: string;
}

export default function MPRViewer({
  studyId,
  className = '',
  onPlaneChange,
  onMeasurement,
  onSynchronization,
  showCrosshairs = true,
  showMeasurements = true,
  showAnnotations = true,
  emergencyMode = false,
  collaborationMode = false
}: MPRViewerProps) {
  const axialCanvasRef = useRef<HTMLCanvasElement>(null);
  const coronalCanvasRef = useRef<HTMLCanvasElement>(null);
  const sagittalCanvasRef = useRef<HTMLCanvasElement>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout>();

  const [mprState, setMPRState] = useState<MPRState>({
    planes: {
      axial: { slice: 128, windowLevel: 40, windowWidth: 400, zoom: 1.0, pan: { x: 0, y: 0 } },
      coronal: { slice: 128, windowLevel: 40, windowWidth: 400, zoom: 1.0, pan: { x: 0, y: 0 } },
      sagittal: { slice: 128, windowLevel: 40, windowWidth: 400, zoom: 1.0, pan: { x: 0, y: 0 } }
    },
    crosshairs: {
      enabled: showCrosshairs,
      position: { x: 128, y: 128, z: 128 },
      color: '#10b981',
      thickness: 2,
      style: 'solid'
    },
    synchronization: {
      enabled: true,
      windowLevel: true,
      zoom: false,
      pan: false,
      playback: false
    },
    playback: {
      isPlaying: false,
      speed: 5,
      direction: 'forward',
      loop: true,
      activePane: 'all'
    },
    layout: '2x2',
    orientation: {
      axial: 'R-L_A-P',
      coronal: 'R-L_S-I',
      sagittal: 'A-P_S-I'
    },
    measurements: [],
    annotations: [],
    presets: {
      current: 'soft_tissue',
      available: ['soft_tissue', 'bone', 'lung', 'brain', 'abdomen']
    },
    imageData: {
      axial: { sliceCount: 256, dimensions: { width: 512, height: 512 } },
      coronal: { sliceCount: 256, dimensions: { width: 512, height: 512 } },
      sagittal: { sliceCount: 256, dimensions: { width: 512, height: 512 } },
      spacing: { x: 0.7, y: 0.7, z: 5.0 },
      origin: { x: 0, y: 0, z: 0 }
    }
  });

  const [activePlane, setActivePlane] = useState<'axial' | 'coronal' | 'sagittal'>('axial');
  const [selectedTool, setSelectedTool] = useState<string>('crosshair');
  const [showControls, setShowControls] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<{ x: number; y: number }[]>([]);

  const windowPresets: WindowPreset[] = [
    { name: 'Soft Tissue', level: 40, width: 400, description: 'General soft tissue contrast' },
    { name: 'Bone', level: 300, width: 1500, description: 'Bone detail visualization' },
    { name: 'Lung', level: -500, width: 1500, description: 'Lung parenchyma and airways' },
    { name: 'Brain', level: 40, width: 80, description: 'Brain tissue contrast' },
    { name: 'Abdomen', level: 50, width: 350, description: 'Abdominal organ contrast' },
    { name: 'Mediastinum', level: 50, width: 350, description: 'Mediastinal structures' }
  ];

  const handlePlaneNavigation = useCallback((plane: 'axial' | 'coronal' | 'sagittal', direction: 'next' | 'prev') => {
    setMPRState(prev => {
      const currentSlice = prev.planes[plane].slice;
      const maxSlice = prev.imageData[plane].sliceCount - 1;
      const newSlice = direction === 'next' 
        ? Math.min(currentSlice + 1, maxSlice)
        : Math.max(currentSlice - 1, 0);

      const newState = {
        ...prev,
        planes: {
          ...prev.planes,
          [plane]: { ...prev.planes[plane], slice: newSlice }
        }
      };

      // Update crosshair position if synchronized
      if (prev.synchronization.enabled) {
        const crosshairPos = { ...prev.crosshairs.position };
        if (plane === 'axial') crosshairPos.z = newSlice;
        else if (plane === 'coronal') crosshairPos.y = newSlice;
        else if (plane === 'sagittal') crosshairPos.x = newSlice;

        newState.crosshairs = { ...prev.crosshairs, position: crosshairPos };
      }

      onPlaneChange?.(plane, newSlice);
      return newState;
    });
  }, [onPlaneChange]);

  const handleWindowLevelChange = useCallback((plane: 'axial' | 'coronal' | 'sagittal', level: number, width: number) => {
    setMPRState(prev => {
      const newState = { ...prev };

      if (prev.synchronization.enabled && prev.synchronization.windowLevel) {
        // Apply to all planes
        Object.keys(newState.planes).forEach(p => {
          newState.planes[p as keyof typeof newState.planes].windowLevel = level;
          newState.planes[p as keyof typeof newState.planes].windowWidth = width;
        });
      } else {
        // Apply to single plane
        newState.planes[plane].windowLevel = level;
        newState.planes[plane].windowWidth = width;
      }

      return newState;
    });
  }, []);

  const handleZoom = useCallback((plane: 'axial' | 'coronal' | 'sagittal', factor: number) => {
    setMPRState(prev => {
      const newState = { ...prev };
      const currentZoom = prev.planes[plane].zoom;
      const newZoom = Math.max(0.1, Math.min(10.0, currentZoom * factor));

      if (prev.synchronization.enabled && prev.synchronization.zoom) {
        // Apply to all planes
        Object.keys(newState.planes).forEach(p => {
          newState.planes[p as keyof typeof newState.planes].zoom = newZoom;
        });
      } else {
        // Apply to single plane
        newState.planes[plane].zoom = newZoom;
      }

      return newState;
    });
  }, []);

  const handlePan = useCallback((plane: 'axial' | 'coronal' | 'sagittal', deltaX: number, deltaY: number) => {
    setMPRState(prev => {
      const newState = { ...prev };
      const currentPan = prev.planes[plane].pan;
      const newPan = { x: currentPan.x + deltaX, y: currentPan.y + deltaY };

      if (prev.synchronization.enabled && prev.synchronization.pan) {
        // Apply to all planes
        Object.keys(newState.planes).forEach(p => {
          newState.planes[p as keyof typeof newState.planes].pan = newPan;
        });
      } else {
        // Apply to single plane
        newState.planes[plane].pan = newPan;
      }

      return newState;
    });
  }, []);

  const handleCrosshairClick = useCallback((plane: 'axial' | 'coronal' | 'sagittal', x: number, y: number) => {
    if (!mprState.crosshairs.enabled) return;

    setMPRState(prev => {
      const newPosition = { ...prev.crosshairs.position };
      
      if (plane === 'axial') {
        newPosition.x = x;
        newPosition.y = y;
      } else if (plane === 'coronal') {
        newPosition.x = x;
        newPosition.z = y;
      } else if (plane === 'sagittal') {
        newPosition.y = x;
        newPosition.z = y;
      }

      // Update corresponding slices in other planes
      const newState = {
        ...prev,
        crosshairs: { ...prev.crosshairs, position: newPosition },
        planes: {
          ...prev.planes,
          axial: { ...prev.planes.axial, slice: Math.round(newPosition.z) },
          coronal: { ...prev.planes.coronal, slice: Math.round(newPosition.y) },
          sagittal: { ...prev.planes.sagittal, slice: Math.round(newPosition.x) }
        }
      };

      return newState;
    });
  }, [mprState.crosshairs.enabled]);

  const handlePlayback = useCallback((play: boolean) => {
    setMPRState(prev => ({ ...prev, playback: { ...prev.playback, isPlaying: play } }));

    if (play) {
      playbackIntervalRef.current = setInterval(() => {
        setMPRState(prev => {
          const activePane = prev.playback.activePane;
          const planes = activePane === 'all' ? ['axial', 'coronal', 'sagittal'] : [activePane];
          
          const newState = { ...prev };
          planes.forEach(plane => {
            const p = plane as 'axial' | 'coronal' | 'sagittal';
            const currentSlice = prev.planes[p].slice;
            const maxSlice = prev.imageData[p].sliceCount - 1;
            
            let newSlice;
            if (prev.playback.direction === 'forward') {
              newSlice = currentSlice >= maxSlice ? (prev.playback.loop ? 0 : maxSlice) : currentSlice + 1;
            } else {
              newSlice = currentSlice <= 0 ? (prev.playback.loop ? maxSlice : 0) : currentSlice - 1;
            }
            
            newState.planes[p].slice = newSlice;
          });

          return newState;
        });
      }, 1000 / mprState.playback.speed);
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    }
  }, [mprState.playback.speed]);

  const handlePresetChange = useCallback((presetName: string) => {
    const preset = windowPresets.find(p => p.name === presetName);
    if (preset) {
      setMPRState(prev => ({
        ...prev,
        presets: { ...prev.presets, current: presetName },
        planes: {
          axial: { ...prev.planes.axial, windowLevel: preset.level, windowWidth: preset.width },
          coronal: { ...prev.planes.coronal, windowLevel: preset.level, windowWidth: preset.width },
          sagittal: { ...prev.planes.sagittal, windowLevel: preset.level, windowWidth: preset.width }
        }
      }));
    }
  }, []);

  const handleReset = useCallback(() => {
    setMPRState(prev => ({
      ...prev,
      planes: {
        axial: { slice: 128, windowLevel: 40, windowWidth: 400, zoom: 1.0, pan: { x: 0, y: 0 } },
        coronal: { slice: 128, windowLevel: 40, windowWidth: 400, zoom: 1.0, pan: { x: 0, y: 0 } },
        sagittal: { slice: 128, windowLevel: 40, windowWidth: 400, zoom: 1.0, pan: { x: 0, y: 0 } }
      },
      crosshairs: { ...prev.crosshairs, position: { x: 128, y: 128, z: 128 } }
    }));
  }, []);

  const renderPlane = useCallback((canvas: HTMLCanvasElement, plane: 'axial' | 'coronal' | 'sagittal') => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { slice, windowLevel, windowWidth, zoom, pan } = mprState.planes[plane];
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.scale(zoom, zoom);
    
    // Mock medical image for the plane
    const imageSize = 200;
    ctx.fillStyle = '#333';
    ctx.fillRect(-imageSize / 2, -imageSize / 2, imageSize, imageSize);
    
    // Add plane-specific mock anatomy
    if (plane === 'axial') {
      // Axial view - circular cross-section
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.arc(0, 0, imageSize * 0.4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Mock organs
      ctx.fillStyle = '#777';
      ctx.beginPath();
      ctx.arc(-30, -20, 25, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(30, -20, 25, 0, 2 * Math.PI);
      ctx.fill();
    } else if (plane === 'coronal') {
      // Coronal view - frontal cross-section
      ctx.fillStyle = '#555';
      ctx.fillRect(-imageSize * 0.4, -imageSize * 0.4, imageSize * 0.8, imageSize * 0.6);
      
      // Mock spine
      ctx.fillStyle = '#888';
      ctx.fillRect(-10, -imageSize * 0.4, 20, imageSize * 0.6);
    } else if (plane === 'sagittal') {
      // Sagittal view - side cross-section
      ctx.fillStyle = '#555';
      ctx.fillRect(-imageSize * 0.3, -imageSize * 0.4, imageSize * 0.6, imageSize * 0.8);
      
      // Mock brain/skull
      ctx.fillStyle = '#666';
      ctx.beginPath();
      ctx.arc(0, -imageSize * 0.2, imageSize * 0.25, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    ctx.restore();
    
    // Draw crosshairs
    if (mprState.crosshairs.enabled) {
      const { position, color, thickness } = mprState.crosshairs;
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      
      let crossX = canvas.width / 2;
      let crossY = canvas.height / 2;
      
      if (plane === 'axial') {
        crossX = (position.x / 256) * canvas.width;
        crossY = (position.y / 256) * canvas.height;
      } else if (plane === 'coronal') {
        crossX = (position.x / 256) * canvas.width;
        crossY = (position.z / 256) * canvas.height;
      } else if (plane === 'sagittal') {
        crossX = (position.y / 256) * canvas.width;
        crossY = (position.z / 256) * canvas.height;
      }
      
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, crossY);
      ctx.lineTo(canvas.width, crossY);
      ctx.stroke();
      
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(crossX, 0);
      ctx.lineTo(crossX, canvas.height);
      ctx.stroke();
    }
    
    // Draw measurements
    mprState.measurements.forEach(measurement => {
      if (measurement.plane === plane && measurement.slice === slice) {
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(measurement.coordinates[0].x, measurement.coordinates[0].y);
        for (let i = 1; i < measurement.coordinates.length; i++) {
          ctx.lineTo(measurement.coordinates[i].x, measurement.coordinates[i].y);
        }
        ctx.stroke();
        
        // Draw measurement text
        ctx.fillStyle = '#0ea5e9';
        ctx.font = '12px sans-serif';
        ctx.fillText(`${measurement.value.toFixed(1)} ${measurement.unit}`, 
                    measurement.coordinates[0].x + 5, measurement.coordinates[0].y - 5);
      }
    });
    
    // Draw annotations
    mprState.annotations.forEach(annotation => {
      if (annotation.plane === plane && annotation.slice === slice) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = '14px sans-serif';
        ctx.fillText(annotation.text || '', annotation.position.x, annotation.position.y);
      }
    });
    
    // Draw plane info overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, 5, 150, 80);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${plane.toUpperCase()} View`, 10, 25);
    ctx.fillText(`Slice: ${slice}/${mprState.imageData[plane].sliceCount}`, 10, 45);
    ctx.fillText(`W/L: ${windowWidth}/${windowLevel}`, 10, 65);
    ctx.fillText(`Zoom: ${(zoom * 100).toFixed(0)}%`, 10, 85);
    
  }, [mprState]);

  // Render all planes when state changes
  useEffect(() => {
    if (axialCanvasRef.current) renderPlane(axialCanvasRef.current, 'axial');
    if (coronalCanvasRef.current) renderPlane(coronalCanvasRef.current, 'coronal');
    if (sagittalCanvasRef.current) renderPlane(sagittalCanvasRef.current, 'sagittal');
  }, [mprState, renderPlane]);

  // Cleanup playback interval
  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);

  const handleCanvasClick = useCallback((plane: 'axial' | 'coronal' | 'sagittal', event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (selectedTool === 'crosshair') {
      handleCrosshairClick(plane, x, y);
    } else if (selectedTool === 'measurement') {
      // Handle measurement tool
      if (!isDrawing) {
        setCurrentDrawing([{ x, y }]);
        setIsDrawing(true);
      } else {
        const newMeasurement = {
          id: `meas_${Date.now()}`,
          plane,
          type: 'length' as const,
          coordinates: [...currentDrawing, { x, y }],
          value: Math.sqrt(Math.pow(x - currentDrawing[0].x, 2) + Math.pow(y - currentDrawing[0].y, 2)) * mprState.imageData.spacing.x,
          unit: 'mm',
          slice: mprState.planes[plane].slice
        };
        
        setMPRState(prev => ({
          ...prev,
          measurements: [...prev.measurements, newMeasurement]
        }));
        
        onMeasurement?.(newMeasurement);
        setIsDrawing(false);
        setCurrentDrawing([]);
      }
    }
  }, [selectedTool, isDrawing, currentDrawing, mprState.planes, mprState.imageData.spacing, handleCrosshairClick, onMeasurement]);

  return (
    <div className={`relative h-full bg-black ${className}`}>
      {/* MPR Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 medsight-control-glass p-4 rounded-lg max-w-sm z-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">MPR Controls</h3>
            <button
              onClick={() => setShowControls(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Active Plane */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Active Plane</label>
              <div className="flex gap-1">
                {(['axial', 'coronal', 'sagittal'] as const).map(plane => (
                  <button
                    key={plane}
                    onClick={() => setActivePlane(plane)}
                    className={`btn-medsight text-xs px-2 py-1 flex-1 ${
                      activePlane === plane ? 'bg-medsight-primary/20' : ''
                    }`}
                  >
                    {plane.charAt(0).toUpperCase() + plane.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Navigation</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlaneNavigation(activePlane, 'prev')}
                  className="btn-medsight"
                >
                  <BackwardIcon className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-600 flex-1 text-center">
                  {mprState.planes[activePlane].slice + 1} / {mprState.imageData[activePlane].sliceCount}
                </span>
                <button
                  onClick={() => handlePlaneNavigation(activePlane, 'next')}
                  className="btn-medsight"
                >
                  <ForwardIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tools */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tools</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedTool('crosshair')}
                  className={`btn-medsight text-xs px-2 py-1 flex-1 ${
                    selectedTool === 'crosshair' ? 'bg-medsight-primary/20' : ''
                  }`}
                >
                  <CursorArrowRaysIcon className="w-3 h-3 mr-1" />
                  Crosshair
                </button>
                <button
                  onClick={() => setSelectedTool('measurement')}
                  className={`btn-medsight text-xs px-2 py-1 flex-1 ${
                    selectedTool === 'measurement' ? 'bg-medsight-primary/20' : ''
                  }`}
                >
                  <BeakerIcon className="w-3 h-3 mr-1" />
                  Measure
                </button>
              </div>
            </div>

            {/* Zoom Controls */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Zoom</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleZoom(activePlane, 0.8)}
                  className="btn-medsight"
                >
                  <ArrowsPointingInIcon className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-600 flex-1 text-center">
                  {(mprState.planes[activePlane].zoom * 100).toFixed(0)}%
                </span>
                <button
                  onClick={() => handleZoom(activePlane, 1.25)}
                  className="btn-medsight"
                >
                  <ArrowsPointingOutIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Window Presets */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Window Preset</label>
              <select
                value={mprState.presets.current}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full input-medsight text-xs"
              >
                {windowPresets.map(preset => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Synchronization */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Synchronization</label>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={mprState.synchronization.enabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setMPRState(prev => ({
                        ...prev,
                        synchronization: { ...prev.synchronization, enabled }
                      }));
                      onSynchronization?.(enabled);
                    }}
                    className="rounded border-gray-300 text-medsight-primary"
                  />
                  <span className="text-xs text-gray-700">Enable Sync</span>
                </label>
                {mprState.synchronization.enabled && (
                  <div className="pl-4 space-y-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={mprState.synchronization.windowLevel}
                        onChange={(e) => setMPRState(prev => ({
                          ...prev,
                          synchronization: { ...prev.synchronization, windowLevel: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-medsight-primary"
                      />
                      <span className="text-xs text-gray-700">Window/Level</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={mprState.synchronization.zoom}
                        onChange={(e) => setMPRState(prev => ({
                          ...prev,
                          synchronization: { ...prev.synchronization, zoom: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-medsight-primary"
                      />
                      <span className="text-xs text-gray-700">Zoom</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              <button onClick={handleReset} className="btn-medsight flex-1 text-xs">
                <ArrowPathIcon className="w-3 h-3 mr-1" />
                Reset
              </button>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="btn-medsight flex-1 text-xs"
              >
                <Cog6ToothIcon className="w-3 h-3 mr-1" />
                Advanced
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playback Controls */}
      <div className="absolute bottom-4 left-4 medsight-control-glass p-3 rounded-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handlePlayback(!mprState.playback.isPlaying)}
            className="btn-medsight"
          >
            {mprState.playback.isPlaying ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
          </button>
          
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Speed:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={mprState.playback.speed}
              onChange={(e) => setMPRState(prev => ({
                ...prev,
                playback: { ...prev.playback, speed: parseInt(e.target.value) }
              }))}
              className="w-20"
            />
            <span className="text-xs text-gray-600 w-8">
              {mprState.playback.speed}fps
            </span>
          </div>
          
          <select
            value={mprState.playback.activePane}
            onChange={(e) => setMPRState(prev => ({
              ...prev,
              playback: { ...prev.playback, activePane: e.target.value as any }
            }))}
            className="input-medsight text-xs"
          >
            <option value="all">All Planes</option>
            <option value="axial">Axial Only</option>
            <option value="coronal">Coronal Only</option>
            <option value="sagittal">Sagittal Only</option>
          </select>
          
          <button
            onClick={() => setMPRState(prev => ({
              ...prev,
              playback: { 
                ...prev.playback, 
                direction: prev.playback.direction === 'forward' ? 'backward' : 'forward' 
              }
            }))}
            className="btn-medsight"
            title={`Direction: ${mprState.playback.direction}`}
          >
            {mprState.playback.direction === 'forward' ? (
              <ArrowRightIcon className="w-4 h-4" />
            ) : (
              <ArrowLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main MPR View */}
      <div className="h-full grid grid-cols-2 grid-rows-2 gap-1">
        {/* Axial View */}
        <div className="relative border border-gray-600">
          <canvas
            ref={axialCanvasRef}
            width={400}
            height={400}
            className="w-full h-full cursor-crosshair"
            onClick={(e) => handleCanvasClick('axial', e)}
          />
          <div className="absolute top-2 left-2 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
            Axial
          </div>
          <div className="absolute top-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
            {mprState.planes.axial.slice + 1} / {mprState.imageData.axial.sliceCount}
          </div>
        </div>

        {/* Coronal View */}
        <div className="relative border border-gray-600">
          <canvas
            ref={coronalCanvasRef}
            width={400}
            height={400}
            className="w-full h-full cursor-crosshair"
            onClick={(e) => handleCanvasClick('coronal', e)}
          />
          <div className="absolute top-2 left-2 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
            Coronal
          </div>
          <div className="absolute top-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
            {mprState.planes.coronal.slice + 1} / {mprState.imageData.coronal.sliceCount}
          </div>
        </div>

        {/* Sagittal View */}
        <div className="relative border border-gray-600">
          <canvas
            ref={sagittalCanvasRef}
            width={400}
            height={400}
            className="w-full h-full cursor-crosshair"
            onClick={(e) => handleCanvasClick('sagittal', e)}
          />
          <div className="absolute top-2 left-2 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
            Sagittal
          </div>
          <div className="absolute top-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
            {mprState.planes.sagittal.slice + 1} / {mprState.imageData.sagittal.sliceCount}
          </div>
        </div>

        {/* Information Panel */}
        <div className="medsight-control-glass p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">MPR Information</h3>
          
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Crosshair Position:</span>
              <span className="font-mono">
                ({mprState.crosshairs.position.x}, {mprState.crosshairs.position.y}, {mprState.crosshairs.position.z})
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pixel Spacing:</span>
              <span className="font-mono">
                {mprState.imageData.spacing.x} × {mprState.imageData.spacing.y} × {mprState.imageData.spacing.z} mm
              </span>
            </div>
            <div className="flex justify-between">
              <span>Active Tool:</span>
              <span className="capitalize">{selectedTool}</span>
            </div>
            <div className="flex justify-between">
              <span>Synchronization:</span>
              <span className={mprState.synchronization.enabled ? 'text-medsight-normal' : 'text-gray-500'}>
                {mprState.synchronization.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Measurements:</span>
              <span>{mprState.measurements.length}</span>
            </div>
          </div>

          {/* Crosshair Controls */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Crosshair Settings</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mprState.crosshairs.enabled}
                  onChange={(e) => setMPRState(prev => ({
                    ...prev,
                    crosshairs: { ...prev.crosshairs, enabled: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-medsight-primary"
                />
                <span className="text-xs text-gray-700">Show Crosshairs</span>
              </label>
              
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-700">Color:</label>
                <input
                  type="color"
                  value={mprState.crosshairs.color}
                  onChange={(e) => setMPRState(prev => ({
                    ...prev,
                    crosshairs: { ...prev.crosshairs, color: e.target.value }
                  }))}
                  className="w-8 h-6 rounded border border-gray-300"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-700">Thickness:</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={mprState.crosshairs.thickness}
                  onChange={(e) => setMPRState(prev => ({
                    ...prev,
                    crosshairs: { ...prev.crosshairs, thickness: parseInt(e.target.value) }
                  }))}
                  className="flex-1"
                />
                <span className="text-xs text-gray-600 w-4">{mprState.crosshairs.thickness}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Mode Indicator */}
      {emergencyMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-medsight-critical/20 border border-medsight-critical text-medsight-critical px-3 py-1 rounded-lg text-sm font-medium z-20">
          <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
          Emergency Mode Active
        </div>
      )}

      {/* Collaboration Indicator */}
      {collaborationMode && (
        <div className="absolute bottom-4 right-4 medsight-control-glass p-2 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <UserGroupIcon className="w-4 h-4 text-medsight-primary" />
            <span className="text-gray-600">Collaborative MPR</span>
          </div>
        </div>
      )}

      {/* Collapsed Controls Toggle */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-4 left-4 medsight-control-glass p-2 rounded-lg z-10"
        >
          <RectangleGroupIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
} 