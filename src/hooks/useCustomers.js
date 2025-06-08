import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useCustomers() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setCustomers([])
      setLoading(false)
      return
    }

    async function fetchCustomers() {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setCustomers(data || [])
      } catch (err) {
        console.error('Error fetching customers:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [user])

  const addCustomer = async (customerData) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      const newCustomer = {
        ...customerData,
        seller_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      setCustomers(prevCustomers => [data, ...prevCustomers])
      return { success: true, data }
    } catch (err) {
      console.error('Error adding customer:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const updateCustomer = async (id, updates) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('customers')
        .update(updatedData)
        .eq('id', id)
        .eq('seller_id', user.id) // Security check
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.id === id ? data : customer
        )
      )
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating customer:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const deleteCustomer = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('seller_id', user.id) // Security check
      
      if (error) {
        throw error
      }
      
      setCustomers(prevCustomers => 
        prevCustomers.filter(customer => customer.id !== id)
      )
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting customer:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer
  }
}
