/*
  # Create payment_settings table

  1. New Tables
    - `payment_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `paypal_email` (text)
      - `stripe_connected` (boolean)
      - `payout_schedule` (text)
      - `minimum_payout_amount` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `payment_settings` table
    - Add policy for authenticated users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  paypal_email text,
  stripe_connected boolean DEFAULT false,
  payout_schedule text DEFAULT 'instant',
  minimum_payout_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own payment settings
CREATE POLICY "Users can read their own payment settings"
  ON payment_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own payment settings
CREATE POLICY "Users can insert their own payment settings"
  ON payment_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own payment settings
CREATE POLICY "Users can update their own payment settings"
  ON payment_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
