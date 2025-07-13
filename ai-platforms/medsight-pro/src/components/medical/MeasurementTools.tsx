'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  Square3Stack3DIcon,
  CalculatorIcon,
  CubeIcon,
  CircleStackIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentTextIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  CpuChipIcon,
  AcademicCapIcon,
  BeakerIcon,
  FireIcon,
  ShieldCheckIcon,
  MapPinIcon,
  TagIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  PlusIcon,
  MinusIcon,
  Squares2X2Icon,
  ViewfinderCircleIcon,
  ScaleIcon,
  VariableIcon,
  PresentationChartLineIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';

export interface Point {
  x: number;
  y: number;
  z?: number;
}

export interface Measurement {
  id: string;
  type: 'linear' | 'area' | 'angle' | 'volume' | 'ellipse' | 'freehand';
  points: Point[];
  result: {
    value: number;
    unit: string;
    precision: number;
  };
  metadata: {
    name: string;
    description?: string;
    category: 'clinical' | 'research' | 'calibration' | 'annotation';
    createdBy: string;
    createdAt: Date;
    modifiedAt?: Date;
    seriesId?: string;
    imageId?: string;
    pixelSpacing?: [number, number];
    sliceThickness?: number;
  };
  style: {
    color: string;
    thickness: number;
    dashPattern?: number[];
    showLabel: boolean;
    labelPosition?: 'start' | 'end' | 'center';
  };
  validation: {
    isValid: boolean;
    confidence?: number;
    aiGenerated?: boolean;
    verified?: boolean;
    verifiedBy?: string;
    verifiedAt?: Date;
  };
  statistics?: {
    mean?: number;
    std?: number;
    min?: number;
    max?: number;
    histogram?: number[];
  };
}

export interface MeasurementTemplate {
  id: string;
  name: string;
  type: Measurement['type'];
  category: string;
  description: string;
  defaultStyle: Measurement['style'];
  instructions: string;
}

export interface MeasurementToolsProps {
  measurements: Measurement[];
  onMeasurementAdd: (measurement: Omit<Measurement, 'id'>) => void;
  onMeasurementUpdate: (id: string, updates: Partial<Measurement>) => void;
  onMeasurementDelete: (id: string) => void;
  selectedMeasurementId?: string | null;
  onMeasurementSelect: (id: string | null) => void;
  pixelSpacing?: [number, number];
  sliceThickness?: number;
  calibrationFactor?: number;
  enableStatistics?: boolean;
  enableAI?: boolean;
  readOnly?: boolean;
  currentUser?: {
    id: string;
    name: string;
    role: string;
  };
}

