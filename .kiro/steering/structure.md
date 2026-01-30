# Project Structure

## Layered Architecture

The codebase follows a strict layered architecture with clear separation of concerns:

### Domain Layer (`src/domain/`)
- Core business models and types
- No dependencies on other layers
- Pure TypeScript interfaces and types
- Examples: `DesignToken`, `ComponentSpec`, `ValidationResult`

### Application Layer (`src/application/`)
- Service interfaces and contracts
- Business logic orchestration
- Depends only on domain layer
- Examples: `ITokenRepository`, `ITokenValidator`

### Infrastructure Layer (`src/infrastructure/`)
- External integrations (file system, npm, Git)
- Implementation of application interfaces
- Platform-specific code
- Examples: `FileSystem`

### Presentation Layer (`src/presentation/`)
- VS Code UI components
- Commands, webviews, tree views
- User interaction handling
- Entry point: `src/extension.ts`

### Webview Layer (`src/webview/`)
- React components for VS Code webviews
- Built separately with Rollup
- Uses `tsconfig.webview.json`

## Directory Conventions

```
src/
├── domain/
│   ├── models/          # Domain entities
│   └── validation/      # Validation types
├── application/
│   └── interfaces/      # Service contracts
├── infrastructure/
│   └── filesystem/      # External adapters
├── presentation/
│   └── commands/        # VS Code commands
├── webview/             # React UI components
└── extension.ts         # Extension entry point
```

## File Organization

- Each layer exports through `index.ts` barrel files
- Test files co-located with source: `*.test.ts`
- One class/interface per file
- File names match exported type names

## Dependency Rules

- Domain layer has no dependencies
- Application layer depends only on domain
- Infrastructure implements application interfaces
- Presentation depends on application and infrastructure
- Never import from a higher layer

## Build Output

- `dist/extension.js` - Bundled extension code
- `dist/webview.js` - Bundled webview code
- Source maps generated for debugging
