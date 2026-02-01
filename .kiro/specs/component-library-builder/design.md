# Design Document: Component Library Builder

## Overview

The Component Library Builder is a web application that provides a browser-based integrated development environment for creating, managing, and distributing React component libraries. The system combines design token management, component scaffolding, live preview, and automated code generation into a cohesive developer workflow that runs entirely in the browser.

### Core Capabilities

- **Design Token Management**: Create, edit, validate, and organize design tokens following W3C Design Tokens Format
- **Component Generation**: Generate React components with TypeScript, tests, and Storybook stories from templates
- **Live Preview**: Real-time component preview with variant switching and responsive modes
- **Code Editor**: Full-featured browser-based code editor with syntax highlighting and IntelliSense
- **Change Propagation**: Automatically detect token changes and update dependent components
- **Project Management**: Create, save, and manage multiple component library projects
- **Export & Distribution**: Download projects as zip files or push to GitHub repositories

### Technology Stack

- **Language**: TypeScript 5.3+
- **Frontend Framework**: Next.js 14+ with React 18.2+
- **Code Editor**: Sandpack by CodeSandbox (browser-based bundler and preview)
- **UI Library**: shadcn/ui with Tailwind CSS
- **State Management**: Zustand 4.5+
- **Testing**: Vitest 1.2+ with Testing Library 14.0+ and fast-check for property-based tests
- **Validation**: Zod 3.22+
- **Templates**: Handlebars 4.7+
- **Database**: PostgreSQL (Supabase or PlanetScale)
- **Authentication**: NextAuth.js or Supabase Auth
- **Deployment**: Vercel

## Architecture

### Architectural Style

The system follows a **Layered Architecture** pattern with clear separation of concerns:

1. **Presentation Layer**: React components, UI controls, and user interactions
2. **Application Layer**: Business logic orchestration and service coordination
3. **Domain Layer**: Core models, validation rules, and domain logic
4. **Infrastructure Layer**: Browser storage, API communication, file system operations

### Key Architectural Patterns

- **Repository Pattern**: Abstract data access behind interfaces for testability
- **Observer Pattern**: Token changes notify subscribers for automatic propagation
- **Strategy Pattern**: Pluggable template engines and validation strategies
- **Dependency Inversion**: Depend on abstractions (interfaces) not implementations

### System Context Diagram

```
┌──────────────┐
│  Developer   │
└──────┬───────┘
       │ Uses Browser
       ↓
┌──────────────────┐      Generates      ┌──────────────┐
│   Web App        │ ──────────────────→ │  Component   │
│   (Next.js)      │                      │  Library     │
└────────┬─────────┘                      └──────────────┘
         │                                        │
         │ Stores                                 │ Exported as
         ↓                                        ↓
┌──────────────────┐                      ┌──────────────┐
│   Database       │                      │  Zip/GitHub  │
│   (PostgreSQL)   │                      │  Repository  │
└──────────────────┘                      └──────────────┘
         │
         │ Authenticates
         ↓
┌──────────────────┐
│   Auth Provider  │
│   (NextAuth)     │
└──────────────────┘
```


## Components and Interfaces

### Core Interfaces

#### Token Management

```typescript
interface ITokenRepository {
  getAll(): Promise<DesignToken[]>;
  getById(id: string): Promise<DesignToken | null>;
  getByCategory(category: string): Promise<DesignToken[]>;
  create(token: DesignToken): Promise<DesignToken>;
  update(id: string, token: Partial<DesignToken>): Promise<DesignToken>;
  delete(id: string): Promise<void>;
  replaceAll(tokens: DesignToken[]): Promise<void>;
}

interface ITokenValidator {
  validate(token: DesignToken): ValidationResult;
  validateSchema(schema: TokenSchema): ValidationResult;
  detectCircularReferences(tokens: DesignToken[]): CircularReference[];
}

interface ITokenPropagator {
  propagateChanges(changes: TokenChange[]): Promise<PropagationResult>;
  findDependents(tokenId: string): Promise<string[]>;
  createPlan(changes: TokenChange[]): Promise<PropagationPlan>;
  execute(plan: PropagationPlan, progress?: ProgressCallback): Promise<PropagationResult>;
}

interface ITokenResolver {
  resolve(token: DesignToken, tokenMap: Map<string, DesignToken>): any;
  detectCircularReferences(tokens: DesignToken[]): CircularReference[];
}
```

#### Component Generation

```typescript
interface IComponentGenerator {
  generate(spec: ComponentSpec): Promise<GeneratedFiles>;
  validate(spec: ComponentSpec): ValidationResult;
}

interface ITemplateEngine {
  render(template: string, context: any): string;
  registerHelper(name: string, fn: Function): void;
  loadTemplate(name: string): Promise<string>;
}

interface IComponentRegistry {
  register(component: ComponentMetadata): void;
  get(name: string): ComponentMetadata | undefined;
  list(): ComponentMetadata[];
  search(query: string): ComponentMetadata[];
}
```

#### File System Management

```typescript
interface IFileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  listFiles(directory: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
}

interface IProjectRepository {
  getAll(userId: string): Promise<Project[]>;
  getById(id: string): Promise<Project | null>;
  create(project: Project): Promise<Project>;
  update(id: string, updates: Partial<Project>): Promise<Project>;
  delete(id: string): Promise<void>;
}
```

#### Export and Distribution

```typescript
interface IExportManager {
  exportAsZip(projectId: string): Promise<Blob>;
  exportToGitHub(projectId: string, repoName: string): Promise<string>;
  generatePackageJson(project: Project): string;
  generateReadme(project: Project): string;
}
```

#### User Authentication

```typescript
interface IAuthService {
  signUp(email: string, password: string): Promise<User>;
  login(email: string, password: string): Promise<AuthToken>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  validateToken(token: string): Promise<boolean>;
}
```

#### Data Contracts

```typescript
interface ISchemaManager {
  validate(schema: JSONSchema): ValidationResult;
  generateTypes(schema: JSONSchema, typeName: string): string;
}

interface IMockDataGenerator {
  generate(schema: JSONSchema, count?: number): any;
}
```

### Component Implementations

