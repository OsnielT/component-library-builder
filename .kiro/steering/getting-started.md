# Getting Started - Implementation Guide

## Recommended Tech Stack for MVP

### Frontend
- **Framework**: Next.js 14+ (App Router) - Provides both frontend and API routes
- **Editor**: Sandpack by CodeSandbox - Easiest to get started, no backend needed for preview
- **UI Library**: shadcn/ui + Tailwind CSS - Modern, accessible components
- **State**: Zustand - Simpler than Redux for MVP
- **Forms**: React Hook Form + Zod - Type-safe form validation

### Backend (if needed)
- **API**: Next.js API routes (built-in)
- **Database**: Supabase or PlanetScale - Managed PostgreSQL with auth
- **Storage**: Supabase Storage or Vercel Blob - For project exports
- **Auth**: NextAuth.js or Supabase Auth

### Deployment
- **Hosting**: Vercel (optimized for Next.js)
- **Database**: Included with Supabase/PlanetScale
- **CDN**: Automatic with Vercel

## MVP Feature Scope

### Phase 1: Core Editor (Week 1-2)
1. Basic Next.js app with Sandpack integration
2. File tree navigation
3. Code editing with syntax highlighting
4. Live preview of React components
5. Local storage for persistence (no auth yet)

### Phase 2: Token Management (Week 3-4)
1. Visual token editor UI
2. Token CRUD operations
3. CSS variable generation
4. Live preview updates when tokens change
5. Token validation with Zod

### Phase 3: Component Generation (Week 5-6)
1. Component spec builder UI
2. Template system with Handlebars
3. Generate component files
4. Update file tree and editor
5. Preview generated components

### Phase 4: Export & Auth (Week 7-8)
1. User authentication
2. Save projects to database
3. Export as zip file
4. GitHub integration (optional)
5. Project management UI

## Project Setup

### 1. Initialize Monorepo

```bash
# Create new Next.js app
npx create-next-app@latest component-library-builder --typescript --tailwind --app

cd component-library-builder

# Install core dependencies
npm install @codesandbox/sandpack-react zustand zod react-hook-form @hookform/resolvers
npm install handlebars jszip

# Install UI dependencies
npx shadcn-ui@latest init

# Install dev dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitest/ui
npm install -D @playwright/test
```

### 2. Project Structure

```
component-library-builder/
├── app/                        # Next.js app directory
│   ├── (auth)/                # Auth routes
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/           # Protected routes
│   │   ├── projects/
│   │   └── editor/[id]/
│   ├── api/                   # API routes
│   │   ├── auth/
│   │   ├── projects/
│   │   └── tokens/
│   ├── layout.tsx
│   └── page.tsx
├── components/                # React components
│   ├── editor/
│   │   ├── CodeEditor.tsx
│   │   ├── FileTree.tsx
│   │   └── Preview.tsx
│   ├── tokens/
│   │   ├── TokenEditor.tsx
│   │   ├── TokenList.tsx
│   │   └── ColorPicker.tsx
│   └── ui/                    # shadcn components
├── lib/                       # Utilities and services
│   ├── core/                  # Core business logic
│   │   ├── TokenValidator.ts
│   │   ├── TokenResolver.ts
│   │   ├── CSSGenerator.ts
│   │   └── ComponentGenerator.ts
│   ├── store/                 # Zustand stores
│   │   ├── useProjectStore.ts
│   │   ├── useTokenStore.ts
│   │   └── useEditorStore.ts
│   ├── templates/             # Handlebars templates
│   └── utils.ts
├── types/                     # TypeScript types
│   ├── token.ts
│   ├── component.ts
│   └── project.ts
└── package.json
```

### 3. First Component - Code Editor

```typescript
// components/editor/CodeEditor.tsx
'use client';

import { Sandpack } from '@codesandbox/sandpack-react';
import { useEditorStore } from '@/lib/store/useEditorStore';

export function CodeEditor() {
  const { files, activeFile, updateFile } = useEditorStore();

  return (
    <Sandpack
      template="react-ts"
      files={files}
      options={{
        showNavigator: true,
        showTabs: true,
        showLineNumbers: true,
        editorHeight: '100vh',
      }}
      theme="dark"
    />
  );
}
```

### 4. State Management

```typescript
// lib/store/useEditorStore.ts
import { create } from 'zustand';

interface EditorState {
  files: Record<string, string>;
  activeFile: string;
  updateFile: (path: string, content: string) => void;
  setActiveFile: (path: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  files: {
    '/App.tsx': '// Start coding',
    '/tokens.css': ':root {\n  /* Tokens will appear here */\n}',
  },
  activeFile: '/App.tsx',
  updateFile: (path, content) =>
    set((state) => ({
      files: { ...state.files, [path]: content },
    })),
  setActiveFile: (path) => set({ activeFile: path }),
}));
```

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
```

### 2. Run Tests
```bash
npm test
```

### 3. Run E2E Tests
```bash
npm run test:e2e
```

### 4. Build for Production
```bash
npm run build
```

## Next Steps

1. Set up the basic Next.js app with Sandpack
2. Create the token editor UI
3. Implement token validation and CSS generation
4. Build the component generator
5. Add authentication and database
6. Implement export functionality
7. Deploy to Vercel

## Resources

- [Sandpack Documentation](https://sandpack.codesandbox.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [W3C Design Tokens Format](https://design-tokens.github.io/community-group/format/)
