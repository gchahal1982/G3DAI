# G3DAI Codebase Refactoring Migration Plan
## Safe, Automated, Zero Technical Debt Strategy

### Phase 0: Preparation & Risk Mitigation

#### 1. Create Migration Tooling
```bash
# Create automated migration scripts
scripts/
├── migrate-g3d-prefixes.js      # Automated G3D prefix removal
├── migrate-directories.js       # Directory consolidation
├── migrate-imports.js           # Import path updates
├── validate-migration.js        # Validation & testing
└── rollback-migration.js        # Emergency rollback
```

#### 2. Pre-Migration Validation
- Full TypeScript compilation check
- All tests passing
- Backup current state
- Create migration log

#### 3. Import Analysis & Mapping
- Scan all imports in codebase
- Create dependency graph
- Map old paths → new paths
- Identify circular dependencies

### Phase 1: Stub File Consolidation (Lowest Risk)

#### Target: 75 duplicate G3D stub files → 3 shared files

**Step 1.1: Create Shared Stubs**
```
shared/g3d-stubs/
├── ComputeShaders.ts    # Remove G3D prefix
├── ModelRunner.ts       # Remove G3D prefix  
└── SceneManager.ts      # Remove G3D prefix
```

**Step 1.2: Automated Import Updates**
```javascript
// migrate-stubs.js
const fs = require('fs');
const path = require('path');

// Update all imports from:
// import { G3DComputeShaders } from '../g3d-stubs/G3DComputeShaders'
// to:
// import { ComputeShaders } from '../../../shared/g3d-stubs/ComputeShaders'

const updateImports = (filePath) => {
  // Safe regex replacement with validation
  // Update both import paths and usage
};
```

**Step 1.3: Validation & Testing**
- Run TypeScript compiler
- Run tests
- Manual verification of 3 key files
- If any issues: automatic rollback

### Phase 2: Single-File Directory Consolidation (Low Risk)

#### Target: 30+ single-file directories → flattened structure

**Step 2.1: Backend Services**
```
backend/auth-service/src/
├── AuthController.ts     # Move from controllers/
└── UserModel.ts          # Move from models/
```

**Step 2.2: Shared Services**
```
shared/auth/src/
├── AuthService.ts        # Move from services/
└── types.ts             # Consolidate from types/
```

**Step 2.3: Automated Migration**
```javascript
// migrate-single-files.js
const migrations = [
  {
    from: 'backend/auth-service/src/controllers/AuthController.ts',
    to: 'backend/auth-service/src/AuthController.ts',
    updateImports: true
  },
  // ... all other single-file moves
];
```

### Phase 3: G3D Prefix Removal (Medium Risk)

#### Target: 120+ files with G3D prefixes → clean names

**Step 3.1: Filename Mapping**
```javascript
// g3d-prefix-mapping.js
const prefixMappings = {
  // AnnotateAI
  'G3DPointCloudAnnotation.tsx': 'PointCloudAnnotation.tsx',
  'G3DKeypointTool.tsx': 'KeypointTool.tsx',
  'G3DCollaborativeEditor.tsx': 'CollaborativeEditor.tsx',
  
  // MedSight-Pro
  'G3DMPRRenderer.ts': 'MPRRenderer.ts',
  'G3DDICOMProcessor.ts': 'DICOMProcessor.ts',
  'G3DMedicalRenderer.ts': 'MedicalRenderer.ts',
  
  // Main Services
  'G3DRealTimeAnalytics.ts': 'RealTimeAnalytics.ts',
  'G3DSecurityManager.ts': 'SecurityManager.ts',
  
  // ... complete mapping for all 120+ files
};
```

**Step 3.2: Smart Import Detection**
```javascript
// detect-imports.js
const detectAllImports = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  
  // Detect all import patterns:
  // import { G3DComponent } from './G3DComponent'
  // import G3DComponent from './G3DComponent'
  // import * as G3D from './G3DComponent'
  // const G3D = require('./G3DComponent')
  
  return imports;
};
```

**Step 3.3: Atomic Rename & Update**
```javascript
// atomic-rename.js
const atomicRename = (oldPath, newPath) => {
  // 1. Copy file to new location
  // 2. Update all imports pointing to old file
  // 3. Update exports within the file
  // 4. Validate TypeScript compilation
  // 5. If success: delete old file
  // 6. If failure: rollback everything
};
```

### Phase 4: AI Platform Consolidation (High Risk)

#### Target: 25+ platforms with identical structure → streamlined

**Step 4.1: Platform Analysis**
```javascript
// analyze-platforms.js
const platformAnalysis = {
  'bioai': {
    hasComponents: ['BioAIDashboard.tsx'],
    hasServices: [],
    hasTypes: [],
    complexity: 'simple'
  },
  'annotateai': {
    hasComponents: ['11 complex components'],
    hasServices: ['multiple'],
    hasTypes: ['multiple'],
    complexity: 'complex'
  }
  // ... analyze all 25+ platforms
};
```

**Step 4.2: Phased Platform Migration**
```
Simple Platforms First (bioai, climateai, etc.):
├── Single file consolidation
├── Remove g3d-stubs
└── Update imports

Complex Platforms Last (annotateai, medsight-pro):
├── Careful analysis
├── Incremental changes
└── Extensive testing
```

### Automated Migration Scripts

