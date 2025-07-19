#!/bin/bash
# delete-electron-files.sh

echo "⚠️  WARNING: This will delete Electron/React files for VS Code migration"
echo "📊 Files to be deleted (~3,000 lines of Electron/React code):"
echo "   - src/App.tsx (159 lines)"
echo "   - src/main.tsx (190 lines)"
echo "   - index.html (109 lines)"
echo "   - electron/ directory (1,105 lines)"
echo "   - dist-electron/ directory"
echo "   - Various config files"
echo ""
echo "✅ Files to be preserved (~50,000+ lines of core functionality):"
echo "   - extensions/ directory (now contains 5 VS Code extensions)"
echo "   - src/lib/ directory (all core functionality)"
echo "   - All documentation and scripts"
echo ""
read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🗑️  Starting deletion process..."
    
    # Core React/Electron files
    echo "  Removing core React/Electron files..."
    rm -f src/App.tsx src/main.tsx index.html
    rm -f vite.config.ts postcss.config.js tailwind.config.js
    rm -f src/vite-env.d.ts
    
    # Electron infrastructure
    echo "  Removing Electron infrastructure..."
    rm -rf dist-electron/ electron/
    rm -rf src/desktop/
    
    # UI components (these are now webviews in extensions)
    echo "  Removing custom UI components..."
    rm -rf src/components/app/
    rm -f src/components/editor/CodeEditor.tsx 2>/dev/null
    rm -f src/components/editor/EditorToolbar.tsx 2>/dev/null
    rm -f src/components/settings/SettingsPanel.tsx 2>/dev/null
    
    # Build files
    echo "  Removing build configuration files..."
    rm -f webpack.config.js
    
    echo ""
    echo "✅ Deletion complete!"
    echo "📊 Summary:"
    echo "   - Deleted: ~3,000 lines of Electron/React code"
    echo "   - Preserved: ~50,000+ lines of core functionality"
    echo "   - Preservation rate: 94.3%"
    echo ""
    echo "🔄 Next steps:"
    echo "   1. Fork VS Code repository"
    echo "   2. Copy extensions/ folder to VS Code fork"
    echo "   3. Configure build system"
    echo "   4. Test extension functionality"
    echo ""
else
    echo "❌ Deletion cancelled. No files were removed."
fi 