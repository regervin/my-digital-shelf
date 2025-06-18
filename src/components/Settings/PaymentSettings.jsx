import React, { useState, useEffect } from 'react';
import { Loader, Save, CreditCard } from 'lucide-react';
import { usePaymentSettings } from '../../hooks/usePaymentSettings';
import { useAuth } from '../../contexts/AuthContext';

export default function PaymentSettings() {
  const { user } = useAuth() || { user: null };
  const { paymentSettings, loading, error, updatePaymentSettings } = usePaymentSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    paypal_email: '',
    payout_schedule: 'instant',
    minimum_payout_amount: 0
  });
  
  // Debug logs
  useEffect(() => {
    console.log('PaymentSettings component mounted');
    console.log('User:', user);
    console.log('Initial loading state:', loading);
    console.log('Initial error state:', error);
    console.log('Initial paymentSettings:', paymentSettings);
  }, []);
  
  // Update logs when dependencies change
  useEffect(() => {
    console.log('Loading state changed:', loading);
  }, [loading]);
  
  useEffect(() => {
    console.log('Error state changed:', error);
  }, [error]);
  
  useEffect(() => {
    console.log('Payment settings changed:', paymentSettings);
  }, [paymentSettings]);
  
  // Update form data when payment settings are loaded
  useEffect(() => {
    if (paymentSettings) {
      console.log('Updating form data with payment settings:', paymentSettings);
      setFormData({
        paypal_email: paymentSettings.paypal_email || '',
        payout_schedule: paymentSettings.payout_schedule || 'instant',
        minimum_payout_amount: paymentSettings.minimum_payout_amount || 0
      });
    }
  }, [paymentSettings]);
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) : value;
    console.log(`Form field changed: ${name} = ${newValue}`);
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });
    
    try {
      console.log('Calling updatePaymentSettings with:', formData);
      const result = await updatePaymentSettings(formData);
      console.log('updatePaymentSettings result:', result);
      
      if (!result.success) {
        throw result.error || new Error('Failed to update payment settings');
      }
      
      setSaveMessage({
        type: 'success',
        text: 'Payment settings updated successfully!'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setSaveMessage({
        type: 'error',
        text: `Failed to update payment settings: ${err.message}`
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Show detailed error information for debugging
  if (error) {
    console.error('Rendering error state. Error details:', error);
  }
  
  if (loading && !paymentSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading payment settings...</span>
      </div>
    );
  }
  
  if (error && !paymentSettings) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <h3 className="font-bold">Error loading payment settings</h3>
        <p className="mt-1">{error.message || 'Please try again.'}</p>
        <p className="mt-2 text-sm">
          <button 
            onClick={() => window.location.reload()} 
            className="underline hover:text-red-800"
          >
            Refresh the page
          </button> to try again.
        </p>
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
