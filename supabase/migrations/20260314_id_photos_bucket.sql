-- Create storage bucket for ID photo uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'id-photos',
  'id-photos',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload (public form, no auth required)
CREATE POLICY "Allow public uploads to id-photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'id-photos');

-- Allow public reads (so we can view the photos in admin)
CREATE POLICY "Allow public reads from id-photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'id-photos');
