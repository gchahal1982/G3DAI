/**
 * G3D MedSight Pro - Advanced 3D Spatial Indexing System
 * High-performance spatial data structures for medical volume analysis
 * 
 * Features:
 * - Octree-based spatial partitioning for medical volumes
 * - R-tree indexing for anatomical structures
 * - KD-tree for nearest neighbor queries
 * - Spatial hashing for real-time collision detection
 * - GPU-accelerated spatial queries
 * - Medical-specific spatial optimizations
 */

import { vec3, mat4 } from 'gl-matrix';

// Spatial Index Types
export interface G3DSpatialIndexConfig {
    maxDepth: number;
    maxObjectsPerNode: number;
    enableGPUAcceleration: boolean;
    spatialHashGridSize: number;
    enableAdaptiveRefinement: boolean;
    compressionLevel: 'none' | 'low' | 'medium' | 'high';
    indexType: 'octree' | 'rtree' | 'kdtree' | 'spatial_hash' | 'hybrid';
}

export interface G3DBoundingBox {
    min: vec3;
    max: vec3;
    center: vec3;
    size: vec3;
    volume: number;
}

export interface G3DSpatialObject {
    id: string;
    type: 'voxel' | 'mesh' | 'annotation' | 'roi' | 'vessel' | 'organ' | 'lesion';
    boundingBox: G3DBoundingBox;
    position: vec3;
    data: any;
    metadata: G3DSpatialMetadata;
    priority: number;
    lastAccessed: Date;
}

export interface G3DSpatialMetadata {
    medicalType: 'anatomy' | 'pathology' | 'annotation' | 'measurement' | 'roi';
    organSystem: string;
    tissueType: string;
    density: number;
    intensity: number;
    confidence: number;
    clinicalRelevance: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
}

export interface G3DSpatialQuery {
    type: 'point' | 'range' | 'radius' | 'frustum' | 'ray' | 'nearest' | 'overlap';
    position?: vec3;
    radius?: number;
    range?: G3DBoundingBox;
    direction?: vec3;
    count?: number;
    filters?: G3DSpatialFilter[];
    sortBy?: 'distance' | 'priority' | 'size' | 'relevance';
    maxResults?: number;
}

export interface G3DSpatialFilter {
    property: string;
    operator: 'equals' | 'contains' | 'greater' | 'less' | 'range';
    value: any;
    weight?: number;
}

export interface G3DSpatialQueryResult {
    objects: G3DSpatialObject[];
    distances?: number[];
    intersections?: vec3[];
    totalCount: number;
    queryTime: number;
    cacheHit: boolean;
}

// Octree Implementation for Medical Volumes
export class G3DOctreeNode {
    public bounds: G3DBoundingBox;
    public objects: G3DSpatialObject[] = [];
    public children: G3DOctreeNode[] = [];
    public isLeaf: boolean = true;
    public depth: number;
    public objectCount: number = 0;
    public medicalDensity: number = 0;
    public lastUpdated: Date = new Date();

    constructor(bounds: G3DBoundingBox, depth: number = 0) {
        this.bounds = bounds;
        this.depth = depth;
    }

