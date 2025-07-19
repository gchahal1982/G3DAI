# Aura VS Code Fork - FILES TO DELETE

## 🗑️ COMPREHENSIVE DELETE LIST

### **IMMEDIATE DELETES - Core Electron/React Files**
```bash
# Delete these files that conflict with VS Code architecture
rm -f src/App.tsx                    # Custom React app shell
rm -f src/main.tsx                   # React entry point
rm -f index.html                     # HTML template
rm -f vite.config.ts                 # Vite bundler config
rm -f postcss.config.js              # PostCSS config
rm -f tailwind.config.js             # Tailwind CSS config
rm -rf dist-electron/                # Electron build output
rm -rf electron/                     # Electron configs
rm -f src/vite-env.d.ts             # Vite types
```

### **DELETE - Desktop/Electron Infrastructure**
```bash
# Remove all Electron-specific code
rm -f src/desktop/main.ts            # Electron main process
rm -f src/desktop/preload.ts         # Electron preload script
rm -rf src/desktop/security/         # Custom sandboxing (VS Code handles this)
```

### **DELETE - UI Components (Replace with VS Code UI)**
```bash
# These components are replaced by VS Code's native UI
rm -rf src/components/app/           # AppShell.tsx, etc
rm -rf src/components/editor/CodeEditor.tsx    # Monaco wrapper
rm -rf src/components/editor/EditorToolbar.tsx # Custom toolbar
rm -rf src/components/settings/SettingsPanel.tsx # Custom settings
```

### **DELETE - Build & Config Files**
```bash
# VS Code has its own build system
rm -f webpack.config.js              # Root webpack config
rm -f package-lock.json              # Will regenerate for VS Code
rm -rf node_modules/                 # Clean install for VS Code
```

### **TRANSFORM BUT DON'T DELETE YET**
```bash
# These need careful migration before deletion
# src/styles/                        # May contain useful theme definitions
# tests/unit/                        # Rewrite for VS Code extension testing
# tests/integration/                 # Adapt to VS Code test framework
# tests/e2e/                         # Convert to VS Code UI tests
```

## 📁 FILES TO KEEP (Already VS Code Compatible)
```
extensions/vscode/src/extension.ts    # Already VS Code extension!
extensions/vscode/src/providers/      # Already providers!
extensions/neovim/                    # Keep for NeoVim users
```

## 🛠️ DELETION SCRIPT
```bash
#!/bin/bash
# delete-electron-files.sh

echo "⚠️  WARNING: This will delete Electron/React files for VS Code migration"
read -p "Are you sure? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Core files
    rm -f src/App.tsx src/main.tsx index.html
    rm -f vite.config.ts postcss.config.js tailwind.config.js
    
    # Electron
    rm -rf dist-electron/ electron/
    rm -rf src/desktop/
    
    # Components
    rm -rf src/components/app/
    rm -f src/components/editor/CodeEditor.tsx
    rm -f src/components/editor/EditorToolbar.tsx
    rm -f src/components/settings/SettingsPanel.tsx
    
    # Build files
    rm -f webpack.config.js
    
    echo "✅ Electron/React files deleted. Ready for VS Code migration!"
fi
```

## 📊 DELETION IMPACT ANALYSIS

### **Total Lines Deleted**: ~3,000
- App.tsx: 159 lines
- main.tsx: 190 lines  
- desktop/main.ts: 551 lines
- desktop/preload.ts: 554 lines
- UI components: ~1,500 lines

### **Total Lines Preserved**: ~50,000+
- Model infrastructure: ~8,000 lines
- 3D visualization: ~4,000 lines
- AI swarm: ~10,000 lines
- Enterprise features: ~15,000 lines
- Other lib code: ~13,000 lines

### **Preservation Rate**: 94.3%

## ⚡ POST-DELETION CHECKLIST

After deleting these files:

1. [ ] Run migration script to move lib/ → extensions/
2. [ ] Create new VS Code extension manifests
3. [ ] Set up VS Code development environment
4. [ ] Update package.json for VS Code
5. [ ] Configure multi-extension workspace
6. [ ] Test that no imports reference deleted files

---

**Remember**: This is not destruction, it's evolution. You're removing 6% of problematic UI code to unleash 94% of powerful innovation on a better foundation. 