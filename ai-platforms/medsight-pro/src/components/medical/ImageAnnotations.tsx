'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  PencilIcon,
  Square2StackIcon,
  CircleStackIcon,
  CursorArrowRaysIcon,
  RulerIcon,
  CalculatorIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  PlusIcon,
  MinusIcon,
  BeakerIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export interface Point {
  x: number;
  y: number;
}

export interface Annotation {
  id: string;
  type: 'rectangle' | 'circle' | 'polygon' | 'line' | 'arrow' | 'text' | 'measurement';
  points: Point[];
  style: {
    strokeColor: string;
    fillColor?: string;
    strokeWidth: number;
    opacity: number;
    dashPattern?: number[];
  };
  label?: string;
  description?: string;
  measurements?: {
    length?: number;
    area?: number;
    volume?: number;
    unit: string;
    pixelSpacing?: [number, number];
  };
  metadata: {
    createdBy: string;
    createdAt: Date;
    modifiedBy?: string;
    modifiedAt?: Date;
    source: 'manual' | 'ai' | 'imported';
    confidence?: number;
    verified: boolean;
    category: 'finding' | 'measurement' | 'annotation' | 'roi' | 'reference';
    severity?: 'low' | 'medium' | 'high' | 'critical';
  };
  comments?: {
    id: string;
    author: string;
    text: string;
    timestamp: Date;
    resolved: boolean;
  }[];
  visibility: {
    visible: boolean;
    layer: number;
    opacity: number;
  };
}

export interface AnnotationTemplate {
  id: string;
  name: string;
  type: Annotation['type'];
  style: Annotation['style'];
  category: string;
  description: string;
}

export interface ImageAnnotationsProps {
  annotations?: Annotation[];
  imageWidth: number;
  imageHeight: number;
  pixelSpacing?: [number, number];
  onAnnotationAdd?: (annotation: Omit<Annotation, 'id'>) => void;
  onAnnotationUpdate?: (id: string, updates: Partial<Annotation>) => void;
  onAnnotationDelete?: (id: string) => void;
  onAnnotationSelect?: (id: string | null) => void;
  selectedAnnotationId?: string | null;
  readOnly?: boolean;
  showAIAnnotations?: boolean;
  showMeasurements?: boolean;
  enableCollaboration?: boolean;
  currentUser?: {
    id: string;
    name: string;
    role: string;
  };
}

