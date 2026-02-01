# Getting Started

## ✅ Setup Complete!

Your Component Library Builder web application is now ready to use.

## 🚀 What's Working

### Core Foundation
- ✅ Next.js 14 with App Router
- ✅ TypeScript with strict mode
- ✅ Tailwind CSS for styling
- ✅ Sandpack code editor integration
- ✅ Zustand state management
- ✅ Vitest testing framework (11 tests passing)

### Features Implemented
- ✅ Design token types (W3C compliant)
- ✅ Token validator with Zod schemas
- ✅ Token resolver for references
- ✅ CSS variable generator
- ✅ Token management UI (create, edit, delete)
- ✅ Live code editor with preview
- ✅ Token store with auto CSS regeneration

## 🌐 Access the Application

The dev server is running at: **http://localhost:3000**

### Pages Available
- `/` - Home page with feature overview
- `/editor` - Main editor with token panel and code editor

## 🎯 Try It Out

1. **Open the app**: Navigate to http://localhost:3000
2. **Click "Start Building"** to go to the editor
3. **Create a token**:
   - Click "+ New Token" in the left sidebar
   - Fill in the form (e.g., color.primary = #3b82f6)
   - Click "Create"
4. **See it in action**:
   - The token appears in the token list
   - CSS variables are auto-generated in `/tokens.css`
   - Use the token in your code: `var(--color-primary)`

## 📁 Project Structure

```
component-library-builder/
├── app/                    # Next.js pages
│   ├── editor/            # Editor page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── editor/           # Code editor (Sandpack)
│   └── tokens/           # Token management UI
├── lib/                  # Business logic
│   ├── core/            # Domain services
│   │   ├── token-validator.ts
│   │   ├── token-resolver.ts
│   │   └── css-generator.ts
│   └── store/           # Zustand stores
├── types/               # TypeScript types
└── .kiro/              # Steering docs
```

## 🧪 Run Tests

```bash
npm test
```

All 11 tests are passing:
- Color validation (hex, rgb, hsl)
- Dimension validation (px, rem, em, %)
- Font weight validation (100-900)
- Schema validation (token ID, CSS variable format)

## 🔨 Development Commands

```bash
# Start dev server (already running)
npm run dev

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

## 📋 Next Steps

### Phase 1 Complete ✅
- [x] Basic Next.js app with Sandpack
- [x] Token management UI
- [x] Token validation
- [x] CSS generation
- [x] Live preview

### Phase 2: Component Generation (Next)
- [ ] Component spec builder UI
- [ ] Handlebars template system
- [ ] Component generator service
- [ ] Generate React component files
- [ ] Update Sandpack with generated files

### Phase 3: Export & Persistence
- [ ] Local storage for projects
- [ ] Export as zip file
- [ ] User authentication (optional)
- [ ] Database integration (optional)

## 🎨 Design Token Example

```typescript
{
  $type: 'color',
  $value: '#3b82f6',
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

This generates:
```css
:root {
  --color-primary: #3b82f6;
}
```

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Sandpack Docs](https://sandpack.codesandbox.io/)
- [W3C Design Tokens](https://design-tokens.github.io/community-group/format/)
- [Zustand Docs](https://docs.pmnd.rs/zustand)

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Type errors
```bash
npm run type-check
```

### Test failures
```bash
npm test -- --run
```

## 💡 Tips

1. **Token naming**: Use dot notation (e.g., `color.primary.500`)
2. **CSS variables**: Auto-generated with `--` prefix
3. **Token categories**: Organize as primitive, semantic, or component
4. **Live preview**: Changes to tokens update CSS immediately

---

**Status**: ✅ Foundation is solid and ready for Phase 2!
