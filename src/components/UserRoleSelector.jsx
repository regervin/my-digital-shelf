import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function UserRoleSelector({ userId, currentRole, onRoleChange }) {
  const { userRole } = useAuth();
  const [role, setRole] = useState(currentRole || 'user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Only admins can change roles
  if (userRole !== 'admin') {
    return (
      <div className="text-sm text-gray-500">
        Role: <span className="font-medium">{currentRole || 'user'}</span>
      </div>
    );
  }
  
  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    
    if (onRoleChange) {
      onRoleChange(newRole);
      return;
    }
    
    // If no callback is provided, update the role directly
    if (userId) {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);
        
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('id', userId);
        
        if (error) throw error;
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error('Error updating role:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        User Role
      </label>
      
      <select
        value={role}
        onChange={handleRoleChange}
        disabled={loading}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
      >
        <option value="user">User</option>
        <option value="seller">Seller</option>
        <option value="admin">Admin</option>
      </select>
      
      {loading && (
        <div className="text-sm text-gray-500">
          Updating role...
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-600">
          Error: {error}
        </div>
      )}
      
      {success && (
        <div className="text-sm text-green-600">
          Role updated successfully!
        </div>
      )}
    </div>
  );
}
