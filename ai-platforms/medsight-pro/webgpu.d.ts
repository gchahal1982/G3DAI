// WebGPU Type Declarations for G3D Medical Renderer

interface GPUObjectBase {
  label?: string;
}

interface GPUAdapter {
  readonly features: GPUSupportedFeatures;
  readonly limits: GPUSupportedLimits;
  readonly isFallbackAdapter: boolean;
  requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>;
  requestAdapterInfo(): Promise<GPUAdapterInfo>;
}

interface GPUDevice extends GPUObjectBase {
  readonly features: GPUSupportedFeatures;
  readonly limits: GPUSupportedLimits;
  readonly queue: GPUQueue;
  readonly lost: Promise<GPUDeviceLostInfo>;
  
  destroy(): void;
  createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
  createTexture(descriptor: GPUTextureDescriptor): GPUTexture;
  createSampler(descriptor?: GPUSamplerDescriptor): GPUSampler;
  createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
  createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline;
  createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline;
  createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;
  createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout;
  createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout;
  createCommandEncoder(descriptor?: GPUCommandEncoderDescriptor): GPUCommandEncoder;
  createQuerySet(descriptor: GPUQuerySetDescriptor): GPUQuerySet;
  pushErrorScope(filter: GPUErrorFilter): void;
  popErrorScope(): Promise<GPUError | null>;
}

interface GPUTexture extends GPUObjectBase {
  readonly width: number;
  readonly height: number;
  readonly depthOrArrayLayers: number;
  readonly mipLevelCount: number;
  readonly sampleCount: number;
  readonly dimension: GPUTextureDimension;
  readonly format: GPUTextureFormat;
  readonly usage: GPUTextureUsage;
  
  createView(descriptor?: GPUTextureViewDescriptor): GPUTextureView;
  destroy(): void;
}

interface GPUTextureView extends GPUObjectBase {
}

interface GPUShaderModule extends GPUObjectBase {
  getCompilationInfo(): Promise<GPUCompilationInfo>;
}

