import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, ExternalLink } from 'lucide-react';

interface DesignerFAQPanelProps {
  onClose: () => void;
}

const FAQ_ITEMS = [
  {
    question: "How do I add dynamic data fields?",
    answer: "Use the Data tab in the left sidebar to add variable placeholders like {{name}}, {{photo}}, etc. These will be replaced with actual data when generating cards."
  },
  {
    question: "How do I add a photo placeholder?",
    answer: "Go to Images panel in the left sidebar and click 'Add Photo Placeholder'. You can choose different shapes like rectangle, circle, or custom masks."
  },
  {
    question: "Can I add a QR code or barcode?",
    answer: "Yes! Use the Elements panel to add QR codes and barcodes. Link them to data fields to generate unique codes for each record."
  },
  {
    question: "How do I change the template size?",
    answer: "Click the Layout tab in the left sidebar to change canvas dimensions, or use the Settings button in the header for preset sizes."
  },
  {
    question: "How do I save my template?",
    answer: "Click the Save button in the header toolbar, or use Ctrl+S keyboard shortcut. Templates are saved to your account."
  },
  {
    question: "Can I undo my changes?",
    answer: "Yes! Use Ctrl+Z to undo or Ctrl+Shift+Z to redo. You can also use the undo/redo buttons in the bottom toolbar."
  },
  {
    question: "How do I export my design?",
    answer: "Use the Batch PDF panel to generate PDFs with your data, or export single previews using the export options."
  },
  {
    question: "How do I align objects?",
    answer: "Select an object to see alignment options in the floating toolbar. You can also use the right-click context menu for more options."
  },
  {
    question: "How do I add custom fonts?",
    answer: "Go to Library panel and upload your custom fonts. Once uploaded, they'll be available in the font dropdown when editing text."
  },
  {
    question: "Can I create templates with front and back sides?",
    answer: "Yes! Enable 'Back Side' in the template settings. You can then switch between front and back views to design both sides."
  }
];

export function DesignerFAQPanel({ onClose }: DesignerFAQPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Frequently Asked Questions
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="text-xs text-left hover:no-underline py-2">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground pb-3">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" className="w-full text-xs gap-2">
              <ExternalLink className="h-3 w-3" />
              View Full Documentation
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
