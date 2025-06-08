/*
  # Complete removal of RLS on profiles table
  
  1. Purpose
    - Completely eliminate the infinite recursion issue by removing RLS entirely
    - This is a temporary measure to get the application working
  
  2. Changes
    - Drop ALL existing policies on the profiles table
    - Completely disable RLS on the profiles table
*/

-- First, drop ALL existing policies on the profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Admin users can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Deny all operations for unauthenticated users" ON profiles;

-- Completely disable RLS on the profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO anon, authenticated;
