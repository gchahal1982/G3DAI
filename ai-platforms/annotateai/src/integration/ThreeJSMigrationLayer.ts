/**
 * Three.js Migration Layer - Compatibility bridge for existing Three.js code
 * Provides Three.js-like API that uses G3D under the hood
 */

import { vec3, vec4, mat4, quat } from 'gl-matrix';
import { NativeRenderer, RenderObject } from './G3DNativeRenderer';
import { SceneManager, SceneNode } from './G3DSceneManager';
import { Material, MaterialSystem } from './G3DMaterialSystem';
import { Geometry, GeometryProcessor } from './G3DGeometryProcessor';
import { Light, LightingSystem } from './G3DLightingSystem';

// Three.js-compatible Vector3
export class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x: number, y: number, z: number): this {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    copy(v: Vector3): this {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    add(v: Vector3): this {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    multiplyScalar(s: number): this {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    toArray(): number[] {
        return [this.x, this.y, this.z];
    }

    toVec3(): vec3 {
        return vec3.fromValues(this.x, this.y, this.z);
    }

    static fromVec3(v: vec3): Vector3 {
        return new Vector3(v[0], v[1], v[2]);
    }
}

// Three.js-compatible Quaternion
export class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    setFromEuler(euler: Euler): this {
        const q = quat.create();
        quat.fromEuler(q, euler.x * 180 / Math.PI, euler.y * 180 / Math.PI, euler.z * 180 / Math.PI);
        this.x = q[0];
        this.y = q[1];
        this.z = q[2];
        this.w = q[3];
        return this;
    }

    toQuat(): quat {
        return quat.fromValues(this.x, this.y, this.z, this.w);
    }
}

// Three.js-compatible Euler
export class Euler {
    x: number;
    y: number;
    z: number;
    order: string;

    constructor(x: number = 0, y: number = 0, z: number = 0, order: string = 'XYZ') {
        this.x = x;
        this.y = y;
        this.z = z;
        this.order = order;
    }
}

// Three.js-compatible Matrix4
export class Matrix4 {
    elements: Float32Array;

    constructor() {
        this.elements = new Float32Array(16);
        this.identity();
    }

    identity(): this {
        mat4.identity(this.elements);
        return this;
    }

    compose(position: Vector3, quaternion: Quaternion, scale: Vector3): this {
        mat4.fromRotationTranslationScale(
            this.elements,
            quaternion.toQuat(),
            position.toVec3(),
            scale.toVec3()
        );
        return this;
    }

    toMat4(): mat4 {
        return this.elements;
    }
}

// Three.js-compatible Object3D
export class Object3D {
    position: Vector3;
    rotation: Euler;
    quaternion: Quaternion;
    scale: Vector3;
    matrix: Matrix4;
    matrixWorld: Matrix4;
    visible: boolean;
    children: Object3D[];
    parent: Object3D | null;

    // G3D internals
    public _g3dNode: SceneNode | null = null;

    constructor() {
        this.position = new Vector3();
        this.rotation = new Euler();
        this.quaternion = new Quaternion();
        this.scale = new Vector3(1, 1, 1);
        this.matrix = new Matrix4();
        this.matrixWorld = new Matrix4();
        this.visible = true;
        this.children = [];
        this.parent = null;
    }

    add(child: Object3D): this {
        if (child.parent) {
            child.parent.remove(child);
        }

        child.parent = this;
        this.children.push(child);

        // Update G3D scene graph
        if (this._g3dNode && child._g3dNode) {
            const sceneManager = (window as any).g3dSceneManager as SceneManager;
            if (sceneManager) {
                sceneManager.addNode(this._g3dNode, child._g3dNode);
            }
        }

        return this;
    }

    remove(child: Object3D): this {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;

            // Update G3D scene graph
            if (child._g3dNode) {
                const sceneManager = (window as any).g3dSceneManager as SceneManager;
                if (sceneManager) {
                    sceneManager.removeNode(child._g3dNode);
                }
            }
        }

        return this;
    }

    updateMatrix(): void {
        this.quaternion.setFromEuler(this.rotation);
        this.matrix.compose(this.position, this.quaternion, this.scale);

        // Update G3D transform
        if (this._g3dNode) {
            this._g3dNode.transform.setPosition(this.position.x, this.position.y, this.position.z);
            this._g3dNode.transform.setRotation(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w);
            this._g3dNode.transform.setScale(this.scale.x, this.scale.y, this.scale.z);
        }
    }

