import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, RotateCcw } from 'lucide-react';

export type GradientType = 'linear' | 'radial';

export interface GradientStop {
  color: string;
  offset: number;
}

export interface GradientConfig {
  type: GradientType;
  angle: number;
  stops: GradientStop[];
}

interface DesignerGradientPickerProps {
  value: GradientConfig | null;
  onChange: (gradient: GradientConfig | null) => void;
  onApply: (gradient: GradientConfig) => void;
}

// Extended preset gradients organized by category
const GRADIENT_CATEGORIES = {
  Popular: [
    { type: 'linear' as const, angle: 180, stops: [{ color: '#667eea', offset: 0 }, { color: '#764ba2', offset: 100 }] },
    { type: 'linear' as const, angle: 135, stops: [{ color: '#f093fb', offset: 0 }, { color: '#f5576c', offset: 100 }] },
    { type: 'linear' as const, angle: 180, stops: [{ color: '#4facfe', offset: 0 }, { color: '#00f2fe', offset: 100 }] },
    { type: 'linear' as const, angle: 180, stops: [{ color: '#43e97b', offset: 0 }, { color: '#38f9d7', offset: 100 }] },
  ],
  Warm: [
    { type: 'linear' as const, angle: 180, stops: [{ color: '#fa709a', offset: 0 }, { color: '#fee140', offset: 100 }] },
    { type: 'linear' as const, angle: 90, stops: [{ color: '#ff0844', offset: 0 }, { color: '#ffb199', offset: 100 }] },
    { type: 'linear' as const, angle: 135, stops: [{ color: '#f6d365', offset: 0 }, { color: '#fda085', offset: 100 }] },
    { type: 'linear' as const, angle: 180, stops: [{ color: '#ff9a9e', offset: 0 }, { color: '#fecfef', offset: 100 }] },
    { type: 'linear' as const, angle: 135, stops: [{ color: '#ee9ca7', offset: 0 }, { color: '#ffdde1', offset: 100 }] },
    { type: 'linear' as const, angle: 180, stops: [{ color: '#feada6', offset: 0 }, { color: '#f5efef', offset: 100 }] },
  ],
  Cool: [
    { type: 'linear' as const, angle: 180, stops: [{ color: '#a18cd1', offset: 0 }, { color: '#fbc2eb', offset: 100 }] },
    { type: 'linear' as const, angle: 90, stops: [{ color: '#2193b0', offset: 0 }, { color: '#6dd5ed', offset: 100 }] },
    { type: 'linear' as const, angle: 90, stops: [{ color: '#00c6ff', offset: 0 }, { color: '#0072ff', offset: 100 }] },
    { type: 'linear' as const, angle: 180, stops: [{ color: '#667eea', offset: 0 }, { color: '#00d4ff', offset: 100 }] },
    { type: 'linear' as const, angle: 135, stops: [{ color: '#00b4db', offset: 0 }, { color: '#0083b0', offset: 100 }] },
    { type: 'linear' as const, angle: 180, stops: [{ color: '#89f7fe', offset: 0 }, { color: '#66a6ff', offset: 100 }] },
  ],
  Nature: [
    { type: 'linear' as const, angle: 135, stops: [{ color: '#11998e', offset: 0 }, { color: '#38ef7d', offset: 100 }] },
    { type: 'radial' as const, angle: 0, stops: [{ color: '#ffecd2', offset: 0 }, { color: '#fcb69f', offset: 100 }] },
    { type: 'linear' as const, angle: 90, stops: [{ color: '#c1c161', offset: 0 }, { color: '#d4d4b1', offset: 100 }] },
    { type: 'linear' as const, angle: 180, stops: [{ color: '#56ab2f', offset: 0 }, { color: '#a8e063', offset: 100 }] },
    { type: 'linear' as const, angle: 135, stops: [{ color: '#134e5e', offset: 0 }, { color: '#71b280', offset: 100 }] },
  ],
  Vibrant: [
    { type: 'linear' as const, angle: 180, stops: [{ color: '#FC466B', offset: 0 }, { color: '#3F5EFB', offset: 100 }] },
    { type: 'linear' as const, angle: 180, stops: [{ color: '#8E2DE2', offset: 0 }, { color: '#4A00E0', offset: 100 }] },
    { type: 'linear' as const, angle: 135, stops: [{ color: '#f857a6', offset: 0 }, { color: '#ff5858', offset: 100 }] },
    { type: 'linear' as const, angle: 180, stops: [{ color: '#7F00FF', offset: 0 }, { color: '#E100FF', offset: 100 }] },
    { type: 'linear' as const, angle: 90, stops: [{ color: '#F7971E', offset: 0 }, { color: '#FFD200', offset: 100 }] },
  ],
  Dark: [
    { type: 'linear' as const, angle: 180, stops: [{ color: '#0c0c0c', offset: 0 }, { color: '#3a3a3a', offset: 50 }, { color: '#0c0c0c', offset: 100 }] },
    { type: 'radial' as const, angle: 0, stops: [{ color: '#434343', offset: 0 }, { color: '#000000', offset: 100 }] },
    { type: 'linear' as const, angle: 180, stops: [{ color: '#232526', offset: 0 }, { color: '#414345', offset: 100 }] },
    { type: 'linear' as const, angle: 135, stops: [{ color: '#0f0c29', offset: 0 }, { color: '#302b63', offset: 50 }, { color: '#24243e', offset: 100 }] },
    { type: 'linear' as const, angle: 180, stops: [{ color: '#1a1a2e', offset: 0 }, { color: '#16213e', offset: 100 }] },
  ],
  Metallic: [
    { type: 'linear' as const, angle: 180, stops: [{ color: '#bdc3c7', offset: 0 }, { color: '#2c3e50', offset: 100 }] },
    { type: 'linear' as const, angle: 135, stops: [{ color: '#c9d6ff', offset: 0 }, { color: '#e2e2e2', offset: 100 }] },
    { type: 'linear' as const, angle: 180, stops: [{ color: '#D4AF37', offset: 0 }, { color: '#C5A028', offset: 50 }, { color: '#D4AF37', offset: 100 }] },
    { type: 'linear' as const, angle: 180, stops: [{ color: '#C0C0C0', offset: 0 }, { color: '#A8A8A8', offset: 50 }, { color: '#C0C0C0', offset: 100 }] },
  ],
};

