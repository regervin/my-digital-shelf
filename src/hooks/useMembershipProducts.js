import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useMembershipProducts(membershipId = null) {
  const { user } = useAuth()
  const [membershipProducts, setMembershipProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setMembershipProducts([])
      setLoading(false)
      return
    }

    async function fetchMembershipProducts() {
      try {
        setLoading(true)
        
        let query = supabase
          .from('membership_products')
          .select(`
            *,
            membership:memberships!inner(*),
            product:products!inner(*)
          `)
          .eq('membership:memberships.user_id', user.id)
        
        // If a specific membership ID is provided, filter by it
        if (membershipId) {
          query = query.eq('membership_id', membershipId)
        }
        
        const { data, error } = await query.order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setMembershipProducts(data || [])
      } catch (err) {
        console.error('Error fetching membership products:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMembershipProducts()
  }, [user, membershipId])

  const addProductToMembership = async (membershipId, productId) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      // Verify the user owns the membership
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('id')
        .eq('id', membershipId)
        .eq('user_id', user.id)
        .single()
      
      if (membershipError || !membershipData) {
        throw new Error('Membership not found or not owned by user')
      }
      
      // Verify the user owns the product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', productId)
        .eq('user_id', user.id)
        .single()
      
      if (productError || !productData) {
        throw new Error('Product not found or not owned by user')
      }
      
      setLoading(true)
      
      const newMembershipProduct = {
        membership_id: membershipId,
        product_id: productId,
        created_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('membership_products')
        .insert([newMembershipProduct])
        .select(`
          *,
          membership:memberships(*),
          product:products(*)
        `)
        .single()
      
      if (error) {
        throw error
      }
      
      setMembershipProducts(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      console.error('Error adding product to membership:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const removeProductFromMembership = async (membershipId, productId) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      // Verify the user owns the membership
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('id')
        .eq('id', membershipId)
        .eq('user_id', user.id)
        .single()
      
      if (membershipError || !membershipData) {
        throw new Error('Membership not found or not owned by user')
      }
      
      setLoading(true)
      
      const { error } = await supabase
        .from('membership_products')
        .delete()
        .eq('membership_id', membershipId)
        .eq('product_id', productId)
      
      if (error) {
        throw error
      }
      
      setMembershipProducts(prev => 
        prev.filter(mp => !(mp.membership_id === membershipId && mp.product_id === productId))
      )
      
      return { success: true }
    } catch (err) {
      console.error('Error removing product from membership:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const getProductsForMembership = async (membershipId) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      const { data, error } = await supabase
        .from('membership_products')
        .select(`
          product:products(*)
        `)
        .eq('membership_id', membershipId)
      
      if (error) {
        throw error
      }
      
      // Extract just the product data from the results
      const products = data.map(item => item.product)
      
      return { success: true, data: products }
    } catch (err) {
      console.error('Error getting products for membership:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const getMembershipsForProduct = async (productId) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      const { data, error } = await supabase
        .from('membership_products')
        .select(`
          membership:memberships(*)
        `)
        .eq('product_id', productId)
        .eq('membership:memberships.user_id', user.id)
      
      if (error) {
        throw error
      }
      
      // Extract just the membership data from the results
      const memberships = data.map(item => item.membership)
      
      return { success: true, data: memberships }
    } catch (err) {
      console.error('Error getting memberships for product:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  return {
    membershipProducts,
    loading,
    error,
    addProductToMembership,
    removeProductFromMembership,
    getProductsForMembership,
    getMembershipsForProduct
  }
}
