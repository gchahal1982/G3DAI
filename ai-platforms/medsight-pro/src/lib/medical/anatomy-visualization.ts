/**
 * G3D MedSight Pro - Anatomy Visualization Integration
 * Comprehensive integration for anatomical structure visualization
 * 
 * Features:
 * - 3D anatomy rendering and interaction
 * - Medical education support
 * - Multi-system visualization
 * - Structure highlighting and annotation
 * - Cross-sectional views
 * - Medical simulation support
 */

import { AnatomyVisualization } from '../../medical/AnatomyVisualization';

// Anatomy data structures
export interface AnatomicalStructure {
  id: string;
  name: string;
  description: string;
  category: 'organ' | 'bone' | 'muscle' | 'vessel' | 'nerve' | 'tissue' | 'system';
  systemId: string;
  parentId?: string;
  children: string[];
  properties: {
    isVisible: boolean;
    opacity: number;
    color: [number, number, number, number]; // RGBA
    highlighted: boolean;
    selected: boolean;
    annotated: boolean;
  };
  medicalInfo: {
    anatomicalTerms: string[];
    physiologicalFunction: string;
    clinicalSignificance: string;
    pathologyCommon: string[];
    relatedStructures: string[];
  };
  visualization: {
    meshId?: string;
    geometry?: {
      vertices: number;
      faces: number;
      materials: string[];
    };
    boundingBox: {
      min: [number, number, number];
      max: [number, number, number];
    };
    levelOfDetail: number;
  };
}

export interface AnatomicalSystem {
  id: string;
  name: string;
  description: string;
  type: 'skeletal' | 'muscular' | 'cardiovascular' | 'respiratory' | 'nervous' | 'digestive' | 'endocrine' | 'reproductive' | 'urinary' | 'integumentary' | 'immune';
  structures: string[]; // Structure IDs
  isLoaded: boolean;
  isVisible: boolean;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'research';
  educationalLevel: 'elementary' | 'high-school' | 'undergraduate' | 'medical' | 'specialist';
  metadata: {
    version: string;
    accuracy: 'simplified' | 'anatomically-correct' | 'histologically-accurate';
    dataSource: string;
    lastUpdated: Date;
  };
}

export interface ViewConfiguration {
  id: string;
  name: string;
  description: string;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    up: [number, number, number];
    fov: number;
  };
  lighting: {
    ambient: number;
    directional: {
      direction: [number, number, number];
      intensity: number;
      color: [number, number, number];
    };
    shadows: boolean;
  };
  rendering: {
    style: 'realistic' | 'educational' | 'clinical' | 'schematic';
    quality: 'low' | 'medium' | 'high' | 'ultra';
    transparency: boolean;
    wireframe: boolean;
    crossSection: boolean;
  };
}

export interface Annotation {
  id: string;
  structureId: string;
  type: 'label' | 'description' | 'measurement' | 'pathology' | 'instruction';
  position: [number, number, number];
  content: {
    title: string;
    description: string;
    medicalTerms?: string[];
    multimedia?: {
      images: string[];
      videos: string[];
      audio: string[];
    };
  };
  style: {
    fontSize: number;
    color: [number, number, number];
    backgroundColor: [number, number, number, number];
    visible: boolean;
    alwaysOnTop: boolean;
  };
  interactions: {
    clickable: boolean;
    expandable: boolean;
    linked: boolean;
    linkedAnnotations: string[];
  };
}

export interface CrossSection {
  id: string;
  name: string;
  plane: {
    position: [number, number, number];
    normal: [number, number, number];
  };
  thickness: number;
  visible: boolean;
  structures: string[]; // Affected structure IDs
  style: {
    fillOpacity: number;
    strokeWidth: number;
    strokeColor: [number, number, number];
    showLabels: boolean;
  };
}

export interface EducationalMode {
  id: string;
  name: string;
  description: string;
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  focusAreas: string[]; // System or structure IDs
  learningObjectives: string[];
  assessmentQuestions?: {
    question: string;
    type: 'multiple-choice' | 'identification' | 'true-false';
    options?: string[];
    correctAnswer: string | number;
    explanation: string;
    structureIds: string[];
  }[];
  guidedTour?: {
    steps: {
      title: string;
      description: string;
      viewConfiguration: string;
      highlightedStructures: string[];
      annotations: string[];
      duration?: number;
    }[];
  };
}

