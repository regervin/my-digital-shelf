/*
  # Fix customers table schema cache
  
  1. Purpose
    - Fix schema cache issue with the customers table
    - Ensure all columns are properly recognized by the system
  
  2. Changes
    - Use a non-destructive approach to refresh the schema cache
    - Verify and ensure all columns exist with proper types
    - Preserve existing data and relationships
*/

-- Refresh the schema cache by altering the table structure without dropping it
DO $$ 
BEGIN
  -- Verify name column exists, if not add it (though it should exist)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'name'
  ) THEN
    ALTER TABLE customers ADD COLUMN name text NOT NULL DEFAULT 'Customer';
  ELSE
    -- Force schema cache refresh by altering the column
    ALTER TABLE customers ALTER COLUMN name TYPE text; -- This is a no-op if already text
    ALTER TABLE customers ALTER COLUMN name SET NOT NULL; -- Ensure NOT NULL constraint
  END IF;

  -- Verify email column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'email'
  ) THEN
    ALTER TABLE customers ADD COLUMN email text NOT NULL DEFAULT 'customer@example.com';
  ELSE
    ALTER TABLE customers ALTER COLUMN email TYPE text;
    ALTER TABLE customers ALTER COLUMN email SET NOT NULL;
  END IF;

  -- Verify phone column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'phone'
  ) THEN
    ALTER TABLE customers ADD COLUMN phone text;
  ELSE
    ALTER TABLE customers ALTER COLUMN phone TYPE text;
  END IF;

  -- Verify status column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'status'
  ) THEN
    ALTER TABLE customers ADD COLUMN status text DEFAULT 'active';
  ELSE
    ALTER TABLE customers ALTER COLUMN status TYPE text;
    ALTER TABLE customers ALTER COLUMN status SET DEFAULT 'active';
  END IF;

  -- Verify notes column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'notes'
  ) THEN
    ALTER TABLE customers ADD COLUMN notes text;
  ELSE
    ALTER TABLE customers ALTER COLUMN notes TYPE text;
  END IF;

  -- Verify country column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'country'
  ) THEN
    ALTER TABLE customers ADD COLUMN country text;
  ELSE
    ALTER TABLE customers ALTER COLUMN country TYPE text;
  END IF;

  -- Verify city column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'city'
  ) THEN
    ALTER TABLE customers ADD COLUMN city text;
  ELSE
    ALTER TABLE customers ALTER COLUMN city TYPE text;
  END IF;

  -- Verify seller_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'seller_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN seller_id uuid REFERENCES auth.users(id);
  END IF;

  -- Verify purchases column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'purchases'
  ) THEN
    ALTER TABLE customers ADD COLUMN purchases integer DEFAULT 0;
  ELSE
    ALTER TABLE customers ALTER COLUMN purchases TYPE integer;
    ALTER TABLE customers ALTER COLUMN purchases SET DEFAULT 0;
  END IF;

  -- Verify total_spent column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'total_spent'
  ) THEN
    ALTER TABLE customers ADD COLUMN total_spent numeric DEFAULT 0;
  ELSE
    ALTER TABLE customers ALTER COLUMN total_spent TYPE numeric;
    ALTER TABLE customers ALTER COLUMN total_spent SET DEFAULT 0;
  END IF;

  -- Verify last_purchase column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'last_purchase'
  ) THEN
    ALTER TABLE customers ADD COLUMN last_purchase timestamptz;
  ELSE
    ALTER TABLE customers ALTER COLUMN last_purchase TYPE timestamptz;
  END IF;

  -- Verify created_at column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE customers ADD COLUMN created_at timestamptz DEFAULT now();
  ELSE
    ALTER TABLE customers ALTER COLUMN created_at TYPE timestamptz;
    ALTER TABLE customers ALTER COLUMN created_at SET DEFAULT now();
  END IF;

  -- Ensure RLS is enabled
  ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
END $$;

-- Recreate policies if they don't exist
DO $$ 
BEGIN
  -- Check and create "Users can view their own customers" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'customers' AND policyname = 'Users can view their own customers'
  ) THEN
    CREATE POLICY "Users can view their own customers"
      ON customers
      FOR SELECT
      TO authenticated
      USING (auth.uid() = seller_id);
  END IF;

  -- Check and create "Users can insert their own customers" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'customers' AND policyname = 'Users can insert their own customers'
  ) THEN
    CREATE POLICY "Users can insert their own customers"
      ON customers
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = seller_id);
  END IF;

  -- Check and create "Users can update their own customers" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'customers' AND policyname = 'Users can update their own customers'
  ) THEN
    CREATE POLICY "Users can update their own customers"
      ON customers
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = seller_id)
      WITH CHECK (auth.uid() = seller_id);
  END IF;

  -- Check and create "Users can delete their own customers" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'customers' AND policyname = 'Users can delete their own customers'
  ) THEN
    CREATE POLICY "Users can delete their own customers"
      ON customers
      FOR DELETE
      TO authenticated
      USING (auth.uid() = seller_id);
  END IF;
END $$;

-- Force schema cache refresh with a vacuum analyze
ANALYZE customers;
