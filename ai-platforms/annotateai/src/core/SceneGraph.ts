import { EventEmitter } from 'events';

// Types and Interfaces
interface Vector3 {
    x: number;
    y: number;
    z: number;
}

interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

interface Matrix4 {
    elements: Float32Array;
}

interface Transform {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
}

interface BoundingBox {
    min: Vector3;
    max: Vector3;
}

interface SceneNodeData {
    id: string;
    name: string;
    type: 'group' | 'mesh' | 'light' | 'camera' | 'helper' | 'custom';
    transform: Transform;
    visible: boolean;
    castShadow: boolean;
    receiveShadow: boolean;
    layer: number;
    userData: any;
    tags: string[];
}

interface RenderData {
    geometry?: any;
    material?: any;
    mesh?: any;
    boundingBox?: BoundingBox;
    renderOrder: number;
    frustumCulled: boolean;
    matrixAutoUpdate: boolean;
}

interface LightData {
    type: 'directional' | 'point' | 'spot' | 'ambient' | 'hemisphere';
    color: { r: number; g: number; b: number };
    intensity: number;
    distance?: number;
    angle?: number;
    penumbra?: number;
    decay?: number;
    target?: Vector3;
}

interface CameraData {
    type: 'perspective' | 'orthographic';
    fov?: number;
    aspect?: number;
    near: number;
    far: number;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    zoom: number;
}

interface TraversalOptions {
    filter?: (node: SceneNode) => boolean;
    recursive?: boolean;
    skipInvisible?: boolean;
    layerMask?: number;
    tags?: string[];
}

interface UpdateOptions {
    updateWorldMatrix?: boolean;
    updateBounds?: boolean;
    force?: boolean;
}

