import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Strikethrough,
  CaseLower, CaseUpper, Type, Minus, Plus, Palette, Droplets, WrapText, Scaling,
  CaseSensitive
} from 'lucide-react';
import { DesignerGradientPicker, GradientConfig, gradientConfigToFabric } from './DesignerGradientPicker';
import { Gradient } from 'fabric';
import { applyAutoFontSize } from '@/lib/autoFontSize';

// Debounced number input component to prevent cursor jumping
interface DebouncedNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

function DebouncedNumberInput({ value, onChange, min, max, step = 1, className, disabled }: DebouncedNumberInputProps) {
  const [localValue, setLocalValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Only update local value if input is not focused
    if (document.activeElement !== inputRef.current) {
      setLocalValue(String(value));
    }
  }, [value]);
  
  const commitValue = useCallback(() => {
    const num = parseFloat(localValue);
    if (!isNaN(num)) {
      let finalValue = num;
      if (min !== undefined) finalValue = Math.max(min, finalValue);
      if (max !== undefined) finalValue = Math.min(max, finalValue);
      onChange(finalValue);
      setLocalValue(String(finalValue));
    } else {
      setLocalValue(String(value));
    }
  }, [localValue, value, onChange, min, max]);
  
  return (
    <Input
      ref={inputRef}
      type="number"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={commitValue}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commitValue();
          inputRef.current?.blur();
        }
      }}
      min={min}
      max={max}
      step={step}
      className={className}
      disabled={disabled}
    />
  );
}

const FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Playfair Display', 'Nunito', 'Inter', 'DM Sans'
];

// Organized color palette by category
const COLOR_CATEGORIES = {
  Basic: ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
  Pastel: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4', '#D4F0F0', '#FCE1E4'],
  Vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
  Dark: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#2C3E50', '#1B4332', '#3D0C02', '#1C1C1C'],
  Neutral: ['#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161', '#424242', '#212121'],
};

interface TextSettings {
  fontSize: number;
  fontFamily: string;
  fill: string;
  textCase: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'sentence';
  autoFontSize: boolean;
  wordWrap: boolean;
}

interface DesignerTextToolbarProps {
  selectedObject: any;
  canvas: any;
  onUpdate: () => void;
  customFonts?: string[];
  onTextSettingsChange?: (settings: Partial<TextSettings>) => void;
}

