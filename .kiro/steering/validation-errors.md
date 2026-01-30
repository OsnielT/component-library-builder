# Validation and Error Handling

## Validation Strategy

### Zod Schemas
- Use Zod for runtime type validation
- Define schemas for all domain models
- Validate at system boundaries (user input, file I/O)

### Token Validation Rules

**Color tokens:**
- Valid formats: hex (`#rrggbb`), rgb (`rgb(...)`), hsl (`hsl(...)`)
- Case-insensitive hex validation

**Dimension tokens:**
- Must include CSS unit: `px`, `rem`, `em`, `%`
- Pattern: `-?\d+(\.\d+)?(px|rem|em|%)`

**Font weight tokens:**
- Range: 100-900
- Must be divisible by 100

**Token IDs:**
- Pattern: `^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$`
- Dot notation for hierarchy (e.g., `color.primary.500`)

**CSS variables:**
- Pattern: `^--[a-z][a-z0-9-]*$`
- Must start with `--`
- Kebab-case only

### Circular Reference Detection
- Use DFS (Depth-First Search) algorithm
- Track visited nodes and recursion stack
- Return cycle path for debugging

## Error Handling

### Custom Error Classes

```typescript
// Validation errors with field-level details
class ValidationError extends Error {
  constructor(public errors: string[]) {}
}

// File system operation errors
class FileSystemError extends Error {
  constructor(public operation: string, public path: string) {}
}

// External integration errors
class IntegrationError extends Error {
  constructor(public service: string, public operation: string) {}
}
```

### Error Recovery Patterns

**Atomic operations:**
- Write to temp file first
- Rename on success
- Rollback on failure

**Retry with backoff:**
- Retry transient failures (network, file locks)
- Exponential backoff: 100ms, 200ms, 400ms
- Max 3 attempts

**Graceful degradation:**
- Continue with reduced functionality on non-critical failures
- Log errors to VS Code output channel
- Preserve user data before failing

### Error Messages

- Clear description of what went wrong
- Actionable steps to resolve
- Highlight specific field/value that failed validation
- Include links to documentation when relevant

## Validation Result Pattern

```typescript
interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}
```

Return validation results instead of throwing for non-critical issues. Throw only for critical failures that prevent operation.
