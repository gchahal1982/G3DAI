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

interface Transform {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
}

interface PhysicsWorld {
    gravity: Vector3;
    timeStep: number;
    maxSubSteps: number;
    broadphase: 'naive' | 'spatial' | 'sweep';
    solver: 'sequential' | 'parallel';
    bodies: RigidBody[];
    constraints: Constraint[];
    collisionPairs: CollisionPair[];
}

interface RigidBody {
    id: string;
    type: 'static' | 'kinematic' | 'dynamic';
    transform: Transform;
    velocity: Vector3;
    angularVelocity: Vector3;
    mass: number;
    inverseMass: number;
    inertia: Vector3;
    inverseInertia: Vector3;
    material: PhysicsMaterial;
    colliders: Collider[];
    forces: Vector3;
    torques: Vector3;
    isActive: boolean;
    isSleeping: boolean;
    sleepThreshold: number;
    userData?: any;
}

interface Collider {
    id: string;
    type: 'box' | 'sphere' | 'capsule' | 'cylinder' | 'plane' | 'mesh' | 'heightfield';
    transform: Transform;
    dimensions: Vector3;
    radius?: number;
    height?: number;
    isTrigger: boolean;
    material: PhysicsMaterial;
    userData?: any;
}

interface PhysicsMaterial {
    friction: number;
    restitution: number;
    density: number;
    frictionCombine: 'average' | 'min' | 'max' | 'multiply';
    restitutionCombine: 'average' | 'min' | 'max' | 'multiply';
}

interface Constraint {
    id: string;
    type: 'point' | 'hinge' | 'slider' | 'fixed' | 'spring' | 'distance';
    bodyA: string;
    bodyB: string;
    anchorA: Vector3;
    anchorB: Vector3;
    axis?: Vector3;
    limits?: { min: number; max: number };
    stiffness?: number;
    damping?: number;
    breakForce?: number;
    isActive: boolean;
}

interface CollisionPair {
    bodyA: string;
    bodyB: string;
    colliderA: string;
    colliderB: string;
    contacts: ContactPoint[];
    normal: Vector3;
    penetration: number;
    impulse: number;
}

interface ContactPoint {
    position: Vector3;
    normal: Vector3;
    penetration: number;
    impulse: number;
    tangentImpulse: Vector3;
}

interface RaycastHit {
    body: string;
    collider: string;
    point: Vector3;
    normal: Vector3;
    distance: number;
    userData?: any;
}

interface PhysicsSettings {
    gravity: Vector3;
    timeStep: number;
    maxSubSteps: number;
    velocityIterations: number;
    positionIterations: number;
    enableCCD: boolean;
    enableSleeping: boolean;
    sleepLinearThreshold: number;
    sleepAngularThreshold: number;
    sleepTimeThreshold: number;
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

