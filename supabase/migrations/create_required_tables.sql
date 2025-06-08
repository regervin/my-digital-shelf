/*
  # Create required tables for digital product delivery platform
  
  1. Tables
    - products: Digital products that users can sell
    - customers: People who purchase products
    - memberships: Relationship between customers and products
    - files: Files associated with products
    - payment_settings: User payment preferences
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) DEFAULT 0,
  status text DEFAULT 'draft',
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Memberships table (connects customers to products)
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  customer_id uuid REFERENCES customers(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  status text DEFAULT 'active',
  amount numeric(10,2) DEFAULT 0,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  name text NOT NULL,
  size bigint,
  type text,
  path text,
  url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment settings table
CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  paypal_email text,
  stripe_connected boolean DEFAULT false,
  payout_schedule text DEFAULT 'instant',
  minimum_payout_amount numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_payment_settings UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Users can manage their own products"
  ON products
  USING (auth.uid() = user_id);

-- RLS Policies for customers
CREATE POLICY "Users can manage their own customers"
  ON customers
  USING (auth.uid() = user_id);

-- RLS Policies for memberships
CREATE POLICY "Users can manage their own memberships"
  ON memberships
  USING (auth.uid() = user_id);

-- RLS Policies for files
CREATE POLICY "Users can manage their own files"
  ON files
  USING (auth.uid() = user_id);

-- RLS Policies for payment_settings
CREATE POLICY "Users can manage their own payment settings"
  ON payment_settings
  USING (auth.uid() = user_id);

-- Create storage bucket for product files if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('product_files', 'product_files', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage policy to allow authenticated users to upload files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Allow authenticated users to upload files'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, definition)
    VALUES (
      'Allow authenticated users to upload files',
      'product_files',
      jsonb_build_object(
        'role', 'authenticated',
        'match', jsonb_build_object(
          'userId', 'auth.uid()'
        ),
        'operationRules', jsonb_build_object(
          'READ', jsonb_build_array(jsonb_build_object()),
          'WRITE', jsonb_build_array(jsonb_build_object()),
          'DELETE', jsonb_build_array(jsonb_build_object())
        )
      )
    );
  END IF;
END $$;
