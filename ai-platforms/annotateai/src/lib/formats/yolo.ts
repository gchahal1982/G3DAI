/**
 * YOLO Format Export/Import Utilities
 * 
 * YOLO (You Only Look Once) format is widely used for object detection training.
 * This module provides utilities to export/import annotations in YOLO format.
 */

import type { AnnotateAIProject, AnnotateAIImage, AnnotateAIAnnotation, AnnotateAICategory } from './coco';

export interface YOLODataset {
  classes: YOLOClass[];
  images: YOLOImageData[];
  datasetInfo: YOLODatasetInfo;
}

export interface YOLOClass {
  id: number;
  name: string;
  originalId: string;
}

export interface YOLOImageData {
  filename: string;
  width: number;
  height: number;
  annotations: YOLOAnnotation[];
}

export interface YOLOAnnotation {
  classId: number;
  centerX: number; // Normalized (0-1)
  centerY: number; // Normalized (0-1)
  width: number;   // Normalized (0-1)
  height: number;  // Normalized (0-1)
  confidence?: number;
}

export interface YOLODatasetInfo {
  name: string;
  description: string;
  version: string;
  created: string;
  numClasses: number;
  numImages: number;
  numAnnotations: number;
}

export interface YOLOExportOptions {
  includeEmptyImages: boolean;
  normalizeCoordinates: boolean;
  splitDataset: {
    enabled: boolean;
    trainRatio: number;
    valRatio: number;
    testRatio: number;
  };
  confidenceThreshold?: number;
}

export interface YOLOExportResult {
  dataset: YOLODataset;
  files: {
    classesFile: string;      // classes.txt content
    trainImages: string[];    // list of training image filenames
    valImages: string[];      // list of validation image filenames
    testImages: string[];     // list of test image filenames
    annotationFiles: Map<string, string>; // filename -> annotation content
    datasetYaml: string;      // dataset.yaml content for training
  };
  statistics: {
    totalImages: number;
    totalAnnotations: number;
    classDistribution: Record<string, number>;
    trainSplit: number;
    valSplit: number;
    testSplit: number;
  };
}

/**
 * Export AnnotateAI project to YOLO format
 */
export function exportToYOLO(
  project: AnnotateAIProject, 
  options: YOLOExportOptions = getDefaultYOLOOptions()
): YOLOExportResult {
  
  // Filter images and annotations based on options
  let filteredImages = project.images;
  
  if (!options.includeEmptyImages) {
    filteredImages = project.images.filter(image => 
      image.annotations.some(ann => ann.type === 'bbox')
    );
  }

  if (options.confidenceThreshold) {
    filteredImages = filteredImages.map(image => ({
      ...image,
      annotations: image.annotations.filter(ann => 
        !ann.confidence || ann.confidence >= options.confidenceThreshold!
      )
    })).filter(image => 
      options.includeEmptyImages || image.annotations.length > 0
    );
  }

  // Create class mapping
  const classMap = new Map<string, number>();
  const classes: YOLOClass[] = project.categories.map((category, index) => {
    classMap.set(category.id, index);
    return {
      id: index,
      name: category.name,
      originalId: category.id,
    };
  });

  // Convert images and annotations
  const yoloImages: YOLOImageData[] = [];
  let totalAnnotations = 0;
  const classDistribution: Record<string, number> = {};

  // Initialize class distribution
  classes.forEach(cls => {
    classDistribution[cls.name] = 0;
  });

  filteredImages.forEach(image => {
    const yoloAnnotations: YOLOAnnotation[] = [];

    image.annotations.forEach(annotation => {
      if (annotation.type !== 'bbox' || !annotation.bbox) {
        return; // YOLO only supports bounding boxes
      }

      const classId = classMap.get(annotation.category_id);
      if (classId === undefined) {
        console.warn(`Category ${annotation.category_id} not found for annotation ${annotation.id}`);
        return;
      }

      // Convert to YOLO format (normalized coordinates)
      const centerX = (annotation.bbox.x + annotation.bbox.width / 2) / image.width;
      const centerY = (annotation.bbox.y + annotation.bbox.height / 2) / image.height;
      const width = annotation.bbox.width / image.width;
      const height = annotation.bbox.height / image.height;

      // Validate coordinates
      if (centerX < 0 || centerX > 1 || centerY < 0 || centerY > 1 || 
          width <= 0 || width > 1 || height <= 0 || height > 1) {
        console.warn(`Invalid coordinates for annotation ${annotation.id}`);
        return;
      }

      const yoloAnnotation: YOLOAnnotation = {
        classId,
        centerX,
        centerY,
        width,
        height,
        confidence: annotation.confidence,
      };

      yoloAnnotations.push(yoloAnnotation);
      totalAnnotations++;

      // Update class distribution
      const className = classes[classId].name;
      classDistribution[className]++;
    });

    yoloImages.push({
      filename: image.filename,
      width: image.width,
      height: image.height,
      annotations: yoloAnnotations,
    });
  });

  // Split dataset if requested
  const { trainImages, valImages, testImages } = splitDataset(yoloImages, options.splitDataset);

  // Generate files
  const files = generateYOLOFiles(classes, trainImages, valImages, testImages, project.name);

  const dataset: YOLODataset = {
    classes,
    images: yoloImages,
    datasetInfo: {
      name: project.name,
      description: project.description,
      version: "1.0",
      created: new Date().toISOString(),
      numClasses: classes.length,
      numImages: yoloImages.length,
      numAnnotations: totalAnnotations,
    },
  };

  return {
    dataset,
    files,
    statistics: {
      totalImages: yoloImages.length,
      totalAnnotations,
      classDistribution,
      trainSplit: trainImages.length,
      valSplit: valImages.length,
      testSplit: testImages.length,
    },
  };
}

