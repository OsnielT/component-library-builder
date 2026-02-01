/**
 * Simple Template Engine
 * Browser-compatible template engine using template functions
 */

export interface ITemplateEngine {
  render(template: string, context: unknown): string;
  loadTemplate(name: string): Promise<string>;
}

// Helper functions for templates
const helpers = {
  camelCase: (str: string): string => {
    if (typeof str !== 'string') return '';
    const words = str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(/[\s_-]+/)
      .filter(Boolean);
    
    return words
      .map((word, index) => {
        const lower = word.toLowerCase();
        return index === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join('');
  },

  pascalCase: (str: string): string => {
    if (typeof str !== 'string') return '';
    const words = str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(/[\s_-]+/)
      .filter(Boolean);
    
    return words
      .map((word) => {
        const lower = word.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join('');
  },

  kebabCase: (str: string): string => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  },

  snakeCase: (str: string): string => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  },
};

export class SimpleTemplateEngine implements ITemplateEngine {
  private templates: Map<string, string>;

  constructor() {
    this.templates = new Map();
  }

  /**
   * Render a template with the given context
   */
  render(template: string, context: unknown): string {
    try {
      // Create a function that has access to context and helpers
      const fn = new Function('context', 'helpers', `
        with(context) {
          return \`${template}\`;
        }
      `);
      return fn(context, helpers);
    } catch (error) {
      throw new Error(
        `Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Load a template by name
   */
  async loadTemplate(name: string): Promise<string> {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template not found: ${name}`);
    }
    return template;
  }

  /**
   * Store a template string
   */
  setTemplate(name: string, template: string): void {
    this.templates.set(name, template);
  }

  /**
   * Get a template string
   */
  getTemplate(name: string): string | undefined {
    return this.templates.get(name);
  }
}
