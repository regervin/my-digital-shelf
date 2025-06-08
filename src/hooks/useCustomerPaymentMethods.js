import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useCustomerPaymentMethods(customerId = null) {
  const { user } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user || !customerId) {
      setPaymentMethods([])
      setLoading(false)
      return
    }

    async function fetchPaymentMethods() {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('customer_payment_methods')
          .select('*')
          .eq('seller_id', user.id)
          .eq('customer_id', customerId)
          .eq('status', 'active')
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setPaymentMethods(data || [])
      } catch (err) {
        console.error('Error fetching payment methods:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [user, customerId])

  const addPaymentMethod = async (paymentData) => {
    try {
      if (!user) throw new Error('User not authenticated')
      if (!customerId) throw new Error('Customer ID is required')
      
      setLoading(true)
      
      // Verify the user owns the customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('id', customerId)
        .eq('seller_id', user.id)
        .single()
      
      if (customerError || !customerData) {
        throw new Error('Customer not found or not owned by user')
      }
      
      // Format the payment method data
      const newPaymentMethod = {
        ...paymentData,
        customer_id: customerId,
        seller_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // If this is the first payment method or is_default is true, handle default logic
      if (paymentMethods.length === 0 || paymentData.is_default) {
        newPaymentMethod.is_default = true
      }
      
      const { data, error } = await supabase
        .from('customer_payment_methods')
        .insert([newPaymentMethod])
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      // Update local state
      if (data.is_default) {
        // If the new method is default, update all other methods to non-default
        setPaymentMethods(prev => 
          prev.map(method => ({
            ...method,
            is_default: false
          })).concat([data])
        )
      } else {
        setPaymentMethods(prev => [...prev, data])
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error adding payment method:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentMethod = async (id, updates) => {
    try {
      if (!user) throw new Error('User not authenticated')
      if (!customerId) throw new Error('Customer ID is required')
      
      setLoading(true)
      
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('customer_payment_methods')
        .update(updatedData)
        .eq('id', id)
        .eq('customer_id', customerId)
        .eq('seller_id', user.id) // Security check
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      // Update local state
      if (data.is_default) {
        // If this method is now default, update all other methods to non-default
        setPaymentMethods(prev => 
          prev.map(method => ({
            ...method,
            is_default: method.id === id
          }))
        )
      } else {
        setPaymentMethods(prev => 
          prev.map(method => 
            method.id === id ? data : method
          )
        )
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating payment method:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const setDefaultPaymentMethod = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated')
      if (!customerId) throw new Error('Customer ID is required')
      
      setLoading(true)
      
      const { data, error } = await supabase
        .from('customer_payment_methods')
        .update({ 
          is_default: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('customer_id', customerId)
        .eq('seller_id', user.id) // Security check
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      // Update local state - set this method as default and all others as non-default
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          is_default: method.id === id
        }))
      )
      
      return { success: true, data }
    } catch (err) {
      console.error('Error setting default payment method:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const deletePaymentMethod = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated')
      if (!customerId) throw new Error('Customer ID is required')
      
      setLoading(true)
      
      // Check if this is the default payment method
      const methodToDelete = paymentMethods.find(method => method.id === id)
      const isDefault = methodToDelete?.is_default || false
      
      // Instead of hard deleting, set status to 'deleted'
      const { error } = await supabase
        .from('customer_payment_methods')
        .update({ 
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('customer_id', customerId)
        .eq('seller_id', user.id) // Security check
      
      if (error) {
        throw error
      }
      
      // Update local state
      const updatedMethods = paymentMethods.filter(method => method.id !== id)
      
      // If we deleted the default method and there are other methods, make the first one default
      if (isDefault && updatedMethods.length > 0) {
        // Set a new default in the database
        await supabase
          .from('customer_payment_methods')
          .update({ 
            is_default: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', updatedMethods[0].id)
          .eq('customer_id', customerId)
          .eq('seller_id', user.id)
        
        // Update local state
        updatedMethods[0].is_default = true
      }
      
      setPaymentMethods(updatedMethods)
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting payment method:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const getDefaultPaymentMethod = () => {
    return paymentMethods.find(method => method.is_default) || null
  }

  return {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    updatePaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
    getDefaultPaymentMethod
  }
}
