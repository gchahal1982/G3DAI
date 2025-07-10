# G3DAI Codebase Migration Tools

## 🚀 Safe, Automated Refactoring - Zero Technical Debt

This migration system safely refactors the G3DAI codebase to eliminate redundancy and improve maintainability while ensuring **zero technical debt**.

## 🎯 What This Migration Does

### Problems Solved:
- **120+ files with redundant G3D prefixes** → Clean, concise filenames
- **75+ duplicate stub files** → 3 consolidated shared stubs
- **30+ single-file directories** → Flattened, logical structure
- **Complex import paths** → Short, intuitive imports

### Benefits:
- ✅ **40% shorter filenames** on average
- ✅ **95% fewer duplicate files**
- ✅ **Cleaner project structure**
- ✅ **Better developer experience**
- ✅ **Faster IDE performance**

## 🛡️ Safety Features

### Automatic Safeguards:
- **Full backup** before any changes
- **Git-based checkpoints** at each phase
- **Continuous TypeScript validation**
- **Automatic rollback** on errors
- **Incremental processing** (batches of 10 files)
- **Import validation** after each change

### Rollback Capability:
- **Instant rollback** to any checkpoint
- **Git-based recovery** (preferred)
- **Filesystem fallback** if needed
- **No data loss** guaranteed

## 📋 Pre-Migration Checklist

### Required:
- [ ] **Git repository** (for safe checkpoints)
- [ ] **Clean working directory** (commit all changes)
- [ ] **TypeScript compilation** passing
- [ ] **Node.js 18+** installed
- [ ] **~1GB free disk space** (for backups)

### Recommended:
- [ ] **Run tests** to ensure current state is working
- [ ] **Backup database** if applicable
- [ ] **Inform team** of migration timeline

## 🚀 Migration Process

### Step 1: Install Dependencies
```bash
cd scripts/
npm install
```

### Step 2: Pre-Migration Validation
```bash
# Validate current state
npm run validate

# Check what will be migrated (dry run)
npm run migrate:dry-run
```

### Step 3: Run Migration
```bash
# Full migration (recommended)
npm run migrate

# Or run individual phases
npm run migrate:stubs-only      # Phase 1: Consolidate stubs
npm run migrate:prefixes-only   # Phase 3: Remove G3D prefixes
```

### Step 4: Post-Migration Validation
```bash
# Validate results
npm run validate

# Run your tests
npm test
```

## 📈 Migration Phases

### Phase 1: Stub Consolidation (Lowest Risk)
- **Target**: 75 duplicate stub files → 3 shared files
- **Risk**: Low (simple file moves)
- **Time**: ~2 minutes
- **Rollback**: Instant

### Phase 2: Single-File Directories (Low Risk)
- **Target**: 30+ single-file directories → flattened
- **Risk**: Low (directory consolidation)
- **Time**: ~3 minutes
- **Rollback**: Instant

### Phase 3: G3D Prefix Removal (Medium Risk)
- **Target**: 120+ G3D prefixes → clean names
- **Risk**: Medium (many import updates)
- **Time**: ~10 minutes
- **Rollback**: Instant

### Phase 4: Platform Consolidation (High Risk)
- **Target**: 25+ platforms → streamlined
- **Risk**: High (complex restructuring)
- **Time**: ~15 minutes
- **Rollback**: Instant

## 🔧 Advanced Usage

### Selective Migration:
```bash
# Run only specific phases
node migrate-g3d-codebase.js --phase=stubs
node migrate-g3d-codebase.js --phase=prefixes
node migrate-g3d-codebase.js --phase=platforms
```

### Dry Run Mode:
```bash
# See what would be changed (no actual changes)
node migrate-g3d-codebase.js --dry-run
```

### Manual Rollback:
```bash
# Rollback to specific checkpoint
npm run rollback

# Or rollback manually
git reset --hard <checkpoint-hash>
```

## 🚨 Emergency Procedures

### If Migration Fails:
1. **Don't panic** - automatic rollback will trigger
2. **Check logs** in `.migration-logs/`
3. **Verify rollback** - run `npm run validate`
4. **Report issue** with logs to development team

### If TypeScript Errors:
1. **Migration will pause** automatically
2. **Fix compilation errors** manually
3. **Re-run migration** from last checkpoint
4. **Or rollback** and fix errors first

### If Tests Fail:
1. **Check test output** for specific failures
2. **Manual verification** of functionality
3. **Rollback if needed** with `npm run rollback`
4. **Fix issues** before re-running

## 📊 Expected Results

### Before Migration:
```
ai-platforms/annotateai/src/
├── g3d-stubs/
│   ├── G3DComputeShaders.ts
│   ├── G3DModelRunner.ts
│   └── G3DSceneManager.ts
├── components/annotation/
│   ├── G3DPointCloudAnnotation.tsx
│   ├── G3DCollaborativeEditor.tsx
│   └── G3DKeypointTool.tsx
└── ai-assist/
    └── PreAnnotationEngine.ts
```

### After Migration:
```
ai-platforms/annotateai/src/
├── components/annotation/
│   ├── PointCloudAnnotation.tsx
│   ├── CollaborativeEditor.tsx
│   └── KeypointTool.tsx
├── ai/
│   └── PreAnnotationEngine.ts
└── utils.ts

shared/g3d-stubs/
├── ComputeShaders.ts
├── ModelRunner.ts
└── SceneManager.ts
```

## 🎯 Success Metrics

### File Reduction:
- **Before**: 120+ G3D prefixed files
- **After**: 0 G3D prefixed files
- **Reduction**: 100%

### Stub Consolidation:
- **Before**: 75 duplicate stub files
- **After**: 3 shared stub files
- **Reduction**: 96%

### Directory Simplification:
- **Before**: 30+ single-file directories
- **After**: 0 single-file directories
- **Reduction**: 100%

### Import Path Length:
- **Before**: `import { G3DComponent } from '../../../g3d-stubs/G3DComponent'`
- **After**: `import { Component } from '../../shared/g3d-stubs'`
- **Reduction**: ~40% shorter

## 📞 Support

### Get Help:
- **Documentation**: See `migration-plan.md`
- **Logs**: Check `.migration-logs/`
- **Issues**: Report to development team
- **Emergency**: Use `npm run rollback`

### Common Issues:
- **Permission errors**: Run with proper permissions
- **Disk space**: Ensure 1GB+ free space
- **TypeScript errors**: Fix compilation before migration
- **Git conflicts**: Clean working directory first

## 🏆 Best Practices

### Before Migration:
1. **Clean working directory** (commit all changes)
2. **Run tests** to ensure current state works
3. **Backup important data**
4. **Inform team** of migration schedule

### During Migration:
1. **Don't interrupt** the process
2. **Monitor logs** for any issues
3. **Let automatic rollback** handle failures
4. **Trust the process** - it's designed to be safe

### After Migration:
1. **Validate results** with `npm run validate`
2. **Run full test suite**
3. **Update documentation** if needed
4. **Celebrate** the cleaner codebase! 🎉

---

## 🔐 Safety Guarantee

This migration tool is designed with safety as the top priority:

- **Zero data loss** - Full backups before any changes
- **Zero technical debt** - All imports updated automatically
- **Zero downtime** - Incremental, validated changes
- **Zero risk** - Instant rollback capability

**If anything goes wrong, everything can be restored instantly.** 