interface GPURenderPipeline extends GPUObjectBase {
  readonly layout: GPUPipelineLayout | "auto";
  getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUComputePipeline extends GPUObjectBase {
  readonly layout: GPUPipelineLayout | "auto";
  getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUQueue extends GPUObjectBase {
  submit(commandBuffers: GPUCommandBuffer[]): void;
  writeBuffer(buffer: GPUBuffer, bufferOffset: number, data: BufferSource, dataOffset?: number, size?: number): void;
  writeTexture(destination: GPUImageCopyTexture, data: BufferSource, dataLayout: GPUImageDataLayout, size: GPUExtent3D): void;
  copyExternalImageToTexture(source: GPUImageCopyExternalImage, destination: GPUImageCopyTexture, copySize: GPUExtent3D): void;
  onSubmittedWorkDone(): Promise<void>;
}

interface GPUBuffer extends GPUObjectBase {
  readonly size: number;
  readonly usage: GPUBufferUsage;
  readonly mapState: GPUBufferMapState;
  
  mapAsync(mode: GPUMapMode, offset?: number, size?: number): Promise<void>;
  getMappedRange(offset?: number, size?: number): ArrayBuffer;
  unmap(): void;
  destroy(): void;
}

// Enums and constants
type GPUTextureFormat = 
  | "r8unorm" | "r8snorm" | "r8uint" | "r8sint"
  | "r16uint" | "r16sint" | "r16float"
  | "r32uint" | "r32sint" | "r32float"
  | "rgba8unorm" | "rgba8unorm-srgb" | "rgba8snorm" | "rgba8uint" | "rgba8sint"
  | "rgba16uint" | "rgba16sint" | "rgba16float"
  | "rgba32uint" | "rgba32sint" | "rgba32float";

type GPUTextureDimension = "1d" | "2d" | "3d";

declare const GPUTextureUsage: {
  readonly COPY_SRC: 0x01;
  readonly COPY_DST: 0x02;
  readonly TEXTURE_BINDING: 0x04;
  readonly STORAGE_BINDING: 0x08;
  readonly RENDER_ATTACHMENT: 0x10;
};

declare const GPUBufferUsage: {
  readonly MAP_READ: 0x0001;
  readonly MAP_WRITE: 0x0002;
  readonly COPY_SRC: 0x0004;
  readonly COPY_DST: 0x0008;
  readonly INDEX: 0x0010;
  readonly VERTEX: 0x0020;
  readonly UNIFORM: 0x0040;
  readonly STORAGE: 0x0080;
  readonly INDIRECT: 0x0100;
  readonly QUERY_RESOLVE: 0x0200;
};

// Descriptor interfaces
interface GPUDeviceDescriptor extends GPUObjectDescriptorBase {
  requiredFeatures?: GPUFeatureName[];
  requiredLimits?: Record<string, number>;
}

interface GPUTextureDescriptor extends GPUObjectDescriptorBase {
  size: GPUExtent3D;
  mipLevelCount?: number;
  sampleCount?: number;
  dimension?: GPUTextureDimension;
  format: GPUTextureFormat;
  usage: GPUTextureUsage;
}

interface GPUShaderModuleDescriptor extends GPUObjectDescriptorBase {
  code: string;
}

interface GPURenderPipelineDescriptor extends GPUObjectDescriptorBase {
  layout?: GPUPipelineLayout | "auto";
  vertex: GPUVertexState;
  primitive?: GPUPrimitiveState;
  depthStencil?: GPUDepthStencilState;
  multisample?: GPUMultisampleState;
  fragment?: GPUFragmentState;
}

interface GPUComputePipelineDescriptor extends GPUObjectDescriptorBase {
  layout?: GPUPipelineLayout | "auto";
  compute: GPUProgrammableStage;
}

interface GPUBufferDescriptor extends GPUObjectDescriptorBase {
  size: number;
  usage: GPUBufferUsage;
  mappedAtCreation?: boolean;
}

interface GPUImageCopyTexture {
  texture: GPUTexture;
  mipLevel?: number;
  origin?: GPUOrigin3D;
  aspect?: GPUTextureAspect;
}

interface GPUImageDataLayout {
  offset?: number;
  bytesPerRow?: number;
  rowsPerImage?: number;
}

// Supporting types
interface GPUObjectDescriptorBase {
  label?: string;
}

type GPUExtent3D = [number, number, number] | GPUExtent3DDict;

interface GPUExtent3DDict {
  width: number;
  height?: number;
  depthOrArrayLayers?: number;
}

type GPUOrigin3D = [number, number, number] | GPUOrigin3DDict;

interface GPUOrigin3DDict {
  x?: number;
  y?: number;
  z?: number;
}

type GPUTextureAspect = "all" | "stencil-only" | "depth-only";
type GPUFeatureName = string;
type GPUTextureUsage = number;
type GPUBufferUsage = number;
type GPUMapMode = number;
type GPUBufferMapState = "unmapped" | "pending" | "mapped";
type GPUErrorFilter = "out-of-memory" | "validation";

// Placeholder interfaces for completeness
interface GPUSupportedFeatures {}
interface GPUSupportedLimits {}
interface GPUDeviceLostInfo {}
interface GPUAdapterInfo {}
interface GPUSampler {}
interface GPUBindGroup {}
interface GPUBindGroupLayout {}
interface GPUPipelineLayout {}
interface GPUCommandEncoder {}
interface GPUCommandBuffer {}
interface GPUQuerySet {}
interface GPUError {}
interface GPUCompilationInfo {}
interface GPUTextureView {}
interface GPUTextureViewDescriptor {}
interface GPUSamplerDescriptor {}
interface GPUBindGroupDescriptor {}
interface GPUBindGroupLayoutDescriptor {}
interface GPUPipelineLayoutDescriptor {}
interface GPUCommandEncoderDescriptor {}
interface GPUQuerySetDescriptor {}
interface GPUVertexState {}
interface GPUPrimitiveState {}
interface GPUDepthStencilState {}
interface GPUMultisampleState {}
interface GPUFragmentState {}
interface GPUProgrammableStage {}
interface GPUImageCopyExternalImage {}

// Global WebGPU interface
interface GPU {
  requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
}

interface GPURequestAdapterOptions {
  powerPreference?: GPUPowerPreference;
  forceFallbackAdapter?: boolean;
}

type GPUPowerPreference = "low-power" | "high-performance";

// Add to navigator
interface Navigator {
  gpu?: GPU;
} 