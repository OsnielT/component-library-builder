/**
 * ComponentGenerator Usage Example
 * This file demonstrates how to use the ComponentGenerator
 */

import { ComponentGenerator } from './component-generator';
import { SimpleTemplateEngine } from './template-engine';
import { ComponentSpec } from '@/types/component';
import { useEditorStore } from '@/lib/store/use-editor-store';

/**
 * Example: Generate a Button component
 */
export async function exampleGenerateButton() {
  // Create template engine and load templates
  const templateEngine = new SimpleTemplateEngine();
  
  // In a real application, you would load templates from files
  // For this example, we'll assume templates are already loaded
  
  // Create component generator
  const generator = new ComponentGenerator(templateEngine);
  
  // Define component specification
  const buttonSpec: ComponentSpec = {
    name: 'Button',
    description: 'A reusable button component',
    type: 'primitive',
    version: '1.0.0',
    props: [
      {
        name: 'label',
        type: 'string',
        required: true,
        description: 'The text to display on the button',
      },
      {
        name: 'variant',
        type: "'primary' | 'secondary' | 'danger'",
        required: false,
        defaultValue: 'primary',
        description: 'The visual style variant',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Whether the button is disabled',
      },
      {
        name: 'onClick',
        type: '() => void',
        required: false,
        description: 'Click event handler',
      },
    ],
    tokens: ['color.primary', 'color.secondary', 'color.danger', 'spacing.md'],
    variants: [
      {
        name: 'primary',
        props: { variant: 'primary' },
        tokens: { background: 'color.primary' },
      },
      {
        name: 'secondary',
        props: { variant: 'secondary' },
        tokens: { background: 'color.secondary' },
      },
      {
        name: 'danger',
        props: { variant: 'danger' },
        tokens: { background: 'color.danger' },
      },
    ],
  };
  
  // Validate the specification
  const validation = generator.validate(buttonSpec);
  if (!validation.valid) {
    console.error('Invalid specification:', validation.errors);
    return;
  }
  
  // Generate component files
  const result = await generator.generate(buttonSpec);
  
  // Add files to editor store
  const { addFile } = useEditorStore.getState();
  for (const file of result.files) {
    addFile(file.path, file.content);
  }
  
  console.log(`Generated ${result.files.length} files for Button component`);
  return result;
}

/**
 * Example: Generate a Card component
 */
export async function exampleGenerateCard() {
  const templateEngine = new SimpleTemplateEngine();
  const generator = new ComponentGenerator(templateEngine);
  
  const cardSpec: ComponentSpec = {
    name: 'Card',
    description: 'A card container component',
    type: 'composite',
    version: '1.0.0',
    props: [
      {
        name: 'title',
        type: 'string',
        required: false,
        description: 'Card title',
      },
      {
        name: 'children',
        type: 'React.ReactNode',
        required: true,
        description: 'Card content',
      },
      {
        name: 'elevated',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Whether to show elevation shadow',
      },
    ],
    tokens: ['shadow.sm', 'shadow.md', 'spacing.lg', 'border.radius'],
    customStyles: 'padding: var(--spacing-lg);\n  border-radius: var(--border-radius);',
  };
  
  const result = await generator.generate(cardSpec);
  
  const { addFile } = useEditorStore.getState();
  for (const file of result.files) {
    addFile(file.path, file.content);
  }
  
  return result;
}