    updateMatrixWorld(force: boolean = false): void {
        this.updateMatrix();

        if (this.parent) {
            mat4.multiply(this.matrixWorld.elements, this.parent.matrixWorld.elements, this.matrix.elements);
        } else {
            this.matrixWorld.elements.set(this.matrix.elements);
        }

        for (const child of this.children) {
            child.updateMatrixWorld(force);
        }
    }

    lookAt(x: number | Vector3, y?: number, z?: number): void {
        const target = x instanceof Vector3 ? x.toVec3() : vec3.fromValues(x, y!, z!);
        const position = this.position.toVec3();
        const up = vec3.fromValues(0, 1, 0);

        const matrix = mat4.create();
        mat4.lookAt(matrix, position, target, up);
        mat4.invert(matrix, matrix);

        const rotation = quat.create();
        mat4.getRotation(rotation, matrix);

        this.quaternion.x = rotation[0];
        this.quaternion.y = rotation[1];
        this.quaternion.z = rotation[2];
        this.quaternion.w = rotation[3];
    }
}

// Three.js-compatible Mesh
export class Mesh extends Object3D {
    geometry: BufferGeometry | null;
    material: Material | Material[] | null;

    constructor(geometry?: BufferGeometry, material?: Material | Material[]) {
        super();
        this.geometry = geometry || null;
        this.material = material || null;

        // Create G3D render object
        this.createG3DRenderObject();
    }

    private createG3DRenderObject(): void {
        const sceneManager = (window as any).g3dSceneManager as SceneManager;
        if (!sceneManager) return;

        this._g3dNode = sceneManager.createNode('mesh', 'mesh');

        if (this.geometry && this.material) {
            const renderObject: RenderObject = {
                id: this._g3dNode.id,
                vertexBuffer: null!,  // Will be set by renderer
                uniformBuffer: null!,
                pipeline: null!,
                transform: mat4.create(),
                visible: this.visible,
                renderOrder: 0
            };

            this._g3dNode.userData.renderObject = renderObject;
            this._g3dNode.userData.geometry = this.geometry._g3dGeometry;
            this._g3dNode.userData.material = Array.isArray(this.material)
                ? this.material[0]._g3dMaterial
                : this.material._g3dMaterial;
        }
    }
}

// Three.js-compatible BufferGeometry
export class BufferGeometry {
    attributes: Map<string, BufferAttribute>;
    index: BufferAttribute | null;

    // G3D internals
    _g3dGeometry: Geometry | null = null;

    constructor() {
        this.attributes = new Map();
        this.index = null;
    }

    setAttribute(name: string, attribute: BufferAttribute): this {
        this.attributes.set(name, attribute);

        // Update G3D geometry
        if (this._g3dGeometry) {
            const geometryProcessor = (window as any).g3dGeometryProcessor as GeometryProcessor;
            if (geometryProcessor) {
                geometryProcessor.setAttribute(this._g3dGeometry, name, attribute.array as Float32Array);
            }
        }

        return this;
    }

    setIndex(index: BufferAttribute): this {
        this.index = index;
        return this;
    }

    computeVertexNormals(): void {
        if (this._g3dGeometry) {
            const geometryProcessor = (window as any).g3dGeometryProcessor as GeometryProcessor;
            if (geometryProcessor) {
                geometryProcessor.computeNormals(this._g3dGeometry);
            }
        }
    }
}

// Three.js-compatible BufferAttribute
export class BufferAttribute {
    array: Float32Array | Uint16Array | Uint32Array;
    itemSize: number;
    count: number;

    constructor(array: Float32Array | Uint16Array | Uint32Array, itemSize: number) {
        this.array = array;
        this.itemSize = itemSize;
        this.count = array.length / itemSize;
    }
}

// Three.js-compatible Material base class
export class Material {
    visible: boolean = true;
    transparent: boolean = false;
    opacity: number = 1;
    side: number = 0;  // FrontSide

    // G3D internals
    _g3dMaterial: Material | null = null;
}

// Three.js-compatible MeshBasicMaterial
export class MeshBasicMaterial extends Material {
    color: Color;
    map: Texture | null = null;

