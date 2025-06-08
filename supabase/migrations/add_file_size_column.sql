/*
  # Add file_size column to products table

  1. Schema Changes
    - Add `file_size` column to the products table if it doesn't exist
  2. Details
    - Text type to store file size information (e.g., "2.5 MB")
    - Can be NULL (optional field)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE products ADD COLUMN file_size text;
  END IF;
END $$;
