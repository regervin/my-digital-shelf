/*
  # Fix customer_payment_methods policies
  
  1. Changes
    - Modify policy creation to use IF NOT EXISTS
    - Ensure policies are only created if they don't already exist
  
  2. Security
    - Maintains the same RLS policies but prevents errors on repeated execution
*/

-- Check if policies exist before creating them
DO $$
BEGIN
    -- Policy for users to view their customers' payment methods
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_payment_methods' 
        AND policyname = 'Users can view their customers'' payment methods'
    ) THEN
        CREATE POLICY "Users can view their customers' payment methods"
            ON customer_payment_methods
            FOR SELECT
            TO authenticated
            USING (auth.uid() = seller_id);
    END IF;

    -- Policy for users to insert payment methods for their customers
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_payment_methods' 
        AND policyname = 'Users can insert payment methods for their customers'
    ) THEN
        CREATE POLICY "Users can insert payment methods for their customers"
            ON customer_payment_methods
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = seller_id);
    END IF;

    -- Policy for users to update their customers' payment methods
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_payment_methods' 
        AND policyname = 'Users can update their customers'' payment methods'
    ) THEN
        CREATE POLICY "Users can update their customers' payment methods"
            ON customer_payment_methods
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = seller_id)
            WITH CHECK (auth.uid() = seller_id);
    END IF;

    -- Policy for users to delete their customers' payment methods
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_payment_methods' 
        AND policyname = 'Users can delete their customers'' payment methods'
    ) THEN
        CREATE POLICY "Users can delete their customers' payment methods"
            ON customer_payment_methods
            FOR DELETE
            TO authenticated
            USING (auth.uid() = seller_id);
    END IF;
END
$$;
