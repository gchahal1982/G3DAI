import { NextRequest, NextResponse } from 'next/server';

export interface ExportFormat {
  id: string;
  name: string;
  description: string;
  extension: string;
  mimeType: string;
  supportsAnnotationTypes: string[];
  features: {
    boundingBoxes: boolean;
    polygons: boolean;
    segmentation: boolean;
    keypoints: boolean;
    classification: boolean;
    tracking: boolean;
    hierarchical: boolean;
    metadata: boolean;
  };
  popularity: number;
  compatibleWith: string[];
  documentation: string;
  examples: string[];
}

const exportFormats: ExportFormat[] = [
  {
    id: 'coco',
    name: 'COCO',
    description: 'Microsoft Common Objects in Context format - industry standard for object detection and segmentation',
    extension: '.json',
    mimeType: 'application/json',
    supportsAnnotationTypes: ['bbox', 'polygon', 'segmentation', 'keypoints', 'classification'],
    features: {
      boundingBoxes: true,
      polygons: true,
      segmentation: true,
      keypoints: true,
      classification: true,
      tracking: false,
      hierarchical: false,
      metadata: true
    },
    popularity: 95,
    compatibleWith: ['TensorFlow', 'PyTorch', 'Detectron2', 'MMDetection', 'YOLO', 'OpenCV'],
    documentation: 'https://cocodataset.org/#format-data',
    examples: ['object-detection', 'instance-segmentation', 'keypoint-detection']
  },
  {
    id: 'yolo',
    name: 'YOLO',
    description: 'You Only Look Once format - optimized for real-time object detection with normalized coordinates',
    extension: '.txt',
    mimeType: 'text/plain',
    supportsAnnotationTypes: ['bbox', 'classification'],
    features: {
      boundingBoxes: true,
      polygons: false,
      segmentation: false,
      keypoints: false,
      classification: true,
      tracking: false,
      hierarchical: false,
      metadata: false
    },
    popularity: 90,
    compatibleWith: ['YOLOv5', 'YOLOv8', 'Ultralytics', 'Darknet', 'OpenCV'],
    documentation: 'https://docs.ultralytics.com/datasets/detect/',
    examples: ['real-time-detection', 'edge-deployment', 'mobile-inference']
  },
  {
    id: 'pascal-voc',
    name: 'Pascal VOC',
    description: 'Pascal Visual Object Classes XML format - traditional computer vision dataset format',
    extension: '.xml',
    mimeType: 'application/xml',
    supportsAnnotationTypes: ['bbox', 'polygon', 'classification'],
    features: {
      boundingBoxes: true,
      polygons: true,
      segmentation: false,
      keypoints: false,
      classification: true,
      tracking: false,
      hierarchical: false,
      metadata: true
    },
    popularity: 75,
    compatibleWith: ['TensorFlow', 'PyTorch', 'OpenCV', 'ImageNet', 'Caffe'],
    documentation: 'http://host.robots.ox.ac.uk/pascal/VOC/voc2012/htmldoc/index.html',
    examples: ['academic-research', 'traditional-cv', 'benchmark-datasets']
  },
  {
    id: 'tensorflow',
    name: 'TensorFlow Record',
    description: 'TensorFlow native format optimized for training and inference pipelines',
    extension: '.tfrecord',
    mimeType: 'application/octet-stream',
    supportsAnnotationTypes: ['bbox', 'polygon', 'segmentation', 'keypoints', 'classification'],
    features: {
      boundingBoxes: true,
      polygons: true,
      segmentation: true,
      keypoints: true,
      classification: true,
      tracking: false,
      hierarchical: false,
      metadata: true
    },
    popularity: 85,
    compatibleWith: ['TensorFlow', 'TensorFlow Lite', 'TensorFlow.js', 'TensorFlow Serving'],
    documentation: 'https://www.tensorflow.org/tutorials/load_data/tfrecord',
    examples: ['model-training', 'production-inference', 'cloud-deployment']
  },
  {
    id: 'pytorch',
    name: 'PyTorch Dataset',
    description: 'PyTorch native format with pickle serialization for efficient data loading',
    extension: '.pt',
    mimeType: 'application/octet-stream',
    supportsAnnotationTypes: ['bbox', 'polygon', 'segmentation', 'keypoints', 'classification'],
    features: {
      boundingBoxes: true,
      polygons: true,
      segmentation: true,
      keypoints: true,
      classification: true,
      tracking: false,
      hierarchical: false,
      metadata: true
    },
    popularity: 80,
    compatibleWith: ['PyTorch', 'PyTorch Lightning', 'Torchvision', 'Hugging Face'],
    documentation: 'https://pytorch.org/tutorials/beginner/data_loading_tutorial.html',
    examples: ['research-training', 'model-experimentation', 'academic-projects']
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Dataset',
    description: 'Hugging Face datasets format for NLP and multimodal model training',
    extension: '.arrow',
    mimeType: 'application/octet-stream',
    supportsAnnotationTypes: ['bbox', 'polygon', 'classification', 'text'],
    features: {
      boundingBoxes: true,
      polygons: true,
      segmentation: false,
      keypoints: false,
      classification: true,
      tracking: false,
      hierarchical: false,
      metadata: true
    },
    popularity: 70,
    compatibleWith: ['Hugging Face Transformers', 'Datasets', 'Accelerate', 'AutoTrain'],
    documentation: 'https://huggingface.co/docs/datasets/',
    examples: ['multimodal-training', 'nlp-vision', 'foundation-models']
  },
  {
    id: 'openimages',
    name: 'Open Images',
    description: 'Google Open Images dataset format with hierarchical labels and relationships',
    extension: '.csv',
    mimeType: 'text/csv',
    supportsAnnotationTypes: ['bbox', 'polygon', 'classification', 'relationships'],
    features: {
      boundingBoxes: true,
      polygons: true,
      segmentation: false,
      keypoints: false,
      classification: true,
      tracking: false,
      hierarchical: true,
      metadata: true
    },
    popularity: 60,
    compatibleWith: ['TensorFlow', 'PyTorch', 'OpenCV', 'MediaPipe'],
    documentation: 'https://storage.googleapis.com/openimages/web/index.html',
    examples: ['large-scale-training', 'hierarchical-classification', 'scene-understanding']
  },
  {
    id: 'labelme',
    name: 'LabelMe',
    description: 'LabelMe polygon annotation format for image segmentation',
    extension: '.json',
    mimeType: 'application/json',
    supportsAnnotationTypes: ['polygon', 'bbox', 'classification'],
    features: {
      boundingBoxes: true,
      polygons: true,
      segmentation: true,
      keypoints: false,
      classification: true,
      tracking: false,
      hierarchical: false,
      metadata: true
    },
    popularity: 50,
    compatibleWith: ['LabelMe', 'OpenCV', 'scikit-image', 'PIL'],
    documentation: 'https://github.com/wkentaro/labelme',
    examples: ['semantic-segmentation', 'medical-imaging', 'custom-annotations']
  },
  {
    id: 'custom-json',
    name: 'Custom JSON',
    description: 'Flexible JSON format with customizable schema for specific use cases',
    extension: '.json',
    mimeType: 'application/json',
    supportsAnnotationTypes: ['bbox', 'polygon', 'segmentation', 'keypoints', 'classification', 'custom'],
    features: {
      boundingBoxes: true,
      polygons: true,
      segmentation: true,
      keypoints: true,
      classification: true,
      tracking: true,
      hierarchical: true,
      metadata: true
    },
    popularity: 40,
    compatibleWith: ['Custom', 'JSON parsers', 'REST APIs', 'Web applications'],
    documentation: '/docs/formats/custom-json',
    examples: ['custom-workflows', 'api-integration', 'specialized-domains']
  }
];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const annotationType = url.searchParams.get('type');
    const compatibility = url.searchParams.get('compatible');
    const popular = url.searchParams.get('popular');

    let filteredFormats = [...exportFormats];

    // Filter by annotation type support
    if (annotationType) {
      filteredFormats = filteredFormats.filter(format => 
        format.supportsAnnotationTypes.includes(annotationType)
      );
    }

    // Filter by compatibility
    if (compatibility) {
      filteredFormats = filteredFormats.filter(format => 
        format.compatibleWith.some(tool => 
          tool.toLowerCase().includes(compatibility.toLowerCase())
        )
      );
    }

    // Filter by popularity (top formats only)
    if (popular === 'true') {
      filteredFormats = filteredFormats.filter(format => format.popularity >= 70);
    }

    // Sort by popularity (descending)
    filteredFormats.sort((a, b) => b.popularity - a.popularity);

    return NextResponse.json({
      success: true,
      formats: filteredFormats,
      total: filteredFormats.length,
      filters: {
        category: category || 'all',
        annotationType: annotationType || 'all',
        compatibility: compatibility || 'all',
        popular: popular === 'true'
      }
    });

  } catch (error) {
    console.error('Error fetching export formats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch export formats'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { formatId, config } = await request.json();

    // TODO: Implement format configuration validation
    // This would validate format-specific settings like:
    // - COCO: category mappings, annotation types
    // - YOLO: class file, normalization settings
    // - Custom: schema validation

    return NextResponse.json({
      success: true,
      message: 'Export format configured successfully',
      formatId,
      config
    });

  } catch (error) {
    console.error('Error configuring export format:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to configure export format'
    }, { status: 500 });
  }
} 