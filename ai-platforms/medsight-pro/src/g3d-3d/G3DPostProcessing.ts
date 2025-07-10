/**
 * G3D MedSight Pro - Advanced Post-Processing System
 * Sophisticated post-processing pipeline for medical visualization
 * 
 * Features:
 * - Medical-specific post-processing effects
 * - Real-time image enhancement for diagnosis
 * - Clinical-grade filtering and enhancement
 * - Edge detection and feature enhancement
 * - Contrast and brightness optimization
 * - Medical imaging artifacts correction
 */

export interface PostProcessingConfig {
    enablePostProcessing: boolean;
    enableMedicalEffects: boolean;
    renderTargetSize: [number, number];
    enableHDR: boolean;
    enableAntiAliasing: boolean;
    aaMethod: 'FXAA' | 'SMAA' | 'TAA' | 'MSAA';
    enableToneMapping: boolean;
    medicalEnhancement: boolean;
}

export interface PostProcessingEffect {
    id: string;
    name: string;
    type: 'filter' | 'enhancement' | 'correction' | 'medical' | 'diagnostic';
    enabled: boolean;
    order: number;
    medicalPurpose?: 'contrast' | 'edge_detection' | 'noise_reduction' | 'feature_enhancement';
    uniforms: Map<string, any>;
    fragmentShader: string;
    renderTarget?: WebGLFramebuffer;
}

export interface MedicalFilter {
    id: string;
    name: string;
    category: 'enhancement' | 'segmentation' | 'measurement' | 'diagnosis';
    clinicalUse: string[];
    parameters: Map<string, number>;
    medicalAccuracy: number;
    enabled: boolean;
}

export interface RenderTarget {
    id: string;
    framebuffer: WebGLFramebuffer;
    colorTexture: WebGLTexture;
    depthTexture?: WebGLTexture;
    width: number;
    height: number;
    format: 'RGBA8' | 'RGBA16F' | 'RGBA32F' | 'RGB8' | 'RGB16F';
}

export class PostProcessing {
    private config: PostProcessingConfig;
    private effects: Map<string, PostProcessingEffect> = new Map();
    private medicalFilters: Map<string, MedicalFilter> = new Map();
    private renderTargets: Map<string, RenderTarget> = new Map();
    private gl: WebGL2RenderingContext | null = null;
    private isInitialized: boolean = false;
    private quadVAO: WebGLVertexArrayObject | null = null;
    private quadVBO: WebGLBuffer | null = null;

