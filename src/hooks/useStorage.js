import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useStorage() {
  const { user } = useAuth()
  const [storageData, setStorageData] = useState({
    used: 0,
    total: 10 * 1024 * 1024 * 1024, // 10GB in bytes
    percentage: 0,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (!user) {
      setStorageData(prev => ({
        ...prev,
        used: 0,
        percentage: 0,
        loading: false
      }))
      return
    }

    async function fetchStorageUsage() {
      try {
        setStorageData(prev => ({ ...prev, loading: true, error: null }))
        
        // Get all files for the current user
        const { data: files, error: filesError } = await supabase
          .from('files')
          .select('size')
          .eq('user_id', user.id)
        
        if (filesError) {
          throw filesError
        }
        
        // Calculate total storage used
        const totalUsed = files?.reduce((sum, file) => sum + (file.size || 0), 0) || 0
        const percentage = Math.round((totalUsed / storageData.total) * 100)
        
        setStorageData(prev => ({
          ...prev,
          used: totalUsed,
          percentage: Math.min(percentage, 100), // Cap at 100%
          loading: false
        }))
        
      } catch (err) {
        console.error('Error fetching storage usage:', err)
        setStorageData(prev => ({
          ...prev,
          error: err,
          loading: false
        }))
      }
    }

    fetchStorageUsage()
  }, [user, storageData.total])

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTotalStorage = () => {
    return formatBytes(storageData.total)
  }

  const formatUsedStorage = () => {
    return formatBytes(storageData.used)
  }

  const isNearLimit = () => {
    return storageData.percentage >= 80
  }

  const isOverLimit = () => {
    return storageData.percentage >= 100
  }

  return {
    ...storageData,
    formatBytes,
    formatTotalStorage,
    formatUsedStorage,
    isNearLimit,
    isOverLimit,
    refreshStorage: () => {
      if (user) {
        // Trigger a re-fetch by updating a dependency
        setStorageData(prev => ({ ...prev, loading: true }))
      }
    }
  }
}
