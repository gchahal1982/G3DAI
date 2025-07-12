'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  AdjustmentsHorizontalIcon,
  SunIcon,
  MoonIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  Square3Stack3DIcon,
  SwatchIcon,
  PaintBrushIcon,
  SparklesIcon,
  PhotoIcon,
  FilmIcon,
  CogIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  BeakerIcon,
  HeartIcon,
  CpuChipIcon,
  AcademicCapIcon,
  LightBulbIcon,
  FireIcon,
  BoltIcon,
  StarIcon,
  GlobeAltIcon,
  ChartBarIcon,
  Squares2X2Icon,
  RectangleStackIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  DocumentTextIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  SunIcon as SunIconSolid,
  MoonIcon as MoonIconSolid,
  EyeIcon as EyeIconSolid,
  PlayIcon as PlayIconSolid,
  PauseIcon as PauseIconSolid
} from '@heroicons/react/24/solid';
import React from 'react';

interface ImageSettings {
  windowLevel: number;
  windowWidth: number;
  brightness: number;
  contrast: number;
  gamma: number;
  zoom: number;
  rotation: number;
  pan: { x: number; y: number };
  flip: { horizontal: boolean; vertical: boolean };
  invert: boolean;
  interpolation: 'nearest' | 'linear' | 'cubic';
  colormap: string;
  opacity: number;
  sharpness: number;
  smoothing: number;
  threshold: number;
  saturation: number;
  hue: number;
  exposure: number;
  highlights: number;
  shadows: number;
  clarity: number;
  vibrance: number;
  temperature: number;
  tint: number;
}

interface ImagePreset {
  id: string;
  name: string;
  description: string;
  icon?: any;
  category: 'medical' | 'enhancement' | 'analysis' | 'custom';
  settings: Partial<ImageSettings>;
  modalities?: string[];
}

interface ImageControlsProps {
  settings: ImageSettings;
  onSettingsChange: (settings: Partial<ImageSettings>) => void;
  onPresetApply?: (preset: ImagePreset) => void;
  onReset?: () => void;
  onExport?: () => void;
  modality?: string;
  className?: string;
  compact?: boolean;
  showPresets?: boolean;
  showAdvanced?: boolean;
  readOnly?: boolean;
  enableAnimation?: boolean;
}

