# Testing Strategy

## Testing Framework

- **Unit Tests**: Vitest for fast execution
- **Property-Based Tests**: fast-check for universal correctness properties
- **Integration Tests**: End-to-end workflow validation

## Test Organization

- Test files co-located with source: `*.test.ts`
- Property tests validate universal behaviors with 100+ iterations
- Unit tests validate specific examples and edge cases
- Integration tests validate complete workflows

## Property-Based Testing

Use fast-check for testing universal properties:
- Token validation rules
- Version bump correctness
- Dependency graph completeness
- Template rendering consistency
- Path normalization across platforms

## Test Coverage

- Exclude from coverage: `node_modules/`, `dist/`, `**/*.test.ts`, `src/webview/**`
- Target: Comprehensive coverage of domain and application layers
- Test timeout: 10 seconds

## Testing Patterns

```typescript
// Property test example
import { fc, test } from '@fast-check/vitest';

test.prop([fc.string(), fc.integer()])('property description', (str, num) => {
  // Test universal property
});

// Unit test example
import { describe, it, expect } from 'vitest';

describe('ComponentName', () => {
  it('should handle specific case', () => {
    // Test specific behavior
  });
});
```
