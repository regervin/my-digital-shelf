import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiBox, FiUsers, FiDollarSign, FiCreditCard, FiArrowUp, FiArrowDown, FiPlus } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format, subDays } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalSales: 0,
    totalRevenue: 0,
    recentSales: []
  })

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        
        if (!user) return
        
        // Fetch products count
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
        
        if (productsError) throw productsError
        
        // Fetch customers count
        const { count: customersCount, error: customersError } = await supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
        
        if (customersError) throw customersError
        
        // Fetch sales data
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select(`
            id,
            amount,
            status,
            created_at,
            customer_id,
            product_id,
            membership_id,
            customers(name),
            products(name),
            memberships(name)
          `)
          .order('created_at', { ascending: false })
        
        if (salesError) throw salesError
        
        // Process sales data
        const totalSales = salesData.length
        const totalRevenue = salesData.reduce((sum, sale) => {
          return sale.status === 'completed' ? sum + parseFloat(sale.amount) : sum
        }, 0)
        
        // Format recent sales for display
        const recentSales = salesData.slice(0, 5).map(sale => ({
          id: sale.id,
          customer: sale.customers?.name || 'Unknown Customer',
          product: sale.products?.name || sale.memberships?.name || 'Unknown Product',
          amount: parseFloat(sale.amount),
          date: new Date(sale.created_at),
          status: sale.status
        }))
        
        setStats({
          totalProducts: productsCount || 0,
          totalCustomers: customersCount || 0,
          totalSales,
          totalRevenue,
          recentSales
        })
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [user])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
              <p className="text-2xl font-bold mt-1">{loading ? '...' : stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <FiBox className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/products" className="text-sm text-primary-600 dark:text-primary-400 font-medium">
              View all products
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Customers</p>
              <p className="text-2xl font-bold mt-1">{loading ? '...' : stats.totalCustomers}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FiUsers className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/customers" className="text-sm text-primary-600 dark:text-primary-400 font-medium">
              View all customers
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</p>
              <p className="text-2xl font-bold mt-1">{loading ? '...' : stats.totalSales}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <FiDollarSign className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/sales" className="text-sm text-primary-600 dark:text-primary-400 font-medium">
              View all sales
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">{loading ? '...' : `$${stats.totalRevenue.toFixed(2)}`}</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <FiCreditCard className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/sales" className="text-sm text-primary-600 dark:text-primary-400 font-medium">
              View revenue details
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Sales</h2>
            <Link to="/sales/create" className="btn btn-sm btn-outline">
              <FiPlus className="mr-1" /> New Sale
            </Link>
          </div>
          
          {loading ? (
            <div className="animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-gray-200 dark:border-gray-700 py-4">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : stats.recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSales.map((sale) => (
                    <tr key={sale.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="py-3 font-medium">{sale.customer}</td>
                      <td className="py-3">{sale.product}</td>
                      <td className="py-3">${sale.amount.toFixed(2)}</td>
                      <td className="py-3">{format(sale.date, 'MMM dd')}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sale.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-4 text-center">
                <Link to="/sales" className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                  View all sales
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No sales recorded yet.</p>
              <Link to="/sales/create" className="btn btn-primary">
                <FiPlus className="mr-2" />
                Record Your First Sale
              </Link>
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          
          <div className="space-y-3">
            <Link to="/products/create" className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg mr-3">
                <FiBox className="text-primary-600 dark:text-primary-400" size={20} />
              </div>
              <div>
                <p className="font-medium">Add New Product</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create a digital product to sell</p>
              </div>
            </Link>
            
            <Link to="/customers/create" className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-3">
                <FiUsers className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <p className="font-medium">Add New Customer</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create a customer profile</p>
              </div>
            </Link>
            
            <Link to="/sales/create" className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg mr-3">
                <FiDollarSign className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <div>
                <p className="font-medium">Record a Sale</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add a new sales transaction</p>
              </div>
            </Link>
            
            <Link to="/memberships/create" className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg mr-3">
                <FiCreditCard className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
              <div>
                <p className="font-medium">Create Membership</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Set up a recurring membership</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
