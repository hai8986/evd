import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Grid3X3,
  Maximize2,
  Save,
  Copy,
  Trash2
} from 'lucide-react';

interface DesignerCanvasToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyStep?: number;
  historyTotal?: number;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomChange?: (zoom: number) => void;
  currentPage?: number;
  totalPages?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  isPreviewMode?: boolean;
  onTogglePreviewMode?: () => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  onFitToScreen?: () => void;
  onSave?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
}

export function DesignerCanvasToolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  historyStep,
  historyTotal,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomChange,
  currentPage = 1,
  totalPages = 1,
  onPrevPage,
  onNextPage,
  isPreviewMode = false,
  onTogglePreviewMode,
  showGrid = true,
  onToggleGrid,
  onFitToScreen,
  onSave,
  onCopy,
  onDelete,
}: DesignerCanvasToolbarProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-between h-12 px-3 bg-card/95 backdrop-blur-sm border-t gap-2">
        {/* Left - Undo/Redo + Actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={onRedo}
                disabled={!canRedo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {onSave && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={onSave}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save (Ctrl+S)</TooltipContent>
            </Tooltip>
          )}

          {onCopy && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={onCopy}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate (Ctrl+D)</TooltipContent>
            </Tooltip>
          )}

          {onDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Selected</TooltipContent>
            </Tooltip>
          )}

          {onToggleGrid && (
            <>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={showGrid ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={onToggleGrid}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Grid</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        {/* Center - Page navigation */}
        <div className="flex items-center gap-1">
          {onPrevPage && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onPrevPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          <span className="text-sm text-muted-foreground min-w-[60px] text-center font-medium">
            {currentPage} / {totalPages}
          </span>
          
          {onNextPage && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onNextPage}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Right - Zoom + Preview */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={onZoomOut}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>

          {/* Zoom Slider */}
          <div className="w-24 flex items-center gap-2">
            <Slider
              value={[zoom * 100]}
              min={25}
              max={300}
              step={5}
              onValueChange={([value]) => onZoomChange?.(value / 100)}
              className="flex-1"
            />
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={onZoomReset}
                className="text-xs font-semibold w-14 text-center py-1.5 rounded-md hover:bg-muted transition-colors bg-primary/10 text-primary"
              >
                {Math.round(zoom * 100)}%
              </button>
            </TooltipTrigger>
            <TooltipContent>Reset Zoom</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={onZoomIn}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>

          {onFitToScreen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={onFitToScreen}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fit to Screen</TooltipContent>
            </Tooltip>
          )}

          {onTogglePreviewMode && (
            <>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button 
                variant={isPreviewMode ? 'default' : 'outline'} 
                size="sm" 
                className="h-8 text-xs gap-1.5"
                onClick={onTogglePreviewMode}
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
