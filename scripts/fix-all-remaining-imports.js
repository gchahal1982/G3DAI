#!/usr/bin/env node

/**
 * Fix All Remaining Cross-Directory Imports
 * Comprehensive import fixing for the entire codebase
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing All Remaining Cross-Directory Imports');
console.log('===============================================\n');

const annotateAISrc = path.join(__dirname, '..', 'ai-platforms', 'annotateai', 'src');

// Comprehensive import mapping for all cross-directory imports
const globalImportFixes = {
    // AI directory imports
    '../ai/ModelRunner': '../ai/G3DModelRunner',
    '../../ai/ModelRunner': '../../ai/G3DModelRunner',
    '../../../ai/ModelRunner': '../../../ai/G3DModelRunner',
    '../ai/ComputeShaders': '../ai/G3DComputeShaders',
    '../../ai/ComputeShaders': '../../ai/G3DComputeShaders',
    '../../../ai/ComputeShaders': '../../../ai/G3DComputeShaders',
    
    // Integration directory imports
    '../integration/NativeRenderer': '../integration/G3DNativeRenderer',
    '../../integration/NativeRenderer': '../../integration/G3DNativeRenderer',
    '../../../integration/NativeRenderer': '../../../integration/G3DNativeRenderer',
    '../integration/SceneManager': '../integration/G3DSceneManager',
    '../../integration/SceneManager': '../../integration/G3DSceneManager',
    '../../../integration/SceneManager': '../../../integration/G3DSceneManager',
    '../integration/MaterialSystem': '../integration/G3DMaterialSystem',
    '../../integration/MaterialSystem': '../../integration/G3DMaterialSystem',
    '../integration/GeometryProcessor': '../integration/G3DGeometryProcessor',
    '../../integration/GeometryProcessor': '../../integration/G3DGeometryProcessor',
    '../integration/PerformanceOptimizer': '../integration/G3DPerformanceOptimizer',
    '../../integration/PerformanceOptimizer': '../../integration/G3DPerformanceOptimizer',
    '../integration/LightingSystem': '../integration/G3DLightingSystem',
    '../../integration/LightingSystem': '../../integration/G3DLightingSystem',
    '../integration/CameraController': '../integration/G3DCameraController',
    '../../integration/CameraController': '../../integration/G3DCameraController',
    
    // Performance directory imports
    '../performance/GPUCompute': '../performance/G3DGPUCompute',
    '../../performance/GPUCompute': '../../performance/G3DGPUCompute',
    '../performance/MemoryManager': '../performance/G3DMemoryManager',
    '../../performance/MemoryManager': '../../performance/G3DMemoryManager',
    '../performance/Profiler': '../performance/G3DProfiler',
    '../../performance/Profiler': '../../performance/G3DProfiler',
    '../performance/CacheSystem': '../performance/G3DCacheSystem',
    '../../performance/CacheSystem': '../../performance/G3DCacheSystem',
    
    // Core directory imports
    '../core/MathLibraries': '../core/G3DMathLibraries',
    '../../core/MathLibraries': '../../core/G3DMathLibraries',
    '../core/ParticleSystem': '../core/G3DParticleSystem',
    '../../core/ParticleSystem': '../../core/G3DParticleSystem',
    '../core/VolumeRenderer': '../core/G3DVolumeRenderer',
    '../../core/VolumeRenderer': '../../core/G3DVolumeRenderer',
    '../core/PointCloudProcessor': '../core/G3DPointCloudProcessor',
    '../../core/PointCloudProcessor': '../../core/G3DPointCloudProcessor',
    '../core/XRAnnotation': '../core/G3DXRAnnotation',
    '../../core/XRAnnotation': '../../core/G3DXRAnnotation',
    '../core/TextureManager': '../core/G3DTextureManager',
    '../../core/TextureManager': '../../core/G3DTextureManager',
    '../core/PhysicsEngine': '../core/G3DPhysicsEngine',
    '../../core/PhysicsEngine': '../../core/G3DPhysicsEngine',
    '../core/LightingSystem': '../core/G3DLightingSystem',
    '../../core/LightingSystem': '../../core/G3DLightingSystem',
    '../core/AnimationEngine': '../core/G3DAnimationEngine',
    '../../core/AnimationEngine': '../../core/G3DAnimationEngine'
};

function fixImportsInFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let updatedContent = content;
        let hasChanges = false;
        
        // Apply each global fix
        for (const [oldImport, newImport] of Object.entries(globalImportFixes)) {
            const regex = new RegExp(`from\\s+['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
            if (regex.test(content)) {
                updatedContent = updatedContent.replace(regex, `from '${newImport}'`);
                hasChanges = true;
                console.log(`    📝 ${path.basename(filePath)}: ${oldImport} → ${newImport}`);
            }
        }
        
        if (hasChanges) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            return true;
        }
        return false;
        
    } catch (error) {
        console.error(`  ❌ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

function processDirectoryRecursively(directory) {
    let fixedCount = 0;
    
    if (!fs.existsSync(directory)) {
        return fixedCount;
    }
    
    const items = fs.readdirSync(directory);
    
    items.forEach(item => {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Recursively process subdirectories
            fixedCount += processDirectoryRecursively(fullPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
            // Process TypeScript files
            if (fixImportsInFile(fullPath)) {
                fixedCount++;
            }
        }
    });
    
    return fixedCount;
}

console.log('🚀 Starting comprehensive import fixing...\n');

const totalFixed = processDirectoryRecursively(annotateAISrc);

console.log(`\n📊 Summary: Fixed imports in ${totalFixed} files across entire codebase\n`);

// Now let's also fix some common export name mismatches
console.log('🔄 Fixing export name mismatches...\n');

const exportNameFixes = [
    {
        pattern: /export default AnomalyDetection;/g,
        replacement: 'export default G3DAnomalyDetection;',
        description: 'AnomalyDetection → G3DAnomalyDetection'
    },
    {
        pattern: /export default ImageClassification;/g,
        replacement: 'export default G3DImageClassification;',
        description: 'ImageClassification → G3DImageClassification'
    },
    {
        pattern: /export default KeypointDetection;/g,
        replacement: 'export default G3DKeypointDetection;',
        description: 'KeypointDetection → G3DKeypointDetection'
    },
    {
        pattern: /export default ObjectDetectionModel;/g,
        replacement: 'export default G3DObjectDetectionModel;',
        description: 'ObjectDetectionModel → G3DObjectDetectionModel'
    },
    {
        pattern: /export default OpticalFlow;/g,
        replacement: 'export default G3DOpticalFlow;',
        description: 'OpticalFlow → G3DOpticalFlow'
    },
    {
        pattern: /export default PointCloudAI;/g,
        replacement: 'export default G3DPointCloudAI;',
        description: 'PointCloudAI → G3DPointCloudAI'
    },
    {
        pattern: /export default TextDetection;/g,
        replacement: 'export default G3DTextDetection;',
        description: 'TextDetection → G3DTextDetection'
    },
    {
        pattern: /export default TimeSeriesAnalysis;/g,
        replacement: 'export default G3DTimeSeriesAnalysis;',
        description: 'TimeSeriesAnalysis → G3DTimeSeriesAnalysis'
    },
    {
        pattern: /export default VideoTracking;/g,
        replacement: 'export default G3DVideoTracking;',
        description: 'VideoTracking → G3DVideoTracking'
    },
    {
        pattern: /export default ThreeDObjectAnnotation;/g,
        replacement: 'export default G3D3DObjectAnnotation;',
        description: 'ThreeDObjectAnnotation → G3D3DObjectAnnotation'
    },
    {
        pattern: /export default BoundingBoxTool;/g,
        replacement: 'export default G3DBoundingBoxTool;',
        description: 'BoundingBoxTool → G3DBoundingBoxTool'
    },
    {
        pattern: /export default CollaborativeEditor;/g,
        replacement: 'export default G3DCollaborativeEditor;',
        description: 'CollaborativeEditor → G3DCollaborativeEditor'
    },
    {
        pattern: /export default KeypointTool;/g,
        replacement: 'export default G3DKeypointTool;',
        description: 'KeypointTool → G3DKeypointTool'
    },
    {
        pattern: /export default MedicalImaging;/g,
        replacement: 'export default G3DMedicalImaging;',
        description: 'MedicalImaging → G3DMedicalImaging'
    },
    {
        pattern: /export default PointCloudAnnotation;/g,
        replacement: 'export default G3DPointCloudAnnotation;',
        description: 'PointCloudAnnotation → G3DPointCloudAnnotation'
    },
    {
        pattern: /export default PolygonTool;/g,
        replacement: 'export default G3DPolygonTool;',
        description: 'PolygonTool → G3DPolygonTool'
    },
    {
        pattern: /export default QualityControl;/g,
        replacement: 'export default G3DQualityControl;',
        description: 'QualityControl → G3DQualityControl'
    },
    {
        pattern: /export default SemanticSegmentation;/g,
        replacement: 'export default G3DSemanticSegmentation;',
        description: 'SemanticSegmentation → G3DSemanticSegmentation'
    },
    {
        pattern: /export default CollaborationEngine;/g,
        replacement: 'export default G3DCollaborationEngine;',
        description: 'CollaborationEngine → G3DCollaborationEngine'
    },
    {
        pattern: /export default DiffusionGenerator;/g,
        replacement: 'export default G3DDiffusionGenerator;',
        description: 'DiffusionGenerator → G3DDiffusionGenerator'
    },
    {
        pattern: /export default GANGenerator;/g,
        replacement: 'export default G3DGANGenerator;',
        description: 'GANGenerator → G3DGANGenerator'
    },
    {
        pattern: /export default XRCollaboration;/g,
        replacement: 'export default G3DXRCollaboration;',
        description: 'XRCollaboration → G3DXRCollaboration'
    }
];

function fixExportNamesInFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let updatedContent = content;
        let hasChanges = false;
        
        exportNameFixes.forEach(({ pattern, replacement, description }) => {
            if (pattern.test(content)) {
                updatedContent = updatedContent.replace(pattern, replacement);
                hasChanges = true;
                console.log(`    📝 ${path.basename(filePath)}: ${description}`);
            }
        });
        
        if (hasChanges) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            return true;
        }
        return false;
        
    } catch (error) {
        console.error(`  ❌ Error fixing exports in ${filePath}:`, error.message);
        return false;
    }
}

function fixExportNamesRecursively(directory) {
    let fixedCount = 0;
    
    if (!fs.existsSync(directory)) {
        return fixedCount;
    }
    
    const items = fs.readdirSync(directory);
    
    items.forEach(item => {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            fixedCount += fixExportNamesRecursively(fullPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
            if (fixExportNamesInFile(fullPath)) {
                fixedCount++;
            }
        }
    });
    
    return fixedCount;
}

const exportFixed = fixExportNamesRecursively(annotateAISrc);

console.log(`\n📊 Export Name Fixes: Fixed ${exportFixed} files\n`);

console.log('🎉 All remaining import and export fixes completed!');
console.log('💡 Re-run TypeScript compilation to verify fixes...\n'); 