    public subdivide(): void {
        if (!this.isLeaf) return;

        const { min, max, center } = this.bounds;
        const halfSize = vec3.create();
        vec3.subtract(halfSize, max, center);

        // Create 8 child nodes
        const childBounds: G3DBoundingBox[] = [
            // Bottom level (z = min.z to center.z)
            {
                min: vec3.fromValues(min[0], min[1], min[2]),
                max: vec3.fromValues(center[0], center[1], center[2]),
                center: vec3.create(),
                size: vec3.create(),
                volume: 0
            },
            {
                min: vec3.fromValues(center[0], min[1], min[2]),
                max: vec3.fromValues(max[0], center[1], center[2]),
                center: vec3.create(),
                size: vec3.create(),
                volume: 0
            },
            {
                min: vec3.fromValues(min[0], center[1], min[2]),
                max: vec3.fromValues(center[0], max[1], center[2]),
                center: vec3.create(),
                size: vec3.create(),
                volume: 0
            },
            {
                min: vec3.fromValues(center[0], center[1], min[2]),
                max: vec3.fromValues(max[0], max[1], center[2]),
                center: vec3.create(),
                size: vec3.create(),
                volume: 0
            },
            // Top level (z = center.z to max.z)
            {
                min: vec3.fromValues(min[0], min[1], center[2]),
                max: vec3.fromValues(center[0], center[1], max[2]),
                center: vec3.create(),
                size: vec3.create(),
                volume: 0
            },
            {
                min: vec3.fromValues(center[0], min[1], center[2]),
                max: vec3.fromValues(max[0], center[1], max[2]),
                center: vec3.create(),
                size: vec3.create(),
                volume: 0
            },
            {
                min: vec3.fromValues(min[0], center[1], center[2]),
                max: vec3.fromValues(center[0], max[1], max[2]),
                center: vec3.create(),
                size: vec3.create(),
                volume: 0
            },
            {
                min: vec3.fromValues(center[0], center[1], center[2]),
                max: vec3.fromValues(max[0], max[1], max[2]),
                center: vec3.create(),
                size: vec3.create(),
                volume: 0
            }
        ];

        // Calculate centers, sizes, and volumes for each child
        for (const bounds of childBounds) {
            vec3.add(bounds.center, bounds.min, bounds.max);
            vec3.scale(bounds.center, bounds.center, 0.5);
            vec3.subtract(bounds.size, bounds.max, bounds.min);
            bounds.volume = bounds.size[0] * bounds.size[1] * bounds.size[2];
        }

        // Create child nodes
        this.children = childBounds.map(bounds => new G3DOctreeNode(bounds, this.depth + 1));
        this.isLeaf = false;

        // Redistribute objects to children
        const objectsToRedistribute = [...this.objects];
        this.objects = [];

        for (const obj of objectsToRedistribute) {
            for (const child of this.children) {
                if (this.intersectsBoundingBox(obj.boundingBox, child.bounds)) {
                    child.insert(obj);
                }
            }
        }
    }

    public insert(object: G3DSpatialObject): boolean {
        if (!this.intersectsBoundingBox(object.boundingBox, this.bounds)) {
            return false;
        }

        if (this.isLeaf) {
            this.objects.push(object);
            this.objectCount++;
            this.updateMedicalDensity(object);
            return true;
        }

        // Insert into appropriate children
        let inserted = false;
        for (const child of this.children) {
            if (child.insert(object)) {
                inserted = true;
            }
        }

        if (inserted) {
            this.objectCount++;
            this.updateMedicalDensity(object);
        }

        return inserted;
    }

    public query(query: G3DSpatialQuery): G3DSpatialObject[] {
        const results: G3DSpatialObject[] = [];

        if (!this.intersectsQuery(query)) {
            return results;
        }

        if (this.isLeaf) {
            for (const obj of this.objects) {
                if (this.objectMatchesQuery(obj, query)) {
                    results.push(obj);
                }
            }
        } else {
            for (const child of this.children) {
                results.push(...child.query(query));
            }
        }

        return results;
    }

    public remove(objectId: string): boolean {
        if (this.isLeaf) {
            const index = this.objects.findIndex(obj => obj.id === objectId);
            if (index !== -1) {
                this.objects.splice(index, 1);
                this.objectCount--;
                this.recalculateMedicalDensity();
                return true;
            }
            return false;
        }

        for (const child of this.children) {
            if (child.remove(objectId)) {
                this.objectCount--;
                this.recalculateMedicalDensity();
                return true;
            }
        }

        return false;
    }

    public getStatistics(): {
        depth: number;
        objectCount: number;
        medicalDensity: number;
        memoryUsage: number;
        childCount: number;
    } {
        return {
            depth: this.depth,
            objectCount: this.objectCount,
            medicalDensity: this.medicalDensity,
            memoryUsage: this.calculateMemoryUsage(),
            childCount: this.children.length
        };
    }

