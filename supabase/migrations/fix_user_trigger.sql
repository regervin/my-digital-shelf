/*
  # Fix user trigger for profile creation

  1. Changes
    - Modify the handle_new_user function to properly handle new user creation
    - Add conditional checks to prevent errors when the trigger already exists
    - Ensure the function is idempotent and handles edge cases
  
  2. Security
    - Maintains the same security model
    - No changes to RLS policies
*/

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the new user into profiles table
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  -- Use ON CONFLICT to handle cases where the profile might already exist
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
