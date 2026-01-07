/**
 * Auto Font Size utility for Fabric.js textboxes
 * Automatically adjusts font size to fit text within a fixed bounding box
 */

interface AutoFontSizeOptions {
  minFontSize?: number;
  maxFontSize?: number;
  step?: number;
}

/**
 * Calculates the optimal font size for a textbox to fit within its bounding box
 * Uses binary search for efficiency
 */
export function calculateOptimalFontSize(
  textbox: any,
  options: AutoFontSizeOptions = {}
): number {
  const { minFontSize = 8, maxFontSize = 200, step = 1 } = options;
  
  if (!textbox || !textbox.text) return textbox?.fontSize || 16;
  
  const originalFontSize = textbox.fontSize;
  const fixedWidth = textbox.width || 100;
  const fixedHeight = textbox.fixedHeight || textbox.height || 50;
  
  // Store if the textbox has a fixed height defined
  const hasFixedHeight = textbox.data?.fixedHeight || textbox.fixedHeight;
  
  // Binary search for optimal font size
  let low = minFontSize;
  let high = maxFontSize;
  let optimalSize = minFontSize;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    
    // Temporarily set font size to measure
    textbox.set('fontSize', mid);
    
    // Get the actual height the text would take
    const textHeight = textbox.calcTextHeight ? textbox.calcTextHeight() : textbox.height;
    const textWidth = textbox.calcTextWidth ? textbox.calcTextWidth() : textbox.width;
    
    // Check if text fits within bounds
    const fitsWidth = textWidth <= fixedWidth;
    const fitsHeight = !hasFixedHeight || textHeight <= fixedHeight;
    
    if (fitsWidth && fitsHeight) {
      optimalSize = mid;
      low = mid + step;
    } else {
      high = mid - step;
    }
  }
  
  // Restore original font size (the caller will apply the optimal size)
  textbox.set('fontSize', originalFontSize);
  
  return Math.max(minFontSize, optimalSize);
}

/**
 * Applies auto font sizing to a textbox if enabled
 */
export function applyAutoFontSize(textbox: any, canvas: any): void {
  if (!textbox || !canvas) return;
  if (!textbox.data?.autoFontSize) return;
  
  const optimalSize = calculateOptimalFontSize(textbox, {
    minFontSize: 8,
    maxFontSize: textbox.data?.maxFontSize || 200,
  });
  
  textbox.set('fontSize', optimalSize);
  canvas.requestRenderAll();
}

/**
 * Sets up auto font size event listeners for a canvas
 */
export function setupAutoFontSizeListeners(canvas: any): () => void {
  if (!canvas) return () => {};
  
  const handleTextChange = (e: any) => {
    const textbox = e.target;
    if (!textbox) return;
    if (textbox.type !== 'textbox' && textbox.type !== 'i-text') return;
    
    applyAutoFontSize(textbox, canvas);
  };
  
  const handleTextEditingExited = (e: any) => {
    const textbox = e.target;
    if (!textbox) return;
    if (textbox.type !== 'textbox' && textbox.type !== 'i-text') return;
    
    applyAutoFontSize(textbox, canvas);
  };
  
  // Listen for text changes
  canvas.on('text:changed', handleTextChange);
  canvas.on('text:editing:exited', handleTextEditingExited);
  
  // Return cleanup function
  return () => {
    canvas.off('text:changed', handleTextChange);
    canvas.off('text:editing:exited', handleTextEditingExited);
  };
}
