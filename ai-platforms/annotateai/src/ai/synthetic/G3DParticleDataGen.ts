/**
 * G3D AnnotateAI - Particle Data Generator
 * Particle-based synthetic data generation with G3D GPU acceleration
 */

import { GPUCompute } from '../../performance/G3DGPUCompute';
import { ParticleSystem } from '../../core/G3DParticleSystem';

export interface ParticleConfig {
    particleCount: number;
    emissionRate: number;
    lifetime: number;
    velocity: [number, number, number];
    acceleration: [number, number, number];
    size: { min: number; max: number };
    color: { start: [number, number, number, number]; end: [number, number, number, number] };
    enableG3DAcceleration: boolean;
}

export interface ParticleGenerationResult {
    particles: ParticleData[];
    frames: ParticleFrame[];
    annotations: ParticleAnnotations;
    metadata: {
        particleCount: number;
        frameCount: number;
        generationTime: number;
    };
}

export interface ParticleData {
    id: string;
    position: [number, number, number];
    velocity: [number, number, number];
    size: number;
    color: [number, number, number, number];
    lifetime: number;
    age: number;
}

export interface ParticleFrame {
    timestamp: number;
    particles: ParticleData[];
}

export interface ParticleAnnotations {
    trajectories: ParticleTrajectory[];
    densities: DensityMap[];
    flows: FlowField[];
}

export interface ParticleTrajectory {
    particleId: string;
    path: [number, number, number][];
    velocity: number[];
}

export interface DensityMap {
    timestamp: number;
    grid: Float32Array;
    resolution: number;
}

export interface FlowField {
    timestamp: number;
    vectors: [number, number, number][];
    positions: [number, number, number][];
}

export class ParticleDataGen {
    private gpuCompute: GPUCompute;
    private particleSystem: ParticleSystem;
    private particles: Map<string, ParticleData>;
    private generationHistory: ParticleGenerationResult[];

    constructor() {
        this.gpuCompute = new GPUCompute();
        this.particleSystem = new ParticleSystem();
        this.particles = new Map();
        this.generationHistory = [];

        this.initializeParticleKernels();
    }

    private async initializeParticleKernels(): Promise<void> {
        await this.gpuCompute.createKernel(`
      __kernel void update_particles(
        __global float* positions,
        __global float* velocities,
        __global float* ages,
        __global float* lifetimes,
        const float dt,
        const float3 gravity,
        const int count
      ) {
        int idx = get_global_id(0);
        if (idx >= count) return;
        
        int base = idx * 3;
        
        // Update age
        ages[idx] += dt;
        
        // Skip dead particles
        if (ages[idx] > lifetimes[idx]) return;
        
        // Apply gravity
        velocities[base + 1] += gravity.y * dt;
        
        // Update position
        positions[base + 0] += velocities[base + 0] * dt;
        positions[base + 1] += velocities[base + 1] * dt;
        positions[base + 2] += velocities[base + 2] * dt;
      }
    `);
    }

    public async generateParticleData(config: ParticleConfig, duration: number): Promise<ParticleGenerationResult> {
        const startTime = Date.now();

        try {
            const frames: ParticleFrame[] = [];
            const frameRate = 60;
            const frameCount = Math.floor(duration * frameRate);

            // Initialize particles
            await this.initializeParticles(config);

            // Simulate particle system
            for (let frame = 0; frame < frameCount; frame++) {
                const timestamp = frame / frameRate;
                const dt = 1 / frameRate;

                // Update particles
                await this.updateParticles(config, dt);

                // Emit new particles
                await this.emitParticles(config, dt);

                // Remove dead particles
                this.removeDeadParticles();

                // Capture frame
                const frameData = this.captureFrame(timestamp);
                frames.push(frameData);
            }

            // Generate annotations
            const annotations = this.generateParticleAnnotations(frames);

            const generationTime = Date.now() - startTime;

            const result: ParticleGenerationResult = {
                particles: Array.from(this.particles.values()),
                frames,
                annotations,
                metadata: {
                    particleCount: config.particleCount,
                    frameCount,
                    generationTime
                }
            };

            this.generationHistory.push(result);

            console.log(`Generated particle data in ${generationTime.toFixed(2)}ms`);
            return result;

        } catch (error) {
            console.error('Failed to generate particle data:', error);
            throw error;
        }
    }

