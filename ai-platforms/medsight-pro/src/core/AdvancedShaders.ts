/**
 * G3D MedSight Pro - Advanced Shader System
 * Sophisticated shader management for medical visualization
 * 
 * Features:
 * - Medical-specific shader programs
 * - Dynamic shader compilation
 * - Shader optimization for medical data
 * - Volume rendering shaders
 * - Medical imaging effects
 * - Real-time shader hot-reloading
 */

export interface ShaderConfig {
    enableHotReload: boolean;
    enableOptimization: boolean;
    enableMedicalShaders: boolean;
    maxShaders: number;
    shaderCacheSize: number;
    enableDebugging: boolean;
}

export interface Shader {
    id: string;
    name: string;
    type: 'vertex' | 'fragment' | 'compute' | 'geometry' | 'tessellation';
    source: string;
    compiled: boolean;
    medicalSpecific: boolean;
    uniforms: ShaderUniform[];
    attributes: ShaderAttribute[];
    varyings: ShaderVarying[];
    defines: Map<string, string>;
    includes: string[];
}

export interface ShaderProgram {
    id: string;
    name: string;
    vertexShader: Shader;
    fragmentShader: Shader;
    computeShader?: Shader;
    program: WebGLProgram | null;
    uniforms: Map<string, WebGLUniformLocation>;
    attributes: Map<string, number>;
    medicalPurpose: 'volume_rendering' | 'surface_rendering' | 'medical_imaging' | 'pathology_highlight' | 'general';
    linked: boolean;
}

export interface ShaderUniform {
    name: string;
    type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat3' | 'mat4' | 'sampler2D' | 'samplerCube' | 'sampler3D';
    location?: WebGLUniformLocation;
    value?: any;
    medicalContext?: string;
}

export interface ShaderAttribute {
    name: string;
    type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat3' | 'mat4';
    location?: number;
    medicalData?: boolean;
}

export interface ShaderVarying {
    name: string;
    type: 'float' | 'vec2' | 'vec3' | 'vec4';
    interpolation: 'smooth' | 'flat' | 'noperspective';
}

export class AdvancedShaders {
    private config: ShaderConfig;
    private shaders: Map<string, Shader> = new Map();
    private programs: Map<string, ShaderProgram> = new Map();
    private shaderCache: Map<string, string> = new Map();
    private gl: WebGL2RenderingContext | null = null;
    private isInitialized: boolean = false;

