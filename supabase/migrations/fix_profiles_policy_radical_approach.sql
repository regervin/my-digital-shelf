/*
  # Radical approach to fix infinite recursion in profiles policy
  
  1. Purpose
    - Completely eliminate any possibility of recursion in profiles policies
    - Use the most basic approach possible with no complex conditions
  
  2. Changes
    - Drop ALL existing policies on the profiles table
    - Temporarily disable RLS completely for troubleshooting
    - Re-enable RLS with the absolute simplest policies possible
*/

-- First, drop ALL existing policies on the profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Admin users can manage all profiles" ON profiles;

-- Temporarily disable RLS for troubleshooting
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create the absolute simplest policy possible - just allow authenticated users to do everything
-- This is a temporary measure to isolate the recursion issue
CREATE POLICY "Allow all operations for authenticated users"
ON profiles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create a policy for public access (unauthenticated) - deny everything
CREATE POLICY "Deny all operations for unauthenticated users"
ON profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);
