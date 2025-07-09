/**
 * G3D MedSight Pro - Anatomy Visualization System
 * Advanced 3D anatomy rendering and visualization
 * 
 * Features:
 * - 3D anatomical structure rendering
 * - Interactive anatomy exploration
 * - Medical annotation systems
 * - Pathology visualization
 * - Educational anatomy tools
 * - Clinical reference integration
 */

import { vec3, mat4, quat } from 'gl-matrix';

// Anatomy Visualization Types
export interface G3DAnatomyConfig {
    renderingMode: 'realistic' | 'schematic' | 'educational' | 'diagnostic';
    detailLevel: 'overview' | 'system' | 'organ' | 'tissue' | 'cellular';
    interactionMode: 'exploration' | 'annotation' | 'measurement' | 'simulation';
    clinicalContext: 'education' | 'diagnosis' | 'surgery' | 'research';
}

export interface G3DAnatomicalStructure {
    id: string;
    name: string;
    type: 'organ' | 'system' | 'tissue' | 'vessel' | 'nerve' | 'bone' | 'muscle';
    category: 'cardiovascular' | 'respiratory' | 'nervous' | 'musculoskeletal' | 'digestive' | 'urogenital' | 'endocrine' | 'integumentary';
    geometry: G3DAnatomyGeometry;
    properties: G3DAnatomicalProperties;
    visualization: G3DVisualizationSettings;
    annotations: G3DAnatomyAnnotation[];
    relationships: G3DAnatomicalRelationship[];
    isVisible: boolean;
    opacity: number;
}

export interface G3DAnatomyGeometry {
    meshData: Float32Array;
    indices: Uint32Array;
    normals: Float32Array;
    texCoords: Float32Array;
    boundingBox: { min: vec3; max: vec3 };
    volume: number;
    surfaceArea: number;
    centerOfMass: vec3;
}

export interface G3DAnatomicalProperties {
    medicalData: {
        terminology: string; // Standard anatomical terminology
        function: string;
        pathologies: string[];
        clinicalSignificance: 'critical' | 'important' | 'moderate' | 'reference';
    };
    physicalProperties: {
        density: number;
        elasticity: number;
        conductivity: number;
        temperature: number;
        bloodFlow?: number;
        innervation?: string[];
    };
    developmentalData: {
        embryologicalOrigin: string;
        developmentalStage: string;
        ageRelatedChanges: string[];
    };
}

export interface G3DVisualizationSettings {
    colorScheme: 'anatomical' | 'functional' | 'pathological' | 'educational';
    transparency: number;
    highlighting: boolean;
    cutawayViews: G3DCutawayPlane[];
    labelVisibility: boolean;
    animationState: G3DAnimationState;
}

export interface G3DCutawayPlane {
    normal: vec3;
    position: vec3;
    enabled: boolean;
    fadeDistance: number;
}

export interface G3DAnimationState {
    type: 'static' | 'breathing' | 'heartbeat' | 'peristalsis' | 'custom';
    phase: number;
    speed: number;
    amplitude: number;
    enabled: boolean;
}

export interface G3DAnatomyAnnotation {
    id: string;
    type: 'label' | 'measurement' | 'pathology' | 'function' | 'reference';
    position: vec3;
    content: G3DAnnotationContent;
    style: G3DAnnotationStyle;
    visibility: boolean;
}

export interface G3DAnnotationContent {
    title: string;
    description: string;
    medicalTerms: string[];
    references: string[];
    multimedia?: {
        images?: string[];
        videos?: string[];
        audio?: string[];
    };
}

export interface G3DAnnotationStyle {
    labelColor: vec3;
    backgroundColor: vec3;
    fontSize: number;
    lineStyle: 'solid' | 'dashed' | 'dotted';
    arrowStyle: 'simple' | 'curved' | 'multi-segment';
    priority: number;
}

export interface G3DAnatomicalRelationship {
    targetStructureId: string;
    relationshipType: 'contains' | 'adjacentTo' | 'connectedTo' | 'innervates' | 'suppliedBy' | 'drainedBy';
    strength: number;
    description: string;
}

