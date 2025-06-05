import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const [message, setMessage] = useState('Processing authentication...')
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashFragment = window.location.hash

        if (hashFragment) {
          // Process the hash fragment
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            throw error
          }
          
          if (data?.session) {
            toast.success('Authentication successful!')
            navigate('/dashboard')
          } else {
            setMessage('Authentication completed. You can now log in.')
            setTimeout(() => navigate('/login'), 2000)
          }
        } else {
          setMessage('No authentication data found. Redirecting to login...')
          setTimeout(() => navigate('/login'), 2000)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setMessage(`Authentication error: ${error.message}`)
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">Authentication</h1>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-center text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  )
}
