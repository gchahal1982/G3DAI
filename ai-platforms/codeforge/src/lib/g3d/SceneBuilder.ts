/**
 * CodeForge 3D Scene Builder
 * Transforms abstract syntax trees and code structures into 3D spatial representations
 * 
 * Features:
 * - AST-to-3D-space mapping algorithms
 * - Automated layout algorithms for code relationships
 * - Spatial grouping by functionality and dependencies
 * - Dependency visualization with connecting lines
 * - Performance-optimized scene graph construction
 * - LOD geometry generation
 * - Instanced rendering optimization
 * - Frustum culling acceleration structures
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

// Import types from the controller
import { Vector3, MinimapNode } from './MinimapController';

// Interfaces and types
interface SceneNode {
  id: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  children: SceneNode[];
  meshes: SceneMesh[];
  boundingBox: BoundingBox;
  visible: boolean;
  lodLevel: number;
  instanceCount: number;
  userData: any;
}

interface SceneMesh {
  id: string;
  geometry: Geometry;
  material: Material;
  instanceData?: InstanceData[];
  drawPriority: number;
  frustumCulled: boolean;
}

interface Geometry {
  vertices: Float32Array;
  indices: Uint32Array;
  normals: Float32Array;
  uvs: Float32Array;
  primitiveType: 'triangles' | 'lines' | 'points';
  vertexCount: number;
  indexCount: number;
}

interface Material {
  type: 'basic' | 'phong' | 'pbr' | 'line' | 'instanced';
  color: [number, number, number, number];
  opacity: number;
  wireframe: boolean;
  properties: Record<string, any>;
}

interface InstanceData {
  transform: Float32Array; // 4x4 matrix
  color: [number, number, number, number];
  scale: number;
  userData: any;
}

interface BoundingBox {
  min: Vector3;
  max: Vector3;
  center: Vector3;
  size: Vector3;
}

interface LayoutConfig {
  algorithm: 'radial' | 'hierarchical' | 'force-directed' | 'treemap' | 'cluster';
  spacing: number;
  groupSpacing: number;
  maxDepth: number;
  radialRadius: number;
  forceStrength: number;
  iterations: number;
}

interface CodeStructure {
  files: CodeFile[];
  dependencies: DependencyEdge[];
  modules: CodeModule[];
  functions: CodeFunction[];
  classes: CodeClass[];
  variables: CodeVariable[];
}

interface CodeFile {
  id: string;
  path: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  complexity: number;
  dependencies: string[];
  exports: string[];
  functions: string[];
  classes: string[];
  variables: string[];
}

interface CodeModule {
  id: string;
  name: string;
  files: string[];
  dependencies: string[];
  exports: string[];
}

interface CodeFunction {
  id: string;
  name: string;
  fileId: string;
  startLine: number;
  endLine: number;
  complexity: number;
  parameters: Parameter[];
  returns: string;
  calls: string[];
}

interface CodeClass {
  id: string;
  name: string;
  fileId: string;
  startLine: number;
  endLine: number;
  methods: string[];
  properties: string[];
  extends: string[];
  implements: string[];
}

interface CodeVariable {
  id: string;
  name: string;
  fileId: string;
  type: string;
  scope: 'global' | 'local' | 'parameter' | 'property';
  usages: number;
}

interface Parameter {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: string;
}

interface DependencyEdge {
  from: string;
  to: string;
  type: 'import' | 'call' | 'inheritance' | 'composition' | 'usage';
  weight: number;
}

interface SceneStats {
  nodeCount: number;
  meshCount: number;
  vertexCount: number;
  triangleCount: number;
  instanceCount: number;
  memoryUsage: number;
  buildTime: number;
}

// Configuration constants
const SCENE_CONFIG = {
  // Layout parameters
  DEFAULT_SPACING: 2.0,
  GROUP_SPACING: 5.0,
  MAX_DEPTH: 10,
  RADIAL_RADIUS: 10.0,
  FORCE_STRENGTH: 0.1,
  FORCE_ITERATIONS: 100,
  
  // Geometry parameters
  FILE_BASE_SIZE: 1.0,
  FUNCTION_SIZE_SCALE: 0.3,
  CLASS_SIZE_SCALE: 0.5,
  VARIABLE_SIZE_SCALE: 0.1,
  DEPENDENCY_LINE_WIDTH: 0.05,
  
  // Performance limits
  MAX_NODES: 10000,
  MAX_INSTANCES: 5000,
  MAX_DEPENDENCIES: 20000,
  LOD_DISTANCE_LEVELS: [10, 25, 50, 100],
  
  // Colors
  COLORS: {
    FILE: [0.2, 0.6, 1.0, 1.0] as [number, number, number, number],
    DIRECTORY: [1.0, 0.6, 0.2, 1.0] as [number, number, number, number],
    FUNCTION: [0.6, 0.2, 1.0, 1.0] as [number, number, number, number],
    CLASS: [1.0, 0.2, 0.2, 1.0] as [number, number, number, number],
    VARIABLE: [0.2, 1.0, 0.6, 1.0] as [number, number, number, number],
    DEPENDENCY: [0.5, 0.5, 0.5, 0.7] as [number, number, number, number],
    SELECTED: [1.0, 1.0, 0.2, 1.0] as [number, number, number, number],
    HIGHLIGHTED: [1.0, 0.8, 0.2, 1.0] as [number, number, number, number]
  }
};

export class SceneBuilder extends EventEmitter {
  private layoutConfig: LayoutConfig;
  private sceneGraph: SceneNode | null = null;
  private instancedMeshes: Map<string, SceneMesh> = new Map();
  private dependencyMeshes: SceneMesh[] = [];
  private spatialIndex: Map<string, Vector3> = new Map();
  private buildStats: SceneStats;

  constructor() {
    super();
    
    this.layoutConfig = {
      algorithm: 'radial',
      spacing: SCENE_CONFIG.DEFAULT_SPACING,
      groupSpacing: SCENE_CONFIG.GROUP_SPACING,
      maxDepth: SCENE_CONFIG.MAX_DEPTH,
      radialRadius: SCENE_CONFIG.RADIAL_RADIUS,
      forceStrength: SCENE_CONFIG.FORCE_STRENGTH,
      iterations: SCENE_CONFIG.FORCE_ITERATIONS
    };

    this.buildStats = {
      nodeCount: 0,
      meshCount: 0,
      vertexCount: 0,
      triangleCount: 0,
      instanceCount: 0,
      memoryUsage: 0,
      buildTime: 0
    };
  }

  // Main scene building entry point
  async buildScene(codeStructure: CodeStructure): Promise<SceneNode> {
    const startTime = performance.now();
    
    try {
      this.emit('build_started', { codeStructure });
      
      // Reset state
      this.sceneGraph = null;
      this.instancedMeshes.clear();
      this.dependencyMeshes = [];
      this.spatialIndex.clear();

      // Step 1: Calculate layout positions
      const layout = await this.calculateLayout(codeStructure);
      
      // Step 2: Build scene graph
      this.sceneGraph = await this.buildSceneGraph(codeStructure, layout);
      
      // Step 3: Generate meshes and materials
      await this.generateMeshes(codeStructure, layout);
      
      // Step 4: Create dependency visualizations
      await this.createDependencyMeshes(codeStructure, layout);
      
      // Step 5: Optimize scene for rendering
      await this.optimizeScene();
      
      // Update statistics
      this.buildStats.buildTime = performance.now() - startTime;
      this.updateBuildStats();
      
      this.emit('build_completed', { 
        sceneGraph: this.sceneGraph, 
        stats: this.buildStats 
      });
      
      return this.sceneGraph!;
      
    } catch (error) {
      this.emit('build_error', { error });
      throw error;
    }
  }

  // Layout calculation algorithms
  private async calculateLayout(codeStructure: CodeStructure): Promise<Map<string, Vector3>> {
    const layout = new Map<string, Vector3>();
    
    switch (this.layoutConfig.algorithm) {
      case 'radial':
        return this.calculateRadialLayout(codeStructure);
      case 'hierarchical':
        return this.calculateHierarchicalLayout(codeStructure);
      case 'force-directed':
        return this.calculateForceDirectedLayout(codeStructure);
      case 'treemap':
        return this.calculateTreemapLayout(codeStructure);
      case 'cluster':
        return this.calculateClusterLayout(codeStructure);
      default:
        return this.calculateRadialLayout(codeStructure);
    }
  }

  // Radial layout: files in circles based on dependency depth
  private async calculateRadialLayout(codeStructure: CodeStructure): Promise<Map<string, Vector3>> {
    const layout = new Map<string, Vector3>();
    const visited = new Set<string>();
    const levels = new Map<string, number>();
    
    // Calculate dependency levels using BFS
    const queue: { id: string; level: number }[] = [];
    
    // Find root nodes (no dependencies or entry points)
    const rootNodes = codeStructure.files.filter(file => 
      file.dependencies.length === 0 || this.isEntryPoint(file)
    );
    
    rootNodes.forEach(file => {
      queue.push({ id: file.id, level: 0 });
    });
    
    // BFS to assign levels
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      
      if (visited.has(id)) continue;
      visited.add(id);
      levels.set(id, level);
      
      // Add dependents to next level
      const dependents = this.findDependents(id, codeStructure);
      dependents.forEach(dependentId => {
        if (!visited.has(dependentId)) {
          queue.push({ id: dependentId, level: level + 1 });
        }
      });
    }
    
    // Position nodes in radial layout
    const levelGroups = new Map<number, string[]>();
    levels.forEach((level, id) => {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(id);
    });
    
    // Position each level
    levelGroups.forEach((nodeIds, level) => {
      const radius = level * this.layoutConfig.spacing + this.layoutConfig.radialRadius;
      const angleStep = (2 * Math.PI) / Math.max(nodeIds.length, 1);
      
      nodeIds.forEach((nodeId, index) => {
        const angle = index * angleStep;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = level * 0.5; // Slight vertical separation
        
        layout.set(nodeId, { x, y, z });
      });
    });
    
    // Position functions and classes within their files
    this.positionChildElements(codeStructure, layout);
    
    return layout;
  }

  // Hierarchical layout: tree-like structure based on file system
  private async calculateHierarchicalLayout(codeStructure: CodeStructure): Promise<Map<string, Vector3>> {
    const layout = new Map<string, Vector3>();
    
    // Build directory tree
    const directoryTree = this.buildDirectoryTree(codeStructure.files);
    
    // Position directories and files recursively
    this.positionTreeNode(directoryTree, { x: 0, y: 0, z: 0 }, layout);
    
    // Position child elements
    this.positionChildElements(codeStructure, layout);
    
    return layout;
  }

  // Force-directed layout: physics simulation
  private async calculateForceDirectedLayout(codeStructure: CodeStructure): Promise<Map<string, Vector3>> {
    const layout = new Map<string, Vector3>();
    const nodes = codeStructure.files.map(file => ({
      id: file.id,
      position: this.randomPosition(),
      velocity: { x: 0, y: 0, z: 0 },
      mass: Math.log(file.size + 1)
    }));
    
    // Initialize random positions
    nodes.forEach(node => {
      layout.set(node.id, { ...node.position });
    });
    
    // Run simulation
    for (let iteration = 0; iteration < this.layoutConfig.iterations; iteration++) {
      // Calculate forces
      nodes.forEach(node => {
        const forces = this.calculateForces(node, nodes, codeStructure.dependencies);
        
        // Update velocity
        node.velocity.x += forces.x / node.mass;
        node.velocity.y += forces.y / node.mass;
        node.velocity.z += forces.z / node.mass;
        
        // Apply damping
        node.velocity.x *= 0.9;
        node.velocity.y *= 0.9;
        node.velocity.z *= 0.9;
        
        // Update position
        node.position.x += node.velocity.x;
        node.position.y += node.velocity.y;
        node.position.z += node.velocity.z;
        
        layout.set(node.id, { ...node.position });
      });
    }
    
    // Position child elements
    this.positionChildElements(codeStructure, layout);
    
    return layout;
  }

  // Treemap layout: nested rectangles based on size
  private async calculateTreemapLayout(codeStructure: CodeStructure): Promise<Map<string, Vector3>> {
    const layout = new Map<string, Vector3>();
    
    // Group files by directory
    const directoryGroups = this.groupFilesByDirectory(codeStructure.files);
    
    // Calculate treemap for each directory
    let currentX = 0;
    const spacing = this.layoutConfig.groupSpacing;
    
    directoryGroups.forEach((files, directory) => {
      const bounds = this.calculateTreemapBounds(files);
      const treemap = this.buildTreemap(files, bounds);
      
      // Position treemap
      treemap.forEach((rect, fileId) => {
        layout.set(fileId, {
          x: currentX + rect.x + rect.width / 2,
          y: 0,
          z: rect.y + rect.height / 2
        });
      });
      
      currentX += bounds.width + spacing;
    });
    
    // Position child elements
    this.positionChildElements(codeStructure, layout);
    
    return layout;
  }

  // Cluster layout: group related files
  private async calculateClusterLayout(codeStructure: CodeStructure): Promise<Map<string, Vector3>> {
    const layout = new Map<string, Vector3>();
    
    // Perform clustering analysis
    const clusters = this.performClustering(codeStructure);
    
    // Position clusters in a grid
    const gridSize = Math.ceil(Math.sqrt(clusters.length));
    
    clusters.forEach((cluster, index) => {
      const gridX = index % gridSize;
      const gridZ = Math.floor(index / gridSize);
      
      const centerX = gridX * this.layoutConfig.groupSpacing;
      const centerZ = gridZ * this.layoutConfig.groupSpacing;
      
      // Position files within cluster
      cluster.forEach((fileId, fileIndex) => {
        const angle = (fileIndex / cluster.length) * 2 * Math.PI;
        const radius = Math.sqrt(cluster.length) * 0.5;
        
        layout.set(fileId, {
          x: centerX + Math.cos(angle) * radius,
          y: 0,
          z: centerZ + Math.sin(angle) * radius
        });
      });
    });
    
    // Position child elements
    this.positionChildElements(codeStructure, layout);
    
    return layout;
  }

  // Position functions, classes, and variables within their files
  private positionChildElements(codeStructure: CodeStructure, layout: Map<string, Vector3>): void {
    codeStructure.files.forEach(file => {
      const filePosition = layout.get(file.id);
      if (!filePosition) return;
      
      // Position functions
      file.functions.forEach((functionId, index) => {
        const func = codeStructure.functions.find(f => f.id === functionId);
        if (func) {
          const offset = this.calculateChildOffset(index, file.functions.length, 'function');
          layout.set(functionId, {
            x: filePosition.x + offset.x,
            y: filePosition.y + offset.y + 1.0,
            z: filePosition.z + offset.z
          });
        }
      });
      
      // Position classes
      file.classes.forEach((classId, index) => {
        const cls = codeStructure.classes.find(c => c.id === classId);
        if (cls) {
          const offset = this.calculateChildOffset(index, file.classes.length, 'class');
          layout.set(classId, {
            x: filePosition.x + offset.x,
            y: filePosition.y + offset.y + 0.5,
            z: filePosition.z + offset.z
          });
        }
      });
      
      // Position variables
      file.variables.forEach((variableId, index) => {
        const variable = codeStructure.variables.find(v => v.id === variableId);
        if (variable) {
          const offset = this.calculateChildOffset(index, file.variables.length, 'variable');
          layout.set(variableId, {
            x: filePosition.x + offset.x,
            y: filePosition.y + offset.y - 0.5,
            z: filePosition.z + offset.z
          });
        }
      });
    });
  }

  // Scene graph construction
  private async buildSceneGraph(codeStructure: CodeStructure, layout: Map<string, Vector3>): Promise<SceneNode> {
    const rootNode: SceneNode = {
      id: 'root',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      children: [],
      meshes: [],
      boundingBox: { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 }, center: { x: 0, y: 0, z: 0 }, size: { x: 0, y: 0, z: 0 } },
      visible: true,
      lodLevel: 0,
      instanceCount: 0,
      userData: {}
    };
    
    // Create file nodes
    const fileNodes = codeStructure.files.map(file => this.createFileNode(file, layout));
    rootNode.children.push(...fileNodes);
    
    // Create module nodes if needed
    if (codeStructure.modules.length > 0) {
      const moduleNodes = codeStructure.modules.map(module => this.createModuleNode(module, layout));
      rootNode.children.push(...moduleNodes);
    }
    
    // Update bounding boxes
    this.updateBoundingBoxes(rootNode);
    
    return rootNode;
  }

  // Mesh generation
  private async generateMeshes(codeStructure: CodeStructure, layout: Map<string, Vector3>): Promise<void> {
    // Generate basic geometries
    const geometries = {
      cube: this.createCubeGeometry(),
      sphere: this.createSphereGeometry(),
      cylinder: this.createCylinderGeometry(),
      plane: this.createPlaneGeometry()
    };
    
    // Create instanced meshes for each node type
    this.createInstancedMesh('file', geometries.cube, SCENE_CONFIG.COLORS.FILE);
    this.createInstancedMesh('directory', geometries.cube, SCENE_CONFIG.COLORS.DIRECTORY);
    this.createInstancedMesh('function', geometries.sphere, SCENE_CONFIG.COLORS.FUNCTION);
    this.createInstancedMesh('class', geometries.cylinder, SCENE_CONFIG.COLORS.CLASS);
    this.createInstancedMesh('variable', geometries.sphere, SCENE_CONFIG.COLORS.VARIABLE);
    
    // Populate instance data
    this.populateInstanceData(codeStructure, layout);
  }

  // Dependency visualization
  private async createDependencyMeshes(codeStructure: CodeStructure, layout: Map<string, Vector3>): Promise<void> {
    const lineGeometry = this.createLineGeometry();
    
    codeStructure.dependencies.forEach(dep => {
      const fromPos = layout.get(dep.from);
      const toPos = layout.get(dep.to);
      
      if (fromPos && toPos) {
        const lineMesh = this.createDependencyLine(fromPos, toPos, dep);
        this.dependencyMeshes.push(lineMesh);
      }
    });
  }

  // Scene optimization
  private async optimizeScene(): Promise<void> {
    // Sort meshes by draw priority
    this.instancedMeshes.forEach(mesh => {
      if (mesh.instanceData) {
        mesh.instanceData.sort((a, b) => a.userData.priority - b.userData.priority);
      }
    });
    
    // Generate LOD versions
    this.generateLODMeshes();
    
    // Build spatial acceleration structures
    this.buildSpatialIndex();
    
    // Optimize memory layout
    this.optimizeMemoryLayout();
  }

  // Utility methods
  private isEntryPoint(file: CodeFile): boolean {
    return file.name.includes('index') || file.name.includes('main') || file.name.includes('app');
  }

  private findDependents(fileId: string, codeStructure: CodeStructure): string[] {
    return codeStructure.dependencies
      .filter(dep => dep.to === fileId)
      .map(dep => dep.from);
  }

  private randomPosition(): Vector3 {
    return {
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 20
    };
  }

  private calculateForces(node: any, allNodes: any[], dependencies: DependencyEdge[]): Vector3 {
    const forces = { x: 0, y: 0, z: 0 };
    
    // Repulsion force from other nodes
    allNodes.forEach(other => {
      if (other.id === node.id) return;
      
      const dx = node.position.x - other.position.x;
      const dy = node.position.y - other.position.y;
      const dz = node.position.z - other.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;
      
      const repulsion = 10 / (distance * distance);
      forces.x += (dx / distance) * repulsion;
      forces.y += (dy / distance) * repulsion;
      forces.z += (dz / distance) * repulsion;
    });
    
    // Attraction force from dependencies
    dependencies.forEach(dep => {
      if (dep.from === node.id || dep.to === node.id) {
        const otherId = dep.from === node.id ? dep.to : dep.from;
        const other = allNodes.find(n => n.id === otherId);
        if (other) {
          const dx = other.position.x - node.position.x;
          const dy = other.position.y - node.position.y;
          const dz = other.position.z - node.position.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;
          
          const attraction = this.layoutConfig.forceStrength * dep.weight;
          forces.x += (dx / distance) * attraction;
          forces.y += (dy / distance) * attraction;
          forces.z += (dz / distance) * attraction;
        }
      }
    });
    
    return forces;
  }

  private buildDirectoryTree(files: CodeFile[]): any {
    // Simplified directory tree construction
    const tree = { name: 'root', children: new Map(), files: [] as CodeFile[] };
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      parts.slice(0, -1).forEach(part => {
        if (!current.children.has(part)) {
          current.children.set(part, { name: part, children: new Map(), files: [] });
        }
        current = current.children.get(part);
      });
      
      current.files.push(file);
    });
    
    return tree;
  }

  private positionTreeNode(node: any, position: Vector3, layout: Map<string, Vector3>): void {
    // Position files in this directory
    node.files.forEach((file: CodeFile, index: number) => {
      layout.set(file.id, {
        x: position.x + (index % 5) * this.layoutConfig.spacing,
        y: position.y,
        z: position.z + Math.floor(index / 5) * this.layoutConfig.spacing
      });
    });
    
    // Position child directories
    let childIndex = 0;
    node.children.forEach((child: any) => {
      const childPosition = {
        x: position.x + this.layoutConfig.groupSpacing,
        y: position.y,
        z: position.z + childIndex * this.layoutConfig.groupSpacing
      };
      
      this.positionTreeNode(child, childPosition, layout);
      childIndex++;
    });
  }

  private groupFilesByDirectory(files: CodeFile[]): Map<string, CodeFile[]> {
    const groups = new Map<string, CodeFile[]>();
    
    files.forEach(file => {
      const directory = file.path.substring(0, file.path.lastIndexOf('/'));
      if (!groups.has(directory)) {
        groups.set(directory, []);
      }
      groups.get(directory)!.push(file);
    });
    
    return groups;
  }

  private calculateTreemapBounds(files: CodeFile[]): { width: number; height: number } {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const aspectRatio = 1.0;
    const width = Math.sqrt(totalSize * aspectRatio);
    const height = totalSize / width;
    return { width, height };
  }

  private buildTreemap(files: CodeFile[], bounds: { width: number; height: number }): Map<string, any> {
    // Simplified treemap algorithm
    const treemap = new Map();
    const sortedFiles = [...files].sort((a, b) => b.size - a.size);
    
    let x = 0, y = 0;
    let rowHeight = 0;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    sortedFiles.forEach(file => {
      const area = (file.size / totalSize) * bounds.width * bounds.height;
      const width = Math.sqrt(area);
      const height = area / width;
      
      if (x + width > bounds.width) {
        x = 0;
        y += rowHeight;
        rowHeight = 0;
      }
      
      treemap.set(file.id, { x, y, width, height });
      x += width;
      rowHeight = Math.max(rowHeight, height);
    });
    
    return treemap;
  }

  private performClustering(codeStructure: CodeStructure): string[][] {
    // Simplified clustering based on dependencies
    const clusters: string[][] = [];
    const visited = new Set<string>();
    
    codeStructure.files.forEach(file => {
      if (visited.has(file.id)) return;
      
      const cluster = this.findConnectedComponent(file.id, codeStructure, visited);
      if (cluster.length > 0) {
        clusters.push(cluster);
      }
    });
    
    return clusters;
  }

  private findConnectedComponent(startId: string, codeStructure: CodeStructure, visited: Set<string>): string[] {
    const component: string[] = [];
    const queue = [startId];
    
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      
      visited.add(id);
      component.push(id);
      
      // Find connected nodes
      codeStructure.dependencies.forEach(dep => {
        if (dep.from === id && !visited.has(dep.to)) {
          queue.push(dep.to);
        }
        if (dep.to === id && !visited.has(dep.from)) {
          queue.push(dep.from);
        }
      });
    }
    
    return component;
  }

  private calculateChildOffset(index: number, total: number, type: string): Vector3 {
    const scale = type === 'function' ? SCENE_CONFIG.FUNCTION_SIZE_SCALE :
                  type === 'class' ? SCENE_CONFIG.CLASS_SIZE_SCALE :
                  SCENE_CONFIG.VARIABLE_SIZE_SCALE;
    
    const angle = (index / Math.max(total, 1)) * 2 * Math.PI;
    const radius = scale * 2;
    
    return {
      x: Math.cos(angle) * radius,
      y: 0,
      z: Math.sin(angle) * radius
    };
  }

  private createFileNode(file: CodeFile, layout: Map<string, Vector3>): SceneNode {
    const position = layout.get(file.id) || { x: 0, y: 0, z: 0 };
    const size = Math.log(file.size + 1) * SCENE_CONFIG.FILE_BASE_SIZE;
    
    return {
      id: file.id,
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: size, y: size, z: size },
      children: [],
      meshes: [],
      boundingBox: this.createBoundingBox(position, { x: size, y: size, z: size }),
      visible: true,
      lodLevel: 0,
      instanceCount: 1,
      userData: { file, type: 'file' }
    };
  }

  private createModuleNode(module: CodeModule, layout: Map<string, Vector3>): SceneNode {
    // Calculate module center from its files
    const filePositions = module.files
      .map(fileId => layout.get(fileId))
      .filter(Boolean) as Vector3[];
    
    const center = filePositions.reduce(
      (sum, pos) => ({ x: sum.x + pos.x, y: sum.y + pos.y, z: sum.z + pos.z }),
      { x: 0, y: 0, z: 0 }
    );
    
    if (filePositions.length > 0) {
      center.x /= filePositions.length;
      center.y /= filePositions.length;
      center.z /= filePositions.length;
    }
    
    return {
      id: module.id,
      position: center,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      children: [],
      meshes: [],
      boundingBox: this.createBoundingBox(center, { x: 1, y: 1, z: 1 }),
      visible: true,
      lodLevel: 0,
      instanceCount: 1,
      userData: { module, type: 'module' }
    };
  }

  private createBoundingBox(position: Vector3, size: Vector3): BoundingBox {
    const halfSize = { x: size.x / 2, y: size.y / 2, z: size.z / 2 };
    return {
      min: {
        x: position.x - halfSize.x,
        y: position.y - halfSize.y,
        z: position.z - halfSize.z
      },
      max: {
        x: position.x + halfSize.x,
        y: position.y + halfSize.y,
        z: position.z + halfSize.z
      },
      center: position,
      size
    };
  }

  private updateBoundingBoxes(node: SceneNode): void {
    if (node.children.length === 0) return;
    
    // Update children first
    node.children.forEach(child => this.updateBoundingBoxes(child));
    
    // Calculate bounding box from children
    const min = { x: Infinity, y: Infinity, z: Infinity };
    const max = { x: -Infinity, y: -Infinity, z: -Infinity };
    
    node.children.forEach(child => {
      min.x = Math.min(min.x, child.boundingBox.min.x);
      min.y = Math.min(min.y, child.boundingBox.min.y);
      min.z = Math.min(min.z, child.boundingBox.min.z);
      max.x = Math.max(max.x, child.boundingBox.max.x);
      max.y = Math.max(max.y, child.boundingBox.max.y);
      max.z = Math.max(max.z, child.boundingBox.max.z);
    });
    
    node.boundingBox = {
      min,
      max,
      center: {
        x: (min.x + max.x) / 2,
        y: (min.y + max.y) / 2,
        z: (min.z + max.z) / 2
      },
      size: {
        x: max.x - min.x,
        y: max.y - min.y,
        z: max.z - min.z
      }
    };
  }

  // Geometry creation methods (simplified)
  private createCubeGeometry(): Geometry {
    // Simplified cube geometry
    const vertices = new Float32Array([
      -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5,  0.5, -0.5, -0.5,  0.5, -0.5,
      -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5
    ]);
    
    const indices = new Uint32Array([
      0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
      0, 1, 5, 0, 5, 4, 2, 3, 7, 2, 7, 6,
      0, 3, 7, 0, 7, 4, 1, 2, 6, 1, 6, 5
    ]);
    
    return {
      vertices,
      indices,
      normals: new Float32Array(24), // Would calculate actual normals
      uvs: new Float32Array(16), // Would calculate UVs
      primitiveType: 'triangles',
      vertexCount: 8,
      indexCount: 36
    };
  }

  private createSphereGeometry(): Geometry {
    // Simplified sphere geometry (would generate actual sphere)
    return this.createCubeGeometry(); // Placeholder
  }

  private createCylinderGeometry(): Geometry {
    // Simplified cylinder geometry (would generate actual cylinder)
    return this.createCubeGeometry(); // Placeholder
  }

  private createPlaneGeometry(): Geometry {
    // Simplified plane geometry
    const vertices = new Float32Array([
      -0.5, 0, -0.5,  0.5, 0, -0.5,  0.5, 0,  0.5, -0.5, 0,  0.5
    ]);
    
    const indices = new Uint32Array([0, 1, 2, 0, 2, 3]);
    
    return {
      vertices,
      indices,
      normals: new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]),
      uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      primitiveType: 'triangles',
      vertexCount: 4,
      indexCount: 6
    };
  }

  private createLineGeometry(): Geometry {
    const vertices = new Float32Array([0, 0, 0, 1, 1, 1]);
    const indices = new Uint32Array([0, 1]);
    
    return {
      vertices,
      indices,
      normals: new Float32Array(6),
      uvs: new Float32Array(4),
      primitiveType: 'lines',
      vertexCount: 2,
      indexCount: 2
    };
  }

  private createInstancedMesh(type: string, geometry: Geometry, color: [number, number, number, number]): void {
    const material: Material = {
      type: 'instanced',
      color,
      opacity: color[3],
      wireframe: false,
      properties: {}
    };
    
    const mesh: SceneMesh = {
      id: `instanced_${type}`,
      geometry,
      material,
      instanceData: [],
      drawPriority: 0,
      frustumCulled: true
    };
    
    this.instancedMeshes.set(type, mesh);
  }

  private populateInstanceData(codeStructure: CodeStructure, layout: Map<string, Vector3>): void {
    // Populate file instances
    const fileMesh = this.instancedMeshes.get('file');
    if (fileMesh) {
      fileMesh.instanceData = codeStructure.files.map(file => {
        const position = layout.get(file.id) || { x: 0, y: 0, z: 0 };
        const scale = Math.log(file.size + 1) * SCENE_CONFIG.FILE_BASE_SIZE;
        
        return {
          transform: this.createTransformMatrix(position, { x: 0, y: 0, z: 0 }, { x: scale, y: scale, z: scale }),
          color: SCENE_CONFIG.COLORS.FILE,
          scale,
          userData: file
        };
      });
    }
    
    // Similar for other types...
  }

  private createTransformMatrix(position: Vector3, rotation: Vector3, scale: Vector3): Float32Array {
    // Simplified transform matrix creation
    const matrix = new Float32Array(16);
    
    // Identity matrix with position and scale
    matrix[0] = scale.x; matrix[4] = 0; matrix[8] = 0; matrix[12] = position.x;
    matrix[1] = 0; matrix[5] = scale.y; matrix[9] = 0; matrix[13] = position.y;
    matrix[2] = 0; matrix[6] = 0; matrix[10] = scale.z; matrix[14] = position.z;
    matrix[3] = 0; matrix[7] = 0; matrix[11] = 0; matrix[15] = 1;
    
    return matrix;
  }

  private createDependencyLine(from: Vector3, to: Vector3, dependency: DependencyEdge): SceneMesh {
    // Create line geometry from 'from' to 'to'
    const vertices = new Float32Array([from.x, from.y, from.z, to.x, to.y, to.z]);
    const indices = new Uint32Array([0, 1]);
    
    const geometry: Geometry = {
      vertices,
      indices,
      normals: new Float32Array(6),
      uvs: new Float32Array(4),
      primitiveType: 'lines',
      vertexCount: 2,
      indexCount: 2
    };
    
    const material: Material = {
      type: 'line',
      color: SCENE_CONFIG.COLORS.DEPENDENCY,
      opacity: dependency.weight,
      wireframe: false,
      properties: { lineWidth: SCENE_CONFIG.DEPENDENCY_LINE_WIDTH }
    };
    
    return {
      id: `dependency_${dependency.from}_${dependency.to}`,
      geometry,
      material,
      drawPriority: 1,
      frustumCulled: true
    };
  }

  private generateLODMeshes(): void {
    // Generate simplified versions of meshes for different LOD levels
    this.instancedMeshes.forEach((mesh, type) => {
      // Would generate simplified geometries for each LOD level
    });
  }

  private buildSpatialIndex(): void {
    // Build spatial acceleration structure for fast culling
    this.instancedMeshes.forEach((mesh, type) => {
      if (mesh.instanceData) {
        mesh.instanceData.forEach(instance => {
          // Extract position from transform matrix
          const position = {
            x: instance.transform[12],
            y: instance.transform[13],
            z: instance.transform[14]
          };
          this.spatialIndex.set(instance.userData.id, position);
        });
      }
    });
  }

  private optimizeMemoryLayout(): void {
    // Optimize data layout for better cache performance
    this.instancedMeshes.forEach(mesh => {
      if (mesh.instanceData) {
        // Sort instances by depth or spatial coherence
        mesh.instanceData.sort((a, b) => {
          const aZ = a.transform[14];
          const bZ = b.transform[14];
          return aZ - bZ;
        });
      }
    });
  }

  private updateBuildStats(): void {
    this.buildStats.nodeCount = this.sceneGraph ? this.countNodes(this.sceneGraph) : 0;
    this.buildStats.meshCount = this.instancedMeshes.size + this.dependencyMeshes.length;
    
    let vertexCount = 0;
    let triangleCount = 0;
    let instanceCount = 0;
    
    this.instancedMeshes.forEach(mesh => {
      vertexCount += mesh.geometry.vertexCount;
      triangleCount += mesh.geometry.indexCount / 3;
      instanceCount += mesh.instanceData?.length || 0;
    });
    
    this.buildStats.vertexCount = vertexCount;
    this.buildStats.triangleCount = Math.floor(triangleCount);
    this.buildStats.instanceCount = instanceCount;
    this.buildStats.memoryUsage = this.estimateMemoryUsage();
  }

  private countNodes(node: SceneNode): number {
    return 1 + node.children.reduce((sum, child) => sum + this.countNodes(child), 0);
  }

  private estimateMemoryUsage(): number {
    let totalMemory = 0;
    
    this.instancedMeshes.forEach(mesh => {
      // Estimate geometry memory
      totalMemory += mesh.geometry.vertices.byteLength;
      totalMemory += mesh.geometry.indices.byteLength;
      totalMemory += mesh.geometry.normals.byteLength;
      totalMemory += mesh.geometry.uvs.byteLength;
      
      // Estimate instance data memory
      if (mesh.instanceData) {
        totalMemory += mesh.instanceData.length * (16 * 4 + 16 + 4); // Transform + color + scale
      }
    });
    
    return totalMemory;
  }

  // Public API methods
  getLayoutConfig(): LayoutConfig {
    return { ...this.layoutConfig };
  }

  setLayoutConfig(config: Partial<LayoutConfig>): void {
    this.layoutConfig = { ...this.layoutConfig, ...config };
    this.emit('layout_config_changed', this.layoutConfig);
  }

  getSceneGraph(): SceneNode | null {
    return this.sceneGraph;
  }

  getInstancedMeshes(): Map<string, SceneMesh> {
    return new Map(this.instancedMeshes);
  }

  getDependencyMeshes(): SceneMesh[] {
    return [...this.dependencyMeshes];
  }

  getBuildStats(): SceneStats {
    return { ...this.buildStats };
  }

  getSpatialIndex(): Map<string, Vector3> {
    return new Map(this.spatialIndex);
  }
}

// Export types and main class
export type { 
  SceneNode, 
  SceneMesh, 
  Geometry, 
  Material, 
  CodeStructure, 
  LayoutConfig, 
  SceneStats 
};
export default SceneBuilder; 