    // Medical shader templates
    private static readonly MEDICAL_SHADERS = {
        VOLUME_RENDERING_VERTEX: `#version 300 es
            precision highp float;
            
            in vec3 a_position;
            in vec3 a_texCoord;
            
            uniform mat4 u_modelMatrix;
            uniform mat4 u_viewMatrix;
            uniform mat4 u_projectionMatrix;
            uniform mat4 u_mvpMatrix;
            
            out vec3 v_texCoord;
            out vec3 v_worldPos;
            out vec3 v_viewPos;
            
            void main() {
                vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
                vec4 viewPos = u_viewMatrix * worldPos;
                
                v_texCoord = a_texCoord;
                v_worldPos = worldPos.xyz;
                v_viewPos = viewPos.xyz;
                
                gl_Position = u_projectionMatrix * viewPos;
            }`,

        VOLUME_RENDERING_FRAGMENT: `#version 300 es
            precision highp float;
            
            in vec3 v_texCoord;
            in vec3 v_worldPos;
            in vec3 v_viewPos;
            
            uniform sampler3D u_volumeTexture;
            uniform sampler2D u_transferFunction;
            uniform vec3 u_cameraPosition;
            uniform float u_stepSize;
            uniform int u_maxSteps;
            uniform float u_opacity;
            uniform vec2 u_windowLevel; // x: width, y: level
            uniform float u_medicalEnhancement;
            
            out vec4 fragColor;
            
            vec4 sampleVolume(vec3 pos) {
                if (any(lessThan(pos, vec3(0.0))) || any(greaterThan(pos, vec3(1.0)))) {
                    return vec4(0.0);
                }
                
                float intensity = texture(u_volumeTexture, pos).r;
                
                // Apply window/level
                float windowMin = u_windowLevel.y - u_windowLevel.x * 0.5;
                float windowMax = u_windowLevel.y + u_windowLevel.x * 0.5;
                intensity = clamp((intensity - windowMin) / (windowMax - windowMin), 0.0, 1.0);
                
                // Medical enhancement
                intensity = pow(intensity, 1.0 / u_medicalEnhancement);
                
                return texture(u_transferFunction, vec2(intensity, 0.5));
            }
            
            void main() {
                vec3 rayDir = normalize(v_worldPos - u_cameraPosition);
                vec3 rayPos = v_texCoord;
                
                vec4 color = vec4(0.0);
                float alpha = 0.0;
                
                for (int i = 0; i < u_maxSteps && alpha < 0.99; i++) {
                    vec4 sample = sampleVolume(rayPos);
                    
                    // Front-to-back compositing
                    color.rgb += sample.rgb * sample.a * (1.0 - alpha);
                    alpha += sample.a * (1.0 - alpha);
                    
                    rayPos += rayDir * u_stepSize;
                }
                
                fragColor = vec4(color.rgb, alpha * u_opacity);
            }`,

        MEDICAL_SURFACE_VERTEX: `#version 300 es
            precision highp float;
            
            in vec3 a_position;
            in vec3 a_normal;
            in vec2 a_texCoord;
            in vec3 a_medicalData; // Custom medical attributes
            
            uniform mat4 u_modelMatrix;
            uniform mat4 u_viewMatrix;
            uniform mat4 u_projectionMatrix;
            uniform mat3 u_normalMatrix;
            
            out vec3 v_position;
            out vec3 v_normal;
            out vec2 v_texCoord;
            out vec3 v_medicalData;
            out float v_depth;
            
            void main() {
                vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
                vec4 viewPos = u_viewMatrix * worldPos;
                
                v_position = worldPos.xyz;
                v_normal = normalize(u_normalMatrix * a_normal);
                v_texCoord = a_texCoord;
                v_medicalData = a_medicalData;
                v_depth = -viewPos.z;
                
                gl_Position = u_projectionMatrix * viewPos;
            }`,

        MEDICAL_SURFACE_FRAGMENT: `#version 300 es
            precision highp float;
            
            in vec3 v_position;
            in vec3 v_normal;
            in vec2 v_texCoord;
            in vec3 v_medicalData;
            in float v_depth;
            
            uniform sampler2D u_albedoMap;
            uniform sampler2D u_normalMap;
            uniform sampler2D u_medicalDataMap;
            
            uniform vec3 u_albedo;
            uniform float u_metallic;
            uniform float u_roughness;
            uniform vec3 u_emission;
            
            // Medical-specific uniforms
            uniform float u_pathologyHighlight;
            uniform vec3 u_pathologyColor;
            uniform float u_contrastEnhancement;
            uniform int u_medicalVisualizationMode; // 0: normal, 1: pathology, 2: functional
            
            // Lighting uniforms
            uniform vec3 u_lightPosition;
            uniform vec3 u_lightColor;
            uniform vec3 u_cameraPosition;
            
            out vec4 fragColor;
            
            vec3 calculateLighting(vec3 albedo, vec3 normal, vec3 viewDir, vec3 lightDir) {
                float NdotL = max(dot(normal, lightDir), 0.0);
                float NdotV = max(dot(normal, viewDir), 0.0);
                
                vec3 halfVector = normalize(lightDir + viewDir);
                float NdotH = max(dot(normal, halfVector), 0.0);
                
                // Simplified PBR lighting
                vec3 diffuse = albedo * NdotL;
                vec3 specular = vec3(pow(NdotH, (1.0 - u_roughness) * 128.0));
                
                return (diffuse + specular) * u_lightColor;
            }
            
            vec3 applyMedicalVisualization(vec3 baseColor) {
                if (u_medicalVisualizationMode == 1) {
                    // Pathology highlighting
                    float pathologyIntensity = v_medicalData.r;
                    if (pathologyIntensity > u_pathologyHighlight) {
                        return mix(baseColor, u_pathologyColor, pathologyIntensity);
                    }
                } else if (u_medicalVisualizationMode == 2) {
                    // Functional visualization
                    float functionalValue = v_medicalData.g;
                    vec3 functionalColor = vec3(functionalValue, 1.0 - functionalValue, 0.0);
                    return mix(baseColor, functionalColor, 0.5);
                }
                
                return baseColor;
            }
            
            void main() {
                vec3 albedo = texture(u_albedoMap, v_texCoord).rgb * u_albedo;
                vec3 normal = normalize(v_normal);
                
                // Apply normal mapping if available
                vec3 normalMap = texture(u_normalMap, v_texCoord).rgb * 2.0 - 1.0;
                // Note: Proper normal mapping would require tangent space calculation
                
                vec3 viewDir = normalize(u_cameraPosition - v_position);
                vec3 lightDir = normalize(u_lightPosition - v_position);
                
                vec3 lighting = calculateLighting(albedo, normal, viewDir, lightDir);
                
                // Apply contrast enhancement
                lighting = pow(lighting, vec3(u_contrastEnhancement));
                
                // Apply medical visualization
                lighting = applyMedicalVisualization(lighting);
                
                // Add emission
                lighting += u_emission;
                
                fragColor = vec4(lighting, 1.0);
            }`
    };