export interface G3DAnatomySystem {
    id: string;
    name: string;
    structures: string[]; // Structure IDs
    primaryFunction: string;
    interactions: G3DSystemInteraction[];
    visualizationPreset: string;
}

export interface G3DSystemInteraction {
    targetSystemId: string;
    interactionType: 'functional' | 'structural' | 'regulatory' | 'pathological';
    description: string;
    visualizationHints: string[];
}

// Advanced Anatomy Shader Templates
export class G3DAnatomyShaderTemplates {
    static readonly ANATOMY_VERTEX_SHADER = `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec3 a_normal;
    layout(location = 2) in vec2 a_texCoord;
    layout(location = 3) in vec3 a_anatomyData; // density, function, pathology
    
    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;
    uniform mat4 u_normalMatrix;
    uniform vec3 u_cameraPosition;
    uniform float u_time;
    
    // Animation uniforms
    uniform int u_animationType;
    uniform float u_animationPhase;
    uniform float u_animationAmplitude;
    
    out vec3 v_position;
    out vec3 v_normal;
    out vec2 v_texCoord;
    out vec3 v_anatomyData;
    out vec3 v_viewDir;
    out float v_distanceToCamera;
    
    // Animation functions
    vec3 applyBreathingAnimation(vec3 pos, vec3 normal) {
      float breathingFactor = sin(u_time * 0.5 + u_animationPhase) * u_animationAmplitude;
      return pos + normal * breathingFactor * 0.02; // 2cm max displacement
    }
    
    vec3 applyHeartbeatAnimation(vec3 pos) {
      float heartRate = 1.2; // 72 BPM
      float heartbeat = sin(u_time * heartRate + u_animationPhase) * u_animationAmplitude;
      float expansion = max(0.0, heartbeat) * 0.1; // 10% max expansion
      return pos * (1.0 + expansion);
    }
    
    vec3 applyPeristalsisAnimation(vec3 pos) {
      float wave = sin(pos.z * 5.0 + u_time * 2.0 + u_animationPhase) * u_animationAmplitude;
      return pos + vec3(wave * 0.01, 0.0, 0.0); // Lateral movement
    }
    
    void main() {
      vec3 animatedPosition = a_position;
      
      // Apply anatomical animations
      if (u_animationType == 1) { // Breathing
        animatedPosition = applyBreathingAnimation(animatedPosition, a_normal);
      } else if (u_animationType == 2) { // Heartbeat
        animatedPosition = applyHeartbeatAnimation(animatedPosition);
      } else if (u_animationType == 3) { // Peristalsis
        animatedPosition = applyPeristalsisAnimation(animatedPosition);
      }
      
      vec4 worldPosition = u_modelMatrix * vec4(animatedPosition, 1.0);
      vec4 viewPosition = u_viewMatrix * worldPosition;
      gl_Position = u_projectionMatrix * viewPosition;
      
      v_position = worldPosition.xyz;
      v_normal = normalize((u_normalMatrix * vec4(a_normal, 0.0)).xyz);
      v_texCoord = a_texCoord;
      v_anatomyData = a_anatomyData;
      v_viewDir = normalize(u_cameraPosition - worldPosition.xyz);
      v_distanceToCamera = length(u_cameraPosition - worldPosition.xyz);
    }
  `;

