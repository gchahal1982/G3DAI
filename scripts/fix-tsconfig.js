#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Standard tsconfig template for all AI platforms
const createTsConfigTemplate = () => ({
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../../shared/*"],
      "@shared/ui/*": ["../../shared/ui/src/*"],
      "@shared/api/*": ["../../shared/api-gateway/src/*"],
      "@backend/*": ["../../backend/src/*"],
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist", "build"]
});

// Get all platform directories
function getPlatformDirectories() {
  const platformsPath = path.join(__dirname, '..', 'ai-platforms');
  return fs.readdirSync(platformsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

// Function to fix a single tsconfig.json file
function fixTsConfig(platformName) {
  const platformPath = path.join(__dirname, '..', 'ai-platforms', platformName);
  const tsConfigPath = path.join(platformPath, 'tsconfig.json');
  
  if (!fs.existsSync(platformPath)) {
    console.log(`⚠️  Platform directory not found: ${platformName}`);
    return;
  }
  
  try {
    const template = createTsConfigTemplate();
    
    // Write the fixed tsconfig.json
    fs.writeFileSync(tsConfigPath, JSON.stringify(template, null, 2));
    console.log(`✅ Fixed tsconfig.json for ${platformName}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${platformName}:`, error.message);
  }
}

// Main execution
console.log('🚀 Starting tsconfig.json cleanup for all AI platforms...\n');

const platforms = getPlatformDirectories();
platforms.forEach(platform => {
  fixTsConfig(platform);
});

console.log('\n✅ tsconfig.json cleanup completed!');
console.log('\nNext steps:');
console.log('1. Test TypeScript compilation: npm run type-check');
console.log('2. Fix import statements');
console.log('3. Test development server: npm run dev'); 