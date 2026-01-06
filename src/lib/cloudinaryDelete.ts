import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = 'https://jkcdwxkqzohibsxglhyk.supabase.co';

/**
 * Delete photos from Cloudinary for given record IDs
 */
export async function deleteCloudinaryPhotos(recordIds: string[]): Promise<void> {
  if (recordIds.length === 0) return;

  try {
    // Get records with their cloudinary public IDs
    const { data: records, error } = await supabase
      .from('data_records')
      .select('id, cloudinary_public_id, photo_url, original_photo_url, cropped_photo_url')
      .in('id', recordIds);

    if (error) {
      console.error('Error fetching records for Cloudinary deletion:', error);
      return;
    }

    if (!records || records.length === 0) return;

    // Collect all cloudinary public IDs to delete
    const publicIdsToDelete: string[] = [];

    for (const record of records) {
      if (record.cloudinary_public_id) {
        publicIdsToDelete.push(record.cloudinary_public_id);
      }

      // Extract public IDs from URLs if cloudinary_public_id is not set
      const urls = [record.photo_url, record.original_photo_url, record.cropped_photo_url].filter(Boolean);
      for (const url of urls) {
        const publicId = extractPublicIdFromUrl(url as string);
        if (publicId && !publicIdsToDelete.includes(publicId)) {
          publicIdsToDelete.push(publicId);
        }
      }
    }

    // Get auth token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    // Delete each photo from Cloudinary
    for (const publicId of publicIdsToDelete) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/cloudinary-upload?action=delete`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ publicId }),
          }
        );

        if (response.ok) {
          console.log('Deleted from Cloudinary:', publicId);
        } else {
          console.error('Failed to delete from Cloudinary:', publicId, await response.text());
        }
      } catch (err) {
        console.error('Failed to delete from Cloudinary:', publicId, err);
      }
    }
  } catch (err) {
    console.error('Error in deleteCloudinaryPhotos:', err);
  }
}

/**
 * Extract Cloudinary public ID from a Cloudinary URL
 */
function extractPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;

  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z]+)?$/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      let publicId = match[1];
      const parts = publicId.split('/');
      const transformationPattern = /^[a-z]_/;
      const nonTransformParts = parts.filter(part => !transformationPattern.test(part));
      
      if (nonTransformParts.length > 0) {
        publicId = nonTransformParts.join('/');
      }
      
      return publicId;
    }
  } catch (err) {
    console.error('Error extracting public ID from URL:', url, err);
  }

  return null;
}