    constructor(config: Partial<ShaderConfig> = {}) {
        this.config = {
            enableHotReload: false,
            enableOptimization: true,
            enableMedicalShaders: true,
            maxShaders: 500,
            shaderCacheSize: 100,
            enableDebugging: false,
            ...config
        };
    }

    async initialize(gl: WebGL2RenderingContext): Promise<void> {
        try {
            console.log('Initializing G3D Advanced Shader System...');

            this.gl = gl;

            // Load medical shader templates
            if (this.config.enableMedicalShaders) {
                await this.loadMedicalShaders();
            }

            // Create default shader programs
            await this.createDefaultPrograms();

            this.isInitialized = true;
            console.log('G3D Advanced Shader System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Advanced Shader System:', error);
            throw error;
        }
    }

    private async loadMedicalShaders(): Promise<void> {
        // Load volume rendering shaders
        this.createShader({
            id: 'volume_vertex',
            name: 'Volume Rendering Vertex Shader',
            type: 'vertex',
            source: AdvancedShaders.MEDICAL_SHADERS.VOLUME_RENDERING_VERTEX,
            medicalSpecific: true
        });

        this.createShader({
            id: 'volume_fragment',
            name: 'Volume Rendering Fragment Shader',
            type: 'fragment',
            source: AdvancedShaders.MEDICAL_SHADERS.VOLUME_RENDERING_FRAGMENT,
            medicalSpecific: true
        });

        // Load medical surface shaders
        this.createShader({
            id: 'medical_surface_vertex',
            name: 'Medical Surface Vertex Shader',
            type: 'vertex',
            source: AdvancedShaders.MEDICAL_SHADERS.MEDICAL_SURFACE_VERTEX,
            medicalSpecific: true
        });

        this.createShader({
            id: 'medical_surface_fragment',
            name: 'Medical Surface Fragment Shader',
            type: 'fragment',
            source: AdvancedShaders.MEDICAL_SHADERS.MEDICAL_SURFACE_FRAGMENT,
            medicalSpecific: true
        });

        console.log('Medical shader templates loaded');
    }

    private async createDefaultPrograms(): Promise<void> {
        // Create volume rendering program
        const volumeProgram = this.createProgram({
            id: 'volume_rendering',
            name: 'Volume Rendering Program',
            vertexShaderId: 'volume_vertex',
            fragmentShaderId: 'volume_fragment',
            medicalPurpose: 'volume_rendering'
        });

        // Create medical surface program
        const surfaceProgram = this.createProgram({
            id: 'medical_surface',
            name: 'Medical Surface Program',
            vertexShaderId: 'medical_surface_vertex',
            fragmentShaderId: 'medical_surface_fragment',
            medicalPurpose: 'surface_rendering'
        });

        console.log('Default shader programs created');
    }

