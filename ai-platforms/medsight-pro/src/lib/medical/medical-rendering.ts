/**
 * Medical Renderer Integration Library - MedSight Pro
 * Connects frontend to backend MedicalRenderer.ts for specialized medical visualization
 * 
 * Features:
 * - Medical-specific rendering pipeline
 * - Anatomy visualization and segmentation
 * - Medical material rendering
 * - Clinical measurement overlay
 * - Medical annotation rendering
 * - Performance optimization for medical workflows
 */

import { MedicalRenderer } from '@/core/MedicalRenderer';
import { MedicalAuthService } from '@/lib/auth/medical-auth';
import MedicalAuth from '@/lib/auth/medical-auth';
import { ComplianceAuditTrail } from '@/lib/compliance/audit-trail';

// Medical Rendering Data Structures
export interface MedicalScene {
  id: string;
  studyUID: string;
  seriesUIDs: string[];
  name: string;
  description: string;
  modality: string;
  bodyPart: string;
  anatomicalRegions: AnatomicalRegion[];
  measurements: MedicalMeasurement[];
  annotations: MedicalAnnotation[];
  viewpoints: Viewpoint[];
  lighting: LightingSetup;
  materials: MedicalMaterial[];
  renderSettings: MedicalRenderSettings;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnatomicalRegion {
  id: string;
  name: string;
  type: 'organ' | 'tissue' | 'bone' | 'vessel' | 'tumor' | 'lesion' | 'implant';
  segmentation?: SegmentationData;
  material: MedicalMaterial;
  visibility: boolean;
  opacity: number;
  color: [number, number, number, number];
  priority: number;
  isPathological: boolean;
  annotations: string[];
  measurements: string[];
}

export interface SegmentationData {
  id: string;
  algorithm: 'manual' | 'threshold' | 'region_growing' | 'ai_segmentation';
  confidence: number;
  maskData: ArrayBuffer;
  dimensions: [number, number, number];
  voxelSpacing: [number, number, number];
  origin: [number, number, number];
  createdBy: string;
  reviewedBy?: string;
  validated: boolean;
  createdAt: Date;
}

export interface MedicalMeasurement {
  id: string;
  type: 'linear' | 'area' | 'volume' | 'angle' | 'curve' | 'ratio';
  name: string;
  description: string;
  value: number;
  unit: string;
  precision: number;
  coordinates: number[][];
  normal?: [number, number, number];
  plane?: MeasurementPlane;
  accuracy: number;
  confidence: number;
  method: 'manual' | 'semi_automatic' | 'automatic';
  template?: string;
  reference?: string;
  createdBy: string;
  reviewedBy?: string;
  validated: boolean;
  visible: boolean;
  color: [number, number, number, number];
  createdAt: Date;
}

export interface MeasurementPlane {
  normal: [number, number, number];
  point: [number, number, number];
  width: number;
  height: number;
}

export interface MedicalAnnotation {
  id: string;
  type: 'text' | 'arrow' | 'callout' | 'measurement' | 'finding' | 'diagnosis';
  content: string;
  position: [number, number, number];
  direction?: [number, number, number];
  size: number;
  color: [number, number, number, number];
  font: string;
  fontSize: number;
  category: 'normal' | 'abnormal' | 'critical' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'critical';
  visibility: boolean;
  isPersistent: boolean;
  linkedTo?: string; // ID of related anatomical region or measurement
  createdBy: string;
  reviewedBy?: string;
  validated: boolean;
  createdAt: Date;
}

export interface Viewpoint {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
  fov: number;
  viewType: 'anatomical' | 'pathological' | 'surgical' | 'diagnostic';
  isDefault: boolean;
  thumbnail?: string;
}

export interface LightingSetup {
  ambient: {
    color: [number, number, number];
    intensity: number;
  };
  directional: {
    color: [number, number, number];
    intensity: number;
    direction: [number, number, number];
    castShadows: boolean;
  };
  point: {
    color: [number, number, number];
    intensity: number;
    position: [number, number, number];
    attenuation: number;
  };
  medical: {
    headlight: boolean;
    shadowQuality: 'low' | 'medium' | 'high';
    softShadows: boolean;
    medicalLighting: boolean;
  };
}

export interface MedicalMaterial {
  id: string;
  name: string;
  type: 'tissue' | 'bone' | 'fluid' | 'air' | 'metal' | 'contrast' | 'pathology';
  diffuseColor: [number, number, number];
  specularColor: [number, number, number];
  shininess: number;
  opacity: number;
  roughness: number;
  metallic: number;
  subsurface: number;
  transmission: number;
  emissive: [number, number, number];
  texture?: string;
  normalMap?: string;
  properties: {
    density?: number;
    elasticity?: number;
    viscosity?: number;
    conductivity?: number;
  };
  medicalProperties: {
    hounsfield?: number;
    t1Signal?: number;
    t2Signal?: number;
    adcValue?: number;
  };
}

export interface MedicalRenderSettings {
  quality: 'preview' | 'standard' | 'high' | 'diagnostic';
  antialiasing: boolean;
  shadowMapping: boolean;
  ambientOcclusion: boolean;
  depthOfField: boolean;
  bloom: boolean;
  toneMapping: boolean;
  colorCorrection: boolean;
  medicalAccuracy: boolean;
  anatomicalCorrection: boolean;
  pathologyEnhancement: boolean;
  contrastEnhancement: boolean;
  edgeEnhancement: boolean;
  noiseReduction: boolean;
  motionBlur: boolean;
  temporalFiltering: boolean;
}

export interface RenderResult {
  id: string;
  sceneId: string;
  imageData: ImageData;
  metadata: {
    renderTime: number;
    quality: string;
    resolution: [number, number];
    triangleCount: number;
    memoryUsage: number;
    framerate: number;
  };
  viewpoint: Viewpoint;
  timestamp: Date;
}

export interface MedicalRenderingPreset {
  id: string;
  name: string;
  description: string;
  category: 'anatomy' | 'pathology' | 'surgery' | 'diagnosis' | 'education';
  modality: string;
  bodyPart: string;
  renderSettings: MedicalRenderSettings;
  lighting: LightingSetup;
  viewpoints: Viewpoint[];
  materials: MedicalMaterial[];
  isDefault: boolean;
  thumbnail?: string;
  createdBy: string;
  createdAt: Date;
}

// Medical Renderer Integration Class
export class MedicalRenderingIntegration {
  private renderer: MedicalRenderer;
  private auth: MedicalAuthService;
  private auditTrail: ComplianceAuditTrail;
  private sceneCache: Map<string, MedicalScene> = new Map();
  private presetCache: Map<string, MedicalRenderingPreset> = new Map();
  private materialCache: Map<string, MedicalMaterial> = new Map();
  private renderHistory: RenderResult[] = [];
  private currentScene: MedicalScene | null = null;
  private isRendering: boolean = false;

