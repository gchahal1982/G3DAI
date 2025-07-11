'use client';

import { useState, useEffect } from 'react';

export interface BatchOperation {
  id: string;
  name: string;
  description: string;
  type: 'edit' | 'transform' | 'validate' | 'export' | 'delete' | 'assign';
  icon: string;
  requiresSelection: boolean;
  supportedTypes: string[];
  parameters?: BatchParameter[];
}

export interface BatchParameter {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'color' | 'range';
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  defaultValue?: any;
}

export interface AnnotationItem {
  id: string;
  imageId: string;
  imageName: string;
  type: 'bbox' | 'polygon' | 'keypoints' | 'point' | 'line' | 'classification';
  category: string;
  confidence?: number;
  status: 'pending' | 'completed' | 'reviewed' | 'rejected';
  attributes: Record<string, any>;
  geometry: any;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  reviewedBy?: string;
}

interface BatchOperationsProps {
  visible: boolean;
  onClose: () => void;
  annotations: AnnotationItem[];
  onAnnotationsUpdate: (annotations: AnnotationItem[]) => void;
  selectedAnnotations: string[];
  onSelectionChange: (selected: string[]) => void;
}

const batchOperations: BatchOperation[] = [
  {
    id: 'edit_category',
    name: 'Change Category',
    description: 'Change the category for selected annotations',
    type: 'edit',
    icon: 'tag',
    requiresSelection: true,
    supportedTypes: ['bbox', 'polygon', 'keypoints', 'point', 'line'],
    parameters: [
      {
        id: 'newCategory',
        name: 'New Category',
        type: 'select',
        required: true,
        options: ['person', 'vehicle', 'animal', 'object', 'building', 'custom']
      }
    ]
  },
  {
    id: 'edit_attributes',
    name: 'Edit Attributes',
    description: 'Bulk edit attributes for selected annotations',
    type: 'edit',
    icon: 'edit',
    requiresSelection: true,
    supportedTypes: ['bbox', 'polygon', 'keypoints', 'point', 'line', 'classification'],
    parameters: [
      {
        id: 'attributeName',
        name: 'Attribute Name',
        type: 'text',
        required: true
      },
      {
        id: 'attributeValue',
        name: 'Attribute Value',
        type: 'text',
        required: true
      }
    ]
  },
  {
    id: 'adjust_confidence',
    name: 'Adjust Confidence',
    description: 'Adjust confidence scores for AI-generated annotations',
    type: 'edit',
    icon: 'percent',
    requiresSelection: true,
    supportedTypes: ['bbox', 'polygon', 'keypoints', 'point', 'line'],
    parameters: [
      {
        id: 'confidenceValue',
        name: 'Confidence Score',
        type: 'range',
        required: true,
        min: 0,
        max: 1,
        defaultValue: 0.8
      }
    ]
  },
  {
    id: 'transform_coordinates',
    name: 'Transform Coordinates',
    description: 'Apply coordinate transformations to annotations',
    type: 'transform',
    icon: 'move',
    requiresSelection: true,
    supportedTypes: ['bbox', 'polygon', 'keypoints', 'point'],
    parameters: [
      {
        id: 'operation',
        name: 'Operation',
        type: 'select',
        required: true,
        options: ['translate', 'scale', 'rotate', 'flip_horizontal', 'flip_vertical']
      },
      {
        id: 'offsetX',
        name: 'X Offset',
        type: 'number',
        required: false,
        defaultValue: 0
      },
      {
        id: 'offsetY',
        name: 'Y Offset',
        type: 'number',
        required: false,
        defaultValue: 0
      },
      {
        id: 'scaleX',
        name: 'X Scale',
        type: 'number',
        required: false,
        defaultValue: 1
      },
      {
        id: 'scaleY',
        name: 'Y Scale',
        type: 'number',
        required: false,
        defaultValue: 1
      }
    ]
  },
  {
    id: 'validate_annotations',
    name: 'Validate Annotations',
    description: 'Run validation checks on selected annotations',
    type: 'validate',
    icon: 'check',
    requiresSelection: true,
    supportedTypes: ['bbox', 'polygon', 'keypoints', 'point', 'line', 'classification'],
    parameters: [
      {
        id: 'checkOverlaps',
        name: 'Check for Overlaps',
        type: 'checkbox',
        required: false,
        defaultValue: true
      },
      {
        id: 'checkBounds',
        name: 'Check Image Bounds',
        type: 'checkbox',
        required: false,
        defaultValue: true
      },
      {
        id: 'checkMinSize',
        name: 'Check Minimum Size',
        type: 'checkbox',
        required: false,
        defaultValue: true
      }
    ]
  },
  {
    id: 'duplicate_annotations',
    name: 'Duplicate Annotations',
    description: 'Create copies of selected annotations',
    type: 'edit',
    icon: 'copy',
    requiresSelection: true,
    supportedTypes: ['bbox', 'polygon', 'keypoints', 'point', 'line'],
    parameters: [
      {
        id: 'offsetX',
        name: 'X Offset',
        type: 'number',
        required: false,
        defaultValue: 10
      },
      {
        id: 'offsetY',
        name: 'Y Offset',
        type: 'number',
        required: false,
        defaultValue: 10
      }
    ]
  },
  {
    id: 'delete_annotations',
    name: 'Delete Annotations',
    description: 'Delete selected annotations',
    type: 'delete',
    icon: 'trash',
    requiresSelection: true,
    supportedTypes: ['bbox', 'polygon', 'keypoints', 'point', 'line', 'classification'],
    parameters: []
  },
  {
    id: 'export_annotations',
    name: 'Export Selected',
    description: 'Export selected annotations in various formats',
    type: 'export',
    icon: 'download',
    requiresSelection: true,
    supportedTypes: ['bbox', 'polygon', 'keypoints', 'point', 'line', 'classification'],
    parameters: [
      {
        id: 'format',
        name: 'Export Format',
        type: 'select',
        required: true,
        options: ['coco', 'yolo', 'pascal-voc', 'csv', 'json']
      },
      {
        id: 'includeImages',
        name: 'Include Images',
        type: 'checkbox',
        required: false,
        defaultValue: false
      }
    ]
  },
  {
    id: 'assign_reviewer',
    name: 'Assign Reviewer',
    description: 'Assign selected annotations to a reviewer',
    type: 'assign',
    icon: 'user',
    requiresSelection: true,
    supportedTypes: ['bbox', 'polygon', 'keypoints', 'point', 'line', 'classification'],
    parameters: [
      {
        id: 'reviewer',
        name: 'Reviewer',
        type: 'select',
        required: true,
        options: ['Dr. Sarah Chen', 'Dr. Michael Rodriguez', 'Dr. Emily Johnson', 'Auto-assign']
      }
    ]
  }
];

