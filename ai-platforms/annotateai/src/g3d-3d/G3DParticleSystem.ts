import { EventEmitter } from 'events';

// Types and Interfaces
interface Particle {
    position: { x: number; y: number; z: number };
    velocity: { x: number; y: number; z: number };
    acceleration: { x: number; y: number; z: number };
    color: { r: number; g: number; b: number; a: number };
    size: number;
    life: number;
    maxLife: number;
    rotation: number;
    angularVelocity: number;
    mass: number;
    userData?: any;
}

interface ParticleSystemConfig {
    maxParticles: number;
    emissionRate: number;
    lifetime: number;
    startSize: number;
    endSize: number;
    startColor: { r: number; g: number; b: number; a: number };
    endColor: { r: number; g: number; b: number; a: number };
    gravity: { x: number; y: number; z: number };
    useGPU: boolean;
    blendMode: 'normal' | 'additive' | 'multiply' | 'screen';
    texture?: string;
    sortParticles: boolean;
}

interface EmitterConfig {
    type: 'point' | 'box' | 'sphere' | 'cone' | 'disk' | 'line';
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    velocity: { min: number; max: number };
    angle: { min: number; max: number };
    radius?: number;
    height?: number;
    width?: number;
    depth?: number;
}

interface ForceField {
    type: 'gravity' | 'wind' | 'vortex' | 'turbulence' | 'attractor' | 'repulsor';
    position: { x: number; y: number; z: number };
    strength: number;
    radius: number;
    direction?: { x: number; y: number; z: number };
    noiseScale?: number;
    timeScale?: number;
}

// Base Emitter Class
abstract class ParticleEmitter {
    protected config: EmitterConfig;
    protected isActive: boolean = true;

    constructor(config: EmitterConfig) {
        this.config = { ...config };
    }

    abstract emit(count: number): Particle[];

    public setActive(active: boolean): void {
        this.isActive = active;
    }

    public isEmitting(): boolean {
        return this.isActive;
    }

    public updateConfig(config: Partial<EmitterConfig>): void {
        this.config = { ...this.config, ...config };
    }

    protected createBaseParticle(): Particle {
        return {
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            acceleration: { x: 0, y: 0, z: 0 },
            color: { r: 1, g: 1, b: 1, a: 1 },
            size: 1,
            life: 1,
            maxLife: 1,
            rotation: 0,
            angularVelocity: 0,
            mass: 1
        };
    }

    protected randomInRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    protected randomDirection(): { x: number; y: number; z: number } {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        return {
            x: Math.sin(phi) * Math.cos(theta),
            y: Math.sin(phi) * Math.sin(theta),
            z: Math.cos(phi)
        };
    }
}

// Specific Emitter Implementations
class PointEmitter extends ParticleEmitter {
    emit(count: number): Particle[] {
        const particles: Particle[] = [];

        for (let i = 0; i < count; i++) {
            const particle = this.createBaseParticle();
            particle.position = { ...this.config.position };

            const direction = this.randomDirection();
            const speed = this.randomInRange(this.config.velocity.min, this.config.velocity.max);

            particle.velocity = {
                x: direction.x * speed,
                y: direction.y * speed,
                z: direction.z * speed
            };

            particles.push(particle);
        }

        return particles;
    }
}

class BoxEmitter extends ParticleEmitter {
    emit(count: number): Particle[] {
        const particles: Particle[] = [];
        const { width = 1, height = 1, depth = 1 } = this.config;

        for (let i = 0; i < count; i++) {
            const particle = this.createBaseParticle();

            particle.position = {
                x: this.config.position.x + (Math.random() - 0.5) * width,
                y: this.config.position.y + (Math.random() - 0.5) * height,
                z: this.config.position.z + (Math.random() - 0.5) * depth
            };

            const direction = this.randomDirection();
            const speed = this.randomInRange(this.config.velocity.min, this.config.velocity.max);

            particle.velocity = {
                x: direction.x * speed,
                y: direction.y * speed,
                z: direction.z * speed
            };

            particles.push(particle);
        }

        return particles;
    }
}

