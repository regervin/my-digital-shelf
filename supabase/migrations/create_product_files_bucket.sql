/*
  # Create product_files storage bucket

  1. Storage
    - Create a new storage bucket for product files
    - Set up RLS policies for the bucket
  2. Security
    - Enable RLS on the bucket
    - Add policies for authenticated users to manage their own files
*/

-- Create a new storage bucket for product files
INSERT INTO storage.buckets (id, name, public)
VALUES ('product_files', 'product_files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
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
