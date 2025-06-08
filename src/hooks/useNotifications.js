import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setNotifications(data || []);
        setUnreadCount(data.filter(notification => !notification.read).length);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up real-time subscription for new notifications
    const subscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prevNotifications => [payload.new, ...prevNotifications]);
        setUnreadCount(prevCount => prevCount + 1);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === payload.new.id ? payload.new : notification
          )
        );
        
        // Update unread count
        const updatedNotifications = notifications.map(notification => 
          notification.id === payload.new.id ? payload.new : notification
        );
        setUnreadCount(updatedNotifications.filter(notification => !notification.read).length);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prevNotifications => 
          prevNotifications.filter(notification => notification.id !== payload.old.id)
        );
        
        // Update unread count if needed
        if (!payload.old.read) {
          setUnreadCount(prevCount => prevCount - 1);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const markAsRead = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id) // Security check
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      
      setUnreadCount(prevCount => prevCount - 1);
      
      return { success: true, data };
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
        .select();
      
      if (error) {
        throw error;
      }
      
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
      
      return { success: true, data };
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const deleteNotification = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const notificationToDelete = notifications.find(n => n.id === id);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Security check
      
      if (error) {
        throw error;
      }
      
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
      
      // Update unread count if needed
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prevCount => prevCount - 1);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const deleteAllNotifications = async () => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      setNotifications([]);
      setUnreadCount(0);
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  const createNotification = async (notificationData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.rpc(
        'create_notification',
        {
          p_user_id: notificationData.user_id || user.id,
          p_title: notificationData.title,
          p_message: notificationData.message,
          p_type: notificationData.type || 'info',
          p_action_url: notificationData.action_url,
          p_entity_type: notificationData.entity_type,
          p_entity_id: notificationData.entity_id
        }
      );
      
      if (error) {
        throw error;
      }
      
      return { success: true, notification_id: data };
    } catch (err) {
      console.error('Error creating notification:', err);
      setError(err);
      return { success: false, error: err };
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    createNotification
  };
}
