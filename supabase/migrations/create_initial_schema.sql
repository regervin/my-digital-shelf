/*
  # Initial Schema for ProductHub

  1. New Tables
    - `profiles` - User profiles with additional information
    - `products` - Digital products created by users
    - `licenses` - License keys for products
    - `customers` - Customer information
    - `purchases` - Purchase records linking customers to products
    - `downloads` - Download records for tracking product access

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0,
  file_url TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  requires_license BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own products"
  ON products
  FOR ALL
  USING (auth.uid() = owner_id);

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  license_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  max_activations INTEGER DEFAULT 1,
  current_activations INTEGER DEFAULT 0,
  customer_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD licenses for their products"
  ON licenses
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT owner_id FROM products WHERE id = licenses.product_id
    )
  );

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(owner_id, email)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own customers"
  ON customers
  FOR ALL
  USING (auth.uid() = owner_id);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  license_id UUID REFERENCES licenses(id) ON DELETE SET NULL,
  purchase_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  amount DECIMAL(10, 2) DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD purchases for their products"
  ON purchases
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT owner_id FROM products WHERE id = purchases.product_id
    )
  );

-- Create downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  download_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read downloads for their products"
  ON downloads
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT owner_id FROM products WHERE id = downloads.product_id
    )
  );

CREATE POLICY "Users can insert downloads for their products"
  ON downloads
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM products WHERE id = downloads.product_id
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
