import { NavLink } from 'react-router-dom'
import { 
  FiHome, 
  FiPackage, 
  FiUsers, 
  FiDollarSign, 
  FiBarChart2, 
  FiSettings,
  FiCreditCard,
  FiChevronRight,
  FiAlertTriangle
} from 'react-icons/fi'
import { useStorage } from '../hooks/useStorage'

export default function Sidebar() {
  const { 
    percentage, 
    loading, 
    error, 
    formatUsedStorage, 
    formatTotalStorage,
    isNearLimit,
    isOverLimit 
  } = useStorage()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { path: '/products', label: 'Products', icon: <FiPackage className="w-5 h-5" /> },
    { path: '/memberships', label: 'Memberships', icon: <FiCreditCard className="w-5 h-5" /> },
    { path: '/customers', label: 'Customers', icon: <FiUsers className="w-5 h-5" /> },
    { path: '/sales', label: 'Sales', icon: <FiDollarSign className="w-5 h-5" /> },
    { path: '/analytics', label: 'Analytics', icon: <FiBarChart2 className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <FiSettings className="w-5 h-5" /> },
  ]

  const getStorageBarColor = () => {
    if (isOverLimit()) return 'bg-red-600'
    if (isNearLimit()) return 'bg-yellow-500'
    return 'bg-primary-600'
  }

  const getStorageTextColor = () => {
    if (isOverLimit()) return 'text-red-600 dark:text-red-400'
    if (isNearLimit()) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-700 dark:text-gray-300'
  }

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-24">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between p-3 rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`
            }
            end
          >
            <div className="flex items-center">
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <FiChevronRight className="w-4 h-4 transition-transform duration-200 opacity-0 group-hover:opacity-100" />
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Storage</h3>
          {(isNearLimit() || isOverLimit()) && (
            <FiAlertTriangle className={`w-4 h-4 ${getStorageTextColor()}`} />
          )}
        </div>
        
        {loading ? (
          <div className="animate-pulse">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-2">
              <div className="bg-gray-300 dark:bg-gray-500 h-2.5 rounded-full w-1/3"></div>
            </div>
            <p className="text-xs text-gray-400">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-xs text-red-500 dark:text-red-400">
            Error loading storage data
          </div>
        ) : (
          <>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full transition-all duration-300 ${getStorageBarColor()}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            <p className={`text-xs mt-2 ${getStorageTextColor()}`}>
              <span className="font-medium">{percentage}%</span> of {formatTotalStorage()} used
              {isOverLimit() && (
                <span className="block text-red-600 dark:text-red-400 font-medium">
                  Storage limit exceeded
                </span>
              )}
              {isNearLimit() && !isOverLimit() && (
                <span className="block text-yellow-600 dark:text-yellow-400">
                  Approaching limit
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatUsedStorage()} used
            </p>
          </>
        )}
      </div>
    </aside>
  )
}
