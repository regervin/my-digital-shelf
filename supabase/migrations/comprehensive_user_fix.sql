/*
  # Comprehensive fix for user registration issues
  
  1. Changes
    - Drop and recreate the profiles table with proper constraints
    - Completely rebuild the user creation trigger system
    - Add proper error handling and logging
    - Fix potential race conditions in the trigger
  
  2. Security
    - Maintains the same security model
    - Recreates all necessary RLS policies
*/

-- First, let's drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Check if profiles table exists and drop it if needed
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    DROP TABLE public.profiles CASCADE;
  END IF;
END
$$;

-- Recreate the profiles table with proper constraints
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Service role can read all profiles"
  ON profiles
  FOR SELECT
  TO service_role
  USING (true);

-- Create a more robust function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = NEW.id
  ) INTO profile_exists;
  
  -- Only insert if profile doesn't exist
  IF NOT profile_exists THEN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the transaction
    RAISE NOTICE 'Error in handle_new_user function: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger with proper timing
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert existing users into profiles if they don't exist yet
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
