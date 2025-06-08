import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCustomers } from '../../hooks/useCustomers';
import { useAccessRecords } from '../../hooks/useAccessRecords';
import { Loader, User, Edit, Trash2, Download, Calendar, DollarSign, ShoppingBag, Clock } from 'lucide-react';
import PaymentMethodsList from './PaymentMethodsList';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, loading: customersLoading, error: customersError, deleteCustomer } = useCustomers();
  const { getCustomerAccessHistory } = useAccessRecords();
  
  const [customer, setCustomer] = useState(null);
  const [accessHistory, setAccessHistory] = useState([]);
  const [accessLoading, setAccessLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (customers.length > 0 && id) {
      const foundCustomer = customers.find(c => c.id === id);
      setCustomer(foundCustomer || null);
      
      if (foundCustomer) {
        loadAccessHistory(foundCustomer.id);
      }
    }
  }, [customers, id]);
  
  const loadAccessHistory = async (customerId) => {
    setAccessLoading(true);
    const result = await getCustomerAccessHistory(customerId);
    if (result.success) {
      setAccessHistory(result.data);
    }
    setAccessLoading(false);
  };
  
  const handleDeleteCustomer = async () => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      setIsDeleting(true);
      const result = await deleteCustomer(id);
      if (result.success) {
        navigate('/customers');
      } else {
        alert('Failed to delete customer. Please try again.');
        setIsDeleting(false);
      }
    }
  };
  
  if (customersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (customersError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error loading customer data. Please try again.</p>
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        <p>Customer not found. The customer may have been deleted or you don't have permission to view it.</p>
        <Link to="/customers" className="text-blue-600 hover:underline mt-2 inline-block">
          Return to Customers List
        </Link>
      </div>
    );
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <p className="text-gray-600">{customer.email}</p>
              {customer.phone && (
                <p className="text-gray-600">{customer.phone}</p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link
              to={`/customers/edit/${customer.id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            
            <button
              onClick={handleDeleteCustomer}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </button>
          </div>
        </div>
      </div>
      
      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-xl font-semibold">{formatCurrency(customer.total_spent)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-3">
              <ShoppingBag className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Purchases</p>
              <p className="text-xl font-semibold">{customer.purchases || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Downloads</p>
              <p className="text-xl font-semibold">
                {accessHistory.filter(record => 
                  record.access_type === 'download' && record.access_status === 'success'
                ).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-3">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Customer Since</p>
              <p className="text-xl font-semibold">{formatDate(customer.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab('payment-methods')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'payment-methods'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payment Methods
            </button>
            
            <button
              onClick={() => setActiveTab('access-history')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'access-history'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Access History
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Contact Details</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="mb-2">
                        <span className="font-medium">Email:</span> {customer.email}
                      </p>
                      <p className="mb-2">
                        <span className="font-medium">Phone:</span> {customer.phone || 'Not provided'}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{' '}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.status || 'Active'}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="mb-2">
                        <span className="font-medium">Country:</span> {customer.country || 'Not provided'}
                      </p>
                      <p>
                        <span className="font-medium">City:</span> {customer.city || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {customer.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="whitespace-pre-line">{customer.notes}</p>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Purchase History</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-500">
                    {customer.purchases > 0 
                      ? `This customer has made ${customer.purchases} purchase(s) totaling ${formatCurrency(customer.total_spent)}.`
                      : 'This customer has not made any purchases yet.'}
                  </p>
                  {customer.last_purchase && (
                    <p className="mt-2 text-gray-500">
                      Last purchase: {formatDate(customer.last_purchase)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Payment Methods Tab */}
          {activeTab === 'payment-methods' && (
            <PaymentMethodsList customerId={customer.id} />
          )}
          
          {/* Access History Tab */}
          {activeTab === 'access-history' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Access History</h3>
              
              {accessLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : accessHistory.length === 0 ? (
                <div className="bg-gray-50 p-6 text-center rounded-md">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No access records found for this customer.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Content
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {accessHistory.map((record) => (
                        <tr key={record.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(record.access_date).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              record.access_type === 'download' 
                                ? 'bg-blue-100 text-blue-800' 
                                : record.access_type === 'view'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {record.access_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.product ? (
                              <span>Product: {record.product.name}</span>
                            ) : record.membership ? (
                              <span>Membership: {record.membership.name}</span>
                            ) : (
                              <span>Unknown content</span>
                            )}
                            {record.content_identifier && (
                              <span className="block text-xs text-gray-500">
                                {record.content_identifier}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              record.access_status === 'success' 
                                ? 'bg-green-100 text-green-800' 
                                : record.access_status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.access_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
