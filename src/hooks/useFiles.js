import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useFiles() {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setFiles([])
      setLoading(false)
      return
    }

    async function fetchFiles() {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('files')
          .select(`
            *,
            product:products(id, name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setFiles(data || [])
      } catch (err) {
        console.error('Error fetching files:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [user])

  const uploadFile = async (file, productId, metadata = {}) => {
    try {
      if (!user) throw new Error('User not authenticated')
      if (!file) throw new Error('No file provided')
      
      setLoading(true)
      
      // Generate a unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${productId}/${fileName}`
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product_files')
        .upload(filePath, file)
      
      if (uploadError) {
        throw uploadError
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('product_files')
        .getPublicUrl(filePath)
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL')
      }
      
      // Create file record in database
      const fileRecord = {
        user_id: user.id,
        product_id: productId,
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
        url: urlData.publicUrl,
        metadata: metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('files')
        .insert([fileRecord])
        .select(`
          *,
          product:products(id, name)
        `)
        .single()
      
      if (error) {
        throw error
      }
      
      setFiles(prevFiles => [data, ...prevFiles])
      return { success: true, data }
    } catch (err) {
      console.error('Error uploading file:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const deleteFile = async (id, path) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      setLoading(true)
      
      // Delete from storage first
      if (path) {
        const { error: storageError } = await supabase.storage
          .from('product_files')
          .remove([path])
        
        if (storageError) {
          console.error('Error removing file from storage:', storageError)
          // Continue with database deletion even if storage deletion fails
        }
      }
      
      // Delete from database
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Security check
      
      if (error) {
        throw error
      }
      
      setFiles(prevFiles => 
        prevFiles.filter(file => file.id !== id)
      )
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting file:', err)
      setError(err)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  return {
    files,
    loading,
    error,
    uploadFile,
    deleteFile
  }
}
