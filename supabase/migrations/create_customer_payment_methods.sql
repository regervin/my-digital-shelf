/*
  # Create customer_payment_methods table
  
  1. New Tables
    - `customer_payment_methods`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references customers)
      - `payment_type` (text, not null) - e.g., 'credit_card', 'paypal', 'bank_transfer'
      - `is_default` (boolean, default false)
      - `last_four` (text) - last 4 digits of card or account
      - `card_brand` (text) - e.g., 'visa', 'mastercard', 'amex'
      - `expiry_month` (integer) - card expiry month
      - `expiry_year` (integer) - card expiry year
      - `cardholder_name` (text)
      - `billing_address` (jsonb) - structured billing address data
      - `payment_processor_id` (text) - ID from payment processor (Stripe, PayPal, etc.)
      - `payment_processor` (text) - e.g., 'stripe', 'paypal'
      - `status` (text, default 'active')
      - `seller_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `customer_payment_methods` table
    - Add policies for authenticated users to manage their customers' payment methods
    - IMPORTANT: This table does NOT store full card numbers or security codes
*/

CREATE TABLE IF NOT EXISTS customer_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  payment_type text NOT NULL,
  is_default boolean DEFAULT false,
  last_four text,
  card_brand text,
  expiry_month integer,
  expiry_year integer,
  cardholder_name text,
  billing_address jsonb,
  payment_processor_id text,
  payment_processor text,
  status text DEFAULT 'active',
  seller_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_customer_payment_methods_customer_id ON customer_payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_payment_methods_seller_id ON customer_payment_methods(seller_id);
CREATE INDEX IF NOT EXISTS idx_customer_payment_methods_payment_type ON customer_payment_methods(payment_type);
CREATE INDEX IF NOT EXISTS idx_customer_payment_methods_status ON customer_payment_methods(status);
CREATE INDEX IF NOT EXISTS idx_customer_payment_methods_is_default ON customer_payment_methods(is_default);

-- Add constraint to ensure only one default payment method per customer
ALTER TABLE customer_payment_methods
  ADD CONSTRAINT unique_default_payment_method_per_customer
  EXCLUDE USING btree (customer_id WITH =) 
  WHERE (is_default = true);

-- Enable row level security
ALTER TABLE customer_payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their customers' payment methods
CREATE POLICY "Users can view their customers' payment methods"
  ON customer_payment_methods
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

-- Policy for users to insert payment methods for their customers
CREATE POLICY "Users can insert payment methods for their customers"
  ON customer_payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

-- Policy for users to update their customers' payment methods
CREATE POLICY "Users can update their customers' payment methods"
  ON customer_payment_methods
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Policy for users to delete their customers' payment methods
CREATE POLICY "Users can delete their customers' payment methods"
  ON customer_payment_methods
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Function to handle default payment method logic
CREATE OR REPLACE FUNCTION handle_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  -- If this payment method is being set as default
  IF NEW.is_default = true THEN
    -- Set all other payment methods for this customer to non-default
    UPDATE customer_payment_methods
    SET is_default = false
    WHERE customer_id = NEW.customer_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  
  -- If this is the only payment method for the customer, make it default
  IF NOT EXISTS (
    SELECT 1 FROM customer_payment_methods
    WHERE customer_id = NEW.customer_id
      AND id != NEW.id
  ) THEN
    NEW.is_default := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for default payment method handling
CREATE TRIGGER set_default_payment_method
  BEFORE INSERT OR UPDATE ON customer_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION handle_default_payment_method();
