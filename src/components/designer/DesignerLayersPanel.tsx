import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Eye, EyeOff, Lock, Unlock, Trash2, ChevronUp, ChevronDown,
  Type, Square, Circle, Image, Triangle, Star, Minus, GripVertical, Pencil, Check, X, Layers
} from 'lucide-react';

interface DesignerLayersPanelProps {
  objects: any[];
  selectedObject: any;
  onSelectObject: (obj: any) => void;
  onToggleVisibility: (obj: any) => void;
  onToggleLock: (obj: any) => void;
  onDeleteObject: (obj: any) => void;
  onMoveUp: (obj: any) => void;
  onMoveDown: (obj: any) => void;
}

export function DesignerLayersPanel({
  objects,
  selectedObject,
  onSelectObject,
  onToggleVisibility,
  onToggleLock,
  onDeleteObject,
  onMoveUp,
  onMoveDown,
}: DesignerLayersPanelProps) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'textbox':
      case 'i-text':
        return Type;
      case 'rect':
        return Square;
      case 'circle':
        return Circle;
      case 'triangle':
        return Triangle;
      case 'polygon':
        return Star;
      case 'line':
        return Minus;
      case 'image':
        return Image;
      default:
        return Square;
    }
  };

  const getObjectLabel = (obj: any, index: number) => {
    // Use custom name if set
    if (obj.data?.layerName) {
      return obj.data.layerName;
    }

    const type = obj.type || 'object';
    if (obj.text) {
      const text = obj.text.substring(0, 15);
      return text.length < obj.text.length ? `${text}...` : text;
    }
    if (obj.data?.field) {
      return `{{${obj.data.field}}}`;
    }
    if (obj.data?.isPhoto) {
      return 'Photo Placeholder';
    }
    if (obj.data?.isBarcode) {
      return 'Barcode';
    }
    if (obj.data?.isQRCode) {
      return 'QR Code';
    }
    if (obj.data?.isBackground) {
      return 'Background Image';
    }
    if (obj.data?.isGradientBackground) {
      return 'Gradient Background';
    }
    return `${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`;
  };

  const getObjectPreview = (obj: any): string | null => {
    // For images, return the src
    if (obj.type === 'image' && obj.getSrc) {
      return obj.getSrc();
    }
    if (obj._element?.src) {
      return obj._element.src;
    }
    return null;
  };

  const handleStartEdit = (obj: any, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const stableKey = obj.id || `${obj.type}-${obj.left}-${obj.top}`;
    setEditingLayerId(stableKey);
    setEditingName(currentName);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSaveEdit = (obj: any) => {
    if (!obj.data) obj.data = {};
    obj.data.layerName = editingName.trim() || undefined;
    setEditingLayerId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingLayerId(null);
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, obj: any) => {
    if (e.key === 'Enter') {
      handleSaveEdit(obj);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', idx.toString());
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(idx);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    const dragIdx = draggedIndex;

    if (dragIdx !== null && dragIdx !== dropIdx) {
      // Use the same sorting as in the render to identify neighbors correctly
      const filtered = objects.filter((obj: any) => !obj.data?.isGuideline);
      const sorted = [...filtered].sort((a, b) => {
        if ((a.top || 0) !== (b.top || 0)) return (a.top || 0) - (b.top || 0);
        return (a.left || 0) - (b.left || 0);
      });

      const draggedObj = sorted[dragIdx];

      if (dragIdx < dropIdx) {
        // Moving down (towards bottom of canvas)
        for (let i = 0; i < dropIdx - dragIdx; i++) {
          onMoveDown(draggedObj);
        }
      } else {
        // Moving up (towards top of canvas)
        for (let i = 0; i < dragIdx - dropIdx; i++) {
          onMoveUp(draggedObj);
        }
      }
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Filter out guideline objects and background objects (optional, or just keep them at bottom)
  const filteredObjects = objects.filter((obj: any) => !obj.data?.isGuideline);

  // Sort by vertical position (top property)
  const sortedObjects = [...filteredObjects].sort((a, b) => (a.top || 0) - (b.top || 0));

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Layers
          </h3>
          <Badge variant="secondary" className="text-xs">
            {filteredObjects.length}
          </Badge>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-1 space-y-0.5">
            {sortedObjects.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">
                No objects on canvas
              </div>
            ) : (
              sortedObjects.map((obj, idx) => {
                const originalIndex = idx;
                const Icon = getObjectIcon(obj.type);
                const isSelected = selectedObject === obj;
                const isVisible = obj.visible !== false;
                const isLocked = obj.lockMovementX && obj.lockMovementY;
                const preview = getObjectPreview(obj);
                const label = getObjectLabel(obj, originalIndex);

                // Use a stable key based on object properties
                const stableKey = obj.id || `${obj.type}-${originalIndex}-${obj.left}-${obj.top}`;
                const isEditing = editingLayerId === stableKey;
                const isDragging = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx;

                return (
                  <div
                    key={stableKey}
                    draggable={!isEditing && !isLocked}
                    onDragStart={(e) => !isLocked && handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-1 p-1.5 rounded cursor-pointer group transition-all ${isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50'
                      } ${isDragging ? 'opacity-50' : ''} ${isDragOver ? 'border-t-2 border-t-primary' : ''}`}
                    onClick={() => !isEditing && onSelectObject(obj)}
                  >
                    {/* Drag Handle */}
                    {!isLocked && (
                      <div className="cursor-grab opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity">
                        <GripVertical className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}

                    {/* Thumbnail or Icon */}
                    {preview ? (
                      <div className="w-6 h-6 flex-shrink-0 rounded overflow-hidden border bg-muted">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <Icon className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}

                    {/* Label / Edit Input */}
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-1">
                        <Input
                          ref={inputRef}
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, obj)}
                          className="h-5 text-xs py-0 px-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => { e.stopPropagation(); handleSaveEdit(obj); }}
                        >
                          <Check className="h-3 w-3 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                        >
                          <X className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <span
                        className={`text-xs flex-1 truncate ${!isVisible ? 'opacity-50' : ''}`}
                        onDoubleClick={(e) => handleStartEdit(obj, label, e)}
                      >
                        {label}
                      </span>
                    )}

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => handleStartEdit(obj, label, e)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Rename</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              disabled={idx === 0}
                              onClick={(e) => { e.stopPropagation(); onMoveUp(obj); }}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Move Up</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              disabled={idx === sortedObjects.length - 1}
                              onClick={(e) => { e.stopPropagation(); onMoveDown(obj); }}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Move Down</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => { e.stopPropagation(); onToggleVisibility(obj); }}
                            >
                              {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">{isVisible ? 'Hide' : 'Show'}</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => { e.stopPropagation(); onToggleLock(obj); }}
                            >
                              {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">{isLocked ? 'Unlock' : 'Lock'}</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-destructive hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); onDeleteObject(obj); }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
