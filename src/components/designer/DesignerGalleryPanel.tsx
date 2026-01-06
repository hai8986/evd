import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Images, Upload } from 'lucide-react';

interface DesignerGalleryPanelProps {
  onClose: () => void;
  onSelectImage?: (url: string) => void;
}

export function DesignerGalleryPanel({ onClose, onSelectImage }: DesignerGalleryPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Images className="h-4 w-4" />
          Gallery
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          <div className="text-xs text-muted-foreground">
            Your saved designs and assets
          </div>
          
          <Button variant="outline" size="sm" className="w-full text-xs gap-2">
            <Upload className="h-3 w-3" />
            Upload Image
          </Button>

          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Card 
                key={i} 
                className="cursor-pointer hover:border-primary transition-colors aspect-square"
              >
                <div className="h-full bg-muted flex items-center justify-center rounded-lg">
                  <Images className="h-6 w-6 text-muted-foreground/50" />
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center py-6 text-xs text-muted-foreground">
            <Images className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Gallery is empty.<br />
            Upload images or save designs to see them here.
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
