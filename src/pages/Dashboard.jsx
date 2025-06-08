import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiPackage, FiUsers, FiCreditCard } from 'react-icons/fi'
import DashboardStats from '../components/Dashboard/DashboardStats'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/products/create" className="btn btn-primary">
            <FiPackage className="mr-2" />
            Add Product
          </Link>
          <Link to="/memberships/create" className="btn btn-outline">
            <FiCreditCard className="mr-2" />
            Create Membership
          </Link>
        </div>
      </div>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/products/create" className="btn btn-primary">
              Add New Product
            </Link>
            <Link to="/memberships/create" className="btn btn-outline">
              Create Membership
            </Link>
            <Link to="/customers" className="btn btn-outline">
              View Customers
            </Link>
            <Link to="/analytics" className="btn btn-outline">
              View Analytics
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Tips & Resources</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 p-1 rounded mr-2">
                <FiPackage className="h-4 w-4" />
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                <a href="#" className="text-primary-600 hover:underline">How to create your first digital product</a>
              </span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 p-1 rounded mr-2">
                <FiUsers className="h-4 w-4" />
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                <a href="#" className="text-primary-600 hover:underline">Growing your customer base</a>
              </span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 p-1 rounded mr-2">
                <FiCreditCard className="h-4 w-4" />
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                <a href="#" className="text-primary-600 hover:underline">Setting up recurring memberships</a>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
