import { supabase } from './supabase';

// Get a user's profile with security check
export async function getProfile(userId) {
  try {
    // Security check: Only allow fetching the current user's profile or if admin
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    
    // If no current user, deny access
    if (!currentUserId) {
      return { 
        data: null, 
        error: new Error('Authentication required to access profile data') 
      };
    }
    
    // Get the current user's role to check if admin
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUserId)
      .maybeSingle();
    
    const isAdmin = currentUserProfile?.role === 'admin';
    
    // Only allow access if requesting own profile or is admin
    if (currentUserId !== userId && !isAdmin) {
      return { 
        data: null, 
        error: new Error('Unauthorized: You can only access your own profile') 
      };
    }
    
    // Proceed with the database query
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { data: null, error };
  }
}

// Update a user's profile with security check
export async function updateProfile(userId, updates) {
  try {
    // Security check: Only allow updating the current user's profile or if admin
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    
    // If no current user, deny access
    if (!currentUserId) {
      return { 
        data: null, 
        error: new Error('Authentication required to update profile') 
      };
    }
    
    // Get the current user's role to check if admin
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUserId)
      .maybeSingle();
    
    const isAdmin = currentUserProfile?.role === 'admin';
    
    // Only allow updates if updating own profile or is admin
    if (currentUserId !== userId && !isAdmin) {
      return { 
        data: null, 
        error: new Error('Unauthorized: You can only update your own profile') 
      };
    }
    
    // First check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return { data, error: null };
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ id: userId, ...updates }])
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return { data, error: null };
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }
}

// Create a user's profile with security check
export async function createProfile(userId, profileData) {
  try {
    // Security check: Only allow creating the current user's profile or if admin
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    
    // If no current user, deny access
    if (!currentUserId) {
      return { 
        data: null, 
        error: new Error('Authentication required to create profile') 
      };
    }
    
    // Get the current user's role to check if admin
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUserId)
      .maybeSingle();
    
    const isAdmin = currentUserProfile?.role === 'admin';
    
    // Only allow creation if creating own profile or is admin
    if (currentUserId !== userId && !isAdmin) {
      return { 
        data: null, 
        error: new Error('Unauthorized: You can only create your own profile') 
      };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: userId, ...profileData }])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating profile:', error);
    return { data: null, error };
  }
}

// Delete a user's profile with security check
export async function deleteProfile(userId) {
  try {
    // Security check: Only allow deleting the current user's profile or if admin
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    
    // If no current user, deny access
    if (!currentUserId) {
      return { 
        success: false, 
        error: new Error('Authentication required to delete profile') 
      };
    }
    
    // Get the current user's role to check if admin
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUserId)
      .maybeSingle();
    
    const isAdmin = currentUserProfile?.role === 'admin';
    
    // Only allow deletion if deleting own profile or is admin
    if (currentUserId !== userId && !isAdmin) {
      return { 
        success: false, 
        error: new Error('Unauthorized: You can only delete your own profile') 
      };
    }
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting profile:', error);
    return { success: false, error };
  }
}

// Get all profiles with security check (admin only)
export async function getAllProfiles() {
  try {
    // Security check: Only allow admin to get all profiles
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    
    // If no current user, deny access
    if (!currentUserId) {
      return { 
        data: null, 
        error: new Error('Authentication required to access all profiles') 
      };
    }
    
    // Get the current user's role to check if admin
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUserId)
      .maybeSingle();
    
    const isAdmin = currentUserProfile?.role === 'admin';
    
    // Only allow admin to get all profiles
    if (!isAdmin) {
      return { 
        data: null, 
        error: new Error('Unauthorized: Only admins can access all profiles') 
      };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    return { data: null, error };
  }
}
