import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, Notification } from '../api/notificationsApi';
import StaleTime from '../constants/staletime';

export const useNotifications = () => {
  const qc = useQueryClient();

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.fetchNotifications(),
    staleTime: StaleTime.OneMinute,
  });

  // Fetch unread count
  const {
    data: unreadCount = 0,
    refetch: refetchUnreadCount,
  } = useQuery<number>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.fetchUnreadCount(),
    staleTime: StaleTime.OneMinute,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: (_, notificationId) => {
      // Update the notification in the cache
      qc.setQueryData<Notification[]>(['notifications'], prev =>
        prev?.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        ) ?? []
      );
      // Refetch unread count
      refetchUnreadCount();
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      // Update all notifications in the cache
      qc.setQueryData<Notification[]>(['notifications'], prev =>
        prev?.map(notification => ({ ...notification, read: true })) ?? []
      );
      // Refetch unread count
      refetchUnreadCount();
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: (_, notificationId) => {
      // Remove the notification from the cache
      qc.setQueryData<Notification[]>(['notifications'], prev =>
        prev?.filter(notification => notification.id !== notificationId) ?? []
      );
      // Refetch unread count
      refetchUnreadCount();
    },
  });

  // Delete read notifications mutation
  const deleteReadNotificationsMutation = useMutation({
    mutationFn: notificationsApi.deleteReadNotifications,
    onSuccess: () => {
      // Remove read notifications from the cache
      qc.setQueryData<Notification[]>(['notifications'], prev =>
        prev?.filter(notification => !notification.read) ?? []
      );
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    refetch,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    deleteReadNotifications: deleteReadNotificationsMutation.mutateAsync,
  };
};
