import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import CreateProduct from './pages/CreateProduct'
import ProductDetail from './pages/ProductDetail'
import EditProduct from './pages/EditProduct'
import Customers from './pages/Customers'
import Sales from './pages/Sales'
import SaleDetail from './pages/SaleDetail'
import CreateSale from './pages/CreateSale'
import Memberships from './pages/Memberships'
import CreateMembership from './pages/CreateMembership'
import MembershipDetail from './pages/MembershipDetail'
import EditMembership from './pages/EditMembership'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            
            <Route path="products">
              <Route index element={<Products />} />
              <Route path="create" element={<CreateProduct />} />
              <Route path=":id" element={<ProductDetail />} />
              <Route path=":id/edit" element={<EditProduct />} />
            </Route>
            
            <Route path="memberships">
              <Route index element={<Memberships />} />
              <Route path="create" element={<CreateMembership />} />
              <Route path=":id" element={<MembershipDetail />} />
              <Route path=":id/edit" element={<EditMembership />} />
            </Route>
            
            <Route path="customers">
              <Route index element={<Customers />} />
            </Route>
            
            <Route path="sales">
              <Route index element={<Sales />} />
              <Route path=":id" element={<SaleDetail />} />
              <Route path="create" element={<CreateSale />} />
            </Route>
            
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
