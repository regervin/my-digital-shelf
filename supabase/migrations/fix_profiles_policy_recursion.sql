/*
  # Fix infinite recursion in profiles policy
  
  1. Purpose
    - Resolve the "infinite recursion detected in policy for relation 'profiles'" error
    - Simplify RLS policies to prevent circular references
  
  2. Changes
    - Drop existing problematic policies
    - Create new simplified policies for profiles table
    - Ensure proper authentication checks without recursion
*/

-- First, drop any existing policies on the profiles table that might be causing recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies that avoid recursion
-- Policy for users to read their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy for users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Add a policy for administrators to manage all profiles
CREATE POLICY "Admins can manage all profiles"
ON profiles
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