// Matrix4 Math Utilities
class Mat4 {
    static create(): Matrix4 {
        return {
            elements: new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ])
        };
    }

    static identity(matrix: Matrix4): Matrix4 {
        matrix.elements.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return matrix;
    }

    static multiply(a: Matrix4, b: Matrix4): Matrix4 {
        const result = Mat4.create();
        const ae = a.elements;
        const be = b.elements;
        const re = result.elements;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                re[i * 4 + j] = 0;
                for (let k = 0; k < 4; k++) {
                    re[i * 4 + j] += ae[i * 4 + k] * be[k * 4 + j];
                }
            }
        }

        return result;
    }

    static compose(position: Vector3, rotation: Quaternion, scale: Vector3): Matrix4 {
        const matrix = Mat4.create();
        const te = matrix.elements;

        const x = rotation.x, y = rotation.y, z = rotation.z, w = rotation.w;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;

        const sx = scale.x, sy = scale.y, sz = scale.z;

        te[0] = (1 - (yy + zz)) * sx;
        te[1] = (xy + wz) * sx;
        te[2] = (xz - wy) * sx;
        te[3] = 0;

        te[4] = (xy - wz) * sy;
        te[5] = (1 - (xx + zz)) * sy;
        te[6] = (yz + wx) * sy;
        te[7] = 0;

        te[8] = (xz + wy) * sz;
        te[9] = (yz - wx) * sz;
        te[10] = (1 - (xx + yy)) * sz;
        te[11] = 0;

        te[12] = position.x;
        te[13] = position.y;
        te[14] = position.z;
        te[15] = 1;

        return matrix;
    }

    static decompose(matrix: Matrix4): { position: Vector3; rotation: Quaternion; scale: Vector3 } {
        const te = matrix.elements;

        let sx = Math.sqrt(te[0] * te[0] + te[1] * te[1] + te[2] * te[2]);
        const sy = Math.sqrt(te[4] * te[4] + te[5] * te[5] + te[6] * te[6]);
        const sz = Math.sqrt(te[8] * te[8] + te[9] * te[9] + te[10] * te[10]);

        // If determinant is negative, we need to invert one scale
        const det = Mat4.determinant(matrix);
        if (det < 0) sx = -sx;

        const position: Vector3 = {
            x: te[12],
            y: te[13],
            z: te[14]
        };

        // Scale the rotation part
        const m11 = te[0] / sx, m12 = te[4] / sy, m13 = te[8] / sz;
        const m21 = te[1] / sx, m22 = te[5] / sy, m23 = te[9] / sz;
        const m31 = te[2] / sx, m32 = te[6] / sy, m33 = te[10] / sz;

        const rotation = Mat4.extractRotation(m11, m12, m13, m21, m22, m23, m31, m32, m33);

        const scale: Vector3 = { x: sx, y: sy, z: sz };

        return { position, rotation, scale };
    }

    private static determinant(matrix: Matrix4): number {
        const te = matrix.elements;
        const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
        const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
        const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
        const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

        return (
            n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) +
            n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) +
            n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) +
            n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31)
        );
    }

    private static extractRotation(m11: number, m12: number, m13: number, m21: number, m22: number, m23: number, m31: number, m32: number, m33: number): Quaternion {
        const trace = m11 + m22 + m33;

        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);
            return {
                w: 0.25 / s,
                x: (m32 - m23) * s,
                y: (m13 - m31) * s,
                z: (m21 - m12) * s
            };
        } else if (m11 > m22 && m11 > m33) {
            const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
            return {
                w: (m32 - m23) / s,
                x: 0.25 * s,
                y: (m12 + m21) / s,
                z: (m13 + m31) / s
            };
        } else if (m22 > m33) {
            const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
            return {
                w: (m13 - m31) / s,
                x: (m12 + m21) / s,
                y: 0.25 * s,
                z: (m23 + m32) / s
            };
        } else {
            const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
            return {
                w: (m21 - m12) / s,
                x: (m13 + m31) / s,
                y: (m23 + m32) / s,
                z: 0.25 * s
            };
        }
    }

    static transformVector3(matrix: Matrix4, vector: Vector3): Vector3 {
        const e = matrix.elements;
        const x = vector.x, y = vector.y, z = vector.z;
        const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

        return {
            x: (e[0] * x + e[4] * y + e[8] * z + e[12]) * w,
            y: (e[1] * x + e[5] * y + e[9] * z + e[13]) * w,
            z: (e[2] * x + e[6] * y + e[10] * z + e[14]) * w
        };
    }
}

// Vector3 Math Utilities
class Vec3 {
    static create(x: number = 0, y: number = 0, z: number = 0): Vector3 {
        return { x, y, z };
    }

    static add(a: Vector3, b: Vector3): Vector3 {
        return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    }

    static subtract(a: Vector3, b: Vector3): Vector3 {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    }

    static multiply(v: Vector3, scalar: number): Vector3 {
        return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
    }

    static magnitude(v: Vector3): number {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    static normalize(v: Vector3): Vector3 {
        const len = Vec3.magnitude(v);
        return len > 0 ? Vec3.multiply(v, 1 / len) : Vec3.create(0, 0, 0);
    }

    static distance(a: Vector3, b: Vector3): number {
        return Vec3.magnitude(Vec3.subtract(a, b));
    }

    static min(a: Vector3, b: Vector3): Vector3 {
        return {
            x: Math.min(a.x, b.x),
            y: Math.min(a.y, b.y),
            z: Math.min(a.z, b.z)
        };
    }

    static max(a: Vector3, b: Vector3): Vector3 {
        return {
            x: Math.max(a.x, b.x),
            y: Math.max(a.y, b.y),
            z: Math.max(a.z, b.z)
        };
    }
}

// Quaternion Math Utilities
class Quat {
    static create(x: number = 0, y: number = 0, z: number = 0, w: number = 1): Quaternion {
        return { x, y, z, w };
    }

    static multiply(a: Quaternion, b: Quaternion): Quaternion {
        return {
            x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
            y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
            z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
            w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
        };
    }

