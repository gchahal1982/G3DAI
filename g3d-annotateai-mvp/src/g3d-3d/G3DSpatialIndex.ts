/**
 * G3D AnnotateAI - Spatial Index
 * Efficient spatial queries and 3D data structures
 * Octree, KD-tree, and R-tree implementations
 */

export interface SpatialIndexConfig {
    type: IndexType;
    maxDepth: number;
    maxObjects: number;
    minSize: number;
    optimization: IndexOptimization;
    queries: QueryConfig;
}

export type IndexType = 'octree' | 'kdtree' | 'rtree' | 'grid' | 'bvh' | 'adaptive';

export interface IndexOptimization {
    balancing: boolean;
    compression: boolean;
    caching: boolean;
    lazy: boolean;
    parallel: boolean;
}

export interface QueryConfig {
    frustumCulling: boolean;
    levelOfDetail: boolean;
    approximateQueries: boolean;
    batchQueries: boolean;
}

export interface BoundingBox {
    min: [number, number, number];
    max: [number, number, number];
}

export interface SpatialObject {
    id: string;
    boundingBox: BoundingBox;
    data: any;
    metadata?: ObjectMetadata;
}

export interface ObjectMetadata {
    type: string;
    priority: number;
    lastAccessed: Date;
    size: number;
}

export interface QueryResult {
    objects: SpatialObject[];
    queryTime: number;
    nodesVisited: number;
    objectsChecked: number;
    approximation: boolean;
}

export interface RaycastResult {
    hit: boolean;
    object?: SpatialObject;
    point?: [number, number, number];
    distance?: number;
    normal?: [number, number, number];
}

export interface NearestNeighborResult {
    object: SpatialObject;
    distance: number;
}

export interface Ray {
    origin: [number, number, number];
    direction: [number, number, number];
    maxDistance?: number;
}

export interface Frustum {
    planes: Plane[];
}

export interface Plane {
    normal: [number, number, number];
    distance: number;
}

export interface Sphere {
    center: [number, number, number];
    radius: number;
}

export class G3DSpatialIndex {
    private config: SpatialIndexConfig;
    private root: SpatialNode | null = null;
    private objects: Map<string, SpatialObject>;
    private isInitialized: boolean = false;

    constructor(config: SpatialIndexConfig) {
        this.config = config;
        this.objects = new Map();
    }

    /**
     * Initialize spatial index
     */
    public async initialize(boundingBox: BoundingBox): Promise<void> {
        try {
            console.log('Initializing G3D Spatial Index');

            // Create root node based on index type
            switch (this.config.type) {
                case 'octree':
                    this.root = new OctreeNode(boundingBox, 0, this.config);
                    break;
                case 'kdtree':
                    this.root = new KDTreeNode(boundingBox, 0, this.config);
                    break;
                case 'rtree':
                    this.root = new RTreeNode(boundingBox, 0, this.config);
                    break;
                case 'grid':
                    this.root = new GridNode(boundingBox, 0, this.config);
                    break;
                case 'bvh':
                    this.root = new BVHNode(boundingBox, 0, this.config);
                    break;
                default:
                    throw new Error(`Unsupported index type: ${this.config.type}`);
            }

            this.isInitialized = true;
            console.log('G3D Spatial Index initialized successfully');
        } catch (error) {
            console.error('Failed to initialize spatial index:', error);
            throw error;
        }
    }

    /**
     * Insert object into spatial index
     */
    public insert(object: SpatialObject): void {
        if (!this.isInitialized || !this.root) {
            throw new Error('Spatial index not initialized');
        }

        this.objects.set(object.id, object);
        this.root.insert(object);
    }

    /**
     * Remove object from spatial index
     */
    public remove(objectId: string): boolean {
        if (!this.isInitialized || !this.root) {
            throw new Error('Spatial index not initialized');
        }

        const object = this.objects.get(objectId);
        if (!object) return false;

        this.objects.delete(objectId);
        return this.root.remove(object);
    }

    /**
     * Update object in spatial index
     */
    public update(object: SpatialObject): void {
        this.remove(object.id);
        this.insert(object);
    }

