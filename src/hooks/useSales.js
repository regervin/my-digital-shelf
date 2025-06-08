import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useSales() {
  const { user } = useAuth()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setSales([])
      setLoading(false)
      return
    }

    async function fetchSales() {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('sales')
          .select(`
            *,
            product:products(*),
            membership:memberships(*),
            customer:customers(*)
          `)
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setSales(data || [])
      } catch (err) {
        console.error('Error fetching sales:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [user])

  const addSale = async (saleData) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      const newSale = {
        ...saleData,
        seller_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('sales')
        .insert([newSale])
        .select(`
          *,
          product:products(*),
          membership:memberships(*),
          customer:customers(*)
        `)
        .single()
      
      if (error) {
        throw error
      }
      
      setSales(prevSales => [data, ...prevSales])
      return { success: true, data }
    } catch (err) {
      console.error('Error adding sale:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const updateSale = async (id, updates) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('sales')
        .update(updatedData)
        .eq('id', id)
        .eq('seller_id', user.id) // Security check
        .select(`
          *,
          product:products(*),
          membership:memberships(*),
          customer:customers(*)
        `)
        .single()
      
      if (error) {
        throw error
      }
      
      setSales(prevSales => 
        prevSales.map(sale => 
          sale.id === id ? data : sale
        )
      )
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating sale:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const deleteSale = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)
        .eq('seller_id', user.id) // Security check
      
      if (error) {
        throw error
      }
      
      setSales(prevSales => 
        prevSales.filter(sale => sale.id !== id)
      )
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting sale:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  return {
    sales,
    loading,
    error,
    addSale,
    updateSale,
    deleteSale
  }
}
