/**
 * DICOM Integration Library - MedSight Pro
 * Connects frontend to backend DICOMProcessor.ts for medical imaging workflows
 * 
 * Features:
 * - DICOM file processing and parsing
 * - Medical image metadata extraction
 * - Study and series management
 * - DICOM export and sharing
 * - Compliance validation
 * - Medical workflow integration
 */

import { DICOMProcessor } from '@/core/DICOMProcessor';
import { MedicalAuthService } from '@/lib/auth/medical-auth';
import { ComplianceAuditTrail } from '@/lib/compliance/audit-trail';

// DICOM Data Structures
export interface DICOMStudy {
  studyUID: string;
  studyID: string;
  studyDate: string;
  studyTime: string;
  studyDescription: string;
  patientID: string;
  patientName: string;
  patientBirthDate: string;
  patientSex: string;
  accessionNumber: string;
  modality: string;
  institutionName: string;
  seriesCount: number;
  imageCount: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  priority: 'routine' | 'urgent' | 'emergency';
  assignedPhysician: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DICOMSeries {
  seriesUID: string;
  seriesNumber: string;
  seriesDescription: string;
  modality: string;
  bodyPart: string;
  imageCount: number;
  sliceThickness: number;
  pixelSpacing: [number, number];
  imageOrientation: number[];
  imagePosition: number[];
  acquisitionDate: string;
  acquisitionTime: string;
  protocolName: string;
  operatorName: string;
  scanningSequence: string;
  sequenceVariant: string;
  scanOptions: string;
  images: DICOMImage[];
}

export interface DICOMImage {
  imageUID: string;
  instanceNumber: number;
  imageType: string;
  photometricInterpretation: string;
  rows: number;
  columns: number;
  bitsAllocated: number;
  bitsStored: number;
  highBit: number;
  pixelRepresentation: number;
  pixelData: ArrayBuffer;
  windowCenter: number;
  windowWidth: number;
  rescaleIntercept: number;
  rescaleSlope: number;
  annotations: DICOMAnnotation[];
  measurements: DICOMMeasurement[];
}

export interface DICOMAnnotation {
  id: string;
  type: 'arrow' | 'rectangle' | 'circle' | 'freehand' | 'text';
  coordinates: number[][];
  text?: string;
  color: string;
  createdBy: string;
  createdAt: Date;
  isVisible: boolean;
}

export interface DICOMMeasurement {
  id: string;
  type: 'linear' | 'area' | 'angle' | 'volume';
  coordinates: number[][];
  value: number;
  unit: string;
  label: string;
  createdBy: string;
  createdAt: Date;
  isVisible: boolean;
}

export interface DICOMMetadata {
  tags: Map<string, any>;
  transferSyntaxUID: string;
  sopClassUID: string;
  sopInstanceUID: string;
  mediaStorageSOPClassUID: string;
  mediaStorageSOPInstanceUID: string;
  implementationClassUID: string;
  implementationVersionName: string;
}

export interface DICOMProcessingOptions {
  parsePixelData: boolean;
  extractMetadata: boolean;
  validateCompliance: boolean;
  generateThumbnails: boolean;
  enableCaching: boolean;
  compressionLevel: number;
  qualityLevel: number;
  outputFormat: 'native' | 'jpeg' | 'png' | 'webp';
}

export interface DICOMValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  complianceLevel: 'full' | 'partial' | 'none';
  standardVersion: string;
  sopClassValidation: boolean;
  transferSyntaxValidation: boolean;
  metadataValidation: boolean;
  pixelDataValidation: boolean;
}

export interface DICOMExportOptions {
  format: 'dicom' | 'nifti' | 'jpeg' | 'png' | 'pdf';
  quality: number;
  includeMetadata: boolean;
  includeAnnotations: boolean;
  includeMeasurements: boolean;
  anonymize: boolean;
  compressionType: 'none' | 'lossless' | 'lossy';
  outputPath: string;
}

// DICOM Integration Class
export class DICOMIntegration {
  private processor: DICOMProcessor;
  private auth: MedicalAuthService;
  private auditTrail: ComplianceAuditTrail;
  private cache: Map<string, DICOMStudy> = new Map();
  private processingQueue: Set<string> = new Set();