class SphereEmitter extends ParticleEmitter {
    emit(count: number): Particle[] {
        const particles: Particle[] = [];
        const radius = this.config.radius || 1;

        for (let i = 0; i < count; i++) {
            const particle = this.createBaseParticle();

            // Random point on sphere surface
            const direction = this.randomDirection();
            const r = Math.random() * radius;

            particle.position = {
                x: this.config.position.x + direction.x * r,
                y: this.config.position.y + direction.y * r,
                z: this.config.position.z + direction.z * r
            };

            const speed = this.randomInRange(this.config.velocity.min, this.config.velocity.max);

            particle.velocity = {
                x: direction.x * speed,
                y: direction.y * speed,
                z: direction.z * speed
            };

            particles.push(particle);
        }

        return particles;
    }
}

class ConeEmitter extends ParticleEmitter {
    emit(count: number): Particle[] {
        const particles: Particle[] = [];
        const radius = this.config.radius || 1;
        const height = this.config.height || 2;
        const angle = this.config.angle?.max || Math.PI / 4;

        for (let i = 0; i < count; i++) {
            const particle = this.createBaseParticle();

            // Random point within cone
            const theta = Math.random() * Math.PI * 2;
            const h = Math.random() * height;
            const r = (h / height) * radius * Math.tan(angle);
            const actualR = Math.random() * r;

            particle.position = {
                x: this.config.position.x + actualR * Math.cos(theta),
                y: this.config.position.y + h,
                z: this.config.position.z + actualR * Math.sin(theta)
            };

            // Velocity along cone direction with some spread
            const coneDirection = {
                x: Math.sin(angle) * Math.cos(theta),
                y: Math.cos(angle),
                z: Math.sin(angle) * Math.sin(theta)
            };

            const speed = this.randomInRange(this.config.velocity.min, this.config.velocity.max);

            particle.velocity = {
                x: coneDirection.x * speed,
                y: coneDirection.y * speed,
                z: coneDirection.z * speed
            };

            particles.push(particle);
        }

        return particles;
    }
}

// Particle Updaters
abstract class ParticleUpdater {
    abstract update(particles: Particle[], deltaTime: number): void;
}

class GravityUpdater extends ParticleUpdater {
    constructor(private gravity: { x: number; y: number; z: number }) {
        super();
    }

    update(particles: Particle[], deltaTime: number): void {
        for (const particle of particles) {
            particle.acceleration.x += this.gravity.x;
            particle.acceleration.y += this.gravity.y;
            particle.acceleration.z += this.gravity.z;
        }
    }
}

class VelocityUpdater extends ParticleUpdater {
    update(particles: Particle[], deltaTime: number): void {
        for (const particle of particles) {
            // Update velocity with acceleration
            particle.velocity.x += particle.acceleration.x * deltaTime;
            particle.velocity.y += particle.acceleration.y * deltaTime;
            particle.velocity.z += particle.acceleration.z * deltaTime;

            // Update position with velocity
            particle.position.x += particle.velocity.x * deltaTime;
            particle.position.y += particle.velocity.y * deltaTime;
            particle.position.z += particle.velocity.z * deltaTime;

            // Reset acceleration
            particle.acceleration.x = 0;
            particle.acceleration.y = 0;
            particle.acceleration.z = 0;
        }
    }
}

class LifetimeUpdater extends ParticleUpdater {
    update(particles: Particle[], deltaTime: number): void {
        for (const particle of particles) {
            particle.life -= deltaTime;
        }
    }
}

class ColorOverLifetimeUpdater extends ParticleUpdater {
    constructor(
        private startColor: { r: number; g: number; b: number; a: number },
        private endColor: { r: number; g: number; b: number; a: number }
    ) {
        super();
    }

    update(particles: Particle[], deltaTime: number): void {
        for (const particle of particles) {
            const t = 1 - (particle.life / particle.maxLife);

            particle.color.r = this.lerp(this.startColor.r, this.endColor.r, t);
            particle.color.g = this.lerp(this.startColor.g, this.endColor.g, t);
            particle.color.b = this.lerp(this.startColor.b, this.endColor.b, t);
            particle.color.a = this.lerp(this.startColor.a, this.endColor.a, t);
        }
    }

