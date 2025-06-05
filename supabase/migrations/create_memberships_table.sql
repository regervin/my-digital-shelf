/*
  # Create memberships table

  1. New Tables
    - `memberships`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `price` (numeric, not null)
      - `billing_cycle` (text, not null)
      - `status` (text, not null)
      - `trial_days` (integer)
      - `access_type` (text)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `memberships` table
    - Add policies for authenticated users to manage their own memberships
*/

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  billing_cycle text NOT NULL,
  status text NOT NULL,
  trial_days integer DEFAULT 0,
  access_type text,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own memberships
CREATE POLICY "Users can view their own memberships"
  ON memberships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own memberships
CREATE POLICY "Users can insert their own memberships"
  ON memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own memberships
CREATE POLICY "Users can update their own memberships"
  ON memberships
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to delete their own memberships
CREATE POLICY "Users can delete their own memberships"
  ON memberships
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
