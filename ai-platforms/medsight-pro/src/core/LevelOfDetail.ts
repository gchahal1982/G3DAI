/**
 * G3D MedSight Pro - Advanced Level of Detail System
 * Intelligent LOD management for medical 3D visualization
 * 
 * Features:
 * - Medical-aware LOD algorithms
 * - Adaptive quality based on medical importance
 * - Real-time LOD switching
 * - Clinical accuracy preservation
 * - Performance optimization for medical data
 * - Multi-resolution medical meshes
 */

import { vec3, mat4 } from 'gl-matrix';

export interface LODConfig {
    enableAdaptiveLOD: boolean;
    enableMedicalAwareness: boolean;
    maxLODLevels: number;
    qualityThreshold: number;
    preserveClinicalAccuracy: boolean;
    enableGPULOD: boolean;
    medicalImportanceWeight: number;
}

export interface LODLevel {
    level: number;
    distance: number;
    quality: number;
    vertices: Float32Array;
    normals: Float32Array;
    indices: Uint32Array;
    medicalData?: Float32Array;
    vertexCount: number;
    triangleCount: number;
    memoryUsage: number;
    clinicalAccuracy: number;
    medicalImportance: number;
}

export interface LODMesh {
    id: string;
    name: string;
    originalMesh: MeshData;
    lodLevels: LODLevel[];
    currentLevel: number;
    medicalType: 'anatomy' | 'pathology' | 'implant' | 'measurement' | 'annotation';
    clinicalPriority: 'low' | 'medium' | 'high' | 'critical';
    bounds: Bounds;
    lastUpdateTime: number;
}

export interface MeshData {
    vertices: Float32Array;
    normals: Float32Array;
    indices: Uint32Array;
    uvs?: Float32Array;
    colors?: Float32Array;
    medicalData?: Float32Array;
    vertexCount: number;
    triangleCount: number;
}

export interface Bounds {
    min: vec3;
    max: vec3;
    center: vec3;
    radius: number;
    size: vec3;
}

export interface LODCamera {
    position: vec3;
    direction: vec3;
    fov: number;
    near: number;
    far: number;
    viewMatrix: mat4;
    projectionMatrix: mat4;
}

export interface LODMetrics {
    totalMeshes: number;
    activeLODLevels: Map<string, number>;
    memoryUsage: number;
    renderTime: number;
    qualityScore: number;
    clinicalAccuracy: number;
    frameRate: number;
}

export class LevelOfDetail {
    private config: LODConfig;
    private lodMeshes: Map<string, LODMesh> = new Map();
    private lodCache: Map<string, LODLevel[]> = new Map();
    private isInitialized: boolean = false;
    private lastFrameTime: number = 0;
    private frameCount: number = 0;

    // Medical importance weights for different anatomical structures
    private static readonly MEDICAL_IMPORTANCE_WEIGHTS = {
        brain: 1.0,
        heart: 1.0,
        spine: 0.9,
        liver: 0.8,
        kidney: 0.8,
        lung: 0.7,
        bone: 0.6,
        muscle: 0.4,
        skin: 0.3,
        fat: 0.2,
        pathology: 1.0,
        tumor: 1.0,
        implant: 0.9,
        measurement: 0.8,
        annotation: 0.5
    };

    constructor(config: Partial<LODConfig> = {}) {
        this.config = {
            enableAdaptiveLOD: true,
            enableMedicalAwareness: true,
            maxLODLevels: 5,
            qualityThreshold: 0.7,
            preserveClinicalAccuracy: true,
            enableGPULOD: true,
            medicalImportanceWeight: 0.5,
            ...config
        };
    }

    async initialize(): Promise<void> {
        try {
            console.log('Initializing G3D Level of Detail System...');

            // Initialize LOD algorithms
            await this.initializeLODAlgorithms();

            this.isInitialized = true;
            console.log('G3D Level of Detail System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize G3D Level of Detail System:', error);
            throw error;
        }
    }

