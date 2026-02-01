/**
 * Component Generator
 * Generates React components from specifications using templates
 */

import { ComponentSpec } from '@/types/component';
import { SimpleTemplateEngine } from './template-engine';

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GeneratedFiles {
  files: GeneratedFile[];
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface IComponentGenerator {
  generate(spec: ComponentSpec): Promise<GeneratedFiles>;
  validate(spec: ComponentSpec): ValidationResult;
}

export class ComponentGenerator implements IComponentGenerator {
  constructor(private templateEngine: SimpleTemplateEngine) {}

  /**
   * Validate a component specification
   */
  validate(spec: ComponentSpec): ValidationResult {
    const errors: string[] = [];

    // Validate component name
    if (!spec.name) {
      errors.push('Component name is required');
    } else if (!/^[A-Z][a-zA-Z0-9]*$/.test(spec.name)) {
      errors.push('Component name must be PascalCase (e.g., Button, TextField)');
    }

    // Validate component type
    if (!spec.type) {
      errors.push('Component type is required');
    } else if (!['primitive', 'composite', 'layout', 'utility'].includes(spec.type)) {
      errors.push('Component type must be one of: primitive, composite, layout, utility');
    }

    // Validate props
    if (spec.props) {
      for (const prop of spec.props) {
        if (!prop.name) {
          errors.push('Prop name is required');
        } else if (!/^[a-z][a-zA-Z0-9]*$/.test(prop.name)) {
          errors.push(`Prop name '${prop.name}' must be camelCase (e.g., onClick, isDisabled)`);
        }

        if (!prop.type) {
          errors.push(`Prop '${prop.name}' must have a type`);
        }
      }
    }

    // Validate version
    if (!spec.version) {
      errors.push('Component version is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Generate all component files from a specification
   */
  async generate(spec: ComponentSpec): Promise<GeneratedFiles> {
    // Validate spec first
    const validation = this.validate(spec);
    if (!validation.valid) {
      throw new Error(
        `Invalid component specification: ${validation.errors?.join(', ')}`
      );
    }

    const files: GeneratedFile[] = [];

    // Generate component file
    const componentTemplate = this.templateEngine.getTemplate('Component.tsx.hbs');
    if (!componentTemplate) throw new Error('Component template not found');
    const componentContent = componentTemplate(spec);
    files.push({
      path: `/components/${spec.name}/${spec.name}.tsx`,
      content: componentContent,
    });

    // Generate types file
    const typesTemplate = this.templateEngine.getTemplate('Component.types.ts.hbs');
    if (!typesTemplate) throw new Error('Types template not found');
    const typesContent = typesTemplate(spec);
    files.push({
      path: `/components/${spec.name}/${spec.name}.types.ts`,
      content: typesContent,
    });

    // Generate styles file
    const stylesTemplate = this.templateEngine.getTemplate('Component.module.css.hbs');
    if (!stylesTemplate) throw new Error('Styles template not found');
    const stylesContent = stylesTemplate(spec);
    files.push({
      path: `/components/${spec.name}/${spec.name}.module.css`,
      content: stylesContent,
    });

    // Generate test file
    const testTemplate = this.templateEngine.getTemplate('Component.test.tsx.hbs');
    if (!testTemplate) throw new Error('Test template not found');
    const testContent = testTemplate(spec);
    files.push({
      path: `/components/${spec.name}/${spec.name}.test.tsx`,
      content: testContent,
    });

    // Generate story file
    const storyTemplate = this.templateEngine.getTemplate('Component.stories.tsx.hbs');
    if (!storyTemplate) throw new Error('Story template not found');
    const storyContent = storyTemplate(spec);
    files.push({
      path: `/components/${spec.name}/${spec.name}.stories.tsx`,
      content: storyContent,
    });

    // Generate index file
    const indexContent = `export { ${spec.name} } from './${spec.name}';\nexport type { ${spec.name}Props } from './${spec.name}.types';\n`;
    files.push({
      path: `/components/${spec.name}/index.ts`,
      content: indexContent,
    });

    return { files };
  }
}
