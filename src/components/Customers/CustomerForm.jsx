import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomers } from '../../hooks/useCustomers';
import { Loader, Save, User } from 'lucide-react';

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, loading, error, addCustomer, updateCustomer } = useCustomers();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  
  const isEditMode = !!id;
  
  // Load customer data if in edit mode
  useEffect(() => {
    if (isEditMode && customers.length > 0) {
      const customer = customers.find(c => c.id === id);
      if (customer) {
        setFormData({
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          notes: customer.notes || ''
        });
      }
    }
  }, [isEditMode, id, customers]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });
    
    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Customer name is required');
      }
      
      if (!formData.email.trim()) {
        throw new Error('Customer email is required');
      }
      
      let result;
      
      if (isEditMode) {
        result = await updateCustomer(id, formData);
      } else {
        result = await addCustomer(formData);
        
        // Redirect to customers list if customer was created successfully
        if (result.success) {
          navigate('/customers');
          return;
        }
      }
      
      if (result.success) {
        setSaveMessage({
          type: 'success',
          text: `Customer ${isEditMode ? 'updated' : 'created'} successfully!`
        });
      } else {
        throw result.error;
      }
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: `Failed to ${isEditMode ? 'update' : 'create'} customer: ${err.message}`
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (error && isEditMode) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error loading customer data. Please try again.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-medium">
          {isEditMode ? 'Edit Customer' : 'Add New Customer'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Customer name"
            />
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="customer@example.com"
            />
          </div>
          
          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="(123) 456-7890"
            />
          </div>
          
          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Customer address"
            />
          </div>
          
          {/* Notes */}
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes about this customer..."
            ></textarea>
          </div>
        </div>
        
        {/* Save Message */}
        {saveMessage.text && (
          <div className={`mt-6 p-3 rounded ${
            saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {saveMessage.text}
          </div>
        )}
        
        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
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
                {isEditMode ? 'Update Customer' : 'Add Customer'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
