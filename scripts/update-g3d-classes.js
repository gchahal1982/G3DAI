#!/usr/bin/env node

/**
 * G3D Class Reference Updater - Phase 3 Migration  
 * Updates class names, interfaces, and type references within files
 */

const fs = require('fs');
const path = require('path');
const { getNewClassName } = require('./g3d-prefix-mappings');

// Function to update class references in a single file
function updateClassReferencesInFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let updatedContent = content;
        let hasChanges = false;
        
        // Get the current file's class name if it's a G3D file
        const fileName = path.basename(filePath);
        const isG3DFile = fileName.startsWith('G3D');
        let currentClassName = null;
        let newClassName = null;
        
        if (isG3DFile) {
            currentClassName = fileName.replace(/\.(ts|tsx)$/, '');
            newClassName = getNewClassName(fileName);
            
            if (currentClassName !== newClassName) {
                // Update class declaration
                const classRegex = new RegExp(`\\bclass\\s+${currentClassName}\\b`, 'g');
                if (classRegex.test(content)) {
                    updatedContent = updatedContent.replace(classRegex, `class ${newClassName}`);
                    hasChanges = true;
                    console.log(`  🏗️  ${path.relative(process.cwd(), filePath)}: class ${currentClassName} → ${newClassName}`);
                }
                
                // Update interface declarations
                const interfaceRegex = new RegExp(`\\binterface\\s+${currentClassName}\\b`, 'g');
                if (interfaceRegex.test(content)) {
                    updatedContent = updatedContent.replace(interfaceRegex, `interface ${newClassName}`);
                    hasChanges = true;
                    console.log(`  📋 ${path.relative(process.cwd(), filePath)}: interface ${currentClassName} → ${newClassName}`);
                }
                
                // Update default exports
                const defaultExportRegex = new RegExp(`export\\s+default\\s+${currentClassName}\\b`, 'g');
                if (defaultExportRegex.test(content)) {
                    updatedContent = updatedContent.replace(defaultExportRegex, `export default ${newClassName}`);
                    hasChanges = true;
                    console.log(`  📤 ${path.relative(process.cwd(), filePath)}: export default ${currentClassName} → ${newClassName}`);
                }
                
                // Update constructor references
                const constructorRegex = new RegExp(`new\\s+${currentClassName}\\b`, 'g');
                if (constructorRegex.test(content)) {
                    updatedContent = updatedContent.replace(constructorRegex, `new ${newClassName}`);
                    hasChanges = true;
                    console.log(`  🔧 ${path.relative(process.cwd(), filePath)}: new ${currentClassName} → new ${newClassName}`);
                }
            }
        }
        
        // Update references to other G3D classes that will be renamed
        // This handles cases where files reference other G3D classes
        const g3dClassRegex = /\b(G3D[A-Z][a-zA-Z0-9]*)\b/g;
        let match;
        while ((match = g3dClassRegex.exec(content)) !== null) {
            const originalClassName = match[1];
            const newClassNameForRef = getNewClassName(`${originalClassName}.ts`).replace('.ts', '');
            
            if (originalClassName !== newClassNameForRef && originalClassName !== currentClassName) {
                // Be careful not to replace within strings or comments
                // Use word boundaries and avoid quoted strings
                const classRefRegex = new RegExp(`\\b${originalClassName}\\b(?!['"\\s]*:)`, 'g');
                const beforeUpdate = updatedContent;
                updatedContent = updatedContent.replace(classRefRegex, newClassNameForRef);
                
                if (beforeUpdate !== updatedContent) {
                    hasChanges = true;
                    console.log(`  🔗 ${path.relative(process.cwd(), filePath)}: ${originalClassName} → ${newClassNameForRef}`);
                }
            }
        }
        
        // Update JSX component references (for .tsx files)
        if (fileName.endsWith('.tsx')) {
            const jsxRegex = /<(G3D[A-Z][a-zA-Z0-9]*)/g;
            while ((match = jsxRegex.exec(content)) !== null) {
                const originalComponentName = match[1];
                const newComponentName = getNewClassName(`${originalComponentName}.tsx`).replace('.tsx', '');
                
                if (originalComponentName !== newComponentName) {
                    // Update opening tags
                    const openTagRegex = new RegExp(`<${originalComponentName}\\b`, 'g');
                    updatedContent = updatedContent.replace(openTagRegex, `<${newComponentName}`);
                    
                    // Update closing tags
                    const closeTagRegex = new RegExp(`</${originalComponentName}>`, 'g');
                    updatedContent = updatedContent.replace(closeTagRegex, `</${newComponentName}>`);
                    
                    hasChanges = true;
                    console.log(`  ⚛️  ${path.relative(process.cwd(), filePath)}: <${originalComponentName}> → <${newComponentName}>`);
                }
            }
        }
        
        if (hasChanges) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error updating class references in ${filePath}:`, error.message);
        return false;
    }
}

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

// Main execution
console.log('🔄 Phase 3.5: Updating G3D Class References');
console.log('==========================================\n');

// Find all TypeScript files
const aiPlatformFiles = findAllTSFiles('ai-platforms');
const srcFiles = findAllTSFiles('src'); 
const backendFiles = findAllTSFiles('backend');
const sharedFiles = findAllTSFiles('shared');

const allFiles = [...aiPlatformFiles, ...srcFiles, ...backendFiles, ...sharedFiles];

console.log(`📊 Found ${allFiles.length} TypeScript files to process\n`);

let totalUpdates = 0;
let processedFiles = 0;

// Process files in batches for better reporting
const batchSize = 20;
for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize);
    
    console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allFiles.length / batchSize)}...`);
    
    for (const filePath of batch) {
        if (updateClassReferencesInFile(filePath)) {
            totalUpdates++;
        }
        processedFiles++;
    }
    
    if (i + batchSize < allFiles.length) {
        console.log(''); // Add spacing between batches
    }
}

console.log('\n✅ Class reference update completed!');
console.log('===================================');
console.log(`📊 Summary:`);
console.log(`  - Files processed: ${processedFiles}`);
console.log(`  - Files updated: ${totalUpdates}`);
console.log(`  - Class references updated successfully`);
console.log('\n💡 Next: Rename files (final atomic operation)'); 