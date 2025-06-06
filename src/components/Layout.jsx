import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useAuth } from '../contexts/AuthContext'
import { useLocation } from 'react-router-dom'

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {isDashboardRoute ? (
          <div className="flex flex-col md:flex-row gap-6">
            <Sidebar />
            <main className="flex-1">
              <Outlet />
            </main>
          </div>
        ) : (
          <main>
            <Outlet />
          </main>
        )}
      </div>
    </div>
  )
}
