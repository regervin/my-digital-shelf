import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile as updateProfileUtil } from '../lib/profile';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add fallback for useAuth to prevent errors
  const auth = useAuth() || { user: null };
  const { user } = auth;
  
  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error } = await getProfile(user.id);
        
        if (error) {
          throw error;
        }
        
        setProfile(data);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [user]);
  
  const updateProfile = async (updates) => {
    if (!user) {
      return { success: false, error: new Error('User not authenticated') };
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await updateProfileUtil(user.id, updates);
      
      if (error) {
        throw error;
      }
      
      setProfile(data);
      return { success: true, data };
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };
  
  return { profile, loading, error, updateProfile };
}
