import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DesignerGradientPicker, GradientConfig, gradientConfigToFabric } from './DesignerGradientPicker';
import { Gradient } from 'fabric';
import { 
  Bold, Italic, Underline, Strikethrough, ChevronDown, Palette,
  ArrowUpLeft, ArrowUp, ArrowUpRight, ArrowLeft, Circle, ArrowRight,
  ArrowDownLeft, ArrowDown, ArrowDownRight, Maximize2, Database, Settings, Layers, HelpCircle, Info, Keyboard
} from 'lucide-react';

const GOOGLE_FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
  'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Tahoma',
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway',
  'Poppins', 'Source Sans Pro', 'Ubuntu', 'Merriweather', 'Playfair Display',
  'Nunito', 'PT Sans', 'Rubik', 'Work Sans', 'Quicksand', 'Fira Sans',
  'Barlow', 'Mulish', 'Karla', 'Manrope', 'Inter', 'DM Sans'
];

interface DesignerPropertiesPanelProps {
  selectedObject: any;
  canvas: any;
  onUpdate: () => void;
  customFonts?: string[];
  safeZoneMm?: number;
  mmToPixels?: number;
}

export function DesignerPropertiesPanel({ 
  selectedObject, 
  canvas, 
  onUpdate, 
  customFonts = [],
  safeZoneMm = 4,
  mmToPixels = 3.78
}: DesignerPropertiesPanelProps) {
  const [properties, setProperties] = useState({
    // Position & Size
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    angle: 0,
    scaleX: 1,
    scaleY: 1,
    // Appearance
    fill: '#000000',
    stroke: '#000000',
    strokeWidth: 0,
    opacity: 1,
    // Text
    text: '',
    fontSize: 16,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fontStyle: 'normal',
    underline: false,
    linethrough: false,
    textAlign: 'left',
    lineHeight: 1.2,
    charSpacing: 0,
    // Text background
    textBackgroundColor: '',
    hasTextBackground: false,
    // Shadow
    shadowEnabled: false,
    shadowColor: '#000000',
    shadowBlur: 10,
    shadowOffsetX: 5,
    shadowOffsetY: 5,
    // Border radius (for rect)
    rx: 0,
    ry: 0,
    // Gradient
    useGradient: false,
    fillType: 'solid' as 'solid' | 'gradient',
    // Curved text
    curveRadius: 0,
    // New text properties
    textCase: 'none' as 'none' | 'uppercase' | 'lowercase' | 'capitalize',
    autoFontSize: false,
    wordWrap: true,
    // Data linking
    dataField: '',
  });
  
  const [gradientConfig, setGradientConfig] = useState<GradientConfig | null>(null);

  useEffect(() => {
    if (!selectedObject) return;

    const bgColor = selectedObject.backgroundColor || selectedObject.textBackgroundColor || '';
    const isGradient = typeof selectedObject.fill === 'object';
    
    setProperties({
      left: Math.round(selectedObject.left || 0),
      top: Math.round(selectedObject.top || 0),
      width: Math.round(selectedObject.width * (selectedObject.scaleX || 1)),
      height: Math.round(selectedObject.height * (selectedObject.scaleY || 1)),
      angle: Math.round(selectedObject.angle || 0),
      scaleX: selectedObject.scaleX || 1,
      scaleY: selectedObject.scaleY || 1,
      fill: typeof selectedObject.fill === 'string' ? selectedObject.fill : '#000000',
      stroke: selectedObject.stroke || '#000000',
      strokeWidth: selectedObject.strokeWidth || 0,
      opacity: selectedObject.opacity || 1,
      text: selectedObject.text || '',
      fontSize: selectedObject.fontSize || 16,
      fontFamily: selectedObject.fontFamily || 'Arial',
      fontWeight: selectedObject.fontWeight || 'normal',
      fontStyle: selectedObject.fontStyle || 'normal',
      underline: selectedObject.underline || false,
      linethrough: selectedObject.linethrough || false,
      textAlign: selectedObject.textAlign || 'left',
      lineHeight: selectedObject.lineHeight || 1.2,
      charSpacing: selectedObject.charSpacing || 0,
      textBackgroundColor: bgColor,
      hasTextBackground: !!bgColor,
      shadowEnabled: !!selectedObject.shadow,
      shadowColor: selectedObject.shadow?.color || '#000000',
      shadowBlur: selectedObject.shadow?.blur || 10,
      shadowOffsetX: selectedObject.shadow?.offsetX || 5,
      shadowOffsetY: selectedObject.shadow?.offsetY || 5,
      rx: selectedObject.rx || 0,
      ry: selectedObject.ry || 0,
      useGradient: isGradient,
      fillType: isGradient ? 'gradient' : 'solid',
      curveRadius: selectedObject.data?.curveRadius || 0,
      textCase: selectedObject.data?.textCase || 'none',
      autoFontSize: selectedObject.data?.autoFontSize || false,
      wordWrap: selectedObject.splitByGrapheme !== false,
      dataField: selectedObject.data?.dataField || '',
    });
  }, [selectedObject]);

  const updateProperty = (key: string, value: any) => {
    if (!selectedObject || !canvas) return;

    setProperties(prev => ({ ...prev, [key]: value }));

    // Handle special cases
    if (key === 'width') {
      selectedObject.set('scaleX', value / selectedObject.width);
    } else if (key === 'height') {
      selectedObject.set('scaleY', value / selectedObject.height);
    } else if (key === 'text') {
      selectedObject.set('text', value);
    } else if (key === 'hasTextBackground') {
      if (value) {
        selectedObject.set('backgroundColor', properties.textBackgroundColor || '#ffffff');
      } else {
        selectedObject.set('backgroundColor', '');
      }
    } else if (key === 'textBackgroundColor') {
      if (properties.hasTextBackground) {
        selectedObject.set('backgroundColor', value);
      }
    } else if (key === 'textCase') {
      if (!selectedObject.data) selectedObject.data = {};
      selectedObject.data.textCase = value;
    } else if (key === 'autoFontSize') {
      if (!selectedObject.data) selectedObject.data = {};
      selectedObject.data.autoFontSize = value;
    } else if (key === 'wordWrap') {
      selectedObject.set('splitByGrapheme', value);
      if (!selectedObject.data) selectedObject.data = {};
      selectedObject.data.wordWrap = value;
    } else if (key === 'dataField') {
      if (!selectedObject.data) selectedObject.data = {};
      selectedObject.data.dataField = value;
    } else if (key === 'shadowEnabled') {
      if (value) {
        selectedObject.set('shadow', {
          color: properties.shadowColor,
          blur: properties.shadowBlur,
          offsetX: properties.shadowOffsetX,
          offsetY: properties.shadowOffsetY,
        });
      } else {
        selectedObject.set('shadow', null);
      }
    } else if (key.startsWith('shadow') && key !== 'shadowEnabled') {
      if (properties.shadowEnabled) {
        selectedObject.set('shadow', {
          color: key === 'shadowColor' ? value : properties.shadowColor,
          blur: key === 'shadowBlur' ? value : properties.shadowBlur,
          offsetX: key === 'shadowOffsetX' ? value : properties.shadowOffsetX,
          offsetY: key === 'shadowOffsetY' ? value : properties.shadowOffsetY,
        });
      }
    } else {
      selectedObject.set(key, value);
    }

    canvas.requestRenderAll();
    onUpdate();
  };

  const fitToSafeZone = () => {
    if (!selectedObject || !canvas) return;
    
    const canvasWidth = canvas.width || 300;
    const canvasHeight = canvas.height || 200;
    const safeZonePx = safeZoneMm * mmToPixels;
    
    const safeWidth = canvasWidth - (safeZonePx * 2);
    const safeHeight = canvasHeight - (safeZonePx * 2);
    
    selectedObject.set({
      left: safeZonePx,
      top: safeZonePx,
      scaleX: safeWidth / selectedObject.width,
      scaleY: safeHeight / selectedObject.height,
    });
    
    canvas.requestRenderAll();
    onUpdate();
  };

  const alignToSafeZone = (position: string) => {
    if (!selectedObject || !canvas) return;
    
    const canvasWidth = canvas.width || 300;
    const canvasHeight = canvas.height || 200;
    const safeZonePx = safeZoneMm * mmToPixels;
    
    const objWidth = selectedObject.width * (selectedObject.scaleX || 1);
    const objHeight = selectedObject.height * (selectedObject.scaleY || 1);
    
    const safeLeft = safeZonePx;
    const safeTop = safeZonePx;
    const safeRight = canvasWidth - safeZonePx;
    const safeBottom = canvasHeight - safeZonePx;
    const safeCenterX = (safeLeft + safeRight) / 2;
    const safeCenterY = (safeTop + safeBottom) / 2;
    
    let newLeft = selectedObject.left;
    let newTop = selectedObject.top;
    
    switch (position) {
      case 'top-left':
        newLeft = safeLeft;
        newTop = safeTop;
        break;
      case 'top-center':
        newLeft = safeCenterX - objWidth / 2;
        newTop = safeTop;
        break;
      case 'top-right':
        newLeft = safeRight - objWidth;
        newTop = safeTop;
        break;
      case 'middle-left':
        newLeft = safeLeft;
        newTop = safeCenterY - objHeight / 2;
        break;
      case 'center':
        newLeft = safeCenterX - objWidth / 2;
        newTop = safeCenterY - objHeight / 2;
        break;
      case 'middle-right':
        newLeft = safeRight - objWidth;
        newTop = safeCenterY - objHeight / 2;
        break;
      case 'bottom-left':
        newLeft = safeLeft;
        newTop = safeBottom - objHeight;
        break;
      case 'bottom-center':
        newLeft = safeCenterX - objWidth / 2;
        newTop = safeBottom - objHeight;
        break;
      case 'bottom-right':
        newLeft = safeRight - objWidth;
        newTop = safeBottom - objHeight;
        break;
    }
    
    selectedObject.set({ left: newLeft, top: newTop });
    canvas.requestRenderAll();
    onUpdate();
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
      setProperties(prev => ({ ...prev, useGradient: true, fillType: 'gradient' }));
    } catch (error) {
      console.error('Error applying gradient:', error);
    }
  };

  const isTextObject = selectedObject?.type === 'textbox' || selectedObject?.type === 'i-text';
  const allFonts = [...GOOGLE_FONTS, ...customFonts.filter(f => !GOOGLE_FONTS.includes(f))];

  if (!selectedObject) {
    return (
      <div className="h-full bg-sidebar text-sidebar-foreground p-4">
        <p className="text-sm text-sidebar-foreground/60 text-center mt-8">
          Select an object to edit properties
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full bg-sidebar text-sidebar-foreground">
      <div className="p-3 space-y-4">
          {/* Sizing & Position */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
              Sizing & Position
            </h3>
            <Button 
              variant="outline" 
              className="w-full bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border hover:bg-primary hover:text-primary-foreground"
              onClick={fitToSafeZone}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Fit to Safe Zone
            </Button>
          </div>

          {/* Align to Safe Zone */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
              Align to Safe Zone
            </h3>
            <div className="grid grid-cols-3 gap-1">
              <Button variant="outline" size="icon" className="h-9 w-9 bg-sidebar-accent border-sidebar-border" onClick={() => alignToSafeZone('top-left')}>
                <ArrowUpLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 bg-sidebar-accent border-sidebar-border" onClick={() => alignToSafeZone('top-center')}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 bg-sidebar-accent border-sidebar-border" onClick={() => alignToSafeZone('top-right')}>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 bg-sidebar-accent border-sidebar-border" onClick={() => alignToSafeZone('middle-left')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 bg-sidebar-accent border-sidebar-border" onClick={() => alignToSafeZone('center')}>
                <Circle className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 bg-sidebar-accent border-sidebar-border" onClick={() => alignToSafeZone('middle-right')}>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 bg-sidebar-accent border-sidebar-border" onClick={() => alignToSafeZone('bottom-left')}>
                <ArrowDownLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 bg-sidebar-accent border-sidebar-border" onClick={() => alignToSafeZone('bottom-center')}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 bg-sidebar-accent border-sidebar-border" onClick={() => alignToSafeZone('bottom-right')}>
                <ArrowDownRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Text Content (for text objects) */}
          {isTextObject && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                Text
              </h3>
              <Textarea
                value={properties.text}
                onChange={(e) => updateProperty('text', e.target.value)}
                className="min-h-[80px] bg-sidebar-accent border-sidebar-border text-sidebar-foreground resize-none"
                placeholder="Enter text..."
              />
            </div>
          )}

          {/* Data Linking */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
              Data Linking
            </h3>
            <p className="text-xs text-sidebar-foreground/50">
              Generate multiple badges by linking this element to a column in a CSV file.
            </p>
            <Button 
              variant="outline" 
              className="w-full bg-primary/20 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground"
            >
              <Database className="h-4 w-4 mr-2" />
              Link to Data Source...
            </Button>
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Font Section (for text objects) */}
          {isTextObject && (
            <>
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                  Font
                </h3>
                <Select
                  value={properties.fontFamily}
                  onValueChange={(v) => updateProperty('fontFamily', v)}
                >
                  <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 bg-sidebar border-sidebar-border">
                    {customFonts.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-semibold text-sidebar-foreground/60 bg-sidebar-accent">Custom Fonts</div>
                        {customFonts.map((font) => (
                          <SelectItem key={`custom-${font}`} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1 text-xs font-semibold text-sidebar-foreground/60 bg-sidebar-accent">Standard Fonts</div>
                      </>
                    )}
                    {GOOGLE_FONTS.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-sidebar-foreground/40 italic">
                  Local fonts not supported by this browser.
                </p>

                {/* Text formatting buttons */}
                <div className="flex gap-1">
                  <Button
                    variant={properties.fontWeight === 'bold' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-8 bg-sidebar-accent border-sidebar-border"
                    onClick={() => updateProperty('fontWeight', properties.fontWeight === 'bold' ? 'normal' : 'bold')}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={properties.fontStyle === 'italic' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-8 bg-sidebar-accent border-sidebar-border"
                    onClick={() => updateProperty('fontStyle', properties.fontStyle === 'italic' ? 'normal' : 'italic')}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={properties.underline ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-8 bg-sidebar-accent border-sidebar-border"
                    onClick={() => updateProperty('underline', !properties.underline)}
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={properties.linethrough ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-8 bg-sidebar-accent border-sidebar-border"
                    onClick={() => updateProperty('linethrough', !properties.linethrough)}
                  >
                    <Strikethrough className="h-4 w-4" />
                  </Button>
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-sidebar-foreground/60">Font Size</Label>
                    <span className="text-xs text-sidebar-foreground">{properties.fontSize}px</span>
                  </div>
                  <Slider
                    value={[properties.fontSize]}
                    onValueChange={([v]) => updateProperty('fontSize', v)}
                    min={8}
                    max={120}
                    step={1}
                    className="py-1"
                  />
                </div>

                {/* Letter Spacing */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-sidebar-foreground/60">Letter Spacing</Label>
                    <span className="text-xs text-sidebar-foreground">{properties.charSpacing}px</span>
                  </div>
                  <Slider
                    value={[properties.charSpacing]}
                    onValueChange={([v]) => updateProperty('charSpacing', v)}
                    min={-100}
                    max={500}
                    step={10}
                    className="py-1"
                  />
                </div>
              </div>

              <Separator className="bg-sidebar-border" />

              {/* Text Appearance */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                  Text Appearance
                </h3>

                {/* Fill Type Toggle */}
                <div className="space-y-2">
                  <Label className="text-xs text-sidebar-foreground/60">Fill Type</Label>
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant={properties.fillType === 'solid' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 bg-sidebar-accent border-sidebar-border"
                      onClick={() => {
                        setProperties(prev => ({ ...prev, fillType: 'solid', useGradient: false }));
                        updateProperty('fill', properties.fill);
                      }}
                    >
                      Solid
                    </Button>
                    <Button
                      variant={properties.fillType === 'gradient' ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 bg-sidebar-accent border-sidebar-border"
                      onClick={() => setProperties(prev => ({ ...prev, fillType: 'gradient' }))}
                    >
                      Gradient
                    </Button>
                  </div>
                </div>

                {/* Fill Color */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-sidebar-foreground/60">Fill Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={properties.fill}
                        onChange={(e) => updateProperty('fill', e.target.value)}
                        className="w-8 h-6 p-0.5 bg-transparent border-sidebar-border"
                        disabled={properties.fillType === 'gradient'}
                      />
                    </div>
                  </div>
                  {properties.fillType === 'gradient' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full bg-sidebar-accent border-sidebar-border">
                          <Palette className="h-4 w-4 mr-2" />
                          Edit Gradient
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 bg-sidebar border-sidebar-border" side="left">
                        <DesignerGradientPicker
                          value={gradientConfig}
                          onChange={setGradientConfig}
                          onApply={applyGradient}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                {/* Stroke Color */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-sidebar-foreground/60">Stroke Color</Label>
                    <Input
                      type="color"
                      value={properties.stroke}
                      onChange={(e) => updateProperty('stroke', e.target.value)}
                      className="w-8 h-6 p-0.5 bg-transparent border-sidebar-border"
                    />
                  </div>
                </div>

                {/* Stroke Width */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-sidebar-foreground/60">Stroke Width</Label>
                    <span className="text-xs text-sidebar-foreground">{properties.strokeWidth}px</span>
                  </div>
                  <Slider
                    value={[properties.strokeWidth]}
                    onValueChange={([v]) => updateProperty('strokeWidth', v)}
                    min={0}
                    max={20}
                    step={1}
                    className="py-1"
                  />
                </div>
              </div>

              <Separator className="bg-sidebar-border" />
            </>
          )}

          {/* Effects */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
              Effects
            </h3>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-sidebar-foreground">Drop Shadow</Label>
              <Switch
                checked={properties.shadowEnabled}
                onCheckedChange={(v) => updateProperty('shadowEnabled', v)}
              />
            </div>

            {properties.shadowEnabled && (
              <div className="space-y-3 pl-2 border-l-2 border-sidebar-border">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-sidebar-foreground/60 w-16">Color</Label>
                  <Input
                    type="color"
                    value={properties.shadowColor}
                    onChange={(e) => updateProperty('shadowColor', e.target.value)}
                    className="w-8 h-6 p-0.5 bg-transparent border-sidebar-border"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-sidebar-foreground/60">Blur</Label>
                    <span className="text-xs text-sidebar-foreground">{properties.shadowBlur}px</span>
                  </div>
                  <Slider
                    value={[properties.shadowBlur]}
                    onValueChange={([v]) => updateProperty('shadowBlur', v)}
                    min={0}
                    max={50}
                    step={1}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-sidebar-foreground/60">Offset X</Label>
                    <Input
                      type="number"
                      value={properties.shadowOffsetX}
                      onChange={(e) => updateProperty('shadowOffsetX', parseFloat(e.target.value))}
                      className="h-7 text-xs bg-sidebar-accent border-sidebar-border"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-sidebar-foreground/60">Offset Y</Label>
                    <Input
                      type="number"
                      value={properties.shadowOffsetY}
                      onChange={(e) => updateProperty('shadowOffsetY', parseFloat(e.target.value))}
                      className="h-7 text-xs bg-sidebar-accent border-sidebar-border"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Non-text objects: basic style controls */}
          {!isTextObject && (
            <>
              <Separator className="bg-sidebar-border" />
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                  Style
                </h3>
                
                {/* Fill Color */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-sidebar-foreground/60">Fill Color</Label>
                    <Input
                      type="color"
                      value={properties.fill}
                      onChange={(e) => updateProperty('fill', e.target.value)}
                      className="w-8 h-6 p-0.5 bg-transparent border-sidebar-border"
                    />
                  </div>
                </div>

                {/* Stroke Color */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-sidebar-foreground/60">Stroke Color</Label>
                    <Input
                      type="color"
                      value={properties.stroke}
                      onChange={(e) => updateProperty('stroke', e.target.value)}
                      className="w-8 h-6 p-0.5 bg-transparent border-sidebar-border"
                    />
                  </div>
                </div>

                {/* Stroke Width */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-sidebar-foreground/60">Stroke Width</Label>
                    <span className="text-xs text-sidebar-foreground">{properties.strokeWidth}px</span>
                  </div>
                  <Slider
                    value={[properties.strokeWidth]}
                    onValueChange={([v]) => updateProperty('strokeWidth', v)}
                    min={0}
                    max={20}
                    step={1}
                    className="py-1"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-sidebar-foreground/60">Opacity</Label>
                    <span className="text-xs text-sidebar-foreground">{Math.round(properties.opacity * 100)}%</span>
                  </div>
                  <Slider
                    value={[properties.opacity * 100]}
                    onValueChange={([v]) => updateProperty('opacity', v / 100)}
                    min={0}
                    max={100}
                    step={1}
                    className="py-1"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
  );
}
