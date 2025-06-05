import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get session from supabase
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }
    
    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sign up with email and password
  const signUp = async (email, password) => {
    try {
      // Use the site URL as the redirect URL
      const siteUrl = window.location.origin
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`
        }
      })
      
      if (error) throw error
      return { data, needsEmailConfirmation: !data.session }
    } catch (error) {
      console.error("SignUp error:", error)
      throw error
    }
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Reset password
  const resetPassword = async (email) => {
    const siteUrl = window.location.origin
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/update-password`,
    })
    
    if (error) throw error
  }

  // Update password
  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    
    if (error) throw error
  }

  // Resend confirmation email
  const resendConfirmationEmail = async (email) => {
    const siteUrl = window.location.origin
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      }
    })
    
    if (error) throw error
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmationEmail
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
