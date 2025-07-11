'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: string;
  popularity: 'high' | 'medium' | 'low';
  supportedTypes: string[];
  fileExtensions: string[];
  features: string[];
  limitations?: string[];
  useCases: string[];
}

interface ExportOptions {
  format: string;
  includeEmptyImages: boolean;
  includeMetadata: boolean;
  splitDataset: boolean;
  trainRatio: number;
  valRatio: number;
  testRatio: number;
  compressionLevel: number;
  coordinateFormat: 'normalized' | 'absolute';
  confidenceThreshold: number;
  customSettings: Record<string, any>;
}

interface FormatSelectorProps {
  onFormatSelect: (format: string, options: ExportOptions) => void;
  onPreview: (format: string, options: ExportOptions) => void;
  projectId: string;
  availableAnnotationTypes: string[];
  totalImages: number;
  totalAnnotations: number;
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'coco',
    name: 'COCO',
    description: 'Common Objects in Context format - widely used for object detection and segmentation',
    icon: '🎯',
    popularity: 'high',
    supportedTypes: ['bbox', 'polygon', 'segmentation', 'keypoint'],
    fileExtensions: ['.json'],
    features: [
      'Object detection',
      'Instance segmentation', 
      'Keypoint detection',
      'Comprehensive metadata',
      'Category hierarchy',
      'Image licensing info'
    ],
    useCases: [
      'Training YOLO models',
      'Detectron2 training',
      'Academic research',
      'Benchmark datasets',
      'Competition submissions'
    ]
  },
  {
    id: 'yolo',
    name: 'YOLO',
    description: 'You Only Look Once format - optimized for real-time object detection',
    icon: '⚡',
    popularity: 'high',
    supportedTypes: ['bbox'],
    fileExtensions: ['.txt', '.yaml'],
    features: [
      'Normalized coordinates',
      'Single file per image',
      'Fast parsing',
      'Training/val/test splits',
      'Class configuration',
      'YOLOv5/v8 compatible'
    ],
    limitations: [
      'Bounding boxes only',
      'No complex metadata',
      'No hierarchical categories'
    ],
    useCases: [
      'YOLOv5/v8 training',
      'Edge device deployment',
      'Real-time detection',
      'Custom YOLO models',
      'Ultralytics training'
    ]
  },
  {
    id: 'pascal-voc',
    name: 'Pascal VOC',
    description: 'Pascal Visual Object Classes XML format - traditional computer vision standard',
    icon: '📋',
    popularity: 'medium',
    supportedTypes: ['bbox', 'segmentation'],
    fileExtensions: ['.xml'],
    features: [
      'XML structure',
      'Bounding box detection',
      'Segmentation masks',
      'Object difficulty levels',
      'Image metadata',
      'Annotation validation'
    ],
    useCases: [
      'Traditional CV models',
      'Academic research',
      'Legacy system integration',
      'XML-based pipelines',
      'Educational projects'
    ]
  },
  {
    id: 'tensorflow',
    name: 'TensorFlow',
    description: 'TensorFlow Object Detection API format',
    icon: '🧠',
    popularity: 'high',
    supportedTypes: ['bbox', 'segmentation'],
    fileExtensions: ['.tfrecord', '.pbtxt'],
    features: [
      'TFRecord format',
      'Protocol buffer labels',
      'Efficient binary format',
      'TensorFlow ecosystem',
      'Model training ready',
      'Scalable processing'
    ],
    useCases: [
      'TensorFlow training',
      'Google Cloud AI',
      'Production ML pipelines',
      'Large-scale training',
      'TensorFlow Serving'
    ]
  },
  {
    id: 'pytorch',
    name: 'PyTorch',
    description: 'PyTorch-compatible format for deep learning',
    icon: '🔥',
    popularity: 'high',
    supportedTypes: ['bbox', 'polygon', 'segmentation', 'keypoint'],
    fileExtensions: ['.json', '.pkl'],
    features: [
      'Torch tensors',
      'Custom data loaders',
      'Flexible structure',
      'Research-friendly',
      'Multi-task support',
      'Dynamic loading'
    ],
    useCases: [
      'PyTorch training',
      'Research projects',
      'Custom architectures',
      'Multi-task learning',
      'Experimental models'
    ]
  },
  {
    id: 'labelme',
    name: 'LabelMe',
    description: 'LabelMe polygon annotation format',
    icon: '🏷️',
    popularity: 'medium',
    supportedTypes: ['polygon', 'bbox'],
    fileExtensions: ['.json'],
    features: [
      'Polygon annotations',
      'Shape attributes',
      'Image metadata',
      'Version tracking',
      'LabelMe compatibility',
      'Human-readable JSON'
    ],
    useCases: [
      'LabelMe tool integration',
      'Polygon annotation',
      'Manual annotation',
      'Data validation',
      'Annotation review'
    ]
  }
];

