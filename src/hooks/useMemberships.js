import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useMemberships() {
  const { user } = useAuth()
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setMemberships([])
      setLoading(false)
      return
    }

    async function fetchMemberships() {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('memberships')
          .select(`
            *,
            customer:customers(id, name, email),
            product:products(id, name, price)
          `)
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setMemberships(data || [])
      } catch (err) {
        console.error('Error fetching memberships:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMemberships()
  }, [user])

  const addMembership = async (membershipData) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      const newMembership = {
        ...membershipData,
        seller_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('memberships')
        .insert([newMembership])
        .select(`
          *,
          customer:customers(id, name, email),
          product:products(id, name, price)
        `)
        .single()
      
      if (error) {
        throw error
      }
      
      setMemberships(prevMemberships => [data, ...prevMemberships])
      return { success: true, data }
    } catch (err) {
      console.error('Error adding membership:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const updateMembership = async (id, updates) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('memberships')
        .update(updatedData)
        .eq('id', id)
        .eq('seller_id', user.id) // Security check
        .select(`
          *,
          customer:customers(id, name, email),
          product:products(id, name, price)
        `)
        .single()
      
      if (error) {
        throw error
      }
      
      setMemberships(prevMemberships => 
        prevMemberships.map(membership => 
          membership.id === id ? data : membership
        )
      )
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating membership:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const deleteMembership = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', id)
        .eq('seller_id', user.id) // Security check
      
      if (error) {
        throw error
      }
      
      setMemberships(prevMemberships => 
        prevMemberships.filter(membership => membership.id !== id)
      )
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting membership:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  return {
    memberships,
    loading,
    error,
    addMembership,
    updateMembership,
    deleteMembership
  }
}
