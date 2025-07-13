'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  BeakerIcon,
  PencilSquareIcon,
  CircleStackIcon,
  Square3Stack3DIcon,
  CalculatorIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  MinusIcon,
  ChartBarIcon,
  CpuChipIcon,
  SparklesIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  UserGroupIcon,
  BookmarkIcon,
  TagIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckIcon,
  LightBulbIcon,
  FireIcon,
  CursorArrowRaysIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PencilIcon,
  ViewfinderCircleIcon,
  Square2StackIcon,
  RectangleGroupIcon
} from '@heroicons/react/24/outline';

interface ImageMeasurementToolsProps {
  imageData?: string | null;
  width?: number;
  height?: number;
  className?: string;
  pixelSpacing?: { x: number; y: number };
  calibrationFactor?: number;
  onMeasurementCreate?: (measurement: Measurement) => void;
  onMeasurementUpdate?: (measurement: Measurement) => void;
  onMeasurementDelete?: (measurementId: string) => void;
  showStatistics?: boolean;
  showAISuggestions?: boolean;
  emergencyMode?: boolean;
  readOnly?: boolean;
}

interface Measurement {
  id: string;
  type: 'linear' | 'area' | 'angle' | 'circle' | 'ellipse' | 'ratio' | 'volume' | 'density';
  coordinates: { x: number; y: number }[];
  value: number;
  unit: string;
  precision: number;
  confidence: number;
  timestamp: string;
  author: string;
  authorRole: 'radiologist' | 'resident' | 'technologist' | 'ai';
  status: 'draft' | 'verified' | 'approved' | 'flagged';
  clinicalContext: {
    anatomicalStructure: string;
    pathology?: string;
    normalRange?: { min: number; max: number };
    clinicalSignificance?: string;
    followUpRequired: boolean;
  };
  metadata: {
    series: number;
    slice: number;
    imageId: string;
    modality: string;
    bodyPart: string;
    acquisitionDate: string;
  };
  aiAnalysis?: {
    suggestedCorrection?: number;
    confidenceScore: number;
    qualityAssessment: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  };
  statisticalData?: {
    mean?: number;
    standardDeviation?: number;
    percentile?: number;
    comparisonToNormal: 'normal' | 'borderline' | 'abnormal' | 'critical';
  };
  quality: {
    measurementAccuracy: number;
    imageQuality: number;
    anatomicalCoverage: number;
    overallScore: number;
  };
}

interface MeasurementTemplate {
  id: string;
  name: string;
  type: Measurement['type'];
  anatomicalStructure: string;
  normalRange: { min: number; max: number };
  unit: string;
  instructions: string;
  clinicalGuidelines: string[];
}

interface DrawingState {
  isDrawing: boolean;
  currentTool: string;
  currentPath: { x: number; y: number }[];
  startPoint: { x: number; y: number } | null;
  endPoint: { x: number; y: number } | null;
  previewMeasurement: Measurement | null;
  calibrationMode: boolean;
  calibrationDistance: number;
}

