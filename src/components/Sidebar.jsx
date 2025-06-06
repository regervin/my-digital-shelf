import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiBox, FiUsers, FiDollarSign, FiCreditCard, FiSettings, FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar({ isMobile, toggleSidebar }) {
  const location = useLocation()
  const { user } = useAuth()
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }
  
  const navItems = [
    { path: '/', icon: <FiHome size={20} />, label: 'Dashboard' },
    { path: '/products', icon: <FiBox size={20} />, label: 'Products' },
    { path: '/memberships', icon: <FiCreditCard size={20} />, label: 'Memberships' },
    { path: '/customers', icon: <FiUsers size={20} />, label: 'Customers' },
    { path: '/sales', icon: <FiDollarSign size={20} />, label: 'Sales' },
    { path: '/settings', icon: <FiSettings size={20} />, label: 'Settings' },
  ]
  
  return (
    <div className={`h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${isMobile ? 'w-full' : 'w-64'}`}>
      {isMobile && (
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold">Digital Products</h1>
          <button onClick={toggleSidebar} className="p-2">
            <FiX size={24} />
          </button>
        </div>
      )}
      
      <div className={`${isMobile ? '' : 'p-6'} flex-1 overflow-y-auto`}>
        {!isMobile && (
          <div className="mb-8">
            <h1 className="text-xl font-bold">Digital Products</h1>
          </div>
        )}
        
        <nav>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={isMobile ? toggleSidebar : undefined}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {!isMobile && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400 flex items-center justify-center">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.email || 'User'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