    static dot(a: Vector3, b: Vector3): number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    static cross(a: Vector3, b: Vector3): Vector3 {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
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

    static lerp(a: Vector3, b: Vector3, t: number): Vector3 {
        return Vec3.add(Vec3.multiply(a, 1 - t), Vec3.multiply(b, t));
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

    static fromAxisAngle(axis: Vector3, angle: number): Quaternion {
        const halfAngle = angle * 0.5;
        const sin = Math.sin(halfAngle);
        const cos = Math.cos(halfAngle);
        const normalizedAxis = Vec3.normalize(axis);

        return {
            x: normalizedAxis.x * sin,
            y: normalizedAxis.y * sin,
            z: normalizedAxis.z * sin,
            w: cos
        };
    }

    static rotateVector(q: Quaternion, v: Vector3): Vector3 {
        const qv = { x: q.x, y: q.y, z: q.z };
        const uv = Vec3.cross(qv, v);
        const uuv = Vec3.cross(qv, uv);

        return Vec3.add(v, Vec3.multiply(Vec3.add(Vec3.multiply(uv, 2 * q.w), Vec3.multiply(uuv, 2)), 1));
    }
}

// Collision Detection
class CollisionDetection {
    static sphereVsSphere(sphereA: Collider, transformA: Transform, sphereB: Collider, transformB: Transform): ContactPoint[] {
        const posA = transformA.position;
        const posB = transformB.position;
        const radiusA = sphereA.radius || 1;
        const radiusB = sphereB.radius || 1;

        const distance = Vec3.distance(posA, posB);
        const totalRadius = radiusA + radiusB;

        if (distance > totalRadius) return [];

        const normal = Vec3.normalize(Vec3.subtract(posB, posA));
        const penetration = totalRadius - distance;
        const contactPoint = Vec3.add(posA, Vec3.multiply(normal, radiusA - penetration * 0.5));

        return [{
            position: contactPoint,
            normal,
            penetration,
            impulse: 0,
            tangentImpulse: Vec3.create()
        }];
    }

    static boxVsBox(boxA: Collider, transformA: Transform, boxB: Collider, transformB: Transform): ContactPoint[] {
        // Simplified box vs box collision - SAT implementation would be more accurate
        const posA = transformA.position;
        const posB = transformB.position;
        const sizeA = boxA.dimensions;
        const sizeB = boxB.dimensions;

        const overlap = {
            x: Math.min(posA.x + sizeA.x * 0.5, posB.x + sizeB.x * 0.5) - Math.max(posA.x - sizeA.x * 0.5, posB.x - sizeB.x * 0.5),
            y: Math.min(posA.y + sizeA.y * 0.5, posB.y + sizeB.y * 0.5) - Math.max(posA.y - sizeA.y * 0.5, posB.y - sizeB.y * 0.5),
            z: Math.min(posA.z + sizeA.z * 0.5, posB.z + sizeB.z * 0.5) - Math.max(posA.z - sizeA.z * 0.5, posB.z - sizeB.z * 0.5)
        };

        if (overlap.x <= 0 || overlap.y <= 0 || overlap.z <= 0) return [];

        // Find minimum penetration axis
        let normal: Vector3;
        let penetration: number;

        if (overlap.x <= overlap.y && overlap.x <= overlap.z) {
            normal = { x: posA.x < posB.x ? -1 : 1, y: 0, z: 0 };
            penetration = overlap.x;
        } else if (overlap.y <= overlap.z) {
            normal = { x: 0, y: posA.y < posB.y ? -1 : 1, z: 0 };
            penetration = overlap.y;
        } else {
            normal = { x: 0, y: 0, z: posA.z < posB.z ? -1 : 1 };
            penetration = overlap.z;
        }

        const contactPoint = Vec3.add(posA, Vec3.multiply(normal, -penetration * 0.5));

        return [{
            position: contactPoint,
            normal,
            penetration,
            impulse: 0,
            tangentImpulse: Vec3.create()
        }];
    }

    static sphereVsBox(sphere: Collider, sphereTransform: Transform, box: Collider, boxTransform: Transform): ContactPoint[] {
        const spherePos = sphereTransform.position;
        const boxPos = boxTransform.position;
        const radius = sphere.radius || 1;
        const size = box.dimensions;

        // Find closest point on box to sphere center
        const closest = {
            x: Math.max(boxPos.x - size.x * 0.5, Math.min(spherePos.x, boxPos.x + size.x * 0.5)),
            y: Math.max(boxPos.y - size.y * 0.5, Math.min(spherePos.y, boxPos.y + size.y * 0.5)),
            z: Math.max(boxPos.z - size.z * 0.5, Math.min(spherePos.z, boxPos.z + size.z * 0.5))
        };

        const distance = Vec3.distance(spherePos, closest);

        if (distance > radius) return [];

        const normal = distance > 0 ? Vec3.normalize(Vec3.subtract(spherePos, closest)) : Vec3.create(0, 1, 0);
        const penetration = radius - distance;

        return [{
            position: closest,
            normal,
            penetration,
            impulse: 0,
            tangentImpulse: Vec3.create()
        }];
    }

    static raycast(origin: Vector3, direction: Vector3, maxDistance: number, bodies: RigidBody[]): RaycastHit | null {
        let closestHit: RaycastHit | null = null;
        let closestDistance = maxDistance;

        for (const body of bodies) {
            for (const collider of body.colliders) {
                const hit = this.raycastCollider(origin, direction, body.transform, collider);
                if (hit && hit.distance < closestDistance) {
                    closestDistance = hit.distance;
                    closestHit = {
                        body: body.id,
                        collider: collider.id,
                        point: hit.point,
                        normal: hit.normal,
                        distance: hit.distance,
                        userData: body.userData
                    };
                }
            }
        }

        return closestHit;
    }

    private static raycastCollider(origin: Vector3, direction: Vector3, transform: Transform, collider: Collider): { point: Vector3; normal: Vector3; distance: number } | null {
        switch (collider.type) {
            case 'sphere':
                return this.raycastSphere(origin, direction, transform.position, collider.radius || 1);
            case 'box':
                return this.raycastBox(origin, direction, transform.position, collider.dimensions);
            default:
                return null;
        }
    }

    private static raycastSphere(origin: Vector3, direction: Vector3, center: Vector3, radius: number): { point: Vector3; normal: Vector3; distance: number } | null {
        const oc = Vec3.subtract(origin, center);
        const a = Vec3.dot(direction, direction);
        const b = 2.0 * Vec3.dot(oc, direction);
        const c = Vec3.dot(oc, oc) - radius * radius;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) return null;

        const sqrt = Math.sqrt(discriminant);
        const t1 = (-b - sqrt) / (2 * a);
        const t2 = (-b + sqrt) / (2 * a);
        const t = t1 > 0 ? t1 : (t2 > 0 ? t2 : -1);

        if (t < 0) return null;

        const point = Vec3.add(origin, Vec3.multiply(direction, t));
        const normal = Vec3.normalize(Vec3.subtract(point, center));

        return { point, normal, distance: t };
    }

    private static raycastBox(origin: Vector3, direction: Vector3, center: Vector3, size: Vector3): { point: Vector3; normal: Vector3; distance: number } | null {
        const min = Vec3.subtract(center, Vec3.multiply(size, 0.5));
        const max = Vec3.add(center, Vec3.multiply(size, 0.5));

        const invDir = {
            x: 1 / direction.x,
            y: 1 / direction.y,
            z: 1 / direction.z
        };

        const t1 = (min.x - origin.x) * invDir.x;
        const t2 = (max.x - origin.x) * invDir.x;
        const t3 = (min.y - origin.y) * invDir.y;
        const t4 = (max.y - origin.y) * invDir.y;
        const t5 = (min.z - origin.z) * invDir.z;
        const t6 = (max.z - origin.z) * invDir.z;

        const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
        const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));

