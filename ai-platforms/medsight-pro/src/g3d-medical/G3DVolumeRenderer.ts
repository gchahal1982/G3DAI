/**
 * G3D MedSight Pro - Advanced Volume Renderer
 * GPU-accelerated volumetric medical imaging system
 * 
 * Features:
 * - Advanced ray marching for volume rendering
 * - GPU-accelerated volume processing
 * - Medical-specific transfer functions
 * - Multi-modal volume support (CT, MRI, PET, etc.)
 * - Real-time volume manipulation
 * - Clinical-grade rendering quality
 */

import { vec3, mat4, quat } from 'gl-matrix';

// Volume Rendering Types
export interface VolumeRenderingConfig {
    renderingTechnique: 'raycasting' | 'slicing' | 'splatting' | 'hybrid';
    samplingRate: number;
    qualityLevel: 'draft' | 'standard' | 'high' | 'ultra';
    enableGradientShading: boolean;
    enableAdaptiveSampling: boolean;
    medicalOptimizations: boolean;
    gpuAcceleration: boolean;
}

export interface VolumeData {
    id: string;
    dimensions: vec3;
    spacing: vec3;
    origin: vec3;
    data: ArrayBuffer;
    dataType: 'uint8' | 'uint16' | 'int16' | 'float32';
    modality: 'CT' | 'MRI' | 'PET' | 'SPECT' | 'US' | 'XR' | 'MG' | 'OTHER';
    windowLevel: number;
    windowWidth: number;
    rescaleSlope: number;
    rescaleIntercept: number;
    metadata: VolumeMetadata;
}

export interface VolumeMetadata {
    patientInfo: {
        id: string;
        name?: string;
        age?: number;
        sex?: 'M' | 'F' | 'O';
    };
    studyInfo: {
        studyInstanceUID: string;
        seriesInstanceUID: string;
        studyDate: Date;
        modality: string;
        bodyPart: string;
    };
    acquisitionInfo: {
        sliceThickness: number;
        pixelSpacing: vec3;
        imageOrientation: number[];
        imagePosition: vec3;
        kvp?: number;
        mas?: number;
        contrastAgent?: boolean;
    };
}

export interface TransferFunction {
    id: string;
    name: string;
    colorPoints: ColorPoint[];
    opacityPoints: OpacityPoint[];
    medicalPreset?: 'bone' | 'soft_tissue' | 'lung' | 'vessel' | 'brain' | 'custom';
}

export interface ColorPoint {
    value: number;
    color: vec3;
}

export interface OpacityPoint {
    value: number;
    opacity: number;
}

export interface VolumeRenderingState {
    viewMatrix: mat4;
    projectionMatrix: mat4;
    volumeMatrix: mat4;
    lightDirection: vec3;
    lightColor: vec3;
    ambientStrength: number;
    stepSize: number;
    maxSteps: number;
    isoValue: number;
    enableClipping: boolean;
    clippingPlanes: ClippingPlane[];
}

export interface ClippingPlane {
    normal: vec3;
    distance: number;
    enabled: boolean;
}

// Advanced Volume Rendering Shaders
export class VolumeShaderManager {
    private static readonly VOLUME_VERTEX_SHADER = `#version 300 es
    precision highp float;
    
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec3 a_texCoord;
    
    uniform mat4 u_mvpMatrix;
    uniform mat4 u_volumeMatrix;
    uniform vec3 u_volumeDimensions;
    uniform vec3 u_volumeSpacing;
    
    out vec3 v_rayStart;
    out vec3 v_rayDirection;
    out vec3 v_texCoord;
    out vec3 v_worldPosition;
    
    void main() {
      vec4 worldPos = u_volumeMatrix * vec4(a_position, 1.0);
      gl_Position = u_mvpMatrix * worldPos;
      
      v_worldPosition = worldPos.xyz;
      v_texCoord = a_texCoord;
      
      // Calculate ray start and direction for volume ray casting
      vec3 cameraPos = (inverse(u_mvpMatrix) * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
      v_rayStart = cameraPos;
      v_rayDirection = normalize(worldPos.xyz - cameraPos);
    }
  `;

