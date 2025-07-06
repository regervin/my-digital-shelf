/*
  # Fix payment settings policies

  1. Security Updates
    - Drop and recreate policies for payment_settings table to ensure proper access control
    - Ensure authenticated users can only access their own payment settings
*/

-- First, check if the table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_settings') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can read their own payment settings" ON payment_settings;
    DROP POLICY IF EXISTS "Users can insert their own payment settings" ON payment_settings;
    DROP POLICY IF EXISTS "Users can update their own payment settings" ON payment_settings;
    
    -- Recreate policies with proper conditions
    CREATE POLICY "Users can read their own payment settings"
      ON payment_settings
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own payment settings"
      ON payment_settings
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own payment settings"
      ON payment_settings
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;