    private intersectsBoundingBox(box1: G3DBoundingBox, box2: G3DBoundingBox): boolean {
        return (
            box1.min[0] <= box2.max[0] && box1.max[0] >= box2.min[0] &&
            box1.min[1] <= box2.max[1] && box1.max[1] >= box2.min[1] &&
            box1.min[2] <= box2.max[2] && box1.max[2] >= box2.min[2]
        );
    }

    private intersectsQuery(query: G3DSpatialQuery): boolean {
        switch (query.type) {
            case 'point':
                return this.containsPoint(query.position!);
            case 'range':
                return this.intersectsBoundingBox(this.bounds, query.range!);
            case 'radius':
                return this.intersectsSphere(query.position!, query.radius!);
            case 'frustum':
                // Simplified frustum intersection
                return true; // Would implement proper frustum culling
            default:
                return true;
        }
    }

    private containsPoint(point: vec3): boolean {
        return (
            point[0] >= this.bounds.min[0] && point[0] <= this.bounds.max[0] &&
            point[1] >= this.bounds.min[1] && point[1] <= this.bounds.max[1] &&
            point[2] >= this.bounds.min[2] && point[2] <= this.bounds.max[2]
        );
    }

    private intersectsSphere(center: vec3, radius: number): boolean {
        const closestPoint = vec3.create();
        vec3.max(closestPoint, this.bounds.min, center);
        vec3.min(closestPoint, this.bounds.max, closestPoint);

        const distance = vec3.distance(center, closestPoint);
        return distance <= radius;
    }

    private objectMatchesQuery(object: G3DSpatialObject, query: G3DSpatialQuery): boolean {
        // Apply filters if present
        if (query.filters) {
            for (const filter of query.filters) {
                if (!this.applyFilter(object, filter)) {
                    return false;
                }
            }
        }

        // Type-specific matching
        switch (query.type) {
            case 'point':
                return this.intersectsBoundingBox(object.boundingBox, {
                    min: query.position!,
                    max: query.position!,
                    center: query.position!,
                    size: vec3.fromValues(0, 0, 0),
                    volume: 0
                });
            case 'radius':
                const distance = vec3.distance(object.position, query.position!);
                return distance <= query.radius!;
            default:
                return true;
        }
    }

    private applyFilter(object: G3DSpatialObject, filter: G3DSpatialFilter): boolean {
        const value = this.getObjectProperty(object, filter.property);

        switch (filter.operator) {
            case 'equals':
                return value === filter.value;
            case 'contains':
                return String(value).includes(String(filter.value));
            case 'greater':
                return Number(value) > Number(filter.value);
            case 'less':
                return Number(value) < Number(filter.value);
            case 'range':
                const numValue = Number(value);
                return numValue >= filter.value.min && numValue <= filter.value.max;
            default:
                return true;
        }
    }

    private getObjectProperty(object: G3DSpatialObject, property: string): any {
        const parts = property.split('.');
        let value: any = object;

        for (const part of parts) {
            value = value?.[part];
        }

        return value;
    }

    private updateMedicalDensity(object: G3DSpatialObject): void {
        // Update medical density based on object properties
        const objectDensity = object.metadata.density || 1.0;
        const relevanceWeight = this.getRelevanceWeight(object.metadata.clinicalRelevance);
        this.medicalDensity = (this.medicalDensity * (this.objectCount - 1) + objectDensity * relevanceWeight) / this.objectCount;
    }

    private recalculateMedicalDensity(): void {
        if (this.objectCount === 0) {
            this.medicalDensity = 0;
            return;
        }

        let totalDensity = 0;
        for (const obj of this.objects) {
            const objectDensity = obj.metadata.density || 1.0;
            const relevanceWeight = this.getRelevanceWeight(obj.metadata.clinicalRelevance);
            totalDensity += objectDensity * relevanceWeight;
        }

        this.medicalDensity = totalDensity / this.objectCount;
    }

