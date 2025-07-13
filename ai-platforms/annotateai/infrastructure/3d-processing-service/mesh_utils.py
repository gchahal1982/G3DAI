#!/usr/bin/env python3
"""
Advanced Mesh Processing Utilities
Specialized algorithms for mesh repair, simplification, analysis, and texture mapping
"""

import logging
import time
from typing import Dict, List, Optional, Any, Union, Tuple
from enum import Enum
from dataclasses import dataclass
import math

import numpy as np
import open3d as o3d
import trimesh
import pymeshlab
from scipy.spatial import ConvexHull, cKDTree
from scipy.spatial.distance import cdist
from scipy.optimize import minimize
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import cv2
from PIL import Image
import matplotlib.pyplot as plt
from matplotlib.tri import Triangulation
import networkx as nx

# Configure logging
logger = logging.getLogger(__name__)

class SimplificationMethod(str, Enum):
    """Mesh simplification methods"""
    QUADRIC_EDGE_COLLAPSE = "quadric_edge_collapse"
    CLUSTERING = "clustering"
    PROGRESSIVE = "progressive"
    FEATURE_PRESERVING = "feature_preserving"

class TextureMethod(str, Enum):
    """Texture mapping methods"""
    PLANAR = "planar"
    CYLINDRICAL = "cylindrical"
    SPHERICAL = "spherical"
    CONFORMAL = "conformal"
    ANGLE_BASED = "angle_based"

class QualityMetric(str, Enum):
    """Mesh quality metrics"""
    ASPECT_RATIO = "aspect_ratio"
    SKEWNESS = "skewness"
    EDGE_RATIO = "edge_ratio"
    JACOBIAN = "jacobian"
    WARPAGE = "warpage"

@dataclass
class MeshQualityReport:
    """Mesh quality analysis report"""
    vertex_count: int
    face_count: int
    edge_count: int
    genus: int
    is_watertight: bool
    is_manifold: bool
    has_self_intersections: bool
    volume: float
    surface_area: float
    quality_metrics: Dict[str, float]
    defects: List[Dict[str, Any]]
    repair_suggestions: List[str]

@dataclass
class SimplificationResult:
    """Mesh simplification result"""
    original_vertices: int
    original_faces: int
    simplified_vertices: int
    simplified_faces: int
    reduction_ratio: float
    quality_preservation: float
    processing_time: float
    method_used: SimplificationMethod

@dataclass
class TextureResult:
    """Texture mapping result"""
    uv_coordinates: np.ndarray
    texture_image: np.ndarray
    texture_resolution: Tuple[int, int]
    seam_length: float
    distortion_metrics: Dict[str, float]
    mapping_method: TextureMethod

