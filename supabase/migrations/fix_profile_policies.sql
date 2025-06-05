/*
  # Fix profile policies

  1. Changes
    - Add conditional checks before creating policies to prevent errors when policies already exist
    - Ensures idempotent execution of the migration script
  
  2. Security
    - Maintains the same RLS policies for the profiles table
    - No changes to security model, just fixes the script execution
*/

-- Check if policies exist before creating them
DO $$ 
BEGIN
  -- Check and create "Users can view their own profile" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Check and create "Users can update their own profile" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Check and create "Service role can read all profiles" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Service role can read all profiles'
  ) THEN
    CREATE POLICY "Service role can read all profiles"
      ON profiles
      FOR SELECT
      TO service_role
      USING (true);
  END IF;
END $$;