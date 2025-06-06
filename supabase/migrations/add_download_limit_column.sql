/*
  # Add download_limit column to products table

  1. Schema Changes
    - Add `download_limit` column to the products table if it doesn't exist
  2. Details
    - Set default value to 3
    - Make it an integer type
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'download_limit'
  ) THEN
    ALTER TABLE products ADD COLUMN download_limit integer DEFAULT 3;
  END IF;
END $$;