export default function ImageControls({
  settings,
  onSettingsChange,
  onPresetApply,
  onReset,
  onExport,
  modality = 'CT',
  className = '',
  compact = false,
  showPresets = true,
  showAdvanced = true,
  readOnly = false,
  enableAnimation = true
}: ImageControlsProps) {
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [showPresetsPanel, setShowPresetsPanel] = useState(false);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [animationRange, setAnimationRange] = useState({ min: -100, max: 100 });
  const [customPresets, setCustomPresets] = useState<ImagePreset[]>([]);

  const tabs = [
    { id: 'basic', name: 'Basic', icon: AdjustmentsHorizontalIcon },
    { id: 'enhancement', name: 'Enhancement', icon: SparklesIcon },
    { id: 'transform', name: 'Transform', icon: ArrowPathIcon },
    { id: 'analysis', name: 'Analysis', icon: ChartBarIcon }
  ];

  const colormaps = [
    { id: 'grayscale', name: 'Grayscale', gradient: 'linear-gradient(to right, #000000, #ffffff)' },
    { id: 'hot', name: 'Hot', gradient: 'linear-gradient(to right, #000000, #ff0000, #ffff00, #ffffff)' },
    { id: 'cool', name: 'Cool', gradient: 'linear-gradient(to right, #00ffff, #ff00ff)' },
    { id: 'rainbow', name: 'Rainbow', gradient: 'linear-gradient(to right, #ff0000, #ff8000, #ffff00, #00ff00, #0000ff, #8000ff)' },
    { id: 'bone', name: 'Bone', gradient: 'linear-gradient(to right, #000000, #545474, #a8a8ba, #ffffff)' },
    { id: 'copper', name: 'Copper', gradient: 'linear-gradient(to right, #000000, #ff7f00, #ffbf80, #ffffff)' },
    { id: 'jet', name: 'Jet', gradient: 'linear-gradient(to right, #000080, #0000ff, #00ffff, #ffff00, #ff0000, #800000)' },
    { id: 'viridis', name: 'Viridis', gradient: 'linear-gradient(to right, #440154, #31688e, #35b779, #fde725)' }
  ];

  const medicalPresets: ImagePreset[] = [
    {
      id: 'ct_bone',
      name: 'CT Bone',
      description: 'Optimized for bone visualization',
      icon: AcademicCapIcon,
      category: 'medical',
      modalities: ['CT'],
      settings: {
        windowLevel: 400,
        windowWidth: 1000,
        brightness: 0,
        contrast: 20,
        gamma: 1.0
      }
    },
    {
      id: 'ct_soft_tissue',
      name: 'CT Soft Tissue',
      description: 'Optimized for soft tissue contrast',
      icon: HeartIcon,
      category: 'medical',
      modalities: ['CT'],
      settings: {
        windowLevel: 40,
        windowWidth: 400,
        brightness: 0,
        contrast: 0,
        gamma: 1.0
      }
    },
    {
      id: 'ct_lung',
      name: 'CT Lung',
      description: 'Optimized for lung parenchyma',
      icon: BeakerIcon,
      category: 'medical',
      modalities: ['CT'],
      settings: {
        windowLevel: -600,
        windowWidth: 1600,
        brightness: 0,
        contrast: 0,
        gamma: 1.0
      }
    },
    {
      id: 'ct_brain',
      name: 'CT Brain',
      description: 'Optimized for brain tissue',
      icon: CpuChipIcon,
      category: 'medical',
      modalities: ['CT'],
      settings: {
        windowLevel: 40,
        windowWidth: 80,
        brightness: 0,
        contrast: 10,
        gamma: 1.0
      }
    },
    {
      id: 'mri_t1',
      name: 'MRI T1',
      description: 'T1-weighted MRI optimization',
      icon: CpuChipIcon,
      category: 'medical',
      modalities: ['MRI'],
      settings: {
        windowLevel: 128,
        windowWidth: 256,
        brightness: 0,
        contrast: 15,
        gamma: 1.2
      }
    },
    {
      id: 'mri_t2',
      name: 'MRI T2',
      description: 'T2-weighted MRI optimization',
      icon: CpuChipIcon,
      category: 'medical',
      modalities: ['MRI'],
      settings: {
        windowLevel: 200,
        windowWidth: 400,
        brightness: 0,
        contrast: 10,
        gamma: 0.9
      }
    },
    {
      id: 'angio',
      name: 'Angiography',
      description: 'Vascular imaging optimization',
      icon: HeartIcon,
      category: 'medical',
      modalities: ['CT', 'MRI', 'XA'],
      settings: {
        windowLevel: 200,
        windowWidth: 600,
        brightness: 10,
        contrast: 25,
        gamma: 1.1,
        colormap: 'hot'
      }
    },
    {
      id: 'pet',
      name: 'PET Scan',
      description: 'PET metabolic imaging',
      icon: FireIcon,
      category: 'medical',
      modalities: ['PET'],
      settings: {
        windowLevel: 128,
        windowWidth: 256,
        brightness: 0,
        contrast: 20,
        gamma: 1.0,
        colormap: 'hot'
      }
    }
  ];

  const enhancementPresets: ImagePreset[] = [
    {
      id: 'enhance_contrast',
      name: 'High Contrast',
      description: 'Enhance image contrast',
      icon: SunIconSolid,
      category: 'enhancement',
      settings: {
        contrast: 30,
        clarity: 20,
        shadows: -15,
        highlights: -10
      }
    },
    {
      id: 'enhance_brightness',
      name: 'Brightness Boost',
      description: 'Increase overall brightness',
      icon: LightBulbIcon,
      category: 'enhancement',
      settings: {
        brightness: 25,
        exposure: 15,
        shadows: 10
      }
    },
    {
      id: 'enhance_sharpness',
      name: 'Sharp Detail',
      description: 'Enhance fine details',
      icon: StarIcon,
      category: 'enhancement',
      settings: {
        sharpness: 40,
        clarity: 30,
        smoothing: -10
      }
    },
    {
      id: 'enhance_smooth',
      name: 'Smooth Image',
      description: 'Reduce noise and artifacts',
      category: 'enhancement',
      settings: {
        smoothing: 30,
        sharpness: -10,
        threshold: 5
      }
    }
  ];

  const analysisPresets: ImagePreset[] = [
    {
      id: 'analysis_edge',
      name: 'Edge Detection',
      description: 'Enhance edges and boundaries',
      icon: Squares2X2Icon,
      category: 'analysis',
      settings: {
        sharpness: 50,
        contrast: 40,
        threshold: 20,
        colormap: 'hot'
      }
    },
    {
      id: 'analysis_threshold',
      name: 'Threshold Analysis',
      description: 'Binary threshold visualization',
      icon: ChartBarIcon,
      category: 'analysis',
      settings: {
        threshold: 30,
        contrast: 50,
        colormap: 'cool'
      }
    },
    {
      id: 'analysis_colormap',
      name: 'Color Mapping',
      description: 'False color visualization',
      icon: SwatchIcon,
      category: 'analysis',
      settings: {
        colormap: 'rainbow',
        contrast: 20,
        saturation: 30
      }
    }
  ];

  const allPresets = [...medicalPresets, ...enhancementPresets, ...analysisPresets, ...customPresets];

  const getFilteredPresets = () => {
    return allPresets.filter(preset => 
      !preset.modalities || preset.modalities.includes(modality)
    );
  };

  const updateSetting = (key: keyof ImageSettings, value: any) => {
    if (readOnly) return;
    onSettingsChange({ [key]: value });
  };

  const applyPreset = (preset: ImagePreset) => {
    if (readOnly) return;
    onSettingsChange(preset.settings);
    onPresetApply?.(preset);
    setShowPresetsPanel(false);
  };

  const saveCustomPreset = () => {
    const name = prompt('Enter preset name:');
    if (!name) return;

    const newPreset: ImagePreset = {
      id: `custom_${Date.now()}`,
      name,
      description: 'Custom user preset',
      icon: StarIcon,
      category: 'custom',
      settings: { ...settings }
    };

    setCustomPresets(prev => [...prev, newPreset]);
  };

  const resetSettings = () => {
    if (readOnly) return;
    onReset?.();
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'image_settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const startAnimation = () => {
    if (readOnly) return;
    setIsAnimating(true);
    
    const animateProperty = 'windowLevel'; // Can be made configurable
    const startValue = settings[animateProperty] as number;
    const range = animationRange.max - animationRange.min;
    let direction = 1;
    
    const animate = () => {
      if (!isAnimating) return;
      
      const currentValue = settings[animateProperty] as number;
      const newValue = currentValue + (direction * animationSpeed);
      
      if (newValue >= startValue + range / 2) direction = -1;
      if (newValue <= startValue - range / 2) direction = 1;
      
      updateSetting(animateProperty, newValue);
      
      setTimeout(animate, 100);
    };
    
    animate();
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const renderSlider = (
    key: keyof ImageSettings,
    label: string,
    min: number,
    max: number,
    step: number = 1,
    unit?: string
  ) => {
    const value = settings[key] as number;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <span className="text-sm text-slate-600">
            {value.toFixed(step < 1 ? 1 : 0)}{unit}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateSetting(key, Math.max(min, value - step))}
            disabled={readOnly}
            className="btn-medsight p-1"
          >
            <MinusIcon className="w-3 h-3" />
          </button>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => updateSetting(key, parseFloat(e.target.value))}
            disabled={readOnly}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <button
            onClick={() => updateSetting(key, Math.min(max, value + step))}
            disabled={readOnly}
            className="btn-medsight p-1"
          >
            <PlusIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  const renderColorPicker = (key: keyof ImageSettings, label: string) => {
    const value = settings[key] as number;
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="-180"
            max="180"
            value={value}
            onChange={(e) => updateSetting(key, parseInt(e.target.value))}
            disabled={readOnly}
            className="flex-1 h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-slate-600 min-w-[40px]">{value}°</span>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className={`medsight-control-glass p-3 rounded-lg ${className}`}>
        <div className="flex items-center space-x-3">
          {/* Quick Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-700">WL:</span>
            <input
              type="number"
              value={settings.windowLevel}
              onChange={(e) => updateSetting('windowLevel', parseInt(e.target.value))}
              disabled={readOnly}
              className="w-16 text-xs input-medsight"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-700">WW:</span>
            <input
              type="number"
              value={settings.windowWidth}
              onChange={(e) => updateSetting('windowWidth', parseInt(e.target.value))}
              disabled={readOnly}
              className="w-16 text-xs input-medsight"
            />
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => updateSetting('invert', !settings.invert)}
              disabled={readOnly}
              className={`p-1 rounded ${settings.invert ? 'bg-medsight-primary text-white' : 'hover:bg-slate-100'}`}
              title="Invert"
            >
              {settings.invert ? <EyeIconSolid className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
            <button
              onClick={resetSettings}
              disabled={readOnly}
              className="p-1 rounded hover:bg-slate-100"
              title="Reset"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`medsight-control-glass rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-medsight-primary">Image Controls</h3>
          <div className="flex items-center space-x-2">
            {enableAnimation && (
              <button
                onClick={isAnimating ? stopAnimation : startAnimation}
                disabled={readOnly}
                className={`p-2 rounded-lg ${isAnimating ? 'bg-medsight-primary text-white' : 'hover:bg-slate-100'}`}
                title={isAnimating ? 'Stop Animation' : 'Start Animation'}
              >
                {isAnimating ? <PauseIconSolid className="w-4 h-4" /> : <PlayIconSolid className="w-4 h-4" />}
              </button>
            )}
            {showPresets && (
              <button
                onClick={() => setShowPresetsPanel(!showPresetsPanel)}
                className="p-2 rounded-lg hover:bg-slate-100"
                title="Presets"
              >
                <SwatchIcon className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={resetSettings}
              disabled={readOnly}
              className="p-2 rounded-lg hover:bg-slate-100"
              title="Reset"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            <button
              onClick={exportSettings}
              className="p-2 rounded-lg hover:bg-slate-100"
              title="Export Settings"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-medsight-primary text-medsight-primary'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Basic Adjustments</h4>
            
            {renderSlider('windowLevel', 'Window Level', -1024, 3071, 1)}
            {renderSlider('windowWidth', 'Window Width', 1, 4096, 1)}
            {renderSlider('brightness', 'Brightness', -100, 100, 1)}
            {renderSlider('contrast', 'Contrast', -100, 100, 1)}
            {renderSlider('gamma', 'Gamma', 0.1, 3.0, 0.1)}
            {renderSlider('opacity', 'Opacity', 0, 1, 0.01)}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Options</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.invert}
                    onChange={(e) => updateSetting('invert', e.target.checked)}
                    disabled={readOnly}
                    className="rounded border-slate-300 text-medsight-primary"
                  />
                  <span className="text-sm text-slate-700">Invert</span>
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-700">Interpolation:</span>
                  <select
                    value={settings.interpolation}
                    onChange={(e) => updateSetting('interpolation', e.target.value)}
                    disabled={readOnly}
                    className="text-sm border border-slate-300 rounded px-2 py-1"
                  >
                    <option value="nearest">Nearest</option>
                    <option value="linear">Linear</option>
                    <option value="cubic">Cubic</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Color Map</label>
              <div className="grid grid-cols-2 gap-2">
                {colormaps.map((colormap) => (
                  <button
                    key={colormap.id}
                    onClick={() => updateSetting('colormap', colormap.id)}
                    disabled={readOnly}
                    className={`p-2 rounded-lg border text-left ${
                      settings.colormap === colormap.id
                        ? 'border-medsight-primary bg-medsight-primary/10'
                        : 'border-slate-200 hover:border-medsight-primary/50'
                    }`}
                  >
                    <div
                      className="h-4 rounded mb-1"
                      style={{ background: colormap.gradient }}
                    />
                    <span className="text-xs">{colormap.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'enhancement' && (
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Image Enhancement</h4>
            
            {renderSlider('sharpness', 'Sharpness', -50, 50, 1)}
            {renderSlider('smoothing', 'Smoothing', -50, 50, 1)}
            {renderSlider('clarity', 'Clarity', -50, 50, 1)}
            {renderSlider('vibrance', 'Vibrance', -50, 50, 1)}
            {renderSlider('saturation', 'Saturation', -50, 50, 1)}
            {renderSlider('exposure', 'Exposure', -100, 100, 1)}
            {renderSlider('highlights', 'Highlights', -100, 100, 1)}
            {renderSlider('shadows', 'Shadows', -100, 100, 1)}
            {renderSlider('threshold', 'Threshold', 0, 100, 1)}
            {renderColorPicker('hue', 'Hue')}
            {renderSlider('temperature', 'Temperature', -100, 100, 1)}
            {renderSlider('tint', 'Tint', -100, 100, 1)}
          </div>
        )}

        {activeTab === 'transform' && (
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Transform</h4>
            
            {renderSlider('zoom', 'Zoom', 0.1, 10, 0.1, 'x')}
            {renderSlider('rotation', 'Rotation', -180, 180, 1, '°')}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Pan</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    value={settings.pan.x}
                    onChange={(e) => updateSetting('pan', { ...settings.pan, x: parseInt(e.target.value) })}
                    disabled={readOnly}
                    placeholder="X offset"
                    className="w-full input-medsight"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={settings.pan.y}
                    onChange={(e) => updateSetting('pan', { ...settings.pan, y: parseInt(e.target.value) })}
                    disabled={readOnly}
                    placeholder="Y offset"
                    className="w-full input-medsight"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Flip</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.flip.horizontal}
                    onChange={(e) => updateSetting('flip', { ...settings.flip, horizontal: e.target.checked })}
                    disabled={readOnly}
                    className="rounded border-slate-300 text-medsight-primary"
                  />
                  <span className="text-sm text-slate-700">Horizontal</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.flip.vertical}
                    onChange={(e) => updateSetting('flip', { ...settings.flip, vertical: e.target.checked })}
                    disabled={readOnly}
                    className="rounded border-slate-300 text-medsight-primary"
                  />
                  <span className="text-sm text-slate-700">Vertical</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Analysis Tools</h4>
            
            <div className="medsight-ai-glass p-4 rounded-lg">
              <h5 className="font-medium text-slate-900 mb-3">Current Settings Summary</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Window Level:</span>
                  <span className="font-medium">{settings.windowLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Window Width:</span>
                  <span className="font-medium">{settings.windowWidth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Brightness:</span>
                  <span className="font-medium">{settings.brightness}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Contrast:</span>
                  <span className="font-medium">{settings.contrast}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Zoom:</span>
                  <span className="font-medium">{(settings.zoom * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Rotation:</span>
                  <span className="font-medium">{settings.rotation}°</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-slate-900">Quick Actions</h5>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSetting('invert', !settings.invert)}
                  disabled={readOnly}
                  className="btn-medsight text-sm"
                >
                  {settings.invert ? 'Remove Invert' : 'Invert Colors'}
                </button>
                <button
                  onClick={() => updateSetting('colormap', settings.colormap === 'grayscale' ? 'hot' : 'grayscale')}
                  disabled={readOnly}
                  className="btn-medsight text-sm"
                >
                  Toggle Colormap
                </button>
                <button
                  onClick={() => updateSetting('zoom', 1.0)}
                  disabled={readOnly}
                  className="btn-medsight text-sm"
                >
                  Reset Zoom
                </button>
                <button
                  onClick={() => updateSetting('rotation', 0)}
                  disabled={readOnly}
                  className="btn-medsight text-sm"
                >
                  Reset Rotation
                </button>
              </div>
            </div>

            {enableAnimation && (
              <div className="space-y-3">
                <h5 className="font-medium text-slate-900">Animation Controls</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-700">Speed:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-slate-600">{animationSpeed.toFixed(1)}x</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={animationRange.min}
                      onChange={(e) => setAnimationRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                      placeholder="Min value"
                      className="input-medsight text-sm"
                    />
                    <input
                      type="number"
                      value={animationRange.max}
                      onChange={(e) => setAnimationRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                      placeholder="Max value"
                      className="input-medsight text-sm"
                    />
                  </div>
                  <button
                    onClick={isAnimating ? stopAnimation : startAnimation}
                    disabled={readOnly}
                    className={`btn-medsight w-full ${isAnimating ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  >
                    {isAnimating ? 'Stop Animation' : 'Start Animation'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Presets Panel */}
      {showPresetsPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Image Presets</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={saveCustomPreset}
                  className="btn-medsight text-sm"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Save Current
                </button>
                <button 
                  onClick={() => setShowPresetsPanel(false)}
                  className="btn-medsight p-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Medical Presets */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 mr-2 text-medsight-primary" />
                  Medical Presets
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {getFilteredPresets().filter(p => p.category === 'medical').map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      disabled={readOnly}
                      className="p-4 rounded-lg border border-slate-200 hover:border-medsight-primary hover:bg-medsight-primary/5 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <preset.icon className="w-5 h-5 text-medsight-primary" />
                        <span className="font-medium text-slate-900">{preset.name}</span>
                      </div>
                      <p className="text-sm text-slate-600">{preset.description}</p>
                      {preset.modalities && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {preset.modalities.map((mod) => (
                              <span key={mod} className="px-2 py-1 bg-slate-100 text-xs rounded">
                                {mod}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhancement Presets */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                  <SparklesIcon className="w-5 h-5 mr-2 text-medsight-primary" />
                  Enhancement Presets
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {enhancementPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      disabled={readOnly}
                      className="p-4 rounded-lg border border-slate-200 hover:border-medsight-primary hover:bg-medsight-primary/5 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <preset.icon className="w-5 h-5 text-medsight-primary" />
                        <span className="font-medium text-slate-900">{preset.name}</span>
                      </div>
                      <p className="text-sm text-slate-600">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Analysis Presets */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                  <ChartBarIcon className="w-5 h-5 mr-2 text-medsight-primary" />
                  Analysis Presets
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {analysisPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      disabled={readOnly}
                      className="p-4 rounded-lg border border-slate-200 hover:border-medsight-primary hover:bg-medsight-primary/5 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <preset.icon className="w-5 h-5 text-medsight-primary" />
                        <span className="font-medium text-slate-900">{preset.name}</span>
                      </div>
                      <p className="text-sm text-slate-600">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Presets */}
              {customPresets.length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                    <StarIcon className="w-5 h-5 mr-2 text-medsight-primary" />
                    Custom Presets
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {customPresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        disabled={readOnly}
                        className="p-4 rounded-lg border border-slate-200 hover:border-medsight-primary hover:bg-medsight-primary/5 transition-colors text-left"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <preset.icon className="w-5 h-5 text-medsight-primary" />
                          <span className="font-medium text-slate-900">{preset.name}</span>
                        </div>
                        <p className="text-sm text-slate-600">{preset.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 