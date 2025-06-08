import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    async function fetchProfile() {
      try {
        setLoading(true)
        
        // Simple direct query to get profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (error) {
          // If profile doesn't exist yet, create it
          if (error.code === 'PGRST116') {
            // Create a basic profile with minimal data
            const newProfile = {
              id: user.id,
              email: user.email
            }
            
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert([newProfile])
              .select()
            
            if (createError) {
              console.error('Error creating profile:', createError)
              throw createError
            }
            
            setProfile(createdProfile[0])
          } else {
            console.error('Error fetching profile:', error)
            throw error
          }
        } else {
          setProfile(data)
        }
      } catch (err) {
        console.error('Error in fetchProfile:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      // Ultra-simplified update process
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
      
      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }
      
      setProfile(data[0])
      return { success: true, data: data[0] }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err)
      return { 
        success: false, 
        error: { 
          message: err.message || 'Unknown error occurred while updating profile'
        } 
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile
  }
}