#### TokenManager

The TokenManager orchestrates token operations and coordinates with the repository, validator, and propagator.

```typescript
class TokenManager {
  constructor(
    private repository: ITokenRepository,
    private validator: ITokenValidator,
    private propagator: ITokenPropagator,
    private dependencyGraph: ComponentDependencyGraph
  ) {}

  async createToken(token: DesignToken): Promise<DesignToken> {
    // Validate token
    const validation = this.validator.validate(token);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    // Create token
    const created = await this.repository.create(token);

    // Trigger propagation
    await this.propagator.propagateChanges([{
      type: 'created',
      tokenId: this.getTokenId(created),
      newValue: created.$value,
      timestamp: new Date()
    }]);

    return created;
  }

  async updateToken(id: string, updates: Partial<DesignToken>): Promise<DesignToken> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new Error(`Token not found: ${id}`);
    }

    const updated = { ...existing, ...updates };
    const validation = this.validator.validate(updated);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    const result = await this.repository.update(id, updates);

    await this.propagator.propagateChanges([{
      type: 'updated',
      tokenId: id,
      oldValue: existing.$value,
      newValue: result.$value,
      timestamp: new Date()
    }]);

    return result;
  }

  async deleteToken(id: string): Promise<void> {
    const dependents = await this.dependencyGraph.findDependents(id);
    if (dependents.length > 0) {
      throw new Error(`Cannot delete token ${id}: used by ${dependents.length} components`);
    }

    const existing = await this.repository.getById(id);
    await this.repository.delete(id);

    await this.propagator.propagateChanges([{
      type: 'deleted',
      tokenId: id,
      oldValue: existing?.$value,
      timestamp: new Date()
    }]);
  }

  private getTokenId(token: DesignToken): string {
    return token.$extensions?.['com.component-builder']?.id || '';
  }
}
```


#### TokenValidator

The TokenValidator ensures tokens comply with W3C specifications and custom validation rules.

```typescript
class TokenValidator implements ITokenValidator {
  private schema = z.object({
    $type: z.enum([
      'color', 'dimension', 'fontFamily', 'fontWeight', 
      'fontSize', 'lineHeight', 'letterSpacing', 'duration', 
      'cubicBezier', 'shadow', 'border', 'gradient'
    ]),
    $value: z.union([z.string(), z.number(), z.array(z.number())]),
    $description: z.string().optional(),
    $extensions: z.object({
      'com.component-builder': z.object({
        id: z.string().regex(/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/),
        cssVariable: z.string().regex(/^--[a-z][a-z0-9-]*$/),
        category: z.enum(['primitive', 'semantic', 'component']),
        deprecated: z.boolean().optional(),
        replacedBy: z.string().optional(),
      })
    }).optional()
  });

  validate(token: DesignToken): ValidationResult {
    // Schema validation
    const schemaResult = this.schema.safeParse(token);
    if (!schemaResult.success) {
      return {
        valid: false,
        errors: schemaResult.error.errors.map(e => e.message)
      };
    }

    // Type-specific validation
    const typeValidation = this.validateType(token);
    if (!typeValidation.valid) {
      return typeValidation;
    }

    return { valid: true };
  }

  private validateType(token: DesignToken): ValidationResult {
    const value = String(token.$value);

    switch (token.$type) {
      case 'color':
        return this.validateColor(value);
      case 'dimension':
        return this.validateDimension(value);
      case 'fontWeight':
        return this.validateFontWeight(token.$value as number);
      default:
        return { valid: true };
    }
  }

  private validateColor(value: string): ValidationResult {
    const hexPattern = /^#[0-9a-f]{6}$/i;
    const rgbPattern = /^rgb\(/;
    const hslPattern = /^hsl\(/;

    if (hexPattern.test(value) || rgbPattern.test(value) || hslPattern.test(value)) {
      return { valid: true };
    }

    return {
      valid: false,
      errors: ['Color must be valid hex, rgb, or hsl format']
    };
  }

  private validateDimension(value: string): ValidationResult {
    const pattern = /^-?\d+(\.\d+)?(px|rem|em|%)$/;
    if (pattern.test(value)) {
      return { valid: true };
    }

    return {
      valid: false,
      errors: ['Dimension must include valid CSS unit (px, rem, em, %)']
    };
  }

  private validateFontWeight(value: number): ValidationResult {
    if (value >= 100 && value <= 900 && value % 100 === 0) {
      return { valid: true };
    }

    return {
      valid: false,
      errors: ['Font weight must be between 100-900 and divisible by 100']
    };
  }

  detectCircularReferences(tokens: DesignToken[]): CircularReference[] {
    const graph = new Map<string, Set<string>>();
    const circles: CircularReference[] = [];

    // Build dependency graph
    for (const token of tokens) {
      const id = this.getTokenId(token);
      const refs = this.extractReferences(token.$value);
      graph.set(id, new Set(refs));
    }

    // Detect cycles using DFS
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string, path: string[]): boolean => {
      visited.add(node);
      recStack.add(node);
      path.push(node);

      const neighbors = graph.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor, [...path])) {
            return true;
          }
        } else if (recStack.has(neighbor)) {
          circles.push({
            cycle: [...path, neighbor]
          });
          return true;
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return circles;
  }

  private extractReferences(value: any): string[] {
    if (typeof value !== 'string') return [];
    const matches = value.match(/\{([^}]+)\}/g);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
  }

  private getTokenId(token: DesignToken): string {
    return token.$extensions?.['com.component-builder']?.id || '';
  }
}
```


#### TokenResolver

The TokenResolver resolves token references to their final values.

```typescript
class TokenResolver implements ITokenResolver {
  resolve(token: DesignToken, tokenMap: Map<string, DesignToken>): any {
    if (typeof token.$value !== 'string') {
      return token.$value;
    }

    // Check if value is a reference (e.g., "{colors.primary}")
    const refMatch = token.$value.match(/^\{(.+)\}$/);
    if (!refMatch) {
      return token.$value;
    }

    const referencedId = refMatch[1];
    const referencedToken = tokenMap.get(referencedId);

    if (!referencedToken) {
      throw new Error(`Token reference not found: ${referencedId}`);
    }

    // Recursively resolve
    return this.resolve(referencedToken, tokenMap);
  }

  detectCircularReferences(tokens: DesignToken[]): CircularReference[] {
    // Implementation delegated to TokenValidator
    const validator = new TokenValidator();
    return validator.detectCircularReferences(tokens);
  }
}
```

