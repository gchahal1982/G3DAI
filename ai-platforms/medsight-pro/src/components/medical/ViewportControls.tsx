'use client';

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowPathIcon,
  SunIcon,
  MoonIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  Square2StackIcon,
  Squares2X2Icon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Cog6ToothIcon,
  PhotoIcon,
  RectangleStackIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';

export interface ViewportSettings {
  zoom: number;
  pan: { x: number; y: number };
  windowCenter: number;
  windowWidth: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  invert: boolean;
  interpolation: 'nearest' | 'linear' | 'cubic';
  overlay: {
    showPatientInfo: boolean;
    showImageInfo: boolean;
    showAnnotations: boolean;
    showMeasurements: boolean;
    showAIResults: boolean;
  };
  cine: {
    isPlaying: boolean;
    speed: number;
    loop: boolean;
    frameRate: number;
  };
}

export interface WindowLevelPreset {
  name: string;
  center: number;
  width: number;
  description: string;
  modality?: string;
}

export interface ViewportControlsProps {
  settings: ViewportSettings;
  onSettingsChange: (settings: Partial<ViewportSettings>) => void;
  imageCount?: number;
  currentImageIndex?: number;
  onImageChange?: (index: number) => void;
  windowLevelPresets?: WindowLevelPreset[];
  zoomRange?: { min: number; max: number };
  enableCine?: boolean;
  enableMultiPlanar?: boolean;
  enableAdvanced?: boolean;
  readOnly?: boolean;
}

