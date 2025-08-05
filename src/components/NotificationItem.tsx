import { IoTrash, IoCheckmark, IoEllipse } from 'react-icons/io5';
import type { Notification } from '../api/notificationsApi';
import { useMarkAsRead, useDeleteNotification } from '../hooks/useNotifications';
import { formatTimeAgo } from '../utils/dateUtils';

interface NotificationItemProps {
  notification: Notification;
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationItem({ notification, onNotificationClick }: NotificationItemProps) {
  const markAsReadMutation = useMarkAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(notification.id);
  };

  const handleClick = () => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    // Auto-mark as read when clicked
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'message':
        return '💬';
      case 'invitation':
        return '📩';
      case 'friend_request':
        return '👤';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'message':
        return 'border-blue-300/60';
      case 'invitation':
        return 'border-green-300/60';
      case 'friend_request':
        return 'border-purple-300/60';
      case 'system':
        return 'border-yellow-300/60';
      default:
        return 'border-neutral-500/60';
    }
  };

  return (
    <div 
      className={`
        p-4 rounded-xl border-l-4 cursor-pointer transition-all duration-200
        ${notification.read 
          ? 'bg-white/5 text-neutral-300' 
          : 'bg-white/10 text-white shadow-lg'
        }
        ${getTypeColor()}
        hover:bg-white/15 hover:scale-[1.02]
      `}
      onClick={handleClick}
      style={{background: notification.read ? 'rgba(30,30,40,0.3)' : 'rgba(30,30,40,0.7)'}}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getTypeIcon()}</span>
            <h3 className={`font-semibold truncate ${notification.read ? 'text-neutral-300' : 'text-white'}`}>
              {notification.title}
            </h3>
            {!notification.read && (
              <IoEllipse className="text-blue-400 text-xs flex-shrink-0" />
            )}
          </div>
          
          <p className={`text-sm line-clamp-2 mb-2 ${notification.read ? 'text-neutral-400' : 'text-neutral-200'}`}>
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              {formatTimeAgo(new Date(notification.created_at))}
            </span>
            
            {notification.data?.conversationId && (
              <span className="text-xs text-neutral-500 bg-white/10 px-2 py-1 rounded">
                Conversation
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          {!notification.read && (
            <button
              onClick={handleMarkAsRead}
              className="p-1 rounded hover:bg-white/20 transition-colors"
              title="Mark as read"
              disabled={markAsReadMutation.isPending}
            >
              <IoCheckmark className="text-green-400 text-sm" />
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            title="Delete notification"
            disabled={deleteNotificationMutation.isPending}
          >
            <IoTrash className="text-red-400 text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
