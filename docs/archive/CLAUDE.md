# Component Library Builder - AI Assistant Context

> This file provides comprehensive context for AI assistants (like Claude) to effectively help build, maintain, and extend the Component Library Builder VS Code extension.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Concepts](#core-concepts)
6. [Development Guidelines](#development-guidelines)
7. [Common Tasks](#common-tasks)
8. [Code Examples](#code-examples)
9. [Testing Patterns](#testing-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What This Project Does

The Component Library Builder is a VS Code extension that streamlines the creation and management of React component libraries. It provides:

- **Design Token Management**: Create, edit, and manage design tokens following W3C standards
- **Component Generation**: Scaffold React components with TypeScript, tests, and Storybook stories
- **Automated Storybook Integration**: Auto-generate story files with controls and variants
- **Data Contracts**: Define data schemas with mock generation and API integration
- **Change Propagation**: Automatically update components when tokens change
- **Version Control**: Semantic versioning and npm publishing automation

### Key Goals

1. **Reduce Development Time**: Cut component creation from 2 hours to 30 minutes
2. **Ensure Consistency**: Centralized token management across all components
3. **Developer Experience**: Seamless integration into VS Code workflow
4. **Automation**: Minimize manual configuration and repetitive tasks

### Target Users

- Frontend developers building component libraries
- Design system teams maintaining consistency
- UI engineers working on shared component ecosystems

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VS Code Extension Host                    │
├──────────────────┬──────────────────┬───────────────────────┤
│   UI Layer       │  Service Layer   │   Integration Layer   │
│  - Webviews      │  - TokenManager  │   - Storybook        │
│  - Commands      │  - ComponentGen  │   - npm              │
│  - TreeViews     │  - Validator     │   - Git              │
│                  │  - Propagator    │   - FileSystem       │
└──────────────────┴──────────────────┴───────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  - Token Schemas (JSON)  - Component Specs (JSON)           │
│  - Templates (Handlebars) - Config Files                     │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Layers

1. **Presentation Layer** (`src/extension/`, `src/ui/`)
   - VS Code commands and webview panels
   - User interface components
   - Command palette integration

2. **Application Layer** (`src/core/`)
   - Business logic and orchestration
   - Token management, component generation
   - Validation and propagation services

3. **Infrastructure Layer** (`src/infrastructure/`)
   - External integrations (Storybook, npm, Git)
   - File system operations
   - Repository implementations

4. **Domain Layer** (`src/domain/`)
   - Domain models (Token, Component, DataContract)
   - Schema definitions (Zod)
   - Core interfaces

### Design Patterns Used

- **Repository Pattern**: Abstract data access
- **Strategy Pattern**: Pluggable template engines
- **Observer Pattern**: Token change notifications
- **Factory Pattern**: Component generation
- **Dependency Injection**: Loose coupling between layers

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **TypeScript** | 5.3+ | Language |
| **VS Code API** | 1.85+ | Extension framework |
| **React** | 18.2+ | Webview UI |
| **Zustand** | 4.5+ | State management |
| **esbuild** | 0.20+ | Fast builds |
| **Rollup** | 4.9+ | Library bundling |
| **Vitest** | 1.2+ | Testing |
| **Zod** | 3.22+ | Validation |
| **Handlebars** | 4.7+ | Templating |
| **pnpm** | 8.0+ | Package manager |

### Key Dependencies

```json
{
  "dependencies": {
    "@vscode/webview-ui-toolkit": "^1.4.0",
    "zod": "^3.22.4",
    "handlebars": "^4.7.8",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "@vscode/test-electron": "^2.3.9",
    "typescript": "^5.3.3",
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.1.2",
    "esbuild": "^0.20.0",
    "rollup": "^4.9.0"
  }
}
```

---

## Project Structure

```
component-library-builder/
├── src/
│   ├── extension/              # Extension entry point
│   │   ├── extension.ts        # Main activation
│   │   └── commands/           # Command handlers
│   │       ├── token.commands.ts
│   │       ├── component.commands.ts
│   │       └── publish.commands.ts
│   │
│   ├── ui/                     # Webview UI (React)
│   │   ├── panels/
│   │   │   ├── TokenManagerPanel.tsx
│   │   │   ├── ComponentBuilderPanel.tsx
│   │   │   └── ConfigPanel.tsx
│   │   ├── components/         # Reusable UI components
│   │   └── stores/             # Zustand stores
│   │
│   ├── core/                   # Business logic
│   │   ├── tokens/
│   │   │   ├── TokenManager.ts
│   │   │   ├── TokenValidator.ts
│   │   │   ├── TokenPropagator.ts
│   │   │   └── CSSGenerator.ts
│   │   ├── components/
│   │   │   ├── ComponentGenerator.ts
│   │   │   ├── TemplateEngine.ts
│   │   │   └── ComponentRegistry.ts
│   │   ├── data-contracts/
│   │   │   ├── SchemaManager.ts
│   │   │   ├── TypeGenerator.ts
│   │   │   └── MockDataGenerator.ts
│   │   ├── versioning/
│   │   │   ├── VersionManager.ts
│   │   │   └── ChangelogGenerator.ts
│   │   └── propagation/
│   │       ├── PropagationEngine.ts
│   │       ├── DependencyGraph.ts
│   │       └── ImpactAnalyzer.ts
│   │
│   ├── infrastructure/         # External integrations
│   │   ├── repositories/
│   │   │   ├── FileSystemRepository.ts
│   │   │   ├── TokenRepository.ts
│   │   │   └── ComponentRepository.ts
│   │   ├── integrations/
│   │   │   ├── StorybookIntegration.ts
│   │   │   ├── NpmPublisher.ts
│   │   │   └── GitIntegration.ts
│   │   └── utils/
│   │       ├── FileUtils.ts
│   │       ├── PathUtils.ts
│   │       └── ValidationUtils.ts
│   │
│   ├── domain/                 # Domain models
│   │   ├── models/
│   │   │   ├── Token.ts
│   │   │   ├── Component.ts
│   │   │   ├── DataContract.ts
│   │   │   └── ComponentLibrary.ts
│   │   └── schemas/            # Zod schemas
│   │       ├── token.schema.ts
│   │       ├── component.schema.ts
│   │       └── config.schema.ts
│   │
│   └── templates/              # Code generation templates
│       ├── component/
│       │   ├── Component.tsx.hbs
│       │   ├── Component.types.ts.hbs
│       │   ├── Component.test.tsx.hbs
│       │   ├── Component.stories.tsx.hbs
│       │   └── Component.module.css.hbs
│       ├── styles/
│       │   └── tokens.css.hbs
│       └── config/
│           ├── storybook.main.ts.hbs
│           └── storybook.preview.ts.hbs
│
├── tests/
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
│
├── docs/
│   ├── getting-started.md
│   ├── api-reference.md
│   └── examples/
│
├── .vscode/
│   ├── launch.json             # Debug configurations
│   └── tasks.json              # Build tasks
│
├── component-builder-tdd.md    # Technical design document
├── CLAUDE.md                   # This file
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Core Concepts

### 1. Design Tokens

**What They Are:**
Design tokens are named entities that store visual design attributes (colors, spacing, typography, etc.). They follow the [W3C Design Tokens Community Group specification](https://design-tokens.github.io/community-group/format/).

**Token Structure:**
```typescript
interface DesignToken {
  $type: TokenType;
  $value: string | number;
  $description?: string;
  $extensions?: {
    'com.component-builder': {
      id: string;                // Unique identifier
      cssVariable: string;        // CSS variable name (e.g., --color-primary)
      category: string;           // Grouping (primitive, semantic, component)
      deprecated?: boolean;
      replacedBy?: string;
    }
  }
}

type TokenType = 
  | 'color' 
  | 'dimension' 
  | 'fontFamily' 
  | 'fontWeight' 
  | 'fontSize'
  | 'duration' 
  | 'cubicBezier';
```

**Token Categories:**
1. **Primitive Tokens**: Base values (e.g., `colors.blue.500`, `spacing.4`)
2. **Semantic Tokens**: Contextual aliases (e.g., `colors.primary`, `spacing.button.padding`)
3. **Component Tokens**: Component-specific (e.g., `button.background`, `input.border`)

**Example Token:**
```json
{
  "$type": "color",
  "$value": "#3b82f6",
  "$description": "Primary brand color",
  "$extensions": {
    "com.component-builder": {
      "id": "color.primary",
      "cssVariable": "--color-primary",
      "category": "semantic"
    }
  }
}
```

### 2. Component Specifications

**What They Are:**
A JSON schema that defines everything needed to generate a complete React component.

**Structure:**
```typescript
interface ComponentSpec {
  name: string;                    // Component name (PascalCase)
  description?: string;
  version: string;
  type: ComponentType;             // primitive, composite, layout, utility
  props: PropDefinition[];
  tokens: string[];                // Token IDs used by this component
  variants?: VariantConfig[];
  dataContract?: DataContract;
  customStyles?: string;
}

interface PropDefinition {
  name: string;
  type: string;                    // TypeScript type
  required: boolean;
  defaultValue?: any;
  description?: string;
}
```

**Example Component Spec:**
```json
{
  "name": "Button",
  "type": "primitive",
  "props": [
    {
      "name": "variant",
      "type": "string",
      "required": false,
      "defaultValue": "primary"
    },
    {
      "name": "onClick",
      "type": "() => void",
      "required": false
    }
  ],
  "tokens": ["button.background", "button.color", "button.padding"],
  "variants": [
    { "name": "primary", "props": { "variant": "primary" } },
    { "name": "secondary", "props": { "variant": "secondary" } }
  ]
}
```

### 3. Data Contracts

**What They Are:**
JSON Schema definitions that describe the data shape a component expects, enabling type generation and mock data.

**Structure:**
```typescript
interface DataContract {
  schema: JSONSchema;              // JSON Schema v7
  mockStrategy: 'static' | 'generated' | 'hybrid';
  apiConfig?: {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  };
}
```

**Example:**
```json
{
  "schema": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["id", "name"],
    "properties": {
      "id": { "type": "string" },
      "name": { "type": "string" },
      "email": { "type": "string", "format": "email" }
    }
  },
  "mockStrategy": "generated"
}
```

### 4. Change Propagation

**What It Is:**
When tokens change, the system automatically updates all dependent components, regenerates CSS, and updates Storybook stories.

**Flow:**
```
Token Changed
    ↓
Detect Change
    ↓
Find Dependent Components
    ↓
Create Propagation Plan
    ↓
Execute Actions:
    - Regenerate CSS
    - Update Components
    - Update Stories
    - Generate Migration Docs
```

---

## Development Guidelines

### Code Style

**TypeScript Guidelines:**
```typescript
// ✅ GOOD: Use explicit types
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick?: () => void;
}

// ❌ BAD: Avoid 'any'
const props: any = {};

// ✅ GOOD: Use const assertions
const VARIANTS = ['primary', 'secondary'] as const;
type Variant = typeof VARIANTS[number];

// ✅ GOOD: Use async/await
async function loadTokens(): Promise<DesignToken[]> {
  const data = await repository.getAll();
  return data;
}

// ❌ BAD: Don't use .then() chains
function loadTokens() {
  return repository.getAll().then(data => data);
}
```

**Naming Conventions:**
```typescript
// Interfaces: PascalCase with 'I' prefix for interface types
interface ITokenRepository { }
interface TokenData { }

// Classes: PascalCase
class TokenManager { }

// Functions: camelCase
function createToken() { }

// Constants: UPPER_SNAKE_CASE
const MAX_TOKENS = 1000;

// File names: kebab-case
// token-manager.ts
// component-generator.ts
```

**Error Handling:**
```typescript
// ✅ GOOD: Create custom errors
class TokenNotFoundError extends Error {
  constructor(tokenId: string) {
    super(`Token not found: ${tokenId}`);
    this.name = 'TokenNotFoundError';
  }
}

// ✅ GOOD: Handle errors explicitly
try {
  const token = await tokenManager.getById(id);
  return token;
} catch (error) {
  if (error instanceof TokenNotFoundError) {
    vscode.window.showErrorMessage(error.message);
  } else {
    throw error;
  }
}
```

### Dependency Management

**Dependency Injection Pattern:**
```typescript
// ✅ GOOD: Constructor injection
class TokenManager {
  constructor(
    private repository: ITokenRepository,
    private validator: ITokenValidator
  ) {}
  
  async createToken(token: DesignToken): Promise<DesignToken> {
    const validation = await this.validator.validate(token);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }
    return this.repository.create(token);
  }
}

// Usage
const repository = new FileSystemTokenRepository(workspacePath);
const validator = new TokenValidator();
const manager = new TokenManager(repository, validator);
```

**Avoid Circular Dependencies:**
```typescript
// ❌ BAD:
// file-a.ts
import { B } from './file-b';

// file-b.ts
import { A } from './file-a';

// ✅ GOOD: Extract to shared file
// shared-types.ts
export interface IService { }

// file-a.ts
import { IService } from './shared-types';

// file-b.ts
import { IService } from './shared-types';
```

### File Organization

**One Class Per File:**
```typescript
// ✅ GOOD:
// token-manager.ts
export class TokenManager { }

// token-validator.ts
export class TokenValidator { }

// ❌ BAD:
// token-services.ts
export class TokenManager { }
export class TokenValidator { }
export class TokenPropagator { }
```

**Barrel Exports:**
```typescript
// core/tokens/index.ts
export { TokenManager } from './TokenManager';
export { TokenValidator } from './TokenValidator';
export { TokenPropagator } from './TokenPropagator';

// Usage elsewhere
import { TokenManager, TokenValidator } from '@/core/tokens';
```

---

## Common Tasks

### Task 1: Adding a New Token Type

**Steps:**

1. **Update Token Type Definition** (`src/domain/models/Token.ts`)
```typescript
type TokenType = 
  | 'color' 
  | 'dimension'
  | 'NEW_TYPE';  // Add new type
```

2. **Update Validation Schema** (`src/domain/schemas/token.schema.ts`)
```typescript
const tokenSchema = z.object({
  $type: z.enum(['color', 'dimension', 'NEW_TYPE']),
  // ...
});
```

3. **Add Validation Logic** (`src/core/tokens/TokenValidator.ts`)
```typescript
private validateNewType(value: any): boolean {
  // Add validation logic
  return true;
}
```

4. **Update CSS Generator** (`src/core/tokens/CSSGenerator.ts`)
```typescript
private formatValue(type: TokenType, value: any): string {
  switch (type) {
    case 'NEW_TYPE':
      return this.formatNewType(value);
    // ...
  }
}
```

5. **Add Tests**
```typescript
describe('NEW_TYPE tokens', () => {
  it('should validate NEW_TYPE token', () => {
    const token: DesignToken = {
      $type: 'NEW_TYPE',
      $value: 'test-value'
    };
    expect(validator.validate(token).valid).toBe(true);
  });
});
```

### Task 2: Creating a New Component Template

**Steps:**

1. **Create Template File** (`src/templates/component/NewComponent.tsx.hbs`)
```handlebars
import React from 'react';
import { {{name}}Props } from './{{name}}.types';

export const {{name}}: React.FC<{{name}}Props> = ({
  {{#each props}}
  {{name}},
  {{/each}}
}) => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};
```

2. **Register Template** (`src/core/components/TemplateEngine.ts`)
```typescript
class TemplateEngine {
  private templates: Map<string, CompiledTemplate>;
  
  registerTemplate(name: string, content: string): void {
    const compiled = Handlebars.compile(content);
    this.templates.set(name, compiled);
  }
}
```

3. **Update Component Generator** (`src/core/components/ComponentGenerator.ts`)
```typescript
async generate(spec: ComponentSpec): Promise<GeneratedFiles> {
  const files: GeneratedFile[] = [];
  
  // Add new template
  const newContent = this.templateEngine.render('NewComponent', spec);
  files.push({
    path: `${spec.name}/NewComponent.tsx`,
    content: newContent
  });
  
  return { files };
}
```

### Task 3: Adding a New VS Code Command

**Steps:**

1. **Define Command** (`package.json`)
```json
{
  "contributes": {
    "commands": [
      {
        "command": "component-builder.newCommand",
        "title": "New Command",
        "category": "Component Builder"
      }
    ]
  }
}
```

2. **Create Command Handler** (`src/extension/commands/new.commands.ts`)
```typescript
export function registerNewCommands(context: vscode.ExtensionContext) {
  const command = vscode.commands.registerCommand(
    'component-builder.newCommand',
    async () => {
      // Command logic
      vscode.window.showInformationMessage('Command executed!');
    }
  );
  
  context.subscriptions.push(command);
}
```

3. **Register in Extension** (`src/extension/extension.ts`)
```typescript
export function activate(context: vscode.ExtensionContext) {
  registerTokenCommands(context);
  registerComponentCommands(context);
  registerNewCommands(context);  // Add new commands
}
```

### Task 4: Adding a Webview Panel

**Steps:**

1. **Create Panel Component** (`src/ui/panels/NewPanel.tsx`)
```typescript
import React from 'react';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';

export const NewPanel: React.FC = () => {
  return (
    <div>
      <h1>New Panel</h1>
      <VSCodeButton onClick={() => console.log('clicked')}>
        Click Me
      </VSCodeButton>
    </div>
  );
};
```

2. **Create Panel Provider** (`src/extension/panels/NewPanelProvider.ts`)
```typescript
import * as vscode from 'vscode';

export class NewPanelProvider {
  public static currentPanel: NewPanelProvider | undefined;
  
  public static createOrShow(extensionUri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel(
      'newPanel',
      'New Panel',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [extensionUri]
      }
    );
    
    panel.webview.html = this.getWebviewContent(panel.webview, extensionUri);
    
    return new NewPanelProvider(panel, extensionUri);
  }
  
  private static getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri
  ): string {
    // Return HTML with React app
  }
}
```

3. **Register Command to Open Panel**
```typescript
vscode.commands.registerCommand('component-builder.openNewPanel', () => {
  NewPanelProvider.createOrShow(context.extensionUri);
});
```

---

## Code Examples

### Example 1: Token Manager Implementation

```typescript
// src/core/tokens/TokenManager.ts
import { DesignToken, TokenChange } from '@/domain/models/Token';
import { ITokenRepository } from '@/infrastructure/repositories/ITokenRepository';
import { ITokenValidator } from './ITokenValidator';

export class TokenManager {
  constructor(
    private repository: ITokenRepository,
    private validator: ITokenValidator
  ) {}
  
  async createToken(token: DesignToken): Promise<DesignToken> {
    // Validate token
    const validation = this.validator.validate(token);
    if (!validation.valid) {
      throw new Error(`Invalid token: ${validation.errors.join(', ')}`);
    }
    
    // Check for duplicates
    const existing = await this.repository.getById(
      token.$extensions!['com.component-builder'].id
    );
    if (existing) {
      throw new Error('Token already exists');
    }
    
    // Create token
    return this.repository.create(token);
  }
  
  async updateToken(id: string, updates: Partial<DesignToken>): Promise<DesignToken> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new Error(`Token not found: ${id}`);
    }
    
    const updated = { ...existing, ...updates };
    
    // Validate updated token
    const validation = this.validator.validate(updated);
    if (!validation.valid) {
      throw new Error(`Invalid token: ${validation.errors.join(', ')}`);
    }
    
    return this.repository.update(id, updated);
  }
  
  async deleteToken(id: string): Promise<void> {
    const token = await this.repository.getById(id);
    if (!token) {
      throw new Error(`Token not found: ${id}`);
    }
    
    // Check for dependencies
    const dependents = await this.findDependentComponents(id);
    if (dependents.length > 0) {
      throw new Error(
        `Cannot delete token. Used by: ${dependents.join(', ')}`
      );
    }
    
    await this.repository.delete(id);
  }
  
  private async findDependentComponents(tokenId: string): Promise<string[]> {
    // Implementation to find components using this token
    return [];
  }
}
```

### Example 2: Component Generator

```typescript
// src/core/components/ComponentGenerator.ts
import { ComponentSpec, GeneratedFiles } from '@/domain/models/Component';
import { ITemplateEngine } from './ITemplateEngine';
import { IFileSystem } from '@/infrastructure/IFileSystem';

