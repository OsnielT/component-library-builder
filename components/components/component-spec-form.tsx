'use client';

import { useState, useEffect } from 'react';
import type { ComponentSpec, ComponentType, PropDefinition, VariantConfig } from '@/types';
import { useTokenStore } from '@/lib/store/use-token-store';

interface ComponentSpecFormProps {
  spec: ComponentSpec | null;
  onSubmit: (spec: ComponentSpec) => void;
  onCancel: () => void;
}

export function ComponentSpecForm({ spec, onSubmit, onCancel }: ComponentSpecFormProps) {
  const { tokens } = useTokenStore();

  const [formData, setFormData] = useState<ComponentSpec>({
    name: '',
    description: '',
    version: '1.0.0',
    type: 'primitive' as ComponentType,
    props: [],
    tokens: [],
    variants: [],
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [tokenSearch, setTokenSearch] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['component', 'semantic', 'primitive'])
  );

  useEffect(() => {
    if (spec) {
      setFormData(spec);
    }
  }, [spec]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-format component name to PascalCase
    const formatToPascalCase = (str: string): string => {
      return str
        .trim()
        .split(/[\s-_]+/) // Split on spaces, hyphens, underscores
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
    };

    const formattedName = formatToPascalCase(formData.name);

    // Validate component name
    const validationErrors: string[] = [];

    if (!formattedName) {
      validationErrors.push('Component name is required');
    } else if (!/^[A-Z][a-zA-Z0-9]*$/.test(formattedName)) {
      validationErrors.push(`Component name must contain only letters and numbers. Got: "${formattedName}"`);
    }

    // Update formData with formatted name
    const updatedFormData = { ...formData, name: formattedName };

    // Validate props
    for (const prop of updatedFormData.props) {
      if (!prop.name) {
        validationErrors.push('All props must have a name');
      } else if (!/^[a-z][a-zA-Z0-9]*$/.test(prop.name)) {
        validationErrors.push(`Prop name '${prop.name}' must be camelCase`);
      }
      if (!prop.type) {
        validationErrors.push(`Prop '${prop.name}' must have a type`);
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Update the form data with formatted name
    setFormData(updatedFormData);

    onSubmit(updatedFormData);
  };

  const addProp = () => {
    setFormData({
      ...formData,
      props: [
        ...formData.props,
        { name: '', type: 'string', required: false, description: '' },
      ],
    });
  };

  const updateProp = (index: number, updates: Partial<PropDefinition>) => {
    const newProps = [...formData.props];
    newProps[index] = { ...newProps[index], ...updates };
    setFormData({ ...formData, props: newProps });
  };

  const removeProp = (index: number) => {
    setFormData({
      ...formData,
      props: formData.props.filter((_, i) => i !== index),
    });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...(formData.variants || []),
        { name: '', props: {}, tokens: {} },
      ],
    });
  };

  const updateVariant = (index: number, updates: Partial<VariantConfig>) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], ...updates };
    setFormData({ ...formData, variants: newVariants });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants?.filter((_, i) => i !== index),
    });
  };

  const toggleToken = (tokenId: string) => {
    const isSelected = formData.tokens.includes(tokenId);
    setFormData({
      ...formData,
      tokens: isSelected
        ? formData.tokens.filter((id) => id !== tokenId)
        : [...formData.tokens, tokenId],
    });
  };

  const copyTokenVariable = async (cssVar: string) => {
    try {
      await navigator.clipboard.writeText(`var(${cssVar})`);
      setCopiedToken(cssVar);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Filter tokens based on search
  const filteredTokens = tokens.filter((token) => {
    const tokenId = token.$extensions?.['com.component-builder']?.id || '';
    const cssVar = token.$extensions?.['com.component-builder']?.cssVariable || '';
    const searchLower = tokenSearch.toLowerCase();
    return (
      tokenId.toLowerCase().includes(searchLower) ||
      cssVar.toLowerCase().includes(searchLower) ||
      String(token.$value).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-4">
      {/* {!spec &&
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            New Component
          </h3>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
      } */}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Basic Information</h4>

          {/* Component Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Component Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Text component or TextComponent"
              className="w-full px-3 py-2 border rounded text-sm"
              required
            />
          </div>

          {/* Component Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ComponentType })}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="primitive">Primitive</option>
              <option value="composite">Composite</option>
              <option value="layout">Layout</option>
              <option value="utility">Utility</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this component..."
              className="w-full px-3 py-2 border rounded text-sm"
              rows={2}
            />
          </div>
        </div>
<hr></hr>
        {/* Props Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Props</h4>
            <button
              type="button"
              onClick={addProp}
              className="px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/80"
            >
              + Add Prop
            </button>
          </div>

          {formData.props.length === 0 ? (
            <p className="text-xs text-muted-foreground">No props defined</p>
          ) : (
            <div className="space-y-3">
              {formData.props.map((prop, index) => (
                <div key={index} className="p-3 border rounded space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={prop.name}
                      onChange={(e) => updateProp(index, { name: e.target.value })}
                      placeholder="propName"
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                    <select
                      value={prop.type}
                      onChange={(e) => updateProp(index, { type: e.target.value })}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    >
                      <optgroup label="Primitives">
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="any">any</option>
                        <option value="unknown">unknown</option>
                        <option value="void">void</option>
                        <option value="null">null</option>
                        <option value="undefined">undefined</option>
                      </optgroup>
                      <optgroup label="Arrays">
                        <option value="string[]">string[]</option>
                        <option value="number[]">number[]</option>
                        <option value="boolean[]">boolean[]</option>
                        <option value="any[]">any[]</option>
                      </optgroup>
                      <optgroup label="React Types">
                        <option value="React.ReactNode">React.ReactNode</option>
                        <option value="React.ReactElement">React.ReactElement</option>
                        <option value="React.CSSProperties">React.CSSProperties</option>
                        <option value="React.MouseEvent">React.MouseEvent</option>
                        <option value="React.ChangeEvent">React.ChangeEvent</option>
                        <option value="React.FormEvent">React.FormEvent</option>
                        <option value="React.KeyboardEvent">React.KeyboardEvent</option>
                        <option value="React.FocusEvent">React.FocusEvent</option>
                      </optgroup>
                      <optgroup label="Functions">
                        <option value="() => void">() =&gt; void</option>
                        <option value="(event: React.MouseEvent) => void">(event: React.MouseEvent) =&gt; void</option>
                        <option value="(event: React.ChangeEvent) => void">(event: React.ChangeEvent) =&gt; void</option>
                        <option value="(value: string) => void">(value: string) =&gt; void</option>
                        <option value="(value: number) => void">(value: number) =&gt; void</option>
                        <option value="(value: boolean) => void">(value: boolean) =&gt; void</option>
                      </optgroup>
                      <optgroup label="Objects">
                        <option value="Record<string, any>">Record&lt;string, any&gt;</option>
                        <option value="Record<string, string>">Record&lt;string, string&gt;</option>
                        <option value="{ [key: string]: any }">&#123; [key: string]: any &#125;</option>
                      </optgroup>
                      <optgroup label="Unions">
                        <option value="string | number">string | number</option>
                        <option value="'small' | 'medium' | 'large'">'small' | 'medium' | 'large'</option>
                        <option value="'left' | 'center' | 'right'">'left' | 'center' | 'right'</option>
                      </optgroup>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeProp(index)}
                      className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={prop.required}
                        onChange={(e) => updateProp(index, { required: e.target.checked })}
                      />
                      Required
                    </label>
                    <input
                      type="text"
                      value={prop.description || ''}
                      onChange={(e) => updateProp(index, { description: e.target.value })}
                      placeholder="Description (optional)"
                      className="flex-1 px-2 py-1 border rounded text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
<hr></hr>
        {/* Token Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Design Tokens</h4>
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
              {formData.tokens.length} selected
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Select tokens to use in your component. Click the copy icon to copy the CSS variable.
          </p>

          {tokens.length === 0 ? (
            <div className="p-4 border border-dashed rounded text-center">
              <p className="text-sm text-muted-foreground mb-2">No tokens available</p>
              <p className="text-xs text-muted-foreground">
                Switch to the Tokens tab to create design tokens first
              </p>
            </div>
          ) : (
            <div className="border rounded">
              {/* Search Bar */}
              <div className="p-2 border-b bg-muted/30">
                <input
                  type="text"
                  value={tokenSearch}
                  onChange={(e) => setTokenSearch(e.target.value)}
                  placeholder="Search tokens..."
                  className="w-full px-3 py-1.5 text-sm border rounded"
                />
              </div>

              {/* Selected Tokens Summary */}
              {formData.tokens.length > 0 && (
                <div className="p-2 border-b bg-blue-50">
                  <div className="text-xs font-medium text-blue-900 mb-1">
                    Selected Tokens:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.tokens.map((tokenId) => {
                      const token = tokens.find(
                        (t) => t.$extensions?.['com.component-builder']?.id === tokenId
                      );
                      const cssVar = token?.$extensions?.['com.component-builder']?.cssVariable || '';

                      return (
                        <div
                          key={tokenId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          <span className="font-mono">{cssVar}</span>
                          <button
                            type="button"
                            onClick={() => toggleToken(tokenId)}
                            className="hover:text-blue-900"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Token List */}
              <div className="max-h-80 overflow-y-auto">
                {filteredTokens.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No tokens match your search
                  </div>
                ) : (
                  <div className="p-2">
                    {['component', 'semantic', 'primitive'].map((category) => {
                      const categoryTokens = filteredTokens.filter(
                        (t) => t.$extensions?.['com.component-builder']?.category === category
                      );

                      if (categoryTokens.length === 0) return null;

                      return (
                        <div key={category} className="mb-2">
                          <button
                            type="button"
                            onClick={() => toggleCategory(category)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded transition-colors"
                          >
                            <svg
                              className={`w-3 h-3 transition-transform ${expandedCategories.has(category) ? 'rotate-90' : ''
                                }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <h5 className="text-xs font-semibold uppercase text-muted-foreground">
                              {category}
                            </h5>
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs text-muted-foreground">
                              {categoryTokens.length}
                            </span>
                          </button>

                          {expandedCategories.has(category) && (
                            <div className="space-y-1 mt-1">
                              {categoryTokens.map((token) => {
                                const tokenId = token.$extensions?.['com.component-builder']?.id || '';
                                const cssVar = token.$extensions?.['com.component-builder']?.cssVariable || '';
                                const isSelected = formData.tokens.includes(tokenId);
                                const value = String(token.$value);
                                const isReference = value.startsWith('{') && value.endsWith('}');

                                return (
                                  <div
                                    key={tokenId}
                                    className={`group flex items-center gap-2 p-2 rounded border transition-colors ${isSelected
                                      ? 'bg-primary/5 border-primary/20'
                                      : 'border-transparent hover:bg-accent'
                                      }`}
                                  >
                                    {/* Checkbox */}
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleToken(tokenId)}
                                      className="cursor-pointer flex-shrink-0"
                                    />

                                    {/* Color Preview */}
                                    {token.$type === 'color' && !isReference && (
                                      <div
                                        className="w-6 h-6 rounded border-2 flex-shrink-0"
                                        style={{ backgroundColor: value }}
                                        title={value}
                                      />
                                    )}

                                    {/* Token Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-medium truncate">{tokenId}</div>
                                      <div className="flex items-center gap-1">
                                        <code className="text-xs text-muted-foreground font-mono truncate">
                                          {cssVar}
                                        </code>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            copyTokenVariable(cssVar);
                                          }}
                                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-secondary rounded transition-all"
                                          title="Copy CSS variable"
                                        >
                                          {copiedToken === cssVar ? (
                                            <span className="text-xs text-green-600">✓</span>
                                          ) : (
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Value */}
                                    <div className="text-xs text-muted-foreground font-mono flex-shrink-0 truncate">
                                      {isReference ? (
                                        <span className="text-blue-600">{value}</span>
                                      ) : (
                                        value
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Variants Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Variants</h4>
            <button
              type="button"
              onClick={addVariant}
              className="px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/80"
            >
              + Add Variant
            </button>
          </div>

          {!formData.variants || formData.variants.length === 0 ? (
            <p className="text-xs text-muted-foreground">No variants defined</p>
          ) : (
            <div className="space-y-3">
              {formData.variants.map((variant, index) => (
                <div key={index} className="p-3 border rounded space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, { name: e.target.value })}
                      placeholder="primary"
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Variant props can be configured after generation
                  </p>
                </div>
              ))}
            </div>
          )}
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
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            {spec ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