    static normalize(q: Quaternion): Quaternion {
        const len = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
        return len > 0 ? { x: q.x / len, y: q.y / len, z: q.z / len, w: q.w / len } : Quat.create();
    }

    static fromEuler(x: number, y: number, z: number): Quaternion {
        const c1 = Math.cos(x / 2);
        const c2 = Math.cos(y / 2);
        const c3 = Math.cos(z / 2);
        const s1 = Math.sin(x / 2);
        const s2 = Math.sin(y / 2);
        const s3 = Math.sin(z / 2);

        return {
            x: s1 * c2 * c3 + c1 * s2 * s3,
            y: c1 * s2 * c3 - s1 * c2 * s3,
            z: c1 * c2 * s3 + s1 * s2 * c3,
            w: c1 * c2 * c3 - s1 * s2 * s3
        };
    }
}

// Scene Node Class
export class SceneNode extends EventEmitter {
    public readonly id: string;
    public name: string;
    public type: SceneNodeData['type'];
    public transform: Transform;
    public visible: boolean = true;
    public castShadow: boolean = true;
    public receiveShadow: boolean = true;
    public layer: number = 0;
    public userData: any = {};
    public tags: string[] = [];

    public parent: SceneNode | null = null;
    public children: SceneNode[] = [];

    public localMatrix: Matrix4;
    public worldMatrix: Matrix4;
    public matrixNeedsUpdate: boolean = true;
    public worldMatrixNeedsUpdate: boolean = true;

    public boundingBox: BoundingBox | null = null;
    public worldBoundingBox: BoundingBox | null = null;

    public renderData: RenderData | null = null;
    public lightData: LightData | null = null;
    public cameraData: CameraData | null = null;

    constructor(id?: string, type: SceneNodeData['type'] = 'group') {
        super();

        this.id = id || this.generateId();
        this.name = this.id;
        this.type = type;

        this.transform = {
            position: Vec3.create(),
            rotation: Quat.create(),
            scale: Vec3.create(1, 1, 1)
        };

        this.localMatrix = Mat4.create();
        this.worldMatrix = Mat4.create();

        this.renderData = {
            renderOrder: 0,
            frustumCulled: true,
            matrixAutoUpdate: true
        };
    }

    // Transform Methods
    public setPosition(x: number, y: number, z: number): void {
        this.transform.position.x = x;
        this.transform.position.y = y;
        this.transform.position.z = z;
        this.markMatrixDirty();
    }

    public getPosition(): Vector3 {
        return { ...this.transform.position };
    }

    public setRotation(x: number, y: number, z: number): void {
        this.transform.rotation = Quat.fromEuler(x, y, z);
        this.markMatrixDirty();
    }

    public setQuaternion(quaternion: Quaternion): void {
        this.transform.rotation = { ...quaternion };
        this.markMatrixDirty();
    }

    public getRotation(): Quaternion {
        return { ...this.transform.rotation };
    }

    public setScale(x: number, y: number, z: number): void {
        this.transform.scale.x = x;
        this.transform.scale.y = y;
        this.transform.scale.z = z;
        this.markMatrixDirty();
    }

    public getScale(): Vector3 {
        return { ...this.transform.scale };
    }

    public lookAt(target: Vector3, up: Vector3 = Vec3.create(0, 1, 0)): void {
        const position = this.getWorldPosition();
        const direction = Vec3.normalize(Vec3.subtract(target, position));

        // Calculate rotation from direction and up vectors
        // This is a simplified implementation
        const quaternion = this.calculateLookAtQuaternion(direction, up);
        this.setQuaternion(quaternion);
    }

    private calculateLookAtQuaternion(direction: Vector3, up: Vector3): Quaternion {
        // Simplified look-at quaternion calculation
        // In a real implementation, this would be more robust
        return Quat.create(); // Placeholder
    }

    // Hierarchy Methods
    public add(child: SceneNode): void {
        if (child.parent) {
            child.parent.remove(child);
        }

        child.parent = this;
        this.children.push(child);
        child.markWorldMatrixDirty();

        this.emit('childAdded', child);
        child.emit('parentChanged', this);
    }

