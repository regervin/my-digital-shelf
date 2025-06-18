import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '@headlessui/react';
import { User, Lock, CreditCard, Settings as SettingsIcon } from 'lucide-react';
import ProfileSettings from '../components/Settings/ProfileSettings';
import PasswordSettings from '../components/Settings/PasswordSettings';
import PaymentSettings from '../components/Settings/PaymentSettings';
import { promoteSelfToAdmin } from '../utils/adminPromotion';
import toast from 'react-hot-toast';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Settings() {
  const { user, userRole } = useAuth() || { user: null, userRole: null };
  const [isPromoting, setIsPromoting] = useState(false);
  
  // Function to handle admin promotion (development only)
  const handlePromoteToAdmin = async () => {
    if (!user) return;
    
    setIsPromoting(true);
    try {
      const result = await promoteSelfToAdmin();
      
      if (result.success) {
        toast.success('You have been promoted to admin. Please refresh the page.');
      } else {
        toast.error(result.message || 'Failed to promote to admin');
      }
    } catch (error) {
      toast.error('An error occurred during promotion');
      console.error(error);
    } finally {
      setIsPromoting(false);
    }
  };
  
  const categories = [
    { name: 'Profile', icon: <User className="h-5 w-5" /> },
    { name: 'Password', icon: <Lock className="h-5 w-5" /> },
    { name: 'Payment', icon: <CreditCard className="h-5 w-5" /> },
    { name: 'Account', icon: <SettingsIcon className="h-5 w-5" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Tab.Group>
          <div className="sm:flex">
            <Tab.List className="sm:w-64 bg-gray-50 dark:bg-gray-900 p-4 sm:p-0">
              <div className="sm:h-full sm:flex sm:flex-col">
                {categories.map((category, index) => (
                  <Tab
                    key={category.name}
                    className={({ selected }) =>
                      classNames(
                        'w-full py-4 px-6 text-left focus:outline-none transition-colors',
                        'flex items-center space-x-3',
                        selected
                          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      )
                    }
                  >
                    <span className="text-gray-400 dark:text-gray-500">{category.icon}</span>
                    <span>{category.name}</span>
                  </Tab>
                ))}
              </div>
            </Tab.List>
            
            <Tab.Panels className="flex-1 p-6">
              {/* Profile Settings */}
              <Tab.Panel>
                <ProfileSettings />
              </Tab.Panel>
              
              {/* Password Settings */}
              <Tab.Panel>
                <PasswordSettings />
              </Tab.Panel>
              
              {/* Payment Settings */}
              <Tab.Panel>
                <PaymentSettings />
              </Tab.Panel>
              
              {/* Account Settings */}
              <Tab.Panel>
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                      <SettingsIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-medium">Account Information</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{user?.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User Role</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{userRole || 'user'}</p>
                    </div>
                    
                    {/* Admin promotion button (development only) */}
                    {process.env.NODE_ENV !== 'production' && userRole !== 'admin' && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Development Tools
                        </h3>
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md mb-4">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Warning: These tools are for development purposes only.
                          </p>
                        </div>
                        <button
                          onClick={handlePromoteToAdmin}
                          disabled={isPromoting}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPromoting ? 'Promoting...' : 'Promote to Admin (Dev Only)'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </div>
        </Tab.Group>
      </div>
    </div>
  );
}
