/*
  # Create customers table
  
  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, not null)
      - `phone` (text)
      - `status` (text, default 'active')
      - `notes` (text)
      - `country` (text)
      - `city` (text)
      - `seller_id` (uuid, references auth.users)
      - `purchases` (integer, default 0)
      - `total_spent` (numeric, default 0)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `customers` table
    - Add policies for authenticated users to manage their own customers
*/

-- Check if customers table exists, if not create it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
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
      created_at timestamptz DEFAULT now()
    );
    
    ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Check if policies exist before creating them
DO $$ 
BEGIN
  -- Check and create "Users can view their own customers" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'customers' AND policyname = 'Users can view their own customers'
  ) THEN
    CREATE POLICY "Users can view their own customers"
      ON customers
      FOR SELECT
      TO authenticated
      USING (auth.uid() = seller_id);
  END IF;

  -- Check and create "Users can insert their own customers" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'customers' AND policyname = 'Users can insert their own customers'
  ) THEN
    CREATE POLICY "Users can insert their own customers"
      ON customers
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = seller_id);
  END IF;

  -- Check and create "Users can update their own customers" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'customers' AND policyname = 'Users can update their own customers'
  ) THEN
    CREATE POLICY "Users can update their own customers"
      ON customers
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = seller_id)
      WITH CHECK (auth.uid() = seller_id);
  END IF;

  -- Check and create "Users can delete their own customers" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'customers' AND policyname = 'Users can delete their own customers'
  ) THEN
    CREATE POLICY "Users can delete their own customers"
      ON customers
      FOR DELETE
      TO authenticated
      USING (auth.uid() = seller_id);
  END IF;
END $$;
