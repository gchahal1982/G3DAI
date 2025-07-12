/**
 * DICOM Integration Library
 * Connects frontend medical imaging components to backend DICOMProcessor.ts
 * Provides complete DICOM functionality, metadata handling, and medical workflow integration
 */

import { DICOMProcessor } from '@/medical/DICOMProcessor';

// DICOM Data Types
export interface DICOMMetadata {
  // Patient Information
  patientName: string;
  patientID: string;
  patientBirthDate: string;
  patientSex: 'M' | 'F' | 'O';
  patientAge: string;
  patientWeight?: number;
  patientHeight?: number;
  
  // Study Information
  studyInstanceUID: string;
  studyDate: string;
  studyTime: string;
  studyDescription: string;
  accessionNumber: string;
  studyID: string;
  referringPhysicianName: string;
  institutionName: string;
  
  // Series Information
  seriesInstanceUID: string;
  seriesNumber: number;
  seriesDate: string;
  seriesTime: string;
  seriesDescription: string;
  modality: string;
  bodyPartExamined: string;
  protocolName: string;
  
  // Image Information
  sopInstanceUID: string;
  sopClassUID: string;
  instanceNumber: number;
  imageType: string[];
  acquisitionDate: string;
  acquisitionTime: string;
  
  // Image Characteristics
  rows: number;
  columns: number;
  bitsAllocated: number;
  bitsStored: number;
  highBit: number;
  pixelRepresentation: number;
  samplesPerPixel: number;
  photometricInterpretation: string;
  pixelSpacing: [number, number];
  sliceThickness: number;
  sliceLocation: number;
  imagePosition: [number, number, number];
  imageOrientation: [number, number, number, number, number, number];
  
  // Display Parameters
  windowCenter: number | number[];
  windowWidth: number | number[];
  rescaleIntercept: number;
  rescaleSlope: number;
  rescaleType?: string;
  
  // Equipment Information
  manufacturer: string;
  manufacturerModelName: string;
  softwareVersions: string;
  stationName: string;
  
  // Acquisition Parameters
  kvp?: number;
  exposureTime?: number;
  xRayTubeCurrent?: number;
  exposureInMicroAmpereSeconds?: number;
  filterType?: string;
  generatorPower?: number;
  distanceSourceToDetector?: number;
  distanceSourceToPatient?: number;
  
  // Contrast Information
  contrastBolusAgent?: string;
  contrastBolusRoute?: string;
  contrastBolusVolume?: number;
  contrastBolusStartTime?: string;
  contrastBolusTotalDose?: number;
  contrastFlowRate?: number;
  contrastFlowDuration?: number;
  contrastBolusIngredient?: string;
  contrastBolusIngredientConcentration?: number;
}

export interface DICOMImage {
  metadata: DICOMMetadata;
  pixelData: ArrayBuffer | Uint8Array | Uint16Array | Int16Array;
  rendered?: HTMLCanvasElement | ImageData;
  windowLevel: number;
  windowWidth: number;
  zoom: number;
  pan: { x: number; y: number };
  rotation: number;
  flip: { horizontal: boolean; vertical: boolean };
  invert: boolean;
  interpolation: 'nearest' | 'linear' | 'cubic';
  loaded: boolean;
  loading: boolean;
  error?: string;
}

export interface DICOMSeries {
  seriesInstanceUID: string;
  studyInstanceUID: string;
  seriesNumber: number;
  seriesDescription: string;
  modality: string;
  bodyPartExamined: string;
  protocolName: string;
  images: DICOMImage[];
  thumbnails: { [key: string]: HTMLCanvasElement };
  loadProgress: number;
  totalImages: number;
  loadedImages: number;
  isLoading: boolean;
  isLoaded: boolean;
  error?: string;
  metadata: Partial<DICOMMetadata>;
}

export interface DICOMStudy {
  studyInstanceUID: string;
  patientName: string;
  patientID: string;
  studyDate: string;
  studyTime: string;
  studyDescription: string;
  accessionNumber: string;
  modalities: string[];
  series: DICOMSeries[];
  totalSeries: number;
  totalImages: number;
  loadProgress: number;
  isLoading: boolean;
  isLoaded: boolean;
  error?: string;
  metadata: Partial<DICOMMetadata>;
}