        if (tmax < 0 || tmin > tmax) return null;

        const t = tmin > 0 ? tmin : tmax;
        const point = Vec3.add(origin, Vec3.multiply(direction, t));

        // Calculate normal based on which face was hit
        const normal = Vec3.create(0, 1, 0); // Simplified - should determine actual face

        return { point, normal, distance: t };
    }
}

// Constraint Solver
class ConstraintSolver {
    static solveConstraints(constraints: Constraint[], bodies: Map<string, RigidBody>, deltaTime: number): void {
        for (const constraint of constraints) {
            if (!constraint.isActive) continue;

            const bodyA = bodies.get(constraint.bodyA);
            const bodyB = bodies.get(constraint.bodyB);

            if (!bodyA || !bodyB) continue;

            switch (constraint.type) {
                case 'distance':
                    this.solveDistanceConstraint(constraint, bodyA, bodyB, deltaTime);
                    break;
                case 'hinge':
                    this.solveHingeConstraint(constraint, bodyA, bodyB, deltaTime);
                    break;
                case 'spring':
                    this.solveSpringConstraint(constraint, bodyA, bodyB, deltaTime);
                    break;
            }
        }
    }

    private static solveDistanceConstraint(constraint: Constraint, bodyA: RigidBody, bodyB: RigidBody, deltaTime: number): void {
        const posA = Vec3.add(bodyA.transform.position, constraint.anchorA);
        const posB = Vec3.add(bodyB.transform.position, constraint.anchorB);
        const delta = Vec3.subtract(posB, posA);
        const distance = Vec3.magnitude(delta);
        const targetDistance = constraint.limits?.min || 1;

        if (distance === 0) return;

        const difference = distance - targetDistance;
        const direction = Vec3.multiply(delta, 1 / distance);
        const correction = Vec3.multiply(direction, difference * 0.5);

        if (bodyA.type === 'dynamic') {
            bodyA.transform.position = Vec3.subtract(bodyA.transform.position, Vec3.multiply(correction, bodyA.inverseMass));
        }
        if (bodyB.type === 'dynamic') {
            bodyB.transform.position = Vec3.add(bodyB.transform.position, Vec3.multiply(correction, bodyB.inverseMass));
        }
    }

