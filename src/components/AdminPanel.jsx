import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

export default function AdminPanel() {
  const { userRole } = useAuth();
  const { can } = usePermissions();
  
  // Redirect or show error if not admin
  if (userRole !== 'admin') {
    return (
      <div className="p-4 bg-red-50 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
        <p className="mt-2 text-sm text-red-700">
          You need admin permissions to view this panel.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Admin Control Panel
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Manage users, roles, and system settings.
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <div className="text-sm font-medium text-gray-500">User Management</div>
          <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {can('manage:users') ? (
              <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Manage Users
              </button>
            ) : (
              <span className="text-red-500">Permission denied</span>
            )}
          </div>
        </div>
        
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <div className="text-sm font-medium text-gray-500">Role Management</div>
          <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {can('manage:roles') ? (
              <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Manage Roles
              </button>
            ) : (
              <span className="text-red-500">Permission denied</span>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <div className="text-sm font-medium text-gray-500">System Settings</div>
          <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {can('manage:settings') ? (
              <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                System Settings
              </button>
            ) : (
              <span className="text-red-500">Permission denied</span>
            )}
          </div>
        </div>
        
        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <div className="text-sm font-medium text-gray-500">Analytics</div>
          <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {can('view:analytics') ? (
              <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                View Analytics
              </button>
            ) : (
              <span className="text-red-500">Permission denied</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
