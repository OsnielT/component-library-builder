/**
 * Template Loader
 * Loads template functions into the template engine
 */

import { SimpleTemplateEngine } from './template-engine';
import type { ComponentSpec } from '@/types';

// Template functions using template literals
const componentTemplate = (spec: ComponentSpec) => {
  const { name, description, props } = spec;
  const kebabName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  
  const propDestructuring = props.map(p => {
    if (p.defaultValue !== undefined) {
      const defaultVal = typeof p.defaultValue === 'string' 
        ? `'${p.defaultValue}'` 
        : JSON.stringify(p.defaultValue);
      return `${p.name} = ${defaultVal}`;
    }
    return p.name;
  }).join(',\n  ');

  return `import React from 'react';
import { ${name}Props } from './${name}.types';
import styles from './${name}.module.css';

/**
 * ${description || `${name} component`}
 */
export const ${name}: React.FC<${name}Props> = ({
  ${propDestructuring}${props.length > 0 ? ',' : ''}
  className,
  ...rest
}) => {
  return (
    <div className={\`\${styles['${kebabName}']} \${className || ''}\`} {...rest}>
      {/* Component implementation */}
    </div>
  );
};
`;
};

const typesTemplate = (spec: ComponentSpec) => {
  const { name, description, props } = spec;
  
  const propsCode = props.map(p => {
    const optional = p.required ? '' : '?';
    return `  /**
   * ${p.description || `${p.name} prop`}
   */
  ${p.name}${optional}: ${p.type};`;
  }).join('\n');

  return `import React from 'react';

/**
 * Props for the ${name} component
 * ${description || ''}
 */
export interface ${name}Props extends React.HTMLAttributes<HTMLDivElement> {
${propsCode}
}
`;
};

const stylesTemplate = (spec: ComponentSpec) => {
  const { name, tokens, variants, customStyles } = spec;
  const kebabName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  
  let css = `.${kebabName} {\n`;
  
  // Apply selected tokens as CSS properties
  if (tokens && tokens.length > 0) {
    tokens.forEach(token => {
      // Convert token ID to CSS variable reference
      // e.g., "color.primary" -> var(--color-primary)
      const cssVarName = `--${token.replace(/\./g, '-')}`;
      
      // Infer CSS property from token name
      if (token.includes('color')) {
        css += `  color: var(${cssVarName});\n`;
      } else if (token.includes('background')) {
        css += `  background-color: var(${cssVarName});\n`;
      } else if (token.includes('border')) {
        css += `  border-color: var(${cssVarName});\n`;
      } else if (token.includes('spacing') || token.includes('padding')) {
        css += `  padding: var(${cssVarName});\n`;
      } else if (token.includes('margin')) {
        css += `  margin: var(${cssVarName});\n`;
      } else if (token.includes('font.size')) {
        css += `  font-size: var(${cssVarName});\n`;
      } else if (token.includes('font.weight')) {
        css += `  font-weight: var(${cssVarName});\n`;
      } else if (token.includes('font.family')) {
        css += `  font-family: var(${cssVarName});\n`;
      } else if (token.includes('radius')) {
        css += `  border-radius: var(${cssVarName});\n`;
      } else if (token.includes('shadow')) {
        css += `  box-shadow: var(${cssVarName});\n`;
      } else {
        // Generic fallback - add as comment for manual mapping
        css += `  /* TODO: Apply token var(${cssVarName}) */\n`;
      }
    });
  }
  
  if (customStyles) {
    css += `  ${customStyles}\n`;
  }
  css += `}\n`;

  if (variants && variants.length > 0) {
    variants.forEach(variant => {
      const variantKebab = variant.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      css += `\n.${kebabName}--${variantKebab} {\n`;
      if (variant.tokens) {
        Object.entries(variant.tokens).forEach(([key]) => {
          const cssVarName = `--${key.replace(/\./g, '-')}`;
          css += `  /* Override: ${key} */\n`;
          css += `  ${key}: var(${cssVarName});\n`;
        });
      }
      css += `}\n`;
    });
  }

  return css;
};

