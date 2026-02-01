/**
 * Token Validator
 * Validates design tokens against W3C specifications
 */

import { z } from 'zod';
import type { DesignToken, ValidationResult } from '@/types';

const tokenSchema = z.object({
  $type: z.enum([
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
  ]),
  $value: z.union([z.string(), z.number(), z.array(z.number())]),
  $description: z.string().optional(),
  $extensions: z
    .object({
      'com.component-builder': z.object({
        id: z.string().regex(/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/),
        cssVariable: z.string().regex(/^--[a-z][a-z0-9-]*$/),
        category: z.enum(['primitive', 'semantic', 'component']),
        deprecated: z.boolean().optional(),
        replacedBy: z.string().optional(),
        scopes: z.array(z.string()).optional(),
        metadata: z.record(z.unknown()).optional(),
      }),
    })
    .optional(),
});

export class TokenValidator {
  validate(token: DesignToken): ValidationResult {
    // Schema validation
    const schemaResult = tokenSchema.safeParse(token);
    if (!schemaResult.success) {
      return {
        valid: false,
        errors: schemaResult.error.errors.map((e) => e.message),
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

    // Check if it's a reference to another token
    if (this.isReference(value)) {
      return this.validateReference(value);
    }

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

  private isReference(value: string): boolean {
    return value.startsWith('{') && value.endsWith('}');
  }

  private validateReference(value: string): ValidationResult {
    // Extract the token ID from the reference
    const tokenId = value.slice(1, -1);
    
    // Validate the token ID format
    const idPattern = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/;
    if (!idPattern.test(tokenId)) {
      return {
        valid: false,
        errors: ['Token reference must use valid token ID format (e.g., {color.primary})'],
      };
    }

    return { valid: true };
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
      errors: ['Color must be valid hex, rgb, or hsl format'],
    };
  }

  private validateDimension(value: string): ValidationResult {
    const pattern = /^-?\d+(\.\d+)?(px|rem|em|%)$/;
    if (pattern.test(value)) {
      return { valid: true };
    }

    return {
      valid: false,
      errors: ['Dimension must include valid CSS unit (px, rem, em, %)'],
    };
  }

  private validateFontWeight(value: number): ValidationResult {
    if (value >= 100 && value <= 900 && value % 100 === 0) {
      return { valid: true };
    }

    return {
      valid: false,
      errors: ['Font weight must be between 100-900 and divisible by 100'],
    };
  }
}
