/*
  # Fix profiles table schema

  1. Purpose
    - Add missing 'company' column to profiles table
    - Refresh schema cache to resolve the "column not found" error
  
  2. Changes
    - Safely add 'company' column if it doesn't exist
    - Ensure all required columns are present
*/

-- Safely add company column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'company'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company text;
  END IF;
  
  -- Ensure other columns exist as well
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE profiles ADD COLUMN website text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;