  constructor() {
    this.processor = new DICOMProcessor();
    this.auth = MedicalAuthService.getInstance();
    this.auditTrail = new ComplianceAuditTrail();
  }

  // Study Management
  async uploadDICOMFiles(files: File[], options: DICOMProcessingOptions): Promise<DICOMStudy[]> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required for DICOM upload');
    }

    const studies: DICOMStudy[] = [];
    
    for (const file of files) {
      try {
        // Validate file format
        if (!this.isDICOMFile(file)) {
          throw new Error(`Invalid DICOM file: ${file.name}`);
        }

        // Process DICOM file
        const arrayBuffer = await file.arrayBuffer();
        const study = await this.processDICOMFile(arrayBuffer, options);
        
        // Log activity
        await this.auditTrail.logActivity({
          action: 'dicom_upload',
          resourceType: 'study',
          resourceId: study.studyUID,
          userId: user.id,
          details: {
            fileName: file.name,
            fileSize: file.size,
            studyDescription: study.studyDescription,
            modality: study.modality
          }
        });

        studies.push(study);
      } catch (error) {
        console.error(`Error processing DICOM file ${file.name}:`, error);
        throw error;
      }
    }

    return studies;
  }

  async getStudy(studyUID: string): Promise<DICOMStudy | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check cache first
    if (this.cache.has(studyUID)) {
      return this.cache.get(studyUID)!;
    }

    try {
      const study = await this.processor.getStudy(studyUID);
      if (study) {
        // Cache the study
        this.cache.set(studyUID, study);
        
        // Log access
        await this.auditTrail.logActivity({
          action: 'dicom_access',
          resourceType: 'study',
          resourceId: studyUID,
          userId: user.id,
          details: {
            studyDescription: study.studyDescription,
            accessType: 'view'
          }
        });
      }
      
      return study;
    } catch (error) {
      console.error('Error fetching DICOM study:', error);
      return null;
    }
  }

  async getStudyList(filters?: {
    patientID?: string;
    studyDate?: string;
    modality?: string;
    status?: string;
    assignedPhysician?: string;
  }): Promise<DICOMStudy[]> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const studies = await this.processor.getStudyList(filters);
      
      // Log query
      await this.auditTrail.logActivity({
        action: 'dicom_query',
        resourceType: 'study_list',
        resourceId: 'query',
        userId: user.id,
        details: {
          filters,
          resultCount: studies.length
        }
      });

      return studies;
    } catch (error) {
      console.error('Error fetching study list:', error);
      return [];
    }
  }

  async deleteStudy(studyUID: string): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check user permissions
    if (!await this.auth.hasPermission(user.id, 'dicom:delete')) {
      throw new Error('Insufficient permissions to delete studies');
    }

    try {
      const study = await this.getStudy(studyUID);
      if (!study) {
        throw new Error('Study not found');
      }

      const success = await this.processor.deleteStudy(studyUID);
      
      if (success) {
        // Remove from cache
        this.cache.delete(studyUID);
        
        // Log deletion
        await this.auditTrail.logActivity({
          action: 'dicom_delete',
          resourceType: 'study',
          resourceId: studyUID,
          userId: user.id,
          details: {
            studyDescription: study.studyDescription,
            patientID: study.patientID,
            reason: 'user_requested'
          }
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting study:', error);
      return false;
    }
  }

  // Series Management
  async getSeries(studyUID: string, seriesUID: string): Promise<DICOMSeries | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const series = await this.processor.getSeries(studyUID, seriesUID);
      
      if (series) {
        // Log access
        await this.auditTrail.logActivity({
          action: 'dicom_access',
          resourceType: 'series',
          resourceId: seriesUID,
          userId: user.id,
          details: {
            studyUID,
            seriesDescription: series.seriesDescription,
            modality: series.modality
          }
        });
      }
      
      return series;
    } catch (error) {
      console.error('Error fetching DICOM series:', error);
      return null;
    }
  }

  async getSeriesList(studyUID: string): Promise<DICOMSeries[]> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const seriesList = await this.processor.getSeriesList(studyUID);
      
      // Log access
      await this.auditTrail.logActivity({
        action: 'dicom_access',
        resourceType: 'series_list',
        resourceId: studyUID,
        userId: user.id,
        details: {
          studyUID,
          seriesCount: seriesList.length
        }
      });
      
      return seriesList;
    } catch (error) {
      console.error('Error fetching series list:', error);
      return [];
    }
  }

  // Image Management
  async getImage(studyUID: string, seriesUID: string, imageUID: string): Promise<DICOMImage | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const image = await this.processor.getImage(studyUID, seriesUID, imageUID);
      
      if (image) {
        // Log access
        await this.auditTrail.logActivity({
          action: 'dicom_access',
          resourceType: 'image',
          resourceId: imageUID,
          userId: user.id,
          details: {
            studyUID,
            seriesUID,
            instanceNumber: image.instanceNumber
          }
        });
      }
      
      return image;
    } catch (error) {
      console.error('Error fetching DICOM image:', error);
      return null;
    }
  }

  async getImageList(studyUID: string, seriesUID: string): Promise<DICOMImage[]> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const imageList = await this.processor.getImageList(studyUID, seriesUID);
      
      // Log access
      await this.auditTrail.logActivity({
        action: 'dicom_access',
        resourceType: 'image_list',
        resourceId: seriesUID,
        userId: user.id,
        details: {
          studyUID,
          seriesUID,
          imageCount: imageList.length
        }
      });
      
      return imageList;
    } catch (error) {
      console.error('Error fetching image list:', error);
      return [];
    }
  }

  // Metadata Management
  async getMetadata(studyUID: string, seriesUID: string, imageUID: string): Promise<DICOMMetadata | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const metadata = await this.processor.getMetadata(studyUID, seriesUID, imageUID);
      
      if (metadata) {
        // Log access
        await this.auditTrail.logActivity({
          action: 'dicom_metadata_access',
          resourceType: 'metadata',
          resourceId: imageUID,
          userId: user.id,
          details: {
            studyUID,
            seriesUID,
            sopClassUID: metadata.sopClassUID
          }
        });
      }
      
      return metadata;
    } catch (error) {
      console.error('Error fetching DICOM metadata:', error);
      return null;
    }
  }

  // Validation and Compliance
  async validateDICOM(studyUID: string, seriesUID?: string, imageUID?: string): Promise<DICOMValidationResult> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const validation = await this.processor.validateDICOM({ studyUID, seriesUID, imageUID });
      
      // Log validation
      await this.auditTrail.logActivity({
        action: 'dicom_validation',
        resourceType: imageUID ? 'image' : seriesUID ? 'series' : 'study',
        resourceId: imageUID || seriesUID || studyUID,
        userId: user.id,
        details: {
          studyUID,
          seriesUID,
          imageUID,
          isValid: validation.isValid,
          complianceLevel: validation.complianceLevel,
          errorCount: validation.errors.length
        }
      });
      
      return validation;
    } catch (error) {
      console.error('Error validating DICOM:', error);
      return {
        isValid: false,
        errors: ['Validation failed'],
        warnings: [],
        complianceLevel: 'none',
        standardVersion: 'unknown',
        sopClassValidation: false,
        transferSyntaxValidation: false,
        metadataValidation: false,
        pixelDataValidation: false
      };
    }
  }

  // Export and Sharing
  async exportStudy(studyUID: string, options: DICOMExportOptions): Promise<Blob> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check export permissions
    if (!await this.auth.hasPermission(user.id, 'dicom:export')) {
      throw new Error('Insufficient permissions to export studies');
    }

    try {
      const exportData = await this.processor.exportStudy(studyUID, options);
      
      // Log export
      await this.auditTrail.logActivity({
        action: 'dicom_export',
        resourceType: 'study',
        resourceId: studyUID,
        userId: user.id,
        details: {
          format: options.format,
          includeMetadata: options.includeMetadata,
          anonymize: options.anonymize,
          outputSize: exportData.size
        }
      });
      
      return exportData;
    } catch (error) {
      console.error('Error exporting study:', error);
      throw error;
    }
  }

  async shareStudy(studyUID: string, recipients: string[], permissions: string[]): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check sharing permissions
    if (!await this.auth.hasPermission(user.id, 'dicom:share')) {
      throw new Error('Insufficient permissions to share studies');
    }

    try {
      const success = await this.processor.shareStudy(studyUID, recipients, permissions);
      
      if (success) {
        // Log sharing
        await this.auditTrail.logActivity({
          action: 'dicom_share',
          resourceType: 'study',
          resourceId: studyUID,
          userId: user.id,
          details: {
            recipients,
            permissions,
            recipientCount: recipients.length
          }
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error sharing study:', error);
      return false;
    }
  }

  // Annotation Management
  async addAnnotation(studyUID: string, seriesUID: string, imageUID: string, annotation: Omit<DICOMAnnotation, 'id' | 'createdBy' | 'createdAt'>): Promise<DICOMAnnotation | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const newAnnotation: DICOMAnnotation = {
        ...annotation,
        id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdBy: user.id,
        createdAt: new Date()
      };

      const success = await this.processor.addAnnotation(studyUID, seriesUID, imageUID, newAnnotation);
      
      if (success) {
        // Log annotation creation
        await this.auditTrail.logActivity({
          action: 'dicom_annotation_create',
          resourceType: 'annotation',
          resourceId: newAnnotation.id,
          userId: user.id,
          details: {
            studyUID,
            seriesUID,
            imageUID,
            annotationType: annotation.type,
            hasText: !!annotation.text
          }
        });
        
        return newAnnotation;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding annotation:', error);
      return null;
    }
  }

  async updateAnnotation(studyUID: string, seriesUID: string, imageUID: string, annotationId: string, updates: Partial<DICOMAnnotation>): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.processor.updateAnnotation(studyUID, seriesUID, imageUID, annotationId, updates);
      
      if (success) {
        // Log annotation update
        await this.auditTrail.logActivity({
          action: 'dicom_annotation_update',
          resourceType: 'annotation',
          resourceId: annotationId,
          userId: user.id,
          details: {
            studyUID,
            seriesUID,
            imageUID,
            updatedFields: Object.keys(updates)
          }
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error updating annotation:', error);
      return false;
    }
  }

  async deleteAnnotation(studyUID: string, seriesUID: string, imageUID: string, annotationId: string): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.processor.deleteAnnotation(studyUID, seriesUID, imageUID, annotationId);
      
      if (success) {
        // Log annotation deletion
        await this.auditTrail.logActivity({
          action: 'dicom_annotation_delete',
          resourceType: 'annotation',
          resourceId: annotationId,
          userId: user.id,
          details: {
            studyUID,
            seriesUID,
            imageUID
          }
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting annotation:', error);
      return false;
    }
  }

  // Measurement Management
  async addMeasurement(studyUID: string, seriesUID: string, imageUID: string, measurement: Omit<DICOMMeasurement, 'id' | 'createdBy' | 'createdAt'>): Promise<DICOMMeasurement | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const newMeasurement: DICOMMeasurement = {
        ...measurement,
        id: `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdBy: user.id,
        createdAt: new Date()
      };

      const success = await this.processor.addMeasurement(studyUID, seriesUID, imageUID, newMeasurement);
      
      if (success) {
        // Log measurement creation
        await this.auditTrail.logActivity({
          action: 'dicom_measurement_create',
          resourceType: 'measurement',
          resourceId: newMeasurement.id,
          userId: user.id,
          details: {
            studyUID,
            seriesUID,
            imageUID,
            measurementType: measurement.type,
            value: measurement.value,
            unit: measurement.unit
          }
        });
        
        return newMeasurement;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding measurement:', error);
      return null;
    }
  }

  // Utility Methods
  private isDICOMFile(file: File): boolean {
    return file.type === 'application/dicom' || 
           file.name.toLowerCase().endsWith('.dcm') ||
           file.name.toLowerCase().endsWith('.dicom');
  }

  private async processDICOMFile(arrayBuffer: ArrayBuffer, options: DICOMProcessingOptions): Promise<DICOMStudy> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const study = await this.processor.processDICOMFile(arrayBuffer, options);
      
      // Cache the processed study
      this.cache.set(study.studyUID, study);
      
      return study;
    } catch (error) {
      console.error('Error processing DICOM file:', error);
      throw error;
    }
  }

  // Cache Management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  // Processing Status
  getProcessingStatus(): { total: number; active: number; completed: number } {
    return {
      total: this.processingQueue.size,
      active: this.processingQueue.size,
      completed: this.cache.size
    };
  }
}

// Export singleton instance
export const dicomIntegration = new DICOMIntegration();
export default dicomIntegration; 