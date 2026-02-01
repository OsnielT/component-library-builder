# Design Token-First Approach ✅

## What Changed

Migrated from CSS Modules to CSS Variables (Design Tokens) for component styling.

## Why This Approach

1. **Aligns with project goals** - This is a design token builder, tokens should be first-class
2. **Works perfectly in preview** - No module transformation needed
3. **Live token updates** - Change a token, see it update everywhere instantly
4. **Simpler architecture** - No CSS module scoping issues
5. **Better DX** - Users see tokens in action immediately

## How It Works

### 1. Tokens → CSS Variables

Tokens are automatically converted to CSS variables:

```typescript
// Token definition
{
  $type: 'color',
  $value: '#3b82f6',
  $extensions: {
    'com.component-builder': {
      id: 'color.primary',
      cssVariable: '--color-primary'
    }
  }
}

// Generated CSS
:root {
  --color-primary: #3b82f6;
}
```

### 2. Components Use CSS Variables

Generated components reference tokens via CSS variables:

```jsx
export const Button = ({ children, ...props }) => {
  return (
    <button 
      style={{
        background: 'var(--color-primary)',
        padding: 'var(--spacing-md)',
        color: 'var(--color-text-inverse)'
      }}
      {...props}
    >
      {children}
    </button>
  );
};
```

### 3. Live Preview

The preview automatically:
- Loads all CSS files (including tokens.css)
- Loads all component files
- Renders with live token values
- Updates when tokens change

## Component Generation

### Template Updates

**Component.tsx.hbs:**
- No CSS module import
- Uses inline styles with CSS variables
- Accepts `style` prop for overrides
- Clean, token-focused code

**Component.module.css.hbs:**
- Still generated for reference
- Contains token comments
- Can be used for complex styles

### Generated Component Example

```jsx
import React from 'react';
import { ButtonProps } from './Button.types';

/**
 * Button component
 * 
 * Uses design tokens via CSS variables for styling.
 * Tokens used: color.primary, spacing.md
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  style,
  ...rest
}) => {
  const componentStyle: React.CSSProperties = {
    background: 'var(--color-primary)',
    padding: 'var(--spacing-md)',
    ...style
  };

  return (
    <button 
      className={`button ${className}`}
      style={componentStyle}
      {...rest}
    >
      {children}
    </button>
  );
};
```

## Benefits

### For Users
- ✅ See tokens in action immediately
- ✅ Change tokens, see updates everywhere
- ✅ Understand token system through usage
- ✅ Export components that use standard CSS variables

### For Development
- ✅ No CSS module transformation needed
- ✅ Simpler preview implementation
- ✅ Faster preview updates
- ✅ No scoping issues

### For the Product
- ✅ Showcases the token system
- ✅ Differentiates from other builders
- ✅ Aligns with W3C Design Tokens spec
- ✅ Modern, maintainable approach

## Token Workflow

1. **Create Token** → Generates CSS variable in tokens.css
2. **Generate Component** → Component uses token via var()
3. **Preview Updates** → See component with token applied
4. **Update Token** → All components update automatically
5. **Export** → Components work anywhere with the tokens.css file

## Next Steps

- ✅ Templates updated to use CSS variables
- ✅ Preview supports all components
- ✅ Token system generates proper CSS
- ⏳ Add visual token editor enhancements
- ⏳ Add token usage tracking
- ⏳ Add token validation in components
