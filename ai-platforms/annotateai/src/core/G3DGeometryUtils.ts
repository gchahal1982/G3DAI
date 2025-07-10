/**
 * G3D AnnotateAI - Geometry Utils
 * 3D mathematical operations and geometric algorithms
 * Vector math, matrix operations, and geometric primitives
 */

export interface Vector2 {
    x: number;
    y: number;
}

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface Vector4 {
    x: number;
    y: number;
    z: number;
    w: number;
}

export interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

export interface Matrix3 {
    m00: number; m01: number; m02: number;
    m10: number; m11: number; m12: number;
    m20: number; m21: number; m22: number;
}

export interface Matrix4 {
    m00: number; m01: number; m02: number; m03: number;
    m10: number; m11: number; m12: number; m13: number;
    m20: number; m21: number; m22: number; m23: number;
    m30: number; m31: number; m32: number; m33: number;
}

export interface Transform {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
}

export interface Plane {
    normal: Vector3;
    distance: number;
}

export interface Ray {
    origin: Vector3;
    direction: Vector3;
}

export interface BoundingBox {
    min: Vector3;
    max: Vector3;
}

export interface BoundingSphere {
    center: Vector3;
    radius: number;
}

export interface Triangle {
    v0: Vector3;
    v1: Vector3;
    v2: Vector3;
}

export interface Line {
    start: Vector3;
    end: Vector3;
}

export interface Frustum {
    planes: Plane[];
}

export interface IntersectionResult {
    intersects: boolean;
    point?: Vector3;
    distance?: number;
    normal?: Vector3;
    t?: number;
}

export class GeometryUtils {

    // Vector2 operations
    public static vec2Create(x: number = 0, y: number = 0): Vector2 {
        return { x, y };
    }

    public static vec2Add(a: Vector2, b: Vector2): Vector2 {
        return { x: a.x + b.x, y: a.y + b.y };
    }

    public static vec2Subtract(a: Vector2, b: Vector2): Vector2 {
        return { x: a.x - b.x, y: a.y - b.y };
    }

    public static vec2Multiply(a: Vector2, scalar: number): Vector2 {
        return { x: a.x * scalar, y: a.y * scalar };
    }

    public static vec2Dot(a: Vector2, b: Vector2): number {
        return a.x * b.x + a.y * b.y;
    }

    public static vec2Length(v: Vector2): number {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    public static vec2Normalize(v: Vector2): Vector2 {
        const length = this.vec2Length(v);
        if (length === 0) return { x: 0, y: 0 };
        return { x: v.x / length, y: v.y / length };
    }

    public static vec2Distance(a: Vector2, b: Vector2): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public static vec2Lerp(a: Vector2, b: Vector2, t: number): Vector2 {
        return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t
        };
    }

    // Vector3 operations
    public static vec3Create(x: number = 0, y: number = 0, z: number = 0): Vector3 {
        return { x, y, z };
    }

    public static vec3Add(a: Vector3, b: Vector3): Vector3 {
        return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    }

    public static vec3Subtract(a: Vector3, b: Vector3): Vector3 {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    }

    public static vec3Multiply(a: Vector3, scalar: number): Vector3 {
        return { x: a.x * scalar, y: a.y * scalar, z: a.z * scalar };
    }

    public static vec3Divide(a: Vector3, scalar: number): Vector3 {
        if (scalar === 0) return { x: 0, y: 0, z: 0 };
        return { x: a.x / scalar, y: a.y / scalar, z: a.z / scalar };
    }

    public static vec3Dot(a: Vector3, b: Vector3): number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    public static vec3Cross(a: Vector3, b: Vector3): Vector3 {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    }

    public static vec3Length(v: Vector3): number {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    public static vec3LengthSquared(v: Vector3): number {
        return v.x * v.x + v.y * v.y + v.z * v.z;
    }

    public static vec3Normalize(v: Vector3): Vector3 {
        const length = this.vec3Length(v);
        if (length === 0) return { x: 0, y: 0, z: 0 };
        return { x: v.x / length, y: v.y / length, z: v.z / length };
    }

    public static vec3Distance(a: Vector3, b: Vector3): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    public static vec3DistanceSquared(a: Vector3, b: Vector3): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        return dx * dx + dy * dy + dz * dz;
    }