    public remove(child: SceneNode): boolean {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
            child.markWorldMatrixDirty();

            this.emit('childRemoved', child);
            child.emit('parentChanged', null);
            return true;
        }
        return false;
    }

    public removeFromParent(): void {
        if (this.parent) {
            this.parent.remove(this);
        }
    }

    public getChildren(): SceneNode[] {
        return [...this.children];
    }

    public getChild(id: string): SceneNode | null {
        return this.children.find(child => child.id === id) || null;
    }

    public getChildByName(name: string): SceneNode | null {
        return this.children.find(child => child.name === name) || null;
    }

    public getRoot(): SceneNode {
        let root: SceneNode = this;
        while (root.parent) {
            root = root.parent;
        }
        return root;
    }

    public getDepth(): number {
        let depth = 0;
        let current: SceneNode | null = this;
        while (current.parent) {
            depth++;
            current = current.parent;
        }
        return depth;
    }

    // Matrix Methods
    public updateMatrix(): void {
        if (this.matrixNeedsUpdate) {
            this.localMatrix = Mat4.compose(
                this.transform.position,
                this.transform.rotation,
                this.transform.scale
            );
            this.matrixNeedsUpdate = false;
            this.markWorldMatrixDirty();
        }
    }

    public updateWorldMatrix(force: boolean = false): void {
        this.updateMatrix();

        if (this.worldMatrixNeedsUpdate || force) {
            if (this.parent) {
                this.parent.updateWorldMatrix();
                this.worldMatrix = Mat4.multiply(this.parent.worldMatrix, this.localMatrix);
            } else {
                this.worldMatrix = { ...this.localMatrix };
            }
            this.worldMatrixNeedsUpdate = false;
        }
    }

    public getWorldPosition(): Vector3 {
        this.updateWorldMatrix();
        return {
            x: this.worldMatrix.elements[12],
            y: this.worldMatrix.elements[13],
            z: this.worldMatrix.elements[14]
        };
    }

    public getWorldScale(): Vector3 {
        this.updateWorldMatrix();
        const decomposed = Mat4.decompose(this.worldMatrix);
        return decomposed.scale;
    }

    public getWorldRotation(): Quaternion {
        this.updateWorldMatrix();
        const decomposed = Mat4.decompose(this.worldMatrix);
        return decomposed.rotation;
    }

    private markMatrixDirty(): void {
        this.matrixNeedsUpdate = true;
        this.markWorldMatrixDirty();
    }

    private markWorldMatrixDirty(): void {
        this.worldMatrixNeedsUpdate = true;

        // Mark all children as needing world matrix updates
        for (const child of this.children) {
            child.markWorldMatrixDirty();
        }
    }

    // Bounding Box Methods
    public setBoundingBox(min: Vector3, max: Vector3): void {
        this.boundingBox = { min: { ...min }, max: { ...max } };
        this.updateWorldBoundingBox();
    }

    public getBoundingBox(): BoundingBox | null {
        return this.boundingBox ? {
            min: { ...this.boundingBox.min },
            max: { ...this.boundingBox.max }
        } : null;
    }

    public getWorldBoundingBox(): BoundingBox | null {
        this.updateWorldBoundingBox();
        return this.worldBoundingBox ? {
            min: { ...this.worldBoundingBox.min },
            max: { ...this.worldBoundingBox.max }
        } : null;
    }

