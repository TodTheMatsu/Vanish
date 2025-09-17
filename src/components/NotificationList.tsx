import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '../api/notificationsApi';
import { NotificationItem } from './NotificationItem';
import { IoNotificationsOff } from 'react-icons/io5';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  deletingIds?: string[];
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onDelete,
  isLoading,
  deletingIds = []
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-3 p-4">
              <div className="w-10 h-10 bg-neutral-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-700 rounded w-1/2"></div>
                <div className="h-3 bg-neutral-700 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <IoNotificationsOff size={48} className="text-neutral-600 mb-4" />
        <h3 className="text-lg font-medium text-neutral-400 mb-2">No notifications yet</h3>
        <p className="text-sm text-neutral-500">
          When you receive notifications, they'll appear here.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="divide-y divide-neutral-800">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
            isDeleting={deletingIds.includes(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
