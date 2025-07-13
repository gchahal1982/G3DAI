'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  EyeIcon,
  PhotoIcon,
  CubeIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  PrinterIcon,
  BookmarkIcon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BeakerIcon,
  CpuChipIcon,
  LightBulbIcon,
  ChartBarIcon,
  ScaleIcon,
  RectangleStackIcon,
  Square3Stack3DIcon,
  CircleStackIcon,
  CameraIcon,
  ViewfinderCircleIcon,
  SquaresPlusIcon,
  BoltIcon,
  StarIcon,
  HeartIcon,
  ShieldCheckIcon,
  FingerPrintIcon,
  GlobeAltIcon,
  FolderOpenIcon,
  DocumentDuplicateIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  EyeIcon as EyeIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';

// Types for computer vision analysis
interface DetectedObject {
  id: string;
  type: 'anatomy' | 'pathology' | 'device' | 'artifact';
  label: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  attributes?: {
    size?: string;
    density?: string;
    shape?: string;
    characteristics?: string[];
  };
  clinicalSignificance: 'normal' | 'abnormal' | 'critical' | 'uncertain';
  recommendation?: string;
}

interface SegmentationResult {
  id: string;
  organ: string;
  confidence: number;
  volume?: number;
  area?: number;
  boundaries: number[][];
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  abnormalities?: string[];
}

interface ImageAnalysis {
  id: string;
  imageId: string;
  modality: 'CT' | 'MRI' | 'X-Ray' | 'Ultrasound' | 'Mammography' | 'PET';
  bodyPart: string;
  view: string;
  timestamp: string;
  processingTime: number;
  detectedObjects: DetectedObject[];
  segmentations: SegmentationResult[];
  overallQuality: number;
  technicalParams: {
    resolution: string;
    sliceThickness?: string;
    contrastAgent?: boolean;
    windowLevel?: number;
    windowWidth?: number;
  };
  aiModels: string[];
  status: 'processing' | 'completed' | 'error' | 'review';
}

// Mock data for computer vision results
const mockAnalyses: ImageAnalysis[] = [
  {
    id: 'cv-001',
    imageId: 'IMG-2024-001',
    modality: 'CT',
    bodyPart: 'Chest',
    view: 'Axial',
    timestamp: '2024-01-15 14:30:00',
    processingTime: 2.3,
    detectedObjects: [
      {
        id: 'obj-001',
        type: 'anatomy',
        label: 'Heart',
        confidence: 98.7,
        boundingBox: { x: 120, y: 150, width: 180, height: 160 },
        attributes: { size: 'Normal', shape: 'Regular' },
        clinicalSignificance: 'normal',
      },
      {
        id: 'obj-002',
        type: 'anatomy',
        label: 'Lungs',
        confidence: 97.4,
        boundingBox: { x: 50, y: 80, width: 350, height: 280 },
        attributes: { characteristics: ['Clear', 'Well-expanded'] },
        clinicalSignificance: 'normal',
      },
      {
        id: 'obj-003',
        type: 'pathology',
        label: 'Pulmonary Nodule',
        confidence: 89.2,
        boundingBox: { x: 280, y: 120, width: 24, height: 22 },
        attributes: { 
          size: '8.5mm diameter', 
          density: 'Solid', 
          shape: 'Irregular',
          characteristics: ['Spiculated margins', 'No calcification']
        },
        clinicalSignificance: 'abnormal',
        recommendation: 'Follow-up CT in 3-6 months'
      }
    ],
    segmentations: [
      {
        id: 'seg-001',
        organ: 'Left Lung',
        confidence: 96.8,
        volume: 2.4,
        boundaries: [[100, 80], [200, 80], [200, 200], [100, 200]],
        quality: 'excellent'
      },
      {
        id: 'seg-002',
        organ: 'Right Lung',
        confidence: 97.1,
        volume: 2.6,
        boundaries: [[250, 85], [380, 85], [380, 205], [250, 205]],
        quality: 'excellent'
      },
      {
        id: 'seg-003',
        organ: 'Heart',
        confidence: 94.5,
        volume: 0.65,
        boundaries: [[150, 140], [250, 140], [250, 220], [150, 220]],
        quality: 'good'
      }
    ],
    overallQuality: 94.3,
    technicalParams: {
      resolution: '512x512',
      sliceThickness: '1.5mm',
      contrastAgent: false,
      windowLevel: 40,
      windowWidth: 400
    },
    aiModels: ['YOLO-v8', 'U-Net Segmentation', 'ResNet-50'],
    status: 'completed'
  }
];

