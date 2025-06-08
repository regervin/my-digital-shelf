import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { slugify } from '../utils/formatters';

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    async function fetchCategories() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('product_categories')
          .select('*')
          .eq('user_id', user.id)
          .order('name');
        
        if (error) {
          throw error;
        }
        
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [user]);

  const addCategory = async (categoryData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const slug = categoryData.slug || slugify(categoryData.name);
      
      const newCategory = {
        ...categoryData,
        slug,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('product_categories')
        .insert([newCategory])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setCategories(prevCategories => [...prevCategories, data].sort((a, b) => a.name.localeCompare(b.name)));
      return { success: true, data };
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, updates) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      // If name is updated and slug isn't provided, update the slug
      if (updates.name && !updates.slug) {
        updates.slug = slugify(updates.name);
      }
      
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('product_categories')
        .update(updatedData)
        .eq('id', id)
        .eq('user_id', user.id) // Security check
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category.id === id ? data : category
        ).sort((a, b) => a.name.localeCompare(b.name))
      );
      
      return { success: true, data };
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Security check
      
      if (error) {
        throw error;
      }
      
      setCategories(prevCategories => 
        prevCategories.filter(category => category.id !== id)
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTree = () => {
    // Create a map of id to category with children array
    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category.id] = { ...category, children: [] };
    });
    
    // Build the tree structure
    const rootCategories = [];
    categories.forEach(category => {
      if (category.parent_id) {
        if (categoryMap[category.parent_id]) {
          categoryMap[category.parent_id].children.push(categoryMap[category.id]);
        } else {
          // If parent doesn't exist, treat as root
          rootCategories.push(categoryMap[category.id]);
        }
      } else {
        rootCategories.push(categoryMap[category.id]);
      }
    });
    
    return rootCategories;
  };

  const assignProductToCategory = async (productId, categoryId) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('product_category_mappings')
        .insert([{
          product_id: productId,
          category_id: categoryId
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Error assigning product to category:', err);
      return { success: false, error: err };
    }
  };

  const removeProductFromCategory = async (productId, categoryId) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('product_category_mappings')
        .delete()
        .match({
          product_id: productId,
          category_id: categoryId
        });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error removing product from category:', err);
      return { success: false, error: err };
    }
  };

  const getProductCategories = async (productId) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('product_category_mappings')
        .select(`
          category_id,
          product_categories:category_id (
            id,
            name,
            slug,
            parent_id
          )
        `)
        .eq('product_id', productId);
      
      if (error) {
        throw error;
      }
      
      // Extract the category objects from the nested structure
      const productCategories = data.map(item => item.product_categories);
      
      return { success: true, data: productCategories };
    } catch (err) {
      console.error('Error fetching product categories:', err);
      return { success: false, error: err, data: [] };
    }
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryTree,
    assignProductToCategory,
    removeProductFromCategory,
    getProductCategories
  };
}
