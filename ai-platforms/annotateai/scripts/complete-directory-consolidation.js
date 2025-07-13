#!/usr/bin/env node

/**
 * Complete Directory Consolidation
 * Move files from old g3d-* directories to new clean directories
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Completing Directory Consolidation');
console.log('====================================\n');

const annotateAISrc = path.join(__dirname, '..', 'ai-platforms', 'annotateai', 'src');

// Directory migrations that need to be completed
const directoryMigrations = [
    {
        from: path.join(annotateAISrc, 'g3d-3d'),
        to: path.join(annotateAISrc, 'core'),
        name: 'Core 3D functionality'
    },
    {
        from: path.join(annotateAISrc, 'g3d-integration'),
        to: path.join(annotateAISrc, 'integration'),
        name: 'Integration layer'
    },
    {
        from: path.join(annotateAISrc, 'g3d-performance'),
        to: path.join(annotateAISrc, 'performance'),
        name: 'Performance optimization'
    }
];

// Function to move directory contents
function moveDirectoryContents(fromDir, toDir, dirName) {
    if (!fs.existsSync(fromDir)) {
        console.log(`  ⚠️  Source directory not found: ${fromDir}`);
        return false;
    }
    
    console.log(`📁 Moving ${dirName}...`);
    console.log(`  From: ${path.relative(annotateAISrc, fromDir)}`);
    console.log(`  To: ${path.relative(annotateAISrc, toDir)}`);
    
    try {
        // Create target directory
        fs.mkdirSync(toDir, { recursive: true });
        
        // Get all files in source directory
        const items = fs.readdirSync(fromDir);
        let movedCount = 0;
        
        items.forEach(item => {
            const sourcePath = path.join(fromDir, item);
            const targetPath = path.join(toDir, item);
            
            const stat = fs.statSync(sourcePath);
            
            if (stat.isFile()) {
                // Move file
                fs.renameSync(sourcePath, targetPath);
                console.log(`    ✅ Moved: ${item}`);
                movedCount++;
            } else if (stat.isDirectory()) {
                // Move directory recursively
                moveDirectoryRecursively(sourcePath, targetPath);
                console.log(`    ✅ Moved directory: ${item}/`);
                movedCount++;
            }
        });
        
        // Remove empty source directory
        try {
            fs.rmdirSync(fromDir);
            console.log(`  🗑️  Removed old directory: ${path.relative(annotateAISrc, fromDir)}`);
        } catch (e) {
            console.log(`  ⚠️  Could not remove ${fromDir}: ${e.message}`);
        }
        
        console.log(`  📊 Moved ${movedCount} items\n`);
        return true;
        
    } catch (error) {
        console.error(`  ❌ Error moving ${dirName}:`, error.message);
        return false;
    }
}

function moveDirectoryRecursively(source, target) {
    fs.mkdirSync(target, { recursive: true });
    
    const items = fs.readdirSync(source);
    items.forEach(item => {
        const sourcePath = path.join(source, item);
        const targetPath = path.join(target, item);
        
        const stat = fs.statSync(sourcePath);
        if (stat.isFile()) {
            fs.renameSync(sourcePath, targetPath);
        } else if (stat.isDirectory()) {
            moveDirectoryRecursively(sourcePath, targetPath);
        }
    });
    
    fs.rmdirSync(source);
}

// Handle special case: merge g3d-ai into existing ai directory
function mergeG3DAI() {
    const g3dAiDir = path.join(annotateAISrc, 'g3d-ai');
    const aiDir = path.join(annotateAISrc, 'ai');
    
    if (!fs.existsSync(g3dAiDir)) {
        console.log(`  ⚠️  g3d-ai directory not found`);
        return false;
    }
    
    console.log(`🤖 Merging g3d-ai into ai directory...`);
    
    try {
        // Ensure ai directory exists
        fs.mkdirSync(aiDir, { recursive: true });
        
        const items = fs.readdirSync(g3dAiDir);
        let mergedCount = 0;
        
        items.forEach(item => {
            const sourcePath = path.join(g3dAiDir, item);
            const targetPath = path.join(aiDir, item);
            
            const stat = fs.statSync(sourcePath);
            
            if (stat.isFile()) {
                if (fs.existsSync(targetPath)) {
                    // If file already exists, add -g3d suffix to avoid conflicts
                    const parsed = path.parse(item);
                    const newName = `${parsed.name}-g3d${parsed.ext}`;
                    const newTargetPath = path.join(aiDir, newName);
                    fs.renameSync(sourcePath, newTargetPath);
                    console.log(`    ✅ Merged (renamed): ${item} → ${newName}`);
                } else {
                    fs.renameSync(sourcePath, targetPath);
                    console.log(`    ✅ Merged: ${item}`);
                }
                mergedCount++;
            } else if (stat.isDirectory()) {
                if (fs.existsSync(targetPath)) {
                    // Merge directory contents
                    moveDirectoryRecursively(sourcePath, targetPath);
                } else {
                    fs.renameSync(sourcePath, targetPath);
                }
                console.log(`    ✅ Merged directory: ${item}/`);
                mergedCount++;
            }
        });
        
        // Remove empty g3d-ai directory
        try {
            fs.rmdirSync(g3dAiDir);
            console.log(`  🗑️  Removed g3d-ai directory`);
        } catch (e) {
            console.log(`  ⚠️  Could not remove g3d-ai: ${e.message}`);
        }
        
        console.log(`  📊 Merged ${mergedCount} items\n`);
        return true;
        
    } catch (error) {
        console.error(`  ❌ Error merging g3d-ai:`, error.message);
        return false;
    }
}

// Execute the consolidation
console.log('🚀 Starting directory consolidation...\n');

// First, handle the g3d-ai merge
mergeG3DAI();

// Then handle the other directory migrations
let successCount = 0;
directoryMigrations.forEach(({ from, to, name }) => {
    if (moveDirectoryContents(from, to, name)) {
        successCount++;
    }
});

console.log('📊 Consolidation Summary:');
console.log('========================');
console.log(`✅ Successfully consolidated: ${successCount} directories`);
console.log(`🤖 G3D-AI merge: completed`);

// Show new directory structure
console.log('\n📁 New Directory Structure:');

function showDirectoryTree(dir, prefix = '', level = 0) {
    if (level > 2) return; // Limit depth
    
    try {
        const items = fs.readdirSync(dir)
            .filter(item => !item.startsWith('.'))
            .sort();
            
        items.forEach((item, index) => {
            const fullPath = path.join(dir, item);
            const isLast = index === items.length - 1;
            const isDirectory = fs.statSync(fullPath).isDirectory();
            
            console.log(`${prefix}${isLast ? '└── ' : '├── '}${item}${isDirectory ? '/' : ''}`);
            
            if (isDirectory && level < 2) {
                const nextPrefix = prefix + (isLast ? '    ' : '│   ');
                showDirectoryTree(fullPath, nextPrefix, level + 1);
            }
        });
    } catch (error) {
        console.log(`${prefix}❌ Error reading directory`);
    }
}

showDirectoryTree(annotateAISrc);

console.log('\n✅ Directory consolidation completed!');
console.log('💡 Next: Re-run import fixing to update paths to new structure'); 