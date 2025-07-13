'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PencilIcon,
  ArrowRightIcon,
  RectangleGroupIcon,
  EllipsisHorizontalCircleIcon,
  SwatchIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  EyeIcon,
  EyeSlashIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  BookmarkIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  BeakerIcon,
  CubeIcon,
  ArrowPathIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FolderIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  CogIcon,
  LightBulbIcon,
  FireIcon,
  CpuChipIcon,
  HandRaisedIcon,
  CursorArrowRaysIcon,
  Squares2X2Icon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

interface ImageAnnotationEngineProps {
  imageData?: string | null;
  width?: number;
  height?: number;
  className?: string;
  onAnnotationCreate?: (annotation: Annotation) => void;
  onAnnotationUpdate?: (annotation: Annotation) => void;
  onAnnotationDelete?: (annotationId: string) => void;
  onCollaboration?: (event: CollaborationEvent) => void;
  showAISuggestions?: boolean;
  showCollaboration?: boolean;
  emergencyMode?: boolean;
  readOnly?: boolean;
}

interface Annotation {
  id: string;
  type: 'text' | 'arrow' | 'rectangle' | 'circle' | 'freehand' | 'measurement';
  coordinates: { x: number; y: number }[];
  text: string;
  color: string;
  thickness: number;
  filled: boolean;
  opacity: number;
  timestamp: string;
  author: string;
  authorRole: 'radiologist' | 'resident' | 'technologist' | 'ai';
  status: 'draft' | 'published' | 'reviewed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'finding' | 'measurement' | 'reference' | 'comment' | 'teaching';
  tags: string[];
  visibility: 'public' | 'private' | 'team';
  linkedMeasurement?: string;
  aiConfidence?: number;
  replies?: AnnotationReply[];
  metadata: {
    series: number;
    slice: number;
    imageId: string;
    modality: string;
    bodyPart: string;
  };
}

interface AnnotationReply {
  id: string;
  author: string;
  authorRole: string;
  text: string;
  timestamp: string;
  status: 'active' | 'resolved';
}

interface CollaborationEvent {
  type: 'annotation_added' | 'annotation_updated' | 'annotation_deleted' | 'user_joined' | 'user_left';
  userId: string;
  userName: string;
  timestamp: string;
  data?: any;
}

interface AISuggestion {
  id: string;
  type: 'finding' | 'measurement' | 'improvement';
  confidence: number;
  text: string;
  coordinates?: { x: number; y: number }[];
  category: string;
  priority: 'low' | 'medium' | 'high';
  accepted: boolean;
  rejected: boolean;
}

interface DrawingState {
  isDrawing: boolean;
  currentPath: { x: number; y: number }[];
  startPoint: { x: number; y: number } | null;
  previewAnnotation: Annotation | null;
}