    /**
     * Query objects in bounding box
     */
    public queryBoundingBox(boundingBox: BoundingBox): QueryResult {
        if (!this.isInitialized || !this.root) {
            throw new Error('Spatial index not initialized');
        }

        const startTime = performance.now();
        const result = this.root.queryBoundingBox(boundingBox);
        const queryTime = performance.now() - startTime;

        return {
            objects: result.objects,
            queryTime,
            nodesVisited: result.nodesVisited,
            objectsChecked: result.objectsChecked,
            approximation: false
        };
    }

    /**
     * Query objects in sphere
     */
    public querySphere(sphere: Sphere): QueryResult {
        if (!this.isInitialized || !this.root) {
            throw new Error('Spatial index not initialized');
        }

        const startTime = performance.now();
        const result = this.root.querySphere(sphere);
        const queryTime = performance.now() - startTime;

        return {
            objects: result.objects,
            queryTime,
            nodesVisited: result.nodesVisited,
            objectsChecked: result.objectsChecked,
            approximation: false
        };
    }

    /**
     * Query objects in frustum
     */
    public queryFrustum(frustum: Frustum): QueryResult {
        if (!this.isInitialized || !this.root) {
            throw new Error('Spatial index not initialized');
        }

        const startTime = performance.now();
        const result = this.root.queryFrustum(frustum);
        const queryTime = performance.now() - startTime;

        return {
            objects: result.objects,
            queryTime,
            nodesVisited: result.nodesVisited,
            objectsChecked: result.objectsChecked,
            approximation: false
        };
    }

    /**
     * Raycast query
     */
    public raycast(ray: Ray): RaycastResult {
        if (!this.isInitialized || !this.root) {
            throw new Error('Spatial index not initialized');
        }

        return this.root.raycast(ray);
    }

    /**
     * Find nearest neighbor
     */
    public findNearestNeighbor(point: [number, number, number]): NearestNeighborResult | null {
        if (!this.isInitialized || !this.root) {
            throw new Error('Spatial index not initialized');
        }

        return this.root.findNearestNeighbor(point);
    }

    /**
     * Find K nearest neighbors
     */
    public findKNearestNeighbors(point: [number, number, number], k: number): NearestNeighborResult[] {
        if (!this.isInitialized || !this.root) {
            throw new Error('Spatial index not initialized');
        }

        return this.root.findKNearestNeighbors(point, k);
    }

    /**
     * Get index statistics
     */
    public getStatistics(): IndexStatistics {
        if (!this.isInitialized || !this.root) {
            throw new Error('Spatial index not initialized');
        }

        return this.root.getStatistics();
    }

    /**
     * Optimize index
     */
    public optimize(): void {
        if (!this.isInitialized || !this.root) {
            throw new Error('Spatial index not initialized');
        }

        console.log('Optimizing spatial index');
        this.root.optimize();
    }

    /**
     * Clear all objects
     */
    public clear(): void {
        this.objects.clear();
        if (this.root) {
            this.root.clear();
        }
    }

    /**
     * Cleanup resources
     */
    public cleanup(): void {
        this.clear();
        this.root = null;
        this.isInitialized = false;
        console.log('G3D Spatial Index cleanup completed');
    }
}

// Base spatial node class
abstract class SpatialNode {
    protected boundingBox: BoundingBox;
    protected depth: number;
    protected config: SpatialIndexConfig;
    protected objects: SpatialObject[] = [];
    protected children: SpatialNode[] = [];

    constructor(boundingBox: BoundingBox, depth: number, config: SpatialIndexConfig) {
        this.boundingBox = boundingBox;
        this.depth = depth;
        this.config = config;
    }

    abstract insert(object: SpatialObject): void;
    abstract remove(object: SpatialObject): boolean;
    abstract queryBoundingBox(boundingBox: BoundingBox): InternalQueryResult;
    abstract querySphere(sphere: Sphere): InternalQueryResult;
    abstract queryFrustum(frustum: Frustum): InternalQueryResult;
    abstract raycast(ray: Ray): RaycastResult;
    abstract findNearestNeighbor(point: [number, number, number]): NearestNeighborResult | null;
    abstract findKNearestNeighbors(point: [number, number, number], k: number): NearestNeighborResult[];
    abstract optimize(): void;

