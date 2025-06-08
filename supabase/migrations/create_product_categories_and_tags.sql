/*
  # Create product categories and tags system
  
  1. New Tables
    - `product_categories`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text)
      - `slug` (text, unique)
      - `parent_id` (uuid, self-reference for hierarchical categories)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `product_tags`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `slug` (text, unique)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `product_category_mappings`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `category_id` (uuid, foreign key to product_categories)
      - `created_at` (timestamp)
    
    - `product_tag_mappings`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `tag_id` (uuid, foreign key to product_tags)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own categories and tags
*/

-- Create product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES product_categories(id),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_tags table
CREATE TABLE IF NOT EXISTS product_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_category_mappings junction table
CREATE TABLE IF NOT EXISTS product_category_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES product_categories(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Create product_tag_mappings junction table
CREATE TABLE IF NOT EXISTS product_tag_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES product_tags(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_category_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tag_mappings ENABLE ROW LEVEL SECURITY;

-- Policies for product_categories
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_categories' 
        AND policyname = 'Users can view their own categories'
    ) THEN
        CREATE POLICY "Users can view their own categories"
            ON product_categories
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_categories' 
        AND policyname = 'Users can insert their own categories'
    ) THEN
        CREATE POLICY "Users can insert their own categories"
            ON product_categories
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_categories' 
        AND policyname = 'Users can update their own categories'
    ) THEN
        CREATE POLICY "Users can update their own categories"
            ON product_categories
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_categories' 
        AND policyname = 'Users can delete their own categories'
    ) THEN
        CREATE POLICY "Users can delete their own categories"
            ON product_categories
            FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Policies for product_tags
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_tags' 
        AND policyname = 'Users can view their own tags'
    ) THEN
        CREATE POLICY "Users can view their own tags"
            ON product_tags
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_tags' 
        AND policyname = 'Users can insert their own tags'
    ) THEN
        CREATE POLICY "Users can insert their own tags"
            ON product_tags
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_tags' 
        AND policyname = 'Users can update their own tags'
    ) THEN
        CREATE POLICY "Users can update their own tags"
            ON product_tags
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_tags' 
        AND policyname = 'Users can delete their own tags'
    ) THEN
        CREATE POLICY "Users can delete their own tags"
            ON product_tags
            FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Policies for product_category_mappings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_category_mappings' 
        AND policyname = 'Users can view their own product category mappings'
    ) THEN
        CREATE POLICY "Users can view their own product category mappings"
            ON product_category_mappings
            FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM products p
                    WHERE p.id = product_id
                    AND p.user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_category_mappings' 
        AND policyname = 'Users can insert their own product category mappings'
    ) THEN
        CREATE POLICY "Users can insert their own product category mappings"
            ON product_category_mappings
            FOR INSERT
            TO authenticated
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM products p
                    JOIN product_categories c ON c.id = category_id
                    WHERE p.id = product_id
                    AND p.user_id = auth.uid()
                    AND c.user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_category_mappings' 
        AND policyname = 'Users can delete their own product category mappings'
    ) THEN
        CREATE POLICY "Users can delete their own product category mappings"
            ON product_category_mappings
            FOR DELETE
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM products p
                    WHERE p.id = product_id
                    AND p.user_id = auth.uid()
                )
            );
    END IF;
END
$$;

-- Policies for product_tag_mappings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_tag_mappings' 
        AND policyname = 'Users can view their own product tag mappings'
    ) THEN
        CREATE POLICY "Users can view their own product tag mappings"
            ON product_tag_mappings
            FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM products p
                    WHERE p.id = product_id
                    AND p.user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_tag_mappings' 
        AND policyname = 'Users can insert their own product tag mappings'
    ) THEN
        CREATE POLICY "Users can insert their own product tag mappings"
            ON product_tag_mappings
            FOR INSERT
            TO authenticated
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM products p
                    JOIN product_tags t ON t.id = tag_id
                    WHERE p.id = product_id
                    AND p.user_id = auth.uid()
                    AND t.user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_tag_mappings' 
        AND policyname = 'Users can delete their own product tag mappings'
    ) THEN
        CREATE POLICY "Users can delete their own product tag mappings"
            ON product_tag_mappings
            FOR DELETE
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM products p
                    WHERE p.id = product_id
                    AND p.user_id = auth.uid()
                )
            );
    END IF;
END
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_categories_user_id ON product_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_user_id ON product_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_product_category_mappings_product_id ON product_category_mappings(product_id);
CREATE INDEX IF NOT EXISTS idx_product_category_mappings_category_id ON product_category_mappings(category_id);
CREATE INDEX IF NOT EXISTS idx_product_tag_mappings_product_id ON product_tag_mappings(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tag_mappings_tag_id ON product_tag_mappings(tag_id);