#### CSSVariableGenerator

The CSSVariableGenerator converts design tokens to CSS custom properties.

```typescript
class CSSVariableGenerator {
  constructor(private resolver: ITokenResolver) {}

  generate(tokens: DesignToken[]): string {
    const tokenMap = new Map(
      tokens.map(t => [this.getTokenId(t), t])
    );

    let css = ':root {\n';

    for (const token of tokens) {
      const cssVar = this.getCSSVariable(token);
      const resolvedValue = this.resolver.resolve(token, tokenMap);
      const formattedValue = this.formatValue(token.$type, resolvedValue);

      css += `  ${cssVar}: ${formattedValue};\n`;
    }

    css += '}\n';
    return css;
  }

  private formatValue(type: TokenType, value: any): string {
    switch (type) {
      case 'color':
        return this.formatColor(value);
      case 'dimension':
        return String(value);
      case 'cubicBezier':
        return `cubic-bezier(${value.join(', ')})`;
      case 'shadow':
        return this.formatShadow(value);
      default:
        return String(value);
    }
  }

  private formatColor(value: string): string {
    // Ensure color is in valid CSS format
    return value;
  }

  private formatShadow(value: any): string {
    if (typeof value === 'string') return value;
    // Format shadow object to CSS string
    return `${value.offsetX} ${value.offsetY} ${value.blur} ${value.spread} ${value.color}`;
  }

  private getCSSVariable(token: DesignToken): string {
    return token.$extensions?.['com.component-builder']?.cssVariable || '';
  }

  private getTokenId(token: DesignToken): string {
    return token.$extensions?.['com.component-builder']?.id || '';
  }
}
```


#### ComponentGenerator

The ComponentGenerator creates React components from specifications using templates.

```typescript
class ComponentGenerator implements IComponentGenerator {
  constructor(
    private templateEngine: ITemplateEngine,
    private fileSystem: IFileSystem
  ) {}

  async generate(spec: ComponentSpec): Promise<GeneratedFiles> {
    // Validate spec
    const validation = this.validate(spec);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    const files: GeneratedFile[] = [];

    // Generate component file
    const componentTemplate = await this.templateEngine.loadTemplate('Component.tsx.hbs');
    const componentContent = this.templateEngine.render(componentTemplate, spec);
    files.push({
      path: `${spec.name}/${spec.name}.tsx`,
      content: componentContent
    });

    // Generate types file
    const typesTemplate = await this.templateEngine.loadTemplate('Component.types.ts.hbs');
    const typesContent = this.templateEngine.render(typesTemplate, spec);
    files.push({
      path: `${spec.name}/${spec.name}.types.ts`,
      content: typesContent
    });

    // Generate styles file
    const stylesTemplate = await this.templateEngine.loadTemplate('Component.module.css.hbs');
    const stylesContent = this.templateEngine.render(stylesTemplate, spec);
    files.push({
      path: `${spec.name}/${spec.name}.module.css`,
      content: stylesContent
    });

    // Generate test file
    const testTemplate = await this.templateEngine.loadTemplate('Component.test.tsx.hbs');
    const testContent = this.templateEngine.render(testTemplate, spec);
    files.push({
      path: `${spec.name}/${spec.name}.test.tsx`,
      content: testContent
    });

    // Generate story file
    const storyTemplate = await this.templateEngine.loadTemplate('Component.stories.tsx.hbs');
    const storyContent = this.templateEngine.render(storyTemplate, spec);
    files.push({
      path: `${spec.name}/${spec.name}.stories.tsx`,
      content: storyContent
    });

    // Generate index file
    files.push({
      path: `${spec.name}/index.ts`,
      content: `export { ${spec.name} } from './${spec.name}';\nexport type { ${spec.name}Props } from './${spec.name}.types';\n`
    });

    // Write files to in-memory file system
    for (const file of files) {
      await this.fileSystem.writeFile(file.path, file.content);
    }

    return { files };
  }

  validate(spec: ComponentSpec): ValidationResult {
    const errors: string[] = [];

    if (!spec.name || !/^[A-Z][a-zA-Z0-9]*$/.test(spec.name)) {
      errors.push('Component name must be PascalCase');
    }

    if (!spec.type) {
      errors.push('Component type is required');
    }

    for (const prop of spec.props || []) {
      if (!prop.name || !/^[a-z][a-zA-Z0-9]*$/.test(prop.name)) {
        errors.push(`Prop name '${prop.name}' must be camelCase`);
      }
      if (!prop.type) {
        errors.push(`Prop '${prop.name}' must have a type`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```


#### PropagationEngine

The PropagationEngine detects token changes and updates dependent components.

