'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Square3Stack3DIcon,
  PhotoIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  BeakerIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export interface SeriesInfo {
  id: string;
  seriesUID: string;
  studyUID: string;
  seriesNumber: number;
  seriesDescription: string;
  modality: string;
  bodyPart: string;
  imageCount: number;
  seriesDate: Date;
  seriesTime: Date;
  thumbnailUrl?: string;
  pixelSpacing?: [number, number];
  sliceThickness?: number;
  manufacturer: string;
  model: string;
  protocolName?: string;
  kvp?: number;
  mas?: number;
  contrastAgent?: string;
  imageOrientation?: string;
  acquisitionMatrix?: [number, number];
  metadata: {
    studyDate: string;
    patientName: string;
    patientId: string;
    institutionName: string;
    operatorName?: string;
    scanOptions?: string[];
    reconstructionDiameter?: number;
    kernelType?: string;
  };
  aiAnalysis?: {
    hasResults: boolean;
    resultsCount: number;
    confidence: number;
    findingsCount: number;
    criticalFindings: number;
  };
  processing: {
    loaded: boolean;
    loadProgress: number;
    error?: string;
  };
  quality: {
    imageQuality: 'excellent' | 'good' | 'fair' | 'poor';
    artifacts: string[];
    motion: 'none' | 'minimal' | 'moderate' | 'severe';
    snr?: number;
  };
}

export interface SeriesNavigatorProps {
  series: SeriesInfo[];
  currentSeriesIndex: number;
  currentImageIndex?: number;
  onSeriesChange: (seriesIndex: number, imageIndex?: number) => void;
  onSeriesToggle?: (seriesIndex: number, visible: boolean) => void;
  showThumbnails?: boolean;
  showMetadata?: boolean;
  enableComparison?: boolean;
  enableAIResults?: boolean;
  viewMode?: 'list' | 'grid' | 'thumbnails';
  sortBy?: 'number' | 'time' | 'description' | 'modality';
  filterBy?: {
    modality?: string;
    bodyPart?: string;
    hasAI?: boolean;
  };
  readOnly?: boolean;
}

