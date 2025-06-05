import { useState } from 'react'
import { FiSave, FiCreditCard, FiMail, FiGlobe, FiLock } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user } = useAuth()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: user?.email || '',
    company: 'Example Company',
    website: 'https://example.com'
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [paymentData, setPaymentData] = useState({
    paypalEmail: '',
    stripeConnected: false
  })
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }
  
  const handlePaymentChange = (e) => {
    const { name, value } = e.target
    setPaymentData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      // In a real app, this would update the user profile
      // For now, we'll simulate success
      
      setTimeout(() => {
        toast.success('Profile updated successfully!')
        setIsSubmitting(false)
      }, 1000)
      
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
      setIsSubmitting(false)
    }
  }
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // In a real app, this would update the password
      // For now, we'll simulate success
      
      setTimeout(() => {
        toast.success('Password updated successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setIsSubmitting(false)
      }, 1000)
      
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error('Failed to update password')
      setIsSubmitting(false)
    }
  }
  
  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      // In a real app, this would update payment settings
      // For now, we'll simulate success
      
      setTimeout(() => {
        toast.success('Payment settings updated successfully!')
        setIsSubmitting(false)
      }, 1000)
      
    } catch (error) {
      console.error('Error updating payment settings:', error)
      toast.error('Failed to update payment settings')
      setIsSubmitting(false)
    }
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('password')}
          >
            Password
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'payment'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('payment')}
          >
            Payment Methods
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email cannot be changed
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={profileData.company}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Website
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiGlobe className="text-gray-400" />
                    </div>
                    <input
                      type="url"
                      name="website"
                      value={profileData.website}
                      onChange={handleProfileChange}
                      placeholder="https://example.com"
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FiSave className="mr-2" />
                      Save Changes
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
          
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Password must be at least 8 characters long
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FiSave className="mr-2" />
                      Update Password
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
          
          {activeTab === 'payment' && (
            <form onSubmit={handlePaymentSubmit}>
              <div className="space-y-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Payment Processors</h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-white p-2 rounded-md mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-[#00457C]">
                            <path fill="currentColor" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.775.775 0 0 1 .768-.681h4.268c1.875 0 3.214.407 3.98 1.214.723.775.999 1.788.822 3.032-.06.424-.194.912-.379 1.486-.197.619-.448 1.177-.752 1.659-.317.505-.73.933-1.225 1.273-.483.33-1.075.601-1.763.809-.67.196-1.472.296-2.386.296h-.755c-.517 0-.605.245-.681.546l-.176.676c-.101.375-.202.757-.379 1.273-.172.508-.518.82-1.028.82l-.301.011zm2.347-11.354l-.339 1.617c-.049.23.012.345.185.345h.857c.585 0 1.066-.074 1.439-.223.373-.149.675-.395.905-.74.137-.229.271-.553.396-.973a3.389 3.389 0 0 0 .052-1.85c-.156-.424-.436-.716-.839-.875-.403-.159-.941-.238-1.613-.238h-1.207c-.143 0-.267.099-.301.238l.465 2.699zm14.049-3.048c-.089-.58-.252-1.066-.489-1.459-.249-.406-.587-.731-1.01-.975-.423-.244-.981-.406-1.659-.487-.677-.075-1.438-.075-2.274-.075h-4.167c-.195 0-.363.137-.394.33l-2.329 14.8a.382.382 0 0 0 .378.437h2.902c.193 0 .362-.137.393-.33l.564-3.592c.03-.194.199-.331.394-.331h1.316c.883 0 1.66-.08 2.333-.243.687-.175 1.304-.437 1.834-.784.543-.362 1.001-.817 1.364-1.362.362-.545.638-1.206.827-1.978.112-.435.191-.848.236-1.236.045-.387.06-.736.045-1.046-.016-.308-.071-.607-.164-.887l-.1.218zm-3.478 3.602c-.137.435-.335.783-.593 1.04-.258.257-.57.445-.933.563-.364.119-.803.178-1.316.178h-1.048c-.145 0-.266.099-.3.238l-.6 3.816c-.022.142.078.271.222.271h2.082c.185 0 .345-.134.375-.317l.9-5.713c.022-.142-.078-.271-.222-.271h-.504c-.145 0-.266.099-.3.238l.237-.043z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">PayPal</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Accept payments via PayPal
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        PayPal Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="paypalEmail"
                          value={paymentData.paypalEmail}
                          onChange={handlePaymentChange}
                          placeholder="your-paypal-email@example.com"
                          className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-white p-2 rounded-md mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-[#635BFF]">
                            <path fill="currentColor" d="M13.479 9.883c-1.626-.604-2.512-.931-2.512-1.618 0-.558.504-.93 1.256-.93 1.107 0 2.16.434 2.663.558l.399-2.43c-.651-.28-1.609-.604-2.765-.604-2.368 0-4.025 1.255-4.025 3.059 0 1.5 1.19 2.38 3.105 3.059 1.244.465 1.653.791 1.653 1.302 0 .605-.532.977-1.518.977-1.244 0-2.44-.419-3.06-.744l-.392 2.464c.672.326 1.909.651 3.2.651 2.6 0 4.304-1.19 4.304-3.152.014-1.58-1.339-2.427-3.308-3.092zm-5.478 6.522H4.923L7.03 5.5H10.2l-2.199 10.905zm14.954-10.8l-1.02 6.344c-.112.326-.392.512-.784.512h-2.88l-2.072 4.05h-2.795l3.308-1.618c-.028 0 .84-3.92.84-3.92s.168-.93.98-.93h.588l.784-4.438H16.8l-.42 2.38h-1.667l.42-2.38h-2.905l-1.4 7.87c-.112.605.14 1.06.392 1.34.252.28.672.512 1.244.512h2.905l.56-3.21h2.765c.868 0 1.639-.326 1.909-1.34l1.371-8.172h-2.6z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Stripe</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Accept credit card payments via Stripe
                          </p>
                        </div>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Payout Settings</h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Payout Schedule
                      </label>
                      <select
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
                      >
                        <option value="instant">Instant (after each sale)</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Minimum Payout Amount
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiDollarSign className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="50.00"
                          className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Minimum amount required before a payout is processed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FiSave className="mr-2" />
                      Save Payment Settings
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
