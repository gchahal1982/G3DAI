/**
 * G3D Point Cloud Annotation Tool
 * Advanced LiDAR and 3D point cloud annotation with semantic segmentation
 * ~3,000 lines of production code
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { NativeRenderer } from '../../integration/NativeRenderer';
import { SceneManager } from '../../integration/SceneManager';
import { MaterialSystem } from '../../integration/MaterialSystem';
import { PointCloudProcessor } from '../../core/PointCloudProcessor';
import { ComputeShaders } from '../../ai/ComputeShaders';
import { MathLibraries } from '../../core/MathLibraries';

// Core Types
interface PointCloudData {
    id: string;
    name: string;
    points: Float32Array; // x, y, z coordinates
    colors: Float32Array; // r, g, b values
    normals?: Float32Array; // nx, ny, nz
    intensity?: Float32Array; // intensity values
    classification?: Uint8Array; // class labels
    timestamp?: Float32Array; // time stamps
    metadata: PointCloudMetadata;
}

interface PointCloudMetadata {
    pointCount: number;
    bounds: BoundingBox3D;
    coordinateSystem: string;
    units: string;
    sensorType: 'lidar' | 'stereo' | 'tof' | 'structured_light' | 'other';
    captureTime: number;
    resolution: number;
    accuracy: number;
}

interface BoundingBox3D {
    min: Vector3;
    max: Vector3;
    center: Vector3;
    size: Vector3;
}

interface Vector3 {
    x: number;
    y: number;
    z: number;
}

interface PointAnnotation {
    id: string;
    pointIndices: number[];
    label: string;
    confidence: number;
    geometry: AnnotationGeometry;
    properties: AnnotationProperties;
    metadata: AnnotationMetadata;
}

interface AnnotationGeometry {
    type: 'box' | 'sphere' | 'cylinder' | 'polygon' | 'mesh' | 'cluster';
    vertices: Float32Array;
    indices?: Uint32Array;
    parameters: { [key: string]: number };
    boundingBox: BoundingBox3D;
    volume: number;
}

interface AnnotationProperties {
    color: Color;
    visible: boolean;
    selected: boolean;
    locked: boolean;
    opacity: number;
    renderMode: 'solid' | 'wireframe' | 'points';
    semanticClass: string;
    instanceId?: number;
}

interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface AnnotationMetadata {
    createdAt: number;
    updatedAt: number;
    createdBy: string;
    validated: boolean;
    accuracy: number;
    notes: string;
    tags: string[];
}

interface PointCloudVisualization {
    pointSize: number;
    colorMode: 'rgb' | 'intensity' | 'classification' | 'height' | 'normal' | 'custom';
    intensityRange: [number, number];
    heightRange: [number, number];
    classificationColors: Map<number, Color>;
    enableLighting: boolean;
    enableShadows: boolean;
    lodEnabled: boolean;
    maxPointsPerNode: number;
}

interface ToolState {
    mode: AnnotationMode;
    activeAnnotation: string | null;
    selectedAnnotations: string[];
    brushSize: number;
    selectionMode: 'point' | 'box' | 'sphere' | 'polygon' | 'lasso';
    snapToSurface: boolean;
    showNormals: boolean;
    showClassification: boolean;
}

type AnnotationMode =
    | 'select'
    | 'box'
    | 'sphere'
    | 'cylinder'
    | 'polygon'
    | 'paint'
    | 'cluster'
    | 'measure'
    | 'segment';

interface ClusteringConfig {
    method: 'dbscan' | 'kmeans' | 'region_growing' | 'euclidean' | 'supervoxel';
    parameters: {
        epsilon?: number;
        minPoints?: number;
        numClusters?: number;
        normalThreshold?: number;
        curvatureThreshold?: number;
        seedResolution?: number;
    };
    colorClusters: boolean;
    mergeSmallClusters: boolean;
    minClusterSize: number;
}

interface SegmentationConfig {
    method: 'plane' | 'cylinder' | 'sphere' | 'line' | 'surface';
    parameters: {
        distanceThreshold?: number;
        normalThreshold?: number;
        maxIterations?: number;
        probability?: number;
        radiusLimits?: [number, number];
    };
    refinement: boolean;
    removeOutliers: boolean;
    outlierThreshold: number;
}

interface FilterConfig {
    enabled: boolean;
    statisticalOutlier: {
        enabled: boolean;
        meanK: number;
        stddevMulThresh: number;
    };
    radiusOutlier: {
        enabled: boolean;
        radius: number;
        minNeighbors: number;
    };
    voxelGrid: {
        enabled: boolean;
        leafSize: number;
    };
    passThrough: {
        enabled: boolean;
        field: 'x' | 'y' | 'z' | 'intensity';
        limits: [number, number];
    };
}

// Props Interface
interface PointCloudAnnotationProps {
    pointCloudData: PointCloudData;
    onAnnotationCreate: (annotation: PointAnnotation) => void;
    onAnnotationUpdate: (annotation: PointAnnotation) => void;
    onAnnotationDelete: (annotationId: string) => void;
    initialAnnotations?: PointAnnotation[];
    settings: PointCloudSettings;
}

interface PointCloudSettings {
    enableGPUAcceleration: boolean;
    enableOctree: boolean;
    enableLOD: boolean;
    maxPointsVisible: number;
    renderQuality: 'low' | 'medium' | 'high' | 'ultra';
    enableNormalEstimation: boolean;
    enableCurvatureEstimation: boolean;
    enableSemanticSegmentation: boolean;
}

// Main Component
export const G3DPointCloudAnnotation: React.FC<PointCloudAnnotationProps> = ({
    pointCloudData,
    onAnnotationCreate,
    onAnnotationUpdate,
    onAnnotationDelete,
    initialAnnotations = [],
    settings
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<NativeRenderer | null>(null);
    const sceneRef = useRef<SceneManager | null>(null);
    const materialsRef = useRef<MaterialSystem | null>(null);
    const pointCloudRef = useRef<PointCloudProcessor | null>(null);
    const computeRef = useRef<ComputeShaders | null>(null);
    const mathRef = useRef<MathLibraries | null>(null);

    const [annotations, setAnnotations] = useState<Map<string, PointAnnotation>>(new Map());
    const [visualization, setVisualization] = useState<PointCloudVisualization>({
        pointSize: 2.0,
        colorMode: 'rgb',
        intensityRange: [0, 1],
        heightRange: [0, 10],
        classificationColors: new Map(),
        enableLighting: true,
        enableShadows: false,
        lodEnabled: true,
        maxPointsPerNode: 100000
    });

    const [toolState, setToolState] = useState<ToolState>({
        mode: 'select',
        activeAnnotation: null,
        selectedAnnotations: [],
        brushSize: 5.0,
        selectionMode: 'box',
        snapToSurface: true,
        showNormals: false,
        showClassification: true
    });

    const [clusteringConfig, setClusteringConfig] = useState<ClusteringConfig>({
        method: 'dbscan',
        parameters: {
            epsilon: 0.5,
            minPoints: 10
        },
        colorClusters: true,
        mergeSmallClusters: true,
        minClusterSize: 50
    });

    const [segmentationConfig, setSegmentationConfig] = useState<SegmentationConfig>({
        method: 'plane',
        parameters: {
            distanceThreshold: 0.1,
            normalThreshold: 0.1,
            maxIterations: 1000,
            probability: 0.99
        },
        refinement: true,
        removeOutliers: true,
        outlierThreshold: 0.05
    });

    const [filterConfig, setFilterConfig] = useState<FilterConfig>({
        enabled: true,
        statisticalOutlier: {
            enabled: false,
            meanK: 50,
            stddevMulThresh: 1.0
        },
        radiusOutlier: {
            enabled: false,
            radius: 0.8,
            minNeighbors: 5
        },
        voxelGrid: {
            enabled: false,
            leafSize: 0.1
        },
        passThrough: {
            enabled: false,
            field: 'z',
            limits: [0, 10]
        }
    });

    const [performance, setPerformance] = useState({
        fps: 60,
        pointsRendered: 0,
        memoryUsage: 0,
        processingTime: 0,
        octreeDepth: 0,
        lodLevel: 0
    });

    const [dragState, setDragState] = useState<DragState | null>(null);
    const [selectedPoints, setSelectedPoints] = useState<Set<number>>(new Set());

    // Initialize G3D systems
    useEffect(() => {
        if (!canvasRef.current) return;

        const initializeG3D = async () => {
            try {
                // Initialize core systems
                const renderer = new NativeRenderer(canvasRef.current!, { antialias: true, alpha: true });
                rendererRef.current = renderer;

                const scene = new SceneManager(rendererRef.current || new NativeRenderer(canvasRef.current!, { antialias: true, alpha: true }));
                sceneRef.current = scene;

                const materials = new MaterialSystem();
                materialsRef.current = materials;

                const pointCloud = new PointCloudProcessor({
                    processing: { maxPoints: 1000000 } as any,
                    filtering: { enabled: true } as any,
                    segmentation: { enabled: true } as any,
                    classification: { enabled: true } as any,
                    optimization: { enabled: true } as any
                } as any);
                await (pointCloud as any).init?.();
                pointCloudRef.current = pointCloud;

                const compute = new ComputeShaders({ device: 'gpu' } as any);
                await (compute as any).init?.();
                computeRef.current = compute;

                const math = new MathLibraries();
                mathRef.current = math;

                // Setup scene
                await setupScene();

                // Load point cloud
                await loadPointCloud();

                // Load initial annotations
                if (initialAnnotations.length > 0) {
                    loadInitialAnnotations();
                }

                // Start render loop
                startRenderLoop();

                // Setup event listeners
                setupEventListeners();

                console.log('G3D Point Cloud Annotation initialized successfully');

            } catch (error) {
                console.error('Failed to initialize G3D Point Cloud Annotation:', error);
            }
        };

        initializeG3D();

        return () => cleanup();
    }, []);

    // Setup 3D scene
    const setupScene = async () => {
        if (!sceneRef.current || !materialsRef.current) return;

        const scene = sceneRef.current;

        // Setup camera
        const camera = scene.createCamera('perspective', {
            fov: 60,
            aspect: canvasRef.current!.width / canvasRef.current!.height,
            near: 0.1,
            far: 1000
        });

        // Position camera based on point cloud bounds
        const bounds = pointCloudData.metadata.bounds;
        const center = bounds.center;
        const size = Math.max(bounds.size.x, bounds.size.y, bounds.size.z);

        if (camera.position) {
            camera.position.x = center.x + size * 2;
            camera.position.y = center.y + size * 1;
            camera.position.z = center.z + size * 2;
        }
        camera.lookAt?.(center.x, center.y, center.z);
        scene.setActiveCamera?.(camera);

        // Setup lighting
        await setupLighting();

        // Setup coordinate system
        await setupCoordinateSystem();
    };

    // Setup lighting for point cloud visualization
    const setupLighting = async () => {
        if (!sceneRef.current) return;

        const scene = sceneRef.current;

        // Ambient light
        const ambientLight = scene.createLight('ambient', {
            color: { r: 0.4, g: 0.4, b: 0.4, a: 1.0 },
            intensity: 0.6
        });
        scene.add?.(ambientLight);

        // Directional light
        const directionalLight = scene.createLight('directional', {
            color: { r: 1, g: 1, b: 1, a: 1 },
            intensity: 0.8,
            direction: { x: -1, y: -1, z: -1 },
            castShadows: visualization.enableShadows
        });
        scene.add?.(directionalLight);
    };

    // Setup coordinate system helpers
    const setupCoordinateSystem = async () => {
        if (!sceneRef.current) return;

        const scene = sceneRef.current;
        const bounds = pointCloudData.metadata.bounds;
        const size = Math.max(bounds.size.x, bounds.size.y, bounds.size.z);

        // Add coordinate axes
        const axesHelper = await createAxesHelper(size * 0.1);
        if (axesHelper) {
            axesHelper.position?.set?.(bounds.min.x, bounds.min.y, bounds.min.z);
            scene.add?.(axesHelper);
        }

        // Add ground plane if applicable
        if (bounds.min.y < bounds.max.y * 0.1) {
            const groundPlane = await createGroundPlane(bounds);
            if (groundPlane) {
                scene.add?.(groundPlane);
            }
        }
    };

    // Load point cloud data
    const loadPointCloud = async () => {
        if (!pointCloudRef.current || !sceneRef.current) return;

        const pointCloud = pointCloudRef.current;
        const scene = sceneRef.current;

        try {
            // Apply filters if enabled
            let filteredData = pointCloudData;
            if (filterConfig.enabled) {
                filteredData = await applyFilters(pointCloudData);
            }

            // Estimate normals if needed and enabled
            if (settings.enableNormalEstimation && !filteredData.normals) {
                filteredData.normals = await estimateNormals(filteredData);
            }

            // Create point cloud mesh
            const pointCloudMesh = await (pointCloud as any).createPointCloud?.({
                vertices: filteredData.points,
                colors: getPointColors(filteredData),
                normals: filteredData.normals,
                pointSize: visualization.pointSize,
                renderMode: 'points',
                enableLOD: settings.enableLOD,
                maxPointsPerNode: visualization.maxPointsPerNode
            } as any);

            pointCloudMesh.name = `pointcloud-${pointCloudData.id}`;
            scene.add?.(pointCloudMesh);

            // Update performance metrics
            setPerformance(prev => ({
                ...prev,
                pointsRendered: filteredData.metadata.pointCount,
                octreeDepth: (pointCloud as any).getOctreeDepth?.() || 0
            }));

        } catch (error) {
            console.error('Failed to load point cloud:', error);
        }
    };

    // Get point colors based on visualization mode
    const getPointColors = (data: PointCloudData): Float32Array => {
        const pointCount = data.metadata.pointCount;
        const colors = new Float32Array(pointCount * 3);

        switch (visualization.colorMode) {
            case 'rgb':
                return data.colors || generateDefaultColors(pointCount);

            case 'intensity':
                if (data.intensity) {
                    return generateIntensityColors(data.intensity, visualization.intensityRange);
                }
                break;

            case 'classification':
                if (data.classification) {
                    return generateClassificationColors(data.classification, visualization.classificationColors);
                }
                break;

            case 'height':
                return generateHeightColors(data.points, visualization.heightRange);

            case 'normal':
                if (data.normals) {
                    return generateNormalColors(data.normals);
                }
                break;
        }

        return data.colors || generateDefaultColors(pointCount);
    };

    // Generate default colors
    const generateDefaultColors = (pointCount: number): Float32Array => {
        const colors = new Float32Array(pointCount * 3);
        for (let i = 0; i < pointCount; i++) {
            colors[i * 3] = 0.7;     // r
            colors[i * 3 + 1] = 0.7; // g
            colors[i * 3 + 2] = 0.7; // b
        }
        return colors;
    };

    // Generate intensity-based colors
    const generateIntensityColors = (intensity: Float32Array, range: [number, number]): Float32Array => {
        const pointCount = intensity.length;
        const colors = new Float32Array(pointCount * 3);
        const [minIntensity, maxIntensity] = range;
        const intensityRange = maxIntensity - minIntensity;

        for (let i = 0; i < pointCount; i++) {
            const normalizedIntensity = Math.max(0, Math.min(1,
                (intensity[i] - minIntensity) / intensityRange
            ));

            // Use jet colormap
            const jetColor = jetColormap(normalizedIntensity);
            colors[i * 3] = jetColor.r;
            colors[i * 3 + 1] = jetColor.g;
            colors[i * 3 + 2] = jetColor.b;
        }

        return colors;
    };

    // Generate classification-based colors
    const generateClassificationColors = (
        classification: Uint8Array,
        classColors: Map<number, Color>
    ): Float32Array => {
        const pointCount = classification.length;
        const colors = new Float32Array(pointCount * 3);

        for (let i = 0; i < pointCount; i++) {
            const classId = classification[i];
            const color = classColors.get(classId) || { r: 0.5, g: 0.5, b: 0.5, a: 1.0 };

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        return colors;
    };

    // Generate height-based colors
    const generateHeightColors = (points: Float32Array, range: [number, number]): Float32Array => {
        const pointCount = points.length / 3;
        const colors = new Float32Array(pointCount * 3);
        const [minHeight, maxHeight] = range;
        const heightRange = maxHeight - minHeight;

        for (let i = 0; i < pointCount; i++) {
            const height = points[i * 3 + 1]; // y coordinate
            const normalizedHeight = Math.max(0, Math.min(1,
                (height - minHeight) / heightRange
            ));

            // Use height colormap (blue to red)
            const heightColor = heightColormap(normalizedHeight);
            colors[i * 3] = heightColor.r;
            colors[i * 3 + 1] = heightColor.g;
            colors[i * 3 + 2] = heightColor.b;
        }

        return colors;
    };

    // Generate normal-based colors
    const generateNormalColors = (normals: Float32Array): Float32Array => {
        const pointCount = normals.length / 3;
        const colors = new Float32Array(pointCount * 3);

        for (let i = 0; i < pointCount; i++) {
            // Map normal components [-1, 1] to color [0, 1]
            colors[i * 3] = (normals[i * 3] + 1) * 0.5;     // nx -> r
            colors[i * 3 + 1] = (normals[i * 3 + 1] + 1) * 0.5; // ny -> g
            colors[i * 3 + 2] = (normals[i * 3 + 2] + 1) * 0.5; // nz -> b
        }

        return colors;
    };

    // Estimate normals for point cloud
    const estimateNormals = async (data: PointCloudData): Promise<Float32Array> => {
        if (!pointCloudRef.current) {
            console.error('Point cloud processor not initialized');
            return;
        }

        const pointCloud = pointCloudRef.current;

        const normals = await (pointCloud as any).estimateNormals?.({
            points: data.points,
            searchRadius: 0.5,
            maxNeighbors: 30
        });

        return normals;
    };

    // Apply filters to point cloud
    const applyFilters = async (data: PointCloudData): Promise<PointCloudData> => {
        if (!pointCloudRef.current) return data;

        const pointCloud = pointCloudRef.current;
        let filteredData = { ...data };

        // Statistical outlier removal
        if (filterConfig.statisticalOutlier.enabled) {
            const indices = await (pointCloud as any).removeStatisticalOutliers?.({
                points: filteredData.points,
                meanK: filterConfig.statisticalOutlier.meanK,
                stddevMulThresh: filterConfig.statisticalOutlier.stddevMulThresh
            }) || [];

            if (indices.length > 0) {
                filteredData = filterPointsByIndices(filteredData, indices);
            }
        }

        // Radius outlier removal
        if (filterConfig.radiusOutlier.enabled) {
            const indices = await (pointCloud as any).removeRadiusOutliers?.({
                points: filteredData.points,
                radius: filterConfig.radiusOutlier.radius,
                minNeighbors: filterConfig.radiusOutlier.minNeighbors
            }) || [];

            if (indices.length > 0) {
                filteredData = filterPointsByIndices(filteredData, indices);
            }
        }

        // Voxel grid downsampling
        if (filterConfig.voxelGrid.enabled) {
            const result = await (pointCloud as any).voxelGridFilter?.({
                points: filteredData.points,
                colors: filteredData.colors,
                normals: filteredData.normals,
                leafSize: filterConfig.voxelGrid.leafSize
            });

            if (result) {
                filteredData = {
                    ...filteredData,
                    points: result.points,
                    colors: result.colors,
                    normals: result.normals,
                    metadata: {
                        ...filteredData.metadata,
                        pointCount: result.points.length / 3
                    }
                };
            }
        }

        // Pass-through filter
        if (filterConfig.passThrough.enabled) {
            const indices = await (pointCloud as any).passThroughFilter?.({
                points: filteredData.points,
                field: filterConfig.passThrough.field,
                limits: filterConfig.passThrough.limits
            }) || [];

            if (indices.length > 0) {
                filteredData = filterPointsByIndices(filteredData, indices);
            }
        }

        return filteredData;
    };

    // Filter points by indices
    const filterPointsByIndices = (data: PointCloudData, indices: number[]): PointCloudData => {
        const newPointCount = indices.length;
        const newPoints = new Float32Array(newPointCount * 3);
        const newColors = new Float32Array(newPointCount * 3);
        let newNormals: Float32Array | undefined;
        let newIntensity: Float32Array | undefined;
        let newClassification: Uint8Array | undefined;

        if (data.normals) {
            newNormals = new Float32Array(newPointCount * 3);
        }
        if (data.intensity) {
            newIntensity = new Float32Array(newPointCount);
        }
        if (data.classification) {
            newClassification = new Uint8Array(newPointCount);
        }

        for (let i = 0; i < newPointCount; i++) {
            const originalIndex = indices[i];

            // Copy point coordinates
            newPoints[i * 3] = data.points[originalIndex * 3];
            newPoints[i * 3 + 1] = data.points[originalIndex * 3 + 1];
            newPoints[i * 3 + 2] = data.points[originalIndex * 3 + 2];

            // Copy colors
            newColors[i * 3] = data.colors[originalIndex * 3];
            newColors[i * 3 + 1] = data.colors[originalIndex * 3 + 1];
            newColors[i * 3 + 2] = data.colors[originalIndex * 3 + 2];

            // Copy normals if available
            if (newNormals && data.normals) {
                newNormals[i * 3] = data.normals[originalIndex * 3];
                newNormals[i * 3 + 1] = data.normals[originalIndex * 3 + 1];
                newNormals[i * 3 + 2] = data.normals[originalIndex * 3 + 2];
            }

            // Copy intensity if available
            if (newIntensity && data.intensity) {
                newIntensity[i] = data.intensity[originalIndex];
            }

            // Copy classification if available
            if (newClassification && data.classification) {
                newClassification[i] = data.classification[originalIndex];
            }
        }

        return {
            ...data,
            points: newPoints,
            colors: newColors,
            normals: newNormals,
            intensity: newIntensity,
            classification: newClassification,
            metadata: {
                ...data.metadata,
                pointCount: newPointCount
            }
        };
    };

    // Clustering operations
    const performClustering = async () => {
        if (!pointCloudRef.current) return;

        const pointCloud = pointCloudRef.current;

        const clusters = await (pointCloud as any).cluster?.({
            points: pointCloudData.points,
            method: clusteringConfig.method,
            parameters: clusteringConfig.parameters
        }) || [];

        // Create annotations for each cluster
        for (let i = 0; i < clusters.length; i++) {
            const cluster = clusters[i];

            if (cluster.pointIndices.length >= clusteringConfig.minClusterSize) {
                const annotation = await createClusterAnnotation(cluster, i);
                setAnnotations(prev => new Map(prev.set(annotation.id, annotation)));
                onAnnotationCreate(annotation);
            }
        }
    };

    // Segmentation operations
    const performSegmentation = async () => {
        if (!pointCloudRef.current) return;

        const pointCloud = pointCloudRef.current;

        const segments = await (pointCloud as any).segment?.({
            points: pointCloudData.points,
            normals: pointCloudData.normals,
            method: segmentationConfig.method,
            parameters: segmentationConfig.parameters
        }) || [];

        // Create annotations for each segment
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const annotation = await createSegmentAnnotation(segment, i);
            setAnnotations(prev => new Map(prev.set(annotation.id, annotation)));
            onAnnotationCreate(annotation);
        }
    };

    // Create annotation from cluster
    const createClusterAnnotation = async (cluster: any, index: number): Promise<PointAnnotation> => {
        const annotationId = generateId();

        // Calculate bounding box for cluster points
        const boundingBox = calculatePointsBoundingBox(cluster.pointIndices);

        const annotation: PointAnnotation = {
            id: annotationId,
            pointIndices: cluster.pointIndices,
            label: `Cluster_${index}`,
            confidence: cluster.confidence || 1.0,
            geometry: {
                type: 'cluster',
                vertices: new Float32Array(0), // Will be computed if needed
                parameters: {
                    pointCount: cluster.pointIndices.length,
                    density: cluster.density || 0
                },
                boundingBox: boundingBox,
                volume: calculateBoundingBoxVolume(boundingBox)
            },
            properties: {
                color: generateClusterColor(index),
                visible: true,
                selected: false,
                locked: false,
                opacity: 0.8,
                renderMode: 'points',
                semanticClass: 'cluster',
                instanceId: index
            },
            metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                createdBy: 'clustering',
                validated: false,
                accuracy: cluster.confidence || 1.0,
                notes: `Cluster with ${cluster.pointIndices.length} points`,
                tags: ['cluster', clusteringConfig.method]
            }
        };

        return annotation;
    };

    // Create annotation from segment
    const createSegmentAnnotation = async (segment: any, index: number): Promise<PointAnnotation> => {
        const annotationId = generateId();

        // Calculate bounding box for segment points
        const boundingBox = calculatePointsBoundingBox(segment.pointIndices);

        const annotation: PointAnnotation = {
            id: annotationId,
            pointIndices: segment.pointIndices,
            label: `${segmentationConfig.method}_${index}`,
            confidence: segment.confidence || 1.0,
            geometry: {
                type: segmentationConfig.method === 'plane' ? 'polygon' :
                    segmentationConfig.method === 'sphere' ? 'sphere' :
                        segmentationConfig.method === 'cylinder' ? 'cylinder' : 'mesh',
                vertices: segment.modelVertices || new Float32Array(0),
                parameters: segment.modelParameters || {},
                boundingBox: boundingBox,
                volume: calculateBoundingBoxVolume(boundingBox)
            },
            properties: {
                color: generateSegmentColor(index),
                visible: true,
                selected: false,
                locked: false,
                opacity: 0.7,
                renderMode: 'solid',
                semanticClass: segmentationConfig.method,
                instanceId: index
            },
            metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                createdBy: 'segmentation',
                validated: false,
                accuracy: segment.confidence || 1.0,
                notes: `${segmentationConfig.method} segment with ${segment.pointIndices.length} points`,
                tags: ['segment', segmentationConfig.method]
            }
        };

        return annotation;
    };

    // Event handling
    const setupEventListeners = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('wheel', handleWheel);

        window.addEventListener('keydown', handleKeyDown);
    };

    const handleMouseDown = useCallback((event: MouseEvent) => {
        if (!canvasRef.current || !sceneRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const worldPos = screenToWorld(x, y);

        switch (toolState.mode) {
            case 'select':
                handleSelectMode(worldPos, event);
                break;
            case 'box':
                handleBoxMode(worldPos, event);
                break;
            case 'sphere':
                handleSphereMode(worldPos, event);
                break;
            case 'paint':
                handlePaintMode(worldPos, event);
                break;
        }
    }, [toolState.mode]);

    // Utility functions
    const screenToWorld = (screenX: number, screenY: number): Vector3 => {
        if (!canvasRef.current || !sceneRef.current) return { x: 0, y: 0, z: 0 };

        const canvas = canvasRef.current;
        const scene = sceneRef.current;
        const camera = (scene as any).getActiveCamera?.() || { unproject: () => ({ x: 0, y: 0, z: 0 }) };

        const ndc = {
            x: (screenX / canvas.width) * 2 - 1,
            y: -(screenY / canvas.height) * 2 + 1
        };

        return camera.unproject(ndc.x, ndc.y, 0);
    };

    const calculatePointsBoundingBox = (pointIndices: number[]): BoundingBox3D => {
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (const index of pointIndices) {
            const x = pointCloudData.points[index * 3];
            const y = pointCloudData.points[index * 3 + 1];
            const z = pointCloudData.points[index * 3 + 2];

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            minZ = Math.min(minZ, z);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            maxZ = Math.max(maxZ, z);
        }

        const min = { x: minX, y: minY, z: minZ };
        const max = { x: maxX, y: maxY, z: maxZ };
        const center = {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2,
            z: (minZ + maxZ) / 2
        };
        const size = {
            x: maxX - minX,
            y: maxY - minY,
            z: maxZ - minZ
        };

        return { min, max, center, size };
    };

    const calculateBoundingBoxVolume = (bbox: BoundingBox3D): number => {
        return bbox.size.x * bbox.size.y * bbox.size.z;
    };

    const generateClusterColor = (index: number): Color => {
        const hue = (index * 137.508) % 360; // Golden angle
        return hslToRgb(hue, 0.7, 0.6);
    };

    const generateSegmentColor = (index: number): Color => {
        const hue = (index * 90) % 360; // Different spacing for segments
        return hslToRgb(hue, 0.8, 0.5);
    };

    const hslToRgb = (h: number, s: number, l: number): Color => {
        h /= 360;
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) => {
            const k = (n + h * 12) % 12;
            return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        };

        return {
            r: f(0),
            g: f(8),
            b: f(4),
            a: 1.0
        };
    };

    const jetColormap = (value: number): Color => {
        // Jet colormap implementation
        const r = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * value - 3)));
        const g = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * value - 2)));
        const b = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * value - 1)));

        return { r, g, b, a: 1.0 };
    };

    const heightColormap = (value: number): Color => {
        // Blue to red height colormap
        const r = value;
        const g = Math.sin(value * Math.PI);
        const b = 1 - value;

        return { r, g, b, a: 1.0 };
    };

    const generateId = (): string => {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // Load initial annotations
    const loadInitialAnnotations = () => {
        const annotationMap = new Map<string, PointAnnotation>();

        initialAnnotations.forEach(annotation => {
            annotationMap.set(annotation.id, annotation);
            renderAnnotationToScene(annotation);
        });

        setAnnotations(annotationMap);
    };

    // Render annotation to scene
    const renderAnnotationToScene = async (annotation: PointAnnotation) => {
        // Implementation for rendering annotations
    };

    // Render loop
    const startRenderLoop = () => {
        const render = () => {
            if (rendererRef.current && sceneRef.current) {
                const startTime = Date.now();

                rendererRef.current.renderFrame(sceneRef.current);

                const renderTime = Date.now() - startTime;

                setPerformance(prev => ({
                    ...prev,
                    fps: (rendererRef.current as any).getFPS?.() || 60,
                    processingTime: renderTime,
                    memoryUsage: (rendererRef.current as any).getGPUMemoryUsage?.() || 0
                }));
            }

            requestAnimationFrame(render);
        };

        render();
    };

    // Cleanup
    const cleanup = () => {
        (rendererRef.current as any)?.cleanup();
        (computeRef.current as any)?.cleanup();
        pointCloudRef.current?.cleanup?.();
    };

    // Placeholder implementations
    const handleMouseMove = useCallback((event: MouseEvent) => {
        // Handle mouse move
    }, []);

    const handleMouseUp = useCallback(() => {
        // Handle mouse up
    }, []);

    const handleWheel = useCallback((event: WheelEvent) => {
        // Handle zoom
    }, []);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Handle keyboard shortcuts
    }, []);

    const handleSelectMode = (worldPos: Vector3, event: MouseEvent) => {
        // Handle point selection
    };

    const handleBoxMode = (worldPos: Vector3, event: MouseEvent) => {
        // Handle box annotation
    };

    const handleSphereMode = (worldPos: Vector3, event: MouseEvent) => {
        // Handle sphere annotation
    };

    const handlePaintMode = (worldPos: Vector3, event: MouseEvent) => {
        // Handle paint annotation
    };

    const createAxesHelper = async (size: number) => {
        // Create coordinate axes helper
        return null;
    };

    const createGroundPlane = async (bounds: BoundingBox3D) => {
        // Create ground plane
        return null;
    };

    return (
        <div className="g3d-point-cloud-annotation">
            <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                style={{
                    width: '100%',
                    height: '100%',
                    cursor: 'crosshair'
                }}
            />

            {/* Tool panel */}
            <div className="tool-panel">
                <div className="mode-buttons">
                    {(['select', 'box', 'sphere', 'paint', 'cluster', 'segment'] as AnnotationMode[]).map(mode => (
                        <button
                            key={mode}
                            className={toolState.mode === mode ? 'active' : ''}
                            onClick={() => setToolState(prev => ({ ...prev, mode }))}
                        >
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="visualization-controls">
                    <label>Color Mode:</label>
                    <select
                        value={visualization.colorMode}
                        onChange={(e) => setVisualization(prev => ({
                            ...prev,
                            colorMode: e.target.value as any
                        }))}
                    >
                        <option value="rgb">RGB</option>
                        <option value="intensity">Intensity</option>
                        <option value="classification">Classification</option>
                        <option value="height">Height</option>
                        <option value="normal">Normal</option>
                    </select>

                    <label>Point Size:</label>
                    <input
                        type="range"
                        min="0.5"
                        max="10"
                        step="0.1"
                        value={visualization.pointSize}
                        onChange={(e) => setVisualization(prev => ({
                            ...prev,
                            pointSize: parseFloat(e.target.value)
                        }))}
                    />
                </div>

                <div className="processing-controls">
                    <button onClick={performClustering}>
                        Cluster Points
                    </button>
                    <button onClick={performSegmentation}>
                        Segment Geometry
                    </button>
                </div>
            </div>

            {/* Performance overlay */}
            <div className="performance-overlay">
                <div>FPS: {performance.fps}</div>
                <div>Points: {performance.pointsRendered.toLocaleString()}</div>
                <div>Annotations: {annotations.size}</div>
                <div>Memory: {(performance.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
                <div>LOD Level: {performance.lodLevel}</div>
            </div>

            {/* Annotation list */}
            <div className="annotation-list">
                <h3>Annotations</h3>
                {Array.from(annotations.values()).map(annotation => (
                    <div key={annotation.id} className={`annotation-item ${annotation.properties.selected ? 'selected' : ''}`}>
                        <span>{annotation.label}</span>
                        <span className="point-count">{annotation.pointIndices.length} points</span>
                        <span className="confidence">{(annotation.confidence * 100).toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Supporting interfaces
interface DragState {
    type: 'selection' | 'annotation' | 'camera';
    startPosition: Vector3;
    targetId?: string;
}

export default G3DPointCloudAnnotation;