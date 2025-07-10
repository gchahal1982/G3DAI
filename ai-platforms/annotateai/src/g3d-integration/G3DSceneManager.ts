/**
 * G3D Scene Manager - Advanced scene management with optimized object handling
 * Provides efficient scene graph, frustum culling, and LOD management
 */

import { mat4, vec3, vec4, quat } from 'gl-matrix';
import { G3DNativeRenderer, G3DRenderObject } from './G3DNativeRenderer';

// Scene node types
export type G3DNodeType = 'group' | 'mesh' | 'light' | 'camera' | 'annotation' | 'helper';

// Scene node interface
export interface G3DSceneNode {
    id: string;
    name: string;
    type: G3DNodeType;
    parent: G3DSceneNode | null;
    children: G3DSceneNode[];
    transform: G3DTransform;
    visible: boolean;
    renderOrder: number;
    userData: any;
    boundingBox?: G3DBoundingBox;
    boundingSphere?: G3DBoundingSphere;
    
    // Add method for adding children
    add?: (child: G3DSceneNode | any) => void;
}

// Transform component
export class G3DTransform {
    position: vec3 = vec3.create();
    rotation: quat = quat.create();
    scale: vec3 = vec3.fromValues(1, 1, 1);
    matrix: mat4 = mat4.create();
    worldMatrix: mat4 = mat4.create();
    dirty: boolean = true;

    setPosition(x: number, y: number, z: number): void {
        vec3.set(this.position, x, y, z);
        this.dirty = true;
    }

    setRotation(x: number, y: number, z: number, w: number): void {
        quat.set(this.rotation, x, y, z, w);
        this.dirty = true;
    }

    setScale(x: number, y: number, z: number): void {
        vec3.set(this.scale, x, y, z);
        this.dirty = true;
    }

    updateMatrix(): void {
        if (!this.dirty) return;

        mat4.fromRotationTranslationScale(this.matrix, this.rotation, this.position, this.scale);
        this.dirty = false;
    }

    getMatrix(): mat4 {
        this.updateMatrix();
        return this.matrix;
    }
}

// Bounding box for frustum culling
export interface G3DBoundingBox {
    min: vec3;
    max: vec3;
    center: vec3;
    size: vec3;
}

// Bounding sphere for frustum culling
export interface G3DBoundingSphere {
    center: vec3;
    radius: number;
}

// Frustum planes for culling
export interface G3DFrustum {
    planes: vec4[]; // 6 planes: left, right, top, bottom, near, far
}

// LOD (Level of Detail) configuration
export interface G3DLODConfig {
    distances: number[];
    meshes: G3DSceneNode[];
}

// Scene statistics
export interface G3DSceneStats {
    nodeCount: number;
    visibleNodes: number;
    culledNodes: number;
    drawCalls: number;
    triangles: number;
    updateTime: number;
    cullTime: number;
}

// Main G3D Scene Manager Class
export class G3DSceneManager {
    private renderer: G3DNativeRenderer;
    private root: G3DSceneNode;
    private nodes: Map<string, G3DSceneNode> = new Map();
    private dirtyNodes: Set<G3DSceneNode> = new Set();
    private frustum: G3DFrustum = { planes: [] };
    private stats: G3DSceneStats = {
        nodeCount: 0,
        visibleNodes: 0,
        culledNodes: 0,
        drawCalls: 0,
        triangles: 0,
        updateTime: 0,
        cullTime: 0
    };
    private updateCallbacks: Map<string, (node: G3DSceneNode, deltaTime: number) => void> = new Map();
    private lastUpdateTime: number = 0;
    
    // Add missing properties
    private activeCamera: G3DCamera | null = null;
    private cameras: Map<string, G3DCamera> = new Map();
    private lights: Map<string, G3DLight> = new Map();
    private meshes: Map<string, G3DMesh> = new Map();

    constructor(renderer: G3DNativeRenderer) {
        this.renderer = renderer;
        this.root = this.createNode('root', 'group');
    }

    // Node creation and management

    createNode(name: string, type: G3DNodeType): G3DSceneNode {
        const id = this.generateId();
        const node: G3DSceneNode = {
            id,
            name,
            type,
            parent: null,
            children: [],
            transform: new G3DTransform(),
            visible: true,
            renderOrder: 0,
            userData: {}
        };

        this.nodes.set(id, node);
        this.stats.nodeCount++;

        return node;
    }

