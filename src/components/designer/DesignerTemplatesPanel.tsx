import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutTemplate, ChevronRight } from 'lucide-react';

interface DesignerTemplatesPanelProps {
  onClose: () => void;
  onSelectTemplate?: (template: any) => void;
}

const SAMPLE_TEMPLATES = [
  { id: '1', name: 'ID Card - Modern', category: 'ID Card', thumbnail: null },
  { id: '2', name: 'Certificate - Classic', category: 'Certificate', thumbnail: null },
  { id: '3', name: 'Badge - Circular', category: 'Badge', thumbnail: null },
  { id: '4', name: 'Business Card - Minimal', category: 'Visiting Card', thumbnail: null },
  { id: '5', name: 'ID Card - Corporate', category: 'ID Card', thumbnail: null },
  { id: '6', name: 'Certificate - Award', category: 'Certificate', thumbnail: null },
];

export function DesignerTemplatesPanel({ onClose, onSelectTemplate }: DesignerTemplatesPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4" />
          Templates
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          <div className="text-xs text-muted-foreground">
            Start from a pre-designed template
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_TEMPLATES.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => onSelectTemplate?.(template)}
              >
                <div className="aspect-[16/10] bg-muted flex items-center justify-center rounded-t-lg">
                  <LayoutTemplate className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <CardContent className="p-2">
                  <p className="text-xs font-medium truncate">{template.name}</p>
                  <Badge variant="secondary" className="text-[10px] mt-1">
                    {template.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full text-xs">
            Browse All Templates
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