    private updateWorldBoundingBox(): void {
        if (!this.boundingBox) {
            this.worldBoundingBox = null;
            return;
        }

        this.updateWorldMatrix();

        // Transform bounding box corners
        const corners = [
            { x: this.boundingBox.min.x, y: this.boundingBox.min.y, z: this.boundingBox.min.z },
            { x: this.boundingBox.max.x, y: this.boundingBox.min.y, z: this.boundingBox.min.z },
            { x: this.boundingBox.min.x, y: this.boundingBox.max.y, z: this.boundingBox.min.z },
            { x: this.boundingBox.max.x, y: this.boundingBox.max.y, z: this.boundingBox.min.z },
            { x: this.boundingBox.min.x, y: this.boundingBox.min.y, z: this.boundingBox.max.z },
            { x: this.boundingBox.max.x, y: this.boundingBox.min.y, z: this.boundingBox.max.z },
            { x: this.boundingBox.min.x, y: this.boundingBox.max.y, z: this.boundingBox.max.z },
            { x: this.boundingBox.max.x, y: this.boundingBox.max.y, z: this.boundingBox.max.z }
        ];

        const transformedCorners = corners.map(corner =>
            Mat4.transformVector3(this.worldMatrix, corner)
        );

        let min = { ...transformedCorners[0] };
        let max = { ...transformedCorners[0] };

        for (const corner of transformedCorners) {
            min = Vec3.min(min, corner);
            max = Vec3.max(max, corner);
        }

        this.worldBoundingBox = { min, max };
    }

    // Traversal Methods
    public traverse(callback: (node: SceneNode) => void, options?: TraversalOptions): void {
        if (options?.filter && !options.filter(this)) return;
        if (options?.skipInvisible && !this.visible) return;
        if (options?.layerMask && !(this.layer & options.layerMask)) return;
        if (options?.tags && !options.tags.some(tag => this.tags.includes(tag))) return;

        callback(this);

        if (options?.recursive !== false) {
            for (const child of this.children) {
                child.traverse(callback, options);
            }
        }
    }

    public find(predicate: (node: SceneNode) => boolean): SceneNode | null {
        if (predicate(this)) return this;

        for (const child of this.children) {
            const found = child.find(predicate);
            if (found) return found;
        }

        return null;
    }

    public findAll(predicate: (node: SceneNode) => boolean): SceneNode[] {
        const results: SceneNode[] = [];

        this.traverse(node => {
            if (predicate(node)) {
                results.push(node);
            }
        });

        return results;
    }

    public findById(id: string): SceneNode | null {
        return this.find(node => node.id === id);
    }

    public findByName(name: string): SceneNode | null {
        return this.find(node => node.name === name);
    }

    public findByType(type: SceneNodeData['type']): SceneNode[] {
        return this.findAll(node => node.type === type);
    }

    public findByTag(tag: string): SceneNode[] {
        return this.findAll(node => node.tags.includes(tag));
    }

    // Utility Methods
    public clone(recursive: boolean = true): SceneNode {
        const cloned = new SceneNode(undefined, this.type);

        cloned.name = this.name + '_clone';
        cloned.transform = {
            position: { ...this.transform.position },
            rotation: { ...this.transform.rotation },
            scale: { ...this.transform.scale }
        };
        cloned.visible = this.visible;
        cloned.castShadow = this.castShadow;
        cloned.receiveShadow = this.receiveShadow;
        cloned.layer = this.layer;
        cloned.userData = JSON.parse(JSON.stringify(this.userData));
        cloned.tags = [...this.tags];

        if (this.boundingBox) {
            cloned.setBoundingBox(this.boundingBox.min, this.boundingBox.max);
        }

        if (this.renderData) {
            cloned.renderData = { ...this.renderData };
        }

        if (this.lightData) {
            cloned.lightData = { ...this.lightData };
        }

        if (this.cameraData) {
            cloned.cameraData = { ...this.cameraData };
        }

        if (recursive) {
            for (const child of this.children) {
                cloned.add(child.clone(true));
            }
        }

        return cloned;
    }