    addNode(parent: G3DSceneNode, child: G3DSceneNode): void {
        if (child.parent) {
            this.removeNode(child);
        }

        child.parent = parent;
        parent.children.push(child);
        this.markDirty(child);
    }

    removeNode(node: G3DSceneNode): void {
        if (node.parent) {
            const index = node.parent.children.indexOf(node);
            if (index !== -1) {
                node.parent.children.splice(index, 1);
            }
            node.parent = null;
        }

        // Recursively remove children
        while (node.children.length > 0) {
            this.removeNode(node.children[0]);
        }

        this.nodes.delete(node.id);
        this.dirtyNodes.delete(node);
        this.stats.nodeCount--;
    }

    getNode(id: string): G3DSceneNode | undefined {
        return this.nodes.get(id);
    }

    findNode(name: string): G3DSceneNode | undefined {
        for (const node of this.nodes.values()) {
            if (node.name === name) {
                return node;
            }
        }
        return undefined;
    }

    findNodesByType(type: G3DNodeType): G3DSceneNode[] {
        const results: G3DSceneNode[] = [];
        for (const node of this.nodes.values()) {
            if (node.type === type) {
                results.push(node);
            }
        }
        return results;
    }

    // Transform updates

    markDirty(node: G3DSceneNode): void {
        this.dirtyNodes.add(node);

        // Mark all children as dirty
        for (const child of node.children) {
            this.markDirty(child);
        }
    }

    updateTransforms(): void {
        const startTime = Date.now();

        // Update dirty transforms
        for (const node of this.dirtyNodes) {
            this.updateNodeTransform(node);
        }

        this.dirtyNodes.clear();
        this.stats.updateTime = Date.now() - startTime;
    }

    private updateNodeTransform(node: G3DSceneNode): void {
        node.transform.updateMatrix();

        if (node.parent && node.parent !== this.root) {
            mat4.multiply(
                node.transform.worldMatrix,
                node.parent.transform.worldMatrix,
                node.transform.matrix
            );
        } else {
            mat4.copy(node.transform.worldMatrix, node.transform.matrix);
        }

        // Update bounding volumes
        if (node.boundingBox) {
            this.updateBoundingBox(node);
        }
        if (node.boundingSphere) {
            this.updateBoundingSphere(node);
        }
    }

    // Bounding volume updates

    private updateBoundingBox(node: G3DSceneNode): void {
        if (!node.boundingBox) return;

        const { min, max } = node.boundingBox;
        const worldMatrix = node.transform.worldMatrix;

        // Transform bounding box corners
        const corners = [
            vec3.fromValues(min[0], min[1], min[2]),
            vec3.fromValues(max[0], min[1], min[2]),
            vec3.fromValues(min[0], max[1], min[2]),
            vec3.fromValues(max[0], max[1], min[2]),
            vec3.fromValues(min[0], min[1], max[2]),
            vec3.fromValues(max[0], min[1], max[2]),
            vec3.fromValues(min[0], max[1], max[2]),
            vec3.fromValues(max[0], max[1], max[2])
        ];

        // Transform corners and find new bounds
        const newMin = vec3.fromValues(Infinity, Infinity, Infinity);
        const newMax = vec3.fromValues(-Infinity, -Infinity, -Infinity);

        for (const corner of corners) {
            vec3.transformMat4(corner, corner, worldMatrix);
            vec3.min(newMin, newMin, corner);
            vec3.max(newMax, newMax, corner);
        }

        vec3.copy(node.boundingBox.min, newMin);
        vec3.copy(node.boundingBox.max, newMax);
        vec3.add(node.boundingBox.center, newMin, newMax);
        vec3.scale(node.boundingBox.center, node.boundingBox.center, 0.5);
        vec3.subtract(node.boundingBox.size, newMax, newMin);
    }

