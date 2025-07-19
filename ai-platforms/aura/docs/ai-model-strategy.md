# Aura Local LLM & Cloud API Strategy (July 2025)

## Executive Summary
Aura provides a comprehensive approach to AI model integration, offering **Local LLM Models** for privacy, offline capability, and cost efficiency, alongside **Cloud API Models** for advanced capabilities and convenience. This document outlines our strategy as of July 18, 2025.

## Model Categories

### 1. **Local LLM Models** (Downloaded & Run on User's Hardware)
**Purpose**: Privacy-first, offline capability, zero latency for common tasks, no recurring costs

### 2. **Cloud API Models** (Network Access Required)
**Purpose**: Advanced reasoning, multimodal capabilities, extended context windows, latest features

---

## Local LLM Models

### 🔥 **Qwen3-Coder Series** (PRIMARY LOCAL MODEL)
- **Sizes**: 4B, 8B, 14B, 32B parameters
- **Strength**: Best-in-class coding performance (92.9% HumanEval)
- **Use Cases**: 
  - Code completion and generation
  - Bug fixing and refactoring
  - Code explanation and documentation
  - Multi-language programming support
- **Special Features**: 
  - 32K context window
  - Superior performance on code benchmarks
  - Excellent at following coding patterns
- **Download Size**:
  - 4B: 2.5GB (Q4_K_M)
  - 8B: 5.0GB (Q4_K_M)
  - 14B: 7.5GB (Q4_K_M)
  - 32B: 17GB (Q4_K_M)
- **RAM Requirements**:
  - 4B: 4GB VRAM + 4GB System RAM
  - 8B: 8GB VRAM + 6GB System RAM
  - 14B: 12GB VRAM + 8GB System RAM
  - 32B: 24GB VRAM + 12GB System RAM
- **Installation**: Auto-download from Hugging Face during setup (14B default)

### 🤖 **Phi-4-mini Series** (AGENTIC LOCAL MODEL)
- **Sizes**: 3.8B parameters (standard and flash-reasoning variants)
- **Strength**: Function calling, tool use, agentic capabilities
- **Use Cases**:
  - Local agent workflows
  - Function calling and API integration
  - Structured output generation
  - Math and logical reasoning
- **Special Features**:
  - Native function calling support
  - 64K-128K context window
  - Excellent reasoning capabilities for size
  - Flash variant: 10x faster inference
- **Download Size**: 2.2GB (Q4_K_M)
- **RAM Requirements**: 6GB VRAM + 4GB System RAM
- **Installation**: Optional download via Settings → AI Models

### 📚 **Gemma 3 Series** 
- **Sizes**: 4B, 12B, 27B parameters
- **Strength**: Google's latest efficient architecture, multimodal capabilities
- **Use Cases**:
  - General coding assistance
  - Multimodal tasks (12B model)
  - Educational content generation
  - Conversational AI
- **Special Features**:
  - QAT (Quantization Aware Training) versions available
  - Vision capabilities in 12B model
  - Excellent multilingual support
- **Download Size**:
  - 4B: 2.4GB (Q4_K_M)
  - 12B: 6.8GB (Q4_K_M)
  - 27B: 14.5GB (Q4_K_M)
- **RAM Requirements**:
  - 4B: 4GB VRAM + 4GB System RAM
  - 12B: 10GB VRAM + 6GB System RAM
  - 27B: 20GB VRAM + 10GB System RAM
- **Installation**: Optional download via Settings → AI Models

### 🚀 **Mistral Devstral Small**
- **Size**: 24B parameters
- **Strength**: Agentic coding, SWE-bench performance
- **Use Cases**:
  - Complex code refactoring
  - Multi-file editing
  - Codebase exploration
  - Software engineering agents
- **Special Features**:
  - 256K context window
  - 53.6% SWE-bench verified
  - Optimized for code agents
- **Download Size**: 12GB (Q4_K_M)
- **RAM Requirements**: 16GB VRAM + 8GB System RAM
- **Installation**: Optional download via Settings → AI Models

### 🦙 **Llama 3.3-70B**
- **Size**: 70B parameters
- **Strength**: General purpose, strong reasoning
- **Use Cases**:
  - Complex reasoning tasks
  - Large context understanding
  - Multilingual support
  - General assistance
- **Special Features**:
  - 128K context window
  - Excellent benchmark scores
  - Strong safety alignment
- **Download Size**: 35GB (Q4_K_M)
- **RAM Requirements**: 48GB VRAM + 16GB System RAM
- **Installation**: Optional download for workstation users

