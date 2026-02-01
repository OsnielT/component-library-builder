/**
 * Token Resolver
 * Resolves token references to their final values
 */

import type { DesignToken } from '@/types';

export class TokenResolver {
  /**
   * Resolve a token's value, following references recursively
   */
  resolve(token: DesignToken, tokenMap: Map<string, DesignToken>): unknown {
    if (typeof token.$value !== 'string') {
      return token.$value;
    }

    // Check if value is a reference (e.g., "{colors.primary}")
    const refMatch = token.$value.match(/^\{(.+)\}$/);
    if (!refMatch) {
      return token.$value;
    }

    const referencedId = refMatch[1];
    const referencedToken = tokenMap.get(referencedId);

    if (!referencedToken) {
      // Return a fallback value instead of throwing
      console.warn(`Token reference not found: ${referencedId}`);
      return `/* Reference not found: ${referencedId} */`;
    }

    // Recursively resolve
    return this.resolve(referencedToken, tokenMap);
  }

  /**
   * Detect circular references in token dependencies
   */
  detectCircularReferences(tokens: DesignToken[]): string[][] {
    const graph = new Map<string, Set<string>>();
    const circles: string[][] = [];

    // Build dependency graph
    for (const token of tokens) {
      const id = this.getTokenId(token);
      const refs = this.extractReferences(token.$value);
      graph.set(id, new Set(refs));
    }

    // Detect cycles using DFS
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string, path: string[]): boolean => {
      visited.add(node);
      recStack.add(node);
      path.push(node);

      const neighbors = graph.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor, [...path])) {
            return true;
          }
        } else if (recStack.has(neighbor)) {
          circles.push([...path, neighbor]);
          return true;
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return circles;
  }

  private extractReferences(value: unknown): string[] {
    if (typeof value !== 'string') return [];
    const matches = value.match(/\{([^}]+)\}/g);
    return matches ? matches.map((m) => m.slice(1, -1)) : [];
  }

  private getTokenId(token: DesignToken): string {
    return token.$extensions?.['com.component-builder']?.id || '';
  }
}
