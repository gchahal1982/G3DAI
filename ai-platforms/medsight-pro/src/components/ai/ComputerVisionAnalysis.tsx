'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PhotoIcon,
  EyeIcon,
  CpuChipIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PlusIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
  CursorArrowRaysIcon,
  Square3Stack3DIcon,
  PaintBrushIcon,
  BeakerIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  BoltIcon,
  FireIcon,
  CubeIcon,
  CircleStackIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

import type { 
  AIModel, 
  AIAnalysisResult,
  Detection,
  Segmentation,
  Finding,
  Classification,
  Heatmap,
  BoundingBox
} from '@/lib/ai/ai-analysis-integration';
import { aiAnalysisIntegration } from '@/lib/ai/ai-analysis-integration';

interface ComputerVisionAnalysisProps {
  studyUID?: string;
  seriesUID?: string;
  imageUID?: string;
  imageData?: any;
  onAnalysisComplete?: (result: AIAnalysisResult) => void;
  className?: string;
}

interface AnnotationTool {
  type: 'rectangle' | 'circle' | 'polygon' | 'point' | 'freehand';
  name: string;
  icon: React.ReactNode;
  active: boolean;
}

interface ViewerSettings {
  zoom: number;
  contrast: number;
  brightness: number;
  windowCenter: number;
  windowWidth: number;
  showAnnotations: boolean;
  showDetections: boolean;
  showHeatmaps: boolean;
  showSegmentations: boolean;
  showMeasurements: boolean;
  overlayOpacity: number;
}

const DEFAULT_VIEWER_SETTINGS: ViewerSettings = {
  zoom: 1.0,
  contrast: 1.0,
  brightness: 0.0,
  windowCenter: 0,
  windowWidth: 4096,
  showAnnotations: true,
  showDetections: true,
  showHeatmaps: true,
  showSegmentations: true,
  showMeasurements: true,
  overlayOpacity: 0.7
};

const FINDING_SEVERITY_COLORS: Record<string, string> = {
  'minimal': 'bg-green-100 text-green-800',
  'mild': 'bg-yellow-100 text-yellow-800',
  'moderate': 'bg-orange-100 text-orange-800',
  'severe': 'bg-red-100 text-red-800',
  'critical': 'bg-red-200 text-red-900'
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  'normal': 'bg-green-100 text-green-800',
  'abnormal': 'bg-red-100 text-red-800',
  'suspicious': 'bg-orange-100 text-orange-800',
  'benign': 'bg-blue-100 text-blue-800',
  'malignant': 'bg-red-200 text-red-900'
};