### ⭐ **Starcoder2-15B**
- **Size**: 15B parameters
- **Strength**: Code generation, multiple programming languages
- **Use Cases**:
  - Polyglot programming
  - Code translation
  - Legacy code understanding
  - API generation
- **Special Features**:
  - Trained on 600+ programming languages
  - Fill-in-the-middle capability
  - Strong performance on niche languages
- **Download Size**: 8GB (Q4_K_M)
- **RAM Requirements**: 12GB VRAM + 6GB System RAM
- **Installation**: Optional download via Settings → AI Models

### 🔧 **DeepSeek-Coder V2 Lite**
- **Size**: 16B parameters (2.4B active)
- **Strength**: Efficient MoE architecture, fast inference
- **Use Cases**:
  - Real-time code completion
  - Low-latency applications
  - Resource-constrained environments
  - IDE integration
- **Special Features**:
  - MoE architecture for efficiency
  - 128K context window
  - Excellent speed/quality tradeoff
- **Download Size**: 7.5GB (Q4_K_M)
- **RAM Requirements**: 8GB VRAM + 6GB System RAM
- **Installation**: Optional download via Settings → AI Models

---

## Cloud API Models

### 💫 **Kimi K2** (AGENTIC CLOUD MODEL)
- **Provider**: Moonshot AI (Aura Managed)
- **Strength**: Best-in-class agentic capabilities, tool use
- **Use Cases**:
  - Multi-step autonomous workflows
  - Complex tool orchestration
  - Long-context reasoning (1M tokens)
  - Research and analysis tasks
- **Pricing**: $0.60/$2.50 per M tokens (5x cheaper than GPT-4)
- **Special Features**:
  - 1T parameters (32B active)
  - Superior agentic performance
  - Excellent cost/performance ratio
- **Model Size**: N/A (Cloud API)
- **RAM Requirements**: N/A (Cloud API)
- **Installation**: API Key provided by Aura

### 🧠 **DeepSeek R1**
- **Provider**: DeepSeek (Aura Managed)
- **Strength**: Complex reasoning, architecture decisions
- **Use Cases**:
  - System design and architecture
  - Complex algorithm development
  - Mathematical proofs
  - Research-level tasks
- **Pricing**: $0.27/$1.10 per M tokens
- **Special Features**:
  - 671B parameters (37B active)
  - State-of-the-art reasoning
  - 128K context window
- **Model Size**: N/A (Cloud API)
- **RAM Requirements**: N/A (Cloud API)
- **Installation**: API Key provided by Aura

### 🌟 **OpenAI GPT-4.1/GPT-5** (BYO-Key)
- **Provider**: OpenAI
- **Strength**: General intelligence, multimodal
- **Use Cases**:
  - Complex reasoning
  - Creative tasks
  - Vision understanding
  - Advanced code generation
- **Pricing**: $30/$60 per M tokens
- **Special Features**:
  - Latest capabilities
  - o3-mini for reasoning tasks
  - Function calling
- **Model Size**: N/A (Cloud API)
- **RAM Requirements**: N/A (Cloud API)
- **Installation**: User provides API key

### 🎭 **Claude 3.7 Opus/Sonnet** (BYO-Key)
- **Provider**: Anthropic
- **Strength**: Long context, careful reasoning
- **Use Cases**:
  - Document analysis
  - Code review
  - Research assistance
  - Complex refactoring
- **Pricing**: $15/$75 per M tokens (Opus)
- **Special Features**:
  - 200K context window
  - Excellent safety
  - Strong coding abilities
- **Model Size**: N/A (Cloud API)
- **RAM Requirements**: N/A (Cloud API)
- **Installation**: User provides API key

### 🔮 **Gemini 2.5 Pro** (BYO-Key)
- **Provider**: Google
- **Strength**: Multimodal, efficiency
- **Use Cases**:
  - Vision + code tasks
  - Document understanding
  - Real-time applications
  - Mobile deployment
- **Pricing**: $7/$21 per M tokens
- **Special Features**:
  - 2M context window
  - Native multimodal
  - Fast inference
- **Model Size**: N/A (Cloud API)
- **RAM Requirements**: N/A (Cloud API)
- **Installation**: User provides API key

### ⚡ **Grok 4** (BYO-Key)
- **Provider**: xAI
- **Strength**: Real-time information, reasoning
- **Use Cases**:
  - Current events integration
  - Real-time data analysis
  - Web-aware coding
  - Research tasks
