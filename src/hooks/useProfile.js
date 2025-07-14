import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile as updateProfileUtil } from '../lib/profile';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const auth = useAuth();
  const user = auth?.user;
  
  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: profileError } = await getProfile(user.id);
        
        if (profileError) {
          console.error('Profile loading error:', profileError);
          setError(profileError);
          // Don't throw - allow component to handle gracefully
        } else {
          setProfile(data);
        }
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
      setError(null);
      
      const { data, error: updateError } = await updateProfileUtil(user.id, updates);
      
      if (updateError) {
        setError(updateError);
        return { success: false, error: updateError };
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
