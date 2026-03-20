// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/lib/supabase/storage.ts

import imageCompression from "browser-image-compression";
import { createClient } from "./client";

const BUCKET = "recipe-images";
const MAX_SIZE_MB = 0.5;
const MAX_WIDTH = 1280;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

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

  // 경로 순회 방지 + recipeId UUID 검증
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const SAFE_PREFIX_RE = /^[a-z0-9_-]+$/i;
  if ((!UUID_RE.test(recipeId) && !/^temp-\d+$/.test(recipeId)) || !SAFE_PREFIX_RE.test(prefix)) {
    console.error("Invalid path segment:", recipeId, prefix);
    return null;
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH,
    useWebWorker: true,
  });

  const ext = MIME_TO_EXT[file.type] ?? "jpg";
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

const TEMP_PATH_RE = /temp-\d+\//;
const STORAGE_PATH_RE = /\/recipe-images\/(.+)$/;

export async function relocateTempStepImages(
  steps: { image_url: string | null }[],
  recipeId: string
): Promise<{ stepIndex: number; newUrl: string }[]> {
  const supabase = createClient();
  const results: { stepIndex: number; newUrl: string }[] = [];

  for (let i = 0; i < steps.length; i++) {
    const url = steps[i].image_url;
    if (!url || !TEMP_PATH_RE.test(url)) continue;

    const pathMatch = url.match(STORAGE_PATH_RE);
    if (!pathMatch) continue;

    const oldPath = pathMatch[1];
    const fileName = oldPath.split("/").pop()!;
    const newPath = `${recipeId}/${fileName}`;

    const { error: copyError } = await supabase.storage.from(BUCKET).copy(oldPath, newPath);
    if (copyError) {
      console.warn("Step image copy failed:", copyError);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(newPath);

    results.push({ stepIndex: i, newUrl: publicUrl });

    // best-effort delete of old temp file
    await supabase.storage
      .from(BUCKET)
      .remove([oldPath])
      .catch((e) => console.warn("Temp file cleanup failed:", e));
  }

  return results;
}

/**
 * Supabase storage public URL에서 버킷 내부 경로를 추출한다.
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/recipe-images/abc/step.jpg"
 *   → "abc/step.jpg"
 * 매칭 실패 시 null 반환.
 */
export function extractStoragePath(url: string): string | null {
  const match = url.match(STORAGE_PATH_RE);
  return match ? match[1] : null;
}
