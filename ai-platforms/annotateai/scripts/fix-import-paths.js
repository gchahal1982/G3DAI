#!/usr/bin/env node

/**
 * Fix Import Paths After Directory Restructuring
 * Updates all import statements to reflect new directory structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Import Paths After Directory Restructuring');
console.log('===================================================\n');

const annotateAISrc = path.join(__dirname, '..', 'ai-platforms', 'annotateai', 'src');

// Directory mapping based on our restructuring
const directoryMappings = {
    'g3d-3d': 'core',
    'g3d-ai': 'ai', 
    'g3d-integration': 'integration',
    'g3d-performance': 'performance',
    'ai-assist': '', // Files moved to root
    'lib': '', // Files moved to root
    'workbench': 'components' // Files moved to components/
};

// File-specific mappings for moved files
const fileMappings = {
    'ai-assist/PreAnnotationEngine': 'PreAnnotationEngine',
    'lib/utils': 'utils',
    'workbench/AnnotationWorkbench': 'components/AnnotationWorkbench'
};

function updateImportsInFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let updatedContent = content;
        let hasChanges = false;
        
        // Fix directory-based imports
        for (const [oldDir, newDir] of Object.entries(directoryMappings)) {
            // Pattern: from '../g3d-3d/SomeFile' or from '../../g3d-3d/SomeFile'
            const regex = new RegExp(`from\\s+['"]([^'"]*/)?(${oldDir})/([^'"]+)['"]`, 'g');
            
            updatedContent = updatedContent.replace(regex, (match, prefix, oldDirectory, fileName) => {
                hasChanges = true;
                const newPath = newDir ? `${prefix || ''}${newDir}/${fileName}` : `${prefix || ''}${fileName}`;
                console.log(`    📝 ${oldDirectory}/${fileName} → ${newPath}`);
                return `from '${newPath}'`;
            });
        }
        
        // Fix specific file mappings
        for (const [oldPath, newPath] of Object.entries(fileMappings)) {
            const regex = new RegExp(`from\\s+['"]([^'"]*/)?(${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})['"]`, 'g');
            
            updatedContent = updatedContent.replace(regex, (match, prefix) => {
                hasChanges = true;
                const fullNewPath = `${prefix || ''}${newPath}`;
                console.log(`    📝 ${oldPath} → ${newPath}`);
                return `from '${fullNewPath}'`;
            });
        }
        
        // Fix relative path depth adjustments
        // If files moved from nested directories to root, we need fewer ../
        updatedContent = updatedContent.replace(/from\s+['"]\.\.\/\.\.\/g3d-ai\//g, (match) => {
            hasChanges = true;
            return "from '../ai/";
        });
        
        updatedContent = updatedContent.replace(/from\s+['"]\.\.\/g3d-ai\//g, (match) => {
            hasChanges = true;
            return "from './ai/";
        });
        
        updatedContent = updatedContent.replace(/from\s+['"]\.\.\/\.\.\/g3d-3d\//g, (match) => {
            hasChanges = true;
            return "from '../core/";
        });
        
        updatedContent = updatedContent.replace(/from\s+['"]\.\.\/g3d-3d\//g, (match) => {
            hasChanges = true;
            return "from './core/";
        });
        
        updatedContent = updatedContent.replace(/from\s+['"]\.\.\/\.\.\/g3d-integration\//g, (match) => {
            hasChanges = true;
            return "from '../integration/";
        });
        
        updatedContent = updatedContent.replace(/from\s+['"]\.\.\/g3d-integration\//g, (match) => {
            hasChanges = true;
            return "from './integration/";
        });
        
        updatedContent = updatedContent.replace(/from\s+['"]\.\.\/\.\.\/g3d-performance\//g, (match) => {
            hasChanges = true;
            return "from '../performance/";
        });
        
        updatedContent = updatedContent.replace(/from\s+['"]\.\.\/g3d-performance\//g, (match) => {
            hasChanges = true;
            return "from './performance/";
        });
        
        if (hasChanges) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error(`  ❌ Error fixing imports in ${filePath}:`, error.message);
        return false;
    }
}

function fixImportsRecursively(dir, level = 0) {
    let totalFixed = 0;
    const indent = '  '.repeat(level);
    
    if (!fs.existsSync(dir)) return totalFixed;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            console.log(`${indent}📁 Processing directory: ${path.relative(annotateAISrc, fullPath)}`);
            totalFixed += fixImportsRecursively(fullPath, level + 1);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
            if (updateImportsInFile(fullPath)) {
                totalFixed++;
                console.log(`${indent}✅ Fixed: ${path.relative(annotateAISrc, fullPath)}`);
            }
        }
    }
    
    return totalFixed;
}

// Execute the import fixing
console.log('🔍 Scanning for import statements to fix...\n');
const fixedFiles = fixImportsRecursively(annotateAISrc);

console.log(`\n📊 Import fixing completed!`);
console.log(`✅ Fixed imports in ${fixedFiles} files\n`);

// Now validate TypeScript compilation
console.log('🔍 Validating TypeScript compilation...');

try {
    execSync('npx tsc --noEmit', {
        cwd: path.join(__dirname, '..', 'ai-platforms', 'annotateai'),
        stdio: 'pipe'
    });
    console.log('✅ TypeScript compilation successful!');
} catch (error) {
    console.log('⚠️  Some TypeScript issues remain - let me check the errors...');
    
    try {
        // Get the actual errors
        const result = execSync('npx tsc --noEmit', {
            cwd: path.join(__dirname, '..', 'ai-platforms', 'annotateai'),
            encoding: 'utf8'
        });
    } catch (tscError) {
        const errorOutput = tscError.stdout || tscError.stderr || '';
        const lines = errorOutput.split('\n').slice(0, 20); // Show first 20 lines
        console.log('📝 TypeScript errors to address:');
        lines.forEach(line => {
            if (line.trim()) console.log(`  ${line}`);
        });
    }
}

console.log('\n🎉 Import path fixing phase completed!');
console.log('=====================================');
console.log('📋 Summary of changes:');
console.log(`  - Files with updated imports: ${fixedFiles}`);
console.log('  - Directory mappings applied:');
Object.entries(directoryMappings).forEach(([old, newDir]) => {
    console.log(`    • ${old}/ → ${newDir ? newDir + '/' : 'root'}`);
});
console.log('  - File mappings applied:');
Object.entries(fileMappings).forEach(([old, newPath]) => {
    console.log(`    • ${old} → ${newPath}`);
});

console.log('\n✅ Ready for next phase of migration!'); 