    private static readonly VOLUME_FRAGMENT_SHADER = `#version 300 es
    precision highp float;
    
    in vec3 v_rayStart;
    in vec3 v_rayDirection;
    in vec3 v_texCoord;
    in vec3 v_worldPosition;
    
    uniform sampler3D u_volumeTexture;
    uniform sampler2D u_transferFunction;
    uniform sampler2D u_gradientTexture;
    
    uniform vec3 u_volumeDimensions;
    uniform vec3 u_volumeSpacing;
    uniform vec3 u_volumeOrigin;
    uniform float u_stepSize;
    uniform int u_maxSteps;
    uniform float u_windowLevel;
    uniform float u_windowWidth;
    uniform float u_rescaleSlope;
    uniform float u_rescaleIntercept;
    uniform vec3 u_lightDirection;
    uniform vec3 u_lightColor;
    uniform float u_ambientStrength;
    uniform bool u_enableGradientShading;
    uniform bool u_enableAdaptiveSampling;
    uniform float u_isoValue;
    uniform int u_renderingMode; // 0: DVR, 1: MIP, 2: MinIP, 3: Isosurface
    
    // Clipping planes
    uniform bool u_enableClipping;
    uniform vec4 u_clippingPlanes[6]; // normal.xyz, distance
    uniform bool u_clippingEnabled[6];
    
    out vec4 fragColor;
    
    // Medical windowing function
    float applyMedicalWindowing(float rawValue) {
      // Apply rescale slope and intercept (DICOM standard)
      float hounsfield = rawValue * u_rescaleSlope + u_rescaleIntercept;
      
      // Apply window/level
      float center = u_windowLevel;
      float width = u_windowWidth;
      float lower = center - width * 0.5;
      float upper = center + width * 0.5;
      
      return clamp((hounsfield - lower) / width, 0.0, 1.0);
    }
    
    // Calculate gradient for lighting
    vec3 calculateGradient(vec3 coord, float delta) {
      vec3 gradient;
      gradient.x = texture(u_volumeTexture, coord + vec3(delta, 0.0, 0.0)).r
                 - texture(u_volumeTexture, coord - vec3(delta, 0.0, 0.0)).r;
      gradient.y = texture(u_volumeTexture, coord + vec3(0.0, delta, 0.0)).r
                 - texture(u_volumeTexture, coord - vec3(0.0, delta, 0.0)).r;
      gradient.z = texture(u_volumeTexture, coord + vec3(0.0, 0.0, delta)).r
                 - texture(u_volumeTexture, coord - vec3(0.0, 0.0, delta)).r;
      return normalize(gradient * u_volumeSpacing);
    }
    
    // Medical lighting model
    vec3 calculateMedicalLighting(vec3 normal, vec3 viewDir, vec3 color) {
      vec3 lightDir = normalize(u_lightDirection);
      
      // Ambient
      vec3 ambient = u_ambientStrength * color;
      
      // Diffuse with medical enhancement
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = diff * u_lightColor * color;
      
      // Specular for tissue highlighting
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
      vec3 specular = 0.3 * spec * u_lightColor;
      
      return ambient + diffuse + specular;
    }
    
    // Check clipping planes
    bool isClipped(vec3 worldPos) {
      if (!u_enableClipping) return false;
      
      for (int i = 0; i < 6; i++) {
        if (u_clippingEnabled[i]) {
          vec3 planeNormal = u_clippingPlanes[i].xyz;
          float planeDistance = u_clippingPlanes[i].w;
          if (dot(worldPos, planeNormal) + planeDistance < 0.0) {
            return true;
          }
        }
      }
      return false;
    }
    
    // Adaptive sampling based on gradient magnitude
    float getAdaptiveStepSize(vec3 coord) {
      if (!u_enableAdaptiveSampling) return u_stepSize;
      
      vec3 gradient = calculateGradient(coord, 1.0 / max(u_volumeDimensions.x, max(u_volumeDimensions.y, u_volumeDimensions.z)));
      float gradientMagnitude = length(gradient);
      
      // Smaller steps in high gradient areas (edges)
      float adaptiveFactor = 1.0 / (1.0 + gradientMagnitude * 10.0);
      return u_stepSize * mix(0.5, 1.0, adaptiveFactor);
    }
    
    void main() {
      vec3 rayDir = normalize(v_rayDirection);
      vec3 rayPos = v_rayStart;
      
      // Ray-volume intersection
      vec3 volumeMin = u_volumeOrigin;
      vec3 volumeMax = u_volumeOrigin + u_volumeDimensions * u_volumeSpacing;
      
      // Calculate intersection with volume bounding box
      vec3 invRayDir = 1.0 / rayDir;
      vec3 t1 = (volumeMin - rayPos) * invRayDir;
      vec3 t2 = (volumeMax - rayPos) * invRayDir;
      
      vec3 tMin = min(t1, t2);
      vec3 tMax = max(t1, t2);
      
      float tNear = max(max(tMin.x, tMin.y), tMin.z);
      float tFar = min(min(tMax.x, tMax.y), tMax.z);
      
      if (tNear > tFar || tFar < 0.0) {
        discard;
      }
      
      // Start ray marching
      tNear = max(tNear, 0.0);
      vec3 currentPos = rayPos + rayDir * tNear;
      float t = tNear;
      
      vec4 accumColor = vec4(0.0);
      float maxIntensity = 0.0;
      float minIntensity = 1.0;
      
      for (int i = 0; i < u_maxSteps && t < tFar; i++) {
        // Convert world position to texture coordinates
        vec3 texCoord = (currentPos - u_volumeOrigin) / (u_volumeDimensions * u_volumeSpacing);
        
        if (texCoord.x >= 0.0 && texCoord.x <= 1.0 &&
            texCoord.y >= 0.0 && texCoord.y <= 1.0 &&
            texCoord.z >= 0.0 && texCoord.z <= 1.0) {
          
          // Check clipping
          if (!isClipped(currentPos)) {
            float rawIntensity = texture(u_volumeTexture, texCoord).r;
            float intensity = applyMedicalWindowing(rawIntensity);
            
            if (u_renderingMode == 0) {
              // Direct Volume Rendering (DVR)
              vec4 transferValue = texture(u_transferFunction, vec2(intensity, 0.5));
              
              if (transferValue.a > 0.01) {
                vec3 color = transferValue.rgb;
                float alpha = transferValue.a;
                
                if (u_enableGradientShading) {
                  vec3 gradient = calculateGradient(texCoord, 1.0 / max(u_volumeDimensions.x, max(u_volumeDimensions.y, u_volumeDimensions.z)));
                  if (length(gradient) > 0.1) {
                    vec3 viewDir = normalize(-rayDir);
                    color = calculateMedicalLighting(gradient, viewDir, color);
                  }
                }
                
                // Front-to-back compositing
                alpha = alpha * (1.0 - accumColor.a);
                accumColor.rgb += color * alpha;
                accumColor.a += alpha;
                
                if (accumColor.a >= 0.95) break; // Early ray termination
              }
            } else if (u_renderingMode == 1) {
              // Maximum Intensity Projection (MIP)
              maxIntensity = max(maxIntensity, intensity);
            } else if (u_renderingMode == 2) {
              // Minimum Intensity Projection (MinIP)
              minIntensity = min(minIntensity, intensity);
            } else if (u_renderingMode == 3) {
              // Isosurface Rendering
              if (abs(intensity - u_isoValue) < 0.01) {
                vec3 gradient = calculateGradient(texCoord, 1.0 / max(u_volumeDimensions.x, max(u_volumeDimensions.y, u_volumeDimensions.z)));
                if (length(gradient) > 0.1) {
                  vec3 viewDir = normalize(-rayDir);
                  vec3 color = vec3(intensity);
                  accumColor.rgb = calculateMedicalLighting(gradient, viewDir, color);
                  accumColor.a = 1.0;
                  break;
                }
              }
            }
          }
        }
        
        // Advance ray
        float stepSize = getAdaptiveStepSize(texCoord);
        currentPos += rayDir * stepSize;
        t += stepSize;
      }
      
      // Output final color based on rendering mode
      if (u_renderingMode == 1) {
        // MIP
        vec4 transferValue = texture(u_transferFunction, vec2(maxIntensity, 0.5));
        fragColor = vec4(transferValue.rgb, 1.0);
      } else if (u_renderingMode == 2) {
        // MinIP
        vec4 transferValue = texture(u_transferFunction, vec2(minIntensity, 0.5));
        fragColor = vec4(transferValue.rgb, 1.0);
      } else {
        // DVR or Isosurface
        fragColor = accumColor;
      }
      
      // Ensure medical-appropriate output
      fragColor.rgb = clamp(fragColor.rgb, 0.0, 1.0);
      fragColor.a = clamp(fragColor.a, 0.0, 1.0);
    }
  `;