    private lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }
}

class SizeOverLifetimeUpdater extends ParticleUpdater {
    constructor(private startSize: number, private endSize: number) {
        super();
    }

    update(particles: Particle[], deltaTime: number): void {
        for (const particle of particles) {
            const t = 1 - (particle.life / particle.maxLife);
            particle.size = this.lerp(this.startSize, this.endSize, t);
        }
    }

    private lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }
}

class RotationUpdater extends ParticleUpdater {
    update(particles: Particle[], deltaTime: number): void {
        for (const particle of particles) {
            particle.rotation += particle.angularVelocity * deltaTime;
        }
    }
}

class ForceFieldUpdater extends ParticleUpdater {
    constructor(private forceFields: ForceField[]) {
        super();
    }

    update(particles: Particle[], deltaTime: number): void {
        for (const particle of particles) {
            for (const field of this.forceFields) {
                this.applyForceField(particle, field, deltaTime);
            }
        }
    }

    private applyForceField(particle: Particle, field: ForceField, deltaTime: number): void {
        const dx = particle.position.x - field.position.x;
        const dy = particle.position.y - field.position.y;
        const dz = particle.position.z - field.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance > field.radius) return;

        const strength = field.strength * (1 - distance / field.radius);

        switch (field.type) {
            case 'gravity':
            case 'attractor':
                if (distance > 0) {
                    const force = strength / (distance * distance);
                    particle.acceleration.x -= (dx / distance) * force;
                    particle.acceleration.y -= (dy / distance) * force;
                    particle.acceleration.z -= (dz / distance) * force;
                }
                break;

            case 'repulsor':
                if (distance > 0) {
                    const force = strength / (distance * distance);
                    particle.acceleration.x += (dx / distance) * force;
                    particle.acceleration.y += (dy / distance) * force;
                    particle.acceleration.z += (dz / distance) * force;
                }
                break;

            case 'wind':
                if (field.direction) {
                    particle.acceleration.x += field.direction.x * strength;
                    particle.acceleration.y += field.direction.y * strength;
                    particle.acceleration.z += field.direction.z * strength;
                }
                break;

            case 'vortex':
                const centerX = field.position.x;
                const centerZ = field.position.z;
                const vortexRadius = Math.sqrt(dx * dx + dz * dz);

                if (vortexRadius > 0) {
                    const tangentX = -dz / vortexRadius;
                    const tangentZ = dx / vortexRadius;

                    particle.acceleration.x += tangentX * strength;
                    particle.acceleration.z += tangentZ * strength;

                    // Pull towards center
                    particle.acceleration.x -= (dx / vortexRadius) * strength * 0.1;
                    particle.acceleration.z -= (dz / vortexRadius) * strength * 0.1;
                }
                break;

            case 'turbulence':
                const noiseScale = field.noiseScale || 0.1;
                const timeScale = field.timeScale || 1;
                const time = Date.now() * 0.001 * timeScale;

                const noiseX = this.noise3D(particle.position.x * noiseScale, particle.position.y * noiseScale, time);
                const noiseY = this.noise3D(particle.position.y * noiseScale, particle.position.z * noiseScale, time + 100);
                const noiseZ = this.noise3D(particle.position.z * noiseScale, particle.position.x * noiseScale, time + 200);

                particle.acceleration.x += noiseX * strength;
                particle.acceleration.y += noiseY * strength;
                particle.acceleration.z += noiseZ * strength;
                break;
        }
    }

    private noise3D(x: number, y: number, z: number): number {
        // Simple noise function - could be replaced with Perlin noise
        return (Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453) % 1;
    }
}

class CollisionUpdater extends ParticleUpdater {
    constructor(
        private planes: Array<{ normal: { x: number; y: number; z: number }; distance: number }> = [],
        private spheres: Array<{ center: { x: number; y: number; z: number }; radius: number }> = [],
        private damping: number = 0.8
    ) {
        super();
    }

