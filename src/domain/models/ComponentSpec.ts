/**
 * Domain Models - Component Specification
 *
 * This module defines the component specification types.
 */

export type ComponentType = 'primitive' | 'composite' | 'layout' | 'utility';

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: unknown;
  description?: string;
}

export interface VariantConfig {
  name: string;
  props: Record<string, unknown>;
  tokens?: Record<string, string>;
}

export interface ComponentSpec {
  name: string;
  description?: string;
  version: string;
  type: ComponentType;
  props: PropDefinition[];
  tokens: string[];
  customStyles?: string;
  variants?: VariantConfig[];
}