export class ComponentGenerator {
  constructor(
    private templateEngine: ITemplateEngine,
    private fileSystem: IFileSystem
  ) {}
  
  async generate(spec: ComponentSpec): Promise<GeneratedFiles> {
    const files: GeneratedFile[] = [];
    
    // Generate component file
    const componentContent = this.templateEngine.render('Component.tsx', {
      name: spec.name,
      props: spec.props,
      tokens: spec.tokens
    });
    files.push({
      path: `${spec.name}/${spec.name}.tsx`,
      content: componentContent
    });
    
    // Generate types file
    const typesContent = this.templateEngine.render('Component.types.ts', {
      name: spec.name,
      props: spec.props
    });
    files.push({
      path: `${spec.name}/${spec.name}.types.ts`,
      content: typesContent
    });
    
    // Generate test file
    const testContent = this.templateEngine.render('Component.test.tsx', {
      name: spec.name,
      props: spec.props
    });
    files.push({
      path: `${spec.name}/${spec.name}.test.tsx`,
      content: testContent
    });
    
    // Generate story file
    const storyContent = this.templateEngine.render('Component.stories.tsx', {
      name: spec.name,
      props: spec.props,
      variants: spec.variants
    });
    files.push({
      path: `${spec.name}/${spec.name}.stories.tsx`,
      content: storyContent
    });
    
    // Generate styles
    const styleContent = this.templateEngine.render('Component.module.css', {
      name: spec.name,
      tokens: spec.tokens
    });
    files.push({
      path: `${spec.name}/${spec.name}.module.css`,
      content: styleContent
    });
    
    // Write files to disk
    for (const file of files) {
      await this.fileSystem.writeFile(file.path, file.content);
    }
    
    return { files };
  }
  