export function ImageAnnotations({
  annotations = [],
  imageWidth,
  imageHeight,
  pixelSpacing = [1, 1],
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
  onAnnotationSelect,
  selectedAnnotationId,
  readOnly = false,
  showAIAnnotations = true,
  showMeasurements = true,
  enableCollaboration = true,
  currentUser = { id: 'user1', name: 'Dr. Smith', role: 'Radiologist' }
}: ImageAnnotationsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'select' | 'rectangle' | 'circle' | 'polygon' | 'line' | 'measurement' | 'text'>('select');
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [tempAnnotation, setTempAnnotation] = useState<Annotation | null>(null);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<'all' | 'manual' | 'ai'>('all');
  const [annotationHistory, setAnnotationHistory] = useState<Annotation[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [newComment, setNewComment] = useState('');
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  
  const defaultTemplates: AnnotationTemplate[] = [
    {
      id: 'finding-critical',
      name: 'Critical Finding',
      type: 'rectangle',
      style: { strokeColor: '#dc2626', fillColor: '#dc262620', strokeWidth: 2, opacity: 1 },
      category: 'finding',
      description: 'Mark critical findings requiring immediate attention'
    },
    {
      id: 'finding-normal',
      name: 'Normal Finding',
      type: 'rectangle',
      style: { strokeColor: '#16a34a', fillColor: '#16a34a20', strokeWidth: 2, opacity: 1 },
      category: 'finding',
      description: 'Mark normal anatomical structures'
    },
    {
      id: 'measurement-linear',
      name: 'Linear Measurement',
      type: 'line',
      style: { strokeColor: '#2563eb', strokeWidth: 2, opacity: 1 },
      category: 'measurement',
      description: 'Measure linear distances'
    },
    {
      id: 'roi-circle',
      name: 'Circular ROI',
      type: 'circle',
      style: { strokeColor: '#7c3aed', fillColor: '#7c3aed20', strokeWidth: 2, opacity: 1 },
      category: 'roi',
      description: 'Define circular region of interest'
    }
  ];

  const [templates] = useState<AnnotationTemplate[]>(defaultTemplates);

  useEffect(() => {
    // Save to history when annotations change
    if (annotations.length > 0) {
      const newHistory = annotationHistory.slice(0, historyIndex + 1);
      newHistory.push([...annotations]);
      setAnnotationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [annotations]);

  const getAnnotationColor = (annotation: Annotation) => {
    if (annotation.metadata.source === 'ai') {
      switch (annotation.metadata.severity) {
        case 'critical': return '#dc2626';
        case 'high': return '#ea580c';
        case 'medium': return '#d97706';
        case 'low': return '#16a34a';
        default: return '#2563eb';
      }
    }
    return annotation.style.strokeColor;
  };

  const getFilteredAnnotations = () => {
    return annotations.filter(annotation => {
      if (!annotation.visibility.visible) return false;
      if (!showAIAnnotations && annotation.metadata.source === 'ai') return false;
      if (!showMeasurements && annotation.type === 'measurement') return false;
      if (filterCategory !== 'all' && annotation.metadata.category !== filterCategory) return false;
      if (filterSource !== 'all' && annotation.metadata.source !== filterSource) return false;
      return true;
    });
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly || currentTool === 'select') return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const point: Point = {
      x: ((e.clientX - rect.left) / rect.width) * imageWidth,
      y: ((e.clientY - rect.top) / rect.height) * imageHeight
    };

    setIsDrawing(true);
    setCurrentPoints([point]);

    if (currentTool === 'text') {
      // Handle text annotation creation
      const textAnnotation: Omit<Annotation, 'id'> = {
        type: 'text',
        points: [point],
        style: { strokeColor: '#2563eb', strokeWidth: 1, opacity: 1 },
        label: 'Text annotation',
        metadata: {
          createdBy: currentUser.name,
          createdAt: new Date(),
          source: 'manual',
          verified: false,
          category: 'annotation'
        },
        visibility: { visible: true, layer: 1, opacity: 1 }
      };
      onAnnotationAdd?.(textAnnotation);
      setIsDrawing(false);
      setCurrentTool('select');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || readOnly) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const point: Point = {
      x: ((e.clientX - rect.left) / rect.width) * imageWidth,
      y: ((e.clientY - rect.top) / rect.height) * imageHeight
    };

    if (currentTool === 'rectangle' || currentTool === 'circle') {
      setCurrentPoints([currentPoints[0], point]);
    } else if (currentTool === 'line' || currentTool === 'measurement') {
      setCurrentPoints([currentPoints[0], point]);
    } else if (currentTool === 'polygon') {
      // For polygon, we'll add points on click, not on move
      const updatedPoints = [...currentPoints];
      updatedPoints[updatedPoints.length - 1] = point;
      setCurrentPoints(updatedPoints);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || readOnly) return;

    if (currentTool === 'polygon') {
      // Add point to polygon on click
      setCurrentPoints([...currentPoints, currentPoints[currentPoints.length - 1]]);
      return; // Don't finish drawing yet
    }

    if (currentPoints.length >= 2 || currentTool === 'text') {
      const newAnnotation: Omit<Annotation, 'id'> = {
        type: currentTool === 'measurement' ? 'line' : currentTool,
        points: currentPoints,
        style: {
          strokeColor: '#2563eb',
          fillColor: currentTool === 'rectangle' || currentTool === 'circle' ? '#2563eb20' : undefined,
          strokeWidth: 2,
          opacity: 1
        },
        metadata: {
          createdBy: currentUser.name,
          createdAt: new Date(),
          source: 'manual',
          verified: false,
          category: currentTool === 'measurement' ? 'measurement' : 'annotation'
        },
        visibility: { visible: true, layer: 1, opacity: 1 }
      };

      // Calculate measurements for measurement tools
      if (currentTool === 'measurement' && currentPoints.length === 2) {
        const distance = Math.sqrt(
          Math.pow((currentPoints[1].x - currentPoints[0].x) * pixelSpacing[0], 2) +
          Math.pow((currentPoints[1].y - currentPoints[0].y) * pixelSpacing[1], 2)
        );
        newAnnotation.measurements = {
          length: distance,
          unit: 'mm'
        };
        newAnnotation.label = `${distance.toFixed(2)} mm`;
      }

      // Calculate area for rectangles and circles
      if (currentTool === 'rectangle' && currentPoints.length === 2) {
        const width = Math.abs(currentPoints[1].x - currentPoints[0].x) * pixelSpacing[0];
        const height = Math.abs(currentPoints[1].y - currentPoints[0].y) * pixelSpacing[1];
        const area = width * height;
        newAnnotation.measurements = {
          area: area,
          unit: 'mm²'
        };
      } else if (currentTool === 'circle' && currentPoints.length === 2) {
        const radius = Math.sqrt(
          Math.pow((currentPoints[1].x - currentPoints[0].x) * pixelSpacing[0], 2) +
          Math.pow((currentPoints[1].y - currentPoints[0].y) * pixelSpacing[1], 2)
        );
        const area = Math.PI * radius * radius;
        newAnnotation.measurements = {
          area: area,
          unit: 'mm²'
        };
      }

      onAnnotationAdd?.(newAnnotation);
    }

    setIsDrawing(false);
    setCurrentPoints([]);
    setCurrentTool('select');
  };

  const handleDoubleClick = () => {
    if (currentTool === 'polygon' && currentPoints.length >= 3) {
      // Finish polygon
      const newAnnotation: Omit<Annotation, 'id'> = {
        type: 'polygon',
        points: currentPoints.slice(0, -1), // Remove the last duplicate point
        style: {
          strokeColor: '#2563eb',
          fillColor: '#2563eb20',
          strokeWidth: 2,
          opacity: 1
        },
        metadata: {
          createdBy: currentUser.name,
          createdAt: new Date(),
          source: 'manual',
          verified: false,
          category: 'annotation'
        },
        visibility: { visible: true, layer: 1, opacity: 1 }
      };

      onAnnotationAdd?.(newAnnotation);
      setIsDrawing(false);
      setCurrentPoints([]);
      setCurrentTool('select');
    }
  };

  const handleAnnotationClick = (annotationId: string) => {
    onAnnotationSelect?.(annotationId);
  };

  const handleDeleteAnnotation = (annotationId: string) => {
    onAnnotationDelete?.(annotationId);
  };

  const handleToggleVisibility = (annotationId: string) => {
    const annotation = annotations.find(a => a.id === annotationId);
    if (annotation) {
      onAnnotationUpdate?.(annotationId, {
        visibility: {
          ...annotation.visibility,
          visible: !annotation.visibility.visible
        }
      });
    }
  };

  const handleAddComment = (annotationId: string) => {
    if (!newComment.trim()) return;

    const annotation = annotations.find(a => a.id === annotationId);
    if (annotation) {
      const updatedComments = [
        ...(annotation.comments || []),
        {
          id: `comment-${Date.now()}`,
          author: currentUser.name,
          text: newComment,
          timestamp: new Date(),
          resolved: false
        }
      ];
      
      onAnnotationUpdate?.(annotationId, { comments: updatedComments });
      setNewComment('');
      setShowCommentDialog(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      // Apply previous state
    }
  };

  const handleRedo = () => {
    if (historyIndex < annotationHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      // Apply next state
    }
  };

  const renderAnnotation = (annotation: Annotation) => {
    const isSelected = annotation.id === selectedAnnotationId;
    const strokeColor = getAnnotationColor(annotation);
    const opacity = annotation.visibility.opacity;

    const commonProps = {
      stroke: strokeColor,
      strokeWidth: isSelected ? annotation.style.strokeWidth * 1.5 : annotation.style.strokeWidth,
      fill: annotation.style.fillColor || 'none',
      opacity: opacity,
      style: { cursor: currentTool === 'select' ? 'pointer' : 'crosshair' },
      onClick: () => handleAnnotationClick(annotation.id)
    };

    switch (annotation.type) {
      case 'rectangle':
        if (annotation.points.length >= 2) {
          const x = Math.min(annotation.points[0].x, annotation.points[1].x);
          const y = Math.min(annotation.points[0].y, annotation.points[1].y);
          const width = Math.abs(annotation.points[1].x - annotation.points[0].x);
          const height = Math.abs(annotation.points[1].y - annotation.points[0].y);
          
          return (
            <rect
              key={annotation.id}
              x={x}
              y={y}
              width={width}
              height={height}
              {...commonProps}
            />
          );
        }
        break;

      case 'circle':
        if (annotation.points.length >= 2) {
          const centerX = annotation.points[0].x;
          const centerY = annotation.points[0].y;
          const radius = Math.sqrt(
            Math.pow(annotation.points[1].x - annotation.points[0].x, 2) +
            Math.pow(annotation.points[1].y - annotation.points[0].y, 2)
          );
          
          return (
            <circle
              key={annotation.id}
              cx={centerX}
              cy={centerY}
              r={radius}
              {...commonProps}
            />
          );
        }
        break;

      case 'line':
        if (annotation.points.length >= 2) {
          return (
            <line
              key={annotation.id}
              x1={annotation.points[0].x}
              y1={annotation.points[0].y}
              x2={annotation.points[1].x}
              y2={annotation.points[1].y}
              {...commonProps}
            />
          );
        }
        break;

      case 'polygon':
        if (annotation.points.length >= 3) {
          const pathData = annotation.points
            .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
            .join(' ') + ' Z';
          
          return (
            <path
              key={annotation.id}
              d={pathData}
              {...commonProps}
            />
          );
        }
        break;

      case 'text':
        if (annotation.points.length >= 1) {
          return (
            <text
              key={annotation.id}
              x={annotation.points[0].x}
              y={annotation.points[0].y}
              fill={strokeColor}
              fontSize="14"
              fontFamily="Inter"
              style={{ cursor: 'pointer' }}
              onClick={() => handleAnnotationClick(annotation.id)}
            >
              {annotation.label || 'Text'}
            </text>
          );
        }
        break;
    }

    return null;
  };

  const renderCurrentDrawing = () => {
    if (!isDrawing || currentPoints.length === 0) return null;

    const commonProps = {
      stroke: '#2563eb',
      strokeWidth: 2,
      fill: 'none',
      opacity: 0.7,
      strokeDasharray: '5,5'
    };

    switch (currentTool) {
      case 'rectangle':
        if (currentPoints.length >= 2) {
          const x = Math.min(currentPoints[0].x, currentPoints[1].x);
          const y = Math.min(currentPoints[0].y, currentPoints[1].y);
          const width = Math.abs(currentPoints[1].x - currentPoints[0].x);
          const height = Math.abs(currentPoints[1].y - currentPoints[0].y);
          
          return <rect x={x} y={y} width={width} height={height} {...commonProps} />;
        }
        break;

      case 'circle':
      case 'measurement':
        if (currentPoints.length >= 2) {
          if (currentTool === 'circle') {
            const centerX = currentPoints[0].x;
            const centerY = currentPoints[0].y;
            const radius = Math.sqrt(
              Math.pow(currentPoints[1].x - currentPoints[0].x, 2) +
              Math.pow(currentPoints[1].y - currentPoints[0].y, 2)
            );
            return <circle cx={centerX} cy={centerY} r={radius} {...commonProps} />;
          } else {
            return (
              <line
                x1={currentPoints[0].x}
                y1={currentPoints[0].y}
                x2={currentPoints[1].x}
                y2={currentPoints[1].y}
                {...commonProps}
              />
            );
          }
        }
        break;

      case 'polygon':
        if (currentPoints.length >= 2) {
          const pathData = currentPoints
            .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
            .join(' ');
          
          return <path d={pathData} {...commonProps} />;
        }
        break;
    }

    return null;
  };

  const selectedAnnotation = annotations.find(a => a.id === selectedAnnotationId);
  const aiAnnotations = annotations.filter(a => a.metadata.source === 'ai');
  const manualAnnotations = annotations.filter(a => a.metadata.source === 'manual');

  return (
    <div className="relative w-full h-full">
      {/* SVG Overlay for Annotations */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-auto z-10"
        viewBox={`0 0 ${imageWidth} ${imageHeight}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        {getFilteredAnnotations().map(renderAnnotation)}
        {renderCurrentDrawing()}
      </svg>

      {/* Annotation Tools */}
      <div className="absolute top-4 left-4 z-20">
        <div className="medsight-glass p-3 rounded-xl space-y-2">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentTool('select')}
              className={`p-2 rounded-lg ${currentTool === 'select' ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'}`}
              title="Select Tool"
            >
              <CursorArrowRaysIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCurrentTool('rectangle')}
              disabled={readOnly}
              className={`p-2 rounded-lg ${currentTool === 'rectangle' ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'} disabled:opacity-50`}
              title="Rectangle Tool"
            >
              <Square2StackIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCurrentTool('circle')}
              disabled={readOnly}
              className={`p-2 rounded-lg ${currentTool === 'circle' ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'} disabled:opacity-50`}
              title="Circle Tool"
            >
              <CircleStackIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCurrentTool('polygon')}
              disabled={readOnly}
              className={`p-2 rounded-lg ${currentTool === 'polygon' ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'} disabled:opacity-50`}
              title="Polygon Tool"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCurrentTool('measurement')}
              disabled={readOnly}
              className={`p-2 rounded-lg ${currentTool === 'measurement' ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'} disabled:opacity-50`}
              title="Measurement Tool"
            >
              <RulerIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCurrentTool('text')}
              disabled={readOnly}
              className={`p-2 rounded-lg ${currentTool === 'text' ? 'bg-medsight-primary text-white' : 'text-medsight-primary hover:bg-medsight-primary/10'} disabled:opacity-50`}
              title="Text Tool"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-full h-px bg-medsight-primary/20"></div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg disabled:opacity-50"
              title="Undo"
            >
              <ArrowUturnLeftIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleRedo}
              disabled={historyIndex >= annotationHistory.length - 1}
              className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg disabled:opacity-50"
              title="Redo"
            >
              <ArrowUturnRightIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowAnnotationPanel(!showAnnotationPanel)}
              className="p-2 text-medsight-primary hover:bg-medsight-primary/10 rounded-lg"
              title="Toggle Panel"
            >
              {showAnnotationPanel ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Annotation Panel */}
      {showAnnotationPanel && (
        <div className="absolute top-4 right-4 z-20 w-80">
          <div className="medsight-glass p-4 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-medsight-primary">Annotations</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-medsight-primary/70">
                  {annotations.length} total
                </span>
                <button
                  onClick={() => setShowAnnotationPanel(false)}
                  className="p-1 text-medsight-primary/50 hover:text-medsight-primary"
                >
                  <XCircleIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full text-xs border border-medsight-primary/20 rounded px-2 py-1 bg-medsight-glass"
              >
                <option value="all">All Categories</option>
                <option value="finding">Findings</option>
                <option value="measurement">Measurements</option>
                <option value="annotation">Annotations</option>
                <option value="roi">ROI</option>
              </select>
              
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as any)}
                className="w-full text-xs border border-medsight-primary/20 rounded px-2 py-1 bg-medsight-glass"
              >
                <option value="all">All Sources</option>
                <option value="manual">Manual ({manualAnnotations.length})</option>
                <option value="ai">AI Generated ({aiAnnotations.length})</option>
              </select>
            </div>

            {/* Annotations List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getFilteredAnnotations().map((annotation) => (
                <div
                  key={annotation.id}
                  className={`p-2 rounded-lg border cursor-pointer transition-all ${
                    annotation.id === selectedAnnotationId
                      ? 'border-medsight-primary bg-medsight-primary/10'
                      : 'border-medsight-primary/20 hover:bg-medsight-primary/5'
                  }`}
                  onClick={() => handleAnnotationClick(annotation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getAnnotationColor(annotation) }}
                        ></div>
                        <span className="text-xs font-medium text-medsight-primary truncate">
                          {annotation.label || `${annotation.type} annotation`}
                        </span>
                        {annotation.metadata.source === 'ai' && (
                          <BeakerIcon className="w-3 h-3 text-medsight-ai-high" />
                        )}
                      </div>
                      
                      <div className="text-xs text-medsight-primary/70 mt-1">
                        {annotation.metadata.createdBy} • {annotation.metadata.createdAt.toLocaleDateString()}
                      </div>
                      
                      {annotation.measurements && (
                        <div className="text-xs text-medsight-secondary mt-1">
                          {annotation.measurements.length && `${annotation.measurements.length.toFixed(2)} ${annotation.measurements.unit}`}
                          {annotation.measurements.area && `${annotation.measurements.area.toFixed(2)} ${annotation.measurements.unit}`}
                        </div>
                      )}
                      
                      {annotation.metadata.confidence && (
                        <div className="text-xs text-medsight-ai-high mt-1">
                          Confidence: {(annotation.metadata.confidence * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(annotation.id);
                        }}
                        className="p-1 text-medsight-primary/50 hover:text-medsight-primary"
                        title={annotation.visibility.visible ? "Hide" : "Show"}
                      >
                        {annotation.visibility.visible ? 
                          <EyeIcon className="w-3 h-3" /> : 
                          <EyeSlashIcon className="w-3 h-3" />
                        }
                      </button>
                      
                      {enableCollaboration && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCommentDialog(true);
                            onAnnotationSelect?.(annotation.id);
                          }}
                          className="p-1 text-medsight-primary/50 hover:text-medsight-primary"
                          title="Add Comment"
                        >
                          <ChatBubbleLeftIcon className="w-3 h-3" />
                          {annotation.comments && annotation.comments.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-medsight-critical rounded-full"></span>
                          )}
                        </button>
                      )}
                      
                      {!readOnly && annotation.metadata.source === 'manual' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnnotation(annotation.id);
                          }}
                          className="p-1 text-medsight-critical/50 hover:text-medsight-critical"
                          title="Delete"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Statistics */}
            <div className="pt-2 border-t border-medsight-primary/20">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-medsight-primary/70">Manual:</span>
                  <span className="ml-1 font-medium text-medsight-primary">{manualAnnotations.length}</span>
                </div>
                <div>
                  <span className="text-medsight-ai-high/70">AI:</span>
                  <span className="ml-1 font-medium text-medsight-ai-high">{aiAnnotations.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Dialog */}
      {showCommentDialog && selectedAnnotation && enableCollaboration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-medsight-primary mb-4">
              Add Comment
            </h3>
            
            {selectedAnnotation.comments && selectedAnnotation.comments.length > 0 && (
              <div className="mb-4 space-y-2 max-h-32 overflow-y-auto">
                {selectedAnnotation.comments.map((comment) => (
                  <div key={comment.id} className="p-2 bg-medsight-primary/5 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-medsight-primary">{comment.author}</span>
                      <span className="text-xs text-medsight-primary/60">
                        {comment.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-medsight-primary/70">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input-medsight w-full h-24 resize-none"
                placeholder="Add your comment..."
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCommentDialog(false)}
                  className="btn-medsight flex-1 bg-medsight-primary/10"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddComment(selectedAnnotation.id)}
                  disabled={!newComment.trim()}
                  className="btn-medsight flex-1 disabled:opacity-50"
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 