    public clear(): void {
        this.objects = [];
        this.children = [];
    }

    public getStatistics(): IndexStatistics {
        let nodeCount = 1;
        let objectCount = this.objects.length;
        let maxDepth = this.depth;
        let leafNodes = this.children.length === 0 ? 1 : 0;

        for (const child of this.children) {
            const childStats = child.getStatistics();
            nodeCount += childStats.nodeCount;
            objectCount += childStats.objectCount;
            maxDepth = Math.max(maxDepth, childStats.maxDepth);
            leafNodes += childStats.leafNodes;
        }

        return {
            nodeCount,
            objectCount,
            maxDepth,
            leafNodes,
            averageObjectsPerLeaf: leafNodes > 0 ? objectCount / leafNodes : 0,
            memoryUsage: this.calculateMemoryUsage()
        };
    }

    protected calculateMemoryUsage(): number {
        let memory = 64; // Base node overhead
        memory += this.objects.length * 32; // Object references

        for (const child of this.children) {
            memory += child.calculateMemoryUsage();
        }

        return memory;
    }

    protected shouldSubdivide(): boolean {
        return (
            this.objects.length > this.config.maxObjects &&
            this.depth < this.config.maxDepth &&
            this.getBoundingBoxSize() > this.config.minSize
        );
    }

    protected getBoundingBoxSize(): number {
        const size = this.boundingBox.max;
        const min = this.boundingBox.min;
        return Math.max(size[0] - min[0], size[1] - min[1], size[2] - min[2]);
    }

    protected intersectsBoundingBox(bbox1: BoundingBox, bbox2: BoundingBox): boolean {
        return (
            bbox1.min[0] <= bbox2.max[0] && bbox1.max[0] >= bbox2.min[0] &&
            bbox1.min[1] <= bbox2.max[1] && bbox1.max[1] >= bbox2.min[1] &&
            bbox1.min[2] <= bbox2.max[2] && bbox1.max[2] >= bbox2.min[2]
        );
    }

    protected intersectsSphere(bbox: BoundingBox, sphere: Sphere): boolean {
        const center = sphere.center;
        const radius = sphere.radius;

        let distanceSquared = 0;

        for (let i = 0; i < 3; i++) {
            if (center[i] < bbox.min[i]) {
                distanceSquared += Math.pow(center[i] - bbox.min[i], 2);
            } else if (center[i] > bbox.max[i]) {
                distanceSquared += Math.pow(center[i] - bbox.max[i], 2);
            }
        }

        return distanceSquared <= radius * radius;
    }

    protected intersectsFrustum(bbox: BoundingBox, frustum: Frustum): boolean {
        for (const plane of frustum.planes) {
            const normal = plane.normal;
            const distance = plane.distance;

            // Find the positive vertex (farthest along plane normal)
            const positiveVertex: [number, number, number] = [
                normal[0] >= 0 ? bbox.max[0] : bbox.min[0],
                normal[1] >= 0 ? bbox.max[1] : bbox.min[1],
                normal[2] >= 0 ? bbox.max[2] : bbox.min[2]
            ];

            // Check if positive vertex is behind plane
            const dot = normal[0] * positiveVertex[0] + normal[1] * positiveVertex[1] + normal[2] * positiveVertex[2];
            if (dot + distance < 0) {
                return false; // Outside frustum
            }
        }

        return true; // Inside or intersecting frustum
    }

    protected rayIntersectsBoundingBox(ray: Ray, bbox: BoundingBox): { hit: boolean; distance?: number } {
        const origin = ray.origin;
        const direction = ray.direction;
        const min = bbox.min;
        const max = bbox.max;

        let tMin = 0;
        let tMax = ray.maxDistance || Infinity;

        for (let i = 0; i < 3; i++) {
            if (Math.abs(direction[i]) < 1e-6) {
                // Ray is parallel to the slab
                if (origin[i] < min[i] || origin[i] > max[i]) {
                    return { hit: false };
                }
            } else {
                const t1 = (min[i] - origin[i]) / direction[i];
                const t2 = (max[i] - origin[i]) / direction[i];

                const tNear = Math.min(t1, t2);
                const tFar = Math.max(t1, t2);

                tMin = Math.max(tMin, tNear);
                tMax = Math.min(tMax, tFar);

                if (tMin > tMax) {
                    return { hit: false };
                }
            }
        }

        return { hit: true, distance: tMin };
    }

