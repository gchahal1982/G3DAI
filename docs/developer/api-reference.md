# aura API Reference

Complete API documentation for integrating with aura.

## Base URLs

- **Production:** `https://api.aura.ai/v1`
- **Staging:** `https://staging-api.aura.ai/v1`
- **Self-hosted:** `https://your-domain.com/api/v1`

## Authentication

aura uses API keys for authentication. Include your API key in the `Authorization` header:

```http
Authorization: Bearer cf_api_xxxxxxxxxxxxxxxx
```

### API Key Types

- **Personal API Keys** - For individual developer access
- **Team API Keys** - For team workspace access
- **Service API Keys** - For server-to-server integration
- **Plugin API Keys** - For plugin marketplace integration

## Rate Limits

| Tier | Requests/minute | Tokens/day |
|------|----------------|------------|
| Developer | 60 | 15,000 |
| Team | 300 | Unlimited |
| Enterprise | 1000 | Unlimited |

## AI Completion API

### Complete Code

Generate code completions using local or cloud AI models.

```http
POST /completion
```

**Request Body:**

```json
{
  "prompt": "function fibonacci(n) {\n  if (n <= 1) return n;\n  return",
  "language": "javascript",
  "model": "qwen3-coder-14b",
  "max_tokens": 150,
  "temperature": 0.1,
  "stop": ["\n\n"],
  "context": {
    "file_path": "src/utils.js",
    "cursor_position": 42,
    "project_context": "React TypeScript project"
  },
  "local_only": false
}
```

**Response:**

```json
{
  "id": "comp_xxxxxxxxxxxxxxxx",
  "model": "qwen3-coder-14b",
  "choices": [
    {
      "text": " fibonacci(n - 1) + fibonacci(n - 2);\n}",
      "confidence": 0.94,
      "reasoning": "Standard recursive Fibonacci implementation"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 12,
    "total_tokens": 37
  },
  "latency_ms": 45
}
```

### Chat Completion

Interactive chat with AI assistants.

```http
POST /chat/completions
```

**Request Body:**

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful coding assistant."
    },
    {
      "role": "user",
      "content": "How do I implement a binary search tree in Python?"
    }
  ],
  "model": "kimi-k2",
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 2000
}
```

**Response:**

```json
{
  "id": "chat_xxxxxxxxxxxxxxxx",
  "model": "kimi-k2",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Here's a complete implementation of a binary search tree in Python:\n\n```python\nclass TreeNode:\n    def __init__(self, val=0):\n        self.val = val\n        self.left = None\n        self.right = None\n\nclass BinarySearchTree:\n    def __init__(self):\n        self.root = None\n    \n    def insert(self, val):\n        if not self.root:\n            self.root = TreeNode(val)\n        else:\n            self._insert_recursive(self.root, val)\n    \n    def _insert_recursive(self, node, val):\n        if val < node.val:\n            if node.left is None:\n                node.left = TreeNode(val)\n            else:\n                self._insert_recursive(node.left, val)\n        else:\n            if node.right is None:\n                node.right = TreeNode(val)\n            else:\n                self._insert_recursive(node.right, val)\n```\n\nThis implementation provides:\n- TreeNode class for individual nodes\n- BinarySearchTree class with insert method\n- Recursive insertion maintaining BST property"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 287,
    "total_tokens": 332
  }
}
```

### Streaming Responses

For real-time responses, set `stream: true`:

```javascript
const response = await fetch('/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer cf_api_xxxxxxxxxxxxxxxx',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [...],
    model: 'qwen3-coder-14b',
    stream: true
  })
});

