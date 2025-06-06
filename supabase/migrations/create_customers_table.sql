/*
  # Create customers table

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, not null, unique)
      - `phone` (text)
      - `notes` (text)
      - `seller_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `customers` table
    - Add policies for authenticated users to manage their own customers
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  notes text,
  seller_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(email, seller_id)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own customers
CREATE POLICY "Users can view their own customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

-- Policy for users to insert their own customers
CREATE POLICY "Users can insert their own customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

-- Policy for users to update their own customers
CREATE POLICY "Users can update their own customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Policy for users to delete their own customers
CREATE POLICY "Users can delete their own customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);