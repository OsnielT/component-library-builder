/**
 * Component Store
 * Manages component specifications and generation
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ComponentSpec } from '@/types';
import { ComponentGenerator } from '@/lib/core/component-generator';
import { SimpleTemplateEngine } from '@/lib/core/template-engine';
import { loadDefaultTemplates } from '@/lib/core/template-loader';
import { useEditorStore } from './use-editor-store';

interface ComponentState {
  components: ComponentSpec[];
  selectedComponent: ComponentSpec | null;
  isGenerating: boolean;
  generationError: string | null;
  addComponent: (spec: ComponentSpec) => void;
  updateComponent: (name: string, updates: Partial<ComponentSpec>) => void;
  deleteComponent: (name: string) => void;
  selectComponent: (spec: ComponentSpec | null) => void;
  generateComponent: (spec: ComponentSpec) => Promise<void>;
  setComponents: (components: ComponentSpec[]) => void;
  clearComponents: () => void;
  syncFromFileSystem: () => void;
}

const templateEngine = new SimpleTemplateEngine();
loadDefaultTemplates(templateEngine);
const componentGenerator = new ComponentGenerator(templateEngine);

export const useComponentStore = create<ComponentState>()(
  persist(
    (set, get) => ({
      components: [],
      selectedComponent: null,
      isGenerating: false,
      generationError: null,

      addComponent: (spec) => {
        set((state) => ({
          components: [...state.components, spec],
        }));
      },

      updateComponent: (name, updates) => {
        set((state) => ({
          components: state.components.map((c) =>
            c.name === name ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteComponent: (name) => {
        // Delete component files from editor
        const editorStore = useEditorStore.getState();
        const filesToDelete = [
          `/components/${name}/${name}.tsx`,
          `/components/${name}/${name}.types.ts`,
          `/components/${name}/${name}.module.css`,
          `/components/${name}/${name}.test.tsx`,
          `/components/${name}/${name}.stories.tsx`,
          `/components/${name}/index.ts`,
        ];
        
        filesToDelete.forEach((path) => {
          editorStore.deleteFile(path);
        });

        // Remove component from list
        set((state) => ({
          components: state.components.filter((c) => c.name !== name),
          selectedComponent: state.selectedComponent?.name === name ? null : state.selectedComponent,
        }));
      },

      selectComponent: (spec) => set({ selectedComponent: spec }),

      generateComponent: async (spec) => {
        set({ isGenerating: true, generationError: null });

        try {
          // Generate component files
          const result = await componentGenerator.generate(spec);

          // Add files to editor
          const editorStore = useEditorStore.getState();
          for (const file of result.files) {
            editorStore.addFile(file.path, file.content);
          }

          // Add component to list
          get().addComponent(spec);

          set({ isGenerating: false });
        } catch (error) {
          set({
            isGenerating: false,
            generationError: error instanceof Error ? error.message : 'Unknown error',
          });
          throw error;
        }
      },

      setComponents: (components) => {
        set({ components });
      },

      clearComponents: () => {
        set({ components: [], selectedComponent: null });
      },

      syncFromFileSystem: () => {
        const editorStore = useEditorStore.getState();
        const files = editorStore.files;
        
        // Find all component folders in /components/
        const componentFolders = new Set<string>();
        Object.keys(files).forEach((path) => {
          const match = path.match(/^\/components\/([^/]+)\//);
          if (match) {
            componentFolders.add(match[1]);
          }
        });

        // Get current components
        const currentComponents = get().components;
        const currentComponentNames = new Set(currentComponents.map(c => c.name));

        // Remove components that no longer exist in file system
        const existingComponents = currentComponents.filter(c => 
          componentFolders.has(c.name)
        );

        // Add placeholder specs for components found in file system but not in store
        const newComponents: ComponentSpec[] = [];
        componentFolders.forEach((name) => {
          if (!currentComponentNames.has(name)) {
            // Create a minimal spec for components found in file system
            newComponents.push({
              name,
              version: '1.0.0',
              type: 'primitive',
              props: [],
              tokens: [],
              description: 'Component found in file system',
            });
          }
        });

        set({ components: [...existingComponents, ...newComponents] });
      },
    }),
    {
      name: 'component-store',
      partialize: (state) => ({
        components: state.components,
      }),
    }
  )
);
