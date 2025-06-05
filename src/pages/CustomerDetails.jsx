import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiMail, FiPackage, FiDollarSign, FiCalendar, FiClock, FiShoppingBag, FiUser, FiActivity } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function CustomerDetails() {
  const { user } = useAuth()
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [activityLog, setActivityLog] = useState([])

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
            last_purchase: new Date(2023, 10, 20),
            notes: 'Interested in web design courses and development tools.'
          }
          
          setCustomer(dummyCustomer)
          
          // Simulate purchase history
          const dummyPurchases = [
            {
              id: 101,
              product_name: 'Ultimate Web Design Course',
              product_id: 1,
              price: 49.99,
              purchase_date: new Date(2023, 10, 20),
              status: 'completed'
            },
            {
              id: 102,
              product_name: 'JavaScript Mastery',
              product_id: 2,
              price: 39.99,
              purchase_date: new Date(2023, 10, 5),
              status: 'completed'
            },
            {
              id: 103,
              product_name: 'React for Beginners',
              product_id: 3,
              price: 59.99,
              purchase_date: new Date(2023, 9, 28),
              status: 'completed'
            }
          ]
          setPurchases(dummyPurchases)
          
          // Simulate activity log
          const dummyActivityLog = [
            {
              id: 1,
              type: 'purchase',
              description: 'Purchased Ultimate Web Design Course',
              date: new Date(2023, 10, 20)
            },
            {
              id: 2,
              type: 'login',
              description: 'Logged in to account',
              date: new Date(2023, 10, 20)
            },
            {
              id: 3,
              type: 'purchase',
              description: 'Purchased JavaScript Mastery',
              date: new Date(2023, 10, 5)
            },
            {
              id: 4,
              type: 'download',
              description: 'Downloaded JavaScript Mastery',
              date: new Date(2023, 10, 5)
            },
            {
              id: 5,
              type: 'purchase',
              description: 'Purchased React for Beginners',
              date: new Date(2023, 9, 28)
            }
          ]
          setActivityLog(dummyActivityLog)
          
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
  
  const sendEmail = () => {
    // In a real app, this would open an email composer or modal
    toast.success('Email composer opened')
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
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Customer Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The customer you're looking for doesn't exist or has been removed.</p>
        <Link to="/customers" className="btn btn-primary">
          Back to Customers
        </Link>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{customer.name}</h1>
        <div className="flex space-x-3 mt-3 sm:mt-0">
          <button 
            onClick={sendEmail}
            className="btn btn-primary btn-sm"
          >
            <FiMail className="mr-2" />
            Send Email
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <FiUser className="mr-2 text-primary-600" />
              Customer Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</h3>
                <p className="text-gray-900 dark:text-gray-100">{customer.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  customer.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {customer.status}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Joined</h3>
                <p className="text-gray-900 dark:text-gray-100">{format(customer.joined_at, 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Purchase</h3>
                <p className="text-gray-900 dark:text-gray-100">{format(customer.last_purchase, 'MMM dd, yyyy')}</p>
              </div>
            </div>
            
            {customer.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</h3>
                <p className="text-gray-600 dark:text-gray-400">{customer.notes}</p>
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <FiShoppingBag className="mr-2 text-primary-600" />
              Purchase History
            </h2>
            
            {purchases.length > 0 ? (
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
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="py-3 font-medium">
                          <Link to={`/products/${purchase.product_id}`} className="hover:text-primary-600">
                            {purchase.product_name}
                          </Link>
                        </td>
                        <td className="py-3">{format(purchase.purchase_date, 'MMM dd, yyyy')}</td>
                        <td className="py-3">${purchase.price.toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            purchase.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
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
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">No purchase history available.</p>
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <FiActivity className="mr-2 text-primary-600" />
              Activity Log
            </h2>
            
            {activityLog.length > 0 ? (
              <div className="space-y-4">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="flex">
                    <div className="mr-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'purchase' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                          : activity.type === 'login' 
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                      }`}>
                        {activity.type === 'purchase' ? (
                          <FiShoppingBag size={16} />
                        ) : activity.type === 'login' ? (
                          <FiUser size={16} />
                        ) : (
                          <FiPackage size={16} />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-gray-100">{activity.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(activity.date, 'MMM dd, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">No activity recorded yet.</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <FiDollarSign className="mr-2 text-primary-600" />
              Customer Value
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold">${customer.total_spent.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Purchases</p>
                <p className="text-2xl font-bold">{customer.purchases}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Order Value</p>
                <p className="text-2xl font-bold">
                  ${(customer.total_spent / customer.purchases).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium mb-4">Recommended Products</h2>
            
            <div className="space-y-4">
              {[
                { id: 4, name: 'Advanced CSS Techniques', price: 29.99 },
                { id: 5, name: 'UI/UX Design Principles', price: 39.99 },
                { id: 6, name: 'Full Stack Development', price: 69.99 }
              ].map((product) => (
                <div key={product.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <Link to={`/products/${product.id}`} className="font-medium hover:text-primary-600">
                    {product.name}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