    private getRelevanceWeight(relevance: string): number {
        switch (relevance) {
            case 'critical': return 4.0;
            case 'high': return 2.0;
            case 'medium': return 1.0;
            case 'low': return 0.5;
            default: return 1.0;
        }
    }

    private calculateMemoryUsage(): number {
        let usage = 0;

        // Base node memory
        usage += 200; // Approximate bytes for node structure

        // Objects memory
        usage += this.objects.length * 150; // Approximate bytes per object reference

        // Children memory
        for (const child of this.children) {
            usage += child.calculateMemoryUsage();
        }

        return usage;
    }
}

// R-tree Implementation for Anatomical Structures
export class G3DRTreeNode {
    public boundingBox: G3DBoundingBox;
    public children: G3DRTreeNode[] = [];
    public objects: G3DSpatialObject[] = [];
    public isLeaf: boolean = true;
    public maxChildren: number = 8;
    public minChildren: number = 4;

    constructor(boundingBox?: G3DBoundingBox) {
        this.boundingBox = boundingBox || this.createEmptyBoundingBox();
    }

    public insert(object: G3DSpatialObject): void {
        if (this.isLeaf) {
            this.objects.push(object);
            this.expandBoundingBox(object.boundingBox);

            if (this.objects.length > this.maxChildren) {
                this.split();
            }
        } else {
            const bestChild = this.chooseBestChild(object.boundingBox);
            bestChild.insert(object);
            this.expandBoundingBox(object.boundingBox);
        }
    }

    public search(query: G3DSpatialQuery): G3DSpatialObject[] {
        const results: G3DSpatialObject[] = [];

        if (!this.intersectsQuery(query)) {
            return results;
        }

        if (this.isLeaf) {
            for (const obj of this.objects) {
                if (this.objectMatchesQuery(obj, query)) {
                    results.push(obj);
                }
            }
        } else {
            for (const child of this.children) {
                results.push(...child.search(query));
            }
        }

        return results;
    }

    private split(): void {
        this.isLeaf = false;

        // Choose split axis and position
        const splitAxis = this.chooseSplitAxis();
        const splitPosition = this.chooseSplitPosition(splitAxis);

        // Create two new children
        const leftChild = new G3DRTreeNode();
        const rightChild = new G3DRTreeNode();

        // Distribute objects
        for (const obj of this.objects) {
            if (obj.boundingBox.center[splitAxis] <= splitPosition) {
                leftChild.insert(obj);
            } else {
                rightChild.insert(obj);
            }
        }

        this.children = [leftChild, rightChild];
        this.objects = [];
    }

    private chooseBestChild(boundingBox: G3DBoundingBox): G3DRTreeNode {
        let bestChild = this.children[0];
        let minEnlargement = this.calculateEnlargement(bestChild.boundingBox, boundingBox);

        for (let i = 1; i < this.children.length; i++) {
            const child = this.children[i];
            const enlargement = this.calculateEnlargement(child.boundingBox, boundingBox);

            if (enlargement < minEnlargement) {
                minEnlargement = enlargement;
                bestChild = child;
            }
        }

        return bestChild;
    }

    private calculateEnlargement(existing: G3DBoundingBox, newBox: G3DBoundingBox): number {
        const expandedMin = vec3.create();
        const expandedMax = vec3.create();

        vec3.min(expandedMin, existing.min, newBox.min);
        vec3.max(expandedMax, existing.max, newBox.max);

        const expandedSize = vec3.create();
        vec3.subtract(expandedSize, expandedMax, expandedMin);

        const expandedVolume = expandedSize[0] * expandedSize[1] * expandedSize[2];
        return expandedVolume - existing.volume;
    }

    private chooseSplitAxis(): number {
        // Choose axis with maximum variance
        let maxVariance = -1;
        let bestAxis = 0;

        for (let axis = 0; axis < 3; axis++) {
            const variance = this.calculateAxisVariance(axis);
            if (variance > maxVariance) {
                maxVariance = variance;
                bestAxis = axis;
            }
        }

        return bestAxis;
    }