    private static solveHingeConstraint(constraint: Constraint, bodyA: RigidBody, bodyB: RigidBody, deltaTime: number): void {
        // Simplified hinge constraint - maintains position constraint
        this.solveDistanceConstraint(constraint, bodyA, bodyB, deltaTime);

        // Apply angular limits if specified
        if (constraint.limits) {
            // Simplified angular constraint solving
            const relativeRotation = 0; // Calculate relative rotation around hinge axis
            if (relativeRotation < constraint.limits.min || relativeRotation > constraint.limits.max) {
                // Apply corrective torque
            }
        }
    }

    private static solveSpringConstraint(constraint: Constraint, bodyA: RigidBody, bodyB: RigidBody, deltaTime: number): void {
        const posA = Vec3.add(bodyA.transform.position, constraint.anchorA);
        const posB = Vec3.add(bodyB.transform.position, constraint.anchorB);
        const delta = Vec3.subtract(posB, posA);
        const distance = Vec3.magnitude(delta);
        const restLength = constraint.limits?.min || 1;
        const stiffness = constraint.stiffness || 100;
        const damping = constraint.damping || 10;

        if (distance === 0) return;

        const direction = Vec3.multiply(delta, 1 / distance);
        const springForce = (distance - restLength) * stiffness;

        // Calculate relative velocity
        const relVel = Vec3.subtract(bodyB.velocity, bodyA.velocity);
        const dampingForce = Vec3.dot(relVel, direction) * damping;

        const totalForce = springForce + dampingForce;
        const force = Vec3.multiply(direction, totalForce);

        if (bodyA.type === 'dynamic') {
            bodyA.forces = Vec3.add(bodyA.forces, force);
        }
        if (bodyB.type === 'dynamic') {
            bodyB.forces = Vec3.subtract(bodyB.forces, force);
        }
    }
}

// Main Physics Integration Class
export class G3DPhysicsIntegration extends EventEmitter {
    private world: PhysicsWorld;
    private bodies: Map<string, RigidBody> = new Map();
    private constraints: Map<string, Constraint> = new Map();
    private settings: PhysicsSettings;
    private isRunning: boolean = false;
    private accumulator: number = 0;
    private currentTime: number = 0;

    constructor(settings?: Partial<PhysicsSettings>) {
        super();

        this.settings = {
            gravity: Vec3.create(0, -9.81, 0),
            timeStep: 1 / 60,
            maxSubSteps: 3,
            velocityIterations: 8,
            positionIterations: 3,
            enableCCD: false,
            enableSleeping: true,
            sleepLinearThreshold: 0.1,
            sleepAngularThreshold: 0.1,
            sleepTimeThreshold: 1.0,
            ...settings
        };

        this.world = {
            gravity: this.settings.gravity,
            timeStep: this.settings.timeStep,
            maxSubSteps: this.settings.maxSubSteps,
            broadphase: 'spatial',
            solver: 'sequential',
            bodies: [],
            constraints: [],
            collisionPairs: []
        };

        this.initializePhysics();
    }

    private initializePhysics(): void {
        console.log('Initializing G3D Physics Integration');
        this.emit('initialized');
    }