    constructor(params?: any) {
        super();
        this.color = new Color(params?.color || 0xffffff);

        // Create G3D material
        const materialSystem = (window as any).g3dMaterialSystem as MaterialSystem;
        if (materialSystem) {
            this._g3dMaterial = materialSystem.createBasicMaterial(
                'basic',
                vec4.fromValues(this.color.r, this.color.g, this.color.b, this.opacity)
            );
        }
    }
}

// Three.js-compatible MeshStandardMaterial
export class MeshStandardMaterial extends Material {
    color: Color;
    metalness: number = 0;
    roughness: number = 0.5;
    map: Texture | null = null;
    normalMap: Texture | null = null;

    constructor(params?: any) {
        super();
        this.color = new Color(params?.color || 0xffffff);
        this.metalness = params?.metalness ?? 0;
        this.roughness = params?.roughness ?? 0.5;

        // Create G3D PBR material
        const materialSystem = (window as any).g3dMaterialSystem as MaterialSystem;
        if (materialSystem) {
            this._g3dMaterial = materialSystem.createPBRMaterial('standard', {
                baseColor: vec4.fromValues(this.color.r, this.color.g, this.color.b, this.opacity),
                metalness: this.metalness,
                roughness: this.roughness
            });
        }
    }
}

// Three.js-compatible Color
export class Color {
    r: number;
    g: number;
    b: number;

    constructor(color?: number | string | Color) {
        this.r = 1;
        this.g = 1;
        this.b = 1;

        if (typeof color === 'number') {
            this.setHex(color);
        } else if (typeof color === 'string') {
            this.setStyle(color);
        } else if (color instanceof Color) {
            this.copy(color);
        }
    }

    setHex(hex: number): this {
        this.r = ((hex >> 16) & 255) / 255;
        this.g = ((hex >> 8) & 255) / 255;
        this.b = (hex & 255) / 255;
        return this;
    }

    setStyle(style: string): this {
        // Simple hex color parser
        if (style.startsWith('#')) {
            const hex = parseInt(style.substring(1), 16);
            this.setHex(hex);
        }
        return this;
    }

    copy(color: Color): this {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        return this;
    }
}

// Three.js-compatible Texture
export class Texture {
    image: HTMLImageElement | HTMLCanvasElement | null = null;
    wrapS: number = 1000;  // ClampToEdgeWrapping
    wrapT: number = 1000;
    magFilter: number = 1006;  // LinearFilter
    minFilter: number = 1008;  // LinearMipmapLinearFilter

    // G3D internals
    _g3dTexture: any = null;
}

// Three.js-compatible Light base class
export class Light extends Object3D {
    color: Color;
    intensity: number;

    // G3D internals
    _g3dLight: Light | null = null;

    constructor(color?: number | string, intensity: number = 1) {
        super();
        this.color = new Color(color);
        this.intensity = intensity;
    }
}

// Three.js-compatible DirectionalLight
export class DirectionalLight extends Light {
    constructor(color?: number | string, intensity: number = 1) {
        super(color, intensity);

        // Create G3D light
        const lightingSystem = (window as any).g3dLightingSystem as LightingSystem;
        if (lightingSystem) {
            this._g3dLight = lightingSystem.createDirectionalLight(
                vec3.fromValues(this.color.r, this.color.g, this.color.b),
                this.intensity,
                vec3.fromValues(0, -1, 0)
            );
        }
    }
}

// Three.js-compatible Scene
export class Scene extends Object3D {
    constructor() {
        super();

        // Initialize as root node in G3D
        const sceneManager = (window as any).g3dSceneManager as SceneManager;
        if (sceneManager) {
            this._g3dNode = sceneManager.getRoot();
        }
    }
}

// Three.js-compatible PerspectiveCamera
export class PerspectiveCamera extends Object3D {
    fov: number;
    aspect: number;
    near: number;
    far: number;

    constructor(fov: number = 50, aspect: number = 1, near: number = 0.1, far: number = 2000) {
        super();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }

    updateProjectionMatrix(): void {
        // Update G3D camera
        const renderer = (window as any).g3dRenderer as NativeRenderer;
        if (renderer) {
            const camera = renderer.getCamera();
            camera.setAspect(this.aspect);
        }
    }
}

// Three.js-compatible WebGLRenderer
export class WebGLRenderer {
    domElement: HTMLCanvasElement;

    // G3D internals
    private _g3dRenderer: NativeRenderer | null = null;
    private _g3dSceneManager: SceneManager | null = null;
    private _g3dMaterialSystem: MaterialSystem | null = null;
    private _g3dGeometryProcessor: GeometryProcessor | null = null;
    private _g3dLightingSystem: LightingSystem | null = null;

