import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useDisputes() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setDisputes([]);
      setLoading(false);
      return;
    }

    async function fetchDisputes() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('disputes')
          .select(`
            *,
            sale:sales(
              *,
              product:products(*),
              membership:memberships(*),
              customer:customers(*)
            ),
            customer:customers(*)
          `)
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setDisputes(data || []);
      } catch (err) {
        console.error('Error fetching disputes:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDisputes();
  }, [user]);

  const addDispute = async (disputeData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const newDispute = {
        ...disputeData,
        seller_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('disputes')
        .insert([newDispute])
        .select(`
          *,
          sale:sales(
            *,
            product:products(*),
            membership:memberships(*),
            customer:customers(*)
          ),
          customer:customers(*)
        `)
        .single();
      
      if (error) {
        throw error;
      }
      
      setDisputes(prevDisputes => [data, ...prevDisputes]);
      return { success: true, data };
    } catch (err) {
      console.error('Error adding dispute:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateDispute = async (id, updates) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // If status is being set to resolved, add resolved_at timestamp
      if (updates.status === 'resolved' && !updates.resolved_at) {
        updatedData.resolved_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('disputes')
        .update(updatedData)
        .eq('id', id)
        .eq('seller_id', user.id) // Security check
        .select(`
          *,
          sale:sales(
            *,
            product:products(*),
            membership:memberships(*),
            customer:customers(*)
          ),
          customer:customers(*)
        `)
        .single();
      
      if (error) {
        throw error;
      }
      
      setDisputes(prevDisputes => 
        prevDisputes.map(dispute => 
          dispute.id === id ? data : dispute
        )
      );
      
      return { success: true, data };
    } catch (err) {
      console.error('Error updating dispute:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteDispute = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const { error } = await supabase
        .from('disputes')
        .delete()
        .eq('id', id)
        .eq('seller_id', user.id); // Security check
      
      if (error) {
        throw error;
      }
      
      setDisputes(prevDisputes => 
        prevDisputes.filter(dispute => dispute.id !== id)
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting dispute:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const getDisputesBySale = async (saleId) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('sale_id', saleId)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching disputes by sale:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const getDisputesByCustomer = async (customerId) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          sale:sales(
            *,
            product:products(*),
            membership:memberships(*),
            customer:customers(*)
          )
        `)
        .eq('customer_id', customerId)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching disputes by customer:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const getDisputeStats = () => {
    const totalDisputes = disputes.length;
    const openDisputes = disputes.filter(d => d.status === 'open').length;
    const inProgressDisputes = disputes.filter(d => d.status === 'in_progress').length;
    const resolvedDisputes = disputes.filter(d => d.status === 'resolved').length;
    
    // Calculate average resolution time for resolved disputes
    const resolvedDisputesWithDates = disputes.filter(d => 
      d.status === 'resolved' && d.created_at && d.resolved_at
    );
    
    let avgResolutionTime = 0;
    if (resolvedDisputesWithDates.length > 0) {
      const totalTime = resolvedDisputesWithDates.reduce((sum, d) => {
        const created = new Date(d.created_at);
        const resolved = new Date(d.resolved_at);
        return sum + (resolved - created);
      }, 0);
      
      // Average time in hours
      avgResolutionTime = totalTime / resolvedDisputesWithDates.length / (1000 * 60 * 60);
    }
    
    return {
      totalDisputes,
      openDisputes,
      inProgressDisputes,
      resolvedDisputes,
      avgResolutionTime
    };
  };

  return {
    disputes,
    loading,
    error,
    addDispute,
    updateDispute,
    deleteDispute,
    getDisputesBySale,
    getDisputesByCustomer,
    getDisputeStats
  };
}
