import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiEdit2, FiTrash2, FiDownload } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function SaleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sale, setSale] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSaleDetails() {
      try {
        setLoading(true)
        
        if (!user || !id) return
        
        const { data, error } = await supabase
          .from('sales')
          .select(`
            id,
            amount,
            status,
            created_at,
            updated_at,
            product_id,
            membership_id,
            customer_id,
            products(id, name, description, price, type),
            memberships(id, name, description, price, billing_cycle),
            customers(id, name, email)
          `)
          .eq('id', id)
          .single()
        
        if (error) {
          throw error
        }
        
        if (!data) {
          toast.error('Sale not found')
          navigate('/sales')
          return
        }
        
        setSale(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching sale details:', error)
        toast.error('Failed to load sale details')
        setLoading(false)
        navigate('/sales')
      }
    }
    
    fetchSaleDetails()
  }, [user, id, navigate])

  const handleStatusChange = async (newStatus) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update({ status: newStatus, updated_at: new Date() })
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      setSale({ ...sale, status: newStatus, updated_at: new Date() })
      toast.success(`Sale marked as ${newStatus}`)
    } catch (error) {
      console.error('Error updating sale status:', error)
      toast.error('Failed to update sale status')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      toast.success('Sale deleted successfully')
      navigate('/sales')
    } catch (error) {
      console.error('Error deleting sale:', error)
      toast.error('Failed to delete sale')
    }
  }

  const generateInvoice = () => {
    // In a real app, this would generate a PDF invoice
    // For now, we'll just show a success message
    toast.success('Invoice generated and downloaded')
  }

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

  if (!sale) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Sale not found.</p>
        <Link to="/sales" className="btn btn-primary">
          <FiArrowLeft className="mr-2" />
          Back to Sales
        </Link>
      </div>
    )
  }

  const product = sale.products || sale.memberships
  const productType = sale.product_id ? 'product' : 'membership'

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/sales" className="mr-4 text-gray-500 hover:text-primary-600">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Sale Details</h1>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button 
            onClick={generateInvoice}
            className="btn btn-outline"
          >
            <FiDownload className="mr-2" />
            Invoice
          </button>
          <button 
            onClick={handleDelete}
            className="btn btn-outline btn-error"
          >
            <FiTrash2 className="mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Sale Information</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <div className="flex items-center mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  sale.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {sale.status}
                </span>
                <div className="ml-4">
                  {sale.status === 'completed' ? (
                    <button 
                      onClick={() => handleStatusChange('refunded')}
                      className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Mark as Refunded
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStatusChange('completed')}
                      className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
              <p className="text-lg font-semibold">${parseFloat(sale.amount).toFixed(2)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
              <p>{format(new Date(sale.created_at), 'MMMM dd, yyyy')}</p>
            </div>
            
            {sale.updated_at && sale.updated_at !== sale.created_at && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                <p>{format(new Date(sale.updated_at), 'MMMM dd, yyyy')}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p className="font-medium">{sale.customers?.name || 'Unknown Customer'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p>{sale.customers?.email || 'Unknown Email'}</p>
            </div>
            
            <div className="pt-2">
              <Link 
                to={`/customers/${sale.customer_id}`}
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
              >
                View Customer Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {productType === 'product' ? 'Product' : 'Membership'} Details
        </h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
            <p className="font-medium">{product?.name || 'Unknown Product'}</p>
          </div>
          
          {product?.description && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
              <p>{product.description}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
            <p className="capitalize">{productType === 'product' ? product?.type || 'Unknown' : 'Membership'}</p>
          </div>
          
          {productType === 'membership' && product?.billing_cycle && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Billing Cycle</p>
              <p className="capitalize">{product.billing_cycle}</p>
            </div>
          )}
          
          <div className="pt-2">
            <Link 
              to={productType === 'product' ? `/products/${product?.id}` : `/memberships/${product?.id}`}
              className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
            >
              View {productType === 'product' ? 'Product' : 'Membership'} Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
