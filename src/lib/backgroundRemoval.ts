const MAX_DIMENSION = 1024;

/**
 * Converts image URL → File
 */
async function urlToFile(imageUrl: string): Promise<File> {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new File([blob], "image.jpg", { type: blob.type });
}

/**
 * Resize image before upload (optional but recommended)
 */
async function resizeImage(file: File): Promise<File> {
  const img = document.createElement("img");
  const url = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  let { width, height } = img;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_DIMENSION) / width);
      width = MAX_DIMENSION;
    } else {
      width = Math.round((width * MAX_DIMENSION) / height);
      height = MAX_DIMENSION;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9)
  );

  URL.revokeObjectURL(url);
  return new File([blob], "resized.jpg", { type: "image/jpeg" });
}

/**
 * MAIN FUNCTION — uses Supabase Edge Function
 */
export async function removeBackground(imageUrl: string): Promise<string> {
  const originalFile = await urlToFile(imageUrl);
  const resizedFile = await resizeImage(originalFile);

  const formData = new FormData();
  formData.append("image", resizedFile);

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_FUNCTION_URL}/remove-bg`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Background removal failed");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
