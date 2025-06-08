/*
  # Complete reset of profiles policies to fix infinite recursion
  
  1. Purpose
    - Completely resolve the "infinite recursion detected in policy for relation 'profiles'" error
    - Implement a different approach without any circular references
  
  2. Changes
    - Drop ALL existing policies on the profiles table
    - Create new basic policies without any self-references
    - Add role column to profiles if it doesn't exist
    - Create a separate admin_users table to avoid circular references
*/

-- First, drop ALL existing policies on the profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Make sure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
  END IF;
END $$;

-- Create a separate admin_users table to avoid circular references
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create basic policies for profiles without circular references
-- Policy for users to read their own profile (no circular reference)
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy for users to update their own profile (no circular reference)
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy for users to insert their own profile (no circular reference)
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy for admin_users to manage all profiles
CREATE POLICY "Admin users can manage all profiles"
ON profiles
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Policy for admin_users to manage admin_users table
CREATE POLICY "Admin users can manage admin_users"
ON admin_users
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Insert initial admin user if needed (replace with your admin user ID)
-- This is commented out as you'll need to replace with your actual admin user ID
-- INSERT INTO admin_users (id) VALUES ('your-admin-user-id-here')
-- ON CONFLICT (id) DO NOTHING;
