import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

export default function ProfileRoleInfo() {
  const { userRole, isAdmin, isSeller, isUser } = useAuth();
  const { can } = usePermissions();
  
  const getRoleBadgeColor = () => {
    if (isAdmin) return 'bg-purple-100 text-purple-800';
    if (isSeller) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  const getRoleIcon = () => {
    if (isAdmin) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      );
    }
    if (isSeller) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    );
  };
  
  const getRoleDescription = () => {
    if (isAdmin) {
      return 'As an admin, you have full access to all features and can manage users, products, and system settings.';
    }
    if (isSeller) {
      return 'As a seller, you can create and manage your own products, view sales analytics, and manage your customer memberships.';
    }
    return 'As a user, you can browse and purchase products, manage your profile, and view your membership status.';
  };
  
  const getRoleCapabilities = () => {
    if (isAdmin) {
      return [
        'Manage all users and their roles',
        'Create, edit, and delete any products',
        'Access system settings and configurations',
        'View comprehensive analytics and reports',
        'Manage all memberships and subscriptions'
      ];
    }
    if (isSeller) {
      return [
        'Create and manage your own products',
        'View analytics for your products',
        'Manage your customer memberships',
        'Access seller dashboard',
        'Customize your seller profile'
      ];
    }
    return [
      'Browse and purchase products',
      'Manage your profile information',
      'View your purchase history',
      'Access your digital downloads',
      'Manage your membership status'
    ];
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Role Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your permissions and capabilities in the system.
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
          {getRoleIcon()}
          <span className="ml-1 capitalize">{userRole}</span>
        </span>
      </div>
      
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Role Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {getRoleDescription()}
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Capabilities</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {getRoleCapabilities().map((capability, index) => (
                  <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-2 flex-1 w-0 truncate">
                        {capability}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
          
          {isAdmin && (
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Admin Tools</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="space-x-2">
                  <a 
                    href="/admin/users" 
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    User Management
                  </a>
                  <a 
                    href="/admin/settings" 
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    System Settings
                  </a>
                </div>
              </dd>
            </div>
          )}
          
          {isSeller && (
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Seller Tools</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="space-x-2">
                  <a 
                    href="/seller/products" 
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Manage Products
                  </a>
                  <a 
                    href="/seller/analytics" 
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Sales Analytics
                  </a>
                </div>
              </dd>
            </div>
          )}
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Permission Check</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="mr-2">Can create products:</span>
                  {can('create:product') ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-red-600 font-medium">No</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <span className="mr-2">Can manage users:</span>
                  {can('manage:users') ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-red-600 font-medium">No</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <span className="mr-2">Can view analytics:</span>
                  {can('view:analytics') || can('view:own:analytics') ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-red-600 font-medium">No</span>
                  )}
                </div>
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