    public toJSON(): any {
        const json: any = {
            id: this.id,
            name: this.name,
            type: this.type,
            transform: {
                position: this.transform.position,
                rotation: this.transform.rotation,
                scale: this.transform.scale
            },
            visible: this.visible,
            castShadow: this.castShadow,
            receiveShadow: this.receiveShadow,
            layer: this.layer,
            userData: this.userData,
            tags: this.tags
        };

        if (this.boundingBox) {
            json.boundingBox = this.boundingBox;
        }

        if (this.renderData) {
            json.renderData = this.renderData;
        }

        if (this.lightData) {
            json.lightData = this.lightData;
        }

        if (this.cameraData) {
            json.cameraData = this.cameraData;
        }

        if (this.children.length > 0) {
            json.children = this.children.map(child => child.toJSON());
        }

        return json;
    }

    public static fromJSON(json: any): SceneNode {
        const node = new SceneNode(json.id, json.type);

        node.name = json.name || node.id;
        node.transform = {
            position: json.transform?.position || Vec3.create(),
            rotation: json.transform?.rotation || Quat.create(),
            scale: json.transform?.scale || Vec3.create(1, 1, 1)
        };
        node.visible = json.visible !== undefined ? json.visible : true;
        node.castShadow = json.castShadow !== undefined ? json.castShadow : true;
        node.receiveShadow = json.receiveShadow !== undefined ? json.receiveShadow : true;
        node.layer = json.layer || 0;
        node.userData = json.userData || {};
        node.tags = json.tags || [];

        if (json.boundingBox) {
            node.setBoundingBox(json.boundingBox.min, json.boundingBox.max);
        }

        if (json.renderData) {
            node.renderData = { ...node.renderData, ...json.renderData };
        }

        if (json.lightData) {
            node.lightData = json.lightData;
        }

        if (json.cameraData) {
            node.cameraData = json.cameraData;
        }

        if (json.children) {
            for (const childJson of json.children) {
                node.add(SceneNode.fromJSON(childJson));
            }
        }

        return node;
    }

    private generateId(): string {
        return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    public dispose(): void {
        // Remove from parent
        this.removeFromParent();

        // Remove all children
        while (this.children.length > 0) {
            this.children[0].dispose();
        }

        // Clear data
        this.renderData = null;
        this.lightData = null;
        this.cameraData = null;
        this.boundingBox = null;
        this.worldBoundingBox = null;

        // Remove all listeners
        this.removeAllListeners();
    }
}

// Main Scene Graph Class
export class SceneGraph extends EventEmitter {
    private root: SceneNode;
    private nodeMap: Map<string, SceneNode> = new Map();
    private renderQueue: SceneNode[] = [];
    private lightNodes: SceneNode[] = [];
    private cameraNodes: SceneNode[] = [];

    private autoUpdate: boolean = true;
    private needsUpdate: boolean = true;
    private frameId: number = 0;

    constructor() {
        super();

        this.root = new SceneNode('root', 'group');
        this.root.name = 'Scene Root';
        this.nodeMap.set(this.root.id, this.root);

        this.initializeSceneGraph();
    }

    private initializeSceneGraph(): void {
        console.log('Initializing G3D Scene Graph');
        this.emit('initialized');
    }

    // Node Management
    public addNode(node: SceneNode, parent?: SceneNode): void {
        const parentNode = parent || this.root;
        parentNode.add(node);

        this.registerNode(node);
        this.markNeedsUpdate();

        this.emit('nodeAdded', { node, parent: parentNode });
    }

    public removeNode(node: SceneNode): boolean {
        const success = this.unregisterNode(node);
        if (success) {
            node.dispose();
            this.markNeedsUpdate();
            this.emit('nodeRemoved', { node });
        }
        return success;
    }

    public removeNodeById(id: string): boolean {
        const node = this.getNode(id);
        return node ? this.removeNode(node) : false;
    }

    public getNode(id: string): SceneNode | null {
        return this.nodeMap.get(id) || null;
    }

    public getNodeByName(name: string): SceneNode | null {
        return this.root.findByName(name);
    }

    public getNodesByType(type: SceneNodeData['type']): SceneNode[] {
        return this.root.findByType(type);
    }