export default function FormatSelector({
  onFormatSelect,
  onPreview,
  projectId,
  availableAnnotationTypes,
  totalImages,
  totalAnnotations
}: FormatSelectorProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('coco');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'coco',
    includeEmptyImages: false,
    includeMetadata: true,
    splitDataset: true,
    trainRatio: 0.8,
    valRatio: 0.1,
    testRatio: 0.1,
    compressionLevel: 5,
    coordinateFormat: 'normalized',
    confidenceThreshold: 0.5,
    customSettings: {},
  });
  const [previewData, setPreviewData] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Filter formats based on available annotation types
  const compatibleFormats = EXPORT_FORMATS.filter(format =>
    format.supportedTypes.some(type => availableAnnotationTypes.includes(type))
  );

  const selectedFormatData = EXPORT_FORMATS.find(f => f.id === selectedFormat);

  const handleFormatChange = (formatId: string) => {
    setSelectedFormat(formatId);
    setExportOptions(prev => ({ ...prev, format: formatId }));
  };

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleGeneratePreview = async () => {
    if (!selectedFormatData) return;
    
    setIsGeneratingPreview(true);
    try {
      await onPreview(selectedFormat, exportOptions);
      // In a real implementation, this would receive the preview data
      setPreviewData(generateMockPreview(selectedFormat));
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleExport = () => {
    onFormatSelect(selectedFormat, exportOptions);
  };

  const getCompatibilityScore = (format: ExportFormat) => {
    const supportedCount = format.supportedTypes.filter(type => 
      availableAnnotationTypes.includes(type)
    ).length;
    return (supportedCount / format.supportedTypes.length) * 100;
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Export Annotations</h2>
        <p className="text-white/70">
          Choose a format and configure export settings for your {totalImages} images 
          and {totalAnnotations} annotations
        </p>
      </div>

      {/* Format Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Select Export Format</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {compatibleFormats.map((format) => {
            const compatibilityScore = getCompatibilityScore(format);
            const isSelected = selectedFormat === format.id;
            
            return (
              <motion.div
                key={format.id}
                layoutId={format.id}
                className={`relative cursor-pointer rounded-xl p-4 border transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/25'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/30'
                }`}
                onClick={() => handleFormatChange(format.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Popularity Badge */}
                {format.popularity === 'high' && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Popular
                  </div>
                )}

                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{format.icon}</span>
                  <div>
                    <h4 className="text-white font-semibold">{format.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-white/50">
                        {format.fileExtensions.join(', ')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        compatibilityScore === 100 
                          ? 'bg-green-500/20 text-green-400'
                          : compatibilityScore >= 50
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {compatibilityScore.toFixed(0)}% compatible
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-white/70 text-sm mb-3">{format.description}</p>

                <div className="space-y-2">
                  <div className="text-xs text-white/50">Supported Types:</div>
                  <div className="flex flex-wrap gap-1">
                    {format.supportedTypes.map((type) => (
                      <span
                        key={type}
                        className={`text-xs px-2 py-1 rounded ${
                          availableAnnotationTypes.includes(type)
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-xl border-2 border-indigo-500 pointer-events-none"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Format Details */}
      <AnimatePresence mode="wait">
        {selectedFormatData && (
          <motion.div
            key={selectedFormat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-6"
          >
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{selectedFormatData.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedFormatData.name}</h3>
                <p className="text-white/70">{selectedFormatData.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Features */}
              <div>
                <h4 className="text-white font-semibold mb-3">Features</h4>
                <ul className="space-y-2">
                  {selectedFormatData.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-white/70">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Use Cases */}
              <div>
                <h4 className="text-white font-semibold mb-3">Use Cases</h4>
                <ul className="space-y-2">
                  {selectedFormatData.useCases.map((useCase, index) => (
                    <li key={index} className="flex items-center space-x-2 text-white/70">
                      <span className="text-blue-400">→</span>
                      <span className="text-sm">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Limitations */}
            {selectedFormatData.limitations && (
              <div>
                <h4 className="text-white font-semibold mb-3">Limitations</h4>
                <ul className="space-y-2">
                  {selectedFormatData.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-center space-x-2 text-white/70">
                      <span className="text-orange-400">!</span>
                      <span className="text-sm">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Options */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-6">
        <h3 className="text-lg font-semibold text-white">Export Options</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Options */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Basic Settings</h4>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={exportOptions.includeEmptyImages}
                onChange={(e) => handleOptionChange('includeEmptyImages', e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-white/10 border-white/20 rounded focus:ring-indigo-500"
              />
              <span className="text-white/70">Include images without annotations</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={exportOptions.includeMetadata}
                onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-white/10 border-white/20 rounded focus:ring-indigo-500"
              />
              <span className="text-white/70">Include metadata and timestamps</span>
            </label>

            <div>
              <label className="block text-white/70 text-sm mb-2">
                Confidence Threshold: {exportOptions.confidenceThreshold}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={exportOptions.confidenceThreshold}
                onChange={(e) => handleOptionChange('confidenceThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Dataset Split */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Dataset Split</h4>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={exportOptions.splitDataset}
                onChange={(e) => handleOptionChange('splitDataset', e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-white/10 border-white/20 rounded focus:ring-indigo-500"
              />
              <span className="text-white/70">Split dataset for training</span>
            </label>

            {exportOptions.splitDataset && (
              <div className="space-y-3 pl-7">
                <div>
                  <label className="block text-white/70 text-sm mb-1">
                    Train: {(exportOptions.trainRatio * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="0.9"
                    step="0.05"
                    value={exportOptions.trainRatio}
                    onChange={(e) => {
                      const trainRatio = parseFloat(e.target.value);
                      const remaining = 1 - trainRatio;
                      const valRatio = Math.min(exportOptions.valRatio, remaining * 0.8);
                      const testRatio = remaining - valRatio;
                      handleOptionChange('trainRatio', trainRatio);
                      handleOptionChange('valRatio', valRatio);
                      handleOptionChange('testRatio', testRatio);
                    }}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-1">
                    Validation: {(exportOptions.valRatio * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.3"
                    step="0.05"
                    value={exportOptions.valRatio}
                    onChange={(e) => {
                      const valRatio = parseFloat(e.target.value);
                      const testRatio = 1 - exportOptions.trainRatio - valRatio;
                      handleOptionChange('valRatio', valRatio);
                      handleOptionChange('testRatio', Math.max(0, testRatio));
                    }}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="text-white/50 text-sm">
                  Test: {(exportOptions.testRatio * 100).toFixed(0)}% (automatic)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Format-specific options */}
        {selectedFormat === 'yolo' && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-white font-medium">YOLO-specific Options</h4>
            
            <div>
              <label className="block text-white/70 text-sm mb-2">Coordinate Format</label>
              <select
                value={exportOptions.coordinateFormat}
                onChange={(e) => handleOptionChange('coordinateFormat', e.target.value)}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="normalized">Normalized (0-1)</option>
                <option value="absolute">Absolute pixels</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Preview</h3>
          <button
            onClick={handleGeneratePreview}
            disabled={isGeneratingPreview}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl transition-colors text-sm"
          >
            {isGeneratingPreview ? 'Generating...' : 'Generate Preview'}
          </button>
        </div>

        {previewData ? (
          <div className="bg-black/20 rounded-lg p-4 font-mono text-sm text-white/80 overflow-auto max-h-64">
            <pre>{previewData}</pre>
          </div>
        ) : (
          <div className="text-center py-8 text-white/50">
            Click "Generate Preview" to see a sample of the exported format
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className="flex justify-between items-center pt-6">
        <div className="text-white/70 text-sm">
          Estimated export size: ~{Math.ceil(totalAnnotations * 0.1)}KB
        </div>
        
        <button
          onClick={handleExport}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-indigo-500/25"
        >
          Export {selectedFormatData?.name} Format
        </button>
      </div>
    </div>
  );
}

// Mock preview generator for demonstration
function generateMockPreview(format: string): string {
  switch (format) {
    case 'coco':
      return `{
  "info": {
    "year": 2024,
    "version": "1.0",
    "description": "AnnotateAI export",
    "contributor": "AnnotateAI Platform",
    "date_created": "2024-01-20T10:30:00Z"
  },
  "images": [
    {
      "id": 1,
      "width": 640,
      "height": 480,
      "file_name": "image_001.jpg"
    }
  ],
  "annotations": [
    {
      "id": 1,
      "image_id": 1,
      "category_id": 1,
      "bbox": [100, 150, 200, 180],
      "area": 36000,
      "iscrowd": 0
    }
  ],
  "categories": [
    {
      "id": 1,
      "name": "person",
      "supercategory": "person"
    }
  ]
}`;

    case 'yolo':
      return `# classes.txt
person
car
bicycle

# image_001.txt
0 0.5 0.6 0.3 0.4
1 0.2 0.3 0.15 0.25

# dataset.yaml
train: ./images/train
val: ./images/val
nc: 3
names: ['person', 'car', 'bicycle']`;

    case 'pascal-voc':
      return `<annotation>
  <folder>images</folder>
  <filename>image_001.jpg</filename>
  <size>
    <width>640</width>
    <height>480</height>
    <depth>3</depth>
  </size>
  <object>
    <name>person</name>
    <bndbox>
      <xmin>100</xmin>
      <ymin>150</ymin>
      <xmax>300</xmax>
      <ymax>330</ymax>
    </bndbox>
  </object>
</annotation>`;

    default:
      return `Sample ${format} format output would be shown here...`;
  }
} 