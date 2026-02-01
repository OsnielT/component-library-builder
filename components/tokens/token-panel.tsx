'use client';

import { useState } from 'react';
import { useTokenStore } from '@/lib/store/use-token-store';
import { TokenList } from './token-list';
import { TokenEditor } from './token-editor';

export function TokenPanel() {
  const [isCreating, setIsCreating] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const { selectedToken, selectToken } = useTokenStore();

  const handleClose = () => {
    setIsCreating(false);
    selectToken(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Design Tokens</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-2 py-1 text-xs border rounded hover:bg-secondary"
              title="Usage guide"
            >
              ?
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              + New Token
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Manage your design system tokens
        </p>
        
        {/* Usage Guide */}
        {showGuide && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs space-y-2">
            <div className="font-semibold text-blue-900">How to use tokens in your code:</div>
            
            <div>
              <div className="font-medium text-blue-800 mb-1">1. Import the tokens CSS:</div>
              <code className="block bg-white p-2 rounded border text-[10px] font-mono">
                import &apos;./tokens.css&apos;;
              </code>
            </div>
            
            <div>
              <div className="font-medium text-blue-800 mb-1">2. Use in CSS/CSS Modules:</div>
              <code className="block bg-white p-2 rounded border text-[10px] font-mono">
                .button &#123;<br />
                &nbsp;&nbsp;background: var(--color-primary);<br />
                &nbsp;&nbsp;padding: var(--spacing-md);<br />
                &#125;
              </code>
            </div>
            
            <div>
              <div className="font-medium text-blue-800 mb-1">3. Use in inline styles:</div>
              <code className="block bg-white p-2 rounded border text-[10px] font-mono">
                style=&#123;&#123; color: &apos;var(--color-primary)&apos; &#125;&#125;
              </code>
            </div>
            
            <div className="pt-2 border-t border-blue-200">
              <div className="text-blue-700">
                💡 Hover over any token and click the copy icon to copy the CSS variable!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Token List or Editor */}
      <div className="flex-1 overflow-auto">
        {isCreating || selectedToken ? (
          <TokenEditor
            token={selectedToken}
            onClose={handleClose}
          />
        ) : (
          <TokenList />
        )}
      </div>
    </div>
  );
}
