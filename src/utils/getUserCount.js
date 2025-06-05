import { supabase } from '../lib/supabase';

export async function getUserCount() {
  try {
    // Query the auth.users table to get the count
    const { count, error } = await supabase
      .from('auth.users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error fetching user count:', error);
      return { count: null, error };
    }
    
    return { count, error: null };
  } catch (err) {
    console.error('Unexpected error fetching user count:', err);
    return { count: null, error: err };
  }
}
