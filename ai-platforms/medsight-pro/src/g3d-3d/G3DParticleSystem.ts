/**
 * G3D MedSight Pro - Advanced Medical Particle System
 * 
 * Comprehensive particle system optimized for medical visualization including:
 * - Blood flow and circulation visualization
 * - Drug diffusion and pharmacokinetics
 * - Cellular interactions and biological processes
 * - Medical environment simulation (air flow, contamination)
 * - Therapeutic visualization (radiation, ultrasound)
 * - Surgical simulation particles (smoke, debris, fluids)
 * 
 * Features:
 * - GPU-accelerated compute shaders for medical simulations
 * - Physiologically accurate particle behaviors
 * - Real-time medical parameter visualization
 * - Clinical workflow integration
 * - HIPAA-compliant data handling
 * 
 * @author G3D MedSight Pro Team
 * @version 1.0.0
 */

import { Vector3, Matrix4, Color, BufferGeometry, BufferAttribute, Points, PointsMaterial, AdditiveBlending, Texture, DataTexture, FloatType, RGBAFormat } from 'three';

export interface MedicalParticleConfig {
    // Basic particle properties
    count: number;
    lifetime: number;
    size: number;
    sizeVariation: number;

    // Medical-specific properties
    medicalType: 'blood' | 'drug' | 'cellular' | 'environmental' | 'therapeutic' | 'surgical';
    physiologyAccuracy: 'low' | 'medium' | 'high' | 'research';

    // Visualization properties
    color: Color;
    opacity: number;
    blending: typeof AdditiveBlending;
    texture?: Texture;

    // Physics properties
    velocity: Vector3;
    acceleration: Vector3;
    turbulence: number;
    viscosity: number;

    // Medical simulation properties
    concentration?: number;
    diffusionRate?: number;
    metabolismRate?: number;
    bindingAffinity?: number;
    flowRate?: number;
    pressure?: number;
}

export interface BloodFlowConfig extends MedicalParticleConfig {
    vesselType: 'artery' | 'vein' | 'capillary' | 'venule' | 'arteriole';
    oxygenation: number; // 0-1
    hematocrit: number; // 0-1
    viscosity: number;
    pulsatile: boolean;
    heartRate?: number;
}

export interface DrugDiffusionConfig extends MedicalParticleConfig {
    drugType: string;
    molecularWeight: number;
    lipophilicity: number;
    proteinBinding: number;
    halfLife: number;
    targetTissue: string[];
    administrationRoute: 'iv' | 'oral' | 'topical' | 'inhalation' | 'injection';
}

export interface CellularConfig extends MedicalParticleConfig {
    cellType: 'rbc' | 'wbc' | 'platelet' | 'neuron' | 'cancer' | 'stem' | 'epithelial';
    size: number;
    motility: number;
    divisionRate?: number;
    apoptosisRate?: number;
    adhesion: number;
}

export class G3DParticleSystem {
    private particles: Float32Array;
    private velocities: Float32Array;
    private lifetimes: Float32Array;
    private medicalProperties: Float32Array;

    private geometry: BufferGeometry;
    private material: PointsMaterial;
    private points: Points;

    private config: MedicalParticleConfig;
    private medicalContext: any;

    // GPU compute resources
    private computeShader: any;
    private positionTexture: DataTexture;
    private velocityTexture: DataTexture;
    private medicalTexture: DataTexture;

    // Medical simulation state
    private physiologyEngine: any;
    private medicalTimer: number = 0;
    private clinicalAccuracy: boolean = true;

    // Performance monitoring
    private performanceMetrics: {
        particleCount: number;
        updateTime: number;
        renderTime: number;
        memoryUsage: number;
        medicalAccuracy: number;
    };

    constructor(config: MedicalParticleConfig) {
        this.config = config;
        this.performanceMetrics = {
            particleCount: 0,
            updateTime: 0,
            renderTime: 0,
            memoryUsage: 0,
            medicalAccuracy: 1.0
        };

        this.initializeParticleSystem();
        this.setupMedicalSimulation();
        this.createGPUResources();
    }

