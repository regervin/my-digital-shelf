import { supabase } from './supabase';

/**
 * Fetches a user's profile from the database
 * 
 * @param {string} userId - The user ID to fetch the profile for
 * @returns {Promise<Object>} The profile data and any error
 */
export async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { data: null, error };
  }
}

/**
 * Updates a user's profile in the database
 * 
 * @param {string} userId - The user ID to update the profile for
 * @param {Object} updates - The profile fields to update
 * @returns {Promise<Object>} The updated profile data and any error
 */
export async function updateProfile(userId, updates) {
  try {
    // Add updated_at timestamp
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }
}