interface ComputerVisionResultsProps {
  className?: string;
  selectedAnalysisId?: string | null;
  onObjectSelect?: (object: DetectedObject) => void;
  onSegmentationSelect?: (segmentation: SegmentationResult) => void;
}

export default function ComputerVisionResults({ 
  className = '', 
  selectedAnalysisId,
  onObjectSelect,
  onSegmentationSelect 
}: ComputerVisionResultsProps) {
  const [analyses, setAnalyses] = useState<ImageAnalysis[]>(mockAnalyses);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ImageAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'objects' | 'segmentation' | 'quality' | 'overview'>('overview');
  const [filterType, setFilterType] = useState<string>('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [showOverlays, setShowOverlays] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);

  useEffect(() => {
    if (selectedAnalysisId) {
      const analysis = analyses.find(a => a.id === selectedAnalysisId);
      setSelectedAnalysis(analysis || null);
    } else if (analyses.length > 0) {
      setSelectedAnalysis(analyses[0]);
    }
  }, [selectedAnalysisId, analyses]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-medsight-ai-high';
    if (confidence >= 70) return 'text-medsight-ai-medium';
    return 'text-medsight-ai-low';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 90) return 'bg-medsight-ai-high/20 border-medsight-ai-high/30';
    if (confidence >= 70) return 'bg-medsight-ai-medium/20 border-medsight-ai-medium/30';
    return 'bg-medsight-ai-low/20 border-medsight-ai-low/30';
  };

  const getClinicalSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'normal': return 'text-medsight-normal';
      case 'abnormal': return 'text-medsight-abnormal';
      case 'critical': return 'text-medsight-critical';
      case 'uncertain': return 'text-medsight-pending';
      default: return 'text-gray-500';
    }
  };

  const getClinicalSignificanceBg = (significance: string) => {
    switch (significance) {
      case 'normal': return 'bg-medsight-normal/10 border-medsight-normal/30';
      case 'abnormal': return 'bg-medsight-abnormal/10 border-medsight-abnormal/30';
      case 'critical': return 'bg-medsight-critical/10 border-medsight-critical/30';
      case 'uncertain': return 'bg-medsight-pending/10 border-medsight-pending/30';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getObjectTypeIcon = (type: string) => {
    switch (type) {
      case 'anatomy': return HeartIcon;
      case 'pathology': return ExclamationTriangleIcon;
      case 'device': return CpuChipIcon;
      case 'artifact': return SparklesIcon;
      default: return TagIcon;
    }
  };

  const handleObjectClick = (object: DetectedObject) => {
    if (selectedObjects.includes(object.id)) {
      setSelectedObjects(selectedObjects.filter(id => id !== object.id));
    } else {
      setSelectedObjects([...selectedObjects, object.id]);
    }
    onObjectSelect?.(object);
  };

  const handleSegmentationClick = (segmentation: SegmentationResult) => {
    onSegmentationSelect?.(segmentation);
  };

  const filteredObjects = selectedAnalysis?.detectedObjects.filter(obj => {
    if (filterType !== 'all' && obj.type !== filterType) return false;
    if (obj.confidence < confidenceThreshold) return false;
    return true;
  }) || [];

  return (
    <div className={`medsight-ai-glass p-6 rounded-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-medsight-primary flex items-center">
          <EyeIcon className="w-6 h-6 mr-2" />
          Computer Vision Analysis
        </h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 medsight-glass px-3 py-2 rounded-lg">
            <EyeIconSolid className="w-5 h-5 text-medsight-ai-high" />
            <span className="text-sm font-medium">
              {selectedAnalysis ? `${selectedAnalysis.detectedObjects.length} Objects Detected` : 'No Analysis Selected'}
            </span>
          </div>
          
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`btn-medsight ${showOverlays ? 'bg-medsight-ai-high/20 text-medsight-ai-high' : ''}`}
          >
            <ViewfinderCircleIcon className="w-4 h-4 mr-2" />
            Overlays: {showOverlays ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Analysis Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: EyeIcon },
          { id: 'objects', label: 'Object Detection', icon: SquaresPlusIcon },
          { id: 'segmentation', label: 'Segmentation', icon: CircleStackIcon },
          { id: 'quality', label: 'Quality Assessment', icon: StarIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'medsight-ai-glass text-medsight-ai-high border-medsight-ai-high/30'
                : 'medsight-glass text-gray-600 hover:text-medsight-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {selectedAnalysis ? (
        <div className="space-y-6">
          {/* Image Analysis Header */}
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-gray-600">Image ID:</span>
                <div className="font-medium text-gray-800">{selectedAnalysis.imageId}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Modality:</span>
                <div className="font-medium text-gray-800">{selectedAnalysis.modality}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Body Part:</span>
                <div className="font-medium text-gray-800">{selectedAnalysis.bodyPart}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Processing Time:</span>
                <div className="font-medium text-gray-800">{selectedAnalysis.processingTime}s</div>
              </div>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Viewer Placeholder */}
              <div className="medsight-viewer-glass p-8 rounded-lg">
                <div className="text-center text-white">
                  <PhotoIcon className="w-24 h-24 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Medical Image Viewer</h3>
                  <p className="text-sm opacity-75 mb-4">
                    {selectedAnalysis.modality} {selectedAnalysis.bodyPart} - {selectedAnalysis.view} View
                  </p>
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <button className="btn-medsight bg-white/20 text-white border-white/30">
                      <ArrowsPointingOutIcon className="w-4 h-4 mr-2" />
                      Zoom In
                    </button>
                    <button className="btn-medsight bg-white/20 text-white border-white/30">
                      <ArrowsPointingInIcon className="w-4 h-4 mr-2" />
                      Zoom Out
                    </button>
                  </div>
                  <div className="text-sm opacity-75">
                    Zoom: {zoomLevel}% | Overlays: {showOverlays ? 'Visible' : 'Hidden'}
                  </div>
                </div>
              </div>

              {/* Analysis Summary */}
              <div className="space-y-4">
                <div className="medsight-control-glass p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Detection Summary</h3>
                  <div className="space-y-2">
                    {['anatomy', 'pathology', 'device', 'artifact'].map(type => {
                      const count = selectedAnalysis.detectedObjects.filter(obj => obj.type === type).length;
                      return (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm capitalize text-gray-600">{type}:</span>
                          <span className="font-medium text-gray-800">{count} detected</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="medsight-control-glass p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Clinical Findings</h3>
                  <div className="space-y-2">
                    {['normal', 'abnormal', 'critical', 'uncertain'].map(significance => {
                      const count = selectedAnalysis.detectedObjects.filter(obj => obj.clinicalSignificance === significance).length;
                      return (
                        <div key={significance} className="flex justify-between items-center">
                          <span className={`text-sm capitalize ${getClinicalSignificanceColor(significance)}`}>
                            {significance}:
                          </span>
                          <span className="font-medium text-gray-800">{count} findings</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="medsight-control-glass p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">AI Models Used</h3>
                  <div className="space-y-1">
                    {selectedAnalysis.aiModels.map((model, idx) => (
                      <div key={idx} className="text-sm text-gray-700">• {model}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'objects' && (
            <div>
              {/* Filters */}
              <div className="medsight-control-glass p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Object Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="input-medsight text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="anatomy">Anatomy</option>
                      <option value="pathology">Pathology</option>
                      <option value="device">Medical Device</option>
                      <option value="artifact">Artifact</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Confidence: {confidenceThreshold}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-end">
                    <button className="btn-medsight text-sm">
                      <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                      Export Results
                    </button>
                  </div>
                </div>
              </div>

              {/* Object List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <SquaresPlusIcon className="w-5 h-5 mr-2" />
                  Detected Objects ({filteredObjects.length})
                </h3>
                
                {filteredObjects.map((object) => {
                  const IconComponent = getObjectTypeIcon(object.type);
                  const isSelected = selectedObjects.includes(object.id);
                  
                  return (
                    <div
                      key={object.id}
                      className={`medsight-glass p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected ? 'ring-2 ring-medsight-ai-high' : ''
                      }`}
                      onClick={() => handleObjectClick(object)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-800">{object.label}</span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getClinicalSignificanceBg(object.clinicalSignificance)}`}>
                            {object.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-sm font-semibold ${getConfidenceColor(object.confidence)}`}>
                            {object.confidence}%
                          </span>
                          <span className={`text-sm font-medium ${getClinicalSignificanceColor(object.clinicalSignificance)}`}>
                            {object.clinicalSignificance}
                          </span>
                        </div>
                      </div>

                      {object.attributes && (
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          {Object.entries(object.attributes).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-gray-600 capitalize">{key}:</span>
                              <span className="ml-2 font-medium text-gray-800">
                                {Array.isArray(value) ? value.join(', ') : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="text-sm text-gray-600 mb-2">
                        Location: ({object.boundingBox.x}, {object.boundingBox.y}) 
                        {object.boundingBox.width}×{object.boundingBox.height}px
                      </div>

                      {object.recommendation && (
                        <div className="text-sm text-gray-700 font-medium bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                          Recommendation: {object.recommendation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'segmentation' && (
            <div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <CircleStackIcon className="w-5 h-5 mr-2" />
                  Organ Segmentation ({selectedAnalysis.segmentations.length})
                </h3>

                {selectedAnalysis.segmentations.map((segmentation) => (
                  <div
                    key={segmentation.id}
                    className="medsight-glass p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200"
                    onClick={() => handleSegmentationClick(segmentation)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <CircleStackIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-800">{segmentation.organ}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          segmentation.quality === 'excellent' ? 'bg-medsight-ai-high/20 text-medsight-ai-high' :
                          segmentation.quality === 'good' ? 'bg-medsight-ai-medium/20 text-medsight-ai-medium' :
                          segmentation.quality === 'fair' ? 'bg-medsight-pending/20 text-medsight-pending' :
                          'bg-medsight-ai-low/20 text-medsight-ai-low'
                        }`}>
                          {segmentation.quality}
                        </span>
                      </div>
                      <span className={`text-sm font-semibold ${getConfidenceColor(segmentation.confidence)}`}>
                        {segmentation.confidence}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {segmentation.volume && (
                        <div>
                          <span className="text-gray-600">Volume:</span>
                          <span className="ml-2 font-medium text-gray-800">{segmentation.volume}L</span>
                        </div>
                      )}
                      {segmentation.area && (
                        <div>
                          <span className="text-gray-600">Area:</span>
                          <span className="ml-2 font-medium text-gray-800">{segmentation.area}cm²</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Boundaries:</span>
                        <span className="ml-2 font-medium text-gray-800">{segmentation.boundaries.length} points</span>
                      </div>
                    </div>

                    {segmentation.abnormalities && segmentation.abnormalities.length > 0 && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <div className="text-sm text-yellow-800">
                          <strong>Abnormalities detected:</strong> {segmentation.abnormalities.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="medsight-control-glass p-6 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                  <StarIcon className="w-5 h-5 mr-2" />
                  Image Quality Assessment
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Overall Quality Score:</span>
                    <span className={`text-lg font-bold ${getConfidenceColor(selectedAnalysis.overallQuality)}`}>
                      {selectedAnalysis.overallQuality}%
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Image Resolution:</span>
                      <span className="font-medium">{selectedAnalysis.technicalParams.resolution}</span>
                    </div>
                    {selectedAnalysis.technicalParams.sliceThickness && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Slice Thickness:</span>
                        <span className="font-medium">{selectedAnalysis.technicalParams.sliceThickness}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Contrast Agent:</span>
                      <span className="font-medium">
                        {selectedAnalysis.technicalParams.contrastAgent ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {selectedAnalysis.technicalParams.windowLevel && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Window Level:</span>
                        <span className="font-medium">{selectedAnalysis.technicalParams.windowLevel}</span>
                      </div>
                    )}
                    {selectedAnalysis.technicalParams.windowWidth && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Window Width:</span>
                        <span className="font-medium">{selectedAnalysis.technicalParams.windowWidth}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="medsight-control-glass p-6 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  Analysis Statistics
                </h3>
                
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-medsight-primary">
                      {selectedAnalysis.detectedObjects.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Objects</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-medsight-normal">
                        {selectedAnalysis.detectedObjects.filter(obj => obj.clinicalSignificance === 'normal').length}
                      </div>
                      <div className="text-sm text-gray-600">Normal</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-medsight-abnormal">
                        {selectedAnalysis.detectedObjects.filter(obj => obj.clinicalSignificance === 'abnormal').length}
                      </div>
                      <div className="text-sm text-gray-600">Abnormal</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Average Confidence:</div>
                    <div className={`text-lg font-bold ${getConfidenceColor(
                      selectedAnalysis.detectedObjects.reduce((acc, obj) => acc + obj.confidence, 0) / selectedAnalysis.detectedObjects.length
                    )}`}>
                      {Math.round(selectedAnalysis.detectedObjects.reduce((acc, obj) => acc + obj.confidence, 0) / selectedAnalysis.detectedObjects.length)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="medsight-viewer-glass p-12 rounded-lg text-center">
          <EyeIcon className="w-16 h-16 mx-auto mb-4 text-white/50" />
          <h3 className="text-lg font-medium text-white mb-2">No Analysis Selected</h3>
          <p className="text-white/75">Select a medical image analysis to view computer vision results</p>
        </div>
      )}
    </div>
  );
} 