  constructor() {
    this.renderer = new MedicalRenderer();
    this.auth = MedicalAuthService.getInstance();
    this.auditTrail = new ComplianceAuditTrail();
    this.loadDefaultMaterials();
    this.loadDefaultPresets();
  }

  // Scene Management
  async createScene(
    studyUID: string, 
    seriesUIDs: string[], 
    options: {
      name: string;
      description: string;
      modality: string;
      bodyPart: string;
    }
  ): Promise<MedicalScene | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required for scene creation');
    }

    try {
      const sceneId = `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const scene: MedicalScene = {
        id: sceneId,
        studyUID,
        seriesUIDs,
        name: options.name,
        description: options.description,
        modality: options.modality,
        bodyPart: options.bodyPart,
        anatomicalRegions: [],
        measurements: [],
        annotations: [],
        viewpoints: [],
        lighting: this.getDefaultLighting(),
        materials: this.getDefaultMaterials(options.modality),
        renderSettings: this.getDefaultRenderSettings(),
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const success = await this.renderer.createScene(scene);
      
      if (success) {
        // Cache the scene
        this.sceneCache.set(sceneId, scene);
        this.currentScene = scene;
        
        // Log creation
        await this.auditTrail.logActivity({
          action: 'medical_scene_create',
          resourceType: 'medical_scene',
          resourceId: sceneId,
          userId: user.id,
          details: {
            studyUID,
            seriesCount: seriesUIDs.length,
            modality: options.modality,
            bodyPart: options.bodyPart
          }
        });
        
        return scene;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating medical scene:', error);
      return null;
    }
  }

  async loadScene(sceneId: string): Promise<MedicalScene | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check cache first
    if (this.sceneCache.has(sceneId)) {
      const scene = this.sceneCache.get(sceneId)!;
      this.currentScene = scene;
      return scene;
    }

    try {
      const scene = await this.renderer.loadScene(sceneId);
      
      if (scene) {
        // Cache the scene
        this.sceneCache.set(sceneId, scene);
        this.currentScene = scene;
        
        // Log loading
        await this.auditTrail.logActivity({
          action: 'medical_scene_load',
          resourceType: 'medical_scene',
          resourceId: sceneId,
          userId: user.id,
          details: {
            studyUID: scene.studyUID,
            modality: scene.modality,
            regionCount: scene.anatomicalRegions.length
          }
        });
      }
      
      return scene;
    } catch (error) {
      console.error('Error loading medical scene:', error);
      return null;
    }
  }

  async updateScene(sceneId: string, updates: Partial<MedicalScene>): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.renderer.updateScene(sceneId, {
        ...updates,
        updatedAt: new Date()
      });
      
      if (success) {
        // Update cache
        const cachedScene = this.sceneCache.get(sceneId);
        if (cachedScene) {
          const updatedScene = { ...cachedScene, ...updates, updatedAt: new Date() };
          this.sceneCache.set(sceneId, updatedScene);
          
          if (this.currentScene?.id === sceneId) {
            this.currentScene = updatedScene;
          }
        }
        
        // Log update
        await this.auditTrail.logActivity({
          action: 'medical_scene_update',
          resourceType: 'medical_scene',
          resourceId: sceneId,
          userId: user.id,
          details: {
            updatedFields: Object.keys(updates)
          }
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error updating medical scene:', error);
      return false;
    }
  }

  async deleteScene(sceneId: string): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check permissions
    if (!await this.auth.hasPermission(user.id, 'medical:delete_scenes')) {
      throw new Error('Insufficient permissions to delete scenes');
    }

    try {
      const success = await this.renderer.deleteScene(sceneId);
      
      if (success) {
        // Remove from cache
        this.sceneCache.delete(sceneId);
        
        if (this.currentScene?.id === sceneId) {
          this.currentScene = null;
        }
        
        // Log deletion
        await this.auditTrail.logActivity({
          action: 'medical_scene_delete',
          resourceType: 'medical_scene',
          resourceId: sceneId,
          userId: user.id,
          details: {}
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting medical scene:', error);
      return false;
    }
  }

  // Anatomical Region Management
  async addAnatomicalRegion(
    sceneId: string, 
    region: Omit<AnatomicalRegion, 'id'>
  ): Promise<AnatomicalRegion | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const regionId = `region_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newRegion: AnatomicalRegion = {
        ...region,
        id: regionId
      };

      const success = await this.renderer.addAnatomicalRegion(sceneId, newRegion);
      
      if (success) {
        // Update cache
        const scene = this.sceneCache.get(sceneId);
        if (scene) {
          scene.anatomicalRegions.push(newRegion);
          scene.updatedAt = new Date();
          this.sceneCache.set(sceneId, scene);
        }
        
        // Log addition
        await this.auditTrail.logActivity({
          action: 'anatomical_region_add',
          resourceType: 'anatomical_region',
          resourceId: regionId,
          userId: user.id,
          details: {
            sceneId,
            regionName: region.name,
            regionType: region.type,
            isPathological: region.isPathological
          }
        });
        
        return newRegion;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding anatomical region:', error);
      return null;
    }
  }

