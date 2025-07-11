/**
 * COCO (Common Objects in Context) Format Export/Import Utilities
 * 
 * COCO is one of the most widely used annotation formats in computer vision.
 * This module provides utilities to export/import annotations in COCO format.
 */

export interface COCODataset {
  info: COCOInfo;
  images: COCOImage[];
  annotations: COCOAnnotation[];
  categories: COCOCategory[];
  licenses?: COCOLicense[];
}

export interface COCOInfo {
  year: number;
  version: string;
  description: string;
  contributor: string;
  url: string;
  date_created: string;
}

export interface COCOImage {
  id: number;
  width: number;
  height: number;
  file_name: string;
  license?: number;
  flickr_url?: string;
  coco_url?: string;
  date_captured?: string;
}

export interface COCOAnnotation {
  id: number;
  image_id: number;
  category_id: number;
  segmentation?: number[][];
  area: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
  iscrowd: 0 | 1;
}

export interface COCOCategory {
  id: number;
  name: string;
  supercategory: string;
}

export interface COCOLicense {
  id: number;
  name: string;
  url: string;
}

// Internal annotation types (from our platform)
export interface AnnotateAIProject {
  id: string;
  name: string;
  description: string;
  created_at: string;
  images: AnnotateAIImage[];
  categories: AnnotateAICategory[];
}

export interface AnnotateAIImage {
  id: string;
  filename: string;
  width: number;
  height: number;
  url: string;
  annotations: AnnotateAIAnnotation[];
}

export interface AnnotateAIAnnotation {
  id: string;
  image_id: string;
  category_id: string;
  type: 'bbox' | 'polygon' | 'segmentation' | 'keypoint';
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  polygon?: Array<{ x: number; y: number }>;
  segmentation?: number[][];
  keypoints?: Array<{ x: number; y: number; visibility: 0 | 1 | 2 }>;
  area?: number;
  confidence?: number;
}

export interface AnnotateAICategory {
  id: string;
  name: string;
  color: string;
  supercategory?: string;
}

/**
 * Export AnnotateAI project data to COCO format
 */
export function exportToCOCO(project: AnnotateAIProject): COCODataset {
  const cocoDataset: COCODataset = {
    info: {
      year: new Date().getFullYear(),
      version: "1.0",
      description: project.description || `AnnotateAI export of project: ${project.name}`,
      contributor: "AnnotateAI Platform",
      url: "https://annotateai.com",
      date_created: new Date().toISOString(),
    },
    images: [],
    annotations: [],
    categories: [],
  };

  // Convert categories
  const categoryIdMap = new Map<string, number>();
  project.categories.forEach((category, index) => {
    const cocoId = index + 1;
    categoryIdMap.set(category.id, cocoId);
    
    cocoDataset.categories.push({
      id: cocoId,
      name: category.name,
      supercategory: category.supercategory || "object",
    });
  });

  // Convert images and annotations
  const imageIdMap = new Map<string, number>();
  let annotationId = 1;

  project.images.forEach((image, imageIndex) => {
    const cocoImageId = imageIndex + 1;
    imageIdMap.set(image.id, cocoImageId);

    // Add image
    cocoDataset.images.push({
      id: cocoImageId,
      width: image.width,
      height: image.height,
      file_name: image.filename,
    });

    // Add annotations for this image
    image.annotations.forEach((annotation) => {
      const categoryId = categoryIdMap.get(annotation.category_id);
      if (!categoryId) {
        console.warn(`Category ${annotation.category_id} not found for annotation ${annotation.id}`);
        return;
      }

      let cocoAnnotation: COCOAnnotation;

      if (annotation.type === 'bbox' && annotation.bbox) {
        const area = annotation.area || (annotation.bbox.width * annotation.bbox.height);
        
        cocoAnnotation = {
          id: annotationId++,
          image_id: cocoImageId,
          category_id: categoryId,
          bbox: [annotation.bbox.x, annotation.bbox.y, annotation.bbox.width, annotation.bbox.height],
          area,
          iscrowd: 0,
        };
      } else if (annotation.type === 'polygon' && annotation.polygon) {
        // Convert polygon to COCO segmentation format
        const segmentation = annotation.polygon.reduce((acc: number[], point) => {
          acc.push(point.x, point.y);
          return acc;
        }, []);

        const area = annotation.area || calculatePolygonArea(annotation.polygon);
        const bbox = calculatePolygonBBox(annotation.polygon);

        cocoAnnotation = {
          id: annotationId++,
          image_id: cocoImageId,
          category_id: categoryId,
          segmentation: [segmentation],
          bbox: [bbox.x, bbox.y, bbox.width, bbox.height],
          area,
          iscrowd: 0,
        };
      } else if (annotation.type === 'segmentation' && annotation.segmentation) {
        const area = annotation.area || calculateSegmentationArea(annotation.segmentation);
        const bbox = calculateSegmentationBBox(annotation.segmentation);

        cocoAnnotation = {
          id: annotationId++,
          image_id: cocoImageId,
          category_id: categoryId,
          segmentation: annotation.segmentation,
          bbox: [bbox.x, bbox.y, bbox.width, bbox.height],
          area,
          iscrowd: 0,
        };
      } else {
        console.warn(`Unsupported annotation type: ${annotation.type}`);
        return;
      }

      cocoDataset.annotations.push(cocoAnnotation);
    });
  });

  return cocoDataset;
}

