'use client';

import { useEditorStore } from '@/lib/store/use-editor-store';

export function FileTree() {
  const { files, activeFile, setActiveFile } = useEditorStore();

  // Organize files into a tree structure
  const fileTree = Object.keys(files).reduce((tree, filePath) => {
    const parts = filePath.split('/').filter(Boolean);
    let current = tree;
    
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        // It's a file
        if (!current.files) current.files = [];
        current.files.push({ name: part, path: filePath });
      } else {
        // It's a folder
        if (!current.folders) current.folders = {};
        if (!current.folders[part]) {
          current.folders[part] = {};
        }
        current = current.folders[part];
      }
    });
    
    return tree;
  }, {} as any);

  const renderTree = (node: any, path: string = '') => {
    return (
      <div>
        {node.folders && Object.entries(node.folders).map(([folderName, folderNode]: [string, any]) => (
          <div key={folderName} className="ml-2">
            <div className="text-xs font-semibold text-muted-foreground py-1">
              📁 {folderName}
            </div>
            {renderTree(folderNode, `${path}/${folderName}`)}
          </div>
        ))}
        {node.files && node.files.map((file: any) => (
          <button
            key={file.path}
            onClick={() => setActiveFile(file.path)}
            className={`w-full text-left px-2 py-1 text-sm hover:bg-accent rounded transition-colors ${
              activeFile === file.path ? 'bg-primary/20 text-primary' : ''
            }`}
          >
            {getFileIcon(file.name)} {file.name}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto p-2 bg-muted/10">
      <div className="text-xs font-semibold text-muted-foreground mb-2">FILES</div>
      {renderTree(fileTree)}
    </div>
  );
}

function getFileIcon(filename: string): string {
  if (filename.endsWith('.tsx') || filename.endsWith('.jsx')) return '⚛️';
  if (filename.endsWith('.ts') || filename.endsWith('.js')) return '📘';
  if (filename.endsWith('.css')) return '🎨';
  if (filename.endsWith('.json')) return '📋';
  if (filename.endsWith('.test.tsx') || filename.endsWith('.test.ts')) return '🧪';
  return '📄';
}