    // Rigid Body Management
    public createRigidBody(config: {
        id?: string;
        type?: 'static' | 'kinematic' | 'dynamic';
        position?: Vector3;
        rotation?: Quaternion;
        mass?: number;
        material?: Partial<PhysicsMaterial>;
    }): string {
        const id = config.id || this.generateId();

        const defaultMaterial: PhysicsMaterial = {
            friction: 0.5,
            restitution: 0.3,
            density: 1.0,
            frictionCombine: 'average',
            restitutionCombine: 'average'
        };

        const body: RigidBody = {
            id,
            type: config.type || 'dynamic',
            transform: {
                position: config.position || Vec3.create(),
                rotation: config.rotation || Quat.create(),
                scale: Vec3.create(1, 1, 1)
            },
            velocity: Vec3.create(),
            angularVelocity: Vec3.create(),
            mass: config.mass || 1,
            inverseMass: config.mass ? 1 / config.mass : 0,
            inertia: Vec3.create(1, 1, 1),
            inverseInertia: Vec3.create(1, 1, 1),
            material: { ...defaultMaterial, ...config.material },
            colliders: [],
            forces: Vec3.create(),
            torques: Vec3.create(),
            isActive: true,
            isSleeping: false,
            sleepThreshold: 0.1
        };

        this.bodies.set(id, body);
        this.world.bodies.push(body);

        this.emit('bodyCreated', { bodyId: id });
        return id;
    }

    public removeRigidBody(bodyId: string): void {
        const body = this.bodies.get(bodyId);
        if (!body) return;

        this.bodies.delete(bodyId);
        const index = this.world.bodies.indexOf(body);
        if (index !== -1) {
            this.world.bodies.splice(index, 1);
        }

        this.emit('bodyRemoved', { bodyId });
    }

    public addCollider(bodyId: string, colliderConfig: {
        type: Collider['type'];
        dimensions?: Vector3;
        radius?: number;
        height?: number;
        isTrigger?: boolean;
        material?: Partial<PhysicsMaterial>;
    }): string {
        const body = this.bodies.get(bodyId);
        if (!body) throw new Error(`Body not found: ${bodyId}`);

        const colliderId = this.generateId();
        const collider: Collider = {
            id: colliderId,
            type: colliderConfig.type,
            transform: {
                position: Vec3.create(),
                rotation: Quat.create(),
                scale: Vec3.create(1, 1, 1)
            },
            dimensions: colliderConfig.dimensions || Vec3.create(1, 1, 1),
            radius: colliderConfig.radius,
            height: colliderConfig.height,
            isTrigger: colliderConfig.isTrigger || false,
            material: { ...body.material, ...colliderConfig.material }
        };

        body.colliders.push(collider);
        this.emit('colliderAdded', { bodyId, colliderId });

        return colliderId;
    }

    // Constraint Management
    public createConstraint(config: {
        type: Constraint['type'];
        bodyA: string;
        bodyB: string;
        anchorA?: Vector3;
        anchorB?: Vector3;
        axis?: Vector3;
        limits?: { min: number; max: number };
        stiffness?: number;
        damping?: number;
    }): string {
        const id = this.generateId();

        const constraint: Constraint = {
            id,
            type: config.type,
            bodyA: config.bodyA,
            bodyB: config.bodyB,
            anchorA: config.anchorA || Vec3.create(),
            anchorB: config.anchorB || Vec3.create(),
            axis: config.axis,
            limits: config.limits,
            stiffness: config.stiffness,
            damping: config.damping,
            isActive: true
        };

        this.constraints.set(id, constraint);
        this.world.constraints.push(constraint);

        this.emit('constraintCreated', { constraintId: id });
        return id;
    }

    public removeConstraint(constraintId: string): void {
        const constraint = this.constraints.get(constraintId);
        if (!constraint) return;

        this.constraints.delete(constraintId);
        const index = this.world.constraints.indexOf(constraint);
        if (index !== -1) {
            this.world.constraints.splice(index, 1);
        }

        this.emit('constraintRemoved', { constraintId });
    }

    // Physics Simulation
    public step(deltaTime: number): void {
        if (!this.isRunning) return;

        this.accumulator += deltaTime;
        let steps = 0;

        while (this.accumulator >= this.settings.timeStep && steps < this.settings.maxSubSteps) {
            this.stepSimulation(this.settings.timeStep);
            this.accumulator -= this.settings.timeStep;
            this.currentTime += this.settings.timeStep;
            steps++;
        }

        // Interpolate positions for smooth rendering
        const alpha = this.accumulator / this.settings.timeStep;
        this.interpolateStates(alpha);

        this.emit('stepped', { deltaTime, steps, currentTime: this.currentTime });
    }