```typescript
class PropagationEngine implements ITokenPropagator {
  constructor(
    private dependencyGraph: ComponentDependencyGraph,
    private cssGenerator: CSSVariableGenerator,
    private fileSystem: IFileSystem
  ) {}

  async propagateChanges(changes: TokenChange[]): Promise<PropagationResult> {
    const plan = await this.createPlan(changes);
    return this.execute(plan);
  }

  async createPlan(changes: TokenChange[]): Promise<PropagationPlan> {
    const affectedComponents = await this.findAffectedComponents(changes);
    const actions = this.generateActions(changes, affectedComponents);
    const estimatedDuration = this.estimateDuration(actions);

    return {
      changes,
      affectedComponents,
      actions,
      estimatedDuration
    };
  }

  async execute(plan: PropagationPlan, progress?: ProgressCallback): Promise<PropagationResult> {
    const results: ActionResult[] = [];
    let completed = 0;
    const startTime = Date.now();

    // Sort actions by priority
    const sortedActions = plan.actions.sort((a, b) => a.priority - b.priority);

    for (const action of sortedActions) {
      try {
        const result = await this.executeAction(action);
        results.push(result);

        completed++;
        progress?.({
          completed,
          total: plan.actions.length,
          current: action
        });
      } catch (error) {
        results.push({
          action,
          success: false,
          error: (error as Error).message
        });
      }
    }

    return {
      success: results.every(r => r.success),
      results,
      duration: Date.now() - startTime
    };
  }

  async findDependents(tokenId: string): Promise<string[]> {
    return this.dependencyGraph.findDependents(tokenId);
  }

  private async findAffectedComponents(changes: TokenChange[]): Promise<string[]> {
    const affected = new Set<string>();

    for (const change of changes) {
      const dependents = await this.findDependents(change.tokenId);
      dependents.forEach(d => affected.add(d));
    }

    return Array.from(affected);
  }

  private generateActions(changes: TokenChange[], affected: string[]): PropagationAction[] {
    const actions: PropagationAction[] = [];

    // Always regenerate CSS
    actions.push({
      type: 'regenerate-css',
      target: 'tokens.css',
      priority: 1
    });

    // Update affected components
    for (const componentId of affected) {
      actions.push({
        type: 'update-component',
        target: componentId,
        priority: 2
      });
    }

    return actions;
  }

  private estimateDuration(actions: PropagationAction[]): number {
    // Estimate 100ms per action
    return actions.length * 100;
  }

  private async executeAction(action: PropagationAction): Promise<ActionResult> {
    switch (action.type) {
      case 'regenerate-css':
        await this.regenerateCSS();
        return { action, success: true };
      case 'update-component':
        await this.updateComponent(action.target);
        return { action, success: true };
      default:
        return { action, success: false, error: 'Unknown action type' };
    }
  }

  private async regenerateCSS(): Promise<void> {
    // Implementation handled by CSSVariableGenerator
  }

  private async updateComponent(componentId: string): Promise<void> {
    // Implementation: update component files in file system
  }
}
```

#### ExportManager

The ExportManager handles project export to zip files and GitHub.

```typescript
class ExportManager implements IExportManager {
  constructor(
    private fileSystem: IFileSystem,
    private projectRepository: IProjectRepository
  ) {}

  async exportAsZip(projectId: string): Promise<Blob> {
    const project = await this.projectRepository.getById(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const zip = new JSZip();

    // Add all project files
    for (const [path, content] of Object.entries(project.files)) {
      zip.file(path, content);
    }

    // Add package.json
    const packageJson = this.generatePackageJson(project);
    zip.file('package.json', packageJson);

    // Add README.md
    const readme = this.generateReadme(project);
    zip.file('README.md', readme);

    // Add tokens as JSON
    zip.file('tokens.json', JSON.stringify(project.tokens, null, 2));

    // Generate CSS variables
    const cssGenerator = new CSSVariableGenerator(new TokenResolver());
    const css = cssGenerator.generate(project.tokens);
    zip.file('tokens.css', css);

    return await zip.generateAsync({ type: 'blob' });
  }

  async exportToGitHub(projectId: string, repoName: string): Promise<string> {
    const project = await this.projectRepository.getById(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    // Use GitHub API to create repository and push files
    // Implementation depends on GitHub OAuth integration
    const repoUrl = `https://github.com/${project.userId}/${repoName}`;
    
    // Create repository
    // Push all files
    // Return repository URL
    
    return repoUrl;
  }

  generatePackageJson(project: Project): string {
    const packageJson = {
      name: project.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: project.description || '',
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        test: 'vitest',
        storybook: 'storybook dev -p 6006',
        'build-storybook': 'storybook build'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        typescript: '^5.3.0',
        vitest: '^1.2.0',
        '@testing-library/react': '^14.0.0',
        storybook: '^7.6.0'
      }
    };

    return JSON.stringify(packageJson, null, 2);
  }

  generateReadme(project: Project): string {
    return `# ${project.name}

${project.description || 'A React component library'}

## Installation

\`\`\`bash
npm install ${project.name.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

## Usage

\`\`\`tsx
import { Button } from '${project.name.toLowerCase().replace(/\s+/g, '-')}';

function App() {
  return <Button>Click me</Button>;
}
\`\`\`

## Development

\`\`\`bash
# Install dependencies
npm install

# Run tests
npm test

# Start Storybook
npm run storybook
\`\`\`

## Components

${project.components.map(c => `- **${c.name}**: ${c.description || ''}`).join('\n')}

## Design Tokens

This library uses ${project.tokens.length} design tokens for consistent styling.
`;
  }
}
```


## Data Models

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthToken {
  token: string;
  expiresAt: Date;
  user: User;
}
```

### Project

```typescript
interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  files: Record<string, string>;  // path -> content mapping
  tokens: DesignToken[];
  components: ComponentSpec[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Design Token

```typescript
interface DesignToken {
  // W3C Standard Fields
  $type: TokenType;
  $value: TokenValue;
  $description?: string;

  // Custom Extensions
  $extensions?: {
    'com.component-builder': {
      id: string;                    // Unique identifier (e.g., "color.primary")
      cssVariable: string;            // CSS variable name (e.g., "--color-primary")
      category: TokenCategory;        // Grouping category
      deprecated?: boolean;           // Deprecation flag
      replacedBy?: string;           // Replacement token ID
      scopes?: string[];             // Applicable scopes (web, mobile)
      metadata?: Record<string, any>; // Additional metadata
    }
  }
}

type TokenType = 
  | 'color' 
  | 'dimension' 
  | 'fontFamily' 
  | 'fontWeight' 
  | 'fontSize'
  | 'lineHeight'
  | 'letterSpacing'
  | 'duration' 
  | 'cubicBezier'
  | 'shadow'
  | 'border'
  | 'gradient';

type TokenValue = string | number | number[] | TokenReference;

interface TokenReference {
  $type: 'reference';
  $value: string; // Token ID
}

type TokenCategory = 'primitive' | 'semantic' | 'component';
```

### Component Specification

```typescript
interface ComponentSpec {
  // Metadata
  name: string;                    // Component name (PascalCase)
  description?: string;            // Human-readable description
  version: string;                 // Semantic version

  // Component Type
  type: ComponentType;