    constructor(params?: { canvas?: HTMLCanvasElement; antialias?: boolean }) {
        this.domElement = params?.canvas || document.createElement('canvas');

        // Initialize G3D systems
        this.initializeG3D();
    }

    private initializeG3D(): void {
        // Create G3D renderer
        this._g3dRenderer = new NativeRenderer(this.domElement, { antialias: true, alpha: true });
        this._g3dSceneManager = new SceneManager(this._g3dRenderer);
        this._g3dMaterialSystem = new MaterialSystem();
        this._g3dGeometryProcessor = new GeometryProcessor();
        this._g3dLightingSystem = new LightingSystem();

        // Store globally for other components
        (window as any).g3dRenderer = this._g3dRenderer;
        (window as any).g3dSceneManager = this._g3dSceneManager;
        (window as any).g3dMaterialSystem = this._g3dMaterialSystem;
        (window as any).g3dGeometryProcessor = this._g3dGeometryProcessor;
        (window as any).g3dLightingSystem = this._g3dLightingSystem;
    }

    setSize(width: number, height: number): void {
        this.domElement.width = width;
        this.domElement.height = height;
        this.domElement.style.width = width + 'px';
        this.domElement.style.height = height + 'px';
    }

    render(scene: Scene, camera: PerspectiveCamera): void {
        // Update transforms
        scene.updateMatrixWorld();
        camera.updateMatrixWorld();

        // Update G3D camera
        if (this._g3dRenderer) {
            const g3dCamera = this._g3dRenderer.getCamera();
            g3dCamera.setPosition(camera.position.x, camera.position.y, camera.position.z);

            // Calculate look at target
            const forward = vec3.fromValues(0, 0, -1);
            vec3.transformQuat(forward, forward, camera.quaternion.toQuat());
            vec3.add(forward, forward, camera.position.toVec3());
            g3dCamera.lookAt(forward[0], forward[1], forward[2]);
        }

        // Update G3D scene
        if (this._g3dSceneManager) {
            this._g3dSceneManager.update(16);  // Assume 60fps
        }

        // Update lighting
        if (this._g3dLightingSystem) {
            this._g3dLightingSystem.update(16);
        }

        // Render frame
        // The actual G3D render call would happen here
    }

    dispose(): void {
        if (this._g3dRenderer) {
            this._g3dRenderer.dispose();
        }
    }
}

// Geometry helpers
export class BoxGeometry extends BufferGeometry {
    constructor(width: number = 1, height: number = 1, depth: number = 1) {
        super();

        const geometryProcessor = (window as any).g3dGeometryProcessor as GeometryProcessor;
        if (geometryProcessor) {
            this._g3dGeometry = geometryProcessor.createBox(width, height, depth);

            // Set attributes from G3D geometry
            const positions = geometryProcessor.getAttribute(this._g3dGeometry, 'position');
            if (positions) {
                this.setAttribute('position', new BufferAttribute(positions, 3));
            }
        }
    }
}

export class SphereGeometry extends BufferGeometry {
    constructor(radius: number = 1, widthSegments: number = 32, heightSegments: number = 16) {
        super();

        const geometryProcessor = (window as any).g3dGeometryProcessor as GeometryProcessor;
        if (geometryProcessor) {
            this._g3dGeometry = geometryProcessor.createSphere(radius, widthSegments, heightSegments);

            // Set attributes from G3D geometry
            const positions = geometryProcessor.getAttribute(this._g3dGeometry, 'position');
            if (positions) {
                this.setAttribute('position', new BufferAttribute(positions, 3));
            }
        }
    }
}

export class PlaneGeometry extends BufferGeometry {
    constructor(width: number = 1, height: number = 1, widthSegments: number = 1, heightSegments: number = 1) {
        super();

        const geometryProcessor = (window as any).g3dGeometryProcessor as GeometryProcessor;
        if (geometryProcessor) {
            this._g3dGeometry = geometryProcessor.createPlane(width, height, widthSegments, heightSegments);

            // Set attributes from G3D geometry
            const positions = geometryProcessor.getAttribute(this._g3dGeometry, 'position');
            if (positions) {
                this.setAttribute('position', new BufferAttribute(positions, 3));
            }
        }
    }
}

// Export all Three.js compatible classes
export default {
    Vector3,
    Quaternion,
    Euler,
    Matrix4,
    Object3D,
    Mesh,
    BufferGeometry,
    BufferAttribute,
    Material,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Color,
    Texture,
    Light,
    DirectionalLight,
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    SphereGeometry,
    PlaneGeometry
};