    public createShader(shaderData: Partial<Shader>): Shader {
        const shader: Shader = {
            id: shaderData.id || `shader_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: shaderData.name || 'Unnamed Shader',
            type: shaderData.type || 'fragment',
            source: shaderData.source || '',
            compiled: false,
            medicalSpecific: shaderData.medicalSpecific || false,
            uniforms: shaderData.uniforms || [],
            attributes: shaderData.attributes || [],
            varyings: shaderData.varyings || [],
            defines: shaderData.defines || new Map(),
            includes: shaderData.includes || []
        };

        this.shaders.set(shader.id, shader);
        console.log(`Shader created: ${shader.id} (${shader.type})`);
        return shader;
    }

    public createProgram(programData: {
        id?: string;
        name?: string;
        vertexShaderId: string;
        fragmentShaderId: string;
        computeShaderId?: string;
        medicalPurpose?: ShaderProgram['medicalPurpose'];
    }): ShaderProgram | null {
        if (!this.gl) {
            console.error('WebGL context not available');
            return null;
        }

        const vertexShader = this.shaders.get(programData.vertexShaderId);
        const fragmentShader = this.shaders.get(programData.fragmentShaderId);

        if (!vertexShader || !fragmentShader) {
            console.error('Required shaders not found');
            return null;
        }

        const program: ShaderProgram = {
            id: programData.id || `program_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: programData.name || 'Unnamed Program',
            vertexShader,
            fragmentShader,
            program: null,
            uniforms: new Map(),
            attributes: new Map(),
            medicalPurpose: programData.medicalPurpose || 'general',
            linked: false
        };

        // Compile and link the program
        if (this.compileAndLinkProgram(program)) {
            this.programs.set(program.id, program);
            console.log(`Shader program created: ${program.id}`);
            return program;
        }

        return null;
    }

