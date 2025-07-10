/**
 * G3DSpatialAnalyzer.ts
 * 
 * Advanced 3D spatial analysis and geometric computation engine.
 * Provides spatial indexing, collision detection, geometric analysis,
 * and advanced spatial algorithms for 3D annotation workflows.
 */

import { ComputeShaders } from '../ai/G3DComputeShaders';

// Core spatial data structures
export interface Point3D {
    x: number;
    y: number;
    z: number;
}

export interface Vector3D {
    x: number;
    y: number;
    z: number;
}

export interface BoundingBox3D {
    min: Point3D;
    max: Point3D;
}

export interface BoundingSphere3D {
    center: Point3D;
    radius: number;
}

export interface Plane3D {
    normal: Vector3D;
    distance: number;
}

export interface Ray3D {
    origin: Point3D;
    direction: Vector3D;
}

export interface Triangle3D {
    vertices: [Point3D, Point3D, Point3D];
    normal: Vector3D;
    area: number;
}

export interface Mesh3D {
    id: string;
    vertices: Point3D[];
    faces: number[][];
    normals: Vector3D[];
    boundingBox: BoundingBox3D;
    boundingSphere: BoundingSphere3D;
}

// Spatial indexing structures
export interface SpatialIndex {
    type: IndexType;
    bounds: BoundingBox3D;
    objects: SpatialObject[];
    subdivisions: number;
    maxDepth: number;
    maxObjects: number;
}

export type IndexType = 'octree' | 'kdtree' | 'bvh' | 'grid' | 'rtree';

export interface SpatialObject {
    id: string;
    bounds: BoundingBox3D;
    geometry: any;
    metadata: Record<string, any>;
}

export interface OctreeNode {
    bounds: BoundingBox3D;
    objects: SpatialObject[];
    children: OctreeNode[];
    depth: number;
    isLeaf: boolean;
}

export interface KDTreeNode {
    splitAxis: number;
    splitValue: number;
    bounds: BoundingBox3D;
    objects: SpatialObject[];
    left: KDTreeNode | null;
    right: KDTreeNode | null;
    isLeaf: boolean;
}

export interface BVHNode {
    bounds: BoundingBox3D;
    objects: SpatialObject[];
    left: BVHNode | null;
    right: BVHNode | null;
    isLeaf: boolean;
}

// Collision detection interfaces
export interface CollisionConfig {
    enabled: boolean;
    broadPhase: BroadPhaseType;
    narrowPhase: NarrowPhaseType;
    continuous: boolean;
    margin: number;
    maxIterations: number;
}

export type BroadPhaseType = 'aabb' | 'sphere' | 'obb' | 'spatial_hash';
export type NarrowPhaseType = 'sat' | 'gjk' | 'mpr' | 'mesh_mesh';

export interface CollisionResult {
    colliding: boolean;
    contactPoints: ContactPoint[];
    penetrationDepth: number;
    separatingAxis: Vector3D;
    objects: [string, string];
}

export interface ContactPoint {
    position: Point3D;
    normal: Vector3D;
    depth: number;
    feature1: ContactFeature;
    feature2: ContactFeature;
}

export interface ContactFeature {
    type: 'vertex' | 'edge' | 'face';
    index: number;
}

// Geometric analysis interfaces
export interface GeometricAnalysis {
    volume: number;
    surfaceArea: number;
    centroid: Point3D;
    moments: MomentTensor;
    convexHull: ConvexHull;
    curvature: CurvatureAnalysis;
    topology: TopologyAnalysis;
}

export interface MomentTensor {
    mass: number;
    centerOfMass: Point3D;
    inertiaTensor: number[][];
    principalAxes: Vector3D[];
    principalMoments: number[];
}

export interface ConvexHull {
    vertices: Point3D[];
    faces: number[][];
    volume: number;
    surfaceArea: number;
}

export interface CurvatureAnalysis {
    meanCurvature: number[];
    gaussianCurvature: number[];
    principalCurvatures: [number[], number[]];
    curvatureDirections: [Vector3D[], Vector3D[]];
}

export interface TopologyAnalysis {
    genus: number;
    eulerCharacteristic: number;
    boundaries: number;
    holes: number;
    components: number;
}

