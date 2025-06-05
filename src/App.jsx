import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import UpdatePassword from './pages/UpdatePassword'
import AuthCallback from './pages/AuthCallback'
import PrivateRoute from './components/PrivateRoute'
import Products from './pages/Products'
import CreateProduct from './pages/CreateProduct'
import EditProduct from './pages/EditProduct'
import ProductDetails from './pages/ProductDetails'
import Customers from './pages/Customers'
import CustomerDetails from './pages/CustomerDetails'
import Sales from './pages/Sales'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Memberships from './pages/Memberships'
import CreateMembership from './pages/CreateMembership'
import EditMembership from './pages/EditMembership'

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="update-password" element={<UpdatePassword />} />
          <Route path="auth/callback" element={<AuthCallback />} />
          
          {/* Protected Routes */}
          <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="products" element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path="products/create" element={<PrivateRoute><CreateProduct /></PrivateRoute>} />
          <Route path="products/:id" element={<PrivateRoute><ProductDetails /></PrivateRoute>} />
          <Route path="products/:id/edit" element={<PrivateRoute><EditProduct /></PrivateRoute>} />
          <Route path="customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
          <Route path="customers/:id" element={<PrivateRoute><CustomerDetails /></PrivateRoute>} />
          <Route path="sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
          <Route path="analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="memberships" element={<PrivateRoute><Memberships /></PrivateRoute>} />
          <Route path="memberships/create" element={<PrivateRoute><CreateMembership /></PrivateRoute>} />
          <Route path="memberships/:id/edit" element={<PrivateRoute><EditMembership /></PrivateRoute>} />
          <Route path="settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        </Route>
      </Routes>
    </>
  )
}

export default App
