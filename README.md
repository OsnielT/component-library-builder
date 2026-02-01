# Component Library Builder

A web-based IDE for creating React component libraries with design tokens. Build, preview, and export production-ready components with an integrated code editor and live preview.

## ✨ Features

- 🎨 **Visual Design Token Editor** - Manage design tokens following W3C Design Tokens Format
- 💻 **Monaco Code Editor** - Full VS Code editing experience in the browser
- 👀 **Live Preview** - See component changes in real-time
- 📦 **Component Generator** - Create React components from visual specs
- 🎯 **Token-First Styling** - CSS variables automatically generated from design tokens
- 🔄 **Auto-Save** - Never lose your work with automatic saving
- 📐 **Resizable Panels** - Customize your workspace layout
- 🚀 **Export Ready** - Download complete component library

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Editor**: Monaco Editor (VS Code in browser)
- **UI**: Tailwind CSS + Custom Components
- **State**: Zustand
- **Validation**: Zod
- **Testing**: Vitest + Playwright
- **Code Generation**: Handlebars templates

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later

### Installation

```bash
# Clone the repository
git clone https://github.com/OsnielT/component-library-builder.git
cd component-library-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development Commands

```bash
# Development
npm run dev              # Start dev server

# Testing
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run E2E tests with Playwright

# Code Quality
npm run type-check       # TypeScript type checking
npm run lint             # ESLint
npm run format           # Prettier formatting

# Production
npm run build            # Build for production
npm start                # Start production server
```

## 📁 Project Structure

```
component-library-builder/
├── app/                      # Next.js app directory
│   ├── editor/              # Main editor page
│   ├── projects/            # Project management
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── editor/             # Editor components
│   │   ├── monaco-editor.tsx
│   │   ├── live-preview.tsx
│   │   └── resizable-layout.tsx
│   ├── tokens/             # Token management UI
│   └── components/         # Component builder UI
├── lib/                    # Core business logic
│   ├── core/              # Domain services
│   │   ├── component-generator.ts
│   │   ├── token-validator.ts
│   │   ├── token-resolver.ts
│   │   └── css-generator.ts
│   ├── store/             # Zustand stores
│   │   ├── use-editor-store.ts
│   │   ├── use-token-store.ts
│   │   ├── use-component-store.ts
│   │   └── use-project-store.ts
│   └── templates/         # Handlebars templates
├── types/                 # TypeScript types
│   ├── token.ts
│   ├── component.ts
│   └── project.ts
└── .kiro/                # Development docs
    └── steering/
```

## 🎨 Design Tokens

Tokens follow the [W3C Design Tokens Format](https://design-tokens.github.io/community-group/format/):

```typescript
{
  $type: 'color',
  $value: '#3b82f6',
  $description: 'Primary brand color',
  $extensions: {
    'com.component-builder': {
      id: 'color.primary',
      cssVariable: '--color-primary',
      category: 'semantic'
    }
  }
}
```

### Token Categories

- **Primitive**: Base tokens with direct values (e.g., `color.blue.500`)
- **Semantic**: Contextual tokens referencing primitives (e.g., `color.primary`)
- **Component**: Component-specific tokens (e.g., `button.background`)

### Token Types

- `color` - Color values (hex, rgb, hsl)
- `dimension` - Sizes with units (px, rem, em, %)
- `fontWeight` - Font weights (100-900)
- `fontFamily` - Font family stacks
- `duration` - Animation durations

## 🏗 Architecture

### Layered Architecture

- **UI Layer** - React components and Next.js pages
- **State Layer** - Zustand stores for state management
- **Domain Layer** - Business logic and services
- **Types Layer** - TypeScript type definitions

### Key Features

#### Monaco Editor Integration
- Full TypeScript support with IntelliSense
- React type definitions included
- Syntax highlighting and error detection
- Auto-save with debouncing

#### Live Preview
- Real-time component rendering
- Isolated component preview
- CSS variable support
- Error boundary with helpful messages

#### Component Generation
- Template-based code generation
- Automatic file structure creation
- TypeScript interfaces
- CSS modules with design tokens

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t component-library-builder .

# Run container
docker run -p 3000:3000 component-library-builder
```

### Manual Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [W3C Design Tokens Format](https://design-tokens.github.io/community-group/format/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🙏 Acknowledgments

- Monaco Editor by Microsoft
- Next.js by Vercel
- Design Tokens Community Group

---

Built with ❤️ using Next.js and TypeScript
