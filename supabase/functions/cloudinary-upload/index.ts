import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UploadRequest {
  file: string; // base64 encoded file
  folder?: string;
  publicId?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  // Transformation options
  removeBackground?: boolean;
  autoCrop?: boolean;
  cropWidth?: number;
  cropHeight?: number;
  cropGravity?: 'face' | 'auto' | 'center';
}

interface DeleteRequest {
  publicId: string;
  resourceType?: 'image' | 'video' | 'raw';
}

interface SignatureRequest {
  folder?: string;
  publicId?: string;
}

interface TransformRequest {
  publicId: string;
  removeBackground?: boolean;
  autoCrop?: boolean;
  cropWidth?: number;
  cropHeight?: number;
  cropGravity?: 'face' | 'auto' | 'center';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME')?.trim();
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY')?.trim();
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET')?.trim();

    // Helper function to sanitize public_id (remove special characters that cause signature issues)
    const sanitizePublicId = (id: string): string => {
      return id
        .replace(/[^a-zA-Z0-9_\-\/]/g, '_') // Replace special chars with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    };

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary credentials');
      return new Response(
        JSON.stringify({ error: 'Cloudinary not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'upload';

    if (action === 'signature') {
      // Generate upload signature for direct browser uploads
      const body: SignatureRequest = await req.json();
      const timestamp = Math.round(Date.now() / 1000);
      
      const params: Record<string, string> = {
        timestamp: timestamp.toString(),
      };
      
      if (body.folder) params.folder = body.folder;
      if (body.publicId) params.public_id = sanitizePublicId(body.publicId);

      // Create signature string
      const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
      
      const signatureString = sortedParams + apiSecret;
      
      // Generate SHA-1 signature
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureString);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('Generated upload signature for folder:', body.folder);

      return new Response(
        JSON.stringify({
          signature,
          timestamp,
          apiKey,
          cloudName,
          ...params
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'upload') {
      const body: UploadRequest = await req.json();
      
      if (!body.file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const timestamp = Math.round(Date.now() / 1000);
      const resourceType = body.resourceType || 'auto';
      
      // Build transformation string for eager transformations
      const eagerTransforms: string[] = [];
      
      if (body.removeBackground) {
        eagerTransforms.push('e_background_removal');
      }
      
      if (body.autoCrop) {
        const width = body.cropWidth || 400;
        const height = body.cropHeight || 400;
        const gravity = body.cropGravity || 'face';
        eagerTransforms.push(`c_thumb,g_${gravity},w_${width},h_${height}`);
      }
      
      // Build upload parameters
      const uploadParams: Record<string, string> = {
        timestamp: timestamp.toString(),
      };
      
      if (body.folder) uploadParams.folder = body.folder;
      const sanitizedPublicId = body.publicId ? sanitizePublicId(body.publicId) : undefined;
      if (sanitizedPublicId) uploadParams.public_id = sanitizedPublicId;
      
      // Add eager transformations if any
      if (eagerTransforms.length > 0) {
        uploadParams.eager = eagerTransforms.join('|');
        uploadParams.eager_async = 'true';
      }

      // Create signature
      const sortedParams = Object.keys(uploadParams)
        .sort()
        .map(key => `${key}=${uploadParams[key]}`)
        .join('&');
      
      const signatureString = sortedParams + apiSecret;
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureString);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', body.file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      
      if (body.folder) formData.append('folder', body.folder);
      if (sanitizedPublicId) formData.append('public_id', sanitizedPublicId);
      
      // Add eager transformations to form data
      if (eagerTransforms.length > 0) {
        formData.append('eager', eagerTransforms.join('|'));
        formData.append('eager_async', 'true');
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
      
      console.log('Uploading to Cloudinary:', { folder: body.folder, resourceType, eagerTransforms });
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await uploadResponse.json();

      if (!uploadResponse.ok) {
        console.error('Cloudinary upload error:', result);
        return new Response(
          JSON.stringify({ error: result.error?.message || 'Upload failed' }),
          { status: uploadResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Upload successful:', result.public_id);

      return new Response(
        JSON.stringify({
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          resourceType: result.resource_type,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'delete') {
      const body: DeleteRequest = await req.json();
      
      if (!body.publicId) {
        return new Response(
          JSON.stringify({ error: 'No publicId provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const timestamp = Math.round(Date.now() / 1000);
      const resourceType = body.resourceType || 'image';

      // Create signature for deletion
      const signatureString = `public_id=${body.publicId}&timestamp=${timestamp}${apiSecret}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureString);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const deleteUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`;
      
      const formData = new FormData();
      formData.append('public_id', body.publicId);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);

      console.log('Deleting from Cloudinary:', body.publicId);

      const deleteResponse = await fetch(deleteUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await deleteResponse.json();

      if (result.result !== 'ok') {
        console.error('Cloudinary delete error:', result);
        return new Response(
          JSON.stringify({ error: 'Delete failed', details: result }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Delete successful:', body.publicId);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'transform') {
      // Generate transformed URL for existing image
      const body: TransformRequest = await req.json();
      
      if (!body.publicId) {
        return new Response(
          JSON.stringify({ error: 'No publicId provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const transforms: string[] = [];
      
      if (body.removeBackground) {
        transforms.push('e_background_removal');
      }
      
      if (body.autoCrop) {
        const width = body.cropWidth || 400;
        const height = body.cropHeight || 400;
        const gravity = body.cropGravity || 'face';
        transforms.push(`c_thumb,g_${gravity},w_${width},h_${height}`);
      }
      
      // Build the transformed URL
      const transformString = transforms.join('/');
      const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
      const transformedUrl = transformString 
        ? `${baseUrl}/${transformString}/${body.publicId}`
        : `${baseUrl}/${body.publicId}`;
      
      console.log('Generated transformed URL:', transformedUrl);

      return new Response(
        JSON.stringify({ 
          url: transformedUrl,
          publicId: body.publicId,
          transformations: transforms
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: upload, delete, signature, or transform' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Edge function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
