#!/usr/bin/env node

/**
 * Fix Class Name Mismatches
 * Fix function return types and class references
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Remaining Class Name Mismatches');
console.log('=========================================\n');

const annotateAISrc = path.join(__dirname, '..', 'ai-platforms', 'annotateai', 'src');

// Specific fixes for common mismatches
const classNameFixes = [
    // AI WorkflowEngine fix
    {
        file: 'ai/G3DAIWorkflowEngine.ts',
        find: 'constructor(private engine: G3DAIWorkflowEngine)',
        replace: 'constructor(private engine: AIWorkflowEngine)'
    },
    
    // G3DModelRunner fix
    {
        file: 'ai/G3DModelRunner.ts',
        find: 'export function createG3DModelRunner(): G3DModelRunner',
        replace: 'export function createG3DModelRunner(): ModelRunner'
    },
    
    // Diffusion Generator fix
    {
        file: 'ai/synthetic/G3DDiffusionGenerator.ts',
        find: 'Cannot find name \'G3DDiffusionGenerator\'',
        replace: 'DiffusionGenerator'
    },
    
    // GAN Generator fix
    {
        file: 'ai/synthetic/G3DGANGenerator.ts',
        find: 'Cannot find name \'G3DGANGenerator\'',
        replace: 'GANGenerator'
    },
    
    // Integration fixes
    {
        file: 'integration/G3DCameraController.ts',
        find: '): G3DCameraController',
        replace: '): CameraController'
    },
    
    {
        file: 'integration/G3DGeometryProcessor.ts',
        find: '(): G3DGeometryProcessor',
        replace: '(): GeometryProcessor'
    },
    
    {
        file: 'integration/G3DLightingSystem.ts',
        find: '(): G3DLightingSystem',
        replace: '(): LightingSystem'
    },
    
    {
        file: 'integration/G3DMaterialSystem.ts',
        find: '(): G3DMaterialSystem',
        replace: '(): MaterialSystem'
    },
    
    {
        file: 'integration/G3DNativeRenderer.ts',
        find: '(): G3DNativeRenderer',
        replace: '(): NativeRenderer'
    },
    
    {
        file: 'integration/G3DPerformanceOptimizer.ts',
        find: '(): G3DPerformanceOptimizer',
        replace: '(): PerformanceOptimizer'
    },
    
    {
        file: 'integration/G3DSceneManager.ts',
        find: '(): G3DSceneManager',
        replace: '(): SceneManager'
    },
    
    // Core fixes
    {
        file: 'core/G3DParticleSystem.ts',
        find: '(): G3DParticleSystem',
        replace: '(): ParticleSystem'
    },
    
    // Component fixes
    {
        file: 'components/ai/annotation/G3DObjectDetectionModel.ts',
        find: 'Cannot find name \'G3DObjectDetectionModel\'',
        replace: 'ObjectDetectionModel'
    },
    
    {
        file: 'components/CollaborationEngine.ts',
        find: 'Cannot find name \'G3DCollaborationEngine\'',
        replace: 'CollaborationEngine'
    },
    
    {
        file: 'components/GANGenerator.ts',
        find: 'Cannot find name \'G3DGANGenerator\'',
        replace: 'GANGenerator'
    }
];

// Generic patterns to fix
const patterns = [
    {
        pattern: /export function create(\w+)\(\): G3D(\w+)/g,
        replacement: 'export function create$1(): $2'
    },
    {
        pattern: /export function createG3D(\w+)\(\): G3D(\w+)/g,
        replacement: 'export function createG3D$1(): $2'
    },
    {
        pattern: /private (\w+): G3D(\w+)/g,
        replacement: 'private $1: $2'
    },
    {
        pattern: /public (\w+): G3D(\w+)/g,
        replacement: 'public $1: $2'
    }
];

function fixFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let updatedContent = content;
        let hasChanges = false;
        
        // Apply pattern-based fixes
        patterns.forEach(({ pattern, replacement }) => {
            if (pattern.test(content)) {
                updatedContent = updatedContent.replace(pattern, replacement);
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            console.log(`    ✅ Fixed patterns in: ${path.basename(filePath)}`);
            return true;
        }
        return false;
        
    } catch (error) {
        console.error(`  ❌ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

function fixSpecificFile(relativePath, find, replace) {
    const filePath = path.join(annotateAISrc, relativePath);
    
    if (!fs.existsSync(filePath)) {
        console.log(`  ⚠️  File not found: ${relativePath}`);
        return false;
    }
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(find)) {
            const updatedContent = content.replace(new RegExp(find, 'g'), replace);
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            console.log(`    ✅ Fixed: ${relativePath}`);
            return true;
        }
        return false;
        
    } catch (error) {
        console.error(`  ❌ Error fixing ${relativePath}:`, error.message);
        return false;
    }
}

// Apply pattern-based fixes to all files
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
            fixedCount += processDirectoryRecursively(fullPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
            if (fixFile(fullPath)) {
                fixedCount++;
            }
        }
    });
    
    return fixedCount;
}

console.log('📁 Applying pattern-based fixes...\n');
const patternFixed = processDirectoryRecursively(annotateAISrc);

console.log(`\n📊 Pattern fixes applied to ${patternFixed} files\n`);

// Apply specific fixes
console.log('🎯 Applying specific fixes...\n');

let specificFixed = 0;
classNameFixes.forEach(({ file, find, replace }) => {
    if (fixSpecificFile(file, find, replace)) {
        specificFixed++;
    }
});

console.log(`\n📊 Specific fixes applied to ${specificFixed} files\n`);

console.log('🎉 Class name mismatch fixing completed!');
console.log('💡 Re-run TypeScript compilation to verify fixes...\n'); 