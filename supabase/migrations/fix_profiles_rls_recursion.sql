/*
  # Fix profiles table RLS infinite recursion
  
  1. Problem
    - RLS policies are causing infinite recursion when updating profiles
    - This happens when policies reference the same table they're protecting
  
  2. Solution
    - Drop all existing policies on profiles table
    - Create simple, non-recursive policies using only auth.uid()
    - Avoid any references to the profiles table within the policies
  
  3. Security
    - Users can only access their own profile data
    - No admin policies to avoid complexity and recursion
*/

-- Drop ALL existing policies on the profiles table
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin read access" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- These policies only use auth.uid() and never reference the profiles table

-- Allow users to read their own profile
CREATE POLICY "profile_select_own" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "profile_insert_own" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profile_update_own" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile (optional)
CREATE POLICY "profile_delete_own" ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
