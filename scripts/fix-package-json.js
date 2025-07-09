#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Base template for all AI platforms
const createPackageTemplate = (platformName, port, description) => ({
    "name": `@g3d/${platformName}`,
    "version": "1.0.0",
    "description": description,
    "main": "dist/index.js",
    "scripts": {
        "dev": `next dev -p ${port}`,
        "build": "next build",
        "start": `next start -p ${port}`,
        "lint": "next lint",
        "type-check": "tsc --noEmit",
        "test": "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage"
    },
    "dependencies": {
        "next": "^14.0.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "typescript": "^5.0.2",
        "tailwindcss": "^3.3.0",
        "autoprefixer": "^10.4.16",
        "postcss": "^8.4.31",
        "framer-motion": "^10.16.0",
        "uuid": "^9.0.1",
        "axios": "^1.6.2",
        "lodash": "^4.17.21",
        "date-fns": "^2.30.0",
        "plotly.js": "^2.27.0",
        "d3": "^7.8.5"
    },
    "devDependencies": {
        "@types/node": "^20.0.0",
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@types/uuid": "^9.0.7",
        "@types/lodash": "^4.14.200",
        "@types/d3": "^7.4.3",
        "eslint": "^8.52.0",
        "eslint-config-next": "^14.0.0",
        "jest": "^29.7.0",
        "@testing-library/react": "^13.4.0",
        "@testing-library/jest-dom": "^6.1.4"
    },
    "keywords": [
        platformName,
        "ai",
        "g3d",
        "glassmorphism"
    ],
    "author": "G3D Team",
    "license": "MIT",
    "repository": {
        "type": "git",
        "url": `https://github.com/g3d/${platformName}.git`
    }
});

// Platform-specific configurations
const platforms = [
    { name: "annotateai", port: 3021, description: "G3D AnnotateAI - Computer Vision Data Labeling & Annotation Platform", 
      extraDeps: ["three", "@react-three/fiber", "@react-three/drei", "@tensorflow/tfjs", "fabric", "konva", "react-konva"] },
    { name: "medsight-pro", port: 3022, description: "G3D MedSight Pro - Medical Imaging AI Platform",
      extraDeps: ["three", "@react-three/fiber", "@react-three/drei", "gl-matrix"] },
    { name: "bioai", port: 3023, description: "G3D BioAI - Bioinformatics and Drug Discovery Platform",
      extraDeps: ["three", "@react-three/fiber", "@react-three/drei"] },
    { name: "neuroai", port: 3024, description: "G3D NeuroAI - Brain-Computer Interface Applications Platform" },
    { name: "quantumai", port: 3025, description: "G3D QuantumAI - Quantum-Classical Hybrid Computing Platform" },
    { name: "mesh3d", port: 3026, description: "G3D Mesh3D - 3D Model Generation Platform",
      extraDeps: ["three", "@react-three/fiber", "@react-three/drei"] },
    { name: "renderai", port: 3027, description: "G3D RenderAI - 3D Generation & Rendering Platform",
      extraDeps: ["three", "@react-three/fiber", "@react-three/drei"] },
    { name: "climateai", port: 3028, description: "G3D ClimateAI - Environmental Modeling and Prediction Platform" },
    { name: "spaceai", port: 3029, description: "G3D SpaceAI - Satellite Imagery and Space Data Analysis Platform" },
    { name: "metaverseai", port: 3030, description: "G3D MetaverseAI - Virtual World Intelligence Platform",
      extraDeps: ["three", "@react-three/fiber", "@react-three/drei"] },
    { name: "retailai", port: 3031, description: "G3D RetailAI - Retail Intelligence Suite" },
    { name: "financeai", port: 3032, description: "G3D FinanceAI - Financial Analysis Platform" },
    { name: "healthai", port: 3033, description: "G3D HealthAI - Personal Health Intelligence Platform" },
    { name: "legalai", port: 3034, description: "G3D LegalAI - AI Legal Assistant Platform" },
    { name: "voiceai", port: 3035, description: "G3D VoiceAI - Enterprise Voice Intelligence Platform" },
    { name: "translateai", port: 3036, description: "G3D TranslateAI - Neural Translation Platform" },
    { name: "documind", port: 3037, description: "G3D DocuMind - Intelligent Document Processing" },
    { name: "edgeai", port: 3038, description: "G3D EdgeAI - Edge Computing AI Platform" },
    { name: "automl", port: 3039, description: "G3D AutoML - Automated Machine Learning Platform" },
    { name: "chatbuilder", port: 3040, description: "G3D ChatBuilder - Conversational AI Platform" },
    { name: "videoai", port: 3041, description: "G3D VideoAI - Video Intelligence Platform" },
    { name: "secureai", port: 3042, description: "G3D SecureAI - AI Security Operations Platform" },
    { name: "dataforge", port: 3043, description: "G3D DataForge - Enterprise Data Intelligence Platform" },
    { name: "codeforge", port: 3044, description: "G3D CodeForge - Enterprise Code Generation Platform" },
    { name: "creativestudio", port: 3045, description: "G3D CreativeStudio - AI Content Generation Suite" },
    { name: "agriculturalai", port: 3046, description: "G3D AgriculturalAI - Smart Farming Intelligence Platform" },
    { name: "transportai", port: 3047, description: "G3D TransportAI - Transportation Intelligence Platform" }
];

