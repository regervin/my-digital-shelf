import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiFilter, FiDownload, FiEye } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export default function Sales() {
  const { user } = useAuth()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')

  useEffect(() => {
    async function fetchSales() {
      try {
        setLoading(true)
        
        // In a real app, this would be a query to your database
        // For now, we'll simulate some data
        setTimeout(() => {
          const dummySales = [
            { 
              id: 1, 
              customer: 'John Doe', 
              email: 'john.doe@example.com',
              product: 'Ultimate Web Design Course', 
              amount: 49.99, 
              date: new Date(2023, 10, 28),
              status: 'completed'
            },
            { 
              id: 2, 
              customer: 'Jane Smith', 
              email: 'jane.smith@example.com',
              product: 'Digital Marketing Ebook', 
              amount: 19.99, 
              date: new Date(2023, 10, 27),
              status: 'completed'
            },
            { 
              id: 3, 
              customer: 'Bob Johnson', 
              email: 'bob.johnson@example.com',
              product: 'Premium Membership', 
              amount: 29.99, 
              date: new Date(2023, 10, 26),
              status: 'completed'
            },
            { 
              id: 4, 
              customer: 'Alice Brown', 
              email: 'alice.brown@example.com',
              product: 'SEO Toolkit', 
              amount: 79.99, 
              date: new Date(2023, 10, 25),
              status: 'completed'
            },
            { 
              id: 5, 
              customer: 'Charlie Wilson', 
              email: 'charlie.wilson@example.com',
              product: 'Ultimate Web Design Course', 
              amount: 49.99, 
              date: new Date(2023, 10, 24),
              status: 'completed'
            },
            { 
              id: 6, 
              customer: 'David Miller', 
              email: 'david.miller@example.com',
              product: 'Content Creation Templates', 
              amount: 29.99, 
              date: new Date(2023, 10, 23),
              status: 'refunded'
            },
            { 
              id: 7, 
              customer: 'Emma Davis', 
              email: 'emma.davis@example.com',
              product: 'Digital Marketing Ebook', 
              amount: 19.99, 
              date: new Date(2023, 10, 22),
              status: 'completed'
            }
          ]
          
          setSales(dummySales)
          setLoading(false)
        }, 800)
        
      } catch (error) {
        console.error('Error fetching sales:', error)
        setLoading(false)
      }
    }
    
    fetchSales()
  }, [user])

  const filteredSales = sales
    .filter(sale => {
      // Apply search filter
      if (searchTerm && 
          !sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !sale.product.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !sale.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Apply status filter
      if (filter !== 'all' && sale.status !== filter) {
        return false
      }
      
      // Apply date range filter
      if (dateRange !== 'all') {
        const today = new Date()
        const saleDate = new Date(sale.date)
        
        if (dateRange === '7days') {
          const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7))
          if (saleDate < sevenDaysAgo) return false
        } else if (dateRange === '30days') {
          const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30))
          if (saleDate < thirtyDaysAgo) return false
        } else if (dateRange === '90days') {
          const ninetyDaysAgo = new Date(today.setDate(today.getDate() - 90))
          if (saleDate < ninetyDaysAgo) return false
        }
      }
      
      return true
    })

  // Calculate totals
  const totalSales = filteredSales.length
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.amount, 0)
  const totalRefunded = filteredSales.filter(sale => sale.status === 'refunded').length

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sales</h1>
        <button className="btn btn-outline mt-2 sm:mt-0">
          <FiDownload className="mr-2" />
          Export CSV
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Sales</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{totalSales}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">${totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Refunded</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{totalRefunded}</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by customer, email or product..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FiFilter className="mr-2 text-gray-500 dark:text-gray-400" />
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="animate-pulse">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="border-b border-gray-200 dark:border-gray-700 py-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3">{format(sale.date, 'MMM dd, yyyy')}</td>
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{sale.customer}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{sale.email}</div>
                      </div>
                    </td>
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
                      <div className="flex space-x-2">
                        <button className="text-gray-500 hover:text-primary-600">
                          <FiEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No sales found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
