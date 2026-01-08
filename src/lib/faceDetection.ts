import { pipeline, env } from '@huggingface/transformers';

// Configure transformers to use browser cache
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_DIMENSION = 1024;

// Passport photo sizes at 300 DPI
// India: 35mm x 45mm -> 413 x 531
// US: 2 x 2 inches -> 600 x 600
const INDIA_ASPECT_RATIO = 35 / 45; // 0.777...
const INDIA_OUTPUT = { width: 413, height: 531 } as const;
const US_ASPECT_RATIO = 1; // square
const US_OUTPUT = { width: 600, height: 600 } as const;

let faceDetector: any = null;

export async function initFaceDetector() {
  if (faceDetector) return faceDetector;
  
  try {
    faceDetector = await pipeline(
      'object-detection',
      'Xenova/detr-resnet-50',
      { device: 'webgpu' }
    );
    return faceDetector;
  } catch (error) {
    console.error('Failed to initialize face detector with WebGPU, trying WASM:', error);
    faceDetector = await pipeline(
      'object-detection',
      'Xenova/detr-resnet-50'
    );
    return faceDetector;
  }
}

type CropRegion = 'IN' | 'US';

export async function detectAndCropFace(imageUrl: string, region: CropRegion = 'IN'): Promise<{
  croppedImageUrl: string;
  coordinates: { x: number; y: number; width: number; height: number };
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = async () => {
      try {
        // Prepare a downscaled canvas ONLY for detection; cropping will use original pixels
        const detectCanvas = document.createElement('canvas');
        const detectCtx = detectCanvas.getContext('2d')!;
        
        const origWidth = img.width;
        const origHeight = img.height;
        let detWidth = origWidth;
        let detHeight = origHeight;
        let scale = 1;
        
        if (detWidth > MAX_DIMENSION || detHeight > MAX_DIMENSION) {
          if (detWidth > detHeight) {
            scale = MAX_DIMENSION / detWidth;
            detHeight = Math.round(detHeight * scale);
            detWidth = MAX_DIMENSION;
          } else {
            scale = MAX_DIMENSION / detHeight;
            detWidth = Math.round(detWidth * scale);
            detHeight = MAX_DIMENSION;
          }
        }
        
        detectCanvas.width = detWidth;
        detectCanvas.height = detHeight;
        detectCtx.drawImage(img, 0, 0, detWidth, detHeight);
        
        let cropX: number, cropY: number, cropWidth: number, cropHeight: number;
        const targetAspect = region === 'US' ? US_ASPECT_RATIO : INDIA_ASPECT_RATIO;
        const targetOutput = region === 'US' ? US_OUTPUT : INDIA_OUTPUT;
        
        // Try to detect face/person using the model
        try {
          const detector = await initFaceDetector();
          const imageData = detectCanvas.toDataURL('image/jpeg', 0.8);
          const results = await detector(imageData);
          
          // Filter for person detections
          const personResults = results.filter((r: any) => 
            r.label?.toLowerCase().includes('person') && r.score > 0.5
          );
          
          if (personResults.length > 0) {
            const detection = personResults.reduce((prev: any, curr: any) => 
              curr.score > prev.score ? curr : prev
            );
            const box = detection.box;

            // Convert detection box back to original pixel space
            const faceWidth = box.width / scale;
            const faceHeight = box.height / scale;
            const faceCenterX = (box.xmin + box.width / 2) / scale;
            const faceCenterY = (box.ymin + box.height / 2) / scale;

            // Determine desired crop so that face height is ~75% of crop height for India
            // For US, just center face within a square crop around the face
            if (region === 'IN') {
              const desiredHeadRatioMin = 32 / 45; // 0.711..
              const desiredHeadRatioMax = 36 / 45; // 0.8
              const desiredHeadRatio = 0.75; // target
              let desiredCropHeight = faceHeight / desiredHeadRatio;
              let desiredCropWidth = desiredCropHeight * targetAspect;

              // Center crop on face
              let cx = faceCenterX - desiredCropWidth / 2;
              let cy = faceCenterY - desiredCropHeight / 2;

              // Clamp to image bounds; if out-of-bounds, shrink proportionally
              const clampAndAdjust = () => {
                let adjWidth = desiredCropWidth;
                let adjHeight = desiredCropHeight;
                let adjCx = cx;
                let adjCy = cy;

                if (adjCx < 0) { adjCx = 0; }
                if (adjCy < 0) { adjCy = 0; }
                if (adjCx + adjWidth > origWidth) { adjWidth = origWidth - adjCx; adjHeight = adjWidth / targetAspect; }
                if (adjCy + adjHeight > origHeight) { adjHeight = origHeight - adjCy; adjWidth = adjHeight * targetAspect; }

                return { adjCx, adjCy, adjWidth, adjHeight };
              };

              const { adjCx, adjCy, adjWidth, adjHeight } = clampAndAdjust();

              // Validate head ratio remains in acceptable range after adjustment
              const headRatio = faceHeight / adjHeight;
              if (headRatio < desiredHeadRatioMin || headRatio > desiredHeadRatioMax) {
                throw new Error('Cannot satisfy head height requirement');
              }

              cropX = adjCx; cropY = adjCy; cropWidth = adjWidth; cropHeight = adjHeight;
            } else {
              // US: square crop. Make crop such that face fits comfortably in the square
              // Choose crop size as max of width needed to cover face with some margin
              const margin = 0.4; // 40% margin around face height
              let side = Math.max(faceWidth, faceHeight * (1 + margin));
              // Center
              let cx = faceCenterX - side / 2;
              let cy = faceCenterY - side / 2;
              // Clamp to image bounds
              if (cx < 0) cx = 0;
              if (cy < 0) cy = 0;
              if (cx + side > origWidth) side = origWidth - cx;
              if (cy + side > origHeight) side = origHeight - cy;

              cropX = cx; cropY = cy; cropWidth = side; cropHeight = side;
            }
          } else {
            throw new Error('No person detected');
          }
        } catch (modelError) {
          console.warn('Model detection failed, using center crop:', modelError);
          
          // Fallback: Center crop with target aspect ratio from original image
          if (origWidth / origHeight > targetAspect) {
            // Image is wider - base on height
            cropHeight = origHeight * 0.9;
            cropWidth = cropHeight * targetAspect;
          } else {
            // Image is taller - base on width
            cropWidth = origWidth * 0.9;
            cropHeight = cropWidth / targetAspect;
          }
          cropX = (origWidth - cropWidth) / 2;
          cropY = (origHeight - cropHeight) / 2;
        }
        
        // Create output canvas exactly target dimensions with NO background fill
        const cropCanvas = document.createElement('canvas');
        const cropCtx = cropCanvas.getContext('2d')!;
        cropCanvas.width = targetOutput.width;
        cropCanvas.height = targetOutput.height;
        
        // Draw cropped and scaled image from ORIGINAL image pixels
        cropCtx.drawImage(
          img,
          Math.round(cropX), Math.round(cropY), Math.round(cropWidth), Math.round(cropHeight),
          0, 0, targetOutput.width, targetOutput.height
        );
        
        resolve({
          croppedImageUrl: cropCanvas.toDataURL('image/png', 1.0),
          coordinates: {
            // Return coordinates in ORIGINAL pixel space
            x: cropX,
            y: cropY,
            width: cropWidth,
            height: cropHeight
          }
        });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}
