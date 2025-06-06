import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSave, FiDollarSign, FiCreditCard, FiFileText, FiLock } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function CreateMembership() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billing_cycle: 'monthly',
    status: 'draft',
    trial_days: 0,
    access_type: 'standard'
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const { data, error } = await supabase
        .from('memberships')
        .insert([
          { 
            ...formData, 
            user_id: user.id,
            price: parseFloat(formData.price)
          }
        ])
        .select()
      
      if (error) {
        throw error
      }
      
      toast.success('Membership created successfully!')
      navigate('/memberships')
      
    } catch (error) {
      console.error('Error creating membership:', error)
      toast.error('Failed to create membership')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Membership</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Membership Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCreditCard className="text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Premium Membership"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price ($) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiDollarSign className="text-gray-400" />
              </div>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="19.99"
                min="0"
                step="0.01"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Billing Cycle
            </label>
            <select
              name="billing_cycle"
              value={formData.billing_cycle}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="lifetime">Lifetime (one-time)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
              <FiFileText className="text-gray-400" />
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe the membership benefits..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            ></textarea>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trial Period (Days)
            </label>
            <input
              type="number"
              name="trial_days"
              value={formData.trial_days}
              onChange={handleChange}
              min="0"
              max="90"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
            />
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Number of days for free trial (0 for no trial)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Access Type
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <select
                name="access_type"
                value={formData.access_type}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="standard">Standard Access</option>
                <option value="premium">Premium Access</option>
                <option value="vip">VIP Access</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-2">Included Products</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select which products are included with this membership:
          </p>
          
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Ultimate Web Design Course</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Digital Marketing Ebook</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
              <span className="ml-2 text-gray-700 dark:text-gray-300">SEO Toolkit</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Content Creation Templates</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={() => navigate('/memberships')}
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
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
                Creating...
              </span>
            ) : (
              <span className="flex items-center">
                <FiSave className="mr-2" />
                Create Membership
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
