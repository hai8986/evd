import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlignLeft, AlignCenter, AlignRight, AlignStartVertical,
  AlignCenterVertical, AlignEndVertical, AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter
} from 'lucide-react';

interface DesignerAlignmentToolbarProps {
  selectedObject: any;
  canvas: any;
  onUpdate: () => void;
}

export function DesignerAlignmentToolbar({ selectedObject, canvas, onUpdate }: DesignerAlignmentToolbarProps) {
  if (!selectedObject || !canvas) return null;

  const alignLeft = () => {
    selectedObject.set('left', 0);
    selectedObject.setCoords();
    canvas.requestRenderAll();
    onUpdate();
  };

  const alignCenter = () => {
    const canvasWidth = canvas.width / canvas.getZoom();
    const objWidth = selectedObject.width * (selectedObject.scaleX || 1);
    selectedObject.set('left', (canvasWidth - objWidth) / 2);
    selectedObject.setCoords();
    canvas.requestRenderAll();
    onUpdate();
  };

  const alignRight = () => {
    const canvasWidth = canvas.width / canvas.getZoom();
    const objWidth = selectedObject.width * (selectedObject.scaleX || 1);
    selectedObject.set('left', canvasWidth - objWidth);
    selectedObject.setCoords();
    canvas.requestRenderAll();
    onUpdate();
  };

  const alignTop = () => {
    selectedObject.set('top', 0);
    selectedObject.setCoords();
    canvas.requestRenderAll();
    onUpdate();
  };

  const alignMiddle = () => {
    const canvasHeight = canvas.height / canvas.getZoom();
    const objHeight = selectedObject.height * (selectedObject.scaleY || 1);
    selectedObject.set('top', (canvasHeight - objHeight) / 2);
    selectedObject.setCoords();
    canvas.requestRenderAll();
    onUpdate();
  };

  const alignBottom = () => {
    const canvasHeight = canvas.height / canvas.getZoom();
    const objHeight = selectedObject.height * (selectedObject.scaleY || 1);
    selectedObject.set('top', canvasHeight - objHeight);
    selectedObject.setCoords();
    canvas.requestRenderAll();
    onUpdate();
  };

  const distributeHorizontal = () => {
    const activeSelection = canvas.getActiveObject();
    if (!activeSelection || activeSelection.type !== 'activeSelection') return;
    
    const objects = activeSelection.getObjects().slice().sort((a: any, b: any) => 
      (a.left || 0) - (b.left || 0)
    );
    
    if (objects.length < 3) return;
    
    const firstLeft = objects[0].left || 0;
    const lastObj = objects[objects.length - 1];
    const lastRight = (lastObj.left || 0) + lastObj.width * (lastObj.scaleX || 1);
    const totalWidth = lastRight - firstLeft;
    
    let totalObjWidth = 0;
    objects.forEach((obj: any) => {
      totalObjWidth += obj.width * (obj.scaleX || 1);
    });
    
    const spacing = (totalWidth - totalObjWidth) / (objects.length - 1);
    
    let currentLeft = firstLeft;
    objects.forEach((obj: any) => {
      obj.set('left', currentLeft);
      currentLeft += obj.width * (obj.scaleX || 1) + spacing;
    });
    
    canvas.requestRenderAll();
    onUpdate();
  };

  const distributeVertical = () => {
    const activeSelection = canvas.getActiveObject();
    if (!activeSelection || activeSelection.type !== 'activeSelection') return;
    
    const objects = activeSelection.getObjects().slice().sort((a: any, b: any) => 
      (a.top || 0) - (b.top || 0)
    );
    
    if (objects.length < 3) return;
    
    const firstTop = objects[0].top || 0;
    const lastObj = objects[objects.length - 1];
    const lastBottom = (lastObj.top || 0) + lastObj.height * (lastObj.scaleY || 1);
    const totalHeight = lastBottom - firstTop;
    
    let totalObjHeight = 0;
    objects.forEach((obj: any) => {
      totalObjHeight += obj.height * (obj.scaleY || 1);
    });
    
    const spacing = (totalHeight - totalObjHeight) / (objects.length - 1);
    
    let currentTop = firstTop;
    objects.forEach((obj: any) => {
      obj.set('top', currentTop);
      currentTop += obj.height * (obj.scaleY || 1) + spacing;
    });
    
    canvas.requestRenderAll();
    onUpdate();
  };

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 bg-muted/30 border-b">
      <span className="text-[10px] text-muted-foreground mr-2">Align:</span>
      
      {/* Horizontal Alignment */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={alignLeft}>
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Align Left</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={alignCenter}>
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Align Center</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={alignRight}>
            <AlignRight className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Align Right</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-4 mx-1" />

      {/* Vertical Alignment */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={alignTop}>
            <AlignStartVertical className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Align Top</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={alignMiddle}>
            <AlignCenterVertical className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Align Middle</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={alignBottom}>
            <AlignEndVertical className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Align Bottom</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-4 mx-1" />

      {/* Distribution (for multiple selection) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={distributeHorizontal}>
            <AlignHorizontalDistributeCenter className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Distribute Horizontally</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={distributeVertical}>
            <AlignVerticalDistributeCenter className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Distribute Vertically</TooltipContent>
      </Tooltip>
    </div>
  );
}
