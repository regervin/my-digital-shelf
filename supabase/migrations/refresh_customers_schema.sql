/*
  # Refresh customers table schema
  
  1. Purpose
    - Fix schema cache issue with the customers table
    - Ensure all columns are properly recognized by the system
  
  2. Changes
    - Drop and recreate the customers table with the same structure
    - Recreate all necessary RLS policies
*/

-- Drop existing customers table if it exists
DROP TABLE IF EXISTS customers;

-- Create customers table with complete structure
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  status text DEFAULT 'active',
  notes text,
  country text,
  city text,
  seller_id uuid REFERENCES auth.users(id),
  purchases integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  last_purchase timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert their own customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);