    update(particles: Particle[], deltaTime: number): void {
        for (const particle of particles) {
            // Check plane collisions
            for (const plane of this.planes) {
                const distance = particle.position.x * plane.normal.x +
                    particle.position.y * plane.normal.y +
                    particle.position.z * plane.normal.z - plane.distance;

                if (distance < 0) {
                    // Reflect position
                    particle.position.x -= distance * plane.normal.x;
                    particle.position.y -= distance * plane.normal.y;
                    particle.position.z -= distance * plane.normal.z;

                    // Reflect velocity
                    const dot = particle.velocity.x * plane.normal.x +
                        particle.velocity.y * plane.normal.y +
                        particle.velocity.z * plane.normal.z;

                    particle.velocity.x -= 2 * dot * plane.normal.x * this.damping;
                    particle.velocity.y -= 2 * dot * plane.normal.y * this.damping;
                    particle.velocity.z -= 2 * dot * plane.normal.z * this.damping;
                }
            }

            // Check sphere collisions
            for (const sphere of this.spheres) {
                const dx = particle.position.x - sphere.center.x;
                const dy = particle.position.y - sphere.center.y;
                const dz = particle.position.z - sphere.center.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance < sphere.radius) {
                    // Push particle outside sphere
                    const factor = sphere.radius / distance;
                    particle.position.x = sphere.center.x + dx * factor;
                    particle.position.y = sphere.center.y + dy * factor;
                    particle.position.z = sphere.center.z + dz * factor;

                    // Reflect velocity
                    const normal = { x: dx / distance, y: dy / distance, z: dz / distance };
                    const dot = particle.velocity.x * normal.x +
                        particle.velocity.y * normal.y +
                        particle.velocity.z * normal.z;

                    particle.velocity.x -= 2 * dot * normal.x * this.damping;
                    particle.velocity.y -= 2 * dot * normal.y * this.damping;
                    particle.velocity.z -= 2 * dot * normal.z * this.damping;
                }
            }
        }
    }
}

// GPU Compute Shader for particle updates
class GPUParticleCompute {
    private device: GPUDevice | null = null;
    private computePipeline: GPUComputePipeline | null = null;
    private particleBuffer: GPUBuffer | null = null;
    private uniformBuffer: GPUBuffer | null = null;

    constructor() {
        this.initializeGPU();
    }

    private async initializeGPU(): Promise<void> {
        if (!navigator.gpu) {
            console.warn('WebGPU not supported, falling back to CPU');
            return;
        }

        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) return;