const testTemplate = (spec: ComponentSpec) => {
  const { name, props, variants } = spec;
  
  const requiredProps = props.filter(p => p.required);
  const requiredPropsCode = requiredProps.map(p => {
    if (p.type === 'string') return `${p.name}="test"`;
    if (p.type === 'number') return `${p.name}={0}`;
    if (p.type === 'boolean') return `${p.name}={true}`;
    return `${p.name}={${JSON.stringify(p.defaultValue || {})}}`;
  }).join(' ');

  let tests = `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('should render successfully', () => {
    render(<${name} ${requiredPropsCode} />);
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });
`;

  props.forEach(prop => {
    const testValue = prop.type === 'string' ? '"test value"' 
      : prop.type === 'number' ? '42'
      : prop.type === 'boolean' ? 'true'
      : '{}';
    
    tests += `\n  it('should handle ${prop.name} prop', () => {
    const ${prop.name} = ${testValue};
    render(<${name} ${prop.name}={${prop.name}} ${requiredPropsCode} />);
    // Add assertions for ${prop.name} prop behavior
  });
`;
  });

  if (variants && variants.length > 0) {
    variants.forEach(variant => {
      const variantProps = variant.props ? Object.entries(variant.props)
        .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
        .join(' ') : '';
      
      tests += `\n  it('should render ${variant.name} variant', () => {
    render(<${name} ${variantProps} ${requiredPropsCode} />);
    // Add assertions for ${variant.name} variant
  });
`;
    });
  }

  tests += `});
`;

  return tests;
};

const storyTemplate = (spec: ComponentSpec) => {
  const { name, description, props, variants } = spec;
  
  const argTypes = props.map(p => {
    let control = 'text';
    if (p.type === 'boolean') control = 'boolean';
    else if (p.type === 'number') control = 'number';
    else if (p.type !== 'string') control = 'object';
    
    return `    ${p.name}: {
      control: '${control}',${p.description ? `\n      description: '${p.description}',` : ''}
    }`;
  }).join(',\n');

  const defaultArgs = props.map(p => {
    let value = "''";
    if (p.defaultValue !== undefined) {
      value = JSON.stringify(p.defaultValue);
    } else if (p.type === 'string') {
      value = "'Example text'";
    } else if (p.type === 'number') {
      value = '0';
    } else if (p.type === 'boolean') {
      value = 'false';
    }
    return `    ${p.name}: ${value}`;
  }).join(',\n');

  let stories = `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

/**
 * ${description || `${name} component stories`}
 */
const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
  argTypes: {
${argTypes}
  },
};

export default meta;
type Story = StoryObj<typeof ${name}>;

/**
 * Default story with example args
 */
export const Default: Story = {
  args: {
${defaultArgs}
  },
};
`;

  if (variants && variants.length > 0) {
    variants.forEach(variant => {
      const pascalVariant = variant.name.charAt(0).toUpperCase() + variant.name.slice(1);
      const variantArgs = variant.props ? Object.entries(variant.props)
        .map(([key, value]) => `    ${key}: ${JSON.stringify(value)}`)
        .join(',\n') : '';
      
      stories += `\n/**
 * ${variant.name} variant
 */
export const ${pascalVariant}: Story = {
  args: {
${variantArgs}
  },
};
`;
    });
  }

  return stories;
};

/**
 * Load all default templates into the template engine
 */
export function loadDefaultTemplates(engine: SimpleTemplateEngine): void {
  engine.setTemplate('Component.tsx.hbs', componentTemplate);
  engine.setTemplate('Component.types.ts.hbs', typesTemplate);
  engine.setTemplate('Component.module.css.hbs', stylesTemplate);
  engine.setTemplate('Component.test.tsx.hbs', testTemplate);
  engine.setTemplate('Component.stories.tsx.hbs', storyTemplate);
}
