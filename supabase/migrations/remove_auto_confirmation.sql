/*
  # Remove auto-confirmation of emails
  
  1. Changes
    - Removes the trigger that automatically confirms emails
    - Allows the normal email verification flow to work
  
  2. Security
    - Restores proper email verification security
*/

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS confirm_user_email ON auth.users;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.auto_confirm_email();