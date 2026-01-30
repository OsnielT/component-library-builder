# Technology Stack

## Core Technologies

- **Runtime**: Node.js 18.x or later
- **Platform**: VS Code Extension API 1.85.0+
- **Language**: TypeScript 5.3+ with strict mode enabled
- **Module System**: Node16 (ESM with CommonJS interop)

## Build System

- **Extension Build**: esbuild (fast bundling, CommonJS output)
- **Webview Build**: Rollup (React components, IIFE output)
- **Watch Mode**: esbuild with `--watch` flag

## Key Dependencies

- **Validation**: Zod for runtime type validation
- **Templating**: Handlebars for code generation
- **Testing**: Vitest with fast-check for property-based testing

## Code Quality Tools

- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier (single quotes, 100 char width, 2 space indent)
- **Type Checking**: TypeScript strict mode with all checks enabled

## Common Commands

```bash
# Install dependencies
npm install

# Build extension and webviews
npm run build

# Build only extension
npm run build:extension

# Build only webviews
npm run build:webview

# Watch mode for development
npm run watch

# Run tests (single run)
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## TypeScript Configuration

- Target: ES2022
- Strict mode enabled
- No unused locals/parameters
- No implicit returns
- Source maps and declarations generated
- Separate config for webviews (tsconfig.webview.json)
