import { describe, it, expect } from 'vitest';
import { TokenValidator } from './token-validator';
import type { DesignToken } from '@/types';

describe('TokenValidator', () => {
  const validator = new TokenValidator();

  describe('color validation', () => {
    it('should accept valid hex color', () => {
      const token: DesignToken = {
        $type: 'color',
        $value: '#ff0000',
        $extensions: {
          'com.component-builder': {
            id: 'color.primary',
            cssVariable: '--color-primary',
            category: 'primitive',
          },
        },
      };

      const result = validator.validate(token);
      expect(result.valid).toBe(true);
    });

    it('should accept valid rgb color', () => {
      const token: DesignToken = {
        $type: 'color',
        $value: 'rgb(255, 0, 0)',
        $extensions: {
          'com.component-builder': {
            id: 'color.primary',
            cssVariable: '--color-primary',
            category: 'primitive',
          },
        },
      };

      const result = validator.validate(token);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid color format', () => {
      const token: DesignToken = {
        $type: 'color',
        $value: 'not-a-color',
        $extensions: {
          'com.component-builder': {
            id: 'color.primary',
            cssVariable: '--color-primary',
            category: 'primitive',
          },
        },
      };

      const result = validator.validate(token);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Color must be valid hex, rgb, or hsl format');
    });
  });

  describe('dimension validation', () => {
    it('should accept valid dimension with px', () => {
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

      const result = validator.validate(token);
      expect(result.valid).toBe(true);
    });

    it('should accept valid dimension with rem', () => {
      const token: DesignToken = {
        $type: 'dimension',
        $value: '1.5rem',
        $extensions: {
          'com.component-builder': {
            id: 'spacing.md',
            cssVariable: '--spacing-md',
            category: 'primitive',
          },
        },
      };

      const result = validator.validate(token);
      expect(result.valid).toBe(true);
    });

    it('should reject dimension without unit', () => {
      const token: DesignToken = {
        $type: 'dimension',
        $value: '16',
        $extensions: {
          'com.component-builder': {
            id: 'spacing.md',
            cssVariable: '--spacing-md',
            category: 'primitive',
          },
        },
      };

      const result = validator.validate(token);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Dimension must include valid CSS unit (px, rem, em, %)');
    });
  });

  describe('font weight validation', () => {
    it('should accept valid font weight', () => {
      const token: DesignToken = {
        $type: 'fontWeight',
        $value: 400,
        $extensions: {
          'com.component-builder': {
            id: 'font.weight.normal',
            cssVariable: '--font-weight-normal',
            category: 'primitive',
          },
        },
      };

      const result = validator.validate(token);
      expect(result.valid).toBe(true);
    });

    it('should reject font weight not divisible by 100', () => {
      const token: DesignToken = {
        $type: 'fontWeight',
        $value: 450,
        $extensions: {
          'com.component-builder': {
            id: 'font.weight.custom',
            cssVariable: '--font-weight-custom',
            category: 'primitive',
          },
        },
      };

      const result = validator.validate(token);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Font weight must be between 100-900 and divisible by 100');
    });

    it('should reject font weight out of range', () => {
      const token: DesignToken = {
        $type: 'fontWeight',
        $value: 1000,
        $extensions: {
          'com.component-builder': {
            id: 'font.weight.heavy',
            cssVariable: '--font-weight-heavy',
            category: 'primitive',
          },
        },
      };

      const result = validator.validate(token);
      expect(result.valid).toBe(false);
    });
  });

  describe('schema validation', () => {
    it('should reject invalid token ID format', () => {
      const token: DesignToken = {
        $type: 'color',
        $value: '#ff0000',
        $extensions: {
          'com.component-builder': {
            id: 'Color.Primary', // Invalid: should be lowercase
            cssVariable: '--color-primary',
            category: 'primitive',
          },
        },
      };

      const result = validator.validate(token);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid CSS variable format', () => {
      const token: DesignToken = {
        $type: 'color',
        $value: '#ff0000',
        $extensions: {
          'com.component-builder': {
            id: 'color.primary',
            cssVariable: 'color-primary', // Invalid: missing --
            category: 'primitive',
          },
        },
      };

      const result = validator.validate(token);
      expect(result.valid).toBe(false);
    });
  });
});
