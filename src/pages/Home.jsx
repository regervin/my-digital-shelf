import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiPackage, FiCreditCard, FiDownload, FiShield, FiBarChart2, FiGlobe } from 'react-icons/fi'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
          MyDigitalShelf
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Create, sell, and deliver digital products with ease. Manage your digital inventory, 
          process payments, and automate delivery all in one place.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary px-8 py-3 text-lg">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary px-8 py-3 text-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline px-8 py-3 text-lg">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="text-primary-500 mb-4">
            <FiPackage className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Digital Products</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sell e-books, courses, software, templates, and any other digital products with secure delivery.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="text-primary-500 mb-4">
            <FiCreditCard className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Membership Sites</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage membership sites with recurring payments and protected content access.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="text-primary-500 mb-4">
            <FiDownload className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Automated Delivery</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Automatically deliver products to customers after purchase with secure download links.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="text-primary-500 mb-4">
            <FiShield className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-semibold mb-2">License Protection</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Protect your digital products with license keys and download limits to prevent unauthorized sharing.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="text-primary-500 mb-4">
            <FiBarChart2 className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Sales Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your sales, revenue, and customer behavior with detailed analytics and reports.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="text-primary-500 mb-4">
            <FiGlobe className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Global Payments</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Accept payments from customers worldwide with multiple payment gateway integrations.
          </p>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our platform makes selling digital products simple and straightforward.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
            <h3 className="font-semibold mb-2">Create Account</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Sign up and set up your seller profile</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
            <h3 className="font-semibold mb-2">Upload Products</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Add your digital products and set prices</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
            <h3 className="font-semibold mb-2">Share Your Store</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Promote your products with a custom storefront</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
            <h3 className="font-semibold mb-2">Get Paid</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Receive payments directly to your account</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to start selling?</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Join thousands of creators who are successfully selling digital products online.
        </p>
        {user ? (
          <Link to="/dashboard" className="btn btn-primary px-8 py-3 text-lg">
            Go to Dashboard
          </Link>
        ) : (
          <Link to="/register" className="btn btn-primary px-8 py-3 text-lg">
            Create Your Account
          </Link>
        )}
      </div>
    </div>
  )
}
