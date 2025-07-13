'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { 
  ChartBarIcon as ChartBarIconSolid,
  Square3Stack3DIcon as Square3Stack3DIconSolid,
  EyeIcon as EyeIconSolid,
  CheckIcon as CheckIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';
import React from 'react';

interface Point2D {
  x: number;
  y: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface MeasurementBase {
  id: string;
  type: string;
  label: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt?: Date;
  modifiedBy?: string;
  visible: boolean;
  color: string;
  lineWidth: number;
  imageId?: string;
  seriesId?: string;
  studyId?: string;
  pixelSpacing?: [number, number]; // mm per pixel
  sliceThickness?: number; // mm
  units: 'mm' | 'cm' | 'pixels' | 'degrees' | 'mm²' | 'cm²' | 'mm³' | 'cm³';
}

interface LinearMeasurement extends MeasurementBase {
  type: 'length' | 'distance';
  points: [Point2D, Point2D];
  length: number; // in specified units
  calibrated: boolean;
}

interface AreaMeasurement extends MeasurementBase {
  type: 'area' | 'ellipse' | 'polygon' | 'rectangle' | 'circle';
  points: Point2D[];
  area: number; // in specified units
  perimeter?: number; // in specified units
  centerPoint?: Point2D;
  majorAxis?: number;
  minorAxis?: number;
}

interface AngleMeasurement extends MeasurementBase {
  type: 'angle' | 'cobb';
  points: [Point2D, Point2D, Point2D]; // vertex is middle point
  angle: number; // in degrees
  bisector?: Point2D;
}

interface VolumeMeasurement extends MeasurementBase {
  type: 'volume' | 'roi3d';
  points: Point3D[];
  volume: number; // in specified units
  slices: number[];
  centerPoint?: Point3D;
}

interface ComplexMeasurement extends MeasurementBase {
  type: 'curve' | 'spline' | 'contour';
  points: Point2D[];
  length: number;
  curvature?: number;
  tangents?: Point2D[];
}

interface CalibrationData {
  pixelSpacing: [number, number]; // mm per pixel in x, y
  sliceThickness: number; // mm
  knownDistance?: {
    points: [Point2D, Point2D];
    realWorldDistance: number; // mm
  };
  calibrationFactor: number;
  calibrated: boolean;
  calibrationMethod: 'dicom' | 'manual' | 'reference';
}

type Measurement = LinearMeasurement | AreaMeasurement | AngleMeasurement | VolumeMeasurement | ComplexMeasurement;

interface MeasurementTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  icon: any;
  color: string;
  defaultLabel: string;
  medicalSignificance?: string;
  normalRanges?: {
    min?: number;
    max?: number;
    units: string;
    population?: string;
  };
}

interface MeasurementToolsProps {
  measurements: Measurement[];
  onMeasurementAdd: (measurement: Measurement) => void;
  onMeasurementUpdate: (id: string, updates: Partial<Measurement>) => void;
  onMeasurementDelete: (id: string) => void;
  onMeasurementSelect?: (id: string | null) => void;
  selectedMeasurementId?: string | null;
  calibration?: CalibrationData;
  onCalibrationUpdate?: (calibration: CalibrationData) => void;
  modality?: string;
  anatomicalRegion?: string;
  className?: string;
  readOnly?: boolean;
  showTemplates?: boolean;
  showStatistics?: boolean;
  enableExport?: boolean;
  currentUser?: string;
}

