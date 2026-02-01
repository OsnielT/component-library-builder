'use client';

import { useMemo, useState } from 'react';
import { useEditorStore } from '@/lib/store/use-editor-store';

export function LivePreview() {
  const { files } = useEditorStore();
  const { activeFile } = useEditorStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Build HTML content whenever files change
  const htmlContent = useMemo(() => {
    try {
      setError(null);
      setIsLoading(false);
      return buildPreviewHTML(files, activeFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render preview');
      setIsLoading(false);
      return buildErrorHTML(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [files, activeFile]);

  return (
    <div className="h-full w-full relative bg-white">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
          <div className="text-muted-foreground">Loading preview...</div>
        </div>
      )}
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-sm z-10">
          Error: {error}
        </div>
      )}
      <iframe
        srcDoc={htmlContent}
        className="w-full h-full border-0"
        title="Component Preview"
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

function buildPreviewHTML(files: Record<string, string>, activeFile: string): string {
  // Determine what to render based on active file
  const isComponentFile = activeFile.includes('/components/') && 
                          activeFile.endsWith('.tsx') && 
                          !activeFile.endsWith('App.tsx') &&
                          !activeFile.includes('.test.') &&
                          !activeFile.includes('.stories.');
  
  // Extract component name from file path
  const componentName = isComponentFile 
    ? activeFile.split('/').pop()?.replace('.tsx', '') 
    : null;
  
  // Extract App.tsx content
  const appContent = files['/App.tsx'] || files['App.tsx'] || files['/components/App.tsx'] || 
    'function App() { return React.createElement("div", null, "No App.tsx found"); }';
  
  // Extract all component files (*.tsx files in /components folder, excluding App.tsx)
  const componentFiles = Object.entries(files)
    .filter(([path]) => 
      path.includes('/components/') && 
      path.endsWith('.tsx') && 
      !path.endsWith('App.tsx') &&
      !path.includes('.test.') &&
      !path.includes('.stories.')
    )
    .map(([_, content]) => content)
    .join('\n\n');
  
  // Extract CSS content
  const cssFiles = Object.entries(files)
    .filter(([path]) => path.endsWith('.css'))
    .map(([_, content]) => content)
    .join('\n');

  // Transform code (remove imports/exports)
  const transformedApp = transformJSXToJS(appContent);
  const transformedComponents = transformJSXToJS(componentFiles);

  // Decide what to render
  const renderCode = isComponentFile && componentName
    ? `
      // Render the component being edited
      const root = ReactDOM.createRoot(rootElement);
      console.log('Rendering component:', '${componentName}');
      
      // Check if component exists
      if (typeof ${componentName} === 'undefined') {
        throw new Error('Component ${componentName} is not defined. Make sure it is exported.');
      }
      
      root.render(
        <div style={{ padding: '20px' }}>
          <${componentName} />
        </div>
      );
    `
    : `
      // Render App.tsx
      const root = ReactDOM.createRoot(rootElement);
      console.log('Rendering App');
      root.render(<App />);
    `;

  // Build the HTML
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      padding: 20px;
    }
    ${cssFiles}
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  
  <script type="text/babel">
    // Wait for React to load
    (function() {
      console.log('Preview script starting');
      console.log('React available:', typeof React !== 'undefined');
      console.log('ReactDOM available:', typeof ReactDOM !== 'undefined');
      
      if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;">Error: React libraries failed to load</div>';
        return;
      }
      
      window.addEventListener('error', (e) => {
        console.error('Preview error:', e.message, e.error);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: #ef4444; color: white; padding: 12px; font-family: monospace; font-size: 12px; z-index: 9999; white-space: pre-wrap;';
        errorDiv.textContent = 'Error: ' + e.message + (e.error?.stack ? '\\n\\n' + e.error.stack : '');
        document.body.appendChild(errorDiv);
      });
      
      try {
        const { useState, useEffect, useCallback, useMemo, useRef, createElement: h } = React;
        
        console.log('Loading component files...');
        ${transformedComponents}
        
        console.log('Executing app code...');
        ${transformedApp}
        
        const rootElement = document.getElementById('root');
        console.log('Root element:', rootElement);
        
        ${renderCode}
        
        console.log('Rendered successfully');
      } catch (error) {
        console.error('Execution error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'background: #ef4444; color: white; padding: 16px; font-family: monospace; font-size: 14px; white-space: pre-wrap; border-radius: 8px; margin: 20px;';
        errorDiv.textContent = 'Error: ' + error.message + '\\n\\n' + (error.stack || '');
        document.getElementById('root').appendChild(errorDiv);
      }
    })();
  </script>
</body>
</html>
  `.trim();
}

// Simple JSX to JS transformer for basic cases
function transformJSXToJS(code: string): string {
  // Remove all import statements (various formats)
  let transformed = code
    // import './file.css';
    .replace(/import\s+['"].*?['"];?/g, '')
    // import React from 'react';
    .replace(/import\s+\w+\s+from\s+['"].*?['"];?/g, '')
    // import { something } from 'module';
    .replace(/import\s+\{[^}]*\}\s+from\s+['"].*?['"];?/g, '')
    // import * as name from 'module';
    .replace(/import\s+\*\s+as\s+\w+\s+from\s+['"].*?['"];?/g, '')
    // import styles from './Component.module.css'; (CSS modules)
    .replace(/import\s+\w+\s+from\s+['"].*?\.module\.css['"];?/g, '')
    // Remove empty lines left behind
    .replace(/^\s*[\r\n]/gm, '');
  
  // Remove export statements
  transformed = transformed.replace(/^export\s+(default\s+)?/gm, '');
  
  // Replace CSS module usage patterns (more comprehensive)
  // className={`${styles.something} ${other}`} -> className={`something ${other}`}
  transformed = transformed.replace(/\$\{styles\[['"]([^'"]+)['"]\]\}/g, '$1');
  transformed = transformed.replace(/\$\{styles\.(\w+)\}/g, '$1');
  
  // styles.className -> 'className'
  transformed = transformed.replace(/styles\.(\w+)/g, "'$1'");
  
  // className={styles.something} -> className="something"
  transformed = transformed.replace(/className=\{['"](\w+)['"]\}/g, 'className="$1"');
  
  return transformed;
}

function buildErrorHTML(errorMessage: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 20px;
      background: #fee;
    }
    .error {
      background: #ef4444;
      color: white;
      padding: 16px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="error">
    <strong>Error:</strong> ${errorMessage}
  </div>
</body>
</html>
  `.trim();
}
