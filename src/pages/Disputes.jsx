import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiDownload, FiEye, FiMessageSquare, FiCheck } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useDisputes } from '../hooks/useDisputes';
import { format } from 'date-fns';

export default function Disputes() {
  const { user } = useAuth();
  const { disputes, loading, updateDispute } = useDisputes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const filteredDisputes = disputes
    .filter(dispute => {
      // Apply search filter
      const customerName = dispute.customer?.name || '';
      const productName = dispute.sale?.product?.name || dispute.sale?.membership?.name || '';
      const customerEmail = dispute.customer?.email || '';
      const reason = dispute.reason || '';
      
      if (searchTerm && 
          !customerName.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !reason.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (filter !== 'all' && dispute.status !== filter) {
        return false;
      }
      
      // Apply date range filter
      if (dateRange !== 'all') {
        const today = new Date();
        const disputeDate = new Date(dispute.created_at);
        
        if (dateRange === '7days') {
          const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
          if (disputeDate < sevenDaysAgo) return false;
        } else if (dateRange === '30days') {
          const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
          if (disputeDate < thirtyDaysAgo) return false;
        } else if (dateRange === '90days') {
          const ninetyDaysAgo = new Date(today.setDate(today.getDate() - 90));
          if (disputeDate < ninetyDaysAgo) return false;
        }
      }
      
      return true;
    });

  // Calculate totals
  const totalDisputes = filteredDisputes.length;
  const openDisputes = filteredDisputes.filter(d => d.status === 'open').length;
  const inProgressDisputes = filteredDisputes.filter(d => d.status === 'in_progress').length;
  const resolvedDisputes = filteredDisputes.filter(d => d.status === 'resolved').length;
  
  // Calculate average resolution time for resolved disputes
  const resolvedDisputesWithDates = filteredDisputes.filter(d => 
    d.status === 'resolved' && d.created_at && d.resolved_at
  );
  
  let avgResolutionTime = 0;
  if (resolvedDisputesWithDates.length > 0) {
    const totalTime = resolvedDisputesWithDates.reduce((sum, d) => {
      const created = new Date(d.created_at);
      const resolved = new Date(d.resolved_at);
      return sum + (resolved - created);
    }, 0);
    
    // Average time in hours
    avgResolutionTime = totalTime / resolvedDisputesWithDates.length / (1000 * 60 * 60);
  }

  const handleUpdateStatus = async (dispute, newStatus) => {
    if (dispute.status === newStatus) return;
    
    const updates = { status: newStatus };
    
    // If resolving, add resolved_at timestamp
    if (newStatus === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }
    
    const result = await updateDispute(dispute.id, updates);
    
    if (!result.success) {
      alert('Failed to update dispute status. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Disputes</h1>
        <button className="btn btn-outline mt-2 sm:mt-0">
          <FiDownload className="mr-2" />
          Export CSV
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Disputes</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{totalDisputes}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Open</h3>
          <p className="text-3xl font-bold text-red-500">{openDisputes}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">In Progress</h3>
          <p className="text-3xl font-bold text-yellow-500">{inProgressDisputes}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Avg. Resolution Time</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">
            {avgResolutionTime > 0 
              ? `${avgResolutionTime.toFixed(1)} hrs` 
              : 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by customer, reason or product..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FiFilter className="mr-2 text-gray-500 dark:text-gray-400" />
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="animate-pulse">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="border-b border-gray-200 dark:border-gray-700 py-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredDisputes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Product/Membership</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDisputes.map((dispute) => (
                  <tr key={dispute.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3">{format(new Date(dispute.created_at), 'MMM dd, yyyy')}</td>
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{dispute.customer?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{dispute.customer?.email || 'No email'}</div>
                      </div>
                    </td>
                    <td className="py-3">{dispute.sale?.product?.name || dispute.sale?.membership?.name || 'Unknown'}</td>
                    <td className="py-3">
                      <div className="max-w-xs truncate" title={dispute.reason}>
                        {dispute.reason}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        dispute.status === 'resolved' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : dispute.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {dispute.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <Link to={`/disputes/${dispute.id}`} className="text-gray-500 hover:text-primary-600">
                          <FiEye />
                        </Link>
                        
                        {dispute.status === 'open' && (
                          <button 
                            onClick={() => handleUpdateStatus(dispute, 'in_progress')}
                            className="text-yellow-500 hover:text-yellow-600"
                            title="Mark as In Progress"
                          >
                            <FiMessageSquare />
                          </button>
                        )}
                        
                        {dispute.status === 'in_progress' && (
                          <button 
                            onClick={() => handleUpdateStatus(dispute, 'resolved')}
                            className="text-green-500 hover:text-green-600"
                            title="Mark as Resolved"
                          >
                            <FiCheck />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No disputes found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
