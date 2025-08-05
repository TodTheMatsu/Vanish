import { useState } from 'react';
import { IoClose, IoRefresh, IoCheckmarkDone, IoTrash, IoFilter } from 'react-icons/io5';
import { FiRefreshCcw } from 'react-icons/fi';
import { AnimatePresence, motion } from 'motion/react';
import { useNotifications, useMarkAllAsRead, useDeleteAllRead, useRefreshNotifications } from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '../api/notificationsApi';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

type FilterType = 'all' | 'unread' | 'message' | 'invitation' | 'system' | 'friend_request';

export function NotificationCenter({ isOpen, onClose, onNotificationClick }: NotificationCenterProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const { data: notifications = [], isLoading, error, refetch } = useNotifications();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteAllReadMutation = useDeleteAllRead();
  const { refresh } = useRefreshNotifications();

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'message':
      case 'invitation':
      case 'system':
      case 'friend_request':
        return notification.type === filter;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  const handleRefresh = () => {
    refetch();
    refresh();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-lg border-l border-white/10 z-50 flex flex-col"
            style={{background: 'rgba(18, 18, 27, 0.95)'}}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <IoClose className="text-xl text-neutral-300" />
                </button>
              </div>

              {/* Actions Row */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                >
                  <FiRefreshCcw className={`text-sm ${isLoading ? 'animate-spin' : ''}`} />
                  {!isLoading ? 'Refresh' : 'Loading...'}
                </button>

                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors text-sm text-green-200"
                  >
                    <IoCheckmarkDone className="text-sm" />
                    Mark All Read
                  </button>
                )}

                {readCount > 0 && (
                  <button
                    onClick={() => deleteAllReadMutation.mutate()}
                    disabled={deleteAllReadMutation.isPending}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors text-sm text-red-200"
                  >
                    <IoTrash className="text-sm" />
                    Clear Read
                  </button>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-2">
                <IoFilter className="text-neutral-400 text-sm" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                >
                  <option value="all" className="bg-gray-800 text-white">All ({notifications.length})</option>
                  <option value="unread" className="bg-gray-800 text-white">Unread ({unreadCount})</option>
                  <option value="message" className="bg-gray-800 text-white">Messages ({notifications.filter(n => n.type === 'message').length})</option>
                  <option value="invitation" className="bg-gray-800 text-white">Invitations ({notifications.filter(n => n.type === 'invitation').length})</option>
                  <option value="system" className="bg-gray-800 text-white">System ({notifications.filter(n => n.type === 'system').length})</option>
                  <option value="friend_request" className="bg-gray-800 text-white">Friends ({notifications.filter(n => n.type === 'friend_request').length})</option>
                </select>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {error && (
                <div className="p-4 bg-red-600/20 border border-red-500/50 rounded-lg m-4">
                  <p className="text-red-200 text-sm">
                    Failed to load notifications. Please try refreshing.
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!isLoading && !error && filteredNotifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="text-6xl mb-4">🔕</div>
                  <h3 className="text-lg font-semibold text-neutral-300 mb-2">
                    {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {filter === 'all' 
                      ? "You'll see your notifications here when you receive them."
                      : `You have no ${filter} notifications at the moment.`
                    }
                  </p>
                </div>
              )}

              {!isLoading && !error && filteredNotifications.length > 0 && (
                <div className="space-y-3 p-4">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onNotificationClick={onNotificationClick}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!isLoading && !error && filteredNotifications.length > 0 && (
              <div className="p-4 border-t border-white/10 bg-white/5">
                <p className="text-xs text-neutral-500 text-center">
                  Showing {filteredNotifications.length} of {notifications.length} notifications
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