            this.device = await adapter.requestDevice() as GPUDevice;
            await this.createComputePipeline();
        } catch (error) {
            console.warn('Failed to initialize WebGPU:', error);
        }
    }

    private async createComputePipeline(): Promise<void> {
        if (!this.device) return;

        const computeShaderCode = `
            struct Particle {
                position: vec3<f32>,
                velocity: vec3<f32>,
                acceleration: vec3<f32>,
                color: vec4<f32>,
                size: f32,
                life: f32,
                maxLife: f32,
                rotation: f32,
                angularVelocity: f32,
                mass: f32,
            };

            struct Uniforms {
                deltaTime: f32,
                gravity: vec3<f32>,
                time: f32,
            };

            @group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
            @group(0) @binding(1) var<uniform> uniforms: Uniforms;

            @compute @workgroup_size(64)
            fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
                let index = global_id.x;
                if (index >= arrayLength(&particles)) {
                    return;
                }

                var particle = particles[index];

                // Update lifetime
                particle.life -= uniforms.deltaTime;

                if (particle.life <= 0.0) {
                    return;
                }

                // Apply gravity
                particle.acceleration += uniforms.gravity;

                // Update velocity and position
                particle.velocity += particle.acceleration * uniforms.deltaTime;
                particle.position += particle.velocity * uniforms.deltaTime;

                // Update rotation
                particle.rotation += particle.angularVelocity * uniforms.deltaTime;

                // Reset acceleration
                particle.acceleration = vec3<f32>(0.0, 0.0, 0.0);

                particles[index] = particle;
            }
        `;

        const shaderModule = this.device.createShaderModule({
            code: computeShaderCode
        });

        this.computePipeline = this.device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint: 'main'
            }
        });
    }

    public updateParticles(particles: Particle[], deltaTime: number): void {
        if (!this.device || !this.computePipeline || particles.length === 0) {
            return;
        }

        // Create or update particle buffer
        const particleData = new Float32Array(particles.length * 12); // 12 floats per particle
        for (let i = 0; i < particles.length; i++) {
            const offset = i * 12;
            const particle = particles[i];

            particleData[offset + 0] = particle.position.x;
            particleData[offset + 1] = particle.position.y;
            particleData[offset + 2] = particle.position.z;
            particleData[offset + 3] = particle.velocity.x;
            particleData[offset + 4] = particle.velocity.y;
            particleData[offset + 5] = particle.velocity.z;
            particleData[offset + 6] = particle.acceleration.x;
            particleData[offset + 7] = particle.acceleration.y;
            particleData[offset + 8] = particle.acceleration.z;
            particleData[offset + 9] = particle.life;
            particleData[offset + 10] = particle.rotation;
            particleData[offset + 11] = particle.angularVelocity;
        }

        if (!this.particleBuffer || this.particleBuffer.size < particleData.byteLength) {
            this.particleBuffer?.destroy();
            this.particleBuffer = this.device.createBuffer({
                size: particleData.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
            });
        }

        // Update uniform buffer
        const uniformData = new Float32Array([deltaTime, 0, -9.81, 0, Date.now() * 0.001]);
        if (!this.uniformBuffer) {
            this.uniformBuffer = this.device.createBuffer({
                size: uniformData.byteLength,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });
        }

        this.device.queue.writeBuffer(this.particleBuffer, 0, particleData);
        this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);

        // Create bind group
        const bindGroup = this.device.createBindGroup({
            layout: this.computePipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.particleBuffer } },
                { binding: 1, resource: { buffer: this.uniformBuffer } }
            ]
        });

        // Dispatch compute shader
        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(this.computePipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.dispatchWorkgroups(Math.ceil(particles.length / 64));
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);

        // Read back results (in real implementation, this would be optimized)
        // For now, we'll skip the readback and let CPU updaters handle the logic
    }

    public dispose(): void {
        this.particleBuffer?.destroy();
        this.uniformBuffer?.destroy();
    }
}

// Main Particle System Class
export class G3DParticleSystem extends EventEmitter {
    private particles: Particle[] = [];
    private emitters: ParticleEmitter[] = [];
    private updaters: ParticleUpdater[] = [];
    private forceFields: ForceField[] = [];
    private config: ParticleSystemConfig;
    private isActive: boolean = true;
    private time: number = 0;
    private emissionTimer: number = 0;
    private gpuCompute: GPUParticleCompute;

    constructor(config: Partial<ParticleSystemConfig> = {}) {
        super();

        this.config = {
            maxParticles: 10000,
            emissionRate: 100,
            lifetime: 5,
            startSize: 1,
            endSize: 0,
            startColor: { r: 1, g: 1, b: 1, a: 1 },
            endColor: { r: 1, g: 1, b: 1, a: 0 },
            gravity: { x: 0, y: -9.81, z: 0 },
            useGPU: true,
            blendMode: 'additive',
            sortParticles: false,
            ...config
        };

        this.gpuCompute = new GPUParticleCompute();
        this.initializeDefaultUpdaters();
    }

    private initializeDefaultUpdaters(): void {
        this.updaters.push(new LifetimeUpdater());
        this.updaters.push(new VelocityUpdater());
        this.updaters.push(new GravityUpdater(this.config.gravity));
        this.updaters.push(new ColorOverLifetimeUpdater(this.config.startColor, this.config.endColor));
        this.updaters.push(new SizeOverLifetimeUpdater(this.config.startSize, this.config.endSize));
        this.updaters.push(new RotationUpdater());
    }

