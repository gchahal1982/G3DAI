'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  BookmarkIcon,
  TagIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  BeakerIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  FireIcon,
  CpuChipIcon,
  SparklesIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  Square3Stack3DIcon,
  RectangleGroupIcon,
  FilmIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

interface WindowingControlsProps {
  windowWidth?: number;
  windowLevel?: number;
  onWindowChange?: (width: number, level: number) => void;
  onPresetChange?: (preset: WindowingPreset) => void;
  modality?: 'CT' | 'MRI' | 'XR' | 'US' | 'PET' | 'NM' | 'MG' | 'CR' | 'DX';
  anatomicalRegion?: string;
  studyInfo?: {
    studyId: string;
    seriesNumber: number;
    imageNumber: number;
    patientId: string;
    acquisitionDate: string;
  };
  showAdvancedControls?: boolean;
  autoWindowLevel?: boolean;
  enablePresets?: boolean;
  readOnly?: boolean;
  emergencyMode?: boolean;
  className?: string;
}

interface WindowingPreset {
  id: string;
  name: string;
  description: string;
  windowWidth: number;
  windowLevel: number;
  modality: string[];
  anatomicalRegion?: string;
  category: 'standard' | 'specialized' | 'user' | 'ai';
  icon?: React.ComponentType<any>;
  color?: string;
  hotkey?: string;
  usage: number;
  lastUsed: string;
  clinicalPurpose: string;
  isDefault?: boolean;
}

interface WindowingHistory {
  id: string;
  windowWidth: number;
  windowLevel: number;
  timestamp: string;
  action: 'manual' | 'preset' | 'auto' | 'ai';
  description: string;
  imageId?: string;
}

interface AdvancedWindowingSettings {
  gamma: number;
  contrast: number;
  brightness: number;
  saturation: number;
  sharpening: number;
  noiseReduction: number;
  colorMap: 'grayscale' | 'hot' | 'cool' | 'rainbow' | 'jet' | 'inverted';
  roiWindowLevel: boolean;
  adaptiveWindowing: boolean;
  voiLUT: boolean;
  interpolation: 'nearest' | 'linear' | 'cubic';
}

