/**
 * Design Token Types
 * Following W3C Design Tokens Format
 */

export type TokenType =
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

export type TokenValue = string | number | number[];

export type TokenCategory = 'primitive' | 'semantic' | 'component';

export interface DesignToken {
  // W3C Standard Fields
  $type: TokenType;
  $value: TokenValue;
  $description?: string;

  // Custom Extensions
  $extensions?: {
    'com.component-builder': {
      id: string;
      cssVariable: string;
      category: TokenCategory;
      deprecated?: boolean;
      replacedBy?: string;
      scopes?: string[];
      metadata?: Record<string, unknown>;
    };
  };
}

export interface TokenReference {
  $type: 'reference';
  $value: string; // Token ID
}
