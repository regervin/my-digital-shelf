/*
  # Create communications system tables
  
  1. New Tables
    - `communications`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references customers.id)
      - `sender_id` (uuid, references auth.users.id)
      - `message` (text, not null)
      - `subject` (text)
      - `type` (text, not null) - email, sms, in_app, etc.
      - `status` (text, not null) - sent, delivered, read, failed
      - `metadata` (jsonb) - for additional data like email headers, delivery info
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `communication_templates`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `subject` (text)
      - `content` (text, not null)
      - `type` (text, not null) - email, sms, in_app
      - `seller_id` (uuid, references auth.users.id)
      - `is_global` (boolean, default false)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own communications
    - Add policies for admins to manage all communications
*/

-- Create communications table
CREATE TABLE IF NOT EXISTS communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id),
  message text NOT NULL,
  subject text,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create communication_templates table
CREATE TABLE IF NOT EXISTS communication_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text,
  content text NOT NULL,
  type text NOT NULL,
  seller_id uuid REFERENCES auth.users(id),
  is_global boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on communications table
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- Enable RLS on communication_templates table
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;

-- Communications policies
CREATE POLICY "Users can view their own communications"
  ON communications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can insert their own communications"
  ON communications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own communications"
  ON communications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own communications"
  ON communications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Communication templates policies
CREATE POLICY "Users can view their own templates or global templates"
  ON communication_templates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id OR is_global = true);

CREATE POLICY "Users can insert their own templates"
  ON communication_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own templates"
  ON communication_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own templates"
  ON communication_templates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Add admin policies (assuming role-based access)
CREATE POLICY "Admins can view all communications"
  ON communications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all communications"
  ON communications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all templates"
  ON communication_templates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all templates"
  ON communication_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
