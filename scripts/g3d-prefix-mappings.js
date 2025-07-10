#!/usr/bin/env node

/**
 * G3D Prefix Mappings for Phase 3 Migration
 * Safe, systematic filename transformations
 */

// Systematic mapping rules for G3D prefix removal
const createMapping = (originalName) => {
    // Remove G3D prefix and handle special cases
    let newName = originalName;
    
    // Handle numeric prefixes (3D* → ThreeD*)
    if (newName.startsWith('G3D3D')) {
        newName = newName.replace('G3D3D', 'ThreeD');
    }
    // Regular G3D prefix removal
    else if (newName.startsWith('G3D')) {
        newName = newName.replace('G3D', '');
    }
    
    return newName;
};

// Special case mappings for specific files that need custom handling
const specialCaseMappings = {
    // AnnotateAI Platform
    'G3DPointCloudAnnotation.tsx': 'PointCloudAnnotation.tsx',
    'G3DKeypointTool.tsx': 'KeypointTool.tsx',
    'G3DCollaborativeEditor.tsx': 'CollaborativeEditor.tsx',
    'G3DBoundingBoxTool.tsx': 'BoundingBoxTool.tsx',
    'G3DPolygonTool.tsx': 'PolygonTool.tsx',
    'G3DSemanticSegmentation.tsx': 'SemanticSegmentation.tsx',
    'G3DQualityControl.tsx': 'QualityControl.tsx',
    'G3DVideoTracking.tsx': 'VideoTracking.tsx',
    'G3DMedicalImaging.tsx': 'MedicalImaging.tsx',
    'G3D3DObjectAnnotation.tsx': 'ObjectAnnotation3D.tsx',
    'G3DKeypointAnnotation.tsx': 'KeypointAnnotation.tsx',
    
    // 3D Engine Files  
    'G3DSplineSystem.ts': 'SplineSystem.ts',
    'G3DSceneGraph.ts': 'SceneGraph.ts',
    'G3DPhysicsEngine.ts': 'PhysicsEngine.ts',
    'G3DXRAnnotation.ts': 'XRAnnotation.ts',
    'G3DPhysicsIntegration.ts': 'PhysicsIntegration.ts',
    'G3DPointCloudProcessor.ts': 'PointCloudProcessor.ts',
    'G3DVolumeRenderer.ts': 'VolumeRenderer.ts',
    'G3DVolumetricRenderer.ts': 'VolumetricRenderer.ts',
    'G3DSpatialIndex.ts': 'SpatialIndex.ts',
    'G3DTextureManager.ts': 'TextureManager.ts',
    'G3DSpatialAnalyzer.ts': 'SpatialAnalyzer.ts',
    'G3DMeshProcessor.ts': 'MeshProcessor.ts',
    'G3DParticleSystem.ts': 'ParticleSystem.ts',
    'G3DCollisionDetection.ts': 'CollisionDetection.ts',
    'G3DLightingSystem.ts': 'LightingSystem.ts',
    'G3D3DRenderer.ts': 'Renderer3D.ts',
    'G3DAnimationEngine.ts': 'AnimationEngine.ts',
    'G3D3DReconstruction.ts': 'Reconstruction3D.ts',
    'G3DGeometryUtils.ts': 'GeometryUtils.ts',
    'G3DMathLibraries.ts': 'MathLibraries.ts',
    'G3DCollaborationEngine.ts': 'CollaborationEngine.ts',
    
    // AI Components
    'G3DPredictiveOptimization.ts': 'PredictiveOptimization.ts',
    'G3DNeuralNetworkViz.ts': 'NeuralNetworkViz.ts',
    'G3DModelRunner.ts': 'ModelRunner.ts',
    'G3DAIAssistedCoding.ts': 'AIAssistedCoding.ts',
    'G3DComputeShaders.ts': 'ComputeShaders.ts',
    'G3DModelEnsemble.ts': 'ModelEnsemble.ts',
    'G3DAIWorkflowEngine.ts': 'AIWorkflowEngine.ts',
    'G3DActiveLearning.ts': 'ActiveLearning.ts',
    
    // Integration Layer
    'G3DSceneManager.ts': 'SceneManager.ts',
    'G3DNativeRenderer.ts': 'NativeRenderer.ts',
    'G3DCameraController.ts': 'CameraController.ts',
    'G3DGeometryProcessor.ts': 'GeometryProcessor.ts',
    'G3DMaterialSystem.ts': 'MaterialSystem.ts',
    'G3DPerformanceOptimizer.ts': 'PerformanceOptimizer.ts',
    
    // Performance Components
    'G3DOptimizationEngine.ts': 'OptimizationEngine.ts',
    'G3DParallelProcessing.ts': 'ParallelProcessing.ts',
    'G3DPerformanceMonitor.ts': 'PerformanceMonitor.ts',
    'G3DMemoryManager.ts': 'MemoryManager.ts',
    'G3DGPUCompute.ts': 'GPUCompute.ts',
    
    // Enterprise Components
    'G3DAuditSystem.ts': 'AuditSystem.ts',
    'G3DAPIGateway.ts': 'APIGateway.ts',
    'G3DEnterpriseSSO.ts': 'EnterpriseSSO.ts',
    'G3DCloudIntegration.ts': 'CloudIntegration.ts',
    'G3DWorkflowEngine.ts': 'WorkflowEngine.ts',
    'G3DEnterpriseAnalytics.ts': 'EnterpriseAnalytics.ts',
    'G3DComplianceManager.ts': 'ComplianceManager.ts',
    
    // Main Services  
    'G3DRealTimeAnalytics.ts': 'RealTimeAnalytics.ts',
    'G3DSecurityManager.ts': 'SecurityManager.ts',
    'G3DStreamProcessor.ts': 'StreamProcessor.ts',
    'G3DComputeCluster.ts': 'ComputeCluster.ts',
    'G3DDistributedCompute.ts': 'DistributedCompute.ts',
    'G3DNetworkOptimizer.ts': 'NetworkOptimizer.ts'
};

// Generate mapping for a given filename
const getNewFilename = (originalFilename) => {
    // Check special cases first
    if (specialCaseMappings[originalFilename]) {
        return specialCaseMappings[originalFilename];
    }
    
    // Apply systematic rules
    return createMapping(originalFilename);
};

// Generate class name from filename
const getNewClassName = (filename) => {
    const nameWithoutExt = filename.replace(/\.(ts|tsx)$/, '');
    return getNewFilename(nameWithoutExt);
};

module.exports = {
    getNewFilename,
    getNewClassName,
    specialCaseMappings,
    createMapping
}; 