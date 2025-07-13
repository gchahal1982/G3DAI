#!/usr/bin/env python3
"""
Advanced Point Cloud Processing Utilities
Specialized algorithms for point cloud registration, feature extraction, and analysis
"""

import logging
import time
from typing import Dict, List, Optional, Any, Union, Tuple
from enum import Enum
from dataclasses import dataclass
import math

import numpy as np
import open3d as o3d
import cv2
from scipy.spatial import ConvexHull, distance_matrix, KDTree
from scipy.spatial.transform import Rotation as R
from scipy.optimize import minimize
from sklearn.cluster import DBSCAN, KMeans, AgglomerativeClustering
from sklearn.decomposition import PCA, FastICA
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
import trimesh
import pandas as pd

# Configure logging
logger = logging.getLogger(__name__)

class RegistrationMethod(str, Enum):
    """Point cloud registration methods"""
    ICP = "icp"
    COLORED_ICP = "colored_icp"
    FAST_GLOBAL = "fast_global"
    RANSAC = "ransac"
    FEATURE_BASED = "feature_based"
    COHERENT_POINT_DRIFT = "cpd"

class FeatureType(str, Enum):
    """Point cloud feature types"""
    FPFH = "fpfh"
    SHOT = "shot"
    SPIN_IMAGE = "spin_image"
    POINTNET_FEATURES = "pointnet_features"
    GEOMETRIC_FEATURES = "geometric_features"

class SegmentationMethod(str, Enum):
    """Point cloud segmentation methods"""
    REGION_GROWING = "region_growing"
    EUCLIDEAN_CLUSTERING = "euclidean_clustering"
    PLANE_SEGMENTATION = "plane_segmentation"
    CYLINDER_SEGMENTATION = "cylinder_segmentation"
    SUPERVOXEL = "supervoxel"

@dataclass
class RegistrationResult:
    """Point cloud registration result"""
    transformation: np.ndarray
    fitness: float
    rmse: float
    correspondence_set: np.ndarray
    converged: bool
    iterations: int
    registration_time: float

@dataclass
class FeatureDescriptor:
    """Point cloud feature descriptor"""
    features: np.ndarray
    keypoints: np.ndarray
    feature_type: FeatureType
    descriptor_size: int
    extraction_time: float

@dataclass
class SegmentationResult:
    """Point cloud segmentation result"""
    labels: np.ndarray
    num_segments: int
    segment_info: List[Dict[str, Any]]
    largest_segment_ratio: float
    segmentation_time: float

