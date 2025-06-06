import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiEdit2, FiTrash2, FiMail, FiUser, FiCalendar, FiDollarSign, FiPackage, FiShoppingCart } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function CustomerDetails() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [purchaseHistory, setPurchaseHistory] = useState([])
  
  useEffect(() => {
    async function fetchCustomer() {
      try {
        setLoading(true)
        
        // In a real app, this would fetch from your database
        // For now, we'll simulate some data
        setTimeout(() => {
          const dummyCustomer = {
            id: parseInt(id),
            name: 'John Doe',
            email: 'john.doe@example.com',
            purchases: 3,
            total_spent: 149.97,
            joined_at: new Date(2023, 9, 15),
            status: 'active',
            last_purchase: new Date(2023, 10, 5),
            notes: 'Interested in web design courses and resources.',
            country: 'United States',
            city: 'New York'
          }
          
          const dummyPurchaseHistory = [
            { 
              id: 1, 
              product_name: 'Ultimate Web Design Course', 
              price: 49.99, 
              purchase_date: new Date(2023, 10, 5),
              status: 'completed'
            },
            { 
              id: 2, 
              product_name: 'JavaScript Mastery eBook', 
              price: 19.99, 
              purchase_date: new Date(2023, 9, 20),
              status: 'completed'
            },
            { 
              id: 3, 
              product_name: 'UI/UX Design Templates Bundle', 
              price: 79.99, 
              purchase_date: new Date(2023, 8, 30),
              status: 'completed'
            }
          ]
          
          setCustomer(dummyCustomer)
          setPurchaseHistory(dummyPurchaseHistory)
          setLoading(false)
        }, 800)
        
      } catch (error) {
        console.error('Error fetching customer:', error)
        toast.error('Failed to load customer')
        setLoading(false)
      }
    }
    
    fetchCustomer()
  }, [id])
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        // In a real app, this would delete from your database
        // For now, we'll simulate success
        
        toast.success('Customer deleted successfully')
        navigate('/customers')
        
      } catch (error) {
        console.error('Error deleting customer:', error)
        toast.error('Failed to delete customer')
      }
    }
  }
  
  const handleSendEmail = () => {
    toast.success(`Email dialog would open for ${customer.email}`)
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">Customer ID: {customer.id}</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button onClick={handleSendEmail} className="btn btn-outline">
            <FiMail className="mr-2" />
            Email
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            <FiTrash2 className="mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</h3>
                <p className="text-gray-900 dark:text-gray-100 flex items-center">
                  <FiMail className="mr-2 text-gray-400" />
                  {customer.email}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h3>
                <p className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {customer.status}
                  </span>
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Joined</h3>
                <p className="text-gray-900 dark:text-gray-100 flex items-center">
                  <FiCalendar className="mr-2 text-gray-400" />
                  {format(customer.joined_at, 'MMM dd, yyyy')}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Purchase</h3>
                <p className="text-gray-900 dark:text-gray-100 flex items-center">
                  <FiCalendar className="mr-2 text-gray-400" />
                  {format(customer.last_purchase, 'MMM dd, yyyy')}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Location</h3>
                <p className="text-gray-900 dark:text-gray-100">
                  {customer.city}, {customer.country}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Spent</h3>
                <p className="text-gray-900 dark:text-gray-100 flex items-center">
                  <FiDollarSign className="mr-2 text-gray-400" />
                  ${customer.total_spent.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</h3>
              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                {customer.notes || 'No notes available.'}
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Purchase History</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {purchaseHistory.length} purchases
              </span>
            </div>
            
            {purchaseHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseHistory.map((purchase) => (
                      <tr key={purchase.id} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="py-3 font-medium">{purchase.product_name}</td>
                        <td className="py-3">{format(purchase.purchase_date, 'MMM dd, yyyy')}</td>
                        <td className="py-3">${purchase.price.toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            purchase.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : purchase.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {purchase.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">No purchase history available.</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Customer Summary</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Purchases</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <FiShoppingCart className="mr-2 text-primary-500" />
                  {customer.purchases}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Spent</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <FiDollarSign className="mr-2 text-primary-500" />
                  ${customer.total_spent.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Customer Since</h3>
                <p className="text-gray-900 dark:text-gray-100 flex items-center">
                  <FiCalendar className="mr-2 text-primary-500" />
                  {format(customer.joined_at, 'MMM dd, yyyy')}
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({Math.round((new Date() - customer.joined_at) / (1000 * 60 * 60 * 24))} days)
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <button onClick={handleSendEmail} className="btn btn-outline w-full justify-start">
                <FiMail className="mr-2" />
                Send Email
              </button>
              <button className="btn btn-outline w-full justify-start">
                <FiEdit2 className="mr-2" />
                Edit Customer
              </button>
              <button onClick={handleDelete} className="btn btn-danger w-full justify-start">
                <FiTrash2 className="mr-2" />
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
