#!/usr/bin/env node

/**
 * G3D Import Updater - Phase 3 Migration
 * Updates all import statements before file renaming
 */

const fs = require('fs');
const path = require('path');
const { getNewFilename } = require('./g3d-prefix-mappings');

// Function to find all TypeScript files
function findAllTSFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            findAllTSFiles(fullPath, files);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Function to update imports in a single file
function updateImportsInFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let updatedContent = content;
        let hasChanges = false;
        
        // Find all import statements that reference G3D files
        const importRegex = /import\s+(?:{[^}]*}|[^{}\s]+(?:\s*,\s*{[^}]*})?)\s+from\s+['"]([^'"]*\/?)([^'"\/]+)['"];?/g;
        
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const fullMatch = match[0];
            const importPath = match[1];
            const fileName = match[2];
            
            // Check if the imported file is a G3D file that needs renaming
            if (fileName.startsWith('G3D') && (fileName.endsWith('.ts') || fileName.endsWith('.tsx') || !fileName.includes('.'))) {
                // Handle files without extension (add .ts extension for mapping lookup)
                const fileWithExt = fileName.includes('.') ? fileName : `${fileName}.ts`;
                const newFileName = getNewFilename(fileWithExt);
                
                if (newFileName !== fileWithExt) {
                    const newFileNameWithoutExt = newFileName.replace(/\.(ts|tsx)$/, '');
                    const newImportStatement = fullMatch.replace(fileName, newFileNameWithoutExt);
                    
                    updatedContent = updatedContent.replace(fullMatch, newImportStatement);
                    hasChanges = true;
                    
                    console.log(`  📝 ${path.relative(process.cwd(), filePath)}: ${fileName} → ${newFileNameWithoutExt}`);
                }
            }
        }
        
        // Also check for export statements
        const exportRegex = /export\s+.*\s+from\s+['"]([^'"]*\/?)([^'"\/]+)['"];?/g;
        
        while ((match = exportRegex.exec(content)) !== null) {
            const fullMatch = match[0];
            const exportPath = match[1];
            const fileName = match[2];
            
            if (fileName.startsWith('G3D') && (fileName.endsWith('.ts') || fileName.endsWith('.tsx') || !fileName.includes('.'))) {
                const fileWithExt = fileName.includes('.') ? fileName : `${fileName}.ts`;
                const newFileName = getNewFilename(fileWithExt);
                
                if (newFileName !== fileWithExt) {
                    const newFileNameWithoutExt = newFileName.replace(/\.(ts|tsx)$/, '');
                    const newExportStatement = fullMatch.replace(fileName, newFileNameWithoutExt);
                    
                    updatedContent = updatedContent.replace(fullMatch, newExportStatement);
                    hasChanges = true;
                    
                    console.log(`  📤 ${path.relative(process.cwd(), filePath)}: export ${fileName} → ${newFileNameWithoutExt}`);
                }
            }
        }
        
        if (hasChanges) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error updating imports in ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🔄 Phase 3.4: Updating G3D Import Statements');
console.log('===========================================\n');

// Find all TypeScript files in ai-platforms and src
const aiPlatformFiles = findAllTSFiles('ai-platforms');
const srcFiles = findAllTSFiles('src'); 
const backendFiles = findAllTSFiles('backend');
const sharedFiles = findAllTSFiles('shared');

const allFiles = [...aiPlatformFiles, ...srcFiles, ...backendFiles, ...sharedFiles];

console.log(`📊 Found ${allFiles.length} TypeScript files to process\n`);

let totalUpdates = 0;
let processedFiles = 0;

// Process files in batches for better reporting
const batchSize = 10;
for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize);
    
    console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allFiles.length / batchSize)}...`);
    
    for (const filePath of batch) {
        if (updateImportsInFile(filePath)) {
            totalUpdates++;
        }
        processedFiles++;
    }
    
    if (i + batchSize < allFiles.length) {
        console.log(''); // Add spacing between batches
    }
}

console.log('\n✅ Import update completed!');
console.log('==========================');
console.log(`📊 Summary:`);
console.log(`  - Files processed: ${processedFiles}`);
console.log(`  - Files updated: ${totalUpdates}`);
console.log(`  - Import statements updated successfully`);
console.log('\n💡 Next: Update class references, then rename files');

if (totalUpdates === 0) {
    console.log('\n📝 Note: No G3D imports found that needed updating.');
    console.log('This could mean:');
    console.log('  - Files use relative imports within same directory');
    console.log('  - G3D files mostly import from each other');
    console.log('  - Import updates will happen during file renaming');
} 