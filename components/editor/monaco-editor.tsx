'use client';

import { Editor, OnMount } from '@monaco-editor/react';
import { useEditorStore } from '@/lib/store/use-editor-store';
import { useProjectStore } from '@/lib/store/use-project-store';
import { useEffect, useState, useRef } from 'react';

export function MonacoEditor({ onSaveStatusChange }: { onSaveStatusChange?: (status: 'saved' | 'saving' | 'unsaved') => void }) {
  const { files, activeFile, updateFile } = useEditorStore();
  const [mounted, setMounted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Notify parent of save status changes
  useEffect(() => {
    onSaveStatusChange?.(saveStatus);
  }, [saveStatus, onSaveStatusChange]);

  const handleChange = (value: string | undefined) => {
    if (value === undefined) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set status to saving
    setSaveStatus('saving');
    
    // Debounce the save
    saveTimeoutRef.current = setTimeout(() => {
      updateFile(activeFile, value);
      
      // Also save the project
      const { saveProject } = useProjectStore.getState();
      saveProject();
      
      setSaveStatus('saved');
      
      // Reset to unsaved after 2 seconds
      setTimeout(() => {
        setSaveStatus('unsaved');
      }, 2000);
    }, 500);
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure TypeScript compiler options for both TS and JS
    const compilerOptions = {
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      checkJs: false,
      strict: false,
      noImplicitAny: false,
      skipLibCheck: true,
      allowSyntheticDefaultImports: true,
    };

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);

    // Add comprehensive React type definitions
    const reactTypes = `
declare module 'react' {
  export function createElement(type: any, props?: any, ...children: any[]): any;
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useContext<T>(context: any): T;
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, (action: A) => void];
  export const Fragment: any;
  
  export type FC<P = {}> = (props: P) => any;
  export type FunctionComponent<P = {}> = (props: P) => any;
  export type ReactNode = any;
  export type ReactElement = any;
  export type ComponentType<P = any> = FC<P>;
  export type PropsWithChildren<P = {}> = P & { children?: ReactNode };
  export type CSSProperties = Record<string, any>;
  
  export interface HTMLAttributes<T = any> {
    className?: string;
    style?: CSSProperties;
    onClick?: (event: any) => void;
    onChange?: (event: any) => void;
    onSubmit?: (event: any) => void;
    [key: string]: any;
  }
}

declare global {
  const React: typeof import('react');
  const h: typeof React.createElement;
  
  namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
    `;

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      reactTypes,
      'file:///node_modules/@types/react/index.d.ts'
    );

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      reactTypes,
      'file:///node_modules/@types/react/index.d.ts'
    );

    // Set diagnostics options to be less strict
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: true,
      diagnosticCodesToIgnore: [
        1375, // 'await' expressions are only allowed at the top level of a file
        1378, // Top-level 'await' expressions are only allowed when the 'module' option is set
        2307, // Cannot find module
        2304, // Cannot find name
        2792, // Cannot find module 'react'
        7016, // Could not find a declaration file
      ],
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: true,
    });
  };

  // Update the model when the active file changes
  useEffect(() => {
    if (!monacoRef.current || !editorRef.current) return;

    const monaco = monacoRef.current;
    const editor = editorRef.current;

    // Create or get the model for this file
    // Remove leading slash if present to avoid double slashes
    const filePath = activeFile.startsWith('/') ? activeFile.slice(1) : activeFile;
    const uri = monaco.Uri.parse(`file:///${filePath}`);
    let model = monaco.editor.getModel(uri);

    if (!model) {
      const language = getLanguageFromFilename(activeFile);
      model = monaco.editor.createModel(files[activeFile] || '', language, uri);
    } else {
      // Update model content if it changed
      if (model.getValue() !== files[activeFile]) {
        model.setValue(files[activeFile] || '');
      }
    }

    editor.setModel(model);
  }, [activeFile, files]);

  if (!mounted) {
    return <div className="flex items-center justify-center h-full">Loading editor...</div>;
  }

  const currentFile = files[activeFile] || '';
  const language = getLanguageFromFilename(activeFile);

  return (
    <div className="h-full">
      <Editor
        height="100%"
        language={language}
        path={activeFile}
        value={currentFile}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}

function getLanguageFromFilename(filename: string): string {
  if (filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.ts')) return 'typescript';
  if (filename.endsWith('.jsx')) return 'javascript';
  if (filename.endsWith('.js')) return 'javascript';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.html')) return 'html';
  return 'typescript';
}
