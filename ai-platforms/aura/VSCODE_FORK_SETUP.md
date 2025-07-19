# Aura VS Code Fork Setup Guide

## 🚀 Complete Reboot Instructions

### **Prerequisites**
- Node.js 18+
- Git
- Python 3.x (for VS Code build)
- 8GB+ RAM for building
- 50GB+ disk space

## 📋 Step-by-Step Reboot Process

### **Phase 1: Backup & Prepare (Day 1)**

```bash
# 1. Backup current work
cd ai-platforms/aura
git add -A
git commit -m "Pre-VS Code fork backup"
git push origin main

# 2. Create migration branch
git checkout -b vscode-migration

# 3. Install migration dependencies
npm install fs-extra chalk

# 4. Run migration analysis
node scripts/migrate-to-vscode.js --dry-run
```

### **Phase 2: Fork VS Code (Day 1-2)**

```bash
# 1. Fork VS Code
cd ../.. # Go to workspace root
git clone https://github.com/microsoft/vscode aura-vscode
cd aura-vscode

# 2. Create Aura branch
git checkout -b aura-main

# 3. Update product configuration
cp product.json product.json.microsoft
```

Create new `product.json`:
```json
{
  "nameShort": "Aura",
  "nameLong": "Aura AI IDE",
  "applicationName": "aura",
  "dataFolderName": ".aura",
  "win32MutexName": "aura",
  "licenseName": "MIT",
  "licenseUrl": "https://github.com/aura/aura/blob/main/LICENSE",
  "win32DirName": "Aura",
  "win32NameVersion": "Aura AI IDE",
  "win32RegValueName": "AuraAI",
  "win32AppUserModelId": "Aura.AuraAI",
  "darwinBundleIdentifier": "com.aura.AuraAI",
  "linuxIconName": "aura",
  "reportIssueUrl": "https://github.com/aura/aura/issues",
  "urlProtocol": "aura",
  "extensionAllowedProposedApi": ["aura.vscode-api-tests", "aura.aura-ai"]
}
```

### **Phase 3: Migrate Code (Day 2-3)**

```bash
# 1. Go back to original Aura
cd ../ai-platforms/aura

# 2. Run migration script
node scripts/migrate-to-vscode.js

# 3. Copy migrated extensions to VS Code fork
cp -r extensions/* ../../aura-vscode/extensions/

# 4. Run deletion script
bash DELETE_THESE_FILES.sh
```

### **Phase 4: Build VS Code Fork (Day 3-4)**

```bash
cd ../../aura-vscode

# 1. Install dependencies
yarn

# 2. Install extension dependencies
cd extensions
for ext in aura-*; do
  cd $ext
  npm install
  cd ..
done
cd ..

# 3. Build VS Code
yarn compile

# 4. Build extensions
yarn compile-extensions

# 5. Run VS Code
./scripts/code.sh
```

### **Phase 5: Extension Development (Week 2)**

#### **5.1 Core Extension Structure**

Create `extensions/aura-core/src/extension.ts`:
```typescript
import * as vscode from 'vscode';
import { ContextEngine } from './context/ContextEngine';
import { CollaborationEngine } from './collaboration/CollaborationEngine';

export async function activate(context: vscode.ExtensionContext) {
    console.log('Aura Core activating...');
    
    // Initialize context engine
    const contextEngine = new ContextEngine(context);
    await contextEngine.initialize();
    
    // Initialize collaboration
    const collabEngine = new CollaborationEngine(context);
    
    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('aura.showSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'aura');
        })
    );
    
    // Set up status bar
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = '$(zap) Aura Ready';
    statusBar.show();
    
    console.log('Aura Core activated!');
}
```

#### **5.2 AI Extension Integration**

Create `extensions/aura-ai/src/extension.ts`:
```typescript
import * as vscode from 'vscode';
import { ModelMesh } from './models/ModelMesh';
import { ModelDownloader } from './models/ModelDownloader';
import { AuraCompletionProvider } from './providers/CompletionProvider';

export async function activate(context: vscode.ExtensionContext) {
    // Initialize model infrastructure
    const modelMesh = new ModelMesh(context.globalStorageUri.fsPath);
    const downloader = new ModelDownloader(context);
    
    // Register AI completion provider
    const provider = new AuraCompletionProvider(modelMesh);
    context.subscriptions.push(
        vscode.languages.registerInlineCompletionItemProvider(
            { pattern: '**' },
            provider
        )
    );
    
    // Add model manager view
    const modelManagerProvider = new ModelManagerProvider(context, downloader);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'aura.modelManager',
            modelManagerProvider
        )
    );
    
    // Status bar for model selection
    const modelStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
    modelStatus.text = '$(hubot) Qwen3-8B';
    modelStatus.command = 'aura.selectModel';
    modelStatus.show();
}
```

