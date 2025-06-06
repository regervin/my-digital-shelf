import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiEdit2, FiTrash2, FiDownload, FiExternalLink, FiDollarSign, FiPackage, FiCalendar, FiUsers, FiBarChart2 } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function ProductDetails() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState([])
  
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
        
        setProduct(data)
        
        // For now, we'll simulate sales data
        // In a real app, you would fetch this from your sales table
        const dummySalesData = [
          { date: new Date(2023, 10, 1), count: 3, revenue: 149.97 },
          { date: new Date(2023, 10, 2), count: 2, revenue: 99.98 },
          { date: new Date(2023, 10, 3), count: 5, revenue: 249.95 },
          { date: new Date(2023, 10, 4), count: 4, revenue: 199.96 },
          { date: new Date(2023, 10, 5), count: 2, revenue: 99.98 },
          { date: new Date(2023, 10, 6), count: 3, revenue: 149.97 },
          { date: new Date(2023, 10, 7), count: 5, revenue: 249.95 }
        ]
        
        setSalesData(dummySalesData)
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
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)
        
        if (error) {
          throw error
        }
        
        toast.success('Product deleted successfully')
        navigate('/products')
      } catch (error) {
        console.error('Error deleting product:', error)
        toast.error('Failed to delete product')
      }
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">Product ID: {product.id}</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Link to={`/products/${id}/edit`} className="btn btn-outline">
            <FiEdit2 className="mr-2" />
            Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            <FiTrash2 className="mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Product Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Product Type</h3>
                <p className="text-gray-900 dark:text-gray-100 capitalize flex items-center">
                  <FiPackage className="mr-2 text-gray-400" />
                  {product.type}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Price</h3>
                <p className="text-gray-900 dark:text-gray-100 flex items-center">
                  <FiDollarSign className="mr-2 text-gray-400" />
                  ${parseFloat(product.price).toFixed(2)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created</h3>
                <p className="text-gray-900 dark:text-gray-100 flex items-center">
                  <FiCalendar className="mr-2 text-gray-400" />
                  {format(new Date(product.created_at), 'MMM dd, yyyy')}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Updated</h3>
                <p className="text-gray-900 dark:text-gray-100 flex items-center">
                  <FiCalendar className="mr-2 text-gray-400" />
                  {format(new Date(product.updated_at), 'MMM dd, yyyy')}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h3>
                <p className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {product.status}
                  </span>
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">License Type</h3>
                <p className="text-gray-900 dark:text-gray-100 capitalize">
                  {product.license_type || 'Standard'}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h3>
              <p className="text-gray-900 dark:text-gray-100">
                {product.description || 'No description provided.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">File Information</h3>
                <p className="text-gray-900 dark:text-gray-100">
                  {product.file_type ? `${product.file_type} • ${product.file_size}` : 'No file uploaded'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Download Limit</h3>
                <p className="text-gray-900 dark:text-gray-100">
                  {product.download_limit || 3} downloads per purchase
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Download Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.file_type && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Direct Download</h3>
                  <button className="btn btn-primary w-full">
                    <FiDownload className="mr-2" />
                    Download File
                  </button>
                </div>
              )}
              
              {product.download_url && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">External Link</h3>
                  <a 
                    href={product.download_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline w-full"
                  >
                    <FiExternalLink className="mr-2" />
                    Open Download URL
                  </a>
                </div>
              )}
              
              {!product.file_type && !product.download_url && (
                <div className="col-span-2 text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">No download options available.</p>
                  <Link to={`/products/${id}/edit`} className="btn btn-outline mt-2">
                    <FiEdit2 className="mr-2" />
                    Add Download Options
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Sales Summary</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Sales</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <FiUsers className="mr-2 text-primary-500" />
                  {product.total_sales || 0}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Revenue</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <FiDollarSign className="mr-2 text-primary-500" />
                  ${parseFloat(product.revenue || 0).toFixed(2)}
                </p>
              </div>
            </div>
            
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Sales</h3>
            {product.total_sales > 0 ? (
              <div className="space-y-3">
                {salesData.map((sale, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-900 dark:text-gray-100">
                      {format(sale.date, 'MMM dd')}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {sale.count} sales
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ${sale.revenue.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">No sales data available yet.</p>
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <Link to={`/products/${id}/edit`} className="btn btn-outline w-full justify-start">
                <FiEdit2 className="mr-2" />
                Edit Product
              </Link>
              <button className="btn btn-outline w-full justify-start">
                <FiBarChart2 className="mr-2" />
                View Analytics
              </button>
              <button onClick={handleDelete} className="btn btn-danger w-full justify-start">
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
