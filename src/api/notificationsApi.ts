import { supabase } from '../supabaseClient';

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'invitation' | 'system' | 'friend_request';
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface CreateNotificationData {
  user_id: string;
  type: Notification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
  expires_at?: string;
}

class NotificationsApi {
  /**
   * Fetch notifications for the current user
   */
  async fetchNotifications(limit: number = 50, offset: number = 0): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }

    return count || 0;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('read', true);

    if (error) {
      console.error('Error deleting read notifications:', error);
      throw error;
    }
  }

  /**
   * Create a new notification (typically called by system/server)
   */
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    return notification;
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .not('expires_at', 'is', null)
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }
}

export const notificationsApi = new NotificationsApi();
