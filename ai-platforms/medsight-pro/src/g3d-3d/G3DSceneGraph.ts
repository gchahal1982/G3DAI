/**
 * G3D MedSight Pro - Advanced 3D Scene Graph System
 * Hierarchical scene management for complex medical 3D scenes
 * 
 * Features:
 * - Hierarchical scene node organization
 * - Efficient frustum culling and occlusion culling
 * - Level-of-detail (LOD) management
 * - Animation and transformation systems
 * - Medical-specific scene optimization
 * - GPU-accelerated rendering pipeline
 */

import { vec3, mat4, quat } from 'gl-matrix';

// Scene Graph Types
export interface G3DSceneGraphConfig {
    enableFrustumCulling: boolean;
    enableOcclusionCulling: boolean;
    enableLOD: boolean;
    maxDepth: number;
    enableGPUCulling: boolean;
    cullingDistance: number;
    lodBias: number;
    enableBatching: boolean;
    maxBatchSize: number;
}

export interface G3DTransform {
    position: vec3;
    rotation: quat;
    scale: vec3;
    matrix: mat4;
    worldMatrix: mat4;
    isDirty: boolean;
}

export interface G3DBounds {
    min: vec3;
    max: vec3;
    center: vec3;
    radius: number;
    volume: number;
}

export interface G3DRenderState {
    visible: boolean;
    castShadows: boolean;
    receiveShadows: boolean;
    transparent: boolean;
    renderOrder: number;
    material?: any;
    shader?: string;
    uniforms?: Map<string, any>;
}

export interface G3DLevelOfDetail {
    distances: number[];
    meshes: any[];
    currentLevel: number;
    bias: number;
    enabled: boolean;
}

export interface G3DMedicalNodeData {
    medicalType: 'anatomy' | 'pathology' | 'annotation' | 'measurement' | 'implant';
    organSystem: string;
    tissueType: string;
    clinicalRelevance: 'low' | 'medium' | 'high' | 'critical';
    visibility: {
        default: boolean;
        radiologist: boolean;
        surgeon: boolean;
        student: boolean;
    };
    interactivity: {
        selectable: boolean;
        hoverable: boolean;
        editable: boolean;
        measureable: boolean;
    };
    metadata: Map<string, any>;
}

export interface G3DAnimation {
    id: string;
    type: 'transform' | 'material' | 'visibility' | 'medical';
    duration: number;
    loop: boolean;
    autoplay: boolean;
    keyframes: G3DKeyframe[];
    currentTime: number;
    isPlaying: boolean;
    speed: number;
}

export interface G3DKeyframe {
    time: number;
    value: any;
    interpolation: 'linear' | 'cubic' | 'step';
    easing?: string;
}

export interface G3DCullingResult {
    visibleNodes: G3DSceneNode[];
    culledNodes: G3DSceneNode[];
    renderBatches: G3DRenderBatch[];
    statistics: G3DCullingStatistics;
}

export interface G3DRenderBatch {
    id: string;
    nodes: G3DSceneNode[];
    material: any;
    shader: string;
    instanceCount: number;
    transformMatrices: Float32Array;
    boundingBox: G3DBounds;
}

export interface G3DCullingStatistics {
    totalNodes: number;
    visibleNodes: number;
    frustumCulled: number;
    occlusionCulled: number;
    lodCulled: number;
    distanceCulled: number;
    renderBatches: number;
    cullingTime: number;
}

export interface G3DCamera {
    position: vec3;
    target: vec3;
    up: vec3;
    fov: number;
    aspect: number;
    near: number;
    far: number;
    viewMatrix: mat4;
    projectionMatrix: mat4;
    viewProjectionMatrix: mat4;
    frustum: G3DFrustum;
}

export interface G3DFrustum {
    planes: vec4[];
    corners: vec3[];
    nearPlane: number;
    farPlane: number;
}

// Scene Node Implementation
export class G3DSceneNode {
    public id: string;
    public name: string;
    public type: 'group' | 'mesh' | 'light' | 'camera' | 'medical' | 'annotation';
    public transform: G3DTransform;
    public bounds: G3DBounds;
    public renderState: G3DRenderState;
    public lod: G3DLevelOfDetail | null = null;
    public medicalData: G3DMedicalNodeData | null = null;
    public animations: G3DAnimation[] = [];

