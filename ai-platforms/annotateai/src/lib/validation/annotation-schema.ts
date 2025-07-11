export interface AnnotationSchema {
  id: string;
  name: string;
  version: string;
  description: string;
  annotationType: AnnotationType;
  requiredFields: string[];
  optionalFields: string[];
  fieldValidations: Record<string, FieldValidation>;
  customValidations: CustomValidation[];
  compatibleFormats: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    author: string;
    tags: string[];
  };
}

export type AnnotationType = 
  | 'bbox' 
  | 'polygon' 
  | 'polyline' 
  | 'point' 
  | 'keypoints' 
  | 'classification' 
  | 'segmentation' 
  | 'text' 
  | 'video_tracking' 
  | 'audio_segment' 
  | 'custom';

export interface FieldValidation {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum' | 'coordinates';
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enumValues?: string[];
  arrayItemType?: string;
  coordinates?: CoordinateValidation;
  customValidator?: string;
}

export interface CoordinateValidation {
  format: 'absolute' | 'normalized' | 'percentage';
  dimensions: number; // 2D or 3D
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    minZ?: number;
    maxZ?: number;
  };
  precision?: number;
  allowNegative?: boolean;
}

export interface CustomValidation {
  id: string;
  name: string;
  description: string;
  condition: string; // JavaScript expression
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
  category: 'business' | 'technical' | 'quality';
}

export interface ValidationResult {
  valid: boolean;
  score: number; // 0-100
  errors: ValidationError[];
  warnings: ValidationWarning[];
  info: ValidationInfo[];
  statistics: ValidationStatistics;
  recommendations: string[];
}

export interface ValidationError {
  id: string;
  field: string;
  message: string;
  value: any;
  expected: string;
  severity: 'critical' | 'major' | 'minor';
  category: 'missing' | 'invalid' | 'format' | 'range' | 'custom';
  suggestedFix?: string;
  annotationId?: string;
}

export interface ValidationWarning {
  id: string;
  field: string;
  message: string;
  value: any;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  annotationId?: string;
}

export interface ValidationInfo {
  id: string;
  message: string;
  category: 'optimization' | 'best_practice' | 'compatibility';
  details?: string;
}

export interface ValidationStatistics {
  totalAnnotations: number;
  validAnnotations: number;
  invalidAnnotations: number;
  errorCount: number;
  warningCount: number;
  averageScore: number;
  fieldStats: Record<string, {
    present: number;
    missing: number;
    invalid: number;
    validationRate: number;
  }>;
  annotationTypeStats: Record<string, number>;
  qualityMetrics: {
    completeness: number;
    accuracy: number;
    consistency: number;
    coverage: number;
  };
}

