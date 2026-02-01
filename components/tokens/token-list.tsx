'use client';

import { useState } from 'react';
import { useTokenStore } from '@/lib/store/use-token-store';
import type { DesignToken } from '@/types';

export function TokenList() {
  const { tokens, selectToken, deleteToken } = useTokenStore();
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const copyToClipboard = async (text: string, cssVar: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVar(cssVar);
      setTimeout(() => setCopiedVar(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const groupedTokens = tokens.reduce((acc, token) => {
    const category = token.$extensions?.['com.component-builder']?.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(token);
    return acc;
  }, {} as Record<string, DesignToken[]>);

  // Sort categories: primitive, semantic, component, other
  const categoryOrder = ['primitive', 'semantic', 'component', 'other'];
  const sortedCategories = Object.keys(groupedTokens).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  if (tokens.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">🎨</div>
        <p className="text-sm font-medium mb-1">No tokens yet</p>
        <p className="text-xs text-muted-foreground">
          Click &apos;New Token&apos; to create your first design token
        </p>
      </div>
    );
  }

  const isReference = (value: string | number) => {
    const str = String(value);
    return str.startsWith('{') && str.endsWith('}');
  };

  return (
    <div className="p-2">
      {sortedCategories.map((category) => {
        const categoryTokens = groupedTokens[category];
        
        return (
          <div key={category} className="mb-6">
            <div className="flex items-center gap-2 px-2 mb-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                {category}
              </h3>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">
                {categoryTokens.length}
              </span>
            </div>
            
            <div className="space-y-1">
              {categoryTokens.map((token) => {
                const id = token.$extensions?.['com.component-builder']?.id || '';
                const cssVar = token.$extensions?.['com.component-builder']?.cssVariable || '';
                const value = String(token.$value);
                const hasReference = isReference(value);
                
                return (
                  <div
                    key={id}
                    className="group flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors border border-transparent hover:border-border"
                    onClick={() => selectToken(token)}
                  >
                    {/* Color preview or type icon */}
                    <div className="flex-shrink-0">
                      {token.$type === 'color' && !hasReference ? (
                        <div
                          className="w-10 h-10 rounded-md border-2 shadow-sm"
                          style={{ backgroundColor: value }}
                          title={value}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md border-2 bg-muted flex items-center justify-center text-xs font-medium">
                          {token.$type === 'dimension' && '📏'}
                          {token.$type === 'fontFamily' && 'Aa'}
                          {token.$type === 'fontWeight' && 'B'}
                          {token.$type === 'fontSize' && 'T'}
                          {(token.$type === 'color' && hasReference) && '🔗'}
                          {!['color', 'dimension', 'fontFamily', 'fontWeight', 'fontSize'].includes(token.$type) && '•'}
                        </div>
                      )}
                    </div>
                    
                    {/* Token info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm font-medium truncate">{id}</div>
                        {hasReference && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                            ref
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 group/var">
                        <div className="text-xs text-muted-foreground font-mono truncate">
                          {cssVar}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(`var(${cssVar})`, cssVar);
                          }}
                          className="opacity-0 group-hover/var:opacity-100 p-1 hover:bg-secondary rounded transition-all"
                          title="Copy CSS variable"
                        >
                          {copiedVar === cssVar ? (
                            <span className="text-xs text-green-600">✓</span>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {token.$description && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {token.$description}
                        </div>
                      )}
                    </div>
                    
                    {/* Value display */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs font-mono text-muted-foreground max-w-[120px] truncate">
                        {hasReference ? (
                          <span className="text-blue-600">{value}</span>
                        ) : (
                          value
                        )}
                      </div>
                    </div>
                    
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete token "${id}"?`)) {
                          deleteToken(id);
                        }
                      }}
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded transition-all"
                      title="Delete token"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
