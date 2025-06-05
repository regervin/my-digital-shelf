import { NavLink } from 'react-router-dom'
import { 
  FiHome, 
  FiPackage, 
  FiUsers, 
  FiDollarSign, 
  FiBarChart2, 
  FiSettings,
  FiCreditCard
} from 'react-icons/fi'

export default function Sidebar() {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { path: '/products', label: 'Products', icon: <FiPackage /> },
    { path: '/memberships', label: 'Memberships', icon: <FiCreditCard /> },
    { path: '/customers', label: 'Customers', icon: <FiUsers /> },
    { path: '/sales', label: 'Sales', icon: <FiDollarSign /> },
    { path: '/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
    { path: '/settings', label: 'Settings', icon: <FiSettings /> },
  ]

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
