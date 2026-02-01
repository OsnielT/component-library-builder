/**
 * Editor Store
 * Manages file system and editor state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EditorState {
  files: Record<string, string>;
  activeFile: string;
  updateFile: (path: string, content: string) => void;
  setActiveFile: (path: string) => void;
  addFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  reset: () => void;
}

const initialFiles = {
  '/App.tsx': `// Component Library Builder Preview
// Note: React and ReactDOM are available globally
// All components from /components folder are auto-loaded

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1 style={{ color: 'var(--color-primary, #333)', marginBottom: '10px' }}>
        Component Library Builder
      </h1>
      <p style={{ color: 'var(--color-text, #666)' }}>
        Start building your components!
      </p>
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: 'var(--color-background, #f0f0f0)', 
        borderRadius: '8px' 
      }}>
        <p style={{ margin: 0 }}>✨ Create tokens in the Tokens tab</p>
        <p style={{ margin: '8px 0 0 0' }}>🎨 Generate components in the Components tab</p>
        <p style={{ margin: '8px 0 0 0' }}>👀 See live preview above</p>
      </div>
    </div>
  );
}`,
  '/tokens.css': `:root {
  /* Design tokens will appear here */
  /* Example tokens: */
  --color-primary: #3b82f6;
  --color-text: #374151;
  --color-background: #f3f4f6;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}`,
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      files: initialFiles,
      activeFile: '/App.tsx',

      updateFile: (path, content) =>
        set((state) => ({
          files: { ...state.files, [path]: content },
        })),

      setActiveFile: (path) => set({ activeFile: path }),

      addFile: (path, content) =>
        set((state) => ({
          files: { ...state.files, [path]: content },
        })),

      deleteFile: (path) =>
        set((state) => {
          const { [path]: _, ...rest } = state.files;
          return {
            files: rest,
            activeFile: state.activeFile === path ? '/App.tsx' : state.activeFile,
          };
        }),

      reset: () =>
        set({
          files: initialFiles,
          activeFile: '/App.tsx',
        }),
    }),
    {
      name: 'editor-store',
    }
  )
);
