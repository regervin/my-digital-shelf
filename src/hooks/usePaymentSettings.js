import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function usePaymentSettings() {
  const { user } = useAuth()
  const [paymentSettings, setPaymentSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setPaymentSettings(null)
      setLoading(false)
      return
    }

    async function fetchPaymentSettings() {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('payment_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          throw error
        }
        
        if (data) {
          setPaymentSettings(data)
        } else {
          // Create default payment settings if none exist
          const defaultSettings = {
            user_id: user.id,
            paypal_email: '',
            stripe_connected: false,
            payout_schedule: 'instant',
            minimum_payout_amount: 0
          }
          
          const { data: insertedSettings, error: insertError } = await supabase
            .from('payment_settings')
            .insert([defaultSettings])
            .select()
            .single()
          
          if (insertError) {
            throw insertError
          }
          
          setPaymentSettings(insertedSettings)
        }
      } catch (err) {
        console.error('Error fetching payment settings:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentSettings()
  }, [user])

  const updatePaymentSettings = async (updates) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      // Add updated_at timestamp
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('payment_settings')
        .update(updatedData)
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      setPaymentSettings(data)
      return { success: true, data }
    } catch (err) {
      console.error('Error updating payment settings:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  return {
    paymentSettings,
    loading,
    error,
    updatePaymentSettings
  }
}
