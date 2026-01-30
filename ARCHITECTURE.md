# Project Architecture

## Directory Structure

```
component-library-builder/
├── src/
│   ├── domain/                    # Domain Layer
│   │   ├── models/               # Core domain models
│   │   │   ├── DesignToken.ts
│   │   │   ├── ComponentSpec.ts
│   │   │   └── index.ts
│   │   └── validation/           # Validation types
│   │       ├── ValidationResult.ts
│   │       └── index.ts
│   ├── application/              # Application Layer
│   │   └── interfaces/           # Service interfaces
│   │       ├── ITokenRepository.ts
│   │       ├── ITokenValidator.ts
│   │       └── index.ts
│   ├── infrastructure/           # Infrastructure Layer
│   │   └── filesystem/           # File system utilities
│   │       ├── FileSystem.ts
│   │       └── index.ts
│   ├── presentation/             # Presentation Layer
│   │   └── commands/             # VS Code commands
│   │       └── index.ts
│   ├── webview/                  # React webviews
│   │   └── index.tsx
│   └── extension.ts              # Extension entry point
├── dist/                         # Build output
├── .kiro/                        # Kiro specs
│   └── specs/
│       └── component-library-builder/
├── package.json
├── tsconfig.json
├── tsconfig.webview.json
├── vitest.config.ts
├── esbuild.js
├── rollup.config.mjs
├── .eslintrc.json
├── .prettierrc.json
└── README.md
```

## Layered Architecture

### Domain Layer (`src/domain/`)
- Core business models and types
- No dependencies on other layers
- Pure TypeScript types and interfaces

### Application Layer (`src/application/`)
- Service interfaces and contracts
- Business logic orchestration
- Depends only on domain layer

### Infrastructure Layer (`src/infrastructure/`)
- External integrations (file system, npm, Git)
- Implementation of application interfaces
- Platform-specific code

### Presentation Layer (`src/presentation/`)
- VS Code UI components
- Commands, webviews, tree views
- User interaction handling

## Build System

- **Extension**: Built with esbuild for fast compilation
- **Webviews**: Built with Rollup for React components
- **Tests**: Run with Vitest for fast unit and property-based testing

## Testing Strategy

- Unit tests for domain models and services
- Property-based tests using fast-check
- Integration tests for end-to-end workflows
- Test files co-located with source files (*.test.ts)
