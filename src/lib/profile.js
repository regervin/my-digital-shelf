import { supabase } from './supabase';

export async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      // If profile doesn't exist, create one
      if (error.code === 'PGRST116') {
        const newProfile = {
          id: userId,
          role: 'user',
          created_at: new Date().toISOString()
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();
        
        if (createError) {
          throw createError;
        }
        
        return { data: createdProfile, error: null };
      }
      
      throw error;
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Error in getProfile:', err);
    return { data: null, error: err };
  }
}

export async function updateProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Error in updateProfile:', err);
    return { data: null, error: err };
  }
}