  async updateAnatomicalRegion(
    sceneId: string, 
    regionId: string, 
    updates: Partial<AnatomicalRegion>
  ): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.renderer.updateAnatomicalRegion(sceneId, regionId, updates);
      
      if (success) {
        // Update cache
        const scene = this.sceneCache.get(sceneId);
        if (scene) {
          const regionIndex = scene.anatomicalRegions.findIndex(r => r.id === regionId);
          if (regionIndex !== -1) {
            scene.anatomicalRegions[regionIndex] = { 
              ...scene.anatomicalRegions[regionIndex], 
              ...updates 
            };
            scene.updatedAt = new Date();
            this.sceneCache.set(sceneId, scene);
          }
        }
        
        // Log update
        await this.auditTrail.logActivity({
          action: 'anatomical_region_update',
          resourceType: 'anatomical_region',
          resourceId: regionId,
          userId: user.id,
          details: {
            sceneId,
            updatedFields: Object.keys(updates)
          }
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error updating anatomical region:', error);
      return false;
    }
  }

  // Measurement Management
  async addMeasurement(
    sceneId: string, 
    measurement: Omit<MedicalMeasurement, 'id' | 'createdBy' | 'createdAt'>
  ): Promise<MedicalMeasurement | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const measurementId = `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newMeasurement: MedicalMeasurement = {
        ...measurement,
        id: measurementId,
        createdBy: user.id,
        createdAt: new Date()
      };

      const success = await this.renderer.addMeasurement(sceneId, newMeasurement);
      
      if (success) {
        // Update cache
        const scene = this.sceneCache.get(sceneId);
        if (scene) {
          scene.measurements.push(newMeasurement);
          scene.updatedAt = new Date();
          this.sceneCache.set(sceneId, scene);
        }
        
        // Log addition
        await this.auditTrail.logActivity({
          action: 'medical_measurement_add',
          resourceType: 'medical_measurement',
          resourceId: measurementId,
          userId: user.id,
          details: {
            sceneId,
            measurementType: measurement.type,
            value: measurement.value,
            unit: measurement.unit,
            method: measurement.method
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

  // Annotation Management
  async addAnnotation(
    sceneId: string, 
    annotation: Omit<MedicalAnnotation, 'id' | 'createdBy' | 'createdAt'>
  ): Promise<MedicalAnnotation | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const annotationId = `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newAnnotation: MedicalAnnotation = {
        ...annotation,
        id: annotationId,
        createdBy: user.id,
        createdAt: new Date()
      };

      const success = await this.renderer.addAnnotation(sceneId, newAnnotation);
      
      if (success) {
        // Update cache
        const scene = this.sceneCache.get(sceneId);
        if (scene) {
          scene.annotations.push(newAnnotation);
          scene.updatedAt = new Date();
          this.sceneCache.set(sceneId, scene);
        }
        
        // Log addition
        await this.auditTrail.logActivity({
          action: 'medical_annotation_add',
          resourceType: 'medical_annotation',
          resourceId: annotationId,
          userId: user.id,
          details: {
            sceneId,
            annotationType: annotation.type,
            category: annotation.category,
            priority: annotation.priority
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

  // Rendering Methods
  async renderScene(
    sceneId: string, 
    viewpointId: string, 
    canvas: HTMLCanvasElement,
    options?: { quality?: string; width?: number; height?: number }
  ): Promise<RenderResult | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required for rendering');
    }

    if (this.isRendering) {
      throw new Error('Rendering already in progress');
    }

    try {
      this.isRendering = true;
      const startTime = performance.now();
      
      const renderResult = await this.renderer.renderScene(sceneId, viewpointId, canvas, options);
      
      if (renderResult) {
        const endTime = performance.now();
        const result: RenderResult = {
          ...renderResult,
          metadata: {
            ...renderResult.metadata,
            renderTime: endTime - startTime
          },
          timestamp: new Date()
        };
        
        // Add to history
        this.renderHistory.unshift(result);
        if (this.renderHistory.length > 50) {
          this.renderHistory = this.renderHistory.slice(0, 50);
        }
        
        // Log rendering
        await this.auditTrail.logActivity({
          action: 'medical_render',
          resourceType: 'medical_scene',
          resourceId: sceneId,
          userId: user.id,
          details: {
            viewpointId,
            renderTime: result.metadata.renderTime,
            quality: result.metadata.quality,
            triangleCount: result.metadata.triangleCount
          }
        });
        
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Error rendering medical scene:', error);
      throw error;
    } finally {
      this.isRendering = false;
    }
  }

  // Preset Management
  async getPresets(category?: string, modality?: string): Promise<MedicalRenderingPreset[]> {
    try {
      const presets = await this.renderer.getPresets(category, modality);
      
      // Cache presets
      presets.forEach(preset => {
        this.presetCache.set(preset.id, preset);
      });
      
      return presets;
    } catch (error) {
      console.error('Error fetching presets:', error);
      return [];
    }
  }

  // Material Management
  async getMaterials(type?: string): Promise<MedicalMaterial[]> {
    try {
      const materials = await this.renderer.getMaterials(type);
      
      // Cache materials
      materials.forEach(material => {
        this.materialCache.set(material.id, material);
      });
      
      return materials;
    } catch (error) {
      console.error('Error fetching materials:', error);
      return [];
    }
  }

  // Utility Methods
  private getDefaultLighting(): LightingSetup {
    return {
      ambient: { color: [0.2, 0.2, 0.2], intensity: 0.3 },
      directional: { 
        color: [1, 1, 1], 
        intensity: 0.8, 
        direction: [-0.5, -1, -0.5], 
        castShadows: true 
      },
      point: { 
        color: [1, 1, 1], 
        intensity: 0.5, 
        position: [5, 5, 5], 
        attenuation: 0.1 
      },
      medical: {
        headlight: true,
        shadowQuality: 'medium',
        softShadows: true,
        medicalLighting: true
      }
    };
  }

  private getDefaultMaterials(modality: string): MedicalMaterial[] {
    return Array.from(this.materialCache.values())
      .filter(material => this.isMaterialSuitableForModality(material, modality));
  }

  private isMaterialSuitableForModality(material: MedicalMaterial, modality: string): boolean {
    // Logic to determine if a material is suitable for a specific modality
    switch (modality) {
      case 'CT':
        return material.medicalProperties.hounsfield !== undefined;
      case 'MR':
        return material.medicalProperties.t1Signal !== undefined || 
               material.medicalProperties.t2Signal !== undefined;
      default:
        return true;
    }
  }

  private getDefaultRenderSettings(): MedicalRenderSettings {
    return {
      quality: 'standard',
      antialiasing: true,
      shadowMapping: true,
      ambientOcclusion: false,
      depthOfField: false,
      bloom: false,
      toneMapping: true,
      colorCorrection: true,
      medicalAccuracy: true,
      anatomicalCorrection: true,
      pathologyEnhancement: false,
      contrastEnhancement: false,
      edgeEnhancement: false,
      noiseReduction: true,
      motionBlur: false,
      temporalFiltering: false
    };
  }

  private async loadDefaultMaterials(): Promise<void> {
    try {
      const defaultMaterials = await this.renderer.getDefaultMaterials();
      defaultMaterials.forEach(material => {
        this.materialCache.set(material.id, material);
      });
    } catch (error) {
      console.error('Error loading default materials:', error);
    }
  }

  private async loadDefaultPresets(): Promise<void> {
    try {
      const defaultPresets = await this.renderer.getDefaultPresets();
      defaultPresets.forEach(preset => {
        this.presetCache.set(preset.id, preset);
      });
    } catch (error) {
      console.error('Error loading default presets:', error);
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    try {
      await this.renderer.cleanup();
      this.sceneCache.clear();
      this.presetCache.clear();
      this.materialCache.clear();
      this.renderHistory = [];
      this.currentScene = null;
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Getters
  getCurrentScene(): MedicalScene | null {
    return this.currentScene;
  }

  getRenderHistory(): RenderResult[] {
    return [...this.renderHistory];
  }

  isCurrentlyRendering(): boolean {
    return this.isRendering;
  }
}

// Export singleton instance
export const medicalRenderingIntegration = new MedicalRenderingIntegration();
export default medicalRenderingIntegration; 