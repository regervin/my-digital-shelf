import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for managing user roles
 * 
 * @returns {Object} Role management functions and state
 */
export function useRoleManagement() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Change a user's role
   * 
   * @param {string} userId - The user ID to update
   * @param {string} newRole - The new role to assign
   * @returns {Object} Result of the operation
   */
  const changeUserRole = async (userId, newRole) => {
    try {
      if (!isAdmin) {
        throw new Error('Only admins can change user roles');
      }
      
      if (!['admin', 'seller', 'user'].includes(newRole)) {
        throw new Error('Invalid role');
      }
      
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (err) {
      console.error('Error changing user role:', err);
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Get all users with their roles
   * 
   * @returns {Object} Result with users data
   */
  const getAllUsers = async () => {
    try {
      if (!isAdmin) {
        throw new Error('Only admins can view all users');
      }
      
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    changeUserRole,
    getAllUsers,
    loading,
    error
  };
}
