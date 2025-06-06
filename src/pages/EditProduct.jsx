import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiSave, FiUpload, FiDollarSign, FiPackage, FiFileText, FiLink } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function EditProduct() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'ebook',
    price: '',
    status: 'draft',
    download_url: '',
    license_type: 'standard',
    download_limit: 3,
    file_size: '',
    file_type: ''
  })
  
  const [file, setFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        
        if (!user || !id) return
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) {
          throw error
        }
        
        if (!data) {
          toast.error('Product not found')
          navigate('/products')
          return
        }
        
        setFormData(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching product:', error)
        toast.error('Failed to load product')
        setLoading(false)
        navigate('/products')
      }
    }
    
    fetchProduct()
  }, [id, user, navigate])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      // Update file size and type
      const fileSizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2)
      setFormData(prev => ({
        ...prev,
        file_size: `${fileSizeInMB} MB`,
        file_type: selectedFile.type.split('/')[1].toUpperCase()
      }))
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // Upload file if selected
      let fileUrl = formData.download_url
      
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('product_files')
          .upload(filePath, file)
        
        if (uploadError) {
          throw uploadError
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product_files')
          .getPublicUrl(filePath)
        
        fileUrl = publicUrl
      }
      
      // Update product in database
      const { error } = await supabase
        .from('products')
        .update({
          ...formData,
          price: parseFloat(formData.price),
          download_url: fileUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      toast.success('Product updated successfully!')
      navigate('/products')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
      setIsSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPackage className="text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Ultimate Web Design Course"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
            >
              <option value="ebook">E-Book</option>
              <option value="course">Course</option>
              <option value="software">Software</option>
              <option value="templates">Templates</option>
              <option value="graphics">Graphics</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
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
                placeholder="29.99"
                min="0"
                step="0.01"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
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
              value={formData.description || ''}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your product..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            ></textarea>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product File
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="product-file"
              />
              <label htmlFor="product-file" className="cursor-pointer">
                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {file ? file.name : formData.file_size ? 'File already uploaded (click to replace)' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PDF, ZIP, MP4, MP3 (max. 500MB)
                </p>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Or External Download URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLink className="text-gray-400" />
              </div>
              <input
                type="url"
                name="download_url"
                value={formData.download_url || ''}
                onChange={handleChange}
                placeholder="https://example.com/download/file.pdf"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              If your product is hosted elsewhere, provide the download URL
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              License Type
            </label>
            <select
              name="license_type"
              value={formData.license_type || 'standard'}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
            >
              <option value="standard">Standard License</option>
              <option value="extended">Extended License</option>
              <option value="unlimited">Unlimited License</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Download Limit
            </label>
            <input
              type="number"
              name="download_limit"
              value={formData.download_limit || 3}
              onChange={handleChange}
              min="1"
              max="100"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
            />
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Number of times a customer can download this product
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={() => navigate('/products')}
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
    </div>
  )
}
