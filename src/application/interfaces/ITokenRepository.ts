/**
 * Application Layer - Token Repository Interface
 */

import { DesignToken } from '../../domain/models';

export interface ITokenRepository {
  getAll(): Promise<DesignToken[]>;
  getById(id: string): Promise<DesignToken | null>;
  getByCategory(category: string): Promise<DesignToken[]>;
  create(token: DesignToken): Promise<DesignToken>;
  update(id: string, token: Partial<DesignToken>): Promise<DesignToken>;
  delete(id: string): Promise<void>;
  replaceAll(tokens: DesignToken[]): Promise<void>;
}