    public static vec3Lerp(a: Vector3, b: Vector3, t: number): Vector3 {
        return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t,
            z: a.z + (b.z - a.z) * t
        };
    }

    public static vec3Reflect(incident: Vector3, normal: Vector3): Vector3 {
        const dot = this.vec3Dot(incident, normal);
        return this.vec3Subtract(incident, this.vec3Multiply(normal, 2 * dot));
    }

    public static vec3Project(a: Vector3, b: Vector3): Vector3 {
        const dot = this.vec3Dot(a, b);
        const lengthSq = this.vec3LengthSquared(b);
        if (lengthSq === 0) return { x: 0, y: 0, z: 0 };
        return this.vec3Multiply(b, dot / lengthSq);
    }

    // Quaternion operations
    public static quatCreate(x: number = 0, y: number = 0, z: number = 0, w: number = 1): Quaternion {
        return { x, y, z, w };
    }

    public static quatFromAxisAngle(axis: Vector3, angle: number): Quaternion {
        const normalizedAxis = this.vec3Normalize(axis);
        const halfAngle = angle * 0.5;
        const sin = Math.sin(halfAngle);
        const cos = Math.cos(halfAngle);

        return {
            x: normalizedAxis.x * sin,
            y: normalizedAxis.y * sin,
            z: normalizedAxis.z * sin,
            w: cos
        };
    }

    public static quatFromEuler(x: number, y: number, z: number): Quaternion {
        const cx = Math.cos(x * 0.5);
        const cy = Math.cos(y * 0.5);
        const cz = Math.cos(z * 0.5);
        const sx = Math.sin(x * 0.5);
        const sy = Math.sin(y * 0.5);
        const sz = Math.sin(z * 0.5);

        return {
            x: sx * cy * cz - cx * sy * sz,
            y: cx * sy * cz + sx * cy * sz,
            z: cx * cy * sz - sx * sy * cz,
            w: cx * cy * cz + sx * sy * sz
        };
    }

    public static quatMultiply(a: Quaternion, b: Quaternion): Quaternion {
        return {
            x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
            y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
            z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
            w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
        };
    }

    public static quatNormalize(q: Quaternion): Quaternion {
        const length = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
        if (length === 0) return { x: 0, y: 0, z: 0, w: 1 };
        return { x: q.x / length, y: q.y / length, z: q.z / length, w: q.w / length };
    }

    public static quatConjugate(q: Quaternion): Quaternion {
        return { x: -q.x, y: -q.y, z: -q.z, w: q.w };
    }

    public static quatRotateVector(q: Quaternion, v: Vector3): Vector3 {
        const qv = { x: q.x, y: q.y, z: q.z };
        const uv = this.vec3Cross(qv, v);
        const uuv = this.vec3Cross(qv, uv);

        return this.vec3Add(v, this.vec3Multiply(this.vec3Add(this.vec3Multiply(uv, 2 * q.w), this.vec3Multiply(uuv, 2)), 1));
    }

    public static quatSlerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
        let dot = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;

        // If the dot product is negative, slerp won't take the shorter path
        let b1 = b;
        if (dot < 0) {
            b1 = { x: -b.x, y: -b.y, z: -b.z, w: -b.w };
            dot = -dot;
        }

        if (dot > 0.9995) {
            // Linear interpolation for very close quaternions
            const result = {
                x: a.x + t * (b1.x - a.x),
                y: a.y + t * (b1.y - a.y),
                z: a.z + t * (b1.z - a.z),
                w: a.w + t * (b1.w - a.w)
            };
            return this.quatNormalize(result);
        }

        const theta0 = Math.acos(Math.abs(dot));
        const theta = theta0 * t;
        const sinTheta = Math.sin(theta);
        const sinTheta0 = Math.sin(theta0);

        const s0 = Math.cos(theta) - dot * sinTheta / sinTheta0;
        const s1 = sinTheta / sinTheta0;

        return {
            x: s0 * a.x + s1 * b1.x,
            y: s0 * a.y + s1 * b1.y,
            z: s0 * a.z + s1 * b1.z,
            w: s0 * a.w + s1 * b1.w
        };
    }

    // Matrix3 operations
    public static mat3Identity(): Matrix3 {
        return {
            m00: 1, m01: 0, m02: 0,
            m10: 0, m11: 1, m12: 0,
            m20: 0, m21: 0, m22: 1
        };
    }

    public static mat3FromQuaternion(q: Quaternion): Matrix3 {
        const x2 = q.x + q.x;
        const y2 = q.y + q.y;
        const z2 = q.z + q.z;
        const xx = q.x * x2;
        const xy = q.x * y2;
        const xz = q.x * z2;
        const yy = q.y * y2;
        const yz = q.y * z2;
        const zz = q.z * z2;
        const wx = q.w * x2;
        const wy = q.w * y2;
        const wz = q.w * z2;

        return {
            m00: 1 - (yy + zz), m01: xy - wz, m02: xz + wy,
            m10: xy + wz, m11: 1 - (xx + zz), m12: yz - wx,
            m20: xz - wy, m21: yz + wx, m22: 1 - (xx + yy)
        };
    }

    public static mat3Multiply(a: Matrix3, b: Matrix3): Matrix3 {
        return {
            m00: a.m00 * b.m00 + a.m01 * b.m10 + a.m02 * b.m20,
            m01: a.m00 * b.m01 + a.m01 * b.m11 + a.m02 * b.m21,
            m02: a.m00 * b.m02 + a.m01 * b.m12 + a.m02 * b.m22,
            m10: a.m10 * b.m00 + a.m11 * b.m10 + a.m12 * b.m20,
            m11: a.m10 * b.m01 + a.m11 * b.m11 + a.m12 * b.m21,
            m12: a.m10 * b.m02 + a.m11 * b.m12 + a.m12 * b.m22,
            m20: a.m20 * b.m00 + a.m21 * b.m10 + a.m22 * b.m20,
            m21: a.m20 * b.m01 + a.m21 * b.m11 + a.m22 * b.m21,
            m22: a.m20 * b.m02 + a.m21 * b.m12 + a.m22 * b.m22
        };
    }

    public static mat3MultiplyVector(m: Matrix3, v: Vector3): Vector3 {
        return {
            x: m.m00 * v.x + m.m01 * v.y + m.m02 * v.z,
            y: m.m10 * v.x + m.m11 * v.y + m.m12 * v.z,
            z: m.m20 * v.x + m.m21 * v.y + m.m22 * v.z
        };
    }

    public static mat3Determinant(m: Matrix3): number {
        return m.m00 * (m.m11 * m.m22 - m.m12 * m.m21) -
            m.m01 * (m.m10 * m.m22 - m.m12 * m.m20) +
            m.m02 * (m.m10 * m.m21 - m.m11 * m.m20);
    }

    public static mat3Inverse(m: Matrix3): Matrix3 | null {
        const det = this.mat3Determinant(m);
        if (Math.abs(det) < 1e-10) return null;

        const invDet = 1 / det;
        return {
            m00: (m.m11 * m.m22 - m.m12 * m.m21) * invDet,
            m01: (m.m02 * m.m21 - m.m01 * m.m22) * invDet,
            m02: (m.m01 * m.m12 - m.m02 * m.m11) * invDet,
            m10: (m.m12 * m.m20 - m.m10 * m.m22) * invDet,
            m11: (m.m00 * m.m22 - m.m02 * m.m20) * invDet,
            m12: (m.m02 * m.m10 - m.m00 * m.m12) * invDet,
            m20: (m.m10 * m.m21 - m.m11 * m.m20) * invDet,
            m21: (m.m01 * m.m20 - m.m00 * m.m21) * invDet,
            m22: (m.m00 * m.m11 - m.m01 * m.m10) * invDet
        };
    }

    public static mat3Transpose(m: Matrix3): Matrix3 {
        return {
            m00: m.m00, m01: m.m10, m02: m.m20,
            m10: m.m01, m11: m.m11, m12: m.m21,
            m20: m.m02, m21: m.m12, m22: m.m22
        };
    }

    // Matrix4 operations
    public static mat4Identity(): Matrix4 {
        return {
            m00: 1, m01: 0, m02: 0, m03: 0,
            m10: 0, m11: 1, m12: 0, m13: 0,
            m20: 0, m21: 0, m22: 1, m23: 0,
            m30: 0, m31: 0, m32: 0, m33: 1
        };
    }

    public static mat4FromTransform(transform: Transform): Matrix4 {
        const rotMatrix = this.mat3FromQuaternion(transform.rotation);
        const { position, scale } = transform;

        return {
            m00: rotMatrix.m00 * scale.x, m01: rotMatrix.m01 * scale.y, m02: rotMatrix.m02 * scale.z, m03: position.x,
            m10: rotMatrix.m10 * scale.x, m11: rotMatrix.m11 * scale.y, m12: rotMatrix.m12 * scale.z, m13: position.y,
            m20: rotMatrix.m20 * scale.x, m21: rotMatrix.m21 * scale.y, m22: rotMatrix.m22 * scale.z, m23: position.z,
            m30: 0, m31: 0, m32: 0, m33: 1
        };
    }

    public static mat4Multiply(a: Matrix4, b: Matrix4): Matrix4 {
        return {
            m00: a.m00 * b.m00 + a.m01 * b.m10 + a.m02 * b.m20 + a.m03 * b.m30,
            m01: a.m00 * b.m01 + a.m01 * b.m11 + a.m02 * b.m21 + a.m03 * b.m31,
            m02: a.m00 * b.m02 + a.m01 * b.m12 + a.m02 * b.m22 + a.m03 * b.m32,
            m03: a.m00 * b.m03 + a.m01 * b.m13 + a.m02 * b.m23 + a.m03 * b.m33,
            m10: a.m10 * b.m00 + a.m11 * b.m10 + a.m12 * b.m20 + a.m13 * b.m30,
            m11: a.m10 * b.m01 + a.m11 * b.m11 + a.m12 * b.m21 + a.m13 * b.m31,
            m12: a.m10 * b.m02 + a.m11 * b.m12 + a.m12 * b.m22 + a.m13 * b.m32,
            m13: a.m10 * b.m03 + a.m11 * b.m13 + a.m12 * b.m23 + a.m13 * b.m33,
            m20: a.m20 * b.m00 + a.m21 * b.m10 + a.m22 * b.m20 + a.m23 * b.m30,
            m21: a.m20 * b.m01 + a.m21 * b.m11 + a.m22 * b.m21 + a.m23 * b.m31,
            m22: a.m20 * b.m02 + a.m21 * b.m12 + a.m22 * b.m22 + a.m23 * b.m32,
            m23: a.m20 * b.m03 + a.m21 * b.m13 + a.m22 * b.m23 + a.m23 * b.m33,
            m30: a.m30 * b.m00 + a.m31 * b.m10 + a.m32 * b.m20 + a.m33 * b.m30,
            m31: a.m30 * b.m01 + a.m31 * b.m11 + a.m32 * b.m21 + a.m33 * b.m31,
            m32: a.m30 * b.m02 + a.m31 * b.m12 + a.m32 * b.m22 + a.m33 * b.m32,
            m33: a.m30 * b.m03 + a.m31 * b.m13 + a.m32 * b.m23 + a.m33 * b.m33
        };
    }

    public static mat4MultiplyVector(m: Matrix4, v: Vector4): Vector4 {
        return {
            x: m.m00 * v.x + m.m01 * v.y + m.m02 * v.z + m.m03 * v.w,
            y: m.m10 * v.x + m.m11 * v.y + m.m12 * v.z + m.m13 * v.w,
            z: m.m20 * v.x + m.m21 * v.y + m.m22 * v.z + m.m23 * v.w,
            w: m.m30 * v.x + m.m31 * v.y + m.m32 * v.z + m.m33 * v.w
        };
    }

    public static mat4Perspective(fov: number, aspect: number, near: number, far: number): Matrix4 {
        const f = 1 / Math.tan(fov * 0.5);
        const nf = 1 / (near - far);

        return {
            m00: f / aspect, m01: 0, m02: 0, m03: 0,
            m10: 0, m11: f, m12: 0, m13: 0,
            m20: 0, m21: 0, m22: (far + near) * nf, m23: 2 * far * near * nf,
            m30: 0, m31: 0, m32: -1, m33: 0
        };
    }

    public static mat4LookAt(eye: Vector3, target: Vector3, up: Vector3): Matrix4 {
        const zAxis = this.vec3Normalize(this.vec3Subtract(eye, target));
        const xAxis = this.vec3Normalize(this.vec3Cross(up, zAxis));
        const yAxis = this.vec3Cross(zAxis, xAxis);

        return {
            m00: xAxis.x, m01: yAxis.x, m02: zAxis.x, m03: eye.x,
            m10: xAxis.y, m11: yAxis.y, m12: zAxis.y, m13: eye.y,
            m20: xAxis.z, m21: yAxis.z, m22: zAxis.z, m23: eye.z,
            m30: 0, m31: 0, m32: 0, m33: 1
        };
    }

    // Geometric primitives and intersections
    public static createBoundingBox(min: Vector3, max: Vector3): BoundingBox {
        return { min, max };
    }

    public static createBoundingSphere(center: Vector3, radius: number): BoundingSphere {
        return { center, radius };
    }

    public static createPlane(normal: Vector3, distance: number): Plane {
        return { normal: this.vec3Normalize(normal), distance };
    }

    public static createRay(origin: Vector3, direction: Vector3): Ray {
        return { origin, direction: this.vec3Normalize(direction) };
    }

    public static createTriangle(v0: Vector3, v1: Vector3, v2: Vector3): Triangle {
        return { v0, v1, v2 };
    }

    // Intersection tests
    public static rayIntersectSphere(ray: Ray, sphere: BoundingSphere): IntersectionResult {
        const oc = this.vec3Subtract(ray.origin, sphere.center);
        const a = this.vec3Dot(ray.direction, ray.direction);
        const b = 2 * this.vec3Dot(oc, ray.direction);
        const c = this.vec3Dot(oc, oc) - sphere.radius * sphere.radius;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return { intersects: false };
        }

        const sqrt = Math.sqrt(discriminant);
        const t1 = (-b - sqrt) / (2 * a);
        const t2 = (-b + sqrt) / (2 * a);
        const t = t1 >= 0 ? t1 : t2;

        if (t < 0) {
            return { intersects: false };
        }

        const point = this.vec3Add(ray.origin, this.vec3Multiply(ray.direction, t));
        const normal = this.vec3Normalize(this.vec3Subtract(point, sphere.center));

        return {
            intersects: true,
            point,
            distance: t,
            normal,
            t
        };
    }

    public static rayIntersectPlane(ray: Ray, plane: Plane): IntersectionResult {
        const denom = this.vec3Dot(plane.normal, ray.direction);

        if (Math.abs(denom) < 1e-6) {
            return { intersects: false }; // Ray is parallel to plane
        }

        const t = -(this.vec3Dot(plane.normal, ray.origin) + plane.distance) / denom;

        if (t < 0) {
            return { intersects: false }; // Intersection behind ray origin
        }

        const point = this.vec3Add(ray.origin, this.vec3Multiply(ray.direction, t));

        return {
            intersects: true,
            point,
            distance: t,
            normal: plane.normal,
            t
        };
    }

    public static rayIntersectTriangle(ray: Ray, triangle: Triangle): IntersectionResult {
        const edge1 = this.vec3Subtract(triangle.v1, triangle.v0);
        const edge2 = this.vec3Subtract(triangle.v2, triangle.v0);
        const h = this.vec3Cross(ray.direction, edge2);
        const a = this.vec3Dot(edge1, h);

        if (a > -1e-6 && a < 1e-6) {
            return { intersects: false }; // Ray is parallel to triangle
        }

        const f = 1 / a;
        const s = this.vec3Subtract(ray.origin, triangle.v0);
        const u = f * this.vec3Dot(s, h);

        if (u < 0 || u > 1) {
            return { intersects: false };
        }

        const q = this.vec3Cross(s, edge1);
        const v = f * this.vec3Dot(ray.direction, q);

        if (v < 0 || u + v > 1) {
            return { intersects: false };
        }

        const t = f * this.vec3Dot(edge2, q);

        if (t < 1e-6) {
            return { intersects: false };
        }

        const point = this.vec3Add(ray.origin, this.vec3Multiply(ray.direction, t));
        const normal = this.vec3Normalize(this.vec3Cross(edge1, edge2));

        return {
            intersects: true,
            point,
            distance: t,
            normal,
            t
        };
    }

    public static rayIntersectBoundingBox(ray: Ray, bbox: BoundingBox): IntersectionResult {
        let tMin = 0;
        let tMax = Infinity;

        for (let i = 0; i < 3; i++) {
            const axis = i === 0 ? 'x' : i === 1 ? 'y' : 'z';
            const rayDir = ray.direction[axis];
            const rayOrigin = ray.origin[axis];
            const boxMin = bbox.min[axis];
            const boxMax = bbox.max[axis];

            if (Math.abs(rayDir) < 1e-6) {
                if (rayOrigin < boxMin || rayOrigin > boxMax) {
                    return { intersects: false };
                }
            } else {
                const t1 = (boxMin - rayOrigin) / rayDir;
                const t2 = (boxMax - rayOrigin) / rayDir;

                const tNear = Math.min(t1, t2);
                const tFar = Math.max(t1, t2);

                tMin = Math.max(tMin, tNear);
                tMax = Math.min(tMax, tFar);

                if (tMin > tMax) {
                    return { intersects: false };
                }
            }
        }

        if (tMin < 0) {
            return { intersects: false };
        }

        const point = this.vec3Add(ray.origin, this.vec3Multiply(ray.direction, tMin));

        return {
            intersects: true,
            point,
            distance: tMin,
            t: tMin
        };
    }

    // Distance calculations
    public static pointToPlaneDistance(point: Vector3, plane: Plane): number {
        return this.vec3Dot(plane.normal, point) + plane.distance;
    }

    public static pointToLineDistance(point: Vector3, line: Line): number {
        const lineVec = this.vec3Subtract(line.end, line.start);
        const pointVec = this.vec3Subtract(point, line.start);
        const lineLength = this.vec3Length(lineVec);

        if (lineLength === 0) {
            return this.vec3Distance(point, line.start);
        }

        const t = Math.max(0, Math.min(1, this.vec3Dot(pointVec, lineVec) / (lineLength * lineLength)));
        const projection = this.vec3Add(line.start, this.vec3Multiply(lineVec, t));

        return this.vec3Distance(point, projection);
    }

    // Bounding volume operations
    public static expandBoundingBox(bbox: BoundingBox, point: Vector3): BoundingBox {
        return {
            min: {
                x: Math.min(bbox.min.x, point.x),
                y: Math.min(bbox.min.y, point.y),
                z: Math.min(bbox.min.z, point.z)
            },
            max: {
                x: Math.max(bbox.max.x, point.x),
                y: Math.max(bbox.max.y, point.y),
                z: Math.max(bbox.max.z, point.z)
            }
        };
    }

    public static mergeBoundingBoxes(a: BoundingBox, b: BoundingBox): BoundingBox {
        return {
            min: {
                x: Math.min(a.min.x, b.min.x),
                y: Math.min(a.min.y, b.min.y),
                z: Math.min(a.min.z, b.min.z)
            },
            max: {
                x: Math.max(a.max.x, b.max.x),
                y: Math.max(a.max.y, b.max.y),
                z: Math.max(a.max.z, b.max.z)
            }
        };
    }

    public static boundingBoxContainsPoint(bbox: BoundingBox, point: Vector3): boolean {
        return point.x >= bbox.min.x && point.x <= bbox.max.x &&
            point.y >= bbox.min.y && point.y <= bbox.max.y &&
            point.z >= bbox.min.z && point.z <= bbox.max.z;
    }

    public static boundingBoxIntersects(a: BoundingBox, b: BoundingBox): boolean {
        return a.min.x <= b.max.x && a.max.x >= b.min.x &&
            a.min.y <= b.max.y && a.max.y >= b.min.y &&
            a.min.z <= b.max.z && a.max.z >= b.min.z;
    }

    public static boundingSphereContainsPoint(sphere: BoundingSphere, point: Vector3): boolean {
        return this.vec3DistanceSquared(sphere.center, point) <= sphere.radius * sphere.radius;
    }

    public static boundingSphereIntersects(a: BoundingSphere, b: BoundingSphere): boolean {
        const distance = this.vec3Distance(a.center, b.center);
        return distance <= a.radius + b.radius;
    }

    // Geometric calculations
    public static triangleArea(triangle: Triangle): number {
        const edge1 = this.vec3Subtract(triangle.v1, triangle.v0);
        const edge2 = this.vec3Subtract(triangle.v2, triangle.v0);
        const cross = this.vec3Cross(edge1, edge2);
        return this.vec3Length(cross) * 0.5;
    }

    public static triangleNormal(triangle: Triangle): Vector3 {
        const edge1 = this.vec3Subtract(triangle.v1, triangle.v0);
        const edge2 = this.vec3Subtract(triangle.v2, triangle.v0);
        return this.vec3Normalize(this.vec3Cross(edge1, edge2));
    }

    public static triangleBarycentric(triangle: Triangle, point: Vector3): Vector3 {
        const v0 = this.vec3Subtract(triangle.v2, triangle.v0);
        const v1 = this.vec3Subtract(triangle.v1, triangle.v0);
        const v2 = this.vec3Subtract(point, triangle.v0);

        const dot00 = this.vec3Dot(v0, v0);
        const dot01 = this.vec3Dot(v0, v1);
        const dot02 = this.vec3Dot(v0, v2);
        const dot11 = this.vec3Dot(v1, v1);
        const dot12 = this.vec3Dot(v1, v2);

        const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

        return { x: 1 - u - v, y: v, z: u };
    }

    // Utility functions
    public static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    public static lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    public static smoothstep(edge0: number, edge1: number, x: number): number {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    }

    public static radiansToDegrees(radians: number): number {
        return radians * (180 / Math.PI);
    }

    public static degreesToRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    public static isPowerOfTwo(value: number): boolean {
        return (value & (value - 1)) === 0 && value !== 0;
    }

    public static nextPowerOfTwo(value: number): number {
        let result = 1;
        while (result < value) {
            result *= 2;
        }
        return result;
    }

    // Random utilities
    public static randomFloat(min: number = 0, max: number = 1): number {
        return min + Math.random() * (max - min);
    }

    public static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public static randomVector3(min: number = -1, max: number = 1): Vector3 {
        return {
            x: this.randomFloat(min, max),
            y: this.randomFloat(min, max),
            z: this.randomFloat(min, max)
        };
    }

    public static randomUnitVector3(): Vector3 {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        return {
            x: Math.sin(phi) * Math.cos(theta),
            y: Math.sin(phi) * Math.sin(theta),
            z: Math.cos(phi)
        };
    }
}

export default GeometryUtils;