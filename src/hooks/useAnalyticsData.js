import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useAnalyticsData(dateRange = '30days') {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analyticsData, setAnalyticsData] = useState({
    revenueData: {
      labels: [],
      datasets: []
    },
    salesByProductData: {
      labels: [],
      datasets: []
    },
    customerData: {
      labels: [],
      datasets: []
    },
    metrics: {
      totalRevenue: 0,
      totalSales: 0,
      customers: 0,
      avgOrderValue: 0,
      conversionRate: 0,
      repeatCustomers: 0,
      refundRate: 0,
      emailOpenRate: 0
    }
  })

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    async function fetchAnalyticsData() {
      try {
        setLoading(true)
        console.log('Fetching analytics data for date range:', dateRange)
        
        // Calculate date range
        const now = new Date()
        let startDate = new Date()
        
        switch (dateRange) {
          case '7days':
            startDate.setDate(now.getDate() - 7)
            break
          case '30days':
            startDate.setDate(now.getDate() - 30)
            break
          case '90days':
            startDate.setDate(now.getDate() - 90)
            break
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1)
            break
          default:
            startDate.setDate(now.getDate() - 30)
        }
        
        startDate = startDate.toISOString()
        console.log('Date range:', startDate, 'to', now.toISOString())
        
        // Generate dates for the selected range
        const days = getDaysBetweenDates(startDate, now.toISOString())
        const dates = days.map(date => 
          date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        )
        
        // Initialize data structures
        let revenueData = {
          labels: dates,
          datasets: [
            {
              label: 'Daily Revenue',
              data: Array(dates.length).fill(0),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.3,
            },
            {
              label: 'Cumulative Revenue',
              data: Array(dates.length).fill(0),
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              tension: 0.3,
            }
          ]
        }
        
        let salesByProductData = {
          labels: [],
          datasets: [
            {
              label: 'Sales by Product',
              data: [],
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
        }
        
        let customerData = {
          labels: dates,
          datasets: [
            {
              label: 'New Customers',
              data: Array(dates.length).fill(0),
              backgroundColor: 'rgba(153, 102, 255, 0.7)',
            }
          ]
        }
        
        let metrics = {
          totalRevenue: 0,
          totalSales: 0,
          customers: 0,
          avgOrderValue: 0,
          conversionRate: 0,
          repeatCustomers: 0,
          refundRate: 0,
          emailOpenRate: 0
        }
        
        // Get revenue data by day - using price instead of amount
        const { data: revenueByDay, error: revenueError } = await supabase
          .from('memberships')
          .select('created_at, price')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gte('created_at', startDate)
          .order('created_at', { ascending: true })
        
        if (revenueError) {
          console.error('Error fetching revenue data:', revenueError)
          throw new Error(`Failed to fetch revenue data: ${revenueError.message}`)
        }
        
        console.log('Revenue data fetched:', revenueByDay?.length || 0, 'records')
        
        // Process revenue data if available
        if (revenueByDay && revenueByDay.length > 0) {
          const dailyRevenue = processDailyData(revenueByDay, days, 'price')
          const cumulativeRevenue = calculateCumulativeValues(dailyRevenue)
          
          revenueData.datasets[0].data = dailyRevenue
          revenueData.datasets[1].data = cumulativeRevenue
          
          // Calculate revenue metrics
          metrics.totalRevenue = revenueByDay.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
          metrics.totalSales = revenueByDay.length
          metrics.avgOrderValue = metrics.totalSales > 0 ? metrics.totalRevenue / metrics.totalSales : 0
        }
        
        // Get sales by product - using price instead of amount
        const { data: productSales, error: productError } = await supabase
          .from('memberships')
          .select(`
            price,
            product:product_id(id, name)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gte('created_at', startDate)
        
        if (productError) {
          console.error('Error fetching product sales data:', productError)
        } else if (productSales && productSales.length > 0) {
          console.log('Product sales data fetched:', productSales.length, 'records')
          
          // Group sales by product
          const salesByProduct = {}
          
          productSales.forEach(sale => {
            if (sale.product && sale.product.name) {
              const productName = sale.product.name
              if (!salesByProduct[productName]) {
                salesByProduct[productName] = 0
              }
              salesByProduct[productName] += 1
            }
          })
          
          const productNames = Object.keys(salesByProduct)
          const productSalesData = productNames.map(name => salesByProduct[name])
          
          if (productNames.length > 0) {
            salesByProductData.labels = productNames
            salesByProductData.datasets[0].data = productSalesData
          }
        }
        
        // Get customer acquisition data
        const { data: newCustomers, error: customerError } = await supabase
          .from('customers')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .order('created_at', { ascending: true })
        
        if (customerError) {
          console.error('Error fetching customer data:', customerError)
        } else if (newCustomers && newCustomers.length > 0) {
          console.log('Customer data fetched:', newCustomers.length, 'records')
          
          // Process customer data
          const dailyCustomers = processDailyData(newCustomers, days, 'count')
          customerData.datasets[0].data = dailyCustomers
        }
        
        // Get total customer count
        const { count, error: countError } = await supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
        
        if (!countError) {
          metrics.customers = count || 0
        }
        
        // Calculate conversion rate (if we have page views data)
        const { data: pageViews, error: pageViewsError } = await supabase
          .from('page_views')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startDate)
        
        if (!pageViewsError && pageViews && metrics.totalSales > 0) {
          const viewCount = pageViews.length || 0
          metrics.conversionRate = viewCount > 0 ? (metrics.totalSales / viewCount) * 100 : 0
        }
        
        // Calculate repeat customer rate
        const { data: repeatData, error: repeatError } = await supabase
          .from('customers')
          .select('id, purchase_count')
          .eq('user_id', user.id)
          .gt('purchase_count', 1)
        
        if (!repeatError && repeatData) {
          metrics.repeatCustomers = metrics.customers > 0 
            ? (repeatData.length / metrics.customers) * 100 
            : 0
        }
        
        // Calculate refund rate
        const { data: refunds, error: refundError } = await supabase
          .from('memberships')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'refunded')
          .gte('created_at', startDate)
        
        if (!refundError && refunds) {
          const refundCount = refunds.length || 0
          metrics.refundRate = metrics.totalSales > 0 
            ? (refundCount / (metrics.totalSales + refundCount)) * 100 
            : 0
        }
        
        // Calculate email open rate
        const { data: emailData, error: emailError } = await supabase
          .from('email_campaigns')
          .select('sent_count, open_count')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
        
        if (!emailError && emailData && emailData.length > 0) {
          const totalSent = emailData.reduce((sum, item) => sum + (item.sent_count || 0), 0)
          const totalOpened = emailData.reduce((sum, item) => sum + (item.open_count || 0), 0)
          
          metrics.emailOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
        }
        
        console.log('Setting real analytics data')
        // Set analytics data
        setAnalyticsData({
          revenueData,
          salesByProductData,
          customerData,
          metrics
        })
      } catch (err) {
        console.error('Error fetching analytics data:', err)
        setError(err)
        
        // Set empty data instead of mock data
        setAnalyticsData({
          revenueData: {
            labels: [],
            datasets: [
              {
                label: 'Daily Revenue',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.3,
              },
              {
                label: 'Cumulative Revenue',
                data: [],
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                tension: 0.3,
              }
            ]
          },
          salesByProductData: {
            labels: [],
            datasets: [
              {
                label: 'Sales by Product',
                data: [],
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
          },
          customerData: {
            labels: [],
            datasets: [
              {
                label: 'New Customers',
                data: [],
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
              }
            ]
          },
          metrics: {
            totalRevenue: 0,
            totalSales: 0,
            customers: 0,
            avgOrderValue: 0,
            conversionRate: 0,
            repeatCustomers: 0,
            refundRate: 0,
            emailOpenRate: 0
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [user, dateRange])

  // Helper function to get days between two dates
  function getDaysBetweenDates(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = []
    
    // Set to beginning of day
    start.setHours(0, 0, 0, 0)
    
    // Clone start date
    const current = new Date(start)
    
    // Add each day until we reach end date
    while (current <= end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  // Helper function to process daily data
  function processDailyData(data, days, valueKey) {
    // Initialize array with zeros for each day
    const dailyValues = Array(days.length).fill(0)
    
    // For each data point, find the corresponding day and add the value
    data.forEach(item => {
      const itemDate = new Date(item.created_at)
      itemDate.setHours(0, 0, 0, 0)
      
      const dayIndex = days.findIndex(day => 
        day.getFullYear() === itemDate.getFullYear() &&
        day.getMonth() === itemDate.getMonth() &&
        day.getDate() === itemDate.getDate()
      )
      
      if (dayIndex !== -1) {
        if (valueKey === 'count') {
          dailyValues[dayIndex] += 1
        } else {
          dailyValues[dayIndex] += parseFloat(item[valueKey]) || 0
        }
      }
    })
    
    return dailyValues
  }

  // Helper function to calculate cumulative values
  function calculateCumulativeValues(values) {
    return values.reduce((acc, val, i) => {
      if (i === 0) return [val]
      return [...acc, acc[i-1] + val]
    }, [])
  }

  return {
    analyticsData,
    loading,
    error
  }
}
