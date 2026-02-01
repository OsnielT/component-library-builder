/**
 * Tests for SimpleTemplateEngine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SimpleTemplateEngine } from './template-engine';

describe('SimpleTemplateEngine', () => {
  let engine: SimpleTemplateEngine;

  beforeEach(() => {
    engine = new SimpleTemplateEngine();
  });

  describe('render()', () => {
    it('should render a simple template with context', () => {
      const template = 'Hello {{name}}!';
      const context = { name: 'World' };
      const result = engine.render(template, context);
      expect(result).toBe('Hello World!');
    });

    it('should render template with nested context', () => {
      const template = '{{user.firstName}} {{user.lastName}}';
      const context = { user: { firstName: 'John', lastName: 'Doe' } };
      const result = engine.render(template, context);
      expect(result).toBe('John Doe');
    });

    it('should render template with array iteration', () => {
      const template = '{{#each items}}{{this}} {{/each}}';
      const context = { items: ['a', 'b', 'c'] };
      const result = engine.render(template, context);
      expect(result).toBe('a b c ');
    });

    it('should render template with conditionals', () => {
      const template = '{{#if show}}Visible{{else}}Hidden{{/if}}';
      const context1 = { show: true };
      const context2 = { show: false };
      expect(engine.render(template, context1)).toBe('Visible');
      expect(engine.render(template, context2)).toBe('Hidden');
    });

    it('should throw error for invalid template syntax', () => {
      const template = '{{#if unclosed}}';
      const context = {};
      expect(() => engine.render(template, context)).toThrow('Template rendering failed');
    });
  });

  describe('camelCase helper', () => {
    it('should convert PascalCase to camelCase', () => {
      const template = '{{camelCase name}}';
      const context = { name: 'MyComponent' };
      const result = engine.render(template, context);
      expect(result).toBe('myComponent');
    });

    it('should convert kebab-case to camelCase', () => {
      const template = '{{camelCase name}}';
      const context = { name: 'my-component' };
      const result = engine.render(template, context);
      expect(result).toBe('myComponent');
    });

    it('should convert snake_case to camelCase', () => {
      const template = '{{camelCase name}}';
      const context = { name: 'my_component' };
      const result = engine.render(template, context);
      expect(result).toBe('myComponent');
    });

    it('should convert space-separated to camelCase', () => {
      const template = '{{camelCase name}}';
      const context = { name: 'my component name' };
      const result = engine.render(template, context);
      expect(result).toBe('myComponentName');
    });

    it('should handle empty string', () => {
      const template = '{{camelCase name}}';
      const context = { name: '' };
      const result = engine.render(template, context);
      expect(result).toBe('');
    });
  });

  describe('pascalCase helper', () => {
    it('should convert camelCase to PascalCase', () => {
      const template = '{{pascalCase name}}';
      const context = { name: 'myComponent' };
      const result = engine.render(template, context);
      expect(result).toBe('MyComponent');
    });

    it('should convert kebab-case to PascalCase', () => {
      const template = '{{pascalCase name}}';
      const context = { name: 'my-component' };
      const result = engine.render(template, context);
      expect(result).toBe('MyComponent');
    });

    it('should convert snake_case to PascalCase', () => {
      const template = '{{pascalCase name}}';
      const context = { name: 'my_component' };
      const result = engine.render(template, context);
      expect(result).toBe('MyComponent');
    });

    it('should convert space-separated to PascalCase', () => {
      const template = '{{pascalCase name}}';
      const context = { name: 'my component name' };
      const result = engine.render(template, context);
      expect(result).toBe('MyComponentName');
    });
  });

  describe('kebabCase helper', () => {
    it('should convert PascalCase to kebab-case', () => {
      const template = '{{kebabCase name}}';
      const context = { name: 'MyComponent' };
      const result = engine.render(template, context);
      expect(result).toBe('my-component');
    });

    it('should convert camelCase to kebab-case', () => {
      const template = '{{kebabCase name}}';
      const context = { name: 'myComponent' };
      const result = engine.render(template, context);
      expect(result).toBe('my-component');
    });

    it('should convert snake_case to kebab-case', () => {
      const template = '{{kebabCase name}}';
      const context = { name: 'my_component' };
      const result = engine.render(template, context);
      expect(result).toBe('my-component');
    });

    it('should convert space-separated to kebab-case', () => {
      const template = '{{kebabCase name}}';
      const context = { name: 'my component name' };
      const result = engine.render(template, context);
      expect(result).toBe('my-component-name');
    });
  });

  describe('json helper', () => {
    it('should stringify simple object', () => {
      const template = '{{json data}}';
      const context = { data: { name: 'test', value: 42 } };
      const result = engine.render(template, context);
      expect(result).toBe('{\n  "name": "test",\n  "value": 42\n}');
    });

    it('should stringify array', () => {
      const template = '{{json items}}';
      const context = { items: [1, 2, 3] };
      const result = engine.render(template, context);
      expect(result).toBe('[\n  1,\n  2,\n  3\n]');
    });

    it('should stringify nested object', () => {
      const template = '{{json config}}';
      const context = {
        config: {
          user: { name: 'John' },
          settings: { theme: 'dark' },
        },
      };
      const result = engine.render(template, context);
      expect(result).toContain('"user"');
      expect(result).toContain('"name": "John"');
      expect(result).toContain('"settings"');
    });
  });

  describe('registerHelper()', () => {
    it('should register custom helper', () => {
      engine.registerHelper('uppercase', (str: string) => str.toUpperCase());
      const template = '{{uppercase text}}';
      const context = { text: 'hello' };
      const result = engine.render(template, context);
      expect(result).toBe('HELLO');
    });

    it('should allow multiple custom helpers', () => {
      engine.registerHelper('double', (num: number) => num * 2);
      engine.registerHelper('triple', (num: number) => num * 3);
      const template = '{{double value}} {{triple value}}';
      const context = { value: 5 };
      const result = engine.render(template, context);
      expect(result).toBe('10 15');
    });
  });

  describe('loadTemplate()', () => {
    it('should load stored template', async () => {
      const templateContent = 'Hello {{name}}!';
      engine.setTemplate('greeting', templateContent);
      const loaded = await engine.loadTemplate('greeting');
      expect(loaded).toBe(templateContent);
    });

    it('should throw error for non-existent template', async () => {
      await expect(engine.loadTemplate('non-existent')).rejects.toThrow(
        'Template not found: non-existent'
      );
    });

    it('should load and render template', async () => {
      const templateContent = 'Component: {{name}}';
      engine.setTemplate('component', templateContent);
      const loaded = await engine.loadTemplate('component');
      const result = engine.render(loaded, { name: 'Button' });
      expect(result).toBe('Component: Button');
    });
  });

  describe('complex template scenarios', () => {
    it('should render component template with multiple helpers', () => {
      const template = `
export interface {{pascalCase name}}Props {
  {{#each props}}
  {{camelCase name}}: {{type}};
  {{/each}}
}

export const {{pascalCase name}} = () => {
  return <div className="{{kebabCase name}}">{{pascalCase name}}</div>;
};
      `.trim();

      const context = {
        name: 'my-button',
        props: [
          { name: 'onClick', type: 'Function' },
          { name: 'is-disabled', type: 'boolean' },
        ],
      };

      const result = engine.render(template, context);
      expect(result).toContain('export interface MyButtonProps');
      expect(result).toContain('onClick: Function;');
      expect(result).toContain('isDisabled: boolean;');
      expect(result).toContain('export const MyButton');
      expect(result).toContain('className="my-button"');
    });

    it('should handle template with json helper for config', () => {
      const template = `
const config = {{json config}};
      `.trim();

      const context = {
        config: {
          name: 'Button',
          version: '1.0.0',
          props: ['onClick', 'disabled'],
        },
      };

      const result = engine.render(template, context);
      expect(result).toContain('"name": "Button"');
      expect(result).toContain('"version": "1.0.0"');
      expect(result).toContain('"props"');
    });
  });
});
