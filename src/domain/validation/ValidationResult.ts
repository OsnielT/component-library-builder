/**
 * Domain Validation - Validation Result Types
 */

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface CircularReference {
  cycle: string[];
}
