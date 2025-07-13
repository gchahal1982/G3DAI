/**
 * Volume Rendering Integration Library - MedSight Pro
 * Connects frontend to backend VolumeRenderer.ts for medical 3D visualization
 * 
 * Features:
 * - 3D medical volume rendering
 * - Multiple rendering modes (Volume, MIP, MinIP, Surface)
 * - Transfer function management
 * - Lighting and material controls
 * - Performance optimization
 * - Medical workflow integration
 */

import { VolumeRenderer } from '@/core/VolumeRenderer';
import { MedicalAuth } from '@/lib/auth/medical-auth';
import { ComplianceAuditTrail } from '@/lib/compliance/audit-trail';

// Volume Rendering Data Structures
export interface VolumeData {
  id: string;
  studyUID: string;
  seriesUID: string;
  dimensions: [number, number, number];
  spacing: [number, number, number];
  origin: [number, number, number];
  orientation: number[];
  voxelData: ArrayBuffer;
  dataType: 'uint8' | 'uint16' | 'int16' | 'float32';
  windowCenter: number;
  windowWidth: number;
  rescaleIntercept: number;
  rescaleSlope: number;
  modality: string;
  bodyPart: string;
  acquisitionDate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RenderingSettings {
  mode: 'volume' | 'mip' | 'minip' | 'surface' | 'isosurface';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  sampleRate: number;
  threshold: number;
  opacity: number;
  brightness: number;
  contrast: number;
  gamma: number;
  shadingEnabled: boolean;
  ambientLight: number;
  diffuseLight: number;
  specularLight: number;
  shininess: number;
  gradientShading: boolean;
  edgeEnhancement: boolean;
  noiseReduction: boolean;
  interpolation: 'nearest' | 'linear' | 'cubic';
}

export interface TransferFunction {
  id: string;
  name: string;
  description: string;
  modality: string;
  bodyPart: string;
  colorPoints: ColorPoint[];
  opacityPoints: OpacityPoint[];
  isDefault: boolean;
  isCustom: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface ColorPoint {
  value: number;
  color: [number, number, number]; // RGB 0-1
}

export interface OpacityPoint {
  value: number;
  opacity: number; // 0-1
}

export interface Camera {
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
  fov: number;
  near: number;
  far: number;
  zoom: number;
}

export interface ClippingPlane {
  id: string;
  normal: [number, number, number];
  distance: number;
  enabled: boolean;
  color: [number, number, number, number];
}

export interface VolumeRenderResult {
  imageData: ImageData;
  renderTime: number;
  triangleCount?: number;
  quality: string;
  settings: RenderingSettings;
  camera: Camera;
  timestamp: Date;
}

export interface RenderingPreset {
  id: string;
  name: string;
  description: string;
  modality: string;
  bodyPart: string;
  settings: RenderingSettings;
  transferFunction: TransferFunction;
  camera?: Partial<Camera>;
  clippingPlanes?: ClippingPlane[];
  isDefault: boolean;
  thumbnail?: string;
}

export interface VolumeMetrics {
  renderTime: number;
  framerate: number;
  memoryUsage: number;
  gpuMemoryUsage: number;
  triangleCount: number;
  voxelCount: number;
  sampleCount: number;
  qualityScore: number;
  performanceScore: number;
}

// Volume Rendering Integration Class
export class VolumeRenderingIntegration {
  private renderer: VolumeRenderer;
  private auth: MedicalAuth;
  private auditTrail: ComplianceAuditTrail;
  private volumeCache: Map<string, VolumeData> = new Map();
  private presetCache: Map<string, RenderingPreset> = new Map();
  private renderHistory: VolumeRenderResult[] = [];
  private currentVolume: VolumeData | null = null;
  private isRendering: boolean = false;

  constructor() {
    this.renderer = new VolumeRenderer();
    this.auth = new MedicalAuth();
    this.auditTrail = new ComplianceAuditTrail();
    this.loadDefaultPresets();
  }

  // Volume Management
  async loadVolume(studyUID: string, seriesUID: string): Promise<VolumeData | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required for volume loading');
    }

    const cacheKey = `${studyUID}_${seriesUID}`;
    
    // Check cache first
    if (this.volumeCache.has(cacheKey)) {
      const volume = this.volumeCache.get(cacheKey)!;
      
      // Log access
      await this.auditTrail.logActivity({
        action: 'volume_access',
        resourceType: 'volume',
        resourceId: volume.id,
        userId: user.id,
        details: {
          studyUID,
          seriesUID,
          modality: volume.modality,
          fromCache: true
        }
      });
      
      return volume;
    }

    try {
      const volume = await this.renderer.loadVolume(studyUID, seriesUID);
      
      if (volume) {
        // Cache the volume
        this.volumeCache.set(cacheKey, volume);
        this.currentVolume = volume;
        
        // Log loading
        await this.auditTrail.logActivity({
          action: 'volume_load',
          resourceType: 'volume',
          resourceId: volume.id,
          userId: user.id,
          details: {
            studyUID,
            seriesUID,
            modality: volume.modality,
            dimensions: volume.dimensions,
            dataType: volume.dataType,
            fileSize: volume.voxelData.byteLength
          }
        });
      }
      
      return volume;
    } catch (error) {
      console.error('Error loading volume:', error);
      return null;
    }
  }

