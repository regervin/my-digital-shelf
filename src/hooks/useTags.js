import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { slugify } from '../utils/formatters';

export function useTags() {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setTags([]);
      setLoading(false);
      return;
    }

    async function fetchTags() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('product_tags')
          .select('*')
          .eq('user_id', user.id)
          .order('name');
        
        if (error) {
          throw error;
        }
        
        setTags(data || []);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTags();
  }, [user]);

  const addTag = async (tagData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const slug = tagData.slug || slugify(tagData.name);
      
      const newTag = {
        ...tagData,
        slug,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('product_tags')
        .insert([newTag])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setTags(prevTags => [...prevTags, data].sort((a, b) => a.name.localeCompare(b.name)));
      return { success: true, data };
    } catch (err) {
      console.error('Error adding tag:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateTag = async (id, updates) => {
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
        .from('product_tags')
        .update(updatedData)
        .eq('id', id)
        .eq('user_id', user.id) // Security check
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setTags(prevTags => 
        prevTags.map(tag => 
          tag.id === id ? data : tag
        ).sort((a, b) => a.name.localeCompare(b.name))
      );
      
      return { success: true, data };
    } catch (err) {
      console.error('Error updating tag:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const { error } = await supabase
        .from('product_tags')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Security check
      
      if (error) {
        throw error;
      }
      
      setTags(prevTags => 
        prevTags.filter(tag => tag.id !== id)
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const assignTagToProduct = async (productId, tagId) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('product_tag_mappings')
        .insert([{
          product_id: productId,
          tag_id: tagId
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Error assigning tag to product:', err);
      return { success: false, error: err };
    }
  };

  const removeTagFromProduct = async (productId, tagId) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('product_tag_mappings')
        .delete()
        .match({
          product_id: productId,
          tag_id: tagId
        });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error removing tag from product:', err);
      return { success: false, error: err };
    }
  };

  const getProductTags = async (productId) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('product_tag_mappings')
        .select(`
          tag_id,
          product_tags:tag_id (
            id,
            name,
            slug
          )
        `)
        .eq('product_id', productId);
      
      if (error) {
        throw error;
      }
      
      // Extract the tag objects from the nested structure
      const productTags = data.map(item => item.product_tags);
      
      return { success: true, data: productTags };
    } catch (err) {
      console.error('Error fetching product tags:', err);
      return { success: false, error: err, data: [] };
    }
  };

  return {
    tags,
    loading,
    error,
    addTag,
    updateTag,
    deleteTag,
    assignTagToProduct,
    removeTagFromProduct,
    getProductTags
  };
}
