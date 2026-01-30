# Code Generation

## Template Engine

- **Engine**: Handlebars 4.7+
- **Template location**: Default templates in extension, custom templates in workspace
- **Template naming**: `ComponentName.extension.hbs` (e.g., `Component.tsx.hbs`)

## Custom Handlebars Helpers

Register these helpers for consistent code generation:

```typescript
// Case transformations
camelCase    // myVariableName
pascalCase   // MyComponentName
kebabCase    // my-css-class
snakeCase    // my_constant_name

// Utilities
json         // JSON.stringify with formatting
```

## Template Context

All templates receive the `ComponentSpec` as context:

```typescript
{
  name: string;           // Component name (PascalCase)
  description?: string;
  type: ComponentType;
  props: PropDefinition[];
  tokens: string[];       // Token IDs
  variants?: VariantConfig[];
  dataContract?: DataContract;
}
```

## Generated Code Standards

### TypeScript
- Strict mode compliant
- No unused variables/parameters
- Explicit return types for exported functions
- JSDoc comments for all public APIs

### React Components
- Functional components only
- Props interface in separate `.types.ts` file
- Destructure props in function signature
- Extend `React.HTMLAttributes` for standard HTML props

### CSS Modules
- Use CSS custom properties for all token values
- Reference format: `var(--token-name)`
- BEM-like naming for variants: `.component--variant`

### Tests
- Import from Testing Library
- Basic render test for all components
- Test each prop's effect
- Test each variant

### Storybook Stories
- Storybook 7+ format with `Meta` and `StoryObj`
- Default story with example args
- Story per variant
- Configure argTypes with appropriate controls:
  - `boolean` → boolean control
  - `string` with enum → select control
  - `number` → number control

## Post-Generation

After generating files:
1. Run Prettier for formatting
2. Run ESLint with `--fix` for auto-fixes
3. Verify TypeScript compilation
4. Update dependency graph

## File Structure

```
ComponentName/
├── ComponentName.tsx           # React component
├── ComponentName.types.ts      # TypeScript interfaces
├── ComponentName.module.css    # CSS module
├── ComponentName.test.tsx      # Tests
├── ComponentName.stories.tsx   # Storybook story
└── index.ts                    # Barrel export
```

## Barrel Exports

Always generate `index.ts` with:
```typescript
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName.types';
```