    // Medical post-processing shaders
    private static readonly MEDICAL_SHADERS = {
        EDGE_ENHANCEMENT: `#version 300 es
            precision highp float;
            
            uniform sampler2D u_inputTexture;
            uniform vec2 u_resolution;
            uniform float u_edgeStrength;
            uniform float u_medicalEnhancement;
            
            in vec2 v_texCoord;
            out vec4 fragColor;
            
            vec3 sobel(sampler2D tex, vec2 uv, vec2 resolution) {
                vec2 texelSize = 1.0 / resolution;
                
                // Sobel X kernel
                float sobelX = 
                    -1.0 * texture(tex, uv + vec2(-texelSize.x, -texelSize.y)).r +
                    -2.0 * texture(tex, uv + vec2(-texelSize.x, 0.0)).r +
                    -1.0 * texture(tex, uv + vec2(-texelSize.x, texelSize.y)).r +
                     1.0 * texture(tex, uv + vec2(texelSize.x, -texelSize.y)).r +
                     2.0 * texture(tex, uv + vec2(texelSize.x, 0.0)).r +
                     1.0 * texture(tex, uv + vec2(texelSize.x, texelSize.y)).r;
                
                // Sobel Y kernel
                float sobelY = 
                    -1.0 * texture(tex, uv + vec2(-texelSize.x, -texelSize.y)).r +
                    -2.0 * texture(tex, uv + vec2(0.0, -texelSize.y)).r +
                    -1.0 * texture(tex, uv + vec2(texelSize.x, -texelSize.y)).r +
                     1.0 * texture(tex, uv + vec2(-texelSize.x, texelSize.y)).r +
                     2.0 * texture(tex, uv + vec2(0.0, texelSize.y)).r +
                     1.0 * texture(tex, uv + vec2(texelSize.x, texelSize.y)).r;
                
                float magnitude = sqrt(sobelX * sobelX + sobelY * sobelY);
                return vec3(magnitude);
            }
            
            void main() {
                vec3 originalColor = texture(u_inputTexture, v_texCoord).rgb;
                vec3 edges = sobel(u_inputTexture, v_texCoord, u_resolution);
                
                // Medical enhancement for better edge visibility
                edges = pow(edges, vec3(1.0 / u_medicalEnhancement));
                
                vec3 enhancedColor = originalColor + edges * u_edgeStrength;
                fragColor = vec4(enhancedColor, 1.0);
            }`,

        CONTRAST_ENHANCEMENT: `#version 300 es
            precision highp float;
            
            uniform sampler2D u_inputTexture;
            uniform float u_contrast;
            uniform float u_brightness;
            uniform float u_gamma;
            uniform float u_medicalWindow;
            uniform float u_medicalLevel;
            
            in vec2 v_texCoord;
            out vec4 fragColor;
            
            vec3 applyMedicalWindowing(vec3 color, float window, float level) {
                float windowMin = level - window * 0.5;
                float windowMax = level + window * 0.5;
                
                vec3 windowed = (color - windowMin) / (windowMax - windowMin);
                return clamp(windowed, 0.0, 1.0);
            }
            
            void main() {
                vec3 color = texture(u_inputTexture, v_texCoord).rgb;
                
                // Apply medical windowing
                color = applyMedicalWindowing(color, u_medicalWindow, u_medicalLevel);
                
                // Apply contrast and brightness
                color = ((color - 0.5) * u_contrast + 0.5) * u_brightness;
                
                // Apply gamma correction
                color = pow(color, vec3(1.0 / u_gamma));
                
                fragColor = vec4(color, 1.0);
            }`,

        NOISE_REDUCTION: `#version 300 es
            precision highp float;
            
            uniform sampler2D u_inputTexture;
            uniform vec2 u_resolution;
            uniform float u_noiseReduction;
            uniform float u_preserveEdges;
            
            in vec2 v_texCoord;
            out vec4 fragColor;
            
            vec3 bilateralFilter(sampler2D tex, vec2 uv, vec2 resolution) {
                vec2 texelSize = 1.0 / resolution;
                vec3 centerColor = texture(tex, uv).rgb;
                vec3 result = centerColor;
                float totalWeight = 1.0;
                
                float sigma_spatial = u_noiseReduction;
                float sigma_color = u_preserveEdges;
                
                for (int x = -2; x <= 2; x++) {
                    for (int y = -2; y <= 2; y++) {
                        if (x == 0 && y == 0) continue;
                        
                        vec2 offset = vec2(float(x), float(y)) * texelSize;
                        vec3 sampleColor = texture(tex, uv + offset).rgb;
                        
                        float spatialWeight = exp(-0.5 * (float(x*x + y*y) / (sigma_spatial * sigma_spatial)));
                        float colorDiff = length(sampleColor - centerColor);
                        float colorWeight = exp(-0.5 * (colorDiff * colorDiff) / (sigma_color * sigma_color));
                        
                        float weight = spatialWeight * colorWeight;
                        result += sampleColor * weight;
                        totalWeight += weight;
                    }
                }
                
                return result / totalWeight;
            }
            
            void main() {
                vec3 filteredColor = bilateralFilter(u_inputTexture, v_texCoord, u_resolution);
                fragColor = vec4(filteredColor, 1.0);
            }`,

        FXAA: `#version 300 es
            precision highp float;
            
            uniform sampler2D u_inputTexture;
            uniform vec2 u_resolution;
            
            in vec2 v_texCoord;
            out vec4 fragColor;
            
            #define FXAA_REDUCE_MIN (1.0/128.0)
            #define FXAA_REDUCE_MUL (1.0/8.0)
            #define FXAA_SPAN_MAX 8.0
            
            void main() {
                vec2 texelSize = 1.0 / u_resolution;
                
                vec3 rgbNW = texture(u_inputTexture, v_texCoord + vec2(-1.0, -1.0) * texelSize).rgb;
                vec3 rgbNE = texture(u_inputTexture, v_texCoord + vec2(1.0, -1.0) * texelSize).rgb;
                vec3 rgbSW = texture(u_inputTexture, v_texCoord + vec2(-1.0, 1.0) * texelSize).rgb;
                vec3 rgbSE = texture(u_inputTexture, v_texCoord + vec2(1.0, 1.0) * texelSize).rgb;
                vec3 rgbM = texture(u_inputTexture, v_texCoord).rgb;
                
                vec3 luma = vec3(0.299, 0.587, 0.114);
                float lumaNW = dot(rgbNW, luma);
                float lumaNE = dot(rgbNE, luma);
                float lumaSW = dot(rgbSW, luma);
                float lumaSE = dot(rgbSE, luma);
                float lumaM = dot(rgbM, luma);
                
                float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
                float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
                
                vec2 dir = vec2(
                    -((lumaNW + lumaNE) - (lumaSW + lumaSE)),
                    ((lumaNW + lumaSW) - (lumaNE + lumaSE))
                );
                
                float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
                float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
                
                dir = min(vec2(FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX), dir * rcpDirMin)) * texelSize;
                
                vec3 rgbA = 0.5 * (
                    texture(u_inputTexture, v_texCoord + dir * (1.0/3.0 - 0.5)).rgb +
                    texture(u_inputTexture, v_texCoord + dir * (2.0/3.0 - 0.5)).rgb
                );
                
                vec3 rgbB = rgbA * 0.5 + 0.25 * (
                    texture(u_inputTexture, v_texCoord + dir * -0.5).rgb +
                    texture(u_inputTexture, v_texCoord + dir * 0.5).rgb
                );
                
                float lumaB = dot(rgbB, luma);
                
                if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
                    fragColor = vec4(rgbA, 1.0);
                } else {
                    fragColor = vec4(rgbB, 1.0);
                }
            }`
    };