  // Props Definition
  props: PropDefinition[];

  // Styling
  tokens: string[];                // Token IDs used
  customStyles?: string;           // Additional CSS

  // Variants
  variants?: VariantConfig[];

  // Data
  dataContract?: DataContract;

  // Documentation
  examples?: ComponentExample[];

  // Testing
  testCoverage?: TestConfig;
}

type ComponentType = 
  | 'primitive'      // Basic building block (Button, Input)
  | 'composite'      // Composition of primitives (Card, Modal)
  | 'layout'         // Layout components (Grid, Stack)
  | 'utility';       // Utility components (Portal, ErrorBoundary)

interface PropDefinition {
  name: string;
  type: string;                    // TypeScript type
  required: boolean;
  defaultValue?: any;
  description?: string;
  validation?: ValidationRule[];
}

interface VariantConfig {
  name: string;                    // e.g., "primary", "secondary"
  props: Record<string, any>;      // Prop overrides for variant
  tokens?: Record<string, string>; // Token overrides
}
```

### Data Contract

```typescript
interface DataContract {
  schema: JSONSchema;              // JSON Schema v7
  mockStrategy: MockStrategy;
  apiConfig?: APIConfig;
  transformers?: DataTransformer[];
}

interface JSONSchema {
  $schema: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  format?: string;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  description?: string;
}

type MockStrategy = 
  | 'static'        // Use provided mock data
  | 'generated'     // Generate using faker.js
  | 'hybrid';       // Combine static and generated

interface APIConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, string>;
  auth?: AuthConfig;
}

interface DataTransformer {
  name: string;
  transform: (data: any) => any;
}
```

### Change Tracking

```typescript
interface TokenChange {
  type: 'created' | 'updated' | 'deleted';
  tokenId: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
}

interface PropagationPlan {
  changes: TokenChange[];
  affectedComponents: string[];
  actions: PropagationAction[];
  estimatedDuration: number;
}

interface PropagationAction {
  type: 'regenerate-css' | 'update-component' | 'update-docs';
  target: string;
  priority: number;
}

interface PropagationResult {
  success: boolean;
  results: ActionResult[];
  duration: number;
}

interface ActionResult {
  action: PropagationAction;
  success: boolean;
  error?: string;
}
```

### Export Configuration

```typescript
interface ExportConfig {
  includeTests: boolean;
  includeStories: boolean;
  includeDocs: boolean;
  format: 'zip' | 'github';
}

interface GitHubConfig {
  repoName: string;
  isPrivate: boolean;
  description?: string;
}
```

### Validation

```typescript
interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

interface CircularReference {
  cycle: string[];
}
```


## Browser-Based Architecture

### In-Memory File System

The application uses an in-memory file system to manage project files without server-side file operations:

```typescript
class InMemoryFileSystem implements IFileSystem {
  private files: Map<string, string> = new Map();

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (content === undefined) {
      throw new FileSystemError('read', path, new Error('File not found'));
    }
    return content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  async deleteFile(path: string): Promise<void> {
    if (!this.files.has(path)) {
      throw new FileSystemError('delete', path, new Error('File not found'));
    }
    this.files.delete(path);
  }

  async listFiles(directory: string): Promise<string[]> {
    const files: string[] = [];
    for (const path of this.files.keys()) {
      if (path.startsWith(directory)) {
        files.push(path);
      }
    }
    return files;
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  toJSON(): Record<string, string> {
    return Object.fromEntries(this.files);
  }

  fromJSON(data: Record<string, string>): void {
    this.files = new Map(Object.entries(data));
  }
}
```

### Sandpack Integration

The application uses Sandpack for the code editor and live preview:

```typescript
import { Sandpack } from '@codesandbox/sandpack-react';

interface EditorProps {
  files: Record<string, string>;
  onFileChange: (path: string, content: string) => void;
}

function CodeEditor({ files, onFileChange }: EditorProps) {
  return (
    <Sandpack
      template="react-ts"
      files={files}
      options={{
        showNavigator: true,
        showTabs: true,
        showLineNumbers: true,
        editorHeight: '100vh',
        autorun: true,
        autoReload: true,
      }}
      theme="dark"
    />
  );
}
```

### State Management with Zustand

```typescript
interface EditorState {
  files: Record<string, string>;
  activeFile: string;
  updateFile: (path: string, content: string) => void;
  setActiveFile: (path: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  files: {},
  activeFile: '',
  updateFile: (path, content) =>
    set((state) => ({
      files: { ...state.files, [path]: content },
    })),
  setActiveFile: (path) => set({ activeFile: path }),
}));

interface TokenState {
  tokens: DesignToken[];
  selectedToken: DesignToken | null;
  addToken: (token: DesignToken) => void;
  updateToken: (id: string, updates: Partial<DesignToken>) => void;
  deleteToken: (id: string) => void;
  selectToken: (token: DesignToken | null) => void;
}

export const useTokenStore = create<TokenState>((set) => ({
  tokens: [],
  selectedToken: null,
  addToken: (token) =>
    set((state) => ({ tokens: [...state.tokens, token] })),
  updateToken: (id, updates) =>
    set((state) => ({
      tokens: state.tokens.map((t) =>
        t.$extensions?.['com.component-builder']?.id === id
          ? { ...t, ...updates }
          : t
      ),
    })),
  deleteToken: (id) =>
    set((state) => ({
      tokens: state.tokens.filter(
        (t) => t.$extensions?.['com.component-builder']?.id !== id
      ),
    })),
  selectToken: (token) => set({ selectedToken: token }),
}));

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  loadProject: (id: string) => Promise<void>;
  saveProject: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  projects: [],
  loadProject: async (id) => {
    const response = await fetch(`/api/projects/${id}`);
    const project = await response.json();
    set({ currentProject: project });
  },
  saveProject: async () => {
    const project = get().currentProject;
    if (!project) return;
    await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
  },
  createProject: async (name, description) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    const project = await response.json();
    set({ currentProject: project });
  },
  deleteProject: async (id) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    }));
  },
}));
```

### API Routes (Next.js)

```typescript
// app/api/projects/route.ts
export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const projects = await db.project.findMany({
    where: { userId: session.user.id },
  });

  return Response.json(projects);
}

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const project = await db.project.create({
    data: {
      userId: session.user.id,
      name: body.name,
      description: body.description,
      files: {},
      tokens: [],
      components: [],
    },
  });

  return Response.json(project);
}

