import { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DesignerGradientPicker, GradientConfig, gradientConfigToFabric } from './DesignerGradientPicker';
import { Gradient } from 'fabric';
import { applyAutoFontSize } from '@/lib/autoFontSize';
import { 
  Bold, Italic, Underline, Strikethrough, ChevronDown, Palette,
  ArrowUpLeft, ArrowUp, ArrowUpRight, ArrowLeft, Circle, ArrowRight,
  ArrowDownLeft, ArrowDown, ArrowDownRight, Maximize2, Database, 
  Type, Move, Sparkles, AlignLeft, AlignCenter, AlignRight, RotateCcw,
  Square, Image as ImageIcon, ChevronRight, QrCode, Barcode, RefreshCw, Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateBarcodeDataUrl, generateQRCodeDataUrl, BarcodeFormat } from '@/lib/codeGenerators';
import { FabricImage } from 'fabric';
import { toast } from 'sonner';

const BARCODE_FORMATS: { value: BarcodeFormat; label: string }[] = [
  { value: 'CODE128', label: 'Code 128' },
  { value: 'CODE39', label: 'Code 39' },
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'EAN8', label: 'EAN-8' },
  { value: 'UPC', label: 'UPC' },
  { value: 'ITF14', label: 'ITF-14' },
];

const GOOGLE_FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
  'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Tahoma',
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway',
  'Poppins', 'Source Sans Pro', 'Ubuntu', 'Merriweather', 'Playfair Display',
  'Nunito', 'PT Sans', 'Rubik', 'Work Sans', 'Quicksand', 'Fira Sans',
  'Barlow', 'Mulish', 'Karla', 'Manrope', 'Inter', 'DM Sans'
];

// Debounced number input component to prevent cursor jumping
interface DebouncedNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
  suffix?: string;
}

const DebouncedNumberInput = forwardRef<HTMLInputElement, DebouncedNumberInputProps>(
  ({ value, onChange, min, max, step = 1, className, disabled, suffix }, forwardedRef) => {
    const [localValue, setLocalValue] = useState(String(value));
    const inputRef = useRef<HTMLInputElement | null>(null);

    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef)
          (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [forwardedRef]
    );

    useEffect(() => {
      if (document.activeElement !== inputRef.current) {
        setLocalValue(String(value));
      }
    }, [value]);

    const commitValue = useCallback(
      (val: string) => {
        const num = parseFloat(val);
        if (Number.isNaN(num)) return;

        let finalValue = num;
        if (min !== undefined) finalValue = Math.max(min, finalValue);
        if (max !== undefined) finalValue = Math.min(max, finalValue);
        onChange(finalValue);
      },
      [onChange, min, max]
    );

    return (
      <div className="relative">
        <Input
          ref={setRef}
          type="number"
          value={localValue}
          onChange={(e) => {
            const newValue = e.target.value;
            setLocalValue(newValue);
            // Update immediately (no input debounce)
            commitValue(newValue);
          }}
          onBlur={() => commitValue(localValue)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commitValue(localValue);
              inputRef.current?.blur();
            }
          }}
          min={min}
          max={max}
          step={step}
          className={cn('pr-6', className)}
          disabled={disabled}
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);
DebouncedNumberInput.displayName = 'DebouncedNumberInput';

// Debounced textarea component for text content
interface DebouncedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

function DebouncedTextarea({ value, onChange, className, placeholder }: DebouncedTextareaProps) {
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (document.activeElement !== textareaRef.current) {
      setLocalValue(value);
    }
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={localValue}
      onChange={(e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        // Update immediately (no input debounce)
        onChange(newValue);
      }}
      className={className}
      placeholder={placeholder}
    />
  );
}

