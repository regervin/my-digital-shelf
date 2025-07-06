import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiFilter, FiEye, FiMail, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Customers() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (user) {
      fetchCustomers()
    }
  }, [user])

  async function fetchCustomers() {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      console.log('Fetched customers:', data)
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(customerId) {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)
        .eq('seller_id', user.id)

      if (error) {
        throw error
      }

      // Remove customer from local state
      setCustomers(customers.filter(customer => customer.id !== customerId))
      toast.success('Customer deleted successfully')
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer')
    }
  }

  const filteredCustomers = customers
    .filter(customer => {
      // Apply search filter
      if (searchTerm && 
          !customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !customer.email?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Apply status filter
      if (filter !== 'all' && customer.status !== filter) {
        return false
      }
      
      return true
    })

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link to="/customers/new" className="btn btn-primary mt-4 sm:mt-0">
          <FiPlus className="mr-2" />
          Add Customer
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center">
            <FiFilter className="mr-2 text-gray-500 dark:text-gray-400" />
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Customers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-gray-200 dark:border-gray-700 py-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Purchases</th>
                  <th className="pb-3">Total Spent</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3 font-medium">{customer.name}</td>
                    <td className="py-3">{customer.email}</td>
                    <td className="py-3">{customer.purchases || 0}</td>
                    <td className="py-3">${parseFloat(customer.total_spent || 0).toFixed(2)}</td>
                    <td className="py-3">{format(new Date(customer.created_at), 'MMM dd, yyyy')}</td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <Link to={`/customers/${customer.id}`} className="text-gray-500 hover:text-primary-600" title="View Details">
                          <FiEye />
                        </Link>
                        <Link to={`/customers/${customer.id}/edit`} className="text-gray-500 hover:text-primary-600" title="Edit Customer">
                          <FiEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Customer"
                        >
                          <FiTrash2 />
                        </button>
                        <a 
                          href={`mailto:${customer.email}`} 
                          className="text-gray-500 hover:text-primary-600"
                          title="Send Email"
                        >
                          <FiMail />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No customers found.</p>
            <Link to="/customers/new" className="btn btn-primary mt-4">
              <FiPlus className="mr-2" />
              Add Your First Customer
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
