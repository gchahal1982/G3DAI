/**
 * G3D Mesh3D - 3D Model Generation TypeScript Definitions
 */

export interface Mesh3DProject {
    id: string;
    name: string;
    description: string;
    models: Generated3DModel[];
    status: 'active' | 'completed' | 'archived';
    createdAt: Date;
}

export interface Generated3DModel {
    id: string;
    name: string;
    type: 'mesh' | 'pointcloud' | 'voxel' | 'nurbs';
    format: 'obj' | 'fbx' | 'gltf' | 'stl' | 'ply';
    fileUrl: string;
    thumbnailUrl: string;
    fileSize: number;
    vertexCount: number;
    faceCount: number;
    materials: Material[];
    animations: Animation[];
    metadata: ModelMetadata;
    createdAt: Date;
}

export interface Material {
    id: string;
    name: string;
    type: 'pbr' | 'lambert' | 'phong' | 'unlit';
    properties: MaterialProperties;
    textures: Texture[];
}

export interface MaterialProperties {
    baseColor: Color;
    metallic?: number;
    roughness?: number;
    opacity?: number;
    emissive?: Color;
    normal?: number;
}

export interface Color {
    r: number;
    g: number;
    b: number;
    a?: number;
}

export interface Texture {
    id: string;
    type: 'diffuse' | 'normal' | 'roughness' | 'metallic' | 'emissive' | 'occlusion';
    url: string;
    resolution: Resolution;
    format: 'jpg' | 'png' | 'exr' | 'hdr';
}

export interface Resolution {
    width: number;
    height: number;
}

export interface Animation {
    id: string;
    name: string;
    duration: number;
    frameRate: number;
    type: 'skeletal' | 'morph' | 'transform';
    channels: AnimationChannel[];
}

export interface AnimationChannel {
    target: string;
    property: 'position' | 'rotation' | 'scale' | 'morph';
    keyframes: Keyframe[];
}

export interface Keyframe {
    time: number;
    value: number | Vector3 | Quaternion;
    interpolation: 'linear' | 'step' | 'cubic';
}

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

export interface ModelMetadata {
    creator: string;
    software: string;
    version: string;
    units: 'meters' | 'centimeters' | 'millimeters' | 'inches' | 'feet';
    scale: number;
    boundingBox: BoundingBox3D;
    tags: string[];
}

export interface BoundingBox3D {
    min: Vector3;
    max: Vector3;
    center: Vector3;
    size: Vector3;
}