// Collapsible Section Component
interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, icon, defaultOpen = true, children }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-1 hover:bg-muted/50 rounded-md transition-colors">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
            {title}
          </span>
        </div>
        <ChevronRight className={cn(
          "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-90"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-3 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Input Row Component
interface InputRowProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function InputRow({ label, children, className }: InputRowProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <Label className="text-xs text-muted-foreground shrink-0">{label}</Label>
      <div className="flex-1 max-w-[140px]">{children}</div>
    </div>
  );
}

// Color Input Component
interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function ColorInput({ value, onChange, disabled }: ColorInputProps) {
  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-md p-1 border">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
        disabled={disabled}
      />
      <Input
        value={value.toUpperCase()}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 text-xs font-mono border-0 bg-transparent p-0 w-16"
        disabled={disabled}
      />
    </div>
  );
}

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
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    angle: 0,
    scaleX: 1,
    scaleY: 1,
    fill: '#000000',
    stroke: '#000000',
    strokeWidth: 0,
    opacity: 1,
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
    textBackgroundColor: '',
    hasTextBackground: false,
    shadowEnabled: false,
    shadowColor: '#000000',
    shadowBlur: 10,
    shadowOffsetX: 5,
    shadowOffsetY: 5,
    rx: 0,
    ry: 0,
    useGradient: false,
    fillType: 'solid' as 'solid' | 'gradient',
    curveRadius: 0,
    textCase: 'none' as 'none' | 'uppercase' | 'lowercase' | 'capitalize',
    autoFontSize: false,
    wordWrap: true,
    dataField: '',
    // Barcode properties
    barcodeFormat: 'CODE128' as BarcodeFormat,
    barcodeWidth: 2,
    barcodeHeight: 50,
    showValue: true,
    // QR Code properties
    qrSize: 200,
    qrDarkColor: '#000000',
    qrLightColor: '#ffffff',
    // Photo properties
    photoShape: 'rect' as string,
    photoBorderWidth: 2,
    photoBorderColor: '#9ca3af',
    photoBorderStyle: 'dashed' as 'solid' | 'dashed' | 'none',
  });
  
  const [isRegenerating, setIsRegenerating] = useState(false);
  const maskInputRef = useRef<HTMLInputElement>(null);
  
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
      // Barcode properties
      barcodeFormat: selectedObject.data?.barcodeFormat || 'CODE128',
      barcodeWidth: selectedObject.data?.barcodeWidth || 2,
      barcodeHeight: selectedObject.data?.barcodeHeight || 50,
      showValue: selectedObject.data?.showValue !== false,
      // QR Code properties
      qrSize: selectedObject.data?.qrSize || 200,
      qrDarkColor: selectedObject.data?.qrDarkColor || '#000000',
      qrLightColor: selectedObject.data?.qrLightColor || '#ffffff',
      // Photo properties
      photoShape: selectedObject.data?.shape || 'rect',
      photoBorderWidth: selectedObject.strokeWidth || 2,
      photoBorderColor: selectedObject.stroke || '#9ca3af',
      photoBorderStyle: selectedObject.strokeDashArray ? 'dashed' : (selectedObject.strokeWidth > 0 ? 'solid' : 'none'),
    });
  }, [selectedObject]);

  const updateProperty = (key: string, value: any) => {
    if (!selectedObject || !canvas) return;

    setProperties(prev => ({ ...prev, [key]: value }));

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
      // Apply auto font size immediately when enabled
      if (value) {
        applyAutoFontSize(selectedObject, canvas);
      }
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

  // Regenerate barcode with new settings
  const regenerateBarcode = async () => {
    if (!selectedObject || !canvas || !selectedObject.data?.isBarcode) return;
    
    setIsRegenerating(true);
    try {
      const dataUrl = await generateBarcodeDataUrl('ID12345', {
        format: properties.barcodeFormat,
        width: properties.barcodeWidth,
        height: properties.barcodeHeight,
        displayValue: properties.showValue,
      });
      
      FabricImage.fromURL(dataUrl, { crossOrigin: 'anonymous' }).then((img) => {
        const currentLeft = selectedObject.left;
        const currentTop = selectedObject.top;
        const currentScaleX = selectedObject.scaleX || 1;
        const currentScaleY = selectedObject.scaleY || 1;
        
        // Remove old object
        canvas.remove(selectedObject);
        
        // Configure new image
        img.set({
          left: currentLeft,
          top: currentTop,
          scaleX: currentScaleX,
          scaleY: currentScaleY,
          data: { 
            ...selectedObject.data,
            barcodeFormat: properties.barcodeFormat,
            barcodeWidth: properties.barcodeWidth,
            barcodeHeight: properties.barcodeHeight,
            showValue: properties.showValue,
          },
        });
        
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
        onUpdate();
        toast.success('Barcode updated');
      });
    } catch (error) {
      toast.error('Failed to regenerate barcode');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Regenerate QR code with new settings
  const regenerateQRCode = async () => {
    if (!selectedObject || !canvas || !selectedObject.data?.isQR) return;
    
    setIsRegenerating(true);
    try {
      const dataUrl = await generateQRCodeDataUrl('https://example.com', {
        width: properties.qrSize,
        color: { dark: properties.qrDarkColor, light: properties.qrLightColor },
      });
      
      FabricImage.fromURL(dataUrl, { crossOrigin: 'anonymous' }).then((img) => {
        const currentLeft = selectedObject.left;
        const currentTop = selectedObject.top;
        const currentScaleX = selectedObject.scaleX || 1;
        const currentScaleY = selectedObject.scaleY || 1;
        
        // Remove old object
        canvas.remove(selectedObject);
        
        // Configure new image
        img.set({
          left: currentLeft,
          top: currentTop,
          scaleX: currentScaleX,
          scaleY: currentScaleY,
          data: { 
            ...selectedObject.data,
            qrSize: properties.qrSize,
            qrDarkColor: properties.qrDarkColor,
            qrLightColor: properties.qrLightColor,
          },
        });
        
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
        onUpdate();
        toast.success('QR Code updated');
      });
    } catch (error) {
      toast.error('Failed to regenerate QR code');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Update photo border
  const updatePhotoBorder = (style: 'solid' | 'dashed' | 'none', width?: number, color?: string) => {
    if (!selectedObject || !canvas) return;
    
    const borderWidth = width ?? properties.photoBorderWidth;
    const borderColor = color ?? properties.photoBorderColor;
    
    if (style === 'none') {
      selectedObject.set({ strokeWidth: 0, stroke: null, strokeDashArray: null });
    } else if (style === 'dashed') {
      selectedObject.set({ 
        strokeWidth: borderWidth, 
        stroke: borderColor, 
        strokeDashArray: [5, 5] 
      });
    } else {
      selectedObject.set({ 
        strokeWidth: borderWidth, 
        stroke: borderColor, 
        strokeDashArray: null 
      });
    }
    
    canvas.requestRenderAll();
    onUpdate();
  };

  const isTextObject = selectedObject?.type === 'textbox' || selectedObject?.type === 'i-text';
  const isImageObject = selectedObject?.type === 'image';
  const isBarcodeObject = selectedObject?.data?.isBarcode === true;
  const isQRObject = selectedObject?.data?.isQR === true;
  const isPhotoObject = selectedObject?.data?.isPhoto === true;
  const allFonts = [...GOOGLE_FONTS, ...customFonts.filter(f => !GOOGLE_FONTS.includes(f))];

  // Get object type label
  const getObjectTypeLabel = () => {
    if (!selectedObject) return '';
    switch (selectedObject.type) {
      case 'textbox':
      case 'i-text':
        return 'Text';
      case 'rect':
        return 'Rectangle';
      case 'circle':
        return 'Circle';
      case 'ellipse':
        return 'Ellipse';
      case 'triangle':
        return 'Triangle';
      case 'polygon':
        return 'Polygon';
      case 'line':
        return 'Line';
      case 'image':
        return 'Image';
      default:
        return 'Object';
    }
  };

  const getObjectIcon = () => {
    if (!selectedObject) return <Square className="h-4 w-4" />;
    switch (selectedObject.type) {
      case 'textbox':
      case 'i-text':
        return <Type className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <Square className="h-4 w-4" />;
    }
  };

  if (!selectedObject) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Square className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No Selection</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Click on an element to edit its properties
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-3">
        {/* Object Header */}
        <div className="flex items-center gap-2 pb-3 mb-2 border-b">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            {getObjectIcon()}
          </div>
          <div>
            <p className="text-sm font-semibold">{getObjectTypeLabel()}</p>
            <p className="text-[10px] text-muted-foreground">
              {properties.width}×{properties.height}px
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-1 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={fitToSafeZone}
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            Fit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => alignToSafeZone('center')}
          >
            <Circle className="h-3 w-3 mr-1" />
            Center
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => updateProperty('angle', 0)}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>

        <div className="space-y-1">
          {/* Position & Size Section */}
          <Section title="Transform" icon={<Move className="h-3.5 w-3.5" />} defaultOpen={true}>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">X</Label>
                <DebouncedNumberInput
                  value={properties.left}
                  onChange={(v) => updateProperty('left', v)}
                  className="h-8 text-xs"
                  suffix="px"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Y</Label>
                <DebouncedNumberInput
                  value={properties.top}
                  onChange={(v) => updateProperty('top', v)}
                  className="h-8 text-xs"
                  suffix="px"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">W</Label>
                <DebouncedNumberInput
                  value={properties.width}
                  onChange={(v) => updateProperty('width', v)}
                  min={1}
                  className="h-8 text-xs"
                  suffix="px"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">H</Label>
                <DebouncedNumberInput
                  value={properties.height}
                  onChange={(v) => updateProperty('height', v)}
                  min={1}
                  className="h-8 text-xs"
                  suffix="px"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <div className="flex-1 space-y-1">
                <Label className="text-[10px] text-muted-foreground">Rotation</Label>
                <DebouncedNumberInput
                  value={properties.angle}
                  onChange={(v) => updateProperty('angle', v)}
                  min={-360}
                  max={360}
                  className="h-8 text-xs"
                  suffix="°"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-[10px] text-muted-foreground">Opacity</Label>
                <DebouncedNumberInput
                  value={Math.round(properties.opacity * 100)}
                  onChange={(v) => updateProperty('opacity', v / 100)}
                  min={0}
                  max={100}
                  className="h-8 text-xs"
                  suffix="%"
                />
              </div>
            </div>

            {/* Align Grid */}
            <div className="pt-2">
              <Label className="text-[10px] text-muted-foreground mb-2 block">Align to Safe Zone</Label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { pos: 'top-left', icon: ArrowUpLeft },
                  { pos: 'top-center', icon: ArrowUp },
                  { pos: 'top-right', icon: ArrowUpRight },
                  { pos: 'middle-left', icon: ArrowLeft },
                  { pos: 'center', icon: Circle },
                  { pos: 'middle-right', icon: ArrowRight },
                  { pos: 'bottom-left', icon: ArrowDownLeft },
                  { pos: 'bottom-center', icon: ArrowDown },
                  { pos: 'bottom-right', icon: ArrowDownRight },
                ].map(({ pos, icon: Icon }) => (
                  <Button 
                    key={pos}
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-full"
                    onClick={() => alignToSafeZone(pos)}
                  >
                    <Icon className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>
          </Section>

          {/* Text Section */}
          {isTextObject && (
            <Section title="Typography" icon={<Type className="h-3.5 w-3.5" />} defaultOpen={true}>
              {/* Text Content */}
              <DebouncedTextarea
                value={properties.text}
                onChange={(v) => updateProperty('text', v)}
                className="min-h-[60px] text-xs resize-none"
                placeholder="Enter text..."
              />

              {/* Font Family */}
              <Select
                value={properties.fontFamily}
                onValueChange={(v) => updateProperty('fontFamily', v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {customFonts.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted">Custom Fonts</div>
                      {customFonts.map((font) => (
                        <SelectItem key={`custom-${font}`} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted">Standard Fonts</div>
                    </>
                  )}
                  {GOOGLE_FONTS.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Font Size & Formatting */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <DebouncedNumberInput
                    value={properties.fontSize}
                    onChange={(v) => updateProperty('fontSize', v)}
                    min={8}
                    max={200}
                    className="h-8 text-xs"
                    suffix="px"
                  />
                </div>
                <div className="flex gap-0.5">
                  <Button
                    variant={properties.fontWeight === 'bold' ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateProperty('fontWeight', properties.fontWeight === 'bold' ? 'normal' : 'bold')}
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={properties.fontStyle === 'italic' ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateProperty('fontStyle', properties.fontStyle === 'italic' ? 'normal' : 'italic')}
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={properties.underline ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateProperty('underline', !properties.underline)}
                  >
                    <Underline className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Text Alignment */}
              <div className="flex gap-0.5">
                <Button
                  variant={properties.textAlign === 'left' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-7"
                  onClick={() => updateProperty('textAlign', 'left')}
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={properties.textAlign === 'center' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-7"
                  onClick={() => updateProperty('textAlign', 'center')}
                >
                  <AlignCenter className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={properties.textAlign === 'right' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-7"
                  onClick={() => updateProperty('textAlign', 'right')}
                >
                  <AlignRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Letter Spacing */}
              <InputRow label="Letter Spacing">
                <DebouncedNumberInput
                  value={properties.charSpacing}
                  onChange={(v) => updateProperty('charSpacing', v)}
                  min={-100}
                  max={500}
                  step={10}
                  className="h-7 text-xs"
                  suffix="px"
                />
              </InputRow>

              {/* Line Height */}
              <InputRow label="Line Height">
                <DebouncedNumberInput
                  value={properties.lineHeight}
                  onChange={(v) => updateProperty('lineHeight', v)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="h-7 text-xs"
                />
              </InputRow>
            </Section>
          )}

          {/* Appearance Section */}
          <Section title="Appearance" icon={<Palette className="h-3.5 w-3.5" />} defaultOpen={true}>
            {/* Fill Type for text */}
            {isTextObject && (
              <div className="flex gap-1 mb-2">
                <Button
                  variant={properties.fillType === 'solid' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-7 text-xs"
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
                  className="flex-1 h-7 text-xs"
                  onClick={() => setProperties(prev => ({ ...prev, fillType: 'gradient' }))}
                >
                  Gradient
                </Button>
              </div>
            )}

            {/* Fill Color */}
            {!isImageObject && (
              <InputRow label="Fill">
                <ColorInput
                  value={properties.fill}
                  onChange={(v) => updateProperty('fill', v)}
                  disabled={properties.fillType === 'gradient'}
                />
              </InputRow>
            )}

            {/* Gradient Editor */}
            {properties.fillType === 'gradient' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                    <Palette className="h-3 w-3 mr-1" />
                    Edit Gradient
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" side="left">
                  <DesignerGradientPicker
                    value={gradientConfig}
                    onChange={setGradientConfig}
                    onApply={applyGradient}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Stroke */}
            {!isImageObject && (
              <>
                <InputRow label="Stroke">
                  <ColorInput
                    value={properties.stroke}
                    onChange={(v) => updateProperty('stroke', v)}
                  />
                </InputRow>
                <InputRow label="Stroke Width">
                  <DebouncedNumberInput
                    value={properties.strokeWidth}
                    onChange={(v) => updateProperty('strokeWidth', v)}
                    min={0}
                    max={20}
                    className="h-7 text-xs"
                    suffix="px"
                  />
                </InputRow>
              </>
            )}

            {/* Corner Radius for rectangles */}
            {selectedObject?.type === 'rect' && (
              <InputRow label="Corner Radius">
                <DebouncedNumberInput
                  value={properties.rx}
                  onChange={(v) => {
                    updateProperty('rx', v);
                    updateProperty('ry', v);
                  }}
                  min={0}
                  max={100}
                  className="h-7 text-xs"
                  suffix="px"
                />
              </InputRow>
            )}
          </Section>

          {/* Effects Section */}
          <Section title="Effects" icon={<Sparkles className="h-3.5 w-3.5" />} defaultOpen={false}>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Drop Shadow</Label>
              <Switch
                checked={properties.shadowEnabled}
                onCheckedChange={(v) => updateProperty('shadowEnabled', v)}
              />
            </div>

            {properties.shadowEnabled && (
              <div className="space-y-2 pl-3 border-l-2 border-muted">
                <InputRow label="Color">
                  <ColorInput
                    value={properties.shadowColor}
                    onChange={(v) => updateProperty('shadowColor', v)}
                  />
                </InputRow>
                <InputRow label="Blur">
                  <DebouncedNumberInput
                    value={properties.shadowBlur}
                    onChange={(v) => updateProperty('shadowBlur', v)}
                    min={0}
                    max={50}
                    className="h-7 text-xs"
                    suffix="px"
                  />
                </InputRow>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Offset X</Label>
                    <DebouncedNumberInput
                      value={properties.shadowOffsetX}
                      onChange={(v) => updateProperty('shadowOffsetX', v)}
                      className="h-7 text-xs"
                      suffix="px"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Offset Y</Label>
                    <DebouncedNumberInput
                      value={properties.shadowOffsetY}
                      onChange={(v) => updateProperty('shadowOffsetY', v)}
                      className="h-7 text-xs"
                      suffix="px"
                    />
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* Barcode Settings Section */}
          {isBarcodeObject && (
            <Section title="Barcode Settings" icon={<Barcode className="h-3.5 w-3.5" />} defaultOpen={true}>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Format</Label>
                  <Select
                    value={properties.barcodeFormat}
                    onValueChange={(v) => setProperties(prev => ({ ...prev, barcodeFormat: v as BarcodeFormat }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BARCODE_FORMATS.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Bar Width</Label>
                    <DebouncedNumberInput
                      value={properties.barcodeWidth}
                      onChange={(v) => setProperties(prev => ({ ...prev, barcodeWidth: v }))}
                      min={1}
                      max={5}
                      step={0.5}
                      className="h-7 text-xs"
                      suffix="px"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Height</Label>
                    <DebouncedNumberInput
                      value={properties.barcodeHeight}
                      onChange={(v) => setProperties(prev => ({ ...prev, barcodeHeight: v }))}
                      min={30}
                      max={100}
                      className="h-7 text-xs"
                      suffix="px"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Value</Label>
                  <Switch
                    checked={properties.showValue}
                    onCheckedChange={(v) => setProperties(prev => ({ ...prev, showValue: v }))}
                  />
                </div>
                
                <Button 
                  onClick={regenerateBarcode} 
                  disabled={isRegenerating}
                  className="w-full h-8 text-xs"
                  variant="outline"
                >
                  <RefreshCw className={cn("h-3 w-3 mr-1", isRegenerating && "animate-spin")} />
                  Apply Changes
                </Button>
              </div>
            </Section>
          )}

          {/* QR Code Settings Section */}
          {isQRObject && (
            <Section title="QR Code Settings" icon={<QrCode className="h-3.5 w-3.5" />} defaultOpen={true}>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Size: {properties.qrSize}px</Label>
                  <Slider
                    value={[properties.qrSize]}
                    onValueChange={([v]) => setProperties(prev => ({ ...prev, qrSize: v }))}
                    min={50}
                    max={400}
                    step={10}
                    className="py-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Dark Color</Label>
                    <ColorInput
                      value={properties.qrDarkColor}
                      onChange={(v) => setProperties(prev => ({ ...prev, qrDarkColor: v }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Light Color</Label>
                    <ColorInput
                      value={properties.qrLightColor}
                      onChange={(v) => setProperties(prev => ({ ...prev, qrLightColor: v }))}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={regenerateQRCode} 
                  disabled={isRegenerating}
                  className="w-full h-8 text-xs"
                  variant="outline"
                >
                  <RefreshCw className={cn("h-3 w-3 mr-1", isRegenerating && "animate-spin")} />
                  Apply Changes
                </Button>
              </div>
            </Section>
          )}

          {/* Photo Settings Section */}
          {isPhotoObject && (
            <Section title="Photo Settings" icon={<ImageIcon className="h-3.5 w-3.5" />} defaultOpen={true}>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Current Shape</Label>
                  <div className="text-xs bg-muted px-2 py-1 rounded capitalize">
                    {properties.photoShape || 'Rectangle'}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Border Style</Label>
                  <div className="flex gap-1">
                    <Button
                      variant={properties.photoBorderStyle === 'none' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => {
                        setProperties(prev => ({ ...prev, photoBorderStyle: 'none' }));
                        updatePhotoBorder('none');
                      }}
                    >
                      None
                    </Button>
                    <Button
                      variant={properties.photoBorderStyle === 'solid' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => {
                        setProperties(prev => ({ ...prev, photoBorderStyle: 'solid' }));
                        updatePhotoBorder('solid');
                      }}
                    >
                      Solid
                    </Button>
                    <Button
                      variant={properties.photoBorderStyle === 'dashed' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => {
                        setProperties(prev => ({ ...prev, photoBorderStyle: 'dashed' }));
                        updatePhotoBorder('dashed');
                      }}
                    >
                      Dashed
                    </Button>
                  </div>
                </div>
                
                {properties.photoBorderStyle !== 'none' && (
                  <>
                    <InputRow label="Border Width">
                      <DebouncedNumberInput
                        value={properties.photoBorderWidth}
                        onChange={(v) => {
                          setProperties(prev => ({ ...prev, photoBorderWidth: v }));
                          updatePhotoBorder(properties.photoBorderStyle, v);
                        }}
                        min={1}
                        max={10}
                        className="h-7 text-xs"
                        suffix="px"
                      />
                    </InputRow>
                    
                    <InputRow label="Border Color">
                      <ColorInput
                        value={properties.photoBorderColor}
                        onChange={(v) => {
                          setProperties(prev => ({ ...prev, photoBorderColor: v }));
                          updatePhotoBorder(properties.photoBorderStyle, undefined, v);
                        }}
                      />
                    </InputRow>
                  </>
                )}
                
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Custom Mask</Label>
                  <input
                    ref={maskInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const url = ev.target?.result as string;
                          if (selectedObject && selectedObject.data) {
                            selectedObject.data.customMaskUrl = url;
                            selectedObject.data.shape = 'custom';
                            canvas?.requestRenderAll();
                            onUpdate();
                            toast.success('Custom mask applied');
                          }
                        };
                        reader.readAsDataURL(file);
                        e.target.value = '';
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-8 text-xs"
                    onClick={() => maskInputRef.current?.click()}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload Custom Mask
                  </Button>
                  <p className="text-[10px] text-muted-foreground">
                    Upload an image to use as a mask shape
                  </p>
                </div>
              </div>
            </Section>
          )}

          {/* Data Linking Section */}
          <Section title="Data Link" icon={<Database className="h-3.5 w-3.5" />} defaultOpen={false}>
            <p className="text-[10px] text-muted-foreground">
              Link to a data column for batch generation
            </p>
            <Input
              value={properties.dataField}
              onChange={(e) => updateProperty('dataField', e.target.value)}
              placeholder="e.g., {{name}}"
              className="h-8 text-xs font-mono"
            />
          </Section>
        </div>
      </div>
    </ScrollArea>
  );
}
