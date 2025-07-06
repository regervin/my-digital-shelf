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
        
        const { data, error } = await supabase
          .from('payment_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        setPaymentSettings(data || {
          user_id: user.id,
          paypal_email: '',
          payout_schedule: 'instant',
          minimum_payout_amount: 0
        });
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
      
      // Check if payment settings exist for this user
      const { data: existingSettings } = await supabase
        .from('payment_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('payment_settings')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .maybeSingle();
      } else {
        // Create new settings
        result = await supabase
          .from('payment_settings')
          .insert([{ user_id: user.id, ...updates }])
          .select()
          .maybeSingle();
      }
      
      const { data, error } = result;
      
      if (error) {
        throw error;
      }
      
      setPaymentSettings(data);
      return { success: true, data };
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