    public getNodesByTag(tag: string): SceneNode[] {
        return this.root.findByTag(tag);
    }

    public getRoot(): SceneNode {
        return this.root;
    }

    private registerNode(node: SceneNode): void {
        this.nodeMap.set(node.id, node);

        // Register node in specialized lists
        if (node.type === 'light' && node.lightData) {
            this.lightNodes.push(node);
        }

        if (node.type === 'camera' && node.cameraData) {
            this.cameraNodes.push(node);
        }

        // Register children recursively
        for (const child of node.children) {
            this.registerNode(child);
        }
    }

    private unregisterNode(node: SceneNode): boolean {
        const removed = this.nodeMap.delete(node.id);

        if (removed) {
            // Remove from specialized lists
            const lightIndex = this.lightNodes.indexOf(node);
            if (lightIndex !== -1) {
                this.lightNodes.splice(lightIndex, 1);
            }

            const cameraIndex = this.cameraNodes.indexOf(node);
            if (cameraIndex !== -1) {
                this.cameraNodes.splice(cameraIndex, 1);
            }

            // Unregister children recursively
            for (const child of node.children) {
                this.unregisterNode(child);
            }
        }

        return removed;
    }

    // Update Methods
    public update(options?: UpdateOptions): void {
        if (!this.needsUpdate && !options?.force) return;

        this.frameId++;

        if (options?.updateWorldMatrix !== false) {
            this.updateWorldMatrices();
        }

        if (options?.updateBounds !== false) {
            this.updateBoundingBoxes();
        }

        this.updateRenderQueue();
        this.needsUpdate = false;

        this.emit('updated', { frameId: this.frameId });
    }

    private updateWorldMatrices(): void {
        this.root.traverse(node => {
            node.updateWorldMatrix();
        });
    }

    private updateBoundingBoxes(): void {
        this.root.traverse(node => {
            if (node.boundingBox) {
                node.getWorldBoundingBox(); // This triggers update
            }
        });
    }

    private updateRenderQueue(): void {
        this.renderQueue = [];

        this.root.traverse(node => {
            if (node.visible && node.renderData && node.type === 'mesh') {
                this.renderQueue.push(node);
            }
        });

        // Sort by render order
        this.renderQueue.sort((a, b) => {
            const orderA = a.renderData?.renderOrder || 0;
            const orderB = b.renderData?.renderOrder || 0;
            return orderA - orderB;
        });
    }

    public markNeedsUpdate(): void {
        this.needsUpdate = true;
    }

    // Rendering Support
    public getRenderQueue(): SceneNode[] {
        return [...this.renderQueue];
    }

    public getLights(): SceneNode[] {
        return this.lightNodes.filter(node => node.visible);
    }

    public getCameras(): SceneNode[] {
        return this.cameraNodes.filter(node => node.visible);
    }

    public getVisibleNodes(camera?: SceneNode): SceneNode[] {
        const visibleNodes: SceneNode[] = [];

        this.root.traverse(node => {
            if (node.visible) {
                // TODO: Add frustum culling with camera
                visibleNodes.push(node);
            }
        });

        return visibleNodes;
    }

    // Spatial Queries
    public getNodesInBounds(bounds: BoundingBox): SceneNode[] {
        const nodes: SceneNode[] = [];

        this.root.traverse(node => {
            const worldBounds = node.getWorldBoundingBox();
            if (worldBounds && this.boundsIntersect(bounds, worldBounds)) {
                nodes.push(node);
            }
        });

        return nodes;
    }

    public getNodesAtPoint(point: Vector3, radius: number = 0): SceneNode[] {
        const nodes: SceneNode[] = [];

        this.root.traverse(node => {
            const worldPos = node.getWorldPosition();
            const distance = Vec3.distance(point, worldPos);

            if (distance <= radius) {
                nodes.push(node);
            }
        });

        return nodes;
    }

