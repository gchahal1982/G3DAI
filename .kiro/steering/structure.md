# Project Structure & Organization

## Repository Architecture

This is a **monorepo** organized using npm workspaces with a clear separation of concerns across different layers.

## Top-Level Structure

```
├── ai-platforms/          # Individual AI platform applications (27+ platforms)
├── shared/               # Shared components and utilities
├── infrastructure/       # Backend services and APIs
├── core/                # Core utilities and configuration
├── deployment/          # Deployment configurations and scripts
├── docs/                # Documentation and guides
└── src/                 # Root-level application code
```

## AI Platforms Directory (`ai-platforms/`)

Each platform follows a standardized structure:

```
ai-platforms/[platform-name]/
├── README.md            # Platform-specific documentation
├── package.json         # Platform dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── src/
│   ├── app/           # Next.js 14 app router pages
│   ├── components/    # React components
│   ├── services/      # API services and business logic
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── styles/        # CSS and styling
├── public/            # Static assets
├── docs/              # Platform documentation
└── tests/             # Test files
```

### Platform Tiers
- **Tier 1** (Production): `annotateai/`, `medsight-pro/`, `bioai/`
- **Tier 2** (MVP): `neuroai/`, `mesh3d/`, `renderai/`, etc.
- **Tier 3-4** (Prototype/Planned): `automl/`, `aura/`, etc.

## Shared Infrastructure (`shared/`)

```
shared/
├── components/        # Reusable UI components
│   ├── ui/           # Base UI components
│   ├── forms/        # Form components
│   ├── charts/       # Data visualization
│   └── layout/       # Layout components
├── auth/             # Authentication utilities
├── api-client/       # API client configurations
├── types/            # Shared TypeScript types
├── utils/            # Shared utility functions
└── services/         # Shared business logic
```

## Infrastructure (`infrastructure/`)

Backend services organized by domain:

```
infrastructure/
├── api-gateway/      # API gateway and routing
├── auth-service/     # Authentication and authorization
├── database/         # Database models and migrations
├── engines/          # Core processing engines
├── monitoring/       # Monitoring and observability
└── billing-service/  # Billing and subscription management
```

## Core Utilities (`core/`)

```
core/
├── Config.ts         # Configuration management
├── Logger.ts         # Logging utilities
├── Metrics.ts        # Performance metrics
├── debug/           # Debug and development tools
├── memory/          # Memory management utilities
└── utils/           # Core utility functions
```

## Deployment (`deployment/`)

```
deployment/
├── docker/          # Docker configurations
├── kubernetes/      # Kubernetes manifests
├── monitoring/      # Monitoring configurations
└── scripts/         # Deployment scripts
```

## Naming Conventions

### Files and Directories
- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Directories**: kebab-case (`ai-platforms/`, `user-management/`)

### Code Conventions
- **Interfaces**: PascalCase with `I` prefix (`IUserData`)
- **Types**: PascalCase (`UserRole`, `ApiResponse`)
- **Enums**: PascalCase (`UserStatus`, `PlatformTier`)
- **Functions**: camelCase (`getUserProfile`, `validateInput`)

## Path Mapping

Configured in `tsconfig.json` for clean imports:

```typescript
// Instead of: ../../../shared/components/ui/Button
import { Button } from '@shared/ui/Button';

// Instead of: ../../infrastructure/auth/AuthService
import { AuthService } from '@infrastructure/auth/AuthService';

// Instead of: ../core/Config
import { Config } from '@core/Config';
```

## File Organization Patterns

### Component Structure
```typescript
// ComponentName/
├── index.ts          # Export barrel
├── ComponentName.tsx # Main component
├── ComponentName.types.ts # Type definitions
├── ComponentName.styles.ts # Styled components
└── ComponentName.test.tsx # Tests
```

### Service Structure
```typescript
// ServiceName/
├── index.ts          # Export barrel
├── ServiceName.ts    # Main service class
├── ServiceName.types.ts # Type definitions
└── ServiceName.test.ts # Tests
```

## Import Organization

Follow this order for imports:

1. React and Next.js imports
2. Third-party libraries
3. Internal shared imports (`@shared/*`)
4. Internal infrastructure imports (`@infrastructure/*`)
5. Internal core imports (`@core/*`)
6. Relative imports (`./`, `../`)

```typescript
import React from 'react';
import { NextPage } from 'next';
import { Button } from '@radix-ui/react-button';

import { AuthService } from '@shared/auth/AuthService';
import { ApiGateway } from '@infrastructure/api-gateway';
import { Config } from '@core/Config';

import { LocalComponent } from './LocalComponent';
```

## Documentation Standards

- **README.md**: Required for each platform and major directory
- **API Documentation**: OpenAPI/Swagger specifications
- **Code Comments**: JSDoc for all public functions and classes
- **Architecture Docs**: High-level system design documentation

## Security Considerations

- **Medical Data**: HIPAA compliance patterns in medical platforms
- **Authentication**: Centralized auth service with JWT tokens
- **Encryption**: AES-256 for data at rest, TLS 1.3 for transit
- **Audit Logging**: Comprehensive audit trails for compliance