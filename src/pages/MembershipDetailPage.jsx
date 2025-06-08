import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMemberships } from '../hooks/useMemberships';
import { useAccessRecords } from '../hooks/useAccessRecords';
import { formatDate, formatCurrency } from '../utils/formatters';

const MembershipDetailPage = () => {
  const { id } = useParams();
  const { getMembership, loading: membershipLoading, error: membershipError } = useMemberships();
  const { getMembershipAccessHistory } = useAccessRecords();
  
  const [membership, setMembership] = useState(null);
  const [accessHistory, setAccessHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch membership details
        const membershipResult = await getMembership(id);
        
        if (!membershipResult.success) {
          throw new Error(membershipResult.error.message);
        }
        
        setMembership(membershipResult.data);
        
        // Fetch membership access history
        const accessResult = await getMembershipAccessHistory(id);
        
        if (!accessResult.success) {
          throw new Error(accessResult.error.message);
        }
        
        setAccessHistory(accessResult.data);
      } catch (err) {
        console.error('Error fetching membership data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchData();
    }
  }, [id]);
  
  if (loading || membershipLoading) {
    return <div className="p-8 text-center">Loading membership details...</div>;
  }
  
  if (error || membershipError) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {(error || membershipError).message}
      </div>
    );
  }
  
  if (!membership) {
    return <div className="p-8 text-center">Membership not found.</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/memberships" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Memberships
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{membership.name}</h1>
          <p className="text-gray-600">{membership.billing_interval} membership</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-blue-500 text-sm font-medium uppercase">Price</div>
              <div className="mt-2 text-3xl font-bold text-blue-700">
                {formatCurrency(membership.price || 0)}
                <span className="text-sm text-blue-500 ml-1">/{membership.billing_interval}</span>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-green-500 text-sm font-medium uppercase">Active Subscribers</div>
              <div className="mt-2 text-3xl font-bold text-green-700">{membership.active_subscribers || 0}</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-purple-500 text-sm font-medium uppercase">Monthly Revenue</div>
              <div className="mt-2 text-3xl font-bold text-purple-700">
                {formatCurrency((membership.price || 0) * (membership.active_subscribers || 0) * 
                  (membership.billing_interval === 'year' ? (1/12) : 1))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Membership Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Membership ID</dt>
                    <dd className="text-sm text-gray-900">{membership.id}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900">{formatDate(membership.created_at)}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm text-gray-900">{formatDate(membership.updated_at)}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        membership.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : membership.status === 'draft' 
                          ? 'bg-gray-100 text-gray-800'
                          : membership.status === 'archived'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {membership.status || 'Unknown'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Billing Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Billing Interval</dt>
                    <dd className="text-sm text-gray-900 capitalize">{membership.billing_interval || 'N/A'}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Trial Period</dt>
                    <dd className="text-sm text-gray-900">
                      {membership.trial_period_days ? `${membership.trial_period_days} days` : 'No trial'}
                    </dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Included Products</dt>
                    <dd className="text-sm text-gray-900">{membership.product_count || 0}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Access URL</dt>
                    <dd className="text-sm text-gray-900 truncate max-w-xs">{membership.access_url || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Description</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-line">{membership.description || 'No description provided.'}</p>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accessHistory.map((record) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.content_identifier || 'General Access'}
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
              No access records found for this membership.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipDetailPage;
