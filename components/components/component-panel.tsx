'use client';

import { useState, useEffect } from 'react';
import { useComponentStore } from '@/lib/store/use-component-store';
import { useEditorStore } from '@/lib/store/use-editor-store';
import { ComponentSpecForm } from './component-spec-form';
import type { ComponentSpec } from '@/types';

export function ComponentPanel({ onSuccess, spec }: { onSuccess?: () => void; spec?: ComponentSpec | null }) {
  const [isCreating, setIsCreating] = useState(false);
  const [importedComponent, setImportedComponent] = useState<string | null>(null);
  const {
    components,
    selectedComponent,
    selectComponent,
    generateComponent,
    deleteComponent,
    isGenerating,
    generationError,
    syncFromFileSystem,
  } = useComponentStore();
  
  const { files, activeFile } = useEditorStore();

  // Use the passed spec or fall back to selectedComponent from store
  const editingSpec = spec !== undefined ? spec : selectedComponent;

  // Sync component list from file system on mount and when files change
  useEffect(() => {
    syncFromFileSystem();
  }, [files, syncFromFileSystem]);

  const handleSubmit = async (spec: ComponentSpec) => {
    try {
      await generateComponent(spec);
      setIsCreating(false);
      selectComponent(null);
      onSuccess?.(); // Call onSuccess callback if provided
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to generate component:', error);
    }
  };

  const handleClose = () => {
    setIsCreating(false);
    selectComponent(null);
  };

  const handleEdit = (spec: ComponentSpec) => {
    selectComponent(spec);
    setIsCreating(false);
  };

  const handleDelete = (name: string) => {
    if (confirm(`Are you sure you want to delete component '${name}'?`)) {
      deleteComponent(name);
    }
  };

  const handleImport = (componentName: string) => {
    const { files, activeFile } = useEditorStore.getState();
    
    // Get the current file content from our store
    const currentContent = files[activeFile] || '';
    
    // Calculate relative path from active file to component
    const activeFileParts = activeFile.split('/').filter(Boolean);
    const componentPath = `/components/${componentName}`;
    
    // Calculate relative path
    let relativePath: string;
    if (activeFile.startsWith('/components/')) {
      // If we're in a component file, calculate relative path
      const activeDir = activeFileParts.slice(0, -1); // Remove filename
      
      // Count how many levels up we need to go
      const levelsUp = activeDir.length - 1; // -1 because we're already in /components
      const upPath = levelsUp > 0 ? '../'.repeat(levelsUp) : './';
      relativePath = upPath + componentName;
    } else {
      // If we're in root (like App.tsx), use relative path from root
      relativePath = '.' + componentPath;
    }
    
    // Check if import already exists
    const importStatement = `import { ${componentName} } from '${relativePath}';`;
    if (currentContent.includes(`from '${relativePath}'`) || 
        currentContent.includes(`from "${relativePath}"`) ||
        currentContent.includes(`{ ${componentName} }`)) {
      console.log('Import already exists');
      setImportedComponent(componentName);
      setTimeout(() => setImportedComponent(null), 2000);
      return;
    }
    
    // Find the last import statement or add at the top
    const lines = currentContent.split('\n');
    let insertIndex = 0;
    let foundImport = false;
    
    // Find the last import line
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        insertIndex = i + 1;
        foundImport = true;
      } else if (foundImport && lines[i].trim() === '') {
        insertIndex = i;
        break;
      }
    }
    
    // Insert the import statement
    lines.splice(insertIndex, 0, importStatement);
    const newContent = lines.join('\n');
    
    // Update the file in our store - Sandpack will pick it up via the files prop
    console.log('Adding import to:', activeFile, 'with path:', relativePath);
    useEditorStore.getState().updateFile(activeFile, newContent);
    
    // Show feedback
    setImportedComponent(componentName);
    setTimeout(() => setImportedComponent(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {(!spec && !isCreating) && (

      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Components</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            disabled={isGenerating}
          >
            + New Component
          </button>
        </div>
      </div>
      )
      }

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isCreating || editingSpec ? (
          <ComponentSpecForm
            spec={editingSpec}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        ) : (
          <div className="p-4">
            {/* Generation Status */}
            {isGenerating && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-900">Generating component...</p>
              </div>
            )}

            {/* Import Success */}
            {importedComponent && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-900">
                  ✓ Imported {importedComponent} to {activeFile}
                </p>
              </div>
            )}

            {/* Generation Error */}
            {generationError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded">
                <p className="text-sm font-medium text-destructive mb-1">Generation Error:</p>
                <p className="text-xs text-destructive">{generationError}</p>
              </div>
            )}

            {/* Component List */}
            {components.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">No components yet</p>
                <p className="text-xs text-muted-foreground">
                  Click &quot;New Component&quot; to create your first component
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {components.map((component) => {
                  const isFromFileSystem = component.description === 'Component found in file system';
                  
                  return (
                    <div
                      key={component.name}
                      className="group flex items-center justify-between p-2 rounded hover:bg-accent transition-colors border border-transparent hover:border-border"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="text-2xl">📦</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">{component.name}</h4>
                            {isFromFileSystem && (
                              <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded flex-shrink-0">
                                FS
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            /components/{component.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleImport(component.name)}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                          title="Import to current file"
                        >
                          Import
                        </button>
                        {!isFromFileSystem && (
                          <button
                            onClick={() => handleEdit(component)}
                            className="px-2 py-1 text-xs border rounded hover:bg-secondary"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(component.name)}
                          className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
