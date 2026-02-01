# Component Library Builder

A web application that provides an in-browser development environment for creating React component libraries with design tokens.

## Features

- 🎨 **Visual Design Token Editor** - Manage tokens following W3C Design Tokens Format
- ⚡ **Live Code Editor** - Powered by Sandpack (CodeSandbox)
- 👀 **Real-time Preview** - See changes instantly
- 📦 **Component Generation** - Generate React components from specs
- 🔄 **Auto CSS Generation** - Tokens automatically convert to CSS variables
- 💾 **Export** - Download your library or push to GitHub

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18
- **Editor**: Sandpack by CodeSandbox
- **UI**: Tailwind CSS
- **State**: Zustand
- **Validation**: Zod
- **Testing**: Vitest + Playwright
- **Code Generation**: Handlebars

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development

```bash
# Run development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

## Project Structure

```
component-library-builder/
├── app/                    # Next.js app directory
│   ├── editor/            # Editor page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── editor/           # Editor components
│   └── tokens/           # Token management UI
├── lib/                  # Core business logic
│   ├── core/            # Domain services
│   │   ├── token-validator.ts
│   │   ├── token-resolver.ts
│   │   └── css-generator.ts
│   └── store/           # Zustand stores
│       ├── use-editor-store.ts
│       └── use-token-store.ts
├── types/               # TypeScript types
│   ├── token.ts
│   ├── component.ts
│   └── project.ts
└── .kiro/              # Kiro steering docs
    └── steering/
```

## Architecture

The application follows a clean architecture with clear separation of concerns:

- **UI Layer** (`components/`, `app/`) - React components and Next.js pages
- **State Layer** (`lib/store/`) - Zustand stores for state management
- **Domain Layer** (`lib/core/`) - Business logic and services
- **Types Layer** (`types/`) - TypeScript type definitions

## Design Tokens

Tokens follow the [W3C Design Tokens Format](https://design-tokens.github.io/community-group/format/):

```typescript
{
  $type: 'color',
  $value: '#ff0000',
  $description: 'Primary brand color',
  $extensions: {
    'com.component-builder': {
      id: 'color.primary',
      cssVariable: '--color-primary',
      category: 'primitive'
    }
  }
}
```

### Token Categories

- **Primitive**: Base tokens with direct values (e.g., `color.blue.500`)
- **Semantic**: Contextual tokens referencing primitives (e.g., `color.primary`)
- **Component**: Component-specific tokens (e.g., `button.background`)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Sandpack Documentation](https://sandpack.codesandbox.io/)
- [W3C Design Tokens Format](https://design-tokens.github.io/community-group/format/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
