'use client';

import { useState, useEffect, useCallback, memo, ReactNode } from 'react';

interface ResizableLayoutProps {
  sidebar: ReactNode;
  preview: ReactNode;
  editor: ReactNode;
  showSidebar: boolean;
}

export const ResizableLayout = memo(function ResizableLayout({
  sidebar,
  preview,
  editor,
  showSidebar,
}: ResizableLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [previewHeight, setPreviewHeight] = useState(50);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingPreview, setIsResizingPreview] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load panel sizes from localStorage on mount
  useEffect(() => {
    const savedSidebarWidth = localStorage.getItem('editor-sidebar-width');
    const savedPreviewHeight = localStorage.getItem('editor-preview-height');
    
    if (savedSidebarWidth) {
      setSidebarWidth(Number(savedSidebarWidth));
    }
    if (savedPreviewHeight) {
      setPreviewHeight(Number(savedPreviewHeight));
    }
    
    // Mark as mounted after loading
    setMounted(true);
  }, []);

  // Save sidebar width to localStorage when it changes (but not on initial mount)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('editor-sidebar-width', String(sidebarWidth));
    }
  }, [sidebarWidth, mounted]);

  // Save preview height to localStorage when it changes (but not on initial mount)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('editor-preview-height', String(previewHeight));
    }
  }, [previewHeight, mounted]);

  // Handle sidebar resize
  useEffect(() => {
    if (!isResizingSidebar) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const newWidth = Math.max(200, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      document.body.style.cursor = '';
    };

    document.body.style.cursor = 'col-resize';
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isResizingSidebar]);

  // Handle preview resize
  useEffect(() => {
    if (!isResizingPreview) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const container = document.getElementById('editor-container');
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
      setPreviewHeight(Math.max(20, Math.min(80, newHeight)));
    };

    const handleMouseUp = () => {
      setIsResizingPreview(false);
      document.body.style.cursor = '';
    };

    document.body.style.cursor = 'row-resize';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isResizingPreview]);

  const handleSidebarResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  }, []);

  const handlePreviewResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingPreview(true);
  }, []);

  return (
    <div 
      className="flex flex-1 overflow-hidden relative"
      id="editor-container"
      style={{
        userSelect: (isResizingSidebar || isResizingPreview) ? 'none' : 'auto'
      }}
    >
      {/* Resize overlay to capture all mouse events during resize */}
      {(isResizingSidebar || isResizingPreview) && (
        <div 
          className="fixed inset-0 z-50"
          style={{
            cursor: isResizingSidebar ? 'col-resize' : 'row-resize',
            background: 'transparent'
          }}
        />
      )}

      {/* Left sidebar */}
      {showSidebar && (
        <>
          <aside 
            className="border-r bg-muted/10 flex flex-col"
            style={{ width: `${sidebarWidth}px` }}
          >
            {sidebar}
          </aside>
          
          {/* Sidebar resize handle */}
          <div
            className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors relative flex-shrink-0"
            onMouseDown={handleSidebarResizeStart}
            style={{ userSelect: 'none' }}
          >
            {/* Larger invisible hit area */}
            <div className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize" />
          </div>
        </>
      )}

      {/* Right side - Preview and Editor */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top: Preview */}
        <div 
          className="border-b bg-background"
          style={{ height: `${previewHeight}%` }}
        >
          {preview}
        </div>

        {/* Preview/Editor resize handle */}
        <div
          className="h-1 bg-border hover:bg-primary cursor-row-resize transition-colors relative flex-shrink-0"
          onMouseDown={handlePreviewResizeStart}
          style={{ userSelect: 'none' }}
        >
          {/* Larger invisible hit area */}
          <div className="absolute -top-2 -bottom-2 left-0 right-0 cursor-row-resize" />
        </div>

        {/* Bottom: Editor */}
        <div 
          className="bg-background"
          style={{ height: `${100 - previewHeight}%` }}
        >
          {editor}
        </div>
      </main>
    </div>
  );
});