// app/api/projects/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession(request);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const project = await db.project.findUnique({
    where: { id: params.id, userId: session.user.id },
  });

  if (!project) {
    return new Response('Not found', { status: 404 });
  }

  return Response.json(project);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession(request);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const project = await db.project.update({
    where: { id: params.id, userId: session.user.id },
    data: body,
  });

  return Response.json(project);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession(request);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  await db.project.delete({
    where: { id: params.id, userId: session.user.id },
  });

  return new Response(null, { status: 204 });
}
```

### Database Schema (Prisma)

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  password  String
  projects  Project[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Project {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  description String?
  files       Json     @default("{}")
  tokens      Json     @default("[]")
  components  Json     @default("[]")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas where properties can be consolidated:

- **Version bumping properties (11.5, 11.6, 11.7)** can be combined into a single comprehensive semver property
- **Prop generation properties (6.2, 6.3)** can be combined into a single property about optional flag handling
- **Token validation properties (2.2, 2.3, 2.4)** are distinct and test different validation rules, so they remain separate
- **CSS generation properties (4.1, 4.6, 4.7)** test different aspects and remain separate

### Token Validation Properties

**Property 1: W3C Token Type Validation**

*For any* token with a type field, the Token_Validator should accept the token if and only if the type is one of the valid W3C token types (color, dimension, fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, duration, cubicBezier, shadow, border, gradient).

**Validates: Requirements 2.1**

**Property 2: Color Token Format Validation**

*For any* token with type "color", the Token_Validator should accept the value if and only if it matches a valid CSS color format (hex with 6 characters, rgb function, or hsl function).

**Validates: Requirements 2.2**

**Property 3: Dimension Token Unit Validation**

*For any* token with type "dimension", the Token_Validator should accept the value if and only if it includes a valid CSS unit (px, rem, em, or %).

**Validates: Requirements 2.3**

**Property 4: Font Weight Range Validation**

*For any* token with type "fontWeight", the Token_Validator should accept the value if and only if it is a number between 100 and 900 (inclusive) and divisible by 100.

**Validates: Requirements 2.4**

**Property 5: Circular Reference Detection**

*For any* set of tokens with references, the Token_Validator should detect and report all circular reference cycles in the dependency graph.

**Validates: Requirements 2.7**

### Token Resolution Properties

**Property 6: Reference Resolution Termination**

*For any* token reference chain without cycles, recursively resolving the references should eventually reach a primitive value (non-reference token).

**Validates: Requirements 3.2**

**Property 7: Token Export Round-Trip**

*For any* set of valid tokens, exporting to JSON and then importing should produce an equivalent set of tokens with the same values and structure.

**Validates: Requirements 1.7**

### CSS Generation Properties

**Property 8: Complete Token Coverage in CSS**

*For any* set of tokens, the generated CSS file should contain exactly one CSS custom property for each token, with no tokens missing and no duplicates.

**Validates: Requirements 4.1**

**Property 9: CSS Root Selector Structure**

*For any* set of tokens, the generated CSS should contain all custom properties within a single :root selector block.

**Validates: Requirements 4.6**

**Property 10: CSS Reference Resolution**

*For any* token that references another token, the generated CSS custom property should contain the resolved primitive value, not the reference syntax.

**Validates: Requirements 4.7**

### Component Generation Properties

**Property 11: Valid TypeScript Component Output**

*For any* valid ComponentSpec, the generated component file should be syntactically valid TypeScript that compiles without errors.

**Validates: Requirements 5.1**

**Property 12: Props to TypeScript Interface Mapping**

*For any* ComponentSpec with prop definitions, the generated TypeScript interface should include exactly one property for each prop definition with the correct type and optional flag.

**Validates: Requirements 5.7, 6.1**

**Property 13: Optional Flag Correctness**

*For any* prop definition, the generated TypeScript interface property should include the optional flag (?) if and only if the prop's required field is false.

**Validates: Requirements 6.2, 6.3**

**Property 14: Lint-Free Generated Code**

*For any* valid ComponentSpec, the generated component files should pass ESLint validation with zero errors and zero warnings.

**Validates: Requirements 5.9**

### Storybook Integration Properties

**Property 15: Story File Generation**

*For any* valid ComponentSpec, the Storybook_Integration should generate a story file that is syntactically valid TypeScript and follows Storybook 7+ format.

**Validates: Requirements 7.1**

**Property 16: ArgTypes Configuration Completeness**

*For any* ComponentSpec with props, the generated story should include argTypes configuration for all props with appropriate control types.

**Validates: Requirements 7.4**

### Data Contract Properties

**Property 17: JSON Schema Validation**

*For any* data contract, the schema should validate successfully against JSON Schema Draft 7 specification if and only if it follows the specification rules.

**Validates: Requirements 9.2**

**Property 18: Schema to TypeScript Conversion**

*For any* valid JSON Schema, the generated TypeScript interface should be syntactically valid TypeScript that compiles without errors.

**Validates: Requirements 9.3**

**Property 19: Mock Data Schema Conformance**

*For any* valid JSON Schema, the generated mock data should validate successfully against the schema.

**Validates: Requirements 10.1**

### Change Propagation Properties

**Property 20: Complete Change Detection**

*For any* two token sets (old and new), the Propagation_Engine should detect all differences including every created, updated, and deleted token.

**Validates: Requirements 14.1**

**Property 21: Dependency Graph Completeness**

*For any* token and component relationship, if a component uses a token, querying the Dependency_Graph for that token should return the component ID.

**Validates: Requirements 14.5, 17.4**

**Property 22: Impact Severity Classification**

*For any* set of token changes, the calculated severity should be "critical" if deletions affect more than 10 components, "high" if deletions affect 1-10 components or updates affect more than 20 components, "medium" if updates affect 6-20 components, and "low" if updates affect 1-5 components.

**Validates: Requirements 15.2**

**Property 23: Dependency Recording**

*For any* component generated with tokens, all token IDs from the ComponentSpec should be recorded in the Dependency_Graph as dependencies of that component.

**Validates: Requirements 17.1**

### Template Engine Properties

**Property 24: Template Context Availability**

*For any* ComponentSpec and template, rendering the template should make all fields from the ComponentSpec accessible in the template context.

**Validates: Requirements 18.6**

### File System Safety Properties

**Property 25: Atomic Write Guarantee**

*For any* file write operation, if the operation fails, the file should either contain the complete new content or remain unchanged with the original content (no partial writes).

**Validates: Requirements 19.1**

**Property 26: Workspace Path Validation**

*For any* file path, the Application should accept the path if and only if the normalized path is within the project directory structure.

**Validates: Requirements 19.6**

### Performance Properties

**Property 27: Cache Hit Performance**

*For any* data that has been accessed once, subsequent accesses to the same data should complete faster than the first access (demonstrating caching).

**Validates: Requirements 20.6**

### Browser Compatibility Properties

**Property 28: Path Separator Normalization**

*For any* file path with either forward slashes or backslashes, the Application should normalize the path to use forward slashes consistently.

**Validates: Requirements 23.6**


## Error Handling

### Error Categories

The system handles four categories of errors:

1. **Validation Errors**: Invalid input data (tokens, component specs, schemas)
2. **File System Errors**: File read/write failures, permission issues
3. **Integration Errors**: External service failures (npm, Git, Storybook)
4. **Runtime Errors**: Unexpected exceptions during execution

### Error Handling Strategy

#### Validation Errors

```typescript
class ValidationError extends Error {
  constructor(
    public errors: string[],
    public field?: string
  ) {
    super(`Validation failed: ${errors.join(', ')}`);
    this.name = 'ValidationError';
  }
}

