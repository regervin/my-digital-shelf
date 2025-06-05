import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiEdit2, FiDownload, FiExternalLink, FiCopy, FiBarChart2, FiDollarSign, FiCalendar, FiPackage, FiUsers } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function ProductDetails() {
  const { user } = useAuth()
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [salesStats, setSalesStats] = useState({
    total: 0,
    thisMonth: 0,
    lastMonth: 0
  })

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        
        // In a real app, this would fetch from your database
        // For now, we'll simulate some data
        setTimeout(() => {
          const dummyProduct = {
            id: parseInt(id),
            name: 'Ultimate Web Design Course', 
            description: 'A comprehensive course covering all aspects of modern web design including HTML, CSS, JavaScript, responsive design, UI/UX principles, and modern frameworks. This course is perfect for beginners and intermediate designers looking to upgrade their skills.',
            type: 'course', 
            price: 49.99, 
            status: 'active',
            downloadUrl: 'https://example.com/download/webdesign.zip',
            licenseType: 'standard',
            downloadLimit: 3,
            created_at: new Date(2023, 9, 15),
            updated_at: new Date(2023, 10, 5),
            sales: 24,
            thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
          }
          
          setProduct(dummyProduct)
          
          // Simulate sales stats
          setSalesStats({
            total: 24,
            thisMonth: 8,
            lastMonth: 12
          })
          
          setLoading(false)
        }, 800)
        
      } catch (error) {
        console.error('Error fetching product:', error)
        toast.error('Failed to load product')
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [id])
  
  const copyProductLink = () => {
    const link = `${window.location.origin}/p/${id}`
    navigator.clipboard.writeText(link)
    toast.success('Product link copied to clipboard')
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Product Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/products" className="btn btn-primary">
          Back to Products
        </Link>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <div className="flex space-x-3 mt-3 sm:mt-0">
          <button 
            onClick={copyProductLink}
            className="btn btn-outline btn-sm"
          >
            <FiCopy className="mr-2" />
            Copy Link
          </button>
          <Link to={`/products/${id}/edit`} className="btn btn-primary btn-sm">
            <FiEdit2 className="mr-2" />
            Edit Product
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="relative h-48 sm:h-64 bg-gray-200 dark:bg-gray-700">
              {product.thumbnail ? (
                <img 
                  src={product.thumbnail} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FiPackage className="text-gray-400 text-4xl" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <FiPackage className="mr-2" />
                  <span className="capitalize">{product.type}</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <FiDollarSign className="mr-2" />
                  <span>${product.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <FiCalendar className="mr-2" />
                  <span>Created {format(product.created_at, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <FiUsers className="mr-2" />
                  <span>{product.sales} sales</span>
                </div>
              </div>
              
              <h2 className="text-lg font-medium mb-3">Description</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {product.description || 'No description provided.'}
              </p>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 className="text-lg font-medium mb-3">Product Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">License Type</h3>
                    <p className="capitalize">{product.licenseType}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Download Limit</h3>
                    <p>{product.downloadLimit} downloads per purchase</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
                    <p>{format(product.updated_at, 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <h2 className="text-lg font-medium mb-3">Download Options</h2>
                {product.downloadUrl ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a 
                      href={product.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      <FiDownload className="mr-2" />
                      Download File
                    </a>
                    <a 
                      href={product.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                    >
                      <FiExternalLink className="mr-2" />
                      View External Link
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No download file has been uploaded for this product.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <FiBarChart2 className="mr-2 text-primary-600" />
              Sales Overview
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                <p className="text-2xl font-bold">{salesStats.total}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold">${(salesStats.total * product.price).toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold">{salesStats.thisMonth}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Month</p>
                <p className="text-2xl font-bold">{salesStats.lastMonth}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <Link to="/analytics" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
                View detailed analytics →
              </Link>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium mb-4">Recent Customers</h2>
            
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      {String.fromCharCode(65 + i)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">Customer {i + 1}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Purchased {Math.floor(Math.random() * 10) + 1} days ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Link to="/customers" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
                View all customers →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
