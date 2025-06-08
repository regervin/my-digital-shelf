import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useCoupons() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setCoupons([]);
      setLoading(false);
      return;
    }

    async function fetchCoupons() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setCoupons(data || []);
      } catch (err) {
        console.error('Error fetching coupons:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCoupons();
  }, [user]);

  // Helper function to generate a random coupon code
  const generateCouponCode = (length = 8) => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Helper function to add products to a coupon
  const addCouponProducts = async (couponId, productIds) => {
    const couponProducts = productIds.map(productId => ({
      coupon_id: couponId,
      product_id: productId
    }));
    
    const { error } = await supabase
      .from('coupon_products')
      .insert(couponProducts);
    
    if (error) throw error;
  };

  // Helper function to add memberships to a coupon
  const addCouponMemberships = async (couponId, membershipIds) => {
    const couponMemberships = membershipIds.map(membershipId => ({
      coupon_id: couponId,
      membership_id: membershipId
    }));
    
    const { error } = await supabase
      .from('coupon_memberships')
      .insert(couponMemberships);
    
    if (error) throw error;
  };

  const addCoupon = async (couponData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      // Generate a random code if not provided
      if (!couponData.code) {
        couponData.code = generateCouponCode();
      }
      
      const newCoupon = {
        ...couponData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Remove non-table fields
      const { productIds, membershipIds, ...couponToInsert } = newCoupon;
      
      const { data, error } = await supabase
        .from('coupons')
        .insert([couponToInsert])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // If specific products or memberships are specified, add them to junction tables
      if (productIds && productIds.length > 0) {
        await addCouponProducts(data.id, productIds);
      }
      
      if (membershipIds && membershipIds.length > 0) {
        await addCouponMemberships(data.id, membershipIds);
      }
      
      setCoupons(prevCoupons => [data, ...prevCoupons]);
      return { success: true, data };
    } catch (err) {
      console.error('Error adding coupon:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateCoupon = async (id, updates) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // Remove non-table fields
      const { productIds, membershipIds, ...couponData } = updatedData;
      
      const { data, error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', id)
        .eq('user_id', user.id) // Security check
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update product associations if provided
      if (productIds !== undefined) {
        // First delete existing associations
        await supabase
          .from('coupon_products')
          .delete()
          .eq('coupon_id', id);
          
        // Then add new ones if any
        if (productIds && productIds.length > 0) {
          await addCouponProducts(id, productIds);
        }
      }
      
      // Update membership associations if provided
      if (membershipIds !== undefined) {
        // First delete existing associations
        await supabase
          .from('coupon_memberships')
          .delete()
          .eq('coupon_id', id);
          
        // Then add new ones if any
        if (membershipIds && membershipIds.length > 0) {
          await addCouponMemberships(id, membershipIds);
        }
      }
      
      setCoupons(prevCoupons => 
        prevCoupons.map(coupon => 
          coupon.id === id ? data : coupon
        )
      );
      
      return { success: true, data };
    } catch (err) {
      console.error('Error updating coupon:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Security check
      
      if (error) {
        throw error;
      }
      
      setCoupons(prevCoupons => 
        prevCoupons.filter(coupon => coupon.id !== id)
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const getCouponDetails = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Get the coupon
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (couponError) {
        throw couponError;
      }
      
      // Get associated products
      const { data: couponProducts, error: productsError } = await supabase
        .from('coupon_products')
        .select('product_id')
        .eq('coupon_id', id);
      
      if (productsError) {
        throw productsError;
      }
      
      // Get associated memberships
      const { data: couponMemberships, error: membershipsError } = await supabase
        .from('coupon_memberships')
        .select('membership_id')
        .eq('coupon_id', id);
      
      if (membershipsError) {
        throw membershipsError;
      }
      
      // Get redemption history
      const { data: redemptions, error: redemptionsError } = await supabase
        .from('coupon_redemptions')
        .select(`
          *,
          customer:customers(id, name, email)
        `)
        .eq('coupon_id', id)
        .order('created_at', { ascending: false });
      
      if (redemptionsError) {
        throw redemptionsError;
      }
      
      return { 
        success: true, 
        data: {
          ...coupon,
          productIds: couponProducts.map(cp => cp.product_id),
          membershipIds: couponMemberships.map(cm => cm.membership_id),
          redemptions: redemptions || []
        }
      };
    } catch (err) {
      console.error('Error getting coupon details:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const validateCoupon = async (code, options = {}) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { productId, membershipId, amount } = options;
      
      // Get the coupon by code
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      if (couponError) {
        return { 
          success: false, 
          error: { message: 'Invalid coupon code' },
          valid: false
        };
      }
      
      // Check if coupon is expired
      const now = new Date();
      if (coupon.start_date && new Date(coupon.start_date) > now) {
        return { 
          success: false, 
          error: { message: 'Coupon is not yet active' },
          valid: false,
          coupon
        };
      }
      
      if (coupon.end_date && new Date(coupon.end_date) < now) {
        return { 
          success: false, 
          error: { message: 'Coupon has expired' },
          valid: false,
          coupon
        };
      }
      
      // Check usage limit
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        return { 
          success: false, 
          error: { message: 'Coupon usage limit has been reached' },
          valid: false,
          coupon
        };
      }
      
      // Check minimum purchase amount
      if (coupon.min_purchase_amount && amount && amount < coupon.min_purchase_amount) {
        return { 
          success: false, 
          error: { message: `Minimum purchase amount of $${coupon.min_purchase_amount} required` },
          valid: false,
          coupon
        };
      }
      
      // Check if coupon applies to specific products or memberships
      if (coupon.applies_to === 'products' && productId) {
        const { data: couponProducts, error: productsError } = await supabase
          .from('coupon_products')
          .select('product_id')
          .eq('coupon_id', coupon.id)
          .eq('product_id', productId);
        
        if (productsError || couponProducts.length === 0) {
          return { 
            success: false, 
            error: { message: 'Coupon does not apply to this product' },
            valid: false,
            coupon
          };
        }
      } else if (coupon.applies_to === 'memberships' && membershipId) {
        const { data: couponMemberships, error: membershipsError } = await supabase
          .from('coupon_memberships')
          .select('membership_id')
          .eq('coupon_id', coupon.id)
          .eq('membership_id', membershipId);
        
        if (membershipsError || couponMemberships.length === 0) {
          return { 
            success: false, 
            error: { message: 'Coupon does not apply to this membership' },
            valid: false,
            coupon
          };
        }
      }
      
      // Calculate discount amount
      let discountAmount = 0;
      if (amount) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = (amount * coupon.discount_value) / 100;
          
          // Apply max discount if specified
          if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
            discountAmount = coupon.max_discount_amount;
          }
        } else { // fixed_amount
          discountAmount = coupon.discount_value;
          
          // Don't allow discount greater than the amount
          if (discountAmount > amount) {
            discountAmount = amount;
          }
        }
      }
      
      return { 
        success: true, 
        valid: true,
        coupon,
        discountAmount: discountAmount || null
      };
    } catch (err) {
      console.error('Error validating coupon:', err);
      setError(err);
      return { success: false, error: err, valid: false };
    }
  };

  const redeemCoupon = async (code, customerId, options = {}) => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!customerId) throw new Error('Customer ID is required');
      
      const { productId, membershipId, amount, orderId } = options;
      
      // First validate the coupon
      const validation = await validateCoupon(code, { productId, membershipId, amount });
      
      if (!validation.valid) {
        return validation; // Return the validation result with error
      }
      
      const { coupon, discountAmount } = validation;
      
      // Record the redemption
      const redemption = {
        coupon_id: coupon.id,
        customer_id: customerId,
        discount_amount: discountAmount || 0,
        order_id: orderId || null,
        created_at: new Date().toISOString()
      };
      
      const { data: redemptionData, error: redemptionError } = await supabase
        .from('coupon_redemptions')
        .insert([redemption])
        .select()
        .single();
      
      if (redemptionError) {
        throw redemptionError;
      }
      
      // Increment the usage count
      const { error: updateError } = await supabase
        .from('coupons')
        .update({ 
          usage_count: coupon.usage_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', coupon.id)
        .eq('user_id', user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setCoupons(prevCoupons => 
        prevCoupons.map(c => 
          c.id === coupon.id 
            ? { ...c, usage_count: c.usage_count + 1 } 
            : c
        )
      );
      
      return { 
        success: true, 
        coupon,
        redemption: redemptionData,
        discountAmount
      };
    } catch (err) {
      console.error('Error redeeming coupon:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const getCouponRedemptions = async (couponId) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('coupon_redemptions')
        .select(`
          *,
          customer:customers(id, name, email)
        `)
        .eq('coupon_id', couponId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Error getting coupon redemptions:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const getCustomerRedemptions = async (customerId) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('coupon_redemptions')
        .select(`
          *,
          coupon:coupons(*)
        `)
        .eq('customer_id', customerId)
        .eq('coupon:coupons.user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Error getting customer redemptions:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  return {
    coupons,
    loading,
    error,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    getCouponDetails,
    validateCoupon,
    redeemCoupon,
    getCouponRedemptions,
    getCustomerRedemptions,
    generateCouponCode
  };
}