    // Emitter Management
    public addEmitter(type: EmitterConfig['type'], config: Partial<EmitterConfig>): ParticleEmitter {
        const emitterConfig: EmitterConfig = {
            type,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            velocity: { min: 1, max: 5 },
            angle: { min: 0, max: Math.PI * 2 },
            ...config
        };

        let emitter: ParticleEmitter;

        switch (type) {
            case 'point':
                emitter = new PointEmitter(emitterConfig);
                break;
            case 'box':
                emitter = new BoxEmitter(emitterConfig);
                break;
            case 'sphere':
                emitter = new SphereEmitter(emitterConfig);
                break;
            case 'cone':
                emitter = new ConeEmitter(emitterConfig);
                break;
            default:
                emitter = new PointEmitter(emitterConfig);
        }

        this.emitters.push(emitter);
        return emitter;
    }

    public removeEmitter(emitter: ParticleEmitter): void {
        const index = this.emitters.indexOf(emitter);
        if (index !== -1) {
            this.emitters.splice(index, 1);
        }
    }

    // Force Field Management
    public addForceField(field: ForceField): void {
        this.forceFields.push(field);

        // Add force field updater if not already present
        const hasForceFieldUpdater = this.updaters.some(updater => updater instanceof ForceFieldUpdater);
        if (!hasForceFieldUpdater) {
            this.updaters.push(new ForceFieldUpdater(this.forceFields));
        }
    }

    public removeForceField(field: ForceField): void {
        const index = this.forceFields.indexOf(field);
        if (index !== -1) {
            this.forceFields.splice(index, 1);
        }
    }

    // Collision Management
    public addCollisionPlane(normal: { x: number; y: number; z: number }, distance: number): void {
        let collisionUpdater = this.updaters.find(updater => updater instanceof CollisionUpdater) as CollisionUpdater;
        if (!collisionUpdater) {
            collisionUpdater = new CollisionUpdater([{ normal, distance }], []);
            this.updaters.push(collisionUpdater);
        }
    }

    public addCollisionSphere(center: { x: number; y: number; z: number }, radius: number): void {
        let collisionUpdater = this.updaters.find(updater => updater instanceof CollisionUpdater) as CollisionUpdater;
        if (!collisionUpdater) {
            collisionUpdater = new CollisionUpdater([], [{ center, radius }]);
            this.updaters.push(collisionUpdater);
        }
    }

    // Update Loop
    public update(deltaTime: number): void {
        if (!this.isActive) return;

        this.time += deltaTime;
        this.emissionTimer += deltaTime;

        // Emit new particles
        if (this.emissionTimer >= 1 / this.config.emissionRate) {
            this.emitParticles();
            this.emissionTimer = 0;
        }

        // Update particles
        if (this.config.useGPU) {
            this.gpuCompute.updateParticles(this.particles, deltaTime);
        }

        // Apply updaters
        for (const updater of this.updaters) {
            updater.update(this.particles, deltaTime);
        }

        // Remove dead particles
        this.particles = this.particles.filter(particle => particle.life > 0);

        // Sort particles if needed
        if (this.config.sortParticles) {
            this.sortParticles();
        }

        this.emit('updated', { particleCount: this.particles.length, time: this.time });
    }

    private emitParticles(): void {
        for (const emitter of this.emitters) {
            if (!emitter.isEmitting()) continue;

            const particlesToEmit = Math.min(
                Math.floor(this.config.emissionRate / 60), // Assume 60 FPS
                this.config.maxParticles - this.particles.length
            );

            if (particlesToEmit <= 0) break;

            const newParticles = emitter.emit(particlesToEmit);

            // Initialize particle properties
            for (const particle of newParticles) {
                particle.life = this.config.lifetime;
                particle.maxLife = this.config.lifetime;
                particle.size = this.config.startSize;
                particle.color = { ...this.config.startColor };
                particle.angularVelocity = (Math.random() - 0.5) * 2;
            }

            this.particles.push(...newParticles);
        }
    }

    private sortParticles(): void {
        // Sort by distance from camera (would need camera position in real implementation)
        // For now, sort by Z position
        this.particles.sort((a, b) => b.position.z - a.position.z);
    }

    // Public API
    public setActive(active: boolean): void {
        this.isActive = active;
    }