export interface DICOMProcessingOptions {
  enablePixelDataPreprocessing: boolean;
  enableAutomaticWindowing: boolean;
  enableImageEnhancement: boolean;
  enableErrorCorrection: boolean;
  cacheSize: number;
  preloadAdjacentSlices: boolean;
  generateThumbnails: boolean;
  thumbnailSize: { width: number; height: number };
  compressionLevel: number;
  multiFrameHandling: 'individual' | 'sequence';
  pixelDataTransform: 'none' | 'normalize' | 'enhance';
  memoryOptimization: boolean;
  parallelProcessing: boolean;
  maxConcurrentOperations: number;
}

export interface DICOMWorklistItem {
  accessionNumber: string;
  patientName: string;
  patientID: string;
  studyDate: string;
  studyTime: string;
  modality: string;
  scheduledStationAETitle: string;
  scheduledProcedureStepDescription: string;
  requestedProcedureDescription: string;
  scheduledPerformingPhysicianName: string;
  scheduledProcedureStepStartDate: string;
  scheduledProcedureStepStartTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// DICOM Integration Class
export class DICOMIntegration {
  private processor: DICOMProcessor;
  private options: DICOMProcessingOptions;
  private cache: Map<string, DICOMImage> = new Map();
  private worklist: DICOMWorklistItem[] = [];
  private activeConnections: Map<string, WebSocket> = new Map();
  
  constructor(options: Partial<DICOMProcessingOptions> = {}) {
    this.processor = new DICOMProcessor();
    this.options = {
      enablePixelDataPreprocessing: true,
      enableAutomaticWindowing: true,
      enableImageEnhancement: false,
      enableErrorCorrection: true,
      cacheSize: 1000,
      preloadAdjacentSlices: true,
      generateThumbnails: true,
      thumbnailSize: { width: 128, height: 128 },
      compressionLevel: 50,
      multiFrameHandling: 'individual',
      pixelDataTransform: 'normalize',
      memoryOptimization: true,
      parallelProcessing: true,
      maxConcurrentOperations: 4,
      ...options
    };
  }

