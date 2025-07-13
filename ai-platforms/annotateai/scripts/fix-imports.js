#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Common import fixes
const importMappings = {
    // Shared UI Components
    'GlassCard': "import { GlassCard } from '@shared/ui/components';",
    'GlassButton': "import { GlassButton } from '@shared/ui/components';",
    'GlassInput': "import { GlassInput } from '@shared/ui/components';",
    'GlassModal': "import { GlassModal } from '@shared/ui/components';",
    
    // Multiple components in one import
    'GlassCard, GlassButton': "import { GlassCard, GlassButton } from '@shared/ui/components';",
    'GlassCard, GlassInput': "import { GlassCard, GlassInput } from '@shared/ui/components';",
    'GlassCard, GlassModal': "import { GlassCard, GlassModal } from '@shared/ui/components';",
    'GlassButton, GlassInput': "import { GlassButton, GlassInput } from '@shared/ui/components';",
    'GlassCard, GlassButton, GlassInput': "import { GlassCard, GlassButton, GlassInput } from '@shared/ui/components';",
    'GlassCard, GlassButton, GlassModal': "import { GlassCard, GlassButton, GlassModal } from '@shared/ui/components';",
    'GlassCard, GlassButton, GlassInput, GlassModal': "import { GlassCard, GlassButton, GlassInput, GlassModal } from '@shared/ui/components';"
};

// Get all platform directories
function getPlatformDirectories() {
    const platformsPath = path.join(__dirname, '..', 'ai-platforms');
    return fs.readdirSync(platformsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
}

// Find all TypeScript/React files in a directory
function findTsFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item.name);
            
            if (item.isDirectory() && item.name !== 'node_modules' && item.name !== 'dist' && item.name !== 'build') {
                traverse(fullPath);
            } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
                files.push(fullPath);
            }
        }
    }
    
    traverse(dir);
    return files;
}

// Fix imports in a single file
function fixImportsInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let hasChanges = false;
        
        // Check if file uses GlassCard components
        const usesGlassComponents = /GlassCard|GlassButton|GlassInput|GlassModal/.test(content);
        
        if (!usesGlassComponents) {
            return false; // No changes needed
        }
        
        // Check if import already exists
        const hasImport = /import.*from.*@shared\/ui\/components/.test(content);
        
        if (hasImport) {
            return false; // Import already exists
        }
        
        // Find which components are used
        const usedComponents = [];
        if (/\bGlassCard\b/.test(content)) usedComponents.push('GlassCard');
        if (/\bGlassButton\b/.test(content)) usedComponents.push('GlassButton');
        if (/\bGlassInput\b/.test(content)) usedComponents.push('GlassInput');
        if (/\bGlassModal\b/.test(content)) usedComponents.push('GlassModal');
        
        if (usedComponents.length === 0) {
            return false;
        }
        
        // Create import statement
        const importStatement = `import { ${usedComponents.join(', ')} } from '@shared/ui/components';\n`;
        
        // Find the best place to insert the import
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Find the last import statement
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                insertIndex = i + 1;
            } else if (lines[i].trim() === '' && insertIndex > 0) {
                // Empty line after imports
                insertIndex = i;
                break;
            }
        }
        
        // Insert the import statement
        lines.splice(insertIndex, 0, importStatement);
        
        const newContent = lines.join('\n');
        fs.writeFileSync(filePath, newContent);
        
        return true;
        
    } catch (error) {
        console.error(`❌ Error fixing imports in ${filePath}:`, error.message);
        return false;
    }
}

// Fix imports for a single platform
function fixImportsForPlatform(platformName) {
    const platformPath = path.join(__dirname, '..', 'ai-platforms', platformName);
    
    if (!fs.existsSync(platformPath)) {
        console.log(`⚠️  Platform directory not found: ${platformName}`);
        return;
    }
    
    const tsFiles = findTsFiles(platformPath);
    let fixedFiles = 0;
    
    for (const filePath of tsFiles) {
        if (fixImportsInFile(filePath)) {
            fixedFiles++;
        }
    }
    
    if (fixedFiles > 0) {
        console.log(`✅ Fixed imports in ${fixedFiles} files for ${platformName}`);
    } else {
        console.log(`ℹ️  No import fixes needed for ${platformName}`);
    }
}

// Main execution
console.log('🚀 Starting import fixes for all AI platforms...\n');

const platforms = getPlatformDirectories();
platforms.forEach(platform => {
    fixImportsForPlatform(platform);
});

console.log('\n✅ Import fixes completed!');
console.log('\nNext steps:');
console.log('1. Test TypeScript compilation: npm run type-check');
console.log('2. Test development server: npm run dev');
console.log('3. Fix any remaining import issues manually'); 