    constructor(private gl: WebGL2RenderingContext) { }

    createVolumeProgram(): WebGLProgram {
        const vertexShader = this.compileShader(VolumeShaderManager.VOLUME_VERTEX_SHADER, this.gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(VolumeShaderManager.VOLUME_FRAGMENT_SHADER, this.gl.FRAGMENT_SHADER);

        const program = this.gl.createProgram()!;
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            throw new Error('Volume shader program linking failed: ' + this.gl.getProgramInfoLog(program));
        }

        return program;
    }

    private compileShader(source: string, type: number): WebGLShader {
        const shader = this.gl.createShader(type)!;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error('Volume shader compilation failed: ' + this.gl.getShaderInfoLog(shader));
        }

        return shader;
    }
}

// Main Volume Renderer Class
export class VolumeRenderer {
    private config: VolumeRenderingConfig;
    private gl: WebGL2RenderingContext;
    private shaderManager: VolumeShaderManager;
    private volumeProgram: WebGLProgram | null = null;
    private volumeTextures: Map<string, WebGLTexture> = new Map();
    private transferFunctions: Map<string, WebGLTexture> = new Map();
    private gradientTextures: Map<string, WebGLTexture> = new Map();
    private volumeGeometry: WebGLVertexArrayObject | null = null;
    private renderingState: VolumeRenderingState;
    private isInitialized: boolean = false;