    private compileAndLinkProgram(program: ShaderProgram): boolean {
        if (!this.gl) return false;

        const gl = this.gl;

        // Compile vertex shader
        const vertexShaderGL = this.compileShader(program.vertexShader, gl.VERTEX_SHADER);
        if (!vertexShaderGL) return false;

        // Compile fragment shader
        const fragmentShaderGL = this.compileShader(program.fragmentShader, gl.FRAGMENT_SHADER);
        if (!fragmentShaderGL) {
            gl.deleteShader(vertexShaderGL);
            return false;
        }

        // Create and link program
        const programGL = gl.createProgram();
        if (!programGL) {
            gl.deleteShader(vertexShaderGL);
            gl.deleteShader(fragmentShaderGL);
            return false;
        }

        gl.attachShader(programGL, vertexShaderGL);
        gl.attachShader(programGL, fragmentShaderGL);
        gl.linkProgram(programGL);

        // Check linking status
        if (!gl.getProgramParameter(programGL, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(programGL);
            console.error(`Shader program linking failed: ${error}`);
            gl.deleteProgram(programGL);
            gl.deleteShader(vertexShaderGL);
            gl.deleteShader(fragmentShaderGL);
            return false;
        }

        program.program = programGL;
        program.linked = true;

        // Extract uniforms and attributes
        this.extractUniforms(program);
        this.extractAttributes(program);

        // Clean up individual shaders
        gl.deleteShader(vertexShaderGL);
        gl.deleteShader(fragmentShaderGL);

        return true;
    }

    private compileShader(shader: Shader, type: number): WebGLShader | null {
        if (!this.gl) return null;

        const gl = this.gl;
        const shaderGL = gl.createShader(type);

        if (!shaderGL) return null;

        // Process shader source with defines and includes
        let source = this.processShaderSource(shader);

        gl.shaderSource(shaderGL, source);
        gl.compileShader(shaderGL);

        if (!gl.getShaderParameter(shaderGL, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shaderGL);
            console.error(`Shader compilation failed (${shader.id}): ${error}`);
            gl.deleteShader(shaderGL);
            return null;
        }

        shader.compiled = true;
        return shaderGL;
    }

    private processShaderSource(shader: Shader): string {
        let source = shader.source;

        // Add defines
        let definesString = '';
        for (const [key, value] of shader.defines) {
            definesString += `#define ${key} ${value}\n`;
        }

        // Insert defines after version directive
        const versionMatch = source.match(/#version\s+\d+\s+\w*\s*\n/);
        if (versionMatch) {
            const versionLine = versionMatch[0];
            source = source.replace(versionLine, versionLine + definesString);
        } else {
            source = definesString + source;
        }

        // Process includes (simplified)
        for (const include of shader.includes) {
            const includeSource = this.shaderCache.get(include) || '';
            source = source.replace(`#include "${include}"`, includeSource);
        }

        return source;
    }

    private extractUniforms(program: ShaderProgram): void {
        if (!this.gl || !program.program) return;

        const gl = this.gl;
        const uniformCount = gl.getProgramParameter(program.program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < uniformCount; i++) {
            const uniformInfo = gl.getActiveUniform(program.program, i);
            if (uniformInfo) {
                const location = gl.getUniformLocation(program.program, uniformInfo.name);
                if (location) {
                    program.uniforms.set(uniformInfo.name, location);
                }
            }
        }
    }

    private extractAttributes(program: ShaderProgram): void {
        if (!this.gl || !program.program) return;

        const gl = this.gl;
        const attributeCount = gl.getProgramParameter(program.program, gl.ACTIVE_ATTRIBUTES);

        for (let i = 0; i < attributeCount; i++) {
            const attributeInfo = gl.getActiveAttrib(program.program, i);
            if (attributeInfo) {
                const location = gl.getAttribLocation(program.program, attributeInfo.name);
                if (location >= 0) {
                    program.attributes.set(attributeInfo.name, location);
                }
            }
        }
    }

    public getShader(shaderId: string): Shader | null {
        return this.shaders.get(shaderId) || null;
    }

    public getProgram(programId: string): ShaderProgram | null {
        return this.programs.get(programId) || null;
    }

    public getAllShaders(): Shader[] {
        return Array.from(this.shaders.values());
    }

    public getAllPrograms(): ShaderProgram[] {
        return Array.from(this.programs.values());
    }

    public getMedicalPrograms(): ShaderProgram[] {
        return Array.from(this.programs.values()).filter(p =>
            p.medicalPurpose !== 'general'
        );
    }

    public useProgram(programId: string): boolean {
        if (!this.gl) return false;

        const program = this.programs.get(programId);
        if (!program || !program.program || !program.linked) return false;

        this.gl.useProgram(program.program);
        return true;
    }

    public setUniform(programId: string, uniformName: string, value: any): boolean {
        if (!this.gl) return false;

        const program = this.programs.get(programId);
        if (!program) return false;

        const location = program.uniforms.get(uniformName);
        if (!location) return false;

        // Set uniform based on type (simplified)
        if (typeof value === 'number') {
            this.gl.uniform1f(location, value);
        } else if (Array.isArray(value)) {
            switch (value.length) {
                case 2:
                    this.gl.uniform2fv(location, value);
                    break;
                case 3:
                    this.gl.uniform3fv(location, value);
                    break;
                case 4:
                    this.gl.uniform4fv(location, value);
                    break;
                case 9:
                    this.gl.uniformMatrix3fv(location, false, value);
                    break;
                case 16:
                    this.gl.uniformMatrix4fv(location, false, value);
                    break;
            }
        }

        return true;
    }

    public reloadShader(shaderId: string): boolean {
        const shader = this.shaders.get(shaderId);
        if (!shader) return false;

        shader.compiled = false;

        // Recompile programs that use this shader
        for (const program of this.programs.values()) {
            if (program.vertexShader.id === shaderId ||
                program.fragmentShader.id === shaderId ||
                (program.computeShader && program.computeShader.id === shaderId)) {

                program.linked = false;
                this.compileAndLinkProgram(program);
            }
        }

        console.log(`Shader reloaded: ${shaderId}`);
        return true;
    }

    public getPerformanceMetrics(): {
        totalShaders: number;
        compiledShaders: number;
        totalPrograms: number;
        linkedPrograms: number;
        medicalPrograms: number;
        memoryUsage: number;
    } {
        const shaders = Array.from(this.shaders.values());
        const programs = Array.from(this.programs.values());

        return {
            totalShaders: shaders.length,
            compiledShaders: shaders.filter(s => s.compiled).length,
            totalPrograms: programs.length,
            linkedPrograms: programs.filter(p => p.linked).length,
            medicalPrograms: programs.filter(p => p.medicalPurpose !== 'general').length,
            memoryUsage: this.calculateMemoryUsage()
        };
    }

    private calculateMemoryUsage(): number {
        // Estimate shader memory usage
        let usage = 0;

        for (const shader of this.shaders.values()) {
            usage += shader.source.length * 2; // UTF-16 encoding
        }

        // Add program overhead
        usage += this.programs.size * 1024; // ~1KB per program

        return usage;
    }

    public dispose(): void {
        console.log('Disposing G3D Advanced Shader System...');

        if (this.gl) {
            // Delete WebGL programs
            for (const program of this.programs.values()) {
                if (program.program) {
                    this.gl.deleteProgram(program.program);
                }
            }
        }

        // Clear collections
        this.shaders.clear();
        this.programs.clear();
        this.shaderCache.clear();

        this.gl = null;
        this.isInitialized = false;
        console.log('G3D Advanced Shader System disposed');
    }
}

export default AdvancedShaders;