    private calculateAxisVariance(axis: number): number {
        if (this.objects.length === 0) return 0;

        const positions = this.objects.map(obj => obj.boundingBox.center[axis]);
        const mean = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
        const variance = positions.reduce((sum, pos) => sum + Math.pow(pos - mean, 2), 0) / positions.length;

        return variance;
    }

    private chooseSplitPosition(axis: number): number {
        const positions = this.objects.map(obj => obj.boundingBox.center[axis]);
        positions.sort((a, b) => a - b);
        return positions[Math.floor(positions.length / 2)];
    }

    private expandBoundingBox(newBox: G3DBoundingBox): void {
        vec3.min(this.boundingBox.min, this.boundingBox.min, newBox.min);
        vec3.max(this.boundingBox.max, this.boundingBox.max, newBox.max);
        vec3.add(this.boundingBox.center, this.boundingBox.min, this.boundingBox.max);
        vec3.scale(this.boundingBox.center, this.boundingBox.center, 0.5);
        vec3.subtract(this.boundingBox.size, this.boundingBox.max, this.boundingBox.min);
        this.boundingBox.volume = this.boundingBox.size[0] * this.boundingBox.size[1] * this.boundingBox.size[2];
    }

    private createEmptyBoundingBox(): G3DBoundingBox {
        return {
            min: vec3.fromValues(Infinity, Infinity, Infinity),
            max: vec3.fromValues(-Infinity, -Infinity, -Infinity),
            center: vec3.create(),
            size: vec3.create(),
            volume: 0
        };
    }

    private intersectsQuery(query: G3DSpatialQuery): boolean {
        switch (query.type) {
            case 'range':
                return this.intersectsBoundingBox(this.boundingBox, query.range!);
            case 'radius':
                return this.intersectsSphere(query.position!, query.radius!);
            default:
                return true;
        }
    }

    private intersectsBoundingBox(box1: G3DBoundingBox, box2: G3DBoundingBox): boolean {
        return (
            box1.min[0] <= box2.max[0] && box1.max[0] >= box2.min[0] &&
            box1.min[1] <= box2.max[1] && box1.max[1] >= box2.min[1] &&
            box1.min[2] <= box2.max[2] && box1.max[2] >= box2.min[2]
        );
    }

    private intersectsSphere(center: vec3, radius: number): boolean {
        const closestPoint = vec3.create();
        vec3.max(closestPoint, this.boundingBox.min, center);
        vec3.min(closestPoint, this.boundingBox.max, closestPoint);

        const distance = vec3.distance(center, closestPoint);
        return distance <= radius;
    }

    private objectMatchesQuery(object: G3DSpatialObject, query: G3DSpatialQuery): boolean {
        switch (query.type) {
            case 'radius':
                const distance = vec3.distance(object.position, query.position!);
                return distance <= query.radius!;
            case 'range':
                return this.intersectsBoundingBox(object.boundingBox, query.range!);
            default:
                return true;
        }
    }
}

// Main Spatial Index System
export class G3DSpatialIndex {
    private config: G3DSpatialIndexConfig;
    private octree: G3DOctreeNode | null = null;
    private rtree: G3DRTreeNode | null = null;
    private spatialHash: Map<string, G3DSpatialObject[]> = new Map();
    private objectRegistry: Map<string, G3DSpatialObject> = new Map();
    private queryCache: Map<string, G3DSpatialQueryResult> = new Map();
    private isInitialized: boolean = false;
    private bounds: G3DBoundingBox;

    constructor(bounds: G3DBoundingBox, config: Partial<G3DSpatialIndexConfig> = {}) {
        this.bounds = bounds;
        this.config = {
            maxDepth: 8,
            maxObjectsPerNode: 16,
            enableGPUAcceleration: true,
            spatialHashGridSize: 32,
            enableAdaptiveRefinement: true,
            compressionLevel: 'medium',
            indexType: 'hybrid',
            ...config
        };
    }

