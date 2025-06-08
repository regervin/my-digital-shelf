import React, { useState } from 'react';
import { formatDate } from '../utils/formatters';

const AccessRecordsList = ({ accessRecords, loading, error }) => {
  const [filter, setFilter] = useState('all'); // all, products, memberships
  
  if (loading) {
    return <div className="p-4 text-center">Loading access records...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading access records: {error.message}</div>;
  }
  
  if (!accessRecords || accessRecords.length === 0) {
    return <div className="p-4 text-center text-gray-500">No access records found.</div>;
  }
  
  const filteredRecords = accessRecords.filter(record => {
    if (filter === 'products') return record.product_id;
    if (filter === 'memberships') return record.membership_id;
    return true;
  });
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Access Records</h3>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 rounded text-sm ${filter === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('products')}
          >
            Products
          </button>
          <button 
            className={`px-3 py-1 rounded text-sm ${filter === 'memberships' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('memberships')}
          >
            Memberships
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(record.access_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {record.customer?.name || 'Unknown Customer'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {record.customer?.email || ''}
                  </div>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.ip_address || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredRecords.length === 0 && (
        <div className="p-4 text-center text-gray-500">No matching access records found.</div>
      )}
    </div>
  );
};

export default AccessRecordsList;
