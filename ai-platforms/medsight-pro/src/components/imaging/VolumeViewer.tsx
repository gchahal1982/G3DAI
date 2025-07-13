'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  EyeIcon,
  Cog6ToothIcon,
  SparklesIcon,
  BoltIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PhotoIcon,
  SunIcon,
  MoonIcon,
  LightBulbIcon,
  ChartBarIcon,
  Square3Stack3DIcon,
  CircleStackIcon,
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
  FireIcon,
  EyeSlashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline';

interface VolumeViewerProps {
  studyId?: string;
  className?: string;
  onVolumeChange?: (volume: any) => void;
  onRenderingChange?: (settings: any) => void;
  showStatistics?: boolean;
  showAnimationControls?: boolean;
  emergencyMode?: boolean;
  collaborationMode?: boolean;
}

interface VolumeState {
  renderingMode: 'volume' | 'mip' | 'minip' | 'surface' | 'isosurface' | 'hybrid';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  samples: number;
  stepSize: number;
  opacity: number;
  isosurfaceThreshold: number;
  surfaceThreshold: number;
  gradientThreshold: number;
  shadows: boolean;
  ambient: number;
  diffuse: number;
  specular: number;
  shininess: number;
  lightPosition: { x: number; y: number; z: number };
  lightColor: { r: number; g: number; b: number };
  lightIntensity: number;
  backgroundColor: { r: number; g: number; b: number };
  clipPlanes: {
    enabled: boolean;
    x: { min: number; max: number; enabled: boolean };
    y: { min: number; max: number; enabled: boolean };
    z: { min: number; max: number; enabled: boolean };
  };
  transferFunction: {
    points: Array<{ value: number; opacity: number; color: { r: number; g: number; b: number } }>;
    colormap: 'grayscale' | 'jet' | 'hot' | 'cool' | 'rainbow' | 'medical';
  };
  animation: {
    enabled: boolean;
    speed: number;
    axis: 'x' | 'y' | 'z';
    direction: 'forward' | 'backward' | 'bounce';
    currentAngle: number;
  };
  camera: {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
    up: { x: number; y: number; z: number };
    fov: number;
    near: number;
    far: number;
  };
  volumeData: {
    dimensions: { width: number; height: number; depth: number };
    spacing: { x: number; y: number; z: number };
    origin: { x: number; y: number; z: number };
    dataType: 'uint8' | 'uint16' | 'float32';
    minValue: number;
    maxValue: number;
    histogram: number[];
  };
}

interface RenderingStats {
  fps: number;
  renderTime: number;
  gpuMemory: number;
  triangles: number;
  vertices: number;
  raysCast: number;
  samplesPerRay: number;
  totalSamples: number;
  quality: string;
  renderingMode: string;
}

interface VolumePreset {
  name: string;
  description: string;
  renderingMode: VolumeState['renderingMode'];
  opacity: number;
  transferFunction: VolumeState['transferFunction'];
  lighting: {
    ambient: number;
    diffuse: number;
    specular: number;
  };
  clipPlanes?: Partial<VolumeState['clipPlanes']>;
}

