/*
  # Create access_records table
  
  1. New Tables
    - `access_records`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references customers)
      - `product_id` (uuid, references products, nullable)
      - `membership_id` (uuid, references memberships, nullable)
      - `access_type` (text, not null) - e.g., 'download', 'view', 'stream'
      - `ip_address` (text)
      - `user_agent` (text)
      - `access_date` (timestamptz, not null)
      - `download_path` (text) - for product downloads
      - `content_identifier` (text) - specific content piece within membership
      - `access_status` (text, not null) - e.g., 'success', 'failed', 'expired'
      - `seller_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `access_records` table
    - Add policies for authenticated users to manage their own access records
*/

CREATE TABLE IF NOT EXISTS access_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  membership_id uuid REFERENCES memberships(id) ON DELETE SET NULL,
  access_type text NOT NULL,
  ip_address text,
  user_agent text,
  access_date timestamptz NOT NULL DEFAULT now(),
  download_path text,
  content_identifier text,
  access_status text NOT NULL DEFAULT 'success',
  seller_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Constraint: Either product_id OR membership_id must be set, but not both
  CONSTRAINT product_or_membership_check CHECK (
    (product_id IS NOT NULL AND membership_id IS NULL) OR
    (product_id IS NULL AND membership_id IS NOT NULL)
  )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_access_records_customer_id ON access_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_access_records_product_id ON access_records(product_id);
CREATE INDEX IF NOT EXISTS idx_access_records_membership_id ON access_records(membership_id);
CREATE INDEX IF NOT EXISTS idx_access_records_seller_id ON access_records(seller_id);
CREATE INDEX IF NOT EXISTS idx_access_records_access_date ON access_records(access_date);
CREATE INDEX IF NOT EXISTS idx_access_records_access_type ON access_records(access_type);
CREATE INDEX IF NOT EXISTS idx_access_records_access_status ON access_records(access_status);

ALTER TABLE access_records ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own access records
CREATE POLICY "Users can view their own access records"
  ON access_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

-- Policy for users to insert access records for their own customers/products/memberships
CREATE POLICY "Users can insert their own access records"
  ON access_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

-- Policy for users to update their own access records
CREATE POLICY "Users can update their own access records"
  ON access_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Policy for users to delete their own access records
CREATE POLICY "Users can delete their own access records"
  ON access_records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);