    protected calculateDistance(point1: [number, number, number], point2: [number, number, number]): number {
        const dx = point1[0] - point2[0];
        const dy = point1[1] - point2[1];
        const dz = point1[2] - point2[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    protected getObjectCenter(object: SpatialObject): [number, number, number] {
        const bbox = object.boundingBox;
        return [
            (bbox.min[0] + bbox.max[0]) / 2,
            (bbox.min[1] + bbox.max[1]) / 2,
            (bbox.min[2] + bbox.max[2]) / 2
        ];
    }
}

// Octree implementation
class OctreeNode extends SpatialNode {
    public insert(object: SpatialObject): void {
        if (!this.intersectsBoundingBox(this.boundingBox, object.boundingBox)) {
            return;
        }

        if (this.children.length === 0) {
            this.objects.push(object);

            if (this.shouldSubdivide()) {
                this.subdivide();
                this.redistributeObjects();
            }
        } else {
            for (const child of this.children) {
                child.insert(object);
            }
        }
    }

    public remove(object: SpatialObject): boolean {
        const index = this.objects.findIndex(obj => obj.id === object.id);
        if (index !== -1) {
            this.objects.splice(index, 1);
            return true;
        }

        for (const child of this.children) {
            if (child.remove(object)) {
                return true;
            }
        }

        return false;
    }

    public queryBoundingBox(boundingBox: BoundingBox): InternalQueryResult {
        const result: InternalQueryResult = {
            objects: [],
            nodesVisited: 1,
            objectsChecked: 0
        };

        if (!this.intersectsBoundingBox(this.boundingBox, boundingBox)) {
            return result;
        }

        // Check objects in this node
        for (const object of this.objects) {
            result.objectsChecked++;
            if (this.intersectsBoundingBox(object.boundingBox, boundingBox)) {
                result.objects.push(object);
            }
        }

        // Check children
        for (const child of this.children) {
            const childResult = child.queryBoundingBox(boundingBox);
            result.objects.push(...childResult.objects);
            result.nodesVisited += childResult.nodesVisited;
            result.objectsChecked += childResult.objectsChecked;
        }

        return result;
    }

    public querySphere(sphere: Sphere): InternalQueryResult {
        const result: InternalQueryResult = {
            objects: [],
            nodesVisited: 1,
            objectsChecked: 0
        };

        if (!this.intersectsSphere(this.boundingBox, sphere)) {
            return result;
        }

        // Check objects in this node
        for (const object of this.objects) {
            result.objectsChecked++;
            if (this.intersectsSphere(object.boundingBox, sphere)) {
                result.objects.push(object);
            }
        }

        // Check children
        for (const child of this.children) {
            const childResult = child.querySphere(sphere);
            result.objects.push(...childResult.objects);
            result.nodesVisited += childResult.nodesVisited;
            result.objectsChecked += childResult.objectsChecked;
        }

        return result;
    }

    public queryFrustum(frustum: Frustum): InternalQueryResult {
        const result: InternalQueryResult = {
            objects: [],
            nodesVisited: 1,
            objectsChecked: 0
        };

        if (!this.intersectsFrustum(this.boundingBox, frustum)) {
            return result;
        }

        // Check objects in this node
        for (const object of this.objects) {
            result.objectsChecked++;
            if (this.intersectsFrustum(object.boundingBox, frustum)) {
                result.objects.push(object);
            }
        }

        // Check children
        for (const child of this.children) {
            const childResult = child.queryFrustum(frustum);
            result.objects.push(...childResult.objects);
            result.nodesVisited += childResult.nodesVisited;
            result.objectsChecked += childResult.objectsChecked;
        }

        return result;
    }

    public raycast(ray: Ray): RaycastResult {
        const intersection = this.rayIntersectsBoundingBox(ray, this.boundingBox);
        if (!intersection.hit) {
            return { hit: false };
        }

        let closestHit: RaycastResult = { hit: false };
        let closestDistance = Infinity;

        // Check objects in this node
        for (const object of this.objects) {
            const objectIntersection = this.rayIntersectsBoundingBox(ray, object.boundingBox);
            if (objectIntersection.hit && objectIntersection.distance! < closestDistance) {
                closestDistance = objectIntersection.distance!;
                closestHit = {
                    hit: true,
                    object,
                    distance: closestDistance,
                    point: [
                        ray.origin[0] + ray.direction[0] * closestDistance,
                        ray.origin[1] + ray.direction[1] * closestDistance,
                        ray.origin[2] + ray.direction[2] * closestDistance
                    ]
                };
            }
        }

        // Check children
        for (const child of this.children) {
            const childHit = child.raycast(ray);
            if (childHit.hit && childHit.distance! < closestDistance) {
                closestHit = childHit;
                closestDistance = childHit.distance!;
            }
        }

        return closestHit;
    }

    public findNearestNeighbor(point: [number, number, number]): NearestNeighborResult | null {
        let nearest: NearestNeighborResult | null = null;
        let minDistance = Infinity;

        // Check objects in this node
        for (const object of this.objects) {
            const center = this.getObjectCenter(object);
            const distance = this.calculateDistance(point, center);

            if (distance < minDistance) {
                minDistance = distance;
                nearest = { object, distance };
            }
        }

        // Check children
        for (const child of this.children) {
            const childNearest = child.findNearestNeighbor(point);
            if (childNearest && childNearest.distance < minDistance) {
                nearest = childNearest;
                minDistance = childNearest.distance;
            }
        }

        return nearest;
    }

    public findKNearestNeighbors(point: [number, number, number], k: number): NearestNeighborResult[] {
        const results: NearestNeighborResult[] = [];

        // Collect all objects with distances
        const candidates: NearestNeighborResult[] = [];

        // Add objects from this node
        for (const object of this.objects) {
            const center = this.getObjectCenter(object);
            const distance = this.calculateDistance(point, center);
            candidates.push({ object, distance });
        }

        // Add objects from children
        for (const child of this.children) {
            const childResults = child.findKNearestNeighbors(point, k);
            candidates.push(...childResults);
        }

        // Sort by distance and take k nearest
        candidates.sort((a, b) => a.distance - b.distance);
        return candidates.slice(0, k);
    }

    public optimize(): void {
        // Remove empty children
        this.children = this.children.filter(child => {
            const stats = child.getStatistics();
            return stats.objectCount > 0;
        });

        // Optimize children
        for (const child of this.children) {
            child.optimize();
        }
    }

    private subdivide(): void {
        const min = this.boundingBox.min;
        const max = this.boundingBox.max;
        const center: [number, number, number] = [
            (min[0] + max[0]) / 2,
            (min[1] + max[1]) / 2,
            (min[2] + max[2]) / 2
        ];

        // Create 8 octants
        const octants: BoundingBox[] = [
            { min: [min[0], min[1], min[2]], max: [center[0], center[1], center[2]] },
            { min: [center[0], min[1], min[2]], max: [max[0], center[1], center[2]] },
            { min: [min[0], center[1], min[2]], max: [center[0], max[1], center[2]] },
            { min: [center[0], center[1], min[2]], max: [max[0], max[1], center[2]] },
            { min: [min[0], min[1], center[2]], max: [center[0], center[1], max[2]] },
            { min: [center[0], min[1], center[2]], max: [max[0], center[1], max[2]] },
            { min: [min[0], center[1], center[2]], max: [center[0], max[1], max[2]] },
            { min: [center[0], center[1], center[2]], max: [max[0], max[1], max[2]] }
        ];

        for (const octant of octants) {
            this.children.push(new OctreeNode(octant, this.depth + 1, this.config));
        }
    }

    private redistributeObjects(): void {
        const objectsToRedistribute = [...this.objects];
        this.objects = [];

        for (const object of objectsToRedistribute) {
            for (const child of this.children) {
                child.insert(object);
            }
        }
    }
}

// Placeholder implementations for other index types
class KDTreeNode extends SpatialNode {
    public insert(object: SpatialObject): void { /* Placeholder */ }
    public remove(object: SpatialObject): boolean { return false; }
    public queryBoundingBox(boundingBox: BoundingBox): InternalQueryResult { return { objects: [], nodesVisited: 0, objectsChecked: 0 }; }
    public querySphere(sphere: Sphere): InternalQueryResult { return { objects: [], nodesVisited: 0, objectsChecked: 0 }; }
    public queryFrustum(frustum: Frustum): InternalQueryResult { return { objects: [], nodesVisited: 0, objectsChecked: 0 }; }
    public raycast(ray: Ray): RaycastResult { return { hit: false }; }
    public findNearestNeighbor(point: [number, number, number]): NearestNeighborResult | null { return null; }
    public findKNearestNeighbors(point: [number, number, number], k: number): NearestNeighborResult[] { return []; }
    public optimize(): void { /* Placeholder */ }
}

class RTreeNode extends SpatialNode {
    public insert(object: SpatialObject): void { /* Placeholder */ }
    public remove(object: SpatialObject): boolean { return false; }
    public queryBoundingBox(boundingBox: BoundingBox): InternalQueryResult { return { objects: [], nodesVisited: 0, objectsChecked: 0 }; }
    public querySphere(sphere: Sphere): InternalQueryResult { return { objects: [], nodesVisited: 0, objectsChecked: 0 }; }
    public queryFrustum(frustum: Frustum): InternalQueryResult { return { objects: [], nodesVisited: 0, objectsChecked: 0 }; }
    public raycast(ray: Ray): RaycastResult { return { hit: false }; }
    public findNearestNeighbor(point: [number, number, number]): NearestNeighborResult | null { return null; }
    public findKNearestNeighbors(point: [number, number, number], k: number): NearestNeighborResult[] { return []; }
    public optimize(): void { /* Placeholder */ }
}

class GridNode extends SpatialNode {
    public insert(object: SpatialObject): void { /* Placeholder */ }
    public remove(object: SpatialObject): boolean { return false; }
    public queryBoundingBox(boundingBox: BoundingBox): InternalQueryResult { return { objects: [], nodesVisited: 0, objectsChecked: 0 }; }
    public querySphere(sphere: Sphere): InternalQueryResult { return { objects: [], nodesVisited: 0, objectsChecked: 0 }; }
    public queryFrustum(frustum: Frustum): InternalQueryResult { return { objects: [], nodesVisited: 0, objectsChecked: 0 }; }
    public raycast(ray: Ray): RaycastResult { return { hit: false }; }
    public findNearestNeighbor(point: [number, number, number]): NearestNeighborResult | null { return null; }
    public findKNearestNeighbors(point: [number, number, number], k: number): NearestNeighborResult[] { return []; }
    public optimize(): void { /* Placeholder */ }
}

class BVHNode extends SpatialNode {
    public insert(object: SpatialObject): void { /* Placeholder */ }
    public remove(object: SpatialObject): boolean { return false; }
    public queryBoundingBox(boundingBox: BoundingBox): InternalQueryResult { return { objects: [], nodesVisited: 0, objectsChecked: 0 }; }
    public querySphere(sphere: Sphere): InternalQueryResult { return { objects: [], nodesVisited: 0, objectsChecked: 0 }; }
    public queryFrustum(frustum: Frustum): InternalQueryResult { return { objects: [], nodesVisited: 0, objectsChecked: 0 }; }
    public raycast(ray: Ray): RaycastResult { return { hit: false }; }
    public findNearestNeighbor(point: [number, number, number]): NearestNeighborResult | null { return null; }
    public findKNearestNeighbors(point: [number, number, number], k: number): NearestNeighborResult[] { return []; }
    public optimize(): void { /* Placeholder */ }
}

// Additional interfaces
interface InternalQueryResult {
    objects: SpatialObject[];
    nodesVisited: number;
    objectsChecked: number;
}

interface IndexStatistics {
    nodeCount: number;
    objectCount: number;
    maxDepth: number;
    leafNodes: number;
    averageObjectsPerLeaf: number;
    memoryUsage: number;
}

export default G3DSpatialIndex;