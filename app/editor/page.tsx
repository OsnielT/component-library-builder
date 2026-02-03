'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MonacoEditor } from '@/components/editor/monaco-editor';
import { LivePreview } from '@/components/editor/live-preview';
import { ResizableLayout } from '@/components/editor/resizable-layout';
import { TokenPanel } from '@/components/tokens/token-panel';
import { ComponentPanel } from '@/components/components/component-panel';
import { useProjectStore } from '@/lib/store/use-project-store';
import { useEditorStore } from '@/lib/store/use-editor-store';
import { useComponentStore } from '@/lib/store/use-component-store';
import { useTokenStore } from '@/lib/store/use-token-store';
import type { ComponentSpec } from '@/types';

type SidebarTab = 'tokens' | 'components' | 'styles';

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('components');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentSpec | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  
  const { currentProject, saveProject, exportProject } = useProjectStore();
  const { activeFile, setActiveFile } = useEditorStore();
  const { components, deleteComponent } = useComponentStore();
  const { tokens } = useTokenStore();

  // Update last saved time when status changes to saved
  useEffect(() => {
    if (autoSaveStatus === 'saved') {
      setLastSavedTime(new Date());
    }
  }, [autoSaveStatus]);

  // Refresh the timestamp display every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update the relative time display
      setLastSavedTime(prev => prev);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Format the last saved time
  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Not saved yet';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Wait for client-side hydration to complete
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      saveProject();
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      setIsSaving(false);
      console.error('Failed to save project:', error);
    }
  };

  const handleComponentSelect = (componentName: string) => {
    // Find the main component file
    const componentFile = `/components/${componentName}/${componentName}.tsx`;
    setActiveFile(componentFile);
  };

  const handleEditComponent = (componentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const component = components.find(c => c.name === componentName);
    if (component) {
      // Open the edit form with the component data
      setShowAddForm(true);
      // We'll need to pass the component to edit
      setEditingComponent(component);
    }
  };

  const handleDeleteComponent = (componentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete ${componentName}? This will remove all associated files.`)) {
      deleteComponent(componentName);
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation Bar */}
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Projects
            </Link>
            {currentProject && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium">{currentProject.name}</span>
              </>
            )}
          </div>
          
          {/* Auto-save indicator in the middle */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              background: autoSaveStatus === 'saving' ? '#f59e0b' : '#f3f4f6',
              color: autoSaveStatus === 'saving' ? 'white' : '#6b7280',
            }}
          >
            {autoSaveStatus === 'saving' ? (
              <>
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved {formatLastSaved(lastSavedTime)}
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="px-3 py-1.5 text-sm border rounded hover:bg-accent transition-colors"
              title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
            >
              {showSidebar ? '◀' : '▶'} {showSidebar ? 'Hide' : 'Show'} Sidebar
            </button>
            {currentProject && (
              <>
                <button
                  onClick={exportProject}
                  className="px-3 py-1.5 text-sm border rounded hover:bg-accent transition-colors flex items-center gap-2"
                  title="Export project as JSON"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || autoSaveStatus === 'saving'}
                  className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {(isSaving || autoSaveStatus === 'saving') && (
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {autoSaveStatus === 'saving' ? 'Auto-saving...' : isSaving ? 'Saving...' : 'Save Project'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Editor Area with Resizable Layout */}
      <ResizableLayout
        showSidebar={showSidebar}
        sidebar={
          <>
            {/* Tab Navigation */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('components')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'components'
                    ? 'bg-background border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setActiveTab('styles')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'styles'
                    ? 'bg-background border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Styles
              </button>
              <button
                onClick={() => setActiveTab('tokens')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'tokens'
                    ? 'bg-background border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Tokens
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'components' ? (
                <div className="h-full overflow-auto p-4">
                  <h3 className="text-sm font-semibold mb-3">Components</h3>
                  <div className="space-y-2">
                    {/* Add Component Button */}
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="w-full text-left px-3 py-2 rounded border border-dashed border-primary/50 hover:bg-primary/5 hover:border-primary transition-colors"
                    >
                      <div className="font-medium text-primary flex items-center gap-2">
                        <span className="text-lg">+</span>
                        Add Component
                      </div>
                      <div className="text-xs opacity-70">Create a new component</div>
                    </button>

                    {/* Component List */}
                    {components.map((component) => (
                      <div
                        key={component.name}
                        onClick={() => handleComponentSelect(component.name)}
                        className={`w-full text-left px-3 py-2 rounded border transition-colors group relative cursor-pointer ${
                          activeFile.includes(component.name)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'hover:bg-accent border-transparent'
                        }`}
                      >
                        <div className="font-medium pr-8">{component.name}</div>
                        <div className="text-xs opacity-70">{component.type}</div>
                        
                        {/* Action buttons */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Edit button */}
                          <button
                            onClick={(e) => handleEditComponent(component.name, e)}
                            className={`p-1 rounded transition-colors ${
                              activeFile.includes(component.name)
                                ? 'hover:bg-primary-foreground/20'
                                : 'hover:bg-accent'
                            }`}
                            title="Edit component"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          {/* Delete button */}
                          <button
                            onClick={(e) => handleDeleteComponent(component.name, e)}
                            className={`p-1 rounded transition-colors ${
                              activeFile.includes(component.name)
                                ? 'hover:bg-primary-foreground/20'
                                : 'hover:bg-destructive/10 text-destructive'
                            }`}
                            title="Delete component"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {components.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No components yet. Click &quot;Add Component&quot; to create one.
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === 'styles' ? (
                <div className="h-full overflow-auto p-4">
                  <h3 className="text-sm font-semibold mb-3">Quick Style Editor</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Edit the CSS file for the current component
                  </p>
                  
                  {activeFile.endsWith('.tsx') && activeFile.includes('/components/') ? (
                    <button
                      onClick={() => {
                        // Open the corresponding CSS file
                        const cssFile = activeFile.replace('.tsx', '.module.css');
                        setActiveFile(cssFile);
                      }}
                      className="w-full px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    >
                      Open CSS File
                    </button>
                  ) : activeFile.endsWith('.module.css') ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-900">
                          ✓ Currently editing CSS file
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          // Go back to the component file
                          const componentFile = activeFile.replace('.module.css', '.tsx');
                          setActiveFile(componentFile);
                        }}
                        className="w-full px-3 py-2 border rounded hover:bg-accent transition-colors"
                      >
                        Back to Component
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-muted rounded text-sm text-muted-foreground">
                      Select a component file to edit its styles
                    </div>
                  )}
                  
                  <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tip</h4>
                    <p className="text-xs text-blue-800">
                      Use CSS variables from your design tokens:
                    </p>
                    <code className="block mt-2 text-xs bg-blue-100 p-2 rounded font-mono">
                      color: var(--color-primary);
                    </code>
                  </div>
                </div>
              ) : (
                <TokenPanel />
              )}
            </div>
          </>
        }
        preview={
          <div className="h-full flex flex-col">
            <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Preview: {
                  (() => {
                    // Show component name for both .tsx and .module.css files
                    if (activeFile.includes('/components/')) {
                      if (activeFile.endsWith('.tsx') && !activeFile.endsWith('App.tsx')) {
                        return activeFile.split('/').pop()?.replace('.tsx', '');
                      } else if (activeFile.endsWith('.module.css')) {
                        return activeFile.split('/').pop()?.replace('.module.css', '');
                      }
                    }
                    return 'App';
                  })()
                }
              </h2>
              <div className="text-xs text-muted-foreground">
                Live preview of your components
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <LivePreview />
            </div>
          </div>
        }
        editor={
          <div className="h-full flex flex-col">
            <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Code Editor</h2>
              <div className="flex items-center gap-2">
                {/* Insert Token Dropdown */}
                {tokens.length > 0 && (
                  <div className="relative group">
                    <button
                      className="px-2 py-1 text-xs border rounded hover:bg-accent transition-colors flex items-center gap-1"
                      title="Insert design token"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      Tokens
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-1 w-80 bg-background border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <div className="p-2 border-b bg-muted/30">
                        <div className="text-xs font-semibold">Insert Design Token</div>
                        <div className="text-xs text-muted-foreground">Click to copy CSS variable</div>
                      </div>
                      <div className="py-1 max-h-96 overflow-y-auto">
                        {tokens.map((token) => {
                          const tokenId = token.$extensions?.['com.component-builder']?.id || '';
                          const cssVar = token.$extensions?.['com.component-builder']?.cssVariable || '';
                          const value = String(token.$value);
                          const isReference = value.startsWith('{') && value.endsWith('}');
                          
                          return (
                            <button
                              key={tokenId}
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(`var(${cssVar})`);
                                  // Optional: Show a toast notification
                                } catch (err) {
                                  console.error('Failed to copy:', err);
                                }
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-center gap-2"
                            >
                              {/* Color Preview */}
                              {token.$type === 'color' && !isReference && (
                                <div
                                  className="w-6 h-6 rounded border-2 flex-shrink-0"
                                  style={{ backgroundColor: value }}
                                />
                              )}
                              
                              {/* Token Info */}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">{tokenId}</div>
                                <code className="text-xs text-muted-foreground font-mono truncate block">
                                  {cssVar}
                                </code>
                              </div>
                              
                              {/* Value */}
                              <div className="text-xs text-muted-foreground font-mono flex-shrink-0">
                                {isReference ? (
                                  <span className="text-blue-600">{value}</span>
                                ) : (
                                  value.length > 20 ? value.substring(0, 20) + '...' : value
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Import Component Dropdown */}
                {components.length > 0 && (
                  <div className="relative group">
                    <button
                      className="px-2 py-1 text-xs border rounded hover:bg-accent transition-colors flex items-center gap-1"
                      title="Import component to current file"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Import
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-background border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <div className="py-1 max-h-64 overflow-y-auto">
                        {components.map((component) => (
                          <button
                            key={component.name}
                            onClick={() => {
                              // Import the component to the active file
                              const { files, activeFile } = useEditorStore.getState();
                              const currentContent = files[activeFile] || '';
                              
                              // Calculate relative path
                              const activeFileParts = activeFile.split('/').filter(Boolean);
                              let relativePath: string;
                              
                              if (activeFile.startsWith('/components/')) {
                                const activeDir = activeFileParts.slice(0, -1);
                                const levelsUp = activeDir.length - 1;
                                const upPath = levelsUp > 0 ? '../'.repeat(levelsUp) : './';
                                relativePath = upPath + component.name;
                              } else {
                                relativePath = './components/' + component.name;
                              }
                              
                              // Check if import already exists
                              const importStatement = `import { ${component.name} } from '${relativePath}';`;
                              if (currentContent.includes(`from '${relativePath}'`) || 
                                  currentContent.includes(`from "${relativePath}"`) ||
                                  currentContent.includes(`{ ${component.name} }`)) {
                                alert(`${component.name} is already imported`);
                                return;
                              }
                              
                              // Find the last import line
                              const lines = currentContent.split('\n');
                              let insertIndex = 0;
                              let foundImport = false;
                              
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
                              
                              // Update the file
                              useEditorStore.getState().updateFile(activeFile, newContent);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors"
                          >
                            <div className="font-medium">{component.name}</div>
                            <div className="text-muted-foreground">{component.type}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground font-mono">
                  {activeFile}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <MonacoEditor onSaveStatusChange={setAutoSaveStatus} />
            </div>
          </div>
        }
      />

      {/* Add/Edit Component Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => {
          setShowAddForm(false);
          setEditingComponent(null);
        }}>
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-hidden m-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 bg-background border-b px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingComponent ? 'Edit Component' : 'Add Component'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingComponent(null);
                }}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4"> 
              <ComponentPanel 
                spec={editingComponent}
                onSuccess={() => {
                  setShowAddForm(false);
                  setEditingComponent(null);
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
