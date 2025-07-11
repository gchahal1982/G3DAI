import { NextRequest, NextResponse } from 'next/server';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  statistics: {
    totalAnnotations: number;
    validAnnotations: number;
    invalidAnnotations: number;
    annotationTypes: Record<string, number>;
    avgConfidence: number;
    missingRequired: string[];
  };
  recommendations: string[];
}

export interface ValidationError {
  id: string;
  type: 'missing_required' | 'invalid_format' | 'invalid_coordinates' | 'invalid_category' | 'duplicate_annotation';
  message: string;
  field?: string;
  annotationId?: string;
  severity: 'error' | 'warning' | 'info';
  suggestedFix?: string;
}

export interface ValidationWarning {
  id: string;
  type: 'low_confidence' | 'small_annotation' | 'overlapping_annotations' | 'unusual_aspect_ratio';
  message: string;
  annotationId?: string;
  value?: number;
  threshold?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { format, annotations, config = {} } = await request.json();

    if (!format || !annotations) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: format and annotations'
      }, { status: 400 });
    }

    // Validate format
    const supportedFormats = ['coco', 'yolo', 'pascal-voc', 'tensorflow', 'pytorch', 'huggingface', 'custom-json'];
    if (!supportedFormats.includes(format)) {
      return NextResponse.json({
        success: false,
        error: `Unsupported format: ${format}. Supported formats: ${supportedFormats.join(', ')}`
      }, { status: 400 });
    }

    // Perform validation based on format
    const validationResult = await validateAnnotations(format, annotations, config);

    return NextResponse.json({
      success: true,
      format,
      validation: validationResult,
      canExport: validationResult.valid || validationResult.errors.length === 0,
      exportRecommendations: generateExportRecommendations(validationResult)
    });

  } catch (error) {
    console.error('Error validating annotations:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to validate annotations'
    }, { status: 500 });
  }
}

async function validateAnnotations(format: string, annotations: any[], config: any): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const statistics = {
    totalAnnotations: annotations.length,
    validAnnotations: 0,
    invalidAnnotations: 0,
    annotationTypes: {} as Record<string, number>,
    avgConfidence: 0,
    missingRequired: [] as string[]
  };

  let totalConfidence = 0;
  let confidenceCount = 0;

  // Format-specific validation
  for (let i = 0; i < annotations.length; i++) {
    const annotation = annotations[i];
    const annotationId = annotation.id || `annotation_${i}`;

    // Common validation
    const commonErrors = validateCommonFields(annotation, annotationId);
    errors.push(...commonErrors);

    // Format-specific validation
    switch (format) {
      case 'coco':
        const cocoErrors = validateCocoFormat(annotation, annotationId);
        errors.push(...cocoErrors);
        break;
      case 'yolo':
        const yoloErrors = validateYoloFormat(annotation, annotationId);
        errors.push(...yoloErrors);
        break;
      case 'pascal-voc':
        const pascalErrors = validatePascalVocFormat(annotation, annotationId);
        errors.push(...pascalErrors);
        break;
      case 'tensorflow':
        const tfErrors = validateTensorFlowFormat(annotation, annotationId);
        errors.push(...tfErrors);
        break;
      case 'pytorch':
        const pytorchErrors = validatePyTorchFormat(annotation, annotationId);
        errors.push(...pytorchErrors);
        break;
      case 'huggingface':
        const hfErrors = validateHuggingFaceFormat(annotation, annotationId);
        errors.push(...hfErrors);
        break;
      case 'custom-json':
        const customErrors = validateCustomJsonFormat(annotation, annotationId, config);
        errors.push(...customErrors);
        break;
    }

    // Generate warnings
    const annotationWarnings = generateWarnings(annotation, annotationId);
    warnings.push(...annotationWarnings);

    // Update statistics
    if (annotation.type) {
      statistics.annotationTypes[annotation.type] = (statistics.annotationTypes[annotation.type] || 0) + 1;
    }

    if (annotation.confidence !== undefined) {
      totalConfidence += annotation.confidence;
      confidenceCount++;
    }

    // Count valid/invalid annotations
    const hasErrors = errors.some(e => e.annotationId === annotationId && e.severity === 'error');
    if (hasErrors) {
      statistics.invalidAnnotations++;
    } else {
      statistics.validAnnotations++;
    }
  }

  // Calculate average confidence
  if (confidenceCount > 0) {
    statistics.avgConfidence = totalConfidence / confidenceCount;
  }

  // Generate recommendations
  const recommendations = generateRecommendations(errors, warnings, statistics, format);

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    warnings,
    statistics,
    recommendations
  };
}

