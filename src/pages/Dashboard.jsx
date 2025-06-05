import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { FiPackage, FiUsers, FiDollarSign, FiTrendingUp, FiDownload, FiCreditCard } from 'react-icons/fi'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    sales: 0,
    revenue: 0,
    memberships: 0
  })
  const [recentSales, setRecentSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        
        // In a real app, these would be actual queries to your database
        // For now, we'll simulate some data
        
        // Simulate fetching stats
        setTimeout(() => {
          setStats({
            products: 5,
            customers: 28,
            sales: 124,
            revenue: 3249.99,
            memberships: 2
          })
        }, 500)
        
        // Simulate fetching recent sales
        setTimeout(() => {
          setRecentSales([
            { id: 1, customer: 'John Doe', product: 'Ultimate Web Design Course', amount: 49.99, date: new Date(2023, 10, 28) },
            { id: 2, customer: 'Jane Smith', product: 'Digital Marketing Ebook', amount: 19.99, date: new Date(2023, 10, 27) },
            { id: 3, customer: 'Bob Johnson', product: 'Premium Membership', amount: 29.99, date: new Date(2023, 10, 26) },
            { id: 4, customer: 'Alice Brown', product: 'SEO Toolkit', amount: 79.99, date: new Date(2023, 10, 25) },
            { id: 5, customer: 'Charlie Wilson', product: 'Ultimate Web Design Course', amount: 49.99, date: new Date(2023, 10, 24) }
          ])
          setLoading(false)
        }, 800)
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [user])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/products/create" className="btn btn-primary">
            <FiPackage className="mr-2" />
            Add Product
          </Link>
          <Link to="/memberships/create" className="btn btn-outline">
            <FiCreditCard className="mr-2" />
            Create Membership
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Products</h3>
              <FiPackage className="text-primary-500 text-xl" />
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.products}</p>
            <Link to="/products" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
              View all products
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Customers</h3>
              <FiUsers className="text-primary-500 text-xl" />
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.customers}</p>
            <Link to="/customers" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
              View all customers
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Memberships</h3>
              <FiCreditCard className="text-primary-500 text-xl" />
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.memberships}</p>
            <Link to="/memberships" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
              View all memberships
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Total Sales</h3>
              <FiDollarSign className="text-primary-500 text-xl" />
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.sales}</p>
            <Link to="/sales" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
              View all sales
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Revenue</h3>
              <FiTrendingUp className="text-primary-500 text-xl" />
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">${stats.revenue.toFixed(2)}</p>
            <Link to="/analytics" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
              View analytics
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Downloads</h3>
              <FiDownload className="text-primary-500 text-xl" />
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">187</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last 30 days
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
        
        {loading ? (
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-gray-200 dark:border-gray-700 py-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3">{sale.customer}</td>
                    <td className="py-3">{sale.product}</td>
                    <td className="py-3">${sale.amount.toFixed(2)}</td>
                    <td className="py-3">{format(sale.date, 'MMM dd, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 py-4">No sales yet.</p>
        )}
        
        <div className="mt-4">
          <Link to="/sales" className="text-primary-600 hover:underline text-sm">
            View all sales →
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/products/create" className="btn btn-primary">
              Add New Product
            </Link>
            <Link to="/memberships/create" className="btn btn-outline">
              Create Membership
            </Link>
            <Link to="/customers" className="btn btn-outline">
              View Customers
            </Link>
            <Link to="/analytics" className="btn btn-outline">
              View Analytics
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Tips & Resources</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 p-1 rounded mr-2">
                <FiPackage className="h-4 w-4" />
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                <a href="#" className="text-primary-600 hover:underline">How to create your first digital product</a>
              </span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 p-1 rounded mr-2">
                <FiUsers className="h-4 w-4" />
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                <a href="#" className="text-primary-600 hover:underline">Growing your customer base</a>
              </span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 p-1 rounded mr-2">
                <FiDollarSign className="h-4 w-4" />
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                <a href="#" className="text-primary-600 hover:underline">Pricing strategies for digital products</a>
              </span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 p-1 rounded mr-2">
                <FiCreditCard className="h-4 w-4" />
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                <a href="#" className="text-primary-600 hover:underline">Setting up recurring memberships</a>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