// Usage
try {
  const validation = validator.validate(token);
  if (!validation.valid) {
    throw new ValidationError(validation.errors, 'token');
  }
} catch (error) {
  if (error instanceof ValidationError) {
    vscode.window.showErrorMessage(
      `Invalid token: ${error.errors.join(', ')}`,
      'Fix Token'
    );
  }
}
```

#### File System Errors

```typescript
class FileSystemError extends Error {
  constructor(
    public operation: 'read' | 'write' | 'delete',
    public path: string,
    public cause: Error
  ) {
    super(`File ${operation} failed for ${path}: ${cause.message}`);
    this.name = 'FileSystemError';
  }
}

// Atomic write with rollback
async function atomicWrite(path: string, content: string): Promise<void> {
  const tempPath = `${path}.tmp`;
  const backupPath = `${path}.backup`;

  try {
    // Create backup if file exists
    if (await exists(path)) {
      await copyFile(path, backupPath);
    }

    // Write to temp file
    await writeFile(tempPath, content);

    // Atomic rename
    await rename(tempPath, path);

    // Remove backup on success
    if (await exists(backupPath)) {
      await unlink(backupPath);
    }
  } catch (error) {
    // Rollback on failure
    if (await exists(backupPath)) {
      await copyFile(backupPath, path);
      await unlink(backupPath);
    }
    if (await exists(tempPath)) {
      await unlink(tempPath);
    }
    throw new FileSystemError('write', path, error as Error);
  }
}
```

#### Integration Errors

```typescript
class IntegrationError extends Error {
  constructor(
    public service: string,
    public operation: string,
    public cause: Error
  ) {
    super(`${service} ${operation} failed: ${cause.message}`);
    this.name = 'IntegrationError';
  }
}

