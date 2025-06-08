import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component that conditionally renders children based on user role
 * 
 * @param {Object} props
 * @param {string|string[]} props.requiredRole - Role(s) required to view the content
 * @param {React.ReactNode} props.children - Content to show if user has required role
 * @param {React.ReactNode} props.fallback - Content to show if user doesn't have required role
 */
export default function RoleGuard({ 
  requiredRole, 
  children, 
  fallback = null 
}) {
  const { userRole, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // Check if user has the required role
  const hasRequiredRole = () => {
    if (!userRole) return false;
    
    // If requiredRole is an array, check if userRole is in the array
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    // Special case: 'seller' role also grants access to 'user' content
    if (requiredRole === 'user' && userRole === 'seller') {
      return true;
    }
    
    // Special case: 'admin' role grants access to all content
    if (userRole === 'admin') {
      return true;
    }
    
    // Direct role match
    return userRole === requiredRole;
  };
  
  return hasRequiredRole() ? children : fallback;
}