export default function VolumeViewer({
  studyId,
  className = '',
  onVolumeChange,
  onRenderingChange,
  showStatistics = true,
  showAnimationControls = true,
  emergencyMode = false,
  collaborationMode = false
}: VolumeViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [volumeState, setVolumeState] = useState<VolumeState>({
    renderingMode: 'volume',
    quality: 'medium',
    samples: 256,
    stepSize: 1.0,
    opacity: 0.8,
    isosurfaceThreshold: 0.5,
    surfaceThreshold: 0.3,
    gradientThreshold: 0.1,
    shadows: true,
    ambient: 0.2,
    diffuse: 0.8,
    specular: 0.4,
    shininess: 16,
    lightPosition: { x: 1, y: 1, z: 1 },
    lightColor: { r: 1, g: 1, b: 1 },
    lightIntensity: 1.0,
    backgroundColor: { r: 0, g: 0, b: 0 },
    clipPlanes: {
      enabled: false,
      x: { min: 0, max: 1, enabled: false },
      y: { min: 0, max: 1, enabled: false },
      z: { min: 0, max: 1, enabled: false }
    },
    transferFunction: {
      points: [
        { value: 0.0, opacity: 0.0, color: { r: 0, g: 0, b: 0 } },
        { value: 0.3, opacity: 0.2, color: { r: 0.5, g: 0.2, b: 0.2 } },
        { value: 0.6, opacity: 0.8, color: { r: 1, g: 0.8, b: 0.8 } },
        { value: 1.0, opacity: 1.0, color: { r: 1, g: 1, b: 1 } }
      ],
      colormap: 'medical'
    },
    animation: {
      enabled: false,
      speed: 1.0,
      axis: 'y',
      direction: 'forward',
      currentAngle: 0
    },
    camera: {
      position: { x: 0, y: 0, z: 5 },
      target: { x: 0, y: 0, z: 0 },
      up: { x: 0, y: 1, z: 0 },
      fov: 45,
      near: 0.1,
      far: 100
    },
    volumeData: {
      dimensions: { width: 256, height: 256, depth: 256 },
      spacing: { x: 1.0, y: 1.0, z: 1.0 },
      origin: { x: 0, y: 0, z: 0 },
      dataType: 'uint16',
      minValue: 0,
      maxValue: 4095,
      histogram: new Array(256).fill(0).map(() => Math.random() * 100)
    }
  });

  const [renderingStats, setRenderingStats] = useState<RenderingStats>({
    fps: 60,
    renderTime: 16.7,
    gpuMemory: 512,
    triangles: 0,
    vertices: 0,
    raysCast: 524288,
    samplesPerRay: 256,
    totalSamples: 134217728,
    quality: 'Medium',
    renderingMode: 'Volume Rendering'
  });

  const [showControls, setShowControls] = useState(true);
  const [showLighting, setShowLighting] = useState(false);
  const [showTransferFunction, setShowTransferFunction] = useState(false);
  const [showClipping, setShowClipping] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('default');

  const volumePresets: VolumePreset[] = [
    {
      name: 'Default',
      description: 'Balanced volume rendering',
      renderingMode: 'volume',
      opacity: 0.8,
      transferFunction: {
        points: [
          { value: 0.0, opacity: 0.0, color: { r: 0, g: 0, b: 0 } },
          { value: 0.3, opacity: 0.2, color: { r: 0.5, g: 0.2, b: 0.2 } },
          { value: 0.6, opacity: 0.8, color: { r: 1, g: 0.8, b: 0.8 } },
          { value: 1.0, opacity: 1.0, color: { r: 1, g: 1, b: 1 } }
        ],
        colormap: 'medical'
      },
      lighting: { ambient: 0.2, diffuse: 0.8, specular: 0.4 }
    },
    {
      name: 'Bone',
      description: 'Optimized for bone visualization',
      renderingMode: 'volume',
      opacity: 0.9,
      transferFunction: {
        points: [
          { value: 0.0, opacity: 0.0, color: { r: 0, g: 0, b: 0 } },
          { value: 0.5, opacity: 0.1, color: { r: 0.8, g: 0.6, b: 0.4 } },
          { value: 0.8, opacity: 0.9, color: { r: 1, g: 0.9, b: 0.8 } },
          { value: 1.0, opacity: 1.0, color: { r: 1, g: 1, b: 1 } }
        ],
        colormap: 'medical'
      },
      lighting: { ambient: 0.1, diffuse: 0.9, specular: 0.6 }
    },
    {
      name: 'Soft Tissue',
      description: 'Optimized for soft tissue contrast',
      renderingMode: 'volume',
      opacity: 0.7,
      transferFunction: {
        points: [
          { value: 0.0, opacity: 0.0, color: { r: 0, g: 0, b: 0 } },
          { value: 0.2, opacity: 0.3, color: { r: 0.8, g: 0.4, b: 0.4 } },
          { value: 0.4, opacity: 0.6, color: { r: 1, g: 0.6, b: 0.6 } },
          { value: 1.0, opacity: 0.8, color: { r: 1, g: 0.8, b: 0.8 } }
        ],
        colormap: 'medical'
      },
      lighting: { ambient: 0.3, diffuse: 0.7, specular: 0.2 }
    },
    {
      name: 'Vascular',
      description: 'Optimized for blood vessels',
      renderingMode: 'mip',
      opacity: 1.0,
      transferFunction: {
        points: [
          { value: 0.0, opacity: 0.0, color: { r: 0, g: 0, b: 0 } },
          { value: 0.3, opacity: 0.2, color: { r: 0.8, g: 0.2, b: 0.2 } },
          { value: 0.7, opacity: 0.8, color: { r: 1, g: 0.4, b: 0.4 } },
          { value: 1.0, opacity: 1.0, color: { r: 1, g: 0.8, b: 0.8 } }
        ],
        colormap: 'hot'
      },
      lighting: { ambient: 0.1, diffuse: 0.8, specular: 0.5 }
    },
    {
      name: 'Transparent',
      description: 'High transparency for internal structures',
      renderingMode: 'volume',
      opacity: 0.3,
      transferFunction: {
        points: [
          { value: 0.0, opacity: 0.0, color: { r: 0, g: 0, b: 0 } },
          { value: 0.5, opacity: 0.1, color: { r: 0.5, g: 0.5, b: 1 } },
          { value: 0.8, opacity: 0.3, color: { r: 0.8, g: 0.8, b: 1 } },
          { value: 1.0, opacity: 0.5, color: { r: 1, g: 1, b: 1 } }
        ],
        colormap: 'cool'
      },
      lighting: { ambient: 0.4, diffuse: 0.6, specular: 0.1 }
    }
  ];

  const handleRenderingModeChange = useCallback((mode: VolumeState['renderingMode']) => {
    setVolumeState(prev => ({ ...prev, renderingMode: mode }));
    onRenderingChange?.({ renderingMode: mode });
  }, [onRenderingChange]);

  const handleQualityChange = useCallback((quality: VolumeState['quality']) => {
    const sampleCounts = { low: 128, medium: 256, high: 512, ultra: 1024 };
    setVolumeState(prev => ({ 
      ...prev, 
      quality, 
      samples: sampleCounts[quality] 
    }));
    onRenderingChange?.({ quality });
  }, [onRenderingChange]);

  const handleOpacityChange = useCallback((opacity: number) => {
    setVolumeState(prev => ({ ...prev, opacity }));
    onRenderingChange?.({ opacity });
  }, [onRenderingChange]);

  const handleLightingChange = useCallback((property: string, value: number) => {
    setVolumeState(prev => ({ ...prev, [property]: value }));
    onRenderingChange?.({ [property]: value });
  }, [onRenderingChange]);

  const handleAnimationToggle = useCallback(() => {
    setVolumeState(prev => ({ 
      ...prev, 
      animation: { ...prev.animation, enabled: !prev.animation.enabled }
    }));
  }, []);

  const handleAnimationSpeedChange = useCallback((speed: number) => {
    setVolumeState(prev => ({ 
      ...prev, 
      animation: { ...prev.animation, speed }
    }));
  }, []);

  const handlePresetChange = useCallback((presetName: string) => {
    const preset = volumePresets.find(p => p.name === presetName);
    if (preset) {
      setVolumeState(prev => ({
        ...prev,
        renderingMode: preset.renderingMode,
        opacity: preset.opacity,
        transferFunction: preset.transferFunction,
        ambient: preset.lighting.ambient,
        diffuse: preset.lighting.diffuse,
        specular: preset.lighting.specular
      }));
      setSelectedPreset(presetName);
      onRenderingChange?.(preset);
    }
  }, [onRenderingChange]);

  const handleClipPlaneChange = useCallback((axis: 'x' | 'y' | 'z', property: 'min' | 'max', value: number) => {
    setVolumeState(prev => ({
      ...prev,
      clipPlanes: {
        ...prev.clipPlanes,
        [axis]: { ...prev.clipPlanes[axis], [property]: value }
      }
    }));
  }, []);

  const handleReset = useCallback(() => {
    setVolumeState(prev => ({
      ...prev,
      camera: {
        position: { x: 0, y: 0, z: 5 },
        target: { x: 0, y: 0, z: 0 },
        up: { x: 0, y: 1, z: 0 },
        fov: 45,
        near: 0.1,
        far: 100
      },
      animation: { ...prev.animation, currentAngle: 0 }
    }));
  }, []);

  // Animation loop
  useEffect(() => {
    if (volumeState.animation.enabled) {
      const animate = () => {
        setVolumeState(prev => ({
          ...prev,
          animation: {
            ...prev.animation,
            currentAngle: (prev.animation.currentAngle + prev.animation.speed) % 360
          }
        }));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [volumeState.animation.enabled, volumeState.animation.speed]);

  // Mock rendering stats update
  useEffect(() => {
    const updateStats = () => {
      setRenderingStats(prev => ({
        ...prev,
        fps: Math.floor(Math.random() * 20 + 50),
        renderTime: Math.random() * 5 + 12,
        raysCast: volumeState.samples * 2048,
        samplesPerRay: volumeState.samples,
        totalSamples: volumeState.samples * 2048 * volumeState.samples,
        quality: volumeState.quality.charAt(0).toUpperCase() + volumeState.quality.slice(1),
        renderingMode: volumeState.renderingMode.toUpperCase()
      }));
    };

    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [volumeState.samples, volumeState.quality, volumeState.renderingMode]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsRendering(true);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgb(${volumeState.backgroundColor.r * 255}, ${volumeState.backgroundColor.g * 255}, ${volumeState.backgroundColor.b * 255})`);
    gradient.addColorStop(1, `rgb(${volumeState.backgroundColor.r * 128}, ${volumeState.backgroundColor.g * 128}, ${volumeState.backgroundColor.b * 128})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw mock 3D volume
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = 200;
    const angle = (volumeState.animation.currentAngle * Math.PI) / 180;

    // Draw volume based on rendering mode
    if (volumeState.renderingMode === 'volume') {
      // Volume rendering simulation
      for (let i = 0; i < 20; i++) {
        const alpha = volumeState.opacity * (1 - i / 20);
        const layerSize = size - i * 5;
        
        ctx.globalAlpha = alpha * 0.1;
        ctx.fillStyle = `hsl(${240 + i * 5}, 70%, ${50 + i * 2}%)`;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.fillRect(-layerSize / 2, -layerSize / 2, layerSize, layerSize);
        ctx.restore();
      }
    } else if (volumeState.renderingMode === 'mip') {
      // Maximum Intensity Projection
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#ff6b6b';
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      
      // Draw vessels/structures
      for (let i = 0; i < 5; i++) {
        const radius = 20 + i * 10;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(255, 107, 107, ${1 - i * 0.2})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      
      ctx.restore();
    } else if (volumeState.renderingMode === 'surface') {
      // Surface rendering
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#4ecdc4';
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      
      // Draw surface mesh
      const gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
      gradient.addColorStop(0, '#4ecdc4');
      gradient.addColorStop(1, '#44a08d');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(-size/2, -size/2, size, size);
      
      // Add mesh lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let i = -size/2; i <= size/2; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, -size/2);
        ctx.lineTo(i, size/2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-size/2, i);
        ctx.lineTo(size/2, i);
        ctx.stroke();
      }
      
      ctx.restore();
    }

    ctx.globalAlpha = 1.0;

    // Draw coordinate axes
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, canvas.height - 50);
    ctx.lineTo(100, canvas.height - 50); // X axis
    ctx.moveTo(50, canvas.height - 50);
    ctx.lineTo(50, canvas.height - 100); // Y axis
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText('X', 105, canvas.height - 45);
    ctx.fillText('Y', 45, canvas.height - 105);

    setTimeout(() => setIsRendering(false), 100);
  }, [volumeState, volumeState.animation.currentAngle]);

  return (
    <div className={`relative h-full bg-black ${className}`}>
      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
      />

      {/* Volume Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 medsight-control-glass p-4 rounded-lg max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Volume Rendering</h3>
            <button
              onClick={() => setShowControls(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Rendering Mode */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rendering Mode</label>
              <select
                value={volumeState.renderingMode}
                onChange={(e) => handleRenderingModeChange(e.target.value as VolumeState['renderingMode'])}
                className="w-full input-medsight text-xs"
              >
                <option value="volume">Volume Rendering</option>
                <option value="mip">Maximum Intensity Projection</option>
                <option value="minip">Minimum Intensity Projection</option>
                <option value="surface">Surface Rendering</option>
                <option value="isosurface">Isosurface</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quality</label>
              <select
                value={volumeState.quality}
                onChange={(e) => handleQualityChange(e.target.value as VolumeState['quality'])}
                className="w-full input-medsight text-xs"
              >
                <option value="low">Low (128 samples)</option>
                <option value="medium">Medium (256 samples)</option>
                <option value="high">High (512 samples)</option>
                <option value="ultra">Ultra (1024 samples)</option>
              </select>
            </div>

            {/* Opacity */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Opacity: {(volumeState.opacity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumeState.opacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Presets</label>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full input-medsight text-xs"
              >
                {volumePresets.map(preset => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowLighting(!showLighting)}
                className="btn-medsight flex-1 text-xs"
              >
                <LightBulbIcon className="w-3 h-3 mr-1" />
                Lighting
              </button>
              <button
                onClick={() => setShowTransferFunction(!showTransferFunction)}
                className="btn-medsight flex-1 text-xs"
              >
                <ChartBarIcon className="w-3 h-3 mr-1" />
                Transfer
              </button>
              <button
                onClick={() => setShowClipping(!showClipping)}
                className="btn-medsight flex-1 text-xs"
              >
                <CubeIcon className="w-3 h-3 mr-1" />
                Clipping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lighting Controls */}
      {showLighting && (
        <div className="absolute top-4 left-80 medsight-control-glass p-4 rounded-lg max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Lighting</h3>
            <button
              onClick={() => setShowLighting(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Ambient: {(volumeState.ambient * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumeState.ambient}
                onChange={(e) => handleLightingChange('ambient', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Diffuse: {(volumeState.diffuse * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumeState.diffuse}
                onChange={(e) => handleLightingChange('diffuse', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Specular: {(volumeState.specular * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumeState.specular}
                onChange={(e) => handleLightingChange('specular', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Light Intensity: {(volumeState.lightIntensity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={volumeState.lightIntensity}
                onChange={(e) => handleLightingChange('lightIntensity', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={volumeState.shadows}
                onChange={(e) => setVolumeState(prev => ({ ...prev, shadows: e.target.checked }))}
                className="rounded border-gray-300 text-medsight-primary"
              />
              <label className="text-xs text-gray-700">Enable Shadows</label>
            </div>
          </div>
        </div>
      )}

      {/* Animation Controls */}
      {showAnimationControls && (
        <div className="absolute bottom-4 left-4 medsight-control-glass p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAnimationToggle}
              className="btn-medsight"
            >
              {volumeState.animation.enabled ? (
                <PauseIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
            </button>
            
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Speed:</label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={volumeState.animation.speed}
                onChange={(e) => handleAnimationSpeedChange(parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-gray-600 w-8">
                {volumeState.animation.speed.toFixed(1)}x
              </span>
            </div>
            
            <select
              value={volumeState.animation.axis}
              onChange={(e) => setVolumeState(prev => ({ 
                ...prev, 
                animation: { ...prev.animation, axis: e.target.value as 'x' | 'y' | 'z' }
              }))}
              className="input-medsight text-xs"
            >
              <option value="x">X-axis</option>
              <option value="y">Y-axis</option>
              <option value="z">Z-axis</option>
            </select>
            
            <button onClick={handleReset} className="btn-medsight">
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Rendering Statistics */}
      {showStatistics && (
        <div className="absolute top-4 right-4 medsight-control-glass p-3 rounded-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <CpuChipIcon className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm font-medium text-gray-900">Rendering Stats</span>
          </div>
          
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>FPS:</span>
              <span className="font-mono">{renderingStats.fps}</span>
            </div>
            <div className="flex justify-between">
              <span>Render Time:</span>
              <span className="font-mono">{renderingStats.renderTime.toFixed(1)}ms</span>
            </div>
            <div className="flex justify-between">
              <span>GPU Memory:</span>
              <span className="font-mono">{renderingStats.gpuMemory}MB</span>
            </div>
            <div className="flex justify-between">
              <span>Rays Cast:</span>
              <span className="font-mono">{renderingStats.raysCast.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Samples/Ray:</span>
              <span className="font-mono">{renderingStats.samplesPerRay}</span>
            </div>
            <div className="flex justify-between">
              <span>Quality:</span>
              <span className="font-mono">{renderingStats.quality}</span>
            </div>
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className="font-mono">{renderingStats.renderingMode}</span>
            </div>
          </div>
        </div>
      )}

      {/* Rendering Indicator */}
      {isRendering && (
        <div className="absolute bottom-4 right-4 medsight-control-glass p-2 rounded-lg">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-medsight-primary animate-spin" />
            <span className="text-xs text-gray-600">Rendering...</span>
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
        <div className="absolute bottom-4 center-4 medsight-control-glass p-2 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <UserGroupIcon className="w-4 h-4 text-medsight-primary" />
            <span className="text-gray-600">Collaborative Session</span>
          </div>
        </div>
      )}

      {/* Collapsed Controls Toggle */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-4 left-4 medsight-control-glass p-2 rounded-lg"
        >
          <CubeIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
} 