export default function ImageAnnotationEngine({
  imageData,
  width = 800,
  height = 600,
  className = '',
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationDelete,
  onCollaboration,
  showAISuggestions = true,
  showCollaboration = true,
  emergencyMode = false,
  readOnly = false
}: ImageAnnotationEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('text');
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    currentPath: [],
    startPoint: null,
    previewAnnotation: null
  });
  
  const [toolSettings, setToolSettings] = useState({
    color: '#0ea5e9',
    thickness: 2,
    opacity: 1.0,
    filled: false,
    fontSize: 14,
    fontFamily: 'Arial',
    textAlign: 'left'
  });
  
  const [filterSettings, setFilterSettings] = useState({
    author: 'all',
    category: 'all',
    status: 'all',
    priority: 'all',
    timeRange: 'all'
  });
  
  const [aiSuggestions, setAISuggestions] = useState<AISuggestion[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [showControls, setShowControls] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(true);
  
  const colors = [
    '#0ea5e9', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];
  
  const annotationCategories = [
    { id: 'finding', name: 'Finding', color: '#ef4444', icon: ExclamationCircleIcon },
    { id: 'measurement', name: 'Measurement', color: '#0ea5e9', icon: BeakerIcon },
    { id: 'reference', name: 'Reference', color: '#10b981', icon: BookmarkIcon },
    { id: 'comment', name: 'Comment', color: '#f59e0b', icon: ChatBubbleLeftIcon },
    { id: 'teaching', name: 'Teaching', color: '#8b5cf6', icon: LightBulbIcon }
  ];
  
  const priorityLevels = [
    { id: 'low', name: 'Low', color: '#6b7280' },
    { id: 'medium', name: 'Medium', color: '#f59e0b' },
    { id: 'high', name: 'High', color: '#ef4444' },
    { id: 'critical', name: 'Critical', color: '#dc2626' }
  ];

  // Mock data
  const currentUser = {
    id: 'user_001',
    name: 'Dr. Sarah Chen',
    role: 'radiologist' as const,
    avatar: '/api/placeholder/32/32'
  };

  const mockCollaborators = [
    { id: 'user_002', name: 'Dr. Michael Torres', role: 'resident', status: 'online', lastSeen: new Date() },
    { id: 'user_003', name: 'Alex Johnson', role: 'technologist', status: 'away', lastSeen: new Date() },
    { id: 'ai_001', name: 'MedAI Assistant', role: 'ai', status: 'online', lastSeen: new Date() }
  ];

  const createAnnotation = useCallback((type: string, coordinates: { x: number; y: number }[], text: string = '') => {
    const annotation: Annotation = {
      id: `ann_${Date.now()}`,
      type: type as any,
      coordinates,
      text,
      color: toolSettings.color,
      thickness: toolSettings.thickness,
      filled: toolSettings.filled,
      opacity: toolSettings.opacity,
      timestamp: new Date().toISOString(),
      author: currentUser.name,
      authorRole: currentUser.role,
      status: 'draft',
      priority: 'medium',
      category: 'finding',
      tags: [],
      visibility: 'team',
      replies: [],
      metadata: {
        series: 1,
        slice: 1,
        imageId: 'img_001',
        modality: 'CT',
        bodyPart: 'chest'
      }
    };
    
    setAnnotations(prev => [...prev, annotation]);
    onAnnotationCreate?.(annotation);
    
    // Notify collaborators
    onCollaboration?.({
      type: 'annotation_added',
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
      data: annotation
    });
    
    return annotation;
  }, [toolSettings, onAnnotationCreate, onCollaboration]);

  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, ...updates } : ann
    ));
    
    const updatedAnnotation = annotations.find(ann => ann.id === id);
    if (updatedAnnotation) {
      onAnnotationUpdate?.({ ...updatedAnnotation, ...updates });
    }
  }, [annotations, onAnnotationUpdate]);

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    onAnnotationDelete?.(id);
    setSelectedAnnotation(null);
  }, [onAnnotationDelete]);

  const handleCanvasMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setDrawingState(prev => ({
      ...prev,
      isDrawing: true,
      startPoint: { x, y },
      currentPath: [{ x, y }]
    }));
  }, [readOnly]);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingState.isDrawing || readOnly) return;
    
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (selectedTool === 'freehand') {
      setDrawingState(prev => ({
        ...prev,
        currentPath: [...prev.currentPath, { x, y }]
      }));
    } else {
      // For shapes, create preview
      const preview = createPreviewAnnotation(drawingState.startPoint!, { x, y });
      setDrawingState(prev => ({ ...prev, previewAnnotation: preview }));
    }
  }, [drawingState.isDrawing, drawingState.startPoint, selectedTool, readOnly]);

  const handleCanvasMouseUp = useCallback(() => {
    if (!drawingState.isDrawing || readOnly) return;
    
    let coordinates: { x: number; y: number }[] = [];
    
    if (selectedTool === 'freehand') {
      coordinates = drawingState.currentPath;
    } else if (drawingState.startPoint && drawingState.currentPath.length > 0) {
      const endPoint = drawingState.currentPath[drawingState.currentPath.length - 1];
      
      if (selectedTool === 'rectangle') {
        coordinates = [
          drawingState.startPoint,
          { x: endPoint.x, y: drawingState.startPoint.y },
          endPoint,
          { x: drawingState.startPoint.x, y: endPoint.y }
        ];
      } else if (selectedTool === 'circle') {
        const centerX = (drawingState.startPoint.x + endPoint.x) / 2;
        const centerY = (drawingState.startPoint.y + endPoint.y) / 2;
        const radius = Math.sqrt(
          Math.pow(endPoint.x - drawingState.startPoint.x, 2) + 
          Math.pow(endPoint.y - drawingState.startPoint.y, 2)
        ) / 2;
        coordinates = [{ x: centerX, y: centerY }, { x: radius, y: radius }];
      } else if (selectedTool === 'arrow') {
        coordinates = [drawingState.startPoint, endPoint];
      } else if (selectedTool === 'text') {
        coordinates = [drawingState.startPoint];
      }
    }
    
    if (coordinates.length > 0) {
      createAnnotation(selectedTool, coordinates, selectedTool === 'text' ? 'New annotation' : '');
    }
    
    setDrawingState({
      isDrawing: false,
      currentPath: [],
      startPoint: null,
      previewAnnotation: null
    });
  }, [drawingState, selectedTool, readOnly, createAnnotation]);

  const createPreviewAnnotation = (start: { x: number; y: number }, end: { x: number; y: number }): Annotation => {
    return {
      id: 'preview',
      type: selectedTool as any,
      coordinates: selectedTool === 'rectangle' 
        ? [start, { x: end.x, y: start.y }, end, { x: start.x, y: end.y }]
        : [start, end],
      text: '',
      color: toolSettings.color,
      thickness: toolSettings.thickness,
      filled: toolSettings.filled,
      opacity: 0.5,
      timestamp: '',
      author: '',
      authorRole: 'radiologist',
      status: 'draft',
      priority: 'medium',
      category: 'finding',
      tags: [],
      visibility: 'team',
      replies: [],
      metadata: {
        series: 1,
        slice: 1,
        imageId: '',
        modality: 'CT',
        bodyPart: 'chest'
      }
    };
  };

  const renderAnnotations = useCallback((ctx: CanvasRenderingContext2D) => {
    const allAnnotations = [...annotations];
    if (drawingState.previewAnnotation) {
      allAnnotations.push(drawingState.previewAnnotation);
    }
    
    allAnnotations.forEach(annotation => {
      ctx.strokeStyle = annotation.color;
      ctx.fillStyle = annotation.color;
      ctx.lineWidth = annotation.thickness;
      ctx.globalAlpha = annotation.opacity;
      
      switch (annotation.type) {
        case 'text':
          if (annotation.coordinates.length > 0) {
            ctx.font = `${toolSettings.fontSize}px ${toolSettings.fontFamily}`;
            ctx.fillText(annotation.text, annotation.coordinates[0].x, annotation.coordinates[0].y);
          }
          break;
          
        case 'arrow':
          if (annotation.coordinates.length >= 2) {
            const start = annotation.coordinates[0];
            const end = annotation.coordinates[1];
            
            // Draw line
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            
            // Draw arrowhead
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const headlen = 10;
            ctx.beginPath();
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6));
            ctx.stroke();
          }
          break;
          
        case 'rectangle':
          if (annotation.coordinates.length >= 4) {
            const rect = {
              x: Math.min(annotation.coordinates[0].x, annotation.coordinates[2].x),
              y: Math.min(annotation.coordinates[0].y, annotation.coordinates[2].y),
              width: Math.abs(annotation.coordinates[2].x - annotation.coordinates[0].x),
              height: Math.abs(annotation.coordinates[2].y - annotation.coordinates[0].y)
            };
            
            if (annotation.filled) {
              ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            } else {
              ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            }
          }
          break;
          
        case 'circle':
          if (annotation.coordinates.length >= 2) {
            const center = annotation.coordinates[0];
            const radius = annotation.coordinates[1].x; // Using x as radius
            
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
            
            if (annotation.filled) {
              ctx.fill();
            } else {
              ctx.stroke();
            }
          }
          break;
          
        case 'freehand':
          if (annotation.coordinates.length > 1) {
            ctx.beginPath();
            ctx.moveTo(annotation.coordinates[0].x, annotation.coordinates[0].y);
            for (let i = 1; i < annotation.coordinates.length; i++) {
              ctx.lineTo(annotation.coordinates[i].x, annotation.coordinates[i].y);
            }
            ctx.stroke();
          }
          break;
      }
      
      // Draw selection indicator
      if (annotation.id === selectedAnnotation) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          Math.min(...annotation.coordinates.map(c => c.x)) - 5,
          Math.min(...annotation.coordinates.map(c => c.y)) - 5,
          Math.max(...annotation.coordinates.map(c => c.x)) - Math.min(...annotation.coordinates.map(c => c.x)) + 10,
          Math.max(...annotation.coordinates.map(c => c.y)) - Math.min(...annotation.coordinates.map(c => c.y)) + 10
        );
        ctx.setLineDash([]);
      }
    });
    
    ctx.globalAlpha = 1.0;
  }, [annotations, drawingState.previewAnnotation, selectedAnnotation, toolSettings]);

  // Canvas rendering
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderAnnotations(ctx);
  }, [renderAnnotations]);

  // Mock AI suggestions
  useEffect(() => {
    if (showAISuggestions) {
      const mockSuggestions: AISuggestion[] = [
        {
          id: 'ai_001',
          type: 'finding',
          confidence: 87,
          text: 'Possible pulmonary nodule detected in right upper lobe',
          coordinates: [{ x: 250, y: 150 }, { x: 280, y: 180 }],
          category: 'Pulmonary',
          priority: 'medium',
          accepted: false,
          rejected: false
        },
        {
          id: 'ai_002',
          type: 'measurement',
          confidence: 92,
          text: 'Nodule diameter measurement suggested: 8.2mm',
          coordinates: [{ x: 250, y: 150 }, { x: 280, y: 150 }],
          category: 'Measurement',
          priority: 'low',
          accepted: false,
          rejected: false
        }
      ];
      setAISuggestions(mockSuggestions);
    }
  }, [showAISuggestions]);

  useEffect(() => {
    setCollaborators(mockCollaborators);
  }, []);

  const filteredAnnotations = annotations.filter(annotation => {
    if (filterSettings.author !== 'all' && annotation.author !== filterSettings.author) return false;
    if (filterSettings.category !== 'all' && annotation.category !== filterSettings.category) return false;
    if (filterSettings.status !== 'all' && annotation.status !== filterSettings.status) return false;
    if (filterSettings.priority !== 'all' && annotation.priority !== filterSettings.priority) return false;
    return true;
  });

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
        
        {/* Annotation Overlay */}
        <canvas
          ref={overlayCanvasRef}
          width={width}
          height={height}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        />
        
        {/* Tool Bar */}
        {showControls && (
          <div className="absolute top-4 left-4 medsight-control-glass p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Annotation Tools</h3>
            
            <div className="space-y-3">
              {/* Drawing Tools */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Drawing Tools</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'text', icon: DocumentTextIcon, name: 'Text' },
                    { id: 'arrow', icon: ArrowRightIcon, name: 'Arrow' },
                    { id: 'rectangle', icon: RectangleGroupIcon, name: 'Rectangle' },
                    { id: 'circle', icon: EllipsisHorizontalCircleIcon, name: 'Circle' },
                    { id: 'freehand', icon: PencilIcon, name: 'Freehand' },
                    { id: 'measurement', icon: BeakerIcon, name: 'Measure' }
                  ].map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      className={`btn-medsight p-2 flex flex-col items-center gap-1 ${
                        selectedTool === tool.id ? 'bg-medsight-primary/20' : ''
                      }`}
                      title={tool.name}
                    >
                      <tool.icon className="w-4 h-4" />
                      <span className="text-xs">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                <div className="flex gap-1 flex-wrap">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setToolSettings(prev => ({ ...prev, color }))}
                      className={`w-6 h-6 rounded border-2 ${
                        toolSettings.color === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Tool Settings */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Thickness: {toolSettings.thickness}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={toolSettings.thickness}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, thickness: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Opacity: {(toolSettings.opacity * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={toolSettings.opacity}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={toolSettings.filled}
                    onChange={(e) => setToolSettings(prev => ({ ...prev, filled: e.target.checked }))}
                    className="rounded border-gray-300 text-medsight-primary"
                  />
                  <span className="text-xs text-gray-700">Filled</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Annotations List */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Annotations ({filteredAnnotations.length})</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-medsight text-xs"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
              <select
                value={filterSettings.category}
                onChange={(e) => setFilterSettings(prev => ({ ...prev, category: e.target.value }))}
                className="w-full input-medsight text-xs"
              >
                <option value="all">All Categories</option>
                {annotationCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              
              <select
                value={filterSettings.status}
                onChange={(e) => setFilterSettings(prev => ({ ...prev, status: e.target.value }))}
                className="w-full input-medsight text-xs"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>
          )}

          {/* Annotations */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAnnotations.map(annotation => (
              <div
                key={annotation.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedAnnotation === annotation.id ? 'border-medsight-primary bg-medsight-primary/5' : 'border-gray-200'
                }`}
                onClick={() => setSelectedAnnotation(annotation.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: annotation.color }}
                    />
                    <span className="text-xs font-medium text-gray-900 capitalize">
                      {annotation.type}
                    </span>
                    <span className={`text-xs px-1 py-0.5 rounded ${
                      annotation.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      annotation.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      annotation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {annotation.priority}
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAnnotation(annotation.id);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mb-2">{annotation.text}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{annotation.author}</span>
                  <span>{new Date(annotation.timestamp).toLocaleTimeString()}</span>
                </div>
                
                {annotation.replies && annotation.replies.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {annotation.replies.length} replies
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions Panel */}
        {showAISuggestions && showAIPanel && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">AI Suggestions</h3>
              <button
                onClick={() => setShowAIPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {aiSuggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-900">
                        AI {suggestion.type}
                      </span>
                      <span className="text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {suggestion.confidence}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-blue-800 mb-3">{suggestion.text}</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Accept suggestion
                        if (suggestion.coordinates) {
                          createAnnotation(suggestion.type, suggestion.coordinates, suggestion.text);
                        }
                      }}
                      className="btn-medsight text-xs bg-blue-600 text-white px-2 py-1"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        setAISuggestions(prev => prev.filter(s => s.id !== suggestion.id));
                      }}
                      className="btn-medsight text-xs border border-blue-600 text-blue-600 px-2 py-1"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collaboration Panel */}
        {showCollaboration && showCollaborationPanel && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Collaborators ({collaborators.length})</h3>
              <button
                onClick={() => setShowCollaborationPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {collaborators.map(collaborator => (
                <div
                  key={collaborator.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      collaborator.status === 'online' ? 'bg-green-500' :
                      collaborator.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {collaborator.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {collaborator.role}
                    </p>
                  </div>
                </div>
              ))}
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