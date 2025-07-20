# 🚀 How to Test Aura VS Code Extensions

## Current Status
✅ **All 5 Aura extensions are compiled and ready for testing**
- `codeforge-core` - Core functionality (8 compiled files)
- `codeforge-ai` - AI features (9 compiled files)  
- `codeforge-3d` - 3D visualization (8 compiled files)
- `codeforge-swarm` - Multi-agent orchestration (7 compiled files)
- `codeforge-enterprise` - Enterprise features (9 compiled files)

## 🎯 Method 1: Extension Development Host (Recommended)

### Quick Start
1. **Open VS Code**
2. **Open this workspace**: `File → Open Folder → Select: aura-test-workspace`
3. **Run Extensions**: `F5` or `Run → Start Debugging`
4. **Select**: "Test All Aura Extensions" from the dropdown
5. **New VS Code window opens** with all Aura extensions loaded!

### What You'll See
- **Command Palette** (`Cmd+Shift+P`): Look for "aura" commands
- **Explorer Panel**: New views for AI Models, 3D Visualization  
- **Status Bar**: Aura indicators and controls
- **Settings**: Aura configuration options

## 🎯 Method 2: Manual Extension Testing

### Step 1: Open Extension Development
```bash
# Navigate to an extension
cd codeforge-vscode/extensions/codeforge-core

# Open in VS Code for development
code .
```

### Step 2: Run Individual Extension
1. Press `F5` in the extension's VS Code window
2. A new "Extension Development Host" window opens
3. Test the extension functionality

## 🧪 Testing Checklist

### 🎯 Core Extension (`codeforge-core`)
- [ ] Check for "aura: Open Settings" command
- [ ] Verify context management features
- [ ] Test "aura: Reset Context Cache" command

### 🤖 AI Extension (`codeforge-ai`)  
- [ ] Look for AI model selection in Explorer
- [ ] Test code completions (edit sample.ts)
- [ ] Try "aura AI: Explain Selected Code" command
- [ ] Check model download functionality

### 🌐 3D Extension (`codeforge-3d`)
- [ ] Look for "aura: Show 3D View" command
- [ ] Test 3D code visualization
- [ ] Try "aura: Enter VR Mode" if supported
- [ ] Check 3D export features

### 🔄 Swarm Extension (`codeforge-swarm`)
- [ ] Look for multi-agent task commands
- [ ] Test agent orchestration features
- [ ] Check swarm coordination UI

### 🏢 Enterprise Extension (`codeforge-enterprise`)
- [ ] Test authentication features
- [ ] Check compliance settings
- [ ] Verify enterprise licensing

## 📁 Test Files Available
- `sample.ts` - TypeScript for AI testing
- `sample.py` - Python for AI testing  
- `README.md` - Documentation testing

## 🔧 Troubleshooting

### Extensions Not Loading?
1. Check that `out/` directories exist in each extension
2. Try rebuilding individual extensions:
   ```bash
   cd codeforge-vscode/extensions/codeforge-core
   npm install
   npm run compile
   ```

### Missing Commands?
1. Check the Command Palette for "aura" entries
2. Verify extension activation events
3. Look for errors in Developer Console (`Help → Toggle Developer Tools`)

### Performance Issues?
1. Check VS Code settings for Aura configurations
2. Monitor resource usage
3. Test with smaller codebases first

## 🎨 UI/UX Elements to Evaluate

### Visual Design
- [ ] Extension icons and branding
- [ ] Command palette integration
- [ ] Status bar indicators
- [ ] Panel layouts and views

### User Experience  
- [ ] Command discoverability
- [ ] Feature accessibility
- [ ] Performance and responsiveness
- [ ] Error handling and feedback

### AI Features
- [ ] Completion quality and speed
- [ ] Model selection interface
- [ ] Context awareness
- [ ] Confidence indicators

### 3D Visualization
- [ ] Rendering performance
- [ ] Navigation controls
- [ ] Code mapping accuracy
- [ ] VR/AR mode (if available)

## 📊 Expected Performance Targets
- **AI Completion Latency**: <60ms
- **3D Rendering**: 30+ FPS
- **Memory Usage**: <500MB baseline
- **UI Responsiveness**: 60fps

## 🚀 Next Steps After Testing
1. Document any issues found
2. Test performance against targets
3. Evaluate UI/UX against Cursor and other IDEs
4. Provide feedback on missing features

---

**Happy Testing! 🎉**

For technical details, see: `ai-platforms/aura/docs/mvp-development-roadmap.md` 