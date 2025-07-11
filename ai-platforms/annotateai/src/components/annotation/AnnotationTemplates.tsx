'use client';

import { useState, useEffect } from 'react';

export interface AnnotationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'object_detection' | 'segmentation' | 'keypoints' | 'classification' | 'custom';
  annotationType: 'bbox' | 'polygon' | 'keypoints' | 'point' | 'line' | 'classification';
  creator: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  isFavorite: boolean;
  usageCount: number;
  rating: number;
  tags: string[];
  config: {
    defaultCategory?: string;
    defaultAttributes?: Record<string, any>;
    tools: string[];
    settings: Record<string, any>;
    preAnnotations?: any[];
    validationRules?: string[];
    export: {
      formats: string[];
      settings: Record<string, any>;
    };
  };
  preview?: {
    imageUrl: string;
    annotations: any[];
  };
}

interface AnnotationTemplatesProps {
  visible: boolean;
  onClose: () => void;
  onTemplateSelect: (template: AnnotationTemplate) => void;
  currentContext?: string;
}

const mockTemplates: AnnotationTemplate[] = [
  {
    id: 'template_001',
    name: 'Medical Image Analysis',
    description: 'Complete template for medical image annotation with tumor detection and organ segmentation',
    category: 'object_detection',
    annotationType: 'bbox',
    creator: 'Dr. Sarah Chen',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    isPublic: true,
    isFavorite: true,
    usageCount: 245,
    rating: 4.8,
    tags: ['medical', 'radiology', 'tumor', 'organ', 'healthcare'],
    config: {
      defaultCategory: 'tumor',
      defaultAttributes: {
        malignancy: 'unknown',
        size: 'medium',
        confidence: 0.8
      },
      tools: ['bbox', 'polygon', 'measurement'],
      settings: {
        snapToEdges: true,
        showConfidence: true,
        enableMeasurements: true,
        colorScheme: 'medical'
      },
      validationRules: [
        'bbox_minimum_size',
        'required_attributes',
        'confidence_threshold'
      ],
      export: {
        formats: ['coco', 'dicom', 'custom-json'],
        settings: {
          includeMeasurements: true,
          anonymizePatientData: true
        }
      }
    },
    preview: {
      imageUrl: 'https://picsum.photos/400/300?random=1',
      annotations: [
        {
          type: 'bbox',
          bbox: [120, 80, 160, 120],
          category: 'tumor',
          attributes: { malignancy: 'high' }
        }
      ]
    }
  },
  {
    id: 'template_002',
    name: 'Autonomous Vehicle Dataset',
    description: 'Street scene annotation for self-driving car training with vehicles, pedestrians, and traffic signs',
    category: 'object_detection',
    annotationType: 'bbox',
    creator: 'AutoDrive Team',
    createdAt: '2024-01-08T14:20:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    isPublic: true,
    isFavorite: false,
    usageCount: 189,
    rating: 4.6,
    tags: ['autonomous', 'vehicles', 'street', 'traffic', 'detection'],
    config: {
      defaultCategory: 'vehicle',
      defaultAttributes: {
        vehicle_type: 'car',
        occlusion: 'none',
        truncation: 'none'
      },
      tools: ['bbox', 'polyline', 'depth'],
      settings: {
        enableOcclusion: true,
        showDepthEstimation: true,
        multiClass: true,
        colorByCategory: true
      },
      validationRules: [
        'no_overlapping_vehicles',
        'required_vehicle_type',
        'minimum_visibility'
      ],
      export: {
        formats: ['yolo', 'kitti', 'cityscapes'],
        settings: {
          normalizeCoordinates: true,
          includeDepth: true
        }
      }
    },
    preview: {
      imageUrl: 'https://picsum.photos/400/300?random=2',
      annotations: [
        {
          type: 'bbox',
          bbox: [50, 150, 120, 80],
          category: 'car',
          attributes: { vehicle_type: 'sedan' }
        },
        {
          type: 'bbox',
          bbox: [200, 180, 40, 60],
          category: 'pedestrian',
          attributes: { pose: 'walking' }
        }
      ]
    }
  },
  {
    id: 'template_003',
    name: 'Fashion & Retail',
    description: 'E-commerce product annotation with clothing segmentation and attribute tagging',
    category: 'segmentation',
    annotationType: 'polygon',
    creator: 'FashionAI Inc',
    createdAt: '2024-01-05T11:15:00Z',
    updatedAt: '2024-01-14T09:20:00Z',
    isPublic: true,
    isFavorite: true,
    usageCount: 156,
    rating: 4.7,
    tags: ['fashion', 'retail', 'clothing', 'segmentation', 'ecommerce'],
    config: {
      defaultCategory: 'clothing',
      defaultAttributes: {
        clothing_type: 'shirt',
        color: 'unknown',
        pattern: 'solid',
        material: 'cotton'
      },
      tools: ['polygon', 'magic_wand', 'color_picker'],
      settings: {
        enableMagicWand: true,
        colorTolerance: 15,
        smoothing: true,
        autoClose: true
      },
      validationRules: [
        'closed_polygon',
        'minimum_points',
        'required_color_attribute'
      ],
      export: {
        formats: ['coco', 'labelme', 'custom-json'],
        settings: {
          includeColorAnalysis: true,
          generateMasks: true
        }
      }
    },
    preview: {
      imageUrl: 'https://picsum.photos/400/300?random=3',
      annotations: [
        {
          type: 'polygon',
          segmentation: [[100, 50, 200, 50, 200, 200, 100, 200]],
          category: 'shirt',
          attributes: { color: 'blue', pattern: 'striped' }
        }
      ]
    }
  },
  {
    id: 'template_004',
    name: 'Human Pose Estimation',
    description: 'Full body pose annotation with 17 keypoints for action recognition and sports analysis',
    category: 'keypoints',
    annotationType: 'keypoints',
    creator: 'SportsTech Lab',
    createdAt: '2024-01-03T16:30:00Z',
    updatedAt: '2024-01-11T13:10:00Z',
    isPublic: true,
    isFavorite: false,
    usageCount: 198,
    rating: 4.5,
    tags: ['pose', 'keypoints', 'sports', 'human', 'action'],
    config: {
      defaultCategory: 'person',
      defaultAttributes: {
        pose_type: 'standing',
        visibility: 'full',
        activity: 'unknown'
      },
      tools: ['keypoints', 'skeleton', 'bbox'],
      settings: {
        keypointCount: 17,
        showSkeleton: true,
        autoConnect: true,
        symmetryConstraints: true
      },
      validationRules: [
        'required_keypoints',
        'symmetry_check',
        'pose_plausibility'
      ],
      export: {
        formats: ['coco', 'openpose', 'custom-json'],
        settings: {
          includeConfidence: true,
          exportSkeleton: true
        }
      }
    },
    preview: {
      imageUrl: 'https://picsum.photos/400/300?random=4',
      annotations: [
        {
          type: 'keypoints',
          keypoints: [150, 100, 1, 140, 120, 1, 160, 120, 1, 130, 180, 1, 170, 180, 1],
          category: 'person',
          attributes: { pose_type: 'running' }
        }
      ]
    }
  },
  {
    id: 'template_005',
    name: 'Agricultural Crop Analysis',
    description: 'Precision agriculture template for crop health assessment and yield prediction',
    category: 'classification',
    annotationType: 'classification',
    creator: 'AgriTech Solutions',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-13T15:45:00Z',
    isPublic: true,
    isFavorite: false,
    usageCount: 87,
    rating: 4.3,
    tags: ['agriculture', 'crops', 'health', 'classification', 'farming'],
    config: {
      defaultCategory: 'crop_health',
      defaultAttributes: {
        health_status: 'healthy',
        growth_stage: 'vegetative',
        pest_damage: 'none',
        disease_signs: 'none'
      },
      tools: ['classification', 'region_selector', 'measurement'],
      settings: {
        multiLabel: true,
        confidenceThreshold: 0.7,
        enableRegionAnalysis: true,
        showHealthScale: true
      },
      validationRules: [
        'required_health_status',
        'consistent_growth_stage',
        'valid_damage_assessment'
      ],
      export: {
        formats: ['csv', 'json', 'geojson'],
        settings: {
          includeGPS: true,
          aggregateByField: true
        }
      }
    },
    preview: {
      imageUrl: 'https://picsum.photos/400/300?random=5',
      annotations: [
        {
          type: 'classification',
          region: [0, 0, 400, 300],
          category: 'crop_health',
          attributes: { health_status: 'stressed', pest_damage: 'moderate' }
        }
      ]
    }
  }
];

