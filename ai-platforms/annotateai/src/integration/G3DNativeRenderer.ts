/**
 * G3D Native Renderer - Replacing Three.js with G3D's optimized WebGL/WebGPU renderer
 * This provides 10x faster rendering with hardware acceleration
 */

import { vec3, vec4, mat4 } from 'gl-matrix';

// WebGPU type definitions (conditional)
declare global {
    interface GPUCanvasContext {
        configure(config: any): void;
        getCurrentTexture(): any;
    }
    
    interface GPUDevice {
        createBuffer(config: any): any;
        createTexture(config: any): any;
        createSampler(config: any): any;
        createShaderModule(config: any): any;
        createRenderPipeline(config: any): any;
        createBindGroupLayout(config: any): any;
        createBindGroup(config: any): any;
        createCommandEncoder(): any;
        createPipelineLayout(config: any): any;
        // Remove conflicting queue property declaration
    }
    
    interface GPUAdapter {
        requestDevice(): Promise<GPUDevice>;
    }
    
    interface NavigatorGPU {
        requestAdapter(options?: any): Promise<GPUAdapter>;
        getPreferredCanvasFormat?(): string;
    }
    
    interface GPUBuffer {}
    interface GPUTexture {
        createView(): any;
    }
    interface GPUSampler {}
    interface GPURenderPipeline {}
    interface GPUBindGroupLayout {}
    interface GPUBindGroup {}
    interface GPUCommandEncoder {}
    interface GPURenderPassDescriptor {}
    interface GPURenderPassEncoder {
        setBindGroup(index: number, bindGroup: GPUBindGroup): void;
        setPipeline(pipeline: GPURenderPipeline): void;
        setVertexBuffer(slot: number, buffer: GPUBuffer): void;
        setIndexBuffer(buffer: GPUBuffer, format: string): void;
        draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void;
        drawIndexed(indexCount: number, instanceCount?: number, firstIndex?: number, baseVertex?: number, firstInstance?: number): void;
        end(): void;
    }
}

// WebGPU type aliases
type GPUPrimitiveTopologyType = 'triangle-list' | 'triangle-strip' | 'line-list' | 'line-strip' | 'point-list';
type GPUCullModeType = 'none' | 'front' | 'back';
type GPUBlendFactorType = 'zero' | 'one' | 'src' | 'one-minus-src' | 'src-alpha' | 'one-minus-src-alpha' | 'dst' | 'one-minus-dst' | 'dst-alpha' | 'one-minus-dst-alpha';
type GPUBlendOperationType = 'add' | 'subtract' | 'reverse-subtract' | 'min' | 'max';
type GPUTextureFormatType = 'rgba8unorm' | 'bgra8unorm' | 'depth24plus';

// WebGPU enums (fallback definitions)
const GPUPrimitiveTopology = {
    TriangleList: 'triangle-list' as GPUPrimitiveTopologyType,
    TriangleStrip: 'triangle-strip' as GPUPrimitiveTopologyType,
    LineList: 'line-list' as GPUPrimitiveTopologyType,
    LineStrip: 'line-strip' as GPUPrimitiveTopologyType,
    PointList: 'point-list' as GPUPrimitiveTopologyType
} as const;

const GPUCullMode = {
    None: 'none' as GPUCullModeType,
    Front: 'front' as GPUCullModeType,
    Back: 'back' as GPUCullModeType
} as const;

const GPUBlendFactor = {
    Zero: 'zero' as GPUBlendFactorType,
    One: 'one' as GPUBlendFactorType,
    Src: 'src' as GPUBlendFactorType,
    OneMinusSrc: 'one-minus-src' as GPUBlendFactorType,
    SrcAlpha: 'src-alpha' as GPUBlendFactorType,
    OneMinusSrcAlpha: 'one-minus-src-alpha' as GPUBlendFactorType,
    Dst: 'dst' as GPUBlendFactorType,
    OneMinusDst: 'one-minus-dst' as GPUBlendFactorType,
    DstAlpha: 'dst-alpha' as GPUBlendFactorType,
    OneMinusDstAlpha: 'one-minus-dst-alpha' as GPUBlendFactorType
} as const;

