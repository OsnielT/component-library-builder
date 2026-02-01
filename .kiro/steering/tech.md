# Technology Stack

## Core Technologies

- **Frontend**: React 18+ with TypeScript 5.3+
- **Editor**: Monaco Editor (VS Code in browser) or CodeSandbox Sandpack
- **Backend**: Node.js 20+ with Express or Next.js API routes
- **Database**: PostgreSQL or MongoDB for user projects
- **File System**: In-memory FS (memfs) or WebContainer API
- **State Management**: Zustand or Redux Toolkit

## Build System

- **Frontend Build**: Vite for fast HMR and bundling
- **Backend Build**: esbuild or tsc for API compilation
- **Monorepo**: Turborepo or Nx for managing frontend/backend

## Key Dependencies

### Frontend
- **Editor**: `@monaco-editor/react` or `@codesandbox/sandpack-react`
- **UI**: Tailwind CSS or Chakra UI for component library
- **Validation**: Zod for runtime type validation
- **Code Generation**: Handlebars for templates
- **Preview**: React iframe or Sandpack preview

### Backend
- **API**: Express or Next.js API routes
- **File Operations**: `memfs` for in-memory file system
- **Code Execution**: WebContainer API or isolated sandboxes
- **Storage**: S3 or similar for project exports

## Code Quality Tools

- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier (single quotes, 100 char width, 2 space indent)
- **Type Checking**: TypeScript strict mode with all checks enabled
- **Testing**: Vitest for unit tests, Playwright for E2E

## Common Commands

```bash
# Install dependencies
npm install

# Start development server (frontend + backend)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Architecture Options

### Option 1: Monaco Editor + Backend API
- Monaco Editor for code editing
- Backend API handles file operations and code generation
- Preview in iframe with live reload

### Option 2: Sandpack (Recommended)
- CodeSandbox Sandpack for full in-browser environment
- No backend needed for code execution
- Built-in preview and bundling
- File system runs entirely in browser

### Option 3: WebContainer API
- StackBlitz WebContainer for Node.js in browser
- Full npm support in browser
- Can run build tools and dev servers client-side
