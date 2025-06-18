import { supabase } from '../lib/supabase';

/**
 * Promotes a user to admin role
 * 
 * @param {string} userId - The ID of the user to promote
 * @returns {Promise<Object>} Result of the operation
 */
export async function promoteToAdmin(userId) {
  try {
    // Update the user's role to admin
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    
    return { 
      success: true, 
      data,
      message: `User ${userId} has been promoted to admin`
    };
  } catch (err) {
    console.error('Error promoting user to admin:', err);
    return { 
      success: false, 
      error: err,
      message: `Failed to promote user: ${err.message}`
    };
  }
}

/**
 * Promotes the currently logged in user to admin
 * Only use this during development or for initial setup!
 * 
 * @returns {Promise<Object>} Result of the operation
 */
export async function promoteSelfToAdmin() {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user is currently logged in');
    }
    
    // Promote the current user to admin
    return await promoteToAdmin(user.id);
  } catch (err) {
    console.error('Error promoting self to admin:', err);
    return { 
      success: false, 
      error: err,
      message: `Failed to promote self: ${err.message}`
    };
  }
}