    static readonly ANATOMY_FRAGMENT_SHADER = `#version 300 es
    precision highp float;
    
    in vec3 v_position;
    in vec3 v_normal;
    in vec2 v_texCoord;
    in vec3 v_anatomyData;
    in vec3 v_viewDir;
    in float v_distanceToCamera;
    
    uniform sampler2D u_diffuseTexture;
    uniform sampler2D u_normalTexture;
    uniform sampler2D u_anatomyAtlas;
    
    // Visualization settings
    uniform int u_renderingMode; // 0: realistic, 1: schematic, 2: educational, 3: diagnostic
    uniform int u_colorScheme; // 0: anatomical, 1: functional, 2: pathological, 3: educational
    uniform float u_transparency;
    uniform bool u_highlighting;
    uniform vec3 u_highlightColor;
    uniform float u_highlightIntensity;
    
    // Cutaway planes
    uniform bool u_enableCutaway;
    uniform vec4 u_cutawayPlanes[4]; // normal.xyz, distance
    uniform bool u_cutawayEnabled[4];
    uniform float u_cutawayFade;
    
    // Lighting
    uniform vec3 u_lightDirection;
    uniform vec3 u_lightColor;
    uniform float u_ambientStrength;
    
    out vec4 fragColor;
    
    // Anatomical color schemes
    vec3 getAnatomicalColor(float structureType, float function, float pathology) {
      vec3 baseColor;
      
      if (u_colorScheme == 0) { // Anatomical
        // Standard anatomical colors
        if (structureType < 0.2) { // Bone
          baseColor = vec3(0.9, 0.9, 0.8);
        } else if (structureType < 0.4) { // Muscle
          baseColor = vec3(0.8, 0.3, 0.3);
        } else if (structureType < 0.6) { // Organ
          baseColor = vec3(0.7, 0.5, 0.4);
        } else if (structureType < 0.8) { // Vessel
          baseColor = vec3(0.9, 0.2, 0.2);
        } else { // Nerve
          baseColor = vec3(0.9, 0.9, 0.3);
        }
      } else if (u_colorScheme == 1) { // Functional
        // Color based on function
        baseColor = mix(vec3(0.2, 0.2, 0.8), vec3(0.8, 0.2, 0.2), function);
      } else if (u_colorScheme == 2) { // Pathological
        // Highlight pathological areas
        baseColor = mix(vec3(0.5, 0.5, 0.5), vec3(1.0, 0.0, 0.0), pathology);
      } else { // Educational
        // High contrast educational colors
        float hue = structureType * 6.0;
        baseColor = vec3(
          abs(sin(hue)),
          abs(sin(hue + 2.094)),
          abs(sin(hue + 4.188))
        );
      }
      
      return baseColor;
    }
    
    // Subsurface scattering for organic materials
    vec3 calculateSubsurfaceScattering(vec3 normal, vec3 lightDir, vec3 viewDir, vec3 baseColor) {
      float thickness = v_anatomyData.x; // Density as thickness proxy
      float backlight = max(0.0, dot(-lightDir, normal));
      float scattering = pow(backlight, 1.0 + thickness) * 0.5;
      return baseColor * scattering;
    }
    
    // Check cutaway planes
    float calculateCutawayFactor() {
      if (!u_enableCutaway) return 1.0;
      
      float cutawayFactor = 1.0;
      
      for (int i = 0; i < 4; i++) {
        if (u_cutawayEnabled[i]) {
          vec3 planeNormal = u_cutawayPlanes[i].xyz;
          float planeDistance = u_cutawayPlanes[i].w;
          float distance = dot(v_position, planeNormal) + planeDistance;
          
          if (distance < 0.0) {
            // Behind the cutaway plane
            cutawayFactor *= smoothstep(-u_cutawayFade, 0.0, distance);
          }
        }
      }
      
      return cutawayFactor;
    }
    
    // Level-of-detail based on distance
    float calculateLODFactor() {
      float lodDistance = 10.0; // Distance at which to reduce detail
      return smoothstep(lodDistance * 2.0, lodDistance, v_distanceToCamera);
    }
    
    void main() {
      // Check cutaway
      float cutawayFactor = calculateCutawayFactor();
      if (cutawayFactor < 0.01) {
        discard;
      }
      
      // Extract anatomy data
      float structureType = v_anatomyData.x;
      float functionValue = v_anatomyData.y;
      float pathologyValue = v_anatomyData.z;
      
      // Get base color
      vec3 baseColor = getAnatomicalColor(structureType, functionValue, pathologyValue);
      
      // Sample textures
      vec4 diffuse = texture(u_diffuseTexture, v_texCoord);
      vec3 normal = normalize(v_normal);
      
      // Apply texture modulation
      baseColor *= diffuse.rgb;
      
      // Lighting calculations
      vec3 lightDir = normalize(u_lightDirection);
      float NdotL = max(dot(normal, lightDir), 0.0);
      
      // Ambient component
      vec3 ambient = u_ambientStrength * baseColor;
      
      // Diffuse component
      vec3 diffuseContrib = baseColor * NdotL * u_lightColor;
      
      // Subsurface scattering for organic materials
      vec3 subsurfaceContrib = calculateSubsurfaceScattering(normal, lightDir, v_viewDir, baseColor);
      
      // Specular component (subtle for anatomy)
      vec3 halfVector = normalize(lightDir + v_viewDir);
      float NdotH = max(dot(normal, halfVector), 0.0);
      vec3 specular = vec3(0.1) * pow(NdotH, 32.0);
      
      // Combine lighting
      vec3 finalColor = ambient + diffuseContrib + subsurfaceContrib * 0.3 + specular;
      
      // Apply highlighting
      if (u_highlighting) {
        float highlightMask = sin(gl_FragCoord.x * 0.1) * sin(gl_FragCoord.y * 0.1);
        finalColor = mix(finalColor, u_highlightColor, highlightMask * u_highlightIntensity);
      }
      
      // Pathology highlighting
      if (pathologyValue > 0.1) {
        finalColor = mix(finalColor, vec3(1.0, 0.5, 0.0), pathologyValue * 0.5);
      }
      
      // Apply rendering mode adjustments
      if (u_renderingMode == 1) { // Schematic
        finalColor = floor(finalColor * 4.0) / 4.0; // Posterize
      } else if (u_renderingMode == 2) { // Educational
        finalColor = pow(finalColor, vec3(0.7)); // Increase contrast
      } else if (u_renderingMode == 3) { // Diagnostic
        // Enhance edge definition
        float edge = 1.0 - abs(dot(normal, v_viewDir));
        finalColor += vec3(edge * 0.2);
      }
      
      // Apply cutaway fading
      finalColor *= cutawayFactor;
      
      // Calculate final alpha
      float alpha = u_transparency * cutawayFactor * diffuse.a;
      
      fragColor = vec4(finalColor, alpha);
    }
  `;
}