export function MeasurementTools({
  measurements,
  onMeasurementAdd,
  onMeasurementUpdate,
  onMeasurementDelete,
  selectedMeasurementId,
  onMeasurementSelect,
  pixelSpacing = [1, 1],
  sliceThickness = 1,
  calibrationFactor = 1,
  enableStatistics = true,
  enableAI = false,
  readOnly = false,
  currentUser = { id: 'user1', name: 'Dr. Smith', role: 'Radiologist' }
}: MeasurementToolsProps) {
  const [activeTool, setActiveTool] = useState<'select' | Measurement['type']>('select');
  const [showHistory, setShowHistory] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<string | null>(null);
  const [newMeasurementName, setNewMeasurementName] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'value' | 'type'>('date');
  const [showTemplates, setShowTemplates] = useState(false);
  const [customTemplate, setCustomTemplate] = useState<Partial<MeasurementTemplate>>({});

  const measurementTemplates: MeasurementTemplate[] = [
    {
      id: 'linear-length',
      name: 'Linear Distance',
      type: 'linear',
      category: 'clinical',
      description: 'Measure straight-line distance between two points',
      defaultStyle: { color: '#2563eb', thickness: 2, showLabel: true, labelPosition: 'center' },
      instructions: 'Click two points to measure distance'
    },
    {
      id: 'area-rectangle',
      name: 'Rectangular Area',
      type: 'area',
      category: 'clinical',
      description: 'Measure rectangular area',
      defaultStyle: { color: '#16a34a', thickness: 2, showLabel: true, labelPosition: 'center' },
      instructions: 'Click and drag to define rectangle'
    },
    {
      id: 'area-ellipse',
      name: 'Elliptical Area',
      type: 'ellipse',
      category: 'clinical',
      description: 'Measure elliptical area',
      defaultStyle: { color: '#7c3aed', thickness: 2, showLabel: true, labelPosition: 'center' },
      instructions: 'Click center then drag to define ellipse'
    },
    {
      id: 'angle-cobb',
      name: 'Cobb Angle',
      type: 'angle',
      category: 'clinical',
      description: 'Measure Cobb angle for spinal curvature',
      defaultStyle: { color: '#dc2626', thickness: 2, showLabel: true, labelPosition: 'center' },
      instructions: 'Click three points to define angle'
    },
    {
      id: 'volume-sphere',
      name: 'Spherical Volume',
      type: 'volume',
      category: 'research',
      description: 'Calculate spherical volume from diameter',
      defaultStyle: { color: '#ea580c', thickness: 2, showLabel: true, labelPosition: 'center' },
      instructions: 'Measure diameter to calculate volume'
    }
  ];

  const calculateLinearMeasurement = (points: Point[]): number => {
    if (points.length < 2) return 0;
    const dx = (points[1].x - points[0].x) * pixelSpacing[0] * calibrationFactor;
    const dy = (points[1].y - points[0].y) * pixelSpacing[1] * calibrationFactor;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const calculateAreaMeasurement = (points: Point[]): number => {
    if (points.length < 3) return 0;
    
    // Simple polygon area calculation using shoelace formula
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    area = Math.abs(area) / 2;
    
    // Convert to physical units
    return area * pixelSpacing[0] * pixelSpacing[1] * calibrationFactor * calibrationFactor;
  };

  const calculateAngleMeasurement = (points: Point[]): number => {
    if (points.length < 3) return 0;
    
    const [p1, p2, p3] = points;
    const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    let angle = Math.abs(angle2 - angle1);
    
    if (angle > Math.PI) {
      angle = 2 * Math.PI - angle;
    }
    
    return (angle * 180) / Math.PI;
  };

  const calculateVolumeMeasurement = (points: Point[], type: string): number => {
    if (type === 'volume' && points.length >= 2) {
      // Spherical volume from diameter
      const diameter = calculateLinearMeasurement(points);
      const radius = diameter / 2;
      return (4 / 3) * Math.PI * Math.pow(radius, 3);
    }
    return 0;
  };

  const calculateEllipseMeasurement = (points: Point[]): number => {
    if (points.length < 2) return 0;
    
    const dx = Math.abs(points[1].x - points[0].x) * pixelSpacing[0] * calibrationFactor;
    const dy = Math.abs(points[1].y - points[0].y) * pixelSpacing[1] * calibrationFactor;
    
    const a = dx / 2; // semi-major axis
    const b = dy / 2; // semi-minor axis
    
    return Math.PI * a * b;
  };

  const getFilteredMeasurements = () => {
    return measurements
      .filter(m => filterCategory === 'all' || m.metadata.category === filterCategory)
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.metadata.name.localeCompare(b.metadata.name);
          case 'value':
            return b.result.value - a.result.value;
          case 'type':
            return a.type.localeCompare(b.type);
          case 'date':
          default:
            return b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime();
        }
      });
  };

  const getResultValue = (measurement: Measurement): string => {
    const value = measurement.result.value;
    const precision = measurement.result.precision;
    return `${value.toFixed(precision)} ${measurement.result.unit}`;
  };

  const getTypeIcon = (type: Measurement['type']) => {
    switch (type) {
      case 'linear': return ScaleIcon;
      case 'area': return Square3Stack3DIcon;
      case 'ellipse': return CircleStackIcon;
      case 'angle': return MapPinIcon;
      case 'volume': return CubeIcon;
      case 'freehand': return PencilIcon;
      default: return ScaleIcon;
    }
  };

  const getTypeColor = (type: Measurement['type']) => {
    switch (type) {
      case 'linear': return 'text-blue-600';
      case 'area': return 'text-green-600';
      case 'ellipse': return 'text-purple-600';
      case 'angle': return 'text-red-600';
      case 'volume': return 'text-orange-600';
      case 'freehand': return 'text-gray-600';
      default: return 'text-medsight-primary';
    }
  };

  const handleMeasurementEdit = (measurementId: string, newName: string) => {
    onMeasurementUpdate(measurementId, {
      metadata: {
        ...measurements.find(m => m.id === measurementId)?.metadata!,
        name: newName,
        modifiedAt: new Date()
      }
    });
    setEditingMeasurement(null);
    setNewMeasurementName('');
  };

  const handleMeasurementVerify = (measurementId: string) => {
    onMeasurementUpdate(measurementId, {
      validation: {
        ...measurements.find(m => m.id === measurementId)?.validation!,
        verified: true,
        verifiedBy: currentUser.name,
        verifiedAt: new Date()
      }
    });
  };

  const handleTemplateApply = (template: MeasurementTemplate) => {
    setActiveTool(template.type);
    setShowTemplates(false);
  };

  const exportMeasurements = () => {
    const data = getFilteredMeasurements().map(m => ({
      name: m.metadata.name,
      type: m.type,
      value: m.result.value,
      unit: m.result.unit,
      category: m.metadata.category,
      createdBy: m.metadata.createdBy,
      createdAt: m.metadata.createdAt.toISOString(),
      verified: m.validation.verified
    }));
    
    const csv = [
      ['Name', 'Type', 'Value', 'Unit', 'Category', 'Created By', 'Created At', 'Verified'],
      ...data.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'measurements.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMeasurements = getFilteredMeasurements();
  const totalMeasurements = measurements.length;
  const verifiedMeasurements = measurements.filter(m => m.validation.verified).length;
  const aiMeasurements = measurements.filter(m => m.validation.aiGenerated).length;

  return (
    <div className="space-y-4">
      {/* Measurement Tools Header */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="medsight-control-glass p-2 rounded-lg">
              <ScaleIcon className="w-5 h-5 text-medsight-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-medsight-primary">
                Measurement Tools
              </h3>
              <div className="text-xs text-medsight-primary/70">
                {totalMeasurements} measurements • {verifiedMeasurements} verified
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg"
              title="Templates"
            >
              <DocumentTextIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg"
              title="History"
            >
              <ClockIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={exportMeasurements}
              className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg"
              title="Export"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tool Selection */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <button
            onClick={() => setActiveTool('select')}
            disabled={readOnly}
            className={`p-3 rounded-lg transition-all ${
              activeTool === 'select' 
                ? 'bg-medsight-primary text-white' 
                : 'text-medsight-primary hover:bg-medsight-primary/10'
            } disabled:opacity-50`}
          >
            <div className="flex flex-col items-center space-y-1">
              <EyeIcon className="w-4 h-4" />
              <span className="text-xs">Select</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTool('linear')}
            disabled={readOnly}
            className={`p-3 rounded-lg transition-all ${
              activeTool === 'linear' 
                ? 'bg-medsight-primary text-white' 
                : 'text-medsight-primary hover:bg-medsight-primary/10'
            } disabled:opacity-50`}
          >
            <div className="flex flex-col items-center space-y-1">
              <ScaleIcon className="w-4 h-4" />
              <span className="text-xs">Linear</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTool('area')}
            disabled={readOnly}
            className={`p-3 rounded-lg transition-all ${
              activeTool === 'area' 
                ? 'bg-medsight-primary text-white' 
                : 'text-medsight-primary hover:bg-medsight-primary/10'
            } disabled:opacity-50`}
          >
            <div className="flex flex-col items-center space-y-1">
              <Square3Stack3DIcon className="w-4 h-4" />
              <span className="text-xs">Area</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTool('ellipse')}
            disabled={readOnly}
            className={`p-3 rounded-lg transition-all ${
              activeTool === 'ellipse' 
                ? 'bg-medsight-primary text-white' 
                : 'text-medsight-primary hover:bg-medsight-primary/10'
            } disabled:opacity-50`}
          >
            <div className="flex flex-col items-center space-y-1">
              <CircleStackIcon className="w-4 h-4" />
              <span className="text-xs">Ellipse</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTool('angle')}
            disabled={readOnly}
            className={`p-3 rounded-lg transition-all ${
              activeTool === 'angle' 
                ? 'bg-medsight-primary text-white' 
                : 'text-medsight-primary hover:bg-medsight-primary/10'
            } disabled:opacity-50`}
          >
            <div className="flex flex-col items-center space-y-1">
              <MapPinIcon className="w-4 h-4" />
              <span className="text-xs">Angle</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTool('volume')}
            disabled={readOnly}
            className={`p-3 rounded-lg transition-all ${
              activeTool === 'volume' 
                ? 'bg-medsight-primary text-white' 
                : 'text-medsight-primary hover:bg-medsight-primary/10'
            } disabled:opacity-50`}
          >
            <div className="flex flex-col items-center space-y-1">
              <CubeIcon className="w-4 h-4" />
              <span className="text-xs">Volume</span>
            </div>
          </button>
        </div>

        {/* Calibration Info */}
        <div className="mt-4 p-3 bg-medsight-primary/5 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-medsight-primary/70">Pixel Spacing:</span>
              <span className="ml-2 font-medium text-medsight-primary">
                {pixelSpacing.join(' x ')} mm
              </span>
            </div>
            <div>
              <span className="text-medsight-primary/70">Slice Thickness:</span>
              <span className="ml-2 font-medium text-medsight-primary">
                {sliceThickness} mm
              </span>
            </div>
            <div>
              <span className="text-medsight-primary/70">Calibration:</span>
              <span className="ml-2 font-medium text-medsight-primary">
                {calibrationFactor.toFixed(3)}
              </span>
            </div>
            <div>
              <span className="text-medsight-primary/70">Active Tool:</span>
              <span className="ml-2 font-medium text-medsight-primary capitalize">
                {activeTool}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="medsight-glass p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-medsight-primary mb-3">
            Measurement Templates
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {measurementTemplates.map((template) => (
              <div
                key={template.id}
                className="p-3 medsight-control-glass rounded-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleTemplateApply(template)}
              >
                <div className="flex items-start space-x-3">
                  {React.createElement(getTypeIcon(template.type), {
                    className: `w-5 h-5 ${getTypeColor(template.type)}`
                  })}
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-medsight-primary">
                      {template.name}
                    </h5>
                    <p className="text-xs text-medsight-primary/70 mt-1">
                      {template.description}
                    </p>
                    <p className="text-xs text-medsight-primary/60 mt-1">
                      {template.instructions}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Measurements List */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-medsight-primary">
            Measurements ({filteredMeasurements.length})
          </h4>
          
          <div className="flex items-center space-x-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs border border-medsight-primary/20 rounded px-2 py-1 bg-medsight-glass"
            >
              <option value="all">All Categories</option>
              <option value="clinical">Clinical</option>
              <option value="research">Research</option>
              <option value="calibration">Calibration</option>
              <option value="annotation">Annotation</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs border border-medsight-primary/20 rounded px-2 py-1 bg-medsight-glass"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="value">Sort by Value</option>
              <option value="type">Sort by Type</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredMeasurements.map((measurement) => {
            const TypeIcon = getTypeIcon(measurement.type);
            const isSelected = measurement.id === selectedMeasurementId;
            const isEditing = editingMeasurement === measurement.id;
            
            return (
              <div
                key={measurement.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-medsight-primary bg-medsight-primary/10' 
                    : 'border-medsight-primary/20 hover:bg-medsight-primary/5'
                }`}
                onClick={() => onMeasurementSelect(measurement.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <TypeIcon className={`w-5 h-5 ${getTypeColor(measurement.type)} mt-0.5`} />
                    
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={newMeasurementName}
                            onChange={(e) => setNewMeasurementName(e.target.value)}
                            className="input-medsight text-xs flex-1"
                            placeholder="Measurement name"
                            autoFocus
                          />
                          <button
                            onClick={() => handleMeasurementEdit(measurement.id, newMeasurementName)}
                            className="p-1 text-medsight-normal hover:text-medsight-normal/70"
                          >
                            <CheckIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingMeasurement(null)}
                            className="p-1 text-medsight-critical hover:text-medsight-critical/70"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="text-sm font-medium text-medsight-primary truncate">
                            {measurement.metadata.name}
                          </h5>
                          {measurement.validation.aiGenerated && (
                            <BeakerIcon className="w-3 h-3 text-medsight-ai-high" />
                          )}
                          {measurement.validation.verified && (
                            <CheckIcon className="w-3 h-3 text-medsight-normal" />
                          )}
                        </div>
                      )}
                      
                      <div className="text-lg font-bold text-medsight-primary mb-1">
                        {getResultValue(measurement)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-medsight-primary/70">
                        <span className="capitalize">{measurement.type}</span>
                        <span>{measurement.metadata.category}</span>
                        <span>{measurement.metadata.createdBy}</span>
                        <span>{measurement.metadata.createdAt.toLocaleDateString()}</span>
                      </div>
                      
                      {measurement.validation.confidence && (
                        <div className="text-xs text-medsight-ai-high mt-1">
                          Confidence: {(measurement.validation.confidence * 100).toFixed(1)}%
                        </div>
                      )}
                      
                      {measurement.statistics && enableStatistics && (
                        <div className="mt-2 p-2 bg-medsight-primary/5 rounded text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div>Mean: {measurement.statistics.mean?.toFixed(2)}</div>
                            <div>Std: {measurement.statistics.std?.toFixed(2)}</div>
                            <div>Min: {measurement.statistics.min?.toFixed(2)}</div>
                            <div>Max: {measurement.statistics.max?.toFixed(2)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {!readOnly && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMeasurement(measurement.id);
                            setNewMeasurementName(measurement.metadata.name);
                          }}
                          className="p-1 text-medsight-primary/50 hover:text-medsight-primary"
                          title="Edit"
                        >
                          <PencilIcon className="w-3 h-3" />
                        </button>
                        
                        {!measurement.validation.verified && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMeasurementVerify(measurement.id);
                            }}
                            className="p-1 text-medsight-normal/50 hover:text-medsight-normal"
                            title="Verify"
                          >
                            <CheckIcon className="w-3 h-3" />
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMeasurementDelete(measurement.id);
                          }}
                          className="p-1 text-medsight-critical/50 hover:text-medsight-critical"
                          title="Delete"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredMeasurements.length === 0 && (
            <div className="text-center py-8">
              <ScaleIcon className="w-8 h-8 text-medsight-primary/50 mx-auto mb-2" />
              <p className="text-sm text-medsight-primary/70">
                No measurements found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="medsight-glass p-4 rounded-xl">
        <h4 className="text-sm font-semibold text-medsight-primary mb-3">
          Summary Statistics
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-medsight-primary">{totalMeasurements}</div>
            <div className="text-xs text-medsight-primary/70">Total</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-medsight-normal">{verifiedMeasurements}</div>
            <div className="text-xs text-medsight-normal/70">Verified</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-medsight-ai-high">{aiMeasurements}</div>
            <div className="text-xs text-medsight-ai-high/70">AI Generated</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-medsight-secondary">
              {measurements.filter(m => m.metadata.category === 'clinical').length}
            </div>
            <div className="text-xs text-medsight-secondary/70">Clinical</div>
          </div>
        </div>
      </div>
    </div>
  );
} 