# Testing Strategy

## Testing Framework

- **Unit Tests**: Vitest for fast execution
- **Property-Based Tests**: fast-check for universal correctness properties
- **Integration Tests**: API and service integration tests
- **E2E Tests**: Playwright for full user flows

## Test Organization

### Frontend Tests (`apps/web/`)
- Component tests: `*.test.tsx` co-located with components
- Hook tests: `*.test.ts` in hooks directory
- Integration tests: `__tests__/integration/`

### Backend Tests (`apps/api/`)
- Route tests: `*.test.ts` co-located with routes
- Service tests: `*.test.ts` co-located with services
- Integration tests: `__tests__/integration/`

### Shared Package Tests (`packages/core/`)
- Unit tests: `*.test.ts` co-located with source
- Property tests for validation and generation logic

### E2E Tests
- Playwright tests in `apps/web/e2e/`
- Test complete user workflows
- Test across different browsers

## Property-Based Testing

Use fast-check for testing universal properties:
- Token validation rules
- CSS generation correctness
- Component generation consistency
- Template rendering
- File path sanitization

## Test Coverage

- Exclude: `node_modules/`, `dist/`, `**/*.test.ts`, `**/*.test.tsx`
- Target: 80%+ coverage for core business logic
- Test timeout: 10 seconds (30s for E2E)

## Testing Patterns

```typescript
// Property test (packages/core)
import { fc, test } from '@fast-check/vitest';

test.prop([fc.string(), fc.integer()])('property description', (str, num) => {
  // Test universal property
});

// Component test (apps/web)
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('TokenEditor', () => {
  it('should render token form', () => {
    render(<TokenEditor />);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });
});

// API test (apps/api)
import request from 'supertest';
import { app } from '../app';

describe('POST /api/tokens', () => {
  it('should create token', async () => {
    const response = await request(app)
      .post('/api/tokens')
      .send({ $type: 'color', $value: '#ff0000' });
    expect(response.status).toBe(201);
  });
});

// E2E test (apps/web/e2e)
import { test, expect } from '@playwright/test';

test('create and preview component', async ({ page }) => {
  await page.goto('/');
  await page.click('text=New Component');
  // ... test flow
});
```