    private updateBoundingSphere(node: G3DSceneNode): void {
        if (!node.boundingSphere) return;

        const worldMatrix = node.transform.worldMatrix;
        vec3.transformMat4(node.boundingSphere.center, node.boundingSphere.center, worldMatrix);

        // Scale radius by maximum scale component
        const scale = vec3.create();
        mat4.getScaling(scale, worldMatrix);
        const maxScale = Math.max(scale[0], scale[1], scale[2]);
        node.boundingSphere.radius *= maxScale;
    }

    // Frustum culling

    updateFrustum(viewProjectionMatrix: mat4): void {
        const m = viewProjectionMatrix;

        // Extract frustum planes from view-projection matrix
        this.frustum.planes = [
            // Left plane
            vec4.fromValues(m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]),
            // Right plane
            vec4.fromValues(m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]),
            // Top plane
            vec4.fromValues(m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]),
            // Bottom plane
            vec4.fromValues(m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]),
            // Near plane
            vec4.fromValues(m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]),
            // Far plane
            vec4.fromValues(m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14])
        ];

        // Normalize planes
        for (const plane of this.frustum.planes) {
            const length = Math.sqrt(plane[0] * plane[0] + plane[1] * plane[1] + plane[2] * plane[2]);
            vec4.scale(plane, plane, 1 / length);
        }
    }

    performFrustumCulling(): G3DSceneNode[] {
        const startTime = Date.now();
        const visibleNodes: G3DSceneNode[] = [];

        this.stats.visibleNodes = 0;
        this.stats.culledNodes = 0;

        this.traverseForCulling(this.root, visibleNodes);

        this.stats.cullTime = Date.now() - startTime;
        return visibleNodes;
    }

    private traverseForCulling(node: G3DSceneNode, visibleNodes: G3DSceneNode[]): boolean {
        if (!node.visible) {
            this.stats.culledNodes++;
            return false;
        }

        // Check frustum culling
        let inFrustum = true;

        if (node.boundingSphere) {
            inFrustum = this.sphereInFrustum(node.boundingSphere);
        } else if (node.boundingBox) {
            inFrustum = this.boxInFrustum(node.boundingBox);
        }

        if (!inFrustum) {
            this.stats.culledNodes++;
            return false;
        }

        // Node is visible
        if (node.type === 'mesh' || node.type === 'annotation') {
            visibleNodes.push(node);
            this.stats.visibleNodes++;
        }

        // Check children
        for (const child of node.children) {
            this.traverseForCulling(child, visibleNodes);
        }

        return true;
    }

    private sphereInFrustum(sphere: G3DBoundingSphere): boolean {
        for (const plane of this.frustum.planes) {
            const distance = vec3.dot(sphere.center, plane as any) + plane[3];
            if (distance < -sphere.radius) {
                return false;
            }
        }
        return true;
    }

    private boxInFrustum(box: G3DBoundingBox): boolean {
        for (const plane of this.frustum.planes) {
            const positive = vec3.create();
            positive[0] = plane[0] > 0 ? box.max[0] : box.min[0];
            positive[1] = plane[1] > 0 ? box.max[1] : box.min[1];
            positive[2] = plane[2] > 0 ? box.max[2] : box.min[2];

            const distance = vec3.dot(positive, plane as any) + plane[3];
            if (distance < 0) {
                return false;
            }
        }
        return true;
    }

    // Update loop

    update(deltaTime: number): void {
        // Update transforms
        this.updateTransforms();

        // Update frustum from camera
        const camera = this.renderer.getCamera();
        this.updateFrustum(camera.getViewProjectionMatrix());

        // Perform frustum culling
        const visibleNodes = this.performFrustumCulling();

        // Update render objects
        this.updateRenderObjects(visibleNodes);

        // Call update callbacks
        for (const [nodeId, callback] of this.updateCallbacks) {
            const node = this.nodes.get(nodeId);
            if (node) {
                callback(node, deltaTime);
            }
        }

        this.lastUpdateTime += deltaTime;
    }

    private updateRenderObjects(visibleNodes: G3DSceneNode[]): void {
        // Sort by render order
        visibleNodes.sort((a, b) => a.renderOrder - b.renderOrder);

        // Update renderer
        for (const node of visibleNodes) {
            if (node.userData.renderObject) {
                const renderObject = node.userData.renderObject as G3DRenderObject;
                renderObject.transform = node.transform.worldMatrix;
                renderObject.visible = true;
                renderObject.renderOrder = node.renderOrder;
            }
        }
    }

    // Animation and update callbacks

    addUpdateCallback(nodeId: string, callback: (node: G3DSceneNode, deltaTime: number) => void): void {
        this.updateCallbacks.set(nodeId, callback);
    }

    removeUpdateCallback(nodeId: string): void {
        this.updateCallbacks.delete(nodeId);
    }

    /**
     * Add animation to a node
     */
    addAnimation(nodeId: string, animation: any): void {
        const node = this.nodes.get(nodeId);
        if (!node) {
            console.warn(`Node with id ${nodeId} not found for animation`);
            return;
        }

        // Store animation in userData
        if (!node.userData.animations) {
            node.userData.animations = [];
        }
        node.userData.animations.push(animation);

        // Add update callback for animation
        this.addUpdateCallback(`${nodeId}_animation_${node.userData.animations.length - 1}`, (node, deltaTime) => {
            // Basic animation update - would be expanded for different animation types
            if (animation.type === 'rotation') {
                const currentRotation = node.transform.rotation;
                const rotationSpeed = animation.speed || 1;
                const axis = animation.axis || { x: 0, y: 1, z: 0 };
                
                // Apply rotation animation
                const angle = deltaTime * rotationSpeed;
                const quaternion = quat.create();
                quat.setAxisAngle(quaternion, [axis.x, axis.y, axis.z], angle);
                quat.multiply(currentRotation, currentRotation, quaternion);
                
                this.markDirty(node);
            } else if (animation.type === 'position') {
                const targetPosition = animation.target || { x: 0, y: 0, z: 0 };
                const speed = animation.speed || 1;
                const currentPosition = node.transform.position;
                
                // Move towards target
                const direction = vec3.create();
                vec3.subtract(direction, [targetPosition.x, targetPosition.y, targetPosition.z], currentPosition);
                vec3.normalize(direction, direction);
                vec3.scale(direction, direction, speed * deltaTime);
                vec3.add(currentPosition, currentPosition, direction);
                
                this.markDirty(node);
            }
        });
    }

    // LOD management

    createLODGroup(name: string, config: G3DLODConfig): G3DSceneNode {
        const group = this.createNode(name, 'group');
        group.userData.lodConfig = config;

        // Add LOD meshes as children
        for (const mesh of config.meshes) {
            this.addNode(group, mesh);
            mesh.visible = false;
        }

        // Add update callback for LOD switching
        this.addUpdateCallback(group.id, (node, deltaTime) => {
            this.updateLOD(node);
        });

        return group;
    }

    private updateLOD(lodGroup: G3DSceneNode): void {
        const config = lodGroup.userData.lodConfig as G3DLODConfig;
        if (!config) return;

        // Calculate distance to camera
        const camera = this.renderer.getCamera();
        const cameraPos = vec3.create();
        mat4.getTranslation(cameraPos, camera.getViewMatrix());

        const nodePos = vec3.create();
        mat4.getTranslation(nodePos, lodGroup.transform.worldMatrix);

        const distance = vec3.distance(cameraPos, nodePos);

        // Select appropriate LOD
        let selectedIndex = 0;
        for (let i = 0; i < config.distances.length; i++) {
            if (distance > config.distances[i]) {
                selectedIndex = i + 1;
            } else {
                break;
            }
        }

        // Update visibility
        for (let i = 0; i < config.meshes.length; i++) {
            config.meshes[i].visible = i === selectedIndex;
        }
    }

    // Utility methods

    private generateId(): string {
        return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getRoot(): G3DSceneNode {
        return this.root;
    }

    getStats(): G3DSceneStats {
        return { ...this.stats };
    }

    clear(): void {
        // Remove all nodes except root
        while (this.root.children.length > 0) {
            this.removeNode(this.root.children[0]);
        }

        this.dirtyNodes.clear();
        this.updateCallbacks.clear();
        this.cameras.clear();
        this.lights.clear();
        this.meshes.clear();
    }

    // Scene serialization

    serialize(): any {
        const data: any = {
            nodes: [],
            hierarchy: this.serializeNode(this.root)
        };

        for (const node of this.nodes.values()) {
            data.nodes.push({
                id: node.id,
                name: node.name,
                type: node.type,
                transform: {
                    position: Array.from(node.transform.position),
                    rotation: Array.from(node.transform.rotation),
                    scale: Array.from(node.transform.scale)
                },
                visible: node.visible,
                renderOrder: node.renderOrder,
                userData: node.userData
            });
        }

        return data;
    }

    private serializeNode(node: G3DSceneNode): any {
        return {
            id: node.id,
            children: node.children.map(child => this.serializeNode(child))
        };
    }

    deserialize(data: any): void {
        this.clear();

        // Create nodes
        const nodeMap = new Map<string, G3DSceneNode>();

        for (const nodeData of data.nodes) {
            const node = this.createNode(nodeData.name, nodeData.type);
            node.id = nodeData.id;
            node.transform.setPosition(nodeData.transform.position[0], nodeData.transform.position[1], nodeData.transform.position[2]);
            node.transform.setRotation(nodeData.transform.rotation[0], nodeData.transform.rotation[1], nodeData.transform.rotation[2], nodeData.transform.rotation[3] || 0);
            node.transform.setScale(nodeData.transform.scale[0], nodeData.transform.scale[1], nodeData.transform.scale[2]);
            node.visible = nodeData.visible;
            node.renderOrder = nodeData.renderOrder;
            node.userData = nodeData.userData;

            nodeMap.set(node.id, node);
        }

        // Rebuild hierarchy
        this.deserializeHierarchy(data.hierarchy, this.root, nodeMap);
    }

    private deserializeHierarchy(data: any, parent: G3DSceneNode, nodeMap: Map<string, G3DSceneNode>): void {
        for (const childData of data.children) {
            const child = nodeMap.get(childData.id);
            if (child) {
                this.addNode(parent, child);
                this.deserializeHierarchy(childData, child, nodeMap);
            }
        }
    }

    // Additional methods for compatibility
    
    async createScene(): Promise<any> {
        // Return a mock scene object with necessary methods
        return {
            add: (object: any) => {
                const node = this.createNode(object.name || 'object', 'mesh');
                node.userData = object;
                this.addNode(this.root, node);
            },
            children: this.root.children,
            setLighting: (lighting: any) => {
                // Mock lighting setup
                this.root.userData.lighting = lighting;
            }
        };
    }
    
    async setCamera(camera: any): Promise<void> {
        // Mock camera setup
        this.root.userData.camera = camera;
    }
    
    async render(options: any): Promise<any> {
        // Mock render method
        const { width, height, targetType } = options;
        
        if (targetType === 'color') {
            return new ImageData(width, height);
        } else {
            return new Float32Array(width * height);
        }
    }
    
    async cleanup(): Promise<void> {
        this.clear();
        this.updateCallbacks.clear();
        // Additional cleanup for compatibility
        this.cameras.clear();
        this.lights.clear();
        this.meshes.clear();
        this.activeCamera = null;
    }

    /**
     * Create a camera
     */
    createCamera(type: 'perspective' | 'orthographic', params: any): G3DCamera {
        const camera: G3DCamera = {
            id: this.generateUniqueId(),
            type,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            fov: params.fov || 75,
            aspect: params.aspect || 1,
            near: params.near || 0.1,
            far: params.far || 1000,
            projectionMatrix: new Float32Array(16),
            viewMatrix: new Float32Array(16),
            set: (x: number, y: number, z: number) => {
                camera.position.x = x;
                camera.position.y = y;
                camera.position.z = z;
            },
            lookAt: (x: number, y: number, z: number) => {
                // Calculate look-at rotation
                const dx = x - camera.position.x;
                const dy = y - camera.position.y;
                const dz = z - camera.position.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                camera.rotation.x = Math.asin(-dy / distance);
                camera.rotation.y = Math.atan2(dx, dz);
                camera.rotation.z = 0;
            }
        };

        this.cameras.set(camera.id, camera);
        return camera;
    }

    /**
     * Set active camera
     */
    setActiveCamera(camera: G3DCamera): void {
        this.activeCamera = camera;
    }

    /**
     * Get active camera
     */
    getActiveCamera(): G3DCamera | null {
        return this.activeCamera;
    }

    /**
     * Create a light
     */
    createLight(type: 'ambient' | 'directional' | 'point' | 'spot', params: any): G3DLight {
        const light: G3DLight = {
            id: this.generateId(),
            type,
            color: params.color || { r: 1, g: 1, b: 1, a: 1 },
            intensity: params.intensity || 1,
            position: params.position || { x: 0, y: 0, z: 0 },
            direction: params.direction || { x: 0, y: -1, z: 0 },
            target: params.target || { x: 0, y: 0, z: 0 },
            castShadow: params.castShadow || false,
            shadowMapSize: params.shadowMapSize || 1024,
            enabled: true
        };

        this.lights.set(light.id, light);
        return light;
    }

    /**
     * Add object to scene
     */
    add(object: G3DSceneNode | G3DCamera | G3DLight | G3DMesh | any): void {
        if (object.type === 'camera') {
            this.cameras.set(object.id, object);
        } else if (object.type === 'light') {
            this.lights.set(object.id, object);
        } else if (object.type === 'mesh') {
            this.meshes.set(object.id, object);
        } else {
            // Add as scene node
            this.root.children.push(object);
            this.nodes.set(object.id, object);
        }
    }

    /**
     * Create a mesh
     */
    createMesh(name: string, geometry: any, material: any): G3DMesh {
        const mesh: G3DMesh = {
            id: this.generateId(),
            name,
            type: 'mesh',
            geometry,
            material,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            visible: true,
            userData: {},
            set: function(x: number, y: number, z: number) {
                this.position.x = x;
                this.position.y = y;
                this.position.z = z;
            },
            add: (child: any) => {
                // Add child to mesh
                if (!mesh.children) mesh.children = [];
                mesh.children.push(child);
            }
        };

        this.meshes.set(mesh.id, mesh);
        return mesh;
    }

    /**
     * Get mesh by name
     */
    getMesh(name: string): G3DMesh | null {
        for (const mesh of this.meshes.values()) {
            if (mesh.name === name) return mesh;
        }
        return null;
    }

    /**
     * Get object by name
     */
    getObject(name: string): G3DMesh | G3DLight | G3DCamera | null {
        // Search in meshes
        for (const mesh of this.meshes.values()) {
            if (mesh.name === name) return mesh;
        }

        // Search in lights
        for (const light of this.lights.values()) {
            if (light.id === name) return light;
        }

        // Search in cameras
        for (const camera of this.cameras.values()) {
            if (camera.id === name) return camera;
        }

        return null;
    }

    /**
     * Get object by name (alias for compatibility)
     */
    getObjectByName(name: string): G3DMesh | G3DLight | G3DCamera | G3DSceneNode | null {
        // First check nodes
        const node = this.findNode(name);
        if (node) return node;
        
        // Then check other objects
        return this.getObject(name);
    }

    /**
     * Remove object from scene
     */
    remove(object: G3DSceneNode | G3DCamera | G3DLight | G3DMesh | any): void {
        if (object.type === 'camera') {
            this.cameras.delete(object.id);
        } else if (object.type === 'light') {
            this.lights.delete(object.id);
        } else if (object.type === 'mesh') {
            this.meshes.delete(object.id);
        } else if (object.id && this.nodes.has(object.id)) {
            // Remove as scene node
            this.removeNode(object);
        } else {
            // Try to find in root children
            const index = this.root.children.indexOf(object);
            if (index !== -1) {
                this.root.children.splice(index, 1);
            }
        }
    }

    /**
     * Raycast from screen coordinates
     */
    raycast(screenX: number, screenY: number): RaycastResult | null {
        if (!this.activeCamera) return null;

        // Convert screen coordinates to normalized device coordinates
        const canvas = this.renderer.getCanvas();
        const rect = (canvas as HTMLCanvasElement).getBoundingClientRect();
        const x = ((screenX - rect.left) / rect.width) * 2 - 1;
        const y = -((screenY - rect.top) / rect.height) * 2 + 1;

        // Create ray from camera through screen point
        const ray = this.createRayFromCamera(x, y);

        // Test intersections with all meshes
        let closestIntersection: RaycastResult | null = null;
        let closestDistance = Infinity;

        for (const mesh of this.meshes.values()) {
            if (!mesh.visible) continue;

            const intersection = this.testRayMeshIntersection(ray, mesh);
            if (intersection && intersection.distance < closestDistance) {
                closestDistance = intersection.distance;
                closestIntersection = intersection;
            }
        }

        return closestIntersection;
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX: number, screenY: number, depth: number = 0): Vector3 {
        if (!this.activeCamera) return { x: 0, y: 0, z: 0 };

        const canvas = this.renderer.getCanvas();
        const rect = (canvas as HTMLCanvasElement).getBoundingClientRect();
        const x = ((screenX - rect.left) / rect.width) * 2 - 1;
        const y = -((screenY - rect.top) / rect.height) * 2 + 1;

        // Unproject screen coordinates to world space
        const worldPoint = this.unprojectPoint(x, y, depth);
        return worldPoint;
    }

    /**
     * Create a group node
     */
    createGroup(name: string): G3DSceneNode {
        const group: G3DSceneNode = {
            id: this.generateId(),
            name,
            type: 'group',
            transform: new G3DTransform(),
            children: [],
            parent: null,
            visible: true,
            userData: {},
            renderOrder: 0,
            add: function(child: any) {
                this.children.push(child);
                child.parent = this;
            }
        };

        this.nodes.set(group.id, group);
        return group;
    }

    // Helper methods

    private generateUniqueId(): string {
        return 'g3d_' + Math.random().toString(36).substr(2, 9);
    }

    private createRayFromCamera(x: number, y: number): Ray {
        // Simplified ray creation - in real implementation would use proper matrix math
        return {
            origin: { x: this.activeCamera!.position.x, y: this.activeCamera!.position.y, z: this.activeCamera!.position.z },
            direction: { x: x, y: y, z: -1 }
        };
    }

    private testRayMeshIntersection(ray: Ray, mesh: G3DMesh): RaycastResult | null {
        // Simplified intersection test - in real implementation would test against geometry
        const distance = Math.sqrt(
            Math.pow(ray.origin.x - mesh.position.x, 2) +
            Math.pow(ray.origin.y - mesh.position.y, 2) +
            Math.pow(ray.origin.z - mesh.position.z, 2)
        );

        if (distance < 2) { // Simple sphere test
            return {
                object: mesh,
                point: mesh.position,
                distance: distance,
                normal: { x: 0, y: 1, z: 0 }
            };
        }

        return null;
    }

    private unprojectPoint(x: number, y: number, depth: number): Vector3 {
        // Simplified unprojection - in real implementation would use proper matrix math
        const camera = this.activeCamera!;
        const worldX = x * (camera.far - camera.near) / 2;
        const worldY = y * (camera.far - camera.near) / 2;
        const worldZ = depth;

        return {
            x: camera.position.x + worldX,
            y: camera.position.y + worldY,
            z: camera.position.z + worldZ
        };
    }
}

