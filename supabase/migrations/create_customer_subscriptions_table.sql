/*
  # Create customer_subscriptions table
  
  1. New Tables
    - `customer_subscriptions`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references customers)
      - `membership_id` (uuid, references memberships)
      - `status` (text, not null) - e.g., 'active', 'canceled', 'paused', 'trial', 'expired'
      - `start_date` (timestamptz, not null)
      - `end_date` (timestamptz) - null if ongoing
      - `trial_end_date` (timestamptz) - null if no trial or trial ended
      - `next_billing_date` (timestamptz)
      - `billing_period_start` (timestamptz)
      - `billing_period_end` (timestamptz)
      - `cancel_at_period_end` (boolean) - true if subscription will be canceled at the end of the current period
      - `canceled_at` (timestamptz) - when the subscription was canceled
      - `payment_method` (text)
      - `price_paid` (numeric) - actual price paid (may differ from membership price due to discounts)
      - `seller_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `customer_subscriptions` table
    - Add policies for authenticated users to manage their own customer subscriptions
*/

CREATE TABLE IF NOT EXISTS customer_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  membership_id uuid REFERENCES memberships(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'active',
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  trial_end_date timestamptz,
  next_billing_date timestamptz,
  billing_period_start timestamptz,
  billing_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  payment_method text,
  price_paid numeric,
  seller_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_customer_id ON customer_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_membership_id ON customer_subscriptions(membership_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_seller_id ON customer_subscriptions(seller_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_status ON customer_subscriptions(status);

ALTER TABLE customer_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own customer subscriptions
CREATE POLICY "Users can view their own customer subscriptions"
  ON customer_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

-- Policy for users to insert their own customer subscriptions
CREATE POLICY "Users can insert their own customer subscriptions"
  ON customer_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

-- Policy for users to update their own customer subscriptions
CREATE POLICY "Users can update their own customer subscriptions"
  ON customer_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Policy for users to delete their own customer subscriptions
CREATE POLICY "Users can delete their own customer subscriptions"
  ON customer_subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);
