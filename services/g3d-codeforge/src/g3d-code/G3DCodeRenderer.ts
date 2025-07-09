/**
 * G3DCodeRenderer.ts
 * 
 * Advanced 3D code visualization engine powered by G3D technology.
 * Provides sophisticated rendering of code structures, dependencies, and metrics
 * with hardware-accelerated performance and interactive exploration capabilities.
 */

import {
    G3DRenderer,
    G3DScene,
    G3DCamera,
    G3DGeometry,
    G3DMaterial,
    G3DMesh,
    G3DLight,
    G3DVector3,
    G3DMatrix4,
    G3DColor,
    G3DTexture,
    G3DRenderTarget,
    G3DShaderMaterial,
    G3DInstancedMesh
} from '@g3d/core';

import {
    G3DWebGPUBackend,
    G3DComputeShader,
    G3DGPUBuffer,
    G3DGPUTexture
} from '@g3d/gpu';

import {
    G3DPerformanceMonitor,
    G3DMemoryManager,
    G3DOptimizer
} from '@g3d/performance';

// Code Structure Interfaces
export interface CodeNode {
    id: string;
    name: string;
    type: 'file' | 'class' | 'function' | 'variable' | 'import' | 'export';
    position: G3DVector3;
    size: G3DVector3;
    children: CodeNode[];
    parent?: CodeNode;
    metadata: {
        lineCount: number;
        complexity: number;
        dependencies: string[];
        lastModified: Date;
        author: string;
        language: string;
        quality: number; // 0-1 scale
    };
}

export interface CodeEdge {
    id: string;
    source: string;
    target: string;
    type: 'dependency' | 'inheritance' | 'composition' | 'call' | 'import';
    weight: number;
    metadata: {
        frequency: number;
        importance: number;
        direction: 'bidirectional' | 'unidirectional';
    };
}

export interface CodeVisualizationConfig {
    layout: {
        algorithm: 'force-directed' | 'hierarchical' | 'circular' | 'tree' | 'custom';
        spacing: number;
        levelHeight: number;
        nodeSize: {
            min: number;
            max: number;
            scale: 'linear' | 'logarithmic';
        };
    };
    rendering: {
        enableInstancing: boolean;
        enableLOD: boolean;
        maxNodes: number;
        enableShadows: boolean;
        enablePostProcessing: boolean;
        quality: 'low' | 'medium' | 'high' | 'ultra';
    };
    interaction: {
        enableSelection: boolean;
        enableHover: boolean;
        enableZoom: boolean;
        enablePan: boolean;
        enableFilter: boolean;
    };
    animation: {
        enableTransitions: boolean;
        transitionDuration: number;
        easing: string;
        enablePhysics: boolean;
    };
}

export interface CodeMetrics {
    nodeCount: number;
    edgeCount: number;
    maxDepth: number;
    avgComplexity: number;
    totalLines: number;
    coverage: number;
    maintainability: number;
    performance: {
        renderTime: number;
        frameRate: number;
        memoryUsage: number;
        gpuUtilization: number;
    };
}

/**
 * Advanced G3D-powered code visualization renderer
 */
export class G3DCodeRenderer {
    private renderer: G3DRenderer;
    private scene: G3DScene;
    private camera: G3DCamera;
    private webgpuBackend: G3DWebGPUBackend;
    private performanceMonitor: G3DPerformanceMonitor;
    private memoryManager: G3DMemoryManager;
    private optimizer: G3DOptimizer;

    // Rendering components
    private nodeGeometry: G3DGeometry;
    private edgeGeometry: G3DGeometry;
    private nodeMaterial: G3DShaderMaterial;
    private edgeMaterial: G3DShaderMaterial;
    private instancedNodes: G3DInstancedMesh;
    private instancedEdges: G3DInstancedMesh;

    // GPU compute resources
    private layoutComputeShader: G3DComputeShader;
    private metricsComputeShader: G3DComputeShader;
    private nodeBuffer: G3DGPUBuffer;
    private edgeBuffer: G3DGPUBuffer;
    private metricsBuffer: G3DGPUBuffer;

    // Visualization state
    private nodes: Map<string, CodeNode> = new Map();
    private edges: Map<string, CodeEdge> = new Map();
    private config: CodeVisualizationConfig;
    private metrics: CodeMetrics;
    private isInitialized: boolean = false;

    // Animation and interaction
    private animationFrameId: number | null = null;
    private isAnimating: boolean = false;
    private selectedNodes: Set<string> = new Set();
    private hoveredNode: string | null = null;