    public isSystemActive(): boolean {
        return this.isActive;
    }

    public getParticleCount(): number {
        return this.particles.length;
    }

    public getParticles(): Particle[] {
        return [...this.particles];
    }

    public clear(): void {
        this.particles = [];
        this.time = 0;
        this.emissionTimer = 0;
    }

    public reset(): void {
        this.clear();
        this.emitters.forEach(emitter => emitter.setActive(true));
    }

    public updateConfig(config: Partial<ParticleSystemConfig>): void {
        this.config = { ...this.config, ...config };

        // Update relevant updaters
        const gravityUpdater = this.updaters.find(updater => updater instanceof GravityUpdater) as GravityUpdater;
        if (gravityUpdater && config.gravity) {
            const index = this.updaters.indexOf(gravityUpdater);
            this.updaters[index] = new GravityUpdater(config.gravity);
        }

        const colorUpdater = this.updaters.find(updater => updater instanceof ColorOverLifetimeUpdater) as ColorOverLifetimeUpdater;
        if (colorUpdater && (config.startColor || config.endColor)) {
            const index = this.updaters.indexOf(colorUpdater);
            this.updaters[index] = new ColorOverLifetimeUpdater(
                config.startColor || this.config.startColor,
                config.endColor || this.config.endColor
            );
        }

        const sizeUpdater = this.updaters.find(updater => updater instanceof SizeOverLifetimeUpdater) as SizeOverLifetimeUpdater;
        if (sizeUpdater && (config.startSize || config.endSize)) {
            const index = this.updaters.indexOf(sizeUpdater);
            this.updaters[index] = new SizeOverLifetimeUpdater(
                config.startSize || this.config.startSize,
                config.endSize || this.config.endSize
            );
        }
    }

    // Preset Configurations
    public static createFireEffect(): G3DParticleSystem {
        const system = new G3DParticleSystem({
            maxParticles: 1000,
            emissionRate: 50,
            lifetime: 2,
            startSize: 0.5,
            endSize: 2,
            startColor: { r: 1, g: 0.8, b: 0, a: 1 },
            endColor: { r: 1, g: 0, b: 0, a: 0 },
            gravity: { x: 0, y: 2, z: 0 },
            blendMode: 'additive'
        });

        system.addEmitter('cone', {
            position: { x: 0, y: 0, z: 0 },
            velocity: { min: 1, max: 3 },
            angle: { min: 0, max: Math.PI / 6 },
            radius: 0.5,
            height: 1
        });

        return system;
    }

    public static createSmokeEffect(): G3DParticleSystem {
        const system = new G3DParticleSystem({
            maxParticles: 500,
            emissionRate: 20,
            lifetime: 8,
            startSize: 1,
            endSize: 4,
            startColor: { r: 0.8, g: 0.8, b: 0.8, a: 0.8 },
            endColor: { r: 0.6, g: 0.6, b: 0.6, a: 0 },
            gravity: { x: 0, y: 1, z: 0 },
            blendMode: 'normal'
        });

        system.addEmitter('sphere', {
            position: { x: 0, y: 0, z: 0 },
            velocity: { min: 0.5, max: 1.5 },
            radius: 0.3
        });

        return system;
    }

    public static createSparkEffect(): G3DParticleSystem {
        const system = new G3DParticleSystem({
            maxParticles: 200,
            emissionRate: 100,
            lifetime: 1,
            startSize: 0.1,
            endSize: 0.05,
            startColor: { r: 1, g: 1, b: 0.5, a: 1 },
            endColor: { r: 1, g: 0.5, b: 0, a: 0 },
            gravity: { x: 0, y: -5, z: 0 },
            blendMode: 'additive'
        });

        system.addEmitter('point', {
            position: { x: 0, y: 0, z: 0 },
            velocity: { min: 3, max: 8 }
        });

        return system;
    }

    public dispose(): void {
        this.clear();
        this.emitters = [];
        this.updaters = [];
        this.forceFields = [];
        this.gpuCompute.dispose();
        this.removeAllListeners();
        console.log('G3D Particle System disposed');
    }
}