/*
  # Create refunds and disputes tables

  1. New Tables
    - `refunds`
      - `id` (uuid, primary key)
      - `sale_id` (uuid, foreign key to sales)
      - `amount` (numeric, not null)
      - `reason` (text, not null)
      - `status` (text, not null)
      - `notes` (text)
      - `refund_date` (timestamptz)
      - `seller_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `disputes`
      - `id` (uuid, primary key)
      - `sale_id` (uuid, foreign key to sales)
      - `customer_id` (uuid, foreign key to customers)
      - `reason` (text, not null)
      - `status` (text, not null)
      - `description` (text)
      - `resolution` (text)
      - `resolved_at` (timestamptz)
      - `seller_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own refunds and disputes
*/

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) NOT NULL,
  amount numeric NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  refund_date timestamptz,
  seller_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) NOT NULL,
  customer_id uuid REFERENCES customers(id) NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  description text,
  resolution text,
  resolved_at timestamptz,
  seller_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Policies for refunds table
CREATE POLICY "Users can view their own refunds"
  ON refunds
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert their own refunds"
  ON refunds
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own refunds"
  ON refunds
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own refunds"
  ON refunds
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Policies for disputes table
CREATE POLICY "Users can view their own disputes"
  ON disputes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert their own disputes"
  ON disputes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own disputes"
  ON disputes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own disputes"
  ON disputes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);
