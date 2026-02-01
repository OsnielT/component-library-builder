/**
 * Project and File System Types
 */

import type { DesignToken } from './token';
import type { ComponentSpec } from './component';

export interface Project {
  id: string;
  name: string;
  description?: string;
  files: Record<string, string>;
  tokens: DesignToken[];
  components: ComponentSpec[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export type FileTree = FileNode[];

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}
