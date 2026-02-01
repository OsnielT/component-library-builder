/**
 * Component Generator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentGenerator } from './component-generator';
import { SimpleTemplateEngine } from './template-engine';
import { ComponentSpec } from '@/types/component';
import fs from 'fs';
import path from 'path';

describe('ComponentGenerator', () => {
  let generator: ComponentGenerator;
  let templateEngine: SimpleTemplateEngine;

  beforeEach(() => {
    templateEngine = new SimpleTemplateEngine();
    
    // Load actual templates from the templates directory
    const templatesDir = path.join(process.cwd(), 'lib', 'templates');
    const templateFiles = [
      'Component.tsx.hbs',
      'Component.types.ts.hbs',
      'Component.module.css.hbs',
      'Component.test.tsx.hbs',
      'Component.stories.tsx.hbs',
    ];

    for (const file of templateFiles) {
      const content = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
      templateEngine.setTemplate(file, content);
    }

    generator = new ComponentGenerator(templateEngine);
  });

  describe('validate', () => {
    it('should validate a valid component spec', () => {
      const spec: ComponentSpec = {
        name: 'Button',
        type: 'primitive',
        version: '1.0.0',
        props: [
          { name: 'label', type: 'string', required: true },
          { name: 'onClick', type: '() => void', required: false },
        ],
        tokens: [],
      };

      const result = generator.validate(spec);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject component with missing name', () => {
      const spec: ComponentSpec = {
        name: '',
        type: 'primitive',
        version: '1.0.0',
        props: [],
        tokens: [],
      };

      const result = generator.validate(spec);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Component name is required');
    });

    it('should reject component with non-PascalCase name', () => {
      const spec: ComponentSpec = {
        name: 'myButton',
        type: 'primitive',
        version: '1.0.0',
        props: [],
        tokens: [],
      };

      const result = generator.validate(spec);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Component name must be PascalCase (e.g., Button, TextField)');
    });

    it('should reject component with invalid type', () => {
      const spec: ComponentSpec = {
        name: 'Button',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: 'invalid' as any,
        version: '1.0.0',
        props: [],
        tokens: [],
      };

      const result = generator.validate(spec);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Component type must be one of: primitive, composite, layout, utility');
    });

    it('should reject component with non-camelCase prop name', () => {
      const spec: ComponentSpec = {
        name: 'Button',
        type: 'primitive',
        version: '1.0.0',
        props: [
          { name: 'OnClick', type: 'string', required: true },
        ],
        tokens: [],
      };

      const result = generator.validate(spec);
      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.includes('must be camelCase'))).toBe(true);
    });

    it('should reject prop without type', () => {
      const spec: ComponentSpec = {
        name: 'Button',
        type: 'primitive',
        version: '1.0.0',
        props: [
          { name: 'label', type: '', required: true },
        ],
        tokens: [],
      };

      const result = generator.validate(spec);
      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.includes('must have a type'))).toBe(true);
    });

    it('should reject component without version', () => {
      const spec: ComponentSpec = {
        name: 'Button',
        type: 'primitive',
        version: '',
        props: [],
        tokens: [],
      };

      const result = generator.validate(spec);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Component version is required');
    });
  });

  describe('generate', () => {
    it('should generate all component files', async () => {
      const spec: ComponentSpec = {
        name: 'Button',
        description: 'A button component',
        type: 'primitive',
        version: '1.0.0',
        props: [
          { name: 'label', type: 'string', required: true, description: 'Button label' },
          { name: 'onClick', type: '() => void', required: false },
        ],
        tokens: ['color.primary', 'spacing.md'],
      };

      const result = await generator.generate(spec);

      expect(result.files).toHaveLength(6);
      expect(result.files.map(f => f.path)).toEqual([
        '/Button/Button.tsx',
        '/Button/Button.types.ts',
        '/Button/Button.module.css',
        '/Button/Button.test.tsx',
        '/Button/Button.stories.tsx',
        '/Button/index.ts',
      ]);
    });

    it('should generate component file with correct structure', async () => {
      const spec: ComponentSpec = {
        name: 'Button',
        type: 'primitive',
        version: '1.0.0',
        props: [
          { name: 'label', type: 'string', required: true },
        ],
        tokens: [],
      };

      const result = await generator.generate(spec);
      const componentFile = result.files.find(f => f.path === '/Button/Button.tsx');

      expect(componentFile).toBeDefined();
      expect(componentFile!.content).toContain('import React from');
      expect(componentFile!.content).toContain('export const Button');
      expect(componentFile!.content).toContain('ButtonProps');
    });

    it('should generate types file with correct interface', async () => {
      const spec: ComponentSpec = {
        name: 'Button',
        type: 'primitive',
        version: '1.0.0',
        props: [
          { name: 'label', type: 'string', required: true },
          { name: 'disabled', type: 'boolean', required: false },
        ],
        tokens: [],
      };

      const result = await generator.generate(spec);
      const typesFile = result.files.find(f => f.path === '/Button/Button.types.ts');

      expect(typesFile).toBeDefined();
      expect(typesFile!.content).toContain('export interface ButtonProps');
      expect(typesFile!.content).toContain('label: string');
      expect(typesFile!.content).toContain('disabled?: boolean');
    });

    it('should generate index file with exports', async () => {
      const spec: ComponentSpec = {
        name: 'Button',
        type: 'primitive',
        version: '1.0.0',
        props: [],
        tokens: [],
      };

      const result = await generator.generate(spec);
      const indexFile = result.files.find(f => f.path === '/Button/index.ts');

      expect(indexFile).toBeDefined();
      expect(indexFile!.content).toContain("export { Button } from './Button'");
      expect(indexFile!.content).toContain("export type { ButtonProps } from './Button.types'");
    });

    it('should throw error for invalid spec', async () => {
      const spec: ComponentSpec = {
        name: 'button',
        type: 'primitive',
        version: '1.0.0',
        props: [],
        tokens: [],
      };

      await expect(generator.generate(spec)).rejects.toThrow('Invalid component specification');
    });

    it('should handle component with variants', async () => {
      const spec: ComponentSpec = {
        name: 'Button',
        type: 'primitive',
        version: '1.0.0',
        props: [
          { name: 'variant', type: 'string', required: false },
        ],
        tokens: [],
        variants: [
          { name: 'primary', props: { variant: 'primary' } },
          { name: 'secondary', props: { variant: 'secondary' } },
        ],
      };

      const result = await generator.generate(spec);
      const stylesFile = result.files.find(f => f.path === '/Button/Button.module.css');

      expect(stylesFile).toBeDefined();
      expect(stylesFile!.content).toContain('primary');
      expect(stylesFile!.content).toContain('secondary');
    });

    it('should handle component with custom styles', async () => {
      const spec: ComponentSpec = {
        name: 'Button',
        type: 'primitive',
        version: '1.0.0',
        props: [],
        tokens: [],
        customStyles: 'padding: 10px;\n  border-radius: 4px;',
      };

      const result = await generator.generate(spec);
      const stylesFile = result.files.find(f => f.path === '/Button/Button.module.css');

      expect(stylesFile).toBeDefined();
      expect(stylesFile!.content).toContain('padding: 10px');
      expect(stylesFile!.content).toContain('border-radius: 4px');
    });
  });
});
