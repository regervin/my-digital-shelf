import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const [error, setError] = useState(null)
  const [verifying, setVerifying] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process the email confirmation callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setError(error.message)
          toast.error('Authentication failed: ' + error.message)
          setVerifying(false)
          return
        }
        
        if (data?.session) {
          toast.success('Email verified successfully!')
          // Redirect to dashboard on successful authentication
          navigate('/dashboard')
        } else {
          setError('No session found. Please try logging in again.')
          setVerifying(false)
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Authentication failed. Please try again.')
        setVerifying(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold mt-4">Authentication Error</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
          </div>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/login')}
              className="btn btn-primary"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="text-center">
          {verifying ? (
            <>
              <svg className="animate-spin h-12 w-12 mx-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h1 className="text-2xl font-bold mt-4">Verifying your email...</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Please wait while we complete your verification.</p>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h1 className="text-2xl font-bold mt-4">Email Verified!</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Your email has been successfully verified.</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn btn-primary mt-4"
              >
                Go to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
