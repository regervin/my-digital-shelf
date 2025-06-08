/*
  # Create coupons and discount system

  1. New Tables
    - `coupons`
      - `id` (uuid, primary key)
      - `code` (text, unique, required)
      - `description` (text)
      - `discount_type` (text, required) - 'percentage', 'fixed_amount'
      - `discount_value` (numeric, required)
      - `min_purchase_amount` (numeric)
      - `max_discount_amount` (numeric)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `usage_limit` (integer)
      - `usage_count` (integer)
      - `is_active` (boolean)
      - `applies_to` (text) - 'all', 'products', 'memberships'
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. New Tables
    - `coupon_products`
      - `id` (uuid, primary key)
      - `coupon_id` (uuid, foreign key to coupons)
      - `product_id` (uuid, foreign key to products)
  3. New Tables
    - `coupon_memberships`
      - `id` (uuid, primary key)
      - `coupon_id` (uuid, foreign key to coupons)
      - `membership_id` (uuid, foreign key to memberships)
  4. New Tables
    - `coupon_redemptions`
      - `id` (uuid, primary key)
      - `coupon_id` (uuid, foreign key to coupons)
      - `customer_id` (uuid, foreign key to customers)
      - `order_id` (uuid)
      - `discount_amount` (numeric)
      - `created_at` (timestamptz)
  5. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own coupons
*/

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_purchase_amount numeric,
  max_discount_amount numeric,
  start_date timestamptz,
  end_date timestamptz,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  applies_to text NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'products', 'memberships')),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (
    (start_date IS NULL AND end_date IS NULL) OR
    (start_date IS NULL AND end_date IS NOT NULL) OR
    (start_date IS NOT NULL AND end_date IS NULL) OR
    (start_date < end_date)
  ),
  CONSTRAINT valid_discount_value CHECK (
    (discount_type = 'percentage' AND discount_value <= 100) OR
    (discount_type = 'fixed_amount')
  )
);

-- Create coupon_products junction table
CREATE TABLE IF NOT EXISTS coupon_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(coupon_id, product_id)
);

-- Create coupon_memberships junction table
CREATE TABLE IF NOT EXISTS coupon_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
  membership_id uuid REFERENCES memberships(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(coupon_id, membership_id)
);

-- Create coupon_redemptions table
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  order_id uuid,
  discount_amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Policies for coupons table
CREATE POLICY "Users can view their own coupons"
  ON coupons
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coupons"
  ON coupons
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coupons"
  ON coupons
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coupons"
  ON coupons
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for coupon_products table
CREATE POLICY "Users can view their own coupon products"
  ON coupon_products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coupons
      WHERE coupons.id = coupon_id
      AND coupons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own coupon products"
  ON coupon_products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coupons
      WHERE coupons.id = coupon_id
      AND coupons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own coupon products"
  ON coupon_products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coupons
      WHERE coupons.id = coupon_id
      AND coupons.user_id = auth.uid()
    )
  );

-- Policies for coupon_memberships table
CREATE POLICY "Users can view their own coupon memberships"
  ON coupon_memberships
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coupons
      WHERE coupons.id = coupon_id
      AND coupons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own coupon memberships"
  ON coupon_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coupons
      WHERE coupons.id = coupon_id
      AND coupons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own coupon memberships"
  ON coupon_memberships
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coupons
      WHERE coupons.id = coupon_id
      AND coupons.user_id = auth.uid()
    )
  );

-- Policies for coupon_redemptions table
CREATE POLICY "Users can view their own coupon redemptions"
  ON coupon_redemptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coupons
      WHERE coupons.id = coupon_id
      AND coupons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own coupon redemptions"
  ON coupon_redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coupons
      WHERE coupons.id = coupon_id
      AND coupons.user_id = auth.uid()
    )
  );
