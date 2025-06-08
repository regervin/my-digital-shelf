import { useState, useEffect, useRef } from 'react'
import { FiBell } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)

  // Mock notifications - in a real app, these would come from an API
  useEffect(() => {
    // Simulate fetching notifications
    const mockNotifications = [
      {
        id: 1,
        title: 'New customer sign-up',
        message: 'John Doe just signed up for a membership.',
        time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        type: 'customer'
      },
      {
        id: 2,
        title: 'Payment received',
        message: 'You received a payment of $49.99 for Premium Plan.',
        time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        type: 'payment'
      },
      {
        id: 3,
        title: 'Product update',
        message: 'Your product "Digital Marketing Guide" was updated successfully.',
        time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        type: 'product'
      }
    ]
    
    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id))
    // Update unread count if needed
    const notificationToDelete = notifications.find(n => n.id === id)
    if (notificationToDelete && !notificationToDelete.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const deleteAllRead = () => {
    const unreadNotifications = notifications.filter(notification => !notification.read)
    setNotifications(unreadNotifications)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'customer':
        return <span className="flex h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center">
          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </span>
      case 'payment':
        return <span className="flex h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center">
          <svg className="h-5 w-5 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      case 'product':
        return <span className="flex h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center">
          <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </span>
      default:
        return <span className="flex h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center">
          <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-1 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        aria-label="Notifications"
      >
        <FiBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center transform translate-x-1 -translate-y-1">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="dropdown-menu w-80 sm:w-96 animate-fade-in">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                  >
                    Mark all as read
                  </button>
                )}
                {notifications.some(n => n.read) && (
                  <button 
                    onClick={deleteAllRead}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    Delete read
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <div className="flex items-start">
                      {getNotificationIcon(notification.type)}
                      <div className="ml-3 w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          {formatDistanceToNow(notification.time, { addSuffix: true })}
                        </p>
                      </div>
                      <div className="ml-2 flex flex-col space-y-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                </div>
              )}
            </div>
            
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
              <button className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
                View all notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
