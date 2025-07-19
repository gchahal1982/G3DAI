#!/usr/bin/env node

/**
 * Aura VS Code Migration Script
 * Migrates existing Aura lib to VS Code extension structure
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Migration mappings
const MIGRATIONS = {
  // AI Model Infrastructure → AI Extension
  'src/lib/models/ModelDownloader.ts': 'extensions/aura-ai/src/models/ModelDownloader.ts',
  'src/lib/models/ModelMesh.ts': 'extensions/aura-ai/src/models/ModelMesh.ts',
  'src/lib/models/ModelRegistry.ts': 'extensions/aura-ai/src/models/ModelRegistry.ts',
  'src/lib/models/ModelRouter.ts': 'extensions/aura-ai/src/models/ModelRouter.ts',
  'src/lib/models/ModelStorage.ts': 'extensions/aura-ai/src/models/ModelStorage.ts',
  'src/lib/models/ModelLoader.ts': 'extensions/aura-ai/src/models/ModelLoader.ts',
  'src/lib/models/AdaptiveDownloader.ts': 'extensions/aura-ai/src/models/AdaptiveDownloader.ts',
  'src/lib/models/BYOKey.ts': 'extensions/aura-ai/src/models/BYOKey.ts',
  
  // 3D Visualization → 3D Extension
  'src/lib/g3d/G3DRenderer.ts': 'extensions/aura-3d/src/rendering/G3DRenderer.ts',
  'src/lib/g3d/SceneBuilder.ts': 'extensions/aura-3d/src/rendering/SceneBuilder.ts',
  'src/lib/g3d/MinimapController.ts': 'extensions/aura-3d/src/rendering/MinimapController.ts',
  'src/lib/g3d/PerformanceMonitor.ts': 'extensions/aura-3d/src/rendering/PerformanceMonitor.ts',
  
  // AI Swarm → Swarm Extension
  'src/lib/swarm/SwarmOrchestrator.ts': 'extensions/aura-swarm/src/orchestrator/SwarmOrchestrator.ts',
  'src/lib/swarm/agents/PlannerAgent.ts': 'extensions/aura-swarm/src/agents/PlannerAgent.ts',
  'src/lib/swarm/agents/CoderAgent.ts': 'extensions/aura-swarm/src/agents/CoderAgent.ts',
  'src/lib/swarm/agents/TesterAgent.ts': 'extensions/aura-swarm/src/agents/TesterAgent.ts',
  'src/lib/swarm/agents/SecurityAgent.ts': 'extensions/aura-swarm/src/agents/SecurityAgent.ts',
  'src/lib/swarm/agents/DocAgent.ts': 'extensions/aura-swarm/src/agents/DocAgent.ts',
  
  // Context System → Core Extension
  'src/lib/context/FileWatcher.ts': 'extensions/aura-core/src/context/FileWatcher.ts',
  'src/lib/context/ASTIndexer.ts': 'extensions/aura-core/src/context/ASTIndexer.ts',
  'src/lib/context/VectorDB.ts': 'extensions/aura-core/src/context/VectorDB.ts',
  'src/lib/context/SemanticStore.ts': 'extensions/aura-core/src/context/SemanticStore.ts',
  'src/lib/context/ContextPlanner.ts': 'extensions/aura-core/src/context/ContextPlanner.ts',
  'src/lib/context/Retriever.ts': 'extensions/aura-core/src/context/Retriever.ts',
  'src/lib/context/PromptAssembler.ts': 'extensions/aura-core/src/context/PromptAssembler.ts',
  'src/lib/context/ContextCache.ts': 'extensions/aura-core/src/context/ContextCache.ts',
  
  // Enterprise Features → Enterprise Extension
  'src/lib/billing/TokenManager.ts': 'extensions/aura-enterprise/src/billing/TokenManager.ts',
  'src/lib/billing/TierManager.ts': 'extensions/aura-enterprise/src/billing/TierManager.ts',
  'src/lib/licensing/RuntimeKeyIssuer.ts': 'extensions/aura-enterprise/src/licensing/RuntimeKeyIssuer.ts',
  'src/lib/licensing/LicenseValidator.ts': 'extensions/aura-enterprise/src/licensing/LicenseValidator.ts',
  'src/lib/compliance/SOC2Manager.ts': 'extensions/aura-enterprise/src/compliance/SOC2Manager.ts',
  'src/lib/compliance/EUAIActCompliance.ts': 'extensions/aura-enterprise/src/compliance/EUAIActCompliance.ts',
  'src/lib/compliance/FedRAMPCompliance.ts': 'extensions/aura-enterprise/src/compliance/FedRAMPCompliance.ts',
  'src/lib/compliance/SBOMGenerator.ts': 'extensions/aura-enterprise/src/compliance/SBOMGenerator.ts',
  'src/lib/auth/EnterpriseAuth.ts': 'extensions/aura-enterprise/src/auth/EnterpriseAuth.ts',
  'src/lib/auth/ZeroTrust.ts': 'extensions/aura-enterprise/src/auth/ZeroTrust.ts',
  
  // Collaboration → Core Extension
  'src/lib/collaboration/CollaborationEngine.ts': 'extensions/aura-core/src/collaboration/CollaborationEngine.ts',
  'src/lib/collaboration/LiveblocksIntegration.ts': 'extensions/aura-core/src/collaboration/LiveblocksIntegration.ts',
  
  // XR/VR → 3D Extension
  'src/lib/xr/XRManager.ts': 'extensions/aura-3d/src/xr/XRManager.ts',
  
  // Existing VS Code extension files
  'extensions/vscode/src/extension.ts': 'extensions/aura-core/src/extension.ts',
  'extensions/vscode/src/providers/CompletionProvider.ts': 'extensions/aura-ai/src/providers/CompletionProvider.ts',
};

// Component to Webview migrations
const COMPONENT_MIGRATIONS = {
  'src/components/visualization/CodeMinimap3D.tsx': 'extensions/aura-3d/src/webviews/CodeMinimap3D.tsx',
  'src/components/visualization/CallGraph3D.tsx': 'extensions/aura-3d/src/webviews/CallGraph3D.tsx',
  'src/components/visualization/IntentGraph.tsx': 'extensions/aura-3d/src/webviews/IntentGraph.tsx',
  'src/components/models/ModelManager.tsx': 'extensions/aura-ai/src/webviews/ModelManager.tsx',
  'src/components/analytics/': 'extensions/aura-core/src/webviews/analytics/',
  'src/components/marketplace/': 'extensions/aura-core/src/webviews/marketplace/',
  'src/components/xr/XRCodeWalkthrough.tsx': 'extensions/aura-3d/src/webviews/XRCodeWalkthrough.tsx',
};

async function migrate() {
  console.log(chalk.blue.bold('🚀 Aura VS Code Migration Script\n'));
  
  // Step 1: Create extension directories
  console.log(chalk.yellow('📁 Creating extension directories...'));
  const extensions = ['aura-core', 'aura-ai', 'aura-3d', 'aura-swarm', 'aura-enterprise'];
  
  for (const ext of extensions) {
    const extPath = path.join('extensions', ext, 'src');
    await fs.ensureDir(extPath);
    console.log(chalk.green(`  ✅ Created ${extPath}`));
  }
  
  // Step 2: Migrate library files
  console.log(chalk.yellow('\n📚 Migrating library files...'));
  let migratedCount = 0;
  
  for (const [source, dest] of Object.entries(MIGRATIONS)) {
    if (await fs.pathExists(source)) {
      await fs.ensureDir(path.dirname(dest));
      await fs.copy(source, dest);
      console.log(chalk.green(`  ✅ ${source} → ${dest}`));
      migratedCount++;
    } else {
      console.log(chalk.red(`  ❌ ${source} not found`));
    }
  }
  
  // Step 3: Migrate components to webviews
  console.log(chalk.yellow('\n🎨 Migrating components to webviews...'));
  
  for (const [source, dest] of Object.entries(COMPONENT_MIGRATIONS)) {
    if (await fs.pathExists(source)) {
      await fs.ensureDir(path.dirname(dest));
      await fs.copy(source, dest);
      console.log(chalk.green(`  ✅ ${source} → ${dest}`));
      migratedCount++;
    }
  }
  
  // Step 4: Update imports
  console.log(chalk.yellow('\n🔧 Updating import statements...'));
  await updateImports();
  
  // Step 5: Create extension manifests
  console.log(chalk.yellow('\n📋 Creating extension manifests...'));
  await createExtensionManifests();
  
  // Step 6: Summary
  console.log(chalk.blue.bold(`\n✨ Migration Complete!`));
  console.log(chalk.green(`  ✅ Migrated ${migratedCount} files`));
  console.log(chalk.green(`  ✅ Created ${extensions.length} extensions`));
  console.log(chalk.yellow('\n📝 Next Steps:'));
  console.log('  1. Run DELETE_THESE_FILES.md deletion script');
  console.log('  2. Fork VS Code repository');
  console.log('  3. Copy extensions/ folder to VS Code fork');
  console.log('  4. Update extension dependencies');
  console.log('  5. Test each extension individually');
}

async function updateImports() {
  // Update import paths in migrated files
  const extensionsDir = 'extensions';
  const files = await getAllTypeScriptFiles(extensionsDir);
  
  for (const file of files) {
    let content = await fs.readFile(file, 'utf8');
    
    // Update relative imports
    content = content.replace(/from ['"]\.\.\/lib\//g, "from '../");
    content = content.replace(/from ['"]\.\.\/\.\.\/lib\//g, "from '../../");
    content = content.replace(/import .* from ['"]vscode['"]/g, "import * as vscode from 'vscode'");
    
    await fs.writeFile(file, content);
  }
}

async function getAllTypeScriptFiles(dir) {
  const files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...await getAllTypeScriptFiles(fullPath));
    } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function createExtensionManifests() {
  const manifests = {
    'aura-core': {
      name: 'aura-core',
      displayName: 'Aura Core',
      description: 'Core functionality for Aura AI IDE',
      version: '0.1.0',
      engines: { vscode: '^1.74.0' },
      categories: ['Other'],
      activationEvents: ['onStartupFinished'],
      main: './out/extension.js',
      contributes: {
        configuration: {
          title: 'Aura',
          properties: {
            'aura.enableAI': {
              type: 'boolean',
              default: true,
              description: 'Enable AI features'
            }
          }
        }
      }
    },
    'aura-ai': {
      name: 'aura-ai',
      displayName: 'Aura AI',
      description: 'AI-powered coding assistance with 7 local + 2 cloud models',
      version: '0.1.0',
      engines: { vscode: '^1.74.0' },
      categories: ['Programming Languages', 'Machine Learning'],
      main: './out/extension.js',
      contributes: {
        languages: [{
          id: 'aura-ai',
          aliases: ['Aura AI']
        }]
      }
    },
    'aura-3d': {
      name: 'aura-3d',
      displayName: 'Aura 3D Visualization',
      description: 'Revolutionary 3D code visualization with VR/AR support',
      version: '0.1.0',
      engines: { vscode: '^1.74.0' },
      categories: ['Visualization'],
      main: './out/extension.js',
      contributes: {
        commands: [{
          command: 'aura.show3DView',
          title: 'Aura: Show 3D View'
        }]
      }
    },
    'aura-swarm': {
      name: 'aura-swarm',
      displayName: 'Aura AI Swarm',
      description: 'Orchestrated AI agents for architecture, coding, testing, and more',
      version: '0.1.0',
      engines: { vscode: '^1.74.0' },
      categories: ['Other'],
      main: './out/extension.js'
    },
    'aura-enterprise': {
      name: 'aura-enterprise',
      displayName: 'Aura Enterprise',
      description: 'Enterprise features including SSO, compliance, and licensing',
      version: '0.1.0',
      engines: { vscode: '^1.74.0' },
      categories: ['Other'],
      main: './out/extension.js'
    }
  };
  
  for (const [ext, manifest] of Object.entries(manifests)) {
    const packagePath = path.join('extensions', ext, 'package.json');
    await fs.writeJson(packagePath, manifest, { spaces: 2 });
    console.log(chalk.green(`  ✅ Created ${packagePath}`));
  }
}

// Run migration
migrate().catch(console.error); 