# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Root Level (Monorepo)
```bash
# Type checking
npm run type-check          # Check types in current workspace
npm run type-check:all      # Check all workspaces with tsc --build
npm run type-check:platforms # Check all AI platforms

# Building
npm run build:all           # Build all workspaces

# Testing and Linting
npm run test:all            # Run tests across all workspaces
npm run lint:all            # Run lint across all workspaces

# Development
npm run dev:annotateai      # Start annotateai platform
npm run dev:medsight        # Start medsight-pro platform
npm run dev:bioai           # Start bioai platform
npm run dev:neuroai         # Start neuroai platform

# Maintenance
npm run clean              # Clean all node_modules
npm run setup             # Full setup: install deps + type check
```

### AI Platform Level
```bash
# In any ai-platforms/[platform]/ directory
npm run dev               # Start Next.js dev server (port varies by platform)
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # ESLint
npm run type-check        # TypeScript type checking
npm run test              # Jest tests
npm run test:watch        # Jest in watch mode
npm run test:coverage     # Jest with coverage
```

## Architecture Overview

### Repository Structure
- **ai-platforms/**: 24+ specialized AI platforms (annotateai, medsight-pro, aura, etc.)
- **shared/**: Common UI components, auth services, API gateway
- **backend/**: Core services (auth, database, billing, monitoring)
- **src/**: Low-level utilities and shared services
- **deployment/**: Docker, Kubernetes, and deployment configurations

### Technology Stack
- **Frontend**: React 18, Next.js 14, TypeScript, Three.js, TensorFlow.js
- **Backend**: Node.js 18, Express.js, MongoDB, Redis, Elasticsearch
- **Infrastructure**: Docker, Kubernetes, AWS S3, Stripe integration
- **UI**: Tailwind CSS with glassmorphism design system

### Key Architectural Patterns

#### G3D Integration Layer
Each AI platform includes sophisticated 3D processing capabilities:
- **Scene Management**: Advanced 3D scene graph with frustum culling and LOD
- **Geometry Processing**: Complex mesh processing and optimization
- **Performance Profiling**: CPU/GPU/memory tracking and bottleneck detection
- **Compute Shaders**: WebGL2/WebGPU compute pipeline management

#### Service Structure
Each AI platform follows this consistent structure:
```
ai-platforms/[service]/src/
├── ai/                    # AI-specific logic
├── components/            # React components
├── g3d-integration/       # G3D layer integration
├── g3d-performance/       # Performance monitoring
├── g3d-3d/               # 3D processing
├── enterprise/           # Enterprise features
└── workbench/           # User interface
```

#### Stub-Based Development
Each platform includes `g3d-stubs/` for consistent interfaces:
- `G3DComputeShaders.ts` - Standardized compute shader interfaces
- `G3DModelRunner.ts` - Common AI model runner abstractions
- `G3DSceneManager.ts` - Unified scene management APIs

### Workspace Configuration
- **NPM workspaces** for dependency management
- **TypeScript path mapping** for cross-service imports:
  ```json
  {
    "paths": {
      "@shared/*": ["../../shared/*"],
      "@shared/ui/*": ["../../shared/ui/src/*"],
      "@/*": ["./src/*"]
    }
  }
  ```

### Service Discovery & API Gateway
- **Centralized API Gateway** at `/backend/api-gateway/src/server.ts`
- **Role-based access control** with JWT authentication
- **Service-specific rate limiting** based on subscription plans
- **Health monitoring** with circuit breaker patterns

### Development Workflow
1. **Start with shared components** - Most UI elements are in `/shared/ui/`
2. **Use G3D integration layer** - Don't reinvent 3D processing
3. **Follow service template** - Each service follows the same internal structure
4. **Leverage stubs during development** - Use g3d-stubs for rapid prototyping
5. **Test with local API gateway** - All services route through the gateway

### Key File Locations
- **UI Components**: `/shared/ui/src/components/`
- **API Gateway**: `/backend/api-gateway/src/server.ts`
- **Service Templates**: `/ai-platforms/[service]/src/`
- **Deployment Config**: `/deployment/kubernetes/g3d-services.yaml`
- **Shared Types**: `/shared/*/types/`

### Performance Considerations
- **G3D Performance Layer** provides real-time profiling with CPU/GPU/memory tracking
- **Frustum culling** for 3D scene optimization
- **LOD management** for complex geometries
- **Compute shader optimization** for parallel processing

### Enterprise Features
- **JWT with refresh tokens** and Redis blacklisting
- **Role-based authorization** with fine-grained scopes
- **Request tracing** with unique request IDs
- **Horizontal pod autoscaling** in Kubernetes
- **GPU resource allocation** for AI-intensive services

## Common Development Tasks

### Adding a New AI Platform
1. Create directory in `/ai-platforms/[platform-name]/`
2. Follow the standard structure with `src/`, `package.json`, etc.
3. Use shared components from `/shared/ui/`
4. Integrate with backend services in `/backend/`
5. Add g3d-stubs for consistent interfaces

### Working with 3D Components
- Use existing G3D integration layer in `g3d-integration/`
- Leverage performance profiling in `g3d-performance/`
- Follow patterns in `g3d-3d/` for 3D processing
- Check `g3d-stubs/` for interface definitions

### Debugging TypeScript Issues
- Run `npm run type-check` in specific workspace
- Use `npm run type-check:all` for comprehensive check
- Check TypeScript path mapping in `tsconfig.json`
- Verify workspace dependencies are correctly installed