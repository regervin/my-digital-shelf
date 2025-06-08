import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useAccessRecords(customerId = null, productId = null, membershipId = null) {
  const { user } = useAuth()
  const [accessRecords, setAccessRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setAccessRecords([])
      setLoading(false)
      return
    }

    async function fetchAccessRecords() {
      try {
        setLoading(true)
        
        let query = supabase
          .from('access_records')
          .select(`
            *,
            customer:customers(*),
            product:products(*),
            membership:memberships(*)
          `)
          .eq('seller_id', user.id)
        
        // Apply filters if provided
        if (customerId) {
          query = query.eq('customer_id', customerId)
        }
        
        if (productId) {
          query = query.eq('product_id', productId)
        }
        
        if (membershipId) {
          query = query.eq('membership_id', membershipId)
        }
        
        const { data, error } = await query.order('access_date', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setAccessRecords(data || [])
      } catch (err) {
        console.error('Error fetching access records:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAccessRecords()
  }, [user, customerId, productId, membershipId])

  const recordAccess = async (accessData) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      // Validate that either product_id OR membership_id is provided, but not both
      if ((!accessData.product_id && !accessData.membership_id) || 
          (accessData.product_id && accessData.membership_id)) {
        throw new Error('Either product_id OR membership_id must be provided, but not both')
      }
      
      // Verify the user owns the customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('id', accessData.customer_id)
        .eq('seller_id', user.id)
        .single()
      
      if (customerError || !customerData) {
        throw new Error('Customer not found or not owned by user')
      }
      
      // Verify the user owns the product (if provided)
      if (accessData.product_id) {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('id, download_limit')
          .eq('id', accessData.product_id)
          .eq('user_id', user.id)
          .single()
        
        if (productError || !productData) {
          throw new Error('Product not found or not owned by user')
        }
        
        // Check if download limit has been reached
        if (accessData.access_type === 'download' && productData.download_limit) {
          const { count, error: countError } = await supabase
            .from('access_records')
            .select('id', { count: 'exact', head: true })
            .eq('customer_id', accessData.customer_id)
            .eq('product_id', accessData.product_id)
            .eq('access_type', 'download')
            .eq('access_status', 'success')
          
          if (countError) {
            throw countError
          }
          
          if (count >= productData.download_limit) {
            throw new Error('Download limit reached for this product')
          }
        }
      }
      
      // Verify the user owns the membership (if provided)
      if (accessData.membership_id) {
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .select('id')
          .eq('id', accessData.membership_id)
          .eq('user_id', user.id)
          .single()
        
        if (membershipError || !membershipData) {
          throw new Error('Membership not found or not owned by user')
        }
        
        // Check if customer has an active subscription to this membership
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('customer_subscriptions')
          .select('id')
          .eq('customer_id', accessData.customer_id)
          .eq('membership_id', accessData.membership_id)
          .eq('status', 'active')
          .single()
        
        if (subscriptionError || !subscriptionData) {
          throw new Error('Customer does not have an active subscription to this membership')
        }
      }
      
      // Get client IP and user agent if not provided
      if (!accessData.ip_address && typeof window !== 'undefined') {
        // In a real app, you'd get this from the server
        // This is just a placeholder
        accessData.ip_address = '127.0.0.1'
      }
      
      if (!accessData.user_agent && typeof window !== 'undefined') {
        accessData.user_agent = window.navigator.userAgent
      }
      
      const newAccessRecord = {
        ...accessData,
        seller_id: user.id,
        access_date: accessData.access_date || new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('access_records')
        .insert([newAccessRecord])
        .select(`
          *,
          customer:customers(*),
          product:products(*),
          membership:memberships(*)
        `)
        .single()
      
      if (error) {
        throw error
      }
      
      setAccessRecords(prev => [data, ...prev])
      
      // If this is a product download, update the product's total_sales count
      if (accessData.product_id && accessData.access_type === 'download' && accessData.access_status === 'success') {
        await supabase
          .from('products')
          .update({ 
            total_sales: supabase.rpc('increment', { x: 1 }),
            updated_at: new Date().toISOString()
          })
          .eq('id', accessData.product_id)
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error recording access:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const getAccessStats = async (period = 'all') => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      let query = supabase
        .from('access_records')
        .select('access_date, access_type, product_id, membership_id')
        .eq('seller_id', user.id)
        .eq('access_status', 'success')
      
      // Filter by time period
      if (period === 'today') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        query = query.gte('access_date', today.toISOString())
      } else if (period === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        query = query.gte('access_date', weekAgo.toISOString())
      } else if (period === 'month') {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        query = query.gte('access_date', monthAgo.toISOString())
      }
      
      const { data, error } = await query
      
      if (error) {
        throw error
      }
      
      // Calculate statistics
      const stats = {
        totalAccesses: data.length,
        productDownloads: data.filter(record => 
          record.product_id && record.access_type === 'download'
        ).length,
        membershipAccesses: data.filter(record => 
          record.membership_id
        ).length,
        // Group by day for time-series data
        dailyAccesses: {}
      }
      
      // Process time-series data
      data.forEach(record => {
        const date = new Date(record.access_date).toISOString().split('T')[0]
        if (!stats.dailyAccesses[date]) {
          stats.dailyAccesses[date] = {
            total: 0,
            productDownloads: 0,
            membershipAccesses: 0
          }
        }
        
        stats.dailyAccesses[date].total++
        
        if (record.product_id && record.access_type === 'download') {
          stats.dailyAccesses[date].productDownloads++
        }
        
        if (record.membership_id) {
          stats.dailyAccesses[date].membershipAccesses++
        }
      })
      
      return { success: true, data: stats }
    } catch (err) {
      console.error('Error getting access stats:', err)
      return { success: false, error: err }
    }
  }

  const getCustomerAccessHistory = async (customerId) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('access_records')
        .select(`
          *,
          product:products(id, name, type),
          membership:memberships(id, name)
        `)
        .eq('customer_id', customerId)
        .eq('seller_id', user.id)
        .order('access_date', { ascending: false })
      
      if (error) {
        throw error
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error getting customer access history:', err)
      return { success: false, error: err }
    }
  }

  const getProductAccessHistory = async (productId) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('access_records')
        .select(`
          *,
          customer:customers(id, name, email)
        `)
        .eq('product_id', productId)
        .eq('seller_id', user.id)
        .order('access_date', { ascending: false })
      
      if (error) {
        throw error
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error getting product access history:', err)
      return { success: false, error: err }
    }
  }

  const getMembershipAccessHistory = async (membershipId) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('access_records')
        .select(`
          *,
          customer:customers(id, name, email)
        `)
        .eq('membership_id', membershipId)
        .eq('seller_id', user.id)
        .order('access_date', { ascending: false })
      
      if (error) {
        throw error
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error getting membership access history:', err)
      return { success: false, error: err }
    }
  }

  return {
    accessRecords,
    loading,
    error,
    recordAccess,
    getAccessStats,
    getCustomerAccessHistory,
    getProductAccessHistory,
    getMembershipAccessHistory
  }
}
