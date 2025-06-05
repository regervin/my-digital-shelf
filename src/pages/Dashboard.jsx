import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Verified Account
          </span>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-medium mb-2">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
              <p className="font-medium">{user?.id}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Products</h3>
              <span className="text-2xl text-primary-600">0</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Digital products you've created
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Sales</h3>
              <span className="text-2xl text-primary-600">0</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total number of sales
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Revenue</h3>
              <span className="text-2xl text-primary-600">$0.00</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total revenue earned
            </p>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="btn btn-primary">
              Create New Product
            </button>
            <button className="btn btn-outline">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
