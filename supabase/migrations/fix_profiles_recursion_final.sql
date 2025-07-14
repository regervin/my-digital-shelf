/*
  # Final fix for profiles table recursion
  
  1. Purpose
    - Completely eliminate the infinite recursion issue in profiles policies
    - Create minimal policies with no self-references
  
  2. Changes
    - Drop ALL existing policies on the profiles table
    - Disable and re-enable RLS to ensure clean state
    - Create extremely simple policies with no possibility of recursion
    - Avoid any complex conditions that might cause circular references
*/

-- First, drop ALL existing policies on the profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Admin users can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin access to all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Deny all operations for unauthenticated users" ON profiles;
DROP POLICY IF EXISTS "Public read access to profiles" ON profiles;

-- Disable and re-enable RLS to ensure clean state
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create extremely simple policies with no possibility of recursion

-- Allow authenticated users to see all profiles (read-only)
CREATE POLICY "Anyone can view profiles"
ON profiles
FOR SELECT
TO authenticated, anon
USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert only their own profile
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to delete only their own profile
CREATE POLICY "Users can delete own profile"
ON profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);
