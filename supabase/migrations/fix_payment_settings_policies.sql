/*
  # Fix payment settings policies

  1. Changes
    - Check for existence of policies before creating them
    - Safely create policies only if they don't already exist
  2. Security
    - Maintains RLS on payment_settings table
    - Ensures proper policies exist without causing errors
*/

-- First, check if the table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  paypal_email text,
  stripe_connected boolean DEFAULT false,
  payout_schedule text DEFAULT 'instant',
  minimum_payout_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Safely create policies only if they don't exist
DO $$ 
BEGIN
  -- Check if "Users can read their own payment settings" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payment_settings' 
    AND policyname = 'Users can read their own payment settings'
  ) THEN
    CREATE POLICY "Users can read their own payment settings"
      ON payment_settings
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Check if "Users can update their own payment settings" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payment_settings' 
    AND policyname = 'Users can update their own payment settings'
  ) THEN
    CREATE POLICY "Users can update their own payment settings"
      ON payment_settings
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Check if "Users can insert their own payment settings" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payment_settings' 
    AND policyname = 'Users can insert their own payment settings'
  ) THEN
    CREATE POLICY "Users can insert their own payment settings"
      ON payment_settings
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