    public parent: G3DSceneNode | null = null;
    public children: G3DSceneNode[] = [];

    public userData: Map<string, any> = new Map();
    public lastUpdateFrame: number = 0;
    public isStatic: boolean = false;

    private boundsDirty: boolean = true;
    private worldMatrixDirty: boolean = true;

    constructor(id: string, name: string = '', type: string = 'group') {
        this.id = id;
        this.name = name || id;
        this.type = type as any;

        this.transform = {
            position: vec3.create(),
            rotation: quat.create(),
            scale: vec3.fromValues(1, 1, 1),
            matrix: mat4.create(),
            worldMatrix: mat4.create(),
            isDirty: true
        };

        this.bounds = {
            min: vec3.fromValues(-1, -1, -1),
            max: vec3.fromValues(1, 1, 1),
            center: vec3.create(),
            radius: Math.sqrt(3),
            volume: 8
        };

        this.renderState = {
            visible: true,
            castShadows: true,
            receiveShadows: true,
            transparent: false,
            renderOrder: 0,
            uniforms: new Map()
        };
    }

    // Hierarchy Management
    public addChild(child: G3DSceneNode): void {
        if (child.parent) {
            child.parent.removeChild(child);
        }

        child.parent = this;
        this.children.push(child);
        this.invalidateBounds();
        child.invalidateWorldMatrix();
    }

