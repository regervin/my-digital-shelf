import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import CreateProduct from './pages/CreateProduct'
import ProductDetails from './pages/ProductDetails'
import EditProduct from './pages/EditProduct'
import Memberships from './pages/Memberships'
import CreateMembership from './pages/CreateMembership'
import MembershipDetails from './pages/MembershipDetails'
import EditMembership from './pages/EditMembership'
import Customers from './pages/Customers'
import CreateCustomer from './pages/CreateCustomer'
import CustomerDetails from './pages/CustomerDetails'
import EditCustomer from './pages/EditCustomer'
import Sales from './pages/Sales'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          <Route path="dashboard" element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
          </Route>
          
          <Route path="products" element={<ProtectedRoute />}>
            <Route index element={<Products />} />
            <Route path="new" element={<CreateProduct />} />
            <Route path=":id" element={<ProductDetails />} />
            <Route path="edit/:id" element={<EditProduct />} />
          </Route>
          
          <Route path="memberships" element={<ProtectedRoute />}>
            <Route index element={<Memberships />} />
            <Route path="new" element={<CreateMembership />} />
            <Route path=":id" element={<MembershipDetails />} />
            <Route path="edit/:id" element={<EditMembership />} />
          </Route>
          
          <Route path="customers" element={<ProtectedRoute />}>
            <Route index element={<Customers />} />
            <Route path="new" element={<CreateCustomer />} />
            <Route path=":id" element={<CustomerDetails />} />
            <Route path="edit/:id" element={<EditCustomer />} />
          </Route>
          
          <Route path="sales" element={<ProtectedRoute />}>
            <Route index element={<Sales />} />
          </Route>
          
          <Route path="analytics" element={<ProtectedRoute />}>
            <Route index element={<Analytics />} />
          </Route>
          
          <Route path="settings" element={<ProtectedRoute />}>
            <Route index element={<Settings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