// Comprehensive anatomy visualization integration
export class AnatomyVisualizationIntegration {
  private anatomyVisualizer: AnatomyVisualization | null = null;
  private gl: WebGL2RenderingContext | null = null;
  
  private loadedSystems: Map<string, AnatomicalSystem> = new Map();
  private structures: Map<string, AnatomicalStructure> = new Map();
  private viewConfigurations: Map<string, ViewConfiguration> = new Map();
  private annotations: Map<string, Annotation> = new Map();
  private crossSections: Map<string, CrossSection> = new Map();
  private educationalModes: Map<string, EducationalMode> = new Map();
  
  private currentSystem: string | null = null;
  private selectedStructures: Set<string> = new Set();
  private highlightedStructures: Set<string> = new Set();
  private activeAnnotations: Set<string> = new Set();
  private activeCrossSections: Set<string> = new Set();
  private currentEducationalMode: string | null = null;
  
  private isInitialized: boolean = false;
  private lastRenderTime: number = 0;
  
  // Event handlers
  private onStructureSelectedCallback?: (structureId: string) => void;
  private onSystemLoadedCallback?: (systemId: string) => void;
  private onAnnotationClickedCallback?: (annotationId: string) => void;
  private onEducationalProgressCallback?: (progress: number) => void;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.anatomyVisualizer = new AnatomyVisualization(gl);
  }

  // Initialize the anatomy visualization system
  async initialize(): Promise<void> {
    if (this.isInitialized || !this.anatomyVisualizer) return;

    try {
      await this.anatomyVisualizer.initialize();
      this.setupDefaultViewConfigurations();
      this.setupDefaultEducationalModes();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize anatomy visualization:', error);
      throw error;
    }
  }

  // Load anatomical system
  async loadAnatomicalSystem(systemId: string): Promise<boolean> {
    if (!this.isInitialized || !this.anatomyVisualizer) {
      throw new Error('Anatomy visualizer not initialized');
    }

    try {
      // Load system from backend
      const systemData = await this.anatomyVisualizer.loadAnatomicalSystem(systemId);
      
      // Process and store system data
      const system: AnatomicalSystem = this.processSystemData(systemData, systemId);
      this.loadedSystems.set(systemId, system);
      
      // Load associated structures
      await this.loadSystemStructures(systemId);
      
      // Set as current system
      this.currentSystem = systemId;
      
      this.onSystemLoadedCallback?.(systemId);
      return true;
    } catch (error) {
      console.error(`Failed to load anatomical system ${systemId}:`, error);
      return false;
    }
  }

  // Load structures for a system
  private async loadSystemStructures(systemId: string): Promise<void> {
    const system = this.loadedSystems.get(systemId);
    if (!system || !this.anatomyVisualizer) return;

    for (const structureId of system.structures) {
      try {
        const structureData = await this.anatomyVisualizer.getStructure(structureId);
        if (structureData) {
          const structure = this.processStructureData(structureData, structureId, systemId);
          this.structures.set(structureId, structure);
        }
      } catch (error) {
        console.warn(`Failed to load structure ${structureId}:`, error);
      }
    }
  }

  // Set structure visibility
  setStructureVisibility(structureId: string, visible: boolean): void {
    const structure = this.structures.get(structureId);
    if (structure) {
      structure.properties.isVisible = visible;
      this.structures.set(structureId, structure);
      
      // Update backend
      if (this.anatomyVisualizer) {
        const backendStructure = this.anatomyVisualizer.getStructure(structureId);
        if (backendStructure) {
          backendStructure.isVisible = visible;
        }
      }
    }
  }

  // Set structure opacity
  setStructureOpacity(structureId: string, opacity: number): void {
    const structure = this.structures.get(structureId);
    if (structure) {
      structure.properties.opacity = Math.max(0, Math.min(1, opacity));
      this.structures.set(structureId, structure);
      
      // Update backend
      if (this.anatomyVisualizer) {
        const backendStructure = this.anatomyVisualizer.getStructure(structureId);
        if (backendStructure) {
          backendStructure.opacity = structure.properties.opacity;
        }
      }
    }
  }

  // Highlight structure
  highlightStructure(structureId: string, highlight: boolean): void {
    const structure = this.structures.get(structureId);
    if (structure) {
      structure.properties.highlighted = highlight;
      this.structures.set(structureId, structure);
      
      if (highlight) {
        this.highlightedStructures.add(structureId);
      } else {
        this.highlightedStructures.delete(structureId);
      }
      
      // Update backend
      if (this.anatomyVisualizer) {
        this.anatomyVisualizer.highlightStructure(structureId, highlight);
      }
    }
  }

  // Select structure
  selectStructure(structureId: string, selected: boolean = true): void {
    const structure = this.structures.get(structureId);
    if (structure) {
      structure.properties.selected = selected;
      this.structures.set(structureId, structure);
      
      if (selected) {
        this.selectedStructures.add(structureId);
      } else {
        this.selectedStructures.delete(structureId);
      }
      
      this.onStructureSelectedCallback?.(structureId);
    }
  }

  // Clear all selections
  clearSelections(): void {
    this.selectedStructures.forEach(structureId => {
      this.selectStructure(structureId, false);
    });
    this.selectedStructures.clear();
  }

  // Add annotation
  addAnnotation(annotation: Omit<Annotation, 'id'>): string {
    const annotationId = `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullAnnotation: Annotation = { ...annotation, id: annotationId };
    
    this.annotations.set(annotationId, fullAnnotation);
    this.activeAnnotations.add(annotationId);
    
    return annotationId;
  }

  // Remove annotation
  removeAnnotation(annotationId: string): void {
    this.annotations.delete(annotationId);
    this.activeAnnotations.delete(annotationId);
  }

  // Set annotation visibility
  setAnnotationVisibility(annotationId: string, visible: boolean): void {
    const annotation = this.annotations.get(annotationId);
    if (annotation) {
      annotation.style.visible = visible;
      this.annotations.set(annotationId, annotation);
      
      if (visible) {
        this.activeAnnotations.add(annotationId);
      } else {
        this.activeAnnotations.delete(annotationId);
      }
    }
  }

  // Create cross section
  createCrossSection(crossSection: Omit<CrossSection, 'id'>): string {
    const sectionId = `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullSection: CrossSection = { ...crossSection, id: sectionId };
    
    this.crossSections.set(sectionId, fullSection);
    if (fullSection.visible) {
      this.activeCrossSections.add(sectionId);
    }
    
    return sectionId;
  }

  // Set cross section visibility
  setCrossSectionVisibility(sectionId: string, visible: boolean): void {
    const section = this.crossSections.get(sectionId);
    if (section) {
      section.visible = visible;
      this.crossSections.set(sectionId, section);
      
      if (visible) {
        this.activeCrossSections.add(sectionId);
      } else {
        this.activeCrossSections.delete(sectionId);
      }
    }
  }

  // Apply view configuration
  applyViewConfiguration(configId: string): void {
    const config = this.viewConfigurations.get(configId);
    if (config && this.anatomyVisualizer) {
      // Apply camera settings
      // Note: These methods would need to be implemented in the backend AnatomyVisualization class
      // this.anatomyVisualizer.setCameraPosition(config.camera.position);
      // this.anatomyVisualizer.setCameraTarget(config.camera.target);
      // this.anatomyVisualizer.setCameraUp(config.camera.up);
      
      // Apply lighting
      // this.anatomyVisualizer.setLighting({
      //   ambient: config.lighting.ambient,
      //   directional: config.lighting.directional
      // });
      
      // Apply rendering settings
      // this.anatomyVisualizer.setRenderingStyle(config.rendering.style);
      // this.anatomyVisualizer.setRenderingQuality(config.rendering.quality);
      
      // For now, we just log that the configuration would be applied
      console.log(`Applying view configuration: ${config.name}`);
    }
  }

  // Start educational mode
  startEducationalMode(modeId: string): boolean {
    const mode = this.educationalModes.get(modeId);
    if (!mode) return false;
    
    this.currentEducationalMode = modeId;
    
    // Focus on relevant systems/structures
    mode.focusAreas.forEach(areaId => {
      if (this.loadedSystems.has(areaId)) {
        // Focus on system
        this.setSystemVisibility(areaId, true);
      } else if (this.structures.has(areaId)) {
        // Focus on structure
        this.setStructureVisibility(areaId, true);
        this.highlightStructure(areaId, true);
      }
    });
    
    return true;
  }

  // Stop educational mode
  stopEducationalMode(): void {
    if (this.currentEducationalMode) {
      this.clearSelections();
      this.highlightedStructures.forEach(structureId => {
        this.highlightStructure(structureId, false);
      });
      this.currentEducationalMode = null;
    }
  }

  // Set system visibility
  setSystemVisibility(systemId: string, visible: boolean): void {
    const system = this.loadedSystems.get(systemId);
    if (system) {
      system.isVisible = visible;
      this.loadedSystems.set(systemId, system);
      
      // Apply to all structures in system
      system.structures.forEach(structureId => {
        this.setStructureVisibility(structureId, visible);
      });
    }
  }

  // Render anatomy
  render(viewMatrix?: any, projectionMatrix?: any): void {
    if (!this.isInitialized || !this.anatomyVisualizer) return;
    
    const now = performance.now();
    this.lastRenderTime = now;
    
    try {
      this.anatomyVisualizer.render(viewMatrix, projectionMatrix);
    } catch (error) {
      console.error('Anatomy rendering failed:', error);
    }
  }

  // Get structure information
  getStructureInfo(structureId: string): AnatomicalStructure | null {
    return this.structures.get(structureId) || null;
  }

  // Get system information
  getSystemInfo(systemId: string): AnatomicalSystem | null {
    return this.loadedSystems.get(systemId) || null;
  }

  // Get loaded systems
  getLoadedSystems(): AnatomicalSystem[] {
    return Array.from(this.loadedSystems.values());
  }

  // Get system structures
  getSystemStructures(systemId: string): AnatomicalStructure[] {
    const system = this.loadedSystems.get(systemId);
    if (!system) return [];
    
    return system.structures.map(id => this.structures.get(id)).filter(Boolean) as AnatomicalStructure[];
  }

  // Search structures
  searchStructures(query: string): AnatomicalStructure[] {
    const results: AnatomicalStructure[] = [];
    const lowerQuery = query.toLowerCase();
    
    this.structures.forEach(structure => {
      if (structure.name.toLowerCase().includes(lowerQuery) ||
          structure.description.toLowerCase().includes(lowerQuery) ||
          structure.medicalInfo.anatomicalTerms.some(term => term.toLowerCase().includes(lowerQuery))) {
        results.push(structure);
      }
    });
    
    return results;
  }

  // Event handlers
  onStructureSelected(callback: (structureId: string) => void): void {
    this.onStructureSelectedCallback = callback;
  }

  onSystemLoaded(callback: (systemId: string) => void): void {
    this.onSystemLoadedCallback = callback;
  }

  onAnnotationClicked(callback: (annotationId: string) => void): void {
    this.onAnnotationClickedCallback = callback;
  }

  onEducationalProgress(callback: (progress: number) => void): void {
    this.onEducationalProgressCallback = callback;
  }

  // Cleanup
  dispose(): void {
    if (this.anatomyVisualizer) {
      this.anatomyVisualizer.dispose();
      this.anatomyVisualizer = null;
    }
    
    // Clear data
    this.loadedSystems.clear();
    this.structures.clear();
    this.viewConfigurations.clear();
    this.annotations.clear();
    this.crossSections.clear();
    this.educationalModes.clear();
    
    // Clear selections
    this.selectedStructures.clear();
    this.highlightedStructures.clear();
    this.activeAnnotations.clear();
    this.activeCrossSections.clear();
    
    this.isInitialized = false;
  }

  // Private helper methods
  private processSystemData(systemData: any, systemId: string): AnatomicalSystem {
    return {
      id: systemId,
      name: systemData.name || 'Unknown System',
      description: systemData.description || '',
      type: systemData.type || 'nervous',
      structures: systemData.structures || [],
      isLoaded: true,
      isVisible: true,
      complexity: systemData.complexity || 'intermediate',
      educationalLevel: systemData.educationalLevel || 'undergraduate',
      metadata: {
        version: systemData.version || '1.0',
        accuracy: systemData.accuracy || 'anatomically-correct',
        dataSource: systemData.dataSource || 'Unknown',
        lastUpdated: new Date()
      }
    };
  }

  private processStructureData(structureData: any, structureId: string, systemId: string): AnatomicalStructure {
    return {
      id: structureId,
      name: structureData.name || 'Unknown Structure',
      description: structureData.description || '',
      category: structureData.category || 'tissue',
      systemId,
      parentId: structureData.parentId,
      children: structureData.children || [],
      properties: {
        isVisible: structureData.isVisible !== false,
        opacity: structureData.opacity || 1.0,
        color: structureData.color || [1, 1, 1, 1],
        highlighted: false,
        selected: false,
        annotated: false
      },
      medicalInfo: {
        anatomicalTerms: structureData.anatomicalTerms || [],
        physiologicalFunction: structureData.physiologicalFunction || '',
        clinicalSignificance: structureData.clinicalSignificance || '',
        pathologyCommon: structureData.pathologyCommon || [],
        relatedStructures: structureData.relatedStructures || []
      },
      visualization: {
        meshId: structureData.meshId,
        geometry: structureData.geometry,
        boundingBox: structureData.boundingBox || { min: [0, 0, 0], max: [1, 1, 1] },
        levelOfDetail: structureData.levelOfDetail || 1
      }
    };
  }

  private setupDefaultViewConfigurations(): void {
    const configs: ViewConfiguration[] = [
      {
        id: 'anterior',
        name: 'Anterior View',
        description: 'Front view of anatomy',
        camera: {
          position: [0, 0, 5],
          target: [0, 0, 0],
          up: [0, 1, 0],
          fov: 45
        },
        lighting: {
          ambient: 0.3,
          directional: {
            direction: [0.5, -0.5, -1],
            intensity: 0.8,
            color: [1, 1, 1]
          },
          shadows: true
        },
        rendering: {
          style: 'realistic',
          quality: 'high',
          transparency: true,
          wireframe: false,
          crossSection: false
        }
      },
      {
        id: 'posterior',
        name: 'Posterior View',
        description: 'Back view of anatomy',
        camera: {
          position: [0, 0, -5],
          target: [0, 0, 0],
          up: [0, 1, 0],
          fov: 45
        },
        lighting: {
          ambient: 0.3,
          directional: {
            direction: [-0.5, -0.5, 1],
            intensity: 0.8,
            color: [1, 1, 1]
          },
          shadows: true
        },
        rendering: {
          style: 'realistic',
          quality: 'high',
          transparency: true,
          wireframe: false,
          crossSection: false
        }
      }
    ];

    configs.forEach(config => {
      this.viewConfigurations.set(config.id, config);
    });
  }

  private setupDefaultEducationalModes(): void {
    const modes: EducationalMode[] = [
      {
        id: 'basic-anatomy',
        name: 'Basic Human Anatomy',
        description: 'Introduction to human anatomy systems',
        targetLevel: 'beginner',
        focusAreas: ['skeletal', 'muscular', 'cardiovascular'],
        learningObjectives: [
          'Identify major anatomical systems',
          'Understand basic anatomical terminology',
          'Recognize key anatomical structures'
        ]
      },
      {
        id: 'medical-anatomy',
        name: 'Medical Anatomy',
        description: 'Advanced anatomy for medical students',
        targetLevel: 'advanced',
        focusAreas: ['nervous', 'cardiovascular', 'respiratory'],
        learningObjectives: [
          'Understand clinical anatomy',
          'Recognize anatomical variations',
          'Apply anatomy to clinical scenarios'
        ]
      }
    ];

    modes.forEach(mode => {
      this.educationalModes.set(mode.id, mode);
    });
  }
} 