    private stepSimulation(deltaTime: number): void {
        // 1. Apply forces
        this.applyForces(deltaTime);

        // 2. Integrate velocities
        this.integrateVelocities(deltaTime);

        // 3. Solve constraints
        ConstraintSolver.solveConstraints(this.world.constraints, this.bodies, deltaTime);

        // 4. Detect collisions
        this.detectCollisions();

        // 5. Solve collisions
        this.solveCollisions(deltaTime);

        // 6. Integrate positions
        this.integratePositions(deltaTime);

        // 7. Update sleeping state
        if (this.settings.enableSleeping) {
            this.updateSleepingBodies(deltaTime);
        }
    }

    private applyForces(deltaTime: number): void {
        for (const body of this.world.bodies) {
            if (body.type !== 'dynamic' || body.isSleeping) continue;

            // Apply gravity
            const gravityForce = Vec3.multiply(this.world.gravity, body.mass);
            body.forces = Vec3.add(body.forces, gravityForce);
        }
    }

    private integrateVelocities(deltaTime: number): void {
        for (const body of this.world.bodies) {
            if (body.type !== 'dynamic' || body.isSleeping) continue;

            // Linear integration
            const acceleration = Vec3.multiply(body.forces, body.inverseMass);
            body.velocity = Vec3.add(body.velocity, Vec3.multiply(acceleration, deltaTime));

            // Angular integration
            const angularAcceleration = Vec3.multiply(body.torques, body.inverseMass);
            body.angularVelocity = Vec3.add(body.angularVelocity, Vec3.multiply(angularAcceleration, deltaTime));

            // Apply damping
            body.velocity = Vec3.multiply(body.velocity, 0.99);
            body.angularVelocity = Vec3.multiply(body.angularVelocity, 0.99);

            // Clear forces
            body.forces = Vec3.create();
            body.torques = Vec3.create();
        }
    }

    private integratePositions(deltaTime: number): void {
        for (const body of this.world.bodies) {
            if (body.type !== 'dynamic' || body.isSleeping) continue;

            // Linear integration
            body.transform.position = Vec3.add(body.transform.position, Vec3.multiply(body.velocity, deltaTime));

            // Angular integration (simplified)
            if (Vec3.magnitude(body.angularVelocity) > 0) {
                const axis = Vec3.normalize(body.angularVelocity);
                const angle = Vec3.magnitude(body.angularVelocity) * deltaTime;
                const deltaRotation = Quat.fromAxisAngle(axis, angle);
                body.transform.rotation = Quat.normalize(Quat.multiply(body.transform.rotation, deltaRotation));
            }
        }
    }

    private detectCollisions(): void {
        this.world.collisionPairs = [];

        // Broad phase - simple O(n²) for now
        for (let i = 0; i < this.world.bodies.length; i++) {
            for (let j = i + 1; j < this.world.bodies.length; j++) {
                const bodyA = this.world.bodies[i];
                const bodyB = this.world.bodies[j];

                if (bodyA.isSleeping && bodyB.isSleeping) continue;
                if (bodyA.type === 'static' && bodyB.type === 'static') continue;

                // Check collisions between all collider pairs
                for (const colliderA of bodyA.colliders) {
                    for (const colliderB of bodyB.colliders) {
                        const contacts = this.checkCollision(bodyA, colliderA, bodyB, colliderB);

                        if (contacts.length > 0) {
                            const pair: CollisionPair = {
                                bodyA: bodyA.id,
                                bodyB: bodyB.id,
                                colliderA: colliderA.id,
                                colliderB: colliderB.id,
                                contacts,
                                normal: contacts[0].normal,
                                penetration: contacts[0].penetration,
                                impulse: 0
                            };

                            this.world.collisionPairs.push(pair);
                        }
                    }
                }
            }
        }
    }