    private async initializeLODAlgorithms(): Promise<void> {
        console.log('Initializing LOD algorithms...');
        // LOD algorithm initialization would be implemented here
    }

    public createLODMesh(
        meshData: MeshData,
        meshId: string,
        meshName: string,
        medicalType: LODMesh['medicalType'] = 'anatomy',
        clinicalPriority: LODMesh['clinicalPriority'] = 'medium'
    ): LODMesh {
        console.log(`Creating LOD mesh: ${meshId} (${medicalType})`);

        const lodMesh: LODMesh = {
            id: meshId,
            name: meshName,
            originalMesh: meshData,
            lodLevels: [],
            currentLevel: 0,
            medicalType,
            clinicalPriority,
            bounds: this.calculateBounds(meshData.vertices),
            lastUpdateTime: Date.now()
        };

        // Generate LOD levels
        this.generateLODLevels(lodMesh);

        this.lodMeshes.set(meshId, lodMesh);
        return lodMesh;
    }

    private generateLODLevels(lodMesh: LODMesh): void {
        const originalMesh = lodMesh.originalMesh;
        const maxLevels = this.config.maxLODLevels;

        // Calculate medical importance for this mesh
        const medicalImportance = this.calculateMedicalImportance(lodMesh);

        // Generate LOD levels with varying quality
        for (let level = 0; level < maxLevels; level++) {
            const qualityFactor = this.calculateQualityFactor(level, maxLevels, medicalImportance);
            const distance = this.calculateLODDistance(level, lodMesh.bounds.radius);

            const lodLevel = this.generateLODLevel(
                originalMesh,
                level,
                qualityFactor,
                distance,
                medicalImportance
            );

            lodMesh.lodLevels.push(lodLevel);
        }

        console.log(`Generated ${lodMesh.lodLevels.length} LOD levels for ${lodMesh.id}`);
    }

    private calculateMedicalImportance(lodMesh: LODMesh): number {
        let importance = 0.5; // Base importance

        // Adjust based on medical type
        const typeImportance = LevelOfDetail.MEDICAL_IMPORTANCE_WEIGHTS[lodMesh.medicalType] || 0.5; // TODO: Add medical type importance weights
        importance = Math.max(importance, typeImportance);

        // Adjust based on clinical priority
        switch (lodMesh.clinicalPriority) {
            case 'critical':
                importance = Math.max(importance, 1.0);
                break;
            case 'high':
                importance = Math.max(importance, 0.8);
                break;
            case 'medium':
                importance = Math.max(importance, 0.6);
                break;
            case 'low':
                importance = Math.max(importance, 0.4);
                break;
        }

        // Check if mesh name contains important medical terms
        const meshNameLower = lodMesh.name.toLowerCase();
        for (const [term, weight] of Object.entries(LevelOfDetail.MEDICAL_IMPORTANCE_WEIGHTS)) {
            if (meshNameLower.includes(term)) {
                importance = Math.max(importance, weight as number);
            }
        }

        return Math.min(1.0, importance);
    }

    private calculateQualityFactor(level: number, maxLevels: number, medicalImportance: number): number {
        // Base quality reduction
        const baseQuality = 1.0 - (level / maxLevels);

        // Adjust quality based on medical importance
        const medicalAdjustment = this.config.enableMedicalAwareness
            ? medicalImportance * this.config.medicalImportanceWeight
            : 0;

        // Ensure clinical accuracy is preserved for important structures
        const minQuality = this.config.preserveClinicalAccuracy && medicalImportance > 0.7
            ? this.config.qualityThreshold
            : 0.1;

        return Math.max(minQuality, baseQuality + medicalAdjustment);
    }

    private calculateLODDistance(level: number, boundingRadius: number): number {
        // Calculate distance thresholds for LOD switching
        const baseFactor = Math.pow(2, level + 1);
        return boundingRadius * baseFactor;
    }