/**
 * Import YOLO format data to AnnotateAI project structure
 */
export function importFromYOLO(
  yoloDataset: YOLODataset,
  classesContent?: string,
  imageFiles?: File[]
): AnnotateAIProject {
  
  // Parse classes if provided as string
  let classes = yoloDataset.classes;
  if (classesContent) {
    classes = parseClassesFile(classesContent);
  }

  // Create categories
  const categories: AnnotateAICategory[] = classes.map(cls => ({
    id: `yolo_cat_${cls.id}`,
    name: cls.name,
    color: generateCategoryColor(cls.name),
  }));

  // Convert images
  const images: AnnotateAIImage[] = yoloDataset.images.map((yoloImage, index) => {
    const annotations: AnnotateAIAnnotation[] = yoloImage.annotations.map((yoloAnn, annIndex) => {
      // Convert from normalized YOLO coordinates back to pixel coordinates
      const centerXPixel = yoloAnn.centerX * yoloImage.width;
      const centerYPixel = yoloAnn.centerY * yoloImage.height;
      const widthPixel = yoloAnn.width * yoloImage.width;
      const heightPixel = yoloAnn.height * yoloImage.height;

      const x = centerXPixel - widthPixel / 2;
      const y = centerYPixel - heightPixel / 2;

      return {
        id: `yolo_ann_${index}_${annIndex}`,
        image_id: `yolo_img_${index}`,
        category_id: `yolo_cat_${yoloAnn.classId}`,
        type: 'bbox' as const,
        bbox: {
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: Math.min(widthPixel, yoloImage.width - x),
          height: Math.min(heightPixel, yoloImage.height - y),
        },
        area: widthPixel * heightPixel,
        confidence: yoloAnn.confidence,
      };
    });

    return {
      id: `yolo_img_${index}`,
      filename: yoloImage.filename,
      width: yoloImage.width,
      height: yoloImage.height,
      url: `./images/${yoloImage.filename}`,
      annotations,
    };
  });

  return {
    id: `yolo_import_${Date.now()}`,
    name: yoloDataset.datasetInfo?.name || "Imported YOLO Dataset",
    description: yoloDataset.datasetInfo?.description || `Imported from YOLO format on ${new Date().toLocaleDateString()}`,
    created_at: new Date().toISOString(),
    images,
    categories,
  };
}

/**
 * Parse YOLO annotation file content
 */
export function parseYOLOAnnotationFile(
  content: string,
  imageWidth: number,
  imageHeight: number
): YOLOAnnotation[] {
  const lines = content.trim().split('\n').filter(line => line.trim());
  const annotations: YOLOAnnotation[] = [];

  lines.forEach((line, index) => {
    const parts = line.trim().split(/\s+/);
    
    if (parts.length < 5) {
      console.warn(`Invalid YOLO annotation on line ${index + 1}: ${line}`);
      return;
    }

    const classId = parseInt(parts[0], 10);
    const centerX = parseFloat(parts[1]);
    const centerY = parseFloat(parts[2]);
    const width = parseFloat(parts[3]);
    const height = parseFloat(parts[4]);
    const confidence = parts.length > 5 ? parseFloat(parts[5]) : undefined;

    // Validate values
    if (isNaN(classId) || isNaN(centerX) || isNaN(centerY) || isNaN(width) || isNaN(height)) {
      console.warn(`Invalid numeric values on line ${index + 1}: ${line}`);
      return;
    }

    if (centerX < 0 || centerX > 1 || centerY < 0 || centerY > 1 || 
        width <= 0 || width > 1 || height <= 0 || height > 1) {
      console.warn(`Invalid coordinates on line ${index + 1}: ${line}`);
      return;
    }

    annotations.push({
      classId,
      centerX,
      centerY,
      width,
      height,
      confidence,
    });
  });

  return annotations;
}

/**
 * Generate YOLO annotation file content
 */
export function generateYOLOAnnotationFile(annotations: YOLOAnnotation[]): string {
  return annotations.map(ann => {
    const line = `${ann.classId} ${ann.centerX.toFixed(6)} ${ann.centerY.toFixed(6)} ${ann.width.toFixed(6)} ${ann.height.toFixed(6)}`;
    return ann.confidence ? `${line} ${ann.confidence.toFixed(4)}` : line;
  }).join('\n');
}

/**
 * Parse classes.txt file
 */