    private async initializeParticles(config: ParticleConfig): Promise<void> {
        this.particles.clear();

        for (let i = 0; i < config.particleCount; i++) {
            const particle: ParticleData = {
                id: `particle_${i}`,
                position: [
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                ],
                velocity: [
                    config.velocity[0] + (Math.random() - 0.5) * 2,
                    config.velocity[1] + (Math.random() - 0.5) * 2,
                    config.velocity[2] + (Math.random() - 0.5) * 2
                ],
                size: config.size.min + Math.random() * (config.size.max - config.size.min),
                color: [...config.color.start] as [number, number, number, number],
                lifetime: config.lifetime + (Math.random() - 0.5) * config.lifetime * 0.2,
                age: 0
            };

            this.particles.set(particle.id, particle);
        }
    }

    private async updateParticles(config: ParticleConfig, dt: number): Promise<void> {
        if (config.enableG3DAcceleration) {
            await this.updateParticlesGPU(dt);
        } else {
            this.updateParticlesCPU(dt);
        }
    }

    private async updateParticlesGPU(dt: number): Promise<void> {
        const particleArray = Array.from(this.particles.values());
        const count = particleArray.length;

        if (count === 0) return;

        // Prepare data arrays
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const ages = new Float32Array(count);
        const lifetimes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const particle = particleArray[i];
            positions[i * 3] = particle.position[0];
            positions[i * 3 + 1] = particle.position[1];
            positions[i * 3 + 2] = particle.position[2];

            velocities[i * 3] = particle.velocity[0];
            velocities[i * 3 + 1] = particle.velocity[1];
            velocities[i * 3 + 2] = particle.velocity[2];

            ages[i] = particle.age;
            lifetimes[i] = particle.lifetime;
        }

        // Create GPU buffers
        const positionBuffer = await this.gpuCompute.createBuffer(positions.byteLength);
        const velocityBuffer = await this.gpuCompute.createBuffer(velocities.byteLength);
        const ageBuffer = await this.gpuCompute.createBuffer(ages.byteLength);
        const lifetimeBuffer = await this.gpuCompute.createBuffer(lifetimes.byteLength);

        // Upload data
        await this.gpuCompute.updateBuffer(positionBuffer, positions);
        await this.gpuCompute.updateBuffer(velocityBuffer, velocities);
        await this.gpuCompute.updateBuffer(ageBuffer, ages);
        await this.gpuCompute.updateBuffer(lifetimeBuffer, lifetimes);

        // Execute kernel
        const kernel = this.gpuCompute.getKernel('update_particles');
        await this.gpuCompute.executeKernel(kernel, [
            positionBuffer,
            velocityBuffer,
            ageBuffer,
            lifetimeBuffer
        ], {
            dt,
            gravity: [0, -9.81, 0],
            count
        });

        // Read back results
        const updatedPositions = await this.gpuCompute.readBuffer(positionBuffer);
        const updatedVelocities = await this.gpuCompute.readBuffer(velocityBuffer);
        const updatedAges = await this.gpuCompute.readBuffer(ageBuffer);

