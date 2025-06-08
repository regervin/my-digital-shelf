import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMemberships } from '../../hooks/useMemberships';
import { useCustomers } from '../../hooks/useCustomers';
import { useProducts } from '../../hooks/useProducts';
import { formatCurrency } from '../../utils/formatters';
import { Loader, Save, CreditCard } from 'lucide-react';

export default function MembershipForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { memberships, loading: membershipsLoading, error: membershipsError, addMembership, updateMembership } = useMemberships();
  const { customers, loading: customersLoading } = useCustomers();
  const { products, loading: productsLoading } = useProducts();
  
  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    status: 'active',
    amount: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  
  const isEditMode = !!id;
  
  // Load membership data if in edit mode
  useEffect(() => {
    if (isEditMode && memberships.length > 0) {
      const membership = memberships.find(m => m.id === id);
      if (membership) {
        setFormData({
          customer_id: membership.customer_id || '',
          product_id: membership.product_id || '',
          status: membership.status || 'active',
          amount: membership.amount || '',
          start_date: membership.start_date ? new Date(membership.start_date).toISOString().split('T')[0] : '',
          end_date: membership.end_date ? new Date(membership.end_date).toISOString().split('T')[0] : ''
        });
      }
    }
  }, [isEditMode, id, memberships]);
  
  // Update amount when product changes
  useEffect(() => {
    if (formData.product_id && products.length > 0) {
      const product = products.find(p => p.id === formData.product_id);
      if (product) {
        setSelectedProduct(product);
        if (!formData.amount) {
          setFormData(prev => ({ ...prev, amount: product.price }));
        }
      }
    }
  }, [formData.product_id, products]);
  
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
      // Validate form
      if (!formData.customer_id) {
        throw new Error('Please select a customer');
      }
      
      if (!formData.product_id) {
        throw new Error('Please select a product');
      }
      
      let result;
      
      if (isEditMode) {
        result = await updateMembership(id, formData);
      } else {
        result = await addMembership(formData);
        
        // Redirect to memberships list if membership was created successfully
        if (result.success) {
          navigate('/memberships');
          return;
        }
      }
      
      if (result.success) {
        setSaveMessage({
          type: 'success',
          text: `Membership ${isEditMode ? 'updated' : 'created'} successfully!`
        });
      } else {
        throw result.error;
      }
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: `Failed to ${isEditMode ? 'update' : 'create'} membership: ${err.message}`
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const isLoading = membershipsLoading || customersLoading || productsLoading;
  
  if (isLoading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (membershipsError && isEditMode) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error loading membership data. Please try again.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-6">
        <div className="bg-purple-100 p-3 rounded-full mr-4">
          <CreditCard className="h-6 w-6 text-purple-600" />
        </div>
        <h2 className="text-xl font-medium">
          {isEditMode ? 'Edit Membership' : 'Create New Membership'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer */}
          <div>
            <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
              Customer *
            </label>
            <select
              id="customer_id"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
          </div>
          
          {/* Product */}
          <div>
            <label htmlFor="product_id" className="block text-sm font-medium text-gray-700">
              Product *
            </label>
            <select
              id="product_id"
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({formatCurrency(product.price)})
                </option>
              ))}
            </select>
          </div>
          
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount ($)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
            {selectedProduct && (
              <p className="mt-1 text-sm text-gray-500">
                Default price: {formatCurrency(selectedProduct.price)}
              </p>
            )}
          </div>
          
          {/* Start Date */}
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* End Date */}
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave blank for lifetime access
            </p>
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
            onClick={() => navigate('/memberships')}
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
                {isEditMode ? 'Update Membership' : 'Create Membership'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