    public removeChild(child: G3DSceneNode): boolean {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
            this.invalidateBounds();
            return true;
        }
        return false;
    }

    public removeFromParent(): void {
        if (this.parent) {
            this.parent.removeChild(this);
        }
    }

    public getChild(id: string): G3DSceneNode | null {
        for (const child of this.children) {
            if (child.id === id) {
                return child;
            }
            const found = child.getChild(id);
            if (found) {
                return found;
            }
        }
        return null;
    }

    public getChildByName(name: string): G3DSceneNode | null {
        for (const child of this.children) {
            if (child.name === name) {
                return child;
            }
            const found = child.getChildByName(name);
            if (found) {
                return found;
            }
        }
        return null;
    }

    public getChildrenByType(type: string): G3DSceneNode[] {
        const result: G3DSceneNode[] = [];

        for (const child of this.children) {
            if (child.type === type) {
                result.push(child);
            }
            result.push(...child.getChildrenByType(type));
        }

        return result;
    }

    // Transform Operations
    public setPosition(x: number, y: number, z: number): void {
        vec3.set(this.transform.position, x, y, z);
        this.invalidateTransform();
    }

    public setRotation(x: number, y: number, z: number, w: number): void {
        quat.set(this.transform.rotation, x, y, z, w);
        this.invalidateTransform();
    }

    public setScale(x: number, y: number, z: number): void {
        vec3.set(this.transform.scale, x, y, z);
        this.invalidateTransform();
    }

    public translate(x: number, y: number, z: number): void {
        const translation = vec3.fromValues(x, y, z);
        vec3.add(this.transform.position, this.transform.position, translation);
        this.invalidateTransform();
    }

    public rotate(axis: vec3, angle: number): void {
        const rotation = quat.create();
        quat.setAxisAngle(rotation, axis, angle);
        quat.multiply(this.transform.rotation, this.transform.rotation, rotation);
        this.invalidateTransform();
    }

    public lookAt(target: vec3, up: vec3 = vec3.fromValues(0, 1, 0)): void {
        const forward = vec3.create();
        vec3.subtract(forward, target, this.transform.position);
        vec3.normalize(forward, forward);

        const right = vec3.create();
        vec3.cross(right, forward, up);
        vec3.normalize(right, right);

        const newUp = vec3.create();
        vec3.cross(newUp, right, forward);

        const rotationMatrix = mat4.create();
        mat4.set(rotationMatrix,
            right[0], right[1], right[2], 0,
            newUp[0], newUp[1], newUp[2], 0,
            -forward[0], -forward[1], -forward[2], 0,
            0, 0, 0, 1
        );

        mat4.getRotation(this.transform.rotation, rotationMatrix);
        this.invalidateTransform();
    }

    // Transform Matrix Updates
    public updateTransform(): void {
        if (!this.transform.isDirty) return;

        const { position, rotation, scale, matrix } = this.transform;

        // Create transformation matrix
        mat4.fromRotationTranslationScale(matrix, rotation, position, scale);

        this.transform.isDirty = false;
        this.worldMatrixDirty = true;
        this.invalidateBounds();
    }

    public updateWorldMatrix(): void {
        if (!this.worldMatrixDirty) return;

        this.updateTransform();

        if (this.parent) {
            this.parent.updateWorldMatrix();
            mat4.multiply(this.transform.worldMatrix, this.parent.transform.worldMatrix, this.transform.matrix);
        } else {
            mat4.copy(this.transform.worldMatrix, this.transform.matrix);
        }

        this.worldMatrixDirty = false;

        // Update children
        for (const child of this.children) {
            child.invalidateWorldMatrix();
        }
    }

    private invalidateTransform(): void {
        this.transform.isDirty = true;
        this.invalidateWorldMatrix();
    }

    private invalidateWorldMatrix(): void {
        this.worldMatrixDirty = true;
        for (const child of this.children) {
            child.invalidateWorldMatrix();
        }
    }

    // Bounds Calculation
    public updateBounds(): void {
        if (!this.boundsDirty) return;

        if (this.children.length === 0) {
            // Leaf node - use local bounds
            this.calculateLocalBounds();
        } else {
            // Calculate bounds from children
            this.calculateChildBounds();
        }

        this.boundsDirty = false;
    }

    private calculateLocalBounds(): void {
        // Default unit cube bounds - override in subclasses
        vec3.set(this.bounds.min, -0.5, -0.5, -0.5);
        vec3.set(this.bounds.max, 0.5, 0.5, 0.5);
        this.updateBoundsFromMinMax();
    }

    private calculateChildBounds(): void {
        if (this.children.length === 0) return;

        let first = true;

        for (const child of this.children) {
            if (!child.renderState.visible) continue;

            child.updateBounds();
            child.updateWorldMatrix();

            // Transform child bounds to world space
            const childWorldBounds = this.transformBounds(child.bounds, child.transform.worldMatrix);

            if (first) {
                vec3.copy(this.bounds.min, childWorldBounds.min);
                vec3.copy(this.bounds.max, childWorldBounds.max);
                first = false;
            } else {
                vec3.min(this.bounds.min, this.bounds.min, childWorldBounds.min);
                vec3.max(this.bounds.max, this.bounds.max, childWorldBounds.max);
            }
        }

        if (!first) {
            this.updateBoundsFromMinMax();
        }
    }

    private transformBounds(bounds: G3DBounds, matrix: mat4): G3DBounds {
        const corners = [
            vec3.fromValues(bounds.min[0], bounds.min[1], bounds.min[2]),
            vec3.fromValues(bounds.max[0], bounds.min[1], bounds.min[2]),
            vec3.fromValues(bounds.min[0], bounds.max[1], bounds.min[2]),
            vec3.fromValues(bounds.max[0], bounds.max[1], bounds.min[2]),
            vec3.fromValues(bounds.min[0], bounds.min[1], bounds.max[2]),
            vec3.fromValues(bounds.max[0], bounds.min[1], bounds.max[2]),
            vec3.fromValues(bounds.min[0], bounds.max[1], bounds.max[2]),
            vec3.fromValues(bounds.max[0], bounds.max[1], bounds.max[2])
        ];

        const transformedBounds: G3DBounds = {
            min: vec3.fromValues(Infinity, Infinity, Infinity),
            max: vec3.fromValues(-Infinity, -Infinity, -Infinity),
            center: vec3.create(),
            radius: 0,
            volume: 0
        };

        for (const corner of corners) {
            vec3.transformMat4(corner, corner, matrix);
            vec3.min(transformedBounds.min, transformedBounds.min, corner);
            vec3.max(transformedBounds.max, transformedBounds.max, corner);
        }

        this.updateBoundsFromMinMax.call({ bounds: transformedBounds }, transformedBounds);
        return transformedBounds;
    }

    private updateBoundsFromMinMax(): void {
        vec3.add(this.bounds.center, this.bounds.min, this.bounds.max);
        vec3.scale(this.bounds.center, this.bounds.center, 0.5);

        const size = vec3.create();
        vec3.subtract(size, this.bounds.max, this.bounds.min);

        this.bounds.radius = vec3.length(size) * 0.5;
        this.bounds.volume = size[0] * size[1] * size[2];
    }

    public invalidateBounds(): void {
        this.boundsDirty = true;
        if (this.parent) {
            this.parent.invalidateBounds();
        }
    }

    // Level of Detail
    public setLOD(distances: number[], meshes: any[]): void {
        this.lod = {
            distances,
            meshes,
            currentLevel: 0,
            bias: 1.0,
            enabled: true
        };
    }

    public updateLOD(cameraPosition: vec3, lodBias: number = 1.0): void {
        if (!this.lod || !this.lod.enabled) return;

        this.updateWorldMatrix();

        const worldCenter = vec3.create();
        vec3.transformMat4(worldCenter, this.bounds.center, this.transform.worldMatrix);

        const distance = vec3.distance(cameraPosition, worldCenter) * lodBias;

        let newLevel = this.lod.distances.length - 1;
        for (let i = 0; i < this.lod.distances.length; i++) {
            if (distance < this.lod.distances[i]) {
                newLevel = i;
                break;
            }
        }

        this.lod.currentLevel = newLevel;
    }

    // Animation System
    public addAnimation(animation: G3DAnimation): void {
        this.animations.push(animation);
    }

    public removeAnimation(id: string): boolean {
        const index = this.animations.findIndex(anim => anim.id === id);
        if (index !== -1) {
            this.animations.splice(index, 1);
            return true;
        }
        return false;
    }

    public playAnimation(id: string): void {
        const animation = this.animations.find(anim => anim.id === id);
        if (animation) {
            animation.isPlaying = true;
            animation.currentTime = 0;
        }
    }

    public stopAnimation(id: string): void {
        const animation = this.animations.find(anim => anim.id === id);
        if (animation) {
            animation.isPlaying = false;
        }
    }

    public updateAnimations(deltaTime: number): void {
        for (const animation of this.animations) {
            if (!animation.isPlaying) continue;

            animation.currentTime += deltaTime * animation.speed;

            if (animation.currentTime >= animation.duration) {
                if (animation.loop) {
                    animation.currentTime = animation.currentTime % animation.duration;
                } else {
                    animation.currentTime = animation.duration;
                    animation.isPlaying = false;
                }
            }

            this.applyAnimation(animation);
        }
    }

    private applyAnimation(animation: G3DAnimation): void {
        const time = animation.currentTime;

        // Find keyframes
        let keyframe1: G3DKeyframe | null = null;
        let keyframe2: G3DKeyframe | null = null;

        for (let i = 0; i < animation.keyframes.length - 1; i++) {
            if (time >= animation.keyframes[i].time && time <= animation.keyframes[i + 1].time) {
                keyframe1 = animation.keyframes[i];
                keyframe2 = animation.keyframes[i + 1];
                break;
            }
        }

        if (!keyframe1 || !keyframe2) return;

        // Interpolate between keyframes
        const t = (time - keyframe1.time) / (keyframe2.time - keyframe1.time);
        const value = this.interpolateKeyframes(keyframe1, keyframe2, t);

        // Apply animated value
        switch (animation.type) {
            case 'transform':
                this.applyTransformAnimation(value);
                break;
            case 'material':
                this.applyMaterialAnimation(value);
                break;
            case 'visibility':
                this.renderState.visible = value;
                break;
        }
    }

    private interpolateKeyframes(kf1: G3DKeyframe, kf2: G3DKeyframe, t: number): any {
        switch (kf2.interpolation) {
            case 'step':
                return kf1.value;
            case 'linear':
                return this.lerp(kf1.value, kf2.value, t);
            case 'cubic':
                // Simplified cubic interpolation
                return this.lerp(kf1.value, kf2.value, this.smoothstep(t));
            default:
                return kf1.value;
        }
    }

    private lerp(a: any, b: any, t: number): any {
        if (typeof a === 'number' && typeof b === 'number') {
            return a + (b - a) * t;
        }
        // Handle vectors, colors, etc.
        return a; // Simplified
    }

    private smoothstep(t: number): number {
        return t * t * (3 - 2 * t);
    }

    private applyTransformAnimation(value: any): void {
        // Apply transform animation values
        if (value.position) {
            vec3.copy(this.transform.position, value.position);
        }
        if (value.rotation) {
            quat.copy(this.transform.rotation, value.rotation);
        }
        if (value.scale) {
            vec3.copy(this.transform.scale, value.scale);
        }
        this.invalidateTransform();
    }

    private applyMaterialAnimation(value: any): void {
        // Apply material animation values
        if (this.renderState.uniforms) {
            for (const [key, val] of Object.entries(value)) {
                this.renderState.uniforms.set(key, val);
            }
        }
    }

    // Medical-specific methods
    public setMedicalData(data: Partial<G3DMedicalNodeData>): void {
        this.medicalData = {
            medicalType: 'anatomy',
            organSystem: 'unknown',
            tissueType: 'unknown',
            clinicalRelevance: 'medium',
            visibility: {
                default: true,
                radiologist: true,
                surgeon: true,
                student: false
            },
            interactivity: {
                selectable: true,
                hoverable: true,
                editable: false,
                measureable: true
            },
            metadata: new Map(),
            ...data
        };
    }

    public setVisibilityForRole(role: keyof G3DMedicalNodeData['visibility'], visible: boolean): void {
        if (this.medicalData) {
            this.medicalData.visibility[role] = visible;
            // Update actual visibility based on current role
            // This would be handled by the scene graph manager
        }
    }

    // Utility Methods
    public traverse(callback: (node: G3DSceneNode) => void): void {
        callback(this);
        for (const child of this.children) {
            child.traverse(callback);
        }
    }

    public traverseVisible(callback: (node: G3DSceneNode) => void): void {
        if (this.renderState.visible) {
            callback(this);
            for (const child of this.children) {
                child.traverseVisible(callback);
            }
        }
    }

    public getWorldPosition(): vec3 {
        this.updateWorldMatrix();
        const worldPos = vec3.create();
        mat4.getTranslation(worldPos, this.transform.worldMatrix);
        return worldPos;
    }

    public getWorldBounds(): G3DBounds {
        this.updateBounds();
        this.updateWorldMatrix();
        return this.transformBounds(this.bounds, this.transform.worldMatrix);
    }

    public clone(): G3DSceneNode {
        const cloned = new G3DSceneNode(`${this.id}_clone`, `${this.name}_clone`, this.type);

        // Copy transform
        vec3.copy(cloned.transform.position, this.transform.position);
        quat.copy(cloned.transform.rotation, this.transform.rotation);
        vec3.copy(cloned.transform.scale, this.transform.scale);

        // Copy render state
        Object.assign(cloned.renderState, this.renderState);
        cloned.renderState.uniforms = new Map(this.renderState.uniforms);

        // Copy medical data
        if (this.medicalData) {
            cloned.setMedicalData({
                ...this.medicalData,
                metadata: new Map(this.medicalData.metadata)
            });
        }

        // Copy LOD
        if (this.lod) {
            cloned.setLOD([...this.lod.distances], [...this.lod.meshes]);
        }

        // Copy animations
        cloned.animations = this.animations.map(anim => ({ ...anim }));

        // Clone children
        for (const child of this.children) {
            cloned.addChild(child.clone());
        }

        return cloned;
    }

    public dispose(): void {
        // Remove from parent
        this.removeFromParent();

        // Dispose children
        for (const child of this.children) {
            child.cleanup();
        }
        this.children = [];

        // Clear data
        this.animations = [];
        this.userData.clear();
        if (this.medicalData?.metadata) {
            this.medicalData.metadata.clear();
        }
        if (this.renderState.uniforms) {
            this.renderState.uniforms.clear();
        }
    }
}