        // Update particle data
        for (let i = 0; i < count; i++) {
            const particle = particleArray[i];
            particle.position = [
                updatedPositions[i * 3],
                updatedPositions[i * 3 + 1],
                updatedPositions[i * 3 + 2]
            ];
            particle.velocity = [
                updatedVelocities[i * 3],
                updatedVelocities[i * 3 + 1],
                updatedVelocities[i * 3 + 2]
            ];
            particle.age = updatedAges[i];
        }
    }

    private updateParticlesCPU(dt: number): void {
        for (const particle of this.particles.values()) {
            // Update age
            particle.age += dt;

            // Skip dead particles
            if (particle.age > particle.lifetime) continue;

            // Apply gravity
            particle.velocity[1] += -9.81 * dt;

            // Update position
            particle.position[0] += particle.velocity[0] * dt;
            particle.position[1] += particle.velocity[1] * dt;
            particle.position[2] += particle.velocity[2] * dt;
        }
    }

    private async emitParticles(config: ParticleConfig, dt: number): Promise<void> {
        const emitCount = Math.floor(config.emissionRate * dt);

        for (let i = 0; i < emitCount; i++) {
            const particle: ParticleData = {
                id: `particle_${Date.now()}_${i}`,
                position: [0, 0, 0], // Emit from origin
                velocity: [
                    config.velocity[0] + (Math.random() - 0.5) * 2,
                    config.velocity[1] + (Math.random() - 0.5) * 2,
                    config.velocity[2] + (Math.random() - 0.5) * 2
                ],
                size: config.size.min + Math.random() * (config.size.max - config.size.min),
                color: [...config.color.start] as [number, number, number, number],
                lifetime: config.lifetime + (Math.random() - 0.5) * config.lifetime * 0.2,
                age: 0
            };

            this.particles.set(particle.id, particle);
        }
    }

    private removeDeadParticles(): void {
        for (const [id, particle] of this.particles) {
            if (particle.age > particle.lifetime) {
                this.particles.delete(id);
            }
        }
    }

    private captureFrame(timestamp: number): ParticleFrame {
        return {
            timestamp,
            particles: Array.from(this.particles.values()).map(p => ({ ...p }))
        };
    }

    private generateParticleAnnotations(frames: ParticleFrame[]): ParticleAnnotations {
        const trajectories = this.generateTrajectories(frames);
        const densities = this.generateDensityMaps(frames);
        const flows = this.generateFlowFields(frames);

        return { trajectories, densities, flows };
    }

    private generateTrajectories(frames: ParticleFrame[]): ParticleTrajectory[] {
        const trajectories: ParticleTrajectory[] = [];
        const particlePaths = new Map<string, [number, number, number][]>();
        const particleVelocities = new Map<string, number[]>();

        // Collect trajectory data
        for (const frame of frames) {
            for (const particle of frame.particles) {
                if (!particlePaths.has(particle.id)) {
                    particlePaths.set(particle.id, []);
                    particleVelocities.set(particle.id, []);
                }

                particlePaths.get(particle.id)!.push([...particle.position]);
                const velocity = Math.sqrt(
                    particle.velocity[0] ** 2 +
                    particle.velocity[1] ** 2 +
                    particle.velocity[2] ** 2
                );
                particleVelocities.get(particle.id)!.push(velocity);
            }
        }

        // Create trajectory annotations
        for (const [particleId, path] of particlePaths) {
            trajectories.push({
                particleId,
                path,
                velocity: particleVelocities.get(particleId)!
            });
        }

        return trajectories;
    }

    private generateDensityMaps(frames: ParticleFrame[]): DensityMap[] {
        const densities: DensityMap[] = [];
        const resolution = 32;
        const gridSize = 20; // World space size

        for (const frame of frames) {
            const grid = new Float32Array(resolution * resolution * resolution);

            // Calculate particle density in each grid cell
            for (const particle of frame.particles) {
                const x = Math.floor((particle.position[0] + gridSize / 2) / gridSize * resolution);
                const y = Math.floor((particle.position[1] + gridSize / 2) / gridSize * resolution);
                const z = Math.floor((particle.position[2] + gridSize / 2) / gridSize * resolution);

                if (x >= 0 && x < resolution && y >= 0 && y < resolution && z >= 0 && z < resolution) {
                    const index = z * resolution * resolution + y * resolution + x;
                    grid[index] += 1;
                }
            }

            densities.push({
                timestamp: frame.timestamp,
                grid,
                resolution
            });
        }

        return densities;
    }

    private generateFlowFields(frames: ParticleFrame[]): FlowField[] {
        const flows: FlowField[] = [];

        for (let i = 0; i < frames.length - 1; i++) {
            const currentFrame = frames[i];
            const nextFrame = frames[i + 1];
            const dt = nextFrame.timestamp - currentFrame.timestamp;

            const vectors: [number, number, number][] = [];
            const positions: [number, number, number][] = [];

            // Calculate flow vectors between frames
            for (const particle of currentFrame.particles) {
                const nextParticle = nextFrame.particles.find(p => p.id === particle.id);
                if (nextParticle) {
                    const flowVector: [number, number, number] = [
                        (nextParticle.position[0] - particle.position[0]) / dt,
                        (nextParticle.position[1] - particle.position[1]) / dt,
                        (nextParticle.position[2] - particle.position[2]) / dt
                    ];

                    vectors.push(flowVector);
                    positions.push([...particle.position]);
                }
            }

            flows.push({
                timestamp: currentFrame.timestamp,
                vectors,
                positions
            });
        }

        return flows;
    }

    public getGenerationHistory(): ParticleGenerationResult[] {
        return [...this.generationHistory];
    }

    public clearHistory(): void {
        this.generationHistory = [];
    }

    public async cleanup(): Promise<void> {
        try {
            await this.particleSystem.dispose();
            await this.gpuCompute.cleanup();

            console.log('G3D Particle Data Generator cleanup completed');
        } catch (error) {
            console.error('Failed to cleanup particle data generator:', error);
        }
    }
}

export default ParticleDataGen;