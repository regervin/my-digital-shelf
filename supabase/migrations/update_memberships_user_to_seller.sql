/*
  # Update memberships table to use seller_id instead of user_id

  1. Changes
    - Rename `user_id` column to `seller_id` in the `memberships` table
    - Update RLS policies to use `seller_id` instead of `user_id`
  
  2. Security
    - Update all RLS policies to reference `seller_id` instead of `user_id`
*/

-- First, add the new seller_id column
ALTER TABLE memberships 
ADD COLUMN seller_id uuid REFERENCES auth.users(id);

-- Copy data from user_id to seller_id
UPDATE memberships 
SET seller_id = user_id
WHERE user_id IS NOT NULL;

-- Make seller_id NOT NULL after data migration
ALTER TABLE memberships 
ALTER COLUMN seller_id SET NOT NULL;

-- Drop the old user_id column
ALTER TABLE memberships 
DROP COLUMN user_id;

-- Update RLS policies to use seller_id instead of user_id
DROP POLICY IF EXISTS "Users can view their own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON memberships;

-- Create new policies using seller_id
CREATE POLICY "Users can view their own memberships"
  ON memberships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert their own memberships"
  ON memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own memberships"
  ON memberships
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own memberships"
  ON memberships
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);