export function parseClassesFile(content: string): YOLOClass[] {
  const lines = content.trim().split('\n').filter(line => line.trim());
  return lines.map((line, index) => ({
    id: index,
    name: line.trim(),
    originalId: `class_${index}`,
  }));
}

/**
 * Generate classes.txt file content
 */
export function generateClassesFile(classes: YOLOClass[]): string {
  return classes.map(cls => cls.name).join('\n');
}

/**
 * Validate YOLO dataset structure
 */
export function validateYOLODataset(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.classes || !Array.isArray(data.classes)) {
    errors.push("Missing or invalid 'classes' array");
  }

  if (!data.images || !Array.isArray(data.images)) {
    errors.push("Missing or invalid 'images' array");
  }

  // Validate classes
  if (Array.isArray(data.classes)) {
    data.classes.forEach((cls: any, index: number) => {
      if (typeof cls.id !== 'number') errors.push(`Class ${index}: invalid id`);
      if (typeof cls.name !== 'string') errors.push(`Class ${index}: invalid name`);
    });
  }

  // Validate images
  if (Array.isArray(data.images)) {
    data.images.forEach((image: any, index: number) => {
      if (typeof image.filename !== 'string') errors.push(`Image ${index}: invalid filename`);
      if (typeof image.width !== 'number') errors.push(`Image ${index}: invalid width`);
      if (typeof image.height !== 'number') errors.push(`Image ${index}: invalid height`);
      
      if (!Array.isArray(image.annotations)) {
        errors.push(`Image ${index}: invalid annotations array`);
      } else {
        image.annotations.forEach((ann: any, annIndex: number) => {
          const requiredFields = ['classId', 'centerX', 'centerY', 'width', 'height'];
          requiredFields.forEach(field => {
            if (typeof ann[field] !== 'number') {
              errors.push(`Image ${index}, annotation ${annIndex}: invalid ${field}`);
            }
          });
        });
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

function getDefaultYOLOOptions(): YOLOExportOptions {
  return {
    includeEmptyImages: false,
    normalizeCoordinates: true,
    splitDataset: {
      enabled: true,
      trainRatio: 0.8,
      valRatio: 0.1,
      testRatio: 0.1,
    },
  };
}

function splitDataset(
  images: YOLOImageData[], 
  splitConfig: YOLOExportOptions['splitDataset']
): { trainImages: YOLOImageData[]; valImages: YOLOImageData[]; testImages: YOLOImageData[] } {
  
  if (!splitConfig.enabled) {
    return {
      trainImages: images,
      valImages: [],
      testImages: [],
    };
  }

  // Shuffle images for random split
  const shuffled = [...images].sort(() => Math.random() - 0.5);
  
  const total = shuffled.length;
  const trainCount = Math.floor(total * splitConfig.trainRatio);
  const valCount = Math.floor(total * splitConfig.valRatio);
  const testCount = total - trainCount - valCount;

  return {
    trainImages: shuffled.slice(0, trainCount),
    valImages: shuffled.slice(trainCount, trainCount + valCount),
    testImages: shuffled.slice(trainCount + valCount, trainCount + valCount + testCount),
  };
}

function generateYOLOFiles(
  classes: YOLOClass[],
  trainImages: YOLOImageData[],
  valImages: YOLOImageData[],
  testImages: YOLOImageData[],
  projectName: string
): YOLOExportResult['files'] {
  
  // Generate classes.txt
  const classesFile = generateClassesFile(classes);

  // Generate image lists
  const trainImagesList = trainImages.map(img => img.filename);
  const valImagesList = valImages.map(img => img.filename);
  const testImagesList = testImages.map(img => img.filename);

  // Generate annotation files
  const annotationFiles = new Map<string, string>();
  [...trainImages, ...valImages, ...testImages].forEach(image => {
    const annotationContent = generateYOLOAnnotationFile(image.annotations);
    const annotationFilename = image.filename.replace(/\.[^.]+$/, '.txt');
    annotationFiles.set(annotationFilename, annotationContent);
  });

  // Generate dataset.yaml for training
  const datasetYaml = generateDatasetYaml({
    name: projectName,
    classes,
    trainPath: './images/train',
    valPath: './images/val',
    testPath: testImages.length > 0 ? './images/test' : undefined,
  });

  return {
    classesFile,
    trainImages: trainImagesList,
    valImages: valImagesList,
    testImages: testImagesList,
    annotationFiles,
    datasetYaml,
  };
}

function generateDatasetYaml(config: {
  name: string;
  classes: YOLOClass[];
  trainPath: string;
  valPath: string;
  testPath?: string;
}): string {
  const classNames = config.classes.map(cls => cls.name);
  
  let yaml = `# YOLOv5/YOLOv8 dataset configuration
# Generated by AnnotateAI on ${new Date().toISOString()}

train: ${config.trainPath}
val: ${config.valPath}
`;

  if (config.testPath) {
    yaml += `test: ${config.testPath}\n`;
  }

  yaml += `
nc: ${config.classes.length}  # number of classes
names: [${classNames.map(name => `'${name}'`).join(', ')}]  # class names
`;

  return yaml;
}

function generateCategoryColor(categoryName: string): string {
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