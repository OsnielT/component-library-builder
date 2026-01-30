/**
 * Tests for Design Token Types
 */

import { describe, it, expect } from 'vitest';
import type { DesignToken, TokenType } from './DesignToken';

describe('DesignToken', () => {
  it('should create a valid color token', () => {
    const token: DesignToken = {
      $type: 'color',
      $value: '#ff0000',
      $description: 'Primary color',
      $extensions: {
        'com.component-builder': {
          id: 'color.primary',
          cssVariable: '--color-primary',
          category: 'primitive',
        },
      },
    };

    expect(token.$type).toBe('color');
    expect(token.$value).toBe('#ff0000');
    expect(token.$extensions?.['com.component-builder'].id).toBe('color.primary');
  });

  it('should create a valid dimension token', () => {
    const token: DesignToken = {
      $type: 'dimension',
      $value: '16px',
      $extensions: {
        'com.component-builder': {
          id: 'spacing.md',
          cssVariable: '--spacing-md',
          category: 'primitive',
        },
      },
    };

    expect(token.$type).toBe('dimension');
    expect(token.$value).toBe('16px');
  });

  it('should support all W3C token types', () => {
    const validTypes: TokenType[] = [
      'color',
      'dimension',
      'fontFamily',
      'fontWeight',
      'fontSize',
      'lineHeight',
      'letterSpacing',
      'duration',
      'cubicBezier',
      'shadow',
      'border',
      'gradient',
    ];

    validTypes.forEach((type) => {
      const token: DesignToken = {
        $type: type,
        $value: 'test-value',
        $extensions: {
          'com.component-builder': {
            id: `test.${type}`,
            cssVariable: `--test-${type}`,
            category: 'primitive',
          },
        },
      };

      expect(token.$type).toBe(type);
    });
  });
});