function validateCommonFields(annotation: any, annotationId: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!annotation.id && !annotation.annotation_id) {
    errors.push({
      id: `missing_id_${annotationId}`,
      type: 'missing_required',
      message: 'Annotation is missing required id field',
      field: 'id',
      annotationId,
      severity: 'error',
      suggestedFix: 'Add a unique id field to each annotation'
    });
  }

  if (!annotation.type && !annotation.annotation_type) {
    errors.push({
      id: `missing_type_${annotationId}`,
      type: 'missing_required',
      message: 'Annotation is missing required type field',
      field: 'type',
      annotationId,
      severity: 'error',
      suggestedFix: 'Add annotation type (bbox, polygon, keypoints, etc.)'
    });
  }

  // Validate coordinates if present
  if (annotation.bbox && Array.isArray(annotation.bbox)) {
    if (annotation.bbox.length !== 4) {
      errors.push({
        id: `invalid_bbox_${annotationId}`,
        type: 'invalid_coordinates',
        message: 'Bounding box must have exactly 4 coordinates [x, y, width, height]',
        field: 'bbox',
        annotationId,
        severity: 'error',
        suggestedFix: 'Ensure bbox format is [x, y, width, height]'
      });
    } else {
      const [x, y, width, height] = annotation.bbox;
      if (x < 0 || y < 0 || width <= 0 || height <= 0) {
        errors.push({
          id: `invalid_bbox_values_${annotationId}`,
          type: 'invalid_coordinates',
          message: 'Invalid bounding box coordinates - x,y must be ≥0, width,height must be >0',
          field: 'bbox',
          annotationId,
          severity: 'error',
          suggestedFix: 'Check coordinate values: x,y ≥ 0, width,height > 0'
        });
      }
    }
  }

  return errors;
}

function validateCocoFormat(annotation: any, annotationId: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // COCO specific validation
  if (!annotation.category_id && !annotation.categoryId) {
    errors.push({
      id: `missing_category_${annotationId}`,
      type: 'missing_required',
      message: 'COCO format requires category_id field',
      field: 'category_id',
      annotationId,
      severity: 'error',
      suggestedFix: 'Add category_id field with valid category reference'
    });
  }

  if (!annotation.image_id && !annotation.imageId) {
    errors.push({
      id: `missing_image_${annotationId}`,
      type: 'missing_required',
      message: 'COCO format requires image_id field',
      field: 'image_id',
      annotationId,
      severity: 'error',
      suggestedFix: 'Add image_id field with valid image reference'
    });
  }

  // Validate segmentation if present
  if (annotation.segmentation && annotation.segmentation.length > 0) {
    if (Array.isArray(annotation.segmentation[0])) {
      // Polygon segmentation
      for (let i = 0; i < annotation.segmentation.length; i++) {
        const polygon = annotation.segmentation[i];
        if (polygon.length % 2 !== 0) {
          errors.push({
            id: `invalid_polygon_${annotationId}_${i}`,
            type: 'invalid_coordinates',
            message: `Polygon ${i} must have even number of coordinates (x,y pairs)`,
            field: 'segmentation',
            annotationId,
            severity: 'error',
            suggestedFix: 'Ensure polygon coordinates are [x1,y1,x2,y2,...]'
          });
        }
      }
    }
  }

  return errors;
}

function validateYoloFormat(annotation: any, annotationId: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // YOLO specific validation
  if (!annotation.class_id && annotation.class_id !== 0) {
    errors.push({
      id: `missing_class_${annotationId}`,
      type: 'missing_required',
      message: 'YOLO format requires class_id field',
      field: 'class_id',
      annotationId,
      severity: 'error',
      suggestedFix: 'Add class_id field (0-based integer)'
    });
  }

  // Validate normalized coordinates
  if (annotation.bbox) {
    const [x_center, y_center, width, height] = annotation.bbox;
    if (x_center < 0 || x_center > 1 || y_center < 0 || y_center > 1 || 
        width <= 0 || width > 1 || height <= 0 || height > 1) {
      errors.push({
        id: `invalid_normalized_coords_${annotationId}`,
        type: 'invalid_coordinates',
        message: 'YOLO coordinates must be normalized (0-1 range)',
        field: 'bbox',
        annotationId,
        severity: 'error',
        suggestedFix: 'Normalize coordinates: center_x, center_y, width, height all in [0,1]'
      });
    }
  }

  return errors;
}

function validatePascalVocFormat(annotation: any, annotationId: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Pascal VOC specific validation
  if (!annotation.name && !annotation.class_name) {
    errors.push({
      id: `missing_name_${annotationId}`,
      type: 'missing_required',
      message: 'Pascal VOC format requires name field',
      field: 'name',
      annotationId,
      severity: 'error',
      suggestedFix: 'Add name field with class name'
    });
  }

  // Validate bndbox format
  if (annotation.bndbox) {
    const required = ['xmin', 'ymin', 'xmax', 'ymax'];
    for (const field of required) {
      if (annotation.bndbox[field] === undefined) {
        errors.push({
          id: `missing_bndbox_${field}_${annotationId}`,
          type: 'missing_required',
          message: `Pascal VOC bounding box missing ${field}`,
          field: `bndbox.${field}`,
          annotationId,
          severity: 'error',
          suggestedFix: `Add ${field} to bndbox object`
        });
      }
    }
  }

  return errors;
}

