import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function CreateSale() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [memberships, setMemberships] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  
  const [formData, setFormData] = useState({
    customer_id: '',
    item_type: 'product', // 'product' or 'membership'
    item_id: '',
    amount: '',
    status: 'completed'
  })

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoadingCustomers(true)
        
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, email')
          .order('name')
        
        if (error) {
          throw error
        }
        
        setCustomers(data || [])
        setLoadingCustomers(false)
      } catch (error) {
        console.error('Error fetching customers:', error)
        toast.error('Failed to load customers')
        setLoadingCustomers(false)
      }
    }
    
    async function fetchProducts() {
      try {
        setLoadingProducts(true)
        
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name, price, status')
          .eq('status', 'active')
          .order('name')
        
        if (productsError) {
          throw productsError
        }
        
        // Fetch memberships
        const { data: membershipsData, error: membershipsError } = await supabase
          .from('memberships')
          .select('id, name, price, status')
          .eq('status', 'active')
          .order('name')
        
        if (membershipsError) {
          throw membershipsError
        }
        
        setProducts(productsData || [])
        setMemberships(membershipsData || [])
        setLoadingProducts(false)
      } catch (error) {
        console.error('Error fetching products/memberships:', error)
        toast.error('Failed to load products and memberships')
        setLoadingProducts(false)
      }
    }
    
    fetchCustomers()
    fetchProducts()
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'item_type') {
      // Reset item_id when switching between product and membership
      setFormData({
        ...formData,
        [name]: value,
        item_id: ''
      })
    } else if (name === 'item_id') {
      // When selecting a product/membership, auto-fill the amount
      let amount = ''
      
      if (formData.item_type === 'product') {
        const selectedProduct = products.find(p => p.id === value)
        amount = selectedProduct ? selectedProduct.price : ''
      } else {
        const selectedMembership = memberships.find(m => m.id === value)
        amount = selectedMembership ? selectedMembership.price : ''
      }
      
      setFormData({
        ...formData,
        [name]: value,
        amount: amount
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      
      // Validate form
      if (!formData.customer_id) {
        toast.error('Please select a customer')
        return
      }
      
      if (!formData.item_id) {
        toast.error(`Please select a ${formData.item_type}`)
        return
      }
      
      if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
        toast.error('Please enter a valid amount')
        return
      }
      
      // Prepare data for insertion
      const saleData = {
        customer_id: formData.customer_id,
        amount: formData.amount,
        status: formData.status,
        seller_id: user.id
      }
      
      // Add either product_id or membership_id based on selection
      if (formData.item_type === 'product') {
        saleData.product_id = formData.item_id
      } else {
        saleData.membership_id = formData.item_id
      }
      
      // Insert the sale
      const { data, error } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
      
      if (error) {
        throw error
      }
      
      toast.success('Sale created successfully')
      navigate('/sales')
    } catch (error) {
      console.error('Error creating sale:', error)
      toast.error('Failed to create sale')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/sales" className="mr-4 text-gray-500 hover:text-primary-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Create Sale</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer
              </label>
              <select
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
                disabled={loadingCustomers}
                required
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
              {loadingCustomers && (
                <p className="text-sm text-gray-500 mt-1">Loading customers...</p>
              )}
              {!loadingCustomers && customers.length === 0 && (
                <div className="text-sm text-gray-500 mt-1">
                  No customers found. <Link to="/customers/create" className="text-primary-600">Create one</Link>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Item Type
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="item_type"
                    value="product"
                    checked={formData.item_type === 'product'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2">Product</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="item_type"
                    value="membership"
                    checked={formData.item_type === 'membership'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-primary-600"
                  />
                  <span className="ml-2">Membership</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {formData.item_type === 'product' ? 'Product' : 'Membership'}
              </label>
              <select
                name="item_id"
                value={formData.item_id}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
                disabled={loadingProducts}
                required
              >
                <option value="">Select {formData.item_type === 'product' ? 'Product' : 'Membership'}</option>
                {formData.item_type === 'product' ? (
                  products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (${parseFloat(product.price).toFixed(2)})
                    </option>
                  ))
                ) : (
                  memberships.map(membership => (
                    <option key={membership.id} value={membership.id}>
                      {membership.name} (${parseFloat(membership.price).toFixed(2)})
                    </option>
                  ))
                )}
              </select>
              {loadingProducts && (
                <p className="text-sm text-gray-500 mt-1">Loading {formData.item_type === 'product' ? 'products' : 'memberships'}...</p>
              )}
              {!loadingProducts && formData.item_type === 'product' && products.length === 0 && (
                <div className="text-sm text-gray-500 mt-1">
                  No products found. <Link to="/products/create" className="text-primary-600">Create one</Link>
                </div>
              )}
              {!loadingProducts && formData.item_type === 'membership' && memberships.length === 0 && (
                <div className="text-sm text-gray-500 mt-1">
                  No memberships found. <Link to="/memberships/create" className="text-primary-600">Create one</Link>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="pl-8 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
                required
              >
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Link to="/sales" className="btn btn-outline mr-2">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                <span className="flex items-center">
                  <FiSave className="mr-2" />
                  Create Sale
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
