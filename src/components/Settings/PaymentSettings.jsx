import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Loader, Save, CreditCard } from 'lucide-react';

export default function PaymentSettings() {
  const { user } = useAuth();
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    paypal_email: '',
    payout_schedule: 'instant',
    minimum_payout_amount: 0
  });
  
  // Fetch payment settings
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    async function fetchPaymentSettings() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('payment_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          // If settings don't exist yet, create them
          if (error.code === 'PGRST116') {
            const newSettings = {
              user_id: user.id,
              paypal_email: '',
              stripe_connected: false,
              payout_schedule: 'instant',
              minimum_payout_amount: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            const { data: createdSettings, error: createError } = await supabase
              .from('payment_settings')
              .insert([newSettings])
              .select()
              .single();
            
            if (createError) {
              throw createError;
            }
            
            setPaymentSettings(createdSettings);
            setFormData({
              paypal_email: createdSettings.paypal_email || '',
              payout_schedule: createdSettings.payout_schedule || 'instant',
              minimum_payout_amount: createdSettings.minimum_payout_amount || 0
            });
          } else {
            throw error;
          }
        } else {
          setPaymentSettings(data);
          setFormData({
            paypal_email: data.paypal_email || '',
            payout_schedule: data.payout_schedule || 'instant',
            minimum_payout_amount: data.minimum_payout_amount || 0
          });
        }
      } catch (err) {
        console.error('Error fetching payment settings:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPaymentSettings();
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });
    
    try {
      if (!user) throw new Error('User not authenticated');
      if (!paymentSettings) throw new Error('Payment settings not loaded');
      
      const updatedData = {
        ...formData,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('payment_settings')
        .update(updatedData)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setPaymentSettings(data);
      setSaveMessage({
        type: 'success',
        text: 'Payment settings updated successfully!'
      });
    } catch (err) {
      console.error('Error updating payment settings:', err);
      setSaveMessage({
        type: 'error',
        text: `Failed to update payment settings: ${err.message}`
      });
    } finally {
      setIsSaving(false);
      
      // Clear success message after 3 seconds
      if (saveMessage.type === 'success') {
        setTimeout(() => {
          setSaveMessage({ type: '', text: '' });
        }, 3000);
      }
    }
  };
  
  if (loading && !paymentSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (error && !paymentSettings) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error loading payment settings. Please try again.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-6">
        <div className="bg-green-100 p-3 rounded-full mr-4">
          <CreditCard className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-medium">Payment Settings</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* PayPal Email */}
          <div>
            <label htmlFor="paypal_email" className="block text-sm font-medium text-gray-700">
              PayPal Email
            </label>
            <input
              type="email"
              id="paypal_email"
              name="paypal_email"
              value={formData.paypal_email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="your.paypal@example.com"
            />
            <p className="mt-1 text-sm text-gray-500">
              We'll send your earnings to this PayPal account.
            </p>
          </div>
          
          {/* Payout Schedule */}
          <div>
            <label htmlFor="payout_schedule" className="block text-sm font-medium text-gray-700">
              Payout Schedule
            </label>
            <select
              id="payout_schedule"
              name="payout_schedule"
              value={formData.payout_schedule}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="instant">Instant (after each sale)</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          {/* Minimum Payout Amount */}
          <div>
            <label htmlFor="minimum_payout_amount" className="block text-sm font-medium text-gray-700">
              Minimum Payout Amount ($)
            </label>
            <input
              type="number"
              id="minimum_payout_amount"
              name="minimum_payout_amount"
              value={formData.minimum_payout_amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              We'll only send payouts when your balance reaches this amount.
            </p>
          </div>
          
          {/* Stripe Connect (placeholder) */}
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <h3 className="text-md font-medium mb-2">Connect with Stripe</h3>
            <p className="text-sm text-gray-500 mb-4">
              Accept credit card payments directly on your site by connecting your Stripe account.
            </p>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              disabled={paymentSettings?.stripe_connected}
            >
              {paymentSettings?.stripe_connected ? 'Connected with Stripe' : 'Connect with Stripe'}
            </button>
          </div>
        </div>
        
        {/* Save Message */}
        {saveMessage.text && (
          <div className={`mt-4 p-3 rounded ${
            saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {saveMessage.text}
          </div>
        )}
        
        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="-ml-1 mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
