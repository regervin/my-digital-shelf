import React, { useState, useEffect } from 'react';
import { useAccessRecords } from '../hooks/useAccessRecords';
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../hooks/useProducts';
import { useMemberships } from '../hooks/useMemberships';

const RecordAccessForm = ({ onSuccess }) => {
  const { recordAccess } = useAccessRecords();
  const { customers, loading: customersLoading } = useCustomers();
  const { products, loading: productsLoading } = useProducts();
  const { memberships, loading: membershipsLoading } = useMemberships();
  
  const [formData, setFormData] = useState({
    customer_id: '',
    content_type: 'product', // 'product' or 'membership'
    product_id: '',
    membership_id: '',
    access_type: 'download', // 'download', 'view', 'stream'
    content_identifier: '',
    access_status: 'success', // 'success', 'failed', 'expired'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Reset product_id or membership_id when content_type changes
  useEffect(() => {
    if (formData.content_type === 'product') {
      setFormData(prev => ({ ...prev, membership_id: '' }));
    } else {
      setFormData(prev => ({ ...prev, product_id: '' }));
    }
  }, [formData.content_type]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Prepare the access record data
      const accessData = {
        customer_id: formData.customer_id,
        access_type: formData.access_type,
        content_identifier: formData.content_identifier,
        access_status: formData.access_status,
      };
      
      // Add either product_id or membership_id based on content_type
      if (formData.content_type === 'product') {
        accessData.product_id = formData.product_id;
      } else {
        accessData.membership_id = formData.membership_id;
      }
      
      const result = await recordAccess(accessData);
      
      if (result.success) {
        setSuccess(true);
        setFormData({
          customer_id: '',
          content_type: 'product',
          product_id: '',
          membership_id: '',
          access_type: 'download',
          content_identifier: '',
          access_status: 'success',
        });
        
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  const isLoading = customersLoading || productsLoading || membershipsLoading || loading;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Record New Access</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error.message}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Access record created successfully!
          </div>
        )}
        
        <div>
          <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <select
            id="customer_id"
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} ({customer.email})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="content_type" className="block text-sm font-medium text-gray-700 mb-1">
            Content Type
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="content_type"
                value="product"
                checked={formData.content_type === 'product'}
                onChange={handleChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Product</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="content_type"
                value="membership"
                checked={formData.content_type === 'membership'}
                onChange={handleChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Membership</span>
            </label>
          </div>
        </div>
        
        {formData.content_type === 'product' && (
          <div>
            <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              id="product_id"
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {formData.content_type === 'membership' && (
          <div>
            <label htmlFor="membership_id" className="block text-sm font-medium text-gray-700 mb-1">
              Membership
            </label>
            <select
              id="membership_id"
              name="membership_id"
              value={formData.membership_id}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select a membership</option>
              {memberships.map(membership => (
                <option key={membership.id} value={membership.id}>
                  {membership.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div>
          <label htmlFor="access_type" className="block text-sm font-medium text-gray-700 mb-1">
            Access Type
          </label>
          <select
            id="access_type"
            name="access_type"
            value={formData.access_type}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="download">Download</option>
            <option value="view">View</option>
            <option value="stream">Stream</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="content_identifier" className="block text-sm font-medium text-gray-700 mb-1">
            Content Identifier (Optional)
          </label>
          <input
            type="text"
            id="content_identifier"
            name="content_identifier"
            value={formData.content_identifier}
            onChange={handleChange}
            placeholder="e.g., chapter-1, module-2, etc."
            disabled={isLoading}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            For memberships with multiple content pieces, specify which one was accessed.
          </p>
        </div>
        
        <div>
          <label htmlFor="access_status" className="block text-sm font-medium text-gray-700 mb-1">
            Access Status
          </label>
          <select
            id="access_status"
            name="access_status"
            value={formData.access_status}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? 'Recording...' : 'Record Access'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordAccessForm;