export function BatchOperations({ visible, onClose, annotations, onAnnotationsUpdate, selectedAnnotations, onSelectionChange }: BatchOperationsProps) {
  const [activeOperation, setActiveOperation] = useState<BatchOperation | null>(null);
  const [operationParams, setOperationParams] = useState<Record<string, any>>({});
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    if (activeOperation) {
      // Initialize default parameter values
      const defaultParams: Record<string, any> = {};
      activeOperation.parameters?.forEach(param => {
        if (param.defaultValue !== undefined) {
          defaultParams[param.id] = param.defaultValue;
        }
      });
      setOperationParams(defaultParams);
    }
  }, [activeOperation]);

  const filteredAnnotations = annotations.filter(annotation => {
    const matchesSearch = searchQuery === '' || 
      annotation.imageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      annotation.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || annotation.type === filterType;
    const matchesStatus = filterStatus === 'all' || annotation.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.imageName.localeCompare(b.imageName);
        break;
      case 'date':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSelectAll = () => {
    if (selectedAnnotations.length === filteredAnnotations.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredAnnotations.map(a => a.id));
    }
  };

  const handleSelectionToggle = (annotationId: string) => {
    if (selectedAnnotations.includes(annotationId)) {
      onSelectionChange(selectedAnnotations.filter(id => id !== annotationId));
    } else {
      onSelectionChange([...selectedAnnotations, annotationId]);
    }
  };

  const handleParameterChange = (paramId: string, value: any) => {
    setOperationParams(prev => ({
      ...prev,
      [paramId]: value
    }));
  };

  const executeOperation = async () => {
    if (!activeOperation) return;

    setProcessing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let updatedAnnotations = [...annotations];
      
      switch (activeOperation.id) {
        case 'edit_category':
          updatedAnnotations = updatedAnnotations.map(annotation =>
            selectedAnnotations.includes(annotation.id)
              ? { ...annotation, category: operationParams.newCategory, updatedAt: new Date().toISOString() }
              : annotation
          );
          break;
          
        case 'edit_attributes':
          updatedAnnotations = updatedAnnotations.map(annotation =>
            selectedAnnotations.includes(annotation.id)
              ? { 
                  ...annotation, 
                  attributes: { 
                    ...annotation.attributes, 
                    [operationParams.attributeName]: operationParams.attributeValue 
                  },
                  updatedAt: new Date().toISOString()
                }
              : annotation
          );
          break;
          
        case 'adjust_confidence':
          updatedAnnotations = updatedAnnotations.map(annotation =>
            selectedAnnotations.includes(annotation.id)
              ? { ...annotation, confidence: operationParams.confidenceValue, updatedAt: new Date().toISOString() }
              : annotation
          );
          break;
          
        case 'delete_annotations':
          updatedAnnotations = updatedAnnotations.filter(annotation =>
            !selectedAnnotations.includes(annotation.id)
          );
          break;
          
        case 'duplicate_annotations':
          const duplicates = annotations.filter(annotation =>
            selectedAnnotations.includes(annotation.id)
          ).map(annotation => ({
            ...annotation,
            id: `${annotation.id}_copy_${Date.now()}`,
            geometry: transformGeometry(annotation.geometry, annotation.type, {
              offsetX: operationParams.offsetX || 0,
              offsetY: operationParams.offsetY || 0
            }),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          updatedAnnotations = [...updatedAnnotations, ...duplicates];
          break;
          
        default:
          console.log(`Executing ${activeOperation.name} with params:`, operationParams);
      }
      
      onAnnotationsUpdate(updatedAnnotations);
      onSelectionChange([]);
      setActiveOperation(null);
      
    } catch (error) {
      console.error('Error executing batch operation:', error);
    } finally {
      setProcessing(false);
    }
  };

  const transformGeometry = (geometry: any, type: string, transform: any) => {
    // Simple transformation logic - in practice this would be more sophisticated
    if (type === 'bbox' && Array.isArray(geometry)) {
      return [
        geometry[0] + transform.offsetX,
        geometry[1] + transform.offsetY,
        geometry[2],
        geometry[3]
      ];
    }
    return geometry;
  };

  const availableOperations = batchOperations.filter(operation => {
    if (!operation.requiresSelection || selectedAnnotations.length === 0) {
      return !operation.requiresSelection;
    }
    
    // Check if operation supports the types of selected annotations
    const selectedTypes = annotations
      .filter(a => selectedAnnotations.includes(a.id))
      .map(a => a.type);
    
    return selectedTypes.some(type => operation.supportedTypes.includes(type));
  });

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Batch Operations
            </h2>
            <p className="text-gray-600 mt-1">
              {selectedAnnotations.length > 0 
                ? `${selectedAnnotations.length} annotation${selectedAnnotations.length !== 1 ? 's' : ''} selected`
                : 'Select annotations to perform batch operations'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Grid
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Operations Panel */}
          <div className="w-80 bg-gray-50/50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Available Operations</h3>
              
              <div className="space-y-2">
                {availableOperations.map(operation => (
                  <button
                    key={operation.id}
                    onClick={() => setActiveOperation(operation)}
                    disabled={operation.requiresSelection && selectedAnnotations.length === 0}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      activeOperation?.id === operation.id
                        ? 'bg-indigo-100 border-2 border-indigo-300'
                        : 'bg-white border border-gray-200 hover:bg-indigo-50'
                    } ${
                      operation.requiresSelection && selectedAnnotations.length === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        operation.type === 'edit' ? 'bg-blue-100 text-blue-600' :
                        operation.type === 'transform' ? 'bg-purple-100 text-purple-600' :
                        operation.type === 'validate' ? 'bg-green-100 text-green-600' :
                        operation.type === 'export' ? 'bg-indigo-100 text-indigo-600' :
                        operation.type === 'delete' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <OperationIcon name={operation.icon} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{operation.name}</div>
                        <div className="text-xs text-gray-600">{operation.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Filters and Controls */}
            <div className="p-4 border-b border-gray-200 bg-gray-50/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search annotations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Types</option>
                    <option value="bbox">Bounding Box</option>
                    <option value="polygon">Polygon</option>
                    <option value="keypoints">Keypoints</option>
                    <option value="point">Point</option>
                    <option value="line">Line</option>
                    <option value="classification">Classification</option>
                  </select>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {selectedAnnotations.length === filteredAnnotations.length ? 'Deselect All' : 'Select All'}
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    {filteredAnnotations.length} annotation{filteredAnnotations.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Annotations List/Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {viewMode === 'list' ? (
                <div className="space-y-2">
                  {filteredAnnotations.map(annotation => (
                    <div key={annotation.id} className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedAnnotations.includes(annotation.id)}
                        onChange={() => handleSelectionToggle(annotation.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      
                      <div className="flex-1 grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">{annotation.imageName}</div>
                          <div className="text-gray-500">ID: {annotation.id.slice(0, 8)}</div>
                        </div>
                        <div>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {annotation.type}
                          </span>
                        </div>
                        <div className="font-medium text-gray-900">{annotation.category}</div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            annotation.status === 'completed' ? 'bg-green-100 text-green-700' :
                            annotation.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                            annotation.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {annotation.status}
                          </span>
                        </div>
                        <div className="text-gray-500">
                          {new Date(annotation.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredAnnotations.map(annotation => (
                    <div key={annotation.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <input
                            type="checkbox"
                            checked={selectedAnnotations.includes(annotation.id)}
                            onChange={() => handleSelectionToggle(annotation.id)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {annotation.type}
                          </span>
                        </div>
                        
                        <div className="font-medium text-gray-900 mb-1 truncate">{annotation.imageName}</div>
                        <div className="text-sm text-gray-600 mb-2">{annotation.category}</div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            annotation.status === 'completed' ? 'bg-green-100 text-green-700' :
                            annotation.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                            annotation.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {annotation.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(annotation.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {filteredAnnotations.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No annotations found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Operation Configuration Modal */}
        {activeOperation && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{activeOperation.name}</h3>
                <button
                  onClick={() => setActiveOperation(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4">
                <p className="text-gray-600 mb-4">{activeOperation.description}</p>
                
                {activeOperation.parameters && activeOperation.parameters.length > 0 && (
                  <div className="space-y-4">
                    {activeOperation.parameters.map(param => (
                      <div key={param.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {param.name}
                          {param.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {param.type === 'text' && (
                          <input
                            type="text"
                            value={operationParams[param.id] || ''}
                            onChange={(e) => handleParameterChange(param.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        )}
                        
                        {param.type === 'number' && (
                          <input
                            type="number"
                            value={operationParams[param.id] || ''}
                            onChange={(e) => handleParameterChange(param.id, Number(e.target.value))}
                            min={param.min}
                            max={param.max}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        )}
                        
                        {param.type === 'select' && (
                          <select
                            value={operationParams[param.id] || ''}
                            onChange={(e) => handleParameterChange(param.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Select...</option>
                            {param.options?.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                        
                        {param.type === 'checkbox' && (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={operationParams[param.id] || false}
                              onChange={(e) => handleParameterChange(param.id, e.target.checked)}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mr-2"
                            />
                            <span className="text-sm text-gray-700">Enable {param.name}</span>
                          </label>
                        )}
                        
                        {param.type === 'range' && (
                          <div>
                            <input
                              type="range"
                              min={param.min}
                              max={param.max}
                              step="0.1"
                              value={operationParams[param.id] || param.defaultValue}
                              onChange={(e) => handleParameterChange(param.id, Number(e.target.value))}
                              className="w-full"
                            />
                            <div className="text-sm text-gray-600 text-center mt-1">
                              {operationParams[param.id] || param.defaultValue}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setActiveOperation(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeOperation}
                    disabled={processing}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {processing ? 'Processing...' : 'Execute'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OperationIcon({ name }: { name: string }) {
  switch (name) {
    case 'tag':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
    case 'edit':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
    case 'percent':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    case 'move':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>;
    case 'check':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'copy':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
    case 'trash':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
    case 'download':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    case 'user':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    default:
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" /></svg>;
  }
} 