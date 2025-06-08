import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useCommunications() {
  const { user } = useAuth();
  const [communications, setCommunications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setCommunications([]);
      setTemplates([]);
      setLoading(false);
      return;
    }

    async function fetchCommunications() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('communications')
          .select(`
            *,
            customer:customers(id, name, email)
          `)
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setCommunications(data || []);
      } catch (err) {
        console.error('Error fetching communications:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchTemplates() {
      try {
        const { data, error } = await supabase
          .from('communication_templates')
          .select('*')
          .or(`seller_id.eq.${user.id},is_global.eq.true`)
          .order('name', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setTemplates(data || []);
      } catch (err) {
        console.error('Error fetching communication templates:', err);
        setError(err);
      }
    }

    fetchCommunications();
    fetchTemplates();
  }, [user]);

  const getCustomerCommunications = async (customerId) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .eq('customer_id', customerId)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Error fetching customer communications:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const sendCommunication = async (communicationData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const newCommunication = {
        ...communicationData,
        sender_id: user.id,
        status: 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('communications')
        .insert([newCommunication])
        .select(`
          *,
          customer:customers(id, name, email)
        `)
        .single();
      
      if (error) {
        throw error;
      }
      
      setCommunications(prevCommunications => [data, ...prevCommunications]);
      return { success: true, data };
    } catch (err) {
      console.error('Error sending communication:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateCommunicationStatus = async (id, status) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const { data, error } = await supabase
        .from('communications')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('sender_id', user.id) // Security check
        .select(`
          *,
          customer:customers(id, name, email)
        `)
        .single();
      
      if (error) {
        throw error;
      }
      
      setCommunications(prevCommunications => 
        prevCommunications.map(communication => 
          communication.id === id ? data : communication
        )
      );
      
      return { success: true, data };
    } catch (err) {
      console.error('Error updating communication status:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteCommunication = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const { error } = await supabase
        .from('communications')
        .delete()
        .eq('id', id)
        .eq('sender_id', user.id); // Security check
      
      if (error) {
        throw error;
      }
      
      setCommunications(prevCommunications => 
        prevCommunications.filter(communication => communication.id !== id)
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting communication:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Template management functions
  const createTemplate = async (templateData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const newTemplate = {
        ...templateData,
        seller_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('communication_templates')
        .insert([newTemplate])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setTemplates(prevTemplates => [...prevTemplates, data]);
      return { success: true, data };
    } catch (err) {
      console.error('Error creating template:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id, updates) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('communication_templates')
        .update(updatedData)
        .eq('id', id)
        .eq('seller_id', user.id) // Security check
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setTemplates(prevTemplates => 
        prevTemplates.map(template => 
          template.id === id ? data : template
        )
      );
      
      return { success: true, data };
    } catch (err) {
      console.error('Error updating template:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      const { error } = await supabase
        .from('communication_templates')
        .delete()
        .eq('id', id)
        .eq('seller_id', user.id); // Security check
      
      if (error) {
        throw error;
      }
      
      setTemplates(prevTemplates => 
        prevTemplates.filter(template => template.id !== id)
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting template:', err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const sendTemplatedCommunication = async (customerId, templateId, replacements = {}) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Find the template
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }
      
      // Process template content with replacements
      let subject = template.subject || '';
      let content = template.content;
      
      // Replace placeholders with actual values
      Object.entries(replacements).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        content = content.replace(regex, value);
      });
      
      // Send the communication
      return await sendCommunication({
        customer_id: customerId,
        subject,
        message: content,
        type: template.type,
        metadata: { template_id: templateId }
      });
    } catch (err) {
      console.error('Error sending templated communication:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  return {
    communications,
    templates,
    loading,
    error,
    getCustomerCommunications,
    sendCommunication,
    updateCommunicationStatus,
    deleteCommunication,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    sendTemplatedCommunication
  };
}