class MeshUtils:
    """Advanced mesh processing utilities"""
    
    def __init__(self):
        pass
    
    def analyze_mesh_quality(self, mesh: o3d.geometry.TriangleMesh) -> MeshQualityReport:
        """Comprehensive mesh quality analysis"""
        
        logger.info("Analyzing mesh quality...")
        
        vertices = np.asarray(mesh.vertices)
        faces = np.asarray(mesh.triangles)
        
        # Basic statistics
        vertex_count = len(vertices)
        face_count = len(faces)
        edge_count = self._count_edges(faces)
        
        # Topological properties
        genus = self._compute_genus(vertex_count, edge_count, face_count)
        is_watertight = mesh.is_watertight()
        is_manifold = mesh.is_vertex_manifold() and mesh.is_edge_manifold()
        has_self_intersections = mesh.is_self_intersecting()
        
        # Geometric properties
        volume = mesh.get_volume() if is_watertight else 0.0
        surface_area = mesh.get_surface_area()
        
        # Quality metrics
        quality_metrics = self._compute_quality_metrics(vertices, faces)
        
        # Detect defects
        defects = self._detect_mesh_defects(mesh)
        
        # Generate repair suggestions
        repair_suggestions = self._generate_repair_suggestions(
            is_watertight, is_manifold, has_self_intersections, defects
        )
        
        return MeshQualityReport(
            vertex_count=vertex_count,
            face_count=face_count,
            edge_count=edge_count,
            genus=genus,
            is_watertight=is_watertight,
            is_manifold=is_manifold,
            has_self_intersections=has_self_intersections,
            volume=volume,
            surface_area=surface_area,
            quality_metrics=quality_metrics,
            defects=defects,
            repair_suggestions=repair_suggestions
        )
    
    def _count_edges(self, faces: np.ndarray) -> int:
        """Count unique edges in mesh"""
        edges = set()
        for face in faces:
            for i in range(3):
                edge = tuple(sorted([face[i], face[(i + 1) % 3]]))
                edges.add(edge)
        return len(edges)
    
    def _compute_genus(self, V: int, E: int, F: int) -> int:
        """Compute genus using Euler's formula: V - E + F = 2 - 2g"""
        euler_characteristic = V - E + F
        genus = max(0, (2 - euler_characteristic) // 2)
        return genus
    
    def _compute_quality_metrics(
        self, 
        vertices: np.ndarray, 
        faces: np.ndarray
    ) -> Dict[str, float]:
        """Compute various mesh quality metrics"""
        
        metrics = {}
        
        # Compute per-triangle metrics
        aspect_ratios = []
        edge_ratios = []
        areas = []
        
        for face in faces:
            v0, v1, v2 = vertices[face]
            
            # Edge lengths
            e0 = np.linalg.norm(v1 - v0)
            e1 = np.linalg.norm(v2 - v1)
            e2 = np.linalg.norm(v0 - v2)
            
            edges = [e0, e1, e2]
            min_edge = min(edges)
            max_edge = max(edges)
            
            # Aspect ratio
            if min_edge > 0:
                aspect_ratio = max_edge / min_edge
                aspect_ratios.append(aspect_ratio)
            
            # Edge ratio
            if max_edge > 0:
                edge_ratio = min_edge / max_edge
                edge_ratios.append(edge_ratio)
            
            # Triangle area
            area = 0.5 * np.linalg.norm(np.cross(v1 - v0, v2 - v0))
            areas.append(area)
        
        # Aggregate metrics
        metrics['mean_aspect_ratio'] = np.mean(aspect_ratios) if aspect_ratios else 0
        metrics['max_aspect_ratio'] = np.max(aspect_ratios) if aspect_ratios else 0
        metrics['mean_edge_ratio'] = np.mean(edge_ratios) if edge_ratios else 0
        metrics['min_edge_ratio'] = np.min(edge_ratios) if edge_ratios else 0
        metrics['mean_triangle_area'] = np.mean(areas) if areas else 0
        metrics['area_variance'] = np.var(areas) if areas else 0
        
        return metrics
    
    def _detect_mesh_defects(self, mesh: o3d.geometry.TriangleMesh) -> List[Dict[str, Any]]:
        """Detect various mesh defects"""
        
        defects = []
        
        # Non-manifold vertices
        non_manifold_vertices = mesh.get_non_manifold_vertices()
        if len(non_manifold_vertices) > 0:
            defects.append({
                'type': 'non_manifold_vertices',
                'count': len(non_manifold_vertices),
                'indices': np.asarray(non_manifold_vertices).tolist(),
                'severity': 'high'
            })
        
        # Non-manifold edges
        non_manifold_edges = mesh.get_non_manifold_edges()
        if len(non_manifold_edges) > 0:
            defects.append({
                'type': 'non_manifold_edges',
                'count': len(non_manifold_edges),
                'indices': np.asarray(non_manifold_edges).tolist(),
                'severity': 'high'
            })
        
        # Degenerate triangles
        vertices = np.asarray(mesh.vertices)
        faces = np.asarray(mesh.triangles)
        
        degenerate_faces = []
        for i, face in enumerate(faces):
            v0, v1, v2 = vertices[face]
            area = 0.5 * np.linalg.norm(np.cross(v1 - v0, v2 - v0))
            if area < 1e-10:  # Very small area threshold
                degenerate_faces.append(i)
        
        if degenerate_faces:
            defects.append({
                'type': 'degenerate_triangles',
                'count': len(degenerate_faces),
                'indices': degenerate_faces,
                'severity': 'medium'
            })
        
        # Isolated vertices
        vertex_degrees = mesh.get_vertex_degrees()
        isolated_vertices = [i for i, degree in enumerate(vertex_degrees) if degree == 0]
        
        if isolated_vertices:
            defects.append({
                'type': 'isolated_vertices',
                'count': len(isolated_vertices),
                'indices': isolated_vertices,
                'severity': 'low'
            })
        
        return defects
    
    def _generate_repair_suggestions(
        self,
        is_watertight: bool,
        is_manifold: bool,
        has_self_intersections: bool,
        defects: List[Dict[str, Any]]
    ) -> List[str]:
        """Generate repair suggestions based on detected issues"""
        
        suggestions = []
        
        if not is_watertight:
            suggestions.append("Mesh is not watertight - consider hole filling")
        
        if not is_manifold:
            suggestions.append("Mesh is not manifold - repair non-manifold vertices/edges")
        
        if has_self_intersections:
            suggestions.append("Mesh has self-intersections - resolve intersecting faces")
        
        for defect in defects:
            if defect['type'] == 'non_manifold_vertices':
                suggestions.append(f"Remove or fix {defect['count']} non-manifold vertices")
            elif defect['type'] == 'non_manifold_edges':
                suggestions.append(f"Remove or fix {defect['count']} non-manifold edges")
            elif defect['type'] == 'degenerate_triangles':
                suggestions.append(f"Remove {defect['count']} degenerate triangles")
            elif defect['type'] == 'isolated_vertices':
                suggestions.append(f"Remove {defect['count']} isolated vertices")
        
        if not suggestions:
            suggestions.append("Mesh appears to be in good condition")
        
        return suggestions
    
    def repair_mesh(
        self,
        mesh: o3d.geometry.TriangleMesh,
        repair_holes: bool = True,
        remove_degenerate: bool = True,
        remove_duplicates: bool = True,
        fix_non_manifold: bool = True
    ) -> o3d.geometry.TriangleMesh:
        """Comprehensive mesh repair"""
        
        logger.info("Repairing mesh...")
        
        # Use PyMeshLab for advanced repair operations
        ms = pymeshlab.MeshSet()
        
        # Convert Open3D mesh to PyMeshLab format
        vertices = np.asarray(mesh.vertices)
        faces = np.asarray(mesh.triangles)
        
        # Create PyMeshLab mesh
        pymesh = pymeshlab.Mesh(vertex_matrix=vertices, face_matrix=faces)
        ms.add_mesh(pymesh)
        
        # Remove duplicate vertices
        if remove_duplicates:
            logger.info("Removing duplicate vertices...")
            ms.apply_filter('meshing_remove_duplicate_vertices')
        
        # Remove degenerate faces
        if remove_degenerate:
            logger.info("Removing degenerate faces...")
            ms.apply_filter('meshing_remove_null_faces')
            ms.apply_filter('meshing_remove_duplicate_faces')
        
        # Fix non-manifold edges and vertices
        if fix_non_manifold:
            logger.info("Fixing non-manifold elements...")
            try:
                ms.apply_filter('meshing_repair_non_manifold_edges')
                ms.apply_filter('meshing_repair_non_manifold_vertices')
            except Exception as e:
                logger.warning(f"Non-manifold repair failed: {e}")
        
        # Fill holes
        if repair_holes:
            logger.info("Filling holes...")
            try:
                ms.apply_filter('meshing_close_holes', maxholesize=30)
            except Exception as e:
                logger.warning(f"Hole filling failed: {e}")
        
        # Get repaired mesh
        repaired_pymesh = ms.current_mesh()
        
        # Convert back to Open3D
        repaired_mesh = o3d.geometry.TriangleMesh()
        repaired_mesh.vertices = o3d.utility.Vector3dVector(repaired_pymesh.vertex_matrix())
        repaired_mesh.triangles = o3d.utility.Vector3iVector(repaired_pymesh.face_matrix())
        
        # Recompute normals
        repaired_mesh.compute_vertex_normals()
        repaired_mesh.compute_triangle_normals()
        
        logger.info("Mesh repair completed")
        
        return repaired_mesh
    
    def simplify_mesh(
        self,
        mesh: o3d.geometry.TriangleMesh,
        target_triangles: int,
        method: SimplificationMethod = SimplificationMethod.QUADRIC_EDGE_COLLAPSE,
        preserve_boundary: bool = True
    ) -> SimplificationResult:
        """Simplify mesh using specified method"""
        
        start_time = time.time()
        
        logger.info(f"Simplifying mesh using {method.value}")
        
        original_vertices = len(mesh.vertices)
        original_faces = len(mesh.triangles)
        
        if method == SimplificationMethod.QUADRIC_EDGE_COLLAPSE:
            simplified_mesh = mesh.simplify_quadric_decimation(
                target_number_of_triangles=target_triangles
            )
        elif method == SimplificationMethod.CLUSTERING:
            simplified_mesh = mesh.simplify_vertex_clustering(
                voxel_size=self._compute_clustering_voxel_size(mesh, target_triangles)
            )
        else:
            # Use PyMeshLab for advanced simplification
            simplified_mesh = self._simplify_with_pymeshlab(mesh, target_triangles, method)
        
        simplified_vertices = len(simplified_mesh.vertices)
        simplified_faces = len(simplified_mesh.triangles)
        
        reduction_ratio = 1.0 - (simplified_faces / original_faces)
        quality_preservation = self._compute_quality_preservation(mesh, simplified_mesh)
        processing_time = time.time() - start_time
        
        logger.info(f"Simplification completed: {original_faces} -> {simplified_faces} faces")
        
        return SimplificationResult(
            original_vertices=original_vertices,
            original_faces=original_faces,
            simplified_vertices=simplified_vertices,
            simplified_faces=simplified_faces,
            reduction_ratio=reduction_ratio,
            quality_preservation=quality_preservation,
            processing_time=processing_time,
            method_used=method
        )
    
    def _compute_clustering_voxel_size(
        self, 
        mesh: o3d.geometry.TriangleMesh, 
        target_triangles: int
    ) -> float:
        """Compute appropriate voxel size for vertex clustering"""
        bbox = mesh.get_axis_aligned_bounding_box()
        bbox_size = np.linalg.norm(bbox.get_extent())
        
        # Estimate voxel size based on target triangle count
        current_triangles = len(mesh.triangles)
        reduction_factor = target_triangles / current_triangles
        voxel_size = bbox_size * 0.001 * (1.0 / reduction_factor) ** (1/3)
        
        return voxel_size
    
    def _simplify_with_pymeshlab(
        self,
        mesh: o3d.geometry.TriangleMesh,
        target_triangles: int,
        method: SimplificationMethod
    ) -> o3d.geometry.TriangleMesh:
        """Use PyMeshLab for advanced simplification"""
        
        ms = pymeshlab.MeshSet()
        
        # Convert to PyMeshLab format
        vertices = np.asarray(mesh.vertices)
        faces = np.asarray(mesh.triangles)
        pymesh = pymeshlab.Mesh(vertex_matrix=vertices, face_matrix=faces)
        ms.add_mesh(pymesh)
        
        if method == SimplificationMethod.PROGRESSIVE:
            ms.apply_filter(
                'meshing_decimation_quadric_edge_collapse',
                targetfacenum=target_triangles,
                preserveboundary=True,
                preservenormal=True,
                preservetopology=True
            )
        elif method == SimplificationMethod.FEATURE_PRESERVING:
            ms.apply_filter(
                'meshing_decimation_quadric_edge_collapse_with_texture',
                targetfacenum=target_triangles,
                preserveboundary=True
            )
        
        # Convert back to Open3D
        simplified_pymesh = ms.current_mesh()
        simplified_mesh = o3d.geometry.TriangleMesh()
        simplified_mesh.vertices = o3d.utility.Vector3dVector(simplified_pymesh.vertex_matrix())
        simplified_mesh.triangles = o3d.utility.Vector3iVector(simplified_pymesh.face_matrix())
        
        return simplified_mesh
    
    def _compute_quality_preservation(
        self,
        original: o3d.geometry.TriangleMesh,
        simplified: o3d.geometry.TriangleMesh
    ) -> float:
        """Compute how well the simplified mesh preserves the original quality"""
        
        # Sample points from both meshes
        original_points = original.sample_points_uniformly(number_of_points=1000)
        simplified_points = simplified.sample_points_uniformly(number_of_points=1000)
        
        # Compute Hausdorff distance
        orig_pts = np.asarray(original_points.points)
        simp_pts = np.asarray(simplified_points.points)
        
        # Distance from original to simplified
        tree_simp = cKDTree(simp_pts)
        dist_to_simp, _ = tree_simp.query(orig_pts)
        max_dist_to_simp = np.max(dist_to_simp)
        
        # Distance from simplified to original
        tree_orig = cKDTree(orig_pts)
        dist_to_orig, _ = tree_orig.query(simp_pts)
        max_dist_to_orig = np.max(dist_to_orig)
        
        hausdorff_distance = max(max_dist_to_simp, max_dist_to_orig)
        
        # Normalize by bounding box diagonal
        bbox = original.get_axis_aligned_bounding_box()
        bbox_diagonal = np.linalg.norm(bbox.get_extent())
        
        normalized_distance = hausdorff_distance / bbox_diagonal
        quality_preservation = max(0, 1.0 - normalized_distance)
        
        return quality_preservation
    
    def generate_texture_coordinates(
        self,
        mesh: o3d.geometry.TriangleMesh,
        method: TextureMethod = TextureMethod.ANGLE_BASED,
        texture_resolution: Tuple[int, int] = (1024, 1024)
    ) -> TextureResult:
        """Generate texture coordinates for mesh"""
        
        logger.info(f"Generating texture coordinates using {method.value}")
        
        vertices = np.asarray(mesh.vertices)
        faces = np.asarray(mesh.triangles)
        
        if method == TextureMethod.PLANAR:
            uv_coords = self._planar_mapping(vertices)
        elif method == TextureMethod.CYLINDRICAL:
            uv_coords = self._cylindrical_mapping(vertices)
        elif method == TextureMethod.SPHERICAL:
            uv_coords = self._spherical_mapping(vertices)
        elif method == TextureMethod.ANGLE_BASED:
            uv_coords = self._angle_based_mapping(vertices, faces)
        else:
            uv_coords = self._conformal_mapping(vertices, faces)
        
        # Create texture image
        texture_image = self._create_texture_image(
            vertices, faces, uv_coords, texture_resolution
        )
        
        # Compute quality metrics
        seam_length = self._compute_seam_length(faces, uv_coords)
        distortion_metrics = self._compute_distortion_metrics(vertices, faces, uv_coords)
        
        return TextureResult(
            uv_coordinates=uv_coords,
            texture_image=texture_image,
            texture_resolution=texture_resolution,
            seam_length=seam_length,
            distortion_metrics=distortion_metrics,
            mapping_method=method
        )
    
    def _planar_mapping(self, vertices: np.ndarray) -> np.ndarray:
        """Generate planar UV mapping"""
        
        # Project to dominant plane
        pca = PCA()
        pca.fit(vertices)
        
        # Use first two principal components
        projected = pca.transform(vertices)[:, :2]
        
        # Normalize to [0, 1]
        min_vals = np.min(projected, axis=0)
        max_vals = np.max(projected, axis=0)
        uv_coords = (projected - min_vals) / (max_vals - min_vals + 1e-10)
        
        return uv_coords
    
    def _cylindrical_mapping(self, vertices: np.ndarray) -> np.ndarray:
        """Generate cylindrical UV mapping"""
        
        # Center vertices
        centroid = np.mean(vertices, axis=0)
        centered = vertices - centroid
        
        # Convert to cylindrical coordinates
        x, y, z = centered.T
        
        # Theta (angle around cylinder)
        theta = np.arctan2(y, x)
        u = (theta + np.pi) / (2 * np.pi)  # Normalize to [0, 1]
        
        # Height along cylinder
        v = (z - np.min(z)) / (np.max(z) - np.min(z) + 1e-10)
        
        return np.column_stack([u, v])
    
    def _spherical_mapping(self, vertices: np.ndarray) -> np.ndarray:
        """Generate spherical UV mapping"""
        
        # Center vertices
        centroid = np.mean(vertices, axis=0)
        centered = vertices - centroid
        
        # Convert to spherical coordinates
        x, y, z = centered.T
        r = np.linalg.norm(centered, axis=1)
        
        # Avoid division by zero
        r = np.maximum(r, 1e-10)
        
        # Theta (azimuthal angle)
        theta = np.arctan2(y, x)
        u = (theta + np.pi) / (2 * np.pi)
        
        # Phi (polar angle)
        phi = np.arccos(np.clip(z / r, -1, 1))
        v = phi / np.pi
        
        return np.column_stack([u, v])
    
    def _angle_based_mapping(self, vertices: np.ndarray, faces: np.ndarray) -> np.ndarray:
        """Generate angle-based UV mapping (simplified version)"""
        
        # This is a simplified implementation
        # For production, you'd use a more sophisticated algorithm like LSCM
        
        # Start with planar mapping as base
        uv_coords = self._planar_mapping(vertices)
        
        # Apply local relaxation to reduce distortion
        for _ in range(5):  # Limited iterations for simplicity
            uv_coords = self._relax_uv_coordinates(vertices, faces, uv_coords)
        
        return uv_coords
    
    def _conformal_mapping(self, vertices: np.ndarray, faces: np.ndarray) -> np.ndarray:
        """Generate conformal UV mapping (simplified version)"""
        
        # This is a placeholder for conformal mapping
        # Production implementation would use algorithms like LSCM or ABF++
        return self._angle_based_mapping(vertices, faces)
    
    def _relax_uv_coordinates(
        self,
        vertices: np.ndarray,
        faces: np.ndarray,
        uv_coords: np.ndarray
    ) -> np.ndarray:
        """Apply relaxation to UV coordinates to reduce distortion"""
        
        new_uv = uv_coords.copy()
        
        # Build adjacency
        adjacency = {}
        for face in faces:
            for i in range(3):
                v1, v2 = face[i], face[(i + 1) % 3]
                if v1 not in adjacency:
                    adjacency[v1] = set()
                if v2 not in adjacency:
                    adjacency[v2] = set()
                adjacency[v1].add(v2)
                adjacency[v2].add(v1)
        
        # Laplacian smoothing
        for vertex_idx in range(len(vertices)):
            if vertex_idx in adjacency:
                neighbors = list(adjacency[vertex_idx])
                if neighbors:
                    neighbor_uvs = uv_coords[neighbors]
                    new_uv[vertex_idx] = np.mean(neighbor_uvs, axis=0)
        
        return new_uv
    
    def _create_texture_image(
        self,
        vertices: np.ndarray,
        faces: np.ndarray,
        uv_coords: np.ndarray,
        resolution: Tuple[int, int]
    ) -> np.ndarray:
        """Create texture image based on mesh geometry"""
        
        width, height = resolution
        texture_image = np.ones((height, width, 3), dtype=np.uint8) * 128  # Gray background
        
        # Rasterize mesh triangles into texture space
        for face in faces:
            # Get triangle vertices in UV space
            triangle_uv = uv_coords[face] * np.array([width - 1, height - 1])
            triangle_uv = triangle_uv.astype(int)
            
            # Simple triangle fill (could be more sophisticated)
            cv2.fillPoly(texture_image, [triangle_uv], color=(200, 200, 200))
            cv2.polylines(texture_image, [triangle_uv], isClosed=True, color=(0, 0, 0), thickness=1)
        
        return texture_image
    
    def _compute_seam_length(self, faces: np.ndarray, uv_coords: np.ndarray) -> float:
        """Compute total length of UV seams"""
        
        # This is a simplified computation
        # Real implementation would identify actual seams in UV space
        
        edge_lengths = []
        edges = set()
        
        for face in faces:
            for i in range(3):
                v1, v2 = face[i], face[(i + 1) % 3]
                edge = tuple(sorted([v1, v2]))
                if edge not in edges:
                    edges.add(edge)
                    uv1, uv2 = uv_coords[v1], uv_coords[v2]
                    length = np.linalg.norm(uv2 - uv1)
                    edge_lengths.append(length)
        
        return sum(edge_lengths)
    
    def _compute_distortion_metrics(
        self,
        vertices: np.ndarray,
        faces: np.ndarray,
        uv_coords: np.ndarray
    ) -> Dict[str, float]:
        """Compute texture mapping distortion metrics"""
        
        angle_distortions = []
        area_distortions = []
        
        for face in faces:
            # 3D triangle
            v0_3d, v1_3d, v2_3d = vertices[face]
            
            # 2D triangle (UV)
            v0_2d, v1_2d, v2_2d = uv_coords[face]
            
            # Compute 3D edges and angles
            e1_3d = v1_3d - v0_3d
            e2_3d = v2_3d - v0_3d
            
            angle_3d = np.arccos(
                np.clip(
                    np.dot(e1_3d, e2_3d) / (np.linalg.norm(e1_3d) * np.linalg.norm(e2_3d)),
                    -1, 1
                )
            )
            
            # Compute 2D edges and angles
            e1_2d = v1_2d - v0_2d
            e2_2d = v2_2d - v0_2d
            
            if np.linalg.norm(e1_2d) > 0 and np.linalg.norm(e2_2d) > 0:
                angle_2d = np.arccos(
                    np.clip(
                        np.dot(e1_2d, e2_2d) / (np.linalg.norm(e1_2d) * np.linalg.norm(e2_2d)),
                        -1, 1
                    )
                )
                
                angle_distortion = abs(angle_3d - angle_2d)
                angle_distortions.append(angle_distortion)
            
            # Compute area distortion
            area_3d = 0.5 * np.linalg.norm(np.cross(e1_3d, e2_3d))
            area_2d = 0.5 * abs(np.cross(e1_2d, e2_2d))
            
            if area_3d > 0 and area_2d > 0:
                area_ratio = area_2d / area_3d
                area_distortion = abs(np.log(area_ratio))
                area_distortions.append(area_distortion)
        
        return {
            'mean_angle_distortion': np.mean(angle_distortions) if angle_distortions else 0,
            'max_angle_distortion': np.max(angle_distortions) if angle_distortions else 0,
            'mean_area_distortion': np.mean(area_distortions) if area_distortions else 0,
            'max_area_distortion': np.max(area_distortions) if area_distortions else 0
        }
    
    def compute_mesh_curvature(self, mesh: o3d.geometry.TriangleMesh) -> Dict[str, np.ndarray]:
        """Compute mesh curvature (mean and Gaussian)"""
        
        # Ensure normals are computed
        if not mesh.has_vertex_normals():
            mesh.compute_vertex_normals()
        
        vertices = np.asarray(mesh.vertices)
        faces = np.asarray(mesh.triangles)
        normals = np.asarray(mesh.vertex_normals)
        
        # Build vertex adjacency
        vertex_neighbors = [[] for _ in range(len(vertices))]
        for face in faces:
            for i in range(3):
                v1, v2 = face[i], face[(i + 1) % 3]
                vertex_neighbors[v1].append(v2)
                vertex_neighbors[v2].append(v1)
        
        mean_curvatures = []
        gaussian_curvatures = []
        
        for i, vertex in enumerate(vertices):
            neighbors = list(set(vertex_neighbors[i]))  # Remove duplicates
            
            if len(neighbors) < 3:
                mean_curvatures.append(0.0)
                gaussian_curvatures.append(0.0)
                continue
            
            # Compute mean curvature using Laplace-Beltrami operator
            laplacian = np.zeros(3)
            total_weight = 0
            
            for neighbor_idx in neighbors:
                neighbor = vertices[neighbor_idx]
                edge_vector = neighbor - vertex
                weight = 1.0 / (np.linalg.norm(edge_vector) + 1e-10)
                laplacian += weight * edge_vector
                total_weight += weight
            
            if total_weight > 0:
                laplacian /= total_weight
            
            # Mean curvature magnitude
            mean_curvature = 0.5 * np.linalg.norm(laplacian)
            mean_curvatures.append(mean_curvature)
            
            # Gaussian curvature (simplified estimation)
            # This is an approximation - exact computation requires more complex geometry
            angle_sum = 0
            for j in range(len(neighbors)):
                v1 = vertices[neighbors[j]] - vertex
                v2 = vertices[neighbors[(j + 1) % len(neighbors)]] - vertex
                
                if np.linalg.norm(v1) > 0 and np.linalg.norm(v2) > 0:
                    cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
                    cos_angle = np.clip(cos_angle, -1, 1)
                    angle = np.arccos(cos_angle)
                    angle_sum += angle
            
            gaussian_curvature = (2 * np.pi - angle_sum) / len(neighbors) if neighbors else 0
            gaussian_curvatures.append(gaussian_curvature)
        
        return {
            'mean_curvature': np.array(mean_curvatures),
            'gaussian_curvature': np.array(gaussian_curvatures)
        }
    
    def smooth_mesh(
        self,
        mesh: o3d.geometry.TriangleMesh,
        iterations: int = 5,
        lambda_factor: float = 0.5,
        method: str = "laplacian"
    ) -> o3d.geometry.TriangleMesh:
        """Smooth mesh using specified method"""
        
        if method == "laplacian":
            # Use Open3D's Laplacian smoothing
            smoothed_mesh = mesh.filter_smooth_laplacian(
                number_of_iterations=iterations,
                lambda_filter=lambda_factor
            )
        elif method == "taubin":
            # Use Open3D's Taubin smoothing
            smoothed_mesh = mesh.filter_smooth_taubin(
                number_of_iterations=iterations,
                lambda_filter=lambda_factor,
                mu=-lambda_factor - 0.01
            )
        else:
            # Use PyMeshLab for more advanced smoothing
            ms = pymeshlab.MeshSet()
            vertices = np.asarray(mesh.vertices)
            faces = np.asarray(mesh.triangles)
            pymesh = pymeshlab.Mesh(vertex_matrix=vertices, face_matrix=faces)
            ms.add_mesh(pymesh)
            
            ms.apply_filter(
                'apply_coord_laplacian_smoothing',
                stepsmoothnum=iterations,
                lambda_=lambda_factor
            )
            
            smoothed_pymesh = ms.current_mesh()
            smoothed_mesh = o3d.geometry.TriangleMesh()
            smoothed_mesh.vertices = o3d.utility.Vector3dVector(smoothed_pymesh.vertex_matrix())
            smoothed_mesh.triangles = o3d.utility.Vector3iVector(smoothed_pymesh.face_matrix())
        
        # Recompute normals
        smoothed_mesh.compute_vertex_normals()
        smoothed_mesh.compute_triangle_normals()
        
        return smoothed_mesh 