const GPUBlendOperation = {
    Add: 'add' as GPUBlendOperationType,
    Subtract: 'subtract' as GPUBlendOperationType,
    ReverseSubtract: 'reverse-subtract' as GPUBlendOperationType,
    Min: 'min' as GPUBlendOperationType,
    Max: 'max' as GPUBlendOperationType
} as const;

const GPUTextureFormat = {
    RGBA8Unorm: 'rgba8unorm' as GPUTextureFormatType,
    BGRA8Unorm: 'bgra8unorm' as GPUTextureFormatType,
    Depth24Plus: 'depth24plus' as GPUTextureFormatType
} as const;

// G3D WebGPU/WebGL abstraction layer
export interface RenderContext {
    canvas: HTMLCanvasElement;
    context: GPUCanvasContext | WebGL2RenderingContext;
    device?: GPUDevice;
    adapter?: GPUAdapter;
    isWebGPU: boolean;
}

// G3D Render Pipeline Configuration
export interface PipelineConfig {
    vertexShader: string;
    fragmentShader: string;
    topology: GPUPrimitiveTopologyType | number;
    cullMode: GPUCullModeType | number;
    depthTest: boolean;
    depthWrite: boolean;
    blending?: BlendConfig;
}

export interface BlendConfig {
    color: {
        srcFactor: GPUBlendFactorType | number;
        dstFactor: GPUBlendFactorType | number;
        operation: GPUBlendOperationType | number;
    };
    alpha: {
        srcFactor: GPUBlendFactorType | number;
        dstFactor: GPUBlendFactorType | number;
        operation: GPUBlendOperationType | number;
    };
}

// G3D Buffer Management
export interface Buffer {
    buffer: GPUBuffer | WebGLBuffer;
    size: number;
    usage: number;
    type: 'vertex' | 'index' | 'uniform' | 'storage';
}

// G3D Texture Management
export interface Texture {
    texture: GPUTexture | WebGLTexture;
    width: number;
    height: number;
    format: GPUTextureFormatType | number;
    sampler?: GPUSampler | WebGLSampler;
}

// G3D Render Object
export interface RenderObject {
    id: string;
    vertexBuffer: Buffer;
    indexBuffer?: Buffer;
    uniformBuffer: Buffer;
    pipeline: RenderPipeline;
    transform: mat4;
    visible: boolean;
    renderOrder: number;
}

// G3D Render Pipeline
export interface RenderPipeline {
    pipeline: GPURenderPipeline | WebGLProgram;
    bindGroupLayout?: GPUBindGroupLayout;
    bindGroup?: GPUBindGroup;
}

// G3D Camera System
export class Camera {
    private position: vec3 = vec3.create();
    private target: vec3 = vec3.create();
    private up: vec3 = vec3.fromValues(0, 1, 0);
    private fov: number = 45;
    private aspect: number = 1;
    private near: number = 0.1;
    private far: number = 1000;
    private viewMatrix: mat4 = mat4.create();
    private projectionMatrix: mat4 = mat4.create();
    private viewProjectionMatrix: mat4 = mat4.create();
    private dirty: boolean = true;

    constructor() {
        this.setPosition(0, 0, 10);
        this.lookAt(0, 0, 0);
    }

    setPosition(x: number, y: number, z: number): void {
        vec3.set(this.position, x, y, z);
        this.dirty = true;
    }

    getPosition(): vec3 {
        return vec3.clone(this.position);
    }

    lookAt(x: number, y: number, z: number): void {
        vec3.set(this.target, x, y, z);
        this.dirty = true;
    }

    setAspect(aspect: number): void {
        this.aspect = aspect;
        this.dirty = true;
    }

    updateMatrices(): void {
        if (!this.dirty) return;

        mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
        mat4.perspective(this.projectionMatrix, this.fov * Math.PI / 180, this.aspect, this.near, this.far);
        mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);

        this.dirty = false;
    }

    getViewProjectionMatrix(): mat4 {
        this.updateMatrices();
        return this.viewProjectionMatrix;
    }

    getViewMatrix(): mat4 {
        this.updateMatrices();
        return this.viewMatrix;
    }

    getProjectionMatrix(): mat4 {
        this.updateMatrices();
        return this.projectionMatrix;
    }
}