// Flat list for backward compatibility
const PRESET_GRADIENTS: GradientConfig[] = Object.values(GRADIENT_CATEGORIES).flat();

const DEFAULT_GRADIENT: GradientConfig = {
  type: 'linear',
  angle: 180,
  stops: [
    { color: '#ffffff', offset: 0 },
    { color: '#e0e0e0', offset: 100 },
  ],
};

export function DesignerGradientPicker({
  value,
  onChange,
  onApply,
}: DesignerGradientPickerProps) {
  const [gradient, setGradient] = useState<GradientConfig>(value || DEFAULT_GRADIENT);

  const updateGradient = (updates: Partial<GradientConfig>) => {
    const newGradient = { ...gradient, ...updates };
    setGradient(newGradient);
    onChange(newGradient);
  };

  const updateStop = (index: number, updates: Partial<GradientStop>) => {
    const newStops = [...gradient.stops];
    newStops[index] = { ...newStops[index], ...updates };
    updateGradient({ stops: newStops });
  };

  const addStop = () => {
    if (gradient.stops.length >= 5) return;
    const lastStop = gradient.stops[gradient.stops.length - 1];
    const newStop: GradientStop = {
      color: '#888888',
      offset: Math.min(lastStop.offset + 20, 100),
    };
    updateGradient({ stops: [...gradient.stops, newStop].sort((a, b) => a.offset - b.offset) });
  };

  const removeStop = (index: number) => {
    if (gradient.stops.length <= 2) return;
    const newStops = gradient.stops.filter((_, i) => i !== index);
    updateGradient({ stops: newStops });
  };

  const selectPreset = (preset: GradientConfig) => {
    setGradient(preset);
    onChange(preset);
  };

  const getCssGradient = (g: GradientConfig) => {
    const stopsStr = g.stops.map(s => `${s.color} ${s.offset}%`).join(', ');
    if (g.type === 'radial') {
      return `radial-gradient(circle, ${stopsStr})`;
    }
    return `linear-gradient(${g.angle}deg, ${stopsStr})`;
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <Label className="text-xs text-muted-foreground">Preset Gradients</Label>
        {Object.entries(GRADIENT_CATEGORIES).map(([category, gradients]) => (
          <div key={category} className="space-y-1">
            <span className="text-[10px] text-muted-foreground/70">{category}</span>
            <div className="grid grid-cols-6 gap-1">
              {gradients.map((preset, idx) => (
                <button
                  key={idx}
                  className="w-7 h-7 rounded border-2 border-transparent hover:border-primary transition-all hover:scale-110"
                  style={{ background: getCssGradient(preset) }}
                  onClick={() => selectPreset(preset)}
                  title={category}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Gradient Type</Label>
        <Select value={gradient.type} onValueChange={(v) => updateGradient({ type: v as GradientType })}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="linear" className="text-xs">Linear</SelectItem>
            <SelectItem value="radial" className="text-xs">Radial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {gradient.type === 'linear' && (
        <div className="space-y-2">
          <Label className="text-xs">Angle: {gradient.angle}°</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[gradient.angle]}
              onValueChange={([v]) => updateGradient({ angle: v })}
              min={0}
              max={360}
              step={1}
              className="flex-1"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => updateGradient({ angle: 0 })}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Color Stops</Label>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 text-[10px] px-2"
            onClick={addStop}
            disabled={gradient.stops.length >= 5}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-1.5">
          {gradient.stops.map((stop, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <Input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(idx, { color: e.target.value })}
                className="w-7 h-7 p-0.5 cursor-pointer"
              />
              <Input
                type="number"
                value={stop.offset}
                onChange={(e) => updateStop(idx, { offset: Number(e.target.value) })}
                min={0}
                max={100}
                className="w-14 h-7 text-xs"
              />
              <span className="text-[10px] text-muted-foreground">%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => removeStop(idx)}
                disabled={gradient.stops.length <= 2}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-1">
        <Label className="text-xs">Preview</Label>
        <div 
          className="h-10 rounded border"
          style={{ background: getCssGradient(gradient) }}
        />
      </div>

      <Button className="w-full h-8 text-xs" onClick={() => onApply(gradient)}>
        Apply Gradient
      </Button>
    </div>
  );
}

// Helper to convert gradient config to Fabric.js gradient
export function gradientConfigToFabric(config: GradientConfig, width: number, height: number) {
  // Convert stops to Fabric.js format with proper keys
  const colorStops: Record<string, string> = {};
  config.stops.forEach(stop => {
    // Ensure offset is between 0 and 1
    const offset = Math.max(0, Math.min(1, stop.offset / 100));
    colorStops[offset.toString()] = stop.color;
  });

  if (config.type === 'radial') {
    return {
      type: 'radial' as const,
      coords: {
        x1: width / 2,
        y1: height / 2,
        x2: width / 2,
        y2: height / 2,
        r1: 0,
        r2: Math.max(width, height) / 2,
      },
      colorStops,
    };
  }

  // Calculate linear gradient coordinates based on angle
  const angleRad = ((config.angle - 90) * Math.PI) / 180; // Adjust angle for CSS compatibility
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  // Calculate start and end points based on angle
  const x1 = width / 2 - (cos * width) / 2;
  const y1 = height / 2 - (sin * height) / 2;
  const x2 = width / 2 + (cos * width) / 2;
  const y2 = height / 2 + (sin * height) / 2;

  return {
    type: 'linear' as const,
    coords: { x1, y1, x2, y2 },
    colorStops,
  };
}
