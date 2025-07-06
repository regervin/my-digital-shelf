/*
  # Fix duplicate payment settings records

  1. Data Cleanup
    - Identify and remove duplicate payment_settings records
    - Keep only the most recently updated record for each user
    - Ensure uniqueness constraint is properly enforced
*/

-- First, identify users with multiple payment settings
WITH duplicates AS (
  SELECT user_id
  FROM payment_settings
  GROUP BY user_id
  HAVING COUNT(*) > 1
),
-- For each user with duplicates, keep only the most recently updated record
records_to_keep AS (
  SELECT DISTINCT ON (ps.user_id) ps.id
  FROM payment_settings ps
  JOIN duplicates d ON ps.user_id = d.user_id
  ORDER BY ps.user_id, ps.updated_at DESC
)
-- Delete all duplicate records except the ones we want to keep
DELETE FROM payment_settings
WHERE 
  user_id IN (SELECT user_id FROM duplicates)
  AND id NOT IN (SELECT id FROM records_to_keep);

-- Make sure the uniqueness constraint is properly enforced
DO $$ 
BEGIN
  -- Check if the constraint already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'payment_settings_user_id_key' 
    AND table_name = 'payment_settings'
  ) THEN
    -- Add unique constraint if it doesn't exist
    ALTER TABLE payment_settings ADD CONSTRAINT payment_settings_user_id_key UNIQUE (user_id);
  END IF;
END $$;