// Additional interfaces needed
interface G3DCamera {
    id: string;
    type: 'perspective' | 'orthographic';
    position: Vector3;
    rotation: Vector3;
    fov: number;
    aspect: number;
    near: number;
    far: number;
    projectionMatrix: Float32Array;
    viewMatrix: Float32Array;
    set: (x: number, y: number, z: number) => void;
    lookAt: (x: number, y: number, z: number) => void;
}

interface G3DLight {
    id: string;
    type: 'ambient' | 'directional' | 'point' | 'spot';
    color: { r: number; g: number; b: number; a: number };
    intensity: number;
    position: Vector3;
    direction: Vector3;
    target: Vector3;
    castShadow: boolean;
    shadowMapSize: number;
    enabled: boolean;
}

interface G3DMesh {
    id: string;
    name: string;
    type: 'mesh';
    geometry: any;
    material: any;
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
    visible: boolean;
    userData: any;
    children?: any[];
    set: (x: number, y: number, z: number) => void;
    add: (child: any) => void;
}

interface Vector3 {
    x: number;
    y: number;
    z: number;
}

interface Ray {
    origin: Vector3;
    direction: Vector3;
}

interface RaycastResult {
    object: G3DMesh;
    point: Vector3;
    distance: number;
    normal: Vector3;
}

// Export factory function
export function createG3DSceneManager(renderer: G3DNativeRenderer): G3DSceneManager {
    return new G3DSceneManager(renderer);
}