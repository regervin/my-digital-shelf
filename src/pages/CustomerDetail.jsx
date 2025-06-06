import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiEdit2, FiTrash2, FiMail, FiPhone, FiShoppingBag } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [customer, setCustomer] = useState(null)
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingSales, setLoadingSales] = useState(true)

  useEffect(() => {
    async function fetchCustomerDetails() {
      try {
        setLoading(true)
        
        if (!user || !id) return
        
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) {
          throw error
        }
        
        if (!data) {
          toast.error('Customer not found')
          navigate('/customers')
          return
        }
        
        setCustomer(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching customer details:', error)
        toast.error('Failed to load customer details')
        setLoading(false)
        navigate('/customers')
      }
    }
    
    async function fetchCustomerSales() {
      try {
        setLoadingSales(true)
        
        if (!user || !id) return
        
        const { data, error } = await supabase
          .from('sales')
          .select(`
            id,
            amount,
            status,
            created_at,
            product_id,
            membership_id,
            products(name),
            memberships(name)
          `)
          .eq('customer_id', id)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        // Transform the data to a more usable format
        const formattedSales = data.map(sale => ({
          id: sale.id,
          product: sale.products?.name || sale.memberships?.name || 'Unknown Product',
          amount: parseFloat(sale.amount),
          date: new Date(sale.created_at),
          status: sale.status,
          productId: sale.product_id,
          membershipId: sale.membership_id
        }))
        
        setSales(formattedSales)
        setLoadingSales(false)
      } catch (error) {
        console.error('Error fetching customer sales:', error)
        toast.error('Failed to load customer sales')
        setLoadingSales(false)
      }
    }
    
    fetchCustomerDetails()
    fetchCustomerSales()
  }, [user, id, navigate])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      toast.success('Customer deleted successfully')
      navigate('/customers')
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Failed to delete customer')
    }
  }

  // Calculate customer metrics
  const totalSpent = sales.reduce((sum, sale) => sum + sale.amount, 0)
  const totalPurchases = sales.length
  const lastPurchaseDate = sales.length > 0 ? sales[0].date : null

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Customer not found.</p>
        <Link to="/customers" className="btn btn-primary">
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
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Link to={`/customers/${id}/edit`} className="btn btn-outline">
            <FiEdit2 className="mr-2" />
            Edit
          </Link>
          <button 
            onClick={handleDelete}
            className="btn btn-outline btn-error"
          >
            <FiTrash2 className="mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Spent</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">${totalSpent.toFixed(2)}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Purchases</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{totalPurchases}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Purchase</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">
            {lastPurchaseDate ? format(lastPurchaseDate, 'MMM dd, yyyy') : 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <FiMail className="mt-1 mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p>{customer.email}</p>
              </div>
            </div>
            
            {customer.phone && (
              <div className="flex items-start">
                <FiPhone className="mt-1 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p>{customer.phone}</p>
                </div>
              </div>
            )}
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customer Since</p>
              <p>{format(new Date(customer.created_at), 'MMMM dd, yyyy')}</p>
            </div>
          </div>
        </div>
        
        {customer.notes && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <p className="whitespace-pre-line">{customer.notes}</p>
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Purchase History</h2>
          <Link to="/sales/create" className="btn btn-sm btn-outline">
            <FiShoppingBag className="mr-2" />
            Add Sale
          </Link>
        </div>
        
        {loadingSales ? (
          <div className="animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-gray-200 dark:border-gray-700 py-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : sales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3">{format(sale.date, 'MMM dd, yyyy')}</td>
                    <td className="py-3">{sale.product}</td>
                    <td className="py-3">${sale.amount.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link to={`/sales/${sale.id}`} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No purchase history found.</p>
            <Link to="/sales/create" className="btn btn-primary">
              <FiShoppingBag className="mr-2" />
              Add First Sale
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
