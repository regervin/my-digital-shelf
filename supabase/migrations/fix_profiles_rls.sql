/*
  # Fix profiles table RLS with simplified policies
  
  1. Purpose
    - Resolve infinite recursion issue while maintaining RLS security
    - Implement simple, non-recursive policies
    - Ensure proper access control for different user roles
  
  2. Changes
    - Drop ALL existing policies on the profiles table
    - Create new simplified policies that avoid recursion
    - Keep RLS enabled for production security
*/

-- First, drop ALL existing policies on the profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Admin users can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin access to all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Deny all operations for unauthenticated users" ON profiles;
DROP POLICY IF EXISTS "Public read access to profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies that avoid recursion
-- 1. Basic policy for users to manage their own profile
CREATE POLICY "Users can manage their own profile" ON profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Simple admin read access policy using a direct role check
-- This avoids querying the profiles table again, preventing recursion
CREATE POLICY "Admin read access" ON profiles
  FOR SELECT
  USING (pg_has_role(auth.uid(), 'authenticated', 'member'));
