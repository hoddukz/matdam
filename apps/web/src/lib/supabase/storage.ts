// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/lib/supabase/storage.ts

import imageCompression from "browser-image-compression";
import { createClient } from "./client";

const BUCKET = "recipe-images";
const MAX_SIZE_MB = 2;
const MAX_WIDTH = 1920;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

export async function uploadRecipeImage(
  file: File,
  recipeId: string,
  prefix: string = "step"
): Promise<string | null> {
  // MIME 타입 검증
  if (!ALLOWED_TYPES.has(file.type)) {
    console.error("Invalid file type:", file.type);
    return null;
  }

  // 경로 순회 방지
  if (/[/\\.]/.test(recipeId) || /[/\\.]/.test(prefix)) {
    console.error("Invalid path segment:", recipeId, prefix);
    return null;
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH,
    useWebWorker: true,
  });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  if (!ALLOWED_EXTS.has(ext)) return null;
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
