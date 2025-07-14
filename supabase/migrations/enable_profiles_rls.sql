/*
  # Enable RLS on profiles table
  
  1. Purpose
    - Enable Row Level Security on the profiles table
    - Ensure all existing policies work as intended
    - Fix security vulnerability where profiles table is publicly accessible
  
  2. Changes
    - Enable RLS on the profiles table
    - Verify existing policies remain intact
*/

-- Enable Row Level Security on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verify existing policies (no changes needed to policies)
-- This is just a comment to document that we're keeping the existing policies:
-- "Admins can read all profiles"
-- "Admins can update all profiles"
-- "Service role can read all profiles"
-- "Users can read own profile"
-- "Users can update their own profile"
-- "Users can view their own profile"
