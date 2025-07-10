/**
 * G3D Geometry Processor - Complex geometry handling and optimization
 * Provides advanced geometry processing, tessellation, and optimization
 */

import { vec3, vec4, mat4 } from 'gl-matrix';

// Geometry types
export enum G3DGeometryType {
    TRIANGLES = 'triangles',
    LINES = 'lines',
    POINTS = 'points',
    TRIANGLE_STRIP = 'triangle_strip',
    LINE_STRIP = 'line_strip'
}

// Vertex attribute types
export interface G3DVertexAttribute {
    name: string;
    size: number;  // Components per vertex (1-4)
    type: 'float' | 'int' | 'uint';
    normalized: boolean;
    offset: number;
    stride: number;
}

// Geometry data interface
export interface G3DGeometry {
    id: string;
    type: G3DGeometryType;
    vertices: Float32Array;
    indices?: Uint16Array | Uint32Array;
    attributes: Map<string, G3DVertexAttribute>;
    boundingBox: G3DBoundingBox;
    boundingSphere: G3DBoundingSphere;
    vertexCount: number;
    indexCount: number;
    needsUpdate: boolean;
}

// Bounding volumes
export interface G3DBoundingBox {
    min: vec3;
    max: vec3;
    center: vec3;
    size: vec3;
}

export interface G3DBoundingSphere {
    center: vec3;
    radius: number;
}

// Geometry builder options
export interface G3DGeometryOptions {
    computeNormals?: boolean;
    computeTangents?: boolean;
    computeBounds?: boolean;
    optimizeForGPU?: boolean;
    mergeVertices?: boolean;
    weldThreshold?: number;
}

// Main G3D Geometry Processor Class
export class G3DGeometryProcessor {
    private geometries: Map<string, G3DGeometry> = new Map();
    private vertexCache: Map<string, number> = new Map();

    // Primitive geometry creators

    createBox(width: number, height: number, depth: number, options?: G3DGeometryOptions): G3DGeometry {
        const hw = width / 2;
        const hh = height / 2;
        const hd = depth / 2;

        // Vertices for a box (24 vertices for proper normals)
        const positions = new Float32Array([
            // Front face
            -hw, -hh, hd, hw, -hh, hd, hw, hh, hd, -hw, hh, hd,
            // Back face
            -hw, -hh, -hd, -hw, hh, -hd, hw, hh, -hd, hw, -hh, -hd,
            // Top face
            -hw, hh, -hd, -hw, hh, hd, hw, hh, hd, hw, hh, -hd,
            // Bottom face
            -hw, -hh, -hd, hw, -hh, -hd, hw, -hh, hd, -hw, -hh, hd,
            // Right face
            hw, -hh, -hd, hw, hh, -hd, hw, hh, hd, hw, -hh, hd,
            // Left face
            -hw, -hh, -hd, -hw, -hh, hd, -hw, hh, hd, -hw, hh, -hd
        ]);

        // Normals
        const normals = new Float32Array([
            // Front face
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            // Back face
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
            // Top face
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
            // Bottom face
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
            // Right face
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            // Left face
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
        ]);

        // UVs
        const uvs = new Float32Array([
            // Front face
            0, 0, 1, 0, 1, 1, 0, 1,
            // Back face
            1, 0, 1, 1, 0, 1, 0, 0,
            // Top face
            0, 1, 0, 0, 1, 0, 1, 1,
            // Bottom face
            1, 1, 0, 1, 0, 0, 1, 0,
            // Right face
            1, 0, 1, 1, 0, 1, 0, 0,
            // Left face
            0, 0, 1, 0, 1, 1, 0, 1
        ]);

        // Indices
        const indices = new Uint16Array([
            0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // back
            8, 9, 10, 8, 10, 11,   // top
            12, 13, 14, 12, 14, 15,   // bottom
            16, 17, 18, 16, 18, 19,   // right
            20, 21, 22, 20, 22, 23    // left
        ]);

        // Create geometry
        const geometry = this.createGeometry(positions, indices, {
            position: { name: 'position', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 },
            normal: { name: 'normal', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 },
            uv: { name: 'uv', size: 2, type: 'float', normalized: false, offset: 0, stride: 0 }
        });

        // Set additional attributes
        this.setAttribute(geometry, 'normal', normals);
        this.setAttribute(geometry, 'uv', uvs);

        if (options?.computeTangents) {
            this.computeTangents(geometry);
        }

        return geometry;
    }

