// G3D Compute Shaders stub implementation
export interface ComputeShaderConfig {
    device: 'gpu' | 'cpu';
    shaderVersion: 'webgl2' | 'webgpu';
}

export class ComputeShaders {
    constructor(config: ComputeShaderConfig) {
        // Stub implementation
    }
    
    async createComputePipeline(name: string, shader: string): Promise<void> {
        // Stub implementation
    }
    
    async dispatch(name: string, params: any): Promise<void> {
        // Stub implementation
    }
    
    getDevice(): any {
        return null;
    }
    
    cleanup(): void {
        // Stub implementation
    }
} 