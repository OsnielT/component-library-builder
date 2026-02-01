/**
 * CSS Variable Generator
 * Converts design tokens to CSS custom properties
 */

import type { DesignToken, TokenType } from '@/types';

export class CSSGenerator {
  constructor() {
    // Token resolver would be used here for resolving token references
  }

  /**
   * Generate CSS custom properties from tokens
   */
  generate(tokens: DesignToken[]): string {
    const tokenMap = new Map(tokens.map((t) => [this.getTokenId(t), t]));

    let css = ':root {\n';

    for (const token of tokens) {
      const cssVar = this.getCSSVariable(token);
      const value = token.$value;
      
      // Check if it's a reference
      if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        // Extract the referenced token ID
        const referencedId = value.slice(1, -1);
        const referencedToken = tokenMap.get(referencedId);
        
        if (referencedToken) {
          // Use CSS variable reference instead of resolving the value
          const referencedCssVar = this.getCSSVariable(referencedToken);
          css += `  ${cssVar}: var(${referencedCssVar});\n`;
        } else {
          // Reference not found - add a comment
          css += `  ${cssVar}: /* Reference not found: ${referencedId} */;\n`;
        }
      } else {
        // Direct value - format it
        const formattedValue = this.formatValue(token.$type, value);
        css += `  ${cssVar}: ${formattedValue};\n`;
      }
    }

    css += '}\n';
    return css;
  }

  private formatValue(type: TokenType, value: unknown): string {
    switch (type) {
      case 'color':
        return this.formatColor(value as string);
      case 'dimension':
        return String(value);
      case 'cubicBezier':
        return `cubic-bezier(${(value as number[]).join(', ')})`;
      case 'shadow':
        return this.formatShadow(value);
      default:
        return String(value);
    }
  }

  private formatColor(value: string): string {
    return value;
  }

  private formatShadow(value: unknown): string {
    if (typeof value === 'string') return value;
    // Format shadow object to CSS string if needed
    return String(value);
  }

  private getCSSVariable(token: DesignToken): string {
    return token.$extensions?.['com.component-builder']?.cssVariable || '';
  }

  private getTokenId(token: DesignToken): string {
    return token.$extensions?.['com.component-builder']?.id || '';
  }
}