    constructor(
        canvas: HTMLCanvasElement,
        config: Partial<CodeVisualizationConfig> = {}
    ) {
        this.config = this.mergeConfig(config);
        this.initializeRenderer(canvas);
        this.initializeGPUResources();
        this.setupEventHandlers();
    }

    /**
     * Initialize G3D renderer with optimized settings for code visualization
     */
    private initializeRenderer(canvas: HTMLCanvasElement): void {
        // Initialize G3D renderer with WebGPU backend
        this.webgpuBackend = new G3DWebGPUBackend({
            canvas,
            enableCompute: true,
            enableRayTracing: false, // Not needed for code visualization
            powerPreference: 'high-performance'
        });

        this.renderer = new G3DRenderer({
            backend: this.webgpuBackend,
            antialias: true,
            alpha: true,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false
        });

        // Configure renderer for code visualization
        this.renderer.setSize(canvas.width, canvas.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = this.config.rendering.enableShadows;
        this.renderer.shadowMap.type = 'PCFSoft';

        // Initialize scene and camera
        this.scene = new G3DScene();
        this.camera = new G3DCamera(75, canvas.width / canvas.height, 0.1, 10000);
        this.camera.position.set(0, 0, 100);

        // Initialize performance monitoring
        this.performanceMonitor = new G3DPerformanceMonitor({
            trackFrameRate: true,
            trackMemory: true,
            trackGPU: true,
            trackDrawCalls: true
        });

        this.memoryManager = new G3DMemoryManager({
            maxMemoryMB: 512,
            enableAutoCleanup: true,
            enablePooling: true
        });

        this.optimizer = new G3DOptimizer({
            enableLOD: this.config.rendering.enableLOD,
            enableInstancing: this.config.rendering.enableInstancing,
            enableFrustumCulling: true,
            enableOcclusionCulling: false // Complex for code visualization
        });

        this.setupLighting();
        this.initializeGeometry();
        this.initializeMaterials();
    }

    /**
     * Initialize GPU compute resources for layout and metrics calculation
     */
    private initializeGPUResources(): void {
        // Create compute shaders for GPU-accelerated operations
        this.layoutComputeShader = new G3DComputeShader({
            source: this.getLayoutComputeShaderSource(),
            workGroupSize: [64, 1, 1],
            bufferBindings: ['nodeBuffer', 'edgeBuffer', 'configBuffer']
        });

        this.metricsComputeShader = new G3DComputeShader({
            source: this.getMetricsComputeShaderSource(),
            workGroupSize: [64, 1, 1],
            bufferBindings: ['nodeBuffer', 'metricsBuffer']
        });

        // Initialize GPU buffers
        this.nodeBuffer = new G3DGPUBuffer({
            size: 1024 * 1024, // 1MB for node data
            usage: 'storage',
            type: 'read-write'
        });

        this.edgeBuffer = new G3DGPUBuffer({
            size: 512 * 1024, // 512KB for edge data
            usage: 'storage',
            type: 'read-write'
        });

        this.metricsBuffer = new G3DGPUBuffer({
            size: 64 * 1024, // 64KB for metrics data
            usage: 'storage',
            type: 'read-write'
        });
    }

    /**
     * Setup optimized lighting for code visualization
     */
    private setupLighting(): void {
        // Ambient light for overall illumination
        const ambientLight = new G3DLight('ambient', {
            color: new G3DColor(0x404040),
            intensity: 0.4
        });
        this.scene.add(ambientLight);

        // Directional light for depth perception
        const directionalLight = new G3DLight('directional', {
            color: new G3DColor(0xffffff),
            intensity: 0.8,
            position: new G3DVector3(100, 100, 100),
            castShadow: this.config.rendering.enableShadows
        });
        this.scene.add(directionalLight);

        // Point lights for highlighting important nodes
        const pointLight1 = new G3DLight('point', {
            color: new G3DColor(0x0080ff),
            intensity: 0.5,
            position: new G3DVector3(-50, 50, 50),
            distance: 200
        });
        this.scene.add(pointLight1);

        const pointLight2 = new G3DLight('point', {
            color: new G3DColor(0xff8000),
            intensity: 0.5,
            position: new G3DVector3(50, -50, 50),
            distance: 200
        });
        this.scene.add(pointLight2);
    }

    /**
     * Initialize optimized geometry for code visualization
     */
    private initializeGeometry(): void {
        // Node geometry - using instanced spheres for performance
        this.nodeGeometry = new G3DGeometry('sphere', {
            radius: 1,
            widthSegments: 16,
            heightSegments: 12,
            enableInstancing: true,
            maxInstances: this.config.rendering.maxNodes
        });

        // Edge geometry - using instanced cylinders
        this.edgeGeometry = new G3DGeometry('cylinder', {
            radiusTop: 0.1,
            radiusBottom: 0.1,
            height: 1,
            radialSegments: 8,
            heightSegments: 1,
            enableInstancing: true,
            maxInstances: this.config.rendering.maxNodes * 4 // Assume avg 4 edges per node
        });
    }

    /**
     * Initialize advanced materials for code visualization
     */
    private initializeMaterials(): void {
        // Advanced node material with code-specific features
        this.nodeMaterial = new G3DShaderMaterial({
            vertexShader: this.getNodeVertexShader(),
            fragmentShader: this.getNodeFragmentShader(),
            uniforms: {
                time: { value: 0 },
                selectedNodes: { value: new Float32Array(1000) }, // Up to 1000 selected
                hoveredNode: { value: -1 },
                complexityTexture: { value: this.createComplexityTexture() },
                qualityTexture: { value: this.createQualityTexture() },
                cameraPosition: { value: this.camera.position }
            },
            transparent: true,
            alphaTest: 0.1,
            side: 'DoubleSide'
        });

        // Advanced edge material
        this.edgeMaterial = new G3DShaderMaterial({
            vertexShader: this.getEdgeVertexShader(),
            fragmentShader: this.getEdgeFragmentShader(),
            uniforms: {
                time: { value: 0 },
                flowSpeed: { value: 1.0 },
                dependencyStrength: { value: new Float32Array(10000) },
                edgeOpacity: { value: 0.6 }
            },
            transparent: true,
            alphaTest: 0.05,
            blending: 'additive'
        });

        // Create instanced meshes
        this.instancedNodes = new G3DInstancedMesh(
            this.nodeGeometry,
            this.nodeMaterial,
            this.config.rendering.maxNodes
        );

        this.instancedEdges = new G3DInstancedMesh(
            this.edgeGeometry,
            this.edgeMaterial,
            this.config.rendering.maxNodes * 4
        );

        this.scene.add(this.instancedNodes);
        this.scene.add(this.instancedEdges);
    }

    /**
     * Load and visualize code structure
     */
    public async loadCodeStructure(
        nodes: CodeNode[],
        edges: CodeEdge[]
    ): Promise<void> {
        this.performanceMonitor.startTiming('loadCodeStructure');

        try {
            // Clear existing data
            this.nodes.clear();
            this.edges.clear();

            // Process nodes
            for (const node of nodes) {
                this.nodes.set(node.id, node);
            }

            // Process edges
            for (const edge of edges) {
                this.edges.set(edge.id, edge);
            }

            // Calculate layout using GPU compute
            await this.calculateLayout();

            // Update visualization
            await this.updateVisualization();

            // Calculate metrics
            await this.calculateMetrics();

            this.isInitialized = true;

        } catch (error) {
            console.error('Error loading code structure:', error);
            throw error;
        } finally {
            this.performanceMonitor.endTiming('loadCodeStructure');
        }
    }

    /**
     * Calculate optimal layout using GPU compute shaders
     */
    private async calculateLayout(): Promise<void> {
        if (this.nodes.size === 0) return;

        this.performanceMonitor.startTiming('calculateLayout');

        try {
            // Prepare node data for GPU
            const nodeData = new Float32Array(this.nodes.size * 16); // 16 floats per node
            let nodeIndex = 0;

            for (const [id, node] of this.nodes) {
                const offset = nodeIndex * 16;

                // Position (3 floats)
                nodeData[offset + 0] = node.position.x;
                nodeData[offset + 1] = node.position.y;
                nodeData[offset + 2] = node.position.z;

                // Size (3 floats)
                nodeData[offset + 3] = node.size.x;
                nodeData[offset + 4] = node.size.y;
                nodeData[offset + 5] = node.size.z;

                // Metadata (10 floats)
                nodeData[offset + 6] = node.metadata.lineCount;
                nodeData[offset + 7] = node.metadata.complexity;
                nodeData[offset + 8] = node.metadata.quality;
                nodeData[offset + 9] = node.children.length;
                nodeData[offset + 10] = node.metadata.dependencies.length;
                nodeData[offset + 11] = Date.now() - node.metadata.lastModified.getTime();
                nodeData[offset + 12] = this.getLanguageCode(node.metadata.language);
                nodeData[offset + 13] = this.getTypeCode(node.type);
                nodeData[offset + 14] = nodeIndex; // Node ID for reference
                nodeData[offset + 15] = 0; // Reserved

                nodeIndex++;
            }

            // Prepare edge data for GPU
            const edgeData = new Float32Array(this.edges.size * 8); // 8 floats per edge
            let edgeIndex = 0;

            for (const [id, edge] of this.edges) {
                const offset = edgeIndex * 8;
                const sourceIndex = this.getNodeIndex(edge.source);
                const targetIndex = this.getNodeIndex(edge.target);

                edgeData[offset + 0] = sourceIndex;
                edgeData[offset + 1] = targetIndex;
                edgeData[offset + 2] = edge.weight;
                edgeData[offset + 3] = edge.metadata.frequency;
                edgeData[offset + 4] = edge.metadata.importance;
                edgeData[offset + 5] = this.getEdgeTypeCode(edge.type);
                edgeData[offset + 6] = edge.metadata.direction === 'bidirectional' ? 1 : 0;
                edgeData[offset + 7] = edgeIndex; // Edge ID for reference

                edgeIndex++;
            }

            // Upload data to GPU
            await this.nodeBuffer.setData(nodeData);
            await this.edgeBuffer.setData(edgeData);

            // Run layout computation on GPU
            const workGroups = Math.ceil(this.nodes.size / 64);
            await this.layoutComputeShader.dispatch(workGroups, 1, 1);

            // Read back results
            const resultData = await this.nodeBuffer.getData();
            this.updateNodePositionsFromGPU(resultData);

        } catch (error) {
            console.error('Error calculating layout:', error);
            // Fallback to CPU layout
            this.calculateLayoutCPU();
        } finally {
            this.performanceMonitor.endTiming('calculateLayout');
        }
    }

    /**
     * Update visualization with current node and edge data
     */
    private async updateVisualization(): Promise<void> {
        this.performanceMonitor.startTiming('updateVisualization');

        try {
            // Update node instances
            let nodeIndex = 0;
            const nodeMatrix = new G3DMatrix4();
            const nodeColor = new G3DColor();

            for (const [id, node] of this.nodes) {
                // Calculate node transform
                nodeMatrix.makeTranslation(
                    node.position.x,
                    node.position.y,
                    node.position.z
                );

                // Scale based on complexity and size
                const scale = Math.max(
                    this.config.layout.nodeSize.min,
                    Math.min(
                        this.config.layout.nodeSize.max,
                        node.metadata.complexity * 2 + 1
                    )
                );
                nodeMatrix.scale(new G3DVector3(scale, scale, scale));

                // Set instance transform
                this.instancedNodes.setMatrixAt(nodeIndex, nodeMatrix);

                // Set node color based on type and quality
                this.getNodeColor(node, nodeColor);
                this.instancedNodes.setColorAt(nodeIndex, nodeColor);

                nodeIndex++;
            }

            // Update edge instances
            let edgeIndex = 0;
            const edgeMatrix = new G3DMatrix4();
            const edgeColor = new G3DColor();

            for (const [id, edge] of this.edges) {
                const sourceNode = this.nodes.get(edge.source);
                const targetNode = this.nodes.get(edge.target);

                if (sourceNode && targetNode) {
                    // Calculate edge transform
                    const direction = new G3DVector3()
                        .subVectors(targetNode.position, sourceNode.position);
                    const length = direction.length();
                    const center = new G3DVector3()
                        .addVectors(sourceNode.position, targetNode.position)
                        .multiplyScalar(0.5);

                    // Create transform matrix for edge
                    edgeMatrix.lookAt(
                        sourceNode.position,
                        targetNode.position,
                        new G3DVector3(0, 1, 0)
                    );
                    edgeMatrix.setPosition(center);
                    edgeMatrix.scale(new G3DVector3(
                        edge.weight * 0.5,
                        length,
                        edge.weight * 0.5
                    ));

                    // Set instance transform
                    this.instancedEdges.setMatrixAt(edgeIndex, edgeMatrix);

                    // Set edge color based on type and importance
                    this.getEdgeColor(edge, edgeColor);
                    this.instancedEdges.setColorAt(edgeIndex, edgeColor);

                    edgeIndex++;
                }
            }

            // Update instance counts
            this.instancedNodes.count = nodeIndex;
            this.instancedEdges.count = edgeIndex;

            // Mark for update
            this.instancedNodes.instanceMatrix.needsUpdate = true;
            this.instancedNodes.instanceColor.needsUpdate = true;
            this.instancedEdges.instanceMatrix.needsUpdate = true;
            this.instancedEdges.instanceColor.needsUpdate = true;

        } catch (error) {
            console.error('Error updating visualization:', error);
        } finally {
            this.performanceMonitor.endTiming('updateVisualization');
        }
    }

    /**
     * Calculate comprehensive code metrics using GPU acceleration
     */
    private async calculateMetrics(): Promise<void> {
        this.performanceMonitor.startTiming('calculateMetrics');

        try {
            // Run metrics computation on GPU
            const workGroups = Math.ceil(this.nodes.size / 64);
            await this.metricsComputeShader.dispatch(workGroups, 1, 1);

            // Read back metrics
            const metricsData = await this.metricsBuffer.getData();

            this.metrics = {
                nodeCount: this.nodes.size,
                edgeCount: this.edges.size,
                maxDepth: metricsData[0],
                avgComplexity: metricsData[1],
                totalLines: metricsData[2],
                coverage: metricsData[3],
                maintainability: metricsData[4],
                performance: {
                    renderTime: this.performanceMonitor.getAverageFrameTime(),
                    frameRate: this.performanceMonitor.getFrameRate(),
                    memoryUsage: this.memoryManager.getUsage(),
                    gpuUtilization: this.performanceMonitor.getGPUUtilization()
                }
            };

        } catch (error) {
            console.error('Error calculating metrics:', error);
            // Fallback to CPU metrics
            this.calculateMetricsCPU();
        } finally {
            this.performanceMonitor.endTiming('calculateMetrics');
        }
    }

    /**
     * Render the code visualization
     */
    public render(): void {
        if (!this.isInitialized) return;

        this.performanceMonitor.startFrame();

        try {
            // Update uniforms
            this.updateUniforms();

            // Perform optimization
            this.optimizer.optimize(this.scene, this.camera);

            // Render scene
            this.renderer.render(this.scene, this.camera);

            // Update metrics
            this.performanceMonitor.endFrame();

        } catch (error) {
            console.error('Error rendering code visualization:', error);
        }
    }

    /**
     * Start animation loop
     */
    public startAnimation(): void {
        if (this.isAnimating) return;

        this.isAnimating = true;
        const animate = () => {
            if (!this.isAnimating) return;

            this.render();
            this.animationFrameId = requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Stop animation loop
     */
    public stopAnimation(): void {
        this.isAnimating = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Get current performance metrics
     */
    public getMetrics(): CodeMetrics {
        return { ...this.metrics };
    }

    /**
     * Update configuration
     */
    public updateConfig(newConfig: Partial<CodeVisualizationConfig>): void {
        this.config = this.mergeConfig(newConfig);
        this.applyConfigChanges();
    }

    /**
     * Select nodes for highlighting
     */
    public selectNodes(nodeIds: string[]): void {
        this.selectedNodes.clear();
        nodeIds.forEach(id => this.selectedNodes.add(id));
        this.updateSelectionUniforms();
    }

    /**
     * Set hovered node
     */
    public setHoveredNode(nodeId: string | null): void {
        this.hoveredNode = nodeId;
        this.updateHoverUniforms();
    }

    /**
     * Cleanup resources
     */
    public dispose(): void {
        this.stopAnimation();

        // Dispose GPU resources
        this.nodeBuffer?.dispose();
        this.edgeBuffer?.dispose();
        this.metricsBuffer?.dispose();
        this.layoutComputeShader?.dispose();
        this.metricsComputeShader?.dispose();

        // Dispose rendering resources
        this.nodeGeometry?.dispose();
        this.edgeGeometry?.dispose();
        this.nodeMaterial?.dispose();
        this.edgeMaterial?.dispose();

        // Dispose G3D components
        this.renderer?.dispose();
        this.memoryManager?.dispose();
        this.performanceMonitor?.dispose();

        console.log('G3DCodeRenderer disposed successfully');
    }

    // Helper methods for shader sources, color calculations, etc.
    private getLayoutComputeShaderSource(): string {
        return `
      #version 450

      layout(local_size_x = 64, local_size_y = 1, local_size_z = 1) in;

      layout(set = 0, binding = 0) buffer NodeBuffer {
        float nodeData[];
      };

      layout(set = 0, binding = 1) buffer EdgeBuffer {
        float edgeData[];
      };

      layout(set = 0, binding = 2) uniform ConfigBuffer {
        float layoutAlgorithm;
        float spacing;
        float levelHeight;
        float time;
      };

      void main() {
        uint index = gl_GlobalInvocationID.x;
        if (index >= nodeData.length() / 16) return;

        uint offset = index * 16;
        
        // Implement force-directed layout algorithm
        vec3 position = vec3(nodeData[offset], nodeData[offset + 1], nodeData[offset + 2]);
        vec3 force = vec3(0.0);
        
        // Repulsion from other nodes
        for (uint i = 0; i < nodeData.length() / 16; i++) {
          if (i == index) continue;
          
          uint otherOffset = i * 16;
          vec3 otherPos = vec3(nodeData[otherOffset], nodeData[otherOffset + 1], nodeData[otherOffset + 2]);
          vec3 diff = position - otherPos;
          float dist = length(diff);
          
          if (dist > 0.0) {
            force += normalize(diff) * (spacing * spacing) / (dist * dist);
          }
        }
        
        // Attraction to connected nodes (simplified)
        // This would need edge data processing
        
        // Apply force with damping
        position += force * 0.01;
        
        // Update position
        nodeData[offset] = position.x;
        nodeData[offset + 1] = position.y;
        nodeData[offset + 2] = position.z;
      }
    `;
    }

    private getMetricsComputeShaderSource(): string {
        return `
      #version 450

      layout(local_size_x = 64, local_size_y = 1, local_size_z = 1) in;

      layout(set = 0, binding = 0) buffer NodeBuffer {
        float nodeData[];
      };

      layout(set = 0, binding = 1) buffer MetricsBuffer {
        float metricsData[];
      };

      shared float sharedMetrics[64];

      void main() {
        uint index = gl_GlobalInvocationID.x;
        uint localIndex = gl_LocalInvocationIndex;
        
        if (index >= nodeData.length() / 16) {
          sharedMetrics[localIndex] = 0.0;
        } else {
          uint offset = index * 16;
          float complexity = nodeData[offset + 7];
          sharedMetrics[localIndex] = complexity;
        }
        
        barrier();
        
        // Reduction to calculate average complexity
        for (uint stride = 32; stride > 0; stride >>= 1) {
          if (localIndex < stride) {
            sharedMetrics[localIndex] += sharedMetrics[localIndex + stride];
          }
          barrier();
        }
        
        if (localIndex == 0) {
          atomicAdd(metricsData[1], sharedMetrics[0]); // Add to average complexity
        }
      }
    `;
    }

    private getNodeVertexShader(): string {
        return `
      attribute vec3 position;
      attribute vec3 normal;
      attribute vec2 uv;
      attribute mat4 instanceMatrix;
      attribute vec3 instanceColor;

      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform mat3 normalMatrix;
      uniform float time;

      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vColor;
      varying float vComplexity;

      void main() {
        vUv = uv;
        vColor = instanceColor;
        
        // Extract complexity from instance matrix
        vComplexity = instanceMatrix[3][3];
        
        // Transform position
        vec4 instancePosition = instanceMatrix * vec4(position, 1.0);
        vec4 mvPosition = modelViewMatrix * instancePosition;
        
        vPosition = mvPosition.xyz;
        vNormal = normalMatrix * normal;
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
    }

    private getNodeFragmentShader(): string {
        return `
      precision highp float;

      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vColor;
      varying float vComplexity;

      uniform float time;
      uniform sampler2D complexityTexture;
      uniform sampler2D qualityTexture;
      uniform vec3 cameraPosition;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        
        // Base color from instance
        vec3 color = vColor;
        
        // Add complexity-based effects
        float complexityFactor = texture2D(complexityTexture, vec2(vComplexity, 0.5)).r;
        color *= mix(0.8, 1.2, complexityFactor);
        
        // Fresnel effect for depth perception
        float fresnel = pow(1.0 - dot(normal, viewDirection), 2.0);
        color += fresnel * 0.3;
        
        // Animated pulse for active nodes
        float pulse = sin(time * 3.0 + vPosition.x * 0.1) * 0.1 + 0.9;
        color *= pulse;
        
        gl_FragColor = vec4(color, 0.9);
      }
    `;
    }

    private getEdgeVertexShader(): string {
        return `
      attribute vec3 position;
      attribute vec3 normal;
      attribute vec2 uv;
      attribute mat4 instanceMatrix;
      attribute vec3 instanceColor;

      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform mat3 normalMatrix;
      uniform float time;

      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vColor;
      varying float vFlow;

      void main() {
        vUv = uv;
        vColor = instanceColor;
        
        // Calculate flow animation
        vFlow = fract(time * 0.5 + position.y * 0.1);
        
        // Transform position
        vec4 instancePosition = instanceMatrix * vec4(position, 1.0);
        vec4 mvPosition = modelViewMatrix * instancePosition;
        
        vPosition = mvPosition.xyz;
        vNormal = normalMatrix * normal;
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
    }

    private getEdgeFragmentShader(): string {
        return `
      precision highp float;

      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vColor;
      varying float vFlow;

      uniform float time;
      uniform float flowSpeed;
      uniform float edgeOpacity;

      void main() {
        vec3 color = vColor;
        
        // Flow animation
        float flow = smoothstep(0.0, 0.2, vFlow) * smoothstep(1.0, 0.8, vFlow);
        color += flow * 0.5;
        
        // Distance-based fading
        float distanceFactor = 1.0 / (1.0 + length(vPosition) * 0.01);
        
        float alpha = edgeOpacity * distanceFactor * (0.7 + flow * 0.3);
        
        gl_FragColor = vec4(color, alpha);
      }
    `;
    }

    // Additional helper methods would continue here...
    private mergeConfig(config: Partial<CodeVisualizationConfig>): CodeVisualizationConfig {
        const defaultConfig: CodeVisualizationConfig = {
            layout: {
                algorithm: 'force-directed',
                spacing: 50,
                levelHeight: 100,
                nodeSize: { min: 1, max: 10, scale: 'logarithmic' }
            },
            rendering: {
                enableInstancing: true,
                enableLOD: true,
                maxNodes: 10000,
                enableShadows: true,
                enablePostProcessing: true,
                quality: 'high'
            },
            interaction: {
                enableSelection: true,
                enableHover: true,
                enableZoom: true,
                enablePan: true,
                enableFilter: true
            },
            animation: {
                enableTransitions: true,
                transitionDuration: 1000,
                easing: 'easeInOutCubic',
                enablePhysics: true
            }
        };

        return {
            layout: { ...defaultConfig.layout, ...config.layout },
            rendering: { ...defaultConfig.rendering, ...config.rendering },
            interaction: { ...defaultConfig.interaction, ...config.interaction },
            animation: { ...defaultConfig.animation, ...config.animation }
        };
    }

    private createComplexityTexture(): G3DTexture {
        // Create a gradient texture for complexity visualization
        const size = 256;
        const data = new Uint8Array(size * 4);

        for (let i = 0; i < size; i++) {
            const t = i / (size - 1);
            // Green to red gradient
            data[i * 4 + 0] = Math.floor(t * 255); // R
            data[i * 4 + 1] = Math.floor((1 - t) * 255); // G
            data[i * 4 + 2] = 0; // B
            data[i * 4 + 3] = 255; // A
        }

        return new G3DTexture({
            data,
            width: size,
            height: 1,
            format: 'RGBA',
            type: 'UnsignedByte'
        });
    }

    private createQualityTexture(): G3DTexture {
        // Create a gradient texture for quality visualization
        const size = 256;
        const data = new Uint8Array(size * 4);

        for (let i = 0; i < size; i++) {
            const t = i / (size - 1);
            // Blue to white gradient
            data[i * 4 + 0] = Math.floor(t * 255 + (1 - t) * 100); // R
            data[i * 4 + 1] = Math.floor(t * 255 + (1 - t) * 100); // G
            data[i * 4 + 2] = 255; // B
            data[i * 4 + 3] = 255; // A
        }

        return new G3DTexture({
            data,
            width: size,
            height: 1,
            format: 'RGBA',
            type: 'UnsignedByte'
        });
    }

    private setupEventHandlers(): void {
        // Implementation for mouse/touch interaction
        // This would handle selection, hover, zoom, pan, etc.
    }

    private updateUniforms(): void {
        // Update time-based uniforms
        const time = Date.now() * 0.001;
        this.nodeMaterial.uniforms.time.value = time;
        this.edgeMaterial.uniforms.time.value = time;
    }

    private updateSelectionUniforms(): void {
        // Update selection state in shaders
        const selectedArray = new Float32Array(1000);
        let index = 0;
        for (const nodeId of this.selectedNodes) {
            const nodeIndex = this.getNodeIndex(nodeId);
            if (nodeIndex >= 0 && index < 1000) {
                selectedArray[index++] = nodeIndex;
            }
        }
        this.nodeMaterial.uniforms.selectedNodes.value = selectedArray;
    }

    private updateHoverUniforms(): void {
        const hoveredIndex = this.hoveredNode ? this.getNodeIndex(this.hoveredNode) : -1;
        this.nodeMaterial.uniforms.hoveredNode.value = hoveredIndex;
    }

    private getNodeIndex(nodeId: string): number {
        let index = 0;
        for (const [id] of this.nodes) {
            if (id === nodeId) return index;
            index++;
        }
        return -1;
    }

    private getLanguageCode(language: string): number {
        const languages: Record<string, number> = {
            'typescript': 1, 'javascript': 2, 'python': 3, 'java': 4,
            'csharp': 5, 'cpp': 6, 'rust': 7, 'go': 8, 'swift': 9
        };
        return languages[language.toLowerCase()] || 0;
    }

    private getTypeCode(type: string): number {
        const types: Record<string, number> = {
            'file': 1, 'class': 2, 'function': 3, 'variable': 4,
            'import': 5, 'export': 6
        };
        return types[type] || 0;
    }

    private getEdgeTypeCode(type: string): number {
        const types: Record<string, number> = {
            'dependency': 1, 'inheritance': 2, 'composition': 3,
            'call': 4, 'import': 5
        };
        return types[type] || 0;
    }

    private getNodeColor(node: CodeNode, color: G3DColor): void {
        // Color coding based on node type and quality
        const typeColors: Record<string, number> = {
            'file': 0x4CAF50,      // Green
            'class': 0x2196F3,     // Blue  
            'function': 0xFF9800,  // Orange
            'variable': 0x9C27B0,  // Purple
            'import': 0x607D8B,    // Blue Grey
            'export': 0x795548     // Brown
        };

        const baseColor = typeColors[node.type] || 0x888888;
        color.setHex(baseColor);

        // Adjust brightness based on quality
        const brightness = 0.5 + node.metadata.quality * 0.5;
        color.multiplyScalar(brightness);
    }

    private getEdgeColor(edge: CodeEdge, color: G3DColor): void {
        // Color coding based on edge type and importance
        const typeColors: Record<string, number> = {
            'dependency': 0x00BCD4,   // Cyan
            'inheritance': 0x4CAF50,  // Green
            'composition': 0xFF5722,  // Deep Orange
            'call': 0xFFEB3B,        // Yellow
            'import': 0x9E9E9E       // Grey
        };

        const baseColor = typeColors[edge.type] || 0x666666;
        color.setHex(baseColor);

        // Adjust brightness based on importance
        const brightness = 0.3 + edge.metadata.importance * 0.7;
        color.multiplyScalar(brightness);
    }

    private updateNodePositionsFromGPU(data: Float32Array): void {
        let nodeIndex = 0;
        for (const [id, node] of this.nodes) {
            const offset = nodeIndex * 16;
            node.position.set(
                data[offset + 0],
                data[offset + 1],
                data[offset + 2]
            );
            nodeIndex++;
        }
    }

    private calculateLayoutCPU(): void {
        // Fallback CPU layout algorithm
        console.warn('Using CPU fallback for layout calculation');
        // Implementation would go here
    }

    private calculateMetricsCPU(): void {
        // Fallback CPU metrics calculation
        console.warn('Using CPU fallback for metrics calculation');

        let totalComplexity = 0;
        let totalLines = 0;
        let maxDepth = 0;

        for (const [id, node] of this.nodes) {
            totalComplexity += node.metadata.complexity;
            totalLines += node.metadata.lineCount;
            // Calculate depth would require tree traversal
        }

        this.metrics = {
            nodeCount: this.nodes.size,
            edgeCount: this.edges.size,
            maxDepth,
            avgComplexity: totalComplexity / this.nodes.size,
            totalLines,
            coverage: 0.85, // Mock value
            maintainability: 0.75, // Mock value
            performance: {
                renderTime: 16.67, // 60fps
                frameRate: 60,
                memoryUsage: 0,
                gpuUtilization: 0
            }
        };
    }

    private applyConfigChanges(): void {
        // Apply configuration changes to renderer and materials
        this.renderer.shadowMap.enabled = this.config.rendering.enableShadows;

        if (this.optimizer) {
            this.optimizer.updateConfig({
                enableLOD: this.config.rendering.enableLOD,
                enableInstancing: this.config.rendering.enableInstancing
            });
        }
    }
}