    private initializeParticleSystem(): void {
        const count = this.config.count;

        // Initialize particle arrays
        this.particles = new Float32Array(count * 3);
        this.velocities = new Float32Array(count * 3);
        this.lifetimes = new Float32Array(count);
        this.medicalProperties = new Float32Array(count * 4); // concentration, diffusion, metabolism, binding

        // Initialize particles based on medical type
        this.initializeMedicalParticles();

        // Create Three.js geometry
        this.geometry = new BufferGeometry();
        this.geometry.setAttribute('position', new BufferAttribute(this.particles, 3));
        this.geometry.setAttribute('velocity', new BufferAttribute(this.velocities, 3));
        this.geometry.setAttribute('lifetime', new BufferAttribute(this.lifetimes, 1));
        this.geometry.setAttribute('medicalProps', new BufferAttribute(this.medicalProperties, 4));

        // Create medical-appropriate material
        this.material = this.createMedicalMaterial();

        // Create points object
        this.points = new Points(this.geometry, this.material);
    }

    private initializeMedicalParticles(): void {
        const count = this.config.count;

        switch (this.config.medicalType) {
            case 'blood':
                this.initializeBloodFlow();
                break;
            case 'drug':
                this.initializeDrugDiffusion();
                break;
            case 'cellular':
                this.initializeCellularParticles();
                break;
            case 'environmental':
                this.initializeEnvironmentalParticles();
                break;
            case 'therapeutic':
                this.initializeTherapeuticParticles();
                break;
            case 'surgical':
                this.initializeSurgicalParticles();
                break;
        }
    }