/**
 * Import COCO format data to AnnotateAI project structure
 */
export function importFromCOCO(cocoData: COCODataset): AnnotateAIProject {
  // Create category mapping
  const categoryMap = new Map<number, AnnotateAICategory>();
  const categories: AnnotateAICategory[] = cocoData.categories.map((category) => {
    const annotateCategory: AnnotateAICategory = {
      id: `cat_${category.id}`,
      name: category.name,
      color: generateCategoryColor(category.name),
      supercategory: category.supercategory,
    };
    categoryMap.set(category.id, annotateCategory);
    return annotateCategory;
  });

  // Create image mapping
  const imageMap = new Map<number, AnnotateAIImage>();
  const images: AnnotateAIImage[] = cocoData.images.map((image) => {
    const annotateImage: AnnotateAIImage = {
      id: `img_${image.id}`,
      filename: image.file_name,
      width: image.width,
      height: image.height,
      url: image.coco_url || image.flickr_url || `./images/${image.file_name}`,
      annotations: [],
    };
    imageMap.set(image.id, annotateImage);
    return annotateImage;
  });

  // Convert annotations
  cocoData.annotations.forEach((annotation) => {
    const image = imageMap.get(annotation.image_id);
    const category = categoryMap.get(annotation.category_id);
    
    if (!image || !category) {
      console.warn(`Missing image or category for annotation ${annotation.id}`);
      return;
    }

    let annotateAnnotation: AnnotateAIAnnotation;

    if (annotation.segmentation && annotation.segmentation.length > 0) {
      // Segmentation annotation
      const segmentation = annotation.segmentation;
      
      if (segmentation[0].length <= 8) {
        // Simple polygon
        const polygon = [];
        for (let i = 0; i < segmentation[0].length; i += 2) {
          polygon.push({ x: segmentation[0][i], y: segmentation[0][i + 1] });
        }

        annotateAnnotation = {
          id: `ann_${annotation.id}`,
          image_id: image.id,
          category_id: category.id,
          type: 'polygon',
          polygon,
          area: annotation.area,
          bbox: {
            x: annotation.bbox[0],
            y: annotation.bbox[1],
            width: annotation.bbox[2],
            height: annotation.bbox[3],
          },
        };
      } else {
        // Complex segmentation
        annotateAnnotation = {
          id: `ann_${annotation.id}`,
          image_id: image.id,
          category_id: category.id,
          type: 'segmentation',
          segmentation,
          area: annotation.area,
          bbox: {
            x: annotation.bbox[0],
            y: annotation.bbox[1],
            width: annotation.bbox[2],
            height: annotation.bbox[3],
          },
        };
      }
    } else {
      // Bounding box annotation
      annotateAnnotation = {
        id: `ann_${annotation.id}`,
        image_id: image.id,
        category_id: category.id,
        type: 'bbox',
        bbox: {
          x: annotation.bbox[0],
          y: annotation.bbox[1],
          width: annotation.bbox[2],
          height: annotation.bbox[3],
        },
        area: annotation.area,
      };
    }

    image.annotations.push(annotateAnnotation);
  });

  return {
    id: `imported_${Date.now()}`,
    name: cocoData.info.description || "Imported COCO Dataset",
    description: `Imported from COCO format on ${new Date().toLocaleDateString()}`,
    created_at: new Date().toISOString(),
    images,
    categories,
  };
}