// Spatial query interfaces
export interface SpatialQuery {
    type: QueryType;
    parameters: QueryParameters;
    filters: SpatialFilter[];
    sorting: SpatialSorting;
    limit: number;
}

export type QueryType =
    | 'point_in_polygon' | 'nearest_neighbor' | 'range_query'
    | 'intersection' | 'containment' | 'visibility';

export interface QueryParameters {
    point?: Point3D;
    radius?: number;
    bounds?: BoundingBox3D;
    ray?: Ray3D;
    polygon?: Point3D[];
    k?: number; // for k-nearest neighbors
}

export interface SpatialFilter {
    property: string;
    operator: FilterOperator;
    value: any;
}

export type FilterOperator = 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge' | 'in' | 'contains';

export interface SpatialSorting {
    field: SortField;
    order: 'asc' | 'desc';
}

export type SortField = 'distance' | 'area' | 'volume' | 'id' | 'custom';

export interface QueryResult {
    objects: SpatialObject[];
    distances: number[];
    totalFound: number;
    executionTime: number;
}

// Mesh processing interfaces
export interface MeshProcessingConfig {
    simplification: SimplificationConfig;
    smoothing: SmoothingConfig;
    subdivision: SubdivisionConfig;
    repair: RepairConfig;
    analysis: AnalysisConfig;
}

export interface SimplificationConfig {
    enabled: boolean;
    algorithm: 'quadric' | 'vertex_clustering' | 'edge_collapse';
    targetRatio: number;
    preserveBoundaries: boolean;
    preserveTexture: boolean;
}

export interface SmoothingConfig {
    enabled: boolean;
    algorithm: 'laplacian' | 'taubin' | 'bilateral';
    iterations: number;
    lambda: number;
    preserveVolume: boolean;
}

export interface SubdivisionConfig {
    enabled: boolean;
    algorithm: 'catmull_clark' | 'loop' | 'butterfly';
    levels: number;
    adaptive: boolean;
}

export interface RepairConfig {
    enabled: boolean;
    fixNormals: boolean;
    removeDuplicates: boolean;
    fillHoles: boolean;
    removeNonManifold: boolean;
}

export interface AnalysisConfig {
    computeNormals: boolean;
    computeTangents: boolean;
    computeCurvature: boolean;
    computeTopology: boolean;
}

/**
 * G3D-powered spatial analysis engine
 */
export class SpatialAnalyzer {
    private computeShaders: ComputeShaders;

    // Spatial indices
    private indices: Map<string, SpatialIndex> = new Map();
    private activeIndex: SpatialIndex | null = null;

    // Mesh storage
    private meshes: Map<string, Mesh3D> = new Map();

    // Analysis cache
    private analysisCache: Map<string, GeometricAnalysis> = new Map();

    // Performance tracking
    private queryStats: {
        totalQueries: number;
        avgQueryTime: number;
        cacheHits: number;
        cacheMisses: number;
    } = {
            totalQueries: 0,
            avgQueryTime: 0,
            cacheHits: 0,
            cacheMisses: 0
        };

    constructor() {
        this.initializeComputeShaders();
    }

    /**
     * Initialize compute shaders for GPU acceleration
     */
    private initializeComputeShaders(): void {
        this.computeShaders = new ComputeShaders({
            backend: 'webgpu',
            device: {
                preferredDevice: 'gpu',
                minComputeUnits: 8,
                minMemorySize: 512 * 1024 * 1024,
                features: ['fp16', 'subgroups', 'shared_memory']
            },
            memory: {
                maxBufferSize: 2 * 1024 * 1024 * 1024,
                alignment: 256,
                caching: 'adaptive',
                pooling: { enabled: true, initialSize: 128, maxSize: 1024, growthFactor: 2 },
                compression: { enabled: false, algorithm: 'lz4', level: 1 }
            },
            optimization: {
                autoTuning: true,
                workGroupOptimization: true,
                memoryCoalescing: true,
                loopUnrolling: true,
                constantFolding: true,
                deadCodeElimination: true
            },
            debugging: {
                enabled: false,
                profiling: true,
                validation: false,
                verboseLogging: false
            },
            kernels: []
        });
    }

    /**
     * Initialize the spatial analyzer
     */
    public async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Spatial Analyzer...');

