import { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '../UserContext';
import { useToast } from './useToast';

export const useRealtimeNotifications = () => {
  const queryClient = useQueryClient();
  const { userId } = useUser();
  const { addToast } = useToast();

  useEffect(() => {
    if (!userId) {
      console.log('Realtime notifications: No user ID available');
      return;
    }

    console.log('Setting up realtime notifications for user:', userId);

    // Subscribe to notifications table changes
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Realtime notification received:', payload);

          // Invalidate and refetch notifications
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

          // Handle different event types
          if (payload.eventType === 'INSERT') {
            const notification = payload.new as any;
            console.log('New notification inserted:', notification);

            // Show toast notification for new notifications
            if (notification.type === 'message') {
              addToast(`New message from ${notification.data?.senderName || 'someone'}`, 'info', 4000);
            } else if (notification.type === 'follow') {
              addToast(notification.message || 'Someone started following you', 'info', 4000);
            } else if (notification.type === 'like') {
              addToast(notification.message || 'Someone liked your post', 'info', 4000);
            } else if (notification.type === 'comment') {
              addToast(notification.message || 'Someone commented on your post', 'info', 4000);
            } else {
              addToast(notification.title || 'New notification', 'info', 4000);
            }
          } else if (payload.eventType === 'UPDATE') {
            console.log('Notification updated:', payload.new);
          } else if (payload.eventType === 'DELETE') {
            console.log('Notification deleted:', payload.old);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to notifications');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error');
          addToast('Connection issue - notifications may be delayed', 'warning', 3000);
        } else if (status === 'TIMED_OUT') {
          console.warn('Realtime subscription timed out');
          addToast('Connection lost - attempting to reconnect...', 'warning', 3000);
        } else if (status === 'CLOSED') {
          console.log('Realtime subscription closed');
        }
      });

    // Cleanup subscription on unmount or user change
    return () => {
      console.log('Cleaning up realtime notifications subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, addToast]);
};
