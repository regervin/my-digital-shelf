import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function usePaymentSettings() {
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add fallback for useAuth to prevent errors
  const auth = useAuth() || { user: null };
  const { user } = auth;
  
  useEffect(() => {
    async function loadPaymentSettings() {
      if (!user) {
        setPaymentSettings(null);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null); // Reset error state
        
        console.log('Fetching payment settings for user:', user.id);
        
        const { data, error } = await supabase
          .from('payment_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Supabase error fetching payment settings:', error);
          throw error;
        }
        
        console.log('Payment settings data received:', data);
        
        // If no data exists, create a default object
        if (!data) {
          setPaymentSettings({
            user_id: user.id,
            paypal_email: '',
            payout_schedule: 'instant',
            minimum_payout_amount: 0,
            stripe_connected: false
          });
        } else {
          setPaymentSettings(data);
        }
      } catch (err) {
        console.error('Error loading payment settings:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadPaymentSettings();
  }, [user]);
  
  const updatePaymentSettings = async (updates) => {
    if (!user) {
      return { success: false, error: new Error('User not authenticated') };
    }
    
    try {
      setLoading(true);
      setError(null); // Reset error state
      
      console.log('Updating payment settings for user:', user.id, 'with data:', updates);
      
      // Check if payment settings exist for this user
      const { data: existingSettings, error: checkError } = await supabase
        .from('payment_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking existing settings:', checkError);
        throw checkError;
      }
      
      console.log('Existing settings check result:', existingSettings);
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        console.log('Updating existing payment settings');
        result = await supabase
          .from('payment_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Create new settings
        console.log('Creating new payment settings');
        result = await supabase
          .from('payment_settings')
          .insert([{ 
            user_id: user.id, 
            ...updates,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
      }
      
      if (result.error) {
        console.error('Error in update/insert operation:', result.error);
        throw result.error;
      }
      
      console.log('Update/insert operation result:', result);
      
      // Fetch the updated record
      const { data: updatedData, error: fetchError } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching updated data:', fetchError);
        throw fetchError;
      }
      
      console.log('Updated data fetched:', updatedData);
      
      setPaymentSettings(updatedData);
      return { success: true, data: updatedData };
    } catch (err) {
      console.error('Error updating payment settings:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };
  
  return { paymentSettings, loading, error, updatePaymentSettings };
}
