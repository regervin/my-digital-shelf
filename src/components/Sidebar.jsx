import { NavLink } from 'react-router-dom'
import { 
  FiHome, 
  FiPackage, 
  FiUsers, 
  FiDollarSign, 
  FiBarChart2, 
  FiSettings,
  FiCreditCard,
  FiChevronRight
} from 'react-icons/fi'

export default function Sidebar() {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { path: '/products', label: 'Products', icon: <FiPackage className="w-5 h-5" /> },
    { path: '/memberships', label: 'Memberships', icon: <FiCreditCard className="w-5 h-5" /> },
    { path: '/customers', label: 'Customers', icon: <FiUsers className="w-5 h-5" /> },
    { path: '/sales', label: 'Sales', icon: <FiDollarSign className="w-5 h-5" /> },
    { path: '/analytics', label: 'Analytics', icon: <FiBarChart2 className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <FiSettings className="w-5 h-5" /> },
  ]

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
          >
            <div className="flex items-center">
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <FiChevronRight className={({ isActive }) => 
              `w-4 h-4 transition-transform duration-200 ${isActive ? 'transform rotate-90 opacity-100' : 'opacity-0'}`
            } />
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Storage</h3>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
          <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span className="font-medium">45%</span> of 10GB used
        </p>
      </div>
    </aside>
  )
}