// Predefined schemas for common annotation types
export const predefinedSchemas: Record<string, AnnotationSchema> = {
  'bbox-coco': {
    id: 'bbox-coco',
    name: 'COCO Bounding Box',
    version: '1.0.0',
    description: 'COCO format bounding box annotations',
    annotationType: 'bbox',
    requiredFields: ['id', 'image_id', 'category_id', 'bbox', 'area', 'iscrowd'],
    optionalFields: ['segmentation', 'attributes', 'track_id'],
    fieldValidations: {
      id: { type: 'number', required: true, min: 1 },
      image_id: { type: 'number', required: true, min: 1 },
      category_id: { type: 'number', required: true, min: 1 },
      bbox: { 
        type: 'coordinates', 
        required: true, 
        coordinates: { 
          format: 'absolute', 
          dimensions: 2, 
          bounds: { minX: 0, minY: 0 } 
        } 
      },
      area: { type: 'number', required: true, min: 0 },
      iscrowd: { type: 'boolean', required: true },
      segmentation: { type: 'array', required: false },
      attributes: { type: 'object', required: false },
      track_id: { type: 'number', required: false, min: 0 }
    },
    customValidations: [
      {
        id: 'bbox-area-consistency',
        name: 'Bounding Box Area Consistency',
        description: 'Verify that calculated area matches bbox dimensions',
        condition: 'annotation.area === (annotation.bbox[2] * annotation.bbox[3])',
        errorMessage: 'Area field does not match bounding box dimensions',
        severity: 'warning',
        category: 'quality'
      }
    ],
    compatibleFormats: ['coco', 'custom-json'],
    metadata: {
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'AnnotateAI',
      tags: ['object-detection', 'coco', 'bounding-box']
    }
  },
  'bbox-yolo': {
    id: 'bbox-yolo',
    name: 'YOLO Bounding Box',
    version: '1.0.0',
    description: 'YOLO format bounding box annotations with normalized coordinates',
    annotationType: 'bbox',
    requiredFields: ['class_id', 'x_center', 'y_center', 'width', 'height'],
    optionalFields: ['confidence', 'track_id', 'attributes'],
    fieldValidations: {
      class_id: { type: 'number', required: true, min: 0 },
      x_center: { type: 'number', required: true, min: 0, max: 1 },
      y_center: { type: 'number', required: true, min: 0, max: 1 },
      width: { type: 'number', required: true, min: 0, max: 1 },
      height: { type: 'number', required: true, min: 0, max: 1 },
      confidence: { type: 'number', required: false, min: 0, max: 1 },
      track_id: { type: 'number', required: false, min: 0 },
      attributes: { type: 'object', required: false }
    },
    customValidations: [
      {
        id: 'yolo-bounds-check',
        name: 'YOLO Bounds Check',
        description: 'Verify that bounding box stays within image bounds',
        condition: '(annotation.x_center - annotation.width/2) >= 0 && (annotation.x_center + annotation.width/2) <= 1 && (annotation.y_center - annotation.height/2) >= 0 && (annotation.y_center + annotation.height/2) <= 1',
        errorMessage: 'Bounding box extends beyond image boundaries',
        severity: 'error',
        category: 'technical'
      }
    ],
    compatibleFormats: ['yolo', 'custom-json'],
    metadata: {
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'AnnotateAI',
      tags: ['object-detection', 'yolo', 'normalized-coordinates']
    }
  },
  'polygon-segmentation': {
    id: 'polygon-segmentation',
    name: 'Polygon Segmentation',
    version: '1.0.0',
    description: 'Polygon-based segmentation annotations',
    annotationType: 'polygon',
    requiredFields: ['id', 'image_id', 'category_id', 'segmentation'],
    optionalFields: ['bbox', 'area', 'attributes', 'confidence'],
    fieldValidations: {
      id: { type: 'number', required: true, min: 1 },
      image_id: { type: 'number', required: true, min: 1 },
      category_id: { type: 'number', required: true, min: 1 },
      segmentation: { 
        type: 'array', 
        required: true, 
        arrayItemType: 'number' 
      },
      bbox: { 
        type: 'coordinates', 
        required: false, 
        coordinates: { format: 'absolute', dimensions: 2 } 
      },
      area: { type: 'number', required: false, min: 0 },
      attributes: { type: 'object', required: false },
      confidence: { type: 'number', required: false, min: 0, max: 1 }
    },
    customValidations: [
      {
        id: 'polygon-minimum-points',
        name: 'Polygon Minimum Points',
        description: 'Polygon must have at least 3 points (6 coordinates)',
        condition: 'annotation.segmentation.length >= 6',
        errorMessage: 'Polygon must have at least 3 points',
        severity: 'error',
        category: 'technical'
      },
      {
        id: 'polygon-even-coordinates',
        name: 'Even Coordinate Count',
        description: 'Polygon must have even number of coordinates (x,y pairs)',
        condition: 'annotation.segmentation.length % 2 === 0',
        errorMessage: 'Polygon must have even number of coordinates',
        severity: 'error',
        category: 'technical'
      }
    ],
    compatibleFormats: ['coco', 'labelme', 'custom-json'],
    metadata: {
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'AnnotateAI',
      tags: ['segmentation', 'polygon', 'instance-segmentation']
    }
  },
  'keypoints-pose': {
    id: 'keypoints-pose',
    name: 'Keypoints Pose Estimation',
    version: '1.0.0',
    description: 'Human pose estimation with keypoints',
    annotationType: 'keypoints',
    requiredFields: ['id', 'image_id', 'category_id', 'keypoints', 'num_keypoints'],
    optionalFields: ['bbox', 'area', 'attributes', 'skeleton'],
    fieldValidations: {
      id: { type: 'number', required: true, min: 1 },
      image_id: { type: 'number', required: true, min: 1 },
      category_id: { type: 'number', required: true, min: 1 },
      keypoints: { 
        type: 'array', 
        required: true, 
        arrayItemType: 'number' 
      },
      num_keypoints: { type: 'number', required: true, min: 0 },
      bbox: { 
        type: 'coordinates', 
        required: false, 
        coordinates: { format: 'absolute', dimensions: 2 } 
      },
      area: { type: 'number', required: false, min: 0 },
      attributes: { type: 'object', required: false },
      skeleton: { type: 'array', required: false }
    },
    customValidations: [
      {
        id: 'keypoints-count-consistency',
        name: 'Keypoints Count Consistency',
        description: 'Verify that keypoints array length matches expected format',
        condition: 'annotation.keypoints.length % 3 === 0',
        errorMessage: 'Keypoints array must have triplets of [x, y, visibility]',
        severity: 'error',
        category: 'technical'
      },
      {
        id: 'visible-keypoints-count',
        name: 'Visible Keypoints Count',
        description: 'Verify that num_keypoints matches visible keypoints',
        condition: 'annotation.num_keypoints === annotation.keypoints.filter((_, i) => i % 3 === 2 && annotation.keypoints[i] > 0).length',
        errorMessage: 'num_keypoints does not match count of visible keypoints',
        severity: 'warning',
        category: 'quality'
      }
    ],
    compatibleFormats: ['coco', 'openpose', 'custom-json'],
    metadata: {
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      author: 'AnnotateAI',
      tags: ['pose-estimation', 'keypoints', 'human-pose']
    }
  }
};