export function AnnotationTemplates({ visible, onClose, onTemplateSelect, currentContext }: AnnotationTemplatesProps) {
  const [templates, setTemplates] = useState<AnnotationTemplate[]>(mockTemplates);
  const [filteredTemplates, setFilteredTemplates] = useState<AnnotationTemplate[]>(mockTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAnnotationType, setSelectedAnnotationType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'usage' | 'recent'>('rating');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<AnnotationTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'manage'>('browse');

  useEffect(() => {
    filterAndSortTemplates();
  }, [searchQuery, selectedCategory, selectedAnnotationType, sortBy, showFavoritesOnly, templates]);

  const filterAndSortTemplates = () => {
    let filtered = templates.filter(template => {
      const matchesSearch = searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesType = selectedAnnotationType === 'all' || template.annotationType === selectedAnnotationType;
      const matchesFavorites = !showFavoritesOnly || template.isFavorite;
      
      return matchesSearch && matchesCategory && matchesType && matchesFavorites;
    });

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  };

  const handleTemplateSelect = (template: AnnotationTemplate) => {
    // Update usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    ));
    
    onTemplateSelect(template);
    onClose();
  };

  const handleToggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ));
  };

  const handleRateTemplate = (templateId: string, rating: number) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId
        ? { ...template, rating }
        : template
    ));
  };

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'object_detection', name: 'Object Detection' },
    { id: 'segmentation', name: 'Segmentation' },
    { id: 'keypoints', name: 'Keypoints' },
    { id: 'classification', name: 'Classification' },
    { id: 'custom', name: 'Custom' }
  ];

  const annotationTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'bbox', name: 'Bounding Box' },
    { id: 'polygon', name: 'Polygon' },
    { id: 'keypoints', name: 'Keypoints' },
    { id: 'point', name: 'Point' },
    { id: 'line', name: 'Line' },
    { id: 'classification', name: 'Classification' }
  ];

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Annotation Templates
            </h2>
            <p className="text-gray-600 mt-1">Choose from pre-configured templates or create your own</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  activeTab === 'browse' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Browse
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  activeTab === 'create' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Create
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  activeTab === 'manage' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                My Templates
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

        {activeTab === 'browse' && (
          <>
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 bg-gray-50/50">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 relative min-w-[200px]">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedAnnotationType}
                  onChange={(e) => setSelectedAnnotationType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {annotationTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="rating">Best Rated</option>
                  <option value="usage">Most Used</option>
                  <option value="recent">Recently Updated</option>
                  <option value="name">Name</option>
                </select>
                
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    showFavoritesOnly
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Favorites Only
                </button>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:shadow-lg transition-all group">
                    {/* Preview Image */}
                    {template.preview && (
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={template.preview.imageUrl}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => setPreviewTemplate(template)}
                            className="px-4 py-2 bg-white/90 text-gray-900 rounded-lg font-medium hover:bg-white transition-colors"
                          >
                            Preview
                          </button>
                        </div>
                        
                        {/* Favorite Button */}
                        <button
                          onClick={() => handleToggleFavorite(template.id)}
                          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full hover:bg-white transition-colors"
                        >
                          <svg 
                            className={`w-4 h-4 ${template.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`} 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{template.name}</h3>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="text-sm text-gray-600">{template.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                          {template.annotationType}
                        </span>
                        <span className="text-xs text-gray-500">
                          {template.usageCount} uses
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          by {template.creator}
                        </span>
                        <button
                          onClick={() => handleTemplateSelect(template)}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Use Template
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or create a new template</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'create' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Create New Template</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter template name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {categories.slice(1).map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe what this template is for and how to use it"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-gray-600 mb-2">Template creation feature coming soon</p>
                  <p className="text-sm text-gray-500">Full template builder with drag-and-drop configuration</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">My Templates</h3>
              <p className="text-gray-600 mb-4">Manage your custom annotation templates</p>
              <p className="text-sm text-gray-500">Template management features coming soon</p>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{previewTemplate.name}</h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              {previewTemplate.preview && (
                <div className="mb-4">
                  <img
                    src={previewTemplate.preview.imageUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{previewTemplate.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Configuration</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium">{previewTemplate.annotationType}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tools:</span>
                        <span className="ml-2 font-medium">{previewTemplate.config.tools.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Formats:</span>
                        <span className="ml-2 font-medium">{previewTemplate.config.export.formats.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Rating:</span>
                        <span className="ml-2 font-medium">{previewTemplate.rating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleTemplateSelect(previewTemplate)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Use This Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 