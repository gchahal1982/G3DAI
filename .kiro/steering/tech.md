# Technology Stack & Build System

## Core Technologies

### Frontend Stack
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS with custom medical/enterprise themes
- **UI Components**: Radix UI, Headless UI, Lucide React icons
- **State Management**: Zustand, React Hook Form, TanStack Query
- **Animation**: Framer Motion
- **Build Tool**: Next.js built-in webpack

### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js with FastAPI (Python) for AI services
- **Database**: PostgreSQL with Redis caching
- **Authentication**: JWT with multi-factor authentication
- **Real-time**: Socket.io for WebSocket connections
- **Medical**: DICOM processing, HIPAA compliance tools

### Infrastructure
- **Containerization**: Docker with Docker Compose
- **Orchestration**: Kubernetes ready
- **Monitoring**: Prometheus, Grafana
- **Security**: AES-256 encryption, TLS 1.3
- **Cloud**: AWS SDK integration

## Build System

### Workspace Structure
This is a **npm workspaces** monorepo with the following structure:
```json
"workspaces": [
  "ai-platforms/*",
  "shared/*", 
  "infrastructure/*"
]
```

### Common Commands

#### Development
```bash
# Start specific platform
npm run dev:annotateai    # Port 3021
npm run dev:medsight      # Port 3032

# Type checking
npm run type-check        # Root level only
npm run type-check:all    # All workspaces
npm run type-check:platforms  # All platforms

# Build all workspaces
npm run build:all
```

#### Platform-Specific Commands
```bash
# Navigate to platform
cd ai-platforms/[platform-name]

# Standard Next.js commands
npm run dev     # Development server
npm run build   # Production build
npm run start   # Production server
npm run lint    # ESLint checking
```

#### Infrastructure Commands
```bash
# Backend services
cd infrastructure
npm run dev     # Development with ts-node-dev
npm run build   # TypeScript compilation
npm run start   # Production server

# Docker operations
docker compose up -d              # Start all services
docker compose logs -f [service]  # View logs
docker compose restart [service]  # Restart service
```

#### Testing
```bash
npm run test:all          # All workspace tests
npm run test:coverage     # Coverage reports
npm run test:e2e         # End-to-end tests
npm run test:security    # Security validation
npm run test:hipaa       # Medical compliance tests
```

## Configuration Standards

### TypeScript Configuration
- **Target**: ES2020
- **Strict mode**: Enabled for new code
- **Path mapping**: Extensive use of `@shared/*`, `@infrastructure/*`, `@core/*`
- **Incremental compilation**: Enabled for performance

### Code Quality
- **ESLint**: TypeScript-aware configuration
- **Prettier**: Consistent formatting
- **Husky**: Pre-commit hooks
- **Lint-staged**: Staged file linting

### Environment Management
- **Development**: Hot reloading, debug logging
- **Production**: Optimized builds, security hardening
- **Medical**: HIPAA compliance mode, audit logging

## Dependencies Management

### Shared Dependencies
Core dependencies are managed at the root level and shared across workspaces where possible.

### Platform-Specific Dependencies
Each AI platform maintains its own `package.json` for platform-specific requirements.

### Version Consistency
- Node.js: >=18.0.0
- npm: >=8.0.0
- TypeScript: ^5.8.3
- React: ^18.2.0
- Next.js: ^14.0.0