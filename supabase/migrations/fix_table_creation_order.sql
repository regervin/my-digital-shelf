/*
  # Fix table creation order

  1. Changes
    - Reorder table creation to ensure dependencies exist before they are referenced
    - Create tables in the correct order: products, memberships, customers, then sales
  2. Notes
    - This migration ensures all tables are created in the proper sequence
    - Foreign key constraints will now work correctly
*/

-- First, create the products table if it doesn't exist
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
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own products'
  ) THEN
    CREATE POLICY "Users can view their own products"
      ON products
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy for users to insert their own products
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can insert their own products'
  ) THEN
    CREATE POLICY "Users can insert their own products"
      ON products
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy for users to update their own products
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can update their own products'
  ) THEN
    CREATE POLICY "Users can update their own products"
      ON products
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy for users to delete their own products
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can delete their own products'
  ) THEN
    CREATE POLICY "Users can delete their own products"
      ON products
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Second, create the memberships table
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
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own memberships'
  ) THEN
    CREATE POLICY "Users can view their own memberships"
      ON memberships
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy for users to insert their own memberships
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can insert their own memberships'
  ) THEN
    CREATE POLICY "Users can insert their own memberships"
      ON memberships
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy for users to update their own memberships
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can update their own memberships'
  ) THEN
    CREATE POLICY "Users can update their own memberships"
      ON memberships
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy for users to delete their own memberships
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can delete their own memberships'
  ) THEN
    CREATE POLICY "Users can delete their own memberships"
      ON memberships
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Third, create the customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  total_spent numeric DEFAULT 0,
  purchases integer DEFAULT 0,
  status text DEFAULT 'active',
  seller_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own customers
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own customers'
  ) THEN
    CREATE POLICY "Users can view their own customers"
      ON customers
      FOR SELECT
      TO authenticated
      USING (auth.uid() = seller_id);
  END IF;
END $$;

-- Policy for users to insert their own customers
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can insert their own customers'
  ) THEN
    CREATE POLICY "Users can insert their own customers"
      ON customers
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = seller_id);
  END IF;
END $$;

-- Policy for users to update their own customers
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can update their own customers'
  ) THEN
    CREATE POLICY "Users can update their own customers"
      ON customers
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = seller_id);
  END IF;
END $$;

-- Policy for users to delete their own customers
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can delete their own customers'
  ) THEN
    CREATE POLICY "Users can delete their own customers"
      ON customers
      FOR DELETE
      TO authenticated
      USING (auth.uid() = seller_id);
  END IF;
END $$;

-- Finally, create the sales table (which depends on all previous tables)
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
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own sales'
  ) THEN
    CREATE POLICY "Users can view their own sales"
      ON sales
      FOR SELECT
      TO authenticated
      USING (auth.uid() = seller_id);
  END IF;
END $$;

-- Policy for users to insert their own sales
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can insert their own sales'
  ) THEN
    CREATE POLICY "Users can insert their own sales"
      ON sales
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = seller_id);
  END IF;
END $$;

-- Policy for users to update their own sales
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can update their own sales'
  ) THEN
    CREATE POLICY "Users can update their own sales"
      ON sales
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = seller_id);
  END IF;
END $$;

-- Policy for users to delete their own sales
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can delete their own sales'
  ) THEN
    CREATE POLICY "Users can delete their own sales"
      ON sales
      FOR DELETE
      TO authenticated
      USING (auth.uid() = seller_id);
  END IF;
END $$;