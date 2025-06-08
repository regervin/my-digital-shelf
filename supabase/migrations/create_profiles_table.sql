/*
  # Create profiles table
  
  1. New Tables
    - `profiles` - Stores user profile information
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text)
      - `company` (text)
      - `website` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `profiles` table
    - Add policy for authenticated users to manage their own profile
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text,
  email text,
  company text,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own profile
CREATE POLICY "Users can manage their own profile"
  ON profiles
  USING (auth.uid() = id);
