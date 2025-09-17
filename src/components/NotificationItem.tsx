import { motion } from 'framer-motion';
import { Notification } from '../api/notificationsApi';
import { useState } from 'react';
import { IoClose, IoCheckmarkCircle } from 'react-icons/io5';
import { Link } from 'react-router-dom';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete, isDeleting }: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'follow':
        return '👤';
      case 'like':
        return '❤️';
      case 'comment':
        return '💭';
      case 'mention':
        return '@';
      case 'system':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  const getNotificationLink = () => {
    switch (notification.type) {
      case 'message':
        return notification.data?.conversationId ? `/messages/${notification.data.conversationId}` : '/messages';
      case 'follow':
        return notification.data?.followerUsername ? `/profile/${notification.data.followerUsername}` : null;
      case 'like':
      case 'comment':
        return notification.data?.postId ? `/home#post-${notification.data.postId}` : '/home';
      default:
        return null;
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(notification.id);
  };

  const NotificationContent = () => (
    <div className="flex items-start space-x-3 p-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center text-lg">
          {getNotificationIcon(notification.type)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className={`text-sm font-medium ${notification.read ? 'text-neutral-400' : 'text-white'}`}>
              {notification.title}
            </h4>
            {notification.message && (
              <p className={`text-sm mt-1 ${notification.read ? 'text-neutral-500' : 'text-neutral-300'}`}>
                {notification.message}
              </p>
            )}
            <p className="text-xs text-neutral-500 mt-2">
              {formatTimeAgo(notification.created_at)}
            </p>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {!notification.read && (
              <button
                onClick={handleMarkAsRead}
                className="p-1 text-neutral-400 hover:text-green-400 transition-colors"
                title="Mark as read"
              >
                <IoCheckmarkCircle size={16} />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-50"
              title="Delete notification"
            >
              <IoClose size={16} />
            </button>
          </div>
        </div>
      </div>

      {!notification.read && (
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </div>
  );

  const link = getNotificationLink();

  if (link) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`border-b border-neutral-800 transition-colors ${
          isHovered ? 'bg-neutral-800/50' : 'bg-transparent'
        } ${!notification.read ? 'bg-neutral-900/30' : ''}`}
      >
        <Link to={link} className="block">
          <NotificationContent />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`border-b border-neutral-800 transition-colors cursor-default ${
        isHovered ? 'bg-neutral-800/50' : 'bg-transparent'
      } ${!notification.read ? 'bg-neutral-900/30' : ''}`}
    >
      <NotificationContent />
    </motion.div>
  );
}
