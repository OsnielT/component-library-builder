'use client';

import { useState, useEffect } from 'react';
import { useTokenStore } from '@/lib/store/use-token-store';
import { TokenValidator } from '@/lib/core/token-validator';
import type { DesignToken, TokenType, TokenCategory } from '@/types';

interface TokenEditorProps {
  token: DesignToken | null;
  onClose: () => void;
}

const validator = new TokenValidator();

export function TokenEditor({ token, onClose }: TokenEditorProps) {
  const { tokens, addToken, updateToken } = useTokenStore();
  
  const [formData, setFormData] = useState({
    id: '',
    cssVariable: '',
    type: 'color' as TokenType,
    value: '',
    category: 'primitive' as TokenCategory,
    description: '',
    isReference: false,
  });
  
  const [errors, setErrors] = useState<string[]>([]);

  // Get available tokens for references (excluding current token)
  const availableTokens = tokens.filter(t => {
    const tokenId = t.$extensions?.['com.component-builder']?.id;
    return tokenId !== formData.id && t.$type === formData.type;
  });

  useEffect(() => {
    if (token) {
      const ext = token.$extensions?.['com.component-builder'];
      const value = String(token.$value);
      const isReference = value.startsWith('{') && value.endsWith('}');
      
      setFormData({
        id: ext?.id || '',
        cssVariable: ext?.cssVariable || '',
        type: token.$type,
        value: isReference ? value.slice(1, -1) : value,
        category: ext?.category || 'primitive',
        description: token.$description || '',
        isReference,
      });
    }
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the ID on submit
    const formattedId = formData.id
      .toLowerCase()
      .replace(/[^a-z0-9.\s-]/g, '')
      .replace(/[\s-]+/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\.+|\.+$/g, '');
    
    // Format value based on whether it's a reference
    const finalValue = formData.isReference 
      ? `{${formData.value}}`
      : (formData.type === 'fontWeight' ? Number(formData.value) : formData.value);

    const newToken: DesignToken = {
      $type: formData.type,
      $value: finalValue,
      $description: formData.description || undefined,
      $extensions: {
        'com.component-builder': {
          id: formattedId, // Use formatted ID
          cssVariable: formData.cssVariable,
          category: formData.category,
        },
      },
    };

    const validation = validator.validate(newToken);
    
    if (!validation.valid) {
      setErrors(validation.errors || []);
      return;
    }

    if (token) {
      const oldId = token.$extensions?.['com.component-builder']?.id || '';
      updateToken(oldId, newToken);
    } else {
      addToken(newToken);
    }

    onClose();
  };

  const handleIdChange = (id: string) => {
    // Auto-format for CSS variable preview only
    const formatted = id
      .toLowerCase()
      .replace(/[^a-z0-9.\s-]/g, '') // Remove invalid characters
      .replace(/[\s-]+/g, '.') // Replace spaces and hyphens with dots
      .replace(/\.+/g, '.') // Replace multiple dots with single dot
      .replace(/^\.+|\.+$/g, ''); // Remove leading/trailing dots
    
    setFormData({
      ...formData,
      id, // Keep original input as typed
      cssVariable: `--${formatted.replace(/\./g, '-')}`,
    });
  };

  const handleCategoryChange = (category: TokenCategory) => {
    setFormData({
      ...formData,
      category,
      // Suggest using references for semantic/component tokens
      isReference: category !== 'primitive' && formData.isReference === false ? true : formData.isReference,
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {token ? 'Edit Token' : 'New Token'}
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-2xl leading-none"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Token ID */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Token ID <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => handleIdChange(e.target.value)}
            placeholder="Color Primary or color.primary"
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Type freely - see formatted version in CSS Variable below
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Category <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['primitive', 'semantic', 'component'] as TokenCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-2 text-sm rounded border transition-colors ${
                  formData.category === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-accent border-border'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formData.category === 'primitive' && 'Base values (e.g., blue-500, spacing-4)'}
            {formData.category === 'semantic' && 'Contextual tokens (e.g., primary, background)'}
            {formData.category === 'component' && 'Component-specific tokens'}
          </p>
        </div>

        {/* Token Type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Type <span className="text-destructive">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as TokenType })}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="color">Color</option>
            <option value="dimension">Dimension</option>
            <option value="fontFamily">Font Family</option>
            <option value="fontWeight">Font Weight</option>
            <option value="fontSize">Font Size</option>
            <option value="lineHeight">Line Height</option>
            <option value="letterSpacing">Letter Spacing</option>
            <option value="duration">Duration</option>
            <option value="shadow">Shadow</option>
            <option value="border">Border</option>
          </select>
        </div>

        {/* Reference Toggle */}
        <div className="flex items-center gap-2 p-3 bg-accent/50 rounded">
          <input
            type="checkbox"
            id="isReference"
            checked={formData.isReference}
            onChange={(e) => setFormData({ ...formData, isReference: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="isReference" className="text-sm font-medium cursor-pointer">
            Reference another token
          </label>
        </div>

        {/* Value */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Value <span className="text-destructive">*</span>
          </label>
          
          {formData.isReference ? (
            // Reference selector
            <select
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select a token...</option>
              {availableTokens.map((t) => {
                const id = t.$extensions?.['com.component-builder']?.id || '';
                // Convert dot notation to readable format: color.blue.500 -> Color Blue 500
                const displayName = id
                  .split('.')
                  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(' ');
                return (
                  <option key={id} value={id}>
                    {displayName}
                  </option>
                );
              })}
            </select>
          ) : formData.type === 'color' ? (
            // Color picker
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.value.startsWith('#') ? formData.value : '#000000'}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="#ff0000 or rgb(255, 0, 0)"
                className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          ) : (
            // Text input
            <input
              type="text"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder={
                formData.type === 'dimension' ? '16px or 1rem' :
                formData.type === 'fontWeight' ? '400' :
                formData.type === 'fontFamily' ? 'Inter, sans-serif' :
                'value'
              }
              className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          )}
          
          {formData.isReference && availableTokens.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              No {formData.type} tokens available to reference. Create a primitive token first.
            </p>
          )}
        </div>

        {/* CSS Variable (auto-generated, read-only) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            CSS Variable
          </label>
          <input
            type="text"
            value={formData.cssVariable}
            readOnly
            className="w-full px-3 py-2 border rounded text-sm bg-muted cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Auto-generated from token ID
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe this token's purpose..."
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            rows={2}
          />
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded">
            <p className="text-sm font-medium text-destructive mb-1">Validation Errors:</p>
            <ul className="text-xs text-destructive space-y-1">
              {errors.map((error, i) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 font-medium transition-colors"
          >
            {token ? 'Update Token' : 'Create Token'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-accent transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
