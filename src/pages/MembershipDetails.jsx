import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiEdit2, FiTrash2, FiArrowLeft, FiUsers, FiDollarSign, FiCalendar, FiClock, FiPackage, FiLock } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function MembershipDetails() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscribers, setSubscribers] = useState([])
  const [subscribersLoading, setSubscribersLoading] = useState(true)
  const [includedProducts, setIncludedProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  
  useEffect(() => {
    if (id) {
      fetchMembership()
      fetchSubscribers()
      fetchIncludedProducts()
    }
  }, [id, user])
  
  async function fetchMembership() {
    try {
      setLoading(true)
      
      if (!user || !id) return
      
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        throw error
      }
      
      if (data) {
        setMembership(data)
      }
    } catch (error) {
      console.error('Error fetching membership:', error)
      toast.error('Failed to load membership details')
    } finally {
      setLoading(false)
    }
  }
  
  async function fetchSubscribers() {
    try {
      setSubscribersLoading(true)
      
      // In a real app, you would fetch actual subscribers
      // For now, we'll use dummy data
      setTimeout(() => {
        setSubscribers([
          { id: 1, name: 'John Smith', email: 'john@example.com', joined: '2023-10-15', status: 'active' },
          { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', joined: '2023-09-22', status: 'active' },
          { id: 3, name: 'Michael Brown', email: 'michael@example.com', joined: '2023-11-05', status: 'trial' }
        ])
        setSubscribersLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching subscribers:', error)
      setSubscribersLoading(false)
    }
  }
  
  async function fetchIncludedProducts() {
    try {
      setProductsLoading(true)
      
      // In a real app, you would fetch actual included products
      // For now, we'll use dummy data
      setTimeout(() => {
        setIncludedProducts([
          { id: 1, name: 'Ultimate Web Design Course', type: 'course' },
          { id: 2, name: 'Digital Marketing Ebook', type: 'ebook' },
          { id: 3, name: 'SEO Toolkit', type: 'software' }
        ])
        setProductsLoading(false)
      }, 700)
    } catch (error) {
      console.error('Error fetching included products:', error)
      setProductsLoading(false)
    }
  }
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this membership? This action cannot be undone.')) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      toast.success('Membership deleted successfully')
      navigate('/memberships')
    } catch (error) {
      console.error('Error deleting membership:', error)
      toast.error('Failed to delete membership')
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!membership) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Membership Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The membership you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link to="/memberships" className="btn btn-primary">
          <FiArrowLeft className="mr-2" />
          Back to Memberships
        </Link>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/memberships" className="mr-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">{membership.name}</h1>
          <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
            membership.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : membership.status === 'archived'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {membership.status}
          </span>
        </div>
        
        <div className="flex mt-4 sm:mt-0 space-x-2">
          <Link to={`/memberships/edit/${membership.id}`} className="btn btn-outline">
            <FiEdit2 className="mr-2" />
            Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            <FiTrash2 className="mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Membership Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 mt-1">
                    <FiDollarSign className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</h3>
                    <p className="text-base font-medium">${parseFloat(membership.price).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 mt-1">
                    <FiCalendar className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Billing Cycle</h3>
                    <p className="text-base font-medium capitalize">{membership.billing_cycle}</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 mt-1">
                    <FiClock className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Trial Period</h3>
                    <p className="text-base font-medium">
                      {membership.trial_days > 0 ? `${membership.trial_days} days` : 'No trial'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 mt-1">
                    <FiLock className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Access Type</h3>
                    <p className="text-base font-medium capitalize">{membership.access_type || 'Standard'}</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 mt-1">
                    <FiUsers className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subscribers</h3>
                    <p className="text-base font-medium">{subscribers.filter(s => s.status === 'active').length}</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 mt-1">
                    <FiCalendar className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</h3>
                    <p className="text-base font-medium">
                      {format(new Date(membership.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
              <p className="text-base">
                {membership.description || 'No description provided.'}
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Included Products</h2>
              <span className="text-sm text-gray-500">{includedProducts.length} products</span>
            </div>
            
            {productsLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : includedProducts.length > 0 ? (
              <div className="space-y-4">
                {includedProducts.map(product => (
                  <div key={product.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-md flex items-center justify-center">
                      <FiPackage className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium">{product.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{product.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">No products included in this membership.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Subscribers</h2>
              <Link to="#" className="text-sm text-primary-600 hover:underline">View all</Link>
            </div>
            
            {subscribersLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="ml-3 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : subscribers.length > 0 ? (
              <div className="space-y-4">
                {subscribers.map(subscriber => (
                  <div key={subscriber.id} className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">{subscriber.name.charAt(0)}</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">{subscriber.name}</h3>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>Joined {format(new Date(subscriber.joined), 'MMM dd, yyyy')}</span>
                        <span className="mx-1">•</span>
                        <span className={`capitalize ${
                          subscriber.status === 'active' ? 'text-green-600 dark:text-green-400' : 
                          subscriber.status === 'trial' ? 'text-blue-600 dark:text-blue-400' : 
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          {subscriber.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">No subscribers yet.</p>
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Membership Stats</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</h3>
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium">+12%</span>
                </div>
                <p className="text-2xl font-bold">$1,248.42</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Last 30 days
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversion Rate</h3>
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium">+5%</span>
                </div>
                <p className="text-2xl font-bold">24.8%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Trial to paid conversion
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Churn Rate</h3>
                  <span className="text-red-600 dark:text-red-400 text-sm font-medium">+2%</span>
                </div>
                <p className="text-2xl font-bold">7.3%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Monthly cancellation rate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
