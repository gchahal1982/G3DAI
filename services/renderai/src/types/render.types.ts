export interface GenerationConfig {
  style: '3d-realistic' | '3d-cartoon' | '3d-abstract' | '3d-photorealistic';
  complexity: 'low' | 'medium' | 'high' | 'ultra';
  polycount?: number;
  platform?: '3d-web' | '3d-game' | '3d-vr' | '3d-print';
  qualityLevel?: 'draft' | 'standard' | 'high' | 'production';
  textureResolution?: number;
  lighting?: LightingConfig;
  camera?: CameraConfig;
  renderQuality?: number;
  exportFormats?: ExportFormat[];
}

export interface LightingConfig {
  type: 'studio' | 'outdoor' | 'dramatic' | 'flat';
  intensity: number;
  color: string;
  shadows: boolean;
}

export interface CameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export type ExportFormat = 'gltf' | 'glb' | 'obj' | 'fbx' | 'usdz' | 'stl';

export interface Generated3DAsset {
  mesh: Mesh3D;
  textures: TextureSet;
  renders: RenderedImage[];
  formats: ExportedFormat[];
  metadata: AssetMetadata;
}

export interface Mesh3D {
  vertices: Float32Array;
  faces: Uint32Array;
  normals: Float32Array;
  uvs: Float32Array;
  polycount: number;
  bounds: BoundingBox;
}

export interface BoundingBox {
  min: [number, number, number];
  max: [number, number, number];
  center: [number, number, number];
  size: [number, number, number];
}

export interface TextureSet {
  diffuse?: Texture;
  normal?: Texture;
  roughness?: Texture;
  metallic?: Texture;
  ambient?: Texture;
  emission?: Texture;
}

export interface Texture {
  data: ArrayBuffer;
  width: number;
  height: number;
  format: 'png' | 'jpg' | 'exr';
}

export interface RenderedImage {
  data: ArrayBuffer;
  width: number;
  height: number;
  format: 'png' | 'jpg';
  viewAngle: string;
}

export interface ExportedFormat {
  format: ExportFormat;
  data: ArrayBuffer;
  size: number;
}

export interface AssetMetadata {
  generationTime: number;
  prompt: string;
  style: string;
  polycount: number;
  textureCount: number;
  fileSize: number;
}