// Scene Graph Manager
export class G3DSceneGraph {
    private config: G3DSceneGraphConfig;
    private rootNode: G3DSceneNode;
    private nodeRegistry: Map<string, G3DSceneNode> = new Map();
    private frameNumber: number = 0;
    private lastCullingResult: G3DCullingResult | null = null;

    constructor(config: Partial<G3DSceneGraphConfig> = {}) {
        this.config = {
            enableFrustumCulling: true,
            enableOcclusionCulling: false,
            enableLOD: true,
            maxDepth: 32,
            enableGPUCulling: false,
            cullingDistance: 1000,
            lodBias: 1.0,
            enableBatching: true,
            maxBatchSize: 100,
            ...config
        };

        this.rootNode = new G3DSceneNode('root', 'Scene Root', 'group');
        this.registerNode(this.rootNode);
    }

    // Node Management
    public getRootNode(): G3DSceneNode {
        return this.rootNode;
    }

    public addNode(node: G3DSceneNode, parent: G3DSceneNode = this.rootNode): void {
        parent.addChild(node);
        this.registerNode(node);
    }

    public removeNode(node: G3DSceneNode): boolean {
        if (node === this.rootNode) return false;

        node.removeFromParent();
        this.unregisterNode(node);
        return true;
    }

    public getNode(id: string): G3DSceneNode | null {
        return this.nodeRegistry.get(id) || null;
    }

