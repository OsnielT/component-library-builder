# Component Library Builder

A VS Code extension for building and managing React component libraries with design tokens.

## Features

- Design token management following W3C Design Tokens Format
- Component generation with TypeScript, tests, and Storybook stories
- Automatic change propagation
- Semantic versioning and changelog generation
- One-command npm publishing

## Development

### Prerequisites

- Node.js 18.x or later
- VS Code 1.85.0 or later

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Watch Mode

```bash
npm run watch
```

## Architecture

The extension follows a layered architecture:

- **Presentation Layer**: VS Code commands, webviews, tree views
- **Application Layer**: Business logic and service coordination
- **Domain Layer**: Core models and validation rules
- **Infrastructure Layer**: File system access and external integrations

## License

MIT