  // DICOM File Loading and Processing
  async loadDICOMFile(file: File): Promise<DICOMImage> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      return this.processDICOMData(arrayBuffer, file.name);
    } catch (error) {
      throw new Error(`Failed to load DICOM file: ${error.message}`);
    }
  }

  async loadDICOMFromURL(url: string): Promise<DICOMImage> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return this.processDICOMData(arrayBuffer, url);
    } catch (error) {
      throw new Error(`Failed to load DICOM from URL: ${error.message}`);
    }
  }

  async processDICOMData(data: ArrayBuffer, identifier: string): Promise<DICOMImage> {
    try {
      // Use backend DICOMProcessor for parsing
      const parseResult = await this.processor.parseDICOM(data);
      
      if (!parseResult.success) {
        throw new Error(parseResult.error || 'Failed to parse DICOM data');
      }

      const { metadata, pixelData } = parseResult.data;

      // Create DICOM image object
      const dicomImage: DICOMImage = {
        metadata: this.mapMetadata(metadata),
        pixelData,
        windowLevel: Array.isArray(metadata.windowCenter) 
          ? metadata.windowCenter[0] 
          : metadata.windowCenter || 40,
        windowWidth: Array.isArray(metadata.windowWidth) 
          ? metadata.windowWidth[0] 
          : metadata.windowWidth || 400,
        zoom: 1.0,
        pan: { x: 0, y: 0 },
        rotation: 0,
        flip: { horizontal: false, vertical: false },
        invert: false,
        interpolation: 'linear',
        loaded: true,
        loading: false
      };

      // Apply preprocessing if enabled
      if (this.options.enablePixelDataPreprocessing) {
        await this.preprocessPixelData(dicomImage);
      }

      // Apply automatic windowing if enabled
      if (this.options.enableAutomaticWindowing) {
        this.applyAutomaticWindowing(dicomImage);
      }

      // Cache the image
      if (dicomImage.metadata.sopInstanceUID) {
        this.cache.set(dicomImage.metadata.sopInstanceUID, dicomImage);
      }

      return dicomImage;
    } catch (error) {
      throw new Error(`DICOM processing failed: ${error.message}`);
    }
  }

  private mapMetadata(rawMetadata: any): DICOMMetadata {
    return {
      // Patient Information
      patientName: rawMetadata.patientName || 'Unknown',
      patientID: rawMetadata.patientID || '',
      patientBirthDate: rawMetadata.patientBirthDate || '',
      patientSex: rawMetadata.patientSex || 'O',
      patientAge: rawMetadata.patientAge || '',
      patientWeight: rawMetadata.patientWeight,
      patientHeight: rawMetadata.patientHeight,
      
      // Study Information
      studyInstanceUID: rawMetadata.studyInstanceUID || '',
      studyDate: rawMetadata.studyDate || '',
      studyTime: rawMetadata.studyTime || '',
      studyDescription: rawMetadata.studyDescription || '',
      accessionNumber: rawMetadata.accessionNumber || '',
      studyID: rawMetadata.studyID || '',
      referringPhysicianName: rawMetadata.referringPhysicianName || '',
      institutionName: rawMetadata.institutionName || '',
      
      // Series Information
      seriesInstanceUID: rawMetadata.seriesInstanceUID || '',
      seriesNumber: rawMetadata.seriesNumber || 0,
      seriesDate: rawMetadata.seriesDate || '',
      seriesTime: rawMetadata.seriesTime || '',
      seriesDescription: rawMetadata.seriesDescription || '',
      modality: rawMetadata.modality || 'CT',
      bodyPartExamined: rawMetadata.bodyPartExamined || '',
      protocolName: rawMetadata.protocolName || '',
      
      // Image Information
      sopInstanceUID: rawMetadata.sopInstanceUID || '',
      sopClassUID: rawMetadata.sopClassUID || '',
      instanceNumber: rawMetadata.instanceNumber || 0,
      imageType: rawMetadata.imageType || [],
      acquisitionDate: rawMetadata.acquisitionDate || '',
      acquisitionTime: rawMetadata.acquisitionTime || '',
      
      // Image Characteristics
      rows: rawMetadata.rows || 512,
      columns: rawMetadata.columns || 512,
      bitsAllocated: rawMetadata.bitsAllocated || 16,
      bitsStored: rawMetadata.bitsStored || 16,
      highBit: rawMetadata.highBit || 15,
      pixelRepresentation: rawMetadata.pixelRepresentation || 1,
      samplesPerPixel: rawMetadata.samplesPerPixel || 1,
      photometricInterpretation: rawMetadata.photometricInterpretation || 'MONOCHROME2',
      pixelSpacing: rawMetadata.pixelSpacing || [1.0, 1.0],
      sliceThickness: rawMetadata.sliceThickness || 1.0,
      sliceLocation: rawMetadata.sliceLocation || 0,
      imagePosition: rawMetadata.imagePosition || [0, 0, 0],
      imageOrientation: rawMetadata.imageOrientation || [1, 0, 0, 0, 1, 0],
      
      // Display Parameters
      windowCenter: rawMetadata.windowCenter || 40,
      windowWidth: rawMetadata.windowWidth || 400,
      rescaleIntercept: rawMetadata.rescaleIntercept || 0,
      rescaleSlope: rawMetadata.rescaleSlope || 1,
      rescaleType: rawMetadata.rescaleType,
      
      // Equipment Information
      manufacturer: rawMetadata.manufacturer || '',
      manufacturerModelName: rawMetadata.manufacturerModelName || '',
      softwareVersions: rawMetadata.softwareVersions || '',
      stationName: rawMetadata.stationName || '',
      
      // Acquisition Parameters
      kvp: rawMetadata.kvp,
      exposureTime: rawMetadata.exposureTime,
      xRayTubeCurrent: rawMetadata.xRayTubeCurrent,
      exposureInMicroAmpereSeconds: rawMetadata.exposureInMicroAmpereSeconds,
      filterType: rawMetadata.filterType,
      generatorPower: rawMetadata.generatorPower,
      distanceSourceToDetector: rawMetadata.distanceSourceToDetector,
      distanceSourceToPatient: rawMetadata.distanceSourceToPatient,
      
      // Contrast Information
      contrastBolusAgent: rawMetadata.contrastBolusAgent,
      contrastBolusRoute: rawMetadata.contrastBolusRoute,
      contrastBolusVolume: rawMetadata.contrastBolusVolume,
      contrastBolusStartTime: rawMetadata.contrastBolusStartTime,
      contrastBolusTotalDose: rawMetadata.contrastBolusTotalDose,
      contrastFlowRate: rawMetadata.contrastFlowRate,
      contrastFlowDuration: rawMetadata.contrastFlowDuration,
      contrastBolusIngredient: rawMetadata.contrastBolusIngredient,
      contrastBolusIngredientConcentration: rawMetadata.contrastBolusIngredientConcentration
    };
  }

  // Image Processing Methods
  private async preprocessPixelData(dicomImage: DICOMImage): Promise<void> {
    try {
      const processResult = await this.processor.processPixelData(
        dicomImage.pixelData,
        dicomImage.metadata,
        {
          rescaleSlope: dicomImage.metadata.rescaleSlope,
          rescaleIntercept: dicomImage.metadata.rescaleIntercept,
          windowCenter: dicomImage.windowLevel,
          windowWidth: dicomImage.windowWidth,
          photometricInterpretation: dicomImage.metadata.photometricInterpretation
        }
      );

      if (processResult.success) {
        dicomImage.pixelData = processResult.data.processedPixelData;
      }
    } catch (error) {
      console.warn('Pixel data preprocessing failed:', error);
    }
  }

  private applyAutomaticWindowing(dicomImage: DICOMImage): void {
    // Calculate optimal window/level based on pixel data statistics
    const pixelArray = new Uint16Array(dicomImage.pixelData);
    const min = Math.min(...pixelArray);
    const max = Math.max(...pixelArray);
    const mean = pixelArray.reduce((sum, val) => sum + val, 0) / pixelArray.length;
    
    // Apply modality-specific windowing
    switch (dicomImage.metadata.modality) {
      case 'CT':
        this.applyCTWindowing(dicomImage, mean, min, max);
        break;
      case 'MR':
        this.applyMRWindowing(dicomImage, mean, min, max);
        break;
      case 'CR':
      case 'DX':
        this.applyXRayWindowing(dicomImage, mean, min, max);
        break;
      default:
        // Generic windowing
        dicomImage.windowLevel = mean;
        dicomImage.windowWidth = (max - min) * 0.8;
    }
  }

  private applyCTWindowing(image: DICOMImage, mean: number, min: number, max: number): void {
    const bodyPart = image.metadata.bodyPartExamined.toLowerCase();
    
    if (bodyPart.includes('head') || bodyPart.includes('brain')) {
      // Brain window
      image.windowLevel = 40;
      image.windowWidth = 80;
    } else if (bodyPart.includes('chest') || bodyPart.includes('lung')) {
      // Lung window
      image.windowLevel = -600;
      image.windowWidth = 1600;
    } else if (bodyPart.includes('abdomen') || bodyPart.includes('pelvis')) {
      // Soft tissue window
      image.windowLevel = 40;
      image.windowWidth = 400;
    } else if (bodyPart.includes('bone') || bodyPart.includes('spine')) {
      // Bone window
      image.windowLevel = 400;
      image.windowWidth = 1000;
    } else {
      // Default soft tissue
      image.windowLevel = mean;
      image.windowWidth = (max - min) * 0.6;
    }
  }

  private applyMRWindowing(image: DICOMImage, mean: number, min: number, max: number): void {
    // MR images typically use full dynamic range
    image.windowLevel = mean;
    image.windowWidth = (max - min) * 0.9;
  }

  private applyXRayWindowing(image: DICOMImage, mean: number, min: number, max: number): void {
    // X-ray images often need contrast enhancement
    image.windowLevel = mean * 1.2;
    image.windowWidth = (max - min) * 0.7;
  }

  // Series and Study Management
  async loadDICOMSeries(files: File[]): Promise<DICOMSeries> {
    const images: DICOMImage[] = [];
    let seriesMetadata: Partial<DICOMMetadata> = {};
    
    for (const file of files) {
      try {
        const image = await this.loadDICOMFile(file);
        images.push(image);
        
        // Use first image metadata for series info
        if (images.length === 1) {
          seriesMetadata = image.metadata;
        }
      } catch (error) {
        console.error(`Failed to load DICOM file ${file.name}:`, error);
      }
    }

    // Sort images by instance number
    images.sort((a, b) => a.metadata.instanceNumber - b.metadata.instanceNumber);

    const series: DICOMSeries = {
      seriesInstanceUID: seriesMetadata.seriesInstanceUID || '',
      studyInstanceUID: seriesMetadata.studyInstanceUID || '',
      seriesNumber: seriesMetadata.seriesNumber || 0,
      seriesDescription: seriesMetadata.seriesDescription || '',
      modality: seriesMetadata.modality || 'CT',
      bodyPartExamined: seriesMetadata.bodyPartExamined || '',
      protocolName: seriesMetadata.protocolName || '',
      images,
      thumbnails: {},
      loadProgress: 100,
      totalImages: images.length,
      loadedImages: images.length,
      isLoading: false,
      isLoaded: true,
      metadata: seriesMetadata
    };

    // Generate thumbnails if enabled
    if (this.options.generateThumbnails) {
      await this.generateSeriesThumbnails(series);
    }

    return series;
  }

  async loadDICOMStudy(seriesGroups: File[][]): Promise<DICOMStudy> {
    const series: DICOMSeries[] = [];
    let studyMetadata: Partial<DICOMMetadata> = {};
    
    for (const seriesFiles of seriesGroups) {
      try {
        const seriesData = await this.loadDICOMSeries(seriesFiles);
        series.push(seriesData);
        
        // Use first series metadata for study info
        if (series.length === 1) {
          studyMetadata = seriesData.metadata;
        }
      } catch (error) {
        console.error('Failed to load DICOM series:', error);
      }
    }

    const study: DICOMStudy = {
      studyInstanceUID: studyMetadata.studyInstanceUID || '',
      patientName: studyMetadata.patientName || 'Unknown',
      patientID: studyMetadata.patientID || '',
      studyDate: studyMetadata.studyDate || '',
      studyTime: studyMetadata.studyTime || '',
      studyDescription: studyMetadata.studyDescription || '',
      accessionNumber: studyMetadata.accessionNumber || '',
      modalities: Array.from(new Set(series.map(s => s.modality))),
      series,
      totalSeries: series.length,
      totalImages: series.reduce((sum, s) => sum + s.totalImages, 0),
      loadProgress: 100,
      isLoading: false,
      isLoaded: true,
      metadata: studyMetadata
    };

    return study;
  }

  private async generateSeriesThumbnails(series: DICOMSeries): Promise<void> {
    for (const image of series.images) {
      try {
        const thumbnail = await this.generateThumbnail(image);
        series.thumbnails[image.metadata.sopInstanceUID] = thumbnail;
      } catch (error) {
        console.warn(`Failed to generate thumbnail for image ${image.metadata.instanceNumber}:`, error);
      }
    }
  }

  private async generateThumbnail(image: DICOMImage): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    canvas.width = this.options.thumbnailSize.width;
    canvas.height = this.options.thumbnailSize.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Render a scaled-down version of the image
    const imageData = await this.renderDICOMImage(image, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    
    return canvas;
  }

  // Image Rendering
  async renderDICOMImage(
    image: DICOMImage, 
    width?: number, 
    height?: number,
    options?: {
      windowLevel?: number;
      windowWidth?: number;
      invert?: boolean;
      interpolation?: 'nearest' | 'linear' | 'cubic';
    }
  ): Promise<ImageData> {
    const renderWidth = width || image.metadata.columns;
    const renderHeight = height || image.metadata.rows;
    const renderOptions = {
      windowLevel: image.windowLevel,
      windowWidth: image.windowWidth,
      invert: image.invert,
      interpolation: image.interpolation,
      ...options
    };

    try {
      const renderResult = await this.processor.renderToCanvas(
        image.pixelData,
        image.metadata,
        renderWidth,
        renderHeight,
        renderOptions
      );

      if (!renderResult.success) {
        throw new Error(renderResult.error || 'Rendering failed');
      }

      return renderResult.data.imageData;
    } catch (error) {
      throw new Error(`Image rendering failed: ${error.message}`);
    }
  }

  // DICOM Worklist Management
  async fetchWorklist(filters?: {
    patientName?: string;
    patientID?: string;
    accessionNumber?: string;
    modality?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<DICOMWorklistItem[]> {
    try {
      const worklistResult = await this.processor.queryWorklist(filters || {});
      
      if (!worklistResult.success) {
        throw new Error(worklistResult.error || 'Worklist query failed');
      }

      this.worklist = worklistResult.data.items;
      return this.worklist;
    } catch (error) {
      throw new Error(`Worklist fetch failed: ${error.message}`);
    }
  }

  async updateWorklistStatus(
    accessionNumber: string, 
    status: DICOMWorklistItem['status']
  ): Promise<void> {
    try {
      const updateResult = await this.processor.updateWorklistItem(accessionNumber, { status });
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Worklist update failed');
      }

      // Update local worklist
      const item = this.worklist.find(w => w.accessionNumber === accessionNumber);
      if (item) {
        item.status = status;
      }
    } catch (error) {
      throw new Error(`Worklist update failed: ${error.message}`);
    }
  }

  // DICOM Network Operations
  async queryDICOMNode(
    nodeConfig: {
      aeTitle: string;
      hostname: string;
      port: number;
    },
    queryParams: {
      patientName?: string;
      patientID?: string;
      studyDate?: string;
      modality?: string;
      accessionNumber?: string;
    }
  ): Promise<DICOMStudy[]> {
    try {
      const queryResult = await this.processor.queryRemoteNode(nodeConfig, queryParams);
      
      if (!queryResult.success) {
        throw new Error(queryResult.error || 'Remote query failed');
      }

      return queryResult.data.studies;
    } catch (error) {
      throw new Error(`DICOM query failed: ${error.message}`);
    }
  }

  async retrieveDICOMStudy(
    nodeConfig: {
      aeTitle: string;
      hostname: string;
      port: number;
    },
    studyInstanceUID: string,
    progressCallback?: (progress: number) => void
  ): Promise<DICOMStudy> {
    try {
      const retrieveResult = await this.processor.retrieveStudy(
        nodeConfig,
        studyInstanceUID,
        progressCallback
      );
      
      if (!retrieveResult.success) {
        throw new Error(retrieveResult.error || 'Study retrieval failed');
      }

      return retrieveResult.data.study;
    } catch (error) {
      throw new Error(`DICOM retrieval failed: ${error.message}`);
    }
  }

  // DICOM Storage and Export
  async storeDICOMImage(image: DICOMImage, storageConfig: {
    aeTitle: string;
    hostname: string;
    port: number;
  }): Promise<void> {
    try {
      const storeResult = await this.processor.storeImage(image, storageConfig);
      
      if (!storeResult.success) {
        throw new Error(storeResult.error || 'Storage failed');
      }
    } catch (error) {
      throw new Error(`DICOM storage failed: ${error.message}`);
    }
  }

  async exportDICOMSeries(
    series: DICOMSeries,
    format: 'dicom' | 'nifti' | 'analyze',
    exportPath: string
  ): Promise<void> {
    try {
      const exportResult = await this.processor.exportSeries(series, format, exportPath);
      
      if (!exportResult.success) {
        throw new Error(exportResult.error || 'Export failed');
      }
    } catch (error) {
      throw new Error(`DICOM export failed: ${error.message}`);
    }
  }

  // Cache Management
  getCachedImage(sopInstanceUID: string): DICOMImage | undefined {
    return this.cache.get(sopInstanceUID);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  getCacheMemoryUsage(): number {
    let totalSize = 0;
    for (const image of this.cache.values()) {
      totalSize += image.pixelData.byteLength;
    }
    return totalSize;
  }

  // Utility Methods
  validateDICOMFile(file: File): Promise<boolean> {
    return this.processor.validateDICOMFile(file);
  }

  getDICOMTags(image: DICOMImage): { [tag: string]: any } {
    return this.processor.getAllTags(image.metadata);
  }

  getImageStatistics(image: DICOMImage): {
    min: number;
    max: number;
    mean: number;
    stdDev: number;
    histogram: number[];
  } {
    return this.processor.getImageStatistics(image.pixelData, image.metadata);
  }

  // Cleanup
  dispose(): void {
    this.clearCache();
    this.activeConnections.forEach(connection => connection.close());
    this.activeConnections.clear();
    this.processor.dispose();
  }
}

// Factory function for creating DICOM integration instance
export function createDICOMIntegration(options?: Partial<DICOMProcessingOptions>): DICOMIntegration {
  return new DICOMIntegration(options);
}

// Utility functions for DICOM data manipulation
export function formatDICOMDate(dicomDate: string): string {
  if (!dicomDate || dicomDate.length !== 8) return 'Unknown';
  
  const year = dicomDate.substring(0, 4);
  const month = dicomDate.substring(4, 6);
  const day = dicomDate.substring(6, 8);
  
  return `${month}/${day}/${year}`;
}

export function formatDICOMTime(dicomTime: string): string {
  if (!dicomTime) return 'Unknown';
  
  const time = dicomTime.split('.')[0]; // Remove fractional seconds
  if (time.length >= 6) {
    const hours = time.substring(0, 2);
    const minutes = time.substring(2, 4);
    const seconds = time.substring(4, 6);
    return `${hours}:${minutes}:${seconds}`;
  }
  
  return time;
}

export function formatPatientAge(age: string): string {
  if (!age) return 'Unknown';
  
  const ageMatch = age.match(/(\d+)([YMD])/);
  if (ageMatch) {
    const value = ageMatch[1];
    const unit = ageMatch[2];
    
    switch (unit) {
      case 'Y': return `${value} years`;
      case 'M': return `${value} months`;
      case 'D': return `${value} days`;
      default: return age;
    }
  }
  
  return age;
}

export function getModalityDisplayName(modality: string): string {
  const modalityNames: { [key: string]: string } = {
    'CT': 'Computed Tomography',
    'MR': 'Magnetic Resonance',
    'CR': 'Computed Radiography',
    'DX': 'Digital Radiography',
    'US': 'Ultrasound',
    'NM': 'Nuclear Medicine',
    'PT': 'Positron Emission Tomography',
    'XA': 'X-Ray Angiography',
    'RF': 'Radio Fluoroscopy',
    'MG': 'Mammography',
    'OT': 'Other',
    'SC': 'Secondary Capture'
  };
  
  return modalityNames[modality] || modality;
}

export function calculateImageDisplaySize(
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
  maintainAspectRatio: boolean = true
): { width: number; height: number; scale: number } {
  if (!maintainAspectRatio) {
    return {
      width: containerWidth,
      height: containerHeight,
      scale: Math.min(containerWidth / imageWidth, containerHeight / imageHeight)
    };
  }
  
  const scaleX = containerWidth / imageWidth;
  const scaleY = containerHeight / imageHeight;
  const scale = Math.min(scaleX, scaleY);
  
  return {
    width: imageWidth * scale,
    height: imageHeight * scale,
    scale
  };
}

// Export types and constants
export type {
  DICOMMetadata,
  DICOMImage,
  DICOMSeries,
  DICOMStudy,
  DICOMProcessingOptions,
  DICOMWorklistItem
};

export const DICOM_MODALITIES = [
  'CT', 'MR', 'CR', 'DX', 'US', 'NM', 'PT', 'XA', 'RF', 'MG', 'OT', 'SC'
] as const;

export const DICOM_TRANSFER_SYNTAXES = {
  IMPLICIT_VR_LITTLE_ENDIAN: '1.2.840.10008.1.2',
  EXPLICIT_VR_LITTLE_ENDIAN: '1.2.840.10008.1.2.1',
  EXPLICIT_VR_BIG_ENDIAN: '1.2.840.10008.1.2.2',
  JPEG_BASELINE: '1.2.840.10008.1.2.4.50',
  JPEG_LOSSLESS: '1.2.840.10008.1.2.4.70',
  JPEG_2000_LOSSLESS: '1.2.840.10008.1.2.4.90',
  JPEG_2000_LOSSY: '1.2.840.10008.1.2.4.91'
} as const; 