    createSphere(radius: number, widthSegments: number = 32, heightSegments: number = 16, options?: G3DGeometryOptions): G3DGeometry {
        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        // Generate vertices
        for (let y = 0; y <= heightSegments; y++) {
            const v = y / heightSegments;
            const phi = v * Math.PI;

            for (let x = 0; x <= widthSegments; x++) {
                const u = x / widthSegments;
                const theta = u * Math.PI * 2;

                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);

                const nx = cosTheta * sinPhi;
                const ny = cosPhi;
                const nz = sinTheta * sinPhi;

                positions.push(radius * nx, radius * ny, radius * nz);
                normals.push(nx, ny, nz);
                uvs.push(u, v);
            }
        }

        // Generate indices
        for (let y = 0; y < heightSegments; y++) {
            for (let x = 0; x < widthSegments; x++) {
                const a = y * (widthSegments + 1) + x;
                const b = a + widthSegments + 1;

                indices.push(a, b, a + 1);
                indices.push(b, b + 1, a + 1);
            }
        }

        const geometry = this.createGeometry(
            new Float32Array(positions),
            new Uint16Array(indices),
            {
                position: { name: 'position', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 },
                normal: { name: 'normal', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 },
                uv: { name: 'uv', size: 2, type: 'float', normalized: false, offset: 0, stride: 0 }
            }
        );

        this.setAttribute(geometry, 'normal', new Float32Array(normals));
        this.setAttribute(geometry, 'uv', new Float32Array(uvs));

        if (options?.computeTangents) {
            this.computeTangents(geometry);
        }