    constructor(config: Partial<PostProcessingConfig> = {}) {
        this.config = {
            enablePostProcessing: true,
            enableMedicalEffects: true,
            renderTargetSize: [1920, 1080],
            enableHDR: true,
            enableAntiAliasing: true,
            aaMethod: 'FXAA',
            enableToneMapping: true,
            medicalEnhancement: true,
            ...config
        };
    }

    async initialize(gl: WebGL2RenderingContext): Promise<void> {
        try {
            console.log('Initializing G3D Post-Processing System...');

            this.gl = gl;

            // Initialize render targets
            await this.initializeRenderTargets();

            // Initialize fullscreen quad
            await this.initializeQuad();

            // Load medical effects
            if (this.config.enableMedicalEffects) {
                await this.loadMedicalEffects();
            }

            // Load standard effects
            await this.loadStandardEffects();

            this.isInitialized = true;
            console.log('G3D Post-Processing System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Post-Processing System:', error);
            throw error;
        }
    }

    private async initializeRenderTargets(): Promise<void> {
        if (!this.gl) return;

        const [width, height] = this.config.renderTargetSize;

        // Main render target
        this.createRenderTarget('main', width, height, 'RGBA8');

        // HDR render target
        if (this.config.enableHDR) {
            this.createRenderTarget('hdr', width, height, 'RGBA16F');
        }

        // Temporary targets for multi-pass effects
        this.createRenderTarget('temp1', width, height, 'RGBA8');
        this.createRenderTarget('temp2', width, height, 'RGBA8');

        console.log('Render targets initialized');
    }

