import { useState, useEffect } from 'react'
import { FiBarChart2, FiDollarSign, FiUsers, FiPackage, FiTrendingUp, FiLoader, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { useAnalyticsData } from '../hooks/useAnalyticsData'
import { formatCurrency } from '../utils/formatters'
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
  const [dateRange, setDateRange] = useState('30days')
  const { analyticsData, loading, error } = useAnalyticsData(dateRange)
  
  useEffect(() => {
    console.log('Analytics component rendered with date range:', dateRange)
    console.log('Current analytics data:', analyticsData)
  }, [analyticsData, dateRange])
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <div className="flex items-center">
          <FiAlertCircle className="mr-2" size={20} />
          <div>
            <p className="font-bold">Error loading analytics data</p>
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  const hasData = analyticsData.revenueData.labels.length > 0 || 
                  analyticsData.salesByProductData.labels.length > 0 ||
                  analyticsData.customerData.labels.length > 0

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
      
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <FiLoader className="animate-spin text-primary-500 mr-2" size={24} />
          <span>Loading analytics data...</span>
        </div>
      ) : !hasData ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" size={20} />
            <div>
              <p className="font-bold">No analytics data available</p>
              <p>There is no data available for the selected time period. Try a different date range or add some products and sales to see analytics.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</h3>
                <FiDollarSign className="text-primary-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(analyticsData.metrics.totalRevenue)}
              </p>
              {analyticsData.metrics.totalRevenue > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                  <FiTrendingUp className="mr-1" />
                  For selected period
                </p>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</h3>
                <FiBarChart2 className="text-primary-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {analyticsData.metrics.totalSales}
              </p>
              {analyticsData.metrics.totalSales > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                  <FiTrendingUp className="mr-1" />
                  For selected period
                </p>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customers</h3>
                <FiUsers className="text-primary-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {analyticsData.metrics.customers}
              </p>
              {analyticsData.metrics.customers > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                  <FiTrendingUp className="mr-1" />
                  Total customers
                </p>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Order Value</h3>
                <FiPackage className="text-primary-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(analyticsData.metrics.avgOrderValue)}
              </p>
              {analyticsData.metrics.avgOrderValue > 0 && (
                <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center mt-1">
                  <FiTrendingUp className="mr-1" />
                  For selected period
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Revenue Over Time</h2>
              {analyticsData.revenueData.labels.length > 0 ? (
                <div className="h-64">
                  <Line data={analyticsData.revenueData} options={chartOptions} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No revenue data available for this period
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">New Customers</h2>
              {analyticsData.customerData.labels.length > 0 ? (
                <div className="h-64">
                  <Bar data={analyticsData.customerData} options={chartOptions} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No customer data available for this period
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Sales by Product</h2>
              {analyticsData.salesByProductData.labels.length > 0 ? (
                <div className="h-64">
                  <Doughnut data={analyticsData.salesByProductData} options={chartOptions} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No product sales data available for this period
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversion Rate</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {analyticsData.metrics.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(analyticsData.metrics.conversionRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Repeat Customers</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {analyticsData.metrics.repeatCustomers.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(analyticsData.metrics.repeatCustomers, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Refund Rate</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {analyticsData.metrics.refundRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-red-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(analyticsData.metrics.refundRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Open Rate</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {analyticsData.metrics.emailOpenRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(analyticsData.metrics.emailOpenRate, 100)}%` }}
                    ></div>
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