        return geometry;
    }

    createPlane(width: number, height: number, widthSegments: number = 1, heightSegments: number = 1, options?: G3DGeometryOptions): G3DGeometry {
        const hw = width / 2;
        const hh = height / 2;

        const gridX = widthSegments;
        const gridY = heightSegments;
        const gridX1 = gridX + 1;
        const gridY1 = gridY + 1;

        const segmentWidth = width / gridX;
        const segmentHeight = height / gridY;

        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        // Generate vertices
        for (let iy = 0; iy < gridY1; iy++) {
            const y = iy * segmentHeight - hh;

            for (let ix = 0; ix < gridX1; ix++) {
                const x = ix * segmentWidth - hw;

                positions.push(x, 0, -y);
                normals.push(0, 1, 0);
                uvs.push(ix / gridX, iy / gridY);
            }
        }

        // Generate indices
        for (let iy = 0; iy < gridY; iy++) {
            for (let ix = 0; ix < gridX; ix++) {
                const a = ix + gridX1 * iy;
                const b = ix + gridX1 * (iy + 1);
                const c = (ix + 1) + gridX1 * (iy + 1);
                const d = (ix + 1) + gridX1 * iy;

                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        const geometry = this.createGeometry(
            new Float32Array(positions),
            new Uint16Array(indices),
            {
                position: { name: 'position', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 },
                normal: { name: 'normal', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 },
                uv: { name: 'uv', size: 2, type: 'float', normalized: false, offset: 0, stride: 0 }
            }
        );

        this.setAttribute(geometry, 'normal', new Float32Array(normals));
        this.setAttribute(geometry, 'uv', new Float32Array(uvs));

        if (options?.computeTangents) {
            this.computeTangents(geometry);
        }

        return geometry;
    }

    /**
     * Create a grid geometry
     */
    createGrid(params: { size?: number; divisions?: number; color1?: any; color2?: any } = {}): G3DGeometry {
        const size = params.size || 10;
        const divisions = params.divisions || 10;
        const step = size / divisions;
        const halfSize = size / 2;

        const positions: number[] = [];
        const colors: number[] = [];

        const color1 = params.color1 || { r: 0.5, g: 0.5, b: 0.5, a: 1 };
        const color2 = params.color2 || { r: 0.3, g: 0.3, b: 0.3, a: 1 };

        // Create grid lines
        for (let i = 0; i <= divisions; i++) {
            const position = i * step - halfSize;
            const color = i === Math.floor(divisions / 2) ? color1 : color2;

            // Horizontal lines
            positions.push(-halfSize, 0, position, halfSize, 0, position);
            colors.push(color.r, color.g, color.b, color.a, color.r, color.g, color.b, color.a);

            // Vertical lines
            positions.push(position, 0, -halfSize, position, 0, halfSize);
            colors.push(color.r, color.g, color.b, color.a, color.r, color.g, color.b, color.a);
        }

        const geometry = this.createGeometry(
            new Float32Array(positions),
            undefined,
            {
                position: { name: 'position', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 },
                color: { name: 'color', size: 4, type: 'float', normalized: false, offset: 0, stride: 0 }
            }
        );

        geometry.type = G3DGeometryType.LINES;
        this.setAttribute(geometry, 'color', new Float32Array(colors));

        return geometry;
    }

    /**
     * Create point cloud geometry
     */
    createPointCloud(data: { points: Float32Array; colors?: Float32Array; normals?: Float32Array; count: number }): G3DGeometry {
        const geometry = this.createGeometry(
            data.points,
            undefined,
            {
                position: { name: 'position', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 }
            }
        );

        geometry.type = G3DGeometryType.POINTS;

        if (data.colors) {
            geometry.attributes.set('color', { name: 'color', size: 4, type: 'float', normalized: false, offset: 0, stride: 0 });
            this.setAttribute(geometry, 'color', data.colors);
        }

        if (data.normals) {
            geometry.attributes.set('normal', { name: 'normal', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 });
            this.setAttribute(geometry, 'normal', data.normals);
        }

        // Store point cloud specific data
        (geometry as any).userData = {
            pointCount: data.count,
            isPointCloud: true
        };

        return geometry;
    }

    /**
     * Create tube geometry from curve
     */
    createTubeFromCurve(curve: any, params: { radius?: number; segments?: number } = {}): G3DGeometry {
        const radius = params.radius || 0.1;
        const segments = params.segments || 8;

        const positions: number[] = [];
        const indices: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];

        // Get curve points - simplified curve handling
        const curvePoints = curve.getPoints ? curve.getPoints(50) : [
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0, z: 0 }
        ];

        // Generate vertices along curve
        for (let i = 0; i < curvePoints.length; i++) {
            const point = curvePoints[i];
            const t = i / (curvePoints.length - 1);
            
            // Create ring of vertices around each point
            for (let j = 0; j < segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                const x = point.x + Math.cos(angle) * radius;
                const y = point.y + Math.sin(angle) * radius;
                const z = point.z;

                positions.push(x, y, z);
                normals.push(Math.cos(angle), Math.sin(angle), 0);
                uvs.push(j / segments, t);
            }
        }

        // Generate indices
        for (let i = 0; i < curvePoints.length - 1; i++) {
            for (let j = 0; j < segments; j++) {
                const current = i * segments + j;
                const next = current + segments;
                const nextJ = (j + 1) % segments;

                indices.push(current, next, current + nextJ);
                indices.push(next, next + nextJ, current + nextJ);
            }
        }

        const geometry = this.createGeometry(
            new Float32Array(positions),
            new Uint32Array(indices),
            {
                position: { name: 'position', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 },
                normal: { name: 'normal', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 },
                uv: { name: 'uv', size: 2, type: 'float', normalized: false, offset: 0, stride: 0 }
            }
        );

        this.setAttribute(geometry, 'normal', new Float32Array(normals));
        this.setAttribute(geometry, 'uv', new Float32Array(uvs));

        return geometry;
    }

    /**
     * Create wireframe geometry from existing geometry
     */
    createWireframe(geometry: G3DGeometry): G3DGeometry {
        if (!geometry.indices) {
            throw new Error('Cannot create wireframe from geometry without indices');
        }

        const wireframeIndices: number[] = [];
        const indices = geometry.indices;

        // Convert triangles to lines
        for (let i = 0; i < indices.length; i += 3) {
            const a = indices[i];
            const b = indices[i + 1];
            const c = indices[i + 2];

            // Add three edges of the triangle
            wireframeIndices.push(a, b, b, c, c, a);
        }

        const wireframe = this.createGeometry(
            geometry.vertices,
            new Uint32Array(wireframeIndices),
            {
                position: { name: 'position', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 }
            }
        );

        wireframe.type = G3DGeometryType.LINES;

        // Copy other attributes if they exist
        const normals = this.getAttribute(geometry, 'normal');
        if (normals) {
            wireframe.attributes.set('normal', geometry.attributes.get('normal')!);
            this.setAttribute(wireframe, 'normal', normals);
        }

        const uvs = this.getAttribute(geometry, 'uv');
        if (uvs) {
            wireframe.attributes.set('uv', geometry.attributes.get('uv')!);
            this.setAttribute(wireframe, 'uv', uvs);
        }

        return wireframe;
    }

    /**
     * Create line geometry
     */
    createLine(start: { x: number; y: number; z: number }, end: { x: number; y: number; z: number }): G3DGeometry {
        const positions = new Float32Array([
            start.x, start.y, start.z,
            end.x, end.y, end.z
        ]);

        const geometry = this.createGeometry(
            positions,
            undefined,
            {
                position: { name: 'position', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 }
            }
        );

        geometry.type = G3DGeometryType.LINES;
        return geometry;
    }

    /**
     * Create geometry from arrays
     */
    createFromArrays(vertices: Float32Array, indices: Uint32Array, normals?: Float32Array, uvs?: Float32Array): G3DGeometry {
        const attributes: Record<string, G3DVertexAttribute> = {
            position: { name: 'position', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 }
        };

        if (normals) {
            attributes.normal = { name: 'normal', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 };
        }

        if (uvs) {
            attributes.uv = { name: 'uv', size: 2, type: 'float', normalized: false, offset: 0, stride: 0 };
        }

        const geometry = this.createGeometry(vertices, indices, attributes);

        if (normals) {
            this.setAttribute(geometry, 'normal', normals);
        }

        if (uvs) {
            this.setAttribute(geometry, 'uv', uvs);
        }

        return geometry;
    }

    /**
     * Create cube geometry
     */
    createCube(size: number = 1): G3DGeometry {
        return this.createBox(size, size, size);
    }

    /**
     * Create cylinder geometry
     */
    createCylinder(radius: number = 1, height: number = 2, segments: number = 16): G3DGeometry {
        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        const halfHeight = height / 2;

        // Generate vertices
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Bottom vertices
            positions.push(x, -halfHeight, z);
            normals.push(x / radius, 0, z / radius);
            uvs.push(i / segments, 0);

            // Top vertices
            positions.push(x, halfHeight, z);
            normals.push(x / radius, 0, z / radius);
            uvs.push(i / segments, 1);
        }

        // Generate indices for sides
        for (let i = 0; i < segments; i++) {
            const bottomA = i * 2;
            const bottomB = ((i + 1) % segments) * 2;
            const topA = bottomA + 1;
            const topB = bottomB + 1;

            // Side faces
            indices.push(bottomA, bottomB, topA);
            indices.push(bottomB, topB, topA);
        }

        const geometry = this.createGeometry(
            new Float32Array(positions),
            new Uint16Array(indices),
            {
                position: { name: 'position', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 },
                normal: { name: 'normal', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 },
                uv: { name: 'uv', size: 2, type: 'float', normalized: false, offset: 0, stride: 0 }
            }
        );

        this.setAttribute(geometry, 'normal', new Float32Array(normals));
        this.setAttribute(geometry, 'uv', new Float32Array(uvs));

        return geometry;
    }

    // Core geometry creation

    createGeometry(vertices: Float32Array, indices: Uint16Array | Uint32Array | undefined, attributes: Record<string, G3DVertexAttribute>): G3DGeometry {
        const geometry: G3DGeometry = {
            id: this.generateId(),
            type: G3DGeometryType.TRIANGLES,
            vertices,
            indices,
            attributes: new Map(Object.entries(attributes)),
            boundingBox: this.createEmptyBoundingBox(),
            boundingSphere: { center: vec3.create(), radius: 0 },
            vertexCount: vertices.length / (attributes.position?.size || 3),
            indexCount: indices?.length || 0,
            needsUpdate: true
        };

        this.computeBoundingBox(geometry);
        this.computeBoundingSphere(geometry);

        this.geometries.set(geometry.id, geometry);
        return geometry;
    }

    // Attribute management

    setAttribute(geometry: G3DGeometry, name: string, data: Float32Array): void {
        const attribute = geometry.attributes.get(name);
        if (!attribute) {
            console.warn(`Attribute '${name}' not found in geometry`);
            return;
        }

        // For now, store attributes separately - in production, they would be interleaved
        (geometry as any)[name] = data;
        geometry.needsUpdate = true;
    }

    getAttribute(geometry: G3DGeometry, name: string): Float32Array | undefined {
        return (geometry as any)[name];
    }

    // Geometry operations

    mergeGeometries(geometries: G3DGeometry[]): G3DGeometry {
        if (geometries.length === 0) {
            throw new Error('No geometries to merge');
        }

        // Calculate total sizes
        let totalVertices = 0;
        let totalIndices = 0;

        for (const geom of geometries) {
            totalVertices += geom.vertexCount;
            totalIndices += geom.indexCount;
        }

        // Merge vertex data
        const mergedVertices = new Float32Array(totalVertices * 3);
        const mergedIndices = new Uint32Array(totalIndices);

        let vertexOffset = 0;
        let indexOffset = 0;
        let vertexIndexOffset = 0;

        for (const geom of geometries) {
            // Copy vertices
            const positions = this.getAttribute(geom, 'position') || geom.vertices;
            mergedVertices.set(positions, vertexOffset);

            // Copy and offset indices
            if (geom.indices) {
                for (let i = 0; i < geom.indices.length; i++) {
                    mergedIndices[indexOffset + i] = geom.indices[i] + vertexIndexOffset;
                }
            }

            vertexOffset += positions.length;
            indexOffset += geom.indexCount;
            vertexIndexOffset += geom.vertexCount;
        }

        // Create merged geometry
        const merged = this.createGeometry(mergedVertices, mergedIndices, {
            position: { name: 'position', size: 3, type: 'float', normalized: false, offset: 0, stride: 0 }
        });

        return merged;
    }

    // Normal computation

    computeNormals(geometry: G3DGeometry): void {
        const positions = this.getAttribute(geometry, 'position') || geometry.vertices;
        const normals = new Float32Array(positions.length);

        if (geometry.indices) {
            // Indexed geometry
            const indices = geometry.indices;

            for (let i = 0; i < indices.length; i += 3) {
                const ia = indices[i] * 3;
                const ib = indices[i + 1] * 3;
                const ic = indices[i + 2] * 3;

                const v1 = vec3.fromValues(positions[ia], positions[ia + 1], positions[ia + 2]);
                const v2 = vec3.fromValues(positions[ib], positions[ib + 1], positions[ib + 2]);
                const v3 = vec3.fromValues(positions[ic], positions[ic + 1], positions[ic + 2]);

                const edge1 = vec3.create();
                const edge2 = vec3.create();
                vec3.subtract(edge1, v2, v1);
                vec3.subtract(edge2, v3, v1);

                const normal = vec3.create();
                vec3.cross(normal, edge1, edge2);
                vec3.normalize(normal, normal);

                // Add to vertex normals
                for (let j = 0; j < 3; j++) {
                    normals[ia + j] += normal[j];
                    normals[ib + j] += normal[j];
                    normals[ic + j] += normal[j];
                }
            }
        } else {
            // Non-indexed geometry
            for (let i = 0; i < positions.length; i += 9) {
                const v1 = vec3.fromValues(positions[i], positions[i + 1], positions[i + 2]);
                const v2 = vec3.fromValues(positions[i + 3], positions[i + 4], positions[i + 5]);
                const v3 = vec3.fromValues(positions[i + 6], positions[i + 7], positions[i + 8]);

                const edge1 = vec3.create();
                const edge2 = vec3.create();
                vec3.subtract(edge1, v2, v1);
                vec3.subtract(edge2, v3, v1);

                const normal = vec3.create();
                vec3.cross(normal, edge1, edge2);
                vec3.normalize(normal, normal);

                // Set same normal for all three vertices
                for (let v = 0; v < 3; v++) {
                    for (let j = 0; j < 3; j++) {
                        normals[i + v * 3 + j] = normal[j];
                    }
                }
            }
        }

        // Normalize all normals
        for (let i = 0; i < normals.length; i += 3) {
            const normal = vec3.fromValues(normals[i], normals[i + 1], normals[i + 2]);
            vec3.normalize(normal, normal);
            normals[i] = normal[0];
            normals[i + 1] = normal[1];
            normals[i + 2] = normal[2];
        }

        this.setAttribute(geometry, 'normal', normals);
    }

    // Tangent computation for normal mapping

    computeTangents(geometry: G3DGeometry): void {
        const positions = this.getAttribute(geometry, 'position') || geometry.vertices;
        const normals = this.getAttribute(geometry, 'normal');
        const uvs = this.getAttribute(geometry, 'uv');

        if (!normals || !uvs) {
            console.warn('Cannot compute tangents without normals and UVs');
            return;
        }

        const tangents = new Float32Array(geometry.vertexCount * 4);
        const tan1 = new Float32Array(geometry.vertexCount * 3);
        const tan2 = new Float32Array(geometry.vertexCount * 3);

        const processTriangle = (i1: number, i2: number, i3: number) => {
            const v1 = vec3.fromValues(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2]);
            const v2 = vec3.fromValues(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2]);
            const v3 = vec3.fromValues(positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2]);

            const w1 = vec3.fromValues(uvs[i1 * 2], uvs[i1 * 2 + 1], 0);
            const w2 = vec3.fromValues(uvs[i2 * 2], uvs[i2 * 2 + 1], 0);
            const w3 = vec3.fromValues(uvs[i3 * 2], uvs[i3 * 2 + 1], 0);

            const x1 = v2[0] - v1[0];
            const x2 = v3[0] - v1[0];
            const y1 = v2[1] - v1[1];
            const y2 = v3[1] - v1[1];
            const z1 = v2[2] - v1[2];
            const z2 = v3[2] - v1[2];

            const s1 = w2[0] - w1[0];
            const s2 = w3[0] - w1[0];
            const t1 = w2[1] - w1[1];
            const t2 = w3[1] - w1[1];

            const r = 1.0 / (s1 * t2 - s2 * t1);

            const sdir = vec3.fromValues(
                (t2 * x1 - t1 * x2) * r,
                (t2 * y1 - t1 * y2) * r,
                (t2 * z1 - t1 * z2) * r
            );

            const tdir = vec3.fromValues(
                (s1 * x2 - s2 * x1) * r,
                (s1 * y2 - s2 * y1) * r,
                (s1 * z2 - s2 * z1) * r
            );

            // Accumulate
            for (let j = 0; j < 3; j++) {
                tan1[i1 * 3 + j] += sdir[j];
                tan1[i2 * 3 + j] += sdir[j];
                tan1[i3 * 3 + j] += sdir[j];

                tan2[i1 * 3 + j] += tdir[j];
                tan2[i2 * 3 + j] += tdir[j];
                tan2[i3 * 3 + j] += tdir[j];
            }
        };

        if (geometry.indices) {
            for (let i = 0; i < geometry.indices.length; i += 3) {
                processTriangle(geometry.indices[i], geometry.indices[i + 1], geometry.indices[i + 2]);
            }
        } else {
            for (let i = 0; i < geometry.vertexCount; i += 3) {
                processTriangle(i, i + 1, i + 2);
            }
        }

        // Calculate tangents
        for (let i = 0; i < geometry.vertexCount; i++) {
            const n = vec3.fromValues(normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]);
            const t = vec3.fromValues(tan1[i * 3], tan1[i * 3 + 1], tan1[i * 3 + 2]);

            // Gram-Schmidt orthogonalize
            const tangent = vec3.create();
            vec3.subtract(tangent, t, vec3.scale(vec3.create(), n, vec3.dot(n, t)));
            vec3.normalize(tangent, tangent);

            // Calculate handedness
            const t2 = vec3.fromValues(tan2[i * 3], tan2[i * 3 + 1], tan2[i * 3 + 2]);
            const cross = vec3.create();
            vec3.cross(cross, n, t);
            const w = vec3.dot(cross, t2) < 0 ? -1 : 1;

            tangents[i * 4] = tangent[0];
            tangents[i * 4 + 1] = tangent[1];
            tangents[i * 4 + 2] = tangent[2];
            tangents[i * 4 + 3] = w;
        }

        this.setAttribute(geometry, 'tangent', tangents);
    }

    // Bounding volume computation

    computeBoundingBox(geometry: G3DGeometry): void {
        const positions = this.getAttribute(geometry, 'position') || geometry.vertices;
        const bbox = geometry.boundingBox;

        vec3.set(bbox.min, Infinity, Infinity, Infinity);
        vec3.set(bbox.max, -Infinity, -Infinity, -Infinity);

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];

            bbox.min[0] = Math.min(bbox.min[0], x);
            bbox.min[1] = Math.min(bbox.min[1], y);
            bbox.min[2] = Math.min(bbox.min[2], z);

            bbox.max[0] = Math.max(bbox.max[0], x);
            bbox.max[1] = Math.max(bbox.max[1], y);
            bbox.max[2] = Math.max(bbox.max[2], z);
        }

        vec3.add(bbox.center, bbox.min, bbox.max);
        vec3.scale(bbox.center, bbox.center, 0.5);
        vec3.subtract(bbox.size, bbox.max, bbox.min);
    }

    computeBoundingSphere(geometry: G3DGeometry): void {
        const positions = this.getAttribute(geometry, 'position') || geometry.vertices;
        const sphere = geometry.boundingSphere;
        const bbox = geometry.boundingBox;

        // Start with bounding box center
        vec3.copy(sphere.center, bbox.center);

        // Find maximum distance from center
        let maxRadiusSq = 0;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i] - sphere.center[0];
            const y = positions[i + 1] - sphere.center[1];
            const z = positions[i + 2] - sphere.center[2];
            maxRadiusSq = Math.max(maxRadiusSq, x * x + y * y + z * z);
        }

        sphere.radius = Math.sqrt(maxRadiusSq);
    }

    // Utility methods

    private createEmptyBoundingBox(): G3DBoundingBox {
        return {
            min: vec3.create(),
            max: vec3.create(),
            center: vec3.create(),
            size: vec3.create()
        };
    }

    private generateId(): string {
        return `geometry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getGeometry(id: string): G3DGeometry | undefined {
        return this.geometries.get(id);
    }

    deleteGeometry(id: string): void {
        this.geometries.delete(id);
    }

    getAllGeometries(): G3DGeometry[] {
        return Array.from(this.geometries.values());
    }
}

// Export factory function
export function createG3DGeometryProcessor(): G3DGeometryProcessor {
    return new G3DGeometryProcessor();
}