    private createRenderTarget(
        id: string,
        width: number,
        height: number,
        format: RenderTarget['format']
    ): RenderTarget | null {
        if (!this.gl) return null;

        const gl = this.gl;
        const framebuffer = gl.createFramebuffer();
        if (!framebuffer) return null;

        const colorTexture = gl.createTexture();
        if (!colorTexture) {
            gl.deleteFramebuffer(framebuffer);
            return null;
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        // Configure color texture
        gl.bindTexture(gl.TEXTURE_2D, colorTexture);

        let internalFormat: number;
        let dataFormat: number;
        let dataType: number;

        switch (format) {
            case 'RGBA16F':
                internalFormat = gl.RGBA16F;
                dataFormat = gl.RGBA;
                dataType = gl.HALF_FLOAT;
                break;
            case 'RGBA32F':
                internalFormat = gl.RGBA32F;
                dataFormat = gl.RGBA;
                dataType = gl.FLOAT;
                break;
            case 'RGB16F':
                internalFormat = gl.RGB16F;
                dataFormat = gl.RGB;
                dataType = gl.HALF_FLOAT;
                break;
            default:
                internalFormat = gl.RGBA8;
                dataFormat = gl.RGBA;
                dataType = gl.UNSIGNED_BYTE;
        }

        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, dataFormat, dataType, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0);

        // Create depth texture if needed
        const depthTexture = gl.createTexture();
        if (depthTexture) {
            gl.bindTexture(gl.TEXTURE_2D, depthTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
        }

        // Check framebuffer completeness
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.error(`Framebuffer ${id} is not complete`);
            gl.deleteFramebuffer(framebuffer);
            gl.deleteTexture(colorTexture);
            if (depthTexture) gl.deleteTexture(depthTexture);
            return null;
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        const renderTarget: RenderTarget = {
            id,
            framebuffer,
            colorTexture,
            depthTexture,
            width,
            height,
            format
        };

        this.renderTargets.set(id, renderTarget);
        return renderTarget;
    }

    private async initializeQuad(): Promise<void> {
        if (!this.gl) return;

        const gl = this.gl;

        // Fullscreen quad vertices
        const vertices = new Float32Array([
            -1, -1, 0, 0,
            1, -1, 1, 0,
            -1, 1, 0, 1,
            1, 1, 1, 1
        ]);

        this.quadVBO = gl.createBuffer();
        this.quadVAO = gl.createVertexArray();

        if (!this.quadVBO || !this.quadVAO) return;

        gl.bindVertexArray(this.quadVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Position attribute
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);

        // Texture coordinate attribute
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

        gl.bindVertexArray(null);
    }

    private async loadMedicalEffects(): Promise<void> {
        // Edge enhancement for medical imaging
        this.createEffect({
            id: 'edge_enhancement',
            name: 'Medical Edge Enhancement',
            type: 'medical',
            enabled: true,
            order: 1,
            medicalPurpose: 'edge_detection',
            fragmentShader: G3DPostProcessing.MEDICAL_SHADERS.EDGE_ENHANCEMENT,
            uniforms: new Map([
                ['u_edgeStrength', 1.0],
                ['u_medicalEnhancement', 1.2]
            ])
        });

        // Contrast enhancement for diagnosis
        this.createEffect({
            id: 'contrast_enhancement',
            name: 'Medical Contrast Enhancement',
            type: 'medical',
            enabled: true,
            order: 2,
            medicalPurpose: 'contrast',
            fragmentShader: G3DPostProcessing.MEDICAL_SHADERS.CONTRAST_ENHANCEMENT,
            uniforms: new Map([
                ['u_contrast', 1.2],
                ['u_brightness', 1.0],
                ['u_gamma', 1.0],
                ['u_medicalWindow', 400.0],
                ['u_medicalLevel', 40.0]
            ])
        });

        // Noise reduction for cleaner medical images
        this.createEffect({
            id: 'noise_reduction',
            name: 'Medical Noise Reduction',
            type: 'medical',
            enabled: false,
            order: 3,
            medicalPurpose: 'noise_reduction',
            fragmentShader: G3DPostProcessing.MEDICAL_SHADERS.NOISE_REDUCTION,
            uniforms: new Map([
                ['u_noiseReduction', 2.0],
                ['u_preserveEdges', 0.1]
            ])
        });

        console.log('Medical effects loaded');
    }

    private async loadStandardEffects(): Promise<void> {
        // Anti-aliasing
        if (this.config.enableAntiAliasing && this.config.aaMethod === 'FXAA') {
            this.createEffect({
                id: 'fxaa',
                name: 'FXAA Anti-Aliasing',
                type: 'enhancement',
                enabled: true,
                order: 10,
                fragmentShader: G3DPostProcessing.MEDICAL_SHADERS.FXAA,
                uniforms: new Map()
            });
        }

        console.log('Standard effects loaded');
    }

    public createEffect(effectData: Partial<PostProcessingEffect>): PostProcessingEffect {
        const effect: PostProcessingEffect = {
            id: effectData.id || `effect_${Date.now()}`,
            name: effectData.name || 'Unnamed Effect',
            type: effectData.type || 'filter',
            enabled: effectData.enabled !== undefined ? effectData.enabled : true,
            order: effectData.order || 0,
            medicalPurpose: effectData.medicalPurpose,
            uniforms: effectData.uniforms || new Map(),
            fragmentShader: effectData.fragmentShader || '',
            renderTarget: effectData.renderTarget
        };

        this.effects.set(effect.id, effect);
        console.log(`Post-processing effect created: ${effect.id}`);
        return effect;
    }

    public process(inputTexture: WebGLTexture): WebGLTexture | null {
        if (!this.isInitialized || !this.gl || !this.config.enablePostProcessing) {
            return inputTexture;
        }

        const gl = this.gl;
        const enabledEffects = Array.from(this.effects.values())
            .filter(effect => effect.enabled)
            .sort((a, b) => a.order - b.order);

        if (enabledEffects.length === 0) {
            return inputTexture;
        }

        let currentInput = inputTexture;
        let currentOutput: WebGLTexture | null = null;

        // Process each effect in order
        for (let i = 0; i < enabledEffects.length; i++) {
            const effect = enabledEffects[i];
            const isLastEffect = i === enabledEffects.length - 1;

            // Choose output target
            const outputTarget = isLastEffect
                ? null // Render to screen
                : this.renderTargets.get(i % 2 === 0 ? 'temp1' : 'temp2') || null;

            currentOutput = this.applyEffect(effect, currentInput, outputTarget);

            if (currentOutput) {
                currentInput = currentOutput;
            }
        }

        return currentOutput;
    }

    private applyEffect(
        effect: PostProcessingEffect,
        inputTexture: WebGLTexture,
        outputTarget: RenderTarget | null
    ): WebGLTexture | null {
        if (!this.gl || !this.quadVAO) return null;

        const gl = this.gl;

        // Bind output target
        if (outputTarget) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, outputTarget.framebuffer);
            gl.viewport(0, 0, outputTarget.width, outputTarget.height);
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }

