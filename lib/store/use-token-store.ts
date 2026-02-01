/**
 * Token Store
 * Manages design tokens state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DesignToken } from '@/types';
import { CSSGenerator } from '@/lib/core/css-generator';
import { useEditorStore } from './use-editor-store';

interface TokenState {
  tokens: DesignToken[];
  selectedToken: DesignToken | null;
  addToken: (token: DesignToken) => void;
  updateToken: (id: string, updates: Partial<DesignToken>) => void;
  deleteToken: (id: string) => void;
  selectToken: (token: DesignToken | null) => void;
  regenerateCSS: () => void;
  setTokens: (tokens: DesignToken[]) => void;
  clearTokens: () => void;
}

const cssGenerator = new CSSGenerator();

export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      tokens: [],
      selectedToken: null,

      addToken: (token) => {
        set((state) => ({ tokens: [...state.tokens, token] }));
        get().regenerateCSS();
      },

      updateToken: (id, updates) => {
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.$extensions?.['com.component-builder']?.id === id ? { ...t, ...updates } : t
          ),
        }));
        get().regenerateCSS();
      },

      deleteToken: (id) => {
        set((state) => ({
          tokens: state.tokens.filter((t) => t.$extensions?.['com.component-builder']?.id !== id),
          selectedToken:
            state.selectedToken?.$extensions?.['com.component-builder']?.id === id
              ? null
              : state.selectedToken,
        }));
        get().regenerateCSS();
      },

      selectToken: (token) => set({ selectedToken: token }),

      regenerateCSS: () => {
        const { tokens } = get();
        const css = cssGenerator.generate(tokens);
        useEditorStore.getState().updateFile('/tokens.css', css);
      },

      setTokens: (tokens) => {
        set({ tokens });
        get().regenerateCSS();
      },

      clearTokens: () => {
        set({ tokens: [], selectedToken: null });
        get().regenerateCSS();
      },
    }),
    {
      name: 'token-store',
      partialize: (state) => ({
        tokens: state.tokens,
      }),
    }
  )
);
