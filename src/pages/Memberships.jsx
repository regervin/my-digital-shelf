import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiFilter } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Memberships() {
  const { user } = useAuth()
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchMemberships()
  }, [user])

  async function fetchMemberships() {
    try {
      setLoading(true)
      
      if (!user) return
      
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      if (data) {
        setMemberships(data)
      }
    } catch (error) {
      console.error('Error fetching memberships:', error)
      toast.error('Failed to load memberships')
    } finally {
      setLoading(false)
    }
  }

  const filteredMemberships = memberships
    .filter(membership => {
      // Apply search filter
      if (searchTerm && !membership.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Apply status filter
      if (filter !== 'all' && membership.status !== filter) {
        return false
      }
      
      return true
    })

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this membership?')) return
    
    try {
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      setMemberships(memberships.filter(membership => membership.id !== id))
      toast.success('Membership deleted successfully')
    } catch (error) {
      console.error('Error deleting membership:', error)
      toast.error('Failed to delete membership')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Memberships</h1>
        <Link to="/memberships/create" className="btn btn-primary mt-2 sm:mt-0">
          <FiPlus className="mr-2" />
          Create Membership
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search memberships..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center">
            <FiFilter className="mr-2 text-gray-500 dark:text-gray-400" />
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Memberships</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border-b border-gray-200 dark:border-gray-700 py-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredMemberships.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Billing</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Created</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMemberships.map((membership) => (
                  <tr key={membership.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3 font-medium">{membership.name}</td>
                    <td className="py-3">${parseFloat(membership.price).toFixed(2)}</td>
                    <td className="py-3 capitalize">{membership.billing_cycle}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        membership.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : membership.status === 'archived'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {membership.status}
                      </span>
                    </td>
                    <td className="py-3">{format(new Date(membership.created_at), 'MMM dd, yyyy')}</td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <Link to={`/memberships/${membership.id}`} className="text-gray-500 hover:text-primary-600">
                          <FiEye />
                        </Link>
                        <Link to={`/memberships/${membership.id}/edit`} className="text-gray-500 hover:text-primary-600">
                          <FiEdit2 />
                        </Link>
                        <button 
                          onClick={() => handleDelete(membership.id)} 
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No memberships found.</p>
            <Link to="/memberships/create" className="btn btn-primary">
              <FiPlus className="mr-2" />
              Create Your First Membership
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
