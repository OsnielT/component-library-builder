/**
 * Generate Component Utility
 * Integrates ComponentGenerator with the editor store
 */

import { ComponentGenerator } from './component-generator';
import { SimpleTemplateEngine } from './template-engine';
import { ComponentSpec } from '@/types/component';
import { useEditorStore } from '@/lib/store/use-editor-store';
import fs from 'fs';
import path from 'path';

/**
 * Initialize the component generator with templates
 */
export function createComponentGenerator(): ComponentGenerator {
  const templateEngine = new SimpleTemplateEngine();
  
  // Load templates from the templates directory
  const templatesDir = path.join(process.cwd(), 'lib', 'templates');
  const templateFiles = [
    'Component.tsx.hbs',
    'Component.types.ts.hbs',
    'Component.module.css.hbs',
    'Component.test.tsx.hbs',
    'Component.stories.tsx.hbs',
  ];

  for (const file of templateFiles) {
    try {
      const content = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
      templateEngine.setTemplate(file, content);
    } catch (error) {
      console.error(`Failed to load template ${file}:`, error);
    }
  }

  return new ComponentGenerator(templateEngine);
}

/**
 * Generate a component and add files to the editor store
 */
export async function generateAndAddComponent(spec: ComponentSpec): Promise<void> {
  const generator = createComponentGenerator();
  
  // Generate component files
  const result = await generator.generate(spec);
  
  // Add files to editor store
  const { addFile } = useEditorStore.getState();
  
  for (const file of result.files) {
    addFile(file.path, file.content);
  }
}

/**
 * Validate a component specification
 */
export function validateComponentSpec(spec: ComponentSpec) {
  const generator = createComponentGenerator();
  return generator.validate(spec);
}