// Graceful degradation
async function publishToNpm(config: PublishConfig): Promise<PublishResult> {
  try {
    await exec('npm publish');
    return { success: true, version: config.version };
  } catch (error) {
    // Log error but don't crash
    console.error('npm publish failed:', error);
    
    vscode.window.showWarningMessage(
      'Publishing to npm failed. You can publish manually later.',
      'View Logs'
    );

    return {
      success: false,
      version: config.version,
      errors: [(error as Error).message]
    };
  }
}
```

#### Error Recovery

```typescript
class ErrorRecovery {
  /**
   * Retry operation with exponential backoff
   */
  async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Execute with timeout
   */
  async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      )
    ]);
  }
}
```

### User-Facing Error Messages

All error messages follow these principles:

1. **Clear Description**: Explain what went wrong in plain language
2. **Actionable Steps**: Tell the user how to fix the problem
3. **Context**: Include relevant details (file names, token IDs, etc.)
4. **No Technical Jargon**: Avoid implementation details

Examples:

```typescript
// Good error message
"Token 'color.primary' has an invalid color value '#gggggg'. 
Colors must be valid hex (#000000), rgb (rgb(0,0,0)), or hsl (hsl(0,0%,0%)) format."

// Bad error message
"Validation failed: regex mismatch on line 42"
```


## Testing Strategy

### Dual Testing Approach

The system uses both **unit tests** and **property-based tests** as complementary testing strategies:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs
- **Together**: Provide comprehensive coverage (unit tests catch concrete bugs, property tests verify general correctness)

### Property-Based Testing Configuration

**Library Selection**: We will use **fast-check** for TypeScript property-based testing.

**Configuration Requirements**:
- Each property test must run a minimum of 100 iterations
- Each test must include a comment tag referencing the design property
- Tag format: `// Feature: component-library-builder, Property N: [property description]`
- Each correctness property must be implemented by a single property-based test

**Example Property Test**:

```typescript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { TokenValidator } from './TokenValidator';

describe('TokenValidator', () => {
  // Feature: component-library-builder, Property 2: Color Token Format Validation
  it('should accept only valid CSS color formats', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
          fc.tuple(fc.integer(0, 255), fc.integer(0, 255), fc.integer(0, 255))
            .map(([r, g, b]) => `rgb(${r},${g},${b})`),
          fc.tuple(fc.integer(0, 360), fc.integer(0, 100), fc.integer(0, 100))
            .map(([h, s, l]) => `hsl(${h},${s}%,${l}%)`)
        ),
        (colorValue) => {
          const token: DesignToken = {
            $type: 'color',
            $value: colorValue,
            $extensions: {
              'com.component-builder': {
                id: 'test.color',
                cssVariable: '--test-color',
                category: 'primitive'
              }
            }
          };

          const validator = new TokenValidator();
          const result = validator.validate(token);

          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: component-library-builder, Property 2: Color Token Format Validation (invalid cases)
  it('should reject invalid color formats', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => 
          !s.match(/^#[0-9a-f]{6}$/i) && 
          !s.match(/^rgb\(/) && 
          !s.match(/^hsl\(/)
        ),
        (invalidColor) => {
          const token: DesignToken = {
            $type: 'color',
            $value: invalidColor,
            $extensions: {
              'com.component-builder': {
                id: 'test.color',
                cssVariable: '--test-color',
                category: 'primitive'
              }
            }
          };

          const validator = new TokenValidator();
          const result = validator.validate(token);

          expect(result.valid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Strategy

Unit tests focus on:

1. **Specific Examples**: Concrete test cases that demonstrate correct behavior
2. **Edge Cases**: Boundary conditions and special cases
3. **Error Conditions**: Invalid inputs and error handling
4. **Integration Points**: Interactions between components

**Balance**: Avoid writing too many unit tests. Property-based tests handle covering lots of inputs. Unit tests should focus on specific scenarios that are hard to express as properties.

**Example Unit Test**:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TokenManager } from './TokenManager';

describe('TokenManager', () => {
  let tokenManager: TokenManager;

  beforeEach(() => {
    tokenManager = new TokenManager(
      mockRepository,
      mockValidator,
      mockPropagator,
      mockDependencyGraph
    );
  });

  it('should create a valid color token', async () => {
    const token: DesignToken = {
      $type: 'color',
      $value: '#ff0000',
      $extensions: {
        'com.component-builder': {
          id: 'color.red',
          cssVariable: '--color-red',
          category: 'primitive'
        }
      }
    };

    const result = await tokenManager.createToken(token);

    expect(result).toEqual(token);
    expect(mockRepository.create).toHaveBeenCalledWith(token);
  });

  it('should reject token with circular reference', async () => {
    const token1: DesignToken = {
      $type: 'color',
      $value: '{color.two}',
      $extensions: {
        'com.component-builder': {
          id: 'color.one',
          cssVariable: '--color-one',
          category: 'semantic'
        }
      }
    };

    const token2: DesignToken = {
      $type: 'color',
      $value: '{color.one}',
      $extensions: {
        'com.component-builder': {
          id: 'color.two',
          cssVariable: '--color-two',
          category: 'semantic'
        }
      }
    };

    mockValidator.detectCircularReferences.mockReturnValue([
      { cycle: ['color.one', 'color.two', 'color.one'] }
    ]);

    await expect(tokenManager.createToken(token1))
      .rejects.toThrow('Circular reference detected');
  });

  it('should prevent deletion of token with dependents', async () => {
    mockDependencyGraph.findDependents.mockResolvedValue(['Button', 'Card']);

    await expect(tokenManager.deleteToken('color.primary'))
      .rejects.toThrow('Cannot delete token color.primary: used by 2 components');
  });
});
```

### Integration Testing

Integration tests verify that components work together correctly:

```typescript
describe('Component Generation Flow', () => {
  it('should generate complete component with all files', async () => {
    const spec: ComponentSpec = {
      name: 'Button',
      type: 'primitive',
      version: '1.0.0',
      props: [
        { name: 'variant', type: 'string', required: false, defaultValue: 'primary' },
        { name: 'onClick', type: '() => void', required: false }
      ],
      tokens: ['button.background', 'button.color'],
    };

    const generator = new ComponentGenerator(templateEngine, fileSystem);
    const result = await generator.generate(spec);

    expect(result.files).toHaveLength(6);
    expect(result.files.map(f => f.path)).toContain('Button/Button.tsx');
    expect(result.files.map(f => f.path)).toContain('Button/Button.test.tsx');
    expect(result.files.map(f => f.path)).toContain('Button/Button.stories.tsx');

    // Verify file contents
    const componentFile = result.files.find(f => f.path.endsWith('Button.tsx'));
    expect(componentFile?.content).toContain('export const Button');
    expect(componentFile?.content).toContain('variant = \'primary\'');
  });
});
```

### Test Coverage Requirements

| Module | Target Coverage | Testing Focus |
|--------|----------------|---------------|
| TokenValidator | > 95% | Property tests for validation rules, unit tests for edge cases |
| TokenResolver | > 90% | Property tests for resolution, unit tests for circular references |
| CSSVariableGenerator | > 90% | Property tests for format correctness, unit tests for special cases |
| ComponentGenerator | > 85% | Property tests for valid output, unit tests for error handling |
| VersionManager | > 90% | Property tests for semver rules, unit tests for specific versions |
| PropagationEngine | > 85% | Integration tests for full propagation flow |
| Overall | > 80% | Combination of all test types |

### Test Organization

```
src/
├── core/
│   ├── tokens/
│   │   ├── TokenManager.ts
│   │   ├── TokenManager.test.ts          # Unit tests
│   │   ├── TokenManager.properties.test.ts # Property tests
│   │   ├── TokenValidator.ts
│   │   ├── TokenValidator.test.ts
│   │   └── TokenValidator.properties.test.ts
│   └── components/
│       ├── ComponentGenerator.ts
│       ├── ComponentGenerator.test.ts
│       └── ComponentGenerator.properties.test.ts
└── __tests__/
    ├── integration/
    │   ├── component-generation.test.ts
    │   ├── token-propagation.test.ts
    │   └── publishing.test.ts
    └── e2e/
        ├── extension-activation.test.ts
        └── full-workflow.test.ts
```

### Continuous Integration

All tests run automatically on:
- Every pull request
- Every commit to main branch
- Before publishing to marketplace

CI pipeline includes:
1. Lint check (ESLint)
2. Type check (TypeScript)
3. Unit tests
4. Property tests (with 100 iterations)
5. Integration tests
6. Coverage report (must meet thresholds)