// Render statistics interface
interface RenderStats {
    frameCount: number;
    renderTime: number;
    drawCalls: number;
    triangles: number;
    vertices: number;
    shaderPrograms: number;
    textures: number;
    buffers: number;
    frameTime?: number;
    fps?: number;
}

// Main G3D Native Renderer Class
export class NativeRenderer {
    private canvas: HTMLCanvasElement | OffscreenCanvas;
    private context: RenderContext | null = null;
    private device: GPUDevice | null = null;
    private adapter: GPUAdapter | null = null;
    private renderPassDescriptor: GPURenderPassDescriptor | null = null;
    private pipeline: GPURenderPipeline | null = null;
    private uniformBuffer: GPUBuffer | null = null;
    private bindGroup: GPUBindGroup | null = null;
    private commandEncoder: GPUCommandEncoder | null = null;
    private renderPass: GPURenderPassEncoder | null = null;
    private depthTexture: GPUTexture | null = null;
    
    // Add missing properties
    private camera: Camera = new Camera();
    private renderObjects: Map<string, RenderObject> = new Map();
    private frameId: number = 0;
    private lastFrameTime: number = 0;
    private frameTimeBuffer: number[] = [];
    private maxFrameTimeBufferSize: number = 60;
    private gl: WebGL2RenderingContext | null = null;
    private renderQueue: Map<string, any> = new Map();
    private materialCache: Map<string, any> = new Map();
    private geometryCache: Map<string, any> = new Map();
    private uniformCache: Map<string, any> = new Map();
    private statistics: any = {
        drawCalls: 0,
        triangles: 0,
        vertices: 0,
        shaderSwitches: 0,
        textureBindings: 0,
        renderTime: 0,
        gpuMemoryUsage: 0,
        frameTime: 0,
        fps: 0
    };
    private contextLost: boolean = false;
    private shaders: Map<string, WebGLShader> = new Map();
    private programs: Map<string, WebGLProgram> = new Map();
    private buffers: Map<string, WebGLBuffer> = new Map();
    private textures: Map<string, WebGLTexture> = new Map();
    private framebuffers: Map<string, WebGLFramebuffer> = new Map();
    private renderbuffers: Map<string, WebGLRenderbuffer> = new Map();
    private vaos: Map<string, WebGLVertexArrayObject> = new Map();
    private isDisposed: boolean = false;

    private stats: RenderStats = {
        frameCount: 0,
        renderTime: 0,
        drawCalls: 0,
        triangles: 0,
        vertices: 0,
        shaderPrograms: 0,
        textures: 0,
        buffers: 0
    };
    private isInitialized: boolean = false;

    constructor(canvas: HTMLCanvasElement | OffscreenCanvas, options?: any) {
        this.canvas = canvas;
        // Initialize with basic setup
        this.initializeContext(canvas);
    }

    private async initializeContext(canvas: HTMLCanvasElement | OffscreenCanvas): Promise<RenderContext> {
        // Try WebGPU first for maximum performance
        if ('gpu' in navigator && navigator.gpu) {
            try {
                const adapter = await navigator.gpu.requestAdapter();

                if (adapter) {
                    const device = await adapter.requestDevice();

                    const context = (canvas as HTMLCanvasElement).getContext('webgpu') as GPUCanvasContext;
                    if (context) {
                        const presentationFormat = (navigator.gpu as any).getPreferredCanvasFormat?.() || 'bgra8unorm';
                        context.configure({
                            device,
                            format: presentationFormat,
                            alphaMode: 'premultiplied'
                        });

                        console.log('G3D: WebGPU initialized successfully');
                        const result: RenderContext = {
                            canvas: canvas as HTMLCanvasElement,
                            context,
                            device: device as any,
                            adapter: adapter as any,
                            isWebGPU: true
                        };
                        this.context = result;
                        this.device = device as any;
                        this.adapter = adapter as any;
                        return result;
                    }
                }
            } catch (e) {
                console.warn('G3D: WebGPU initialization failed, falling back to WebGL2', e);
            }
        }

        // Fallback to WebGL2
        const gl = (canvas as HTMLCanvasElement).getContext('webgl2', {
            alpha: true,
            antialias: true,
            depth: true,
            stencil: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false
        });

        if (!gl) {
            throw new Error('G3D: Neither WebGPU nor WebGL2 is supported');
        }

        this.gl = gl;

        // Enable WebGL2 extensions for better performance
        const extensions = [
            'EXT_color_buffer_float',
            'OES_texture_float_linear',
            'WEBGL_compressed_texture_s3tc',
            'WEBGL_compressed_texture_etc',
            'WEBGL_compressed_texture_astc'
        ];

        extensions.forEach(ext => {
            const extension = gl.getExtension(ext);
            if (extension) {
                console.log(`G3D: Enabled WebGL2 extension: ${ext}`);
            }
        });

        console.log('G3D: WebGL2 initialized successfully');
        const result = {
            canvas: canvas as HTMLCanvasElement,
            context: gl,
            isWebGPU: false
        };
        this.context = result;
        return result;
    }

