import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useProductTypes() {
  const [productTypes, setProductTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProductTypes()
  }, [])

  const fetchProductTypes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching product types from database...')
      
      const { data, error: fetchError } = await supabase
        .from('product_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      
      if (fetchError) {
        console.error('Database error fetching product types:', fetchError)
        // Don't throw here, just use fallback
        console.log('Using fallback product types due to database error')
        setProductTypes([
          { value: 'ebook', label: 'E-Book' },
          { value: 'course', label: 'Course' },
          { value: 'software', label: 'Software' },
          { value: 'templates', label: 'Templates' },
          { value: 'graphics', label: 'Graphics' },
          { value: 'audio', label: 'Audio' },
          { value: 'video', label: 'Video' },
          { value: 'plr', label: 'PLR (Private Label Rights)' }
        ])
        return
      }
      
      // If we got data from database, use it
      if (data && data.length > 0) {
        console.log('Product types loaded from database:', data)
        setProductTypes(data)
      } else {
        // If no data in database, use fallback types
        console.log('No product types found in database, using fallback')
        setProductTypes([
          { value: 'ebook', label: 'E-Book' },
          { value: 'course', label: 'Course' },
          { value: 'software', label: 'Software' },
          { value: 'templates', label: 'Templates' },
          { value: 'graphics', label: 'Graphics' },
          { value: 'audio', label: 'Audio' },
          { value: 'video', label: 'Video' },
          { value: 'plr', label: 'PLR (Private Label Rights)' }
        ])
      }
    } catch (err) {
      console.error('Error fetching product types:', err)
      setError(err)
      
      // Always provide fallback types
      console.log('Exception caught, using fallback product types')
      setProductTypes([
        { value: 'ebook', label: 'E-Book' },
        { value: 'course', label: 'Course' },
        { value: 'software', label: 'Software' },
        { value: 'templates', label: 'Templates' },
        { value: 'graphics', label: 'Graphics' },
        { value: 'audio', label: 'Audio' },
        { value: 'video', label: 'Video' },
        { value: 'plr', label: 'PLR (Private Label Rights)' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const addProductType = async (typeData) => {
    try {
      const { data, error } = await supabase
        .from('product_types')
        .insert([{
          ...typeData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      await fetchProductTypes() // Refresh the list
      return { success: true, data }
    } catch (err) {
      console.error('Error adding product type:', err)
      return { success: false, error: err }
    }
  }

  const updateProductType = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      await fetchProductTypes() // Refresh the list
      return { success: true, data }
    } catch (err) {
      console.error('Error updating product type:', err)
      return { success: false, error: err }
    }
  }

  const deleteProductType = async (id) => {
    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('product_types')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      await fetchProductTypes() // Refresh the list
      return { success: true }
    } catch (err) {
      console.error('Error deleting product type:', err)
      return { success: false, error: err }
    }
  }

  const reorderProductTypes = async (reorderedTypes) => {
    try {
      const updates = reorderedTypes.map((type, index) => ({
        id: type.id,
        sort_order: index + 1,
        updated_at: new Date().toISOString()
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('product_types')
          .update({ 
            sort_order: update.sort_order,
            updated_at: update.updated_at
          })
          .eq('id', update.id)
        
        if (error) {
          throw error
        }
      }
      
      await fetchProductTypes() // Refresh the list
      return { success: true }
    } catch (err) {
      console.error('Error reordering product types:', err)
      return { success: false, error: err }
    }
  }

  return {
    productTypes,
    loading,
    error,
    addProductType,
    updateProductType,
    deleteProductType,
    reorderProductTypes,
    refreshProductTypes: fetchProductTypes
  }
}