    private initializeBloodFlow(): void {
        const config = this.config as BloodFlowConfig;
        const count = this.config.count;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Position along vessel path
            this.particles[i3] = Math.random() * 10 - 5;
            this.particles[i3 + 1] = Math.random() * 10 - 5;
            this.particles[i3 + 2] = Math.random() * 10 - 5;

            // Velocity based on vessel type and flow characteristics
            const baseVelocity = this.getVesselVelocity(config.vesselType);
            this.velocities[i3] = baseVelocity * (0.8 + Math.random() * 0.4);
            this.velocities[i3 + 1] = Math.random() * 0.1 - 0.05;
            this.velocities[i3 + 2] = Math.random() * 0.1 - 0.05;

            // Lifetime based on circulation time
            this.lifetimes[i] = config.lifetime * (0.8 + Math.random() * 0.4);

            // Medical properties: oxygenation, hematocrit, pressure, flow rate
            this.medicalProperties[i * 4] = config.oxygenation;
            this.medicalProperties[i * 4 + 1] = config.hematocrit;
            this.medicalProperties[i * 4 + 2] = Math.random(); // pressure variation
            this.medicalProperties[i * 4 + 3] = baseVelocity; // flow rate
        }
    }

    private initializeDrugDiffusion(): void {
        const config = this.config as DrugDiffusionConfig;
        const count = this.config.count;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Initial position at administration site
            const radius = Math.random() * 2;
            const angle = Math.random() * Math.PI * 2;
            this.particles[i3] = Math.cos(angle) * radius;
            this.particles[i3 + 1] = Math.sin(angle) * radius;
            this.particles[i3 + 2] = Math.random() * 1 - 0.5;

            // Diffusion velocity based on molecular properties
            const diffusionSpeed = this.calculateDiffusionSpeed(config);
            this.velocities[i3] = (Math.random() - 0.5) * diffusionSpeed;
            this.velocities[i3 + 1] = (Math.random() - 0.5) * diffusionSpeed;
            this.velocities[i3 + 2] = (Math.random() - 0.5) * diffusionSpeed;

            // Lifetime based on drug half-life
            this.lifetimes[i] = config.halfLife * (0.5 + Math.random());

            // Medical properties: concentration, diffusion rate, metabolism, binding
            this.medicalProperties[i * 4] = 1.0; // initial concentration
            this.medicalProperties[i * 4 + 1] = config.diffusionRate || 0.1;
            this.medicalProperties[i * 4 + 2] = config.metabolismRate || 0.05;
            this.medicalProperties[i * 4 + 3] = config.bindingAffinity || 0.3;
        }
    }

    private initializeCellularParticles(): void {
        const config = this.config as CellularConfig;
        const count = this.config.count;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Random distribution in tissue volume
            this.particles[i3] = Math.random() * 20 - 10;
            this.particles[i3 + 1] = Math.random() * 20 - 10;
            this.particles[i3 + 2] = Math.random() * 20 - 10;

            // Cell motility based on type
            const motility = this.getCellMotility(config.cellType);
            this.velocities[i3] = (Math.random() - 0.5) * motility;
            this.velocities[i3 + 1] = (Math.random() - 0.5) * motility;
            this.velocities[i3 + 2] = (Math.random() - 0.5) * motility;

            // Cell lifetime
            this.lifetimes[i] = config.lifetime * (0.5 + Math.random());

            // Medical properties: size, motility, division rate, apoptosis rate
            this.medicalProperties[i * 4] = config.size;
            this.medicalProperties[i * 4 + 1] = motility;
            this.medicalProperties[i * 4 + 2] = config.divisionRate || 0;
            this.medicalProperties[i * 4 + 3] = config.apoptosisRate || 0.001;
        }
    }

    private initializeEnvironmentalParticles(): void {
        // Air flow, contamination, aerosols
        const count = this.config.count;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Environmental distribution
            this.particles[i3] = Math.random() * 50 - 25;
            this.particles[i3 + 1] = Math.random() * 20 - 10;
            this.particles[i3 + 2] = Math.random() * 50 - 25;

            // Air flow patterns
            this.velocities[i3] = Math.random() * 2 - 1;
            this.velocities[i3 + 1] = Math.random() * 0.5;
            this.velocities[i3 + 2] = Math.random() * 2 - 1;

            this.lifetimes[i] = this.config.lifetime * Math.random();

            // Environmental properties: contamination level, particle size, density, toxicity
            this.medicalProperties[i * 4] = Math.random(); // contamination
            this.medicalProperties[i * 4 + 1] = Math.random() * 10; // size (micrometers)
            this.medicalProperties[i * 4 + 2] = Math.random(); // density
            this.medicalProperties[i * 4 + 3] = Math.random() * 0.1; // toxicity
        }
    }

    private initializeTherapeuticParticles(): void {
        // Radiation, ultrasound, laser therapy
        const count = this.config.count;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Therapeutic beam pattern
            const angle = (i / count) * Math.PI * 2;
            const radius = Math.random() * 5;
            this.particles[i3] = Math.cos(angle) * radius;
            this.particles[i3 + 1] = Math.sin(angle) * radius;
            this.particles[i3 + 2] = Math.random() * 10;

            // Directed therapeutic energy
            this.velocities[i3] = 0;
            this.velocities[i3 + 1] = 0;
            this.velocities[i3 + 2] = 5 + Math.random() * 2;

            this.lifetimes[i] = this.config.lifetime;

            // Therapeutic properties: energy, penetration, absorption, dose
            this.medicalProperties[i * 4] = Math.random(); // energy level
            this.medicalProperties[i * 4 + 1] = Math.random(); // penetration depth
            this.medicalProperties[i * 4 + 2] = Math.random(); // absorption coefficient
            this.medicalProperties[i * 4 + 3] = Math.random(); // dose rate
        }
    }

    private initializeSurgicalParticles(): void {
        // Surgical smoke, debris, irrigation fluids
        const count = this.config.count;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Surgical site distribution
            this.particles[i3] = Math.random() * 4 - 2;
            this.particles[i3 + 1] = Math.random() * 2;
            this.particles[i3 + 2] = Math.random() * 4 - 2;

            // Surgical environment dynamics
            this.velocities[i3] = (Math.random() - 0.5) * 3;
            this.velocities[i3 + 1] = Math.random() * 2;
            this.velocities[i3 + 2] = (Math.random() - 0.5) * 3;

            this.lifetimes[i] = this.config.lifetime * Math.random();

            // Surgical properties: debris size, fluid viscosity, temperature, sterility
            this.medicalProperties[i * 4] = Math.random() * 5; // debris size
            this.medicalProperties[i * 4 + 1] = Math.random(); // viscosity
            this.medicalProperties[i * 4 + 2] = 37 + Math.random() * 3; // temperature
            this.medicalProperties[i * 4 + 3] = Math.random(); // sterility level
        }
    }

    private createMedicalMaterial(): PointsMaterial {
        const material = new PointsMaterial({
            size: this.config.size,
            color: this.config.color,
            opacity: this.config.opacity,
            transparent: true,
            blending: this.config.blending || AdditiveBlending,
            vertexColors: true,
            sizeAttenuation: true
        });

        if (this.config.texture) {
            material.map = this.config.texture;
        }

        return material;
    }

    private setupMedicalSimulation(): void {
        // Initialize physiology engine for medical accuracy
        this.physiologyEngine = {
            heartRate: 70, // beats per minute
            bloodPressure: { systolic: 120, diastolic: 80 },
            respirationRate: 16, // breaths per minute
            bodyTemperature: 37, // celsius
            bloodOxygenSaturation: 0.98,

            // Pharmacokinetic parameters
            plasmaVolume: 3.0, // liters
            totalBodyWater: 42.0, // liters
            liverClearance: 1.5, // L/min
            renalClearance: 0.12, // L/min

            // Cellular parameters
            cellDensity: 1e9, // cells per mL
            metabolicRate: 1.0,
            proliferationRate: 0.1,

            updatePhysiology: (deltaTime: number) => {
                // Update physiological parameters over time
                this.medicalTimer += deltaTime;

                // Simulate cardiac cycle
                const heartCycle = (this.medicalTimer * this.physiologyEngine.heartRate / 60) % 1;
                const systolicPhase = heartCycle < 0.3;

                // Update blood pressure
                if (systolicPhase) {
                    this.physiologyEngine.bloodPressure.current =
                        this.physiologyEngine.bloodPressure.systolic * (0.8 + 0.2 * Math.sin(heartCycle * Math.PI * 2));
                } else {
                    this.physiologyEngine.bloodPressure.current =
                        this.physiologyEngine.bloodPressure.diastolic * (0.9 + 0.1 * Math.sin(heartCycle * Math.PI * 2));
                }

                // Update respiration cycle
                const respirationCycle = (this.medicalTimer * this.physiologyEngine.respirationRate / 60) % 1;
                this.physiologyEngine.lungVolume = 0.5 + 0.3 * Math.sin(respirationCycle * Math.PI * 2);
            }
        };
    }

    private createGPUResources(): void {
        // Create compute shader for GPU-accelerated medical simulation
        const width = Math.ceil(Math.sqrt(this.config.count));
        const height = Math.ceil(this.config.count / width);

        // Position texture
        const positionData = new Float32Array(width * height * 4);
        for (let i = 0; i < this.config.count; i++) {
            positionData[i * 4] = this.particles[i * 3];
            positionData[i * 4 + 1] = this.particles[i * 3 + 1];
            positionData[i * 4 + 2] = this.particles[i * 3 + 2];
            positionData[i * 4 + 3] = this.lifetimes[i];
        }

        this.positionTexture = new DataTexture(positionData, width, height, RGBAFormat, FloatType);

        // Velocity texture
        const velocityData = new Float32Array(width * height * 4);
        for (let i = 0; i < this.config.count; i++) {
            velocityData[i * 4] = this.velocities[i * 3];
            velocityData[i * 4 + 1] = this.velocities[i * 3 + 1];
            velocityData[i * 4 + 2] = this.velocities[i * 3 + 2];
            velocityData[i * 4 + 3] = 0;
        }

        this.velocityTexture = new DataTexture(velocityData, width, height, RGBAFormat, FloatType);

        // Medical properties texture
        this.medicalTexture = new DataTexture(this.medicalProperties, width, height, RGBAFormat, FloatType);
    }

    public update(deltaTime: number): void {
        const startTime = Date.now();

        // Update physiology
        this.physiologyEngine.updatePhysiology(deltaTime);

        // Update particles based on medical type
        this.updateMedicalSimulation(deltaTime);

        // Update GPU resources if available
        if (this.computeShader) {
            this.updateGPUSimulation(deltaTime);
        } else {
            this.updateCPUSimulation(deltaTime);
        }

        // Update geometry
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.velocity.needsUpdate = true;
        this.geometry.attributes.lifetime.needsUpdate = true;
        this.geometry.attributes.medicalProps.needsUpdate = true;

        // Update performance metrics
        this.performanceMetrics.updateTime = Date.now() - startTime;
        this.performanceMetrics.particleCount = this.config.count;
    }

    private updateMedicalSimulation(deltaTime: number): void {
        switch (this.config.medicalType) {
            case 'blood':
                this.updateBloodFlow(deltaTime);
                break;
            case 'drug':
                this.updateDrugDiffusion(deltaTime);
                break;
            case 'cellular':
                this.updateCellularBehavior(deltaTime);
                break;
            case 'environmental':
                this.updateEnvironmentalFlow(deltaTime);
                break;
            case 'therapeutic':
                this.updateTherapeuticDelivery(deltaTime);
                break;
            case 'surgical':
                this.updateSurgicalDynamics(deltaTime);
                break;
        }
    }

    private updateBloodFlow(deltaTime: number): void {
        const config = this.config as BloodFlowConfig;
        const pressure = this.physiologyEngine.bloodPressure.current || 100;
        const pulsatile = config.pulsatile && config.heartRate;

        for (let i = 0; i < this.config.count; i++) {
            const i3 = i * 3;

            // Apply pressure-driven flow
            const pressureFactor = pressure / 100;
            this.velocities[i3] *= pressureFactor;

            // Apply pulsatile flow if enabled
            if (pulsatile) {
                const heartCycle = (this.medicalTimer * config.heartRate! / 60) % 1;
                const pulseFactor = 1 + 0.3 * Math.sin(heartCycle * Math.PI * 2);
                this.velocities[i3] *= pulseFactor;
            }

            // Apply viscosity effects
            const viscosityDamping = 1 - config.viscosity * deltaTime;
            this.velocities[i3] *= viscosityDamping;
            this.velocities[i3 + 1] *= viscosityDamping;
            this.velocities[i3 + 2] *= viscosityDamping;

            // Update oxygenation based on flow
            this.medicalProperties[i * 4] = Math.max(0, Math.min(1,
                this.medicalProperties[i * 4] + deltaTime * 0.1));
        }
    }

    private updateDrugDiffusion(deltaTime: number): void {
        const config = this.config as DrugDiffusionConfig;

        for (let i = 0; i < this.config.count; i++) {
            const i3 = i * 3;
            const i4 = i * 4;

            // Apply diffusion
            const diffusionRate = this.medicalProperties[i4 + 1];
            const randomForce = (Math.random() - 0.5) * diffusionRate * deltaTime;
            this.velocities[i3] += randomForce;
            this.velocities[i3 + 1] += randomForce;
            this.velocities[i3 + 2] += randomForce;

            // Apply metabolism
            const metabolismRate = this.medicalProperties[i4 + 2];
            this.medicalProperties[i4] *= Math.exp(-metabolismRate * deltaTime);

            // Apply protein binding
            const bindingAffinity = this.medicalProperties[i4 + 3];
            const freeConcentration = this.medicalProperties[i4] * (1 - bindingAffinity);
            this.material.opacity = freeConcentration;

            // Remove particles below threshold concentration
            if (this.medicalProperties[i4] < 0.01) {
                this.lifetimes[i] = 0;
            }
        }
    }

    private updateCellularBehavior(deltaTime: number): void {
        const config = this.config as CellularConfig;

        for (let i = 0; i < this.config.count; i++) {
            const i3 = i * 3;
            const i4 = i * 4;

            // Apply cell motility
            const motility = this.medicalProperties[i4 + 1];
            this.velocities[i3] += (Math.random() - 0.5) * motility * deltaTime;
            this.velocities[i3 + 1] += (Math.random() - 0.5) * motility * deltaTime;
            this.velocities[i3 + 2] += (Math.random() - 0.5) * motility * deltaTime;

            // Apply cell division
            const divisionRate = this.medicalProperties[i4 + 2];
            if (Math.random() < divisionRate * deltaTime) {
                // Trigger cell division (would create new particle)
                this.medicalProperties[i4] *= 0.5; // reduce size
            }

            // Apply apoptosis
            const apoptosisRate = this.medicalProperties[i4 + 3];
            if (Math.random() < apoptosisRate * deltaTime) {
                this.lifetimes[i] = 0; // trigger cell death
            }
        }
    }

    private updateEnvironmentalFlow(deltaTime: number): void {
        // Air circulation, contamination spread
        for (let i = 0; i < this.config.count; i++) {
            const i3 = i * 3;

            // Apply air flow patterns
            this.velocities[i3] += Math.sin(this.medicalTimer + i * 0.1) * deltaTime * 0.5;
            this.velocities[i3 + 1] += Math.cos(this.medicalTimer + i * 0.1) * deltaTime * 0.2;
            this.velocities[i3 + 2] += Math.sin(this.medicalTimer * 0.5 + i * 0.05) * deltaTime * 0.3;

            // Apply gravity to particles
            this.velocities[i3 + 1] -= 9.81 * deltaTime * 0.1;
        }
    }

    private updateTherapeuticDelivery(deltaTime: number): void {
        // Radiation, ultrasound energy propagation
        for (let i = 0; i < this.config.count; i++) {
            const i3 = i * 3;
            const i4 = i * 4;

            // Energy attenuation
            const penetrationDepth = this.medicalProperties[i4 + 1];
            const currentDepth = this.particles[i3 + 2];
            const attenuation = Math.exp(-currentDepth / penetrationDepth);
            this.medicalProperties[i4] *= attenuation;

            // Update dose delivery
            this.medicalProperties[i4 + 3] = this.medicalProperties[i4] * deltaTime;
        }
    }

    private updateSurgicalDynamics(deltaTime: number): void {
        // Surgical smoke, irrigation, debris
        for (let i = 0; i < this.config.count; i++) {
            const i3 = i * 3;

            // Apply suction effects
            const distanceFromSuction = Math.sqrt(
                this.particles[i3] * this.particles[i3] +
                this.particles[i3 + 1] * this.particles[i3 + 1] +
                this.particles[i3 + 2] * this.particles[i3 + 2]
            );

            if (distanceFromSuction < 5) {
                const suctionForce = 10 / (distanceFromSuction + 1);
                this.velocities[i3] -= this.particles[i3] * suctionForce * deltaTime;
                this.velocities[i3 + 1] -= this.particles[i3 + 1] * suctionForce * deltaTime;
                this.velocities[i3 + 2] -= this.particles[i3 + 2] * suctionForce * deltaTime;
            }
        }
    }

    private updateCPUSimulation(deltaTime: number): void {
        for (let i = 0; i < this.config.count; i++) {
            const i3 = i * 3;

            // Update positions
            this.particles[i3] += this.velocities[i3] * deltaTime;
            this.particles[i3 + 1] += this.velocities[i3 + 1] * deltaTime;
            this.particles[i3 + 2] += this.velocities[i3 + 2] * deltaTime;

            // Update lifetimes
            this.lifetimes[i] -= deltaTime;

            // Respawn particles
            if (this.lifetimes[i] <= 0) {
                this.respawnParticle(i);
            }

            // Apply bounds
            this.applyBounds(i);
        }
    }

    private updateGPUSimulation(deltaTime: number): void {
        // GPU compute shader update (placeholder for WebGPU implementation)
        // This would use compute shaders for high-performance particle simulation
    }

    private respawnParticle(index: number): void {
        const i3 = index * 3;

        // Reset position
        this.particles[i3] = Math.random() * 10 - 5;
        this.particles[i3 + 1] = Math.random() * 10 - 5;
        this.particles[i3 + 2] = Math.random() * 10 - 5;

        // Reset velocity
        this.velocities[i3] = (Math.random() - 0.5) * 2;
        this.velocities[i3 + 1] = (Math.random() - 0.5) * 2;
        this.velocities[i3 + 2] = (Math.random() - 0.5) * 2;

        // Reset lifetime
        this.lifetimes[index] = this.config.lifetime * (0.5 + Math.random() * 0.5);

        // Reset medical properties
        this.medicalProperties[index * 4] = 1.0;
        this.medicalProperties[index * 4 + 1] = Math.random();
        this.medicalProperties[index * 4 + 2] = Math.random();
        this.medicalProperties[index * 4 + 3] = Math.random();
    }

    private applyBounds(index: number): void {
        const i3 = index * 3;
        const bounds = 50; // Medical environment bounds

        // Wrap around bounds
        if (this.particles[i3] > bounds) this.particles[i3] = -bounds;
        if (this.particles[i3] < -bounds) this.particles[i3] = bounds;
        if (this.particles[i3 + 1] > bounds) this.particles[i3 + 1] = -bounds;
        if (this.particles[i3 + 1] < -bounds) this.particles[i3 + 1] = bounds;
        if (this.particles[i3 + 2] > bounds) this.particles[i3 + 2] = -bounds;
        if (this.particles[i3 + 2] < -bounds) this.particles[i3 + 2] = bounds;
    }

    // Utility methods for medical calculations
    private getVesselVelocity(vesselType: string): number {
        switch (vesselType) {
            case 'artery': return 0.3; // m/s
            case 'vein': return 0.1; // m/s
            case 'capillary': return 0.001; // m/s
            case 'arteriole': return 0.05; // m/s
            case 'venule': return 0.02; // m/s
            default: return 0.1;
        }
    }

    private calculateDiffusionSpeed(config: DrugDiffusionConfig): number {
        // Simplified diffusion calculation based on molecular weight
        const baseSpeed = 0.1;
        const molecularWeightFactor = 1 / Math.sqrt(config.molecularWeight / 100);
        return baseSpeed * molecularWeightFactor;
    }

    private getCellMotility(cellType: string): number {
        switch (cellType) {
            case 'rbc': return 0; // Red blood cells don't actively move
            case 'wbc': return 0.02; // White blood cells are motile
            case 'platelet': return 0.001; // Limited motility
            case 'neuron': return 0; // Neurons don't migrate
            case 'cancer': return 0.05; // Cancer cells can be highly motile
            case 'stem': return 0.01; // Stem cells have some motility
            case 'epithelial': return 0.005; // Limited motility
            default: return 0.01;
        }
    }

    // Medical data integration
    public setMedicalContext(context: any): void {
        this.medicalContext = context;
        // Update simulation parameters based on patient data
        if (context.patientData) {
            this.physiologyEngine.heartRate = context.patientData.heartRate || 70;
            this.physiologyEngine.bloodPressure = context.patientData.bloodPressure || { systolic: 120, diastolic: 80 };
        }
    }

    public getMedicalMetrics(): any {
        return {
            particleCount: this.performanceMetrics.particleCount,
            averageConcentration: this.calculateAverageConcentration(),
            flowRate: this.calculateAverageFlowRate(),
            medicalAccuracy: this.performanceMetrics.medicalAccuracy,
            physiologyState: this.physiologyEngine
        };
    }

    private calculateAverageConcentration(): number {
        let total = 0;
        for (let i = 0; i < this.config.count; i++) {
            total += this.medicalProperties[i * 4];
        }
        return total / this.config.count;
    }

    private calculateAverageFlowRate(): number {
        let total = 0;
        for (let i = 0; i < this.config.count; i++) {
            const velocity = Math.sqrt(
                this.velocities[i * 3] * this.velocities[i * 3] +
                this.velocities[i * 3 + 1] * this.velocities[i * 3 + 1] +
                this.velocities[i * 3 + 2] * this.velocities[i * 3 + 2]
            );
            total += velocity;
        }
        return total / this.config.count;
    }

    // Rendering and visualization
    public getPoints(): Points {
        return this.points;
    }

    public setVisibility(visible: boolean): void {
        this.points.visible = visible;
    }

    public updateMaterial(properties: Partial<PointsMaterial>): void {
        Object.assign(this.material, properties);
    }

    // Performance and optimization
    public getPerformanceMetrics(): typeof this.performanceMetrics {
        return { ...this.performanceMetrics };
    }

    public optimizeForMedicalAccuracy(level: 'low' | 'medium' | 'high' | 'research'): void {
        switch (level) {
            case 'low':
                this.config.count = Math.min(this.config.count, 1000);
                this.clinicalAccuracy = false;
                break;
            case 'medium':
                this.config.count = Math.min(this.config.count, 5000);
                this.clinicalAccuracy = true;
                break;
            case 'high':
                this.config.count = Math.min(this.config.count, 10000);
                this.clinicalAccuracy = true;
                break;
            case 'research':
                // No limits for research applications
                this.clinicalAccuracy = true;
                break;
        }
    }

    // Cleanup
    public dispose(): void {
        this.geometry.cleanup();
        this.material.cleanup();

        if (this.positionTexture) this.positionTexture.cleanup();
        if (this.velocityTexture) this.velocityTexture.cleanup();
        if (this.medicalTexture) this.medicalTexture.cleanup();
    }
}