#### 1. Master Migration Script
```javascript
// migrate-all.js
const phases = [
  { name: 'stub-consolidation', risk: 'low' },
  { name: 'single-file-dirs', risk: 'low' },
  { name: 'g3d-prefixes', risk: 'medium' },
  { name: 'platform-consolidation', risk: 'high' }
];

const runMigration = async () => {
  for (const phase of phases) {
    console.log(`Starting ${phase.name} (${phase.risk} risk)`);
    
    // 1. Create checkpoint
    await createCheckpoint(phase.name);
    
    // 2. Run migration
    const result = await runPhase(phase.name);
    
    // 3. Validate
    const validation = await validateMigration();
    
    // 4. If failed: rollback
    if (!validation.success) {
      await rollbackToCheckpoint(phase.name);
      throw new Error(`Migration failed: ${validation.error}`);
    }
    
    console.log(`✅ ${phase.name} completed successfully`);
  }
};
```

#### 2. Import Update Engine
```javascript
// import-updater.js
class ImportUpdater {
  constructor() {
    this.mappings = new Map();
    this.processedFiles = new Set();
  }
  
  updateImports(filePath, oldName, newName) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Update all import patterns
    const patterns = [
      `import { ${oldName} }`,
      `import ${oldName}`,
      `import * as ${oldName}`,
      `from '${oldName}'`,
      `from "${oldName}"`,
      `require('${oldName}')`,
      `require("${oldName}")`
    ];
    
    let updatedContent = content;
    patterns.forEach(pattern => {
      updatedContent = updatedContent.replace(
        new RegExp(pattern, 'g'),
        pattern.replace(oldName, newName)
      );
    });
    
    // Validate TypeScript before writing
    if (this.validateTypeScript(updatedContent)) {
      fs.writeFileSync(filePath, updatedContent);
    } else {
      throw new Error(`TypeScript validation failed for ${filePath}`);
    }
  }
}
```

#### 3. Validation Engine
```javascript
// validator.js
class MigrationValidator {
  async validateMigration() {
    const results = {
      typescript: await this.validateTypeScript(),
      imports: await this.validateImports(),
      tests: await this.runTests(),
      linting: await this.runLinter()
    };
    
    return {
      success: Object.values(results).every(r => r.success),
      details: results
    };
  }
  
  async validateTypeScript() {
    // Run: npx tsc --noEmit
    // Parse output for errors
    // Return success/failure with details
  }
  
  async validateImports() {
    // Check for broken imports
    // Check for circular dependencies
    // Check for missing exports
  }
}
```

### Safety Mechanisms

#### 1. Checkpoint System
```javascript
// checkpoint.js
const createCheckpoint = async (name) => {
  const timestamp = Date.now();
  const checkpointPath = `.migration-checkpoints/${name}-${timestamp}`;
  
  // Create full backup
  await fs.promises.cp('.', checkpointPath, { recursive: true });
  
  return checkpointPath;
};

const rollbackToCheckpoint = async (checkpointPath) => {
  // Restore from backup
  // Update git state
  // Notify of rollback
};
```

#### 2. Incremental Validation
```javascript
// After each file change:
1. Run TypeScript compilation on affected files
2. Run relevant tests
3. If any failure: immediate rollback
4. Continue only on success
```

### Execution Plan

#### Week 1: Preparation
- [ ] Create migration scripts
- [ ] Full codebase analysis
- [ ] Create import dependency graph
- [ ] Set up validation pipeline

#### Week 2: Phase 1 - Stub Consolidation
- [ ] Create shared stubs
- [ ] Update all 75 stub imports
- [ ] Validate & test
- [ ] Remove duplicate files

#### Week 3: Phase 2 - Single-File Directories
- [ ] Migrate backend services
- [ ] Migrate shared services
- [ ] Update all imports
- [ ] Validate & test

#### Week 4: Phase 3 - G3D Prefix Removal
- [ ] Start with simple files
- [ ] Migrate annotateai (55 files)
- [ ] Migrate medsight-pro (59 files)
- [ ] Migrate main services (7 files)
- [ ] Validate & test after each batch

#### Week 5: Phase 4 - Platform Consolidation
- [ ] Simple platforms first
- [ ] Complex platforms last
- [ ] Final validation
- [ ] Documentation updates

### Emergency Procedures

#### If Migration Fails:
1. **Immediate rollback** to last checkpoint
2. **Analyze failure** in isolated environment
3. **Fix issues** in migration scripts
4. **Re-run** from checkpoint

#### If TypeScript Errors:
1. **Pause migration**
2. **Fix compilation errors**
3. **Re-validate**
4. **Continue or rollback**

### Success Metrics

#### Before Migration:
- 120+ files with G3D prefixes
- 75+ duplicate stub files
- 30+ single-file directories
- Complex import paths

#### After Migration:
- 0 G3D prefixes
- 3 shared stub files
- 0 single-file directories
- Clean, short import paths
- 100% TypeScript compilation
- 100% test passage

This strategy ensures **zero technical debt** by:
1. **Automated everything** - No manual import updates
2. **Incremental changes** - Easy to isolate issues
3. **Constant validation** - Catch problems immediately
4. **Rollback capability** - Safe to experiment
5. **Comprehensive testing** - Validate each step

Would you like me to start implementing these migration scripts? 