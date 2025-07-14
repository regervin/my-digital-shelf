/*
  # Simplified fix for profiles table policies
  
  1. Purpose
    - Completely resolve the infinite recursion issue in profiles policies
    - Implement simple, non-recursive policies without admin_users table
  
  2. Changes
    - Drop ALL existing policies on the profiles table
    - Create new simplified policies that avoid any recursion
    - Use direct auth.uid() checks without self-referential queries
    - Remove dependency on admin_users table
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

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow public read access to profiles
CREATE POLICY "Public read access to profiles"
ON profiles
FOR SELECT
TO anon
USING (true);