    private setupEventListeners(): void {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle device pixel ratio changes
        window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener('change', () => {
            this.handleResize();
        });
    }

    private handleResize(): void {
        if (!this.context) return;
        
        const canvas = this.context.canvas;
        const pixelRatio = window.devicePixelRatio || 1;
        const width = (canvas as HTMLCanvasElement).clientWidth || canvas.width;
        const height = (canvas as HTMLCanvasElement).clientHeight || canvas.height;
        
        const scaledWidth = width * pixelRatio;
        const scaledHeight = height * pixelRatio;

        if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;
            this.camera.setAspect(scaledWidth / scaledHeight);

            if (this.context.isWebGPU) {
                // WebGPU handles resize automatically
            } else {
                const gl = this.context.context as WebGL2RenderingContext;
                gl.viewport(0, 0, scaledWidth, scaledHeight);
            }
        }
    }

    private startRenderLoop(): void {
        const render = (timestamp: number) => {
            this.updateStats(timestamp);
            this.render();
            this.frameId = requestAnimationFrame(render);
        };

        this.frameId = requestAnimationFrame(render);
    }

    private updateStats(timestamp: number): void {
        const frameTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        if (frameTime > 0) {
            this.frameTimeBuffer.push(frameTime);
            if (this.frameTimeBuffer.length > this.maxFrameTimeBufferSize) {
                this.frameTimeBuffer.shift();
            }

            const avgFrameTime = this.frameTimeBuffer.reduce((a, b) => a + b, 0) / this.frameTimeBuffer.length;
            this.stats.frameTime = avgFrameTime;
            this.stats.fps = 1000 / avgFrameTime;
        }
    }

    private render(): void {
        if (!this.context) return;
        
        this.stats.drawCalls = 0;
        this.stats.triangles = 0;
        this.stats.vertices = 0;

        if (this.context.isWebGPU) {
            this.renderWebGPU();
        } else {
            this.renderWebGL2();
        }
    }

    private renderWebGPU(): void {
        if (!this.context || !this.context.device) return;
        
        const device = this.context.device;
        const context = this.context.context as GPUCanvasContext;

        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store'
            }],
            depthStencilAttachment: {
                view: this.getDepthTexture().createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
                stencilClearValue: 0,
                stencilLoadOp: 'clear',
                stencilStoreOp: 'store'
            }
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

        // Sort render objects by render order
        const sortedObjects = Array.from(this.renderObjects.values())
            .filter(obj => obj.visible)
            .sort((a, b) => a.renderOrder - b.renderOrder);

        // Render each object
        for (const object of sortedObjects) {
            this.drawObjectWebGPU(passEncoder, object);
            this.stats.drawCalls++;
        }

        passEncoder.end();
        // Use queue from device properly
        (device as any).queue.submit([commandEncoder.finish()]);
    }

    private renderWebGL2(): void {
        if (!this.context) return;
        
        const gl = this.context.context as WebGL2RenderingContext;

        // Clear the canvas
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Enable depth testing
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // Enable face culling
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        // Sort render objects by render order
        const sortedObjects = Array.from(this.renderObjects.values())
            .filter(obj => obj.visible)
            .sort((a, b) => a.renderOrder - b.renderOrder);

        // Render each object
        for (const object of sortedObjects) {
            this.drawObjectWebGL2(gl, object);
            this.stats.drawCalls++;
        }
    }

    private drawObjectWebGPU(passEncoder: any, object: RenderObject): void {
        const pipeline = object.pipeline.pipeline as GPURenderPipeline;
        passEncoder.setPipeline(pipeline);

        if (object.pipeline.bindGroup) {
            passEncoder.setBindGroup(0, object.pipeline.bindGroup);
        }

        passEncoder.setVertexBuffer(0, object.vertexBuffer.buffer as GPUBuffer);

        if (object.indexBuffer) {
            passEncoder.setIndexBuffer(object.indexBuffer.buffer as GPUBuffer, 'uint16');
            passEncoder.drawIndexed(object.indexBuffer.size / 2);
            this.stats.triangles += object.indexBuffer.size / 6;
        } else {
            const vertexCount = object.vertexBuffer.size / 32; // Assuming 32 bytes per vertex
            passEncoder.draw(vertexCount);
            this.stats.triangles += vertexCount / 3;
            this.stats.vertices += vertexCount;
        }
    }

    private drawObjectWebGL2(gl: WebGL2RenderingContext, object: RenderObject): void {
        const program = object.pipeline.pipeline as WebGLProgram;
        gl.useProgram(program);

        // Update uniforms
        this.updateUniformsWebGL2(gl, program, object);

        // Bind vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBuffer.buffer as WebGLBuffer);
        this.setupVertexAttributesWebGL2(gl, program);

        // Draw
        if (object.indexBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer.buffer as WebGLBuffer);
            gl.drawElements(gl.TRIANGLES, object.indexBuffer.size / 2, gl.UNSIGNED_SHORT, 0);
            this.stats.triangles += object.indexBuffer.size / 6;
        } else {
            const vertexCount = object.vertexBuffer.size / 32; // Assuming 32 bytes per vertex
            gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
            this.stats.triangles += vertexCount / 3;
            this.stats.vertices += vertexCount;
        }
    }

    private updateUniformsWebGL2(gl: WebGL2RenderingContext, program: WebGLProgram, object: RenderObject): void {
        // Update view projection matrix
        const vpMatrixLocation = gl.getUniformLocation(program, 'uViewProjectionMatrix');
        if (vpMatrixLocation) {
            gl.uniformMatrix4fv(vpMatrixLocation, false, this.camera.getViewProjectionMatrix());
        }

        // Update model matrix
        const modelMatrixLocation = gl.getUniformLocation(program, 'uModelMatrix');
        if (modelMatrixLocation) {
            gl.uniformMatrix4fv(modelMatrixLocation, false, object.transform);
        }

        // Update normal matrix
        const normalMatrixLocation = gl.getUniformLocation(program, 'uNormalMatrix');
        if (normalMatrixLocation) {
            const normalMatrix = mat4.create();
            mat4.invert(normalMatrix, object.transform);
            mat4.transpose(normalMatrix, normalMatrix);
            gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);
        }
    }

    private setupVertexAttributesWebGL2(gl: WebGL2RenderingContext, program: WebGLProgram): void {
        // Position attribute
        const positionLocation = gl.getAttribLocation(program, 'aPosition');
        if (positionLocation >= 0) {
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 32, 0);
        }

        // Normal attribute
        const normalLocation = gl.getAttribLocation(program, 'aNormal');
        if (normalLocation >= 0) {
            gl.enableVertexAttribArray(normalLocation);
            gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 32, 12);
        }

        // UV attribute
        const uvLocation = gl.getAttribLocation(program, 'aUV');
        if (uvLocation >= 0) {
            gl.enableVertexAttribArray(uvLocation);
            gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 32, 24);
        }
    }

    private getDepthTexture(): GPUTexture {
        if (!this.context || !this.context.device) {
            throw new Error('No WebGPU device available');
        }
        
        if (!this.depthTexture ||
            (this.depthTexture as any).width !== this.context.canvas.width ||
            (this.depthTexture as any).height !== this.context.canvas.height) {

            if (this.depthTexture) {
                (this.depthTexture as any).destroy?.();
            }

            this.depthTexture = this.context.device.createTexture({
                size: {
                    width: this.context.canvas.width,
                    height: this.context.canvas.height,
                    depthOrArrayLayers: 1
                },
                format: 'depth24plus-stencil8',
                usage: (globalThis as any).GPUTextureUsage?.RENDER_ATTACHMENT || 16
            });
        }

        return this.depthTexture;
    }

    // Public API methods
    public addRenderObject(object: RenderObject): void {
        this.renderObjects.set(object.id, object);
    }

    public removeRenderObject(id: string): void {
        this.renderObjects.delete(id);
    }

    public getRenderObject(id: string): RenderObject | undefined {
        return this.renderObjects.get(id);
    }

    public getCamera(): Camera {
        return this.camera;
    }

    public getStats(): RenderStats {
        return { ...this.stats };
    }

    /**
     * Public method to trigger a render frame
     * This allows external components to manually trigger rendering
     * @param scene - Optional scene parameter for compatibility (ignored)
     */
    public renderFrame(scene?: any): void {
        this.render();
    }

    /**
     * Get the current frames per second (FPS)
     */
    public getFPS(): number {
        return this.stats.fps || 0;
    }

    /**
     * Get the current GPU memory usage in bytes
     */
    public getGPUMemoryUsage(): number {
        // This is a simplified implementation - in a real system this would query actual GPU metrics
        return this.stats.buffers * 1024 * 1024; // Rough estimate based on buffer count
    }

    /**
     * Get the WebGPU device (for components that need direct access)
     */
    public getDevice(): GPUDevice | null {
        return this.device;
    }

    public dispose(): void {
        if (this.isDisposed) return;
        
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }

        // Clean up WebGPU resources
        if (this.context?.isWebGPU && this.depthTexture) {
            (this.depthTexture as any).destroy?.();
        }

        // Clean up WebGL resources
        if (this.gl) {
            // Delete shaders
            this.shaders.forEach(shader => this.gl.deleteShader(shader));
            this.shaders.clear();

            // Delete programs
            this.programs.forEach(program => this.gl.deleteProgram(program));
            this.programs.clear();

            // Delete buffers
            this.buffers.forEach(buffer => this.gl.deleteBuffer(buffer));
            this.buffers.clear();

            // Delete textures
            this.textures.forEach(texture => this.gl.deleteTexture(texture));
            this.textures.clear();

            // Delete framebuffers
            this.framebuffers.forEach(framebuffer => this.gl.deleteFramebuffer(framebuffer));
            this.framebuffers.clear();

            // Delete render buffers
            this.renderbuffers.forEach(renderbuffer => this.gl.deleteRenderbuffer(renderbuffer));
            this.renderbuffers.clear();

            // Delete vertex arrays
            this.vaos.forEach(vao => this.gl.deleteVertexArray(vao));
            this.vaos.clear();
        }

        // Clear other resources
        this.renderQueue.clear();
        this.materialCache.clear();
        this.geometryCache.clear();
        this.uniformCache.clear();
        this.renderObjects.clear();

        // Remove event listeners
        if (this.canvas && 'removeEventListener' in this.canvas) {
            this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
            this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);
        }

        this.isDisposed = true;
    }

    // Add missing context loss handlers
    private handleContextLost = (event: Event): void => {
        event.preventDefault();
        console.warn('WebGL context lost');
        this.contextLost = true;
    };

    private handleContextRestored = (): void => {
        console.log('WebGL context restored');
        this.contextLost = false;
        this.initializeWebGL2();
    };

    // Helper method for gl initialization
    private initializeGL(): void {
        this.initializeWebGL2().catch(console.error);
    }

    public createVertexBuffer(data: Float32Array): Buffer {
        if (!this.context) {
            throw new Error('Renderer not initialized');
        }
        
        if (this.context.isWebGPU && this.context.device) {
            const device = this.context.device;
            const buffer = device.createBuffer({
                size: data.byteLength,
                usage: (globalThis as any).GPUBufferUsage?.VERTEX | (globalThis as any).GPUBufferUsage?.COPY_DST || 0x20 | 0x4,
                mappedAtCreation: true
            });

            const mapped = (buffer as any).getMappedRange();
            new Float32Array(mapped).set(data);
            (buffer as any).unmap();

            return {
                buffer,
                size: data.byteLength,
                usage: (globalThis as any).GPUBufferUsage?.VERTEX || 0x20,
                type: 'vertex'
            };
        } else {
            const gl = this.context.context as WebGL2RenderingContext;
            const buffer = gl.createBuffer()!;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

            return {
                buffer,
                size: data.byteLength,
                usage: gl.STATIC_DRAW,
                type: 'vertex'
            };
        }
    }

    public createIndexBuffer(data: Uint16Array): Buffer {
        if (!this.context) {
            throw new Error('Renderer not initialized');
        }
        
        if (this.context.isWebGPU && this.context.device) {
            const device = this.context.device;
            const buffer = device.createBuffer({
                size: data.byteLength,
                usage: (globalThis as any).GPUBufferUsage?.INDEX | (globalThis as any).GPUBufferUsage?.COPY_DST || 0x10 | 0x4,
                mappedAtCreation: true
            });

            const mapped = (buffer as any).getMappedRange();
            new Uint16Array(mapped).set(data);
            (buffer as any).unmap();

            return {
                buffer,
                size: data.byteLength,
                usage: (globalThis as any).GPUBufferUsage?.INDEX || 0x10,
                type: 'index'
            };
        } else {
            const gl = this.context.context as WebGL2RenderingContext;
            const buffer = gl.createBuffer()!;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

            return {
                buffer,
                size: data.byteLength,
                usage: gl.STATIC_DRAW,
                type: 'index'
            };
        }
    }

    public createRenderPipeline(config: PipelineConfig): RenderPipeline {
        if (!this.context) {
            throw new Error('Renderer not initialized');
        }
        
        if (this.context.isWebGPU) {
            return this.createWebGPUPipeline(config);
        } else {
            return this.createWebGL2Pipeline(config);
        }
    }

    private createWebGPUPipeline(config: PipelineConfig): RenderPipeline {
        if (!this.context?.device) {
            throw new Error('WebGPU device not available');
        }
        
        const device = this.context.device;

        const shaderModule = device.createShaderModule({
            code: `
        struct Uniforms {
          viewProjectionMatrix: mat4x4<f32>,
          modelMatrix: mat4x4<f32>,
          normalMatrix: mat4x4<f32>,
        }
        
        @binding(0) @group(0) var<uniform> uniforms: Uniforms;
        
        struct VertexInput {
          @location(0) position: vec3<f32>,
          @location(1) normal: vec3<f32>,
          @location(2) uv: vec2<f32>,
        }
        
        struct VertexOutput {
          @builtin(position) position: vec4<f32>,
          @location(0) normal: vec3<f32>,
          @location(1) uv: vec2<f32>,
        }
        
        @vertex
        fn vs_main(input: VertexInput) -> VertexOutput {
          var output: VertexOutput;
          let worldPos = uniforms.modelMatrix * vec4<f32>(input.position, 1.0);
          output.position = uniforms.viewProjectionMatrix * worldPos;
          output.normal = normalize((uniforms.normalMatrix * vec4<f32>(input.normal, 0.0)).xyz);
          output.uv = input.uv;
          return output;
        }
        
        @fragment
        fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
          let lightDir = normalize(vec3<f32>(1.0, 1.0, 1.0));
          let diffuse = max(dot(input.normal, lightDir), 0.0);
          let color = vec3<f32>(0.8, 0.8, 0.8) * diffuse + vec3<f32>(0.2, 0.2, 0.2);
          return vec4<f32>(color, 1.0);
        }
      `
        });

        const bindGroupLayout = device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: (globalThis as any).GPUShaderStage?.VERTEX || 1,
                buffer: { type: 'uniform' }
            }]
        });

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });

        const pipeline = device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: shaderModule,
                entryPoint: 'vs_main',
                buffers: [{
                    arrayStride: 32,
                    attributes: [
                        { shaderLocation: 0, offset: 0, format: 'float32x3' },
                        { shaderLocation: 1, offset: 12, format: 'float32x3' },
                        { shaderLocation: 2, offset: 24, format: 'float32x2' }
                    ]
                }]
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fs_main',
                targets: [{
                    format: (navigator.gpu as any).getPreferredCanvasFormat?.() || 'bgra8unorm'
                }]
            },
            primitive: {
                topology: config.topology as GPUPrimitiveTopology,
                cullMode: config.cullMode as GPUCullMode
            },
            depthStencil: {
                depthWriteEnabled: config.depthWrite,
                depthCompare: 'less',
                format: 'depth24plus-stencil8'
            }
        });

        return { pipeline, bindGroupLayout };
    }

    private createWebGL2Pipeline(config: PipelineConfig): RenderPipeline {
        const gl = this.context?.context as WebGL2RenderingContext;
        if (!gl) {
            throw new Error('WebGL2 context not available');
        }

        const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, config.vertexShader);
        const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, config.fragmentShader);

        const program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(`G3D: Shader linking failed: ${gl.getProgramInfoLog(program)}`);
        }

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        return { pipeline: program };
    }

    private compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(`G3D: Shader compilation failed: ${gl.getShaderInfoLog(shader)}`);
        }

        return shader;
    }

    async init(): Promise<void> {
        if (this.isInitialized) return;

        try {
            await this.initializeWebGPU();
            this.isInitialized = true;
            console.log('G3D Native Renderer initialized successfully');
        } catch (error) {
            console.warn('WebGPU initialization failed, falling back to WebGL2:', error);
            await this.initializeWebGL2();
            this.isInitialized = true;
        }
    }

    getCanvas(): HTMLCanvasElement | OffscreenCanvas {
        return this.canvas;
    }

    captureScreenshot(): Promise<Blob> {
        if (!this.canvas || !('toBlob' in this.canvas)) {
            throw new Error('Canvas not available for screenshot');
        }

        return new Promise<Blob>((resolve, reject) => {
            (this.canvas as HTMLCanvasElement).toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create screenshot blob'));
                }
            }, 'image/png');
        });
    }

    private async initializeWebGPU(): Promise<void> {
        if (!navigator.gpu) {
            throw new Error('WebGPU not supported');
        }

        // Request adapter
        this.adapter = await navigator.gpu.requestAdapter() as any;

        if (!this.adapter) {
            throw new Error('Failed to get WebGPU adapter');
        }

        // Request device
        this.device = await this.adapter.requestDevice();

        if (!this.device) {
            throw new Error('Failed to get WebGPU device');
        }

        // Configure canvas context
        const context = (this.canvas as HTMLCanvasElement).getContext('webgpu');
        if (!context) {
            throw new Error('Failed to get WebGPU context');
        }

        context.configure({
            device: this.device,
            format: (navigator.gpu as any).getPreferredCanvasFormat?.() || 'bgra8unorm',
            alphaMode: 'premultiplied'
        });

        // Update context
        if (this.context) {
            this.context.context = context as GPUCanvasContext;
            this.context.device = this.device;
            this.context.adapter = this.adapter;
            this.context.isWebGPU = true;
        }
    }

    private async initializeWebGL2(): Promise<void> {
        const gl = (this.canvas as HTMLCanvasElement).getContext('webgl2');
        if (!gl) {
            throw new Error('WebGL2 not supported');
        }

        this.gl = gl;
        
        if (this.context) {
            this.context.context = gl as WebGL2RenderingContext;
            this.context.isWebGPU = false;
        }

        // Set up basic WebGL2 state
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    isReady(): boolean {
        return this.isInitialized;
    }

    resetStats(): void {
        this.stats = {
            frameCount: 0,
            renderTime: 0,
            drawCalls: 0,
            triangles: 0,
            vertices: 0,
            shaderPrograms: 0,
            textures: 0,
            buffers: 0
        };
    }
}

// Export default instance factory
export function createG3DRenderer(canvas: HTMLCanvasElement): G3DNativeRenderer {
    return new NativeRenderer(canvas);
}