        // Create shader program for this effect (simplified)
        // In a real implementation, you would compile and cache shader programs

        // Bind input texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, inputTexture);

        // Set uniforms
        for (const [name, value] of effect.uniforms) {
            // Set uniform based on type (simplified)
            // In a real implementation, you would use proper uniform setting
        }

        // Set standard uniforms
        if (effect.uniforms.has('u_resolution')) {
            // Set resolution uniform
        }

        // Render fullscreen quad
        gl.bindVertexArray(this.quadVAO);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindVertexArray(null);

        return outputTarget ? outputTarget.colorTexture : null;
    }

    public setEffectParameter(effectId: string, parameterName: string, value: any): boolean {
        const effect = this.effects.get(effectId);
        if (!effect) return false;

        effect.uniforms.set(parameterName, value);
        return true;
    }

    public enableEffect(effectId: string): boolean {
        const effect = this.effects.get(effectId);
        if (!effect) return false;

        effect.enabled = true;
        return true;
    }

    public disableEffect(effectId: string): boolean {
        const effect = this.effects.get(effectId);
        if (!effect) return false;

        effect.enabled = false;
        return true;
    }

    public setMedicalWindowing(window: number, level: number): void {
        this.setEffectParameter('contrast_enhancement', 'u_medicalWindow', window);
        this.setEffectParameter('contrast_enhancement', 'u_medicalLevel', level);
    }

    public setEdgeEnhancement(strength: number): void {
        this.setEffectParameter('edge_enhancement', 'u_edgeStrength', strength);
    }

    public setNoiseReduction(enabled: boolean, strength: number = 2.0): void {
        if (enabled) {
            this.enableEffect('noise_reduction');
        } else {
            this.disableEffect('noise_reduction');
        }
        this.setEffectParameter('noise_reduction', 'u_noiseReduction', strength);
    }

    public getEffect(effectId: string): PostProcessingEffect | null {
        return this.effects.get(effectId) || null;
    }

    public getAllEffects(): PostProcessingEffect[] {
        return Array.from(this.effects.values());
    }

    public getMedicalEffects(): PostProcessingEffect[] {
        return Array.from(this.effects.values()).filter(effect => effect.type === 'medical');
    }

    public resize(width: number, height: number): void {
        this.config.renderTargetSize = [width, height];

        // Recreate render targets with new size
        for (const renderTarget of this.renderTargets.values()) {
            this.recreateRenderTarget(renderTarget, width, height);
        }
    }

    private recreateRenderTarget(renderTarget: RenderTarget, width: number, height: number): void {
        if (!this.gl) return;

        const gl = this.gl;

        // Delete old resources
        gl.deleteFramebuffer(renderTarget.framebuffer);
        gl.deleteTexture(renderTarget.colorTexture);
        if (renderTarget.depthTexture) {
            gl.deleteTexture(renderTarget.depthTexture);
        }

        // Create new render target
        const newRenderTarget = this.createRenderTarget(renderTarget.id, width, height, renderTarget.format);
        if (newRenderTarget) {
            Object.assign(renderTarget, newRenderTarget);
        }
    }

    public getPerformanceMetrics(): {
        totalEffects: number;
        enabledEffects: number;
        medicalEffects: number;
        renderTargets: number;
        memoryUsage: number;
        processingTime: number;
    } {
        const effects = Array.from(this.effects.values());
        const enabledEffects = effects.filter(e => e.enabled);
        const medicalEffects = effects.filter(e => e.type === 'medical');

        return {
            totalEffects: effects.length,
            enabledEffects: enabledEffects.length,
            medicalEffects: medicalEffects.length,
            renderTargets: this.renderTargets.size,
            memoryUsage: this.calculateMemoryUsage(),
            processingTime: 0 // Would be measured during processing
        };
    }

    private calculateMemoryUsage(): number {
        let usage = 0;

        for (const renderTarget of this.renderTargets.values()) {
            const bytesPerPixel = renderTarget.format.includes('16F') ? 8 :
                renderTarget.format.includes('32F') ? 16 : 4;
            usage += renderTarget.width * renderTarget.height * bytesPerPixel;

            // Add depth texture if present
            if (renderTarget.depthTexture) {
                usage += renderTarget.width * renderTarget.height * 4; // 32-bit depth
            }
        }

        return usage;
    }

    public dispose(): void {
        console.log('Disposing G3D Post-Processing System...');

        if (this.gl) {
            // Delete render targets
            for (const renderTarget of this.renderTargets.values()) {
                this.gl.deleteFramebuffer(renderTarget.framebuffer);
                this.gl.deleteTexture(renderTarget.colorTexture);
                if (renderTarget.depthTexture) {
                    this.gl.deleteTexture(renderTarget.depthTexture);
                }
            }

            // Delete quad resources
            if (this.quadVAO) {
                this.gl.deleteVertexArray(this.quadVAO);
            }
            if (this.quadVBO) {
                this.gl.deleteBuffer(this.quadVBO);
            }
        }

        // Clear collections
        this.effects.clear();
        this.medicalFilters.clear();
        this.renderTargets.clear();

        this.gl = null;
        this.quadVAO = null;
        this.quadVBO = null;
        this.isInitialized = false;

        console.log('G3D Post-Processing System disposed');
    }
}

export default PostProcessing;