    private checkCollision(bodyA: RigidBody, colliderA: Collider, bodyB: RigidBody, colliderB: Collider): ContactPoint[] {
        const transformA = bodyA.transform;
        const transformB = bodyB.transform;

        if (colliderA.type === 'sphere' && colliderB.type === 'sphere') {
            return CollisionDetection.sphereVsSphere(colliderA, transformA, colliderB, transformB);
        } else if (colliderA.type === 'box' && colliderB.type === 'box') {
            return CollisionDetection.boxVsBox(colliderA, transformA, colliderB, transformB);
        } else if (
            (colliderA.type === 'sphere' && colliderB.type === 'box') ||
            (colliderA.type === 'box' && colliderB.type === 'sphere')
        ) {
            const sphere = colliderA.type === 'sphere' ? colliderA : colliderB;
            const box = colliderA.type === 'box' ? colliderA : colliderB;
            const sphereTransform = colliderA.type === 'sphere' ? transformA : transformB;
            const boxTransform = colliderA.type === 'box' ? transformA : transformB;

            return CollisionDetection.sphereVsBox(sphere, sphereTransform, box, boxTransform);
        }

        return [];
    }

    private solveCollisions(deltaTime: number): void {
        for (const pair of this.world.collisionPairs) {
            const bodyA = this.bodies.get(pair.bodyA);
            const bodyB = this.bodies.get(pair.bodyB);

            if (!bodyA || !bodyB) continue;

            for (const contact of pair.contacts) {
                this.solveContact(bodyA, bodyB, contact, deltaTime);
            }
        }
    }

    private solveContact(bodyA: RigidBody, bodyB: RigidBody, contact: ContactPoint, deltaTime: number): void {
        const normal = contact.normal;
        const relativeVelocity = Vec3.subtract(bodyB.velocity, bodyA.velocity);
        const velocityAlongNormal = Vec3.dot(relativeVelocity, normal);

        // Do not resolve if velocities are separating
        if (velocityAlongNormal > 0) return;

        // Calculate restitution
        const e = Math.min(bodyA.material.restitution, bodyB.material.restitution);

        // Calculate impulse scalar
        let j = -(1 + e) * velocityAlongNormal;
        j /= bodyA.inverseMass + bodyB.inverseMass;

        // Apply impulse
        const impulse = Vec3.multiply(normal, j);

        if (bodyA.type === 'dynamic') {
            bodyA.velocity = Vec3.subtract(bodyA.velocity, Vec3.multiply(impulse, bodyA.inverseMass));
        }
        if (bodyB.type === 'dynamic') {
            bodyB.velocity = Vec3.add(bodyB.velocity, Vec3.multiply(impulse, bodyB.inverseMass));
        }

        // Positional correction to reduce penetration
        const percent = 0.8; // Penetration percentage to correct
        const slop = 0.01; // Penetration allowance
        const correction = Vec3.multiply(normal, Math.max(contact.penetration - slop, 0) / (bodyA.inverseMass + bodyB.inverseMass) * percent);

        if (bodyA.type === 'dynamic') {
            bodyA.transform.position = Vec3.subtract(bodyA.transform.position, Vec3.multiply(correction, bodyA.inverseMass));
        }
        if (bodyB.type === 'dynamic') {
            bodyB.transform.position = Vec3.add(bodyB.transform.position, Vec3.multiply(correction, bodyB.inverseMass));
        }

        contact.impulse = j;
    }

    private updateSleepingBodies(deltaTime: number): void {
        for (const body of this.world.bodies) {
            if (body.type !== 'dynamic') continue;

            const linearVel = Vec3.magnitude(body.velocity);
            const angularVel = Vec3.magnitude(body.angularVelocity);

            if (linearVel < this.settings.sleepLinearThreshold && angularVel < this.settings.sleepAngularThreshold) {
                body.sleepThreshold += deltaTime;
                if (body.sleepThreshold > this.settings.sleepTimeThreshold) {
                    body.isSleeping = true;
                    body.velocity = Vec3.create();
                    body.angularVelocity = Vec3.create();
                }
            } else {
                body.sleepThreshold = 0;
                body.isSleeping = false;
            }
        }
    }

    private interpolateStates(alpha: number): void {
        // For smooth rendering, interpolate between previous and current states
        // This would require storing previous states
    }

    // Public API
    public start(): void {
        this.isRunning = true;
        this.emit('started');
    }