// Main Anatomy Visualization System
export class G3DAnatomyVisualization {
    private config: G3DAnatomyConfig;
    private gl: WebGL2RenderingContext;
    private anatomyProgram: WebGLProgram | null = null;
    private structures: Map<string, G3DAnatomicalStructure> = new Map();
    private systems: Map<string, G3DAnatomySystem> = new Map();
    private annotations: Map<string, G3DAnatomyAnnotation> = new Map();
    private currentSystem: string | null = null;
    private isInitialized: boolean = false;

    constructor(gl: WebGL2RenderingContext, config: Partial<G3DAnatomyConfig> = {}) {
        this.gl = gl;
        this.config = {
            renderingMode: 'realistic',
            detailLevel: 'organ',
            interactionMode: 'exploration',
            clinicalContext: 'education',
            ...config
        };
    }

    async initialize(): Promise<void> {
        try {
            await this.compileShaders();
            await this.loadAnatomicalData();
            this.setupAnatomySystems();
            this.isInitialized = true;
            console.log('G3D Anatomy Visualization initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Anatomy Visualization:', error);
            throw error;
        }
    }

    private async compileShaders(): Promise<void> {
        const vertexShader = this.compileShader(
            G3DAnatomyShaderTemplates.ANATOMY_VERTEX_SHADER,
            this.gl.VERTEX_SHADER
        );

        const fragmentShader = this.compileShader(
            G3DAnatomyShaderTemplates.ANATOMY_FRAGMENT_SHADER,
            this.gl.FRAGMENT_SHADER
        );

        this.anatomyProgram = this.gl.createProgram()!;
        this.gl.attachShader(this.anatomyProgram, vertexShader);
        this.gl.attachShader(this.anatomyProgram, fragmentShader);
        this.gl.linkProgram(this.anatomyProgram);

        if (!this.gl.getProgramParameter(this.anatomyProgram, this.gl.LINK_STATUS)) {
            throw new Error('Anatomy shader linking failed: ' + this.gl.getProgramInfoLog(this.anatomyProgram));
        }
    }