    private generateLODLevel(
        originalMesh: MeshData,
        level: number,
        qualityFactor: number,
        distance: number,
        medicalImportance: number
    ): LODLevel {
        if (level === 0) {
            // Level 0 is the original mesh
            return {
                level: 0,
                distance: 0,
                quality: 1.0,
                vertices: originalMesh.vertices,
                normals: originalMesh.normals,
                indices: originalMesh.indices,
                medicalData: originalMesh.medicalData,
                vertexCount: originalMesh.vertexCount,
                triangleCount: originalMesh.triangleCount,
                memoryUsage: this.calculateMemoryUsage(originalMesh),
                clinicalAccuracy: 1.0,
                medicalImportance
            };
        }

        // Simplify mesh based on quality factor
        const simplifiedMesh = this.simplifyMesh(originalMesh, qualityFactor, medicalImportance);

        return {
            level,
            distance,
            quality: qualityFactor,
            vertices: simplifiedMesh.vertices,
            normals: simplifiedMesh.normals,
            indices: simplifiedMesh.indices,
            medicalData: simplifiedMesh.medicalData,
            vertexCount: simplifiedMesh.vertexCount,
            triangleCount: simplifiedMesh.triangleCount,
            memoryUsage: this.calculateMemoryUsage(simplifiedMesh),
            clinicalAccuracy: this.calculateClinicalAccuracy(simplifiedMesh, originalMesh),
            medicalImportance
        };
    }

