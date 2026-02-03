'use client';

interface SelectedElement {
  tagName: string;
  className: string;
  styles: CSSStyleDeclaration;
  selector: string;
}

interface StylePanelProps {
  selectedElement: SelectedElement | null;
  onStyleChange: (property: string, value: string) => void;
}

export function StylePanel({ selectedElement, onStyleChange }: StylePanelProps) {
  if (!selectedElement) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="text-4xl mb-2">🎨</div>
        <p className="text-sm">Click an element in the preview to edit its styles</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Element Info */}
      <div className="p-4 border-b bg-muted/30">
        <div className="text-xs text-muted-foreground mb-1">Selected Element</div>
        <div className="font-mono text-sm">{selectedElement.tagName}</div>
        {selectedElement.className && (
          <div className="font-mono text-xs text-muted-foreground mt-1">
            .{selectedElement.className}
          </div>
        )}
      </div>

      {/* Style Controls */}
      <div className="p-4 space-y-6">
        {/* Layout */}
        <StyleSection title="Layout">
          <StyleControl
            label="Display"
            property="display"
            value={selectedElement.styles.display}
            onChange={onStyleChange}
            type="select"
            options={['block', 'inline-block', 'flex', 'grid', 'none']}
          />
          <StyleControl
            label="Width"
            property="width"
            value={selectedElement.styles.width}
            onChange={onStyleChange}
            type="text"
          />
          <StyleControl
            label="Height"
            property="height"
            value={selectedElement.styles.height}
            onChange={onStyleChange}
            type="text"
          />
        </StyleSection>

        {/* Spacing */}
        <StyleSection title="Spacing">
          <StyleControl
            label="Padding"
            property="padding"
            value={selectedElement.styles.padding}
            onChange={onStyleChange}
            type="text"
          />
          <StyleControl
            label="Margin"
            property="margin"
            value={selectedElement.styles.margin}
            onChange={onStyleChange}
            type="text"
          />
        </StyleSection>

        {/* Typography */}
        <StyleSection title="Typography">
          <StyleControl
            label="Font Size"
            property="fontSize"
            value={selectedElement.styles.fontSize}
            onChange={onStyleChange}
            type="text"
          />
          <StyleControl
            label="Font Weight"
            property="fontWeight"
            value={selectedElement.styles.fontWeight}
            onChange={onStyleChange}
            type="select"
            options={['400', '500', '600', '700', '800', '900']}
          />
          <StyleControl
            label="Color"
            property="color"
            value={selectedElement.styles.color}
            onChange={onStyleChange}
            type="color"
          />
        </StyleSection>

        {/* Background */}
        <StyleSection title="Background">
          <StyleControl
            label="Background"
            property="backgroundColor"
            value={selectedElement.styles.backgroundColor}
            onChange={onStyleChange}
            type="color"
          />
        </StyleSection>

        {/* Border */}
        <StyleSection title="Border">
          <StyleControl
            label="Border Width"
            property="borderWidth"
            value={selectedElement.styles.borderWidth}
            onChange={onStyleChange}
            type="text"
          />
          <StyleControl
            label="Border Color"
            property="borderColor"
            value={selectedElement.styles.borderColor}
            onChange={onStyleChange}
            type="color"
          />
          <StyleControl
            label="Border Radius"
            property="borderRadius"
            value={selectedElement.styles.borderRadius}
            onChange={onStyleChange}
            type="text"
          />
        </StyleSection>
      </div>
    </div>
  );
}

function StyleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface StyleControlProps {
  label: string;
  property: string;
  value: string;
  onChange: (property: string, value: string) => void;
  type: 'text' | 'color' | 'select';
  options?: string[];
}

function StyleControl({ label, property, value, onChange, type, options }: StyleControlProps) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1">{label}</label>
      {type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(property, e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded"
          placeholder="auto"
        />
      )}
      {type === 'color' && (
        <div className="flex gap-2">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(property, e.target.value)}
            className="w-10 h-8 border rounded cursor-pointer"
          />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(property, e.target.value)}
            className="flex-1 px-2 py-1 text-sm border rounded font-mono"
            placeholder="#000000"
          />
        </div>
      )}
      {type === 'select' && options && (
        <select
          value={value || ''}
          onChange={(e) => onChange(property, e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded"
        >
          <option value="">Auto</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
