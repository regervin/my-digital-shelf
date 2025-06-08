import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomers } from '../hooks/useCustomers';
import { useAccessRecords } from '../hooks/useAccessRecords';
import { formatDate, formatCurrency } from '../utils/formatters';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const { getCustomer, loading: customerLoading, error: customerError } = useCustomers();
  const { getCustomerAccessHistory } = useAccessRecords();
  
  const [customer, setCustomer] = useState(null);
  const [accessHistory, setAccessHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch customer details
        const customerResult = await getCustomer(id);
        
        if (!customerResult.success) {
          throw new Error(customerResult.error.message);
        }
        
        setCustomer(customerResult.data);
        
        // Fetch customer access history
        const accessResult = await getCustomerAccessHistory(id);
        
        if (!accessResult.success) {
          throw new Error(accessResult.error.message);
        }
        
        setAccessHistory(accessResult.data);
      } catch (err) {
        console.error('Error fetching customer data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchData();
    }
  }, [id]);
  
  if (loading || customerLoading) {
    return <div className="p-8 text-center">Loading customer details...</div>;
  }
  
  if (error || customerError) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {(error || customerError).message}
      </div>
    );
  }
  
  if (!customer) {
    return <div className="p-8 text-center">Customer not found.</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/customers" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Customers
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-600">{customer.email}</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-blue-500 text-sm font-medium uppercase">Total Purchases</div>
              <div className="mt-2 text-3xl font-bold text-blue-700">{customer.total_purchases || 0}</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-green-500 text-sm font-medium uppercase">Lifetime Value</div>
              <div className="mt-2 text-3xl font-bold text-green-700">{formatCurrency(customer.lifetime_value || 0)}</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-purple-500 text-sm font-medium uppercase">Active Subscriptions</div>
              <div className="mt-2 text-3xl font-bold text-purple-700">{customer.active_subscriptions || 0}</div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Customer ID</dt>
                    <dd className="text-sm text-gray-900">{customer.id}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900">{formatDate(customer.created_at)}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Last Purchase</dt>
                    <dd className="text-sm text-gray-900">{customer.last_purchase_date ? formatDate(customer.last_purchase_date) : 'Never'}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : customer.status === 'inactive' 
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {customer.status || 'Unknown'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{customer.email}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900">{customer.phone || 'Not provided'}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Country</dt>
                    <dd className="text-sm text-gray-900">{customer.country || 'Not provided'}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="text-sm text-gray-900">{customer.notes || 'No notes'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Access History</h2>
        </div>
        
        <div className="overflow-x-auto">
          {accessHistory.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accessHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.access_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.product ? (
                        <div className="text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                            Product
                          </span>
                          {record.product.name}
                        </div>
                      ) : record.membership ? (
                        <div className="text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                            Membership
                          </span>
                          {record.membership.name}
                          {record.content_identifier && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({record.content_identifier})
                            </span>
                          )}
                        </div>
                      ) : (
                        'Unknown Content'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.access_type === 'download' 
                          ? 'bg-green-100 text-green-800' 
                          : record.access_type === 'view' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : record.access_type === 'stream'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.access_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.access_status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : record.access_status === 'failed' 
                          ? 'bg-red-100 text-red-800'
                          : record.access_status === 'expired'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.access_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No access records found for this customer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