export default function MeasurementTools({
  measurements,
  onMeasurementAdd,
  onMeasurementUpdate,
  onMeasurementDelete,
  onMeasurementSelect,
  selectedMeasurementId,
  calibration,
  onCalibrationUpdate,
  modality = 'CT',
  anatomicalRegion = 'General',
  className = '',
  readOnly = false,
  showTemplates = true,
  showStatistics = true,
  enableExport = true,
  currentUser = 'Dr. User'
}: MeasurementToolsProps) {
  const [activeTool, setActiveTool] = useState<string>('length');
  const [showCalibration, setShowCalibration] = useState(false);
  const [showTemplatesPanel, setShowTemplatesPanel] = useState(false);
  const [showStatisticsPanel, setShowStatisticsPanel] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'type' | 'date' | 'user' | 'none'>('type');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'value' | 'type'>('date');
  const [showOnlyVisible, setShowOnlyVisible] = useState(false);

  const measurementTools = [
    {
      id: 'length',
      name: 'Length',
      icon: ChartBarIconSolid,
      description: 'Measure linear distance',
      cursor: 'crosshair',
      color: '#ff0000'
    },
    {
      id: 'area',
      name: 'Area',
      icon: Squares2X2Icon,
      description: 'Measure area (polygon)',
      cursor: 'crosshair',
      color: '#00ff00'
    },
    {
      id: 'circle',
      name: 'Circle',
      icon: CircleStackIcon,
      description: 'Measure circular area',
      cursor: 'crosshair',
      color: '#0000ff'
    },
    {
      id: 'ellipse',
      name: 'Ellipse',
      icon: CircleStackIcon,
      description: 'Measure elliptical area',
      cursor: 'crosshair',
      color: '#ff8000'
    },
    {
      id: 'rectangle',
      name: 'Rectangle',
      icon: Squares2X2Icon,
      description: 'Measure rectangular area',
      cursor: 'crosshair',
      color: '#8000ff'
    },
    {
      id: 'angle',
      name: 'Angle',
      icon: VariableIcon,
      description: 'Measure angle',
      cursor: 'crosshair',
      color: '#ff0080'
    },
    {
      id: 'cobb',
      name: 'Cobb Angle',
      icon: VariableIcon,
      description: 'Measure Cobb angle',
      cursor: 'crosshair',
      color: '#0080ff'
    },
    {
      id: 'curve',
      name: 'Curve',
      icon: PresentationChartLineIcon,
      description: 'Measure curved length',
      cursor: 'crosshair',
      color: '#80ff00'
    }
  ];

  const measurementTemplates: MeasurementTemplate[] = [
    {
      id: 'cardiac_lv_diameter',
      name: 'LV End-Diastolic Diameter',
      description: 'Left ventricular end-diastolic diameter',
      category: 'Cardiac',
      type: 'length',
      icon: HeartIconSolid,
      color: '#ff0000',
      defaultLabel: 'LVEDD',
      medicalSignificance: 'Assesses left ventricular size and function',
      normalRanges: {
        min: 42,
        max: 56,
        units: 'mm',
        population: 'Adult'
      }
    },
    {
      id: 'cardiac_aortic_root',
      name: 'Aortic Root Diameter',
      description: 'Aortic root diameter at sinus of Valsalva',
      category: 'Cardiac',
      type: 'length',
      icon: HeartIcon,
      color: '#ff4000',
      defaultLabel: 'Aortic Root',
      normalRanges: {
        min: 29,
        max: 45,
        units: 'mm',
        population: 'Adult'
      }
    },
    {
      id: 'brain_ventricle',
      name: 'Ventricular Width',
      description: 'Lateral ventricular width',
      category: 'Neurological',
      type: 'length',
      icon: CpuChipIcon,
      color: '#0080ff',
      defaultLabel: 'Ventricle Width',
      normalRanges: {
        min: 0,
        max: 10,
        units: 'mm',
        population: 'Adult'
      }
    },
    {
      id: 'lung_nodule',
      name: 'Pulmonary Nodule',
      description: 'Pulmonary nodule measurement',
      category: 'Thoracic',
      type: 'area',
      icon: BeakerIcon,
      color: '#00ff80',
      defaultLabel: 'Lung Nodule',
      medicalSignificance: 'Assessment of pulmonary lesions'
    },
    {
      id: 'liver_lesion',
      name: 'Liver Lesion',
      description: 'Hepatic lesion measurement',
      category: 'Abdominal',
      type: 'area',
      icon: Square3Stack3DIconSolid,
      color: '#ff8000',
      defaultLabel: 'Liver Lesion'
    },
    {
      id: 'bone_cortical_thickness',
      name: 'Cortical Thickness',
      description: 'Bone cortical thickness measurement',
      category: 'Musculoskeletal',
      type: 'length',
      icon: AcademicCapIcon,
      color: '#ffffff',
      defaultLabel: 'Cortical Thickness'
    },
    {
      id: 'spine_cobb_angle',
      name: 'Spine Cobb Angle',
      description: 'Scoliosis Cobb angle measurement',
      category: 'Musculoskeletal',
      type: 'cobb',
      icon: VariableIcon,
      color: '#ff00ff',
      defaultLabel: 'Cobb Angle',
      medicalSignificance: 'Assessment of spinal curvature',
      normalRanges: {
        min: 0,
        max: 10,
        units: 'degrees',
        population: 'Normal spine'
      }
    },
    {
      id: 'kidney_length',
      name: 'Renal Length',
      description: 'Kidney bipolar length',
      category: 'Genitourinary',
      type: 'length',
      icon: BeakerIcon,
      color: '#8000ff',
      defaultLabel: 'Kidney Length',
      normalRanges: {
        min: 90,
        max: 130,
        units: 'mm',
        population: 'Adult'
      }
    }
  ];

  const categories = ['all', ...Array.from(new Set(measurementTemplates.map(t => t.category)))];

  const filteredMeasurements = measurements.filter(measurement => {
    if (showOnlyVisible && !measurement.visible) return false;
    if (searchTerm && !measurement.label.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterCategory !== 'all') {
      const template = measurementTemplates.find(t => t.type === measurement.type);
      if (!template || template.category !== filterCategory) return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.label.localeCompare(b.label);
      case 'date':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'value':
        if ('length' in a && 'length' in b) return (b as LinearMeasurement).length - (a as LinearMeasurement).length;
        if ('area' in a && 'area' in b) return (b as AreaMeasurement).area - (a as AreaMeasurement).area;
        if ('angle' in a && 'angle' in b) return (b as AngleMeasurement).angle - (a as AngleMeasurement).angle;
        return 0;
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  const groupedMeasurements = groupBy === 'none' ? 
    { 'All': filteredMeasurements } : 
    filteredMeasurements.reduce((groups, measurement) => {
      let key: string;
      switch (groupBy) {
        case 'type':
          key = measurement.type.charAt(0).toUpperCase() + measurement.type.slice(1);
          break;
        case 'date':
          key = measurement.createdAt.toDateString();
          break;
        case 'user':
          key = measurement.createdBy;
          break;
        default:
          key = 'All';
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(measurement);
      return groups;
    }, {} as Record<string, Measurement[]>);

  const calculateStatistics = () => {
    const stats = {
      total: measurements.length,
      visible: measurements.filter(m => m.visible).length,
      byType: {} as Record<string, number>,
      recentlyAdded: measurements.filter(m => 
        (Date.now() - m.createdAt.getTime()) < 24 * 60 * 60 * 1000
      ).length
    };

    measurements.forEach(m => {
      stats.byType[m.type] = (stats.byType[m.type] || 0) + 1;
    });

    return stats;
  };

  const getTemplate = (type: string) => {
    return measurementTemplates.find(t => t.type === type);
  };

  const formatValue = (measurement: Measurement) => {
    const precision = measurement.units === 'mm' || measurement.units === 'cm' ? 1 : 0;
    
    if ('length' in measurement) {
      return `${(measurement as LinearMeasurement).length.toFixed(precision)} ${measurement.units}`;
    }
    if ('area' in measurement) {
      return `${(measurement as AreaMeasurement).area.toFixed(precision)} ${measurement.units}`;
    }
    if ('angle' in measurement) {
      return `${(measurement as AngleMeasurement).angle.toFixed(1)}°`;
    }
    if ('volume' in measurement) {
      return `${(measurement as VolumeMeasurement).volume.toFixed(precision)} ${measurement.units}`;
    }
    return 'N/A';
  };

  const isValueNormal = (measurement: Measurement) => {
    const template = getTemplate(measurement.type);
    if (!template?.normalRanges) return null;

    let value = 0;
    if ('length' in measurement) value = (measurement as LinearMeasurement).length;
    else if ('area' in measurement) value = (measurement as AreaMeasurement).area;
    else if ('angle' in measurement) value = (measurement as AngleMeasurement).angle;
    else return null;

    const { min = 0, max = Infinity } = template.normalRanges;
    if (value < min) return 'below';
    if (value > max) return 'above';
    return 'normal';
  };

  const getNormalRangeColor = (status: 'normal' | 'above' | 'below' | null) => {
    switch (status) {
      case 'normal': return 'text-medsight-normal';
      case 'above': return 'text-medsight-abnormal';
      case 'below': return 'text-medsight-pending';
      default: return 'text-slate-600';
    }
  };

  const applyTemplate = (template: MeasurementTemplate) => {
    // This would typically be called when user selects a template and then draws the measurement
    setActiveTool(template.type);
    setShowTemplatesPanel(false);
  };

  const exportMeasurements = () => {
    const exportData = {
      measurements: filteredMeasurements,
      calibration,
      metadata: {
        modality,
        anatomicalRegion,
        exportDate: new Date().toISOString(),
        exportedBy: currentUser
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `measurements_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    let report = `Medical Measurement Report\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `Modality: ${modality}\n`;
    report += `Region: ${anatomicalRegion}\n`;
    report += `Total Measurements: ${filteredMeasurements.length}\n\n`;

    Object.entries(groupedMeasurements).forEach(([group, measurements]) => {
      report += `${group}:\n`;
      measurements.forEach(measurement => {
        const template = getTemplate(measurement.type);
        const normalStatus = isValueNormal(measurement);
        report += `  • ${measurement.label}: ${formatValue(measurement)}`;
        if (normalStatus && template?.normalRanges) {
          const status = normalStatus === 'normal' ? 'Normal' : 
                        normalStatus === 'above' ? 'Above normal' : 'Below normal';
          report += ` (${status})`;
        }
        report += `\n`;
      });
      report += `\n`;
    });

    const reportBlob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(reportBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `measurement_report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateMeasurementVisibility = (id: string, visible: boolean) => {
    onMeasurementUpdate(id, { visible });
  };

  const updateMeasurementLabel = (id: string, label: string) => {
    onMeasurementUpdate(id, { label });
    setEditingMeasurement(null);
  };

  const deleteMeasurement = (id: string) => {
    if (confirm('Are you sure you want to delete this measurement?')) {
      onMeasurementDelete(id);
    }
  };

  const statistics = calculateStatistics();

  return (
    <div className={`medsight-control-glass rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-medsight-primary">Measurement Tools</h3>
          <div className="flex items-center space-x-2">
            {showTemplates && (
              <button
                onClick={() => setShowTemplatesPanel(!showTemplates)}
                className="p-2 rounded-lg hover:bg-slate-100"
                title="Templates"
              >
                <TagIcon className="w-4 h-4" />
              </button>
            )}
            {showStatistics && (
              <button
                onClick={() => setShowStatisticsPanel(!showStatistics)}
                className="p-2 rounded-lg hover:bg-slate-100"
                title="Statistics"
              >
                <ChartBarIconSolid className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowCalibration(!showCalibration)}
              className="p-2 rounded-lg hover:bg-slate-100"
              title="Calibration"
            >
              <ScaleIcon className="w-4 h-4" />
            </button>
            {enableExport && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={exportMeasurements}
                  className="p-2 rounded-lg hover:bg-slate-100"
                  title="Export Data"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={generateReport}
                  className="p-2 rounded-lg hover:bg-slate-100"
                  title="Generate Report"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Measurement Tools */}
      {!readOnly && (
        <div className="p-4 border-b border-slate-200">
          <h4 className="font-medium text-slate-900 mb-3">Measurement Tools</h4>
          <div className="grid grid-cols-4 gap-2">
            {measurementTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  activeTool === tool.id
                    ? 'border-medsight-primary bg-medsight-primary/10 text-medsight-primary'
                    : 'border-slate-200 hover:border-medsight-primary/50 text-slate-700'
                }`}
                title={tool.description}
              >
                <tool.icon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="p-4 border-b border-slate-200">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search measurements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-medsight"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-slate-300 rounded px-3 py-2 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="border border-slate-300 rounded px-2 py-1 text-xs"
              >
                <option value="none">No Grouping</option>
                <option value="type">Group by Type</option>
                <option value="date">Group by Date</option>
                <option value="user">Group by User</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-slate-300 rounded px-2 py-1 text-xs"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="value">Sort by Value</option>
                <option value="type">Sort by Type</option>
              </select>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showOnlyVisible}
                onChange={(e) => setShowOnlyVisible(e.target.checked)}
                className="rounded border-slate-300 text-medsight-primary"
              />
              <span className="text-xs text-slate-600">Visible only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Measurements List */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedMeasurements).length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <ChartBarIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No measurements found</p>
            {!readOnly && (
              <p className="text-sm mt-1">Select a tool above to start measuring</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMeasurements).map(([group, groupMeasurements]) => (
              <div key={group}>
                {groupBy !== 'none' && (
                  <h5 className="font-medium text-slate-900 mb-2 flex items-center">
                    <span>{group}</span>
                    <span className="ml-2 text-xs text-slate-500">({groupMeasurements.length})</span>
                  </h5>
                )}
                <div className="space-y-2">
                  {groupMeasurements.map((measurement) => {
                    const template = getTemplate(measurement.type);
                    const normalStatus = isValueNormal(measurement);
                    const isSelected = selectedMeasurementId === measurement.id;
                    const isEditing = editingMeasurement === measurement.id;

                    return (
                      <div
                        key={measurement.id}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-medsight-primary bg-medsight-primary/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => onMeasurementSelect?.(measurement.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div 
                              className="w-3 h-3 rounded-full mt-1"
                              style={{ backgroundColor: measurement.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                {template && <template.icon className="w-4 h-4 text-slate-500" />}
                                {isEditing ? (
                                  <div className="flex items-center space-x-2 flex-1">
                                    <input
                                      type="text"
                                      value={measurement.label}
                                      onChange={(e) => updateMeasurementLabel(measurement.id, e.target.value)}
                                      className="flex-1 text-sm input-medsight"
                                      autoFocus
                                      onBlur={() => setEditingMeasurement(null)}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          setEditingMeasurement(null);
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => setEditingMeasurement(null)}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckIconSolid className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <h6 className="font-medium text-slate-900 truncate flex-1">
                                    {measurement.label}
                                  </h6>
                                )}
                                <span className={`text-sm font-medium ${getNormalRangeColor(normalStatus)}`}>
                                  {formatValue(measurement)}
                                </span>
                              </div>
                              
                              {measurement.description && (
                                <p className="text-xs text-slate-600 mb-1">{measurement.description}</p>
                              )}
                              
                              <div className="flex items-center space-x-4 text-xs text-slate-500">
                                <span>Type: {measurement.type}</span>
                                <span>By: {measurement.createdBy}</span>
                                <span>{measurement.createdAt.toLocaleDateString()}</span>
                                {'calibrated' in measurement && measurement.calibrated && (
                                  <span className="text-green-600 flex items-center">
                                    <CheckIconSolid className="w-3 h-3 mr-1" />
                                    Calibrated
                                  </span>
                                )}
                              </div>

                              {normalStatus && template?.normalRanges && (
                                <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Normal range:</span>
                                    <span>
                                      {template.normalRanges.min}-{template.normalRanges.max} {template.normalRanges.units}
                                    </span>
                                  </div>
                                  <div className={`font-medium ${getNormalRangeColor(normalStatus)}`}>
                                    Status: {normalStatus === 'normal' ? 'Normal' : 
                                            normalStatus === 'above' ? 'Above normal' : 'Below normal'}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateMeasurementVisibility(measurement.id, !measurement.visible);
                              }}
                              className="p-1 rounded hover:bg-slate-100"
                              title={measurement.visible ? 'Hide' : 'Show'}
                            >
                              {measurement.visible ? 
                                <EyeIconSolid className="w-4 h-4 text-slate-600" /> : 
                                <EyeIcon className="w-4 h-4 text-slate-400" />
                              }
                            </button>
                            {!readOnly && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingMeasurement(measurement.id);
                                  }}
                                  className="p-1 rounded hover:bg-slate-100"
                                  title="Edit"
                                >
                                  <PencilIcon className="w-4 h-4 text-slate-600" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMeasurement(measurement.id);
                                  }}
                                  className="p-1 rounded hover:bg-red-100 text-red-600"
                                  title="Delete"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Measurement Templates</h3>
              <button 
                onClick={() => setShowTemplatesPanel(false)}
                className="btn-medsight p-2"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-6">
              {categories.slice(1).map(category => {
                const categoryTemplates = measurementTemplates.filter(t => t.category === category);
                
                return (
                  <div key={category}>
                    <h4 className="font-medium text-slate-900 mb-3">{category}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {categoryTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className="p-4 rounded-lg border border-slate-200 hover:border-medsight-primary hover:bg-medsight-primary/5 transition-colors text-left"
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <template.icon className="w-5 h-5 text-medsight-primary" />
                            <span className="font-medium text-slate-900">{template.name}</span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                          {template.normalRanges && (
                            <div className="text-xs text-slate-500">
                              Normal: {template.normalRanges.min}-{template.normalRanges.max} {template.normalRanges.units}
                            </div>
                          )}
                          {template.medicalSignificance && (
                            <div className="text-xs text-slate-500 mt-1">
                              {template.medicalSignificance}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Statistics Panel */}
      {showStatistics && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Measurement Statistics</h3>
              <button 
                onClick={() => setShowStatisticsPanel(false)}
                className="btn-medsight p-2"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="medsight-ai-glass p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total measurements:</span>
                      <span className="font-medium">{statistics.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Visible:</span>
                      <span className="font-medium">{statistics.visible}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Recently added:</span>
                      <span className="font-medium">{statistics.recentlyAdded}</span>
                    </div>
                  </div>
                </div>

                <div className="medsight-ai-glass p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">By Type</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(statistics.byType).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span className="text-slate-600 capitalize">{type}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {calibration && (
                <div className="medsight-ai-glass p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Calibration Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Method:</span>
                      <span className="font-medium capitalize">{calibration.calibrationMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Pixel spacing:</span>
                      <span className="font-medium">
                        {calibration.pixelSpacing.map(s => s.toFixed(3)).join(' × ')} mm/pixel
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Slice thickness:</span>
                      <span className="font-medium">{calibration.sliceThickness.toFixed(1)} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className={`font-medium ${calibration.calibrated ? 'text-green-600' : 'text-red-600'}`}>
                        {calibration.calibrated ? 'Calibrated' : 'Not calibrated'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Calibration Panel */}
      {showCalibration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">Calibration Settings</h3>
              <button 
                onClick={() => setShowCalibration(false)}
                className="btn-medsight p-2"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="medsight-ai-glass p-4 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-3">Current Calibration</h4>
                {calibration ? (
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 mb-1">X Pixel Spacing (mm)</label>
                        <input
                          type="number"
                          value={calibration.pixelSpacing[0]}
                          onChange={(e) => onCalibrationUpdate?.({
                            ...calibration,
                            pixelSpacing: [parseFloat(e.target.value), calibration.pixelSpacing[1]]
                          })}
                          step="0.001"
                          className="input-medsight"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 mb-1">Y Pixel Spacing (mm)</label>
                        <input
                          type="number"
                          value={calibration.pixelSpacing[1]}
                          onChange={(e) => onCalibrationUpdate?.({
                            ...calibration,
                            pixelSpacing: [calibration.pixelSpacing[0], parseFloat(e.target.value)]
                          })}
                          step="0.001"
                          className="input-medsight"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">Slice Thickness (mm)</label>
                      <input
                        type="number"
                        value={calibration.sliceThickness}
                        onChange={(e) => onCalibrationUpdate?.({
                          ...calibration,
                          sliceThickness: parseFloat(e.target.value)
                        })}
                        step="0.1"
                        className="input-medsight"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">Calibration Method</label>
                      <select
                        value={calibration.calibrationMethod}
                        onChange={(e) => onCalibrationUpdate?.({
                          ...calibration,
                          calibrationMethod: e.target.value as any
                        })}
                        className="input-medsight"
                      >
                        <option value="dicom">DICOM Metadata</option>
                        <option value="manual">Manual Entry</option>
                        <option value="reference">Reference Object</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600">No calibration data available</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCalibration(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (calibration) {
                      onCalibrationUpdate?.({ ...calibration, calibrated: true });
                    }
                    setShowCalibration(false);
                  }}
                  className="btn-medsight"
                >
                  Apply Calibration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 