const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = new TextDecoder().decode(value);
  const lines = chunk.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.choices[0].delta.content) {
        console.log(data.choices[0].delta.content);
      }
    }
  }
}
```

## Models API

### List Available Models

```http
GET /models
```

**Response:**

```json
{
  "models": [
    {
      "id": "qwen3-coder-14b",
      "name": "Qwen3-Coder 14B",
      "type": "local",
      "size_gb": 8.1,
      "context_length": 32768,
      "languages": ["javascript", "python", "typescript", "go", "rust"],
      "capabilities": ["completion", "chat", "refactoring"],
      "performance": {
        "humaneval_pass_at_1": 0.92,
        "avg_latency_ms": 45
      },
      "status": "ready"
    },
    {
      "id": "phi-4-mini-instruct",
      "name": "Phi-4 Mini Instruct",
      "type": "local",
      "size_gb": 2.4,
      "context_length": 128000,
      "languages": ["javascript", "python", "typescript", "java", "csharp"],
      "capabilities": ["completion", "chat", "instruction_following"],
      "performance": {
        "humaneval_pass_at_1": 0.628,
        "gsm8k_pass_at_1": 0.886
      },
      "status": "ready"
    },
    {
      "id": "gemma-3-4b-qat",
      "name": "Gemma 3 4B QAT",
      "type": "local",
      "size_gb": 3.2,
      "context_length": 128000,
      "languages": ["javascript", "python", "typescript", "java", "go"],
      "capabilities": ["completion", "chat", "multimodal", "image_understanding"],
      "performance": {
        "humaneval_pass_at_1": 0.36,
        "mmlu_5_shot": 0.596
      },
      "status": "ready"
    },
    {
      "id": "kimi-k2",
      "name": "Kimi K2",
      "type": "cloud",
      "context_length": 200000,
      "capabilities": ["completion", "chat", "agentic", "reasoning"],
      "performance": {
        "swe_bench": 0.658
      },
      "pricing": {
        "input_tokens": 0.60,
        "output_tokens": 2.50
      },
      "status": "available"
    }
  ]
}
```

### Download Model

```http
POST /models/{model_id}/download
```

**Response:**

```json
{
  "download_id": "dl_xxxxxxxxxxxxxxxx",
  "model_id": "qwen3-coder-14b",
  "status": "downloading",
  "progress": 0.15,
  "estimated_completion": "2024-12-16T10:45:00Z",
  "size_gb": 8.1,
  "downloaded_gb": 1.2
}
```

### Model Status

```http
GET /models/{model_id}/status
```

**Response:**

```json
{
  "model_id": "qwen3-coder-14b",
  "status": "ready",
  "memory_usage_gb": 8.1,
  "gpu_utilization": 0.75,
  "last_used": "2024-12-16T09:30:00Z",
  "total_requests": 1247,
  "avg_latency_ms": 42
}
```

## Workspaces API

### List Workspaces

```http
GET /workspaces
```

**Response:**

```json
{
  "workspaces": [
    {
      "id": "ws_xxxxxxxxxxxxxxxx",
      "name": "My React Project",
      "description": "E-commerce frontend application",
      "type": "team",
      "language": "typescript",
      "framework": "react",
      "created_at": "2024-12-01T10:00:00Z",
      "updated_at": "2024-12-16T09:30:00Z",
      "members": 5,
      "status": "active"
    }
  ]
}
```

### Create Workspace

```http
POST /workspaces
```

**Request Body:**

```json
{
  "name": "New Project",
  "description": "AI-powered web application",
  "type": "personal",
  "language": "typescript",
  "framework": "nextjs",
  "template": "nextjs-typescript",
  "settings": {
    "ai_model": "qwen3-coder-14b",
    "auto_completion": true,
    "collaboration": false
  }
}
```

### Get Workspace Details

```http
GET /workspaces/{workspace_id}
```

**Response:**

```json
{
  "id": "ws_xxxxxxxxxxxxxxxx",
  "name": "My React Project",
  "description": "E-commerce frontend application",
  "settings": {
    "ai_model": "qwen3-coder-14b",
    "auto_completion": true,
    "collaboration": true,
    "3d_visualization": true,
    "voice_chat": false
  },
  "members": [
    {
      "user_id": "user_xxxxxxxxxxxxxxxx",
      "email": "john@example.com",
      "role": "owner",
      "permissions": ["read", "write", "admin"]
    }
  ],
  "files": {
    "total": 247,
    "languages": {
      "typescript": 156,
      "javascript": 45,
      "css": 28,
      "html": 18
    }
  },
  "statistics": {
    "lines_of_code": 12450,
    "ai_completions": 1247,
    "ai_acceptance_rate": 0.87
  }
}
```

## Collaboration API

### Start Collaboration Session

```http
POST /workspaces/{workspace_id}/collaboration
```

**Request Body:**

```json
{
  "type": "real_time",
  "features": ["live_editing", "voice_chat", "3d_shared"],
  "permissions": {
    "allow_guests": true,
    "require_approval": false
  }
}
```

**Response:**

```json
{
  "session_id": "collab_xxxxxxxxxxxxxxxx",
  "websocket_url": "wss://collab.aura.ai/ws/collab_xxxxxxxxxxxxxxxx",
  "join_link": "https://aura.ai/join/collab_xxxxxxxxxxxxxxxx",
  "expires_at": "2024-12-16T17:30:00Z"
}
```

### Get Active Collaborators

```http
GET /workspaces/{workspace_id}/collaborators
```

**Response:**

```json
{
  "collaborators": [
    {
      "user_id": "user_xxxxxxxxxxxxxxxx",
      "name": "John Doe",
      "cursor_position": {
        "file": "src/components/App.tsx",
        "line": 42,
        "column": 15
      },
      "status": "active",
      "last_seen": "2024-12-16T09:30:00Z"
    }
  ]
}
```

### Send Collaboration Event

```http
POST /workspaces/{workspace_id}/collaboration/events
```

**Request Body:**

```json
{
  "type": "cursor_move",
  "data": {
    "file": "src/components/App.tsx",
    "line": 42,
    "column": 15
  }
}
```

## 3D Visualization API

### Generate 3D Scene

```http
POST /workspaces/{workspace_id}/3d/generate
```

**Request Body:**

```json
{
  "files": ["src/", "components/"],
  "options": {
    "complexity_mapping": true,
    "dependency_visualization": true,
    "git_history": false,
    "performance_optimization": "auto"
  }
}
```

**Response:**

```json
{
  "scene_id": "scene_xxxxxxxxxxxxxxxx",
  "status": "generating",
  "estimated_completion": "2024-12-16T09:35:00Z",
  "elements": {
    "files": 247,
    "dependencies": 89,
    "complexity_nodes": 156
  }
}
```

### Get 3D Scene Data

```http
GET /workspaces/{workspace_id}/3d/scenes/{scene_id}
```

**Response:**

```json
{
  "scene_id": "scene_xxxxxxxxxxxxxxxx",
  "status": "ready",
  "data": {
    "nodes": [
      {
        "id": "file_src_app_tsx",
        "type": "file",
        "name": "App.tsx",
        "position": [0, 0, 0],
        "size": [10, 15, 8],
        "complexity": 0.75,
        "metadata": {
          "lines_of_code": 150,
          "functions": 8,
          "last_modified": "2024-12-16T09:00:00Z"
        }
      }
    ],
    "edges": [
      {
        "from": "file_src_app_tsx",
        "to": "file_src_components_header_tsx",
        "type": "import",
        "weight": 0.8
      }
    ]
  },
  "metadata": {
    "total_nodes": 247,
    "total_edges": 456,
    "scene_bounds": {
      "x": [-100, 100],
      "y": [-50, 200],
      "z": [-80, 80]
    }
  }
}
```

## Plugin API

### Plugin Manifest

Every plugin must include a `manifest.json`:

```json
{
  "id": "my-awesome-plugin",
  "name": "My Awesome Plugin",
  "version": "1.0.0",
  "description": "Enhances aura with awesome features",
  "author": "John Doe",
  "license": "MIT",
  "main": "dist/index.js",
  "permissions": [
    "workspace:read",
    "workspace:write",
    "ai:completion",
    "ui:panel"
  ],
  "activation_events": [
    "onLanguage:javascript",
    "onCommand:myPlugin.activate"
  ],
  "contributes": {
    "commands": [
      {
        "command": "myPlugin.doSomething",
        "title": "Do Something Awesome"
      }
    ],
    "keybindings": [
      {
        "command": "myPlugin.doSomething",
        "key": "ctrl+shift+a"
      }
    ]
  }
}
```

### Plugin API Interface

```typescript
interface auraAPI {
  // Workspace operations
  workspace: {
    getFiles(): Promise<File[]>;
    openFile(path: string): Promise<void>;
    getCurrentFile(): File | null;
    onFileChange(callback: (file: File) => void): void;
  };

