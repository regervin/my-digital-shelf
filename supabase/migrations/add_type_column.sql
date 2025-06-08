/*
  # Add type column to products table

  1. Schema Changes
    - Add `type` column to the products table if it doesn't exist
  2. Details
    - Text type to store product type (e.g., "ebook", "course", "software")
    - NOT NULL constraint with default value "ebook"
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'type'
  ) THEN
    ALTER TABLE products ADD COLUMN type text NOT NULL DEFAULT 'ebook';
  END IF;
END $$;