  async validate(spec: ComponentSpec): Promise<ValidationResult> {
    const errors: string[] = [];
    
    // Validate name
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(spec.name)) {
      errors.push('Component name must be PascalCase');
    }
    
    // Validate props
    for (const prop of spec.props) {
      if (!/^[a-z][a-zA-Z0-9]*$/.test(prop.name)) {
        errors.push(`Invalid prop name: ${prop.name}`);
      }
    }
    
    // Validate tokens exist
    for (const tokenId of spec.tokens) {
      const token = await this.tokenRepository.getById(tokenId);
      if (!token) {
        errors.push(`Token not found: ${tokenId}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

### Example 3: Propagation Engine

```typescript
// src/core/propagation/PropagationEngine.ts
import { TokenChange, PropagationResult } from '@/domain/models/Token';
import { DependencyGraph } from './DependencyGraph';
import { CSSGenerator } from '@/core/tokens/CSSGenerator';

export class PropagationEngine {
  constructor(
    private dependencyGraph: DependencyGraph,
    private cssGenerator: CSSGenerator
  ) {}
  
  async propagateChanges(changes: TokenChange[]): Promise<PropagationResult> {
    const startTime = Date.now();
    const results: ActionResult[] = [];
    
    // Find affected components
    const affectedComponents = new Set<string>();
    for (const change of changes) {
      const dependents = await this.dependencyGraph.findDependents(change.tokenId);
      dependents.forEach(comp => affectedComponents.add(comp));
    }
    
    // Create action plan
    const actions: PropagationAction[] = [
      { type: 'regenerate-css', priority: 1 },
      ...Array.from(affectedComponents).map(comp => ({
        type: 'update-component' as const,
        target: comp,
        priority: 2
      })),
      ...Array.from(affectedComponents).map(comp => ({
        type: 'update-story' as const,
        target: comp,
        priority: 3
      }))
    ];
    
    // Execute actions
    for (const action of actions) {
      try {
        const result = await this.executeAction(action);
        results.push(result);
      } catch (error) {
        results.push({
          action,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      success: results.every(r => r.success),
      results,
      affectedComponents: Array.from(affectedComponents),
      duration: Date.now() - startTime
    };
  }
  
  private async executeAction(action: PropagationAction): Promise<ActionResult> {
    switch (action.type) {
      case 'regenerate-css':
        await this.cssGenerator.regenerateAll();
        return { action, success: true };
        
      case 'update-component':
        // Update component logic
        return { action, success: true };
        
      case 'update-story':
        // Update story logic
        return { action, success: true };
        
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }
}
```

---

## Testing Patterns

### Unit Test Example

```typescript
// tests/unit/core/tokens/TokenManager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenManager } from '@/core/tokens/TokenManager';
import { DesignToken } from '@/domain/models/Token';

describe('TokenManager', () => {
  let tokenManager: TokenManager;
  let mockRepository: any;
  let mockValidator: any;
  
  beforeEach(() => {
    mockRepository = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };
    
    mockValidator = {
      validate: vi.fn()
    };
    
    tokenManager = new TokenManager(mockRepository, mockValidator);
  });
  
  describe('createToken', () => {
    it('should create a valid token', async () => {
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
      
      mockValidator.validate.mockReturnValue({ valid: true, errors: [] });
      mockRepository.getById.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(token);
      
      const result = await tokenManager.createToken(token);
      
      expect(mockValidator.validate).toHaveBeenCalledWith(token);
      expect(mockRepository.create).toHaveBeenCalledWith(token);
      expect(result).toEqual(token);
    });
    
    it('should reject invalid token', async () => {
      const token: DesignToken = {
        $type: 'color',
        $value: 'invalid-color',
        $extensions: {
          'com.component-builder': {
            id: 'color.invalid',
            cssVariable: '--color-invalid',
            category: 'primitive'
          }
        }
      };
      
      mockValidator.validate.mockReturnValue({
        valid: false,
        errors: ['Invalid color format']
      });
      
      await expect(tokenManager.createToken(token))
        .rejects.toThrow('Invalid token: Invalid color format');
    });
    
    it('should prevent duplicate tokens', async () => {
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
      
      mockValidator.validate.mockReturnValue({ valid: true, errors: [] });
      mockRepository.getById.mockResolvedValue(token);
      
      await expect(tokenManager.createToken(token))
        .rejects.toThrow('Token already exists');
    });
  });
});
```

### Integration Test Example

```typescript
// tests/integration/component-generation.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentGenerator } from '@/core/components/ComponentGenerator';
import { InMemoryFileSystem } from '@/infrastructure/InMemoryFileSystem';
import { HandlebarsTemplateEngine } from '@/core/components/HandlebarsTemplateEngine';

describe('Component Generation Integration', () => {
  let generator: ComponentGenerator;
  let fileSystem: InMemoryFileSystem;
  
  beforeEach(() => {
    fileSystem = new InMemoryFileSystem();
    const templateEngine = new HandlebarsTemplateEngine();
    generator = new ComponentGenerator(templateEngine, fileSystem);
  });
  
  it('should generate complete component structure', async () => {
    const spec = {
      name: 'TestButton',
      type: 'primitive' as const,
      props: [
        {
          name: 'variant',
          type: 'string',
          required: false,
          defaultValue: 'primary'
        }
      ],
      tokens: ['button.background'],
      version: '1.0.0'
    };
    
    const result = await generator.generate(spec);
    
    // Verify all files created
    expect(result.files).toHaveLength(5);
    expect(result.files.map(f => f.path)).toContain('TestButton/TestButton.tsx');
    expect(result.files.map(f => f.path)).toContain('TestButton/TestButton.test.tsx');
    expect(result.files.map(f => f.path)).toContain('TestButton/TestButton.stories.tsx');
    
    // Verify component content
    const componentFile = result.files.find(f => f.path.endsWith('.tsx'));
    expect(componentFile?.content).toContain('export const TestButton');
    expect(componentFile?.content).toContain("variant = 'primary'");
  });
});
```

### E2E Test Example

```typescript
// tests/e2e/extension.test.ts
import * as vscode from 'vscode';
import * as path from 'path';
import { describe, it, expect, beforeAll } from 'vitest';

describe('Extension E2E Tests', () => {
  let workspaceUri: vscode.Uri;
  
  beforeAll(async () => {
    // Create test workspace
    workspaceUri = vscode.Uri.file(path.join(__dirname, '../fixtures/test-workspace'));
    await vscode.commands.executeCommand('vscode.openFolder', workspaceUri);
  });
  
  it('should initialize component library', async () => {
    await vscode.commands.executeCommand('component-builder.library.init');
    
    // Verify directory structure
    const tokensUri = vscode.Uri.joinPath(workspaceUri, 'tokens');
    const stat = await vscode.workspace.fs.stat(tokensUri);
    expect(stat.type).toBe(vscode.FileType.Directory);
    
    // Verify config file
    const configUri = vscode.Uri.joinPath(workspaceUri, 'component-builder.json');
    const content = await vscode.workspace.fs.readFile(configUri);
    const config = JSON.parse(Buffer.from(content).toString());
    
    expect(config).toHaveProperty('version');
    expect(config).toHaveProperty('tokens');
  });
  
  it('should create token and generate CSS', async () => {
    const token = {
      $type: 'color',
      $value: '#3b82f6',
      $extensions: {
        'com.component-builder': {
          id: 'color.test',
          cssVariable: '--color-test',
          category: 'primitive'
        }
      }
    };
    
    await vscode.commands.executeCommand('component-builder.tokens.create', token);
    
    // Verify token file
    const tokenFile = vscode.Uri.joinPath(workspaceUri, 'tokens/primitives/colors.json');
    const content = await vscode.workspace.fs.readFile(tokenFile);
    const tokens = JSON.parse(Buffer.from(content).toString());
    
    expect(tokens).toContainEqual(expect.objectContaining({
      $type: 'color',
      $value: '#3b82f6'
    }));
    
    // Verify CSS generated
    const cssFile = vscode.Uri.joinPath(workspaceUri, 'dist/tokens.css');
    const cssContent = await vscode.workspace.fs.readFile(cssFile);
    const css = Buffer.from(cssContent).toString();
    
    expect(css).toContain('--color-test: #3b82f6');
  });
});
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Extension Not Activating

**Symptoms:**
- Extension commands not available in command palette
- No status bar items visible

**Diagnosis:**
```bash
# Check extension logs
code --list-extensions --show-versions | grep component-builder

# Check for activation errors
cat ~/.vscode/extensions/logs/*/extension.log
```

**Solutions:**
1. Verify `activationEvents` in package.json
2. Check for errors in `extension.ts` activate function
3. Ensure all dependencies are installed: `pnpm install`
4. Reload window: `Developer: Reload Window`

#### Issue 2: Token Validation Failing

**Symptoms:**
- Valid tokens rejected
- Error: "Invalid token format"

**Diagnosis:**
```typescript
// Add debug logging
console.log('Token being validated:', JSON.stringify(token, null, 2));
console.log('Validation result:', validator.validate(token));
```

**Solutions:**
1. Check token follows W3C format
2. Verify all required fields present
3. Check extensions object structure
4. Ensure CSS variable name format is correct (`--kebab-case`)

#### Issue 3: Component Generation Fails

**Symptoms:**
- Error: "Template not found"
- Generated files incomplete

**Diagnosis:**
```typescript
// Check template engine
console.log('Registered templates:', templateEngine.listTemplates());
console.log('Template path:', templatePath);
```

**Solutions:**
1. Verify template files exist in `src/templates/`
2. Check template registration in TemplateEngine
3. Ensure Handlebars helpers registered
4. Validate ComponentSpec against schema

#### Issue 4: Change Propagation Not Working

**Symptoms:**
- CSS not regenerating
- Components not updating

**Diagnosis:**
```typescript
// Check dependency graph
const dependents = await dependencyGraph.findDependents(tokenId);
console.log('Dependent components:', dependents);
```

**Solutions:**
1. Verify dependency graph is up to date
2. Check token ID references in components
3. Ensure propagation engine is registered as observer
4. Check file permissions for writing generated files

### Debug Configuration

**launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/dist/**/*.js"
      ],
      "preLaunchTask": "npm: watch"
    },
    {
      "name": "Extension Tests",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/dist/tests"
      ],
      "outFiles": [
        "${workspaceFolder}/dist/**/*.js"
      ],
      "preLaunchTask": "npm: test-compile"
    }
  ]
}
```

### Logging Best Practices

```typescript
// Use different log levels
import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel('Component Builder');

// Info
outputChannel.appendLine('[INFO] Token created: ' + tokenId);

// Warning
outputChannel.appendLine('[WARN] Token deprecated: ' + tokenId);

// Error
outputChannel.appendLine('[ERROR] Failed to create token: ' + error.message);

// Debug (only in development)
if (process.env.NODE_ENV === 'development') {
  outputChannel.appendLine('[DEBUG] Token data: ' + JSON.stringify(token));
}
```

---

## Quick Reference

### Key Commands

```bash
# Install dependencies
pnpm install

# Build extension
pnpm run build

# Watch mode (development)
pnpm run watch

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Lint code
pnpm run lint

# Format code
pnpm run format

# Type check
pnpm run type-check

# Package extension
pnpm run package

# Publish to marketplace
pnpm run publish
```

### Important File Locations

```
Configuration:
  - package.json              Extension manifest
  - tsconfig.json            TypeScript config
  - vitest.config.ts         Test config

Entry Points:
  - src/extension/extension.ts    Extension activation
  - src/ui/index.tsx              Webview entry

Templates:
  - src/templates/component/      Component templates
  - src/templates/styles/         Style templates

Schemas:
  - src/domain/schemas/           Zod schemas

Tests:
  - tests/unit/                   Unit tests
  - tests/integration/            Integration tests
  - tests/e2e/                    E2E tests
```

### VS Code API References

**Common APIs:**
```typescript
// Commands
vscode.commands.registerCommand('id', callback);
vscode.commands.executeCommand('id', ...args);

// Workspace
vscode.workspace.workspaceFolders;
vscode.workspace.fs.readFile(uri);
vscode.workspace.fs.writeFile(uri, content);

// Window
vscode.window.showInformationMessage('message');
vscode.window.showErrorMessage('error');
vscode.window.createWebviewPanel(...);

// Configuration
vscode.workspace.getConfiguration('componentBuilder');
```

---

## Additional Resources

### Documentation
- [Technical Design Document](./component-builder-tdd.md) - Complete system specification
- [VS Code Extension API](https://code.visualstudio.com/api) - Official VS Code docs
- [W3C Design Tokens](https://design-tokens.github.io/community-group/format/) - Token specification

### Code Examples
- See `tests/` directory for comprehensive examples
- Check `src/templates/` for Handlebars template patterns
- Review `src/core/` for business logic patterns

### Getting Help
1. Check this CLAUDE.md file first
2. Review the Technical Design Document
3. Check existing tests for usage examples
4. Search GitHub issues (when published)
5. Ask in team chat/discussions

---

## AI Assistant Guidelines

### When Helping with This Project

**DO:**
- ✅ Follow the established patterns in existing code
- ✅ Use TypeScript strict mode (no `any` types)
- ✅ Write comprehensive tests for new features
- ✅ Update relevant documentation
- ✅ Use dependency injection
- ✅ Follow single responsibility principle
- ✅ Add JSDoc comments for public APIs

**DON'T:**
- ❌ Create circular dependencies
- ❌ Use `any` type without justification
- ❌ Skip error handling
- ❌ Ignore existing abstractions
- ❌ Add dependencies without discussion
- ❌ Bypass validation layers
- ❌ Create tightly coupled components

### Code Generation Checklist

When generating code for this project, ensure:
- [ ] TypeScript types are explicit and correct
- [ ] Proper error handling is included
- [ ] Dependencies are injected via constructor
- [ ] Unit tests are provided
- [ ] JSDoc comments for public APIs
- [ ] Follows existing file structure
- [ ] Uses established patterns
- [ ] No security vulnerabilities (input validation, sanitization)

---

**Last Updated:** 2026-01-29
**Version:** 1.0.0
