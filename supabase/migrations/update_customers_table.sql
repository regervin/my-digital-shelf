/*
  # Update customers table with additional fields

  1. Changes
    - Add `notes` column to store customer notes
    - Add `country` column to store customer country
    - Add `city` column to store customer city
    - Add `last_purchase` column to store date of last purchase
  
  2. Purpose
    - Enhance customer data with additional information
    - Allow for better customer management and segmentation
*/

DO $$
BEGIN
  -- Add notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'notes'
  ) THEN
    ALTER TABLE customers ADD COLUMN notes text;
  END IF;

  -- Add country column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'country'
  ) THEN
    ALTER TABLE customers ADD COLUMN country text;
  END IF;

  -- Add city column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'city'
  ) THEN
    ALTER TABLE customers ADD COLUMN city text;
  END IF;

  -- Add last_purchase column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'last_purchase'
  ) THEN
    ALTER TABLE customers ADD COLUMN last_purchase timestamptz;
  END IF;
END $$;