    public getNodesByType(type: string): G3DSceneNode[] {
        return this.rootNode.getChildrenByType(type);
    }

    private registerNode(node: G3DSceneNode): void {
        this.nodeRegistry.set(node.id, node);

        // Register children recursively
        for (const child of node.children) {
            this.registerNode(child);
        }
    }

    private unregisterNode(node: G3DSceneNode): void {
        this.nodeRegistry.delete(node.id);

        // Unregister children recursively
        for (const child of node.children) {
            this.unregisterNode(child);
        }
    }

    // Update System
    public update(deltaTime: number): void {
        this.frameNumber++;

        // Update animations
        this.rootNode.traverse(node => {
            node.updateAnimations(deltaTime);
            node.lastUpdateFrame = this.frameNumber;
        });

        // Update transforms and bounds
        this.rootNode.updateWorldMatrix();
        this.rootNode.updateBounds();
    }

    // Culling System
    public cull(camera: G3DCamera): G3DCullingResult {
        const startTime = Date.now();

        const result: G3DCullingResult = {
            visibleNodes: [],
            culledNodes: [],
            renderBatches: [],
            statistics: {
                totalNodes: 0,
                visibleNodes: 0,
                frustumCulled: 0,
                occlusionCulled: 0,
                lodCulled: 0,
                distanceCulled: 0,
                renderBatches: 0,
                cullingTime: 0
            }
        };

        // Update camera frustum
        this.updateCameraFrustum(camera);

        // Perform culling
        this.cullNode(this.rootNode, camera, result);

        // Create render batches
        if (this.config.enableBatching) {
            this.createRenderBatches(result);
        }

        result.statistics.cullingTime = Date.now() - startTime;
        this.lastCullingResult = result;

        return result;
    }