  // AI integration
  ai: {
    complete(prompt: string, options?: CompletionOptions): Promise<string>;
    chat(messages: Message[]): Promise<string>;
    explain(code: string): Promise<string>;
    refactor(code: string, instructions: string): Promise<string>;
  };

  // UI extensions
  ui: {
    createPanel(options: PanelOptions): Panel;
    showNotification(message: string, type: 'info' | 'warning' | 'error'): void;
    registerCommand(id: string, handler: () => void): void;
  };

  // 3D visualization
  visualization: {
    addNode(node: Node3D): void;
    removeNode(id: string): void;
    onNodeClick(callback: (node: Node3D) => void): void;
  };

  // Collaboration
  collaboration: {
    broadcast(event: CollabEvent): void;
    onEvent(callback: (event: CollabEvent) => void): void;
    getCursors(): Cursor[];
  };
}
```

### Plugin Example

```typescript
import { auraAPI } from '@aura/plugin-api';

export default class MyPlugin {
  private api: auraAPI;

  activate(api: auraAPI) {
    this.api = api;
    
    // Register commands
    api.ui.registerCommand('myPlugin.generateTests', this.generateTests);
    
    // Listen for file changes
    api.workspace.onFileChange(this.onFileChange);
    
    // Add 3D visualization
    api.visualization.addNode({
      id: 'my-custom-node',
      position: [0, 50, 0],
      type: 'custom',
      data: { label: 'My Plugin' }
    });
  }

  private generateTests = async () => {
    const currentFile = this.api.workspace.getCurrentFile();
    if (!currentFile) return;

    const tests = await this.api.ai.complete(
      `Generate unit tests for this code:\n\n${currentFile.content}`,
      { model: 'qwen3-coder-14b', temperature: 0.1 }
    );

    this.api.ui.showNotification('Tests generated!', 'info');
  };

