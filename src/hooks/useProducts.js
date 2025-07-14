import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useProducts() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setProducts([])
      setLoading(false)
      return
    }

    async function fetchProducts() {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setProducts(data || [])
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [user])

  const getProduct = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      // Validate that id is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        throw new Error(`Invalid product ID format: ${id}`)
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id) // Security check
        .single()
      
      if (error) {
        throw error
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching product:', err)
      return { success: false, error: err }
    }
  }

  const addProduct = async (productData) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      const newProduct = {
        ...productData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      setProducts(prevProducts => [data, ...prevProducts])
      return { success: true, data }
    } catch (err) {
      console.error('Error adding product:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const updateProduct = async (id, updates) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      // Validate that id is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        throw new Error(`Invalid product ID format: ${id}`)
      }
      
      setLoading(true)
      
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', id)
        .eq('user_id', user.id) // Security check
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === id ? data : product
        )
      )
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating product:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      // Validate that id is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        throw new Error(`Invalid product ID format: ${id}`)
      }
      
      setLoading(true)
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Security check
      
      if (error) {
        throw error
      }
      
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== id)
      )
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting product:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  return {
    products,
    loading,
    error,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct
  }
}
