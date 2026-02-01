import { useState, useCallback } from 'react';
import { useEditorStore } from '@/lib/store/use-editor-store';

interface SelectedElement {
  tagName: string;
  className: string;
  styles: CSSStyleDeclaration;
  selector: string;
}

export function useVisualEditor() {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [isInspectMode, setIsInspectMode] = useState(false);
  const updateFile = useEditorStore((state) => state.updateFile);
  const files = useEditorStore((state) => state.files);

  const handleElementSelect = useCallback((element: HTMLElement) => {
    const styles = window.getComputedStyle(element);
    const className = element.className || '';
    const selector = className ? `.${className.split(' ')[0]}` : element.tagName.toLowerCase();

    setSelectedElement({
      tagName: element.tagName.toLowerCase(),
      className: className.split(' ')[0] || '',
      styles: styles as CSSStyleDeclaration,
      selector,
    });
  }, []);

  const handleStyleChange = useCallback((property: string, value: string) => {
    if (!selectedElement) return;

    // Find the CSS file for this component
    const cssFileName = selectedElement.className 
      ? `/components/${selectedElement.className}/${selectedElement.className}.module.css`
      : null;

    if (!cssFileName || !files[cssFileName]) {
      console.warn('CSS file not found for', selectedElement.className);
      return;
    }

    // Get current CSS content
    const cssContent = files[cssFileName];
    
    // Convert camelCase to kebab-case
    const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
    
    // Parse and update CSS
    const updatedCSS = updateCSSProperty(
      cssContent,
      selectedElement.selector,
      cssProperty,
      value
    );

    // Update the file
    updateFile(cssFileName, updatedCSS);

    // Update selected element styles for immediate feedback
    if (selectedElement.styles) {
      (selectedElement.styles as any)[property] = value;
    }
  }, [selectedElement, files, updateFile]);

  const toggleInspectMode = useCallback(() => {
    setIsInspectMode((prev) => !prev);
  }, []);

  return {
    selectedElement,
    isInspectMode,
    handleElementSelect,
    handleStyleChange,
    toggleInspectMode,
    clearSelection: () => setSelectedElement(null),
  };
}

function updateCSSProperty(
  cssContent: string,
  selector: string,
  property: string,
  value: string
): string {
  // Simple CSS parser - finds the selector and updates/adds the property
  const escapedSelector = escapeRegex(selector);
  const escapedProperty = escapeRegex(property);
  const selectorRegex = new RegExp(`(${escapedSelector}\\s*{[^}]*)(${escapedProperty}\\s*:[^;]*;)?([^}]*})`, 'g');
  
  if (selectorRegex.test(cssContent)) {
    // Selector exists, update property
    return cssContent.replace(selectorRegex, (match, before, existingProp, after) => {
      if (existingProp) {
        // Replace existing property
        return match.replace(existingProp, `${property}: ${value};`);
      } else {
        // Add new property
        return `${before}\n  ${property}: ${value};${after}`;
      }
    });
  } else {
    // Selector doesn't exist, add it
    return cssContent + `\n\n${selector} {\n  ${property}: ${value};\n}\n`;
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