  private onFileChange = (file: File) => {
    console.log(`File changed: ${file.path}`);
  };

  deactivate() {
    // Cleanup
  }
}
```

### Register Plugin

```http
POST /plugins/register
```

**Request Body:**

```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "manifest_url": "https://github.com/user/plugin/raw/main/manifest.json",
  "repository": "https://github.com/user/plugin",
  "tags": ["productivity", "testing", "ai"],
  "category": "development-tools"
}
```

## Analytics API

### Get Usage Analytics

```http
GET /analytics/usage
```

**Query Parameters:**
- `start_date` - Start date (ISO 8601)
- `end_date` - End date (ISO 8601)
- `workspace_id` - Optional workspace filter
- `granularity` - `hour`, `day`, `week`, `month`

**Response:**

```json
{
  "period": {
    "start": "2024-12-01T00:00:00Z",
    "end": "2024-12-16T00:00:00Z"
  },
  "metrics": {
    "ai_completions": {
      "total": 1247,
      "accepted": 1084,
      "acceptance_rate": 0.87
    },
    "models_used": {
      "qwen3-coder-14b": 856,
      "phi-4-mini-instruct": 234,
      "kimi-k2": 157
    },
    "languages": {
      "typescript": 45.2,
      "javascript": 23.1,
      "python": 18.7,
      "go": 8.3,
      "rust": 4.7
    },
    "productivity": {
      "lines_per_hour": 127,
      "ai_assistance_percentage": 34.2,
      "time_saved_hours": 12.5
    }
  },
  "time_series": [
    {
      "timestamp": "2024-12-01T00:00:00Z",
      "completions": 89,
      "accepted": 76
    }
  ]
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "The request is missing required parameter 'model'",
    "details": {
      "parameter": "model",
      "expected_type": "string"
    },
    "request_id": "req_xxxxxxxxxxxxxxxx"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `invalid_request` | Malformed request |
| `authentication_failed` | Invalid or missing API key |
| `insufficient_quota` | Rate limit or token quota exceeded |
| `model_not_available` | Requested model not downloaded or available |
| `workspace_not_found` | Workspace does not exist |
| `permission_denied` | Insufficient permissions |
| `internal_error` | Server error |

## SDKs

### Node.js SDK

```bash
npm install @aura/sdk
```

```javascript
import { aura } from '@aura/sdk';

const cf = new aura('cf_api_xxxxxxxxxxxxxxxx');

// Generate completion
const completion = await cf.complete({
  prompt: 'function calculateSum(',
  model: 'qwen3-coder-14b',
  language: 'javascript'
});

// Chat with AI
const response = await cf.chat([
  { role: 'user', content: 'Explain async/await in JavaScript' }
]);

// Manage workspaces
const workspace = await cf.workspaces.create({
  name: 'My Project',
  language: 'typescript'
});
```

### Python SDK

```bash
pip install aura-sdk
```

```python
from aura import aura

cf = aura(api_key='cf_api_xxxxxxxxxxxxxxxx')

# Generate completion
completion = cf.complete(
    prompt='def fibonacci(n):',
    model='qwen3-coder-14b',
    language='python'
)

# Chat with AI
response = cf.chat([
    {'role': 'user', 'content': 'How do I implement a REST API in Python?'}
])

# Manage workspaces
workspace = cf.workspaces.create(
    name='Python Project',
    language='python',
    framework='fastapi'
)
```

## Webhooks

aura can send webhooks for various events:

### Configure Webhooks

```http
POST /webhooks
```

**Request Body:**

```json
{
  "url": "https://your-app.com/webhooks/aura",
  "events": [
    "completion.generated",
    "workspace.created",
    "collaboration.started",
    "model.downloaded"
  ],
  "secret": "webhook_secret_key"
}
```

### Webhook Events

#### Completion Generated

```json
{
  "event": "completion.generated",
  "timestamp": "2024-12-16T09:30:00Z",
  "data": {
    "completion_id": "comp_xxxxxxxxxxxxxxxx",
    "workspace_id": "ws_xxxxxxxxxxxxxxxx",
    "model": "qwen3-coder-14b",
    "accepted": true,
    "language": "typescript"
  }
}
```

#### Workspace Created

```json
{
  "event": "workspace.created",
  "timestamp": "2024-12-16T09:30:00Z",
  "data": {
    "workspace_id": "ws_xxxxxxxxxxxxxxxx",
    "name": "New Project",
    "language": "javascript",
    "created_by": "user_xxxxxxxxxxxxxxxx"
  }
}
```

---

For more examples and detailed guides, visit our [Developer Documentation](https://docs.aura.ai). 