    constructor(gl: WebGL2RenderingContext, config: Partial<VolumeRenderingConfig> = {}) {
        this.gl = gl;
        this.config = {
            renderingTechnique: 'raycasting',
            samplingRate: 1.0,
            qualityLevel: 'high',
            enableGradientShading: true,
            enableAdaptiveSampling: true,
            medicalOptimizations: true,
            gpuAcceleration: true,
            ...config
        };

        this.shaderManager = new VolumeShaderManager(gl);
        this.renderingState = {
            viewMatrix: mat4.create(),
            projectionMatrix: mat4.create(),
            volumeMatrix: mat4.create(),
            lightDirection: vec3.fromValues(0.5, 0.5, 1.0),
            lightColor: vec3.fromValues(1.0, 1.0, 1.0),
            ambientStrength: 0.2,
            stepSize: 0.01,
            maxSteps: 512,
            isoValue: 0.5,
            enableClipping: false,
            clippingPlanes: []
        };
    }

    async initialize(): Promise<void> {
        try {
            this.volumeProgram = this.shaderManager.createVolumeProgram();
            this.createVolumeGeometry();
            this.setupMedicalPresets();
            this.isInitialized = true;
            console.log('G3D Volume Renderer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Volume Renderer:', error);
            throw error;
        }
    }

    private createVolumeGeometry(): void {
        // Create cube geometry for volume rendering
        const vertices = new Float32Array([
            // Front face
            -1, -1, 1, 0, 0, 1,
            1, -1, 1, 1, 0, 1,
            1, 1, 1, 1, 1, 1,
            -1, 1, 1, 0, 1, 1,

            // Back face
            -1, -1, -1, 0, 0, 0,
            -1, 1, -1, 0, 1, 0,
            1, 1, -1, 1, 1, 0,
            1, -1, -1, 1, 0, 0,

            // Top face
            -1, 1, -1, 0, 1, 0,
            -1, 1, 1, 0, 1, 1,
            1, 1, 1, 1, 1, 1,
            1, 1, -1, 1, 1, 0,

            // Bottom face
            -1, -1, -1, 0, 0, 0,
            1, -1, -1, 1, 0, 0,
            1, -1, 1, 1, 0, 1,
            -1, -1, 1, 0, 0, 1,

            // Right face
            1, -1, -1, 1, 0, 0,
            1, 1, -1, 1, 1, 0,
            1, 1, 1, 1, 1, 1,
            1, -1, 1, 1, 0, 1,

            // Left face
            -1, -1, -1, 0, 0, 0,
            -1, -1, 1, 0, 0, 1,
            -1, 1, 1, 0, 1, 1,
            -1, 1, -1, 0, 1, 0
        ]);

        const indices = new Uint16Array([
            0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // back
            8, 9, 10, 8, 10, 11,   // top
            12, 13, 14, 12, 14, 15,   // bottom
            16, 17, 18, 16, 18, 19,   // right
            20, 21, 22, 20, 22, 23    // left
        ]);

        this.volumeGeometry = this.gl.createVertexArray()!;
        this.gl.bindVertexArray(this.volumeGeometry);

        // Vertex buffer
        const vertexBuffer = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        // Position attribute
        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 24, 0);