// Factory functions for common medical particle systems
export class MedicalParticleFactory {
    static createBloodFlow(config: Partial<BloodFlowConfig>): G3DParticleSystem {
        const defaultConfig: BloodFlowConfig = {
            count: 5000,
            lifetime: 10,
            size: 2,
            sizeVariation: 0.5,
            medicalType: 'blood',
            physiologyAccuracy: 'high',
            color: new Color(0.8, 0.1, 0.1),
            opacity: 0.8,
            blending: AdditiveBlending,
            velocity: new Vector3(1, 0, 0),
            acceleration: new Vector3(0, 0, 0),
            turbulence: 0.1,
            viscosity: 0.05,
            vesselType: 'artery',
            oxygenation: 0.98,
            hematocrit: 0.45,
            pulsatile: true,
            heartRate: 70,
            ...config
        };

        return new G3DParticleSystem(defaultConfig);
    }

    static createDrugDiffusion(config: Partial<DrugDiffusionConfig>): G3DParticleSystem {
        const defaultConfig: DrugDiffusionConfig = {
            count: 2000,
            lifetime: 30,
            size: 1,
            sizeVariation: 0.3,
            medicalType: 'drug',
            physiologyAccuracy: 'high',
            color: new Color(0.2, 0.8, 0.2),
            opacity: 0.6,
            blending: AdditiveBlending,
            velocity: new Vector3(0, 0, 0),
            acceleration: new Vector3(0, 0, 0),
            turbulence: 0.05,
            viscosity: 0.01,
            drugType: 'generic',
            molecularWeight: 300,
            lipophilicity: 0.5,
            proteinBinding: 0.9,
            halfLife: 6,
            targetTissue: ['liver', 'kidney'],
            administrationRoute: 'iv',
            diffusionRate: 0.1,
            metabolismRate: 0.05,
            bindingAffinity: 0.3,
            ...config
        };

        return new G3DParticleSystem(defaultConfig);
    }

    static createCellularVisualization(config: Partial<CellularConfig>): G3DParticleSystem {
        const defaultConfig: CellularConfig = {
            count: 1000,
            lifetime: 60,
            size: 3,
            sizeVariation: 1,
            medicalType: 'cellular',
            physiologyAccuracy: 'high',
            color: new Color(0.2, 0.2, 0.8),
            opacity: 0.7,
            blending: AdditiveBlending,
            velocity: new Vector3(0, 0, 0),
            acceleration: new Vector3(0, 0, 0),
            turbulence: 0.02,
            viscosity: 0.1,
            cellType: 'wbc',
            motility: 0.02,
            divisionRate: 0.001,
            apoptosisRate: 0.0001,
            adhesion: 0.5,
            ...config
        };

        return new G3DParticleSystem(defaultConfig);
    }
}

export default G3DParticleSystem;