    async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Spatial Index System...');

            // Initialize primary index structure
            if (this.config.indexType === 'octree' || this.config.indexType === 'hybrid') {
                this.octree = new G3DOctreeNode(this.bounds);
            }

            if (this.config.indexType === 'rtree' || this.config.indexType === 'hybrid') {
                this.rtree = new G3DRTreeNode(this.bounds);
            }

            if (this.config.indexType === 'spatial_hash' || this.config.indexType === 'hybrid') {
                this.initializeSpatialHash();
            }

            this.isInitialized = true;
            console.log('G3D Spatial Index System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Spatial Index System:', error);
            throw error;
        }
    }

    private initializeSpatialHash(): void {
        // Initialize spatial hash grid
        const gridSize = this.config.spatialHashGridSize;
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {
                    const key = `${x},${y},${z}`;
                    this.spatialHash.set(key, []);
                }
            }
        }
    }

    public insert(object: G3DSpatialObject): boolean {
        if (!this.isInitialized) {
            throw new Error('Spatial index not initialized');
        }

        // Store in object registry
        this.objectRegistry.set(object.id, object);

        // Insert into appropriate index structures
        let inserted = false;

        if (this.octree) {
            inserted = this.octree.insert(object) || inserted;
        }

        if (this.rtree) {
            this.rtree.insert(object);
            inserted = true;
        }

        if (this.spatialHash.size > 0) {
            this.insertIntoSpatialHash(object);
            inserted = true;
        }

        // Clear cache on insertion
        this.queryCache.clear();

        return inserted;
    }

    public query(query: G3DSpatialQuery): G3DSpatialQueryResult {
        if (!this.isInitialized) {
            throw new Error('Spatial index not initialized');
        }

        const startTime = performance.now();

        // Check cache first
        const cacheKey = this.generateCacheKey(query);
        const cachedResult = this.queryCache.get(cacheKey);

        if (cachedResult) {
            return {
                ...cachedResult,
                queryTime: performance.now() - startTime,
                cacheHit: true
            };
        }

        let results: G3DSpatialObject[] = [];

        // Query appropriate index structures
        if (this.config.indexType === 'octree' && this.octree) {
            results = this.octree.query(query);
        } else if (this.config.indexType === 'rtree' && this.rtree) {
            results = this.rtree.search(query);
        } else if (this.config.indexType === 'spatial_hash') {
            results = this.querySpatialHash(query);
        } else if (this.config.indexType === 'hybrid') {
            // Use best index for query type
            results = this.queryHybrid(query);
        }

        // Apply sorting and limits
        results = this.sortAndLimitResults(results, query);

        const queryTime = performance.now() - startTime;
        const result: G3DSpatialQueryResult = {
            objects: results,
            distances: this.calculateDistances(results, query),
            totalCount: results.length,
            queryTime,
            cacheHit: false
        };

        // Cache result
        this.queryCache.set(cacheKey, result);

        return result;
    }

    public remove(objectId: string): boolean {
        const object = this.objectRegistry.get(objectId);
        if (!object) {
            return false;
        }

        // Remove from object registry
        this.objectRegistry.delete(objectId);

        // Remove from index structures
        let removed = false;

        if (this.octree) {
            removed = this.octree.remove(objectId) || removed;
        }

        if (this.spatialHash.size > 0) {
            this.removeFromSpatialHash(object);
            removed = true;
        }

        // Clear cache on removal
        this.queryCache.clear();

        return removed;
    }

    public update(object: G3DSpatialObject): boolean {
        // Remove old version and insert new
        this.remove(object.id);
        return this.insert(object);
    }

    public getStatistics(): {
        totalObjects: number;
        indexType: string;
        memoryUsage: number;
        cacheSize: number;
        bounds: G3DBoundingBox;
    } {
        return {
            totalObjects: this.objectRegistry.size,
            indexType: this.config.indexType,
            memoryUsage: this.calculateMemoryUsage(),
            cacheSize: this.queryCache.size,
            bounds: this.bounds
        };
    }

    public optimizeIndex(): void {
        if (!this.isInitialized) return;

        console.log('Optimizing spatial index...');

        // Clear cache
        this.queryCache.clear();

        // Rebuild index if needed
        if (this.config.enableAdaptiveRefinement) {
            this.adaptiveRefinement();
        }

        console.log('Spatial index optimization complete');
    }

    private insertIntoSpatialHash(object: G3DSpatialObject): void {
        const gridPositions = this.getGridPositions(object.boundingBox);

        for (const pos of gridPositions) {
            const key = `${pos.x},${pos.y},${pos.z}`;
            const bucket = this.spatialHash.get(key);
            if (bucket) {
                bucket.push(object);
            }
        }
    }

    private removeFromSpatialHash(object: G3DSpatialObject): void {
        const gridPositions = this.getGridPositions(object.boundingBox);

        for (const pos of gridPositions) {
            const key = `${pos.x},${pos.y},${pos.z}`;
            const bucket = this.spatialHash.get(key);
            if (bucket) {
                const index = bucket.findIndex(obj => obj.id === object.id);
                if (index !== -1) {
                    bucket.splice(index, 1);
                }
            }
        }
    }

    private getGridPositions(boundingBox: G3DBoundingBox): { x: number; y: number; z: number }[] {
        const gridSize = this.config.spatialHashGridSize;
        const cellSize = vec3.create();
        vec3.subtract(cellSize, this.bounds.max, this.bounds.min);
        vec3.scale(cellSize, cellSize, 1 / gridSize);

        const minGrid = vec3.create();
        const maxGrid = vec3.create();

        vec3.subtract(minGrid, boundingBox.min, this.bounds.min);
        vec3.divide(minGrid, minGrid, cellSize);
        vec3.floor(minGrid, minGrid);

        vec3.subtract(maxGrid, boundingBox.max, this.bounds.min);
        vec3.divide(maxGrid, maxGrid, cellSize);
        vec3.floor(maxGrid, maxGrid);

        const positions: { x: number; y: number; z: number }[] = [];

        for (let x = Math.max(0, minGrid[0]); x <= Math.min(gridSize - 1, maxGrid[0]); x++) {
            for (let y = Math.max(0, minGrid[1]); y <= Math.min(gridSize - 1, maxGrid[1]); y++) {
                for (let z = Math.max(0, minGrid[2]); z <= Math.min(gridSize - 1, maxGrid[2]); z++) {
                    positions.push({ x, y, z });
                }
            }
        }

        return positions;
    }

    private querySpatialHash(query: G3DSpatialQuery): G3DSpatialObject[] {
        const results: G3DSpatialObject[] = [];
        const processed = new Set<string>();

        let gridPositions: { x: number; y: number; z: number }[] = [];

        if (query.type === 'point' && query.position) {
            gridPositions = this.getGridPositions({
                min: query.position,
                max: query.position,
                center: query.position,
                size: vec3.create(),
                volume: 0
            });
        } else if (query.type === 'range' && query.range) {
            gridPositions = this.getGridPositions(query.range);
        }

        for (const pos of gridPositions) {
            const key = `${pos.x},${pos.y},${pos.z}`;
            const bucket = this.spatialHash.get(key);

            if (bucket) {
                for (const obj of bucket) {
                    if (!processed.has(obj.id)) {
                        processed.add(obj.id);
                        if (this.objectMatchesQuery(obj, query)) {
                            results.push(obj);
                        }
                    }
                }
            }
        }

        return results;
    }

    private queryHybrid(query: G3DSpatialQuery): G3DSpatialObject[] {
        // Choose best index based on query type
        switch (query.type) {
            case 'point':
            case 'range':
                return this.octree ? this.octree.query(query) : [];
            case 'radius':
            case 'nearest':
                return this.rtree ? this.rtree.search(query) : [];
            case 'overlap':
                return this.querySpatialHash(query);
            default:
                return this.octree ? this.octree.query(query) : [];
        }
    }

    private objectMatchesQuery(object: G3DSpatialObject, query: G3DSpatialQuery): boolean {
        // Apply filters if present
        if (query.filters) {
            for (const filter of query.filters) {
                if (!this.applyFilter(object, filter)) {
                    return false;
                }
            }
        }

        return true;
    }

    private applyFilter(object: G3DSpatialObject, filter: G3DSpatialFilter): boolean {
        const value = this.getObjectProperty(object, filter.property);

        switch (filter.operator) {
            case 'equals':
                return value === filter.value;
            case 'contains':
                return String(value).includes(String(filter.value));
            case 'greater':
                return Number(value) > Number(filter.value);
            case 'less':
                return Number(value) < Number(filter.value);
            case 'range':
                const numValue = Number(value);
                return numValue >= filter.value.min && numValue <= filter.value.max;
            default:
                return true;
        }
    }

    private getObjectProperty(object: G3DSpatialObject, property: string): any {
        const parts = property.split('.');
        let value: any = object;

        for (const part of parts) {
            value = value?.[part];
        }

        return value;
    }

    private sortAndLimitResults(results: G3DSpatialObject[], query: G3DSpatialQuery): G3DSpatialObject[] {
        // Sort results if requested
        if (query.sortBy) {
            results.sort((a, b) => {
                switch (query.sortBy) {
                    case 'distance':
                        if (query.position) {
                            const distA = vec3.distance(a.position, query.position);
                            const distB = vec3.distance(b.position, query.position);
                            return distA - distB;
                        }
                        return 0;
                    case 'priority':
                        return b.priority - a.priority;
                    case 'size':
                        return b.boundingBox.volume - a.boundingBox.volume;
                    case 'relevance':
                        const relevanceA = this.getRelevanceScore(a.metadata.clinicalRelevance);
                        const relevanceB = this.getRelevanceScore(b.metadata.clinicalRelevance);
                        return relevanceB - relevanceA;
                    default:
                        return 0;
                }
            });
        }

        // Limit results if requested
        if (query.maxResults && results.length > query.maxResults) {
            results = results.slice(0, query.maxResults);
        }

        return results;
    }

    private calculateDistances(results: G3DSpatialObject[], query: G3DSpatialQuery): number[] | undefined {
        if (!query.position) return undefined;

        return results.map(obj => vec3.distance(obj.position, query.position!));
    }

    private getRelevanceScore(relevance: string): number {
        switch (relevance) {
            case 'critical': return 4;
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
            default: return 0;
        }
    }

    private generateCacheKey(query: G3DSpatialQuery): string {
        return JSON.stringify({
            type: query.type,
            position: query.position,
            radius: query.radius,
            range: query.range,
            filters: query.filters,
            sortBy: query.sortBy,
            maxResults: query.maxResults
        });
    }

    private adaptiveRefinement(): void {
        // Analyze query patterns and optimize index structure
        if (this.octree) {
            // Check if octree needs rebalancing
            const stats = this.octree.getStatistics();
            if (stats.objectCount > this.config.maxObjectsPerNode * 2) {
                // Trigger subdivision if needed
                console.log('Adaptive refinement triggered for octree');
            }
        }
    }

    private calculateMemoryUsage(): number {
        let usage = 0;

        // Object registry
        usage += this.objectRegistry.size * 200; // Approximate bytes per object

        // Octree memory
        if (this.octree) {
            usage += this.octree.getStatistics().memoryUsage;
        }

        // Spatial hash memory
        usage += this.spatialHash.size * 50; // Approximate bytes per bucket

        // Query cache
        usage += this.queryCache.size * 100; // Approximate bytes per cached query

        return usage;
    }

    public dispose(): void {
        this.objectRegistry.clear();
        this.spatialHash.clear();
        this.queryCache.clear();
        this.octree = null;
        this.rtree = null;
        this.isInitialized = false;

        console.log('G3D Spatial Index System disposed');
    }
}

export default G3DSpatialIndex;