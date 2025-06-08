import React, { useState } from 'react';
import { useCustomerPaymentMethods } from '../../hooks/useCustomerPaymentMethods';
import { Loader, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const CARD_BRANDS = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'amex', label: 'American Express' },
  { value: 'discover', label: 'Discover' },
  { value: 'diners', label: 'Diners Club' },
  { value: 'jcb', label: 'JCB' },
  { value: 'unionpay', label: 'UnionPay' },
  { value: 'other', label: 'Other' }
];

const PAYMENT_TYPES = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'other', label: 'Other' }
];

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;
  return { value: month, label: month.toString().padStart(2, '0') };
});

const YEARS = Array.from({ length: 20 }, (_, i) => {
  const year = new Date().getFullYear() + i;
  return { value: year, label: year.toString() };
});

export default function PaymentMethodForm({ customerId, onSuccess, onCancel, existingMethod = null }) {
  const isEditMode = !!existingMethod;
  const { addPaymentMethod, updatePaymentMethod, loading } = useCustomerPaymentMethods(customerId);
  
  const [formData, setFormData] = useState({
    payment_type: existingMethod?.payment_type || 'credit_card',
    is_default: existingMethod?.is_default || false,
    last_four: existingMethod?.last_four || '',
    card_brand: existingMethod?.card_brand || '',
    expiry_month: existingMethod?.expiry_month || '',
    expiry_year: existingMethod?.expiry_year || '',
    cardholder_name: existingMethod?.cardholder_name || '',
    payment_processor: existingMethod?.payment_processor || 'manual',
    payment_processor_id: existingMethod?.payment_processor_id || '',
    billing_address: existingMethod?.billing_address || {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: ''
    }
  });
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('billing_address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billing_address: {
          ...prev.billing_address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  const validateForm = () => {
    // Reset errors
    setFormError('');
    
    // Basic validation
    if (!formData.payment_type) {
      setFormError('Payment type is required');
      return false;
    }
    
    if (formData.payment_type === 'credit_card' || formData.payment_type === 'debit_card') {
      if (!formData.last_four || formData.last_four.length !== 4 || !/^\d{4}$/.test(formData.last_four)) {
        setFormError('Last four digits must be exactly 4 numbers');
        return false;
      }
      
      if (!formData.card_brand) {
        setFormError('Card brand is required');
        return false;
      }
      
      if (!formData.expiry_month || !formData.expiry_year) {
        setFormError('Expiration date is required');
        return false;
      }
      
      if (!formData.cardholder_name) {
        setFormError('Cardholder name is required');
        return false;
      }
      
      // Check if card is expired
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      if (
        parseInt(formData.expiry_year) < currentYear || 
        (parseInt(formData.expiry_year) === currentYear && parseInt(formData.expiry_month) < currentMonth)
      ) {
        setFormError('Card has expired');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      let result;
      
      if (isEditMode) {
        result = await updatePaymentMethod(existingMethod.id, formData);
      } else {
        result = await addPaymentMethod(formData);
      }
      
      if (result.success) {
        setFormSuccess(`Payment method ${isEditMode ? 'updated' : 'added'} successfully!`);
        
        // Notify parent component
        if (onSuccess) {
          setTimeout(() => {
            onSuccess(result.data);
          }, 1500);
        }
      } else {
        throw new Error(result.error.message || 'An error occurred');
      }
    } catch (error) {
      setFormError(`Error: ${error.message}`);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <CreditCard className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-medium">
          {isEditMode ? 'Edit Payment Method' : 'Add Payment Method'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Payment Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Type *
          </label>
          <select
            name="payment_type"
            value={formData.payment_type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {PAYMENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Card Details - Only show for credit/debit cards */}
        {(formData.payment_type === 'credit_card' || formData.payment_type === 'debit_card') && (
          <>
            {/* Card Brand */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Brand *
              </label>
              <select
                name="card_brand"
                value={formData.card_brand}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Card Brand</option>
                {CARD_BRANDS.map(brand => (
                  <option key={brand.value} value={brand.value}>
                    {brand.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Last Four Digits */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Four Digits *
              </label>
              <input
                type="text"
                name="last_four"
                value={formData.last_four}
                onChange={handleChange}
                maxLength="4"
                pattern="\d{4}"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="1234"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                For security, only store the last 4 digits of the card number.
              </p>
            </div>
            
            {/* Expiration Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="expiry_month"
                  value={formData.expiry_month}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Month</option>
                  {MONTHS.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                
                <select
                  name="expiry_year"
                  value={formData.expiry_year}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Year</option>
                  {YEARS.map(year => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Cardholder Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name *
              </label>
              <input
                type="text"
                name="cardholder_name"
                value={formData.cardholder_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
                required
              />
            </div>
          </>
        )}
        
        {/* Billing Address */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Billing Address</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Street
              </label>
              <input
                type="text"
                name="billing_address.street"
                value={formData.billing_address.street}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main St"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="billing_address.city"
                  value={formData.billing_address.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="New York"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  name="billing_address.state"
                  value={formData.billing_address.state}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="NY"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="billing_address.postal_code"
                  value={formData.billing_address.postal_code}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10001"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="billing_address.country"
                  value={formData.billing_address.country}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="USA"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Processor Info */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Processor Information</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Payment Processor
              </label>
              <input
                type="text"
                name="payment_processor"
                value={formData.payment_processor}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="stripe, paypal, etc."
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Payment Processor ID
              </label>
              <input
                type="text"
                name="payment_processor_id"
                value={formData.payment_processor_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="pm_123456789"
              />
              <p className="mt-1 text-xs text-gray-500">
                Reference ID from your payment processor (e.g., Stripe payment method ID)
              </p>
            </div>
          </div>
        </div>
        
        {/* Set as Default */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Set as default payment method</span>
          </label>
        </div>
        
        {/* Error/Success Messages */}
        {formError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {formError}
          </div>
        )}
        
        {formSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {formSuccess}
          </div>
        )}
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Saving...
              </span>
            ) : (
              isEditMode ? 'Update Payment Method' : 'Add Payment Method'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