- **Pricing**: $5/$15 per M tokens
- **Special Features**:
  - 1.7T parameters
  - Real-time web access
  - 256K context window
- **Model Size**: N/A (Cloud API)
- **RAM Requirements**: N/A (Cloud API)
- **Installation**: User provides API key

---

## Agentic Capabilities Strategy

### Local Agentic Solutions

1. **Phi-4-mini with Function Calling** (RECOMMENDED)
   - Native function calling support
   - Lightweight (3.8B params, 2.2GB download)
   - Excellent for local agent workflows
   - Can orchestrate multiple tools

2. **Qwen3-Coder-14B with Tool Adapters**
   - Add tool calling via fine-tuning
   - Strong base capabilities
   - Good for code-specific agents
   - 7.5GB download size

3. **Mistral Devstral Small**
   - Built for agentic coding
   - Native multi-file editing
   - Excellent for SWE agents
   - 12GB download size

### Hybrid Approach (Local + Cloud)

For optimal agentic performance:
- **Local**: Use Phi-4-mini for routing and simple tasks
- **Cloud**: Delegate complex reasoning to Kimi K2
- **Fallback**: Use local models when offline

---

## Hardware Profiles & Recommendations

### 🎮 **Gaming PC** (RTX 3060-3070, 12GB VRAM)
- Primary: Qwen3-Coder-8B (5GB download)
- Agentic: Phi-4-mini (2.2GB download)
- Fallback: Cloud APIs
- Total Storage: ~8GB

### 💪 **Enthusiast** (RTX 4080-4090, 16-24GB VRAM)
- Primary: Qwen3-Coder-14B (7.5GB download)
- Agentic: Phi-4-mini + Mistral Devstral (14.2GB total)
- Optional: Gemma-3-12B for multimodal (6.8GB)
- Total Storage: ~25GB

### 🖥️ **Workstation** (A6000/H100, 48GB+ VRAM)
- Primary: Qwen3-Coder-32B (17GB download)
- Secondary: Llama-3.3-70B (35GB download)
- Full local stack possible
- Total Storage: ~60GB+

### 💻 **Laptop** (8GB VRAM or less)
- Primary: Qwen3-Coder-4B (2.5GB download)
- Agentic: Phi-4-mini (Q4, 2.2GB download)
- Heavy reliance on cloud APIs
- Total Storage: ~5GB

### 📱 **Mobile/Edge** (CPU only)
- Phi-4-mini-flash (Q4, 1.8GB download)
- Gemma-3-4B (Q4, 2.4GB download)
- Primary: Cloud APIs
- Total Storage: ~4GB

---

## Model Selection Logic

```python
def select_model(task_type, context_length, hardware_profile, privacy_required):
    if privacy_required or not internet_available:
        # Local only
        if task_type == "agentic":
            return "phi-4-mini"
        elif task_type == "coding":
            if hardware_profile >= "enthusiast":
                return "qwen3-coder-14b"
            else:
                return "qwen3-coder-8b"
    else:
        # Can use cloud
        if task_type == "agentic":
            return "kimi-k2"
        elif task_type == "complex_reasoning":
            return "deepseek-r1"
        elif context_length > 128000:
            return "gemini-2.5-pro"
```

---

## Implementation Priorities

1. **Phase 1**: Core Local Models
   - Qwen3-Coder (8B auto-download)
   - Phi-4-mini (agentic capabilities)

2. **Phase 2**: Cloud Integration
   - Kimi K2 API
   - DeepSeek R1 API
   - BYO-Key support

3. **Phase 3**: Extended Local Support
   - Additional Qwen3 sizes
   - Gemma 3 series
   - Mistral Devstral

4. **Phase 4**: Advanced Features
   - Multi-model routing
   - Automatic fallbacks
   - Performance optimization

---

## Storage Requirements Summary

| Configuration | Models | Total Storage |
|--------------|--------|---------------|
| Minimal | Qwen3-4B + Phi-4-mini | 5GB |
| Standard | Qwen3-8B + Phi-4 + Gemma-12B | 14GB |
| Enthusiast | Qwen3-14B + Devstral + Multiple | 40GB |
| Complete | All local models | 110GB+ |

---

## Key Differentiators

1. **Privacy First**: Strong local model selection
2. **Agentic Ready**: Multiple models with function calling
3. **Flexible**: Support for 15+ models across local and cloud
4. **Smart Routing**: Automatic model selection based on task
5. **Cost Efficient**: Local models for common tasks, cloud for complex

---

*Last Updated: July 18, 2025* 