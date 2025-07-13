#!/usr/bin/env node

/**
 * Fix Same-Directory Imports
 * Fixes imports for files that moved to same directory but still have G3D prefixes
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Same-Directory Import References');
console.log('==========================================\n');

const annotateAISrc = path.join(__dirname, '..', 'ai-platforms', 'annotateai', 'src');

// Files that need their import references updated to use G3D prefixes
const importFixes = [
    // AI directory fixes
    {
        directory: path.join(annotateAISrc, 'ai'),
        fixes: {
            './ModelRunner': './G3DModelRunner',
            './ComputeShaders': './G3DComputeShaders',
            './NeuralNetworkViz': './G3DNeuralNetworkViz',
            './ActiveLearning': './G3DActiveLearning',
            './ModelEnsemble': './G3DModelEnsemble',
            './PredictiveOptimization': './G3DPredictiveOptimization'
        }
    },
    // Integration directory fixes
    {
        directory: path.join(annotateAISrc, 'integration'),
        fixes: {
            './NativeRenderer': './G3DNativeRenderer',
            './SceneManager': './G3DSceneManager',
            './MaterialSystem': './G3DMaterialSystem',
            './GeometryProcessor': './G3DGeometryProcessor',
            './LightingSystem': './G3DLightingSystem',
            './CameraController': './G3DCameraController',
            './PerformanceOptimizer': './G3DPerformanceOptimizer'
        }
    },
    // Performance directory fixes
    {
        directory: path.join(annotateAISrc, 'performance'),
        fixes: {
            './GPUCompute': './G3DGPUCompute',
            './MemoryManager': './G3DMemoryManager',
            './CacheSystem': './G3DCacheSystem',
            './Profiler': './G3DProfiler',
            './LoadBalancer': './G3DLoadBalancer'
        }
    },
    // Core directory fixes
    {
        directory: path.join(annotateAISrc, 'core'),
        fixes: {
            './MathLibraries': './G3DMathLibraries',
            './PhysicsEngine': './G3DPhysicsEngine',
            './ParticleSystem': './G3DParticleSystem',
            './VolumeRenderer': './G3DVolumeRenderer',
            './PointCloudProcessor': './G3DPointCloudProcessor',
            './XRAnnotation': './G3DXRAnnotation',
            './TextureManager': './G3DTextureManager',
            './LightingSystem': './G3DLightingSystem',
            './AnimationEngine': './G3DAnimationEngine'
        }
    }
];

function fixImportsInFile(filePath, fixes) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let updatedContent = content;
        let hasChanges = false;
        
        // Apply each fix
        for (const [oldImport, newImport] of Object.entries(fixes)) {
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

function processDirectory({ directory, fixes }) {
    if (!fs.existsSync(directory)) {
        console.log(`  ⚠️  Directory not found: ${path.relative(annotateAISrc, directory)}`);
        return 0;
    }
    
    console.log(`📁 Processing: ${path.relative(annotateAISrc, directory)}`);
    
    let fixedCount = 0;
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const filePath = path.join(directory, file);
            if (fixImportsInFile(filePath, fixes)) {
                fixedCount++;
            }
        }
    });
    
    console.log(`  ✅ Fixed ${fixedCount} files in ${path.relative(annotateAISrc, directory)}\n`);
    return fixedCount;
}

// Process all directories
let totalFixed = 0;
importFixes.forEach(dirConfig => {
    totalFixed += processDirectory(dirConfig);
});

console.log(`📊 Summary: Fixed imports in ${totalFixed} files\n`);

// Additional specific fixes for cross-directory imports
console.log('🔄 Applying cross-directory import fixes...\n');

// Fix specific known problematic imports
const crossDirectoryFixes = [
    // SegmentationModel.ts fixes
    {
        file: path.join(annotateAISrc, 'ai', 'SegmentationModel.ts'),
        fixes: {
            '../ai/ComputeShaders': './G3DComputeShaders',
            '../ai/ModelRunner': './G3DModelRunner',
            '../performance/GPUCompute': '../performance/G3DGPUCompute',
            '../core/MathLibraries': '../core/G3DMathLibraries'
        }
    }
];

crossDirectoryFixes.forEach(({ file, fixes }) => {
    if (fs.existsSync(file)) {
        console.log(`📝 Fixing cross-directory imports in: ${path.relative(annotateAISrc, file)}`);
        if (fixImportsInFile(file, fixes)) {
            console.log(`  ✅ Fixed cross-directory imports`);
        }
    }
});

console.log('\n🎉 Same-directory import fixing completed!'); 