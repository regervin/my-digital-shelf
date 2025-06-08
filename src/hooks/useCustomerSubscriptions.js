import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useCustomerSubscriptions(customerId = null, membershipId = null) {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setSubscriptions([])
      setLoading(false)
      return
    }

    async function fetchSubscriptions() {
      try {
        setLoading(true)
        
        let query = supabase
          .from('customer_subscriptions')
          .select(`
            *,
            customer:customers(*),
            membership:memberships(*)
          `)
          .eq('seller_id', user.id)
        
        // Apply filters if provided
        if (customerId) {
          query = query.eq('customer_id', customerId)
        }
        
        if (membershipId) {
          query = query.eq('membership_id', membershipId)
        }
        
        const { data, error } = await query.order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setSubscriptions(data || [])
      } catch (err) {
        console.error('Error fetching customer subscriptions:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [user, customerId, membershipId])

  const addSubscription = async (subscriptionData) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      // Verify the user owns the customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('id', subscriptionData.customer_id)
        .eq('seller_id', user.id)
        .single()
      
      if (customerError || !customerData) {
        throw new Error('Customer not found or not owned by user')
      }
      
      // Verify the user owns the membership
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('id, price')
        .eq('id', subscriptionData.membership_id)
        .eq('user_id', user.id)
        .single()
      
      if (membershipError || !membershipData) {
        throw new Error('Membership not found or not owned by user')
      }
      
      // Calculate billing dates based on membership billing cycle
      // This is a simplified example - in a real app, you'd need more complex logic
      const startDate = subscriptionData.start_date || new Date()
      let nextBillingDate = null
      let billingPeriodEnd = null
      
      // Get the membership to determine billing cycle
      const { data: membership } = await supabase
        .from('memberships')
        .select('billing_cycle, price')
        .eq('id', subscriptionData.membership_id)
        .single()
      
      if (membership) {
        const billingCycle = membership.billing_cycle
        const startDateObj = new Date(startDate)
        
        // Set default price to membership price if not specified
        if (!subscriptionData.price_paid) {
          subscriptionData.price_paid = membership.price
        }
        
        // Calculate next billing date based on billing cycle
        if (billingCycle === 'monthly') {
          nextBillingDate = new Date(startDateObj)
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
          
          billingPeriodEnd = new Date(nextBillingDate)
          billingPeriodEnd.setDate(billingPeriodEnd.getDate() - 1)
        } else if (billingCycle === 'yearly') {
          nextBillingDate = new Date(startDateObj)
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
          
          billingPeriodEnd = new Date(nextBillingDate)
          billingPeriodEnd.setDate(billingPeriodEnd.getDate() - 1)
        } else if (billingCycle === 'weekly') {
          nextBillingDate = new Date(startDateObj)
          nextBillingDate.setDate(nextBillingDate.getDate() + 7)
          
          billingPeriodEnd = new Date(nextBillingDate)
          billingPeriodEnd.setDate(billingPeriodEnd.getDate() - 1)
        }
      }
      
      const newSubscription = {
        ...subscriptionData,
        seller_id: user.id,
        start_date: startDate,
        billing_period_start: startDate,
        billing_period_end: billingPeriodEnd,
        next_billing_date: nextBillingDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .insert([newSubscription])
        .select(`
          *,
          customer:customers(*),
          membership:memberships(*)
        `)
        .single()
      
      if (error) {
        throw error
      }
      
      setSubscriptions(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      console.error('Error adding subscription:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const updateSubscription = async (id, updates) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      // Special handling for status changes
      if (updates.status === 'canceled' && !updates.canceled_at) {
        updates.canceled_at = new Date().toISOString()
      }
      
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .update(updatedData)
        .eq('id', id)
        .eq('seller_id', user.id) // Security check
        .select(`
          *,
          customer:customers(*),
          membership:memberships(*)
        `)
        .single()
      
      if (error) {
        throw error
      }
      
      setSubscriptions(prev => 
        prev.map(subscription => 
          subscription.id === id ? data : subscription
        )
      )
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating subscription:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const cancelSubscription = async (id, cancelImmediately = false) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      const updates = {
        updated_at: new Date().toISOString(),
        canceled_at: new Date().toISOString()
      }
      
      if (cancelImmediately) {
        updates.status = 'canceled'
        updates.end_date = new Date().toISOString()
      } else {
        updates.cancel_at_period_end = true
      }
      
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .update(updates)
        .eq('id', id)
        .eq('seller_id', user.id) // Security check
        .select(`
          *,
          customer:customers(*),
          membership:memberships(*)
        `)
        .single()
      
      if (error) {
        throw error
      }
      
      setSubscriptions(prev => 
        prev.map(subscription => 
          subscription.id === id ? data : subscription
        )
      )
      
      return { success: true, data }
    } catch (err) {
      console.error('Error canceling subscription:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const deleteSubscription = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      const { error } = await supabase
        .from('customer_subscriptions')
        .delete()
        .eq('id', id)
        .eq('seller_id', user.id) // Security check
      
      if (error) {
        throw error
      }
      
      setSubscriptions(prev => 
        prev.filter(subscription => subscription.id !== id)
      )
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting subscription:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const getActiveSubscriptionsForCustomer = async (customerId) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .select(`
          *,
          membership:memberships(*)
        `)
        .eq('customer_id', customerId)
        .eq('seller_id', user.id)
        .eq('status', 'active')
      
      if (error) {
        throw error
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error getting active subscriptions:', err)
      return { success: false, error: err }
    }
  }

  const getSubscriptionStats = async () => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      // Get count of active subscriptions
      const { data: activeCount, error: activeError } = await supabase
        .from('customer_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'active')
      
      if (activeError) throw activeError
      
      // Get count of canceled subscriptions
      const { data: canceledCount, error: canceledError } = await supabase
        .from('customer_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'canceled')
      
      if (canceledError) throw canceledError
      
      // Get total revenue from active subscriptions
      const { data: revenueData, error: revenueError } = await supabase
        .from('customer_subscriptions')
        .select('price_paid')
        .eq('seller_id', user.id)
        .eq('status', 'active')
      
      if (revenueError) throw revenueError
      
      const monthlyRevenue = revenueData.reduce((sum, sub) => sum + (parseFloat(sub.price_paid) || 0), 0)
      
      return { 
        success: true, 
        data: {
          activeSubscriptions: activeCount.count,
          canceledSubscriptions: canceledCount.count,
          monthlyRevenue
        }
      }
    } catch (err) {
      console.error('Error getting subscription stats:', err)
      return { success: false, error: err }
    }
  }

  return {
    subscriptions,
    loading,
    error,
    addSubscription,
    updateSubscription,
    cancelSubscription,
    deleteSubscription,
    getActiveSubscriptionsForCustomer,
    getSubscriptionStats
  }
}
