import { supabase } from '../supabaseClient';

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'follow' | 'like' | 'comment' | 'mention' | 'system';
  title: string;
  message?: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}

export const notificationsApi = {
  // Fetch notifications for the current user
  async fetchNotifications(limit = 50, offset = 0): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data ?? [];
  },

  // Fetch unread notifications count
  async fetchUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    if (error) throw error;
    return count ?? 0;
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) throw error;
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Delete all read notifications
  async deleteReadNotifications(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('read', true);

    if (error) throw error;
  },

  // Create a notification (for internal use or admin)
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