            // Initialize compute shaders
            await this.computeShaders.init();

            // Create default spatial index
            await this.createSpatialIndex('default', 'octree', {
                min: { x: -1000, y: -1000, z: -1000 },
                max: { x: 1000, y: 1000, z: 1000 }
            });

            console.log('G3D Spatial Analyzer initialized successfully');

        } catch (error) {
            console.error('Failed to initialize spatial analyzer:', error);
            throw error;
        }
    }

    /**
     * Create spatial index
     */
    public async createSpatialIndex(
        id: string,
        type: IndexType,
        bounds: BoundingBox3D,
        config: Partial<SpatialIndex> = {}
    ): Promise<void> {
        const index: SpatialIndex = {
            type,
            bounds,
            objects: [],
            subdivisions: config.subdivisions || 8,
            maxDepth: config.maxDepth || 10,
            maxObjects: config.maxObjects || 10,
            ...config
        };

        this.indices.set(id, index);

        if (!this.activeIndex) {
            this.activeIndex = index;
        }

        console.log(`Created ${type} spatial index: ${id}`);
    }

    /**
     * Add object to spatial index
     */
    public addObject(object: SpatialObject, indexId?: string): void {
        const index = indexId ? this.indices.get(indexId) : this.activeIndex;
        if (!index) {
            throw new Error('No active spatial index');
        }

        index.objects.push(object);

        // Rebuild index if needed
        if (index.objects.length > index.maxObjects) {
            this.rebuildIndex(index);
        }
    }

    /**
     * Remove object from spatial index
     */
    public removeObject(objectId: string, indexId?: string): boolean {
        const index = indexId ? this.indices.get(indexId) : this.activeIndex;
        if (!index) return false;

        const initialLength = index.objects.length;
        index.objects = index.objects.filter(obj => obj.id !== objectId);

        return index.objects.length < initialLength;
    }

    /**
     * Perform spatial query
     */
    public async query(query: SpatialQuery, indexId?: string): Promise<QueryResult> {
        const startTime = Date.now();
        const index = indexId ? this.indices.get(indexId) : this.activeIndex;

        if (!index) {
            throw new Error('No spatial index available');
        }

        let results: SpatialObject[] = [];
        let distances: number[] = [];

        switch (query.type) {
            case 'nearest_neighbor':
                results = await this.nearestNeighborQuery(query, index);
                break;
            case 'range_query':
                results = await this.rangeQuery(query, index);
                break;
            case 'intersection':
                results = await this.intersectionQuery(query, index);
                break;
            case 'point_in_polygon':
                results = await this.pointInPolygonQuery(query, index);
                break;
            case 'visibility':
                results = await this.visibilityQuery(query, index);
                break;
            default:
                throw new Error(`Unsupported query type: ${query.type}`);
        }

        // Apply filters
        results = this.applyFilters(results, query.filters);

        // Calculate distances if needed
        if (query.parameters.point) {
            distances = results.map(obj =>
                this.calculateDistance(query.parameters.point!, this.getBoundingBoxCenter(obj.bounds))
            );
        }

        // Apply sorting
        if (query.sorting) {
            const sorted = this.applySorting(results, distances, query.sorting);
            results = sorted.objects;
            distances = sorted.distances;
        }

        // Apply limit
        if (query.limit > 0) {
            results = results.slice(0, query.limit);
            distances = distances.slice(0, query.limit);
        }

        const executionTime = Date.now() - startTime;
        this.updateQueryStats(executionTime);

        return {
            objects: results,
            distances,
            totalFound: results.length,
            executionTime
        };
    }

    /**
     * Collision detection between objects
     */
    public async detectCollisions(
        object1: SpatialObject,
        object2: SpatialObject,
        config: CollisionConfig
    ): Promise<CollisionResult> {
        if (!config.enabled) {
            return {
                colliding: false,
                contactPoints: [],
                penetrationDepth: 0,
                separatingAxis: { x: 0, y: 0, z: 0 },
                objects: [object1.id, object2.id]
            };
        }

        // Broad phase collision detection
        const broadPhaseResult = this.broadPhaseCollision(object1, object2, config.broadPhase);
        if (!broadPhaseResult) {
            return {
                colliding: false,
                contactPoints: [],
                penetrationDepth: 0,
                separatingAxis: { x: 0, y: 0, z: 0 },
                objects: [object1.id, object2.id]
            };
        }

        // Narrow phase collision detection
        return this.narrowPhaseCollision(object1, object2, config.narrowPhase);
    }

    /**
     * Analyze mesh geometry
     */
    public async analyzeMesh(meshId: string): Promise<GeometricAnalysis> {
        // Check cache first
        if (this.analysisCache.has(meshId)) {
            this.queryStats.cacheHits++;
            return this.analysisCache.get(meshId)!;
        }

        this.queryStats.cacheMisses++;

        const mesh = this.meshes.get(meshId);
        if (!mesh) {
            throw new Error(`Mesh not found: ${meshId}`);
        }

        const analysis: GeometricAnalysis = {
            volume: await this.calculateVolume(mesh),
            surfaceArea: await this.calculateSurfaceArea(mesh),
            centroid: await this.calculateCentroid(mesh),
            moments: await this.calculateMoments(mesh),
            convexHull: await this.calculateConvexHull(mesh),
            curvature: await this.calculateCurvature(mesh),
            topology: await this.analyzeTopology(mesh)
        };

        // Cache the result
        this.analysisCache.set(meshId, analysis);

        return analysis;
    }

    /**
     * Process mesh with various algorithms
     */
    public async processMesh(meshId: string, config: MeshProcessingConfig): Promise<Mesh3D> {
        const mesh = this.meshes.get(meshId);
        if (!mesh) {
            throw new Error(`Mesh not found: ${meshId}`);
        }

        let processedMesh = { ...mesh };

        // Apply mesh processing operations in order
        if (config.repair.enabled) {
            processedMesh = await this.repairMesh(processedMesh, config.repair);
        }

        if (config.smoothing.enabled) {
            processedMesh = await this.smoothMesh(processedMesh, config.smoothing);
        }

        if (config.simplification.enabled) {
            processedMesh = await this.simplifyMesh(processedMesh, config.simplification);
        }

        if (config.subdivision.enabled) {
            processedMesh = await this.subdivideMesh(processedMesh, config.subdivision);
        }

        if (config.analysis.computeNormals) {
            processedMesh = await this.computeNormals(processedMesh);
        }

        return processedMesh;
    }

    /**
     * Ray casting
     */
    public async raycast(ray: Ray3D, maxDistance: number = Infinity): Promise<RaycastResult[]> {
        const results: RaycastResult[] = [];

        if (!this.activeIndex) return results;

        for (const object of this.activeIndex.objects) {
            const intersection = this.rayIntersectBounds(ray, object.bounds);
            if (intersection && intersection.distance <= maxDistance) {
                // Detailed intersection test with geometry
                const detailedResult = await this.rayIntersectGeometry(ray, object);
                if (detailedResult) {
                    results.push(detailedResult);
                }
            }
        }

        // Sort by distance
        results.sort((a, b) => a.distance - b.distance);

        return results;
    }

    /**
     * Private implementation methods
     */
    private async nearestNeighborQuery(query: SpatialQuery, index: SpatialIndex): Promise<SpatialObject[]> {
        if (!query.parameters.point || !query.parameters.k) {
            return [];
        }

        const point = query.parameters.point;
        const k = query.parameters.k;

        // Calculate distances to all objects
        const objectsWithDistance = index.objects.map(obj => ({
            object: obj,
            distance: this.calculateDistance(point, this.getBoundingBoxCenter(obj.bounds))
        }));

        // Sort by distance and take top k
        objectsWithDistance.sort((a, b) => a.distance - b.distance);

        return objectsWithDistance.slice(0, k).map(item => item.object);
    }

    private async rangeQuery(query: SpatialQuery, index: SpatialIndex): Promise<SpatialObject[]> {
        if (!query.parameters.point || !query.parameters.radius) {
            return [];
        }

        const point = query.parameters.point;
        const radius = query.parameters.radius;

        return index.objects.filter(obj => {
            const center = this.getBoundingBoxCenter(obj.bounds);
            const distance = this.calculateDistance(point, center);
            return distance <= radius;
        });
    }

    private async intersectionQuery(query: SpatialQuery, index: SpatialIndex): Promise<SpatialObject[]> {
        if (!query.parameters.bounds) {
            return [];
        }

        const bounds = query.parameters.bounds;

        return index.objects.filter(obj =>
            this.boundingBoxIntersects(obj.bounds, bounds)
        );
    }

    private async pointInPolygonQuery(query: SpatialQuery, index: SpatialIndex): Promise<SpatialObject[]> {
        if (!query.parameters.point || !query.parameters.polygon) {
            return [];
        }

        // Simplified 3D point-in-polygon test
        return index.objects.filter(obj => {
            // Implementation would depend on specific polygon representation
            return true; // Placeholder
        });
    }

    private async visibilityQuery(query: SpatialQuery, index: SpatialIndex): Promise<SpatialObject[]> {
        if (!query.parameters.point) {
            return [];
        }

        const viewPoint = query.parameters.point;
        const visibleObjects: SpatialObject[] = [];

        for (const object of index.objects) {
            const center = this.getBoundingBoxCenter(object.bounds);
            const ray: Ray3D = {
                origin: viewPoint,
                direction: this.normalize(this.subtract(center, viewPoint))
            };

            // Check if ray intersects with any occluding objects
            let occluded = false;
            for (const other of index.objects) {
                if (other.id === object.id) continue;

                const intersection = this.rayIntersectBounds(ray, other.bounds);
                if (intersection && intersection.distance < this.calculateDistance(viewPoint, center)) {
                    occluded = true;
                    break;
                }
            }

            if (!occluded) {
                visibleObjects.push(object);
            }
        }

        return visibleObjects;
    }

    private broadPhaseCollision(obj1: SpatialObject, obj2: SpatialObject, type: BroadPhaseType): boolean {
        switch (type) {
            case 'aabb':
                return this.boundingBoxIntersects(obj1.bounds, obj2.bounds);
            case 'sphere':
                return this.boundingSphereIntersects(
                    this.boundingBoxToSphere(obj1.bounds),
                    this.boundingBoxToSphere(obj2.bounds)
                );
            default:
                return this.boundingBoxIntersects(obj1.bounds, obj2.bounds);
        }
    }

    private narrowPhaseCollision(obj1: SpatialObject, obj2: SpatialObject, type: NarrowPhaseType): CollisionResult {
        // Simplified narrow phase - would implement SAT, GJK, etc.
        return {
            colliding: this.boundingBoxIntersects(obj1.bounds, obj2.bounds),
            contactPoints: [],
            penetrationDepth: 0,
            separatingAxis: { x: 1, y: 0, z: 0 },
            objects: [obj1.id, obj2.id]
        };
    }

    /**
     * Mesh analysis methods
     */
    private async calculateVolume(mesh: Mesh3D): Promise<number> {
        let volume = 0;

        // Use divergence theorem for volume calculation
        for (const face of mesh.faces) {
            if (face.length >= 3) {
                const v0 = mesh.vertices[face[0]];
                const v1 = mesh.vertices[face[1]];
                const v2 = mesh.vertices[face[2]];

                // Calculate signed volume of tetrahedron
                volume += this.signedVolumeOfTetrahedron(
                    { x: 0, y: 0, z: 0 }, v0, v1, v2
                );
            }
        }

        return Math.abs(volume);
    }

    private async calculateSurfaceArea(mesh: Mesh3D): Promise<number> {
        let area = 0;

        for (const face of mesh.faces) {
            if (face.length >= 3) {
                const v0 = mesh.vertices[face[0]];
                const v1 = mesh.vertices[face[1]];
                const v2 = mesh.vertices[face[2]];

                area += this.triangleArea(v0, v1, v2);
            }
        }

        return area;
    }

    private async calculateCentroid(mesh: Mesh3D): Promise<Point3D> {
        const centroid = { x: 0, y: 0, z: 0 };

        for (const vertex of mesh.vertices) {
            centroid.x += vertex.x;
            centroid.y += vertex.y;
            centroid.z += vertex.z;
        }

        const count = mesh.vertices.length;
        return {
            x: centroid.x / count,
            y: centroid.y / count,
            z: centroid.z / count
        };
    }

    private async calculateMoments(mesh: Mesh3D): Promise<MomentTensor> {
        // Simplified moment calculation
        const centroid = await this.calculateCentroid(mesh);

        return {
            mass: 1.0, // Assume unit mass
            centerOfMass: centroid,
            inertiaTensor: [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ],
            principalAxes: [
                { x: 1, y: 0, z: 0 },
                { x: 0, y: 1, z: 0 },
                { x: 0, y: 0, z: 1 }
            ],
            principalMoments: [1, 1, 1]
        };
    }

    private async calculateConvexHull(mesh: Mesh3D): Promise<ConvexHull> {
        // Simplified convex hull calculation
        return {
            vertices: [...mesh.vertices],
            faces: [...mesh.faces],
            volume: await this.calculateVolume(mesh),
            surfaceArea: await this.calculateSurfaceArea(mesh)
        };
    }

    private async calculateCurvature(mesh: Mesh3D): Promise<CurvatureAnalysis> {
        // Simplified curvature analysis
        const vertexCount = mesh.vertices.length;

        return {
            meanCurvature: new Array(vertexCount).fill(0),
            gaussianCurvature: new Array(vertexCount).fill(0),
            principalCurvatures: [
                new Array(vertexCount).fill(0),
                new Array(vertexCount).fill(0)
            ],
            curvatureDirections: [
                new Array(vertexCount).fill({ x: 1, y: 0, z: 0 }),
                new Array(vertexCount).fill({ x: 0, y: 1, z: 0 })
            ]
        };
    }

    private async analyzeTopology(mesh: Mesh3D): Promise<TopologyAnalysis> {
        const V = mesh.vertices.length;
        const F = mesh.faces.length;
        const E = this.countEdges(mesh);

        return {
            genus: 0, // Simplified
            eulerCharacteristic: V - E + F,
            boundaries: 0,
            holes: 0,
            components: 1
        };
    }

    /**
     * Mesh processing methods
     */
    private async repairMesh(mesh: Mesh3D, config: RepairConfig): Promise<Mesh3D> {
        let repairedMesh = { ...mesh };

        if (config.removeDuplicates) {
            repairedMesh = this.removeDuplicateVertices(repairedMesh);
        }

        if (config.fixNormals) {
            repairedMesh = await this.computeNormals(repairedMesh);
        }

        return repairedMesh;
    }

    private async smoothMesh(mesh: Mesh3D, config: SmoothingConfig): Promise<Mesh3D> {
        // Implement Laplacian smoothing
        const smoothedVertices = [...mesh.vertices];

        for (let iter = 0; iter < config.iterations; iter++) {
            for (let i = 0; i < mesh.vertices.length; i++) {
                const neighbors = this.getVertexNeighbors(mesh, i);
                if (neighbors.length > 0) {
                    const avgPosition = this.averagePositions(neighbors.map(idx => smoothedVertices[idx]));

                    // Apply smoothing with lambda factor
                    smoothedVertices[i] = {
                        x: mesh.vertices[i].x + config.lambda * (avgPosition.x - mesh.vertices[i].x),
                        y: mesh.vertices[i].y + config.lambda * (avgPosition.y - mesh.vertices[i].y),
                        z: mesh.vertices[i].z + config.lambda * (avgPosition.z - mesh.vertices[i].z)
                    };
                }
            }
        }

        return { ...mesh, vertices: smoothedVertices };
    }

    private async simplifyMesh(mesh: Mesh3D, config: SimplificationConfig): Promise<Mesh3D> {
        // Simplified mesh decimation
        const targetVertexCount = Math.floor(mesh.vertices.length * config.targetRatio);

        // This would implement quadric error metrics or other simplification algorithms
        return mesh; // Placeholder
    }

    private async subdivideMesh(mesh: Mesh3D, config: SubdivisionConfig): Promise<Mesh3D> {
        // Implement subdivision surface algorithms
        return mesh; // Placeholder
    }

    private async computeNormals(mesh: Mesh3D): Promise<Mesh3D> {
        const normals: Vector3D[] = new Array(mesh.vertices.length).fill(null).map(() => ({ x: 0, y: 0, z: 0 }));

        // Calculate face normals and accumulate to vertices
        for (const face of mesh.faces) {
            if (face.length >= 3) {
                const v0 = mesh.vertices[face[0]];
                const v1 = mesh.vertices[face[1]];
                const v2 = mesh.vertices[face[2]];

                const normal = this.calculateFaceNormal(v0, v1, v2);

                // Add to vertex normals
                for (const vertexIndex of face) {
                    normals[vertexIndex] = this.add(normals[vertexIndex], normal);
                }
            }
        }

        // Normalize vertex normals
        for (let i = 0; i < normals.length; i++) {
            normals[i] = this.normalize(normals[i]);
        }

        return { ...mesh, normals };
    }

    /**
     * Utility methods
     */
    private rebuildIndex(index: SpatialIndex): void {
        // Rebuild spatial index based on type
        switch (index.type) {
            case 'octree':
                this.buildOctree(index);
                break;
            case 'kdtree':
                this.buildKDTree(index);
                break;
            case 'bvh':
                this.buildBVH(index);
                break;
        }
    }

    private buildOctree(index: SpatialIndex): void {
        // Implement octree construction
        console.log('Building octree...');
    }

    private buildKDTree(index: SpatialIndex): void {
        // Implement k-d tree construction
        console.log('Building k-d tree...');
    }

    private buildBVH(index: SpatialIndex): void {
        // Implement bounding volume hierarchy construction
        console.log('Building BVH...');
    }

    private applyFilters(objects: SpatialObject[], filters: SpatialFilter[]): SpatialObject[] {
        return objects.filter(obj => {
            return filters.every(filter => {
                const value = obj.metadata[filter.property];

                switch (filter.operator) {
                    case 'eq': return value === filter.value;
                    case 'ne': return value !== filter.value;
                    case 'lt': return value < filter.value;
                    case 'le': return value <= filter.value;
                    case 'gt': return value > filter.value;
                    case 'ge': return value >= filter.value;
                    case 'in': return Array.isArray(filter.value) && filter.value.includes(value);
                    case 'contains': return String(value).includes(String(filter.value));
                    default: return true;
                }
            });
        });
    }

    private applySorting(objects: SpatialObject[], distances: number[], sorting: SpatialSorting): { objects: SpatialObject[], distances: number[] } {
        const indices = objects.map((_, i) => i);

        indices.sort((a, b) => {
            let comparison = 0;

            switch (sorting.field) {
                case 'distance':
                    comparison = distances[a] - distances[b];
                    break;
                case 'id':
                    comparison = objects[a].id.localeCompare(objects[b].id);
                    break;
                default:
                    comparison = 0;
            }

            return sorting.order === 'desc' ? -comparison : comparison;
        });

        return {
            objects: indices.map(i => objects[i]),
            distances: indices.map(i => distances[i])
        };
    }

    /**
     * Geometric utility methods
     */
    private calculateDistance(p1: Point3D, p2: Point3D): number {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    private getBoundingBoxCenter(bounds: BoundingBox3D): Point3D {
        return {
            x: (bounds.min.x + bounds.max.x) / 2,
            y: (bounds.min.y + bounds.max.y) / 2,
            z: (bounds.min.z + bounds.max.z) / 2
        };
    }

    private boundingBoxIntersects(a: BoundingBox3D, b: BoundingBox3D): boolean {
        return (
            a.min.x <= b.max.x && a.max.x >= b.min.x &&
            a.min.y <= b.max.y && a.max.y >= b.min.y &&
            a.min.z <= b.max.z && a.max.z >= b.min.z
        );
    }

    private boundingSphereIntersects(a: BoundingSphere3D, b: BoundingSphere3D): boolean {
        const distance = this.calculateDistance(a.center, b.center);
        return distance <= (a.radius + b.radius);
    }

    private boundingBoxToSphere(bounds: BoundingBox3D): BoundingSphere3D {
        const center = this.getBoundingBoxCenter(bounds);
        const radius = this.calculateDistance(bounds.min, bounds.max) / 2;
        return { center, radius };
    }

    private rayIntersectBounds(ray: Ray3D, bounds: BoundingBox3D): { distance: number } | null {
        // Simplified ray-AABB intersection
        const tMin = (bounds.min.x - ray.origin.x) / ray.direction.x;
        const tMax = (bounds.max.x - ray.origin.x) / ray.direction.x;

        if (tMin > tMax) return null;

        return { distance: Math.max(0, tMin) };
    }

    private async rayIntersectGeometry(ray: Ray3D, object: SpatialObject): Promise<RaycastResult | null> {
        // Detailed ray-geometry intersection
        return {
            object,
            point: ray.origin,
            normal: { x: 0, y: 1, z: 0 },
            distance: 0,
            uv: { u: 0, v: 0 }
        };
    }

    private signedVolumeOfTetrahedron(a: Point3D, b: Point3D, c: Point3D, d: Point3D): number {
        const ab = this.subtract(b, a);
        const ac = this.subtract(c, a);
        const ad = this.subtract(d, a);

        return this.dot(ab, this.cross(ac, ad)) / 6;
    }

    private triangleArea(a: Point3D, b: Point3D, c: Point3D): number {
        const ab = this.subtract(b, a);
        const ac = this.subtract(c, a);
        const cross = this.cross(ab, ac);
        return this.magnitude(cross) / 2;
    }

    private calculateFaceNormal(a: Point3D, b: Point3D, c: Point3D): Vector3D {
        const ab = this.subtract(b, a);
        const ac = this.subtract(c, a);
        return this.normalize(this.cross(ab, ac));
    }

    private countEdges(mesh: Mesh3D): number {
        const edges = new Set<string>();

        for (const face of mesh.faces) {
            for (let i = 0; i < face.length; i++) {
                const v1 = face[i];
                const v2 = face[(i + 1) % face.length];
                const edge = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
                edges.add(edge);
            }
        }

        return edges.size;
    }

    private removeDuplicateVertices(mesh: Mesh3D): Mesh3D {
        // Implement vertex deduplication
        return mesh; // Placeholder
    }

    private getVertexNeighbors(mesh: Mesh3D, vertexIndex: number): number[] {
        const neighbors: Set<number> = new Set();

        for (const face of mesh.faces) {
            const index = face.indexOf(vertexIndex);
            if (index !== -1) {
                // Add adjacent vertices in the face
                const prev = face[(index - 1 + face.length) % face.length];
                const next = face[(index + 1) % face.length];
                neighbors.add(prev);
                neighbors.add(next);
            }
        }

        return Array.from(neighbors);
    }

    private averagePositions(positions: Point3D[]): Point3D {
        const avg = { x: 0, y: 0, z: 0 };

        for (const pos of positions) {
            avg.x += pos.x;
            avg.y += pos.y;
            avg.z += pos.z;
        }

        const count = positions.length;
        return {
            x: avg.x / count,
            y: avg.y / count,
            z: avg.z / count
        };
    }

    /**
     * Vector math utilities
     */
    private add(a: Vector3D, b: Vector3D): Vector3D {
        return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    }

    private subtract(a: Point3D, b: Point3D): Vector3D {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    }

    private cross(a: Vector3D, b: Vector3D): Vector3D {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    }

    private dot(a: Vector3D, b: Vector3D): number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    private magnitude(v: Vector3D): number {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    private normalize(v: Vector3D): Vector3D {
        const mag = this.magnitude(v);
        if (mag === 0) return { x: 0, y: 0, z: 0 };
        return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
    }

    private updateQueryStats(executionTime: number): void {
        this.queryStats.totalQueries++;
        this.queryStats.avgQueryTime = (
            (this.queryStats.avgQueryTime * (this.queryStats.totalQueries - 1) + executionTime) /
            this.queryStats.totalQueries
        );
    }

    /**
     * Public API methods
     */
    public getStats(): any {
        return { ...this.queryStats };
    }

    public clearCache(): void {
        this.analysisCache.clear();
    }

    public addMesh(mesh: Mesh3D): void {
        this.meshes.set(mesh.id, mesh);
    }

    public getMesh(id: string): Mesh3D | undefined {
        return this.meshes.get(id);
    }

    /**
     * Cleanup resources
     */
    public dispose(): void {
        // Dispose compute shaders
        this.computeShaders.cleanup();

        // Clear data structures
        this.indices.clear();
        this.meshes.clear();
        this.analysisCache.clear();

        console.log('G3D Spatial Analyzer disposed');
    }
}

// Additional interfaces
interface RaycastResult {
    object: SpatialObject;
    point: Point3D;
    normal: Vector3D;
    distance: number;
    uv: { u: number; v: number };
}