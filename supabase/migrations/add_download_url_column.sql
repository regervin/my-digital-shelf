/*
  # Add download_url column to products table

  1. Schema Changes
    - Add `download_url` column to the products table if it doesn't exist
  2. Details
    - Text type to store URLs
    - Can be NULL (optional field)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'download_url'
  ) THEN
    ALTER TABLE products ADD COLUMN download_url text;
  END IF;
END $$;
