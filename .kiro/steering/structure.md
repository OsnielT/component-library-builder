# Project Structure

## Web Application Architecture

The application follows a modern full-stack architecture with clear separation between frontend, backend, and shared code.

### Frontend (`apps/web/`)
- React application with Monaco Editor or Sandpack
- Visual token editor and component builder UI
- Live preview and testing interface
- User authentication and project management

### Backend (`apps/api/`)
- REST or GraphQL API for project operations
- File system operations and code generation
- User authentication and authorization
- Project storage and retrieval

### Shared (`packages/`)
- `@component-builder/core` - Domain models and business logic
- `@component-builder/templates` - Code generation templates
- `@component-builder/validation` - Validation schemas and rules

## Directory Structure

```
component-library-builder/
├── apps/
│   ├── web/                    # Frontend React app
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   ├── features/       # Feature modules
│   │   │   │   ├── editor/     # Code editor integration
│   │   │   │   ├── tokens/     # Token management UI
│   │   │   │   ├── components/ # Component builder UI
│   │   │   │   └── preview/    # Live preview
│   │   │   ├── hooks/          # React hooks
│   │   │   ├── store/          # State management
│   │   │   └── lib/            # Utilities
│   │   └── package.json
│   └── api/                    # Backend API
│       ├── src/
│       │   ├── routes/         # API routes
│       │   ├── services/       # Business logic
│       │   ├── middleware/     # Express middleware
│       │   └── db/             # Database models
│       └── package.json
├── packages/
│   ├── core/                   # Shared domain logic
│   │   ├── src/
│   │   │   ├── domain/         # Domain models
│   │   │   │   ├── models/     # DesignToken, ComponentSpec
│   │   │   │   └── validation/ # ValidationResult
│   │   │   ├── services/       # Business services
│   │   │   │   ├── TokenValidator.ts
│   │   │   │   ├── TokenResolver.ts
│   │   │   │   ├── CSSGenerator.ts
│   │   │   │   └── ComponentGenerator.ts
│   │   │   └── utils/          # Shared utilities
│   │   └── package.json
│   ├── templates/              # Handlebars templates
│   │   ├── Component.tsx.hbs
│   │   ├── Component.types.ts.hbs
│   │   ├── Component.module.css.hbs
│   │   └── package.json
│   └── validation/             # Zod schemas
│       ├── src/
│       │   ├── token.schema.ts
│       │   └── component.schema.ts
│       └── package.json
├── package.json                # Root package.json
├── turbo.json                  # Turborepo config
└── tsconfig.json               # Root TypeScript config
```

## Layered Architecture (in @component-builder/core)

### Domain Layer
- Core business models and types
- No dependencies on other layers
- Pure TypeScript interfaces and types
- Examples: `DesignToken`, `ComponentSpec`, `ValidationResult`

### Service Layer
- Business logic and orchestration
- Token validation, resolution, CSS generation
- Component generation and file operations
- Examples: `TokenValidator`, `ComponentGenerator`

### API Layer (in apps/api)
- REST/GraphQL endpoints
- Request validation and error handling
- Authentication and authorization
- File storage and retrieval

### UI Layer (in apps/web)
- React components and hooks
- State management (Zustand/Redux)
- Editor integration (Monaco/Sandpack)
- Live preview and testing

## File Organization

- Monorepo managed by Turborepo or Nx
- Shared packages in `packages/`
- Apps in `apps/`
- Test files co-located: `*.test.ts` or `*.test.tsx`
- One component/service per file
- Barrel exports via `index.ts`

## Dependency Rules

- Frontend depends on `@component-builder/core`
- Backend depends on `@component-builder/core`
- Core has no dependencies on apps
- Packages can depend on other packages
- No circular dependencies between packages

## Build Output

- Frontend: Static files in `apps/web/dist`
- Backend: Compiled JS in `apps/api/dist`
- Packages: Compiled to `dist/` with type declarations
