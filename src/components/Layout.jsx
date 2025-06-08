import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useAuth } from '../contexts/AuthContext'
import { useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

export default function Layout() {
  const { user } = useAuth()
  const location = useLocation()
  
  // Check if the current route is a dashboard route
  const isDashboardRoute = user && 
    (location.pathname.startsWith('/dashboard') || 
     location.pathname.startsWith('/products') || 
     location.pathname.startsWith('/customers') || 
     location.pathname.startsWith('/sales') || 
     location.pathname.startsWith('/analytics') || 
     location.pathname.startsWith('/memberships') || 
     location.pathname.startsWith('/settings'))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toaster-bg, #fff)',
            color: 'var(--toaster-color, #333)',
            border: '1px solid var(--toaster-border, #e2e8f0)',
          },
          success: {
            style: {
              '--toaster-bg': '#f0fdf4',
              '--toaster-color': '#166534',
              '--toaster-border': '#bbf7d0',
            },
          },
          error: {
            style: {
              '--toaster-bg': '#fef2f2',
              '--toaster-color': '#b91c1c',
              '--toaster-border': '#fecaca',
            },
          },
        }}
      />
      <Navbar />
      
      <div className="flex-1">
        {isDashboardRoute ? (
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Sidebar />
              <main className="flex-1 animate-fade-in">
                <Outlet />
              </main>
            </div>
          </div>
        ) : (
          <main className="container mx-auto px-4 py-8 animate-fade-in">
            <Outlet />
          </main>
        )}
      </div>
      
      {!isDashboardRoute && (
        <footer className="bg-white dark:bg-gray-800 shadow-inner py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  &copy; {new Date().getFullYear()} MyDigitalShelf. All rights reserved.
                </p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
