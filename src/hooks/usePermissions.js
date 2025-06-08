import { useAuth } from '../contexts/AuthContext';

export function usePermissions() {
  const { userRole } = useAuth();
  
  const can = (permission) => {
    // Admin can do everything
    if (userRole === 'admin') return true;
    
    // Permission mapping based on roles
    const permissions = {
      'seller': [
        'create:product',
        'edit:own:product',
        'delete:own:product',
        'view:own:analytics',
        'manage:own:customers'
      ],
      'user': [
        'view:products',
        'purchase:products',
        'manage:own:profile'
      ]
    };
    
    // Check if the user's role has the requested permission
    return permissions[userRole]?.includes(permission) || false;
  };
  
  return { can };
}
