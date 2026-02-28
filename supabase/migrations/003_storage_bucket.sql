-- Tag: core
-- Path: supabase/migrations_merged/003_storage_bucket.sql

-- ============================================================
-- MatDam — Supabase Storage Bucket for Recipe Images
-- Merged from original: 004
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recipe-images',
  'recipe-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "recipe_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recipe-images');

-- Authenticated users can upload
CREATE POLICY "recipe_images_insert_authenticated"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'recipe-images' AND auth.uid() IS NOT NULL);

-- Users can update their own uploads
CREATE POLICY "recipe_images_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'recipe-images' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'recipe-images' AND auth.uid() = owner);

-- Users can delete their own uploads
CREATE POLICY "recipe_images_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'recipe-images' AND auth.uid() = owner);
