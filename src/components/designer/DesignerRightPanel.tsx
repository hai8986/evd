import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Settings, Layers, LayoutTemplate, Images, HelpCircle, Keyboard, PanelRight } from 'lucide-react';
import { DesignerPropertiesPanel } from './DesignerPropertiesPanel';
import { DesignerLayersPanel } from './DesignerLayersPanel';
import { DesignerTemplatesPanel } from './DesignerTemplatesPanel';
import { DesignerGalleryPanel } from './DesignerGalleryPanel';
import { DesignerFAQPanel } from './DesignerFAQPanel';
import { DesignerHelpPanel } from './DesignerHelpPanel';
import { useIsMobile } from '@/hooks/use-mobile';

export type RightPanelTab = 'properties' | 'layers' | 'templates' | 'gallery' | 'faq' | 'help';

interface DesignerRightPanelProps {
  selectedObject: any;
  canvas: any;
  objects: any[];
  onUpdate: () => void;
  onSelectObject: (obj: any) => void;
  onDeleteObject: (obj: any) => void;
  onToggleVisibility: (obj: any) => void;
  onToggleLock: (obj: any) => void;
  onReorderObject: (obj: any, direction: 'up' | 'down') => void;
  customFonts?: string[];
  safeZoneMm?: number;
  mmToPixels?: number;
}

const TAB_ITEMS = [
  { id: 'properties' as RightPanelTab, icon: Settings, label: 'Properties' },
  { id: 'layers' as RightPanelTab, icon: Layers, label: 'Layers' },
  { id: 'templates' as RightPanelTab, icon: LayoutTemplate, label: 'Templates' },
  { id: 'gallery' as RightPanelTab, icon: Images, label: 'Gallery' },
  { id: 'faq' as RightPanelTab, icon: HelpCircle, label: 'FAQ' },
  { id: 'help' as RightPanelTab, icon: Keyboard, label: 'Shortcuts & Tour' },
];

export function DesignerRightPanel({
  selectedObject,
  canvas,
  objects,
  onUpdate,
  onSelectObject,
  onDeleteObject,
  onToggleVisibility,
  onToggleLock,
  onReorderObject,
  customFonts = [],
  safeZoneMm = 4,
  mmToPixels = 3.78,
}: DesignerRightPanelProps) {
  const [activeTab, setActiveTab] = useState<RightPanelTab>('properties');
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'properties':
        return (
          <DesignerPropertiesPanel
            selectedObject={selectedObject}
            canvas={canvas}
            onUpdate={onUpdate}
            customFonts={customFonts}
            safeZoneMm={safeZoneMm}
            mmToPixels={mmToPixels}
          />
        );
      case 'layers':
        return (
          <DesignerLayersPanel
            objects={objects}
            selectedObject={selectedObject}
            onSelectObject={onSelectObject}
            onDeleteObject={onDeleteObject}
            onToggleVisibility={onToggleVisibility}
            onToggleLock={onToggleLock}
            onMoveUp={(obj) => onReorderObject(obj, 'up')}
            onMoveDown={(obj) => onReorderObject(obj, 'down')}
          />
        );
      case 'templates':
        return <DesignerTemplatesPanel onClose={() => setActiveTab('properties')} />;
      case 'gallery':
        return <DesignerGalleryPanel onClose={() => setActiveTab('properties')} />;
      case 'faq':
        return <DesignerFAQPanel onClose={() => setActiveTab('properties')} />;
      case 'help':
        return <DesignerHelpPanel onClose={() => setActiveTab('properties')} />;
      default:
        return null;
    }
  };

  const TabBar = () => (
    <div className="flex flex-col gap-1 p-1.5 bg-muted/50 border-l border-border">
      {TAB_ITEMS.map((item) => (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>
            <Button
              variant={activeTab === item.id ? 'default' : 'ghost'}
              size="icon"
              className={`h-9 w-9 ${activeTab !== item.id ? 'text-muted-foreground hover:text-foreground hover:bg-muted' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-popover text-popover-foreground border-border">
            {item.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );

  const PanelContent = () => (
    <div className="flex h-full bg-background border-l border-border">
      {/* Content Area */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {activeTab === 'properties' || activeTab === 'layers' ? (
          renderTabContent()
        ) : (
          <ScrollArea className="h-full">
            {renderTabContent()}
          </ScrollArea>
        )}
      </div>

      {/* Tab Bar */}
      <TooltipProvider>
        <TabBar />
      </TooltipProvider>
    </div>
  );

  // Mobile view with Sheet
  if (isMobile) {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full shadow-lg bg-background border-border"
            >
              <PanelRight className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0">
            <PanelContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop view
  return <PanelContent />;
}
