import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Keyboard, PlayCircle, ExternalLink } from 'lucide-react';

interface DesignerHelpPanelProps {
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    title: "Left Sidebar - Tools",
    description: "Access all design tools: Elements, Layout, Background, Images, Data fields, and Library assets.",
    icon: "🎨"
  },
  {
    title: "Canvas Area",
    description: "Your design workspace. Drag, resize, and arrange elements. Use guides and grid for precise positioning.",
    icon: "📐"
  },
  {
    title: "Properties Panel",
    description: "Edit selected object properties like colors, fonts, sizes, and advanced settings.",
    icon: "⚙️"
  },
  {
    title: "Layers Panel",
    description: "Manage layer order, visibility, and lock status. Rename layers for better organization.",
    icon: "📚"
  },
  {
    title: "Data Preview",
    description: "Test your template with sample data to see how variables will be replaced.",
    icon: "👁️"
  },
  {
    title: "Batch Generation",
    description: "Upload data and generate multiple cards/certificates at once as PDF.",
    icon: "📄"
  }
];

const SHORTCUTS = [
  { category: 'General', items: [
    { keys: ['Ctrl', 'S'], description: 'Save template' },
    { keys: ['Ctrl', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
  ]},
  { category: 'Selection', items: [
    { keys: ['V'], description: 'Select tool' },
    { keys: ['Ctrl', 'C'], description: 'Copy selected' },
    { keys: ['Ctrl', 'V'], description: 'Paste' },
    { keys: ['Delete'], description: 'Delete selected' },
    { keys: ['Ctrl', 'A'], description: 'Select all' },
  ]},
  { category: 'Tools', items: [
    { keys: ['T'], description: 'Text tool' },
    { keys: ['R'], description: 'Rectangle tool' },
    { keys: ['C'], description: 'Circle tool' },
    { keys: ['L'], description: 'Line tool' },
    { keys: ['H'], description: 'Pan tool' },
  ]},
  { category: 'View', items: [
    { keys: ['Ctrl', '+'], description: 'Zoom in' },
    { keys: ['Ctrl', '-'], description: 'Zoom out' },
    { keys: ['Ctrl', '0'], description: 'Reset zoom' },
    { keys: ['G'], description: 'Toggle grid' },
  ]},
];

export function DesignerHelpPanel({ onClose }: DesignerHelpPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Keyboard className="h-4 w-4" />
          Help & Shortcuts
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Guided Tour Section */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-medium flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-primary" />
                Guided Tour
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {TOUR_STEPS.map((step, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <span className="text-base flex-shrink-0">{step.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium">{step.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts Section */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-medium flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-primary" />
                Keyboard Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-3">
              {SHORTCUTS.map((section) => (
                <div key={section.category}>
                  <p className="text-[10px] font-medium text-muted-foreground mb-1.5">
                    {section.category}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((shortcut, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between py-0.5"
                      >
                        <span className="text-xs">{shortcut.description}</span>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {shortcut.keys.map((key, keyIdx) => (
                            <span key={keyIdx} className="flex items-center">
                              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border rounded">
                                {key}
                              </kbd>
                              {keyIdx < shortcut.keys.length - 1 && (
                                <span className="text-muted-foreground mx-0.5 text-[10px]">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Documentation Link */}
          <Button variant="outline" size="sm" className="w-full text-xs gap-2">
            <ExternalLink className="h-3 w-3" />
            View Full Documentation
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