// Function to fix a single package.json file
function fixPackageJson(platformConfig) {
    const platformPath = path.join(__dirname, '..', 'ai-platforms', platformConfig.name);
    const packagePath = path.join(platformPath, 'package.json');
    
    if (!fs.existsSync(packagePath)) {
        console.log(`⚠️  Package.json not found for ${platformConfig.name}`);
        return;
    }
    
    try {
        // Create base template
        const template = createPackageTemplate(
            platformConfig.name,
            platformConfig.port,
            platformConfig.description
        );
        
        // Add extra dependencies if specified
        if (platformConfig.extraDeps) {
            platformConfig.extraDeps.forEach(dep => {
                if (dep === "three") template.dependencies["three"] = "^0.158.0";
                else if (dep === "@react-three/fiber") template.dependencies["@react-three/fiber"] = "^8.15.0";
                else if (dep === "@react-three/drei") template.dependencies["@react-three/drei"] = "^9.88.0";
                else if (dep === "@tensorflow/tfjs") template.dependencies["@tensorflow/tfjs"] = "^4.15.0";
                else if (dep === "fabric") template.dependencies["fabric"] = "^5.3.0";
                else if (dep === "konva") template.dependencies["konva"] = "^9.2.0";
                else if (dep === "react-konva") template.dependencies["react-konva"] = "^18.2.10";
                else if (dep === "gl-matrix") template.dependencies["gl-matrix"] = "^3.4.3";
            });
            
            // Add corresponding type definitions
            if (platformConfig.extraDeps.includes("three")) {
                template.devDependencies["@types/three"] = "^0.158.0";
            }
            if (platformConfig.extraDeps.includes("fabric")) {
                template.devDependencies["@types/fabric"] = "^5.3.0";
            }
        }
        
        // Write the fixed package.json
        fs.writeFileSync(packagePath, JSON.stringify(template, null, 4));
        console.log(`✅ Fixed package.json for ${platformConfig.name}`);
        
    } catch (error) {
        console.error(`❌ Error fixing ${platformConfig.name}:`, error.message);
    }
}

// Main execution
console.log('🚀 Starting package.json cleanup for all AI platforms...\n');

platforms.forEach(platform => {
    fixPackageJson(platform);
});

console.log('\n✅ Package.json cleanup completed!');
console.log('\nNext steps:');
console.log('1. Run: cd ai-platforms/[platform-name] && npm install');
console.log('2. Test compilation: npm run type-check');
console.log('3. Start development: npm run dev'); 