export function DesignerTextToolbar({ selectedObject, canvas, onUpdate, customFonts = [], onTextSettingsChange }: DesignerTextToolbarProps) {
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState<string | number>('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  const [underline, setUnderline] = useState(false);
  const [linethrough, setLinethrough] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [textColor, setTextColor] = useState('#000000');
  const [textCase, setTextCase] = useState<'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'sentence'>('none');
  const [charSpacing, setCharSpacing] = useState(0);
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(4);
  const [shadowOffsetX, setShadowOffsetX] = useState(2);
  const [shadowOffsetY, setShadowOffsetY] = useState(2);
  const [autoFontSize, setAutoFontSize] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [gradientConfig, setGradientConfig] = useState<GradientConfig | null>(null);

  const isTextObject = selectedObject?.type === 'textbox' || selectedObject?.type === 'i-text';

  useEffect(() => {
    if (!selectedObject || !isTextObject) return;
    
    setFontSize(selectedObject.fontSize || 16);
    setFontFamily(selectedObject.fontFamily || 'Arial');
    setFontWeight(selectedObject.fontWeight || 'normal');
    setFontStyle(selectedObject.fontStyle || 'normal');
    setUnderline(selectedObject.underline || false);
    setLinethrough(selectedObject.linethrough || false);
    setTextAlign(selectedObject.textAlign || 'left');
    setTextColor(typeof selectedObject.fill === 'string' ? selectedObject.fill : '#000000');
    setTextCase(selectedObject.data?.textCase || 'none');
    setCharSpacing(selectedObject.charSpacing || 0);
    setStrokeWidth(selectedObject.strokeWidth || 0);
    setStrokeColor(selectedObject.stroke || '#000000');
    setShadowEnabled(!!selectedObject.shadow);
    if (selectedObject.shadow) {
      setShadowColor(selectedObject.shadow.color || '#000000');
      setShadowBlur(selectedObject.shadow.blur || 4);
      setShadowOffsetX(selectedObject.shadow.offsetX || 2);
      setShadowOffsetY(selectedObject.shadow.offsetY || 2);
    }
    setAutoFontSize(selectedObject.data?.autoFontSize || false);
    setWordWrap(selectedObject.splitByGrapheme !== false);
  }, [selectedObject, isTextObject]);

  const updateProperty = (key: string, value: any) => {
    if (!selectedObject || !canvas) return;
    selectedObject.set(key, value);
    canvas.requestRenderAll();
    onUpdate();
    
    // Notify parent about text settings changes for persistence
    if (key === 'fontSize' && onTextSettingsChange) {
      onTextSettingsChange({ fontSize: value });
    } else if (key === 'fontFamily' && onTextSettingsChange) {
      onTextSettingsChange({ fontFamily: value });
    } else if (key === 'fill' && typeof value === 'string' && onTextSettingsChange) {
      onTextSettingsChange({ fill: value });
    }
  };

  const updateStroke = (width: number, color: string) => {
    if (!selectedObject || !canvas) return;
    // Use paintFirst: 'stroke' so stroke appears behind text, not reducing thickness
    selectedObject.set({
      stroke: color,
      strokeWidth: width,
      paintFirst: 'stroke', // Critical: stroke renders behind fill
    });
    canvas.requestRenderAll();
    onUpdate();
  };

  const updateShadow = (enabled: boolean, color?: string, blur?: number, offsetX?: number, offsetY?: number) => {
    if (!selectedObject || !canvas) return;
    
    if (enabled) {
      selectedObject.set('shadow', {
        color: color || shadowColor,
        blur: blur !== undefined ? blur : shadowBlur,
        offsetX: offsetX !== undefined ? offsetX : shadowOffsetX,
        offsetY: offsetY !== undefined ? offsetY : shadowOffsetY,
      });
    } else {
      selectedObject.set('shadow', null);
    }
    canvas.requestRenderAll();
    onUpdate();
  };

  const updateTextCase = (newCase: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'sentence') => {
    if (!selectedObject || !canvas) return;
    
    setTextCase(newCase);
    
    // Store original text if not already stored
    if (!selectedObject.data) selectedObject.data = {};
    if (!selectedObject.data.originalText) {
      selectedObject.data.originalText = selectedObject.text;
    }
    selectedObject.data.textCase = newCase;
    
    // Get the original text to transform
    const originalText = selectedObject.data.originalText || selectedObject.text || '';
    
    // Apply text transformation
    let transformedText = originalText;
    switch (newCase) {
      case 'uppercase':
        transformedText = originalText.toUpperCase();
        break;
      case 'lowercase':
        transformedText = originalText.toLowerCase();
        break;
      case 'capitalize':
        transformedText = originalText.replace(/\b\w/g, (char: string) => char.toUpperCase());
        break;
      case 'sentence':
        transformedText = originalText.charAt(0).toUpperCase() + originalText.slice(1).toLowerCase();
        break;
      case 'none':
      default:
        transformedText = originalText;
        break;
    }
    
    // Update the text content
    selectedObject.set('text', transformedText);
    
    canvas.requestRenderAll();
    onUpdate();
    
    // Notify parent about text case change
    if (onTextSettingsChange) {
      onTextSettingsChange({ textCase: newCase });
    }
  };

  const applyGradient = (config: GradientConfig) => {
    if (!selectedObject || !canvas) return;
    try {
      const width = selectedObject.width * (selectedObject.scaleX || 1);
      const height = selectedObject.height * (selectedObject.scaleY || 1);
      const fabricGradient = gradientConfigToFabric(config, width, height);
      
      const colorStops = Object.entries(fabricGradient.colorStops).map(([offset, color]) => ({
        offset: parseFloat(offset),
        color: color as string,
      }));
      
      let gradient;
      if (fabricGradient.type === 'radial') {
        gradient = new Gradient<'radial'>({
          type: 'radial',
          coords: fabricGradient.coords as any,
          colorStops,
        });
      } else {
        gradient = new Gradient<'linear'>({
          type: 'linear',
          coords: fabricGradient.coords,
          colorStops,
        });
      }
      
      selectedObject.set('fill', gradient);
      canvas.requestRenderAll();
      onUpdate();
    } catch (error) {
      console.error('Error applying gradient:', error);
    }
  };

  if (!isTextObject) return null;

  const allFonts = [...FONTS, ...customFonts.filter(f => !FONTS.includes(f))];

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-muted/50 border-b flex-wrap">
      {/* Font Family */}
      <Select
        value={fontFamily}
        onValueChange={(v) => {
          setFontFamily(v);
          updateProperty('fontFamily', v);
        }}
      >
        <SelectTrigger className="h-7 w-28 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-60 bg-popover">
          {customFonts.length > 0 && (
            <>
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted">Custom</div>
              {customFonts.map((font) => (
                <SelectItem key={`custom-${font}`} value={font} className="text-xs" style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted">Standard</div>
            </>
          )}
          {FONTS.map((font) => (
            <SelectItem key={font} value={font} className="text-xs" style={{ fontFamily: font }}>
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Size with +/- buttons */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            const newSize = Math.max(8, fontSize - 1);
            setFontSize(newSize);
            updateProperty('fontSize', newSize);
          }}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <DebouncedNumberInput
          value={fontSize}
          onChange={(val) => {
            setFontSize(val);
            updateProperty('fontSize', val);
          }}
          className="h-7 w-14 text-xs text-center"
          min={8}
          max={200}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            const newSize = Math.min(200, fontSize + 1);
            setFontSize(newSize);
            updateProperty('fontSize', newSize);
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Letter Spacing with +/- */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                const newSpacing = Math.max(-200, charSpacing - 10);
                setCharSpacing(newSpacing);
                updateProperty('charSpacing', newSpacing);
              }}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-[10px] w-8 text-center text-muted-foreground">
              {charSpacing}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                const newSpacing = Math.min(800, charSpacing + 10);
                setCharSpacing(newSpacing);
                updateProperty('charSpacing', newSpacing);
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Letter Spacing</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Text Color with Presets & Gradient */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 relative">
            <Palette className="h-3.5 w-3.5" />
            <div 
              className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full border"
              style={{ backgroundColor: textColor }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-popover" side="bottom">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {Object.entries(COLOR_CATEGORIES).map(([category, colors]) => (
              <div key={category} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{category}</Label>
                <div className="grid grid-cols-8 gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border-2 border-transparent hover:border-primary transition-all hover:scale-110"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setTextColor(color);
                        updateProperty('fill', color);
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
            <Separator />
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    updateProperty('fill', e.target.value);
                  }}
                  className="w-10 h-8 p-0.5 cursor-pointer"
                />
                <Input
                  type="text"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    updateProperty('fill', e.target.value);
                  }}
                  className="h-8 text-xs flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs">Gradient Fill</Label>
              <DesignerGradientPicker
                value={gradientConfig}
                onChange={setGradientConfig}
                onApply={applyGradient}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Text Stroke (Outline) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant={strokeWidth > 0 ? 'default' : 'ghost'} 
            size="icon" 
            className="h-7 w-7"
          >
            <span className="text-[10px] font-bold" style={{ 
              WebkitTextStroke: '1px currentColor',
              color: 'transparent'
            }}>A</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-popover" side="bottom">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Stroke Width: {strokeWidth}px</Label>
              <Slider
                value={[strokeWidth]}
                onValueChange={([v]) => {
                  setStrokeWidth(v);
                  updateStroke(v, strokeColor);
                }}
                min={0}
                max={10}
                step={0.5}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Stroke Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => {
                    setStrokeColor(e.target.value);
                    updateStroke(strokeWidth, e.target.value);
                  }}
                  className="w-10 h-8 p-0.5 cursor-pointer"
                />
                <Input
                  type="text"
                  value={strokeColor}
                  onChange={(e) => {
                    setStrokeColor(e.target.value);
                    updateStroke(strokeWidth, e.target.value);
                  }}
                  className="h-8 text-xs flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Stroke renders behind text for proper outline effect.
            </p>
          </div>
        </PopoverContent>
      </Popover>

      {/* Drop Shadow */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant={shadowEnabled ? 'default' : 'ghost'} 
            size="icon" 
            className="h-7 w-7"
          >
            <Droplets className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-popover" side="bottom">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Enable Shadow</Label>
              <Switch
                checked={shadowEnabled}
                onCheckedChange={(v) => {
                  setShadowEnabled(v);
                  updateShadow(v);
                }}
              />
            </div>
            {shadowEnabled && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Shadow Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={shadowColor}
                      onChange={(e) => {
                        setShadowColor(e.target.value);
                        updateShadow(true, e.target.value);
                      }}
                      className="w-10 h-8 p-0.5 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={shadowColor}
                      onChange={(e) => {
                        setShadowColor(e.target.value);
                        updateShadow(true, e.target.value);
                      }}
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Blur: {shadowBlur}px</Label>
                  <Slider
                    value={[shadowBlur]}
                    onValueChange={([v]) => {
                      setShadowBlur(v);
                      updateShadow(true, shadowColor, v);
                    }}
                    min={0}
                    max={30}
                    step={1}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Offset X: {shadowOffsetX}</Label>
                    <Slider
                      value={[shadowOffsetX]}
                      onValueChange={([v]) => {
                        setShadowOffsetX(v);
                        updateShadow(true, shadowColor, shadowBlur, v, shadowOffsetY);
                      }}
                      min={-20}
                      max={20}
                      step={1}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Offset Y: {shadowOffsetY}</Label>
                    <Slider
                      value={[shadowOffsetY]}
                      onValueChange={([v]) => {
                        setShadowOffsetY(v);
                        updateShadow(true, shadowColor, shadowBlur, shadowOffsetX, v);
                      }}
                      min={-20}
                      max={20}
                      step={1}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Bold */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={fontWeight === 'bold' ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const newWeight = fontWeight === 'bold' ? 'normal' : 'bold';
              setFontWeight(newWeight);
              updateProperty('fontWeight', newWeight);
            }}
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Bold</TooltipContent>
      </Tooltip>

      {/* Italic */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={fontStyle === 'italic' ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const newStyle = fontStyle === 'italic' ? 'normal' : 'italic';
              setFontStyle(newStyle);
              updateProperty('fontStyle', newStyle);
            }}
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Italic</TooltipContent>
      </Tooltip>

      {/* Underline */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={underline ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const newVal = !underline;
              setUnderline(newVal);
              updateProperty('underline', newVal);
            }}
          >
            <Underline className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Underline</TooltipContent>
      </Tooltip>

      {/* Strikethrough */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={linethrough ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const newVal = !linethrough;
              setLinethrough(newVal);
              updateProperty('linethrough', newVal);
            }}
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Strikethrough</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Text Case Buttons */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={textCase === 'uppercase' ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => updateTextCase(textCase === 'uppercase' ? 'none' : 'uppercase')}
          >
            <CaseUpper className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">UPPERCASE</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={textCase === 'lowercase' ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => updateTextCase(textCase === 'lowercase' ? 'none' : 'lowercase')}
          >
            <CaseLower className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">lowercase</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={textCase === 'capitalize' ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => updateTextCase(textCase === 'capitalize' ? 'none' : 'capitalize')}
          >
            <Type className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Title Case</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={textCase === 'sentence' ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => updateTextCase(textCase === 'sentence' ? 'none' : 'sentence')}
          >
            <CaseSensitive className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Sentence Case</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Text Align */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={textAlign === 'left' ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setTextAlign('left');
              updateProperty('textAlign', 'left');
            }}
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Align Left</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={textAlign === 'center' ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setTextAlign('center');
              updateProperty('textAlign', 'center');
            }}
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Align Center</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={textAlign === 'right' ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setTextAlign('right');
              updateProperty('textAlign', 'right');
            }}
          >
            <AlignRight className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Align Right</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Auto Font Size */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={autoFontSize ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const newVal = !autoFontSize;
              setAutoFontSize(newVal);
              if (!selectedObject.data) selectedObject.data = {};
              selectedObject.data.autoFontSize = newVal;
              
              // Apply auto font size immediately when enabled
              if (newVal) {
                applyAutoFontSize(selectedObject, canvas);
              }
              
              canvas.requestRenderAll();
              onUpdate();
              if (onTextSettingsChange) {
                onTextSettingsChange({ autoFontSize: newVal });
              }
            }}
          >
            <Scaling className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Auto Font Size (fit to box)</TooltipContent>
      </Tooltip>

      {/* Word Wrap */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={wordWrap ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const newVal = !wordWrap;
              setWordWrap(newVal);
              selectedObject.set('splitByGrapheme', newVal);
              if (!selectedObject.data) selectedObject.data = {};
              selectedObject.data.wordWrap = newVal;
              canvas.requestRenderAll();
              onUpdate();
              if (onTextSettingsChange) {
                onTextSettingsChange({ wordWrap: newVal });
              }
            }}
          >
            <WrapText className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Word Wrap</TooltipContent>
      </Tooltip>
    </div>
  );
}