export default function WindowingControls({
  windowWidth = 400,
  windowLevel = 40,
  onWindowChange,
  onPresetChange,
  modality = 'CT',
  anatomicalRegion = 'chest',
  studyInfo,
  showAdvancedControls = false,
  autoWindowLevel = false,
  enablePresets = true,
  readOnly = false,
  emergencyMode = false,
  className = ''
}: WindowingControlsProps) {
  const windowWidthRef = useRef<HTMLInputElement>(null);
  const windowLevelRef = useRef<HTMLInputElement>(null);
  
  const [currentWindowWidth, setCurrentWindowWidth] = useState(windowWidth);
  const [currentWindowLevel, setCurrentWindowLevel] = useState(windowLevel);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, width: 0, level: 0 });
  
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedWindowingSettings>({
    gamma: 1.0,
    contrast: 1.0,
    brightness: 0.0,
    saturation: 1.0,
    sharpening: 0.0,
    noiseReduction: 0.0,
    colorMap: 'grayscale',
    roiWindowLevel: false,
    adaptiveWindowing: false,
    voiLUT: false,
    interpolation: 'linear'
  });
  
  const [windowingHistory, setWindowingHistory] = useState<WindowingHistory[]>([
    {
      id: 'history_1',
      windowWidth: 400,
      windowLevel: 40,
      timestamp: new Date().toISOString(),
      action: 'preset',
      description: 'Soft Tissue preset applied'
    }
  ]);
  
  const [userPresets, setUserPresets] = useState<WindowingPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAutoAdjusting, setIsAutoAdjusting] = useState(false);
  
  // Comprehensive windowing presets for different modalities
  const windowingPresets: WindowingPreset[] = [
    // CT Presets
    {
      id: 'ct_soft_tissue',
      name: 'Soft Tissue',
      description: 'General soft tissue viewing',
      windowWidth: 400,
      windowLevel: 40,
      modality: ['CT'],
      category: 'standard',
      icon: RectangleGroupIcon,
      color: '#10b981',
      hotkey: 'S',
      usage: 145,
      lastUsed: new Date().toISOString(),
      clinicalPurpose: 'General soft tissue evaluation',
      isDefault: true
    },
    {
      id: 'ct_lung',
      name: 'Lung',
      description: 'Pulmonary parenchyma',
      windowWidth: 1500,
      windowLevel: -600,
      modality: ['CT'],
      category: 'standard',
      icon: Square3Stack3DIcon,
      color: '#0ea5e9',
      hotkey: 'L',
      usage: 98,
      lastUsed: new Date().toISOString(),
      clinicalPurpose: 'Lung parenchyma and airways evaluation'
    },
    {
      id: 'ct_bone',
      name: 'Bone',
      description: 'Bone and calcified structures',
      windowWidth: 1500,
      windowLevel: 300,
      modality: ['CT'],
      category: 'standard',
      icon: BeakerIcon,
      color: '#f59e0b',
      hotkey: 'B',
      usage: 76,
      lastUsed: new Date().toISOString(),
      clinicalPurpose: 'Bone and calcified structure evaluation'
    },
    {
      id: 'ct_brain',
      name: 'Brain',
      description: 'Brain parenchyma',
      windowWidth: 80,
      windowLevel: 40,
      modality: ['CT'],
      category: 'standard',
      icon: CpuChipIcon,
      color: '#8b5cf6',
      hotkey: 'R',
      usage: 67,
      lastUsed: new Date().toISOString(),
      clinicalPurpose: 'Brain tissue evaluation'
    },
    {
      id: 'ct_abdomen',
      name: 'Abdomen',
      description: 'Abdominal organs',
      windowWidth: 350,
      windowLevel: 50,
      modality: ['CT'],
      category: 'standard',
      icon: FilmIcon,
      color: '#06b6d4',
      hotkey: 'A',
      usage: 89,
      lastUsed: new Date().toISOString(),
      clinicalPurpose: 'Abdominal organ evaluation'
    },
    {
      id: 'ct_liver',
      name: 'Liver',
      description: 'Hepatic parenchyma',
      windowWidth: 150,
      windowLevel: 30,
      modality: ['CT'],
      category: 'specialized',
      icon: SparklesIcon,
      color: '#dc2626',
      hotkey: 'H',
      usage: 45,
      lastUsed: new Date().toISOString(),
      clinicalPurpose: 'Liver parenchyma evaluation'
    },
    // MRI Presets
    {
      id: 'mri_t1',
      name: 'T1 Weighted',
      description: 'T1-weighted images',
      windowWidth: 600,
      windowLevel: 300,
      modality: ['MRI'],
      category: 'standard',
      icon: MoonIcon,
      color: '#4f46e5',
      usage: 78,
      lastUsed: new Date().toISOString(),
      clinicalPurpose: 'T1-weighted image evaluation'
    },
    {
      id: 'mri_t2',
      name: 'T2 Weighted',
      description: 'T2-weighted images',
      windowWidth: 1000,
      windowLevel: 500,
      modality: ['MRI'],
      category: 'standard',
      icon: SunIcon,
      color: '#059669',
      usage: 82,
      lastUsed: new Date().toISOString(),
      clinicalPurpose: 'T2-weighted image evaluation'
    },
    {
      id: 'mri_flair',
      name: 'FLAIR',
      description: 'Fluid-attenuated inversion recovery',
      windowWidth: 800,
      windowLevel: 400,
      modality: ['MRI'],
      category: 'specialized',
      icon: FireIcon,
      color: '#7c3aed',
      usage: 34,
      lastUsed: new Date().toISOString(),
      clinicalPurpose: 'FLAIR sequence evaluation'
    },
    // X-Ray Presets
    {
      id: 'xr_chest',
      name: 'Chest X-Ray',
      description: 'Chest radiography',
      windowWidth: 2000,
      windowLevel: 1000,
      modality: ['XR', 'CR', 'DX'],
      category: 'standard',
      icon: LightBulbIcon,
      color: '#0d9488',
      usage: 156,
      lastUsed: new Date().toISOString(),
      clinicalPurpose: 'Chest radiograph evaluation'
    }
  ];

  // Filter presets based on current modality
  const availablePresets = windowingPresets.filter(preset => 
    preset.modality.includes(modality)
  );

  // Auto window/level calculation
  const calculateAutoWindowLevel = useCallback(async () => {
    if (readOnly) return;
    
    setIsAutoAdjusting(true);
    
    // Simulate auto calculation
    setTimeout(() => {
      let autoWidth, autoLevel;
      
      switch (modality) {
        case 'CT':
          if (anatomicalRegion === 'chest') {
            autoWidth = 400;
            autoLevel = 40;
          } else if (anatomicalRegion === 'abdomen') {
            autoWidth = 350;
            autoLevel = 50;
          } else {
            autoWidth = 400;
            autoLevel = 40;
          }
          break;
        case 'MRI':
          autoWidth = 600;
          autoLevel = 300;
          break;
        default:
          autoWidth = currentWindowWidth;
          autoLevel = currentWindowLevel;
      }
      
      handleWindowChange(autoWidth, autoLevel, 'auto');
      setIsAutoAdjusting(false);
    }, 1000);
  }, [modality, anatomicalRegion, currentWindowWidth, currentWindowLevel, readOnly]);

  const handleWindowChange = useCallback((width: number, level: number, action: WindowingHistory['action'] = 'manual') => {
    if (readOnly) return;
    
    setCurrentWindowWidth(width);
    setCurrentWindowLevel(level);
    onWindowChange?.(width, level);
    
    // Add to history
    const historyEntry: WindowingHistory = {
      id: `history_${Date.now()}`,
      windowWidth: width,
      windowLevel: level,
      timestamp: new Date().toISOString(),
      action,
      description: action === 'manual' ? 'Manual adjustment' : 
                   action === 'preset' ? 'Preset applied' :
                   action === 'auto' ? 'Auto window/level' :
                   'AI adjustment',
      imageId: studyInfo?.studyId
    };
    
    setWindowingHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
  }, [readOnly, onWindowChange, studyInfo]);

  const applyPreset = useCallback((preset: WindowingPreset) => {
    if (readOnly) return;
    
    setSelectedPreset(preset.id);
    handleWindowChange(preset.windowWidth, preset.windowLevel, 'preset');
    onPresetChange?.(preset);
    
    // Update preset usage
    const updatedPresets = windowingPresets.map(p => 
      p.id === preset.id 
        ? { ...p, usage: p.usage + 1, lastUsed: new Date().toISOString() }
        : p
    );
  }, [readOnly, handleWindowChange, onPresetChange]);

  const saveUserPreset = useCallback(() => {
    if (readOnly) return;
    
    const newPreset: WindowingPreset = {
      id: `user_${Date.now()}`,
      name: `Custom ${userPresets.length + 1}`,
      description: `User-defined preset W:${currentWindowWidth} L:${currentWindowLevel}`,
      windowWidth: currentWindowWidth,
      windowLevel: currentWindowLevel,
      modality: [modality],
      anatomicalRegion,
      category: 'user',
      color: '#6366f1',
      usage: 0,
      lastUsed: new Date().toISOString(),
      clinicalPurpose: 'User-defined windowing'
    };
    
    setUserPresets(prev => [...prev, newPreset]);
  }, [readOnly, currentWindowWidth, currentWindowLevel, modality, anatomicalRegion, userPresets.length]);

  const deleteUserPreset = useCallback((presetId: string) => {
    if (readOnly) return;
    setUserPresets(prev => prev.filter(p => p.id !== presetId));
  }, [readOnly]);

  const resetWindowing = useCallback(() => {
    if (readOnly) return;
    
    const defaultPreset = availablePresets.find(p => p.isDefault) || availablePresets[0];
    if (defaultPreset) {
      applyPreset(defaultPreset);
    }
  }, [readOnly, availablePresets, applyPreset]);

  // Mouse drag windowing
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (readOnly) return;
    
    setIsDragging(true);
    setDragStart({
      x: event.clientX,
      y: event.clientY,
      width: currentWindowWidth,
      level: currentWindowLevel
    });
  }, [readOnly, currentWindowWidth, currentWindowLevel]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging || readOnly) return;
    
    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    
    // Adjust sensitivity based on modality
    const widthSensitivity = modality === 'CT' ? 4 : 2;
    const levelSensitivity = modality === 'CT' ? 2 : 1;
    
    const newWidth = Math.max(1, dragStart.width + deltaX * widthSensitivity);
    const newLevel = dragStart.level - deltaY * levelSensitivity;
    
    handleWindowChange(newWidth, newLevel);
  }, [isDragging, readOnly, dragStart, modality, handleWindowChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (readOnly) return;
      
      const preset = availablePresets.find(p => p.hotkey === event.key.toUpperCase());
      if (preset && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        applyPreset(preset);
      }
      
      switch (event.key) {
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            resetWindowing();
          }
          break;
        case 'a':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            calculateAutoWindowLevel();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readOnly, availablePresets, applyPreset, resetWindowing, calculateAutoWindowLevel]);

  return (
    <div className={`medsight-control-glass rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-medsight-primary" />
          <h3 className="text-sm font-semibold text-gray-900">Window/Level</h3>
          {studyInfo && (
            <span className="text-xs text-gray-600">
              {modality} Series {studyInfo.seriesNumber}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className={`btn-medsight text-xs p-2 ${showPresets ? 'bg-medsight-primary/20' : ''}`}
            title="Windowing Presets"
          >
            <BookmarkIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`btn-medsight text-xs p-2 ${showAdvanced ? 'bg-medsight-primary/20' : ''}`}
            title="Advanced Settings"
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="space-y-4">
        {/* Current Window/Level Display */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Window Width
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={windowWidthRef}
                type="number"
                value={currentWindowWidth}
                onChange={(e) => handleWindowChange(parseFloat(e.target.value) || 0, currentWindowLevel)}
                disabled={readOnly}
                className="input-medsight text-sm flex-1"
                min="1"
                max="4096"
              />
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleWindowChange(currentWindowWidth + 10, currentWindowLevel)}
                  disabled={readOnly}
                  className="btn-medsight text-xs p-1"
                  title="Increase Width"
                >
                  <PlusIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleWindowChange(Math.max(1, currentWindowWidth - 10), currentWindowLevel)}
                  disabled={readOnly}
                  className="btn-medsight text-xs p-1"
                  title="Decrease Width"
                >
                  <MinusIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Window Level
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={windowLevelRef}
                type="number"
                value={currentWindowLevel}
                onChange={(e) => handleWindowChange(currentWindowWidth, parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                className="input-medsight text-sm flex-1"
                min="-2048"
                max="2048"
              />
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleWindowChange(currentWindowWidth, currentWindowLevel + 10)}
                  disabled={readOnly}
                  className="btn-medsight text-xs p-1"
                  title="Increase Level"
                >
                  <PlusIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleWindowChange(currentWindowWidth, currentWindowLevel - 10)}
                  disabled={readOnly}
                  className="btn-medsight text-xs p-1"
                  title="Decrease Level"
                >
                  <MinusIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Windowing Area */}
        <div
          className="h-32 bg-gradient-to-r from-black via-gray-500 to-white rounded-lg border-2 border-dashed border-gray-300 cursor-crosshair relative overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          title="Click and drag to adjust window/level"
        >
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
            Drag to adjust W/L
          </div>
          
          {/* Window visualization */}
          <div
            className="absolute top-0 bg-blue-500/30 border-l-2 border-r-2 border-blue-500"
            style={{
              left: '20%',
              width: '60%',
              height: '100%'
            }}
          />
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={calculateAutoWindowLevel}
              disabled={readOnly || isAutoAdjusting}
              className="btn-medsight text-xs"
              title="Auto Window/Level (Ctrl+A)"
            >
              {isAutoAdjusting ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <SparklesIcon className="w-4 h-4" />
              )}
              <span className="ml-1">Auto</span>
            </button>
            
            <button
              onClick={resetWindowing}
              disabled={readOnly}
              className="btn-medsight text-xs"
              title="Reset to Default (Ctrl+R)"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Reset
            </button>
            
            <button
              onClick={saveUserPreset}
              disabled={readOnly}
              className="btn-medsight text-xs"
              title="Save Current as Preset"
            >
              <BookmarkIcon className="w-4 h-4 mr-1" />
              Save
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`btn-medsight text-xs ${showHistory ? 'bg-medsight-primary/20' : ''}`}
              title="History"
            >
              <ClockIcon className="w-4 h-4 mr-1" />
              History
            </button>
            
            <span className="text-xs text-gray-600">
              W: {currentWindowWidth} | L: {currentWindowLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Presets Panel */}
      {showPresets && enablePresets && (
        <div className="mt-4 medsight-glass p-3 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Windowing Presets</h4>
          
          {/* Standard Presets */}
          <div className="mb-4">
            <h5 className="text-xs font-medium text-gray-700 mb-2">Standard ({modality})</h5>
            <div className="grid grid-cols-2 gap-2">
              {availablePresets.filter(p => p.category === 'standard').map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  disabled={readOnly}
                  className={`btn-medsight text-xs p-2 flex items-center gap-2 ${
                    selectedPreset === preset.id ? 'bg-medsight-primary/20' : ''
                  }`}
                  title={`${preset.description} - W:${preset.windowWidth} L:${preset.windowLevel}${preset.hotkey ? ` (Ctrl+${preset.hotkey})` : ''}`}
                >
                  {preset.icon && <preset.icon className="w-3 h-3" style={{ color: preset.color }} />}
                  <span>{preset.name}</span>
                  {preset.hotkey && <span className="text-xs text-gray-500">Ctrl+{preset.hotkey}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Specialized Presets */}
          {availablePresets.filter(p => p.category === 'specialized').length > 0 && (
            <div className="mb-4">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Specialized</h5>
              <div className="grid grid-cols-2 gap-2">
                {availablePresets.filter(p => p.category === 'specialized').map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    disabled={readOnly}
                    className={`btn-medsight text-xs p-2 flex items-center gap-2 ${
                      selectedPreset === preset.id ? 'bg-medsight-primary/20' : ''
                    }`}
                    title={`${preset.description} - W:${preset.windowWidth} L:${preset.windowLevel}`}
                  >
                    {preset.icon && <preset.icon className="w-3 h-3" style={{ color: preset.color }} />}
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Presets */}
          {userPresets.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-2">User Presets</h5>
              <div className="space-y-1">
                {userPresets.map(preset => (
                  <div key={preset.id} className="flex items-center gap-2">
                    <button
                      onClick={() => applyPreset(preset)}
                      disabled={readOnly}
                      className={`btn-medsight text-xs p-2 flex-1 text-left ${
                        selectedPreset === preset.id ? 'bg-medsight-primary/20' : ''
                      }`}
                    >
                      {preset.name} (W:{preset.windowWidth} L:{preset.windowLevel})
                    </button>
                    <button
                      onClick={() => deleteUserPreset(preset.id)}
                      disabled={readOnly}
                      className="btn-medsight text-xs p-1 text-red-600"
                      title="Delete Preset"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="mt-4 medsight-glass p-3 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Window/Level History</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {windowingHistory.map(entry => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleWindowChange(entry.windowWidth, entry.windowLevel)}
              >
                <div>
                  <div className="text-xs font-medium">
                    W:{entry.windowWidth} L:{entry.windowLevel}
                  </div>
                  <div className="text-xs text-gray-600">
                    {entry.description} • {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  entry.action === 'auto' ? 'bg-green-500' :
                  entry.action === 'preset' ? 'bg-blue-500' :
                  entry.action === 'ai' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Settings Panel */}
      {showAdvanced && showAdvancedControls && (
        <div className="mt-4 medsight-glass p-3 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Advanced Settings</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Gamma: {advancedSettings.gamma.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={advancedSettings.gamma}
                onChange={(e) => setAdvancedSettings(prev => ({ ...prev, gamma: parseFloat(e.target.value) }))}
                disabled={readOnly}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Contrast: {advancedSettings.contrast.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={advancedSettings.contrast}
                onChange={(e) => setAdvancedSettings(prev => ({ ...prev, contrast: parseFloat(e.target.value) }))}
                disabled={readOnly}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color Map</label>
              <select
                value={advancedSettings.colorMap}
                onChange={(e) => setAdvancedSettings(prev => ({ 
                  ...prev, 
                  colorMap: e.target.value as AdvancedWindowingSettings['colorMap']
                }))}
                disabled={readOnly}
                className="input-medsight text-xs w-full"
              >
                <option value="grayscale">Grayscale</option>
                <option value="hot">Hot</option>
                <option value="cool">Cool</option>
                <option value="rainbow">Rainbow</option>
                <option value="jet">Jet</option>
                <option value="inverted">Inverted</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Interpolation</label>
              <select
                value={advancedSettings.interpolation}
                onChange={(e) => setAdvancedSettings(prev => ({ 
                  ...prev, 
                  interpolation: e.target.value as AdvancedWindowingSettings['interpolation']
                }))}
                disabled={readOnly}
                className="input-medsight text-xs w-full"
              >
                <option value="nearest">Nearest</option>
                <option value="linear">Linear</option>
                <option value="cubic">Cubic</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={advancedSettings.roiWindowLevel}
                onChange={(e) => setAdvancedSettings(prev => ({ ...prev, roiWindowLevel: e.target.checked }))}
                disabled={readOnly}
                className="rounded border-gray-300 text-medsight-primary"
              />
              <span className="text-xs text-gray-700">ROI-based Window/Level</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={advancedSettings.adaptiveWindowing}
                onChange={(e) => setAdvancedSettings(prev => ({ ...prev, adaptiveWindowing: e.target.checked }))}
                disabled={readOnly}
                className="rounded border-gray-300 text-medsight-primary"
              />
              <span className="text-xs text-gray-700">Adaptive Windowing</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={advancedSettings.voiLUT}
                onChange={(e) => setAdvancedSettings(prev => ({ ...prev, voiLUT: e.target.checked }))}
                disabled={readOnly}
                className="rounded border-gray-300 text-medsight-primary"
              />
              <span className="text-xs text-gray-700">VOI LUT</span>
            </label>
          </div>
        </div>
      )}

      {/* Emergency mode indicator */}
      {emergencyMode && (
        <div className="mt-4 bg-red-100 border border-red-500 text-red-700 px-3 py-1 rounded text-xs font-medium">
          <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
          Emergency Mode Active
        </div>
      )}

      {/* Read-only indicator */}
      {readOnly && (
        <div className="mt-4 bg-gray-100 border border-gray-400 text-gray-700 px-3 py-1 rounded text-xs">
          <EyeIcon className="w-4 h-4 inline mr-1" />
          Read Only Mode
        </div>
      )}
    </div>
  );
} 