class PointCloudUtils:
    """Advanced point cloud processing utilities"""
    
    def __init__(self):
        self.voxel_size = 0.05
        self.max_correspondence_distance = 2.0 * self.voxel_size
        
    def preprocess_point_cloud(
        self,
        pcd: o3d.geometry.PointCloud,
        voxel_size: float = None,
        remove_outliers: bool = True,
        estimate_normals: bool = True
    ) -> o3d.geometry.PointCloud:
        """Preprocess point cloud with standard operations"""
        
        if voxel_size is None:
            voxel_size = self.voxel_size
        
        logger.info(f"Preprocessing point cloud with {len(pcd.points)} points")
        
        # Voxel downsampling
        pcd_down = pcd.voxel_down_sample(voxel_size)
        logger.info(f"Downsampled to {len(pcd_down.points)} points")
        
        # Remove outliers
        if remove_outliers:
            pcd_down, _ = pcd_down.remove_statistical_outlier(
                nb_neighbors=20, std_ratio=2.0
            )
            logger.info(f"After outlier removal: {len(pcd_down.points)} points")
        
        # Estimate normals
        if estimate_normals:
            radius_normal = voxel_size * 2
            pcd_down.estimate_normals(
                o3d.geometry.KDTreeSearchParamHybrid(
                    radius=radius_normal, max_nn=30
                )
            )
        
        return pcd_down
    
    def register_point_clouds(
        self,
        source: o3d.geometry.PointCloud,
        target: o3d.geometry.PointCloud,
        method: RegistrationMethod = RegistrationMethod.ICP,
        initial_transformation: Optional[np.ndarray] = None,
        max_iterations: int = 50,
        convergence_criteria: float = 1e-6
    ) -> RegistrationResult:
        """Register two point clouds using specified method"""
        
        start_time = time.time()
        
        logger.info(f"Registering point clouds using {method.value}")
        
        # Preprocess point clouds
        source_down = self.preprocess_point_cloud(source)
        target_down = self.preprocess_point_cloud(target)
        
        if initial_transformation is None:
            initial_transformation = np.eye(4)
        
        if method == RegistrationMethod.ICP:
            result = self._register_icp(
                source_down, target_down, initial_transformation,
                max_iterations, convergence_criteria
            )
        elif method == RegistrationMethod.COLORED_ICP:
            result = self._register_colored_icp(
                source_down, target_down, initial_transformation,
                max_iterations, convergence_criteria
            )
        elif method == RegistrationMethod.FAST_GLOBAL:
            result = self._register_fast_global(source_down, target_down)
        elif method == RegistrationMethod.FEATURE_BASED:
            result = self._register_feature_based(source_down, target_down)
        else:
            raise ValueError(f"Unsupported registration method: {method}")
        
        registration_time = time.time() - start_time
        result.registration_time = registration_time
        
        logger.info(f"Registration completed in {registration_time:.2f}s")
        logger.info(f"Fitness: {result.fitness:.4f}, RMSE: {result.rmse:.4f}")
        
        return result
    
    def _register_icp(
        self,
        source: o3d.geometry.PointCloud,
        target: o3d.geometry.PointCloud,
        initial_transformation: np.ndarray,
        max_iterations: int,
        convergence_criteria: float
    ) -> RegistrationResult:
        """Point-to-point ICP registration"""
        
        # Set up ICP criteria
        criteria = o3d.pipelines.registration.ICPConvergenceCriteria(
            relative_fitness=convergence_criteria,
            relative_rmse=convergence_criteria,
            max_iteration=max_iterations
        )
        
        # Run ICP
        reg_result = o3d.pipelines.registration.registration_icp(
            source, target,
            max_correspondence_distance=self.max_correspondence_distance,
            init=initial_transformation,
            estimation_method=o3d.pipelines.registration.TransformationEstimationPointToPoint(),
            criteria=criteria
        )
        
        return RegistrationResult(
            transformation=reg_result.transformation,
            fitness=reg_result.fitness,
            rmse=reg_result.inlier_rmse,
            correspondence_set=np.asarray(reg_result.correspondence_set),
            converged=True,  # Open3D doesn't provide convergence info
            iterations=max_iterations,  # Approximation
            registration_time=0.0  # Will be set by caller
        )
    
    def _register_colored_icp(
        self,
        source: o3d.geometry.PointCloud,
        target: o3d.geometry.PointCloud,
        initial_transformation: np.ndarray,
        max_iterations: int,
        convergence_criteria: float
    ) -> RegistrationResult:
        """Colored ICP registration"""
        
        if not source.has_colors() or not target.has_colors():
            logger.warning("Point clouds don't have colors, falling back to standard ICP")
            return self._register_icp(
                source, target, initial_transformation,
                max_iterations, convergence_criteria
            )
        
        # Set up colored ICP criteria
        criteria = o3d.pipelines.registration.ICPConvergenceCriteria(
            relative_fitness=convergence_criteria,
            relative_rmse=convergence_criteria,
            max_iteration=max_iterations
        )
        
        # Run colored ICP
        reg_result = o3d.pipelines.registration.registration_colored_icp(
            source, target,
            max_correspondence_distance=self.max_correspondence_distance,
            init=initial_transformation,
            estimation_method=o3d.pipelines.registration.TransformationEstimationForColoredICP(),
            criteria=criteria
        )
        
        return RegistrationResult(
            transformation=reg_result.transformation,
            fitness=reg_result.fitness,
            rmse=reg_result.inlier_rmse,
            correspondence_set=np.asarray(reg_result.correspondence_set),
            converged=True,
            iterations=max_iterations,
            registration_time=0.0
        )
    
    def _register_fast_global(
        self,
        source: o3d.geometry.PointCloud,
        target: o3d.geometry.PointCloud
    ) -> RegistrationResult:
        """Fast global registration"""
        
        # Extract FPFH features
        source_fpfh = self.extract_fpfh_features(source)
        target_fpfh = self.extract_fpfh_features(target)
        
        # Run fast global registration
        reg_result = o3d.pipelines.registration.registration_fgr_based_on_feature_matching(
            source, target,
            source_fpfh.features, target_fpfh.features,
            o3d.pipelines.registration.FastGlobalRegistrationOption(
                maximum_correspondence_distance=self.max_correspondence_distance
            )
        )
        
        return RegistrationResult(
            transformation=reg_result.transformation,
            fitness=reg_result.fitness,
            rmse=reg_result.inlier_rmse,
            correspondence_set=np.asarray(reg_result.correspondence_set),
            converged=True,
            iterations=1,  # FGR is single-shot
            registration_time=0.0
        )
    
    def _register_feature_based(
        self,
        source: o3d.geometry.PointCloud,
        target: o3d.geometry.PointCloud
    ) -> RegistrationResult:
        """Feature-based registration using RANSAC"""
        
        # Extract features
        source_fpfh = self.extract_fpfh_features(source)
        target_fpfh = self.extract_fpfh_features(target)
        
        # RANSAC registration
        reg_result = o3d.pipelines.registration.registration_ransac_based_on_feature_matching(
            source, target,
            source_fpfh.features, target_fpfh.features,
            mutual_filter=True,
            max_correspondence_distance=self.max_correspondence_distance,
            estimation_method=o3d.pipelines.registration.TransformationEstimationPointToPoint(False),
            ransac_n=3,
            checkers=[
                o3d.pipelines.registration.CorrespondenceCheckerBasedOnEdgeLength(0.9),
                o3d.pipelines.registration.CorrespondenceCheckerBasedOnDistance(self.max_correspondence_distance)
            ],
            criteria=o3d.pipelines.registration.RANSACConvergenceCriteria(100000, 0.999)
        )
        
        return RegistrationResult(
            transformation=reg_result.transformation,
            fitness=reg_result.fitness,
            rmse=reg_result.inlier_rmse,
            correspondence_set=np.asarray(reg_result.correspondence_set),
            converged=True,
            iterations=1,
            registration_time=0.0
        )
    
    def extract_features(
        self,
        pcd: o3d.geometry.PointCloud,
        feature_type: FeatureType = FeatureType.FPFH,
        keypoint_ratio: float = 0.1
    ) -> FeatureDescriptor:
        """Extract features from point cloud"""
        
        start_time = time.time()
        
        logger.info(f"Extracting {feature_type.value} features")
        
        if feature_type == FeatureType.FPFH:
            result = self.extract_fpfh_features(pcd)
        elif feature_type == FeatureType.SHOT:
            result = self.extract_shot_features(pcd)
        elif feature_type == FeatureType.GEOMETRIC_FEATURES:
            result = self.extract_geometric_features(pcd)
        else:
            raise ValueError(f"Unsupported feature type: {feature_type}")
        
        extraction_time = time.time() - start_time
        result.extraction_time = extraction_time
        
        logger.info(f"Feature extraction completed in {extraction_time:.2f}s")
        
        return result
    
    def extract_fpfh_features(self, pcd: o3d.geometry.PointCloud) -> FeatureDescriptor:
        """Extract Fast Point Feature Histograms (FPFH)"""
        
        # Estimate normals if not available
        if not pcd.has_normals():
            pcd.estimate_normals(
                o3d.geometry.KDTreeSearchParamHybrid(
                    radius=self.voxel_size * 2, max_nn=30
                )
            )
        
        # Compute FPFH features
        fpfh = o3d.pipelines.registration.compute_fpfh_feature(
            pcd,
            o3d.geometry.KDTreeSearchParamHybrid(
                radius=self.voxel_size * 5, max_nn=100
            )
        )
        
        return FeatureDescriptor(
            features=fpfh,
            keypoints=np.asarray(pcd.points),
            feature_type=FeatureType.FPFH,
            descriptor_size=fpfh.dimension,
            extraction_time=0.0
        )
    
    def extract_shot_features(self, pcd: o3d.geometry.PointCloud) -> FeatureDescriptor:
        """Extract SHOT (Signature of Histograms of OrienTations) features"""
        
        # Estimate normals if not available
        if not pcd.has_normals():
            pcd.estimate_normals(
                o3d.geometry.KDTreeSearchParamHybrid(
                    radius=self.voxel_size * 2, max_nn=30
                )
            )
        
        # Subsample for keypoints
        keypoint_indices = np.random.choice(
            len(pcd.points), 
            min(1000, len(pcd.points) // 10), 
            replace=False
        )
        
        keypoints = o3d.geometry.PointCloud()
        keypoints.points = o3d.utility.Vector3dVector(
            np.asarray(pcd.points)[keypoint_indices]
        )
        keypoints.normals = o3d.utility.Vector3dVector(
            np.asarray(pcd.normals)[keypoint_indices]
        )
        
        # Compute SHOT features
        shot = o3d.pipelines.registration.compute_shot_feature(
            pcd, keypoints,
            o3d.geometry.KDTreeSearchParamHybrid(
                radius=self.voxel_size * 10, max_nn=100
            )
        )
        
        return FeatureDescriptor(
            features=shot,
            keypoints=np.asarray(keypoints.points),
            feature_type=FeatureType.SHOT,
            descriptor_size=shot.dimension,
            extraction_time=0.0
        )
    
    def extract_geometric_features(self, pcd: o3d.geometry.PointCloud) -> FeatureDescriptor:
        """Extract geometric features (curvature, planarity, etc.)"""
        
        points = np.asarray(pcd.points)
        
        # Build KD-tree for neighbor search
        tree = KDTree(points)
        
        geometric_features = []
        
        for i, point in enumerate(points):
            # Find neighbors
            distances, indices = tree.query(point, k=min(30, len(points)))
            neighbor_points = points[indices[1:]]  # Exclude the point itself
            
            if len(neighbor_points) < 3:
                geometric_features.append(np.zeros(6))
                continue
            
            # Compute local features
            features = self._compute_local_geometric_features(point, neighbor_points)
            geometric_features.append(features)
        
        features_array = np.array(geometric_features)
        
        return FeatureDescriptor(
            features=o3d.pipelines.registration.Feature(features_array.T),
            keypoints=points,
            feature_type=FeatureType.GEOMETRIC_FEATURES,
            descriptor_size=features_array.shape[1],
            extraction_time=0.0
        )
    
    def _compute_local_geometric_features(
        self, 
        point: np.ndarray, 
        neighbors: np.ndarray
    ) -> np.ndarray:
        """Compute local geometric features for a point"""
        
        # Center neighbors around the point
        centered = neighbors - point
        
        # Compute covariance matrix
        cov_matrix = np.cov(centered.T)
        
        # Eigenvalue decomposition
        eigenvals, eigenvecs = np.linalg.eigh(cov_matrix)
        eigenvals = np.sort(eigenvals)[::-1]  # Sort in descending order
        
        # Normalize eigenvalues
        eigenvals = eigenvals / np.sum(eigenvals + 1e-10)
        
        # Compute geometric features
        linearity = (eigenvals[0] - eigenvals[1]) / (eigenvals[0] + 1e-10)
        planarity = (eigenvals[1] - eigenvals[2]) / (eigenvals[0] + 1e-10)
        scattering = eigenvals[2] / (eigenvals[0] + 1e-10)
        omnivariance = (eigenvals[0] * eigenvals[1] * eigenvals[2]) ** (1/3)
        anisotropy = (eigenvals[0] - eigenvals[2]) / (eigenvals[0] + 1e-10)
        eigenentropy = -np.sum(eigenvals * np.log(eigenvals + 1e-10))
        
        return np.array([linearity, planarity, scattering, omnivariance, anisotropy, eigenentropy])
    
    def segment_point_cloud(
        self,
        pcd: o3d.geometry.PointCloud,
        method: SegmentationMethod = SegmentationMethod.EUCLIDEAN_CLUSTERING,
        **kwargs
    ) -> SegmentationResult:
        """Segment point cloud using specified method"""
        
        start_time = time.time()
        
        logger.info(f"Segmenting point cloud using {method.value}")
        
        if method == SegmentationMethod.EUCLIDEAN_CLUSTERING:
            result = self._segment_euclidean_clustering(pcd, **kwargs)
        elif method == SegmentationMethod.REGION_GROWING:
            result = self._segment_region_growing(pcd, **kwargs)
        elif method == SegmentationMethod.PLANE_SEGMENTATION:
            result = self._segment_planes(pcd, **kwargs)
        else:
            raise ValueError(f"Unsupported segmentation method: {method}")
        
        segmentation_time = time.time() - start_time
        result.segmentation_time = segmentation_time
        
        logger.info(f"Segmentation completed in {segmentation_time:.2f}s")
        logger.info(f"Found {result.num_segments} segments")
        
        return result
    
    def _segment_euclidean_clustering(
        self,
        pcd: o3d.geometry.PointCloud,
        eps: float = 0.02,
        min_points: int = 10
    ) -> SegmentationResult:
        """Euclidean clustering segmentation"""
        
        labels = np.array(pcd.cluster_dbscan(eps=eps, min_points=min_points))
        
        unique_labels = np.unique(labels)
        num_segments = len(unique_labels[unique_labels >= 0])  # Exclude noise (-1)
        
        # Analyze segments
        segment_info = []
        for label in unique_labels:
            if label >= 0:  # Exclude noise
                mask = labels == label
                segment_points = np.asarray(pcd.points)[mask]
                
                # Compute segment statistics
                centroid = np.mean(segment_points, axis=0)
                bbox_min = np.min(segment_points, axis=0)
                bbox_max = np.max(segment_points, axis=0)
                volume = np.prod(bbox_max - bbox_min)
                
                segment_info.append({
                    'label': int(label),
                    'point_count': int(np.sum(mask)),
                    'centroid': centroid.tolist(),
                    'bounding_box': {
                        'min': bbox_min.tolist(),
                        'max': bbox_max.tolist(),
                        'volume': float(volume)
                    }
                })
        
        # Find largest segment
        largest_segment_size = max([info['point_count'] for info in segment_info]) if segment_info else 0
        largest_segment_ratio = largest_segment_size / len(pcd.points) if len(pcd.points) > 0 else 0
        
        return SegmentationResult(
            labels=labels,
            num_segments=num_segments,
            segment_info=segment_info,
            largest_segment_ratio=largest_segment_ratio,
            segmentation_time=0.0
        )
    
    def _segment_region_growing(
        self,
        pcd: o3d.geometry.PointCloud,
        normal_threshold: float = 0.1,
        curvature_threshold: float = 0.05
    ) -> SegmentationResult:
        """Region growing segmentation"""
        
        # Ensure normals are computed
        if not pcd.has_normals():
            pcd.estimate_normals()
        
        points = np.asarray(pcd.points)
        normals = np.asarray(pcd.normals)
        
        # Compute curvature
        tree = KDTree(points)
        curvatures = []
        
        for i, point in enumerate(points):
            _, indices = tree.query(point, k=min(20, len(points)))
            neighbor_normals = normals[indices]
            
            # Curvature as variance of normal directions
            curvature = np.var(neighbor_normals, axis=0).sum()
            curvatures.append(curvature)
        
        curvatures = np.array(curvatures)
        
        # Initialize labels
        labels = np.full(len(points), -1, dtype=int)
        current_label = 0
        
        # Sort points by curvature (start with smoothest regions)
        sorted_indices = np.argsort(curvatures)
        
        for seed_idx in sorted_indices:
            if labels[seed_idx] != -1:  # Already labeled
                continue
            
            # Start new region
            region = [seed_idx]
            labels[seed_idx] = current_label
            queue = [seed_idx]
            
            while queue:
                current_idx = queue.pop(0)
                current_normal = normals[current_idx]
                
                # Find neighbors
                _, neighbor_indices = tree.query(points[current_idx], k=20)
                
                for neighbor_idx in neighbor_indices[1:]:  # Exclude self
                    if labels[neighbor_idx] != -1:  # Already labeled
                        continue
                    
                    neighbor_normal = normals[neighbor_idx]
                    
                    # Check normal similarity
                    normal_angle = np.arccos(
                        np.clip(np.dot(current_normal, neighbor_normal), -1, 1)
                    )
                    
                    if (normal_angle < normal_threshold and 
                        curvatures[neighbor_idx] < curvature_threshold):
                        
                        labels[neighbor_idx] = current_label
                        region.append(neighbor_idx)
                        queue.append(neighbor_idx)
            
            if len(region) >= 10:  # Minimum region size
                current_label += 1
            else:
                # Mark small regions as noise
                for idx in region:
                    labels[idx] = -1
        
        # Create segment info
        unique_labels = np.unique(labels)
        num_segments = len(unique_labels[unique_labels >= 0])
        
        segment_info = []
        for label in unique_labels:
            if label >= 0:
                mask = labels == label
                segment_points = points[mask]
                
                centroid = np.mean(segment_points, axis=0)
                bbox_min = np.min(segment_points, axis=0)
                bbox_max = np.max(segment_points, axis=0)
                volume = np.prod(bbox_max - bbox_min)
                
                segment_info.append({
                    'label': int(label),
                    'point_count': int(np.sum(mask)),
                    'centroid': centroid.tolist(),
                    'bounding_box': {
                        'min': bbox_min.tolist(),
                        'max': bbox_max.tolist(),
                        'volume': float(volume)
                    }
                })
        
        largest_segment_size = max([info['point_count'] for info in segment_info]) if segment_info else 0
        largest_segment_ratio = largest_segment_size / len(points) if len(points) > 0 else 0
        
        return SegmentationResult(
            labels=labels,
            num_segments=num_segments,
            segment_info=segment_info,
            largest_segment_ratio=largest_segment_ratio,
            segmentation_time=0.0
        )
    
    def _segment_planes(
        self,
        pcd: o3d.geometry.PointCloud,
        distance_threshold: float = 0.01,
        ransac_n: int = 3,
        num_iterations: int = 1000,
        max_planes: int = 5
    ) -> SegmentationResult:
        """Plane segmentation using RANSAC"""
        
        points = np.asarray(pcd.points)
        labels = np.full(len(points), -1, dtype=int)
        
        segment_info = []
        remaining_pcd = pcd
        current_label = 0
        
        for plane_idx in range(max_planes):
            if len(remaining_pcd.points) < 100:  # Not enough points
                break
            
            # Detect plane
            plane_model, inliers = remaining_pcd.segment_plane(
                distance_threshold=distance_threshold,
                ransac_n=ransac_n,
                num_iterations=num_iterations
            )
            
            if len(inliers) < 50:  # Minimum plane size
                break
            
            # Update labels
            remaining_indices = np.arange(len(remaining_pcd.points))
            original_indices = np.where(labels == -1)[0]
            plane_indices = original_indices[remaining_indices[inliers]]
            
            labels[plane_indices] = current_label
            
            # Compute plane info
            plane_points = points[plane_indices]
            centroid = np.mean(plane_points, axis=0)
            bbox_min = np.min(plane_points, axis=0)
            bbox_max = np.max(plane_points, axis=0)
            
            segment_info.append({
                'label': int(current_label),
                'point_count': len(plane_indices),
                'centroid': centroid.tolist(),
                'plane_equation': plane_model.tolist(),
                'bounding_box': {
                    'min': bbox_min.tolist(),
                    'max': bbox_max.tolist(),
                    'volume': float(np.prod(bbox_max - bbox_min))
                }
            })
            
            # Remove plane points for next iteration
            remaining_pcd = remaining_pcd.select_by_index(inliers, invert=True)
            current_label += 1
        
        num_segments = current_label
        largest_segment_size = max([info['point_count'] for info in segment_info]) if segment_info else 0
        largest_segment_ratio = largest_segment_size / len(points) if len(points) > 0 else 0
        
        return SegmentationResult(
            labels=labels,
            num_segments=num_segments,
            segment_info=segment_info,
            largest_segment_ratio=largest_segment_ratio,
            segmentation_time=0.0
        )
    
    def compute_point_cloud_metrics(self, pcd: o3d.geometry.PointCloud) -> Dict[str, Any]:
        """Compute comprehensive point cloud metrics"""
        
        points = np.asarray(pcd.points)
        
        if len(points) == 0:
            return {}
        
        # Basic statistics
        centroid = np.mean(points, axis=0)
        bbox_min = np.min(points, axis=0)
        bbox_max = np.max(points, axis=0)
        bbox_extent = bbox_max - bbox_min
        
        # Density metrics
        volume = np.prod(bbox_extent)
        density = len(points) / volume if volume > 0 else 0
        
        # Compute convex hull
        try:
            hull = ConvexHull(points)
            convex_hull_volume = hull.volume
            convex_hull_area = hull.area
        except:
            convex_hull_volume = 0
            convex_hull_area = 0
        
        # Distance metrics
        distances = distance_matrix(points[:min(1000, len(points))], 
                                  points[:min(1000, len(points))])
        mean_distance = np.mean(distances[distances > 0])
        
        # Planarity and structure metrics
        pca = PCA()
        pca.fit(points)
        eigenvalues = pca.explained_variance_
        eigenvalues_normalized = eigenvalues / np.sum(eigenvalues)
        
        planarity = (eigenvalues_normalized[1] - eigenvalues_normalized[2]) / eigenvalues_normalized[0]
        linearity = (eigenvalues_normalized[0] - eigenvalues_normalized[1]) / eigenvalues_normalized[0]
        sphericity = eigenvalues_normalized[2] / eigenvalues_normalized[0]
        
        return {
            'point_count': len(points),
            'centroid': centroid.tolist(),
            'bounding_box': {
                'min': bbox_min.tolist(),
                'max': bbox_max.tolist(),
                'extent': bbox_extent.tolist(),
                'volume': float(volume)
            },
            'density': float(density),
            'convex_hull': {
                'volume': float(convex_hull_volume),
                'area': float(convex_hull_area)
            },
            'structure_metrics': {
                'planarity': float(planarity),
                'linearity': float(linearity),
                'sphericity': float(sphericity)
            },
            'distance_metrics': {
                'mean_nearest_neighbor': float(mean_distance)
            },
            'pca_eigenvalues': eigenvalues_normalized.tolist()
        }
    
    def detect_outliers(
        self,
        pcd: o3d.geometry.PointCloud,
        method: str = "isolation_forest",
        contamination: float = 0.1
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Detect outliers in point cloud"""
        
        points = np.asarray(pcd.points)
        
        if method == "isolation_forest":
            detector = IsolationForest(contamination=contamination, random_state=42)
            outlier_labels = detector.fit_predict(points)
            outlier_indices = np.where(outlier_labels == -1)[0]
            inlier_indices = np.where(outlier_labels == 1)[0]
            
        elif method == "statistical":
            _, outlier_indices = pcd.remove_statistical_outlier(
                nb_neighbors=20, std_ratio=2.0
            )
            inlier_indices = np.setdiff1d(np.arange(len(points)), outlier_indices)
            
        else:
            raise ValueError(f"Unsupported outlier detection method: {method}")
        
        return inlier_indices, outlier_indices
    
    def compute_surface_reconstruction(
        self,
        pcd: o3d.geometry.PointCloud,
        method: str = "poisson",
        depth: int = 9
    ) -> o3d.geometry.TriangleMesh:
        """Reconstruct surface from point cloud"""
        
        # Ensure normals are computed
        if not pcd.has_normals():
            pcd.estimate_normals()
            pcd.orient_normals_consistent_tangent_plane(30)
        
        if method == "poisson":
            mesh, _ = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(
                pcd, depth=depth
            )
        elif method == "ball_pivoting":
            radii = [0.005, 0.01, 0.02, 0.04]
            mesh = o3d.geometry.TriangleMesh.create_from_point_cloud_ball_pivoting(
                pcd, o3d.utility.DoubleVector(radii)
            )
        elif method == "alpha_shape":
            alpha = 0.03
            mesh = o3d.geometry.TriangleMesh.create_from_point_cloud_alpha_shape(
                pcd, alpha
            )
        else:
            raise ValueError(f"Unsupported surface reconstruction method: {method}")
        
        return mesh 