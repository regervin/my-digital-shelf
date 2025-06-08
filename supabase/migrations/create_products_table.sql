/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text)
      - `type` (text, required)
      - `price` (numeric, required)
      - `status` (text, required)
      - `download_url` (text)
      - `license_type` (text)
      - `download_limit` (integer)
      - `file_size` (text)
      - `file_type` (text)
      - `total_sales` (integer)
      - `revenue` (numeric)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `products` table
    - Add policies for authenticated users to manage their own products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL,
  price numeric NOT NULL,
  status text NOT NULL,
  download_url text,
  license_type text,
  download_limit integer DEFAULT 3,
  file_size text,
  file_type text,
  total_sales integer DEFAULT 0,
  revenue numeric DEFAULT 0,
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
