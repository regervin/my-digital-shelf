/*
  # Fix product_files storage bucket policies

  1. Security Updates
    - Update RLS policies for product_files bucket
    - Ensure proper access control for file uploads and downloads
  2. Changes
    - Drop existing policies and recreate them with proper conditions
    - Add explicit public access policy for downloads
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own product files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can download product files" ON storage.objects;

-- Recreate policies with proper conditions
CREATE POLICY "Users can upload their own product files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product_files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own product files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product_files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own product files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product_files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can download product files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product_files');
