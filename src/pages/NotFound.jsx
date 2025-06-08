import { Link } from 'react-router-dom'
import { FiHome, FiArrowLeft } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="mb-8">
        <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
      </div>
      
      <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
      
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, 
        or is temporarily unavailable.
      </p>
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <Link 
          to="/"
          className="btn btn-primary"
        >
          <FiHome className="mr-2" />
          Go to Home
        </Link>
        
        <button 
          onClick={() => window.history.back()} 
          className="btn btn-outline"
        >
          <FiArrowLeft className="mr-2" />
          Go Back
        </button>
      </div>
      
      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-lg">
        <h3 className="text-lg font-medium mb-3">Looking for something?</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Try navigating to one of these popular destinations:
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link 
            to="/dashboard" 
            className="p-3 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            to="/products" 
            className="p-3 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            Products
          </Link>
          <Link 
            to="/memberships" 
            className="p-3 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            Memberships
          </Link>
          <Link 
            to="/customers" 
            className="p-3 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            Customers
          </Link>
        </div>
      </div>
    </div>
  )
}
