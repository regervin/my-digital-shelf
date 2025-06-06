/*
  # Add status column to products table

  1. Schema Changes
    - Add `status` column to the products table if it doesn't exist
  2. Details
    - Text type to store product status (e.g., "draft", "active")
    - NOT NULL constraint with default value "draft"
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'status'
  ) THEN
    ALTER TABLE products ADD COLUMN status text NOT NULL DEFAULT 'draft';
  END IF;
END $$;