export default function ComputerVisionAnalysis({ 
  studyUID,
  seriesUID,
  imageUID,
  imageData,
  onAnalysisComplete,
  className = '' 
}: ComputerVisionAnalysisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const [viewerSettings, setViewerSettings] = useState<ViewerSettings>(DEFAULT_VIEWER_SETTINGS);
  const [activeTab, setActiveTab] = useState<'findings' | 'detections' | 'segmentations' | 'heatmaps' | 'raw'>('findings');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  
  const [annotationTools] = useState<AnnotationTool[]>([
    {
      type: 'rectangle',
      name: 'Rectangle',
      icon: <div className="w-4 h-4 border-2 border-current" />,
      active: false
    },
    {
      type: 'circle',
      name: 'Circle',
      icon: <div className="w-4 h-4 border-2 border-current rounded-full" />,
      active: false
    },
    {
      type: 'point',
      name: 'Point',
      icon: <CursorArrowRaysIcon className="w-4 h-4" />,
      active: false
    },
    {
      type: 'freehand',
      name: 'Freehand',
      icon: <PaintBrushIcon className="w-4 h-4" />,
      active: false
    }
  ]);

  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    loadAvailableModels();
    initializeCanvas();
  }, []);

  useEffect(() => {
    if (imageData) {
      loadImageData();
    }
  }, [imageData]);

  useEffect(() => {
    if (currentImage && canvasContext) {
      renderImage();
    }
  }, [currentImage, canvasContext, viewerSettings, analysisResult]);

  const loadAvailableModels = async () => {
    try {
      setLoading(true);
      const availableModels = await aiAnalysisIntegration.getAvailableModels({
        type: 'classification',
        category: 'radiology'
      });
      
      // Also get detection and segmentation models
      const detectionModels = await aiAnalysisIntegration.getAvailableModels({
        type: 'detection',
        category: 'radiology'
      });
      
      const segmentationModels = await aiAnalysisIntegration.getAvailableModels({
        type: 'segmentation',
        category: 'radiology'
      });
      
      const allModels = [...availableModels, ...detectionModels, ...segmentationModels];
      setModels(allModels);
      
      // Select first active model by default
      const activeModel = allModels.find(m => m.status === 'active');
      if (activeModel) {
        setSelectedModel(activeModel);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      setCanvasContext(ctx);
    }
  };

  const loadImageData = async () => {
    if (!imageData) return;

    try {
      const img = new Image();
      img.onload = () => {
        setCurrentImage(img);
        if (canvasRef.current) {
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
        }
      };
      
      // Handle different image data formats
      if (typeof imageData === 'string') {
        img.src = imageData;
      } else if (imageData instanceof Blob) {
        img.src = URL.createObjectURL(imageData);
      } else if (imageData instanceof ArrayBuffer) {
        const blob = new Blob([imageData]);
        img.src = URL.createObjectURL(blob);
      }
    } catch (err) {
      setError('Failed to load image data');
    }
  };

  const renderImage = useCallback(() => {
    if (!currentImage || !canvasContext || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvasContext;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply viewer settings
    ctx.save();
    ctx.scale(viewerSettings.zoom, viewerSettings.zoom);
    
    // Apply window/level settings (simplified)
    ctx.filter = `contrast(${viewerSettings.contrast * 100}%) brightness(${100 + viewerSettings.brightness * 100}%)`;
    
    // Draw image
    ctx.drawImage(currentImage, 0, 0);
    
    // Draw analysis overlays
    if (analysisResult) {
      if (viewerSettings.showDetections && analysisResult.results.detections) {
        drawDetections(ctx, analysisResult.results.detections);
      }
      
      if (viewerSettings.showSegmentations && analysisResult.results.segmentations) {
        drawSegmentations(ctx, analysisResult.results.segmentations);
      }
      
      if (viewerSettings.showHeatmaps && analysisResult.explanation?.heatmaps) {
        drawHeatmaps(ctx, analysisResult.explanation.heatmaps);
      }
    }
    
    ctx.restore();
  }, [currentImage, canvasContext, viewerSettings, analysisResult]);

  const drawDetections = (ctx: CanvasRenderingContext2D, detections: Detection[]) => {
    detections.forEach((detection, index) => {
      const box = detection.boundingBox;
      
      // Set color based on confidence
      const alpha = Math.max(0.3, detection.confidence);
      ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
      ctx.lineWidth = 2;
      
      // Draw bounding box
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      // Draw label
      ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
      ctx.font = '12px Arial';
      const label = `${detection.class} (${(detection.confidence * 100).toFixed(1)}%)`;
      ctx.fillText(label, box.x, box.y - 5);
    });
  };

  const drawSegmentations = (ctx: CanvasRenderingContext2D, segmentations: Segmentation[]) => {
    segmentations.forEach((segmentation, index) => {
      const colors = [
        [255, 0, 0],    // Red
        [0, 255, 0],    // Green
        [0, 0, 255],    // Blue
        [255, 255, 0],  // Yellow
        [255, 0, 255]   // Magenta
      ];
      
      const color = colors[index % colors.length];
      const alpha = viewerSettings.overlayOpacity * segmentation.confidence;
      
      // Draw segmentation mask (simplified)
      ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
      const box = segmentation.boundingBox;
      ctx.fillRect(box.x, box.y, box.width, box.height);
      
      // Draw outline
      ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      // Draw label
      ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
      ctx.font = '10px Arial';
      ctx.fillText(segmentation.class, box.x, box.y - 2);
    });
  };

  const drawHeatmaps = (ctx: CanvasRenderingContext2D, heatmaps: Heatmap[]) => {
    heatmaps.forEach((heatmap) => {
      if (!heatmap.overlay || !viewerSettings.showHeatmaps) return;
      
      // Create heatmap overlay (simplified)
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      const data = imageData.data;
      
      // Apply heatmap coloring (simplified implementation)
      for (let i = 0; i < data.length; i += 4) {
        const intensity = Math.random() * heatmap.threshold; // Simplified
        if (intensity > heatmap.threshold) {
          data[i] = Math.min(255, data[i] + intensity * 100);     // Red
          data[i + 3] = Math.min(255, data[i + 3] * heatmap.opacity); // Alpha
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    });
  };

  const runAnalysis = async () => {
    if (!selectedModel || !imageData) {
      setError('Please select a model and load an image');
      return;
    }

    try {
      setAnalyzing(true);
      setProgress(0);
      setError(null);

      // Submit analysis request
      const requestId = await aiAnalysisIntegration.submitAnalysisRequest({
        modelId: selectedModel.id,
        inputData: {
          type: 'dicom_image',
          data: imageData,
          format: 'image',
          metadata: {
            studyUID,
            seriesUID,
            imageUID
          }
        },
        parameters: {
          confidence_threshold: 0.7,
          include_heatmaps: true,
          include_explanations: true,
          include_uncertainty: true
        },
        priority: 'medium',
        requestedBy: 'current_user',
        studyUID,
        seriesUID,
        patientId: 'current_patient',
        clinicalContext: {
          indication: 'AI-assisted analysis',
          urgency: 'routine'
        }
      });

      if (!requestId) {
        throw new Error('Failed to submit analysis request');
      }

      // Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const result = await aiAnalysisIntegration.getAnalysisResult(requestId);
          
          if (result) {
            if (result.status === 'completed') {
              setAnalysisResult(result);
              setProgress(100);
              clearInterval(pollInterval);
              setAnalyzing(false);
              onAnalysisComplete?.(result);
            } else if (result.status === 'failed') {
              setError(result.errors.join(', ') || 'Analysis failed');
              clearInterval(pollInterval);
              setAnalyzing(false);
            } else {
              // Still processing, update progress
              setProgress(prev => Math.min(90, prev + 10));
            }
          }
        } catch (err) {
          console.error('Error polling for results:', err);
        }
      }, 2000);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (analyzing) {
          setError('Analysis timed out');
          setAnalyzing(false);
        }
      }, 300000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setAnalyzing(false);
    }
  };

  const handleZoomIn = () => {
    setViewerSettings(prev => ({ ...prev, zoom: Math.min(5.0, prev.zoom * 1.2) }));
  };

  const handleZoomOut = () => {
    setViewerSettings(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom / 1.2) }));
  };

  const handleResetView = () => {
    setViewerSettings(DEFAULT_VIEWER_SETTINGS);
  };

  const handleSettingChange = (key: keyof ViewerSettings, value: any) => {
    setViewerSettings(prev => ({ ...prev, [key]: value }));
  };

  const exportResults = () => {
    if (!analysisResult) return;

    const exportData = {
      analysis: analysisResult,
      settings: viewerSettings,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-analysis-${analysisResult.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`medsight-glass p-6 rounded-xl ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medsight-primary"></div>
            <span className="text-medsight-primary font-medium">Loading Computer Vision...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`medsight-glass p-6 rounded-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <PhotoIcon className="w-6 h-6 text-medsight-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Computer Vision Analysis</h2>
            <p className="text-sm text-gray-600">
              AI-powered medical image analysis and interpretation
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {analysisResult && (
            <button
              onClick={exportResults}
              className="btn-medsight"
              title="Export results"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={runAnalysis}
            disabled={!selectedModel || !imageData || analyzing}
            className="btn-medsight"
            title="Run analysis"
          >
            {analyzing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
            <span className="ml-2">
              {analyzing ? 'Analyzing...' : 'Run Analysis'}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="space-y-4">
          {/* Model Selection */}
          <div className="medsight-control-glass p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <CpuChipIcon className="w-5 h-5 text-medsight-primary" />
              <span>AI Model</span>
            </h3>
            <select
              value={selectedModel?.id || ''}
              onChange={(e) => {
                const model = models.find(m => m.id === e.target.value);
                setSelectedModel(model || null);
              }}
              className="input-medsight w-full"
            >
              <option value="">Select AI Model</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.type}) - {(model.accuracy * 100).toFixed(1)}%
                </option>
              ))}
            </select>
            {selectedModel && (
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <div><strong>Type:</strong> {selectedModel.type}</div>
                <div><strong>Category:</strong> {selectedModel.category}</div>
                <div><strong>Accuracy:</strong> {(selectedModel.accuracy * 100).toFixed(1)}%</div>
                <div><strong>Status:</strong> 
                  <span className={`ml-1 px-2 py-1 text-xs rounded ${
                    selectedModel.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedModel.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Progress */}
          {analyzing && (
            <div className="medsight-control-glass p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-medsight-primary" />
                <span>Analysis Progress</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-medsight-primary h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Viewer Controls */}
          <div className="medsight-control-glass p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-medsight-primary" />
              <span>Viewer Controls</span>
            </h3>
            <div className="space-y-3">
              {/* Zoom Controls */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Zoom</span>
                <div className="flex items-center space-x-2">
                  <button onClick={handleZoomOut} className="btn-medsight p-1">
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-mono w-16 text-center">
                    {(viewerSettings.zoom * 100).toFixed(0)}%
                  </span>
                  <button onClick={handleZoomIn} className="btn-medsight p-1">
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contrast */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Contrast</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={viewerSettings.contrast}
                  onChange={(e) => handleSettingChange('contrast', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Brightness */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Brightness</label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={viewerSettings.brightness}
                  onChange={(e) => handleSettingChange('brightness', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Overlay Controls */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={viewerSettings.showAnnotations}
                    onChange={(e) => handleSettingChange('showAnnotations', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Show Annotations</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={viewerSettings.showHeatmaps}
                    onChange={(e) => handleSettingChange('showHeatmaps', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Show Heatmaps</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={viewerSettings.showSegmentations}
                    onChange={(e) => handleSettingChange('showSegmentations', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Show Segmentations</span>
                </label>
              </div>

              <button
                onClick={handleResetView}
                className="w-full btn-medsight text-sm"
              >
                Reset View
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="medsight-control-glass p-4 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center space-x-2">
                <XCircleIcon className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-700">Analysis Error</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          )}
        </div>

        {/* Image Viewer */}
        <div className="lg:col-span-2">
          <div className="medsight-viewer-glass p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">Medical Image Viewer</h3>
              <div className="flex items-center space-x-2">
                <button className="text-gray-300 hover:text-white p-1">
                  <ArrowsPointingOutIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div ref={containerRef} className="relative bg-black rounded overflow-hidden" style={{ minHeight: '400px' }}>
              {currentImage ? (
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full object-contain"
                  style={{ width: '100%', height: 'auto' }}
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-400">
                    <PhotoIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>No image loaded</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mt-6 medsight-control-glass p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5 text-medsight-primary" />
              <span>Analysis Results</span>
            </h3>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Confidence: <span className={`font-medium ${
                  analysisResult.confidence >= 0.9 ? 'medsight-confidence-high' :
                  analysisResult.confidence >= 0.7 ? 'medsight-confidence-medium' :
                  'medsight-confidence-low'
                }`}>
                  {(analysisResult.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Processing Time: {(analysisResult.processingTime / 1000).toFixed(2)}s
              </div>
            </div>
          </div>

          {/* Results Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'findings', name: 'Findings', count: analysisResult.results.findings.length },
                { id: 'detections', name: 'Detections', count: analysisResult.results.detections.length },
                { id: 'segmentations', name: 'Segmentations', count: analysisResult.results.segmentations.length },
                { id: 'heatmaps', name: 'Heatmaps', count: analysisResult.explanation?.heatmaps?.length || 0 },
                { id: 'raw', name: 'Raw Data', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-medsight-primary text-medsight-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count > 0 && (
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === tab.id ? 'bg-medsight-primary text-white' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'findings' && (
            <div className="space-y-3">
              {analysisResult.results.findings.map((finding, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedFinding(selectedFinding?.id === finding.id ? null : finding)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          finding.type === 'abnormal' ? 'bg-red-100 text-red-800' :
                          finding.type === 'normal' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {finding.type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${FINDING_SEVERITY_COLORS[finding.severity]}`}>
                          {finding.severity}
                        </span>
                        <span className="text-sm text-gray-600">
                          {(finding.confidence * 100).toFixed(1)}% confidence
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{finding.category}</h4>
                      <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                      <div className="text-sm text-gray-500">
                        Location: {finding.location.organ} {finding.location.region}
                        {finding.location.side && ` (${finding.location.side})`}
                      </div>
                    </div>
                  </div>
                  
                  {selectedFinding?.id === finding.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      {finding.differentialDiagnosis.length > 0 && (
                        <div>
                          <strong className="text-sm">Differential Diagnosis:</strong>
                          <ul className="text-sm text-gray-600 ml-4 list-disc">
                            {finding.differentialDiagnosis.map((diagnosis, idx) => (
                              <li key={idx}>{diagnosis}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <strong className="text-sm">Clinical Significance:</strong>
                        <span className="text-sm text-gray-600 ml-2">{finding.clinicalSignificance}</span>
                      </div>
                      <div>
                        <strong className="text-sm">Follow-up:</strong>
                        <span className="text-sm text-gray-600 ml-2">{finding.followUp}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {analysisResult.results.findings.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BeakerIcon className="w-8 h-8 mx-auto mb-2" />
                  <p>No findings detected</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'detections' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.results.detections.map((detection, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{detection.class}</h4>
                    <span className="text-sm text-gray-600">
                      {(detection.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Position: ({detection.boundingBox.x}, {detection.boundingBox.y})</div>
                    <div>Size: {detection.boundingBox.width} × {detection.boundingBox.height}</div>
                    {detection.boundingBox.label && (
                      <div>Label: {detection.boundingBox.label}</div>
                    )}
                  </div>
                </div>
              ))}
              
              {analysisResult.results.detections.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <Square3Stack3DIcon className="w-8 h-8 mx-auto mb-2" />
                  <p>No detections found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'segmentations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.results.segmentations.map((segmentation, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{segmentation.class}</h4>
                    <span className="text-sm text-gray-600">
                      {(segmentation.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Area: {segmentation.area.toFixed(2)} pixels²</div>
                    {segmentation.volume && (
                      <div>Volume: {segmentation.volume.toFixed(2)} voxels</div>
                    )}
                    <div>
                      Center: ({segmentation.centerOfMass[0].toFixed(1)}, {segmentation.centerOfMass[1].toFixed(1)})
                    </div>
                  </div>
                </div>
              ))}
              
              {analysisResult.results.segmentations.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <PaintBrushIcon className="w-8 h-8 mx-auto mb-2" />
                  <p>No segmentations found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 overflow-auto max-h-96">
                {JSON.stringify(analysisResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 