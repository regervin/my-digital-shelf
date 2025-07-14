import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '@headlessui/react';
import { User, Lock, CreditCard, Settings as SettingsIcon, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
  
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
    { name: 'Memberships', icon: <Users className="h-5 w-5" /> },
    { name: 'Account', icon: <SettingsIcon className="h-5 w-5" /> },
  ];

  // Handle tab selection
  const handleTabChange = (index) => {
    if (categories[index].name === 'Memberships') {
      navigate('/memberships');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Tab.Group onChange={handleTabChange}>
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
              
              {/* Memberships - Redirects to /memberships */}
              <Tab.Panel>
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Redirecting to memberships...</p>
                </div>
              </Tab.Panel>
              
              {/* Account Settings */}
              <Tab.Panel>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Account Management
                    </h3>
                    
                    {/* Development Admin Promotion */}
                    {process.env.NODE_ENV === 'development' && userRole !== 'admin' && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <SettingsIcon className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                              Development Mode
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                              <p>You can promote yourself to admin for testing purposes.</p>
                            </div>
                            <div className="mt-4">
                              <button
                                onClick={handlePromoteToAdmin}
                                disabled={isPromoting}
                                className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                              >
                                {isPromoting ? 'Promoting...' : 'Promote to Admin'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                        Danger Zone
                      </h4>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        Delete Account
                      </button>
                    </div>
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
