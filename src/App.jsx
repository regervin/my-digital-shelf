import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import EditProduct from './pages/EditProduct'
import Customers from './pages/Customers'
import CustomerDetails from './pages/CustomerDetails'
import EditCustomer from './pages/EditCustomer'
import Sales from './pages/Sales'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import Memberships from './pages/Memberships'
import MembershipDetails from './pages/MembershipDetails'
import EditMembership from './pages/EditMembership'
import PrivateRoute from './components/PrivateRoute'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { loading } = useAuth() || { loading: true };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        
        {/* Protected routes */}
        <Route path="dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="products" element={
          <PrivateRoute>
            <Products />
          </PrivateRoute>
        } />
        <Route path="products/:id" element={
          <PrivateRoute>
            <ProductDetails />
          </PrivateRoute>
        } />
        <Route path="products/:id/edit" element={
          <PrivateRoute>
            <EditProduct />
          </PrivateRoute>
        } />
        <Route path="memberships" element={
          <PrivateRoute>
            <Memberships />
          </PrivateRoute>
        } />
        <Route path="memberships/:id" element={
          <PrivateRoute>
            <MembershipDetails />
          </PrivateRoute>
        } />
        <Route path="memberships/:id/edit" element={
          <PrivateRoute>
            <EditMembership />
          </PrivateRoute>
        } />
        <Route path="customers" element={
          <PrivateRoute>
            <Customers />
          </PrivateRoute>
        } />
        <Route path="customers/:id" element={
          <PrivateRoute>
            <CustomerDetails />
          </PrivateRoute>
        } />
        <Route path="customers/:id/edit" element={
          <PrivateRoute>
            <EditCustomer />
          </PrivateRoute>
        } />
        <Route path="sales" element={
          <PrivateRoute>
            <Sales />
          </PrivateRoute>
        } />
        <Route path="analytics" element={
          <PrivateRoute>
            <Analytics />
          </PrivateRoute>
        } />
        <Route path="settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