    private compileShader(source: string, type: number): WebGLShader {
        const shader = this.gl.createShader(type)!;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error('Anatomy shader compilation failed: ' + this.gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    private async loadAnatomicalData(): Promise<void> {
        // Load standard anatomical structures
        await this.createStandardStructures();
    }

    private async createStandardStructures(): Promise<void> {
        // Heart structure
        const heart = this.createAnatomicalStructure({
            id: 'heart',
            name: 'Heart',
            type: 'organ',
            category: 'cardiovascular',
            medicalData: {
                terminology: 'Cor (Heart)',
                function: 'Pumps blood throughout the circulatory system',
                pathologies: ['Myocardial infarction', 'Cardiomyopathy', 'Arrhythmia'],
                clinicalSignificance: 'critical'
            },
            physicalProperties: {
                density: 1.06,
                elasticity: 0.8,
                conductivity: 0.2,
                temperature: 37.0,
                bloodFlow: 5000 // ml/min
            }
        });

        // Lungs structure
        const lungs = this.createAnatomicalStructure({
            id: 'lungs',
            name: 'Lungs',
            type: 'organ',
            category: 'respiratory',
            medicalData: {
                terminology: 'Pulmones (Lungs)',
                function: 'Gas exchange between air and blood',
                pathologies: ['Pneumonia', 'COPD', 'Lung cancer'],
                clinicalSignificance: 'critical'
            },
            physicalProperties: {
                density: 0.4,
                elasticity: 0.9,
                conductivity: 0.1,
                temperature: 37.0
            }
        });

        // Brain structure
        const brain = this.createAnatomicalStructure({
            id: 'brain',
            name: 'Brain',
            type: 'organ',
            category: 'nervous',
            medicalData: {
                terminology: 'Encephalon (Brain)',
                function: 'Central nervous system control and cognition',
                pathologies: ['Stroke', 'Alzheimer\'s disease', 'Brain tumor'],
                clinicalSignificance: 'critical'
            },
            physicalProperties: {
                density: 1.04,
                elasticity: 0.3,
                conductivity: 0.5,
                temperature: 37.0
            }
        });

        this.structures.set(heart.id, heart);
        this.structures.set(lungs.id, lungs);
        this.structures.set(brain.id, brain);
    }

    private createAnatomicalStructure(config: {
        id: string;
        name: string;
        type: G3DAnatomicalStructure['type'];
        category: G3DAnatomicalStructure['category'];
        medicalData: G3DAnatomicalProperties['medicalData'];
        physicalProperties: G3DAnatomicalProperties['physicalProperties'];
    }): G3DAnatomicalStructure {
        // Generate basic geometry (in real implementation, this would load from medical atlases)
        const geometry = this.generateBasicGeometry(config.type);

        const structure: G3DAnatomicalStructure = {
            id: config.id,
            name: config.name,
            type: config.type,
            category: config.category,
            geometry,
            properties: {
                medicalData: config.medicalData,
                physicalProperties: config.physicalProperties,
                developmentalData: {
                    embryologicalOrigin: 'Mesoderm', // Simplified
                    developmentalStage: 'Adult',
                    ageRelatedChanges: []
                }
            },
            visualization: {
                colorScheme: 'anatomical',
                transparency: 1.0,
                highlighting: false,
                cutawayViews: [],
                labelVisibility: true,
                animationState: {
                    type: 'static',
                    phase: 0,
                    speed: 1.0,
                    amplitude: 1.0,
                    enabled: false
                }
            },
            annotations: [],
            relationships: [],
            isVisible: true,
            opacity: 1.0
        };

        return structure;
    }

    private generateBasicGeometry(type: string): G3DAnatomyGeometry {
        // Simplified geometry generation - in real implementation, load from medical atlases
        const vertices = new Float32Array([
            -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, // Front face
            -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1  // Back face
        ]);

        const indices = new Uint32Array([
            0, 1, 2, 0, 2, 3, // Front
            4, 5, 6, 4, 6, 7  // Back
        ]);

        const normals = new Float32Array([
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
        ]);

        const texCoords = new Float32Array([
            0, 0, 1, 0, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 0, 1
        ]);

        return {
            meshData: vertices,
            indices,
            normals,
            texCoords,
            boundingBox: {
                min: vec3.fromValues(-1, -1, -1),
                max: vec3.fromValues(1, 1, 1)
            },
            volume: 8.0,
            surfaceArea: 24.0,
            centerOfMass: vec3.fromValues(0, 0, 0)
        };
    }

    private setupAnatomySystems(): void {
        // Cardiovascular system
        this.systems.set('cardiovascular', {
            id: 'cardiovascular',
            name: 'Cardiovascular System',
            structures: ['heart'], // Add more structures as they're created
            primaryFunction: 'Circulation of blood and nutrients',
            interactions: [],
            visualizationPreset: 'cardiovascular'
        });

        // Respiratory system
        this.systems.set('respiratory', {
            id: 'respiratory',
            name: 'Respiratory System',
            structures: ['lungs'],
            primaryFunction: 'Gas exchange and breathing',
            interactions: [],
            visualizationPreset: 'respiratory'
        });

        // Nervous system
        this.systems.set('nervous', {
            id: 'nervous',
            name: 'Nervous System',
            structures: ['brain'],
            primaryFunction: 'Control and coordination',
            interactions: [],
            visualizationPreset: 'nervous'
        });
    }

    loadAnatomicalSystem(systemId: string): boolean {
        const system = this.systems.get(systemId);
        if (!system) {
            console.warn(`Anatomy system ${systemId} not found`);
            return false;
        }

        this.currentSystem = systemId;

        // Show only structures in this system
        this.structures.forEach((structure, id) => {
            structure.isVisible = system.structures.includes(id);
        });

        console.log(`Loaded anatomy system: ${system.name}`);
        return true;
    }

    addAnnotation(structureId: string, annotation: Omit<G3DAnatomyAnnotation, 'id'>): string {
        const structure = this.structures.get(structureId);
        if (!structure) {
            throw new Error(`Structure ${structureId} not found`);
        }

        const annotationId = `annotation_${Date.now()}_${Math.random()}`;
        const fullAnnotation: G3DAnatomyAnnotation = {
            id: annotationId,
            ...annotation
        };

        structure.annotations.push(fullAnnotation);
        this.annotations.set(annotationId, fullAnnotation);

        return annotationId;
    }

    highlightStructure(structureId: string, highlight: boolean = true): void {
        const structure = this.structures.get(structureId);
        if (structure) {
            structure.visualization.highlighting = highlight;
        }
    }

    setStructureAnimation(structureId: string, animationType: G3DAnimationState['type']): void {
        const structure = this.structures.get(structureId);
        if (structure) {
            structure.visualization.animationState.type = animationType;
            structure.visualization.animationState.enabled = animationType !== 'static';
        }
    }

    applyCutawayPlane(structureId: string, plane: G3DCutawayPlane): void {
        const structure = this.structures.get(structureId);
        if (structure) {
            structure.visualization.cutawayViews.push(plane);
        }
    }

    setVisualizationMode(mode: G3DAnatomyConfig['renderingMode']): void {
        this.config.renderingMode = mode;
        console.log(`Set anatomy visualization mode: ${mode}`);
    }

    setColorScheme(scheme: G3DVisualizationSettings['colorScheme']): void {
        this.structures.forEach(structure => {
            structure.visualization.colorScheme = scheme;
        });
    }

    render(viewMatrix: mat4, projectionMatrix: mat4): void {
        if (!this.isInitialized || !this.anatomyProgram) {
            console.warn('Cannot render: anatomy visualization not initialized');
            return;
        }

        this.gl.useProgram(this.anatomyProgram);

        // Set common uniforms
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.anatomyProgram, 'u_viewMatrix'), false, viewMatrix);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.anatomyProgram, 'u_projectionMatrix'), false, projectionMatrix);

        // Render visible structures
        this.structures.forEach(structure => {
            if (structure.isVisible) {
                this.renderStructure(structure);
            }
        });

        this.gl.useProgram(null);
    }

    private renderStructure(structure: G3DAnatomicalStructure): void {
        const program = this.anatomyProgram!;

        // Set structure-specific uniforms
        const modelMatrix = mat4.create();
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(program, 'u_modelMatrix'), false, modelMatrix);

        // Set visualization parameters
        const renderingModeMap = { 'realistic': 0, 'schematic': 1, 'educational': 2, 'diagnostic': 3 };
        this.gl.uniform1i(this.gl.getUniformLocation(program, 'u_renderingMode'),
            renderingModeMap[this.config.renderingMode]);

        const colorSchemeMap = { 'anatomical': 0, 'functional': 1, 'pathological': 2, 'educational': 3 };
        this.gl.uniform1i(this.gl.getUniformLocation(program, 'u_colorScheme'),
            colorSchemeMap[structure.visualization.colorScheme]);

        this.gl.uniform1f(this.gl.getUniformLocation(program, 'u_transparency'), structure.opacity);
        this.gl.uniform1i(this.gl.getUniformLocation(program, 'u_highlighting'), structure.visualization.highlighting ? 1 : 0);

        // Set animation parameters
        const animationTypeMap = { 'static': 0, 'breathing': 1, 'heartbeat': 2, 'peristalsis': 3, 'custom': 4 };
        this.gl.uniform1i(this.gl.getUniformLocation(program, 'u_animationType'),
            animationTypeMap[structure.visualization.animationState.type]);
        this.gl.uniform1f(this.gl.getUniformLocation(program, 'u_animationPhase'), structure.visualization.animationState.phase);
        this.gl.uniform1f(this.gl.getUniformLocation(program, 'u_animationAmplitude'), structure.visualization.animationState.amplitude);

        // Render geometry (simplified - would use proper VAO/VBO setup)
        // In real implementation, this would properly bind and render the structure's geometry
    }

    getStructure(structureId: string): G3DAnatomicalStructure | undefined {
        return this.structures.get(structureId);
    }

    getSystem(systemId: string): G3DAnatomySystem | undefined {
        return this.systems.get(systemId);
    }

    getAllStructures(): G3DAnatomicalStructure[] {
        return Array.from(this.structures.values());
    }

    getAllSystems(): G3DAnatomySystem[] {
        return Array.from(this.systems.values());
    }

    searchStructures(query: string): G3DAnatomicalStructure[] {
        const results: G3DAnatomicalStructure[] = [];
        const lowerQuery = query.toLowerCase();

        this.structures.forEach(structure => {
            if (structure.name.toLowerCase().includes(lowerQuery) ||
                structure.properties.medicalData.terminology.toLowerCase().includes(lowerQuery) ||
                structure.properties.medicalData.function.toLowerCase().includes(lowerQuery)) {
                results.push(structure);
            }
        });

        return results;
    }

    getAnatomyMetrics(): object {
        return {
            config: this.config,
            isInitialized: this.isInitialized,
            structureCount: this.structures.size,
            systemCount: this.systems.size,
            annotationCount: this.annotations.size,
            currentSystem: this.currentSystem,
            visibleStructures: Array.from(this.structures.values()).filter(s => s.isVisible).length
        };
    }

    dispose(): void {
        if (this.anatomyProgram) {
            this.gl.deleteProgram(this.anatomyProgram);
        }

        this.structures.clear();
        this.systems.clear();
        this.annotations.clear();
        this.currentSystem = null;
        this.isInitialized = false;

        console.log('G3D Anatomy Visualization disposed');
    }
}

export default G3DAnatomyVisualization;