  async unloadVolume(volumeId: string): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.renderer.unloadVolume(volumeId);
      
      if (success) {
        // Remove from cache
        for (const [key, volume] of this.volumeCache.entries()) {
          if (volume.id === volumeId) {
            this.volumeCache.delete(key);
            break;
          }
        }
        
        if (this.currentVolume?.id === volumeId) {
          this.currentVolume = null;
        }
        
        // Log unloading
        await this.auditTrail.logActivity({
          action: 'volume_unload',
          resourceType: 'volume',
          resourceId: volumeId,
          userId: user.id,
          details: {}
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error unloading volume:', error);
      return false;
    }
  }

  // Rendering Methods
  async renderVolume(
    volumeId: string, 
    settings: RenderingSettings, 
    camera: Camera,
    canvas: HTMLCanvasElement
  ): Promise<VolumeRenderResult | null> {
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
      
      const renderResult = await this.renderer.render(volumeId, settings, camera, canvas);
      
      if (renderResult) {
        const endTime = performance.now();
        const result: VolumeRenderResult = {
          ...renderResult,
          renderTime: endTime - startTime,
          timestamp: new Date()
        };
        
        // Add to history
        this.renderHistory.unshift(result);
        if (this.renderHistory.length > 100) {
          this.renderHistory = this.renderHistory.slice(0, 100);
        }
        
        // Log rendering
        await this.auditTrail.logActivity({
          action: 'volume_render',
          resourceType: 'volume',
          resourceId: volumeId,
          userId: user.id,
          details: {
            renderTime: result.renderTime,
            mode: settings.mode,
            quality: settings.quality,
            triangleCount: result.triangleCount
          }
        });
        
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Error rendering volume:', error);
      throw error;
    } finally {
      this.isRendering = false;
    }
  }

  async renderWithPreset(
    volumeId: string, 
    presetId: string, 
    camera: Camera,
    canvas: HTMLCanvasElement
  ): Promise<VolumeRenderResult | null> {
    const preset = await this.getPreset(presetId);
    if (!preset) {
      throw new Error('Preset not found');
    }

    // Apply transfer function
    await this.applyTransferFunction(volumeId, preset.transferFunction);
    
    // Apply clipping planes if any
    if (preset.clippingPlanes) {
      await this.setClippingPlanes(volumeId, preset.clippingPlanes);
    }
    
    // Use preset camera if specified
    const renderCamera = preset.camera ? { ...camera, ...preset.camera } : camera;
    
    return this.renderVolume(volumeId, preset.settings, renderCamera, canvas);
  }

  // Transfer Function Management
  async applyTransferFunction(volumeId: string, transferFunction: TransferFunction): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.renderer.applyTransferFunction(volumeId, transferFunction);
      
      if (success) {
        // Log transfer function application
        await this.auditTrail.logActivity({
          action: 'transfer_function_apply',
          resourceType: 'volume',
          resourceId: volumeId,
          userId: user.id,
          details: {
            transferFunctionId: transferFunction.id,
            transferFunctionName: transferFunction.name,
            colorPointCount: transferFunction.colorPoints.length,
            opacityPointCount: transferFunction.opacityPoints.length
          }
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error applying transfer function:', error);
      return false;
    }
  }

  async createTransferFunction(transferFunction: Omit<TransferFunction, 'id' | 'createdBy' | 'createdAt'>): Promise<TransferFunction | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const newTransferFunction: TransferFunction = {
        ...transferFunction,
        id: `tf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdBy: user.id,
        createdAt: new Date()
      };

      const success = await this.renderer.createTransferFunction(newTransferFunction);
      
      if (success) {
        // Log creation
        await this.auditTrail.logActivity({
          action: 'transfer_function_create',
          resourceType: 'transfer_function',
          resourceId: newTransferFunction.id,
          userId: user.id,
          details: {
            name: newTransferFunction.name,
            modality: newTransferFunction.modality,
            bodyPart: newTransferFunction.bodyPart,
            isCustom: newTransferFunction.isCustom
          }
        });
        
        return newTransferFunction;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating transfer function:', error);
      return null;
    }
  }

  async getTransferFunctions(modality?: string, bodyPart?: string): Promise<TransferFunction[]> {
    try {
      return await this.renderer.getTransferFunctions(modality, bodyPart);
    } catch (error) {
      console.error('Error fetching transfer functions:', error);
      return [];
    }
  }

  async deleteTransferFunction(transferFunctionId: string): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check permissions
    if (!await this.auth.hasPermission(user.id, 'volume:manage_presets')) {
      throw new Error('Insufficient permissions to delete transfer functions');
    }

    try {
      const success = await this.renderer.deleteTransferFunction(transferFunctionId);
      
      if (success) {
        // Log deletion
        await this.auditTrail.logActivity({
          action: 'transfer_function_delete',
          resourceType: 'transfer_function',
          resourceId: transferFunctionId,
          userId: user.id,
          details: {}
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting transfer function:', error);
      return false;
    }
  }

  // Preset Management
  async getPreset(presetId: string): Promise<RenderingPreset | null> {
    // Check cache first
    if (this.presetCache.has(presetId)) {
      return this.presetCache.get(presetId)!;
    }

    try {
      const preset = await this.renderer.getPreset(presetId);
      if (preset) {
        this.presetCache.set(presetId, preset);
      }
      return preset;
    } catch (error) {
      console.error('Error fetching preset:', error);
      return null;
    }
  }

  async getPresets(modality?: string, bodyPart?: string): Promise<RenderingPreset[]> {
    try {
      const presets = await this.renderer.getPresets(modality, bodyPart);
      
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

  async createPreset(preset: Omit<RenderingPreset, 'id'>): Promise<RenderingPreset | null> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const newPreset: RenderingPreset = {
        ...preset,
        id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const success = await this.renderer.createPreset(newPreset);
      
      if (success) {
        // Cache preset
        this.presetCache.set(newPreset.id, newPreset);
        
        // Log creation
        await this.auditTrail.logActivity({
          action: 'preset_create',
          resourceType: 'rendering_preset',
          resourceId: newPreset.id,
          userId: user.id,
          details: {
            name: newPreset.name,
            modality: newPreset.modality,
            bodyPart: newPreset.bodyPart,
            mode: newPreset.settings.mode
          }
        });
        
        return newPreset;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating preset:', error);
      return null;
    }
  }

  async deletePreset(presetId: string): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check permissions
    if (!await this.auth.hasPermission(user.id, 'volume:manage_presets')) {
      throw new Error('Insufficient permissions to delete presets');
    }

    try {
      const success = await this.renderer.deletePreset(presetId);
      
      if (success) {
        // Remove from cache
        this.presetCache.delete(presetId);
        
        // Log deletion
        await this.auditTrail.logActivity({
          action: 'preset_delete',
          resourceType: 'rendering_preset',
          resourceId: presetId,
          userId: user.id,
          details: {}
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting preset:', error);
      return false;
    }
  }

  // Camera and Navigation
  async setCamera(volumeId: string, camera: Camera): Promise<boolean> {
    try {
      return await this.renderer.setCamera(volumeId, camera);
    } catch (error) {
      console.error('Error setting camera:', error);
      return false;
    }
  }

  async getCamera(volumeId: string): Promise<Camera | null> {
    try {
      return await this.renderer.getCamera(volumeId);
    } catch (error) {
      console.error('Error getting camera:', error);
      return null;
    }
  }

  async resetCamera(volumeId: string): Promise<boolean> {
    try {
      return await this.renderer.resetCamera(volumeId);
    } catch (error) {
      console.error('Error resetting camera:', error);
      return false;
    }
  }

  // Clipping Planes
  async setClippingPlanes(volumeId: string, planes: ClippingPlane[]): Promise<boolean> {
    const user = await this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const success = await this.renderer.setClippingPlanes(volumeId, planes);
      
      if (success) {
        // Log clipping plane changes
        await this.auditTrail.logActivity({
          action: 'clipping_planes_set',
          resourceType: 'volume',
          resourceId: volumeId,
          userId: user.id,
          details: {
            planeCount: planes.length,
            enabledPlanes: planes.filter(p => p.enabled).length
          }
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error setting clipping planes:', error);
      return false;
    }
  }

  async getClippingPlanes(volumeId: string): Promise<ClippingPlane[]> {
    try {
      return await this.renderer.getClippingPlanes(volumeId);
    } catch (error) {
      console.error('Error getting clipping planes:', error);
      return [];
    }
  }

  // Performance and Metrics
  async getMetrics(volumeId: string): Promise<VolumeMetrics | null> {
    try {
      return await this.renderer.getMetrics(volumeId);
    } catch (error) {
      console.error('Error getting metrics:', error);
      return null;
    }
  }

  async optimizePerformance(volumeId: string, targetFramerate: number): Promise<RenderingSettings | null> {
    try {
      return await this.renderer.optimizePerformance(volumeId, targetFramerate);
    } catch (error) {
      console.error('Error optimizing performance:', error);
      return null;
    }
  }

  // Utility Methods
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
      this.volumeCache.clear();
      this.presetCache.clear();
      this.renderHistory = [];
      this.currentVolume = null;
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Getters
  getCurrentVolume(): VolumeData | null {
    return this.currentVolume;
  }

  getRenderHistory(): VolumeRenderResult[] {
    return [...this.renderHistory];
  }

  isCurrentlyRendering(): boolean {
    return this.isRendering;
  }

  getCachedVolumes(): VolumeData[] {
    return Array.from(this.volumeCache.values());
  }

  getCachedPresets(): RenderingPreset[] {
    return Array.from(this.presetCache.values());
  }
}

// Export singleton instance
export const volumeRenderingIntegration = new VolumeRenderingIntegration();
export default volumeRenderingIntegration; 