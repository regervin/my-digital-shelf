/*
  # Create sales table

  1. New Tables
    - `sales`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `membership_id` (uuid, foreign key to memberships)
      - `customer_id` (uuid, foreign key to customers)
      - `amount` (numeric, not null)
      - `status` (text, not null)
      - `seller_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `sales` table
    - Add policies for authenticated users to manage their own sales
*/

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  membership_id uuid REFERENCES memberships(id),
  customer_id uuid REFERENCES customers(id) NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  seller_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT product_or_membership_required CHECK (
    (product_id IS NOT NULL AND membership_id IS NULL) OR
    (product_id IS NULL AND membership_id IS NOT NULL)
  )
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own sales
CREATE POLICY "Users can view their own sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

-- Policy for users to insert their own sales
CREATE POLICY "Users can insert their own sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

-- Policy for users to update their own sales
CREATE POLICY "Users can update their own sales"
  ON sales
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Policy for users to delete their own sales
CREATE POLICY "Users can delete their own sales"
  ON sales
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);