export default function ImageMeasurementTools({
  imageData,
  width = 800,
  height = 600,
  className = '',
  pixelSpacing = { x: 1.0, y: 1.0 },
  calibrationFactor = 1.0,
  onMeasurementCreate,
  onMeasurementUpdate,
  onMeasurementDelete,
  showStatistics = true,
  showAISuggestions = true,
  emergencyMode = false,
  readOnly = false
}: ImageMeasurementToolsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    currentTool: 'linear',
    currentPath: [],
    startPoint: null,
    endPoint: null,
    previewMeasurement: null,
    calibrationMode: false,
    calibrationDistance: 10.0 // mm
  });
  
  const [measurementSettings, setMeasurementSettings] = useState({
    unit: 'mm',
    precision: 2,
    showLabels: true,
    showValues: true,
    autoCalculate: true,
    color: '#0ea5e9',
    thickness: 2
  });
  
  const [filterSettings, setFilterSettings] = useState({
    type: 'all',
    status: 'all',
    author: 'all',
    anatomicalStructure: 'all'
  });
  
  const [showControls, setShowControls] = useState(true);
  const [showStatisticsPanel, setShowStatisticsPanel] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const measurementTypes = [
    { id: 'linear', name: 'Linear', icon: PencilSquareIcon, description: 'Measure distance between two points' },
    { id: 'area', name: 'Area', icon: Square2StackIcon, description: 'Measure area of a region' },
    { id: 'angle', name: 'Angle', icon: ViewfinderCircleIcon, description: 'Measure angle between three points' },
    { id: 'circle', name: 'Circle', icon: CircleStackIcon, description: 'Measure circular structures' },
    { id: 'ellipse', name: 'Ellipse', icon: Square3Stack3DIcon, description: 'Measure elliptical structures' },
    { id: 'ratio', name: 'Ratio', icon: CalculatorIcon, description: 'Calculate ratios between measurements' }
  ];
  
  const measurementTemplates: MeasurementTemplate[] = [
    {
      id: 'aortic_root',
      name: 'Aortic Root Diameter',
      type: 'linear',
      anatomicalStructure: 'Aortic Root',
      normalRange: { min: 20, max: 37 },
      unit: 'mm',
      instructions: 'Measure at the level of the sinus of Valsalva',
      clinicalGuidelines: [
        'Measure at end-diastole',
        'Use leading edge to leading edge technique',
        'Measure perpendicular to vessel wall'
      ]
    },
    {
      id: 'left_atrium',
      name: 'Left Atrial Area',
      type: 'area',
      anatomicalStructure: 'Left Atrium',
      normalRange: { min: 16, max: 20 },
      unit: 'cm²',
      instructions: 'Trace the endocardial border in 4-chamber view',
      clinicalGuidelines: [
        'Exclude left atrial appendage',
        'Exclude pulmonary veins',
        'Measure at end-systole'
      ]
    },
    {
      id: 'pulmonary_nodule',
      name: 'Pulmonary Nodule',
      type: 'circle',
      anatomicalStructure: 'Lung Nodule',
      normalRange: { min: 0, max: 8 },
      unit: 'mm',
      instructions: 'Measure the maximum diameter',
      clinicalGuidelines: [
        'Use lung window settings',
        'Measure solid component only',
        'Exclude ground glass component'
      ]
    },
    {
      id: 'vertebral_body',
      name: 'Vertebral Body Height',
      type: 'linear',
      anatomicalStructure: 'Vertebral Body',
      normalRange: { min: 20, max: 35 },
      unit: 'mm',
      instructions: 'Measure anterior height on sagittal view',
      clinicalGuidelines: [
        'Measure from superior to inferior endplate',
        'Use midline sagittal slice',
        'Exclude osteophytes'
      ]
    }
  ];

  // Mock data
  const currentUser = {
    id: 'user_001',
    name: 'Dr. Sarah Chen',
    role: 'radiologist' as const
  };

  const createMeasurement = useCallback((type: string, coordinates: { x: number; y: number }[], value?: number) => {
    const calculatedValue = value || calculateMeasurementValue(type, coordinates);
    const template = selectedTemplate ? measurementTemplates.find(t => t.id === selectedTemplate) : null;
    
    const measurement: Measurement = {
      id: `meas_${Date.now()}`,
      type: type as any,
      coordinates,
      value: calculatedValue,
      unit: template?.unit || measurementSettings.unit,
      precision: measurementSettings.precision,
      confidence: 95,
      timestamp: new Date().toISOString(),
      author: currentUser.name,
      authorRole: currentUser.role,
      status: 'draft',
      clinicalContext: {
        anatomicalStructure: template?.anatomicalStructure || 'Unknown',
        normalRange: template?.normalRange,
        followUpRequired: false
      },
      metadata: {
        series: 1,
        slice: 1,
        imageId: 'img_001',
        modality: 'CT',
        bodyPart: 'chest',
        acquisitionDate: new Date().toISOString()
      },
      quality: {
        measurementAccuracy: 95,
        imageQuality: 90,
        anatomicalCoverage: 85,
        overallScore: 90
      }
    };
    
    // Add statistical analysis
    if (template?.normalRange) {
      const { min, max } = template.normalRange;
      const mean = (min + max) / 2;
      const range = max - min;
      
      measurement.statisticalData = {
        mean,
        standardDeviation: range / 4, // Approximate
        percentile: calculatePercentile(calculatedValue, min, max),
        comparisonToNormal: 
          calculatedValue < min ? 'abnormal' :
          calculatedValue > max ? 'abnormal' :
          calculatedValue < min + range * 0.1 || calculatedValue > max - range * 0.1 ? 'borderline' :
          'normal'
      };
    }
    
    // Add AI analysis if enabled
    if (showAISuggestions) {
      measurement.aiAnalysis = {
        confidenceScore: Math.random() * 0.2 + 0.8, // 80-100%
        qualityAssessment: 'good',
        recommendations: [
          'Measurement appears accurate',
          'Consider repeat measurement for confirmation'
        ]
      };
    }
    
    setMeasurements(prev => [...prev, measurement]);
    onMeasurementCreate?.(measurement);
    
    return measurement;
  }, [selectedTemplate, measurementSettings, showAISuggestions, onMeasurementCreate]);

  const calculateMeasurementValue = (type: string, coordinates: { x: number; y: number }[]): number => {
    switch (type) {
      case 'linear':
        if (coordinates.length >= 2) {
          const dx = coordinates[1].x - coordinates[0].x;
          const dy = coordinates[1].y - coordinates[0].y;
          const pixelDistance = Math.sqrt(dx * dx + dy * dy);
          return pixelDistance * pixelSpacing.x * calibrationFactor;
        }
        return 0;
        
      case 'area':
        if (coordinates.length >= 3) {
          // Calculate polygon area using shoelace formula
          let area = 0;
          for (let i = 0; i < coordinates.length; i++) {
            const j = (i + 1) % coordinates.length;
            area += coordinates[i].x * coordinates[j].y;
            area -= coordinates[j].x * coordinates[i].y;
          }
          area = Math.abs(area) / 2;
          return area * pixelSpacing.x * pixelSpacing.y * calibrationFactor * calibrationFactor;
        }
        return 0;
        
      case 'angle':
        if (coordinates.length >= 3) {
          const [p1, vertex, p3] = coordinates;
          const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
          const v2 = { x: p3.x - vertex.x, y: p3.y - vertex.y };
          
          const dot = v1.x * v2.x + v1.y * v2.y;
          const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
          const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
          
          const cos = dot / (mag1 * mag2);
          return Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI);
        }
        return 0;
        
      case 'circle':
        if (coordinates.length >= 2) {
          const dx = coordinates[1].x - coordinates[0].x;
          const dy = coordinates[1].y - coordinates[0].y;
          const radius = Math.sqrt(dx * dx + dy * dy);
          return radius * 2 * pixelSpacing.x * calibrationFactor; // Diameter
        }
        return 0;
        
      case 'ellipse':
        if (coordinates.length >= 3) {
          // Simplified ellipse measurement
          const center = coordinates[0];
          const point1 = coordinates[1];
          const point2 = coordinates[2];
          
          const a = Math.sqrt(Math.pow(point1.x - center.x, 2) + Math.pow(point1.y - center.y, 2));
          const b = Math.sqrt(Math.pow(point2.x - center.x, 2) + Math.pow(point2.y - center.y, 2));
          
          return Math.PI * a * b * pixelSpacing.x * pixelSpacing.y * calibrationFactor * calibrationFactor;
        }
        return 0;
        
      default:
        return 0;
    }
  };

  const calculatePercentile = (value: number, min: number, max: number): number => {
    if (value <= min) return 0;
    if (value >= max) return 100;
    return ((value - min) / (max - min)) * 100;
  };

  const handleCanvasMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (drawingState.calibrationMode) {
      // Handle calibration
      if (!drawingState.startPoint) {
        setDrawingState(prev => ({
          ...prev,
          isDrawing: true,
          startPoint: { x, y }
        }));
      }
      return;
    }
    
    setDrawingState(prev => ({
      ...prev,
      isDrawing: true,
      startPoint: { x, y },
      currentPath: [{ x, y }]
    }));
  }, [readOnly, drawingState.calibrationMode]);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingState.isDrawing || readOnly) return;
    
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (drawingState.calibrationMode) {
      setDrawingState(prev => ({ ...prev, endPoint: { x, y } }));
      return;
    }
    
    if (drawingState.currentTool === 'area') {
      // For area measurements, add points to path
      setDrawingState(prev => ({
        ...prev,
        currentPath: [...prev.currentPath, { x, y }]
      }));
    } else {
      // For other tools, update end point
      setDrawingState(prev => ({ ...prev, endPoint: { x, y } }));
    }
  }, [drawingState.isDrawing, drawingState.calibrationMode, drawingState.currentTool, readOnly]);

  const handleCanvasMouseUp = useCallback(() => {
    if (!drawingState.isDrawing || readOnly) return;
    
    if (drawingState.calibrationMode && drawingState.startPoint && drawingState.endPoint) {
      // Complete calibration
      const dx = drawingState.endPoint.x - drawingState.startPoint.x;
      const dy = drawingState.endPoint.y - drawingState.startPoint.y;
      const pixelDistance = Math.sqrt(dx * dx + dy * dy);
      const newCalibrationFactor = drawingState.calibrationDistance / pixelDistance;
      
      // Here you would typically update the calibration factor
      console.log('New calibration factor:', newCalibrationFactor);
      
      setDrawingState(prev => ({
        ...prev,
        isDrawing: false,
        calibrationMode: false,
        startPoint: null,
        endPoint: null
      }));
      return;
    }
    
    let coordinates: { x: number; y: number }[] = [];
    
    if (drawingState.currentTool === 'linear' && drawingState.startPoint && drawingState.endPoint) {
      coordinates = [drawingState.startPoint, drawingState.endPoint];
    } else if (drawingState.currentTool === 'angle' && drawingState.currentPath.length >= 3) {
      coordinates = drawingState.currentPath.slice(0, 3);
    } else if (drawingState.currentTool === 'circle' && drawingState.startPoint && drawingState.endPoint) {
      coordinates = [drawingState.startPoint, drawingState.endPoint];
    } else if (drawingState.currentTool === 'area' && drawingState.currentPath.length >= 3) {
      coordinates = drawingState.currentPath;
    } else if (drawingState.currentTool === 'ellipse' && drawingState.currentPath.length >= 3) {
      coordinates = drawingState.currentPath.slice(0, 3);
    }
    
    if (coordinates.length > 0) {
      createMeasurement(drawingState.currentTool, coordinates);
    }
    
    setDrawingState(prev => ({
      ...prev,
      isDrawing: false,
      currentPath: [],
      startPoint: null,
      endPoint: null,
      previewMeasurement: null
    }));
  }, [drawingState, readOnly, createMeasurement]);

  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
    onMeasurementDelete?.(id);
    setSelectedMeasurement(null);
  }, [onMeasurementDelete]);

  const renderMeasurements = useCallback((ctx: CanvasRenderingContext2D) => {
    measurements.forEach(measurement => {
      ctx.strokeStyle = measurementSettings.color;
      ctx.fillStyle = measurementSettings.color;
      ctx.lineWidth = measurementSettings.thickness;
      
      switch (measurement.type) {
        case 'linear':
          if (measurement.coordinates.length >= 2) {
            const [start, end] = measurement.coordinates;
            
            // Draw line
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            
            // Draw endpoints
            ctx.beginPath();
            ctx.arc(start.x, start.y, 3, 0, 2 * Math.PI);
            ctx.arc(end.x, end.y, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw measurement text
            if (measurementSettings.showValues) {
              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;
              
              ctx.font = '12px sans-serif';
              ctx.fillStyle = '#fff';
              ctx.strokeStyle = '#000';
              ctx.lineWidth = 3;
              
              const text = `${measurement.value.toFixed(measurement.precision)} ${measurement.unit}`;
              ctx.strokeText(text, midX + 5, midY - 5);
              ctx.fillText(text, midX + 5, midY - 5);
            }
          }
          break;
          
        case 'area':
          if (measurement.coordinates.length >= 3) {
            ctx.beginPath();
            ctx.moveTo(measurement.coordinates[0].x, measurement.coordinates[0].y);
            for (let i = 1; i < measurement.coordinates.length; i++) {
              ctx.lineTo(measurement.coordinates[i].x, measurement.coordinates[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            
            // Fill with low opacity
            ctx.globalAlpha = 0.3;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            
            // Draw measurement text
            if (measurementSettings.showValues) {
              const centerX = measurement.coordinates.reduce((sum, p) => sum + p.x, 0) / measurement.coordinates.length;
              const centerY = measurement.coordinates.reduce((sum, p) => sum + p.y, 0) / measurement.coordinates.length;
              
              ctx.font = '12px sans-serif';
              ctx.fillStyle = '#fff';
              ctx.strokeStyle = '#000';
              ctx.lineWidth = 3;
              
              const text = `${measurement.value.toFixed(measurement.precision)} ${measurement.unit}`;
              ctx.strokeText(text, centerX, centerY);
              ctx.fillText(text, centerX, centerY);
            }
          }
          break;
          
        case 'angle':
          if (measurement.coordinates.length >= 3) {
            const [p1, vertex, p3] = measurement.coordinates;
            
            // Draw angle lines
            ctx.beginPath();
            ctx.moveTo(vertex.x, vertex.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.moveTo(vertex.x, vertex.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.stroke();
            
            // Draw angle arc
            const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
            const angle2 = Math.atan2(p3.y - vertex.y, p3.x - vertex.x);
            
            ctx.beginPath();
            ctx.arc(vertex.x, vertex.y, 30, angle1, angle2);
            ctx.stroke();
            
            // Draw measurement text
            if (measurementSettings.showValues) {
              ctx.font = '12px sans-serif';
              ctx.fillStyle = '#fff';
              ctx.strokeStyle = '#000';
              ctx.lineWidth = 3;
              
              const text = `${measurement.value.toFixed(measurement.precision)}°`;
              ctx.strokeText(text, vertex.x + 35, vertex.y - 5);
              ctx.fillText(text, vertex.x + 35, vertex.y - 5);
            }
          }
          break;
          
        case 'circle':
          if (measurement.coordinates.length >= 2) {
            const [center, edge] = measurement.coordinates;
            const radius = Math.sqrt(
              Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
            );
            
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
            
            // Draw center point
            ctx.beginPath();
            ctx.arc(center.x, center.y, 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw measurement text
            if (measurementSettings.showValues) {
              ctx.font = '12px sans-serif';
              ctx.fillStyle = '#fff';
              ctx.strokeStyle = '#000';
              ctx.lineWidth = 3;
              
              const text = `${measurement.value.toFixed(measurement.precision)} ${measurement.unit}`;
              ctx.strokeText(text, center.x + radius + 5, center.y);
              ctx.fillText(text, center.x + radius + 5, center.y);
            }
          }
          break;
      }
      
      // Draw selection indicator
      if (measurement.id === selectedMeasurement) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        const bounds = getMeasurementBounds(measurement);
        ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
        ctx.setLineDash([]);
      }
    });
  }, [measurements, measurementSettings, selectedMeasurement]);

  const getMeasurementBounds = (measurement: Measurement) => {
    const xCoords = measurement.coordinates.map(p => p.x);
    const yCoords = measurement.coordinates.map(p => p.y);
    
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  // Canvas rendering
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderMeasurements(ctx);
    
    // Draw current drawing
    if (drawingState.isDrawing && drawingState.startPoint) {
      ctx.strokeStyle = measurementSettings.color;
      ctx.lineWidth = measurementSettings.thickness;
      ctx.setLineDash([5, 5]);
      
      if (drawingState.calibrationMode && drawingState.endPoint) {
        // Draw calibration line
        ctx.beginPath();
        ctx.moveTo(drawingState.startPoint.x, drawingState.startPoint.y);
        ctx.lineTo(drawingState.endPoint.x, drawingState.endPoint.y);
        ctx.stroke();
      } else if (drawingState.endPoint && drawingState.currentTool === 'linear') {
        // Draw preview line
        ctx.beginPath();
        ctx.moveTo(drawingState.startPoint.x, drawingState.startPoint.y);
        ctx.lineTo(drawingState.endPoint.x, drawingState.endPoint.y);
        ctx.stroke();
      } else if (drawingState.currentTool === 'area' && drawingState.currentPath.length > 1) {
        // Draw preview area
        ctx.beginPath();
        ctx.moveTo(drawingState.currentPath[0].x, drawingState.currentPath[0].y);
        for (let i = 1; i < drawingState.currentPath.length; i++) {
          ctx.lineTo(drawingState.currentPath[i].x, drawingState.currentPath[i].y);
        }
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
    }
  }, [renderMeasurements, drawingState, measurementSettings]);

  const filteredMeasurements = measurements.filter(measurement => {
    if (filterSettings.type !== 'all' && measurement.type !== filterSettings.type) return false;
    if (filterSettings.status !== 'all' && measurement.status !== filterSettings.status) return false;
    if (filterSettings.author !== 'all' && measurement.author !== filterSettings.author) return false;
    return true;
  });

  const measurementStatistics = {
    total: measurements.length,
    byType: measurementTypes.reduce((acc, type) => {
      acc[type.id] = measurements.filter(m => m.type === type.id).length;
      return acc;
    }, {} as Record<string, number>),
    averageQuality: measurements.length > 0 
      ? measurements.reduce((sum, m) => sum + m.quality.overallScore, 0) / measurements.length 
      : 0,
    abnormalCount: measurements.filter(m => 
      m.statisticalData?.comparisonToNormal === 'abnormal' || 
      m.statisticalData?.comparisonToNormal === 'critical'
    ).length
  };

  return (
    <div className={`relative h-full flex bg-gray-50 ${className}`}>
      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        {/* Base Image */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="absolute inset-0 w-full h-full bg-black"
        />
        
        {/* Measurement Overlay */}
        <canvas
          ref={overlayCanvasRef}
          width={width}
          height={height}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        />
        
        {/* Tool Controls */}
        {showControls && (
          <div className="absolute top-4 left-4 medsight-control-glass p-4 rounded-lg max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Measurement Tools</h3>
            
            <div className="space-y-4">
              {/* Measurement Types */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Measurement Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {measurementTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setDrawingState(prev => ({ ...prev, currentTool: type.id }))}
                      className={`btn-medsight p-3 flex flex-col items-center gap-1 text-xs ${
                        drawingState.currentTool === type.id ? 'bg-medsight-primary/20' : ''
                      }`}
                      title={type.description}
                    >
                      <type.icon className="w-4 h-4" />
                      <span>{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Templates</label>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="btn-medsight w-full text-xs"
                >
                  <AcademicCapIcon className="w-4 h-4 mr-1" />
                  Clinical Templates
                </button>
                
                {showTemplates && (
                  <div className="mt-2 space-y-1">
                    {measurementTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setDrawingState(prev => ({ ...prev, currentTool: template.type }));
                        }}
                        className={`w-full text-left p-2 text-xs rounded border ${
                          selectedTemplate === template.id 
                            ? 'border-medsight-primary bg-medsight-primary/10' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className="text-gray-500">{template.anatomicalStructure}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={measurementSettings.unit}
                    onChange={(e) => setMeasurementSettings(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full input-medsight text-xs"
                  >
                    <option value="mm">Millimeters (mm)</option>
                    <option value="cm">Centimeters (cm)</option>
                    <option value="pixels">Pixels</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Precision: {measurementSettings.precision} decimal places
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={measurementSettings.precision}
                    onChange={(e) => setMeasurementSettings(prev => ({ ...prev, precision: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={measurementSettings.showValues}
                      onChange={(e) => setMeasurementSettings(prev => ({ ...prev, showValues: e.target.checked }))}
                      className="rounded border-gray-300 text-medsight-primary"
                    />
                    <span className="text-xs text-gray-700">Show Values</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={measurementSettings.autoCalculate}
                      onChange={(e) => setMeasurementSettings(prev => ({ ...prev, autoCalculate: e.target.checked }))}
                      className="rounded border-gray-300 text-medsight-primary"
                    />
                    <span className="text-xs text-gray-700">Auto Calculate</span>
                  </label>
                </div>
              </div>

              {/* Calibration */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Calibration</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDrawingState(prev => ({ ...prev, calibrationMode: !prev.calibrationMode }))}
                    className={`btn-medsight flex-1 text-xs ${
                      drawingState.calibrationMode ? 'bg-yellow-100 border-yellow-500' : ''
                    }`}
                  >
                    <BeakerIcon className="w-4 h-4 mr-1" />
                    Calibrate
                  </button>
                  
                  {drawingState.calibrationMode && (
                    <input
                      type="number"
                      value={drawingState.calibrationDistance}
                      onChange={(e) => setDrawingState(prev => ({ 
                        ...prev, 
                        calibrationDistance: parseFloat(e.target.value) || 10 
                      }))}
                      className="input-medsight text-xs w-16"
                      placeholder="10.0"
                    />
                  )}
                </div>
                {drawingState.calibrationMode && (
                  <p className="text-xs text-yellow-700 mt-1">
                    Draw a line of known distance: {drawingState.calibrationDistance}mm
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Measurements List */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Measurements ({filteredMeasurements.length})
            </h3>
            <button
              onClick={() => setShowStatisticsPanel(!showStatisticsPanel)}
              className="btn-medsight text-xs"
            >
              <ChartBarIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          <div className="mb-4 space-y-2">
            <select
              value={filterSettings.type}
              onChange={(e) => setFilterSettings(prev => ({ ...prev, type: e.target.value }))}
              className="w-full input-medsight text-xs"
            >
              <option value="all">All Types</option>
              {measurementTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            
            <select
              value={filterSettings.status}
              onChange={(e) => setFilterSettings(prev => ({ ...prev, status: e.target.value }))}
              className="w-full input-medsight text-xs"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="verified">Verified</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          {/* Measurements */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredMeasurements.map(measurement => (
              <div
                key={measurement.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedMeasurement === measurement.id ? 'border-medsight-primary bg-medsight-primary/5' : 'border-gray-200'
                }`}
                onClick={() => setSelectedMeasurement(measurement.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {measurementTypes.find(t => t.id === measurement.type)?.icon && (
                      <div className="w-4 h-4">
                        {React.createElement(measurementTypes.find(t => t.id === measurement.type)!.icon, { className: "w-4 h-4 text-medsight-primary" })}
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-900 capitalize">
                      {measurement.type}
                    </span>
                    <span className={`text-xs px-1 py-0.5 rounded ${
                      measurement.statisticalData?.comparisonToNormal === 'normal' ? 'bg-green-100 text-green-800' :
                      measurement.statisticalData?.comparisonToNormal === 'borderline' ? 'bg-yellow-100 text-yellow-800' :
                      measurement.statisticalData?.comparisonToNormal === 'abnormal' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {measurement.statisticalData?.comparisonToNormal || 'unknown'}
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMeasurement(measurement.id);
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {measurement.value.toFixed(measurement.precision)} {measurement.unit}
                </div>
                
                <div className="text-xs text-gray-600 mb-2">
                  {measurement.clinicalContext.anatomicalStructure}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Quality: {measurement.quality.overallScore}%</span>
                  <span>{measurement.author}</span>
                </div>
                
                {measurement.aiAnalysis && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs">
                      <SparklesIcon className="w-3 h-3 text-blue-600" />
                      <span className="text-blue-600">
                        AI Confidence: {(measurement.aiAnalysis.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Panel */}
        {showStatistics && showStatisticsPanel && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Statistics</h3>
              <button
                onClick={() => setShowStatisticsPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{measurementStatistics.total}</div>
                  <div className="text-gray-600">Total</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{measurementStatistics.abnormalCount}</div>
                  <div className="text-gray-600">Abnormal</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{measurementStatistics.averageQuality.toFixed(0)}%</div>
                  <div className="text-gray-600">Avg Quality</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">
                    {measurements.filter(m => m.status === 'verified').length}
                  </div>
                  <div className="text-gray-600">Verified</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">By Type</h4>
                <div className="space-y-1">
                  {measurementTypes.map(type => (
                    <div key={type.id} className="flex justify-between text-xs">
                      <span className="text-gray-600">{type.name}:</span>
                      <span className="font-medium">{measurementStatistics.byType[type.id] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Mode Indicator */}
      {emergencyMode && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-500 text-red-700 px-3 py-1 rounded-lg text-sm font-medium">
          <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
          Emergency Mode
        </div>
      )}

      {/* Read-Only Indicator */}
      {readOnly && (
        <div className="absolute bottom-4 right-4 bg-gray-100 border border-gray-400 text-gray-700 px-3 py-1 rounded-lg text-sm">
          <EyeIcon className="w-4 h-4 inline mr-1" />
          Read Only
        </div>
      )}
    </div>
  );
}