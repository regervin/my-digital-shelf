/*
  # Add role column to profiles table
  
  1. Changes
    - Add `role` column to `profiles` table with default value 'user'
  
  2. Purpose
    - Store user role information for permission management
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
  END IF;
END $$;
