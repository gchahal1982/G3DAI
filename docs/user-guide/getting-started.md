# Getting Started with CodeForge

Welcome to CodeForge, the world's first AI-powered development platform with revolutionary 3D code visualization and hybrid local/cloud AI assistance.

## 🚀 Quick Start

### System Requirements

**Minimum Requirements:**
- **OS:** Windows 10+, macOS 11+, or Linux (Ubuntu 20.04+)
- **Memory:** 8GB RAM
- **Storage:** 10GB free space (25GB recommended for all models)
- **GPU:** Optional - Any DirectX 11 compatible GPU for 3D visualization

**Recommended Requirements:**
- **Memory:** 16GB+ RAM
- **GPU:** NVIDIA RTX 3070+ or equivalent for optimal 3D performance
- **Storage:** 50GB+ SSD for full model collection

### Installation Options

#### Option 1: VS Code Extension (Recommended for beginners)
```bash
# Install via VS Code Marketplace
code --install-extension codeforge.codeforge-ai

# Or search "CodeForge AI" in VS Code Extensions
```

#### Option 2: Desktop Application
- **Windows:** Download [CodeForge-Setup.exe](https://releases.codeforge.ai/latest/windows)
- **macOS:** Download [CodeForge.dmg](https://releases.codeforge.ai/latest/macos)
- **Linux:** Download [CodeForge.AppImage](https://releases.codeforge.ai/latest/linux)

#### Option 3: CLI Tool (For power users)
```bash
# Install via npm
npm install -g @codeforge/cli

# Install via Homebrew (macOS/Linux)
brew install codeforge/tap/codeforge

# Install via Cargo (Rust)
cargo install codeforge-cli
```

## 🎯 First Steps

### 1. Initial Setup

#### Create Your Account
1. Launch CodeForge or the VS Code extension
2. Click **"Sign Up"** or **"Continue with GitHub"**
3. Choose your subscription tier:
   - **Developer** ($39/mo) - 15k cloud tokens/day, basic features
   - **Team** ($99/mo) - Unlimited cloud, collaboration, XR
   - **Enterprise** ($299/mo) - Private VPC, SSO, audit logs
   - **Free Trial** - 7 days full access

#### Configure AI Models
CodeForge automatically downloads the best local model for your hardware:

**Automatic Setup (Recommended):**
- **Laptop/Light:** Qwen3-Coder 4B (2.4GB) - Fast, efficient
- **Desktop:** Qwen3-Coder 14B (8.1GB) - Best accuracy
- **Workstation:** Codestral 22B (12.4GB) - Maximum performance

**Manual Model Selection:**
1. Go to **Settings** → **AI Models**
2. Select additional models to download:
   - Phi-4-mini-instruct (3.8B) - Microsoft's latest efficient model
   - Gemma 3 QAT (4B/12B) - Google's quantized multimodal model
   - CodeLlama (7B/13B/34B) - Meta's coding assistant
   - Starcoder2 (3B/7B/15B) - Polyglot programming
   - DeepSeek-Coder (1.3B/6.7B/33B) - Specialized coding

### 2. Create Your First Project

#### Method 1: New Project Wizard
```bash
# Via CLI
codeforge new my-app --template=react-typescript

# Via Desktop App
File → New Project → React TypeScript → Create
```

#### Method 2: Import Existing Project
```bash
# Open existing folder
codeforge open /path/to/project

# Or drag folder into CodeForge window
```

#### Method 3: Clone from Git
```bash
# Clone and open in one command
codeforge clone https://github.com/user/repo
```

### 3. Your First AI Completion

#### Basic Code Completion
1. Open any code file (`.js`, `.ts`, `.py`, `.go`, etc.)
2. Start typing a function or comment
3. Press **Tab** to accept AI suggestions
4. Press **Ctrl+Space** for manual completion

**Example:**
```typescript
// Type this comment:
// Function to calculate fibonacci sequence

// CodeForge AI will suggest:
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
```

#### Advanced AI Features
- **Ctrl+Shift+A** - AI Chat Assistant
- **Ctrl+Shift+E** - Explain Code
- **Ctrl+Shift+R** - Refactor Selection
- **Ctrl+Shift+T** - Generate Tests
- **Ctrl+Shift+D** - Generate Documentation

### 4. Explore 3D Code Visualization

#### Enable 3D View
1. Click the **3D** button in the toolbar
2. Or press **Ctrl+Shift+3**
3. Watch your code transform into an interactive 3D landscape

#### Navigation Controls
- **Mouse:** Rotate and zoom the 3D view
- **WASD:** Fly through your codebase
- **Click:** Jump to any file or function
- **Scroll:** Zoom in/out
- **Space:** Center view on current file

#### 3D Features
- **File Mountains:** File size = mountain height
- **Complexity Heat:** Red = complex, Blue = simple  
- **Call Graphs:** See function relationships in 3D
- **Dependency Rivers:** Visualize import/export flows
- **Change History:** Time-travel through git commits

## 🛠 Core Features

### AI-Powered Development

#### Local AI Models (Privacy-First)
- **No code sent to cloud** for local models
- **Instant completions** with <60ms latency
- **Offline capable** - works without internet
- **7 supported models** for different use cases

#### Cloud AI Models (Power When Needed)
- **Kimi K2** - Advanced agentic workflows
- **DeepSeek R1** - Complex reasoning tasks
- **BYO-Key Support** - Use your OpenAI/Anthropic/Google keys

#### Smart Model Routing
CodeForge automatically selects the best model for each task:
- **Simple completions** → Local models (fast, private)
- **Complex refactoring** → Cloud models (powerful)
- **Architecture design** → Agentic models (comprehensive)

### Collaboration Features

#### Real-Time Collaboration
- **Live editing** with multiple developers
- **CRDT synchronization** - no conflicts
- **Shared 3D visualization** - see teammates' cursors
- **Voice chat integration** - built-in communication

#### Team Workspaces
- **Shared projects** with access controls
- **Team AI quotas** and usage analytics
- **Collaborative debugging** in 3D space
- **Code review** with AI insights

### Enterprise Features

#### Security & Privacy
- **Zero-trust architecture** - every request validated
- **End-to-end encryption** for all data
- **SOC 2 compliant** with audit trails
- **On-premises deployment** available

#### Integration & SSO
- **SAML/OIDC** authentication
- **LDAP/Active Directory** user sync
- **Slack/Teams** notifications
- **Jira/GitHub** issue tracking

## 🎮 Interactive Tutorial

### Tutorial 1: Basic AI Completion
1. Create a new JavaScript file
2. Type: `// Function to reverse a string`
3. Press **Enter** and watch AI complete the function
4. Modify and see AI adapt to your style

### Tutorial 2: 3D Exploration
1. Open a medium-sized project (100+ files)
2. Enable 3D view (**Ctrl+Shift+3**)
3. Use **WASD** to fly through your codebase
4. Click on different files to explore

### Tutorial 3: AI Chat Assistant
1. Press **Ctrl+Shift+A** to open AI chat
2. Ask: "How can I optimize this function?"
3. Select code and ask: "Add error handling"
4. Request: "Generate unit tests for this class"

### Tutorial 4: Collaborative Editing
1. Share project with teammate
2. Enable real-time collaboration
3. Both edit simultaneously in 3D view
4. Use voice chat while pair programming

## 📚 Key Concepts

### AI Model Tiers

#### Local Models (Offline)
- **Qwen3-Coder 4B/8B/14B** - Primary coding assistant
- **Phi-4-mini-instruct** - Microsoft's efficient model (88.6% GSM8K, 64.0% MATH, 62.8% HumanEval)  
- **CodeLlama** - Meta's open-source coding model
- **Codestral** - Mistral's specialized coding model
- **Starcoder2** - Polyglot programming support
- **DeepSeek-Coder** - Efficient coding assistance

#### Cloud Models (Managed)
- **Kimi K2** - 65.8% SWE-bench, agentic workflows
- **DeepSeek R1** - 685B parameters, complex reasoning

#### BYO-Key Models
- **OpenAI** - GPT-4.1, o3-mini
- **Anthropic** - Claude 4 Opus/Sonnet
- **Google** - Gemini 2.5 Pro
- **xAI** - Grok 4
- **Meta** - Llama 4 70B

### 3D Visualization Concepts

#### Spatial Metaphors
- **Files as Landscapes** - Bigger files = higher mountains
- **Functions as Buildings** - Complex functions = taller buildings
- **Dependencies as Roads** - Import/export connections
- **Git History as Time** - Travel through code evolution

#### Navigation Paradigms
- **First-Person View** - Walk through code like a game
- **God Mode** - Bird's eye view of entire project
- **Focus Mode** - Zoom into specific modules
- **Minimap** - Overview with current location

### Subscription Tiers

#### Developer ($39/mo)
- **15,000 cloud tokens/day**
- **All 7 local models**
- **Basic 3D visualization**
- **Email support (48h response)**

#### Team ($99/mo)  
- **Unlimited cloud tokens**
- **Real-time collaboration**
- **Advanced 3D with XR**
- **Chat support (24h response)**

#### Enterprise ($299/mo)
- **Private VPC deployment**
- **SSO & audit logs**
- **Phone support (4h response)**
- **Custom model training**

#### G3D Enterprise ($100k+)
- **On-premises deployment**
- **Unlimited users & GPUs**
- **Dedicated support (1h response)**
- **White-label options**

## 🔧 Customization

### Workspace Settings
```json
{
  "codeforge.models.preferred": "qwen3-coder-14b",
  "codeforge.3d.enabled": true,
  "codeforge.completion.autoAccept": false,
  "codeforge.visualization.theme": "cyberpunk",
  "codeforge.collaboration.voiceChat": true
}
```

### Keyboard Shortcuts
| Action | Shortcut | Description |
|--------|----------|-------------|
| AI Completion | **Tab** | Accept suggestion |
| AI Chat | **Ctrl+Shift+A** | Open chat assistant |
| 3D View | **Ctrl+Shift+3** | Toggle 3D visualization |
| Explain Code | **Ctrl+Shift+E** | AI explains selection |
| Refactor | **Ctrl+Shift+R** | AI refactors code |
| Generate Tests | **Ctrl+Shift+T** | Create unit tests |
| Model Switch | **Ctrl+M** | Change AI model |

### Themes & Appearance
- **Cyberpunk** - Neon colors with dark background
- **Matrix** - Green terminal aesthetic  
- **Synthwave** - Retro 80s vibes
- **Corporate** - Professional blue/gray
- **Nature** - Earth tones and organic shapes

## 🆘 Troubleshooting

### Common Issues

#### AI Completions Not Working
1. **Check internet connection** (for cloud models)
2. **Verify API quotas** in Settings → Usage
3. **Try different model** via Ctrl+M
4. **Restart CodeForge** if persistent

#### 3D Visualization Performance
1. **Update GPU drivers** to latest version
2. **Lower quality settings** in 3D → Performance
3. **Close other GPU-intensive apps**
4. **Try different rendering engine** (WebGL → WebGPU)

#### Sync Issues in Collaboration
1. **Check network connectivity**
2. **Verify team permissions** 
3. **Force sync** via Ctrl+Shift+S
4. **Restart collaboration session**

#### Model Download Failures
1. **Check disk space** (models are 2-22GB each)
2. **Verify network stability**
3. **Try different download server** in Settings
4. **Resume interrupted downloads** automatically

### Performance Optimization

#### For Low-End Hardware
- Use **Qwen3-Coder 4B** instead of 14B
- Disable **3D visualization** for large projects
- Enable **completion caching** in settings
- Reduce **context window size**

#### For High-End Hardware  
- Download **all local models** for variety
- Enable **aggressive caching** for speed
- Use **WebGPU rendering** for 3D
- Increase **context window** to 8k tokens

### Getting Help

#### Self-Service Resources
- **Documentation Hub** - [docs.codeforge.ai](https://docs.codeforge.ai)
- **Video Tutorials** - [learn.codeforge.ai](https://learn.codeforge.ai)
- **Community Forum** - [community.codeforge.ai](https://community.codeforge.ai)
- **GitHub Discussions** - [github.com/codeforge/discussions](https://github.com/codeforge/discussions)

#### Support Channels by Tier
- **Developer:** Email support (48h response)
- **Team:** Email + Chat (24h response)  
- **Enterprise:** Email + Chat + Phone (4h response)
- **G3D Enterprise:** Dedicated support (1h response)

#### Emergency Support
For critical production issues (Enterprise+ only):
- **Emergency Hotline:** +1-555-CODEFORGE
- **Slack Connect:** Direct channel with engineering
- **Priority Escalation:** Automatic escalation to senior engineers

## 🎯 Next Steps

### Explore Advanced Features
1. **AI Swarm Orchestration** - Multiple AI agents working together
2. **XR Code Walkthroughs** - VR/AR code exploration
3. **Enterprise Integrations** - Connect with your existing tools
4. **Custom Model Training** - Train AI on your codebase

### Join the Community
- **Discord:** [discord.gg/codeforge](https://discord.gg/codeforge)
- **Twitter:** [@CodeForgeAI](https://twitter.com/CodeForgeAI)
- **LinkedIn:** [CodeForge Company Page](https://linkedin.com/company/codeforge-ai)
- **YouTube:** [CodeForge Channel](https://youtube.com/@CodeForgeAI)

### Stay Updated
- **Newsletter:** Weekly updates and tips
- **Blog:** [blog.codeforge.ai](https://blog.codeforge.ai) - Deep dives and tutorials
- **Changelog:** [changelog.codeforge.ai](https://changelog.codeforge.ai) - Latest features
- **Roadmap:** [roadmap.codeforge.ai](https://roadmap.codeforge.ai) - What's coming next

---

**Welcome to the future of coding with CodeForge! 🚀**

*Need help? Contact us at [support@codeforge.ai](mailto:support@codeforge.ai)* 