export function SeriesNavigator({
  series,
  currentSeriesIndex,
  currentImageIndex = 0,
  onSeriesChange,
  onSeriesToggle,
  showThumbnails = true,
  showMetadata = true,
  enableComparison = false,
  enableAIResults = true,
  viewMode = 'list',
  sortBy = 'number',
  filterBy = {},
  readOnly = false
}: SeriesNavigatorProps) {
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());
  const [selectedSeries, setSelectedSeries] = useState<Set<string>>(new Set());
  const [autoPlay, setAutoPlay] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilterBy, setLocalFilterBy] = useState(filterBy);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to current series
    if (scrollRef.current) {
      const currentElement = scrollRef.current.querySelector(`[data-series-index="${currentSeriesIndex}"]`);
      if (currentElement) {
        currentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentSeriesIndex]);

  useEffect(() => {
    // Auto-play through series
    let interval: NodeJS.Timeout;
    if (autoPlay && series.length > 1) {
      interval = setInterval(() => {
        const nextIndex = (currentSeriesIndex + 1) % series.length;
        onSeriesChange(nextIndex, 0);
      }, 3000 / playSpeed);
    }
    return () => clearInterval(interval);
  }, [autoPlay, playSpeed, currentSeriesIndex, series.length]);

  const toggleSeriesExpansion = (seriesId: string) => {
    const newExpanded = new Set(expandedSeries);
    if (newExpanded.has(seriesId)) {
      newExpanded.delete(seriesId);
    } else {
      newExpanded.add(seriesId);
    }
    setExpandedSeries(newExpanded);
  };

  const toggleSeriesSelection = (seriesIndex: number) => {
    if (!enableComparison) return;
    
    const seriesId = series[seriesIndex].id;
    const newSelected = new Set(selectedSeries);
    if (newSelected.has(seriesId)) {
      newSelected.delete(seriesId);
    } else {
      newSelected.add(seriesId);
    }
    setSelectedSeries(newSelected);
  };

  const getFilteredSeries = () => {
    return series.filter(s => {
      // Search filter
      if (searchTerm && !s.seriesDescription.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !s.modality.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !s.bodyPart.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Modality filter
      if (localFilterBy.modality && s.modality !== localFilterBy.modality) {
        return false;
      }
      
      // Body part filter
      if (localFilterBy.bodyPart && s.bodyPart !== localFilterBy.bodyPart) {
        return false;
      }
      
      // AI results filter
      if (localFilterBy.hasAI !== undefined && (s.aiAnalysis?.hasResults || false) !== localFilterBy.hasAI) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'number':
          return a.seriesNumber - b.seriesNumber;
        case 'time':
          return a.seriesTime.getTime() - b.seriesTime.getTime();
        case 'description':
          return a.seriesDescription.localeCompare(b.seriesDescription);
        case 'modality':
          return a.modality.localeCompare(b.modality);
        default:
          return 0;
      }
    });
  };

  const getModalityColor = (modality: string) => {
    const colors = {
      'CT': 'text-blue-600',
      'MRI': 'text-purple-600',
      'XR': 'text-green-600',
      'US': 'text-teal-600',
      'NM': 'text-orange-600',
      'PET': 'text-red-600',
      'MG': 'text-pink-600'
    };
    return colors[modality as keyof typeof colors] || 'text-medsight-primary';
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-medsight-normal';
      case 'good': return 'text-medsight-ai-high';
      case 'fair': return 'text-medsight-pending';
      case 'poor': return 'text-medsight-critical';
      default: return 'text-medsight-primary';
    }
  };

  const handleSeriesClick = (seriesIndex: number) => {
    if (enableComparison && selectedSeries.size > 0) {
      toggleSeriesSelection(seriesIndex);
    } else {
      onSeriesChange(seriesIndex, 0);
    }
  };

  const renderSeriesThumbnail = (seriesInfo: SeriesInfo, index: number) => {
    const isSelected = index === currentSeriesIndex;
    const isComparisonSelected = selectedSeries.has(seriesInfo.id);
    const isExpanded = expandedSeries.has(seriesInfo.id);

    return (
      <div
        key={seriesInfo.id}
        data-series-index={index}
        className={`medsight-glass p-3 rounded-lg cursor-pointer transition-all hover:scale-105 ${
          isSelected ? 'border-2 border-medsight-primary' : 'border border-medsight-primary/20'
        } ${isComparisonSelected ? 'bg-medsight-secondary/10' : ''}`}
        onClick={() => handleSeriesClick(index)}
      >
        <div className="space-y-2">
          {/* Series Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                isSelected ? 'bg-medsight-primary' : 'bg-medsight-primary/50'
              }`}>
                {seriesInfo.seriesNumber}
              </div>
              <span className={`text-xs font-medium ${getModalityColor(seriesInfo.modality)}`}>
                {seriesInfo.modality}
              </span>
              {seriesInfo.aiAnalysis?.hasResults && enableAIResults && (
                <BeakerIcon className="w-4 h-4 text-medsight-ai-high" />
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {!seriesInfo.processing.loaded && (
                <div className="w-4 h-4 border-2 border-medsight-primary border-t-transparent rounded-full animate-spin"></div>
              )}
              {seriesInfo.processing.error && (
                <ExclamationTriangleIcon className="w-4 h-4 text-medsight-critical" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSeriesExpansion(seriesInfo.id);
                }}
                className="p-1 text-medsight-primary/50 hover:text-medsight-primary"
              >
                {isExpanded ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Thumbnail */}
          {showThumbnails && (
            <div className="relative">
              {seriesInfo.thumbnailUrl ? (
                <img
                  src={seriesInfo.thumbnailUrl}
                  alt={`Series ${seriesInfo.seriesNumber}`}
                  className="w-full h-16 object-cover rounded bg-black"
                />
              ) : (
                <div className="w-full h-16 bg-black rounded flex items-center justify-center">
                  <PhotoIcon className="w-6 h-6 text-medsight-primary/50" />
                </div>
              )}
              
              {!seriesInfo.processing.loaded && (
                <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                  <div className="text-xs text-white">
                    {seriesInfo.processing.loadProgress}%
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Series Info */}
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-medsight-primary line-clamp-2">
              {seriesInfo.seriesDescription}
            </h4>
            <div className="flex items-center justify-between text-xs text-medsight-primary/70">
              <span>{seriesInfo.imageCount} images</span>
              <span>{seriesInfo.bodyPart}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-medsight-primary/60">
              <ClockIcon className="w-3 h-3" />
              <span>{seriesInfo.seriesTime.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Quality Indicator */}
          <div className="flex items-center justify-between text-xs">
            <span className={`font-medium ${getQualityColor(seriesInfo.quality.imageQuality)}`}>
              {seriesInfo.quality.imageQuality.toUpperCase()}
            </span>
            {seriesInfo.quality.motion !== 'none' && (
              <span className="text-medsight-critical">Motion: {seriesInfo.quality.motion}</span>
            )}
          </div>

          {/* AI Results Summary */}
          {seriesInfo.aiAnalysis?.hasResults && enableAIResults && (
            <div className="medsight-ai-glass p-2 rounded">
              <div className="flex items-center justify-between text-xs">
                <span className="text-medsight-ai-high">AI Results</span>
                <span className="text-medsight-ai-high">{seriesInfo.aiAnalysis.confidence.toFixed(1)}%</span>
              </div>
              <div className="text-xs text-medsight-ai-high/70 mt-1">
                {seriesInfo.aiAnalysis.findingsCount} findings
                {seriesInfo.aiAnalysis.criticalFindings > 0 && (
                  <span className="text-medsight-critical ml-2">
                    ({seriesInfo.aiAnalysis.criticalFindings} critical)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Expanded Metadata */}
          {isExpanded && showMetadata && (
            <div className="pt-2 border-t border-medsight-primary/20 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-medsight-primary/70">Spacing:</span>
                  <span className="ml-1 text-medsight-primary">
                    {seriesInfo.pixelSpacing?.join('x') || 'N/A'}mm
                  </span>
                </div>
                <div>
                  <span className="text-medsight-primary/70">Thickness:</span>
                  <span className="ml-1 text-medsight-primary">
                    {seriesInfo.sliceThickness || 'N/A'}mm
                  </span>
                </div>
                <div>
                  <span className="text-medsight-primary/70">Manufacturer:</span>
                  <span className="ml-1 text-medsight-primary">{seriesInfo.manufacturer}</span>
                </div>
                <div>
                  <span className="text-medsight-primary/70">Model:</span>
                  <span className="ml-1 text-medsight-primary">{seriesInfo.model}</span>
                </div>
              </div>
              
              {seriesInfo.protocolName && (
                <div className="text-xs">
                  <span className="text-medsight-primary/70">Protocol:</span>
                  <span className="ml-1 text-medsight-primary">{seriesInfo.protocolName}</span>
                </div>
              )}
              
              {seriesInfo.kvp && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-medsight-primary/70">kVp:</span>
                    <span className="ml-1 text-medsight-primary">{seriesInfo.kvp}</span>
                  </div>
                  {seriesInfo.mas && (
                    <div>
                      <span className="text-medsight-primary/70">mAs:</span>
                      <span className="ml-1 text-medsight-primary">{seriesInfo.mas}</span>
                    </div>
                  )}
                </div>
              )}
              
              {seriesInfo.contrastAgent && (
                <div className="text-xs">
                  <span className="text-medsight-primary/70">Contrast:</span>
                  <span className="ml-1 text-medsight-primary">{seriesInfo.contrastAgent}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSeriesList = (filteredSeries: SeriesInfo[]) => {
    return (
      <div className="space-y-2">
        {filteredSeries.map((seriesInfo, index) => {
          const originalIndex = series.findIndex(s => s.id === seriesInfo.id);
          const isSelected = originalIndex === currentSeriesIndex;
          
          return (
            <div
              key={seriesInfo.id}
              data-series-index={originalIndex}
              className={`medsight-glass p-3 rounded-lg cursor-pointer transition-all ${
                isSelected ? 'border-2 border-medsight-primary' : 'border border-medsight-primary/20'
              }`}
              onClick={() => handleSeriesClick(originalIndex)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                  isSelected ? 'bg-medsight-primary' : 'bg-medsight-primary/50'
                }`}>
                  {seriesInfo.seriesNumber}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-medsight-primary truncate">
                      {seriesInfo.seriesDescription}
                    </h4>
                    <span className={`text-xs font-medium ${getModalityColor(seriesInfo.modality)}`}>
                      {seriesInfo.modality}
                    </span>
                    {seriesInfo.aiAnalysis?.hasResults && (
                      <BeakerIcon className="w-4 h-4 text-medsight-ai-high" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-medsight-primary/70 mt-1">
                    <span>{seriesInfo.imageCount} images</span>
                    <span>{seriesInfo.bodyPart}</span>
                    <span>{seriesInfo.seriesTime.toLocaleTimeString()}</span>
                    <span className={getQualityColor(seriesInfo.quality.imageQuality)}>
                      {seriesInfo.quality.imageQuality}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!seriesInfo.processing.loaded && (
                    <div className="w-4 h-4 border-2 border-medsight-primary border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <ArrowRightIcon className="w-4 h-4 text-medsight-primary/50" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const filteredSeries = getFilteredSeries();
  const uniqueModalities = [...new Set(series.map(s => s.modality))];
  const uniqueBodyParts = [...new Set(series.map(s => s.bodyPart))];

  return (
    <div className="space-y-4">
      {/* Series Navigator Header */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="medsight-control-glass p-2 rounded-lg">
              <Square3Stack3DIcon className="w-5 h-5 text-medsight-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-medsight-primary">
                Series Navigator
              </h3>
              <div className="text-xs text-medsight-primary/70">
                {filteredSeries.length} of {series.length} series
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`p-2 rounded-lg ${autoPlay ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'}`}
              title={autoPlay ? "Stop Auto-play" : "Start Auto-play"}
            >
              {autoPlay ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg"
              title="Toggle Filters"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medsight-primary/50" />
            <input
              type="text"
              placeholder="Search series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-medsight pl-10 w-full"
            />
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={localFilterBy.modality || ''}
                onChange={(e) => setLocalFilterBy({ ...localFilterBy, modality: e.target.value || undefined })}
                className="input-medsight text-xs"
              >
                <option value="">All Modalities</option>
                {uniqueModalities.map(modality => (
                  <option key={modality} value={modality}>{modality}</option>
                ))}
              </select>
              
              <select
                value={localFilterBy.bodyPart || ''}
                onChange={(e) => setLocalFilterBy({ ...localFilterBy, bodyPart: e.target.value || undefined })}
                className="input-medsight text-xs"
              >
                <option value="">All Body Parts</option>
                {uniqueBodyParts.map(bodyPart => (
                  <option key={bodyPart} value={bodyPart}>{bodyPart}</option>
                ))}
              </select>
              
              <select
                value={localFilterBy.hasAI === undefined ? '' : localFilterBy.hasAI ? 'true' : 'false'}
                onChange={(e) => setLocalFilterBy({ 
                  ...localFilterBy, 
                  hasAI: e.target.value === '' ? undefined : e.target.value === 'true'
                })}
                className="input-medsight text-xs"
              >
                <option value="">All Series</option>
                <option value="true">With AI Results</option>
                <option value="false">Without AI Results</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Series Content */}
      <div ref={scrollRef} className="max-h-96 overflow-y-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSeries.map((seriesInfo) => {
              const originalIndex = series.findIndex(s => s.id === seriesInfo.id);
              return renderSeriesThumbnail(seriesInfo, originalIndex);
            })}
          </div>
        ) : viewMode === 'thumbnails' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {filteredSeries.map((seriesInfo) => {
              const originalIndex = series.findIndex(s => s.id === seriesInfo.id);
              return renderSeriesThumbnail(seriesInfo, originalIndex);
            })}
          </div>
        ) : (
          renderSeriesList(filteredSeries)
        )}
      </div>

      {/* Series Statistics */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-medsight-primary/70">Total Series:</span>
            <span className="ml-2 font-medium text-medsight-primary">{series.length}</span>
          </div>
          <div>
            <span className="text-medsight-primary/70">Current:</span>
            <span className="ml-2 font-medium text-medsight-primary">
              {currentSeriesIndex + 1} of {series.length}
            </span>
          </div>
          <div>
            <span className="text-medsight-primary/70">With AI:</span>
            <span className="ml-2 font-medium text-medsight-ai-high">
              {series.filter(s => s.aiAnalysis?.hasResults).length}
            </span>
          </div>
          <div>
            <span className="text-medsight-primary/70">Loaded:</span>
            <span className="ml-2 font-medium text-medsight-normal">
              {series.filter(s => s.processing.loaded).length}
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Panel */}
      {enableComparison && selectedSeries.size > 0 && (
        <div className="medsight-glass p-4 rounded-xl border-medsight-secondary/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-medsight-secondary">
              Series Comparison ({selectedSeries.size} selected)
            </h4>
            <button
              onClick={() => setSelectedSeries(new Set())}
              className="text-xs text-medsight-secondary hover:text-medsight-secondary/70"
            >
              Clear Selection
            </button>
          </div>
          
          <div className="space-y-2">
            {Array.from(selectedSeries).map(seriesId => {
              const seriesInfo = series.find(s => s.id === seriesId);
              if (!seriesInfo) return null;
              
              return (
                <div key={seriesId} className="flex items-center justify-between p-2 bg-medsight-secondary/10 rounded">
                  <span className="text-xs text-medsight-secondary">
                    Series {seriesInfo.seriesNumber}: {seriesInfo.seriesDescription}
                  </span>
                  <button
                    onClick={() => toggleSeriesSelection(series.findIndex(s => s.id === seriesId))}
                    className="text-xs text-medsight-secondary hover:text-medsight-secondary/70"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
          
          <button className="btn-medsight w-full mt-3 text-sm">
            <Squares2X2Icon className="w-4 h-4 mr-2" />
            Compare Selected Series
          </button>
        </div>
      )}
    </div>
  );
} 