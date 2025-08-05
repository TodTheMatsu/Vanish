import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';
import StaleTime from '../constants/staletime';

/**
 * Hook to fetch notifications with manual refresh
 */
export const useNotifications = (limit: number = 50) => {
  return useQuery({
    queryKey: ['notifications', limit],
    queryFn: () => notificationsApi.fetchNotifications(limit),
    staleTime: StaleTime.OneMinute, // Cache for 1 minute
    refetchOnWindowFocus: false,
    refetchInterval: false // No automatic refetching
  });
};

/**
 * Hook to get unread notification count
 */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: StaleTime.ThirtySeconds,
    refetchOnWindowFocus: false,
    refetchInterval: false
  });
};

/**
 * Hook to mark notification as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
    }
  });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to mark all notifications as read:', error);
    }
  });
};

/**
 * Hook to delete a notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to delete notification:', error);
    }
  });
};

/**
 * Hook to delete all read notifications
 */
export const useDeleteAllRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.deleteAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Failed to delete read notifications:', error);
    }
  });
};

/**
 * Hook to manually refresh notifications
 */
export const useRefreshNotifications = () => {
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return { refresh };
};