    private cullNode(node: G3DSceneNode, camera: G3DCamera, result: G3DCullingResult): void {
        result.statistics.totalNodes++;

        // Skip if not visible
        if (!node.renderState.visible) {
            result.culledNodes.push(node);
            return;
        }

        // Update LOD
        if (this.config.enableLOD && node.lod) {
            node.updateLOD(camera.position, this.config.lodBias);

            // Check if current LOD level should be rendered
            if (node.lod.currentLevel >= node.lod.meshes.length) {
                result.culledNodes.push(node);
                result.statistics.lodCulled++;
                return;
            }
        }

        // Distance culling
        if (this.config.cullingDistance > 0) {
            const worldBounds = node.getWorldBounds();
            const distance = vec3.distance(camera.position, worldBounds.center);

            if (distance - worldBounds.radius > this.config.cullingDistance) {
                result.culledNodes.push(node);
                result.statistics.distanceCulled++;
                return;
            }
        }

        // Frustum culling
        if (this.config.enableFrustumCulling) {
            const worldBounds = node.getWorldBounds();
            if (!this.isInFrustum(worldBounds, camera.frustum)) {
                result.culledNodes.push(node);
                result.statistics.frustumCulled++;
                return;
            }
        }

        // Occlusion culling (simplified)
        if (this.config.enableOcclusionCulling) {
            if (this.isOccluded(node, camera)) {
                result.culledNodes.push(node);
                result.statistics.occlusionCulled++;
                return;
            }
        }

        // Node is visible
        result.visibleNodes.push(node);
        result.statistics.visibleNodes++;

        // Cull children
        for (const child of node.children) {
            this.cullNode(child, camera, result);
        }
    }