export function ViewportControls({
  settings,
  onSettingsChange,
  imageCount = 1,
  currentImageIndex = 0,
  onImageChange,
  windowLevelPresets = [],
  zoomRange = { min: 0.1, max: 10 },
  enableCine = true,
  enableMultiPlanar = false,
  enableAdvanced = false,
  readOnly = false
}: ViewportControlsProps) {
  const [activeTab, setActiveTab] = useState<'zoom' | 'window' | 'display' | 'cine' | 'advanced'>('zoom');
  const [showPresets, setShowPresets] = useState(false);
  const [customPreset, setCustomPreset] = useState({ name: '', center: 0, width: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const defaultPresets: WindowLevelPreset[] = [
    { name: 'Abdomen', center: 60, width: 400, description: 'Abdominal soft tissue', modality: 'CT' },
    { name: 'Bone', center: 300, width: 1500, description: 'Bone window', modality: 'CT' },
    { name: 'Brain', center: 40, width: 80, description: 'Brain tissue', modality: 'CT' },
    { name: 'Chest', center: -500, width: 1500, description: 'Chest/Lungs', modality: 'CT' },
    { name: 'Liver', center: 60, width: 160, description: 'Liver tissue', modality: 'CT' },
    { name: 'Lung', center: -600, width: 1200, description: 'Lung parenchyma', modality: 'CT' },
    { name: 'Mediastinum', center: 50, width: 350, description: 'Mediastinal structures', modality: 'CT' },
    { name: 'Spine', center: 30, width: 80, description: 'Spinal cord', modality: 'MRI' },
    { name: 'T1', center: 500, width: 1000, description: 'T1-weighted', modality: 'MRI' },
    { name: 'T2', center: 1000, width: 2000, description: 'T2-weighted', modality: 'MRI' }
  ];

  const allPresets = [...defaultPresets, ...windowLevelPresets];

  useEffect(() => {
    // Auto-advance images in cine mode
    let interval: NodeJS.Timeout;
    if (settings.cine.isPlaying && imageCount > 1) {
      interval = setInterval(() => {
        const nextIndex = settings.cine.loop
          ? (currentImageIndex + 1) % imageCount
          : Math.min(currentImageIndex + 1, imageCount - 1);
        
        if (!settings.cine.loop && nextIndex === imageCount - 1) {
          onSettingsChange({ cine: { ...settings.cine, isPlaying: false } });
        }
        
        onImageChange?.(nextIndex);
      }, 1000 / settings.cine.speed);
    }
    return () => clearInterval(interval);
  }, [settings.cine.isPlaying, settings.cine.speed, settings.cine.loop, currentImageIndex, imageCount]);

  const handleZoomChange = (delta: number) => {
    if (readOnly) return;
    const newZoom = Math.max(zoomRange.min, Math.min(zoomRange.max, settings.zoom + delta));
    onSettingsChange({ zoom: newZoom });
  };

  const handleZoomFit = () => {
    if (readOnly) return;
    onSettingsChange({ zoom: 1.0, pan: { x: 0, y: 0 } });
  };

  const handleZoomActual = () => {
    if (readOnly) return;
    onSettingsChange({ zoom: 1.0 });
  };

  const handleRotate = (degrees: number) => {
    if (readOnly) return;
    const newRotation = (settings.rotation + degrees) % 360;
    onSettingsChange({ rotation: newRotation });
  };

  const handleFlip = (axis: 'horizontal' | 'vertical') => {
    if (readOnly) return;
    if (axis === 'horizontal') {
      onSettingsChange({ flipHorizontal: !settings.flipHorizontal });
    } else {
      onSettingsChange({ flipVertical: !settings.flipVertical });
    }
  };

  const handleInvert = () => {
    if (readOnly) return;
    onSettingsChange({ invert: !settings.invert });
  };

  const handleWindowLevelPreset = (preset: WindowLevelPreset) => {
    if (readOnly) return;
    onSettingsChange({
      windowCenter: preset.center,
      windowWidth: preset.width
    });
    setShowPresets(false);
  };

  const handleWindowLevelChange = (center: number, width: number) => {
    if (readOnly) return;
    onSettingsChange({
      windowCenter: center,
      windowWidth: Math.max(1, width)
    });
  };

  const handleReset = () => {
    if (readOnly) return;
    onSettingsChange({
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,
      invert: false
    });
  };

  const handleCineToggle = () => {
    if (readOnly) return;
    onSettingsChange({
      cine: { ...settings.cine, isPlaying: !settings.cine.isPlaying }
    });
  };

  const handleCineSpeedChange = (speed: number) => {
    if (readOnly) return;
    onSettingsChange({
      cine: { ...settings.cine, speed: Math.max(0.1, Math.min(10, speed)) }
    });
  };

  const handleOverlayToggle = (overlay: keyof ViewportSettings['overlay']) => {
    if (readOnly) return;
    onSettingsChange({
      overlay: { ...settings.overlay, [overlay]: !settings.overlay[overlay] }
    });
  };

  const renderZoomControls = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-medsight-primary">Zoom</span>
        <span className="text-xs text-medsight-primary">{(settings.zoom * 100).toFixed(0)}%</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleZoomChange(-0.1)}
          disabled={readOnly || settings.zoom <= zoomRange.min}
          className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg disabled:opacity-50"
        >
          <MagnifyingGlassMinusIcon className="w-4 h-4" />
        </button>
        
        <div className="flex-1">
          <input
            type="range"
            min={zoomRange.min}
            max={zoomRange.max}
            step={0.1}
            value={settings.zoom}
            onChange={(e) => onSettingsChange({ zoom: parseFloat(e.target.value) })}
            disabled={readOnly}
            className="w-full h-2 bg-medsight-primary/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <button
          onClick={() => handleZoomChange(0.1)}
          disabled={readOnly || settings.zoom >= zoomRange.max}
          className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg disabled:opacity-50"
        >
          <MagnifyingGlassPlusIcon className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleZoomFit}
          disabled={readOnly}
          className="btn-medsight text-xs"
        >
          <ArrowsPointingInIcon className="w-3 h-3 mr-1" />
          Fit
        </button>
        <button
          onClick={handleZoomActual}
          disabled={readOnly}
          className="btn-medsight text-xs"
        >
          1:1
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-medsight-primary">Pan</span>
          <button
            onClick={() => onSettingsChange({ pan: { x: 0, y: 0 } })}
            disabled={readOnly}
            className="text-xs text-medsight-primary hover:text-medsight-primary/70"
          >
            Reset
          </button>
        </div>
        <div className="text-xs text-medsight-primary/70">
          X: {settings.pan.x.toFixed(1)}, Y: {settings.pan.y.toFixed(1)}
        </div>
      </div>
    </div>
  );

  const renderWindowControls = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-medsight-primary">Window/Level</span>
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="text-xs text-medsight-primary hover:text-medsight-primary/70"
        >
          Presets
        </button>
      </div>
      
      {showPresets && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {allPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => handleWindowLevelPreset(preset)}
              disabled={readOnly}
              className="w-full text-left p-2 text-xs hover:bg-medsight-primary/10 rounded disabled:opacity-50"
            >
              <div className="font-medium text-medsight-primary">{preset.name}</div>
              <div className="text-medsight-primary/70">
                C: {preset.center}, W: {preset.width}
              </div>
            </button>
          ))}
        </div>
      )}
      
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-medsight-primary">Center</span>
            <span className="text-xs text-medsight-primary">{settings.windowCenter}</span>
          </div>
          <input
            type="range"
            min={-1000}
            max={1000}
            step={1}
            value={settings.windowCenter}
            onChange={(e) => handleWindowLevelChange(parseInt(e.target.value), settings.windowWidth)}
            disabled={readOnly}
            className="w-full h-2 bg-medsight-primary/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-medsight-primary">Width</span>
            <span className="text-xs text-medsight-primary">{settings.windowWidth}</span>
          </div>
          <input
            type="range"
            min={1}
            max={2000}
            step={1}
            value={settings.windowWidth}
            onChange={(e) => handleWindowLevelChange(settings.windowCenter, parseInt(e.target.value))}
            disabled={readOnly}
            className="w-full h-2 bg-medsight-primary/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <input
            type="number"
            value={settings.windowCenter}
            onChange={(e) => handleWindowLevelChange(parseInt(e.target.value) || 0, settings.windowWidth)}
            disabled={readOnly}
            className="input-medsight w-full"
            placeholder="Center"
          />
        </div>
        <div>
          <input
            type="number"
            value={settings.windowWidth}
            onChange={(e) => handleWindowLevelChange(settings.windowCenter, parseInt(e.target.value) || 1)}
            disabled={readOnly}
            className="input-medsight w-full"
            placeholder="Width"
          />
        </div>
      </div>
    </div>
  );

  const renderDisplayControls = () => (
    <div className="space-y-3">
      <div className="text-xs font-medium text-medsight-primary">Image Transform</div>
      
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleRotate(90)}
          disabled={readOnly}
          className="btn-medsight text-xs"
        >
          <ArrowPathIcon className="w-3 h-3 mr-1" />
          Rotate
        </button>
        
        <button
          onClick={() => handleFlip('horizontal')}
          disabled={readOnly}
          className={`btn-medsight text-xs ${settings.flipHorizontal ? 'bg-medsight-primary text-white' : ''}`}
        >
          ⇄ Flip H
        </button>
        
        <button
          onClick={() => handleFlip('vertical')}
          disabled={readOnly}
          className={`btn-medsight text-xs ${settings.flipVertical ? 'bg-medsight-primary text-white' : ''}`}
        >
          ⇅ Flip V
        </button>
        
        <button
          onClick={handleInvert}
          disabled={readOnly}
          className={`btn-medsight text-xs ${settings.invert ? 'bg-medsight-primary text-white' : ''}`}
        >
          <MoonIcon className="w-3 h-3 mr-1" />
          Invert
        </button>
      </div>
      
      <div className="text-xs font-medium text-medsight-primary">Overlay Options</div>
      
      <div className="space-y-2">
        {Object.entries(settings.overlay).map(([key, value]) => (
          <label key={key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value}
              onChange={() => handleOverlayToggle(key as keyof ViewportSettings['overlay'])}
              disabled={readOnly}
              className="rounded border-medsight-primary/20 text-medsight-primary focus:ring-medsight-primary"
            />
            <span className="text-xs text-medsight-primary">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </span>
          </label>
        ))}
      </div>
      
      <div className="text-xs font-medium text-medsight-primary">Interpolation</div>
      
      <select
        value={settings.interpolation}
        onChange={(e) => onSettingsChange({ interpolation: e.target.value as ViewportSettings['interpolation'] })}
        disabled={readOnly}
        className="input-medsight w-full text-xs"
      >
        <option value="nearest">Nearest Neighbor</option>
        <option value="linear">Linear</option>
        <option value="cubic">Cubic</option>
      </select>
    </div>
  );

  const renderCineControls = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-medsight-primary">Cine Playback</span>
        <span className="text-xs text-medsight-primary">
          {currentImageIndex + 1} / {imageCount}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onImageChange?.(Math.max(0, currentImageIndex - 1))}
          disabled={readOnly || currentImageIndex === 0}
          className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg disabled:opacity-50"
        >
          <BackwardIcon className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleCineToggle}
          disabled={readOnly || imageCount <= 1}
          className={`p-2 rounded-lg ${settings.cine.isPlaying ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'} disabled:opacity-50`}
        >
          {settings.cine.isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
        </button>
        
        <button
          onClick={() => onImageChange?.(Math.min(imageCount - 1, currentImageIndex + 1))}
          disabled={readOnly || currentImageIndex === imageCount - 1}
          className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg disabled:opacity-50"
        >
          <ForwardIcon className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-medsight-primary">Speed</span>
          <span className="text-xs text-medsight-primary">{settings.cine.speed.toFixed(1)} fps</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={10}
          step={0.1}
          value={settings.cine.speed}
          onChange={(e) => handleCineSpeedChange(parseFloat(e.target.value))}
          disabled={readOnly}
          className="w-full h-2 bg-medsight-primary/20 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={settings.cine.loop}
          onChange={(e) => onSettingsChange({ cine: { ...settings.cine, loop: e.target.checked } })}
          disabled={readOnly}
          className="rounded border-medsight-primary/20 text-medsight-primary focus:ring-medsight-primary"
        />
        <span className="text-xs text-medsight-primary">Loop playback</span>
      </label>
      
      <div className="pt-2 border-t border-medsight-primary/20">
        <div className="text-xs font-medium text-medsight-primary mb-2">Quick Navigation</div>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => onImageChange?.(0)}
            disabled={readOnly}
            className="btn-medsight text-xs"
          >
            First
          </button>
          <button
            onClick={() => onImageChange?.(Math.floor(imageCount / 2))}
            disabled={readOnly}
            className="btn-medsight text-xs"
          >
            Middle
          </button>
          <button
            onClick={() => onImageChange?.(imageCount - 1)}
            disabled={readOnly}
            className="btn-medsight text-xs"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdvancedControls = () => (
    <div className="space-y-3">
      <div className="text-xs font-medium text-medsight-primary">Advanced Settings</div>
      
      <div className="space-y-2">
        <div>
          <label className="text-xs text-medsight-primary">Rotation (degrees)</label>
          <input
            type="number"
            value={settings.rotation}
            onChange={(e) => onSettingsChange({ rotation: parseInt(e.target.value) || 0 })}
            disabled={readOnly}
            className="input-medsight w-full text-xs"
            step={1}
            min={0}
            max={359}
          />
        </div>
        
        <div>
          <label className="text-xs text-medsight-primary">Opacity</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={1}
            disabled={readOnly}
            className="w-full h-2 bg-medsight-primary/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      {enableMultiPlanar && (
        <div>
          <div className="text-xs font-medium text-medsight-primary mb-2">Multi-Planar</div>
          <div className="grid grid-cols-3 gap-1">
            <button className="btn-medsight text-xs">Axial</button>
            <button className="btn-medsight text-xs">Sagittal</button>
            <button className="btn-medsight text-xs">Coronal</button>
          </div>
        </div>
      )}
      
      <button
        onClick={handleReset}
        disabled={readOnly}
        className="btn-medsight w-full text-xs bg-medsight-critical/10 border-medsight-critical/20 text-medsight-critical"
      >
        Reset All Settings
      </button>
    </div>
  );

  return (
    <div className="medsight-glass p-3 rounded-xl w-72">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4 bg-medsight-primary/10 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('zoom')}
          className={`flex-1 px-2 py-1 text-xs rounded ${activeTab === 'zoom' ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'}`}
        >
          <MagnifyingGlassIcon className="w-3 h-3 mx-auto" />
        </button>
        <button
          onClick={() => setActiveTab('window')}
          className={`flex-1 px-2 py-1 text-xs rounded ${activeTab === 'window' ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'}`}
        >
          <SunIcon className="w-3 h-3 mx-auto" />
        </button>
        <button
          onClick={() => setActiveTab('display')}
          className={`flex-1 px-2 py-1 text-xs rounded ${activeTab === 'display' ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'}`}
        >
          <EyeIcon className="w-3 h-3 mx-auto" />
        </button>
        {enableCine && (
          <button
            onClick={() => setActiveTab('cine')}
            className={`flex-1 px-2 py-1 text-xs rounded ${activeTab === 'cine' ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'}`}
          >
            <PlayIcon className="w-3 h-3 mx-auto" />
          </button>
        )}
        {enableAdvanced && (
          <button
            onClick={() => setActiveTab('advanced')}
            className={`flex-1 px-2 py-1 text-xs rounded ${activeTab === 'advanced' ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'}`}
          >
            <Cog6ToothIcon className="w-3 h-3 mx-auto" />
          </button>
        )}
      </div>
      
      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'zoom' && renderZoomControls()}
        {activeTab === 'window' && renderWindowControls()}
        {activeTab === 'display' && renderDisplayControls()}
        {activeTab === 'cine' && enableCine && renderCineControls()}
        {activeTab === 'advanced' && enableAdvanced && renderAdvancedControls()}
      </div>
    </div>
  );
} 