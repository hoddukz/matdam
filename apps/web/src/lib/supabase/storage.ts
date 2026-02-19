// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/lib/supabase/storage.ts

import imageCompression from "browser-image-compression";
import { createClient } from "./client";

const BUCKET = "recipe-images";
const MAX_SIZE_MB = 2;
const MAX_WIDTH = 1920;

export async function uploadRecipeImage(
  file: File,
  recipeId: string,
  prefix: string = "step"
): Promise<string | null> {
  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH,
    useWebWorker: true,
  });

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${recipeId}/${prefix}_${Date.now()}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(fileName, compressed, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  return publicUrl;
}
