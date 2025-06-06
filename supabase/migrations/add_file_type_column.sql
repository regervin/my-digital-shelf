/*
  # Add file_type column to products table

  1. Schema Changes
    - Add `file_type` column to the products table if it doesn't exist
  2. Details
    - Text type to store file type information (e.g., "PDF", "ZIP", "MP4")
    - Can be NULL (optional field)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE products ADD COLUMN file_type text;
  END IF;
END $$;