/**
 * Application Layer - Token Validator Interface
 */

import { DesignToken } from '../../domain/models';
import { ValidationResult, CircularReference } from '../../domain/validation';

export interface ITokenValidator {
  validate(token: DesignToken): ValidationResult;
  detectCircularReferences(tokens: DesignToken[]): CircularReference[];
}
