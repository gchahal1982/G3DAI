#!/bin/bash

echo "🚀 AURA EXTENSION TESTING SETUP"
echo "================================"

EXTENSIONS_DIR="codeforge-vscode/extensions"
TEST_WORKSPACE="aura-test-workspace"

# Create a test workspace
mkdir -p "$TEST_WORKSPACE"
cd "$TEST_WORKSPACE"

echo "📁 Created test workspace: $(pwd)"

# Create sample files for testing
cat > sample.ts << 'EOF'
// Sample TypeScript file for testing Aura AI features
interface User {
    id: number;
    name: string;
    email: string;
}

class UserService {
    private users: User[] = [];
    
    async createUser(userData: Partial<User>): Promise<User> {
        // TODO: Add validation
        const newUser: User = {
            id: Date.now(),
            name: userData.name || '',
            email: userData.email || ''
        };
        this.users.push(newUser);
        return newUser;
    }
    
    findUserById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }
}

export { UserService, User };
EOF

cat > sample.py << 'EOF'
# Sample Python file for testing Aura AI features
class Calculator:
    def __init__(self):
        self.history = []
    
    def add(self, a, b):
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        return result
    
    def multiply(self, a, b):
        result = a * b
        self.history.append(f"{a} * {b} = {result}")
        return result
    
    def get_history(self):
        return self.history

if __name__ == "__main__":
    calc = Calculator()
    print(calc.add(5, 3))
    print(calc.multiply(4, 7))
EOF

cat > README.md << 'EOF'
# Aura Extension Testing Workspace

This workspace is set up to test the Aura VS Code extensions:

## Available Extensions:
- 🎯 **aura-core**: Core functionality and context management
- 🤖 **aura-ai**: AI-powered coding assistance with 7 local + 2 cloud models  
- 🌐 **aura-3d**: Revolutionary 3D code visualization with VR/AR support
- 🔄 **aura-swarm**: Multi-agent orchestration for complex tasks
- 🏢 **aura-enterprise**: Enterprise features with SSO and compliance

## Testing Commands:
1. Open this workspace in VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Look for "aura" commands to test functionality

## Files for Testing:
- `sample.ts` - TypeScript file for AI testing
- `sample.py` - Python file for AI testing
- Try the 3D visualization on this codebase!
EOF

cd ..

echo ""
echo "✅ Test workspace created at: $TEST_WORKSPACE"
echo ""
echo "🔧 TESTING INSTRUCTIONS:"
echo "1. Open VS Code"
echo "2. Go to Extensions (Ctrl+Shift+X)"
echo "3. Click '...' menu → 'Install from VSIX...'"
echo "4. Navigate to the codeforge-vscode/extensions/ folder"
echo "5. Install each .vsix extension file (if available)"
echo "   OR"
echo "6. Use Developer: Reload Window to load extensions in development mode"
echo ""
echo "📂 Then open the workspace: $TEST_WORKSPACE"
echo ""
echo "🎯 WHAT TO TEST:"
echo "- Look for 'aura' in the Command Palette (Ctrl+Shift+P)"
echo "- Check for new views in the Explorer panel"
echo "- Try AI completions while editing code"
echo "- Look for 3D visualization commands"
echo "- Test enterprise authentication features"
echo ""
echo "For more details, see: ai-platforms/aura/docs/mvp-development-roadmap.md" 