        // Texture coordinate attribute
        this.gl.enableVertexAttribArray(1);
        this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 24, 12);

        // Index buffer
        const indexBuffer = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

        this.gl.bindVertexArray(null);
    }

    async loadVolumeData(volumeData: VolumeData): Promise<string> {
        if (!this.isInitialized) {
            throw new Error('Volume renderer not initialized');
        }

        const texture = this.createVolumeTexture(volumeData);
        this.volumeTextures.set(volumeData.id, texture);

        // Generate gradient texture for lighting
        if (this.config.enableGradientShading) {
            const gradientTexture = this.generateGradientTexture(volumeData);
            this.gradientTextures.set(volumeData.id, gradientTexture);
        }

        console.log(`Volume data loaded: ${volumeData.id} (${volumeData.dimensions[0]}x${volumeData.dimensions[1]}x${volumeData.dimensions[2]})`);
        return volumeData.id;
    }

    private createVolumeTexture(volumeData: VolumeData): WebGLTexture {
        const texture = this.gl.createTexture()!;
        this.gl.bindTexture(this.gl.TEXTURE_3D, texture);

        let internalFormat: number;
        let format: number;
        let type: number;
        let data: ArrayBufferView;

        switch (volumeData.dataType) {
            case 'uint8':
                internalFormat = this.gl.R8;
                format = this.gl.RED;
                type = this.gl.UNSIGNED_BYTE;
                data = new Uint8Array(volumeData.data);
                break;
            case 'uint16':
                internalFormat = this.gl.R16UI;
                format = this.gl.RED_INTEGER;
                type = this.gl.UNSIGNED_SHORT;
                data = new Uint16Array(volumeData.data);
                break;
            case 'int16':
                internalFormat = this.gl.R16I;
                format = this.gl.RED_INTEGER;
                type = this.gl.SHORT;
                data = new Int16Array(volumeData.data);
                break;
            case 'float32':
                internalFormat = this.gl.R32F;
                format = this.gl.RED;
                type = this.gl.FLOAT;
                data = new Float32Array(volumeData.data);
                break;
        }

        this.gl.texImage3D(
            this.gl.TEXTURE_3D,
            0,
            internalFormat,
            volumeData.dimensions[0],
            volumeData.dimensions[1],
            volumeData.dimensions[2],
            0,
            format,
            type,
            data
        );

        // Set medical-appropriate filtering
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_R, this.gl.CLAMP_TO_EDGE);

        return texture;
    }

    private generateGradientTexture(volumeData: VolumeData): WebGLTexture {
        // Generate gradient texture for enhanced lighting
        const dims = volumeData.dimensions;
        const gradientData = new Float32Array(dims[0] * dims[1] * dims[2] * 3);

        // Calculate gradients using central differences
        const originalData = new Float32Array(volumeData.data);

        for (let z = 0; z < dims[2]; z++) {
            for (let y = 0; y < dims[1]; y++) {
                for (let x = 0; x < dims[0]; x++) {
                    const index = (z * dims[1] * dims[0] + y * dims[0] + x) * 3;

                    // X gradient
                    const xPrev = Math.max(0, x - 1);
                    const xNext = Math.min(dims[0] - 1, x + 1);
                    const gx = originalData[z * dims[1] * dims[0] + y * dims[0] + xNext] -
                        originalData[z * dims[1] * dims[0] + y * dims[0] + xPrev];

                    // Y gradient
                    const yPrev = Math.max(0, y - 1);
                    const yNext = Math.min(dims[1] - 1, y + 1);
                    const gy = originalData[z * dims[1] * dims[0] + yNext * dims[0] + x] -
                        originalData[z * dims[1] * dims[0] + yPrev * dims[0] + x];

                    // Z gradient
                    const zPrev = Math.max(0, z - 1);
                    const zNext = Math.min(dims[2] - 1, z + 1);
                    const gz = originalData[zNext * dims[1] * dims[0] + y * dims[0] + x] -
                        originalData[zPrev * dims[1] * dims[0] + y * dims[0] + x];

                    gradientData[index] = gx * 0.5 + 0.5;
                    gradientData[index + 1] = gy * 0.5 + 0.5;
                    gradientData[index + 2] = gz * 0.5 + 0.5;
                }
            }
        }

        const texture = this.gl.createTexture()!;
        this.gl.bindTexture(this.gl.TEXTURE_3D, texture);
        this.gl.texImage3D(
            this.gl.TEXTURE_3D,
            0,
            this.gl.RGB32F,
            dims[0],
            dims[1],
            dims[2],
            0,
            this.gl.RGB,
            this.gl.FLOAT,
            gradientData
        );

        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_R, this.gl.CLAMP_TO_EDGE);

        return texture;
    }

    createTransferFunction(transferFunc: TransferFunction): string {
        const resolution = 256;
        const data = new Float32Array(resolution * 4); // RGBA

        // Interpolate color and opacity points
        for (let i = 0; i < resolution; i++) {
            const t = i / (resolution - 1);

            // Find surrounding color points
            let color = vec3.fromValues(t, t, t); // Default grayscale
            for (let j = 0; j < transferFunc.colorPoints.length - 1; j++) {
                const p1 = transferFunc.colorPoints[j];
                const p2 = transferFunc.colorPoints[j + 1];
                if (t >= p1.value && t <= p2.value) {
                    const alpha = (t - p1.value) / (p2.value - p1.value);
                    vec3.lerp(color, p1.color, p2.color, alpha);
                    break;
                }
            }

            // Find surrounding opacity points
            let opacity = 0.0;
            for (let j = 0; j < transferFunc.opacityPoints.length - 1; j++) {
                const p1 = transferFunc.opacityPoints[j];
                const p2 = transferFunc.opacityPoints[j + 1];
                if (t >= p1.value && t <= p2.value) {
                    const alpha = (t - p1.value) / (p2.value - p1.value);
                    opacity = p1.opacity + alpha * (p2.opacity - p1.opacity);
                    break;
                }
            }

            data[i * 4] = color[0];
            data[i * 4 + 1] = color[1];
            data[i * 4 + 2] = color[2];
            data[i * 4 + 3] = opacity;
        }

        const texture = this.gl.createTexture()!;
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA32F,
            resolution,
            1,
            0,
            this.gl.RGBA,
            this.gl.FLOAT,
            data
        );

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        this.transferFunctions.set(transferFunc.id, texture);
        return transferFunc.id;
    }

    private setupMedicalPresets(): void {
        // Create medical-specific transfer function presets
        const presets = [
            {
                id: 'bone',
                name: 'Bone',
                colorPoints: [
                    { value: 0.0, color: vec3.fromValues(0.0, 0.0, 0.0) },
                    { value: 0.3, color: vec3.fromValues(0.4, 0.2, 0.1) },
                    { value: 0.7, color: vec3.fromValues(1.0, 0.9, 0.7) },
                    { value: 1.0, color: vec3.fromValues(1.0, 1.0, 1.0) }
                ],
                opacityPoints: [
                    { value: 0.0, opacity: 0.0 },
                    { value: 0.2, opacity: 0.0 },
                    { value: 0.3, opacity: 0.1 },
                    { value: 0.7, opacity: 0.8 },
                    { value: 1.0, opacity: 1.0 }
                ]
            },
            {
                id: 'soft_tissue',
                name: 'Soft Tissue',
                colorPoints: [
                    { value: 0.0, color: vec3.fromValues(0.0, 0.0, 0.0) },
                    { value: 0.2, color: vec3.fromValues(0.6, 0.2, 0.2) },
                    { value: 0.5, color: vec3.fromValues(1.0, 0.6, 0.4) },
                    { value: 1.0, color: vec3.fromValues(1.0, 0.9, 0.8) }
                ],
                opacityPoints: [
                    { value: 0.0, opacity: 0.0 },
                    { value: 0.1, opacity: 0.0 },
                    { value: 0.2, opacity: 0.3 },
                    { value: 0.8, opacity: 0.9 },
                    { value: 1.0, opacity: 1.0 }
                ]
            }
        ];

        presets.forEach(preset => this.createTransferFunction(preset));
    }

    render(
        volumeId: string,
        transferFunctionId: string,
        renderingMode: 'dvr' | 'mip' | 'minip' | 'isosurface' = 'dvr'
    ): void {
        if (!this.isInitialized || !this.volumeProgram) {
            console.warn('Cannot render: volume renderer not initialized');
            return;
        }

        const volumeTexture = this.volumeTextures.get(volumeId);
        const transferTexture = this.transferFunctions.get(transferFunctionId);

        if (!volumeTexture || !transferTexture) {
            console.warn('Volume or transfer function not found');
            return;
        }

        this.gl.useProgram(this.volumeProgram);
        this.gl.bindVertexArray(this.volumeGeometry);

        // Set rendering state
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);

        // Bind textures
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_3D, volumeTexture);
        this.gl.uniform1i(this.gl.getUniformLocation(this.volumeProgram, 'u_volumeTexture'), 0);

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, transferTexture);
        this.gl.uniform1i(this.gl.getUniformLocation(this.volumeProgram, 'u_transferFunction'), 1);

        // Set uniforms
        this.setVolumeUniforms(renderingMode);

        // Render
        this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_SHORT, 0);

        // Cleanup
        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
    }

    private setVolumeUniforms(renderingMode: string): void {
        const program = this.volumeProgram!;

        // Matrices
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(program, 'u_mvpMatrix'), false, this.renderingState.projectionMatrix);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(program, 'u_volumeMatrix'), false, this.renderingState.volumeMatrix);

        // Volume parameters
        this.gl.uniform1f(this.gl.getUniformLocation(program, 'u_stepSize'), this.renderingState.stepSize);
        this.gl.uniform1i(this.gl.getUniformLocation(program, 'u_maxSteps'), this.renderingState.maxSteps);

        // Lighting
        this.gl.uniform3fv(this.gl.getUniformLocation(program, 'u_lightDirection'), this.renderingState.lightDirection);
        this.gl.uniform3fv(this.gl.getUniformLocation(program, 'u_lightColor'), this.renderingState.lightColor);
        this.gl.uniform1f(this.gl.getUniformLocation(program, 'u_ambientStrength'), this.renderingState.ambientStrength);

        // Rendering mode
        const modeMap = { 'dvr': 0, 'mip': 1, 'minip': 2, 'isosurface': 3 };
        this.gl.uniform1i(this.gl.getUniformLocation(program, 'u_renderingMode'), modeMap[renderingMode] || 0);

        // Medical parameters
        this.gl.uniform1f(this.gl.getUniformLocation(program, 'u_isoValue'), this.renderingState.isoValue);
        this.gl.uniform1i(this.gl.getUniformLocation(program, 'u_enableGradientShading'), this.config.enableGradientShading ? 1 : 0);
        this.gl.uniform1i(this.gl.getUniformLocation(program, 'u_enableAdaptiveSampling'), this.config.enableAdaptiveSampling ? 1 : 0);
    }

    updateRenderingState(state: Partial<VolumeRenderingState>): void {
        Object.assign(this.renderingState, state);
    }

    setQualityLevel(level: 'draft' | 'standard' | 'high' | 'ultra'): void {
        this.config.qualityLevel = level;

        switch (level) {
            case 'draft':
                this.renderingState.stepSize = 0.02;
                this.renderingState.maxSteps = 256;
                break;
            case 'standard':
                this.renderingState.stepSize = 0.015;
                this.renderingState.maxSteps = 384;
                break;
            case 'high':
                this.renderingState.stepSize = 0.01;
                this.renderingState.maxSteps = 512;
                break;
            case 'ultra':
                this.renderingState.stepSize = 0.005;
                this.renderingState.maxSteps = 1024;
                break;
        }
    }

    getVolumeMetrics(): object {
        return {
            config: this.config,
            isInitialized: this.isInitialized,
            volumeCount: this.volumeTextures.size,
            transferFunctionCount: this.transferFunctions.size,
            renderingState: this.renderingState
        };
    }

    dispose(): void {
        // Clean up WebGL resources
        this.volumeTextures.forEach(texture => this.gl.deleteTexture(texture));
        this.transferFunctions.forEach(texture => this.gl.deleteTexture(texture));
        this.gradientTextures.forEach(texture => this.gl.deleteTexture(texture));

        if (this.volumeProgram) {
            this.gl.deleteProgram(this.volumeProgram);
        }

        if (this.volumeGeometry) {
            this.gl.deleteVertexArray(this.volumeGeometry);
        }

        this.volumeTextures.clear();
        this.transferFunctions.clear();
        this.gradientTextures.clear();
        this.isInitialized = false;

        console.log('G3D Volume Renderer disposed');
    }
}

export default VolumeRenderer;