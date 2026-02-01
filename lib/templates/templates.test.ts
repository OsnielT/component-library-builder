import { describe, it, expect, beforeEach } from 'vitest';
import { SimpleTemplateEngine } from '../core/template-engine';
import { ComponentSpec } from '../../types/component';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Component Templates', () => {
  let engine: SimpleTemplateEngine;
  let mockSpec: ComponentSpec;

  beforeEach(() => {
    engine = new SimpleTemplateEngine();
    
    // Load templates from files
    const templatesDir = join(__dirname);
    engine.setTemplate('Component.tsx.hbs', readFileSync(join(templatesDir, 'Component.tsx.hbs'), 'utf-8'));
    engine.setTemplate('Component.types.ts.hbs', readFileSync(join(templatesDir, 'Component.types.ts.hbs'), 'utf-8'));
    engine.setTemplate('Component.module.css.hbs', readFileSync(join(templatesDir, 'Component.module.css.hbs'), 'utf-8'));
    engine.setTemplate('Component.test.tsx.hbs', readFileSync(join(templatesDir, 'Component.test.tsx.hbs'), 'utf-8'));
    engine.setTemplate('Component.stories.tsx.hbs', readFileSync(join(templatesDir, 'Component.stories.tsx.hbs'), 'utf-8'));

    mockSpec = {
      name: 'Button',
      description: 'A reusable button component',
      version: '1.0.0',
      type: 'primitive',
      props: [
        {
          name: 'label',
          type: 'string',
          required: true,
          description: 'Button label text',
        },
        {
          name: 'disabled',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Whether the button is disabled',
        },
      ],
      tokens: ['color.primary', 'spacing.md'],
      customStyles: 'border-radius: 4px;',
      variants: [
        {
          name: 'primary',
          props: { variant: 'primary' },
          tokens: { background: 'color.primary' },
        },
      ],
    };
  });

  describe('Component.tsx.hbs', () => {
    it('should generate valid React component', async () => {
      const template = await engine.loadTemplate('Component.tsx.hbs');
      const result = engine.render(template, mockSpec);

      expect(result).toContain('import React from');
      expect(result).toContain('import { ButtonProps }');
      expect(result).toContain('import styles from');
      expect(result).toContain('export const Button: React.FC<ButtonProps>');
      expect(result).toContain('A reusable button component');
      expect(result).toContain('label');
      expect(result).toContain('disabled = false');
    });
  });

  describe('Component.types.ts.hbs', () => {
    it('should generate TypeScript interface', async () => {
      const template = await engine.loadTemplate('Component.types.ts.hbs');
      const result = engine.render(template, mockSpec);

      expect(result).toContain('export interface ButtonProps');
      expect(result).toContain('extends React.HTMLAttributes<HTMLDivElement>');
      expect(result).toContain('label: string');
      expect(result).toContain('disabled?: boolean');
      expect(result).toContain('Button label text');
      expect(result).toContain('Whether the button is disabled');
    });
  });

  describe('Component.module.css.hbs', () => {
    it('should generate CSS module', async () => {
      const template = await engine.loadTemplate('Component.module.css.hbs');
      const result = engine.render(template, mockSpec);

      expect(result).toContain('.button {');
      expect(result).toContain('color.primary');
      expect(result).toContain('spacing.md');
      expect(result).toContain('border-radius: 4px;');
      expect(result).toContain('.button--primary');
    });
  });

  describe('Component.test.tsx.hbs', () => {
    it('should generate test file', async () => {
      const template = await engine.loadTemplate('Component.test.tsx.hbs');
      const result = engine.render(template, mockSpec);

      expect(result).toContain("import { describe, it, expect } from 'vitest'");
      expect(result).toContain("import { render, screen } from '@testing-library/react'");
      expect(result).toContain("import { Button } from './Button'");
      expect(result).toContain("describe('Button'");
      expect(result).toContain('should render successfully');
      expect(result).toContain('should handle label prop');
      expect(result).toContain('should handle disabled prop');
      expect(result).toContain('should render primary variant');
    });
  });

  describe('Component.stories.tsx.hbs', () => {
    it('should generate Storybook story', async () => {
      const template = await engine.loadTemplate('Component.stories.tsx.hbs');
      const result = engine.render(template, mockSpec);

      expect(result).toContain("import type { Meta, StoryObj } from '@storybook/react'");
      expect(result).toContain("import { Button } from './Button'");
      expect(result).toContain('const meta: Meta<typeof Button>');
      expect(result).toContain("title: 'Components/Button'");
      expect(result).toContain("tags: ['autodocs']");
      expect(result).toContain('export const Default: Story');
      expect(result).toContain('export const Primary: Story');
      expect(result).toContain("control: 'boolean'");
      expect(result).toContain("control: 'text'");
    });
  });
});