    private updateCameraFrustum(camera: G3DCamera): void {
        // Update view and projection matrices
        mat4.lookAt(camera.viewMatrix, camera.position, camera.target, camera.up);
        mat4.perspective(camera.projectionMatrix, camera.fov, camera.aspect, camera.near, camera.far);
        mat4.multiply(camera.viewProjectionMatrix, camera.projectionMatrix, camera.viewMatrix);

        // Extract frustum planes
        camera.frustum = this.extractFrustumPlanes(camera.viewProjectionMatrix);
    }

    private extractFrustumPlanes(viewProjectionMatrix: mat4): G3DFrustum {
        const planes: vec4[] = [];
        const m = viewProjectionMatrix;

        // Extract the six frustum planes
        // Left plane
        planes.push(vec4.fromValues(m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]));
        // Right plane  
        planes.push(vec4.fromValues(m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]));
        // Bottom plane
        planes.push(vec4.fromValues(m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]));
        // Top plane
        planes.push(vec4.fromValues(m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]));
        // Near plane
        planes.push(vec4.fromValues(m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]));
        // Far plane
        planes.push(vec4.fromValues(m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]));

        // Normalize planes
        for (const plane of planes) {
            const length = Math.sqrt(plane[0] * plane[0] + plane[1] * plane[1] + plane[2] * plane[2]);
            vec4.scale(plane, plane, 1 / length);
        }

        return {
            planes,
            corners: [], // Would calculate frustum corners
            nearPlane: 0, // Would extract from matrix
            farPlane: 0   // Would extract from matrix
        };
    }

    private isInFrustum(bounds: G3DBounds, frustum: G3DFrustum): boolean {
        for (const plane of frustum.planes) {
            const distance = plane[0] * bounds.center[0] +
                plane[1] * bounds.center[1] +
                plane[2] * bounds.center[2] +
                plane[3];

            if (distance < -bounds.radius) {
                return false;
            }
        }
        return true;
    }

    private isOccluded(node: G3DSceneNode, camera: G3DCamera): boolean {
        // Simplified occlusion culling - would use occlusion queries in real implementation
        return false;
    }

    private createRenderBatches(result: G3DCullingResult): void {
        const batches = new Map<string, G3DSceneNode[]>();

        // Group nodes by material/shader
        for (const node of result.visibleNodes) {
            if (node.type !== 'mesh') continue;

            const key = `${node.renderState.shader || 'default'}_${node.renderState.material || 'default'}`;

            if (!batches.has(key)) {
                batches.set(key, []);
            }

            const batch = batches.get(key)!;
            if (batch.length < this.config.maxBatchSize) {
                batch.push(node);
            }
        }

        // Create render batches
        let batchId = 0;
        for (const [key, nodes] of batches) {
            if (nodes.length === 0) continue;

            const transformMatrices = new Float32Array(nodes.length * 16);
            let minBounds = vec3.fromValues(Infinity, Infinity, Infinity);
            let maxBounds = vec3.fromValues(-Infinity, -Infinity, -Infinity);

            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                node.updateWorldMatrix();

                // Copy transform matrix
                const offset = i * 16;
                for (let j = 0; j < 16; j++) {
                    transformMatrices[offset + j] = node.transform.worldMatrix[j];
                }

                // Update batch bounds
                const worldBounds = node.getWorldBounds();
                vec3.min(minBounds, minBounds, worldBounds.min);
                vec3.max(maxBounds, maxBounds, worldBounds.max);
            }

            const center = vec3.create();
            vec3.add(center, minBounds, maxBounds);
            vec3.scale(center, center, 0.5);

            const size = vec3.create();
            vec3.subtract(size, maxBounds, minBounds);

            result.renderBatches.push({
                id: `batch_${batchId++}`,
                nodes,
                material: nodes[0].renderState.material,
                shader: nodes[0].renderState.shader || 'default',
                instanceCount: nodes.length,
                transformMatrices,
                boundingBox: {
                    min: minBounds,
                    max: maxBounds,
                    center,
                    radius: vec3.length(size) * 0.5,
                    volume: size[0] * size[1] * size[2]
                }
            });
        }

        result.statistics.renderBatches = result.renderBatches.length;
    }

    // Medical-specific methods
    public setVisibilityByMedicalType(medicalType: string, visible: boolean): void {
        this.rootNode.traverse(node => {
            if (node.medicalData?.medicalType === medicalType) {
                node.renderState.visible = visible;
            }
        });
    }

    public setVisibilityByOrganSystem(organSystem: string, visible: boolean): void {
        this.rootNode.traverse(node => {
            if (node.medicalData?.organSystem === organSystem) {
                node.renderState.visible = visible;
            }
        });
    }

    public setVisibilityByClinicalRelevance(relevance: string, visible: boolean): void {
        this.rootNode.traverse(node => {
            if (node.medicalData?.clinicalRelevance === relevance) {
                node.renderState.visible = visible;
            }
        });
    }

    public getNodesByMedicalCriteria(criteria: {
        medicalType?: string;
        organSystem?: string;
        clinicalRelevance?: string;
    }): G3DSceneNode[] {
        const results: G3DSceneNode[] = [];

        this.rootNode.traverse(node => {
            if (!node.medicalData) return;

            let matches = true;

            if (criteria.medicalType && node.medicalData.medicalType !== criteria.medicalType) {
                matches = false;
            }

            if (criteria.organSystem && node.medicalData.organSystem !== criteria.organSystem) {
                matches = false;
            }

            if (criteria.clinicalRelevance && node.medicalData.clinicalRelevance !== criteria.clinicalRelevance) {
                matches = false;
            }

            if (matches) {
                results.push(node);
            }
        });

        return results;
    }

    // Statistics and Debugging
    public getStatistics(): {
        totalNodes: number;
        visibleNodes: number;
        memoryUsage: number;
        lastCullingTime: number;
        renderBatches: number;
    } {
        return {
            totalNodes: this.nodeRegistry.size,
            visibleNodes: this.lastCullingResult?.statistics.visibleNodes || 0,
            memoryUsage: this.calculateMemoryUsage(),
            lastCullingTime: this.lastCullingResult?.statistics.cullingTime || 0,
            renderBatches: this.lastCullingResult?.statistics.renderBatches || 0
        };
    }

    private calculateMemoryUsage(): number {
        let usage = 0;

        // Estimate memory usage
        usage += this.nodeRegistry.size * 1000; // Approximate bytes per node

        if (this.lastCullingResult) {
            usage += this.lastCullingResult.renderBatches.length * 500; // Approximate bytes per batch
        }

        return usage;
    }

    public dispose(): void {
        this.rootNode.cleanup();
        this.nodeRegistry.clear();
        this.lastCullingResult = null;

        console.log('G3D Scene Graph disposed');
    }
}

// Type declarations for vec4 (not in gl-matrix by default)
type vec4 = [number, number, number, number];
const vec4 = {
    fromValues: (x: number, y: number, z: number, w: number): vec4 => [x, y, z, w],
    scale: (out: vec4, a: vec4, scale: number): vec4 => {
        out[0] = a[0] * scale;
        out[1] = a[1] * scale;
        out[2] = a[2] * scale;
        out[3] = a[3] * scale;
        return out;
    }
};

export default G3DSceneGraph;