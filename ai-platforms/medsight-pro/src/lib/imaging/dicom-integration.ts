/**
 * DICOM Integration Library
 * Connects frontend medical imaging components to backend DICOMProcessor.ts
 * Provides complete DICOM functionality, metadata handling, and medical workflow integration
 */

import { DICOMParser, DICOMImage as DICOMImageBase, MedicalMetadata, ImageInfo } from '@/medical/DICOMProcessor';
import { MedicalRenderer } from '@/medical/MedicalRenderer';
import { VolumeRenderer } from '@/medical/VolumeRenderer';

export interface DICOMImage extends DICOMImageBase {
  windowLevel: number;
  windowWidth: number;
  zoom: number;
  pan: { x: number; y: number };
  rotation: number;
  flip: { horizontal: boolean; vertical: boolean };
  invert: boolean;
  interpolation: 'nearest' | 'linear';
  loaded: boolean;
  loading: boolean;
}

export class DICOMIntegration {
  private processor: DICOMParser;

  constructor() {
    this.processor = new DICOMParser();
  }

  async processDICOMData(data: ArrayBuffer): Promise<DICOMImage> {
    try {
      const parsedImage = await this.processor.parseDICOM(data);
      
      const dicomImage: DICOMImage = {
        ...parsedImage,
        windowLevel: Array.isArray(parsedImage.imageInfo.windowCenter) 
          ? parsedImage.imageInfo.windowCenter[0] 
          : parsedImage.imageInfo.windowCenter || 40,
        windowWidth: Array.isArray(parsedImage.imageInfo.windowWidth)
          ? parsedImage.imageInfo.windowWidth[0]
          : parsedImage.imageInfo.windowWidth || 400,
        zoom: 1.0,
        pan: { x: 0, y: 0 },
        rotation: 0,
        flip: { horizontal: false, vertical: false },
        invert: false,
        interpolation: 'linear',
        loaded: true,
        loading: false
      };

      return dicomImage;
    } catch (error) {
      console.error('Failed to process DICOM data:', error);
      throw error;
    }
  }

  getMetadata(image: DICOMImage): MedicalMetadata {
    return image.metadata;
  }
  
  getImageInfo(image: DICOMImage): ImageInfo {
    return image.imageInfo;
  }
}

export const dicomIntegration = new DICOMIntegration();
export default dicomIntegration; 