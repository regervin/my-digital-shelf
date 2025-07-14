/*
  # Create product types configuration system

  1. New Tables
    - `product_types`
      - `id` (uuid, primary key)
      - `value` (text, unique) - the internal value used in code
      - `label` (text) - the display label shown to users
      - `description` (text) - optional description
      - `is_active` (boolean) - whether this type is available for selection
      - `sort_order` (integer) - for ordering in dropdowns
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `product_types` table
    - Add policies for authenticated users to read product types
    - Add policies for admin users to manage product types

  3. Initial Data
    - Insert existing product types with proper ordering
*/

CREATE TABLE IF NOT EXISTS product_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;

-- Policy for all authenticated users to read active product types
CREATE POLICY "Users can view active product types"
  ON product_types
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy for admin users to manage product types (assuming admin role exists)
CREATE POLICY "Admins can manage product types"
  ON product_types
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Insert existing product types
INSERT INTO product_types (value, label, description, sort_order) VALUES
  ('ebook', 'E-Book', 'Digital books and publications', 1),
  ('course', 'Course', 'Educational courses and training materials', 2),
  ('software', 'Software', 'Applications and software tools', 3),
  ('templates', 'Templates', 'Design templates and layouts', 4),
  ('graphics', 'Graphics', 'Images, icons, and graphic assets', 5),
  ('audio', 'Audio', 'Music, podcasts, and audio files', 6),
  ('video', 'Video', 'Video content and tutorials', 7),
  ('plr', 'PLR (Private Label Rights)', 'Private Label Rights content that can be rebranded', 8)
ON CONFLICT (value) DO NOTHING;