export class AnnotationValidator {
  private schema: AnnotationSchema;
  
  constructor(schema: AnnotationSchema) {
    this.schema = schema;
  }

  static createFromPredefined(schemaId: string): AnnotationValidator {
    const schema = predefinedSchemas[schemaId];
    if (!schema) {
      throw new Error(`Unknown predefined schema: ${schemaId}`);
    }
    return new AnnotationValidator(schema);
  }

  static createCustom(schema: AnnotationSchema): AnnotationValidator {
    return new AnnotationValidator(schema);
  }

  validateAnnotation(annotation: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const info: ValidationInfo[] = [];

    // Validate required fields
    for (const field of this.schema.requiredFields) {
      if (annotation[field] === undefined || annotation[field] === null) {
        errors.push({
          id: `missing-${field}`,
          field,
          message: `Required field '${field}' is missing`,
          value: annotation[field],
          expected: 'Non-null value',
          severity: 'critical',
          category: 'missing',
          suggestedFix: `Add ${field} field to annotation`,
          annotationId: annotation.id
        });
      }
    }

    // Validate field types and constraints
    for (const [field, validation] of Object.entries(this.schema.fieldValidations)) {
      const value = annotation[field];
      
      if (value !== undefined && value !== null) {
        const fieldErrors = this.validateField(field, value, validation, annotation.id);
        errors.push(...fieldErrors);
      }
    }

    // Run custom validations
    for (const customValidation of this.schema.customValidations) {
      try {
        const result = this.evaluateCustomValidation(annotation, customValidation);
        if (!result.valid) {
          if (customValidation.severity === 'error') {
            errors.push({
              id: customValidation.id,
              field: 'custom',
              message: customValidation.errorMessage,
              value: annotation,
              expected: customValidation.description,
              severity: 'major',
              category: 'custom',
              annotationId: annotation.id
            });
          } else {
            warnings.push({
              id: customValidation.id,
              field: 'custom',
              message: customValidation.errorMessage,
              value: annotation,
              recommendation: customValidation.description,
              impact: 'medium',
              annotationId: annotation.id
            });
          }
        }
      } catch (error) {
        errors.push({
          id: `custom-validation-error-${customValidation.id}`,
          field: 'custom',
          message: `Custom validation failed: ${error.message}`,
          value: annotation,
          expected: 'Valid custom validation',
          severity: 'minor',
          category: 'custom',
          annotationId: annotation.id
        });
      }
    }

    // Generate quality warnings
    const qualityWarnings = this.generateQualityWarnings(annotation);
    warnings.push(...qualityWarnings);

    // Generate optimization info
    const optimizationInfo = this.generateOptimizationInfo(annotation);
    info.push(...optimizationInfo);

    // Calculate score
    const score = this.calculateValidationScore(errors, warnings);

    // Generate recommendations
    const recommendations = this.generateRecommendations(errors, warnings, annotation);

    return {
      valid: errors.length === 0,
      score,
      errors,
      warnings,
      info,
      statistics: this.calculateStatistics([annotation], [{ errors, warnings }]),
      recommendations
    };
  }

  validateAnnotations(annotations: any[]): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    const allInfo: ValidationInfo[] = [];
    const validationResults: { errors: ValidationError[]; warnings: ValidationWarning[] }[] = [];