/**
 * Validate COCO dataset structure
 */
export function validateCOCODataset(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required top-level fields
  if (!data.info) errors.push("Missing 'info' field");
  if (!Array.isArray(data.images)) errors.push("Missing or invalid 'images' array");
  if (!Array.isArray(data.annotations)) errors.push("Missing or invalid 'annotations' array");
  if (!Array.isArray(data.categories)) errors.push("Missing or invalid 'categories' array");

  // Validate info
  if (data.info) {
    const requiredInfoFields = ['description', 'version', 'year'];
    requiredInfoFields.forEach(field => {
      if (!data.info[field]) errors.push(`Missing info.${field}`);
    });
  }

  // Validate images
  if (Array.isArray(data.images)) {
    data.images.forEach((image: any, index: number) => {
      const requiredFields = ['id', 'width', 'height', 'file_name'];
      requiredFields.forEach(field => {
        if (image[field] === undefined) errors.push(`Image ${index}: missing ${field}`);
      });
    });
  }

  // Validate categories
  if (Array.isArray(data.categories)) {
    data.categories.forEach((category: any, index: number) => {
      const requiredFields = ['id', 'name'];
      requiredFields.forEach(field => {
        if (category[field] === undefined) errors.push(`Category ${index}: missing ${field}`);
      });
    });
  }

  // Validate annotations
  if (Array.isArray(data.annotations)) {
    data.annotations.forEach((annotation: any, index: number) => {
      const requiredFields = ['id', 'image_id', 'category_id', 'bbox', 'area'];
      requiredFields.forEach(field => {
        if (annotation[field] === undefined) errors.push(`Annotation ${index}: missing ${field}`);
      });

      // Validate bbox format
      if (annotation.bbox && (!Array.isArray(annotation.bbox) || annotation.bbox.length !== 4)) {
        errors.push(`Annotation ${index}: invalid bbox format (should be [x, y, width, height])`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Utility functions
 */

function calculatePolygonArea(polygon: Array<{ x: number; y: number }>): number {
  let area = 0;
  const n = polygon.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }
  
  return Math.abs(area) / 2;
}

function calculatePolygonBBox(polygon: Array<{ x: number; y: number }>): { x: number; y: number; width: number; height: number } {
  const xs = polygon.map(p => p.x);
  const ys = polygon.map(p => p.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function calculateSegmentationArea(segmentation: number[][]): number {
  // Simplified area calculation for complex segmentations
  // In production, you might want to use more sophisticated algorithms
  return segmentation.reduce((totalArea, segment) => {
    const polygon = [];
    for (let i = 0; i < segment.length; i += 2) {
      polygon.push({ x: segment[i], y: segment[i + 1] });
    }
    return totalArea + calculatePolygonArea(polygon);
  }, 0);
}

function calculateSegmentationBBox(segmentation: number[][]): { x: number; y: number; width: number; height: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  
  segmentation.forEach(segment => {
    for (let i = 0; i < segment.length; i += 2) {
      const x = segment[i];
      const y = segment[i + 1];
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  });
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function generateCategoryColor(categoryName: string): string {
  // Generate a consistent color based on category name
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
    '#F1948A', '#85C1E9', '#F8C471', '#82E0AA', '#D7BDE2'
  ];
  
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Export COCO dataset to JSON string
 */
export function exportCOCOToJSON(project: AnnotateAIProject, indent: number = 2): string {
  const cocoDataset = exportToCOCO(project);
  return JSON.stringify(cocoDataset, null, indent);
}

/**
 * Import COCO dataset from JSON string
 */
export function importCOCOFromJSON(jsonString: string): AnnotateAIProject {
  try {
    const cocoData = JSON.parse(jsonString);
    const validation = validateCOCODataset(cocoData);
    
    if (!validation.isValid) {
      throw new Error(`Invalid COCO format: ${validation.errors.join(', ')}`);
    }
    
    return importFromCOCO(cocoData);
  } catch (error) {
    throw new Error(`Failed to parse COCO JSON: ${error.message}`);
  }
} 