#### **5.3 3D Visualization Extension**

Create `extensions/aura-3d/src/extension.ts`:
```typescript
import * as vscode from 'vscode';
import { G3DViewProvider } from './providers/G3DViewProvider';
import { XRManager } from './xr/XRManager';

export async function activate(context: vscode.ExtensionContext) {
    // Register 3D view provider
    const g3dProvider = new G3DViewProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'aura.3dView',
            g3dProvider
        )
    );
    
    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('aura.show3DView', () => {
            vscode.commands.executeCommand('workbench.view.extension.aura-3d');
        }),
        
        vscode.commands.registerCommand('aura.enterVRMode', async () => {
            const xrManager = new XRManager();
            await xrManager.startVRSession();
        })
    );
}
```

### **Phase 6: Testing & Polish (Week 3)**

```bash
# 1. Run extension tests
cd extensions/aura-core
npm test

# 2. Run integration tests
cd ../..
yarn test-integration

# 3. Package extensions
cd extensions
for ext in aura-*; do
  cd $ext
  vsce package
  cd ..
done
```

### **Phase 7: Distribution Setup (Week 4)**

```bash
# 1. Set up build pipeline
yarn gulp vscode-linux-x64
yarn gulp vscode-darwin-x64
yarn gulp vscode-win32-x64

# 2. Create installers
cd build
./create-installers.sh

# 3. Set up auto-update server
cd ../server
npm install
npm run setup-updates
```

## 🎯 Migration Checklist

### **Week 1: Foundation**
- [ ] Fork VS Code repository
- [ ] Update branding and product.json
- [ ] Run migration script
- [ ] Delete Electron/React files
- [ ] Set up build environment

### **Week 2: Core Features**
- [ ] Port ModelMesh to AI extension
- [ ] Port G3D renderer to 3D extension
- [ ] Port context system to Core extension
- [ ] Create webview wrappers for React components
- [ ] Test basic functionality

### **Week 3: Advanced Features**
- [ ] Port AI swarm to task provider
- [ ] Port enterprise features
- [ ] Implement marketplace
- [ ] Add telemetry
- [ ] Performance optimization

### **Week 4: Launch Prep**
- [ ] Create installers for all platforms
- [ ] Set up auto-update infrastructure
- [ ] Create marketplace listings
- [ ] Documentation and tutorials
- [ ] Beta testing program

## 💡 Key Decisions

### **Architecture Choices**
1. **Multi-Extension**: Separate features into focused extensions
2. **Webviews**: Use for complex UI (3D viz, model manager)
3. **Language Server**: For AI completions and analysis
4. **Task Provider**: For AI swarm orchestration

### **Migration Strategy**
1. **Preserve APIs**: Keep same interfaces where possible
2. **Progressive Migration**: Start with core, add features incrementally
3. **Parallel Development**: Keep old app running during migration
4. **User Migration**: Provide settings import tool

## 🚨 Common Issues & Solutions

### **Build Issues**
```bash
# Node version mismatch
nvm use 18

# Python not found
# Install Python 3.x and add to PATH

# Out of memory
export NODE_OPTIONS="--max-old-space-size=8192"
```

### **Extension Issues**
```bash
# Extension not loading
# Check console: Help > Toggle Developer Tools

# Webview not showing
# Ensure webview HTML uses proper CSP headers
```

## 📊 Success Metrics

### **Technical Milestones**
- [ ] All 5 extensions loading successfully
- [ ] <60ms AI completion latency maintained
- [ ] 30+ FPS in 3D visualization
- [ ] All tests passing

### **Migration Complete When**
- [ ] Feature parity with Electron app
- [ ] No UI/UX regressions
- [ ] Performance equal or better
- [ ] Beta users satisfied

---

**Remember**: This is not a rewrite, it's an evolution. You're taking your innovations to a professional foundation that millions of developers already trust. 