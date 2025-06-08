import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component that conditionally renders content based on user role
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.adminContent - Content to show for admin users
 * @param {React.ReactNode} props.sellerContent - Content to show for seller users
 * @param {React.ReactNode} props.userContent - Content to show for regular users
 * @param {React.ReactNode} props.fallback - Content to show if no role matches or user is not authenticated
 * @param {string[]} props.allowedRoles - Array of roles that can view this component
 */
export default function RoleBasedComponent({
  adminContent,
  sellerContent,
  userContent,
  fallback = null,
  allowedRoles = ['admin', 'seller', 'user']
}) {
  const { userRole, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // Check if user's role is in the allowed roles
  if (!userRole || !allowedRoles.includes(userRole)) {
    return fallback;
  }
  
  // Render content based on user role
  if (userRole === 'admin' && adminContent) {
    return adminContent;
  }
  
  if (userRole === 'seller' && sellerContent) {
    return sellerContent;
  }
  
  if (userRole === 'user' && userContent) {
    return userContent;
  }
  
  return fallback;
}