function validateTensorFlowFormat(annotation: any, annotationId: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // TensorFlow specific validation
  if (!annotation.filename && !annotation.image_path) {
    errors.push({
      id: `missing_filename_${annotationId}`,
      type: 'missing_required',
      message: 'TensorFlow format requires filename field',
      field: 'filename',
      annotationId,
      severity: 'error',
      suggestedFix: 'Add filename field with image path'
    });
  }

  return errors;
}

function validatePyTorchFormat(annotation: any, annotationId: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // PyTorch specific validation
  if (!annotation.target && !annotation.labels) {
    errors.push({
      id: `missing_target_${annotationId}`,
      type: 'missing_required',
      message: 'PyTorch format requires target or labels field',
      field: 'target',
      annotationId,
      severity: 'error',
      suggestedFix: 'Add target field with annotation labels'
    });
  }

  return errors;
}

function validateHuggingFaceFormat(annotation: any, annotationId: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Hugging Face specific validation
  if (!annotation.objects && !annotation.annotations) {
    errors.push({
      id: `missing_objects_${annotationId}`,
      type: 'missing_required',
      message: 'Hugging Face format requires objects or annotations field',
      field: 'objects',
      annotationId,
      severity: 'error',
      suggestedFix: 'Add objects field with annotation data'
    });
  }

  return errors;
}

function validateCustomJsonFormat(annotation: any, annotationId: string, config: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Custom JSON validation based on provided schema
  if (config.schema && config.schema.required) {
    for (const field of config.schema.required) {
      if (annotation[field] === undefined) {
        errors.push({
          id: `missing_custom_${field}_${annotationId}`,
          type: 'missing_required',
          message: `Custom schema requires ${field} field`,
          field,
          annotationId,
          severity: 'error',
          suggestedFix: `Add required field: ${field}`
        });
      }
    }
  }

  return errors;
}

function generateWarnings(annotation: any, annotationId: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Low confidence warning
  if (annotation.confidence !== undefined && annotation.confidence < 0.5) {
    warnings.push({
      id: `low_confidence_${annotationId}`,
      type: 'low_confidence',
      message: 'Annotation has low confidence score',
      annotationId,
      value: annotation.confidence,
      threshold: 0.5
    });
  }

  // Small annotation warning
  if (annotation.bbox && Array.isArray(annotation.bbox)) {
    const [, , width, height] = annotation.bbox;
    const area = width * height;
    if (area < 100) { // pixels
      warnings.push({
        id: `small_annotation_${annotationId}`,
        type: 'small_annotation',
        message: 'Annotation is very small (may be difficult to detect)',
        annotationId,
        value: area,
        threshold: 100
      });
    }
  }

  return warnings;
}

function generateRecommendations(
  errors: ValidationError[], 
  warnings: ValidationWarning[], 
  statistics: any, 
  format: string
): string[] {
  const recommendations: string[] = [];

  // Error-based recommendations
  if (errors.length > 0) {
    recommendations.push(`Fix ${errors.length} validation errors before export`);
  }

  // Warning-based recommendations
  if (warnings.length > 0) {
    recommendations.push(`Review ${warnings.length} warnings for potential issues`);
  }

  // Statistics-based recommendations
  if (statistics.avgConfidence < 0.7) {
    recommendations.push('Consider reviewing annotations with low confidence scores');
  }

  if (statistics.invalidAnnotations > statistics.validAnnotations * 0.1) {
    recommendations.push('High number of invalid annotations detected - review annotation quality');
  }

  // Format-specific recommendations
  switch (format) {
    case 'yolo':
      recommendations.push('Ensure all coordinates are normalized (0-1 range) for YOLO format');
      break;
    case 'coco':
      recommendations.push('Verify category mappings are consistent with COCO format requirements');
      break;
    case 'pascal-voc':
      recommendations.push('Check that all required Pascal VOC XML elements are present');
      break;
  }

  return recommendations;
}

function generateExportRecommendations(validation: ValidationResult): string[] {
  const recommendations: string[] = [];

  if (validation.valid) {
    recommendations.push('✅ All validations passed - ready for export');
  } else {
    recommendations.push('❌ Fix validation errors before export');
  }

  if (validation.warnings.length > 0) {
    recommendations.push(`⚠️ ${validation.warnings.length} warnings found - review recommended`);
  }

  if (validation.statistics.avgConfidence < 0.8) {
    recommendations.push('💡 Consider manual review of low-confidence annotations');
  }

  return recommendations;
} 