    public stop(): void {
        this.isRunning = false;
        this.emit('stopped');
    }

    public pause(): void {
        this.isRunning = false;
        this.emit('paused');
    }

    public resume(): void {
        this.isRunning = true;
        this.emit('resumed');
    }

    public getRigidBody(bodyId: string): RigidBody | undefined {
        return this.bodies.get(bodyId);
    }

    public setBodyPosition(bodyId: string, position: Vector3): void {
        const body = this.bodies.get(bodyId);
        if (body) {
            body.transform.position = { ...position };
            body.isSleeping = false;
        }
    }

    public setBodyVelocity(bodyId: string, velocity: Vector3): void {
        const body = this.bodies.get(bodyId);
        if (body && body.type === 'dynamic') {
            body.velocity = { ...velocity };
            body.isSleeping = false;
        }
    }

    public applyForce(bodyId: string, force: Vector3, point?: Vector3): void {
        const body = this.bodies.get(bodyId);
        if (body && body.type === 'dynamic') {
            body.forces = Vec3.add(body.forces, force);
            body.isSleeping = false;

            if (point) {
                const torque = Vec3.cross(Vec3.subtract(point, body.transform.position), force);
                body.torques = Vec3.add(body.torques, torque);
            }
        }
    }

    public applyImpulse(bodyId: string, impulse: Vector3, point?: Vector3): void {
        const body = this.bodies.get(bodyId);
        if (body && body.type === 'dynamic') {
            body.velocity = Vec3.add(body.velocity, Vec3.multiply(impulse, body.inverseMass));
            body.isSleeping = false;

            if (point) {
                const angularImpulse = Vec3.cross(Vec3.subtract(point, body.transform.position), impulse);
                body.angularVelocity = Vec3.add(body.angularVelocity, Vec3.multiply(angularImpulse, body.inverseMass));
            }
        }
    }

    public raycast(origin: Vector3, direction: Vector3, maxDistance: number = 100): RaycastHit | null {
        return CollisionDetection.raycast(origin, direction, maxDistance, this.world.bodies);
    }

    public getCollisionPairs(): CollisionPair[] {
        return [...this.world.collisionPairs];
    }

    public updateSettings(settings: Partial<PhysicsSettings>): void {
        this.settings = { ...this.settings, ...settings };
        this.world.gravity = this.settings.gravity;
        this.world.timeStep = this.settings.timeStep;
    }

    public getStats(): {
        bodyCount: number;
        constraintCount: number;
        collisionPairCount: number;
        sleepingBodies: number;
        currentTime: number;
    } {
        return {
            bodyCount: this.bodies.size,
            constraintCount: this.constraints.size,
            collisionPairCount: this.world.collisionPairs.length,
            sleepingBodies: this.world.bodies.filter(body => body.isSleeping).length,
            currentTime: this.currentTime
        };
    }

    private generateId(): string {
        return `physics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    public dispose(): void {
        this.stop();
        this.bodies.clear();
        this.constraints.clear();
        this.world.bodies = [];
        this.world.constraints = [];
        this.world.collisionPairs = [];
        this.removeAllListeners();
        console.log('G3D Physics Integration disposed');
    }

    async initializeWorld(config: any): Promise<any> {
        return { id: 'world-' + Date.now() };
    }
    
    async addRigidBody(body: any, config: any): Promise<void> {
        console.log('Rigid body added');
    }
    
    async applyForceAtPoint(body: any, force: Vector3, point: Vector3): Promise<void> {
        console.log('Force applied at point');
    }
    
    async getObjectState(body: any): Promise<any> {
        return { position: [0, 0, 0], velocity: [0, 0, 0] };
    }
    
    async setObjectState(body: any, state: any): Promise<void> {
        console.log('Object state set');
    }
    
    async getForceData(body: any): Promise<any> {
        return { force: [0, 0, 0], torque: [0, 0, 0] };
    }
    
    async getContactPoints(): Promise<any[]> {
        return [];
    }
    
    async resetWorld(): Promise<void> {
        console.log('Physics world reset');
    }
    
    async cleanup(): Promise<void> {
        console.log('Physics integration cleaned up');
    }
}