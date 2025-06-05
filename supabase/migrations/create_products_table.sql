/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `price` (numeric, not null)
      - `type` (text, not null)
      - `status` (text, not null)
      - `download_url` (text)
      - `license_type` (text)
      - `download_limit` (integer)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `products` table
    - Add policies for authenticated users to manage their own products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  type text NOT NULL,
  status text NOT NULL,
  download_url text,
  license_type text,
  download_limit integer DEFAULT 3,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own products
CREATE POLICY "Users can view their own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own products
CREATE POLICY "Users can insert their own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own products
CREATE POLICY "Users can update their own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to delete their own products
CREATE POLICY "Users can delete their own products"
  ON products
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
