import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiEdit, FiTrash2, FiDownload, FiEye, FiArrowLeft, FiDollarSign, FiCalendar, FiUser, FiPackage } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { useProducts } from '../hooks/useProducts'
import toast from 'react-hot-toast'

export default function ProductDetails() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const { deleteProduct } = useProducts()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        setError(null)
        
        if (!user || !id) {
          setError('Missing user or product ID')
          return
        }
        
        // Validate UUID format before making request
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(id)) {
          setError(`Invalid product ID format: ${id}`)
          navigate('/products')
          return
        }
        
        const { useProducts } = await import('../hooks/useProducts')
        const { getProduct } = useProducts()
        const result = await getProduct(id)
        
        if (result.success) {
          setProduct(result.data)
        } else {
          throw result.error
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setError(error.message || 'Failed to load product')
        toast.error('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [id, user, navigate])
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }
    
    try {
      const result = await deleteProduct(id)
      if (result.success) {
        toast.success('Product deleted successfully')
        navigate('/products')
      } else {
        throw result.error
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
        <Link to="/products" className="text-red-600 hover:text-red-800 underline">
          ← Back to Products
        </Link>
      </div>
    )
  }
  
  if (!product) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        <p>Product not found</p>
        <Link to="/products" className="text-yellow-600 hover:text-yellow-800 underline">
          ← Back to Products
        </Link>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            to="/products" 
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">{product.name}</h1>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/products/${product.id}/edit`}
            className="btn btn-outline"
          >
            <FiEdit className="mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="btn btn-danger"
          >
            <FiTrash2 className="mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {product.status === 'active' ? 'Active' : 'Draft'}
              </span>
              <div className="flex items-center text-2xl font-bold text-primary-600">
                <FiDollarSign />
                {product.price}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <FiPackage className="mr-2" />
                <span className="capitalize">{product.type}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <FiCalendar className="mr-2" />
                <span>{new Date(product.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">License Type</h4>
                <p className="text-gray-600 dark:text-gray-400 capitalize">
                  {product.license_type || 'Standard'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Download Limit</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {product.download_limit || 3} downloads
                </p>
              </div>
              {product.file_size && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">File Size</h4>
                  <p className="text-gray-600 dark:text-gray-400">{product.file_size}</p>
                </div>
              )}
              {product.file_type && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">File Type</h4>
                  <p className="text-gray-600 dark:text-gray-400">{product.file_type}</p>
                </div>
              )}
            </div>
            
            {product.download_url && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Download File</h4>
                  <a
                    href={product.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <FiDownload className="mr-2" />
                    Download
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Product Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Sales</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Downloads</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Views</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to={`/products/${product.id}/edit`}
                className="w-full btn btn-outline"
              >
                <FiEdit className="mr-2" />
                Edit Product
              </Link>
              {product.download_url && (
                <a
                  href={product.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn btn-outline"
                >
                  <FiEye className="mr-2" />
                  Preview File
                </a>
              )}
              <button
                onClick={handleDelete}
                className="w-full btn btn-danger"
              >
                <FiTrash2 className="mr-2" />
                Delete Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