    private simplifyMesh(
        originalMesh: MeshData,
        qualityFactor: number,
        medicalImportance: number
    ): MeshData {
        // Simple mesh simplification algorithm
        const targetVertices = Math.floor(originalMesh.vertexCount * qualityFactor);
        const targetTriangles = Math.floor(originalMesh.triangleCount * qualityFactor);

        // For now, implement a simple decimation
        const step = Math.max(1, Math.floor(1 / qualityFactor));

        const vertices: number[] = [];
        const normals: number[] = [];
        const indices: number[] = [];
        const medicalData: number[] = [];

        // Simple vertex decimation
        for (let i = 0; i < originalMesh.vertexCount; i += step) {
            vertices.push(
                originalMesh.vertices[i * 3],
                originalMesh.vertices[i * 3 + 1],
                originalMesh.vertices[i * 3 + 2]
            );
            normals.push(
                originalMesh.normals[i * 3],
                originalMesh.normals[i * 3 + 1],
                originalMesh.normals[i * 3 + 2]
            );

            if (originalMesh.medicalData) {
                medicalData.push(originalMesh.medicalData[i]);
            }
        }

        // Simple triangle decimation
        for (let i = 0; i < originalMesh.triangleCount; i += step) {
            const i1 = Math.floor(originalMesh.indices[i * 3] / step);
            const i2 = Math.floor(originalMesh.indices[i * 3 + 1] / step);
            const i3 = Math.floor(originalMesh.indices[i * 3 + 2] / step);

            if (i1 < vertices.length / 3 && i2 < vertices.length / 3 && i3 < vertices.length / 3) {
                indices.push(i1, i2, i3);
            }
        }

        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            indices: new Uint32Array(indices),
            medicalData: medicalData.length > 0 ? new Float32Array(medicalData) : undefined,
            vertexCount: vertices.length / 3,
            triangleCount: indices.length / 3
        };
    }

    private calculateClinicalAccuracy(simplifiedMesh: MeshData, originalMesh: MeshData): number {
        // Simple accuracy calculation based on vertex count ratio
        const vertexRatio = simplifiedMesh.vertexCount / originalMesh.vertexCount;
        const triangleRatio = simplifiedMesh.triangleCount / originalMesh.triangleCount;

        return (vertexRatio + triangleRatio) / 2;
    }

    public updateLOD(camera: LODCamera, deltaTime: number): void {
        if (!this.isInitialized) return;

        this.frameCount++;
        const currentTime = Date.now();

        for (const lodMesh of this.lodMeshes.values()) {
            const newLevel = this.calculateOptimalLODLevel(lodMesh, camera);

            if (newLevel !== lodMesh.currentLevel) {
                lodMesh.currentLevel = newLevel;
                lodMesh.lastUpdateTime = currentTime;
            }
        }

        this.lastFrameTime = currentTime;
    }

    private calculateOptimalLODLevel(lodMesh: LODMesh, camera: LODCamera): number {
        // Calculate distance from camera to mesh
        const distance = vec3.distance(camera.position, lodMesh.bounds.center);

        // Adjust distance based on medical importance
        const adjustedDistance = this.config.enableMedicalAwareness
            ? distance * (2.0 - lodMesh.lodLevels[0].medicalImportance)
            : distance;

        // Find appropriate LOD level
        for (let i = lodMesh.lodLevels.length - 1; i >= 0; i--) {
            if (adjustedDistance >= lodMesh.lodLevels[i].distance) {
                return i;
            }
        }

        return 0; // Highest quality
    }

    public getCurrentLODLevel(meshId: string): LODLevel | null {
        const lodMesh = this.lodMeshes.get(meshId);
        if (!lodMesh) return null;

        return lodMesh.lodLevels[lodMesh.currentLevel] || null;
    }

    public setLODLevel(meshId: string, level: number): boolean {
        const lodMesh = this.lodMeshes.get(meshId);
        if (!lodMesh || level < 0 || level >= lodMesh.lodLevels.length) {
            return false;
        }

        lodMesh.currentLevel = level;
        lodMesh.lastUpdateTime = Date.now();
        return true;
    }

    public getMedicalPriorityLOD(clinicalPriority: LODMesh['clinicalPriority']): LODMesh[] {
        return Array.from(this.lodMeshes.values()).filter(
            mesh => mesh.clinicalPriority === clinicalPriority
        );
    }

    public optimizeForFrameRate(targetFPS: number): void {
        const currentFPS = this.calculateCurrentFPS();

        if (currentFPS < targetFPS) {
            // Reduce LOD quality for less important meshes
            this.reduceLODQuality();
        } else if (currentFPS > targetFPS * 1.2) {
            // Increase LOD quality if we have performance headroom
            this.increaseLODQuality();
        }
    }

    private calculateCurrentFPS(): number {
        if (this.frameCount < 10) return 60; // Default assumption

        const timeSpan = this.lastFrameTime - (this.lastFrameTime - 1000); // Last second
        return this.frameCount / (timeSpan / 1000);
    }

    private reduceLODQuality(): void {
        for (const lodMesh of this.lodMeshes.values()) {
            if (lodMesh.lodLevels[0].medicalImportance < 0.7) {
                const newLevel = Math.min(
                    lodMesh.currentLevel + 1,
                    lodMesh.lodLevels.length - 1
                );
                lodMesh.currentLevel = newLevel;
            }
        }
    }

    private increaseLODQuality(): void {
        for (const lodMesh of this.lodMeshes.values()) {
            const newLevel = Math.max(0, lodMesh.currentLevel - 1);
            lodMesh.currentLevel = newLevel;
        }
    }

    private calculateBounds(vertices: Float32Array): Bounds {
        if (vertices.length === 0) {
            return {
                min: vec3.create(),
                max: vec3.create(),
                center: vec3.create(),
                radius: 0,
                size: vec3.create()
            };
        }

        const min = vec3.fromValues(Infinity, Infinity, Infinity);
        const max = vec3.fromValues(-Infinity, -Infinity, -Infinity);

        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];

            if (x < min[0]) min[0] = x;
            if (y < min[1]) min[1] = y;
            if (z < min[2]) min[2] = z;
            if (x > max[0]) max[0] = x;
            if (y > max[1]) max[1] = y;
            if (z > max[2]) max[2] = z;
        }

        const center = vec3.create();
        const size = vec3.create();
        vec3.add(center, min, max);
        vec3.scale(center, center, 0.5);
        vec3.subtract(size, max, min);

        return {
            min,
            max,
            center,
            radius: vec3.length(size) * 0.5,
            size
        };
    }

    private calculateMemoryUsage(meshData: MeshData): number {
        let usage = 0;
        usage += meshData.vertices.byteLength;
        usage += meshData.normals.byteLength;
        usage += meshData.indices.byteLength;
        if (meshData.uvs) usage += meshData.uvs.byteLength;
        if (meshData.colors) usage += meshData.colors.byteLength;
        if (meshData.medicalData) usage += meshData.medicalData.byteLength;
        return usage;
    }

    public getLODMesh(meshId: string): LODMesh | null {
        return this.lodMeshes.get(meshId) || null;
    }

    public getAllLODMeshes(): LODMesh[] {
        return Array.from(this.lodMeshes.values());
    }

    public deleteLODMesh(meshId: string): boolean {
        return this.lodMeshes.delete(meshId);
    }

    public getMetrics(): LODMetrics {
        const activeLODLevels = new Map<string, number>();
        let totalMemoryUsage = 0;
        let totalQuality = 0;
        let totalClinicalAccuracy = 0;

        for (const lodMesh of this.lodMeshes.values()) {
            activeLODLevels.set(lodMesh.id, lodMesh.currentLevel);
            const currentLevel = lodMesh.lodLevels[lodMesh.currentLevel];
            if (currentLevel) {
                totalMemoryUsage += currentLevel.memoryUsage;
                totalQuality += currentLevel.quality;
                totalClinicalAccuracy += currentLevel.clinicalAccuracy;
            }
        }

        const meshCount = this.lodMeshes.size;
        const averageQuality = meshCount > 0 ? totalQuality / meshCount : 0;
        const averageClinicalAccuracy = meshCount > 0 ? totalClinicalAccuracy / meshCount : 0;

        return {
            totalMeshes: meshCount,
            activeLODLevels,
            memoryUsage: totalMemoryUsage,
            renderTime: 0, // Would be measured during rendering
            qualityScore: averageQuality,
            clinicalAccuracy: averageClinicalAccuracy,
            frameRate: this.calculateCurrentFPS()
        };
    }

    public exportLODConfiguration(): any {
        const config = {
            lodMeshes: [] as any[],
            settings: this.config,
            timestamp: Date.now()
        };

        for (const lodMesh of this.lodMeshes.values()) {
            config.lodMeshes.push({
                id: lodMesh.id,
                name: lodMesh.name,
                medicalType: lodMesh.medicalType,
                clinicalPriority: lodMesh.clinicalPriority,
                currentLevel: lodMesh.currentLevel,
                lodLevels: lodMesh.lodLevels.map(level => ({
                    level: level.level,
                    distance: level.distance,
                    quality: level.quality,
                    vertexCount: level.vertexCount,
                    triangleCount: level.triangleCount,
                    memoryUsage: level.memoryUsage,
                    clinicalAccuracy: level.clinicalAccuracy,
                    medicalImportance: level.medicalImportance
                }))
            });
        }

        return config;
    }

    public importLODConfiguration(config: any): boolean {
        try {
            if (config.settings) {
                Object.assign(this.config, config.settings);
            }

            console.log(`Imported LOD configuration with ${config.lodMeshes?.length || 0} meshes`);
            return true;
        } catch (error) {
            console.error('Failed to import LOD configuration:', error);
            return false;
        }
    }

    public dispose(): void {
        console.log('Disposing G3D Level of Detail System...');

        this.lodMeshes.clear();
        this.lodCache.clear();
        this.frameCount = 0;
        this.lastFrameTime = 0;

        this.isInitialized = false;
        console.log('G3D Level of Detail System disposed');
    }
}

export default LevelOfDetail;