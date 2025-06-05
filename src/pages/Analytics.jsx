import { useState, useEffect } from 'react'
import { FiBarChart2, FiDollarSign, FiUsers, FiPackage, FiTrendingUp } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function Analytics() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30days')
  
  // Sample data for charts
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: []
  })
  
  const [salesByProductData, setSalesByProductData] = useState({
    labels: [],
    datasets: []
  })
  
  const [customerData, setCustomerData] = useState({
    labels: [],
    datasets: []
  })

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoading(true)
        
        // In a real app, this would be a query to your database
        // For now, we'll simulate some data
        
        // Generate dates for the last 30 days
        const dates = Array.from({ length: 30 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (29 - i))
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        })
        
        // Generate random revenue data
        const revenueValues = Array.from({ length: 30 }, () => Math.floor(Math.random() * 200) + 50)
        const cumulativeRevenue = revenueValues.reduce((acc, val, i) => {
          if (i === 0) return [val]
          return [...acc, acc[i-1] + val]
        }, [])
        
        setRevenueData({
          labels: dates,
          datasets: [
            {
              label: 'Daily Revenue',
              data: revenueValues,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.3,
            },
            {
              label: 'Cumulative Revenue',
              data: cumulativeRevenue,
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              tension: 0.3,
            }
          ]
        })
        
        // Sales by product data
        setSalesByProductData({
          labels: ['Web Design Course', 'Marketing Ebook', 'SEO Toolkit', 'Templates', 'Graphics Pack'],
          datasets: [
            {
              label: 'Sales by Product',
              data: [24, 37, 18, 45, 15],
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
              ],
              borderWidth: 1,
            }
          ]
        })
        
        // Customer acquisition data
        setCustomerData({
          labels: dates,
          datasets: [
            {
              label: 'New Customers',
              data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 3) + 1),
              backgroundColor: 'rgba(153, 102, 255, 0.7)',
            }
          ]
        })
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching analytics data:', error)
        setLoading(false)
      }
    }
    
    fetchAnalyticsData()
  }, [user, dateRange])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        
        <select
          className="mt-2 sm:mt-0 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</h3>
            <FiDollarSign className="text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">$3,249.99</p>
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
            <FiTrendingUp className="mr-1" />
            +12.5% from last period
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</h3>
            <FiBarChart2 className="text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">124</p>
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
            <FiTrendingUp className="mr-1" />
            +8.3% from last period
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customers</h3>
            <FiUsers className="text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">28</p>
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
            <FiTrendingUp className="mr-1" />
            +15.2% from last period
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Order Value</h3>
            <FiPackage className="text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">$26.21</p>
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            -2.1% from last period
          </p>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Revenue Over Time</h2>
              <div className="h-64">
                <Line data={revenueData} options={chartOptions} />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">New Customers</h2>
              <div className="h-64">
                <Bar data={customerData} options={chartOptions} />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Sales by Product</h2>
              <div className="h-64">
                <Doughnut data={salesByProductData} options={chartOptions} />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversion Rate</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">3.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Repeat Customers</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">28.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '28.5%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Refund Rate</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">1.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '1.2%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Open Rate</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">42.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '42.8%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