    private boundsIntersect(a: BoundingBox, b: BoundingBox): boolean {
        return (
            a.min.x <= b.max.x && a.max.x >= b.min.x &&
            a.min.y <= b.max.y && a.max.y >= b.min.y &&
            a.min.z <= b.max.z && a.max.z >= b.min.z
        );
    }

    // Layer Management
    public setNodeLayer(nodeId: string, layer: number): boolean {
        const node = this.getNode(nodeId);
        if (node) {
            node.layer = layer;
            this.markNeedsUpdate();
            return true;
        }
        return false;
    }

    public getNodesByLayer(layer: number): SceneNode[] {
        return this.root.findAll(node => node.layer === layer);
    }

    public toggleLayerVisibility(layer: number, visible: boolean): void {
        this.root.traverse(node => {
            if (node.layer === layer) {
                node.visible = visible;
            }
        });
        this.markNeedsUpdate();
    }

    // Batch Operations
    public batchUpdate(operations: Array<{ nodeId: string; property: string; value: any }>): void {
        for (const op of operations) {
            const node = this.getNode(op.nodeId);
            if (node && node.hasOwnProperty(op.property)) {
                (node as any)[op.property] = op.value;
            }
        }
        this.markNeedsUpdate();
    }

    public batchTransform(nodeIds: string[], transform: Partial<Transform>): void {
        for (const id of nodeIds) {
            const node = this.getNode(id);
            if (node) {
                if (transform.position) {
                    node.setPosition(transform.position.x, transform.position.y, transform.position.z);
                }
                if (transform.rotation) {
                    node.setQuaternion(transform.rotation);
                }
                if (transform.scale) {
                    node.setScale(transform.scale.x, transform.scale.y, transform.scale.z);
                }
            }
        }
        this.markNeedsUpdate();
    }

    // Serialization
    public toJSON(): any {
        return {
            version: '1.0',
            frameId: this.frameId,
            root: this.root.toJSON(),
            metadata: {
                nodeCount: this.nodeMap.size,
                lightCount: this.lightNodes.length,
                cameraCount: this.cameraNodes.length
            }
        };
    }

    public fromJSON(json: any): void {
        this.clear();

        if (json.root) {
            this.root = SceneNode.fromJSON(json.root);
            this.nodeMap.clear();
            this.lightNodes = [];
            this.cameraNodes = [];

            // Rebuild node map and specialized lists
            this.root.traverse(node => {
                this.nodeMap.set(node.id, node);

                if (node.type === 'light' && node.lightData) {
                    this.lightNodes.push(node);
                }

                if (node.type === 'camera' && node.cameraData) {
                    this.cameraNodes.push(node);
                }
            });
        }

        this.frameId = json.frameId || 0;
        this.markNeedsUpdate();

        this.emit('loaded', json);
    }

    // Utility Methods
    public clear(): void {
        this.root.traverse(node => {
            if (node !== this.root) {
                node.dispose();
            }
        });

        this.root.children = [];
        this.nodeMap.clear();
        this.nodeMap.set(this.root.id, this.root);
        this.lightNodes = [];
        this.cameraNodes = [];
        this.renderQueue = [];

        this.markNeedsUpdate();
        this.emit('cleared');
    }

    public getStats(): {
        nodeCount: number;
        lightCount: number;
        cameraCount: number;
        renderableCount: number;
        frameId: number;
        needsUpdate: boolean;
    } {
        return {
            nodeCount: this.nodeMap.size,
            lightCount: this.lightNodes.length,
            cameraCount: this.cameraNodes.length,
            renderableCount: this.renderQueue.length,
            frameId: this.frameId,
            needsUpdate: this.needsUpdate
        };
    }

    public setAutoUpdate(enabled: boolean): void {
        this.autoUpdate = enabled;
    }

    public isAutoUpdate(): boolean {
        return this.autoUpdate;
    }

    public dispose(): void {
        this.clear();
        this.removeAllListeners();
        console.log('G3D Scene Graph disposed');
    }
}