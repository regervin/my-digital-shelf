/*
  # Disable email confirmation for testing
  
  1. Changes
    - Update auth.users table to auto-confirm all new users
    - This is a temporary change for development/testing
  
  2. Security
    - This is less secure but simplifies testing
    - Should be reverted before production
*/

-- Update existing users to be confirmed
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Create a trigger to auto-confirm new users
CREATE OR REPLACE FUNCTION auth.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Set email_confirmed_at to current time if it's null
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS confirm_email ON auth.users;

-- Create the trigger
CREATE TRIGGER confirm_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.auto_confirm_email();