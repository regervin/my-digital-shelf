import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiEdit2, FiTrash2, FiArrowLeft, FiMail, FiPhone, FiCalendar, FiDollarSign, FiShoppingBag } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function CustomerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (user && id) {
      fetchCustomer()
      fetchPurchases()
    }
  }, [user, id])

  async function fetchCustomer() {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .eq('seller_id', user.id)
        .single()
      
      if (error) {
        throw error
      }
      
      setCustomer(data)
    } catch (error) {
      console.error('Error fetching customer:', error)
      toast.error('Failed to load customer details')
      navigate('/customers')
    } finally {
      setLoading(false)
    }
  }

  async function fetchPurchases() {
    // This is a placeholder for future implementation
    // In a real app, you would fetch actual purchase data from your database
    setPurchases([
      {
        id: '1',
        product_name: 'Digital Marketing Guide',
        amount: 29.99,
        date: '2023-05-15T10:30:00Z',
        status: 'completed'
      },
      {
        id: '2',
        product_name: 'SEO Masterclass',
        amount: 49.99,
        date: '2023-06-02T14:45:00Z',
        status: 'completed'
      }
    ])
  }

  async function handleDelete() {
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('seller_id', user.id)
      
      if (error) {
        throw error
      }
      
      toast.success('Customer deleted successfully')
      navigate('/customers')
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer')
    } finally {
      setLoading(false)
      setDeleteModalOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Customer not found.</p>
        <Link to="/customers" className="btn btn-primary mt-4">
          <FiArrowLeft className="mr-2" />
          Back to Customers
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/customers" className="mr-4 text-gray-500 hover:text-primary-600">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
            customer.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {customer.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="flex mt-4 sm:mt-0">
          <Link 
            to={`/customers/edit/${id}`}
            className="btn btn-outline mr-2"
          >
            <FiEdit2 className="mr-2" />
            Edit
          </Link>
          <button 
            onClick={() => setDeleteModalOpen(true)}
            className="btn btn-danger"
          >
            <FiTrash2 className="mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <FiMail className="text-gray-500 dark:text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
              </div>
              
              {customer.phone && (
                <div className="flex items-start">
                  <FiPhone className="text-gray-500 dark:text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <FiCalendar className="text-gray-500 dark:text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customer Since</p>
                  <p className="font-medium">{format(new Date(customer.created_at), 'MMMM dd, yyyy')}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FiShoppingBag className="text-gray-500 dark:text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Purchases</p>
                  <p className="font-medium">{customer.purchases || 0}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FiDollarSign className="text-gray-500 dark:text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
                  <p className="font-medium">${parseFloat(customer.total_spent || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            {customer.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-medium mb-2">Notes</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Purchase History</h2>
            
            {purchases.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="py-3 font-medium">{purchase.product_name}</td>
                        <td className="py-3">{format(new Date(purchase.date), 'MMM dd, yyyy')}</td>
                        <td className="py-3">${purchase.amount.toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            purchase.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {purchase.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No purchase history available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Delete Customer</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete {customer.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
