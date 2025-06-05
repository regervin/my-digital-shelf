import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function VerifyEmail() {
  const location = useLocation()
  const { resendConfirmationEmail } = useAuth()
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  
  // Get email from location state if available
  const email = location.state?.email || ''

  const handleResend = async () => {
    if (!email) {
      toast.error('Email address is missing. Please go back to signup.')
      return
    }
    
    try {
      setResending(true)
      await resendConfirmationEmail(email)
      setResent(true)
      toast.success('Verification email resent successfully')
    } catch (error) {
      console.error('Error resending email:', error)
      toast.error(error.message || 'Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h1 className="text-2xl font-bold mt-4">Check your email</h1>
        </div>
        
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          We've sent you a verification link to {email ? <strong>{email}</strong> : 'your email address'}. 
          Please click the link to verify your account.
        </p>
        
        <div className="space-y-4">
          <p className="text-center text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
            <button 
              onClick={handleResend}
              disabled={resending || resent}
              className="btn btn-outline"
            >
              {resending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resending...
                </span>
              ) : resent ? (
                'Email Resent'
              ) : (
                'Resend Email'
              )}
            </button>
            
            <Link to="/login" className="btn btn-primary">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
