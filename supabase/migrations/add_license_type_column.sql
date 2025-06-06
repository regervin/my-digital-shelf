/*
  # Add license_type column to products table

  1. Schema Changes
    - Add `license_type` column to the products table if it doesn't exist
  2. Details
    - Text type to store license type information (e.g., "standard", "extended", "unlimited")
    - Can be NULL (optional field)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'license_type'
  ) THEN
    ALTER TABLE products ADD COLUMN license_type text;
  END IF;
END $$;