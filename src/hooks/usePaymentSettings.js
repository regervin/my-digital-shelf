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
        
        // First, check if there are multiple records for this user
        const { data: countData, error: countError } = await supabase
          .from('payment_settings')
          .select('id')
          .eq('user_id', user.id);
          
        if (countError) {
          console.error('Error checking payment settings count:', countError);
          throw countError;
        }
        
        console.log('Found payment settings records:', countData?.length || 0);
        
        // If multiple records exist, clean up duplicates
        if (countData && countData.length > 1) {
          console.log('Multiple payment settings found for user. Cleaning up...');
          
          // Keep the most recently updated record
          const { data: sortedData, error: sortError } = await supabase
            .from('payment_settings')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });
            
          if (sortError) {
            console.error('Error sorting payment settings:', sortError);
            throw sortError;
          }
          
          // Keep the first record (most recent) and delete the rest
          if (sortedData && sortedData.length > 1) {
            const keepId = sortedData[0].id;
            const deleteIds = sortedData.slice(1).map(record => record.id);
            
            console.log('Keeping record:', keepId);
            console.log('Deleting duplicate records:', deleteIds);
            
            // Delete duplicate records
            const { error: deleteError } = await supabase
              .from('payment_settings')
              .delete()
              .in('id', deleteIds);
              
            if (deleteError) {
              console.error('Error deleting duplicate records:', deleteError);
              // Continue anyway - we'll use the first record
            }
            
            // Set the payment settings to the record we're keeping
            setPaymentSettings(sortedData[0]);
            setLoading(false);
            return;
          }
        }
        
        // Normal flow - fetch single record
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
        .eq('user_id', user.id);
      
      if (checkError) {
        console.error('Error checking existing settings:', checkError);
        throw checkError;
      }
      
      console.log('Existing settings check result:', existingSettings);
      
      let result;
      
      if (existingSettings && existingSettings.length > 0) {
        // If multiple records exist, update the first one and delete the rest
        if (existingSettings.length > 1) {
          console.log('Multiple records found, updating first and deleting others');
          
          // Update the first record
          const firstId = existingSettings[0].id;
          const otherIds = existingSettings.slice(1).map(record => record.id);
          
          // Update first record
          result = await supabase
            .from('payment_settings')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', firstId);
            
          if (result.error) {
            console.error('Error updating first record:', result.error);
            throw result.error;
          }
          
          // Delete other records
          const { error: deleteError } = await supabase
            .from('payment_settings')
            .delete()
            .in('id', otherIds);
            
          if (deleteError) {
            console.error('Error deleting duplicate records:', deleteError);
            // Continue anyway - we've updated the first record
          }
        } else {
          // Update existing settings (single record)
          console.log('Updating existing payment settings');
          result = await supabase
            .from('payment_settings')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSettings[0].id);
        }
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
