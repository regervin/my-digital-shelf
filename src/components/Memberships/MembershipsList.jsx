import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMemberships } from '../../hooks/useMemberships';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Icons
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Loader,
  CreditCard
} from 'lucide-react';

export default function MembershipsList() {
  const { memberships, loading, error, deleteMembership } = useMemberships();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Handle membership deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this membership?')) {
      const result = await deleteMembership(id);
      if (!result.success) {
        alert('Failed to delete membership. Please try again.');
      }
    }
  };
  
  // Filter memberships based on search term and status
  const filteredMemberships = memberships.filter(membership => {
    const customerName = membership.customer?.name || '';
    const customerEmail = membership.customer?.email || '';
    const productName = membership.product?.name || '';
    
    const matchesSearch = 
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || membership.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error loading memberships. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Memberships</h1>
        <Link 
          to="/memberships/new" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Membership
        </Link>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search memberships..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative w-full sm:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {/* Memberships List */}
      {filteredMemberships.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredMemberships.map((membership) => (
              <li key={membership.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {membership.customer?.name || 'Unknown Customer'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {membership.customer?.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {membership.product?.name || 'Unknown Product'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(membership.amount || membership.product?.price || 0)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        membership.status === 'active' ? 'bg-green-100 text-green-800' :
                        membership.status === 'expired' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {membership.status}
                      </span>
                      <div className="text-sm text-gray-500">
                        {formatDate(membership.created_at)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/memberships/${membership.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(membership.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No memberships</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new membership.
          </p>
          <div className="mt-6">
            <Link
              to="/memberships/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Membership
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
