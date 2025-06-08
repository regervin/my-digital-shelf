import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useRefunds() {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setRefunds([]);
      setLoading(false);
      return;
    }

    async function fetchRefunds() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('refunds')
          .select(`
            *,
            sale:sales(
              *,
              product:products(*),
              membership:memberships(*),
              customer:customers(*)
            )
          `)
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setRefunds(data || []);
      } catch (err) {
        console.error('Error fetching refunds:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRefunds();
  }, [user]);

  const addRefund = async (refundData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const newRefund = {
        ...refundData,
        seller_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('refunds')
        .insert([newRefund])
        .select(`
          *,
          sale:sales(
            *,
            product:products(*),
            membership:memberships(*),
            customer:customers(*)
          )
        `)
        .single();
      
      if (error) {
        throw error;
      }
      
      // If the refund is approved, update the sale status to refunded
      if (data.status === 'approved') {
        const { error: saleError } = await supabase
          .from('sales')
          .update({ status: 'refunded', updated_at: new Date().toISOString() })
          .eq('id', data.sale_id)
          .eq('seller_id', user.id);
        
        if (saleError) {
          throw saleError;
        }
      }
      
      setRefunds(prevRefunds => [data, ...prevRefunds]);
      return { success: true, data };
    } catch (err) {
      console.error('Error adding refund:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateRefund = async (id, updates) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('refunds')
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
          )
        `)
        .single();
      
      if (error) {
        throw error;
      }
      
      // If the refund status is changed to approved, update the sale status to refunded
      if (updates.status === 'approved') {
        const { error: saleError } = await supabase
          .from('sales')
          .update({ status: 'refunded', updated_at: new Date().toISOString() })
          .eq('id', data.sale_id)
          .eq('seller_id', user.id);
        
        if (saleError) {
          throw saleError;
        }
      }
      
      setRefunds(prevRefunds => 
        prevRefunds.map(refund => 
          refund.id === id ? data : refund
        )
      );
      
      return { success: true, data };
    } catch (err) {
      console.error('Error updating refund:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteRefund = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const { error } = await supabase
        .from('refunds')
        .delete()
        .eq('id', id)
        .eq('seller_id', user.id); // Security check
      
      if (error) {
        throw error;
      }
      
      setRefunds(prevRefunds => 
        prevRefunds.filter(refund => refund.id !== id)
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting refund:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const getRefundsBySale = async (saleId) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('refunds')
        .select('*')
        .eq('sale_id', saleId)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching refunds by sale:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const getRefundsByCustomer = async (customerId) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('refunds')
        .select(`
          *,
          sale:sales(
            *,
            product:products(*),
            membership:memberships(*),
            customer:customers(*)
          )
        `)
        .eq('sale.customer_id', customerId)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching refunds by customer:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const getRefundStats = () => {
    const totalRefunds = refunds.length;
    const pendingRefunds = refunds.filter(r => r.status === 'pending').length;
    const approvedRefunds = refunds.filter(r => r.status === 'approved').length;
    const rejectedRefunds = refunds.filter(r => r.status === 'rejected').length;
    
    const totalAmount = refunds
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    return {
      totalRefunds,
      pendingRefunds,
      approvedRefunds,
      rejectedRefunds,
      totalAmount
    };
  };

  return {
    refunds,
    loading,
    error,
    addRefund,
    updateRefund,
    deleteRefund,
    getRefundsBySale,
    getRefundsByCustomer,
    getRefundStats
  };
}
