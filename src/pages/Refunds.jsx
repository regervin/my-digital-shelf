import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiDownload, FiEye, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useRefunds } from '../hooks/useRefunds';
import { format } from 'date-fns';

export default function Refunds() {
  const { user } = useAuth();
  const { refunds, loading, updateRefund } = useRefunds();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const filteredRefunds = refunds
    .filter(refund => {
      // Apply search filter
      const customerName = refund.sale?.customer?.name || '';
      const productName = refund.sale?.product?.name || refund.sale?.membership?.name || '';
      const customerEmail = refund.sale?.customer?.email || '';
      
      if (searchTerm && 
          !customerName.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (filter !== 'all' && refund.status !== filter) {
        return false;
      }
      
      // Apply date range filter
      if (dateRange !== 'all') {
        const today = new Date();
        const refundDate = new Date(refund.created_at);
        
        if (dateRange === '7days') {
          const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
          if (refundDate < sevenDaysAgo) return false;
        } else if (dateRange === '30days') {
          const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
          if (refundDate < thirtyDaysAgo) return false;
        } else if (dateRange === '90days') {
          const ninetyDaysAgo = new Date(today.setDate(today.getDate() - 90));
          if (refundDate < ninetyDaysAgo) return false;
        }
      }
      
      return true;
    });

  // Calculate totals
  const totalRefunds = filteredRefunds.length;
  const pendingRefunds = filteredRefunds.filter(r => r.status === 'pending').length;
  const approvedRefunds = filteredRefunds.filter(r => r.status === 'approved').length;
  const rejectedRefunds = filteredRefunds.filter(r => r.status === 'rejected').length;
  
  const totalAmount = filteredRefunds
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const handleApproveRefund = async (refund) => {
    if (refund.status !== 'pending') return;
    
    const result = await updateRefund(refund.id, {
      status: 'approved',
      refund_date: new Date().toISOString()
    });
    
    if (!result.success) {
      alert('Failed to approve refund. Please try again.');
    }
  };

  const handleRejectRefund = async (refund) => {
    if (refund.status !== 'pending') return;
    
    const result = await updateRefund(refund.id, {
      status: 'rejected'
    });
    
    if (!result.success) {
      alert('Failed to reject refund. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Refunds</h1>
        <button className="btn btn-outline mt-2 sm:mt-0">
          <FiDownload className="mr-2" />
          Export CSV
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Refunds</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{totalRefunds}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pending</h3>
          <p className="text-3xl font-bold text-yellow-500">{pendingRefunds}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Approved</h3>
          <p className="text-3xl font-bold text-green-500">{approvedRefunds}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Refunded</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">${totalAmount.toFixed(2)}</p>
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
              placeholder="Search by customer, email or product..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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
        ) : filteredRefunds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Product/Membership</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((refund) => (
                  <tr key={refund.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3">{format(new Date(refund.created_at), 'MMM dd, yyyy')}</td>
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{refund.sale?.customer?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{refund.sale?.customer?.email || 'No email'}</div>
                      </div>
                    </td>
                    <td className="py-3">{refund.sale?.product?.name || refund.sale?.membership?.name || 'Unknown'}</td>
                    <td className="py-3">${Number(refund.amount).toFixed(2)}</td>
                    <td className="py-3">
                      <div className="max-w-xs truncate" title={refund.reason}>
                        {refund.reason}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        refund.status === 'approved' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : refund.status === 'rejected'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {refund.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <Link to={`/refunds/${refund.id}`} className="text-gray-500 hover:text-primary-600">
                          <FiEye />
                        </Link>
                        
                        {refund.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApproveRefund(refund)}
                              className="text-green-500 hover:text-green-600"
                              title="Approve Refund"
                            >
                              <FiCheck />
                            </button>
                            <button 
                              onClick={() => handleRejectRefund(refund)}
                              className="text-red-500 hover:text-red-600"
                              title="Reject Refund"
                            >
                              <FiX />
                            </button>
                          </>
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
            <p className="text-gray-500 dark:text-gray-400">No refunds found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
