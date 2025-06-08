/*
  # Fix user_id vs seller_id column mismatch
  
  1. Purpose
    - Fix the mismatch between user_id and seller_id columns
    - Ensure proper column naming consistency
  
  2. Changes
    - Check if user_id column exists and handle accordingly
    - Ensure proper constraints and references
*/

DO $$ 
BEGIN
  -- Check if user_id column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'user_id'
  ) THEN
    -- If user_id exists but seller_id doesn't, rename user_id to seller_id
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'customers' AND column_name = 'seller_id'
    ) THEN
      ALTER TABLE customers RENAME COLUMN user_id TO seller_id;
    ELSE
      -- Both columns exist, copy data from user_id to seller_id where seller_id is null
      UPDATE customers SET seller_id = user_id WHERE seller_id IS NULL;
      -- Make user_id nullable to avoid constraint issues
      ALTER TABLE customers ALTER COLUMN user_id DROP NOT NULL;
    END IF;
  END IF;

  -- Ensure seller_id exists and has proper constraints
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'seller_id'
  ) THEN
    -- Make sure seller_id is NOT NULL
    ALTER TABLE customers ALTER COLUMN seller_id SET NOT NULL;
  ELSE
    -- Add seller_id column if it doesn't exist
    ALTER TABLE customers ADD COLUMN seller_id uuid NOT NULL REFERENCES auth.users(id);
  END IF;
END $$;