    // Validate each annotation
    for (const annotation of annotations) {
      const result = this.validateAnnotation(annotation);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
      allInfo.push(...result.info);
      validationResults.push({
        errors: result.errors,
        warnings: result.warnings
      });
    }

    // Calculate overall statistics
    const statistics = this.calculateStatistics(annotations, validationResults);

    // Calculate overall score
    const score = this.calculateValidationScore(allErrors, allWarnings);

    // Generate batch recommendations
    const recommendations = this.generateBatchRecommendations(allErrors, allWarnings, statistics);

    return {
      valid: allErrors.length === 0,
      score,
      errors: allErrors,
      warnings: allWarnings,
      info: allInfo,
      statistics,
      recommendations
    };
  }

  private validateField(field: string, value: any, validation: FieldValidation, annotationId?: string): ValidationError[] {
    const errors: ValidationError[] = [];

    // Type validation
    if (!this.validateType(value, validation.type)) {
      errors.push({
        id: `type-${field}`,
        field,
        message: `Field '${field}' has invalid type`,
        value,
        expected: validation.type,
        severity: 'major',
        category: 'invalid',
        suggestedFix: `Convert ${field} to ${validation.type}`,
        annotationId
      });
      return errors; // Stop further validation if type is wrong
    }

    // Range validation
    if (validation.type === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        errors.push({
          id: `min-${field}`,
          field,
          message: `Field '${field}' is below minimum value`,
          value,
          expected: `>= ${validation.min}`,
          severity: 'major',
          category: 'range',
          suggestedFix: `Set ${field} to at least ${validation.min}`,
          annotationId
        });
      }
      if (validation.max !== undefined && value > validation.max) {
        errors.push({
          id: `max-${field}`,
          field,
          message: `Field '${field}' is above maximum value`,
          value,
          expected: `<= ${validation.max}`,
          severity: 'major',
          category: 'range',
          suggestedFix: `Set ${field} to at most ${validation.max}`,
          annotationId
        });
      }
    }

    // String validation
    if (validation.type === 'string') {
      if (validation.minLength !== undefined && value.length < validation.minLength) {
        errors.push({
          id: `minlength-${field}`,
          field,
          message: `Field '${field}' is too short`,
          value,
          expected: `>= ${validation.minLength} characters`,
          severity: 'major',
          category: 'format',
          suggestedFix: `Make ${field} at least ${validation.minLength} characters`,
          annotationId
        });
      }
      if (validation.maxLength !== undefined && value.length > validation.maxLength) {
        errors.push({
          id: `maxlength-${field}`,
          field,
          message: `Field '${field}' is too long`,
          value,
          expected: `<= ${validation.maxLength} characters`,
          severity: 'major',
          category: 'format',
          suggestedFix: `Make ${field} at most ${validation.maxLength} characters`,
          annotationId
        });
      }
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        errors.push({
          id: `pattern-${field}`,
          field,
          message: `Field '${field}' does not match required pattern`,
          value,
          expected: validation.pattern,
          severity: 'major',
          category: 'format',
          suggestedFix: `Update ${field} to match pattern: ${validation.pattern}`,
          annotationId
        });
      }
    }

    // Enum validation
    if (validation.enumValues && !validation.enumValues.includes(value)) {
      errors.push({
        id: `enum-${field}`,
        field,
        message: `Field '${field}' has invalid value`,
        value,
        expected: `One of: ${validation.enumValues.join(', ')}`,
        severity: 'major',
        category: 'invalid',
        suggestedFix: `Set ${field} to one of: ${validation.enumValues.join(', ')}`,
        annotationId
      });
    }

    // Coordinates validation
    if (validation.coordinates) {
      const coordErrors = this.validateCoordinates(field, value, validation.coordinates, annotationId);
      errors.push(...coordErrors);
    }

    return errors;
  }

  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'coordinates':
        return Array.isArray(value) && value.every(coord => typeof coord === 'number');
      default:
        return true;
    }
  }

  private validateCoordinates(field: string, coordinates: number[], validation: CoordinateValidation, annotationId?: string): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check coordinate count
    if (coordinates.length % validation.dimensions !== 0) {
      errors.push({
        id: `coord-count-${field}`,
        field,
        message: `Coordinates must be ${validation.dimensions}D`,
        value: coordinates,
        expected: `Multiple of ${validation.dimensions}`,
        severity: 'major',
        category: 'format',
        suggestedFix: `Ensure coordinates are ${validation.dimensions}D pairs`,
        annotationId
      });
    }

    // Check bounds
    if (validation.bounds) {
      for (let i = 0; i < coordinates.length; i += validation.dimensions) {
        const x = coordinates[i];
        const y = coordinates[i + 1];
        const z = validation.dimensions > 2 ? coordinates[i + 2] : undefined;

        if (validation.bounds.minX !== undefined && x < validation.bounds.minX) {
          errors.push({
            id: `coord-bounds-x-${field}-${i}`,
            field,
            message: `X coordinate is below minimum`,
            value: x,
            expected: `>= ${validation.bounds.minX}`,
            severity: 'major',
            category: 'range',
            annotationId
          });
        }
        if (validation.bounds.maxX !== undefined && x > validation.bounds.maxX) {
          errors.push({
            id: `coord-bounds-x-${field}-${i}`,
            field,
            message: `X coordinate is above maximum`,
            value: x,
            expected: `<= ${validation.bounds.maxX}`,
            severity: 'major',
            category: 'range',
            annotationId
          });
        }
        if (validation.bounds.minY !== undefined && y < validation.bounds.minY) {
          errors.push({
            id: `coord-bounds-y-${field}-${i}`,
            field,
            message: `Y coordinate is below minimum`,
            value: y,
            expected: `>= ${validation.bounds.minY}`,
            severity: 'major',
            category: 'range',
            annotationId
          });
        }
        if (validation.bounds.maxY !== undefined && y > validation.bounds.maxY) {
          errors.push({
            id: `coord-bounds-y-${field}-${i}`,
            field,
            message: `Y coordinate is above maximum`,
            value: y,
            expected: `<= ${validation.bounds.maxY}`,
            severity: 'major',
            category: 'range',
            annotationId
          });
        }
      }
    }

    return errors;
  }

  private evaluateCustomValidation(annotation: any, validation: CustomValidation): { valid: boolean; result?: any } {
    try {
      // Create a safe evaluation context
      const context = {
        annotation,
        Math,
        Array,
        Object,
        JSON
      };

      // Simple expression evaluation (in production, use a proper expression evaluator)
      const func = new Function('annotation', 'Math', 'Array', 'Object', 'JSON', 
        `return ${validation.condition}`);
      
      const result = func(annotation, Math, Array, Object, JSON);
      
      return {
        valid: Boolean(result),
        result
      };
    } catch (error) {
      throw new Error(`Custom validation evaluation failed: ${error.message}`);
    }
  }

  private generateQualityWarnings(annotation: any): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Check for low confidence
    if (annotation.confidence !== undefined && annotation.confidence < 0.5) {
      warnings.push({
        id: `low-confidence-${annotation.id}`,
        field: 'confidence',
        message: 'Low confidence annotation detected',
        value: annotation.confidence,
        recommendation: 'Review annotation accuracy',
        impact: 'medium',
        annotationId: annotation.id
      });
    }

    // Check for small annotations
    if (annotation.bbox && Array.isArray(annotation.bbox)) {
      const [x, y, width, height] = annotation.bbox;
      const area = width * height;
      if (area < 100) {
        warnings.push({
          id: `small-annotation-${annotation.id}`,
          field: 'bbox',
          message: 'Very small annotation detected',
          value: area,
          recommendation: 'Verify annotation is not noise',
          impact: 'low',
          annotationId: annotation.id
        });
      }
    }

    return warnings;
  }

  private generateOptimizationInfo(annotation: any): ValidationInfo[] {
    const info: ValidationInfo[] = [];

    // Suggest attribute additions
    if (!annotation.attributes || Object.keys(annotation.attributes).length === 0) {
      info.push({
        id: `add-attributes-${annotation.id}`,
        message: 'Consider adding attributes for richer annotations',
        category: 'best_practice',
        details: 'Attributes can improve model training and annotation quality'
      });
    }

    return info;
  }

  private calculateValidationScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
    let score = 100;

    // Deduct points for errors
    for (const error of errors) {
      switch (error.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'major':
          score -= 10;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    }

    // Deduct points for warnings
    for (const warning of warnings) {
      switch (warning.impact) {
        case 'high':
          score -= 5;
          break;
        case 'medium':
          score -= 3;
          break;
        case 'low':
          score -= 1;
          break;
      }
    }

    return Math.max(0, score);
  }

  private calculateStatistics(annotations: any[], validationResults: { errors: ValidationError[]; warnings: ValidationWarning[] }[]): ValidationStatistics {
    const totalAnnotations = annotations.length;
    const invalidAnnotations = validationResults.filter(r => r.errors.length > 0).length;
    const validAnnotations = totalAnnotations - invalidAnnotations;

    const fieldStats: Record<string, any> = {};
    const annotationTypeStats: Record<string, number> = {};

    // Calculate field statistics
    for (const field of [...this.schema.requiredFields, ...this.schema.optionalFields]) {
      const present = annotations.filter(a => a[field] !== undefined).length;
      const missing = totalAnnotations - present;
      const invalid = validationResults.reduce((count, r) => 
        count + r.errors.filter(e => e.field === field).length, 0);

      fieldStats[field] = {
        present,
        missing,
        invalid,
        validationRate: present > 0 ? ((present - invalid) / present) * 100 : 0
      };
    }

    // Calculate annotation type statistics
    for (const annotation of annotations) {
      const type = annotation.type || annotation.annotation_type || 'unknown';
      annotationTypeStats[type] = (annotationTypeStats[type] || 0) + 1;
    }

    // Calculate quality metrics
    const totalErrors = validationResults.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = validationResults.reduce((sum, r) => sum + r.warnings.length, 0);
    const scores = validationResults.map(r => this.calculateValidationScore(r.errors, r.warnings));
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return {
      totalAnnotations,
      validAnnotations,
      invalidAnnotations,
      errorCount: totalErrors,
      warningCount: totalWarnings,
      averageScore,
      fieldStats,
      annotationTypeStats,
      qualityMetrics: {
        completeness: (validAnnotations / totalAnnotations) * 100,
        accuracy: averageScore,
        consistency: this.calculateConsistency(annotations),
        coverage: this.calculateCoverage(annotations)
      }
    };
  }

  private calculateConsistency(annotations: any[]): number {
    // Calculate annotation consistency based on similar annotations
    // This is a simplified implementation
    return 85; // Placeholder
  }

  private calculateCoverage(annotations: any[]): number {
    // Calculate how well annotations cover the dataset
    // This is a simplified implementation
    return 90; // Placeholder
  }

  private generateRecommendations(errors: ValidationError[], warnings: ValidationWarning[], annotation: any): string[] {
    const recommendations: string[] = [];

    if (errors.length > 0) {
      recommendations.push(`Fix ${errors.length} validation errors`);
    }

    if (warnings.length > 0) {
      recommendations.push(`Review ${warnings.length} warnings`);
    }

    if (annotation.confidence !== undefined && annotation.confidence < 0.7) {
      recommendations.push('Consider manual review of low-confidence annotations');
    }

    return recommendations;
  }

  private generateBatchRecommendations(errors: ValidationError[], warnings: ValidationWarning[], statistics: ValidationStatistics): string[] {
    const recommendations: string[] = [];

    if (statistics.invalidAnnotations > 0) {
      recommendations.push(`Fix ${statistics.invalidAnnotations} invalid annotations`);
    }

    if (statistics.averageScore < 80) {
      recommendations.push('Overall annotation quality is below recommended threshold');
    }

    if (statistics.qualityMetrics.completeness < 95) {
      recommendations.push('Some annotations are missing required fields');
    }

    return recommendations;
  }
}

// Export utility functions
export function getAvailableSchemas(): string[] {
  return Object.keys(predefinedSchemas);
}

export function getSchemaInfo(schemaId: string): AnnotationSchema | null {
  return predefinedSchemas[schemaId] || null;
}

export function createSchemaFromFormat(format: string): AnnotationSchema | null {
  const schemaMap: Record<string, string> = {
    'coco': 'bbox-coco',
    'yolo': 'bbox-yolo',
    'pascal-voc': 'bbox-coco', // Similar to COCO
    'labelme': 'polygon-segmentation',
    'openpose': 'keypoints-pose'
  };

  const schemaId = schemaMap[format];
  return schemaId ? predefinedSchemas[schemaId] : null;
}

export function validateAnnotationBatch(annotations: any[], schemaId: string): ValidationResult {
  const validator = AnnotationValidator.createFromPredefined(schemaId);
  return validator.validateAnnotations(annotations);
}

export function validateAnnotationFormat(annotations: any[], format: string): ValidationResult {
  const schema = createSchemaFromFormat(format);
  if (!schema) {
    throw new Error(`No validation schema available for format: ${format}`);
  }
  
  const validator = new AnnotationValidator(schema);
  return validator.validateAnnotations(annotations);
} 