/*
  # Create membership_products junction table

  1. New Tables
    - `membership_products`
      - `id` (uuid, primary key)
      - `membership_id` (uuid, foreign key to memberships)
      - `product_id` (uuid, foreign key to products)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `membership_products` table
    - Add policies for authenticated users to manage their own membership products
*/

CREATE TABLE IF NOT EXISTS membership_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid REFERENCES memberships(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(membership_id, product_id)
);

ALTER TABLE membership_products ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own membership products
CREATE POLICY "Users can view their own membership products"
  ON membership_products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.id = membership_products.membership_id
      AND memberships.user_id = auth.uid()
    )
  );

-- Policy for users to insert their own membership products
CREATE POLICY "Users can insert their own membership products"
  ON membership_products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.id = membership_products.membership_id
      AND memberships.user_id = auth.uid()
    )
  );

-- Policy for users to delete their own membership products
CREATE POLICY "Users can delete their own membership products"
  ON membership_products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.id = membership_products.membership_id
      AND memberships.user_id = auth.uid()
    )
  );