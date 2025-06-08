/*
  # Create payment settings table

  1. New Tables
    - `payment_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users.id)
      - `paypal_email` (text)
      - `stripe_connected` (boolean)
      - `payout_schedule` (text)
      - `minimum_payout_amount` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `payment_settings` table
    - Add policies for authenticated users to read and update their own payment settings
*/

CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  paypal_email text,
  stripe_connected boolean DEFAULT false,
  payout_schedule text DEFAULT 'instant',
  minimum_payout_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own payment settings"
  ON payment_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment settings"
  ON payment_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment settings"
  ON payment_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
