# Domain Patterns

## Design Tokens

### W3C Compliance
- All tokens must follow W3C Design Tokens Format
- Required fields: `$type`, `$value`
- Optional fields: `$description`, `$extensions`

### Token Categories
- **Primitive**: Base tokens with direct values (e.g., `color.blue.500`)
- **Semantic**: Contextual tokens referencing primitives (e.g., `color.primary`)
- **Component**: Component-specific tokens (e.g., `button.background`)

### Token References
- Reference pattern: `{token.id}` (e.g., `{color.primary}`)
- Resolver must handle recursive resolution
- Must detect and reject circular references

### Custom Extensions
Use `$extensions['com.component-builder']` for:
- `id`: Unique identifier (dot notation)
- `cssVariable`: CSS variable name (kebab-case with `--` prefix)
- `category`: Token category (primitive/semantic/component)
- `deprecated`: Deprecation flag
- `replacedBy`: Replacement token ID

## Component Specifications

### Naming Conventions
- Component names: PascalCase (e.g., `Button`, `TextField`)
- Prop names: camelCase (e.g., `onClick`, `isDisabled`)
- CSS variables: kebab-case with `--` prefix (e.g., `--color-primary`)
- File names: Match component name (e.g., `Button.tsx`, `Button.types.ts`)

### Component Types
- `primitive`: Basic building blocks (Button, Input)
- `composite`: Composition of primitives (Card, Modal)
- `layout`: Layout components (Grid, Stack)
- `utility`: Utility components (Portal, ErrorBoundary)

### Generated Files
Each component generates:
- `ComponentName.tsx` - React component
- `ComponentName.types.ts` - TypeScript interfaces
- `ComponentName.module.css` - CSS module with token references
- `ComponentName.test.tsx` - Test file
- `ComponentName.stories.tsx` - Storybook story
- `index.ts` - Barrel export

## Dependency Management

### Dependency Graph
- Bidirectional tracking: tokens → components, components → tokens
- Efficient lookup using `Map<string, Set<string>>`
- Update graph on component generation/deletion
- Query before token deletion to prevent breaking changes

### Change Propagation
- Detect changes: created, updated, deleted
- Find affected components via dependency graph
- Generate propagation plan with prioritized actions
- Execute: regenerate CSS → update components → update stories
