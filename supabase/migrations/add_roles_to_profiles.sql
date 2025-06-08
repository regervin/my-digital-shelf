/*
  # Add roles to profiles table
  
  1. Changes
    - Add `role` column to `profiles` table with default value 'user'
    - Valid roles: 'admin', 'seller', 'user'
  
  2. Security
    - Update RLS policies to consider roles for certain operations
*/

-- Add role column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'user';
    
    -- Add check constraint to ensure valid roles
    ALTER TABLE profiles ADD CONSTRAINT valid_role CHECK (role IN ('admin', 'seller', 'user'));
  END IF;
END $$;

-- Create policy for admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- Create policy for admins to update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));
