import { supabase } from '@/integrations/supabase/client';

/**
 * Remove background from an image using the remove.bg API via edge function
 * @param imageUrl - URL of the image or data URL
 * @returns Promise<string> - Data URL of the processed image with background removed
 */
export async function removeBackground(imageUrl: string): Promise<string> {
  // Convert URL to blob
  let imageBlob: Blob;
  
  if (imageUrl.startsWith('data:')) {
    // It's a data URL, convert to blob
    const response = await fetch(imageUrl);
    imageBlob = await response.blob();
  } else {
    // It's a regular URL, fetch and convert
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    imageBlob = await response.blob();
  }

  // Create FormData and send to edge function
  const formData = new FormData();
  formData.append('image', imageBlob, 'image.png');

  // Get the Supabase URL from the client
  const supabaseUrl = 'https://jkcdwxkqzohibsxglhyk.supabase.co';
  
  const response = await fetch(`${supabaseUrl}/functions/v1/remove-bg`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Remove background error:', errorText);
    throw new Error('Failed to remove background: ' + errorText);
  }

  // Convert response to data URL
  const resultBlob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(resultBlob);
  });
}

/**
 * Initialize background remover (no-op for API-based approach)
 * Kept for backwards compatibility
 */
export async function initBackgroundRemover(): Promise<void> {
  // No initialization needed for API-based approach
  return Promise.resolve();
}
